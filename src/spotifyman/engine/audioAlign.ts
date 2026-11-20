import {
  buildLineWordTimings,
  sungLength,
  wordPhoneticProfile,
  type KaraokeTimeline,
  type VocalEnvelope,
  type WordTiming,
} from './karaoke';

/**
 * Preview-clip analysis & vocal-to-lyric alignment.
 *
 * Store previews (iTunes / Spotify) are 30-second excerpts that start at an
 * unknown point in the song. We locate the exact song offset by correlating both
 * vocal-band onsets AND vocal presence/silence intervals against the song's
 * LRC line timestamps, then snap every line and word boundary to the singer's voice.
 */

export interface PreviewAnalysis {
  buffer: AudioBuffer;
  /** In-memory Blob URL for instant zero-latency seeking to any timestamp (e.g. 2:25) */
  blobUrl: string;
  /** True when the audio buffer is the full-length track starting at 0:00 (not a 30s excerpt) */
  isFullTrack: boolean;
  /** Raw 50 Hz vocal-band energy */
  vocalE: Float32Array;
  /** 0..1 normalized vocal presence above noise floor (with bass bleed suppressed) */
  vocalNorm: Float32Array;
  /** Vocal-band onset strength per frame (z-normalised) */
  onset: Float32Array;
  /** Cumulative vocal energy (for karaoke fill pacing) */
  cumulative: Float32Array;
  /** Clip time (seconds) where the singer's voice first enters in the preview */
  firstVocalSec: number;
  /** Frames per second of `onset` / `cumulative` */
  rate: number;
  duration: number;
}

export interface PreviewAlignment {
  /** Song time (seconds) where the preview clip begins */
  offset: number;
  /** 0..1 – how clearly the best offset beat the alternatives */
  confidence: number;
}

export type SongTimedLineInput =
  | number
  | {
    timeSec?: number;
    endTimeSec?: number;
    text?: string;
  };

const FRAME_RATE = 50; // 20 ms analysis frames
const analysisCache = new Map<string, Promise<PreviewAnalysis | null>>();
const alignCache = new Map<string, PreviewAlignment | null>();

interface FetchedAudioPayload {
  buf: ArrayBuffer;
  contentType: string;
  kind: 'full' | 'preview' | null;
}

async function fetchAudio(
  url: string,
  signal?: AbortSignal
): Promise<FetchedAudioPayload | null> {
  const attempt = async (u: string): Promise<FetchedAudioPayload | null> => {
    try {
      const res = await fetch(u, { signal });
      if (!res.ok) return null;
      const contentType = (
        res.headers.get('content-type') || 'audio/mp4'
      )
        .split(';')[0]
        .trim();
      const rawKind = res.headers.get('x-audio-kind');
      const kind: 'full' | 'preview' | null =
        rawKind === 'full' || rawKind === 'preview' ? rawKind : null;
      const buf = await res.arrayBuffer();
      return buf.byteLength > 512 ? { buf, contentType, kind } : null;
    } catch {
      return null;
    }
  };
  // Proxy first: guarantees CORS headers so decodeAudioData never sees an opaque body
  if (/^https?:\/\//i.test(url)) {
    const viaProxy = await attempt(
      `/api/audio-proxy?url=${encodeURIComponent(url)}`
    );
    if (viaProxy) return viaProxy;
  }
  return attempt(url);
}

async function bandRender(
  buffer: AudioBuffer,
  setup: (ctx: OfflineAudioContext, src: AudioBufferSourceNode) => AudioNode
): Promise<Float32Array> {
  const ctx = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const last = setup(ctx, src);
  last.connect(ctx.destination);
  src.start();
  const rendered = await ctx.startRendering();
  return rendered.getChannelData(0);
}

