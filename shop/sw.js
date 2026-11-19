// ໃຫ້ມືຖືຕິດຕັ້ງແອັບໄວ້ໜ້າຈໍໄດ້ · ໂຫຼດຂອງໃໝ່ຈາກເວັບທຸກເທື່ອ ເພື່ອໃຫ້ລູກຄ້າເຫັນລາຄາ ແລະ ຄລິບລ່າສຸດ
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (e.request.mode === "navigate" || /\.(js|json|csv|webmanifest)$/.test(u.pathname)) {
    e.respondWith(fetch(e.request, {cache: "no-store"}).catch(() => fetch(e.request)));
  }
});
