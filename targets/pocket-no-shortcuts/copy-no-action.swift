import AppIntents
import Foundation
import UIKit

enum NoReasonCopySupport {
  static let appScheme = "pocketno"
  static let copyRouteHost = "copy"
  static let fallbackReason = "In a different season of life, I might say yes\u{2014}but not right now."

  private static let reasonCatalogFileName = "reason"
  private static let reasonCatalogFileExtension = "json"

  static func copyFreshReason() -> String {
    let copiedText = randomReasonLine()
    UIPasteboard.general.string = copiedText
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
    queryComponents.scheme = appScheme
    queryComponents.host = copyRouteHost
    queryComponents.queryItems = queryItems
    return queryComponents.url!
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
