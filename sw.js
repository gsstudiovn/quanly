/* Service worker – cho phép mở app khi mất mạng (offline cơ bản).
   Khi sửa index.html, tăng số VERSION để điện thoại tải bản mới. */
const VERSION = "gsql-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./images/icon-192.png", "./images/icon-512.png", "./images/logo.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Chỉ xử lý file của chính app; Firebase, Google Fonts… đi thẳng mạng
  if (url.origin !== location.origin) return;

  // Trang chính: ưu tiên mạng (để luôn có bản mới), mất mạng thì dùng bản đã lưu
  if (req.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  // File tĩnh: ưu tiên bản đã lưu
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
