import * as QuickActions from "expo-quick-actions";
import React from "react";
import { Stack } from "expo-router/stack";
import Head from "expo-router/head";
import { useCSSVariable } from "uniwind";

import { useMountEffect } from "@/hooks/useMountEffect";

export const unstable_settings = {
  initialRouteName: "index",
};

function WebAppLayout() {
  return (
    <>
      <Head>
        <title>Pocket No</title>
      </Head>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "#28282a" },
          headerTintColor: "#f5f5f5",
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: "#28282a" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Pocket No" }}
        />
        <Stack.Screen
          name="copy"
          options={{
            title: "Pocket No",
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: "fitToContents",
            headerTransparent: true,
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="personalize"
          options={{
            title: "Personalize",
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.42, 0.88],
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{ title: "Privacy Policy" }}
        />
      </Stack>
    </>
  );
}

function NativeAppLayout() {
  const paperColor = (useCSSVariable("--color-paper") as string) ?? "#ffffff";
  const inkColor = (useCSSVariable("--color-ink") as string) ?? "#111111";

  const prepareNativeSurfaces = React.useEffectEvent(async () => {
    try {
      const isSupported = await QuickActions.isSupported();
      if (!isSupported) {
        return;
      }

      await QuickActions.setItems([
        {
          id: "random-no",
          title: "Random No",
          subtitle: "Copy one fast",
          icon: "prohibit",
        },
      ]);
    } catch (error) {
      console.warn("Failed to configure quick actions", error);
    }
  });

  useMountEffect(() => {
    void prepareNativeSurfaces();
  });

  return (
    <>
      <Head>
        <title>Pocket No</title>
      </Head>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: paperColor },
          headerTintColor: inkColor,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: paperColor },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, title: "Pocket No" }}
        />
        <Stack.Screen
          name="copy"
          options={{
            title: "Pocket No",
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: "fitToContents",
            headerTransparent: true,
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen
          name="personalize"
          options={{
            title: "Personalize",
            presentation: "formSheet",
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.42, 0.88],
          }}
        />
        <Stack.Screen
          name="privacy"
          options={{ title: "Privacy Policy" }}
        />
      </Stack>
    </>
  );
}

export default function AppLayout() {
  if (process.env.EXPO_OS === "web") {
    return <WebAppLayout />;
  }

  return <NativeAppLayout />;
}
