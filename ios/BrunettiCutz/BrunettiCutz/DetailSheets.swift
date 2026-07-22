import SwiftUI
import UserNotifications

// MARK: - Booking Sheet

struct BookingSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    @Environment(SessionStore.self) private var session
    var booking: Booking
    @Bindable var model: DashboardModel
    @State private var status: BookingStatus
    @State private var editedDate: String
    @State private var editedTime: String
    @State private var editedService: String

    init(booking: Booking, model: DashboardModel) {
        self.booking = booking
        self.model = model
        _status = State(initialValue: booking.status)
        _editedDate = State(initialValue: booking.date ?? model.dateKey)
        _editedTime = State(initialValue: booking.time)
        _editedService = State(initialValue: booking.service)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Info card
                    VStack(spacing: 0) {
                        SheetSection(title: "Reserva")
                        InfoRow(label: "Cliente", value: booking.client)
                        Divider().padding(.vertical, 4)
                        InfoRow(label: "Teléfono", value: "+56 \(booking.phone ?? "")")
                        Divider().padding(.vertical, 4)
                        InfoRow(label: "Fecha", value: booking.date ?? model.dateKey)
                        Divider().padding(.vertical, 4)
                        InfoRow(label: "Hora", value: booking.time)
                        Divider().padding(.vertical, 4)
                        InfoRow(label: "Servicio", value: booking.service)
                        Divider().padding(.vertical, 4)
                        InfoRow(label: "Total", value: clp(booking.price))
                    }
                    .brunettiCard(radius: 20)

                    // Edit fields
                    VStack(spacing: 12) {
                        SheetSection(title: "Editar")
                        HStack(spacing: 12) {
                            GlassFormField(label: "Fecha", placeholder: "YYYY-MM-DD", text: $editedDate, autocap: .never)
                            GlassFormField(label: "Hora", placeholder: "09:00", text: $editedTime, autocap: .never)
                        }
                        GlassFormField(label: "Servicio", placeholder: "Servicio", text: $editedService)
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                            ForEach(BookingStatus.allCases) { state in
                                StatusChoiceButton(
                                    status: state,
                                    selected: status == state
                                ) {
                                    status = state
                                    hapticSelection()
                                }
                            }
                        }
                    }
                    .brunettiCard(radius: 20)

                    // Actions
                    VStack(spacing: 10) {
                        GlassActionButton(title: "Guardar cambios", symbol: "checkmark.circle.fill", tint: BrunettiTheme.gold) {
                            Task {
                                let edited = Booking(
                                    id: booking.id,
                                    time: String(editedTime.prefix(5)),
                                    date: editedDate,
                                    client: booking.client,
                                    phone: booking.phone,
                                    service: editedService,
                                    barberId: booking.barberId,
                                    price: booking.price,
                                    status: status
                                )
                                await model.saveBookingEdits(edited, api: session.api)
                                dismiss()
                            }
                        }
                        GlassActionButton(title: "Enviar WhatsApp", symbol: "message.fill", tint: .green) {
                            if let url = whatsappURL(for: booking, status: status) { openURL(url) }
                        }
                        GlassActionButton(title: "Recordarme 30 min antes", symbol: "bell.badge.fill", tint: .blue) {
                            Task { await scheduleReminder(for: booking) }
                        }
                    }
                }
                .padding(20)
            }
            .background(BrunettiTheme.background.ignoresSafeArea())
            .scrollIndicators(.hidden)
            .navigationTitle(booking.client)
            .navigationBarTitleDisplayMode(.inline)
            .presentationBackground(.regularMaterial)
            .presentationCornerRadius(32)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Listo") { dismiss() }
                        .fontWeight(.semibold)
                        .foregroundStyle(BrunettiTheme.gold)
                }
            }
        }
    }
}

