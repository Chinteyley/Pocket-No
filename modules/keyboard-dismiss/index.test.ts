import { requireOptionalNativeModule } from 'expo-modules-core';

import { resetKeyboardOffset, setKeyboardOffsetY } from './index';

jest.mock('expo-modules-core', () => {
  const actual = jest.requireActual('expo-modules-core') as Record<string, unknown>;

  return {
    ...actual,
    requireOptionalNativeModule: jest.fn(() => null),
  };
});

const requireOptionalNativeModuleMock = jest.mocked(requireOptionalNativeModule);

describe('keyboard-dismiss module wrapper', () => {
  const originalExpoOs = process.env.EXPO_OS;

  afterEach(() => {
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
    requireOptionalNativeModuleMock.mockReturnValue({
      setOffsetY,
      resetOffset,
    });

    setKeyboardOffsetY(48);
    resetKeyboardOffset();

    expect(setOffsetY).toHaveBeenCalledWith(48);
    expect(resetOffset).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when the native module is missing on iOS', () => {
    process.env.EXPO_OS = 'ios';
    requireOptionalNativeModuleMock.mockReturnValue(null);

    expect(() => setKeyboardOffsetY(24)).not.toThrow();
    expect(() => resetKeyboardOffset()).not.toThrow();
  });

  it('is a no-op outside iOS when the native module is unavailable', () => {
    process.env.EXPO_OS = 'android';
    requireOptionalNativeModuleMock.mockReturnValue(null);

    expect(() => setKeyboardOffsetY(12)).not.toThrow();
    expect(() => resetKeyboardOffset()).not.toThrow();
  });
});
