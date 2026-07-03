import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case badStatus(Int)
    case missingData

    var errorDescription: String? {
        switch self {
        case .invalidURL: "URL invalida"
        case .badStatus(let code): "Servidor respondio con codigo \(code)"
        case .missingData: "Respuesta incompleta"
        }
    }
}

struct LoginResponse: Decodable {
    var ok: Bool?
    var barber: Barber?
    var token: String?
    var error: String?
}

struct BookingsResponse: Decodable { var bookings: [Booking]? }
struct ClientsResponse: Decodable { var clients: [Client]? }
struct ServicesResponse: Decodable { var services: [ServiceItem]?; var service: ServiceItem? }
struct ExpensesResponse: Decodable { var expenses: [Expense]?; var expense: Expense? }
struct AvailabilityResponse: Decodable { var slots: [AvailabilitySlot]? }
struct BookingResponse: Decodable { var booking: Booking? }
struct ClientResponse: Decodable { var client: Client? }
struct BarbersResponse: Decodable { var barbers: [Barber]?; var barber: Barber? }
struct EnrollmentsResponse: Decodable { var enrollments: [Enrollment]?; var id: Int?; var ok: Bool? }
struct GenericResponse: Decodable { var ok: Bool?; var saved: Bool?; var error: String?; var pathname: String? }

struct APIClient {
    var baseURLString: String
    var token: String?

    private var baseURL: URL? {
        URL(string: baseURLString.trimmingCharacters(in: CharacterSet(charactersIn: "/")))
    }

    func login(username: String, password: String) async throws -> LoginResponse {
        try await request("/api/auth-barber", method: "POST", body: [
            "username": username,
            "password": password
        ])
    }

    func loadBookings() async throws -> [Booking] {
        let response: BookingsResponse = try await request("/api/bookings")
        return response.bookings ?? []
    }

    func loadBookingHistory(phone: String) async throws -> [Booking] {
        let response: BookingsResponse = try await request("/api/bookings?phone=\(cleanPhone(phone))")
        return response.bookings ?? []
    }

    func updateBooking(_ booking: Booking, status: BookingStatus) async throws -> Booking? {
        let response: BookingResponse = try await request("/api/bookings", method: "PATCH", body: [
            "id": booking.id,
            "status": status.rawValue
        ])
        return response.booking
    }

    func createBooking(draft: BookingDraft, barberId: Int, service: ServiceItem) async throws -> Booking? {
        let response: BookingResponse = try await request("/api/bookings", method: "POST", body: [
            "phone": cleanPhone(draft.phone),
            "barberId": barberId,
            "serviceId": service.id,
            "date": draft.date,
            "time": draft.time
        ])
        if let booking = response.booking {
            return Booking(
                id: booking.id,
                time: String(booking.time.prefix(5)),
                date: booking.date ?? draft.date,
                client: draft.clientName,
                phone: cleanPhone(draft.phone),
                service: service.name,
                barberId: barberId,
                price: service.price,
                status: booking.status
            )
        }
        return nil
    }

    func loadClients() async throws -> [Client] {
        let response: ClientsResponse = try await request("/api/clients")
        return response.clients ?? []
    }

    func saveClient(_ client: Client) async throws -> Client? {
        let response: ClientResponse = try await request("/api/clients", method: "POST", body: [
            "name": client.name,
            "phone": cleanPhone(client.phone),
            "email": client.email ?? ""
        ])
        return response.client
    }

    func registerClient(_ client: Client) async throws -> Bool {
        let response: GenericResponse = try await request("/api/register-client", method: "POST", body: [
            "name": client.name,
            "phone": cleanPhone(client.phone),
            "email": client.email ?? ""
        ])
        return response.ok == true
    }

    func lookupClientAccount(phone: String) async throws -> ClientAccount? {
        let response: ClientAuthResponse = try await request("/api/auth-login", method: "POST", body: [
            "phone": cleanPhone(phone)
        ])
        return response.user
    }

    func loadBarbers(includeInactive: Bool = true) async throws -> [Barber] {
        let response: BarbersResponse = try await request("/api/barbers?includeInactive=\(includeInactive ? "true" : "false")")
        return response.barbers ?? []
    }

    func loadServices(includeInactive: Bool = true) async throws -> [ServiceItem] {
        let response: ServicesResponse = try await request("/api/services?includeInactive=\(includeInactive ? "true" : "false")")
        return response.services ?? []
    }

    func saveService(_ service: ServiceItem, isNew: Bool) async throws -> ServiceItem? {
        let response: ServicesResponse = try await request("/api/services", method: isNew ? "POST" : "PATCH", body: [
            "id": service.id,
            "name": service.name,
            "price": service.price,
            "min": service.min,
            "cat": service.cat,
            "tne": service.tne ?? false,
            "desc": service.desc ?? "",
            "active": service.active ?? true
        ])
        return response.service
    }

