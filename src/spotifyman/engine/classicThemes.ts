import type { BgStyle, CardState, LayoutConfig, ThemeKey, TiltState } from '../types';
import { FONT, GLARE } from './constants';
import { contrastColor, luma, mixHex, rgba } from '../utils/colorUtils';
import {
  applySignaturePalette,
  type CardPalette,
  paintSignatureBody,
} from './signatureThemes';
import {
  applyCollectorPalette,
  paintCollectorBody,
} from './collectorThemes';
import {
  cardFrame,
  cardGeom,
  extrudeWalls,
  roundedPath,
  roundedRect,
  themeRadius,
} from './geometry';
import { letterSpacing } from './typography';

export function getPalette(theme: ThemeKey, bg: string): CardPalette {
  const P: CardPalette = {
    text: contrastColor(bg),
    surface: bg,
    glow: null,
    wall: mixHex(bg, '#000000', 0.45),
    neon: null,
    shadowDark: null,
    passes: [{ dx: 0, dy: 0, color: contrastColor(bg), main: true }],
  };

  if (applySignaturePalette(theme, P, bg)) {
    if (!P.wall) P.wall = mixHex(P.surface, '#000000', 0.45);
    return P;
  }

  if (applyCollectorPalette(theme, P, bg)) {
    if (!P.wall) P.wall = mixHex(P.surface, '#000000', 0.45);
    return P;
  }

  switch (theme) {
    case 'cyberpunk':
      P.neon =
        luma(bg) < 90
          ? mixHex(bg, '#ffffff', 0.55)
          : mixHex(bg, '#ffffff', 0.2);
      P.text = P.neon;
      P.glow = bg;
      P.wall = mixHex(P.neon, '#000000', 0.62);
      break;
    case 'glass':
      P.text = '#FFFFFF';
      break;
    case 'vinyl':
      // Warm matte record-jacket charcoal tinted with the song's color (never a flat black blob)
      P.surface = mixHex(bg, '#17171B', 0.8);
      P.text = '#F7F7F7';
      break;
    case 'aurora':
      P.surface = mixHex(bg, '#070B16', 0.82);
      P.text = '#F5F9FF';
      break;
    case 'ticket':
      P.surface = mixHex(bg, '#ffffff', 0.9);
      P.text = mixHex(bg, '#000000', 0.72);
      break;
    case 'polaroid':
      P.surface = '#FAF7F0';
      P.text = '#242220';
      break;
    case 'y2k':
      P.surface = mixHex(bg, '#EDF2FF', 0.68);
      P.text = '#111322';
      break;
    case 'pixel':
      P.surface = mixHex(bg, '#F4F4EE', 0.86);
      P.text = '#111111';
      break;
    case 'notebook':
      P.surface = '#FCF8EC';
      P.text = '#22304D';
      break;
    case 'newspaper':
      P.surface = '#ECE5D4';
      P.text = '#181614';
      break;
    case 'holo':
      P.surface = mixHex(bg, '#000000', 0.82);
      P.text = '#FFFFFF';
      break;
    case 'cassette':
      P.surface = mixHex(bg, '#F2E8D0', 0.88);
      P.text = '#2A2118';
      break;
    case 'receipt':
      P.surface = '#FAF9F4';
      P.text = '#1A1A1A';
      break;
    case 'gameboy':
      P.surface = '#9BBC0F';
      P.text = '#0F380F';
      break;
    case 'stained':
      P.surface = mixHex(bg, '#000000', 0.5);
      P.text = '#FFFFFF';
      break;
    case 'comic':
      P.surface = mixHex(bg, '#ffffff', 0.86);
      P.text = '#111111';
      break;
    case 'neon':
      P.neon =
        luma(bg) < 90
          ? mixHex(bg, '#ffffff', 0.55)
          : mixHex(bg, '#ffffff', 0.25);
      P.text = P.neon;
      P.glow = bg;
      P.surface = '#0D0A10';
      P.wall = mixHex(P.neon, '#000000', 0.62);
      break;
    case 'clay':
      P.surface = mixHex(bg, '#FFFFFF', 0.42);
      P.text =
        luma(P.surface) > 142 ? mixHex(bg, '#111111', 0.72) : '#FFFFFF';
      break;
    case 'neumorphism':
      P.surface = mixHex(bg, '#E9EDF2', 0.72);
      P.text = mixHex(bg, '#161B24', 0.76);
      P.shadowDark = rgba(mixHex(bg, '#000000', 0.48), 0.45);
      break;
  }

  if (!P.wall) P.wall = mixHex(P.surface, '#000000', 0.45);
  P.passes = [{ dx: 0, dy: 0, color: P.text, main: true }];
  return P;
}

const patternCache = new Map<string, CanvasPattern | null>();
export function tilePattern(
  ctx: CanvasRenderingContext2D,
  key: string,
  size: number,
  draw: (c: CanvasRenderingContext2D, n: number) => void
): CanvasPattern | null {
  if (patternCache.has(key)) return patternCache.get(key) || null;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const cx = c.getContext('2d');
  if (cx) draw(cx, size);
  const p = ctx.createPattern(c, 'repeat');
  if (patternCache.size > 50) patternCache.clear();
  patternCache.set(key, p);
  return p;
}

export function sparkle(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y);
  g.quadraticCurveTo(x, y, x, y - r);
  g.fill();
}

export function cardDrop(
  g: CanvasRenderingContext2D,
  W: number,
  H: number,
  R: number,
  fill: string,
  blur = 30,
  oy = 14,
  unit = 1
) {
  g.save();
  g.shadowColor = 'rgba(0,0,0,0.42)';
  g.shadowBlur = blur * unit;
  g.shadowOffsetX = 0;
  g.shadowOffsetY = oy * unit;
  g.fillStyle = fill;
  roundedRect(g, 0, 0, W, H, R);
  g.fill();
  g.restore();
}

const stubCache: { key: string; bars: number[]; no: string } = {
  key: '',
  bars: [],
  no: '',
};

export function stubBars(title: string, artist: string) {
  const key = `${title}|${artist}`;
  if (stubCache.key !== key) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) {
      h = Math.imul(h ^ key.charCodeAt(i), 16777619) >>> 0;
    }
    const rnd = () => {
      h = (h + 0x6d2b79f5) >>> 0;
      let t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const bars = [1, 1, 1];
    let sum = 3;
    while (sum < 110) {
      const w = [1, 1, 2, 2, 3, 4][Math.floor(rnd() * 6)];
      bars.push(w);
      sum += w;
    }
    bars.push(1, 1, 1);
    stubCache.bars = bars;
    stubCache.no = 'No. ' + String(Math.floor(rnd() * 900000) + 100000);
    stubCache.key = key;
  }
  return stubCache;
}

export function drawStub(
  g: CanvasRenderingContext2D,
  P: CardPalette,
  st: { v: boolean; at: number; len: number },
  layout: LayoutConfig,
  title: string,
  artist: string
) {
  const W = layout.w;
  const H = layout.h;
  const c = stubBars(title, artist);
  g.save();
  if (st.v) {
    g.translate(st.at + st.len / 2, H / 2);
    g.rotate(Math.PI / 2);
  } else {
    g.translate(W / 2, st.at + st.len / 2);
  }
  const lw = (st.v ? H : W) - 150;
  const lh = st.len - (st.v ? 72 : 56);
  const top = -lh / 2;
  const fs = 22;

  g.fillStyle = P.text;
  g.textBaseline = 'top';
  g.font = `600 ${fs}px ${FONT}`;
  letterSpacing(g, 0);
  g.globalAlpha = 0.8;
  g.textAlign = 'left';
  g.fillText('Admit one', -lw / 2, top);
  g.textAlign = 'right';
  g.fillText(c.no, lw / 2, top);
  g.globalAlpha = 1;
  g.textAlign = 'left';

  const total = c.bars.reduce((a, b) => a + b, 0);
  const u = lw / total;
  const y0 = top + fs + 16;
  const bh = lh - fs - 16;
  let x = -lw / 2;
  c.bars.forEach((w, i) => {
    if (i % 2 === 0) g.fillRect(x, y0, w * u, bh);
    x += w * u;
  });
  g.restore();
}

let blurBgImg: HTMLImageElement | null = null;
let blurBgCanvas: HTMLCanvasElement | null = null;

