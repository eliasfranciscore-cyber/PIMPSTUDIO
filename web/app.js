const FIGMA_BARBERS = [
  { id: "1", name: "Juan Carlos" },
  { id: "2", name: "Andryz" },
  { id: "3", name: "Bruno Herrera" },
  { id: "4", name: "Diego Moya" },
  { id: "5", name: "Thinn Sayen Herrera" },
  { id: "6", name: "Vicente Pietrapiana" },
  { id: "7", name: "Rodrigo Godoy" },
  { id: "8", name: "Matías Inostroza" },
];

const FIGMA_SERVICES = [
  { value: "asesoria-corte", label: "Asesoría de Corte", price: "$24.990", duration: "90 min", category: "general" },
  { value: "corte-cabello", label: "Corte de Cabello", price: "$15.990", duration: "60 min", category: "general" },
  {
    value: "corte-barba",
    label: "Corte de Cabello y Perfilado de Barba",
    price: "$22.990",
    duration: "75 min",
    category: "general",
  },
  { value: "perfilado-barba", label: "Perfilado de Barba", price: "$11.990", duration: "45 min", category: "general" },
  { value: "solo-fade", label: "Solo Fade", price: "$9.990", duration: "40 min", category: "general" },
  {
    value: "bruno-visagista",
    label: "Asesoría de Imagen-Visagista",
    price: "$39.990",
    duration: "120 min",
    category: "brunetti",
  },
  { value: "bruno-corte", label: "Corte de Cabello (Bruno)", price: "$19.990", duration: "60 min", category: "brunetti" },
  {
    value: "bruno-corte-barba",
    label: "Corte de Cabello y Barba (Bruno)",
    price: "$29.990",
    duration: "90 min",
    category: "brunetti",
  },
  { value: "ondulacion", label: "Ondulación Permanente", price: "$65.990", duration: "180 min", category: "quimico" },
  { value: "platinado-global", label: "Platinado Global", price: "$89.990", duration: "240 min", category: "quimico" },
  { value: "visos-platinados", label: "Visos Platinados", price: "$74.990", duration: "210 min", category: "quimico" },
];

const TEST_USERS = [
  { phone: "987654321", name: "Carlos Rodríguez", email: "carlos@ejemplo.com" },
  { phone: "912345678", name: "María González", email: "maria@ejemplo.com" },
  { phone: "955556666", name: "Pedro Sánchez", email: "pedro@ejemplo.com" },
];

const TIME_SLOTS = {
  maniana: ["9:00 am", "9:30 am", "10:00 am", "10:30 am", "11:00 am", "11:30 am"],
  tarde: ["12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm"],
  noche: ["6:00 pm", "7:00 pm", "7:30 pm"],
};

const SERVICE_DESCRIPTIONS = {
  "bruno-visagista":
    "Consulta personalizada con Bruno Herrera para encontrar el estilo perfecto según tu fisonomía y personalidad.",
  "bruno-corte": "Corte de precisión ejecutado por Bruno Herrera con técnicas avanzadas de barbería italiana.",
  "bruno-corte-barba":
    "Servicio completo de corte de cabello y arreglo de barba con la experiencia premium de Bruno Herrera.",
  "asesoria-corte": "Consulta profesional para encontrar el estilo ideal para ti.",
  "corte-cabello": "Corte profesional con técnicas modernas y clásicas.",
  "corte-barba": "Servicio completo de corte de cabello y arreglo de barba.",
  "perfilado-barba": "Perfilado y arreglo profesional de barba.",
  "solo-fade": "Degradado perfecto y limpio.",
  ondulacion: "Tratamiento para dar forma y textura duradera al cabello.",
  "platinado-global": "Decoloración completa para un rubio platino espectacular.",
  "visos-platinados": "Mechas platinadas para un look moderno y sofisticado.",
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parsePriceToInt(priceText) {
  return Number(String(priceText).replace(/[^\d]/g, "")) || 0;
}

function formatCLP(value) {
  return `$${Number(value || 0).toLocaleString("es-CL")}`;
}

function tnePrice(priceText) {
  const base = parsePriceToInt(priceText);
  return formatCLP(Math.round(base * 0.8));
}

function formatPhoneInput(value) {
  const d = digitsOnly(value).slice(0, 9);
  if (d.length <= 1) return d;
  if (d.length <= 5) return `${d[0]} ${d.slice(1)}`;
  return `${d[0]} ${d.slice(1, 5)} ${d.slice(5)}`;
}

function formatStoredPhone(value) {
  const d = digitsOnly(value).slice(0, 9);
  if (d.length !== 9) return d;
  return `${d[0]} ${d.slice(1, 5)} ${d.slice(5)}`;
}

function ensureSeedData() {
  const users = readJson("users", null);
  if (!Array.isArray(users) || users.length === 0) {
    writeJson("users", TEST_USERS);
  }
  const appointments = readJson("appointments", null);
  if (!Array.isArray(appointments)) {
    writeJson("appointments", []);
  }
}

function getCurrentUser() {
  return readJson("currentUser", null);
}

function setCurrentUser(user) {
  if (user) {
    writeJson("currentUser", user);
  } else {
    localStorage.removeItem("currentUser");
  }
}

function loginByPhone(phoneDigits) {
  const users = readJson("users", []);
  const user = users.find((item) => item.phone === phoneDigits);
  if (!user) return null;
  setCurrentUser(user);
  return user;
}

function registerUser(phoneDigits, name, email) {
  const users = readJson("users", []);
  if (users.some((item) => item.phone === phoneDigits)) {
    return null;
  }
  const user = { phone: phoneDigits, name, email };
  users.push(user);
  writeJson("users", users);
  setCurrentUser(user);
  return user;
}

function logout() {
  setCurrentUser(null);
  window.location.assign("/");
}

function getAppointmentsForCurrentUser() {
  const user = getCurrentUser();
  if (!user) return [];
  const appointments = readJson("appointments", []);
  return appointments.filter((item) => item.userPhone === user.phone);
}

function addAppointment(payload) {
  const user = getCurrentUser();
  if (!user) return false;
  const appointments = readJson("appointments", []);
  appointments.push({
    id: Date.now().toString(),
    userPhone: user.phone,
    ...payload,
  });
  writeJson("appointments", appointments);
  return true;
}

function redirectIfNoAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.assign("/login");
    return null;
  }
  return user;
}

