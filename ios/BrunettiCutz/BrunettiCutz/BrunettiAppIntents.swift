import AppIntents
import Foundation

enum IntentKeys {
    static let pendingTab = "brunetti_ios_pending_tab"
}

extension AppTab: AppEnum {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Modulo Brunetti")
    static var caseDisplayRepresentations: [AppTab: DisplayRepresentation] = [
        .resumen: "Resumen",
        .agenda: "Agenda",
        .reservas: "Reservas",
        .inscripciones: "Workshop",
        .finanzas: "Finanzas",
        .clientes: "Clientes",
        .servicios: "Servicios",
        .gastos: "Gastos",
        .marketing: "Marketing",
        .config: "Configuracion"
    ]
}

struct OpenBrunettiModuleIntent: AppIntent {
    static var title: LocalizedStringResource = "Abrir modulo Brunetti"
    static var description = IntentDescription("Abre la app interna de Brunetti en un modulo especifico.")
    static var openAppWhenRun = true

    @Parameter(title: "Modulo")
    var module: AppTab

    init() {
        module = .agenda
    }

    init(module: AppTab) {
        self.module = module
    }

    func perform() async throws -> some IntentResult {
        UserDefaults.standard.set(module.rawValue, forKey: IntentKeys.pendingTab)
        return .result()
    }
}

struct BrunettiShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenBrunettiModuleIntent(module: .agenda),
            phrases: [
                "Abrir agenda en \(.applicationName)",
                "Ver agenda de Brunetti en \(.applicationName)"
            ],
            shortTitle: "Agenda",
            systemImageName: "calendar"
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

        AppShortcut(
            intent: OpenBrunettiModuleIntent(module: .inscripciones),
            phrases: [
                "Abrir workshop en \(.applicationName)",
                "Ver inscripciones de Brunetti en \(.applicationName)"
            ],
            shortTitle: "Workshop",
            systemImageName: "graduationcap.fill"
        )
    }
}
