import { requireOptionalNativeModule } from 'expo-modules-core';

type KeyboardDismissModule = {
  setOffsetY(offsetY: number): void;
  resetOffset(): void;
};

function getKeyboardDismiss() {
  return requireOptionalNativeModule<KeyboardDismissModule>('KeyboardDismiss');
}

export function setKeyboardOffsetY(offsetY: number): void {
  getKeyboardDismiss()?.setOffsetY(offsetY);
}

export function resetKeyboardOffset(): void {
  getKeyboardDismiss()?.resetOffset();
}
