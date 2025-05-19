// Nome do cache
const CACHE_NAME = 'home-assistant-cache-v1';
// Arquivos para fazer cache inicial
const urlsToCache = [
  '/',
  '/index.html',
  // Adicione aqui os principais assets JS e CSS que são gerados pelo build do Vite
  // Ex: '/assets/index-XXXXX.js', '/assets/index-YYYYY.css'
  // Você pode precisar ajustar isso após o primeiro build ou usar ferramentas mais avançadas como Workbox.
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Evento de instalação: abre o cache e adiciona os arquivos principais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Falha ao fazer cache na instalação:', err))
  );
});

// Evento de fetch: intercepta requisições e serve do cache se disponível
self.addEventListener('fetch', (event) => {
  // Não fazer cache de requisições para a API ou WebSockets
  if (event.request.url.includes('/api/') || event.request.url.includes('/auth/') || event.request.url.startsWith('ws:')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrado no cache, retorna a resposta do cache
        if (response) {
          return response;
        }
        // Caso contrário, faz a requisição à rede
        return fetch(event.request).then(
          (networkResponse) => {
            // E se a resposta for válida, clona e armazena no cache
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        );
      })
      .catch(err => {
        console.error('Erro no fetch do service worker:', err);
        // Você pode retornar uma página offline padrão aqui se desejar
      })
  );
});

// Evento de ativação: limpa caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});