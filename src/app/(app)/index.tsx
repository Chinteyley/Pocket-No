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
  createAndCopyNoReason,
} from '@/features/no/no-reason-service';
import type { NoReason } from '@/features/no/contracts';
import { noPalette } from '@/features/no/theme';

export default function PocketNoHomeScreen() {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [busyAction, setBusyAction] = React.useState<'copy' | 'another' | null>(null);
  const [showCopied, setShowCopied] = React.useState(false);

  const flashCopied = () => {
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1200);
  };

  const handleCopy = React.useEffectEvent(async () => {
    setBusyAction('copy');
    try {
      if (reason) {
        await copyNoReasonToClipboard(reason);
      } else {
        const nextReason = await createAndCopyNoReason();
        React.startTransition(() => setReason(nextReason));
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
    setBusyAction('another');
    try {
      const nextReason = await createAndCopyNoReason();
      React.startTransition(() => setReason(nextReason));
      if (process.env.EXPO_OS === 'ios') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      flashCopied();
    } finally {
      setBusyAction(null);
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: noPalette.paper }}>
      <Stack.Screen options={{ headerShown: false }} />
      <AmbientBackground />

      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ReasonCard reason={reason} showCopied={showCopied} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 16,
          paddingTop: 12,
        }}>
        <ActionButton
          label="Copy"
          icon="doc.on.doc"
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
          disabled={busyAction !== null}
          tone="secondary"
        />
      </View>
    </View>
  );
}
