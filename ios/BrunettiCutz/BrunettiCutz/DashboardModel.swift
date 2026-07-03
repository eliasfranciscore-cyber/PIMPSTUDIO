import Foundation
import Observation

@MainActor
@Observable
final class DashboardModel {
    var bookings = DemoData.bookings
    var barbers = DemoData.barbers
    var clients = DemoData.clients
    var services = DemoData.services
    var expenses = DemoData.expenses
    var enrollments = DemoData.enrollments
    var slots = DemoData.slots
    var selectedDate = Date()
    var isLoading = false
    var message: String?
    var health: APIHealth?
    var endpointStatuses: [APIEndpointStatus] = []
    var paymentDraft: PaymentDraft?
    var paymentSessionURL: URL?
    var clientLookupResult: ClientAccount?
    var selectedBooking: Booking?
    var selectedClient: Client?
    var selectedService: ServiceItem?
    var selectedExpense: Expense?
    var bookingDraft: BookingDraft?
    var enrollmentDraft: EnrollmentDraft?
    var clientHistory: [Booking] = []
    var dashboardFocus: DashboardFocus = .dia

    var dateKey: String { isoDate(selectedDate) }

    var todayBookings: [Booking] {
        bookings
            .filter { ($0.date ?? dateKey) == dateKey }
            .sorted { $0.time < $1.time }
    }

    var pendingCount: Int {
        bookings.filter { $0.status == .pendiente }.count
    }

    var completedBookings: [Booking] {
        bookings.filter { [.confirmada, .enCurso, .completada].contains($0.status) }
    }

    var revenueTotal: Int {
        completedBookings.reduce(0) { $0 + $1.price }
    }

    var expensesTotal: Int {
        expenses.reduce(0) { $0 + $1.amount }
    }

    var avgTicket: Int {
        completedBookings.isEmpty ? 0 : revenueTotal / completedBookings.count
    }

    var occupancy: Double {
        guard !slots.isEmpty else { return 0 }
        let busy = slots.filter { $0.resolvedState != .free }.count
        return Double(busy) / Double(slots.count)
    }

    func refresh(api: APIClient, barberId: Int) async {
        isLoading = true
        defer { isLoading = false }

        async let loadedBookings = try? api.loadBookings()
        async let loadedBarbers = try? api.loadBarbers(includeInactive: true)
        async let loadedClients = try? api.loadClients()
        async let loadedServices = try? api.loadServices(includeInactive: true)
        async let loadedExpenses = try? api.loadExpenses()
        async let loadedEnrollments = try? api.loadEnrollments()
        async let loadedSlots = try? api.loadAvailability(barberId: barberId, date: dateKey)

        if let value = await loadedBookings, !value.isEmpty { bookings = value }
        if let value = await loadedBarbers, !value.isEmpty { barbers = value }
        if let value = await loadedClients, !value.isEmpty { clients = value }
        if let value = await loadedServices, !value.isEmpty { services = value }
        if let value = await loadedExpenses, !value.isEmpty { expenses = value }
        if let value = await loadedEnrollments, !value.isEmpty { enrollments = value }
        if let value = await loadedSlots, !value.isEmpty { slots = value }
        message = "Actualizado \(Date.now.formatted(date: .omitted, time: .shortened))"
    }

    func refreshAgenda(api: APIClient, barberId: Int) async {
        if let value = try? await api.loadAvailability(barberId: barberId, date: dateKey), !value.isEmpty {
            slots = value
        }
    }

    func update(_ booking: Booking, to status: BookingStatus, api: APIClient) async {
        let previous = bookings
        bookings = bookings.map { $0.id == booking.id ? Booking(id: $0.id, time: $0.time, date: $0.date, client: $0.client, phone: $0.phone, service: $0.service, barberId: $0.barberId, price: $0.price, status: status) : $0 }
        do {
            _ = try await api.updateBooking(booking, status: status)
        } catch {
            bookings = previous
            message = "No se pudo actualizar la reserva"
        }
    }

    func openClient(_ client: Client, api: APIClient) async {
        selectedClient = client
        clientHistory = bookings.filter { cleanPhone($0.phone ?? "") == cleanPhone(client.phone) }
        if let history = try? await api.loadBookingHistory(phone: client.phone), !history.isEmpty {
            clientHistory = history
        }
    }

    func saveClient(_ client: Client, api: APIClient) async {
        let clean = Client(id: client.id, name: client.name, phone: cleanPhone(client.phone), email: client.email, visits: client.visits, lastVisit: client.lastVisit, totalSpent: client.totalSpent, status: client.status)
        if let saved = try? await api.saveClient(clean) {
            upsertClient(saved)
        } else {
            upsertClient(clean)
        }
    }

    func deleteClient(_ client: Client) {
        clients.removeAll { $0.stableID == client.stableID }
        selectedClient = nil
    }

    func beginBooking(slot: AvailabilitySlot? = nil, client: Client? = nil) {
        let serviceId = services.first(where: { $0.active != false })?.id
        bookingDraft = BookingDraft(
            clientName: client?.name ?? "",
            phone: client?.phone ?? "",
            email: client?.email ?? "",
            serviceId: serviceId,
            date: dateKey,
            time: slot?.slot ?? nextFreeSlot(),
            note: ""
        )
    }

