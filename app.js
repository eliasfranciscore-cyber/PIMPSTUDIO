const API_BASE = "";
const BASE_SLOTS = ["10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const state = {
  token: localStorage.getItem("barber_token") || "",
  user: readLS("barber_user", null),
  services: [],
  barbers: [],
  courses: [],
  blocked: [],
};

function readLS(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatCLP(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.error || "Error de servidor";
    throw new Error(message);
  }
  return payload;
}

function renderServices() {
  const servicesGrid = document.getElementById("services-grid");
  servicesGrid.innerHTML = state.services
    .map(
      (s) => `
      <article class="card">
        <h3>${s.name}</h3>
        <p>Duracion: ${s.duration} min</p>
        <p class="price">${formatCLP(s.price)}</p>
      </article>
    `
    )
    .join("");
}

function renderBarbers() {
  const barbersGrid = document.getElementById("barbers-grid");
  barbersGrid.innerHTML = state.barbers
    .map(
      (b) => `
      <article class="card">
        <h3>${b.name}</h3>
        <p>${b.specialty}</p>
      </article>
    `
    )
    .join("");
}

function renderCourses() {
  const coursesGrid = document.getElementById("courses-grid");
  coursesGrid.innerHTML = state.courses
    .map(
      (c) => `
      <article class="card course-card">
        <iframe class="course-video" src="${c.embed_url}" title="${c.title}" loading="lazy" allowfullscreen></iframe>
        <h3>${c.title}</h3>
        <p>${c.description}</p>
      </article>
    `
    )
    .join("");
}

function fillSelectors() {
  const serviceSelect = document.getElementById("service-select");
  const barberSelect = document.getElementById("barber-select");
  const blockBarber = document.getElementById("block-barber");
  const blockSlot = document.getElementById("block-slot");

  serviceSelect.innerHTML = state.services.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  barberSelect.innerHTML = state.barbers.map((b) => `<option value="${b.id}">${b.name}</option>`).join("");
  blockBarber.innerHTML = barberSelect.innerHTML;
  blockSlot.innerHTML = BASE_SLOTS.map((s) => `<option value="${s}">${s}</option>`).join("");

  const dateInput = document.getElementById("date-input");
  const blockDate = document.getElementById("block-date");
  dateInput.min = todayISO();
  blockDate.min = todayISO();
  dateInput.value = todayISO();
  blockDate.value = todayISO();
}

function renderServiceSummary() {
  const serviceId = Number(document.getElementById("service-select").value);
  const service = state.services.find((s) => Number(s.id) === serviceId);
  const summary = document.getElementById("service-summary");
  if (!service) {
    summary.textContent = "";
    return;
  }
  summary.textContent = `${service.duration} min · ${formatCLP(service.price)}`;
}

async function refreshSlotOptions() {
  const barberId = Number(document.getElementById("barber-select").value);
  const date = document.getElementById("date-input").value;
  const slotSelect = document.getElementById("slot-select");

  if (!barberId || !date) return;

  const data = await api(`/api/availability?barberId=${barberId}&date=${date}`);
  const freeSlots = data.slots.filter((s) => s.available);

  slotSelect.innerHTML = freeSlots.length
    ? freeSlots.map((s) => `<option value="${s.slot}">${s.slot}</option>`).join("")
    : `<option value="">Sin bloques disponibles</option>`;
}

async function renderTodayAvailability() {
  const list = document.getElementById("today-availability");
  const date = todayISO();
  const rows = await Promise.all(
    state.barbers.map(async (barber) => {
      const data = await api(`/api/availability?barberId=${barber.id}&date=${date}`);
      const freeCount = data.slots.filter((s) => s.available).length;
      return `<li>${barber.name}: ${freeCount} bloques</li>`;
    })
  );

  list.innerHTML = rows.join("");
}

async function renderBlocked() {
  const list = document.getElementById("blocked-slots");
  const rows = await api("/api/blocked-slots");
  state.blocked = rows;

  if (!rows.length) {
    list.innerHTML = "<li>No hay bloqueos activos.</li>";
    return;
  }

  list.innerHTML = rows
    .map((b) => `<li>${b.date} · ${b.slot} · ${b.barber_name}${b.reason ? ` · ${b.reason}` : ""}</li>`)
    .join("");
}

async function renderUserBookings() {
  const list = document.getElementById("user-bookings");
  if (!state.token || !state.user) {
    list.innerHTML = "<li>Ingresa con tu cuenta para ver reservas.</li>";
    return;
  }

  const rows = await api("/api/bookings/me");
  if (!rows.length) {
    list.innerHTML = "<li>No tienes reservas aun.</li>";
    return;
  }

  list.innerHTML = rows
    .map(
      (b) =>
        `<li>${b.date} ${b.slot} · ${b.service_name} (${formatCLP(b.service_price)}) con ${b.barber_name}</li>`
    )
    .join("");
}

function hydrateUser() {
  if (!state.user) return;
  document.getElementById("user-name").value = state.user.name || "";
  document.getElementById("user-email").value = state.user.email || "";
}

async function loadClientProfile() {
  const result = document.getElementById("client-profile-result");
  if (!state.token || !state.user) {
    document.getElementById("client-phone").value = "";
    document.getElementById("client-note").value = "";
    result.textContent = "Inicia sesión para guardar o editar tu perfil de cliente.";
    return;
  }

  const profile = await api("/api/client-profile/me");
  document.getElementById("client-phone").value = profile?.phone || "";
  document.getElementById("client-note").value = profile?.note || "";
  result.textContent = profile ? "Perfil cargado." : "Completa tu registro básico de cliente.";
}

