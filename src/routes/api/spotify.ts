import { createFileRoute } from '@tanstack/react-router';

const SPOTIFY_TRACK_RE =
  /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]+)/i;
const SPOTIFY_OEMBED = 'https://open.spotify.com/oembed';

export const Route = createFileRoute('/api/spotify')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const reqUrl = new URL(request.url);
        const rawUrl = (reqUrl.searchParams.get('url') || '').trim();
        const match = rawUrl.match(SPOTIFY_TRACK_RE);

        if (!match) {
          return Response.json(
            {
              error:
                'That does not look like a Spotify track link. It should start with https://open.spotify.com/track/',
            },
            { status: 400 }
          );
        }

        const trackId = match[1];
        const canonical = `https://open.spotify.com/track/${trackId}`;
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);

        try {
          const upstream = await fetch(
            `${SPOTIFY_OEMBED}?url=${encodeURIComponent(canonical)}`,
            {
              signal: ctrl.signal,
              headers: {
                Accept: 'application/json',
              },
            }
          );

          if (!upstream.ok) {
            return Response.json(
              {
                error:
                  upstream.status === 404
                    ? 'Spotify could not find that track. Check the link and try again.'
                    : `Spotify returned an error (${upstream.status}). Please try again in a moment.`,
              },
              { status: upstream.status }
            );
          }

          const data = (await upstream.json()) as {
            thumbnail_url?: string;
            title?: string;
            author_name?: string;
          };

          if (!data?.thumbnail_url) {
            return Response.json(
              { error: 'Spotify did not return a cover image for this track.' },
              { status: 502 }
            );
          }

          return Response.json(
            {
              coverUrl: data.thumbnail_url,
              trackId,
              title: typeof data.title === 'string' ? data.title : undefined,
              authorName:
                typeof data.author_name === 'string' ? data.author_name : undefined,
            },
            {
              headers: {
                'Cache-Control': 'public, max-age=3600',
              },
            }
          );
        } catch {
          return Response.json(
            { error: "Couldn't reach Spotify right now. Please try again." },
            { status: 502 }
          );
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
