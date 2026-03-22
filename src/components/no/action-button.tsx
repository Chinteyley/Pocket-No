import {
  SymbolView,
  type AnimationSpec,
  type SFSymbol,
} from 'expo-symbols';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { noPalette } from '@/features/no/theme';

type ActionButtonProps = {
  label: string;
  icon?: SFSymbol;
  onPress: () => void;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  tone: 'primary' | 'secondary';
  hint?: string;
  success?: boolean;
  successLabel?: string;
  successIcon?: SFSymbol;
};

export function ActionButton({
  label,
  icon,
  onPress,
  loading = false,
  loadingLabel,
  disabled = false,
  tone,
  hint,
  success = false,
  successLabel = 'Copied',
  successIcon = 'checkmark',
}: ActionButtonProps) {
  const isPrimary = tone === 'primary';
  const basePalette = isPrimary
    ? {
        backgroundColor: noPalette.ink,
        borderColor: noPalette.ink,
        textColor: '#ffffff',
        iconTint: '#ffffff',
        hintColor: 'rgba(255, 255, 255, 0.72)',
      }
    : {
        backgroundColor: noPalette.surfaceMuted,
        borderColor: noPalette.outline,
        textColor: noPalette.ink,
        iconTint: noPalette.ink,
        hintColor: noPalette.subtleInk,
      };
  const successPalette = {
    backgroundColor: noPalette.accent,
    borderColor: noPalette.accent,
    textColor: '#ffffff',
    iconTint: '#ffffff',
    hintColor: 'rgba(255, 255, 255, 0.8)',
  };
  const palette = success ? successPalette : basePalette;
  const visibleLabel = success ? successLabel : label;
  const visibleIcon = success ? successIcon : icon;
  const hasHint = typeof hint === 'string' && hint.length > 0;
  const iconStateKey = `${loading ? 'loading' : success ? 'success' : 'idle'}-${visibleIcon ?? 'none'}`;
  const symbolAnimationSpec: AnimationSpec | undefined = loading
    ? {
        effect: { type: 'pulse', wholeSymbol: true },
        repeating: true,
      }
    : success
      ? {
          effect: { type: 'scale', wholeSymbol: true },
        }
      : undefined;
  const successProgress = useDerivedValue(() =>
    withTiming(success ? 1 : 0, {
      duration: success ? 180 : 120,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    })
  );
  const animatedButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(successProgress.value, [0, 1], [
      basePalette.backgroundColor,
      successPalette.backgroundColor,
    ]),
    borderColor: interpolateColor(successProgress.value, [0, 1], [
      basePalette.borderColor,
      successPalette.borderColor,
    ]),
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={visibleLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: hasHint ? 24 : 20,
        opacity: disabled ? 0.6 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      })}>
      <Animated.View
        style={[
          {
            borderRadius: hasHint ? 24 : 20,
            borderWidth: 1,
            backgroundColor: basePalette.backgroundColor,
            borderColor: basePalette.borderColor,
            minHeight: hasHint ? 74 : 58,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: hasHint ? 'column' : 'row',
            gap: hasHint ? 4 : 8,
            paddingHorizontal: 18,
            paddingVertical: hasHint ? 14 : 0,
          },
          animatedButtonStyle,
        ]}>
        {visibleIcon ? (
          <View
            style={{
              width: 20,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Animated.View
              entering={FadeIn.duration(180).withInitialValues({
                opacity: 0,
                transform: [{ scale: 0.94 }, { translateY: 2 }],
              })}
              exiting={FadeOut.duration(120)}
              key={iconStateKey}>
              <SymbolView
                animationSpec={symbolAnimationSpec}
                name={visibleIcon}
                size={18}
                tintColor={palette.iconTint}
                weight="semibold"
              />
            </Animated.View>
          </View>
        ) : null}
        <View style={{ alignItems: 'center', gap: hasHint ? 2 : 0 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: palette.textColor,
              letterSpacing: -0.2,
            }}>
            {loadingLabel && loading ? loadingLabel : visibleLabel}
          </Text>
          {hasHint ? (
            <Text
              style={{
                fontSize: 13,
                lineHeight: 18,
                color: palette.hintColor,
                textAlign: 'center',
              }}>
              {hint}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}
