// Configuration file for the Digit Classification App
// Update the backend URL here if you deploy to a different service

const CONFIG = {
  // Production backend URL (Render)
  BACKEND_URL: 'https://digit-classifier-backend.onrender.com',
  
  // Alternative backend URLs for different environments
  // LOCAL_BACKEND_URL: 'http://localhost:5000',
  // CUSTOM_BACKEND_URL: 'https://your-custom-backend.com',
  
  // API endpoints
  PREDICT_ENDPOINT: '/predict',
  TEST_ENDPOINT: '/test',
  
  // Get full predict URL
  getPredictUrl() {
    return `${this.BACKEND_URL}${this.PREDICT_ENDPOINT}`;
  },
  
  // Get full test URL
  getTestUrl() {
    return `${this.BACKEND_URL}${this.TEST_ENDPOINT}`;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} 