    func createBooking(_ draft: BookingDraft, api: APIClient, barberId: Int) async {
        guard let service = services.first(where: { $0.id == draft.serviceId }) else {
            message = "Selecciona un servicio"
            return
        }
        let client = Client(id: nil, name: draft.clientName, phone: cleanPhone(draft.phone), email: draft.email, visits: nil, lastVisit: nil, totalSpent: nil, status: "nuevo")
        await saveClient(client, api: api)
        _ = try? await api.registerClient(client)
        do {
            if let booking = try await api.createBooking(draft: draft, barberId: barberId, service: service) {
                bookings.insert(booking, at: 0)
                bookingDraft = nil
                message = "Reserva creada para \(booking.client)"
                await refreshAgenda(api: api, barberId: barberId)
            }
        } catch {
            let offline = Booking(id: Int(Date().timeIntervalSince1970), time: draft.time, date: draft.date, client: draft.clientName, phone: cleanPhone(draft.phone), service: service.name, barberId: barberId, price: service.price, status: .confirmada)
            bookings.insert(offline, at: 0)
            bookingDraft = nil
            message = "Reserva guardada localmente"
        }
    }

    func saveService(_ service: ServiceItem, api: APIClient) async {
        let isNew = !services.contains { $0.id == service.id }
        if let saved = try? await api.saveService(service, isNew: isNew) {
            upsertService(saved)
        } else {
            upsertService(service)
        }
    }

    func saveExpense(_ expense: Expense, api: APIClient) async {
        if let saved = try? await api.saveExpense(expense) {
            expenses.insert(saved, at: 0)
        } else {
            expenses.insert(expense, at: 0)
        }
    }

    func saveEnrollment(_ draft: EnrollmentDraft, api: APIClient) async {
        let fallbackId = Int(Date().timeIntervalSince1970)
        let id = (try? await api.saveEnrollment(draft)) ?? fallbackId
        let enrollment = Enrollment(id: id, name: draft.name, phone: cleanPhone(draft.phone), email: draft.email, source: draft.source, level: draft.level.isEmpty ? nil : draft.level, message: draft.message.isEmpty ? nil : draft.message, edition: draft.edition.isEmpty ? nil : draft.edition, createdAt: ISO8601DateFormatter().string(from: .now))
        enrollments.insert(enrollment, at: 0)
        enrollmentDraft = nil
        message = "Inscripcion registrada"
    }

    func toggleSlot(_ slot: AvailabilitySlot, api: APIClient, barberId: Int) async {
        guard slot.resolvedState != .booked else { return }
        let shouldBlock = slot.resolvedState == .free
        slots = slots.map {
            $0.id == slot.id
            ? AvailabilitySlot(slot: $0.slot, available: !shouldBlock, state: shouldBlock ? .blocked : .free)
            : $0
        }
        do {
            try await api.setSlot(barberId: barberId, date: dateKey, slot: slot.slot, blocked: shouldBlock)
            await refreshAgenda(api: api, barberId: barberId)
        } catch {
            message = "No se pudo cambiar el bloque"
        }
    }

    func checkHealth(api: APIClient) async {
        health = await api.healthCheck()
    }

    func runDiagnostics(api: APIClient, barberId: Int) async {
        endpointStatuses = await api.diagnostics(barberId: barberId, date: dateKey)
        let failing = endpointStatuses.filter { !$0.ok }.count
        health = APIHealth(checkedAt: .now, ok: failing == 0, detail: failing == 0 ? "Todos los endpoints revisados responden" : "\(failing) endpoint(s) con observacion")
    }

    func lookupClient(phone: String, api: APIClient) async {
        do {
            clientLookupResult = try await api.lookupClientAccount(phone: phone)
            message = clientLookupResult == nil ? "Cliente no encontrado" : "Cuenta cliente encontrada"
        } catch {
            clientLookupResult = nil
            message = "No se pudo consultar auth cliente"
        }
    }

    func createPayment(_ draft: PaymentDraft, api: APIClient) async {
        do {
            let response = try await api.createPaymentSession(draft)
            if let raw = response.sessionUrl, let url = URL(string: raw) {
                paymentSessionURL = url
                paymentDraft = nil
                message = "Sesion Fintoc creada"
            } else {
                message = response.error ?? "Fintoc no devolvio URL"
            }
        } catch {
            message = "Fintoc no configurado en este entorno"
        }
    }

    private func nextFreeSlot() -> String {
        slots.first(where: { $0.resolvedState == .free })?.slot ?? "09:00"
    }

    private func upsertClient(_ client: Client) {
        if let index = clients.firstIndex(where: { $0.stableID == client.stableID }) {
            clients[index] = client
        } else {
            clients.insert(client, at: 0)
        }
        selectedClient = client
    }

    private func upsertService(_ service: ServiceItem) {
        if let index = services.firstIndex(where: { $0.id == service.id }) {
            services[index] = service
        } else {
            services.insert(service, at: 0)
        }
    }
}

enum DashboardFocus: String, CaseIterable, Identifiable {
    case dia
    case semana
    case workshop

    var id: String { rawValue }
    var title: String {
        switch self {
        case .dia: "Dia"
        case .semana: "Semana"
        case .workshop: "Workshop"
        }
    }
}
