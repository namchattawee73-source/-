/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBusSimulation } from './hooks/useBusSimulation';
import { BusStop, ShuttleBus } from './types/transit';
import { SU_BUS_STOPS } from './data/transitData';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { LiveTrackingView } from './components/LiveTrackingView';
import { RoutesView } from './components/RoutesView';
import { ScheduleView } from './components/ScheduleView';
import { BusDetailsModal } from './components/BusDetailsModal';
import { StopDetailsSheet } from './components/StopDetailsSheet';
import { BackToAppModal } from './components/BackToAppModal';
import { Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const {
    buses,
    getArrivalsForStop,
  } = useBusSimulation();

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('tracking');
  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [selectedCampus, setSelectedCampus] = useState<string>('sanam-chandra');

  // Modal & Selection state
  const [selectedBus, setSelectedBus] = useState<ShuttleBus | null>(null);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<string | null>(null);
  const [isBackModalOpen, setIsBackModalOpen] = useState<boolean>(false);

  // Desktop view toggle: iPhone 16 Plus mockup (430px) vs Expanded
  const [isDeviceMockupMode, setIsDeviceMockupMode] = useState<boolean>(true);

  // Favorite stops persistence in localStorage
  const [favoriteStopIds, setFavoriteStopIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('su_smart_transit_favorites');
      return saved ? JSON.parse(saved) : ['stop-1', 'stop-2', 'stop-9'];
    } catch {
      return ['stop-1', 'stop-2', 'stop-9'];
    }
  });

  const toggleFavoriteStop = (stopId: string) => {
    setFavoriteStopIds((prev) => {
      const next = prev.includes(stopId)
        ? prev.filter((id) => id !== stopId)
        : [...prev, stopId];
      try {
        localStorage.setItem('su_smart_transit_favorites', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Sync selected bus updates from simulation
  const currentLiveBus = selectedBus
    ? buses.find((b) => b.id === selectedBus.id) || selectedBus
    : null;

  // Handle route selection from RoutesView to jump to LiveTracking
  const handleSelectRouteOnMap = (routeId: string) => {
    setSelectedRouteFilter(routeId);
    setActiveTab('tracking');
  };

  // Handle bus track on map
  const handleTrackBusOnMap = (bus: ShuttleBus) => {
    setSelectedBus(bus);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-[#252525]">
      {/* Desktop Helper Bar (visible only on wide desktop screens) */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-4xl px-4 py-2 text-xs text-[#777777]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#40826D]" />
          <span className="font-semibold text-[#285C4B]">SU Smart Transit Preview</span>
          <span>· จำลองมุมมองหน้าจอ iPhone 16 Plus (430 × 932 px)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDeviceMockupMode(!isDeviceMockupMode)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[#252525] hover:bg-slate-50 transition-colors shadow-xs"
          >
            {isDeviceMockupMode ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#40826D]" />
                <span>ขยายเต็มหน้าจอ</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#40826D]" />
                <span>มุมมองกรอบมือถือ iPhone</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container - Responsive or iPhone 16 Plus Frame (430px max width) */}
      <main
        className={`w-full bg-white relative flex flex-col transition-all duration-300 min-h-screen ${
          isDeviceMockupMode
            ? 'max-w-[430px] my-0 lg:my-4 lg:rounded-[40px] lg:border-[8px] lg:border-slate-800 lg:shadow-2xl overflow-hidden'
            : 'max-w-2xl min-h-screen'
        }`}
        style={{
          minHeight: isDeviceMockupMode ? '932px' : '100vh',
        }}
      >
        {/* iPhone Speaker / Dynamic Island decorative bar for desktop mockup */}
        <div className="hidden lg:block w-full pt-2 pb-1 bg-white shrink-0 z-50">
          <div className="w-28 h-4 bg-slate-900 rounded-full mx-auto" />
        </div>

        {/* Top App Header with SU Smart Campus Back Navigation */}
        <Header
          onBackToMainApp={() => setIsBackModalOpen(true)}
          lang={lang}
          onToggleLang={() => setLang(lang === 'th' ? 'en' : 'th')}
          selectedCampus={selectedCampus}
          onSelectCampus={setSelectedCampus}
        />

        {/* View Content based on Tab */}
        <div className="flex-1 w-full bg-slate-50/50">
          {activeTab === 'tracking' && (
            <LiveTrackingView
              buses={buses}
              favoriteStopIds={favoriteStopIds}
              selectedBus={currentLiveBus}
              selectedStop={selectedStop}
              selectedRouteFilter={selectedRouteFilter}
              onSelectBus={(bus) => setSelectedBus(bus)}
              onSelectStop={(stop) => setSelectedStop(stop)}
              onSelectRouteFilter={(routeId) => setSelectedRouteFilter(routeId)}
              lang={lang}
            />
          )}

          {activeTab === 'routes' && (
            <RoutesView
              buses={buses}
              onSelectRouteOnMap={handleSelectRouteOnMap}
              onSelectStop={(stop) => setSelectedStop(stop)}
              lang={lang}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView lang={lang} />
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          lang={lang}
        />

        {/* Bus Details Modal */}
        <BusDetailsModal
          bus={currentLiveBus}
          onClose={() => setSelectedBus(null)}
          lang={lang}
          onTrackOnMap={handleTrackBusOnMap}
        />

        {/* Bus Stop Details Sheet */}
        <StopDetailsSheet
          stop={selectedStop}
          arrivals={selectedStop ? getArrivalsForStop(selectedStop.id) : []}
          isFavorite={selectedStop ? favoriteStopIds.includes(selectedStop.id) : false}
          onToggleFavorite={toggleFavoriteStop}
          onClose={() => setSelectedStop(null)}
          lang={lang}
          onSelectBusById={(busId) => {
            const found = buses.find((b) => b.id === busId);
            if (found) {
              setSelectedBus(found);
              setSelectedStop(null);
            }
          }}
        />

        {/* Back to SU Smart Campus Confirmation Modal */}
        <BackToAppModal
          isOpen={isBackModalOpen}
          onClose={() => setIsBackModalOpen(false)}
          lang={lang}
        />
      </main>
    </div>
  );
}
