import Stack from 'expo-router/stack';
import { useCSSVariable } from 'uniwind';

export default function BrowseTabLayout() {
  const paperColor = (useCSSVariable('--color-paper') as string) ?? '#ffffff';
  const inkColor = (useCSSVariable('--color-ink') as string) ?? '#111111';
  const isIos = process.env.EXPO_OS === 'ios';

  return (
    <Stack
      screenOptions={{
        headerShown: isIos,
        headerLargeTitle: false,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: paperColor },
        headerLargeStyle: { backgroundColor: paperColor },
        headerTintColor: inkColor,
        headerTitleStyle: { color: inkColor },
        headerLargeTitleStyle: { color: inkColor },
        contentStyle: { backgroundColor: paperColor },
      }}>
      <Stack.Screen name="index" options={{ title: 'Browse' }} />
    </Stack>
  );
}
