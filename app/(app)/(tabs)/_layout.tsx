// ============================================================
// app/(app)/(tabs)/_layout.tsx — Main Driver Bottom Tab Navigator
// ============================================================

import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../hooks/useThemeColors';

function TabIcon({
  name,
  focused,
  label,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
  color: string;
}) {
  return (
    <View
      style={[styles.iconContainer, focused ? styles.iconFocused : null]}
      accessibilityLabel={label}
    >
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: colors.surface,
      borderTopColor: colors.surfaceBorder,
      height: 56 + Math.max(insets.bottom, 8),
      paddingBottom: Math.max(insets.bottom, 8),
      paddingTop: 8,
    }),
    [colors, insets.bottom]
  );

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarAccessibilityLabel: 'Dashboard tab',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Dashboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: 'My Route',
          tabBarAccessibilityLabel: 'My Route tab',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'map' : 'map-outline'} focused={focused} label="My Route" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: 'Trips',
          tabBarAccessibilityLabel: 'Trips tab',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'bus' : 'bus-outline'} focused={focused} label="Trips" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarAccessibilityLabel: 'Alerts tab',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? 'notifications' : 'notifications-outline'}
              focused={focused}
              label="Alerts"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconFocused: {
    backgroundColor: 'rgba(29, 158, 117, 0.2)',
  },
});
