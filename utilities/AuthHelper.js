// Auth Helper for managing authentication tokens
// Dual-mode: supports both localStorage (legacy) and secure storage (cookies)
import secureStorageService from './SecureStorageService';

export const AuthHelper = {
  // Check if secure storage is enabled
  _useSecureStorage() {
    return typeof window !== 'undefined' && 
           process.env.NEXT_PUBLIC_USE_SECURE_STORAGE === 'true';
  },

  // Set auth token
  // Note: In secure storage mode, tokens are managed via httpOnly cookies
  // This method only works in legacy mode
  setToken(token) {
    if (typeof window !== 'undefined' && !this._useSecureStorage()) {
      // Legacy mode: update localStorage
      const existingUser = localStorage.getItem("User");
      const userData = existingUser ? JSON.parse(existingUser) : {};
      
      // Update the token in the User object
      userData.token = token;
      localStorage.setItem("User", JSON.stringify(userData));
    }
    // In secure storage mode, token is set via httpOnly cookie in login route
    // No action needed here
  },

  // Get auth token
  // Note: In secure storage mode, returns null (tokens are in httpOnly cookies)
  getToken() {
    if (typeof window === 'undefined') {
      return null;
    }

    if (this._useSecureStorage()) {
      // Secure storage mode: token is in httpOnly cookie, not accessible to JS
      return null;
    }

    // Legacy mode: get from localStorage
    try {
      const localData = localStorage.getItem("User");
      return localData ? JSON.parse(localData).token : null;
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  },

  // Clear auth token
  async clearToken() {
    if (typeof window === 'undefined') {
      return;
    }

    if (this._useSecureStorage()) {
      // Secure storage mode: clear via API route
      try {
        await fetch('/api/auth/session', {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error clearing secure storage token:', error);
      }
    } else {
      // Legacy mode: clear from localStorage
      try {
        const existingUser = localStorage.getItem("User");
        if (existingUser) {
          const userData = JSON.parse(existingUser);
          delete userData.token;
          localStorage.setItem("User", JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error clearing token from localStorage:', error);
      }
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    if (typeof window === 'undefined') {
      return false;
    }

    if (this._useSecureStorage()) {
      // Use SecureStorageService for secure storage mode
      return await secureStorageService.isAuthenticated();
    }

    // Legacy mode: check localStorage token
    return !!this.getToken();
  },

  // Get auth headers for API requests
  // Note: In secure storage mode, returns empty object (cookies sent automatically)
  getAuthHeaders() {
    const token = this.getToken();
    
    if (this._useSecureStorage()) {
      // In secure storage mode, cookies are sent automatically
      // No Authorization header needed
      return {
        'Content-Type': 'application/json',
      };
    }

    // Legacy mode: include Authorization header
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
};

export default AuthHelper;
