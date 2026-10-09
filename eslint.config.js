// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // Reanimated SharedValue `.value` writes are the supported mutation API.
      // The React Compiler immutability rule treats them as React state.
      'react-hooks/immutability': 'off',
    },
  }
]);
