/**
 * SU Smart Transit - Stop Details Sheet
 * Displays bus arrivals, facilities, and favorite toggling for a campus stop.
 */

import React from 'react';
import { BusStop, StopArrivalETA } from '../types/transit';
import { SU_ROUTES } from '../data/transitData';
import { X, Heart, Navigation, ShieldCheck, Zap, Sun, Monitor, Clock, ArrowRight } from 'lucide-react';

interface StopDetailsSheetProps {
  stop: BusStop | null;
  arrivals: StopArrivalETA[];
  isFavorite: boolean;
  onToggleFavorite: (stopId: string) => void;
  onClose: () => void;
  lang: 'th' | 'en';
  onSelectBusById?: (busId: string) => void;
}

export const StopDetailsSheet: React.FC<StopDetailsSheetProps> = ({
  stop,
  arrivals,
  isFavorite,
  onToggleFavorite,
  onClose,
  lang,
  onSelectBusById,
}) => {
  if (!stop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#EAF3EF] text-[#285C4B] font-bold text-xs">
                {stop.code}
              </span>
              <h3 className="text-base font-bold text-[#252525]">
                {lang === 'th' ? stop.nameTh : stop.nameEn}
              </h3>
            </div>
            <p className="text-xs text-[#777777] mt-0.5">
              {lang === 'th' ? stop.nearbyLandmarkTh : stop.nearbyLandmarkEn}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(stop.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isFavorite
                  ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                  : 'bg-slate-100 text-[#777777] hover:bg-slate-200'
              }`}
              title={isFavorite ? 'ลบออกจากรายการโปรด' : 'บันทึกเป็นป้ายโปรด'}
              aria-label="Bookmark Stop"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#777777] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Walking Distance Banner */}
        <div className="mt-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#555555]">
            <Navigation className="w-3.5 h-3.5 text-[#40826D]" />
            <span>{lang === 'th' ? 'ระยะเดินจากจุดที่คุณอยู่' : 'Walking distance'}</span>
          </div>
          <span className="font-semibold text-[#252525]">~180 ม. (เดิน 2-3 นาที)</span>
        </div>

        {/* Live Arriving Buses Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-[#252525] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#40826D]" />
              <span>{lang === 'th' ? 'รถรางที่กำลังจะมาถึง' : 'Upcoming Shuttle Arrivals'}</span>
            </h4>
            <span className="text-[10px] text-[#777777]">อัปเดตสดแบบเรียลไทม์</span>
          </div>

          {arrivals.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#777777] bg-slate-50 rounded-xl border border-dashed border-slate-200">
              {lang === 'th'
                ? 'ยังไม่มีรถในระยะใกล้ (รถรอบถัดไปตามตารางเวลา)'
                : 'No buses approaching immediately'}
            </div>
          ) : (
            <div className="space-y-2">
              {arrivals.map((arr) => {
                const route = SU_ROUTES.find((r) => r.id === arr.routeId);
                return (
                  <div
                    key={arr.busId}
                    onClick={() => onSelectBusById?.(arr.busId)}
                    className="p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: arr.routeColor }}
                      >
                        {arr.busNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[#252525]">
                            {lang === 'th' ? route?.nameTh.split(':')[0] : route?.nameEn.split(':')[0]}
                          </span>
                          <span className="text-[10px] text-[#777777]">
                            · {arr.status === 'approaching_stop' ? 'กำลังเข้าจอด' : 'ในเส้นทาง'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#777777]">
                          ห่างประมาณ {arr.distanceMeters} เมตร
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-[#40826D] tabular-nums">
                          {arr.etaMinutes} <span className="text-[10px] font-normal">นาที</span>
                        </div>
                        <span className="text-[10px] text-[#777777]">โดยประมาณ</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stop Facilities / Amenities */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-[#252525] mb-2.5">
            {lang === 'th' ? 'สิ่งอำนวยความสะดวกที่จุดจอด' : 'Stop Amenities'}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#555555]">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-[#40826D]" />
              <span>{stop.facilities.shelter ? 'มีหลังคากันแดด-ฝน' : 'ไม่มีศาลา'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <Sun className="w-4 h-4 text-[#40826D]" />
              <span>{stop.facilities.lighting ? 'ไฟส่องสว่างโซลาร์' : 'ไม่มีไฟ'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <Zap className="w-4 h-4 text-[#40826D]" />
              <span>{stop.facilities.usbCharging ? 'จุดชาร์จ USB ฟรี' : 'ไม่มีจุดชาร์จ'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
              <Monitor className="w-4 h-4 text-[#40826D]" />
              <span>{stop.facilities.digitalScreen ? 'จอ LED แจ้งเวลา' : 'ป้ายข้อมูลมาตรฐาน'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
