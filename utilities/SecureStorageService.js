// Secure Storage Service - Dual-mode storage supporting both localStorage (legacy) and cookies (new)
// Feature flag: NEXT_PUBLIC_USE_SECURE_STORAGE environment variable

class SecureStorageService {
  constructor() {
    // Check if secure storage is enabled via environment variable
    // Default to false for backward compatibility during migration
    this.useSecureStorage = 
      typeof window !== 'undefined' && 
      process.env.NEXT_PUBLIC_USE_SECURE_STORAGE === 'true';
  }

  /**
   * Get user data from secure storage (cookies) or localStorage (legacy)
   * @returns {Promise<Object|null>} User data object or null
   */
  async getUser() {
    if (typeof window === 'undefined') {
      return null;
    }

    if (this.useSecureStorage) {
      try {
        // Fetch from API route which reads from httpOnly cookie
        const response = await fetch('/api/auth/user', {
          credentials: 'include', // Include cookies in request
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
        return null;
      } catch (error) {
        console.error('Error fetching user from secure storage:', error);
        // Fallback to localStorage if API call fails
        return this._getUserFromLocalStorage();
      }
    }

    // Legacy: use localStorage
    return this._getUserFromLocalStorage();
  }

  /**
   * Get user data from localStorage (legacy method)
   * @private
   */
  _getUserFromLocalStorage() {
    try {
      const data = localStorage.getItem("User");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Get auth token
   * Note: When using secure storage, tokens are in httpOnly cookies and not accessible to JS
   * This method returns null for secure storage mode - use ApiClient for authenticated requests
   * @returns {string|null} Auth token or null
   */
  getToken() {
    if (typeof window === 'undefined') {
      return null;
    }

    // When using secure storage, token is in httpOnly cookie (not accessible to JS)
    if (this.useSecureStorage) {
      return null; // Client-side can't read httpOnly cookies
    }

    // Legacy: get token from localStorage
    try {
      const localData = localStorage.getItem("User");
      if (localData) {
        const userData = JSON.parse(localData);
        return userData.token || null;
      }
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
    }
    return null;
  }

  /**
   * Set user data in storage
   * For secure storage mode, this updates the session via API
   * For legacy mode, this updates localStorage
   * @param {Object} userData - User data object with token and user properties
   */
  async setUser(userData) {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.useSecureStorage) {
      try {
        // Update session via API route
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ userData }),
        });

        if (!response.ok) {
          console.error('Failed to update session');
          // Fallback to localStorage if API call fails
          this._setUserToLocalStorage(userData);
        }
      } catch (error) {
        console.error('Error updating session:', error);
        // Fallback to localStorage if API call fails
        this._setUserToLocalStorage(userData);
      }
    } else {
      // Legacy: update localStorage
      this._setUserToLocalStorage(userData);
    }
  }

  /**
   * Set user data to localStorage (legacy method)
   * @private
   */
  _setUserToLocalStorage(userData) {
    try {
      localStorage.setItem("User", JSON.stringify(userData));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  /**
   * Clear user data from storage
   */
  async clearUser() {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.useSecureStorage) {
      try {
        // Clear session via API route
        await fetch('/api/auth/session', {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    }

    // Always clear localStorage as well (for backward compatibility)
    try {
      localStorage.removeItem("User");
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>} True if authenticated
   */
  async isAuthenticated() {
    if (typeof window === 'undefined') {
      return false;
    }

    if (this.useSecureStorage) {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });
        return response.ok;
      } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
      }
    }

    // Legacy: check localStorage
    const token = this.getToken();
    return !!token;
  }

  /**
   * Sync user data - updates both secure storage and localStorage during migration
   * This ensures backward compatibility during the transition period
   * @param {Object} userData - User data object
   */
  async syncUser(userData) {
    // Update both storage methods during migration
    await this.setUser(userData);
    
    // Also update localStorage for backward compatibility
    if (this.useSecureStorage) {
      this._setUserToLocalStorage(userData);
    }
  }
}

// Export singleton instance
const secureStorageService = new SecureStorageService();
export default secureStorageService;
export { SecureStorageService };

