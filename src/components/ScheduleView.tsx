/**
 * SU Smart Transit - Schedule View (Tab 3)
 * Displays campus bus timetables, operating hours, and departure countdowns.
 */

import React, { useState, useMemo } from 'react';
import { DepartureSchedule } from '../types/transit';
import { TIMETABLE_SCHEDULES, SU_ROUTES, SU_BUS_STOPS, CAMPUS_ANNOUNCEMENTS } from '../data/transitData';
import { Clock, Calendar, AlertCircle, Bell, Filter, Search, ChevronRight } from 'lucide-react';

interface ScheduleViewProps {
  lang: 'th' | 'en';
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ lang }) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-1');
  const [selectedDayType, setSelectedDayType] = useState<'weekday' | 'weekend'>('weekday');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const selectedRoute = SU_ROUTES.find((r) => r.id === selectedRouteId) || SU_ROUTES[0];

  // Filter timetable
  const filteredTimetable = useMemo(() => {
    return TIMETABLE_SCHEDULES.filter((item) => {
      if (item.routeId !== selectedRouteId) return false;

      // Day filter
      if (item.days !== 'all' && item.days !== selectedDayType) return false;

      // Time slot filter
      const hour = parseInt(item.departureTime.split(':')[0], 10);
      if (selectedTimeSlot === 'morning' && (hour < 6 || hour >= 12)) return false;
      if (selectedTimeSlot === 'afternoon' && (hour < 12 || hour >= 17)) return false;
      if (selectedTimeSlot === 'evening' && hour < 17) return false;

      return true;
    }).sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }, [selectedRouteId, selectedDayType, selectedTimeSlot]);

  // Find next upcoming departure based on simulated current time (12:15)
  const simulatedCurrentMinutes = 12 * 60 + 15;
  const nextDeparture = useMemo(() => {
    return filteredTimetable.find((item) => {
      const [h, m] = item.departureTime.split(':').map(Number);
      return h * 60 + m >= simulatedCurrentMinutes;
    }) || filteredTimetable[0];
  }, [filteredTimetable]);

  return (
    <div className="pb-24 px-4 space-y-4 pt-2">
      {/* Route Switcher Buttons */}
      <div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {SU_ROUTES.map((route) => {
            const isSelected = route.id === selectedRouteId;
            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-[#555555] hover:border-slate-300'
                }`}
                style={{
                  backgroundColor: isSelected ? route.color : undefined,
                  borderColor: isSelected ? route.color : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : route.color }}
                />
                <span>{route.nameTh.split(':')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Departure Hero Card */}
      {nextDeparture && (
        <div className="p-4 rounded-2xl bg-[#EAF3EF] border border-[#CDE5DB]/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#285C4B] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#40826D]" />
              <span>{lang === 'th' ? 'รถรอบถัดไปตามตาราง' : 'Next Scheduled Departure'}</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-[#285C4B] font-bold">
              {nextDeparture.isPeak ? 'ชั่วโมงเร่งด่วน' : 'รอบปกติ'}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-2xl font-extrabold text-[#285C4B] tabular-nums tracking-tight">
                {nextDeparture.departureTime} น.
              </div>
              <div className="text-xs text-[#555555] mt-0.5">
                ต้นทาง: {SU_BUS_STOPS.find((s) => s.id === nextDeparture.originStopId)?.nameTh}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#777777] block">ออกเดินทางในอีก</span>
              <span className="text-base font-bold text-[#40826D]">
                ~10-15 นาที
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Operating Hours Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#252525]">
              {lang === 'th' ? 'เวลาเปิดให้บริการ' : 'Operating Hours'}
            </h3>
            <p className="text-xs text-[#777777] mt-0.5">
              {lang === 'th' ? selectedRoute.nameTh : selectedRoute.nameEn}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
            เปิดให้บริการ
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <div className="text-[#777777] text-[11px]">วันจันทร์ - ศุกร์</div>
            <div className="font-bold text-[#252525] mt-0.5">
              {selectedRoute.operatingHours.weekday}
            </div>
            <div className="text-[10px] text-[#40826D] mt-0.5 font-medium">
              ทุก {selectedRoute.frequencyMinutes.peak} นาที (เร่งด่วน)
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <div className="text-[#777777] text-[11px]">วันเสาร์ - อาทิตย์ / นักขัตฯ</div>
            <div className="font-bold text-[#252525] mt-0.5">
              {selectedRoute.operatingHours.weekend}
            </div>
            <div className="text-[10px] text-[#40826D] mt-0.5 font-medium">
              ทุก {selectedRoute.frequencyMinutes.normal} นาที
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls: Day Type & Time of Day */}
      <div className="space-y-2">
        {/* Day Type Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSelectedDayType('weekday')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedDayType === 'weekday'
                ? 'bg-white text-[#285C4B] shadow-xs'
                : 'text-[#777777] hover:text-[#252525]'
            }`}
          >
            {lang === 'th' ? 'วันจันทร์ - ศุกร์ (วันเรียน)' : 'Weekdays'}
          </button>
          <button
            onClick={() => setSelectedDayType('weekend')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedDayType === 'weekend'
                ? 'bg-white text-[#285C4B] shadow-xs'
                : 'text-[#777777] hover:text-[#252525]'
            }`}
          >
            {lang === 'th' ? 'เสาร์ - อาทิตย์ / วันหยุด' : 'Weekends & Holidays'}
          </button>
        </div>

        {/* Time of Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedTimeSlot('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedTimeSlot === 'all'
                ? 'bg-[#40826D] text-white'
                : 'bg-white text-[#777777] border border-slate-200'
            }`}
          >
            {lang === 'th' ? 'ทุกช่วงเวลา' : 'All Times'}
          </button>
          <button
            onClick={() => setSelectedTimeSlot('morning')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedTimeSlot === 'morning'
                ? 'bg-[#40826D] text-white'
                : 'bg-white text-[#777777] border border-slate-200'
            }`}
          >
            {lang === 'th' ? 'ช่วงเช้า (06:00 - 12:00)' : 'Morning'}
          </button>
          <button
            onClick={() => setSelectedTimeSlot('afternoon')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedTimeSlot === 'afternoon'
                ? 'bg-[#40826D] text-white'
                : 'bg-white text-[#777777] border border-slate-200'
            }`}
          >
            {lang === 'th' ? 'ช่วงบ่าย (12:00 - 17:00)' : 'Afternoon'}
          </button>
          <button
            onClick={() => setSelectedTimeSlot('evening')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedTimeSlot === 'evening'
                ? 'bg-[#40826D] text-white'
                : 'bg-white text-[#777777] border border-slate-200'
            }`}
          >
            {lang === 'th' ? 'ช่วงเย็น-ค่ำ (17:00+)' : 'Evening'}
          </button>
        </div>
      </div>

      {/* Timetable List Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-[#252525]">
            {lang === 'th' ? 'รอบเวลาออกจากต้นทาง' : 'Departure Schedule'} ({filteredTimetable.length} รอบ)
          </h4>
          <span className="text-[10px] text-[#777777]">
            {selectedDayType === 'weekday' ? 'ตารางวันทำการ' : 'ตารางวันหยุด'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {filteredTimetable.map((item) => {
            const isNext = item.id === nextDeparture?.id;
            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isNext
                    ? 'border-[#40826D] bg-[#EAF3EF]/60 font-semibold'
                    : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#252525] tabular-nums">
                    {item.departureTime}
                  </span>
                  <span className="text-[10px] text-[#777777]">น.</span>
                </div>

                <div className="text-[10px]">
                  {item.isPeak ? (
                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                      เร่งด่วน
                    </span>
                  ) : (
                    <span className="text-slate-500">ปกติ</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campus Transit Announcements Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2.5">
          <Bell className="w-4 h-4 text-[#40826D]" />
          <h3 className="text-xs font-bold text-[#252525]">
            {lang === 'th' ? 'ประกาศการเดินรถ มศก.' : 'Campus Transit Notices'}
          </h3>
        </div>

        <div className="space-y-2">
          {CAMPUS_ANNOUNCEMENTS.map((ann) => (
            <div key={ann.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="font-semibold text-[#252525]">
                {lang === 'th' ? ann.titleTh : ann.titleEn}
              </div>
              <div className="text-[10px] text-[#777777] mt-1">{ann.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
