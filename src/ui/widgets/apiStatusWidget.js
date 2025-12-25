// src/ui/widgets/apiStatusWidget.js
// API Status Dashboard Widget
// Tüm API'lerin durumunu görsel olarak gösteren widget

import { t } from '../../i18n/i18n.js';

// API tanımları
const API_DEFINITIONS = [
    { key: 'wheretheiss', name: 'Where The ISS At', url: 'api.wheretheiss.at', icon: '🛰️' },
    { key: 'opennotify', name: 'Open Notify', url: 'api.open-notify.org', icon: '📡' },
    { key: 'celestrak', name: 'CelesTrak TLE', url: 'celestrak.org', icon: '🌍' },
    { key: 'openmeteo', name: 'Open-Meteo', url: 'api.open-meteo.com', icon: '🌤️' },
    { key: 'nominatim', name: 'Nominatim/OSM', url: 'nominatim.openstreetmap.org', icon: '📍' },
    { key: 'wikipedia', name: 'Wikipedia', url: 'en.wikipedia.org', icon: '📚' },
];

let container = null;
let unsubscribe = null;

/**
 * API Status Widget oluştur
 * @param {HTMLElement} parentEl - Parent element
 * @param {Object} store - State store
 */
export function createApiStatusWidget(parentEl, store) {
    if (container) return container;

    container = document.createElement('div');
    container.id = 'api-status-widget';
    container.className = 'api-status-widget';
    container.innerHTML = `
    <div class="api-status-header">
      <span class="api-status-icon">⚡</span>
      <span class="api-status-title">API Durumları</span>
      <button class="api-status-toggle" aria-label="Collapse">▼</button>
    </div>
    <div class="api-status-body">
      <div class="api-status-list"></div>
      <div class="api-status-footer">
        <span class="api-call-count">0 çağrı</span>
        <span class="session-time">0dk</span>
      </div>
    </div>
  `;

    // Toggle collapse - VARSAYILAN KAPALI
    const toggleBtn = container.querySelector('.api-status-toggle');
    const body = container.querySelector('.api-status-body');

    // Varsayılan olarak kapalı başla
    body.classList.add('collapsed');
    toggleBtn.textContent = '▶';

    toggleBtn.addEventListener('click', () => {
        body.classList.toggle('collapsed');
        toggleBtn.textContent = body.classList.contains('collapsed') ? '▶' : '▼';
    });

    // API listesini render et
    const listEl = container.querySelector('.api-status-list');
    API_DEFINITIONS.forEach(api => {
        const item = document.createElement('div');
        item.className = 'api-status-item';
        item.dataset.api = api.key;
        item.innerHTML = `
      <span class="api-icon">${api.icon}</span>
      <span class="api-name">${api.name}</span>
      <span class="api-indicator" data-status="idle">●</span>
      <span class="api-response-time">—</span>
    `;
        listEl.appendChild(item);
    });

    // Store'a subscribe ol
    if (store) {
        unsubscribe = store.subscribe((state) => {
            updateWidgetState(state);
        });
    }

    parentEl.appendChild(container);
    return container;
}

/**
 * Widget state güncelle
 */
function updateWidgetState(state) {
    if (!container) return;

    const apis = state.apis || {};
    const session = state.session || {};

    // Her API için durumu güncelle
    API_DEFINITIONS.forEach(api => {
        const item = container.querySelector(`[data-api="${api.key}"]`);
        if (!item) return;

        const apiState = apis[api.key] || {};
        const indicator = item.querySelector('.api-indicator');
        const responseTime = item.querySelector('.api-response-time');

        // Durum göstergesi
        indicator.dataset.status = apiState.status || 'idle';

        // Yanıt süresi
        if (apiState.responseTime) {
            responseTime.textContent = `${apiState.responseTime}ms`;
        } else if (apiState.status === 'error') {
            responseTime.textContent = '✗';
        } else {
            responseTime.textContent = '—';
        }
    });

    // Footer güncelle
    const callCount = container.querySelector('.api-call-count');
    const sessionTime = container.querySelector('.session-time');

    if (callCount) {
        callCount.textContent = `${session.apiCallCount || 0} çağrı`;
    }

    if (sessionTime && session.startedAt) {
        const mins = Math.floor((Date.now() - session.startedAt) / 60000);
        sessionTime.textContent = `${mins}dk`;
    }
}

/**
 * Widget'ı kaldır
 */
export function removeApiStatusWidget() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
    if (container) {
        container.remove();
        container = null;
    }
}

/**
 * API durumunu güncelle (dışarıdan çağrılabilir)
 */
export function reportApiCall(store, apiName, { status, responseTime, error }) {
    if (!store) return;

    store.updateApiStatus(apiName, {
        status,
        responseTime,
        error,
        lastCall: Date.now()
    });

    store.incrementApiCalls();
}
