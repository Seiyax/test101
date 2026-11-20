import type { CardState, LayoutConfig, ThemeKey } from '../types';
import { luma, mixHex, rgba } from '../utils/colorUtils';
import { cardFrame } from './geometry';

export const SIGNATURE_THEMES = [
  'pixelart',
  'chalkboard',
  'glowsketch',
  'ps2',
  'comicart',
  'flatvector',
  'dankoe',
  'cgimotion',
  'lego',
  'zackd',
] as const satisfies readonly ThemeKey[];

const SIGNATURE = new Set<string>(SIGNATURE_THEMES);

export function isSignatureTheme(theme: ThemeKey): boolean {
  return SIGNATURE.has(theme);
}

type Pass = { dx: number; dy: number; color: string; main: boolean };

export type CardPalette = {
  text: string;
  surface: string;
  glow: string | null;
  wall: string;
  neon: string | null;
  shadowDark: string | null;
  passes: Pass[];
};

const pass = (color: string, dx = 0, dy = 0, main = true): Pass => ({
  dx,
  dy,
  color,
  main,
});

export function applySignaturePalette(
  theme: ThemeKey,
  P: CardPalette,
  bg: string
): boolean {
  if (!isSignatureTheme(theme)) return false;
  const ink = luma(bg) > 150 ? '#121212' : '#F8F6F0';

  switch (theme) {
    case 'pixelart': {
      // Crisp 8-bit RPG dialogue panel with guaranteed high legibility
      P.surface = mixHex(bg, '#F4F1E1', 0.82);
      P.text = '#14161F';
      P.wall = '#181A24';
      P.passes = [pass('rgba(0,0,0,0.16)', 3, 3, false), pass('#14161F')];
      break;
    }
    case 'chalkboard': {
      P.surface = mixHex('#18382B', bg, 0.16);
      P.text = '#F5F1E6';
      P.wall = '#4E3119';
      P.passes = [
        pass('rgba(245,241,230,0.22)', 1.5, 1, false),
        pass('#F5F1E6'),
      ];
      break;
    }
    case 'glowsketch': {
      const neon = luma(bg) < 95 ? mixHex(bg, '#ffffff', 0.45) : bg;
      P.surface = '#08080F';
      P.text = mixHex(neon, '#ffffff', 0.48);
      P.glow = neon;
      P.neon = neon;
      P.wall = '#05050A';
      P.passes = [pass(P.text)];
      break;
    }
    case 'ps2': {
      P.surface = '#0C1028';
      P.text = '#EDF7FF';
      P.glow = mixHex(bg, '#55B9FF', 0.55);
      P.neon = mixHex(bg, '#7CE0FF', 0.5);
      P.wall = '#060818';
      P.passes = [pass('#EDF7FF')];
      break;
    }
    case 'comicart': {
      P.surface = '#FFF6D6';
      P.text = '#141414';
      P.wall = '#111111';
      // Crisp offset comic ink drop-shadow in accent tint behind solid black lettering
      P.passes = [
        pass(rgba(mixHex(bg, '#FF2D55', 0.35), 0.45), 4, 4, false),
        pass('#141414'),
      ];
      break;
    }
    case 'flatvector': {
      P.surface = bg;
      P.text = ink;
      P.wall = mixHex(bg, '#000000', 0.28);
      P.passes = [pass(ink)];
      break;
    }
    case 'dankoe': {
      P.surface = '#0E0E0F';
      P.text = '#F2EFE8';
      P.neon = bg;
      P.wall = '#080809';
      P.passes = [pass('#F2EFE8')];
      break;
    }
    case 'cgimotion': {
      P.surface = '#070910';
      P.text = '#F5F8FF';
      P.glow = mixHex(bg, '#5CE1FF', 0.4);
      P.wall = '#05060C';
      P.passes = [pass('#F5F8FF')];
      break;
    }
    case 'lego': {
      const plastic = mixHex(bg, '#ffffff', 0.08);
      P.surface = plastic;
      P.text = luma(plastic) > 152 ? '#161616' : '#FFFDF8';
      P.wall = mixHex(plastic, '#000000', 0.24);
      P.passes = [
        pass(
          luma(plastic) > 152 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.28)',
          0,
          2.5,
          false
        ),
        pass(P.text),
      ];
      break;
    }
    case 'zackd': {
      P.surface = '#0A0B0D';
      P.text = '#FFFFFF';
      P.neon = '#FFE14A';
      P.wall = '#050506';
      P.passes = [pass('rgba(0,0,0,0.55)', 0, 3, false), pass('#FFFFFF')];
      break;
    }
    default:
      return false;
  }
  return true;
}

