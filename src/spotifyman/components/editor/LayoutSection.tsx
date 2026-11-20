import React, { useMemo } from 'react';
import { CardState, TextAlign } from '../../types';
import { LYRIC_FONTS, THEME_GLARE } from '../../engine/constants';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { parseLyrics } from '../../engine/canvasRenderer';

interface LayoutSectionProps {
  state: CardState;
  onChange: (updates: Partial<CardState>) => void;
  onToast: (msg: string) => void;
}

export const LayoutSection: React.FC<LayoutSectionProps> = React.memo(({
  state,
  onChange,
  onToast,
}) => {
  const lyricParas = useMemo(() => parseLyrics(state.lyrics), [state.lyrics]);

  const toggleHide = (key: keyof CardState['hide']) => {
    if (key === 'code' && state.hide.code && !state.trackId) {
      onToast(
        'Paste a Spotify track link under Search first. The Spotify Code needs a track ID.'
      );
      return;
    }
    onChange({
      hide: {
        ...state.hide,
        [key]: !state.hide[key],
      },
    });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#1db954]">Layout</h2>

      {/* Lyric Alignment */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[#b3b3b3]">
          Lyric Alignment
        </label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#202020] border border-[#333333] rounded-xl">
          {(['left', 'center', 'right'] as TextAlign[]).map((align) => {
            const isSelected = state.align === align;
            const Icon =
              align === 'left'
                ? AlignLeft
                : align === 'center'
                ? AlignCenter
                : AlignRight;
            return (
              <button
                key={align}
                type="button"
                onClick={() => onChange({ align })}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                  isSelected
                    ? 'bg-[#1db954] text-black font-semibold shadow-sm'
                    : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{align}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Show on card toggles */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-[#b3b3b3]">
          Show on Card
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'cover' as const, label: 'Cover art' },
            { key: 'title' as const, label: 'Song title' },
            { key: 'artist' as const, label: 'Artist' },
            { key: 'logo' as const, label: 'Spotify logo' },
            { key: 'bar' as const, label: 'Progress bar' },
            { key: 'code' as const, label: 'Spotify Code' },
          ].map(({ key, label }) => {
            const isVisible = !state.hide[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleHide(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isVisible
                    ? 'bg-[#1db954]/15 border-[#1db954] text-white shadow-sm'
                    : 'bg-[#222222] border-[#333333] text-[#707070] hover:text-[#a0a0a0]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card Depth slider */}
      <div className="space-y-1.5 pt-2 border-t border-[#262626]">
        <div className="flex items-center justify-between text-xs text-[#b3b3b3]">
          <span>Card Depth (Volumetric Extrusion)</span>
          <span className="font-mono text-white font-medium">
            {state.cardDepth} px
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={state.cardDepth}
          onChange={(e) =>
            onChange({ cardDepth: parseInt(e.target.value, 10) })
          }
          className="w-full accent-[#1db954] cursor-pointer"
        />
        <p className="text-[11px] text-[#808080]">
          Extrudes the card, cover art, text, and logo along real-time 3D tilt vectors.
        </p>
      </div>

      {/* Glare Style & Intensity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#262626]">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#b3b3b3]">
            Glare Style
          </label>
          <select
            value={state.glareAuto ? 'auto' : state.glareStyle}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'auto') {
                onChange({
                  glareAuto: true,
                  glareStyle:
                    (THEME_GLARE[state.theme] as CardState['glareStyle']) ||
                    'diagonal',
                });
              } else {
                onChange({
                  glareAuto: false,
                  glareStyle: val as CardState['glareStyle'],
                });
              }
            }}
            className="w-full px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]"
          >
            <option value="auto">Auto (Theme default)</option>
            <option value="diagonal">Diagonal</option>
            <option value="spotlight">Spotlight</option>
            <option value="follow">Cursor follow</option>
            <option value="holo">Holographic</option>
            <option value="gloss">Frosted gloss</option>
            <option value="sweep">Sweep</option>
            <option value="none">None</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#b3b3b3]">
            <span>Glare Intensity</span>
            <span className="font-mono text-white">{state.glare}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={state.glare}
            onChange={(e) =>
              onChange({ glare: parseInt(e.target.value, 10) })
            }
            className="w-full accent-[#1db954] cursor-pointer"
          />
        </div>
      </div>

      {/* Cover Shape & Lyric Font */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#262626]">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#b3b3b3]">
            Cover Shape
          </label>
          <select
            value={state.hide.cover ? 'hidden' : state.coverShape}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'hidden') {
                onChange({
                  hide: { ...state.hide, cover: true },
                });
              } else {
                onChange({
                  coverShape: val as any,
                  hide: { ...state.hide, cover: false },
                });
              }
            }}
            className="w-full px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]"
          >
            <option value="auto">Theme default</option>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
            <option value="circle">Circle</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#b3b3b3]">
            Lyric Font
          </label>
          <select
            value={state.lyricFont}
            onChange={(e) => onChange({ lyricFont: e.target.value as any })}
            className="w-full px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]"
          >
            <option value="auto">Theme default</option>
            {Object.entries(LYRIC_FONTS).map(([k, font]) => (
              <option key={k} value={k}>
                {font.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Highlight Line */}
      <div className="space-y-1.5 pt-2 border-t border-[#262626]">
        <label className="block text-xs font-medium text-[#b3b3b3]">
          Highlight a Line
        </label>
        <select
          value={state.hlLine}
          onChange={(e) =>
            onChange({ hlLine: parseInt(e.target.value, 10) })
          }
          className="w-full px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]"
        >
          <option value="-1">Off (All lines active)</option>
          {lyricParas.map((words, idx) => {
            if (!words) return null;
            const text = words.join(' ');
            const preview =
              text.length > 36 ? text.slice(0, 35) + '…' : text;
            return (
              <option key={idx} value={idx}>
                {idx + 1}. {preview}
              </option>
            );
          })}
        </select>
        <p className="text-[11px] text-[#808080]">
          Emphasizes one line and softens the others (Spotify karaoke style).
        </p>
      </div>
    </div>
  );
});
