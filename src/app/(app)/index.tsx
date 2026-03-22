import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/no/action-button';
import { AmbientBackground } from '@/components/no/ambient-background';
import { ReasonCard } from '@/components/no/reason-card';
import {
  copyNoReasonToClipboard,
  fetchFreshNoReason,
} from '@/features/no/no-reason-service';
import type { NoReason } from '@/features/no/contracts';
import { noPalette } from '@/features/no/theme';
import { useMountEffect } from '@/hooks/useMountEffect';

const HOME_REASON_TRANSITION_DELAY_MS = 240;
const HOME_NEW_BUTTON_PROGRESS_DELAY_MS = 260;

export default function PocketNoHomeScreen() {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [busyAction, setBusyAction] = React.useState<'copy' | 'another' | 'loading' | null>('loading');
  const [showCopySuccess, setShowCopySuccess] = React.useState(false);
  const copySuccessTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopySuccessTimer = () => {
    if (copySuccessTimeoutRef.current) {
      clearTimeout(copySuccessTimeoutRef.current);
      copySuccessTimeoutRef.current = null;
    }
  };

  const hideCopySuccess = () => {
    clearCopySuccessTimer();
    setShowCopySuccess(false);
  };

  const flashCopied = () => {
    clearCopySuccessTimer();
    setShowCopySuccess(true);
    copySuccessTimeoutRef.current = setTimeout(() => {
      copySuccessTimeoutRef.current = null;
      setShowCopySuccess(false);
    }, 1000);
  };

  const waitForTransitionBeat = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, HOME_REASON_TRANSITION_DELAY_MS);
    });
  };

  const waitForButtonProgressBeat = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, HOME_NEW_BUTTON_PROGRESS_DELAY_MS);
    });
  };

  const handleCopy = React.useEffectEvent(async () => {
    hideCopySuccess();
    setBusyAction('copy');
    try {
      if (reason) {
        await copyNoReasonToClipboard(reason);
      } else {
        const nextReason = await fetchFreshNoReason();
        React.startTransition(() => setReason(nextReason));
        await copyNoReasonToClipboard(nextReason);
      }
      if (process.env.EXPO_OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      flashCopied();
    } finally {
      setBusyAction(null);
    }
  });

  const handleAnotherOne = React.useEffectEvent(async () => {
    hideCopySuccess();
    setBusyAction('another');
    try {
      const [nextReason] = await Promise.all([fetchFreshNoReason(), waitForButtonProgressBeat()]);
      React.startTransition(() => setReason(nextReason));
      if (process.env.EXPO_OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } finally {
      setBusyAction(null);
    }
  });

  const loadInitialReason = React.useEffectEvent(async () => {
    hideCopySuccess();
    setBusyAction('loading');

    try {
      const [nextReason] = await Promise.all([fetchFreshNoReason(), waitForTransitionBeat()]);
      React.startTransition(() => setReason(nextReason));
    } finally {
      setBusyAction(null);
    }
  });

  useMountEffect(() => {
    void loadInitialReason();

    return () => {
      clearCopySuccessTimer();
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: noPalette.paper }}>
      <Stack.Screen options={{ headerShown: false }} />
      <AmbientBackground />

      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ReasonCard
          reason={reason}
          isLoading={busyAction === 'loading' && reason === null}
          loadingLabel="Loading your next excuse..."
          onLongPress={busyAction === null && reason ? () => void handleCopy() : undefined}
        />
      </View>

      <View
        style={{
          marginHorizontal: 20,
          marginBottom: insets.bottom + 16,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: noPalette.outline,
          backgroundColor: '#fff7ef',
          boxShadow: `0 18px 42px ${noPalette.shadowSoft}`,
          paddingHorizontal: 14,
          paddingTop: 14,
          paddingBottom: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
          }}>
          <ActionButton
            label="Copy"
            icon="doc.on.doc"
            success={showCopySuccess}
            successLabel="Copy"
            onPress={() => void handleCopy()}
            loading={busyAction === 'copy'}
            disabled={busyAction !== null}
            tone="primary"
          />
          <ActionButton
            label="New"
            icon="arrow.clockwise"
            onPress={() => void handleAnotherOne()}
            loading={busyAction === 'another'}
            loadingPalette={{
              backgroundColor: noPalette.accentWash,
              borderColor: 'rgba(232, 108, 47, 0.28)',
              textColor: noPalette.accent,
              iconTint: noPalette.accent,
              hintColor: noPalette.accent,
            }}
            loadingAnimationSpec={{
              effect: { type: 'scale', wholeSymbol: true },
              repeating: true,
            }}
            disabled={busyAction !== null}
            tone="secondary"
          />
        </View>
        <View
          pointerEvents="none"
          style={{
            alignItems: 'center',
            paddingTop: 10,
          }}>
          <View
            style={{
              width: 44,
              height: 5,
              borderRadius: 999,
              backgroundColor: 'rgba(17, 17, 17, 0.08)',
            }}
          />
        </View>
      </View>
    </View>
  );
}
