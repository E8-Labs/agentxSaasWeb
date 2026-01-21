'use client'

import {
  Button,
  CircularProgress,
} from '@mui/material'
import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'

import { usePermission } from '@/contexts/PermissionContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { TypographyH3 } from '@/lib/typography'
import { cn } from '@/lib/utils'
import { AuthToken } from '@/utilities/auth'

/**
 * PermissionManager Component
 * Manages permissions for a team member
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Callback when modal closes
 * @param {number|null} props.teamMemberId - ID of the team member (null for invitation mode)
 * @param {string} props.context - Context for permissions ("agency" or "subaccount")
 * @param {number|null} props.contextUserId - Context user ID for subaccount permissions
 * @param {function} props.onPermissionsChange - Optional callback for invitation mode to return selected permissions
 * @param {Array} props.initialPermissions - Optional initial permissions for invitation mode
 * @param {Array} props.allowedSubaccountIds - Optional initial subaccount IDs for invitation mode
 * @param {function} props.onSubaccountsChange - Optional callback for invitation mode to return selected subaccounts
 */
function PermissionManager({
  open,
  onClose,
  teamMemberId,
  context = 'agency',
  contextUserId = null,
  onPermissionsChange = null,
  initialPermissions = null,
  allowedSubaccountIds = null,
  onSubaccountsChange = null,
}) {
  const isInvitationMode = !teamMemberId
  const {
    fetchTeamMemberPermissions,
    fetchAvailablePermissions,
    bulkUpdatePermissions,
  } = usePermission()

  const [availablePermissions, setAvailablePermissions] = useState([])
  const [currentPermissions, setCurrentPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [permissionStates, setPermissionStates] = useState({})
  
  // Subaccount selection state (for Agency context)
  const [selectedSubaccountIds, setSelectedSubaccountIds] = useState([])
  const [subaccounts, setSubaccounts] = useState([])
  const [subaccountsLoading, setSubaccountsLoading] = useState(false)
  const [subaccountSearchTerm, setSubaccountSearchTerm] = useState('')
  const [subaccountsOffset, setSubaccountsOffset] = useState(0)
  const [hasMoreSubaccounts, setHasMoreSubaccounts] = useState(true)
  const subaccountsLoadingRef = useRef(false)

  // Group permissions by context and category
  const groupedPermissions = React.useMemo(() => {
    const result = availablePermissions.reduce((acc, perm) => {
      const permContext = perm.context || perm.permissionDefinition?.context
      const category = perm.category || perm.permissionDefinition?.category || 'other'
      const permKey = String(perm.key || perm.permissionKey || '')
      
      let groupKey = category
      let displayName = category.replace(/_/g, ' ')
      
      if (context === 'agency') {
        const isSubaccountPermission = permContext === 'subaccount' || permKey.startsWith('subaccount.')
        
        if (isSubaccountPermission) {
          groupKey = `subaccount_actions`
          displayName = 'Subaccount Actions'
        } else {
          groupKey = `agency_${category}`
          displayName = category.replace(/_/g, ' ')
        }
      } else if (context === 'agentx') {
        groupKey = `agentx_${category}`
        displayName = category.replace(/_/g, ' ').replace('agentx ', '')
      } else if (context === 'subaccount_user') {
        groupKey = `subaccount_user_${category}`
        displayName = category.replace(/_/g, ' ').replace('subaccount user ', '')
      }
      
      if (!acc[groupKey]) {
        acc[groupKey] = {
          displayName: displayName,
          permissions: []
        }
      }
      
      if (perm && (perm.key || perm.permissionKey)) {
        acc[groupKey].permissions.push(perm)
      }
      
      return acc
    }, {})
    
    return result
  }, [availablePermissions, context])

  // Get selected permissions for capsule display
  const selectedPermissions = React.useMemo(() => {
    return Object.entries(permissionStates)
      .filter(([_, granted]) => granted)
      .map(([permissionKey]) => {
        const perm = availablePermissions.find(
          p => (p.key || p.permissionKey) === permissionKey
        )
        return {
          key: permissionKey,
          name: perm?.name || perm?.permissionDefinition?.name || permissionKey,
        }
      })
  }, [permissionStates, availablePermissions])

  // Check if subaccount permissions are selected
  const hasSubaccountPermissions = React.useMemo(() => {
    return selectedPermissions.some(perm => 
      perm.key.startsWith('subaccount.') || 
      availablePermissions.find(p => (p.key || p.permissionKey) === perm.key)?.context === 'subaccount'
    )
  }, [selectedPermissions, availablePermissions])

  useEffect(() => {
    if (open) {
      if (teamMemberId) {
        loadPermissions()
      } else if (isInvitationMode) {
        loadAvailablePermissionsOnly()
      }
      
      // Initialize subaccount IDs if provided
      if (allowedSubaccountIds && Array.isArray(allowedSubaccountIds)) {
        setSelectedSubaccountIds(allowedSubaccountIds)
      } else {
        setSelectedSubaccountIds([])
      }
    }
  }, [open, teamMemberId, context, contextUserId, isInvitationMode])

  // Load subaccounts when Agency context and subaccount permissions are selected
  useEffect(() => {
    if (open && context === 'agency' && isInvitationMode && hasSubaccountPermissions) {
      loadSubaccounts(0, subaccountSearchTerm)
    }
  }, [open, context, isInvitationMode, hasSubaccountPermissions])

  const loadAvailablePermissionsOnly = async () => {
    try {
      setLoading(true)

      let apiContext = null
      if (context === 'agency') {
        apiContext = 'agency'
      } else if (context === 'subaccount') {
        apiContext = 'subaccount'
      } else if (context === 'agentx') {
        apiContext = 'agentx'
      } else if (context === 'subaccount_user') {
        apiContext = 'subaccount_user'
      }

      let available = await fetchAvailablePermissions(apiContext)

      if (context === 'agency') {
        const subaccountAvailable = await fetchAvailablePermissions('subaccount')
        available = [...available, ...subaccountAvailable]
      }

      setAvailablePermissions(available)

      if (initialPermissions && Array.isArray(initialPermissions)) {
        const states = {}
        for (const perm of initialPermissions) {
          if (perm.permissionKey) {
            states[perm.permissionKey] = perm.granted || false
          }
        }
        setPermissionStates(states)
      } else {
        const states = {}
        for (const perm of available) {
          const permKey = perm.key || perm.permissionKey
          if (permKey) {
            states[permKey] = false
          }
        }
        setPermissionStates(states)
      }
    } catch (error) {
      console.error('Error loading available permissions:', error)
      setAvailablePermissions([])
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    try {
      setLoading(true)

      let apiContext = null
      if (context === 'agency') {
        apiContext = 'agency'
      } else if (context === 'subaccount') {
        apiContext = 'subaccount'
      } else if (context === 'agentx') {
        apiContext = 'agentx'
      } else if (context === 'subaccount_user') {
        apiContext = 'subaccount_user'
      }

      let available = await fetchAvailablePermissions(apiContext)
      
      if (context === 'agency') {
        const subaccountPermissions = await fetchAvailablePermissions('subaccount')
        if (subaccountPermissions && subaccountPermissions.length > 0) {
          available = [...(available || []), ...subaccountPermissions]
        }
      }
      
      if (available && available.length > 0) {
        setAvailablePermissions(available)
      } else {
        setAvailablePermissions([])
      }

      const current = await fetchTeamMemberPermissions(teamMemberId, null)
      
      const permissionMap = {}
      if (current && Array.isArray(current)) {
        current.forEach((perm) => {
          const key = perm.permissionKey || perm.permissionDefinition?.key || perm.key
          const granted = perm.granted !== undefined ? perm.granted : true
          if (key) {
            permissionMap[key] = granted
          }
        })
      }

      const states = {}
      if (available && Array.isArray(available)) {
        available.forEach((perm) => {
          const key = perm.key || perm.permissionKey
          if (key) {
            states[key] = permissionMap[key] || false
          }
        })
      }

      setPermissionStates(states)
      setCurrentPermissions(current || [])
    } catch (error) {
      console.error('Error loading permissions:', error)
      setAvailablePermissions([])
      setCurrentPermissions([])
    } finally {
      setLoading(false)
    }
  }

  const loadSubaccounts = async (offset = 0, search = '') => {
    if (subaccountsLoadingRef.current) return
    
    try {
      subaccountsLoadingRef.current = true
      setSubaccountsLoading(true)

      const queryParams = new URLSearchParams()
      queryParams.append('offset', offset.toString())
      queryParams.append('limit', '50')
      if (search && search.trim()) {
        queryParams.append('search', search.trim())
      }

      const token = AuthToken()
      const response = await axios.get(`/api/agency/subaccounts?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response && response.data && response.data.status) {
        const newSubaccounts = response.data.data?.subaccounts || []
        const pagination = response.data.pagination || {}
        
        if (offset === 0) {
          setSubaccounts(newSubaccounts)
        } else {
          setSubaccounts(prev => [...prev, ...newSubaccounts])
        }
        
        setSubaccountsOffset(offset + newSubaccounts.length)
        setHasMoreSubaccounts(newSubaccounts.length === 50 && (offset + newSubaccounts.length) < (pagination.total || 0))
      }
    } catch (error) {
      console.error('Error loading subaccounts:', error)
    } finally {
      setSubaccountsLoading(false)
      subaccountsLoadingRef.current = false
    }
  }

  const handleSubaccountSearch = (value) => {
    setSubaccountSearchTerm(value)
    setSubaccountsOffset(0)
    setHasMoreSubaccounts(true)
    loadSubaccounts(0, value)
  }

  const handleSubaccountToggle = (subaccountId) => {
    setSelectedSubaccountIds(prev => {
      if (prev.includes(subaccountId)) {
        return prev.filter(id => id !== subaccountId)
      } else {
        return [...prev, subaccountId]
      }
    })
  }

  const handlePermissionToggle = (permissionKey) => {
    setPermissionStates((prev) => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const permissions = Object.entries(permissionStates)
        .filter(([_, granted]) => granted)
        .map(([permissionKey, granted]) => {
          const perm = availablePermissions.find(
            p => (p.key || p.permissionKey) === permissionKey
          )
          const permContext = perm?.context || perm?.permissionDefinition?.context
          const permKey = String(permissionKey)
          
          let permContextUserId = null
          if (permContext === 'subaccount' || permKey.startsWith('subaccount.')) {
            permContextUserId = contextUserId
          }

          return {
            permissionKey,
            granted,
            contextUserId: permContextUserId,
          }
        })

      if (isInvitationMode) {
        if (onPermissionsChange) {
          onPermissionsChange(permissions)
        }
        if (onSubaccountsChange && context === 'agency') {
          onSubaccountsChange(selectedSubaccountIds)
        }
        if (onClose) {
          onClose()
        }
      } else {
        const bulkPermissions = permissions.map(p => ({
          permissionKey: p.permissionKey,
          granted: p.granted,
        }))

        await bulkUpdatePermissions(teamMemberId, bulkPermissions, contextUserId)
        await loadPermissions()

        if (onClose) {
          onClose()
        }
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
      alert('Failed to save permissions. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getContextDescription = () => {
    if (isInvitationMode) {
      if (context === 'agency') {
        return 'Set permissions for this team member. They will be applied when the invitation is accepted.'
      } else if (context === 'subaccount') {
        return 'Set permissions for this team member on subaccounts. They will be applied when the invitation is accepted.'
      }
      return 'Set permissions for this team member. They will be applied when the invitation is accepted.'
    }
    if (context === 'agency') {
      return 'Control what this team member can access in the agency dashboard and what actions they can perform on subaccounts'
    } else if (context === 'subaccount') {
      return 'Control what this team member can do on subaccounts'
    }
    return 'Control what this team member can access'
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="max-w-2xl w-[95%] sm:w-[90%] max-h-[85vh] p-0 flex flex-col"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          onClose()
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault()
        }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle asChild>
            <TypographyH3>{isInvitationMode ? 'Set Permissions' : 'Manage Permissions'}</TypographyH3>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {getContextDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 py-4">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <CircularProgress size={32} />
                </div>
              ) : Object.keys(groupedPermissions).length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-muted-foreground mb-2">
                    No permissions found for this context.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Context: {context} | Available permissions: {availablePermissions.length}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Permission Capsules/Tags */}
                  {selectedPermissions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Selected Permissions</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPermissions.map((perm) => (
                          <span
                            key={perm.key}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                              color: 'hsl(var(--brand-primary))',
                              border: '1px solid hsl(var(--brand-primary) / 0.3)',
                            }}
                          >
                            {perm.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Permissions List - Single Column */}
                  {Object.entries(groupedPermissions).map(([category, group]) => {
                    const permissions = Array.isArray(group?.permissions) ? group.permissions : []
                    
                    return (
                      <div 
                        key={category} 
                        className="space-y-3"
                        data-category={category}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground capitalize">
                            {group.displayName}
                          </h3>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {permissions.length}
                          </span>
                        </div>
                        
                        {permissions.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                            No permissions in this category
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {permissions.map((perm) => {
                              const permKey = perm.key || perm.permissionKey
                              const permName = perm.name || perm.permissionDefinition?.name || permKey
                              const permDescription = perm.description || perm.permissionDefinition?.description
                              const isChecked = permissionStates[permKey] || false
                              
                              return (
                                <div
                                  key={permKey}
                                  data-permission={permKey}
                                  data-category={category}
                                  className={cn(
                                    "relative flex items-center justify-between gap-4 p-3 rounded-lg border transition-all",
                                    isChecked
                                      ? "bg-brand-primary/5 border-brand-primary/50"
                                      : "border-border bg-card"
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-foreground">
                                        {permName}
                                      </p>
                                    </div>
                                    {permDescription && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                        {permDescription}
                                      </p>
                                    )}
                                  </div>
                                  <Switch
                                    checked={isChecked}
                                    onCheckedChange={() => handlePermissionToggle(permKey)}
                                    className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                  />
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Subaccount Selection for Agency Context */}
                  {context === 'agency' && isInvitationMode && hasSubaccountPermissions && (
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          Manage subaccounts this user can have access to
                        </h3>
                      </div>
                      
                      {/* Search Input */}
                      <Input
                        placeholder="Search subaccounts..."
                        value={subaccountSearchTerm}
                        onChange={(e) => handleSubaccountSearch(e.target.value)}
                        className="w-full"
                      />

                      {/* Subaccounts List */}
                      <div className="max-h-[300px] overflow-y-auto border rounded-lg p-2 space-y-2">
                        {subaccountsLoading && subaccounts.length === 0 ? (
                          <div className="flex justify-center items-center py-8">
                            <CircularProgress size={24} />
                          </div>
                        ) : subaccounts.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-8 text-center">
                            No subaccounts found
                          </div>
                        ) : (
                          <>
                            {subaccounts.map((subaccount) => {
                              const isSelected = selectedSubaccountIds.includes(subaccount.id)
                              return (
                                <div
                                  key={subaccount.id}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer"
                                  onClick={() => handleSubaccountToggle(subaccount.id)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => handleSubaccountToggle(subaccount.id)}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                      {subaccount.name || subaccount.email || `Subaccount ${subaccount.id}`}
                                    </p>
                                    {subaccount.email && (
                                      <p className="text-xs text-muted-foreground">
                                        {subaccount.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                            
                            {/* Load More Button */}
                            {hasMoreSubaccounts && (
                              <div className="flex justify-center pt-2">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => loadSubaccounts(subaccountsOffset, subaccountSearchTerm)}
                                  disabled={subaccountsLoading}
                                  sx={{
                                    textTransform: 'none',
                                    borderColor: 'hsl(var(--brand-primary))',
                                    color: 'hsl(var(--brand-primary))',
                                    '&:hover': {
                                      borderColor: 'hsl(var(--brand-primary))',
                                      bgcolor: 'hsl(var(--brand-primary) / 0.04)',
                                    },
                                  }}
                                >
                                  {subaccountsLoading ? 'Loading...' : 'Load More'}
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0 bg-background">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={saving}
            className="text-sm"
            sx={{
              textTransform: 'none',
              px: 3,
              py: 1,
              borderColor: 'hsl(var(--brand-primary))',
              color: 'hsl(var(--brand-primary))',
              '&:hover': {
                borderColor: 'hsl(var(--brand-primary))',
                bgcolor: 'hsl(var(--brand-primary) / 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || Object.keys(permissionStates).length === 0}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            className="text-sm"
            sx={{
              textTransform: 'none',
              px: 3,
              py: 1,
              bgcolor: 'hsl(var(--brand-primary))',
              '&:hover': {
                bgcolor: 'hsl(var(--brand-primary) / 0.9)',
              },
              '&:disabled': {
                bgcolor: '#9ca3af',
              },
            }}
          >
            {saving ? (isInvitationMode ? 'Applying...' : 'Saving...') : (isInvitationMode ? 'Apply Permissions' : 'Save Permissions')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PermissionManager
