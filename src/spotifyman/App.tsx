import { Download } from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutSection } from './components/editor/LayoutSection';
import { LooksSection } from './components/editor/LooksSection';
import { SearchSection } from './components/editor/SearchSection';
import { StyleSection } from './components/editor/StyleSection';
import { TextSection } from './components/editor/TextSection';
import { Header } from './components/layout/Header';
import { Stage } from './components/layout/Stage';
import { TabNav, type TabId } from './components/layout/TabNav';
import { Toast } from './components/ui/Toast';

const ExportModal = lazy(() =>
  import('./components/modals/ExportModal').then((m) => ({
    default: m.ExportModal,
  }))
);
const KeyboardHelpModal = lazy(() =>
  import('./components/modals/KeyboardHelpModal').then((m) => ({
    default: m.KeyboardHelpModal,
  }))
);
const LyricsModal = lazy(() =>
  import('./components/modals/LyricsModal').then((m) => ({
    default: m.LyricsModal,
  }))
);
import { LYRIC_FONTS, THEME_GLARE, THEMES } from './engine/constants';
import { incrementFontGen } from './engine/canvasRenderer';
import { useAudioPreview } from './hooks/useAudioPreview';
import { useCardState } from './hooks/useCardState';
import { useTiltInteraction } from './hooks/useTiltInteraction';
import type { CardState, LayoutKey, SearchResult, ThemeKey } from './types';
import { extractCoverColors } from './utils/colorUtils';

