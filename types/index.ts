// ============================================================
// types/index.ts — Domain Type Definitions for Driver Mobile App
// ============================================================

export type UserRole = 'ADMIN' | 'DRIVER';

export interface User {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId?: string;
  phone?: string;
  photoUrl?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  assignedDepot?: string;
  assignedVehicle?: string;
}

export interface AuthSession {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn?: number | null;
  expiresAt?: number | null;
  user: User | null;
}

export interface RouteStop {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  riders?: number;
  zone?: string;
  estimatedArrival?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

export interface Route {
  id: string;
  number: string;
  name: string;
  color: string;
  startStop: string;
  endStop: string;
  intermediateStops: string[];
  status: 'Active' | 'Inactive' | 'Delayed' | 'Critical';
  frequency: number;
  buses: number;
  type: string;
  direction?: string;
}

export interface Schedule {
  id: string;
  routeId: string;
  days: string[];
  departureTime: string;
  arrivalTime: string;
  status: 'Completed' | 'Running' | 'On Time' | 'Delayed' | 'Cancelled';
  notes?: string;
}

export type TripStatus = 'IDLE' | 'STARTED' | 'PAUSED' | 'RESUMED' | 'ENDED';

export interface Trip {
  id: string;
  routeId: string;
  routeName: string;
  routeNumber: string;
  busNumber: string;
  startTime?: string;
  endTime?: string;
  status: TripStatus;
  completedStopsCount: number;
  totalStopsCount: number;
  nextStopName?: string;
  elapsedSeconds: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  shiftDurationHours?: number;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_DUTY';
}

export type IncidentCategory = 
  | 'ACCIDENT'
  | 'TRAFFIC'
  | 'VEHICLE_BREAKDOWN'
  | 'PASSENGER_ISSUE'
  | 'ROAD_CLOSURE'
  | 'OTHER';

export interface IncidentReport {
  id?: string;
  category: IncidentCategory;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  photoUri?: string;
  status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED';
}

export interface OperationalNotification {
  id: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS';
  title: string;
  message: string;
  time: string;
  read: boolean;
  stopName?: string;
  routeNumber?: string;
}

export interface DriverShift {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  busNumber: string;
  routeNumber: string;
  routeName: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  timestamp?: number;
}
