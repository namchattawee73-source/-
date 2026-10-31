/**
 * SU Smart Transit - Routes View (Tab 2)
 * Displays university shuttle routes, route details, and stop sequences.
 */

import React, { useState } from 'react';
import { TransitRoute, ShuttleBus, BusStop } from '../types/transit';
import { SU_ROUTES, SU_BUS_STOPS } from '../data/transitData';
import { Route as RouteIcon, Clock, MapPin, ArrowRight, CheckCircle2, ChevronRight, Navigation } from 'lucide-react';

interface RoutesViewProps {
  buses: ShuttleBus[];
  onSelectRouteOnMap: (routeId: string) => void;
  onSelectStop: (stop: BusStop) => void;
  lang: 'th' | 'en';
}

export const RoutesView: React.FC<RoutesViewProps> = ({
  buses,
  onSelectRouteOnMap,
  onSelectStop,
  lang,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(SU_ROUTES[0].id);

  const selectedRoute = SU_ROUTES.find((r) => r.id === selectedRouteId) || SU_ROUTES[0];
  const activeBusesOnRoute = buses.filter((b) => b.routeId === selectedRoute.id);

  // Stop objects in sequence
  const routeStops = selectedRoute.stopIds
    .map((id) => SU_BUS_STOPS.find((s) => s.id === id))
    .filter((s): s is BusStop => !!s);

  return (
    <div className="pb-24 px-4 space-y-4 pt-2">
      {/* Route Switcher Segmented Cards */}
      <div>
        <h2 className="text-sm font-bold text-[#252525] mb-2">
          {lang === 'th' ? 'เลือกสายรถรางมหาวิทยาลัย' : 'Select Campus Route'}
        </h2>

        <div className="space-y-2.5">
          {SU_ROUTES.map((route) => {
            const isSelected = route.id === selectedRouteId;
            const busCount = buses.filter((b) => b.routeId === route.id).length;

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#40826D] ring-2 ring-[#40826D]/20 shadow-sm'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
                      style={{ backgroundColor: route.color }}
                    >
                      {route.routeNumber}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-[#252525]">
                        {lang === 'th' ? route.nameTh : route.nameEn}
                      </h3>
                      <p className="text-[11px] text-[#777777] mt-0.5 line-clamp-1">
                        {lang === 'th' ? route.descriptionTh : route.descriptionEn}
                      </p>
                    </div>
                  </div>

                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: route.lightColor,
                      color: route.darkColor,
                    }}
                  >
                    {busCount} คันวิ่งอยู่
                  </span>
                </div>

                {/* Micro Stats */}
                <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[11px] text-[#555555]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#40826D]" />
                    <span>ความถี่ทุก {route.frequencyMinutes.peak}-{route.frequencyMinutes.normal} นาที</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>ระยะทาง {route.totalDistanceKm} กม. (~{route.loopDurationMinutes} นาที/รอบ)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Route Detailed Inspector */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedRoute.color }}
              />
              <h3 className="text-sm font-bold text-[#252525]">
                {lang === 'th' ? selectedRoute.nameTh : selectedRoute.nameEn}
              </h3>
            </div>
            <p className="text-xs text-[#777777] mt-0.5">
              เวลาทำการ: {selectedRoute.operatingHours.weekday}
            </p>
          </div>

          <button
            onClick={() => onSelectRouteOnMap(selectedRoute.id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EAF3EF] text-[#285C4B] hover:bg-[#d8ebe2] active:scale-95 text-xs font-semibold transition-all shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-[#40826D]" />
            <span>ดูบนแผนที่</span>
          </button>
        </div>

        {/* Active Buses Banner */}
        <div className="mt-3 p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[#777777] block text-[10px]">รถที่กำลังวิ่งในสายนี้</span>
            <span className="font-semibold text-[#252525]">
              {activeBusesOnRoute.length > 0
                ? activeBusesOnRoute.map((b) => b.busNumber).join(', ')
                : 'ไม่มีรถวิ่งในขณะนี้'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#777777] block">ความถี่รอบปกติ</span>
            <span className="font-bold text-[#40826D] tabular-nums">
              ทุก {selectedRoute.frequencyMinutes.normal} นาที
            </span>
          </div>
        </div>

        {/* Stop Sequence Timeline */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-[#252525] mb-3">
            {lang === 'th' ? 'ลำดับจุดจอดตามเส้นทาง' : 'Stop Sequence Along Route'} ({routeStops.length} จุด)
          </h4>

          <div className="relative pl-6 space-y-4">
            {/* Continuous Vertical Route Line */}
            <div
              className="absolute left-[11px] top-2 bottom-2 w-0.5"
              style={{ backgroundColor: selectedRoute.color }}
            />

            {routeStops.map((stop, index) => {
              // Check if any bus is currently at or approaching this stop
              const approachingBus = activeBusesOnRoute.find(
                (b) => b.nextStopId === stop.id
              );

              return (
                <div
                  key={`${stop.id}-${index}`}
                  onClick={() => onSelectStop(stop)}
                  className="relative group cursor-pointer flex items-start justify-between"
                >
                  {/* Timeline Circle */}
                  <div
                    className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white transition-transform group-hover:scale-125 ${
                      approachingBus ? 'ring-4 ring-emerald-100' : ''
                    }`}
                    style={{ borderColor: selectedRoute.color }}
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#252525] group-hover:text-[#40826D] transition-colors">
                        {lang === 'th' ? stop.nameTh : stop.nameEn}
                      </span>
                      <span className="text-[10px] text-[#777777]">({stop.code})</span>
                    </div>

                    <div className="text-[11px] text-[#777777]">
                      {lang === 'th' ? stop.nearbyLandmarkTh : stop.nearbyLandmarkEn}
                    </div>

                    {/* Active Bus Indicator Tag on timeline */}
                    {approachingBus && (
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>
                          {approachingBus.busNumber} กำลังจะถึงใน ~
                          {Math.max(1, Math.round(approachingBus.etaNextStopSeconds / 60))} นาที
                        </span>
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
