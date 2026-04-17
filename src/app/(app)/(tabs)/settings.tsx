import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import React from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useCSSVariable } from 'uniwind';

import { clearFavorites, useFavorites } from '@/features/no/favorites-store';
import {
  setThemePreference,
  useThemePreference,
  type ThemePreference,
} from '@/features/theme/theme-preference-store';

type RowDef = {
  label: string;
  description?: string;
  icon: SFSymbol;
  href?: '/personalize' | '/privacy' | '/support';
  destructive?: boolean;
  onPress?: () => void;
};

interface AppearanceOption {
  value: ThemePreference;
  label: string;
  icon: SFSymbol;
}

const APPEARANCE_OPTIONS: readonly AppearanceOption[] = [
  { value: 'system', label: 'System', icon: 'circle.lefthalf.filled' },
  { value: 'light', label: 'Light', icon: 'sun.max.fill' },
  { value: 'dark', label: 'Dark', icon: 'moon.fill' },
];

export default function SettingsScreen() {
  const favorites = useFavorites();
  const themePreference = useThemePreference();
  const warmSurfaceColor = useCSSVariable('--color-warm-surface') as string;
  const outlineColor = useCSSVariable('--color-outline') as string;
  const surfaceMutedColor = useCSSVariable('--color-surface-muted') as string;
  const inkColor = useCSSVariable('--color-ink') as string;
  const subtleInkColor = useCSSVariable('--color-subtle-ink') as string;
  const accentColor = useCSSVariable('--color-accent') as string;

  const handleClearFavorites = () => {
    if (favorites.size === 0) {
      return;
    }

    const confirmLabel =
      favorites.size === 1 ? 'Clear 1 favorite' : `Clear ${favorites.size} favorites`;

    Alert.alert(
      'Clear favorites?',
      'This removes every saved line from your device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: confirmLabel,
          style: 'destructive',
          onPress: () => clearFavorites(),
        },
      ]
    );
  };

  const generalRows: RowDef[] = [
    {
      label: 'Personalize a no',
      description: 'Apple Intelligence turns your context into a line. iOS 18+.',
      icon: 'sparkles',
      href: '/personalize',
    },
  ];

  const dataRows: RowDef[] = [
    {
      label:
        favorites.size === 0
          ? 'No favorites saved'
          : `Clear ${favorites.size} ${favorites.size === 1 ? 'favorite' : 'favorites'}`,
      description:
        favorites.size === 0
          ? 'Saved lines will appear on the Favorites tab.'
          : 'Remove every saved line from this device.',
      icon: 'heart.slash',
      destructive: favorites.size > 0,
      onPress: handleClearFavorites,
    },
  ];

  const aboutRows: RowDef[] = [
    { label: 'Support', icon: 'questionmark.circle', href: '/support' },
    { label: 'Privacy Policy', icon: 'lock.shield', href: '/privacy' },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      className="flex-1 bg-paper"
      contentContainerStyle={{ paddingBottom: 48 }}>
      <View
        style={{
          backgroundColor: warmSurfaceColor,
          borderBottomWidth: 1,
          borderBottomColor: outlineColor,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 16,
        }}>
        <Text
          className="text-[32px] leading-[36px] font-extrabold tracking-[-1px]"
          style={{ color: inkColor }}>
          Settings
        </Text>
        <Text
          className="mt-1 text-[14px] font-semibold tracking-[-0.1px]"
          style={{ color: subtleInkColor }}>
          Personalize and manage your saved lines.
        </Text>
      </View>

      <Section title="General" subtleInkColor={subtleInkColor}>
        {generalRows.map((row, index) => (
          <SettingsRow
            key={row.label}
            row={row}
            isLast={index === generalRows.length - 1}
            inkColor={inkColor}
            subtleInkColor={subtleInkColor}
            accentColor={accentColor}
            outlineColor={outlineColor}
            surfaceColor={surfaceMutedColor}
          />
        ))}
      </Section>

      <Section title="Appearance" subtleInkColor={subtleInkColor}>
        {APPEARANCE_OPTIONS.map((option, index) => (
          <AppearanceRow
            key={option.value}
            option={option}
            isSelected={themePreference === option.value}
            isLast={index === APPEARANCE_OPTIONS.length - 1}
            inkColor={inkColor}
            subtleInkColor={subtleInkColor}
            accentColor={accentColor}
            outlineColor={outlineColor}
            surfaceColor={surfaceMutedColor}
          />
        ))}
      </Section>

      <Section title="Your data" subtleInkColor={subtleInkColor}>
        {dataRows.map((row, index) => (
          <SettingsRow
            key={row.label}
            row={row}
            isLast={index === dataRows.length - 1}
            inkColor={inkColor}
            subtleInkColor={subtleInkColor}
            accentColor={accentColor}
            outlineColor={outlineColor}
            surfaceColor={surfaceMutedColor}
          />
        ))}
      </Section>

      <Section title="About" subtleInkColor={subtleInkColor}>
        {aboutRows.map((row, index) => (
          <SettingsRow
            key={row.label}
            row={row}
            isLast={index === aboutRows.length - 1}
            inkColor={inkColor}
            subtleInkColor={subtleInkColor}
            accentColor={accentColor}
            outlineColor={outlineColor}
            surfaceColor={surfaceMutedColor}
          />
        ))}
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  subtleInkColor,
}: {
  title: string;
  children: React.ReactNode;
  subtleInkColor: string;
}) {
  return (
    <View style={{ marginTop: 28 }}>
      <Text
        className="px-5 pb-2 text-[12px] font-bold uppercase tracking-[1.2px]"
        style={{ color: subtleInkColor }}>
        {title}
      </Text>
      <View>{children}</View>
    </View>
  );
}

