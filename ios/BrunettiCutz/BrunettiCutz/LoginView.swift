import SwiftUI

struct LoginView: View {
    @Environment(SessionStore.self) private var session
    @State private var username = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var appeared = false

    var body: some View {
        ZStack {
            Image("BrandHero")
                .resizable()
                .scaledToFill()
                .ignoresSafeArea()

            LinearGradient(
                stops: [
                    .init(color: .black.opacity(0.06), location: 0),
                    .init(color: .black.opacity(0.46), location: 0.38),
                    .init(color: .black.opacity(0.92), location: 1.0)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 22) {
                    logoSection
                        .padding(.top, 72)

                    Spacer(minLength: 120)

                    formCard
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 28)
                        .animation(.spring(response: 0.52, dampingFraction: 0.8).delay(0.1), value: appeared)
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 30)
                .frame(maxWidth: 560)
                .frame(maxWidth: .infinity)
            }
            .scrollIndicators(.hidden)
        }
        .onAppear {
            appeared = true
            if session.hasSavedSession && session.canUseBiometrics && session.biometricEnabled {
                Task {
                    try? await Task.sleep(for: .milliseconds(700))
                    await session.biometricLogin()
                }
            }
        }
    }

    // MARK: - Logo

    private var logoSection: some View {
        VStack(spacing: 14) {
            Image("BrandLockup")
                .resizable()
                .scaledToFit()
                .frame(maxWidth: 320)
                .shadow(color: .black.opacity(0.4), radius: 18, y: 10)
            Text("Panel interno · agenda de Brunetti")
                .font(.callout.weight(.medium))
                .foregroundStyle(.white.opacity(0.82))
                .shadow(color: .black.opacity(0.6), radius: 10)
        }
    }

    // MARK: - Form card

    private var formCard: some View {
        VStack(alignment: .leading, spacing: 0) {
            if session.hasSavedSession && session.canUseBiometrics && session.biometricEnabled {
                Button {
                    Task { await session.biometricLogin() }
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "faceid")
                            .font(.title3.weight(.semibold))
                        Text("Continuar con Face ID")
                            .font(.headline)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .foregroundStyle(.black)
                    .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .buttonStyle(.plain)
                .padding(.bottom, 16)

                HStack {
                    Rectangle().fill(Color(.separator)).frame(height: 1)
                    Text("o con contraseña")
                        .font(.caption).foregroundStyle(.secondary).fixedSize()
                    Rectangle().fill(Color(.separator)).frame(height: 1)
                }
                .padding(.bottom, 16)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Acceso equipo")
                    .font(.caption.weight(.bold))
                    .textCase(.uppercase)
                    .foregroundStyle(BrunettiTheme.gold)
                Text("Ingresa a tu panel")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(BrunettiTheme.text)
            }
            .padding(.bottom, 18)

            Text("Usuario")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .padding(.bottom, 6)

            TextField("tu-usuario", text: $username)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .frame(maxWidth: .infinity)
                .padding(.horizontal, 14)
                .padding(.vertical, 13)
                .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 13, style: .continuous))
                .padding(.bottom, 14)

            Text("Contraseña")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
                .padding(.bottom, 6)

            HStack {
                Group {
                    if showPassword {
                        TextField("••••••••", text: $password)
                    } else {
                        SecureField("••••••••", text: $password)
                    }
                }
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                        .foregroundStyle(Color(.systemGray3))
                        .frame(width: 28)
                }
                .buttonStyle(.borderless)
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
                .background(Color(.systemGray6), in: RoundedRectangle(cornerRadius: 13, style: .continuous))
                .padding(.bottom, 14)

            if let error = session.loginError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.footnote)
                    .foregroundStyle(.orange)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.bottom, 10)
            }

            Button {
                Task { await session.login(username: username, password: password) }
            } label: {
                HStack(spacing: 8) {
                    if session.isLoggingIn {
                        ProgressView().tint(.black).scaleEffect(0.85)
                    }
                    Text(session.isLoggingIn ? "Verificando..." : "Entrar al panel")
                        .font(.headline)
                    if !session.isLoggingIn {
                        Image(systemName: "arrow.right")
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 15)
                .foregroundStyle(.black)
                .background(
                    canSubmit ? BrunettiTheme.gold : BrunettiTheme.gold.opacity(0.42),
                    in: RoundedRectangle(cornerRadius: 16, style: .continuous)
                )
            }
            .buttonStyle(.plain)
            .disabled(!canSubmit)

            if !session.hasSavedSession && session.canUseBiometrics && session.biometricEnabled {
                Label("Face ID se activa automáticamente después del primer inicio con contraseña", systemImage: "faceid")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.leading)
                    .frame(maxWidth: .infinity)
                    .padding(.top, 12)
            }
        }
        .padding(22)
        .background(
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .fill(Color(.systemBackground))
                .shadow(color: .black.opacity(0.22), radius: 28, y: 8)
        )
    }

    private var canSubmit: Bool {
        !session.isLoggingIn && !session.isLoginLocked && !username.isEmpty && !password.isEmpty
    }
}
