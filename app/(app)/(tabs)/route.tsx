// ============================================================
// app/(app)/(tabs)/route.tsx — My Route & Interactive Map
// Ported from Maps/index.jsx in web app with React Native Maps
// ============================================================

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { routesService } from '../../../services/routes';
import { spacing, borderRadius } from '../../../theme';
import { useThemeColors } from '../../../hooks/useThemeColors';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Route, RouteStop } from '../../../types';
import { KNUST_CENTER_COORDS } from '../../../constants';
import { useRefresh } from '../../../hooks/useRefresh';

export default function RouteScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRouteData = useCallback(async () => {
    setError(null);
    try {
      const [fetchedRoutes, fetchedStops] = await Promise.all([
        routesService.getRoutes(),
        routesService.getStops(),
      ]);

      setRoutes(fetchedRoutes);
      setStops(fetchedStops);
      if (fetchedRoutes.length > 0) {
        setSelectedRoute((prev) => {
          if (prev && fetchedRoutes.some((r) => r.id === prev.id)) return prev;
          return fetchedRoutes[0];
        });
      } else {
        setSelectedRoute(null);
      }
    } catch {
      setRoutes([]);
      setStops([]);
      setSelectedRoute(null);
      setError('Unable to load routes. Pull to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRouteData();
  }, [loadRouteData]);

  const { refreshing, onRefresh } = useRefresh(loadRouteData);

  const stopCoordMap = useMemo(() => routesService.buildStopCoordMap(stops), [stops]);

  const currentRouteStops = selectedRoute
    ? [
        selectedRoute.startStop,
        ...selectedRoute.intermediateStops.filter(
          (s) => s !== selectedRoute.startStop && s !== selectedRoute.endStop
        ),
        ...(selectedRoute.endStop && selectedRoute.endStop !== selectedRoute.startStop
          ? [selectedRoute.endStop]
          : []),
      ]
    : [];

  const polylineCoords = currentRouteStops
    .map((stopName) => {
      const s = stopCoordMap[stopName];
      return s ? { latitude: s.lat, longitude: s.lng } : null;
    })
    .filter((c): c is { latitude: number; longitude: number } => c !== null);

  return (
    <View style={styles.container}>
      {/* ── Top Bar Header ─────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <Text style={styles.headerTitle}>My Route</Text>
        <Text style={styles.headerSub}>KNUST Campus Transit Network</Text>
      </View>

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {loading && !refreshing ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Loading routes…</Text>
          </Card>
        ) : error ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>⚠️</Text>
            <Text style={styles.emptyTitle}>{error}</Text>
            <Button title="RETRY" variant="primary" size="sm" onPress={loadRouteData} style={{ marginTop: 12 }} />
          </Card>
        ) : routes.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>No routes available</Text>
            <Text style={styles.emptyDesc}>Routes assigned by dispatch will appear here.</Text>
          </Card>
        ) : (
          <>
        {/* ── Route Selection Selector ─────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectorScroll}
          contentContainerStyle={styles.selectorContainer}
        >
          {routes.map((r) => {
            const isSelected = selectedRoute?.id === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => setSelectedRoute(r)}
                style={[
                  styles.routeChip,
                  isSelected ? { backgroundColor: r.color } : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select route ${r.number}`}
              >
                <Text
                  style={[
                    styles.routeChipText,
                    isSelected ? { color: colors.white } : null,
                  ]}
                >
                  {r.number}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Selected Route Info Header Card ─────────────── */}
        {selectedRoute && (
          <Card style={styles.routeHeaderCard}>
            <View style={styles.cardRow}>
              <View style={styles.titleGroup}>
                <View style={[styles.colorIndicator, { backgroundColor: selectedRoute.color }]} />
                <View>
                  <Text style={styles.routeNameText}>{selectedRoute.name}</Text>
                  <Text style={styles.routeMetaText}>
                    {selectedRoute.type} · {selectedRoute.frequency} min frequency · {selectedRoute.buses} active buses
                  </Text>
                </View>
              </View>
              <Badge label={selectedRoute.status} status={selectedRoute.status} />
            </View>
          </Card>
        )}

        {/* ── Interactive Map Frame ────────────────────────── */}
        <Card style={styles.mapCard}>
          {polylineCoords.length === 0 ? (
            <View style={styles.mapEmpty}>
              <Text style={styles.emptyTitle}>Map geometry unavailable</Text>
              <Text style={styles.emptyDesc}>Stop coordinates were not returned for this route.</Text>
            </View>
          ) : (
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={KNUST_CENTER_COORDS}
          >
            {polylineCoords.length > 0 && (
              <Polyline
                coordinates={polylineCoords}
                strokeColor={selectedRoute?.color || colors.primary}
                strokeWidth={4}
              />
            )}

            {currentRouteStops.map((stopName, index) => {
              const coords = stopCoordMap[stopName];
              if (!coords) return null;

              const isTerminal = index === 0 || index === currentRouteStops.length - 1;
              const stopMeta = stops.find((s) => s.name === stopName);

              return (
                <Marker
                  key={`${stopName}-${index}`}
                  coordinate={{ latitude: coords.lat, longitude: coords.lng }}
                  title={stopName}
                  description={`Stop #${index + 1}${stopMeta?.riders ? ` • Avg riders: ${stopMeta.riders}` : ''}`}
                  pinColor={isTerminal ? selectedRoute?.color || colors.primary : '#3B82F6'}
                />
              );
            })}
          </MapView>
          )}
        </Card>

        {/* ── Stop Timeline ─────────────── */}
        <Text style={styles.sectionTitle}>Route Stops</Text>
        <Card style={styles.timelineCard}>
          {currentRouteStops.length === 0 ? (
            <Text style={styles.emptyDesc}>No stops listed for this route.</Text>
          ) : (
          currentRouteStops.map((stopName, index) => {
            const isFirst = index === 0;
            const isLast = index === currentRouteStops.length - 1;

            return (
              <View key={`${stopName}-${index}`} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <Text style={styles.timeText}>#{index + 1}</Text>
                </View>

                <View style={styles.timelineCenter}>
                  <View
                    style={[
                      styles.dot,
                      isFirst || isLast ? { backgroundColor: selectedRoute?.color || colors.primary } : null,
                    ]}
                  />
                  {!isLast && <View style={styles.line} />}
                </View>

                <View style={styles.timelineRight}>
                  <Text style={styles.stopNameText}>{stopName}</Text>
                  <Text style={styles.stopMetaText}>
                    {isFirst ? 'Start Terminal' : isLast ? 'End Terminal' : `Stop #${index + 1}`}
                  </Text>
                </View>
              </View>
            );
          })
          )}
        </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}



function makeStyles(colors: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex1: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: 40,
  },
  selectorScroll: {
    marginBottom: spacing.md,
  },
  selectorContainer: {
    gap: spacing.sm,
  },
  routeChip: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  routeChipText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  routeHeaderCard: {
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  colorIndicator: {
    width: 12,
    height: 40,
    borderRadius: 6,
  },
  routeNameText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  routeMetaText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  mapCard: {
    height: 220,
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  timelineCard: {
    padding: spacing.base,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 50,
  },
  timelineLeft: {
    width: 65,
    paddingTop: 2,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  timelineCenter: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceBorder,
    zIndex: 2,
  },
  dotCompleted: {
    backgroundColor: colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: -2,
  },
  lineCompleted: {
    backgroundColor: colors.primary,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 16,
  },
  stopNameText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  textCompleted: {
    color: colors.textMuted,
  },
  stopMetaText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
}
