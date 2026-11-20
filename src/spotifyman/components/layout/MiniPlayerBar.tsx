import React from 'react';
import { Loader2, Pause, Play, Volume2 } from 'lucide-react';
import type { AudioPreviewController } from '../../hooks/useAudioPreview';

interface MiniPlayerBarProps {
  player: AudioPreviewController;
  title: string;
  artist: string;
  barVisibleOnCard: boolean;
  onToggleBarOnCard: () => void;
}

function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

export const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  player,
  title,
  artist,
  barVisibleOnCard,
  onToggleBarOnCard,
}) => {
  const remaining = Math.max(0, player.duration - player.currentTime);

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className="flex items-center gap-2.5 rounded-full border border-white/12 bg-[#161616]/90 px-3 py-1.5 shadow-2xl backdrop-blur-xl max-w-[94vw] sm:max-w-md"
    >
      {/* Play / Pause Button (44px touch target via hit padding) */}
      <button
        type="button"
        onClick={() => void player.togglePlay()}
        disabled={player.isLoading}
        aria-label={player.isPlaying ? 'Pause preview' : 'Play preview'}
        title={
          player.isPlaying
            ? 'Pause preview'
            : 'Play track preview & sync card progress bar'
        }
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1db954] text-black shadow-md transition-transform hover:scale-105 hover:bg-[#1ed760] active:scale-95 disabled:opacity-60"
      >
        {player.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : player.isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 translate-x-[1px] fill-current" />
        )}
      </button>

      {/* Track Info + Interactive Progress Scrubber */}
      <div className="flex min-w-[140px] sm:min-w-[200px] flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="truncate font-semibold text-white">
            {title.trim() || 'Song title'}
            <span className="font-normal text-[#a0a0a0]">
              {' · '}
              {artist.trim() || 'Artist'}
            </span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-[#b3b3b3]">
            {fmtTime(player.currentTime)} / -{fmtTime(remaining)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(player.progress * 1000)}
            onChange={(e) => player.seek(parseInt(e.target.value, 10) / 1000)}
            aria-label="Scrub track progress on card"
            className="h-1.5 w-full cursor-pointer accent-[#1db954]"
          />
        </div>
      </div>

      {/* Toggle Card Progress Bar visibility badge */}
      <button
        type="button"
        onClick={onToggleBarOnCard}
        title={
          barVisibleOnCard
            ? 'Progress bar visible on card (click to hide)'
            : 'Show progress bar on card'
        }
        className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all shrink-0 ${
          barVisibleOnCard
            ? 'border-[#1db954]/60 bg-[#1db954]/15 text-[#1db954]'
            : 'border-white/10 bg-white/5 text-[#a0a0a0] hover:text-white'
        }`}
      >
        <Volume2 className="h-3 w-3" />
        <span className="hidden xs:inline sm:inline">
          {player.isSimulated
            ? 'Sim'
            : player.getPreviewAnalysis()?.isFullTrack
            ? 'Full'
            : player.hasPreviewUrl
            ? 'Sync'
            : 'Bar'}
        </span>
      </button>
    </div>
  );
};