export function blurredCover(coverImg: HTMLImageElement | null) {
  if (!coverImg || !coverImg.naturalWidth) return null;
  if (blurBgImg === coverImg && blurBgCanvas) return blurBgCanvas;

  let cur = document.createElement('canvas');
  cur.width = cur.height = 24;
  const cx = cur.getContext('2d');
  if (!cx) return null;
  cx.drawImage(coverImg, 0, 0, 24, 24);

  for (const n of [64, 160, 256]) {
    const nx = document.createElement('canvas');
    nx.width = nx.height = n;
    const nc = nx.getContext('2d');
    if (nc) {
      nc.imageSmoothingQuality = 'high';
      nc.drawImage(cur, 0, 0, n, n);
    }
    cur = nx;
  }
  blurBgImg = coverImg;
  blurBgCanvas = cur;
  return cur;
}

export function paintMetalBackground(
  g: CanvasRenderingContext2D,
  W: number,
  H: number,
  radius: number,
  bg: string,
  fullBleed: boolean
) {
  const silver = '#D3D6DC';
  const linear = g.createLinearGradient(0, 0, W, H);
  [
    [0.0, mixHex(bg, silver, 0.4)],
    [0.3, mixHex(bg, silver, 0.1)],
    [0.52, mixHex(bg, '#FFFFFF', 0.16)],
    [0.76, mixHex(bg, '#000000', 0.1)],
    [1.0, mixHex(bg, '#000000', 0.24)],
  ].forEach(([p, c]) => linear.addColorStop(p as number, c as string));

  const hx = W * 0.82;
  const hy = -H * 0.05;
  const radial = g.createRadialGradient(hx, hy, 0, hx, hy, W * 0.6);
  radial.addColorStop(0, 'rgba(255,255,255,0.22)');
  radial.addColorStop(1, 'rgba(255,255,255,0)');

  const bevel = g.createLinearGradient(0, 0, 0, H);
  bevel.addColorStop(0, 'rgba(255,255,255,0.40)');
  bevel.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  bevel.addColorStop(1, 'rgba(255,255,255,0)');

  g.save();
  if (fullBleed) {
    g.beginPath();
    g.rect(0, 0, W, H);
  } else {
    roundedRect(g, 0, 0, W, H, radius);
  }
  g.clip();

  g.fillStyle = linear;
  g.fillRect(0, 0, W, H);
  g.fillStyle = radial;
  g.fillRect(0, 0, W, H);

  if (!fullBleed) {
    g.strokeStyle = bevel;
    g.lineWidth = 3;
    roundedRect(g, 1.5, 1.5, W - 3, H - 3, radius - 1.5);
    g.stroke();
  }
  g.restore();
}

export function paintBgStyle(
  g: CanvasRenderingContext2D,
  layout: LayoutConfig,
  bgStyle: BgStyle,
  bg: string,
  fullBleed: boolean,
  coverImg: HTMLImageElement | null
) {
  const W = layout.w;
  const H = layout.h;
  g.save();
  if (fullBleed) {
    g.beginPath();
    g.rect(0, 0, W, H);
  } else {
    roundedRect(g, 0, 0, W, H, layout.radius);
  }
  g.clip();

  const bc = bgStyle === 'blur' ? blurredCover(coverImg) : null;
  if (bc) {
    const k = Math.max(W, H) / 256;
    g.drawImage(bc, (W - 256 * k) / 2, (H - 256 * k) / 2, 256 * k, 256 * k);
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.fillRect(0, 0, W, H);
  } else if (bgStyle === 'pattern') {
    g.fillStyle = mixHex(bg, '#000000', 0.55);
    g.fillRect(0, 0, W, H);
    const pat = tilePattern(g, 'bgdots', 40, (c, n) => {
      c.fillStyle = 'rgba(255,255,255,0.16)';
      c.beginPath();
      c.arc(n / 2, n / 2, 3.2, 0, 6.3);
      c.fill();
    });
    if (pat) {
      g.fillStyle = pat;
      g.fillRect(0, 0, W, H);
    }
  } else {
    const a = g.createLinearGradient(0, 0, W, H);
    a.addColorStop(0, mixHex(bg, '#ffffff', 0.22));
    a.addColorStop(0.55, bg);
    a.addColorStop(1, mixHex(bg, '#000000', 0.62));
    g.fillStyle = a;
    g.fillRect(0, 0, W, H);
  }
  g.restore();
}

export function paintBackdrop(
  g: CanvasRenderingContext2D,
  layout: LayoutConfig,
  theme: ThemeKey,
  bg: string,
  P: CardPalette,
  bgStyle: BgStyle,
  cardDepth: number,
  fullBleed: boolean,
  coverImg: HTMLImageElement | null
) {
  if (bgStyle !== 'none') {
    paintBgStyle(g, layout, bgStyle, bg, fullBleed, coverImg);
    return;
  }
  if (theme === 'classic') {
    if (fullBleed && cardDepth > 0) {
      g.fillStyle = bg;
      g.fillRect(0, 0, layout.w, layout.h);
    }
    return;
  }
  if (!fullBleed) return;

  const W = layout.w;
  const H = layout.h;
  g.save();
  if (fullBleed) {
    g.beginPath();
    g.rect(0, 0, W, H);
  } else {
    roundedRect(g, 0, 0, W, H, layout.radius);
  }
  g.clip();

  if (theme === 'glass') {
    const base = g.createLinearGradient(0, 0, W, H);
    base.addColorStop(0, mixHex(bg, '#000000', 0.35));
    base.addColorStop(1, mixHex(bg, '#000000', 0.72));
    const o1 = g.createRadialGradient(
      W * 0.2,
      H * 0.2,
      0,
      W * 0.2,
      H * 0.2,
      W * 0.55
    );
    o1.addColorStop(0, rgba(mixHex(bg, '#ffffff', 0.12), 0.95));
    o1.addColorStop(1, rgba(bg, 0));
    const accent = mixHex(bg, '#00D4FF', 0.55);
    const o2 = g.createRadialGradient(
      W * 0.86,
      H * 0.86,
      0,
      W * 0.86,
      H * 0.86,
      W * 0.5
    );
    o2.addColorStop(0, rgba(accent, 0.85));
    o2.addColorStop(1, rgba(accent, 0));

    g.fillStyle = base;
    g.fillRect(0, 0, W, H);
    g.fillStyle = o1;
    g.fillRect(0, 0, W, H);
    g.fillStyle = o2;
    g.fillRect(0, 0, W, H);
  } else {
    g.fillStyle =
      theme === 'cyberpunk' || theme === 'neon'
        ? '#0a0a0a'
        : theme === 'neumorphism'
        ? P.surface
        : bg;
    g.fillRect(0, 0, W, H);
  }
  g.restore();
}

