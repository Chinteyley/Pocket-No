import * as Haptics from 'expo-haptics';
import * as QuickActions from 'expo-quick-actions';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { ActionButton } from '@/components/no/action-button';
import { AmbientBackground } from '@/components/no/ambient-background';
import { ReasonCard } from '@/components/no/reason-card';
import {
  copyNoReasonToClipboard,
  fetchFreshNoReason,
} from '@/features/no/no-reason-service';
import type { NoReason } from '@/features/no/contracts';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useCSSVariable } from 'uniwind';

const HOME_REASON_TRANSITION_DELAY_MS = 240;
const HOME_NEW_BUTTON_PROGRESS_DELAY_MS = 450;
const HOME_COPY_BUTTON_PROGRESS_DELAY_MS = 180;

export default function PocketNoHomeScreen() {
  const inkColor = useCSSVariable('--color-ink') as string;
  const accentColor = useCSSVariable('--color-accent') as string;
  const subtleInkColor = useCSSVariable('--color-subtle-ink') as string;
  const loadingSurfaceColor = useCSSVariable('--color-loading-surface') as string;
  const loadingBorderColor = useCSSVariable('--color-loading-border') as string;

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
    <View className="flex-1 bg-paper">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 pt-safe">
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
        className="mx-5 mb-safe-offset-4 rounded-[28px] border border-outline bg-warm-surface px-3.5 pt-3.5 pb-2.5"
        style={{ boxShadow: '0 18px 42px rgba(0,0,0,0.06)' }}>
        <View className="flex-row gap-2.5">
          <ActionButton
            fill
            label="Copy"
            icon="doc.on.doc"
            success={showCopySuccess}
            successLabel="Copied!"
            labelMinWidth={68}
            onPress={() => void handleCopy()}
            disabled={busyAction !== null || showCopySuccess}
            tone="primary"
          />
          <ActionButton
            fill
            label="New"
            icon="arrow.clockwise"
            onPress={() => void handleAnotherOne()}
            loading={busyAction === 'another'}
            loadingIconMotion="rotate"
            loadingPalette={{
              backgroundColor: loadingSurfaceColor,
              borderColor: loadingBorderColor,
              textColor: inkColor,
              iconTint: accentColor,
              hintColor: subtleInkColor,
            }}
            loadingAnimationSpec={null}
            disabled={busyAction !== null}
            tone="secondary"
          />
        </View>
        <View
          pointerEvents="none"
          className="items-center pt-2.5">
          <View className="w-11 h-[5px] rounded-full bg-outline" />
        </View>
      </View>
    </View>
  );
}
