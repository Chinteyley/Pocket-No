import { Link } from "expo-router";
import { Linking, Pressable, Text, View } from "react-native";

import { cn } from "@/lib/cn";

const FONT_DISPLAY = { fontFamily: "Instrument Serif, serif" } as const;
const FONT_BODY = { fontFamily: "Figtree, sans-serif" } as const;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

type FooterSectionProps = {
  isDesktop: boolean;
};

export function FooterSection({ isDesktop }: FooterSectionProps) {
  return (
    <View
      className={cn(
        "items-center px-6 pb-16 pt-16",
        isDesktop && "pb-20 pt-24",
      )}
    >
      <View className={cn("w-full items-center", isDesktop && "max-w-[720px]")}>
        <Text
          className={cn(
            "text-center text-ink",
            isDesktop
              ? "text-[48px] leading-[56px]"
              : "text-[36px] leading-[44px]",
          )}
          style={{ ...FONT_DISPLAY, letterSpacing: -1 }}
        >
          Ready to say no?
        </Text>

        <Text
          className={cn(
            "mt-4 text-center text-subtle-ink",
            isDesktop ? "text-[17px]" : "text-[15px]",
          )}
          style={FONT_BODY}
        >
          Available for iOS. Free and open source.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            void Linking.openURL("https://github.com/Chinteyley/Pocket-No")
          }
          className="mt-8 items-center justify-center rounded-[16px] bg-button-primary px-8 py-4"
          style={({ pressed, hovered }) => ({
            transform: pressed
              ? "scale(0.97)"
              : hovered
                ? "scale(1.02)"
                : "scale(1)",
            transition: `transform 160ms ${EASE_OUT}`,
          })}
        >
          <Text
            className="text-[16px] text-button-primary-text"
            style={{ ...FONT_BODY, fontWeight: "600" }}
          >
            View on GitHub
          </Text>
        </Pressable>

        <View className="mt-16 w-full items-center border-t border-outline pt-6">
          <View className="flex-row gap-4">
            <Link href="/support" asChild>
              <Pressable
                accessibilityRole="link"
                className="rounded-full px-3 py-2"
                style={({ pressed, hovered }) => ({
                  opacity: pressed ? 0.7 : 1,
                  transform: hovered ? "translateY(-1px)" : "translateY(0)",
                  transition: `opacity 160ms ${EASE_OUT}, transform 160ms ${EASE_OUT}`,
                })}
              >
                <Text
                  className="text-[14px] text-subtle-ink underline"
                  style={FONT_BODY}
                >
                  Support
                </Text>
              </Pressable>
            </Link>
            <Link href="/privacy" asChild>
              <Pressable
                accessibilityRole="link"
                className="rounded-full px-3 py-2"
                style={({ pressed, hovered }) => ({
                  opacity: pressed ? 0.7 : 1,
                  transform: hovered ? "translateY(-1px)" : "translateY(0)",
                  transition: `opacity 160ms ${EASE_OUT}, transform 160ms ${EASE_OUT}`,
                })}
              >
                <Text
                  className="text-[14px] text-subtle-ink underline"
                  style={FONT_BODY}
                >
                  Privacy Policy
                </Text>
              </Pressable>
            </Link>
          </View>

          <Text className="mt-3 text-[13px] text-muted" style={FONT_BODY}>
            {"\u00A9"} {new Date().getFullYear()} Pocket No. MIT License.
          </Text>
        </View>
      </View>
    </View>
  );
}
