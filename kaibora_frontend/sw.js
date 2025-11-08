/* Service Worker (sw.js) para o Guia Kaibora */

const CACHE_NAME = 'kaibora-cache-v1';

// Lista de todos os ficheiros que o seu app precisa para funcionar offline.
// (O "corpo" do aplicativo)
const FILES_TO_CACHE = [
    '/', // <--- Redireciona para a página de login
    'index.html', // (O seu login.html renomeado)
    'registrar.html',
    'login.css',
    'kaibora.html',
    'kaibora.css',
    'mapa_3d.xhtml',
    'static/gm.css',     // (Estes são para o PWA funcionar offline no GM também, opcional)
    'static/x3dom.js',
    'static/x3dom.css',
    'static/icon.png'
];

// 1. Evento de Instalação: Salva todos os ficheiros no cache.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Abrindo cache e guardando ficheiros do app...');
                return cache.addAll(FILES_TO_CACHE);
            })
    );
});

// 2. Evento de Fetch (Busca): Intercepta pedidos de rede.
self.addEventListener('fetch', (event) => {
    
    // --- ESTA É A CORREÇÃO ---
    // Se for um pedido de API (para o "cérebro" no backend), IGNORE O CACHE.
    // Vá sempre à rede (online) para buscar dados dinâmicos.
    if (event.request.url.includes('/api/')) {
        return event.respondWith(fetch(event.request));
    }
    // --- FIM DA CORREÇÃO ---

    // Se for um ficheiro do nosso app (HTML, CSS, JS), tente o cache primeiro.
    // Isto é o que faz o app carregar instantaneamente e offline.
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Se o ficheiro estiver no cache, retorna-o.
                if (response) {
                    return response;
                }
                
                // Se não estiver, busca na rede, salva no cache e retorna.
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            })
    );
});