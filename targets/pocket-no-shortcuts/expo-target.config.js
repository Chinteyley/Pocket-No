/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'app-intent',
  name: 'PocketNoShortcuts',
  displayName: 'Pocket-No Shortcuts',
  bundleIdentifier: '.shortcuts',
  deploymentTarget: '18.0',
  entitlements: {
    'com.apple.security.application-groups': ['group.dev.ctey.pocketno'],
  },
};
