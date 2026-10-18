import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for standardized API responses and errors
api.interceptors.response.use(
  (response) => {
    // Return payload data directly when formatted in standard envelope
    return response.data;
  },
  (error) => {
    const errorData = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to HelpRoster services'
    };
    return Promise.reject(errorData);
  }
);

export async function checkServerHealth() {
  return api.get('/health');
}

export default api;
