import React from "react";
import {
  FlatList,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from "react-native";
import Stack from "expo-router/stack";
import type { SearchBarCommands } from "react-native-screens";

import { CategoryChips } from "@/components/no/category-chips";
import { ReasonRow } from "@/components/no/reason-row";
import {
  TabEmptyState,
  TabFallbackHeader,
  TabStatPill,
  useTabScreenColors,
} from "@/components/no/tab-screen-shell";
import {
  CATEGORIES,
  getReasonsByCategory,
  type CategoryId,
} from "@/features/no/categories";
import {
  allReasons,
  searchReasons,
  type ReasonEntry,
} from "@/features/no/reason-catalog";

export default function BrowseScreen() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<CategoryId | null>(null);
  const searchBarRef = React.useRef<SearchBarCommands | null>(null);
  const {
    paperColor,
    surfaceMutedColor,
    inkColor,
    subtleInkColor,
    accentColor,
  } = useTabScreenColors();
  const isIos = process.env.EXPO_OS === "ios";

  const baseList: ReasonEntry[] = category
    ? getReasonsByCategory(category)
    : allReasons;

  const filteredList: ReasonEntry[] = React.useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return baseList;
    }

    if (category === null) {
      return searchReasons(trimmed);
    }

    const needle = trimmed.toLowerCase();
    return baseList.filter((entry) =>
      entry.text.toLowerCase().includes(needle),
    );
  }, [baseList, category, query]);

  const renderItem = React.useCallback(
    ({ item }: ListRenderItemInfo<ReasonEntry>) => <ReasonRow entry={item} />,
    [],
  );
  const keyExtractor = React.useCallback((item: ReasonEntry) => item.id, []);

  const totalCount = allReasons.length;
  const shownCount = filteredList.length;
  const selectedLabel = category
    ? (CATEGORIES.find((item) => item.id === category)?.label ?? category)
    : null;
  const trimmedQuery = query.trim();
  const countLabel = selectedLabel
    ? `${shownCount} in ${selectedLabel}`
    : `${shownCount} of ${totalCount}`;
  const statusLabel =
    trimmedQuery.length > 0
      ? `Matches for "${trimmedQuery}"`
      : selectedLabel
        ? `Filtering ${selectedLabel}`
        : "Explore every line in the library";

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: paperColor }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 32 }}
        data={filteredList}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={10}
        windowSize={7}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        ListHeaderComponent={
          <View style={{ paddingTop: 0, paddingBottom: 12, gap: 12 }}>
            {isIos ? (
              <Stack.Screen.Title large>Browse</Stack.Screen.Title>
            ) : (
              <>
                <TabFallbackHeader title="Browse" subtitle={countLabel} />
                <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
                  <View
                    style={{
                      backgroundColor: surfaceMutedColor,
                      borderRadius: 14,
                      borderCurve: "continuous",
                      paddingHorizontal: 14,
                    }}
                  >
                    <TextInput
                      accessibilityLabel="Search refusals"
                      placeholder="Search 1,000+ ways to say no"
                      placeholderTextColor={subtleInkColor}
                      selectionColor={accentColor}
                      cursorColor={accentColor}
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
              </>
            )}
            <CategoryChips selected={category} onSelect={setCategory} />
            <View
              style={{
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Text
                className="text-[14px] leading-[20px] font-medium tracking-[-0.15px]"
                style={{ color: subtleInkColor, flex: 1 }}
              >
                {statusLabel}
              </Text>
              <TabStatPill label={countLabel} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <TabEmptyState
            icon="magnifyingglass"
            title="Nothing matches"
            description={
              trimmedQuery.length > 0
                ? `No lines matched "${trimmedQuery}". Try a different word or clear the filter.`
                : "This category is empty right now."
            }
            actionLabel={
              trimmedQuery.length > 0 || category !== null
                ? "Reset filters"
                : undefined
            }
            actionAccessibilityLabel="Reset search and filters"
            onActionPress={
              trimmedQuery.length > 0 || category !== null
                ? () => {
                    setQuery("");
                    setCategory(null);
                    searchBarRef.current?.clearText();
                    searchBarRef.current?.cancelSearch();
                  }
                : undefined
            }
          />
        }
      />
      <Stack.Screen
        options={{
          headerSearchBarOptions: isIos
            ? {
                ref: searchBarRef,
                placeholder: "Search 1,000+ ways to say no",
                hideWhenScrolling: false,
                autoCapitalize: "none",
                onChangeText: (event) =>
                  setQuery(event.nativeEvent.text ?? ""),
                onCancelButtonPress: () => setQuery(""),
              }
            : undefined,
        }}
      />
    </>
  );
}