export default function App() {
  const {
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
  } = useCardState();

  const {
    tilt,
    resetTilt,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    applyWheelDelta,
  } = useTiltInteraction();

  const [activeTab, setActiveTab] = useState<TabId>('style');
  const [coverImg, setCoverImg] = useState<HTMLImageElement | null>(null);
  const [coverPalette, setCoverPalette] = useState<string[]>([]);
  const [renderedLyricSize, setRenderedLyricSize] = useState<number>(state.lyricSize);
  const [hasTextOverflow, setHasTextOverflow] = useState<boolean>(false);
  const [fontEpoch, setFontEpoch] = useState(0);

  const [lyricsModalOpen, setLyricsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIsError, setToastIsError] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, isError = false) => {
    setToastMessage(msg);
    setToastIsError(isError);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const ensureProgressBarVisible = useCallback(() => {
    setState((prev) =>
      prev.hide.bar ? { ...prev, hide: { ...prev.hide, bar: false } } : prev
    );
  }, [setState]);

  const toggleBarOnCard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hide: { ...prev.hide, bar: !prev.hide.bar },
    }));
  }, [setState]);

  const player = useAudioPreview({
    title: state.title,
    artist: state.artist,
    lyrics: state.lyrics,
    songDuration: songMeta?.duration,
    onToast: showToast,
    onEnsureProgressBarVisible: ensureProgressBarVisible,
  });

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const uniqueFaces = new Set<string>([
      '400 16px "Poppins"',
      '600 24px "Poppins"',
      '700 32px "Poppins"',
    ]);
    for (const font of Object.values(LYRIC_FONTS)) {
      if ('load' in font && font.load) {
        uniqueFaces.add(`${font.weight} 32px "${font.load}"`);
      }
    }

    let alive = true;
    const bumpFonts = () => {
      if (!alive) return;
      incrementFontGen();
      setFontEpoch((n) => n + 1);
    };

    const fontsApi = document.fonts;
    if (fontsApi) {
      Promise.all(
        [...uniqueFaces].map((f) => fontsApi.load(f).catch(() => undefined))
      ).then(bumpFonts);
      fontsApi.ready.then(bumpFonts);
      fontsApi.addEventListener?.('loadingdone', bumpFonts);
    }

    return () => {
      alive = false;
      fontsApi?.removeEventListener?.('loadingdone', bumpFonts);
    };
  }, []);

  const autoColorRef = useRef(state.autoColor);
  autoColorRef.current = state.autoColor;

  useEffect(() => {
    const rawUrl = state.coverUrl.trim();
    if (!rawUrl) {
      setCoverImg(null);
      setCoverPalette([]);
      return;
    }

    let alive = true;
    const applyLoadedImage = (img: HTMLImageElement) => {
      if (!alive) return;
      setCoverImg(img);
      try {
        const pal = extractCoverColors(img);
        setCoverPalette(pal);
        if (autoColorRef.current && pal.length > 0) setState({ color: pal[0] });
      } catch {
        setCoverPalette([]);
      }
    };

    const loadImage = (src: string, canRetryViaProxy: boolean) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.onload = () => applyLoadedImage(img);
      img.onerror = () => {
        if (!alive) return;
        if (canRetryViaProxy && /^https?:\/\//i.test(rawUrl)) {
          loadImage(`/api/cover-proxy?url=${encodeURIComponent(rawUrl)}`, false);
          return;
        }
        setCoverImg(null);
        setCoverPalette([]);
        showToast('Cover art could not load.', true);
      };
      img.src = src;
    };

    loadImage(rawUrl, true);

    return () => {
      alive = false;
    };
  }, [state.coverUrl, setState, showToast]);

  useEffect(() => {
    if (state.autoColor && coverPalette.length > 0) {
      setState({ color: coverPalette[0] });
    }
  }, [state.autoColor, coverPalette, setState]);

  const handleMatchCoverColor = useCallback(() => {
    if (coverPalette.length > 0) {
      setState({ color: coverPalette[0], autoColor: false });
    } else {
      showToast('No cover yet.', true);
    }
  }, [coverPalette, setState, showToast]);

  const handleSelectSong = useCallback(
    (song: SearchResult) => {
      setState({
        title: song.title,
        artist: song.artist,
        coverUrl: song.cover,
        trackId: null,
      });
      setSongMeta({ title: song.title, artist: song.artist, duration: song.duration });
      player.setTrackPreview(song.previewUrl ?? null, song.duration);
      setActiveTab('text');
      setLyricsModalOpen(true);
    },
    [setState, setSongMeta, player]
  );

  const handleSpotifyTrack = useCallback(
    (coverUrl: string, trackId: string | null, title?: string) => {
      setState((prev) => ({
        ...prev,
        coverUrl,
        trackId,
        ...(title ? { title } : {}),
      }));
    },
    [setState]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT' ||
        activeEl?.hasAttribute('contenteditable');
      if (isInput) return;
      if (lyricsModalOpen || exportModalOpen || keyboardHelpOpen) return;

      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          return;
        }
        if (key === 'y') {
          e.preventDefault();
          redo();
          return;
        }
      }

      if (e.key === ' ') {
        e.preventDefault();
        void player.togglePlay();
      } else if (e.key === '?') {
        e.preventDefault();
        setKeyboardHelpOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setExportModalOpen(true);
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const layouts: LayoutKey[] = ['square', 'wide', 'story', 'portrait', 'tall'];
        setLayoutKey(layouts[parseInt(e.key, 10) - 1]);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const themes = Object.keys(THEMES) as ThemeKey[];
        const curIdx = themes.indexOf(state.theme);
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const nextTheme = themes[(curIdx + dir + themes.length) % themes.length];
        setTheme(nextTheme);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    lyricsModalOpen,
    exportModalOpen,
    keyboardHelpOpen,
    redo,
    undo,
    setLayoutKey,
    setTheme,
    state.theme,
    player,
  ]);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-[#121212] text-white">
      <div className="shrink-0 lg:hidden">
        <Header
          canUndo={canUndo}
          canRedo={canRedo}
          isPlaying={player.isPlaying}
          onUndo={undo}
          onRedo={redo}
          onTogglePlay={() => void player.togglePlay()}
          onOpenHelp={() => setKeyboardHelpOpen(true)}
          onToast={showToast}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="order-2 flex min-h-0 flex-1 flex-col border-t border-[#282828] bg-[#181818] lg:order-1 lg:w-[400px] lg:flex-none lg:border-t-0 lg:border-r xl:w-[424px]">
          <div className="hidden shrink-0 lg:block">
            <Header
              canUndo={canUndo}
              canRedo={canRedo}
              isPlaying={player.isPlaying}
              onUndo={undo}
              onRedo={redo}
              onTogglePlay={() => void player.togglePlay()}
              onOpenHelp={() => setKeyboardHelpOpen(true)}
              onToast={showToast}
            />
          </div>

          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-5">
            {activeTab === 'search' && (
              <SearchSection
                onSelectSong={handleSelectSong}
                onSpotifyTrack={handleSpotifyTrack}
                onToast={showToast}
              />
            )}
            {activeTab === 'text' && (
              <TextSection
                state={state}
                onChange={setState}
                onOpenLyricsModal={() => setLyricsModalOpen(true)}
              />
            )}
            {activeTab === 'style' && (
              <StyleSection
                state={state}
                onChange={setState}
                onSetTheme={setTheme}
                onSetLayout={setLayoutKey}
                coverPalette={coverPalette}
                onMatchCoverColor={handleMatchCoverColor}
                renderedLyricSize={renderedLyricSize}
                hasTextOverflow={hasTextOverflow}
              />
            )}
            {activeTab === 'layout' && (
              <LayoutSection state={state} onChange={setState} onToast={showToast} />
            )}
            {activeTab === 'looks' && (
              <LooksSection
                state={state}
                onApplyLook={(look) => {
                  setState((prev) => {
                    const nextTheme = (look.t as ThemeKey) || prev.theme;
                    const isGlareAuto = look.g === 'auto';
                    const isCoverHidden = look.cs === 'hidden';
                    return {
                      ...prev,
                      theme: nextTheme,
                      color: look.c || prev.color,
                      glareAuto: isGlareAuto,
                      glareStyle: isGlareAuto
                        ? ((THEME_GLARE[nextTheme] as CardState['glareStyle']) || 'diagonal')
                        : ((look.g as CardState['glareStyle']) || prev.glareStyle),
                      glare: typeof look.gi === 'number' ? look.gi : prev.glare,
                      layoutKey: (look.l as LayoutKey) || prev.layoutKey,
                      coverShape: isCoverHidden
                        ? prev.coverShape
                        : ((look.cs as CardState['coverShape']) || prev.coverShape),
                      hide:
                        typeof look.cs === 'string'
                          ? { ...prev.hide, cover: isCoverHidden }
                          : prev.hide,
                      lyricFont: (look.lf as CardState['lyricFont']) || prev.lyricFont,
                      bgStyle: look.bg || prev.bgStyle,
                      cardDepth: typeof look.d === 'number' ? look.d : prev.cardDepth,
                      align: look.a || prev.align,
                      autoColor: typeof look.ac === 'boolean' ? look.ac : prev.autoColor,
                    };
                  });
                }}
                onToast={showToast}
              />
            )}
          </div>

          <footer className="shrink-0 border-t border-[#282828] bg-[#141414]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1db954] py-3 text-sm font-bold text-black active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Export card
            </button>
          </footer>
        </aside>

        <div className="order-1 h-[34svh] min-h-[210px] max-h-[380px] shrink-0 lg:order-2 lg:h-auto lg:max-h-none lg:min-h-0 lg:flex-1">
          <Stage
            state={state}
            coverImg={coverImg}
            tilt={tilt}
            isDragging={isDragging}
            fontEpoch={fontEpoch}
            player={player}
            onToggleBarOnCard={toggleBarOnCard}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheelDelta={applyWheelDelta}
            onResetTilt={resetTilt}
            onCardRenderedSize={(size, overflow) => {
              setRenderedLyricSize(size);
              setHasTextOverflow(overflow);
            }}
          />
        </div>
      </div>

      <Suspense fallback={null}>
        {lyricsModalOpen && (
          <LyricsModal
            isOpen={lyricsModalOpen}
            onClose={() => setLyricsModalOpen(false)}
            artist={state.artist}
            title={state.title}
            duration={songMeta?.duration}
            previewOffset={player.previewOffset}
            isFullTrack={Boolean(player.getPreviewAnalysis()?.isFullTrack)}
            cardColor={state.color}
            onApplyLyrics={(
              lyrics,
              lyricTimeSec,
              fetchedDur,
              selectedLineTimes,
              selectedLineEnds
            ) => {
              setState({ lyrics });
              if (fetchedDur && fetchedDur > 0 && !songMeta?.duration) {
                setSongMeta({
                  title: state.title,
                  artist: state.artist,
                  duration: fetchedDur,
                });
              }
              player.syncToLyricTimestamp(
                lyricTimeSec,
                fetchedDur || songMeta?.duration,
                selectedLineTimes,
                selectedLineEnds
              );
            }}
            onToast={showToast}
          />
        )}
        {exportModalOpen && (
          <ExportModal
            isOpen={exportModalOpen}
            onClose={() => setExportModalOpen(false)}
            state={state}
            coverImg={coverImg}
            tilt={tilt}
            playback={player.canvasPlayback}
            player={player}
            onUpdateState={setState}
            onToast={showToast}
          />
        )}
        {keyboardHelpOpen && (
          <KeyboardHelpModal
            isOpen={keyboardHelpOpen}
            onClose={() => setKeyboardHelpOpen(false)}
          />
        )}
      </Suspense>
      <Toast message={toastMessage} isError={toastIsError} />
    </div>
  );
}
