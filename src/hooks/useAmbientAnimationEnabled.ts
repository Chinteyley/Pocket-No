import React from 'react';
import {
  AccessibilityInfo,
  AppState,
  type AppStateStatus,
} from 'react-native';

import { useMountEffect } from './useMountEffect';

function getInitialAppState(): AppStateStatus {
  return AppState.currentState ?? 'active';
}

export function useAmbientAnimationEnabled(screenIsActive = true) {
  const [appStateStatus, setAppStateStatus] = React.useState<AppStateStatus>(getInitialAppState);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = React.useState(false);

  const syncReducedMotionPreference = React.useEffectEvent(async () => {
    if (process.env.EXPO_OS === 'web') {
      return;
    }

    try {
      setIsReducedMotionEnabled(await AccessibilityInfo.isReduceMotionEnabled());
    } catch (error) {
      console.warn('Failed to read reduced motion preference', error);
    }
  });

  useMountEffect(() => {
    void syncReducedMotionPreference();

    const appStateSubscription = AppState.addEventListener('change', setAppStateStatus);
    const reduceMotionSubscription =
      process.env.EXPO_OS === 'web'
        ? null
        : AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReducedMotionEnabled);

    return () => {
      appStateSubscription.remove();
      reduceMotionSubscription?.remove();
    };
  });

  return screenIsActive && appStateStatus === 'active' && !isReducedMotionEnabled;
}
