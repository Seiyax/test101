import * as THREE from 'three';
import type { CardState, TiltState } from '../types';
import {
  alignTimelineToAudio,
  analyzePreview,
  estimatePreviewOffset,
  vocalEnvelopeFor,
  type PreviewAnalysis,
} from './audioAlign';
import {
  paintGlare,
  renderCard,
  type PlaybackVisualState,
} from './canvasRenderer';
import { buildExtrudedCardGeometry } from './cardShape3D';
import { LAYOUTS } from './constants';
import { ensureExportAssetsReady } from './exportEngine';
import {
  buildKaraokeTimeline,
  cardLines,
  computeKaraokeFrame,
  type VocalEnvelope,
} from './karaoke';
import { buildHomography, warpCard } from './perspective3D';
import { asTilt } from './tilt';

export interface VideoExportOptions {
  state: CardState;
  coverImg: HTMLImageElement | null;
  tilt: TiltState | null;
  previewUrl: string | null;
  anchorTimeSec: number;
  fullDuration: number;
  lineTimes: number[];
  previewOffset?: number | null;
  syncNudge?: number;
  previewAnalysis?: PreviewAnalysis | null;
  vocalEnvelope?: VocalEnvelope | null;
  clipDurationSec: number;
  motion3D?: boolean;
  onProgress?: (fraction: number, label: string) => void;
  signal?: AbortSignal;
}

export interface VideoExportResult {
  blob: Blob;
  ext: 'mp4' | 'webm';
  mime: string;
  hasAudio: boolean;
}

function pickVideoMime(hasAudio: boolean): {
  mime: string;
  ext: 'mp4' | 'webm';
} {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser.');
  }
  const candidates: { mime: string; ext: 'mp4' | 'webm' }[] = hasAudio
    ? [
        { mime: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', ext: 'mp4' },
        { mime: 'video/mp4;codecs=avc1,mp4a.40.2', ext: 'mp4' },
        { mime: 'video/mp4', ext: 'mp4' },
        { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
        { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
        { mime: 'video/webm', ext: 'webm' },
      ]
    : [
        { mime: 'video/mp4;codecs=avc1.42E01E', ext: 'mp4' },
        { mime: 'video/mp4', ext: 'mp4' },
        { mime: 'video/webm;codecs=vp9', ext: 'webm' },
        { mime: 'video/webm;codecs=vp8', ext: 'webm' },
        { mime: 'video/webm', ext: 'webm' },
      ];

  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c.mime)) {
      return c;
    }
  }
  return { mime: '', ext: 'webm' };
}

interface Offscreen3DRig {
  renderFrame: (pose: TiltState, texNeedsUpdate: boolean) => void;
  canvas: HTMLCanvasElement;
  dispose: () => void;
}

/**
 * Creates a dedicated offscreen Three.js WebGL renderer using the exact same
 * `buildExtrudedCardGeometry()` silhouette as `CardViewport.tsx` (Ticket notches,
 * Sticker peeled corner, Receipt zigzag, Stamp scallops, Filmstrip sprocket holes,
 * VIP Pass lanyard slot, thin edge-matched rim, zero backing slab).
 */