private struct StatusChoiceButton: View {
    var status: BookingStatus
    var selected: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: symbol)
                    .font(.subheadline.weight(.bold))
                Text(status.label)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 12)
            .foregroundStyle(selected ? .black : status.tint)
            .background(selected ? status.tint : status.tint.opacity(0.14), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(status.tint.opacity(selected ? 0 : 0.45), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var symbol: String {
        switch status {
        case .pendiente: "clock.fill"
        case .confirmada: "checkmark.seal.fill"
        case .enCurso: "scissors"
        case .completada: "checkmark.circle.fill"
        case .cancelada: "xmark.circle.fill"
        }
    }
}

// MARK: - Client Sheet

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
            ScrollView {
                VStack(spacing: 16) {
                    // Avatar header
                    VStack(spacing: 10) {
                        ZStack {
                            Circle().fill(BrunettiTheme.gold)
                            Text(String(draft.name.prefix(1)).uppercased())
                                .font(.largeTitle.weight(.bold))
                                .foregroundStyle(.black)
                        }
                        .frame(width: 72, height: 72)
                        .brunettiGlass(radius: 36, tint: BrunettiTheme.gold.opacity(0.3), interactive: true)

                        if let visits = draft.visits, visits > 0 {
                            Label("\(visits) visitas · \(clp(draft.totalSpent ?? 0))", systemImage: "clock.arrow.circlepath")
                                .font(.caption)
                                .foregroundStyle(BrunettiTheme.muted)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)

                    // Edit fields
                    VStack(spacing: 12) {
                        SheetSection(title: "Datos")
                        GlassFormField(label: "Nombre", placeholder: "Nombre completo", text: $draft.name)
                        GlassFormField(label: "Teléfono", placeholder: "9XXXXXXXX", text: $draft.phone, keyboard: .phonePad, autocap: .never)
                        GlassFormField(label: "Correo", placeholder: "correo@mail.com", text: Binding(
                            get: { draft.email ?? "" },
                            set: { draft.email = $0 }
                        ), keyboard: .emailAddress, autocap: .never)
                    }
                    .brunettiCard(radius: 20)

                    // History
                    if !model.clientHistory.isEmpty {
                        VStack(spacing: 12) {
                            SheetSection(title: "Historial reciente")
                            ForEach(model.clientHistory.prefix(6)) { booking in
                                HStack {
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(booking.service).font(.subheadline.weight(.medium)).foregroundStyle(BrunettiTheme.text)
                                        Text("\(booking.date ?? "") · \(booking.time)").font(.caption).foregroundStyle(BrunettiTheme.muted)
                                    }
                                    Spacer()
                                    Text(clp(booking.price)).font(.subheadline.weight(.semibold)).foregroundStyle(BrunettiTheme.gold)
                                }
                                .padding(.vertical, 4)
                            }
                        }
                        .brunettiCard(radius: 20)
                    }

                    // Actions
                    VStack(spacing: 10) {
                        GlassActionButton(title: "Guardar cliente", symbol: "checkmark.circle.fill") {
                            Task { await model.saveClient(draft, api: session.api); dismiss() }
                        }
                        GlassActionButton(title: "Abrir WhatsApp", symbol: "message.fill", tint: .green) {
                            if let url = URL(string: "https://wa.me/56\(cleanPhone(draft.phone))?text=\(encoded("Hola \(draft.name.split(separator: " ").first ?? ""), te escribimos de Brunetti 💈"))") {
                                openURL(url)
                            }
                        }
                        GlassActionButton(title: "Agendar reserva", symbol: "calendar.badge.plus", tint: .blue) {
                            let client = draft
                            dismiss()
                            Task {
                                try? await Task.sleep(for: .milliseconds(250))
                                model.beginBooking(client: client)
                            }
                        }
                        GlassActionButton(title: "Inscribir a workshop", symbol: "graduationcap.fill", tint: .purple) {
                            let enrollment = EnrollmentDraft(name: draft.name, phone: draft.phone, email: draft.email ?? "", source: "workshop", level: "", message: "", edition: "23 de agosto")
                            dismiss()
                            Task {
                                try? await Task.sleep(for: .milliseconds(250))
                                model.enrollmentDraft = enrollment
                            }
                        }
                        GlassActionButton(title: "Eliminar localmente", symbol: "trash.fill", role: .destructive) {
                            model.deleteClient(draft); dismiss()
                        }
                    }
                }
                .padding(20)
            }
            .background(BrunettiTheme.background.ignoresSafeArea())
            .scrollIndicators(.hidden)
            .navigationTitle(draft.name.isEmpty ? "Cliente" : draft.name)
            .navigationBarTitleDisplayMode(.inline)
            .presentationBackground(.regularMaterial)
            .presentationCornerRadius(32)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Listo") { dismiss() }.fontWeight(.semibold).foregroundStyle(BrunettiTheme.gold)
                }
            }
        }
    }
}

