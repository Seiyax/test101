import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CardState,
  HistorySnapshot,
  LayoutKey,
  ThemeKey,
} from '../types';
import { THEME_GLARE } from '../engine/constants';
import {
  decodeLookHash,
  loadSettings,
  saveSettings,
} from '../utils/storage';

const DEFAULT_STATE: CardState = {
  title: 'Neon Hour',
  artist: 'Night Market',
  lyrics: 'City lights on the glass\nYour name in the static\nWe keep the chorus on\nUntil the room goes quiet',
  coverUrl: '',
  color: '#1DB954',
  theme: 'classic',
  layoutKey: 'square',
  coverShape: 'auto',
  lyricFont: 'auto',
  align: 'left',
  hlLine: -1,
  bgStyle: 'none',
  glareStyle: 'diagonal',
  glare: 70,
  glareAuto: true,
  cardDepth: 32,
  autoFit: true,
  lyricSize: 48,
  transparent: false,
  scale: 2,
  fmt: 'png',
  autoColor: true,
  hide: {
    cover: false,
    title: false,
    artist: false,
    logo: false,
    bar: true,
    code: true,
  },
  trackId: null,
  preset: null,
};

function toSnapshot(s: CardState): HistorySnapshot {
  return {
    color: s.color,
    theme: s.theme,
    title: s.title,
    artist: s.artist,
    lyrics: s.lyrics,
    layoutKey: s.layoutKey,
  };
}