export function paintCardBody(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette,
  tilt: TiltState,
  fullBleed: boolean,
  unit = 1,
  fixedExtrude = false
) {
  const W = layout.w;
  const H = layout.h;
  const theme = state.theme;
  const bg = state.color;
  const R = themeRadius(theme, layout.radius);
  const D = state.cardDepth;

  if (D > 0) {
    extrudeWalls(
      g,
      (c, ox, oy) => roundedPath(c, ox, oy, W, H, R),
      D,
      tilt,
      bg,
      P.wall,
      theme,
      { x: 0, y: 0, w: W, h: H },
      fixedExtrude
    );
  }

  // Clip signature themes to their rounded card silhouette unless fullBleed
  let paintedSignature = false;
  if (fullBleed && D === 0) {
    paintedSignature = paintSignatureBody(g, state, layout, P);
  } else {
    g.save();
    if (R > 0) {
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
    }
    paintedSignature = paintSignatureBody(g, state, layout, P);
    g.restore();
  }

  if (paintedSignature) return;

  if (paintCollectorBody(g, state, layout, P, unit)) return;

  switch (theme) {
    case 'brutalism': {
      if (D === 0) {
        g.fillStyle = '#000000';
        g.fillRect(14, 14, W, H);
      }
      g.fillStyle = bg;
      g.fillRect(0, 0, W, H);

      // Subtle architectural dot grid on zine stock
      const bpat = tilePattern(g, 'brutdots', 28, (c, n) => {
        c.fillStyle = 'rgba(0,0,0,0.08)';
        c.fillRect(n / 2, n / 2, 2, 2);
      });
      if (bpat) {
        g.fillStyle = bpat;
        g.fillRect(12, 12, W - 24, H - 24);
      }

      // Bold neo-brutalist outer frame + crisp inner hairline
      g.strokeStyle = '#000000';
      g.lineWidth = 10;
      g.strokeRect(5, 5, W - 10, H - 10);
      g.lineWidth = 3;
      g.strokeRect(18, 18, W - 36, H - 36);

      // Clean top-right corner registration badge
      g.fillStyle = '#000000';
      g.fillRect(W - 44, 18, 26, 12);
      break;
    }
    case 'cyberpunk': {
      g.fillStyle = '#080910';
      roundedRect(g, 0, 0, W, H, R);
      g.fill();

      // Dual-tone cyber ambient wash (primary neon + cool cyan accent)
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      const c1 = g.createRadialGradient(W * 0.12, H * 0.12, 10, W * 0.12, H * 0.12, W * 0.65);
      c1.addColorStop(0, rgba(P.neon || bg, 0.22));
      c1.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = c1;
      g.fillRect(0, 0, W, H);

      const c2 = g.createRadialGradient(W * 0.88, H * 0.88, 10, W * 0.88, H * 0.88, W * 0.6);
      c2.addColorStop(0, rgba(mixHex(bg, '#00F0FF', 0.6), 0.18));
      c2.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = c2;
      g.fillRect(0, 0, W, H);
      g.restore();

      g.save();
      g.shadowColor = bg;
      g.shadowBlur = 18 * unit;
      g.strokeStyle = P.neon || '#00FFCC';
      g.lineWidth = 4;
      roundedRect(g, 3, 3, W - 6, H - 6, Math.max(2, R - 3));
      g.stroke();
      g.restore();

      g.strokeStyle = rgba(mixHex(P.neon || bg, '#00F0FF', 0.4), 0.32);
      g.lineWidth = 1.5;
      roundedRect(g, 16, 16, W - 32, H - 32, Math.max(2, R - 14));
      g.stroke();
      break;
    }
    case 'glass': {
      // Rich frosted glassmorphism with internal colored light orbs, luminous sheen & crisp specular edge
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();

      const frostBase = g.createLinearGradient(0, 0, W, H);
      frostBase.addColorStop(0, rgba(mixHex(bg, '#141824', 0.45), 0.72));
      frostBase.addColorStop(1, rgba(mixHex(bg, '#090B12', 0.68), 0.82));
      g.fillStyle = frostBase;
      g.fillRect(0, 0, W, H);

      // Diffused color orbs glowing behind frosted glass
      const orb1 = g.createRadialGradient(W * 0.18, H * 0.18, 0, W * 0.18, H * 0.18, W * 0.62);
      orb1.addColorStop(0, rgba(mixHex(bg, '#ffffff', 0.22), 0.52));
      orb1.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = orb1;
      g.fillRect(0, 0, W, H);

      const orb2 = g.createRadialGradient(W * 0.85, H * 0.82, 0, W * 0.85, H * 0.82, W * 0.58);
      orb2.addColorStop(0, rgba(mixHex(bg, '#00D4FF', 0.55), 0.44));
      orb2.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = orb2;
      g.fillRect(0, 0, W, H);

      // Diagonal frosted glass reflection band
      const shine = g.createLinearGradient(0, 0, W * 0.85, H * 0.85);
      shine.addColorStop(0, 'rgba(255,255,255,0.34)');
      shine.addColorStop(0.28, 'rgba(255,255,255,0.12)');
      shine.addColorStop(0.55, 'rgba(255,255,255,0.02)');
      shine.addColorStop(1, 'rgba(255,255,255,0.10)');
      g.fillStyle = shine;
      g.fillRect(0, 0, W, H);
      g.restore();

      // Crisp specular top-left rim + soft bottom-right shadow rim
      const o = 1.5;
      g.lineWidth = 2.5;
      g.lineCap = 'round';
      g.strokeStyle = 'rgba(255,255,255,0.22)';
      roundedRect(g, o, o, W - 2 * o, H - 2 * o, Math.max(2, R - o));
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.88)';
      g.beginPath();
      g.moveTo(o, H - R);
      g.lineTo(o, R);
      g.arcTo(o, o, R, o, Math.max(2, R - o));
      g.lineTo(W - R, o);
      g.stroke();
      g.strokeStyle = 'rgba(0,0,0,0.28)';
      g.beginPath();
      g.moveTo(W - o, R);
      g.lineTo(W - o, H - R);
      g.arcTo(W - o, H - o, W - R, H - o, Math.max(2, R - o));
      g.lineTo(R, H - o);
      g.stroke();
      g.lineCap = 'butt';
      break;
    }
    case 'clay': {
      // Plump soft-3D claymorphism with pillowy top-left bounce light & cushioned bottom-right rim
      const inner = g.createLinearGradient(0, 0, W, H);
      inner.addColorStop(0, mixHex(P.surface, '#ffffff', 0.56));
      inner.addColorStop(0.5, P.surface);
      inner.addColorStop(1, mixHex(P.surface, bg, 0.25));
      const rim = g.createLinearGradient(0, 0, W, H);
      rim.addColorStop(0, 'rgba(255,255,255,0.55)');
      rim.addColorStop(0.42, 'rgba(255,255,255,0)');
      rim.addColorStop(0.65, 'rgba(0,0,0,0)');
      rim.addColorStop(1, rgba(mixHex(bg, '#000000', 0.55), 0.36));

      g.save();
      g.shadowColor = rgba(mixHex(bg, '#000000', 0.5), 0.45);
      g.shadowBlur = 42 * unit;
      g.shadowOffsetX = 16 * unit;
      g.shadowOffsetY = 18 * unit;
      g.fillStyle = P.surface;
      roundedRect(g, 0, 0, W, H, R);
      g.fill();
      g.restore();

      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      g.fillStyle = inner;
      g.fillRect(0, 0, W, H);

      // Soft pillow inner highlight ring
      g.strokeStyle = rim;
      g.lineWidth = 34;
      roundedRect(g, 0, 0, W, H, R);
      g.stroke();

      // Smooth glossy pill reflection tucked into top-right safe margin
      g.fillStyle = 'rgba(255,255,255,0.42)';
      g.beginPath();
      g.ellipse(W - 86, 46, 44, 16, 0.35, 0, Math.PI * 2);
      g.fill();
      g.restore();
      break;
    }
    case 'neumorphism': {
      // Soft tactile extruded surface with crisp dual-light bevel & recessed inner frame
      g.save();
      g.fillStyle = P.surface;
      roundedRect(g, 0, 0, W, H, R);
      g.shadowColor = 'rgba(255,255,255,0.92)';
      g.shadowBlur = 24 * unit;
      g.shadowOffsetX = -12 * unit;
      g.shadowOffsetY = -12 * unit;
      g.fill();
      g.shadowColor = P.shadowDark || 'rgba(0,0,0,0.35)';
      g.shadowOffsetX = 12 * unit;
      g.shadowOffsetY = 12 * unit;
      g.fill();
      g.restore();

      // Subtle debossed inner track bevel
      g.save();
      const grad = g.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, 'rgba(255,255,255,0.75)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0)');
      grad.addColorStop(1, rgba(mixHex(bg, '#000000', 0.45), 0.28));
      g.strokeStyle = grad;
      g.lineWidth = 4;
      roundedRect(g, 18, 18, W - 36, H - 36, Math.max(8, R - 16));
      g.stroke();
      g.restore();
      break;
    }
    case 'vinyl': {
      // Vinyl record half-tucked inside the bottom-right of the card (strictly clipped inside the card, zero overflow)
      cardDrop(g, W, H, R, P.surface, 34, 16, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();

      // Rich dark sleeve backdrop gradient
      const jg = g.createLinearGradient(0, 0, W, H);
      jg.addColorStop(0, mixHex(P.surface, '#ffffff', 0.07));
      jg.addColorStop(0.55, P.surface);
      jg.addColorStop(1, mixHex(P.surface, '#000000', 0.28));
      g.fillStyle = jg;
      g.fillRect(0, 0, W, H);

      // Vinyl record disc nested inside bottom-right corner
      const cx = W * 0.94;
      const cy = H * 0.94;
      const rr = Math.min(W, H) * 0.58;

      // Soft drop shadow under the vinyl disc inside the card
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.55)';
      g.shadowBlur = 24;
      g.fillStyle = '#0B0B0E';
      g.beginPath();
      g.arc(cx, cy, rr, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // Subtle rim highlight so the vinyl edge reads crisply against the dark card
      g.strokeStyle = rgba(mixHex(bg, '#ffffff', 0.45), 0.32);
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(cx, cy, rr - 1, 0, Math.PI * 2);
      g.stroke();

      // Concentric vinyl micro-grooves
      g.lineWidth = 1.5;
      for (let r = rr * 0.35; r < rr - 8; r += 6.5) {
        const alpha = 0.045 + 0.055 * Math.abs(Math.sin(r * 0.65));
        g.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.stroke();
      }

      // Anisotropic light-sheen wedges across the grooves
      for (const a of [-2.35, -1.65, 0.78]) {
        const sheen = g.createRadialGradient(cx, cy, rr * 0.32, cx, cy, rr);
        sheen.addColorStop(0, 'rgba(255,255,255,0.02)');
        sheen.addColorStop(0.55, 'rgba(255,255,255,0.13)');
        sheen.addColorStop(1, 'rgba(255,255,255,0.03)');
        g.fillStyle = sheen;
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, rr, a, a + 0.38);
        g.closePath();
        g.fill();
      }

      // Vibrant colored record center label
      g.fillStyle = bg;
      g.beginPath();
      g.arc(cx, cy, rr * 0.32, 0, Math.PI * 2);
      g.fill();

      // Inner label ring details & center spindle hole
      g.strokeStyle = 'rgba(0,0,0,0.28)';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, rr * 0.25, 0, Math.PI * 2);
      g.stroke();

      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, rr * 0.14, 0, Math.PI * 2);
      g.stroke();

      g.fillStyle = '#09090B';
      g.beginPath();
      g.arc(cx, cy, 11, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.25)';
      g.lineWidth = 1.5;
      g.stroke();

      // Crisp inner card rim
      g.strokeStyle = 'rgba(255,255,255,0.12)';
      g.lineWidth = 2;
      roundedRect(g, 1, 1, W - 2, H - 2, R);
      g.stroke();
      g.restore();
      break;
    }
    case 'ticket': {
      const f = cardFrame(layout, theme, state.hide);
      const st = f.stub || { v: false, at: H - 150, len: 150 };
      const nr = 18;
      // Draw explicit notched ticket silhouette without destination-out so backdrops/JPG exports stay intact
      const ticketPath = (c: CanvasRenderingContext2D) => {
        const rad = Math.min(R, W / 2, H / 2);
        c.beginPath();
        c.moveTo(rad, 0);
        if (st.v) {
          c.lineTo(st.at - nr, 0);
          c.arc(st.at, 0, nr, Math.PI, 0, true);
        }
        c.lineTo(W - rad, 0);
        c.arcTo(W, 0, W, rad, rad);
        if (!st.v) {
          c.lineTo(W, st.at - nr);
          c.arc(W, st.at, nr, -Math.PI / 2, Math.PI / 2, true);
        }
        c.lineTo(W, H - rad);
        c.arcTo(W, H, W - rad, H, rad);
        if (st.v) {
          c.lineTo(st.at + nr, H);
          c.arc(st.at, H, nr, 0, Math.PI, true);
        }
        c.lineTo(rad, H);
        c.arcTo(0, H, 0, H - rad, rad);
        if (!st.v) {
          c.lineTo(0, st.at + nr);
          c.arc(0, st.at, nr, Math.PI / 2, -Math.PI / 2, true);
        }
        c.lineTo(0, rad);
        c.arcTo(0, 0, rad, 0, rad);
        c.closePath();
      };

      g.save();
      g.shadowColor = 'rgba(0,0,0,0.42)';
      g.shadowBlur = 28 * unit;
      g.shadowOffsetX = 0;
      g.shadowOffsetY = 14 * unit;
      g.fillStyle = P.surface;
      ticketPath(g);
      g.fill();
      g.restore();

      g.save();
      ticketPath(g);
      g.clip();
      g.save();
      g.strokeStyle = rgba(P.text, 0.4);
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.setLineDash([1, 11]);
      g.beginPath();
      if (st.v) {
        g.moveTo(st.at, nr + 16);
        g.lineTo(st.at, H - nr - 16);
      } else {
        g.moveTo(nr + 16, st.at);
        g.lineTo(W - nr - 16, st.at);
      }
      g.stroke();
      g.restore();

      g.save();
      g.strokeStyle = rgba(P.text, 0.32);
      g.lineWidth = 3;
      g.setLineDash([12, 9]);
      const bw = st.v ? st.at - 26 - 28 : W - 52;
      const bh = st.v ? H - 52 : st.at - 26 - 28;
      roundedRect(g, 26, 26, bw, bh, Math.max(4, R - 12));
      g.stroke();
      g.restore();
      drawStub(g, P, st, layout, state.title, state.artist);
      g.restore();
      break;
    }
    case 'polaroid': {
      // Authentic SX-70 instant-film border with recessed inner photo well & translucent washi tape
      cardDrop(g, W, H, R, P.surface, 30, 16, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      const pg = g.createLinearGradient(0, 0, 0, H);
      pg.addColorStop(0, '#FFFDF9');
      pg.addColorStop(0.82, '#F7F3EA');
      pg.addColorStop(1, '#ECE6DA');
      g.fillStyle = pg;
      g.fillRect(0, 0, W, H);

      // Subtle recessed instant-photo well frame (classic wide bottom chin)
      const wellPad = 32;
      const chinH = Math.round(H * 0.13);
      g.fillStyle = mixHex(bg, '#F5F0E4', 0.92);
      g.fillRect(wellPad, wellPad, W - wellPad * 2, H - wellPad - chinH);
      g.strokeStyle = 'rgba(0,0,0,0.10)';
      g.lineWidth = 2.5;
      g.strokeRect(wellPad, wellPad, W - wellPad * 2, H - wellPad - chinH);
      g.restore();

      g.strokeStyle = 'rgba(0,0,0,0.09)';
      g.lineWidth = 2;
      roundedRect(g, 1, 1, W - 2, H - 2, R);
      g.stroke();

      // Semi-translucent masking/washi tape strip with serrated torn ends
      g.save();
      g.translate(W / 2, 16);
      g.rotate(-0.04);
      g.fillStyle = 'rgba(246,216,136,0.74)';
      g.beginPath();
      g.moveTo(-98, -20);
      g.lineTo(98, -20);
      g.lineTo(92, -6);
      g.lineTo(98, 8);
      g.lineTo(92, 22);
      g.lineTo(-98, 22);
      g.lineTo(-92, 8);
      g.lineTo(-98, -6);
      g.closePath();
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.28)';
      g.fillRect(-94, -18, 188, 11);
      g.restore();
      break;
    }
    case 'y2k': {
      // Liquid-chrome Y2K horizon gradient with metallic horizon reflection & crisp sparkles
      cardDrop(g, W, H, R, P.surface, 34, 16, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();

      const gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#FFFFFF');
      gr.addColorStop(0.28, mixHex(bg, '#E6EEFF', 0.72));
      gr.addColorStop(0.49, mixHex(bg, '#7F9BFF', 0.42));
      gr.addColorStop(0.51, '#FFFFFF');
      gr.addColorStop(0.68, mixHex(bg, '#D9E4FF', 0.65));
      gr.addColorStop(1, mixHex(bg, '#FFFFFF', 0.85));
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);

      // Glossy top chrome dome highlight
      g.fillStyle = 'rgba(255,255,255,0.44)';
      g.beginPath();
      g.ellipse(W * 0.45, -H * 0.1, W * 0.82, H * 0.3, 0, 0, Math.PI * 2);
      g.fill();

      // Crisp metallic horizon hairline
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.fillRect(0, Math.round(H * 0.5), W, 3);

      // Y2K 4-point chrome sparkles in safe corners
      sparkle(g, W * 0.91, H * 0.1, 30, 'rgba(255,255,255,0.96)');
      sparkle(g, W * 0.84, H * 0.18, 14, 'rgba(255,255,255,0.82)');
      sparkle(g, W * 0.9, H * 0.88, 22, 'rgba(255,255,255,0.9)');
      g.restore();

      g.strokeStyle = 'rgba(255,255,255,0.95)';
      g.lineWidth = 8;
      roundedRect(g, 4, 4, W - 8, H - 8, Math.max(4, R - 4));
      g.stroke();
      g.strokeStyle = rgba(mixHex(bg, '#101428', 0.55), 0.48);
      g.lineWidth = 2;
      roundedRect(g, 11, 11, W - 22, H - 22, Math.max(4, R - 11));
      g.stroke();
      break;
    }
    case 'aurora': {
      // Deep northern-lights sky with flowing aurora borealis ribbons
      cardDrop(g, W, H, R, P.surface, 34, 16, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();

      const night = g.createLinearGradient(0, 0, 0, H);
      night.addColorStop(0, '#040814');
      night.addColorStop(0.55, '#091024');
      night.addColorStop(1, '#050712');
      g.fillStyle = night;
      g.fillRect(0, 0, W, H);

      // Layered curving aurora borealis curtains
      const ribbons: [number, number, number, string, number][] = [
        [0.14, 0.2, 0.72, bg, 0.78],
        [0.86, 0.3, 0.65, mixHex(bg, '#00F0C8', 0.62), 0.68],
        [0.48, 0.88, 0.75, mixHex(bg, '#A855F7', 0.6), 0.65],
        [0.2, 0.78, 0.52, mixHex(bg, '#38BDF8', 0.65), 0.45],
      ];
      for (const [x, y, k, c, alpha] of ribbons) {
        const rg = g.createRadialGradient(
          W * x,
          H * y,
          0,
          W * x,
          H * y,
          Math.max(W, H) * k * 0.68
        );
        rg.addColorStop(0, rgba(c, alpha));
        rg.addColorStop(0.55, rgba(c, alpha * 0.28));
        rg.addColorStop(1, rgba(c, 0));
        g.fillStyle = rg;
        g.fillRect(0, 0, W, H);
      }

      // Luminous curved aurora wave arc across the upper sky
      g.save();
      const waveGrad = g.createLinearGradient(0, H * 0.15, W, H * 0.45);
      waveGrad.addColorStop(0, rgba(mixHex(bg, '#00FFAA', 0.5), 0));
      waveGrad.addColorStop(0.35, rgba(mixHex(bg, '#00FFAA', 0.5), 0.26));
      waveGrad.addColorStop(0.68, rgba(mixHex(bg, '#38BDF8', 0.55), 0.24));
      waveGrad.addColorStop(1, rgba(mixHex(bg, '#C084FC', 0.6), 0));
      g.strokeStyle = waveGrad;
      g.lineWidth = Math.round(Math.min(W, H) * 0.09);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(-40, H * 0.34);
      g.bezierCurveTo(W * 0.28, H * 0.14, W * 0.66, H * 0.46, W + 40, H * 0.22);
      g.stroke();
      g.restore();

      g.restore();
      g.strokeStyle = 'rgba(255,255,255,0.18)';
      g.lineWidth = 2;
      roundedRect(g, 1, 1, W - 2, H - 2, R);
      g.stroke();
      break;
    }
    case 'pixel': {
      // Classic retro 90s desktop window with beveled 3D chrome & pinstripe title bar
      if (D === 0) {
        g.fillStyle = '#000000';
        g.fillRect(12, 12, W, H);
      }
      g.fillStyle = P.surface;
      g.fillRect(0, 0, W, H);

      const pat = tilePattern(g, 'pxdots', 12, (c, n) => {
        c.fillStyle = 'rgba(0,0,0,0.045)';
        c.fillRect(0, 0, n / 2, n / 2);
        c.fillRect(n / 2, n / 2, n / 2, n / 2);
      });
      if (pat) {
        g.fillStyle = pat;
        g.fillRect(0, 0, W, H);
      }

      // Retro OS title bar with classic horizontal pinstripes
      const barH = 48;
      g.fillStyle = bg;
      g.fillRect(0, 0, W, barH);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      for (let y = 10; y < barH - 10; y += 6) {
        g.fillRect(108, y, W - 128, 2);
      }
      g.fillStyle = '#000000';
      g.fillRect(0, barH - 4, W, 6);

      // Beveled square retro window buttons
      for (let i = 0; i < 3; i++) {
        const bx = 18 + i * 26;
        const by = 14;
        g.fillStyle = '#111111';
        g.fillRect(bx + 2, by + 2, 16, 16);
        g.fillStyle = i === 0 ? '#FFFFFF' : 'rgba(255,255,255,0.75)';
        g.fillRect(bx, by, 16, 16);
        g.strokeStyle = '#000000';
        g.lineWidth = 2;
        g.strokeRect(bx, by, 16, 16);
      }

      // Outer 8-bit black border + inner retro bevel
      g.strokeStyle = '#000000';
      g.lineWidth = 8;
      g.strokeRect(4, 4, W - 8, H - 8);
      break;
    }
    case 'notebook': {
      // Ruled school notebook sheet with double red margin rule & shadowed 3-hole punches
      cardDrop(g, W, H, R, P.surface, 28, 14, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();

      // Subtle warm paper gradient
      const np = g.createLinearGradient(0, 0, W, H);
      np.addColorStop(0, '#FFFDF5');
      np.addColorStop(1, '#F6F0DC');
      g.fillStyle = np;
      g.fillRect(0, 0, W, H);

      // Horizontal blue notebook rules
      g.strokeStyle = 'rgba(68,124,210,0.28)';
      g.lineWidth = 2;
      for (let y = 64; y < H; y += 54) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }

      // Classic double red vertical margin rule
      const mx = Math.max(44, layout.pad - 24);
      g.strokeStyle = 'rgba(220,68,68,0.48)';
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(mx, 0);
      g.lineTo(mx, H);
      g.moveTo(mx - 6, 0);
      g.lineTo(mx - 6, H);
      g.stroke();

      // Realistic 3-hole punch cutouts with inner paper shadow
      for (const frac of [0.18, 0.5, 0.82]) {
        const hy = H * frac;
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.beginPath();
        g.arc(20, hy, 12, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#E8E1CC';
        g.beginPath();
        g.arc(21.5, hy + 1.5, 10, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      break;
    }
    case 'newspaper': {
      // Aged vintage broadsheet with double ink rules & subtle masthead header line
      cardDrop(g, W, H, R, P.surface, 26, 12, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();

      // Warm aged newsprint mottling gradient
      const aged = g.createRadialGradient(W * 0.5, H * 0.45, 40, W * 0.5, H * 0.45, Math.max(W, H) * 0.75);
      aged.addColorStop(0, '#F1EBD9');
      aged.addColorStop(1, '#DDD4BE');
      g.fillStyle = aged;
      g.fillRect(0, 0, W, H);

      const pat = tilePattern(g, 'halftone', 10, (c, n) => {
        c.fillStyle = 'rgba(24,22,20,0.08)';
        c.beginPath();
        c.arc(n / 2, n / 2, 1.3, 0, Math.PI * 2);
        c.fill();
      });
      if (pat) {
        g.fillStyle = pat;
        g.fillRect(0, 0, W, H);
      }

      // Subtle broadsheet masthead micro-strip tucked inside top border margin
      g.fillStyle = 'rgba(24,22,20,0.62)';
      g.font = `700 13px 'Playfair Display', Georgia, serif`;
      g.textBaseline = 'middle';
      g.textAlign = 'center';
      g.fillText('THE LYRIC CHRONICLE · SPECIAL EDITION', W / 2, 42);
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';

      // Crisp double editorial border + top masthead divider
      g.strokeStyle = 'rgba(24,22,20,0.88)';
      g.lineWidth = 4;
      g.strokeRect(20, 20, W - 40, H - 40);
      g.lineWidth = 1.5;
      g.strokeRect(29, 29, W - 58, H - 58);
      g.beginPath();
      g.moveTo(29, 54);
      g.lineTo(W - 29, 54);
      g.stroke();
      g.restore();
      break;
    }
    case 'sticker': {
      // Peeled top-right corner cutout matching 3D extruded Sticker silhouette
      const peel = Math.min(W, H) * 0.14;
      const outerPeel = peel + 16;
      const stickerOutline = (
        c: CanvasRenderingContext2D,
        ox: number,
        oy: number,
        sw: number,
        sh: number,
        sr: number,
        cut: number
      ) => {
        const rad = Math.min(sr, sw / 2, sh / 2);
        c.beginPath();
        c.moveTo(ox + rad, oy);
        c.lineTo(ox + sw - cut, oy);
        c.lineTo(ox + sw, oy + cut);
        c.lineTo(ox + sw, oy + sh - rad);
        c.arcTo(ox + sw, oy + sh, ox + sw - rad, oy + sh, rad);
        c.lineTo(ox + rad, oy + sh);
        c.arcTo(ox, oy + sh, ox, oy + sh - rad, rad);
        c.lineTo(ox, oy + rad);
        c.arcTo(ox, oy, ox + rad, oy, rad);
        c.closePath();
      };

      g.save();
      g.shadowColor = 'rgba(0,0,0,0.4)';
      g.shadowBlur = 24 * unit;
      g.shadowOffsetX = 0;
      g.shadowOffsetY = 12 * unit;
      g.fillStyle = '#ffffff';
      stickerOutline(g, -16, -16, W + 32, H + 32, R + 16, outerPeel);
      g.fill();
      g.restore();

      g.fillStyle = bg;
      stickerOutline(g, 0, 0, W, H, R, peel);
      g.fill();

      g.save();
      stickerOutline(g, 0, 0, W, H, R, peel);
      g.clip();
      const sg = g.createLinearGradient(0, 0, W, H);
      sg.addColorStop(0, 'rgba(255,255,255,0.22)');
      sg.addColorStop(0.45, 'rgba(255,255,255,0)');
      g.fillStyle = sg;
      g.fillRect(0, 0, W, H);
      g.restore();

      // Curled-back peeled flap along the top-right diagonal fold
      g.save();
      stickerOutline(g, -16, -16, W + 32, H + 32, R + 16, outerPeel);
      g.clip();
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 16 * unit;
      g.shadowOffsetX = -6 * unit;
      g.shadowOffsetY = 6 * unit;
      const flap = g.createLinearGradient(W - peel, 0, W, peel);
      flap.addColorStop(0, '#ffffff');
      flap.addColorStop(0.65, mixHex(bg, '#ffffff', 0.84));
      flap.addColorStop(1, mixHex(bg, '#000000', 0.12));
      g.fillStyle = flap;
      g.beginPath();
      g.moveTo(W + 16 - outerPeel, -16);
      g.lineTo(W + 16, -16 + outerPeel);
      g.lineTo(W + 16 - outerPeel * 0.82, -16 + outerPeel * 0.82);
      g.closePath();
      g.fill();
      g.restore();
      break;
    }
    case 'holo': {
      cardDrop(g, W, H, R, P.surface, 34, 16, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      const hsl = (h: number, a: number) => `hsla(${h},95%,62%,${a})`;
      const fo = g.createLinearGradient(0, 0, W, H);
      [0, 60, 130, 190, 250, 310, 360].forEach((h, i, a) =>
        fo.addColorStop(i / (a.length - 1), hsl(h, 0.95))
      );
      g.fillStyle = fo;
      g.fillRect(0, 0, W, H);
      g.fillStyle = P.surface;
      roundedRect(g, 20, 20, W - 40, H - 40, Math.max(6, R - 14));
      g.fill();
      const sh = g.createLinearGradient(0, H, W, 0);
      [0, 90, 180, 270, 330].forEach((h, i, a) =>
        sh.addColorStop(i / (a.length - 1), hsl(h, 0.16))
      );
      g.fillStyle = sh;
      roundedRect(g, 20, 20, W - 40, H - 40, Math.max(6, R - 14));
      g.fill();
      sparkle(g, W * 0.93, H * 0.07, 20, 'rgba(255,255,255,0.9)');
      sparkle(g, W * 0.87, H * 0.12, 10, 'rgba(255,255,255,0.7)');
      sparkle(g, W * 0.07, H * 0.955, 14, 'rgba(255,255,255,0.8)');
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.lineWidth = 2;
      roundedRect(g, 1, 1, W - 2, H - 2, R);
      g.stroke();
      break;
    }
    case 'wrapped': {
      cardDrop(g, W, H, R, bg, 34, 16, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      const wg = g.createLinearGradient(0, 0, W, H);
      const m = Math.min(W, H);
      wg.addColorStop(0, mixHex(bg, '#ffffff', 0.18));
      wg.addColorStop(0.55, bg);
      wg.addColorStop(1, mixHex(bg, '#7358FF', 0.5));
      g.fillStyle = wg;
      g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,0.10)';
      g.beginPath();
      g.arc(W * 0.92, H * 0.12, m * 0.34, 0, 7);
      g.fill();
      g.fillStyle = 'rgba(0,0,0,0.10)';
      g.beginPath();
      g.arc(W * 0.02, H * 0.98, m * 0.42, 0, 7);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.14)';
      g.lineWidth = m * 0.05;
      g.beginPath();
      g.arc(W * 0.8, H * 0.9, m * 0.3, 0, 7);
      g.stroke();
      g.fillStyle = rgba(P.text, 0.5);
      roundedRect(g, W / 2 - 70, H - 20, 140, 6, 3);
      g.fill();
      g.restore();
      break;
    }
    case 'cassette': {
      cardDrop(g, W, H, R, P.surface, 30, 14, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      [bg, mixHex(bg, '#ffffff', 0.4), mixHex(bg, '#000000', 0.3), bg].forEach(
        (c, i) => {
          g.fillStyle = c;
          g.fillRect(0, i * 8, W, 8);
        }
      );
      const bh = 46;
      g.fillStyle = mixHex(P.surface, '#000000', 0.22);
      g.beginPath();
      g.moveTo(W * 0.12, H);
      g.lineTo(W * 0.17, H - bh);
      g.lineTo(W * 0.83, H - bh);
      g.lineTo(W * 0.88, H);
      g.closePath();
      g.fill();
      g.fillStyle = rgba(P.text, 0.55);
      for (const x of [0.3, 0.7]) {
        g.beginPath();
        g.arc(W * x, H - bh * 0.45, 10, 0, 7);
        g.fill();
      }
      g.strokeStyle = 'rgba(0,0,0,0.3)';
      g.lineWidth = 2;
      for (const [x, y] of [
        [24, 54],
        [W - 24, 54],
        [24, H - 24],
        [W - 24, H - 24],
      ]) {
        g.fillStyle = 'rgba(0,0,0,0.16)';
        g.beginPath();
        g.arc(x, y, 9, 0, 7);
        g.fill();
        g.beginPath();
        g.moveTo(x - 5, y - 5);
        g.lineTo(x + 5, y + 5);
        g.stroke();
      }
      g.restore();
      break;
    }
    case 'receipt': {
      const n = Math.round(W / 22);
      const tw = W / n;
      const tt = 10;
      const zig = (c: CanvasRenderingContext2D) => {
        c.beginPath();
        c.moveTo(0, tt);
        for (let i = 0; i < n; i++) {
          c.lineTo(i * tw + tw / 2, 0);
          c.lineTo((i + 1) * tw, tt);
        }
        c.lineTo(W, H - tt);
        for (let i = n; i > 0; i--) {
          c.lineTo(i * tw - tw / 2, H);
          c.lineTo((i - 1) * tw, H - tt);
        }
        c.closePath();
      };
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.4)';
      g.shadowBlur = 28 * unit;
      g.shadowOffsetX = 0;
      g.shadowOffsetY = 14 * unit;
      g.fillStyle = P.surface;
      zig(g);
      g.fill();
      g.restore();
      g.save();
      zig(g);
      g.clip();
      const sg = g.createLinearGradient(0, 0, W, 0);
      sg.addColorStop(0, 'rgba(0,0,0,0.05)');
      sg.addColorStop(0.5, 'rgba(255,255,255,0.35)');
      sg.addColorStop(1, 'rgba(0,0,0,0.05)');
      g.fillStyle = sg;
      g.fillRect(0, 0, W, H);
      g.strokeStyle = rgba(P.text, 0.4);
      g.lineWidth = 3;
      g.setLineDash([10, 8]);
      const ry = layout.pad + layout.cover + layout.lyricGap / 2;
      g.beginPath();
      g.moveTo(layout.pad, ry);
      g.lineTo(W - layout.pad, ry);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = rgba(P.text, 0.5);
      g.font = `600 22px 'Courier New', monospace`;
      letterSpacing(g, 2);
      g.textAlign = 'center';
      g.textBaseline = 'alphabetic';
      g.fillText('*** THANK YOU ***', W / 2, H - 30);
      g.textAlign = 'left';
      letterSpacing(g, 0);
      g.restore();
      break;
    }
    case 'gameboy': {
      cardDrop(g, W, H, R, '#C9C6BB', 30, 14, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      g.fillStyle = '#5B5D74';
      roundedRect(g, 14, 14, W - 28, H - 28, 14);
      g.fill();
      g.fillStyle = P.surface;
      roundedRect(g, 30, 30, W - 60, H - 60, 6);
      g.fill();
      const pat = tilePattern(g, 'lcd', 6, (c, k) => {
        c.fillStyle = 'rgba(15,56,15,0.10)';
        c.fillRect(0, 0, k, 1);
        c.fillRect(0, 0, 1, k);
      });
      if (pat) {
        g.fillStyle = pat;
        roundedRect(g, 30, 30, W - 60, H - 60, 6);
        g.fill();
      }
      g.fillStyle = '#D33A4A';
      g.beginPath();
      g.arc(22, H / 2, 3.5, 0, 7);
      g.fill();
      g.restore();
      break;
    }
    case 'stained': {
      cardDrop(g, W, H, R, '#0c0c10', 30, 14, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      const cols = 5;
      const rows = Math.max(4, Math.round((cols * H) / W));
      const cw = W / cols;
      const rh = H / rows;
      let sd = 7;
      const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const pts: [number, number][][] = [];
      for (let j = 0; j <= rows; j++) {
        pts.push([]);
        for (let i = 0; i <= cols; i++) {
          const jx = (rnd() - 0.5) * cw * 0.55;
          const jy = (rnd() - 0.5) * rh * 0.55;
          pts[j].push([
            i * cw + (i % cols ? jx : 0),
            j * rh + (j % rows ? jy : 0),
          ]);
        }
      }
      const cs = [
        bg,
        mixHex(bg, '#E8115B', 0.5),
        mixHex(bg, '#F5B700', 0.55),
        mixHex(bg, '#1DB9D6', 0.55),
        mixHex(bg, '#7358FF', 0.55),
      ];
      const quad = (j: number, i: number) => {
        g.beginPath();
        [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]].forEach(
          (q, k) => (k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]))
        );
        g.closePath();
      };
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          g.fillStyle = mixHex(
            cs[Math.floor(rnd() * cs.length)],
            '#000000',
            0.5
          );
          quad(j, i);
          g.fill();
        }
      }
      const lg = g.createRadialGradient(
        W / 2,
        H * 0.4,
        0,
        W / 2,
        H * 0.4,
        Math.max(W, H) * 0.7
      );
      lg.addColorStop(0, 'rgba(255,255,255,0.18)');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = lg;
      g.fillRect(0, 0, W, H);
      g.strokeStyle = '#07070a';
      g.lineWidth = 7;
      g.lineJoin = 'round';
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          quad(j, i);
          g.stroke();
        }
      }
      g.lineWidth = 18;
      roundedRect(g, 0, 0, W, H, R);
      g.stroke();
      g.restore();
      break;
    }
    case 'neon': {
      cardDrop(g, W, H, R, P.surface, 30, 14, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, R);
      g.clip();
      const pat = tilePattern(g, 'brick', 64, (c, k) => {
        c.fillStyle = 'rgba(255,255,255,0.07)';
        c.fillRect(0, 0, k, 2);
        c.fillRect(0, k / 2, k, 2);
        c.fillRect(0, 0, 2, k / 2);
        c.fillRect(k / 2, k / 2, 2, k / 2);
      });
      if (pat) {
        g.fillStyle = pat;
        g.fillRect(0, 0, W, H);
      }
      const wg = g.createRadialGradient(
        W / 2,
        H / 2,
        0,
        W / 2,
        H / 2,
        Math.max(W, H) * 0.65
      );
      wg.addColorStop(0, rgba(bg, 0.2));
      wg.addColorStop(1, rgba(bg, 0));
      g.fillStyle = wg;
      g.fillRect(0, 0, W, H);
      g.restore();

      const per = 2 * (W + H);
      const tube = (ins: number, lw: number, col: string, blur: number) => {
        g.save();
        g.shadowColor = bg;
        g.shadowBlur = blur * unit;
        g.strokeStyle = col;
        g.lineWidth = lw;
        g.lineCap = 'round';
        g.setLineDash([per - 70, 70]);
        roundedRect(g, ins, ins, W - 2 * ins, H - 2 * ins, Math.max(6, R - ins));
        g.stroke();
        g.stroke();
        g.restore();
      };
      tube(18, 7, P.neon || '#00FFCC', 26);
      tube(34, 3, rgba(P.neon || '#00FFCC', 0.7), 14);
      tube(18, 2, mixHex(P.neon || '#00FFCC', '#ffffff', 0.75), 0);
      break;
    }
    case 'comic': {
      if (D === 0) {
        g.fillStyle = '#111111';
        g.fillRect(14, 14, W, H);
      }
      g.fillStyle = P.surface;
      g.fillRect(0, 0, W, H);
      g.save();
      g.beginPath();
      g.rect(0, 0, W, H);
      g.clip();
      g.fillStyle = mixHex(bg, '#ffffff', 0.15);
      g.beginPath();
      const reach = Math.min(W, H) * 0.9;
      const st = 26;
      for (let y = 0; y < H; y += st) {
        for (let x = 0; x < W; x += st) {
          const d = Math.hypot(W - x, H - y) / reach;
          if (d >= 1) continue;
          const rr = 9 * (1 - d);
          g.moveTo(x + rr, y);
          g.arc(x, y, rr, 0, 7);
        }
      }
      g.fill();
      g.fillStyle = '#FFD60A';
      g.strokeStyle = '#111111';
      g.lineWidth = 5;
      g.lineJoin = 'miter';
      g.beginPath();
      for (let i = 0; i < 24; i++) {
        const a = (i * Math.PI) / 12;
        const r = i % 2 ? 24 : 46;
        g[i ? 'lineTo' : 'moveTo'](
          W - 34 + Math.cos(a) * r,
          34 + Math.sin(a) * r
        );
      }
      g.closePath();
      g.fill();
      g.stroke();
      g.restore();
      g.strokeStyle = '#111111';
      g.lineWidth = 10;
      g.strokeRect(5, 5, W - 10, H - 10);
      break;
    }
    default: {
      const bleed = fullBleed && D === 0;
      if (state.layoutKey === 'wide') {
        paintMetalBackground(g, W, H, layout.radius, bg, bleed);
      } else {
        g.fillStyle = bg;
        if (bleed) {
          g.fillRect(0, 0, W, H);
        } else {
          roundedRect(g, 0, 0, W, H, layout.radius);
          g.fill();
        }
      }
    }
  }
}

