import type { InlineWordTime } from '../services/lyricsService';

/**
 * Spotify-style word-by-word karaoke timing.
 *
 * All times are ABSOLUTE song seconds, so the same timeline drives the live stage
 * player, the progress bar and the exported video from one clock.
 */

export interface WordTiming {
  word: string;
  /** Absolute song time (seconds) when this word begins being sung */
  startSec: number;
  /** Absolute song time (seconds) when this word finishes being sung */
  endSec: number;
  /** Relative phonetic singing weight of this word */
  weight: number;
}

export interface KaraokeTimeline {
  /** Non-empty card lines in display order */
  lines: string[];
  /** Absolute song time where each non-empty card line starts being sung */
  starts: number[];
  /** Absolute song time where the vocal of each line is estimated to finish */
  ends: number[];
  /** Per-line word timings in absolute song seconds */
  words: WordTiming[][];
}

/**
 * Cumulative vocal-band energy of the decoded preview clip, used so word-by-word
 * fill follows the singer (pauses in silences, advances while singing).
 */
export interface VocalEnvelope {
  /** Cumulative (monotonic) vocal energy per analysis frame */
  cumulative: Float32Array;
  /** Analysis frames per second */
  rate: number;
  /** Song time (seconds) that corresponds to audio-clip time 0 */
  songOffset: number;
}

export interface KaraokeFrame {
  lineWeights: number[];
  activeParagraph: number;
  activeLineFill: number;
  /**
   * Per-line array of per-word fill fractions [0..1]:
   * - 0 = word not yet reached
   * - (0..1) = word currently being sung
   * - 1 = word completely sung
   */
  wordFills: number[][];
  /** Index of the currently active word inside `activeParagraph` (-1 if none) */
  activeWordIndex: number;
}

