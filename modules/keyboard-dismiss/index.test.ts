describe('keyboard-dismiss module wrapper', () => {
  const originalExpoOs = process.env.EXPO_OS;

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    if (originalExpoOs === undefined) {
      delete process.env.EXPO_OS;
    } else {
      process.env.EXPO_OS = originalExpoOs;
    }
  });

  it('calls through to the native module on iOS when available', () => {
    process.env.EXPO_OS = 'ios';

    const setOffsetY = jest.fn();
    const resetOffset = jest.fn();

    jest.doMock('expo-modules-core', () => ({
      requireOptionalNativeModule: jest.fn(() => ({
        setOffsetY,
        resetOffset,
      })),
    }));

    const keyboardDismiss = require('./index') as typeof import('./index');

    keyboardDismiss.setKeyboardOffsetY(48);
    keyboardDismiss.resetKeyboardOffset();

    expect(setOffsetY).toHaveBeenCalledWith(48);
    expect(resetOffset).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when the native module is missing on iOS', () => {
    process.env.EXPO_OS = 'ios';

    jest.doMock('expo-modules-core', () => ({
      requireOptionalNativeModule: jest.fn(() => null),
    }));

    const keyboardDismiss = require('./index') as typeof import('./index');

    expect(() => keyboardDismiss.setKeyboardOffsetY(24)).not.toThrow();
    expect(() => keyboardDismiss.resetKeyboardOffset()).not.toThrow();
  });

  it('is a no-op outside iOS when the native module is unavailable', () => {
    process.env.EXPO_OS = 'android';

    jest.doMock('expo-modules-core', () => ({
      requireOptionalNativeModule: jest.fn(() => null),
    }));

    const keyboardDismiss = require('./index') as typeof import('./index');

    expect(() => keyboardDismiss.setKeyboardOffsetY(12)).not.toThrow();
    expect(() => keyboardDismiss.resetKeyboardOffset()).not.toThrow();
  });
});
