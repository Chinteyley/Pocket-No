import { Image } from "expo-image";
import { router } from "expo-router";
import { SymbolView, type SFSymbol } from "expo-symbols";
import Stack from "expo-router/stack";
import React from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";

import {
  TabCardGroup,
  TabCardRow,
  TabFallbackHeader,
  TabSectionHeader,
  useTabScreenColors,
} from "@/components/no/tab-screen-shell";
import { clearFavorites, useFavorites } from "@/features/no/favorites-store";
import {
  setThemePreference,
  useThemePreference,
  type ThemePreference,
} from "@/features/theme/theme-preference-store";

type RowDef = {
  label: string;
  description?: string;
  icon: SFSymbol;
  href?: "/privacy" | "/support";
  destructive?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

interface AppearanceOption {
  value: ThemePreference;
  label: string;
  icon: SFSymbol;
}

const APPEARANCE_OPTIONS: readonly AppearanceOption[] = [
  { value: "system", label: "System", icon: "circle.lefthalf.filled" },
  { value: "light", label: "Light", icon: "sun.max.fill" },
  { value: "dark", label: "Dark", icon: "moon.fill" },
];

export default function SettingsScreen() {
  const favorites = useFavorites();
  const themePreference = useThemePreference();
  const {
    paperColor,
    subtleInkColor,
    accentColor,
    surfaceMutedColor,
    outlineColor,
  } = useTabScreenColors();
  const isIos = process.env.EXPO_OS === "ios";

  const handleClearFavorites = () => {
    if (favorites.size === 0) {
      return;
    }

    const confirmLabel =
      favorites.size === 1
        ? "Clear 1 favorite"
        : `Clear ${favorites.size} favorites`;

    Alert.alert(
      "Clear favorites?",
      "This removes every saved line from your device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: confirmLabel,
          style: "destructive",
          onPress: () => clearFavorites(),
        },
      ],
    );
  };

  const dataRows: RowDef[] = [
    {
      label:
        favorites.size === 0
          ? "No favorites saved"
          : `Clear ${favorites.size} ${favorites.size === 1 ? "favorite" : "favorites"}`,
      description:
        favorites.size === 0
          ? "Saved lines will appear on the Favorites tab."
          : "Remove every saved line from this device.",
      icon: "heart.slash",
      destructive: favorites.size > 0,
      onPress: handleClearFavorites,
      disabled: favorites.size === 0,
    },
  ];

  const aboutRows: RowDef[] = [
    { label: "Support", icon: "questionmark.circle", href: "/support" },
    { label: "Privacy Policy", icon: "lock.shield", href: "/privacy" },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: paperColor }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingBottom: 48,
        gap: 28,
      }}
    >
      {isIos ? (
        <Stack.Screen.Title large>Settings</Stack.Screen.Title>
      ) : (
        <TabFallbackHeader
          title="Settings"
          subtitle="Personalize and manage your saved lines."
        />
      )}

        <View style={{ gap: 10 }}>
          <TabSectionHeader title="Appearance" />
          <TabCardGroup>
            {APPEARANCE_OPTIONS.map((option, index) => (
              <TabCardRow
                key={option.value}
                title={option.label}
                subtitle={
                  option.value === "system"
                    ? "Match the device appearance."
                    : undefined
                }
                leadingIcon={option.icon}
                selected={themePreference === option.value}
                isLast={index === APPEARANCE_OPTIONS.length - 1}
                onPress={() => setThemePreference(option.value)}
                accessibilityLabel={`${option.label} appearance`}
                trailing={
                  themePreference === option.value ? (
                    <SelectedBadge label="Current" />
                  ) : (
                    <Chevron tintColor={subtleInkColor} />
                  )
                }
              />
            ))}
          </TabCardGroup>
        </View>

        <View style={{ gap: 10 }}>
          <TabSectionHeader title="Your data" />
          <TabCardGroup>
            {dataRows.map((row, index) => (
              <TabCardRow
                key={row.label}
                title={row.label}
                subtitle={row.description}
                leadingIcon={row.icon}
                destructive={row.destructive}
                disabled={row.disabled}
                isLast={index === dataRows.length - 1}
                onPress={row.disabled ? undefined : row.onPress}
                trailing={
                  row.disabled ? (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: surfaceMutedColor,
                        borderWidth: 1,
                        borderColor: outlineColor,
                      }}
                    />
                  ) : (
                    <Chevron
                      tintColor={row.destructive ? accentColor : subtleInkColor}
                    />
                  )
                }
              />
            ))}
          </TabCardGroup>
        </View>

        <View style={{ gap: 10 }}>
          <TabSectionHeader title="About" />
          <TabCardGroup>
            {aboutRows.map((row, index) => (
              <TabCardRow
                key={row.label}
                title={row.label}
                leadingIcon={row.icon}
                isLast={index === aboutRows.length - 1}
                onPress={() => router.push(row.href!)}
                trailing={<Chevron tintColor={subtleInkColor} />}
              />
            ))}
          </TabCardGroup>
        </View>
    </ScrollView>
  );
}

function SelectedBadge({ label }: { label: string }) {
  const { accentColor, accentWashColor } = useTabScreenColors();

  return (
    <View
      style={{
        backgroundColor: accentWashColor,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderCurve: "continuous",
      }}
    >
      <Text
        className="text-[12px] font-bold uppercase tracking-[0.8px]"
        style={{ color: accentColor }}
      >
        {label}
      </Text>
    </View>
  );
}

function Chevron({ tintColor }: { tintColor: string }) {
  if (Platform.OS === "ios") {
    return (
      <Image
        contentFit="contain"
        source="sf:chevron.right"
        style={{ width: 12, height: 12 }}
        tintColor={tintColor}
      />
    );
  }

  return (
    <SymbolView
      name="chevron.right"
      size={12}
      tintColor={tintColor}
      weight="semibold"
    />
  );
}
