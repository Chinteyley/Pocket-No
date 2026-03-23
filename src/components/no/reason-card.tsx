import React, { useCallback, useRef } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import Animated, {
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useCSSVariable } from 'uniwind';

import { cn } from '@/lib/cn';
import type { NoReason } from '@/features/no/contracts';

type ReasonCardProps = {
  reason: NoReason | null;
  eyebrow?: string;
  footer?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  onLongPress?: () => void;
  copyDisabled?: boolean;
  copyState?: 'idle' | 'success';
  onTextMeasure?: (cy: number, ry: number, rx: number) => void;
};

export function ReasonCard({
  reason,
  eyebrow,
  footer,
  isLoading = false,
  loadingLabel = 'Loading your next excuse...',
  onLongPress,
  copyDisabled = false,
  copyState = 'idle',
  onTextMeasure,
}: ReasonCardProps) {
  const textContainerRef = useRef<View>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const accentColor = useCSSVariable('--color-accent') as string;

  const handleLayout = useCallback(() => {
    textContainerRef.current?.measure((_x, _y, w, h, _pageX, pageY) => {
      if (h > 0 && screenHeight > 0) {
        onTextMeasure?.(
          (pageY + h / 2) / screenHeight,
          (h / 2 + 36) / screenHeight,
          (w / 2 + 64) / screenWidth,
        );
      }
    });
  }, [onTextMeasure, screenHeight, screenWidth]);
  const isPlaceholder = reason === null;
  const displayText = reason?.text ?? loadingLabel;
  const supportsCopyFeedback = !isPlaceholder && (typeof onLongPress === 'function' || copyState === 'success');
  const canCopyFromCard = !isPlaceholder && typeof onLongPress === 'function' && !copyDisabled;
  const copyIndicator =
    supportsCopyFeedback && copyState === 'success'
      ? {
          key: 'success',
          label: 'Copied to clipboard',
          icon: 'checkmark' as SFSymbol,
        }
      : null;

  return (
    <View className="flex-1 items-center justify-center px-8 gap-4">
      {eyebrow ? (
        <Text
          selectable
          className="text-xs font-bold tracking-[1px] uppercase text-muted">
          {eyebrow}
        </Text>
      ) : null}

      <View
        ref={textContainerRef}
        onLayout={handleLayout}
        className="relative items-center justify-center">
        {copyIndicator ? (
          <Animated.View
            key={copyIndicator.key}
            entering={FadeIn.duration(180).withInitialValues({
              opacity: 0,
              transform: [{ scale: 0.96 }, { translateY: 6 }],
            })}
            exiting={FadeOut.duration(140)}
            pointerEvents="none"
            className="absolute bottom-full mb-3.5 z-10 flex-row items-center gap-2 rounded-full px-3.5 py-2 bg-accent-wash border border-accent/[0.18]">
            <SymbolView
              name={copyIndicator.icon}
              size={14}
              tintColor={accentColor}
              weight="semibold"
            />
            <Text
              className="text-[13px] font-bold tracking-[-0.1px] text-accent">
              {copyIndicator.label}
            </Text>
          </Animated.View>
        ) : null}

        <Pressable
          accessibilityHint={
            supportsCopyFeedback
              ? copyState === 'success'
                ? 'Copied to clipboard.'
                : 'Long press to copy this excuse.'
              : undefined
          }
          accessibilityLabel={reason?.text}
          accessibilityRole={supportsCopyFeedback ? 'button' : undefined}
          delayLongPress={220}
          disabled={!canCopyFromCard}
          onLongPress={onLongPress}
          style={({ pressed }) => ({
            transform: [{ scale: pressed && supportsCopyFeedback ? 0.985 : 1 }],
          })}>
          <Animated.Text
            key={reason?.id ?? (isLoading ? 'loading' : 'empty')}
            entering={FadeIn.duration(180)}
            selectable={!canCopyFromCard}
            className={cn(
              'text-center max-w-[420px]',
              isPlaceholder
                ? 'text-2xl leading-8 font-bold tracking-[-0.6px] text-subtle-ink'
                : 'text-[32px] leading-[42px] font-extrabold tracking-[-1.2px] text-ink'
            )}>
            {displayText}
          </Animated.Text>
        </Pressable>
      </View>

      {footer ? (
        <Animated.View
          entering={FadeIn.delay(60).duration(220)}
          className="max-w-[360px]">
          <Text
            selectable
            className="text-sm leading-[21px] text-subtle-ink text-center">
            {footer}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}
