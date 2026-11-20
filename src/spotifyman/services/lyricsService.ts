import { fetchJson, SearchError } from './musicSearch';

export const LYRICS_API = 'https://api.lyrics.ovh/v1';
export const LRCLIB_API = 'https://lrclib.net/api';
export const LYRICS_TIMEOUT = 6000;
export const LINES_PER_BLOCK = 1;
export const MAX_LINES = 4;
export const NOT_FOUND =
  'Lyrics not found for this song. You can type them manually.';
export const OFFLINE_LYRICS =
  "You're offline, so lyrics can't be fetched. You can type them manually.";

export interface InlineWordTime {
  word: string;
  timeSec: number;
}

export interface TimedLyricBlock {
  text: string;
  timeSec?: number;
  endTimeSec?: number;
  words?: InlineWordTime[];
}

export const cleanTitle = (t: string) =>
  t
    .replace(/\s*[([].*?[)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .trim();

export const stripFeat = (t: string) =>
  t
    .replace(
      /\s*[([]\s*(?:feat|ft|featuring|with)\.?\s[^)\]]*[)\]]/gi,
      ''
    )
    .replace(/\s+(?:feat|ft|featuring)\.?\s.*$/i, '')
    .trim();

export function lyricQueries(artist: string, title: string): [string, string][] {
  const out: [string, string][] = [];
  const seen = new Set<string>();
  const add = (a: string, t: string) => {
    a = (a || '').trim();
    t = (t || '').trim();
    const k = (a + '|' + t).toLowerCase();
    if (a && t && !seen.has(k)) {
      seen.add(k);
      out.push([a, t]);
    }
  };
  const a1 = artist.trim();
  const a2 = stripFeat(a1);
  const a3 = a2.split(/\s*(?:,|&|;|\band\b)\s*/i)[0];
  const tc = cleanTitle(title);
  const tn = stripFeat(tc);
  add(a1, tc);
  add(a1, tn);
  add(a2, tn);
  add(a3, tn);
  add(a1, title);
  return out;
}

export function stripLrc(text: string): string {
  return String(text || '')
    .split(/\r?\n/)
    .filter((l) => !/^\s*\[[a-z]{1,}:[^\]]*\]\s*$/i.test(l))
    .map((l) =>
      l
        .replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g, '')
        .replace(/<\d{1,3}:\d{2}(?:[.:]\d{1,3})?>/g, '')
        .trim()
    )
    .join('\n');
}

/**
 * Parses synced LRC text into lines while preserving each line's start/end timestamp
 * and any inline word timestamps (<mm:ss.xx>word) in seconds.
 */
export function parseTimedLrc(
  syncedText: string,
  plainFallback = '',
  totalDuration = 0
): TimedLyricBlock[] {
  const rawSynced = String(syncedText || '').trim();
  if (rawSynced) {
    const out: TimedLyricBlock[] = [];
    const lines = rawSynced.split(/\r?\n/);
    const tagRe = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/;
    const inlineWordRe =
      /[<[](\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?[>\]]([^<[\]]+)/g;

    const toSec = (m1: string, m2: string, m3?: string) => {
      const mins = parseInt(m1, 10) || 0;
      const secs = parseInt(m2, 10) || 0;
      const frac = m3
        ? parseInt(m3.padEnd(3, '0').slice(0, 3), 10) / 1000
        : 0;
      return Math.round((mins * 60 + secs + frac) * 100) / 100;
    };

    for (const raw of lines) {
      if (/^\s*\[[a-z]{1,}:[^\]]*\]\s*$/i.test(raw)) continue;
      const m = tagRe.exec(raw);
      const clean = raw
        .replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g, '')
        .replace(/<\d{1,3}:\d{2}(?:[.:]\d{1,3})?>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean || /^paroles de la chanson/i.test(clean)) continue;
      let timeSec: number | undefined;
      if (m) {
        // Keep centisecond precision — rounding to whole seconds broke karaoke sync
        timeSec = toSec(m[1], m[2], m[3]);
      }

      // Parse optional Enhanced LRC inline word timestamps (<mm:ss.xx>word)
      const inlineWords: InlineWordTime[] = [];
      inlineWordRe.lastIndex = 0;
      let wm: RegExpExecArray | null;
      while ((wm = inlineWordRe.exec(raw)) !== null) {
        const wTime = toSec(wm[1], wm[2], wm[3]);
        const tokens = wm[4].trim().split(/\s+/).filter(Boolean);
        tokens.forEach((tok, idx) => {
          inlineWords.push({
            word: tok,
            timeSec: Math.round((wTime + idx * 0.14) * 100) / 100,
          });
        });
      }

      out.push({
        text: clean,
        timeSec,
        words: inlineWords.length >= 2 ? inlineWords : undefined,
      });
    }

    for (let i = 0; i < out.length; i++) {
      const curT = out[i].timeSec;
      const nextT = out[i + 1]?.timeSec;
      if (
        typeof curT === 'number' &&
        typeof nextT === 'number' &&
        nextT > curT
      ) {
        out[i].endTimeSec = nextT;
      }
    }

    if (out.length > 0) return out;
  }

  const plainLines = String(plainFallback || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^paroles de la chanson/i.test(l));

  return plainLines.map((text, idx) => {
    const start =
      totalDuration > 0 && plainLines.length > 0
        ? Math.round(((idx + 0.3) / plainLines.length) * totalDuration * 100) /
          100
        : undefined;
    const end =
      totalDuration > 0 && plainLines.length > 0
        ? Math.round(((idx + 1.15) / plainLines.length) * totalDuration * 100) /
          100
        : undefined;
    return {
      text,
      timeSec: start,
      endTimeSec: end,
    };
  });
}

