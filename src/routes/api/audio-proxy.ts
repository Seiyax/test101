import { createFileRoute } from '@tanstack/react-router';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

const WEB_CTX = {
  client: {
    clientName: 'WEB',
    clientVersion: '2.20250214.01.00',
    hl: 'en',
    gl: 'US',
  },
};

const IOS_UA =
  'com.google.ios.youtube/20.03.02 (iPhone16,2; U; CPU iOS 18_2_1 like Mac OS X;)';
const IOS_CTX = {
  client: {
    clientName: 'IOS',
    clientVersion: '20.03.02',
    deviceMake: 'Apple',
    deviceModel: 'iPhone16,2',
    userAgent: IOS_UA,
    osName: 'iPhone',
    osVersion: '18.2.1.22C161',
    hl: 'en',
    gl: 'US',
  },
};

interface CachedAudioEntry {
  buf: ArrayBuffer;
  contentType: string;
  kind: 'full' | 'preview';
  durationSec: number;
}

const audioCache = new Map<string, CachedAudioEntry>();

function putCache(key: string, entry: CachedAudioEntry) {
  if (audioCache.size >= 12) {
    const oldest = audioCache.keys().next().value;
    if (oldest) audioCache.delete(oldest);
  }
  audioCache.set(key, entry);
}

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === '0.0.0.0' ||
    host === '::1'
  ) {
    return true;
  }
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return true;
    }
  }
  if (/^(fc|fd|fe8|fe9|fea|feb)/i.test(host)) {
    return true;
  }
  return false;
}

