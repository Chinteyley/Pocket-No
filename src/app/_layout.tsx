import "../global.css";

import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router/stack";
import React from "react";
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind, useCSSVariable } from "uniwind";

function WebRootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets);
        }}
      >
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#1f1f1f" },
          }}
        >
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}

function NativeRootLayout() {
  const paperColor = useCSSVariable("--color-paper") as string;

  return (
    <SafeAreaProvider>
      <SafeAreaListener
        onChange={({ insets }) => {
          Uniwind.updateInsets(insets);
        }}
      >
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: paperColor },
          }}
        >
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaListener>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  if (process.env.EXPO_OS === "web") {
    return <WebRootLayout />;
  }

  return <NativeRootLayout />;
}
