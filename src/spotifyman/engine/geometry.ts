import type {
  BgStyle,
  CardState,
  ElementVisibility,
  LayoutConfig,
  LayoutKey,
  ThemeKey,
  TiltState,
} from '../types';
import {
  COVER_RADIUS,
  EXTRUDE_GAIN,
  EXTRUDE_X_SIGN,
  LAYOUTS,
  LIGHT_DIR,
  THEME_INSET,
  THEME_R,
} from './constants';
import { mixHex } from '../utils/colorUtils';

const rad = (deg: number): number => (deg * Math.PI) / 180;

export const themeRadius = (theme: ThemeKey, baseRadius: number): number =>
  THEME_R[theme] !== undefined ? THEME_R[theme]! : baseRadius;

export function getExtrusionVector(
  depth: number,
  tilt: TiltState,
  fixed = false
) {
  if (!(depth > 0)) return { dx: 0, dy: 0, len: 0, lit: 0 };
  const rxDeg = tilt == null ? 0 : Number(tilt.rx) || 0;
  const ryDeg = tilt == null ? 0 : Number(tilt.ry) || 0;
  const rzDeg = tilt == null ? 0 : Number(tilt.rz) || 0;
  let dx: number;
  let dy: number;
  if (fixed) {
    dx = dy = depth;
  } else {
    const rx = rad(rxDeg);
    const ry = rad(ryDeg);
    const rz = rad(rzDeg);
    const sx = -Math.sin(ry) * EXTRUDE_X_SIGN * depth * EXTRUDE_GAIN;
    const sy = Math.sin(rx) * Math.cos(ry) * depth * EXTRUDE_GAIN;
    dx = Math.cos(rz) * sx + Math.sin(rz) * sy;
    dy = -Math.sin(rz) * sx + Math.cos(rz) * sy;
  }
  dx = Math.round(dx * 100) / 100;
  dy = Math.round(dy * 100) / 100;
  const len = Math.hypot(dx, dy);
  const lit = len ? (dx * LIGHT_DIR.x + dy * LIGHT_DIR.y) / len : 0;
  return { dx, dy, len, lit };
}

export function cardGeom(
  layoutKey: LayoutKey,
  theme: ThemeKey,
  cardDepth: number,
  bgStyle: BgStyle,
  tilt: TiltState,
  fixedExtrude = false
) {
  const L = LAYOUTS[layoutKey];
  const bx =
    bgStyle === 'none' ? 0 : Math.round(Math.min(L.w, L.h) * 0.075);
  const [l0, t0, r0, b0] = THEME_INSET[theme] || [0, 0, 0, 0];
  const l = l0 + bx;
  const t = t0 + bx;
  const r = r0 + bx;
  const b = b0 + bx;
  const aw = L.w - l - r;
  const ah = L.h - t - b;

  const v = getExtrusionVector(cardDepth, tilt, fixedExtrude);
  const ex = Math.abs(v.dx);
  const ey = Math.abs(v.dy);
  const s = Math.min(aw / (L.w + ex), ah / (L.h + ey));
  const w = L.w * s;
  const h = L.h * s;
  const totalW = w + ex * s;
  const totalH = h + ey * s;

  return {
    s,
    w,
    h,
    x: l + (aw - totalW) / 2 + (v.dx < 0 ? -v.dx * s : 0),
    y: t + (ah - totalH) / 2 + (v.dy < 0 ? -v.dy * s : 0),
    r: themeRadius(theme, L.radius) * s,
  };
}

const rampCache = new Map<string, string[]>();
export function getRamp(
  baseColor: string,
  wallColor: string,
  theme: ThemeKey,
  v: { dx: number; dy: number; len: number; lit: number },
  n: number
): string[] {
  const glass = theme === 'glass';
  const base = glass ? mixHex(baseColor, '#ffffff', 0.5) : wallColor;
  const key = `${base}|${v.lit.toFixed(2)}|${n}|${glass ? 1 : 0}`;
  let r = rampCache.get(key);
  if (r) return r;
  if (rampCache.size > 50) rampCache.clear();
  const near =
    v.lit >= 0
      ? mixHex(base, '#ffffff', 0.1 + 0.3 * v.lit)
      : mixHex(base, '#000000', 0.05 - 0.1 * v.lit);
  const deep = mixHex(
    base,
    '#000000',
    (glass ? 0.2 : 0.4) + (0.25 * (1 - v.lit)) / 2
  );
  r = [];
  for (let k = 0; k < n; k++) {
    r.push(mixHex(near, deep, Math.pow((k + 1) / n, 0.85)));
  }
  rampCache.set(key, r);
  return r;
}