function renderServiceCard(service, withTne) {
  return `
    <article class="service-card">
      <h4 class="service-name">${escapeHtml(service.label)}</h4>
      <p class="service-price">${escapeHtml(service.price)}</p>
      ${withTne ? `<p class="service-note">Con TNE: ${escapeHtml(tnePrice(service.price))}</p>` : ""}
      <p class="service-note">${escapeHtml(SERVICE_DESCRIPTIONS[service.value] || "")}</p>
    </article>
  `;
}

function setupHomePage() {
  const brunettiGrid = document.getElementById("brunetti-grid");
  const generalGrid = document.getElementById("general-grid");
  const quimicoGrid = document.getElementById("quimico-grid");
  const barbersGrid = document.getElementById("barbers-grid");

  if (brunettiGrid) {
    brunettiGrid.innerHTML = FIGMA_SERVICES.filter((item) => item.category === "brunetti")
      .map((item) => renderServiceCard(item, false))
      .join("");
  }

  if (generalGrid) {
    generalGrid.innerHTML = FIGMA_SERVICES.filter((item) => item.category === "general")
      .map((item) => renderServiceCard(item, true))
      .join("");
  }

  if (quimicoGrid) {
    quimicoGrid.innerHTML = FIGMA_SERVICES.filter((item) => item.category === "quimico")
      .map((item) => renderServiceCard(item, false))
      .join("");
  }

  if (barbersGrid) {
    barbersGrid.innerHTML = FIGMA_BARBERS.map(
      (barber) => `
        <article class="barber-card">
          <h3 class="barber-name">
            <span class="barber-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                <path d="M12 12.5a5.25 5.25 0 1 0-5.25-5.25A5.26 5.26 0 0 0 12 12.5Zm0 2.25c-4.88 0-8.75 2.34-8.75 5.25V21h17.5v-1c0-2.91-3.87-5.25-8.75-5.25Z"></path>
              </svg>
            </span>
            <span>${escapeHtml(barber.name)}</span>
          </h3>
        </article>
      `
    ).join("");
  }

  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      siteNav.classList.toggle("is-open");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
      });
    });
  }
}

