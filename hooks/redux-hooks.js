import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { 
  selectUser, 
  selectToken, 
  selectIsAuthenticated, 
  selectUserType, 
  selectUserRole, 
  selectAgencyUuid, 
  selectIsAgencyTeamMember,
  selectUserLoading,
  selectUserError,
  setUser,
  setToken,
  updateUserProfile,
  setAgencyUuid,
  clearUser,
  setLoading,
  setError,
  clearError
} from '../store/slices/userSlice';
import secureStorageService from '../utilities/SecureStorageService';

// Custom hooks for user management
export const useUser = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userType = useSelector(selectUserType);
  const userRole = useSelector(selectUserRole);
  const agencyUuid = useSelector(selectAgencyUuid);
  const isAgencyTeamMember = useSelector(selectIsAgencyTeamMember);
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize Redux from secure storage or localStorage
  useEffect(() => {
    if (!user && !token && !isInitializing) {
      setIsInitializing(true);
      const initializeUser = async () => {
        try {
          const userData = await secureStorageService.getUser();
          if (userData && (userData.token || userData.user)) {
            console.log('🔄 [REDUX-HOOKS] Initializing Redux from storage:', {
              userId: userData.user?.id,
              planType: userData.user?.plan?.type,
              planName: userData.user?.plan?.name,
              hasToken: !!userData.token
            });
            dispatch(setUser(userData));
          }
        } catch (error) {
          console.warn('Failed to initialize Redux from storage:', error);
        } finally {
          setIsInitializing(false);
        }
      };
      initializeUser();
    }
  }, [user, token, dispatch, isInitializing]);

  const actions = {
    setUser: async (userData) => {
      // Check if userData has both user and token properties
      let dataToSave;

      if (userData && userData.hasOwnProperty('token') && userData.hasOwnProperty('user')) {
        // Full user data with token - save as is
        dataToSave = userData;
      } else if (userData && !userData.hasOwnProperty('token')) {
        // Only user data provided - preserve existing token
        const existingData = await secureStorageService.getUser();
        dataToSave = {
          token: existingData?.token || null,
          user: userData
        };
      } else {
        // Fallback - save as is
        dataToSave = userData;
      }

      // Update storage (both secure storage and localStorage for backward compatibility)
      await secureStorageService.syncUser(dataToSave);
      // Update Redux
      dispatch(setUser(dataToSave));
    },
    setToken: (token) => dispatch(setToken(token)),
    updateProfile: (profileData) => {
      dispatch(updateUserProfile(profileData));
      // Also update storage with updated profile
      const updateStorage = async () => {
        const currentData = await secureStorageService.getUser();
        if (currentData) {
          const updatedData = {
            ...currentData,
            user: { ...currentData.user, ...profileData }
          };
          await secureStorageService.syncUser(updatedData);
        }
      };
      updateStorage();
    },
    setAgencyUuid: (uuid) => dispatch(setAgencyUuid(uuid)),
    logout: async () => {
      await secureStorageService.clearUser();
      dispatch(clearUser());
    },
    setLoading: (loading) => dispatch(setLoading(loading)),
    setError: (error) => dispatch(setError(error)),
    clearError: () => dispatch(clearError()),
  };

  return {
    user,
    token,
    isAuthenticated,
    userType,
    userRole,
    agencyUuid,
    isAgencyTeamMember,
    loading,
    error,
    ...actions,
  };
};

// Auth-specific hook
export const useAuth = () => {
  const { 
    token, 
    isAuthenticated, 
    userType, 
    userRole, 
    setUser, 
    setToken, 
    logout,
    loading,
    error 
  } = useUser();

  // Helper to get auth headers (matches existing AuthHelper pattern)
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  });

  // Check if user is admin
  const isAdmin = userType === 'admin';
  
  // Check if user is agency
  const isAgency = userRole === 'Agency' || userRole === 'AgencySubAccount';

  return {
    token,
    isAuthenticated,
    userType,
    userRole,
    isAdmin,
    isAgency,
    loading,
    error,
    login: setUser,
    setToken,
    logout,
    getAuthHeaders,
  };
};

// Hook for agency-specific functionality
export const useAgency = () => {
  const { 
    agencyUuid, 
    isAgencyTeamMember, 
    userRole, 
    setAgencyUuid 
  } = useUser();

  const isAgencyUser = userRole === 'Agency' || userRole === 'AgencySubAccount' || isAgencyTeamMember;

  return {
    agencyUuid,
    isAgencyTeamMember,
    isAgencyUser,
    setAgencyUuid,
  };
};