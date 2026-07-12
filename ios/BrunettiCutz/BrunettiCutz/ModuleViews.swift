import SwiftUI
import Charts
import UserNotifications

// MARK: - Hoy (combined today + agenda)

struct HoyView: View {
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    var barberId: Int
    @State private var showSlots = false
    @State private var selectedChartMode: BarberChartMode = .ingresos

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: .now)
        switch hour {
        case 0..<12: return "Buenos días"
        case 12..<19: return "Buenas tardes"
        default: return "Buenas noches"
        }
    }

    var body: some View {
        VStack(spacing: 16) {
            // Greeting + status
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(greeting)
                        .font(.caption.weight(.semibold))
                        .textCase(.uppercase)
                        .foregroundStyle(BrunettiTheme.gold)
                    Text(session.barber?.name ?? "Brunetti")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(BrunettiTheme.text)
                    if let msg = model.message {
                        Text(msg)
                            .font(.caption)
                            .foregroundStyle(BrunettiTheme.muted)
                    }
                }
                Spacer()
                if model.pendingCount > 0 {
                    Label("\(model.pendingCount)", systemImage: "bell.fill")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.black)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 7)
                        .background(BrunettiTheme.gold, in: Capsule())
                }
            }
            .brunettiCard(radius: 24)

            // Dashboard focus
            Picker("Foco", selection: $model.dashboardFocus) {
                ForEach(DashboardFocus.allCases) { f in
                    Text(f.title).tag(f)
                }
            }
            .pickerStyle(.segmented)
            .padding(5)
            .brunettiGlass(radius: 18, tint: BrunettiTheme.gold.opacity(0.08), interactive: true)

            // Metric tiles
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MetricTile(
                    title: model.dashboardFocus == .workshop ? "Inscripciones" : "Ingresos",
                    value: model.dashboardFocus == .workshop ? "\(model.enrollments.count)" : clp(model.revenueTotal),
                    symbol: model.dashboardFocus == .workshop ? "graduationcap.fill" : "wallet.pass.fill"
                )
                MetricTile(title: "Semana", value: clp(model.weeklyRevenue), symbol: "calendar.badge.clock", tint: .mint)
                MetricTile(title: "Ticket prom.", value: clp(model.avgTicket), symbol: "chart.line.uptrend.xyaxis")
                MetricTile(title: "Reservas hoy", value: "\(model.todayBookings.count)", symbol: "calendar.badge.clock")
                MetricTile(title: "Ocupación", value: "\(Int(model.occupancy * 100))%", symbol: "gauge.with.dots.needle.67percent")
                MetricTile(title: "Recurrencia", value: "\(Int(model.repeatClientRate * 100))%", symbol: "arrow.triangle.2.circlepath", tint: .blue)
                MetricTile(title: "Cancelación", value: "\(Int(model.cancellationRate * 100))%", symbol: "xmark.circle.fill", tint: .orange)
            }

            if let next = model.nextBooking {
                HStack(spacing: 12) {
                    Image(systemName: "clock.badge.checkmark.fill")
                        .foregroundStyle(BrunettiTheme.gold)
                        .frame(width: 40, height: 40)
                        .brunettiGlass(radius: 12, tint: BrunettiTheme.gold.opacity(0.14), interactive: true)
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Próxima hora")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(BrunettiTheme.muted)
                        Text("\(next.time) · \(next.client)")
                            .font(.headline)
                            .foregroundStyle(BrunettiTheme.text)
                            .lineLimit(1)
                    }
                    Spacer()
                    StatusBadge(status: next.status)
                }
                .brunettiCard(radius: 20)
            }

            BarberDashboardCharts(model: model, mode: $selectedChartMode)

            // Quick actions
            HStack(spacing: 10) {
                QuickAction(title: "Nueva reserva", symbol: "calendar.badge.plus") {
                    model.beginBooking()
                }
                QuickAction(title: "Workshop", symbol: "graduationcap.fill") {
                    model.enrollmentDraft = EnrollmentDraft()
                }
            }

            // View toggle
            Picker("Vista", selection: $showSlots) {
                Text("Agenda").tag(false)
                Text("Disponibilidad").tag(true)
            }
            .pickerStyle(.segmented)
            .padding(5)
            .brunettiGlass(radius: 14, tint: .white.opacity(0.04), interactive: true)

            if showSlots {
                slotSection
            } else {
                bookingSection
            }
        }
    }

    private var bookingSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                WeekStrip(selection: $model.selectedDate)
            }

            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text(model.selectedDate.formatted(.dateTime.weekday(.wide).day().month()))
                        .font(.headline)
                        .foregroundStyle(BrunettiTheme.text)
                    Spacer()
                }

                if model.todayBookings.isEmpty {
                    EmptyPanel(title: "Sin reservas para este día.", symbol: "calendar")
                } else {
                    ForEach(model.todayBookings) { booking in
                        BookingRow(booking: booking) { model.selectedBooking = booking }
                    }
                }
            }
            .brunettiCard(radius: 24)
        }
    }

    private var slotSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            WeekStrip(selection: $model.selectedDate)

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

                ProgressRow(title: "Ocupación del día", value: "\(Int(model.occupancy * 100))%", progress: model.occupancy, tint: BrunettiTheme.gold)
                SlotLegend()
                slotBulkActions

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
                                    handleSlot(slot)
                                } label: {
                                    VStack(spacing: 6) {
                                        Text(slot.slot).font(.headline)
                                        Text(slot.resolvedState.label).font(.caption2.weight(.semibold))
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

    private var slotBulkActions: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Bloqueo rápido")
                .font(.caption.weight(.bold))
                .foregroundStyle(BrunettiTheme.muted)
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                Button {
                    Task { await model.setSlots(slots(beforeHour: 12), blocked: true, api: session.api, barberId: barberId) }
                } label: {
                    Label("Bloquear mañana", systemImage: "sunrise.fill")
                }
                .slotActionStyle()

                Button {
                    Task { await model.setSlots(slots(fromHour: 12), blocked: true, api: session.api, barberId: barberId) }
                } label: {
                    Label("Bloquear tarde", systemImage: "sunset.fill")
                }
                .slotActionStyle()

                Button {
                    Task { await model.setSlots(model.slots, blocked: true, api: session.api, barberId: barberId) }
                } label: {
                    Label("Bloquear día", systemImage: "lock.fill")
                }
                .slotActionStyle()

                Button {
                    Task { await model.setSlots(model.slots, blocked: false, api: session.api, barberId: barberId) }
                } label: {
                    Label("Abrir día", systemImage: "lock.open.fill")
                }
                .slotActionStyle(tint: .green)
            }
        }
    }

    private func slots(beforeHour hour: Int) -> [AvailabilitySlot] {
        model.slots.filter { (Int($0.slot.prefix(2)) ?? 0) < hour }
    }

    private func slots(fromHour hour: Int) -> [AvailabilitySlot] {
        model.slots.filter { (Int($0.slot.prefix(2)) ?? 0) >= hour }
    }

    private func handleSlot(_ slot: AvailabilitySlot) {
        switch slot.resolvedState {
        case .free: model.beginBooking(slot: slot)
        case .blocked: Task { await model.toggleSlot(slot, api: session.api, barberId: barberId) }
        case .booked:
            if let booking = model.todayBookings.first(where: { $0.time == slot.slot }) {
                model.selectedBooking = booking
            }
        }
    }
}

