import type { CardState, LayoutConfig, TiltState } from '../types';
import { CHILD_DEPTH_RATIO, FONT } from './constants';
import { luma, mixHex, rgba } from '../utils/colorUtils';
import { overlaySignature, type CardPalette } from './signatureThemes';
import {
  barSpace,
  barUnit,
  cardFrame,
  cardGeom,
  coverRadius,
  extrudeWalls,
  footerSpace,
  getExtrusionVector,
  getLayers,
  getRamp,
  roundedPath,
  roundedRect,
  themeRadius,
} from './geometry';
import {
  drawHeader,
  drawLyrics,
  ellipsize,
  fitLyricSize,
  incrementFontGen,
  layoutLyrics,
  letterSpacing,
  lyricFontCss,
  lyricFontObj,
  parseLyrics,
  wordWidth,
  wrapLine,
} from './typography';
import {
  blurredCover,
  cardDrop,
  drawStub,
  getPalette,
  paintBackdrop,
  paintBgStyle,
  paintCardBody,
  paintGlare,
  paintMetalBackground,
  sparkle,
  stubBars,
  themeFinish,
  tilePattern,
} from './classicThemes';

export {
  barSpace,
  barUnit,
  blurredCover,
  cardDrop,
  cardFrame,
  cardGeom,
  coverRadius,
  drawHeader,
  drawLyrics,
  drawStub,
  ellipsize,
  extrudeWalls,
  fitLyricSize,
  footerSpace,
  getExtrusionVector,
  getLayers,
  getPalette,
  getRamp,
  incrementFontGen,
  layoutLyrics,
  letterSpacing,
  lyricFontCss,
  lyricFontObj,
  paintBackdrop,
  paintBgStyle,
  paintCardBody,
  paintGlare,
  paintMetalBackground,
  parseLyrics,
  roundedPath,
  roundedRect,
  sparkle,
  stubBars,
  themeFinish,
  themeRadius,
  tilePattern,
  wordWidth,
  wrapLine,
};

export interface PlaybackVisualState {
  progress: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  /** Per-paragraph highlight weights [0..1] for smooth Spotify karaoke transitions */
  lineWeights?: number[];
  /** Left-to-right sweep progress [0..1] within the currently active paragraph */
  activeLineFill?: number;
  /** Index of the currently active paragraph during karaoke playback */
  activeParagraph?: number;
  /** Per-line array of per-word fill fractions [0..1] for word-by-word karaoke highlighting */
  wordFills?: number[][];
  /** Index of the currently sung word within `activeParagraph` */
  activeWordIndex?: number;
  /** Optional live-synced lyric stanza when audio plays outside the static card lines */
  activeLyrics?: string;
}

