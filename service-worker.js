const CACHE_NAME = 'employee-management-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-192x192.png'
];

// ติดตั้ง Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// เปิดใช้งาน Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// ดักจับคำขอเครือข่าย
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // ส่งคืนจาก cache ถ้ามี
                if (response) {
                    return response;
                }
                
                // ถ้าไม่มีใน cache ให้ดึงจากเครือข่าย
                return fetch(event.request).then(
                    response => {
                        // ตรวจสอบว่า response ถูกต้อง
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // เก็บ response ลง cache
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                            
                        return response;
                    }
                );
            })
            .catch(() => {
                // ถ้าออฟไลน์และเป็นหน้า HTML ให้ส่งคืนหน้า offline
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            })
    );
});
