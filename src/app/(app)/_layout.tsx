import * as Linking from 'expo-linking';
import * as QuickActions from 'expo-quick-actions';
import { useRouter } from 'expo-router';
import React from 'react';
import { Stack } from 'expo-router/stack';

import { resolveNoCopyRouteHrefFromSystemPath } from '@/features/no/deep-links';
import { ensureNoReasonWidgetSnapshot } from '@/features/no/widget-sync';
import { noPalette } from '@/features/no/theme';
import { useMountEffect } from '@/hooks/useMountEffect';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function AppLayout() {
  const router = useRouter();
  const lastHandledWidgetLaunchRef = React.useRef<string | null>(null);

  const routeNoCopyLaunch = React.useEffectEvent((url: string | null | undefined) => {
    if (!url) {
      console.log('[PocketNo] routeNoCopyLaunch skipped: empty url');
      return;
    }

    const href = resolveNoCopyRouteHrefFromSystemPath(url);
    if (!href) {
      console.log('[PocketNo] routeNoCopyLaunch skipped: no copy href', { url });
      return;
    }

    const launchKey = `${href.params.entry}:${href.params.launchId}`;
    if (lastHandledWidgetLaunchRef.current === launchKey) {
      console.log('[PocketNo] routeNoCopyLaunch skipped: duplicate launch', { launchKey });
      return;
    }

    console.log('[PocketNo] routeNoCopyLaunch pushing href', { url, href, launchKey });
    lastHandledWidgetLaunchRef.current = launchKey;
    router.push(href);
  });

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
        },
      ]);
    } catch (error) {
      console.warn('Failed to configure quick actions', error);
    }
  });

  useMountEffect(() => {
    void prepareNativeSurfaces();

    if (process.env.EXPO_OS === 'web') {
      return;
    }

    let isMounted = true;
    void Linking.getInitialURL().then((url) => {
      if (!isMounted) {
        return;
      }

      console.log('[PocketNo] Linking.getInitialURL resolved', { url });
      routeNoCopyLaunch(url);
    });

    const urlSubscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[PocketNo] Linking url event', { url });
      routeNoCopyLaunch(url);
    });

    return () => {
      isMounted = false;
      urlSubscription.remove();
    };
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
