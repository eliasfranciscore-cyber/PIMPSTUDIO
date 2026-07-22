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

// MARK: - Metric Tile

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

// MARK: - Status Badge

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

// MARK: - Empty Panel

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

// MARK: - Glass Field (login / dark overlay forms)

struct GlassField: View {
    var label: String
    var placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var keyboard: UIKeyboardType = .default
    var autocap: TextInputAutocapitalization = .never
    @State private var showText = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if !label.isEmpty {
                Text(label)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.65))
            }
            HStack(spacing: 10) {
                Group {
                    if isSecure && !showText {
                        SecureField(placeholder, text: $text)
                    } else {
                        TextField(placeholder, text: $text)
                    }
                }
                .keyboardType(keyboard)
                .textInputAutocapitalization(autocap)
                .autocorrectionDisabled()
                .foregroundStyle(.white)
                .tint(BrunettiTheme.gold)

                if isSecure {
                    Button { showText.toggle() } label: {
                        Image(systemName: showText ? "eye.slash.fill" : "eye.fill")
                            .foregroundStyle(.white.opacity(0.5))
                            .font(.footnote)
                    }
                    .buttonStyle(.borderless)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(.white.opacity(0.1), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(.white.opacity(0.18), lineWidth: 1)
            )
        }
    }
}

// MARK: - Glass Form Field (light-background editing forms)

struct GlassFormField: View {
    var label: String
    var placeholder: String = ""
    @Binding var text: String
    var keyboard: UIKeyboardType = .default
    var autocap: TextInputAutocapitalization = .words
    var axis: Axis = .horizontal

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption.weight(.semibold))
                .foregroundStyle(BrunettiTheme.muted)
            TextField(placeholder.isEmpty ? label : placeholder, text: $text, axis: axis)
                .keyboardType(keyboard)
                .textInputAutocapitalization(autocap)
                .autocorrectionDisabled()
                .padding(13)
                .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .foregroundStyle(BrunettiTheme.text)
        }
    }
}

// MARK: - Sheet Row (read-only label + value)

struct InfoRow: View {
    var label: String
    var value: String

    var body: some View {
        HStack(alignment: .top) {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(BrunettiTheme.muted)
                .frame(width: 90, alignment: .leading)
            Text(value)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(BrunettiTheme.text)
            Spacer()
        }
        .padding(.vertical, 3)
    }
}

// MARK: - Sheet Section Header

struct SheetSection: View {
    var title: String
    var body: some View {
        Text(title.uppercased())
            .font(.caption.weight(.bold))
            .foregroundStyle(BrunettiTheme.muted)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 6)
    }
}

// MARK: - Glass Action Button (for sheets)

struct GlassActionButton: View {
    var title: String
    var symbol: String
    var tint: Color = BrunettiTheme.gold
    var role: ButtonRole? = nil
    var action: () -> Void

    private var effectiveTint: Color {
        role == .destructive ? .red : tint
    }

    var body: some View {
        Button(role: role, action: action) {
            Label(title, systemImage: symbol)
                .font(.subheadline.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .foregroundStyle(effectiveTint)
                .brunettiGlass(radius: 16, tint: effectiveTint.opacity(0.12), interactive: true)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Lock Screen Overlay

struct LockScreenOverlay: View {
    @Environment(SessionStore.self) private var session

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea()

            VStack(spacing: 36) {
                Image("BrandLockup")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 260, height: 82)

                VStack(spacing: 8) {
                    Text("Brunetti")
                        .font(.title.weight(.bold))
                    Text("Panel bloqueado")
                        .font(.subheadline)
                        .opacity(0.6)
                }

                Button {
                    Task { await session.unlock() }
                } label: {
                    Image(systemName: "faceid")
                        .font(.system(size: 42))
                        .foregroundStyle(BrunettiTheme.gold)
                        .padding(28)
                        .brunettiGlass(radius: 24, tint: BrunettiTheme.gold.opacity(0.18), interactive: true)
                }
                .buttonStyle(.plain)

                Text("Toca para desbloquear")
                    .font(.caption)
                    .opacity(0.45)
            }
        }
        .onTapGesture {
            Task { await session.unlock() }
        }
        .transition(.opacity)
    }
}
// MARK: - Haptics

func haptic(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
    UIImpactFeedbackGenerator(style: style).impactOccurred()
}

func hapticSuccess() {
    UINotificationFeedbackGenerator().notificationOccurred(.success)
}

func hapticError() {
    UINotificationFeedbackGenerator().notificationOccurred(.error)
}

func hapticSelection() {
    UISelectionFeedbackGenerator().selectionChanged()
}
