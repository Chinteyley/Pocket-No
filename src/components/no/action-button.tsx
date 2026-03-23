import {
  SymbolView,
  type AnimationSpec,
  type SFSymbol,
} from 'expo-symbols';
import { Image } from 'expo-image';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
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
  loadingPalette?: {
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    iconTint: string;
    hintColor: string;
  };
  loadingAnimationSpec?: AnimationSpec | null;
  loadingIconMotion?: 'none' | 'rotate' | 'rotate-settle';
  success?: boolean;
  successLabel?: string;
  successIcon?: SFSymbol;
  labelMinWidth?: number;
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
  loadingPalette,
  loadingAnimationSpec,
  loadingIconMotion = 'none',
  success = false,
  successLabel = 'Copied',
  successIcon = 'checkmark',
  labelMinWidth,
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
  const effectiveLoadingPalette = loadingPalette ?? basePalette;
  const palette = success ? successPalette : loading ? effectiveLoadingPalette : basePalette;
  const visibleLabel = success ? successLabel : label;
  const resolvedLabel = loadingLabel && loading ? loadingLabel : visibleLabel;
  const visibleIcon = success ? successIcon : icon;
  const hasHint = typeof hint === 'string' && hint.length > 0;
  const iconStateKey = visibleIcon ?? 'none';
  const usesSfReplaceTransition = Platform.OS === 'ios';
  const isRotateMotion = loadingIconMotion === 'rotate' || loadingIconMotion === 'rotate-settle';

  // For rotate-settle: hold the SF rotate effect briefly after loading ends
  // so rapid re-presses keep the icon spinning seamlessly.
  const [sfRotateHold, setSfRotateHold] = React.useState(false);
  React.useEffect(() => {
    if (loadingIconMotion !== 'rotate-settle') return;
    if (loading) {
      setSfRotateHold(true);
      return;
    }
    const timer = setTimeout(() => setSfRotateHold(false), 800);
    return () => clearTimeout(timer);
  }, [loading, loadingIconMotion]);

  const sfShouldRotate = loadingIconMotion === 'rotate-settle' ? sfRotateHold : loading;
  const iosIconKey =
    loadingIconMotion === 'rotate' ? `sf-symbol-image:${loading ? 'loading' : 'idle'}` : 'sf-symbol-image';
  const textStateKey = `${success ? 'success' : loading ? 'loading' : 'idle'}:${resolvedLabel}:${hint ?? ''}`;
  const loadingSfEffect =
    usesSfReplaceTransition && sfShouldRotate && isRotateMotion
      ? {
          effect: 'rotate' as const,
          repeat: -1,
          scope: 'whole-symbol' as const,
        }
      : null;
  const symbolAnimationSpec: AnimationSpec | undefined = loading
    ? loadingAnimationSpec ?? undefined
    : success
      ? {
          effect: { type: 'scale', wholeSymbol: true },
        }
      : undefined;
  const visualStateProgress = useDerivedValue(() =>
    withTiming(success ? 2 : loading ? 1 : 0, {
      duration: success ? 180 : loading ? 160 : 120,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    })
  );
  const animatedButtonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(visualStateProgress.value, [0, 1, 2], [
      basePalette.backgroundColor,
      effectiveLoadingPalette.backgroundColor,
      successPalette.backgroundColor,
    ]),
    borderColor: interpolateColor(visualStateProgress.value, [0, 1, 2], [
      basePalette.borderColor,
      effectiveLoadingPalette.borderColor,
      successPalette.borderColor,
    ]),
  }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={resolvedLabel}
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
              key={usesSfReplaceTransition ? iosIconKey : iconStateKey}>
              {usesSfReplaceTransition ? (
                <Image
                  contentFit="contain"
                  source={`sf:${visibleIcon}`}
                  sfEffect={loadingSfEffect}
                  style={{ width: 18, height: 18 }}
                  tintColor={palette.iconTint}
                  transition={{
                    duration: 180,
                    effect: 'sf:replace',
                    timing: 'ease-in-out',
                  }}
                />
              ) : (
                <SymbolView
                  animationSpec={symbolAnimationSpec}
                  name={visibleIcon}
                  size={18}
                  tintColor={palette.iconTint}
                  weight="semibold"
                />
              )}
            </Animated.View>
          </View>
        ) : null}
        <View
          style={{
            minHeight: hasHint ? 40 : 22,
            minWidth: labelMinWidth,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Animated.View
            entering={FadeIn.duration(160).withInitialValues({
              opacity: 0,
              transform: [{ scale: 0.98 }, { translateY: 3 }],
            })}
            exiting={FadeOut.duration(120)}
            key={textStateKey}
            style={{
              alignItems: 'center',
              gap: hasHint ? 2 : 0,
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: palette.textColor,
                letterSpacing: -0.2,
              }}>
              {resolvedLabel}
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
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
