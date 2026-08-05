// ============================================================
// services/trips.ts — Trip Management Service
// ============================================================

import { apiClient } from './api';
import { Trip, TripStatus } from '../types';

function mapTrip(t: any): Trip & { stops?: string[] } {
  return {
    id: String(t.id),
    routeId: String(t.routeId ?? ''),
    routeName: t.routeName || '',
    routeNumber: t.routeNumber || '',
    busNumber: t.busNumber || '',
    status: (t.status || 'IDLE') as TripStatus,
    completedStopsCount: t.completedStopsCount ?? 0,
    totalStopsCount: t.totalStopsCount ?? 0,
    nextStopName: t.nextStopName,
    elapsedSeconds: t.elapsedSeconds ?? 0,
    stops: Array.isArray(t.stops) ? t.stops : undefined,
  };
}

export const tripsService = {
  async getActiveTrip(): Promise<Trip> {
    const response = await apiClient.get('/drivers/me/trips/active');
    return mapTrip(response.data);
  },

  async updateTripStatus(_tripId: string, status: TripStatus): Promise<{ success: boolean; status: TripStatus }> {
    const response = await apiClient.post('/drivers/me/trips/status', { status });
    return { success: true, status: (response.data.status || status) as TripStatus };
  },

  async startTrip(tripId: string): Promise<TripStatus> {
    const res = await this.updateTripStatus(tripId, 'STARTED');
    return res.status;
  },

  async pauseTrip(tripId: string): Promise<TripStatus> {
    const res = await this.updateTripStatus(tripId, 'PAUSED');
    return res.status;
  },

  async resumeTrip(tripId: string): Promise<TripStatus> {
    const res = await this.updateTripStatus(tripId, 'RESUMED');
    return res.status;
  },

  async endTrip(tripId: string): Promise<TripStatus> {
    const res = await this.updateTripStatus(tripId, 'ENDED');
    return res.status;
  },
};
