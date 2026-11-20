import { CardState, ExportFormat, LayoutKey, TiltState } from '../types';
import {
  CANON,
  FORMATS,
  LAYOUTS,
  LYRIC_FONTS,
  THEME_FONT,
  presetById,
} from './constants';
import {
  paintGlare,
  renderCard,
  type PlaybackVisualState,
} from './canvasRenderer';
import { buildHomography, warpCard } from './perspective3D';

export function slugify(text: string): string {
  return String(text || '')
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensures web fonts and cover art are fully loaded and CORS-safe before rendering an export.
 */
export async function ensureExportAssetsReady(
  state: CardState,
  coverImg: HTMLImageElement | null
): Promise<HTMLImageElement | null> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      const fontKey =
        state.lyricFont === 'auto'
          ? THEME_FONT[state.theme] || 'poppins'
          : state.lyricFont;
      const f =
        LYRIC_FONTS[fontKey as keyof typeof LYRIC_FONTS] || LYRIC_FONTS.poppins;
      const loads: Promise<unknown>[] = [
        document.fonts.ready,
        document.fonts.load('400 16px "Poppins"'),
        document.fonts.load('700 32px "Poppins"'),
      ];
      if ('load' in f && f.load) {
        loads.push(document.fonts.load(`${f.weight} 32px "${f.load}"`));
      }
      await Promise.all(loads.map((p) => p.catch(() => undefined)));
    } catch {
      // ignore font errors
    }
  }

  if (coverImg && coverImg.complete && coverImg.naturalWidth > 0) {
    try {
      await coverImg.decode();
    } catch {
      // already loaded
    }
    return coverImg;
  }

  const rawUrl = state.coverUrl.trim();
  if (!rawUrl || state.hide.cover) return null;

  const tryLoad = (src: string): Promise<HTMLImageElement | null> =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.referrerPolicy = 'no-referrer';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const direct = await tryLoad(rawUrl);
  if (direct) return direct;
  if (/^https?:\/\//i.test(rawUrl)) {
    return await tryLoad(`/api/cover-proxy?url=${encodeURIComponent(rawUrl)}`);
  }
  return null;
}

export function fileBaseName(
  title: string,
  artist: string,
  suffix: string,
  ext = 'png'
): string {
  const parts = [slugify(title), slugify(artist)].filter(Boolean);
  return (parts.length ? parts.join('_') : 'lyric-card') + suffix + '.' + ext;
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
      type,
      quality
    );
  });
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

let webpOk: boolean | null = null;
export function supportsWebp(): boolean {
  if (webpOk === null) {
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      webpOk = c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      webpOk = false;
    }
  }
  return webpOk;
}

export async function encodeCanvas(
  canvas: HTMLCanvasElement,
  fmtKey: ExportFormat
): Promise<{ blob: Blob; fmt: ExportFormat; fellBack: boolean }> {
  const f = FORMATS[fmtKey] || FORMATS.png;
  const blob = await canvasToBlob(canvas, f.mime, f.q);
  if (f.mime !== 'image/png' && blob.type && blob.type !== f.mime) {
    if (f.mime === 'image/webp') webpOk = false;
    return { blob, fmt: 'png', fellBack: true };
  }
  return {
    blob,
    fmt: FORMATS[fmtKey] ? fmtKey : 'png',
    fellBack: false,
  };
}

export function dimsFor(
  key: LayoutKey,
  state: CardState,
  social = false
): { w: number; h: number } {
  const L = LAYOUTS[key];
  const p = social
    ? presetById(CANON[key])
    : presetById(state.preset) && presetById(state.preset)?.layout === key
    ? presetById(state.preset)
    : null;
  return p
    ? { w: p.w, h: p.h }
    : { w: Math.round(L.w * state.scale), h: Math.round(L.h * state.scale) };
}

export function renderFlatCanvas(
  key: LayoutKey,
  dims: { w: number; h: number },
  fmtKey: ExportFormat,
  state: CardState,
  coverImg: HTMLImageElement | null,
  playback?: PlaybackVisualState | null
): HTMLCanvasElement {
  const layout = LAYOUTS[key];
  const out = document.createElement('canvas');
  out.width = dims.w;
  out.height = dims.h;
  const g = out.getContext('2d');
  if (!g) throw new Error('Could not get 2d context for flat canvas export');

  g.scale(dims.w / layout.w, dims.h / layout.h);
  const solid =
    (FORMATS[fmtKey] || FORMATS.png).solid || !state.transparent;
  renderCard(
    g,
    { ...state, layoutKey: key },
    layout,
    coverImg,
    { rx: 0, ry: 0, rz: 0, perspective: 1200 },
    { fullBleed: solid, flat: true, playback }
  );
  return out;
}

let grabPreview: (() => HTMLCanvasElement | null) | null = null;

export function setPreviewGrab(fn: (() => HTMLCanvasElement | null) | null) {
  grabPreview = fn;
}

