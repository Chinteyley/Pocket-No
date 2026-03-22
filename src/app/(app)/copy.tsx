import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ActionButton } from '@/components/no/action-button';
import { AmbientBackground } from '@/components/no/ambient-background';
import { ReasonCard } from '@/components/no/reason-card';
import {
  copyNoReasonToClipboard,
  createAndCopyNoReason,
} from '@/features/no/no-reason-service';
import { parseNoEntryPoint, type NoEntryPoint, type NoReason } from '@/features/no/contracts';
import { noPalette } from '@/features/no/theme';
import { useMountEffect } from '@/hooks/useMountEffect';

const SURFACE_COPY: Record<NoEntryPoint, { eyebrow: string; title: string; detail: string; status: string }> = {
  app: {
    eyebrow: 'Opened In App',
    title: 'Your no is ready.',
    detail: 'This screen copies a fresh line the moment it opens, then keeps it visible so you can verify what you pasted.',
    status: 'Fresh no copied from the app.',
  },
  'quick-action': {
    eyebrow: 'Quick Action',
    title: 'Long press, copy, done.',
    detail: 'The home screen shortcut landed here, fetched a new line, and copied it immediately.',
    status: 'Fresh no copied from the home screen quick action.',
  },
  widget: {
    eyebrow: 'Widget',
    title: 'The widget kicked one over.',
    detail: 'A tap from the widget opens the copy flow directly so the latest line lands on your clipboard.',
    status: 'Fresh no copied from the widget.',
  },
  'action-button': {
    eyebrow: 'Action Button',
    title: 'Hardware button, instant boundary.',
    detail: 'The App Shortcut opened Pocket-No straight into copy mode so the line is already on your clipboard.',
    status: 'Fresh no copied from the Action Button shortcut.',
  },
};

export default function QuickCopyScreen() {
  const params = useLocalSearchParams<{ entry?: string | string[] }>();
  const entry = parseNoEntryPoint(params.entry);

  return <QuickCopyScreenContent key={entry} entry={entry} />;
}

function QuickCopyScreenContent({ entry }: { entry: NoEntryPoint }) {
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [busyAction, setBusyAction] = React.useState<'copy' | 'another' | 'loading' | null>('loading');
  const [status, setStatus] = React.useState('Copying a fresh no.');
  const [showCopySuccess, setShowCopySuccess] = React.useState(false);
  const copySuccessTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyDetails = SURFACE_COPY[entry];

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

  const runAutoCopy = React.useEffectEvent(async () => {
    hideCopySuccess();
    setBusyAction('loading');

    try {
      const nextReason = await createAndCopyNoReason();
      React.startTransition(() => {
        setReason(nextReason);
      });
      setStatus(copyDetails.status);
      flashCopied();
    } finally {
      setBusyAction(null);
    }
  });

  useMountEffect(() => {
    void runAutoCopy();

    return () => {
      clearCopySuccessTimer();
    };
  });

  const handleCopyAgain = React.useEffectEvent(async () => {
    hideCopySuccess();
    setBusyAction('copy');

    try {
      if (reason) {
        await copyNoReasonToClipboard(reason);
        setStatus('Copied the current line again.');
        flashCopied();
        return;
      }

      const nextReason = await createAndCopyNoReason();
      React.startTransition(() => {
        setReason(nextReason);
      });
      setStatus('Fresh no copied.');
      flashCopied();
    } finally {
      setBusyAction(null);
    }
  });

  const handleAnotherOne = React.useEffectEvent(async () => {
    hideCopySuccess();
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
      <Stack.Screen options={{ title: 'Quick Copy', headerLargeTitle: false }} />
      <AmbientBackground />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 36,
          gap: 22,
        }}>
        <View style={{ gap: 18, paddingTop: 12 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 22,
              backgroundColor: '#fff7ef',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: noPalette.outline,
              boxShadow: `0 18px 42px ${noPalette.shadowSoft}`,
            }}>
            <Image source="sf:doc.on.doc.fill" style={{ width: 26, height: 26, tintColor: noPalette.accent }} />
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
              {copyDetails.eyebrow}
            </Text>
            <Text
              selectable
              style={{
                fontSize: 36,
                lineHeight: 40,
                fontWeight: '900',
                color: noPalette.ink,
                letterSpacing: -1.4,
              }}>
              {copyDetails.title}
            </Text>
            <Text
              selectable
              style={{
                fontSize: 16,
                lineHeight: 24,
                color: noPalette.subtleInk,
                maxWidth: 420,
              }}>
              {copyDetails.detail}
            </Text>
          </View>
        </View>

        <ReasonCard
          reason={reason}
          eyebrow="Copied Line"
          footer="Paste this anywhere, or spin another one without leaving the screen."
        />

        <View style={{ gap: 12 }}>
          <ActionButton
            label="Copy Again"
            hint="Use the line already on screen"
            success={showCopySuccess}
            successLabel="Copied!"
            onPress={() => void handleCopyAgain()}
            loading={busyAction === 'copy'}
            disabled={busyAction !== null}
            tone="secondary"
          />
          <ActionButton
            label="Another One"
            hint="Fetch a brand new line and copy it"
            onPress={() => void handleAnotherOne()}
            loading={busyAction === 'another' || busyAction === 'loading'}
            disabled={busyAction !== null}
            tone="primary"
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
