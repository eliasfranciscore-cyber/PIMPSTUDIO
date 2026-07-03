import SwiftUI
import UserNotifications

struct BookingSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    @Environment(SessionStore.self) private var session
    var booking: Booking
    @Bindable var model: DashboardModel
    @State private var status: BookingStatus

    init(booking: Booking, model: DashboardModel) {
        self.booking = booking
        self.model = model
        _status = State(initialValue: booking.status)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    LabeledContent("Cliente", value: booking.client)
                    LabeledContent("Telefono", value: "+56 \(booking.phone ?? "")")
                    LabeledContent("Fecha", value: booking.date ?? model.dateKey)
                    LabeledContent("Hora", value: booking.time)
                    LabeledContent("Servicio", value: booking.service)
                    LabeledContent("Total", value: clp(booking.price))
                }

                Section("Gestion") {
                    Picker("Estado", selection: $status) {
                        ForEach(BookingStatus.allCases) { state in
                            Text(state.label).tag(state)
                        }
                    }

                    Button {
                        Task {
                            await model.update(booking, to: status, api: session.api)
                            dismiss()
                        }
                    } label: {
                        Label("Guardar estado", systemImage: "checkmark.circle.fill")
                    }

                    Button {
                        if let url = whatsappURL(for: booking, status: status) {
                            openURL(url)
                        }
                    } label: {
                        Label("Enviar WhatsApp", systemImage: "message.fill")
                    }

                    Button {
                        Task { await scheduleReminder(for: booking) }
                    } label: {
                        Label("Recordarme 30 min antes", systemImage: "bell.badge.fill")
                    }
                }
            }
            .navigationTitle(booking.client)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Listo") { dismiss() }
                }
            }
        }
    }
}

struct ClientSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var draft: Client

    init(client: Client, model: DashboardModel) {
        self.model = model
        _draft = State(initialValue: client)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Cliente") {
                    TextField("Nombre", text: $draft.name)
                    TextField("Telefono", text: $draft.phone)
                        .keyboardType(.phonePad)
                    TextField("Correo", text: Binding(
                        get: { draft.email ?? "" },
                        set: { draft.email = $0 }
                    ))
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                }

                Section("Historial") {
                    LabeledContent("Visitas", value: "\(draft.visits ?? model.clientHistory.count)")
                    LabeledContent("Total", value: clp(draft.totalSpent ?? model.clientHistory.reduce(0) { $0 + $1.price }))
                    ForEach(model.clientHistory.prefix(6)) { booking in
                        VStack(alignment: .leading, spacing: 3) {
                            Text(booking.service)
                            Text("\(booking.date ?? "") · \(booking.time) · \(clp(booking.price))")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }

                Section("Acciones") {
                    Button {
                        Task {
                            await model.saveClient(draft, api: session.api)
                            dismiss()
                        }
                    } label: {
                        Label("Guardar cliente", systemImage: "checkmark.circle.fill")
                    }

                    Button {
                        if let url = URL(string: "https://wa.me/56\(cleanPhone(draft.phone))?text=\(encoded("Hola \(draft.name.split(separator: " ").first ?? "Hola"), te escribimos de Brunetti 💈"))") {
                            openURL(url)
                        }
                    } label: {
                        Label("Abrir WhatsApp", systemImage: "message.fill")
                    }

                    Button {
                        model.beginBooking(client: draft)
                        dismiss()
                    } label: {
                        Label("Agendar reserva", systemImage: "calendar.badge.plus")
                    }

                    Button {
                        model.enrollmentDraft = EnrollmentDraft(name: draft.name, phone: draft.phone, email: draft.email ?? "", source: "workshop", level: "", message: "", edition: "23 de agosto")
                        dismiss()
                    } label: {
                        Label("Inscribir a workshop", systemImage: "graduationcap.fill")
                    }

                    Button(role: .destructive) {
                        model.deleteClient(draft)
                        dismiss()
                    } label: {
                        Label("Eliminar localmente", systemImage: "trash.fill")
                    }
                }
            }
            .navigationTitle(draft.name.isEmpty ? "Cliente" : draft.name)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Listo") { dismiss() }
                }
            }
        }
    }
}

