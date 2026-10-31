/**
 * SU Smart Transit - Type Definitions
 * Silpakorn University Transit System
 */

export type BusStatus = 'on_route' | 'approaching_stop' | 'at_station' | 'out_of_service';

export interface LatLng {
  x: number; // Normalized campus coordinate X (0 - 1000)
  y: number; // Normalized campus coordinate Y (0 - 1000)
  lat?: number;
  lng?: number;
}

export interface BusStop {
  id: string;
  nameTh: string;
  nameEn: string;
  code: string;
  position: LatLng;
  routes: string[]; // Route IDs serving this stop
  nearbyLandmarkTh: string;
  nearbyLandmarkEn: string;
  facilities: {
    shelter: boolean;
    wheelchair: boolean;
    lighting: boolean;
    usbCharging: boolean;
    digitalScreen: boolean;
  };
}

export interface TransitRoute {
  id: string;
  routeNumber: string;
  nameTh: string;
  nameEn: string;
  color: string;
  darkColor: string;
  lightColor: string;
  descriptionTh: string;
  descriptionEn: string;
  stopIds: string[];
  pathCoordinates: LatLng[];
  operatingHours: {
    weekday: string;
    weekend: string;
  };
  frequencyMinutes: {
    peak: number;
    normal: number;
  };
  totalBuses: number;
  totalDistanceKm: number;
  loopDurationMinutes: number;
}

export interface ShuttleBus {
  id: string;
  busNumber: string; // e.g. "EV-01"
  plateNumber: string;
  routeId: string;
  currentPosition: LatLng;
  headingAngle: number; // 0-360 degrees
  status: BusStatus;
  currentStopId?: string;
  nextStopId: string;
  etaNextStopSeconds: number;
  speedKmH: number;
  passengerCount: number;
  capacity: number;
  driverName: string;
  driverPhone: string;
  batteryLevel: number;
  isAirConditioned: boolean;
  hasWheelchairRamp: boolean;
  lastUpdated: string;
}

export interface DepartureSchedule {
  id: string;
  routeId: string;
  departureTime: string; // "07:15"
  originStopId: string;
  destinationStopId: string;
  isPeak: boolean;
  days: 'all' | 'weekday' | 'weekend';
}

export interface StopArrivalETA {
  busId: string;
  busNumber: string;
  routeId: string;
  routeColor: string;
  etaMinutes: number;
  distanceMeters: number;
  status: BusStatus;
}