export function parseStanzas(raw: string): string[] {
  const lines = String(raw || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^paroles de la chanson/i.test(l));

  const blocks: string[] = [];
  for (let i = 0; i < lines.length; i += LINES_PER_BLOCK) {
    blocks.push(lines.slice(i, i + LINES_PER_BLOCK).join('\n'));
  }
  return blocks;
}

export function bestLrclib(list: any[], duration: number) {
  const ok = (Array.isArray(list) ? list : []).filter(
    (r) =>
      r &&
      !r.instrumental &&
      ((r.plainLyrics && r.plainLyrics.trim()) ||
        (r.syncedLyrics && r.syncedLyrics.trim()))
  );
  if (!ok.length) return null;
  // Prefer records with syncedLyrics + closest duration
  ok.sort((a, b) => {
    const aSynced = Boolean(a.syncedLyrics && a.syncedLyrics.trim());
    const bSynced = Boolean(b.syncedLyrics && b.syncedLyrics.trim());
    if (aSynced !== bSynced) return aSynced ? -1 : 1;
    if (duration > 0) {
      return (
        Math.abs((a.duration || 1e9) - duration) -
        Math.abs((b.duration || 1e9) - duration)
      );
    }
    return 0;
  });
  return ok[0];
}

export const lrcText = (r: any) =>
  r && !r.instrumental
    ? r.plainLyrics && r.plainLyrics.trim()
      ? r.plainLyrics
      : r.syncedLyrics
      ? stripLrc(r.syncedLyrics)
      : ''
    : '';

export interface FetchedLyricsResult {
  blocks: string[];
  timedBlocks: TimedLyricBlock[];
  duration?: number;
  source: string;
}