function frameEnergy(data: Float32Array, sampleRate: number): Float32Array {
  const hop = Math.max(1, Math.round(sampleRate / FRAME_RATE));
  const frames = Math.floor(data.length / hop);
  const out = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const base = f * hop;
    for (let i = 0; i < hop; i++) {
      const v = data[base + i];
      sum += v * v;
    }
    out[f] = Math.sqrt(sum / hop);
  }
  return out;
}

function onsetStrength(energy: Float32Array): Float32Array {
  const n = energy.length;
  const logE = new Float32Array(n);
  for (let i = 0; i < n; i++) logE[i] = Math.log(1e-4 + energy[i]);
  const out = new Float32Array(n);
  for (let i = 4; i < n; i++) {
    const ref = (logE[i - 2] + logE[i - 3] + logE[i - 4]) / 3;
    out[i] = Math.max(0, logE[i] - ref);
  }
  return out;
}

/** Decodes the preview and extracts vocal-band onset + energy envelopes (cached per URL). */
export function analyzePreview(
  url: string,
  signal?: AbortSignal
): Promise<PreviewAnalysis | null> {
  const cached = analysisCache.get(url);
  if (cached) return cached;

  const job = (async (): Promise<PreviewAnalysis | null> => {
    if (
      typeof window === 'undefined' ||
      typeof OfflineAudioContext === 'undefined'
    ) {
      return null;
    }
    const payload = await fetchAudio(url, signal);
    if (!payload) return null;

    let buffer: AudioBuffer;
    try {
      const decoder = new OfflineAudioContext(2, 44100, 44100);
      buffer = await decoder.decodeAudioData(payload.buf.slice(0));
    } catch {
      return null;
    }

    const blob = new Blob([payload.buf], {
      type: payload.contentType || 'audio/mp4',
    });
    const blobUrl = URL.createObjectURL(blob);
    const isFullTrack =
      payload.kind === 'full' || buffer.duration >= 45;

    // Vocal formant band (≈ 280 Hz – 3.4 kHz) vs. kick/bass band (< 160 Hz)
    const vocal = await bandRender(buffer, (ctx, src) => {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 280;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3400;
      src.connect(hp);
      hp.connect(lp);
      return lp;
    });
    const bass = await bandRender(buffer, (ctx, src) => {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 160;
      src.connect(lp);
      return lp;
    });

    const vocalE = frameEnergy(vocal, buffer.sampleRate);
    const bassE = frameEnergy(bass, buffer.sampleRate);
    const vOn = onsetStrength(vocalE);
    const bOn = onsetStrength(bassE);
    const n = Math.min(vOn.length, bOn.length, vocalE.length);

    // Suppress drum-driven onsets so line starts (voice entries) dominate
    const onset = new Float32Array(n);
    let mean = 0;
    for (let i = 0; i < n; i++) {
      onset[i] = Math.max(0, vOn[i] - 0.55 * bOn[i]);
      mean += onset[i];
    }
    mean /= Math.max(1, n);
    let variance = 0;
    for (let i = 0; i < n; i++) variance += (onset[i] - mean) ** 2;
    const std = Math.sqrt(variance / Math.max(1, n)) || 1;
    for (let i = 0; i < n; i++) onset[i] = (onset[i] - mean) / std;

    // Normalized vocal presence [0..1] above the 18th percentile noise floor
    const sorted = Array.from(vocalE).sort((a, b) => a - b);
    const floor = sorted[Math.floor(sorted.length * 0.18)] ?? 0;
    const p90 = sorted[Math.floor(sorted.length * 0.9)] ?? floor + 1e-3;
    const span = Math.max(1e-4, p90 - floor);

    const vocalNorm = new Float32Array(n);
    const cumulative = new Float32Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const above = Math.max(0, vocalE[i] - floor);
      vocalNorm[i] = Math.min(1, above / span);
      acc += above + span * 0.035; // small baseline prevents flat spots
      cumulative[i] = acc;
    }

    // Find the first sustained vocal entry in the preview clip
    let firstVocalFrame = 0;
    for (let i = 2; i < n - 6; i++) {
      const windowAvg =
        (vocalNorm[i] +
          vocalNorm[i + 1] +
          vocalNorm[i + 2] +
          vocalNorm[i + 3] +
          vocalNorm[i + 4]) /
        5;
      if (windowAvg >= 0.24 && (onset[i] > 0.25 || vocalNorm[i] >= 0.32)) {
        firstVocalFrame = Math.max(0, i - 1);
        break;
      }
    }
    const firstVocalSec =
      Math.round((firstVocalFrame / FRAME_RATE) * 100) / 100;

    return {
      buffer,
      blobUrl,
      isFullTrack,
      vocalE,
      vocalNorm,
      onset,
      cumulative,
      firstVocalSec,
      rate: FRAME_RATE,
      duration: buffer.duration,
    };
  })();

  analysisCache.set(url, job);
  job.then((r) => {
    if (!r) analysisCache.delete(url);
  });
  return job;
}

