const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  console.warn('VITE_API_URL is not set. Backend API requests will use the current origin and may fail if the backend is deployed separately.');
}

const API_BASE_URL = configuredApiBaseUrl || (
  import.meta.env.DEV ? 'http://127.0.0.1:5000' : ''
);

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;

// Start the backend wake-up request as soon as the app bundle is evaluated.
// It is intentionally fire-and-forget so it does not delay the first paint.
export const warmBackend = () => {
  fetch(getApiUrl('/api/health'), {
    method: 'GET',
    cache: 'no-store',
    keepalive: true
  }).catch(() => {
    // A warm-up request must never prevent the app from loading.
  });
};
