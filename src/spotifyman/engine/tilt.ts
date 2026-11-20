import type { TiltState } from '../types';

export const TILT_FALLBACK: TiltState = { rx: 12, ry: -15, rz: 2, perspective: 1200 };

function num(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Always returns a tilt. Never reads a field off null. */
export function asTilt(tilt: Partial<TiltState> | null | undefined): TiltState {
  if (tilt == null) return { ...TILT_FALLBACK };
  return {
    rx: num(tilt.rx, TILT_FALLBACK.rx),
    ry: num(tilt.ry, TILT_FALLBACK.ry),
    rz: num(tilt.rz, TILT_FALLBACK.rz),
    perspective: num(tilt.perspective, TILT_FALLBACK.perspective),
  };
}
