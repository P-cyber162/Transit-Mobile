// ============================================================
// hooks/useLocation.ts — Location tracking React hook
// ============================================================

import { useState, useEffect } from 'react';
import { locationTracker } from '../utils/locationTracker';
import { LocationCoordinates } from '../types';

export function useLocation(autoStart = false) {
  const [coords, setCoords] = useState<LocationCoordinates | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    locationTracker.requestPermissions().then((granted) => {
      setHasPermission(granted);
      if (granted) {
        locationTracker.getCurrentLocation().then((loc) => {
          if (loc) {
            setCoords({
              latitude: loc.latitude,
              longitude: loc.longitude,
              speed: loc.speed,
              heading: loc.heading,
              accuracy: loc.accuracy,
            });
          }
        });
      }
    });

    if (autoStart) {
      locationTracker.startTracking();
      return () => {
        locationTracker.stopTracking();
      };
    }
  }, [autoStart]);

  return {
    coords,
    hasPermission,
    startTracking: () => locationTracker.startTracking(),
    stopTracking: () => locationTracker.stopTracking(),
  };
}
