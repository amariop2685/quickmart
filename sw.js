// Servicio de la app instalada. Siempre intenta traer la versión más nueva de internet
// (precios y productos al día); si no hay conexión, muestra la última copia guardada.
const COPIA = "quickmart-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== COPIA).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Solo la tienda: ni la administración ni otros sitios (cuentas, WhatsApp) pasan por aquí.
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.includes("/admin") || url.pathname.includes("/reparto")) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(COPIA).then((c) => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then((r) => r || (e.request.mode === "navigate" ? caches.match("./") : Response.error()))));
});
