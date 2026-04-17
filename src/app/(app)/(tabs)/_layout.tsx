import { Tabs } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Image } from 'expo-image';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Platform } from 'react-native';
import { useCSSVariable } from 'uniwind';

function TabIcon({ name, color, size }: { name: SFSymbol; color: string; size: number }) {
  if (Platform.OS === 'ios') {
    return (
      <Image
        contentFit="contain"
        source={`sf:${name}`}
        style={{ width: size, height: size }}
        tintColor={color}
      />
    );
  }

  return <SymbolView name={name} size={size} tintColor={color} weight="semibold" />;
}

export default function TabsLayout() {
  if (process.env.EXPO_OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="house.fill" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="browse">
          <NativeTabs.Trigger.Icon sf="square.grid.2x2.fill" />
          <NativeTabs.Trigger.Label>Browse</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="favorites">
          <NativeTabs.Trigger.Icon sf="heart.fill" />
          <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon sf="gearshape.fill" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return <FallbackTabs />;
}

function FallbackTabs() {
  const paperColor = (useCSSVariable('--color-paper') as string) ?? '#ffffff';
  const inkColor = (useCSSVariable('--color-ink') as string) ?? '#111111';
  const accentColor = (useCSSVariable('--color-accent') as string) ?? '#e86c2f';
  const subtleInkColor = (useCSSVariable('--color-subtle-ink') as string) ?? '#555555';
  const outlineColor = (useCSSVariable('--color-outline') as string) ?? 'rgba(0,0,0,0.08)';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: subtleInkColor,
        tabBarStyle: {
          backgroundColor: paperColor,
          borderTopColor: outlineColor,
        },
        headerStyle: { backgroundColor: paperColor },
        headerTintColor: inkColor,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="house.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="square.grid.2x2.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="heart.fill" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="gearshape.fill" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
