// Service Worker para PWA com estratégias de cache otimizadas
const CACHE_NAME = 'rn-gestor-auto-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';
const API_CACHE = 'api-v1';

// Recursos para cache estático (sempre em cache)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  // Adicionar outros assets estáticos conforme necessário
];

// Recursos para cache dinâmico
const CACHE_STRATEGIES = {
  // Cache First - para assets estáticos
  CACHE_FIRST: 'cache-first',
  // Network First - para dados dinâmicos
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate - para recursos que podem ser atualizados
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Network Only - para requests críticos
  NETWORK_ONLY: 'network-only',
  // Cache Only - para recursos offline
  CACHE_ONLY: 'cache-only'
};

// Configuração de TTL para diferentes tipos de cache
const CACHE_TTL = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 dias
  DYNAMIC: 7 * 24 * 60 * 60 * 1000, // 7 dias
  IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 dias
  API: 5 * 60 * 1000, // 5 minutos
};

// Limites de cache
const CACHE_LIMITS = {
  STATIC: 50,
  DYNAMIC: 100,
  IMAGES: 200,
  API: 50
};

// Event: Install
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Event: Activate
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remover caches antigos
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker: Activation failed', error);
      })
  );
});

// Event: Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignorar requests de extensões do browser
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Função principal para lidar com requests
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Determinar estratégia baseada no tipo de recurso
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    if (isImageRequest(url)) {
      return await staleWhileRevalidate(request, IMAGE_CACHE);
    }
    
    if (isAPIRequest(url)) {
      return await networkFirst(request, API_CACHE);
    }
    
    if (isNavigationRequest(request)) {
      return await handleNavigation(request);
    }
    
    // Estratégia padrão para outros recursos
    return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('Service Worker: Request failed', error);
    return await handleOffline(request);
  }
}

// Estratégia: Cache First
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, CACHE_TTL.STATIC)) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await limitCacheSize(cacheName, CACHE_LIMITS.STATIC);
    }
    
    return networkResponse;
  } catch (error) {
    return cachedResponse || await handleOffline(request);
  }
}

// Estratégia: Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      await limitCacheSize(cacheName, CACHE_LIMITS.API);
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, CACHE_TTL.API)) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Estratégia: Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Buscar nova versão em background
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        await cache.put(request, responseClone);
        await limitCacheSize(cacheName, CACHE_LIMITS.DYNAMIC);
      }
      return networkResponse;
    })
    .catch(() => null);
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Aguardar network se não há cache
  return await fetchPromise || await handleOffline(request);
}

// Lidar com navegação (SPA)
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Para SPAs, retornar index.html do cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedIndex = await cache.match('/index.html');
    
    if (cachedIndex) {
      return cachedIndex;
    }
    
    // Fallback para página offline
    return await handleOffline(request);
  }
}

// Lidar com requests offline
async function handleOffline(request) {
  const url = new URL(request.url);
  
  if (isNavigationRequest(request)) {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }
  
  if (isImageRequest(url)) {
    // Retornar imagem placeholder offline
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Offline</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
  
  return new Response('Offline', { 
    status: 503,
    statusText: 'Service Unavailable'
  });
}

// Utilitários de verificação
function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/) ||
         STATIC_ASSETS.some(asset => url.pathname === asset);
}

function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase') ||
         url.pathname.includes('/rest/v1/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Verificar se response está expirado
function isExpired(response, ttl) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseDate = new Date(dateHeader).getTime();
  const now = Date.now();
  
  return (now - responseDate) > ttl;
}

// Limitar tamanho do cache
async function limitCacheSize(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > limit) {
    // Remover os mais antigos
    const keysToDelete = keys.slice(0, keys.length - limit);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Event: Message (para comunicação com a aplicação)
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage({ type: 'CACHE_INFO', payload: info });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache(payload.cacheName).then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PREFETCH_RESOURCES':
      prefetchResources(payload.urls).then(() => {
        event.ports[0].postMessage({ type: 'PREFETCH_COMPLETE' });
      });
      break;
  }
});

// Obter informações do cache
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    info[cacheName] = {
      size: keys.length,
      urls: keys.map(key => key.url)
    };
  }
  
  return info;
}

// Limpar cache específico
async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

// Pré-carregar recursos
async function prefetchResources(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  const fetchPromises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.warn('Failed to prefetch:', url, error);
    }
  });
  
  await Promise.all(fetchPromises);
}

// Event: Background Sync (se suportado)
if ('sync' in self.registration) {
  self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
      event.waitUntil(handleBackgroundSync());
    }
  });
}

// Lidar com sincronização em background
async function handleBackgroundSync() {
  // Implementar lógica de sincronização
  console.log('Background sync triggered');
  
  // Exemplo: sincronizar dados pendentes
  try {
    // Buscar dados do IndexedDB ou localStorage
    // Enviar para servidor quando online
    // Limpar dados sincronizados
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Event: Push (para notificações)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-72x72.png',
    image: data.image,
    data: data.data,
    actions: data.actions,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    tag: data.tag,
    timestamp: Date.now(),
    vibrate: data.vibrate || [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Event: Notification Click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { action, data } = event;
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Se há uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url === data?.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Caso contrário, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(data?.url || '/');
        }
      })
  );
});

console.log('Service Worker: Loaded successfully');