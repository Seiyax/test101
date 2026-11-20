import { TiltState } from '../types';

export const rad = (deg: number): number => (deg * Math.PI) / 180;

/** 3x3 row-major matrix multiply */
export function mul3(a: number[], b: number[]): number[] {
  const o = new Array(9).fill(0);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      for (let k = 0; k < 3; k++) {
        o[r * 3 + c] += a[r * 3 + k] * b[k * 3 + c];
      }
    }
  }
  return o;
}

/** 3x3 inverse via adjugate */
export function invert3(m: number[]): number[] {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const k = 1 / det;
  return [
    A * k,
    -(b * i - c * h) * k,
    (b * f - c * e) * k,
    B * k,
    (a * i - c * g) * k,
    -(a * f - c * d) * k,
    C * k,
    -(a * h - b * g) * k,
    (a * e - b * d) * k,
  ];
}

/**
 * Homography H mapping card-plane points (x, y, 1), centered on the card (origin = W/2, H/2),
 * to screen points (X*w, Y*w, w), replicating CSS:
 *   perspective(d) rotateX(rx) rotateY(ry) rotateZ(rz)
 */
export function buildHomography(d: number, tilt: TiltState | null | undefined): number[] {
  const rxDeg = tilt == null ? 0 : Number(tilt.rx) || 0;
  const ryDeg = tilt == null ? 0 : Number(tilt.ry) || 0;
  const rzDeg = tilt == null ? 0 : Number(tilt.rz) || 0;
  const [cx, sx] = [Math.cos(rad(rxDeg)), Math.sin(rad(rxDeg))];
  const [cy, sy] = [Math.cos(rad(ryDeg)), Math.sin(rad(ryDeg))];
  const [cz, sz] = [Math.cos(rad(rzDeg)), Math.sin(rad(rzDeg))];

  // CSS rotation matrices (y-axis points down)
  const Rx = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
  const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy];
  const Rz = [cz, -sz, 0, sz, cz, 0, 0, 0, 1];
  const M = mul3(Rx, mul3(Ry, Rz));

  // Plane z = 0, so only the first two columns of M matter.
  // w = 1 - z/d -> third row is (-m20/d, -m21/d, 1)
  return [
    M[0], M[1], 0,
    M[3], M[4], 0,
    -M[6] / d, -M[7] / d, 1,
  ];
}

/** Project a card-plane point to screen space using H */
export function project(H: number[], x: number, y: number): { x: number; y: number } {
  const w = H[6] * x + H[7] * y + H[8];
  return {
    x: (H[0] * x + H[1] * y + H[2]) / w,
    y: (H[3] * x + H[4] * y + H[5]) / w,
  };
}

/**
 * Warp a source canvas through the 3D homography with bilinear, alpha-premultiplied sampling.
 */
export function warpCard(
  source: HTMLCanvasElement,
  H: number[],
  k: number,
  canvasW: number,
  canvasH: number
): HTMLCanvasElement {
  const halfW = canvasW / 2;
  const halfH = canvasH / 2;
  const SW = canvasW * k;
  const SH = canvasH * k;

  // Bounding box of the projected card
  const corners = [
    [-halfW, -halfH],
    [halfW, -halfH],
    [halfW, halfH],
    [-halfW, halfH],
  ].map(([x, y]) => project(H, x, y));

  const minX = Math.floor(k * Math.min(...corners.map((p) => p.x)));
  const minY = Math.floor(k * Math.min(...corners.map((p) => p.y)));
  const maxX = Math.ceil(k * Math.max(...corners.map((p) => p.x)));
  const maxY = Math.ceil(k * Math.max(...corners.map((p) => p.y)));
  const outW = Math.max(1, maxX - minX);
  const outH = Math.max(1, maxY - minY);

  const srcCtx = source.getContext('2d');
  if (!srcCtx) throw new Error('Could not get 2d context from source canvas');
  const src = srcCtx.getImageData(0, 0, SW, SH).data;
  const dstImage = new ImageData(outW, outH);
  const dst = dstImage.data;
  const inv = invert3(H);

  for (let py = 0; py < outH; py++) {
    const Y = (minY + py + 0.5) / k;
    for (let px = 0; px < outW; px++) {
      const X = (minX + px + 0.5) / k;

      // Screen -> card plane
      const w = inv[6] * X + inv[7] * Y + inv[8];
      const u = ((inv[0] * X + inv[1] * Y + inv[2]) / w + halfW) * k - 0.5;
      const v = ((inv[3] * X + inv[4] * Y + inv[5]) / w + halfH) * k - 0.5;

      if (u < -1 || v < -1 || u > SW || v > SH) continue;

      const x0 = Math.floor(u);
      const y0 = Math.floor(v);
      const fx = u - x0;
      const fy = v - y0;

      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let j = 0; j < 2; j++) {
        const yy = y0 + j;
        if (yy < 0 || yy >= SH) continue;
        const wy = j ? fy : 1 - fy;
        for (let i = 0; i < 2; i++) {
          const xx = x0 + i;
          if (xx < 0 || xx >= SW) continue;
          const wgt = (i ? fx : 1 - fx) * wy;
          const idx = (yy * SW + xx) * 4;
          const al = (src[idx + 3] / 255) * wgt;
          r += src[idx] * al;
          g += src[idx + 1] * al;
          b += src[idx + 2] * al;
          a += al;
        }
      }

      if (a > 0) {
        const o = (py * outW + px) * 4;
        dst[o] = r / a;
        dst[o + 1] = g / a;
        dst[o + 2] = b / a;
        dst[o + 3] = a * 255;
      }
    }
  }

  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const outCtx = out.getContext('2d');
  if (outCtx) outCtx.putImageData(dstImage, 0, 0);
  return out;
}
