import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import type { NoReason } from '@/features/no/contracts';
import { noPalette } from '@/features/no/theme';

type ReasonCardProps = {
  reason: NoReason | null;
  eyebrow?: string;
  footer?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  onLongPress?: () => void;
};

export function ReasonCard({
  reason,
  eyebrow,
  footer,
  isLoading = false,
  loadingLabel = 'Loading your next excuse...',
  onLongPress,
}: ReasonCardProps) {
  const displayText = reason?.text ?? loadingLabel;
  const isPlaceholder = reason === null;
  const canCopyFromCard = typeof onLongPress === 'function' && !isPlaceholder;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
      }}>
      {eyebrow ? (
        <Text
          selectable
          style={{
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: noPalette.muted,
          }}>
          {eyebrow}
        </Text>
      ) : null}

      <Pressable
        accessibilityHint={canCopyFromCard ? 'Long press to copy this excuse.' : undefined}
        accessibilityLabel={reason?.text}
        accessibilityRole={canCopyFromCard ? 'button' : undefined}
        delayLongPress={220}
        disabled={!canCopyFromCard}
        onLongPress={onLongPress}
        style={({ pressed }) => ({
          transform: [{ scale: pressed && canCopyFromCard ? 0.985 : 1 }],
        })}>
        <Animated.Text
          key={reason?.id ?? (isLoading ? 'loading' : 'empty')}
          entering={FadeInDown.duration(280)}
          selectable={!canCopyFromCard}
          style={{
            fontSize: isPlaceholder ? 24 : 32,
            lineHeight: isPlaceholder ? 32 : 42,
            fontWeight: isPlaceholder ? '700' : '800',
            letterSpacing: isPlaceholder ? -0.6 : -1.2,
            color: isPlaceholder ? noPalette.subtleInk : noPalette.ink,
            textAlign: 'center',
            maxWidth: 420,
          }}>
          {displayText}
        </Animated.Text>
      </Pressable>

      {footer ? (
        <Animated.View
          entering={FadeIn.delay(60).duration(220)}
          style={{
            maxWidth: 360,
          }}>
          <Text
            selectable
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: noPalette.subtleInk,
              textAlign: 'center',
            }}>
            {footer}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
