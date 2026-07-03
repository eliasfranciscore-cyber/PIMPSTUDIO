import SwiftUI

@main
struct BrunettiCutzApp: App {
    @State private var session = SessionStore()
    @State private var selectedTab: AppTab = .resumen
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            RootView(selectedTab: $selectedTab)
                .environment(session)
                .onAppear(perform: applyPendingIntent)
                .onChange(of: scenePhase) { _, phase in
                    if phase == .active { applyPendingIntent() }
                }
        }
    }

    private func applyPendingIntent() {
        guard let raw = UserDefaults.standard.string(forKey: IntentKeys.pendingTab),
              let tab = AppTab(rawValue: raw) else { return }
        selectedTab = tab
        UserDefaults.standard.removeObject(forKey: IntentKeys.pendingTab)
    }
}

struct RootView: View {
    @Environment(SessionStore.self) private var session
    @Binding var selectedTab: AppTab

    var body: some View {
        ZStack {
            BrunettiTheme.background.ignoresSafeArea()
            if session.isAuthenticated {
                DashboardView(selectedTab: $selectedTab)
            } else {
                LoginView()
            }
        }
        .preferredColorScheme(preferredScheme)
    }

    private var preferredScheme: ColorScheme? {
        switch session.themeMode {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }
}
