import type { CardState, LayoutConfig, ThemeKey } from '../types';
import { FONT } from './constants';
import { luma, mixHex, rgba } from '../utils/colorUtils';
import type { CardPalette } from './signatureThemes';
import { cardFrame, roundedRect } from './geometry';

export const COLLECTOR_THEMES = [
  'cdcase',
  'minidisc',
  'floppy',
  'plaque',
  'vhs',
  'stamp',
  'filmstrip',
  'vippass',
  'boarding',
  'matchbook',
  'manga',
  'risograph',
  'waxseal',
  'blueprint',
  'tarot',
  'ipod',
  'terminal',
  'aqua',
  'frutiger',
  'swiss',
] as const satisfies readonly ThemeKey[];

const COLLECTOR = new Set<string>(COLLECTOR_THEMES);

export function isCollectorTheme(theme: ThemeKey): boolean {
  return COLLECTOR.has(theme);
}

type Pass = { dx: number; dy: number; color: string; main: boolean };
const pass = (color: string, dx = 0, dy = 0, main = true): Pass => ({
  dx,
  dy,
  color,
  main,
});

function cardDrop(
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

export function applyCollectorPalette(
  theme: ThemeKey,
  P: CardPalette,
  bg: string
): boolean {
  if (!isCollectorTheme(theme)) return false;

  switch (theme) {
    case 'cdcase': {
      P.surface = mixHex(bg, '#141720', 0.58);
      P.text = '#FFFFFF';
      P.wall = '#D8E2EE';
      P.passes = [pass('rgba(0,0,0,0.35)', 0, 2, false), pass('#FFFFFF')];
      break;
    }
    case 'minidisc': {
      P.surface = mixHex(bg, '#12151E', 0.72);
      P.text = '#F2F6FF';
      P.glow = mixHex(bg, '#63E6FF', 0.45);
      P.wall = '#1C202B';
      P.passes = [pass('#F2F6FF')];
      break;
    }
    case 'floppy': {
      // Classic 3.5" diskette: cream paper label inside colored plastic shell
      P.surface = '#F7F4EA';
      P.text = '#1A1C24';
      P.wall = mixHex(bg, '#1C2230', 0.45);
      P.passes = [pass('#1A1C24')];
      break;
    }
    case 'plaque': {
      P.surface = '#0E0E12';
      P.text = '#F7E5B4';
      P.glow = '#D4AF37';
      P.wall = '#1B1813';
      P.passes = [pass('rgba(0,0,0,0.65)', 0, 3, false), pass('#F7E5B4')];
      break;
    }
    case 'vhs': {
      P.surface = '#141216';
      P.text = '#FAF5E8';
      P.wall = '#0F0D10';
      P.passes = [pass('#FAF5E8')];
      break;
    }
    case 'stamp': {
      P.surface = '#F8F2E2';
      P.text = mixHex(bg, '#1C1814', 0.65);
      P.wall = '#E8DFC8';
      P.passes = [pass(P.text)];
      break;
    }
    case 'filmstrip': {
      P.surface = mixHex(bg, '#120E0B', 0.82);
      P.text = '#FFF6E8';
      P.glow = '#FF9E2C';
      P.wall = '#0A0908';
      P.passes = [pass('#FFF6E8')];
      break;
    }
    case 'vippass': {
      P.surface = '#101218';
      P.text = '#FFFFFF';
      P.neon = bg;
      P.wall = '#1E222E';
      P.passes = [pass('#FFFFFF')];
      break;
    }
    case 'boarding': {
      P.surface = '#F9F8F3';
      P.text = '#141A26';
      P.wall = '#E5E2D7';
      P.passes = [pass('#141A26')];
      break;
    }
    case 'matchbook': {
      const darkCover = mixHex(bg, '#1D1410', 0.42);
      P.surface = darkCover;
      P.text = luma(darkCover) > 148 ? '#1B140E' : '#FAF0DC';
      P.wall = mixHex(darkCover, '#000000', 0.35);
      P.passes = [pass(P.text)];
      break;
    }
    case 'manga': {
      P.surface = '#FAF8F2';
      P.text = '#111111';
      P.wall = '#111111';
      P.passes = [pass('#FFFFFF', -2, -2, false), pass('#111111')];
      break;
    }
    case 'risograph': {
      P.surface = '#F7F1E3';
      const primaryInk = mixHex(bg, '#12131A', 0.55);
      const misregInk = rgba(mixHex(bg, '#FF2A6D', 0.65), 0.38);
      P.text = primaryInk;
      P.wall = '#E5DEC9';
      // Misregistered two-drum Riso soy-ink overprint pass
      P.passes = [pass(misregInk, 5, 3, false), pass(primaryInk)];
      break;
    }
    case 'waxseal': {
      P.surface = '#FAF5E8';
      P.text = '#241D18';
      P.wall = '#E6DEC8';
      P.passes = [pass('#241D18')];
      break;
    }
    case 'blueprint': {
      P.surface = mixHex('#0B356E', bg, 0.18);
      P.text = '#F0F7FF';
      P.wall = '#07244D';
      P.passes = [pass('#F0F7FF')];
      break;
    }
    case 'tarot': {
      P.surface = mixHex('#0E0B1A', bg, 0.2);
      P.text = '#F6E6C2';
      P.glow = '#D4AF37';
      P.wall = '#1A142B';
      P.passes = [pass('#F6E6C2')];
      break;
    }
    case 'ipod': {
      P.surface = '#F4F7FA';
      P.text = '#141A22';
      P.wall = '#D0D5DC';
      P.passes = [pass('#141A22')];
      break;
    }
    case 'terminal': {
      const phosphor =
        luma(bg) < 85 ? mixHex(bg, '#39FF88', 0.65) : mixHex(bg, '#55FF99', 0.35);
      P.surface = '#050A07';
      P.text = phosphor;
      P.neon = phosphor;
      P.glow = phosphor;
      P.wall = '#0A140E';
      P.passes = [pass(phosphor)];
      break;
    }
    case 'aqua': {
      P.surface = '#F7F9FC';
      P.text = '#151B26';
      P.wall = '#CFD7E3';
      P.passes = [pass('#151B26')];
      break;
    }
    case 'frutiger': {
      P.surface = mixHex(bg, '#0B558A', 0.45);
      P.text = '#FFFFFF';
      P.wall = mixHex(bg, '#38BDF8', 0.5);
      P.passes = [pass('rgba(0,40,80,0.35)', 0, 2, false), pass('#FFFFFF')];
      break;
    }
    case 'swiss': {
      P.surface = '#F3EFE6';
      P.text = '#111111';
      P.wall = '#111111';
      P.passes = [pass('#111111')];
      break;
    }
    default:
      return false;
  }
  return true;
}

export function paintCollectorBody(
  g: CanvasRenderingContext2D,
  state: CardState,
  layout: LayoutConfig,
  P: CardPalette,
  unit = 1
): boolean {
  if (!isCollectorTheme(state.theme)) return false;
  const { w: W, h: H } = layout;
  const bg = state.color;
  const theme = state.theme;
  const minSide = Math.min(W, H);

  switch (theme) {
    case 'cdcase': {
      // Clear acrylic CD jewel case with dark ribbed left spine & booklet insert
      const spineW = Math.max(52, Math.round(W * 0.068));

      // Clear plastic case base
      g.fillStyle = '#E2EAF2';
      roundedRect(g, 0, 0, W, H, 10);
      g.fill();

      // Booklet insert background inside right compartment
      const insGrad = g.createLinearGradient(spineW, 0, W, H);
      insGrad.addColorStop(0, mixHex(bg, '#252B3B', 0.35));
      insGrad.addColorStop(0.55, P.surface);
      insGrad.addColorStop(1, mixHex(bg, '#07090F', 0.78));
      g.fillStyle = insGrad;
      g.fillRect(spineW, 8, W - spineW - 8, H - 16);

      // Subtle iridescent CD arc watermark inside the booklet
      g.save();
      g.beginPath();
      g.rect(spineW, 8, W - spineW - 8, H - 16);
      g.clip();
      const cdX = W * 0.86;
      const cdY = H * 0.5;
      const cdR = minSide * 0.42;
      const cdGrad = g.createRadialGradient(cdX, cdY, cdR * 0.2, cdX, cdY, cdR);
      cdGrad.addColorStop(0, 'rgba(255,255,255,0.04)');
      cdGrad.addColorStop(0.5, rgba(mixHex(bg, '#00F0FF', 0.5), 0.14));
      cdGrad.addColorStop(0.8, rgba(mixHex(bg, '#FF4FD8', 0.5), 0.12));
      cdGrad.addColorStop(1, 'rgba(255,255,255,0.22)');
      g.fillStyle = cdGrad;
      g.beginPath();
      g.arc(cdX, cdY, cdR, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // Dark ribbed jewel-case plastic hinge spine on the left
      g.fillStyle = '#181A20';
      g.fillRect(0, 0, spineW, H);
      for (let x = 8; x < spineW - 6; x += 5) {
        g.fillStyle = 'rgba(255,255,255,0.12)';
        g.fillRect(x, 12, 1.5, H - 24);
        g.fillStyle = 'rgba(0,0,0,0.45)';
        g.fillRect(x + 1.5, 12, 2, H - 24);
      }

      // Vertical spine label text
      g.save();
      g.translate(spineW / 2, H / 2);
      g.rotate(-Math.PI / 2);
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.font = `700 13px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('COMPACT DISC · DIGITAL AUDIO', 0, 0);
      g.restore();

      // Acrylic lid stopper tabs & diagonal plastic gloss reflection
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.fillRect(W * 0.35, 4, 48, 6);
      g.fillRect(W * 0.72, 4, 48, 6);
      g.fillRect(W * 0.35, H - 10, 48, 6);
      g.fillRect(W * 0.72, H - 10, 48, 6);

      const acrylic = g.createLinearGradient(spineW, 0, W, H);
      acrylic.addColorStop(0, 'rgba(255,255,255,0.28)');
      acrylic.addColorStop(0.24, 'rgba(255,255,255,0.04)');
      acrylic.addColorStop(0.5, 'rgba(255,255,255,0)');
      acrylic.addColorStop(0.53, 'rgba(255,255,255,0.16)');
      acrylic.addColorStop(1, 'rgba(255,255,255,0.04)');
      g.fillStyle = acrylic;
      g.fillRect(spineW, 0, W - spineW, H);

      g.strokeStyle = 'rgba(255,255,255,0.65)';
      g.lineWidth = 3;
      roundedRect(g, 1.5, 1.5, W - 3, H - 3, 9);
      g.stroke();
      return true;
    }

    case 'minidisc': {
      // Translucent smoked 90s Sony MiniDisc cartridge with brushed metal shutter
      const shell = g.createLinearGradient(0, 0, W, H);
      shell.addColorStop(0, mixHex(bg, '#1D2230', 0.65));
      shell.addColorStop(0.6, P.surface);
      shell.addColorStop(1, '#0B0D14');
      g.fillStyle = shell;
      roundedRect(g, 0, 0, W, H, 20);
      g.fill();

      // Internal optical disc ring visible through the smoked plastic shell
      g.save();
      roundedRect(g, 0, 0, W, H, 20);
      g.clip();
      const dx = W * 0.52;
      const dy = H * 0.54;
      const dr = minSide * 0.42;
      const disc = g.createRadialGradient(dx, dy, dr * 0.18, dx, dy, dr);
      disc.addColorStop(0, 'rgba(255,255,255,0.12)');
      disc.addColorStop(0.5, rgba(mixHex(bg, '#00E5FF', 0.5), 0.16));
      disc.addColorStop(0.85, rgba(mixHex(bg, '#FF4FD8', 0.45), 0.12));
      disc.addColorStop(1, 'rgba(255,255,255,0.06)');
      g.fillStyle = disc;
      g.beginPath();
      g.arc(dx, dy, dr, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.14)';
      g.lineWidth = 2;
      g.stroke();

      // Brushed metal sliding shutter plate along top-right
      const sw = Math.round(W * 0.36);
      const sh = 46;
      const sx = W - sw - 38;
      const metal = g.createLinearGradient(sx, 0, sx + sw, sh);
      metal.addColorStop(0, '#CFD6E0');
      metal.addColorStop(0.45, '#F5F8FC');
      metal.addColorStop(0.7, '#9AA3B2');
      metal.addColorStop(1, '#D5DCE6');
      g.fillStyle = metal;
      roundedRect(g, sx, 0, sw, sh, 6);
      g.fill();

      g.fillStyle = '#1C222E';
      g.font = `700 13px ${FONT}`;
      g.textBaseline = 'middle';
      g.fillText('MD · 74 MIN · DIGITAL AUDIO', sx + 18, sh / 2);

      // Left insertion direction arrow
      g.fillStyle = rgba(bg, 0.85);
      g.beginPath();
      g.moveTo(36, 20);
      g.lineTo(48, 34);
      g.lineTo(24, 34);
      g.closePath();
      g.fill();
      g.restore();

      g.strokeStyle = 'rgba(255,255,255,0.24)';
      g.lineWidth = 3;
      roundedRect(g, 2, 2, W - 4, H - 4, 18);
      g.stroke();
      return true;
    }

    case 'floppy': {
      // 3.5" Floppy Diskette with chamfered top-right corner, metal shutter & paper label
      const cut = Math.round(minSide * 0.09);
      const diskPath = (c: CanvasRenderingContext2D) => {
        c.beginPath();
        c.moveTo(12, 0);
        c.lineTo(W - cut, 0);
        c.lineTo(W, cut);
        c.lineTo(W, H - 12);
        c.arcTo(W, H, W - 12, H, 12);
        c.lineTo(12, H);
        c.arcTo(0, H, 0, H - 12, 12);
        c.lineTo(0, 12);
        c.arcTo(0, 0, 12, 0, 12);
        c.closePath();
      };

      const shellColor = mixHex(bg, '#1D2330', 0.38);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.4)';
      g.shadowBlur = 24 * unit;
      g.shadowOffsetY = 12 * unit;
      g.fillStyle = shellColor;
      diskPath(g);
      g.fill();
      g.restore();

      g.save();
      diskPath(g);
      g.clip();

      // Top brushed-aluminum sliding shutter
      const shX = Math.round(W * 0.24);
      const shW = Math.round(W * 0.52);
      const shH = 56;
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.fillRect(shX - 8, 0, shW + 16, shH + 6);
      const metal = g.createLinearGradient(shX, 0, shX + shW, 0);
      metal.addColorStop(0, '#C5CCD6');
      metal.addColorStop(0.35, '#F2F5FA');
      metal.addColorStop(0.7, '#9DA6B4');
      metal.addColorStop(1, '#D8DFE8');
      g.fillStyle = metal;
      g.fillRect(shX, 0, shW, shH);
      // Shutter read window cutout
      g.fillStyle = shellColor;
      g.fillRect(shX + shW * 0.62, 10, shW * 0.22, shH - 18);

      // Cream stick-on paper label area where cover, header, lyrics & footer sit
      const m = 34;
      const topY = shH + 14;
      g.fillStyle = P.surface;
      roundedRect(g, m, topY, W - m * 2, H - topY - m, 10);
      g.fill();

      // Colored label top stripe
      g.fillStyle = bg;
      g.fillRect(m, topY, W - m * 2, 14);

      // Subtle ruled label lines
      g.strokeStyle = 'rgba(20,24,36,0.07)';
      g.lineWidth = 2;
      for (let y = topY + 68; y < H - m - 24; y += 52) {
        g.beginPath();
        g.moveTo(m + 20, y);
        g.lineTo(W - m - 20, y);
        g.stroke();
      }

      // HD write-protect corner square notches
      g.fillStyle = '#0F1218';
      g.fillRect(12, H - 28, 14, 14);
      g.fillRect(W - 26, H - 28, 14, 14);
      g.restore();
      return true;
    }

    case 'plaque': {
      // RIAA Gold / Platinum Award Frame
      const frameW = 24;
      // Satin obsidian wood frame
      g.fillStyle = '#141316';
      roundedRect(g, 0, 0, W, H, 18);
      g.fill();

      // Brushed gold inner bevel fillet
      const gold = g.createLinearGradient(0, 0, W, H);
      gold.addColorStop(0, '#FFF1B8');
      gold.addColorStop(0.3, '#D4AF37');
      gold.addColorStop(0.55, '#8F6B14');
      gold.addColorStop(0.8, '#F5D77F');
      gold.addColorStop(1, '#B38728');
      g.fillStyle = gold;
      roundedRect(g, frameW - 5, frameW - 5, W - (frameW - 5) * 2, H - (frameW - 5) * 2, 10);
      g.fill();

      // Deep velvet charcoal mat board
      const mat = g.createRadialGradient(W * 0.5, H * 0.4, 20, W * 0.5, H * 0.4, Math.max(W, H) * 0.7);
      mat.addColorStop(0, mixHex(bg, '#1C1B22', 0.82));
      mat.addColorStop(1, '#09090C');
      g.fillStyle = mat;
      roundedRect(g, frameW, frameW, W - frameW * 2, H - frameW * 2, 8);
      g.fill();

      // Subtle metallic gold vinyl watermark disc gleaming on the mat board
      g.save();
      roundedRect(g, frameW, frameW, W - frameW * 2, H - frameW * 2, 8);
      g.clip();
      const gx = W * 0.82;
      const gy = H * 0.24;
      const gr = minSide * 0.34;
      const disc = g.createRadialGradient(gx, gy, gr * 0.15, gx, gy, gr);
      disc.addColorStop(0, rgba(bg, 0.28));
      disc.addColorStop(0.32, 'rgba(212,175,55,0.22)');
      disc.addColorStop(0.75, 'rgba(255,241,184,0.14)');
      disc.addColorStop(1, 'rgba(212,175,55,0.25)');
      g.fillStyle = disc;
      g.beginPath();
      g.arc(gx, gy, gr, 0, Math.PI * 2);
      g.fill();

      // Engraved gold certification header micro-plate
      g.strokeStyle = 'rgba(212,175,55,0.45)';
      g.lineWidth = 1.5;
      g.strokeRect(frameW + 18, frameW + 18, W - (frameW + 18) * 2, H - (frameW + 18) * 2);
      g.restore();
      return true;
    }

    case 'vhs': {
      // 1980s Cardboard VHS Slipcase with iconic retro tri-color stripes
      g.fillStyle = '#141216';
      roundedRect(g, 0, 0, W, H, 8);
      g.fill();

      g.save();
      roundedRect(g, 0, 0, W, H, 8);
      g.clip();

      // Iconic retro tri-color horizontal/angled VHS band along the top & right margin
      const stripes = [
        mixHex(bg, '#FF2A54', 0.55),
        '#FF7B1C',
        '#FFD438',
        bg,
      ];
      const bandTop = 18;
      stripes.forEach((col, i) => {
        g.fillStyle = col;
        g.fillRect(0, bandTop + i * 9, W, 8);
      });

      // Vertical retro colour ribbon along right edge
      stripes.forEach((col, i) => {
        g.fillStyle = col;
        g.fillRect(W - 36 + i * 7, 0, 6, H);
      });

      // VHS HI-FI STEREO badge in top-right below top stripes
      g.fillStyle = '#FAF5E8';
      g.strokeStyle = '#FAF5E8';
      g.lineWidth = 2;
      roundedRect(g, W - 168, 66, 114, 26, 4);
      g.stroke();
      g.font = `700 13px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('VHS · HI-FI', W - 111, 79);
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';

      // Worn cardboard sleeve edge scuff highlight
      g.strokeStyle = 'rgba(255,250,235,0.18)';
      g.lineWidth = 4;
      roundedRect(g, 2, 2, W - 4, H - 4, 8);
      g.stroke();
      g.restore();
      return true;
    }

    case 'stamp': {
      // Scalloped perforated Postage Stamp with engraved intaglio frame & postmark
      const step = 36;
      const pr = 9;
      const stampPath = (c: CanvasRenderingContext2D) => {
        c.beginPath();
        c.moveTo(0, 0);
        for (let x = step / 2; x < W; x += step) {
          c.lineTo(x - pr, 0);
          c.arc(x, 0, pr, Math.PI, 0, true);
        }
        c.lineTo(W, 0);
        for (let y = step / 2; y < H; y += step) {
          c.lineTo(W, y - pr);
          c.arc(W, y, pr, -Math.PI / 2, Math.PI / 2, true);
        }
        c.lineTo(W, H);
        for (let x = W - step / 2; x > 0; x -= step) {
          c.lineTo(x + pr, H);
          c.arc(x, H, pr, 0, Math.PI, true);
        }
        c.lineTo(0, H);
        for (let y = H - step / 2; y > 0; y -= step) {
          c.lineTo(0, y + pr);
          c.arc(0, y, pr, Math.PI / 2, -Math.PI / 2, true);
        }
        c.closePath();
      };

      g.save();
      g.shadowColor = 'rgba(0,0,0,0.38)';
      g.shadowBlur = 24 * unit;
      g.shadowOffsetY = 12 * unit;
      g.fillStyle = P.surface;
      stampPath(g);
      g.fill();
      g.restore();

      g.save();
      stampPath(g);
      g.clip();

      // Engraved inner tint frame
      const m = 34;
      g.fillStyle = rgba(bg, 0.14);
      g.fillRect(m, m, W - m * 2, H - m * 2);
      g.strokeStyle = mixHex(bg, '#1C1814', 0.45);
      g.lineWidth = 4;
      g.strokeRect(m, m, W - m * 2, H - m * 2);
      g.lineWidth = 1.5;
      g.strokeRect(m + 8, m + 8, W - (m + 8) * 2, H - (m + 8) * 2);

      // Postage denomination in top-right safe corner
      g.fillStyle = P.text;
      g.font = `700 26px 'Playfair Display', Georgia, serif`;
      g.textAlign = 'right';
      g.textBaseline = 'top';
      g.fillText('78¢ · AIR MAIL', W - m - 20, m + 16);
      g.textAlign = 'left';

      // Wavy circular postmark cancellation stamp in bottom-right corner
      g.save();
      g.translate(W - 140, H - 110);
      g.rotate(-0.14);
      g.strokeStyle = 'rgba(28,24,20,0.28)';
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(0, 0, 42, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.arc(0, 0, 32, 0, Math.PI * 2);
      g.stroke();
      for (let i = -2; i <= 2; i++) {
        g.beginPath();
        g.moveTo(46, i * 11);
        g.bezierCurveTo(68, i * 11 - 7, 90, i * 11 + 7, 114, i * 11);
        g.stroke();
      }
      g.restore();
      g.restore();
      return true;
    }

    case 'filmstrip': {
      // 35mm Cinema Film Strip with sprocket holes along left & right edges
      const railW = Math.max(54, Math.round(W * 0.068));
      const frameGrad = g.createRadialGradient(
        W * 0.5,
        H * 0.48,
        20,
        W * 0.5,
        H * 0.48,
        Math.max(W, H) * 0.65
      );
      frameGrad.addColorStop(0, mixHex(bg, '#281A12', 0.62));
      frameGrad.addColorStop(1, P.surface);
      g.fillStyle = frameGrad;
      roundedRect(g, 0, 0, W, H, 6);
      g.fill();

      // Left & right matte-black 35mm film rebate rails
      g.fillStyle = '#0A0908';
      g.fillRect(0, 0, railW, H);
      g.fillRect(W - railW, 0, railW, H);

      // Punch sprocket holes (transparent / dark rim) along both rails
      const holeStep = 64;
      const holeW = Math.round(railW * 0.46);
      const holeH = 34;
      const holeXLeft = Math.round((railW - holeW) / 2);
      const holeXRight = W - railW + holeXLeft;

      for (let y = 26; y + holeH < H - 16; y += holeStep) {
        g.fillStyle = '#1E1B18';
        roundedRect(g, holeXLeft, y, holeW, holeH, 5);
        g.fill();
        roundedRect(g, holeXRight, y, holeW, holeH, 5);
        g.fill();
      }

      // Warm Kodak amber frame numbers along inner rail edge
      g.save();
      g.fillStyle = '#FFA336';
      g.font = `700 13px 'Courier New', monospace`;
      g.translate(railW - 6, H * 0.25);
      g.rotate(-Math.PI / 2);
      g.fillText('KODAK 5219 · 36A', 0, 0);
      g.restore();

      g.save();
      g.fillStyle = '#FFA336';
      g.font = `700 13px 'Courier New', monospace`;
      g.translate(W - railW + 14, H * 0.72);
      g.rotate(Math.PI / 2);
      g.fillText('► 36A   ► 37', 0, 0);
      g.restore();

      // Warm halation frame border line
      g.strokeStyle = 'rgba(255,163,54,0.35)';
      g.lineWidth = 2;
      g.strokeRect(railW + 4, 14, W - (railW + 4) * 2, H - 28);
      return true;
    }

    case 'vippass': {
      // Backstage Laminated VIP Tour Pass with lanyard slot & holographic strip
      g.fillStyle = P.surface;
      roundedRect(g, 0, 0, W, H, 28);
      g.fill();

      g.save();
      roundedRect(g, 0, 0, W, H, 28);
      g.clip();

      // Top colored VIP header band
      const bandH = 68;
      g.fillStyle = bg;
      g.fillRect(0, 0, W, bandH);

      // Lanyard slot hole rim at top center
      const slotW = 116;
      const slotH = 20;
      const slotX = (W - slotW) / 2;
      const slotY = 18;
      g.fillStyle = '#07080C';
      roundedRect(g, slotX, slotY, slotW, slotH, 10);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.5)';
      g.lineWidth = 2;
      g.stroke();

      // VIP ALL ACCESS text in top band corners
      g.fillStyle = luma(bg) > 150 ? '#111111' : '#FFFFFF';
      g.font = `700 16px ${FONT}`;
      g.textBaseline = 'middle';
      g.fillText('VIP · TOUR', 32, bandH / 2 + 4);
      g.textAlign = 'right';
      g.fillText('ALL ACCESS', W - 32, bandH / 2 + 4);
      g.textAlign = 'left';

      // Holographic security foil stripe along right edge
      const holo = g.createLinearGradient(0, bandH, 0, H);
      ['#FF4FD8', '#4FE3FF', '#FFF36B', '#6BFF9E', '#A855F7'].forEach(
        (c, i, arr) => holo.addColorStop(i / (arr.length - 1), c)
      );
      g.fillStyle = holo;
      g.globalAlpha = 0.72;
      g.fillRect(W - 18, bandH, 10, H - bandH);
      g.globalAlpha = 1;
      g.restore();

      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 3;
      roundedRect(g, 1.5, 1.5, W - 3, H - 3, 27);
      g.stroke();
      return true;
    }

    case 'boarding': {
      // Airline Boarding Pass with carrier header & telemetry
      cardDrop(g, W, H, 22, P.surface, 28, 14, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, 22);
      g.clip();

      // Top airline carrier band
      const topH = 54;
      g.fillStyle = bg;
      g.fillRect(0, 0, W, topH);

      g.fillStyle = luma(bg) > 150 ? '#111111' : '#FFFFFF';
      g.font = `700 16px 'Courier New', monospace`;
      g.textBaseline = 'middle';
      g.fillText('✈ LYRIC AIRWAYS · BOARDING PASS', 34, topH / 2);
      g.textAlign = 'right';
      g.fillText('PRIORITY · ZONE 1', W - 34, topH / 2);
      g.textAlign = 'left';

      // Subtle dashed boarding stub divider near bottom
      const divY = H - 56;
      g.strokeStyle = 'rgba(20,26,38,0.25)';
      g.lineWidth = 2.5;
      g.setLineDash([8, 8]);
      g.beginPath();
      g.moveTo(24, divY);
      g.lineTo(W - 24, divY);
      g.stroke();
      g.setLineDash([]);

      g.fillStyle = 'rgba(20,26,38,0.55)';
      g.font = `700 13px 'Courier New', monospace`;
      g.fillText('GATE A12   ·   SEAT 01A   ·   SEQ 0042', 34, H - 28);
      g.restore();
      return true;
    }

    case 'matchbook': {
      // Vintage Hotel Matchbook Cover with ornate border & bottom sandpaper striker strip
      cardDrop(g, W, H, 16, P.surface, 28, 14, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, 16);
      g.clip();

      // Ornate vintage apothecary double gold/cream frame
      const ink = P.text;
      g.strokeStyle = rgba(ink, 0.45);
      g.lineWidth = 3;
      roundedRect(g, 22, 22, W - 44, H - 84, 8);
      g.stroke();
      g.lineWidth = 1.2;
      roundedRect(g, 29, 29, W - 58, H - 98, 5);
      g.stroke();

      // Bottom friction striker strip (dark brown sandpaper texture)
      const stH = 44;
      const stY = H - stH;
      g.fillStyle = '#382218';
      g.fillRect(0, stY, W, stH);
      g.fillStyle = 'rgba(255,220,180,0.16)';
      for (let i = 0; i < 220; i++) {
        g.fillRect((i * 97) % W, stY + ((i * 31) % stH), 2, 2);
      }
      g.fillStyle = '#D4AF37';
      g.fillRect(0, stY - 3, W, 3);

      g.fillStyle = 'rgba(250,240,220,0.75)';
      g.font = `700 12px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('CLOSE COVER BEFORE STRIKING', W / 2, stY + stH / 2);
      g.textAlign = 'left';
      g.restore();
      return true;
    }

    case 'manga': {
      // Japanese Manga Page with screentone dots, radiating speed-lines & inked panel frame
      if (state.cardDepth === 0) {
        g.fillStyle = '#111111';
        g.fillRect(10, 10, W, H);
      }
      g.fillStyle = P.surface;
      g.fillRect(0, 0, W, H);

      g.save();
      g.beginPath();
      g.rect(14, 14, W - 28, H - 28);
      g.clip();

      // Corner manga screentone halftone gradient
      g.fillStyle = 'rgba(17,17,17,0.14)';
      const step = 14;
      for (let y = 14; y < H - 14; y += step) {
        for (let x = 14; x < W - 14; x += step) {
          const distCorner = Math.min(
            Math.hypot(x, y),
            Math.hypot(W - x, H - y)
          );
          if (distCorner > minSide * 0.42) continue;
          const r = (1 - distCorner / (minSide * 0.42)) * 3.5;
          g.beginPath();
          g.arc(x, y, r, 0, Math.PI * 2);
          g.fill();
        }
      }

      // Dramatic manga focus speed-lines around outer perimeter
      const cx = W * 0.5;
      const cy = H * 0.5;
      const outerR = Math.hypot(W, H) * 0.7;
      const innerR = minSide * 0.43;
      g.strokeStyle = 'rgba(17,17,17,0.22)';
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const r0 = innerR + ((i * 19) % 36);
        g.lineWidth = i % 3 === 0 ? 2.4 : 1.1;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        g.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
        g.stroke();
      }

      // Vertical manga sound-effect / volume tag in top-right safe margin
      g.fillStyle = '#111111';
      g.fillRect(W - 58, 26, 32, 92);
      g.fillStyle = '#FAF8F2';
      g.font = `700 18px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillText('音', W - 42, 36);
      g.fillText('楽', W - 42, 62);
      g.textAlign = 'left';
      g.restore();

      // Crisp manga panel ink border
      g.strokeStyle = '#111111';
      g.lineWidth = 10;
      g.strokeRect(5, 5, W - 10, H - 10);
      g.lineWidth = 2.5;
      g.strokeRect(16, 16, W - 32, H - 32);
      return true;
    }

    case 'risograph': {
      // Two-drum Risograph soy-ink print with misregistered color layers & crop marks
      cardDrop(g, W, H, 8, P.surface, 26, 12, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, 8);
      g.clip();

      const inkA = rgba(bg, 0.22);
      const inkB = rgba(mixHex(bg, '#FF2A6D', 0.7), 0.18);

      // Misregistered offset Riso geometric frames & corner halftones
      g.strokeStyle = inkB;
      g.lineWidth = 6;
      g.strokeRect(32, 30, W - 56, H - 56);

      g.strokeStyle = inkA;
      g.lineWidth = 6;
      g.strokeRect(24, 24, W - 56, H - 56);

      // Riso stipple grain
      g.fillStyle = rgba(mixHex(bg, '#111111', 0.4), 0.08);
      for (let i = 0; i < 320; i++) {
        g.fillRect((i * 151) % W, (i * 83) % H, 2, 2);
      }

      // Print registration crop crosshairs in 4 corners
      g.strokeStyle = rgba(P.text, 0.55);
      g.lineWidth = 1.5;
      for (const [cx, cy] of [
        [24, 24],
        [W - 24, 24],
        [24, H - 24],
        [W - 24, H - 24],
      ]) {
        g.beginPath();
        g.moveTo(cx - 10, cy);
        g.lineTo(cx + 10, cy);
        g.moveTo(cx, cy - 10);
        g.lineTo(cx, cy + 10);
        g.stroke();
        g.beginPath();
        g.arc(cx, cy, 5, 0, Math.PI * 2);
        g.stroke();
      }
      g.restore();
      return true;
    }

    case 'waxseal': {
      // Fine Cotton Correspondence Letter with copperplate rules & embossed crimson wax seal
      cardDrop(g, W, H, 10, P.surface, 28, 14, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, 10);
      g.clip();

      const paper = g.createLinearGradient(0, 0, W, H);
      paper.addColorStop(0, '#FFFDF7');
      paper.addColorStop(1, '#EFE7D4');
      g.fillStyle = paper;
      g.fillRect(0, 0, W, H);

      // Fine stationary double border
      g.strokeStyle = 'rgba(36,29,24,0.28)';
      g.lineWidth = 2;
      g.strokeRect(24, 24, W - 48, H - 48);
      g.lineWidth = 1;
      g.strokeRect(30, 30, W - 60, H - 60);

      // Embossed wax seal in top-right safe corner
      const wx = W - 64;
      const wy = 64;
      const wr = 32;
      const waxCol = mixHex(bg, '#9E1B24', 0.65);

      g.save();
      g.shadowColor = 'rgba(0,0,0,0.32)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 4;
      g.fillStyle = waxCol;
      g.beginPath();
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const r = wr + (i % 2 ? 2.5 : -1.5);
        g[i ? 'lineTo' : 'moveTo'](wx + Math.cos(a) * r, wy + Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
      g.restore();

      // Inner wax ring & specular highlight
      g.strokeStyle = mixHex(waxCol, '#000000', 0.35);
      g.lineWidth = 3;
      g.beginPath();
      g.arc(wx, wy, wr * 0.72, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(wx - 2, wy - 2, wr * 0.72, Math.PI * 0.8, Math.PI * 1.6);
      g.stroke();
      g.restore();
      return true;
    }

    case 'blueprint': {
      // Cyanotype Architectural Blueprint with dual-scale drafting grid & title block
      g.fillStyle = P.surface;
      roundedRect(g, 0, 0, W, H, 4);
      g.fill();

      g.save();
      roundedRect(g, 0, 0, W, H, 4);
      g.clip();

      // Sub-grid (20px) and major grid (100px)
      g.strokeStyle = 'rgba(240,247,255,0.08)';
      g.lineWidth = 1;
      for (let x = 0; x < W; x += 20) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, H);
        g.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }

      g.strokeStyle = 'rgba(240,247,255,0.18)';
      g.lineWidth = 1.5;
      for (let x = 0; x < W; x += 100) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, H);
        g.stroke();
      }
      for (let y = 0; y < H; y += 100) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }

      // Drafting border & top specification micro-block
      g.strokeStyle = 'rgba(240,247,255,0.82)';
      g.lineWidth = 3;
      g.strokeRect(20, 20, W - 40, H - 40);
      g.lineWidth = 1.5;
      g.strokeRect(28, 28, W - 56, H - 56);

      g.fillStyle = 'rgba(240,247,255,0.75)';
      g.font = `700 13px 'Courier New', monospace`;
      g.textAlign = 'right';
      g.fillText(`SCALE 1:1 · ${W}x${H}MM · DWG SM-01`, W - 38, 48);
      g.textAlign = 'left';
      g.restore();
      return true;
    }

    case 'tarot': {
      // Celestial Gold-Leaf Tarot Card
      g.fillStyle = P.surface;
      roundedRect(g, 0, 0, W, H, 28);
      g.fill();

      g.save();
      roundedRect(g, 0, 0, W, H, 28);
      g.clip();

      const gold = '#E6C36A';
      // Ambient mystic radial glow
      const mystic = g.createRadialGradient(
        W * 0.5,
        H * 0.45,
        10,
        W * 0.5,
        H * 0.45,
        Math.max(W, H) * 0.6
      );
      mystic.addColorStop(0, rgba(bg, 0.28));
      mystic.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = mystic;
      g.fillRect(0, 0, W, H);

      // Ornate double gold-leaf border + corner crescents
      g.strokeStyle = gold;
      g.lineWidth = 4;
      roundedRect(g, 20, 20, W - 40, H - 40, 18);
      g.stroke();
      g.lineWidth = 1.5;
      roundedRect(g, 30, 30, W - 60, H - 60, 12);
      g.stroke();

      // Top Roman Numeral cartouche
      const cw = 130;
      const ch = 26;
      g.fillStyle = P.surface;
      g.fillRect((W - cw) / 2, 16, cw, ch);
      g.strokeStyle = gold;
      g.lineWidth = 2;
      g.strokeRect((W - cw) / 2, 16, cw, ch);
      g.fillStyle = gold;
      g.font = `700 15px 'Playfair Display', Georgia, serif`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('XVII · THE STAR', W / 2, 29);
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';

      // Corner celestial stars
      for (const [sx, sy] of [
        [48, 48],
        [W - 48, 48],
        [48, H - 48],
        [W - 48, H - 48],
      ]) {
        g.fillStyle = gold;
        g.beginPath();
        g.arc(sx, sy, 4, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      return true;
    }

    case 'ipod': {
      // Apple iPod Classic anodized shell + recessed backlit LCD screen frame
      const bodyGrad = g.createLinearGradient(0, 0, W, H);
      bodyGrad.addColorStop(0, mixHex(bg, '#F2F4F8', 0.78));
      bodyGrad.addColorStop(0.5, mixHex(bg, '#D8DEE8', 0.75));
      bodyGrad.addColorStop(1, mixHex(bg, '#B8C2D0', 0.72));
      g.fillStyle = bodyGrad;
      roundedRect(g, 0, 0, W, H, 44);
      g.fill();

      // Recessed dark LCD outer bezel
      const m = 24;
      g.fillStyle = '#181C24';
      roundedRect(g, m, m, W - m * 2, H - m * 2, 24);
      g.fill();

      // Crisp backlit white/blue-tinted LCD screen
      const sm = 34;
      const lcd = g.createLinearGradient(0, sm, 0, H - sm);
      lcd.addColorStop(0, '#FFFFFF');
      lcd.addColorStop(1, '#EEF3F9');
      g.fillStyle = lcd;
      roundedRect(g, sm, sm, W - sm * 2, H - sm * 2, 16);
      g.fill();

      // Classic iPod top status bar (Now Playing + green battery icon)
      g.save();
      roundedRect(g, sm, sm, W - sm * 2, H - sm * 2, 16);
      g.clip();
      const sbH = 34;
      const sbGrad = g.createLinearGradient(0, sm, 0, sm + sbH);
      sbGrad.addColorStop(0, '#F5F7FA');
      sbGrad.addColorStop(1, '#DCE3EC');
      g.fillStyle = sbGrad;
      g.fillRect(sm, sm, W - sm * 2, sbH);
      g.fillStyle = 'rgba(0,0,0,0.15)';
      g.fillRect(sm, sm + sbH, W - sm * 2, 1.5);

      g.fillStyle = '#1D2430';
      g.font = `700 14px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('Now Playing', W / 2, sm + sbH / 2);
      g.textAlign = 'left';

      // Green battery icon on top-right
      const bx = W - sm - 46;
      const by = sm + 10;
      g.strokeStyle = '#3A4659';
      g.lineWidth = 2;
      g.strokeRect(bx, by, 26, 13);
      g.fillStyle = '#3A4659';
      g.fillRect(bx + 26, by + 3, 3, 7);
      g.fillStyle = '#28C941';
      g.fillRect(bx + 2, by + 2, 19, 9);
      g.restore();

      g.strokeStyle = 'rgba(255,255,255,0.85)';
      g.lineWidth = 4;
      roundedRect(g, 2, 2, W - 4, H - 4, 42);
      g.stroke();
      return true;
    }

    case 'terminal': {
      // Vintage Phosphor CRT Hacker Terminal
      g.fillStyle = P.surface;
      roundedRect(g, 0, 0, W, H, 20);
      g.fill();

      const phosphor = P.neon || '#39FF88';
      g.save();
      roundedRect(g, 0, 0, W, H, 20);
      g.clip();

      // Phosphor radial screen glow
      const crt = g.createRadialGradient(
        W * 0.5,
        H * 0.5,
        20,
        W * 0.5,
        H * 0.5,
        Math.max(W, H) * 0.65
      );
      crt.addColorStop(0, rgba(phosphor, 0.14));
      crt.addColorStop(1, 'rgba(0,0,0,0.35)');
      g.fillStyle = crt;
      g.fillRect(0, 0, W, H);

      // Terminal title bar
      const tbH = 44;
      g.fillStyle = rgba(phosphor, 0.16);
      g.fillRect(0, 0, W, tbH);
      g.fillStyle = phosphor;
      g.fillRect(0, tbH, W, 2);

      g.font = `700 15px 'Courier New', monospace`;
      g.textBaseline = 'middle';
      g.fillText('spotifyman@tty1: ~/now-playing — zsh', 28, tbH / 2);

      // CRT scanlines
      g.fillStyle = 'rgba(0,0,0,0.22)';
      for (let y = tbH + 4; y < H; y += 5) {
        g.fillRect(0, y, W, 2);
      }
      g.restore();

      g.strokeStyle = rgba(phosphor, 0.72);
      g.lineWidth = 3;
      roundedRect(g, 1.5, 1.5, W - 3, H - 3, 18.5);
      g.stroke();
      return true;
    }

    case 'aqua': {
      // Mac OS X 10.0 Cheetah Aqua Window (pinstriped chrome + gel traffic lights)
      cardDrop(g, W, H, 26, P.surface, 32, 16, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, 26);
      g.clip();

      // Subtle Aqua pinstripes across window background
      g.fillStyle = '#F8FAFD';
      g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(180,196,220,0.14)';
      for (let y = 0; y < H; y += 6) {
        g.fillRect(0, y, W, 2);
      }

      // Glossy Aqua title bar
      const tbH = 48;
      const tb = g.createLinearGradient(0, 0, 0, tbH);
      tb.addColorStop(0, '#FFFFFF');
      tb.addColorStop(0.5, '#E4EAF2');
      tb.addColorStop(0.52, '#D0D9E6');
      tb.addColorStop(1, '#EAEEF5');
      g.fillStyle = tb;
      g.fillRect(0, 0, W, tbH);
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(0, tbH, W, 1.5);

      // Candy-gel Traffic Light buttons (Red, Yellow, Green) with top specular bubble
      const lights: [number, string, string][] = [
        [28, '#FF5F57', '#B81D13'],
        [54, '#FEBC2E', '#B57C00'],
        [80, '#28C840', '#117A21'],
      ];
      for (const [lx, fillCol, rimCol] of lights) {
        g.fillStyle = fillCol;
        g.beginPath();
        g.arc(lx, tbH / 2, 9, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = rimCol;
        g.lineWidth = 1.5;
        g.stroke();
        // Top gel highlight dot
        g.fillStyle = 'rgba(255,255,255,0.75)';
        g.beginPath();
        g.ellipse(lx, tbH / 2 - 4, 4.5, 2.2, 0, 0, Math.PI * 2);
        g.fill();
      }

      // Lickable Aqua blue gel pill indicator on top-right
      const pillX = W - 64;
      const pillY = tbH / 2 - 7;
      const aquaGel = g.createLinearGradient(0, pillY, 0, pillY + 14);
      aquaGel.addColorStop(0, mixHex(bg, '#7CE0FF', 0.6));
      aquaGel.addColorStop(1, mixHex(bg, '#0066CC', 0.6));
      g.fillStyle = aquaGel;
      roundedRect(g, pillX, pillY, 36, 14, 7);
      g.fill();
      g.restore();

      g.strokeStyle = 'rgba(0,0,0,0.22)';
      g.lineWidth = 2;
      roundedRect(g, 1, 1, W - 2, H - 2, 25);
      g.stroke();
      return true;
    }

    case 'frutiger': {
      // Frutiger Aero (2006 glossy sky-aqua aurora + translucent floating glass bubbles)
      cardDrop(g, W, H, 44, P.surface, 34, 16, unit);
      g.save();
      roundedRect(g, 0, 0, W, H, 44);
      g.clip();

      const aero = g.createLinearGradient(0, 0, 0, H);
      aero.addColorStop(0, mixHex(bg, '#38BDF8', 0.62));
      aero.addColorStop(0.48, mixHex(bg, '#0284C7', 0.55));
      aero.addColorStop(0.52, mixHex(bg, '#0369A1', 0.62));
      aero.addColorStop(1, mixHex(bg, '#10B981', 0.52));
      g.fillStyle = aero;
      g.fillRect(0, 0, W, H);

      // Curved Vista-style upper glass horizon reflection
      const gloss = g.createLinearGradient(0, 0, 0, H * 0.52);
      gloss.addColorStop(0, 'rgba(255,255,255,0.58)');
      gloss.addColorStop(0.7, 'rgba(255,255,255,0.12)');
      gloss.addColorStop(1, 'rgba(255,255,255,0.24)');
      g.fillStyle = gloss;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(W, 0);
      g.lineTo(W, H * 0.36);
      g.quadraticCurveTo(W * 0.45, H * 0.54, 0, H * 0.42);
      g.closePath();
      g.fill();

      // Translucent floating water/glass orbs
      for (const [bx, by, br] of [
        [0.86, 0.2, 46],
        [0.91, 0.31, 22],
        [0.14, 0.84, 38],
        [0.78, 0.82, 54],
      ]) {
        const cx = W * bx;
        const cy = H * by;
        const orb = g.createRadialGradient(
          cx - br * 0.3,
          cy - br * 0.3,
          2,
          cx,
          cy,
          br
        );
        orb.addColorStop(0, 'rgba(255,255,255,0.65)');
        orb.addColorStop(0.45, 'rgba(255,255,255,0.12)');
        orb.addColorStop(0.85, 'rgba(255,255,255,0.05)');
        orb.addColorStop(1, 'rgba(255,255,255,0.38)');
        g.fillStyle = orb;
        g.beginPath();
        g.arc(cx, cy, br, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();

      g.strokeStyle = 'rgba(255,255,255,0.78)';
      g.lineWidth = 4;
      roundedRect(g, 2, 2, W - 4, H - 4, 42);
      g.stroke();
      return true;
    }

    case 'swiss': {
      // Swiss International Typographic Grid Poster (Josef Müller-Brockmann style)
      if (state.cardDepth === 0) {
        g.fillStyle = '#111111';
        g.fillRect(10, 10, W, H);
      }
      g.fillStyle = P.surface;
      g.fillRect(0, 0, W, H);

      const f = cardFrame(layout, theme, state.hide);
      const gridY1 = Math.round(f.ltop - layout.lyricGap * 0.48);
      const gridY2 = Math.round(f.y1 - layout.logo - layout.logoGap * 0.55);

      // Vivid Swiss modernist color block in top-right corner cell
      g.fillStyle = bg;
      g.fillRect(W - 44, 0, 44, gridY1);

      // Razor-sharp black modular structural grid rules
      g.fillStyle = '#111111';
      g.fillRect(0, 0, W, 8);
      g.fillRect(0, gridY1, W, 3);
      if (!state.hide.logo) {
        g.fillRect(0, gridY2, W, 2);
      }

      // Vertical modular column rule aligned cleanly to left margin
      const colX = Math.max(24, Math.round(f.lx * 0.42));
      g.fillRect(colX, 0, 2, H);

      // Minimal Swiss catalog index code in left margin
      g.save();
      g.translate(colX / 2, H / 2);
      g.rotate(-Math.PI / 2);
      g.fillStyle = 'rgba(17,17,17,0.55)';
      g.font = `700 12px ${FONT}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText('ZÜRICH · KUNSTHALLE · NR. 04', 0, 0);
      g.restore();

      g.strokeStyle = '#111111';
      g.lineWidth = 6;
      g.strokeRect(3, 3, W - 6, H - 6);
      return true;
    }
  }
  return false;
}
