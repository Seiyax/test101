import * as THREE from 'three';
import type { BgStyle, LayoutKey, ThemeKey } from '../types';
import { LAYOUTS } from './constants';
import { cardFrame, cardGeom, themeRadius } from './geometry';
import { getPalette } from './classicThemes';
import { mixHex } from '../utils/colorUtils';

export interface Card3DMetrics {
  geometry: THREE.ExtrudeGeometry;
  width: number;
  height: number;
  depth: number;
  edgeColor: string;
  isPaper: boolean;
}

/**
 * Returns the exact border/edge color for the extruded side walls & back of each theme
 * so there is never a generic gray/olive/black rim.
 */
export function edgeColorFor(theme: ThemeKey, color: string): string {
  const P = getPalette(theme, color);
  switch (theme) {
    case 'sticker':
      return '#FFFFFF';
    case 'ticket':
    case 'boarding':
      return mixHex(P.surface, '#c8bfa8', 0.22);
    case 'polaroid':
      return '#EDEAE2';
    case 'notebook':
      return '#F2ECD9';
    case 'newspaper':
      return '#DDD6C4';
    case 'receipt':
      return '#F0EFE9';
    case 'stamp':
      return '#E8DEC6';
    case 'waxseal':
      return '#EAE1CD';
    case 'risograph':
      return '#E8E0CC';
    case 'swiss':
    case 'manga':
      return '#141414';
    case 'cassette':
      return mixHex(P.surface, '#d4c6a8', 0.24);
    case 'chalkboard':
      return '#5a3a22';
    case 'gameboy':
      return '#C9C6BB';
    case 'brutalism':
    case 'comic':
    case 'comicart':
    case 'pixel':
    case 'pixelart':
      return '#141414';
    case 'holo':
      return mixHex(color, '#d8b4ff', 0.45);
    case 'y2k':
      return mixHex(color, '#e6ecff', 0.6);
    case 'glass':
    case 'cdcase':
      return mixHex(color, '#e2ecf8', 0.65);
    case 'minidisc':
      return '#232836';
    case 'floppy':
      return mixHex(color, '#1D2330', 0.38);
    case 'plaque':
    case 'tarot':
      return '#D4AF37';
    case 'vhs':
      return '#1A171D';
    case 'filmstrip':
      return '#0E0D0C';
    case 'vippass':
      return mixHex(color, '#252B3B', 0.5);
    case 'matchbook':
      return mixHex(P.surface, '#241610', 0.28);
    case 'blueprint':
      return '#0B356E';
    case 'ipod':
    case 'aqua':
      return '#DCE2EC';
    case 'terminal':
      return '#0D1C14';
    case 'frutiger':
      return mixHex(color, '#38BDF8', 0.55);
    case 'clay':
    case 'neumorphism':
      return mixHex(P.surface, '#000000', 0.12);
    case 'lego':
      return mixHex(P.surface, '#000000', 0.18);
    case 'vinyl':
      return mixHex(P.surface, color, 0.22);
    case 'aurora':
      return mixHex(color, '#0d1020', 0.65);
    case 'cyberpunk':
    case 'neon':
    case 'glowsketch':
      return mixHex(color, '#0a0a12', 0.58);
    case 'ps2':
      return mixHex(color, '#160c36', 0.62);
    case 'cgimotion':
      return mixHex(color, '#111622', 0.55);
    case 'dankoe':
      return '#161616';
    case 'zackd':
      return '#101010';
    case 'stained':
      return '#121218';
    case 'classic':
    case 'wrapped':
    case 'flatvector':
    default:
      return mixHex(color, '#000000', 0.18);
  }
}

export function isPaperTheme(theme: ThemeKey): boolean {
  return (
    theme === 'ticket' ||
    theme === 'polaroid' ||
    theme === 'notebook' ||
    theme === 'newspaper' ||
    theme === 'receipt' ||
    theme === 'cassette' ||
    theme === 'stamp' ||
    theme === 'boarding' ||
    theme === 'matchbook' ||
    theme === 'manga' ||
    theme === 'risograph' ||
    theme === 'waxseal' ||
    theme === 'blueprint' ||
    theme === 'swiss' ||
    theme === 'vhs'
  );
}