function createOffscreen3DRig(
  state: CardState,
  texCanvas: HTMLCanvasElement,
  outW: number,
  outH: number
): Offscreen3DRig | null {
  try {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(outW, outH, false);
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, outW / outH, 0.1, 100);
    const basePose = asTilt(null);
    const targetZ = THREE.MathUtils.clamp(
      6.55 + ((basePose.perspective - 1200) / 1800) * 2.25,
      4.6,
      8.8
    );
    camera.position.set(0, 0.04, targetZ);

    // Studio lighting identical to CardViewport
    scene.add(new THREE.AmbientLight('#ffffff', 1.15));
    scene.add(new THREE.HemisphereLight('#ffffff', '#1a1a24', 0.55));

    const dir1 = new THREE.DirectionalLight('#ffffff', 1.35);
    dir1.position.set(-2.8, 3.8, 5.6);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight('#f6f7ff', 0.45);
    dir2.position.set(2.8, -1.0, 3.8);
    scene.add(dir2);

    const spot = new THREE.SpotLight('#ffffff', 0.9);
    spot.position.set(0, 3.4, 4.8);
    spot.angle = 0.55;
    spot.penumbra = 0.85;
    scene.add(spot);

    const tex = new THREE.CanvasTexture(texCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    const pixel =
      state.theme === 'pixel' ||
      state.theme === 'pixelart' ||
      state.theme === 'gameboy' ||
      state.theme === 'ps2';
    tex.magFilter = pixel ? THREE.NearestFilter : THREE.LinearFilter;
    tex.minFilter = pixel
      ? THREE.NearestFilter
      : THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = !pixel;

    const card3d = buildExtrudedCardGeometry(
      state.layoutKey,
      state.theme,
      'none',
      state.cardDepth,
      state.color
    );

    const faceMat = new THREE.MeshPhysicalMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.05,
      roughness: card3d.isPaper ? 0.9 : 0.34,
      metalness: state.theme === 'vinyl' ? 0.2 : 0.08,
      clearcoat: card3d.isPaper ? 0 : 0.35,
      clearcoatRoughness: 0.22,
      emissive: new THREE.Color('#000000'),
      emissiveIntensity: 0,
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: card3d.edgeColor,
      roughness: card3d.isPaper ? 0.88 : 0.38,
      metalness: state.theme === 'vinyl' ? 0.25 : 0.08,
    });

    const mesh = new THREE.Mesh(card3d.geometry, [faceMat, rimMat]);
    const group = new THREE.Group();
    group.add(mesh);
    scene.add(group);

    return {
      canvas: renderer.domElement,
      renderFrame: (pose: TiltState, texNeedsUpdate: boolean) => {
        if (texNeedsUpdate) {
          tex.needsUpdate = true;
        }
        group.rotation.set(
          THREE.MathUtils.degToRad(pose.rx),
          THREE.MathUtils.degToRad(pose.ry),
          THREE.MathUtils.degToRad(pose.rz)
        );
        const camZ = THREE.MathUtils.clamp(
          6.55 + ((pose.perspective - 1200) / 1800) * 2.25,
          4.6,
          8.8
        );
        camera.position.z = camZ;
        renderer.render(scene, camera);
      },
      dispose: () => {
        card3d.geometry.dispose();
        faceMat.dispose();
        rimMat.dispose();
        tex.dispose();
        renderer.dispose();
      },
    };
  } catch {
    return null;
  }
}

/**
 * Records a high-definition animated lyric card video with synchronized audio playback,
 * real-time full-song progress bar, true 3D extruded silhouette geometry, and smooth
 * Spotify-style karaoke lyric highlighting locked to the AudioContext clock.
 */
