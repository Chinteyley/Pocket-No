import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { noPalette } from '@/features/no/theme';

type ActionButtonProps = {
  label: string;
  icon: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone: 'primary' | 'secondary';
};

export function ActionButton({
  label,
  icon,
  onPress,
  loading = false,
  disabled = false,
  tone,
}: ActionButtonProps) {
  const isPrimary = tone === 'primary';
  const palette = isPrimary
    ? {
        backgroundColor: noPalette.ink,
        borderColor: noPalette.ink,
        textColor: '#ffffff',
        iconTint: '#ffffff',
        spinner: '#ffffff',
      }
    : {
        backgroundColor: noPalette.surfaceMuted,
        borderColor: noPalette.outline,
        textColor: noPalette.ink,
        iconTint: noPalette.ink,
        spinner: noPalette.accent,
      };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: palette.borderColor,
        backgroundColor: palette.backgroundColor,
        opacity: disabled ? 0.6 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
      })}>
      <View
        style={{
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
        }}>
        {loading ? (
          <ActivityIndicator color={palette.spinner} size="small" />
        ) : (
          <Image
            source={`sf:${icon}`}
            style={{ width: 18, height: 18, tintColor: palette.iconTint }}
          />
        )}
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: palette.textColor,
            letterSpacing: -0.2,
          }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
