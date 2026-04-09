const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : ''
);

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;
