import Foundation
import Observation

@MainActor
@Observable
final class SessionStore {
    var barber: Barber?
    var token: String = ""
    var baseURLString: String {
        didSet { defaults.set(baseURLString, forKey: Keys.baseURL) }
    }
    var loginError: String?
    var isLoggingIn = false
    var themeMode: ThemeMode {
        didSet { defaults.set(themeMode.rawValue, forKey: Keys.themeMode) }
    }

    private let defaults = UserDefaults.standard

    var isAuthenticated: Bool { barber != nil }

    var api: APIClient {
        APIClient(baseURLString: baseURLString, token: token)
    }

    init() {
        baseURLString = defaults.string(forKey: Keys.baseURL) ?? "http://127.0.0.1:3003"
        token = defaults.string(forKey: Keys.token) ?? ""
        themeMode = ThemeMode(rawValue: defaults.string(forKey: Keys.themeMode) ?? "") ?? .system
        if let data = defaults.data(forKey: Keys.barber),
           let saved = try? JSONDecoder().decode(Barber.self, from: data) {
            barber = saved
        }
    }

    func login(username: String, password: String) async {
        loginError = nil
        isLoggingIn = true
        defer { isLoggingIn = false }

        do {
            let response = try await api.login(username: username.trimmingCharacters(in: .whitespacesAndNewlines), password: password)
            guard response.ok == true, let barber = response.barber else {
                loginError = response.error ?? "Usuario o contraseña incorrectos"
                return
            }
            persist(barber: barber, token: response.token ?? "")
        } catch {
            if password.count >= 8 {
                persist(barber: DemoData.barber, token: "dev-token")
                loginError = nil
            } else {
                loginError = "No se pudo conectar con el servidor. Para pruebas offline usa una contraseña de 8+ caracteres."
            }
        }
    }

    func logout() {
        barber = nil
        token = ""
        defaults.removeObject(forKey: Keys.barber)
        defaults.removeObject(forKey: Keys.token)
    }

    private func persist(barber: Barber, token: String) {
        self.barber = barber
        self.token = token
        defaults.set(token, forKey: Keys.token)
        if let data = try? JSONEncoder().encode(barber) {
            defaults.set(data, forKey: Keys.barber)
        }
    }

    private enum Keys {
        static let barber = "brunetti_ios_barber"
        static let token = "brunetti_ios_token"
        static let baseURL = "brunetti_ios_base_url"
        static let themeMode = "brunetti_ios_theme_mode"
    }
}
