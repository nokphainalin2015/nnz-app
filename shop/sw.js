// ໃຫ້ມືຖືຕິດຕັ້ງແອັບໄວ້ໜ້າຈໍໄດ້ · ບໍ່ເກັບລາຄາເກົ່າໄວ້ ເພື່ອໃຫ້ລູກຄ້າເຫັນລາຄາລ່າສຸດສະເໝີ
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