/**
 * Builds a sleek, thin extrusion depth (roughly 0.025–0.18 units)
 * that feels like a real physical card rather than a thick block.
 */
export function cardDepthUnits(theme: ThemeKey, cardDepth: number): number {
  const norm = Math.min(60, Math.max(0, cardDepth)) / 60;
  const base = 0.028 + norm * 0.112; // 0.028 .. 0.140
  if (isPaperTheme(theme)) return base * 0.52;
  if (theme === 'sticker' || theme === 'filmstrip') return base * 0.42;
  if (theme === 'vinyl' || theme === 'vippass' || theme === 'tarot') return base * 0.6;
  if (theme === 'lego') return base * 1.3;
  if (theme === 'clay' || theme === 'plaque' || theme === 'ipod') return base * 1.15;
  return base;
}

/**
 * Builds an ExtrudeGeometry whose silhouette, corner radius, notches, peeled corner,
 * sprocket holes, lanyard slot, or zigzag/scalloped edge matches the exact 2D canvas pixels
 * rendered by `renderCard`, with exact planar UVs on the front face and clean edge-material
 * groups on the sides & back.
 */
export function buildExtrudedCardGeometry(
  layoutKey: LayoutKey,
  theme: ThemeKey,
  bgStyle: BgStyle,
  cardDepth: number,
  color: string
): Card3DMetrics {
  const layout = LAYOUTS[layoutKey];
  const W = layout.w;
  const H = layout.h;
  const aspect = W / H;
  const maxDim = 2.42;
  const baseWorldW = aspect >= 1 ? maxDim : maxDim * aspect;
  const baseWorldH = aspect >= 1 ? maxDim / aspect : maxDim;

  const zeroTilt = { rx: 0, ry: 0, rz: 0, perspective: 1200 };
  // Always use the card's true physical silhouette (THEME_R + THEME_INSET) — never a backing slab
  const geo = cardGeom(layoutKey, theme, 0, 'none', zeroTilt, true);

  const hasBackdrop = false;
  void bgStyle;
  const stickerPad = !hasBackdrop && theme === 'sticker' ? 16 * geo.s : 0;

  const px0 = hasBackdrop ? 0 : geo.x - stickerPad;
  const py0 = hasBackdrop ? 0 : geo.y - stickerPad;
  const pxW = hasBackdrop ? W : geo.w + stickerPad * 2;
  const pxH = hasBackdrop ? H : geo.h + stickerPad * 2;

  const pxScale = Math.min(baseWorldW / pxW, baseWorldH / pxH);
  const worldW = pxW * pxScale;
  const worldH = pxH * pxScale;
  const centerPxX = px0 + pxW / 2;
  const centerPxY = py0 + pxH / 2;

  const mx = (px: number) => (px - centerPxX) * pxScale;
  const my = (py: number) => (centerPxY - py) * pxScale;

  const x0 = mx(px0);
  const x1 = mx(px0 + pxW);
  const y1 = my(py0); // top in 3D (+Y)
  const y0 = my(py0 + pxH); // bottom in 3D (-Y)

  const shape = new THREE.Shape();

  if (!hasBackdrop && theme === 'receipt') {
    // Exact zigzag top and bottom thermal paper edges
    const n = Math.round(W / 22);
    const twPx = (W / n) * geo.s;
    const tt = 10 * geo.s * pxScale;

    shape.moveTo(x0, y0 + tt);
    for (let i = 0; i < n; i++) {
      shape.lineTo(mx(px0 + (i + 0.5) * twPx), y0);
      shape.lineTo(mx(px0 + (i + 1) * twPx), y0 + tt);
    }
    shape.lineTo(x1, y1 - tt);
    for (let i = n; i > 0; i--) {
      shape.lineTo(mx(px0 + (i - 0.5) * twPx), y1);
      shape.lineTo(mx(px0 + (i - 1) * twPx), y1 - tt);
    }
    shape.closePath();
  } else if (!hasBackdrop && theme === 'stamp') {
    // Scalloped perforated postage stamp silhouette all around
    const step = 36;
    const pr = 9 * geo.s * pxScale;
    shape.moveTo(x0, y0);
    // Bottom edge (left -> right)
    for (let x = step / 2; x < W; x += step) {
      const nx = mx(px0 + x * geo.s);
      if (nx - pr > x0 && nx + pr < x1) {
        shape.lineTo(nx - pr, y0);
        shape.absarc(nx, y0, pr, Math.PI, 0, true);
      }
    }
    shape.lineTo(x1, y0);
    // Right edge (bottom -> top)
    for (let y = H - step / 2; y > 0; y -= step) {
      const ny = my(py0 + y * geo.s);
      if (ny - pr > y0 && ny + pr < y1) {
        shape.lineTo(x1, ny - pr);
        shape.absarc(x1, ny, pr, -Math.PI / 2, Math.PI / 2, true);
      }
    }
    shape.lineTo(x1, y1);
    // Top edge (right -> left)
    for (let x = W - step / 2; x > 0; x -= step) {
      const nx = mx(px0 + x * geo.s);
      if (nx - pr > x0 && nx + pr < x1) {
        shape.lineTo(nx + pr, y1);
        shape.absarc(nx, y1, pr, 0, Math.PI, true);
      }
    }
    shape.lineTo(x0, y1);
    // Left edge (top -> bottom)
    for (let y = step / 2; y < H; y += step) {
      const ny = my(py0 + y * geo.s);
      if (ny - pr > y0 && ny + pr < y1) {
        shape.lineTo(x0, ny + pr);
        shape.absarc(x0, ny, pr, Math.PI / 2, -Math.PI / 2, true);
      }
    }
    shape.closePath();
  } else {
    const rawR = hasBackdrop
      ? layout.radius
      : themeRadius(theme, layout.radius) * geo.s + stickerPad;
    const r = Math.max(0, Math.min(rawR * pxScale, worldW / 2 - 0.001, worldH / 2 - 0.001));

    const ticketStub =
      !hasBackdrop && theme === 'ticket'
        ? cardFrame(layout, 'ticket', false).stub || { v: false, at: H - 150, len: 150 }
        : !hasBackdrop && theme === 'boarding'
        ? { v: false, at: H - 56, len: 56 }
        : null;
    const notchR = (theme === 'boarding' ? 12 : 18) * geo.s * pxScale;
    const notchX = ticketStub?.v ? mx(geo.x + ticketStub.at * geo.s) : 0;
    const notchY = ticketStub && !ticketStub.v ? my(geo.y + ticketStub.at * geo.s) : 0;

    // Sticker top-right peeled corner OR Floppy top-right chamfered corner cutout
    const topRightChamfer =
      !hasBackdrop && theme === 'sticker'
        ? (Math.min(W, H) * 0.14 + 16) * geo.s * pxScale
        : !hasBackdrop && theme === 'floppy'
        ? Math.round(Math.min(W, H) * 0.09) * geo.s * pxScale
        : 0;

    shape.moveTo(x0 + r, y0);

    // Bottom edge (left -> right)
    if (ticketStub?.v) {
      shape.lineTo(notchX - notchR, y0);
      shape.absarc(notchX, y0, notchR, Math.PI, 0, true);
    }
    shape.lineTo(x1 - r, y0);

    // Bottom-right corner
    if (r > 0.0005) {
      shape.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
    }

    // Right edge (bottom -> top)
    if (ticketStub && !ticketStub.v) {
      shape.lineTo(x1, notchY - notchR);
      shape.absarc(x1, notchY, notchR, -Math.PI / 2, Math.PI / 2, true);
    }

    if (topRightChamfer > 0) {
      shape.lineTo(x1, y1 - topRightChamfer);
      shape.lineTo(x1 - topRightChamfer, y1);
    } else {
      shape.lineTo(x1, y1 - r);
      if (r > 0.0005) {
        shape.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
      }
    }

    // Top edge (right -> left)
    if (ticketStub?.v) {
      shape.lineTo(notchX + notchR, y1);
      shape.absarc(notchX, y1, notchR, 0, Math.PI, true);
    }
    shape.lineTo(x0 + r, y1);

    // Top-left corner
    if (r > 0.0005) {
      shape.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
    }

    // Left edge (top -> bottom)
    if (ticketStub && !ticketStub.v) {
      shape.lineTo(x0, notchY + notchR);
      shape.absarc(x0, notchY, notchR, Math.PI / 2, -Math.PI / 2, true);
    }
    shape.lineTo(x0, y0 + r);

    // Bottom-left corner
    if (r > 0.0005) {
      shape.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
    }
    shape.closePath();

    // Real 3D cutout holes for VIP Pass lanyard slot and 35mm Film Strip sprockets
    if (!hasBackdrop && theme === 'vippass') {
      const slotW = 116 * geo.s;
      const slotH = 20 * geo.s;
      const sx0 = mx(geo.x + (W - 116) * 0.5 * geo.s);
      const sx1 = mx(geo.x + ((W - 116) * 0.5 + 116) * geo.s);
      const sy1 = my(geo.y + 18 * geo.s);
      const sy0 = my(geo.y + (18 + 20) * geo.s);
      const sr = Math.min((slotH * pxScale) / 2, (slotW * pxScale) / 2);

      const hole = new THREE.Path();
      hole.moveTo(sx0 + sr, sy0);
      hole.lineTo(sx1 - sr, sy0);
      hole.absarc(sx1 - sr, sy0 + sr, sr, -Math.PI / 2, Math.PI / 2, false);
      hole.lineTo(sx0 + sr, sy1);
      hole.absarc(sx0 + sr, sy0 + sr, sr, Math.PI / 2, Math.PI * 1.5, false);
      hole.closePath();
      shape.holes.push(hole);
    } else if (!hasBackdrop && theme === 'filmstrip') {
      const railW = Math.max(54, Math.round(W * 0.068));
      const holeStep = 64;
      const holeW = Math.round(railW * 0.46);
      const holeH = 34;
      const holeXLeft = Math.round((railW - holeW) / 2);
      const holeXRight = W - railW + holeXLeft;

      for (let y = 26; y + holeH < H - 16; y += holeStep) {
        for (const hx of [holeXLeft, holeXRight]) {
          const hx0 = mx(geo.x + hx * geo.s);
          const hx1 = mx(geo.x + (hx + holeW) * geo.s);
          const hy1 = my(geo.y + y * geo.s);
          const hy0 = my(geo.y + (y + holeH) * geo.s);
          const sp = new THREE.Path();
          sp.moveTo(hx0, hy0);
          sp.lineTo(hx1, hy0);
          sp.lineTo(hx1, hy1);
          sp.lineTo(hx0, hy1);
          sp.closePath();
          shape.holes.push(sp);
        }
      }
    }
  }

  const depth = cardDepthUnits(theme, cardDepth);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 24,
    steps: 1,
  });

  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();

  const pos = geometry.attributes.position;
  const norm = geometry.attributes.normal;
  const uv = geometry.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const u = (vx / pxScale + centerPxX) / W;
    const v = 1 - (centerPxY - vy / pxScale) / H;
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;

  geometry.clearGroups();
  const triCount = Math.floor(pos.count / 3);
  let runStart = 0;
  let runMat = -1;

  for (let t = 0; t < triCount; t++) {
    const i0 = t * 3;
    const avgNz = (norm.getZ(i0) + norm.getZ(i0 + 1) + norm.getZ(i0 + 2)) / 3;
    // Front (+Z) and back (-Z) faces use material-0 (the card texture); side walls use material-1 (thin matched rim)
    const matIdx = Math.abs(avgNz) > 0.5 ? 0 : 1;
    if (matIdx !== runMat) {
      if (runMat !== -1) {
        geometry.addGroup(runStart, i0 - runStart, runMat);
      }
      runStart = i0;
      runMat = matIdx;
    }
  }
  if (runMat !== -1 && pos.count > runStart) {
    geometry.addGroup(runStart, pos.count - runStart, runMat);
  }

  return {
    geometry,
    width: worldW,
    height: worldH,
    depth,
    edgeColor: edgeColorFor(theme, color),
    isPaper: isPaperTheme(theme),
  };
}

