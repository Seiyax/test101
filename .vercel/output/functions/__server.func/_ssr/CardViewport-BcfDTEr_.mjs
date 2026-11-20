import { i as __toESM } from "../_runtime.mjs";
import { A as require_react, S as Object3D, T as SRGBColorSpace, _ as MathUtils, c as CanvasTexture, g as LinearMipmapLinearFilter, h as LinearFilter, i as useThree, k as require_jsx_runtime, l as ClampToEdgeWrapping, n as Canvas, r as useFrame, t as ContactShadows, x as NearestFilter } from "../_libs/@react-three/drei+[...].mjs";
import { E as mixHex, _ as LAYOUTS, d as renderCard, n as asTilt, p as paintGlare } from "./routes-CXx4jU9H.mjs";
import { t as buildExtrudedCardGeometry } from "./cardShape3D-DcB5yYcJ.mjs";
import { u as setPreviewGrab } from "./exportEngine-CMjxzdEM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CardViewport-BcfDTEr_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function lookFor(theme) {
	switch (theme) {
		case "pixel":
		case "pixelart":
		case "gameboy": return {
			roughness: 1,
			metalness: 0,
			clearcoat: 0,
			nearest: true,
			toon: false,
			basic: true
		};
		case "chalkboard":
		case "notebook":
		case "newspaper":
		case "receipt":
		case "stamp":
		case "boarding":
		case "matchbook":
		case "risograph":
		case "waxseal":
		case "blueprint":
		case "swiss":
		case "vhs": return {
			roughness: .92,
			metalness: 0,
			clearcoat: 0,
			nearest: false,
			toon: false,
			basic: false
		};
		case "glowsketch":
		case "neon":
		case "cyberpunk":
		case "terminal": return {
			roughness: .36,
			metalness: .08,
			clearcoat: .3,
			nearest: false,
			toon: false,
			basic: false
		};
		case "ps2":
		case "floppy": return {
			roughness: .48,
			metalness: .14,
			clearcoat: .25,
			nearest: theme === "ps2",
			toon: false,
			basic: false
		};
		case "comic":
		case "comicart":
		case "brutalism":
		case "manga": return {
			roughness: .86,
			metalness: 0,
			clearcoat: 0,
			nearest: false,
			toon: true,
			basic: false
		};
		case "flatvector":
		case "sticker": return {
			roughness: 1,
			metalness: 0,
			clearcoat: 0,
			nearest: false,
			toon: false,
			basic: true
		};
		case "dankoe": return {
			roughness: .84,
			metalness: .02,
			clearcoat: .04,
			nearest: false,
			toon: false,
			basic: false
		};
		case "cgimotion":
		case "y2k":
		case "holo":
		case "aurora":
		case "plaque":
		case "tarot":
		case "frutiger":
		case "aqua":
		case "ipod":
		case "minidisc": return {
			roughness: .16,
			metalness: .42,
			clearcoat: .95,
			nearest: false,
			toon: false,
			basic: false
		};
		case "lego":
		case "clay": return {
			roughness: .26,
			metalness: .02,
			clearcoat: .6,
			nearest: false,
			toon: false,
			basic: false
		};
		case "zackd":
		case "filmstrip": return {
			roughness: .58,
			metalness: .14,
			clearcoat: .18,
			nearest: false,
			toon: false,
			basic: false
		};
		case "glass":
		case "cdcase":
		case "vippass": return {
			roughness: .08,
			metalness: .1,
			clearcoat: 1,
			nearest: false,
			toon: false,
			basic: false
		};
		case "vinyl": return {
			roughness: .34,
			metalness: .2,
			clearcoat: .45,
			nearest: false,
			toon: false,
			basic: false
		};
		default: return {
			roughness: .4,
			metalness: .06,
			clearcoat: .28,
			nearest: false,
			toon: false,
			basic: false
		};
	}
}
function useCardTexture(state, coverImg, fontEpoch, playback, getLivePlayback, onSize) {
	const holder = (0, import_react.useRef)(null);
	const [tex, setTex] = (0, import_react.useState)(null);
	const [codeEpoch, setCodeEpoch] = (0, import_react.useState)(0);
	const sizeRef = (0, import_react.useRef)(onSize);
	sizeRef.current = onSize;
	const stateRef = (0, import_react.useRef)(state);
	stateRef.current = state;
	const coverRef = (0, import_react.useRef)(coverImg);
	coverRef.current = coverImg;
	const { title, artist, lyrics, coverUrl, color, theme, layoutKey, coverShape, lyricFont, align, hlLine, glareStyle, glare, autoFit, lyricSize, trackId, hide } = state;
	const hideKey = `${hide.cover}|${hide.title}|${hide.artist}|${hide.logo}|${hide.bar}|${hide.code}`;
	const playbackKey = playback ? `${playback.isPlaying ? 1 : 0}|${!hide.bar ? `${playback.progress.toFixed(3)}|${playback.currentTime}|${playback.duration}` : "hidden"}` : "idle";
	const drawTextureFrame = (livePlayback) => {
		const slot = holder.current;
		if (!slot) return;
		const ctx = slot.canvas.getContext("2d");
		if (!ctx) return;
		const curState = stateRef.current;
		const layout = LAYOUTS[curState.layoutKey];
		try {
			const flat = {
				...curState,
				cardDepth: 0,
				bgStyle: "none"
			};
			const zeroTilt = {
				rx: 0,
				ry: 0,
				rz: 0,
				perspective: 1200
			};
			const info = renderCard(ctx, flat, layout, coverRef.current, zeroTilt, {
				flat: true,
				fullBleed: false,
				onCodeLoad: () => setCodeEpoch((n) => n + 1),
				playback: livePlayback ?? playback
			});
			paintGlare(ctx, flat, layout, zeroTilt, true);
			sizeRef.current?.(info.size, info.overflow);
		} catch (err) {
			console.error(err);
		}
		const pixel = curState.theme === "pixel" || curState.theme === "pixelart" || curState.theme === "gameboy" || curState.theme === "ps2";
		slot.tex.magFilter = pixel ? NearestFilter : LinearFilter;
		slot.tex.minFilter = pixel ? NearestFilter : LinearMipmapLinearFilter;
		slot.tex.generateMipmaps = !pixel;
		slot.tex.needsUpdate = true;
	};
	(0, import_react.useEffect)(() => {
		const layout = LAYOUTS[layoutKey];
		let slot = holder.current;
		if (!slot || slot.w !== layout.w || slot.h !== layout.h) {
			const canvas = document.createElement("canvas");
			canvas.width = layout.w;
			canvas.height = layout.h;
			const next = new CanvasTexture(canvas);
			next.colorSpace = SRGBColorSpace;
			next.anisotropy = 8;
			next.wrapS = ClampToEdgeWrapping;
			next.wrapT = ClampToEdgeWrapping;
			slot?.tex.dispose();
			slot = {
				canvas,
				tex: next,
				w: layout.w,
				h: layout.h
			};
			holder.current = slot;
			setTex(next);
		}
		drawTextureFrame(getLivePlayback?.() ?? playback);
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
		codeEpoch
	]);
	(0, import_react.useEffect)(() => {
		if (!playback?.isPlaying || !getLivePlayback) return;
		let rafId = 0;
		let lastDraw = 0;
		const tick = (now) => {
			if (now - lastDraw >= 16) {
				lastDraw = now;
				const live = getLivePlayback();
				if (live) drawTextureFrame(live);
			}
			rafId = requestAnimationFrame(tick);
		};
		rafId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(rafId);
	}, [playback?.isPlaying, getLivePlayback]);
	(0, import_react.useEffect)(() => () => holder.current?.tex.dispose(), []);
	return tex;
}
/**
* Top-edge 3D Lego brick studs aligned along the top rim (+Y) so they read unmistakably
* as a physical Lego brick without ever obstructing album art or song titles.
*/
function TopEdgeLegoStuds({ w, h, depth, color }) {
	const count = Math.max(4, Math.round(w / .38));
	const ref = (0, import_react.useRef)(null);
	const studR = Math.min(.055, depth * .42);
	const studH = .055;
	(0, import_react.useEffect)(() => {
		const mesh = ref.current;
		if (!mesh) return;
		const dummy = new Object3D();
		const y = h / 2 + studH / 2 - .005;
		for (let i = 0; i < count; i++) {
			const x = -w / 2 + .18 + (w - .36) * (i + .5) / count;
			dummy.position.set(x, y, 0);
			dummy.rotation.set(0, 0, 0);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
	}, [
		count,
		w,
		h,
		studH
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("instancedMesh", {
		ref,
		args: [
			void 0,
			void 0,
			count
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
			studR,
			studR * 1.04,
			studH,
			18
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
			color,
			roughness: .26,
			metalness: .02,
			clearcoat: .65
		})]
	});
}
/**
* Syncs `tilt.perspective` (wheel / 2-finger pinch zoom) to camera Z position.
*/
function CameraRig({ perspective }) {
	const camera = useThree((s) => s.camera);
	useFrame(() => {
		const targetZ = MathUtils.clamp(6.55 + (perspective - 1200) / 1800 * 2.25, 4.6, 8.8);
		camera.position.z = MathUtils.lerp(camera.position.z, targetZ, .16);
	});
	return null;
}
function CardMesh({ state, tex, tilt, dragging }) {
	const group = (0, import_react.useRef)(null);
	const spin = (0, import_react.useRef)(null);
	const pose = asTilt(tilt);
	const mat = lookFor(state.theme);
	const draggingRef = (0, import_react.useRef)(dragging);
	draggingRef.current = dragging;
	const card3d = (0, import_react.useMemo)(() => buildExtrudedCardGeometry(state.layoutKey, state.theme, state.bgStyle, state.cardDepth, state.color), [
		state.layoutKey,
		state.theme,
		state.bgStyle,
		state.cardDepth,
		state.color
	]);
	(0, import_react.useEffect)(() => () => card3d.geometry.dispose(), [card3d.geometry]);
	const toonGrad = (0, import_react.useMemo)(() => {
		const c = document.createElement("canvas");
		c.width = 4;
		c.height = 1;
		const g = c.getContext("2d");
		if (!g) return null;
		[
			"#555",
			"#999",
			"#d8d8d8",
			"#fff"
		].forEach((col, i) => {
			g.fillStyle = col;
			g.fillRect(i, 0, 1, 1);
		});
		const t = new CanvasTexture(c);
		t.magFilter = NearestFilter;
		t.minFilter = NearestFilter;
		t.colorSpace = "";
		return t;
	}, []);
	(0, import_react.useEffect)(() => () => toonGrad?.dispose(), [toonGrad]);
	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		if (group.current && !draggingRef.current) group.current.position.y = Math.sin(t * .85) * .025;
		else if (group.current) group.current.position.y = 0;
		if (spin.current && (state.theme === "cgimotion" || state.theme === "holo" || state.theme === "y2k" || state.theme === "vinyl")) {
			spin.current.position.x = Math.sin(t * .75) * 2.5;
			spin.current.position.y = 1 + Math.cos(t * .55) * .8;
		}
	});
	const glossyAccent = state.theme === "cgimotion" || state.theme === "holo" || state.theme === "y2k";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
		ref: group,
		rotation: [
			MathUtils.degToRad(pose.rx),
			MathUtils.degToRad(pose.ry),
			MathUtils.degToRad(pose.rz)
		],
		children: [
			tex && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
				geometry: card3d.geometry,
				children: [mat.basic ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
					attach: "material-0",
					map: tex,
					transparent: true,
					alphaTest: .05,
					toneMapped: false
				}) : mat.toon && toonGrad ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshToonMaterial", {
					attach: "material-0",
					map: tex,
					gradientMap: toonGrad,
					transparent: true,
					alphaTest: .05
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshPhysicalMaterial", {
					attach: "material-0",
					map: tex,
					transparent: true,
					alphaTest: .05,
					roughness: mat.roughness,
					metalness: mat.metalness,
					clearcoat: mat.clearcoat,
					clearcoatRoughness: .22,
					emissive: "#000000",
					emissiveIntensity: 0
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					attach: "material-1",
					color: card3d.edgeColor,
					roughness: card3d.isPaper ? .88 : Math.max(.28, mat.roughness),
					metalness: state.theme === "vinyl" ? .25 : mat.metalness
				})]
			}),
			state.theme === "lego" && state.bgStyle === "none" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopEdgeLegoStuds, {
				w: card3d.width,
				h: card3d.height,
				depth: card3d.depth,
				color: mixHex(state.color, "#ffffff", .14)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
				ref: spin,
				position: [
					1.4,
					1.2,
					2.4
				],
				intensity: glossyAccent ? 5 : 0,
				color: "#ffffff",
				distance: 9
			})
		]
	});
}
function PreviewGrab() {
	const gl = useThree((s) => s.gl);
	const scene = useThree((s) => s.scene);
	const camera = useThree((s) => s.camera);
	(0, import_react.useEffect)(() => {
		setPreviewGrab(() => {
			gl.render(scene, camera);
			const src = gl.domElement;
			const out = document.createElement("canvas");
			out.width = src.width;
			out.height = src.height;
			const ctx = out.getContext("2d");
			if (!ctx) return null;
			ctx.drawImage(src, 0, 0);
			return out;
		});
		return () => setPreviewGrab(null);
	}, [
		gl,
		scene,
		camera
	]);
	return null;
}
function CardViewport({ state, coverImg, tilt, dragging, fontEpoch, playback, getLivePlayback, onSize }) {
	const tex = useCardTexture(state, coverImg, fontEpoch, playback, getLivePlayback, onSize);
	const pose = asTilt(tilt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		dpr: [1, 2],
		shadows: false,
		gl: {
			antialias: true,
			alpha: true,
			powerPreference: "high-performance"
		},
		camera: {
			position: [
				0,
				.04,
				6.55
			],
			fov: 28
		},
		onCreated: ({ gl }) => {
			gl.setClearColor(0, 0);
			gl.toneMapping = 4;
			gl.toneMappingExposure = 1.08;
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: 1.15 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hemisphereLight", { args: [
				"#ffffff",
				"#1a1a24",
				.55
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					-2.8,
					3.8,
					5.6
				],
				intensity: 1.35
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				position: [
					2.8,
					-1,
					3.8
				],
				intensity: .45,
				color: "#f6f7ff"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("spotLight", {
				position: [
					0,
					3.4,
					4.8
				],
				angle: .55,
				penumbra: .85,
				intensity: .9
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, { perspective: pose.perspective }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewGrab, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardMesh, {
				state,
				tex,
				tilt,
				dragging
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactShadows, {
				frames: 1,
				resolution: 256,
				position: [
					0,
					-1.55,
					0
				],
				opacity: .38,
				scale: 8.5,
				blur: 2.4,
				far: 4
			}, `${state.layoutKey}-${state.theme}-${state.bgStyle}`)
		]
	});
}
//#endregion
export { CardViewport as default };
