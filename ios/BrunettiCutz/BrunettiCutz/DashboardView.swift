import SwiftUI

struct DashboardView: View {
    @Environment(SessionStore.self) private var session
    @Binding var selectedTab: AppTab
    @State private var model = DashboardModel()

    private var barber: Barber { session.barber ?? DemoData.barber }

    var body: some View {
        ZStack {
            TabView(selection: $selectedTab) {
                ForEach(AppTab.allCases) { tab in
                    NavigationStack {
                        ModuleHost(tab: tab, model: model)
                            .navigationTitle(tab.title)
                            .navigationBarTitleDisplayMode(.large)
                            .toolbar {
                                ToolbarItem(placement: .topBarLeading) {
                                    barberChip
                                }
                                ToolbarItem(placement: .topBarTrailing) {
                                    addBookingButton
                                }
                            }
                            .background(BrunettiTheme.background.ignoresSafeArea())
                    }
                    .tabItem { Label(tab.title, systemImage: tab.symbol) }
                    .tag(tab)
                    .badge(tab == .reservas ? model.pendingCount : 0)
                }
            }
            .tint(BrunettiTheme.gold)
            .task {
                await model.refresh(api: session.api, barberId: barber.id)
                while !Task.isCancelled {
                    try? await Task.sleep(for: .seconds(120))
                    guard !Task.isCancelled else { break }
                    await model.refresh(api: session.api, barberId: barber.id)
                }
            }
            .onChange(of: model.selectedDate) { _, _ in
                Task { await model.refreshAgenda(api: session.api, barberId: barber.id) }
            }

            // Biometric lock screen
            if session.isLocked {
                LockScreenOverlay()
                    .zIndex(100)
            }
        }
        .animation(.easeInOut(duration: 0.22), value: session.isLocked)
    }

    private var barberChip: some View {
        Button {
            selectedTab = .hoy
        } label: {
            HStack(spacing: 8) {
                Image("BrandLockup")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 112, height: 34)
                Text(barber.short ?? String(barber.name.split(separator: " ").first ?? "Brunetti"))
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
            }
        }
        .buttonStyle(.plain)
        .foregroundStyle(BrunettiTheme.text)
        .accessibilityLabel("Ir al inicio")
    }

    private var addBookingButton: some View {
        Button {
            model.beginBooking()
        } label: {
            Image(systemName: "calendar.badge.plus")
                .resizable()
                .scaledToFit()
                .frame(width: 24, height: 24)
        }
        .accessibilityLabel("Nueva reserva")
    }
}

// MARK: - Module Host

struct ModuleHost: View {
    @Environment(SessionStore.self) private var session
    var tab: AppTab
    @Bindable var model: DashboardModel

    private var barberId: Int { session.barber?.id ?? DemoData.barber.id }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                switch tab {
                case .hoy:
                    HoyView(model: model, barberId: barberId)
                case .reservas:
                    ReservationsView(model: model)
                case .clientes:
                    ClientsView(model: model)
                case .finanzas:
                    FinanceCombinedView(model: model)
                case .mas:
                    MasView(model: model)
                }
            }
            .padding(16)
            .padding(.bottom, 32)
        }
        .scrollIndicators(.hidden)
        .refreshable {
            await model.refresh(api: session.api, barberId: barberId)
        }
        .sheet(item: $model.selectedBooking) { BookingSheet(booking: $0, model: model) }
        .sheet(item: $model.selectedClient) { ClientSheet(client: $0, model: model) }
        .sheet(item: $model.selectedService) { ServiceSheet(service: $0, model: model) }
        .sheet(item: $model.selectedExpense) { ExpenseSheet(expense: $0, model: model) }
        .sheet(item: $model.bookingDraft) { BookingDraftSheet(draft: $0, model: model, barberId: barberId) }
        .sheet(item: $model.enrollmentDraft) { EnrollmentSheet(draft: $0, model: model) }
        .sheet(item: $model.paymentDraft) { PaymentSheet(draft: $0, model: model) }
        .sheet(isPresented: Binding(get: { model.paymentSessionURL != nil }, set: { if !$0 { model.paymentSessionURL = nil } })) {
            if let url = model.paymentSessionURL {
                SafariView(url: url)
                    .presentationCornerRadius(28)
            }
        }
    }
}

// MARK: - Safari sheet for Fintoc

import SafariServices

struct SafariView: UIViewControllerRepresentable {
    let url: URL
    func makeUIViewController(context: Context) -> SFSafariViewController {
        SFSafariViewController(url: url)
    }
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
}
