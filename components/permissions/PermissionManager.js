'use client'

import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
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

/**
 * PermissionManager Component
 * Manages permissions for a team member
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {function} props.onClose - Callback when modal closes
 * @param {number} props.teamMemberId - ID of the team member
 * @param {string} props.context - Context for permissions ("agency" or "subaccount")
 * @param {number|null} props.contextUserId - Context user ID for subaccount permissions
 */
function PermissionManager({
  open,
  onClose,
  teamMemberId,
  context = 'agency',
  contextUserId = null,
}) {
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
  // For agency context, separate agency and subaccount permissions
  const groupedPermissions = React.useMemo(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:55',message:'useMemo recalculating',data:{availablePermissionsCount:availablePermissions.length,context},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const result = availablePermissions.reduce((acc, perm) => {
      // Determine the permission context
      const permContext = perm.context || perm.permissionDefinition?.context
      const category = perm.category || perm.permissionDefinition?.category || 'other'
      const permKey = String(perm.key || perm.permissionKey || '')
      
      // For agency context, create separate groups for agency and subaccount permissions
      let groupKey = category
      let displayName = category.replace(/_/g, ' ')
      
      if (context === 'agency') {
        // Check if this is a subaccount permission
        // Check by key prefix first (most reliable), then by context
        const isSubaccountPermission = permKey.startsWith('subaccount.') || permContext === 'subaccount'
        
        console.log('Permission grouping check:', {
          permKey,
          permContext,
          category,
          isSubaccountPermission
        })
        
        if (isSubaccountPermission) {
          // For subaccount permissions, use a unified "Subaccount Actions" group
          groupKey = `subaccount_actions`
          displayName = 'Subaccount Actions'
        } else {
          // For agency permissions, prefix with agency
          groupKey = `agency_${category}`
          displayName = category.replace(/_/g, ' ')
        }
      }
      
      if (!acc[groupKey]) {
        acc[groupKey] = {
          displayName: displayName,
          permissions: []
        }
      }
      // Ensure we're pushing the actual permission object
      if (perm && (perm.key || perm.permissionKey)) {
        acc[groupKey].permissions.push(perm)
        // #region agent log
        if (groupKey === 'subaccount_actions') {
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:97',message:'Adding subaccount permission to group',data:{permKey:perm.key||perm.permissionKey,groupKey,currentCount:acc[groupKey].permissions.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
      } else {
        console.warn('Skipping invalid permission object:', perm)
      }
      return acc
    }, {})
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:103',message:'useMemo result',data:{groupKeys:Object.keys(result),subaccountActionsExists:!!result.subaccount_actions,subaccountActionsCount:result.subaccount_actions?.permissions?.length||0,subaccountActionsIsArray:Array.isArray(result.subaccount_actions?.permissions)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return result
  }, [availablePermissions, context])
  
  console.log('Grouped permissions:', Object.keys(groupedPermissions).length, 'categories,', availablePermissions.length, 'total permissions')
  console.log('Grouped permissions details:', Object.entries(groupedPermissions).map(([key, group]) => ({
    key,
    displayName: group.displayName,
    count: group.permissions?.length || 0,
    isArray: Array.isArray(group.permissions),
    sampleKeys: group.permissions?.slice(0, 3).map(p => p.key || p.permissionKey) || []
  })))
  
  // Detailed log for subaccount_actions specifically
  if (groupedPermissions.subaccount_actions) {
    console.log('subaccount_actions group details:', {
      displayName: groupedPermissions.subaccount_actions.displayName,
      permissions: groupedPermissions.subaccount_actions.permissions,
      permissionsLength: groupedPermissions.subaccount_actions.permissions?.length,
      isArray: Array.isArray(groupedPermissions.subaccount_actions.permissions)
    })
  }

  useEffect(() => {
    if (teamMemberId) {
      loadPermissions()
    }
  }, [teamMemberId, context, contextUserId])

  // #region agent log - Check DOM after render
  useEffect(() => {
    if (open && !loading && Object.keys(groupedPermissions).length > 0) {
      setTimeout(() => {
        const debugEl = document.querySelector('[data-testid="subaccount-debug"]');
        const subaccountGroup = document.querySelector('[data-category="subaccount_actions"]');
        const subaccountPermissions = document.querySelectorAll('[data-category="subaccount_actions"] [data-permission]');
        const firstPerm = subaccountPermissions[0];
        const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]') || document.querySelector('.overflow-hidden');
        const scrollAreaViewport = document.querySelector('[data-radix-scroll-area-viewport]');
        
        const debugData = {
          hasDebugEl: !!debugEl,
          hasSubaccountGroup: !!subaccountGroup,
          subaccountPermissionsCount: subaccountPermissions.length,
          groupedPermissionsKeys: Object.keys(groupedPermissions),
          subaccountActionsExists: !!groupedPermissions.subaccount_actions,
          subaccountActionsCount: groupedPermissions.subaccount_actions?.permissions?.length || 0,
        };
        
        if (firstPerm) {
          const rect = firstPerm.getBoundingClientRect();
          const styles = window.getComputedStyle(firstPerm);
          debugData.firstPermVisible = rect.width > 0 && rect.height > 0;
          debugData.firstPermDisplay = styles.display;
          debugData.firstPermVisibility = styles.visibility;
          debugData.firstPermOpacity = styles.opacity;
          debugData.firstPermRect = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
        }
        
        if (subaccountGroup) {
          const groupRect = subaccountGroup.getBoundingClientRect();
          const groupStyles = window.getComputedStyle(subaccountGroup);
          debugData.groupVisible = groupRect.width > 0 && groupRect.height > 0;
          debugData.groupDisplay = groupStyles.display;
          debugData.groupVisibility = groupStyles.visibility;
          debugData.groupRect = { top: groupRect.top, left: groupRect.left, width: groupRect.width, height: groupRect.height };
        }
        
        if (scrollAreaViewport) {
          const viewportRect = scrollAreaViewport.getBoundingClientRect();
          debugData.scrollAreaViewportRect = { top: viewportRect.top, left: viewportRect.left, width: viewportRect.width, height: viewportRect.height };
          debugData.scrollAreaViewportScrollHeight = scrollAreaViewport.scrollHeight;
          debugData.scrollAreaViewportClientHeight = scrollAreaViewport.clientHeight;
        }
        
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:143',message:'DOM check after render with styles',data:debugData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      }, 200);
    }
  }, [open, loading, groupedPermissions])
  // #endregion

  const loadPermissions = async () => {
    try {
      setLoading(true)

      // For agency context, fetch both agency and subaccount permissions
      // For other contexts, fetch only the relevant permissions
      let apiContext = null
      if (context === 'agency') {
        apiContext = 'agency'
      } else if (context === 'subaccount') {
        apiContext = 'subaccount'
      }
      // For 'agentx' context, apiContext remains null

      // Fetch available permissions for the context
      let available = await fetchAvailablePermissions(apiContext)
      console.log('Available permissions fetched (with context):', available.length, available)
      
      // If context is 'agency', also fetch subaccount permissions
      if (context === 'agency') {
        const subaccountPermissions = await fetchAvailablePermissions('subaccount')
        console.log('Subaccount permissions fetched:', subaccountPermissions.length, subaccountPermissions)
        
        // Combine agency and subaccount permissions
        if (subaccountPermissions && subaccountPermissions.length > 0) {
          available = [...(available || []), ...subaccountPermissions]
          console.log('Combined permissions (agency + subaccount):', available.length, 'total')
          console.log('Subaccount permission keys:', subaccountPermissions.map(p => p.key || p.permissionKey || 'unknown'))
        }
      }
      
      // If no permissions found with context, try without context filter
      if ((!available || available.length === 0) && apiContext) {
        console.log('Trying to fetch permissions without context filter...')
        available = await fetchAvailablePermissions(null)
        console.log('Available permissions fetched (without context):', available.length, available)
        
        // Filter by context manually if needed
        if (available && available.length > 0 && apiContext) {
          available = available.filter(perm => {
            const permContext = perm.context || perm.permissionDefinition?.context
            return permContext === apiContext || permContext === null
          })
          console.log('Filtered permissions by context:', available.length, available)
        }
      }
      
      if (available && available.length > 0) {
        console.log('Setting availablePermissions with', available.length, 'permissions')
        console.log('Permission keys in availablePermissions:', available.map(p => p.key || p.permissionKey || 'unknown').slice(0, 10))
        setAvailablePermissions(available)
      } else {
        console.warn('No available permissions returned from API. Context:', apiContext)
        setAvailablePermissions([])
      }

      // Fetch current permissions for the team member
      // For agency context, we need to fetch permissions without contextUserId (agency-level)
      // and also check if there are any subaccount permissions
      const current = await fetchTeamMemberPermissions(teamMemberId, null)
      console.log('Current permissions fetched:', current.length, current)
      
      // Create a map of current permissions
      const permissionMap = {}
      if (current && Array.isArray(current)) {
        current.forEach((perm) => {
          // Handle both direct permission objects and objects with permissionDefinition
          const key = perm.permissionKey || perm.permissionDefinition?.key || perm.key
          const granted = perm.granted !== undefined ? perm.granted : true
          if (key) {
            permissionMap[key] = granted
          }
        })
      }

      // Initialize permission states
      const states = {}
      if (available && Array.isArray(available)) {
        available.forEach((perm) => {
          const key = perm.key || perm.permissionKey
          if (key) {
            states[key] = permissionMap[key] || false
          }
        })
      }

      console.log('Permission states initialized:', Object.keys(states).length, states)
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

      // Convert permission states to bulk update format
      const permissions = Object.entries(permissionStates).map(
        ([permissionKey, granted]) => ({
          permissionKey,
          granted,
        })
      )

      await bulkUpdatePermissions(teamMemberId, permissions, contextUserId)

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

  const getContextDescription = () => {
    if (context === 'agency') {
      return 'Control what this team member can access in the agency dashboard and what actions they can perform on subaccounts'
    } else if (context === 'subaccount') {
      return 'Control what this team member can do on subaccounts'
    }
    return 'Control what this team member can access'
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="max-w-3xl w-[90%] sm:w-[85%] lg:w-[70%] max-h-[90vh] p-0 flex flex-col"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={() => onClose()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle asChild>
            <TypographyH3>Manage Permissions</TypographyH3>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {getContextDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <ScrollArea className="h-full px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress size={32} />
            </div>
          ) : Object.keys(groupedPermissions).length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-2">
                No permissions found for this context.
              </p>
              <p className="text-xs text-muted-foreground">
                Context: {context} | Available permissions: {availablePermissions.length}
              </p>
            </div>
          ) : (
            <div className="space-y-6" key={`permissions-${availablePermissions.length}-${Object.keys(groupedPermissions).length}`}>
              {Object.entries(groupedPermissions).map(([category, group]) => {
                // #region agent log
                if (category === 'subaccount_actions') {
                  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:318',message:'Before map - Object.entries',data:{category,entriesCount:Object.keys(groupedPermissions).length,hasSubaccountActions:Object.keys(groupedPermissions).includes('subaccount_actions')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                }
                // #endregion
                  // Safety check: ensure permissions is an array
                  const permissions = Array.isArray(group?.permissions) ? group.permissions : []
                  
                  // #region agent log
                  if (category === 'subaccount_actions' || category.includes('subaccount')) {
                    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:325',message:'Rendering subaccount group',data:{category,displayName:group?.displayName,groupType:typeof group,groupKeys:group?Object.keys(group):'null',permissionsCount:permissions.length,groupPermissionsCount:group?.permissions?.length,permissionsIsArray:Array.isArray(group?.permissions),groupPermissionsIsArray:Array.isArray(group?.permissions),hasDisplayName:!!group?.displayName,hasPermissions:!!group?.permissions},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                  }
                  // #endregion
                
                // #region agent log
                if (category === 'subaccount_actions') {
                  const mappedPermissions = permissions.map((p, i) => ({
                    index: i,
                    key: p.key || p.permissionKey,
                    hasKey: !!(p.key || p.permissionKey)
                  }));
                  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:333',message:'About to return JSX for subaccount group',data:{category,permissionsCount:permissions.length,mappedCount:mappedPermissions.length,mappedKeys:mappedPermissions.map(p=>p.key)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                }
                // #endregion
                
                return (
                <div key={category} className="space-y-2" data-category={category}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 capitalize">
                    {group.displayName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* #region agent log */}
                    {category === 'subaccount_actions' && (() => {
                      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:338',message:'Before permissions conditional',data:{category,permissionsLength:permissions.length,permissionsIsArray:Array.isArray(permissions),willShowEmpty:permissions.length===0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                      return null;
                    })()}
                    {/* #endregion */}
                    {permissions.length === 0 ? (
                      <div className="col-span-2 text-sm text-muted-foreground py-4 text-center">
                        No permissions in this category
                      </div>
                    ) : (
                      permissions.map((perm, index) => {
                        const permKey = perm.key || perm.permissionKey
                        const permName = perm.name || perm.permissionDefinition?.name || permKey
                        const permDescription = perm.description || perm.permissionDefinition?.description
                        
                        // #region agent log
                        if (category === 'subaccount_actions' && index < 3) {
                          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:350',message:'Mapping subaccount permission',data:{category,index,permKey,hasPermKey:!!permKey,permType:typeof perm,permKeys:perm?Object.keys(perm):'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                        }
                        // #endregion
                        
                        // #region agent log
                        if (category === 'subaccount_actions' && index < 3) {
                          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PermissionManager.js:361',message:'About to return JSX for permission',data:{category,index,permKey,willReturnJSX:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                        }
                        // #endregion
                        
                        return (
                          <div
                            key={permKey}
                            data-permission={permKey}
                            data-category={category}
                            className={`
                              relative flex items-start gap-3 p-3 rounded-lg border transition-all
                              ${permissionStates[permKey] 
                                ? 'bg-primary/5' 
                                : 'border-border bg-background hover:bg-accent/50'
                              }
                              cursor-pointer group
                            `}
                            style={permissionStates[permKey] ? {
                              borderColor: 'hsl(var(--brand-primary))',
                              backgroundColor: 'hsl(var(--brand-primary) / 0.05)',
                            } : {}}
                            onClick={() => handlePermissionToggle(permKey)}
                          >
                            <Checkbox
                              checked={permissionStates[permKey] || false}
                              onChange={() => handlePermissionToggle(permKey)}
                              onClick={(e) => e.stopPropagation()}
                              className="mt-0.5"
                              size="small"
                              sx={{
                                color: 'hsl(var(--brand-primary))',
                                '&.Mui-checked': {
                                  color: 'hsl(var(--brand-primary))',
                                },
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-foreground leading-tight">
                                  {permName}
                                </p>
                              </div>
                              {permDescription && (
                                <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                                  {permDescription}
                                </p>
                              )}
                              <p className="text-[10px] font-mono text-muted-foreground/70 truncate">
                                {permKey}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                )
              })}
            </div>
          )}
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
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
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PermissionManager