export function useCardState() {
  // Start with deterministic DEFAULT_STATE so SSR and initial client hydration match.
  const [state, setStateInternal] = useState<CardState>(DEFAULT_STATE);

  const [songMeta, setSongMeta] = useState<{
    title: string;
    artist: string;
    duration: number;
  } | null>(null);

  const hydratedRef = useRef(false);
  const skipNextHistoryRef = useRef(false);

  // Undo / Redo history stack
  const historyRef = useRef<HistorySnapshot[]>([toSnapshot(DEFAULT_STATE)]);
  const historyIndexRef = useRef<number>(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateHistoryState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const pushHistory = useCallback(
    (snapshot: HistorySnapshot) => {
      const history = historyRef.current;
      const curIndex = historyIndexRef.current;
      const cur = history[curIndex];
      if (
        cur &&
        cur.color === snapshot.color &&
        cur.theme === snapshot.theme &&
        cur.title === snapshot.title &&
        cur.artist === snapshot.artist &&
        cur.lyrics === snapshot.lyrics &&
        cur.layoutKey === snapshot.layoutKey
      ) {
        return;
      }
      historyRef.current = history.slice(0, curIndex + 1);
      historyRef.current.push(snapshot);
      if (historyRef.current.length > 100) historyRef.current.shift();
      historyIndexRef.current = historyRef.current.length - 1;
      updateHistoryState();
    },
    [updateHistoryState]
  );

  const historyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate saved settings + URL #look= hash once on mount
  useEffect(() => {
    const saved = loadSettings();
    let initial: CardState = {
      ...DEFAULT_STATE,
      ...saved,
      hide: { ...DEFAULT_STATE.hide, ...(saved.hide || {}) },
    };

    const hash = window.location.hash || '';
    const m = /^#look=([A-Za-z0-9_-]{1,6000})$/.exec(hash);
    if (m) {
      try {
        const o = decodeLookHash(m[1]);
        if (o && typeof o === 'object') {
          const nextTheme: ThemeKey = (o.t as ThemeKey) || initial.theme;
          const isCoverHidden = o.cs === 'hidden';
          initial = {
            ...initial,
            theme: nextTheme,
            color: o.c || initial.color,
            glareStyle:
              o.g === 'auto'
                ? ((THEME_GLARE[nextTheme] as CardState['glareStyle']) || 'diagonal')
                : ((o.g as CardState['glareStyle']) || initial.glareStyle),
            glareAuto: o.g === 'auto',
            glare: typeof o.gi === 'number' ? o.gi : initial.glare,
            layoutKey: (o.l as LayoutKey) || initial.layoutKey,
            coverShape: isCoverHidden
              ? initial.coverShape
              : ((o.cs as CardState['coverShape']) || initial.coverShape),
            hide:
              typeof o.cs === 'string'
                ? { ...initial.hide, cover: isCoverHidden }
                : initial.hide,
            lyricFont: (o.lf as CardState['lyricFont']) || initial.lyricFont,
            bgStyle: o.bg || initial.bgStyle,
            cardDepth: typeof o.d === 'number' ? o.d : initial.cardDepth,
            align: o.a || initial.align,
            autoColor: typeof o.ac === 'boolean' ? o.ac : initial.autoColor,
            title: typeof o.ti === 'string' ? o.ti : initial.title,
            artist: typeof o.ar === 'string' ? o.ar : initial.artist,
            lyrics: typeof o.ly === 'string' ? o.ly : initial.lyrics,
            coverUrl: typeof o.cu === 'string' ? o.cu : initial.coverUrl,
          };
        }
      } catch (e) {
        console.warn('Failed to parse look from hash', e);
      }
    }

    historyRef.current = [toSnapshot(initial)];
    historyIndexRef.current = 0;
    skipNextHistoryRef.current = true;
    hydratedRef.current = true;
    setStateInternal(initial);
    updateHistoryState();
  }, [updateHistoryState]);

  // Persist settings and push debounced history outside state updaters
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveSettings(state);

    if (skipNextHistoryRef.current) {
      skipNextHistoryRef.current = false;
      return;
    }

    if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
    const snap = toSnapshot(state);
    historyDebounceRef.current = setTimeout(() => {
      pushHistory(snap);
    }, 400);

    return () => {
      if (historyDebounceRef.current) {
        clearTimeout(historyDebounceRef.current);
        historyDebounceRef.current = null;
      }
    };
  }, [state, pushHistory]);

  const setState = useCallback(
    (updater: Partial<CardState> | ((prev: CardState) => CardState)) => {
      setStateInternal((prev) =>
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      );
    },
    []
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current);
      historyDebounceRef.current = null;
    }
    historyIndexRef.current -= 1;
    const s = historyRef.current[historyIndexRef.current];
    skipNextHistoryRef.current = true;
    setStateInternal((prev) => ({
      ...prev,
      color: s.color,
      theme: s.theme,
      title: s.title,
      artist: s.artist,
      lyrics: s.lyrics,
      layoutKey: s.layoutKey,
    }));
    updateHistoryState();
  }, [updateHistoryState]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current);
      historyDebounceRef.current = null;
    }
    historyIndexRef.current += 1;
    const s = historyRef.current[historyIndexRef.current];
    skipNextHistoryRef.current = true;
    setStateInternal((prev) => ({
      ...prev,
      color: s.color,
      theme: s.theme,
      title: s.title,
      artist: s.artist,
      lyrics: s.lyrics,
      layoutKey: s.layoutKey,
    }));
    updateHistoryState();
  }, [updateHistoryState]);

  // Set theme helper: updates glare if glareAuto is active
  const setTheme = useCallback(
    (theme: ThemeKey) => {
      setState((prev) => ({
        ...prev,
        theme,
        glareStyle: prev.glareAuto
          ? ((THEME_GLARE[theme] as CardState['glareStyle']) || 'diagonal')
          : prev.glareStyle,
      }));
    },
    [setState]
  );

  // Set layout key helper
  const setLayoutKey = useCallback(
    (layoutKey: LayoutKey) => {
      setState((prev) => ({
        ...prev,
        layoutKey,
        preset: null, // clear preset if layout changes
      }));
    },
    [setState]
  );

  return {
    state,
    setState,
    setTheme,
    setLayoutKey,
    songMeta,
    setSongMeta,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
