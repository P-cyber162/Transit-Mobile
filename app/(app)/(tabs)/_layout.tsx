// ============================================================
// app/(app)/(tabs)/_layout.tsx — Main Driver Bottom Tab Navigator
// ============================================================

import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../hooks/useThemeColors';

function TabIcon({ emoji, focused, label }: { emoji: string; focused: boolean; label: string }) {
  return (
    <View
      style={[styles.iconContainer, focused ? styles.iconFocused : null]}
      accessibilityLabel={label}
    >
      <Text style={styles.emojiText}>{emoji}</Text>
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
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} label="Dashboard" />,
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: 'My Route',
          tabBarAccessibilityLabel: 'My Route tab',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} label="My Route" />,
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: 'Trips',
          tabBarAccessibilityLabel: 'Trips tab',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚌" focused={focused} label="Trips" />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarAccessibilityLabel: 'Alerts tab',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} label="Alerts" />,
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
  emojiText: {
    fontSize: 18,
  },
});