function bindEvents() {
  document.getElementById("service-select").addEventListener("change", renderServiceSummary);
  document.getElementById("barber-select").addEventListener("change", () => void refreshSlotOptions());
  document.getElementById("date-input").addEventListener("change", () => void refreshSlotOptions());

  document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("user-name").value.trim();
    const email = document.getElementById("user-email").value.trim().toLowerCase();
    const password = document.getElementById("user-password").value;

    try {
      const data = await api("/api/auth/access", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      state.token = data.token;
      state.user = data.user;
      localStorage.setItem("barber_token", state.token);
      writeLS("barber_user", state.user);

      await renderUserBookings();
      await loadClientProfile();
      alert(data.mode === "created" ? "Cuenta creada y sesion iniciada." : "Sesion iniciada.");
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("client-profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state.token || !state.user) {
      alert("Primero debes ingresar con tu cuenta.");
      return;
    }

    const phone = document.getElementById("client-phone").value.trim();
    const note = document.getElementById("client-note").value.trim();

    try {
      const data = await api("/api/client-profile/me", {
        method: "POST",
        body: JSON.stringify({ phone, note }),
      });
      document.getElementById("client-profile-result").textContent =
        data.mode === "created" ? "Perfil registrado correctamente." : "Perfil actualizado correctamente.";
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("booking-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!state.token || !state.user) {
      alert("Primero debes ingresar con tu cuenta.");
      return;
    }

    const barberId = Number(document.getElementById("barber-select").value);
    const serviceId = Number(document.getElementById("service-select").value);
    const date = document.getElementById("date-input").value;
    const slot = document.getElementById("slot-select").value;

    try {
      await api("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ barberId, serviceId, date, slot }),
      });

      await refreshSlotOptions();
      await renderTodayAvailability();
      await renderUserBookings();
      alert("Reserva confirmada.");
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("block-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const adminKey = document.getElementById("admin-key").value;
    const barberId = Number(document.getElementById("block-barber").value);
    const date = document.getElementById("block-date").value;
    const slot = document.getElementById("block-slot").value;

    try {
      await api("/api/blocked-slots", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
        body: JSON.stringify({ barberId, date, slot, reason: "Bloqueado por gestion interna" }),
      });

      await renderBlocked();
      await renderTodayAvailability();
      await refreshSlotOptions();
      alert("Bloque agregado.");
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("newsletter-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("newsletter-email").value.trim().toLowerCase();

    try {
      await api("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      document.getElementById("newsletter-result").textContent =
        "Suscripcion confirmada. Te enviaremos novedades y cursos gratuitos.";
      e.target.reset();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("contact-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("contact-name").value.trim();
    const phone = document.getElementById("contact-phone").value.trim();
    const message = document.getElementById("contact-message").value.trim();

    try {
      await api("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, phone, message }),
      });
      alert("Mensaje enviado. Te responderemos pronto.");
      e.target.reset();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("user-agenda-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const adminKey = document.getElementById("agenda-admin-key").value;
    const email = document.getElementById("agenda-user-email").value.trim().toLowerCase();
    const list = document.getElementById("user-agenda-results");

    try {
      const data = await api(`/api/bookings/by-user?email=${encodeURIComponent(email)}`, {
        headers: { "x-admin-key": adminKey },
      });

      if (!data.bookings.length) {
        list.innerHTML = `<li>${data.user.name} no tiene reservas registradas.</li>`;
        return;
      }

      list.innerHTML = data.bookings
        .map(
          (b) =>
            `<li>${data.user.name} · ${b.date} ${b.slot} · ${b.service_name} (${formatCLP(b.service_price)}) con ${b.barber_name}</li>`
        )
        .join("");
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("clients-list-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const adminKey = document.getElementById("clients-admin-key").value;
    const list = document.getElementById("clients-list");

    try {
      const rows = await api("/api/clients", {
        headers: { "x-admin-key": adminKey },
      });

      if (!rows.length) {
        list.innerHTML = "<li>No hay clientes registrados.</li>";
        return;
      }

      list.innerHTML = rows
        .map(
          (c) =>
            `<li>${c.name} · ${c.email} · ${c.phone || "Sin teléfono"} · Reservas: ${c.bookings_count}${
              c.note ? ` · Nota: ${c.note}` : ""
            }</li>`
        )
        .join("");
    } catch (error) {
      alert(error.message);
    }
  });
}

async function loadCatalogs() {
  const [services, barbers, courses] = await Promise.all([
    api("/api/services"),
    api("/api/barbers"),
    api("/api/courses"),
  ]);

  state.services = services;
  state.barbers = barbers;
  state.courses = courses;
}

async function init() {
  try {
    await loadCatalogs();
    renderServices();
    renderBarbers();
    renderCourses();
    fillSelectors();
    bindEvents();
    hydrateUser();
    renderServiceSummary();
    await refreshSlotOptions();
    await renderTodayAvailability();
    await renderBlocked();
    await renderUserBookings();
    await loadClientProfile();
  } catch (error) {
    console.error(error);
    alert(`No se pudo iniciar la app: ${error.message}`);
  }
}

void init();
