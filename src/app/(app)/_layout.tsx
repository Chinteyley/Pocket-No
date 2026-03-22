import * as QuickActions from 'expo-quick-actions';
import { useQuickActionRouting } from 'expo-quick-actions/router';
import React from 'react';
import { Stack } from 'expo-router/stack';

import { buildCopyHref } from '@/features/no/deep-links';
import { ensureNoReasonWidgetSnapshot } from '@/features/no/widget-sync';
import { noPalette } from '@/features/no/theme';
import { useMountEffect } from '@/hooks/useMountEffect';

export default function AppLayout() {
  useQuickActionRouting();

  const prepareNativeSurfaces = React.useEffectEvent(async () => {
    await ensureNoReasonWidgetSnapshot();

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
          params: { href: buildCopyHref('quick-action') },
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
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: noPalette.paper },
        headerStyle: { backgroundColor: noPalette.paper },
        headerTintColor: noPalette.ink,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: noPalette.paper },
      }}>
      <Stack.Screen name="index" options={{ title: 'Pocket-No' }} />
      <Stack.Screen name="copy" options={{ title: 'Quick Copy', headerLargeTitle: false }} />
    </Stack>
  );
}
