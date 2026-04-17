import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, useColorScheme, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

import {
  isFavorite,
  subscribeToFavorites,
  toggleFavorite,
} from '@/features/no/favorites-store';

type FavoriteButtonProps = {
  id: string | null | undefined;
  size?: number;
  padding?: number;
  accessibilityLabel?: string;
};

const DEFAULT_SIZE = 22;
const DEFAULT_PADDING = 10;

export function FavoriteButton({
  id,
  size = DEFAULT_SIZE,
  padding = DEFAULT_PADDING,
  accessibilityLabel,
}: FavoriteButtonProps) {
  const accentColor = useCSSVariable('--color-accent') as string;
  const subtleInkColor = useCSSVariable('--color-subtle-ink') as string;
  const colorScheme = useColorScheme();
  const pressedFill =
    colorScheme === 'dark' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)';
  const isFav = React.useSyncExternalStore(
    subscribeToFavorites,
    () => (id ? isFavorite(id) : false),
    () => false
  );

  const handlePress = () => {
    if (!id) return;
    toggleFavorite(id);
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(
        isFav ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
      );
    }
  };

  const iconName = isFav ? 'heart.fill' : 'heart';
  const tint = isFav ? accentColor : subtleInkColor;
  const label =
    accessibilityLabel ?? (isFav ? 'Remove from favorites' : 'Save to favorites');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFav }}
      disabled={!id}
      hitSlop={8}
      onPress={handlePress}
      style={({ pressed }) => ({
        padding,
        borderRadius: (size + padding * 2) / 2,
        backgroundColor: pressed && id ? pressedFill : 'transparent',
        opacity: !id ? 0.4 : 1,
        transform: [{ scale: pressed && id ? 0.94 : 1 }],
      })}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {Platform.OS === 'ios' ? (
          <Image
            contentFit="contain"
            source={`sf:${iconName}`}
            style={{ width: size, height: size }}
            tintColor={tint}
            transition={{ duration: 140, effect: 'sf:replace', timing: 'ease-in-out' }}
          />
        ) : (
          <SymbolView name={iconName} size={size} tintColor={tint} weight="semibold" />
        )}
      </View>
    </Pressable>
  );
}
