import React, { useEffect, useRef, useState } from 'react';
import { CardState, ExportFormat, LayoutKey, TiltState } from '../../types';
import type { PlaybackVisualState } from '../../engine/canvasRenderer';
import type { AudioPreviewController } from '../../hooks/useAudioPreview';
import {
  EXPORT_PRESETS,
  FORMATS,
  LAYOUTS,
  presetById,
} from '../../engine/constants';
import {
  dimsFor,
  encodeCanvas,
  ensureExportAssetsReady,
  fileBaseName,
  makeZip,
  renderCard3D,
  renderFlatCanvas,
  saveBlob,
  supportsWebp,
  takePreviewShot,
} from '../../engine/exportEngine';
import {
  Download,
  Box,
  Copy,
  Share2,
  Archive,
  X,
  Loader2,
  Film,
  Sparkles,
  Square,
  Music,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CardState;
  coverImg: HTMLImageElement | null;
  tilt: TiltState | null;
  playback?: PlaybackVisualState | null;
  player?: AudioPreviewController;
  onUpdateState: (updates: Partial<CardState>) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  state,
  coverImg,
  tilt,
  playback,
  player,
  onUpdateState,
  onToast,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDurationSec, setVideoDurationSec] = useState<10 | 15 | 30>(15);
  const [videoMotion3D, setVideoMotion3D] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const videoAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isRecordingVideo && videoAbortRef.current) {
          videoAbortRef.current.abort();
        } else if (!isExporting) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isExporting, isRecordingVideo, onClose]);

  useEffect(() => {
    return () => {
      videoAbortRef.current?.abort();
    };
  }, []);

  if (!isOpen) return null;

  const webpSupported = supportsWebp();
  const availableFormats: ExportFormat[] = webpSupported
    ? ['png', 'jpg', 'webp']
    : ['png', 'jpg'];
  const currentFormat = FORMATS[state.fmt] || FORMATS.png;
  const currentLayout = LAYOUTS[state.layoutKey];

  const handleSelectPreset = (id: string) => {
    const p = presetById(id);
    if (!p) return;
    onUpdateState({
      preset: p.id,
      layoutKey: p.layout,
    });
    onToast(`Preset: ${p.label} (${p.w} × ${p.h})`);
  };

  const handleSelectScale = (scale: number) => {
    onUpdateState({ scale, preset: null });
    onToast(
      `Export scale: ${currentLayout.w * scale} × ${currentLayout.h * scale}`
    );
  };

  // 1. Download Flat
  const handleDownloadFlat = async () => {
    setIsExporting(true);
    setStatusMsg('Preparing fonts & cover art…');
    try {
      const readyCover = await ensureExportAssetsReady(state, coverImg);
      setStatusMsg('Rendering flat card…');
      const dims = dimsFor(state.layoutKey, state);
      const out = renderFlatCanvas(
        state.layoutKey,
        dims,
        state.fmt,
        state,
        readyCover,
        playback
      );
      const { blob, fmt, fellBack } = await encodeCanvas(out, state.fmt);
      const filename = fileBaseName(
        state.title,
        state.artist,
        `_${state.layoutKey}`,
        FORMATS[fmt].ext
      );
      saveBlob(blob, filename);
      onToast(
        fellBack
          ? `${FORMATS[state.fmt].label} fallback to PNG`
          : `Downloaded ${FORMATS[fmt].label} (${dims.w} × ${dims.h})`
      );
      onClose();
    } catch (e) {
      console.error(e);
      onToast('Export failed. The cover image may block cross-origin use.', true);
    } finally {
      setIsExporting(false);
      setStatusMsg(null);
    }
  };

  // 2. Download 3D
  const handleDownload3D = async () => {
    setIsExporting(true);
    setStatusMsg('Preparing 3D card at this angle…');
    try {
      const readyCover = await ensureExportAssetsReady(state, coverImg);
      await new Promise((r) => setTimeout(r, 40));
      const dims = dimsFor(state.layoutKey, state);
      const shot = takePreviewShot();
      const useHighRes3D =
        !shot ||
        state.scale > 1 ||
        Boolean(state.preset) ||
        state.fmt === 'jpg' ||
        !state.transparent ||
        shot.width < dims.w * 0.75;

      const out = useHighRes3D
        ? renderCard3D(
            state,
            readyCover,
            Math.round(currentLayout.w * 0.55),
            tilt,
            playback,
            state.fmt === 'jpg' || !state.transparent
          )
        : shot;

      const { blob, fmt, fellBack } = await encodeCanvas(out, state.fmt);
      const filename = fileBaseName(
        state.title,
        state.artist,
        '_3d',
        FORMATS[fmt].ext
      );
      saveBlob(blob, filename);
      onToast(
        fellBack
          ? 'Downloaded 3D card (PNG fallback)'
          : `Downloaded 3D card (${FORMATS[fmt].label})`
      );
      onClose();
    } catch (e) {
      console.error(e);
      onToast('3D Export failed. Check image CORS.', true);
    } finally {
      setIsExporting(false);
      setStatusMsg(null);
    }
  };

  // 3. Export Animated Karaoke Video (lazy-loads videoExportEngine)
  const handleExportVideo = async () => {
    if (isRecordingVideo) {
      videoAbortRef.current?.abort();
      return;
    }

    if (player?.isPlaying) {
      void player.togglePlay();
    }

    const abortCtrl = new AbortController();
    videoAbortRef.current = abortCtrl;
    setIsExporting(true);
    setIsRecordingVideo(true);
    setVideoProgress(0.02);
    setStatusMsg('Loading 3D video engine…');

    try {
      const { exportKaraokeVideo } = await import(
        '../../engine/videoExportEngine'
      );
      const res = await exportKaraokeVideo({
        state,
        coverImg,
        tilt,
        previewUrl: player?.previewUrl ?? null,
        anchorTimeSec:
          player?.anchorTimeSec ??
          playback?.currentTime ??
          Math.round((playback?.duration ?? 211) * 0.38),
        fullDuration: player?.duration ?? playback?.duration ?? 211,
        lineTimes: player?.lineTimes ?? [],
        previewOffset: player?.previewOffset ?? null,
        syncNudge: player?.syncNudge ?? 0,
        previewAnalysis: player?.getPreviewAnalysis() ?? null,
        vocalEnvelope: player?.getVocalEnvelope() ?? null,
        clipDurationSec: videoDurationSec,
        motion3D: videoMotion3D,
        signal: abortCtrl.signal,
        onProgress: (frac, label) => {
          setVideoProgress(frac);
          setStatusMsg(label);
        },
      });

      const filename = fileBaseName(
        state.title,
        state.artist,
        `_karaoke_${videoDurationSec}s`,
        res.ext
      );
      saveBlob(res.blob, filename);
      onToast(
        res.hasAudio
          ? `Downloaded ${videoDurationSec}s Karaoke Video with audio (.${res.ext})`
          : `Downloaded ${videoDurationSec}s Karaoke Lyric Video (.${res.ext})`
      );
      onClose();
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        onToast('Video recording cancelled.');
      } else {
        console.error(e);
        onToast('Video export failed on this browser.', true);
      }
    } finally {
      videoAbortRef.current = null;
      setIsRecordingVideo(false);
      setIsExporting(false);
      setVideoProgress(0);
      setStatusMsg(null);
    }
  };

  // 4. Copy to Clipboard
  const handleCopyClipboard = async () => {
    if (
      !navigator.clipboard ||
      typeof (window as unknown as { ClipboardItem?: unknown }).ClipboardItem ===
        'undefined' ||
      !navigator.clipboard.write
    ) {
      onToast(
        'Clipboard copy is not supported in this browser. Use Download instead.',
        true
      );
      return;
    }

    setIsExporting(true);
    setStatusMsg('Copying image to clipboard…');
    try {
      const readyCover = await ensureExportAssetsReady(state, coverImg);
      const dims = dimsFor(state.layoutKey, state);
      const out = renderFlatCanvas(
        state.layoutKey,
        dims,
        'png',
        state,
        readyCover,
        playback
      );
      const blobPromise = new Promise<Blob>((resolve, reject) => {
        out.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
          'image/png'
        );
      });
      const ClipboardItemCtor = (
        window as unknown as {
          ClipboardItem: new (
            items: Record<string, Promise<Blob>>
          ) => ClipboardItem;
        }
      ).ClipboardItem;
      await navigator.clipboard.write([
        new ClipboardItemCtor({ 'image/png': blobPromise }),
      ]);
      onToast('Copied card to clipboard!');
      onClose();
    } catch (e) {
      console.error(e);
      onToast('Copy failed. Browser may block clipboard image writes.', true);
    } finally {
      setIsExporting(false);
      setStatusMsg(null);
    }
  };

  // 5. Native Share
  const handleNativeShare = async () => {
    if (!navigator.share) {
      onToast('Sharing files is not supported on this device.', true);
      return;
    }

    setIsExporting(true);
    setStatusMsg('Preparing share sheet…');
    try {
      const readyCover = await ensureExportAssetsReady(state, coverImg);
      const dims = dimsFor(state.layoutKey, state);
      const out = renderFlatCanvas(
        state.layoutKey,
        dims,
        state.fmt,
        state,
        readyCover,
        playback
      );
      const { blob, fmt } = await encodeCanvas(out, state.fmt);
      const name = fileBaseName(
        state.title,
        state.artist,
        `_${state.layoutKey}`,
        FORMATS[fmt].ext
      );
      const file = new File([blob], name, {
        type: blob.type || FORMATS[fmt].mime,
      });

      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        saveBlob(blob, name);
        onToast('File sharing unsupported. Saved to downloads.');
        onClose();
        return;
      }

      await navigator.share({
        files: [file],
        title:
          [state.title, state.artist].filter(Boolean).join(' – ') ||
          'Lyric Card',
      });
      onToast('Shared successfully!');
      onClose();
    } catch (e: unknown) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) {
        onToast('Share sheet closed.');
      }
    } finally {
      setIsExporting(false);
      setStatusMsg(null);
    }
  };

  // 6. Download All Layouts Zip
  const handleDownloadZip = async () => {
    setIsExporting(true);
    const keys: LayoutKey[] = ['square', 'wide', 'story', 'portrait', 'tall'];
    const files: { name: string; data: Uint8Array }[] = [];

    try {
      setStatusMsg('Preparing fonts & cover art…');
      const readyCover = await ensureExportAssetsReady(state, coverImg);

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        setStatusMsg(
          `Rendering ${i + 1} of ${keys.length}: ${LAYOUTS[k].label.split(' · ')[0]}…`
        );
        await new Promise((r) => setTimeout(r, 30));

        const dims = dimsFor(k, state, true);
        const out = renderFlatCanvas(
          k,
          dims,
          state.fmt,
          state,
          readyCover,
          playback
        );
        const res = await encodeCanvas(out, state.fmt);
        const arrayBuf = await res.blob.arrayBuffer();
        const fname = fileBaseName(
          state.title,
          state.artist,
          `_${k}`,
          FORMATS[res.fmt].ext
        );
        files.push({ name: fname, data: new Uint8Array(arrayBuf) });
      }

      setStatusMsg('Compressing ZIP archive…');
      const zipBlob = makeZip(files);
      saveBlob(
        zipBlob,
        fileBaseName(state.title, state.artist, '_all-layouts', 'zip')
      );
      onToast(`Zip downloaded (${files.length} layout cards)`);
      onClose();
    } catch (e) {
      console.error(e);
      onToast('Zip creation failed.', true);
    } finally {
      setIsExporting(false);
      setStatusMsg(null);
    }
  };

  const pct = Math.min(100, Math.max(2, Math.round(videoProgress * 100)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export and Download Lyric Card"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop with smooth blur transition */}
      <div
        onClick={() => {
          if (!isRecordingVideo && !isExporting) onClose();
        }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Spring-animated Modal Dialog Sheet */}
      <div
        style={{
          animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="relative flex flex-col w-full sm:max-w-md max-h-[90dvh] bg-[#1a1a1a] border border-[#2f2f2f] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-6 duration-300"
      >
        {/* Dedicated Animated Video Processing Overlay when recording */}
        {isRecordingVideo && (
          <div
            style={{
              animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-t-3xl sm:rounded-2xl bg-[#121215]/95 p-6 text-center backdrop-blur-xl animate-in fade-in zoom-in-95 duration-250"
          >
            {/* Pulsing concentric halo + dual spinning ring */}
            <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#1db954]/20 blur-xl animate-pulse" />
              <div className="absolute inset-1 rounded-full border-2 border-[#1db954]/20" />
              <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-[#1db954] border-r-[#1ed760] animate-spin" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1db954]/15 border border-[#1db954]/40 text-[#1ed760] shadow-inner">
                <Music className="h-6 w-6 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1db954]/15 border border-[#1db954]/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1ed760]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1ed760] animate-ping" />
                Live Studio Render · {pct}%
              </div>
              <h3 className="text-base font-bold text-white pt-1">
                {state.title || 'Lyric Card'}
              </h3>
              <p className="text-xs text-[#9ca3af] max-w-[280px]">
                {statusMsg || 'Syncing karaoke lyrics & 3D card motion…'}
              </p>
            </div>

            {/* Smooth animated progress bar */}
            <div className="mt-5 w-full max-w-[300px] space-y-2">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1db954] via-[#1ed760] to-[#4ade80] transition-all duration-200 ease-out shadow-[0_0_12px_rgba(29,185,84,0.65)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#8e959e]">
                <span>
                  {videoMotion3D ? '3D Extruded Silhouette' : 'Flat Studio Frame'}
                </span>
                <span className="font-mono text-[#1ed760] font-semibold">
                  {pct}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => videoAbortRef.current?.abort()}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 hover:bg-red-500/25 px-5 py-2 text-xs font-bold text-red-200 transition-all active:scale-95"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Cancel Recording
            </button>
          </div>
        )}

        <header className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-base font-bold text-white">Export & Download</h2>
            <p className="text-xs text-[#909090]">
              Save high-res cards, animated karaoke videos with audio, or batch bundles.
            </p>
          </div>
          <button
            type="button"
            disabled={isRecordingVideo}
            onClick={onClose}
            aria-label="Close export modal"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#a0a0a0] hover:text-white disabled:opacity-40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Animated Karaoke Video Export Card */}
        <div className="rounded-2xl border border-[#1db954]/35 bg-gradient-to-br from-[#1db954]/14 via-[#18241c] to-[#171717] p-3.5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1db954]/20 text-[#1ed760]">
                <Film className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">
                    Karaoke Video + Song Audio
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#1db954]/25 px-1.5 py-0.5 text-[10px] font-bold text-[#1ed760]">
                    <Sparkles className="h-2.5 w-2.5" />
                    SYNCED
                  </span>
                </div>
                <p className="text-[11px] text-[#a7b8ad]">
                  Real-time vocal lyric highlight, 3D silhouette & synced progress bar
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Duration pills */}
            <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/10">
              {([10, 15, 30] as const).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setVideoDurationSec(sec)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    videoDurationSec === sec
                      ? 'bg-[#1db954] text-black shadow-sm'
                      : 'text-[#b3b3b3] hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* 3D Motion toggle */}
            <button
              type="button"
              disabled={isExporting}
              onClick={() => setVideoMotion3D((v) => !v)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                videoMotion3D
                  ? 'border-[#1db954]/60 bg-[#1db954]/15 text-[#1ed760]'
                  : 'border-white/10 bg-black/30 text-[#a0a0a0] hover:text-white'
              }`}
            >
              {videoMotion3D ? '3D Float: ON' : 'Flat Frame'}
            </button>
          </div>

          <button
            type="button"
            disabled={isExporting && !isRecordingVideo}
            onClick={handleExportVideo}
            className="w-full py-2.5 px-4 bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
          >
            <Film className="w-4 h-4" />
            <span>
              Export Karaoke Video ({videoDurationSec}s
              {player?.hasPreviewUrl ? ' · with Audio' : ''})
            </span>
          </button>
        </div>

        {/* 1. Social Presets */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-wider font-bold text-[#1db954]">
            Size Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_PRESETS.map((p) => {
              const isSelected = state.preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={isExporting}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#1db954]/20 border-[#1db954] text-white shadow-sm'
                      : 'bg-[#222222] border-[#333333] hover:border-[#444444] text-[#d0d0d0]'
                  }`}
                >
                  <span className="text-xs font-semibold">{p.label}</span>
                  <span className="text-[10.5px] text-[#808080]">
                    {p.w} × {p.h}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Image Resolution Scale (1x / 2x) */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#b3b3b3]">
            Image Scale
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#222222] border border-[#333333] rounded-xl">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleSelectScale(1)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                state.scale === 1 && !state.preset
                  ? 'bg-[#1db954] text-black shadow-sm'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              1x ({currentLayout.w} × {currentLayout.h})
            </button>
            <button
              type="button"
              disabled={isExporting}
              onClick={() => handleSelectScale(2)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                state.scale === 2 && !state.preset
                  ? 'bg-[#1db954] text-black shadow-sm'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              2x ({currentLayout.w * 2} × {currentLayout.h * 2})
            </button>
          </div>
        </div>

        {/* 3. Format Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#b3b3b3]">
            Image Format
          </label>
          <div
            className={`grid gap-2 p-1 bg-[#222222] border border-[#333333] rounded-xl ${
              availableFormats.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            {availableFormats.map((fmt) => {
              const isSelected = state.fmt === fmt;
              return (
                <button
                  key={fmt}
                  type="button"
                  disabled={isExporting}
                  onClick={() => onUpdateState({ fmt })}
                  className={`py-2 text-xs font-semibold uppercase rounded-lg transition-all ${
                    isSelected
                      ? 'bg-[#1db954] text-black shadow-sm'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  {fmt} {fmt !== 'jpg' ? '· alpha' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Image Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#2a2a2a]">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownload3D}
            className="w-full py-2.5 px-4 bg-[#262626] hover:bg-[#303030] disabled:opacity-50 text-white font-bold text-xs border border-[#3a3a3a] rounded-full flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Box className="w-4 h-4 text-[#1db954]" />
            <span>Download 3D Card ({currentFormat.label})</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadFlat}
            className="w-full py-2.5 px-4 bg-[#262626] hover:bg-[#303030] disabled:opacity-50 text-white font-semibold text-xs border border-[#383838] rounded-full flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Download className="w-4 h-4 text-[#1db954]" />
            <span>Download Flat ({currentFormat.label})</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleCopyClipboard}
              className="py-2.5 px-3 bg-transparent hover:bg-white/5 disabled:opacity-50 text-[#d0d0d0] hover:text-white font-medium text-xs border border-[#333333] rounded-full flex items-center justify-center gap-1.5 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Image</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleNativeShare}
              className="py-2.5 px-3 bg-transparent hover:bg-white/5 disabled:opacity-50 text-[#d0d0d0] hover:text-white font-medium text-xs border border-[#333333] rounded-full flex items-center justify-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Image</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadZip}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-white/5 disabled:opacity-50 text-[#d0d0d0] hover:text-white font-medium text-xs border border-[#333333] rounded-full flex items-center justify-center gap-2 transition-all"
          >
            <Archive className="w-3.5 h-3.5 text-[#1db954]" />
            <span>Download All 5 Layouts (.zip)</span>
          </button>
        </div>

        {/* Status indicator for non-video exports */}
        {statusMsg && !isRecordingVideo && (
          <div className="flex items-center justify-center gap-2 text-xs text-[#1db954] animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
