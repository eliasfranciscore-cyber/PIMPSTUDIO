const API_BASE = "";
const BASE_SLOTS = ["10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const state = {
  token: localStorage.getItem("barber_token") || "",
  user: readLS("barber_user", null),
  barberToken: localStorage.getItem("barber_staff_token") || "",
  barberUser: readLS("barber_staff_user", null),
  selectedBarberAgendaId: null,
  services: [],
  barbers: [],
  courses: [],
  blocked: [],
  businessInfo: null,
};

function byId(id) {
  return document.getElementById(id);
}

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

function normalizePhoneCl(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("569")) {
    return `+569 ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
  }
  return String(raw || "").trim();
}

function isValidPhoneCl(raw) {
  return /^\+569\s\d{4}\s\d{4}$/.test(String(raw || "").trim());
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
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
    throw new Error(payload.error || "Error de servidor");
  }
  return payload;
}

async function apiBarber(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (state.barberToken) {
    headers.Authorization = `Bearer ${state.barberToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Error de servidor");
  }
  return payload;
}

function renderServices() {
  const servicesGrid = byId("services-grid");
  if (!servicesGrid) return;

  const categoryOrder = ["Servicios", "Brunetti Experiencia", "Servicios Químicos"];
  const sortedServices = [...state.services].sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a.category);
    const bIdx = categoryOrder.indexOf(b.category);
    const aWeight = aIdx === -1 ? 99 : aIdx;
    const bWeight = bIdx === -1 ? 99 : bIdx;
    if (aWeight !== bWeight) return aWeight - bWeight;
    return String(a.name).localeCompare(String(b.name), "es");
  });

  servicesGrid.innerHTML = sortedServices
    .map(
      (s) => `
      <article class="card">
        <p class="service-category">${s.category}</p>
        <h3>${s.name}</h3>
        <p>Duración: ${s.duration} min</p>
        <p class="price">${formatCLP(s.price)}</p>
        <p class="hint">${
          s.only_bruno ? "Disponible solo con Bruno Herrera." : "Disponible con todos los barberos excepto Bruno."
        }</p>
        ${s.tne_eligible ? '<p class="hint">TNE: 20% de descuento.</p>' : ""}
      </article>
    `
    )
    .join("");
}

function applyBusinessInfo() {
  if (!state.businessInfo) return;

  const locationText = byId("location-text");
  const footerLocation = byId("footer-location");
  const tneNote = byId("services-tne-note");

  if (locationText && state.businessInfo.location) {
    locationText.textContent = state.businessInfo.location;
  }
  if (footerLocation && state.businessInfo.location) {
    footerLocation.textContent = `PIMP STUDIO · ${state.businessInfo.location} · Instagram: @pimpstudiochile · Atención: Lunes a Sábado de 10:00 a 20:00`;
  }
  if (tneNote && state.businessInfo.tne_rule) {
    tneNote.textContent = `${state.businessInfo.tne_rule} Los servicios Brunetti Experiencia son exclusivos de Bruno Herrera.`;
  }
}

function renderBarbers() {
  const barbersGrid = byId("barbers-grid");
  if (!barbersGrid) return;

  barbersGrid.innerHTML = state.barbers
    .map(
      (b) => `
      <article class="card barber-card" data-barber-id="${b.id}">
        ${
          b.photo_url
            ? `<img src="${b.photo_url}" alt="Foto de ${b.name}" class="barber-photo" />`
            : `<img src="assets/pimp-studio-logo.jpg" alt="Foto de ${b.name}" class="barber-photo" />`
        }
        <h3>${b.name}</h3>
        <p>${b.specialty}</p>
      </article>
    `
    )
    .join("");

  if (byId("barber-agenda-slots")) {
    barbersGrid.querySelectorAll(".barber-card").forEach((card) => {
      card.addEventListener("click", async () => {
        const barberId = Number(card.getAttribute("data-barber-id"));
        state.selectedBarberAgendaId = barberId;
        await renderSelectedBarberAgenda();
      });
    });

    if (!state.selectedBarberAgendaId && state.barbers.length) {
      state.selectedBarberAgendaId = Number(state.barbers[0].id);
    }
  }
}

