import SwiftUI

struct DashboardView: View {
    @Environment(SessionStore.self) private var session
    @Binding var selectedTab: AppTab
    @State private var model = DashboardModel()

    private var barber: Barber { session.barber ?? DemoData.barber }
    private var tabs: [AppTab] {
        [.resumen, .agenda, .reservas, .inscripciones, .finanzas, .clientes, .servicios, .gastos, .marketing, .config]
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            ForEach(tabs) { tab in
                NavigationStack {
                    ModuleHost(tab: tab, model: model)
                        .navigationTitle(tab.title)
                        .toolbar {
                            ToolbarItem(placement: .topBarLeading) {
                                HStack(spacing: 8) {
                                    Image("LogoIcon")
                                        .resizable()
                                        .scaledToFit()
                                        .frame(width: 28, height: 28)
                        Text(barber.short ?? barber.name)
                            .font(.subheadline.weight(.semibold))
                    }
                    .foregroundStyle(BrunettiTheme.text)
                            }
                            ToolbarItem(placement: .topBarTrailing) {
                                Button {
                                    Task { await model.refresh(api: session.api, barberId: barber.id) }
                                } label: {
                                    Image(systemName: model.isLoading ? "hourglass" : "arrow.clockwise")
                                }
                                .accessibilityLabel("Actualizar")
                            }
                        }
                        .background(BrunettiTheme.background.ignoresSafeArea())
                }
                .tabItem { Label(tab.title, systemImage: tab.symbol) }
                .tag(tab)
            }
        }
        .tint(BrunettiTheme.gold)
        .task {
            await model.refresh(api: session.api, barberId: barber.id)
        }
        .onChange(of: model.selectedDate) { _, _ in
            Task { await model.refreshAgenda(api: session.api, barberId: barber.id) }
        }
    }
}

struct ModuleHost: View {
    @Environment(SessionStore.self) private var session
    var tab: AppTab
    @Bindable var model: DashboardModel

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                HeaderPanel(tab: tab, pending: model.pendingCount, message: model.message)

                switch tab {
                case .resumen:
                    SummaryView(model: model)
                case .agenda:
                    AgendaView(model: model, barberId: session.barber?.id ?? DemoData.barber.id)
                case .reservas:
                    ReservationsView(model: model)
                case .inscripciones:
                    EnrollmentsView(model: model)
                case .finanzas:
                    FinanceView(model: model)
                case .clientes:
                    ClientsView(model: model)
                case .servicios:
                    ServicesView(model: model)
                case .gastos:
                    ExpensesView(model: model)
                case .marketing:
                    MarketingView(model: model)
                case .config:
                    SettingsView(model: model)
                }
            }
            .padding(16)
            .padding(.bottom, 28)
        }
        .scrollIndicators(.hidden)
        .sheet(item: $model.selectedBooking) { booking in
            BookingSheet(booking: booking, model: model)
        }
        .sheet(item: $model.selectedClient) { client in
            ClientSheet(client: client, model: model)
        }
        .sheet(item: $model.selectedService) { service in
            ServiceSheet(service: service, model: model)
        }
        .sheet(item: $model.selectedExpense) { expense in
            ExpenseSheet(expense: expense, model: model)
        }
        .sheet(item: $model.bookingDraft) { draft in
            BookingDraftSheet(draft: draft, model: model, barberId: session.barber?.id ?? DemoData.barber.id)
        }
        .sheet(item: $model.enrollmentDraft) { draft in
            EnrollmentSheet(draft: draft, model: model)
        }
        .sheet(item: $model.paymentDraft) { draft in
            PaymentSheet(draft: draft, model: model)
        }
    }
}

struct HeaderPanel: View {
    var tab: AppTab
    var pending: Int
    var message: String?

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: tab.symbol)
                .font(.title2)
                .foregroundStyle(BrunettiTheme.gold)
                .frame(width: 44, height: 44)
                .brunettiGlass(radius: 14, tint: BrunettiTheme.gold.opacity(0.18), interactive: true)
            VStack(alignment: .leading, spacing: 4) {
                Text(tab.title)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(BrunettiTheme.text)
                Text(message ?? "Panel interno Brunetti")
                    .font(.caption)
                    .foregroundStyle(BrunettiTheme.muted)
            }
            Spacer()
            if pending > 0 {
                Label("\(pending)", systemImage: "bell.fill")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.black)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(BrunettiTheme.gold, in: Capsule())
            }
        }
        .brunettiCard(radius: 24)
    }
}
