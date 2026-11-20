import React from 'react';
import { CardState } from '../../types';
import { Sparkles } from 'lucide-react';

interface TextSectionProps {
  state: CardState;
  onChange: (updates: Partial<CardState>) => void;
  onOpenLyricsModal: () => void;
}

export const TextSection: React.FC<TextSectionProps> = React.memo(({
  state,
  onChange,
  onOpenLyricsModal,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#1db954]">Song</h2>

      {/* Cover URL */}
      <div className="space-y-1.5">
        <label
          htmlFor="coverUrl"
          className="block text-xs font-medium text-[#b3b3b3]"
        >
          Cover URL
        </label>
        <input
          id="coverUrl"
          type="text"
          value={state.coverUrl}
          onChange={(e) => onChange({ coverUrl: e.target.value })}
          placeholder="https://example.com/album-cover.jpg"
          className="w-full px-3.5 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all"
          spellCheck="false"
        />
        <p className="text-[11px] text-[#808080]">
          Direct image link (CORS enabled) or fetched automatically via Search.
        </p>
      </div>

      {/* Song Title */}
      <div className="space-y-1.5">
        <label
          htmlFor="songTitle"
          className="block text-xs font-medium text-[#b3b3b3]"
        >
          Song Title
        </label>
        <input
          id="songTitle"
          type="text"
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Enter song title..."
          className="w-full px-3.5 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all"
        />
      </div>

      {/* Artist Name */}
      <div className="space-y-1.5">
        <label
          htmlFor="artistName"
          className="block text-xs font-medium text-[#b3b3b3]"
        >
          Artist Name
        </label>
        <input
          id="artistName"
          type="text"
          value={state.artist}
          onChange={(e) => onChange({ artist: e.target.value })}
          placeholder="Enter artist name..."
          className="w-full px-3.5 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all"
        />
      </div>

      {/* Lyrics Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="lyrics"
            className="text-xs font-medium text-[#b3b3b3]"
          >
            Lyrics
          </label>
          <button
            type="button"
            onClick={onOpenLyricsModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#1e1e1e] hover:bg-white/10 border border-[#383838] hover:border-white/20 text-[#1db954] hover:text-[#1ed760] text-xs font-medium rounded-full transition-all active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Lyrics</span>
          </button>
        </div>
        <textarea
          id="lyrics"
          rows={5}
          value={state.lyrics}
          onChange={(e) => onChange({ lyrics: e.target.value })}
          placeholder="Type or paste your favorite lyrics here. Line breaks are kept intact."
          className="w-full px-3.5 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all resize-y leading-relaxed font-sans"
        />
      </div>
    </div>
  );
});
