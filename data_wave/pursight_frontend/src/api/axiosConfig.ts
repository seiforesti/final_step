import axios from "axios";

// Use Vite proxy for all API calls
axios.defaults.baseURL = "/proxy";

// Do not send cookies by default (use bearer token headers instead)
axios.defaults.withCredentials = false;

// Add request timeout to prevent long waiting times
axios.defaults.timeout = 15000; // 15 seconds

// Request interceptor to prevent API loops and add validation
axios.interceptors.request.use(
  (config) => {
    // Prevent double API prefix issues
    if (config.url?.startsWith('/proxy/api/')) {
      config.url = config.url.replace('/proxy/api/', '/proxy/');
      console.warn('Fixed double API prefix:', config.url);
    }
    
    // Validate URL parameters to prevent [object Object] issues
    if (config.params) {
      Object.keys(config.params).forEach(key => {
        const value = config.params[key];
        if (typeof value === 'object' && value !== null) {
          console.warn(`Invalid parameter ${key}: object detected, skipping parameter`);
          delete config.params[key];
        }
      });
    }
    
    // Validate URL path parameters
    if (config.url) {
      // Check for [object Object] in URL
      if (config.url.includes('[object Object]')) {
        console.error('Invalid URL with [object Object]:', config.url);
        throw new Error('Invalid URL: object serialization error detected');
      }
      
      // Check for undefined in URL
      if (config.url.includes('undefined')) {
        console.error('Invalid URL with undefined:', config.url);
        throw new Error('Invalid URL: undefined value detected');
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for error handling and loop prevention
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Prevent infinite retry loops
    if (!config._retryCount) {
      config._retryCount = 0;
    }
    
    // Don't retry if we've already tried too many times
    if (config._retryCount >= 3) {
      console.error('Max retry attempts reached for:', config.url);
      return Promise.reject(error);
    }
    
    // Handle specific error types
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Backend server is not responding. Please check if the server is running.');
      return Promise.reject(error);
    }
    
    // Handle 404 errors - don't retry
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', config.url);
      return Promise.reject(error);
    }
    
    // Handle 502/503 errors - retry with exponential backoff
    if (error.response?.status === 502 || error.response?.status === 503) {
      config._retryCount++;
      const delay = Math.pow(2, config._retryCount) * 1000; // Exponential backoff
      console.warn(`Retrying request ${config._retryCount}/3 after ${delay}ms:`, config.url);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return axios(config);
    }
    
    // Handle 500 errors - don't retry to prevent server overload
    if (error.response?.status === 500) {
      console.error('Internal server error:', config.url);
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axios;
