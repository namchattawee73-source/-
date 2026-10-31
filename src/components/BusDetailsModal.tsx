/**
 * SU Smart Transit - Bus Details Modal / Sheet
 * Displays detailed information about a selected shuttle bus.
 */

import React from 'react';
import { ShuttleBus } from '../types/transit';
import { SU_ROUTES, SU_BUS_STOPS } from '../data/transitData';
import { X, BatteryCharging, Users, Gauge, Wind, Accessibility, Phone, MapPin, CheckCircle2 } from 'lucide-react';

interface BusDetailsModalProps {
  bus: ShuttleBus | null;
  onClose: () => void;
  lang: 'th' | 'en';
  onTrackOnMap?: (bus: ShuttleBus) => void;
}

export const BusDetailsModal: React.FC<BusDetailsModalProps> = ({
  bus,
  onClose,
  lang,
  onTrackOnMap,
}) => {
  if (!bus) return null;

  const route = SU_ROUTES.find((r) => r.id === bus.routeId);
  const nextStop = SU_BUS_STOPS.find((s) => s.id === bus.nextStopId);
  const occupancyPercent = Math.round((bus.passengerCount / bus.capacity) * 100);

  // Status mapping
  const statusLabels = {
    on_route: { th: 'กำลังวิ่งในเส้นทาง', en: 'On Route', color: 'text-emerald-700 bg-emerald-50' },
    approaching_stop: { th: 'กำลังเข้าจอด', en: 'Approaching Stop', color: 'text-amber-700 bg-amber-50' },
    at_station: { th: 'เทียบท่ารับ-ส่งผู้โดยสาร', en: 'At Station', color: 'text-[#285C4B] bg-[#EAF3EF]' },
    out_of_service: { th: 'งดให้บริการชั่วคราว', en: 'Out of Service', color: 'text-rose-700 bg-rose-50' },
  };

  const statusInfo = statusLabels[bus.status] || statusLabels.on_route;

  // Next 3 stops along the route
  const getUpcomingStops = () => {
    if (!route) return [];
    const stopIndex = route.stopIds.indexOf(bus.nextStopId);
    if (stopIndex === -1) return [];

    const upcoming = [];
    for (let i = 0; i < 3; i++) {
      const idx = (stopIndex + i) % route.stopIds.length;
      const stopObj = SU_BUS_STOPS.find((s) => s.id === route.stopIds[idx]);
      if (stopObj) {
        upcoming.push({
          stop: stopObj,
          etaMinutes: Math.max(1, Math.round(bus.etaNextStopSeconds / 60) + i * 3),
        });
      }
    }
    return upcoming;
  };

  const upcomingStops = getUpcomingStops();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle for Touch UI */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ backgroundColor: route ? route.color : '#40826D' }}
            >
              {bus.busNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#252525]">
                  รถชานชาลาไฟฟ้า {bus.busNumber}
                </h3>
              </div>
              <p className="text-xs text-[#777777]">
                {lang === 'th' ? route?.nameTh : route?.nameEn}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#777777] transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status & Next Stop ETA Hero Card */}
        <div className="mt-4 p-4 rounded-2xl bg-[#EAF3EF] border border-[#CDE5DB]/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#285C4B] uppercase tracking-wider">
              {lang === 'th' ? 'สถานะปัจจุบัน' : 'Current Status'}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
              {lang === 'th' ? statusInfo.th : statusInfo.en}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#555555]">
                {lang === 'th' ? 'ป้ายถัดไป' : 'Next Stop'}
              </span>
              <h4 className="text-sm font-bold text-[#252525] mt-0.5">
                {lang === 'th' ? nextStop?.nameTh : nextStop?.nameEn}
              </h4>
              <span className="text-[10px] text-[#777777]">
                รหัสป้าย: {nextStop?.code}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#555555]">
                {lang === 'th' ? 'ถึงในอีกประมาณ' : 'ETA'}
              </span>
              <div className="text-xl font-extrabold text-[#40826D] tabular-nums">
                {Math.max(1, Math.round(bus.etaNextStopSeconds / 60))}{' '}
                <span className="text-xs font-medium">{lang === 'th' ? 'นาที' : 'min'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1 text-[#777777] text-[11px] mb-1">
              <Users className="w-3.5 h-3.5 text-[#40826D]" />
              <span>ความหนาแน่น</span>
            </div>
            <div className="text-base font-bold text-[#252525] tabular-nums">
              {bus.passengerCount}/{bus.capacity}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  occupancyPercent > 80 ? 'bg-amber-500' : 'bg-[#40826D]'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1 text-[#777777] text-[11px] mb-1">
              <Gauge className="w-3.5 h-3.5 text-[#40826D]" />
              <span>ความเร็ว</span>
            </div>
            <div className="text-base font-bold text-[#252525] tabular-nums">
              {bus.speedKmH}{' '}
              <span className="text-[10px] font-normal text-[#777777]">กม./ชม.</span>
            </div>
            <div className="text-[10px] text-[#777777] mt-1">จำกัด 30 กม./ชม.</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1 text-[#777777] text-[11px] mb-1">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span>แบตเตอรี่ EV</span>
            </div>
            <div className="text-base font-bold text-emerald-700 tabular-nums">
              {bus.batteryLevel}%
            </div>
            <div className="text-[10px] text-emerald-600 mt-1">พร้อมใช้งาน</div>
          </div>
        </div>

        {/* Features / Amenities */}
        <div className="flex items-center justify-around py-3 mt-3 border-y border-slate-100 text-xs text-[#555555]">
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-[#40826D]" />
            <span>ปรับอากาศเย็นสบาย</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Accessibility className="w-4 h-4 text-[#40826D]" />
            <span>{bus.hasWheelchairRamp ? 'มีทางลาดวีลแชร์' : 'ชานชาลามาตรฐาน'}</span>
          </div>
        </div>

        {/* Driver Contact & License */}
        <div className="mt-3 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-[#252525]">พนักงานขับรถ: {bus.driverName}</div>
            <div className="text-[11px] text-[#777777]">ทะเบียน: {bus.plateNumber} · ติดต่อฉุกเฉิน มศก.</div>
          </div>
          <a
            href={`tel:${bus.driverPhone}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[#285C4B] font-medium hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-[#40826D]" />
            <span>โทร</span>
          </a>
        </div>

        {/* Upcoming Stops Timeline */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-[#252525] mb-2">
            {lang === 'th' ? 'ลำดับป้ายที่จะถึงถัดไป' : 'Upcoming Stops'}
          </h4>
          <div className="space-y-2">
            {upcomingStops.map((item, index) => (
              <div
                key={item.stop.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#EAF3EF] text-[#285C4B] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#252525]">
                      {lang === 'th' ? item.stop.nameTh : item.stop.nameEn}
                    </div>
                    <div className="text-[10px] text-[#777777]">
                      {lang === 'th' ? item.stop.nearbyLandmarkTh : item.stop.nearbyLandmarkEn}
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-bold text-[#40826D] tabular-nums shrink-0">
                  ~{item.etaMinutes} นาที
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button: Track on Map */}
        <button
          onClick={() => {
            onTrackOnMap?.(bus);
            onClose();
          }}
          className="w-full mt-4 h-11 bg-[#40826D] hover:bg-[#285C4B] active:scale-[0.98] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <MapPin className="w-4 h-4" />
          <span>{lang === 'th' ? 'ดูตำแหน่งคันนี้บนแผนที่' : 'Track on Map'}</span>
        </button>
      </div>
    </div>
  );
};
