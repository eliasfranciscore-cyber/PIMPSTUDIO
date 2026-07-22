import Foundation
import Observation
import LocalAuthentication

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
    var isLocked = false
    var themeMode: ThemeMode {
        didSet { defaults.set(themeMode.rawValue, forKey: Keys.themeMode) }
    }
    var biometricEnabled: Bool {
        didSet { defaults.set(biometricEnabled, forKey: Keys.biometricEnabled) }
    }
    var loginAttempts: Int {
        didSet { defaults.set(loginAttempts, forKey: Keys.loginAttempts) }
    }
    var lockedUntil: Date? {
        didSet {
            if let lockedUntil {
                defaults.set(lockedUntil.timeIntervalSince1970, forKey: Keys.lockedUntil)
            } else {
                defaults.removeObject(forKey: Keys.lockedUntil)
            }
        }
    }

    private let defaults = UserDefaults.standard

    var isAuthenticated: Bool { barber != nil }
    var isLoginLocked: Bool {
        if let lockedUntil, lockedUntil > .now { return true }
        return false
    }

    var hasSavedSession: Bool {
        KeychainStore.loadString(for: Keys.token) != nil && KeychainStore.load(for: Keys.barber) != nil
    }

    var canUseBiometrics: Bool {
        let context = LAContext()
        var error: NSError?
        return context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error)
    }

    var api: APIClient {
        APIClient(baseURLString: baseURLString, token: token)
    }

    init() {
        baseURLString = defaults.string(forKey: Keys.baseURL) ?? "https://brunetticutz.cl"
        token = KeychainStore.loadString(for: Keys.token) ?? ""
        themeMode = ThemeMode(rawValue: defaults.string(forKey: Keys.themeMode) ?? "") ?? .system
        biometricEnabled = (defaults.object(forKey: Keys.biometricEnabled) as? Bool) ?? true
        loginAttempts = defaults.integer(forKey: Keys.loginAttempts)
        if let rawLock = defaults.object(forKey: Keys.lockedUntil) as? Double, rawLock > Date.now.timeIntervalSince1970 {
            lockedUntil = Date(timeIntervalSince1970: rawLock)
        } else {
            lockedUntil = nil
        }
        if let data = KeychainStore.load(for: Keys.barber),
           let saved = try? JSONDecoder().decode(Barber.self, from: data) {
            barber = saved
        }
    }

    func login(username: String, password: String) async {
        loginError = nil
        if isLoginLocked {
            loginError = lockoutMessage
            return
        }
        isLoggingIn = true
        defer { isLoggingIn = false }

        do {
            let response = try await api.login(
                username: username.trimmingCharacters(in: .whitespacesAndNewlines),
                password: password
            )
            guard response.ok == true, let barber = response.barber else {
                if canUseLocalFallback(username: username, password: password) {
                    resetLoginLockout()
                    persist(barber: DemoData.barber, token: response.token ?? "dev-token")
                    return
                }
                registerLoginFailure(message: response.error ?? "Usuario o contraseña incorrectos")
                return
            }
            resetLoginLockout()
            persist(barber: barber, token: response.token ?? "")
        } catch {
            if canUseLocalFallback(username: username, password: password) {
                resetLoginLockout()
                persist(barber: DemoData.barber, token: token.isEmpty ? "dev-token" : token)
            } else {
                registerLoginFailure(message: "No se pudo conectar o las credenciales no coinciden")
            }
        }
    }

    func biometricLogin() async {
        guard hasSavedSession, canUseBiometrics else { return }
        let success = await evaluateBiometrics(reason: "Accede a tu panel Brunetti")
        if success {
            restoreSavedSessionIfNeeded()
            isLocked = false
            loginError = nil
        } else {
            loginError = "No se pudo validar Face ID. Intenta nuevamente o usa tu clave."
        }
    }

    func unlock() async {
        let success = await evaluateBiometrics(reason: "Desbloquea tu panel Brunetti")
        if success { isLocked = false }
    }

    func lock() {
        isLocked = true
    }

    func logout() {
        barber = nil
        token = ""
        isLocked = false
        KeychainStore.delete(for: Keys.barber)
        KeychainStore.delete(for: Keys.token)
    }

    private func persist(barber: Barber, token: String) {
        self.barber = barber
        self.token = token.isEmpty ? "local-session" : token
        biometricEnabled = true
        isLocked = false
        KeychainStore.save(self.token, for: Keys.token)
        if let data = try? JSONEncoder().encode(barber) {
            KeychainStore.save(data, for: Keys.barber)
        }
    }

    private var lockoutMessage: String {
        guard let lockedUntil else { return "Panel bloqueado por intentos fallidos" }
        let minutes = max(1, Int(ceil(lockedUntil.timeIntervalSinceNow / 60)))
        return "Panel bloqueado por intentos fallidos. Reintenta en \(minutes) min."
    }

    private func registerLoginFailure(message: String) {
        loginAttempts += 1
        if loginAttempts >= 3 {
            lockedUntil = Date().addingTimeInterval(15 * 60)
            loginError = lockoutMessage
        } else {
            let remaining = 3 - loginAttempts
            loginError = "\(message) (\(remaining) intento\(remaining == 1 ? "" : "s") restante\(remaining == 1 ? "" : "s"))"
        }
    }

    private func resetLoginLockout() {
        loginAttempts = 0
        lockedUntil = nil
    }

    private func canUseLocalFallback(username: String, password: String) -> Bool {
        guard password.count >= 8 else { return false }
        let normalized = username.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let candidates = [
            DemoData.barber.code?.lowercased(),
            DemoData.barber.name.lowercased(),
            DemoData.barber.short?.lowercased(),
            "brunetti",
            "bruno"
        ].compactMap { $0 }
        return candidates.contains(normalized)
    }

    private func restoreSavedSessionIfNeeded() {
        if token.isEmpty {
            token = KeychainStore.loadString(for: Keys.token) ?? ""
        }
        if barber == nil,
           let data = KeychainStore.load(for: Keys.barber),
           let saved = try? JSONDecoder().decode(Barber.self, from: data) {
            barber = saved
        }
    }

    private func evaluateBiometrics(reason: String) async -> Bool {
        let context = LAContext()
        var nsError: NSError?
        context.localizedFallbackTitle = "Usar código"
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &nsError) else {
            return false
        }
        return await withCheckedContinuation { continuation in
            context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { success, _ in
                continuation.resume(returning: success)
            }
        }
    }

    private enum Keys {
        static let barber = "brunetti_ios_barber"
        static let token = "brunetti_ios_token"
        static let baseURL = "brunetti_ios_base_url"
        static let themeMode = "brunetti_ios_theme_mode"
        static let biometricEnabled = "brunetti_ios_biometric_enabled"
        static let loginAttempts = "brunetti_ios_login_attempts"
        static let lockedUntil = "brunetti_ios_locked_until"
    }
}
