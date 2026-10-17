import React from 'react';
import { 
  ArrowLeftRight, 
  Flame, 
  Rocket, 
  Wallet, 
  LayoutGrid 
} from 'lucide-react';
import type { NavTab } from './Navbar';
import { playClickSound } from '../services/soundService';

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  lang: 'fa' | 'en';
  isDarkMode?: boolean;
  onOpenMoreMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  lang,
  isDarkMode = true,
  onOpenMoreMenu,
}) => {
  const isFa = lang === 'fa';

  const navItems = [
    {
      id: 'swap' as NavTab,
      label: isFa ? 'سواپ' : 'Swap',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'futures' as NavTab,
      label: isFa ? 'فیوچرز' : 'Futures',
      icon: Flame,
      badge: '50x',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    },
    {
      id: 'launchpad' as NavTab,
      label: isFa ? 'لانچ‌پد' : 'Launchpad',
      icon: Rocket,
      badge: isFa ? 'جدید' : 'NEW',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'portfolio' as NavTab,
      label: isFa ? 'دارایی‌ها' : 'Assets',
      icon: Wallet,
      badge: null,
    },
  ];

  const handleTabClick = (tab: NavTab) => {
    playClickSound();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMoreClick = () => {
    playClickSound();
    onOpenMoreMenu();
  };

  const isMoreActive = !navItems.some(item => item.id === activeTab);

  return (
    <aside 
      aria-label="Mobile navigation bar"
      className={`fixed bottom-0 inset-x-0 z-40 lg:hidden border-t backdrop-blur-2xl transition-colors duration-200 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] pt-1.5 px-3 shadow-[0_-8px_30px_rgba(0,0,0,0.45)] ${
        isDarkMode 
          ? 'bg-[#100b24]/95 border-purple-500/25' 
          : 'bg-white/95 border-purple-200'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 select-none ${
                isActive
                  ? 'bg-gradient-to-b from-purple-600/30 to-purple-600/10 text-white shadow-inner ring-1 ring-purple-400/40'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {/* Active Indicator Glow Pip */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-amber-400 to-purple-400 shadow-sm shadow-purple-500 animate-pulse" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-purple-400'
                }`} />

                {item.badge && (
                  <span className={`absolute -top-1.5 -right-3 text-[8px] font-black px-1 py-0.2 rounded-full border leading-tight ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] font-extrabold mt-1 tracking-tight ${
                isActive 
                  ? 'text-white' 
                  : isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More / All Tools Hub Button */}
        <button
          onClick={handleMoreClick}
          className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 select-none ${
            isMoreActive
              ? 'bg-gradient-to-b from-purple-600/30 to-purple-600/10 text-white shadow-inner ring-1 ring-purple-400/40'
              : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isMoreActive && (
            <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 shadow-sm shadow-pink-500 animate-pulse" />
          )}

          <LayoutGrid className={`w-5 h-5 transition-transform duration-200 ${
            isMoreActive ? 'scale-110 text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]' : 'text-purple-400'
          }`} />

          <span className={`text-[10px] font-extrabold mt-1 tracking-tight ${
            isMoreActive 
              ? 'text-white' 
              : isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {isFa ? 'ابزارها' : 'More'}
          </span>
        </button>
      </div>
    </aside>
  );
};