// MARK: - Service Sheet

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
            ScrollView {
                VStack(spacing: 16) {
                    VStack(spacing: 12) {
                        SheetSection(title: "Servicio")
                        GlassFormField(label: "Nombre", placeholder: "Corte clásico", text: $draft.name)
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Precio").font(.caption.weight(.semibold)).foregroundStyle(BrunettiTheme.muted)
                                TextField("0", value: $draft.price, format: .number)
                                    .keyboardType(.numberPad)
                                    .padding(13)
                                    .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                                    .foregroundStyle(BrunettiTheme.text)
                            }
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Minutos").font(.caption.weight(.semibold)).foregroundStyle(BrunettiTheme.muted)
                                TextField("60", value: $draft.min, format: .number)
                                    .keyboardType(.numberPad)
                                    .padding(13)
                                    .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                                    .foregroundStyle(BrunettiTheme.text)
                            }
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Categoría").font(.caption.weight(.semibold)).foregroundStyle(BrunettiTheme.muted)
                            Picker("Categoría", selection: $draft.cat) {
                                Text("General").tag("general")
                                Text("Premium").tag("premium")
                                Text("Químico").tag("quimico")
                            }
                            .pickerStyle(.segmented)
                            .padding(4)
                            .brunettiGlass(radius: 12, interactive: true)
                        }

                        GlassFormField(label: "Descripción", placeholder: "Descripción del servicio...", text: Binding(
                            get: { draft.desc ?? "" }, set: { draft.desc = $0 }
                        ), axis: .vertical)

                        HStack {
                            Toggle("TNE", isOn: Binding(get: { draft.tne ?? false }, set: { draft.tne = $0 }))
                                .tint(BrunettiTheme.gold)
                            Spacer()
                            Toggle("Publicado", isOn: Binding(get: { draft.active ?? true }, set: { draft.active = $0 }))
                                .tint(.green)
                        }
                    }
                    .brunettiCard(radius: 20)

                    GlassActionButton(title: "Guardar servicio", symbol: "checkmark.circle.fill") {
                        Task { await model.saveService(draft, api: session.api); dismiss() }
                    }
                }
                .padding(20)
            }
            .background(BrunettiTheme.background.ignoresSafeArea())
            .scrollIndicators(.hidden)
            .navigationTitle(draft.name.isEmpty ? "Nuevo servicio" : draft.name)
            .navigationBarTitleDisplayMode(.inline)
            .presentationBackground(.regularMaterial)
            .presentationCornerRadius(32)
            .presentationDetents([.medium, .large])
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Listo") { dismiss() }.fontWeight(.semibold).foregroundStyle(BrunettiTheme.gold)
                }
            }
        }
    }
}

