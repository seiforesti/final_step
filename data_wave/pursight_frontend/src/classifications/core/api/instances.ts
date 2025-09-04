// API Instances for Classification System
import { classificationApi } from './classificationApi';
import { aiApi } from './aiApi';
import { mlApi } from './mlApi';
import { websocketApi } from './websocketApi';

// Export all API instances
export {
  classificationApi,
  aiApi,
  mlApi,
  websocketApi
};

// Default API instance (classificationApi as primary)
export default classificationApi;

