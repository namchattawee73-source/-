/**
 * SU Smart Transit - Live Tracking View (Tab 1)
 * Combines real-time map, bus status cards, stop search, and quick arrival countdowns.
 */

import React, { useState, useMemo } from 'react';
import { ShuttleBus, BusStop } from '../types/transit';
import { SU_BUS_STOPS, SU_ROUTES } from '../data/transitData';
import { CampusMap } from './CampusMap';
import { Search, Heart, MapPin, Users, ChevronRight, Clock, Sparkles } from 'lucide-react';

interface LiveTrackingViewProps {
  buses: ShuttleBus[];
  favoriteStopIds: string[];
  selectedBus: ShuttleBus | null;
  selectedStop: BusStop | null;
  selectedRouteFilter: string | null;
  onSelectBus: (bus: ShuttleBus) => void;
  onSelectStop: (stop: BusStop) => void;
  onSelectRouteFilter: (routeId: string | null) => void;
  lang: 'th' | 'en';
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  buses,
  favoriteStopIds,
  selectedBus,
  selectedStop,
  selectedRouteFilter,
  onSelectBus,
  onSelectStop,
  onSelectRouteFilter,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'favorites' | 'nearby'>('all');

  // Filtered stops based on search & tab
  const filteredStops = useMemo(() => {
    return SU_BUS_STOPS.filter((stop) => {
      // Tab filter
      if (activeFilterTab === 'favorites' && !favoriteStopIds.includes(stop.id)) {
        return false;
      }
      if (activeFilterTab === 'nearby') {
        // Highlight stops near central library & complex (closest to student center)
        const nearbyIds = ['stop-1', 'stop-2', 'stop-3', 'stop-11'];
        if (!nearbyIds.includes(stop.id)) return false;
      }

      // Route filter
      if (selectedRouteFilter && !stop.routes.includes(selectedRouteFilter)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          stop.nameTh.toLowerCase().includes(q) ||
          stop.nameEn.toLowerCase().includes(q) ||
          stop.code.toLowerCase().includes(q) ||
          stop.nearbyLandmarkTh.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [searchQuery, activeFilterTab, favoriteStopIds, selectedRouteFilter]);

  // Status badge helper
  const getStatusBadge = (status: ShuttleBus['status']) => {
    switch (status) {
      case 'approaching_stop':
        return { label: 'กำลังเข้าจอด', color: 'bg-amber-100 text-amber-800' };
      case 'at_station':
        return { label: 'เทียบท่ารับ-ส่ง', color: 'bg-[#EAF3EF] text-[#285C4B]' };
      case 'out_of_service':
        return { label: 'งดให้บริการ', color: 'bg-rose-100 text-rose-800' };
      default:
        return { label: 'กำลังวิ่งในเส้นทาง', color: 'bg-emerald-100 text-emerald-800' };
    }
  };

  return (
    <div className="pb-20 space-y-4">
      {/* Route Quick Filter Tabs */}
      <div className="px-4 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => onSelectRouteFilter(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              !selectedRouteFilter
                ? 'bg-[#40826D] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-[#555555] hover:border-slate-300'
            }`}
          >
            {lang === 'th' ? 'ทุกสาย (All Routes)' : 'All Routes'}
          </button>
          {SU_ROUTES.map((route) => {
            const isSelected = selectedRouteFilter === route.id;
            return (
              <button
                key={route.id}
                onClick={() => onSelectRouteFilter(route.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
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
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : route.color }}
                />
                <span>{route.nameTh.split(':')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Campus Map Viewport */}
      <div className="px-4">
        <div className="h-[310px] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white relative">
          <CampusMap
            buses={buses}
            selectedBusId={selectedBus?.id}
            selectedStopId={selectedStop?.id}
            selectedRouteId={selectedRouteFilter}
            onSelectBus={onSelectBus}
            onSelectStop={onSelectStop}
            onSelectRouteFilter={onSelectRouteFilter}
          />
        </div>
      </div>

      {/* Live Active Buses Carousel */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-[#252525]">
              {lang === 'th' ? 'รถที่กำลังให้บริการ' : 'Active Campus Shuttles'}
            </h2>
            <span className="text-xs text-[#777777] font-medium">({buses.length} คัน)</span>
          </div>
          <span className="text-[11px] text-[#40826D] font-medium">แตะเพื่อดูรายละเอียด</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          {buses.map((bus) => {
            const route = SU_ROUTES.find((r) => r.id === bus.routeId);
            const nextStop = SU_BUS_STOPS.find((s) => s.id === bus.nextStopId);
            const status = getStatusBadge(bus.status);
            const isSelected = selectedBus?.id === bus.id;

            return (
              <div
                key={bus.id}
                onClick={() => onSelectBus(bus)}
                className={`min-w-[210px] p-3 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs shrink-0 ${
                  isSelected
                    ? 'border-[#40826D] ring-2 ring-[#40826D]/20 shadow-md'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: route?.color || '#40826D' }}
                    >
                      {bus.busNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#252525]">
                        {route?.nameTh.split(':')[0]}
                      </div>
                      <div className="text-[10px] text-[#777777]">{bus.plateNumber}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#777777] block">ป้ายถัดไป</span>
                    <span className="font-semibold text-[#252525] truncate max-w-[110px] block">
                      {nextStop?.nameTh.split('(')[0]}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#777777] block">ถึงในอีก</span>
                    <span className="font-extrabold text-[#40826D] tabular-nums">
                      ~{Math.max(1, Math.round(bus.etaNextStopSeconds / 60))} นาที
                    </span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#777777]">
                  <Users className="w-3 h-3 text-[#40826D]" />
                  <span>ที่นั่ง: {bus.passengerCount}/{bus.capacity}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campus Bus Stops Section with Search & Filter */}
      <div className="px-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-[#252525]">
            {lang === 'th' ? 'จุดจอดรถชานชาลา (Bus Stops)' : 'Campus Bus Stops'}
          </h2>
          <span className="text-xs text-[#777777]">ทั้งหมด {SU_BUS_STOPS.length} จุด</span>
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'th'
                ? 'ค้นหาป้าย เช่น หอสมุด, วิทยาศาสตร์, หอพัก...'
                : 'Search stops (Library, Science, Dorms)...'
            }
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white border border-slate-200 text-xs text-[#252525] placeholder:text-slate-400 focus:outline-none focus:border-[#40826D] focus:ring-1 focus:ring-[#40826D] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#777777] hover:text-[#252525] p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Sub-Tabs */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeFilterTab === 'all'
                ? 'bg-[#EAF3EF] text-[#285C4B] font-semibold'
                : 'bg-white text-[#777777] border border-slate-200'
            }`}
          >
            {lang === 'th' ? 'ทุกจุดจอด' : 'All Stops'}
          </button>
          <button
            onClick={() => setActiveFilterTab('favorites')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeFilterTab === 'favorites'
                ? 'bg-[#EAF3EF] text-[#285C4B] font-semibold'
                : 'bg-white text-[#777777] border border-slate-200'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>{lang === 'th' ? 'ป้ายโปรด' : 'Favorites'} ({favoriteStopIds.length})</span>
          </button>
          <button
            onClick={() => setActiveFilterTab('nearby')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeFilterTab === 'nearby'
                ? 'bg-[#EAF3EF] text-[#285C4B] font-semibold'
                : 'bg-white text-[#777777] border border-slate-200'
            }`}
          >
            <MapPin className="w-3 h-3 text-[#40826D]" />
            <span>{lang === 'th' ? 'ใกล้จุดสำคัญ' : 'Key Hubs'}</span>
          </button>
        </div>

        {/* Stops List */}
        <div className="space-y-2">
          {filteredStops.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-[#777777]">
              {lang === 'th'
                ? 'ไม่พบจุดจอดที่ตรงกับคำค้นหาของคุณ'
                : 'No bus stops matching your search'}
            </div>
          ) : (
            filteredStops.map((stop) => {
              const isFav = favoriteStopIds.includes(stop.id);
              const isSelected = selectedStop?.id === stop.id;

              return (
                <div
                  key={stop.id}
                  onClick={() => onSelectStop(stop)}
                  className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[#40826D] ring-2 ring-[#40826D]/20 shadow-sm'
                      : 'border-slate-100 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF3EF] text-[#285C4B] font-bold text-xs flex items-center justify-center shrink-0">
                      {stop.code}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-[#252525]">
                          {lang === 'th' ? stop.nameTh : stop.nameEn}
                        </h4>
                        {isFav && <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />}
                      </div>

                      <div className="text-[11px] text-[#777777] mt-0.5 truncate max-w-[210px]">
                        {lang === 'th' ? stop.nearbyLandmarkTh : stop.nearbyLandmarkEn}
                      </div>

                      <div className="flex items-center gap-1 mt-1">
                        {stop.routes.map((rId) => {
                          const r = SU_ROUTES.find((item) => item.id === rId);
                          return (
                            <span
                              key={rId}
                              className="text-[9px] font-semibold px-1.5 py-0.2 rounded text-white"
                              style={{ backgroundColor: r?.color || '#40826D' }}
                            >
                              {r?.nameTh.split(':')[0]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] text-[#777777]">แตะดูเวลา</div>
                      <div className="text-xs font-semibold text-[#40826D]">รายละเอียด</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
