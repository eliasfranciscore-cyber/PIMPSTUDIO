import SwiftUI

struct SummaryView: View {
    @Bindable var model: DashboardModel

    var body: some View {
        VStack(spacing: 16) {
            Picker("Foco", selection: $model.dashboardFocus) {
                ForEach(DashboardFocus.allCases) { focus in
                    Text(focus.title).tag(focus)
                }
            }
            .pickerStyle(.segmented)
            .padding(5)
            .brunettiGlass(radius: 18, tint: BrunettiTheme.gold.opacity(0.08), interactive: true)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MetricTile(title: model.dashboardFocus == .workshop ? "Inscripciones" : "Ingresos agenda", value: model.dashboardFocus == .workshop ? "\(model.enrollments.count)" : clp(model.revenueTotal), symbol: model.dashboardFocus == .workshop ? "graduationcap.fill" : "wallet.pass.fill")
                MetricTile(title: "Ticket promedio", value: clp(model.avgTicket), symbol: "chart.line.uptrend.xyaxis")
                MetricTile(title: "Reservas", value: "\(model.todayBookings.count)", symbol: "calendar.badge.clock")
                MetricTile(title: "Ocupacion", value: "\(Int(model.occupancy * 100))%", symbol: "gauge.with.dots.needle.67percent")
            }

            HStack(spacing: 10) {
                QuickAction(title: "Nueva reserva", symbol: "calendar.badge.plus") {
                    model.beginBooking()
                }
                QuickAction(title: "Workshop", symbol: "graduationcap.fill") {
                    model.enrollmentDraft = EnrollmentDraft()
                }
            }

            VStack(alignment: .leading, spacing: 12) {
                Text("Agenda de hoy")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                ForEach(model.todayBookings.prefix(5)) { booking in
                    BookingRow(booking: booking) { model.selectedBooking = booking }
                }
                if model.todayBookings.isEmpty {
                    EmptyPanel(title: "No hay reservas para hoy.", symbol: "calendar")
                }
            }
            .brunettiCard(radius: 24)

            Image("GalleryInterior")
                .resizable()
                .scaledToFill()
                .frame(height: 180)
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .overlay(alignment: .bottomLeading) {
                    Text("Brunetti Experience")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(.white)
                        .padding(18)
                }
        }
    }
}

struct AgendaView: View {
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    var barberId: Int

