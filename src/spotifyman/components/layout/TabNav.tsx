import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Search, Type, Palette, Sliders, Sparkles } from 'lucide-react';

export type TabId = 'search' | 'text' | 'style' | 'layout' | 'looks';

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'layout', label: 'Layout', icon: Sliders },
  { id: 'looks', label: 'Looks', icon: Sparkles },
];

export const TabNav: React.FC<TabNavProps> = ({ activeTab, onTabChange }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [inkStyle, setInkStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const updateInk = useCallback(() => {
    if (!listRef.current) return;
    const activeBtn = listRef.current.querySelector(
      `button[data-tab="${activeTab}"]`
    ) as HTMLElement | null;
    if (activeBtn) {
      setInkStyle({
        left: activeBtn.offsetLeft + 12,
        width: Math.max(0, activeBtn.offsetWidth - 24),
      });
    }
  }, [activeTab]);

  useEffect(() => {
    updateInk();
    window.addEventListener('resize', updateInk);
    return () => window.removeEventListener('resize', updateInk);
  }, [updateInk]);

  return (
    <nav
      className="relative flex items-center border-b border-[#282828] bg-[#161616]/95 backdrop-blur-md px-3 shrink-0 h-12 overflow-x-auto scrollbar-none"
      aria-label="Editor sections"
    >
      <div ref={listRef} className="relative flex items-center h-full w-full">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-tab={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-4 h-full text-xs font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#1db954] rounded-md ${
                isActive
                  ? 'text-white'
                  : 'text-[#888888] hover:text-[#d0d0d0]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Gliding ink line */}
        <span
          className="absolute bottom-0 h-[3px] rounded-t-full bg-[#1db954] shadow-[0_-2px_12px_rgba(29,185,84,0.6)] transition-all duration-300 ease-out pointer-events-none"
          style={{
            left: `${inkStyle.left}px`,
            width: `${inkStyle.width}px`,
          }}
        />
      </div>
    </nav>
  );
};
