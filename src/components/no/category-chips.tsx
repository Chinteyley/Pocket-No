import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

import { CATEGORIES, type CategoryId } from '@/features/no/categories';

type CategoryChipsProps = {
  selected: CategoryId | null;
  onSelect: (id: CategoryId | null) => void;
};

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  const accentColor = useCSSVariable('--color-accent') as string;
  const surfaceColor = useCSSVariable('--color-surface') as string;
  const outlineColor = useCSSVariable('--color-outline') as string;
  const inkColor = useCSSVariable('--color-ink') as string;
  const paperColor = useCSSVariable('--color-paper') as string;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}>
      <Chip
        label="All"
        active={selected === null}
        activeBackground={accentColor}
        idleBackground={surfaceColor}
        activeTextColor={paperColor}
        idleTextColor={inkColor}
        borderColor={outlineColor}
        onPress={() => onSelect(null)}
      />
      {CATEGORIES.map((category) => (
        <Chip
          key={category.id}
          label={category.label}
          active={selected === category.id}
          activeBackground={accentColor}
          idleBackground={surfaceColor}
          activeTextColor={paperColor}
          idleTextColor={inkColor}
          borderColor={outlineColor}
          onPress={() => onSelect(category.id)}
        />
      ))}
    </ScrollView>
  );
}

type ChipProps = {
  label: string;
  active: boolean;
  activeBackground: string;
  idleBackground: string;
  activeTextColor: string;
  idleTextColor: string;
  borderColor: string;
  onPress: () => void;
};

function Chip({
  label,
  active,
  activeBackground,
  idleBackground,
  activeTextColor,
  idleTextColor,
  borderColor,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}>
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? activeBackground : borderColor,
          backgroundColor: active ? activeBackground : idleBackground,
          borderCurve: 'continuous',
        }}>
        <Text
          className="text-[14px] font-semibold tracking-[-0.1px]"
          style={{ color: active ? activeTextColor : idleTextColor }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
