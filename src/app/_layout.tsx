import "../global.css";
import '@/lib/ai-polyfills';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router/stack";
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaListener,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { Uniwind, useCSSVariable, useUniwind } from "uniwind";

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
  const paperColor = (useCSSVariable("--color-paper") as string) ?? "#ffffff";
  const inkColor = (useCSSVariable("--color-ink") as string) ?? "#111111";
  const { theme: resolvedColorScheme } = useUniwind();
  const navigationTheme = React.useMemo(
    () =>
      resolvedColorScheme === "dark"
        ? {
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: paperColor,
              card: paperColor,
              text: inkColor,
              border: "transparent",
            },
          }
        : {
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: paperColor,
              card: paperColor,
              text: inkColor,
              border: "transparent",
            },
          },
    [inkColor, paperColor, resolvedColorScheme],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaListener
          onChange={({ insets }) => {
            Uniwind.updateInsets(insets);
          }}
        >
          <ThemeProvider value={navigationTheme}>
            <StatusBar style={resolvedColorScheme === "dark" ? "light" : "dark"} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: paperColor },
              }}
            >
              <Stack.Screen name="(app)" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </SafeAreaListener>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  if (process.env.EXPO_OS === "web") {
    return <WebRootLayout />;
  }

  return <NativeRootLayout />;
}
