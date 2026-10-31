/**
 * SU Smart Transit - Back to SU Smart Campus Confirmation Modal
 * Provides seamless bridge between SU Smart Transit and the parent SU Smart Campus prototype.
 */

import React, { useState } from 'react';
import { ArrowLeft, Check, Smartphone, ExternalLink, X } from 'lucide-react';

interface BackToAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'th' | 'en';
}

export const BackToAppModal: React.FC<BackToAppModalProps> = ({ isOpen, onClose, lang }) => {
  const [returned, setReturned] = useState(false);

  if (!isOpen) return null;

  const handleReturn = () => {
    setReturned(true);
    setTimeout(() => {
      setReturned(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {!returned ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3EF] text-[#40826D] flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#252525]">
              {lang === 'th' ? 'กลับสู่หน้าหลัก SU Smart Campus?' : 'Return to SU Smart Campus?'}
            </h3>

            <p className="text-xs text-[#777777] mt-1.5 leading-relaxed">
              {lang === 'th'
                ? 'คุณกำลังจะออกจากระบบ SU Smart Transit เพื่อกลับไปยังหน้าเมนูบริการหลักของแอปพลิเคชันมหาวิทยาลัยศิลปากร'
                : 'Returning to the main menu of the Silpakorn University Smart Campus application.'}
            </p>

            <div className="mt-5 space-y-2">
              <button
                onClick={handleReturn}
                className="w-full h-11 bg-[#40826D] hover:bg-[#285C4B] active:scale-[0.98] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'th' ? 'ยืนยันกลับสู่ SU Smart Campus' : 'Return to SU Smart Campus'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full h-10 bg-slate-100 hover:bg-slate-200 text-[#555555] font-medium text-xs rounded-xl transition-colors"
              >
                {lang === 'th' ? 'ใช้งาน SU Smart Transit ต่อ' : 'Stay on SU Smart Transit'}
              </button>
            </div>
          </>
        ) : (
          <div className="py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#252525]">
              {lang === 'th' ? 'เชื่อมต่อกลับสู่แอปหลักสำเร็จ' : 'Returned to Main Campus Portal'}
            </h4>
            <p className="text-xs text-[#777777] mt-1">
              {lang === 'th' ? 'ขอบคุณที่ใช้งานระบบขนส่งมหาวิทยาลัยศิลปากร' : 'Thank you for using Silpakorn Transit'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