/** Non-empty card lines in display order (matches the paragraph order on the card). */
export function cardLines(lyrics: string): string[] {
  return String(lyrics || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Natural sung length of a line based on its length and syllable density. */
export function sungLength(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 1.5;
  let totalSyllables = 0;
  for (const w of words) {
    totalSyllables += countSyllables(w);
  }
  const chars = text.replace(/\s+/g, ' ').length;
  const est = 0.45 + totalSyllables * 0.25 + chars * 0.036;
  return Math.min(6.4, Math.max(1.25, est));
}

/** Estimates spoken/sung syllable nuclei count for natural word pacing. */
export function countSyllables(rawWord: string): number {
  const core = rawWord
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replace(/(?:[^laeiouy]es|ed|e)$/i, '');
  if (!core) return 1;
  const matches = core.match(/[aeiouyàáâãäåèéêëìíîïòóôõöùúûüýÿ]+/gi);
  return Math.max(1, matches ? matches.length : 1);
}

/**
 * Computes phonetic singing weight and post-word breath/punctuation pause weight
 * so each word in a lyric line receives a natural singing window.
 */
export function wordPhoneticProfile(rawWord: string): {
  singWeight: number;
  pauseWeight: number;
} {
  const core = rawWord.replace(/[^\p{L}\p{N}]/gu, '');
  const syllables = countSyllables(rawWord);
  // Open vowels / sustained diphthongs at the end of a word tend to be held longer when sung
  const sustainedBonus = /(?:oo|ee|ay|ow|igh|ing|ou|ea|oh|ah|uh|y|a|o)$/i.test(
    core
  )
    ? 0.22
    : 0;
  const singWeight =
    0.58 * syllables +
    0.08 * Math.min(11, Math.max(1, core.length)) +
    sustainedBonus;

  let pauseWeight = 0.045; // Crisp consonant articulation gap between consecutive words
  if (/[,;:—–-]$/.test(rawWord)) {
    pauseWeight = 0.28;
  } else if (/[.!?…]$/.test(rawWord)) {
    pauseWeight = 0.36;
  }

  return { singWeight, pauseWeight };
}

/**
 * Builds word-level [startSec, endSec] intervals across a line's [lineStart, lineEnd] window.
 */
export function buildLineWordTimings(
  lineText: string,
  lineStart: number,
  lineEnd: number,
  inlineWords?: InlineWordTime[]
): WordTiming[] {
  const tokens = lineText.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];

  const safeEnd = Math.max(lineStart + 0.35, lineEnd);

  // If Enhanced LRC provided inline word timestamps matching this line, use them directly
  if (inlineWords && inlineWords.length === tokens.length) {
    return tokens.map((word, idx) => {
      const st = Math.max(lineStart, inlineWords[idx].timeSec);
      const nextSt =
        idx + 1 < inlineWords.length
          ? Math.max(st + 0.08, inlineWords[idx + 1].timeSec - 0.02)
          : safeEnd;
      const et = Math.min(safeEnd, Math.max(st + 0.08, nextSt));
      return {
        word,
        startSec: st,
        endSec: et,
        weight: wordPhoneticProfile(word).singWeight,
      };
    });
  }

  const profiles = tokens.map(wordPhoneticProfile);
  const m = tokens.length;
  let totalSlotWeight = 0;
  for (let i = 0; i < m; i++) {
    totalSlotWeight +=
      profiles[i].singWeight + (i < m - 1 ? profiles[i].pauseWeight : 0);
  }
  totalSlotWeight = Math.max(1e-4, totalSlotWeight);

  const lineDur = safeEnd - lineStart;
  const out: WordTiming[] = [];
  let cursor = lineStart;

  for (let i = 0; i < m; i++) {
    const singDur = (profiles[i].singWeight / totalSlotWeight) * lineDur;
    const pauseDur =
      i < m - 1 ? (profiles[i].pauseWeight / totalSlotWeight) * lineDur : 0;
    const startSec = cursor;
    const endSec =
      i === m - 1
        ? safeEnd
        : Math.min(safeEnd, Math.max(startSec + 0.06, startSec + singDur));
    out.push({
      word: tokens[i],
      startSec: Math.round(startSec * 1000) / 1000,
      endSec: Math.round(endSec * 1000) / 1000,
      weight: profiles[i].singWeight,
    });
    cursor += singDur + pauseDur;
  }

  return out;
}

/**
 * Builds the absolute start/end of every card line AND every word within each line.
 * Uses real LRC timestamps when available; otherwise synthesises natural pacing
 * from `anchorSec` so every word still gets its own highlight.
 */
export function buildKaraokeTimeline(
  lines: string[],
  anchorSec: number,
  lineTimes: number[],
  lineEnds?: number[],
  inlineWordTimes?: (InlineWordTime[] | undefined)[]
): KaraokeTimeline {
  const safeLines = lines.length > 0 ? lines : [''];
  const n = safeLines.length;
  const starts: number[] = [];

  for (let i = 0; i < n; i++) {
    const known = lineTimes[i];
    const prev = i > 0 ? starts[i - 1] : null;
    if (
      typeof known === 'number' &&
      Number.isFinite(known) &&
      (prev === null || known > prev + 0.18)
    ) {
      starts.push(known);
    } else if (prev === null) {
      starts.push(Math.max(0, anchorSec));
    } else {
      const prevEnd =
        lineEnds && typeof lineEnds[i - 1] === 'number' && lineEnds[i - 1] > prev
          ? lineEnds[i - 1]
          : prev + sungLength(safeLines[i - 1] || '') + 0.28;
      starts.push(prevEnd);
    }
  }

  const ends = starts.map((s, i) => {
    const est = sungLength(safeLines[i] || '');
    const nextStart = i + 1 < n ? starts[i + 1] : null;
    const explicitEnd =
      lineEnds && typeof lineEnds[i] === 'number' && Number.isFinite(lineEnds[i])
        ? lineEnds[i]
        : null;

    let rawEnd = s + est;
    if (explicitEnd !== null && explicitEnd > s + 0.35) {
      // Bound by natural sung duration so long instrumental gaps don't stretch the last word
      rawEnd = Math.min(explicitEnd - 0.06, s + est * 1.32);
    }
    if (nextStart !== null) {
      const gap = nextStart - s;
      const cap = Math.max(s + 0.35, nextStart - 0.06);
      rawEnd =
        gap <= est * 1.38
          ? cap
          : Math.min(cap, rawEnd);
    }
    return Math.max(s + 0.35, rawEnd);
  });

  const words = safeLines.map((lineText, i) =>
    buildLineWordTimings(lineText, starts[i], ends[i], inlineWordTimes?.[i])
  );

  return { lines: safeLines, starts, ends, words };
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / Math.max(1e-4, e1 - e0)));
  return t * t * (3 - 2 * t);
};

