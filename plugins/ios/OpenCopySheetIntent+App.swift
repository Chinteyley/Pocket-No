import UIKit

@available(iOS 17.0, *)
extension OpenCopySheetIntent {
  @MainActor
  func performOpenCopySheet() async throws {
    _ = await UIApplication.shared.open(NoReasonCopySupport.copyRouteURL(entry: "widget"))
  }
}
