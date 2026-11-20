import { i as __toESM } from "../_runtime.mjs";
import { A as require_react, k as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { D as ChevronDown, x as LoaderCircle, y as Music } from "../_libs/lucide-react.mjs";
import { T as hexToRgb, r as fetchLyrics, w as contrastColor } from "./routes-CXx4jU9H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LyricsModal-Cpxa6FIf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fmtBadgeTime(sec) {
	const s = Math.max(0, Math.floor(sec));
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${m}:${r < 10 ? "0" : ""}${r}`;
}
var LyricsModal = ({ isOpen, onClose, artist, title, duration = 0, previewOffset = null, isFullTrack = false, cardColor, onApplyLyrics, onToast }) => {
	const [blocks, setBlocks] = (0, import_react.useState)([]);
	const [timedBlocks, setTimedBlocks] = (0, import_react.useState)([]);
	const [fetchedDuration, setFetchedDuration] = (0, import_react.useState)(void 0);
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [isLoading, setIsLoading] = (0, import_react.useState)(false);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [source, setSource] = (0, import_react.useState)("");
	const [shakingIdx, setShakingIdx] = (0, import_react.useState)(null);
	const { r, g, b } = hexToRgb(cardColor);
	const lum = (r * 299 + g * 587 + b * 114) / 1e3;
	const textColor = contrastColor(cardColor);
	const highlightTextColor = lum < 60 ? "#ffffff" : cardColor;
	(0, import_react.useEffect)(() => {
		if (!isOpen) return;
		if (!title.trim() || !artist.trim()) {
			setErrorMsg("Enter a song title and artist first, or pick one via Search.");
			setBlocks([]);
			setSelected([]);
			return;
		}
		let isMounted = true;
		setIsLoading(true);
		setErrorMsg(null);
		setSelected([]);
		setBlocks([]);
		setTimedBlocks([]);
		setFetchedDuration(void 0);
		setSource("");
		fetchLyrics(artist, title, duration, () => !isMounted).then((res) => {
			if (!isMounted) return;
			setBlocks(res.blocks);
			setTimedBlocks(res.timedBlocks);
			setFetchedDuration(res.duration);
			setSource(res.source);
			setIsLoading(false);
		}).catch((err) => {
			if (!isMounted) return;
			setErrorMsg(err.message || "Could not find lyrics for this song.");
			setIsLoading(false);
		});
		return () => {
			isMounted = false;
		};
	}, [
		isOpen,
		artist,
		title,
		duration
	]);
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && isOpen) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);
	if (!isOpen) return null;
	const handleToggleBlock = (index) => {
		if (selected.includes(index)) setSelected((prev) => prev.filter((i) => i !== index));
		else {
			if (selected.length >= 4) {
				setShakingIdx(index);
				setTimeout(() => setShakingIdx(null), 400);
				onToast(`You can select up to 4 lines`);
				return;
			}
			setSelected((prev) => [...prev, index]);
		}
	};
	const isLineInPreview = (idx) => {
		const t = timedBlocks[idx]?.timeSec;
		if (typeof t !== "number") return false;
		if (isFullTrack) return true;
		if (previewOffset === null) return false;
		return t >= previewOffset - .85 && t <= previewOffset + 28.8;
	};
	const firstPreviewIdx = !isFullTrack && previewOffset !== null ? timedBlocks.findIndex((_, idx) => isLineInPreview(idx)) : -1;
	const handleSelectPreviewLines = () => {
		if (firstPreviewIdx < 0) return;
		const picked = [];
		for (let i = firstPreviewIdx; i < Math.min(blocks.length, firstPreviewIdx + 4); i++) picked.push(i);
		setSelected(picked);
	};
	const handleContinue = () => {
		if (selected.length === 0) return;
		const sortedIndices = [...selected].sort((a, b) => a - b);
		const sortedLines = sortedIndices.map((i) => blocks[i]).join("\n");
		const firstTimeSec = timedBlocks[sortedIndices[0]]?.timeSec;
		const selectedLineTimes = sortedIndices.map((i) => timedBlocks[i]?.timeSec).filter((t) => typeof t === "number");
		const selectedLineEnds = sortedIndices.map((i) => timedBlocks[i]?.endTimeSec ?? timedBlocks[i + 1]?.timeSec ?? (typeof timedBlocks[i]?.timeSec === "number" ? timedBlocks[i].timeSec + 3.2 : void 0)).filter((t) => typeof t === "number");
		onApplyLyrics(sortedLines, firstTimeSec, fetchedDuration, selectedLineTimes.length === sortedIndices.length ? selectedLineTimes : void 0, selectedLineEnds.length === sortedIndices.length ? selectedLineEnds : void 0);
		onClose();
		onToast("Lyrics applied & synced word-by-word with song audio");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			onClick: onClose,
			className: "absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-col w-full sm:max-w-xl h-[85vh] sm:h-[82vh] max-h-[820px] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-6",
			style: {
				backgroundColor: cardColor,
				color: textColor
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "flex items-center justify-between px-5 py-4 border-b border-black/10 shrink-0",
					style: { backgroundColor: cardColor },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							"aria-label": "Close",
							className: "w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/10 active:scale-95 transition-all",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "w-6 h-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center min-w-0 flex-1 px-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-base font-bold truncate",
									children: "Select Lyrics"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs opacity-75 truncate",
									children: selected.length ? `${selected.length} of 4 lines selected` : `Tap up to 4 lines`
								}),
								source && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[10px] opacity-60 font-mono mt-0.5",
									children: ["Source: ", source]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-10 h-10 shrink-0 flex items-center justify-end",
							children: firstPreviewIdx >= 0 && !isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: handleSelectPreviewLines,
								title: "Select the 4 lines audible in the 30s song preview",
								className: "inline-flex items-center gap-1 rounded-full bg-black/25 hover:bg-black/40 px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap transition-all active:scale-95",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Preview" })]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto p-5 sm:p-7 space-y-2 overscroll-contain scrollbar-none",
					children: [
						isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "h-full flex flex-col items-center justify-center gap-3 py-16 opacity-85",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-8 h-8 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Fetching lyrics…"
							})]
						}),
						errorMsg && !isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "h-full flex flex-col items-center justify-center text-center p-6 gap-2 opacity-80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: errorMsg
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs opacity-75",
								children: "You can manually type or paste lyrics directly into the editor text field."
							})]
						}),
						!isLoading && !errorMsg && blocks.map((line, idx) => {
							const isSelected = selected.includes(idx);
							const isShaking = shakingIdx === idx;
							const lineTime = timedBlocks[idx]?.timeSec;
							const inPreview = isLineInPreview(idx);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => handleToggleBlock(idx),
								className: `w-full text-left p-3.5 sm:p-4 rounded-2xl font-bold text-lg sm:text-2xl tracking-tight leading-tight transition-all active:scale-[0.99] flex items-baseline justify-between gap-3 ${isShaking ? "animate-bounce" : ""} ${isSelected ? "bg-black shadow-xl opacity-100 scale-[1.01]" : inPreview ? "opacity-70 hover:opacity-95 bg-black/10" : "opacity-40 hover:opacity-75 bg-transparent"}`,
								style: { color: isSelected ? highlightTextColor : textColor },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: line }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "shrink-0 flex items-center gap-1.5",
									children: [inPreview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										title: "Audible in the 30s audio preview",
										className: "inline-flex items-center gap-0.5 rounded-full bg-black/25 px-1.5 py-0.5 text-[10px] font-semibold tracking-normal",
										children: "♪"
									}), typeof lineTime === "number" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs opacity-60",
										children: fmtBadgeTime(lineTime)
									})]
								})]
							}, idx);
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
					className: "relative px-6 py-4 pb-8 sm:pb-4 border-t border-black/10 flex justify-center shrink-0",
					style: { backgroundColor: cardColor },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: handleContinue,
						disabled: selected.length === 0,
						className: "w-full max-w-sm py-3.5 px-6 rounded-full font-bold text-sm bg-white text-black hover:scale-102 active:scale-98 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-xl",
						children: "Continue"
					})
				})
			]
		})]
	});
};
//#endregion
export { LyricsModal };
