'use client'

import {
  Button,
  Checkbox,
  CircularProgress,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

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
import { TypographyH3 } from '@/lib/typography'
import { cn } from '@/lib/utils'

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
 */
function PermissionManager({
  open,
  onClose,
  teamMemberId,
  context = 'agency',
  contextUserId = null,
  onPermissionsChange = null,
  initialPermissions = null,
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

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:useEffect-entry',message:'PermissionManager useEffect triggered',data:{open, teamMemberId, isInvitationMode, context},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    if (open) {
      if (teamMemberId) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:useEffect-loadPermissions',message:'Calling loadPermissions',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        loadPermissions()
      } else if (isInvitationMode) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:useEffect-loadAvailable',message:'Calling loadAvailablePermissionsOnly',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        loadAvailablePermissionsOnly()
      }
    }
  }, [open, teamMemberId, context, contextUserId, isInvitationMode])

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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:Dialog-onOpenChange',message:'Dialog onOpenChange called',data:{isOpen},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
        // #endregion
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="max-w-4xl w-[95%] sm:w-[90%] lg:w-[85%] h-[90vh] p-0 flex flex-col"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:DialogContent-onEscapeKeyDown',message:'DialogContent onEscapeKeyDown called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
          // #endregion
          e.preventDefault()
          onClose()
        }}
        onPointerDownOutside={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:DialogContent-onPointerDownOutside',message:'DialogContent onPointerDownOutside called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
          // #endregion
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
                <div className="space-y-8">
                  {Object.entries(groupedPermissions).map(([category, group]) => {
                    const permissions = Array.isArray(group?.permissions) ? group.permissions : []
                    
                    return (
                      <div 
                        key={category} 
                        className="space-y-4"
                        data-category={category}
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground capitalize">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                    "relative flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer group",
                                    "hover:shadow-sm",
                                    isChecked
                                      ? "bg-primary/5 border-primary/50 shadow-sm"
                                      : "border-border bg-card hover:bg-accent/50"
                                  )}
                                  style={isChecked ? {
                                    borderColor: 'hsl(var(--brand-primary))',
                                    backgroundColor: 'hsl(var(--brand-primary) / 0.05)',
                                  } : {}}
                                  onClick={() => handlePermissionToggle(permKey)}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => handlePermissionToggle(permKey)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-0.5 flex-shrink-0"
                                    size="small"
                                    sx={{
                                      color: 'hsl(var(--brand-primary))',
                                      '&.Mui-checked': {
                                        color: 'hsl(var(--brand-primary))',
                                      },
                                    }}
                                  />
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-medium text-foreground leading-snug">
                                        {permName}
                                      </p>
                                    </div>
                                    {permDescription && (
                                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                        {permDescription}
                                      </p>
                                    )}
                                    <p className="text-[10px] font-mono text-muted-foreground/60 truncate mt-1">
                                      {permKey}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
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
