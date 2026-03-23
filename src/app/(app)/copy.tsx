import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { PlatformColor, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/no/action-button';
import {
  copyNoReasonToClipboard,
  fetchFreshNoReason,
} from '@/features/no/no-reason-service';
import type { NoReason } from '@/features/no/contracts';
import {
  resolveCopyLaunchId,
  resolveNoCopyEntry,
  type NoCopyEntry,
} from '@/features/no/deep-links';
import { noPalette } from '@/features/no/theme';
import { useMountEffect } from '@/hooks/useMountEffect';

type CopyFlowState = 'loading' | 'copied' | 'error';
const COPY_BUTTON_PROGRESS_DELAY_MS = 240;

const sheetTextColors = {
  primary: process.env.EXPO_OS === 'ios' ? PlatformColor('label') : noPalette.ink,
  secondary: process.env.EXPO_OS === 'ios' ? PlatformColor('secondaryLabel') : noPalette.subtleInk,
};

function CopyScreenContent({
  entry,
  launchId,
}: {
  entry: NoCopyEntry;
  launchId: string;
}) {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [state, setState] = React.useState<CopyFlowState>('loading');
  const [busyAction, setBusyAction] = React.useState<'copy-another' | null>(null);
  const [settling, setSettling] = React.useState(false);
  const copyInFlight = React.useRef(false);
  const settleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const waitForCopyButtonProgressBeat = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, COPY_BUTTON_PROGRESS_DELAY_MS);
    });
  };

  const runCopyFlow = React.useEffectEvent(async () => {
    if (copyInFlight.current) {
      return;
    }

    copyInFlight.current = true;
    setState('loading');

    try {
      const [nextReason] = await Promise.all([fetchFreshNoReason(), waitForCopyButtonProgressBeat()]);
      React.startTransition(() => setReason(nextReason));
      await copyNoReasonToClipboard(nextReason);
      setState('copied');
    } catch (error) {
      console.warn(`Failed quick copy handoff for ${entry}:${launchId}`, error);
      React.startTransition(() => setReason(null));
      setState('error');
    } finally {
      copyInFlight.current = false;
      setBusyAction(null);
      setSettling(true);
      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        setSettling(false);
      }, 800);
    }
  });

  const handleCopyAnother = React.useEffectEvent(async () => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
    setSettling(false);
    setBusyAction('copy-another');
    await runCopyFlow();
  });

  useMountEffect(() => {
    void runCopyFlow();
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  });

  const statusLabel = state === 'error' ? 'Could not copy a fresh no' : null;
  const displayText =
    state === 'error'
      ? 'Could not load a fresh no right now.'
      : reason?.text ?? 'Copying a fresh no...';

  return (
    <View
      style={{
        backgroundColor: 'transparent',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: Math.max(insets.bottom, 10),
        gap: 18,
      }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ gap: 14 }}>
        {statusLabel ? (
          <Animated.Text
            entering={FadeInDown.duration(220).delay(30)}
            selectable
            style={{
              fontSize: 13,
              fontWeight: '700',
              letterSpacing: -0.1,
              color: noPalette.accent,
            }}>
            {statusLabel}
          </Animated.Text>
        ) : null}

        <Animated.Text
          entering={FadeInDown.duration(240).delay(70)}
          selectable
          style={{
            fontSize: 31,
            lineHeight: 39,
            fontWeight: '800',
            letterSpacing: -1.1,
            color: sheetTextColors.primary,
          }}>
          {displayText}
        </Animated.Text>
      </View>

      <View
        style={{
          marginTop: 6,
          borderRadius: 20,
          borderCurve: 'continuous',
          width: '100%',
          overflow: 'hidden',
        }}>
        <ActionButton
          label={state === 'error' ? 'Try again' : 'Copy another'}
          icon="arrow.clockwise"
          labelMinWidth={108}
          onPress={() => void handleCopyAnother()}
          loading={busyAction === 'copy-another' || state === 'loading' || settling}
          loadingLabel="Copying..."
          loadingIconMotion="rotate-settle"
          disabled={busyAction !== null || state === 'loading' || settling}
          tone="primary"
        />
      </View>
    </View>
  );
}

export default function PocketNoCopyScreen() {
  const params = useLocalSearchParams<{
    entry?: string | string[];
    launchId?: string | string[];
  }>();
  const entry = resolveNoCopyEntry(params.entry);
  const launchId = resolveCopyLaunchId(params.launchId);

  return <CopyScreenContent key={launchId} entry={entry} launchId={launchId} />;
}
