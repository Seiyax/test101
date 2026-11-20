import { ContactShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  paintGlare,
  renderCard,
  type PlaybackVisualState,
} from '../../engine/canvasRenderer';
import { buildExtrudedCardGeometry } from '../../engine/cardShape3D';
import { LAYOUTS } from '../../engine/constants';
import { setPreviewGrab } from '../../engine/exportEngine';
import { asTilt } from '../../engine/tilt';
import type { CardState, TiltState } from '../../types';
import { mixHex } from '../../utils/colorUtils';

type SurfaceMat = {
  roughness: number;
  metalness: number;
  clearcoat: number;
  nearest: boolean;
  toon: boolean;
  basic: boolean;
};

function lookFor(theme: CardState['theme']): SurfaceMat {
  switch (theme) {
    case 'pixel':
    case 'pixelart':
    case 'gameboy':
      return { roughness: 1, metalness: 0, clearcoat: 0, nearest: true, toon: false, basic: true };
    case 'chalkboard':
    case 'notebook':
    case 'newspaper':
    case 'receipt':
    case 'stamp':
    case 'boarding':
    case 'matchbook':
    case 'risograph':
    case 'waxseal':
    case 'blueprint':
    case 'swiss':
    case 'vhs':
      return { roughness: 0.92, metalness: 0, clearcoat: 0, nearest: false, toon: false, basic: false };
    case 'glowsketch':
    case 'neon':
    case 'cyberpunk':
    case 'terminal':
      return { roughness: 0.36, metalness: 0.08, clearcoat: 0.3, nearest: false, toon: false, basic: false };
    case 'ps2':
    case 'floppy':
      return { roughness: 0.48, metalness: 0.14, clearcoat: 0.25, nearest: theme === 'ps2', toon: false, basic: false };
    case 'comic':
    case 'comicart':
    case 'brutalism':
    case 'manga':
      return { roughness: 0.86, metalness: 0, clearcoat: 0, nearest: false, toon: true, basic: false };
    case 'flatvector':
    case 'sticker':
      return { roughness: 1, metalness: 0, clearcoat: 0, nearest: false, toon: false, basic: true };
    case 'dankoe':
      return { roughness: 0.84, metalness: 0.02, clearcoat: 0.04, nearest: false, toon: false, basic: false };
    case 'cgimotion':
    case 'y2k':
    case 'holo':
    case 'aurora':
    case 'plaque':
    case 'tarot':
    case 'frutiger':
    case 'aqua':
    case 'ipod':
    case 'minidisc':
      return { roughness: 0.16, metalness: 0.42, clearcoat: 0.95, nearest: false, toon: false, basic: false };
    case 'lego':
    case 'clay':
      return { roughness: 0.26, metalness: 0.02, clearcoat: 0.6, nearest: false, toon: false, basic: false };
    case 'zackd':
    case 'filmstrip':
      return { roughness: 0.58, metalness: 0.14, clearcoat: 0.18, nearest: false, toon: false, basic: false };
    case 'glass':
    case 'cdcase':
    case 'vippass':
      return { roughness: 0.08, metalness: 0.1, clearcoat: 1, nearest: false, toon: false, basic: false };
    case 'vinyl':
      return { roughness: 0.34, metalness: 0.2, clearcoat: 0.45, nearest: false, toon: false, basic: false };
    default:
      return { roughness: 0.4, metalness: 0.06, clearcoat: 0.28, nearest: false, toon: false, basic: false };
  }
}

