import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLiveTranslation } from '@/hooks/useLiveTranslation';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={() => {
          const { text, translating } = useLiveTranslation('Home');
          return {
            title: translating ? '...' : text,
            tabBarIcon: ({ color }) => <IconSymbol name="house.fill" size={28} color={color} />,
          }
        }}
      />
      <Tabs.Screen
        name="languages"
        options={() => {
          const { text, translating } = useLiveTranslation('Languages');
          return {
            title: translating ? '...' : text,
            tabBarIcon: ({ color }) => <Ionicons name="language" size={28} color={color} />,
          }
        }}
      />
    </Tabs>
  );
}
