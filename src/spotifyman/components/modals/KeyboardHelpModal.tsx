import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface KeyboardHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardHelpModal: React.FC<KeyboardHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: 'Space', desc: 'Play / Pause track preview' },
    { key: 'E', desc: 'Open Export dialog' },
    { key: '1 – 5', desc: 'Switch layout (Square, Wide, Story, Portrait, Tall)' },
    { key: '←  →', desc: 'Cycle previous / next card theme' },
    { key: 'Ctrl + Z', desc: 'Undo card changes' },
    { key: 'Ctrl + ⇧ + Z', desc: 'Redo card changes' },
    { key: '?', desc: 'Toggle this keyboard shortcuts dialog' },
    { key: 'Esc', desc: 'Close any active modal or sheet' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />
      <div className="relative w-full max-w-sm bg-[#1e1e1e] border border-[#333333] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#2c2c2c]">
          <h2 className="text-sm font-bold text-white">Keyboard Shortcuts</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-[#a0a0a0] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <dl className="space-y-2.5 text-xs text-[#b3b3b3]">
          {SHORTCUTS.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <span className="text-[#e0e0e0]">{item.desc}</span>
              <kbd className="px-2 py-1 rounded bg-[#2a2a2a] border border-[#3c3c3c] text-white font-mono text-[11px] shadow-sm shrink-0">
                {item.key}
              </kbd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};
