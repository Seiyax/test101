import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PlaybackVisualState } from '../engine/canvasRenderer';
import {
  alignTimelineToAudio,
  analyzePreview,
  estimatePreviewOffset,
  type PreviewAnalysis,
} from '../engine/audioAlign';
import {
  buildKaraokeTimeline,
  cardLines,
  computeKaraokeFrame,
  type KaraokeTimeline,
  type VocalEnvelope,
} from '../engine/karaoke';
import {
  matchLyricTimestamp,
  type InlineWordTime,
  type LyricOccurrence,
  type TimedLyricBlock,
} from '../services/lyricsService';
import { findTrackPreview } from '../services/musicSearch';

interface UseAudioPreviewOptions {
  title: string;
  artist: string;
  lyrics: string;
  songDuration?: number;
  onToast?: (msg: string, isError?: boolean) => void;
  onEnsureProgressBarVisible?: () => void;
}

export interface AudioPreviewController {
  isPlaying: boolean;
  isLoading: boolean;
  isSimulated: boolean;
  hasPreviewUrl: boolean;
  previewUrl: string | null;
  /** Song time of the first card line */
  anchorTimeSec: number;
  /** Song time of every card line */
  lineTimes: number[];
  /** Song time where the audio clip begins (0 for full tracks, >0 for 30s excerpts) */
  previewOffset: number | null;
  /** True when the card lyrics are actually audible inside the loaded audio */
  lyricsInPreview: boolean;
  /** Manual fine-tune (seconds) added to the detected preview offset */
  syncNudge: number;
  setSyncNudge: (sec: number) => void;
  progress: number;
  currentTime: number;
  duration: number;
  /** Static snapshot for paused rendering & image exports */
  canvasPlayback: PlaybackVisualState;
  /** Live karaoke frame read straight from the audio clock (null when not playing) */
  getLivePlayback: () => PlaybackVisualState | null;
  /** Vocal envelope positioned on the song timeline (null if not aligned) */
  getVocalEnvelope: () => VocalEnvelope | null;
  getPreviewAnalysis: () => PreviewAnalysis | null;
  togglePlay: () => Promise<void>;
  seek: (nextProgress: number) => void;
  setTrackPreview: (previewUrl: string | null, durationSec?: number) => void;
  syncToLyricTimestamp: (
    lyricTimeSec?: number,
    fullDurationSec?: number,
    explicitLineTimes?: number[],
    explicitLineEnds?: number[]
  ) => void;
}

type ClockMode = 'idle' | 'audio' | 'sim';

const LEAD_IN_SEC = 0.3;
const SIM_MAX_SEC = 30;

function buildTrackAudioUrl(
  title: string,
  artist: string,
  durationSec: number,
  fallbackPreviewUrl?: string | null
): string | null {
  const cleanT = title.trim();
  const cleanA = artist.trim();
  if (!cleanT) return fallbackPreviewUrl || null;
  // Skip full-track proxy for the built-in fictional placeholder demo card unless it has a fallback URL
  if (
    cleanT.toLowerCase() === 'neon hour' &&
    cleanA.toLowerCase() === 'night market' &&
    !fallbackPreviewUrl
  ) {
    return null;
  }
  const params = new URLSearchParams();
  params.set('title', cleanT);
  if (cleanA) params.set('artist', cleanA);
  if (durationSec > 0) {
    params.set('duration', String(Math.round(durationSec)));
  }
  if (fallbackPreviewUrl && /^https?:\/\//i.test(fallbackPreviewUrl)) {
    params.set('fallbackUrl', fallbackPreviewUrl);
  }
  return `/api/audio-proxy?${params.toString()}`;
}

async function seekAndPlayAudio(
  audio: HTMLAudioElement,
  src: string,
  targetTimeSec: number
): Promise<void> {
  if (audio.src !== src) {
    audio.src = src;
    audio.load();
  }

  // Wait until HTML5 <audio> has parsed metadata (readyState >= 1) before assigning currentTime;
  // setting currentTime while readyState === 0 is ignored by browsers and resets playback to 0:00.
  if (audio.readyState < 1) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        resolve();
      }, 6000);
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onErr = () => {
        cleanup();
        reject(new Error('Failed to load audio stream'));
      };
      const cleanup = () => {
        clearTimeout(timer);
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('canplay', onLoaded);
        audio.removeEventListener('error', onErr);
      };
      audio.addEventListener('loadedmetadata', onLoaded, { once: true });
      audio.addEventListener('canplay', onLoaded, { once: true });
      audio.addEventListener('error', onErr, { once: true });
    });
  }

  const maxSeek =
    Number.isFinite(audio.duration) && audio.duration > 1
      ? Math.max(0, audio.duration - 0.5)
      : targetTimeSec;
  const clampedTarget = Math.max(0, Math.min(targetTimeSec, maxSeek));

  try {
    audio.currentTime = clampedTarget;
  } catch {
    // ignore before play
  }

  await audio.play();

  // Re-assert currentTime right after play() in case the browser reset it to 0 on initial start
  if (Math.abs(audio.currentTime - clampedTarget) > 0.45) {
    try {
      audio.currentTime = clampedTarget;
    } catch {
      // ignore
    }
  }
}

