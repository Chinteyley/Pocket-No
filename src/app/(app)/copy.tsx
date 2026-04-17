import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, useColorScheme } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/no/action-button';
import { FavoriteButton } from '@/components/no/favorite-button';
import { GlassCapsule } from '@/components/no/glass-capsule';
import { ShareButton } from '@/components/no/share-button';
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
import { useMountEffect } from '@/hooks/useMountEffect';
import { useCSSVariable } from 'uniwind';

type CopyFlowState = 'idle' | 'loading' | 'copied' | 'error';
const COPY_BUTTON_PROGRESS_DELAY_MS = 240;
const COPY_SUCCESS_FLASH_MS = 900;
const COPY_REASON_LINE_HEIGHT = 39;
const COPY_REASON_MAX_LINES = 4;
const COPY_REASON_BLOCK_MIN_HEIGHT = COPY_REASON_LINE_HEIGHT * COPY_REASON_MAX_LINES + 20;

function CopyScreenContent({
  entry,
  launchId,
}: {
  entry: NoCopyEntry;
  launchId: string;
}) {
  const colorScheme = useColorScheme();
  const inkColor = useCSSVariable('--color-ink') as string;
  const insets = useSafeAreaInsets();
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [state, setState] = React.useState<CopyFlowState>('loading');
  const [busyAction, setBusyAction] = React.useState<'copy-another' | null>(null);
  const copyInFlight = React.useRef(false);
  const copySuccessTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCopySuccessTimer = () => {
    if (copySuccessTimerRef.current) {
      clearTimeout(copySuccessTimerRef.current);
      copySuccessTimerRef.current = null;
    }
  };

  const flashCopied = () => {
    clearCopySuccessTimer();
    setState('copied');
    copySuccessTimerRef.current = setTimeout(() => {
      copySuccessTimerRef.current = null;
      setState((currentState) => (currentState === 'copied' ? 'idle' : currentState));
    }, COPY_SUCCESS_FLASH_MS);
  };

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
      const [nextReasonResult] = await Promise.all([
        fetchFreshNoReason(),
        waitForCopyButtonProgressBeat(),
      ]);
      setReason(nextReasonResult.reason);
      await copyNoReasonToClipboard(nextReasonResult.reason);
      flashCopied();
    } catch (error) {
      console.warn(`Failed quick copy handoff for ${entry}:${launchId}`, error);
      clearCopySuccessTimer();
      setReason(null);
      setState('error');
    } finally {
      copyInFlight.current = false;
      setBusyAction(null);
    }
  });

  const handleCopyAnother = React.useEffectEvent(async () => {
    clearCopySuccessTimer();
    setBusyAction('copy-another');
    await runCopyFlow();
  });

  useMountEffect(() => {
    void runCopyFlow();
    return () => {
      clearCopySuccessTimer();
    };
  });

  const showCopySuccess = state === 'copied';
  const copiedReasonTextColor = showCopySuccess && colorScheme === 'dark' ? '#ffffff' : inkColor;
  const statusLabel = state === 'error' ? 'Could not copy a fresh no' : null;
  const displayText =
    state === 'error'
      ? 'Could not load a fresh no right now.'
      : reason?.text ?? 'Copying a fresh no...';

  return (
    <View
      className="bg-transparent px-6 pt-5"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="pt-3">
        <View
          className="justify-center"
          style={{ minHeight: COPY_REASON_BLOCK_MIN_HEIGHT }}>
          <View className="gap-3.5">
            {statusLabel ? (
              <Animated.Text
                entering={FadeInDown.duration(180)}
                selectable
                className="text-[13px] font-bold tracking-[-0.1px] text-accent">
                {statusLabel}
              </Animated.Text>
            ) : null}

            <Animated.Text
              entering={FadeInDown.duration(200)}
              selectable
              className="text-[31px] leading-[39px] font-extrabold tracking-[-1.1px]"
              style={{ color: copiedReasonTextColor }}>
              {displayText}
            </Animated.Text>
          </View>
        </View>

        <View
          className="mt-4 rounded-[20px] w-full overflow-hidden"
          style={{ borderCurve: 'continuous' }}>
          <ActionButton
            label={state === 'error' ? 'Try again' : 'Copy another?'}
            icon={state === 'error' ? 'arrow.clockwise' : 'doc.on.doc'}
            labelMinWidth={108}
            onPress={() => void handleCopyAnother()}
            loading={busyAction === 'copy-another' || state === 'loading'}
            loadingLabel="Copying..."
            success={showCopySuccess}
            successLabel="Copied"
            disabled={busyAction !== null || state === 'loading' || showCopySuccess}
            tone="primary"
          />
        </View>

        {reason && state !== 'error' ? (
          <View className="mt-3 items-center">
            <GlassCapsule padding={4} style={{ gap: 2 }}>
              <FavoriteButton id={reason.id} size={22} padding={10} />
              <ShareButton text={reason.copiedText ?? reason.text} size={22} padding={10} />
            </GlassCapsule>
          </View>
        ) : null}
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
