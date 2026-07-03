import SwiftUI

struct LoginView: View {
    @Environment(SessionStore.self) private var session
    @State private var username = "bruno-herrera"
    @State private var password = ""
    @State private var showPassword = false

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                hero
                form
            }
            .padding(20)
            .padding(.top, 18)
        }
        .scrollIndicators(.hidden)
    }

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            Image("BrandHero")
                .resizable()
                .scaledToFill()
                .frame(height: 310)
                .clipped()
                .overlay(
                    LinearGradient(colors: [.black.opacity(0.08), .black.opacity(0.82)], startPoint: .top, endPoint: .bottom)
                )

            VStack(alignment: .leading, spacing: 14) {
                Image("LogoIcon")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 76, height: 76)
                    .brunettiGlass(radius: 22, tint: BrunettiTheme.gold.opacity(0.2), interactive: true)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Acceso Brunetti")
                        .font(.caption.weight(.semibold))
                        .textCase(.uppercase)
                        .foregroundStyle(BrunettiTheme.gold)
                    Text("Panel interno · agenda de Brunetti.")
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                        .minimumScaleFactor(0.82)
                    Text("Gestiona reservas, clientes, servicios, finanzas y disponibilidad desde una app iOS nativa.")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.74))
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(22)
        }
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(.white.opacity(0.1), lineWidth: 1)
        )
    }

    private var form: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Ingresa a tu panel")
                .font(.title3.weight(.bold))
                .foregroundStyle(BrunettiTheme.text)

            VStack(alignment: .leading, spacing: 8) {
                Text("Servidor")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(BrunettiTheme.muted)
                TextField("http://127.0.0.1:3003", text: Binding(
                    get: { session.baseURLString },
                    set: { session.baseURLString = $0 }
                ))
                    .textInputAutocapitalization(.never)
                    .keyboardType(.URL)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Usuario")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(BrunettiTheme.muted)
                TextField("tu-usuario", text: $username)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Contraseña")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(BrunettiTheme.muted)
                HStack {
                    Group {
                        if showPassword {
                            TextField("Tu contraseña", text: $password)
                        } else {
                            SecureField("Tu contraseña", text: $password)
                        }
                    }
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()

                    Button {
                        showPassword.toggle()
                    } label: {
                        Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                    }
                    .buttonStyle(.borderless)
                }
                .padding(12)
                .background(.white, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                .foregroundStyle(.black)
            }

            if let error = session.loginError {
                Label(error, systemImage: "exclamationmark.triangle.fill")
                    .font(.footnote)
                    .foregroundStyle(.orange)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Button {
                Task { await session.login(username: username, password: password) }
            } label: {
                HStack {
                    if session.isLoggingIn { ProgressView().tint(.black) }
                    Text(session.isLoggingIn ? "Verificando" : "Entrar al panel")
                    Image(systemName: "arrow.right")
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(.plain)
            .foregroundStyle(.black)
            .background(BrunettiTheme.gold, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .disabled(session.isLoggingIn || username.isEmpty || password.isEmpty)

            Text("Para pruebas con Vercel local usa http://127.0.0.1:3003 en Simulator. En iPhone fisico usa la IP de tu Mac con puerto 3003.")
                .font(.caption)
                .foregroundStyle(BrunettiTheme.muted)
                .fixedSize(horizontal: false, vertical: true)
        }
        .brunettiCard(radius: 26)
    }
}
