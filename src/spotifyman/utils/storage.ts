import { CardState, SavedLook } from '../types';

export const LS_KEY = 'lyric-card-settings-v1';
export const RECENT_KEY = 'lyric-card-recent-v1';
export const LOOKS_KEY = 'lyric-card-looks-v1';

export function saveSettings(state: CardState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        color: state.color,
        theme: state.theme,
        align: state.align,
        fmt: state.fmt,
        glare: state.glare,
        glareStyle: state.glareStyle,
        cardDepth: state.cardDepth,
        hide: state.hide,
        autoFit: state.autoFit,
        lyricSize: state.lyricSize,
        scale: state.scale,
        coverShape: state.coverShape,
        lyricFont: state.lyricFont,
        bgStyle: state.bgStyle,
        glareAuto: state.glareAuto,
        autoColor: state.autoColor,
        layoutKey: state.layoutKey,
      })
    );
  } catch {
    // Storage quota or blocked
  }
}

export function loadSettings(): Partial<CardState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return {};
    const d = { ...raw } as Record<string, unknown>;
    // Migrate legacy `size` key to `lyricSize`
    if (typeof d.lyricSize !== 'number' && typeof d.size === 'number') {
      d.lyricSize = d.size;
    }
    delete d.size;
    return d as Partial<CardState>;
  } catch {
    return {};
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const a = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(a)
      ? a.filter((x) => typeof x === 'string').slice(0, 6)
      : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(q: string): string[] {
  if (!q.trim()) return getRecentSearches();
  const current = getRecentSearches();
  const next = [
    q.trim(),
    ...current.filter((x) => x.toLowerCase() !== q.trim().toLowerCase()),
  ].slice(0, 6);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

export function clearRecentSearches(): string[] {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    // Ignore storage errors
  }
  return [];
}

export function getSavedLooks(): SavedLook[] {
  if (typeof window === 'undefined') return [];
  try {
    const a = JSON.parse(localStorage.getItem(LOOKS_KEY) || '[]');
    return Array.isArray(a)
      ? a.filter((x) => x && typeof x.name === 'string' && x.look).slice(0, 12)
      : [];
  } catch {
    return [];
  }
}

export function saveLook(name: string, look: SavedLook['look']): SavedLook[] {
  const current = getSavedLooks();
  const filtered = current.filter(
    (p) => p.name.toLowerCase() !== name.toLowerCase()
  );
  const next: SavedLook[] = [{ name, look }, ...filtered].slice(0, 12);
  try {
    localStorage.setItem(LOOKS_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota errors
  }
  return next;
}

export function deleteLook(index: number): SavedLook[] {
  const current = getSavedLooks();
  current.splice(index, 1);
  try {
    localStorage.setItem(LOOKS_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage errors
  }
  return current;
}

export function encodeLookHash(obj: any): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeLookHash(hash: string): any {
  return JSON.parse(
    decodeURIComponent(escape(atob(hash.replace(/-/g, '+').replace(/_/g, '/'))))
  );
}
