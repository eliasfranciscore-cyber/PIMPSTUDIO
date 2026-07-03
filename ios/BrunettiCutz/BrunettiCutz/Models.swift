import Foundation
import SwiftUI

enum AppTab: String, CaseIterable, Identifiable, Sendable {
    case resumen
    case agenda
    case reservas
    case inscripciones
    case finanzas
    case clientes
    case servicios
    case gastos
    case marketing
    case config

    var id: String { rawValue }

    var title: String {
        switch self {
        case .resumen: "Resumen"
        case .agenda: "Agenda"
        case .reservas: "Reservas"
        case .inscripciones: "Workshop"
        case .finanzas: "Finanzas"
        case .clientes: "Clientes"
        case .servicios: "Servicios"
        case .gastos: "Gastos"
        case .marketing: "Marketing"
        case .config: "Config."
        }
    }

    var symbol: String {
        switch self {
        case .resumen: "square.grid.2x2.fill"
        case .agenda: "calendar"
        case .reservas: "scissors"
        case .inscripciones: "graduationcap.fill"
        case .finanzas: "wallet.pass.fill"
        case .clientes: "person.2.fill"
        case .servicios: "list.bullet.clipboard.fill"
        case .gastos: "chart.pie.fill"
        case .marketing: "megaphone.fill"
        case .config: "gearshape.fill"
        }
    }
}

enum ThemeMode: String, Codable, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var title: String {
        switch self {
        case .system: "Sistema"
        case .light: "Claro"
        case .dark: "Oscuro"
        }
    }
}

enum BookingStatus: String, Codable, CaseIterable, Identifiable {
    case pendiente
    case confirmada
    case enCurso = "en curso"
    case completada
    case cancelada

    var id: String { rawValue }

    var label: String {
        switch self {
        case .pendiente: "Pendiente"
        case .confirmada: "Confirmada"
        case .enCurso: "En curso"
        case .completada: "Completada"
        case .cancelada: "Cancelada"
        }
    }

    var tint: Color {
        switch self {
        case .pendiente: .orange
        case .confirmada: .green
        case .enCurso: .blue
        case .completada: .mint
        case .cancelada: .red
        }
    }
}

enum SlotState: String, Codable {
    case free
    case blocked
    case booked

    var label: String {
        switch self {
        case .free: "Atiende"
        case .blocked: "Bloqueado"
        case .booked: "Reservado"
        }
    }

    var tint: Color {
        switch self {
        case .free: .green
        case .blocked: .orange
        case .booked: .red
        }
    }
}

struct Barber: Codable, Identifiable, Hashable {
    var id: Int
    var name: String
    var short: String?
    var code: String?
    var role: String?
    var tier: String?
    var admin: Bool?
    var active: Bool?
    var canViewFinance: Bool?
    var canManageTeam: Bool?
    var canEditServices: Bool?
    var canManageBlocks: Bool?

    var isAdmin: Bool {
        let haystack = "\(name) \(code ?? "") \(role ?? "")".lowercased()
        return admin == true || haystack.contains("brunetti") || haystack.contains("bruno") || haystack.contains("admin")
    }
}

struct Booking: Codable, Identifiable, Hashable {
    var id: Int
    var time: String
    var date: String?
    var client: String
    var phone: String?
    var service: String
    var barberId: Int
    var price: Int
    var status: BookingStatus
}

struct Client: Codable, Identifiable, Hashable {
    var id: Int?
    var name: String
    var phone: String
    var email: String?
    var visits: Int?
    var lastVisit: String?
    var totalSpent: Int?
    var status: String?

    var stableID: String { id.map(String.init) ?? phone }
}

struct ServiceItem: Codable, Identifiable, Hashable {
    var id: Int
    var name: String
    var price: Int
    var min: Int
    var cat: String
    var tne: Bool?
    var desc: String?
    var active: Bool?
}

struct Expense: Codable, Identifiable, Hashable {
    var id: Int
    var date: String
    var category: String
    var detail: String
    var amount: Int
    var owner: String
}

struct AvailabilitySlot: Codable, Identifiable, Hashable {
    var slot: String
    var available: Bool?
    var state: SlotState?

    var id: String { slot }
    var resolvedState: SlotState {
        state ?? (available == false ? .blocked : .free)
    }
}

struct BookingDraft: Identifiable, Hashable {
    var id = UUID()
    var clientName: String
    var phone: String
    var email: String
    var serviceId: Int?
    var date: String
    var time: String
    var note: String
}

struct Enrollment: Codable, Identifiable, Hashable {
    var id: Int
    var name: String
    var phone: String
    var email: String
    var source: String
    var level: String?
    var message: String?
    var edition: String?
    var createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, name, phone, email, source, level, message, edition
        case createdAt = "created_at"
    }
}

struct EnrollmentDraft: Identifiable, Hashable {
    var id = UUID()
    var name: String = ""
    var phone: String = ""
    var email: String = ""
    var source: String = "workshop"
    var level: String = ""
    var message: String = ""
    var edition: String = "23 de agosto"
}

struct APIHealth: Identifiable, Hashable {
    var id = UUID()
    var checkedAt: Date
    var ok: Bool
    var detail: String
}

struct APIEndpointStatus: Identifiable, Hashable {
    var id: String { name }
    var name: String
    var path: String
    var ok: Bool
    var detail: String
}

struct ClientAccount: Codable, Hashable {
    var phone: String
    var name: String
    var email: String?
}

struct ClientAuthResponse: Decodable {
    var ok: Bool?
    var user: ClientAccount?
    var error: String?
}

struct PaymentDraft: Identifiable, Hashable {
    var id = UUID()
    var amount: Int = 49990
    var name: String = ""
    var email: String = ""
    var phone: String = ""
}

struct PaymentSessionResponse: Decodable {
    var sessionUrl: String?
    var sessionId: String?
    var error: String?
}

struct ChannelMetric: Identifiable, Hashable {
    var id: String { name }
    var name: String
    var pct: Int
    var color: Color
}

func clp(_ value: Int) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencyCode = "CLP"
    formatter.currencySymbol = "$"
    formatter.maximumFractionDigits = 0
    formatter.locale = Locale(identifier: "es_CL")
    return formatter.string(from: NSNumber(value: value)) ?? "$\(value)"
}

func isoDate(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
}

func cleanPhone(_ value: String) -> String {
    String(value.filter(\.isNumber).prefix(9))
}
