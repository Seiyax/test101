import { useCallback, useRef, useState, type PointerEvent } from 'react';
import { TiltState } from '../types';
import { TILT_DEFAULT } from '../engine/constants';
import { asTilt } from '../engine/tilt';

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export function useTiltInteraction() {
  const [tilt, setTilt] = useState<TiltState>(() => asTilt(TILT_DEFAULT));
  const [isDragging, setIsDragging] = useState(false);
  const tiltRef = useRef<TiltState>(asTilt(TILT_DEFAULT));
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; perspective: number } | null>(null);
  const drag = useRef({
    active: false,
    pointerId: -1,
    x: 0,
    y: 0,
    rx: TILT_DEFAULT.rx,
    ry: TILT_DEFAULT.ry,
    rz: TILT_DEFAULT.rz,
  });

  const commit = useCallback((next: TiltState) => {
    const safe = asTilt(next);
    tiltRef.current = safe;
    setTilt(safe);
  }, []);

  const resetTilt = useCallback(() => {
    drag.current.active = false;
    pointers.current.clear();
    pinchStart.current = null;
    commit(asTilt(TILT_DEFAULT));
    setIsDragging(false);
  }, [commit]);

  const handlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()];
      pinchStart.current = {
        dist: Math.hypot(p2.x - p1.x, p2.y - p1.y),
        perspective: asTilt(tiltRef.current).perspective,
      };
      drag.current.active = false;
      setIsDragging(true);
      return;
    }

    const current = asTilt(tiltRef.current);
    drag.current.active = true;
    drag.current.pointerId = e.pointerId;
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
    drag.current.rx = current.rx;
    drag.current.ry = current.ry;
    drag.current.rz = current.rz;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (pointers.current.has(e.pointerId)) {
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (pointers.current.size === 2 && pinchStart.current) {
        const [p1, p2] = [...pointers.current.values()];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const delta = pinchStart.current.dist - dist;
        const prev = asTilt(tiltRef.current);
        commit({
          ...prev,
          perspective: clamp(
            Math.round(pinchStart.current.perspective + delta * 5),
            400,
            3000
          ),
        });
        return;
      }

      const d = drag.current;
      if (!d.active || d.pointerId !== e.pointerId) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      const prev = asTilt(tiltRef.current);

      if (e.shiftKey) {
        commit({
          ...prev,
          rz: clamp(Math.round(d.rz + dx * 0.3), -180, 180),
        });
      } else {
        commit({
          ...prev,
          ry: clamp(Math.round(d.ry + dx * 0.3), -75, 75),
          rx: clamp(Math.round(d.rx - dy * 0.3), -75, 75),
        });
      }
    },
    [commit]
  );

  const handlePointerUp = useCallback((e?: PointerEvent<HTMLDivElement>) => {
    if (e) {
      pointers.current.delete(e.pointerId);
    } else {
      pointers.current.clear();
    }
    if (pointers.current.size < 2) {
      pinchStart.current = null;
    }
    if (pointers.current.size === 0) {
      drag.current.active = false;
      setIsDragging(false);
    }
  }, []);

  const applyWheelDelta = useCallback(
    (deltaY: number) => {
      const prev = asTilt(tiltRef.current);
      commit({
        ...prev,
        perspective: clamp(Math.round(prev.perspective + deltaY * 2), 400, 3000),
      });
    },
    [commit]
  );

  return {
    tilt: asTilt(tilt),
    setTilt: commit,
    resetTilt,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    applyWheelDelta,
  };
}
