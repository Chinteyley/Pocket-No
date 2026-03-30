import React, { useCallback, useRef } from 'react';
import {
  Pressable,
  Text,
  View,
  useColorScheme,
  type LayoutChangeEvent,
  type LayoutRectangle,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';

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
  copiedTextColor?: string;
  onTextMeasure?: (cy: number, ry: number, rx: number) => void;
  bottomAccessory?: React.ReactNode;
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
  copiedTextColor,
  onTextMeasure,
  bottomAccessory,
}: ReasonCardProps) {
  const rootLayoutRef = useRef<LayoutRectangle | null>(null);
  const textLayoutRef = useRef<LayoutRectangle | null>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const baseTextColor = colorScheme === 'dark' ? '#f5f5f5' : '#111111';

  const emitTextMetrics = useCallback((rootLayout: LayoutRectangle | null, textLayout: LayoutRectangle | null) => {
    if (!rootLayout || !textLayout || screenHeight <= 0 || screenWidth <= 0) {
      return;
    }

    onTextMeasure?.(
      (rootLayout.y + textLayout.y + textLayout.height / 2) / screenHeight,
      (textLayout.height / 2 + 36) / screenHeight,
      (textLayout.width / 2 + 64) / screenWidth,
    );
  }, [onTextMeasure, screenHeight, screenWidth]);
  const handleRootLayout = useCallback((event: LayoutChangeEvent) => {
    rootLayoutRef.current = event.nativeEvent.layout;
    emitTextMetrics(rootLayoutRef.current, textLayoutRef.current);
  }, [emitTextMetrics]);
  const handleTextLayout = useCallback((event: LayoutChangeEvent) => {
    textLayoutRef.current = event.nativeEvent.layout;
    emitTextMetrics(rootLayoutRef.current, textLayoutRef.current);
  }, [emitTextMetrics]);
  const isPlaceholder = reason === null;
  const displayText = reason?.text ?? loadingLabel;
  const supportsCopyFeedback = !isPlaceholder && (typeof onLongPress === 'function' || copyState === 'success');
  const canCopyFromCard = !isPlaceholder && typeof onLongPress === 'function' && !copyDisabled;

  return (
    <View
      className="flex-1 items-center justify-center px-8 gap-4"
      onLayout={handleRootLayout}>
      {eyebrow ? (
        <Text
          selectable
          className="text-xs font-bold tracking-[1px] uppercase text-muted">
          {eyebrow}
        </Text>
      ) : null}

      <View
        onLayout={handleTextLayout}
        className="relative items-center justify-center">
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
            )}
            style={
              !isPlaceholder && copyState === 'success'
                ? {
                    color: copiedTextColor ?? baseTextColor,
                    textShadowColor: 'rgba(232, 108, 47, 0.34)',
                    textShadowOffset: { width: 0, height: 6 },
                    textShadowRadius: 20,
                  }
                : undefined
            }>
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

      {bottomAccessory ? (
        <Animated.View entering={FadeIn.delay(80).duration(220)}>
          {bottomAccessory}
        </Animated.View>
      ) : null}
    </View>
  );
}
