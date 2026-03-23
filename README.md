# Pocket-No

Pocket-No is a small Expo app for one job: generate a sharp, funny, low-friction way to say no and copy it immediately.

The app ships the core screen, a quick-copy route, an API-backed reason feed, and native shortcuts so the same "give me a no now" action can work from more than one surface.

## What It Does

- Shows a fresh "no" line on the home screen.
- Copies the current line to the clipboard.
- Generates another line without leaving the screen.
- Supports a dedicated quick-copy flow at `/copy`.
- Exposes an API route at `/api/no`.
- Registers native quick actions and an App Intent-based shortcut flow on iOS.

## Stack

- Expo 55
- Expo Router
- React 19
- React Native 0.83
- TypeScript
- `expo-quick-actions`
- `@bacons/apple-targets`
- Reanimated + Skia for visual treatment

## Project Shape

```text
.
├── app.json
├── app.config.ts
├── reason.json
├── plugins/
│   └── with-screenless-quick-copy.js
├── targets/
│   └── pocket-no-shortcuts/
└── src/
    ├── app/
    │   ├── _layout.tsx
    │   ├── api/no+api.ts
    │   └── (app)/
    │       ├── _layout.tsx
    │       ├── copy.tsx
    │       └── index.tsx
    ├── components/no/
    ├── features/no/
    └── hooks/
```

## How It Works

`reason.json` is the source catalog for the larger pool of lines. The API route in `src/app/api/no+api.ts` returns a normalized random entry from that file via `src/features/no/remote-catalog.ts`.

UI flows call `fetchFreshNoReason()` from `src/features/no/no-reason-service.ts`. If the API fails, the client falls back to a smaller in-app catalog from `src/features/no/catalog.ts`.

Deep links and native entry points route into the quick-copy screen with an `entry` param so the app can explain whether the copy came from the main app or the action button shortcut.

## Getting Started

### Prerequisites

- Bun
- Xcode for iOS native surfaces
- Android Studio if you want to run Android locally

### Install

```bash
bun install
```

### Run

```bash
bun run start
```

Common targets:

```bash
bun run ios
bun run android
bun run web
```

Lint:

```bash
bun run lint
```

## Environment

`app.config.ts` reads `EXPO_PUBLIC_SITE_ORIGIN` and passes it into the Expo Router plugin when present. Set it when you need an explicit site origin for web/server output.

Example:

```bash
EXPO_PUBLIC_SITE_ORIGIN=https://pocketno.example.com bun run web
```

## Native Surfaces

This repo includes iOS-specific shortcut work:

- Home screen quick action via `expo-quick-actions`
- App Intent target in `targets/pocket-no-shortcuts`
- Custom config plugin in `plugins/with-screenless-quick-copy.js`

Notes:

- The App Intent shortcut target is configured for iOS 18+.
- If you change shortcut target wiring, regenerate native iOS artifacts before validating in Xcode.

## Editing The Reason Catalog

Most content changes start in `reason.json`.

Guidelines:

- Keep entries as plain strings.
- Avoid empty lines.
- Duplicates are removed during normalization.
- The client and native shortcut helpers rely on this catalog shape.

## Useful Files

- `src/app/(app)/index.tsx`: main Pocket-No screen
- `src/app/(app)/copy.tsx`: quick-copy route
- `src/app/api/no+api.ts`: random reason API
- `src/features/no/no-reason-service.ts`: clipboard orchestration
- `src/features/no/remote-catalog.ts`: normalized `reason.json` loader
- `src/features/no/deep-links.ts`: route/scheme helpers
- `plugins/with-screenless-quick-copy.js`: iOS target/resource wiring
- `targets/pocket-no-shortcuts/copy-no-action.swift`: App Intent copy implementation