const layerMemo = new Map<string, { dx: number; dy: number; color: string }[]>();
export function getLayers(
  depth: number,
  tilt: TiltState,
  baseColor: string,
  wallColor: string,
  theme: ThemeKey,
  maxN: number,
  fixed = false
) {
  const v = getExtrusionVector(depth, tilt, fixed);
  if (v.len < 0.5) return null;
  const n = Math.max(1, Math.min(maxN, Math.ceil(v.len)));
  const key = `${v.dx}|${v.dy}|${wallColor}|${theme}|${baseColor}|${n}`;
  let out = layerMemo.get(key);
  if (out) return out;
  if (layerMemo.size > 30) layerMemo.clear();
  const ramp = getRamp(baseColor, wallColor, theme, v, n);
  out = [];
  for (let i = n; i >= 1; i--) {
    out.push({ dx: (v.dx * i) / n, dy: (v.dy * i) / n, color: ramp[i - 1] });
  }
  layerMemo.set(key, out);
  return out;
}

export function roundedPath(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  g.moveTo(x + rad, y);
  g.arcTo(x + w, y, x + w, y + h, rad);
  g.arcTo(x + w, y + h, x, y + h, rad);
  g.arcTo(x, y + h, x, y, rad);
  g.arcTo(x, y, x + w, y, rad);
  g.closePath();
}

export function roundedRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  g.beginPath();
  roundedPath(g, x, y, w, h, r);
}

let wallLayer: HTMLCanvasElement | null = null;
function getWallLayer(w: number, h: number): HTMLCanvasElement {
  if (!wallLayer) wallLayer = document.createElement('canvas');
  if (wallLayer.width !== w || wallLayer.height !== h) {
    wallLayer.width = w;
    wallLayer.height = h;
  }
  return wallLayer;
}

export function extrudeWalls(
  g: CanvasRenderingContext2D,
  shape: (c: CanvasRenderingContext2D, ox: number, oy: number) => void,
  depth: number,
  tilt: TiltState,
  baseColor: string,
  wallColor: string,
  theme: ThemeKey,
  b?: { x: number; y: number; w: number; h: number },
  fixed = false
) {
  const v = getExtrusionVector(depth, tilt, fixed);
  if (v.len < 0.5) return;
  const glass = theme === 'glass';
  const n = Math.max(1, Math.min(80, Math.ceil(v.len / (v.len > 40 ? 2 : 1))));
  const ramp = getRamp(baseColor, wallColor, theme, v, n);

  const clipOut = (c: CanvasRenderingContext2D) => {
    c.beginPath();
    c.rect(-8192, -8192, 16384, 16384);
    shape(c, 0, 0);
    c.clip('evenodd');
  };

  let t = g;
  let layer: HTMLCanvasElement | null = null;

  if (glass) {
    layer = getWallLayer(g.canvas.width, g.canvas.height);
    const layerCtx = layer.getContext('2d');
    if (layerCtx) {
      t = layerCtx;
      t.setTransform(1, 0, 0, 1, 0, 0);
      t.clearRect(0, 0, layer.width, layer.height);
      t.setTransform(g.getTransform());
    }
  }

  t.save();
  clipOut(t);
  for (let i = n; i >= 1; i--) {
    t.fillStyle = ramp[i - 1];
    t.beginPath();
    shape(t, (v.dx * i) / n, (v.dy * i) / n);
    t.fill();
  }

  if (b) {
    const cx = b.x + b.w / 2 + v.dx / 2;
    const cy = b.y + b.h / 2 + v.dy / 2;
    const hd = (Math.hypot(b.w, b.h) + v.len) / 2;
    const gr = t.createLinearGradient(
      cx + LIGHT_DIR.x * hd,
      cy + LIGHT_DIR.y * hd,
      cx - LIGHT_DIR.x * hd,
      cy - LIGHT_DIR.y * hd
    );
    gr.addColorStop(0, 'rgba(255,255,255,0.20)');
    gr.addColorStop(0.45, 'rgba(255,255,255,0)');
    gr.addColorStop(0.55, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(0,0,0,0.35)');
    t.fillStyle = gr;
    const stride = Math.max(2, Math.ceil(n / 12));
    for (let i = n; i >= 1; i -= stride) {
      t.beginPath();
      shape(t, (v.dx * i) / n, (v.dy * i) / n);
      t.fill();
    }
    t.beginPath();
    shape(t, v.dx, v.dy);
    t.fill();
  }
  t.restore();

  if (glass && layer) {
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha *= 0.3;
    g.drawImage(layer, 0, 0);
    g.restore();

    g.save();
    clipOut(g);
    g.lineJoin = 'round';
    g.strokeStyle = 'rgba(255,255,255,0.8)';
    g.lineWidth = 2.5;
    g.beginPath();
    shape(g, v.dx, v.dy);
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.4)';
    g.lineWidth = 1.5;
    g.beginPath();
    shape(g, 0, 0);
    g.stroke();
    g.restore();
  }
}

