import { Platform } from 'react-native';
import structuredClone from '@ungap/structured-clone';

if (Platform.OS !== 'web') {
  void (async () => {
    const { TextEncoderStream, TextDecoderStream } = await import(
      '@stardazed/streams-text-encoding'
    );
    const globalWithPolyfills = globalThis as typeof globalThis & {
      structuredClone?: typeof structuredClone;
      TextEncoderStream?: typeof TextEncoderStream;
      TextDecoderStream?: typeof TextDecoderStream;
    };

    if (!('structuredClone' in globalWithPolyfills)) {
      globalWithPolyfills.structuredClone = structuredClone;
    }

    if (!('TextEncoderStream' in globalWithPolyfills)) {
      globalWithPolyfills.TextEncoderStream = TextEncoderStream;
    }

    if (!('TextDecoderStream' in globalWithPolyfills)) {
      globalWithPolyfills.TextDecoderStream = TextDecoderStream;
    }
  })();
}
