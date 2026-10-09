# Visual PR review

Every pull request gets an iOS Simulator pass on GitHub Actions: the app is built for the simulator on the PR base commit and again on the PR head, then a Maestro flow (with a `simctl` fallback) walks the main screens. Screenshots and a screen recording from each side are uploaded as workflow artifacts and published to a `pr-media` branch so a sticky PR comment can render a before/after table inline.

This is the cloud equivalent of opening the PR on a Mac and tapping through the app.

## What the workflow does

Workflow file: [`.github/workflows/visual-pr.yml`](../.github/workflows/visual-pr.yml)

1. Runs on `macos-15` (Xcode included) for `pull_request` and `workflow_dispatch`.
2. Checks out the workflow scripts from the merge commit, then builds from two git worktrees: `base.sha` and `head.sha`.
3. Installs JS deps with Bun, runs `expo prebuild --platform ios`, `pod install`, and `xcodebuild` for a **Release** iOS Simulator destination with signing disabled.
4. Boots an iPhone simulator, forces light appearance, a fixed 9:41 status bar, and Reduce Motion (so the existing ambient-background code path stays still).
5. Starts `xcrun simctl io booted recordVideo` and drives [`.maestro/main-paths.yaml`](../.maestro/main-paths.yaml).
6. If Maestro is missing or fails, [`scripts/visual-pr/fallback-tour.sh`](../scripts/visual-pr/fallback-tour.sh) uses `simctl screenshot` and `simctl openurl` on the same routes.
7. Uploads `artifacts/visual-pr/{base,head}/**` as the `ios-visual-review` artifact.
8. Pushes the same files to `pr-media` at `pr/<number>/<runId>/{base,head}/` (and `latest/`) and updates one sticky PR comment with a before/after screenshot table plus video links.

Release is required because this app depends on `expo-dev-client`. A Debug build would open the dev launcher and need Metro; a Release simulator build embeds the JS bundle and can run headlessly.

## Apple Intelligence

Home personalization uses `@react-native-ai/apple`. That stack is **not available in the iOS Simulator**. Production code already treats that as a real device capability check:

- Home hides the personalize pull-tab when `isApplePersonalizationAvailable()` is false.
- `/personalize` shows `Not available on this device.`

The Maestro flow asserts that fallback instead of faking Apple Intelligence. There is no production stub. The only test-only switch is `EXPO_PUBLIC_VISUAL_REVIEW`, which is off unless you set it.

## Deterministic copy

Home and Copy fetch `/api/no` and otherwise pick a random bundled line. That would make every before/after pair look different even when UI did not change.

Two opt-in layers, both off in App Store builds:

| Switch | Default | Effect |
| --- | --- | --- |
| `EXPO_PUBLIC_VISUAL_REVIEW=1` | unset / off | `fetchFreshNoReason()` returns `DEFAULT_NO_REASON` and skips the network. |
| CI fixture at `http://127.0.0.1:8787/api/no` | not started | Same pinned line for commits that predate the env flag. The build script also sets `NSAllowsLocalNetworking` on the **worktree copy of `app.json` only**. |

Do not set `EXPO_PUBLIC_VISUAL_REVIEW` in EAS production env vars.

## Cost

The job uses a GitHub-hosted **macOS** runner and does **two** native simulator builds.

| Plan | What you pay |
| --- | --- |
| Public repository | GitHub-hosted macOS minutes are included for public repos, subject to GitHub’s fair-use policy. |
| Private repository | macOS minutes are billed at a **10×** multiplier against the Actions minutes quota. |

A cold run (empty DerivedData / CocoaPods caches) is commonly **45–80 minutes**. A warm run that only changes JS is often **20–40 minutes**. Two Release compiles dominate the time; Maestro itself is a few minutes.

Ways the workflow already tries to stay cheap:

- Caches Bun, CocoaPods, and DerivedData.
- Cancels an in-progress run when the same PR is pushed again.
- Builds only the simulator, with signing and the compiler index store off.

If this repository cannot start `macos-15` jobs (billing, plan, or org policy), the workflow will sit queued or fail immediately. That is a GitHub account limit, not an app bug.

## Local run

You need a Mac with Xcode, the iOS Simulator, and Bun. Maestro is optional.

```bash
bun install
# optional, but recommended for the same path CI uses
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH:$HOME/.maestro/bin"

EXPO_PUBLIC_VISUAL_REVIEW=1 bun run visual-pr
```

Outputs land in `artifacts/visual-pr/local/` (`home.png`, `browse.png`, `tour.mp4`, and the rest).

Useful env vars:

| Variable | Purpose |
| --- | --- |
| `SIMULATOR_NAME` | Defaults to `iPhone 16`; falls back to the last available iPhone. |
| `DERIVED_DATA_DIR` | Defaults to `~/.cache/pocket-no-deriveddata`. |
| `VISUAL_REVIEW_PORT` | Fixture server port, default `8787`. |
| `EXPO_PUBLIC_VISUAL_REVIEW` | Must be `1` to pin Home copy. |

To capture only the current checkout (no base/head pair):

```bash
bash scripts/visual-pr/run-local.sh
```

To drive Maestro yourself after `bun run ios -- --configuration Release`:

```bash
maestro test .maestro/main-paths.yaml
```

## Comment images

GitHub issue comments cannot host binary uploads, so screenshots are committed to the `pr-media` branch and embedded with `raw.githubusercontent.com` URLs. The workflow needs `contents: write` (to push that branch) and `pull-requests: write` (to update the sticky comment).

If the media push is denied, the job still uploads Actions artifacts. The comment will say so; images will not render inline until `pr-media` is writable.

## Main paths covered

- Home (Copy / New, no personalize cue in the simulator)
- Browse and the Work chip
- Favorites empty state
- Settings
- Support and Privacy
- Personalize fallback (`Not available on this device.`)
- Copy sheet via `pocketno:///copy?entry=app`

Deep links are preferred over tapping `NativeTabs`, which Maestro often cannot see as ordinary buttons.
