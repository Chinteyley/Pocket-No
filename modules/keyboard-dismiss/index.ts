import { requireOptionalNativeModule } from 'expo-modules-core';

type KeyboardDismissModule = {
  setOffsetY(offsetY: number): void;
  resetOffset(): void;
};

const KeyboardDismiss = requireOptionalNativeModule<KeyboardDismissModule>('KeyboardDismiss');

export function setKeyboardOffsetY(offsetY: number): void {
  KeyboardDismiss?.setOffsetY(offsetY);
}

export function resetKeyboardOffset(): void {
  KeyboardDismiss?.resetOffset();
}
