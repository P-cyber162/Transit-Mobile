// ============================================================
// utils/locationTracker.ts — Expo Location Background / Interval Tracker
// ============================================================

import * as Location from 'expo-location';
import { locationService } from '../services/location';
import { LOCATION_TRACKING_INTERVAL_MS } from '../constants';

let trackingInterval: NodeJS.Timeout | null = null;

export const locationTracker = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  },

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return location.coords;
    } catch {
      return null;
    }
  },

  async startTracking(): Promise<boolean> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return false;

    if (trackingInterval) clearInterval(trackingInterval);

    // Immediate update
    this.sendCurrentLocation();

    // Periodical background timer
    trackingInterval = setInterval(() => {
      this.sendCurrentLocation();
    }, LOCATION_TRACKING_INTERVAL_MS);

    return true;
  },

  stopTracking() {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  },

  async sendCurrentLocation() {
    try {
      const coords = await this.getCurrentLocation();
      if (coords) {
        await locationService.sendLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          speed: coords.speed,
          heading: coords.heading,
          accuracy: coords.accuracy,
          timestamp: Date.now(),
        });
      }
    } catch {}
  },
};
