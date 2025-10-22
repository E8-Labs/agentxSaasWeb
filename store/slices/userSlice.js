import { createSlice } from '@reduxjs/toolkit';

// Initial state matching the complete API response structure
const initialState = {
  token: null,
  user: null, // Store the complete user object from API
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set complete user data from login/register API response
    setUser: (state, action) => {
      const { token, user } = action.payload;
      console.log('🟢 [REDUX] Setting user data:', { 
        userId: user?.id, 
        planType: user?.plan?.type,
        maxAgents: user?.planCapabilities?.maxAgents,
        currentAgents: user?.currentUsage?.maxAgents
      });
      state.token = token;
      state.user = user; // Store the complete user object
      state.isAuthenticated = !!token;
      state.error = null;
    },
    
    // Set token only (used by AuthHelper)
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    // Update user profile (used by profile updates)
    updateUserProfile: (state, action) => {
      if (state.user) {
        console.log('🔄 [REDUX] Updating user profile:', action.payload);
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Set agency UUID (used during onboarding)
    setAgencyUuid: (state, action) => {
      if (state.user) {
        state.user.agencyUuid = action.payload;
      }
    },
    
    // Clear user data (logout)
    clearUser: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  setToken,
  updateUserProfile,
  setAgencyUuid,
  clearUser,
  setLoading,
  setError,
  clearError,
} = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserType = (state) => state.user.user?.userType;
export const selectUserRole = (state) => state.user.user?.userRole;
export const selectAgencyUuid = (state) => state.user.user?.agencyUuid;
export const selectIsAgencyTeamMember = (state) => state.user.user?.agencyTeamMember;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

// Plan-specific selectors
export const selectUserPlan = (state) => state.user.user?.plan;
export const selectPlanCapabilities = (state) => state.user.user?.planCapabilities;
export const selectCurrentUsage = (state) => state.user.user?.currentUsage;
export const selectIsTrial = (state) => state.user.user?.isTrial;

// Plan feature selectors
export const selectMaxAgents = (state) => state.user.user?.planCapabilities?.maxAgents || 0;
// Note: currentUsage.maxAgents contains the current count, not a limit
export const selectCurrentAgents = (state) => state.user.user?.currentUsage?.maxAgents || 0;
export const selectAllowVoicemail = (state) => state.user.user?.planCapabilities?.allowVoicemail || false;
export const selectAllowToolsAndActions = (state) => state.user.user?.planCapabilities?.allowToolsAndActions || false;
export const selectAllowKnowledgeBases = (state) => state.user.user?.planCapabilities?.allowKnowledgeBases || false;

export default userSlice.reducer;