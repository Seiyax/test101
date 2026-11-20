export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  let h = String(hex || '').trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Perceived luminance 0-255 */
export function luma(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

/** Contrast text color (#000000 or #FFFFFF) */
export function contrastColor(hex: string): string {
  return luma(hex) > 150 ? '#000000' : '#FFFFFF';
}

/** Blend two #RRGGBB colors (t = 0 -> a, t = 1 -> b) */
export function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const f = (x: number, y: number) =>
    Math.min(255, Math.max(0, Math.round(x + (y - x) * t)));
  return (
    '#' +
    [f(A.r, B.r), f(A.g, B.g), f(A.b, B.b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function rgb2hsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  let h = 0;
  let sat = 0;
  if (mx !== mn) {
    const d = mx - mn;
    sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h =
      mx === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : mx === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
    h /= 6;
  }
  return [h, sat, l];
}

export function hsl2hex(h: number, sat: number, l: number): string {
  const f = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + sat) : l + sat - l * sat;
  const p = 2 * l - q;
  return (
    '#' +
    [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)]
      .map((v) =>
        Math.min(255, Math.max(0, Math.round(v * 255)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
      .toUpperCase()
  );
}

/** Extract up to `max` vivid, distinct colors from a 32 x 32 sample */
export function extractCoverColors(
  img: HTMLImageElement | HTMLCanvasElement,
  max = 5
): string[] {
  const S = 32;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d', { willReadFrequently: true });
  if (!x) return [];
  x.drawImage(img, 0, 0, S, S);
  const d = x.getImageData(0, 0, S, S).data;
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 200) continue;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const [, sat, l] = rgb2hsl(r, g, b);
    if (l < 0.12 || l > 0.9 || sat < 0.18) continue; // near-black, near-white, washed out
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5); // 8 levels per channel
    const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += r;
    e.g += g;
    e.b += b;
    buckets.set(key, e);
  }

  const ranked = [...buckets.values()]
    .map((e) => {
      const r = e.r / e.n;
      const g = e.g / e.n;
      const b = e.b / e.n;
      const [h, sat, l] = rgb2hsl(r, g, b);
      return {
        r,
        g,
        b,
        h,
        sat,
        l,
        score: e.n * (0.35 + sat) * (1 - Math.abs(l - 0.5)),
      };
    })
    .sort((a, b) => b.score - a.score);

  const picked: { r: number; g: number; b: number; h: number; sat: number; l: number }[] = [];
  for (const c2 of ranked) {
    if (picked.every((o) => Math.hypot(o.r - c2.r, o.g - c2.g, o.b - c2.b) > 60)) {
      picked.push(c2);
    }
    if (picked.length >= max) break;
  }

  const hexes = picked.map((c2) =>
    hsl2hex(
      c2.h,
      Math.min(0.95, Math.max(0.5, c2.sat)),
      Math.min(0.55, Math.max(0.32, c2.l))
    )
  );

  return [...new Set(hexes)];
}
