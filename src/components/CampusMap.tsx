/**
 * SU Smart Transit - Interactive Campus Map Component
 * Silpakorn University Sanam Chandra Palace Campus
 */

import React, { useState, useRef, useEffect } from 'react';
import { BusStop, TransitRoute, ShuttleBus } from '../types/transit';
import { SU_BUS_STOPS, SU_ROUTES } from '../data/transitData';
import { Navigation, ZoomIn, ZoomOut, Layers, Compass, Info, Check } from 'lucide-react';

interface CampusMapProps {
  buses: ShuttleBus[];
  selectedBusId?: string | null;
  selectedStopId?: string | null;
  selectedRouteId?: string | null;
  onSelectBus: (bus: ShuttleBus) => void;
  onSelectStop: (stop: BusStop) => void;
  onSelectRouteFilter?: (routeId: string | null) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  buses,
  selectedBusId,
  selectedStopId,
  selectedRouteId,
  onSelectBus,
  onSelectStop,
  onSelectRouteFilter,
}) => {
  // Pan and zoom states
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showSimInfo, setShowSimInfo] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Center on selected bus or stop when changed
  useEffect(() => {
    if (selectedBusId) {
      const bus = buses.find((b) => b.id === selectedBusId);
      if (bus) {
        // Map viewBox is 1000x1000, center is 500,500
        const targetX = (500 - bus.currentPosition.x) * 0.45;
        const targetY = (500 - bus.currentPosition.y) * 0.45;
        setPan({ x: targetX, y: targetY });
        setZoom(1.35);
      }
    }
  }, [selectedBusId]);

  useEffect(() => {
    if (selectedStopId) {
      const stop = SU_BUS_STOPS.find((s) => s.id === selectedStopId);
      if (stop) {
        const targetX = (500 - stop.position.x) * 0.45;
        const targetY = (500 - stop.position.y) * 0.45;
        setPan({ x: targetX, y: targetY });
        setZoom(1.35);
      }
    }
  }, [selectedStopId]);

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(2.2, Math.max(0.85, prev + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Convert route coordinates to SVG path string
  const getRouteSvgPath = (route: TransitRoute) => {
    if (route.pathCoordinates.length === 0) return '';
    return route.pathCoordinates.reduce((acc, pt, index) => {
      return index === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  };

  // Filtered routes
  const visibleRoutes = selectedRouteId
    ? SU_ROUTES.filter((r) => r.id === selectedRouteId)
    : SU_ROUTES;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[380px] bg-[#F4F7F5] overflow-hidden select-none cursor-grab active:cursor-grabbing rounded-2xl border border-slate-100"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Simulation Notice Disclaimer Banner */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
        <div
          onClick={() => setShowSimInfo(!showSimInfo)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-slate-200/80 text-[11px] font-medium text-[#252525] hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#40826D] shrink-0" />
          <span className="font-semibold text-[#40826D]">จำลองการเดินรถ (Simulated GPS)</span>
          <Info className="w-3.5 h-3.5 text-[#777777]" />
        </div>

        {/* Layer Filter Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-200 flex items-center justify-center text-[#252525] hover:bg-slate-50 transition-colors"
            title="เลือกสายรถ"
            aria-label="Filter Routes"
          >
            <Layers className="w-4 h-4 text-[#40826D]" />
          </button>

          {/* Layer Selection Dropdown */}
          {showLayerMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#777777] uppercase tracking-wider">
                กรองสายรถราง SU
              </div>
              <button
                onClick={() => {
                  onSelectRouteFilter?.(null);
                  setShowLayerMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors ${
                  !selectedRouteId ? 'bg-[#EAF3EF] text-[#285C4B] font-medium' : 'text-[#252525] hover:bg-slate-50'
                }`}
              >
                <span>แสดงทุกสาย (All Routes)</span>
                {!selectedRouteId && <Check className="w-3.5 h-3.5 text-[#40826D]" />}
              </button>
              {SU_ROUTES.map((route) => (
                <button
                  key={route.id}
                  onClick={() => {
                    onSelectRouteFilter?.(route.id);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors ${
                    selectedRouteId === route.id ? 'bg-[#EAF3EF] text-[#285C4B] font-medium' : 'text-[#252525] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="truncate max-w-[120px]">{route.nameTh.split(':')[0]}</span>
                  </div>
                  {selectedRouteId === route.id && <Check className="w-3.5 h-3.5 text-[#40826D]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simulated GPS Info Box Modal */}
      {showSimInfo && (
        <div className="absolute top-12 left-3 right-3 z-30 p-3 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-md text-xs text-[#252525]">
          <div className="flex items-start justify-between">
            <span className="font-semibold text-[#285C4B]">ระบบแจ้งสถานะการจำลอง</span>
            <button
              onClick={() => setShowSimInfo(false)}
              className="text-[#777777] hover:text-[#252525] text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-[11px] text-[#555555] leading-relaxed">
            ตำแหน่งรถและเวลาถึงป้าย (ETA) คำนวณจากตารางเวลาเดินรถจำลองของมหาวิทยาลัยศิลปากร
            เพื่อเป็นต้นแบบทดสอบการใช้งาน ไม่ได้เชื่อมต่อข้อมูล GPS ดาวเทียมจริง
          </p>
        </div>
      )}

      {/* Floating Map Zoom / Reset Controls */}
      <div className="absolute bottom-4 right-3 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => handleZoom(0.25)}
          className="w-9 h-9 rounded-full bg-white/95 shadow-sm border border-slate-200 flex items-center justify-center text-[#252525] hover:bg-slate-50 active:scale-95 transition-transform"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.25)}
          className="w-9 h-9 rounded-full bg-white/95 shadow-sm border border-slate-200 flex items-center justify-center text-[#252525] hover:bg-slate-50 active:scale-95 transition-transform"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="w-9 h-9 rounded-full bg-white/95 shadow-sm border border-slate-200 flex items-center justify-center text-[#40826D] hover:bg-slate-50 active:scale-95 transition-transform"
          aria-label="Reset Map"
          title="จัดกึ่งกลางแผนที่"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Campus Map SVG Canvas */}
      <div
        className="w-full h-full origin-center transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft Shadow for bus markers */}
            <filter id="busShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
            </filter>
            <filter id="stopShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.18" />
            </filter>

            {/* Veridian Gradient for campus zones */}
            <linearGradient id="lakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9E6DC" />
              <stop offset="100%" stopColor="#A8D6C6" />
            </linearGradient>
            <linearGradient id="parkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EBF5EE" />
              <stop offset="100%" stopColor="#D9EBDD" />
            </linearGradient>
          </defs>

          {/* Background Canvas: Campus Area */}
          <rect x="0" y="0" width="1000" height="1000" fill="#F4F7F5" />

          {/* Sanam Chandra Palace Green Park Area */}
          <path
            d="M 50 850 L 150 960 L 300 950 L 320 860 L 220 780 Z"
            fill="url(#parkGrad)"
            stroke="#C3DDCB"
            strokeWidth="1.5"
          />
          <text x="140" y="900" fill="#5E8C73" fontSize="13" fontWeight="600" className="select-none">
            พระราชวังสนามจันทร์
          </text>

          {/* Sa Kaeo Lake (สระแก้ว) */}
          <ellipse
            cx="440"
            cy="440"
            rx="110"
            ry="75"
            fill="url(#lakeGrad)"
            stroke="#7CBBA8"
            strokeWidth="2"
          />
          {/* Sa Kaeo Island & Pavilion */}
          <circle cx="440" cy="440" r="18" fill="#D2E8DF" stroke="#40826D" strokeWidth="1.5" />
          <text x="440" y="444" fill="#285C4B" fontSize="11" fontWeight="600" textAnchor="middle" className="select-none">
            สระแก้ว
          </text>

          {/* University Main Stadium & Sports Field */}
          <rect
            x="130"
            y="490"
            width="100"
            height="65"
            rx="20"
            fill="#E2EBE5"
            stroke="#BFD5C6"
            strokeWidth="1.5"
          />
          <text x="180" y="527" fill="#587E69" fontSize="10" fontWeight="500" textAnchor="middle" className="select-none">
            สนามกีฬากลาง
          </text>

          {/* Faculty Zones & Buildings Representation */}
          {/* Central Library */}
          <rect x="300" y="615" width="75" height="45" rx="6" fill="#FFFFFF" stroke="#D1DDD6" strokeWidth="1.5" />
          <text x="337" y="642" fill="#555555" fontSize="10" fontWeight="600" textAnchor="middle">
            หอสมุดกลาง
          </text>

          {/* Faculty of Arts */}
          <rect x="460" y="585" width="70" height="45" rx="6" fill="#FFFFFF" stroke="#D1DDD6" strokeWidth="1.5" />
          <text x="495" y="612" fill="#555555" fontSize="10" fontWeight="600" textAnchor="middle">
            คณะอักษรฯ
          </text>

          {/* Faculty of Science */}
          <rect x="635" y="525" width="75" height="50" rx="6" fill="#FFFFFF" stroke="#D1DDD6" strokeWidth="1.5" />
          <text x="672" y="555" fill="#555555" fontSize="10" fontWeight="600" textAnchor="middle">
            คณะวิทย์ฯ
          </text>

          {/* Faculty of Engineering */}
          <rect x="770" y="415" width="75" height="50" rx="6" fill="#FFFFFF" stroke="#D1DDD6" strokeWidth="1.5" />
          <text x="807" y="445" fill="#555555" fontSize="10" fontWeight="600" textAnchor="middle">
            คณะวิศวะฯ
          </text>

          {/* Monument Plaza (Silpa Bhirasri) */}
          <circle cx="740" cy="290" r="28" fill="#FCE7F3" stroke="#F472B6" strokeWidth="1.5" />
          <text x="740" y="294" fill="#9D174D" fontSize="9" fontWeight="700" textAnchor="middle">
            ศ.ศิลป์
          </text>

          {/* Faculty of Pharmacy */}
          <rect x="525" y="225" width="75" height="45" rx="6" fill="#FFFFFF" stroke="#D1DDD6" strokeWidth="1.5" />
          <text x="562" y="252" fill="#555555" fontSize="10" fontWeight="600" textAnchor="middle">
            เภสัชฯ
          </text>

          {/* Petcharat Cafeteria */}
          <rect x="350" y="255" width="70" height="45" rx="6" fill="#FEF3C7" stroke="#FBBF24" strokeWidth="1.5" />
          <text x="385" y="282" fill="#92400E" fontSize="10" fontWeight="600" textAnchor="middle">
            โรงอาหาร
          </text>

          {/* Student Dormitories */}
          <rect x="200" y="325" width="75" height="50" rx="6" fill="#FFFFFF" stroke="#D1DDD6" strokeWidth="1.5" />
          <text x="237" y="355" fill="#555555" fontSize="10" fontWeight="600" textAnchor="middle">
            หอพัก 1-5
          </text>

          {/* Complex Center */}
          <rect x="260" y="745" width="80" height="45" rx="6" fill="#FFFFFF" stroke="#D1DDD6" strokeWidth="1.5" />
          <text x="300" y="772" fill="#555555" fontSize="10" fontWeight="600" textAnchor="middle">
            Complex
          </text>

          {/* Nakhon Pathom Railway Station external zone */}
          <rect x="830" y="810" width="110" height="55" rx="8" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
          <text x="885" y="842" fill="#1E40AF" fontSize="10" fontWeight="600" textAnchor="middle">
            สถานีรถไฟ นฐ.
          </text>

          {/* Campus Road Network (Asphalt lines) */}
          <path
            d="M 120 780 L 890 840 M 180 780 L 160 920 M 180 780 L 340 640 L 490 610 L 670 550 L 810 440 L 740 290 L 560 250 L 380 280 L 230 350 L 190 520 L 180 780 M 340 640 L 420 470 L 380 280 M 300 770 L 340 640"
            fill="none"
            stroke="#E0E6E2"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Transit Route Polylines */}
          {visibleRoutes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            const pathD = getRouteSvgPath(route);
            return (
              <g key={route.id}>
                {/* Route Casing / Border */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? 10 : 8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.9}
                />
                {/* Route Colored Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={route.color}
                  strokeWidth={isSelected ? 6 : 4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={route.id === 'route-3' ? '10 6' : undefined}
                  opacity={selectedRouteId && !isSelected ? 0.35 : 0.9}
                />
              </g>
            );
          })}

          {/* Bus Stop Pins */}
          {SU_BUS_STOPS.map((stop) => {
            const isSelected = selectedStopId === stop.id;
            const hasApproachingBus = buses.some(
              (b) => b.nextStopId === stop.id && b.status === 'approaching_stop'
            );

            return (
              <g
                key={stop.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStop(stop);
                }}
                className="cursor-pointer group"
                transform={`translate(${stop.position.x}, ${stop.position.y})`}
              >
                {/* Pulse Ring for approaching bus */}
                {hasApproachingBus && (
                  <circle
                    r="18"
                    fill="none"
                    stroke="#40826D"
                    strokeWidth="2"
                    className="animate-ping"
                    opacity="0.6"
                  />
                )}

                {/* Stop Marker Background */}
                <circle
                  r={isSelected ? 12 : 9}
                  fill={isSelected ? '#40826D' : '#FFFFFF'}
                  stroke={isSelected ? '#285C4B' : '#40826D'}
                  strokeWidth="2.5"
                  filter="url(#stopShadow)"
                  className="transition-all duration-200 group-hover:scale-125"
                />

                {/* Inner Stop Dot */}
                <circle
                  r={isSelected ? 5 : 3.5}
                  fill={isSelected ? '#FFFFFF' : '#40826D'}
                />

                {/* Short Stop Code Label on map */}
                <text
                  y={isSelected ? -16 : -13}
                  textAnchor="middle"
                  fill="#252525"
                  fontSize={isSelected ? "11" : "9"}
                  fontWeight={isSelected ? "700" : "600"}
                  className="pointer-events-none select-none"
                >
                  {stop.code}
                </text>
              </g>
            );
          })}

          {/* Simulated User Location Pin (near Central Library) */}
          <g transform="translate(325, 680)">
            <circle r="14" fill="#3B82F6" opacity="0.2" className="animate-pulse" />
            <circle r="6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="16" fill="#1E40AF" fontSize="8" fontWeight="600" textAnchor="middle">
              ตำแหน่งคุณ
            </text>
          </g>

          {/* Moving Buses */}
          {buses.map((bus) => {
            const route = SU_ROUTES.find((r) => r.id === bus.routeId);
            const isSelected = selectedBusId === bus.id;
            const busColor = route ? route.color : '#40826D';

            return (
              <g
                key={bus.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBus(bus);
                }}
                className="cursor-pointer group"
                transform={`translate(${bus.currentPosition.x}, ${bus.currentPosition.y})`}
              >
                {/* Approaching beacon animation */}
                {bus.status === 'approaching_stop' && (
                  <circle
                    r="24"
                    fill={busColor}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Bus marker body */}
                <g filter="url(#busShadow)">
                  <circle
                    r={isSelected ? 16 : 13}
                    fill={busColor}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200 group-hover:scale-115"
                  />

                  {/* Heading indicator arrow */}
                  <g transform={`rotate(${bus.headingAngle})`}>
                    <polygon
                      points="0,-16 -4,-11 4,-11"
                      fill={busColor}
                      stroke="#FFFFFF"
                      strokeWidth="1"
                    />
                  </g>

                  {/* Bus Icon / Number text */}
                  <text
                    y="4"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isSelected ? "9" : "8"}
                    fontWeight="800"
                    className="pointer-events-none select-none tracking-tighter"
                  >
                    {bus.busNumber.replace('EV-', '')}
                  </text>
                </g>

                {/* Small bus tag on hover/selected */}
                <g transform="translate(0, 24)">
                  <rect
                    x="-24"
                    y="-8"
                    width="48"
                    height="16"
                    rx="4"
                    fill="#252525"
                    opacity="0.88"
                  />
                  <text
                    y="3"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="8"
                    fontWeight="600"
                  >
                    {bus.busNumber}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend Overlay at Bottom Left */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-auto bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-sm flex items-center gap-3 text-[10px] text-[#555555]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#40826D]" />
          <span>สาย 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
          <span>สาย 2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          <span>สาย 3</span>
        </div>
      </div>
    </div>
  );
};
