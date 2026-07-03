import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

enum BrunettiTheme {
    static let gold = Color(red: 0.86, green: 0.66, blue: 0.27)
    static let ink = dynamic(light: UIColor(red: 0.08, green: 0.075, blue: 0.065, alpha: 1), dark: UIColor(red: 0.93, green: 0.91, blue: 0.86, alpha: 1))
    static let text = dynamic(light: UIColor(red: 0.08, green: 0.075, blue: 0.065, alpha: 1), dark: UIColor.white)
    static let muted = dynamic(light: UIColor(red: 0.35, green: 0.33, blue: 0.29, alpha: 1), dark: UIColor(white: 1, alpha: 0.66))
    static let surface = dynamic(light: UIColor(red: 1.0, green: 0.985, blue: 0.94, alpha: 0.86), dark: UIColor(red: 0.13, green: 0.13, blue: 0.12, alpha: 0.78))
    static let field = dynamic(light: UIColor(red: 1.0, green: 0.96, blue: 0.86, alpha: 0.72), dark: UIColor(white: 1, alpha: 0.07))
    static let stroke = dynamic(light: UIColor(red: 0.26, green: 0.21, blue: 0.12, alpha: 0.13), dark: UIColor(white: 1, alpha: 0.1))
    static let soft = Color(red: 0.82, green: 0.80, blue: 0.74)

    static var background: LinearGradient {
        LinearGradient(
            colors: [
                dynamic(light: UIColor(red: 0.98, green: 0.94, blue: 0.84, alpha: 1), dark: UIColor(red: 0.04, green: 0.04, blue: 0.035, alpha: 1)),
                dynamic(light: UIColor(red: 0.91, green: 0.84, blue: 0.68, alpha: 1), dark: UIColor(red: 0.11, green: 0.10, blue: 0.09, alpha: 1)),
                dynamic(light: UIColor(red: 1.0, green: 0.98, blue: 0.92, alpha: 1), dark: UIColor(red: 0.02, green: 0.02, blue: 0.02, alpha: 1))
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    private static func dynamic(light: UIColor, dark: UIColor) -> Color {
        Color(UIColor { traits in
            traits.userInterfaceStyle == .dark ? dark : light
        })
    }
}

extension View {
    @ViewBuilder
    func brunettiGlass(radius: CGFloat = 20, tint: Color = .white.opacity(0.06), interactive: Bool = false) -> some View {
        if #available(iOS 26.0, *) {
            if interactive {
                self.glassEffect(.regular.tint(tint).interactive(), in: .rect(cornerRadius: radius))
            } else {
                self.glassEffect(.regular.tint(tint), in: .rect(cornerRadius: radius))
            }
        } else {
            self
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: radius, style: .continuous)
                        .stroke(.white.opacity(0.12), lineWidth: 1)
                )
        }
    }

    func brunettiCard(radius: CGFloat = 20) -> some View {
        padding(16)
            .background(BrunettiTheme.surface, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .stroke(BrunettiTheme.stroke, lineWidth: 1)
            )
    }
}

struct MetricTile: View {
    var title: String
    var value: String
    var symbol: String
    var tint: Color = BrunettiTheme.gold

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: symbol)
                .font(.headline)
                .foregroundStyle(tint)
                .frame(width: 36, height: 36)
                .brunettiGlass(radius: 12, tint: tint.opacity(0.2), interactive: true)
            Text(value)
                .font(.title3.weight(.bold))
                .foregroundStyle(BrunettiTheme.text)
                .lineLimit(1)
                .minimumScaleFactor(0.72)
            Text(title)
                .font(.caption)
                .foregroundStyle(BrunettiTheme.muted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brunettiCard()
    }
}

struct StatusBadge: View {
    var status: BookingStatus

    var body: some View {
        Text(status.label)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .foregroundStyle(status.tint)
            .background(status.tint.opacity(0.16), in: Capsule())
    }
}

struct EmptyPanel: View {
    var title: String
    var symbol: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: symbol)
                .font(.title2)
                .foregroundStyle(BrunettiTheme.gold)
            Text(title)
                .font(.subheadline)
                .foregroundStyle(BrunettiTheme.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 36)
        .brunettiCard()
    }
}
