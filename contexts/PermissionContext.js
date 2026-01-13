'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const PermissionContext = createContext(null)

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(false)
  const [permissionCache, setPermissionCache] = useState(new Map())

  /**
   * Check if user has a specific permission
   * @param {string} permissionKey - Permission key to check
   * @param {number|null} contextUserId - Optional context user ID for subaccount permissions
   * @returns {boolean} - Whether user has the permission
   */
  const hasPermission = useCallback(
    async (permissionKey, contextUserId = null) => {
      if (!permissionKey) return false

      // Check cache first
      const cacheKey = `${permissionKey}:${contextUserId || 'null'}`
      if (permissionCache.has(cacheKey)) {
        return permissionCache.get(cacheKey)
      }

      try {
        const localData = localStorage.getItem('User')
        if (!localData) return false

        const userData = JSON.parse(localData)
        const token = userData.token
        if (!token) return false

        // For account owners (non-Invitee), they have all permissions
        if (userData.user?.userRole !== 'Invitee') {
          permissionCache.set(cacheKey, true)
          return true
        }

        // For team members (Invitee), check permission via API
        let url = `/api/permissions/check?permissionKey=${encodeURIComponent(permissionKey)}`
        if (contextUserId) {
          url += `&contextUserId=${contextUserId}`
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.data?.status && response.data?.hasPermission !== undefined) {
          const hasAccess = response.data.hasPermission
          permissionCache.set(cacheKey, hasAccess)
          return hasAccess
        }

        // Default to false if API call fails
        permissionCache.set(cacheKey, false)
        return false
      } catch (error) {
        console.error('Error checking permission:', error)
        permissionCache.set(cacheKey, false)
        return false
      }
    },
    [permissionCache]
  )

  /**
   * Fetch permissions for a team member
   * @param {number} teamMemberId - Team member ID
   * @param {number|null} contextUserId - Optional context user ID
   */
  const fetchTeamMemberPermissions = useCallback(
    async (teamMemberId, contextUserId = null) => {
      try {
        setLoading(true)
        const localData = localStorage.getItem('User')
        if (!localData) {
          setLoading(false)
          return []
        }

        const userData = JSON.parse(localData)
        const token = userData.token
        if (!token) {
          setLoading(false)
          return []
        }

        // Use Next.js API route
        let url = `/api/permissions/team/${teamMemberId}`
        if (contextUserId) {
          url += `?contextUserId=${contextUserId}`
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.data?.status && response.data?.data) {
          return response.data.data
        }

        return []
      } catch (error) {
        console.error('Error fetching team member permissions:', error)
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Fetch available permissions for current user's role
   * @param {string|null} context - Optional context filter
   */
  const fetchAvailablePermissions = useCallback(async (context = null) => {
    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        setLoading(false)
        return []
      }

      const userData = JSON.parse(localData)
      const token = userData.token
      if (!token) {
        setLoading(false)
        return []
      }

      // Use Next.js API route
      let url = '/api/permissions/available'
      if (context) {
        url += `?context=${context}`
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        return response.data.data
      }

      return []
    } catch (error) {
      console.error('Error fetching available permissions:', error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Grant permission to team member
   */
  const grantPermission = useCallback(
    async (teamMemberId, permissionKey, contextUserId = null) => {
      try {
        const localData = localStorage.getItem('User')
        if (!localData) {
          throw new Error('User not authenticated')
        }

        const userData = JSON.parse(localData)
        const token = userData.token
        if (!token) {
          throw new Error('No auth token')
        }

        // Use Next.js API route
        const response = await axios.post(
          '/api/permissions/grant',
          {
            teamMemberId,
            permissionKey,
            contextUserId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status) {
          // Clear cache for this permission
          const cacheKey = `${permissionKey}:${contextUserId || 'null'}`
          permissionCache.delete(cacheKey)
          return response.data.data
        }

        throw new Error(response.data?.message || 'Failed to grant permission')
      } catch (error) {
        console.error('Error granting permission:', error)
        throw error
      }
    },
    [permissionCache]
  )

  /**
   * Revoke permission from team member
   */
  const revokePermission = useCallback(
    async (teamMemberId, permissionKey, contextUserId = null) => {
      try {
        const localData = localStorage.getItem('User')
        if (!localData) {
          throw new Error('User not authenticated')
        }

        const userData = JSON.parse(localData)
        const token = userData.token
        if (!token) {
          throw new Error('No auth token')
        }

        // Use Next.js API route
        const response = await axios.post(
          '/api/permissions/revoke',
          {
            teamMemberId,
            permissionKey,
            contextUserId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status) {
          // Clear cache for this permission
          const cacheKey = `${permissionKey}:${contextUserId || 'null'}`
          permissionCache.delete(cacheKey)
          return true
        }

        throw new Error(response.data?.message || 'Failed to revoke permission')
      } catch (error) {
        console.error('Error revoking permission:', error)
        throw error
      }
    },
    [permissionCache]
  )

  /**
   * Bulk update permissions for team member
   */
  const bulkUpdatePermissions = useCallback(
    async (teamMemberId, permissions, contextUserId = null) => {
      try {
        const localData = localStorage.getItem('User')
        if (!localData) {
          throw new Error('User not authenticated')
        }

        const userData = JSON.parse(localData)
        const token = userData.token
        if (!token) {
          throw new Error('No auth token')
        }

        // Use Next.js API route
        const response = await axios.put(
          '/api/permissions/bulk',
          {
            teamMemberId,
            permissions,
            contextUserId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response.data?.status) {
          // Clear all cached permissions for this team member
          permissionCache.clear()
          return true
        }

        throw new Error(
          response.data?.message || 'Failed to update permissions'
        )
      } catch (error) {
        console.error('Error bulk updating permissions:', error)
        throw error
      }
    },
    [permissionCache]
  )

  const value = {
    permissions,
    loading,
    hasPermission,
    fetchTeamMemberPermissions,
    fetchAvailablePermissions,
    grantPermission,
    revokePermission,
    bulkUpdatePermissions,
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

/**
 * Hook to use permission context
 */
export function usePermission() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermission must be used within PermissionProvider')
  }
  return context
}

/**
 * Hook to check if user has a specific permission
 * @param {string} permissionKey - Permission key to check
 * @param {number|null} contextUserId - Optional context user ID
 * @returns {[boolean, boolean]} - [hasPermission, isLoading]
 */
export function useHasPermission(permissionKey, contextUserId = null) {
  const { hasPermission, loading } = usePermission()
  const [hasAccess, setHasAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let isMounted = true

    const checkPermission = async () => {
      setIsChecking(true)
      try {
        const result = await hasPermission(permissionKey, contextUserId)
        if (isMounted) {
          setHasAccess(result)
        }
      } catch (error) {
        console.error('Error checking permission:', error)
        if (isMounted) {
          setHasAccess(false)
        }
      } finally {
        if (isMounted) {
          setIsChecking(false)
        }
      }
    }

    if (permissionKey) {
      checkPermission()
    } else {
      setHasAccess(false)
      setIsChecking(false)
    }

    return () => {
      isMounted = false
    }
  }, [permissionKey, contextUserId, hasPermission])

  return [hasAccess, isChecking || loading]
}
