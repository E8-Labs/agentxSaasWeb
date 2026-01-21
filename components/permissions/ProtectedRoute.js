'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { useHasPermission } from '@/contexts/PermissionContext'
import { CircularProgress, Box, Typography } from '@mui/material'

/**
 * ProtectedRoute Component
 * Wraps content that requires a specific permission
 * 
 * @param {Object} props
 * @param {string} props.permissionKey - Permission key required
 * @param {number|null} props.contextUserId - Optional context user ID
 * @param {React.ReactNode} props.children - Content to render if permission granted
 * @param {React.ReactNode} props.fallback - Optional fallback content if no permission
 * @param {boolean} props.hideIfNoPermission - If true, hides content instead of showing fallback
 */
function ProtectedRoute({
  permissionKey,
  contextUserId = null,
  children,
  fallback = null,
  hideIfNoPermission = false,
}) {
  const [hasAccess, isLoading] = useHasPermission(permissionKey, contextUserId)
  const router = useRouter()

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  if (!hasAccess) {
    if (hideIfNoPermission) {
      return null
    }

    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You do not have permission to access this content.
        </Typography>
      </Box>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