export interface CardFrameMetrics {
  cx: number;
  cy: number;
  cs: number;
  hx: number;
  hy: number;
  hw: number;
  top: boolean;
  lx: number;
  x1: number;
  y1: number;
  ltop: number;
  mid: boolean;
  bx0: number;
  fx: number;
  stub: { v: boolean; at: number; len: number } | null;
}

export function cardFrame(
  layout: LayoutConfig,
  theme: ThemeKey,
  hideInput: boolean | Partial<ElementVisibility>
): CardFrameMetrics {
  const W = layout.w;
  const H = layout.h;
  const pad = layout.pad;
  const wide = W / H >= 1.3;
  const minSide = Math.min(W, H);

  const hideCover =
    typeof hideInput === 'boolean' ? hideInput : Boolean(hideInput.cover);
  const hideTitle =
    typeof hideInput === 'boolean' ? false : Boolean(hideInput.title);
  const hideArtist =
    typeof hideInput === 'boolean' ? false : Boolean(hideInput.artist);
  const noHeader = hideCover && hideTitle && hideArtist;

  let leftPad = pad;
  let rightPad = pad;
  let topPad = pad;
  let bottomPad = pad;

  if (theme === 'zackd') {
    const bar = Math.round(minSide * 0.055);
    topPad = Math.max(pad, bar + 38);
    bottomPad = Math.max(pad, bar + 34);
  } else if (theme === 'pixel') {
    topPad = Math.max(pad, 74);
  } else if (theme === 'pixelart') {
    const inset = Math.round(minSide * 0.088);
    leftPad = Math.max(pad, inset);
    rightPad = Math.max(pad, inset);
    topPad = Math.max(pad, inset);
    bottomPad = Math.max(pad, inset);
  } else if (theme === 'chalkboard') {
    const m = Math.round(minSide * 0.035);
    leftPad = Math.max(pad, m + 36);
    rightPad = Math.max(pad, m + 36);
    topPad = Math.max(pad, m + 34);
    bottomPad = Math.max(pad, m + 42);
  } else if (theme === 'gameboy') {
    leftPad = Math.max(pad, 68);
    rightPad = Math.max(pad, 68);
    topPad = Math.max(pad, 68);
    bottomPad = Math.max(pad, 68);
  } else if (theme === 'cassette') {
    topPad = Math.max(pad, 72);
    bottomPad = Math.max(pad, 72);
  } else if (theme === 'receipt') {
    bottomPad = Math.max(pad, 78);
  } else if (theme === 'newspaper') {
    topPad = Math.max(pad, 74);
  } else if (theme === 'polaroid') {
    topPad = Math.max(pad, 68);
  } else if (theme === 'cdcase') {
    const spineW = Math.max(52, Math.round(W * 0.068));
    leftPad = Math.max(pad, spineW + 38);
    rightPad = Math.max(pad, 68);
  } else if (theme === 'minidisc') {
    topPad = Math.max(pad, 74);
  } else if (theme === 'floppy') {
    topPad = Math.max(pad, 92);
    leftPad = Math.max(pad, 68);
    rightPad = Math.max(pad, 68);
    bottomPad = Math.max(pad, 68);
  } else if (theme === 'plaque') {
    leftPad = Math.max(pad, 72);
    rightPad = Math.max(pad, 72);
    topPad = Math.max(pad, 72);
    bottomPad = Math.max(pad, 72);
  } else if (theme === 'vhs') {
    topPad = Math.max(pad, 76);
    rightPad = Math.max(pad, 72);
  } else if (theme === 'stamp') {
    leftPad = Math.max(pad, 74);
    rightPad = Math.max(pad, 74);
    topPad = Math.max(pad, 74);
    bottomPad = Math.max(pad, 74);
  } else if (theme === 'filmstrip') {
    const railW = Math.max(54, Math.round(W * 0.068));
    leftPad = Math.max(pad, railW + 32);
    rightPad = Math.max(pad, railW + 32);
  } else if (theme === 'vippass') {
    topPad = Math.max(pad, 92);
  } else if (theme === 'boarding') {
    topPad = Math.max(pad, 78);
    bottomPad = Math.max(pad, 80);
  } else if (theme === 'matchbook') {
    bottomPad = Math.max(pad, 84);
  } else if (theme === 'manga') {
    rightPad = Math.max(pad, 78);
  } else if (theme === 'tarot') {
    topPad = Math.max(pad, 76);
    bottomPad = Math.max(pad, 72);
  } else if (theme === 'ipod') {
    topPad = Math.max(pad, 92);
    leftPad = Math.max(pad, 68);
    rightPad = Math.max(pad, 68);
    bottomPad = Math.max(pad, 68);
  } else if (theme === 'terminal' || theme === 'aqua') {
    topPad = Math.max(pad, 76);
  } else if (theme === 'swiss') {
    leftPad = Math.max(pad, 76);
    rightPad = Math.max(pad, 76);
  }

  let headerBlockH = layout.cover;
  if (noHeader) {
    headerBlockH = 0;
  } else if (hideCover) {
    const titleH = hideTitle ? 0 : layout.titleLine * 1.5;
    const artistH = hideArtist ? 0 : layout.artistLine;
    headerBlockH = Math.min(layout.cover, Math.max(48, Math.round(titleH + artistH)));
  }

  const ltop = noHeader
    ? topPad
    : topPad + headerBlockH + (hideCover ? Math.round(layout.lyricGap * 0.72) : layout.lyricGap);

  const f: CardFrameMetrics = {
    cx: leftPad,
    cy: topPad,
    cs: layout.cover,
    hx: leftPad + (hideCover ? 0 : layout.cover + layout.headGap),
    hy: topPad + headerBlockH / 2,
    hw: 0,
    top: false,
    lx: leftPad,
    x1: W - rightPad,
    y1: H - bottomPad,
    ltop,
    mid: layout.lyricMiddle,
    bx0: leftPad,
    fx: leftPad,
    stub: null,
  };

  if (theme === 'ticket') {
    if (wide) {
      const sw = Math.round(W * 0.2);
      f.stub = { v: true, at: W - sw, len: sw };
      f.x1 = W - sw - 44;
    } else {
      const sh = Math.round(H * 0.17);
      f.stub = { v: false, at: H - sh, len: sh };
      f.y1 = H - sh - 36;
    }
  }

  f.hw = Math.max(120, f.x1 - f.hx);
  return f;
}

export function coverRadius(
  coverShape: CardState['coverShape'],
  theme: ThemeKey,
  cs: number,
  defaultR: number
): number {
  if (coverShape === 'square') return 0;
  if (coverShape === 'rounded') return Math.round(cs * 0.16);
  if (coverShape === 'circle') return cs / 2;
  return COVER_RADIUS[theme] !== undefined ? COVER_RADIUS[theme]! : defaultR;
}

export const barUnit = (logoSize: number) => (logoSize / 72) * 0.85;

export const barSpace = (hideBar: boolean, logoSize: number) =>
  hideBar ? 0 : Math.round(160 * barUnit(logoSize));

export function footerSpace(
  hide: ElementVisibility,
  trackId: string | null,
  layout: LayoutConfig
): number {
  const hasFooter = !hide.logo || (!hide.code && Boolean(trackId));
  return hasFooter ? layout.logo + layout.logoGap : 0;
}
