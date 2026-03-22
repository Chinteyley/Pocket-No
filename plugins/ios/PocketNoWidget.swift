import SwiftUI
import WidgetKit
internal import ExpoWidgets

@available(iOSApplicationExtension 17.0, *)
private struct PocketNoWidgetEntryView: View {
  @Environment(\.widgetFamily) private var widgetFamily

  let entry: WidgetsTimelineEntry

  private var props: NoReasonWidgetProps {
    NoReasonCopySupport.widgetProps(from: entry.props)
  }

  var body: some View {
    Button(intent: CopyNoIntent()) {
      content
    }
    .buttonStyle(.plain)
    .containerBackground(for: .widget) {
      Color(red: 1.0, green: 0.973, blue: 0.937)
    }
  }

  @ViewBuilder
  private var content: some View {
    if widgetFamily == .accessoryInline {
      Text("No: \(props.text)")
        .font(.system(size: 14, weight: .semibold))
        .foregroundStyle(Color(red: 0.91, green: 0.424, blue: 0.184))
        .lineLimit(1)
    } else {
      let isSmall = widgetFamily == .systemSmall

      VStack(alignment: .leading, spacing: isSmall ? 10 : 12) {
        Text(props.kicker)
          .font(.system(size: 11, weight: .bold))
          .textCase(.uppercase)
          .foregroundStyle(Color(red: 0.482, green: 0.353, blue: 0.29))
          .lineLimit(1)

        Text(props.text)
          .font(.system(size: isSmall ? 20 : 24, weight: .black))
          .foregroundStyle(Color(red: 0.133, green: 0.09, blue: 0.059))
          .lineLimit(isSmall ? 4 : 3)
          .multilineTextAlignment(.leading)

        Text(props.detail)
          .font(.system(size: 12, weight: .medium))
          .foregroundStyle(Color(red: 0.522, green: 0.416, blue: 0.345))
          .lineLimit(2)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
      .padding(isSmall ? 14 : 18)
    }
  }
}

struct PocketNoWidget: Widget {
  let name: String = "PocketNoWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: name, provider: WidgetsTimelineProvider(name: name)) { entry in
      PocketNoWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Pocket-No")
    .description("A quick reason for saying no.")
    .supportedFamilies([.systemSmall, .systemMedium, .accessoryInline])
  }
}
