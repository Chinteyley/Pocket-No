import Stack from "expo-router/stack";
import { useCSSVariable } from "uniwind";

export default function SettingsTabLayout() {
  const isIos = process.env.EXPO_OS === "ios";
  const paperColor = (useCSSVariable("--color-paper") as string) ?? "#ffffff";

  return (
    <Stack
      screenOptions={{
        headerShown: isIos,
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: paperColor },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
    </Stack>
  );
}
