// API Gateway Configuration
const GATEWAY_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api-gateway';

export const API_CONFIG = {
  // Base Gateway URL
  GATEWAY_BASE_URL,
  
  // Service URLs (through API Gateway)
  USER_SERVICE: `${GATEWAY_BASE_URL}/user-service`,
  STUDENT_SERVICE: `${GATEWAY_BASE_URL}/students-service`,
  COURSE_SERVICE: `${GATEWAY_BASE_URL}/course-service`,
  LIBRARY_SERVICE: `${GATEWAY_BASE_URL}/library-service`,
  FINE_SERVICE: `${GATEWAY_BASE_URL}/fine-service`,
  
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