struct ServiceSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var draft: ServiceItem

    init(service: ServiceItem, model: DashboardModel) {
        self.model = model
        _draft = State(initialValue: service)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Servicio") {
                    TextField("Nombre", text: $draft.name)
                    TextField("Precio", value: $draft.price, format: .number)
                        .keyboardType(.numberPad)
                    TextField("Minutos", value: $draft.min, format: .number)
                        .keyboardType(.numberPad)
                    Picker("Categoria", selection: $draft.cat) {
                        Text("General").tag("general")
                        Text("Premium").tag("premium")
                        Text("Quimico").tag("quimico")
                    }
                    Toggle("TNE", isOn: Binding(get: { draft.tne ?? false }, set: { draft.tne = $0 }))
                    Toggle("Publicado", isOn: Binding(get: { draft.active ?? true }, set: { draft.active = $0 }))
                    TextField("Descripcion", text: Binding(get: { draft.desc ?? "" }, set: { draft.desc = $0 }), axis: .vertical)
                }

                Section {
                    Button {
                        Task {
                            await model.saveService(draft, api: session.api)
                            dismiss()
                        }
                    } label: {
                        Label("Guardar servicio", systemImage: "checkmark.circle.fill")
                    }
                }
            }
            .navigationTitle(draft.name.isEmpty ? "Nuevo servicio" : draft.name)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Listo") { dismiss() }
                }
            }
        }
    }
}

struct ExpenseSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var draft: Expense

    init(expense: Expense, model: DashboardModel) {
        self.model = model
        _draft = State(initialValue: expense)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Gasto") {
                    TextField("Fecha", text: $draft.date)
                    Picker("Categoria", selection: $draft.category) {
                        ForEach(["Insumos", "Equipamiento", "Arriendo", "Marketing", "Personal", "Servicios", "Otros"], id: \.self) {
                            Text($0).tag($0)
                        }
                    }
                    TextField("Detalle", text: $draft.detail)
                    TextField("Monto", value: $draft.amount, format: .number)
                        .keyboardType(.numberPad)
                    TextField("Responsable", text: $draft.owner)
                }

                Section {
                    Button {
                        Task {
                            await model.saveExpense(draft, api: session.api)
                            dismiss()
                        }
                    } label: {
                        Label("Registrar gasto", systemImage: "checkmark.circle.fill")
                    }
                }
            }
            .navigationTitle("Gasto")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Listo") { dismiss() }
                }
            }
        }
    }
}

struct BookingDraftSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    var barberId: Int
    @State private var draft: BookingDraft

    init(draft: BookingDraft, model: DashboardModel, barberId: Int) {
        self.model = model
        self.barberId = barberId
        _draft = State(initialValue: draft)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Cliente") {
                    TextField("Nombre", text: $draft.clientName)
                    TextField("Telefono", text: $draft.phone)
                        .keyboardType(.phonePad)
                    TextField("Correo", text: $draft.email)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                }

                Section("Reserva") {
                    Picker("Servicio", selection: Binding(
                        get: { draft.serviceId ?? model.services.first?.id ?? 0 },
                        set: { draft.serviceId = $0 }
                    )) {
                        ForEach(model.services.filter { $0.active != false }) { service in
                            Text("\(service.name) · \(clp(service.price))").tag(service.id)
                        }
                    }
                    TextField("Fecha", text: $draft.date)
                    TextField("Hora", text: $draft.time)
                    TextField("Nota interna", text: $draft.note, axis: .vertical)
                }

                Section {
                    Button {
                        Task {
                            await model.createBooking(draft, api: session.api, barberId: barberId)
                            dismiss()
                        }
                    } label: {
                        Label("Crear reserva", systemImage: "calendar.badge.plus")
                    }
                    .disabled(draft.clientName.trimmingCharacters(in: .whitespaces).isEmpty || cleanPhone(draft.phone).count < 8 || draft.serviceId == nil)
                }
            }
            .navigationTitle("Nueva reserva")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancelar") {
                        model.bookingDraft = nil
                        dismiss()
                    }
                }
            }
        }
    }
}

