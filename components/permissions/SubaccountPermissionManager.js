'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

import { usePermission } from '@/contexts/PermissionContext'

/**
 * SubaccountPermissionManager Component
 * Manages subaccount-specific permissions for a team member
 * 
 * @param {Object} props
 * @param {number} props.teamMemberId - ID of the team member
 * @param {Array} props.subaccounts - List of available subaccounts
 * @param {function} props.onClose - Callback when modal closes
 */
function SubaccountPermissionManager({
  teamMemberId,
  subaccounts = [],
  onClose,
}) {
  const {
    fetchTeamMemberPermissions,
    fetchAvailablePermissions,
    bulkUpdatePermissions,
  } = usePermission()

  const [selectedSubaccountId, setSelectedSubaccountId] = useState(null)
  const [availablePermissions, setAvailablePermissions] = useState([])
  const [currentPermissions, setCurrentPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [permissionStates, setPermissionStates] = useState({})

  // Group permissions by category
  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    const category = perm.category || 'other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(perm)
    return acc
  }, {})

  useEffect(() => {
    if (selectedSubaccountId) {
      loadPermissions()
    }
  }, [teamMemberId, selectedSubaccountId])

  useEffect(() => {
    // Load available permissions on mount
    loadAvailablePermissions()
  }, [])

  const loadAvailablePermissions = async () => {
    try {
      const available = await fetchAvailablePermissions('subaccount')
      setAvailablePermissions(available)
    } catch (error) {
      console.error('Error loading available permissions:', error)
    }
  }

  const loadPermissions = async () => {
    try {
      setLoading(true)

      // Fetch current permissions for the team member and selected subaccount
      const current = await fetchTeamMemberPermissions(
        teamMemberId,
        selectedSubaccountId
      )

      // Create a map of current permissions
      const permissionMap = {}
      current.forEach((perm) => {
        permissionMap[perm.permissionKey] = perm.granted
      })

      // Initialize permission states
      const states = {}
      availablePermissions.forEach((perm) => {
        states[perm.key] = permissionMap[perm.key] || false
      })

      setPermissionStates(states)
      setCurrentPermissions(current)
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionKey) => {
    setPermissionStates((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }))
  }

  const handleSave = async () => {
    if (!selectedSubaccountId) {
      alert('Please select a subaccount first')
      return
    }

    try {
      setSaving(true)

      // Convert permission states to bulk update format
      const permissions = Object.entries(permissionStates).map(
        ([permissionKey, granted]) => ({
          permissionKey,
          granted,
        })
      )

      await bulkUpdatePermissions(
        teamMemberId,
        permissions,
        selectedSubaccountId
      )

      // Reload permissions to reflect changes
      await loadPermissions()

      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
      alert('Failed to save permissions. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Manage Subaccount Permissions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Control what this team member can do on specific subaccounts
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Subaccount</InputLabel>
          <Select
            value={selectedSubaccountId || ''}
            onChange={(e) => setSelectedSubaccountId(e.target.value)}
            label="Select Subaccount"
          >
            {subaccounts.map((subaccount) => (
              <MenuItem key={subaccount.id} value={subaccount.id}>
                {subaccount.name || subaccount.email || `Subaccount ${subaccount.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        {!selectedSubaccountId ? (
          <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
            Please select a subaccount to manage permissions
          </Typography>
        ) : loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize' }}>
                  {category.replace(/_/g, ' ')}
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {perms.map((perm) => (
                    <FormControlLabel
                      key={perm.key}
                      control={
                        <Checkbox
                          checked={permissionStates[perm.key] || false}
                          onChange={() => handlePermissionToggle(perm.key)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1">{perm.name}</Typography>
                          {perm.description && (
                            <Typography variant="body2" color="text.secondary">
                              {perm.description}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ mb: 1, display: 'block' }}
                    />
                  ))}
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}

            <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : null}
              >
                {saving ? 'Saving...' : 'Save Permissions'}
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default SubaccountPermissionManager
