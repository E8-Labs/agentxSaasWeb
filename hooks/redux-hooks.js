import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  clearError,
  clearUser,
  selectAgencyUuid,
  selectIsAgencyTeamMember,
  selectIsAuthenticated,
  selectToken,
  selectUser,
  selectUserError,
  selectUserLoading,
  selectUserRole,
  selectUserType,
  setAgencyUuid,
  setError,
  setLoading,
  setToken,
  setUser,
  updateUserProfile,
} from '../store/slices/userSlice'

// Custom hooks for user management
export const useUser = () => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const token = useSelector(selectToken)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userType = useSelector(selectUserType)
  const userRole = useSelector(selectUserRole)
  const agencyUuid = useSelector(selectAgencyUuid)
  const isAgencyTeamMember = useSelector(selectIsAgencyTeamMember)
  const loading = useSelector(selectUserLoading)
  const error = useSelector(selectUserError)

  // Initialize Redux from localStorage if Redux is empty but localStorage has data
  useEffect(() => {
    if (!user && !token) {
      try {
        const localStorageData = localStorage.getItem('User')
        if (localStorageData) {
          const userData = JSON.parse(localStorageData)
          if (userData.token && userData.user) {
            console.log(
              '🔄 [REDUX-HOOKS] Initializing Redux from localStorage:',
              {
                userId: userData.user?.id,
                planType: userData.user?.plan?.type,
                planName: userData.user?.plan?.name,
              },
            )
            dispatch(setUser(userData))
          }
        }
      } catch (error) {
        console.warn('Failed to initialize Redux from localStorage:', error)
      }
    }
  }, [user, token, dispatch])

  const actions = {
    setUser: (userData) => {
      // Check if userData has both user and token properties
      let dataToSave

      if (
        userData &&
        userData.hasOwnProperty('token') &&
        userData.hasOwnProperty('user')
      ) {
        // Full user data with token - save as is
        dataToSave = userData
      } else if (userData && !userData.hasOwnProperty('token')) {
        // Only user data provided - preserve existing token
        const existingData = JSON.parse(localStorage.getItem('User') || '{}')
        dataToSave = {
          token: existingData.token || null,
          user: userData,
        }
      } else {
        // Fallback - save as is
        dataToSave = userData
      }

      // Update localStorage
      localStorage.setItem('User', JSON.stringify(dataToSave))
      // Update Redux
      dispatch(setUser(dataToSave))
    },
    setToken: (token) => dispatch(setToken(token)),
    updateProfile: (profileData) => dispatch(updateUserProfile(profileData)),
    setAgencyUuid: (uuid) => dispatch(setAgencyUuid(uuid)),
    logout: () => dispatch(clearUser()),
    setLoading: (loading) => dispatch(setLoading(loading)),
    setError: (error) => dispatch(setError(error)),
    clearError: () => dispatch(clearError()),
  }

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
  }
}

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
    error,
  } = useUser()

  // Helper to get auth headers (matches existing AuthHelper pattern)
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  })

  // Check if user is admin
  const isAdmin = userType === 'admin'

  // Check if user is agency
  const isAgency = userRole === 'Agency' || userRole === 'AgencySubAccount'

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
  }
}

// Hook for agency-specific functionality
export const useAgency = () => {
  const { agencyUuid, isAgencyTeamMember, userRole, setAgencyUuid } = useUser()

  const isAgencyUser =
    userRole === 'Agency' ||
    userRole === 'AgencySubAccount' ||
    isAgencyTeamMember

  return {
    agencyUuid,
    isAgencyTeamMember,
    isAgencyUser,
    setAgencyUuid,
  }
}