function useCardTexture(
  state: CardState,
  coverImg: HTMLImageElement | null,
  fontEpoch: number,
  playback?: PlaybackVisualState | null,
  getLivePlayback?: (() => PlaybackVisualState | null) | null,
  onSize?: (size: number, overflow: boolean) => void
) {
  const holder = useRef<{
    canvas: HTMLCanvasElement;
    tex: THREE.CanvasTexture;
    w: number;
    h: number;
  } | null>(null);
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  const [codeEpoch, setCodeEpoch] = useState(0);
  const sizeRef = useRef(onSize);
  sizeRef.current = onSize;
  const stateRef = useRef(state);
  stateRef.current = state;
  const coverRef = useRef(coverImg);
  coverRef.current = coverImg;

  // Destructure render-affecting fields so export-only changes (scale/fmt/transparent/preset)
  // do not trigger redundant 1024×1024 canvas redraws and GPU texture uploads.
  const {
    title,
    artist,
    lyrics,
    coverUrl,
    color,
    theme,
    layoutKey,
    coverShape,
    lyricFont,
    align,
    hlLine,
    glareStyle,
    glare,
    autoFit,
    lyricSize,
    trackId,
    hide,
  } = state;

  const hideKey = `${hide.cover}|${hide.title}|${hide.artist}|${hide.logo}|${hide.bar}|${hide.code}`;
  const playbackKey = playback
    ? `${playback.isPlaying ? 1 : 0}|${!hide.bar ? `${playback.progress.toFixed(3)}|${playback.currentTime}|${playback.duration}` : 'hidden'}`
    : 'idle';

  const drawTextureFrame = (livePlayback?: PlaybackVisualState | null) => {
    const slot = holder.current;
    if (!slot) return;
    const ctx = slot.canvas.getContext('2d');
    if (!ctx) return;
    const curState = stateRef.current;
    const layout = LAYOUTS[curState.layoutKey];
    try {
      // Always render with bgStyle: 'none' and cardDepth: 0 on the 3D texture
      // so there is never a rectangular backdrop slab behind the extruded card shape
      const flat: CardState = {
        ...curState,
        cardDepth: 0,
        bgStyle: 'none',
      };
      const zeroTilt: TiltState = { rx: 0, ry: 0, rz: 0, perspective: 1200 };
      const info = renderCard(ctx, flat, layout, coverRef.current, zeroTilt, {
        flat: true,
        fullBleed: false,
        onCodeLoad: () => setCodeEpoch((n) => n + 1),
        playback: livePlayback ?? playback,
      });
      paintGlare(ctx, flat, layout, zeroTilt, true);
      sizeRef.current?.(info.size, info.overflow);
    } catch (err) {
      console.error(err);
    }
    const pixel =
      curState.theme === 'pixel' ||
      curState.theme === 'pixelart' ||
      curState.theme === 'gameboy' ||
      curState.theme === 'ps2';
    slot.tex.magFilter = pixel ? THREE.NearestFilter : THREE.LinearFilter;
    slot.tex.minFilter = pixel
      ? THREE.NearestFilter
      : THREE.LinearMipmapLinearFilter;
    slot.tex.generateMipmaps = !pixel;
    slot.tex.needsUpdate = true;
  };

  useEffect(() => {
    const layout = LAYOUTS[layoutKey];
    let slot = holder.current;
    if (!slot || slot.w !== layout.w || slot.h !== layout.h) {
      const canvas = document.createElement('canvas');
      canvas.width = layout.w;
      canvas.height = layout.h;
      const next = new THREE.CanvasTexture(canvas);
      next.colorSpace = THREE.SRGBColorSpace;
      next.anisotropy = 8;
      next.wrapS = THREE.ClampToEdgeWrapping;
      next.wrapT = THREE.ClampToEdgeWrapping;
      slot?.tex.dispose();
      slot = { canvas, tex: next, w: layout.w, h: layout.h };
      holder.current = slot;
      setTex(next);
    }
    drawTextureFrame(getLivePlayback?.() ?? playback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    artist,
    lyrics,
    coverUrl,
    color,
    theme,
    layoutKey,
    coverShape,
    lyricFont,
    align,
    hlLine,
    glareStyle,
    glare,
    autoFit,
    lyricSize,
    trackId,
    hideKey,
    playbackKey,
    coverImg,
    fontEpoch,
    codeEpoch,
  ]);

  // Smooth 60fps real-time word-by-word karaoke & progress bar updates during audio playback without React re-renders
  useEffect(() => {
    if (!playback?.isPlaying || !getLivePlayback) return;
    let rafId = 0;
    let lastDraw = 0;
    const tick = (now: number) => {
      if (now - lastDraw >= 16) {
        lastDraw = now;
        const live = getLivePlayback();
        if (live) drawTextureFrame(live);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playback?.isPlaying, getLivePlayback]);

  useEffect(() => () => holder.current?.tex.dispose(), []);

  return tex;
}

/**
 * Top-edge 3D Lego brick studs aligned along the top rim (+Y) so they read unmistakably
 * as a physical Lego brick without ever obstructing album art or song titles.
 */
function TopEdgeLegoStuds({
  w,
  h,
  depth,
  color,
}: {
  w: number;
  h: number;
  depth: number;
  color: string;
}) {
  const count = Math.max(4, Math.round(w / 0.38));
  const ref = useRef<THREE.InstancedMesh>(null);
  const studR = Math.min(0.055, depth * 0.42);
  const studH = 0.055;

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const y = h / 2 + studH / 2 - 0.005;
    for (let i = 0; i < count; i++) {
      const x = -w / 2 + 0.18 + ((w - 0.36) * (i + 0.5)) / count;
      dummy.position.set(x, y, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, w, h, studH]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[studR, studR * 1.04, studH, 18]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.26}
        metalness={0.02}
        clearcoat={0.65}
      />
    </instancedMesh>
  );
}

/**
 * Syncs `tilt.perspective` (wheel / 2-finger pinch zoom) to camera Z position.
 */
function CameraRig({ perspective }: { perspective: number }) {
  const camera = useThree((s) => s.camera);
  useFrame(() => {
    // Map perspective [400..3000] (default 1200) smoothly to camera distance [4.8..8.8] (default 6.55)
    const targetZ = THREE.MathUtils.clamp(
      6.55 + ((perspective - 1200) / 1800) * 2.25,
      4.6,
      8.8
    );
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.16);
  });
  return null;
}

function CardMesh({
  state,
  tex,
  tilt,
  dragging,
}: {
  state: CardState;
  tex: THREE.Texture | null;
  tilt: TiltState | null;
  dragging: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.PointLight>(null);
  const pose = asTilt(tilt);
  const mat = lookFor(state.theme);
  const draggingRef = useRef(dragging);
  draggingRef.current = dragging;

  const card3d = useMemo(
    () =>
      buildExtrudedCardGeometry(
        state.layoutKey,
        state.theme,
        state.bgStyle,
        state.cardDepth,
        state.color
      ),
    [state.layoutKey, state.theme, state.bgStyle, state.cardDepth, state.color]
  );

  useEffect(() => () => card3d.geometry.dispose(), [card3d.geometry]);

  const toonGrad = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 1;
    const g = c.getContext('2d');
    if (!g) return null;
    ['#555', '#999', '#d8d8d8', '#fff'].forEach((col, i) => {
      g.fillStyle = col;
      g.fillRect(i, 0, 1, 1);
    });
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.NoColorSpace;
    return t;
  }, []);

  useEffect(() => () => toonGrad?.dispose(), [toonGrad]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current && !draggingRef.current) {
      group.current.position.y = Math.sin(t * 0.85) * 0.025;
    } else if (group.current) {
      group.current.position.y = 0;
    }
    if (
      spin.current &&
      (state.theme === 'cgimotion' ||
        state.theme === 'holo' ||
        state.theme === 'y2k' ||
        state.theme === 'vinyl')
    ) {
      spin.current.position.x = Math.sin(t * 0.75) * 2.5;
      spin.current.position.y = 1.0 + Math.cos(t * 0.55) * 0.8;
    }
  });

  const glossyAccent =
    state.theme === 'cgimotion' ||
    state.theme === 'holo' ||
    state.theme === 'y2k';

  return (
    <group
      ref={group}
      rotation={[
        THREE.MathUtils.degToRad(pose.rx),
        THREE.MathUtils.degToRad(pose.ry),
        THREE.MathUtils.degToRad(pose.rz),
      ]}
    >
      {/* Single unified extruded silhouette mesh: Group 0 = front canvas face, Group 1 = matched thin rim & back */}
      {tex && (
        <mesh geometry={card3d.geometry}>
          {mat.basic ? (
            <meshBasicMaterial
              attach="material-0"
              map={tex}
              transparent
              alphaTest={0.05}
              toneMapped={false}
            />
          ) : mat.toon && toonGrad ? (
            <meshToonMaterial
              attach="material-0"
              map={tex}
              gradientMap={toonGrad}
              transparent
              alphaTest={0.05}
            />
          ) : (
            <meshPhysicalMaterial
              attach="material-0"
              map={tex}
              transparent
              alphaTest={0.05}
              roughness={mat.roughness}
              metalness={mat.metalness}
              clearcoat={mat.clearcoat}
              clearcoatRoughness={0.22}
              emissive="#000000"
              emissiveIntensity={0}
            />
          )}

          <meshStandardMaterial
            attach="material-1"
            color={card3d.edgeColor}
            roughness={card3d.isPaper ? 0.88 : Math.max(0.28, mat.roughness)}
            metalness={state.theme === 'vinyl' ? 0.25 : mat.metalness}
          />
        </mesh>
      )}

      {/* Lego brick top-edge 3D studs (never obstruct cover art or title) */}
      {state.theme === 'lego' && state.bgStyle === 'none' && (
        <TopEdgeLegoStuds
          w={card3d.width}
          h={card3d.height}
          depth={card3d.depth}
          color={mixHex(state.color, '#ffffff', 0.14)}
        />
      )}

      <pointLight
        ref={spin}
        position={[1.4, 1.2, 2.4]}
        intensity={glossyAccent ? 5 : 0}
        color="#ffffff"
        distance={9}
      />
    </group>
  );
}