interface ParsedSongLine {
  start: number;
  end: number;
  afterGap: boolean;
}

function normalizeSongLines(inputs: SongTimedLineInput[]): ParsedSongLine[] {
  const raw: { start: number; end?: number; text?: string }[] = [];
  for (const item of inputs) {
    if (typeof item === 'number') {
      if (Number.isFinite(item) && item >= 0) raw.push({ start: item });
    } else if (
      item &&
      typeof item.timeSec === 'number' &&
      Number.isFinite(item.timeSec) &&
      item.timeSec >= 0
    ) {
      raw.push({
        start: item.timeSec,
        end: item.endTimeSec,
        text: item.text,
      });
    }
  }
  raw.sort((a, b) => a.start - b.start);

  return raw.map((r, i) => {
    const nextStart = i + 1 < raw.length ? raw[i + 1].start : r.start + 3.5;
    const est = r.text ? sungLength(r.text) : 2.6;
    const end = Math.min(
      nextStart - 0.08,
      r.end && r.end > r.start + 0.3
        ? Math.min(r.end, r.start + est * 1.35)
        : r.start + est
    );
    const prevText = i > 0 ? raw[i - 1].text : undefined;
    const prevEnd =
      i > 0
        ? Math.min(
          r.start,
          raw[i - 1].start + (prevText ? sungLength(prevText) : 2.6)
        )
        : 0;
    const afterGap = i === 0 || r.start - prevEnd >= 0.45;
    return {
      start: r.start,
      end: Math.max(r.start + 0.35, end),
      afterGap,
    };
  });
}

/**
 * Finds where the preview clip sits inside the song by correlating:
 * 1) Vocal-band onsets at each LRC line start (weighted higher after breath/phrase gaps),
 * 2) Vocal presence inside sung intervals vs. vocal absence in instrumental gaps,
 * 3) Phrase-boundary alignment with `analysis.firstVocalSec`.
 */