function formatClock(sec: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const logoSprites = new Map<string, HTMLCanvasElement>();
export function getLogoSprite(
  color: string,
  logoSize: number,
  sc: number
): HTMLCanvasElement {
  const key = `${color}|${logoSize}|${sc}`;
  let off = logoSprites.get(key);
  if (off) return off;
  if (logoSprites.size >= 30) logoSprites.clear();

  const r = logoSize / 2;
  off = document.createElement('canvas');
  off.width = off.height = Math.round(logoSize * sc);
  const og = off.getContext('2d');
  if (!og) return off;
  og.setTransform(sc, 0, 0, sc, 0, 0);
  og.globalCompositeOperation = 'source-over';
  og.globalAlpha = 1;

  og.fillStyle = color;
  og.beginPath();
  og.arc(r, r, r, 0, Math.PI * 2);
  og.fill();

  og.globalCompositeOperation = 'destination-out';
  og.strokeStyle = '#000000';
  og.lineCap = 'round';
  og.lineJoin = 'round';

  const arcs = [
    { x1: -0.56, y1: -0.22, qx: 0.04, qy: -0.46, x2: 0.6, y2: -0.12, w: 0.16 },
    { x1: -0.47, y1: 0.04, qx: 0.02, qy: -0.14, x2: 0.5, y2: 0.14, w: 0.13 },
    { x1: -0.38, y1: 0.27, qx: 0.01, qy: 0.13, x2: 0.4, y2: 0.35, w: 0.1 },
  ];
  for (const a of arcs) {
    og.lineWidth = a.w * r;
    og.beginPath();
    og.moveTo(r + a.x1 * r, r + a.y1 * r);
    og.quadraticCurveTo(
      r + a.qx * r,
      r + a.qy * r,
      r + a.x2 * r,
      r + a.y2 * r
    );
    og.stroke();
  }
  og.globalCompositeOperation = 'source-over';
  logoSprites.set(key, off);
  return off;
}

export function drawCoverPlaceholder(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  textColor: string
) {
  g.fillStyle = rgba(textColor, 0.16);
  g.fillRect(x, y, size, size);

  g.fillStyle = rgba(textColor, 0.55);
  const cx = x + size / 2;
  const cy = y + size / 2;
  const u = size / 100;

  g.beginPath();
  g.ellipse(cx - 9 * u, cy + 16 * u, 11 * u, 8.5 * u, -0.35, 0, Math.PI * 2);
  g.fill();
  g.fillRect(cx + 0.5 * u, cy - 26 * u, 5 * u, 42 * u);
  g.beginPath();
  g.moveTo(cx + 5.5 * u, cy - 26 * u);
  g.quadraticCurveTo(cx + 24 * u, cy - 20 * u, cx + 20 * u, cy - 2 * u);
  g.quadraticCurveTo(cx + 18 * u, cy - 14 * u, cx + 5.5 * u, cy - 14 * u);
  g.closePath();
  g.fill();
}

export function drawCover(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette,
  coverImg: HTMLImageElement | null,
  tilt: TiltState,
  unit = 1,
  fixedExtrude = false
) {
  const f = cardFrame(layout, state.theme, state.hide);
  const x = f.cx;
  const y = f.cy;
  const S = f.cs;
  const r = coverRadius(state.coverShape, state.theme, S, layout.coverR);

  const cd = Math.round(state.cardDepth * CHILD_DEPTH_RATIO);
  if (cd > 0) {
    extrudeWalls(
      g,
      (c, ox, oy) => roundedPath(c, x + ox, y + oy, S, S, r),
      cd,
      tilt,
      state.color,
      P.wall,
      state.theme,
      { x, y, w: S, h: S },
      fixedExtrude
    );
  }

  if (state.theme === 'clay') {
    g.save();
    g.shadowColor = rgba(mixHex(state.color, '#000000', 0.55), 0.5);
    g.shadowBlur = 18 * unit;
    g.shadowOffsetX = 8 * unit;
    g.shadowOffsetY = 8 * unit;
    g.fillStyle = P.surface;
    roundedRect(g, x, y, S, S, r);
    g.fill();
    g.restore();
  } else if (state.theme === 'neumorphism') {
    g.save();
    g.fillStyle = P.surface;
    roundedRect(g, x, y, S, S, r);
    g.shadowColor = 'rgba(255,255,255,0.9)';
    g.shadowBlur = 12 * unit;
    g.shadowOffsetX = -6 * unit;
    g.shadowOffsetY = -6 * unit;
    g.fill();
    g.shadowColor = P.shadowDark || 'rgba(0,0,0,0.4)';
    g.shadowOffsetX = 6 * unit;
    g.shadowOffsetY = 6 * unit;
    g.fill();
    g.restore();
  }

  g.save();
  roundedRect(g, x, y, S, S, r);
  g.clip();
  if (coverImg && coverImg.naturalWidth) {
    const side = Math.min(coverImg.naturalWidth, coverImg.naturalHeight);
    const sx = (coverImg.naturalWidth - side) / 2;
    const sy = (coverImg.naturalHeight - side) / 2;
    g.drawImage(coverImg, sx, sy, side, side, x, y, S, S);
  } else {
    drawCoverPlaceholder(g, x, y, S, P.text);
  }
  g.restore();

  if (
    state.theme === 'brutalism' ||
    state.theme === 'comic' ||
    state.theme === 'comicart'
  ) {
    g.strokeStyle = '#000000';
    g.lineWidth = 6;
    roundedRect(g, x + 3, y + 3, S - 6, S - 6, Math.max(0, r - 3));
    g.stroke();
  } else if (state.theme === 'gameboy') {
    g.save();
    roundedRect(g, x, y, S, S, r);
    g.clip();
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = '#9BBC0F';
    g.fillRect(x, y, S, S);
    g.restore();
    g.strokeStyle = '#0F380F';
    g.lineWidth = 5;
    roundedRect(g, x + 2.5, y + 2.5, S - 5, S - 5, 0);
    g.stroke();
  } else if (
    state.theme === 'cyberpunk' ||
    state.theme === 'neon' ||
    state.theme === 'glowsketch'
  ) {
    g.save();
    g.shadowColor = state.color;
    g.shadowBlur = 15 * unit;
    g.strokeStyle = P.neon || '#00FFCC';
    g.lineWidth = 2.5;
    roundedRect(g, x + 1.25, y + 1.25, S - 2.5, S - 2.5, Math.max(0, r - 1));
    g.stroke();
    g.restore();
  } else if (state.theme === 'glass') {
    g.strokeStyle = 'rgba(255,255,255,0.55)';
    g.lineWidth = 1.5;
    roundedRect(g, x + 0.75, y + 0.75, S - 1.5, S - 1.5, Math.max(0, r - 1));
    g.stroke();
  }
}

export function drawProgress(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette,
  unit = 1,
  playback?: PlaybackVisualState | null
) {
  const f = cardFrame(layout, state.theme, state.hide);
  const u = barUnit(layout.logo);
  const x0 = f.bx0;
  const x1 = f.x1;
  const w = Math.max(120, x1 - x0);

  const frac = playback
    ? Math.min(1, Math.max(0, playback.progress))
    : 0.38;
  const curLabel = playback ? formatClock(playback.currentTime) : '1:24';
  const remLabel = playback
    ? `-${formatClock(Math.max(0, playback.duration - playback.currentTime))}`
    : '-2:07';
  const showPause = playback ? playback.isPlaying : true;

  const fSpace = footerSpace(state.hide, state.trackId, layout);
  const top = f.y1 - fSpace - barSpace(false, layout.logo) + 18 * u;
  const ty = top + 10 * u;
  const th = Math.max(4, 7 * u);
  const kr = 11 * u;
  const tsY = ty + kr + 26 * u;

  g.save();
  if (P.glow) {
    g.shadowColor = P.glow;
    g.shadowBlur = 12 * unit;
  }
  g.fillStyle = P.text;
  g.globalAlpha = 0.28;
  roundedRect(g, x0, ty - th / 2, w, th, th / 2);
  g.fill();
  g.globalAlpha = 1;
  if (w * frac > th) {
    roundedRect(g, x0, ty - th / 2, w * frac, th, th / 2);
    g.fill();
  }
  g.beginPath();
  g.arc(x0 + w * frac, ty, kr, 0, Math.PI * 2);
  g.fill();

  const tsSize = Math.max(18, Math.round(22 * u));
  g.font = `600 ${tsSize}px ${FONT}`;
  letterSpacing(g, 0);
  g.textBaseline = 'alphabetic';
  g.globalAlpha = 0.78;
  g.textAlign = 'left';
  g.fillText(curLabel, x0, tsY);
  g.textAlign = 'right';
  g.fillText(remLabel, x1, tsY);
  g.textAlign = 'left';
  g.globalAlpha = 1;

  const cx = (x0 + x1) / 2;
  const cy = tsY + 46 * u;
  const gap = Math.min(w / 5, 118 * u);
  const i = 13 * u;

  g.strokeStyle = P.text;
  g.fillStyle = P.text;
  g.lineWidth = 3 * u;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.globalAlpha = 0.8;

  // shuffle
  g.beginPath();
  g.moveTo(cx - 2 * gap - i, cy + i * 0.6);
  g.lineTo(cx - 2 * gap - i * 0.2, cy + i * 0.6);
  g.lineTo(cx - 2 * gap + i, cy - i * 0.6);
  g.moveTo(cx - 2 * gap - i, cy - i * 0.6);
  g.lineTo(cx - 2 * gap - i * 0.2, cy - i * 0.6);
  g.lineTo(cx - 2 * gap + i, cy + i * 0.6);
  g.stroke();

  // repeat
  roundedRect(g, cx + 2 * gap - i, cy - i * 0.6, i * 2, i * 1.2, i * 0.5);
  g.stroke();

  // previous / next
  const tri = (tx: number, d: number) => {
    g.beginPath();
    g.moveTo(tx - d * i * 0.7, cy - i);
    g.lineTo(tx + d * i * 0.7, cy);
    g.lineTo(tx - d * i * 0.7, cy + i);
    g.closePath();
    g.fill();
  };
  g.globalAlpha = 1;
  tri(cx - gap + i * 0.3, -1);
  g.fillRect(cx - gap - i * 0.95, cy - i, 3 * u, i * 2);
  tri(cx + gap - i * 0.3, 1);
  g.fillRect(cx + gap + i * 0.95 - 3 * u, cy - i, 3 * u, i * 2);

  // play / pause disc
  g.beginPath();
  g.arc(cx, cy, 28 * u, 0, Math.PI * 2);
  g.fill();

  if (P.glow) {
    g.shadowColor = 'rgba(0,0,0,0)';
    g.shadowBlur = 0;
  }
  g.fillStyle = P.surface || '#000';
  if (showPause) {
    g.fillRect(cx - 8.5 * u, cy - 10.5 * u, 6 * u, 21 * u);
    g.fillRect(cx + 2.5 * u, cy - 10.5 * u, 6 * u, 21 * u);
  } else {
    g.beginPath();
    g.moveTo(cx - 6 * u, cy - 11 * u);
    g.lineTo(cx + 12 * u, cy);
    g.lineTo(cx - 6 * u, cy + 11 * u);
    g.closePath();
    g.fill();
  }
  g.restore();
}

export function drawFooter(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette,
  tilt: TiltState,
  unit = 1,
  fixedExtrude = false
) {
  const f = cardFrame(layout, state.theme, state.hide);
  const x = f.fx;
  const y = f.y1 - layout.logo;
  const cy = y + layout.logo / 2;

  const sc = Math.max(1, Math.ceil(g.getTransform ? g.getTransform().a : 1));
  const sprite = getLogoSprite(P.text, layout.logo, sc);

  const lay = getLayers(
    Math.round(state.cardDepth * CHILD_DEPTH_RATIO),
    tilt,
    state.color,
    P.wall,
    state.theme,
    16,
    fixedExtrude
  );

  if (lay) {
    for (let k = 0; k < lay.length; k++) {
      const o = lay[k];
      g.drawImage(
        getLogoSprite(lay[k - (k % 4)].color, layout.logo, sc),
        x + o.dx,
        y + o.dy,
        layout.logo,
        layout.logo
      );
    }
  }

  if (P.glow) {
    g.shadowColor = P.glow;
    g.shadowBlur = 15 * unit;
  }
  g.drawImage(sprite, x, y, layout.logo, layout.logo);

  g.font = `700 ${layout.wordmark}px ${FONT}`;
  g.textBaseline = 'middle';
  const k = Math.max(1, Math.round(layout.wordmark / 26));
  letterSpacing(g, -k);
  const wx = x + layout.logo + Math.round(layout.logo * 0.22);

  if (lay) {
    if (P.glow) {
      g.shadowColor = 'rgba(0,0,0,0)';
      g.shadowBlur = 0;
    }
    for (const o of lay) {
      g.fillStyle = o.color;
      g.fillText('Spotify', wx + o.dx, cy + k + o.dy);
    }
    if (P.glow) {
      g.shadowColor = P.glow;
      g.shadowBlur = 15 * unit;
    }
  }

  for (const p of P.passes) {
    g.fillStyle = p.color;
    g.fillText('Spotify', wx + p.dx, cy + k + p.dy);
  }
  letterSpacing(g, 0);
  g.textBaseline = 'alphabetic';
  if (P.glow) {
    g.shadowColor = 'rgba(0,0,0,0)';
    g.shadowBlur = 0;
  }
}

type CodeCacheEntry =
  | { status: 'loaded'; img: HTMLImageElement }
  | { status: 'loading' }
  | { status: 'fail'; at: number };

const codeCache = new Map<string, CodeCacheEntry>();
export function drawCode(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette,
  onLoad: () => void
) {
  if (!state.trackId || !/^#[0-9a-f]{6}$/i.test(P.surface)) return;
  const f = cardFrame(layout, state.theme, state.hide);
  const h = layout.logo;
  const w = Math.min(h * 4, Math.max(160, (f.x1 - f.fx) * 0.45));
  const x = f.x1 - w;
  const y = f.y1 - layout.logo;
  const url = `https://scannables.scdn.co/uri/plain/png/${P.surface.slice(
    1
  )}/${luma(P.surface) < 150 ? 'white' : 'black'}/640/spotify:track:${
    state.trackId
  }`;

  const entry = codeCache.get(url);
  const shouldFetch =
    entry === undefined ||
    (entry.status === 'fail' && Date.now() - entry.at > 10000);

  if (shouldFetch) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    codeCache.set(url, { status: 'loading' });
    img.onload = () => {
      codeCache.set(url, { status: 'loaded', img });
      onLoad();
    };
    img.onerror = () => {
      codeCache.set(url, { status: 'fail', at: Date.now() });
    };
    img.src = url;
    return;
  }

  if (entry.status !== 'loaded') return;
  g.save();
  roundedRect(g, x, y, w, h, h * 0.16);
  g.clip();
  g.drawImage(entry.img, x, y, w, h);
  g.restore();
}

export function renderCard(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  coverImg: HTMLImageElement | null,
  tilt: TiltState,
  {
    fullBleed = false,
    flat = false,
    onCodeLoad = () => {},
    playback = null,
  }: {
    fullBleed?: boolean;
    flat?: boolean;
    onCodeLoad?: () => void;
    playback?: PlaybackVisualState | null;
  } = {}
): { size: number; overflow: boolean } {
  const theme = state.theme;
  const bg = state.color;
  const P = getPalette(theme, bg);
  const geo = cardGeom(
    state.layoutKey,
    theme,
    state.cardDepth,
    state.bgStyle,
    tilt,
    flat
  );
  const currentTransform = g.getTransform ? g.getTransform().a : 1;
  const unit = currentTransform * geo.s;

  g.clearRect(0, 0, layout.w, layout.h);
  paintBackdrop(
    g,
    layout,
    theme,
    bg,
    P,
    state.bgStyle,
    state.cardDepth,
    fullBleed,
    coverImg
  );

  g.save();
  g.translate(geo.x, geo.y);
  g.scale(geo.s, geo.s);
  paintCardBody(
    g,
    state,
    layout,
    P,
    tilt,
    fullBleed && state.bgStyle === 'none',
    unit,
    flat
  );
  themeFinish(g, theme, bg, P, layout);
  if (!state.hide.cover) {
    drawCover(g, state, layout, P, coverImg, tilt, unit, flat);
  }
  if (!(state.hide.title && state.hide.artist)) {
    drawHeader(g, state, layout, P, tilt, unit, flat);
  }
  const info = drawLyrics(g, state, layout, P, tilt, unit, flat, playback);
  if (!state.hide.bar) {
    drawProgress(g, state, layout, P, unit, playback);
  }
  if (!state.hide.logo) {
    drawFooter(g, state, layout, P, tilt, unit, flat);
  }
  if (!state.hide.code) {
    drawCode(g, state, layout, P, onCodeLoad);
  }
  overlaySignature(g, theme, layout);
  g.restore();

  g.shadowColor = 'rgba(0,0,0,0)';
  g.shadowBlur = 0;

  return info;
}