function rr(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  g.beginPath();
  g.moveTo(x + rad, y);
  g.arcTo(x + w, y, x + w, y + h, rad);
  g.arcTo(x + w, y + h, x, y + h, rad);
  g.arcTo(x, y + h, x, y, rad);
  g.arcTo(x, y, x + w, y, rad);
  g.closePath();
}

export function paintSignatureBody(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette
): boolean {
  if (!isSignatureTheme(state.theme)) return false;
  const { w: W, h: H } = layout;
  const bg = state.color;
  const theme = state.theme;
  const minSide = Math.min(W, H);

  if (theme === 'pixelart') {
    // 8-bit RPG dialogue window: dithered pixel border + crisp readable inner panel
    const px = Math.max(8, Math.round(minSide / 88));
    const frame = px * 4;
    const titleH = px * 5;

    // Outer dark pixel border
    g.fillStyle = '#14161F';
    g.fillRect(0, 0, W, H);

    // Checkerboard dither rim inside the outer frame
    const cA = mixHex(bg, '#000000', 0.25);
    const cB = mixHex(bg, '#ffffff', 0.28);
    for (let y = px; y < H - px; y += px) {
      for (let x = px; x < W - px; x += px) {
        const inside =
          x >= frame &&
          x < W - frame &&
          y >= frame + titleH - px &&
          y < H - frame;
        if (inside) continue;
        const ix = Math.floor(x / px);
        const iy = Math.floor(y / px);
        g.fillStyle = (ix + iy) % 2 === 0 ? cA : cB;
        g.fillRect(x, y, px, px);
      }
    }

    // 8-bit window title bar
    g.fillStyle = mixHex(bg, '#000000', 0.15);
    g.fillRect(frame - px, px * 2, W - (frame - px) * 2, titleH - px);
    g.fillStyle = '#14161F';
    g.fillRect(frame - px, px * 2 + titleH - px, W - (frame - px) * 2, px);

    // Stepped pixel window control dots on top-right
    for (let i = 0; i < 3; i++) {
      g.fillStyle = i === 0 ? '#FF5F56' : i === 1 ? '#FFBD2E' : '#27C93F';
      g.fillRect(W - frame - px * (2 + i * 3), px * 3, px * 2, px * 2);
    }

    // Solid high-legibility inner cream/tinted pixel panel
    const ix = frame;
    const iy = frame + titleH - px;
    const iw = W - frame * 2;
    const ih = H - iy - frame;
    g.fillStyle = P.surface;
    g.fillRect(ix, iy, iw, ih);

    // Subtle 8-bit inner bevel highlight & shadow
    g.fillStyle = 'rgba(255,255,255,0.65)';
    g.fillRect(ix, iy, iw, px);
    g.fillRect(ix, iy, px, ih);
    g.fillStyle = 'rgba(20,22,31,0.16)';
    g.fillRect(ix, iy + ih - px, iw, px);
    g.fillRect(ix + iw - px, iy, px, ih);

    // Crisp inner border
    g.strokeStyle = '#14161F';
    g.lineWidth = px;
    g.strokeRect(ix - px / 2, iy - px / 2, iw + px, ih + px);
    return true;
  }

  if (theme === 'chalkboard') {
    // Warm mitered classroom wood frame
    const m = Math.round(minSide * 0.036);
    const wood = g.createLinearGradient(0, 0, W, H);
    wood.addColorStop(0, '#7B4E2B');
    wood.addColorStop(0.5, '#5B361B');
    wood.addColorStop(1, '#3D2310');
    g.fillStyle = wood;
    g.fillRect(0, 0, W, H);

    // Subtle wood grain lines on border
    g.strokeStyle = 'rgba(0,0,0,0.18)';
    g.lineWidth = 2;
    for (let i = 6; i < m; i += 8) {
      g.strokeRect(i, i, W - i * 2, H - i * 2);
    }

    // Deep slate chalkboard surface
    g.fillStyle = P.surface;
    rr(g, m, m, W - m * 2, H - m * 2, 8);
    g.fill();

    g.save();
    rr(g, m, m, W - m * 2, H - m * 2, 8);
    g.clip();

    // Soft eraser chalk-dust clouds (replaces notebook lines!)
    for (const [cx, cy, r, a] of [
      [0.24, 0.34, 0.36, 0.06],
      [0.74, 0.58, 0.42, 0.055],
      [0.48, 0.82, 0.34, 0.05],
      [0.65, 0.22, 0.28, 0.045],
    ]) {
      const smudge = g.createRadialGradient(
        W * cx,
        H * cy,
        10,
        W * cx,
        H * cy,
        minSide * r
      );
      smudge.addColorStop(0, `rgba(245,241,230,${a})`);
      smudge.addColorStop(1, 'rgba(245,241,230,0)');
      g.fillStyle = smudge;
      g.fillRect(m, m, W - m * 2, H - m * 2);
    }

    // Fine chalk dust speckles
    g.fillStyle = 'rgba(245,241,230,0.14)';
    for (let i = 0; i < 160; i++) {
      const x = m + ((i * 137 + 29) % Math.max(1, W - m * 2));
      const y = m + ((i * 89 + 17) % Math.max(1, H - m * 2));
      g.fillRect(x, y, (i % 3) + 1, 1.2);
    }

    // Recessed inner wood shadow
    g.strokeStyle = 'rgba(0,0,0,0.45)';
    g.lineWidth = 10;
    rr(g, m, m, W - m * 2, H - m * 2, 8);
    g.stroke();
    g.restore();

    // Bottom chalk ledge + white & pastel chalk sticks
    const ledgeH = Math.max(12, Math.round(m * 0.42));
    g.fillStyle = '#4B2C16';
    g.fillRect(m + 24, H - m - ledgeH + 2, W - m * 2 - 48, ledgeH);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.fillRect(m + 24, H - m - ledgeH + 2, W - m * 2 - 48, 2);

    // Chalk sticks resting on the ledge
    g.fillStyle = '#F5F1E6';
    rr(g, W - m - 140, H - m - ledgeH - 7, 56, 9, 3);
    g.fill();
    g.fillStyle = '#FFE38A';
    rr(g, W - m - 74, H - m - ledgeH - 6, 38, 8, 3);
    g.fill();
    return true;
  }

  if (theme === 'glowsketch') {
    g.fillStyle = '#08080F';
    g.fillRect(0, 0, W, H);
    const neon = P.neon || bg;

    g.save();
    // Soft ambient neon bloom centered softly behind the lyrics
    const glow = g.createRadialGradient(
      W * 0.5,
      H * 0.52,
      20,
      W * 0.5,
      H * 0.52,
      Math.max(W, H) * 0.55
    );
    glow.addColorStop(0, rgba(neon, 0.22));
    glow.addColorStop(0.6, rgba(neon, 0.06));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = glow;
    g.fillRect(0, 0, W, H);

    // Multi-pass organic hand-drawn glowing neon sketch frame safely in the margin
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.shadowColor = neon;
    for (let i = 0; i < 3; i++) {
      g.shadowBlur = 18 - i * 4;
      g.strokeStyle = i === 2 ? mixHex(neon, '#ffffff', 0.65) : neon;
      g.globalAlpha = i === 2 ? 0.85 : 0.34;
      g.lineWidth = i === 2 ? 2.2 : 4.5 - i;
      const off = 22 + i * 3.5;
      rr(
        g,
        off + (i % 2 ? 2 : -1),
        off + (i % 2 ? -1 : 2),
        W - off * 2,
        H - off * 2,
        24
      );
      g.stroke();
    }

    // Small hand-drawn neon corner star doodle (top-right safe margin)
    const sx = W - 46;
    const sy = 46;
    g.globalAlpha = 0.85;
    g.shadowBlur = 14;
    g.strokeStyle = mixHex(neon, '#ffffff', 0.5);
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(sx - 12, sy);
    g.lineTo(sx + 12, sy);
    g.moveTo(sx, sy - 12);
    g.lineTo(sx, sy + 12);
    g.moveTo(sx - 7, sy - 7);
    g.lineTo(sx + 7, sy + 7);
    g.moveTo(sx + 7, sy - 7);
    g.lineTo(sx - 7, sy + 7);
    g.stroke();
    g.restore();
    return true;
  }

  if (theme === 'ps2') {
    // Authentic PlayStation 2 BIOS / 2000s console atmosphere
    const sky = g.createLinearGradient(0, 0, W * 0.25, H);
    sky.addColorStop(0, '#070D28');
    sky.addColorStop(0.45, mixHex('#0E1E54', bg, 0.22));
    sky.addColorStop(1, '#040614');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    // Ethereal PS2 startup blue/cyan fog aura
    const aura = g.createRadialGradient(
      W * 0.52,
      H * 0.48,
      10,
      W * 0.52,
      H * 0.48,
      Math.max(W, H) * 0.62
    );
    aura.addColorStop(0, rgba(mixHex(bg, '#33A1FF', 0.65), 0.34));
    aura.addColorStop(0.55, 'rgba(30,72,210,0.14)');
    aura.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = aura;
    g.fillRect(0, 0, W, H);

    // Floating translucent crystal memory-card towers rising in perspective
    g.save();
    const towers = [
      [0.09, 0.72, 0.065, 0.34],
      [0.21, 0.64, 0.055, 0.42],
      [0.37, 0.76, 0.05, 0.28],
      [0.64, 0.68, 0.06, 0.36],
      [0.79, 0.56, 0.07, 0.48],
      [0.9, 0.7, 0.055, 0.35],
    ];
    for (const [tx, ty, tw, th] of towers) {
      const bx = W * tx;
      const by = H * ty;
      const bw = W * tw;
      const bh = H * th;
      const colGrad = g.createLinearGradient(bx, by, bx, by + bh);
      colGrad.addColorStop(0, 'rgba(130,210,255,0.22)');
      colGrad.addColorStop(0.5, 'rgba(55,115,235,0.10)');
      colGrad.addColorStop(1, 'rgba(10,16,52,0)');
      g.fillStyle = colGrad;
      g.fillRect(bx, by, bw, bh);
      // Bright top bevel face of the crystal pillar
      g.fillStyle = 'rgba(200,238,255,0.28)';
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(bx + bw * 0.5, by - bw * 0.26);
      g.lineTo(bx + bw, by);
      g.lineTo(bx + bw * 0.5, by + bw * 0.26);
      g.closePath();
      g.fill();
    }

    // Soft orbital BIOS light nodes
    for (const [ox, oy, or] of [
      [0.84, 0.16, 18],
      [0.88, 0.22, 10],
      [0.14, 0.86, 14],
    ]) {
      const orb = g.createRadialGradient(
        W * ox,
        H * oy,
        0,
        W * ox,
        H * oy,
        or * 2.2
      );
      orb.addColorStop(0, 'rgba(220,246,255,0.85)');
      orb.addColorStop(0.4, 'rgba(90,190,255,0.35)');
      orb.addColorStop(1, 'rgba(90,190,255,0)');
      g.fillStyle = orb;
      g.fillRect(W * ox - or * 2.5, H * oy - or * 2.5, or * 5, or * 5);
    }

    // Crisp silver-blue console HUD border & corner brackets
    const c = 26;
    g.strokeStyle = 'rgba(170,224,255,0.26)';
    g.lineWidth = 2;
    g.strokeRect(c, c, W - c * 2, H - c * 2);

    g.strokeStyle = 'rgba(200,238,255,0.82)';
    g.lineWidth = 4;
    const L = 34;
    for (const [x, y, sx, sy] of [
      [c, c, 1, 1],
      [W - c, c, -1, 1],
      [c, H - c, 1, -1],
      [W - c, H - c, -1, -1],
    ] as const) {
      g.beginPath();
      g.moveTo(x, y + sy * L);
      g.lineTo(x, y);
      g.lineTo(x + sx * L, y);
      g.stroke();
    }
    g.restore();
    return true;
  }

  if (theme === 'comicart') {
    if (state.cardDepth === 0) {
      g.fillStyle = '#111111';
      g.fillRect(10, 12, W, H);
    }
    g.fillStyle = '#FFF6D6';
    g.fillRect(0, 0, W, H);

    g.save();
    g.beginPath();
    g.rect(0, 0, W, H);
    g.clip();

    // Edge-vignetted Ben-Day halftone dots (keep central reading area clean & crisp!)
    const dotCol = rgba(mixHex(bg, '#FF2D55', 0.35), 0.32);
    g.fillStyle = dotCol;
    const step = 22;
    const cx0 = W * 0.5;
    const cy0 = H * 0.5;
    const maxD = Math.hypot(cx0, cy0);
    for (let y = 12; y < H; y += step) {
      for (let x = ((y / step) % 2 ? step / 2 : 0) + 10; x < W; x += step) {
        const d = Math.hypot(x - cx0, y - cy0) / maxD;
        if (d < 0.56) continue;
        const r = Math.min(5.5, (d - 0.52) * 11);
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
      }
    }

    // Subtle diagonal comic speed-lines tucked strictly into the bottom-right corner
    g.strokeStyle = 'rgba(17,17,17,0.12)';
    g.lineWidth = 2.5;
    for (let i = 0; i < 8; i++) {
      g.beginPath();
      g.moveTo(W - 220 + i * 28, H + 10);
      g.lineTo(W + 10, H - 220 + i * 28);
      g.stroke();
    }

    // Crisp pop starburst tucked cleanly into the top-right corner margin
    g.fillStyle = '#FFE14A';
    g.strokeStyle = '#111111';
    g.lineWidth = 5;
    g.lineJoin = 'miter';
    g.beginPath();
    const sx = W - 46;
    const sy = 46;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const rad = i % 2 ? 15 : 32;
      g[i ? 'lineTo' : 'moveTo'](sx + Math.cos(a) * rad, sy + Math.sin(a) * rad);
    }
    g.closePath();
    g.fill();
    g.stroke();
    g.restore();

    // Thick comic ink gutter frame
    g.strokeStyle = '#111111';
    g.lineWidth = 12;
    g.strokeRect(6, 6, W - 12, H - 12);
    g.strokeStyle = '#111111';
    g.lineWidth = 2;
    g.strokeRect(20, 20, W - 40, H - 40);
    return true;
  }

  if (theme === 'flatvector') {
    // Clean Bauhaus / flat vector color-blocking confined to margins/corners so text contrast stays spotless
    const lightTint = mixHex(bg, '#ffffff', 0.22);
    const darkTint = mixHex(bg, '#000000', 0.16);
    const accent = mixHex(bg, '#000000', 0.34);

    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // Top-right bold quarter-circle block
    g.fillStyle = lightTint;
    g.beginPath();
    g.arc(W, 0, minSide * 0.34, 0, Math.PI * 2);
    g.fill();

    // Bottom-right stepped geometric arc
    g.fillStyle = darkTint;
    g.beginPath();
    g.arc(W * 0.96, H * 1.02, minSide * 0.44, 0, Math.PI * 2);
    g.fill();

    // Crisp left vertical Bauhaus stripe along the outer edge (clear of padding)
    const stripeW = Math.max(18, Math.round(W * 0.022));
    g.fillStyle = accent;
    g.fillRect(0, 0, stripeW, H * 0.42);
    g.fillStyle = lightTint;
    g.fillRect(0, H * 0.42, stripeW, H * 0.18);

    // Clean corner pill dot in bottom-right safe area
    g.fillStyle = luma(bg) > 150 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.28)';
    g.beginPath();
    g.arc(W - 44, H - 44, 14, 0, Math.PI * 2);
    g.fill();
    return true;
  }

  if (theme === 'dankoe') {
    // Quiet luxury dark-editorial aesthetic with exact header-to-lyric divider placement
    g.fillStyle = '#0E0E0F';
    g.fillRect(0, 0, W, H);

    // Subtle charcoal gradient depth
    const eg = g.createLinearGradient(0, 0, W, H);
    eg.addColorStop(0, 'rgba(255,255,255,0.03)');
    eg.addColorStop(0.5, 'rgba(0,0,0,0)');
    eg.addColorStop(1, 'rgba(0,0,0,0.22)');
    g.fillStyle = eg;
    g.fillRect(0, 0, W, H);

    // Sleek vertical accent spine on left edge
    g.fillStyle = bg;
    g.fillRect(0, 0, Math.max(8, Math.round(minSide * 0.01)), H);

    // Subtle editorial hairline border
    g.strokeStyle = 'rgba(242,239,232,0.10)';
    g.lineWidth = 1.5;
    g.strokeRect(24, 24, W - 48, H - 48);

    // Editorial divider cleanly positioned midway between header bottom and lyric top (never cuts cover!)
    const f = cardFrame(layout, theme, state.hide);
    const hasHeader = !(state.hide.cover && state.hide.title && state.hide.artist);
    if (hasHeader) {
      const ruleY = Math.round(f.ltop - layout.lyricGap * 0.5);
      g.fillStyle = 'rgba(242,239,232,0.26)';
      g.fillRect(f.lx, ruleY, f.x1 - f.lx, 1.5);
      g.fillStyle = bg;
      g.fillRect(f.lx, ruleY - 0.5, Math.min(84, (f.x1 - f.lx) * 0.16), 2.5);
    }
    return true;
  }

  if (theme === 'cgimotion') {
    // Sleek glossy dark-chrome CGI motion backdrop with centered specular streaks
    g.fillStyle = '#06080F';
    g.fillRect(0, 0, W, H);

    g.save();
    const streaks = 8;
    for (let i = 0; i < streaks; i++) {
      g.save();
      g.translate(W * 0.5, H * (0.12 + i * 0.11));
      g.rotate(-0.42);
      const span = Math.max(W, H) * 1.1;
      const grd = g.createLinearGradient(-span, 0, span, 0);
      const tint = mixHex(bg, i % 2 === 0 ? '#00E5FF' : '#FF4FD8', 0.45);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(0.32, rgba(tint, 0.16));
      grd.addColorStop(0.5, rgba(mixHex(tint, '#ffffff', 0.45), 0.48));
      grd.addColorStop(0.68, rgba(tint, 0.16));
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(-span, -6, span * 2, 7 + (i % 3) * 5);
      g.restore();
    }

    // Specular chrome top-left studio light highlight
    const spec = g.createRadialGradient(
      W * 0.22,
      H * 0.16,
      10,
      W * 0.22,
      H * 0.16,
      W * 0.55
    );
    spec.addColorStop(0, 'rgba(255,255,255,0.22)');
    spec.addColorStop(0.5, rgba(bg, 0.1));
    spec.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = spec;
    g.fillRect(0, 0, W, H);

    // Crisp metallic inner rim
    const rim = g.createLinearGradient(0, 0, W, H);
    rim.addColorStop(0, 'rgba(255,255,255,0.75)');
    rim.addColorStop(0.45, rgba(mixHex(bg, '#00E5FF', 0.4), 0.55));
    rim.addColorStop(1, 'rgba(255,255,255,0.22)');
    g.strokeStyle = rim;
    g.lineWidth = 2.5;
    rr(g, 16, 16, W - 32, H - 32, 18);
    g.stroke();
    g.restore();
    return true;
  }

  if (theme === 'lego') {
    // Authentic molded ABS Lego baseplate surface (subtle embossed stud grid — zero collision with text/cover!)
    const plastic = P.surface;
    const lip = mixHex(plastic, '#000000', 0.2);
    const hi = mixHex(plastic, '#ffffff', 0.34);
    const sh = mixHex(plastic, '#000000', 0.18);

    g.fillStyle = lip;
    g.fillRect(0, 0, W, H);

    const m = Math.round(minSide * 0.024);
    g.fillStyle = plastic;
    rr(g, m, m, W - m * 2, H - m * 2, 12);
    g.fill();

    // Subtle full-plate embossed stud pattern across the molded plastic face
    g.save();
    rr(g, m, m, W - m * 2, H - m * 2, 12);
    g.clip();
    const step = Math.max(76, Math.round(minSide / 10));
    const sr = Math.round(step * 0.27);
    const offsetX = ((W - m * 2) % step) / 2 + m + step / 2;
    const offsetY = ((H - m * 2) % step) / 2 + m + step / 2;

    for (let y = offsetY; y < H - m; y += step) {
      for (let x = offsetX; x < W - m; x += step) {
        // Soft bottom-right stud shadow
        g.fillStyle = rgba(sh, 0.32);
        g.beginPath();
        g.arc(x + 4, y + 5, sr, 0, Math.PI * 2);
        g.fill();

        // Main molded stud cylinder
        g.fillStyle = mixHex(plastic, '#ffffff', 0.05);
        g.beginPath();
        g.arc(x, y, sr, 0, Math.PI * 2);
        g.fill();

        // Subtle glossy top-left specular crescent
        g.strokeStyle = rgba(hi, 0.45);
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(x, y, sr - 1.5, Math.PI * 0.9, Math.PI * 1.75);
        g.stroke();
      }
    }

    // Soft ABS plastic sheen gradient
    const gloss = g.createLinearGradient(0, 0, 0, H * 0.45);
    gloss.addColorStop(0, 'rgba(255,255,255,0.16)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gloss;
    g.fillRect(m, m, W - m * 2, H - m * 2);
    g.restore();

    // Crisp molded brick bevel edge
    g.strokeStyle = rgba(hi, 0.45);
    g.lineWidth = 3;
    rr(g, m + 1.5, m + 1.5, W - m * 2 - 3, H - m * 2 - 3, 10);
    g.stroke();
    return true;
  }

  if (theme === 'zackd') {
    // Cinematic documentary frame: deep matte slate + clean top/bottom letterbox bars
    g.fillStyle = '#0A0B0D';
    g.fillRect(0, 0, W, H);

    const bar = Math.round(minSide * 0.055);

    // Subtle filmic spotlight behind the lyrics
    const spot = g.createRadialGradient(
      W * 0.5,
      H * 0.48,
      20,
      W * 0.5,
      H * 0.48,
      Math.max(W, H) * 0.65
    );
    spot.addColorStop(0, rgba(mixHex(bg, '#ffffff', 0.1), 0.14));
    spot.addColorStop(1, 'rgba(0,0,0,0.45)');
    g.fillStyle = spot;
    g.fillRect(0, bar, W, H - bar * 2);

    // Top & bottom cinema letterbox bars
    g.fillStyle = '#000000';
    g.fillRect(0, 0, W, bar);
    g.fillRect(0, H - bar, W, bar);

    // Thin yellow documentary accent line sitting cleanly on top of the bottom letterbox bar
    g.fillStyle = '#FFE14A';
    g.fillRect(0, H - bar - 4, W, 4);

    // REC dot + subtle monospace timecode cleanly centered INSIDE the top letterbox bar (never touches cover!)
    const midTop = Math.round(bar / 2);
    g.fillStyle = '#FF3333';
    g.beginPath();
    g.arc(layout.pad + 8, midTop, 6, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = 'rgba(255,255,255,0.72)';
    g.font = `600 ${Math.max(14, Math.round(bar * 0.34))}px 'Courier New', monospace`;
    g.textBaseline = 'middle';
    g.textAlign = 'left';
    g.fillText('REC', layout.pad + 22, midTop + 1);
    g.textAlign = 'right';
    g.fillStyle = 'rgba(255,225,74,0.85)';
    g.fillText('24FPS · 16:9', W - layout.pad, midTop + 1);
    g.textAlign = 'left';
    g.textBaseline = 'alphabetic';
    return true;
  }

  return false;
}

export function overlaySignature(
  g: CanvasRenderingContext2D,
  theme: ThemeKey,
  layout: LayoutConfig
) {
  if (theme !== 'ps2' && theme !== 'zackd' && theme !== 'chalkboard' && theme !== 'dankoe') {
    return;
  }
  const { w: W, h: H } = layout;
  g.save();
  if (theme === 'ps2') {
    // Subtle CRT scanlines
    g.fillStyle = 'rgba(0,0,0,0.16)';
    for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
  } else if (theme === 'zackd') {
    // Subtle vertical celluloid micro-scratches & edge vignette
    g.globalAlpha = 0.14;
    for (let i = 0; i < 14; i++) {
      const x = (i * 173 + 41) % W;
      g.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)';
      g.fillRect(x, 0, 1, H);
    }
  } else if (theme === 'chalkboard') {
    // Delicate chalk-dust veil instead of darkening wash
    const dust = g.createRadialGradient(
      W * 0.5,
      H * 0.5,
      Math.min(W, H) * 0.25,
      W * 0.5,
      H * 0.5,
      Math.max(W, H) * 0.72
    );
    dust.addColorStop(0, 'rgba(245,241,230,0.03)');
    dust.addColorStop(1, 'rgba(0,0,0,0.18)');
    g.fillStyle = dust;
    g.fillRect(0, 0, W, H);
  } else if (theme === 'dankoe') {
    // Fine luxury editorial micro-grain
    g.fillStyle = 'rgba(255,255,255,0.025)';
    for (let i = 0; i < 180; i++) {
      g.fillRect((i * 197) % W, (i * 113) % H, 1.5, 1.5);
    }
  }
  g.restore();
}
