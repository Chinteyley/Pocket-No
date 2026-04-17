import { Image } from 'expo-image';
import React from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useCSSVariable } from 'uniwind';

import { CategoryChips } from '@/components/no/category-chips';
import { ReasonRow } from '@/components/no/reason-row';
import {
  CATEGORIES,
  getReasonsByCategory,
  type CategoryId,
} from '@/features/no/categories';
import {
  allReasons,
  searchReasons,
  type ReasonEntry,
} from '@/features/no/reason-catalog';

export default function BrowseScreen() {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<CategoryId | null>(null);
  const warmSurfaceColor = useCSSVariable('--color-warm-surface') as string;
  const outlineColor = useCSSVariable('--color-outline') as string;
  const inkColor = useCSSVariable('--color-ink') as string;
  const subtleInkColor = useCSSVariable('--color-subtle-ink') as string;
  const surfaceMutedColor = useCSSVariable('--color-surface-muted') as string;

  const baseList: ReasonEntry[] = category ? getReasonsByCategory(category) : allReasons;

  const filteredList: ReasonEntry[] = React.useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return baseList;
    }

    if (category === null) {
      return searchReasons(trimmed);
    }

    const needle = trimmed.toLowerCase();
    return baseList.filter((entry) => entry.text.toLowerCase().includes(needle));
  }, [baseList, category, query]);

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<ReasonEntry>) => <ReasonRow entry={item} />,
    []
  );
  const keyExtractor = React.useCallback((item: ReasonEntry) => item.id, []);

  const totalCount = allReasons.length;
  const shownCount = filteredList.length;
  const selectedLabel = category
    ? CATEGORIES.find((c) => c.id === category)?.label ?? category
    : null;
  const subtitle = selectedLabel
    ? `${shownCount} in ${selectedLabel}`
    : `${shownCount} of ${totalCount} lines`;

  return (
    <View className="flex-1 bg-paper">
      <FlatList
        contentInsetAdjustmentBehavior="automatic"
        data={filteredList}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={20}
        windowSize={10}
        removeClippedSubviews
        ListHeaderComponent={
          <View
            style={{
              backgroundColor: warmSurfaceColor,
              borderBottomWidth: 1,
              borderBottomColor: outlineColor,
            }}>
            <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
              <Text
                className="text-[32px] leading-[36px] font-extrabold tracking-[-1px]"
                style={{ color: inkColor }}>
                Browse
              </Text>
              <Text
                className="mt-1 text-[14px] font-semibold tracking-[-0.1px]"
                style={{ color: subtleInkColor }}>
                {subtitle}
              </Text>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
              <View
                style={{
                  backgroundColor: surfaceMutedColor,
                  borderRadius: 14,
                  borderCurve: 'continuous',
                  paddingHorizontal: 14,
                }}>
                <TextInput
                  accessibilityLabel="Search refusals"
                  placeholder="Search 1,000+ ways to say no"
                  placeholderTextColor={subtleInkColor}
                  value={query}
                  onChangeText={setQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                  style={{
                    color: inkColor,
                    fontSize: 16,
                    paddingVertical: 12,
                  }}
                />
              </View>
            </View>

            <CategoryChips selected={category} onSelect={setCategory} />
          </View>
        }
        ListEmptyComponent={
          <View
            style={{ paddingHorizontal: 28, paddingVertical: 56, gap: 12, alignItems: 'center' }}>
            {Platform.OS === 'ios' ? (
              <Image
                contentFit="contain"
                source="sf:magnifyingglass"
                style={{ width: 40, height: 40, opacity: 0.5 }}
                tintColor={subtleInkColor}
              />
            ) : (
              <SymbolView
                name="magnifyingglass"
                size={40}
                tintColor={subtleInkColor}
                weight="semibold"
              />
            )}
            <Text
              className="text-[22px] leading-[28px] font-extrabold tracking-[-0.6px] text-center"
              style={{ color: inkColor }}>
              Nothing matches
            </Text>
            <Text
              className="text-[15px] leading-[22px] text-center"
              style={{ color: subtleInkColor, maxWidth: 280 }}>
              {query.trim().length > 0
                ? `No lines matched "${query.trim()}". Try a different word or clear the filter.`
                : 'This category is empty right now.'}
            </Text>
            {(query.trim().length > 0 || category !== null) ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reset search and filters"
                onPress={() => {
                  setQuery('');
                  setCategory(null);
                }}
                style={({ pressed }) => ({
                  marginTop: 6,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: surfaceMutedColor,
                  borderWidth: 1,
                  borderColor: outlineColor,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}>
                <Text
                  className="text-[14px] font-bold tracking-[-0.1px]"
                  style={{ color: inkColor }}>
                  Reset filters
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
      />
    </View>
  );
}
