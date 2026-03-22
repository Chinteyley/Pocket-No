import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router/stack';
import React from 'react';

import { noPalette } from '@/features/no/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: noPalette.paper } }}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
