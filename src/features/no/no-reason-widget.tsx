import { Text, VStack } from '@expo/ui/swift-ui';
import {
  background,
  cornerRadius,
  font,
  foregroundStyle,
  lineLimit,
  multilineTextAlignment,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type PocketNoWidgetProps = {
  text: string;
  kicker: string;
};

const pocketNoWidget = (props: PocketNoWidgetProps, environment: WidgetEnvironment) => {
  'widget';

  if (environment.widgetFamily === 'accessoryInline') {
    return (
      <Text
        modifiers={[
          foregroundStyle('#e86c2f'),
          font({ weight: 'semibold' }),
          lineLimit(1),
        ]}>
        No: {props.text}
      </Text>
    );
  }

  const isSmall = environment.widgetFamily === 'systemSmall';

  return (
    <VStack
      modifiers={[
        padding({ all: isSmall ? 14 : 18 }),
        background('#fff8ef'),
        cornerRadius(24),
      ]}>
      <Text
        modifiers={[
          foregroundStyle('#7b5a4a'),
          font({ size: 11, weight: 'bold' }),
          lineLimit(1),
        ]}>
        {props.kicker}
      </Text>
      <Text
        modifiers={[
          foregroundStyle('#22170f'),
          font({ size: isSmall ? 20 : 24, weight: 'black' }),
          lineLimit(isSmall ? 4 : 3),
          multilineTextAlignment('leading'),
        ]}>
        {props.text}
      </Text>
    </VStack>
  );
};

const PocketNoWidget = createWidget('PocketNoWidget', pocketNoWidget);

export default PocketNoWidget;
