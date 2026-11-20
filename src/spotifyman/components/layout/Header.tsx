import React, { useEffect, useState } from 'react';
import { Undo2, Redo2, HelpCircle, Download } from 'lucide-react';

interface HeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  isPlaying?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePlay?: () => void;
  onOpenHelp: () => void;
  onToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  canUndo,
  canRedo,
  isPlaying = false,
  onUndo,
  onRedo,
  onTogglePlay,
  onOpenHelp,
  onToast,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const ua = navigator.userAgent;
    const isIOS =
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isStandalone =
      (window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches) ||
      (navigator as any).standalone === true;

    if (isIOS && !isStandalone) {
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        onToast('App installation started');
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      const ua = navigator.userAgent;
      const isIOS = /iphone|ipad|ipod/i.test(ua);
      if (isIOS) {
        onToast('Tap the Share icon in Safari, then select "Add to Home Screen".');
      } else {
        onToast('To install, open your browser menu and choose "Install App" or "Add to Home Screen".');
      }
    }
  };

  return (
    <header className="relative flex items-center justify-between gap-3 px-5 py-4 border-b border-[#282828] bg-[#121212]/90 backdrop-blur-xl shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:-rotate-6">
          <svg
            className="w-8 h-8 drop-shadow-[0_4px_12px_rgba(29,185,84,0.35)]"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="24" fill="#1db954" />
            <path
              d="M11 17.5c8-2.4 18-1.8 25.5 2.6"
              stroke="#000"
              strokeWidth="3.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M12.5 25c6.7-2 15-1.4 21 2.1"
              stroke="#000"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M14 31.6c5.3-1.5 11.3-1 16 1.7"
              stroke="#000"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">SpotifyMan</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Equalizer animation (synced with live playback + clickable to toggle Play/Pause) */}
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? 'Pause track preview' : 'Play track preview'}
          title={isPlaying ? 'Pause track preview (Space)' : 'Play track preview (Space)'}
          className="flex items-end gap-[3px] h-6 px-2 py-1 rounded-full hover:bg-white/5 transition-colors"
        >
          <span
            className={`w-[3px] rounded-sm bg-[#1db954] origin-bottom transition-all ${
              isPlaying
                ? 'h-full animate-[bounce_1.1s_ease-in-out_infinite]'
                : 'h-1.5 opacity-55'
            }`}
          />
          <span
            className={`w-[3px] rounded-sm bg-[#1db954] origin-bottom transition-all ${
              isPlaying
                ? 'h-full animate-[bounce_0.9s_ease-in-out_infinite_-0.4s]'
                : 'h-3 opacity-65'
            }`}
          />
          <span
            className={`w-[3px] rounded-sm bg-[#1db954] origin-bottom transition-all ${
              isPlaying
                ? 'h-full animate-[bounce_1.3s_ease-in-out_infinite_-0.8s]'
                : 'h-2 opacity-60'
            }`}
          />
          <span
            className={`w-[3px] rounded-sm bg-[#1db954] origin-bottom transition-all ${
              isPlaying
                ? 'h-full animate-[bounce_1.0s_ease-in-out_infinite_-0.2s]'
                : 'h-2.5 opacity-60'
            }`}
          />
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#333333] rounded-full p-0.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white disabled:opacity-30 disabled:hover:text-[#b3b3b3] transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="w-7 h-7 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white disabled:opacity-30 disabled:hover:text-[#b3b3b3] transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Shortcuts */}
        <button
          type="button"
          onClick={onOpenHelp}
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#b3b3b3] hover:text-white hover:bg-white/5 border border-transparent hover:border-[#333333] transition-all"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* PWA Install */}
        {isInstallable && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}
      </div>
    </header>
  );
};