// MARK: - Expense Sheet

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
            ScrollView {
                VStack(spacing: 16) {
                    VStack(spacing: 12) {
                        SheetSection(title: "Gasto")
                        GlassFormField(label: "Detalle", placeholder: "Descripción del gasto", text: $draft.detail)

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Categoría").font(.caption.weight(.semibold)).foregroundStyle(BrunettiTheme.muted)
                            Picker("Categoría", selection: $draft.category) {
                                ForEach(["Insumos", "Equipamiento", "Arriendo", "Marketing", "Personal", "Servicios", "Otros"], id: \.self) {
                                    Text($0).tag($0)
                                }
                            }
                            .pickerStyle(.menu)
                            .padding(13)
                            .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .foregroundStyle(BrunettiTheme.text)
                        }

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Monto").font(.caption.weight(.semibold)).foregroundStyle(BrunettiTheme.muted)
                            TextField("0", value: $draft.amount, format: .number)
                                .keyboardType(.numberPad)
                                .padding(13)
                                .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                                .foregroundStyle(BrunettiTheme.text)
                        }

                        GlassFormField(label: "Fecha", placeholder: "YYYY-MM-DD", text: $draft.date, autocap: .never)
                        GlassFormField(label: "Responsable", placeholder: "Brunetti", text: $draft.owner)
                    }
                    .brunettiCard(radius: 20)

                    GlassActionButton(title: "Registrar gasto", symbol: "checkmark.circle.fill", tint: .orange) {
                        Task { await model.saveExpense(draft, api: session.api); dismiss() }
                    }
                }
                .padding(20)
            }
            .background(BrunettiTheme.background.ignoresSafeArea())
            .scrollIndicators(.hidden)
            .navigationTitle("Gasto")
            .navigationBarTitleDisplayMode(.inline)
            .presentationBackground(.regularMaterial)
            .presentationCornerRadius(32)
            .presentationDetents([.medium, .large])
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Listo") { dismiss() }.fontWeight(.semibold).foregroundStyle(BrunettiTheme.gold)
                }
            }
        }
    }
}

// MARK: - Booking Draft Sheet

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

    private var isValid: Bool {
        !draft.clientName.trimmingCharacters(in: .whitespaces).isEmpty &&
        cleanPhone(draft.phone).count >= 8 &&
        draft.serviceId != nil
    }

    private var clientSuggestions: [Client] {
        let query = draft.clientName.trimmingCharacters(in: .whitespacesAndNewlines)
        let phone = cleanPhone(draft.phone)
        guard !query.isEmpty || phone.count >= 3 else { return [] }
        return model.clients
            .filter {
                $0.name.localizedCaseInsensitiveContains(query) ||
                cleanPhone($0.phone).contains(phone)
            }
            .prefix(5)
            .map { $0 }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Client
                    VStack(spacing: 12) {
                        SheetSection(title: "Cliente")
                        GlassFormField(label: "Nombre", placeholder: "Nombre completo", text: $draft.clientName)
                        GlassFormField(label: "Teléfono", placeholder: "9XXXXXXXX", text: $draft.phone, keyboard: .phonePad, autocap: .never)
                        GlassFormField(label: "Correo", placeholder: "correo@mail.com", text: $draft.email, keyboard: .emailAddress, autocap: .never)
                        if !clientSuggestions.isEmpty {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Clientes encontrados")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(BrunettiTheme.muted)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                ForEach(clientSuggestions, id: \.stableID) { client in
                                    Button {
                                        draft.clientName = client.name
                                        draft.phone = client.phone
                                        draft.email = client.email ?? ""
                                        model.applyClientToBookingDraft(client)
                                    } label: {
                                        HStack {
                                            VStack(alignment: .leading, spacing: 3) {
                                                Text(client.name)
                                                    .font(.subheadline.weight(.semibold))
                                                Text("+56 \(client.phone)")
                                                    .font(.caption)
                                                    .foregroundStyle(BrunettiTheme.muted)
                                            }
                                            Spacer()
                                            Image(systemName: "checkmark.circle")
                                                .foregroundStyle(BrunettiTheme.gold)
                                        }
                                        .padding(10)
                                        .foregroundStyle(BrunettiTheme.text)
                                        .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 12))
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                    .brunettiCard(radius: 20)

                    // Booking details
                    VStack(spacing: 12) {
                        SheetSection(title: "Reserva")

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Servicio").font(.caption.weight(.semibold)).foregroundStyle(BrunettiTheme.muted)
                            Picker("Servicio", selection: Binding(
                                get: { draft.serviceId ?? model.services.first?.id ?? 0 },
                                set: { draft.serviceId = $0 }
                            )) {
                                ForEach(model.services.filter { $0.active != false }) { service in
                                    Text("\(service.name) · \(clp(service.price))").tag(service.id)
                                }
                            }
                            .pickerStyle(.menu)
                            .padding(13)
                            .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .foregroundStyle(BrunettiTheme.text)
                        }

                        HStack(spacing: 12) {
                            GlassFormField(label: "Fecha", placeholder: "YYYY-MM-DD", text: $draft.date, autocap: .never)
                            GlassFormField(label: "Hora", placeholder: "09:00", text: $draft.time, autocap: .never)
                        }

                        GlassFormField(label: "Nota interna", placeholder: "Observaciones...", text: $draft.note, axis: .vertical)
                    }
                    .brunettiCard(radius: 20)

                    GlassActionButton(title: "Crear reserva", symbol: "calendar.badge.plus") {
                        Task {
                            await model.createBooking(draft, api: session.api, barberId: barberId)
                            dismiss()
                        }
                    }
                    .disabled(!isValid)
                    .opacity(isValid ? 1 : 0.5)
                }
                .padding(20)
            }
            .background(BrunettiTheme.background.ignoresSafeArea())
            .scrollIndicators(.hidden)
            .navigationTitle("Nueva reserva")
            .navigationBarTitleDisplayMode(.inline)
            .presentationBackground(.regularMaterial)
            .presentationCornerRadius(32)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancelar") { model.bookingDraft = nil; dismiss() }
                        .foregroundStyle(BrunettiTheme.muted)
                }
            }
        }
    }
}

