import { i as __toESM, n as __exportAll } from "../_runtime.mjs";
import { A as require_react, k as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { o as TriangleAlert } from "../_libs/lucide-react.mjs";
import { _ as createFileRoute, d as Scripts, f as HeadContent, g as lazyRouteComponent, h as Outlet, m as createRouter, v as createRootRoute, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BCfEFd6C.js
var router_BCfEFd6C_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-BcCkiKdv.css";
var APP_NAME = "SpotifyMan";
var Route$4 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Spotify lyric cards with real 3D styles."
			},
			{
				name: "theme-color",
				content: "#121212"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bangers&family=Caveat:wght@700&family=Fredoka:wght@600;700&family=Newsreader:ital,wght@0,600;1,600&family=Orbitron:wght@700&family=Oswald:wght@600&family=Patrick+Hand&family=Permanent+Marker&family=Playfair+Display:wght@700&family=Poppins:wght@400;500;600;700&family=Press+Start+2P&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter = () => import("./routes-CXx4jU9H.mjs").then((n) => n.t);
var Route$3 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var MAX_BYTES$1 = 20971520;
var WEB_CTX = { client: {
	clientName: "WEB",
	clientVersion: "2.20250214.01.00",
	hl: "en",
	gl: "US"
} };
var IOS_UA = "com.google.ios.youtube/20.03.02 (iPhone16,2; U; CPU iOS 18_2_1 like Mac OS X;)";
var IOS_CTX = { client: {
	clientName: "IOS",
	clientVersion: "20.03.02",
	deviceMake: "Apple",
	deviceModel: "iPhone16,2",
	userAgent: IOS_UA,
	osName: "iPhone",
	osVersion: "18.2.1.22C161",
	hl: "en",
	gl: "US"
} };
var audioCache = /* @__PURE__ */ new Map();
function putCache(key, entry) {
	if (audioCache.size >= 12) {
		const oldest = audioCache.keys().next().value;
		if (oldest) audioCache.delete(oldest);
	}
	audioCache.set(key, entry);
}
function isBlockedHost$1(hostname) {
	const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
	if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host === "0.0.0.0" || host === "::1") return true;
	const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
	if (ipv4) {
		const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
		if (a === 10 || a === 127 || a === 0 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168) return true;
	}
	if (/^(fc|fd|fe8|fe9|fea|feb)/i.test(host)) return true;
	return false;
}
function tokenize(s) {
	return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length >= 2);
}
async function resolveFullTrackAudio(title, artist, targetDur) {
	const cleanT = title.replace(/\s*[([].*?[)\]]/g, "").replace(/\s+-\s+.*$/, "").trim();
	const cleanA = artist.replace(/\s*[([].*?[)\]]/g, "").split(/\s*(?:,|&|;|\band\b|\bfeat\.?|\bft\.?)\s*/i)[0].trim();
	if (!cleanT) return null;
	const titleTokens = tokenize(cleanT);
	const artistTokens = tokenize(cleanA);
	const query = `${cleanA} - ${cleanT} official audio`.trim();
	try {
		const sr = await fetch("https://www.youtube.com/youtubei/v1/search?prettyPrint=false", {
			method: "POST",
			signal: AbortSignal.timeout(7e3),
			headers: {
				"Content-Type": "application/json",
				"User-Agent": "Mozilla/5.0"
			},
			body: JSON.stringify({
				context: WEB_CTX,
				query
			})
		});
		if (!sr.ok) return null;
		const sj = await sr.json();
		const candidates = [];
		const seen = /* @__PURE__ */ new Set();
		const walk = (node) => {
			if (!node || typeof node !== "object") return;
			const obj = node;
			if (typeof obj.videoId === "string" && obj.videoId.length === 11 && !seen.has(obj.videoId)) {
				const t = obj.title?.runs?.[0]?.text || obj.title?.simpleText || "";
				const lenStr = obj.lengthText?.simpleText || obj.lengthText?.runs?.[0]?.text || "";
				const owner = obj.ownerText?.runs?.[0]?.text || obj.longBylineText?.runs?.[0]?.text || "";
				if (t && lenStr) {
					seen.add(obj.videoId);
					const parts = String(lenStr).split(":").map((n) => Number(n));
					const sec = parts.length === 2 ? parts[0] * 60 + parts[1] : parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : 0;
					if (sec >= 45 && sec <= 720) candidates.push({
						videoId: obj.videoId,
						title: String(t),
						owner: String(owner),
						duration: sec
					});
				}
			}
			for (const v of Object.values(obj)) walk(v);
		};
		walk(sj);
		if (!candidates.length) return null;
		const scoreCandidate = (c) => {
			const combined = `${c.title} ${c.owner}`.toLowerCase();
			const lt = c.title.toLowerCase();
			const lo = c.owner.toLowerCase();
			if (titleTokens.length > 0) {
				if (titleTokens.filter((tok) => combined.includes(tok)).length === 0) return -999;
			}
			let s = 0;
			if (artistTokens.length > 0) {
				if (artistTokens.filter((tok) => combined.includes(tok)).length > 0) s += 22;
				else s -= 25;
			}
			if (targetDur > 45) {
				const diff = Math.abs(c.duration - targetDur);
				s -= diff * 4.5;
				if (diff <= 2) s += 40;
				else if (diff <= 4) s += 25;
				else if (diff <= 8) s += 10;
				else if (diff > 25) s -= 40;
			}
			if (lo.includes("topic")) s += 26;
			if (lt.includes("official audio")) s += 22;
			else if (lt.includes("audio") || lt.includes("lyric")) s += 14;
			if (lt.includes("official video") || lt.includes("music video")) s -= 14;
			const queryLower = `${cleanT} ${cleanA}`.toLowerCase();
			for (const bad of [
				"live",
				"remix",
				"slowed",
				"sped up",
				"nightcore",
				"karaoke",
				"instrumental",
				"cover",
				"8d",
				"reverb"
			]) if (lt.includes(bad) && !queryLower.includes(bad)) s -= 45;
			return s;
		};
		const ranked = candidates.map((c) => ({
			c,
			score: scoreCandidate(c)
		})).filter((x) => x.score > -100).sort((a, b) => b.score - a.score);
		for (const { c } of ranked.slice(0, 3)) try {
			const pr = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
				method: "POST",
				signal: AbortSignal.timeout(7e3),
				headers: {
					"Content-Type": "application/json",
					"User-Agent": IOS_UA
				},
				body: JSON.stringify({
					context: IOS_CTX,
					videoId: c.videoId,
					contentCheckOk: true,
					racyCheckOk: true
				})
			});
			if (!pr.ok) continue;
			const pj = await pr.json();
			if (pj?.playabilityStatus?.status !== "OK") continue;
			const fmts = pj?.streamingData?.adaptiveFormats || [];
			const chosen = fmts.filter((f) => typeof f?.url === "string" && typeof f?.mimeType === "string" && f.mimeType.startsWith("audio/mp4")).sort((a, b) => Number(a.bitrate || 64e3) - Number(b.bitrate || 64e3))[0] || fmts.find((f) => typeof f?.url === "string" && typeof f?.mimeType === "string" && f.mimeType.startsWith("audio/"));
			if (!chosen?.url) continue;
			const mediaRes = await fetch(chosen.url, {
				signal: AbortSignal.timeout(1e4),
				headers: {
					"User-Agent": IOS_UA,
					Accept: "audio/*,*/*;q=0.8"
				}
			});
			if (!mediaRes.ok) continue;
			const buf = await mediaRes.arrayBuffer();
			if (buf.byteLength < 4096 || buf.byteLength > MAX_BYTES$1) continue;
			const durMs = Number(chosen.approxDurationMs || 0);
			const durationSec = durMs > 0 ? Math.round(durMs / 1e3) : c.duration;
			return {
				buf,
				contentType: String(chosen.mimeType || "audio/mp4").split(";")[0].trim(),
				kind: "full",
				durationSec
			};
		} catch {}
	} catch {
		return null;
	}
	return null;
}
async function fetchDirectAudioUrl(rawTarget) {
	let target;
	try {
		target = new URL(rawTarget);
	} catch {
		return null;
	}
	if (target.protocol !== "https:" && target.protocol !== "http:") return null;
	if (isBlockedHost$1(target.hostname)) return null;
	try {
		const upstream = await fetch(target.toString(), {
			signal: AbortSignal.timeout(1e4),
			redirect: "follow",
			headers: { Accept: "audio/*,application/octet-stream,*/*;q=0.8" }
		});
		if (!upstream.ok) return null;
		if (upstream.url) {
			if (isBlockedHost$1(new URL(upstream.url).hostname)) return null;
		}
		const contentType = (upstream.headers.get("content-type") || "audio/mp4").split(";")[0].trim().toLowerCase();
		if (!contentType.startsWith("audio/") && !contentType.startsWith("video/mp4") && !contentType.startsWith("application/octet-stream")) return null;
		if (Number(upstream.headers.get("content-length") || 0) > MAX_BYTES$1) return null;
		const buf = await upstream.arrayBuffer();
		if (buf.byteLength < 512 || buf.byteLength > MAX_BYTES$1) return null;
		return {
			buf,
			contentType,
			kind: "preview",
			durationSec: 30
		};
	} catch {
		return null;
	}
}
function serveAudioBuffer(request, entry) {
	const total = entry.buf.byteLength;
	const rangeHeader = request.headers.get("range");
	const baseHeaders = {
		"Content-Type": entry.contentType,
		"Accept-Ranges": "bytes",
		"Cache-Control": "public, max-age=86400",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Expose-Headers": "X-Audio-Kind, X-Track-Duration, Accept-Ranges, Content-Range",
		"X-Audio-Kind": entry.kind,
		"X-Track-Duration": String(entry.durationSec)
	};
	if (rangeHeader) {
		const m = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
		if (m) {
			const start = m[1] ? parseInt(m[1], 10) : 0;
			const end = m[2] ? Math.min(total - 1, parseInt(m[2], 10)) : total - 1;
			if (start >= 0 && start <= end && start < total) {
				const slice = entry.buf.slice(start, end + 1);
				return new Response(slice, {
					status: 206,
					headers: {
						...baseHeaders,
						"Content-Range": `bytes ${start}-${end}/${total}`,
						"Content-Length": String(slice.byteLength)
					}
				});
			}
		}
	}
	return new Response(entry.buf, {
		status: 200,
		headers: {
			...baseHeaders,
			"Content-Length": String(total)
		}
	});
}
var Route$2 = createFileRoute("/api/audio-proxy")({ server: { handlers: { GET: async ({ request }) => {
	const reqUrl = new URL(request.url);
	const title = (reqUrl.searchParams.get("title") || "").trim();
	const artist = (reqUrl.searchParams.get("artist") || "").trim();
	const duration = Number(reqUrl.searchParams.get("duration") || 0);
	const fallbackUrl = (reqUrl.searchParams.get("fallbackUrl") || "").trim();
	const rawTarget = (reqUrl.searchParams.get("url") || "").trim();
	if (title) {
		const cacheKey = `track:${title.toLowerCase()}|${artist.toLowerCase()}|${Math.round(duration)}`;
		const cached = audioCache.get(cacheKey);
		if (cached) return serveAudioBuffer(request, cached);
		const fullEntry = await resolveFullTrackAudio(title, artist, duration);
		if (fullEntry) {
			putCache(cacheKey, fullEntry);
			return serveAudioBuffer(request, fullEntry);
		}
		if (fallbackUrl) {
			const fallbackEntry = await fetchDirectAudioUrl(fallbackUrl);
			if (fallbackEntry) {
				putCache(cacheKey, fallbackEntry);
				return serveAudioBuffer(request, fallbackEntry);
			}
		}
		return new Response("Track audio not found", { status: 404 });
	}
	if (!rawTarget) return new Response("Missing url or title parameter", { status: 400 });
	const urlCacheKey = `url:${rawTarget}`;
	const cachedUrl = audioCache.get(urlCacheKey);
	if (cachedUrl) return serveAudioBuffer(request, cachedUrl);
	const directEntry = await fetchDirectAudioUrl(rawTarget);
	if (!directEntry) return new Response("Failed to fetch audio preview", { status: 502 });
	putCache(urlCacheKey, directEntry);
	return serveAudioBuffer(request, directEntry);
} } } });
var MAX_BYTES = 8388608;
function isBlockedHost(hostname) {
	const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
	if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host === "0.0.0.0" || host === "::1") return true;
	const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
	if (ipv4) {
		const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
		if (a === 10 || a === 127 || a === 0 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168) return true;
	}
	if (/^(fc|fd|fe8|fe9|fea|feb)/i.test(host)) return true;
	return false;
}
var Route$1 = createFileRoute("/api/cover-proxy")({ server: { handlers: { GET: async ({ request }) => {
	const rawTarget = (new URL(request.url).searchParams.get("url") || "").trim();
	let target;
	try {
		target = new URL(rawTarget);
	} catch {
		return new Response("Invalid URL", { status: 400 });
	}
	if (target.protocol !== "https:" && target.protocol !== "http:") return new Response("Only HTTP(S) URLs are allowed", { status: 400 });
	if (isBlockedHost(target.hostname)) return new Response("Blocked host", { status: 403 });
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 8e3);
	try {
		const upstream = await fetch(target.toString(), {
			signal: ctrl.signal,
			redirect: "follow",
			headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8" }
		});
		if (!upstream.ok) return new Response(`Upstream error ${upstream.status}`, { status: upstream.status });
		if (upstream.url) try {
			if (isBlockedHost(new URL(upstream.url).hostname)) return new Response("Blocked redirect host", { status: 403 });
		} catch {
			return new Response("Invalid redirect URL", { status: 502 });
		}
		const contentType = upstream.headers.get("content-type") || "";
		if (!contentType.toLowerCase().startsWith("image/")) return new Response("URL did not return an image", { status: 415 });
		if (Number(upstream.headers.get("content-length") || 0) > MAX_BYTES) return new Response("Image too large", { status: 413 });
		const buf = await upstream.arrayBuffer();
		if (buf.byteLength > MAX_BYTES) return new Response("Image too large", { status: 413 });
		return new Response(buf, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400",
				"Access-Control-Allow-Origin": "*"
			}
		});
	} catch {
		return new Response("Failed to fetch cover image", { status: 502 });
	} finally {
		clearTimeout(timer);
	}
} } } });
var SPOTIFY_TRACK_RE = /^https?:\/\/open\.spotify\.com\/(?:intl-[a-z-]+\/)?track\/([A-Za-z0-9]+)/i;
var SPOTIFY_OEMBED = "https://open.spotify.com/oembed";
var Route = createFileRoute("/api/spotify")({ server: { handlers: { GET: async ({ request }) => {
	const match = (new URL(request.url).searchParams.get("url") || "").trim().match(SPOTIFY_TRACK_RE);
	if (!match) return Response.json({ error: "That does not look like a Spotify track link. It should start with https://open.spotify.com/track/" }, { status: 400 });
	const trackId = match[1];
	const canonical = `https://open.spotify.com/track/${trackId}`;
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), 8e3);
	try {
		const upstream = await fetch(`${SPOTIFY_OEMBED}?url=${encodeURIComponent(canonical)}`, {
			signal: ctrl.signal,
			headers: { Accept: "application/json" }
		});
		if (!upstream.ok) return Response.json({ error: upstream.status === 404 ? "Spotify could not find that track. Check the link and try again." : `Spotify returned an error (${upstream.status}). Please try again in a moment.` }, { status: upstream.status });
		const data = await upstream.json();
		if (!data?.thumbnail_url) return Response.json({ error: "Spotify did not return a cover image for this track." }, { status: 502 });
		return Response.json({
			coverUrl: data.thumbnail_url,
			trackId,
			title: typeof data.title === "string" ? data.title : void 0,
			authorName: typeof data.author_name === "string" ? data.author_name : void 0
		}, { headers: { "Cache-Control": "public, max-age=3600" } });
	} catch {
		return Response.json({ error: "Couldn't reach Spotify right now. Please try again." }, { status: 502 });
	} finally {
		clearTimeout(timer);
	}
} } } });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$4
	}),
	ApiAudioProxyRoute: Route$2.update({
		id: "/api/audio-proxy",
		path: "/api/audio-proxy",
		getParentRoute: () => Route$4
	}),
	ApiCoverProxyRoute: Route$1.update({
		id: "/api/cover-proxy",
		path: "/api/cover-proxy",
		getParentRoute: () => Route$4
	}),
	ApiSpotifyRoute: Route.update({
		id: "/api/spotify",
		path: "/api/spotify",
		getParentRoute: () => Route$4
	})
};
var routeTree = Route$4._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { getRouter, router_BCfEFd6C_exports as t };