function setupLoginPage() {
  if (getCurrentUser()) {
    window.location.assign("/booking");
    return;
  }

  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const registerFields = document.getElementById("register-fields");
  const authForm = document.getElementById("auth-form");
  const phoneInput = document.getElementById("phone-input");
  const nameInput = document.getElementById("name-input");
  const emailInput = document.getElementById("email-input");
  const authError = document.getElementById("auth-error");
  const authSubmit = document.getElementById("auth-submit");
  const testUsers = document.getElementById("test-users");

  if (!tabLogin || !tabRegister || !registerFields || !authForm || !phoneInput || !authError || !authSubmit || !testUsers) {
    return;
  }

  let isLoginMode = true;

  function showError(message) {
    authError.textContent = message;
    authError.classList.remove("hidden");
  }

  function clearError() {
    authError.textContent = "";
    authError.classList.add("hidden");
  }

  function setMode(loginMode) {
    isLoginMode = loginMode;
    tabLogin.classList.toggle("is-active", loginMode);
    tabRegister.classList.toggle("is-active", !loginMode);
    registerFields.classList.toggle("hidden", loginMode);
    testUsers.classList.toggle("hidden", !loginMode);
    authSubmit.textContent = loginMode ? "INGRESAR" : "REGISTRARSE";

    if (nameInput) nameInput.required = !loginMode;
    if (emailInput) emailInput.required = !loginMode;
    clearError();
  }

  tabLogin.addEventListener("click", () => setMode(true));
  tabRegister.addEventListener("click", () => setMode(false));

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhoneInput(phoneInput.value);
  });

  testUsers.querySelectorAll("button[data-phone]").forEach((button) => {
    button.addEventListener("click", () => {
      phoneInput.value = button.getAttribute("data-phone") || "";
      clearError();
    });
  });

  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();

    const phone = digitsOnly(phoneInput.value);
    if (phone.length !== 9) {
      showError("El número de teléfono debe tener 9 dígitos");
      return;
    }

    if (isLoginMode) {
      const user = loginByPhone(phone);
      if (!user) {
        showError("Número de teléfono no encontrado. Por favor regístrate.");
        return;
      }
      window.location.assign("/booking");
      return;
    }

    const name = String(nameInput?.value || "").trim();
    const email = String(emailInput?.value || "").trim();

    if (!name || !email) {
      showError("Por favor completa todos los campos");
      return;
    }

    const user = registerUser(phone, name, email);
    if (!user) {
      showError("Este número de teléfono ya está registrado");
      return;
    }

    window.location.assign("/booking");
  });
}