export function estimatePreviewOffset(
  analysis: PreviewAnalysis,
  songLinesInput: SongTimedLineInput[],
  songDuration: number,
  cacheKey?: string
): PreviewAlignment | null {
  if (cacheKey && alignCache.has(cacheKey)) {
    return alignCache.get(cacheKey) ?? null;
  }

  const lines = normalizeSongLines(songLinesInput);
  const clip = analysis.duration;
  if (lines.length < 2 || clip < 5) {
    return analysis.isFullTrack ? { offset: 0, confidence: 1 } : null;
  }

  const lastStart = lines[lines.length - 1].start;
  const maxOffset = Math.max(
    0,
    (songDuration > 0 ? songDuration : lastStart + 20) - clip
  );
  const { onset, vocalNorm, rate, firstVocalSec } = analysis;

  // Peak vocal onset within a tight window around a line start, minus pre-onset silence
  const scoreOnsetAt = (clipSec: number, afterGap: boolean) => {
    const a = Math.max(0, Math.floor((clipSec - 0.11) * rate));
    const b = Math.min(onset.length - 1, Math.ceil((clipSec + 0.15) * rate));
    let peak = -2.5;
    for (let i = a; i <= b; i++) {
      if (onset[i] > peak) peak = onset[i];
    }
    if (!afterGap) return peak;
    // Reward a vocal dip right before a new phrase start
    const preA = Math.max(0, Math.floor((clipSec - 0.32) * rate));
    const preB = Math.max(preA, Math.floor((clipSec - 0.08) * rate));
    let preSum = 0;
    let preCnt = 0;
    for (let i = preA; i <= preB && i < vocalNorm.length; i++) {
      preSum += vocalNorm[i];
      preCnt++;
    }
    const preVocal = preCnt > 0 ? preSum / preCnt : 0.5;
    return peak * 1.25 + (0.45 - preVocal) * 0.7;
  };

  // Mean vocal presence inside [c0, c1]
  const meanVocal = (c0: number, c1: number): number => {
    const a = Math.max(0, Math.floor(c0 * rate));
    const b = Math.min(vocalNorm.length - 1, Math.ceil(c1 * rate));
    if (b <= a) return 0;
    let s = 0;
    for (let i = a; i <= b; i++) s += vocalNorm[i];
    return s / (b - a + 1);
  };

  const evaluateOffset = (off: number): number => {
    let onsetSum = 0;
    let weightSum = 0;
    let count = 0;
    let vocalGateScore = 0;
    let gateCount = 0;
    let firstLineInClip: ParsedSongLine | null = null;

    for (let i = 0; i < lines.length; i++) {
      const ln = lines[i];
      const cStart = ln.start - off;
      const cEnd = ln.end - off;
      if (cEnd < 0.2) continue;
      if (cStart > clip - 0.25) break;

      if (!firstLineInClip && cStart >= -0.25) {
        firstLineInClip = ln;
      }

      if (cStart >= 0.04 && cStart <= clip - 0.25) {
        const w = ln.afterGap ? 1.35 : 1.0;
        onsetSum += scoreOnsetAt(cStart, ln.afterGap) * w;
        weightSum += w;
        count++;
      }

      // Active singing interval should have strong vocal presence
      const singA = Math.max(0, cStart + 0.05);
      const singB = Math.min(clip, cEnd);
      if (singB - singA >= 0.35) {
        vocalGateScore += (meanVocal(singA, singB) - 0.38) * 1.1;
        gateCount++;
      }

      // Gap between this line and the next should have lower vocal energy
      if (i + 1 < lines.length) {
        const gapA = Math.max(0, cEnd + 0.14);
        const gapB = Math.min(clip, lines[i + 1].start - off - 0.1);
        if (gapB - gapA >= 0.4) {
          vocalGateScore += (0.42 - meanVocal(gapA, gapB)) * 1.25;
          gateCount++;
        }
      }
    }

    if (count < 2) return -999;

    const avgOnset = (onsetSum / Math.max(1, weightSum)) * Math.sqrt(count);
    const avgGate =
      gateCount > 0 ? (vocalGateScore / gateCount) * Math.sqrt(gateCount) : 0;

    // Bonus when the first LRC line inside the preview aligns with the clip's first vocal entry
    let firstVocalBonus = 0;
    if (firstLineInClip) {
      const cFirst = firstLineInClip.start - off;
      const diff = Math.abs(cFirst - firstVocalSec);
      if (diff <= 0.28) {
        firstVocalBonus = (1 - diff / 0.28) * 1.65;
      }
    }

    return avgOnset + avgGate * 1.3 + firstVocalBonus;
  };

  // Full-length track: starts at 0:00, calibrate fine mastering offset in [-2.2s, +2.8s] at 10ms resolution
  if (analysis.isFullTrack) {
    let bestOff = 0;
    let bestScore = evaluateOffset(0);
    for (let off = -2.2; off <= 2.8 + 1e-6; off += 0.01) {
      // Gentle prior towards 0.0s so an equal score prefers 0
      const sc = evaluateOffset(off) - Math.abs(off) * 0.18;
      if (sc > bestScore) {
        bestScore = sc;
        bestOff = off;
      }
    }
    const out: PreviewAlignment = {
      offset: Math.round(bestOff * 100) / 100,
      confidence: 1,
    };
    if (cacheKey) alignCache.set(cacheKey, out);
    return out;
  }

  // 1. Coarse scan at 40 ms resolution
  const coarseStep = 0.04;
  const scores: { offset: number; score: number }[] = [];
  for (let off = 0; off <= maxOffset + 1e-6; off += coarseStep) {
    const sc = evaluateOffset(off);
    if (sc > -900) {
      scores.push({ offset: off, score: sc });
    }
  }
  if (!scores.length) return null;

  scores.sort((a, b) => b.score - a.score);

  // 2. Fine scan at 10 ms resolution around the top 3 distinct peaks
  const peaks: { offset: number; score: number }[] = [];
  for (const cand of scores) {
    if (peaks.every((p) => Math.abs(p.offset - cand.offset) > 1.0)) {
      peaks.push(cand);
      if (peaks.length >= 3) break;
    }
  }

  let best = peaks[0];
  for (const pk of peaks) {
    const lo = Math.max(0, pk.offset - 0.08);
    const hi = Math.min(maxOffset, pk.offset + 0.08);
    for (let off = lo; off <= hi + 1e-6; off += 0.01) {
      const sc = evaluateOffset(off);
      if (sc > best.score) {
        best = { offset: off, score: sc };
      }
    }
  }

  const rival = scores.find((s) => Math.abs(s.offset - best.offset) > 1.5);
  const margin = rival ? best.score - rival.score : best.score;
  const confidence = Math.max(
    0,
    Math.min(1, margin / Math.max(1, Math.abs(best.score)))
  );

  const out: PreviewAlignment = {
    offset: Math.round(best.offset * 100) / 100,
    confidence,
  };
  if (cacheKey) alignCache.set(cacheKey, out);
  return out;
}