// MARK: - Enrollment Sheet

struct EnrollmentSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var draft: EnrollmentDraft

    init(draft: EnrollmentDraft, model: DashboardModel) {
        self.model = model
        _draft = State(initialValue: draft)
    }

    private var isValid: Bool {
        !draft.name.trimmingCharacters(in: .whitespaces).isEmpty &&
        cleanPhone(draft.phone).count >= 8 &&
        draft.email.contains("@")
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Contact
                    VStack(spacing: 12) {
                        SheetSection(title: "Contacto")
                        GlassFormField(label: "Nombre", placeholder: "Nombre completo", text: $draft.name)
                        GlassFormField(label: "Teléfono", placeholder: "9XXXXXXXX", text: $draft.phone, keyboard: .phonePad, autocap: .never)
                        GlassFormField(label: "Correo", placeholder: "correo@mail.com", text: $draft.email, keyboard: .emailAddress, autocap: .never)
                    }
                    .brunettiCard(radius: 20)

                    // Program
                    VStack(spacing: 12) {
                        SheetSection(title: "Programa")

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Origen").font(.caption.weight(.semibold)).foregroundStyle(BrunettiTheme.muted)
                            Picker("Origen", selection: $draft.source) {
                                Text("Workshop").tag("workshop")
                                Text("Cursos").tag("cursos")
                            }
                            .pickerStyle(.segmented)
                            .padding(4)
                            .brunettiGlass(radius: 12, interactive: true)
                        }

                        GlassFormField(label: "Edición", placeholder: "23 de agosto", text: $draft.edition)
                        GlassFormField(label: "Nivel", placeholder: "Inicial / Avanzado", text: $draft.level)
                        GlassFormField(label: "Mensaje", placeholder: "¿Alguna consulta?", text: $draft.message, axis: .vertical)
                    }
                    .brunettiCard(radius: 20)

                    GlassActionButton(title: "Registrar inscripción", symbol: "checkmark.circle.fill", tint: .purple) {
                        Task { await model.saveEnrollment(draft, api: session.api); dismiss() }
                    }
                    .disabled(!isValid)
                    .opacity(isValid ? 1 : 0.5)
                }
                .padding(20)
            }
            .background(BrunettiTheme.background.ignoresSafeArea())
            .scrollIndicators(.hidden)
            .navigationTitle("Workshop")
            .navigationBarTitleDisplayMode(.inline)
            .presentationBackground(.regularMaterial)
            .presentationCornerRadius(32)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancelar") { model.enrollmentDraft = nil; dismiss() }
                        .foregroundStyle(BrunettiTheme.muted)
                }
            }
        }
    }
}

