const CACHE_NAME = 'edu-system-v1'
const STATIC_ASSETS = [
  '/',
  '/classes',
  '/assignments',
  '/analytics',
  '/nodes',
  '/icon-192.png',
  '/icon-512.png',
]

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// 网络优先策略，失败时回退到缓存
self.addEventListener('fetch', (event) => {
  // 跳过 API 请求的缓存
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 缓存成功的响应
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request)
      })
  )
})