/**
 * Snaps every line start, line end, and word boundary in a `KaraokeTimeline`
 * to the singer's actual vocal energy & syllable onsets in the decoded audio clip.
 */
export function alignTimelineToAudio(
  timeline: KaraokeTimeline,
  analysis: PreviewAnalysis | null,
  songOffset: number | null
): KaraokeTimeline {
  if (!analysis || songOffset === null) return timeline;

  const { lines, starts, ends } = timeline;
  const { onset, vocalNorm, cumulative, rate, duration } = analysis;
  const n = lines.length;
  if (!n || cumulative.length < 4) return timeline;

  const frameAt = (clipSec: number) =>
    Math.min(
      cumulative.length - 1,
      Math.max(0, Math.round(clipSec * rate))
    );

  const cumClip = (clipSec: number): number => {
    const f = clipSec * rate;
    if (f <= 0) return cumulative[0] ?? 0;
    const last = cumulative.length - 1;
    if (f >= last) return cumulative[last] ?? 0;
    const i = Math.floor(f);
    const k = f - i;
    return cumulative[i] * (1 - k) + cumulative[i + 1] * k;
  };

  // 1. Snap each line's start to the real vocal onset within [-0.22s, +0.26s]
  const refinedStarts = starts.map((s, idx) => {
    const clipS = s - songOffset;
    if (clipS < -0.25 || clipS > duration - 0.3) return s;

    const minClip =
      idx > 0
        ? Math.max(0, starts[idx - 1] - songOffset + 0.35, clipS - 0.22)
        : Math.max(0, clipS - 0.22);
    const maxClip = Math.min(duration - 0.2, clipS + 0.26);
    const f0 = frameAt(minClip);
    const f1 = frameAt(maxClip);

    let bestFrame = frameAt(Math.max(0, clipS));
    let bestScore = -999;
    const centerFrame = bestFrame;

    for (let f = f0; f <= f1; f++) {
      // Combine vocal onset strength with vocal presence and proximity to LRC timestamp
      const distPenalty = Math.abs(f - centerFrame) * 0.08;
      const vNext =
        (vocalNorm[f] + (vocalNorm[Math.min(f1, f + 1)] ?? vocalNorm[f])) * 0.5;
      const score = onset[f] * 0.75 + vNext * 0.9 - distPenalty;
      if (vNext >= 0.16 && score > bestScore) {
        bestScore = score;
        bestFrame = f;
      }
    }

    // Back up 1 frame (20ms) so the highlight begins right at the consonant attack
    const snappedClip = Math.max(0, (bestFrame - 0.5) / rate);
    return Math.round((songOffset + snappedClip) * 1000) / 1000;
  });

  // 2. Snap each line's end to where the vocal actually releases before the next line
  const refinedEnds = ends.map((e, idx) => {
    const s = refinedStarts[idx];
    const nextS = idx + 1 < n ? refinedStarts[idx + 1] : null;
    const maxAllowed = nextS !== null ? Math.max(s + 0.32, nextS - 0.05) : e + 0.35;
    const nominalEnd = Math.min(maxAllowed, Math.max(s + 0.35, e));

    const clipS = s - songOffset;
    const clipE = nominalEnd - songOffset;
    if (clipS < 0 || clipE > duration) return nominalEnd;

    // Look in the last 35% of the line window for a clear vocal release (breath pause)
    const searchStart = clipS + (clipE - clipS) * 0.62;
    const fStart = frameAt(searchStart);
    const fEnd = frameAt(Math.min(duration, maxAllowed - songOffset));

    let lastActiveFrame = frameAt(clipE);
    for (let f = fEnd; f >= fStart; f--) {
      if (vocalNorm[f] >= 0.18) {
        lastActiveFrame = Math.min(fEnd, f + 1);
        break;
      }
    }
    const snappedEnd = songOffset + lastActiveFrame / rate;
    return (
      Math.round(
        Math.min(maxAllowed, Math.max(s + 0.35, snappedEnd)) * 1000
      ) / 1000
    );
  });

  // 3. Snap every word inside each line to cumulative vocal energy + syllable articulation onsets
  const refinedWords: WordTiming[][] = lines.map((lineText, idx) => {
    const s = refinedStarts[idx];
    const e = refinedEnds[idx];
    const tokens = lineText.trim().split(/\s+/).filter(Boolean);
    const m = tokens.length;
    if (m === 0) return [];
    if (m === 1) {
      return [
        {
          word: tokens[0],
          startSec: s,
          endSec: e,
          weight: wordPhoneticProfile(tokens[0]).singWeight,
        },
      ];
    }

    const clipS = s - songOffset;
    const clipE = e - songOffset;
    if (clipS < -0.1 || clipE > duration + 0.1 || clipE - clipS < 0.25) {
      return buildLineWordTimings(lineText, s, e);
    }

    const profiles = tokens.map(wordPhoneticProfile);
    let totalWeight = 0;
    for (let k = 0; k < m; k++) {
      totalWeight +=
        profiles[k].singWeight + (k < m - 1 ? profiles[k].pauseWeight : 0);
    }
    totalWeight = Math.max(1e-4, totalWeight);

    const c0 = cumClip(Math.max(0, clipS));
    const c1 = cumClip(Math.min(duration, clipE));
    const cSpan = Math.max(1e-5, c1 - c0);

    // Map cumulative phonetic fraction -> clip time via inverse cumulative vocal energy
    const timeForFraction = (frac: number): number => {
      const clamped = Math.min(1, Math.max(0, frac));
      const linearClip = clipS + clamped * (clipE - clipS);
      if (cSpan <= 1e-4) return linearClip;

      const targetC = c0 + clamped * cSpan;
      let lo = Math.max(0, clipS);
      let hi = Math.min(duration, clipE);
      for (let it = 0; it < 12; it++) {
        const mid = (lo + hi) * 0.5;
        if (cumClip(mid) < targetC) lo = mid;
        else hi = mid;
      }
      const energyClip = (lo + hi) * 0.5;
      // Blend 70% vocal-energy time warp + 30% phonetic pacing
      return energyClip * 0.7 + linearClip * 0.3;
    };

    // Snap internal word boundary near `candClip` to the closest local syllable onset
    const snapWordStart = (
      candClip: number,
      minClip: number,
      maxClip: number
    ): number => {
      const winLo = Math.max(minClip, candClip - 0.075);
      const winHi = Math.min(maxClip, candClip + 0.075);
      if (winHi <= winLo) return candClip;

      const f0 = frameAt(winLo);
      const f1 = frameAt(winHi);
      const fCenter = frameAt(candClip);
      let bestF = fCenter;
      let bestSc = -999;

      for (let f = f0; f <= f1; f++) {
        const prevV = vocalNorm[Math.max(0, f - 1)] ?? vocalNorm[f];
        const curV = vocalNorm[f];
        // Local consonant dip -> vowel rise or onset peak
        const rise = Math.max(0, curV - prevV);
        const sc =
          onset[f] * 0.65 +
          rise * 1.2 +
          curV * 0.25 -
          Math.abs(f - fCenter) * 0.12;
        if (curV >= 0.12 && sc > bestSc) {
          bestSc = sc;
          bestF = f;
        }
      }
      return Math.min(maxClip, Math.max(minClip, bestF / rate));
    };

    const wordStartsClip = new Array<number>(m).fill(clipS);
    const wordEndsClip = new Array<number>(m).fill(clipE);

    let accWeight = 0;
    for (let k = 0; k < m; k++) {
      const singW = profiles[k].singWeight;
      const pauseW = k < m - 1 ? profiles[k].pauseWeight : 0;
      const startFrac = accWeight / totalWeight;
      const endFrac = (accWeight + singW) / totalWeight;
      accWeight += singW + pauseW;

      const rawStart = k === 0 ? clipS : timeForFraction(startFrac);
      const rawEnd = k === m - 1 ? clipE : timeForFraction(endFrac);

      const minStart =
        k === 0 ? clipS : Math.min(clipE - 0.04, wordEndsClip[k - 1]);
      const snappedStart =
        k === 0
          ? clipS
          : snapWordStart(rawStart, minStart, Math.max(minStart, rawEnd - 0.04));

      wordStartsClip[k] = snappedStart;
      wordEndsClip[k] = Math.max(snappedStart + 0.045, rawEnd);
    }

    // Ensure strict non-overlapping ordering and trim any breath dip between words
    for (let k = 0; k < m - 1; k++) {
      const nextSt = Math.max(wordStartsClip[k] + 0.045, wordStartsClip[k + 1]);
      wordStartsClip[k + 1] = nextSt;
      wordEndsClip[k] = Math.min(wordEndsClip[k], nextSt - 0.012);
      wordEndsClip[k] = Math.max(wordStartsClip[k] + 0.04, wordEndsClip[k]);
    }
    wordEndsClip[m - 1] = Math.max(wordStartsClip[m - 1] + 0.045, clipE);

    return tokens.map((word, k) => ({
      word,
      startSec: Math.round((songOffset + wordStartsClip[k]) * 1000) / 1000,
      endSec: Math.round((songOffset + wordEndsClip[k]) * 1000) / 1000,
      weight: profiles[k].singWeight,
    }));
  });

  return {
    lines,
    starts: refinedStarts,
    ends: refinedEnds,
    words: refinedWords,
  };
}

/** Vocal envelope positioned on the song timeline, for karaoke fill pacing. */
export function vocalEnvelopeFor(
  analysis: PreviewAnalysis,
  songOffset: number
): VocalEnvelope {
  return {
    cumulative: analysis.cumulative,
    rate: analysis.rate,
    songOffset,
  };
}