function renderCourses() {
  const coursesGrid = byId("courses-grid");
  if (!coursesGrid) return;

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
  const barberSelect = byId("barber-select");
  const blockBarber = byId("block-barber");
  const blockSlot = byId("block-slot");
  const dateInput = byId("date-input");
  const blockDate = byId("block-date");
  const adminCreateBarber = byId("admin-create-barber");
  const barberAvailabilityDate = byId("barber-availability-date");
  const barberAvailabilitySlots = byId("barber-availability-slots");

  if (barberSelect) {
    barberSelect.innerHTML = state.barbers.map((b) => `<option value="${b.id}">${b.name}</option>`).join("");
  }

  if (blockBarber) {
    blockBarber.innerHTML = state.barbers.map((b) => `<option value="${b.id}">${b.name}</option>`).join("");
  }

  if (adminCreateBarber) {
    adminCreateBarber.innerHTML = state.barbers.map((b) => `<option value="${b.id}">${b.name}</option>`).join("");
  }

  if (blockSlot) {
    blockSlot.innerHTML = BASE_SLOTS.map((s) => `<option value="${s}">${s}</option>`).join("");
  }

  if (barberAvailabilitySlots) {
    barberAvailabilitySlots.innerHTML = BASE_SLOTS.map((s) => `<option value="${s}">${s}</option>`).join("");
  }

  syncServiceOptionsByBarber();

  if (dateInput) {
    dateInput.min = todayISO();
    dateInput.value = todayISO();
  }
  if (blockDate) {
    blockDate.min = todayISO();
    blockDate.value = todayISO();
  }
  if (barberAvailabilityDate) {
    barberAvailabilityDate.min = todayISO();
    barberAvailabilityDate.value = todayISO();
  }

  const agendaDateInput = byId("barber-agenda-date");
  if (agendaDateInput) {
    agendaDateInput.min = todayISO();
    agendaDateInput.value = todayISO();
  }
}

function syncServiceOptionsByBarber() {
  const serviceSelect = byId("service-select");
  const barberSelect = byId("barber-select");
  if (!serviceSelect || !barberSelect) return;

  const barberId = Number(barberSelect.value);
  const selectedService = Number(serviceSelect.value);
  const services = state.services.filter((s) => !barberId || s.barber_ids.includes(barberId));

  serviceSelect.innerHTML = services.length
    ? services.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")
    : `<option value="">Sin servicios disponibles</option>`;

  if (services.some((s) => Number(s.id) === selectedService)) {
    serviceSelect.value = String(selectedService);
  }
}

function renderServiceSummary() {
  const summary = byId("service-summary");
  const serviceSelect = byId("service-select");
  const barberSelect = byId("barber-select");
  if (!summary || !serviceSelect || !barberSelect) return;

  syncServiceOptionsByBarber();

  const serviceId = Number(serviceSelect.value);
  const barberId = Number(barberSelect.value);
  const barber = state.barbers.find((b) => Number(b.id) === barberId);
  const service = state.services.find((s) => Number(s.id) === serviceId);

  if (!service) {
    summary.textContent = "";
    return;
  }

  const tneText = service.tne_eligible ? " · TNE disponible (20% descuento)." : " · Sin descuento TNE para este servicio.";
  const barberText = barber ? ` · ${barber.name}` : "";
  summary.textContent = `${service.duration} min · ${formatCLP(service.price)}${barberText}${tneText}`;
}

async function refreshSlotOptions() {
  const barberSelect = byId("barber-select");
  const dateInput = byId("date-input");
  const slotSelect = byId("slot-select");
  if (!barberSelect || !dateInput || !slotSelect) return;

  const barberId = Number(barberSelect.value);
  const date = dateInput.value;
  if (!barberId || !date) return;

  const data = await api(`/api/availability?barberId=${barberId}&date=${date}`);
  const freeSlots = data.slots.filter((s) => s.available);

  slotSelect.innerHTML = freeSlots.length
    ? freeSlots.map((s) => `<option value="${s.slot}">${s.slot}</option>`).join("")
    : `<option value="">Sin bloques disponibles</option>`;
}

