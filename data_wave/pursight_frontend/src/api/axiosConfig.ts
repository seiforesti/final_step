import axios from "axios";

// Use Vite proxy for all API calls
axios.defaults.baseURL = "/api/proxy";

// Do not send cookies by default (use bearer token headers instead)
axios.defaults.withCredentials = false;

// Add request timeout to prevent long waiting times
axios.defaults.timeout = 15000; // 15 seconds

// Add response interceptor for error handling and direct retry to backend
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if ((error.code === 'ECONNABORTED' || !error.response) && !error.config?.__retriedDirectly) {
      try {
        error.config.__retriedDirectly = true;
        const originalBaseURL = error.config.baseURL;
        error.config.baseURL = 'http://localhost:8000';
        const direct = await axios.request(error.config);
        error.config.baseURL = originalBaseURL;
        return direct;
      } catch (e) {
        console.error('Backend server is not responding. Please check if the server is running.');
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