function PreviewGrab() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    setPreviewGrab(() => {
      gl.render(scene, camera);
      const src = gl.domElement;
      const out = document.createElement('canvas');
      out.width = src.width;
      out.height = src.height;
      const ctx = out.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(src, 0, 0);
      return out;
    });
    return () => setPreviewGrab(null);
  }, [gl, scene, camera]);
  return null;
}

export default function CardViewport({
  state,
  coverImg,
  tilt,
  dragging,
  fontEpoch,
  playback,
  getLivePlayback,
  onSize,
}: {
  state: CardState;
  coverImg: HTMLImageElement | null;
  tilt: TiltState | null;
  dragging: boolean;
  fontEpoch: number;
  playback?: PlaybackVisualState | null;
  getLivePlayback?: (() => PlaybackVisualState | null) | null;
  onSize?: (size: number, overflow: boolean) => void;
}) {
  const tex = useCardTexture(
    state,
    coverImg,
    fontEpoch,
    playback,
    getLivePlayback,
    onSize
  );
  const pose = asTilt(tilt);

  return (
    <Canvas
      dpr={[1, 2]}
      shadows={false}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.04, 6.55], fov: 28 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <ambientLight intensity={1.15} />
      <hemisphereLight args={['#ffffff', '#1a1a24', 0.55]} />
      <directionalLight position={[-2.8, 3.8, 5.6]} intensity={1.35} />
      <directionalLight position={[2.8, -1.0, 3.8]} intensity={0.45} color="#f6f7ff" />
      <spotLight position={[0, 3.4, 4.8]} angle={0.55} penumbra={0.85} intensity={0.9} />
      <CameraRig perspective={pose.perspective} />
      <PreviewGrab />
      <CardMesh state={state} tex={tex} tilt={tilt} dragging={dragging} />
      <ContactShadows
        key={`${state.layoutKey}-${state.theme}-${state.bgStyle}`}
        frames={1}
        resolution={256}
        position={[0, -1.55, 0]}
        opacity={0.38}
        scale={8.5}
        blur={2.4}
        far={4}
      />
    </Canvas>
  );
}
