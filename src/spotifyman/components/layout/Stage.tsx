import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type FC,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { RotateCcw } from 'lucide-react';
import type { CardState, TiltState } from '../../types';
import { LAYOUTS, THEMES } from '../../engine/constants';
import {
  paintGlare,
  renderCard,
  type PlaybackVisualState,
} from '../../engine/canvasRenderer';
import type { AudioPreviewController } from '../../hooks/useAudioPreview';
import { MiniPlayerBar } from './MiniPlayerBar';

const CardViewport = lazy(() => import('./CardViewport'));

interface StageProps {
  state: CardState;
  coverImg: HTMLImageElement | null;
  tilt: TiltState;
  isDragging: boolean;
  fontEpoch: number;
  player: AudioPreviewController;
  onToggleBarOnCard: () => void;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e?: ReactPointerEvent<HTMLDivElement>) => void;
  onWheelDelta: (deltaY: number) => void;
  onResetTilt: () => void;
  onCardRenderedSize?: (size: number, overflow: boolean) => void;
}

class ViewBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Crisp 2D canvas fallback if WebGL is unavailable on a device */
const CanvasFallback: FC<{
  state: CardState;
  coverImg: HTMLImageElement | null;
  tilt: TiltState;
  fontEpoch: number;
  playback?: PlaybackVisualState | null;
  getLivePlayback?: (() => PlaybackVisualState | null) | null;
  onSize?: (size: number, overflow: boolean) => void;
}> = ({ state, coverImg, tilt, fontEpoch, playback, getLivePlayback, onSize }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  const drawFrame = (live?: PlaybackVisualState | null) => {
    const canvas = ref.current;
    if (!canvas) return;
    const layout = LAYOUTS[state.layoutKey];
    if (canvas.width !== layout.w) canvas.width = layout.w;
    if (canvas.height !== layout.h) canvas.height = layout.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const info = renderCard(ctx, state, layout, coverImg, tilt, {
      flat: false,
      fullBleed: false,
      playback: live ?? playback,
    });
    paintGlare(ctx, state, layout, tilt, false);
    onSize?.(info.size, info.overflow);
  };

  useEffect(() => {
    drawFrame(getLivePlayback?.() ?? playback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, coverImg, tilt, fontEpoch, playback, onSize]);

  useEffect(() => {
    if (!playback?.isPlaying || !getLivePlayback) return;
    let rafId = 0;
    const loop = () => {
      const live = getLivePlayback();
      if (live) drawFrame(live);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playback?.isPlaying, getLivePlayback]);

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <canvas
        ref={ref}
        className="max-h-full max-w-full object-contain drop-shadow-2xl"
        style={{
          transform: `perspective(${tilt.perspective}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotateZ(${tilt.rz}deg)`,
        }}
      />
    </div>
  );
};

export const Stage: FC<StageProps> = ({
  state,
  coverImg,
  tilt,
  isDragging,
  fontEpoch,
  player,
  onToggleBarOnCard,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheelDelta,
  onResetTilt,
  onCardRenderedSize,
}) => {
  const layout = LAYOUTS[state.layoutKey];
  const themeLabel = THEMES[state.theme]?.label ?? 'Classic';
  const [show3d, setShow3d] = useState(false);
  const stageAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => setShow3d(true), []);

  // Attach non-passive wheel listener so preventDefault() never throws passive-listener warnings
  useEffect(() => {
    const el = stageAreaRef.current;
    if (!el) return;
    const onNativeWheel = (e: globalThis.WheelEvent) => {
      e.preventDefault();
      onWheelDelta(e.deltaY);
    };
    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', onNativeWheel);
  }, [onWheelDelta]);

  return (
    <main
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden select-none"
      style={{ ['--glow' as string]: state.color }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(520px 420px at 50% 46%, ${state.color}33, transparent 70%)`,
        }}
      />

      <div className="absolute top-3 left-3 z-10 flex max-w-[70%] items-center gap-2">
        <span className="truncate rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-[#d0d0d0] backdrop-blur-md">
          {themeLabel} · {layout.w}×{layout.h}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-10">
        <button
          type="button"
          onClick={onResetTilt}
          aria-label="Reset tilt"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[#d0d0d0] backdrop-blur-md active:scale-95"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div
        ref={stageAreaRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onResetTilt}
        className={`relative z-1 h-full w-full touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <ViewBoundary
          fallback={
            <CanvasFallback
              state={state}
              coverImg={coverImg}
              tilt={tilt}
              fontEpoch={fontEpoch}
              playback={player.canvasPlayback}
              getLivePlayback={player.getLivePlayback}
              onSize={onCardRenderedSize}
            />
          }
        >
          {show3d ? (
            <Suspense fallback={null}>
              <CardViewport
                state={state}
                coverImg={coverImg}
                tilt={tilt}
                dragging={isDragging}
                fontEpoch={fontEpoch}
                playback={player.canvasPlayback}
                getLivePlayback={player.getLivePlayback}
                onSize={onCardRenderedSize}
              />
            </Suspense>
          ) : null}
        </ViewBoundary>
      </div>

      {/* Floating Spotify-style Mini Preview Player */}
      <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
        <MiniPlayerBar
          player={player}
          title={state.title}
          artist={state.artist}
          barVisibleOnCard={!state.hide.bar}
          onToggleBarOnCard={onToggleBarOnCard}
        />
      </div>
    </main>
  );
};
