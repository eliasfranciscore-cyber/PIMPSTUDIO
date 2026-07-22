import AppIntents
import Foundation

enum IntentKeys {
    static let pendingTab = "brunetti_ios_pending_tab"
}

extension AppTab: AppEnum {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Modulo Brunetti")
    static var caseDisplayRepresentations: [AppTab: DisplayRepresentation] = [
        .hoy: "Hoy",
        .reservas: "Reservas",
        .clientes: "Clientes",
        .finanzas: "Finanzas",
        .mas: "Más"
    ]
}

struct OpenBrunettiModuleIntent: AppIntent {
    static var title: LocalizedStringResource = "Abrir modulo Brunetti"
    static var description = IntentDescription("Abre la app interna de Brunetti en un modulo especifico.")
    static var openAppWhenRun = true

    @Parameter(title: "Modulo")
    var module: AppTab

    init() { module = .reservas }
    init(module: AppTab) { self.module = module }

    func perform() async throws -> some IntentResult {
        UserDefaults.standard.set(module.rawValue, forKey: IntentKeys.pendingTab)
        return .result()
    }
}

struct BrunettiShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenBrunettiModuleIntent(module: .hoy),
            phrases: [
                "Abrir agenda de hoy en \(.applicationName)",
                "Ver reservas de hoy en \(.applicationName)"
            ],
            shortTitle: "Hoy",
            systemImageName: "sun.max.fill"
        )
        AppShortcut(
            intent: OpenBrunettiModuleIntent(module: .reservas),
            phrases: [
                "Abrir reservas en \(.applicationName)",
                "Ver reservas de Brunetti en \(.applicationName)"
            ],
            shortTitle: "Reservas",
            systemImageName: "scissors"
        )
        AppShortcut(
            intent: OpenBrunettiModuleIntent(module: .clientes),
            phrases: [
                "Abrir clientes en \(.applicationName)",
                "Ver clientes de Brunetti en \(.applicationName)"
            ],
            shortTitle: "Clientes",
            systemImageName: "person.2.fill"
        )
    }
}