interface VideoCandidate {
  videoId: string;
  title: string;
  owner: string;
  duration: number;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

async function resolveFullTrackAudio(
  title: string,
  artist: string,
  targetDur: number
): Promise<CachedAudioEntry | null> {
  const cleanT = title
    .replace(/\s*[([].*?[)\]]/g, '')
    .replace(/\s+-\s+.*$/, '')
    .trim();
  const cleanA = artist
    .replace(/\s*[([].*?[)\]]/g, '')
    .split(/\s*(?:,|&|;|\band\b|\bfeat\.?|\bft\.?)\s*/i)[0]
    .trim();

  if (!cleanT) return null;

  const titleTokens = tokenize(cleanT);
  const artistTokens = tokenize(cleanA);
  const query = `${cleanA} - ${cleanT} official audio`.trim();

  try {
    const sr = await fetch(
      'https://www.youtube.com/youtubei/v1/search?prettyPrint=false',
      {
        method: 'POST',
        signal: AbortSignal.timeout(7000),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({ context: WEB_CTX, query }),
      }
    );
    if (!sr.ok) return null;
    const sj = (await sr.json()) as Record<string, unknown>;

    const candidates: VideoCandidate[] = [];
    const seen = new Set<string>();

    const walk = (node: unknown) => {
      if (!node || typeof node !== 'object') return;
      const obj = node as Record<string, any>;
      if (
        typeof obj.videoId === 'string' &&
        obj.videoId.length === 11 &&
        !seen.has(obj.videoId)
      ) {
        const t =
          obj.title?.runs?.[0]?.text || obj.title?.simpleText || '';
        const lenStr =
          obj.lengthText?.simpleText ||
          obj.lengthText?.runs?.[0]?.text ||
          '';
        const owner =
          obj.ownerText?.runs?.[0]?.text ||
          obj.longBylineText?.runs?.[0]?.text ||
          '';
        if (t && lenStr) {
          seen.add(obj.videoId);
          const parts = String(lenStr)
            .split(':')
            .map((n) => Number(n));
          const sec =
            parts.length === 2
              ? parts[0] * 60 + parts[1]
              : parts.length === 3
              ? parts[0] * 3600 + parts[1] * 60 + parts[2]
              : 0;
          if (sec >= 45 && sec <= 720) {
            candidates.push({
              videoId: obj.videoId,
              title: String(t),
              owner: String(owner),
              duration: sec,
            });
          }
        }
      }
      for (const v of Object.values(obj)) {
        walk(v);
      }
    };
    walk(sj);

    if (!candidates.length) return null;

    const scoreCandidate = (c: VideoCandidate): number => {
      const combined = `${c.title} ${c.owner}`.toLowerCase();
      const lt = c.title.toLowerCase();
      const lo = c.owner.toLowerCase();

      // Require title token overlap so fictional or unrelated queries don't match random tracks
      if (titleTokens.length > 0) {
        const matchedTitle = titleTokens.filter((tok) =>
          combined.includes(tok)
        ).length;
        if (matchedTitle === 0) return -999;
      }

      let s = 0;
      if (artistTokens.length > 0) {
        const matchedArtist = artistTokens.filter((tok) =>
          combined.includes(tok)
        ).length;
        if (matchedArtist > 0) s += 22;
        else s -= 25;
      }

      if (targetDur > 45) {
        const diff = Math.abs(c.duration - targetDur);
        s -= diff * 4.5;
        if (diff <= 2) s += 40;
        else if (diff <= 4) s += 25;
        else if (diff <= 8) s += 10;
        else if (diff > 25) s -= 40;
      }

      if (lo.includes('topic')) s += 26;
      if (lt.includes('official audio')) s += 22;
      else if (lt.includes('audio') || lt.includes('lyric')) s += 14;
      if (lt.includes('official video') || lt.includes('music video')) s -= 14;

      const queryLower = `${cleanT} ${cleanA}`.toLowerCase();
      for (const bad of [
        'live',
        'remix',
        'slowed',
        'sped up',
        'nightcore',
        'karaoke',
        'instrumental',
        'cover',
        '8d',
        'reverb',
      ]) {
        if (lt.includes(bad) && !queryLower.includes(bad)) {
          s -= 45;
        }
      }
      return s;
    };

    const ranked = candidates
      .map((c) => ({ c, score: scoreCandidate(c) }))
      .filter((x) => x.score > -100)
      .sort((a, b) => b.score - a.score);

    for (const { c } of ranked.slice(0, 3)) {
      try {
        const pr = await fetch(
          'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
          {
            method: 'POST',
            signal: AbortSignal.timeout(7000),
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': IOS_UA,
            },
            body: JSON.stringify({
              context: IOS_CTX,
              videoId: c.videoId,
              contentCheckOk: true,
              racyCheckOk: true,
            }),
          }
        );
        if (!pr.ok) continue;
        const pj = (await pr.json()) as Record<string, any>;
        if (pj?.playabilityStatus?.status !== 'OK') continue;

        const fmts: any[] = pj?.streamingData?.adaptiveFormats || [];
        // Prefer compact m4a (itag 139 / 140) so the entire song is ~1.2 MB and downloads in ~150ms
        const m4aFormats = fmts
          .filter(
            (f) =>
              typeof f?.url === 'string' &&
              typeof f?.mimeType === 'string' &&
              f.mimeType.startsWith('audio/mp4')
          )
          .sort(
            (a, b) =>
              Number(a.bitrate || 64000) - Number(b.bitrate || 64000)
          );
        const chosen =
          m4aFormats[0] ||
          fmts.find(
            (f) =>
              typeof f?.url === 'string' &&
              typeof f?.mimeType === 'string' &&
              f.mimeType.startsWith('audio/')
          );
        if (!chosen?.url) continue;

        const mediaRes = await fetch(chosen.url, {
          signal: AbortSignal.timeout(10000),
          headers: {
            'User-Agent': IOS_UA,
            Accept: 'audio/*,*/*;q=0.8',
          },
        });
        if (!mediaRes.ok) continue;
        const buf = await mediaRes.arrayBuffer();
        if (buf.byteLength < 4096 || buf.byteLength > MAX_BYTES) continue;

        const durMs = Number(chosen.approxDurationMs || 0);
        const durationSec =
          durMs > 0 ? Math.round(durMs / 1000) : c.duration;
        const contentType = String(chosen.mimeType || 'audio/mp4')
          .split(';')[0]
          .trim();

        return {
          buf,
          contentType,
          kind: 'full',
          durationSec,
        };
      } catch {
        // try next candidate
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function fetchDirectAudioUrl(
  rawTarget: string
): Promise<CachedAudioEntry | null> {
  let target: URL;
  try {
    target = new URL(rawTarget);
  } catch {
    return null;
  }

  if (target.protocol !== 'https:' && target.protocol !== 'http:') {
    return null;
  }
  if (isBlockedHost(target.hostname)) {
    return null;
  }

  try {
    const upstream = await fetch(target.toString(), {
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
      headers: {
        Accept: 'audio/*,application/octet-stream,*/*;q=0.8',
      },
    });
    if (!upstream.ok) return null;

    if (upstream.url) {
      const finalUrl = new URL(upstream.url);
      if (isBlockedHost(finalUrl.hostname)) return null;
    }

    const contentType = (
      upstream.headers.get('content-type') || 'audio/mp4'
    )
      .split(';')[0]
      .trim()
      .toLowerCase();
    if (
      !contentType.startsWith('audio/') &&
      !contentType.startsWith('video/mp4') &&
      !contentType.startsWith('application/octet-stream')
    ) {
      return null;
    }

    const contentLength = Number(
      upstream.headers.get('content-length') || 0
    );
    if (contentLength > MAX_BYTES) return null;

    const buf = await upstream.arrayBuffer();
    if (buf.byteLength < 512 || buf.byteLength > MAX_BYTES) return null;

    return {
      buf,
      contentType,
      kind: 'preview',
      durationSec: 30,
    };
  } catch {
    return null;
  }
}

function serveAudioBuffer(
  request: Request,
  entry: CachedAudioEntry
): Response {
  const total = entry.buf.byteLength;
  const rangeHeader = request.headers.get('range');

  const baseHeaders: Record<string, string> = {
    'Content-Type': entry.contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Expose-Headers':
      'X-Audio-Kind, X-Track-Duration, Accept-Ranges, Content-Range',
    'X-Audio-Kind': entry.kind,
    'X-Track-Duration': String(entry.durationSec),
  };

  if (rangeHeader) {
    const m = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
    if (m) {
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? Math.min(total - 1, parseInt(m[2], 10)) : total - 1;
      if (start >= 0 && start <= end && start < total) {
        const slice = entry.buf.slice(start, end + 1);
        return new Response(slice, {
          status: 206,
          headers: {
            ...baseHeaders,
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Content-Length': String(slice.byteLength),
          },
        });
      }
    }
  }

  return new Response(entry.buf, {
    status: 200,
    headers: {
      ...baseHeaders,
      'Content-Length': String(total),
    },
  });
}

export const Route = createFileRoute('/api/audio-proxy')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const reqUrl = new URL(request.url);
        const title = (reqUrl.searchParams.get('title') || '').trim();
        const artist = (reqUrl.searchParams.get('artist') || '').trim();
        const duration = Number(reqUrl.searchParams.get('duration') || 0);
        const fallbackUrl = (
          reqUrl.searchParams.get('fallbackUrl') || ''
        ).trim();
        const rawTarget = (reqUrl.searchParams.get('url') || '').trim();

        // Mode 1: Resolve full-length song audio by title + artist + duration
        if (title) {
          const cacheKey = `track:${title.toLowerCase()}|${artist.toLowerCase()}|${Math.round(duration)}`;
          const cached = audioCache.get(cacheKey);
          if (cached) {
            return serveAudioBuffer(request, cached);
          }

          const fullEntry = await resolveFullTrackAudio(
            title,
            artist,
            duration
          );
          if (fullEntry) {
            putCache(cacheKey, fullEntry);
            return serveAudioBuffer(request, fullEntry);
          }

          if (fallbackUrl) {
            const fallbackEntry = await fetchDirectAudioUrl(fallbackUrl);
            if (fallbackEntry) {
              putCache(cacheKey, fallbackEntry);
              return serveAudioBuffer(request, fallbackEntry);
            }
          }

          return new Response('Track audio not found', { status: 404 });
        }

        // Mode 2: Direct URL proxy with byte-range seeking support
        if (!rawTarget) {
          return new Response('Missing url or title parameter', {
            status: 400,
          });
        }

        const urlCacheKey = `url:${rawTarget}`;
        const cachedUrl = audioCache.get(urlCacheKey);
        if (cachedUrl) {
          return serveAudioBuffer(request, cachedUrl);
        }

        const directEntry = await fetchDirectAudioUrl(rawTarget);
        if (!directEntry) {
          return new Response('Failed to fetch audio preview', {
            status: 502,
          });
        }

        putCache(urlCacheKey, directEntry);
        return serveAudioBuffer(request, directEntry);
      },
    },
  },
});