function SettingsRow({
  row,
  isLast,
  inkColor,
  subtleInkColor,
  accentColor,
  outlineColor,
  surfaceColor,
}: {
  row: RowDef;
  isLast: boolean;
  inkColor: string;
  subtleInkColor: string;
  accentColor: string;
  outlineColor: string;
  surfaceColor: string;
}) {
  const labelColor = row.destructive ? accentColor : inkColor;
  const iconTint = row.destructive ? accentColor : subtleInkColor;

  const content = (pressed: boolean) => (
    <View
      style={{
        backgroundColor: surfaceColor,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: outlineColor,
        borderBottomWidth: isLast ? 1 : 0,
        borderBottomColor: outlineColor,
        opacity: pressed ? 0.7 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}>
      <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
        {Platform.OS === 'ios' ? (
          <Image
            contentFit="contain"
            source={`sf:${row.icon}`}
            style={{ width: 20, height: 20 }}
            tintColor={iconTint}
          />
        ) : (
          <SymbolView name={row.icon} size={20} tintColor={iconTint} weight="semibold" />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          className="text-[16px] font-semibold tracking-[-0.2px]"
          style={{ color: labelColor }}>
          {row.label}
        </Text>
        {row.description ? (
          <Text
            className="mt-0.5 text-[13px] leading-[18px]"
            style={{ color: subtleInkColor }}>
            {row.description}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (row.href) {
    const href = row.href;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={row.label}
        onPress={() => router.push(href)}>
        {({ pressed }) => content(pressed)}
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={row.label}
      onPress={row.onPress}
      disabled={!row.onPress || (row.icon === 'heart.slash' && !row.destructive)}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

function AppearanceRow({
  option,
  isSelected,
  isLast,
  inkColor,
  subtleInkColor,
  accentColor,
  outlineColor,
  surfaceColor,
}: {
  option: AppearanceOption;
  isSelected: boolean;
  isLast: boolean;
  inkColor: string;
  subtleInkColor: string;
  accentColor: string;
  outlineColor: string;
  surfaceColor: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${option.label} appearance`}
      onPress={() => setThemePreference(option.value)}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: surfaceColor,
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: outlineColor,
            borderBottomWidth: isLast ? 1 : 0,
            borderBottomColor: outlineColor,
            opacity: pressed ? 0.7 : 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
          }}>
          <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
            {Platform.OS === 'ios' ? (
              <Image
                contentFit="contain"
                source={`sf:${option.icon}`}
                style={{ width: 20, height: 20 }}
                tintColor={subtleInkColor}
              />
            ) : (
              <SymbolView
                name={option.icon}
                size={20}
                tintColor={subtleInkColor}
                weight="semibold"
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text
              className="text-[16px] font-semibold tracking-[-0.2px]"
              style={{ color: inkColor }}>
              {option.label}
            </Text>
          </View>
          {isSelected ? (
            <View
              style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
              {Platform.OS === 'ios' ? (
                <Image
                  contentFit="contain"
                  source="sf:checkmark"
                  style={{ width: 18, height: 18 }}
                  tintColor={accentColor}
                />
              ) : (
                <SymbolView
                  name="checkmark"
                  size={18}
                  tintColor={accentColor}
                  weight="bold"
                />
              )}
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}