function setupDashboardPage() {
  const user = redirectIfNoAuth();
  if (!user) return;

  const profileName = document.getElementById("profile-name");
  const profilePhone = document.getElementById("profile-phone");
  const profileEmail = document.getElementById("profile-email");
  const appointmentsList = document.getElementById("appointments-list");
  const logoutBtn = document.getElementById("logout-btn");

  if (profileName) profileName.textContent = user.name;
  if (profilePhone) profilePhone.textContent = formatStoredPhone(user.phone);
  if (profileEmail) profileEmail.textContent = user.email;

  const appointments = getAppointmentsForCurrentUser();
  if (appointmentsList) {
    if (appointments.length === 0) {
      appointmentsList.innerHTML = `<div class="empty-state light">No tienes citas agendadas</div>`;
    } else {
      appointmentsList.innerHTML = appointments
        .map(
          (item) => `
            <article class="dash-appointment">
              <p><strong>Fecha:</strong> ${escapeHtml(new Date(item.date).toLocaleDateString("es-CL"))}</p>
              <p><strong>Hora:</strong> ${escapeHtml(item.time)}</p>
              <p><strong>Barbero:</strong> ${escapeHtml(item.barber)}</p>
              <p><strong>Servicio:</strong> ${escapeHtml(item.service)}</p>
              <p><strong>Estado:</strong> ${escapeHtml(item.status)}</p>
            </article>
          `
        )
        .join("");
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

function setupBookingPage() {
  const user = redirectIfNoAuth();
  if (!user) return;

  const logoutBtn = document.getElementById("logout-btn");
  const barbersOptions = document.getElementById("barbers-options");
  const servicesOptions = document.getElementById("services-options");
  const continueBtn = document.getElementById("continue-btn");
  const backBtn = document.getElementById("back-btn");
  const confirmBtn = document.getElementById("confirm-btn");
  const dateInput = document.getElementById("date-input");
  const step1 = document.getElementById("booking-step-1");
  const step2 = document.getElementById("booking-step-2");

  if (
    !barbersOptions ||
    !servicesOptions ||
    !continueBtn ||
    !backBtn ||
    !confirmBtn ||
    !dateInput ||
    !step1 ||
    !step2
  ) {
    return;
  }

  const summaryClient = document.getElementById("sum-client");
  const summaryBarber = document.getElementById("sum-barber");
  const summaryService = document.getElementById("sum-service");
  const summaryPrice = document.getElementById("sum-price");
  const summaryDuration = document.getElementById("sum-duration");
  const summaryDate = document.getElementById("sum-date");
  const summaryTime = document.getElementById("sum-time");

  if (summaryClient) {
    summaryClient.textContent = user.name;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const state = {
    barber: "",
    service: null,
    date: "",
    time: "",
  };

  dateInput.min = new Date().toISOString().slice(0, 10);

  function updateSummary() {
    if (summaryBarber) summaryBarber.textContent = state.barber || "-";
    if (summaryService) summaryService.textContent = state.service?.label || "-";
    if (summaryPrice) summaryPrice.textContent = state.service?.price || "-";
    if (summaryDuration) summaryDuration.textContent = state.service?.duration || "-";
    if (summaryDate) summaryDate.textContent = state.date || "-";
    if (summaryTime) summaryTime.textContent = state.time || "-";
  }

  function filteredServices() {
    if (!state.barber) return [];
    if (state.barber === "Bruno Herrera") {
      return FIGMA_SERVICES.filter((item) => item.category === "brunetti" || item.category === "quimico");
    }
    return FIGMA_SERVICES.filter((item) => item.category === "general" || item.category === "quimico");
  }

  function validateDate() {
    if (!state.date) return false;
    const date = new Date(`${state.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return false;
    if (date.getDay() === 0) return false;
    return true;
  }

  function validateConfirm() {
    confirmBtn.disabled = !(state.barber && state.service && validateDate() && state.time);
  }

  function renderSlots() {
    const groups = [
      ["slots-maniana", TIME_SLOTS.maniana],
      ["slots-tarde", TIME_SLOTS.tarde],
      ["slots-noche", TIME_SLOTS.noche],
    ];

    groups.forEach(([groupId, items]) => {
      const container = document.getElementById(groupId);
      if (!container) return;

      container.innerHTML = items
        .map(
          (slot) => `
            <button type="button" class="slot-btn ${state.time === slot ? "is-selected" : ""}" data-slot="${escapeHtml(slot)}">
              ${escapeHtml(slot)}
            </button>
          `
        )
        .join("");

      container.querySelectorAll("[data-slot]").forEach((button) => {
        button.addEventListener("click", () => {
          state.time = button.getAttribute("data-slot") || "";
          renderSlots();
          updateSummary();
          validateConfirm();
        });
      });
    });
  }

  function renderServiceOptions() {
    const services = filteredServices();

    if (!state.barber) {
      servicesOptions.className = "services-options empty-state light";
      servicesOptions.textContent = "Primero selecciona un barbero";
      continueBtn.disabled = true;
      return;
    }

    servicesOptions.className = "services-options";
    servicesOptions.innerHTML = services
      .map(
        (service) => `
          <button
            type="button"
            class="service-option ${state.service?.value === service.value ? "is-selected" : ""}"
            data-service="${escapeHtml(service.value)}"
          >
            <span>${escapeHtml(service.label)}</span>
            <span>${escapeHtml(service.price)}</span>
            <small>${escapeHtml(service.duration)}</small>
          </button>
        `
      )
      .join("");

    servicesOptions.querySelectorAll("[data-service]").forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.getAttribute("data-service");
        state.service = services.find((item) => item.value === value) || null;
        renderServiceOptions();
        updateSummary();
        continueBtn.disabled = !state.service;
        validateConfirm();
      });
    });

    continueBtn.disabled = !state.service;
  }

  barbersOptions.innerHTML = FIGMA_BARBERS.map(
    (barber) => `
      <button type="button" class="pill-btn" data-barber="${escapeHtml(barber.name)}">
        ${escapeHtml(barber.name)}
      </button>
    `
  ).join("");

  barbersOptions.querySelectorAll("[data-barber]").forEach((button) => {
    button.addEventListener("click", () => {
      state.barber = button.getAttribute("data-barber") || "";
      state.service = null;
      state.time = "";

      barbersOptions.querySelectorAll("[data-barber]").forEach((item) => {
        item.classList.remove("is-selected");
      });

      button.classList.add("is-selected");
      renderServiceOptions();
      renderSlots();
      updateSummary();
      validateConfirm();
    });
  });

  continueBtn.addEventListener("click", () => {
    if (!state.service) return;
    step1.classList.add("hidden");
    step2.classList.remove("hidden");
  });

  backBtn.addEventListener("click", () => {
    step2.classList.add("hidden");
    step1.classList.remove("hidden");
  });

  dateInput.addEventListener("change", () => {
    state.date = dateInput.value;
    if (!validateDate()) {
      alert("Debes seleccionar una fecha válida (sin domingos ni fechas pasadas).");
      state.date = "";
      dateInput.value = "";
    }
    updateSummary();
    validateConfirm();
  });

  confirmBtn.addEventListener("click", () => {
    if (!validateDate() || !state.service) return;

    const ok = addAppointment({
      date: state.date,
      time: state.time,
      barber: state.barber,
      service: `${state.service.label} - ${state.service.price}`,
      status: "Confirmada",
    });

    if (!ok) return;

    alert("¡Reserva confirmada exitosamente!");
    window.location.assign("/dashboard");
  });

  renderServiceOptions();
  renderSlots();
  updateSummary();
  validateConfirm();
}

function boot() {
  ensureSeedData();
  const page = document.body?.dataset?.page;

  if (page === "home") {
    setupHomePage();
    return;
  }

  if (page === "login") {
    setupLoginPage();
    return;
  }

  if (page === "dashboard") {
    setupDashboardPage();
    return;
  }

  if (page === "booking") {
    setupBookingPage();
  }
}

document.addEventListener("DOMContentLoaded", boot);
