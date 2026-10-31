/**
 * SU Smart Transit - Real-Time Bus Simulation Hook
 * Simulates realistic movement along campus route coordinates with ETA calculations.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ShuttleBus, BusStop, TransitRoute, StopArrivalETA, BusStatus } from '../types/transit';
import { INITIAL_BUSES, SU_BUS_STOPS, SU_ROUTES } from '../data/transitData';

interface BusSimulationState {
  busId: string;
  currentWaypointIndex: number;
  progressBetweenWaypoints: number; // 0 to 1
  dwellTimerSeconds: number; // For station stop dwell
}

export function useBusSimulation() {
  const [buses, setBuses] = useState<ShuttleBus[]>(INITIAL_BUSES);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // 1x or 2x

  // Internal animation state tracking
  const internalStateRef = useRef<Record<string, BusSimulationState>>({
    'bus-01': { busId: 'bus-01', currentWaypointIndex: 2, progressBetweenWaypoints: 0.2, dwellTimerSeconds: 0 },
    'bus-02': { busId: 'bus-02', currentWaypointIndex: 10, progressBetweenWaypoints: 0.5, dwellTimerSeconds: 0 },
    'bus-03': { busId: 'bus-03', currentWaypointIndex: 4, progressBetweenWaypoints: 0.1, dwellTimerSeconds: 0 },
    'bus-04': { busId: 'bus-04', currentWaypointIndex: 10, progressBetweenWaypoints: 0.9, dwellTimerSeconds: 6 },
    'bus-05': { busId: 'bus-05', currentWaypointIndex: 5, progressBetweenWaypoints: 0.4, dwellTimerSeconds: 0 },
  });

  useEffect(() => {
    if (!isSimulating) return;

    const intervalTimeMs = 1000;

    const timer = setInterval(() => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          const route = SU_ROUTES.find((r) => r.id === bus.routeId);
          if (!route || route.pathCoordinates.length < 2) return bus;

          const state = internalStateRef.current[bus.id] || {
            busId: bus.id,
            currentWaypointIndex: 0,
            progressBetweenWaypoints: 0,
            dwellTimerSeconds: 0,
          };

          const waypoints = route.pathCoordinates;
          const currIdx = state.currentWaypointIndex % waypoints.length;
          const nextIdx = (currIdx + 1) % waypoints.length;

          const ptA = waypoints[currIdx];
          const ptB = waypoints[nextIdx];

          // Check if currently dwelling at a stop
          if (state.dwellTimerSeconds > 0) {
            state.dwellTimerSeconds -= 1 * simulationSpeed;
            return {
              ...bus,
              status: 'at_station' as BusStatus,
              speedKmH: 0,
              etaNextStopSeconds: Math.max(0, bus.etaNextStopSeconds - 1),
            };
          }

          // Advance progress
          const delta = 0.08 * simulationSpeed;
          let newProgress = state.progressBetweenWaypoints + delta;
          let newWaypointIdx = currIdx;

          if (newProgress >= 1) {
            newProgress = 0;
            newWaypointIdx = nextIdx;

            // Random chance to dwell if near a stop
            const isNearStop = SU_BUS_STOPS.some((s) => {
              const dx = s.position.x - ptB.x;
              const dy = s.position.y - ptB.y;
              return Math.sqrt(dx * dx + dy * dy) < 30;
            });

            if (isNearStop && Math.random() > 0.4) {
              state.dwellTimerSeconds = 5; // dwell for 5 seconds
            }
          }

          state.currentWaypointIndex = newWaypointIdx;
          state.progressBetweenWaypoints = newProgress;

          // Interpolate current position
          const curA = waypoints[newWaypointIdx % waypoints.length];
          const curB = waypoints[(newWaypointIdx + 1) % waypoints.length];
          const curX = Math.round(curA.x + (curB.x - curA.x) * newProgress);
          const curY = Math.round(curA.y + (curB.y - curA.y) * newProgress);

          // Calculate heading angle
          const angleRad = Math.atan2(curB.y - curA.y, curB.x - curA.x);
          const headingDeg = Math.round((angleRad * 180) / Math.PI);

          // Find closest next stop along the route
          const stopsInRoute = route.stopIds
            .map((id) => SU_BUS_STOPS.find((s) => s.id === id))
            .filter((s): s is BusStop => !!s);

          // Determine next stop
          let closestStop = stopsInRoute[0];
          let minDist = 999999;
          stopsInRoute.forEach((s) => {
            const dx = s.position.x - curX;
            const dy = s.position.y - curY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist && dist > 15) {
              minDist = dist;
              closestStop = s;
            }
          });

          const isApproaching = minDist < 45;
          const status: BusStatus = isApproaching ? 'approaching_stop' : 'on_route';

          // Estimated ETA in seconds based on distance
          const etaSeconds = Math.max(25, Math.round((minDist / 20) * 45));

          // Realistic speed variation
          const baseSpeed = bus.routeId === 'route-3' ? 32 : 22;
          const randomSpeed = isApproaching ? 8 : Math.max(12, Math.round(baseSpeed + (Math.random() * 4 - 2)));

          // Realistic passenger adjustment
          let passengers = bus.passengerCount;
          if (state.dwellTimerSeconds === 5) {
            const deltaP = Math.floor(Math.random() * 5) - 2;
            passengers = Math.min(bus.capacity, Math.max(3, passengers + deltaP));
          }

          return {
            ...bus,
            currentPosition: { x: curX, y: curY },
            headingAngle: headingDeg,
            status,
            nextStopId: closestStop ? closestStop.id : bus.nextStopId,
            etaNextStopSeconds: etaSeconds,
            speedKmH: randomSpeed,
            passengerCount: passengers,
            lastUpdated: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          };
        });
      });
    }, intervalTimeMs);

    return () => clearInterval(timer);
  }, [isSimulating, simulationSpeed]);

  // Helper to get all arriving buses for a specific stop
  const getArrivalsForStop = useCallback(
    (stopId: string): StopArrivalETA[] => {
      const stop = SU_BUS_STOPS.find((s) => s.id === stopId);
      if (!stop) return [];

      const arrivals: StopArrivalETA[] = [];

      buses.forEach((bus) => {
        const route = SU_ROUTES.find((r) => r.id === bus.routeId);
        if (!route || !route.stopIds.includes(stopId)) return;

        // Calculate straight or route distance to stop
        const dx = stop.position.x - bus.currentPosition.x;
        const dy = stop.position.y - bus.currentPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Approximate ETA in minutes
        let etaMins = Math.max(1, Math.round((dist / 140) * 3));
        if (bus.nextStopId === stopId && bus.status === 'approaching_stop') {
          etaMins = 1;
        }

        arrivals.push({
          busId: bus.id,
          busNumber: bus.busNumber,
          routeId: bus.routeId,
          routeColor: route.color,
          etaMinutes: etaMins,
          distanceMeters: Math.round(dist * 2.8),
          status: bus.status,
        });
      });

      return arrivals.sort((a, b) => a.etaMinutes - b.etaMinutes);
    },
    [buses]
  );

  return {
    buses,
    isSimulating,
    simulationSpeed,
    toggleSimulation: () => setIsSimulating((prev) => !prev),
    setSimulationSpeed,
    getArrivalsForStop,
  };
}
