// Auth Helper for managing authentication tokens
export const AuthHelper = {
  // Set auth token
  setToken(token) {
    if (typeof window !== 'undefined') {
      // Get existing User data or create new object
      const existingUser = localStorage.getItem("User");
      const userData = existingUser ? JSON.parse(existingUser) : {};
      
      // Update the token in the User object
      userData.token = token;
      localStorage.setItem("User", JSON.stringify(userData));
    }
  },

  // Get auth token
  getToken() {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem("User");
      return localData ? JSON.parse(localData).token : null;
    }
    return null;
  },

  // Clear auth token
  clearToken() {
    if (typeof window !== 'undefined') {
      // Get existing User data
      const existingUser = localStorage.getItem("User");
      if (existingUser) {
        const userData = JSON.parse(existingUser);
        delete userData.token;
        localStorage.setItem("User", JSON.stringify(userData));
      }
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Get auth headers for API requests
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
};

export default AuthHelper;
