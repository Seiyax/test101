import { i as __toESM } from "../_runtime.mjs";
import { A as require_react, k as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/KeyboardHelpModal-DYgCpgJL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KeyboardHelpModal = ({ isOpen, onClose }) => {
	(0, import_react.useEffect)(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && isOpen) onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);
	if (!isOpen) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "dialog",
		"aria-modal": "true",
		className: "fixed inset-0 z-[120] flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			onClick: onClose,
			className: "absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative w-full max-w-sm bg-[#1e1e1e] border border-[#333333] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between pb-2 border-b border-[#2c2c2c]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-bold text-white",
					children: "Keyboard Shortcuts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-[#a0a0a0] hover:text-white",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "space-y-2.5 text-xs text-[#b3b3b3]",
				children: [
					{
						key: "Space",
						desc: "Play / Pause track preview"
					},
					{
						key: "E",
						desc: "Open Export dialog"
					},
					{
						key: "1 – 5",
						desc: "Switch layout (Square, Wide, Story, Portrait, Tall)"
					},
					{
						key: "←  →",
						desc: "Cycle previous / next card theme"
					},
					{
						key: "Ctrl + Z",
						desc: "Undo card changes"
					},
					{
						key: "Ctrl + ⇧ + Z",
						desc: "Redo card changes"
					},
					{
						key: "?",
						desc: "Toggle this keyboard shortcuts dialog"
					},
					{
						key: "Esc",
						desc: "Close any active modal or sheet"
					}
				].map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[#e0e0e0]",
						children: item.desc
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
						className: "px-2 py-1 rounded bg-[#2a2a2a] border border-[#3c3c3c] text-white font-mono text-[11px] shadow-sm shrink-0",
						children: item.key
					})]
				}, idx))
			})]
		})]
	});
};
//#endregion
export { KeyboardHelpModal };
