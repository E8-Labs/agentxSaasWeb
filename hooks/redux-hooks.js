import { useSelector, useDispatch } from 'react-redux';
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

  const actions = {
    setUser: (userData) => dispatch(setUser(userData)),
    setToken: (token) => dispatch(setToken(token)),
    updateProfile: (profileData) => dispatch(updateUserProfile(profileData)),
    setAgencyUuid: (uuid) => dispatch(setAgencyUuid(uuid)),
    logout: () => dispatch(clearUser()),
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