private enum BarberChartMode: String, CaseIterable, Identifiable {
    case ingresos
    case servicios

    var id: String { rawValue }
    var title: String {
        switch self {
        case .ingresos: "Ingresos"
        case .servicios: "Servicios"
        }
    }
}

private struct BarberDashboardCharts: View {
    @Bindable var model: DashboardModel
    @Binding var mode: BarberChartMode
    @State private var selectedDay: String?
    @State private var selectedService: String?

    private var dayData: [DayRevenue] { revenueByDay(model.bookings) }
    private var serviceData: [ServiceRevenue] { serviceRevenueItems(model.bookings) }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Pulso de barbería")
                        .font(.headline)
                        .foregroundStyle(BrunettiTheme.text)
                    Text(mode == .ingresos ? selectedDayDetail : selectedServiceDetail)
                        .font(.caption)
                        .foregroundStyle(BrunettiTheme.muted)
                }
                Spacer()
                Image(systemName: "scissors")
                    .foregroundStyle(BrunettiTheme.gold)
                    .font(.title3.weight(.bold))
            }

            Picker("Gráfico", selection: $mode) {
                ForEach(BarberChartMode.allCases) { item in
                    Text(item.title).tag(item)
                }
            }
            .pickerStyle(.segmented)

            if mode == .ingresos {
                Chart(dayData) { item in
                    BarMark(
                        x: .value("Día", item.label),
                        y: .value("Ingresos", item.amount)
                    )
                    .foregroundStyle(item.label == selectedDay ? BrunettiTheme.gold.gradient : Color.black.opacity(0.62).gradient)
                    .cornerRadius(7)
                    RuleMark(y: .value("Promedio", averageDayRevenue))
                        .foregroundStyle(.white.opacity(0.35))
                        .lineStyle(.init(lineWidth: 1, dash: [4, 4]))
                }
                .frame(height: 190)
                .chartXSelection(value: $selectedDay)
                .chartYAxis {
                    AxisMarks(values: .automatic(desiredCount: 3)) { value in
                        AxisGridLine()
                        AxisValueLabel {
                            if let v = value.as(Int.self) {
                                Text("$\(v / 1000)k").font(.caption2)
                            }
                        }
                    }
                }
            } else {
                VStack(spacing: 12) {
                    Chart(serviceData) { item in
                        SectorMark(
                            angle: .value("Ingresos", item.amount),
                            innerRadius: .ratio(0.62),
                            angularInset: 1.5
                        )
                        .foregroundStyle(by: .value("Servicio", item.name))
                        .opacity(selectedService == nil || selectedService == item.name ? 1 : 0.35)
                    }
                    .frame(height: 190)
                    .chartLegend(position: .bottom, alignment: .leading)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                        ForEach(serviceData.prefix(4)) { item in
                            Button {
                                selectedService = selectedService == item.name ? nil : item.name
                            } label: {
                                HStack(spacing: 8) {
                                    Image(systemName: serviceSymbol(item.name))
                                        .foregroundStyle(BrunettiTheme.gold)
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(item.name)
                                            .font(.caption.weight(.semibold))
                                            .lineLimit(1)
                                        Text(clp(item.amount))
                                            .font(.caption2)
                                            .foregroundStyle(BrunettiTheme.muted)
                                    }
                                    Spacer(minLength: 0)
                                }
                                .padding(10)
                                .foregroundStyle(BrunettiTheme.text)
                                .background((selectedService == item.name ? BrunettiTheme.gold.opacity(0.18) : BrunettiTheme.field), in: RoundedRectangle(cornerRadius: 13, style: .continuous))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
        .brunettiCard(radius: 24)
    }

    private var averageDayRevenue: Int {
        guard !dayData.isEmpty else { return 0 }
        return dayData.reduce(0) { $0 + $1.amount } / dayData.count
    }

    private var selectedDayDetail: String {
        guard let selected = selectedDay,
              let item = dayData.first(where: { $0.label == selected }) else {
            return "Toca una barra para revisar el día"
        }
        return "\(item.label): \(clp(item.amount)) en agenda"
    }

    private var selectedServiceDetail: String {
        guard let selectedService,
              let item = serviceData.first(where: { $0.name == selectedService }) else {
            return "Toca un servicio para destacarlo"
        }
        return "\(item.name): \(clp(item.amount))"
    }
}

// MARK: - Reservations

struct ReservationsView: View {
    @Bindable var model: DashboardModel
    @State private var filter: BookingStatus?
    @State private var query = ""

    private var visible: [Booking] {
        model.bookings
            .filter { filter == nil || $0.status == filter }
            .filter { query.isEmpty || "\($0.client) \($0.phone ?? "") \($0.service)".localizedCaseInsensitiveContains(query) }
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

            SearchField(text: $query, placeholder: "Buscar cliente, teléfono o servicio")

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

// MARK: - Clients

struct ClientsView: View {
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel
    @State private var query = ""

    private var visible: [Client] {
        model.clients.filter {
            query.isEmpty || "\($0.name) \($0.phone) \($0.email ?? "")".localizedCaseInsensitiveContains(query)
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
                MetricTile(title: "Gasto total", value: clp(model.clients.reduce(0) { $0 + ($1.totalSpent ?? 0) }), symbol: "clock.arrow.circlepath")
            }

            SearchField(text: $query, placeholder: "Buscar por nombre, teléfono o correo")

            ForEach(visible, id: \.stableID) { client in
                Button {
                    Task { await model.openClient(client, api: session.api) }
                } label: {
                    HStack(spacing: 12) {
                        Text(String(client.name.prefix(1)).uppercased())
                            .font(.headline)
                            .frame(width: 42, height: 42)
                            .foregroundStyle(.black)
                            .background(BrunettiTheme.gold.opacity(0.85), in: Circle())
                        VStack(alignment: .leading, spacing: 4) {
                            Text(client.name).font(.headline)
                            Text("+56 \(client.phone) · \(client.email ?? "sin correo")")
                                .font(.caption)
                                .foregroundStyle(BrunettiTheme.muted)
                                .lineLimit(1)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("\(client.visits ?? 0)").font(.headline)
                            Text("visitas").font(.caption2).foregroundStyle(BrunettiTheme.muted)
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

// MARK: - Finance (combined finanzas + gastos)

struct FinanceCombinedView: View {
    @Bindable var model: DashboardModel

    var body: some View {
        VStack(spacing: 16) {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                MetricTile(title: "Ingresos", value: clp(model.revenueTotal), symbol: "banknote.fill")
                MetricTile(title: "Gastos", value: clp(model.expensesTotal), symbol: "chart.pie.fill", tint: .orange)
                MetricTile(title: "Margen bruto", value: clp(max(model.revenueTotal - model.expensesTotal, 0)), symbol: "arrow.up.forward.circle.fill", tint: .mint)
                MetricTile(title: "Servicios", value: "\(model.completedBookings.count)", symbol: "scissors")
            }

            VStack(alignment: .leading, spacing: 14) {
                Text("Ingresos por servicio")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                let revData = serviceRevenue(model.bookings)
                if revData.isEmpty {
                    EmptyPanel(title: "Sin ingresos registrados.", symbol: "banknote")
                } else {
                    Chart(revData.indices, id: \.self) { i in
                        BarMark(
                            x: .value("Ingresos", revData[i].1),
                            y: .value("Servicio", revData[i].0)
                        )
                        .foregroundStyle(BrunettiTheme.gold.gradient)
                        .cornerRadius(5)
                    }
                    .frame(height: CGFloat(revData.count) * 44 + 16)
                    .chartXAxis {
                        AxisMarks(values: .automatic(desiredCount: 3)) { value in
                            AxisGridLine()
                            AxisValueLabel {
                                if let v = value.as(Int.self) {
                                    Text("$\(v / 1000)k").font(.caption2)
                                }
                            }
                        }
                    }
                    .chartYAxis {
                        AxisMarks { value in
                            AxisValueLabel {
                                if let name = value.as(String.self) {
                                    Text(name).font(.caption2).lineLimit(1)
                                }
                            }
                        }
                    }

                    ForEach(revData.indices, id: \.self) { i in
                        ProgressRow(
                            title: revData[i].0,
                            value: clp(revData[i].1),
                            progress: Double(revData[i].1) / Double(max(model.revenueTotal, 1)),
                            tint: BrunettiTheme.gold
                        )
                    }
                }
            }
            .brunettiCard(radius: 24)

            Button {
                model.selectedExpense = Expense(id: Int(Date().timeIntervalSince1970), date: isoDate(.now), category: "Insumos", detail: "", amount: 0, owner: "Brunetti")
            } label: {
                Label("Registrar gasto", systemImage: "plus")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .foregroundStyle(.black)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 12) {
                Text("Gastos")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                if model.expenses.isEmpty {
                    EmptyPanel(title: "Sin gastos registrados.", symbol: "chart.pie")
                } else {
                    ForEach(model.expenses) { expense in
                        Button { model.selectedExpense = expense } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 5) {
                                    Text(expense.category).font(.headline)
                                    Text(expense.detail).font(.caption).foregroundStyle(BrunettiTheme.muted)
                                }
                                Spacer()
                                VStack(alignment: .trailing, spacing: 5) {
                                    Text(clp(expense.amount)).font(.headline).foregroundStyle(.orange)
                                    Text(expense.date).font(.caption2).foregroundStyle(BrunettiTheme.muted)
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
    }
}

// MARK: - Más (hub)

struct MasView: View {
    @Environment(SessionStore.self) private var session
    @Bindable var model: DashboardModel

    var body: some View {
        VStack(spacing: 16) {
            profileCard

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                NavigationLink {
                    enrollmentsPage
                } label: {
                    MasTile(title: "Workshop", symbol: "graduationcap.fill", tint: .purple)
                }
                .buttonStyle(.plain)

                NavigationLink {
                    servicesPage
                } label: {
                    MasTile(title: "Servicios", symbol: "list.bullet.clipboard.fill", tint: BrunettiTheme.gold)
                }
                .buttonStyle(.plain)

                NavigationLink {
                    marketingPage
                } label: {
                    MasTile(title: "Marketing", symbol: "megaphone.fill", tint: .mint)
                }
                .buttonStyle(.plain)

                NavigationLink {
                    settingsPage
                } label: {
                    MasTile(title: "Ajustes", symbol: "gearshape.fill", tint: BrunettiTheme.muted)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var profileCard: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle().fill(BrunettiTheme.gold)
                Text(String((session.barber?.name ?? "B").prefix(1)).uppercased())
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.black)
            }
            .frame(width: 54, height: 54)

            VStack(alignment: .leading, spacing: 4) {
                Text(session.barber?.name ?? "Brunetti")
                    .font(.headline)
                    .foregroundStyle(BrunettiTheme.text)
                Text(session.barber?.role ?? "Barbero")
                    .font(.caption)
                    .foregroundStyle(BrunettiTheme.muted)
            }
            Spacer()

            Button {
                session.logout()
            } label: {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .foregroundStyle(.red)
                    .padding(10)
                    .brunettiGlass(radius: 12, tint: .red.opacity(0.1), interactive: true)
            }
            .buttonStyle(.plain)
        }
        .brunettiCard(radius: 24)
    }

    // Sub-pages as computed properties to avoid massive body

    private var enrollmentsPage: some View {
        ScrollView {
            VStack(spacing: 16) { EnrollmentsView(model: model) }.padding(16).padding(.bottom, 32)
        }
        .scrollIndicators(.hidden)
        .background(BrunettiTheme.background.ignoresSafeArea())
        .navigationTitle("Workshop")
        .sheet(item: $model.enrollmentDraft) { EnrollmentSheet(draft: $0, model: model) }
    }

    private var servicesPage: some View {
        ScrollView {
            VStack(spacing: 16) { ServicesView(model: model) }.padding(16).padding(.bottom, 32)
        }
        .scrollIndicators(.hidden)
        .background(BrunettiTheme.background.ignoresSafeArea())
        .navigationTitle("Servicios")
        .sheet(item: $model.selectedService) { ServiceSheet(service: $0, model: model) }
    }

    private var marketingPage: some View {
        ScrollView {
            VStack(spacing: 16) { MarketingView(model: model) }.padding(16).padding(.bottom, 32)
        }
        .scrollIndicators(.hidden)
        .background(BrunettiTheme.background.ignoresSafeArea())
        .navigationTitle("Marketing")
    }

    private var settingsPage: some View {
        ScrollView {
            VStack(spacing: 16) { SettingsView(model: model) }.padding(16).padding(.bottom, 32)
        }
        .scrollIndicators(.hidden)
        .background(BrunettiTheme.background.ignoresSafeArea())
        .navigationTitle("Ajustes")
        .sheet(item: $model.paymentDraft) { PaymentSheet(draft: $0, model: model) }
    }
}

struct MasTile: View {
    var title: String
    var symbol: String
    var tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Image(systemName: symbol)
                .font(.title2)
                .foregroundStyle(tint)
                .frame(width: 44, height: 44)
                .brunettiGlass(radius: 14, tint: tint.opacity(0.18), interactive: true)

            Text(title)
                .font(.headline)
                .foregroundStyle(BrunettiTheme.text)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .brunettiCard(radius: 20)
    }
}

// MARK: - Enrollments

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
                            Text(item.name).font(.headline)
                            Text("+56 \(item.phone) · \(item.email)")
                                .font(.caption).foregroundStyle(BrunettiTheme.muted)
                        }
                        Spacer()
                        Text(item.source == "workshop" ? "Workshop" : "Curso")
                            .font(.caption.weight(.bold))
                            .padding(.horizontal, 10).padding(.vertical, 6)
                            .background((item.source == "workshop" ? Color.purple : Color.blue).opacity(0.18), in: Capsule())
                            .foregroundStyle(item.source == "workshop" ? .purple : .blue)
                    }
                    if let message = item.message, !message.isEmpty {
                        Text(message).font(.subheadline).foregroundStyle(BrunettiTheme.muted)
                    }
                    if let edition = item.edition, !edition.isEmpty {
                        Label(edition, systemImage: "calendar").font(.caption).foregroundStyle(BrunettiTheme.gold)
                    }
                }
                .foregroundStyle(BrunettiTheme.text)
                .brunettiCard(radius: 18)
            }
        }
    }
}

// MARK: - Services

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
                            Text(service.name).font(.headline)
                            Text("\(service.min) min · \(service.cat)")
                                .font(.caption).foregroundStyle(BrunettiTheme.muted)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 5) {
                            Text(clp(service.price)).font(.headline).foregroundStyle(BrunettiTheme.gold)
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

// MARK: - Marketing

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
                    .font(.headline).foregroundStyle(BrunettiTheme.text)
                ForEach(DemoData.channels) { channel in
                    ProgressRow(title: channel.name, value: "\(channel.pct)%", progress: Double(channel.pct) / 100, tint: channel.color)
                }
            }
            .brunettiCard(radius: 24)

            VStack(alignment: .leading, spacing: 12) {
                Text("Promos activas")
                    .font(.headline).foregroundStyle(BrunettiTheme.text)
                ForEach(["Descuento TNE 20%", "Pack Corte + Barba", "1ª visita -15%"], id: \.self) { promo in
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

// MARK: - Settings

struct SettingsView: View {
    @Environment(SessionStore.self) private var session
    @Environment(\.openURL) private var openURL
    @Bindable var model: DashboardModel
    @State private var lookupPhone = ""
    @State private var notifStatus: UNAuthorizationStatus = .notDetermined

    var body: some View {
        VStack(spacing: 16) {
            accountSection
            securitySection
            notificationsSection
            appearanceSection
            serverSection
            diagnosticsSection
            teamSection
            toolsSection
            exportSection
            aboutSection
        }
        .task {
            let s = await UNUserNotificationCenter.current().notificationSettings()
            notifStatus = s.authorizationStatus
        }
    }

    // MARK: Account

    private var accountSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 14) {
                Image("BrandLockup")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 132, height: 44)
                VStack(alignment: .leading, spacing: 4) {
                    Text(session.barber?.name ?? "Brunetti")
                        .font(.headline).foregroundStyle(BrunettiTheme.text)
                    HStack(spacing: 6) {
                        Text(session.barber?.role ?? "Barbero")
                        if session.barber?.isAdmin == true {
                            Label("Admin", systemImage: "crown.fill")
                                .font(.caption2.weight(.bold))
                                .foregroundStyle(BrunettiTheme.gold)
                        }
                    }
                    .font(.caption).foregroundStyle(BrunettiTheme.muted)
                }
                Spacer()
            }
            if let barber = session.barber {
                let badges = permissionBadges(barber)
                if !badges.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(badges, id: \.0) { badge in
                                Label(badge.0, systemImage: badge.1)
                                    .font(.caption.weight(.semibold))
                                    .padding(.horizontal, 10).padding(.vertical, 6)
                                    .background(BrunettiTheme.gold.opacity(0.14), in: Capsule())
                                    .foregroundStyle(BrunettiTheme.gold)
                            }
                        }
                    }
                }
            }
        }
        .brunettiCard(radius: 22)
    }

    // MARK: Security

    private var securitySection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Label("Seguridad", systemImage: "lock.shield.fill")
                .font(.headline).foregroundStyle(BrunettiTheme.text)

            if session.canUseBiometrics {
                HStack {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Face ID / Touch ID")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(BrunettiTheme.text)
                        Text("Entrar y desbloquear con biometría")
                            .font(.caption).foregroundStyle(BrunettiTheme.muted)
                    }
                    Spacer()
                    Toggle("", isOn: Binding(
                        get: { session.biometricEnabled },
                        set: { session.biometricEnabled = $0 }
                    ))
                    .tint(BrunettiTheme.gold)
                    .labelsHidden()
                }

                if session.biometricEnabled {
                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Bloqueo automático")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(BrunettiTheme.text)
                            Text("Se bloquea al volver del fondo tras 5 minutos")
                                .font(.caption).foregroundStyle(BrunettiTheme.muted)
                        }
                        Spacer()
                        Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                    }

                    Button {
                        Task { await session.biometricLogin() }
                    } label: {
                        Label("Probar Face ID ahora", systemImage: "faceid")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 11)
                            .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 13))
                            .foregroundStyle(BrunettiTheme.text)
                    }
                    .buttonStyle(.plain)
                }
            } else {
                Label("Biometría no disponible en este dispositivo", systemImage: "faceid")
                    .font(.subheadline).foregroundStyle(BrunettiTheme.muted)
            }
        }
        .brunettiCard(radius: 22)
    }

    // MARK: Notifications

    private var notificationsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Label("Notificaciones", systemImage: notifIcon)
                    .font(.headline).foregroundStyle(BrunettiTheme.text)
                Spacer()
                Text(notifLabel)
                    .font(.caption.weight(.semibold)).foregroundStyle(notifColor)
            }
            switch notifStatus {
            case .notDetermined:
                Button {
                    Task {
                        _ = try? await UNUserNotificationCenter.current()
                            .requestAuthorization(options: [.alert, .badge, .sound])
                        let updated = await UNUserNotificationCenter.current().notificationSettings()
                        notifStatus = updated.authorizationStatus
                    }
                } label: {
                    Text("Solicitar permiso")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity).padding(.vertical, 11)
                        .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 13))
                        .foregroundStyle(.black)
                }
                .buttonStyle(.plain)
            case .denied:
                Button {
                    if let url = URL(string: UIApplication.openSettingsURLString) { openURL(url) }
                } label: {
                    Text("Abrir ajustes del sistema")
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity).padding(.vertical, 11)
                        .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 13))
                        .foregroundStyle(BrunettiTheme.text)
                }
                .buttonStyle(.plain)
            default:
                EmptyView()
            }
        }
        .brunettiCard(radius: 22)
    }

    // MARK: Appearance

    private var appearanceSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Apariencia").font(.headline).foregroundStyle(BrunettiTheme.text)
            Picker("Tema", selection: Binding(
                get: { session.themeMode },
                set: { session.themeMode = $0 }
            )) {
                ForEach(ThemeMode.allCases) { mode in Text(mode.title).tag(mode) }
            }
            .pickerStyle(.segmented)
            Label("App Intents activos: Agenda, Reservas, Clientes", systemImage: "wand.and.stars")
                .font(.caption).foregroundStyle(BrunettiTheme.muted)
            Button {
                model.beginBooking()
            } label: {
                Label("Abrir creación de reserva", systemImage: "calendar.badge.plus")
                    .frame(maxWidth: .infinity).padding(.vertical, 11)
                    .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 13))
                    .foregroundStyle(BrunettiTheme.text)
            }
            .buttonStyle(.plain)
        }
        .brunettiCard(radius: 22)
    }

    // MARK: Server

    private var serverSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Servidor").font(.headline).foregroundStyle(BrunettiTheme.text)
                Spacer()
                if let health = model.health {
                    Label(health.ok ? "Conectado" : "Error",
                          systemImage: health.ok ? "wifi" : "wifi.slash")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(health.ok ? Color.green : Color.orange)
                }
            }
            TextField("https://brunetticutz.cl", text: Binding(
                get: { session.baseURLString },
                set: { session.baseURLString = $0 }
            ))
            .textInputAutocapitalization(.never)
            .keyboardType(.URL)
            .autocorrectionDisabled()
            .padding(.horizontal, 13).padding(.vertical, 12)
            .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 12))
            if let health = model.health {
                Text(health.detail)
                    .font(.caption).foregroundStyle(BrunettiTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Button {
                Task { await model.checkHealth(api: session.api) }
            } label: {
                Label("Verificar conexión", systemImage: "network")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity).padding(.vertical, 11)
                    .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 13))
                    .foregroundStyle(BrunettiTheme.text)
            }
            .buttonStyle(.plain)
        }
        .brunettiCard(radius: 22)
    }

    // MARK: Diagnostics

    private var diagnosticsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Diagnóstico").font(.headline).foregroundStyle(BrunettiTheme.text)
                Spacer()
                Button {
                    Task {
                        await model.runDiagnostics(
                            api: session.api,
                            barberId: session.barber?.id ?? 1
                        )
                    }
                } label: {
                    Label("Ejecutar", systemImage: "stethoscope").font(.subheadline)
                }
                .buttonStyle(.bordered)
                .tint(BrunettiTheme.gold)
            }
            if model.endpointStatuses.isEmpty {
                Text("Toca «Ejecutar» para revisar todos los endpoints del servidor.")
                    .font(.caption).foregroundStyle(BrunettiTheme.muted)
            } else {
                ForEach(model.endpointStatuses) { ep in
                    HStack(spacing: 10) {
                        Image(systemName: ep.ok ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                            .foregroundStyle(ep.ok ? Color.green : Color.orange)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(ep.name).font(.subheadline.weight(.semibold))
                            Text("\(ep.path) · \(ep.detail)")
                                .font(.caption2).foregroundStyle(BrunettiTheme.muted)
                        }
                        Spacer()
                        Text(ep.ok ? "OK" : "Error")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(ep.ok ? Color.green : Color.orange)
                    }
                    .foregroundStyle(BrunettiTheme.text)
                    .padding(10)
                    .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 12))
                }
            }
        }
        .brunettiCard(radius: 22)
    }

    // MARK: Team

    private var teamSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Equipo").font(.headline).foregroundStyle(BrunettiTheme.text)
                Spacer()
                Text("\(model.barbers.filter { $0.active != false }.count) activos")
                    .font(.caption).foregroundStyle(BrunettiTheme.muted)
            }
            ForEach(model.barbers) { barber in
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(barber.isAdmin ? BrunettiTheme.gold.opacity(0.18) : BrunettiTheme.field)
                        Text(String(barber.name.prefix(1)).uppercased())
                            .font(.headline.weight(.semibold))
                            .foregroundStyle(barber.isAdmin ? BrunettiTheme.gold : BrunettiTheme.text)
                    }
                    .frame(width: 38, height: 38)
                    VStack(alignment: .leading, spacing: 3) {
                        HStack(spacing: 5) {
                            Text(barber.name).font(.subheadline.weight(.semibold))
                            if barber.isAdmin {
                                Image(systemName: "crown.fill")
                                    .font(.caption2).foregroundStyle(BrunettiTheme.gold)
                            }
                        }
                        Text(barber.role ?? "Barbero")
                            .font(.caption).foregroundStyle(BrunettiTheme.muted)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Circle()
                            .fill(barber.active == false ? Color.orange : Color.green)
                            .frame(width: 8, height: 8)
                        if let tier = barber.tier {
                            Text(tier.uppercased())
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(BrunettiTheme.muted)
                        }
                    }
                }
                .foregroundStyle(BrunettiTheme.text)
            }
        }
        .brunettiCard(radius: 22)
    }

    // MARK: Tools

    private var toolsSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Herramientas").font(.headline).foregroundStyle(BrunettiTheme.text)

            VStack(alignment: .leading, spacing: 8) {
                Text("Buscar cliente")
                    .font(.subheadline.weight(.semibold)).foregroundStyle(BrunettiTheme.text)
                HStack {
                    TextField("Teléfono", text: $lookupPhone)
                        .keyboardType(.phonePad)
                        .padding(.horizontal, 13).padding(.vertical, 12)
                        .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 12))
                    Button("Buscar") {
                        Task { await model.lookupClient(phone: lookupPhone, api: session.api) }
                    }
                    .buttonStyle(.bordered).tint(BrunettiTheme.gold)
                }
                if let account = model.clientLookupResult {
                    Label("\(account.name) · +56 \(account.phone)",
                          systemImage: "person.crop.circle.badge.checkmark")
                        .font(.caption).foregroundStyle(.green)
                }
                Button {
                    model.selectedClient = Client(id: nil, name: model.clientLookupResult?.name ?? "", phone: lookupPhone, email: model.clientLookupResult?.email, visits: 0, lastVisit: nil, totalSpent: 0, status: "nuevo")
                } label: {
                    Label("Crear cliente desde búsqueda", systemImage: "person.badge.plus")
                        .frame(maxWidth: .infinity).padding(.vertical, 11)
                        .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 13))
                        .foregroundStyle(BrunettiTheme.text)
                }
                .buttonStyle(.plain)
            }

            Divider()

            VStack(alignment: .leading, spacing: 8) {
                Text("Cobro Fintoc")
                    .font(.subheadline.weight(.semibold)).foregroundStyle(BrunettiTheme.text)
                Button {
                    model.paymentDraft = PaymentDraft(
                        name: model.clientLookupResult?.name ?? session.barber?.name ?? "Brunetti",
                        email: model.clientLookupResult?.email ?? "",
                        phone: lookupPhone
                    )
                } label: {
                    Label("Crear sesión de pago", systemImage: "creditcard.fill")
                        .frame(maxWidth: .infinity).padding(.vertical, 11)
                        .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 13))
                        .foregroundStyle(BrunettiTheme.text)
                }
                .buttonStyle(.plain)
                if let url = model.paymentSessionURL {
                    Button { openURL(url) } label: {
                        Label("Abrir pago creado", systemImage: "safari.fill")
                            .frame(maxWidth: .infinity).padding(.vertical, 11)
                            .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 13))
                            .foregroundStyle(.black)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .brunettiCard(radius: 22)
    }

    // MARK: Export

    private var exportSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Exportaciones").font(.headline).foregroundStyle(BrunettiTheme.text)
            ShareLink(item: exportSummary(model: model)) {
                Label("Resumen CSV", systemImage: "square.and.arrow.up")
                    .frame(maxWidth: .infinity).padding(.vertical, 11)
                    .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 13))
                    .foregroundStyle(BrunettiTheme.text)
            }
            .buttonStyle(.plain)
            ShareLink(item: exportBookingsCSV(model: model)) {
                Label("Reservas CSV", systemImage: "calendar.badge.plus")
                    .frame(maxWidth: .infinity).padding(.vertical, 11)
                    .background(BrunettiTheme.field, in: RoundedRectangle(cornerRadius: 13))
                    .foregroundStyle(BrunettiTheme.text)
            }
            .buttonStyle(.plain)
        }
        .brunettiCard(radius: 22)
    }

    // MARK: About + Logout

    private var aboutSection: some View {
        VStack(spacing: 14) {
            VStack(spacing: 4) {
                Text("Brunetti Cutz · Panel interno")
                    .font(.caption2).foregroundStyle(BrunettiTheme.muted)
                Text("v1.0")
                    .font(.caption2).foregroundStyle(BrunettiTheme.muted.opacity(0.6))
            }
            Button(role: .destructive) { session.logout() } label: {
                Label("Cerrar sesión", systemImage: "rectangle.portrait.and.arrow.right")
                    .font(.headline)
                    .frame(maxWidth: .infinity).padding(.vertical, 14)
                    .background(.red.opacity(0.88), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .foregroundStyle(.white)
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: Helpers

    private func permissionBadges(_ barber: Barber) -> [(String, String)] {
        var list: [(String, String)] = []
        if barber.canViewFinance == true || barber.isAdmin { list.append(("Finanzas", "banknote.fill")) }
        if barber.canManageTeam == true || barber.isAdmin { list.append(("Equipo", "person.2.fill")) }
        if barber.canEditServices == true || barber.isAdmin { list.append(("Servicios", "list.clipboard.fill")) }
        if barber.canManageBlocks == true || barber.isAdmin { list.append(("Agenda", "calendar.badge.plus")) }
        return list
    }

    private var notifIcon: String {
        switch notifStatus {
        case .authorized, .provisional: return "bell.fill"
        case .denied: return "bell.slash.fill"
        default: return "bell.badge.fill"
        }
    }

    private var notifColor: Color {
        switch notifStatus {
        case .authorized, .provisional: return .green
        case .denied: return .red
        default: return .orange
        }
    }

    private var notifLabel: String {
        switch notifStatus {
        case .authorized: return "Activas"
        case .provisional: return "Provisional"
        case .denied: return "Bloqueadas"
        case .notDetermined: return "Sin configurar"
        default: return ""
        }
    }
}

// MARK: - Shared row components

struct BookingRow: View {
    var booking: Booking
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                VStack(spacing: 2) {
                    Text(booking.time).font(.headline)
                    Text((booking.date ?? "").dropFirst(5))
                        .font(.caption2).foregroundStyle(BrunettiTheme.muted)
                }
                .frame(width: 54)

                VStack(alignment: .leading, spacing: 5) {
                    Text(booking.client).font(.headline).lineLimit(1)
                    Text(booking.service).font(.caption).foregroundStyle(BrunettiTheme.muted).lineLimit(1)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 6) {
                    StatusBadge(status: booking.status)
                    Text(clp(booking.price)).font(.caption.weight(.bold)).foregroundStyle(BrunettiTheme.gold)
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

private extension View {
    func slotActionStyle(tint: Color = BrunettiTheme.gold) -> some View {
        self
            .font(.caption.weight(.semibold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 11)
            .foregroundStyle(tint)
            .background(tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 13, style: .continuous))
            .buttonStyle(.plain)
    }
}

struct WeekStrip: View {
    @Binding var selection: Date

    private var days: [Date] {
        (0..<10).compactMap { Calendar.current.date(byAdding: .day, value: $0, to: .now) }
    }

    var body: some View {
        ScrollView(.horizontal) {
            HStack(spacing: 8) {
                ForEach(days, id: \.self) { day in
                    let selected = Calendar.current.isDate(day, inSameDayAs: selection)
                    Button { selection = day } label: {
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
            Image(systemName: "magnifyingglass").foregroundStyle(BrunettiTheme.muted)
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
                Text(value).foregroundStyle(tint)
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

// MARK: - Private helpers

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

private struct DayRevenue: Identifiable {
    var id: String { label }
    var label: String
    var amount: Int
}

private struct ServiceRevenue: Identifiable {
    var id: String { name }
    var name: String
    var amount: Int
}

private func revenueByDay(_ bookings: [Booking]) -> [DayRevenue] {
    let valid = bookings.filter { $0.status != .cancelada }
    let grouped = Dictionary(grouping: valid, by: { ($0.date ?? isoDate(.now)) })
    let values = grouped.map { key, items in
        DayRevenue(label: String(key.dropFirst(5)).replacingOccurrences(of: "-", with: "/"), amount: items.reduce(0) { $0 + $1.price })
    }
    let sorted = values.sorted { $0.label < $1.label }.suffix(7)
    if sorted.isEmpty {
        return [
            DayRevenue(label: "Lun", amount: 42000),
            DayRevenue(label: "Mar", amount: 68000),
            DayRevenue(label: "Mié", amount: 51000),
            DayRevenue(label: "Jue", amount: 88000),
            DayRevenue(label: "Vie", amount: 112000),
            DayRevenue(label: "Sáb", amount: 97000)
        ]
    }
    return Array(sorted)
}

private func serviceRevenueItems(_ bookings: [Booking]) -> [ServiceRevenue] {
    serviceRevenue(bookings).map { ServiceRevenue(name: $0.0, amount: $0.1) }
}

private func serviceSymbol(_ service: String) -> String {
    let name = service.lowercased()
    if name.contains("barba") { return "mustache.fill" }
    if name.contains("platin") || name.contains("color") || name.contains("ondul") { return "sparkles" }
    if name.contains("asesor") || name.contains("imagen") { return "person.text.rectangle.fill" }
    return "scissors"
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
@MainActor
private func exportBookingsCSV(model: DashboardModel) -> String {
    var lines = ["fecha,hora,cliente,telefono,servicio,precio,estado"]
    for b in model.bookings {
        let row = [
            b.date ?? "",
            b.time,
            b.client,
            b.phone ?? "",
            b.service,
            "\(b.price)",
            b.status.rawValue
        ].map { "\"\($0.replacingOccurrences(of: "\"", with: "\"\""))\"" }
            .joined(separator: ",")
        lines.append(row)
    }
    return lines.joined(separator: "\n")
}