export function themeFinish(
  g: CanvasRenderingContext2D,
  theme: ThemeKey,
  _bg: string,
  P: CardPalette,
  layout: LayoutConfig
) {
  const W = layout.w;
  const H = layout.h;
  const R = themeRadius(theme, layout.radius);
  const m = Math.min(W, H);

  const clipCard = () => {
    g.save();
    roundedRect(g, 0, 0, W, H, R);
    g.clip();
  };

  const grain = (a: number) => {
    const pat = tilePattern(g, 'grain' + a, 96, (c, n) => {
      for (let i = 0; i < 520; i++) {
        c.fillStyle =
          Math.random() < 0.5
            ? `rgba(255,255,255,${a})`
            : `rgba(0,0,0,${a})`;
        c.fillRect(Math.random() * n, Math.random() * n, 1.4, 1.4);
      }
    });
    if (pat) {
      g.fillStyle = pat;
      g.fillRect(0, 0, W, H);
    }
  };

  const topLight = (a: number, h = 0.55) => {
    const l = g.createLinearGradient(0, 0, 0, H * h);
    l.addColorStop(0, `rgba(255,255,255,${a})`);
    l.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = l;
    g.fillRect(0, 0, W, H);
  };

  const vignette = (a: number) => {
    const v = g.createRadialGradient(
      W / 2,
      H / 2,
      m * 0.35,
      W / 2,
      H / 2,
      Math.max(W, H) * 0.78
    );
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, `rgba(0,0,0,${a})`);
    g.fillStyle = v;
    g.fillRect(0, 0, W, H);
  };

  switch (theme) {
    case 'classic':
      clipCard();
      topLight(0.1);
      grain(0.035);
      g.restore();
      break;
    case 'brutalism':
      g.save();
      g.beginPath();
      g.rect(10, H - 36, W - 20, 26);
      g.clip();
      g.strokeStyle = '#000';
      g.lineWidth = 6;
      for (let x = -40; x < W + 40; x += 22) {
        g.beginPath();
        g.moveTo(x, H - 8);
        g.lineTo(x + 26, H - 40);
        g.stroke();
      }
      g.restore();
      g.strokeStyle = '#000';
      g.lineWidth = 3;
      g.strokeRect(20, 20, W - 40, H - 40);
      break;
    case 'cyberpunk':
      clipCard();
      g.strokeStyle = rgba(P.neon || '#00FFCC', 0.07);
      g.lineWidth = 1;
      for (let x = 0; x < W; x += 64) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, H);
        g.stroke();
      }
      for (let y = 0; y < H; y += 64) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,0.22)';
      for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2);
      vignette(0.45);
      g.restore();
      g.save();
      g.shadowColor = P.neon || '#00FFCC';
      g.shadowBlur = 12;
      g.strokeStyle = P.neon || '#00FFCC';
      g.lineWidth = 5;
      g.lineCap = 'square';
      for (const [x, y, sx, sy] of [
        [30, 30, 1, 1],
        [W - 30, 30, -1, 1],
        [30, H - 30, 1, -1],
        [W - 30, H - 30, -1, -1],
      ]) {
        g.beginPath();
        g.moveTo(x, y + sy * 46);
        g.lineTo(x, y);
        g.lineTo(x + sx * 46, y);
        g.stroke();
      }
      g.restore();
      break;
    case 'glass':
      clipCard();
      topLight(0.14, 0.4);
      grain(0.03);
      g.fillStyle = 'rgba(255,255,255,0.18)';
      g.beginPath();
      g.ellipse(W * 0.5, -H * 0.38, W * 0.9, H * 0.55, 0, 0, 7);
      g.fill();
      g.restore();
      break;
    case 'clay':
      clipCard();
      grain(0.03);
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.beginPath();
      g.ellipse(W * 0.2, H * 0.1, m * 0.1, m * 0.045, -0.5, 0, 7);
      g.fill();
      g.restore();
      break;
    case 'neumorphism':
      clipCard();
      grain(0.025);
      g.restore();
      break;
    case 'vinyl':
      clipCard();
      topLight(0.07);
      g.restore();
      break;
    case 'ticket':
      clipCard();
      grain(0.05);
      g.restore();
      break;
    case 'polaroid':
      clipCard();
      grain(0.04);
      vignette(0.07);
      g.restore();
      break;
    case 'y2k':
      clipCard();
      g.strokeStyle = 'rgba(255,255,255,0.18)';
      g.lineWidth = 2;
      for (let i = -H; i < W; i += 36) {
        g.beginPath();
        g.moveTo(i, H);
        g.lineTo(i + H, 0);
        g.stroke();
      }
      g.restore();
      break;
    case 'aurora': {
      clipCard();
      grain(0.045);
      vignette(0.35);
      const starPat = tilePattern(g, 'stars', 160, (c, n) => {
        for (let i = 0; i < 14; i++) {
          c.fillStyle = `rgba(255,255,255,${0.25 + Math.random() * 0.5})`;
          c.beginPath();
          c.arc(
            Math.random() * n,
            Math.random() * n,
            Math.random() * 1.4 + 0.4,
            0,
            7
          );
          c.fill();
        }
      });
      if (starPat) {
        g.fillStyle = starPat;
        g.fillRect(0, 0, W, H);
      }
      g.restore();
      break;
    }
    case 'pixel':
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(8, 48, W - 16, 4);
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(8, H - 14, W - 16, 6);
      break;
    case 'notebook':
      clipCard();
      grain(0.04);
      vignette(0.08);
      g.restore();
      break;
    case 'newspaper':
      clipCard();
      grain(0.06);
      vignette(0.14);
      g.restore();
      break;
    case 'sticker': {
      const peel = Math.min(W, H) * 0.14;
      const ins = 10;
      const innerR = Math.max(6, R - ins);
      const innerPeel = Math.max(8, peel - ins * 0.4);
      g.save();
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(ins + innerR, ins);
      g.lineTo(W - ins - innerPeel, ins);
      g.lineTo(W - ins, ins + innerPeel);
      g.lineTo(W - ins, H - ins - innerR);
      g.arcTo(W - ins, H - ins, W - ins - innerR, H - ins, innerR);
      g.lineTo(ins + innerR, H - ins);
      g.arcTo(ins, H - ins, ins, H - ins - innerR, innerR);
      g.lineTo(ins, ins + innerR);
      g.arcTo(ins, ins, ins + innerR, ins, innerR);
      g.closePath();
      g.stroke();
      g.restore();
      break;
    }
    case 'holo': {
      clipCard();
      g.globalCompositeOperation = 'overlay';
      const hg = g.createLinearGradient(0, 0, W, H);
      ['#ff4fd8', '#4fe3ff', '#fff36b', '#6bff9e', '#ff4fd8'].forEach(
        (c, i, a) => hg.addColorStop(i / (a.length - 1), c)
      );
      g.fillStyle = hg;
      g.globalAlpha = 0.35;
      g.fillRect(0, 0, W, H);
      g.restore();
      break;
    }
    case 'wrapped':
      clipCard();
      grain(0.035);
      topLight(0.1);
      g.restore();
      break;
    case 'cassette':
      clipCard();
      grain(0.04);
      topLight(0.08);
      g.restore();
      break;
    case 'receipt': {
      g.save();
      g.globalAlpha = 1;
      const rpat = tilePattern(g, 'paperfx', 96, (c, n) => {
        for (let i = 0; i < 380; i++) {
          c.fillStyle = `rgba(0,0,0,${0.02 + Math.random() * 0.03})`;
          c.fillRect(Math.random() * n, Math.random() * n, 1.3, 1.3);
        }
      });
      if (rpat) {
        g.fillStyle = rpat;
        g.fillRect(0, 12, W, H - 24);
      }
      g.restore();
      break;
    }
    case 'gameboy':
      clipCard();
      topLight(0.08);
      g.restore();
      break;
    case 'stained':
      clipCard();
      vignette(0.35);
      g.restore();
      break;
    case 'neon':
      clipCard();
      vignette(0.4);
      grain(0.03);
      g.restore();
      break;
    case 'comic':
      clipCard();
      grain(0.03);
      g.restore();
      break;
    case 'stamp':
    case 'boarding':
    case 'matchbook':
    case 'waxseal':
    case 'risograph':
    case 'swiss':
    case 'vhs':
      clipCard();
      grain(0.045);
      vignette(0.08);
      g.restore();
      break;
    case 'plaque':
    case 'tarot':
    case 'filmstrip':
      clipCard();
      topLight(0.09);
      vignette(0.28);
      g.restore();
      break;
    case 'cdcase':
    case 'minidisc':
    case 'vippass':
    case 'ipod':
    case 'aqua':
    case 'frutiger':
      clipCard();
      topLight(0.12, 0.45);
      g.restore();
      break;
    case 'terminal':
      clipCard();
      vignette(0.32);
      g.restore();
      break;
  }
}

