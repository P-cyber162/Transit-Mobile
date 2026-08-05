// ============================================================
// services/location.ts — Driver Live Location Service
// ============================================================

import { apiClient } from './api';
import { LocationCoordinates } from '../types';

export const locationService = {
  async sendLocation(coords: LocationCoordinates): Promise<boolean> {
    try {
      await apiClient.post('/drivers/me/location', {
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed: coords.speed ?? 0,
        heading: coords.heading ?? 0,
        accuracy: coords.accuracy ?? 0,
        timestamp: coords.timestamp ?? Date.now(),
      });
      return true;
    } catch {
      return false;
    }
  },
};
