import AppIntents

@MainActor
protocol OpenCopySheetIntentPerformer {
  func performOpenCopySheet() async throws
}

@available(iOS 17.0, *)
struct OpenCopySheetIntent: AppIntent, OpenCopySheetIntentPerformer {
  static let title: LocalizedStringResource = "Open Copy Sheet"
  static let description = IntentDescription("Open Pocket-No directly into the quick-copy sheet.")
  static let openAppWhenRun = true
  static let isDiscoverable = false

  @MainActor
  func perform() async throws -> some IntentResult {
    try await performOpenCopySheet()
    return .result()
  }
}
