import { SearchResult } from '../types';

export class SearchError extends Error {
  http?: boolean;
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'SearchError';
    if (status !== undefined) {
      this.http = true;
      this.status = status;
    }
  }
}

export const ITUNES_URL = 'https://itunes.apple.com/search';
export const SPOTIFY_OEMBED = 'https://open.spotify.com/oembed';
export const REQUEST_TIMEOUT = 8000;
export const SPOTIFY_TRACK_RE =
  /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]+)/i;

export const netMsg = (m: string) =>
  navigator.onLine === false
    ? "You're offline. Searching needs an internet connection, but you can still edit and export your card."
    : m;

export async function fetchJson<T = any>(
  url: string,
  timeout = REQUEST_TIMEOUT
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      referrerPolicy: 'no-referrer',
    });
    if (!res.ok) {
      throw new SearchError(`HTTP ${res.status}`, res.status);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

let jsonpCounter = 0;
export function jsonp<T = any>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const cb = '__itunesCb' + ++jsonpCounter;
    const script = document.createElement('script');

    const cleanup = () => {
      clearTimeout(timer);
      delete (window as any)[cb];
      script.remove();
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('jsonp timeout'));
    }, REQUEST_TIMEOUT);

    (window as any)[cb] = (data: T) => {
      cleanup();
      resolve(data);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error('jsonp network error'));
    };

    script.src = url + '&callback=' + cb;
    document.head.appendChild(script);
  });
}

export async function searchItunes(query: string): Promise<SearchResult[]> {
  const url = `${ITUNES_URL}?term=${encodeURIComponent(
    query
  )}&entity=song&limit=8`;

  let data: any;
  try {
    data = await fetchJson(url);
  } catch (err: any) {
    if (err instanceof SearchError && err.http) {
      throw new SearchError(
        `iTunes returned an error (${err.status}). Please try again in a moment.`
      );
    }
    try {
      data = await jsonp(url);
    } catch {
      throw new SearchError(
        netMsg(
          "Couldn't reach iTunes. Check your internet connection and try again."
        )
      );
    }
  }

  const hits = (
    data && Array.isArray(data.results) ? data.results : []
  ).filter((h: any) => h.artworkUrl100);

  if (!hits.length) {
    throw new SearchError(
      `No results found for "${query}". Try different keywords.`
    );
  }

  return hits.map((h: any) => ({
    thumb: h.artworkUrl100,
    cover: h.artworkUrl100.replace('100x100', '600x600'),
    title: h.trackName || '',
    artist: h.artistName || '',
    album: h.collectionName || '',
    duration: h.trackTimeMillis ? Math.round(h.trackTimeMillis / 1000) : 0,
    previewUrl: typeof h.previewUrl === 'string' ? h.previewUrl : null,
  }));
}

export async function findTrackPreview(
  title: string,
  artist: string
): Promise<{ previewUrl: string | null; duration: number }> {
  const cleanT = title
    .replace(/\s*[([].*?[)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .trim();
  const cleanA = artist
    .replace(/\s*[([].*?[)\]]/g, '')
    .split(/\s*(?:,|&|;|\band\b|\bfeat\.?|\bft\.?)\s*/i)[0]
    .trim();
  const q = [cleanT || title.trim(), cleanA || artist.trim()].filter(Boolean).join(' ');
  if (!q) return { previewUrl: null, duration: 0 };
  try {
    const hits = await searchItunes(q);
    const normTitle = (cleanT || title.trim()).toLowerCase();
    const normArtist = (cleanA || artist.trim()).toLowerCase();
    const titleMatches = (hTitle: string) => {
      const lt = hTitle.toLowerCase();
      return lt.includes(normTitle) || normTitle.includes(lt);
    };
    const artistMatches = (hArtist: string) => {
      if (!normArtist) return true;
      const la = hArtist.toLowerCase();
      return la.includes(normArtist) || normArtist.includes(la);
    };
    const match =
      hits.find((h) => h.previewUrl && titleMatches(h.title) && artistMatches(h.artist)) ||
      hits.find((h) => h.previewUrl && titleMatches(h.title)) ||
      null;
    return {
      previewUrl: match?.previewUrl ?? null,
      duration: match?.duration ?? 0,
    };
  } catch {
    return { previewUrl: null, duration: 0 };
  }
}

export async function fetchSpotifyCover(
  rawUrl: string
): Promise<{ coverUrl: string; trackId: string | null; title?: string }> {
  const match = rawUrl.match(SPOTIFY_TRACK_RE);
  if (!match) {
    throw new SearchError(
      'That does not look like a Spotify track link. It should start with https://open.spotify.com/track/'
    );
  }

  const trackId = match[1];
  const canonical = `https://open.spotify.com/track/${trackId}`;

  // Prefer server proxy route to avoid browser CORS failures
  try {
    const res = await fetch(
      `/api/spotify?url=${encodeURIComponent(canonical)}`
    );
    const body = (await res.json().catch(() => null)) as {
      coverUrl?: string;
      trackId?: string;
      title?: string;
      error?: string;
    } | null;

    if (res.ok && body?.coverUrl) {
      return {
        coverUrl: body.coverUrl,
        trackId: body.trackId || trackId,
        title: body.title,
      };
    }
    if (res.status === 400 || res.status === 404) {
      throw new SearchError(
        body?.error ||
          'Spotify could not find that track. Check the link and try again.',
        res.status
      );
    }
  } catch (err) {
    if (err instanceof SearchError) throw err;
    // Fall back to direct oEmbed if server route is unavailable
  }

  let data: any;
  try {
    data = await fetchJson(
      `${SPOTIFY_OEMBED}?url=${encodeURIComponent(canonical)}`
    );
  } catch (err: any) {
    if (err instanceof SearchError && err.http) {
      throw new SearchError(
        err.status === 404
          ? 'Spotify could not find that track. Check the link and try again.'
          : `Spotify returned an error (${err.status}). Please try again in a moment.`
      );
    }
    throw new SearchError(
      netMsg(
        "Couldn't reach Spotify (network issue or blocked by CORS). Try the keyword search instead."
      )
    );
  }

  if (!data || !data.thumbnail_url) {
    throw new SearchError(
      'Spotify did not return a cover image for this track.'
    );
  }
  return {
    coverUrl: data.thumbnail_url,
    trackId,
    title: typeof data.title === 'string' ? data.title : undefined,
  };
}