async function renderTodayAvailability() {
  const list = byId("today-availability");
  if (!list) return;

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

async function renderSelectedBarberAgenda() {
  const list = byId("barber-agenda-slots");
  const title = byId("barber-agenda-title");
  const dateInput = byId("barber-agenda-date");
  if (!list || !title || !dateInput || !state.selectedBarberAgendaId) return;

  const barber = state.barbers.find((b) => Number(b.id) === Number(state.selectedBarberAgendaId));
  if (!barber) return;

  const date = dateInput.value || todayISO();
  const data = await api(`/api/availability?barberId=${barber.id}&date=${date}`);
  const freeSlots = data.slots.filter((s) => s.available);

  title.textContent = `Agenda disponible · ${barber.name}`;

  if (!freeSlots.length) {
    list.innerHTML = "<li>No hay bloques disponibles para esta fecha.</li>";
    return;
  }

  list.innerHTML = freeSlots.map((s) => `<li>${s.slot}</li>`).join("");
}

async function renderBlocked() {
  const list = byId("blocked-slots");
  if (!list) return;

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
  const list = byId("user-bookings");
  if (!list) return;

  if (!state.token || !state.user) {
    list.innerHTML = "<li>Regístrate para ver reservas.</li>";
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
        `<li>Atención: ${b.date} ${b.slot} · ${b.service_name} (${formatCLP(b.service_price)}) con ${b.barber_name}</li>`
    )
    .join("");
}

function hydrateUser() {
  const userName = byId("user-name");
  const userEmail = byId("user-email");
  const userPhone = byId("user-phone");
  if (!state.user) return;

  if (userName) userName.value = state.user.name || "";
  if (userEmail) userEmail.value = state.user.email || "";
  if (userPhone) userPhone.value = state.user.phone || "";
}

async function loadClientProfile() {
  const result = byId("client-profile-result");
  const phoneInput = byId("client-phone");
  const noteInput = byId("client-note");
  if (!result || !phoneInput || !noteInput) return;

  if (!state.token || !state.user) {
    phoneInput.value = "";
    noteInput.value = "";
    result.textContent = "Regístrate para guardar o editar tu perfil de cliente.";
    return;
  }

  const profile = await api("/api/client-profile/me");
  phoneInput.value = profile?.phone || state.user.phone || "";
  noteInput.value = profile?.note || "";
  result.textContent = profile ? "Perfil cargado." : "Completa tu registro básico de cliente.";
}

async function loadBarberAvailabilityForDate() {
  const dateInput = byId("barber-availability-date");
  const slotsSelect = byId("barber-availability-slots");
  const result = byId("barber-availability-result");
  if (!dateInput || !slotsSelect) return;

  for (const opt of slotsSelect.options) {
    opt.selected = false;
  }

  if (!state.barberToken || !state.barberUser) {
    if (result) result.textContent = "Inicia sesión como barbero para definir disponibilidad.";
    return;
  }

  const data = await apiBarber(`/api/barber-availability/me?date=${encodeURIComponent(dateInput.value)}`);
  for (const opt of slotsSelect.options) {
    opt.selected = data.slots.includes(opt.value);
  }
  if (result) result.textContent = `Sesión activa: ${state.barberUser.barber_name}`;
}

function bindEvents() {
  const serviceSelect = byId("service-select");
  const barberSelect = byId("barber-select");
  const dateInput = byId("date-input");
  const agendaDateInput = byId("barber-agenda-date");

  const authForm = byId("auth-form");
  const profileForm = byId("client-profile-form");
  const bookingForm = byId("booking-form");
  const blockForm = byId("block-form");
  const newsletterForm = byId("newsletter-form");
  const contactForm = byId("contact-form");
  const agendaForm = byId("user-agenda-form");
  const clientsForm = byId("clients-list-form");
  const adminCreateForm = byId("admin-create-barber-user-form");
  const adminCreateNewBarberForm = byId("admin-create-new-barber-form");
  const barberLoginForm = byId("barber-login-form");
  const barberAvailabilityForm = byId("barber-availability-form");

  if (serviceSelect) {
    serviceSelect.addEventListener("change", renderServiceSummary);
  }
  if (barberSelect) {
    barberSelect.addEventListener("change", () => {
      renderServiceSummary();
      void refreshSlotOptions();
    });
  }
  if (dateInput) {
    dateInput.addEventListener("change", () => void refreshSlotOptions());
  }
  if (agendaDateInput) {
    agendaDateInput.addEventListener("change", () => void renderSelectedBarberAgenda());
  }

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = byId("user-name").value.trim();
      const email = byId("user-email").value.trim().toLowerCase();
      const phone = normalizePhoneCl(byId("user-phone").value);
      if (!isValidPhoneCl(phone)) {
        alert("Celular inválido. Usa formato +569 9999 9999");
        return;
      }

      try {
        const data = await api("/api/auth/access", {
          method: "POST",
          body: JSON.stringify({ name, email, phone }),
        });

        state.token = data.token;
        state.user = data.user;
        localStorage.setItem("barber_token", state.token);
        writeLS("barber_user", state.user);

        byId("user-phone").value = phone;
        await renderUserBookings();
        await loadClientProfile();
        alert(data.mode === "created" ? "Registro completado. Ya puedes agendar." : "Datos actualizados.");
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!state.token || !state.user) {
        alert("Primero debes registrarte en Reserva Aquí.");
        return;
      }

      const phone = normalizePhoneCl(byId("client-phone").value);
      const note = byId("client-note").value.trim();
      if (!isValidPhoneCl(phone)) {
        alert("Celular inválido. Usa formato +569 9999 9999");
        return;
      }

      try {
        const data = await api("/api/client-profile/me", {
          method: "POST",
          body: JSON.stringify({ phone, note }),
        });
        byId("client-profile-result").textContent =
          data.mode === "created" ? "Perfil registrado correctamente." : "Perfil actualizado correctamente.";
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!state.token || !state.user) {
        alert("Debes registrarte en Reserva Aquí antes de agendar.");
        return;
      }

      const barberId = Number(byId("barber-select").value);
      const serviceId = Number(byId("service-select").value);
      const date = byId("date-input").value;
      const slot = byId("slot-select").value;

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
  }

  if (blockForm) {
    blockForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const adminKey = byId("admin-key").value;
      const barberId = Number(byId("block-barber").value);
      const date = byId("block-date").value;
      const slot = byId("block-slot").value;

      try {
        await api("/api/blocked-slots", {
          method: "POST",
          headers: { "x-admin-key": adminKey },
          body: JSON.stringify({ barberId, date, slot, reason: "Bloqueado por gestión interna" }),
        });

        await renderBlocked();
        await refreshSlotOptions();
        await renderTodayAvailability();
        alert("Bloque agregado.");
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (adminCreateForm) {
    adminCreateForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const adminKey = byId("admin-create-key").value;
      const barberId = Number(byId("admin-create-barber").value);
      const username = byId("admin-create-username").value.trim().toLowerCase();
      const password = byId("admin-create-password").value;
      const photoFile = byId("admin-create-photo")?.files?.[0] || null;
      const photoDataUrl = await fileToDataUrl(photoFile);

      try {
        const data = await api("/api/admin/barber-accounts", {
          method: "POST",
          headers: { "x-admin-key": adminKey },
          body: JSON.stringify({ barberId, username, password, photoDataUrl }),
        });
        byId("admin-create-result").textContent = `Usuario ${data.username} listo para ${data.barber.name}.`;
        await loadCatalogs();
        renderBarbers();
        fillSelectors();
      } catch (error) {
        byId("admin-create-result").textContent = error.message;
      }
    });
  }

  if (adminCreateNewBarberForm) {
    adminCreateNewBarberForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const adminKey = byId("admin-new-key").value;
      const name = byId("admin-new-name").value.trim();
      const specialty = byId("admin-new-specialty").value.trim();
      const username = byId("admin-new-username").value.trim().toLowerCase();
      const password = byId("admin-new-password").value;
      const photoFile = byId("admin-new-photo")?.files?.[0] || null;
      const photoDataUrl = await fileToDataUrl(photoFile);

      try {
        const data = await api("/api/admin/barbers", {
          method: "POST",
          headers: { "x-admin-key": adminKey },
          body: JSON.stringify({ name, specialty, username, password, photoDataUrl }),
        });
        byId("admin-new-result").textContent = `Barbero ${data.barber.name} creado correctamente.`;
        await loadCatalogs();
        renderBarbers();
        fillSelectors();
      } catch (error) {
        byId("admin-new-result").textContent = error.message;
      }
    });
  }

  if (barberLoginForm) {
    barberLoginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = byId("barber-login-username").value.trim().toLowerCase();
      const password = byId("barber-login-password").value;

      try {
        const data = await apiBarber("/api/barber-auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
        state.barberToken = data.token;
        state.barberUser = data.barber;
        localStorage.setItem("barber_staff_token", state.barberToken);
        writeLS("barber_staff_user", state.barberUser);
        byId("barber-login-result").textContent = `Sesión activa: ${data.barber.barber_name}`;
        await loadBarberAvailabilityForDate();
      } catch (error) {
        byId("barber-login-result").textContent = error.message;
      }
    });
  }

  const barberAvailabilityDate = byId("barber-availability-date");
  if (barberAvailabilityDate) {
    barberAvailabilityDate.addEventListener("change", () => void loadBarberAvailabilityForDate());
  }

  if (barberAvailabilityForm) {
    barberAvailabilityForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!state.barberToken) {
        byId("barber-availability-result").textContent = "Inicia sesión como barbero primero.";
        return;
      }

      const date = byId("barber-availability-date").value;
      const slots = Array.from(byId("barber-availability-slots").selectedOptions).map((opt) => opt.value);

      try {
        await apiBarber("/api/barber-availability/me", {
          method: "POST",
          body: JSON.stringify({ date, slots }),
        });
        byId("barber-availability-result").textContent = "Disponibilidad guardada.";
        await renderTodayAvailability();
        await renderSelectedBarberAgenda();
      } catch (error) {
        byId("barber-availability-result").textContent = error.message;
      }
    });
  }

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = byId("newsletter-email").value.trim().toLowerCase();

      try {
        await api("/api/newsletter", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        byId("newsletter-result").textContent = "Suscripción confirmada.";
        e.target.reset();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = byId("contact-name").value.trim();
      const phone = byId("contact-phone").value.trim();
      const message = byId("contact-message").value.trim();

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
  }

  if (agendaForm) {
    agendaForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const adminKey = byId("agenda-admin-key").value;
      const email = byId("agenda-user-email").value.trim().toLowerCase();
      const list = byId("user-agenda-results");

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
  }

  if (clientsForm) {
    clientsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const adminKey = byId("clients-admin-key").value;
      const list = byId("clients-list");

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
}

async function loadCatalogs() {
  const [services, barbers, courses, businessInfo] = await Promise.all([
    api("/api/services"),
    api("/api/barbers"),
    api("/api/courses"),
    api("/api/business-info"),
  ]);

  state.services = services;
  state.barbers = barbers;
  state.courses = courses;
  state.businessInfo = businessInfo;
}

async function init() {
  try {
    await loadCatalogs();
    applyBusinessInfo();
    renderServices();
    renderBarbers();
    renderCourses();
    fillSelectors();
    bindEvents();
    hydrateUser();
    renderServiceSummary();
    await refreshSlotOptions();
    await renderTodayAvailability();
    await renderSelectedBarberAgenda();
    await renderBlocked();
    await renderUserBookings();
    await loadClientProfile();
    await loadBarberAvailabilityForDate();
  } catch (error) {
    console.error(error);
    alert(`No se pudo iniciar la app: ${error.message}`);
  }
}

void init();
