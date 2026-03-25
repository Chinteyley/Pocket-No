import Head from "expo-router/head";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";

import { cn } from "@/lib/cn";

const FONT_DISPLAY = { fontFamily: "Instrument Serif, serif" } as const;
const FONT_BODY = { fontFamily: "Figtree, sans-serif" } as const;

const LAST_UPDATED = "March 25, 2026";
const PAGE_DESCRIPTION =
  "Privacy Policy for the Pocket No website and hosted API.";

const POLICY_SECTIONS = [
  {
    title: "What this policy covers",
    body: [
      "This Privacy Policy covers the Pocket No website and the hosted /api/no endpoint used to return a random line. It does not describe the full privacy practices of third-party sites or services that Pocket No links to.",
      "Pocket No is designed to work without accounts, user profiles, or forms that ask you to submit personal content.",
    ],
  },
  {
    title: "Information we process",
    body: [
      "When you load the website or call the hosted API, basic technical request data may be processed by Pocket No and its hosting providers. This can include information such as IP address, browser or device details, timestamps, and request logs used to keep the service running and secure.",
      "Pocket No does not ask you to create an account or intentionally submit personal information through the website.",
    ],
  },
  {
    title: "How Pocket No uses information",
    body: [
      "Pocket No uses technical request data to deliver the site, return a random response from /api/no, monitor availability, and protect the service from abuse or misuse.",
      "The app's clipboard copy and haptic feedback actions happen locally on your device. Pocket No does not need an account to generate a line or copy it.",
    ],
  },
  {
    title: "Cookies and analytics",
    body: [
      "Pocket No does not currently use first-party analytics SDKs or advertising trackers in this codebase.",
      "Pocket No may still rely on standard infrastructure features such as hosting, caching, and security systems that process technical request data in the ordinary course of serving a website.",
    ],
  },
  {
    title: "Third-party services and links",
    body: [
      "Pocket No may use third-party infrastructure providers to host the site and API. Those providers may process technical request information as needed to operate, secure, and deliver the service.",
      "If you follow a link from Pocket No to another site, such as the public GitHub repository, that destination has its own policies and practices.",
    ],
  },
  {
    title: "Data retention",
    body: [
      "Pocket No does not maintain user accounts or a user content database for the website experience described here.",
      "Technical logs or operational records may be retained for as long as reasonably needed for security, debugging, legal compliance, or service reliability.",
    ],
  },
  {
    title: "Children's privacy",
    body: [
      "Pocket No is not directed to children under 13, and the website is not intended to collect personal information from children.",
      "If you believe personal information from a child was provided through Pocket No, contact support@ctey.dev.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "Pocket No may update this Privacy Policy from time to time. When that happens, the Last updated date on this page will change.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For privacy questions or requests about Pocket No, contact support@ctey.dev.",
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

export default function PrivacyPolicyPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <>
      <Head>
        <title>Privacy Policy | Pocket No</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta property="og:title" content="Privacy Policy | Pocket No" />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta
          name="twitter:title"
          content="Privacy Policy | Pocket No"
        />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
      </Head>

      <ScrollView className="flex-1 bg-paper">
        <Stack.Screen options={{ title: "Privacy Policy" }} />

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
              Privacy Policy
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
              Clear rules for a small app.
            </Text>

            <Text
              className={cn(
                "mt-5 max-w-[640px] text-subtle-ink",
                isDesktop ? "text-[19px] leading-[30px]" : "text-[17px] leading-[28px]",
              )}
              style={FONT_BODY}
            >
              Pocket No is intentionally lightweight. This page explains what
              the website and hosted API may process, what happens on your
              device, and how to reach support if you have privacy questions.
            </Text>

            <Text
              className="mt-8 text-[14px] text-muted"
              style={{ ...FONT_BODY, fontWeight: "500" }}
            >
              Last updated: {LAST_UPDATED}
            </Text>
          </View>
        </View>

        <View className="px-6 py-10">
          <View className={cn("mx-auto w-full", isDesktop && "max-w-[760px]")}>
            {POLICY_SECTIONS.map((section) => (
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