export async function exportKaraokeVideo({
  state,
  coverImg,
  tilt,
  previewUrl,
  anchorTimeSec,
  fullDuration,
  lineTimes,
  previewOffset = null,
  syncNudge = 0,
  previewAnalysis = null,
  vocalEnvelope = null,
  clipDurationSec,
  motion3D = true,
  onProgress,
  signal,
}: VideoExportOptions): Promise<VideoExportResult> {
  onProgress?.(0.03, 'Preparing fonts & cover art…');
  const readyCover = await ensureExportAssetsReady(state, coverImg);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const layout = LAYOUTS[state.layoutKey];
  const outW = layout.w % 2 === 0 ? layout.w : layout.w + 1;
  const outH = layout.h % 2 === 0 ? layout.h : layout.h + 1;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize video recording canvas');

  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = layout.w;
  cardCanvas.height = layout.h;
  const cardCtx = cardCanvas.getContext('2d');
  if (!cardCtx) throw new Error('Could not initialize card texture canvas');

  // 1. Decode & align preview audio so vocals match the lyrics on the card
  let analysis: PreviewAnalysis | null = previewAnalysis;
  if (!analysis && previewUrl) {
    onProgress?.(0.08, 'Decoding & aligning song audio…');
    analysis = await analyzePreview(previewUrl, signal);
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  }

  let audioCtx: AudioContext | null = null;
  const audioBuffer = analysis?.buffer ?? null;
  if (audioBuffer && typeof window !== 'undefined') {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      try {
        audioCtx = new AudioCtx();
      } catch {
        audioCtx = null;
      }
    }
  }

  // 2. Build absolute word-by-word karaoke timeline for the card's lyrics
  const lines = cardLines(state.lyrics);
  const baseTimeline = buildKaraokeTimeline(lines, anchorTimeSec, lineTimes);
  const firstLineSongSec = baseTimeline.starts[0] ?? anchorTimeSec;
  const leadInSec = 0.45;
  const startSongSec = Math.max(0, firstLineSongSec - leadInSec);

  // Determine where inside the 30s preview clip the card's first lyric starts
  let resolvedOffset = previewOffset;
  if (resolvedOffset === null && analysis && lineTimes.length >= 2) {
    const est = estimatePreviewOffset(
      analysis,
      lineTimes,
      fullDuration || 211
    );
    if (est) resolvedOffset = est.offset;
  }

  let clipStartSec = 0;
  let activeVocalEnv: VocalEnvelope | null = vocalEnvelope;
  let effectiveSongOffset: number | null = null;
  if (analysis) {
    if (resolvedOffset !== null) {
      const effectiveOffset = resolvedOffset + syncNudge;
      effectiveSongOffset = effectiveOffset;
      const desiredClipPos = startSongSec - effectiveOffset;
      if (
        desiredClipPos >= 0 &&
        desiredClipPos < Math.max(1, analysis.duration - 2.5)
      ) {
        clipStartSec = desiredClipPos;
      }
      if (!activeVocalEnv) {
        activeVocalEnv = vocalEnvelopeFor(analysis, effectiveOffset);
      }
    } else {
      // Align clip start to the first vocal entry in the preview so vocal envelope & word onsets match
      clipStartSec = Math.max(0, analysis.firstVocalSec - leadInSec);
      effectiveSongOffset = firstLineSongSec - analysis.firstVocalSec;
      activeVocalEnv = vocalEnvelopeFor(analysis, effectiveSongOffset);
    }
  }

  const timeline = alignTimelineToAudio(
    baseTimeline,
    analysis,
    effectiveSongOffset
  );

  const maxClipAvail = audioBuffer
    ? Math.max(4, audioBuffer.duration - clipStartSec)
    : clipDurationSec;
  const totalDur = Math.max(4, Math.min(clipDurationSec, maxClipAvail));

  const lastLineEnd = timeline.ends[timeline.ends.length - 1] ?? startSongSec + totalDur;
  const resolvedSongDuration = Math.max(
    Math.round(fullDuration || 211),
    Math.ceil(Math.max(startSongSec + totalDur, lastLineEnd) + 5)
  );

  // Card texture state: always show progress bar, and never bake a rectangular backdrop slab onto the card mesh
  const videoCardState: CardState = {
    ...state,
    cardDepth: 0,
    bgStyle: 'none',
    hide: {
      ...state.hide,
      bar: false,
    },
  };

  // Initialize true extruded 3D silhouette renderer when 3D Float mode is active
  const rig3d = motion3D
    ? createOffscreen3DRig(state, cardCanvas, outW, outH)
    : null;

  const basePose = asTilt(tilt);

  const drawVideoFrame = (elapsedSec: number) => {
    // Locked to the exact same clock as the audio stream
    const songTimeSec = Math.min(
      resolvedSongDuration,
      startSongSec + elapsedSec
    );
    const karaoke = computeKaraokeFrame(timeline, songTimeSec, activeVocalEnv);
    const progress = Math.min(
      1,
      Math.max(0, songTimeSec / resolvedSongDuration)
    );

    const playback: PlaybackVisualState = {
      progress,
      currentTime: songTimeSec,
      duration: resolvedSongDuration,
      isPlaying: true,
      lineWeights: karaoke.lineWeights,
      activeParagraph: karaoke.activeParagraph,
      activeLineFill: karaoke.activeLineFill,
      wordFills: karaoke.wordFills,
      activeWordIndex: karaoke.activeWordIndex,
    };

    const wave = Math.sin(elapsedSec * 1.15);
    const wave2 = Math.cos(elapsedSec * 0.85);
    const pose: TiltState = {
      rx: (tilt?.rx ?? 8) + (motion3D ? wave * 3.4 : 0),
      ry: (tilt?.ry ?? -11) + (motion3D ? wave2 * 4.8 : 0),
      rz: (tilt?.rz ?? 0.6) + (motion3D ? wave * 0.65 : 0),
      perspective: basePose.perspective,
    };

    if (!motion3D) {
      ctx.clearRect(0, 0, outW, outH);
      const flatState: CardState = {
        ...state,
        hide: { ...state.hide, bar: false },
      };
      renderCard(ctx, flatState, layout, readyCover, pose, {
        fullBleed: true,
        flat: true,
        playback,
      });
      paintGlare(ctx, flatState, layout, pose, true);
      return;
    }

    // 1. Paint crisp 2D card face (with transparent outer area and dynamic glare) onto cardCanvas
    const zeroTilt: TiltState = { rx: 0, ry: 0, rz: 0, perspective: 1200 };
    cardCtx.clearRect(0, 0, layout.w, layout.h);
    renderCard(cardCtx, videoCardState, layout, readyCover, zeroTilt, {
      fullBleed: false,
      flat: true,
      playback,
    });
    paintGlare(cardCtx, videoCardState, layout, pose, true);

    // 2. Paint studio dark stage + breathing album-colored ambient glow
    ctx.save();
    ctx.fillStyle = '#0b0b0f';
    ctx.fillRect(0, 0, outW, outH);

    const pulse = 0.24 + 0.08 * Math.sin(elapsedSec * 2.4);
    const glowX = outW * (0.5 + 0.05 * wave2);
    const glowY = outH * (0.48 + 0.04 * wave);
    const rg = ctx.createRadialGradient(
      glowX,
      glowY,
      outW * 0.06,
      outW * 0.5,
      outH * 0.5,
      Math.max(outW, outH) * 0.68
    );
    const alphaHex = Math.round(pulse * 255)
      .toString(16)
      .padStart(2, '0');
    rg.addColorStop(0, `${state.color}${alphaHex}`);
    rg.addColorStop(0.55, `${state.color}18`);
    rg.addColorStop(1, 'rgba(11, 11, 15, 0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, outW, outH);

    // 3. Composite the true extruded 3D silhouette (or homography fallback if WebGL is unavailable)
    if (rig3d) {
      rig3d.renderFrame(pose, true);
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.62)';
      ctx.shadowBlur = 46;
      ctx.shadowOffsetY = 26;
      ctx.drawImage(rig3d.canvas, 0, Math.round(wave * 5));
      ctx.restore();
    } else {
      const d = pose.perspective * (layout.w / Math.round(layout.w * 0.55));
      const H = buildHomography(d, pose);
      const warped = warpCard(cardCanvas, H, 1, layout.w, layout.h);
      const dx = (outW - warped.width) * 0.5;
      const dy = (outH - warped.height) * 0.5 + wave * 5;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.62)';
      ctx.shadowBlur = 46;
      ctx.shadowOffsetY = 26;
      ctx.drawImage(warped, dx, dy);
      ctx.restore();
    }

    ctx.restore();
  };

  drawVideoFrame(0);

  const FPS = 30;
  const canvasStream = canvas.captureStream(FPS);
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  let sourceNode: AudioBufferSourceNode | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;

  if (audioCtx && audioBuffer) {
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume().catch(() => {});
    }
    audioDest = audioCtx.createMediaStreamDestination();
    const gainNode = audioCtx.createGain();
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(1.0, now + 0.3);
    gainNode.gain.setValueAtTime(1.0, now + Math.max(0.35, totalDur - 0.5));
    gainNode.gain.linearRampToValueAtTime(0.0001, now + totalDur);

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(gainNode);
    gainNode.connect(audioDest);

    const monitorGain = audioCtx.createGain();
    monitorGain.gain.setValueAtTime(0.65, now);
    gainNode.connect(monitorGain);
    monitorGain.connect(audioCtx.destination);

    combinedTracks.push(...audioDest.stream.getAudioTracks());
  }

  const combinedStream = new MediaStream(combinedTracks);
  const hasAudioTrack = Boolean(
    audioDest && audioDest.stream.getAudioTracks().length > 0
  );
  const { mime, ext } = pickVideoMime(hasAudioTrack);

  const recorder = new MediaRecorder(
    combinedStream,
    mime
      ? {
          mimeType: mime,
          videoBitsPerSecond: 6_500_000,
          ...(hasAudioTrack ? { audioBitsPerSecond: 128_000 } : {}),
        }
      : { videoBitsPerSecond: 6_500_000 }
  );

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return await new Promise<VideoExportResult>((resolve, reject) => {
    let rafId = 0;
    let timerId: ReturnType<typeof setInterval> | null = null;
    let finished = false;

    const cleanup = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearInterval(timerId);
      try {
        sourceNode?.stop();
      } catch {
        // ignore
      }
      for (const t of combinedStream.getTracks()) {
        try {
          t.stop();
        } catch {
          // ignore
        }
      }
      rig3d?.dispose();
      if (audioCtx) {
        void audioCtx.close().catch(() => {});
        audioCtx = null;
      }
    };

    const onAbort = () => {
      if (finished) return;
      finished = true;
      try {
        if (recorder.state !== 'inactive') recorder.stop();
      } catch {
        // ignore
      }
      cleanup();
      reject(new DOMException('Video export cancelled', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });

    recorder.onerror = () => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener('abort', onAbort);
      cleanup();
      reject(new Error('Video recorder encountered an error'));
    };

    recorder.onstop = () => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener('abort', onAbort);
      cleanup();
      const outMime = recorder.mimeType || mime || 'video/webm';
      const outExt: 'mp4' | 'webm' = outMime.includes('mp4') ? 'mp4' : ext;
      const blob = new Blob(chunks, { type: outMime });
      resolve({
        blob,
        ext: outExt,
        mime: outMime,
        hasAudio: hasAudioTrack,
      });
    };

    recorder.start(200);
    const startWallMs = performance.now();
    const startAudioSec = audioCtx ? audioCtx.currentTime : 0;
    if (sourceNode) {
      sourceNode.start(0, clipStartSec, totalDur);
    }

    const stepFrame = () => {
      if (finished) return;
      const elapsedSec = audioCtx
        ? Math.max(0, audioCtx.currentTime - startAudioSec)
        : (performance.now() - startWallMs) / 1000;

      if (elapsedSec >= totalDur) {
        drawVideoFrame(totalDur);
        onProgress?.(0.99, 'Finalizing video file…');
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        return;
      }

      drawVideoFrame(elapsedSec);
      const frac = Math.min(0.98, 0.1 + (elapsedSec / totalDur) * 0.88);
      const remain = Math.max(1, Math.ceil(totalDur - elapsedSec));
      onProgress?.(
        frac,
        hasAudioTrack
          ? `Recording 3D karaoke video + audio (${remain}s left)…`
          : `Recording 3D karaoke lyric video (${remain}s left)…`
      );
    };

    const loop = () => {
      if (finished) return;
      stepFrame();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    timerId = setInterval(stepFrame, Math.round(1000 / FPS));
  });
}
