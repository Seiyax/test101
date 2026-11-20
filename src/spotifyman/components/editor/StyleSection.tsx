import React, { useMemo, useState } from 'react';
import { CardState, LayoutKey, ThemeKey } from '../../types';
import { LAYOUTS, PRESET_COLORS, SIGNATURE_THEMES, THEMES } from '../../engine/constants';
import { COLLECTOR_THEMES } from '../../engine/collectorThemes';
import { Minus, Plus, Wand2 } from 'lucide-react';

const ALL_THEMES = Object.keys(THEMES) as ThemeKey[];
const SIGNATURE_SET = new Set<string>(SIGNATURE_THEMES);
const COLLECTOR_SET = new Set<string>(COLLECTOR_THEMES);

type StyleGroup = 'all' | 'collector' | 'signature' | 'classic';

interface StyleSectionProps {
  state: CardState;
  onChange: (updates: Partial<CardState>) => void;
  onSetTheme: (theme: ThemeKey) => void;
  onSetLayout: (layout: LayoutKey) => void;
  coverPalette: string[];
  onMatchCoverColor: () => void;
  renderedLyricSize?: number;
  hasTextOverflow?: boolean;
}

export const StyleSection: React.FC<StyleSectionProps> = React.memo(({
  state,
  onChange,
  onSetTheme,
  onSetLayout,
  coverPalette,
  onMatchCoverColor,
  renderedLyricSize,
  hasTextOverflow,
}) => {
  const [group, setGroup] = useState<StyleGroup>('all');
  const currentTheme = THEMES[state.theme] || THEMES.classic;

  const visibleThemes = useMemo(
    () =>
      ALL_THEMES.filter((k) => {
        if (group === 'collector') return COLLECTOR_SET.has(k);
        if (group === 'signature') return SIGNATURE_SET.has(k);
        if (group === 'classic')
          return !COLLECTOR_SET.has(k) && !SIGNATURE_SET.has(k);
        return true;
      }),
    [group]
  );

  return (
    <div className="space-y-6">
      {/* 1. Card Layout */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider font-bold text-[#1db954]">
          Card Layout
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl">
          {(Object.keys(LAYOUTS) as LayoutKey[]).map((key) => {
            const l = LAYOUTS[key];
            const isSelected = state.layoutKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSetLayout(key)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-[#1db954] text-black font-semibold shadow-md'
                    : 'text-[#b3b3b3] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{l.label.split(' · ')[0]}</span>
                <span className={`text-[10px] ${isSelected ? 'text-black/70' : 'text-[#707070]'}`}>
                  {l.label.split(' · ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1db954]">
            Styles ({ALL_THEMES.length})
          </label>
          <span className="text-[11px] font-medium text-[#b3b3b3]">
            {currentTheme.label}
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1">
          {(
            [
              ['all', `All (${ALL_THEMES.length})`],
              ['collector', `Collector (${COLLECTOR_THEMES.length})`],
              ['signature', `Signature (${SIGNATURE_THEMES.length})`],
              ['classic', 'Classic (23)'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setGroup(id)}
              className={`rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-all ${
                group === id
                  ? 'bg-[#1db954] text-black'
                  : 'bg-[#222222] text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-0.5">
          {visibleThemes.map((key) => {
            const t = THEMES[key];
            const on = state.theme === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSetTheme(key)}
                aria-pressed={on}
                title={`${t.label} — ${t.desc}`}
                className={`flex items-center gap-1.5 min-h-10 rounded-lg px-2 py-1.5 text-left text-[11px] border transition-all ${
                  on
                    ? 'bg-[#1db954] border-[#1db954] font-semibold text-black shadow-sm'
                    : 'bg-[#222222] border-[#2e2e2e] text-[#d0d0d0] hover:bg-[#2a2a2a] hover:border-[#3e3e3e] hover:text-white'
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-3.5 w-3.5 shrink-0 ${on ? 'text-black' : 'text-[#1db954]'}`}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: t.icon }}
                />
                <span className="truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[#808080]">{currentTheme.desc}</p>
      </div>

      {/* 3. Background Color */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs uppercase tracking-wider font-bold text-[#1db954]">
            Card Background
          </label>
          <span className="text-xs font-mono text-[#b3b3b3]">
            {state.color}
          </span>
        </div>

        {/* Preset Palette */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((hex) => {
            const isSelected = state.color.toUpperCase() === hex.toUpperCase();
            return (
              <button
                key={hex}
                type="button"
                onClick={() => onChange({ color: hex, autoColor: false })}
                style={{ backgroundColor: hex }}
                aria-label={`Color ${hex}`}
                className={`w-7 h-7 rounded-full transition-transform active:scale-90 ${
                  isSelected
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121212] scale-110 shadow-lg'
                    : 'hover:scale-110 opacity-90 hover:opacity-100'
                }`}
              />
            );
          })}

          {/* Native Color Picker */}
          <label
            title="Pick custom color"
            className="relative w-7 h-7 rounded-full cursor-pointer overflow-hidden border border-white/20 hover:scale-110 transition-transform active:scale-90 shadow-sm"
            style={{
              background:
                'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
            }}
          >
            <input
            suppressHydrationWarning
              type="color"
              value={state.color}
              onChange={(e) =>
                onChange({ color: e.target.value.toUpperCase(), autoColor: false })
              }
              className="absolute -inset-4 w-16 h-16 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Cover Palette & Match Cover Button */}
        {coverPalette.length > 0 && (
          <div className="pt-2 space-y-1.5 border-t border-[#262626]">
            <span className="text-[11px] text-[#808080]">From the cover art:</span>
            <div className="flex flex-wrap items-center gap-2">
              {coverPalette.map((hex) => {
                const isSelected = state.color.toUpperCase() === hex.toUpperCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onChange({ color: hex, autoColor: false })}
                    style={{ backgroundColor: hex }}
                    title={`Cover color: ${hex}`}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      isSelected
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#121212] scale-110'
                        : 'hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                  />
                );
              })}
              <button
                type="button"
                onClick={onMatchCoverColor}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-[#333333] hover:border-white/20 text-xs font-medium text-[#d0d0d0] hover:text-white rounded-full transition-all active:scale-95 ml-auto"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#1db954]" />
                <span>Match Cover</span>
              </button>
            </div>
          </div>
        )}

        {/* Auto Color Toggle */}
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
          <input
            suppressHydrationWarning
            type="checkbox"
            checked={state.autoColor}
            onChange={(e) => onChange({ autoColor: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded border-[#444444] text-[#1db954] focus:ring-[#1db954] accent-[#1db954]"
          />
          <div>
            <span className="block text-xs font-medium text-white">Auto color from cover</span>
          </div>
        </label>
      </div>

      {/* 4. Auto-Fit & Typography Sizing */}
      <div className="space-y-3 pt-2 border-t border-[#262626]">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            suppressHydrationWarning
            type="checkbox"
            checked={state.autoFit}
            onChange={(e) => onChange({ autoFit: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded border-[#444444] text-[#1db954] focus:ring-[#1db954] accent-[#1db954]"
          />
          <div>
            <span className="block text-xs font-medium text-white">Auto-fit text</span>
          </div>
        </label>

        {/* Font size slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#b3b3b3]">
            <span>Lyrics Font Size</span>
            <span className="font-mono text-white font-medium">
              {renderedLyricSize || state.lyricSize} px
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Decrease lyrics font size"
              onClick={() => {
                const base = state.autoFit
                  ? (renderedLyricSize || state.lyricSize)
                  : state.lyricSize;
                onChange({
                  lyricSize: Math.max(16, base - 2),
                  autoFit: false,
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-[#444444] hover:border-white bg-[#222222] text-white transition-all active:scale-95"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              suppressHydrationWarning
              type="range"
              min={16}
              max={120}
              value={
                state.autoFit
                  ? (renderedLyricSize || state.lyricSize)
                  : state.lyricSize
              }
              onChange={(e) =>
                onChange({
                  lyricSize: parseInt(e.target.value, 10),
                  autoFit: false,
                })
              }
              className="flex-1 accent-[#1db954] cursor-pointer"
            />
            <button
              type="button"
              aria-label="Increase lyrics font size"
              onClick={() => {
                const base = state.autoFit
                  ? (renderedLyricSize || state.lyricSize)
                  : state.lyricSize;
                onChange({
                  lyricSize: Math.min(120, base + 2),
                  autoFit: false,
                });
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-[#444444] hover:border-white bg-[#222222] text-white transition-all active:scale-95"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          {hasTextOverflow && (
            <p className="text-xs text-[#ff7b7b]">Lyrics don't fit.</p>
          )}
        </div>

        {/* Transparent Background */}
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
          <input
            suppressHydrationWarning
            type="checkbox"
            checked={state.transparent}
            onChange={(e) => onChange({ transparent: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded border-[#444444] text-[#1db954] focus:ring-[#1db954] accent-[#1db954]"
          />
          <div>
            <span className="block text-xs font-medium text-white">Transparent export</span>
          </div>
        </label>
      </div>
    </div>
  );
});
