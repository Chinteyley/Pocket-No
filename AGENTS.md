# AGENTS.md
This file provides guidance to agents working with code in this repository.
## Build & Run

- `bun run start` — start Expo dev server (requires a custom dev client build, not Expo Go)
- `bun run ios` / `bun run android` — build and run native dev client
- `bun run lint` — ESLint via eslint-config-expo (flat config)
- `bun run test` — Jest via jest-expo preset
- `bun run test -- --testPathPattern=<pattern>` — run a single test file
- EAS Build profiles: development (internal), preview (internal), production

## Key Architecture

- **Expo 55 / React Native 0.83.2 / React 19** with Expo Router (file-system routing, typed routes)
- **Uniwind** for styling (not NativeWind) — `className` on RN components processed via `withUniwindConfig` in metro. CSS variables defined in `src/global.css`, read with `useCSSVariable()` from `uniwind`
- **React Compiler is enabled** (`reactCompiler: true` in app.json) — do not add manual `useMemo`/`useCallback` unless profiling shows need
- **`@bacons/apple-targets`** for iOS App Intent shortcut target in `targets/pocket-no-shortcuts/` (requires iOS 18+)
- Path aliases: `@/*` → `./src/*`, `@/assets/*` → `./assets/*`

## Gotchas

- **Custom dev client required** — `expo-dev-client` is a dependency; native features won't work in Expo Go
- **`reason.json` is shared between JS and native** — the root file is read by `src/features/no/json-catalog.ts` (API route) and referenced by the Swift shortcut target. Keep it as a plain JSON array of strings
- After changing the config plugin (`plugins/with-screenless-quick-copy.js`) or Swift files in `targets/`, run `expo prebuild` to regenerate native projects
- `EXPO_PUBLIC_SITE_ORIGIN` is the single public origin used for Expo Router web/server output and for native client calls to `/api/no`

## Conventions

- Package manager: **bun**
- Branch naming: `feature/`, `fix/`, `refactor/` prefixes
- TypeScript strict mode enabled
