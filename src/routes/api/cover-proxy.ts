import { createFileRoute } from '@tanstack/react-router';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

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
  // Block private IPv4 literals (10/8, 127/8, 169.254/16, 172.16/12, 192.168/16)
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
  // Block link-local / unique-local IPv6 literals
  if (/^(fc|fd|fe8|fe9|fea|feb)/i.test(host)) {
    return true;
  }
  return false;
}

export const Route = createFileRoute('/api/cover-proxy')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const reqUrl = new URL(request.url);
        const rawTarget = (reqUrl.searchParams.get('url') || '').trim();

        let target: URL;
        try {
          target = new URL(rawTarget);
        } catch {
          return new Response('Invalid URL', { status: 400 });
        }

        if (target.protocol !== 'https:' && target.protocol !== 'http:') {
          return new Response('Only HTTP(S) URLs are allowed', { status: 400 });
        }
        if (isBlockedHost(target.hostname)) {
          return new Response('Blocked host', { status: 403 });
        }

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000);

        try {
          const upstream = await fetch(target.toString(), {
            signal: ctrl.signal,
            redirect: 'follow',
            headers: {
              Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8',
            },
          });

          if (!upstream.ok) {
            return new Response(`Upstream error ${upstream.status}`, {
              status: upstream.status,
            });
          }

          // Re-check final URL after redirects
          if (upstream.url) {
            try {
              const finalUrl = new URL(upstream.url);
              if (isBlockedHost(finalUrl.hostname)) {
                return new Response('Blocked redirect host', { status: 403 });
              }
            } catch {
              return new Response('Invalid redirect URL', { status: 502 });
            }
          }

          const contentType = upstream.headers.get('content-type') || '';
          if (!contentType.toLowerCase().startsWith('image/')) {
            return new Response('URL did not return an image', { status: 415 });
          }

          const contentLength = Number(upstream.headers.get('content-length') || 0);
          if (contentLength > MAX_BYTES) {
            return new Response('Image too large', { status: 413 });
          }

          const buf = await upstream.arrayBuffer();
          if (buf.byteLength > MAX_BYTES) {
            return new Response('Image too large', { status: 413 });
          }

          return new Response(buf, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=86400',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch {
          return new Response('Failed to fetch cover image', { status: 502 });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
