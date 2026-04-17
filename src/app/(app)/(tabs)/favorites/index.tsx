import React from "react";
import {
  Alert,
  SectionList,
  Text,
  View,
  type SectionListRenderItemInfo,
} from "react-native";
import Stack from "expo-router/stack";

import { ReasonRow } from "@/components/no/reason-row";
import {
  TabEmptyState,
  TabFallbackHeader,
  TabSectionHeader,
  useTabScreenColors,
} from "@/components/no/tab-screen-shell";
import { useFavorites } from "@/features/no/favorites-store";
import { clearHistory, useHistory } from "@/features/no/history-store";
import {
  allReasons,
  getReasonById,
  type ReasonEntry,
} from "@/features/no/reason-catalog";

interface FavoritesSection {
  key: "favorites" | "recent";
  title: string;
  data: ReasonEntry[];
  clearAction?: () => void;
}

export default function FavoritesScreen() {
  const favorites = useFavorites();
  const history = useHistory();
  const { paperColor, subtleInkColor } = useTabScreenColors();
  const isIos = process.env.EXPO_OS === "ios";

  const favoriteEntries: ReasonEntry[] = React.useMemo(() => {
    if (favorites.size === 0) return [];
    return allReasons.filter((entry) => favorites.has(entry.id));
  }, [favorites]);

  const recentEntries: ReasonEntry[] = React.useMemo(() => {
    if (history.length === 0) return [];
    const seen = new Set<string>();
    const out: ReasonEntry[] = [];
    for (const item of history) {
      if (favorites.has(item.id)) continue;
      if (seen.has(item.id)) continue;
      const entry = getReasonById(item.id);
      if (!entry) continue;
      seen.add(item.id);
      out.push(entry);
    }
    return out;
  }, [history, favorites]);

  const sections: FavoritesSection[] = [
    {
      key: "favorites",
      title: `Favorites - ${favoriteEntries.length}`,
      data: favoriteEntries,
    },
  ];

  if (recentEntries.length > 0) {
    sections.push({
      key: "recent",
      title: `Recently copied - ${recentEntries.length}`,
      data: recentEntries,
      clearAction: () => {
        Alert.alert(
          "Clear recent history?",
          "This removes the list of recently copied lines from this device.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Clear",
              style: "destructive",
              onPress: () => clearHistory(),
            },
          ],
        );
      },
    });
  }

  const renderItem = React.useCallback(
    ({ item }: SectionListRenderItemInfo<ReasonEntry, FavoritesSection>) => (
      <ReasonRow entry={item} />
    ),
    [],
  );
  const keyExtractor = React.useCallback(
    (item: ReasonEntry, index: number) => `${item.id}-${index}`,
    [],
  );

  const favoriteCount = favoriteEntries.length;
  const recentCount = recentEntries.length;
  const headerSubtitle =
    favoriteCount === 0 && recentCount === 0
      ? "Tap the heart on any line to save it here."
      : "Saved lines and recently copied ones live here.";

  const isCompletelyEmpty = favoriteCount === 0 && recentCount === 0;

  return (
    <>
      {isIos ? (
        <>
          <Stack.Header
            style={{
              backgroundColor: paperColor,
              color: subtleInkColor,
              shadowColor: "transparent",
            }}
            largeStyle={{
              backgroundColor: paperColor,
              shadowColor: "transparent",
            }}
          />
          <Stack.Screen.Title
            style={{
              color: subtleInkColor === "#555555" ? "#111111" : "#f5f5f5",
            }}
          >
            Favorites
          </Stack.Screen.Title>
        </>
      ) : null}
      <SectionList
        style={{ flex: 1, backgroundColor: paperColor }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 32 }}
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        initialNumToRender={10}
        windowSize={7}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        ListHeaderComponent={
          isIos ? (
            <View style={{ paddingTop: 10, paddingBottom: 14 }} />
          ) : (
            <View style={{ paddingTop: 0, paddingBottom: 14, gap: 12 }}>
              <TabFallbackHeader title="Favorites" subtitle={headerSubtitle} />
            </View>
          )
        }
        renderSectionHeader={({ section }) => {
          if (
            section.key === "favorites" &&
            favoriteCount === 0 &&
            recentCount === 0
          ) {
            return null;
          }

          return (
            <View
              style={{
                paddingTop: section.key === "favorites" ? 0 : 18,
                paddingBottom: 8,
              }}
            >
              <TabSectionHeader
                title={section.title}
                actionLabel={section.clearAction ? "Clear" : undefined}
                actionAccessibilityLabel="Clear recent history"
                onActionPress={section.clearAction}
              />
            </View>
          );
        }}
        renderSectionFooter={({ section }) => {
          if (section.key === "favorites" && isCompletelyEmpty) {
            return (
              <TabEmptyState
                icon="heart"
                title="No favorites yet"
                description="Tap the heart on any line — in Browse, on Home, or in the Copy sheet. Saved lines live here, even offline."
              />
            );
          }

          if (
            section.key === "favorites" &&
            section.data.length === 0 &&
            recentCount > 0
          ) {
            return (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingBottom: 6,
                  paddingTop: 2,
                }}
              >
                <Text
                  className="text-[14px] leading-5"
                  style={{ color: subtleInkColor }}
                >
                  Tap the heart on any line to pin it here.
                </Text>
              </View>
            );
          }

          return null;
        }}
      />
    </>
  );
}
