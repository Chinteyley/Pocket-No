import AppIntents
import UIKit

@available(iOS 17.0, *)
struct CopyNoShortcutIntent: AppIntent {
  static let title: LocalizedStringResource = "Instant No!"
  static let description = IntentDescription("Open Pocket-No and instantly copy a fresh line.")
  static let openAppWhenRun = true
  static let isDiscoverable = true

  @MainActor
  func perform() async throws -> some IntentResult {
    _ = await UIApplication.shared.open(NoReasonCopySupport.copyRouteURL(entry: "shortcut"))
    return .result()
  }
}

@available(iOS 18.0, *)
struct PocketNoAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: CopyNoShortcutIntent(),
      phrases: [
        "Run Instant No in \(.applicationName)",
        "Open Instant No in \(.applicationName)",
        "Use Instant No in \(.applicationName)",
      ],
      shortTitle: "Instant No!",
      systemImageName: "hand.raised.fill"
    )
  }
}
