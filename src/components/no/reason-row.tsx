import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useCSSVariable } from 'uniwind';

import { FavoriteButton } from '@/components/no/favorite-button';
import { recordHistoryEntry } from '@/features/no/history-store';
import type { ReasonEntry } from '@/features/no/reason-catalog';

type ReasonRowProps = {
  entry: ReasonEntry;
};

const COPY_FEEDBACK_DURATION_MS = 900;

function ReasonRowImpl({ entry }: ReasonRowProps) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const surfaceColor = (useCSSVariable('--color-surface') as string) ?? '#ffffff';
  const outlineColor = (useCSSVariable('--color-outline') as string) ?? 'rgba(0,0,0,0.08)';
  const inkColor = (useCSSVariable('--color-ink') as string) ?? '#111111';
  const subtleInkColor = (useCSSVariable('--color-subtle-ink') as string) ?? '#555555';
  const accentColor = (useCSSVariable('--color-accent') as string) ?? '#e86c2f';
  const shadowSoftColor =
    (useCSSVariable('--color-shadow-soft') as string) ?? 'rgba(0, 0, 0, 0.06)';

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(entry.text);
      recordHistoryEntry(entry.id);
      if (process.env.EXPO_OS === 'ios') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setCopied(false);
      }, COPY_FEEDBACK_DURATION_MS);
    } catch (error) {
      console.warn('Failed to copy reason from row', error);
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
      <View
        style={{
          backgroundColor: surfaceColor,
          borderRadius: 24,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: outlineColor,
          boxShadow: `0 12px 28px ${shadowSoftColor}`,
          paddingLeft: 18,
          paddingRight: 10,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 12,
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copied ? 'Copied to clipboard' : `Copy: ${entry.text}`}
          onPress={() => void handleCopy()}
          style={({ pressed }) => ({
            flex: 1,
            opacity: pressed ? 0.82 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}>
          <Text
            selectable
            className="text-[17px] leading-[24px] font-semibold tracking-[-0.3px]"
            style={{ color: inkColor }}>
            {entry.text}
          </Text>
          {copied ? (
            <Animated.Text
              entering={FadeIn.duration(120)}
              exiting={FadeOut.duration(120)}
              className="mt-2 text-[12px] font-bold tracking-[0.4px] uppercase"
              style={{ color: accentColor }}>
              Copied
            </Animated.Text>
          ) : (
            <Text
              className="mt-2 text-[12px] font-semibold tracking-[-0.08px]"
              style={{ color: subtleInkColor }}>
              Tap to copy
            </Text>
          )}
        </Pressable>
        <View style={{ paddingTop: 2 }}>
          <FavoriteButton id={entry.id} size={20} padding={8} />
        </View>
      </View>
    </View>
  );
}

export const ReasonRow = React.memo(
  ReasonRowImpl,
  (prev, next) => prev.entry.id === next.entry.id
);
