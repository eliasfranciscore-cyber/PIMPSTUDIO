import Foundation
import SwiftUI

enum DemoData {
    static let barber = Barber(
        id: 6,
        name: "Brunetti",
        short: "Brunetti",
        code: "bruno-herrera",
        role: "Visagista · Director de imagen",
        tier: nil,
        admin: true,
        active: true,
        canViewFinance: true,
        canManageTeam: true,
        canEditServices: true,
        canManageBlocks: true
    )

    static let barbers: [Barber] = [barber]

    static let services: [ServiceItem] = [
        .init(id: 5, name: "Asesoría de corte", price: 24990, min: 90, cat: "general", tne: true, desc: "Consulta profesional para encontrar tu estilo ideal.", active: true),
        .init(id: 6, name: "Corte de cabello", price: 15990, min: 60, cat: "general", tne: true, desc: "Corte profesional con técnicas modernas y clásicas.", active: true),
        .init(id: 7, name: "Corte + perfilado de barba", price: 22990, min: 75, cat: "general", tne: true, desc: "Servicio completo de corte y arreglo de barba.", active: true),
        .init(id: 8, name: "Perfilado de barba", price: 11990, min: 45, cat: "general", tne: true, desc: "Perfilado y arreglo profesional de barba.", active: true),
        .init(id: 9, name: "Solo fade", price: 9990, min: 40, cat: "general", tne: true, desc: "Degradado perfecto y limpio.", active: true),
        .init(id: 10, name: "Asesoría de Imagen · Visagista", price: 39990, min: 120, cat: "premium", tne: false, desc: "Consulta personalizada según tu fisonomía.", active: true),
        .init(id: 13, name: "Ondulación permanente", price: 65990, min: 180, cat: "quimico", tne: false, desc: "Forma y textura duradera al cabello.", active: true),
        .init(id: 14, name: "Platinado Global", price: 89990, min: 240, cat: "quimico", tne: false, desc: "Decoloración completa para un rubio platino.", active: true),
        .init(id: 15, name: "Visos Platinados", price: 74990, min: 210, cat: "quimico", tne: false, desc: "Mechas platinadas para un look sofisticado.", active: true)
    ]

    static let clients: [Client] = [
        .init(id: 1, name: "Carlos Rodriguez", phone: "987654321", email: "carlos@ejemplo.com", visits: 4, lastVisit: "2026-05-22", totalSpent: 68960, status: "activo"),
        .init(id: 2, name: "Maria Gonzalez", phone: "912345678", email: "maria@ejemplo.com", visits: 2, lastVisit: "2026-06-04", totalSpent: 55980, status: "activo"),
        .init(id: 3, name: "Pedro Soto", phone: "956789012", email: "pedro@ejemplo.com", visits: 1, lastVisit: "2026-06-09", totalSpent: 9990, status: "nuevo")
    ]

    static let bookings: [Booking] = [
        .init(id: 1, time: "09:00", date: isoDate(.now), client: "Carlos Rodríguez", phone: "987654321", service: "Corte + perfilado de barba", barberId: 6, price: 22990, status: .confirmada),
        .init(id: 2, time: "10:00", date: isoDate(.now), client: "Diego Salinas", phone: "934567890", service: "Corte de cabello", barberId: 6, price: 15990, status: .enCurso),
        .init(id: 3, time: "11:00", date: isoDate(.now), client: "Felipe Aravena", phone: "956781230", service: "Perfilado de barba", barberId: 6, price: 11990, status: .confirmada),
        .init(id: 4, time: "12:00", date: isoDate(.now), client: "Joaquín Reyes", phone: "912300000", service: "Corte de cabello", barberId: 6, price: 15990, status: .confirmada),
        .init(id: 5, time: "15:00", date: isoDate(.now), client: "Sebastián Núñez", phone: "977771111", service: "Platinado Global", barberId: 6, price: 89990, status: .confirmada),
        .init(id: 6, time: "17:00", date: isoDate(.now), client: "Vicente Lagos", phone: "966662222", service: "Visos Platinados", barberId: 6, price: 74990, status: .pendiente),
        .init(id: 7, time: "18:00", date: isoDate(.now), client: "Andrés Fuentes", phone: "955553333", service: "Solo fade", barberId: 6, price: 9990, status: .confirmada)
    ]

    static let expenses: [Expense] = [
        .init(id: 1, date: "2026-06-03", category: "Insumos", detail: "Cera, navajas y peines", amount: 145000, owner: "Brunetti"),
        .init(id: 2, date: "2026-06-05", category: "Marketing", detail: "Campaña Instagram", amount: 85000, owner: "Brunetti"),
        .init(id: 3, date: "2026-06-08", category: "Arriendo", detail: "Local Monumento 1750", amount: 620000, owner: "Administracion")
    ]

    static let enrollments: [Enrollment] = [
        .init(id: 1, name: "Demo Workshop", phone: "987654321", email: "demo2@mail.com", source: "workshop", level: nil, message: "Quiero mejorar mi contenido para Instagram.", edition: "23 de agosto", createdAt: "2026-06-21T11:00:00Z"),
        .init(id: 2, name: "Demo Barbero", phone: "912345678", email: "demo@mail.com", source: "cursos", level: "Estoy empezando", message: "", edition: nil, createdAt: "2026-06-20T10:00:00Z")
    ]

    static let slots: [AvailabilitySlot] = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ].map { hour in
        let booked = ["10:00", "15:00", "17:00"].contains(hour)
        return AvailabilitySlot(slot: hour, available: !booked, state: booked ? .booked : .free)
    }

    static let channels: [ChannelMetric] = [
        .init(name: "Instagram", pct: 38, color: .orange),
        .init(name: "Recomendación", pct: 27, color: .mint),
        .init(name: "Google Maps", pct: 18, color: .blue),
        .init(name: "Walk-in", pct: 11, color: .purple),
        .init(name: "TNE estudiante", pct: 6, color: .gray)
    ]
}
