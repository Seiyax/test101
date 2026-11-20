import React, { useState, useEffect } from 'react';
import { BgStyle, CardState, SavedLook } from '../../types';
import {
  deleteLook,
  encodeLookHash,
  getSavedLooks,
  saveLook,
} from '../../utils/storage';
import { Bookmark, Check, Trash2, Share2 } from 'lucide-react';

interface LooksSectionProps {
  state: CardState;
  onApplyLook: (look: SavedLook['look']) => void;
  onToast: (msg: string) => void;
}

export const LooksSection: React.FC<LooksSectionProps> = React.memo(({
  state,
  onApplyLook,
  onToast,
}) => {
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [lookName, setLookName] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setLooks(getSavedLooks());
  }, []);

  const handleSaveLook = (e: React.FormEvent) => {
    e.preventDefault();
    const name =
      lookName.trim().slice(0, 24) || `Look ${looks.length + 1}`;
    const lookData: SavedLook['look'] = {
      t: state.theme,
      c: state.color,
      g: state.glareAuto ? 'auto' : state.glareStyle,
      gi: state.glare,
      l: state.layoutKey,
      cs: state.hide.cover ? 'hidden' : state.coverShape,
      lf: state.lyricFont,
      bg: state.bgStyle,
      d: state.cardDepth,
      a: state.align,
      ac: state.autoColor,
    };
    const next = saveLook(name, lookData);
    setLooks(next);
    setLookName('');
    onToast(`Saved look "${name}"`);
  };

  const handleDeleteLook = (index: number, name: string) => {
    const next = deleteLook(index);
    setLooks(next);
    onToast(`Deleted "${name}"`);
  };

  const handleCopyLink = async () => {
    const lookData: SavedLook['look'] = {
      t: state.theme,
      c: state.color,
      g: state.glareAuto ? 'auto' : state.glareStyle,
      gi: state.glare,
      l: state.layoutKey,
      cs: state.hide.cover ? 'hidden' : state.coverShape,
      lf: state.lyricFont,
      bg: state.bgStyle,
      d: state.cardDepth,
      a: state.align,
      ac: state.autoColor,
      ti: state.title.slice(0, 80),
      ar: state.artist.slice(0, 80),
      ly: state.lyrics.slice(0, 700),
    };

    if (
      state.coverUrl &&
      /^https:\/\/[^?#\s]{1,300}$/i.test(state.coverUrl.trim())
    ) {
      lookData.cu = state.coverUrl.trim();
    }

    const hashStr = '#look=' + encodeLookHash(lookData);
    const fullUrl = window.location.href.split('#')[0] + hashStr;
    window.history.replaceState(null, '', hashStr);

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      onToast('Shareable link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      onToast('Could not access clipboard. Copy from browser address bar.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#1db954]">Looks</h2>

      {/* Backdrop behind the card */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-[#b3b3b3]">
          Backdrop Behind Card
        </label>
        <select
          value={state.bgStyle}
          onChange={(e) =>
            onApplyLook({
              t: state.theme,
              c: state.color,
              g: state.glareAuto ? 'auto' : state.glareStyle,
              gi: state.glare,
              l: state.layoutKey,
              cs: state.hide.cover ? 'hidden' : state.coverShape,
              lf: state.lyricFont,
              bg: e.target.value as BgStyle,
              d: state.cardDepth,
              a: state.align,
              ac: state.autoColor,
            })
          }
          className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]"
        >
          <option value="none">None (Direct background)</option>
          <option value="blur">Blurred album cover</option>
          <option value="gradient">Atmospheric gradient</option>
          <option value="pattern">Dot pattern matrix</option>
        </select>
        <p className="text-[11px] text-[#808080]">
          Inlays the card into an ambient canvas backdrop for wallpapers and social posts.
        </p>
      </div>

      {/* Save this Look */}
      <form onSubmit={handleSaveLook} className="space-y-2 pt-2 border-t border-[#262626]">
        <label className="block text-xs font-medium text-[#b3b3b3]">
          Save Current Look
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={lookName}
            onChange={(e) => setLookName(e.target.value)}
            maxLength={24}
            placeholder="Name this look, e.g. Night Drive"
            className="flex-1 px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white placeholder-[#707070] outline-none focus:border-[#1db954]"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
        <p className="text-[11px] text-[#808080]">
          Saves theme, colors, depth, lighting, typography, and card geometry.
        </p>

        {/* Saved Looks List */}
        {looks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {looks.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#222222] border border-[#383838] rounded-full text-xs text-[#d0d0d0] hover:border-[#1db954] transition-all"
              >
                <button
                  type="button"
                  onClick={() => {
                    onApplyLook(item.look);
                    onToast(`Applied look "${item.name}"`);
                  }}
                  className="hover:text-white font-medium"
                >
                  {item.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLook(idx, item.name)}
                  aria-label={`Delete look ${item.name}`}
                  className="text-[#707070] hover:text-[#ff7b7b] transition-colors p-0.5 ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Shareable Link */}
      <div className="pt-2 border-t border-[#262626] space-y-2">
        <label className="block text-xs font-medium text-[#b3b3b3]">
          Shareable Link
        </label>
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-[#383838] hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all active:scale-98 shadow-sm"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-[#1db954]" />
              <span className="text-[#1db954]">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-[#1db954]" />
              <span>Copy Link to this Card</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-[#808080]">
          Generates a hash URL holding the layout, colors, typography, lyrics, and public artwork link.
        </p>
      </div>
    </div>
  );
});
