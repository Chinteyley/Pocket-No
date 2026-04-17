import { Image } from 'expo-image';
import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  SectionList,
  Text,
  View,
  type SectionListRenderItemInfo,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useCSSVariable } from 'uniwind';

import { ReasonRow } from '@/components/no/reason-row';
import { useFavorites } from '@/features/no/favorites-store';
import { clearHistory, useHistory } from '@/features/no/history-store';
import { allReasons, getReasonById, type ReasonEntry } from '@/features/no/reason-catalog';

interface FavoritesSection {
  key: 'favorites' | 'recent';
  title: string;
  data: ReasonEntry[];
  clearAction?: () => void;
  emptyHint?: string;
}

export default function FavoritesScreen() {
  const favorites = useFavorites();
  const history = useHistory();
  const warmSurfaceColor = useCSSVariable('--color-warm-surface') as string;
  const outlineColor = useCSSVariable('--color-outline') as string;
  const inkColor = useCSSVariable('--color-ink') as string;
  const subtleInkColor = useCSSVariable('--color-subtle-ink') as string;
  const accentColor = useCSSVariable('--color-accent') as string;
  const surfaceMutedColor = useCSSVariable('--color-surface-muted') as string;

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

  const sections: FavoritesSection[] = [];
  if (favoriteEntries.length > 0 || recentEntries.length === 0) {
    sections.push({
      key: 'favorites',
      title: 'Favorites',
      data: favoriteEntries,
      emptyHint: 'Tap the heart on any line to save it here.',
    });
  } else {
    sections.push({ key: 'favorites', title: 'Favorites', data: [] });
  }
  if (recentEntries.length > 0) {
    sections.push({
      key: 'recent',
      title: 'Recently copied',
      data: recentEntries,
      clearAction: () => {
        Alert.alert(
          'Clear recent history?',
          'This removes the list of recently copied lines from this device.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: () => clearHistory() },
          ]
        );
      },
    });
  }

  const renderItem = React.useCallback(
    ({ item }: SectionListRenderItemInfo<ReasonEntry, FavoritesSection>) => (
      <ReasonRow entry={item} />
    ),
    []
  );
  const keyExtractor = React.useCallback(
    (item: ReasonEntry, index: number) => `${item.id}-${index}`,
    []
  );

  const count = favoriteEntries.length;
  const headerSubtitle =
    count === 0
      ? recentEntries.length > 0
        ? `${recentEntries.length} recently copied`
        : 'Tap the heart on any line to save it here.'
      : `${count} saved${recentEntries.length > 0 ? ` · ${recentEntries.length} recent` : ''}`;

  return (
    <View className="flex-1 bg-paper">
      <SectionList
        contentInsetAdjustmentBehavior="automatic"
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
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
              Favorites
            </Text>
            <Text
              className="mt-1 text-[14px] font-semibold tracking-[-0.1px]"
              style={{ color: subtleInkColor }}>
              {headerSubtitle}
            </Text>
          </View>
        }
        renderSectionHeader={({ section }) => {
          if (section.key === 'favorites' && count === 0 && recentEntries.length === 0) {
            return null;
          }
          return (
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 22,
                paddingBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: surfaceMutedColor,
              }}>
              <Text
                className="text-[12px] font-bold uppercase tracking-[1.2px]"
                style={{ color: subtleInkColor }}>
                {section.title}
              </Text>
              {section.clearAction ? (
                <Pressable
                  onPress={section.clearAction}
                  accessibilityRole="button"
                  accessibilityLabel="Clear recent history"
                  hitSlop={10}>
                  {({ pressed }) => (
                    <Text
                      className="text-[12px] font-bold uppercase tracking-[1px]"
                      style={{ color: accentColor, opacity: pressed ? 0.55 : 1 }}>
                      Clear
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          );
        }}
        renderSectionFooter={({ section }) => {
          if (section.key === 'favorites' && count === 0 && recentEntries.length === 0) {
            return (
              <View
                style={{
                  paddingHorizontal: 28,
                  paddingVertical: 64,
                  gap: 12,
                  alignItems: 'center',
                }}>
                {Platform.OS === 'ios' ? (
                  <Image
                    contentFit="contain"
                    source="sf:heart"
                    style={{ width: 44, height: 44, opacity: 0.5 }}
                    tintColor={subtleInkColor}
                  />
                ) : (
                  <SymbolView
                    name="heart"
                    size={44}
                    tintColor={subtleInkColor}
                    weight="semibold"
                  />
                )}
                <Text
                  className="text-[22px] leading-[28px] font-extrabold tracking-[-0.6px] text-center"
                  style={{ color: inkColor }}>
                  No favorites yet
                </Text>
                <Text
                  className="text-[15px] leading-[22px] text-center"
                  style={{ color: subtleInkColor, maxWidth: 300 }}>
                  Tap the heart on any line — in Browse, on Home, or in the Copy sheet. Saved
                  lines live here, even offline.
                </Text>
              </View>
            );
          }
          if (section.key === 'favorites' && section.data.length === 0 && recentEntries.length > 0) {
            return (
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 18,
                  gap: 4,
                }}>
                <Text
                  className="text-[14px] leading-[20px]"
                  style={{ color: subtleInkColor }}>
                  Tap the heart on any line to pin it here.
                </Text>
              </View>
            );
          }
          return null;
        }}
      />
    </View>
  );
}
