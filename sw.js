/* Uso offline do Planejador Curricular.
   Rede primeiro: com internet, sempre busca a versão mais nova (inclusive os
   horários); sem internet, usa a última cópia salva no aparelho. */
const CACHE = "planejador-feelt-v2";
const ARQUIVOS = ["./", "index.html", "horarios.js", "manifest.webmanifest", "icones/icone.svg", "icones/icone-192.png", "icones/icone-512.png", "icones/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-store" })
      .then(res => { if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
