// Unified API Client - Handles authentication automatically
// Supports both secure storage (cookies) and legacy (localStorage) modes
import axios from 'axios';
import AuthHelper from './AuthHelper';

class ApiClient {
  constructor() {
    // Check if secure storage is enabled
    this.useSecureStorage = 
      typeof window !== 'undefined' && 
      process.env.NEXT_PUBLIC_USE_SECURE_STORAGE === 'true';
  }

  /**
   * Make an authenticated API request
   * Routes through Next.js API proxy when using secure storage
   * Uses direct axios calls with localStorage token in legacy mode
   * 
   * @param {string} url - API endpoint URL
   * @param {Object} options - Request options (method, headers, body, etc.)
   * @returns {Promise} Response promise
   */
  async request(url, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      ...restOptions
    } = options;

    if (this.useSecureStorage) {
      // Route through Next.js API proxy (which reads from httpOnly cookie)
      return this._requestViaProxy(url, {
        method,
        headers,
        body,
        params,
        ...restOptions,
      });
    }

    // Legacy: direct axios call with localStorage token
    return this._requestDirect(url, {
      method,
      headers,
      body,
      params,
      ...restOptions,
    });
  }

  /**
   * Make request via Next.js API proxy (secure storage mode)
   * @private
   */
  async _requestViaProxy(url, options) {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({
          url,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return {
        data: await response.json(),
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      console.error('API proxy request failed:', error);
      throw error;
    }
  }

  /**
   * Make direct axios request (legacy mode)
   * @private
   */
  async _requestDirect(url, options) {
    const token = AuthHelper.getToken();
    
    const { method, headers, body, params, ...restOptions } = options;
    
    const config = {
      url,
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      ...restOptions,
    };

    if (options.body) {
      config.data = options.body;
    }

    if (options.params) {
      config.params = options.params;
    }

    try {
      const response = await axios(config);
      return response;
    } catch (error) {
      console.error('Direct API request failed:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(url, body, options = {}) {
    return this.request(url, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  async patch(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Get auth headers for manual requests
   * In secure storage mode, returns empty object (cookies are sent automatically)
   * In legacy mode, returns Authorization header with token
   */
  getAuthHeaders() {
    if (this.useSecureStorage) {
      // Cookies are sent automatically, no need for Authorization header
      return {};
    }

    // Legacy: return Authorization header
    return AuthHelper.getAuthHeaders();
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
export { ApiClient };

