import React, { useCallback, useRef } from "react";
import {
  Pressable,
  Text,
  View,
  useColorScheme,
  type LayoutChangeEvent,
  type LayoutRectangle,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@/lib/cn";
import type { NoReason } from "@/features/no/contracts";

type ReasonCardProps = {
  reason: NoReason | null;
  eyebrow?: string;
  footer?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  onLongPress?: () => void;
  copyDisabled?: boolean;
  copyState?: "idle" | "success";
  copiedTextColor?: string;
  onTextMeasure?: (cy: number, ry: number, rx: number) => void;
  bottomAccessory?: React.ReactNode;
  hideContent?: boolean;
};

export function ReasonCard({
  reason,
  eyebrow,
  footer,
  isLoading = false,
  loadingLabel = "Loading your next excuse...",
  onLongPress,
  copyDisabled = false,
  copyState = "idle",
  copiedTextColor,
  onTextMeasure,
  bottomAccessory,
  hideContent = false,
}: ReasonCardProps) {
  const rootLayoutRef = useRef<LayoutRectangle | null>(null);
  const textLayoutRef = useRef<LayoutRectangle | null>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const baseTextColor = colorScheme === "dark" ? "#f5f5f5" : "#111111";
  const contentOpacity = useSharedValue(hideContent ? 0 : 1);

  const emitTextMetrics = useCallback(
    (
      rootLayout: LayoutRectangle | null,
      textLayout: LayoutRectangle | null,
    ) => {
      if (!rootLayout || !textLayout || screenHeight <= 0 || screenWidth <= 0) {
        return;
      }

      onTextMeasure?.(
        (rootLayout.y + textLayout.y + textLayout.height / 2) / screenHeight,
        (textLayout.height / 2 + 100) / screenHeight,
        (textLayout.width / 2 + 80) / screenWidth,
      );
    },
    [onTextMeasure, screenHeight, screenWidth],
  );
  const handleRootLayout = useCallback(
    (event: LayoutChangeEvent) => {
      rootLayoutRef.current = event.nativeEvent.layout;
      emitTextMetrics(rootLayoutRef.current, textLayoutRef.current);
    },
    [emitTextMetrics],
  );
  const handleTextLayout = useCallback(
    (event: LayoutChangeEvent) => {
      textLayoutRef.current = event.nativeEvent.layout;
      emitTextMetrics(rootLayoutRef.current, textLayoutRef.current);
    },
    [emitTextMetrics],
  );
  React.useEffect(() => {
    contentOpacity.value = withTiming(hideContent ? 0 : 1, {
      duration: hideContent ? 120 : 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [contentOpacity, hideContent]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const isPlaceholder = reason === null;
  const displayText = reason?.text ?? loadingLabel;
  const supportsCopyFeedback =
    !isPlaceholder &&
    !hideContent &&
    (typeof onLongPress === "function" || copyState === "success");
  const canCopyFromCard =
    !isPlaceholder &&
    !hideContent &&
    typeof onLongPress === "function" &&
    !copyDisabled;

  return (
    <View
      className="flex-1 items-center justify-center px-8 gap-4"
      onLayout={handleRootLayout}
    >
      {eyebrow ? (
        <Text
          selectable
          className="text-xs font-bold tracking-[1px] uppercase text-muted"
        >
          {eyebrow}
        </Text>
      ) : null}

      <View
        onLayout={handleTextLayout}
        className="relative items-center justify-center"
      >
        <Animated.View
          pointerEvents={hideContent ? "none" : "auto"}
          style={contentStyle}
        >
          <Pressable
            accessibilityHint={
              supportsCopyFeedback
                ? copyState === "success"
                  ? "Copied to clipboard."
                  : "Long press to copy this excuse."
                : undefined
            }
            accessibilityLabel={reason?.text}
            accessibilityRole={supportsCopyFeedback ? "button" : undefined}
            delayLongPress={220}
            disabled={!canCopyFromCard}
            onLongPress={onLongPress}
            style={({ pressed }) => ({
              transform: [
                { scale: pressed && supportsCopyFeedback ? 0.985 : 1 },
              ],
            })}
          >
            <Text
              selectable={!canCopyFromCard}
              className={cn(
                "text-center max-w-[420px]",
                isPlaceholder
                  ? "text-2xl leading-8 font-bold tracking-[-0.6px] text-subtle-ink"
                  : "text-[32px] leading-[42px] font-extrabold tracking-[-1.2px] text-ink",
              )}
              style={
                !isPlaceholder && copyState === "success"
                  ? { color: copiedTextColor ?? baseTextColor }
                  : undefined
              }
            >
              {displayText}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {footer ? (
        <View className="max-w-[360px]">
          <Text
            selectable
            className="text-sm leading-[21px] text-subtle-ink text-center"
          >
            {footer}
          </Text>
        </View>
      ) : null}

      {bottomAccessory ? (
        <Animated.View
          pointerEvents={hideContent ? "none" : "auto"}
          style={contentStyle}
        >
          {bottomAccessory}
        </Animated.View>
      ) : null}
    </View>
  );
}