/**
 * Builds a separate extruded 3D vinyl record or optical CD disc geometry
 * (with real center spindle hole) and planar UVs.
 */
export function buildVinylDiscGeometry(radius: number, thickness = 0.022): THREE.ExtrudeGeometry {
  const disc = new THREE.Shape();
  disc.absarc(0, 0, radius, 0, Math.PI * 2, false);

  const hole = new THREE.Path();
  hole.absarc(0, 0, radius * 0.08, 0, Math.PI * 2, true);
  disc.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(disc, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
    curveSegments: 56,
  });
  geo.translate(0, 0, -thickness / 2);
  geo.computeVertexNormals();

  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const inv = 1 / (radius * 2);
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) * inv + 0.5, pos.getY(i) * inv + 0.5);
  }
  uv.needsUpdate = true;
  return geo;
}

/**
 * Creates a procedural glossy vinyl record texture (micro-grooves, specular light wedges,
 * and vibrant colored center label).
 */
export function createVinylDiscTexture(labelColor: string, isOpticalCd = false): THREE.CanvasTexture {
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  if (g) {
    const cx = S / 2;
    const cy = S / 2;
    const R = S * 0.49;

    if (isOpticalCd) {
      // Iridescent silver/rainbow polycarbonate Compact Disc
      g.fillStyle = '#D8E0EC';
      g.fillRect(0, 0, S, S);

      const cdBase = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
      cdBase.addColorStop(0, '#F0F4FA');
      cdBase.addColorStop(0.5, '#C8D2E0');
      cdBase.addColorStop(0.95, '#E4ECF6');
      cdBase.addColorStop(1, '#FFFFFF');
      g.fillStyle = cdBase;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();

      // Rainbow optical diffraction wedges
      const rainbow = ['#FF4FD8', '#38BDF8', '#4ADE80', '#FACC15', '#A855F7'];
      rainbow.forEach((col, i) => {
        const a0 = (i / rainbow.length) * Math.PI;
        g.fillStyle = col;
        g.globalAlpha = 0.26;
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, R, a0, a0 + 0.35);
        g.closePath();
        g.fill();
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, R, a0 + Math.PI, a0 + Math.PI + 0.35);
        g.closePath();
        g.fill();
      });
      g.globalAlpha = 1;

      // Clear inner clamping ring & accent hub ring
      g.strokeStyle = labelColor;
      g.lineWidth = 8;
      g.beginPath();
      g.arc(cx, cy, R * 0.28, 0, Math.PI * 2);
      g.stroke();

      g.strokeStyle = 'rgba(0,0,0,0.22)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, R * 0.18, 0, Math.PI * 2);
      g.stroke();
    } else {
      g.fillStyle = '#121215';
      g.fillRect(0, 0, S, S);

      const baseGrad = g.createRadialGradient(cx, cy, R * 0.28, cx, cy, R);
      baseGrad.addColorStop(0, '#18181d');
      baseGrad.addColorStop(0.55, '#0e0e11');
      baseGrad.addColorStop(0.95, '#1d1d22');
      baseGrad.addColorStop(1, '#28282f');
      g.fillStyle = baseGrad;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();

      g.lineWidth = 1.2;
      for (let r = R * 0.36; r < R - 6; r += 3.6) {
        const shimmer = 0.055 + 0.05 * Math.abs(Math.sin(r * 0.55));
        g.strokeStyle = `rgba(255,255,255,${shimmer.toFixed(3)})`;
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.stroke();
      }

      for (const a of [-0.9, 2.24]) {
        const wedge = g.createRadialGradient(cx, cy, R * 0.34, cx, cy, R);
        wedge.addColorStop(0, 'rgba(255,255,255,0.03)');
        wedge.addColorStop(0.5, 'rgba(255,255,255,0.16)');
        wedge.addColorStop(1, 'rgba(255,255,255,0.04)');
        g.fillStyle = wedge;
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, R, a, a + 0.42);
        g.closePath();
        g.fill();
      }

      g.fillStyle = labelColor;
      g.beginPath();
      g.arc(cx, cy, R * 0.33, 0, Math.PI * 2);
      g.fill();

      g.strokeStyle = 'rgba(0,0,0,0.28)';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, R * 0.27, 0, Math.PI * 2);
      g.stroke();

      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, R * 0.13, 0, Math.PI * 2);
      g.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
