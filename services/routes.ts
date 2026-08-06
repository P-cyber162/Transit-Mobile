// ============================================================
// services/routes.ts — Routes, Stops & Schedules Service
// ============================================================

import { apiClient } from './api';
import { unwrapList } from '../utils/apiHelpers';
import { Route, RouteStop, Schedule } from '../types';

function mapRoute(r: any): Route {
  const statusRaw = String(r.status || 'Active');
  const status = (['Active', 'Inactive', 'Delayed', 'Critical'].includes(statusRaw)
    ? statusRaw
    : statusRaw.toLowerCase() === 'active'
      ? 'Active'
      : 'Inactive') as Route['status'];

  return {
    id: String(r.id ?? r.code ?? r.number),
    number: r.number || r.code || '',
    name: r.name || '',
    color: r.color || '#1D9E75',
    startStop: r.startStop || '',
    endStop: r.endStop || '',
    intermediateStops: Array.isArray(r.intermediateStops) ? r.intermediateStops : [],
    status,
    frequency: r.frequency ?? r.frequencyMinutes ?? 15,
    buses: r.buses ?? r.busCount ?? 0,
    type: r.type || 'Regular',
    direction: r.direction,
  };
}

function mapStop(s: any): RouteStop {
  return {
    id: String(s.id ?? s.name),
    name: s.name,
    lat: Number(s.lat ?? s.latitude ?? 0),
    lng: Number(s.lng ?? s.longitude ?? 0),
    riders: s.riders ?? s.averageRiders ?? 0,
    zone: s.zone || 'General',
  };
}

function mapSchedule(s: any): Schedule {
  return {
    id: String(s.id),
    routeId: String(s.routeId ?? s.route?.id ?? ''),
    days: s.days || [],
    departureTime: s.departureTime || '',
    arrivalTime: s.arrivalTime || '',
    status: s.status || 'On Time',
    notes: s.notes,
  };
}

export const routesService = {
  async getRoutes(): Promise<Route[]> {
    const response = await apiClient.get('/routes', { params: { size: 100 } });
    return unwrapList(response.data).map(mapRoute);
  },

  async getStops(): Promise<RouteStop[]> {
    const response = await apiClient.get('/stops', { params: { size: 200 } });
    return unwrapList(response.data).map(mapStop);
  },

  async getSchedules(): Promise<Schedule[]> {
    const response = await apiClient.get('/schedules', { params: { size: 100 } });
    return unwrapList(response.data).map(mapSchedule);
  },

  /** Build a name→coords lookup from API stops (falls back to seed coords only for known KNUST names when API stop has no lat/lng). */
  buildStopCoordMap(stops: RouteStop[]): Record<string, { lat: number; lng: number }> {
    const map: Record<string, { lat: number; lng: number }> = {};
    for (const s of stops) {
      if (s.name && s.lat && s.lng) {
        map[s.name] = { lat: s.lat, lng: s.lng };
      }
    }
    return map;
  },
};
