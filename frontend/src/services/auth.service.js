import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';

/**
 * Authentication Service
 * Handles all authentication-related API calls through the API Gateway
 */

class AuthService {
  /**
   * Sign up a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.userName - User's name
   * @param {string} userData.userEmail - User's email
   * @param {string} userData.userPassword - User's password
   * @param {string} userData.role - User's role (optional, defaults to "USER")
   * @returns {Promise<Object>} - API response
   */
  async signUp(userData) {
    try {
      const response = await fetch(
        `${API_CONFIG.USER_SERVICE}${API_ENDPOINTS.AUTH.SIGN_UP}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userName: userData.userName,
            userEmail: userData.userEmail,
            userPassword: userData.userPassword,
            role: userData.role || 'USER',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed');
      }

      return {
        success: true,
        data: data,
        message: data.message || 'User registered successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Something went wrong. Please try again.',
      };
    }
  }

  /**
   * Sign in a user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.userEmail - User's email
   * @param {string} credentials.userPassword - User's password
   * @returns {Promise<Object>} - API response with user data and tokens
   */
  async signIn(credentials) {
    try {
      const response = await fetch(
        `${API_CONFIG.USER_SERVICE}${API_ENDPOINTS.AUTH.SIGN_IN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: credentials.userEmail,
            userPassword: credentials.userPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sign in failed');
      }

      // Store tokens if sign in is successful
      if (data.body?.accessToken) {
        localStorage.setItem('accessToken', data.body.accessToken);
        localStorage.setItem('refreshToken', data.body.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.body));
      }

      return {
        success: true,
        data: data.body,
        message: data.message || 'User signed in successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Something went wrong. Please try again.',
      };
    }
  }

  /**
   * Validate the current token
   * @returns {Promise<Object>} - Validation response
   */
  async validateToken() {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(
        `${API_CONFIG.USER_SERVICE}${API_ENDPOINTS.AUTH.VALIDATE_TOKEN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token validation failed');
      }

      return {
        success: true,
        data: data.body,
        message: data.message || 'Token is valid',
      };
    } catch (error) {
      // Clear invalid tokens
      this.clearTokens();
      return {
        success: false,
        message: error.message || 'Token validation failed',
      };
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - User data
   */
  async getUserById(userId) {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch(
        `${API_CONFIG.USER_SERVICE}${API_ENDPOINTS.USER.GET_BY_ID(userId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user');
      }

      return {
        success: true,
        data: data.body,
        message: data.message || 'User found',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch user',
      };
    }
  }

  /**
   * Sign out the current user
   */
  signOut() {
    this.clearTokens();
  }

  /**
   * Clear all stored tokens and user data
   */
  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  /**
   * Get the current user from localStorage
   * @returns {Object|null} - Current user data or null
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get the current access token
   * @returns {string|null} - Access token or null
   */
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export default new AuthService();
