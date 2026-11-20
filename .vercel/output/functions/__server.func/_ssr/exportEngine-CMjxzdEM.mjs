import { _ as LAYOUTS, b as presetById, d as renderCard, g as FORMATS, m as CANON, p as paintGlare, v as LYRIC_FONTS, y as THEME_FONT } from "./routes-CXx4jU9H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exportEngine-CMjxzdEM.js
var rad = (deg) => deg * Math.PI / 180;
/** 3x3 row-major matrix multiply */
function mul3(a, b) {
	const o = new Array(9).fill(0);
	for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) for (let k = 0; k < 3; k++) o[r * 3 + c] += a[r * 3 + k] * b[k * 3 + c];
	return o;
}
/** 3x3 inverse via adjugate */
function invert3(m) {
	const [a, b, c, d, e, f, g, h, i] = m;
	const A = e * i - f * h;
	const B = -(d * i - f * g);
	const C = d * h - e * g;
	const det = a * A + b * B + c * C;
	if (Math.abs(det) < 1e-12) return [
		1,
		0,
		0,
		0,
		1,
		0,
		0,
		0,
		1
	];
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
		(a * e - b * d) * k
	];
}
/**
* Homography H mapping card-plane points (x, y, 1), centered on the card (origin = W/2, H/2),
* to screen points (X*w, Y*w, w), replicating CSS:
*   perspective(d) rotateX(rx) rotateY(ry) rotateZ(rz)
*/
function buildHomography(d, tilt) {
	const rxDeg = tilt == null ? 0 : Number(tilt.rx) || 0;
	const ryDeg = tilt == null ? 0 : Number(tilt.ry) || 0;
	const rzDeg = tilt == null ? 0 : Number(tilt.rz) || 0;
	const [cx, sx] = [Math.cos(rad(rxDeg)), Math.sin(rad(rxDeg))];
	const [cy, sy] = [Math.cos(rad(ryDeg)), Math.sin(rad(ryDeg))];
	const [cz, sz] = [Math.cos(rad(rzDeg)), Math.sin(rad(rzDeg))];
	const M = mul3([
		1,
		0,
		0,
		0,
		cx,
		-sx,
		0,
		sx,
		cx
	], mul3([
		cy,
		0,
		sy,
		0,
		1,
		0,
		-sy,
		0,
		cy
	], [
		cz,
		-sz,
		0,
		sz,
		cz,
		0,
		0,
		0,
		1
	]));
	return [
		M[0],
		M[1],
		0,
		M[3],
		M[4],
		0,
		-M[6] / d,
		-M[7] / d,
		1
	];
}
/** Project a card-plane point to screen space using H */
function project(H, x, y) {
	const w = H[6] * x + H[7] * y + H[8];
	return {
		x: (H[0] * x + H[1] * y + H[2]) / w,
		y: (H[3] * x + H[4] * y + H[5]) / w
	};
}
/**
* Warp a source canvas through the 3D homography with bilinear, alpha-premultiplied sampling.
*/
function warpCard(source, H, k, canvasW, canvasH) {
	const halfW = canvasW / 2;
	const halfH = canvasH / 2;
	const SW = canvasW * k;
	const SH = canvasH * k;
	const corners = [
		[-halfW, -halfH],
		[halfW, -halfH],
		[halfW, halfH],
		[-halfW, halfH]
	].map(([x, y]) => project(H, x, y));
	const minX = Math.floor(k * Math.min(...corners.map((p) => p.x)));
	const minY = Math.floor(k * Math.min(...corners.map((p) => p.y)));
	const maxX = Math.ceil(k * Math.max(...corners.map((p) => p.x)));
	const maxY = Math.ceil(k * Math.max(...corners.map((p) => p.y)));
	const outW = Math.max(1, maxX - minX);
	const outH = Math.max(1, maxY - minY);
	const srcCtx = source.getContext("2d");
	if (!srcCtx) throw new Error("Could not get 2d context from source canvas");
	const src = srcCtx.getImageData(0, 0, SW, SH).data;
	const dstImage = new ImageData(outW, outH);
	const dst = dstImage.data;
	const inv = invert3(H);
	for (let py = 0; py < outH; py++) {
		const Y = (minY + py + .5) / k;
		for (let px = 0; px < outW; px++) {
			const X = (minX + px + .5) / k;
			const w = inv[6] * X + inv[7] * Y + inv[8];
			const u = ((inv[0] * X + inv[1] * Y + inv[2]) / w + halfW) * k - .5;
			const v = ((inv[3] * X + inv[4] * Y + inv[5]) / w + halfH) * k - .5;
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
					const al = src[idx + 3] / 255 * wgt;
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
	const out = document.createElement("canvas");
	out.width = outW;
	out.height = outH;
	const outCtx = out.getContext("2d");
	if (outCtx) outCtx.putImageData(dstImage, 0, 0);
	return out;
}
function slugify(text) {
	return String(text || "").normalize("NFKC").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]+/gu, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "");
}
/**
* Ensures web fonts and cover art are fully loaded and CORS-safe before rendering an export.
*/
async function ensureExportAssetsReady(state, coverImg) {
	if (typeof document !== "undefined" && document.fonts) try {
		const fontKey = state.lyricFont === "auto" ? THEME_FONT[state.theme] || "poppins" : state.lyricFont;
		const f = LYRIC_FONTS[fontKey] || LYRIC_FONTS.poppins;
		const loads = [
			document.fonts.ready,
			document.fonts.load("400 16px \"Poppins\""),
			document.fonts.load("700 32px \"Poppins\"")
		];
		if ("load" in f && f.load) loads.push(document.fonts.load(`${f.weight} 32px "${f.load}"`));
		await Promise.all(loads.map((p) => p.catch(() => void 0)));
	} catch {}
	if (coverImg && coverImg.complete && coverImg.naturalWidth > 0) {
		try {
			await coverImg.decode();
		} catch {}
		return coverImg;
	}
	const rawUrl = state.coverUrl.trim();
	if (!rawUrl || state.hide.cover) return null;
	const tryLoad = (src) => new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.referrerPolicy = "no-referrer";
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = src;
	});
	const direct = await tryLoad(rawUrl);
	if (direct) return direct;
	if (/^https?:\/\//i.test(rawUrl)) return await tryLoad(`/api/cover-proxy?url=${encodeURIComponent(rawUrl)}`);
	return null;
}
function fileBaseName(title, artist, suffix, ext = "png") {
	const parts = [slugify(title), slugify(artist)].filter(Boolean);
	return (parts.length ? parts.join("_") : "lyric-card") + suffix + "." + ext;
}
function canvasToBlob(canvas, type = "image/png", quality) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((b) => b ? resolve(b) : reject(/* @__PURE__ */ new Error("toBlob returned null")), type, quality);
	});
}
function saveBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 15e3);
}
var webpOk = null;
function supportsWebp() {
	if (webpOk === null) try {
		const c = document.createElement("canvas");
		c.width = c.height = 1;
		webpOk = c.toDataURL("image/webp").indexOf("data:image/webp") === 0;
	} catch {
		webpOk = false;
	}
	return webpOk;
}
async function encodeCanvas(canvas, fmtKey) {
	const f = FORMATS[fmtKey] || FORMATS.png;
	const blob = await canvasToBlob(canvas, f.mime, f.q);
	if (f.mime !== "image/png" && blob.type && blob.type !== f.mime) {
		if (f.mime === "image/webp") webpOk = false;
		return {
			blob,
			fmt: "png",
			fellBack: true
		};
	}
	return {
		blob,
		fmt: FORMATS[fmtKey] ? fmtKey : "png",
		fellBack: false
	};
}
function dimsFor(key, state, social = false) {
	const L = LAYOUTS[key];
	const p = social ? presetById(CANON[key]) : presetById(state.preset) && presetById(state.preset)?.layout === key ? presetById(state.preset) : null;
	return p ? {
		w: p.w,
		h: p.h
	} : {
		w: Math.round(L.w * state.scale),
		h: Math.round(L.h * state.scale)
	};
}
function renderFlatCanvas(key, dims, fmtKey, state, coverImg, playback) {
	const layout = LAYOUTS[key];
	const out = document.createElement("canvas");
	out.width = dims.w;
	out.height = dims.h;
	const g = out.getContext("2d");
	if (!g) throw new Error("Could not get 2d context for flat canvas export");
	g.scale(dims.w / layout.w, dims.h / layout.h);
	const solid = (FORMATS[fmtKey] || FORMATS.png).solid || !state.transparent;
	renderCard(g, {
		...state,
		layoutKey: key
	}, layout, coverImg, {
		rx: 0,
		ry: 0,
		rz: 0,
		perspective: 1200
	}, {
		fullBleed: solid,
		flat: true,
		playback
	});
	return out;
}
var grabPreview = null;
function setPreviewGrab(fn) {
	grabPreview = fn;
}
function trimCanvas(src, pad = 28) {
	const ctx = src.getContext("2d");
	if (!ctx) return src;
	const { width, height } = src;
	let data;
	try {
		data = ctx.getImageData(0, 0, width, height).data;
	} catch {
		return src;
	}
	let minX = width;
	let minY = height;
	let maxX = 0;
	let maxY = 0;
	const step = 2;
	for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) if (data[(y * width + x) * 4 + 3] > 12) {
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
	}
	if (maxX <= minX || maxY <= minY) return src;
	minX = Math.max(0, minX - pad);
	minY = Math.max(0, minY - pad);
	maxX = Math.min(width - 1, maxX + pad);
	maxY = Math.min(height - 1, maxY + pad);
	const out = document.createElement("canvas");
	out.width = maxX - minX + 1;
	out.height = maxY - minY + 1;
	const g = out.getContext("2d");
	if (!g) return src;
	g.drawImage(src, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
	return out;
}
function takePreviewShot() {
	try {
		const shot = grabPreview ? grabPreview() : null;
		if (!shot || shot.width < 32 || shot.height < 32) return null;
		return trimCanvas(shot);
	} catch {
		return null;
	}
}
function renderCard3D(state, coverImg, displayedWidth, tilt, playback, solidBackground = false) {
	const layout = LAYOUTS[state.layoutKey];
	const dims = dimsFor(state.layoutKey, state);
	const scale = Math.max(1, dims.w / layout.w);
	const flat = document.createElement("canvas");
	flat.width = Math.round(layout.w * scale);
	flat.height = Math.round(layout.h * scale);
	const fg = flat.getContext("2d");
	if (!fg) throw new Error("Could not create context for 3d bake");
	fg.scale(scale, scale);
	const pose = {
		rx: tilt?.rx ?? 12,
		ry: tilt?.ry ?? -15,
		rz: tilt?.rz ?? 2,
		perspective: tilt?.perspective ?? 1200
	};
	const cardOnlyState = {
		...state,
		bgStyle: "none"
	};
	renderCard(fg, cardOnlyState, layout, coverImg, pose, {
		fullBleed: false,
		flat: false,
		playback
	});
	paintGlare(fg, cardOnlyState, layout, pose, false);
	const refWidth = displayedWidth || Math.round(layout.w * .55);
	const warped = warpCard(flat, buildHomography(pose.perspective * (layout.w / refWidth), pose), scale, layout.w, layout.h);
	const pad = Math.round(135 * scale);
	const out = document.createElement("canvas");
	out.width = warped.width + pad * 2;
	out.height = warped.height + pad * 2;
	const og = out.getContext("2d");
	if (!og) throw new Error("Could not create output context for 3D card");
	if (solidBackground || (FORMATS[state.fmt] || FORMATS.png).solid || !state.transparent) {
		og.fillStyle = "#0d0d11";
		og.fillRect(0, 0, out.width, out.height);
		const rg = og.createRadialGradient(out.width * .5, out.height * .48, out.width * .08, out.width * .5, out.height * .5, Math.max(out.width, out.height) * .65);
		rg.addColorStop(0, `${state.color}2e`);
		rg.addColorStop(1, "rgba(13, 13, 17, 0)");
		og.fillStyle = rg;
		og.fillRect(0, 0, out.width, out.height);
	}
	og.save();
	og.shadowColor = "rgba(0, 0, 0, 0.55)";
	og.shadowBlur = 54 * scale;
	og.shadowOffsetY = 54 * scale;
	og.drawImage(warped, pad, pad);
	og.restore();
	og.save();
	og.shadowColor = "rgba(0, 0, 0, 0.35)";
	og.shadowBlur = 18 * scale;
	og.shadowOffsetY = 16 * scale;
	og.drawImage(warped, pad, pad);
	og.restore();
	return out;
}
var CRC_TABLE = (() => {
	const t = /* @__PURE__ */ new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
		t[n] = c >>> 0;
	}
	return t;
})();
function crc32(u8) {
	let c = 4294967295;
	for (let i = 0; i < u8.length; i++) c = CRC_TABLE[(c ^ u8[i]) & 255] ^ c >>> 8;
	return (c ^ 4294967295) >>> 0;
}
function makeZip(files) {
	const te = new TextEncoder();
	const parts = [];
	const central = [];
	const d = /* @__PURE__ */ new Date();
	const time = d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() >> 1;
	const date = Math.max(1980, d.getFullYear()) - 1980 << 9 | d.getMonth() + 1 << 5 | d.getDate();
	let offset = 0;
	for (const f of files) {
		const name = te.encode(f.name);
		const crc = crc32(f.data);
		const size = f.data.length;
		const lh = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(30));
		lh.setUint32(0, 67324752, true);
		lh.setUint16(4, 20, true);
		lh.setUint16(6, 2048, true);
		lh.setUint16(8, 0, true);
		lh.setUint16(10, time, true);
		lh.setUint16(12, date, true);
		lh.setUint32(14, crc, true);
		lh.setUint32(18, size, true);
		lh.setUint32(22, size, true);
		lh.setUint16(26, name.length, true);
		lh.setUint16(28, 0, true);
		parts.push(lh.buffer, name, f.data);
		const ch = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(46));
		ch.setUint32(0, 33639248, true);
		ch.setUint16(4, 20, true);
		ch.setUint16(6, 20, true);
		ch.setUint16(8, 2048, true);
		ch.setUint16(10, 0, true);
		ch.setUint16(12, time, true);
		ch.setUint16(14, date, true);
		ch.setUint32(16, crc, true);
		ch.setUint32(20, size, true);
		ch.setUint32(24, size, true);
		ch.setUint16(28, name.length, true);
		ch.setUint16(30, 0, true);
		ch.setUint16(32, 0, true);
		ch.setUint16(34, 0, true);
		ch.setUint16(36, 0, true);
		ch.setUint32(38, 0, true);
		ch.setUint32(42, offset, true);
		central.push(ch.buffer, name);
		offset += 30 + name.length + size;
	}
	const cdSize = central.reduce((n, p) => n + p.byteLength, 0);
	const end = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(22));
	end.setUint32(0, 101010256, true);
	end.setUint16(8, files.length, true);
	end.setUint16(10, files.length, true);
	end.setUint32(12, cdSize, true);
	end.setUint32(16, offset, true);
	return new Blob([
		...parts,
		...central,
		end.buffer
	], { type: "application/zip" });
}
//#endregion
export { fileBaseName as a, renderFlatCanvas as c, supportsWebp as d, takePreviewShot as f, ensureExportAssetsReady as i, saveBlob as l, dimsFor as n, makeZip as o, warpCard as p, encodeCanvas as r, renderCard3D as s, buildHomography as t, setPreviewGrab as u };