export function useAudioPreview({
  title,
  artist,
  lyrics,
  songDuration = 0,
  onToast,
  onEnsureProgressBarVisible,
}: UseAudioPreviewOptions): AudioPreviewController {
  const [rawPreviewUrl, setRawPreviewUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [duration, setDuration] = useState<number>(
    songDuration > 0 ? songDuration : 211
  );
  const [progress, setProgress] = useState(0.38);
  const [anchorTimeSec, setAnchorTimeSec] = useState<number>(
    Math.round(0.38 * 211)
  );
  const [lineTimes, setLineTimes] = useState<number[]>([]);
  const [lineEnds, setLineEnds] = useState<number[]>([]);
  const [wordTimes, setWordTimes] = useState<
    (InlineWordTime[] | undefined)[] | undefined
  >(undefined);
  const [occurrences, setOccurrences] = useState<LyricOccurrence[]>([]);
  const [songTimedBlocks, setSongTimedBlocks] = useState<TimedLyricBlock[]>([]);
  const [previewOffset, setPreviewOffset] = useState<number | null>(null);
  const [lyricsInPreview, setLyricsInPreview] = useState(false);
  const [syncNudge, setSyncNudge] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lookedUpKeyRef = useRef('');
  const analysisRef = useRef<PreviewAnalysis | null>(null);
  const hasUserScrubbedRef = useRef(false);
  const explicitSelectionRef = useRef<{
    lyrics: string;
    anchor: number;
    lineTimes: number[];
    lineEnds: number[];
  } | null>(null);

  const durationRef = useRef(duration);
  durationRef.current = duration;
  const anchorRef = useRef(anchorTimeSec);
  anchorRef.current = anchorTimeSec;
  const lineTimesRef = useRef(lineTimes);
  lineTimesRef.current = lineTimes;
  const lineEndsRef = useRef(lineEnds);
  lineEndsRef.current = lineEnds;
  const songTimedBlocksRef = useRef(songTimedBlocks);
  songTimedBlocksRef.current = songTimedBlocks;
  const offsetRef = useRef<number | null>(previewOffset);
  offsetRef.current = previewOffset;
  const nudgeRef = useRef(syncNudge);
  nudgeRef.current = syncNudge;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const rawPreviewRef = useRef(rawPreviewUrl);
  rawPreviewRef.current = rawPreviewUrl;

  /** Single song clock: song time = base + audio.currentTime (audio) or wall-clock (sim) */
  const clockRef = useRef<{
    mode: ClockMode;
    base: number;
    wallStart: number;
    synced: boolean;
  }>({
    mode: 'idle',
    base: 0,
    wallStart: 0,
    synced: false,
  });
  const playStartProgressRef = useRef(0.38);

  // Cache for dynamically paged 4-line stanzas when audio plays past the card's 4 lines
  const pageTimelineCacheRef = useRef<
    Map<string, { lyrics: string; timeline: KaraokeTimeline }>
  >(new Map());

  const computeAlignedTimeline = useCallback(
    (
      rawLyrics: string,
      anchor: number,
      lTimes: number[],
      lEnds: number[],
      wTimes?: (InlineWordTime[] | undefined)[],
      customOffset?: number | null
    ): KaraokeTimeline => {
      const base = buildKaraokeTimeline(
        cardLines(rawLyrics),
        anchor,
        lTimes,
        lEnds,
        wTimes
      );
      const analysis = analysisRef.current;
      const off =
        customOffset !== undefined ? customOffset : offsetRef.current;
      if (!analysis) return base;
      const effOffset =
        off !== null
          ? off + nudgeRef.current
          : analysis.isFullTrack
          ? nudgeRef.current
          : (base.starts[0] ?? anchor) - analysis.firstVocalSec;
      return alignTimelineToAudio(base, analysis, effOffset);
    },
    []
  );

  const timelineRef = useRef<KaraokeTimeline>(
    buildKaraokeTimeline(cardLines(lyrics), anchorTimeSec, lineTimes, lineEnds)
  );

  useEffect(() => {
    pageTimelineCacheRef.current.clear();
    timelineRef.current = computeAlignedTimeline(
      lyrics,
      anchorTimeSec,
      lineTimes,
      lineEnds,
      wordTimes,
      previewOffset
    );
  }, [
    lyrics,
    anchorTimeSec,
    lineTimes,
    lineEnds,
    wordTimes,
    previewOffset,
    syncNudge,
    computeAlignedTimeline,
  ]);

  useEffect(() => {
    if (songDuration > 0) setDuration(songDuration);
  }, [songDuration]);

  const getSongTime = useCallback((): number => {
    const c = clockRef.current;
    if (c.mode === 'audio' && audioRef.current) {
      return c.base + audioRef.current.currentTime;
    }
    if (c.mode === 'sim') {
      return c.base + (performance.now() - c.wallStart) / 1000;
    }
    return progressRef.current * durationRef.current;
  }, []);

  const getVocalEnvelope = useCallback((): VocalEnvelope | null => {
    const a = analysisRef.current;
    if (!a) return null;
    const c = clockRef.current;
    if (c.mode === 'audio') {
      return {
        cumulative: a.cumulative,
        rate: a.rate,
        songOffset: c.base,
      };
    }
    const off = offsetRef.current ?? (a.isFullTrack ? 0 : null);
    if (off === null) return null;
    return {
      cumulative: a.cumulative,
      rate: a.rate,
      songOffset: off + nudgeRef.current,
    };
  }, []);

  const getPreviewAnalysis = useCallback(() => analysisRef.current, []);

  const stopTicker = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const stopAll = useCallback(() => {
    stopTicker();
    audioRef.current?.pause();
    clockRef.current = { mode: 'idle', base: 0, wallStart: 0, synced: false };
    setIsPlaying(false);
    setIsSimulated(false);
  }, [stopTicker]);

  const resetToAnchor = useCallback(() => {
    hasUserScrubbedRef.current = false;
    const frac = Math.min(
      1,
      Math.max(0, anchorRef.current / Math.max(1, durationRef.current))
    );
    setProgress(frac);
  }, []);

  // 1. Resolve full-track audio URL + full duration, then match card lyrics → exact per-line song timestamps
  useEffect(() => {
    const cleanT = title.trim();
    const cleanA = artist.trim();
    if (!cleanT || !cleanA) return;

    let alive = true;
    const timer = setTimeout(async () => {
      const key = `${cleanT}|${cleanA}`.toLowerCase();
      let knownDur = songDuration > 0 ? songDuration : 0;
      let itunesPreview = rawPreviewRef.current;

      if (lookedUpKeyRef.current !== key) {
        lookedUpKeyRef.current = key;
        const found = await findTrackPreview(cleanT, cleanA);
        if (!alive) return;
        itunesPreview = found.previewUrl;
        setRawPreviewUrl(found.previewUrl);
        if (found.duration > 0) {
          knownDur = found.duration;
          setDuration(found.duration);
        }
      }

      const matched = await matchLyricTimestamp(
        cleanA,
        cleanT,
        lyrics,
        knownDur
      );
      if (!alive) return;

      const resolvedDur =
        matched.duration && matched.duration > 0
          ? matched.duration
          : knownDur > 0
          ? knownDur
          : durationRef.current;
      if (resolvedDur > 0) setDuration(resolvedDur);

      const fullAudioUrl = buildTrackAudioUrl(
        cleanT,
        cleanA,
        resolvedDur,
        itunesPreview
      );
      setPreviewUrl((prev) => (prev === fullAudioUrl ? prev : fullAudioUrl));

      setOccurrences(matched.occurrences);
      setSongTimedBlocks(matched.songTimedBlocks);

      // Respect explicit lines chosen by the user in LyricsModal if they match the current text
      const explicit = explicitSelectionRef.current;
      if (
        explicit &&
        explicit.lyrics.trim() === lyrics.trim() &&
        explicit.lineTimes.length > 0
      ) {
        setLineTimes(explicit.lineTimes);
        setLineEnds(explicit.lineEnds);
        setAnchorTimeSec(explicit.anchor);
        if (clockRef.current.mode === 'idle') {
          setProgress(explicit.anchor / Math.max(1, resolvedDur));
        }
        return;
      }

      setLineTimes(matched.lineTimes);
      setLineEnds(matched.lineEnds);
      setWordTimes(matched.wordTimes);

      if (typeof matched.timeSec === 'number' && resolvedDur > 0) {
        const clamped = Math.min(
          Math.max(0, matched.timeSec),
          Math.max(1, resolvedDur - 1)
        );
        setAnchorTimeSec(clamped);
        hasUserScrubbedRef.current = false;
        if (clockRef.current.mode === 'idle') {
          setProgress(clamped / resolvedDur);
        }
      }
    }, 150);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [title, artist, lyrics, songDuration]);

  // 2. Decode the track audio & calibrate offset against LRC timestamps
  useEffect(() => {
    if (!previewUrl) {
      setPreviewOffset(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const analysis = await analyzePreview(previewUrl);
        if (!alive || !analysis) return;
        analysisRef.current = analysis;
        if (songTimedBlocks.length < 2) {
          setPreviewOffset(analysis.isFullTrack ? 0 : null);
          return;
        }
        const al = estimatePreviewOffset(
          analysis,
          songTimedBlocks,
          durationRef.current,
          `${previewUrl}|${songTimedBlocks.length}|${songTimedBlocks[0]?.timeSec}`
        );
        if (alive) {
          setPreviewOffset(al ? al.offset : analysis.isFullTrack ? 0 : null);
        }
      } catch {
        if (alive) setPreviewOffset(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [previewUrl, songTimedBlocks]);

  // 3. Check if card lyrics are audible inside the loaded audio (always true for full tracks!)
  useEffect(() => {
    const analysis = analysisRef.current;
    const clip = analysis?.duration ?? 30;
    if (previewOffset === null) {
      setLyricsInPreview(false);
      return;
    }

    // When we have the full-length track, ANY occurrence (including the user's explicit selection at 2:25) is audible!
    if (analysis?.isFullTrack) {
      setLyricsInPreview(true);
      return;
    }

    if (!occurrences.length) {
      setLyricsInPreview(false);
      return;
    }

    const lo = previewOffset + syncNudge;
    const hi = lo + clip;

    // If the user's current anchor is already inside [lo - 0.85, hi - 1.2], keep it!
    if (anchorRef.current >= lo - 0.85 && anchorRef.current <= hi - 1.2) {
      setLyricsInPreview(true);
      return;
    }

    let bestOcc: LyricOccurrence | null = null;
    let bestInCount = 0;

    for (const occ of occurrences) {
      let inCount = 0;
      for (const lt of occ.lineTimes) {
        if (lt >= lo - 0.85 && lt <= hi - 1.2) {
          inCount++;
        }
      }
      if (inCount > bestInCount) {
        bestInCount = inCount;
        bestOcc = occ;
      }
    }

    if (bestOcc && bestInCount > 0) {
      setLyricsInPreview(true);
      setLineTimes(bestOcc.lineTimes);
      setLineEnds(bestOcc.lineEnds);
      setWordTimes(bestOcc.wordTimes);
      setAnchorTimeSec(bestOcc.timeSec);
      if (clockRef.current.mode === 'idle') {
        setProgress(
          Math.min(
            1,
            Math.max(0, bestOcc.timeSec / Math.max(1, durationRef.current))
          )
        );
      }
    } else {
      setLyricsInPreview(false);
    }
  }, [previewOffset, occurrences, syncNudge]);

  const getAudio = useCallback((): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = 'auto';
      a.crossOrigin = 'anonymous';
      a.addEventListener('ended', () => {
        stopTicker();
        clockRef.current = {
          mode: 'idle',
          base: 0,
          wallStart: 0,
          synced: false,
        };
        setIsPlaying(false);
        resetToAnchor();
      });
      audioRef.current = a;
    }
    return audioRef.current;
  }, [resetToAnchor, stopTicker]);

  useEffect(() => {
    return () => {
      stopTicker();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [stopTicker]);

  /** UI progress at 15 Hz — the 3D card itself reads the live audio clock at 60 fps */
  const startTicker = useCallback(() => {
    stopTicker();
    tickRef.current = setInterval(() => {
      const c = clockRef.current;
      if (c.mode === 'idle') return;
      const t = getSongTime();
      const dur = Math.max(1, durationRef.current);
      if (
        c.mode === 'sim' &&
        (performance.now() - c.wallStart) / 1000 > SIM_MAX_SEC
      ) {
        stopTicker();
        clockRef.current = {
          mode: 'idle',
          base: 0,
          wallStart: 0,
          synced: false,
        };
        setIsPlaying(false);
        setIsSimulated(false);
        resetToAnchor();
        return;
      }
      setProgress(Math.min(1, Math.max(0, t / dur)));
    }, 66);
  }, [getSongTime, resetToAnchor, stopTicker]);

  const setTrackPreview = useCallback(
    (nextUrl: string | null, durationSec = 0) => {
      stopAll();
      hasUserScrubbedRef.current = false;
      setRawPreviewUrl(nextUrl);
      rawPreviewRef.current = nextUrl;
      const fullDur = durationSec > 0 ? durationSec : 211;
      const nextFullUrl = buildTrackAudioUrl(
        title,
        artist,
        fullDur,
        nextUrl
      );
      setPreviewUrl(nextFullUrl);
      analysisRef.current = null;
      explicitSelectionRef.current = null;
      pageTimelineCacheRef.current.clear();
      setPreviewOffset(null);
      setSyncNudge(0);
      lookedUpKeyRef.current = nextUrl
        ? `${title.trim()}|${artist.trim()}`.toLowerCase()
        : '';
      setDuration(fullDur);
      setAnchorTimeSec(Math.round(fullDur * 0.38));
      setLineTimes([]);
      setLineEnds([]);
      setWordTimes(undefined);
      setOccurrences([]);
      setSongTimedBlocks([]);
      setProgress(0.38);
      if (audioRef.current) audioRef.current.src = '';
    },
    [stopAll, title, artist]
  );

  const syncToLyricTimestamp = useCallback(
    (
      lyricTimeSec?: number,
      fullDurationSec?: number,
      explicitLineTimes?: number[],
      explicitLineEnds?: number[]
    ) => {
      hasUserScrubbedRef.current = false;
      const resolvedDur =
        fullDurationSec && fullDurationSec > 0
          ? fullDurationSec
          : durationRef.current;
      if (fullDurationSec && fullDurationSec > 0) {
        durationRef.current = fullDurationSec;
        setDuration(fullDurationSec);
      }

      if (typeof lyricTimeSec === 'number' && resolvedDur > 0) {
        const clamped = Math.min(
          Math.max(0, lyricTimeSec),
          Math.max(1, resolvedDur - 1)
        );
        anchorRef.current = clamped;
        setAnchorTimeSec(clamped);

        if (explicitLineTimes && explicitLineTimes.length > 0) {
          explicitSelectionRef.current = {
            lyrics,
            anchor: clamped,
            lineTimes: explicitLineTimes,
            lineEnds: explicitLineEnds ?? [],
          };
          lineTimesRef.current = explicitLineTimes;
          lineEndsRef.current = explicitLineEnds ?? [];
          setLineTimes(explicitLineTimes);
          setLineEnds(explicitLineEnds ?? []);
        } else {
          explicitSelectionRef.current = null;
        }

        const nextFrac = clamped / Math.max(1, resolvedDur);
        playStartProgressRef.current = nextFrac;
        setProgress(nextFrac);

        // If audio is currently playing, immediately jump the audio to the newly selected lyric timestamp (e.g. 2:25)!
        const c = clockRef.current;
        if (c.mode === 'audio' && audioRef.current) {
          const clipTarget = Math.max(0, clamped - LEAD_IN_SEC - c.base);
          const maxDur =
            audioRef.current.duration ||
            analysisRef.current?.duration ||
            resolvedDur;
          if (clipTarget >= 0 && clipTarget < maxDur) {
            try {
              audioRef.current.currentTime = clipTarget;
            } catch {
              // ignore
            }
          }
        } else if (c.mode === 'sim') {
          c.base = Math.max(0, clamped - LEAD_IN_SEC);
          c.wallStart = performance.now();
        }
      }
    },
    [lyrics]
  );

  const startSimulated = useCallback(
    (startSong: number, msg?: string) => {
      clockRef.current = {
        mode: 'sim',
        base: startSong,
        wallStart: performance.now(),
        synced: false,
      };
      setIsSimulated(true);
      setIsPlaying(true);
      onEnsureProgressBarVisible?.();
      if (msg) onToast?.(msg);
      startTicker();
    },
    [onEnsureProgressBarVisible, onToast, startTicker]
  );

  const togglePlay = useCallback(async () => {
    if (clockRef.current.mode !== 'idle') {
      const t = getSongTime();
      stopAll();
      setProgress(
        Math.min(1, Math.max(0, t / Math.max(1, durationRef.current)))
      );
      return;
    }

    onEnsureProgressBarVisible?.();

    let activeUrl = previewUrl;
    const currentKey = `${title.trim()}|${artist.trim()}`.toLowerCase();
    if (!activeUrl && title.trim()) {
      setIsLoading(true);
      lookedUpKeyRef.current = currentKey;
      const found = await findTrackPreview(title, artist);
      if (found.previewUrl) {
        rawPreviewRef.current = found.previewUrl;
        setRawPreviewUrl(found.previewUrl);
      }
      if (found.duration > 0) {
        durationRef.current = found.duration;
        setDuration(found.duration);
      }
      activeUrl = buildTrackAudioUrl(
        title,
        artist,
        durationRef.current,
        found.previewUrl
      );
      setPreviewUrl(activeUrl);
      setIsLoading(false);
    }

    // Ensure full-track audio analysis & lyric timestamp matching are ready BEFORE starting playback
    // so if the lyric is at 2:25, the audio seeks straight to 2:25 on the very first click!
    let analysis = analysisRef.current;
    let activeBlocks = songTimedBlocksRef.current;
    let activeOffset = offsetRef.current;
    let activeLineTimes = lineTimesRef.current;
    let activeLineEnds = lineEndsRef.current;
    let activeAnchor = anchorRef.current;

    if (activeUrl && (!analysis || activeOffset === null || !activeLineTimes.length)) {
      setIsLoading(true);
      try {
        const [decoded, matched] = await Promise.all([
          analysis ? Promise.resolve(analysis) : analyzePreview(activeUrl),
          activeBlocks.length > 0 && activeLineTimes.length > 0
            ? Promise.resolve(null)
            : matchLyricTimestamp(
                artist.trim(),
                title.trim(),
                lyrics,
                durationRef.current
              ),
        ]);
        if (decoded) {
          analysis = decoded;
          analysisRef.current = decoded;
        }
        if (matched) {
          if (matched.duration && matched.duration > 0) {
            durationRef.current = matched.duration;
            setDuration(matched.duration);
          }
          activeBlocks = matched.songTimedBlocks;
          songTimedBlocksRef.current = matched.songTimedBlocks;
          setSongTimedBlocks(matched.songTimedBlocks);
          setOccurrences(matched.occurrences);
          if (!activeLineTimes.length && matched.lineTimes.length) {
            activeLineTimes = matched.lineTimes;
            activeLineEnds = matched.lineEnds;
            lineTimesRef.current = matched.lineTimes;
            lineEndsRef.current = matched.lineEnds;
            setLineTimes(matched.lineTimes);
            setLineEnds(matched.lineEnds);
          }
          if (
            typeof matched.timeSec === 'number' &&
            !explicitSelectionRef.current
          ) {
            activeAnchor = matched.timeSec;
            anchorRef.current = matched.timeSec;
            setAnchorTimeSec(matched.timeSec);
          }
        }
        if (analysis && activeOffset === null) {
          if (activeBlocks.length >= 2) {
            const al = estimatePreviewOffset(
              analysis,
              activeBlocks,
              durationRef.current,
              `${activeUrl}|${activeBlocks.length}|${activeBlocks[0]?.timeSec}`
            );
            activeOffset = al ? al.offset : analysis.isFullTrack ? 0 : null;
          } else if (analysis.isFullTrack) {
            activeOffset = 0;
          }
          offsetRef.current = activeOffset;
          setPreviewOffset(activeOffset);
        }
      } catch {
        // continue with best available timeline
      } finally {
        setIsLoading(false);
      }
    }

    const dur = Math.max(1, durationRef.current);

    if (!activeUrl) {
      const firstS = timelineRef.current.starts[0] ?? activeAnchor;
      const startSong = Math.max(0, firstS - LEAD_IN_SEC);
      playStartProgressRef.current = startSong / dur;
      startSimulated(
        startSong,
        'No audio stream found for this track — simulating synced word-by-word karaoke.'
      );
      return;
    }

    const audio = getAudio();
    if (!audio) return;

    try {
      setIsSimulated(false);

      const clipLen = analysis?.duration ?? dur;
      const isFull = Boolean(analysis?.isFullTrack || clipLen >= 45);
      const resolvedOffset = activeOffset ?? (isFull ? 0 : null);

      let base = 0;
      let clipStart = 0;
      let synced = true;

      if (resolvedOffset !== null) {
        const b = resolvedOffset + nudgeRef.current;
        timelineRef.current = computeAlignedTimeline(
          lyrics,
          activeAnchor,
          activeLineTimes,
          activeLineEnds,
          wordTimes,
          resolvedOffset
        );

        const firstLineStart = timelineRef.current.starts[0] ?? activeAnchor;
        const lastLineEnd =
          timelineRef.current.ends[timelineRef.current.ends.length - 1] ??
          firstLineStart + 10;

        // Check if the card's lyric timestamp (e.g. 2:25 = 145s) lies within the loaded audio buffer
        const cardInClip =
          isFull ||
          (firstLineStart >= b - 0.85 &&
            firstLineStart <= b + clipLen - 1.2);

        if (cardInClip) {
          // Only resume mid-stanza if the user explicitly scrubbed there;
          // otherwise ALWAYS start right at the card's first lyric timestamp (e.g. 2:25)!
          const curSongPos = progressRef.current * dur;
          const isMidStanza =
            hasUserScrubbedRef.current &&
            curSongPos >= firstLineStart - 0.4 &&
            curSongPos < lastLineEnd - 0.4;
          const targetSong = isMidStanza
            ? curSongPos
            : Math.max(0, firstLineStart - LEAD_IN_SEC);

          base = b;
          clipStart = Math.min(
            Math.max(0, clipLen - 1),
            Math.max(0, targetSong - b)
          );
          synced = true;
        } else {
          // Fallback only if full track was unavailable and a 30s preview covers a different section
          base = b;
          const firstPreviewBlock = activeBlocks.find(
            (blk) =>
              typeof blk.timeSec === 'number' &&
              blk.timeSec >= b - 0.3 &&
              blk.timeSec <= b + clipLen - 2
          );
          const targetSong =
            firstPreviewBlock && typeof firstPreviewBlock.timeSec === 'number'
              ? Math.max(b, firstPreviewBlock.timeSec - LEAD_IN_SEC)
              : b + Math.max(0, (analysis?.firstVocalSec ?? 0) - LEAD_IN_SEC);
          clipStart = Math.min(
            Math.max(0, clipLen - 1.5),
            Math.max(0, targetSong - b)
          );
          synced = true;
        }
      } else {
        // Track without LRC timestamps: if full track, play directly at the anchor timestamp;
        // if 30s excerpt, align first word to first vocal entry.
        const firstLineStart = timelineRef.current.starts[0] ?? activeAnchor;
        if (isFull) {
          base = 0;
          clipStart = Math.max(
            0,
            Math.min(clipLen - 1, firstLineStart - LEAD_IN_SEC)
          );
        } else {
          const firstVocal = analysis?.firstVocalSec ?? 0;
          clipStart = Math.max(0, firstVocal - LEAD_IN_SEC);
          base = firstLineStart - firstVocal;
        }
        timelineRef.current = computeAlignedTimeline(
          lyrics,
          activeAnchor,
          activeLineTimes,
          activeLineEnds,
          wordTimes,
          base - nudgeRef.current
        );
        synced = true;
      }

      const actualStartSong = base + clipStart;
      playStartProgressRef.current = Math.min(
        1,
        Math.max(0, actualStartSong / dur)
      );
      setProgress(playStartProgressRef.current);

      // Play from the in-memory Blob URL when decoded so seeking to 2:25 is 100% instant & reliable
      const playSrc = analysis?.blobUrl || activeUrl;
      clockRef.current = {
        mode: 'audio',
        base,
        wallStart: performance.now(),
        synced,
      };
      await seekAndPlayAudio(audio, playSrc, clipStart);
      setIsPlaying(true);
      startTicker();
    } catch (err: unknown) {
      clockRef.current = {
        mode: 'idle',
        base: 0,
        wallStart: 0,
        synced: false,
      };
      const firstS = timelineRef.current.starts[0] ?? activeAnchor;
      const startSong = Math.max(0, firstS - LEAD_IN_SEC);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        onToast?.(
          'Tap Play again to allow audio playback on your device.',
          true
        );
      } else {
        startSimulated(
          startSong,
          'Audio stream blocked or unavailable — simulating synced word-by-word karaoke.'
        );
      }
    }
  }, [
    artist,
    computeAlignedTimeline,
    getAudio,
    getSongTime,
    lyrics,
    onEnsureProgressBarVisible,
    onToast,
    previewUrl,
    startSimulated,
    startTicker,
    stopAll,
    title,
    wordTimes,
  ]);

  const seek = useCallback(
    (nextProgress: number) => {
      hasUserScrubbedRef.current = true;
      const clamped = Math.min(1, Math.max(0, nextProgress));
      const dur = Math.max(1, durationRef.current);
      const targetSec = clamped * dur;
      setProgress(clamped);
      onEnsureProgressBarVisible?.();
      const c = clockRef.current;
      if (c.mode === 'audio' && audioRef.current) {
        const clipT = targetSec - c.base;
        const clipLen =
          audioRef.current.duration ||
          analysisRef.current?.duration ||
          dur;
        if (clipT >= 0 && clipT < clipLen) {
          audioRef.current.currentTime = clipT;
        } else {
          c.base = targetSec - audioRef.current.currentTime;
        }
      } else if (c.mode === 'sim') {
        c.base = targetSec;
        c.wallStart = performance.now();
      }
    },
    [onEnsureProgressBarVisible]
  );

  /**
   * Resolves the 60fps word-by-word karaoke frame locked to the live audio clock.
   * When the song plays through the card's lines (e.g. at 2:25), highlights those exact words;
   * when the song continues playing past the card's 4th line, dynamically tracks the current
   * 4-line stanza from `songTimedBlocks` so the lyrics on the card are ALWAYS 100% synced.
   */
  const getLivePlayback = useCallback((): PlaybackVisualState | null => {
    const c = clockRef.current;
    if (c.mode === 'idle') return null;
    const t = getSongTime();
    const dur = Math.max(1, durationRef.current);
    const vocalEnv = getVocalEnvelope();

    const staticTl = timelineRef.current;
    const staticFirst = staticTl.starts[0] ?? 0;
    const staticLast =
      staticTl.ends[staticTl.ends.length - 1] ?? staticFirst + 8;

    const blocks = songTimedBlocksRef.current;
    const inStaticWindow =
      t >= staticFirst - 0.9 && t <= staticLast + 0.45;

    if (!inStaticWindow && blocks.length >= 2) {
      let activeIdx = -1;
      for (let i = 0; i < blocks.length; i++) {
        const bt = blocks[i].timeSec;
        if (typeof bt === 'number' && t + 0.1 >= bt) {
          activeIdx = i;
        }
      }
      if (activeIdx >= 0) {
        const effOff = (offsetRef.current ?? 0) + nudgeRef.current;
        // Anchor 4-line pages relative to the card's static stanza so continuing past line 4 starts cleanly at line 5
        let cardEndBlockIdx = -1;
        for (let i = 0; i < blocks.length; i++) {
          const bt = blocks[i].timeSec;
          if (typeof bt === 'number' && Math.abs(bt - staticFirst) <= 0.6) {
            cardEndBlockIdx = i + staticTl.lines.length;
            break;
          }
        }
        const anchorIdx = cardEndBlockIdx >= 0 ? cardEndBlockIdx : 0;
        const rel = activeIdx - anchorIdx;
        const pageStart = Math.max(
          0,
          rel >= 0
            ? anchorIdx + Math.floor(rel / 4) * 4
            : Math.floor(activeIdx / 4) * 4
        );
        const pageKey = `${pageStart}|${effOff.toFixed(2)}`;
        let pageEntry = pageTimelineCacheRef.current.get(pageKey);
        if (!pageEntry) {
          const slice = blocks.slice(pageStart, pageStart + 4);
          const pageLyrics = slice.map((b) => b.text).join('\n');
          const pStarts = slice.map((b) => b.timeSec as number);
          const pEnds = slice.map(
            (b, idx) =>
              b.endTimeSec ??
              (slice[idx + 1]?.timeSec as number | undefined) ??
              (b.timeSec as number) + 3.0
          );
          const pWords = slice.map((b) => b.words);
          const basePageTl = buildKaraokeTimeline(
            slice.map((b) => b.text),
            pStarts[0] ?? t,
            pStarts,
            pEnds,
            pWords
          );
          const alignedPageTl = alignTimelineToAudio(
            basePageTl,
            analysisRef.current,
            effOff
          );
          pageEntry = { lyrics: pageLyrics, timeline: alignedPageTl };
          pageTimelineCacheRef.current.set(pageKey, pageEntry);
        }

        const pageFrame = computeKaraokeFrame(
          pageEntry.timeline,
          t,
          vocalEnv
        );
        return {
          progress: Math.min(1, Math.max(0, t / dur)),
          currentTime: t,
          duration: dur,
          isPlaying: true,
          activeLyrics: pageEntry.lyrics,
          ...pageFrame,
        };
      }
    }

    const frame = computeKaraokeFrame(staticTl, t, vocalEnv);
    return {
      progress: Math.min(1, Math.max(0, t / dur)),
      currentTime: t,
      duration: dur,
      isPlaying: true,
      ...frame,
    };
  }, [getSongTime, getVocalEnvelope]);

  const currentTime = progress * duration;
  // Frozen during playback so the card texture isn't redrawn by React — the live clock drives it at 60fps
  const staticProgress = isPlaying ? playStartProgressRef.current : progress;

  const canvasPlayback = useMemo<PlaybackVisualState>(
    () => ({
      progress: staticProgress,
      currentTime: Math.round(staticProgress * duration),
      duration,
      isPlaying,
    }),
    [staticProgress, duration, isPlaying]
  );

  return useMemo<AudioPreviewController>(
    () => ({
      isPlaying,
      isLoading,
      isSimulated,
      hasPreviewUrl: Boolean(previewUrl),
      previewUrl,
      anchorTimeSec,
      lineTimes,
      previewOffset,
      lyricsInPreview,
      syncNudge,
      setSyncNudge,
      progress,
      currentTime,
      duration,
      canvasPlayback,
      getLivePlayback,
      getVocalEnvelope,
      getPreviewAnalysis,
      togglePlay,
      seek,
      setTrackPreview,
      syncToLyricTimestamp,
    }),
    [
      anchorTimeSec,
      canvasPlayback,
      currentTime,
      duration,
      getLivePlayback,
      getPreviewAnalysis,
      getVocalEnvelope,
      isLoading,
      isPlaying,
      isSimulated,
      lineTimes,
      lyricsInPreview,
      previewOffset,
      previewUrl,
      progress,
      seek,
      setTrackPreview,
      syncNudge,
      syncToLyricTimestamp,
      togglePlay,
    ]
  );
}
