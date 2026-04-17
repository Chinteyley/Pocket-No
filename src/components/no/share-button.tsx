import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

type ShareButtonProps = {
  text: string | null | undefined;
  size?: number;
  padding?: number;
  accessibilityLabel?: string;
};

const DEFAULT_SIZE = 22;
const DEFAULT_PADDING = 10;

export function ShareButton({
  text,
  size = DEFAULT_SIZE,
  padding = DEFAULT_PADDING,
  accessibilityLabel = 'Share this no',
}: ShareButtonProps) {
  const subtleInkColor = useCSSVariable('--color-subtle-ink') as string;

  const handlePress = async () => {
    const trimmed = text?.trim();
    if (!trimmed) return;

    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await Share.share({ message: trimmed });
    } catch (error) {
      console.warn('Failed to open share sheet', error);
    }
  };

  const disabled = !text?.trim();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={8}
      onPress={() => void handlePress()}
      style={({ pressed }) => ({
        padding,
        borderRadius: (size + padding * 2) / 2,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.9 : 1 }],
      })}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {Platform.OS === 'ios' ? (
          <Image
            contentFit="contain"
            source="sf:square.and.arrow.up"
            style={{ width: size, height: size }}
            tintColor={subtleInkColor}
          />
        ) : (
          <SymbolView
            name="square.and.arrow.up"
            size={size}
            tintColor={subtleInkColor}
            weight="semibold"
          />
        )}
      </View>
    </Pressable>
  );
}
