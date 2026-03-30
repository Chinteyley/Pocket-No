import ExpoModulesCore
import UIKit

public class KeyboardDismissModule: Module {
  private weak var keyboardWindow: UIWindow?
  private var observers: [NSObjectProtocol] = []

  public func definition() -> ModuleDefinition {
    Name("KeyboardDismiss")

    OnCreate {
      observers.append(NotificationCenter.default.addObserver(
        forName: UIResponder.keyboardWillShowNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.keyboardWindow = Self.findKeyboardWindow()
      })

      observers.append(NotificationCenter.default.addObserver(
        forName: UIResponder.keyboardDidHideNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.resetKeyboardWindow()
      })
    }

    OnDestroy {
      for observer in observers {
        NotificationCenter.default.removeObserver(observer)
      }
      observers.removeAll()
    }

    Function("setOffsetY") { (offsetY: Double) in
      DispatchQueue.main.async { [weak self] in
        let clampedOffset = max(0, CGFloat(offsetY))
        self?.keyboardWindow?.transform = CGAffineTransform(translationX: 0, y: clampedOffset)
      }
    }

    Function("resetOffset") {
      DispatchQueue.main.async { [weak self] in
        self?.resetKeyboardWindow()
      }
    }
  }

  private func resetKeyboardWindow() {
    keyboardWindow?.transform = .identity
    keyboardWindow = nil
  }

  private static func findKeyboardWindow() -> UIWindow? {
    for scene in UIApplication.shared.connectedScenes {
      guard let windowScene = scene as? UIWindowScene else { continue }
      for window in windowScene.windows where type(of: window) != UIWindow.self {
        if NSStringFromClass(type(of: window)).contains("Keyboard") {
          return window
        }
      }
    }
    return nil
  }
}
