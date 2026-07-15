const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  console.warn('VITE_API_URL is not set. Backend API requests will use the current origin and may fail if the backend is deployed separately.');
}

const API_BASE_URL = configuredApiBaseUrl || (
  import.meta.env.DEV ? 'http://127.0.0.1:5000' : ''
);

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;
