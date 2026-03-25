import {
  SymbolView,
  type AnimationSpec,
  type SFSymbol,
} from 'expo-symbols';
import { Image } from 'expo-image';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { cn } from '@/lib/cn';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { useCSSVariable } from 'uniwind';

type ActionButtonProps = {
  label: string;
  icon?: SFSymbol;
  onPress: () => void;
  fill?: boolean;
  loading?: boolean;
  loadingIcon?: SFSymbol;
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
  fill = false,
  loading = false,
  loadingIcon,
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
  const accentColor = useCSSVariable('--color-accent') as string;
  const buttonPrimaryColor = useCSSVariable('--color-button-primary') as string;
  const buttonPrimaryTextColor = useCSSVariable('--color-button-primary-text') as string;
  const buttonSecondaryColor = useCSSVariable('--color-button-secondary') as string;
  const buttonSecondaryTextColor = useCSSVariable('--color-button-secondary-text') as string;
  const buttonSecondaryBorderColor = useCSSVariable('--color-button-secondary-border') as string;

  const basePalette = isPrimary
    ? {
        backgroundColor: buttonPrimaryColor,
        borderColor: buttonPrimaryColor,
        textColor: buttonPrimaryTextColor,
        iconTint: buttonPrimaryTextColor,
        hintColor: 'rgba(255, 255, 255, 0.72)',
      }
    : {
        backgroundColor: buttonSecondaryColor,
        borderColor: buttonSecondaryBorderColor,
        textColor: buttonSecondaryTextColor,
        iconTint: buttonSecondaryTextColor,
        hintColor: buttonSecondaryTextColor,
      };
  const successPalette = {
    backgroundColor: accentColor,
    borderColor: accentColor,
    textColor: basePalette.textColor,
    iconTint: basePalette.iconTint,
    hintColor: basePalette.hintColor,
  };
  const effectiveLoadingPalette = loadingPalette ?? basePalette;
  const palette = success ? successPalette : loading ? effectiveLoadingPalette : basePalette;
  const shouldDimForDisabled = disabled && !success;
  const visibleLabel = success ? successLabel : label;
  const resolvedLabel = loadingLabel && loading ? loadingLabel : visibleLabel;
  const visibleIcon = success ? successIcon : loading ? (loadingIcon ?? icon) : icon;
  const hasHint = typeof hint === 'string' && hint.length > 0;
  const visualStateKey = success ? 'success' : loading ? 'loading' : 'idle';
  const iconStateKey = `${visualStateKey}:${visibleIcon ?? 'none'}`;
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
      className={fill ? 'flex-1' : 'w-full'}
      style={({ pressed }) => ({
        borderRadius: hasHint ? 24 : 20,
        opacity: shouldDimForDisabled ? 0.6 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      })}>
      <Animated.View
        className={cn(
          'items-center justify-center border px-[18px]',
          hasHint
            ? 'rounded-3xl min-h-[74px] flex-col gap-1 py-3.5'
            : 'rounded-[20px] min-h-[58px] flex-row gap-2'
        )}
        style={[
          { backgroundColor: basePalette.backgroundColor, borderColor: basePalette.borderColor },
          animatedButtonStyle,
        ]}>
        {visibleIcon ? (
          <View className="size-5 items-center justify-center">
            <Animated.View
              entering={FadeIn.duration(180).withInitialValues({
                opacity: 0,
                transform: [{ scale: 0.94 }, { translateY: 2 }],
              })}
              key={usesSfReplaceTransition ? 'sf-symbol-image' : iconStateKey}>
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
          className={cn(
            'items-center justify-center',
            hasHint ? 'min-h-[40px]' : 'min-h-[22px]'
          )}
          style={labelMinWidth != null ? { minWidth: labelMinWidth } : undefined}>
          <Animated.View
            entering={FadeIn.duration(160).withInitialValues({
              opacity: 0,
              transform: [{ scale: 0.98 }, { translateY: 3 }],
            })}
            exiting={FadeOut.duration(120)}
            key={textStateKey}
            className={cn('items-center', hasHint && 'gap-0.5')}>
            <Text
              className="text-base font-bold tracking-[-0.2px]"
              style={{ color: palette.textColor }}>
              {resolvedLabel}
            </Text>
            {hasHint ? (
              <Text
                className="text-[13px] leading-[18px] text-center"
                style={{ color: palette.hintColor }}>
                {hint}
              </Text>
            ) : null}
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