// MARK: - Payment Sheet

struct PaymentSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var draft: PaymentDraft

    init(draft: PaymentDraft, model: DashboardModel) {
        self.model = model
        _draft = State(initialValue: draft)
    }

    private var isValid: Bool {
        draft.amount > 0 && !draft.name.isEmpty && draft.email.contains("@") && cleanPhone(draft.phone).count >= 8
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    VStack(spacing: 12) {
                        SheetSection(title: "Pago Fintoc")

                        VStack(alignment: .leading, spacing: 6) {
                            Text("Monto (CLP)").font(.caption.weight(.semibold)).foregroundStyle(BrunettiTheme.muted)
                            TextField("49990", value: $draft.amount, format: .number)
                                .keyboardType(.numberPad)
                                .padding(13)
                                .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                                .foregroundStyle(BrunettiTheme.text)
                        }

                        GlassFormField(label: "Nombre", placeholder: "Nombre del pagador", text: $draft.name)
                        GlassFormField(label: "Correo", placeholder: "correo@mail.com", text: $draft.email, keyboard: .emailAddress, autocap: .never)
                        GlassFormField(label: "Teléfono", placeholder: "9XXXXXXXX", text: $draft.phone, keyboard: .phonePad, autocap: .never)
                    }
                    .brunettiCard(radius: 20)

                    GlassActionButton(title: "Crear checkout Fintoc", symbol: "creditcard.fill", tint: .blue) {
                        Task {
                            await model.createPayment(draft, api: session.api)
                            if model.paymentSessionURL != nil { dismiss() }
                        }
                    }
                    .disabled(!isValid)
                    .opacity(isValid ? 1 : 0.5)
                }
                .padding(20)
            }
            .background(BrunettiTheme.background.ignoresSafeArea())
            .scrollIndicators(.hidden)
            .navigationTitle("Fintoc")
            .navigationBarTitleDisplayMode(.inline)
            .presentationBackground(.regularMaterial)
            .presentationCornerRadius(32)
            .presentationDetents([.medium, .large])
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancelar") { model.paymentDraft = nil; dismiss() }
                        .foregroundStyle(BrunettiTheme.muted)
                }
            }
        }
    }
}

// MARK: - Private helpers

private func whatsappURL(for booking: Booking, status: BookingStatus) -> URL? {
    let first = booking.client.split(separator: " ").first.map(String.init) ?? "Hola"
    let message: String
    switch status {
    case .confirmada:
        message = "Hola \(first), te confirmamos tu hora en Brunetti el \(booking.date ?? "") a las \(booking.time). ¡Te esperamos!"
    case .enCurso:
        message = "Hola \(first), tu hora de las \(booking.time) con Brunetti está por comenzar."
    case .completada:
        message = "Hola \(first), gracias por tu visita a Brunetti. ¡Te esperamos pronto!"
    case .cancelada:
        message = "Hola \(first), lamentamos avisarte que tu hora del \(booking.date ?? "") a las \(booking.time) fue cancelada. Escríbenos para reagendar."
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
        let request = UNNotificationRequest(
            identifier: "booking-\(booking.id)",
            content: content,
            trigger: UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        )
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