export function cumAt(env: VocalEnvelope, songTime: number): number {
  const f = (songTime - env.songOffset) * env.rate;
  const arr = env.cumulative;
  if (f <= 0) return arr[0] ?? 0;
  const last = arr.length - 1;
  if (f >= last) return arr[last] ?? 0;
  const i = Math.floor(f);
  const k = f - i;
  return arr[i] * (1 - k) + arr[i + 1] * k;
}

/**
 * Computes per-line highlight weights AND per-word fill fractions [0..1]
 * for an absolute song time. Lead of ~0.07s matches human visual anticipation.
 */
export function computeKaraokeFrame(
  timeline: KaraokeTimeline,
  songTime: number,
  vocal?: VocalEnvelope | null
): KaraokeFrame {
  const { starts, ends, words } = timeline;
  const n = starts.length;
  const lead = 0.07;
  const effectiveTime = songTime + lead;

  let active = -1;
  for (let i = 0; i < n; i++) {
    if (effectiveTime >= starts[i]) active = i;
  }

  const lineWeights = new Array<number>(n).fill(0);
  if (active >= 0) {
    // Active line eases in cleanly
    lineWeights[active] = smoothstep(
      starts[active] - 0.18,
      starts[active] + 0.08,
      effectiveTime
    );
    // Previous line eases out while the new line eases in (cross-fade)
    if (active > 0) {
      lineWeights[active - 1] = 1 - lineWeights[active];
    }
  }

  const wordFills: number[][] = [];
  let activeLineFill = 0;
  let activeWordIndex = -1;

  for (let i = 0; i < n; i++) {
    const lineWords = words?.[i] ?? [];
    const m = lineWords.length;
    if (m === 0) {
      wordFills.push([]);
      continue;
    }

    if (i < active) {
      wordFills.push(new Array<number>(m).fill(1));
      continue;
    }

    if (i > active) {
      wordFills.push(new Array<number>(m).fill(0));
      continue;
    }

    // Active line: compute each word's exact fill [0..1]
    const s = starts[i];
    const e = Math.max(s + 0.35, ends[i]);
    const fills = new Array<number>(m).fill(0);
    let completedWeight = 0;
    let totalWeight = 0;

    for (let k = 0; k < m; k++) {
      const w = lineWords[k];
      const ws = w.startSec;
      const we = Math.max(ws + 0.05, w.endSec);
      const ww = Math.max(0.1, w.weight);
      totalWeight += ww;

      let wf = 0;
      if (effectiveTime <= ws) {
        wf = 0;
      } else if (effectiveTime >= we) {
        wf = 1;
      } else {
        const linearW = (effectiveTime - ws) / (we - ws);
        wf = linearW;
        if (vocal && vocal.cumulative.length > 2) {
          const wc0 = cumAt(vocal, ws);
          const wc1 = cumAt(vocal, we);
          if (wc1 - wc0 > 1e-6) {
            const energyW = Math.min(
              1,
              Math.max(0, (cumAt(vocal, effectiveTime) - wc0) / (wc1 - wc0))
            );
            wf = energyW * 0.65 + linearW * 0.35;
          }
        }
        wf = Math.min(1, Math.max(0, wf));
        if (activeWordIndex === -1) {
          activeWordIndex = k;
        }
      }

      fills[k] = wf;
      completedWeight += wf * ww;
    }

    // If between two words (in a micro-pause), set activeWordIndex to the word about to be sung or just sung
    if (activeWordIndex === -1 && effectiveTime >= s && effectiveTime < e) {
      for (let k = 0; k < m; k++) {
        if (fills[k] < 1) {
          activeWordIndex = k;
          break;
        }
      }
      if (activeWordIndex === -1) activeWordIndex = m - 1;
    }

    wordFills.push(fills);
    activeLineFill =
      totalWeight > 0
        ? Math.min(1, Math.max(0, completedWeight / totalWeight))
        : Math.min(1, Math.max(0, (effectiveTime - s) / (e - s)));
  }

  return {
    lineWeights,
    activeParagraph: active,
    activeLineFill,
    wordFills,
    activeWordIndex,
  };
}
