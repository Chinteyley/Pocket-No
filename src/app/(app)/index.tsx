import * as Haptics from 'expo-haptics';
import * as QuickActions from 'expo-quick-actions';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
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
const HOME_NEW_BUTTON_PROGRESS_DELAY_MS = 450;
const HOME_COPY_BUTTON_PROGRESS_DELAY_MS = 180;

export default function PocketNoHomeScreen() {
  const insets = useSafeAreaInsets();
  const textCy   = useSharedValue(0.44);
  const textRy   = useSharedValue(0.10);
  const textRx   = useSharedValue(0.42);
  const textFill = useSharedValue(0);
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [busyAction, setBusyAction] = React.useState<'copy' | 'another' | 'loading' | null>('loading');
  const [showCopySuccess, setShowCopySuccess] = React.useState(false);
  const copySuccessTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyInFlight = React.useRef(false);
  const anotherInFlight = React.useRef(false);

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

  const waitForCopyButtonProgressBeat = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, HOME_COPY_BUTTON_PROGRESS_DELAY_MS);
    });
  };

  const handleCopy = React.useEffectEvent(async () => {
    if (copyInFlight.current) return;
    copyInFlight.current = true;
    hideCopySuccess();
    setBusyAction('copy');
    try {
      if (reason) {
        await Promise.all([copyNoReasonToClipboard(reason), waitForCopyButtonProgressBeat()]);
      } else {
        const [nextReason] = await Promise.all([fetchFreshNoReason(), waitForCopyButtonProgressBeat()]);
        React.startTransition(() => setReason(nextReason));
        await copyNoReasonToClipboard(nextReason);
      }
      flashCopied();
    } finally {
      setBusyAction(null);
      copyInFlight.current = false;
    }
  });

  const handleAnotherOne = React.useEffectEvent(async () => {
    if (anotherInFlight.current) return;
    anotherInFlight.current = true;
    hideCopySuccess();
    setBusyAction('another');
    // Matrix floods in to wipe old text
    textFill.value = withTiming(1, { duration: 380 });
    try {
      const [nextReason] = await Promise.all([fetchFreshNoReason(), waitForButtonProgressBeat()]);
      React.startTransition(() => setReason(nextReason));
      // Matrix retreats to reveal new text
      textFill.value = withTiming(0, { duration: 420 });
      if (process.env.EXPO_OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } finally {
      setBusyAction(null);
      anotherInFlight.current = false;
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

  const handleQuickCopy = React.useEffectEvent(async () => {
    hideCopySuccess();
    setBusyAction('another');
    textFill.value = withTiming(1, { duration: 380 });

    try {
      const nextReason = await fetchFreshNoReason();
      React.startTransition(() => setReason(nextReason));
      textFill.value = withTiming(0, { duration: 420 });
      await copyNoReasonToClipboard(nextReason);
      flashCopied();
    } finally {
      setBusyAction(null);
    }
  });

  useMountEffect(() => {
    void loadInitialReason();

    const subscription = QuickActions.addListener((action) => {
      if (action.id === 'random-no') {
        void handleQuickCopy();
      }
    });

    return () => {
      clearCopySuccessTimer();
      subscription.remove();
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: noPalette.paper }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ReasonCard
          reason={reason}
          isLoading={busyAction === 'loading' && reason === null}
          loadingLabel="Loading your next excuse..."
          copyDisabled={busyAction !== null || showCopySuccess}
          copyState={showCopySuccess ? 'success' : 'idle'}
          onLongPress={reason ? () => void handleCopy() : undefined}
          onTextMeasure={(cy, ry, rx) => {
            textCy.value = withSpring(cy, { damping: 18, stiffness: 80 });
            textRy.value = withSpring(ry, { damping: 18, stiffness: 80 });
            textRx.value = withSpring(rx, { damping: 18, stiffness: 80 });
          }}
        />
      </View>

      <AmbientBackground textCy={textCy} textRy={textRy} textRx={textRx} textFill={textFill} />

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
            successLabel="Copied!"
            labelMinWidth={68}
            onPress={() => void handleCopy()}
            loading={busyAction === 'copy'}
            disabled={busyAction !== null || showCopySuccess}
            tone="primary"
          />
          <ActionButton
            label="New"
            icon="arrow.clockwise"
            onPress={() => void handleAnotherOne()}
            loading={busyAction === 'another'}
            loadingIconMotion="rotate"
            loadingPalette={{
              backgroundColor: '#f9efe8',
              borderColor: 'rgba(232, 108, 47, 0.18)',
              textColor: noPalette.ink,
              iconTint: noPalette.accent,
              hintColor: noPalette.subtleInk,
            }}
            loadingAnimationSpec={null}
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
