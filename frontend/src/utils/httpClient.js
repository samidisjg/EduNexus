import { API_CONFIG } from '../config/api.config';

/**
 * HTTP Client with Interceptors
 * Handles API calls with automatic token attachment
 */

/**
 * Make an authenticated API request
 * @param {string} url - The API endpoint
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<Response>} - Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');

  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token expired
  if (response.status === 401) {
    // Clear tokens and redirect to sign-in
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    globalThis.location.href = '/sign-in';
    throw new Error('Session expired. Please sign in again.');
  }

  return response;
};

const buildUrl = (baseUrl, endpoint) => `${baseUrl}${endpoint}`;

const parseJsonResponse = async (response) => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const request = async (baseUrl, endpoint, options = {}) => {
  const response = await authenticatedFetch(buildUrl(baseUrl, endpoint), options);
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

/**
 * Make a GET request to a protected endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<Object>} - API response data
 */
export const get = async (endpoint) => {
  return request(API_CONFIG.USER_SERVICE, endpoint, {
    method: 'GET',
  });
};

export const getFrom = async (baseUrl, endpoint) =>
  request(baseUrl, endpoint, {
    method: 'GET',
  });

/**
 * Make a POST request to a protected endpoint
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} - API response data
 */
export const post = async (endpoint, data) => {
  return request(API_CONFIG.USER_SERVICE, endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const postTo = async (baseUrl, endpoint, data) =>
  request(baseUrl, endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Make a PUT request to a protected endpoint
 * @param {string} endpoint - API endpoint path
 * @param {Object} data - Request body data
 * @returns {Promise<Object>} - API response data
 */
export const put = async (endpoint, data) => {
  return request(API_CONFIG.USER_SERVICE, endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const putTo = async (baseUrl, endpoint, data) =>
  request(baseUrl, endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Make a DELETE request to a protected endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {Promise<Object>} - API response data
 */
export const del = async (endpoint) => {
  return request(API_CONFIG.USER_SERVICE, endpoint, {
    method: 'DELETE',
  });
};

export const deleteFrom = async (baseUrl, endpoint) =>
  request(baseUrl, endpoint, {
    method: 'DELETE',
  });

export default {
  get,
  getFrom,
  post,
  postTo,
  put,
  putTo,
  del,
  deleteFrom,
  authenticatedFetch,
};