    func loadExpenses() async throws -> [Expense] {
        let response: ExpensesResponse = try await request("/api/expenses")
        return response.expenses ?? []
    }

    func loadEnrollments() async throws -> [Enrollment] {
        let response: EnrollmentsResponse = try await request("/api/enrollments")
        return response.enrollments ?? []
    }

    func saveEnrollment(_ draft: EnrollmentDraft) async throws -> Int? {
        let response: EnrollmentsResponse = try await request("/api/enrollments", method: "POST", body: [
            "name": draft.name,
            "phone": cleanPhone(draft.phone),
            "email": draft.email,
            "source": draft.source,
            "level": draft.level,
            "message": draft.message,
            "edition": draft.edition
        ])
        return response.id
    }

    func createPaymentSession(_ draft: PaymentDraft) async throws -> PaymentSessionResponse {
        try await request("/api/fintoc-payments", method: "POST", body: [
            "amount": draft.amount,
            "email": draft.email,
            "name": draft.name,
            "phone": cleanPhone(draft.phone)
        ])
    }

    func saveExpense(_ expense: Expense) async throws -> Expense? {
        let response: ExpensesResponse = try await request("/api/expenses", method: "POST", body: [
            "date": expense.date,
            "category": expense.category,
            "detail": expense.detail,
            "amount": expense.amount,
            "owner": expense.owner
        ])
        return response.expense
    }

    func loadAvailability(barberId: Int, date: String) async throws -> [AvailabilitySlot] {
        let response: AvailabilityResponse = try await request("/api/availability?barberId=\(barberId)&date=\(date)&detail=true")
        return response.slots ?? []
    }

    func setSlot(barberId: Int, date: String, slot: String, blocked: Bool) async throws {
        let _: EmptyResponse = try await request("/api/availability", method: blocked ? "POST" : "DELETE", body: [
            "barberId": barberId,
            "date": date,
            "slot": slot,
            "reason": "Bloqueado desde app iOS"
        ])
    }

    func healthCheck() async -> APIHealth {
        do {
            let services = try await loadServices(includeInactive: false)
            return APIHealth(checkedAt: .now, ok: true, detail: "API OK · \(services.count) servicios disponibles")
        } catch {
            return APIHealth(checkedAt: .now, ok: false, detail: error.localizedDescription)
        }
    }

    func diagnostics(barberId: Int, date: String) async -> [APIEndpointStatus] {
        var rows: [APIEndpointStatus] = []
        rows.append(await check("Servicios", "/api/services") {
            let values = try await loadServices(includeInactive: false)
            return "\(values.count) servicios"
        })
        rows.append(await check("Disponibilidad", "/api/availability") {
            let values = try await loadAvailability(barberId: barberId, date: date)
            return "\(values.count) slots"
        })
        rows.append(await check("Reservas", "/api/bookings") {
            let values = try await loadBookings()
            return "\(values.count) reservas"
        })
        rows.append(await check("Clientes", "/api/clients") {
            let values = try await loadClients()
            return "\(values.count) clientes"
        })
        rows.append(await check("Barberos", "/api/barbers") {
            let values = try await loadBarbers(includeInactive: true)
            return "\(values.count) barberos"
        })
        rows.append(await check("Gastos", "/api/expenses") {
            let values = try await loadExpenses()
            return "\(values.count) gastos"
        })
        rows.append(await check("Inscripciones", "/api/enrollments") {
            let values = try await loadEnrollments()
            return "\(values.count) registros"
        })
        rows.append(APIEndpointStatus(name: "Pagos Fintoc", path: "/api/fintoc-payments", ok: true, detail: "Disponible bajo demanda"))
        rows.append(APIEndpointStatus(name: "Web Push", path: "/api/push", ok: true, detail: "Endpoint PWA; app nativa requiere APNs"))
        rows.append(APIEndpointStatus(name: "Auth cliente", path: "/api/auth-login", ok: true, detail: "Disponible bajo demanda"))
        rows.append(APIEndpointStatus(name: "Registro cliente", path: "/api/register-client", ok: true, detail: "Disponible al crear reservas/clientes"))
        return rows
    }

    private func check(_ name: String, _ path: String, operation: () async throws -> String) async -> APIEndpointStatus {
        do {
            let detail = try await operation()
            return APIEndpointStatus(name: name, path: path, ok: true, detail: detail)
        } catch {
            return APIEndpointStatus(name: name, path: path, ok: false, detail: error.localizedDescription)
        }
    }

    private func request<T: Decodable>(_ path: String, method: String = "GET", body: [String: Any]? = nil) async throws -> T {
        guard let baseURL else { throw APIError.invalidURL }
        guard let url = URL(string: path, relativeTo: baseURL) else { throw APIError.invalidURL }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.timeoutInterval = 18
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
            throw APIError.badStatus(http.statusCode)
        }
        if T.self == EmptyResponse.self {
            return EmptyResponse() as! T
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}

struct EmptyResponse: Decodable {}
