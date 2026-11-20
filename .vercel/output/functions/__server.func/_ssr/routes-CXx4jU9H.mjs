import { i as __toESM } from "../_runtime.mjs";
import { A as require_react, k as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { A as Bookmark, D as ChevronDown, E as CircleHelp, M as AlignLeft, N as AlignRight, O as Check, P as AlignCenter, S as Link2, _ as Pause, a as Type, b as Minus, d as Share2, f as Search, g as Play, h as Plus, i as Undo2, l as Sparkles, m as Redo2, n as WandSparkles, p as RotateCcw, r as Volume2, s as Trash2, u as SlidersVertical, v as Palette, w as Download, x as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/colorUtils-CDsc_kAJ.js
function hexToRgb(hex) {
	let h = String(hex || "").trim().replace("#", "");
	if (h.length === 3) h = h.split("").map((c) => c + c).join("");
	return {
		r: parseInt(h.slice(0, 2), 16) || 0,
		g: parseInt(h.slice(2, 4), 16) || 0,
		b: parseInt(h.slice(4, 6), 16) || 0
	};
}
function rgba(hex, alpha) {
	const { r, g, b } = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
/** Perceived luminance 0-255 */
function luma(hex) {
	const { r, g, b } = hexToRgb(hex);
	return (r * 299 + g * 587 + b * 114) / 1e3;
}
/** Contrast text color (#000000 or #FFFFFF) */
function contrastColor(hex) {
	return luma(hex) > 150 ? "#000000" : "#FFFFFF";
}
/** Blend two #RRGGBB colors (t = 0 -> a, t = 1 -> b) */
function mixHex(a, b, t) {
	const A = hexToRgb(a);
	const B = hexToRgb(b);
	const f = (x, y) => Math.min(255, Math.max(0, Math.round(x + (y - x) * t)));
	return "#" + [
		f(A.r, B.r),
		f(A.g, B.g),
		f(A.b, B.b)
	].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
}
function rgb2hsl(r, g, b) {
	r /= 255;
	g /= 255;
	b /= 255;
	const mx = Math.max(r, g, b);
	const mn = Math.min(r, g, b);
	const l = (mx + mn) / 2;
	let h = 0;
	let sat = 0;
	if (mx !== mn) {
		const d = mx - mn;
		sat = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
		h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
		h /= 6;
	}
	return [
		h,
		sat,
		l
	];
}
function hsl2hex(h, sat, l) {
	const f = (p, q, t) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};
	const q = l < .5 ? l * (1 + sat) : l + sat - l * sat;
	const p = 2 * l - q;
	return "#" + [
		f(p, q, h + 1 / 3),
		f(p, q, h),
		f(p, q, h - 1 / 3)
	].map((v) => Math.min(255, Math.max(0, Math.round(v * 255))).toString(16).padStart(2, "0")).join("").toUpperCase();
}
/** Extract up to `max` vivid, distinct colors from a 32 x 32 sample */
function extractCoverColors(img, max = 5) {
	const S = 32;
	const c = document.createElement("canvas");
	c.width = c.height = S;
	const x = c.getContext("2d", { willReadFrequently: true });
	if (!x) return [];
	x.drawImage(img, 0, 0, S, S);
	const d = x.getImageData(0, 0, S, S).data;
	const buckets = /* @__PURE__ */ new Map();
	for (let i = 0; i < d.length; i += 4) {
		if (d[i + 3] < 200) continue;
		const r = d[i];
		const g = d[i + 1];
		const b = d[i + 2];
		const [, sat, l] = rgb2hsl(r, g, b);
		if (l < .12 || l > .9 || sat < .18) continue;
		const key = r >> 5 << 6 | g >> 5 << 3 | b >> 5;
		const e = buckets.get(key) || {
			n: 0,
			r: 0,
			g: 0,
			b: 0
		};
		e.n++;
		e.r += r;
		e.g += g;
		e.b += b;
		buckets.set(key, e);
	}
	const ranked = [...buckets.values()].map((e) => {
		const r = e.r / e.n;
		const g = e.g / e.n;
		const b = e.b / e.n;
		const [h, sat, l] = rgb2hsl(r, g, b);
		return {
			r,
			g,
			b,
			h,
			sat,
			l,
			score: e.n * (.35 + sat) * (1 - Math.abs(l - .5))
		};
	}).sort((a, b) => b.score - a.score);
	const picked = [];
	for (const c2 of ranked) {
		if (picked.every((o) => Math.hypot(o.r - c2.r, o.g - c2.g, o.b - c2.b) > 60)) picked.push(c2);
		if (picked.length >= max) break;
	}
	const hexes = picked.map((c2) => hsl2hex(c2.h, Math.min(.95, Math.max(.5, c2.sat)), Math.min(.55, Math.max(.32, c2.l))));
	return [...new Set(hexes)];
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CXx4jU9H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var rad = (deg) => deg * Math.PI / 180;
var themeRadius = (theme, baseRadius) => THEME_R[theme] !== void 0 ? THEME_R[theme] : baseRadius;
function getExtrusionVector(depth, tilt, fixed = false) {
	if (!(depth > 0)) return {
		dx: 0,
		dy: 0,
		len: 0,
		lit: 0
	};
	const rxDeg = tilt == null ? 0 : Number(tilt.rx) || 0;
	const ryDeg = tilt == null ? 0 : Number(tilt.ry) || 0;
	const rzDeg = tilt == null ? 0 : Number(tilt.rz) || 0;
	let dx;
	let dy;
	if (fixed) dx = dy = depth;
	else {
		const rx = rad(rxDeg);
		const ry = rad(ryDeg);
		const rz = rad(rzDeg);
		const sx = -Math.sin(ry) * 1 * depth * EXTRUDE_GAIN;
		const sy = Math.sin(rx) * Math.cos(ry) * depth * EXTRUDE_GAIN;
		dx = Math.cos(rz) * sx + Math.sin(rz) * sy;
		dy = -Math.sin(rz) * sx + Math.cos(rz) * sy;
	}
	dx = Math.round(dx * 100) / 100;
	dy = Math.round(dy * 100) / 100;
	const len = Math.hypot(dx, dy);
	const lit = len ? (dx * LIGHT_DIR.x + dy * LIGHT_DIR.y) / len : 0;
	return {
		dx,
		dy,
		len,
		lit
	};
}
function cardGeom(layoutKey, theme, cardDepth, bgStyle, tilt, fixedExtrude = false) {
	const L = LAYOUTS[layoutKey];
	const bx = bgStyle === "none" ? 0 : Math.round(Math.min(L.w, L.h) * .075);
	const [l0, t0, r0, b0] = THEME_INSET[theme] || [
		0,
		0,
		0,
		0
	];
	const l = l0 + bx;
	const t = t0 + bx;
	const r = r0 + bx;
	const b = b0 + bx;
	const aw = L.w - l - r;
	const ah = L.h - t - b;
	const v = getExtrusionVector(cardDepth, tilt, fixedExtrude);
	const ex = Math.abs(v.dx);
	const ey = Math.abs(v.dy);
	const s = Math.min(aw / (L.w + ex), ah / (L.h + ey));
	const w = L.w * s;
	const h = L.h * s;
	const totalW = w + ex * s;
	const totalH = h + ey * s;
	return {
		s,
		w,
		h,
		x: l + (aw - totalW) / 2 + (v.dx < 0 ? -v.dx * s : 0),
		y: t + (ah - totalH) / 2 + (v.dy < 0 ? -v.dy * s : 0),
		r: themeRadius(theme, L.radius) * s
	};
}
var rampCache = /* @__PURE__ */ new Map();
function getRamp(baseColor, wallColor, theme, v, n) {
	const glass = theme === "glass";
	const base = glass ? mixHex(baseColor, "#ffffff", .5) : wallColor;
	const key = `${base}|${v.lit.toFixed(2)}|${n}|${glass ? 1 : 0}`;
	let r = rampCache.get(key);
	if (r) return r;
	if (rampCache.size > 50) rampCache.clear();
	const near = v.lit >= 0 ? mixHex(base, "#ffffff", .1 + .3 * v.lit) : mixHex(base, "#000000", .05 - .1 * v.lit);
	const deep = mixHex(base, "#000000", (glass ? .2 : .4) + .25 * (1 - v.lit) / 2);
	r = [];
	for (let k = 0; k < n; k++) r.push(mixHex(near, deep, Math.pow((k + 1) / n, .85)));
	rampCache.set(key, r);
	return r;
}
var layerMemo = /* @__PURE__ */ new Map();
function getLayers(depth, tilt, baseColor, wallColor, theme, maxN, fixed = false) {
	const v = getExtrusionVector(depth, tilt, fixed);
	if (v.len < .5) return null;
	const n = Math.max(1, Math.min(maxN, Math.ceil(v.len)));
	const key = `${v.dx}|${v.dy}|${wallColor}|${theme}|${baseColor}|${n}`;
	let out = layerMemo.get(key);
	if (out) return out;
	if (layerMemo.size > 30) layerMemo.clear();
	const ramp = getRamp(baseColor, wallColor, theme, v, n);
	out = [];
	for (let i = n; i >= 1; i--) out.push({
		dx: v.dx * i / n,
		dy: v.dy * i / n,
		color: ramp[i - 1]
	});
	layerMemo.set(key, out);
	return out;
}
function roundedPath(g, x, y, w, h, r) {
	const rad = Math.max(0, Math.min(r, w / 2, h / 2));
	g.moveTo(x + rad, y);
	g.arcTo(x + w, y, x + w, y + h, rad);
	g.arcTo(x + w, y + h, x, y + h, rad);
	g.arcTo(x, y + h, x, y, rad);
	g.arcTo(x, y, x + w, y, rad);
	g.closePath();
}
function roundedRect(g, x, y, w, h, r) {
	g.beginPath();
	roundedPath(g, x, y, w, h, r);
}
var wallLayer = null;
function getWallLayer(w, h) {
	if (!wallLayer) wallLayer = document.createElement("canvas");
	if (wallLayer.width !== w || wallLayer.height !== h) {
		wallLayer.width = w;
		wallLayer.height = h;
	}
	return wallLayer;
}
function extrudeWalls(g, shape, depth, tilt, baseColor, wallColor, theme, b, fixed = false) {
	const v = getExtrusionVector(depth, tilt, fixed);
	if (v.len < .5) return;
	const glass = theme === "glass";
	const n = Math.max(1, Math.min(80, Math.ceil(v.len / (v.len > 40 ? 2 : 1))));
	const ramp = getRamp(baseColor, wallColor, theme, v, n);
	const clipOut = (c) => {
		c.beginPath();
		c.rect(-8192, -8192, 16384, 16384);
		shape(c, 0, 0);
		c.clip("evenodd");
	};
	let t = g;
	let layer = null;
	if (glass) {
		layer = getWallLayer(g.canvas.width, g.canvas.height);
		const layerCtx = layer.getContext("2d");
		if (layerCtx) {
			t = layerCtx;
			t.setTransform(1, 0, 0, 1, 0, 0);
			t.clearRect(0, 0, layer.width, layer.height);
			t.setTransform(g.getTransform());
		}
	}
	t.save();
	clipOut(t);
	for (let i = n; i >= 1; i--) {
		t.fillStyle = ramp[i - 1];
		t.beginPath();
		shape(t, v.dx * i / n, v.dy * i / n);
		t.fill();
	}
	if (b) {
		const cx = b.x + b.w / 2 + v.dx / 2;
		const cy = b.y + b.h / 2 + v.dy / 2;
		const hd = (Math.hypot(b.w, b.h) + v.len) / 2;
		const gr = t.createLinearGradient(cx + LIGHT_DIR.x * hd, cy + LIGHT_DIR.y * hd, cx - LIGHT_DIR.x * hd, cy - LIGHT_DIR.y * hd);
		gr.addColorStop(0, "rgba(255,255,255,0.20)");
		gr.addColorStop(.45, "rgba(255,255,255,0)");
		gr.addColorStop(.55, "rgba(0,0,0,0)");
		gr.addColorStop(1, "rgba(0,0,0,0.35)");
		t.fillStyle = gr;
		const stride = Math.max(2, Math.ceil(n / 12));
		for (let i = n; i >= 1; i -= stride) {
			t.beginPath();
			shape(t, v.dx * i / n, v.dy * i / n);
			t.fill();
		}
		t.beginPath();
		shape(t, v.dx, v.dy);
		t.fill();
	}
	t.restore();
	if (glass && layer) {
		g.save();
		g.setTransform(1, 0, 0, 1, 0, 0);
		g.globalAlpha *= .3;
		g.drawImage(layer, 0, 0);
		g.restore();
		g.save();
		clipOut(g);
		g.lineJoin = "round";
		g.strokeStyle = "rgba(255,255,255,0.8)";
		g.lineWidth = 2.5;
		g.beginPath();
		shape(g, v.dx, v.dy);
		g.stroke();
		g.strokeStyle = "rgba(255,255,255,0.4)";
		g.lineWidth = 1.5;
		g.beginPath();
		shape(g, 0, 0);
		g.stroke();
		g.restore();
	}
}
function cardFrame(layout, theme, hideInput) {
	const W = layout.w;
	const H = layout.h;
	const pad = layout.pad;
	const wide = W / H >= 1.3;
	const minSide = Math.min(W, H);
	const hideCover = typeof hideInput === "boolean" ? hideInput : Boolean(hideInput.cover);
	const hideTitle = typeof hideInput === "boolean" ? false : Boolean(hideInput.title);
	const hideArtist = typeof hideInput === "boolean" ? false : Boolean(hideInput.artist);
	const noHeader = hideCover && hideTitle && hideArtist;
	let leftPad = pad;
	let rightPad = pad;
	let topPad = pad;
	let bottomPad = pad;
	if (theme === "zackd") {
		const bar = Math.round(minSide * .055);
		topPad = Math.max(pad, bar + 38);
		bottomPad = Math.max(pad, bar + 34);
	} else if (theme === "pixel") topPad = Math.max(pad, 74);
	else if (theme === "pixelart") {
		const inset = Math.round(minSide * .088);
		leftPad = Math.max(pad, inset);
		rightPad = Math.max(pad, inset);
		topPad = Math.max(pad, inset);
		bottomPad = Math.max(pad, inset);
	} else if (theme === "chalkboard") {
		const m = Math.round(minSide * .035);
		leftPad = Math.max(pad, m + 36);
		rightPad = Math.max(pad, m + 36);
		topPad = Math.max(pad, m + 34);
		bottomPad = Math.max(pad, m + 42);
	} else if (theme === "gameboy") {
		leftPad = Math.max(pad, 68);
		rightPad = Math.max(pad, 68);
		topPad = Math.max(pad, 68);
		bottomPad = Math.max(pad, 68);
	} else if (theme === "cassette") {
		topPad = Math.max(pad, 72);
		bottomPad = Math.max(pad, 72);
	} else if (theme === "receipt") bottomPad = Math.max(pad, 78);
	else if (theme === "newspaper") topPad = Math.max(pad, 74);
	else if (theme === "polaroid") topPad = Math.max(pad, 68);
	else if (theme === "cdcase") {
		const spineW = Math.max(52, Math.round(W * .068));
		leftPad = Math.max(pad, spineW + 38);
		rightPad = Math.max(pad, 68);
	} else if (theme === "minidisc") topPad = Math.max(pad, 74);
	else if (theme === "floppy") {
		topPad = Math.max(pad, 92);
		leftPad = Math.max(pad, 68);
		rightPad = Math.max(pad, 68);
		bottomPad = Math.max(pad, 68);
	} else if (theme === "plaque") {
		leftPad = Math.max(pad, 72);
		rightPad = Math.max(pad, 72);
		topPad = Math.max(pad, 72);
		bottomPad = Math.max(pad, 72);
	} else if (theme === "vhs") {
		topPad = Math.max(pad, 76);
		rightPad = Math.max(pad, 72);
	} else if (theme === "stamp") {
		leftPad = Math.max(pad, 74);
		rightPad = Math.max(pad, 74);
		topPad = Math.max(pad, 74);
		bottomPad = Math.max(pad, 74);
	} else if (theme === "filmstrip") {
		const railW = Math.max(54, Math.round(W * .068));
		leftPad = Math.max(pad, railW + 32);
		rightPad = Math.max(pad, railW + 32);
	} else if (theme === "vippass") topPad = Math.max(pad, 92);
	else if (theme === "boarding") {
		topPad = Math.max(pad, 78);
		bottomPad = Math.max(pad, 80);
	} else if (theme === "matchbook") bottomPad = Math.max(pad, 84);
	else if (theme === "manga") rightPad = Math.max(pad, 78);
	else if (theme === "tarot") {
		topPad = Math.max(pad, 76);
		bottomPad = Math.max(pad, 72);
	} else if (theme === "ipod") {
		topPad = Math.max(pad, 92);
		leftPad = Math.max(pad, 68);
		rightPad = Math.max(pad, 68);
		bottomPad = Math.max(pad, 68);
	} else if (theme === "terminal" || theme === "aqua") topPad = Math.max(pad, 76);
	else if (theme === "swiss") {
		leftPad = Math.max(pad, 76);
		rightPad = Math.max(pad, 76);
	}
	let headerBlockH = layout.cover;
	if (noHeader) headerBlockH = 0;
	else if (hideCover) {
		const titleH = hideTitle ? 0 : layout.titleLine * 1.5;
		const artistH = hideArtist ? 0 : layout.artistLine;
		headerBlockH = Math.min(layout.cover, Math.max(48, Math.round(titleH + artistH)));
	}
	const ltop = noHeader ? topPad : topPad + headerBlockH + (hideCover ? Math.round(layout.lyricGap * .72) : layout.lyricGap);
	const f = {
		cx: leftPad,
		cy: topPad,
		cs: layout.cover,
		hx: leftPad + (hideCover ? 0 : layout.cover + layout.headGap),
		hy: topPad + headerBlockH / 2,
		hw: 0,
		top: false,
		lx: leftPad,
		x1: W - rightPad,
		y1: H - bottomPad,
		ltop,
		mid: layout.lyricMiddle,
		bx0: leftPad,
		fx: leftPad,
		stub: null
	};
	if (theme === "ticket") {
		if (wide) {
			const sw = Math.round(W * .2);
			f.stub = {
				v: true,
				at: W - sw,
				len: sw
			};
			f.x1 = W - sw - 44;
		} else {
			const sh = Math.round(H * .17);
			f.stub = {
				v: false,
				at: H - sh,
				len: sh
			};
			f.y1 = H - sh - 36;
		}
	}
	f.hw = Math.max(120, f.x1 - f.hx);
	return f;
}
function coverRadius(coverShape, theme, cs, defaultR) {
	if (coverShape === "square") return 0;
	if (coverShape === "rounded") return Math.round(cs * .16);
	if (coverShape === "circle") return cs / 2;
	return COVER_RADIUS[theme] !== void 0 ? COVER_RADIUS[theme] : defaultR;
}
var barUnit = (logoSize) => logoSize / 72 * .85;
var barSpace = (hideBar, logoSize) => hideBar ? 0 : Math.round(160 * barUnit(logoSize));
function footerSpace(hide, trackId, layout) {
	return !hide.logo || !hide.code && Boolean(trackId) ? layout.logo + layout.logoGap : 0;
}
var SIGNATURE_THEMES = [
	"pixelart",
	"chalkboard",
	"glowsketch",
	"ps2",
	"comicart",
	"flatvector",
	"dankoe",
	"cgimotion",
	"lego",
	"zackd"
];
var SIGNATURE = new Set(SIGNATURE_THEMES);
function isSignatureTheme(theme) {
	return SIGNATURE.has(theme);
}
var pass$1 = (color, dx = 0, dy = 0, main = true) => ({
	dx,
	dy,
	color,
	main
});
function applySignaturePalette(theme, P, bg) {
	if (!isSignatureTheme(theme)) return false;
	const ink = luma(bg) > 150 ? "#121212" : "#F8F6F0";
	switch (theme) {
		case "pixelart":
			P.surface = mixHex(bg, "#F4F1E1", .82);
			P.text = "#14161F";
			P.wall = "#181A24";
			P.passes = [pass$1("rgba(0,0,0,0.16)", 3, 3, false), pass$1("#14161F")];
			break;
		case "chalkboard":
			P.surface = mixHex("#18382B", bg, .16);
			P.text = "#F5F1E6";
			P.wall = "#4E3119";
			P.passes = [pass$1("rgba(245,241,230,0.22)", 1.5, 1, false), pass$1("#F5F1E6")];
			break;
		case "glowsketch": {
			const neon = luma(bg) < 95 ? mixHex(bg, "#ffffff", .45) : bg;
			P.surface = "#08080F";
			P.text = mixHex(neon, "#ffffff", .48);
			P.glow = neon;
			P.neon = neon;
			P.wall = "#05050A";
			P.passes = [pass$1(P.text)];
			break;
		}
		case "ps2":
			P.surface = "#0C1028";
			P.text = "#EDF7FF";
			P.glow = mixHex(bg, "#55B9FF", .55);
			P.neon = mixHex(bg, "#7CE0FF", .5);
			P.wall = "#060818";
			P.passes = [pass$1("#EDF7FF")];
			break;
		case "comicart":
			P.surface = "#FFF6D6";
			P.text = "#141414";
			P.wall = "#111111";
			P.passes = [pass$1(rgba(mixHex(bg, "#FF2D55", .35), .45), 4, 4, false), pass$1("#141414")];
			break;
		case "flatvector":
			P.surface = bg;
			P.text = ink;
			P.wall = mixHex(bg, "#000000", .28);
			P.passes = [pass$1(ink)];
			break;
		case "dankoe":
			P.surface = "#0E0E0F";
			P.text = "#F2EFE8";
			P.neon = bg;
			P.wall = "#080809";
			P.passes = [pass$1("#F2EFE8")];
			break;
		case "cgimotion":
			P.surface = "#070910";
			P.text = "#F5F8FF";
			P.glow = mixHex(bg, "#5CE1FF", .4);
			P.wall = "#05060C";
			P.passes = [pass$1("#F5F8FF")];
			break;
		case "lego": {
			const plastic = mixHex(bg, "#ffffff", .08);
			P.surface = plastic;
			P.text = luma(plastic) > 152 ? "#161616" : "#FFFDF8";
			P.wall = mixHex(plastic, "#000000", .24);
			P.passes = [pass$1(luma(plastic) > 152 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.28)", 0, 2.5, false), pass$1(P.text)];
			break;
		}
		case "zackd":
			P.surface = "#0A0B0D";
			P.text = "#FFFFFF";
			P.neon = "#FFE14A";
			P.wall = "#050506";
			P.passes = [pass$1("rgba(0,0,0,0.55)", 0, 3, false), pass$1("#FFFFFF")];
			break;
		default: return false;
	}
	return true;
}
function rr(g, x, y, w, h, r) {
	const rad = Math.max(0, Math.min(r, w / 2, h / 2));
	g.beginPath();
	g.moveTo(x + rad, y);
	g.arcTo(x + w, y, x + w, y + h, rad);
	g.arcTo(x + w, y + h, x, y + h, rad);
	g.arcTo(x, y + h, x, y, rad);
	g.arcTo(x, y, x + w, y, rad);
	g.closePath();
}
function paintSignatureBody(g, state, layout, P) {
	if (!isSignatureTheme(state.theme)) return false;
	const { w: W, h: H } = layout;
	const bg = state.color;
	const theme = state.theme;
	const minSide = Math.min(W, H);
	if (theme === "pixelart") {
		const px = Math.max(8, Math.round(minSide / 88));
		const frame = px * 4;
		const titleH = px * 5;
		g.fillStyle = "#14161F";
		g.fillRect(0, 0, W, H);
		const cA = mixHex(bg, "#000000", .25);
		const cB = mixHex(bg, "#ffffff", .28);
		for (let y = px; y < H - px; y += px) for (let x = px; x < W - px; x += px) {
			if (x >= frame && x < W - frame && y >= frame + titleH - px && y < H - frame) continue;
			g.fillStyle = (Math.floor(x / px) + Math.floor(y / px)) % 2 === 0 ? cA : cB;
			g.fillRect(x, y, px, px);
		}
		g.fillStyle = mixHex(bg, "#000000", .15);
		g.fillRect(frame - px, px * 2, W - (frame - px) * 2, titleH - px);
		g.fillStyle = "#14161F";
		g.fillRect(frame - px, px * 2 + titleH - px, W - (frame - px) * 2, px);
		for (let i = 0; i < 3; i++) {
			g.fillStyle = i === 0 ? "#FF5F56" : i === 1 ? "#FFBD2E" : "#27C93F";
			g.fillRect(W - frame - px * (2 + i * 3), px * 3, px * 2, px * 2);
		}
		const ix = frame;
		const iy = frame + titleH - px;
		const iw = W - frame * 2;
		const ih = H - iy - frame;
		g.fillStyle = P.surface;
		g.fillRect(ix, iy, iw, ih);
		g.fillStyle = "rgba(255,255,255,0.65)";
		g.fillRect(ix, iy, iw, px);
		g.fillRect(ix, iy, px, ih);
		g.fillStyle = "rgba(20,22,31,0.16)";
		g.fillRect(ix, iy + ih - px, iw, px);
		g.fillRect(ix + iw - px, iy, px, ih);
		g.strokeStyle = "#14161F";
		g.lineWidth = px;
		g.strokeRect(ix - px / 2, iy - px / 2, iw + px, ih + px);
		return true;
	}
	if (theme === "chalkboard") {
		const m = Math.round(minSide * .036);
		const wood = g.createLinearGradient(0, 0, W, H);
		wood.addColorStop(0, "#7B4E2B");
		wood.addColorStop(.5, "#5B361B");
		wood.addColorStop(1, "#3D2310");
		g.fillStyle = wood;
		g.fillRect(0, 0, W, H);
		g.strokeStyle = "rgba(0,0,0,0.18)";
		g.lineWidth = 2;
		for (let i = 6; i < m; i += 8) g.strokeRect(i, i, W - i * 2, H - i * 2);
		g.fillStyle = P.surface;
		rr(g, m, m, W - m * 2, H - m * 2, 8);
		g.fill();
		g.save();
		rr(g, m, m, W - m * 2, H - m * 2, 8);
		g.clip();
		for (const [cx, cy, r, a] of [
			[
				.24,
				.34,
				.36,
				.06
			],
			[
				.74,
				.58,
				.42,
				.055
			],
			[
				.48,
				.82,
				.34,
				.05
			],
			[
				.65,
				.22,
				.28,
				.045
			]
		]) {
			const smudge = g.createRadialGradient(W * cx, H * cy, 10, W * cx, H * cy, minSide * r);
			smudge.addColorStop(0, `rgba(245,241,230,${a})`);
			smudge.addColorStop(1, "rgba(245,241,230,0)");
			g.fillStyle = smudge;
			g.fillRect(m, m, W - m * 2, H - m * 2);
		}
		g.fillStyle = "rgba(245,241,230,0.14)";
		for (let i = 0; i < 160; i++) {
			const x = m + (i * 137 + 29) % Math.max(1, W - m * 2);
			const y = m + (i * 89 + 17) % Math.max(1, H - m * 2);
			g.fillRect(x, y, i % 3 + 1, 1.2);
		}
		g.strokeStyle = "rgba(0,0,0,0.45)";
		g.lineWidth = 10;
		rr(g, m, m, W - m * 2, H - m * 2, 8);
		g.stroke();
		g.restore();
		const ledgeH = Math.max(12, Math.round(m * .42));
		g.fillStyle = "#4B2C16";
		g.fillRect(m + 24, H - m - ledgeH + 2, W - m * 2 - 48, ledgeH);
		g.fillStyle = "rgba(255,255,255,0.12)";
		g.fillRect(m + 24, H - m - ledgeH + 2, W - m * 2 - 48, 2);
		g.fillStyle = "#F5F1E6";
		rr(g, W - m - 140, H - m - ledgeH - 7, 56, 9, 3);
		g.fill();
		g.fillStyle = "#FFE38A";
		rr(g, W - m - 74, H - m - ledgeH - 6, 38, 8, 3);
		g.fill();
		return true;
	}
	if (theme === "glowsketch") {
		g.fillStyle = "#08080F";
		g.fillRect(0, 0, W, H);
		const neon = P.neon || bg;
		g.save();
		const glow = g.createRadialGradient(W * .5, H * .52, 20, W * .5, H * .52, Math.max(W, H) * .55);
		glow.addColorStop(0, rgba(neon, .22));
		glow.addColorStop(.6, rgba(neon, .06));
		glow.addColorStop(1, "rgba(0,0,0,0)");
		g.fillStyle = glow;
		g.fillRect(0, 0, W, H);
		g.lineJoin = "round";
		g.lineCap = "round";
		g.shadowColor = neon;
		for (let i = 0; i < 3; i++) {
			g.shadowBlur = 18 - i * 4;
			g.strokeStyle = i === 2 ? mixHex(neon, "#ffffff", .65) : neon;
			g.globalAlpha = i === 2 ? .85 : .34;
			g.lineWidth = i === 2 ? 2.2 : 4.5 - i;
			const off = 22 + i * 3.5;
			rr(g, off + (i % 2 ? 2 : -1), off + (i % 2 ? -1 : 2), W - off * 2, H - off * 2, 24);
			g.stroke();
		}
		const sx = W - 46;
		const sy = 46;
		g.globalAlpha = .85;
		g.shadowBlur = 14;
		g.strokeStyle = mixHex(neon, "#ffffff", .5);
		g.lineWidth = 2.5;
		g.beginPath();
		g.moveTo(sx - 12, sy);
		g.lineTo(sx + 12, sy);
		g.moveTo(sx, 34);
		g.lineTo(sx, 58);
		g.moveTo(sx - 7, 39);
		g.lineTo(sx + 7, 53);
		g.moveTo(sx + 7, 39);
		g.lineTo(sx - 7, 53);
		g.stroke();
		g.restore();
		return true;
	}
	if (theme === "ps2") {
		const sky = g.createLinearGradient(0, 0, W * .25, H);
		sky.addColorStop(0, "#070D28");
		sky.addColorStop(.45, mixHex("#0E1E54", bg, .22));
		sky.addColorStop(1, "#040614");
		g.fillStyle = sky;
		g.fillRect(0, 0, W, H);
		const aura = g.createRadialGradient(W * .52, H * .48, 10, W * .52, H * .48, Math.max(W, H) * .62);
		aura.addColorStop(0, rgba(mixHex(bg, "#33A1FF", .65), .34));
		aura.addColorStop(.55, "rgba(30,72,210,0.14)");
		aura.addColorStop(1, "rgba(0,0,0,0)");
		g.fillStyle = aura;
		g.fillRect(0, 0, W, H);
		g.save();
		for (const [tx, ty, tw, th] of [
			[
				.09,
				.72,
				.065,
				.34
			],
			[
				.21,
				.64,
				.055,
				.42
			],
			[
				.37,
				.76,
				.05,
				.28
			],
			[
				.64,
				.68,
				.06,
				.36
			],
			[
				.79,
				.56,
				.07,
				.48
			],
			[
				.9,
				.7,
				.055,
				.35
			]
		]) {
			const bx = W * tx;
			const by = H * ty;
			const bw = W * tw;
			const bh = H * th;
			const colGrad = g.createLinearGradient(bx, by, bx, by + bh);
			colGrad.addColorStop(0, "rgba(130,210,255,0.22)");
			colGrad.addColorStop(.5, "rgba(55,115,235,0.10)");
			colGrad.addColorStop(1, "rgba(10,16,52,0)");
			g.fillStyle = colGrad;
			g.fillRect(bx, by, bw, bh);
			g.fillStyle = "rgba(200,238,255,0.28)";
			g.beginPath();
			g.moveTo(bx, by);
			g.lineTo(bx + bw * .5, by - bw * .26);
			g.lineTo(bx + bw, by);
			g.lineTo(bx + bw * .5, by + bw * .26);
			g.closePath();
			g.fill();
		}
		for (const [ox, oy, or] of [
			[
				.84,
				.16,
				18
			],
			[
				.88,
				.22,
				10
			],
			[
				.14,
				.86,
				14
			]
		]) {
			const orb = g.createRadialGradient(W * ox, H * oy, 0, W * ox, H * oy, or * 2.2);
			orb.addColorStop(0, "rgba(220,246,255,0.85)");
			orb.addColorStop(.4, "rgba(90,190,255,0.35)");
			orb.addColorStop(1, "rgba(90,190,255,0)");
			g.fillStyle = orb;
			g.fillRect(W * ox - or * 2.5, H * oy - or * 2.5, or * 5, or * 5);
		}
		const c = 26;
		g.strokeStyle = "rgba(170,224,255,0.26)";
		g.lineWidth = 2;
		g.strokeRect(c, c, W - 52, H - 52);
		g.strokeStyle = "rgba(200,238,255,0.82)";
		g.lineWidth = 4;
		const L = 34;
		for (const [x, y, sx, sy] of [
			[
				c,
				c,
				1,
				1
			],
			[
				W - c,
				c,
				-1,
				1
			],
			[
				c,
				H - c,
				1,
				-1
			],
			[
				W - c,
				H - c,
				-1,
				-1
			]
		]) {
			g.beginPath();
			g.moveTo(x, y + sy * L);
			g.lineTo(x, y);
			g.lineTo(x + sx * L, y);
			g.stroke();
		}
		g.restore();
		return true;
	}
	if (theme === "comicart") {
		if (state.cardDepth === 0) {
			g.fillStyle = "#111111";
			g.fillRect(10, 12, W, H);
		}
		g.fillStyle = "#FFF6D6";
		g.fillRect(0, 0, W, H);
		g.save();
		g.beginPath();
		g.rect(0, 0, W, H);
		g.clip();
		g.fillStyle = rgba(mixHex(bg, "#FF2D55", .35), .32);
		const step = 22;
		const cx0 = W * .5;
		const cy0 = H * .5;
		const maxD = Math.hypot(cx0, cy0);
		for (let y = 12; y < H; y += step) for (let x = (y / step % 2 ? step / 2 : 0) + 10; x < W; x += step) {
			const d = Math.hypot(x - cx0, y - cy0) / maxD;
			if (d < .56) continue;
			const r = Math.min(5.5, (d - .52) * 11);
			g.beginPath();
			g.arc(x, y, r, 0, Math.PI * 2);
			g.fill();
		}
		g.strokeStyle = "rgba(17,17,17,0.12)";
		g.lineWidth = 2.5;
		for (let i = 0; i < 8; i++) {
			g.beginPath();
			g.moveTo(W - 220 + i * 28, H + 10);
			g.lineTo(W + 10, H - 220 + i * 28);
			g.stroke();
		}
		g.fillStyle = "#FFE14A";
		g.strokeStyle = "#111111";
		g.lineWidth = 5;
		g.lineJoin = "miter";
		g.beginPath();
		const sx = W - 46;
		const sy = 46;
		for (let i = 0; i < 16; i++) {
			const a = i / 16 * Math.PI * 2;
			const rad = i % 2 ? 15 : 32;
			g[i ? "lineTo" : "moveTo"](sx + Math.cos(a) * rad, sy + Math.sin(a) * rad);
		}
		g.closePath();
		g.fill();
		g.stroke();
		g.restore();
		g.strokeStyle = "#111111";
		g.lineWidth = 12;
		g.strokeRect(6, 6, W - 12, H - 12);
		g.strokeStyle = "#111111";
		g.lineWidth = 2;
		g.strokeRect(20, 20, W - 40, H - 40);
		return true;
	}
	if (theme === "flatvector") {
		const lightTint = mixHex(bg, "#ffffff", .22);
		const darkTint = mixHex(bg, "#000000", .16);
		const accent = mixHex(bg, "#000000", .34);
		g.fillStyle = bg;
		g.fillRect(0, 0, W, H);
		g.fillStyle = lightTint;
		g.beginPath();
		g.arc(W, 0, minSide * .34, 0, Math.PI * 2);
		g.fill();
		g.fillStyle = darkTint;
		g.beginPath();
		g.arc(W * .96, H * 1.02, minSide * .44, 0, Math.PI * 2);
		g.fill();
		const stripeW = Math.max(18, Math.round(W * .022));
		g.fillStyle = accent;
		g.fillRect(0, 0, stripeW, H * .42);
		g.fillStyle = lightTint;
		g.fillRect(0, H * .42, stripeW, H * .18);
		g.fillStyle = luma(bg) > 150 ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.28)";
		g.beginPath();
		g.arc(W - 44, H - 44, 14, 0, Math.PI * 2);
		g.fill();
		return true;
	}
	if (theme === "dankoe") {
		g.fillStyle = "#0E0E0F";
		g.fillRect(0, 0, W, H);
		const eg = g.createLinearGradient(0, 0, W, H);
		eg.addColorStop(0, "rgba(255,255,255,0.03)");
		eg.addColorStop(.5, "rgba(0,0,0,0)");
		eg.addColorStop(1, "rgba(0,0,0,0.22)");
		g.fillStyle = eg;
		g.fillRect(0, 0, W, H);
		g.fillStyle = bg;
		g.fillRect(0, 0, Math.max(8, Math.round(minSide * .01)), H);
		g.strokeStyle = "rgba(242,239,232,0.10)";
		g.lineWidth = 1.5;
		g.strokeRect(24, 24, W - 48, H - 48);
		const f = cardFrame(layout, theme, state.hide);
		if (!(state.hide.cover && state.hide.title && state.hide.artist)) {
			const ruleY = Math.round(f.ltop - layout.lyricGap * .5);
			g.fillStyle = "rgba(242,239,232,0.26)";
			g.fillRect(f.lx, ruleY, f.x1 - f.lx, 1.5);
			g.fillStyle = bg;
			g.fillRect(f.lx, ruleY - .5, Math.min(84, (f.x1 - f.lx) * .16), 2.5);
		}
		return true;
	}
	if (theme === "cgimotion") {
		g.fillStyle = "#06080F";
		g.fillRect(0, 0, W, H);
		g.save();
		const streaks = 8;
		for (let i = 0; i < streaks; i++) {
			g.save();
			g.translate(W * .5, H * (.12 + i * .11));
			g.rotate(-.42);
			const span = Math.max(W, H) * 1.1;
			const grd = g.createLinearGradient(-span, 0, span, 0);
			const tint = mixHex(bg, i % 2 === 0 ? "#00E5FF" : "#FF4FD8", .45);
			grd.addColorStop(0, "rgba(0,0,0,0)");
			grd.addColorStop(.32, rgba(tint, .16));
			grd.addColorStop(.5, rgba(mixHex(tint, "#ffffff", .45), .48));
			grd.addColorStop(.68, rgba(tint, .16));
			grd.addColorStop(1, "rgba(0,0,0,0)");
			g.fillStyle = grd;
			g.fillRect(-span, -6, span * 2, 7 + i % 3 * 5);
			g.restore();
		}
		const spec = g.createRadialGradient(W * .22, H * .16, 10, W * .22, H * .16, W * .55);
		spec.addColorStop(0, "rgba(255,255,255,0.22)");
		spec.addColorStop(.5, rgba(bg, .1));
		spec.addColorStop(1, "rgba(255,255,255,0)");
		g.fillStyle = spec;
		g.fillRect(0, 0, W, H);
		const rim = g.createLinearGradient(0, 0, W, H);
		rim.addColorStop(0, "rgba(255,255,255,0.75)");
		rim.addColorStop(.45, rgba(mixHex(bg, "#00E5FF", .4), .55));
		rim.addColorStop(1, "rgba(255,255,255,0.22)");
		g.strokeStyle = rim;
		g.lineWidth = 2.5;
		rr(g, 16, 16, W - 32, H - 32, 18);
		g.stroke();
		g.restore();
		return true;
	}
	if (theme === "lego") {
		const plastic = P.surface;
		const lip = mixHex(plastic, "#000000", .2);
		const hi = mixHex(plastic, "#ffffff", .34);
		const sh = mixHex(plastic, "#000000", .18);
		g.fillStyle = lip;
		g.fillRect(0, 0, W, H);
		const m = Math.round(minSide * .024);
		g.fillStyle = plastic;
		rr(g, m, m, W - m * 2, H - m * 2, 12);
		g.fill();
		g.save();
		rr(g, m, m, W - m * 2, H - m * 2, 12);
		g.clip();
		const step = Math.max(76, Math.round(minSide / 10));
		const sr = Math.round(step * .27);
		const offsetX = (W - m * 2) % step / 2 + m + step / 2;
		const offsetY = (H - m * 2) % step / 2 + m + step / 2;
		for (let y = offsetY; y < H - m; y += step) for (let x = offsetX; x < W - m; x += step) {
			g.fillStyle = rgba(sh, .32);
			g.beginPath();
			g.arc(x + 4, y + 5, sr, 0, Math.PI * 2);
			g.fill();
			g.fillStyle = mixHex(plastic, "#ffffff", .05);
			g.beginPath();
			g.arc(x, y, sr, 0, Math.PI * 2);
			g.fill();
			g.strokeStyle = rgba(hi, .45);
			g.lineWidth = 2.5;
			g.beginPath();
			g.arc(x, y, sr - 1.5, Math.PI * .9, Math.PI * 1.75);
			g.stroke();
		}
		const gloss = g.createLinearGradient(0, 0, 0, H * .45);
		gloss.addColorStop(0, "rgba(255,255,255,0.16)");
		gloss.addColorStop(1, "rgba(255,255,255,0)");
		g.fillStyle = gloss;
		g.fillRect(m, m, W - m * 2, H - m * 2);
		g.restore();
		g.strokeStyle = rgba(hi, .45);
		g.lineWidth = 3;
		rr(g, m + 1.5, m + 1.5, W - m * 2 - 3, H - m * 2 - 3, 10);
		g.stroke();
		return true;
	}
	if (theme === "zackd") {
		g.fillStyle = "#0A0B0D";
		g.fillRect(0, 0, W, H);
		const bar = Math.round(minSide * .055);
		const spot = g.createRadialGradient(W * .5, H * .48, 20, W * .5, H * .48, Math.max(W, H) * .65);
		spot.addColorStop(0, rgba(mixHex(bg, "#ffffff", .1), .14));
		spot.addColorStop(1, "rgba(0,0,0,0.45)");
		g.fillStyle = spot;
		g.fillRect(0, bar, W, H - bar * 2);
		g.fillStyle = "#000000";
		g.fillRect(0, 0, W, bar);
		g.fillRect(0, H - bar, W, bar);
		g.fillStyle = "#FFE14A";
		g.fillRect(0, H - bar - 4, W, 4);
		const midTop = Math.round(bar / 2);
		g.fillStyle = "#FF3333";
		g.beginPath();
		g.arc(layout.pad + 8, midTop, 6, 0, Math.PI * 2);
		g.fill();
		g.fillStyle = "rgba(255,255,255,0.72)";
		g.font = `600 ${Math.max(14, Math.round(bar * .34))}px 'Courier New', monospace`;
		g.textBaseline = "middle";
		g.textAlign = "left";
		g.fillText("REC", layout.pad + 22, midTop + 1);
		g.textAlign = "right";
		g.fillStyle = "rgba(255,225,74,0.85)";
		g.fillText("24FPS · 16:9", W - layout.pad, midTop + 1);
		g.textAlign = "left";
		g.textBaseline = "alphabetic";
		return true;
	}
	return false;
}
function overlaySignature(g, theme, layout) {
	if (theme !== "ps2" && theme !== "zackd" && theme !== "chalkboard" && theme !== "dankoe") return;
	const { w: W, h: H } = layout;
	g.save();
	if (theme === "ps2") {
		g.fillStyle = "rgba(0,0,0,0.16)";
		for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1);
	} else if (theme === "zackd") {
		g.globalAlpha = .14;
		for (let i = 0; i < 14; i++) {
			const x = (i * 173 + 41) % W;
			g.fillStyle = i % 3 === 0 ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)";
			g.fillRect(x, 0, 1, H);
		}
	} else if (theme === "chalkboard") {
		const dust = g.createRadialGradient(W * .5, H * .5, Math.min(W, H) * .25, W * .5, H * .5, Math.max(W, H) * .72);
		dust.addColorStop(0, "rgba(245,241,230,0.03)");
		dust.addColorStop(1, "rgba(0,0,0,0.18)");
		g.fillStyle = dust;
		g.fillRect(0, 0, W, H);
	} else if (theme === "dankoe") {
		g.fillStyle = "rgba(255,255,255,0.025)";
		for (let i = 0; i < 180; i++) g.fillRect(i * 197 % W, i * 113 % H, 1.5, 1.5);
	}
	g.restore();
}
var LAYOUTS = {
	square: {
		label: "Classic Square · 1:1",
		w: 1024,
		h: 1024,
		radius: 48,
		pad: 80,
		cover: 120,
		coverR: 12,
		headGap: 36,
		logo: 72,
		wordmark: 52,
		logoGap: 36,
		lyricGap: 64,
		lyricMin: 24,
		lyricMax: 120,
		lyricMiddle: false,
		titleSize: 38,
		titleLine: 46,
		artistSize: 30,
		artistLine: 40,
		preview: [
			560,
			480,
			420
		]
	},
	wide: {
		label: "Cinematic Wide · 16:9",
		w: 1280,
		h: 720,
		radius: 40,
		pad: 64,
		cover: 160,
		coverR: 12,
		headGap: 32,
		logo: 52,
		wordmark: 38,
		logoGap: 24,
		lyricGap: 36,
		lyricMin: 20,
		lyricMax: 120,
		lyricMiddle: true,
		titleSize: 44,
		titleLine: 52,
		artistSize: 30,
		artistLine: 40,
		preview: [
			880,
			720,
			560
		]
	},
	story: {
		label: "Story · 9:16",
		w: 720,
		h: 1280,
		radius: 44,
		pad: 64,
		cover: 128,
		coverR: 12,
		headGap: 28,
		logo: 60,
		wordmark: 42,
		logoGap: 28,
		lyricGap: 48,
		lyricMin: 22,
		lyricMax: 120,
		lyricMiddle: true,
		titleSize: 36,
		titleLine: 44,
		artistSize: 28,
		artistLine: 36,
		preview: [
			400,
			360,
			300
		]
	},
	portrait: {
		label: "Portrait · 4:5",
		w: 1024,
		h: 1280,
		radius: 48,
		pad: 80,
		cover: 120,
		coverR: 12,
		headGap: 36,
		logo: 72,
		wordmark: 52,
		logoGap: 36,
		lyricGap: 64,
		lyricMin: 24,
		lyricMax: 120,
		lyricMiddle: false,
		titleSize: 38,
		titleLine: 46,
		artistSize: 30,
		artistLine: 40,
		preview: [
			500,
			440,
			380
		]
	},
	tall: {
		label: "Tall Phone · 9:19.5",
		w: 720,
		h: 1558,
		radius: 44,
		pad: 64,
		cover: 128,
		coverR: 12,
		headGap: 28,
		logo: 60,
		wordmark: 42,
		logoGap: 28,
		lyricGap: 48,
		lyricMin: 22,
		lyricMax: 120,
		lyricMiddle: true,
		titleSize: 36,
		titleLine: 44,
		artistSize: 28,
		artistLine: 36,
		preview: [
			380,
			340,
			280
		]
	}
};
var FORMATS = {
	png: {
		mime: "image/png",
		ext: "png",
		q: void 0,
		label: "PNG",
		solid: false
	},
	jpg: {
		mime: "image/jpeg",
		ext: "jpg",
		q: .95,
		label: "JPG",
		solid: true
	},
	webp: {
		mime: "image/webp",
		ext: "webp",
		q: .92,
		label: "WebP",
		solid: false
	}
};
var EXPORT_PRESETS = [
	{
		id: "ig-post",
		label: "IG Post",
		w: 1080,
		h: 1350,
		layout: "portrait"
	},
	{
		id: "ig-story",
		label: "Story / Reel / TikTok",
		w: 1080,
		h: 1920,
		layout: "story"
	},
	{
		id: "square",
		label: "Square",
		w: 1080,
		h: 1080,
		layout: "square"
	},
	{
		id: "x",
		label: "X / Twitter",
		w: 1600,
		h: 900,
		layout: "wide"
	},
	{
		id: "wall-phone",
		label: "Wallpaper phone",
		w: 1170,
		h: 2532,
		layout: "tall"
	},
	{
		id: "wall-desk",
		label: "Wallpaper desktop",
		w: 1920,
		h: 1080,
		layout: "wide"
	}
];
var CANON = {
	portrait: "ig-post",
	story: "ig-story",
	square: "square",
	wide: "x",
	tall: "wall-phone"
};
var presetById = (id) => EXPORT_PRESETS.find((p) => p.id === id) || null;
var TILT_DEFAULT = {
	rx: 12,
	ry: -15,
	rz: 2,
	perspective: 1200
};
var GLARE = {
	angle: 115,
	stops: [
		[0, "rgba(255,255,255,0)"],
		[.28, "rgba(255,255,255,0)"],
		[.42, "rgba(255,255,255,0.55)"],
		[.5, "rgba(255,255,255,0.12)"],
		[.58, "rgba(255,255,255,0.38)"],
		[.72, "rgba(255,255,255,0)"],
		[1, "rgba(255,255,255,0)"]
	],
	lin: {
		holo: {
			angle: 125,
			stops: [
				[0, "rgba(255,60,170,0)"],
				[.16, "rgba(255,60,170,.38)"],
				[.32, "rgba(255,205,60,.42)"],
				[.48, "rgba(60,255,160,.44)"],
				[.64, "rgba(60,170,255,.44)"],
				[.8, "rgba(170,90,255,.38)"],
				[1, "rgba(170,90,255,0)"]
			]
		},
		gloss: {
			angle: 180,
			stops: [
				[0, "rgba(255,255,255,.55)"],
				[.22, "rgba(255,255,255,.22)"],
				[.47, "rgba(255,255,255,.10)"],
				[.475, "rgba(255,255,255,0)"],
				[1, "rgba(255,255,255,0)"]
			]
		},
		sweep: {
			angle: 100,
			stops: [
				[0, "rgba(255,255,255,0)"],
				[.36, "rgba(255,255,255,0)"],
				[.47, "rgba(255,255,255,.75)"],
				[.53, "rgba(255,255,255,.75)"],
				[.64, "rgba(255,255,255,0)"],
				[1, "rgba(255,255,255,0)"]
			]
		}
	},
	spot: {
		x: .3,
		y: .22,
		r: .85,
		stops: [
			[0, "rgba(255,255,255,0.70)"],
			[.3, "rgba(255,255,255,0.34)"],
			[.65, "rgba(255,255,255,0.08)"],
			[1, "rgba(255,255,255,0)"]
		]
	}
};
var PRESET_COLORS = [
	"#A7429A",
	"#E8115B",
	"#F59B23",
	"#1DB954",
	"#509BF5",
	"#7358FF",
	"#2D46B9",
	"#FF6437",
	"#F5D547",
	"#E6E6FA",
	"#B3B3B3",
	"#181818"
];
var FONT = "'Poppins', 'Segoe UI', Arial, sans-serif";
var LYRIC_FONTS = {
	poppins: {
		id: "poppins",
		label: "Poppins",
		family: FONT,
		weight: 700,
		k: 1
	},
	serif: {
		id: "serif",
		label: "Serif",
		family: "'Playfair Display', Georgia, 'Times New Roman', serif",
		weight: 700,
		k: 1,
		load: "Playfair Display"
	},
	hand: {
		id: "hand",
		label: "Handwritten",
		family: "'Caveat', 'Segoe Print', 'Bradley Hand', cursive",
		weight: 700,
		k: 1.22,
		load: "Caveat"
	},
	condensed: {
		id: "condensed",
		label: "Condensed",
		family: "'Oswald', 'Arial Narrow', 'Roboto Condensed', sans-serif",
		weight: 600,
		k: 1.1,
		load: "Oswald"
	},
	bold: {
		id: "bold",
		label: "Heavy",
		family: "'Archivo Black', 'Arial Black', Impact, sans-serif",
		weight: 400,
		k: .94,
		load: "Archivo Black"
	},
	mono: {
		id: "mono",
		label: "Typewriter",
		family: "'Courier New', ui-monospace, Menlo, Consolas, monospace",
		weight: 700,
		k: .9
	},
	pixel: {
		id: "pixel",
		label: "Pixel",
		family: "'Press Start 2P', 'Courier New', monospace",
		weight: 400,
		k: .62,
		load: "Press Start 2P"
	},
	chalk: {
		id: "chalk",
		label: "Chalk",
		family: "'Patrick Hand', 'Caveat', cursive",
		weight: 400,
		k: 1.18,
		load: "Patrick Hand"
	},
	marker: {
		id: "marker",
		label: "Marker",
		family: "'Permanent Marker', 'Caveat', cursive",
		weight: 400,
		k: 1.05,
		load: "Permanent Marker"
	},
	comicpop: {
		id: "comicpop",
		label: "Comic",
		family: "'Bangers', 'Arial Black', Impact, sans-serif",
		weight: 400,
		k: 1.08,
		load: "Bangers"
	},
	editorial: {
		id: "editorial",
		label: "Editorial",
		family: "'Newsreader', 'Playfair Display', Georgia, serif",
		weight: 600,
		k: 1.02,
		load: "Newsreader"
	},
	motion: {
		id: "motion",
		label: "Motion",
		family: "'Orbitron', 'Oswald', sans-serif",
		weight: 700,
		k: .82,
		load: "Orbitron"
	},
	plastic: {
		id: "plastic",
		label: "Plastic",
		family: "'Fredoka', 'Poppins', sans-serif",
		weight: 700,
		k: 1.02,
		load: "Fredoka"
	},
	film: {
		id: "film",
		label: "Film",
		family: "'Poppins', 'Segoe UI', sans-serif",
		weight: 600,
		k: 1,
		load: "Poppins"
	}
};
var THEME_FONT = {
	notebook: "hand",
	polaroid: "hand",
	newspaper: "serif",
	ticket: "condensed",
	brutalism: "bold",
	pixel: "bold",
	y2k: "bold",
	wrapped: "bold",
	receipt: "mono",
	gameboy: "bold",
	comic: "bold",
	pixelart: "pixel",
	chalkboard: "chalk",
	glowsketch: "marker",
	ps2: "bold",
	comicart: "comicpop",
	flatvector: "bold",
	dankoe: "editorial",
	cgimotion: "motion",
	lego: "plastic",
	zackd: "film",
	cdcase: "condensed",
	minidisc: "motion",
	floppy: "mono",
	plaque: "serif",
	vhs: "condensed",
	stamp: "serif",
	filmstrip: "film",
	vippass: "condensed",
	boarding: "mono",
	matchbook: "serif",
	manga: "comicpop",
	risograph: "bold",
	waxseal: "editorial",
	blueprint: "mono",
	tarot: "serif",
	ipod: "poppins",
	terminal: "mono",
	aqua: "poppins",
	frutiger: "poppins",
	swiss: "bold"
};
var THEMES = {
	classic: {
		label: "Classic",
		desc: "Metallic sheen on Wide, flat color on Square.",
		icon: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"4\"/><path d=\"M8 15l5-6\"/>"
	},
	brutalism: {
		label: "Brutalism",
		desc: "Sharp corners, a thick black border and a hard offset shadow.",
		icon: "<rect x=\"3\" y=\"3\" width=\"14\" height=\"14\"/><path d=\"M7 21h14V7\"/>"
	},
	cyberpunk: {
		label: "Cyberpunk",
		desc: "Near-black card with glowing neon text and borders.",
		icon: "<path d=\"M13 2L4 14h7l-1 8 9-12h-7z\"/>"
	},
	glass: {
		label: "Glass",
		desc: "Frosted glass pane with lit edges over a color glow.",
		icon: "<rect x=\"3\" y=\"7\" width=\"12\" height=\"12\" rx=\"3\" opacity=\".55\"/><rect x=\"9\" y=\"4\" width=\"12\" height=\"12\" rx=\"3\"/>"
	},
	clay: {
		label: "Clay",
		desc: "Pastel, puffy and soft with huge rounded corners.",
		icon: "<path d=\"M12 3c5 0 9 3 9 8.5S17.5 21 12 21 3 17 3 11.5 7 3 12 3z\"/><path d=\"M8 8c1-1.4 2.4-2 4-2\"/>"
	},
	neumorphism: {
		label: "Neumorphic",
		desc: "Soft extruded surface with light and dark shadows.",
		icon: "<rect x=\"3.5\" y=\"3.5\" width=\"17\" height=\"17\" rx=\"5.5\"/><rect x=\"8\" y=\"8\" width=\"8\" height=\"8\" rx=\"3\"/>"
	},
	vinyl: {
		label: "Vinyl",
		desc: "A black record with grooves and a color label, half hidden behind the lyrics.",
		icon: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 3a9 9 0 0 1 9 9\"/>"
	},
	ticket: {
		label: "Ticket",
		desc: "Cream concert ticket with a tear-off stub and a barcode.",
		icon: "<path d=\"M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z\"/><path d=\"M14 6v12\" stroke-dasharray=\"2 2\"/>"
	},
	polaroid: {
		label: "Polaroid",
		desc: "White instant-photo paper with a strip of tape on top.",
		icon: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"2\"/><rect x=\"7\" y=\"6\" width=\"10\" height=\"9\"/>"
	},
	y2k: {
		label: "Y2K Chrome",
		desc: "Glossy chrome gradient with a horizon band and sparkles.",
		icon: "<path d=\"M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z\"/>"
	},
	aurora: {
		label: "Aurora",
		desc: "Dark card with soft glowing color blooms from your card color.",
		icon: "<path d=\"M3 15c3-6 6-6 9 0s6 6 9 0\"/><path d=\"M3 10c3-5 6-5 9 0s6 5 9 0\"/>"
	},
	pixel: {
		label: "Retro Pixel",
		desc: "An 8-bit window with a title bar, chunky border and hard shadow.",
		icon: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\"/><path d=\"M4 9h16M7.5 6.5h.01M10.5 6.5h.01\"/>"
	},
	notebook: {
		label: "Notebook",
		desc: "Ruled paper with a red margin line and punched holes.",
		icon: "<rect x=\"5\" y=\"3\" width=\"15\" height=\"18\" rx=\"2\"/><path d=\"M9 3v18M12 8h5M12 12h5\"/>"
	},
	newspaper: {
		label: "Newspaper",
		desc: "Aged newsprint with halftone dots and double rules.",
		icon: "<path d=\"M5 4h14v16H5z\"/><path d=\"M8 8h8M8 12h3M13 12h3M8 16h8\"/>"
	},
	sticker: {
		label: "Sticker",
		desc: "Die-cut sticker with a thick white outline and a peeled corner.",
		icon: "<path d=\"M5 4h14v10l-5 6H5z\"/><path d=\"M19 14h-5v6\"/>"
	},
	holo: {
		label: "Holo Card",
		desc: "Foil trading card with a rainbow frame, dark panel and sparkles.",
		icon: "<path d=\"M12 3l2.2 5.3 5.8.5-4.4 3.8 1.4 5.6L12 15l-5 3.2 1.4-5.6L4 8.8l5.8-.5z\"/>"
	},
	wrapped: {
		label: "Wrapped",
		desc: "Bold gradient lock-screen look with big soft shapes and a home bar.",
		icon: "<rect x=\"6\" y=\"2.5\" width=\"12\" height=\"19\" rx=\"3\"/><path d=\"M9.5 7h5M9.5 11h5\"/><circle cx=\"12\" cy=\"17\" r=\"1\"/>"
	},
	cassette: {
		label: "Cassette",
		desc: "Cream tape shell with label stripes, screws and a reel window.",
		icon: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/><circle cx=\"8.5\" cy=\"12\" r=\"2\"/><circle cx=\"15.5\" cy=\"12\" r=\"2\"/><path d=\"M8 18l1.5-3h5l1.5 3\"/>"
	},
	receipt: {
		label: "Receipt",
		desc: "Thermal paper with torn zigzag edges, dashed rules and a typewriter font.",
		icon: "<path d=\"M5 3v18l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5V3l-2 1.5L14 3l-2 1.5L10 3 8 4.5z\"/><path d=\"M8.5 9h7M8.5 13h5\"/>"
	},
	gameboy: {
		label: "Gameboy",
		desc: "Grey handheld shell with a dark bezel and a four-shade green LCD.",
		icon: "<rect x=\"5\" y=\"2.5\" width=\"14\" height=\"19\" rx=\"2.5\"/><rect x=\"8\" y=\"5.5\" width=\"8\" height=\"6\" rx=\"1\"/><path d=\"M9 16h3M10.5 14.5v3\"/><circle cx=\"15.5\" cy=\"16\" r=\".6\"/>"
	},
	stained: {
		label: "Stained Glass",
		desc: "Jewel-toned panes from your card color, set in thick black lead.",
		icon: "<path d=\"M5 21V10a7 7 0 0 1 14 0v11z\"/><path d=\"M12 3v18M5 12h14M5 17h14\"/>"
	},
	neon: {
		label: "Neon Sign",
		desc: "Glowing glass tube on a dark brick wall, with a flickering gap.",
		icon: "<path d=\"M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z\"/><path d=\"M10 19.5h4M10.5 21.5h3\"/>"
	},
	comic: {
		label: "Comic Panel",
		desc: "Inked panel with halftone dots and a thick black frame.",
		icon: "<path d=\"M4 5h16v11H11l-4 4v-4H4z\"/><path d=\"M8 9h8M8 12h5\"/>"
	},
	pixelart: {
		label: "Pixel Art",
		desc: "Chunky 8-bit tiles.",
		icon: "<path d=\"M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4z\"/>"
	},
	chalkboard: {
		label: "Chalkboard",
		desc: "Chalk on a green board.",
		icon: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"14\" rx=\"1\"/><path d=\"M7 17c2-2 3-2 5 0\"/>"
	},
	glowsketch: {
		label: "Glow Sketch",
		desc: "Neon hand-drawn lines.",
		icon: "<path d=\"M5 16c2-6 4-8 7-8s4 3 7 1\"/><path d=\"M8 19c1.5-2 3-2 5 0\"/>"
	},
	ps2: {
		label: "PS2",
		desc: "Low-poly console era.",
		icon: "<path d=\"M4 16l8-10 8 10z\"/><path d=\"M8 16l4-5 4 5\"/>"
	},
	comicart: {
		label: "Comic Art",
		desc: "Halftone ink and bursts.",
		icon: "<path d=\"M5 6h10l2 3-2 9H5z\"/><path d=\"M15 6l4 2-2 4\"/>"
	},
	flatvector: {
		label: "Flat Vector",
		desc: "Hard shapes, no shading.",
		icon: "<circle cx=\"8\" cy=\"8\" r=\"4\"/><rect x=\"12\" y=\"12\" width=\"8\" height=\"8\"/>"
	},
	dankoe: {
		label: "Dan Koe",
		desc: "Quiet editorial type.",
		icon: "<path d=\"M5 7h14M5 12h10M5 17h12\"/>"
	},
	cgimotion: {
		label: "CGI Motion",
		desc: "Glossy streaks and chrome.",
		icon: "<path d=\"M3 15c4-8 8-8 12 0M3 10c4-6 8-6 14-1\"/>"
	},
	lego: {
		label: "Lego",
		desc: "Plastic brick with studs.",
		icon: "<rect x=\"3\" y=\"8\" width=\"18\" height=\"10\" rx=\"1\"/><circle cx=\"8\" cy=\"8\" r=\"2\"/><circle cx=\"16\" cy=\"8\" r=\"2\"/>"
	},
	zackd: {
		label: "Zackd",
		desc: "Letterbox and caption bar.",
		icon: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\"/><path d=\"M3 8h18M6 15h8\"/>"
	},
	cdcase: {
		label: "CD Jewel Case",
		desc: "Acrylic case with ridged spine and iridescent disc.",
		icon: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"1.5\"/><path d=\"M6 4v16\"/><circle cx=\"13.5\" cy=\"12\" r=\"4.5\"/><circle cx=\"13.5\" cy=\"12\" r=\"1.2\"/>"
	},
	minidisc: {
		label: "MiniDisc",
		desc: "Smoked 90s magneto-optical cartridge with metal shutter.",
		icon: "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\"/><path d=\"M12 4h6v5h-6z\"/><circle cx=\"11\" cy=\"13\" r=\"4\"/>"
	},
	floppy: {
		label: "Floppy Disk",
		desc: "3.5-inch diskette with chamfered corner and metal slider.",
		icon: "<path d=\"M4 4h13l3 3v13H4z\"/><path d=\"M8 4v5h7V4\"/><rect x=\"7\" y=\"13\" width=\"10\" height=\"7\"/>"
	},
	plaque: {
		label: "Gold Plaque",
		desc: "RIAA-style obsidian frame with brushed gold certification plate.",
		icon: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"1.5\"/><circle cx=\"12\" cy=\"10\" r=\"4\"/><rect x=\"7\" y=\"16\" width=\"10\" height=\"2.5\"/>"
	},
	vhs: {
		label: "VHS Sleeve",
		desc: "Retro 80s video jacket with tri-color racing stripes.",
		icon: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"1\"/><path d=\"M4 13h16M4 15.5h16M4 18h16\"/>"
	},
	stamp: {
		label: "Postage Stamp",
		desc: "Scalloped perforated edges with wavy postmark cancellation.",
		icon: "<path d=\"M4 4h16v16H4z\" stroke-dasharray=\"2 2\"/><rect x=\"6.5\" y=\"6.5\" width=\"11\" height=\"11\"/>"
	},
	filmstrip: {
		label: "35mm Film",
		desc: "Cinema negative with 3D sprocket holes and Kodak frame codes.",
		icon: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\"/><path d=\"M6 4v16M18 4v16\" stroke-dasharray=\"2 2\"/>"
	},
	vippass: {
		label: "VIP Tour Pass",
		desc: "Laminated backstage credential with 3D lanyard slot cutout.",
		icon: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M10 5.5h4\"/><path d=\"M5 9h14\"/>"
	},
	boarding: {
		label: "Boarding Pass",
		desc: "Airline flight coupon with side notches and route telemetry.",
		icon: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M15 6v12\" stroke-dasharray=\"2 2\"/><path d=\"M7 12h5\"/>"
	},
	matchbook: {
		label: "Matchbook",
		desc: "Vintage hotel matchbook cover with bottom striker strip.",
		icon: "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"1.5\"/><path d=\"M5 17h14\"/><path d=\"M5 14h14\"/>"
	},
	manga: {
		label: "Manga Page",
		desc: "High-contrast B&W screentones, speed lines and vertical kana.",
		icon: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\"/><path d=\"M4 10l16-3M14 9v12\"/>"
	},
	risograph: {
		label: "Risograph",
		desc: "Misregistered two-tone soy ink overprint on warm paper.",
		icon: "<circle cx=\"10\" cy=\"11\" r=\"5\"/><circle cx=\"14\" cy=\"13\" r=\"5\"/>"
	},
	waxseal: {
		label: "Wax Seal",
		desc: "Fine cotton stationery with deckle border and crimson wax stamp.",
		icon: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"1\"/><circle cx=\"16\" cy=\"17\" r=\"2.5\"/>"
	},
	blueprint: {
		label: "Blueprint",
		desc: "Cyanotype architectural grid with drafting ticks and title block.",
		icon: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\"/><path d=\"M3 15h18M14 15v5M7 4v16\"/>"
	},
	tarot: {
		label: "Tarot Card",
		desc: "Ornate gold filigree frame with celestial stars and numeral.",
		icon: "<rect x=\"5\" y=\"2.5\" width=\"14\" height=\"19\" rx=\"2\"/><path d=\"M12 7l1.5 3.5L17 12l-3.5 1.5L12 17l-1.5-3.5L7 12l3.5-1.5z\"/>"
	},
	ipod: {
		label: "iPod Classic",
		desc: "Anodized silver player with crisp LCD bezel and battery bar.",
		icon: "<rect x=\"5\" y=\"2.5\" width=\"14\" height=\"19\" rx=\"2.5\"/><rect x=\"7.5\" y=\"5\" width=\"9\" height=\"7\" rx=\"1\"/><circle cx=\"12\" cy=\"16.5\" r=\"3\"/>"
	},
	terminal: {
		label: "CRT Terminal",
		desc: "Phosphor green hacker monitor with scanlines and prompt.",
		icon: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M7 9l3 3-3 3M12 15h5\"/>"
	},
	aqua: {
		label: "Mac OS X Aqua",
		desc: "2001 pinstriped window chrome with glossy gel traffic lights.",
		icon: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"16\" rx=\"2.5\"/><path d=\"M3 8.5h18\"/><circle cx=\"6\" cy=\"6.2\" r=\".8\"/><circle cx=\"8.5\" cy=\"6.2\" r=\".8\"/>"
	},
	frutiger: {
		label: "Frutiger Aero",
		desc: "Glossy sky-blue glass orbs, water droplets and sunlit aurora.",
		icon: "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M6 10c2-3 8-3 12 0\"/>"
	},
	swiss: {
		label: "Swiss Grid",
		desc: "Modernist museum poster with asymmetric rules and bold type.",
		icon: "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\"/><path d=\"M4 9h16M10 3v18\"/>"
	}
};
var THEME_GLARE = {
	classic: "diagonal",
	brutalism: "none",
	cyberpunk: "sweep",
	glass: "gloss",
	clay: "spotlight",
	neumorphism: "spotlight",
	vinyl: "sweep",
	ticket: "diagonal",
	polaroid: "gloss",
	y2k: "holo",
	aurora: "spotlight",
	pixel: "none",
	notebook: "none",
	newspaper: "none",
	sticker: "gloss",
	holo: "holo",
	wrapped: "spotlight",
	cassette: "gloss",
	receipt: "none",
	gameboy: "diagonal",
	stained: "spotlight",
	neon: "sweep",
	comic: "none",
	pixelart: "none",
	chalkboard: "none",
	glowsketch: "sweep",
	ps2: "diagonal",
	comicart: "none",
	flatvector: "none",
	dankoe: "none",
	cgimotion: "sweep",
	lego: "spotlight",
	zackd: "none",
	cdcase: "gloss",
	minidisc: "sweep",
	floppy: "none",
	plaque: "sweep",
	vhs: "none",
	stamp: "none",
	filmstrip: "diagonal",
	vippass: "holo",
	boarding: "none",
	matchbook: "none",
	manga: "none",
	risograph: "none",
	waxseal: "none",
	blueprint: "none",
	tarot: "spotlight",
	ipod: "gloss",
	terminal: "gloss",
	aqua: "gloss",
	frutiger: "gloss",
	swiss: "none"
};
var THEME_INSET = {
	classic: [
		0,
		0,
		0,
		0
	],
	brutalism: [
		14,
		14,
		28,
		28
	],
	cyberpunk: [
		34,
		34,
		34,
		34
	],
	glass: [
		44,
		44,
		44,
		44
	],
	clay: [
		28,
		28,
		60,
		60
	],
	neumorphism: [
		40,
		40,
		40,
		40
	],
	vinyl: [
		28,
		28,
		40,
		44
	],
	ticket: [
		28,
		28,
		28,
		44
	],
	polaroid: [
		32,
		48,
		36,
		48
	],
	y2k: [
		30,
		30,
		36,
		48
	],
	aurora: [
		28,
		28,
		28,
		44
	],
	pixel: [
		14,
		14,
		28,
		28
	],
	notebook: [
		28,
		28,
		28,
		44
	],
	newspaper: [
		28,
		28,
		28,
		44
	],
	sticker: [
		44,
		44,
		56,
		60
	],
	holo: [
		28,
		28,
		28,
		44
	],
	wrapped: [
		24,
		24,
		32,
		40
	],
	cassette: [
		28,
		28,
		28,
		44
	],
	receipt: [
		24,
		28,
		24,
		44
	],
	gameboy: [
		28,
		28,
		36,
		44
	],
	stained: [
		28,
		28,
		28,
		44
	],
	neon: [
		34,
		34,
		34,
		34
	],
	comic: [
		14,
		14,
		28,
		28
	],
	pixelart: [
		0,
		0,
		0,
		0
	],
	chalkboard: [
		0,
		0,
		0,
		0
	],
	glowsketch: [
		0,
		0,
		0,
		0
	],
	ps2: [
		0,
		0,
		0,
		0
	],
	comicart: [
		12,
		12,
		20,
		20
	],
	flatvector: [
		0,
		0,
		0,
		0
	],
	dankoe: [
		0,
		0,
		0,
		0
	],
	cgimotion: [
		0,
		0,
		0,
		0
	],
	lego: [
		0,
		0,
		0,
		0
	],
	zackd: [
		0,
		0,
		0,
		0
	],
	cdcase: [
		20,
		20,
		28,
		32
	],
	minidisc: [
		20,
		20,
		24,
		28
	],
	floppy: [
		20,
		20,
		24,
		28
	],
	plaque: [
		20,
		20,
		28,
		32
	],
	vhs: [
		18,
		18,
		26,
		30
	],
	stamp: [
		28,
		28,
		28,
		36
	],
	filmstrip: [
		16,
		16,
		16,
		24
	],
	vippass: [
		24,
		24,
		24,
		36
	],
	boarding: [
		24,
		24,
		24,
		36
	],
	matchbook: [
		24,
		24,
		24,
		36
	],
	manga: [
		12,
		12,
		20,
		20
	],
	risograph: [
		20,
		20,
		24,
		28
	],
	waxseal: [
		24,
		24,
		28,
		36
	],
	blueprint: [
		16,
		16,
		16,
		24
	],
	tarot: [
		24,
		24,
		24,
		36
	],
	ipod: [
		24,
		24,
		28,
		36
	],
	terminal: [
		18,
		18,
		22,
		26
	],
	aqua: [
		24,
		24,
		28,
		36
	],
	frutiger: [
		24,
		24,
		28,
		36
	],
	swiss: [
		16,
		16,
		20,
		24
	]
};
var THEME_R = {
	holo: 36,
	wrapped: 56,
	cassette: 22,
	receipt: 0,
	gameboy: 24,
	stained: 14,
	neon: 28,
	comic: 0,
	brutalism: 0,
	clay: 64,
	pixel: 0,
	pixelart: 4,
	chalkboard: 14,
	glowsketch: 28,
	ps2: 8,
	comicart: 4,
	flatvector: 28,
	dankoe: 6,
	cgimotion: 20,
	lego: 12,
	zackd: 2,
	newspaper: 6,
	polaroid: 10,
	notebook: 16,
	ticket: 20,
	sticker: 56,
	y2k: 80,
	cdcase: 10,
	minidisc: 20,
	floppy: 12,
	plaque: 18,
	vhs: 8,
	stamp: 0,
	filmstrip: 6,
	vippass: 28,
	boarding: 22,
	matchbook: 16,
	manga: 0,
	risograph: 8,
	waxseal: 10,
	blueprint: 4,
	tarot: 28,
	ipod: 44,
	terminal: 20,
	aqua: 26,
	frutiger: 44,
	swiss: 0
};
var COVER_RADIUS = {
	holo: 12,
	wrapped: 28,
	cassette: 6,
	receipt: 0,
	gameboy: 0,
	stained: 6,
	neon: 14,
	comic: 0,
	brutalism: 0,
	glass: 16,
	clay: 28,
	neumorphism: 20,
	vinyl: 6,
	ticket: 10,
	polaroid: 4,
	y2k: 30,
	aurora: 20,
	pixel: 0,
	pixelart: 0,
	chalkboard: 6,
	glowsketch: 16,
	ps2: 4,
	comicart: 0,
	flatvector: 18,
	dankoe: 4,
	cgimotion: 14,
	lego: 8,
	zackd: 2,
	notebook: 4,
	newspaper: 0,
	sticker: 20,
	cdcase: 4,
	minidisc: 12,
	floppy: 4,
	plaque: 8,
	vhs: 4,
	stamp: 2,
	filmstrip: 2,
	vippass: 14,
	boarding: 10,
	matchbook: 6,
	manga: 0,
	risograph: 4,
	waxseal: 4,
	blueprint: 0,
	tarot: 12,
	ipod: 10,
	terminal: 4,
	aqua: 14,
	frutiger: 24,
	swiss: 0
};
var EXTRUDE_GAIN = 1.5;
var lx = -.6;
var ly = -.8;
var ll = Math.hypot(lx, ly);
var LIGHT_DIR = {
	x: lx / ll,
	y: ly / ll
};
var fontGen = 0;
var incrementFontGen = () => fontGen++;
var wordWidths = /* @__PURE__ */ new Map();
function wordWidth(g, word, size, fontFamily, weight, k) {
	const key = `${fontGen}|${fontFamily}|${weight}|${size}|${k}|${word}`;
	let w = wordWidths.get(key);
	if (w === void 0) {
		w = g.measureText(word).width;
		if (wordWidths.size > 8e3) wordWidths.clear();
		wordWidths.set(key, w);
	}
	return w;
}
var parsedLyricsCache = /* @__PURE__ */ new Map();
function parseLyrics(text) {
	const cached = parsedLyricsCache.get(text);
	if (cached) return cached;
	const paras = text.split("\n").map((raw) => {
		const t = raw.trim();
		return t ? t.split(/\s+/) : null;
	});
	while (paras.length && paras[0] === null) paras.shift();
	while (paras.length && paras[paras.length - 1] === null) paras.pop();
	if (parsedLyricsCache.size > 40) parsedLyricsCache.clear();
	parsedLyricsCache.set(text, paras);
	return paras;
}
function letterSpacing(g, px) {
	if ("letterSpacing" in g) g.letterSpacing = px + "px";
}
function wrapLine(g, text, maxWidth) {
	const words = text.split(/\s+/);
	const lines = [];
	let line = "";
	for (const word of words) {
		const test = line ? line + " " + word : word;
		if (g.measureText(test).width > maxWidth && line) {
			lines.push(line);
			line = word;
		} else line = test;
	}
	lines.push(line);
	return lines;
}
function ellipsize(g, text, maxWidth) {
	if (g.measureText(text).width <= maxWidth) return text;
	let trimmed = text;
	while (trimmed.length > 1 && g.measureText(trimmed + "…").width > maxWidth) trimmed = trimmed.slice(0, -1);
	return trimmed.trimEnd() + "…";
}
function headerFontFor(theme) {
	switch (theme) {
		case "pixelart": return {
			titleFamily: LYRIC_FONTS.pixel.family,
			artistFamily: LYRIC_FONTS.pixel.family,
			titleWeight: 400,
			artistWeight: 400,
			scale: .56,
			tracking: 0
		};
		case "chalkboard": return {
			titleFamily: LYRIC_FONTS.chalk.family,
			artistFamily: LYRIC_FONTS.chalk.family,
			titleWeight: 400,
			artistWeight: 400,
			scale: 1.12,
			tracking: 0
		};
		case "dankoe": return {
			titleFamily: LYRIC_FONTS.editorial.family,
			artistFamily: FONT,
			titleWeight: 600,
			artistWeight: 400,
			scale: 1.04,
			tracking: -.3
		};
		case "newspaper":
		case "plaque":
		case "stamp":
		case "tarot":
		case "matchbook": return {
			titleFamily: LYRIC_FONTS.serif.family,
			artistFamily: LYRIC_FONTS.serif.family,
			titleWeight: 700,
			artistWeight: 400,
			scale: 1,
			tracking: -.2
		};
		case "waxseal": return {
			titleFamily: LYRIC_FONTS.editorial.family,
			artistFamily: LYRIC_FONTS.serif.family,
			titleWeight: 600,
			artistWeight: 400,
			scale: 1.04,
			tracking: -.2
		};
		case "receipt":
		case "floppy":
		case "boarding":
		case "blueprint":
		case "terminal": return {
			titleFamily: LYRIC_FONTS.mono.family,
			artistFamily: LYRIC_FONTS.mono.family,
			titleWeight: 700,
			artistWeight: 400,
			scale: .88,
			tracking: 0
		};
		case "cgimotion":
		case "minidisc": return {
			titleFamily: LYRIC_FONTS.motion.family,
			artistFamily: FONT,
			titleWeight: 700,
			artistWeight: 500,
			scale: .82,
			tracking: .4
		};
		case "lego": return {
			titleFamily: LYRIC_FONTS.plastic.family,
			artistFamily: LYRIC_FONTS.plastic.family,
			titleWeight: 700,
			artistWeight: 600,
			scale: 1.02,
			tracking: -.2
		};
		case "comicart":
		case "manga": return {
			titleFamily: LYRIC_FONTS.comicpop.family,
			artistFamily: FONT,
			titleWeight: 400,
			artistWeight: 600,
			scale: 1.14,
			tracking: .8
		};
		case "cdcase":
		case "vhs":
		case "vippass": return {
			titleFamily: LYRIC_FONTS.condensed.family,
			artistFamily: FONT,
			titleWeight: 600,
			artistWeight: 500,
			scale: 1.06,
			tracking: .4
		};
		case "swiss":
		case "risograph": return {
			titleFamily: LYRIC_FONTS.bold.family,
			artistFamily: FONT,
			titleWeight: 400,
			artistWeight: 600,
			scale: .94,
			tracking: -.4
		};
		default: return {
			titleFamily: FONT,
			artistFamily: FONT,
			titleWeight: 700,
			artistWeight: 400,
			scale: 1,
			tracking: -.5
		};
	}
}
var headerCache = {
	key: "",
	titleLines: [],
	titleSize: 38,
	titleLine: 46,
	artist: ""
};
function drawHeader(g, state, layout, P, tilt, unit = 1, fixedExtrude = false) {
	const f = cardFrame(layout, state.theme, state.hide);
	const x = f.hx;
	const maxWidth = Math.max(80, f.hw - 4);
	const hf = headerFontFor(state.theme);
	const baseTitleSize = Math.round(layout.titleSize * hf.scale);
	const baseTitleLine = Math.max(Math.round(baseTitleSize * 1.2), Math.round(layout.titleLine * Math.min(1.06, hf.scale)));
	const artistSize = Math.max(16, Math.round(layout.artistSize * Math.min(1.05, hf.scale)));
	const artistLine = Math.max(Math.round(artistSize * 1.3), Math.round(layout.artistLine * Math.min(1.05, hf.scale)));
	const title = state.title.trim() || "Song title";
	const artistText = state.artist.trim() || "Artist";
	const key = `${fontGen}|${state.theme}|${state.layoutKey}|${maxWidth}|${title}|${artistText}`;
	if (headerCache.key !== key) {
		let resolvedTitleSize = baseTitleSize;
		let resolvedTitleLine = baseTitleLine;
		g.textBaseline = "top";
		g.font = `${hf.titleWeight} ${resolvedTitleSize}px ${hf.titleFamily}`;
		letterSpacing(g, hf.tracking);
		let lines = wrapLine(g, title, maxWidth);
		if (lines.length > 2) {
			resolvedTitleSize = Math.max(18, Math.round(baseTitleSize * .85));
			resolvedTitleLine = Math.round(resolvedTitleSize * 1.22);
			g.font = `${hf.titleWeight} ${resolvedTitleSize}px ${hf.titleFamily}`;
			lines = wrapLine(g, title, maxWidth);
		}
		if (lines.length > 2) {
			lines = lines.slice(0, 2);
			lines[1] = ellipsize(g, lines[1] + " …", maxWidth);
		}
		headerCache.titleLines = lines.map((l) => ellipsize(g, l, maxWidth));
		headerCache.titleSize = resolvedTitleSize;
		headerCache.titleLine = resolvedTitleLine;
		g.font = `${hf.artistWeight} ${artistSize}px ${hf.artistFamily}`;
		letterSpacing(g, 0);
		headerCache.artist = ellipsize(g, artistText, maxWidth);
		headerCache.key = key;
	}
	const titleLines = state.hide.title ? [] : headerCache.titleLines;
	const titleGap = !state.hide.title && !state.hide.artist ? 4 : 0;
	const total = titleLines.length * headerCache.titleLine + titleGap + (state.hide.artist ? 0 : artistLine);
	const y0 = f.top ? f.hy : f.hy - total / 2;
	const yArtist = y0 + titleLines.length * headerCache.titleLine + titleGap;
	g.textBaseline = "top";
	g.font = `${hf.titleWeight} ${headerCache.titleSize}px ${hf.titleFamily}`;
	letterSpacing(g, hf.tracking);
	const lay = getLayers(Math.round(state.cardDepth * 1), tilt, state.color, P.wall, state.theme, 16, fixedExtrude);
	if (lay) {
		for (const o of lay) {
			g.fillStyle = o.color;
			let y = y0;
			for (const line of titleLines) {
				g.fillText(line, x + o.dx, y + o.dy);
				y += headerCache.titleLine;
			}
		}
		if (!state.hide.artist) {
			g.font = `${hf.artistWeight} ${artistSize}px ${hf.artistFamily}`;
			letterSpacing(g, 0);
			for (const o of lay) {
				g.fillStyle = o.color;
				g.fillText(headerCache.artist, x + o.dx, yArtist + o.dy);
			}
			g.font = `${hf.titleWeight} ${headerCache.titleSize}px ${hf.titleFamily}`;
			letterSpacing(g, hf.tracking);
		}
	}
	if (P.glow) {
		g.shadowColor = P.glow;
		g.shadowBlur = 15 * unit;
	}
	for (const p of P.passes) {
		g.fillStyle = p.color;
		let y = y0;
		for (const line of titleLines) {
			g.fillText(line, x + p.dx, y + p.dy);
			y += headerCache.titleLine;
		}
	}
	g.font = `${hf.artistWeight} ${artistSize}px ${hf.artistFamily}`;
	letterSpacing(g, 0);
	for (const p of state.hide.artist ? [] : P.passes) {
		g.globalAlpha = p.main ? .82 : 1;
		g.fillStyle = p.color;
		g.fillText(headerCache.artist, x + p.dx, yArtist + p.dy);
	}
	g.globalAlpha = 1;
	if (P.glow) {
		g.shadowColor = "rgba(0,0,0,0)";
		g.shadowBlur = 0;
	}
}
var lyricFontObj = (stateFont, theme) => {
	return LYRIC_FONTS[stateFont === "auto" ? THEME_FONT[theme] || "poppins" : stateFont] || LYRIC_FONTS.poppins;
};
var lyricFontCss = (size, stateFont, theme) => {
	const f = lyricFontObj(stateFont, theme);
	return `${f.weight} ${(size * f.k).toFixed(2)}px ${f.family}`;
};
function breakWideWord(g, word, maxWidth) {
	const parts = [];
	let cur = "";
	for (const ch of word) {
		const next = cur + ch;
		if (cur && g.measureText(next).width > maxWidth) {
			parts.push(cur);
			cur = ch;
		} else cur = next;
	}
	if (cur) parts.push(cur);
	return parts;
}
function measureRowWords(g, tokens) {
	const fullText = tokens.map((t) => t.text).join(" ");
	const rowWidth = fullText ? g.measureText(fullText).width : 0;
	const words = [];
	let prefix = "";
	for (let i = 0; i < tokens.length; i++) {
		const tok = tokens[i];
		const xOffset = i === 0 ? 0 : g.measureText(prefix).width;
		const width = g.measureText(tok.text).width;
		words.push({
			text: tok.text,
			wordIndex: tok.wordIndex,
			xOffset,
			width
		});
		prefix += (i === 0 ? "" : " ") + tok.text + " ";
	}
	return {
		rowWidth,
		words
	};
}
function layoutLyrics(g, paras, size, maxWidth, stateFont, theme, build = false) {
	const safeWidth = Math.max(40, maxWidth - 6);
	const lineHeight = Math.round(size * 1.24);
	const gap = Math.round(lineHeight * .48);
	const f = lyricFontObj(stateFont, theme);
	g.font = lyricFontCss(size, stateFont, theme);
	letterSpacing(g, -size * .015);
	const space = wordWidth(g, " ", size, f.family, f.weight, f.k);
	const rows = [];
	let height = 0;
	let tooWide = false;
	let nonEmptyIdx = 0;
	const pushBuiltRow = (line, pi, lIdx, tokens) => {
		const measured = measureRowWords(g, tokens);
		rows.push({
			text: line,
			h: lineHeight,
			p: pi,
			lineIdx: lIdx,
			rowWidth: measured.rowWidth,
			words: measured.words
		});
	};
	for (let pi = 0; pi < paras.length; pi++) {
		const words = paras[pi];
		if (!words) {
			height += gap;
			if (build) rows.push({
				text: "",
				h: gap
			});
			continue;
		}
		const curLineIdx = nonEmptyIdx++;
		let line = "";
		let lineW = 0;
		let rowTokens = [];
		for (let wi = 0; wi < words.length; wi++) {
			const rawWord = words[wi];
			const rawW = wordWidth(g, rawWord, size, f.family, f.weight, f.k);
			if (rawW > safeWidth) {
				tooWide = true;
				const chunks = breakWideWord(g, rawWord, safeWidth);
				for (const chunk of chunks) {
					const cw = g.measureText(chunk).width;
					if (lineW && lineW + space + cw > safeWidth) {
						height += lineHeight;
						if (build) {
							pushBuiltRow(line, pi, curLineIdx, rowTokens);
							rowTokens = [{
								text: chunk,
								wordIndex: wi
							}];
						}
						line = build ? chunk : "";
						lineW = cw;
					} else {
						if (build) {
							line = lineW ? line + " " + chunk : chunk;
							rowTokens.push({
								text: chunk,
								wordIndex: wi
							});
						}
						lineW = lineW ? lineW + space + cw : cw;
					}
				}
				continue;
			}
			if (lineW && lineW + space + rawW > safeWidth) {
				height += lineHeight;
				if (build) {
					pushBuiltRow(line, pi, curLineIdx, rowTokens);
					rowTokens = [{
						text: rawWord,
						wordIndex: wi
					}];
				}
				line = build ? rawWord : "";
				lineW = rawW;
			} else {
				if (build) {
					line = lineW ? line + " " + rawWord : rawWord;
					rowTokens.push({
						text: rawWord,
						wordIndex: wi
					});
				}
				lineW = lineW ? lineW + space + rawW : rawW;
			}
		}
		height += lineHeight;
		if (build) pushBuiltRow(line, pi, curLineIdx, rowTokens);
	}
	letterSpacing(g, 0);
	return {
		rows,
		height,
		tooWide
	};
}
function fitLyricSize(g, paras, maxWidth, avail, minSize, maxSize, stateFont, theme) {
	const fits = (s) => {
		const m = layoutLyrics(g, paras, s, maxWidth, stateFont, theme, false);
		return !m.tooWide && m.height <= avail;
	};
	if (!fits(minSize)) return {
		size: minSize,
		overflow: true
	};
	if (fits(maxSize)) return {
		size: maxSize,
		overflow: false
	};
	let lo = minSize;
	let hi = maxSize - 1;
	while (lo < hi) {
		const mid = lo + hi + 1 >> 1;
		if (fits(mid)) lo = mid;
		else hi = mid - 1;
	}
	let best = lo;
	for (let s = lo + 1, end = Math.min(maxSize, lo + 12); s <= end; s++) if (fits(s)) best = s;
	return {
		size: best,
		overflow: false
	};
}
var fitLyricCache = /* @__PURE__ */ new Map();
function drawLyrics(g, state, layout, P, tilt, unit = 1, fixedExtrude = false, playback) {
	const f = cardFrame(layout, state.theme, state.hide);
	const maxWidth = Math.max(80, f.x1 - f.lx);
	const top = f.ltop;
	const bSpace = barSpace(state.hide.bar, layout.logo);
	const fSpace = footerSpace(state.hide, state.trackId, layout);
	const bottom = f.y1 - fSpace - bSpace;
	const avail = Math.max(40, bottom - top);
	const rawText = playback?.isPlaying && playback?.activeLyrics?.trim() ? playback.activeLyrics : state.lyrics;
	const hasText = rawText.trim().length > 0;
	const text = hasText ? rawText : "Your lyrics\nwill appear here";
	const paras = parseLyrics(text);
	const autoMax = Math.min(layout.lyricMax, layout.w >= 1200 ? 78 : layout.w <= 720 ? 72 : 88);
	const fitCacheKey = `${fontGen}|${state.layoutKey}|${state.theme}|${state.lyricFont}|${state.autoFit ? "auto" : state.lyricSize}|${maxWidth}|${avail}|${text}`;
	let size;
	let overflow;
	let visibleRows;
	let visibleHeight;
	const cachedFit = fitLyricCache.get(fitCacheKey);
	if (cachedFit) {
		size = cachedFit.size;
		overflow = cachedFit.overflow;
		visibleRows = cachedFit.visibleRows;
		visibleHeight = cachedFit.visibleHeight;
		g.font = lyricFontCss(size, state.lyricFont, state.theme);
		letterSpacing(g, -size * .015);
	} else {
		if (state.autoFit) {
			const fitRes = fitLyricSize(g, paras, maxWidth, avail, layout.lyricMin, autoMax, state.lyricFont, state.theme);
			size = fitRes.size;
			overflow = fitRes.overflow;
		} else {
			size = state.lyricSize;
			const checkLayout = layoutLyrics(g, paras, size, maxWidth, state.lyricFont, state.theme, false);
			overflow = checkLayout.height > avail || checkLayout.tooWide;
		}
		const layoutRes = layoutLyrics(g, paras, size, maxWidth, state.lyricFont, state.theme, true);
		g.font = lyricFontCss(size, state.lyricFont, state.theme);
		letterSpacing(g, -size * .015);
		visibleRows = layoutRes.rows;
		visibleHeight = layoutRes.height;
		if (layoutRes.height > avail) {
			overflow = true;
			const kept = [];
			let used = 0;
			for (const row of layoutRes.rows) {
				if (used + row.h > avail + 2 && kept.length > 0) break;
				kept.push({ ...row });
				used += row.h;
			}
			for (let i = kept.length - 1; i >= 0; i--) if (kept[i].text) {
				kept[i].text = ellipsize(g, kept[i].text.replace(/…$/, "") + "…", Math.max(40, maxWidth - 6));
				const prevWords = kept[i].words ?? [];
				const rebuilt = measureRowWords(g, kept[i].text.split(/\s+/).filter(Boolean).map((t, idx) => ({
					text: t,
					wordIndex: prevWords[idx]?.wordIndex ?? prevWords[prevWords.length - 1]?.wordIndex ?? idx
				})));
				kept[i].rowWidth = rebuilt.rowWidth;
				kept[i].words = rebuilt.words;
				break;
			}
			visibleRows = kept;
			visibleHeight = used;
		}
		if (fitLyricCache.size > 48) fitLyricCache.clear();
		fitLyricCache.set(fitCacheKey, {
			size,
			overflow,
			visibleRows,
			visibleHeight
		});
	}
	g.save();
	g.beginPath();
	g.rect(f.lx - 18, top - 12, maxWidth + 36, avail + 24);
	g.clip();
	g.globalAlpha = hasText ? 1 : .45;
	const baseAlpha = g.globalAlpha;
	const hl = hasText && state.hlLine >= 0 && state.hlLine < paras.length ? state.hlLine : -1;
	const hasKaraoke = hasText && Boolean(playback?.lineWeights && playback.lineWeights.length > 0);
	const weights = playback?.lineWeights;
	const wordFills = playback?.wordFills;
	const activePara = typeof playback?.activeParagraph === "number" ? playback.activeParagraph : -1;
	const activeFill = typeof playback?.activeLineFill === "number" ? Math.min(1, Math.max(0, playback.activeLineFill)) : 1;
	const lineIndexFor = (row) => typeof row.lineIdx === "number" ? row.lineIdx : row.p;
	const ra = (row) => {
		const idx = lineIndexFor(row);
		if (hasKaraoke && weights && typeof idx === "number") {
			const w = Math.min(1, Math.max(0, weights[idx] ?? 0));
			const floor = activePara >= 0 && idx < activePara ? .5 : .28;
			return baseAlpha * (floor + (1 - floor) * w);
		}
		return hl >= 0 && row.p !== hl ? baseAlpha * .34 : baseAlpha;
	};
	const rowLift = (row) => {
		const idx = lineIndexFor(row);
		if (hasKaraoke && weights && typeof idx === "number") {
			const w = Math.min(1, Math.max(0, weights[idx] ?? 0));
			return -Math.round(w * Math.max(1.5, size * .04));
		}
		return 0;
	};
	const wordLift = (wf) => {
		if (wf <= .001) return 0;
		if (wf >= .999) return -Math.round(Math.max(1.5, size * .032));
		const arc = Math.sin(wf * Math.PI);
		return -Math.round(arc * Math.max(2.5, size * .06) + wf * Math.max(1.5, size * .032));
	};
	g.font = lyricFontCss(size, state.lyricFont, state.theme);
	g.textBaseline = "top";
	letterSpacing(g, -size * .015);
	const ax = state.align === "center" ? f.lx + maxWidth / 2 : state.align === "right" ? f.x1 : f.lx;
	g.textAlign = state.align;
	const y0 = top + (f.mid ? Math.max(0, (avail - visibleHeight) / 2) : 0);
	const rowLeftFor = (row) => {
		const tw = row.rowWidth ?? g.measureText(row.text).width;
		return state.align === "center" ? ax - tw / 2 : state.align === "right" ? ax - tw : ax;
	};
	const lay = getLayers(Math.round(state.cardDepth * 1), tilt, state.color, P.wall, state.theme, 20, fixedExtrude);
	if (lay) for (const o of lay) {
		g.fillStyle = o.color;
		let y = y0;
		for (const row of visibleRows) {
			if (row.text) {
				const idx = lineIndexFor(row);
				const lift = rowLift(row);
				const lwFills = hasKaraoke && typeof idx === "number" ? wordFills?.[idx] : void 0;
				if (hasKaraoke && idx === activePara && lwFills && row.words && row.words.length > 0) {
					const rLeft = rowLeftFor(row);
					g.textAlign = "left";
					for (const rw of row.words) {
						const wf = Math.min(1, Math.max(0, lwFills[rw.wordIndex] ?? 0));
						g.globalAlpha = baseAlpha * (.32 + .68 * wf);
						g.fillText(rw.text, rLeft + rw.xOffset + o.dx, y + o.dy + lift + wordLift(wf));
					}
					g.textAlign = state.align;
				} else {
					g.globalAlpha = ra(row);
					g.fillText(row.text, ax + o.dx, y + o.dy + lift);
				}
			}
			y += row.h;
		}
	}
	if (P.glow) {
		g.shadowColor = P.glow;
		g.shadowBlur = 15 * unit;
	}
	for (const p of P.passes) {
		g.fillStyle = p.color;
		let y = y0;
		for (const row of visibleRows) {
			if (row.text) {
				const idx = lineIndexFor(row);
				const lift = rowLift(row);
				const lwFills = hasKaraoke && typeof idx === "number" ? wordFills?.[idx] : void 0;
				if (hasKaraoke && typeof idx === "number" && idx === activePara && Boolean(lwFills && lwFills.length > 0 && row.words && row.words.length > 0) && lwFills && row.words) {
					const rLeft = rowLeftFor(row);
					const lineW = Math.min(1, Math.max(0, weights?.[idx] ?? 1));
					g.textAlign = "left";
					for (const rw of row.words) {
						const wf = Math.min(1, Math.max(0, lwFills[rw.wordIndex] ?? 0));
						const wLift = wordLift(wf);
						const wx = rLeft + rw.xOffset + p.dx;
						const wy = y + p.dy + lift + wLift;
						if (!p.main) {
							g.globalAlpha = baseAlpha * (.35 + .65 * wf);
							g.fillText(rw.text, wx, wy);
							continue;
						}
						if (wf <= .001) {
							g.globalAlpha = baseAlpha * .32;
							g.fillText(rw.text, wx, wy);
						} else if (wf >= .999) {
							g.globalAlpha = baseAlpha * (.65 + .35 * lineW);
							g.fillText(rw.text, wx, wy);
						} else {
							g.globalAlpha = baseAlpha * .32;
							g.fillText(rw.text, wx, wy);
							g.save();
							g.beginPath();
							g.rect(wx - 2, wy - 8, (rw.width + 4) * wf, row.h + 16);
							g.clip();
							g.globalAlpha = baseAlpha;
							if (P.glow || state.color) {
								g.shadowColor = P.glow || state.color;
								g.shadowBlur = Math.max(10, 18 * unit);
							}
							g.fillText(rw.text, wx, wy);
							g.restore();
						}
					}
					g.textAlign = state.align;
				} else if (hasKaraoke && p.main && typeof idx === "number" && idx === activePara && activeFill < .99) {
					const w = Math.min(1, Math.max(0, weights?.[idx] ?? 1));
					g.globalAlpha = baseAlpha * (.38 + .2 * (1 - w));
					g.fillText(row.text, ax + p.dx, y + p.dy + lift);
					const tw = row.rowWidth ?? g.measureText(row.text).width;
					const rowLeft = rowLeftFor(row);
					g.save();
					g.beginPath();
					g.rect(rowLeft + p.dx - 4, y + p.dy + lift - 6, (tw + 8) * activeFill, row.h + 12);
					g.clip();
					g.globalAlpha = baseAlpha * (.55 + .45 * w);
					if (P.glow || state.color) {
						g.shadowColor = P.glow || state.color;
						g.shadowBlur = 14 * unit * w;
					}
					g.fillText(row.text, ax + p.dx, y + p.dy + lift);
					g.restore();
				} else {
					g.globalAlpha = ra(row);
					g.fillText(row.text, ax + p.dx, y + p.dy + lift);
				}
			}
			y += row.h;
		}
	}
	if (P.glow) {
		g.shadowColor = "rgba(0,0,0,0)";
		g.shadowBlur = 0;
	}
	g.textAlign = "left";
	letterSpacing(g, 0);
	g.globalAlpha = 1;
	g.restore();
	return {
		size,
		overflow
	};
}
var COLLECTOR_THEMES = [
	"cdcase",
	"minidisc",
	"floppy",
	"plaque",
	"vhs",
	"stamp",
	"filmstrip",
	"vippass",
	"boarding",
	"matchbook",
	"manga",
	"risograph",
	"waxseal",
	"blueprint",
	"tarot",
	"ipod",
	"terminal",
	"aqua",
	"frutiger",
	"swiss"
];
var COLLECTOR = new Set(COLLECTOR_THEMES);
function isCollectorTheme(theme) {
	return COLLECTOR.has(theme);
}
var pass = (color, dx = 0, dy = 0, main = true) => ({
	dx,
	dy,
	color,
	main
});
function cardDrop$1(g, W, H, R, fill, blur = 30, oy = 14, unit = 1) {
	g.save();
	g.shadowColor = "rgba(0,0,0,0.42)";
	g.shadowBlur = blur * unit;
	g.shadowOffsetX = 0;
	g.shadowOffsetY = oy * unit;
	g.fillStyle = fill;
	roundedRect(g, 0, 0, W, H, R);
	g.fill();
	g.restore();
}
function applyCollectorPalette(theme, P, bg) {
	if (!isCollectorTheme(theme)) return false;
	switch (theme) {
		case "cdcase":
			P.surface = mixHex(bg, "#141720", .58);
			P.text = "#FFFFFF";
			P.wall = "#D8E2EE";
			P.passes = [pass("rgba(0,0,0,0.35)", 0, 2, false), pass("#FFFFFF")];
			break;
		case "minidisc":
			P.surface = mixHex(bg, "#12151E", .72);
			P.text = "#F2F6FF";
			P.glow = mixHex(bg, "#63E6FF", .45);
			P.wall = "#1C202B";
			P.passes = [pass("#F2F6FF")];
			break;
		case "floppy":
			P.surface = "#F7F4EA";
			P.text = "#1A1C24";
			P.wall = mixHex(bg, "#1C2230", .45);
			P.passes = [pass("#1A1C24")];
			break;
		case "plaque":
			P.surface = "#0E0E12";
			P.text = "#F7E5B4";
			P.glow = "#D4AF37";
			P.wall = "#1B1813";
			P.passes = [pass("rgba(0,0,0,0.65)", 0, 3, false), pass("#F7E5B4")];
			break;
		case "vhs":
			P.surface = "#141216";
			P.text = "#FAF5E8";
			P.wall = "#0F0D10";
			P.passes = [pass("#FAF5E8")];
			break;
		case "stamp":
			P.surface = "#F8F2E2";
			P.text = mixHex(bg, "#1C1814", .65);
			P.wall = "#E8DFC8";
			P.passes = [pass(P.text)];
			break;
		case "filmstrip":
			P.surface = mixHex(bg, "#120E0B", .82);
			P.text = "#FFF6E8";
			P.glow = "#FF9E2C";
			P.wall = "#0A0908";
			P.passes = [pass("#FFF6E8")];
			break;
		case "vippass":
			P.surface = "#101218";
			P.text = "#FFFFFF";
			P.neon = bg;
			P.wall = "#1E222E";
			P.passes = [pass("#FFFFFF")];
			break;
		case "boarding":
			P.surface = "#F9F8F3";
			P.text = "#141A26";
			P.wall = "#E5E2D7";
			P.passes = [pass("#141A26")];
			break;
		case "matchbook": {
			const darkCover = mixHex(bg, "#1D1410", .42);
			P.surface = darkCover;
			P.text = luma(darkCover) > 148 ? "#1B140E" : "#FAF0DC";
			P.wall = mixHex(darkCover, "#000000", .35);
			P.passes = [pass(P.text)];
			break;
		}
		case "manga":
			P.surface = "#FAF8F2";
			P.text = "#111111";
			P.wall = "#111111";
			P.passes = [pass("#FFFFFF", -2, -2, false), pass("#111111")];
			break;
		case "risograph": {
			P.surface = "#F7F1E3";
			const primaryInk = mixHex(bg, "#12131A", .55);
			const misregInk = rgba(mixHex(bg, "#FF2A6D", .65), .38);
			P.text = primaryInk;
			P.wall = "#E5DEC9";
			P.passes = [pass(misregInk, 5, 3, false), pass(primaryInk)];
			break;
		}
		case "waxseal":
			P.surface = "#FAF5E8";
			P.text = "#241D18";
			P.wall = "#E6DEC8";
			P.passes = [pass("#241D18")];
			break;
		case "blueprint":
			P.surface = mixHex("#0B356E", bg, .18);
			P.text = "#F0F7FF";
			P.wall = "#07244D";
			P.passes = [pass("#F0F7FF")];
			break;
		case "tarot":
			P.surface = mixHex("#0E0B1A", bg, .2);
			P.text = "#F6E6C2";
			P.glow = "#D4AF37";
			P.wall = "#1A142B";
			P.passes = [pass("#F6E6C2")];
			break;
		case "ipod":
			P.surface = "#F4F7FA";
			P.text = "#141A22";
			P.wall = "#D0D5DC";
			P.passes = [pass("#141A22")];
			break;
		case "terminal": {
			const phosphor = luma(bg) < 85 ? mixHex(bg, "#39FF88", .65) : mixHex(bg, "#55FF99", .35);
			P.surface = "#050A07";
			P.text = phosphor;
			P.neon = phosphor;
			P.glow = phosphor;
			P.wall = "#0A140E";
			P.passes = [pass(phosphor)];
			break;
		}
		case "aqua":
			P.surface = "#F7F9FC";
			P.text = "#151B26";
			P.wall = "#CFD7E3";
			P.passes = [pass("#151B26")];
			break;
		case "frutiger":
			P.surface = mixHex(bg, "#0B558A", .45);
			P.text = "#FFFFFF";
			P.wall = mixHex(bg, "#38BDF8", .5);
			P.passes = [pass("rgba(0,40,80,0.35)", 0, 2, false), pass("#FFFFFF")];
			break;
		case "swiss":
			P.surface = "#F3EFE6";
			P.text = "#111111";
			P.wall = "#111111";
			P.passes = [pass("#111111")];
			break;
		default: return false;
	}
	return true;
}
function paintCollectorBody(g, state, layout, P, unit = 1) {
	if (!isCollectorTheme(state.theme)) return false;
	const { w: W, h: H } = layout;
	const bg = state.color;
	const theme = state.theme;
	const minSide = Math.min(W, H);
	switch (theme) {
		case "cdcase": {
			const spineW = Math.max(52, Math.round(W * .068));
			g.fillStyle = "#E2EAF2";
			roundedRect(g, 0, 0, W, H, 10);
			g.fill();
			const insGrad = g.createLinearGradient(spineW, 0, W, H);
			insGrad.addColorStop(0, mixHex(bg, "#252B3B", .35));
			insGrad.addColorStop(.55, P.surface);
			insGrad.addColorStop(1, mixHex(bg, "#07090F", .78));
			g.fillStyle = insGrad;
			g.fillRect(spineW, 8, W - spineW - 8, H - 16);
			g.save();
			g.beginPath();
			g.rect(spineW, 8, W - spineW - 8, H - 16);
			g.clip();
			const cdX = W * .86;
			const cdY = H * .5;
			const cdR = minSide * .42;
			const cdGrad = g.createRadialGradient(cdX, cdY, cdR * .2, cdX, cdY, cdR);
			cdGrad.addColorStop(0, "rgba(255,255,255,0.04)");
			cdGrad.addColorStop(.5, rgba(mixHex(bg, "#00F0FF", .5), .14));
			cdGrad.addColorStop(.8, rgba(mixHex(bg, "#FF4FD8", .5), .12));
			cdGrad.addColorStop(1, "rgba(255,255,255,0.22)");
			g.fillStyle = cdGrad;
			g.beginPath();
			g.arc(cdX, cdY, cdR, 0, Math.PI * 2);
			g.fill();
			g.restore();
			g.fillStyle = "#181A20";
			g.fillRect(0, 0, spineW, H);
			for (let x = 8; x < spineW - 6; x += 5) {
				g.fillStyle = "rgba(255,255,255,0.12)";
				g.fillRect(x, 12, 1.5, H - 24);
				g.fillStyle = "rgba(0,0,0,0.45)";
				g.fillRect(x + 1.5, 12, 2, H - 24);
			}
			g.save();
			g.translate(spineW / 2, H / 2);
			g.rotate(-Math.PI / 2);
			g.fillStyle = "rgba(255,255,255,0.5)";
			g.font = `700 13px ${FONT}`;
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText("COMPACT DISC · DIGITAL AUDIO", 0, 0);
			g.restore();
			g.fillStyle = "rgba(255,255,255,0.55)";
			g.fillRect(W * .35, 4, 48, 6);
			g.fillRect(W * .72, 4, 48, 6);
			g.fillRect(W * .35, H - 10, 48, 6);
			g.fillRect(W * .72, H - 10, 48, 6);
			const acrylic = g.createLinearGradient(spineW, 0, W, H);
			acrylic.addColorStop(0, "rgba(255,255,255,0.28)");
			acrylic.addColorStop(.24, "rgba(255,255,255,0.04)");
			acrylic.addColorStop(.5, "rgba(255,255,255,0)");
			acrylic.addColorStop(.53, "rgba(255,255,255,0.16)");
			acrylic.addColorStop(1, "rgba(255,255,255,0.04)");
			g.fillStyle = acrylic;
			g.fillRect(spineW, 0, W - spineW, H);
			g.strokeStyle = "rgba(255,255,255,0.65)";
			g.lineWidth = 3;
			roundedRect(g, 1.5, 1.5, W - 3, H - 3, 9);
			g.stroke();
			return true;
		}
		case "minidisc": {
			const shell = g.createLinearGradient(0, 0, W, H);
			shell.addColorStop(0, mixHex(bg, "#1D2230", .65));
			shell.addColorStop(.6, P.surface);
			shell.addColorStop(1, "#0B0D14");
			g.fillStyle = shell;
			roundedRect(g, 0, 0, W, H, 20);
			g.fill();
			g.save();
			roundedRect(g, 0, 0, W, H, 20);
			g.clip();
			const dx = W * .52;
			const dy = H * .54;
			const dr = minSide * .42;
			const disc = g.createRadialGradient(dx, dy, dr * .18, dx, dy, dr);
			disc.addColorStop(0, "rgba(255,255,255,0.12)");
			disc.addColorStop(.5, rgba(mixHex(bg, "#00E5FF", .5), .16));
			disc.addColorStop(.85, rgba(mixHex(bg, "#FF4FD8", .45), .12));
			disc.addColorStop(1, "rgba(255,255,255,0.06)");
			g.fillStyle = disc;
			g.beginPath();
			g.arc(dx, dy, dr, 0, Math.PI * 2);
			g.fill();
			g.strokeStyle = "rgba(255,255,255,0.14)";
			g.lineWidth = 2;
			g.stroke();
			const sw = Math.round(W * .36);
			const sh = 46;
			const sx = W - sw - 38;
			const metal = g.createLinearGradient(sx, 0, sx + sw, sh);
			metal.addColorStop(0, "#CFD6E0");
			metal.addColorStop(.45, "#F5F8FC");
			metal.addColorStop(.7, "#9AA3B2");
			metal.addColorStop(1, "#D5DCE6");
			g.fillStyle = metal;
			roundedRect(g, sx, 0, sw, sh, 6);
			g.fill();
			g.fillStyle = "#1C222E";
			g.font = `700 13px ${FONT}`;
			g.textBaseline = "middle";
			g.fillText("MD · 74 MIN · DIGITAL AUDIO", sx + 18, sh / 2);
			g.fillStyle = rgba(bg, .85);
			g.beginPath();
			g.moveTo(36, 20);
			g.lineTo(48, 34);
			g.lineTo(24, 34);
			g.closePath();
			g.fill();
			g.restore();
			g.strokeStyle = "rgba(255,255,255,0.24)";
			g.lineWidth = 3;
			roundedRect(g, 2, 2, W - 4, H - 4, 18);
			g.stroke();
			return true;
		}
		case "floppy": {
			const cut = Math.round(minSide * .09);
			const diskPath = (c) => {
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
			const shellColor = mixHex(bg, "#1D2330", .38);
			g.save();
			g.shadowColor = "rgba(0,0,0,0.4)";
			g.shadowBlur = 24 * unit;
			g.shadowOffsetY = 12 * unit;
			g.fillStyle = shellColor;
			diskPath(g);
			g.fill();
			g.restore();
			g.save();
			diskPath(g);
			g.clip();
			const shX = Math.round(W * .24);
			const shW = Math.round(W * .52);
			const shH = 56;
			g.fillStyle = "rgba(0,0,0,0.28)";
			g.fillRect(shX - 8, 0, shW + 16, 62);
			const metal = g.createLinearGradient(shX, 0, shX + shW, 0);
			metal.addColorStop(0, "#C5CCD6");
			metal.addColorStop(.35, "#F2F5FA");
			metal.addColorStop(.7, "#9DA6B4");
			metal.addColorStop(1, "#D8DFE8");
			g.fillStyle = metal;
			g.fillRect(shX, 0, shW, shH);
			g.fillStyle = shellColor;
			g.fillRect(shX + shW * .62, 10, shW * .22, 38);
			const m = 34;
			const topY = 70;
			g.fillStyle = P.surface;
			roundedRect(g, m, topY, W - 68, H - topY - m, 10);
			g.fill();
			g.fillStyle = bg;
			g.fillRect(m, topY, W - 68, 14);
			g.strokeStyle = "rgba(20,24,36,0.07)";
			g.lineWidth = 2;
			for (let y = 138; y < H - m - 24; y += 52) {
				g.beginPath();
				g.moveTo(54, y);
				g.lineTo(W - m - 20, y);
				g.stroke();
			}
			g.fillStyle = "#0F1218";
			g.fillRect(12, H - 28, 14, 14);
			g.fillRect(W - 26, H - 28, 14, 14);
			g.restore();
			return true;
		}
		case "plaque": {
			const frameW = 24;
			g.fillStyle = "#141316";
			roundedRect(g, 0, 0, W, H, 18);
			g.fill();
			const gold = g.createLinearGradient(0, 0, W, H);
			gold.addColorStop(0, "#FFF1B8");
			gold.addColorStop(.3, "#D4AF37");
			gold.addColorStop(.55, "#8F6B14");
			gold.addColorStop(.8, "#F5D77F");
			gold.addColorStop(1, "#B38728");
			g.fillStyle = gold;
			roundedRect(g, 19, 19, W - 38, H - 38, 10);
			g.fill();
			const mat = g.createRadialGradient(W * .5, H * .4, 20, W * .5, H * .4, Math.max(W, H) * .7);
			mat.addColorStop(0, mixHex(bg, "#1C1B22", .82));
			mat.addColorStop(1, "#09090C");
			g.fillStyle = mat;
			roundedRect(g, frameW, frameW, W - 48, H - 48, 8);
			g.fill();
			g.save();
			roundedRect(g, frameW, frameW, W - 48, H - 48, 8);
			g.clip();
			const gx = W * .82;
			const gy = H * .24;
			const gr = minSide * .34;
			const disc = g.createRadialGradient(gx, gy, gr * .15, gx, gy, gr);
			disc.addColorStop(0, rgba(bg, .28));
			disc.addColorStop(.32, "rgba(212,175,55,0.22)");
			disc.addColorStop(.75, "rgba(255,241,184,0.14)");
			disc.addColorStop(1, "rgba(212,175,55,0.25)");
			g.fillStyle = disc;
			g.beginPath();
			g.arc(gx, gy, gr, 0, Math.PI * 2);
			g.fill();
			g.strokeStyle = "rgba(212,175,55,0.45)";
			g.lineWidth = 1.5;
			g.strokeRect(42, 42, W - 84, H - 84);
			g.restore();
			return true;
		}
		case "vhs": {
			g.fillStyle = "#141216";
			roundedRect(g, 0, 0, W, H, 8);
			g.fill();
			g.save();
			roundedRect(g, 0, 0, W, H, 8);
			g.clip();
			const stripes = [
				mixHex(bg, "#FF2A54", .55),
				"#FF7B1C",
				"#FFD438",
				bg
			];
			const bandTop = 18;
			stripes.forEach((col, i) => {
				g.fillStyle = col;
				g.fillRect(0, bandTop + i * 9, W, 8);
			});
			stripes.forEach((col, i) => {
				g.fillStyle = col;
				g.fillRect(W - 36 + i * 7, 0, 6, H);
			});
			g.fillStyle = "#FAF5E8";
			g.strokeStyle = "#FAF5E8";
			g.lineWidth = 2;
			roundedRect(g, W - 168, 66, 114, 26, 4);
			g.stroke();
			g.font = `700 13px ${FONT}`;
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText("VHS · HI-FI", W - 111, 79);
			g.textAlign = "left";
			g.textBaseline = "alphabetic";
			g.strokeStyle = "rgba(255,250,235,0.18)";
			g.lineWidth = 4;
			roundedRect(g, 2, 2, W - 4, H - 4, 8);
			g.stroke();
			g.restore();
			return true;
		}
		case "stamp": {
			const step = 36;
			const pr = 9;
			const stampPath = (c) => {
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
			g.shadowColor = "rgba(0,0,0,0.38)";
			g.shadowBlur = 24 * unit;
			g.shadowOffsetY = 12 * unit;
			g.fillStyle = P.surface;
			stampPath(g);
			g.fill();
			g.restore();
			g.save();
			stampPath(g);
			g.clip();
			const m = 34;
			g.fillStyle = rgba(bg, .14);
			g.fillRect(m, m, W - 68, H - 68);
			g.strokeStyle = mixHex(bg, "#1C1814", .45);
			g.lineWidth = 4;
			g.strokeRect(m, m, W - 68, H - 68);
			g.lineWidth = 1.5;
			g.strokeRect(42, 42, W - 84, H - 84);
			g.fillStyle = P.text;
			g.font = `700 26px 'Playfair Display', Georgia, serif`;
			g.textAlign = "right";
			g.textBaseline = "top";
			g.fillText("78¢ · AIR MAIL", W - m - 20, 50);
			g.textAlign = "left";
			g.save();
			g.translate(W - 140, H - 110);
			g.rotate(-.14);
			g.strokeStyle = "rgba(28,24,20,0.28)";
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
		case "filmstrip": {
			const railW = Math.max(54, Math.round(W * .068));
			const frameGrad = g.createRadialGradient(W * .5, H * .48, 20, W * .5, H * .48, Math.max(W, H) * .65);
			frameGrad.addColorStop(0, mixHex(bg, "#281A12", .62));
			frameGrad.addColorStop(1, P.surface);
			g.fillStyle = frameGrad;
			roundedRect(g, 0, 0, W, H, 6);
			g.fill();
			g.fillStyle = "#0A0908";
			g.fillRect(0, 0, railW, H);
			g.fillRect(W - railW, 0, railW, H);
			const holeStep = 64;
			const holeW = Math.round(railW * .46);
			const holeH = 34;
			const holeXLeft = Math.round((railW - holeW) / 2);
			const holeXRight = W - railW + holeXLeft;
			for (let y = 26; y + holeH < H - 16; y += holeStep) {
				g.fillStyle = "#1E1B18";
				roundedRect(g, holeXLeft, y, holeW, holeH, 5);
				g.fill();
				roundedRect(g, holeXRight, y, holeW, holeH, 5);
				g.fill();
			}
			g.save();
			g.fillStyle = "#FFA336";
			g.font = `700 13px 'Courier New', monospace`;
			g.translate(railW - 6, H * .25);
			g.rotate(-Math.PI / 2);
			g.fillText("KODAK 5219 · 36A", 0, 0);
			g.restore();
			g.save();
			g.fillStyle = "#FFA336";
			g.font = `700 13px 'Courier New', monospace`;
			g.translate(W - railW + 14, H * .72);
			g.rotate(Math.PI / 2);
			g.fillText("► 36A   ► 37", 0, 0);
			g.restore();
			g.strokeStyle = "rgba(255,163,54,0.35)";
			g.lineWidth = 2;
			g.strokeRect(railW + 4, 14, W - (railW + 4) * 2, H - 28);
			return true;
		}
		case "vippass": {
			g.fillStyle = P.surface;
			roundedRect(g, 0, 0, W, H, 28);
			g.fill();
			g.save();
			roundedRect(g, 0, 0, W, H, 28);
			g.clip();
			const bandH = 68;
			g.fillStyle = bg;
			g.fillRect(0, 0, W, bandH);
			const slotW = 116;
			const slotH = 20;
			const slotX = (W - slotW) / 2;
			const slotY = 18;
			g.fillStyle = "#07080C";
			roundedRect(g, slotX, slotY, slotW, slotH, 10);
			g.fill();
			g.strokeStyle = "rgba(255,255,255,0.5)";
			g.lineWidth = 2;
			g.stroke();
			g.fillStyle = luma(bg) > 150 ? "#111111" : "#FFFFFF";
			g.font = `700 16px ${FONT}`;
			g.textBaseline = "middle";
			g.fillText("VIP · TOUR", 32, 38);
			g.textAlign = "right";
			g.fillText("ALL ACCESS", W - 32, 38);
			g.textAlign = "left";
			const holo = g.createLinearGradient(0, bandH, 0, H);
			[
				"#FF4FD8",
				"#4FE3FF",
				"#FFF36B",
				"#6BFF9E",
				"#A855F7"
			].forEach((c, i, arr) => holo.addColorStop(i / (arr.length - 1), c));
			g.fillStyle = holo;
			g.globalAlpha = .72;
			g.fillRect(W - 18, bandH, 10, H - bandH);
			g.globalAlpha = 1;
			g.restore();
			g.strokeStyle = "rgba(255,255,255,0.35)";
			g.lineWidth = 3;
			roundedRect(g, 1.5, 1.5, W - 3, H - 3, 27);
			g.stroke();
			return true;
		}
		case "boarding": {
			cardDrop$1(g, W, H, 22, P.surface, 28, 14, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, 22);
			g.clip();
			const topH = 54;
			g.fillStyle = bg;
			g.fillRect(0, 0, W, topH);
			g.fillStyle = luma(bg) > 150 ? "#111111" : "#FFFFFF";
			g.font = `700 16px 'Courier New', monospace`;
			g.textBaseline = "middle";
			g.fillText("✈ LYRIC AIRWAYS · BOARDING PASS", 34, topH / 2);
			g.textAlign = "right";
			g.fillText("PRIORITY · ZONE 1", W - 34, topH / 2);
			g.textAlign = "left";
			const divY = H - 56;
			g.strokeStyle = "rgba(20,26,38,0.25)";
			g.lineWidth = 2.5;
			g.setLineDash([8, 8]);
			g.beginPath();
			g.moveTo(24, divY);
			g.lineTo(W - 24, divY);
			g.stroke();
			g.setLineDash([]);
			g.fillStyle = "rgba(20,26,38,0.55)";
			g.font = `700 13px 'Courier New', monospace`;
			g.fillText("GATE A12   ·   SEAT 01A   ·   SEQ 0042", 34, H - 28);
			g.restore();
			return true;
		}
		case "matchbook": {
			cardDrop$1(g, W, H, 16, P.surface, 28, 14, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, 16);
			g.clip();
			const ink = P.text;
			g.strokeStyle = rgba(ink, .45);
			g.lineWidth = 3;
			roundedRect(g, 22, 22, W - 44, H - 84, 8);
			g.stroke();
			g.lineWidth = 1.2;
			roundedRect(g, 29, 29, W - 58, H - 98, 5);
			g.stroke();
			const stH = 44;
			const stY = H - stH;
			g.fillStyle = "#382218";
			g.fillRect(0, stY, W, stH);
			g.fillStyle = "rgba(255,220,180,0.16)";
			for (let i = 0; i < 220; i++) g.fillRect(i * 97 % W, stY + i * 31 % stH, 2, 2);
			g.fillStyle = "#D4AF37";
			g.fillRect(0, stY - 3, W, 3);
			g.fillStyle = "rgba(250,240,220,0.75)";
			g.font = `700 12px ${FONT}`;
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText("CLOSE COVER BEFORE STRIKING", W / 2, stY + stH / 2);
			g.textAlign = "left";
			g.restore();
			return true;
		}
		case "manga": {
			if (state.cardDepth === 0) {
				g.fillStyle = "#111111";
				g.fillRect(10, 10, W, H);
			}
			g.fillStyle = P.surface;
			g.fillRect(0, 0, W, H);
			g.save();
			g.beginPath();
			g.rect(14, 14, W - 28, H - 28);
			g.clip();
			g.fillStyle = "rgba(17,17,17,0.14)";
			const step = 14;
			for (let y = 14; y < H - 14; y += step) for (let x = 14; x < W - 14; x += step) {
				const distCorner = Math.min(Math.hypot(x, y), Math.hypot(W - x, H - y));
				if (distCorner > minSide * .42) continue;
				const r = (1 - distCorner / (minSide * .42)) * 3.5;
				g.beginPath();
				g.arc(x, y, r, 0, Math.PI * 2);
				g.fill();
			}
			const cx = W * .5;
			const cy = H * .5;
			const outerR = Math.hypot(W, H) * .7;
			const innerR = minSide * .43;
			g.strokeStyle = "rgba(17,17,17,0.22)";
			for (let i = 0; i < 72; i++) {
				const a = i / 72 * Math.PI * 2;
				const r0 = innerR + i * 19 % 36;
				g.lineWidth = i % 3 === 0 ? 2.4 : 1.1;
				g.beginPath();
				g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
				g.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
				g.stroke();
			}
			g.fillStyle = "#111111";
			g.fillRect(W - 58, 26, 32, 92);
			g.fillStyle = "#FAF8F2";
			g.font = `700 18px ${FONT}`;
			g.textAlign = "center";
			g.textBaseline = "top";
			g.fillText("音", W - 42, 36);
			g.fillText("楽", W - 42, 62);
			g.textAlign = "left";
			g.restore();
			g.strokeStyle = "#111111";
			g.lineWidth = 10;
			g.strokeRect(5, 5, W - 10, H - 10);
			g.lineWidth = 2.5;
			g.strokeRect(16, 16, W - 32, H - 32);
			return true;
		}
		case "risograph": {
			cardDrop$1(g, W, H, 8, P.surface, 26, 12, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, 8);
			g.clip();
			const inkA = rgba(bg, .22);
			g.strokeStyle = rgba(mixHex(bg, "#FF2A6D", .7), .18);
			g.lineWidth = 6;
			g.strokeRect(32, 30, W - 56, H - 56);
			g.strokeStyle = inkA;
			g.lineWidth = 6;
			g.strokeRect(24, 24, W - 56, H - 56);
			g.fillStyle = rgba(mixHex(bg, "#111111", .4), .08);
			for (let i = 0; i < 320; i++) g.fillRect(i * 151 % W, i * 83 % H, 2, 2);
			g.strokeStyle = rgba(P.text, .55);
			g.lineWidth = 1.5;
			for (const [cx, cy] of [
				[24, 24],
				[W - 24, 24],
				[24, H - 24],
				[W - 24, H - 24]
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
		case "waxseal": {
			cardDrop$1(g, W, H, 10, P.surface, 28, 14, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, 10);
			g.clip();
			const paper = g.createLinearGradient(0, 0, W, H);
			paper.addColorStop(0, "#FFFDF7");
			paper.addColorStop(1, "#EFE7D4");
			g.fillStyle = paper;
			g.fillRect(0, 0, W, H);
			g.strokeStyle = "rgba(36,29,24,0.28)";
			g.lineWidth = 2;
			g.strokeRect(24, 24, W - 48, H - 48);
			g.lineWidth = 1;
			g.strokeRect(30, 30, W - 60, H - 60);
			const wx = W - 64;
			const wy = 64;
			const wr = 32;
			const waxCol = mixHex(bg, "#9E1B24", .65);
			g.save();
			g.shadowColor = "rgba(0,0,0,0.32)";
			g.shadowBlur = 10;
			g.shadowOffsetY = 4;
			g.fillStyle = waxCol;
			g.beginPath();
			for (let i = 0; i < 20; i++) {
				const a = i / 20 * Math.PI * 2;
				const r = wr + (i % 2 ? 2.5 : -1.5);
				g[i ? "lineTo" : "moveTo"](wx + Math.cos(a) * r, wy + Math.sin(a) * r);
			}
			g.closePath();
			g.fill();
			g.restore();
			g.strokeStyle = mixHex(waxCol, "#000000", .35);
			g.lineWidth = 3;
			g.beginPath();
			g.arc(wx, wy, wr * .72, 0, Math.PI * 2);
			g.stroke();
			g.strokeStyle = "rgba(255,255,255,0.35)";
			g.lineWidth = 2;
			g.beginPath();
			g.arc(wx - 2, 62, wr * .72, Math.PI * .8, Math.PI * 1.6);
			g.stroke();
			g.restore();
			return true;
		}
		case "blueprint":
			g.fillStyle = P.surface;
			roundedRect(g, 0, 0, W, H, 4);
			g.fill();
			g.save();
			roundedRect(g, 0, 0, W, H, 4);
			g.clip();
			g.strokeStyle = "rgba(240,247,255,0.08)";
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
			g.strokeStyle = "rgba(240,247,255,0.18)";
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
			g.strokeStyle = "rgba(240,247,255,0.82)";
			g.lineWidth = 3;
			g.strokeRect(20, 20, W - 40, H - 40);
			g.lineWidth = 1.5;
			g.strokeRect(28, 28, W - 56, H - 56);
			g.fillStyle = "rgba(240,247,255,0.75)";
			g.font = `700 13px 'Courier New', monospace`;
			g.textAlign = "right";
			g.fillText(`SCALE 1:1 · ${W}x${H}MM · DWG SM-01`, W - 38, 48);
			g.textAlign = "left";
			g.restore();
			return true;
		case "tarot": {
			g.fillStyle = P.surface;
			roundedRect(g, 0, 0, W, H, 28);
			g.fill();
			g.save();
			roundedRect(g, 0, 0, W, H, 28);
			g.clip();
			const gold = "#E6C36A";
			const mystic = g.createRadialGradient(W * .5, H * .45, 10, W * .5, H * .45, Math.max(W, H) * .6);
			mystic.addColorStop(0, rgba(bg, .28));
			mystic.addColorStop(1, "rgba(0,0,0,0)");
			g.fillStyle = mystic;
			g.fillRect(0, 0, W, H);
			g.strokeStyle = gold;
			g.lineWidth = 4;
			roundedRect(g, 20, 20, W - 40, H - 40, 18);
			g.stroke();
			g.lineWidth = 1.5;
			roundedRect(g, 30, 30, W - 60, H - 60, 12);
			g.stroke();
			const cw = 130;
			const ch = 26;
			g.fillStyle = P.surface;
			g.fillRect((W - cw) / 2, 16, cw, ch);
			g.strokeStyle = gold;
			g.lineWidth = 2;
			g.strokeRect((W - cw) / 2, 16, cw, ch);
			g.fillStyle = gold;
			g.font = `700 15px 'Playfair Display', Georgia, serif`;
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText("XVII · THE STAR", W / 2, 29);
			g.textAlign = "left";
			g.textBaseline = "alphabetic";
			for (const [sx, sy] of [
				[48, 48],
				[W - 48, 48],
				[48, H - 48],
				[W - 48, H - 48]
			]) {
				g.fillStyle = gold;
				g.beginPath();
				g.arc(sx, sy, 4, 0, Math.PI * 2);
				g.fill();
			}
			g.restore();
			return true;
		}
		case "ipod": {
			const bodyGrad = g.createLinearGradient(0, 0, W, H);
			bodyGrad.addColorStop(0, mixHex(bg, "#F2F4F8", .78));
			bodyGrad.addColorStop(.5, mixHex(bg, "#D8DEE8", .75));
			bodyGrad.addColorStop(1, mixHex(bg, "#B8C2D0", .72));
			g.fillStyle = bodyGrad;
			roundedRect(g, 0, 0, W, H, 44);
			g.fill();
			const m = 24;
			g.fillStyle = "#181C24";
			roundedRect(g, m, m, W - 48, H - 48, 24);
			g.fill();
			const sm = 34;
			const lcd = g.createLinearGradient(0, sm, 0, H - sm);
			lcd.addColorStop(0, "#FFFFFF");
			lcd.addColorStop(1, "#EEF3F9");
			g.fillStyle = lcd;
			roundedRect(g, sm, sm, W - 68, H - 68, 16);
			g.fill();
			g.save();
			roundedRect(g, sm, sm, W - 68, H - 68, 16);
			g.clip();
			const sbH = 34;
			const sbGrad = g.createLinearGradient(0, sm, 0, 68);
			sbGrad.addColorStop(0, "#F5F7FA");
			sbGrad.addColorStop(1, "#DCE3EC");
			g.fillStyle = sbGrad;
			g.fillRect(sm, sm, W - 68, sbH);
			g.fillStyle = "rgba(0,0,0,0.15)";
			g.fillRect(sm, 68, W - 68, 1.5);
			g.fillStyle = "#1D2430";
			g.font = `700 14px ${FONT}`;
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText("Now Playing", W / 2, 51);
			g.textAlign = "left";
			const bx = W - sm - 46;
			const by = 44;
			g.strokeStyle = "#3A4659";
			g.lineWidth = 2;
			g.strokeRect(bx, by, 26, 13);
			g.fillStyle = "#3A4659";
			g.fillRect(bx + 26, 47, 3, 7);
			g.fillStyle = "#28C941";
			g.fillRect(bx + 2, 46, 19, 9);
			g.restore();
			g.strokeStyle = "rgba(255,255,255,0.85)";
			g.lineWidth = 4;
			roundedRect(g, 2, 2, W - 4, H - 4, 42);
			g.stroke();
			return true;
		}
		case "terminal": {
			g.fillStyle = P.surface;
			roundedRect(g, 0, 0, W, H, 20);
			g.fill();
			const phosphor = P.neon || "#39FF88";
			g.save();
			roundedRect(g, 0, 0, W, H, 20);
			g.clip();
			const crt = g.createRadialGradient(W * .5, H * .5, 20, W * .5, H * .5, Math.max(W, H) * .65);
			crt.addColorStop(0, rgba(phosphor, .14));
			crt.addColorStop(1, "rgba(0,0,0,0.35)");
			g.fillStyle = crt;
			g.fillRect(0, 0, W, H);
			const tbH = 44;
			g.fillStyle = rgba(phosphor, .16);
			g.fillRect(0, 0, W, tbH);
			g.fillStyle = phosphor;
			g.fillRect(0, tbH, W, 2);
			g.font = `700 15px 'Courier New', monospace`;
			g.textBaseline = "middle";
			g.fillText("spotifyman@tty1: ~/now-playing — zsh", 28, tbH / 2);
			g.fillStyle = "rgba(0,0,0,0.22)";
			for (let y = 48; y < H; y += 5) g.fillRect(0, y, W, 2);
			g.restore();
			g.strokeStyle = rgba(phosphor, .72);
			g.lineWidth = 3;
			roundedRect(g, 1.5, 1.5, W - 3, H - 3, 18.5);
			g.stroke();
			return true;
		}
		case "aqua": {
			cardDrop$1(g, W, H, 26, P.surface, 32, 16, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, 26);
			g.clip();
			g.fillStyle = "#F8FAFD";
			g.fillRect(0, 0, W, H);
			g.fillStyle = "rgba(180,196,220,0.14)";
			for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2);
			const tbH = 48;
			const tb = g.createLinearGradient(0, 0, 0, tbH);
			tb.addColorStop(0, "#FFFFFF");
			tb.addColorStop(.5, "#E4EAF2");
			tb.addColorStop(.52, "#D0D9E6");
			tb.addColorStop(1, "#EAEEF5");
			g.fillStyle = tb;
			g.fillRect(0, 0, W, tbH);
			g.fillStyle = "rgba(0,0,0,0.18)";
			g.fillRect(0, tbH, W, 1.5);
			for (const [lx, fillCol, rimCol] of [
				[
					28,
					"#FF5F57",
					"#B81D13"
				],
				[
					54,
					"#FEBC2E",
					"#B57C00"
				],
				[
					80,
					"#28C840",
					"#117A21"
				]
			]) {
				g.fillStyle = fillCol;
				g.beginPath();
				g.arc(lx, tbH / 2, 9, 0, Math.PI * 2);
				g.fill();
				g.strokeStyle = rimCol;
				g.lineWidth = 1.5;
				g.stroke();
				g.fillStyle = "rgba(255,255,255,0.75)";
				g.beginPath();
				g.ellipse(lx, tbH / 2 - 4, 4.5, 2.2, 0, 0, Math.PI * 2);
				g.fill();
			}
			const pillX = W - 64;
			const pillY = tbH / 2 - 7;
			const aquaGel = g.createLinearGradient(0, pillY, 0, 31);
			aquaGel.addColorStop(0, mixHex(bg, "#7CE0FF", .6));
			aquaGel.addColorStop(1, mixHex(bg, "#0066CC", .6));
			g.fillStyle = aquaGel;
			roundedRect(g, pillX, pillY, 36, 14, 7);
			g.fill();
			g.restore();
			g.strokeStyle = "rgba(0,0,0,0.22)";
			g.lineWidth = 2;
			roundedRect(g, 1, 1, W - 2, H - 2, 25);
			g.stroke();
			return true;
		}
		case "frutiger": {
			cardDrop$1(g, W, H, 44, P.surface, 34, 16, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, 44);
			g.clip();
			const aero = g.createLinearGradient(0, 0, 0, H);
			aero.addColorStop(0, mixHex(bg, "#38BDF8", .62));
			aero.addColorStop(.48, mixHex(bg, "#0284C7", .55));
			aero.addColorStop(.52, mixHex(bg, "#0369A1", .62));
			aero.addColorStop(1, mixHex(bg, "#10B981", .52));
			g.fillStyle = aero;
			g.fillRect(0, 0, W, H);
			const gloss = g.createLinearGradient(0, 0, 0, H * .52);
			gloss.addColorStop(0, "rgba(255,255,255,0.58)");
			gloss.addColorStop(.7, "rgba(255,255,255,0.12)");
			gloss.addColorStop(1, "rgba(255,255,255,0.24)");
			g.fillStyle = gloss;
			g.beginPath();
			g.moveTo(0, 0);
			g.lineTo(W, 0);
			g.lineTo(W, H * .36);
			g.quadraticCurveTo(W * .45, H * .54, 0, H * .42);
			g.closePath();
			g.fill();
			for (const [bx, by, br] of [
				[
					.86,
					.2,
					46
				],
				[
					.91,
					.31,
					22
				],
				[
					.14,
					.84,
					38
				],
				[
					.78,
					.82,
					54
				]
			]) {
				const cx = W * bx;
				const cy = H * by;
				const orb = g.createRadialGradient(cx - br * .3, cy - br * .3, 2, cx, cy, br);
				orb.addColorStop(0, "rgba(255,255,255,0.65)");
				orb.addColorStop(.45, "rgba(255,255,255,0.12)");
				orb.addColorStop(.85, "rgba(255,255,255,0.05)");
				orb.addColorStop(1, "rgba(255,255,255,0.38)");
				g.fillStyle = orb;
				g.beginPath();
				g.arc(cx, cy, br, 0, Math.PI * 2);
				g.fill();
			}
			g.restore();
			g.strokeStyle = "rgba(255,255,255,0.78)";
			g.lineWidth = 4;
			roundedRect(g, 2, 2, W - 4, H - 4, 42);
			g.stroke();
			return true;
		}
		case "swiss": {
			if (state.cardDepth === 0) {
				g.fillStyle = "#111111";
				g.fillRect(10, 10, W, H);
			}
			g.fillStyle = P.surface;
			g.fillRect(0, 0, W, H);
			const f = cardFrame(layout, theme, state.hide);
			const gridY1 = Math.round(f.ltop - layout.lyricGap * .48);
			const gridY2 = Math.round(f.y1 - layout.logo - layout.logoGap * .55);
			g.fillStyle = bg;
			g.fillRect(W - 44, 0, 44, gridY1);
			g.fillStyle = "#111111";
			g.fillRect(0, 0, W, 8);
			g.fillRect(0, gridY1, W, 3);
			if (!state.hide.logo) g.fillRect(0, gridY2, W, 2);
			const colX = Math.max(24, Math.round(f.lx * .42));
			g.fillRect(colX, 0, 2, H);
			g.save();
			g.translate(colX / 2, H / 2);
			g.rotate(-Math.PI / 2);
			g.fillStyle = "rgba(17,17,17,0.55)";
			g.font = `700 12px ${FONT}`;
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText("ZÜRICH · KUNSTHALLE · NR. 04", 0, 0);
			g.restore();
			g.strokeStyle = "#111111";
			g.lineWidth = 6;
			g.strokeRect(3, 3, W - 6, H - 6);
			return true;
		}
	}
	return false;
}
function getPalette(theme, bg) {
	const P = {
		text: contrastColor(bg),
		surface: bg,
		glow: null,
		wall: mixHex(bg, "#000000", .45),
		neon: null,
		shadowDark: null,
		passes: [{
			dx: 0,
			dy: 0,
			color: contrastColor(bg),
			main: true
		}]
	};
	if (applySignaturePalette(theme, P, bg)) {
		if (!P.wall) P.wall = mixHex(P.surface, "#000000", .45);
		return P;
	}
	if (applyCollectorPalette(theme, P, bg)) {
		if (!P.wall) P.wall = mixHex(P.surface, "#000000", .45);
		return P;
	}
	switch (theme) {
		case "cyberpunk":
			P.neon = luma(bg) < 90 ? mixHex(bg, "#ffffff", .55) : mixHex(bg, "#ffffff", .2);
			P.text = P.neon;
			P.glow = bg;
			P.wall = mixHex(P.neon, "#000000", .62);
			break;
		case "glass":
			P.text = "#FFFFFF";
			break;
		case "vinyl":
			P.surface = mixHex(bg, "#17171B", .8);
			P.text = "#F7F7F7";
			break;
		case "aurora":
			P.surface = mixHex(bg, "#070B16", .82);
			P.text = "#F5F9FF";
			break;
		case "ticket":
			P.surface = mixHex(bg, "#ffffff", .9);
			P.text = mixHex(bg, "#000000", .72);
			break;
		case "polaroid":
			P.surface = "#FAF7F0";
			P.text = "#242220";
			break;
		case "y2k":
			P.surface = mixHex(bg, "#EDF2FF", .68);
			P.text = "#111322";
			break;
		case "pixel":
			P.surface = mixHex(bg, "#F4F4EE", .86);
			P.text = "#111111";
			break;
		case "notebook":
			P.surface = "#FCF8EC";
			P.text = "#22304D";
			break;
		case "newspaper":
			P.surface = "#ECE5D4";
			P.text = "#181614";
			break;
		case "holo":
			P.surface = mixHex(bg, "#000000", .82);
			P.text = "#FFFFFF";
			break;
		case "cassette":
			P.surface = mixHex(bg, "#F2E8D0", .88);
			P.text = "#2A2118";
			break;
		case "receipt":
			P.surface = "#FAF9F4";
			P.text = "#1A1A1A";
			break;
		case "gameboy":
			P.surface = "#9BBC0F";
			P.text = "#0F380F";
			break;
		case "stained":
			P.surface = mixHex(bg, "#000000", .5);
			P.text = "#FFFFFF";
			break;
		case "comic":
			P.surface = mixHex(bg, "#ffffff", .86);
			P.text = "#111111";
			break;
		case "neon":
			P.neon = luma(bg) < 90 ? mixHex(bg, "#ffffff", .55) : mixHex(bg, "#ffffff", .25);
			P.text = P.neon;
			P.glow = bg;
			P.surface = "#0D0A10";
			P.wall = mixHex(P.neon, "#000000", .62);
			break;
		case "clay":
			P.surface = mixHex(bg, "#FFFFFF", .42);
			P.text = luma(P.surface) > 142 ? mixHex(bg, "#111111", .72) : "#FFFFFF";
			break;
		case "neumorphism":
			P.surface = mixHex(bg, "#E9EDF2", .72);
			P.text = mixHex(bg, "#161B24", .76);
			P.shadowDark = rgba(mixHex(bg, "#000000", .48), .45);
	}
	if (!P.wall) P.wall = mixHex(P.surface, "#000000", .45);
	P.passes = [{
		dx: 0,
		dy: 0,
		color: P.text,
		main: true
	}];
	return P;
}
var patternCache = /* @__PURE__ */ new Map();
function tilePattern(ctx, key, size, draw) {
	if (patternCache.has(key)) return patternCache.get(key) || null;
	const c = document.createElement("canvas");
	c.width = c.height = size;
	const cx = c.getContext("2d");
	if (cx) draw(cx, size);
	const p = ctx.createPattern(c, "repeat");
	if (patternCache.size > 50) patternCache.clear();
	patternCache.set(key, p);
	return p;
}
function sparkle(g, x, y, r, color) {
	g.fillStyle = color;
	g.beginPath();
	g.moveTo(x, y - r);
	g.quadraticCurveTo(x, y, x + r, y);
	g.quadraticCurveTo(x, y, x, y + r);
	g.quadraticCurveTo(x, y, x - r, y);
	g.quadraticCurveTo(x, y, x, y - r);
	g.fill();
}
function cardDrop(g, W, H, R, fill, blur = 30, oy = 14, unit = 1) {
	g.save();
	g.shadowColor = "rgba(0,0,0,0.42)";
	g.shadowBlur = blur * unit;
	g.shadowOffsetX = 0;
	g.shadowOffsetY = oy * unit;
	g.fillStyle = fill;
	roundedRect(g, 0, 0, W, H, R);
	g.fill();
	g.restore();
}
var stubCache = {
	key: "",
	bars: [],
	no: ""
};
function stubBars(title, artist) {
	const key = `${title}|${artist}`;
	if (stubCache.key !== key) {
		let h = 2166136261;
		for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619) >>> 0;
		const rnd = () => {
			h = h + 1831565813 >>> 0;
			let t = h;
			t = Math.imul(t ^ t >>> 15, t | 1);
			t ^= t + Math.imul(t ^ t >>> 7, t | 61);
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
		const bars = [
			1,
			1,
			1
		];
		let sum = 3;
		while (sum < 110) {
			const w = [
				1,
				1,
				2,
				2,
				3,
				4
			][Math.floor(rnd() * 6)];
			bars.push(w);
			sum += w;
		}
		bars.push(1, 1, 1);
		stubCache.bars = bars;
		stubCache.no = "No. " + String(Math.floor(rnd() * 9e5) + 1e5);
		stubCache.key = key;
	}
	return stubCache;
}
function drawStub(g, P, st, layout, title, artist) {
	const W = layout.w;
	const H = layout.h;
	const c = stubBars(title, artist);
	g.save();
	if (st.v) {
		g.translate(st.at + st.len / 2, H / 2);
		g.rotate(Math.PI / 2);
	} else g.translate(W / 2, st.at + st.len / 2);
	const lw = (st.v ? H : W) - 150;
	const lh = st.len - (st.v ? 72 : 56);
	const top = -lh / 2;
	const fs = 22;
	g.fillStyle = P.text;
	g.textBaseline = "top";
	g.font = `600 ${fs}px ${FONT}`;
	letterSpacing(g, 0);
	g.globalAlpha = .8;
	g.textAlign = "left";
	g.fillText("Admit one", -lw / 2, top);
	g.textAlign = "right";
	g.fillText(c.no, lw / 2, top);
	g.globalAlpha = 1;
	g.textAlign = "left";
	const u = lw / c.bars.reduce((a, b) => a + b, 0);
	const y0 = top + fs + 16;
	const bh = lh - fs - 16;
	let x = -lw / 2;
	c.bars.forEach((w, i) => {
		if (i % 2 === 0) g.fillRect(x, y0, w * u, bh);
		x += w * u;
	});
	g.restore();
}
var blurBgImg = null;
var blurBgCanvas = null;
function blurredCover(coverImg) {
	if (!coverImg || !coverImg.naturalWidth) return null;
	if (blurBgImg === coverImg && blurBgCanvas) return blurBgCanvas;
	let cur = document.createElement("canvas");
	cur.width = cur.height = 24;
	const cx = cur.getContext("2d");
	if (!cx) return null;
	cx.drawImage(coverImg, 0, 0, 24, 24);
	for (const n of [
		64,
		160,
		256
	]) {
		const nx = document.createElement("canvas");
		nx.width = nx.height = n;
		const nc = nx.getContext("2d");
		if (nc) {
			nc.imageSmoothingQuality = "high";
			nc.drawImage(cur, 0, 0, n, n);
		}
		cur = nx;
	}
	blurBgImg = coverImg;
	blurBgCanvas = cur;
	return cur;
}
function paintMetalBackground(g, W, H, radius, bg, fullBleed) {
	const silver = "#D3D6DC";
	const linear = g.createLinearGradient(0, 0, W, H);
	[
		[0, mixHex(bg, silver, .4)],
		[.3, mixHex(bg, silver, .1)],
		[.52, mixHex(bg, "#FFFFFF", .16)],
		[.76, mixHex(bg, "#000000", .1)],
		[1, mixHex(bg, "#000000", .24)]
	].forEach(([p, c]) => linear.addColorStop(p, c));
	const hx = W * .82;
	const hy = -H * .05;
	const radial = g.createRadialGradient(hx, hy, 0, hx, hy, W * .6);
	radial.addColorStop(0, "rgba(255,255,255,0.22)");
	radial.addColorStop(1, "rgba(255,255,255,0)");
	const bevel = g.createLinearGradient(0, 0, 0, H);
	bevel.addColorStop(0, "rgba(255,255,255,0.40)");
	bevel.addColorStop(.35, "rgba(255,255,255,0.06)");
	bevel.addColorStop(1, "rgba(255,255,255,0)");
	g.save();
	if (fullBleed) {
		g.beginPath();
		g.rect(0, 0, W, H);
	} else roundedRect(g, 0, 0, W, H, radius);
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
function paintBgStyle(g, layout, bgStyle, bg, fullBleed, coverImg) {
	const W = layout.w;
	const H = layout.h;
	g.save();
	if (fullBleed) {
		g.beginPath();
		g.rect(0, 0, W, H);
	} else roundedRect(g, 0, 0, W, H, layout.radius);
	g.clip();
	const bc = bgStyle === "blur" ? blurredCover(coverImg) : null;
	if (bc) {
		const k = Math.max(W, H) / 256;
		g.drawImage(bc, (W - 256 * k) / 2, (H - 256 * k) / 2, 256 * k, 256 * k);
		g.fillStyle = "rgba(0,0,0,0.3)";
		g.fillRect(0, 0, W, H);
	} else if (bgStyle === "pattern") {
		g.fillStyle = mixHex(bg, "#000000", .55);
		g.fillRect(0, 0, W, H);
		const pat = tilePattern(g, "bgdots", 40, (c, n) => {
			c.fillStyle = "rgba(255,255,255,0.16)";
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
		a.addColorStop(0, mixHex(bg, "#ffffff", .22));
		a.addColorStop(.55, bg);
		a.addColorStop(1, mixHex(bg, "#000000", .62));
		g.fillStyle = a;
		g.fillRect(0, 0, W, H);
	}
	g.restore();
}
function paintBackdrop(g, layout, theme, bg, P, bgStyle, cardDepth, fullBleed, coverImg) {
	if (bgStyle !== "none") {
		paintBgStyle(g, layout, bgStyle, bg, fullBleed, coverImg);
		return;
	}
	if (theme === "classic") {
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
	} else roundedRect(g, 0, 0, W, H, layout.radius);
	g.clip();
	if (theme === "glass") {
		const base = g.createLinearGradient(0, 0, W, H);
		base.addColorStop(0, mixHex(bg, "#000000", .35));
		base.addColorStop(1, mixHex(bg, "#000000", .72));
		const o1 = g.createRadialGradient(W * .2, H * .2, 0, W * .2, H * .2, W * .55);
		o1.addColorStop(0, rgba(mixHex(bg, "#ffffff", .12), .95));
		o1.addColorStop(1, rgba(bg, 0));
		const accent = mixHex(bg, "#00D4FF", .55);
		const o2 = g.createRadialGradient(W * .86, H * .86, 0, W * .86, H * .86, W * .5);
		o2.addColorStop(0, rgba(accent, .85));
		o2.addColorStop(1, rgba(accent, 0));
		g.fillStyle = base;
		g.fillRect(0, 0, W, H);
		g.fillStyle = o1;
		g.fillRect(0, 0, W, H);
		g.fillStyle = o2;
		g.fillRect(0, 0, W, H);
	} else {
		g.fillStyle = theme === "cyberpunk" || theme === "neon" ? "#0a0a0a" : theme === "neumorphism" ? P.surface : bg;
		g.fillRect(0, 0, W, H);
	}
	g.restore();
}
function paintCardBody(g, state, layout, P, tilt, fullBleed, unit = 1, fixedExtrude = false) {
	const W = layout.w;
	const H = layout.h;
	const theme = state.theme;
	const bg = state.color;
	const R = themeRadius(theme, layout.radius);
	const D = state.cardDepth;
	if (D > 0) extrudeWalls(g, (c, ox, oy) => roundedPath(c, ox, oy, W, H, R), D, tilt, bg, P.wall, theme, {
		x: 0,
		y: 0,
		w: W,
		h: H
	}, fixedExtrude);
	let paintedSignature = false;
	if (fullBleed && D === 0) paintedSignature = paintSignatureBody(g, state, layout, P);
	else {
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
		case "brutalism": {
			if (D === 0) {
				g.fillStyle = "#000000";
				g.fillRect(14, 14, W, H);
			}
			g.fillStyle = bg;
			g.fillRect(0, 0, W, H);
			const bpat = tilePattern(g, "brutdots", 28, (c, n) => {
				c.fillStyle = "rgba(0,0,0,0.08)";
				c.fillRect(n / 2, n / 2, 2, 2);
			});
			if (bpat) {
				g.fillStyle = bpat;
				g.fillRect(12, 12, W - 24, H - 24);
			}
			g.strokeStyle = "#000000";
			g.lineWidth = 10;
			g.strokeRect(5, 5, W - 10, H - 10);
			g.lineWidth = 3;
			g.strokeRect(18, 18, W - 36, H - 36);
			g.fillStyle = "#000000";
			g.fillRect(W - 44, 18, 26, 12);
			break;
		}
		case "cyberpunk": {
			g.fillStyle = "#080910";
			roundedRect(g, 0, 0, W, H, R);
			g.fill();
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const c1 = g.createRadialGradient(W * .12, H * .12, 10, W * .12, H * .12, W * .65);
			c1.addColorStop(0, rgba(P.neon || bg, .22));
			c1.addColorStop(1, "rgba(0,0,0,0)");
			g.fillStyle = c1;
			g.fillRect(0, 0, W, H);
			const c2 = g.createRadialGradient(W * .88, H * .88, 10, W * .88, H * .88, W * .6);
			c2.addColorStop(0, rgba(mixHex(bg, "#00F0FF", .6), .18));
			c2.addColorStop(1, "rgba(0,0,0,0)");
			g.fillStyle = c2;
			g.fillRect(0, 0, W, H);
			g.restore();
			g.save();
			g.shadowColor = bg;
			g.shadowBlur = 18 * unit;
			g.strokeStyle = P.neon || "#00FFCC";
			g.lineWidth = 4;
			roundedRect(g, 3, 3, W - 6, H - 6, Math.max(2, R - 3));
			g.stroke();
			g.restore();
			g.strokeStyle = rgba(mixHex(P.neon || bg, "#00F0FF", .4), .32);
			g.lineWidth = 1.5;
			roundedRect(g, 16, 16, W - 32, H - 32, Math.max(2, R - 14));
			g.stroke();
			break;
		}
		case "glass": {
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const frostBase = g.createLinearGradient(0, 0, W, H);
			frostBase.addColorStop(0, rgba(mixHex(bg, "#141824", .45), .72));
			frostBase.addColorStop(1, rgba(mixHex(bg, "#090B12", .68), .82));
			g.fillStyle = frostBase;
			g.fillRect(0, 0, W, H);
			const orb1 = g.createRadialGradient(W * .18, H * .18, 0, W * .18, H * .18, W * .62);
			orb1.addColorStop(0, rgba(mixHex(bg, "#ffffff", .22), .52));
			orb1.addColorStop(1, "rgba(255,255,255,0)");
			g.fillStyle = orb1;
			g.fillRect(0, 0, W, H);
			const orb2 = g.createRadialGradient(W * .85, H * .82, 0, W * .85, H * .82, W * .58);
			orb2.addColorStop(0, rgba(mixHex(bg, "#00D4FF", .55), .44));
			orb2.addColorStop(1, "rgba(0,0,0,0)");
			g.fillStyle = orb2;
			g.fillRect(0, 0, W, H);
			const shine = g.createLinearGradient(0, 0, W * .85, H * .85);
			shine.addColorStop(0, "rgba(255,255,255,0.34)");
			shine.addColorStop(.28, "rgba(255,255,255,0.12)");
			shine.addColorStop(.55, "rgba(255,255,255,0.02)");
			shine.addColorStop(1, "rgba(255,255,255,0.10)");
			g.fillStyle = shine;
			g.fillRect(0, 0, W, H);
			g.restore();
			const o = 1.5;
			g.lineWidth = 2.5;
			g.lineCap = "round";
			g.strokeStyle = "rgba(255,255,255,0.22)";
			roundedRect(g, o, o, W - 2 * o, H - 2 * o, Math.max(2, R - o));
			g.stroke();
			g.strokeStyle = "rgba(255,255,255,0.88)";
			g.beginPath();
			g.moveTo(o, H - R);
			g.lineTo(o, R);
			g.arcTo(o, o, R, o, Math.max(2, R - o));
			g.lineTo(W - R, o);
			g.stroke();
			g.strokeStyle = "rgba(0,0,0,0.28)";
			g.beginPath();
			g.moveTo(W - o, R);
			g.lineTo(W - o, H - R);
			g.arcTo(W - o, H - o, W - R, H - o, Math.max(2, R - o));
			g.lineTo(R, H - o);
			g.stroke();
			g.lineCap = "butt";
			break;
		}
		case "clay": {
			const inner = g.createLinearGradient(0, 0, W, H);
			inner.addColorStop(0, mixHex(P.surface, "#ffffff", .56));
			inner.addColorStop(.5, P.surface);
			inner.addColorStop(1, mixHex(P.surface, bg, .25));
			const rim = g.createLinearGradient(0, 0, W, H);
			rim.addColorStop(0, "rgba(255,255,255,0.55)");
			rim.addColorStop(.42, "rgba(255,255,255,0)");
			rim.addColorStop(.65, "rgba(0,0,0,0)");
			rim.addColorStop(1, rgba(mixHex(bg, "#000000", .55), .36));
			g.save();
			g.shadowColor = rgba(mixHex(bg, "#000000", .5), .45);
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
			g.strokeStyle = rim;
			g.lineWidth = 34;
			roundedRect(g, 0, 0, W, H, R);
			g.stroke();
			g.fillStyle = "rgba(255,255,255,0.42)";
			g.beginPath();
			g.ellipse(W - 86, 46, 44, 16, .35, 0, Math.PI * 2);
			g.fill();
			g.restore();
			break;
		}
		case "neumorphism": {
			g.save();
			g.fillStyle = P.surface;
			roundedRect(g, 0, 0, W, H, R);
			g.shadowColor = "rgba(255,255,255,0.92)";
			g.shadowBlur = 24 * unit;
			g.shadowOffsetX = -12 * unit;
			g.shadowOffsetY = -12 * unit;
			g.fill();
			g.shadowColor = P.shadowDark || "rgba(0,0,0,0.35)";
			g.shadowOffsetX = 12 * unit;
			g.shadowOffsetY = 12 * unit;
			g.fill();
			g.restore();
			g.save();
			const grad = g.createLinearGradient(0, 0, W, H);
			grad.addColorStop(0, "rgba(255,255,255,0.75)");
			grad.addColorStop(.5, "rgba(255,255,255,0)");
			grad.addColorStop(1, rgba(mixHex(bg, "#000000", .45), .28));
			g.strokeStyle = grad;
			g.lineWidth = 4;
			roundedRect(g, 18, 18, W - 36, H - 36, Math.max(8, R - 16));
			g.stroke();
			g.restore();
			break;
		}
		case "vinyl": {
			cardDrop(g, W, H, R, P.surface, 34, 16, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const jg = g.createLinearGradient(0, 0, W, H);
			jg.addColorStop(0, mixHex(P.surface, "#ffffff", .07));
			jg.addColorStop(.55, P.surface);
			jg.addColorStop(1, mixHex(P.surface, "#000000", .28));
			g.fillStyle = jg;
			g.fillRect(0, 0, W, H);
			const cx = W * .94;
			const cy = H * .94;
			const rr = Math.min(W, H) * .58;
			g.save();
			g.shadowColor = "rgba(0,0,0,0.55)";
			g.shadowBlur = 24;
			g.fillStyle = "#0B0B0E";
			g.beginPath();
			g.arc(cx, cy, rr, 0, Math.PI * 2);
			g.fill();
			g.restore();
			g.strokeStyle = rgba(mixHex(bg, "#ffffff", .45), .32);
			g.lineWidth = 2.5;
			g.beginPath();
			g.arc(cx, cy, rr - 1, 0, Math.PI * 2);
			g.stroke();
			g.lineWidth = 1.5;
			for (let r = rr * .35; r < rr - 8; r += 6.5) {
				g.strokeStyle = `rgba(255,255,255,${(.045 + .055 * Math.abs(Math.sin(r * .65))).toFixed(3)})`;
				g.beginPath();
				g.arc(cx, cy, r, 0, Math.PI * 2);
				g.stroke();
			}
			for (const a of [
				-2.35,
				-1.65,
				.78
			]) {
				const sheen = g.createRadialGradient(cx, cy, rr * .32, cx, cy, rr);
				sheen.addColorStop(0, "rgba(255,255,255,0.02)");
				sheen.addColorStop(.55, "rgba(255,255,255,0.13)");
				sheen.addColorStop(1, "rgba(255,255,255,0.03)");
				g.fillStyle = sheen;
				g.beginPath();
				g.moveTo(cx, cy);
				g.arc(cx, cy, rr, a, a + .38);
				g.closePath();
				g.fill();
			}
			g.fillStyle = bg;
			g.beginPath();
			g.arc(cx, cy, rr * .32, 0, Math.PI * 2);
			g.fill();
			g.strokeStyle = "rgba(0,0,0,0.28)";
			g.lineWidth = 3;
			g.beginPath();
			g.arc(cx, cy, rr * .25, 0, Math.PI * 2);
			g.stroke();
			g.strokeStyle = "rgba(255,255,255,0.35)";
			g.lineWidth = 1.5;
			g.beginPath();
			g.arc(cx, cy, rr * .14, 0, Math.PI * 2);
			g.stroke();
			g.fillStyle = "#09090B";
			g.beginPath();
			g.arc(cx, cy, 11, 0, Math.PI * 2);
			g.fill();
			g.strokeStyle = "rgba(255,255,255,0.25)";
			g.lineWidth = 1.5;
			g.stroke();
			g.strokeStyle = "rgba(255,255,255,0.12)";
			g.lineWidth = 2;
			roundedRect(g, 1, 1, W - 2, H - 2, R);
			g.stroke();
			g.restore();
			break;
		}
		case "ticket": {
			const st = cardFrame(layout, theme, state.hide).stub || {
				v: false,
				at: H - 150,
				len: 150
			};
			const nr = 18;
			const ticketPath = (c) => {
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
			g.shadowColor = "rgba(0,0,0,0.42)";
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
			g.strokeStyle = rgba(P.text, .4);
			g.lineWidth = 3;
			g.lineCap = "round";
			g.setLineDash([1, 11]);
			g.beginPath();
			if (st.v) {
				g.moveTo(st.at, 34);
				g.lineTo(st.at, H - nr - 16);
			} else {
				g.moveTo(34, st.at);
				g.lineTo(W - nr - 16, st.at);
			}
			g.stroke();
			g.restore();
			g.save();
			g.strokeStyle = rgba(P.text, .32);
			g.lineWidth = 3;
			g.setLineDash([12, 9]);
			roundedRect(g, 26, 26, st.v ? st.at - 26 - 28 : W - 52, st.v ? H - 52 : st.at - 26 - 28, Math.max(4, R - 12));
			g.stroke();
			g.restore();
			drawStub(g, P, st, layout, state.title, state.artist);
			g.restore();
			break;
		}
		case "polaroid": {
			cardDrop(g, W, H, R, P.surface, 30, 16, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const pg = g.createLinearGradient(0, 0, 0, H);
			pg.addColorStop(0, "#FFFDF9");
			pg.addColorStop(.82, "#F7F3EA");
			pg.addColorStop(1, "#ECE6DA");
			g.fillStyle = pg;
			g.fillRect(0, 0, W, H);
			const wellPad = 32;
			const chinH = Math.round(H * .13);
			g.fillStyle = mixHex(bg, "#F5F0E4", .92);
			g.fillRect(wellPad, wellPad, W - 64, H - wellPad - chinH);
			g.strokeStyle = "rgba(0,0,0,0.10)";
			g.lineWidth = 2.5;
			g.strokeRect(wellPad, wellPad, W - 64, H - wellPad - chinH);
			g.restore();
			g.strokeStyle = "rgba(0,0,0,0.09)";
			g.lineWidth = 2;
			roundedRect(g, 1, 1, W - 2, H - 2, R);
			g.stroke();
			g.save();
			g.translate(W / 2, 16);
			g.rotate(-.04);
			g.fillStyle = "rgba(246,216,136,0.74)";
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
			g.fillStyle = "rgba(255,255,255,0.28)";
			g.fillRect(-94, -18, 188, 11);
			g.restore();
			break;
		}
		case "y2k": {
			cardDrop(g, W, H, R, P.surface, 34, 16, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const gr = g.createLinearGradient(0, 0, 0, H);
			gr.addColorStop(0, "#FFFFFF");
			gr.addColorStop(.28, mixHex(bg, "#E6EEFF", .72));
			gr.addColorStop(.49, mixHex(bg, "#7F9BFF", .42));
			gr.addColorStop(.51, "#FFFFFF");
			gr.addColorStop(.68, mixHex(bg, "#D9E4FF", .65));
			gr.addColorStop(1, mixHex(bg, "#FFFFFF", .85));
			g.fillStyle = gr;
			g.fillRect(0, 0, W, H);
			g.fillStyle = "rgba(255,255,255,0.44)";
			g.beginPath();
			g.ellipse(W * .45, -H * .1, W * .82, H * .3, 0, 0, Math.PI * 2);
			g.fill();
			g.fillStyle = "rgba(255,255,255,0.85)";
			g.fillRect(0, Math.round(H * .5), W, 3);
			sparkle(g, W * .91, H * .1, 30, "rgba(255,255,255,0.96)");
			sparkle(g, W * .84, H * .18, 14, "rgba(255,255,255,0.82)");
			sparkle(g, W * .9, H * .88, 22, "rgba(255,255,255,0.9)");
			g.restore();
			g.strokeStyle = "rgba(255,255,255,0.95)";
			g.lineWidth = 8;
			roundedRect(g, 4, 4, W - 8, H - 8, Math.max(4, R - 4));
			g.stroke();
			g.strokeStyle = rgba(mixHex(bg, "#101428", .55), .48);
			g.lineWidth = 2;
			roundedRect(g, 11, 11, W - 22, H - 22, Math.max(4, R - 11));
			g.stroke();
			break;
		}
		case "aurora": {
			cardDrop(g, W, H, R, P.surface, 34, 16, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const night = g.createLinearGradient(0, 0, 0, H);
			night.addColorStop(0, "#040814");
			night.addColorStop(.55, "#091024");
			night.addColorStop(1, "#050712");
			g.fillStyle = night;
			g.fillRect(0, 0, W, H);
			const ribbons = [
				[
					.14,
					.2,
					.72,
					bg,
					.78
				],
				[
					.86,
					.3,
					.65,
					mixHex(bg, "#00F0C8", .62),
					.68
				],
				[
					.48,
					.88,
					.75,
					mixHex(bg, "#A855F7", .6),
					.65
				],
				[
					.2,
					.78,
					.52,
					mixHex(bg, "#38BDF8", .65),
					.45
				]
			];
			for (const [x, y, k, c, alpha] of ribbons) {
				const rg = g.createRadialGradient(W * x, H * y, 0, W * x, H * y, Math.max(W, H) * k * .68);
				rg.addColorStop(0, rgba(c, alpha));
				rg.addColorStop(.55, rgba(c, alpha * .28));
				rg.addColorStop(1, rgba(c, 0));
				g.fillStyle = rg;
				g.fillRect(0, 0, W, H);
			}
			g.save();
			const waveGrad = g.createLinearGradient(0, H * .15, W, H * .45);
			waveGrad.addColorStop(0, rgba(mixHex(bg, "#00FFAA", .5), 0));
			waveGrad.addColorStop(.35, rgba(mixHex(bg, "#00FFAA", .5), .26));
			waveGrad.addColorStop(.68, rgba(mixHex(bg, "#38BDF8", .55), .24));
			waveGrad.addColorStop(1, rgba(mixHex(bg, "#C084FC", .6), 0));
			g.strokeStyle = waveGrad;
			g.lineWidth = Math.round(Math.min(W, H) * .09);
			g.lineCap = "round";
			g.beginPath();
			g.moveTo(-40, H * .34);
			g.bezierCurveTo(W * .28, H * .14, W * .66, H * .46, W + 40, H * .22);
			g.stroke();
			g.restore();
			g.restore();
			g.strokeStyle = "rgba(255,255,255,0.18)";
			g.lineWidth = 2;
			roundedRect(g, 1, 1, W - 2, H - 2, R);
			g.stroke();
			break;
		}
		case "pixel": {
			if (D === 0) {
				g.fillStyle = "#000000";
				g.fillRect(12, 12, W, H);
			}
			g.fillStyle = P.surface;
			g.fillRect(0, 0, W, H);
			const pat = tilePattern(g, "pxdots", 12, (c, n) => {
				c.fillStyle = "rgba(0,0,0,0.045)";
				c.fillRect(0, 0, n / 2, n / 2);
				c.fillRect(n / 2, n / 2, n / 2, n / 2);
			});
			if (pat) {
				g.fillStyle = pat;
				g.fillRect(0, 0, W, H);
			}
			const barH = 48;
			g.fillStyle = bg;
			g.fillRect(0, 0, W, barH);
			g.fillStyle = "rgba(255,255,255,0.22)";
			for (let y = 10; y < 38; y += 6) g.fillRect(108, y, W - 128, 2);
			g.fillStyle = "#000000";
			g.fillRect(0, 44, W, 6);
			for (let i = 0; i < 3; i++) {
				const bx = 18 + i * 26;
				const by = 14;
				g.fillStyle = "#111111";
				g.fillRect(bx + 2, 16, 16, 16);
				g.fillStyle = i === 0 ? "#FFFFFF" : "rgba(255,255,255,0.75)";
				g.fillRect(bx, by, 16, 16);
				g.strokeStyle = "#000000";
				g.lineWidth = 2;
				g.strokeRect(bx, by, 16, 16);
			}
			g.strokeStyle = "#000000";
			g.lineWidth = 8;
			g.strokeRect(4, 4, W - 8, H - 8);
			break;
		}
		case "notebook": {
			cardDrop(g, W, H, R, P.surface, 28, 14, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const np = g.createLinearGradient(0, 0, W, H);
			np.addColorStop(0, "#FFFDF5");
			np.addColorStop(1, "#F6F0DC");
			g.fillStyle = np;
			g.fillRect(0, 0, W, H);
			g.strokeStyle = "rgba(68,124,210,0.28)";
			g.lineWidth = 2;
			for (let y = 64; y < H; y += 54) {
				g.beginPath();
				g.moveTo(0, y);
				g.lineTo(W, y);
				g.stroke();
			}
			const mx = Math.max(44, layout.pad - 24);
			g.strokeStyle = "rgba(220,68,68,0.48)";
			g.lineWidth = 2.5;
			g.beginPath();
			g.moveTo(mx, 0);
			g.lineTo(mx, H);
			g.moveTo(mx - 6, 0);
			g.lineTo(mx - 6, H);
			g.stroke();
			for (const frac of [
				.18,
				.5,
				.82
			]) {
				const hy = H * frac;
				g.fillStyle = "rgba(0,0,0,0.22)";
				g.beginPath();
				g.arc(20, hy, 12, 0, Math.PI * 2);
				g.fill();
				g.fillStyle = "#E8E1CC";
				g.beginPath();
				g.arc(21.5, hy + 1.5, 10, 0, Math.PI * 2);
				g.fill();
			}
			g.restore();
			break;
		}
		case "newspaper": {
			cardDrop(g, W, H, R, P.surface, 26, 12, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const aged = g.createRadialGradient(W * .5, H * .45, 40, W * .5, H * .45, Math.max(W, H) * .75);
			aged.addColorStop(0, "#F1EBD9");
			aged.addColorStop(1, "#DDD4BE");
			g.fillStyle = aged;
			g.fillRect(0, 0, W, H);
			const pat = tilePattern(g, "halftone", 10, (c, n) => {
				c.fillStyle = "rgba(24,22,20,0.08)";
				c.beginPath();
				c.arc(n / 2, n / 2, 1.3, 0, Math.PI * 2);
				c.fill();
			});
			if (pat) {
				g.fillStyle = pat;
				g.fillRect(0, 0, W, H);
			}
			g.fillStyle = "rgba(24,22,20,0.62)";
			g.font = `700 13px 'Playfair Display', Georgia, serif`;
			g.textBaseline = "middle";
			g.textAlign = "center";
			g.fillText("THE LYRIC CHRONICLE · SPECIAL EDITION", W / 2, 42);
			g.textAlign = "left";
			g.textBaseline = "alphabetic";
			g.strokeStyle = "rgba(24,22,20,0.88)";
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
		case "sticker": {
			const peel = Math.min(W, H) * .14;
			const outerPeel = peel + 16;
			const stickerOutline = (c, ox, oy, sw, sh, sr, cut) => {
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
			g.shadowColor = "rgba(0,0,0,0.4)";
			g.shadowBlur = 24 * unit;
			g.shadowOffsetX = 0;
			g.shadowOffsetY = 12 * unit;
			g.fillStyle = "#ffffff";
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
			sg.addColorStop(0, "rgba(255,255,255,0.22)");
			sg.addColorStop(.45, "rgba(255,255,255,0)");
			g.fillStyle = sg;
			g.fillRect(0, 0, W, H);
			g.restore();
			g.save();
			stickerOutline(g, -16, -16, W + 32, H + 32, R + 16, outerPeel);
			g.clip();
			g.shadowColor = "rgba(0,0,0,0.35)";
			g.shadowBlur = 16 * unit;
			g.shadowOffsetX = -6 * unit;
			g.shadowOffsetY = 6 * unit;
			const flap = g.createLinearGradient(W - peel, 0, W, peel);
			flap.addColorStop(0, "#ffffff");
			flap.addColorStop(.65, mixHex(bg, "#ffffff", .84));
			flap.addColorStop(1, mixHex(bg, "#000000", .12));
			g.fillStyle = flap;
			g.beginPath();
			g.moveTo(W + 16 - outerPeel, -16);
			g.lineTo(W + 16, -16 + outerPeel);
			g.lineTo(W + 16 - outerPeel * .82, -16 + outerPeel * .82);
			g.closePath();
			g.fill();
			g.restore();
			break;
		}
		case "holo": {
			cardDrop(g, W, H, R, P.surface, 34, 16, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const hsl = (h, a) => `hsla(${h},95%,62%,${a})`;
			const fo = g.createLinearGradient(0, 0, W, H);
			[
				0,
				60,
				130,
				190,
				250,
				310,
				360
			].forEach((h, i, a) => fo.addColorStop(i / (a.length - 1), hsl(h, .95)));
			g.fillStyle = fo;
			g.fillRect(0, 0, W, H);
			g.fillStyle = P.surface;
			roundedRect(g, 20, 20, W - 40, H - 40, Math.max(6, R - 14));
			g.fill();
			const sh = g.createLinearGradient(0, H, W, 0);
			[
				0,
				90,
				180,
				270,
				330
			].forEach((h, i, a) => sh.addColorStop(i / (a.length - 1), hsl(h, .16)));
			g.fillStyle = sh;
			roundedRect(g, 20, 20, W - 40, H - 40, Math.max(6, R - 14));
			g.fill();
			sparkle(g, W * .93, H * .07, 20, "rgba(255,255,255,0.9)");
			sparkle(g, W * .87, H * .12, 10, "rgba(255,255,255,0.7)");
			sparkle(g, W * .07, H * .955, 14, "rgba(255,255,255,0.8)");
			g.restore();
			g.strokeStyle = "rgba(255,255,255,0.55)";
			g.lineWidth = 2;
			roundedRect(g, 1, 1, W - 2, H - 2, R);
			g.stroke();
			break;
		}
		case "wrapped": {
			cardDrop(g, W, H, R, bg, 34, 16, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const wg = g.createLinearGradient(0, 0, W, H);
			const m = Math.min(W, H);
			wg.addColorStop(0, mixHex(bg, "#ffffff", .18));
			wg.addColorStop(.55, bg);
			wg.addColorStop(1, mixHex(bg, "#7358FF", .5));
			g.fillStyle = wg;
			g.fillRect(0, 0, W, H);
			g.fillStyle = "rgba(255,255,255,0.10)";
			g.beginPath();
			g.arc(W * .92, H * .12, m * .34, 0, 7);
			g.fill();
			g.fillStyle = "rgba(0,0,0,0.10)";
			g.beginPath();
			g.arc(W * .02, H * .98, m * .42, 0, 7);
			g.fill();
			g.strokeStyle = "rgba(255,255,255,0.14)";
			g.lineWidth = m * .05;
			g.beginPath();
			g.arc(W * .8, H * .9, m * .3, 0, 7);
			g.stroke();
			g.fillStyle = rgba(P.text, .5);
			roundedRect(g, W / 2 - 70, H - 20, 140, 6, 3);
			g.fill();
			g.restore();
			break;
		}
		case "cassette": {
			cardDrop(g, W, H, R, P.surface, 30, 14, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			[
				bg,
				mixHex(bg, "#ffffff", .4),
				mixHex(bg, "#000000", .3),
				bg
			].forEach((c, i) => {
				g.fillStyle = c;
				g.fillRect(0, i * 8, W, 8);
			});
			const bh = 46;
			g.fillStyle = mixHex(P.surface, "#000000", .22);
			g.beginPath();
			g.moveTo(W * .12, H);
			g.lineTo(W * .17, H - bh);
			g.lineTo(W * .83, H - bh);
			g.lineTo(W * .88, H);
			g.closePath();
			g.fill();
			g.fillStyle = rgba(P.text, .55);
			for (const x of [.3, .7]) {
				g.beginPath();
				g.arc(W * x, H - bh * .45, 10, 0, 7);
				g.fill();
			}
			g.strokeStyle = "rgba(0,0,0,0.3)";
			g.lineWidth = 2;
			for (const [x, y] of [
				[24, 54],
				[W - 24, 54],
				[24, H - 24],
				[W - 24, H - 24]
			]) {
				g.fillStyle = "rgba(0,0,0,0.16)";
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
		case "receipt": {
			const n = Math.round(W / 22);
			const tw = W / n;
			const tt = 10;
			const zig = (c) => {
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
			g.shadowColor = "rgba(0,0,0,0.4)";
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
			sg.addColorStop(0, "rgba(0,0,0,0.05)");
			sg.addColorStop(.5, "rgba(255,255,255,0.35)");
			sg.addColorStop(1, "rgba(0,0,0,0.05)");
			g.fillStyle = sg;
			g.fillRect(0, 0, W, H);
			g.strokeStyle = rgba(P.text, .4);
			g.lineWidth = 3;
			g.setLineDash([10, 8]);
			const ry = layout.pad + layout.cover + layout.lyricGap / 2;
			g.beginPath();
			g.moveTo(layout.pad, ry);
			g.lineTo(W - layout.pad, ry);
			g.stroke();
			g.setLineDash([]);
			g.fillStyle = rgba(P.text, .5);
			g.font = `600 22px 'Courier New', monospace`;
			letterSpacing(g, 2);
			g.textAlign = "center";
			g.textBaseline = "alphabetic";
			g.fillText("*** THANK YOU ***", W / 2, H - 30);
			g.textAlign = "left";
			letterSpacing(g, 0);
			g.restore();
			break;
		}
		case "gameboy": {
			cardDrop(g, W, H, R, "#C9C6BB", 30, 14, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			g.fillStyle = "#5B5D74";
			roundedRect(g, 14, 14, W - 28, H - 28, 14);
			g.fill();
			g.fillStyle = P.surface;
			roundedRect(g, 30, 30, W - 60, H - 60, 6);
			g.fill();
			const pat = tilePattern(g, "lcd", 6, (c, k) => {
				c.fillStyle = "rgba(15,56,15,0.10)";
				c.fillRect(0, 0, k, 1);
				c.fillRect(0, 0, 1, k);
			});
			if (pat) {
				g.fillStyle = pat;
				roundedRect(g, 30, 30, W - 60, H - 60, 6);
				g.fill();
			}
			g.fillStyle = "#D33A4A";
			g.beginPath();
			g.arc(22, H / 2, 3.5, 0, 7);
			g.fill();
			g.restore();
			break;
		}
		case "stained": {
			cardDrop(g, W, H, R, "#0c0c10", 30, 14, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const cols = 5;
			const rows = Math.max(4, Math.round(cols * H / W));
			const cw = W / cols;
			const rh = H / rows;
			let sd = 7;
			const rnd = () => (sd = sd * 16807 % 2147483647) / 2147483647;
			const pts = [];
			for (let j = 0; j <= rows; j++) {
				pts.push([]);
				for (let i = 0; i <= cols; i++) {
					const jx = (rnd() - .5) * cw * .55;
					const jy = (rnd() - .5) * rh * .55;
					pts[j].push([i * cw + (i % cols ? jx : 0), j * rh + (j % rows ? jy : 0)]);
				}
			}
			const cs = [
				bg,
				mixHex(bg, "#E8115B", .5),
				mixHex(bg, "#F5B700", .55),
				mixHex(bg, "#1DB9D6", .55),
				mixHex(bg, "#7358FF", .55)
			];
			const quad = (j, i) => {
				g.beginPath();
				[
					pts[j][i],
					pts[j][i + 1],
					pts[j + 1][i + 1],
					pts[j + 1][i]
				].forEach((q, k) => k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]));
				g.closePath();
			};
			for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
				g.fillStyle = mixHex(cs[Math.floor(rnd() * cs.length)], "#000000", .5);
				quad(j, i);
				g.fill();
			}
			const lg = g.createRadialGradient(W / 2, H * .4, 0, W / 2, H * .4, Math.max(W, H) * .7);
			lg.addColorStop(0, "rgba(255,255,255,0.18)");
			lg.addColorStop(1, "rgba(255,255,255,0)");
			g.fillStyle = lg;
			g.fillRect(0, 0, W, H);
			g.strokeStyle = "#07070a";
			g.lineWidth = 7;
			g.lineJoin = "round";
			for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
				quad(j, i);
				g.stroke();
			}
			g.lineWidth = 18;
			roundedRect(g, 0, 0, W, H, R);
			g.stroke();
			g.restore();
			break;
		}
		case "neon": {
			cardDrop(g, W, H, R, P.surface, 30, 14, unit);
			g.save();
			roundedRect(g, 0, 0, W, H, R);
			g.clip();
			const pat = tilePattern(g, "brick", 64, (c, k) => {
				c.fillStyle = "rgba(255,255,255,0.07)";
				c.fillRect(0, 0, k, 2);
				c.fillRect(0, k / 2, k, 2);
				c.fillRect(0, 0, 2, k / 2);
				c.fillRect(k / 2, k / 2, 2, k / 2);
			});
			if (pat) {
				g.fillStyle = pat;
				g.fillRect(0, 0, W, H);
			}
			const wg = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * .65);
			wg.addColorStop(0, rgba(bg, .2));
			wg.addColorStop(1, rgba(bg, 0));
			g.fillStyle = wg;
			g.fillRect(0, 0, W, H);
			g.restore();
			const per = 2 * (W + H);
			const tube = (ins, lw, col, blur) => {
				g.save();
				g.shadowColor = bg;
				g.shadowBlur = blur * unit;
				g.strokeStyle = col;
				g.lineWidth = lw;
				g.lineCap = "round";
				g.setLineDash([per - 70, 70]);
				roundedRect(g, ins, ins, W - 2 * ins, H - 2 * ins, Math.max(6, R - ins));
				g.stroke();
				g.stroke();
				g.restore();
			};
			tube(18, 7, P.neon || "#00FFCC", 26);
			tube(34, 3, rgba(P.neon || "#00FFCC", .7), 14);
			tube(18, 2, mixHex(P.neon || "#00FFCC", "#ffffff", .75), 0);
			break;
		}
		case "comic": {
			if (D === 0) {
				g.fillStyle = "#111111";
				g.fillRect(14, 14, W, H);
			}
			g.fillStyle = P.surface;
			g.fillRect(0, 0, W, H);
			g.save();
			g.beginPath();
			g.rect(0, 0, W, H);
			g.clip();
			g.fillStyle = mixHex(bg, "#ffffff", .15);
			g.beginPath();
			const reach = Math.min(W, H) * .9;
			const st = 26;
			for (let y = 0; y < H; y += st) for (let x = 0; x < W; x += st) {
				const d = Math.hypot(W - x, H - y) / reach;
				if (d >= 1) continue;
				const rr = 9 * (1 - d);
				g.moveTo(x + rr, y);
				g.arc(x, y, rr, 0, 7);
			}
			g.fill();
			g.fillStyle = "#FFD60A";
			g.strokeStyle = "#111111";
			g.lineWidth = 5;
			g.lineJoin = "miter";
			g.beginPath();
			for (let i = 0; i < 24; i++) {
				const a = i * Math.PI / 12;
				const r = i % 2 ? 24 : 46;
				g[i ? "lineTo" : "moveTo"](W - 34 + Math.cos(a) * r, 34 + Math.sin(a) * r);
			}
			g.closePath();
			g.fill();
			g.stroke();
			g.restore();
			g.strokeStyle = "#111111";
			g.lineWidth = 10;
			g.strokeRect(5, 5, W - 10, H - 10);
			break;
		}
		default: {
			const bleed = fullBleed && D === 0;
			if (state.layoutKey === "wide") paintMetalBackground(g, W, H, layout.radius, bg, bleed);
			else {
				g.fillStyle = bg;
				if (bleed) g.fillRect(0, 0, W, H);
				else {
					roundedRect(g, 0, 0, W, H, layout.radius);
					g.fill();
				}
			}
		}
	}
}
function themeFinish(g, theme, _bg, P, layout) {
	const W = layout.w;
	const H = layout.h;
	const R = themeRadius(theme, layout.radius);
	const m = Math.min(W, H);
	const clipCard = () => {
		g.save();
		roundedRect(g, 0, 0, W, H, R);
		g.clip();
	};
	const grain = (a) => {
		const pat = tilePattern(g, "grain" + a, 96, (c, n) => {
			for (let i = 0; i < 520; i++) {
				c.fillStyle = Math.random() < .5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
				c.fillRect(Math.random() * n, Math.random() * n, 1.4, 1.4);
			}
		});
		if (pat) {
			g.fillStyle = pat;
			g.fillRect(0, 0, W, H);
		}
	};
	const topLight = (a, h = .55) => {
		const l = g.createLinearGradient(0, 0, 0, H * h);
		l.addColorStop(0, `rgba(255,255,255,${a})`);
		l.addColorStop(1, "rgba(255,255,255,0)");
		g.fillStyle = l;
		g.fillRect(0, 0, W, H);
	};
	const vignette = (a) => {
		const v = g.createRadialGradient(W / 2, H / 2, m * .35, W / 2, H / 2, Math.max(W, H) * .78);
		v.addColorStop(0, "rgba(0,0,0,0)");
		v.addColorStop(1, `rgba(0,0,0,${a})`);
		g.fillStyle = v;
		g.fillRect(0, 0, W, H);
	};
	switch (theme) {
		case "classic":
			clipCard();
			topLight(.1);
			grain(.035);
			g.restore();
			break;
		case "brutalism":
			g.save();
			g.beginPath();
			g.rect(10, H - 36, W - 20, 26);
			g.clip();
			g.strokeStyle = "#000";
			g.lineWidth = 6;
			for (let x = -40; x < W + 40; x += 22) {
				g.beginPath();
				g.moveTo(x, H - 8);
				g.lineTo(x + 26, H - 40);
				g.stroke();
			}
			g.restore();
			g.strokeStyle = "#000";
			g.lineWidth = 3;
			g.strokeRect(20, 20, W - 40, H - 40);
			break;
		case "cyberpunk":
			clipCard();
			g.strokeStyle = rgba(P.neon || "#00FFCC", .07);
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
			g.fillStyle = "rgba(0,0,0,0.22)";
			for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2);
			vignette(.45);
			g.restore();
			g.save();
			g.shadowColor = P.neon || "#00FFCC";
			g.shadowBlur = 12;
			g.strokeStyle = P.neon || "#00FFCC";
			g.lineWidth = 5;
			g.lineCap = "square";
			for (const [x, y, sx, sy] of [
				[
					30,
					30,
					1,
					1
				],
				[
					W - 30,
					30,
					-1,
					1
				],
				[
					30,
					H - 30,
					1,
					-1
				],
				[
					W - 30,
					H - 30,
					-1,
					-1
				]
			]) {
				g.beginPath();
				g.moveTo(x, y + sy * 46);
				g.lineTo(x, y);
				g.lineTo(x + sx * 46, y);
				g.stroke();
			}
			g.restore();
			break;
		case "glass":
			clipCard();
			topLight(.14, .4);
			grain(.03);
			g.fillStyle = "rgba(255,255,255,0.18)";
			g.beginPath();
			g.ellipse(W * .5, -H * .38, W * .9, H * .55, 0, 0, 7);
			g.fill();
			g.restore();
			break;
		case "clay":
			clipCard();
			grain(.03);
			g.fillStyle = "rgba(255,255,255,0.55)";
			g.beginPath();
			g.ellipse(W * .2, H * .1, m * .1, m * .045, -.5, 0, 7);
			g.fill();
			g.restore();
			break;
		case "neumorphism":
			clipCard();
			grain(.025);
			g.restore();
			break;
		case "vinyl":
			clipCard();
			topLight(.07);
			g.restore();
			break;
		case "ticket":
			clipCard();
			grain(.05);
			g.restore();
			break;
		case "polaroid":
			clipCard();
			grain(.04);
			vignette(.07);
			g.restore();
			break;
		case "y2k":
			clipCard();
			g.strokeStyle = "rgba(255,255,255,0.18)";
			g.lineWidth = 2;
			for (let i = -H; i < W; i += 36) {
				g.beginPath();
				g.moveTo(i, H);
				g.lineTo(i + H, 0);
				g.stroke();
			}
			g.restore();
			break;
		case "aurora": {
			clipCard();
			grain(.045);
			vignette(.35);
			const starPat = tilePattern(g, "stars", 160, (c, n) => {
				for (let i = 0; i < 14; i++) {
					c.fillStyle = `rgba(255,255,255,${.25 + Math.random() * .5})`;
					c.beginPath();
					c.arc(Math.random() * n, Math.random() * n, Math.random() * 1.4 + .4, 0, 7);
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
		case "pixel":
			g.fillStyle = "rgba(255,255,255,0.35)";
			g.fillRect(8, 48, W - 16, 4);
			g.fillStyle = "rgba(0,0,0,0.18)";
			g.fillRect(8, H - 14, W - 16, 6);
			break;
		case "notebook":
			clipCard();
			grain(.04);
			vignette(.08);
			g.restore();
			break;
		case "newspaper":
			clipCard();
			grain(.06);
			vignette(.14);
			g.restore();
			break;
		case "sticker": {
			const peel = Math.min(W, H) * .14;
			const ins = 10;
			const innerR = Math.max(6, R - ins);
			const innerPeel = Math.max(8, peel - ins * .4);
			g.save();
			g.strokeStyle = "rgba(255,255,255,0.35)";
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
		case "holo": {
			clipCard();
			g.globalCompositeOperation = "overlay";
			const hg = g.createLinearGradient(0, 0, W, H);
			[
				"#ff4fd8",
				"#4fe3ff",
				"#fff36b",
				"#6bff9e",
				"#ff4fd8"
			].forEach((c, i, a) => hg.addColorStop(i / (a.length - 1), c));
			g.fillStyle = hg;
			g.globalAlpha = .35;
			g.fillRect(0, 0, W, H);
			g.restore();
			break;
		}
		case "wrapped":
			clipCard();
			grain(.035);
			topLight(.1);
			g.restore();
			break;
		case "cassette":
			clipCard();
			grain(.04);
			topLight(.08);
			g.restore();
			break;
		case "receipt": {
			g.save();
			g.globalAlpha = 1;
			const rpat = tilePattern(g, "paperfx", 96, (c, n) => {
				for (let i = 0; i < 380; i++) {
					c.fillStyle = `rgba(0,0,0,${.02 + Math.random() * .03})`;
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
		case "gameboy":
			clipCard();
			topLight(.08);
			g.restore();
			break;
		case "stained":
			clipCard();
			vignette(.35);
			g.restore();
			break;
		case "neon":
			clipCard();
			vignette(.4);
			grain(.03);
			g.restore();
			break;
		case "comic":
			clipCard();
			grain(.03);
			g.restore();
			break;
		case "stamp":
		case "boarding":
		case "matchbook":
		case "waxseal":
		case "risograph":
		case "swiss":
		case "vhs":
			clipCard();
			grain(.045);
			vignette(.08);
			g.restore();
			break;
		case "plaque":
		case "tarot":
		case "filmstrip":
			clipCard();
			topLight(.09);
			vignette(.28);
			g.restore();
			break;
		case "cdcase":
		case "minidisc":
		case "vippass":
		case "ipod":
		case "aqua":
		case "frutiger":
			clipCard();
			topLight(.12, .45);
			g.restore();
			break;
		case "terminal":
			clipCard();
			vignette(.32);
			g.restore();
	}
}
function paintGlare(g, state, _layout, tilt, fixedExtrude = false) {
	if (state.glareStyle === "none" || state.glare <= 0) return;
	const geo = cardGeom(state.layoutKey, state.theme, state.cardDepth, state.bgStyle, tilt, fixedExtrude);
	g.save();
	roundedRect(g, geo.x, geo.y, geo.w, geo.h, geo.r);
	g.clip();
	g.globalCompositeOperation = "overlay";
	g.globalAlpha = state.glare / 100;
	if (state.glareStyle === "spotlight" || state.glareStyle === "follow") {
		const sp = GLARE.spot;
		const fx = state.glareStyle === "follow" ? Math.min(.85, Math.max(.15, .5 + tilt.ry / 45 * .35)) : sp.x;
		const fy = state.glareStyle === "follow" ? Math.min(.85, Math.max(.15, .5 - tilt.rx / 45 * .35)) : sp.y;
		const px = geo.x + geo.w * fx;
		const py = geo.y + geo.h * fy;
		const rx = geo.w * sp.r;
		const ry = geo.h * sp.r;
		g.translate(px, py);
		g.scale(rx, ry);
		const grad = g.createRadialGradient(0, 0, 0, 0, 0, 1);
		for (const [p, color] of sp.stops) grad.addColorStop(p, color);
		g.fillStyle = grad;
		g.fillRect((geo.x - px) / rx, (geo.y - py) / ry, geo.w / rx, geo.h / ry);
	} else {
		const L = GLARE.lin[state.glareStyle] || GLARE;
		const a = L.angle * Math.PI / 180;
		const dx = Math.sin(a);
		const dy = -Math.cos(a);
		const half = (Math.abs(geo.w * Math.sin(a)) + Math.abs(geo.h * Math.cos(a))) / 2;
		const cx = geo.x + geo.w / 2;
		const cy = geo.y + geo.h / 2;
		const grad = g.createLinearGradient(cx - dx * half, cy - dy * half, cx + dx * half, cy + dy * half);
		for (const [p, color] of L.stops) grad.addColorStop(p, color);
		g.fillStyle = grad;
		g.fillRect(geo.x, geo.y, geo.w, geo.h);
	}
	g.restore();
}
function formatClock(sec) {
	const safe = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
	const m = Math.floor(safe / 60);
	const s = safe % 60;
	return `${m}:${s < 10 ? "0" : ""}${s}`;
}
var logoSprites = /* @__PURE__ */ new Map();
function getLogoSprite(color, logoSize, sc) {
	const key = `${color}|${logoSize}|${sc}`;
	let off = logoSprites.get(key);
	if (off) return off;
	if (logoSprites.size >= 30) logoSprites.clear();
	const r = logoSize / 2;
	off = document.createElement("canvas");
	off.width = off.height = Math.round(logoSize * sc);
	const og = off.getContext("2d");
	if (!og) return off;
	og.setTransform(sc, 0, 0, sc, 0, 0);
	og.globalCompositeOperation = "source-over";
	og.globalAlpha = 1;
	og.fillStyle = color;
	og.beginPath();
	og.arc(r, r, r, 0, Math.PI * 2);
	og.fill();
	og.globalCompositeOperation = "destination-out";
	og.strokeStyle = "#000000";
	og.lineCap = "round";
	og.lineJoin = "round";
	for (const a of [
		{
			x1: -.56,
			y1: -.22,
			qx: .04,
			qy: -.46,
			x2: .6,
			y2: -.12,
			w: .16
		},
		{
			x1: -.47,
			y1: .04,
			qx: .02,
			qy: -.14,
			x2: .5,
			y2: .14,
			w: .13
		},
		{
			x1: -.38,
			y1: .27,
			qx: .01,
			qy: .13,
			x2: .4,
			y2: .35,
			w: .1
		}
	]) {
		og.lineWidth = a.w * r;
		og.beginPath();
		og.moveTo(r + a.x1 * r, r + a.y1 * r);
		og.quadraticCurveTo(r + a.qx * r, r + a.qy * r, r + a.x2 * r, r + a.y2 * r);
		og.stroke();
	}
	og.globalCompositeOperation = "source-over";
	logoSprites.set(key, off);
	return off;
}
function drawCoverPlaceholder(g, x, y, size, textColor) {
	g.fillStyle = rgba(textColor, .16);
	g.fillRect(x, y, size, size);
	g.fillStyle = rgba(textColor, .55);
	const cx = x + size / 2;
	const cy = y + size / 2;
	const u = size / 100;
	g.beginPath();
	g.ellipse(cx - 9 * u, cy + 16 * u, 11 * u, 8.5 * u, -.35, 0, Math.PI * 2);
	g.fill();
	g.fillRect(cx + .5 * u, cy - 26 * u, 5 * u, 42 * u);
	g.beginPath();
	g.moveTo(cx + 5.5 * u, cy - 26 * u);
	g.quadraticCurveTo(cx + 24 * u, cy - 20 * u, cx + 20 * u, cy - 2 * u);
	g.quadraticCurveTo(cx + 18 * u, cy - 14 * u, cx + 5.5 * u, cy - 14 * u);
	g.closePath();
	g.fill();
}
function drawCover(g, state, layout, P, coverImg, tilt, unit = 1, fixedExtrude = false) {
	const f = cardFrame(layout, state.theme, state.hide);
	const x = f.cx;
	const y = f.cy;
	const S = f.cs;
	const r = coverRadius(state.coverShape, state.theme, S, layout.coverR);
	const cd = Math.round(state.cardDepth * 1);
	if (cd > 0) extrudeWalls(g, (c, ox, oy) => roundedPath(c, x + ox, y + oy, S, S, r), cd, tilt, state.color, P.wall, state.theme, {
		x,
		y,
		w: S,
		h: S
	}, fixedExtrude);
	if (state.theme === "clay") {
		g.save();
		g.shadowColor = rgba(mixHex(state.color, "#000000", .55), .5);
		g.shadowBlur = 18 * unit;
		g.shadowOffsetX = 8 * unit;
		g.shadowOffsetY = 8 * unit;
		g.fillStyle = P.surface;
		roundedRect(g, x, y, S, S, r);
		g.fill();
		g.restore();
	} else if (state.theme === "neumorphism") {
		g.save();
		g.fillStyle = P.surface;
		roundedRect(g, x, y, S, S, r);
		g.shadowColor = "rgba(255,255,255,0.9)";
		g.shadowBlur = 12 * unit;
		g.shadowOffsetX = -6 * unit;
		g.shadowOffsetY = -6 * unit;
		g.fill();
		g.shadowColor = P.shadowDark || "rgba(0,0,0,0.4)";
		g.shadowOffsetX = 6 * unit;
		g.shadowOffsetY = 6 * unit;
		g.fill();
		g.restore();
	}
	g.save();
	roundedRect(g, x, y, S, S, r);
	g.clip();
	if (coverImg && coverImg.naturalWidth) {
		const side = Math.min(coverImg.naturalWidth, coverImg.naturalHeight);
		const sx = (coverImg.naturalWidth - side) / 2;
		const sy = (coverImg.naturalHeight - side) / 2;
		g.drawImage(coverImg, sx, sy, side, side, x, y, S, S);
	} else drawCoverPlaceholder(g, x, y, S, P.text);
	g.restore();
	if (state.theme === "brutalism" || state.theme === "comic" || state.theme === "comicart") {
		g.strokeStyle = "#000000";
		g.lineWidth = 6;
		roundedRect(g, x + 3, y + 3, S - 6, S - 6, Math.max(0, r - 3));
		g.stroke();
	} else if (state.theme === "gameboy") {
		g.save();
		roundedRect(g, x, y, S, S, r);
		g.clip();
		g.globalCompositeOperation = "multiply";
		g.fillStyle = "#9BBC0F";
		g.fillRect(x, y, S, S);
		g.restore();
		g.strokeStyle = "#0F380F";
		g.lineWidth = 5;
		roundedRect(g, x + 2.5, y + 2.5, S - 5, S - 5, 0);
		g.stroke();
	} else if (state.theme === "cyberpunk" || state.theme === "neon" || state.theme === "glowsketch") {
		g.save();
		g.shadowColor = state.color;
		g.shadowBlur = 15 * unit;
		g.strokeStyle = P.neon || "#00FFCC";
		g.lineWidth = 2.5;
		roundedRect(g, x + 1.25, y + 1.25, S - 2.5, S - 2.5, Math.max(0, r - 1));
		g.stroke();
		g.restore();
	} else if (state.theme === "glass") {
		g.strokeStyle = "rgba(255,255,255,0.55)";
		g.lineWidth = 1.5;
		roundedRect(g, x + .75, y + .75, S - 1.5, S - 1.5, Math.max(0, r - 1));
		g.stroke();
	}
}
function drawProgress(g, state, layout, P, unit = 1, playback) {
	const f = cardFrame(layout, state.theme, state.hide);
	const u = barUnit(layout.logo);
	const x0 = f.bx0;
	const x1 = f.x1;
	const w = Math.max(120, x1 - x0);
	const frac = playback ? Math.min(1, Math.max(0, playback.progress)) : .38;
	const curLabel = playback ? formatClock(playback.currentTime) : "1:24";
	const remLabel = playback ? `-${formatClock(Math.max(0, playback.duration - playback.currentTime))}` : "-2:07";
	const showPause = playback ? playback.isPlaying : true;
	const fSpace = footerSpace(state.hide, state.trackId, layout);
	const ty = f.y1 - fSpace - barSpace(false, layout.logo) + 18 * u + 10 * u;
	const th = Math.max(4, 7 * u);
	const kr = 11 * u;
	const tsY = ty + kr + 26 * u;
	g.save();
	if (P.glow) {
		g.shadowColor = P.glow;
		g.shadowBlur = 12 * unit;
	}
	g.fillStyle = P.text;
	g.globalAlpha = .28;
	roundedRect(g, x0, ty - th / 2, w, th, th / 2);
	g.fill();
	g.globalAlpha = 1;
	if (w * frac > th) {
		roundedRect(g, x0, ty - th / 2, w * frac, th, th / 2);
		g.fill();
	}
	g.beginPath();
	g.arc(x0 + w * frac, ty, kr, 0, Math.PI * 2);
	g.fill();
	g.font = `600 ${Math.max(18, Math.round(22 * u))}px ${FONT}`;
	letterSpacing(g, 0);
	g.textBaseline = "alphabetic";
	g.globalAlpha = .78;
	g.textAlign = "left";
	g.fillText(curLabel, x0, tsY);
	g.textAlign = "right";
	g.fillText(remLabel, x1, tsY);
	g.textAlign = "left";
	g.globalAlpha = 1;
	const cx = (x0 + x1) / 2;
	const cy = tsY + 46 * u;
	const gap = Math.min(w / 5, 118 * u);
	const i = 13 * u;
	g.strokeStyle = P.text;
	g.fillStyle = P.text;
	g.lineWidth = 3 * u;
	g.lineCap = "round";
	g.lineJoin = "round";
	g.globalAlpha = .8;
	g.beginPath();
	g.moveTo(cx - 2 * gap - i, cy + i * .6);
	g.lineTo(cx - 2 * gap - i * .2, cy + i * .6);
	g.lineTo(cx - 2 * gap + i, cy - i * .6);
	g.moveTo(cx - 2 * gap - i, cy - i * .6);
	g.lineTo(cx - 2 * gap - i * .2, cy - i * .6);
	g.lineTo(cx - 2 * gap + i, cy + i * .6);
	g.stroke();
	roundedRect(g, cx + 2 * gap - i, cy - i * .6, i * 2, i * 1.2, i * .5);
	g.stroke();
	const tri = (tx, d) => {
		g.beginPath();
		g.moveTo(tx - d * i * .7, cy - i);
		g.lineTo(tx + d * i * .7, cy);
		g.lineTo(tx - d * i * .7, cy + i);
		g.closePath();
		g.fill();
	};
	g.globalAlpha = 1;
	tri(cx - gap + i * .3, -1);
	g.fillRect(cx - gap - i * .95, cy - i, 3 * u, i * 2);
	tri(cx + gap - i * .3, 1);
	g.fillRect(cx + gap + i * .95 - 3 * u, cy - i, 3 * u, i * 2);
	g.beginPath();
	g.arc(cx, cy, 28 * u, 0, Math.PI * 2);
	g.fill();
	if (P.glow) {
		g.shadowColor = "rgba(0,0,0,0)";
		g.shadowBlur = 0;
	}
	g.fillStyle = P.surface || "#000";
	if (showPause) {
		g.fillRect(cx - 8.5 * u, cy - 10.5 * u, 6 * u, 21 * u);
		g.fillRect(cx + 2.5 * u, cy - 10.5 * u, 6 * u, 21 * u);
	} else {
		g.beginPath();
		g.moveTo(cx - 6 * u, cy - 11 * u);
		g.lineTo(cx + 12 * u, cy);
		g.lineTo(cx - 6 * u, cy + 11 * u);
		g.closePath();
		g.fill();
	}
	g.restore();
}
function drawFooter(g, state, layout, P, tilt, unit = 1, fixedExtrude = false) {
	const f = cardFrame(layout, state.theme, state.hide);
	const x = f.fx;
	const y = f.y1 - layout.logo;
	const cy = y + layout.logo / 2;
	const sc = Math.max(1, Math.ceil(g.getTransform ? g.getTransform().a : 1));
	const sprite = getLogoSprite(P.text, layout.logo, sc);
	const lay = getLayers(Math.round(state.cardDepth * 1), tilt, state.color, P.wall, state.theme, 16, fixedExtrude);
	if (lay) for (let k = 0; k < lay.length; k++) {
		const o = lay[k];
		g.drawImage(getLogoSprite(lay[k - k % 4].color, layout.logo, sc), x + o.dx, y + o.dy, layout.logo, layout.logo);
	}
	if (P.glow) {
		g.shadowColor = P.glow;
		g.shadowBlur = 15 * unit;
	}
	g.drawImage(sprite, x, y, layout.logo, layout.logo);
	g.font = `700 ${layout.wordmark}px ${FONT}`;
	g.textBaseline = "middle";
	const k = Math.max(1, Math.round(layout.wordmark / 26));
	letterSpacing(g, -k);
	const wx = x + layout.logo + Math.round(layout.logo * .22);
	if (lay) {
		if (P.glow) {
			g.shadowColor = "rgba(0,0,0,0)";
			g.shadowBlur = 0;
		}
		for (const o of lay) {
			g.fillStyle = o.color;
			g.fillText("Spotify", wx + o.dx, cy + k + o.dy);
		}
		if (P.glow) {
			g.shadowColor = P.glow;
			g.shadowBlur = 15 * unit;
		}
	}
	for (const p of P.passes) {
		g.fillStyle = p.color;
		g.fillText("Spotify", wx + p.dx, cy + k + p.dy);
	}
	letterSpacing(g, 0);
	g.textBaseline = "alphabetic";
	if (P.glow) {
		g.shadowColor = "rgba(0,0,0,0)";
		g.shadowBlur = 0;
	}
}
var codeCache = /* @__PURE__ */ new Map();
function drawCode(g, state, layout, P, onLoad) {
	if (!state.trackId || !/^#[0-9a-f]{6}$/i.test(P.surface)) return;
	const f = cardFrame(layout, state.theme, state.hide);
	const h = layout.logo;
	const w = Math.min(h * 4, Math.max(160, (f.x1 - f.fx) * .45));
	const x = f.x1 - w;
	const y = f.y1 - layout.logo;
	const url = `https://scannables.scdn.co/uri/plain/png/${P.surface.slice(1)}/${luma(P.surface) < 150 ? "white" : "black"}/640/spotify:track:${state.trackId}`;
	const entry = codeCache.get(url);
	if (entry === void 0 || entry.status === "fail" && Date.now() - entry.at > 1e4) {
		const img = new Image();
		img.crossOrigin = "anonymous";
		codeCache.set(url, { status: "loading" });
		img.onload = () => {
			codeCache.set(url, {
				status: "loaded",
				img
			});
			onLoad();
		};
		img.onerror = () => {
			codeCache.set(url, {
				status: "fail",
				at: Date.now()
			});
		};
		img.src = url;
		return;
	}
	if (entry.status !== "loaded") return;
	g.save();
	roundedRect(g, x, y, w, h, h * .16);
	g.clip();
	g.drawImage(entry.img, x, y, w, h);
	g.restore();
}
function renderCard(g, state, layout, coverImg, tilt, { fullBleed = false, flat = false, onCodeLoad = () => {}, playback = null } = {}) {
	const theme = state.theme;
	const bg = state.color;
	const P = getPalette(theme, bg);
	const geo = cardGeom(state.layoutKey, theme, state.cardDepth, state.bgStyle, tilt, flat);
	const unit = (g.getTransform ? g.getTransform().a : 1) * geo.s;
	g.clearRect(0, 0, layout.w, layout.h);
	paintBackdrop(g, layout, theme, bg, P, state.bgStyle, state.cardDepth, fullBleed, coverImg);
	g.save();
	g.translate(geo.x, geo.y);
	g.scale(geo.s, geo.s);
	paintCardBody(g, state, layout, P, tilt, fullBleed && state.bgStyle === "none", unit, flat);
	themeFinish(g, theme, bg, P, layout);
	if (!state.hide.cover) drawCover(g, state, layout, P, coverImg, tilt, unit, flat);
	if (!(state.hide.title && state.hide.artist)) drawHeader(g, state, layout, P, tilt, unit, flat);
	const info = drawLyrics(g, state, layout, P, tilt, unit, flat, playback);
	if (!state.hide.bar) drawProgress(g, state, layout, P, unit, playback);
	if (!state.hide.logo) drawFooter(g, state, layout, P, tilt, unit, flat);
	if (!state.hide.code) drawCode(g, state, layout, P, onCodeLoad);
	overlaySignature(g, theme, layout);
	g.restore();
	g.shadowColor = "rgba(0,0,0,0)";
	g.shadowBlur = 0;
	return info;
}
var LayoutSection = import_react.memo(({ state, onChange, onToast }) => {
	const lyricParas = (0, import_react.useMemo)(() => parseLyrics(state.lyrics), [state.lyrics]);
	const toggleHide = (key) => {
		if (key === "code" && state.hide.code && !state.trackId) {
			onToast("Paste a Spotify track link under Search first. The Spotify Code needs a track ID.");
			return;
		}
		onChange({ hide: {
			...state.hide,
			[key]: !state.hide[key]
		} });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-bold uppercase tracking-wider text-[#1db954]",
				children: "Layout"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "block text-xs font-medium text-[#b3b3b3]",
					children: "Lyric Alignment"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-2 p-1 bg-[#202020] border border-[#333333] rounded-xl",
					children: [
						"left",
						"center",
						"right"
					].map((align) => {
						const isSelected = state.align === align;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onChange({ align }),
							className: `flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium capitalize transition-all ${isSelected ? "bg-[#1db954] text-black font-semibold shadow-sm" : "text-[#a0a0a0] hover:text-white hover:bg-white/5"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: align })]
						}, align);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "block text-xs font-medium text-[#b3b3b3]",
					children: "Show on Card"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						{
							key: "cover",
							label: "Cover art"
						},
						{
							key: "title",
							label: "Song title"
						},
						{
							key: "artist",
							label: "Artist"
						},
						{
							key: "logo",
							label: "Spotify logo"
						},
						{
							key: "bar",
							label: "Progress bar"
						},
						{
							key: "code",
							label: "Spotify Code"
						}
					].map(({ key, label }) => {
						const isVisible = !state.hide[key];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => toggleHide(key),
							className: `px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isVisible ? "bg-[#1db954]/15 border-[#1db954] text-white shadow-sm" : "bg-[#222222] border-[#333333] text-[#707070] hover:text-[#a0a0a0]"}`,
							children: label
						}, key);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5 pt-2 border-t border-[#262626]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs text-[#b3b3b3]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Card Depth (Volumetric Extrusion)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-white font-medium",
							children: [state.cardDepth, " px"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 60,
						value: state.cardDepth,
						onChange: (e) => onChange({ cardDepth: parseInt(e.target.value, 10) }),
						className: "w-full accent-[#1db954] cursor-pointer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-[#808080]",
						children: "Extrudes the card, cover art, text, and logo along real-time 3D tilt vectors."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#262626]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-medium text-[#b3b3b3]",
						children: "Glare Style"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: state.glareAuto ? "auto" : state.glareStyle,
						onChange: (e) => {
							const val = e.target.value;
							if (val === "auto") onChange({
								glareAuto: true,
								glareStyle: THEME_GLARE[state.theme] || "diagonal"
							});
							else onChange({
								glareAuto: false,
								glareStyle: val
							});
						},
						className: "w-full px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "auto",
								children: "Auto (Theme default)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "diagonal",
								children: "Diagonal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "spotlight",
								children: "Spotlight"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "follow",
								children: "Cursor follow"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "holo",
								children: "Holographic"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "gloss",
								children: "Frosted gloss"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "sweep",
								children: "Sweep"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "none",
								children: "None"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs text-[#b3b3b3]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Glare Intensity" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-white",
							children: [state.glare, "%"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 100,
						value: state.glare,
						onChange: (e) => onChange({ glare: parseInt(e.target.value, 10) }),
						className: "w-full accent-[#1db954] cursor-pointer"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#262626]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-medium text-[#b3b3b3]",
						children: "Cover Shape"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: state.hide.cover ? "hidden" : state.coverShape,
						onChange: (e) => {
							const val = e.target.value;
							if (val === "hidden") onChange({ hide: {
								...state.hide,
								cover: true
							} });
							else onChange({
								coverShape: val,
								hide: {
									...state.hide,
									cover: false
								}
							});
						},
						className: "w-full px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "auto",
								children: "Theme default"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "square",
								children: "Square"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "rounded",
								children: "Rounded"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "circle",
								children: "Circle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "hidden",
								children: "Hidden"
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-medium text-[#b3b3b3]",
						children: "Lyric Font"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: state.lyricFont,
						onChange: (e) => onChange({ lyricFont: e.target.value }),
						className: "w-full px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "auto",
							children: "Theme default"
						}), Object.entries(LYRIC_FONTS).map(([k, font]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: k,
							children: font.label
						}, k))]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5 pt-2 border-t border-[#262626]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-medium text-[#b3b3b3]",
						children: "Highlight a Line"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: state.hlLine,
						onChange: (e) => onChange({ hlLine: parseInt(e.target.value, 10) }),
						className: "w-full px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "-1",
							children: "Off (All lines active)"
						}), lyricParas.map((words, idx) => {
							if (!words) return null;
							const text = words.join(" ");
							const preview = text.length > 36 ? text.slice(0, 35) + "…" : text;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
								value: idx,
								children: [
									idx + 1,
									". ",
									preview
								]
							}, idx);
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-[#808080]",
						children: "Emphasizes one line and softens the others (Spotify karaoke style)."
					})
				]
			})
		]
	});
});
var LS_KEY = "lyric-card-settings-v1";
var RECENT_KEY = "lyric-card-recent-v1";
var LOOKS_KEY = "lyric-card-looks-v1";
function saveSettings(state) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(LS_KEY, JSON.stringify({
			color: state.color,
			theme: state.theme,
			align: state.align,
			fmt: state.fmt,
			glare: state.glare,
			glareStyle: state.glareStyle,
			cardDepth: state.cardDepth,
			hide: state.hide,
			autoFit: state.autoFit,
			lyricSize: state.lyricSize,
			scale: state.scale,
			coverShape: state.coverShape,
			lyricFont: state.lyricFont,
			bgStyle: state.bgStyle,
			glareAuto: state.glareAuto,
			autoColor: state.autoColor,
			layoutKey: state.layoutKey
		}));
	} catch {}
}
function loadSettings() {
	if (typeof window === "undefined") return {};
	try {
		const raw = JSON.parse(localStorage.getItem("lyric-card-settings-v1") || "null");
		if (!raw || typeof raw !== "object") return {};
		const d = { ...raw };
		if (typeof d.lyricSize !== "number" && typeof d.size === "number") d.lyricSize = d.size;
		delete d.size;
		return d;
	} catch {
		return {};
	}
}
function getRecentSearches() {
	if (typeof window === "undefined") return [];
	try {
		const a = JSON.parse(localStorage.getItem("lyric-card-recent-v1") || "[]");
		return Array.isArray(a) ? a.filter((x) => typeof x === "string").slice(0, 6) : [];
	} catch {
		return [];
	}
}
function addRecentSearch(q) {
	if (!q.trim()) return getRecentSearches();
	const current = getRecentSearches();
	const next = [q.trim(), ...current.filter((x) => x.toLowerCase() !== q.trim().toLowerCase())].slice(0, 6);
	try {
		localStorage.setItem(RECENT_KEY, JSON.stringify(next));
	} catch {}
	return next;
}
function clearRecentSearches() {
	try {
		localStorage.removeItem(RECENT_KEY);
	} catch {}
	return [];
}
function getSavedLooks() {
	if (typeof window === "undefined") return [];
	try {
		const a = JSON.parse(localStorage.getItem("lyric-card-looks-v1") || "[]");
		return Array.isArray(a) ? a.filter((x) => x && typeof x.name === "string" && x.look).slice(0, 12) : [];
	} catch {
		return [];
	}
}
function saveLook(name, look) {
	const filtered = getSavedLooks().filter((p) => p.name.toLowerCase() !== name.toLowerCase());
	const next = [{
		name,
		look
	}, ...filtered].slice(0, 12);
	try {
		localStorage.setItem(LOOKS_KEY, JSON.stringify(next));
	} catch {}
	return next;
}
function deleteLook(index) {
	const current = getSavedLooks();
	current.splice(index, 1);
	try {
		localStorage.setItem(LOOKS_KEY, JSON.stringify(current));
	} catch {}
	return current;
}
function encodeLookHash(obj) {
	return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeLookHash(hash) {
	return JSON.parse(decodeURIComponent(escape(atob(hash.replace(/-/g, "+").replace(/_/g, "/")))));
}
var LooksSection = import_react.memo(({ state, onApplyLook, onToast }) => {
	const [looks, setLooks] = (0, import_react.useState)([]);
	const [lookName, setLookName] = (0, import_react.useState)("");
	const [copiedLink, setCopiedLink] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setLooks(getSavedLooks());
	}, []);
	const handleSaveLook = (e) => {
		e.preventDefault();
		const name = lookName.trim().slice(0, 24) || `Look ${looks.length + 1}`;
		const next = saveLook(name, {
			t: state.theme,
			c: state.color,
			g: state.glareAuto ? "auto" : state.glareStyle,
			gi: state.glare,
			l: state.layoutKey,
			cs: state.hide.cover ? "hidden" : state.coverShape,
			lf: state.lyricFont,
			bg: state.bgStyle,
			d: state.cardDepth,
			a: state.align,
			ac: state.autoColor
		});
		setLooks(next);
		setLookName("");
		onToast(`Saved look "${name}"`);
	};
	const handleDeleteLook = (index, name) => {
		const next = deleteLook(index);
		setLooks(next);
		onToast(`Deleted "${name}"`);
	};
	const handleCopyLink = async () => {
		const lookData = {
			t: state.theme,
			c: state.color,
			g: state.glareAuto ? "auto" : state.glareStyle,
			gi: state.glare,
			l: state.layoutKey,
			cs: state.hide.cover ? "hidden" : state.coverShape,
			lf: state.lyricFont,
			bg: state.bgStyle,
			d: state.cardDepth,
			a: state.align,
			ac: state.autoColor,
			ti: state.title.slice(0, 80),
			ar: state.artist.slice(0, 80),
			ly: state.lyrics.slice(0, 700)
		};
		if (state.coverUrl && /^https:\/\/[^?#\s]{1,300}$/i.test(state.coverUrl.trim())) lookData.cu = state.coverUrl.trim();
		const hashStr = "#look=" + encodeLookHash(lookData);
		const fullUrl = window.location.href.split("#")[0] + hashStr;
		window.history.replaceState(null, "", hashStr);
		try {
			await navigator.clipboard.writeText(fullUrl);
			setCopiedLink(true);
			onToast("Shareable link copied to clipboard!");
			setTimeout(() => setCopiedLink(false), 2500);
		} catch {
			onToast("Could not access clipboard. Copy from browser address bar.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-bold uppercase tracking-wider text-[#1db954]",
				children: "Looks"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-medium text-[#b3b3b3]",
						children: "Backdrop Behind Card"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: state.bgStyle,
						onChange: (e) => onApplyLook({
							t: state.theme,
							c: state.color,
							g: state.glareAuto ? "auto" : state.glareStyle,
							gi: state.glare,
							l: state.layoutKey,
							cs: state.hide.cover ? "hidden" : state.coverShape,
							lf: state.lyricFont,
							bg: e.target.value,
							d: state.cardDepth,
							a: state.align,
							ac: state.autoColor
						}),
						className: "w-full px-3.5 py-2.5 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white outline-none focus:border-[#1db954]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "none",
								children: "None (Direct background)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "blur",
								children: "Blurred album cover"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "gradient",
								children: "Atmospheric gradient"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "pattern",
								children: "Dot pattern matrix"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-[#808080]",
						children: "Inlays the card into an ambient canvas backdrop for wallpapers and social posts."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSaveLook,
				className: "space-y-2 pt-2 border-t border-[#262626]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-medium text-[#b3b3b3]",
						children: "Save Current Look"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: lookName,
							onChange: (e) => setLookName(e.target.value),
							maxLength: 24,
							placeholder: "Name this look, e.g. Night Drive",
							className: "flex-1 px-3 py-2 bg-[#242424] border border-[#333333] rounded-xl text-xs text-white placeholder-[#707070] outline-none focus:border-[#1db954]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "submit",
							className: "flex items-center gap-1.5 px-4 py-2 bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold text-xs rounded-xl transition-all active:scale-95 shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-[#808080]",
						children: "Saves theme, colors, depth, lighting, typography, and card geometry."
					}),
					looks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2 pt-2",
						children: looks.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-1 px-2.5 py-1 bg-[#222222] border border-[#383838] rounded-full text-xs text-[#d0d0d0] hover:border-[#1db954] transition-all",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									onApplyLook(item.look);
									onToast(`Applied look "${item.name}"`);
								},
								className: "hover:text-white font-medium",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => handleDeleteLook(idx, item.name),
								"aria-label": `Delete look ${item.name}`,
								className: "text-[#707070] hover:text-[#ff7b7b] transition-colors p-0.5 ml-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3 h-3" })
							})]
						}, idx))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-2 border-t border-[#262626] space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-xs font-medium text-[#b3b3b3]",
						children: "Shareable Link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleCopyLink,
						className: "w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-[#383838] hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all active:scale-98 shadow-sm",
						children: copiedLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#1db954]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[#1db954]",
							children: "Link Copied!"
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "w-4 h-4 text-[#1db954]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Copy Link to this Card" })] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-[#808080]",
						children: "Generates a hash URL holding the layout, colors, typography, lyrics, and public artwork link."
					})
				]
			})
		]
	});
});
var SearchError = class extends Error {
	http;
	status;
	constructor(message, status) {
		super(message);
		this.name = "SearchError";
		if (status !== void 0) {
			this.http = true;
			this.status = status;
		}
	}
};
var ITUNES_URL = "https://itunes.apple.com/search";
var SPOTIFY_OEMBED = "https://open.spotify.com/oembed";
var REQUEST_TIMEOUT = 8e3;
var SPOTIFY_TRACK_RE = /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]+)/i;
var netMsg = (m) => navigator.onLine === false ? "You're offline. Searching needs an internet connection, but you can still edit and export your card." : m;
async function fetchJson(url, timeout = REQUEST_TIMEOUT) {
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), timeout);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			referrerPolicy: "no-referrer"
		});
		if (!res.ok) throw new SearchError(`HTTP ${res.status}`, res.status);
		return await res.json();
	} finally {
		clearTimeout(timer);
	}
}
var jsonpCounter = 0;
function jsonp(url) {
	return new Promise((resolve, reject) => {
		const cb = "__itunesCb" + ++jsonpCounter;
		const script = document.createElement("script");
		const cleanup = () => {
			clearTimeout(timer);
			delete window[cb];
			script.remove();
		};
		const timer = setTimeout(() => {
			cleanup();
			reject(/* @__PURE__ */ new Error("jsonp timeout"));
		}, REQUEST_TIMEOUT);
		window[cb] = (data) => {
			cleanup();
			resolve(data);
		};
		script.onerror = () => {
			cleanup();
			reject(/* @__PURE__ */ new Error("jsonp network error"));
		};
		script.src = url + "&callback=" + cb;
		document.head.appendChild(script);
	});
}
async function searchItunes(query) {
	const url = `${ITUNES_URL}?term=${encodeURIComponent(query)}&entity=song&limit=8`;
	let data;
	try {
		data = await fetchJson(url);
	} catch (err) {
		if (err instanceof SearchError && err.http) throw new SearchError(`iTunes returned an error (${err.status}). Please try again in a moment.`);
		try {
			data = await jsonp(url);
		} catch {
			throw new SearchError(netMsg("Couldn't reach iTunes. Check your internet connection and try again."));
		}
	}
	const hits = (data && Array.isArray(data.results) ? data.results : []).filter((h) => h.artworkUrl100);
	if (!hits.length) throw new SearchError(`No results found for "${query}". Try different keywords.`);
	return hits.map((h) => ({
		thumb: h.artworkUrl100,
		cover: h.artworkUrl100.replace("100x100", "600x600"),
		title: h.trackName || "",
		artist: h.artistName || "",
		album: h.collectionName || "",
		duration: h.trackTimeMillis ? Math.round(h.trackTimeMillis / 1e3) : 0,
		previewUrl: typeof h.previewUrl === "string" ? h.previewUrl : null
	}));
}
async function findTrackPreview(title, artist) {
	const cleanT = title.replace(/\s*[([].*?[)\]]/g, "").replace(/\s+-\s+.*$/, "").trim();
	const cleanA = artist.replace(/\s*[([].*?[)\]]/g, "").split(/\s*(?:,|&|;|\band\b|\bfeat\.?|\bft\.?)\s*/i)[0].trim();
	const q = [cleanT || title.trim(), cleanA || artist.trim()].filter(Boolean).join(" ");
	if (!q) return {
		previewUrl: null,
		duration: 0
	};
	try {
		const hits = await searchItunes(q);
		const normTitle = (cleanT || title.trim()).toLowerCase();
		const normArtist = (cleanA || artist.trim()).toLowerCase();
		const titleMatches = (hTitle) => {
			const lt = hTitle.toLowerCase();
			return lt.includes(normTitle) || normTitle.includes(lt);
		};
		const artistMatches = (hArtist) => {
			if (!normArtist) return true;
			const la = hArtist.toLowerCase();
			return la.includes(normArtist) || normArtist.includes(la);
		};
		const match = hits.find((h) => h.previewUrl && titleMatches(h.title) && artistMatches(h.artist)) || hits.find((h) => h.previewUrl && titleMatches(h.title)) || null;
		return {
			previewUrl: match?.previewUrl ?? null,
			duration: match?.duration ?? 0
		};
	} catch {
		return {
			previewUrl: null,
			duration: 0
		};
	}
}
async function fetchSpotifyCover(rawUrl) {
	const match = rawUrl.match(SPOTIFY_TRACK_RE);
	if (!match) throw new SearchError("That does not look like a Spotify track link. It should start with https://open.spotify.com/track/");
	const trackId = match[1];
	const canonical = `https://open.spotify.com/track/${trackId}`;
	try {
		const res = await fetch(`/api/spotify?url=${encodeURIComponent(canonical)}`);
		const body = await res.json().catch(() => null);
		if (res.ok && body?.coverUrl) return {
			coverUrl: body.coverUrl,
			trackId: body.trackId || trackId,
			title: body.title
		};
		if (res.status === 400 || res.status === 404) throw new SearchError(body?.error || "Spotify could not find that track. Check the link and try again.", res.status);
	} catch (err) {
		if (err instanceof SearchError) throw err;
	}
	let data;
	try {
		data = await fetchJson(`${SPOTIFY_OEMBED}?url=${encodeURIComponent(canonical)}`);
	} catch (err) {
		if (err instanceof SearchError && err.http) throw new SearchError(err.status === 404 ? "Spotify could not find that track. Check the link and try again." : `Spotify returned an error (${err.status}). Please try again in a moment.`);
		throw new SearchError(netMsg("Couldn't reach Spotify (network issue or blocked by CORS). Try the keyword search instead."));
	}
	if (!data || !data.thumbnail_url) throw new SearchError("Spotify did not return a cover image for this track.");
	return {
		coverUrl: data.thumbnail_url,
		trackId,
		title: typeof data.title === "string" ? data.title : void 0
	};
}
var SearchSection = import_react.memo(({ onSelectSong, onSpotifyTrack, onToast }) => {
	const [query, setQuery] = (0, import_react.useState)("");
	const [isSearching, setIsSearching] = (0, import_react.useState)(false);
	const [results, setResults] = (0, import_react.useState)([]);
	const [searchHint, setSearchHint] = (0, import_react.useState)(null);
	const [recent, setRecent] = (0, import_react.useState)([]);
	const [showDropdown, setShowDropdown] = (0, import_react.useState)(false);
	const [showSpotifyBox, setShowSpotifyBox] = (0, import_react.useState)(false);
	const [spotifyUrl, setSpotifyUrl] = (0, import_react.useState)("");
	const [isFetchingSpotify, setIsFetchingSpotify] = (0, import_react.useState)(false);
	const [spotifyHint, setSpotifyHint] = (0, import_react.useState)(null);
	const containerRef = (0, import_react.useRef)(null);
	const searchSeqRef = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		setRecent(getRecentSearches());
	}, []);
	(0, import_react.useEffect)(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) setShowDropdown(false);
		};
		document.addEventListener("pointerdown", handleClickOutside);
		return () => document.removeEventListener("pointerdown", handleClickOutside);
	}, []);
	(0, import_react.useEffect)(() => {
		if (query.trim().length < 2) {
			searchSeqRef.current += 1;
			setResults([]);
			setShowDropdown(false);
			setIsSearching(false);
			return;
		}
		const seq = ++searchSeqRef.current;
		const timer = setTimeout(async () => {
			setIsSearching(true);
			setSearchHint(null);
			try {
				const hits = await searchItunes(query.trim());
				if (seq !== searchSeqRef.current) return;
				setResults(hits);
				setShowDropdown(true);
				setSearchHint({ text: `${hits.length} songs found. Pick one from the list.` });
			} catch (err) {
				if (seq !== searchSeqRef.current) return;
				setResults([]);
				setSearchHint({
					text: err instanceof SearchError ? err.message : "Failed to search iTunes.",
					isError: true
				});
			} finally {
				if (seq === searchSeqRef.current) setIsSearching(false);
			}
		}, 500);
		return () => clearTimeout(timer);
	}, [query]);
	const handleManualSearch = async (e) => {
		e.preventDefault();
		if (!query.trim()) {
			setSearchHint({
				text: "Type a song or artist to search for.",
				isError: true
			});
			return;
		}
		const seq = ++searchSeqRef.current;
		setIsSearching(true);
		setSearchHint(null);
		try {
			const hits = await searchItunes(query.trim());
			if (seq !== searchSeqRef.current) return;
			setResults(hits);
			setShowDropdown(true);
			setSearchHint({ text: `${hits.length} songs found. Pick one below.` });
			const updated = addRecentSearch(query.trim());
			setRecent(updated);
		} catch (err) {
			if (seq !== searchSeqRef.current) return;
			setResults([]);
			setSearchHint({
				text: err instanceof SearchError ? err.message : "Something went wrong. Please try again.",
				isError: true
			});
		} finally {
			if (seq === searchSeqRef.current) setIsSearching(false);
		}
	};
	const handleSelect = (song) => {
		onSelectSong(song);
		const updated = addRecentSearch(`${song.title} ${song.artist}`);
		setRecent(updated);
		setShowDropdown(false);
		onToast(`Loaded "${song.title}" by ${song.artist}`);
	};
	const handleSpotifySubmit = async (e) => {
		e.preventDefault();
		if (!spotifyUrl.trim()) {
			setSpotifyHint({
				text: "Paste a Spotify track link first.",
				isError: true
			});
			return;
		}
		setIsFetchingSpotify(true);
		setSpotifyHint({ text: "Fetching cover from Spotify…" });
		try {
			const { coverUrl, trackId, title } = await fetchSpotifyCover(spotifyUrl.trim());
			onSpotifyTrack(coverUrl, trackId, title);
			setSpotifyHint({
				text: "Cover found!",
				isError: false
			});
			onToast("Cover art fetched from Spotify!");
		} catch (err) {
			setSpotifyHint({
				text: err instanceof SearchError ? err.message : "Could not fetch Spotify track.",
				isError: true
			});
		} finally {
			setIsFetchingSpotify(false);
		}
	};
	const handleRecentClear = () => {
		clearRecentSearches();
		setRecent([]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		ref: containerRef,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-bold uppercase tracking-wider text-[#1db954]",
				children: "Search"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleManualSearch,
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute left-3.5 text-[#707070] pointer-events-none",
								children: isSearching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-4 h-4 animate-spin text-[#1db954]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: query,
								onChange: (e) => setQuery(e.target.value),
								onFocus: () => {
									if (results.length > 0) setShowDropdown(true);
								},
								placeholder: "Search song or artist...",
								className: "w-full pl-10 pr-24 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all",
								autoComplete: "off",
								spellCheck: "false"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: isSearching,
								className: "absolute right-1.5 px-3.5 py-1.5 bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold text-xs rounded-lg transition-all active:scale-95",
								children: isSearching ? "Searching" : "Search"
							})
						]
					}),
					searchHint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-2 text-xs ${searchHint.isError ? "text-[#ff7b7b]" : "text-[#1db954]"}`,
						children: searchHint.text
					}),
					showDropdown && results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						role: "listbox",
						className: "absolute top-full left-0 right-0 mt-2 z-30 max-h-72 overflow-y-auto bg-[#1e1e1e] border border-[#333333] rounded-xl shadow-2xl p-1.5 space-y-1",
						children: results.map((song, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => handleSelect(song),
							className: "w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left group",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: song.thumb,
									alt: "",
									className: "w-11 h-11 rounded-md object-cover bg-[#333333] shrink-0"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-white truncate group-hover:text-[#1db954] transition-colors",
										children: song.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-[#a0a0a0] truncate",
										children: [song.artist, song.album].filter(Boolean).join(" · ")
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 text-[#1db954] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" })
							]
						}) }, `${song.title}-${song.artist}-${i}`))
					})
				]
			}),
			recent.length > 0 && !query && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 pt-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs text-[#808080]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recent searches" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleRecentClear,
						className: "hover:text-white transition-colors",
						children: "Clear"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: recent.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setQuery(item);
						},
						className: "px-3 py-1 bg-[#222222] hover:bg-[#2a2a2a] border border-[#333333] hover:border-[#1db954] text-xs text-[#d0d0d0] hover:text-white rounded-full transition-all truncate max-w-full",
						children: item
					}, idx))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-2 border-t border-[#262626]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setShowSpotifyBox((prev) => !prev),
					className: "flex items-center gap-2 text-xs font-medium text-[#b3b3b3] hover:text-white transition-colors",
					"aria-expanded": showSpotifyBox,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `w-3.5 h-3.5 transition-transform duration-200 ${showSpotifyBox ? "rotate-180 text-[#1db954]" : ""}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "w-3.5 h-3.5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Or paste a Spotify Track Link" })
					]
				}), showSpotifyBox && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSpotifySubmit,
					className: "mt-3 p-3 bg-white/[0.03] border border-[#2e2e2e] rounded-xl space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							value: spotifyUrl,
							onChange: (e) => setSpotifyUrl(e.target.value),
							placeholder: "https://open.spotify.com/track/...",
							className: "w-full pl-3 pr-20 py-2 bg-[#222222] border border-[#383838] focus:border-[#1db954] focus:ring-2 focus:ring-[#1db954]/20 rounded-lg text-xs text-white placeholder-[#606060] outline-none",
							spellCheck: "false"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: isFetchingSpotify,
							className: "absolute right-1 px-3 py-1 bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-50 text-black font-semibold text-xs rounded-md transition-all",
							children: isFetchingSpotify ? "Fetching" : "Fetch"
						})]
					}), spotifyHint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-xs ${spotifyHint.isError ? "text-[#ff7b7b]" : "text-[#1db954]"}`,
						children: spotifyHint.text
					})]
				})]
			})
		]
	});
});
var ALL_THEMES = Object.keys(THEMES);
var SIGNATURE_SET = new Set(SIGNATURE_THEMES);
var COLLECTOR_SET = new Set(COLLECTOR_THEMES);
var StyleSection = import_react.memo(({ state, onChange, onSetTheme, onSetLayout, coverPalette, onMatchCoverColor, renderedLyricSize, hasTextOverflow }) => {
	const [group, setGroup] = (0, import_react.useState)("all");
	const currentTheme = THEMES[state.theme] || THEMES.classic;
	const visibleThemes = (0, import_react.useMemo)(() => ALL_THEMES.filter((k) => {
		if (group === "collector") return COLLECTOR_SET.has(k);
		if (group === "signature") return SIGNATURE_SET.has(k);
		if (group === "classic") return !COLLECTOR_SET.has(k) && !SIGNATURE_SET.has(k);
		return true;
	}), [group]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "block text-xs uppercase tracking-wider font-bold text-[#1db954]",
					children: "Card Layout"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl",
					children: Object.keys(LAYOUTS).map((key) => {
						const l = LAYOUTS[key];
						const isSelected = state.layoutKey === key;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSetLayout(key),
							className: `flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all ${isSelected ? "bg-[#1db954] text-black font-semibold shadow-md" : "text-[#b3b3b3] hover:text-white hover:bg-white/5"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: l.label.split(" · ")[0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-[10px] ${isSelected ? "text-black/70" : "text-[#707070]"}`,
								children: l.label.split(" · ")[1]
							})]
						}, key);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-xs font-bold uppercase tracking-wider text-[#1db954]",
							children: [
								"Styles (",
								ALL_THEMES.length,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] font-medium text-[#b3b3b3]",
							children: currentTheme.label
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1",
						children: [
							["all", `All (${ALL_THEMES.length})`],
							["collector", `Collector (${COLLECTOR_THEMES.length})`],
							["signature", `Signature (${SIGNATURE_THEMES.length})`],
							["classic", "Classic (23)"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setGroup(id),
							className: `rounded-full px-2.5 py-1 text-[10.5px] font-semibold transition-all ${group === id ? "bg-[#1db954] text-black" : "bg-[#222222] text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-white"}`,
							children: label
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-0.5",
						children: visibleThemes.map((key) => {
							const t = THEMES[key];
							const on = state.theme === key;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onSetTheme(key),
								"aria-pressed": on,
								title: `${t.label} — ${t.desc}`,
								className: `flex items-center gap-1.5 min-h-10 rounded-lg px-2 py-1.5 text-left text-[11px] border transition-all ${on ? "bg-[#1db954] border-[#1db954] font-semibold text-black shadow-sm" : "bg-[#222222] border-[#2e2e2e] text-[#d0d0d0] hover:bg-[#2a2a2a] hover:border-[#3e3e3e] hover:text-white"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									viewBox: "0 0 24 24",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.9",
									strokeLinecap: "round",
									strokeLinejoin: "round",
									className: `h-3.5 w-3.5 shrink-0 ${on ? "text-black" : "text-[#1db954]"}`,
									"aria-hidden": "true",
									dangerouslySetInnerHTML: { __html: t.icon }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: t.label
								})]
							}, key);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-[#808080]",
						children: currentTheme.desc
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-xs uppercase tracking-wider font-bold text-[#1db954]",
							children: "Card Background"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-mono text-[#b3b3b3]",
							children: state.color
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [PRESET_COLORS.map((hex) => {
							const isSelected = state.color.toUpperCase() === hex.toUpperCase();
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => onChange({
									color: hex,
									autoColor: false
								}),
								style: { backgroundColor: hex },
								"aria-label": `Color ${hex}`,
								className: `w-7 h-7 rounded-full transition-transform active:scale-90 ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#121212] scale-110 shadow-lg" : "hover:scale-110 opacity-90 hover:opacity-100"}`
							}, hex);
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							title: "Pick custom color",
							className: "relative w-7 h-7 rounded-full cursor-pointer overflow-hidden border border-white/20 hover:scale-110 transition-transform active:scale-90 shadow-sm",
							style: { background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								suppressHydrationWarning: true,
								type: "color",
								value: state.color,
								onChange: (e) => onChange({
									color: e.target.value.toUpperCase(),
									autoColor: false
								}),
								className: "absolute -inset-4 w-16 h-16 opacity-0 cursor-pointer"
							})
						})]
					}),
					coverPalette.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-2 space-y-1.5 border-t border-[#262626]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] text-[#808080]",
							children: "From the cover art:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [coverPalette.map((hex) => {
								const isSelected = state.color.toUpperCase() === hex.toUpperCase();
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onChange({
										color: hex,
										autoColor: false
									}),
									style: { backgroundColor: hex },
									title: `Cover color: ${hex}`,
									className: `w-7 h-7 rounded-full transition-transform ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#121212] scale-110" : "hover:scale-110 opacity-80 hover:opacity-100"}`
								}, hex);
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onMatchCoverColor,
								className: "flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-[#333333] hover:border-white/20 text-xs font-medium text-[#d0d0d0] hover:text-white rounded-full transition-all active:scale-95 ml-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WandSparkles, { className: "w-3.5 h-3.5 text-[#1db954]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Match Cover" })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-2.5 pt-1 cursor-pointer select-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							suppressHydrationWarning: true,
							type: "checkbox",
							checked: state.autoColor,
							onChange: (e) => onChange({ autoColor: e.target.checked }),
							className: "w-4 h-4 mt-0.5 rounded border-[#444444] text-[#1db954] focus:ring-[#1db954] accent-[#1db954]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-medium text-white",
							children: "Auto color from cover"
						}) })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 pt-2 border-t border-[#262626]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-2.5 cursor-pointer select-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							suppressHydrationWarning: true,
							type: "checkbox",
							checked: state.autoFit,
							onChange: (e) => onChange({ autoFit: e.target.checked }),
							className: "w-4 h-4 mt-0.5 rounded border-[#444444] text-[#1db954] focus:ring-[#1db954] accent-[#1db954]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-medium text-white",
							children: "Auto-fit text"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-xs text-[#b3b3b3]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Lyrics Font Size" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-white font-medium",
									children: [renderedLyricSize || state.lyricSize, " px"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": "Decrease lyrics font size",
										onClick: () => {
											const base = state.autoFit ? renderedLyricSize || state.lyricSize : state.lyricSize;
											onChange({
												lyricSize: Math.max(16, base - 2),
												autoFit: false
											});
										},
										className: "w-7 h-7 flex items-center justify-center rounded-full border border-[#444444] hover:border-white bg-[#222222] text-white transition-all active:scale-95",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "w-3 h-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										suppressHydrationWarning: true,
										type: "range",
										min: 16,
										max: 120,
										value: state.autoFit ? renderedLyricSize || state.lyricSize : state.lyricSize,
										onChange: (e) => onChange({
											lyricSize: parseInt(e.target.value, 10),
											autoFit: false
										}),
										className: "flex-1 accent-[#1db954] cursor-pointer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": "Increase lyrics font size",
										onClick: () => {
											const base = state.autoFit ? renderedLyricSize || state.lyricSize : state.lyricSize;
											onChange({
												lyricSize: Math.min(120, base + 2),
												autoFit: false
											});
										},
										className: "w-7 h-7 flex items-center justify-center rounded-full border border-[#444444] hover:border-white bg-[#222222] text-white transition-all active:scale-95",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-3 h-3" })
									})
								]
							}),
							hasTextOverflow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-[#ff7b7b]",
								children: "Lyrics don't fit."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-start gap-2.5 pt-1 cursor-pointer select-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							suppressHydrationWarning: true,
							type: "checkbox",
							checked: state.transparent,
							onChange: (e) => onChange({ transparent: e.target.checked }),
							className: "w-4 h-4 mt-0.5 rounded border-[#444444] text-[#1db954] focus:ring-[#1db954] accent-[#1db954]"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-xs font-medium text-white",
							children: "Transparent export"
						}) })]
					})
				]
			})
		]
	});
});
var TextSection = import_react.memo(({ state, onChange, onOpenLyricsModal }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs font-bold uppercase tracking-wider text-[#1db954]",
				children: "Song"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "coverUrl",
						className: "block text-xs font-medium text-[#b3b3b3]",
						children: "Cover URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "coverUrl",
						type: "text",
						value: state.coverUrl,
						onChange: (e) => onChange({ coverUrl: e.target.value }),
						placeholder: "https://example.com/album-cover.jpg",
						className: "w-full px-3.5 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all",
						spellCheck: "false"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-[#808080]",
						children: "Direct image link (CORS enabled) or fetched automatically via Search."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "songTitle",
					className: "block text-xs font-medium text-[#b3b3b3]",
					children: "Song Title"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "songTitle",
					type: "text",
					value: state.title,
					onChange: (e) => onChange({ title: e.target.value }),
					placeholder: "Enter song title...",
					className: "w-full px-3.5 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "artistName",
					className: "block text-xs font-medium text-[#b3b3b3]",
					children: "Artist Name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "artistName",
					type: "text",
					value: state.artist,
					onChange: (e) => onChange({ artist: e.target.value }),
					placeholder: "Enter artist name...",
					className: "w-full px-3.5 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "lyrics",
						className: "text-xs font-medium text-[#b3b3b3]",
						children: "Lyrics"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onOpenLyricsModal,
						className: "flex items-center gap-1.5 px-3 py-1 bg-[#1e1e1e] hover:bg-white/10 border border-[#383838] hover:border-white/20 text-[#1db954] hover:text-[#1ed760] text-xs font-medium rounded-full transition-all active:scale-95 shadow-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Select Lyrics" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					id: "lyrics",
					rows: 5,
					value: state.lyrics,
					onChange: (e) => onChange({ lyrics: e.target.value }),
					placeholder: "Type or paste your favorite lyrics here. Line breaks are kept intact.",
					className: "w-full px-3.5 py-2.5 bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] border border-[#333333] focus:border-[#1db954] focus:ring-4 focus:ring-[#1db954]/15 rounded-xl text-sm text-white placeholder-[#707070] outline-none transition-all resize-y leading-relaxed font-sans"
				})]
			})
		]
	});
});
var Header = ({ canUndo, canRedo, isPlaying = false, onUndo, onRedo, onTogglePlay, onOpenHelp, onToast }) => {
	const [deferredPrompt, setDeferredPrompt] = (0, import_react.useState)(null);
	const [isInstallable, setIsInstallable] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const handleBeforeInstall = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setIsInstallable(true);
		};
		window.addEventListener("beforeinstallprompt", handleBeforeInstall);
		const ua = navigator.userAgent;
		const isIOS = /iphone|ipad|ipod/i.test(ua) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
		const isStandalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
		if (isIOS && !isStandalone) setIsInstallable(true);
		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
		};
	}, []);
	const handleInstallClick = async () => {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			if ((await deferredPrompt.userChoice).outcome === "accepted") onToast("App installation started");
			setDeferredPrompt(null);
			setIsInstallable(false);
		} else {
			const ua = navigator.userAgent;
			if (/iphone|ipad|ipod/i.test(ua)) onToast("Tap the Share icon in Safari, then select \"Add to Home Screen\".");
			else onToast("To install, open your browser menu and choose \"Install App\" or \"Add to Home Screen\".");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "relative flex items-center justify-between gap-3 px-5 py-4 border-b border-[#282828] bg-[#121212]/90 backdrop-blur-xl shrink-0 z-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:-rotate-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					className: "w-8 h-8 drop-shadow-[0_4px_12px_rgba(29,185,84,0.35)]",
					viewBox: "0 0 48 48",
					"aria-hidden": "true",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "24",
							cy: "24",
							r: "24",
							fill: "#1db954"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M11 17.5c8-2.4 18-1.8 25.5 2.6",
							stroke: "#000",
							strokeWidth: "3.6",
							strokeLinecap: "round",
							fill: "none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M12.5 25c6.7-2 15-1.4 21 2.1",
							stroke: "#000",
							strokeWidth: "3",
							strokeLinecap: "round",
							fill: "none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: "M14 31.6c5.3-1.5 11.3-1 16 1.7",
							stroke: "#000",
							strokeWidth: "2.5",
							strokeLinecap: "round",
							fill: "none"
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-base font-bold tracking-tight",
				children: "SpotifyMan"
			}) })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onTogglePlay,
					"aria-label": isPlaying ? "Pause track preview" : "Play track preview",
					title: isPlaying ? "Pause track preview (Space)" : "Play track preview (Space)",
					className: "flex items-end gap-[3px] h-6 px-2 py-1 rounded-full hover:bg-white/5 transition-colors",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `w-[3px] rounded-sm bg-[#1db954] origin-bottom transition-all ${isPlaying ? "h-full animate-[bounce_1.1s_ease-in-out_infinite]" : "h-1.5 opacity-55"}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `w-[3px] rounded-sm bg-[#1db954] origin-bottom transition-all ${isPlaying ? "h-full animate-[bounce_0.9s_ease-in-out_infinite_-0.4s]" : "h-3 opacity-65"}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `w-[3px] rounded-sm bg-[#1db954] origin-bottom transition-all ${isPlaying ? "h-full animate-[bounce_1.3s_ease-in-out_infinite_-0.8s]" : "h-2 opacity-60"}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `w-[3px] rounded-sm bg-[#1db954] origin-bottom transition-all ${isPlaying ? "h-full animate-[bounce_1.0s_ease-in-out_infinite_-0.2s]" : "h-2.5 opacity-60"}` })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 bg-[#1e1e1e] border border-[#333333] rounded-full p-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onUndo,
						disabled: !canUndo,
						title: "Undo (Ctrl+Z)",
						"aria-label": "Undo",
						className: "w-7 h-7 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white disabled:opacity-30 disabled:hover:text-[#b3b3b3] transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "w-3.5 h-3.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onRedo,
						disabled: !canRedo,
						title: "Redo (Ctrl+Shift+Z)",
						"aria-label": "Redo",
						className: "w-7 h-7 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white disabled:opacity-30 disabled:hover:text-[#b3b3b3] transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Redo2, { className: "w-3.5 h-3.5" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onOpenHelp,
					title: "Keyboard shortcuts (?)",
					"aria-label": "Keyboard shortcuts",
					className: "w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/5 border border-transparent hover:border-[#333333] transition-all",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "w-4 h-4" })
				}),
				isInstallable && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleInstallClick,
					className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: "Install"
					})]
				})
			]
		})]
	});
};
function fmtTime(sec) {
	const s = Math.max(0, Math.floor(Number.isFinite(sec) ? sec : 0));
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${m}:${r < 10 ? "0" : ""}${r}`;
}
var MiniPlayerBar = ({ player, title, artist, barVisibleOnCard, onToggleBarOnCard }) => {
	const remaining = Math.max(0, player.duration - player.currentTime);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onPointerDown: (e) => e.stopPropagation(),
		className: "flex items-center gap-2.5 rounded-full border border-white/12 bg-[#161616]/90 px-3 py-1.5 shadow-2xl backdrop-blur-xl max-w-[94vw] sm:max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void player.togglePlay(),
				disabled: player.isLoading,
				"aria-label": player.isPlaying ? "Pause preview" : "Play preview",
				title: player.isPlaying ? "Pause preview" : "Play track preview & sync card progress bar",
				className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1db954] text-black shadow-md transition-transform hover:scale-105 hover:bg-[#1ed760] active:scale-95 disabled:opacity-60",
				children: player.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : player.isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "h-4 w-4 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 translate-x-[1px] fill-current" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-[140px] sm:min-w-[200px] flex-1 flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 text-[11px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "truncate font-semibold text-white",
						children: [title.trim() || "Song title", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-normal text-[#a0a0a0]",
							children: [" · ", artist.trim() || "Artist"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0 font-mono text-[10px] text-[#b3b3b3]",
						children: [
							fmtTime(player.currentTime),
							" / -",
							fmtTime(remaining)
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 1e3,
						value: Math.round(player.progress * 1e3),
						onChange: (e) => player.seek(parseInt(e.target.value, 10) / 1e3),
						"aria-label": "Scrub track progress on card",
						className: "h-1.5 w-full cursor-pointer accent-[#1db954]"
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onToggleBarOnCard,
				title: barVisibleOnCard ? "Progress bar visible on card (click to hide)" : "Show progress bar on card",
				className: `flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all shrink-0 ${barVisibleOnCard ? "border-[#1db954]/60 bg-[#1db954]/15 text-[#1db954]" : "border-white/10 bg-white/5 text-[#a0a0a0] hover:text-white"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden xs:inline sm:inline",
					children: player.isSimulated ? "Sim" : player.getPreviewAnalysis()?.isFullTrack ? "Full" : player.hasPreviewUrl ? "Sync" : "Bar"
				})]
			})
		]
	});
};
var CardViewport = (0, import_react.lazy)(() => import("./CardViewport-BcfDTEr_.mjs"));
var ViewBoundary = class extends import_react.Component {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	render() {
		return this.state.failed ? this.props.fallback : this.props.children;
	}
};
/** Crisp 2D canvas fallback if WebGL is unavailable on a device */
var CanvasFallback = ({ state, coverImg, tilt, fontEpoch, playback, getLivePlayback, onSize }) => {
	const ref = (0, import_react.useRef)(null);
	const drawFrame = (live) => {
		const canvas = ref.current;
		if (!canvas) return;
		const layout = LAYOUTS[state.layoutKey];
		if (canvas.width !== layout.w) canvas.width = layout.w;
		if (canvas.height !== layout.h) canvas.height = layout.h;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const info = renderCard(ctx, state, layout, coverImg, tilt, {
			flat: false,
			fullBleed: false,
			playback: live ?? playback
		});
		paintGlare(ctx, state, layout, tilt, false);
		onSize?.(info.size, info.overflow);
	};
	(0, import_react.useEffect)(() => {
		drawFrame(getLivePlayback?.() ?? playback);
	}, [
		state,
		coverImg,
		tilt,
		fontEpoch,
		playback,
		onSize
	]);
	(0, import_react.useEffect)(() => {
		if (!playback?.isPlaying || !getLivePlayback) return;
		let rafId = 0;
		const loop = () => {
			const live = getLivePlayback();
			if (live) drawFrame(live);
			rafId = requestAnimationFrame(loop);
		};
		rafId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafId);
	}, [playback?.isPlaying, getLivePlayback]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full w-full items-center justify-center p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref,
			className: "max-h-full max-w-full object-contain drop-shadow-2xl",
			style: { transform: `perspective(${tilt.perspective}px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotateZ(${tilt.rz}deg)` }
		})
	});
};
var Stage = ({ state, coverImg, tilt, isDragging, fontEpoch, player, onToggleBarOnCard, onPointerDown, onPointerMove, onPointerUp, onWheelDelta, onResetTilt, onCardRenderedSize }) => {
	const layout = LAYOUTS[state.layoutKey];
	const themeLabel = THEMES[state.theme]?.label ?? "Classic";
	const [show3d, setShow3d] = (0, import_react.useState)(false);
	const stageAreaRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => setShow3d(true), []);
	(0, import_react.useEffect)(() => {
		const el = stageAreaRef.current;
		if (!el) return;
		const onNativeWheel = (e) => {
			e.preventDefault();
			onWheelDelta(e.deltaY);
		};
		el.addEventListener("wheel", onNativeWheel, { passive: false });
		return () => el.removeEventListener("wheel", onNativeWheel);
	}, [onWheelDelta]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative flex h-full w-full flex-col items-center justify-center overflow-hidden select-none",
		style: { ["--glow"]: state.color },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0",
				style: { background: `radial-gradient(520px 420px at 50% 46%, ${state.color}33, transparent 70%)` }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-3 left-3 z-10 flex max-w-[70%] items-center gap-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-medium text-[#d0d0d0] backdrop-blur-md",
					children: [
						themeLabel,
						" · ",
						layout.w,
						"×",
						layout.h
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-3 right-3 z-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onResetTilt,
					"aria-label": "Reset tilt",
					className: "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[#d0d0d0] backdrop-blur-md active:scale-95",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: stageAreaRef,
				onPointerDown,
				onPointerMove,
				onPointerUp,
				onPointerCancel: onPointerUp,
				onDoubleClick: onResetTilt,
				className: `relative z-1 h-full w-full touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ViewBoundary, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasFallback, {
						state,
						coverImg,
						tilt,
						fontEpoch,
						playback: player.canvasPlayback,
						getLivePlayback: player.getLivePlayback,
						onSize: onCardRenderedSize
					}),
					children: show3d ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: null,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardViewport, {
							state,
							coverImg,
							tilt,
							dragging: isDragging,
							fontEpoch,
							playback: player.canvasPlayback,
							getLivePlayback: player.getLivePlayback,
							onSize: onCardRenderedSize
						})
					}) : null
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute bottom-3 left-1/2 z-10 -translate-x-1/2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniPlayerBar, {
					player,
					title: state.title,
					artist: state.artist,
					barVisibleOnCard: !state.hide.bar,
					onToggleBarOnCard
				})
			})
		]
	});
};
var TABS = [
	{
		id: "search",
		label: "Search",
		icon: Search
	},
	{
		id: "text",
		label: "Text",
		icon: Type
	},
	{
		id: "style",
		label: "Style",
		icon: Palette
	},
	{
		id: "layout",
		label: "Layout",
		icon: SlidersVertical
	},
	{
		id: "looks",
		label: "Looks",
		icon: Sparkles
	}
];
var TabNav = ({ activeTab, onTabChange }) => {
	const listRef = (0, import_react.useRef)(null);
	const [inkStyle, setInkStyle] = (0, import_react.useState)({
		left: 0,
		width: 0
	});
	const updateInk = (0, import_react.useCallback)(() => {
		if (!listRef.current) return;
		const activeBtn = listRef.current.querySelector(`button[data-tab="${activeTab}"]`);
		if (activeBtn) setInkStyle({
			left: activeBtn.offsetLeft + 12,
			width: Math.max(0, activeBtn.offsetWidth - 24)
		});
	}, [activeTab]);
	(0, import_react.useEffect)(() => {
		updateInk();
		window.addEventListener("resize", updateInk);
		return () => window.removeEventListener("resize", updateInk);
	}, [updateInk]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "relative flex items-center border-b border-[#282828] bg-[#161616]/95 backdrop-blur-md px-3 shrink-0 h-12 overflow-x-auto scrollbar-none",
		"aria-label": "Editor sections",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: listRef,
			className: "relative flex items-center h-full w-full",
			children: [TABS.map((tab) => {
				const Icon = tab.icon;
				const isActive = activeTab === tab.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"data-tab": tab.id,
					role: "tab",
					"aria-selected": isActive,
					onClick: () => onTabChange(tab.id),
					className: `relative flex items-center justify-center gap-2 px-4 h-full text-xs font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#1db954] rounded-md ${isActive ? "text-white" : "text-[#888888] hover:text-[#d0d0d0]"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tab.label })]
				}, tab.id);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute bottom-0 h-[3px] rounded-t-full bg-[#1db954] shadow-[0_-2px_12px_rgba(29,185,84,0.6)] transition-all duration-300 ease-out pointer-events-none",
				style: {
					left: `${inkStyle.left}px`,
					width: `${inkStyle.width}px`
				}
			})]
		})
	});
};
var Toast = ({ message, isError }) => {
	if (!message) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "status",
		"aria-live": "polite",
		className: `fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] max-w-[90vw] md:max-w-md px-5 py-3 rounded-xl bg-[#222222]/95 backdrop-blur-md border border-[#333333] shadow-2xl text-sm font-medium text-white flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${isError ? "border-l-4 border-l-[#ff5c5c]" : "border-l-4 border-l-[#1db954]"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message })
	});
};
/** Non-empty card lines in display order (matches the paragraph order on the card). */
function cardLines(lyrics) {
	return String(lyrics || "").replace(/\r\n?/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
}
/** Natural sung length of a line based on its length and syllable density. */
function sungLength(text) {
	const words = text.trim().split(/\s+/).filter(Boolean);
	if (!words.length) return 1.5;
	let totalSyllables = 0;
	for (const w of words) totalSyllables += countSyllables(w);
	const chars = text.replace(/\s+/g, " ").length;
	const est = .45 + totalSyllables * .25 + chars * .036;
	return Math.min(6.4, Math.max(1.25, est));
}
/** Estimates spoken/sung syllable nuclei count for natural word pacing. */
function countSyllables(rawWord) {
	const core = rawWord.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").replace(/(?:[^laeiouy]es|ed|e)$/i, "");
	if (!core) return 1;
	const matches = core.match(/[aeiouyàáâãäåèéêëìíîïòóôõöùúûüýÿ]+/gi);
	return Math.max(1, matches ? matches.length : 1);
}
/**
* Computes phonetic singing weight and post-word breath/punctuation pause weight
* so each word in a lyric line receives a natural singing window.
*/
function wordPhoneticProfile(rawWord) {
	const core = rawWord.replace(/[^\p{L}\p{N}]/gu, "");
	const syllables = countSyllables(rawWord);
	const sustainedBonus = /(?:oo|ee|ay|ow|igh|ing|ou|ea|oh|ah|uh|y|a|o)$/i.test(core) ? .22 : 0;
	const singWeight = .58 * syllables + .08 * Math.min(11, Math.max(1, core.length)) + sustainedBonus;
	let pauseWeight = .045;
	if (/[,;:—–-]$/.test(rawWord)) pauseWeight = .28;
	else if (/[.!?…]$/.test(rawWord)) pauseWeight = .36;
	return {
		singWeight,
		pauseWeight
	};
}
/**
* Builds word-level [startSec, endSec] intervals across a line's [lineStart, lineEnd] window.
*/
function buildLineWordTimings(lineText, lineStart, lineEnd, inlineWords) {
	const tokens = lineText.trim().split(/\s+/).filter(Boolean);
	if (!tokens.length) return [];
	const safeEnd = Math.max(lineStart + .35, lineEnd);
	if (inlineWords && inlineWords.length === tokens.length) return tokens.map((word, idx) => {
		const st = Math.max(lineStart, inlineWords[idx].timeSec);
		const nextSt = idx + 1 < inlineWords.length ? Math.max(st + .08, inlineWords[idx + 1].timeSec - .02) : safeEnd;
		return {
			word,
			startSec: st,
			endSec: Math.min(safeEnd, Math.max(st + .08, nextSt)),
			weight: wordPhoneticProfile(word).singWeight
		};
	});
	const profiles = tokens.map(wordPhoneticProfile);
	const m = tokens.length;
	let totalSlotWeight = 0;
	for (let i = 0; i < m; i++) totalSlotWeight += profiles[i].singWeight + (i < m - 1 ? profiles[i].pauseWeight : 0);
	totalSlotWeight = Math.max(1e-4, totalSlotWeight);
	const lineDur = safeEnd - lineStart;
	const out = [];
	let cursor = lineStart;
	for (let i = 0; i < m; i++) {
		const singDur = profiles[i].singWeight / totalSlotWeight * lineDur;
		const pauseDur = i < m - 1 ? profiles[i].pauseWeight / totalSlotWeight * lineDur : 0;
		const startSec = cursor;
		const endSec = i === m - 1 ? safeEnd : Math.min(safeEnd, Math.max(startSec + .06, startSec + singDur));
		out.push({
			word: tokens[i],
			startSec: Math.round(startSec * 1e3) / 1e3,
			endSec: Math.round(endSec * 1e3) / 1e3,
			weight: profiles[i].singWeight
		});
		cursor += singDur + pauseDur;
	}
	return out;
}
/**
* Builds the absolute start/end of every card line AND every word within each line.
* Uses real LRC timestamps when available; otherwise synthesises natural pacing
* from `anchorSec` so every word still gets its own highlight.
*/
function buildKaraokeTimeline(lines, anchorSec, lineTimes, lineEnds, inlineWordTimes) {
	const safeLines = lines.length > 0 ? lines : [""];
	const n = safeLines.length;
	const starts = [];
	for (let i = 0; i < n; i++) {
		const known = lineTimes[i];
		const prev = i > 0 ? starts[i - 1] : null;
		if (typeof known === "number" && Number.isFinite(known) && (prev === null || known > prev + .18)) starts.push(known);
		else if (prev === null) starts.push(Math.max(0, anchorSec));
		else {
			const prevEnd = lineEnds && typeof lineEnds[i - 1] === "number" && lineEnds[i - 1] > prev ? lineEnds[i - 1] : prev + sungLength(safeLines[i - 1] || "") + .28;
			starts.push(prevEnd);
		}
	}
	const ends = starts.map((s, i) => {
		const est = sungLength(safeLines[i] || "");
		const nextStart = i + 1 < n ? starts[i + 1] : null;
		const explicitEnd = lineEnds && typeof lineEnds[i] === "number" && Number.isFinite(lineEnds[i]) ? lineEnds[i] : null;
		let rawEnd = s + est;
		if (explicitEnd !== null && explicitEnd > s + .35) rawEnd = Math.min(explicitEnd - .06, s + est * 1.32);
		if (nextStart !== null) {
			const gap = nextStart - s;
			const cap = Math.max(s + .35, nextStart - .06);
			rawEnd = gap <= est * 1.38 ? cap : Math.min(cap, rawEnd);
		}
		return Math.max(s + .35, rawEnd);
	});
	return {
		lines: safeLines,
		starts,
		ends,
		words: safeLines.map((lineText, i) => buildLineWordTimings(lineText, starts[i], ends[i], inlineWordTimes?.[i]))
	};
}
var smoothstep = (e0, e1, x) => {
	const t = Math.min(1, Math.max(0, (x - e0) / Math.max(1e-4, e1 - e0)));
	return t * t * (3 - 2 * t);
};
function cumAt(env, songTime) {
	const f = (songTime - env.songOffset) * env.rate;
	const arr = env.cumulative;
	if (f <= 0) return arr[0] ?? 0;
	const last = arr.length - 1;
	if (f >= last) return arr[last] ?? 0;
	const i = Math.floor(f);
	const k = f - i;
	return arr[i] * (1 - k) + arr[i + 1] * k;
}
/**
* Computes per-line highlight weights AND per-word fill fractions [0..1]
* for an absolute song time. Lead of ~0.07s matches human visual anticipation.
*/
function computeKaraokeFrame(timeline, songTime, vocal) {
	const { starts, ends, words } = timeline;
	const n = starts.length;
	const effectiveTime = songTime + .07;
	let active = -1;
	for (let i = 0; i < n; i++) if (effectiveTime >= starts[i]) active = i;
	const lineWeights = new Array(n).fill(0);
	if (active >= 0) {
		lineWeights[active] = smoothstep(starts[active] - .18, starts[active] + .08, effectiveTime);
		if (active > 0) lineWeights[active - 1] = 1 - lineWeights[active];
	}
	const wordFills = [];
	let activeLineFill = 0;
	let activeWordIndex = -1;
	for (let i = 0; i < n; i++) {
		const lineWords = words?.[i] ?? [];
		const m = lineWords.length;
		if (m === 0) {
			wordFills.push([]);
			continue;
		}
		if (i < active) {
			wordFills.push(new Array(m).fill(1));
			continue;
		}
		if (i > active) {
			wordFills.push(new Array(m).fill(0));
			continue;
		}
		const s = starts[i];
		const e = Math.max(s + .35, ends[i]);
		const fills = new Array(m).fill(0);
		let completedWeight = 0;
		let totalWeight = 0;
		for (let k = 0; k < m; k++) {
			const w = lineWords[k];
			const ws = w.startSec;
			const we = Math.max(ws + .05, w.endSec);
			const ww = Math.max(.1, w.weight);
			totalWeight += ww;
			let wf = 0;
			if (effectiveTime <= ws) wf = 0;
			else if (effectiveTime >= we) wf = 1;
			else {
				const linearW = (effectiveTime - ws) / (we - ws);
				wf = linearW;
				if (vocal && vocal.cumulative.length > 2) {
					const wc0 = cumAt(vocal, ws);
					const wc1 = cumAt(vocal, we);
					if (wc1 - wc0 > 1e-6) wf = Math.min(1, Math.max(0, (cumAt(vocal, effectiveTime) - wc0) / (wc1 - wc0))) * .65 + linearW * .35;
				}
				wf = Math.min(1, Math.max(0, wf));
				if (activeWordIndex === -1) activeWordIndex = k;
			}
			fills[k] = wf;
			completedWeight += wf * ww;
		}
		if (activeWordIndex === -1 && effectiveTime >= s && effectiveTime < e) {
			for (let k = 0; k < m; k++) if (fills[k] < 1) {
				activeWordIndex = k;
				break;
			}
			if (activeWordIndex === -1) activeWordIndex = m - 1;
		}
		wordFills.push(fills);
		activeLineFill = totalWeight > 0 ? Math.min(1, Math.max(0, completedWeight / totalWeight)) : Math.min(1, Math.max(0, (effectiveTime - s) / (e - s)));
	}
	return {
		lineWeights,
		activeParagraph: active,
		activeLineFill,
		wordFills,
		activeWordIndex
	};
}
var FRAME_RATE = 50;
var analysisCache = /* @__PURE__ */ new Map();
var alignCache = /* @__PURE__ */ new Map();
async function fetchAudio(url, signal) {
	const attempt = async (u) => {
		try {
			const res = await fetch(u, { signal });
			if (!res.ok) return null;
			const contentType = (res.headers.get("content-type") || "audio/mp4").split(";")[0].trim();
			const rawKind = res.headers.get("x-audio-kind");
			const kind = rawKind === "full" || rawKind === "preview" ? rawKind : null;
			const buf = await res.arrayBuffer();
			return buf.byteLength > 512 ? {
				buf,
				contentType,
				kind
			} : null;
		} catch {
			return null;
		}
	};
	if (/^https?:\/\//i.test(url)) {
		const viaProxy = await attempt(`/api/audio-proxy?url=${encodeURIComponent(url)}`);
		if (viaProxy) return viaProxy;
	}
	return attempt(url);
}
async function bandRender(buffer, setup) {
	const ctx = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	setup(ctx, src).connect(ctx.destination);
	src.start();
	return (await ctx.startRendering()).getChannelData(0);
}
function frameEnergy(data, sampleRate) {
	const hop = Math.max(1, Math.round(sampleRate / FRAME_RATE));
	const frames = Math.floor(data.length / hop);
	const out = new Float32Array(frames);
	for (let f = 0; f < frames; f++) {
		let sum = 0;
		const base = f * hop;
		for (let i = 0; i < hop; i++) {
			const v = data[base + i];
			sum += v * v;
		}
		out[f] = Math.sqrt(sum / hop);
	}
	return out;
}
function onsetStrength(energy) {
	const n = energy.length;
	const logE = new Float32Array(n);
	for (let i = 0; i < n; i++) logE[i] = Math.log(1e-4 + energy[i]);
	const out = new Float32Array(n);
	for (let i = 4; i < n; i++) {
		const ref = (logE[i - 2] + logE[i - 3] + logE[i - 4]) / 3;
		out[i] = Math.max(0, logE[i] - ref);
	}
	return out;
}
/** Decodes the preview and extracts vocal-band onset + energy envelopes (cached per URL). */
function analyzePreview(url, signal) {
	const cached = analysisCache.get(url);
	if (cached) return cached;
	const job = (async () => {
		if (typeof window === "undefined" || typeof OfflineAudioContext === "undefined") return null;
		const payload = await fetchAudio(url, signal);
		if (!payload) return null;
		let buffer;
		try {
			buffer = await new OfflineAudioContext(2, 44100, 44100).decodeAudioData(payload.buf.slice(0));
		} catch {
			return null;
		}
		const blob = new Blob([payload.buf], { type: payload.contentType || "audio/mp4" });
		const blobUrl = URL.createObjectURL(blob);
		const isFullTrack = payload.kind === "full" || buffer.duration >= 45;
		const vocal = await bandRender(buffer, (ctx, src) => {
			const hp = ctx.createBiquadFilter();
			hp.type = "highpass";
			hp.frequency.value = 280;
			const lp = ctx.createBiquadFilter();
			lp.type = "lowpass";
			lp.frequency.value = 3400;
			src.connect(hp);
			hp.connect(lp);
			return lp;
		});
		const bass = await bandRender(buffer, (ctx, src) => {
			const lp = ctx.createBiquadFilter();
			lp.type = "lowpass";
			lp.frequency.value = 160;
			src.connect(lp);
			return lp;
		});
		const vocalE = frameEnergy(vocal, buffer.sampleRate);
		const bassE = frameEnergy(bass, buffer.sampleRate);
		const vOn = onsetStrength(vocalE);
		const bOn = onsetStrength(bassE);
		const n = Math.min(vOn.length, bOn.length, vocalE.length);
		const onset = new Float32Array(n);
		let mean = 0;
		for (let i = 0; i < n; i++) {
			onset[i] = Math.max(0, vOn[i] - .55 * bOn[i]);
			mean += onset[i];
		}
		mean /= Math.max(1, n);
		let variance = 0;
		for (let i = 0; i < n; i++) variance += (onset[i] - mean) ** 2;
		const std = Math.sqrt(variance / Math.max(1, n)) || 1;
		for (let i = 0; i < n; i++) onset[i] = (onset[i] - mean) / std;
		const sorted = Array.from(vocalE).sort((a, b) => a - b);
		const floor = sorted[Math.floor(sorted.length * .18)] ?? 0;
		const p90 = sorted[Math.floor(sorted.length * .9)] ?? floor + .001;
		const span = Math.max(1e-4, p90 - floor);
		const vocalNorm = new Float32Array(n);
		const cumulative = new Float32Array(n);
		let acc = 0;
		for (let i = 0; i < n; i++) {
			const above = Math.max(0, vocalE[i] - floor);
			vocalNorm[i] = Math.min(1, above / span);
			acc += above + span * .035;
			cumulative[i] = acc;
		}
		let firstVocalFrame = 0;
		for (let i = 2; i < n - 6; i++) if ((vocalNorm[i] + vocalNorm[i + 1] + vocalNorm[i + 2] + vocalNorm[i + 3] + vocalNorm[i + 4]) / 5 >= .24 && (onset[i] > .25 || vocalNorm[i] >= .32)) {
			firstVocalFrame = Math.max(0, i - 1);
			break;
		}
		const firstVocalSec = Math.round(firstVocalFrame / FRAME_RATE * 100) / 100;
		return {
			buffer,
			blobUrl,
			isFullTrack,
			vocalE,
			vocalNorm,
			onset,
			cumulative,
			firstVocalSec,
			rate: FRAME_RATE,
			duration: buffer.duration
		};
	})();
	analysisCache.set(url, job);
	job.then((r) => {
		if (!r) analysisCache.delete(url);
	});
	return job;
}
function normalizeSongLines(inputs) {
	const raw = [];
	for (const item of inputs) if (typeof item === "number") {
		if (Number.isFinite(item) && item >= 0) raw.push({ start: item });
	} else if (item && typeof item.timeSec === "number" && Number.isFinite(item.timeSec) && item.timeSec >= 0) raw.push({
		start: item.timeSec,
		end: item.endTimeSec,
		text: item.text
	});
	raw.sort((a, b) => a.start - b.start);
	return raw.map((r, i) => {
		const nextStart = i + 1 < raw.length ? raw[i + 1].start : r.start + 3.5;
		const est = r.text ? sungLength(r.text) : 2.6;
		const end = Math.min(nextStart - .08, r.end && r.end > r.start + .3 ? Math.min(r.end, r.start + est * 1.35) : r.start + est);
		const prevText = i > 0 ? raw[i - 1].text : void 0;
		const prevEnd = i > 0 ? Math.min(r.start, raw[i - 1].start + (prevText ? sungLength(prevText) : 2.6)) : 0;
		const afterGap = i === 0 || r.start - prevEnd >= .45;
		return {
			start: r.start,
			end: Math.max(r.start + .35, end),
			afterGap
		};
	});
}
/**
* Finds where the preview clip sits inside the song by correlating:
* 1) Vocal-band onsets at each LRC line start (weighted higher after breath/phrase gaps),
* 2) Vocal presence inside sung intervals vs. vocal absence in instrumental gaps,
* 3) Phrase-boundary alignment with `analysis.firstVocalSec`.
*/
function estimatePreviewOffset(analysis, songLinesInput, songDuration, cacheKey) {
	if (cacheKey && alignCache.has(cacheKey)) return alignCache.get(cacheKey) ?? null;
	const lines = normalizeSongLines(songLinesInput);
	const clip = analysis.duration;
	if (lines.length < 2 || clip < 5) return analysis.isFullTrack ? {
		offset: 0,
		confidence: 1
	} : null;
	const lastStart = lines[lines.length - 1].start;
	const maxOffset = Math.max(0, (songDuration > 0 ? songDuration : lastStart + 20) - clip);
	const { onset, vocalNorm, rate, firstVocalSec } = analysis;
	const scoreOnsetAt = (clipSec, afterGap) => {
		const a = Math.max(0, Math.floor((clipSec - .11) * rate));
		const b = Math.min(onset.length - 1, Math.ceil((clipSec + .15) * rate));
		let peak = -2.5;
		for (let i = a; i <= b; i++) if (onset[i] > peak) peak = onset[i];
		if (!afterGap) return peak;
		const preA = Math.max(0, Math.floor((clipSec - .32) * rate));
		const preB = Math.max(preA, Math.floor((clipSec - .08) * rate));
		let preSum = 0;
		let preCnt = 0;
		for (let i = preA; i <= preB && i < vocalNorm.length; i++) {
			preSum += vocalNorm[i];
			preCnt++;
		}
		const preVocal = preCnt > 0 ? preSum / preCnt : .5;
		return peak * 1.25 + (.45 - preVocal) * .7;
	};
	const meanVocal = (c0, c1) => {
		const a = Math.max(0, Math.floor(c0 * rate));
		const b = Math.min(vocalNorm.length - 1, Math.ceil(c1 * rate));
		if (b <= a) return 0;
		let s = 0;
		for (let i = a; i <= b; i++) s += vocalNorm[i];
		return s / (b - a + 1);
	};
	const evaluateOffset = (off) => {
		let onsetSum = 0;
		let weightSum = 0;
		let count = 0;
		let vocalGateScore = 0;
		let gateCount = 0;
		let firstLineInClip = null;
		for (let i = 0; i < lines.length; i++) {
			const ln = lines[i];
			const cStart = ln.start - off;
			const cEnd = ln.end - off;
			if (cEnd < .2) continue;
			if (cStart > clip - .25) break;
			if (!firstLineInClip && cStart >= -.25) firstLineInClip = ln;
			if (cStart >= .04 && cStart <= clip - .25) {
				const w = ln.afterGap ? 1.35 : 1;
				onsetSum += scoreOnsetAt(cStart, ln.afterGap) * w;
				weightSum += w;
				count++;
			}
			const singA = Math.max(0, cStart + .05);
			const singB = Math.min(clip, cEnd);
			if (singB - singA >= .35) {
				vocalGateScore += (meanVocal(singA, singB) - .38) * 1.1;
				gateCount++;
			}
			if (i + 1 < lines.length) {
				const gapA = Math.max(0, cEnd + .14);
				const gapB = Math.min(clip, lines[i + 1].start - off - .1);
				if (gapB - gapA >= .4) {
					vocalGateScore += (.42 - meanVocal(gapA, gapB)) * 1.25;
					gateCount++;
				}
			}
		}
		if (count < 2) return -999;
		const avgOnset = onsetSum / Math.max(1, weightSum) * Math.sqrt(count);
		const avgGate = gateCount > 0 ? vocalGateScore / gateCount * Math.sqrt(gateCount) : 0;
		let firstVocalBonus = 0;
		if (firstLineInClip) {
			const cFirst = firstLineInClip.start - off;
			const diff = Math.abs(cFirst - firstVocalSec);
			if (diff <= .28) firstVocalBonus = (1 - diff / .28) * 1.65;
		}
		return avgOnset + avgGate * 1.3 + firstVocalBonus;
	};
	if (analysis.isFullTrack) {
		let bestOff = 0;
		let bestScore = evaluateOffset(0);
		for (let off = -2.2; off <= 2.800001; off += .01) {
			const sc = evaluateOffset(off) - Math.abs(off) * .18;
			if (sc > bestScore) {
				bestScore = sc;
				bestOff = off;
			}
		}
		const out = {
			offset: Math.round(bestOff * 100) / 100,
			confidence: 1
		};
		if (cacheKey) alignCache.set(cacheKey, out);
		return out;
	}
	const coarseStep = .04;
	const scores = [];
	for (let off = 0; off <= maxOffset + 1e-6; off += coarseStep) {
		const sc = evaluateOffset(off);
		if (sc > -900) scores.push({
			offset: off,
			score: sc
		});
	}
	if (!scores.length) return null;
	scores.sort((a, b) => b.score - a.score);
	const peaks = [];
	for (const cand of scores) if (peaks.every((p) => Math.abs(p.offset - cand.offset) > 1)) {
		peaks.push(cand);
		if (peaks.length >= 3) break;
	}
	let best = peaks[0];
	for (const pk of peaks) {
		const lo = Math.max(0, pk.offset - .08);
		const hi = Math.min(maxOffset, pk.offset + .08);
		for (let off = lo; off <= hi + 1e-6; off += .01) {
			const sc = evaluateOffset(off);
			if (sc > best.score) best = {
				offset: off,
				score: sc
			};
		}
	}
	const rival = scores.find((s) => Math.abs(s.offset - best.offset) > 1.5);
	const margin = rival ? best.score - rival.score : best.score;
	const confidence = Math.max(0, Math.min(1, margin / Math.max(1, Math.abs(best.score))));
	const out = {
		offset: Math.round(best.offset * 100) / 100,
		confidence
	};
	if (cacheKey) alignCache.set(cacheKey, out);
	return out;
}
/**
* Snaps every line start, line end, and word boundary in a `KaraokeTimeline`
* to the singer's actual vocal energy & syllable onsets in the decoded audio clip.
*/
function alignTimelineToAudio(timeline, analysis, songOffset) {
	if (!analysis || songOffset === null) return timeline;
	const { lines, starts, ends } = timeline;
	const { onset, vocalNorm, cumulative, rate, duration } = analysis;
	const n = lines.length;
	if (!n || cumulative.length < 4) return timeline;
	const frameAt = (clipSec) => Math.min(cumulative.length - 1, Math.max(0, Math.round(clipSec * rate)));
	const cumClip = (clipSec) => {
		const f = clipSec * rate;
		if (f <= 0) return cumulative[0] ?? 0;
		const last = cumulative.length - 1;
		if (f >= last) return cumulative[last] ?? 0;
		const i = Math.floor(f);
		const k = f - i;
		return cumulative[i] * (1 - k) + cumulative[i + 1] * k;
	};
	const refinedStarts = starts.map((s, idx) => {
		const clipS = s - songOffset;
		if (clipS < -.25 || clipS > duration - .3) return s;
		const minClip = idx > 0 ? Math.max(0, starts[idx - 1] - songOffset + .35, clipS - .22) : Math.max(0, clipS - .22);
		const maxClip = Math.min(duration - .2, clipS + .26);
		const f0 = frameAt(minClip);
		const f1 = frameAt(maxClip);
		let bestFrame = frameAt(Math.max(0, clipS));
		let bestScore = -999;
		const centerFrame = bestFrame;
		for (let f = f0; f <= f1; f++) {
			const distPenalty = Math.abs(f - centerFrame) * .08;
			const vNext = (vocalNorm[f] + (vocalNorm[Math.min(f1, f + 1)] ?? vocalNorm[f])) * .5;
			const score = onset[f] * .75 + vNext * .9 - distPenalty;
			if (vNext >= .16 && score > bestScore) {
				bestScore = score;
				bestFrame = f;
			}
		}
		const snappedClip = Math.max(0, (bestFrame - .5) / rate);
		return Math.round((songOffset + snappedClip) * 1e3) / 1e3;
	});
	const refinedEnds = ends.map((e, idx) => {
		const s = refinedStarts[idx];
		const nextS = idx + 1 < n ? refinedStarts[idx + 1] : null;
		const maxAllowed = nextS !== null ? Math.max(s + .32, nextS - .05) : e + .35;
		const nominalEnd = Math.min(maxAllowed, Math.max(s + .35, e));
		const clipS = s - songOffset;
		const clipE = nominalEnd - songOffset;
		if (clipS < 0 || clipE > duration) return nominalEnd;
		const searchStart = clipS + (clipE - clipS) * .62;
		const fStart = frameAt(searchStart);
		const fEnd = frameAt(Math.min(duration, maxAllowed - songOffset));
		let lastActiveFrame = frameAt(clipE);
		for (let f = fEnd; f >= fStart; f--) if (vocalNorm[f] >= .18) {
			lastActiveFrame = Math.min(fEnd, f + 1);
			break;
		}
		const snappedEnd = songOffset + lastActiveFrame / rate;
		return Math.round(Math.min(maxAllowed, Math.max(s + .35, snappedEnd)) * 1e3) / 1e3;
	});
	return {
		lines,
		starts: refinedStarts,
		ends: refinedEnds,
		words: lines.map((lineText, idx) => {
			const s = refinedStarts[idx];
			const e = refinedEnds[idx];
			const tokens = lineText.trim().split(/\s+/).filter(Boolean);
			const m = tokens.length;
			if (m === 0) return [];
			if (m === 1) return [{
				word: tokens[0],
				startSec: s,
				endSec: e,
				weight: wordPhoneticProfile(tokens[0]).singWeight
			}];
			const clipS = s - songOffset;
			const clipE = e - songOffset;
			if (clipS < -.1 || clipE > duration + .1 || clipE - clipS < .25) return buildLineWordTimings(lineText, s, e);
			const profiles = tokens.map(wordPhoneticProfile);
			let totalWeight = 0;
			for (let k = 0; k < m; k++) totalWeight += profiles[k].singWeight + (k < m - 1 ? profiles[k].pauseWeight : 0);
			totalWeight = Math.max(1e-4, totalWeight);
			const c0 = cumClip(Math.max(0, clipS));
			const c1 = cumClip(Math.min(duration, clipE));
			const cSpan = Math.max(1e-5, c1 - c0);
			const timeForFraction = (frac) => {
				const clamped = Math.min(1, Math.max(0, frac));
				const linearClip = clipS + clamped * (clipE - clipS);
				if (cSpan <= 1e-4) return linearClip;
				const targetC = c0 + clamped * cSpan;
				let lo = Math.max(0, clipS);
				let hi = Math.min(duration, clipE);
				for (let it = 0; it < 12; it++) {
					const mid = (lo + hi) * .5;
					if (cumClip(mid) < targetC) lo = mid;
					else hi = mid;
				}
				return (lo + hi) * .5 * .7 + linearClip * .3;
			};
			const snapWordStart = (candClip, minClip, maxClip) => {
				const winLo = Math.max(minClip, candClip - .075);
				const winHi = Math.min(maxClip, candClip + .075);
				if (winHi <= winLo) return candClip;
				const f0 = frameAt(winLo);
				const f1 = frameAt(winHi);
				const fCenter = frameAt(candClip);
				let bestF = fCenter;
				let bestSc = -999;
				for (let f = f0; f <= f1; f++) {
					const prevV = vocalNorm[Math.max(0, f - 1)] ?? vocalNorm[f];
					const curV = vocalNorm[f];
					const rise = Math.max(0, curV - prevV);
					const sc = onset[f] * .65 + rise * 1.2 + curV * .25 - Math.abs(f - fCenter) * .12;
					if (curV >= .12 && sc > bestSc) {
						bestSc = sc;
						bestF = f;
					}
				}
				return Math.min(maxClip, Math.max(minClip, bestF / rate));
			};
			const wordStartsClip = new Array(m).fill(clipS);
			const wordEndsClip = new Array(m).fill(clipE);
			let accWeight = 0;
			for (let k = 0; k < m; k++) {
				const singW = profiles[k].singWeight;
				const pauseW = k < m - 1 ? profiles[k].pauseWeight : 0;
				const startFrac = accWeight / totalWeight;
				const endFrac = (accWeight + singW) / totalWeight;
				accWeight += singW + pauseW;
				const rawStart = k === 0 ? clipS : timeForFraction(startFrac);
				const rawEnd = k === m - 1 ? clipE : timeForFraction(endFrac);
				const minStart = k === 0 ? clipS : Math.min(clipE - .04, wordEndsClip[k - 1]);
				const snappedStart = k === 0 ? clipS : snapWordStart(rawStart, minStart, Math.max(minStart, rawEnd - .04));
				wordStartsClip[k] = snappedStart;
				wordEndsClip[k] = Math.max(snappedStart + .045, rawEnd);
			}
			for (let k = 0; k < m - 1; k++) {
				const nextSt = Math.max(wordStartsClip[k] + .045, wordStartsClip[k + 1]);
				wordStartsClip[k + 1] = nextSt;
				wordEndsClip[k] = Math.min(wordEndsClip[k], nextSt - .012);
				wordEndsClip[k] = Math.max(wordStartsClip[k] + .04, wordEndsClip[k]);
			}
			wordEndsClip[m - 1] = Math.max(wordStartsClip[m - 1] + .045, clipE);
			return tokens.map((word, k) => ({
				word,
				startSec: Math.round((songOffset + wordStartsClip[k]) * 1e3) / 1e3,
				endSec: Math.round((songOffset + wordEndsClip[k]) * 1e3) / 1e3,
				weight: profiles[k].singWeight
			}));
		})
	};
}
/** Vocal envelope positioned on the song timeline, for karaoke fill pacing. */
function vocalEnvelopeFor(analysis, songOffset) {
	return {
		cumulative: analysis.cumulative,
		rate: analysis.rate,
		songOffset
	};
}
var LYRICS_API = "https://api.lyrics.ovh/v1";
var LRCLIB_API = "https://lrclib.net/api";
var LYRICS_TIMEOUT = 6e3;
var NOT_FOUND = "Lyrics not found for this song. You can type them manually.";
var OFFLINE_LYRICS = "You're offline, so lyrics can't be fetched. You can type them manually.";
var cleanTitle = (t) => t.replace(/\s*[([].*?[)\]]/g, "").replace(/\s+-\s+.*$/, "").trim();
var stripFeat = (t) => t.replace(/\s*[([]\s*(?:feat|ft|featuring|with)\.?\s[^)\]]*[)\]]/gi, "").replace(/\s+(?:feat|ft|featuring)\.?\s.*$/i, "").trim();
function lyricQueries(artist, title) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	const add = (a, t) => {
		a = (a || "").trim();
		t = (t || "").trim();
		const k = (a + "|" + t).toLowerCase();
		if (a && t && !seen.has(k)) {
			seen.add(k);
			out.push([a, t]);
		}
	};
	const a1 = artist.trim();
	const a2 = stripFeat(a1);
	const a3 = a2.split(/\s*(?:,|&|;|\band\b)\s*/i)[0];
	const tc = cleanTitle(title);
	const tn = stripFeat(tc);
	add(a1, tc);
	add(a1, tn);
	add(a2, tn);
	add(a3, tn);
	add(a1, title);
	return out;
}
/**
* Parses synced LRC text into lines while preserving each line's start/end timestamp
* and any inline word timestamps (<mm:ss.xx>word) in seconds.
*/
function parseTimedLrc(syncedText, plainFallback = "", totalDuration = 0) {
	const rawSynced = String(syncedText || "").trim();
	if (rawSynced) {
		const out = [];
		const lines = rawSynced.split(/\r?\n/);
		const tagRe = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/;
		const inlineWordRe = /[<[](\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?[>\]]([^<[\]]+)/g;
		const toSec = (m1, m2, m3) => {
			const mins = parseInt(m1, 10) || 0;
			const secs = parseInt(m2, 10) || 0;
			const frac = m3 ? parseInt(m3.padEnd(3, "0").slice(0, 3), 10) / 1e3 : 0;
			return Math.round((mins * 60 + secs + frac) * 100) / 100;
		};
		for (const raw of lines) {
			if (/^\s*\[[a-z]{1,}:[^\]]*\]\s*$/i.test(raw)) continue;
			const m = tagRe.exec(raw);
			const clean = raw.replace(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g, "").replace(/<\d{1,3}:\d{2}(?:[.:]\d{1,3})?>/g, "").replace(/\s+/g, " ").trim();
			if (!clean || /^paroles de la chanson/i.test(clean)) continue;
			let timeSec;
			if (m) timeSec = toSec(m[1], m[2], m[3]);
			const inlineWords = [];
			inlineWordRe.lastIndex = 0;
			let wm;
			while ((wm = inlineWordRe.exec(raw)) !== null) {
				const wTime = toSec(wm[1], wm[2], wm[3]);
				wm[4].trim().split(/\s+/).filter(Boolean).forEach((tok, idx) => {
					inlineWords.push({
						word: tok,
						timeSec: Math.round((wTime + idx * .14) * 100) / 100
					});
				});
			}
			out.push({
				text: clean,
				timeSec,
				words: inlineWords.length >= 2 ? inlineWords : void 0
			});
		}
		for (let i = 0; i < out.length; i++) {
			const curT = out[i].timeSec;
			const nextT = out[i + 1]?.timeSec;
			if (typeof curT === "number" && typeof nextT === "number" && nextT > curT) out[i].endTimeSec = nextT;
		}
		if (out.length > 0) return out;
	}
	const plainLines = String(plainFallback || "").replace(/\r\n?/g, "\n").split("\n").map((l) => l.trim()).filter((l) => l && !/^paroles de la chanson/i.test(l));
	return plainLines.map((text, idx) => {
		return {
			text,
			timeSec: totalDuration > 0 && plainLines.length > 0 ? Math.round((idx + .3) / plainLines.length * totalDuration * 100) / 100 : void 0,
			endTimeSec: totalDuration > 0 && plainLines.length > 0 ? Math.round((idx + 1.15) / plainLines.length * totalDuration * 100) / 100 : void 0
		};
	});
}
function bestLrclib(list, duration) {
	const ok = (Array.isArray(list) ? list : []).filter((r) => r && !r.instrumental && (r.plainLyrics && r.plainLyrics.trim() || r.syncedLyrics && r.syncedLyrics.trim()));
	if (!ok.length) return null;
	ok.sort((a, b) => {
		const aSynced = Boolean(a.syncedLyrics && a.syncedLyrics.trim());
		if (aSynced !== Boolean(b.syncedLyrics && b.syncedLyrics.trim())) return aSynced ? -1 : 1;
		if (duration > 0) return Math.abs((a.duration || 1e9) - duration) - Math.abs((b.duration || 1e9) - duration);
		return 0;
	});
	return ok[0];
}
async function fetchLyrics(artist, title, duration = 0, stale = () => false) {
	const q = lyricQueries(artist, title);
	if (!q.length) throw new SearchError(NOT_FOUND);
	const fromRecord = (r, source) => {
		if (!r || r.instrumental) return null;
		const recDur = typeof r.duration === "number" && r.duration > 0 ? Math.round(r.duration) : duration > 0 ? Math.round(duration) : 0;
		const timedBlocks = parseTimedLrc(r.syncedLyrics || "", r.plainLyrics || "", recDur);
		if (!timedBlocks.length) return null;
		return {
			blocks: timedBlocks.map((b) => b.text),
			timedBlocks,
			duration: recDur > 0 ? recDur : void 0,
			source
		};
	};
	let hit = null;
	for (const [a, t] of q.slice(0, 4)) {
		if (hit || stale()) break;
		try {
			hit = fromRecord(await fetchJson(`${LRCLIB_API}/get?${`track_name=${encodeURIComponent(t)}&artist_name=${encodeURIComponent(a)}` + (duration > 0 ? `&duration=${Math.round(duration)}` : "")}`, LYRICS_TIMEOUT), "LRCLIB");
		} catch {}
	}
	const best = q[Math.min(1, q.length - 1)];
	for (const qs of [`track_name=${encodeURIComponent(q[0][1])}&artist_name=${encodeURIComponent(q[0][0])}`, `q=${encodeURIComponent(best[0] + " " + best[1])}`]) {
		if (hit || stale()) break;
		try {
			hit = fromRecord(bestLrclib(await fetchJson(`${LRCLIB_API}/search?${qs}`, LYRICS_TIMEOUT), duration), "LRCLIB");
		} catch {}
	}
	if (!hit && !stale()) try {
		const d = await fetchJson(`${LYRICS_API}/${encodeURIComponent(q[0][0])}/${encodeURIComponent(q[0][1])}`, LYRICS_TIMEOUT);
		if (d && typeof d.lyrics === "string") {
			const timedBlocks = parseTimedLrc("", d.lyrics, duration);
			if (timedBlocks.length) hit = {
				blocks: timedBlocks.map((b) => b.text),
				timedBlocks,
				duration: duration > 0 ? duration : void 0,
				source: "lyrics.ovh"
			};
		}
	} catch {}
	if (!hit) throw new SearchError(navigator.onLine === false ? OFFLINE_LYRICS : NOT_FOUND);
	return hit;
}
var normLine = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
var matchCache = /* @__PURE__ */ new Map();
function lineSimilarity(a, b) {
	if (!a || !b) return 0;
	if (a === b) return 1;
	if (a.includes(b) || b.includes(a)) {
		const minLen = Math.min(a.length, b.length);
		const maxLen = Math.max(a.length, b.length);
		return minLen / Math.max(1, maxLen) >= .45 ? .9 : .65;
	}
	const wa = a.split(" ").filter(Boolean);
	const wb = b.split(" ").filter(Boolean);
	if (!wa.length || !wb.length) return 0;
	const setB = new Set(wb);
	let shared = 0;
	for (const w of wa) if (setB.has(w)) shared++;
	return 2 * shared / (wa.length + wb.length);
}
var sameLine = (a, b) => lineSimilarity(a, b) >= .58;
/**
* Matches the card lyrics against LRCLIB synced lyrics and returns the exact
* timestamp of every card line for every occurrence in the song.
*/
async function matchLyricTimestamp(artist, title, cardLyrics, durationHint = 0) {
	const targets = cardLyrics.split(/\r?\n/).map(normLine).filter(Boolean);
	const empty = (dur) => ({
		timeSec: null,
		lineTimes: [],
		lineEnds: [],
		duration: dur,
		occurrences: [],
		songLineTimes: [],
		songTimedBlocks: []
	});
	if (!artist.trim() || !title.trim()) return empty(null);
	const cacheKey = `${artist.trim().toLowerCase()}|${title.trim().toLowerCase()}|${targets.join("/")}`;
	const cached = matchCache.get(cacheKey);
	if (cached) return cached;
	try {
		const res = await fetchLyrics(artist, title, durationHint);
		const timed = res.timedBlocks.filter((b) => typeof b.timeSec === "number");
		const fullDur = res.duration ?? (durationHint > 0 ? durationHint : null);
		const norm = timed.map((b) => normLine(b.text));
		const songLineTimes = timed.map((b) => b.timeSec);
		if (!targets.length || !timed.length) {
			const out = {
				timeSec: null,
				lineTimes: [],
				lineEnds: [],
				duration: fullDur,
				occurrences: [],
				songLineTimes,
				songTimedBlocks: timed
			};
			matchCache.set(cacheKey, out);
			return out;
		}
		const walk = (startIdx) => {
			const firstStart = timed[startIdx].timeSec;
			const firstEnd = timed[startIdx].endTimeSec ?? timed[startIdx + 1]?.timeSec ?? firstStart + 3.2;
			const lineTimes = [firstStart];
			const lineEnds = [firstEnd];
			const wordTimes = [timed[startIdx].words];
			let cursor = startIdx;
			let matched = 1;
			for (let k = 1; k < targets.length; k++) {
				let found = -1;
				let bestSim = 0;
				for (let j = cursor + 1; j <= Math.min(norm.length - 1, cursor + 5); j++) {
					const sim = lineSimilarity(norm[j], targets[k]);
					if (sim >= .58 && sim > bestSim) {
						bestSim = sim;
						found = j;
						if (sim >= .92) break;
					}
				}
				if (found >= 0) {
					const st = timed[found].timeSec;
					const et = timed[found].endTimeSec ?? timed[found + 1]?.timeSec ?? st + 3.2;
					lineTimes.push(st);
					lineEnds.push(Math.max(st + .5, et));
					wordTimes.push(timed[found].words);
					cursor = found;
					matched++;
				} else {
					cursor = Math.min(norm.length - 1, cursor + 1);
					const t = timed[cursor]?.timeSec;
					const prevEnd = lineEnds[lineEnds.length - 1];
					const st = typeof t === "number" && t > lineTimes[lineTimes.length - 1] ? t : prevEnd;
					const et = timed[cursor]?.endTimeSec ?? timed[cursor + 1]?.timeSec ?? st + 3;
					lineTimes.push(st);
					lineEnds.push(Math.max(st + .5, et));
					wordTimes.push(timed[cursor]?.words);
				}
			}
			return {
				lineTimes,
				lineEnds,
				wordTimes,
				matched
			};
		};
		const occurrences = [];
		for (let i = 0; i < norm.length; i++) {
			if (!sameLine(norm[i], targets[0])) continue;
			const w = walk(i);
			if (targets.length === 1 || w.matched >= Math.max(2, Math.ceil(targets.length * .5))) occurrences.push({
				timeSec: w.lineTimes[0],
				lineTimes: w.lineTimes,
				lineEnds: w.lineEnds,
				wordTimes: w.wordTimes,
				score: w.matched
			});
		}
		if (!occurrences.length && targets.length > 1) {
			for (let i = 1; i < norm.length; i++) if (sameLine(norm[i], targets[1])) {
				const w = walk(i - 1);
				occurrences.push({
					timeSec: w.lineTimes[0],
					lineTimes: w.lineTimes,
					lineEnds: w.lineEnds,
					wordTimes: w.wordTimes,
					score: w.matched
				});
				break;
			}
		}
		const best = occurrences[0];
		const out = {
			timeSec: best ? best.timeSec : null,
			lineTimes: best ? best.lineTimes : [],
			lineEnds: best ? best.lineEnds : [],
			wordTimes: best ? best.wordTimes : void 0,
			duration: fullDur,
			occurrences: occurrences.map(({ timeSec, lineTimes, lineEnds, wordTimes }) => ({
				timeSec,
				lineTimes,
				lineEnds,
				wordTimes
			})),
			songLineTimes,
			songTimedBlocks: timed
		};
		matchCache.set(cacheKey, out);
		return out;
	} catch {
		return empty(durationHint > 0 ? durationHint : null);
	}
}
var LEAD_IN_SEC = .3;
var SIM_MAX_SEC = 30;
function buildTrackAudioUrl(title, artist, durationSec, fallbackPreviewUrl) {
	const cleanT = title.trim();
	const cleanA = artist.trim();
	if (!cleanT) return fallbackPreviewUrl || null;
	if (cleanT.toLowerCase() === "neon hour" && cleanA.toLowerCase() === "night market" && !fallbackPreviewUrl) return null;
	const params = new URLSearchParams();
	params.set("title", cleanT);
	if (cleanA) params.set("artist", cleanA);
	if (durationSec > 0) params.set("duration", String(Math.round(durationSec)));
	if (fallbackPreviewUrl && /^https?:\/\//i.test(fallbackPreviewUrl)) params.set("fallbackUrl", fallbackPreviewUrl);
	return `/api/audio-proxy?${params.toString()}`;
}
async function seekAndPlayAudio(audio, src, targetTimeSec) {
	if (audio.src !== src) {
		audio.src = src;
		audio.load();
	}
	if (audio.readyState < 1) await new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			cleanup();
			resolve();
		}, 6e3);
		const onLoaded = () => {
			cleanup();
			resolve();
		};
		const onErr = () => {
			cleanup();
			reject(/* @__PURE__ */ new Error("Failed to load audio stream"));
		};
		const cleanup = () => {
			clearTimeout(timer);
			audio.removeEventListener("loadedmetadata", onLoaded);
			audio.removeEventListener("canplay", onLoaded);
			audio.removeEventListener("error", onErr);
		};
		audio.addEventListener("loadedmetadata", onLoaded, { once: true });
		audio.addEventListener("canplay", onLoaded, { once: true });
		audio.addEventListener("error", onErr, { once: true });
	});
	const maxSeek = Number.isFinite(audio.duration) && audio.duration > 1 ? Math.max(0, audio.duration - .5) : targetTimeSec;
	const clampedTarget = Math.max(0, Math.min(targetTimeSec, maxSeek));
	try {
		audio.currentTime = clampedTarget;
	} catch {}
	await audio.play();
	if (Math.abs(audio.currentTime - clampedTarget) > .45) try {
		audio.currentTime = clampedTarget;
	} catch {}
}
function useAudioPreview({ title, artist, lyrics, songDuration = 0, onToast, onEnsureProgressBarVisible }) {
	const [rawPreviewUrl, setRawPreviewUrl] = (0, import_react.useState)(null);
	const [previewUrl, setPreviewUrl] = (0, import_react.useState)(null);
	const [isPlaying, setIsPlaying] = (0, import_react.useState)(false);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const [isSimulated, setIsSimulated] = (0, import_react.useState)(false);
	const [duration, setDuration] = (0, import_react.useState)(songDuration > 0 ? songDuration : 211);
	const [progress, setProgress] = (0, import_react.useState)(.38);
	const [anchorTimeSec, setAnchorTimeSec] = (0, import_react.useState)(Math.round(80.18));
	const [lineTimes, setLineTimes] = (0, import_react.useState)([]);
	const [lineEnds, setLineEnds] = (0, import_react.useState)([]);
	const [wordTimes, setWordTimes] = (0, import_react.useState)(void 0);
	const [occurrences, setOccurrences] = (0, import_react.useState)([]);
	const [songTimedBlocks, setSongTimedBlocks] = (0, import_react.useState)([]);
	const [previewOffset, setPreviewOffset] = (0, import_react.useState)(null);
	const [lyricsInPreview, setLyricsInPreview] = (0, import_react.useState)(false);
	const [syncNudge, setSyncNudge] = (0, import_react.useState)(0);
	const audioRef = (0, import_react.useRef)(null);
	const tickRef = (0, import_react.useRef)(null);
	const lookedUpKeyRef = (0, import_react.useRef)("");
	const analysisRef = (0, import_react.useRef)(null);
	const hasUserScrubbedRef = (0, import_react.useRef)(false);
	const explicitSelectionRef = (0, import_react.useRef)(null);
	const durationRef = (0, import_react.useRef)(duration);
	durationRef.current = duration;
	const anchorRef = (0, import_react.useRef)(anchorTimeSec);
	anchorRef.current = anchorTimeSec;
	const lineTimesRef = (0, import_react.useRef)(lineTimes);
	lineTimesRef.current = lineTimes;
	const lineEndsRef = (0, import_react.useRef)(lineEnds);
	lineEndsRef.current = lineEnds;
	const songTimedBlocksRef = (0, import_react.useRef)(songTimedBlocks);
	songTimedBlocksRef.current = songTimedBlocks;
	const offsetRef = (0, import_react.useRef)(previewOffset);
	offsetRef.current = previewOffset;
	const nudgeRef = (0, import_react.useRef)(syncNudge);
	nudgeRef.current = syncNudge;
	const progressRef = (0, import_react.useRef)(progress);
	progressRef.current = progress;
	const rawPreviewRef = (0, import_react.useRef)(rawPreviewUrl);
	rawPreviewRef.current = rawPreviewUrl;
	/** Single song clock: song time = base + audio.currentTime (audio) or wall-clock (sim) */
	const clockRef = (0, import_react.useRef)({
		mode: "idle",
		base: 0,
		wallStart: 0,
		synced: false
	});
	const playStartProgressRef = (0, import_react.useRef)(.38);
	const pageTimelineCacheRef = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const computeAlignedTimeline = (0, import_react.useCallback)((rawLyrics, anchor, lTimes, lEnds, wTimes, customOffset) => {
		const base = buildKaraokeTimeline(cardLines(rawLyrics), anchor, lTimes, lEnds, wTimes);
		const analysis = analysisRef.current;
		const off = customOffset !== void 0 ? customOffset : offsetRef.current;
		if (!analysis) return base;
		return alignTimelineToAudio(base, analysis, off !== null ? off + nudgeRef.current : analysis.isFullTrack ? nudgeRef.current : (base.starts[0] ?? anchor) - analysis.firstVocalSec);
	}, []);
	const timelineRef = (0, import_react.useRef)(buildKaraokeTimeline(cardLines(lyrics), anchorTimeSec, lineTimes, lineEnds));
	(0, import_react.useEffect)(() => {
		pageTimelineCacheRef.current.clear();
		timelineRef.current = computeAlignedTimeline(lyrics, anchorTimeSec, lineTimes, lineEnds, wordTimes, previewOffset);
	}, [
		lyrics,
		anchorTimeSec,
		lineTimes,
		lineEnds,
		wordTimes,
		previewOffset,
		syncNudge,
		computeAlignedTimeline
	]);
	(0, import_react.useEffect)(() => {
		if (songDuration > 0) setDuration(songDuration);
	}, [songDuration]);
	const getSongTime = (0, import_react.useCallback)(() => {
		const c = clockRef.current;
		if (c.mode === "audio" && audioRef.current) return c.base + audioRef.current.currentTime;
		if (c.mode === "sim") return c.base + (performance.now() - c.wallStart) / 1e3;
		return progressRef.current * durationRef.current;
	}, []);
	const getVocalEnvelope = (0, import_react.useCallback)(() => {
		const a = analysisRef.current;
		if (!a) return null;
		const c = clockRef.current;
		if (c.mode === "audio") return {
			cumulative: a.cumulative,
			rate: a.rate,
			songOffset: c.base
		};
		const off = offsetRef.current ?? (a.isFullTrack ? 0 : null);
		if (off === null) return null;
		return {
			cumulative: a.cumulative,
			rate: a.rate,
			songOffset: off + nudgeRef.current
		};
	}, []);
	const getPreviewAnalysis = (0, import_react.useCallback)(() => analysisRef.current, []);
	const stopTicker = (0, import_react.useCallback)(() => {
		if (tickRef.current) {
			clearInterval(tickRef.current);
			tickRef.current = null;
		}
	}, []);
	const stopAll = (0, import_react.useCallback)(() => {
		stopTicker();
		audioRef.current?.pause();
		clockRef.current = {
			mode: "idle",
			base: 0,
			wallStart: 0,
			synced: false
		};
		setIsPlaying(false);
		setIsSimulated(false);
	}, [stopTicker]);
	const resetToAnchor = (0, import_react.useCallback)(() => {
		hasUserScrubbedRef.current = false;
		const frac = Math.min(1, Math.max(0, anchorRef.current / Math.max(1, durationRef.current)));
		setProgress(frac);
	}, []);
	(0, import_react.useEffect)(() => {
		const cleanT = title.trim();
		const cleanA = artist.trim();
		if (!cleanT || !cleanA) return;
		let alive = true;
		const timer = setTimeout(async () => {
			const key = `${cleanT}|${cleanA}`.toLowerCase();
			let knownDur = songDuration > 0 ? songDuration : 0;
			let itunesPreview = rawPreviewRef.current;
			if (lookedUpKeyRef.current !== key) {
				lookedUpKeyRef.current = key;
				const found = await findTrackPreview(cleanT, cleanA);
				if (!alive) return;
				itunesPreview = found.previewUrl;
				setRawPreviewUrl(found.previewUrl);
				if (found.duration > 0) {
					knownDur = found.duration;
					setDuration(found.duration);
				}
			}
			const matched = await matchLyricTimestamp(cleanA, cleanT, lyrics, knownDur);
			if (!alive) return;
			const resolvedDur = matched.duration && matched.duration > 0 ? matched.duration : knownDur > 0 ? knownDur : durationRef.current;
			if (resolvedDur > 0) setDuration(resolvedDur);
			const fullAudioUrl = buildTrackAudioUrl(cleanT, cleanA, resolvedDur, itunesPreview);
			setPreviewUrl((prev) => prev === fullAudioUrl ? prev : fullAudioUrl);
			setOccurrences(matched.occurrences);
			setSongTimedBlocks(matched.songTimedBlocks);
			const explicit = explicitSelectionRef.current;
			if (explicit && explicit.lyrics.trim() === lyrics.trim() && explicit.lineTimes.length > 0) {
				setLineTimes(explicit.lineTimes);
				setLineEnds(explicit.lineEnds);
				setAnchorTimeSec(explicit.anchor);
				if (clockRef.current.mode === "idle") setProgress(explicit.anchor / Math.max(1, resolvedDur));
				return;
			}
			setLineTimes(matched.lineTimes);
			setLineEnds(matched.lineEnds);
			setWordTimes(matched.wordTimes);
			if (typeof matched.timeSec === "number" && resolvedDur > 0) {
				const clamped = Math.min(Math.max(0, matched.timeSec), Math.max(1, resolvedDur - 1));
				setAnchorTimeSec(clamped);
				hasUserScrubbedRef.current = false;
				if (clockRef.current.mode === "idle") setProgress(clamped / resolvedDur);
			}
		}, 150);
		return () => {
			alive = false;
			clearTimeout(timer);
		};
	}, [
		title,
		artist,
		lyrics,
		songDuration
	]);
	(0, import_react.useEffect)(() => {
		if (!previewUrl) {
			setPreviewOffset(null);
			return;
		}
		let alive = true;
		(async () => {
			try {
				const analysis = await analyzePreview(previewUrl);
				if (!alive || !analysis) return;
				analysisRef.current = analysis;
				if (songTimedBlocks.length < 2) {
					setPreviewOffset(analysis.isFullTrack ? 0 : null);
					return;
				}
				const al = estimatePreviewOffset(analysis, songTimedBlocks, durationRef.current, `${previewUrl}|${songTimedBlocks.length}|${songTimedBlocks[0]?.timeSec}`);
				if (alive) setPreviewOffset(al ? al.offset : analysis.isFullTrack ? 0 : null);
			} catch {
				if (alive) setPreviewOffset(null);
			}
		})();
		return () => {
			alive = false;
		};
	}, [previewUrl, songTimedBlocks]);
	(0, import_react.useEffect)(() => {
		const analysis = analysisRef.current;
		const clip = analysis?.duration ?? 30;
		if (previewOffset === null) {
			setLyricsInPreview(false);
			return;
		}
		if (analysis?.isFullTrack) {
			setLyricsInPreview(true);
			return;
		}
		if (!occurrences.length) {
			setLyricsInPreview(false);
			return;
		}
		const lo = previewOffset + syncNudge;
		const hi = lo + clip;
		if (anchorRef.current >= lo - .85 && anchorRef.current <= hi - 1.2) {
			setLyricsInPreview(true);
			return;
		}
		let bestOcc = null;
		let bestInCount = 0;
		for (const occ of occurrences) {
			let inCount = 0;
			for (const lt of occ.lineTimes) if (lt >= lo - .85 && lt <= hi - 1.2) inCount++;
			if (inCount > bestInCount) {
				bestInCount = inCount;
				bestOcc = occ;
			}
		}
		if (bestOcc && bestInCount > 0) {
			setLyricsInPreview(true);
			setLineTimes(bestOcc.lineTimes);
			setLineEnds(bestOcc.lineEnds);
			setWordTimes(bestOcc.wordTimes);
			setAnchorTimeSec(bestOcc.timeSec);
			if (clockRef.current.mode === "idle") setProgress(Math.min(1, Math.max(0, bestOcc.timeSec / Math.max(1, durationRef.current))));
		} else setLyricsInPreview(false);
	}, [
		previewOffset,
		occurrences,
		syncNudge
	]);
	const getAudio = (0, import_react.useCallback)(() => {
		if (typeof window === "undefined") return null;
		if (!audioRef.current) {
			const a = new Audio();
			a.preload = "auto";
			a.crossOrigin = "anonymous";
			a.addEventListener("ended", () => {
				stopTicker();
				clockRef.current = {
					mode: "idle",
					base: 0,
					wallStart: 0,
					synced: false
				};
				setIsPlaying(false);
				resetToAnchor();
			});
			audioRef.current = a;
		}
		return audioRef.current;
	}, [resetToAnchor, stopTicker]);
	(0, import_react.useEffect)(() => {
		return () => {
			stopTicker();
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = "";
				audioRef.current = null;
			}
		};
	}, [stopTicker]);
	/** UI progress at 15 Hz — the 3D card itself reads the live audio clock at 60 fps */
	const startTicker = (0, import_react.useCallback)(() => {
		stopTicker();
		tickRef.current = setInterval(() => {
			const c = clockRef.current;
			if (c.mode === "idle") return;
			const t = getSongTime();
			const dur = Math.max(1, durationRef.current);
			if (c.mode === "sim" && (performance.now() - c.wallStart) / 1e3 > SIM_MAX_SEC) {
				stopTicker();
				clockRef.current = {
					mode: "idle",
					base: 0,
					wallStart: 0,
					synced: false
				};
				setIsPlaying(false);
				setIsSimulated(false);
				resetToAnchor();
				return;
			}
			setProgress(Math.min(1, Math.max(0, t / dur)));
		}, 66);
	}, [
		getSongTime,
		resetToAnchor,
		stopTicker
	]);
	const setTrackPreview = (0, import_react.useCallback)((nextUrl, durationSec = 0) => {
		stopAll();
		hasUserScrubbedRef.current = false;
		setRawPreviewUrl(nextUrl);
		rawPreviewRef.current = nextUrl;
		const fullDur = durationSec > 0 ? durationSec : 211;
		const nextFullUrl = buildTrackAudioUrl(title, artist, fullDur, nextUrl);
		setPreviewUrl(nextFullUrl);
		analysisRef.current = null;
		explicitSelectionRef.current = null;
		pageTimelineCacheRef.current.clear();
		setPreviewOffset(null);
		setSyncNudge(0);
		lookedUpKeyRef.current = nextUrl ? `${title.trim()}|${artist.trim()}`.toLowerCase() : "";
		setDuration(fullDur);
		setAnchorTimeSec(Math.round(fullDur * .38));
		setLineTimes([]);
		setLineEnds([]);
		setWordTimes(void 0);
		setOccurrences([]);
		setSongTimedBlocks([]);
		setProgress(.38);
		if (audioRef.current) audioRef.current.src = "";
	}, [
		stopAll,
		title,
		artist
	]);
	const syncToLyricTimestamp = (0, import_react.useCallback)((lyricTimeSec, fullDurationSec, explicitLineTimes, explicitLineEnds) => {
		hasUserScrubbedRef.current = false;
		const resolvedDur = fullDurationSec && fullDurationSec > 0 ? fullDurationSec : durationRef.current;
		if (fullDurationSec && fullDurationSec > 0) {
			durationRef.current = fullDurationSec;
			setDuration(fullDurationSec);
		}
		if (typeof lyricTimeSec === "number" && resolvedDur > 0) {
			const clamped = Math.min(Math.max(0, lyricTimeSec), Math.max(1, resolvedDur - 1));
			anchorRef.current = clamped;
			setAnchorTimeSec(clamped);
			if (explicitLineTimes && explicitLineTimes.length > 0) {
				explicitSelectionRef.current = {
					lyrics,
					anchor: clamped,
					lineTimes: explicitLineTimes,
					lineEnds: explicitLineEnds ?? []
				};
				lineTimesRef.current = explicitLineTimes;
				lineEndsRef.current = explicitLineEnds ?? [];
				setLineTimes(explicitLineTimes);
				setLineEnds(explicitLineEnds ?? []);
			} else explicitSelectionRef.current = null;
			const nextFrac = clamped / Math.max(1, resolvedDur);
			playStartProgressRef.current = nextFrac;
			setProgress(nextFrac);
			const c = clockRef.current;
			if (c.mode === "audio" && audioRef.current) {
				const clipTarget = Math.max(0, clamped - LEAD_IN_SEC - c.base);
				const maxDur = audioRef.current.duration || analysisRef.current?.duration || resolvedDur;
				if (clipTarget >= 0 && clipTarget < maxDur) try {
					audioRef.current.currentTime = clipTarget;
				} catch {}
			} else if (c.mode === "sim") {
				c.base = Math.max(0, clamped - LEAD_IN_SEC);
				c.wallStart = performance.now();
			}
		}
	}, [lyrics]);
	const startSimulated = (0, import_react.useCallback)((startSong, msg) => {
		clockRef.current = {
			mode: "sim",
			base: startSong,
			wallStart: performance.now(),
			synced: false
		};
		setIsSimulated(true);
		setIsPlaying(true);
		onEnsureProgressBarVisible?.();
		if (msg) onToast?.(msg);
		startTicker();
	}, [
		onEnsureProgressBarVisible,
		onToast,
		startTicker
	]);
	const togglePlay = (0, import_react.useCallback)(async () => {
		if (clockRef.current.mode !== "idle") {
			const t = getSongTime();
			stopAll();
			setProgress(Math.min(1, Math.max(0, t / Math.max(1, durationRef.current))));
			return;
		}
		onEnsureProgressBarVisible?.();
		let activeUrl = previewUrl;
		const currentKey = `${title.trim()}|${artist.trim()}`.toLowerCase();
		if (!activeUrl && title.trim()) {
			setIsLoading(true);
			lookedUpKeyRef.current = currentKey;
			const found = await findTrackPreview(title, artist);
			if (found.previewUrl) {
				rawPreviewRef.current = found.previewUrl;
				setRawPreviewUrl(found.previewUrl);
			}
			if (found.duration > 0) {
				durationRef.current = found.duration;
				setDuration(found.duration);
			}
			activeUrl = buildTrackAudioUrl(title, artist, durationRef.current, found.previewUrl);
			setPreviewUrl(activeUrl);
			setIsLoading(false);
		}
		let analysis = analysisRef.current;
		let activeBlocks = songTimedBlocksRef.current;
		let activeOffset = offsetRef.current;
		let activeLineTimes = lineTimesRef.current;
		let activeLineEnds = lineEndsRef.current;
		let activeAnchor = anchorRef.current;
		if (activeUrl && (!analysis || activeOffset === null || !activeLineTimes.length)) {
			setIsLoading(true);
			try {
				const [decoded, matched] = await Promise.all([analysis ? Promise.resolve(analysis) : analyzePreview(activeUrl), activeBlocks.length > 0 && activeLineTimes.length > 0 ? Promise.resolve(null) : matchLyricTimestamp(artist.trim(), title.trim(), lyrics, durationRef.current)]);
				if (decoded) {
					analysis = decoded;
					analysisRef.current = decoded;
				}
				if (matched) {
					if (matched.duration && matched.duration > 0) {
						durationRef.current = matched.duration;
						setDuration(matched.duration);
					}
					activeBlocks = matched.songTimedBlocks;
					songTimedBlocksRef.current = matched.songTimedBlocks;
					setSongTimedBlocks(matched.songTimedBlocks);
					setOccurrences(matched.occurrences);
					if (!activeLineTimes.length && matched.lineTimes.length) {
						activeLineTimes = matched.lineTimes;
						activeLineEnds = matched.lineEnds;
						lineTimesRef.current = matched.lineTimes;
						lineEndsRef.current = matched.lineEnds;
						setLineTimes(matched.lineTimes);
						setLineEnds(matched.lineEnds);
					}
					if (typeof matched.timeSec === "number" && !explicitSelectionRef.current) {
						activeAnchor = matched.timeSec;
						anchorRef.current = matched.timeSec;
						setAnchorTimeSec(matched.timeSec);
					}
				}
				if (analysis && activeOffset === null) {
					if (activeBlocks.length >= 2) {
						const al = estimatePreviewOffset(analysis, activeBlocks, durationRef.current, `${activeUrl}|${activeBlocks.length}|${activeBlocks[0]?.timeSec}`);
						activeOffset = al ? al.offset : analysis.isFullTrack ? 0 : null;
					} else if (analysis.isFullTrack) activeOffset = 0;
					offsetRef.current = activeOffset;
					setPreviewOffset(activeOffset);
				}
			} catch {} finally {
				setIsLoading(false);
			}
		}
		const dur = Math.max(1, durationRef.current);
		if (!activeUrl) {
			const firstS = timelineRef.current.starts[0] ?? activeAnchor;
			const startSong = Math.max(0, firstS - LEAD_IN_SEC);
			playStartProgressRef.current = startSong / dur;
			startSimulated(startSong, "No audio stream found for this track — simulating synced word-by-word karaoke.");
			return;
		}
		const audio = getAudio();
		if (!audio) return;
		try {
			setIsSimulated(false);
			const clipLen = analysis?.duration ?? dur;
			const isFull = Boolean(analysis?.isFullTrack || clipLen >= 45);
			const resolvedOffset = activeOffset ?? (isFull ? 0 : null);
			let base = 0;
			let clipStart = 0;
			let synced = true;
			if (resolvedOffset !== null) {
				const b = resolvedOffset + nudgeRef.current;
				timelineRef.current = computeAlignedTimeline(lyrics, activeAnchor, activeLineTimes, activeLineEnds, wordTimes, resolvedOffset);
				const firstLineStart = timelineRef.current.starts[0] ?? activeAnchor;
				const lastLineEnd = timelineRef.current.ends[timelineRef.current.ends.length - 1] ?? firstLineStart + 10;
				if (isFull || firstLineStart >= b - .85 && firstLineStart <= b + clipLen - 1.2) {
					const curSongPos = progressRef.current * dur;
					const targetSong = hasUserScrubbedRef.current && curSongPos >= firstLineStart - .4 && curSongPos < lastLineEnd - .4 ? curSongPos : Math.max(0, firstLineStart - LEAD_IN_SEC);
					base = b;
					clipStart = Math.min(Math.max(0, clipLen - 1), Math.max(0, targetSong - b));
					synced = true;
				} else {
					base = b;
					const firstPreviewBlock = activeBlocks.find((blk) => typeof blk.timeSec === "number" && blk.timeSec >= b - .3 && blk.timeSec <= b + clipLen - 2);
					const targetSong = firstPreviewBlock && typeof firstPreviewBlock.timeSec === "number" ? Math.max(b, firstPreviewBlock.timeSec - LEAD_IN_SEC) : b + Math.max(0, (analysis?.firstVocalSec ?? 0) - LEAD_IN_SEC);
					clipStart = Math.min(Math.max(0, clipLen - 1.5), Math.max(0, targetSong - b));
					synced = true;
				}
			} else {
				const firstLineStart = timelineRef.current.starts[0] ?? activeAnchor;
				if (isFull) {
					base = 0;
					clipStart = Math.max(0, Math.min(clipLen - 1, firstLineStart - LEAD_IN_SEC));
				} else {
					const firstVocal = analysis?.firstVocalSec ?? 0;
					clipStart = Math.max(0, firstVocal - LEAD_IN_SEC);
					base = firstLineStart - firstVocal;
				}
				timelineRef.current = computeAlignedTimeline(lyrics, activeAnchor, activeLineTimes, activeLineEnds, wordTimes, base - nudgeRef.current);
				synced = true;
			}
			const actualStartSong = base + clipStart;
			playStartProgressRef.current = Math.min(1, Math.max(0, actualStartSong / dur));
			setProgress(playStartProgressRef.current);
			const playSrc = analysis?.blobUrl || activeUrl;
			clockRef.current = {
				mode: "audio",
				base,
				wallStart: performance.now(),
				synced
			};
			await seekAndPlayAudio(audio, playSrc, clipStart);
			setIsPlaying(true);
			startTicker();
		} catch (err) {
			clockRef.current = {
				mode: "idle",
				base: 0,
				wallStart: 0,
				synced: false
			};
			const firstS = timelineRef.current.starts[0] ?? activeAnchor;
			const startSong = Math.max(0, firstS - LEAD_IN_SEC);
			if (err instanceof DOMException && err.name === "NotAllowedError") onToast?.("Tap Play again to allow audio playback on your device.", true);
			else startSimulated(startSong, "Audio stream blocked or unavailable — simulating synced word-by-word karaoke.");
		}
	}, [
		artist,
		computeAlignedTimeline,
		getAudio,
		getSongTime,
		lyrics,
		onEnsureProgressBarVisible,
		onToast,
		previewUrl,
		startSimulated,
		startTicker,
		stopAll,
		title,
		wordTimes
	]);
	const seek = (0, import_react.useCallback)((nextProgress) => {
		hasUserScrubbedRef.current = true;
		const clamped = Math.min(1, Math.max(0, nextProgress));
		const dur = Math.max(1, durationRef.current);
		const targetSec = clamped * dur;
		setProgress(clamped);
		onEnsureProgressBarVisible?.();
		const c = clockRef.current;
		if (c.mode === "audio" && audioRef.current) {
			const clipT = targetSec - c.base;
			const clipLen = audioRef.current.duration || analysisRef.current?.duration || dur;
			if (clipT >= 0 && clipT < clipLen) audioRef.current.currentTime = clipT;
			else c.base = targetSec - audioRef.current.currentTime;
		} else if (c.mode === "sim") {
			c.base = targetSec;
			c.wallStart = performance.now();
		}
	}, [onEnsureProgressBarVisible]);
	/**
	* Resolves the 60fps word-by-word karaoke frame locked to the live audio clock.
	* When the song plays through the card's lines (e.g. at 2:25), highlights those exact words;
	* when the song continues playing past the card's 4th line, dynamically tracks the current
	* 4-line stanza from `songTimedBlocks` so the lyrics on the card are ALWAYS 100% synced.
	*/
	const getLivePlayback = (0, import_react.useCallback)(() => {
		if (clockRef.current.mode === "idle") return null;
		const t = getSongTime();
		const dur = Math.max(1, durationRef.current);
		const vocalEnv = getVocalEnvelope();
		const staticTl = timelineRef.current;
		const staticFirst = staticTl.starts[0] ?? 0;
		const staticLast = staticTl.ends[staticTl.ends.length - 1] ?? staticFirst + 8;
		const blocks = songTimedBlocksRef.current;
		if (!(t >= staticFirst - .9 && t <= staticLast + .45) && blocks.length >= 2) {
			let activeIdx = -1;
			for (let i = 0; i < blocks.length; i++) {
				const bt = blocks[i].timeSec;
				if (typeof bt === "number" && t + .1 >= bt) activeIdx = i;
			}
			if (activeIdx >= 0) {
				const effOff = (offsetRef.current ?? 0) + nudgeRef.current;
				let cardEndBlockIdx = -1;
				for (let i = 0; i < blocks.length; i++) {
					const bt = blocks[i].timeSec;
					if (typeof bt === "number" && Math.abs(bt - staticFirst) <= .6) {
						cardEndBlockIdx = i + staticTl.lines.length;
						break;
					}
				}
				const anchorIdx = cardEndBlockIdx >= 0 ? cardEndBlockIdx : 0;
				const rel = activeIdx - anchorIdx;
				const pageStart = Math.max(0, rel >= 0 ? anchorIdx + Math.floor(rel / 4) * 4 : Math.floor(activeIdx / 4) * 4);
				const pageKey = `${pageStart}|${effOff.toFixed(2)}`;
				let pageEntry = pageTimelineCacheRef.current.get(pageKey);
				if (!pageEntry) {
					const slice = blocks.slice(pageStart, pageStart + 4);
					const pageLyrics = slice.map((b) => b.text).join("\n");
					const pStarts = slice.map((b) => b.timeSec);
					const pEnds = slice.map((b, idx) => b.endTimeSec ?? slice[idx + 1]?.timeSec ?? b.timeSec + 3);
					const pWords = slice.map((b) => b.words);
					pageEntry = {
						lyrics: pageLyrics,
						timeline: alignTimelineToAudio(buildKaraokeTimeline(slice.map((b) => b.text), pStarts[0] ?? t, pStarts, pEnds, pWords), analysisRef.current, effOff)
					};
					pageTimelineCacheRef.current.set(pageKey, pageEntry);
				}
				const pageFrame = computeKaraokeFrame(pageEntry.timeline, t, vocalEnv);
				return {
					progress: Math.min(1, Math.max(0, t / dur)),
					currentTime: t,
					duration: dur,
					isPlaying: true,
					activeLyrics: pageEntry.lyrics,
					...pageFrame
				};
			}
		}
		const frame = computeKaraokeFrame(staticTl, t, vocalEnv);
		return {
			progress: Math.min(1, Math.max(0, t / dur)),
			currentTime: t,
			duration: dur,
			isPlaying: true,
			...frame
		};
	}, [getSongTime, getVocalEnvelope]);
	const currentTime = progress * duration;
	const staticProgress = isPlaying ? playStartProgressRef.current : progress;
	const canvasPlayback = (0, import_react.useMemo)(() => ({
		progress: staticProgress,
		currentTime: Math.round(staticProgress * duration),
		duration,
		isPlaying
	}), [
		staticProgress,
		duration,
		isPlaying
	]);
	return (0, import_react.useMemo)(() => ({
		isPlaying,
		isLoading,
		isSimulated,
		hasPreviewUrl: Boolean(previewUrl),
		previewUrl,
		anchorTimeSec,
		lineTimes,
		previewOffset,
		lyricsInPreview,
		syncNudge,
		setSyncNudge,
		progress,
		currentTime,
		duration,
		canvasPlayback,
		getLivePlayback,
		getVocalEnvelope,
		getPreviewAnalysis,
		togglePlay,
		seek,
		setTrackPreview,
		syncToLyricTimestamp
	}), [
		anchorTimeSec,
		canvasPlayback,
		currentTime,
		duration,
		getLivePlayback,
		getPreviewAnalysis,
		getVocalEnvelope,
		isLoading,
		isPlaying,
		isSimulated,
		lineTimes,
		lyricsInPreview,
		previewOffset,
		previewUrl,
		progress,
		seek,
		setTrackPreview,
		syncNudge,
		syncToLyricTimestamp,
		togglePlay
	]);
}
var DEFAULT_STATE = {
	title: "Neon Hour",
	artist: "Night Market",
	lyrics: "City lights on the glass\nYour name in the static\nWe keep the chorus on\nUntil the room goes quiet",
	coverUrl: "",
	color: "#1DB954",
	theme: "classic",
	layoutKey: "square",
	coverShape: "auto",
	lyricFont: "auto",
	align: "left",
	hlLine: -1,
	bgStyle: "none",
	glareStyle: "diagonal",
	glare: 70,
	glareAuto: true,
	cardDepth: 32,
	autoFit: true,
	lyricSize: 48,
	transparent: false,
	scale: 2,
	fmt: "png",
	autoColor: true,
	hide: {
		cover: false,
		title: false,
		artist: false,
		logo: false,
		bar: true,
		code: true
	},
	trackId: null,
	preset: null
};
function toSnapshot(s) {
	return {
		color: s.color,
		theme: s.theme,
		title: s.title,
		artist: s.artist,
		lyrics: s.lyrics,
		layoutKey: s.layoutKey
	};
}
function useCardState() {
	const [state, setStateInternal] = (0, import_react.useState)(DEFAULT_STATE);
	const [songMeta, setSongMeta] = (0, import_react.useState)(null);
	const hydratedRef = (0, import_react.useRef)(false);
	const skipNextHistoryRef = (0, import_react.useRef)(false);
	const historyRef = (0, import_react.useRef)([toSnapshot(DEFAULT_STATE)]);
	const historyIndexRef = (0, import_react.useRef)(0);
	const [canUndo, setCanUndo] = (0, import_react.useState)(false);
	const [canRedo, setCanRedo] = (0, import_react.useState)(false);
	const updateHistoryState = (0, import_react.useCallback)(() => {
		setCanUndo(historyIndexRef.current > 0);
		setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
	}, []);
	const pushHistory = (0, import_react.useCallback)((snapshot) => {
		const history = historyRef.current;
		const curIndex = historyIndexRef.current;
		const cur = history[curIndex];
		if (cur && cur.color === snapshot.color && cur.theme === snapshot.theme && cur.title === snapshot.title && cur.artist === snapshot.artist && cur.lyrics === snapshot.lyrics && cur.layoutKey === snapshot.layoutKey) return;
		historyRef.current = history.slice(0, curIndex + 1);
		historyRef.current.push(snapshot);
		if (historyRef.current.length > 100) historyRef.current.shift();
		historyIndexRef.current = historyRef.current.length - 1;
		updateHistoryState();
	}, [updateHistoryState]);
	const historyDebounceRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const saved = loadSettings();
		let initial = {
			...DEFAULT_STATE,
			...saved,
			hide: {
				...DEFAULT_STATE.hide,
				...saved.hide || {}
			}
		};
		const hash = window.location.hash || "";
		const m = /^#look=([A-Za-z0-9_-]{1,6000})$/.exec(hash);
		if (m) try {
			const o = decodeLookHash(m[1]);
			if (o && typeof o === "object") {
				const nextTheme = o.t || initial.theme;
				const isCoverHidden = o.cs === "hidden";
				initial = {
					...initial,
					theme: nextTheme,
					color: o.c || initial.color,
					glareStyle: o.g === "auto" ? THEME_GLARE[nextTheme] || "diagonal" : o.g || initial.glareStyle,
					glareAuto: o.g === "auto",
					glare: typeof o.gi === "number" ? o.gi : initial.glare,
					layoutKey: o.l || initial.layoutKey,
					coverShape: isCoverHidden ? initial.coverShape : o.cs || initial.coverShape,
					hide: typeof o.cs === "string" ? {
						...initial.hide,
						cover: isCoverHidden
					} : initial.hide,
					lyricFont: o.lf || initial.lyricFont,
					bgStyle: o.bg || initial.bgStyle,
					cardDepth: typeof o.d === "number" ? o.d : initial.cardDepth,
					align: o.a || initial.align,
					autoColor: typeof o.ac === "boolean" ? o.ac : initial.autoColor,
					title: typeof o.ti === "string" ? o.ti : initial.title,
					artist: typeof o.ar === "string" ? o.ar : initial.artist,
					lyrics: typeof o.ly === "string" ? o.ly : initial.lyrics,
					coverUrl: typeof o.cu === "string" ? o.cu : initial.coverUrl
				};
			}
		} catch (e) {
			console.warn("Failed to parse look from hash", e);
		}
		historyRef.current = [toSnapshot(initial)];
		historyIndexRef.current = 0;
		skipNextHistoryRef.current = true;
		hydratedRef.current = true;
		setStateInternal(initial);
		updateHistoryState();
	}, [updateHistoryState]);
	(0, import_react.useEffect)(() => {
		if (!hydratedRef.current) return;
		saveSettings(state);
		if (skipNextHistoryRef.current) {
			skipNextHistoryRef.current = false;
			return;
		}
		if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
		const snap = toSnapshot(state);
		historyDebounceRef.current = setTimeout(() => {
			pushHistory(snap);
		}, 400);
		return () => {
			if (historyDebounceRef.current) {
				clearTimeout(historyDebounceRef.current);
				historyDebounceRef.current = null;
			}
		};
	}, [state, pushHistory]);
	const setState = (0, import_react.useCallback)((updater) => {
		setStateInternal((prev) => typeof updater === "function" ? updater(prev) : {
			...prev,
			...updater
		});
	}, []);
	const undo = (0, import_react.useCallback)(() => {
		if (historyIndexRef.current <= 0) return;
		if (historyDebounceRef.current) {
			clearTimeout(historyDebounceRef.current);
			historyDebounceRef.current = null;
		}
		historyIndexRef.current -= 1;
		const s = historyRef.current[historyIndexRef.current];
		skipNextHistoryRef.current = true;
		setStateInternal((prev) => ({
			...prev,
			color: s.color,
			theme: s.theme,
			title: s.title,
			artist: s.artist,
			lyrics: s.lyrics,
			layoutKey: s.layoutKey
		}));
		updateHistoryState();
	}, [updateHistoryState]);
	const redo = (0, import_react.useCallback)(() => {
		if (historyIndexRef.current >= historyRef.current.length - 1) return;
		if (historyDebounceRef.current) {
			clearTimeout(historyDebounceRef.current);
			historyDebounceRef.current = null;
		}
		historyIndexRef.current += 1;
		const s = historyRef.current[historyIndexRef.current];
		skipNextHistoryRef.current = true;
		setStateInternal((prev) => ({
			...prev,
			color: s.color,
			theme: s.theme,
			title: s.title,
			artist: s.artist,
			lyrics: s.lyrics,
			layoutKey: s.layoutKey
		}));
		updateHistoryState();
	}, [updateHistoryState]);
	return {
		state,
		setState,
		setTheme: (0, import_react.useCallback)((theme) => {
			setState((prev) => ({
				...prev,
				theme,
				glareStyle: prev.glareAuto ? THEME_GLARE[theme] || "diagonal" : prev.glareStyle
			}));
		}, [setState]),
		setLayoutKey: (0, import_react.useCallback)((layoutKey) => {
			setState((prev) => ({
				...prev,
				layoutKey,
				preset: null
			}));
		}, [setState]),
		songMeta,
		setSongMeta,
		undo,
		redo,
		canUndo,
		canRedo
	};
}
var TILT_FALLBACK = {
	rx: 12,
	ry: -15,
	rz: 2,
	perspective: 1200
};
function num(value, fallback) {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : fallback;
}
/** Always returns a tilt. Never reads a field off null. */
function asTilt(tilt) {
	if (tilt == null) return { ...TILT_FALLBACK };
	return {
		rx: num(tilt.rx, TILT_FALLBACK.rx),
		ry: num(tilt.ry, TILT_FALLBACK.ry),
		rz: num(tilt.rz, TILT_FALLBACK.rz),
		perspective: num(tilt.perspective, TILT_FALLBACK.perspective)
	};
}
var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
function useTiltInteraction() {
	const [tilt, setTilt] = (0, import_react.useState)(() => asTilt(TILT_DEFAULT));
	const [isDragging, setIsDragging] = (0, import_react.useState)(false);
	const tiltRef = (0, import_react.useRef)(asTilt(TILT_DEFAULT));
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const pinchStart = (0, import_react.useRef)(null);
	const drag = (0, import_react.useRef)({
		active: false,
		pointerId: -1,
		x: 0,
		y: 0,
		rx: TILT_DEFAULT.rx,
		ry: TILT_DEFAULT.ry,
		rz: TILT_DEFAULT.rz
	});
	const commit = (0, import_react.useCallback)((next) => {
		const safe = asTilt(next);
		tiltRef.current = safe;
		setTilt(safe);
	}, []);
	const resetTilt = (0, import_react.useCallback)(() => {
		drag.current.active = false;
		pointers.current.clear();
		pinchStart.current = null;
		commit(asTilt(TILT_DEFAULT));
		setIsDragging(false);
	}, [commit]);
	const handlePointerDown = (0, import_react.useCallback)((e) => {
		pointers.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		e.currentTarget.setPointerCapture?.(e.pointerId);
		if (pointers.current.size === 2) {
			const [p1, p2] = [...pointers.current.values()];
			pinchStart.current = {
				dist: Math.hypot(p2.x - p1.x, p2.y - p1.y),
				perspective: asTilt(tiltRef.current).perspective
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
	const handlePointerMove = (0, import_react.useCallback)((e) => {
		if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, {
			x: e.clientX,
			y: e.clientY
		});
		if (pointers.current.size === 2 && pinchStart.current) {
			const [p1, p2] = [...pointers.current.values()];
			const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
			const delta = pinchStart.current.dist - dist;
			const prev = asTilt(tiltRef.current);
			commit({
				...prev,
				perspective: clamp(Math.round(pinchStart.current.perspective + delta * 5), 400, 3e3)
			});
			return;
		}
		const d = drag.current;
		if (!d.active || d.pointerId !== e.pointerId) return;
		const dx = e.clientX - d.x;
		const dy = e.clientY - d.y;
		const prev = asTilt(tiltRef.current);
		if (e.shiftKey) commit({
			...prev,
			rz: clamp(Math.round(d.rz + dx * .3), -180, 180)
		});
		else commit({
			...prev,
			ry: clamp(Math.round(d.ry + dx * .3), -75, 75),
			rx: clamp(Math.round(d.rx - dy * .3), -75, 75)
		});
	}, [commit]);
	const handlePointerUp = (0, import_react.useCallback)((e) => {
		if (e) pointers.current.delete(e.pointerId);
		else pointers.current.clear();
		if (pointers.current.size < 2) pinchStart.current = null;
		if (pointers.current.size === 0) {
			drag.current.active = false;
			setIsDragging(false);
		}
	}, []);
	const applyWheelDelta = (0, import_react.useCallback)((deltaY) => {
		const prev = asTilt(tiltRef.current);
		commit({
			...prev,
			perspective: clamp(Math.round(prev.perspective + deltaY * 2), 400, 3e3)
		});
	}, [commit]);
	return {
		tilt: asTilt(tilt),
		setTilt: commit,
		resetTilt,
		isDragging,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
		applyWheelDelta
	};
}
var ExportModal = (0, import_react.lazy)(() => import("./ExportModal-Cm0xJiQA.mjs").then((m) => ({ default: m.ExportModal })));
var KeyboardHelpModal = (0, import_react.lazy)(() => import("./KeyboardHelpModal-DYgCpgJL.mjs").then((m) => ({ default: m.KeyboardHelpModal })));
var LyricsModal = (0, import_react.lazy)(() => import("./LyricsModal-Cpxa6FIf.mjs").then((m) => ({ default: m.LyricsModal })));
function App() {
	const { state, setState, setTheme, setLayoutKey, songMeta, setSongMeta, undo, redo, canUndo, canRedo } = useCardState();
	const { tilt, resetTilt, isDragging, handlePointerDown, handlePointerMove, handlePointerUp, applyWheelDelta } = useTiltInteraction();
	const [activeTab, setActiveTab] = (0, import_react.useState)("style");
	const [coverImg, setCoverImg] = (0, import_react.useState)(null);
	const [coverPalette, setCoverPalette] = (0, import_react.useState)([]);
	const [renderedLyricSize, setRenderedLyricSize] = (0, import_react.useState)(state.lyricSize);
	const [hasTextOverflow, setHasTextOverflow] = (0, import_react.useState)(false);
	const [fontEpoch, setFontEpoch] = (0, import_react.useState)(0);
	const [lyricsModalOpen, setLyricsModalOpen] = (0, import_react.useState)(false);
	const [exportModalOpen, setExportModalOpen] = (0, import_react.useState)(false);
	const [keyboardHelpOpen, setKeyboardHelpOpen] = (0, import_react.useState)(false);
	const [toastMessage, setToastMessage] = (0, import_react.useState)(null);
	const [toastIsError, setToastIsError] = (0, import_react.useState)(false);
	const toastTimerRef = (0, import_react.useRef)(null);
	const showToast = (0, import_react.useCallback)((msg, isError = false) => {
		setToastMessage(msg);
		setToastIsError(isError);
		if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		toastTimerRef.current = setTimeout(() => setToastMessage(null), 2200);
	}, []);
	const ensureProgressBarVisible = (0, import_react.useCallback)(() => {
		setState((prev) => prev.hide.bar ? {
			...prev,
			hide: {
				...prev.hide,
				bar: false
			}
		} : prev);
	}, [setState]);
	const toggleBarOnCard = (0, import_react.useCallback)(() => {
		setState((prev) => ({
			...prev,
			hide: {
				...prev.hide,
				bar: !prev.hide.bar
			}
		}));
	}, [setState]);
	const player = useAudioPreview({
		title: state.title,
		artist: state.artist,
		lyrics: state.lyrics,
		songDuration: songMeta?.duration,
		onToast: showToast,
		onEnsureProgressBarVisible: ensureProgressBarVisible
	});
	(0, import_react.useEffect)(() => {
		return () => {
			if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const uniqueFaces = /* @__PURE__ */ new Set([
			"400 16px \"Poppins\"",
			"600 24px \"Poppins\"",
			"700 32px \"Poppins\""
		]);
		for (const font of Object.values(LYRIC_FONTS)) if ("load" in font && font.load) uniqueFaces.add(`${font.weight} 32px "${font.load}"`);
		let alive = true;
		const bumpFonts = () => {
			if (!alive) return;
			incrementFontGen();
			setFontEpoch((n) => n + 1);
		};
		const fontsApi = document.fonts;
		if (fontsApi) {
			Promise.all([...uniqueFaces].map((f) => fontsApi.load(f).catch(() => void 0))).then(bumpFonts);
			fontsApi.ready.then(bumpFonts);
			fontsApi.addEventListener?.("loadingdone", bumpFonts);
		}
		return () => {
			alive = false;
			fontsApi?.removeEventListener?.("loadingdone", bumpFonts);
		};
	}, []);
	const autoColorRef = (0, import_react.useRef)(state.autoColor);
	autoColorRef.current = state.autoColor;
	(0, import_react.useEffect)(() => {
		const rawUrl = state.coverUrl.trim();
		if (!rawUrl) {
			setCoverImg(null);
			setCoverPalette([]);
			return;
		}
		let alive = true;
		const applyLoadedImage = (img) => {
			if (!alive) return;
			setCoverImg(img);
			try {
				const pal = extractCoverColors(img);
				setCoverPalette(pal);
				if (autoColorRef.current && pal.length > 0) setState({ color: pal[0] });
			} catch {
				setCoverPalette([]);
			}
		};
		const loadImage = (src, canRetryViaProxy) => {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.referrerPolicy = "no-referrer";
			img.onload = () => applyLoadedImage(img);
			img.onerror = () => {
				if (!alive) return;
				if (canRetryViaProxy && /^https?:\/\//i.test(rawUrl)) {
					loadImage(`/api/cover-proxy?url=${encodeURIComponent(rawUrl)}`, false);
					return;
				}
				setCoverImg(null);
				setCoverPalette([]);
				showToast("Cover art could not load.", true);
			};
			img.src = src;
		};
		loadImage(rawUrl, true);
		return () => {
			alive = false;
		};
	}, [
		state.coverUrl,
		setState,
		showToast
	]);
	(0, import_react.useEffect)(() => {
		if (state.autoColor && coverPalette.length > 0) setState({ color: coverPalette[0] });
	}, [
		state.autoColor,
		coverPalette,
		setState
	]);
	const handleMatchCoverColor = (0, import_react.useCallback)(() => {
		if (coverPalette.length > 0) setState({
			color: coverPalette[0],
			autoColor: false
		});
		else showToast("No cover yet.", true);
	}, [
		coverPalette,
		setState,
		showToast
	]);
	const handleSelectSong = (0, import_react.useCallback)((song) => {
		setState({
			title: song.title,
			artist: song.artist,
			coverUrl: song.cover,
			trackId: null
		});
		setSongMeta({
			title: song.title,
			artist: song.artist,
			duration: song.duration
		});
		player.setTrackPreview(song.previewUrl ?? null, song.duration);
		setActiveTab("text");
		setLyricsModalOpen(true);
	}, [
		setState,
		setSongMeta,
		player
	]);
	const handleSpotifyTrack = (0, import_react.useCallback)((coverUrl, trackId, title) => {
		setState((prev) => ({
			...prev,
			coverUrl,
			trackId,
			...title ? { title } : {}
		}));
	}, [setState]);
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			const activeEl = document.activeElement;
			if (activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA" || activeEl?.tagName === "SELECT" || activeEl?.hasAttribute("contenteditable")) return;
			if (lyricsModalOpen || exportModalOpen || keyboardHelpOpen) return;
			if (e.ctrlKey || e.metaKey) {
				const key = e.key.toLowerCase();
				if (key === "z") {
					e.preventDefault();
					if (e.shiftKey) redo();
					else undo();
					return;
				}
				if (key === "y") {
					e.preventDefault();
					redo();
					return;
				}
			}
			if (e.key === " ") {
				e.preventDefault();
				player.togglePlay();
			} else if (e.key === "?") {
				e.preventDefault();
				setKeyboardHelpOpen((prev) => !prev);
			} else if (e.key.toLowerCase() === "e") {
				e.preventDefault();
				setExportModalOpen(true);
			} else if ([
				"1",
				"2",
				"3",
				"4",
				"5"
			].includes(e.key)) {
				e.preventDefault();
				setLayoutKey([
					"square",
					"wide",
					"story",
					"portrait",
					"tall"
				][parseInt(e.key, 10) - 1]);
			} else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
				const themes = Object.keys(THEMES);
				const nextTheme = themes[(themes.indexOf(state.theme) + (e.key === "ArrowRight" ? 1 : -1) + themes.length) % themes.length];
				setTheme(nextTheme);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		lyricsModalOpen,
		exportModalOpen,
		keyboardHelpOpen,
		redo,
		undo,
		setLayoutKey,
		setTheme,
		state.theme,
		player
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh w-full flex-col overflow-hidden bg-[#121212] text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 lg:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
					canUndo,
					canRedo,
					isPlaying: player.isPlaying,
					onUndo: undo,
					onRedo: redo,
					onTogglePlay: () => void player.togglePlay(),
					onOpenHelp: () => setKeyboardHelpOpen(true),
					onToast: showToast
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col lg:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "order-2 flex min-h-0 flex-1 flex-col border-t border-[#282828] bg-[#181818] lg:order-1 lg:w-[400px] lg:flex-none lg:border-t-0 lg:border-r xl:w-[424px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden shrink-0 lg:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
								canUndo,
								canRedo,
								isPlaying: player.isPlaying,
								onUndo: undo,
								onRedo: redo,
								onTogglePlay: () => void player.togglePlay(),
								onOpenHelp: () => setKeyboardHelpOpen(true),
								onToast: showToast
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabNav, {
							activeTab,
							onTabChange: setActiveTab
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-5",
							children: [
								activeTab === "search" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchSection, {
									onSelectSong: handleSelectSong,
									onSpotifyTrack: handleSpotifyTrack,
									onToast: showToast
								}),
								activeTab === "text" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextSection, {
									state,
									onChange: setState,
									onOpenLyricsModal: () => setLyricsModalOpen(true)
								}),
								activeTab === "style" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StyleSection, {
									state,
									onChange: setState,
									onSetTheme: setTheme,
									onSetLayout: setLayoutKey,
									coverPalette,
									onMatchCoverColor: handleMatchCoverColor,
									renderedLyricSize,
									hasTextOverflow
								}),
								activeTab === "layout" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutSection, {
									state,
									onChange: setState,
									onToast: showToast
								}),
								activeTab === "looks" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LooksSection, {
									state,
									onApplyLook: (look) => {
										setState((prev) => {
											const nextTheme = look.t || prev.theme;
											const isGlareAuto = look.g === "auto";
											const isCoverHidden = look.cs === "hidden";
											return {
												...prev,
												theme: nextTheme,
												color: look.c || prev.color,
												glareAuto: isGlareAuto,
												glareStyle: isGlareAuto ? THEME_GLARE[nextTheme] || "diagonal" : look.g || prev.glareStyle,
												glare: typeof look.gi === "number" ? look.gi : prev.glare,
												layoutKey: look.l || prev.layoutKey,
												coverShape: isCoverHidden ? prev.coverShape : look.cs || prev.coverShape,
												hide: typeof look.cs === "string" ? {
													...prev.hide,
													cover: isCoverHidden
												} : prev.hide,
												lyricFont: look.lf || prev.lyricFont,
												bgStyle: look.bg || prev.bgStyle,
												cardDepth: typeof look.d === "number" ? look.d : prev.cardDepth,
												align: look.a || prev.align,
												autoColor: typeof look.ac === "boolean" ? look.ac : prev.autoColor
											};
										});
									},
									onToast: showToast
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
							className: "shrink-0 border-t border-[#282828] bg-[#141414]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setExportModalOpen(true),
								className: "flex w-full items-center justify-center gap-2 rounded-full bg-[#1db954] py-3 text-sm font-bold text-black active:scale-[0.98]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), "Export card"]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "order-1 h-[34svh] min-h-[210px] max-h-[380px] shrink-0 lg:order-2 lg:h-auto lg:max-h-none lg:min-h-0 lg:flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {
						state,
						coverImg,
						tilt,
						isDragging,
						fontEpoch,
						player,
						onToggleBarOnCard: toggleBarOnCard,
						onPointerDown: handlePointerDown,
						onPointerMove: handlePointerMove,
						onPointerUp: handlePointerUp,
						onWheelDelta: applyWheelDelta,
						onResetTilt: resetTilt,
						onCardRenderedSize: (size, overflow) => {
							setRenderedLyricSize(size);
							setHasTextOverflow(overflow);
						}
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Suspense, {
				fallback: null,
				children: [
					lyricsModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LyricsModal, {
						isOpen: lyricsModalOpen,
						onClose: () => setLyricsModalOpen(false),
						artist: state.artist,
						title: state.title,
						duration: songMeta?.duration,
						previewOffset: player.previewOffset,
						isFullTrack: Boolean(player.getPreviewAnalysis()?.isFullTrack),
						cardColor: state.color,
						onApplyLyrics: (lyrics, lyricTimeSec, fetchedDur, selectedLineTimes, selectedLineEnds) => {
							setState({ lyrics });
							if (fetchedDur && fetchedDur > 0 && !songMeta?.duration) setSongMeta({
								title: state.title,
								artist: state.artist,
								duration: fetchedDur
							});
							player.syncToLyricTimestamp(lyricTimeSec, fetchedDur || songMeta?.duration, selectedLineTimes, selectedLineEnds);
						},
						onToast: showToast
					}),
					exportModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExportModal, {
						isOpen: exportModalOpen,
						onClose: () => setExportModalOpen(false),
						state,
						coverImg,
						tilt,
						playback: player.canvasPlayback,
						player,
						onUpdateState: setState,
						onToast: showToast
					}),
					keyboardHelpOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyboardHelpModal, {
						isOpen: keyboardHelpOpen,
						onClose: () => setKeyboardHelpOpen(false)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toast, {
				message: toastMessage,
				isError: toastIsError
			})
		]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => SplitComponent });
var AppBoundary = class extends import_react.Component {
	state = { error: null };
	static getDerivedStateFromError(error) {
		return { error };
	}
	render() {
		if (this.state.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "flex min-h-screen flex-col items-center justify-center gap-3 bg-[#121212] px-6 text-center text-white",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-[#b3b3b3]",
				children: this.state.error.message
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "rounded-full bg-[#1db954] px-4 py-2 text-sm font-bold text-black",
				onClick: () => this.setState({ error: null }),
				children: "Try again"
			})]
		});
		return this.props.children;
	}
};
var SplitComponent = function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppBoundary, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}) });
};
//#endregion
export { themeRadius as C, mixHex as E, cardGeom as S, hexToRgb as T, LAYOUTS as _, analyzePreview as a, presetById as b, buildKaraokeTimeline as c, renderCard as d, getPalette as f, FORMATS as g, EXPORT_PRESETS as h, alignTimelineToAudio as i, cardLines as l, CANON as m, asTilt as n, estimatePreviewOffset as o, paintGlare as p, fetchLyrics as r, vocalEnvelopeFor as s, routes_exports as t, computeKaraokeFrame as u, LYRIC_FONTS as v, contrastColor as w, cardFrame as x, THEME_FONT as y };
