import React, { useCallback, useRef } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import Animated, {
  FadeIn,
  FadeOut,
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
          backgroundColor: noPalette.accentWash,
          borderColor: 'rgba(232, 108, 47, 0.18)',
          color: noPalette.accent,
        }
      : null;

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

      <View
        ref={textContainerRef}
        onLayout={handleLayout}
        style={{
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {copyIndicator ? (
          <Animated.View
            key={copyIndicator.key}
            entering={FadeIn.duration(180).withInitialValues({
              opacity: 0,
              transform: [{ scale: 0.96 }, { translateY: 6 }],
            })}
            exiting={FadeOut.duration(140)}
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: '100%',
              marginBottom: 14,
              zIndex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: copyIndicator.backgroundColor,
              borderWidth: 1,
              borderColor: copyIndicator.borderColor,
            }}>
            <SymbolView
              name={copyIndicator.icon}
              size={14}
              tintColor={copyIndicator.color}
              weight="semibold"
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                letterSpacing: -0.1,
                color: copyIndicator.color,
              }}>
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
      </View>

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
