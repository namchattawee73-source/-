/**
 * SU Smart Transit - Header Component
 * Integrates directly with the parent SU Smart Campus design system.
 */

import React, { useState } from 'react';
import { ArrowLeft, MapPin, Globe, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onBackToMainApp: () => void;
  lang: 'th' | 'en';
  onToggleLang: () => void;
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onBackToMainApp,
  lang,
  onToggleLang,
  selectedCampus,
  onSelectCampus,
}) => {
  const [showCampusMenu, setShowCampusMenu] = useState(false);

  const campuses = [
    { id: 'sanam-chandra', nameTh: 'วิทยาเขตพระราชวังสนามจันทร์', nameEn: 'Sanam Chandra Palace' },
    { id: 'wang-tha-phra', nameTh: 'วิทยาเขตวังท่าพระ (กทม.)', nameEn: 'Wang Tha Phra Campus' },
    { id: 'phetchaburi', nameTh: 'วิทยาเขตสารสนเทศเพชรบุรี', nameEn: 'Phetchaburi IT Campus' },
  ];

  const currentCampusObj = campuses.find((c) => c.id === selectedCampus) || campuses[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top Safe Area & Parent Navigation Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Back Button to SU Smart Campus */}
        <button
          onClick={onBackToMainApp}
          className="flex items-center gap-1.5 text-xs font-medium text-[#40826D] hover:text-[#285C4B] active:scale-95 transition-all p-1 -ml-1 rounded-lg"
          aria-label="Back to SU Smart Campus"
        >
          <div className="w-7 h-7 rounded-full bg-[#EAF3EF] flex items-center justify-center text-[#40826D]">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <div className="text-left">
            <span className="block text-[10px] text-[#777777] leading-none">กลับสู่แอปหลัก</span>
            <span className="font-semibold text-xs text-[#285C4B]">SU Smart Campus</span>
          </div>
        </button>

        {/* Right Action: Language Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 text-xs font-semibold text-[#555555] hover:border-[#40826D] hover:text-[#40826D] transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#40826D]" />
            <span>{lang === 'th' ? 'EN' : 'TH'}</span>
          </button>
        </div>
      </div>

      {/* App Branding & Campus Dropdown */}
      <div className="px-4 pb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#40826D] inline-block" />
            <h1 className="text-lg font-bold text-[#252525] tracking-tight">
              SU Smart Transit
            </h1>
          </div>
          
          {/* Campus Selector Dropdown */}
          <div className="relative mt-0.5">
            <button
              onClick={() => setShowCampusMenu(!showCampusMenu)}
              className="flex items-center gap-1 text-[11px] text-[#777777] hover:text-[#252525] transition-colors py-0.5"
            >
              <MapPin className="w-3 h-3 text-[#40826D]" />
              <span className="font-medium text-[#40826D]">
                {lang === 'th' ? currentCampusObj.nameTh : currentCampusObj.nameEn}
              </span>
              <ChevronDown className="w-3 h-3 text-[#777777]" />
            </button>

            {showCampusMenu && (
              <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-[#777777] uppercase tracking-wider">
                  {lang === 'th' ? 'เลือกวิทยาเขต' : 'Select Campus'}
                </div>
                {campuses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCampus(c.id);
                      setShowCampusMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                      selectedCampus === c.id
                        ? 'bg-[#EAF3EF] text-[#285C4B] font-semibold'
                        : 'text-[#252525] hover:bg-slate-50'
                    }`}
                  >
                    <span>{lang === 'th' ? c.nameTh : c.nameEn}</span>
                    {selectedCampus === c.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#40826D]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Shuttle Tram Badge */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF3EF] text-[10px] font-semibold text-[#285C4B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#40826D] animate-pulse" />
            <span>รถรางไฟฟ้าบริการฟรี</span>
          </div>
          <div className="text-[10px] text-[#777777] mt-0.5">
            06:30 - 21:00 น.
          </div>
        </div>
      </div>
    </header>
  );
};
