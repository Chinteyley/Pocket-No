import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { useCSSVariable } from 'uniwind';

interface GlassCapsuleProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  radius?: number;
}

export function GlassCapsule({
  children,
  style,
  padding = 4,
  radius = 999,
}: GlassCapsuleProps) {
  const warmSurfaceColor = useCSSVariable('--color-warm-surface') as string;
  const outlineColor = useCSSVariable('--color-outline') as string;

  const baseStyle: ViewStyle = {
    borderRadius: radius,
    borderCurve: 'continuous',
    padding,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  };

  if (process.env.EXPO_OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView isInteractive style={[baseStyle, style]}>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        baseStyle,
        {
          backgroundColor: warmSurfaceColor,
          borderWidth: 1,
          borderColor: outlineColor,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
