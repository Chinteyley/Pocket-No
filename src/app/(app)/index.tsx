import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

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
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [busyAction, setBusyAction] = React.useState<'copy' | 'another' | 'loading' | null>(null);
  const [status, setStatus] = React.useState('Tap Copy No or Another One when you want a fresh line.');

  const handleCopy = React.useEffectEvent(async () => {
    setBusyAction('copy');

    try {
      if (reason) {
        await copyNoReasonToClipboard(reason);
        setStatus('Copied current no.');
        return;
      }

      const nextReason = await createAndCopyNoReason();
      React.startTransition(() => {
        setReason(nextReason);
      });
      setStatus('Fresh no copied.');
    } finally {
      setBusyAction(null);
    }
  });

  const handleAnotherOne = React.useEffectEvent(async () => {
    setBusyAction('another');

    try {
      const nextReason = await createAndCopyNoReason();
      React.startTransition(() => {
        setReason(nextReason);
      });
      setStatus('Fresh no copied.');
    } finally {
      setBusyAction(null);
    }
  });

  return (
    <View style={{ flex: 1, backgroundColor: noPalette.paper }}>
      <Stack.Screen options={{ title: 'Pocket-No' }} />
      <AmbientBackground />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 36,
          gap: 22,
        }}>
        <View
          style={{
            gap: 18,
            paddingTop: 12,
          }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 24,
              backgroundColor: noPalette.accent,
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 18px 40px ${noPalette.shadowStrong}`,
            }}>
            <Image source="sf:hand.raised.fill" style={{ width: 30, height: 30, tintColor: '#fffaf4' }} />
          </View>

          <View style={{ gap: 10 }}>
            <Text
              selectable
              style={{
                fontSize: 13,
                fontWeight: '700',
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: noPalette.muted,
              }}>
              Boundaries, pocket-sized
            </Text>
            <Text
              selectable
              style={{
                fontSize: 40,
                lineHeight: 44,
                fontWeight: '900',
                color: noPalette.ink,
                letterSpacing: -1.6,
              }}>
              A clean no, on demand.
            </Text>
            <Text
              selectable
              style={{
                fontSize: 17,
                lineHeight: 25,
                color: noPalette.subtleInk,
                maxWidth: 420,
              }}>
              Pocket-No keeps a sharp excuse ready, then copies it fast so you can paste and move on.
            </Text>
          </View>
        </View>

        <ReasonCard
          reason={reason}
          eyebrow="Current Line"
          footer="The widget and shortcuts stay in sync with the last copied line."
        />

        <View style={{ gap: 12 }}>
          <ActionButton
            label="Copy No"
            hint="Use the current line"
            onPress={() => void handleCopy()}
            loading={busyAction === 'copy'}
            disabled={busyAction !== null}
            tone="primary"
          />
          <ActionButton
            label="Another One"
            hint="Fetch a fresh line and copy it"
            onPress={() => void handleAnotherOne()}
            loading={busyAction === 'another' || busyAction === 'loading'}
            disabled={busyAction !== null}
            tone="secondary"
          />
        </View>

        <View
          style={{
            borderRadius: 24,
            paddingHorizontal: 18,
            paddingVertical: 16,
            backgroundColor: noPalette.surfaceMuted,
            borderWidth: 1,
            borderColor: noPalette.outline,
          }}>
          <Text
            selectable
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: noPalette.subtleInk,
            }}>
            {status}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
