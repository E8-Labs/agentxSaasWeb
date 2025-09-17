/**
 * Storage Bridge Utility
 * Provides backward compatibility between Redux and localStorage
 * Allows gradual migration without breaking existing code
 */

import { store } from './index';
import { setUser, setToken, updateUserProfile, clearUser } from './slices/userSlice';

class StorageBridge {
  constructor() {
    this.store = store;
  }

  /**
   * Get item - tries Redux first, falls back to localStorage
   */
  getItem(key) {
    try {
      const state = this.store.getState();
      
      switch (key) {
        case 'User':
          const userState = state.user;
          if (userState.token || userState.user?.id) {
            const reduxData = {
              token: userState.token,
              user: userState.user
            };
            console.log('📖 [STORAGE-BRIDGE] Getting User from Redux:', {
              source: 'Redux',
              userId: userState.user?.id,
              hasToken: !!userState.token
            });
            return JSON.stringify(reduxData);
          }
          break;
        default:
          // For non-migrated keys, use localStorage directly
          console.log(`📖 [STORAGE-BRIDGE] Getting ${key} from localStorage (not migrated)`);
          return localStorage.getItem(key);
      }
      
      // Fallback to localStorage if Redux doesn't have the data
      console.log(`📖 [STORAGE-BRIDGE] Fallback to localStorage for ${key}`);
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('StorageBridge getItem error:', error);
      return localStorage.getItem(key);
    }
  }

  /**
   * Set item - updates both Redux and localStorage for compatibility
   */
  setItem(key, value) {
    try {
      switch (key) {
        case 'User':
          const userData = typeof value === 'string' ? JSON.parse(value) : value;
          console.log('💾 [STORAGE-BRIDGE] Setting User data:', {
            target: 'Redux + localStorage',
            userId: userData.user?.id,
            plan: userData.user?.plan?.type,
            planPrice: userData.user?.plan?.price,
            hasToken: !!userData.token,
            hasPlanCapabilities: !!userData.user?.planCapabilities,
            maxAgentsFromCapabilities: userData.user?.planCapabilities?.maxAgents,
            planCapabilitiesStructure: userData.user?.planCapabilities,
            fullUserStructure: userData.user
          });
          this.store.dispatch(setUser(userData));
          break;
        default:
          // For non-migrated keys, only update localStorage
          console.log(`💾 [STORAGE-BRIDGE] Setting ${key} to localStorage only (not migrated)`);
          break;
      }
      
      // Always update localStorage for backward compatibility
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      console.log(`💾 [STORAGE-BRIDGE] localStorage updated for key: ${key}`);
    } catch (error) {
      console.warn('StorageBridge setItem error:', error);
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    }
  }

  /**
   * Remove item - clears from both Redux and localStorage
   */
  removeItem(key) {
    try {
      switch (key) {
        case 'User':
          this.store.dispatch(clearUser());
          break;
        default:
          // For non-migrated keys, only remove from localStorage
          break;
      }
      
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('StorageBridge removeItem error:', error);
      localStorage.removeItem(key);
    }
  }

  /**
   * Clear all storage
   */
  clear() {
    try {
      this.store.dispatch(clearUser());
      localStorage.clear();
    } catch (error) {
      console.warn('StorageBridge clear error:', error);
      localStorage.clear();
    }
  }

  /**
   * Helper methods for common operations
   */
  
  // Get user data (matches existing pattern)
  getUser() {
    return this.getItem('User');
  }

  // Set user data (matches existing pattern)
  setUser(userData) {
    this.setItem('User', userData);
  }

  // Update user token (used by AuthHelper)
  updateToken(token) {
    try {
      const existingUser = this.getUser();
      const userData = existingUser ? JSON.parse(existingUser) : {};
      userData.token = token;
      this.setUser(userData);
    } catch (error) {
      console.warn('StorageBridge updateToken error:', error);
    }
  }

  // Update user profile (used by profile updates)
  updateProfile(profileData) {
    try {
      const existingUser = this.getUser();
      const userData = existingUser ? JSON.parse(existingUser) : {};
      userData.user = { ...userData.user, ...profileData };
      this.setUser(userData);
      
      // Dispatch custom event for components still listening
      window.dispatchEvent(
        new CustomEvent("UpdateProfile", { detail: { update: true } })
      );
    } catch (error) {
      console.warn('StorageBridge updateProfile error:', error);
    }
  }
}

// Create singleton instance
export const storageBridge = new StorageBridge();

// Export for direct import
export default storageBridge;