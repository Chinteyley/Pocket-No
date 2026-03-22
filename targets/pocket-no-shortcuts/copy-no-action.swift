import AppIntents
import Foundation
import UIKit
import WidgetKit

private struct NoReasonWidgetProps {
  let text: String
  let kicker: String
  let detail: String

  var dictionary: [String: Any] {
    [
      "text": text,
      "kicker": kicker,
      "detail": detail,
    ]
  }
}

enum NoReasonCopySupport {
  static let widgetKind = "PocketNoWidget"
  static let appGroupIdentifier = "group.dev.ctey.pocketno"
  static let fallbackReason = "In a different season of life, I might say yes\u{2014}but not right now."
  static let widgetKicker = "Tap to copy a fresh no"
  static let widgetDetail = "Copies a new line without opening the app."

  private static let reasonCatalogFileName = "reason"
  private static let reasonCatalogFileExtension = "json"
  private static let widgetTimelineStorageKey = "__expo_widgets_\(widgetKind)_timeline"

  static func copyFreshReason() -> String {
    let copiedText = randomReasonLine()
    UIPasteboard.general.string = copiedText
    updateWidgetSnapshot(text: copiedText)
    return copiedText
  }

  static func widgetProps(from storedProps: [String: Any]?) -> NoReasonWidgetProps {
    let fallback = NoReasonWidgetProps(
      text: fallbackReason,
      kicker: widgetKicker,
      detail: widgetDetail
    )

    guard let storedProps else {
      return fallback
    }

    return NoReasonWidgetProps(
      text: storedProps["text"] as? String ?? fallback.text,
      kicker: storedProps["kicker"] as? String ?? fallback.kicker,
      detail: storedProps["detail"] as? String ?? fallback.detail
    )
  }

  private static func updateWidgetSnapshot(text: String) {
    guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
      return
    }

    let entry: [String: Any] = [
      "timestamp": Int(Date().timeIntervalSince1970 * 1000),
      "props": NoReasonWidgetProps(
        text: text,
        kicker: widgetKicker,
        detail: widgetDetail
      ).dictionary,
    ]

    defaults.set([entry], forKey: widgetTimelineStorageKey)
    WidgetCenter.shared.reloadTimelines(ofKind: widgetKind)
  }

  private static func randomReasonLine() -> String {
    let normalizedLines = loadReasonLines()
    return normalizedLines.randomElement() ?? fallbackReason
  }

  private static func loadReasonLines() -> [String] {
    guard
      let url = Bundle.main.url(
        forResource: reasonCatalogFileName,
        withExtension: reasonCatalogFileExtension
      ),
      let data = try? Data(contentsOf: url),
      let payload = try? JSONSerialization.jsonObject(with: data)
    else {
      return []
    }

    return normalizedReasonLines(from: payload)
  }

  private static func normalizedReasonLines(from payload: Any) -> [String] {
    guard let rawReasonLines = payload as? [Any] else {
      return []
    }

    var seenLines = Set<String>()
    var normalizedLines: [String] = []

    for entry in rawReasonLines {
      guard let rawLine = entry as? String else {
        continue
      }

      let normalizedLine = rawLine.trimmingCharacters(in: .whitespacesAndNewlines)
      if normalizedLine.isEmpty || seenLines.contains(normalizedLine) {
        continue
      }

      seenLines.insert(normalizedLine)
      normalizedLines.append(normalizedLine)
    }

    return normalizedLines
  }
}

@available(iOS 17.0, *)
struct CopyNoIntent: AppIntent {
  static let title: LocalizedStringResource = "Copy No"
  static let description = IntentDescription("Copy a fresh Pocket-No line without opening the app.")
  static let openAppWhenRun = false
  static let isDiscoverable = true

  func perform() async throws -> some IntentResult {
    _ = NoReasonCopySupport.copyFreshReason()
    return .result()
  }
}
