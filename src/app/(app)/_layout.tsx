import * as QuickActions from 'expo-quick-actions';
import React from 'react';
import { Stack } from 'expo-router/stack';

import { noPalette } from '@/features/no/theme';
import { useMountEffect } from '@/hooks/useMountEffect';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function AppLayout() {
  const prepareNativeSurfaces = React.useEffectEvent(async () => {
    if (process.env.EXPO_OS === 'web') {
      return;
    }

    try {
      const isSupported = await QuickActions.isSupported();
      if (!isSupported) {
        return;
      }

      await QuickActions.setItems([
        {
          id: 'random-no',
          title: 'Random No',
          subtitle: 'Copy one fast',
          icon: 'prohibit',
        },
      ]);
    } catch (error) {
      console.warn('Failed to configure quick actions', error);
    }
  });

  useMountEffect(() => {
    void prepareNativeSurfaces();
  });

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: noPalette.paper },
        headerTintColor: noPalette.ink,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: noPalette.paper },
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="copy"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: 'fitToContents',
          headerTransparent: true,
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  );
}