    var body: some View {
        VStack(spacing: 16) {
            WeekStrip(selection: $model.selectedDate)

            DatePicker("Dia", selection: $model.selectedDate, displayedComponents: .date)
                .datePickerStyle(.compact)
                .tint(BrunettiTheme.gold)
                .brunettiCard(radius: 18)

            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    Text("Disponibilidad")
                        .font(.headline)
                    Spacer()
                    Text("\(model.slots.filter { $0.resolvedState == .free }.count) libres")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(BrunettiTheme.gold)
                }
                .foregroundStyle(BrunettiTheme.text)

                ProgressRow(title: "Ocupacion del dia", value: "\(Int(model.occupancy * 100))%", progress: model.occupancy, tint: BrunettiTheme.gold)

                SlotLegend()

                ForEach(["MAÑANA", "TARDE"], id: \.self) { period in
                    let periodSlots = model.slots.filter { slot in
                        let hour = Int(slot.slot.prefix(2)) ?? 0
                        return period == "MAÑANA" ? hour < 12 : hour >= 12
                    }
                    VStack(alignment: .leading, spacing: 10) {
                        Text(period)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(BrunettiTheme.muted)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 86), spacing: 10)], spacing: 10) {
                            ForEach(periodSlots) { slot in
                                Button {
                                    handle(slot: slot)
                                } label: {
                                    VStack(spacing: 6) {
                                        Text(slot.slot)
                                            .font(.headline)
                                        Text(slot.resolvedState.label)
                                            .font(.caption2.weight(.semibold))
                                    }
                                    .frame(maxWidth: .infinity, minHeight: 68)
                                }
                                .buttonStyle(.plain)
                                .foregroundStyle(slot.resolvedState == .free ? BrunettiTheme.text : slot.resolvedState.tint)
                                .background(slot.resolvedState.tint.opacity(slot.resolvedState == .free ? 0.12 : 0.2), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                                .brunettiGlass(radius: 16, tint: slot.resolvedState.tint.opacity(0.12), interactive: slot.resolvedState != .booked)
                                .contextMenu {
                                    if slot.resolvedState == .free {
                                        Button("Bloquear hora", systemImage: "lock.fill") {
                                            Task { await model.toggleSlot(slot, api: session.api, barberId: barberId) }
                                        }
                                    }
                                    if slot.resolvedState == .blocked {
                                        Button("Abrir hora", systemImage: "lock.open.fill") {
                                            Task { await model.toggleSlot(slot, api: session.api, barberId: barberId) }
                                        }
                                    }
                                    Button("Crear reserva", systemImage: "calendar.badge.plus") {
                                        model.beginBooking(slot: slot)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .brunettiCard(radius: 24)
        }
    }

    private func handle(slot: AvailabilitySlot) {
        switch slot.resolvedState {
        case .free:
            model.beginBooking(slot: slot)
        case .blocked:
            Task { await model.toggleSlot(slot, api: session.api, barberId: barberId) }
        case .booked:
            if let booking = model.todayBookings.first(where: { $0.time == slot.slot }) {
                model.selectedBooking = booking
            }
        }
    }
}

struct ReservationsView: View {
    @Bindable var model: DashboardModel
    @State private var filter: BookingStatus?
    @State private var query = ""

    private var visible: [Booking] {
        model.bookings
            .filter { filter == nil || $0.status == filter }
            .filter {
                query.isEmpty ||
                "\($0.client) \($0.phone ?? "") \($0.service)".localizedCaseInsensitiveContains(query)
            }
            .sorted { ($0.date ?? "") + $0.time > ($1.date ?? "") + $1.time }
    }

    var body: some View {
        VStack(spacing: 14) {
            Button {
                model.beginBooking()
            } label: {
                Label("Nueva reserva", systemImage: "calendar.badge.plus")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .foregroundStyle(.black)
            }
            .buttonStyle(.plain)

            SearchField(text: $query, placeholder: "Buscar cliente, telefono o servicio")
            ScrollView(.horizontal) {
                HStack {
                    FilterChip(title: "Todas", isOn: filter == nil) { filter = nil }
                    ForEach(BookingStatus.allCases) { status in
                        FilterChip(title: status.label, isOn: filter == status, tint: status.tint) { filter = status }
                    }
                }
                .padding(.horizontal, 2)
            }
            .scrollIndicators(.hidden)

            VStack(spacing: 10) {
                ForEach(visible) { booking in
                    BookingRow(booking: booking) { model.selectedBooking = booking }
                }
                if visible.isEmpty {
                    EmptyPanel(title: "No hay reservas que coincidan.", symbol: "tray")
                }
            }
        }
    }
}

struct ClientsView: View {
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var query = ""

    private var visible: [Client] {
        model.clients.filter {
            query.isEmpty ||
            "\($0.name) \($0.phone) \($0.email ?? "")".localizedCaseInsensitiveContains(query)
        }
    }

    var body: some View {
        VStack(spacing: 14) {
            Button {
                model.selectedClient = Client(id: nil, name: "", phone: "", email: "", visits: 0, lastVisit: nil, totalSpent: 0, status: "nuevo")
            } label: {
                Label("Nuevo cliente", systemImage: "person.badge.plus")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .foregroundStyle(.black)
            }
            .buttonStyle(.plain)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MetricTile(title: "Clientes", value: "\(model.clients.count)", symbol: "person.2.fill")
                MetricTile(title: "Historial", value: clp(model.clients.reduce(0) { $0 + ($1.totalSpent ?? 0) }), symbol: "clock.arrow.circlepath")
            }

            SearchField(text: $query, placeholder: "Buscar por nombre, telefono o correo")

            ForEach(visible, id: \.stableID) { client in
                Button {
                    Task { await model.openClient(client, api: session.api) }
                } label: {
                    HStack(spacing: 12) {
                        Text(String(client.name.prefix(1)).uppercased())
                            .font(.headline)
                            .frame(width: 42, height: 42)
                            .background(BrunettiTheme.gold.opacity(0.18), in: Circle())
                        VStack(alignment: .leading, spacing: 4) {
                            Text(client.name)
                                .font(.headline)
                            Text("+56 \(client.phone) · \(client.email ?? "sin correo")")
                                .font(.caption)
                                .foregroundStyle(BrunettiTheme.muted)
                                .lineLimit(1)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("\(client.visits ?? 0)")
                                .font(.headline)
                            Text("visitas")
                                .font(.caption2)
                                .foregroundStyle(BrunettiTheme.muted)
                        }
                    }
                    .foregroundStyle(BrunettiTheme.text)
                    .brunettiCard(radius: 18)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct EnrollmentsView: View {
    @Bindable var model: DashboardModel
    @State private var filter = "todos"
    @State private var query = ""

    private var visible: [Enrollment] {
        model.enrollments
            .filter { filter == "todos" || $0.source == filter }
            .filter { query.isEmpty || "\($0.name) \($0.phone) \($0.email) \($0.message ?? "")".localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        VStack(spacing: 14) {
            Button {
                model.enrollmentDraft = EnrollmentDraft()
            } label: {
                Label("Inscribir a workshop", systemImage: "graduationcap.fill")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .foregroundStyle(.black)
            }
            .buttonStyle(.plain)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MetricTile(title: "Workshop", value: "\(model.enrollments.filter { $0.source == "workshop" }.count)", symbol: "graduationcap.fill", tint: .purple)
                MetricTile(title: "Cursos", value: "\(model.enrollments.filter { $0.source == "cursos" }.count)", symbol: "book.closed.fill", tint: .blue)
            }

            Picker("Filtro", selection: $filter) {
                Text("Todos").tag("todos")
                Text("Workshop").tag("workshop")
                Text("Cursos").tag("cursos")
            }
            .pickerStyle(.segmented)
            .padding(5)
            .brunettiGlass(radius: 18, tint: .purple.opacity(0.08), interactive: true)

            SearchField(text: $query, placeholder: "Buscar inscritos")

            ForEach(visible) { item in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.name)
                                .font(.headline)
                            Text("+56 \(item.phone) · \(item.email)")
                                .font(.caption)
                                .foregroundStyle(BrunettiTheme.muted)
                        }
                        Spacer()
                        Text(item.source == "workshop" ? "Workshop" : "Curso")
                            .font(.caption.weight(.bold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background((item.source == "workshop" ? Color.purple : Color.blue).opacity(0.18), in: Capsule())
                            .foregroundStyle(item.source == "workshop" ? .purple : .blue)
                    }
                    if let message = item.message, !message.isEmpty {
                        Text(message)
                            .font(.subheadline)
                            .foregroundStyle(BrunettiTheme.muted)
                    }
                    if let edition = item.edition, !edition.isEmpty {
                        Label(edition, systemImage: "calendar")
                            .font(.caption)
                            .foregroundStyle(BrunettiTheme.gold)
                    }
                }
                .foregroundStyle(BrunettiTheme.text)
                .brunettiCard(radius: 18)
            }
        }
    }
}

struct ServicesView: View {
    @Bindable var model: DashboardModel

    var body: some View {
        VStack(spacing: 14) {
            Button {
                model.selectedService = ServiceItem(id: Int(Date().timeIntervalSince1970), name: "", price: 0, min: 60, cat: "general", tne: false, desc: "", active: true)
            } label: {
                Label("Nuevo servicio", systemImage: "plus")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .foregroundStyle(.black)
            }
            .buttonStyle(.plain)

            ForEach(model.services) { service in
                Button { model.selectedService = service } label: {
                    HStack(spacing: 12) {
                        Image(systemName: serviceIcon(service))
                            .foregroundStyle(BrunettiTheme.gold)
                            .frame(width: 42, height: 42)
                            .brunettiGlass(radius: 14, tint: BrunettiTheme.gold.opacity(0.14), interactive: true)
                        VStack(alignment: .leading, spacing: 5) {
                            Text(service.name)
                                .font(.headline)
                            Text("\(service.min) min · \(service.cat)")
                                .font(.caption)
                                .foregroundStyle(BrunettiTheme.muted)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 5) {
                            Text(clp(service.price))
                                .font(.headline)
                                .foregroundStyle(BrunettiTheme.gold)
                            Text(service.active == false ? "Oculto" : "Publicado")
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(service.active == false ? .orange : .green)
                        }
                    }
                    .foregroundStyle(BrunettiTheme.text)
                    .brunettiCard(radius: 18)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct FinanceView: View {
    @Bindable var model: DashboardModel

    var body: some View {
        VStack(spacing: 16) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MetricTile(title: "Ingresos", value: clp(model.revenueTotal), symbol: "banknote.fill")
                MetricTile(title: "Gastos", value: clp(model.expensesTotal), symbol: "chart.pie.fill", tint: .orange)
                MetricTile(title: "Margen bruto", value: clp(max(model.revenueTotal - model.expensesTotal, 0)), symbol: "arrow.up.forward.circle.fill", tint: .mint)
                MetricTile(title: "Servicios", value: "\(model.completedBookings.count)", symbol: "scissors")
            }

            VStack(alignment: .leading, spacing: 12) {
                Text("Ingresos por servicio")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                ForEach(serviceRevenue(model.bookings), id: \.0) { item in
                    ProgressRow(title: item.0, value: clp(item.1), progress: Double(item.1) / Double(max(model.revenueTotal, 1)), tint: BrunettiTheme.gold)
                }
            }
            .brunettiCard(radius: 24)
        }
    }
}

struct ExpensesView: View {
    @Bindable var model: DashboardModel

    var body: some View {
        VStack(spacing: 14) {
            Button {
                model.selectedExpense = Expense(id: Int(Date().timeIntervalSince1970), date: isoDate(.now), category: "Insumos", detail: "", amount: 0, owner: "Brunetti")
            } label: {
                Label("Ingresar gasto", systemImage: "plus")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .foregroundStyle(.black)
            }
            .buttonStyle(.plain)

            ForEach(model.expenses) { expense in
                HStack {
                    VStack(alignment: .leading, spacing: 5) {
                        Text(expense.category)
                            .font(.headline)
                        Text(expense.detail)
                            .font(.caption)
                            .foregroundStyle(BrunettiTheme.muted)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 5) {
                        Text(clp(expense.amount))
                            .font(.headline)
                            .foregroundStyle(.orange)
                        Text(expense.date)
                            .font(.caption2)
                            .foregroundStyle(BrunettiTheme.muted)
                    }
                }
                .foregroundStyle(BrunettiTheme.text)
                .brunettiCard(radius: 18)
            }
        }
    }
}

struct MarketingView: View {
    @Bindable var model: DashboardModel

    var body: some View {
        VStack(spacing: 16) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MetricTile(title: "Clientes nuevos", value: "42", symbol: "person.crop.circle.badge.plus")
                MetricTile(title: "Recurrencia", value: "77%", symbol: "arrow.triangle.2.circlepath", tint: .mint)
                MetricTile(title: "Promos activas", value: "3", symbol: "gift.fill", tint: .purple)
                MetricTile(title: "Reseñas", value: "4.9", symbol: "star.fill", tint: .yellow)
            }

            VStack(alignment: .leading, spacing: 12) {
                Text("Origen de clientes")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                ForEach(DemoData.channels) { channel in
                    ProgressRow(title: channel.name, value: "\(channel.pct)%", progress: Double(channel.pct) / 100, tint: channel.color)
                }
            }
            .brunettiCard(radius: 24)

            VStack(alignment: .leading, spacing: 12) {
                Text("Promos")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                ForEach(["Descuento TNE 20%", "Pack Corte + Barba", "1a visita -15%"], id: \.self) { promo in
                    Label(promo, systemImage: "sparkles")
                        .foregroundStyle(BrunettiTheme.text)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
            }
            .brunettiCard(radius: 24)
        }
    }
}

struct SettingsView: View {
    @Environment(SessionStore.self) private var session
    @Environment(\.openURL) private var openURL
    @Bindable var model: DashboardModel
    @State private var lookupPhone = ""

    var body: some View {
        VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Servidor API")
                    Spacer()
                    Button {
                        Task { await model.runDiagnostics(api: session.api, barberId: session.barber?.id ?? DemoData.barber.id) }
                    } label: {
                        Image(systemName: "stethoscope")
                    }
                    .buttonStyle(.bordered)
                }
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                TextField("http://127.0.0.1:3003", text: Binding(
                    get: { session.baseURLString },
                    set: { session.baseURLString = $0 }
                ))
                .textInputAutocapitalization(.never)
                .keyboardType(.URL)
                .autocorrectionDisabled()
                .textFieldStyle(.roundedBorder)
                Text("Simulator: http://127.0.0.1:3003 si corres vercel dev. iPhone fisico: usa la IP local de tu Mac con puerto 3003.")
                    .font(.caption)
                    .foregroundStyle(BrunettiTheme.muted)
                if let health = model.health {
                    Label(health.detail, systemImage: health.ok ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                        .font(.caption)
                        .foregroundStyle(health.ok ? .green : .orange)
                }
            }
            .brunettiCard(radius: 22)

            VStack(alignment: .leading, spacing: 12) {
                Text("Diagnostico API")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                if model.endpointStatuses.isEmpty {
                    Text("Toca el estetoscopio para revisar endpoints sin crear datos de prueba.")
                        .font(.caption)
                        .foregroundStyle(BrunettiTheme.muted)
                } else {
                    ForEach(model.endpointStatuses) { endpoint in
                        HStack(spacing: 10) {
                            Image(systemName: endpoint.ok ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                                .foregroundStyle(endpoint.ok ? .green : .orange)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(endpoint.name)
                                    .font(.subheadline.weight(.semibold))
                                Text("\(endpoint.path) · \(endpoint.detail)")
                                    .font(.caption2)
                                    .foregroundStyle(BrunettiTheme.muted)
                            }
                            Spacer()
                        }
                        .foregroundStyle(BrunettiTheme.text)
                        .padding(10)
                        .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }
                }
            }
            .brunettiCard(radius: 22)

            VStack(alignment: .leading, spacing: 12) {
                Text("Clientes y pagos")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                HStack {
                    TextField("Telefono cliente", text: $lookupPhone)
                        .keyboardType(.phonePad)
                        .textFieldStyle(.roundedBorder)
                    Button("Buscar") {
                        Task { await model.lookupClient(phone: lookupPhone, api: session.api) }
                    }
                    .buttonStyle(.bordered)
                }
                if let account = model.clientLookupResult {
                    Label("\(account.name) · +56 \(account.phone)", systemImage: "person.crop.circle.badge.checkmark")
                        .font(.caption)
                        .foregroundStyle(.green)
                }
                Button {
                    model.paymentDraft = PaymentDraft(name: session.barber?.name ?? "Brunetti", email: "", phone: lookupPhone)
                } label: {
                    Label("Crear sesion Fintoc", systemImage: "creditcard.fill")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                if let url = model.paymentSessionURL {
                    Button {
                        openURL(url)
                    } label: {
                        Label("Abrir pago creado", systemImage: "safari.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
                Text("Web Push del sitio queda diagnosticado como endpoint PWA; para push nativo real se requiere APNs y soporte backend aparte.")
                    .font(.caption)
                    .foregroundStyle(BrunettiTheme.muted)
            }
            .brunettiCard(radius: 22)

            VStack(alignment: .leading, spacing: 12) {
                Text("Cuenta")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                Label(session.barber?.name ?? "Brunetti", systemImage: "person.crop.circle.fill")
                    .foregroundStyle(BrunettiTheme.text)
                Label("App Intents: abrir Agenda, Reservas o Clientes desde Shortcuts", systemImage: "wand.and.stars")
                    .font(.subheadline)
                    .foregroundStyle(BrunettiTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
                Picker("Apariencia", selection: Binding(
                    get: { session.themeMode },
                    set: { session.themeMode = $0 }
                )) {
                    ForEach(ThemeMode.allCases) { mode in
                        Text(mode.title).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
                Button(role: .destructive) { session.logout() } label: {
                    Label("Cerrar sesion", systemImage: "rectangle.portrait.and.arrow.right")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
            }
            .brunettiCard(radius: 22)

            VStack(alignment: .leading, spacing: 10) {
                Text("Exportaciones")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                ShareLink(item: exportSummary(model: model)) {
                    Label("Compartir resumen CSV", systemImage: "square.and.arrow.up")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
            }
            .brunettiCard(radius: 22)

            VStack(alignment: .leading, spacing: 12) {
                Text("Equipo y permisos")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                ForEach(model.barbers) { barber in
                    HStack {
                        Text(String(barber.name.prefix(1)))
                            .font(.headline)
                            .frame(width: 34, height: 34)
                            .background(BrunettiTheme.gold.opacity(0.18), in: Circle())
                        VStack(alignment: .leading, spacing: 2) {
                            Text(barber.name)
                            Text(barber.role ?? "Barbero")
                                .font(.caption)
                                .foregroundStyle(BrunettiTheme.muted)
                        }
                        Spacer()
                        Text(barber.active == false ? "Off" : "Activo")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(barber.active == false ? .orange : .green)
                    }
                    .foregroundStyle(BrunettiTheme.text)
                }
            }
            .brunettiCard(radius: 22)
        }
    }
}

struct BookingRow: View {
    var booking: Booking
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                VStack(spacing: 2) {
                    Text(booking.time)
                        .font(.headline)
                    Text((booking.date ?? "").dropFirst(5))
                        .font(.caption2)
                        .foregroundStyle(BrunettiTheme.muted)
                }
                .frame(width: 54)

                VStack(alignment: .leading, spacing: 5) {
                    Text(booking.client)
                        .font(.headline)
                        .lineLimit(1)
                    Text(booking.service)
                        .font(.caption)
                        .foregroundStyle(BrunettiTheme.muted)
                        .lineLimit(1)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 6) {
                    StatusBadge(status: booking.status)
                    Text(clp(booking.price))
                        .font(.caption.weight(.bold))
                        .foregroundStyle(BrunettiTheme.gold)
                }
            }
            .foregroundStyle(BrunettiTheme.text)
            .padding(12)
            .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}

struct SlotLegend: View {
    var body: some View {
        HStack {
            ForEach([SlotState.free, .blocked, .booked], id: \.rawValue) { state in
                HStack(spacing: 6) {
                    Circle().fill(state.tint).frame(width: 8, height: 8)
                    Text(state.label).font(.caption2)
                }
                .foregroundStyle(BrunettiTheme.muted)
            }
            Spacer()
        }
    }
}

struct QuickAction: View {
    var title: String
    var symbol: String
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: symbol)
                .font(.subheadline.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .foregroundStyle(BrunettiTheme.text)
                .brunettiGlass(radius: 16, tint: BrunettiTheme.gold.opacity(0.08), interactive: true)
        }
        .buttonStyle(.plain)
    }
}

struct WeekStrip: View {
    @Binding var selection: Date

    private var days: [Date] {
        let calendar = Calendar.current
        return (0..<10).compactMap { calendar.date(byAdding: .day, value: $0, to: .now) }
    }

    var body: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                ForEach(days, id: \.self) { day in
                    let selected = Calendar.current.isDate(day, inSameDayAs: selection)
                    Button {
                        selection = day
                    } label: {
                        VStack(spacing: 4) {
                            Text(day.formatted(.dateTime.weekday(.abbreviated)))
                                .font(.caption2.weight(.semibold))
                            Text(day.formatted(.dateTime.day()))
                                .font(.headline)
                        }
                        .frame(width: 58, height: 62)
                        .foregroundStyle(selected ? .black : BrunettiTheme.text)
                        .background(selected ? BrunettiTheme.gold : BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 2)
        }
        .scrollIndicators(.hidden)
        .padding(5)
        .brunettiGlass(radius: 20, tint: BrunettiTheme.gold.opacity(0.06), interactive: true)
    }
}

struct SearchField: View {
    @Binding var text: String
    var placeholder: String

    var body: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(BrunettiTheme.muted)
            TextField(placeholder, text: $text)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
        }
        .padding(13)
        .foregroundStyle(BrunettiTheme.text)
        .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .brunettiGlass(radius: 16, tint: .white.opacity(0.04), interactive: true)
    }
}

struct FilterChip: View {
    var title: String
    var isOn: Bool
    var tint: Color = BrunettiTheme.gold
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption.weight(.semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .foregroundStyle(isOn ? .black : BrunettiTheme.text)
                .background(isOn ? tint : BrunettiTheme.field, in: Capsule())
        }
        .buttonStyle(.plain)
    }
}

struct ProgressRow: View {
    var title: String
    var value: String
    var progress: Double
    var tint: Color

    var body: some View {
        VStack(spacing: 6) {
            HStack {
                Text(title)
                Spacer()
                Text(value)
                    .foregroundStyle(tint)
            }
            .font(.subheadline)
            .foregroundStyle(BrunettiTheme.text)
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    Capsule().fill(BrunettiTheme.field)
                    Capsule().fill(tint).frame(width: proxy.size.width * max(0, min(progress, 1)))
                }
            }
            .frame(height: 7)
        }
    }
}

private func serviceIcon(_ service: ServiceItem) -> String {
    let name = "\(service.name) \(service.cat)".lowercased()
    if name.contains("asesor") || name.contains("imagen") { return "person.text.rectangle.fill" }
    if name.contains("barba") { return "mustache.fill" }
    if name.contains("quim") || name.contains("platin") || name.contains("color") { return "sparkles" }
    if name.contains("fade") { return "scissors" }
    return "comb.fill"
}

private func serviceRevenue(_ bookings: [Booking]) -> [(String, Int)] {
    let grouped = Dictionary(grouping: bookings.filter { $0.status != .cancelada }, by: \.service)
    return grouped.map { ($0.key, $0.value.reduce(0) { $0 + $1.price }) }
        .sorted { $0.1 > $1.1 }
        .prefix(6)
        .map { $0 }
}

@MainActor
private func exportSummary(model: DashboardModel) -> String {
    var lines = ["tipo,valor"]
    lines.append("ingresos,\(model.revenueTotal)")
    lines.append("gastos,\(model.expensesTotal)")
    lines.append("reservas,\(model.bookings.count)")
    lines.append("clientes,\(model.clients.count)")
    return lines.joined(separator: "\n")
}
