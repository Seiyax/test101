import React, { useState, useEffect, useRef } from 'react';
import { SearchResult } from '../../types';
import {
  searchItunes,
  fetchSpotifyCover,
  SearchError,
} from '../../services/musicSearch';
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from '../../utils/storage';
import { Search, ChevronDown, Check, Loader2, Link2 } from 'lucide-react';

interface SearchSectionProps {
  onSelectSong: (song: SearchResult) => void;
  onSpotifyTrack: (coverUrl: string, trackId: string | null, title?: string) => void;
  onToast: (msg: string) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = React.memo(({
  onSelectSong,
  onSpotifyTrack,
  onToast,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHint, setSearchHint] = useState<{ text: string; isError?: boolean } | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Spotify Link
  const [showSpotifyBox, setShowSpotifyBox] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isFetchingSpotify, setIsFetchingSpotify] = useState(false);
  const [spotifyHint, setSpotifyHint] = useState<{ text: string; isError?: boolean } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchSeqRef = useRef(0);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Debounced search-as-you-type
  useEffect(() => {
    if (query.trim().length < 2) {
      searchSeqRef.current += 1;
      setResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    const seq = ++searchSeqRef.current;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchHint(null);
      try {
        const hits = await searchItunes(query.trim());
        if (seq !== searchSeqRef.current) return;
        setResults(hits);
        setShowDropdown(true);
        setSearchHint({
          text: `${hits.length} songs found. Pick one from the list.`,
        });
      } catch (err: any) {
        if (seq !== searchSeqRef.current) return;
        setResults([]);
        setSearchHint({
          text:
            err instanceof SearchError
              ? err.message
              : 'Failed to search iTunes.',
          isError: true,
        });
      } finally {
        if (seq === searchSeqRef.current) {
          setIsSearching(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setSearchHint({ text: 'Type a song or artist to search for.', isError: true });
      return;
    }
    const seq = ++searchSeqRef.current;
    setIsSearching(true);
    setSearchHint(null);
    try {
      const hits = await searchItunes(query.trim());
      if (seq !== searchSeqRef.current) return;
      setResults(hits);
      setShowDropdown(true);
      setSearchHint({ text: `${hits.length} songs found. Pick one below.` });
      const updated = addRecentSearch(query.trim());
      setRecent(updated);
    } catch (err: any) {
      if (seq !== searchSeqRef.current) return;
      setResults([]);
      setSearchHint({
        text:
          err instanceof SearchError
            ? err.message
            : 'Something went wrong. Please try again.',
        isError: true,
      });
    } finally {
      if (seq === searchSeqRef.current) {
        setIsSearching(false);
      }
    }
  };

  const handleSelect = (song: SearchResult) => {
    onSelectSong(song);
    const updated = addRecentSearch(`${song.title} ${song.artist}`);
    setRecent(updated);
    setShowDropdown(false);
    onToast(`Loaded "${song.title}" by ${song.artist}`);
  };

  const handleSpotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyUrl.trim()) {
      setSpotifyHint({
        text: 'Paste a Spotify track link first.',
        isError: true,
      });
      return;
    }

    setIsFetchingSpotify(true);
    setSpotifyHint({ text: 'Fetching cover from Spotify…' });
    try {
      const { coverUrl, trackId, title } = await fetchSpotifyCover(spotifyUrl.trim());
      onSpotifyTrack(coverUrl, trackId, title);
      setSpotifyHint({ text: 'Cover found!', isError: false });
      onToast('Cover art fetched from Spotify!');
    } catch (err: any) {
      setSpotifyHint({
        text:
          err instanceof SearchError
            ? err.message
            : 'Could not fetch Spotify track.',
        isError: true,
      });
    } finally {
      setIsFetchingSpotify(false);
    }
  };

  const handleRecentClear = () => {
    clearRecentSearches();
    setRecent([]);
  };

  return (
    <div className="space-y-5" ref={containerRef}>
      <h2 className="text-xs font-bold uppercase tracking-wider text-[#1db954]">Search</h2>

      {/* Search Input Form */}
      <form onSubmit={handleManualSearch} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-[#707070] pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#1db954]" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
            placeholder="Search song or artist..."
            className="w-full pl-10 pr-24 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 px-3.5 py-1.5 bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold text-xs rounded-lg transition-all active:scale-95"
          >
            {isSearching ? 'Searching' : 'Search'}
          </button>
        </div>

        {searchHint && (
          <p
            className={`mt-2 text-xs ${
              searchHint.isError ? 'text-[#ff7b7b]' : 'text-[#1db954]'
            }`}
          >
            {searchHint.text}
          </p>
        )}

        {/* Results Dropdown */}
        {showDropdown && results.length > 0 && (
          <ul
            role="listbox"
            className="absolute top-full left-0 right-0 mt-2 z-30 max-h-72 overflow-y-auto bg-[#1e1e1e] border border-[#333333] rounded-xl shadow-2xl p-1.5 space-y-1"
          >
            {results.map((song, i) => (
              <li key={`${song.title}-${song.artist}-${i}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(song)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left group"
                >
                  <img
                    src={song.thumb}
                    alt=""
                    className="w-11 h-11 rounded-md object-cover bg-[#333333] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-[#1db954] transition-colors">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-[#a0a0a0] truncate">
                      {[song.artist, song.album].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-[#1db954] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      {/* Recent Searches */}
      {recent.length > 0 && !query && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-[#808080]">
            <span>Recent searches</span>
            <button
              type="button"
              onClick={handleRecentClear}
              className="hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recent.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item);
                }}
                className="px-3 py-1 bg-[#222222] hover:bg-[#2a2a2a] border border-[#333333] hover:border-[#1db954] text-xs text-[#d0d0d0] hover:text-white rounded-full transition-all truncate max-w-full"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spotify URL Link Box */}
      <div className="pt-2 border-t border-[#262626]">
        <button
          type="button"
          onClick={() => setShowSpotifyBox((prev) => !prev)}
          className="flex items-center gap-2 text-xs font-medium text-[#b3b3b3] hover:text-white transition-colors"
          aria-expanded={showSpotifyBox}
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              showSpotifyBox ? 'rotate-180 text-[#1db954]' : ''
            }`}
          />
          <Link2 className="w-3.5 h-3.5" />
          <span>Or paste a Spotify Track Link</span>
        </button>

        {showSpotifyBox && (
          <form
            onSubmit={handleSpotifySubmit}
            className="mt-3 p-3 bg-white/[0.03] border border-[#2e2e2e] rounded-xl space-y-2"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="w-full pl-3 pr-20 py-2 bg-[#222222] border border-[#383838] focus:border-[#1db954] focus:ring-2 focus:ring-[#1db954]/20 rounded-lg text-xs text-white placeholder-[#606060] outline-none"
                spellCheck="false"
              />
              <button
                type="submit"
                disabled={isFetchingSpotify}
                className="absolute right-1 px-3 py-1 bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold text-xs rounded-md transition-all"
              >
                {isFetchingSpotify ? 'Fetching' : 'Fetch'}
              </button>
            </div>
            {spotifyHint && (
              <p
                className={`text-xs ${
                  spotifyHint.isError ? 'text-[#ff7b7b]' : 'text-[#1db954]'
                }`}
              >
                {spotifyHint.text}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
});
