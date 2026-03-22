import type { ExpoConfig } from 'expo/config';

const appJson = require('./app.json') as { expo: ExpoConfig };
type ExpoPlugin = string | [string] | [string, Record<string, unknown>];

export default (): ExpoConfig => {
  const origin = process.env.EXPO_PUBLIC_SITE_ORIGIN?.trim();
  const plugins = ((appJson.expo.plugins ?? []) as ExpoPlugin[]).map<ExpoPlugin>((plugin) => {
    if (plugin === 'expo-router') {
      return origin ? ['expo-router', { origin }] : plugin;
    }

    if (Array.isArray(plugin) && plugin[0] === 'expo-router') {
      const pluginConfig =
        typeof plugin[1] === 'object' && plugin[1] !== null
          ? (plugin[1] as Record<string, unknown>)
          : {};

      return origin ? ['expo-router', { ...pluginConfig, origin }] : ['expo-router', pluginConfig];
    }

    return plugin;
  });

  return {
    ...appJson.expo,
    plugins,
  };
};
