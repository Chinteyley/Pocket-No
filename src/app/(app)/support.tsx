import Head from "expo-router/head";
import { Stack } from "expo-router";
import React from "react";
import { Linking, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";

import { cn } from "@/lib/cn";

const FONT_DISPLAY = { fontFamily: "Instrument Serif, serif" } as const;
const FONT_BODY = { fontFamily: "Figtree, sans-serif" } as const;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

const PAGE_DESCRIPTION =
  "Get help with Pocket No. Find answers to common questions or contact support.";

const SUPPORT_SECTIONS = [
  {
    title: "How do I use Pocket No?",
    body: [
      "Tap anywhere on the main screen to get a random way to say no. The line is automatically copied to your clipboard so you can paste it into any conversation.",
      "You can also personalize your experience by tapping the settings icon to adjust the tone and style of responses.",
    ],
  },
  {
    title: "Is my data collected?",
    body: [
      "Pocket No is designed to work without accounts or personal data collection. The clipboard copy and haptic feedback happen entirely on your device.",
      "For full details, see our Privacy Policy.",
    ],
  },
  {
    title: "The app isn't working as expected",
    body: [
      "Try closing and reopening the app. If the issue persists, make sure you have the latest version installed from the App Store.",
      "If you continue to experience problems, reach out to us at support@ctey.dev with a description of what's happening and your device model.",
    ],
  },
  {
    title: "I have a feature request or feedback",
    body: [
      "We'd love to hear from you. Send your ideas or feedback to support@ctey.dev, or open an issue on the project's GitHub repository.",
    ],
  },
  {
    title: "Contact us",
    body: [
      "For any questions, issues, or support requests, email us at support@ctey.dev. We'll do our best to respond promptly.",
    ],
  },
] as const;

function Section({
  body,
  isDesktop,
  title,
}: {
  body: readonly string[];
  isDesktop: boolean;
  title: string;
}) {
  return (
    <View className="border-t border-outline py-8">
      <Text
        className={cn(
          "text-ink",
          isDesktop ? "text-[30px] leading-[36px]" : "text-[26px] leading-[32px]",
        )}
        style={{ ...FONT_DISPLAY, letterSpacing: -0.6 }}
      >
        {title}
      </Text>

      <View className="mt-4 gap-4">
        {body.map((paragraph) => (
          <Text
            key={paragraph}
            className={cn(
              "text-subtle-ink",
              isDesktop ? "text-[17px] leading-[29px]" : "text-[16px] leading-[27px]",
            )}
            style={FONT_BODY}
          >
            {paragraph}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function SupportPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <>
      <Head>
        <title>Support | Pocket No</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta property="og:title" content="Support | Pocket No" />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:title" content="Support | Pocket No" />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
      </Head>

      <ScrollView className="flex-1 bg-paper">
        <Stack.Screen options={{ title: "Support" }} />

        <View
          className={cn(
            "bg-warm-surface px-6 pb-12 pt-10",
            isDesktop && "pb-16 pt-14",
          )}
        >
          <View className={cn("mx-auto w-full", isDesktop && "max-w-[760px]")}>
            <Text
              className={cn(
                "text-accent",
                isDesktop ? "text-[17px]" : "text-[15px]",
              )}
              style={{ ...FONT_BODY, fontWeight: "600", letterSpacing: 0.4 }}
            >
              Support
            </Text>

            <Text
              className={cn(
                "mt-4 text-ink",
                isDesktop
                  ? "text-[64px] leading-[72px]"
                  : "text-[42px] leading-[48px]",
              )}
              style={{ ...FONT_DISPLAY, letterSpacing: -1.4 }}
            >
              We&apos;re here to help.
            </Text>

            <Text
              className={cn(
                "mt-5 max-w-[640px] text-subtle-ink",
                isDesktop ? "text-[19px] leading-[30px]" : "text-[17px] leading-[28px]",
              )}
              style={FONT_BODY}
            >
              Find answers to common questions below, or reach out directly and
              we&apos;ll get back to you as soon as we can.
            </Text>

            <Pressable
              accessibilityRole="link"
              onPress={() => void Linking.openURL("mailto:support@ctey.dev")}
              className="mt-8 self-start items-center justify-center rounded-[16px] bg-button-primary px-8 py-4"
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
                Email support@ctey.dev
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="px-6 py-10">
          <View className={cn("mx-auto w-full", isDesktop && "max-w-[760px]")}>
            {SUPPORT_SECTIONS.map((section) => (
              <Section
                key={section.title}
                title={section.title}
                body={section.body}
                isDesktop={isDesktop}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}
