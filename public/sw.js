/* PIMP STUDIO — Service Worker
   - Habilita Web Push para iOS (iOS 16.4+ requiere la app instalada en inicio).
   - Muestra notificaciones push (servidor) y notificaciones locales (en dispositivo).
   - Al tocar la notificación abre/enfoca el panel interno. */

const SW_VERSION = "ps-sw-v1";

self.addEventListener("install", (event) => {
  // Activar de inmediato sin esperar pestañas previas.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Push del servidor (Web Push API). Payload JSON: { title, body, url, tag }
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "PIMP STUDIO", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "PIMP STUDIO";
  const options = {
    body: data.body || "Tienes una nueva reserva.",
    icon: "/assets/pimp-studio-logo.jpg",
    badge: "/assets/pimp-studio-mark.svg",
    tag: data.tag || "ps-reserva",
    data: { url: data.url || "/panel" },
    vibrate: [60, 40, 60],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notificación local disparada desde la app (postMessage) — útil cuando el
// barbero está usando la app en el mismo dispositivo en que ocurre la reserva.
self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type === "ps-notify") {
    const title = msg.title || "PIMP STUDIO";
    self.registration.showNotification(title, {
      body: msg.body || "",
      icon: "/assets/pimp-studio-logo.jpg",
      badge: "/assets/pimp-studio-mark.svg",
      tag: msg.tag || "ps-reserva",
      data: { url: msg.url || "/panel" },
      vibrate: [60, 40, 60],
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/panel";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes("/panel"));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});
