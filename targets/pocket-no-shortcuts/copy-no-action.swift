import AppIntents
import Foundation
import UIKit
import WidgetKit

struct NoReasonWidgetProps {
  let text: String
  let kicker: String

  var dictionary: [String: Any] {
    [
      "text": text,
      "kicker": kicker,
    ]
  }
}

enum NoReasonCopySupport {
  static let widgetKind = "PocketNoWidget"
  static let appGroupIdentifier = "group.dev.ctey.pocketno"
  static let appScheme = "pocketno"
  static let copyRoutePath = "/copy"
  static let fallbackReason = "In a different season of life, I might say yes\u{2014}but not right now."
  static let widgetKicker = "TAP TO COPY"

  private static let reasonCatalogFileName = "reason"
  private static let reasonCatalogFileExtension = "json"
  private static let widgetTimelineStorageKey = "__expo_widgets_\(widgetKind)_timeline"

  static func copyFreshReason() -> String {
    let copiedText = randomReasonLine()
    UIPasteboard.general.string = copiedText
    updateWidgetSnapshot(text: copiedText)
    return copiedText
  }

  static func copyRouteURL(entry: String) -> URL {
    let queryItems = [
      URLQueryItem(name: "entry", value: entry),
      URLQueryItem(
        name: "launchId",
        value: String(Int(Date().timeIntervalSince1970 * 1000))
      ),
    ]
    var queryComponents = URLComponents()
    queryComponents.queryItems = queryItems
    let query = queryComponents.percentEncodedQuery.map { "?\($0)" } ?? ""

    return URL(string: "\(appScheme)://\(copyRoutePath)\(query)")!
  }

  static func widgetProps(from storedProps: [String: Any]?) -> NoReasonWidgetProps {
    let fallback = NoReasonWidgetProps(
      text: fallbackReason,
      kicker: widgetKicker
    )

    guard let storedProps else {
      return fallback
    }

    return NoReasonWidgetProps(
      text: storedProps["text"] as? String ?? fallback.text,
      kicker: storedProps["kicker"] as? String ?? fallback.kicker
    )
  }

  private static func updateWidgetSnapshot(text: String) {
    guard let defaults = UserDefaults(suiteName: appGroupIdentifier) else {
      return
    }

    let now = Date()
    let farFuture = Calendar.current.date(byAdding: .year, value: 1, to: now) ?? now
    let props = NoReasonWidgetProps(
      text: text,
      kicker: widgetKicker
    ).dictionary

    let entries: [[String: Any]] = [
      ["timestamp": Int(now.timeIntervalSince1970 * 1000), "props": props],
      ["timestamp": Int(farFuture.timeIntervalSince1970 * 1000), "props": props],
    ]

    defaults.set(entries, forKey: widgetTimelineStorageKey)
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
  static let isDiscoverable = false

  @MainActor
  func perform() async throws -> some IntentResult & ReturnsValue<String> {
    let text = NoReasonCopySupport.copyFreshReason()
    return .result(value: text)
  }
}
