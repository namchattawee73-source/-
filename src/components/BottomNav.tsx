/**
 * SU Smart Transit - Bottom Navigation Component
 * Features 3 core navigation sections: Live Tracking, Routes, and Schedule.
 */

import React from 'react';
import { Navigation, Route as RouteIcon, Clock } from 'lucide-react';

export type NavTab = 'tracking' | 'routes' | 'schedule';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lang: 'th' | 'en';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, lang }) => {
  const tabs = [
    {
      id: 'tracking' as NavTab,
      labelTh: 'ติดตามรถ',
      labelEn: 'Live Tracking',
      icon: Navigation,
    },
    {
      id: 'routes' as NavTab,
      labelTh: 'เส้นทาง',
      labelEn: 'Routes',
      icon: RouteIcon,
    },
    {
      id: 'schedule' as NavTab,
      labelTh: 'ตารางเวลา',
      labelEn: 'Schedule',
      icon: Clock,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] pb-safe">
      <div className="max-w-[430px] mx-auto grid grid-cols-3 h-16 items-center px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] transition-colors group relative"
              aria-label={lang === 'th' ? tab.labelTh : tab.labelEn}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#EAF3EF] text-[#40826D]'
                    : 'text-[#777777] group-hover:text-[#252525]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'
                  }`}
                />
              </div>

              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-[#285C4B] font-semibold' : 'text-[#777777]'
                }`}
              >
                {lang === 'th' ? tab.labelTh : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
