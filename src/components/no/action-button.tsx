import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { noPalette } from '@/features/no/theme';

type ActionButtonProps = {
  label: string;
  hint: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  tone: 'primary' | 'secondary';
};

export function ActionButton({
  label,
  hint,
  onPress,
  loading = false,
  disabled = false,
  tone,
}: ActionButtonProps) {
  const palette =
    tone === 'primary'
      ? {
          backgroundColor: noPalette.ink,
          borderColor: noPalette.ink,
          textColor: '#fffaf4',
          hintColor: '#eadfce',
          spinner: '#fffaf4',
        }
      : {
          backgroundColor: '#fff8ef',
          borderColor: noPalette.outline,
          textColor: noPalette.ink,
          hintColor: noPalette.subtleInk,
          spinner: noPalette.accent,
        };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 22,
        borderWidth: 1,
        borderColor: palette.borderColor,
        backgroundColor: palette.backgroundColor,
        opacity: disabled ? 0.72 : 1,
        transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        boxShadow: `0 16px 34px ${tone === 'primary' ? noPalette.shadowStrong : noPalette.shadowSoft}`,
      })}>
      <View
        style={{
          minHeight: 74,
          paddingHorizontal: 18,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            selectable
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: palette.textColor,
              letterSpacing: -0.3,
            }}>
            {label}
          </Text>
          <Text
            selectable
            style={{
              fontSize: 13,
              lineHeight: 18,
              color: palette.hintColor,
            }}>
            {hint}
          </Text>
        </View>

        {loading ? <ActivityIndicator color={palette.spinner} /> : null}
      </View>
    </Pressable>
  );
}