struct EnrollmentSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var draft: EnrollmentDraft

    init(draft: EnrollmentDraft, model: DashboardModel) {
        self.model = model
        _draft = State(initialValue: draft)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Contacto") {
                    TextField("Nombre", text: $draft.name)
                    TextField("Telefono", text: $draft.phone)
                        .keyboardType(.phonePad)
                    TextField("Correo", text: $draft.email)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                }

                Section("Programa") {
                    Picker("Origen", selection: $draft.source) {
                        Text("Workshop").tag("workshop")
                        Text("Cursos").tag("cursos")
                    }
                    TextField("Edicion", text: $draft.edition)
                    TextField("Nivel", text: $draft.level)
                    TextField("Mensaje", text: $draft.message, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    Button {
                        Task {
                            await model.saveEnrollment(draft, api: session.api)
                            dismiss()
                        }
                    } label: {
                        Label("Registrar inscripcion", systemImage: "checkmark.circle.fill")
                    }
                    .disabled(draft.name.trimmingCharacters(in: .whitespaces).isEmpty || cleanPhone(draft.phone).count < 8 || !draft.email.contains("@"))
                }
            }
            .navigationTitle("Workshop")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancelar") {
                        model.enrollmentDraft = nil
                        dismiss()
                    }
                }
            }
        }
    }
}

struct PaymentSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var draft: PaymentDraft

    init(draft: PaymentDraft, model: DashboardModel) {
        self.model = model
        _draft = State(initialValue: draft)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Pago") {
                    TextField("Monto", value: $draft.amount, format: .number)
                        .keyboardType(.numberPad)
                    TextField("Nombre", text: $draft.name)
                    TextField("Correo", text: $draft.email)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                    TextField("Telefono", text: $draft.phone)
                        .keyboardType(.phonePad)
                }

                Section {
                    Button {
                        Task {
                            await model.createPayment(draft, api: session.api)
                            if model.paymentSessionURL != nil {
                                dismiss()
                            }
                        }
                    } label: {
                        Label("Crear checkout Fintoc", systemImage: "creditcard.fill")
                    }
                    .disabled(draft.amount <= 0 || draft.name.isEmpty || !draft.email.contains("@") || cleanPhone(draft.phone).count < 8)
                }
            }
            .navigationTitle("Fintoc")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancelar") {
                        model.paymentDraft = nil
                        dismiss()
                    }
                }
            }
        }
    }
}

private func whatsappURL(for booking: Booking, status: BookingStatus) -> URL? {
    let first = booking.client.split(separator: " ").first.map(String.init) ?? "Hola"
    let message: String
    switch status {
    case .confirmada:
        message = "Hola \(first), te confirmamos tu hora en Brunetti el \(booking.date ?? "") a las \(booking.time). Te esperamos!"
    case .enCurso:
        message = "Hola \(first), tu hora de las \(booking.time) con Brunetti esta por comenzar."
    case .completada:
        message = "Hola \(first), gracias por tu visita a Brunetti. Te esperamos pronto."
    case .cancelada:
        message = "Hola \(first), lamentamos avisarte que tu hora del \(booking.date ?? "") a las \(booking.time) fue cancelada. Escribenos para reagendar."
    case .pendiente:
        message = "Hola \(first), te escribimos de Brunetti por tu reserva del \(booking.date ?? "") a las \(booking.time)."
    }
    return URL(string: "https://wa.me/56\(cleanPhone(booking.phone ?? ""))?text=\(encoded(message))")
}

private func encoded(_ value: String) -> String {
    value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? value
}

private func scheduleReminder(for booking: Booking) async {
    let center = UNUserNotificationCenter.current()
    do {
        let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
        guard granted else { return }

        let content = UNMutableNotificationContent()
        content.title = "Reserva Brunetti"
        content.body = "\(booking.client) · \(booking.service) · \(booking.time)"
        content.sound = .default

        let triggerDate = reminderDate(for: booking) ?? Date().addingTimeInterval(5)
        let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: triggerDate)
        let request = UNNotificationRequest(identifier: "booking-\(booking.id)", content: content, trigger: UNCalendarNotificationTrigger(dateMatching: components, repeats: false))
        try await center.add(request)
    } catch {
        return
    }
}

private func reminderDate(for booking: Booking) -> Date? {
    guard let date = booking.date else { return nil }
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.dateFormat = "yyyy-MM-dd HH:mm"
    return formatter.date(from: "\(date) \(booking.time)")?.addingTimeInterval(-30 * 60)
}
