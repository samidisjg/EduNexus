// API Gateway Configuration
export const API_CONFIG = {
  // Base Gateway URL
  GATEWAY_BASE_URL: 'http://localhost:8081/api-gateway',
  
  // Service URLs (through API Gateway)
  USER_SERVICE: 'http://localhost:8081/api-gateway/user-service',
  STUDENT_SERVICE: 'http://localhost:8081/api-gateway/students-service',
  COURSE_SERVICE: 'http://localhost:8081/api-gateway/course-service',
  LIBRARY_SERVICE: 'http://localhost:8081/api-gateway/library-service',
  
  // Timeout configuration
  TIMEOUT: 30000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGN_UP: '/auth/sign-up',
    SIGN_IN: '/auth/sign-in',
    SIGN_OUT: '/auth/sign-out',
    VALIDATE_TOKEN: '/auth/validate-token',
    HEALTH: '/auth/health',
  },
  
  // User endpoints
  USER: {
    GET_BY_ID: (userId) => `/auth/user/${userId}`,
    UPDATE: (userId) => `/auth/user/${userId}`,
    DELETE: (userId) => `/auth/user/${userId}`,
  },
};

export default API_CONFIG;
