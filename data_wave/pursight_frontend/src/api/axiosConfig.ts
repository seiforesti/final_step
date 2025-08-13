import axios from "axios";

// Set this to your backend API root (adjust port/host as needed)
axios.defaults.baseURL = "http://localhost:8000";

// Always send cookies/session with requests
axios.defaults.withCredentials = true;

// Add request timeout to prevent long waiting times
axios.defaults.timeout = 10000; // 10 seconds

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors or server not responding
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Backend server is not responding. Please check if the server is running.');
      // You could dispatch a notification here or set a global state
    }
    return Promise.reject(error);
  }
);

export default axios;
