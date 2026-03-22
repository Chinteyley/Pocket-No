import AppIntents
import Foundation

@main
struct PocketNoShortcutsExtension: AppIntentsExtension {}

@available(iOS 17.0, *)
struct CopyNoIntent: AppIntent {
  static let title: LocalizedStringResource = "Copy No"
  static let description = IntentDescription("Open Pocket-No and copy a fresh reason.")
  static let openAppWhenRun = true
  static let isDiscoverable = true

  @MainActor
  func perform() async throws -> some IntentResult & OpensIntent {
    guard let url = URL(string: "pocketno://copy?entry=action-button") else {
      throw NSError(domain: "PocketNoShortcuts", code: 1)
    }

    return .result(opensIntent: OpenURLIntent(url))
  }
}

@available(iOS 17.0, *)
struct PocketNoAppShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    [
      AppShortcut(
        intent: CopyNoIntent(),
        phrases: [
          "Copy a no in \\(.applicationName)",
          "Get a no from \\(.applicationName)",
          "Open quick copy in \\(.applicationName)",
        ],
        shortTitle: "Copy No",
        systemImageName: "hand.raised.fill"
      ),
    ]
  }
}
