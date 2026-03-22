import AppIntents

@main
struct PocketNoShortcutsExtension: AppIntentsExtension {}

@available(iOS 18.0, *)
struct PocketNoAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: CopyNoIntent(),
      phrases: [
        "Copy a no in \(.applicationName)",
        "Get a no from \(.applicationName)",
        "Copy quickly in \(.applicationName)",
      ],
      shortTitle: "Copy No",
      systemImageName: "hand.raised.fill"
    )
  }
}