export async function fetchLyrics(
  artist: string,
  title: string,
  duration = 0,
  stale: () => boolean = () => false
): Promise<FetchedLyricsResult> {
  const q = lyricQueries(artist, title);
  if (!q.length) {
    throw new SearchError(NOT_FOUND);
  }

  const fromRecord = (r: any, source: string): FetchedLyricsResult | null => {
    if (!r || r.instrumental) return null;
    const recDur =
      typeof r.duration === 'number' && r.duration > 0
        ? Math.round(r.duration)
        : duration > 0
        ? Math.round(duration)
        : 0;
    const timedBlocks = parseTimedLrc(
      r.syncedLyrics || '',
      r.plainLyrics || '',
      recDur
    );
    if (!timedBlocks.length) return null;
    return {
      blocks: timedBlocks.map((b) => b.text),
      timedBlocks,
      duration: recDur > 0 ? recDur : undefined,
      source,
    };
  };

  let hit: FetchedLyricsResult | null = null;

  // 1. LRCLIB exact /get (fastest & includes syncedLyrics + full track duration)
  for (const [a, t] of q.slice(0, 4)) {
    if (hit || stale()) break;
    try {
      const qs =
        `track_name=${encodeURIComponent(t)}&artist_name=${encodeURIComponent(
          a
        )}` + (duration > 0 ? `&duration=${Math.round(duration)}` : '');
      const rec = await fetchJson(`${LRCLIB_API}/get?${qs}`, LYRICS_TIMEOUT);
      hit = fromRecord(rec, 'LRCLIB');
    } catch {
      // 404 = try next variant
    }
  }

  // 2. LRCLIB /search
  const best = q[Math.min(1, q.length - 1)];
  for (const qs of [
    `track_name=${encodeURIComponent(q[0][1])}&artist_name=${encodeURIComponent(
      q[0][0]
    )}`,
    `q=${encodeURIComponent(best[0] + ' ' + best[1])}`,
  ]) {
    if (hit || stale()) break;
    try {
      const list = await fetchJson(`${LRCLIB_API}/search?${qs}`, LYRICS_TIMEOUT);
      hit = fromRecord(bestLrclib(list, duration), 'LRCLIB');
    } catch {
      // try next query
    }
  }

  // 3. Fallback: lyrics.ovh
  if (!hit && !stale()) {
    try {
      const d = await fetchJson(
        `${LYRICS_API}/${encodeURIComponent(q[0][0])}/${encodeURIComponent(
          q[0][1]
        )}`,
        LYRICS_TIMEOUT
      );
      if (d && typeof d.lyrics === 'string') {
        const timedBlocks = parseTimedLrc('', d.lyrics, duration);
        if (timedBlocks.length) {
          hit = {
            blocks: timedBlocks.map((b) => b.text),
            timedBlocks,
            duration: duration > 0 ? duration : undefined,
            source: 'lyrics.ovh',
          };
        }
      }
    } catch {
      // no hit
    }
  }

  if (!hit) {
    throw new SearchError(navigator.onLine === false ? OFFLINE_LYRICS : NOT_FOUND);
  }
  return hit;
}

const normLine = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

export interface LyricOccurrence {
  /** Song time of the first card line */
  timeSec: number;
  /** Song time of each card line (same order as the card) */
  lineTimes: number[];
  /** Song time where each card line ends (from next LRC line timestamp) */
  lineEnds: number[];
  /** Optional inline word timestamps per card line */
  wordTimes?: (InlineWordTime[] | undefined)[];
}

export interface LyricTimestampMatch {
  timeSec: number | null;
  lineTimes: number[];
  lineEnds: number[];
  wordTimes?: (InlineWordTime[] | undefined)[];
  duration: number | null;
  /** Every place in the song where the card lyrics occur (choruses repeat) */
  occurrences: LyricOccurrence[];
  /** All synced line timestamps of the whole song (used to align the preview clip) */
  songLineTimes: number[];
  /** All timed lyric blocks of the song (used for vocal gate alignment & live preview tracking) */
  songTimedBlocks: TimedLyricBlock[];
}

const matchCache = new Map<string, LyricTimestampMatch>();

function lineSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) {
    const minLen = Math.min(a.length, b.length);
    const maxLen = Math.max(a.length, b.length);
    return minLen / Math.max(1, maxLen) >= 0.45 ? 0.9 : 0.65;
  }
  const wa = a.split(' ').filter(Boolean);
  const wb = b.split(' ').filter(Boolean);
  if (!wa.length || !wb.length) return 0;
  const setB = new Set(wb);
  let shared = 0;
  for (const w of wa) {
    if (setB.has(w)) shared++;
  }
  return (2 * shared) / (wa.length + wb.length);
}

const sameLine = (a: string, b: string) => lineSimilarity(a, b) >= 0.58;

/**
 * Matches the card lyrics against LRCLIB synced lyrics and returns the exact
 * timestamp of every card line for every occurrence in the song.
 */
