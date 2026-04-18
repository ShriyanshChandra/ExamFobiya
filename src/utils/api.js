const configuredApiBaseUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '');

if (process.env.NODE_ENV === 'production' && !configuredApiBaseUrl) {
  console.warn('REACT_APP_API_URL is not set. Backend API requests will use the current origin and may fail if the backend is deployed separately.');
}

const API_BASE_URL = configuredApiBaseUrl || (
  process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : ''
);

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;
