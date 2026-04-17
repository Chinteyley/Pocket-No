import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { FavoriteButton } from '@/components/no/favorite-button';
import { recordHistoryEntry } from '@/features/no/history-store';
import type { ReasonEntry } from '@/features/no/reason-catalog';

type ReasonRowProps = {
  entry: ReasonEntry;
};

const COPY_FEEDBACK_DURATION_MS = 900;

export function ReasonRow({ entry }: ReasonRowProps) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
    <View className="flex-row items-start gap-2 py-3 px-5 border-b border-outline">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Copied to clipboard' : `Copy: ${entry.text}`}
        onPress={() => void handleCopy()}
        className="flex-1"
        style={({ pressed }) => ({
          opacity: pressed ? 0.6 : 1,
        })}>
        <Text
          selectable
          className="text-[17px] leading-[24px] font-semibold tracking-[-0.3px] text-ink">
          {entry.text}
        </Text>
        {copied ? (
          <Animated.Text
            entering={FadeIn.duration(120)}
            exiting={FadeOut.duration(120)}
            className="mt-1 text-[12px] font-bold tracking-[0.4px] uppercase text-accent">
            Copied
          </Animated.Text>
        ) : null}
      </Pressable>
      <View className="pt-0.5">
        <FavoriteButton id={entry.id} size={20} padding={8} />
      </View>
    </View>
  );
}