function trimCanvas(src: HTMLCanvasElement, pad = 28): HTMLCanvasElement {
  const ctx = src.getContext('2d');
  if (!ctx) return src;
  const { width, height } = src;
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return src;
  }
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  const step = 2;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return src;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const out = document.createElement('canvas');
  out.width = maxX - minX + 1;
  out.height = maxY - minY + 1;
  const g = out.getContext('2d');
  if (!g) return src;
  g.drawImage(src, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

export function takePreviewShot(): HTMLCanvasElement | null {
  try {
    const shot = grabPreview ? grabPreview() : null;
    if (!shot || shot.width < 32 || shot.height < 32) return null;
    return trimCanvas(shot);
  } catch {
    return null;
  }
}

export function renderCard3D(
  state: CardState,
  coverImg: HTMLImageElement | null,
  displayedWidth?: number,
  tilt?: TiltState | null,
  playback?: PlaybackVisualState | null,
  solidBackground = false
): HTMLCanvasElement {
  const layout = LAYOUTS[state.layoutKey];
  const dims = dimsFor(state.layoutKey, state);
  const scale = Math.max(1, dims.w / layout.w);

  // 1. Flat card with glare baked in
  const flat = document.createElement('canvas');
  flat.width = Math.round(layout.w * scale);
  flat.height = Math.round(layout.h * scale);
  const fg = flat.getContext('2d');
  if (!fg) throw new Error('Could not create context for 3d bake');
  fg.scale(scale, scale);

  const pose: TiltState = {
    rx: tilt?.rx ?? 12,
    ry: tilt?.ry ?? -15,
    rz: tilt?.rz ?? 2,
    perspective: tilt?.perspective ?? 1200,
  };

  const cardOnlyState: CardState = {
    ...state,
    bgStyle: 'none',
  };

  renderCard(fg, cardOnlyState, layout, coverImg, pose, {
    fullBleed: false,
    flat: false,
    playback,
  });
  paintGlare(fg, cardOnlyState, layout, pose, false);

  // 2. Layout-proportional perspective distance
  const refWidth = displayedWidth || Math.round(layout.w * 0.55);
  const d = pose.perspective * (layout.w / refWidth);

  // 3. Warp through homography
  const H = buildHomography(d, pose);
  const warped = warpCard(flat, H, scale, layout.w, layout.h);

  // 4. Compose on padded canvas with dual drop shadow
  const pad = Math.round(135 * scale);
  const out = document.createElement('canvas');
  out.width = warped.width + pad * 2;
  out.height = warped.height + pad * 2;
  const og = out.getContext('2d');
  if (!og) throw new Error('Could not create output context for 3D card');

  const needsSolid =
    solidBackground ||
    (FORMATS[state.fmt] || FORMATS.png).solid ||
    !state.transparent;

  if (needsSolid) {
    og.fillStyle = '#0d0d11';
    og.fillRect(0, 0, out.width, out.height);
    const rg = og.createRadialGradient(
      out.width * 0.5,
      out.height * 0.48,
      out.width * 0.08,
      out.width * 0.5,
      out.height * 0.5,
      Math.max(out.width, out.height) * 0.65
    );
    rg.addColorStop(0, `${state.color}2e`);
    rg.addColorStop(1, 'rgba(13, 13, 17, 0)');
    og.fillStyle = rg;
    og.fillRect(0, 0, out.width, out.height);
  }

  og.save();
  og.shadowColor = 'rgba(0, 0, 0, 0.55)';
  og.shadowBlur = 54 * scale;
  og.shadowOffsetY = 54 * scale;
  og.drawImage(warped, pad, pad);
  og.restore();

  og.save();
  og.shadowColor = 'rgba(0, 0, 0, 0.35)';
  og.shadowBlur = 18 * scale;
  og.shadowOffsetY = 16 * scale;
  og.drawImage(warped, pad, pad);
  og.restore();

  return out;
}

// CRC32 table for zero-dependency zip archive
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(u8: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < u8.length; i++) {
    c = CRC_TABLE[(c ^ u8[i]) & 255] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function makeZip(files: { name: string; data: Uint8Array }[]): Blob {
  const te = new TextEncoder();
  const parts: (ArrayBuffer | Uint8Array)[] = [];
  const central: (ArrayBuffer | Uint8Array)[] = [];
  const d = new Date();
  const time =
    (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date =
    ((Math.max(1980, d.getFullYear()) - 1980) << 9) |
    ((d.getMonth() + 1) << 5) |
    d.getDate();
  let offset = 0;

  for (const f of files) {
    const name = te.encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;

    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint16(6, 0x0800, true);
    lh.setUint16(8, 0, true);
    lh.setUint16(10, time, true);
    lh.setUint16(12, date, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, size, true);
    lh.setUint32(22, size, true);
    lh.setUint16(26, name.length, true);
    lh.setUint16(28, 0, true);

    parts.push(lh.buffer, name, f.data);

    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true);
    ch.setUint16(10, 0, true);
    ch.setUint16(12, time, true);
    ch.setUint16(14, date, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, size, true);
    ch.setUint32(24, size, true);
    ch.setUint16(28, name.length, true);
    ch.setUint16(30, 0, true);
    ch.setUint16(32, 0, true);
    ch.setUint16(34, 0, true);
    ch.setUint16(36, 0, true);
    ch.setUint32(38, 0, true);
    ch.setUint32(42, offset, true);

    central.push(ch.buffer, name);
    offset += 30 + name.length + size;
  }

  const cdSize = central.reduce((n, p) => n + p.byteLength, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);

  return new Blob([...parts, ...central, end.buffer] as any[], {
    type: 'application/zip',
  });
}