export async function matchLyricTimestamp(
  artist: string,
  title: string,
  cardLyrics: string,
  durationHint = 0
): Promise<LyricTimestampMatch> {
  const targets = cardLyrics
    .split(/\r?\n/)
    .map(normLine)
    .filter(Boolean);
  const empty = (dur: number | null): LyricTimestampMatch => ({
    timeSec: null,
    lineTimes: [],
    lineEnds: [],
    duration: dur,
    occurrences: [],
    songLineTimes: [],
    songTimedBlocks: [],
  });
  if (!artist.trim() || !title.trim()) return empty(null);

  const cacheKey = `${artist.trim().toLowerCase()}|${title.trim().toLowerCase()}|${targets.join('/')}`;
  const cached = matchCache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetchLyrics(artist, title, durationHint);
    const timed = res.timedBlocks.filter((b) => typeof b.timeSec === 'number');
    const fullDur = res.duration ?? (durationHint > 0 ? durationHint : null);
    const norm = timed.map((b) => normLine(b.text));
    const songLineTimes = timed.map((b) => b.timeSec as number);

    if (!targets.length || !timed.length) {
      const out: LyricTimestampMatch = {
        timeSec: null,
        lineTimes: [],
        lineEnds: [],
        duration: fullDur,
        occurrences: [],
        songLineTimes,
        songTimedBlocks: timed,
      };
      matchCache.set(cacheKey, out);
      return out;
    }

    // Walk forward from a candidate start, matching each card line within the next few LRC lines
    const walk = (
      startIdx: number
    ): {
      lineTimes: number[];
      lineEnds: number[];
      wordTimes: (InlineWordTime[] | undefined)[];
      matched: number;
    } => {
      const firstStart = timed[startIdx].timeSec as number;
      const firstEnd =
        timed[startIdx].endTimeSec ??
        (timed[startIdx + 1]?.timeSec as number | undefined) ??
        firstStart + 3.2;
      const lineTimes: number[] = [firstStart];
      const lineEnds: number[] = [firstEnd];
      const wordTimes: (InlineWordTime[] | undefined)[] = [timed[startIdx].words];
      let cursor = startIdx;
      let matched = 1;

      for (let k = 1; k < targets.length; k++) {
        let found = -1;
        let bestSim = 0;
        for (let j = cursor + 1; j <= Math.min(norm.length - 1, cursor + 5); j++) {
          const sim = lineSimilarity(norm[j], targets[k]);
          if (sim >= 0.58 && sim > bestSim) {
            bestSim = sim;
            found = j;
            if (sim >= 0.92) break;
          }
        }
        if (found >= 0) {
          const st = timed[found].timeSec as number;
          const et =
            timed[found].endTimeSec ??
            (timed[found + 1]?.timeSec as number | undefined) ??
            st + 3.2;
          lineTimes.push(st);
          lineEnds.push(Math.max(st + 0.5, et));
          wordTimes.push(timed[found].words);
          cursor = found;
          matched++;
        } else {
          // Unmatched card line: assume it is the next LRC line
          cursor = Math.min(norm.length - 1, cursor + 1);
          const t = timed[cursor]?.timeSec as number | undefined;
          const prevEnd = lineEnds[lineEnds.length - 1];
          const st =
            typeof t === 'number' && t > lineTimes[lineTimes.length - 1]
              ? t
              : prevEnd;
          const et =
            timed[cursor]?.endTimeSec ??
            (timed[cursor + 1]?.timeSec as number | undefined) ??
            st + 3.0;
          lineTimes.push(st);
          lineEnds.push(Math.max(st + 0.5, et));
          wordTimes.push(timed[cursor]?.words);
        }
      }
      return { lineTimes, lineEnds, wordTimes, matched };
    };

    const occurrences: (LyricOccurrence & { score: number })[] = [];
    for (let i = 0; i < norm.length; i++) {
      if (!sameLine(norm[i], targets[0])) continue;
      const w = walk(i);
      // Require most lines to match so a single shared phrase doesn't create false hits
      if (targets.length === 1 || w.matched >= Math.max(2, Math.ceil(targets.length * 0.5))) {
        occurrences.push({
          timeSec: w.lineTimes[0],
          lineTimes: w.lineTimes,
          lineEnds: w.lineEnds,
          wordTimes: w.wordTimes,
          score: w.matched,
        });
      }
    }

    // Fallback: the first card line may be partial — match on the second line instead
    if (!occurrences.length && targets.length > 1) {
      for (let i = 1; i < norm.length; i++) {
        if (sameLine(norm[i], targets[1])) {
          const w = walk(i - 1);
          occurrences.push({
            timeSec: w.lineTimes[0],
            lineTimes: w.lineTimes,
            lineEnds: w.lineEnds,
            wordTimes: w.wordTimes,
            score: w.matched,
          });
          break;
        }
      }
    }

    const best = occurrences[0];
    const out: LyricTimestampMatch = {
      timeSec: best ? best.timeSec : null,
      lineTimes: best ? best.lineTimes : [],
      lineEnds: best ? best.lineEnds : [],
      wordTimes: best ? best.wordTimes : undefined,
      duration: fullDur,
      occurrences: occurrences.map(({ timeSec, lineTimes, lineEnds, wordTimes }) => ({
        timeSec,
        lineTimes,
        lineEnds,
        wordTimes,
      })),
      songLineTimes,
      songTimedBlocks: timed,
    };
    matchCache.set(cacheKey, out);
    return out;
  } catch {
    return empty(durationHint > 0 ? durationHint : null);
  }
}