export function paintGlare(
  g: CanvasRenderingContext2D,
  state: CardState,
  _layout: LayoutConfig,
  tilt: TiltState,
  fixedExtrude = false
) {
  if (state.glareStyle === 'none' || state.glare <= 0) return;
  const geo = cardGeom(
    state.layoutKey,
    state.theme,
    state.cardDepth,
    state.bgStyle,
    tilt,
    fixedExtrude
  );

  g.save();
  roundedRect(g, geo.x, geo.y, geo.w, geo.h, geo.r);
  g.clip();
  g.globalCompositeOperation = 'overlay';
  g.globalAlpha = state.glare / 100;

  if (state.glareStyle === 'spotlight' || state.glareStyle === 'follow') {
    const sp = GLARE.spot;
    const fx =
      state.glareStyle === 'follow'
        ? Math.min(0.85, Math.max(0.15, 0.5 + (tilt.ry / 45) * 0.35))
        : sp.x;
    const fy =
      state.glareStyle === 'follow'
        ? Math.min(0.85, Math.max(0.15, 0.5 - (tilt.rx / 45) * 0.35))
        : sp.y;
    const px = geo.x + geo.w * fx;
    const py = geo.y + geo.h * fy;
    const rx = geo.w * sp.r;
    const ry = geo.h * sp.r;
    g.translate(px, py);
    g.scale(rx, ry);
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    for (const [p, color] of sp.stops) grad.addColorStop(p, color);
    g.fillStyle = grad;
    g.fillRect(
      (geo.x - px) / rx,
      (geo.y - py) / ry,
      geo.w / rx,
      geo.h / ry
    );
  } else {
    const L =
      (GLARE.lin as Record<string, { angle: number; stops: [number, string][] }>)[
        state.glareStyle
      ] || GLARE;
    const a = (L.angle * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const half =
      (Math.abs(geo.w * Math.sin(a)) + Math.abs(geo.h * Math.cos(a))) / 2;
    const cx = geo.x + geo.w / 2;
    const cy = geo.y + geo.h / 2;
    const grad = g.createLinearGradient(
      cx - dx * half,
      cy - dy * half,
      cx + dx * half,
      cy + dy * half
    );
    for (const [p, color] of L.stops) grad.addColorStop(p, color);
    g.fillStyle = grad;
    g.fillRect(geo.x, geo.y, geo.w, geo.h);
  }
  g.restore();
}
