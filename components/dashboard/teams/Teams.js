import 'react-phone-input-2/lib/style.css'

import {
  Button,
  CircularProgress,
  Fab,
  Popover,
  Tooltip,
  colors,
} from '@mui/material'
import { Box, Drawer, Modal } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import axios from 'axios'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import SubAccountPlan from '@/components/agency/subaccount/SubAccountPlan'
import DashboardSlider from '@/components/animations/DashboardSlider'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { copyAgencyOnboardingLink } from '@/components/constants/constants'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import StandardHeader from '@/components/common/StandardHeader'
import PermissionManager from '@/components/permissions/PermissionManager'
import { PermissionProvider, usePermission } from '@/contexts/PermissionContext'
import { TypographyCaption, TypographyH3 } from '@/lib/typography'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import {
  checkPhoneNumber,
  getLocalLocation,
} from '@/components/onboarding/services/apisServices/ApiService'
import AgencyPlans from '@/components/plan/AgencyPlans'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { isPlanActive } from '@/components/userPlans/UserPlanServices'
import UserPlans from '@/components/userPlans/UserPlans'
import { PersistanceKeys } from '@/constants/Constants'
import UpgradeModal from '@/constants/UpgradeModal'
import { useUser } from '@/hooks/redux-hooks'
import { logout } from '@/utilities/UserUtility'
import { formatPhoneNumber } from '@/utilities/agentUtilities'

import MoreTeamMembers from '../MoreTeamMembers'

function TeamsContent({ agencyData, selectedAgency, from }) {
  const permissionContext = usePermission()
  const timerRef = useRef(null)
  const openModalRef = useRef(null)
  const router = useRouter()

  const { user: reduxUser, setUser: setReduxUser } = useUser()
  //stores local data
  const [userLocalData, setUserLocalData] = useState(null)

  const [teamDropdown, setteamDropdown] = useState(null)
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false)
  const [moreDropdown, setMoreDropdown] = useState(null)
  const [openMoreDropdown, setOpenMoreDropdown] = useState(false)
  const [selectedItem, setSelectedItem] = useState("Noah's Team")
  const [openInvitePopup, setOpenInvitePopup] = useState(false)

  // Wrapper to log state changes
  const setOpenInvitePopupWithLog = (value) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:setOpenInvitePopup', message: 'setOpenInvitePopup called', data: { value, previousValue: openInvitePopup, stack: new Error().stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
    // #endregion
    setOpenInvitePopup(value)
  }

  // Track when openInvitePopup changes
  useEffect(() => {
    if (openInvitePopup) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:openInvitePopup-effect', message: 'openInvitePopup state changed to true - Modal should open', data: { value: openInvitePopup, url: window.location.href }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
      // #endregion
    }
  }, [openInvitePopup])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [showError, setShowError] = useState(false)

  const [myTeam, setMyTeam] = useState([])

  const [getTeamLoader, setGetTeamLoader] = useState(false) //allowTeamCollaboration
  const [inviteTeamLoader, setInviteTeamLoader] = useState(false)
  const [reInviteTeamLoader, setReInviteTeamLoader] = useState(false)

  const [emailLoader, setEmailLoader] = useState(false)
  const [emailCheckResponse, setEmailCheckResponse] = useState(null)
  const [validEmail, setValidEmail] = useState('')

  const [showSnak, setShowSnak] = useState(false)
  const [snackTitle, setSnackTitle] = useState('Team Invite Sent.')

  //variables for phone number err messages and checking
  const [errorMessage, setErrorMessage] = useState(null)
  const [checkPhoneLoader, setCheckPhoneLoader] = useState(null)
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null)
  const [countryCode, setCountryCode] = useState('') // Default country

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false)

  const [linkCopied, setLinkCopied] = useState(false)

  //variables for popover
  // instead of storing just item.id, store the element anchor + team data
  const [anchorEl, setAnchorEl] = useState(null)
  const [popoverTeam, setPopoverTeam] = useState(null)

  const open = Boolean(anchorEl)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  //upgrade user plan
  const [upgradePlan, setUpgradePlan] = useState(false)
  const [showUpgradeModalMore, setShowUpgradeModalMore] = useState(false)

  // Permission management for existing team members
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedTeamMemberForPermissions, setSelectedTeamMemberForPermissions] = useState(null)
  const [managePermissionModalStep, setManagePermissionModalStep] = useState('initial')

  // Existing team member permission states
  const [existingAgencyPermissions, setExistingAgencyPermissions] = useState([])
  const [existingAgencyPermissionStates, setExistingAgencyPermissionStates] = useState({})
  const [loadingExistingAgencyPermissions, setLoadingExistingAgencyPermissions] = useState(false)

  const [existingSubaccountPermissions, setExistingSubaccountPermissions] = useState([])
  const [existingSubaccountPermissionStates, setExistingSubaccountPermissionStates] = useState({})
  const [loadingExistingSubaccountPermissions, setLoadingExistingSubaccountPermissions] = useState(false)

  const [existingSubaccountsList, setExistingSubaccountsList] = useState([])
  const [existingSubaccountsListLoading, setExistingSubaccountsListLoading] = useState(false)
  const [existingSubaccountSearchTerm, setExistingSubaccountSearchTerm] = useState('')
  const [existingSelectedSubaccountIds, setExistingSelectedSubaccountIds] = useState([])
  const [existingSelectAllSubaccounts, setExistingSelectAllSubaccounts] = useState(false)
  const [existingSubaccountsListOffset, setExistingSubaccountsListOffset] = useState(0)
  const [hasMoreExistingSubaccountsList, setHasMoreExistingSubaccountsList] = useState(true)
  const [savingPermissions, setSavingPermissions] = useState(false)

  // Permission management for invitations
  const [showInvitationPermissionManager, setShowInvitationPermissionManager] = useState(false)
  const [selectedInvitationPermissions, setSelectedInvitationPermissions] = useState(null)
  const [selectedSubaccountIds, setSelectedSubaccountIds] = useState([])
  const [selectAllSubaccounts, setSelectAllSubaccounts] = useState(false)

  // Modal step state: 'initial', 'agency', 'subaccount'
  const [inviteModalStep, setInviteModalStep] = useState('initial')

  // Agency permissions state
  const [agencyPermissions, setAgencyPermissions] = useState([])
  const [agencyPermissionStates, setAgencyPermissionStates] = useState({})
  const [loadingAgencyPermissions, setLoadingAgencyPermissions] = useState(false)

  // Subaccount permissions state
  const [subaccountPermissions, setSubaccountPermissions] = useState([])
  const [subaccountPermissionStates, setSubaccountPermissionStates] = useState({})
  const [loadingSubaccountPermissions, setLoadingSubaccountPermissions] = useState(false)

  // Subaccount list state (for subaccount selection)
  const [subaccountsList, setSubaccountsList] = useState([])
  const [subaccountsListLoading, setSubaccountsListLoading] = useState(false)
  const [subaccountSearchTerm, setSubaccountSearchTerm] = useState('')
  const [subaccountsListOffset, setSubaccountsListOffset] = useState(0)
  const [hasMoreSubaccountsList, setHasMoreSubaccountsList] = useState(true)

  // Load existing team member permissions (for manage permissions modal)
  const loadExistingAgencyPermissions = async () => {
    if (!permissionContext || !selectedTeamMemberForPermissions) {
      console.error('PermissionContext or team member not available')
      return
    }

    // Check if this is a pending team member (no invitedUserId)
    const isPending = selectedTeamMemberForPermissions.status === 'Pending' || !selectedTeamMemberForPermissions.invitedUserId

    try {
      setLoadingExistingAgencyPermissions(true)
      const available = await permissionContext.fetchAvailablePermissions('agency')
      console.log('Loaded existing agency permissions:', available)
      setExistingAgencyPermissions(available || [])

      let permissionMap = {}

      if (isPending) {
        // For pending members, load from TeamModel.permissions
        const pendingPermissions = selectedTeamMemberForPermissions.permissions || []
        console.log('Loading permissions from pending invitation:', pendingPermissions)
        
        pendingPermissions.forEach((perm) => {
          const key = perm.permissionKey || perm.key
          const granted = perm.granted !== undefined ? perm.granted : true
          // Only agency-level permissions (no contextUserId or contextUserId is null)
          if (key && (perm.contextUserId === null || perm.contextUserId === undefined)) {
            permissionMap[key] = granted
          }
        })
      } else {
        // For accepted members, fetch from TeamPermission table
        if (selectedTeamMemberForPermissions.invitedUserId) {
          const current = await permissionContext.fetchTeamMemberPermissions(
            selectedTeamMemberForPermissions.invitedUserId,
            null
          )

          if (current && Array.isArray(current)) {
            current.forEach((perm) => {
              const key = perm.permissionKey || perm.permissionDefinition?.key || perm.key
              const granted = perm.granted !== undefined ? perm.granted : true
              if (key && !perm.contextUserId) { // Only agency-level permissions (no contextUserId)
                permissionMap[key] = granted
              }
            })
          }
        }
      }

      // Initialize permission states with existing selections
      setExistingAgencyPermissionStates(prevStates => {
        const states = { ...prevStates }
        available?.forEach((perm) => {
          const key = perm.key || perm.permissionKey
          if (key && states[key] === undefined) {
            states[key] = permissionMap[key] || false
          }
        })
        return states
      })
    } catch (error) {
      console.error('Error loading existing agency permissions:', error)
    } finally {
      setLoadingExistingAgencyPermissions(false)
    }
  }

  // Load existing subaccount permissions
  const loadExistingSubaccountPermissions = async () => {
    if (!permissionContext || !selectedTeamMemberForPermissions) {
      console.error('PermissionContext or team member not available')
      return
    }

    // Check if this is a pending team member (no invitedUserId)
    const isPending = selectedTeamMemberForPermissions.status === 'Pending' || !selectedTeamMemberForPermissions.invitedUserId

    try {
      setLoadingExistingSubaccountPermissions(true)
      const available = await permissionContext.fetchAvailablePermissions('subaccount')
      console.log('Loaded existing subaccount permissions:', available)
      setExistingSubaccountPermissions(available || [])

      let permissionMap = {}

      if (isPending) {
        // For pending members, load from TeamModel.permissions
        const pendingPermissions = selectedTeamMemberForPermissions.permissions || []
        console.log('Loading subaccount permissions from pending invitation:', pendingPermissions)
        
        pendingPermissions.forEach((perm) => {
          const key = perm.permissionKey || perm.key
          const granted = perm.granted !== undefined ? perm.granted : true
          // Only subaccount permissions (starts with 'subaccount.' and no contextUserId or contextUserId is null)
          if (key && key.startsWith('subaccount.') && (perm.contextUserId === null || perm.contextUserId === undefined)) {
            permissionMap[key] = granted
          }
        })
      } else {
        // For accepted members, fetch from TeamPermission table
        if (selectedTeamMemberForPermissions.invitedUserId) {
          const current = await permissionContext.fetchTeamMemberPermissions(
            selectedTeamMemberForPermissions.invitedUserId,
            null
          )

          if (current && Array.isArray(current)) {
            current.forEach((perm) => {
              const key = perm.permissionKey || perm.permissionDefinition?.key || perm.key
              const granted = perm.granted !== undefined ? perm.granted : true
              if (key && key.startsWith('subaccount.') && !perm.contextUserId) {
                permissionMap[key] = granted
              }
            })
          }
        }
      }

      // Initialize permission states with existing selections
      setExistingSubaccountPermissionStates(prevStates => {
        const states = { ...prevStates }
        available?.forEach((perm) => {
          const key = perm.key || perm.permissionKey
          if (key && states[key] === undefined) {
            states[key] = permissionMap[key] || false
          }
        })
        return states
      })

      // Load existing allowed subaccounts
      await loadExistingSubaccounts()
    } catch (error) {
      console.error('Error loading existing subaccount permissions:', error)
    } finally {
      setLoadingExistingSubaccountPermissions(false)
    }
  }

  // Load existing allowed subaccounts for team member
  const loadExistingSubaccounts = async () => {
    if (!selectedTeamMemberForPermissions) return

    // Check if this is a pending team member (no invitedUserId)
    const isPending = selectedTeamMemberForPermissions.status === 'Pending' || !selectedTeamMemberForPermissions.invitedUserId

    try {
      setExistingSubaccountsListLoading(true)
      
      if (isPending) {
        // For pending members, load from TeamModel.allowedSubaccountIds and selectAllSubaccounts
        const allowedSubaccountIds = selectedTeamMemberForPermissions.allowedSubaccountIds || []
        const selectAllSubaccounts = selectedTeamMemberForPermissions.selectAllSubaccounts || false
        
        console.log('Loading subaccounts from pending invitation:', {
          allowedSubaccountIds,
          selectAllSubaccounts,
        })
        
        setExistingSelectedSubaccountIds(Array.isArray(allowedSubaccountIds) ? allowedSubaccountIds : [])
        setExistingSelectAllSubaccounts(selectAllSubaccounts)

        // Also load the full subaccounts list for display
        await loadExistingSubaccountsList(0, '')
      } else {
        // For accepted members, fetch from API
        if (selectedTeamMemberForPermissions.invitedUserId) {
          const token = AuthToken()

          // Fetch allowed subaccounts from API
          const response = await axios.get(
            `/api/permissions/team/${selectedTeamMemberForPermissions.invitedUserId}/subaccounts`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          ).catch(async (error) => {
            // If endpoint doesn't exist, return empty array
            console.log('Subaccounts endpoint not available, returning empty array')
            return { data: { status: true, data: [] } }
          })

          if (response?.data?.status && response?.data?.data) {
            const allowedSubaccountIds = Array.isArray(response.data.data)
              ? response.data.data.map(s => s.subaccountId || s.id || s)
              : []
            setExistingSelectedSubaccountIds(allowedSubaccountIds)

            // Read selectAllSubaccounts from response
            if (response?.data?.selectAllSubaccounts !== undefined) {
              setExistingSelectAllSubaccounts(response.data.selectAllSubaccounts)
            }

            // Also load the full subaccounts list for display
            await loadExistingSubaccountsList(0, '')
          }
        }
      }
    } catch (error) {
      console.error('Error loading existing allowed subaccounts:', error)
      // For now, just load the subaccounts list
      await loadExistingSubaccountsList(0, '')
    } finally {
      setExistingSubaccountsListLoading(false)
    }
  }

  // Load subaccounts list for existing permissions modal
  const loadExistingSubaccountsList = async (offset = 0, search = '') => {
    try {
      setExistingSubaccountsListLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append('offset', offset.toString())
      queryParams.append('limit', '50')
      if (search && search.trim()) {
        queryParams.append('search', search.trim())
      }

      const agencyId = selectedAgency?.id || agencyData?.id || userLocalData?.id
      if (agencyId) {
        queryParams.append('userId', agencyId.toString())
      }

      const token = AuthToken()
      const response = await axios.get(`/api/agency/subaccounts?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response && response.data && response.data.status) {
        const newSubaccounts = Array.isArray(response.data.data) ? response.data.data : []
        const pagination = response.data.pagination || {}

        if (offset === 0) {
          setExistingSubaccountsList(newSubaccounts)
        } else {
          setExistingSubaccountsList(prev => [...prev, ...newSubaccounts])
        }

        setExistingSubaccountsListOffset(offset + newSubaccounts.length)
        setHasMoreExistingSubaccountsList(newSubaccounts.length === 50 && (offset + newSubaccounts.length) < (pagination.total || 0))
      } else {
        setExistingSubaccountsList([])
      }
    } catch (error) {
      console.error('Error loading existing subaccounts list:', error)
      setExistingSubaccountsList([])
    } finally {
      setExistingSubaccountsListLoading(false)
    }
  }

  // Handle opening manage permissions modal - load permissions immediately
  useEffect(() => {
    if (showPermissionModal && selectedTeamMemberForPermissions && permissionContext) {
      setManagePermissionModalStep('initial')

      // Load permissions immediately so counts show up
      const loadPermissions = async () => {
        try {
          // Reset states first
          setExistingAgencyPermissionStates({})
          setExistingSubaccountPermissionStates({})
          setExistingSelectedSubaccountIds([])
          setExistingSubaccountsList([])
          setExistingSubaccountSearchTerm('')
          setExistingSubaccountsListOffset(0)

          // Then load permissions (this will update the states)
          await Promise.all([
            loadExistingAgencyPermissions(),
            loadExistingSubaccountPermissions()
          ])
        } catch (error) {
          console.error('Error loading permissions:', error)
        }
      }

      loadPermissions()
    } else if (!showPermissionModal) {
      // Reset states when modal closes
      setExistingAgencyPermissionStates({})
      setExistingSubaccountPermissionStates({})
      setExistingSelectedSubaccountIds([])
      setExistingSubaccountsList([])
      setExistingSubaccountSearchTerm('')
      setExistingSubaccountsListOffset(0)
    }
  }, [showPermissionModal, selectedTeamMemberForPermissions?.id, selectedTeamMemberForPermissions?.invitedUserId])

  // Wrapper to log permission manager state changes
  const setShowInvitationPermissionManagerWithLog = (value) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:setShowInvitationPermissionManager', message: 'setShowInvitationPermissionManager called', data: { value, previousValue: showInvitationPermissionManager, stack: new Error().stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
    // #endregion
    setShowInvitationPermissionManager(value)
  }

  // Track when showInvitationPermissionManager changes
  useEffect(() => {
    if (showInvitationPermissionManager) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:showInvitationPermissionManager-effect', message: 'showInvitationPermissionManager changed to true - PermissionManager should open', data: { value: showInvitationPermissionManager, url: window.location.href }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
      // #endregion
    }
  }, [showInvitationPermissionManager])

  // Load agency permissions
  const loadAgencyPermissions = async () => {
    if (!permissionContext) {
      console.error('PermissionContext not available')
      return
    }
    try {
      setLoadingAgencyPermissions(true)
      const available = await permissionContext.fetchAvailablePermissions('agency')
      console.log('Loaded agency permissions:', available)
      setAgencyPermissions(available || [])

      // Initialize permission states - preserve existing selections
      setAgencyPermissionStates(prevStates => {
        const states = { ...prevStates } // Keep existing state
        available?.forEach((perm) => {
          const key = perm.key || perm.permissionKey
          if (key && states[key] === undefined) {
            // Only set to false if not already in state
            // Check if this permission was already selected in selectedInvitationPermissions
            const wasSelected = selectedInvitationPermissions?.some(
              p => p.permissionKey === key && (!p.contextUserId || p.contextUserId === null)
            )
            states[key] = wasSelected || false
          }
        })
        return states
      })
    } catch (error) {
      console.error('Error loading agency permissions:', error)
    } finally {
      setLoadingAgencyPermissions(false)
    }
  }

  // Load subaccount permissions
  const loadSubaccountPermissions = async () => {
    if (!permissionContext) {
      console.error('PermissionContext not available')
      return
    }
    try {
      setLoadingSubaccountPermissions(true)
      const available = await permissionContext.fetchAvailablePermissions('subaccount')
      console.log('Loaded subaccount permissions:', available)
      setSubaccountPermissions(available || [])

      // Initialize permission states - preserve existing selections
      setSubaccountPermissionStates(prevStates => {
        const states = { ...prevStates } // Keep existing state
        available?.forEach((perm) => {
          const key = perm.key || perm.permissionKey
          if (key && states[key] === undefined) {
            // Only set to false if not already in state
            // Check if this permission was already selected in selectedInvitationPermissions
            const wasSelected = selectedInvitationPermissions?.some(
              p => p.permissionKey === key && (p.contextUserId === null || !p.contextUserId)
            )
            states[key] = wasSelected || false
          }
        })
        return states
      })

      // Always load subaccounts list when entering subaccount view
      loadSubaccountsList(0, '')
    } catch (error) {
      console.error('Error loading subaccount permissions:', error)
    } finally {
      setLoadingSubaccountPermissions(false)
    }
  }

  // Load subaccounts list
  const loadSubaccountsList = async (offset = 0, search = '') => {
    try {
      setSubaccountsListLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append('offset', offset.toString())
      queryParams.append('limit', '50')
      if (search && search.trim()) {
        queryParams.append('search', search.trim())
      }

      // Use agencyData or userLocalData to get the agency ID
      const agencyId = selectedAgency?.id || agencyData?.id || userLocalData?.id
      if (agencyId) {
        queryParams.append('userId', agencyId.toString())
      }

      const token = AuthToken()
      console.log('Loading subaccounts with params:', queryParams.toString())
      const response = await axios.get(`/api/agency/subaccounts?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Subaccounts API response:', response.data)
      if (response && response.data && response.data.status) {
        // Backend returns: { status: true, data: [...subaccounts], pagination: {...} }
        const newSubaccounts = Array.isArray(response.data.data) ? response.data.data : []
        const pagination = response.data.pagination || {}

        console.log('Loaded subaccounts:', newSubaccounts, 'Pagination:', pagination)
        if (offset === 0) {
          setSubaccountsList(newSubaccounts)
        } else {
          setSubaccountsList(prev => [...prev, ...newSubaccounts])
        }

        setSubaccountsListOffset(offset + newSubaccounts.length)
        setHasMoreSubaccountsList(newSubaccounts.length === 50 && (offset + newSubaccounts.length) < (pagination.total || 0))
      } else {
        console.error('Subaccounts API returned error:', response.data)
        setSubaccountsList([])
      }
    } catch (error) {
      console.error('Error loading subaccounts list:', error)
      console.error('Error details:', error.response?.data || error.message)
    } finally {
      setSubaccountsListLoading(false)
    }
  }

  // Handle agency permission toggle
  const handleAgencyPermissionToggle = (permissionKey) => {
    setAgencyPermissionStates(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }))
  }

  // Handle subaccount permission toggle
  const handleSubaccountPermissionToggle = (permissionKey) => {
    setSubaccountPermissionStates(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }))
  }

  // Handle subaccount selection toggle
  const handleSubaccountSelectionToggle = (subaccountId) => {
    setSelectedSubaccountIds(prev => {
      if (prev.includes(subaccountId)) {
        return prev.filter(id => id !== subaccountId)
      } else {
        return [...prev, subaccountId]
      }
    })
  }

  // Collect all permissions when sending invite
  const collectAllPermissions = () => {
    const permissions = []

    // Add agency permissions
    Object.entries(agencyPermissionStates).forEach(([key, granted]) => {
      if (granted) {
        permissions.push({
          permissionKey: key,
          granted: true,
          contextUserId: null,
        })
      }
    })

    // Add subaccount permissions
    Object.entries(subaccountPermissionStates).forEach(([key, granted]) => {
      if (granted) {
        permissions.push({
          permissionKey: key,
          granted: true,
          contextUserId: null, // Will be set per subaccount when accessing
        })
      }
    })

    return permissions
  }

  // Calculate selected permission counts (reactive)
  const agencyPermissionsCount = React.useMemo(() => {
    return Object.values(agencyPermissionStates).filter(Boolean).length
  }, [agencyPermissionStates])

  const subaccountPermissionsCount = React.useMemo(() => {
    return Object.values(subaccountPermissionStates).filter(Boolean).length
  }, [subaccountPermissionStates])

  // Calculate existing permission counts (reactive)
  const existingAgencyPermissionsCount = React.useMemo(() => {
    return Object.values(existingAgencyPermissionStates).filter(Boolean).length
  }, [existingAgencyPermissionStates])

  const existingSubaccountPermissionsCount = React.useMemo(() => {
    return Object.values(existingSubaccountPermissionStates).filter(Boolean).length
  }, [existingSubaccountPermissionStates])

  // Handle existing agency permission toggle
  const handleExistingAgencyPermissionToggle = (permissionKey) => {
    setExistingAgencyPermissionStates(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }))
  }

  // Handle existing subaccount permission toggle
  const handleExistingSubaccountPermissionToggle = (permissionKey) => {
    setExistingSubaccountPermissionStates(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey],
    }))
  }

  // Handle existing subaccount selection toggle
  const handleExistingSubaccountSelectionToggle = (subaccountId) => {
    setExistingSelectedSubaccountIds(prev => {
      if (prev.includes(subaccountId)) {
        return prev.filter(id => id !== subaccountId)
      } else {
        return [...prev, subaccountId]
      }
    })
  }

  // Save existing team member permissions
  const saveExistingPermissions = async () => {
    if (!selectedTeamMemberForPermissions) {
      setSnackTitle('Team member not selected')
      setShowSnak(true)
      return
    }

    // Check if this is a pending team member (no invitedUserId)
    const isPending = selectedTeamMemberForPermissions.status === 'Pending' || !selectedTeamMemberForPermissions.invitedUserId

    try {
      setSavingPermissions(true)
      const token = AuthToken()

      // Collect all permissions
      const permissions = []

      // Add agency permissions
      Object.entries(existingAgencyPermissionStates).forEach(([key, granted]) => {
        if (granted) {
          permissions.push({
            permissionKey: key,
            granted: true,
            contextUserId: null,
          })
        }
      })

      // Add subaccount permissions
      Object.entries(existingSubaccountPermissionStates).forEach(([key, granted]) => {
        if (granted) {
          permissions.push({
            permissionKey: key,
            granted: true,
            contextUserId: null,
          })
        }
      })

      console.log('💾 Saving permissions for pending team member:', {
        isPending,
        permissionsCount: permissions.length,
        permissions: permissions.map(p => p.permissionKey),
        selectAllSubaccounts: isPending ? existingSelectAllSubaccounts : undefined,
        allowedSubaccountIds: isPending ? existingSelectedSubaccountIds : undefined,
      })

      if (isPending) {
        // For pending members, update via inviteTeamMember API (which handles updating existing pending invitations)
        const isAgency = agencyData?.userRole === 'Agency' || userLocalData?.userRole === 'Agency'
        
        const inviteData = {
          name: selectedTeamMemberForPermissions.name,
          email: selectedTeamMemberForPermissions.email,
          phone: selectedTeamMemberForPermissions.phone,
          permissions: permissions, // Always send permissions array (even if empty)
          skipEmail: true, // Don't resend invite email when updating permissions
        }

        // Add subaccount access for agency users
        if (isAgency) {
          inviteData.selectAllSubaccounts = existingSelectAllSubaccounts
          inviteData.allowedSubaccountIds = !existingSelectAllSubaccounts ? existingSelectedSubaccountIds : []
        }

        const response = await axios.post(
          Apis.inviteTeamMember,
          inviteData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response?.data?.status) {
          console.log('✅ Permissions updated successfully:', response?.data)
          setSnackTitle(response?.data?.message || 'Permissions updated successfully')
          setShowSnak(true)
          setManagePermissionModalStep('initial')
          // Refresh team data to get updated permissions
          getMyteam()
        } else {
          console.error('❌ Error updating permissions:', response?.data)
          setSnackTitle(response?.data?.message || 'Error updating permissions')
          setShowSnak(true)
        }
      } else {
        // For accepted members, update via bulk update API
        if (!selectedTeamMemberForPermissions.invitedUserId) {
          setSnackTitle('Team member ID not available')
          setShowSnak(true)
          return
        }

        const response = await axios.put(
          '/api/permissions/bulk',
          {
            teamMemberId: selectedTeamMemberForPermissions.invitedUserId,
            permissions: permissions.map(p => ({ permissionKey: p.permissionKey, granted: p.granted })),
            contextUserId: null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (response?.data?.status) {
          // Update subaccount access if agency context
          const isAgency = agencyData?.userRole === 'Agency' || userLocalData?.userRole === 'Agency'
          if (isAgency && (existingSelectAllSubaccounts || existingSelectedSubaccountIds.length >= 0)) {
            // Update allowed subaccounts
            try {
              const subaccountResponse = await axios.put(
                '/api/permissions/team/subaccounts',
                {
                  teamMemberId: selectedTeamMemberForPermissions.invitedUserId,
                  selectAllSubaccounts: existingSelectAllSubaccounts,
                  subaccountIds: !existingSelectAllSubaccounts ? existingSelectedSubaccountIds : [],
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              )

              if (!subaccountResponse?.data?.status) {
                console.error('Error updating subaccount access:', subaccountResponse?.data?.message)
              }
            } catch (subaccountError) {
              console.error('Error updating subaccount access:', subaccountError)
              // Don't fail the whole operation if subaccount update fails
            }
          }

          setSnackTitle('Permissions updated successfully')
          setShowSnak(true)
          setManagePermissionModalStep('initial')
          // Refresh team data
          getMyteam()
        } else {
          setSnackTitle(response?.data?.message || 'Error updating permissions')
          setShowSnak(true)
        }
      }
    } catch (error) {
      console.error('Error saving permissions:', error)
      setSnackTitle(error?.response?.data?.message || 'Error updating permissions')
      setShowSnak(true)
    } finally {
      setSavingPermissions(false)
    }
  }

  //get local Data
  useEffect(() => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const D = JSON.parse(localData)
      setUserLocalData(D.user)
    }
  }, [])

  let maxTeamMembers =
    userLocalData?.planCapabilities?.maxTeamMembers ||
    userLocalData?.plan?.planCapabilities?.maxTeamMembers ||
    0
  let currentMembers = userLocalData?.currentUsage?.maxTeamMembers || 0

  const data = [
    {
      id: 1,
      name: 'Noah',
      email: 'abc@gmail.com',
    },
    {
      id: 2,
      name: 'Noah',
      email: 'abc@gmail.com',
    },
    {
      id: 3,
      name: 'Noah',
      email: 'abc@gmail.com',
    },
    {
      id: 4,
      name: 'Noah',
      email: 'abc@gmail.com',
    },
    {
      id: 5,
      name: 'Noah',
      email: 'abc@gmail.com',
    },
  ]

  useEffect(() => {
    refreshUserData()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let loc = getLocalLocation()
      setCountryCode(loc)
      getMyteam()
    }
  }, [])

  // Set up ref callback to open modal safely
  useEffect(() => {
    openModalRef.current = () => {
      setOpenInvitePopupWithLog(true)
    }
  }, [])

  // Global form submission prevention for debugging
  useEffect(() => {
    const handleFormSubmit = (e) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:form-submit-listener', message: 'Form submit detected', data: { target: e.target?.tagName, submitter: e.submitter?.tagName, url: window.location.href, defaultPrevented: e.defaultPrevented }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      console.log('🔴 Form submit detected!', {
        target: e.target,
        submitter: e.submitter,
        url: window.location.href
      })
      // Don't prevent by default, just log for debugging
    }

    const handleClick = (e) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:global-click-listener', message: 'Global click detected', data: { target: e.target?.tagName, currentTarget: e.currentTarget?.tagName, hasInviteButton: e.target?.closest('[role="button"]') !== null, defaultPrevented: e.defaultPrevented }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
    }

    const handleBeforeUnload = (e) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:beforeunload', message: 'Page unloading', data: { url: window.location.href }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
      // #endregion
    }

    const handlePopState = (e) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:popstate', message: 'PopState event', data: { url: window.location.href }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
      // #endregion
    }

    // Track navigation attempts
    const originalPush = router.push
    const originalReplace = router.replace
    router.push = function (...args) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:router-push', message: 'Router.push called', data: { url: args[0], stack: new Error().stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion
      console.log('🔴 Router.push called:', args[0], new Error().stack)
      return originalPush.apply(this, args)
    }
    router.replace = function (...args) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:router-replace', message: 'Router.replace called', data: { url: args[0], stack: new Error().stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion
      console.log('🔴 Router.replace called:', args[0], new Error().stack)
      return originalReplace.apply(this, args)
    }

    // Track window.location changes using Object.defineProperty
    try {
      const originalAssign = window.location.assign.bind(window.location)
      const originalReplace = window.location.replace.bind(window.location)
      const originalReload = window.location.reload.bind(window.location)

      Object.defineProperty(window.location, 'assign', {
        value: function (...args) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:location-assign', message: 'window.location.assign called', data: { url: args[0], stack: new Error().stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
          // #endregion
          return originalAssign(...args)
        },
        writable: true,
        configurable: true
      })

      Object.defineProperty(window.location, 'replace', {
        value: function (...args) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:location-replace', message: 'window.location.replace called', data: { url: args[0], stack: new Error().stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
          // #endregion
          return originalReplace(...args)
        },
        writable: true,
        configurable: true
      })

      Object.defineProperty(window.location, 'reload', {
        value: function (...args) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:location-reload', message: 'window.location.reload called', data: { stack: new Error().stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
          // #endregion
          return originalReload(...args)
        },
        writable: true,
        configurable: true
      })
    } catch (e) {
      // If we can't override, just log that we tried
      console.warn('Could not override window.location methods:', e)
    }

    document.addEventListener('submit', handleFormSubmit, true)
    document.addEventListener('click', handleClick, true)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('submit', handleFormSubmit, true)
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      router.push = originalPush
      router.replace = originalReplace
    }
  }, [router])

  //calling function to store and update data on redux
  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }

        setReduxUser(updatedUserData)

        // Update local state as well
        setUserLocalData(updatedUserData)

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [CREATE-AGENT] Error refreshing user data:', error)
      return false
    }
  }

  //functions handling popover
  const handlePopoverOpen = (event, team) => {
    setAnchorEl(event.currentTarget)
    setPopoverTeam(team)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
    setPopoverTeam(null)
  }

  //function to get team mebers api
  const getMyteam = async () => {
    try {
      setGetTeamLoader(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u
        try {
          u = JSON.parse(data)
        } catch (parseError) {
          console.error('Error parsing user data:', parseError)
          setGetTeamLoader(false)
          return
        }

        if (!u || !u.token) {
          console.error('No valid user token found')
          setGetTeamLoader(false)
          return
        }

        let path = Apis.getTeam
        // //console.log
        if (selectedAgency) {
          path = path + `?userId=${selectedAgency.id}`
        }

        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setGetTeamLoader(false)

          if (response.data.status === true) {
            //console.log;
            let admin = response.data.admin
            let adminMember = {
              invitingUser: admin,
              invitedUser: admin,
              id: -1,
              status: 'Admin',
              name: admin.name,
              email: admin.email,
              phone: admin.phone,
            }
            let array = [adminMember, ...response.data.data]
            if (response.data.data.length == 0) {
              array = []
            }
            setMyTeam(array)
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      console.error('Error getting team data:', e)
      setGetTeamLoader(false)
      setSnackTitle('Error loading team data')
      setShowSnak(true)
    }
  }

  //funcion to invitem tem member
  const inviteTeamMember = async (item, permissionsOverride = null, subaccountIdsOverride = null) => {
    // //console.log;
    // return
    if (!isPlanActive(reduxUser?.plan)) {
      setSnackTitle('Your plan is paused. Activate to invite team members')
      setShowSnak(true)
      return
    }
    if (!item.name || !item.email || !item.phone) {
      setShowError(true)
      return
    }
    try {
      const data = localStorage.getItem('User')
      setInviteTeamLoader(true)
      if (data) {
        let u
        try {
          u = JSON.parse(data)
        } catch (parseError) {
          console.error('Error parsing user data:', parseError)
          setInviteTeamLoader(false)
          return
        }

        if (!u || !u.token) {
          console.error('No valid user token found')
          setInviteTeamLoader(false)
          return
        }

        let path = Apis.inviteTeamMember

        // Use override values if provided, otherwise use state
        const permissionsToSend = permissionsOverride !== null ? permissionsOverride : selectedInvitationPermissions
        const subaccountIdsToSend = subaccountIdsOverride !== null ? subaccountIdsOverride : selectedSubaccountIds

        let apidata = {
          name: item.name,
          email: item.email,
          phone: item.phone,
          permissions: permissionsToSend && permissionsToSend.length > 0 ? permissionsToSend : null, // Include permissions if set
          selectAllSubaccounts: selectAllSubaccounts, // If true, grants access to all subaccounts
          allowedSubaccountIds: !selectAllSubaccounts && subaccountIdsToSend && subaccountIdsToSend.length > 0 ? subaccountIdsToSend : undefined, // Include subaccount IDs if not selecting all
        }
        if (selectedAgency) {
          apidata = {
            ...apidata,
            userId: selectedAgency.id,
          }
        }

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setInviteTeamLoader(false)
          if (response.data.status === true) {
            // //console.log;
            let newMember = response.data.data[0]
            // //console.log;
            // //console.log;
            setSelectedInvitationPermissions(null) // Reset permissions after successful invitation
            setSelectedSubaccountIds([]) // Reset subaccount IDs after successful invitation
            setSelectAllSubaccounts(false) // Reset select all after successful invitation
            setMyTeam((prev) => {
              // //console.log;
              // //console.log;
              const isAlreadyPresent = prev.some(
                (member) => member.id === newMember.id,
              ) // Check by unique ID
              // //console.log;
              if (isAlreadyPresent) {
                // //console.log;
                return prev
              }
              return [...prev, newMember]
            })
            setSnackTitle(response.data.message)
            setShowSnak(true)
            setOpenInvitePopup(false)
            setName('')
            setEmail('')
            setPhone('')
            setSelectedInvitationPermissions(null) // Reset permissions after successful invitation
            setSelectedSubaccountIds([]) // Reset subaccount IDs after successful invitation
            // getMyteam()
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      console.error('Error inviting team member:', e)
      setInviteTeamLoader(false)
      setReInviteTeamLoader(false)
      setShowError(true)
    }
  }

  //email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    // Check if email contains consecutive dots, which are invalid
    if (/\.\./.test(email)) {
      return false
    }

    // Check the general pattern for a valid email
    return emailPattern.test(email)
  }

  //check email
  const checkEmail = async (value) => {
    try {
      setValidEmail('')
      setEmailLoader(true)

      const ApiPath = Apis.CheckEmail

      const ApiData = {
        email: value,
      }

      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // //console.log;
          setEmailCheckResponse(response.data)
        } else {
          setEmailCheckResponse(response.data)
        }
      }
    } catch (error) {
      // console.error("Error occured in check email api is :", error);
    } finally {
      setEmailLoader(false)
    }
  }

  //phone input change
  const handlePhoneNumberChange = (phone) => {
    setPhone(phone)
    setErrorMessage(null)
    validatePhoneNumber(phone)
    setCheckPhoneResponse(null)

    if (!phone) {
      setErrorMessage(null)
      setCheckPhoneResponse(null)
    }
  }

  //number validation
  const validatePhoneNumber = async (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`)
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage('Invalid')
    } else {
      setErrorMessage('')

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      try {
        setCheckPhoneLoader('Checking...')
        let response = await checkPhoneNumber(phoneNumber)
        // //console.log;
        // setErrorMessage(null)
        setCheckPhoneResponse(response.data)
        if (response.data.status === false) {
          setErrorMessage('Taken')
        } else if (response.data.status === true) {
          setErrorMessage('Available')
        }
      } catch (error) {
        // console.error("Error occured in api is", error);
        setCheckPhoneLoader(null)
      } finally {
        setCheckPhoneLoader(null)
      }

      // setCheckPhoneResponse(null);
      // //console.log;
    }
  }

  async function DeleteTeamMember(team) {
    // //console.log;
    // return;
    let phoneNumber = team.phone
    let apidata = {
      phone: phoneNumber,
    }

    if (selectedAgency) {
      apidata = {
        ...apidata,
        userId: selectedAgency.id,
      }
    }

    // //console.log;
    // return;

    try {
      const data = localStorage.getItem('User')
      setInviteTeamLoader(true)
      if (data) {
        let u
        try {
          u = JSON.parse(data)
        } catch (parseError) {
          console.error('Error parsing user data:', parseError)
          setInviteTeamLoader(false)
          return
        }

        if (!u || !u.token) {
          console.error('No valid user token found')
          setInviteTeamLoader(false)
          return
        }

        let path = Apis.deleteTeamMember
        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setInviteTeamLoader(false)
          if (response.data.status === true) {
            // Defensive: filter out team member by id, but handle possible null/undefined
            let teams = myTeam.filter((item) => {
              // If either item or team is null/undefined, skip comparison
              if (!item || !team) return true
              // If either id is null/undefined, skip comparison
              if (item.id == null || team.id == null) return true
              return item.id !== team.id
            })
            setMyTeam(teams)
            setSnackTitle('Team member removed')
            setShowSnak(true)
            // Defensive: check nested properties before accessing
            if (
              u &&
              u.user &&
              team &&
              team.invitedUser &&
              typeof u.user.id !== 'undefined' &&
              typeof team.invitedUser.id !== 'undefined' &&
              u.user.id === team.invitedUser.id
            ) {
              //if current user deleted himself from the team then logout
              logout()
              router.push('/')
            }
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      console.error('Error deleting team member:', e)
      setInviteTeamLoader(false)
      setSnackTitle('Error removing team member')
      setShowSnak(true)
    }
  }

  const handleResendInvite = async (item) => {
    // //console.log;

    let data = {
      name: item.name,
      email: item.email,
      phone: item.phone,
    }
    setReInviteTeamLoader(true)
    await inviteTeamMember(data)
    setReInviteTeamLoader(false)
    setOpenMoreDropdown(false)
  }

  function canShowMenuDots(team) {
    //console.log;
    let user = localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (user) {
      try {
        user = JSON.parse(user)
        user = user.user
      } catch (parseError) {
        console.error('Error parsing user data:', parseError)
        return false
      }
    }
    // //console.log;
    // //console.log;
    if (user?.userRole == 'Invitee') {
      if (team.invitedUser?.id == user.id) {
        return true // show menu at own profile
      }
      return false
    } else if (user?.userRole == 'AgentX' || user?.userRole == 'Agency') {
      if (team.invitedUser?.id == user.id) {
        return false // don't show menu at own profile for admin
      }
      return true
    }
    return true
  }
  function canShowResendOption(team) {
    // //console.log

    if (team.status === 'Accepted') {
      return false
    }
    // return
    let user = localStorage.getItem('User')
    if (user) {
      try {
        user = JSON.parse(user)
        user = user.user
      } catch (parseError) {
        console.error('Error parsing user data:', parseError)
        return false
      }
    }
    if (user.userRole == 'Invitee') {
      if (team.invitedUser?.id == user.id) {
        return false // show menu at own profile
      }
      return true
    }
    if (user.userRole == 'AgentX' || user.userRole == 'Agency') {
      if (team.invitedUser?.id == user.id) {
        return false // show menu at own profile
      }
      return true
    }

    return true
  }
  // function canShowInviteButton() {
  //  // //console.log
  //   if (typeof window !== "undefined") {
  //     let user = localStorage.getItem("User")
  //     if (user) {
  //       user = JSON.parse(user);
  //      // //console.log
  //       if (user.userRole == "AgentX") {
  //         return true;
  //       }
  //       return false;
  //     }else{
  //      // //console.log
  //     }
  //   }
  // }

  function canShowInviteButton() {
    // //console.log;
    if (typeof localStorage != 'undefined') {
      let user = localStorage.getItem(PersistanceKeys.LocalStorageUser)
      if (user) {
        try {
          user = JSON.parse(user)
          user = user.user
        } catch (parseError) {
          console.error('Error parsing user data:', parseError)
          return false
        }
      }
      //console.log;
      if (user?.userRole == 'AgentX' || user?.userRole == 'Agency') {
        //console.log
        return true
      }
      return false
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {showSnak && (
        <AgentSelectSnackMessage
          isVisible={showSnak}
          hide={() => setShowSnak(false)}
          message={snackTitle}
          type={SnackbarTypes.Success}
        />
      )}
      <StandardHeader
        titleContent={
          <div className="flex flex-row items-center gap-3">
            <TypographyH3>Teams</TypographyH3>
            {reduxUser?.planCapabilities?.allowTeamCollaboration &&
              reduxUser?.plan?.planId != null &&
              reduxUser?.planCapabilities?.maxTeamMembers < 1000 && (
                <div
                  style={{ fontSize: 14, fontWeight: '400', color: '#0000080' }}
                >
                  {`${reduxUser?.currentUsage?.maxTeamMembers}/${reduxUser?.planCapabilities?.maxTeamMembers || 0} used`}
                </div>
              )}

            {reduxUser?.planCapabilities?.allowTeamCollaboration &&
              reduxUser?.plan?.planId != null &&
              reduxUser?.planCapabilities?.maxTeamMembers < 1000 && (
                <Tooltip
                  title={`Additional team seats are $${reduxUser?.planCapabilities?.costPerAdditionalTeamSeat}/month each.`}
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: '#ffffff', // Ensure white background
                        color: '#333', // Dark text color
                        fontSize: '14px',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                      },
                    },
                    arrow: {
                      sx: {
                        color: '#ffffff', // Match tooltip background
                      },
                    },
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#000000',
                      cursor: 'pointer',
                    }}
                  >
                    <Image
                      src="/agencyIcons/InfoIcon.jpg"
                      alt="info"
                      width={16}
                      height={16}
                      className="cursor-pointer rounded-full"
                    />
                  </div>
                </Tooltip>
              )}
          </div>
        }
        showTasks={true}
      />
      {/*
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0
          }}>
          <DashboardSlider
            needHelp={false} />
        </div>
      */}
      <div
        className="flex h-[90vh] w-full flex flex-col justify-start overflow-auto pb-50"
        style={{ scrollbarWidth: 'none' }}
      >
        <div className="w-full flex flex-col items-end p-4">

          {myTeam.length !== 0 && (
            <div
              role="button"
              tabIndex={0}
              className="rounded-lg text-white bg-brand-primary px-4 cursor-pointer"
              style={{
                fontWeight: '500',
                fontSize: '16',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // width: '173px',
              }}
              onClick={(e) => {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:invite-button-click-entry', message: 'Invite button click handler entry', data: { defaultPrevented: e.defaultPrevented, bubbles: e.bubbles, cancelable: e.cancelable, target: e.target?.tagName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
                // #endregion
                console.log('🔵 Button clicked - starting handler')
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation?.()

                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:invite-button-after-prevent', message: 'After preventDefault/stopPropagation', data: { defaultPrevented: e.defaultPrevented, hasForm: !!e.target.closest('form') }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                // #endregion

                // Prevent any form submission
                const form = e.target.closest('form')
                if (form) {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:invite-button-form-found', message: 'Form element found near button', data: { formId: form.id, formAction: form.action }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
                  // #endregion
                  form.addEventListener('submit', (ev) => {
                    ev.preventDefault()
                    ev.stopPropagation()
                    ev.stopImmediatePropagation()
                    return false
                  }, { once: true, capture: true })
                }

                console.log('🔵 After preventDefault')

                // Use a longer delay to ensure all event handlers have finished
                window.setTimeout(() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:invite-button-setTimeout-entry', message: 'setTimeout callback entry', data: { currentUsage: reduxUser?.currentUsage?.maxTeamMembers, maxMembers: reduxUser?.planCapabilities?.maxTeamMembers }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
                  // #endregion
                  console.log(
                    'Current team members innvite are',
                    reduxUser?.currentUsage?.maxTeamMembers,
                  )
                  console.log(
                    'MAx team members invite are',
                    reduxUser?.planCapabilities?.maxTeamMembers,
                  )
                  if (
                    reduxUser?.currentUsage?.maxTeamMembers >=
                    reduxUser?.planCapabilities?.maxTeamMembers
                  ) {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:invite-button-upgrade-modal', message: 'Setting showUpgradeModalMore to true', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
                    // #endregion
                    setShowUpgradeModalMore(true)
                    console.log('should open upgrade warning')
                  } else {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:invite-button-set-open-invite', message: 'Setting openInvitePopup to true', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
                    // #endregion
                    console.log('Should open invite')
                    setOpenInvitePopupWithLog(true)
                  }
                }, 10)

                return false
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  if (
                    reduxUser?.currentUsage?.maxTeamMembers >=
                    reduxUser?.planCapabilities?.maxTeamMembers
                  ) {
                    setShowUpgradeModalMore(true)
                  } else {
                    setOpenInvitePopup(true)
                  }
                }
              }}
            >
              {agencyData?.sellSeats || userLocalData?.sellSeats
                ? `Add Team $${userLocalData.costPerSeat}/mo`
                : '+ Invite Team'}
            </div>
          )}
        </div>
        {getTeamLoader ? (
          <div className="w-full pt-[100px] flex flex-col items-center">
            <CircularProgress size={40} sx={{ color: 'hsl(var(--brand-primary))' }} />
          </div>
        ) : (
          <div className="w-11/12 flex flex-col items-start">

            {myTeam.length > 0 ? (
              <div
                className="pt-3 flex flex-row w-full flex-wrap"
                style={{ overflow: 'auto', scrollbarWidth: 'none' }}
              >
                {myTeam.map((item, index) => {
                  // //console.log;
                  return (
                    <div key={item.id} className="relative w-4/12 p-3">
                      <div className="p-4 flex flex-row justify-between items-start border rounded-lg">
                        {/* Img code here */}
                        <div className="flex flex-row items-start gap-4">
                          <div>
                            {item.invitedUser?.thumb_profile_image ? (
                              <div
                                style={{
                                  width: '37px',
                                  height: '37px',
                                  borderRadius: '50%', // Ensures circular shape
                                  overflow: 'hidden', // Clips any overflow from the image
                                  display: 'flex', // Centers the image if needed
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <img
                                  src={item.invitedUser?.thumb_profile_image}
                                  alt="*"
                                  style={{ height: '100%', width: '100%' }}
                                />
                              </div>
                            ) : (
                              <div
                                className="flex rounded-full justify-center items-center bg-black text-white text-md"
                                style={{
                                  height: 37,
                                  width: 37,
                                  textTransform: 'capitalize',
                                }}
                              >
                                {item.name?.[0] || 'U'}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap flex-col items-start gap-2">
                            <div className="text-lg font-medium text-black">
                              {item.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                              {item?.phone
                                ? formatPhoneNumber(item.phone)
                                : 'No phone'}
                            </div>
                            <div className="text-sm font-medium text-gray-500 underline">
                              {item.email.length > 25
                                ? item.email.slice(0, 25) + '...'
                                : item.email}
                            </div>
                            <div
                              className={`text-sm font-medium ${item.status === 'Pending'
                                ? 'text-red-500'
                                : 'text-green-500'
                                }`}
                            >
                              {item.status}
                            </div>
                          </div>
                        </div>

                        {canShowMenuDots(item) && (
                          <button
                            id={`dropdown-toggle-${item.id}`}
                            onClick={(e) => handlePopoverOpen(e, item)}
                            className="relative"
                          >
                            <img
                              src={'/otherAssets/threeDotsIcon.png'}
                              height={24}
                              width={24}
                              alt="threeDots"
                            />
                          </button>
                        )}
                      </div>

                      {/* Custom Dropdown
                      {moreDropdown === item.id && (
                        <div
                          className="absolute right-0  top-10 bg-white border rounded-lg shadow-lg z-10"
                          style={{ width: "200px" }}
                        >
                          {canShowResendOption(item) && (
                            <div
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                              onClick={() => {
                                handleResendInvite(item);
                                setMoreDropdown(null);
                              }}
                            >
                              Resend Invite
                            </div>
                          )}
                          <div
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-red-500"
                            onClick={() => {
                              // //console.log;
                              DeleteTeamMember(item);
                              setMoreDropdown(null);
                            }}
                          >
                            Delete
                          </div>
                        </div>
                      )} */}

                      <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handlePopoverClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'right',
                        }}
                        PaperProps={{
                          sx: {
                            boxShadow:
                              '0px 4px 5px rgba(0, 0, 0, 0.02), 0px 0px 4px rgba(0, 0, 0, 0.02)',
                            border: 'none', // optional: add a light border instead
                          },
                        }}
                      >
                        <div className="flex flex-col">
                          {popoverTeam && canShowResendOption(popoverTeam) && (
                            <MenuItem
                              onClick={() => {
                                handleResendInvite(popoverTeam)
                                handlePopoverClose()
                              }}
                            >
                              Resend Invite
                            </MenuItem>
                          )}
                          {(agencyData?.userRole === 'Agency' ||
                            userLocalData?.userRole === 'Agency' ||
                            agencyData?.userRole === 'AgentX' ||
                            userLocalData?.userRole === 'AgentX' ||
                            agencyData?.userRole === 'AgencySubAccount' ||
                            userLocalData?.userRole === 'AgencySubAccount') &&
                            (popoverTeam?.invitedUserId || popoverTeam?.status === 'Pending') && (
                              <MenuItem
                                onClick={() => {
                                  setSelectedTeamMemberForPermissions(popoverTeam)
                                  setShowPermissionModal(true)
                                  handlePopoverClose()
                                }}
                              >
                                Manage Permissions
                              </MenuItem>
                            )}
                          <MenuItem
                            sx={{ color: 'red' }}
                            onClick={() => {
                              DeleteTeamMember(popoverTeam)
                              handlePopoverClose()
                            }}
                          >
                            Delete
                          </MenuItem>
                        </div>
                      </Popover>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-screen w-full flex flex-col items-center justify-center -mt-16">
                <Image
                  src={'/otherAssets/noTemView.png'}
                  height={280}
                  width={240}
                  alt="*"
                />

                {reduxUser?.planCapabilities?.allowTeamCollaboration ===
                  false ? (
                  <div className="w-full flex flex-col items-center -mt-12 gap-4">
                    <Image
                      src={'/otherAssets/starsIcon2.png'}
                      height={30}
                      width={30}
                      alt="*"
                    />
                    <div style={{ fontWeight: '700', fontSize: 22 }}>
                      Unlock Teams
                    </div>
                    <div
                      style={{
                        fontWeight: '400',
                        fontSize: 15,
                        textAlign: 'center',
                      }}
                    >
                      Upgrade to invite team members and manage
                      <br /> agents in one place
                    </div>
                  </div>
                ) : agencyData?.sellSeats || userLocalData?.sellSeats ? (
                  <div className="w-full flex flex-col items-center -mt-12 gap-4">
                    <div style={{ fontWeight: '700', fontSize: 22 }}>
                      Add Team (${userLocalData.costPerSeat}/mo)
                    </div>
                    <div style={{ fontWeight: '400', fontSize: 15 }}>
                      Add Seats With Full Access
                    </div>
                    <div
                      className="text-center"
                      style={{
                        fontWeight: '400',
                        fontSize: 15,
                        width: '700px',
                      }}
                    >
                      Unlock full access for your team by adding an extra seat
                      to your account.{' '}
                      <span className="text-brand-primary">
                        For just ${userLocalData.costPerSeat} per additional
                        user
                      </span>
                      , per month. Your team member will have complete access to
                      all features, allowing seamless collaboration, lead
                      management, and AI agent usage. Empower your team to work
                      smarter—add a seat and scale your success effortlessly.
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center -mt-12 gap-4">
                    <div style={{ fontWeight: '700', fontSize: 22 }}>
                      Add Your Team
                    </div>
                    <div style={{ fontWeight: '400', fontSize: 15 }}>
                      Add team member to better manage your leads
                    </div>
                  </div>
                )}
                <div className="">
                  <div
                    role="button"
                    tabIndex={0}
                    className="rounded-lg text-white bg-brand-primary mt-8 cursor-pointer"
                    style={{
                      fontWeight: '500',
                      fontSize: '16',
                      height: '50px',
                      width: '173px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={(e) => {
                      console.log('🔵 Button clicked (empty state) - starting handler')
                      e.preventDefault()
                      e.stopPropagation()
                      e.stopImmediatePropagation?.()

                      // Prevent any form submission
                      const form = e.target.closest('form')
                      if (form) {
                        form.addEventListener('submit', (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          ev.stopImmediatePropagation()
                          return false
                        }, { once: true, capture: true })
                      }

                      console.log('🔵 After preventDefault (empty state)')

                      // Use a longer delay to ensure all event handlers have finished
                      window.setTimeout(() => {
                        // if (!reduxUser?.plan?.price) {
                        //   console.log("No plan price")
                        //   setShowUpgradeModal(true)
                        //   return
                        // }

                        if (
                          reduxUser?.planCapabilities?.allowTeamCollaboration ===
                          false
                        ) {
                          console.log('should open upgrade plan')
                          setShowUpgradeModal(true)
                          return
                        }
                        console.log('Current team members are', currentMembers)
                        console.log('MAx team members are', maxTeamMembers)

                        if (
                          reduxUser?.currentUsage?.maxTeamMembers >=
                          reduxUser?.planCapabilities?.maxTeamMembers
                        ) {
                          console.log('should open upgrade more')
                          setShowUpgradeModalMore(true)
                          console.log('should open upgrade warning')
                        } else {
                          console.log('Should open invite')
                          setOpenInvitePopupWithLog(true)
                        }
                      }, 10)

                      return false
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        if (
                          reduxUser?.planCapabilities?.allowTeamCollaboration ===
                          false
                        ) {
                          setShowUpgradeModal(true)
                        } else if (
                          reduxUser?.currentUsage?.maxTeamMembers >=
                          reduxUser?.planCapabilities?.maxTeamMembers
                        ) {
                          setShowUpgradeModalMore(true)
                        } else {
                          setOpenInvitePopupWithLog(true)
                        }
                      }
                    }}
                  >
                    {reduxUser?.planCapabilities?.allowTeamCollaboration ===
                      false
                      ? 'Upgrade Plan'
                      : agencyData?.sellSeats || userLocalData?.sellSeats
                        ? `Add Team $${userLocalData.costPerSeat}/mo`
                        : '+ Invite Team'}
                  </div>
                </div>

                <UpgradeModal
                  open={false}
                  handleClose={() => {
                    setShowUpgradeModal(false)
                  }}
                  title={"You've Hit Your Members Limit"}
                  subTitle={'Upgrade to add more team members'}
                  buttonTitle={'No Thanks'}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <MoreTeamMembers
        open={showUpgradeModalMore}
        onClose={() => {
          setShowUpgradeModalMore(false)
        }}
        onAddTeamSeat={() => {
          setOpenInvitePopupWithLog(true)
          setShowUpgradeModalMore(false)
        }}
        onUpgrade={() => {
          setShowUpgradeModal(true)
          setShowUpgradeModalMore(false)
        }}
        costPerAdditionalTeamSeat={
          reduxUser?.planCapabilities?.costPerAdditionalTeamSeat || 10
        }
      />
      <UpgradePlan
        selectedPlan={null}
        setSelectedPlan={() => { }}
        open={showUpgradeModal}
        handleClose={async (upgradeResult) => {
          setShowUpgradeModal(false)
          if (upgradeResult) {
            await refreshUserData()
          }
        }}
        plan={null}
        currentFullPlan={selectedAgency?.plan || reduxUser?.user?.plan}
        selectedUser={selectedAgency}
        from={
          selectedAgency?.userRole === 'AgencySubAccount'
            ? 'SubAccount'
            : selectedAgency?.userRole === 'Agency'
              ? 'agency'
              : selectedAgency?.id && reduxUser?.userRole === 'Agency' && selectedAgency?.id !== reduxUser?.id
                ? 'SubAccount' // If selectedAgency is provided, logged-in user is agency, and selectedAgency is different from logged-in user, it's a subaccount
                : from
        }
      />
      <Modal
        open={openInvitePopup}
        onClose={(e, reason) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:modal-onClose', message: 'Modal onClose called', data: { reason, hasEvent: !!e }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
          // #endregion
          // Prevent any default close behavior that might cause refresh
          if (e) {
            e.preventDefault()
            e.stopPropagation()
          }
          setOpenInvitePopup(false)
        }}
        closeAfterTransition={false}
        disableEscapeKeyDown={false}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: '#00000030',
            // backdropFilter: "blur(20px)",
          },
          onClick: (e) => {
            // Prevent backdrop click from causing issues
            e.stopPropagation()
          }
        }}
      >
        <Box
          className="lg:w-[31.25%] sm:w-full w-6/12r"
          sx={styles.modalsStyle}
          component="div"
          onKeyDown={(e) => {
            // Prevent Enter key from submitting any form
            if (e.key === 'Enter') {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'Teams.js:Modal-Box-onKeyDown', message: 'Enter key pressed in Modal Box', data: { target: e.target?.tagName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
              // #endregion
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        >
          <AgentSelectSnackMessage
            isVisible={showError}
            hide={() => setShowError(false)}
            message={'Enter all credentials'}
          />
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full p-8"
              style={{
                backgroundColor: '#ffffff',

                borderRadius: '13px',
              }}
              onKeyDown={(e) => {
                // Prevent Enter key from submitting any form
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            >
              <div className="flex flex-row justify-between items-center">
                {inviteModalStep !== 'initial' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setInviteModalStep('initial')
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                ) : (
                  <div className="flex flex-row gap-3">
                    <div
                      style={{ fontSize: 16, fontWeight: '500', color: '#000' }}
                    >
                      New Invite
                    </div>
                  </div>
                )}
                <CloseBtn
                  onClick={() => {
                    setOpenInvitePopup(false)
                    setInviteModalStep('initial')
                    // Reset form when closing
                    setName('')
                    setEmail('')
                    setPhone('')
                    setSelectedInvitationPermissions(null)
                    setSelectedSubaccountIds([])
                    setAgencyPermissionStates({})
                    setSubaccountPermissionStates({})
                    setSubaccountsList([])
                    setSubaccountSearchTerm('')
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: 20,
                }}
              >
                {inviteModalStep === 'agency' ? 'Agency Permission' : inviteModalStep === 'subaccount' ? 'Subaccount permission' : 'Invite Team'}
              </div>


              {/* Conditional Content Based on Modal Step */}
              {inviteModalStep === 'initial' && (
                <>
                  {/* Initial Form Fields */}
                  <div className="pt-5" style={styles.headingStyle}>
                    Name
                  </div>
                  <input
                    placeholder="Type here"
                    className="w-full border mt-2 rounded p-2 outline-none outline-none focus:ring-0"
                    style={styles.inputFieldStyle}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setShowError(false)
                    }}
                  />

                  <div className="pt-5 w-full flex flex-row items-center justify-between">
                    <div style={styles.headingStyle}>Email Address</div>
                    <div>
                      {emailLoader ? (
                        <p style={{ ...styles.errmsg, color: 'black' }}>
                          Checking ...
                        </p>
                      ) : (
                        <div>
                          {email && emailCheckResponse ? (
                            <p
                              style={{
                                ...styles.errmsg,
                                color:
                                  emailCheckResponse?.status === true
                                    ? 'green'
                                    : 'red',
                              }}
                            >
                              {emailCheckResponse?.message
                                ?.slice(0, 1)
                                .toUpperCase() +
                                emailCheckResponse?.message?.slice(1)}
                            </p>
                          ) : (
                            <div />
                          )}
                        </div>
                      )}
                      <div style={{ ...styles.errmsg, color: 'red' }}>
                        {validEmail}
                      </div>
                    </div>
                  </div>

                  <input
                    placeholder="Type here"
                    className="w-full border rounded mt-2 p-2 focus:ring-0 outline-none"
                    style={styles.inputFieldStyle}
                    value={email}
                    onChange={(e) => {
                      let value = e.target.value
                      setEmail(value)
                      setShowError(false)
                      if (timerRef.current) {
                        clearTimeout(timerRef.current)
                      }

                      setEmailCheckResponse(null)

                      if (!value) {
                        setValidEmail('')
                        return
                      }

                      if (!validateEmail(value)) {
                        setValidEmail('Invalid')
                      } else {
                        if (value) {
                          timerRef.current = setTimeout(() => {
                            checkEmail(value)
                          }, 300)
                        } else {
                          setEmailCheckResponse(null)
                          setValidEmail('')
                        }
                      }
                    }}
                  />

              <div className="pt-5 flex flex-row items-center justify-between w-full">
                <div style={styles.headingStyle}>Phone Number</div>
                {/* Code for error messages */}
                <div>
                  <div>
                    {errorMessage && (
                      <div
                        className={`text-red`}
                        style={{
                          ...styles.errmsg,
                          color:
                            checkPhoneResponse?.status === true
                              ? 'green'
                              : 'red',
                        }}
                      >
                        {errorMessage}
                      </div>
                    )}
                  </div>
                  <div>
                    {checkPhoneLoader && (
                      <div className={`text-red`} style={{ ...styles.errmsg }}>
                        {checkPhoneLoader}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 w-full mt-3">
                <div className="flex flex-row items-center gap-2 border rounded-lg w-full justify-between pe-4">
                  <div className="w-full">
                    <PhoneInput
                      className="outline-none bg-transparent focus:ring-0"
                      country="us" // Default country
                      onlyCountries={['us', 'ca', 'mx', 'au', 'gb']} // Allow US, Canada, Mexico, Australia, and UK
                      value={phone}
                      onChange={handlePhoneNumberChange}
                      // placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                      placeholder={'Type here'}
                      // disabled={loading}
                      style={{
                        borderRadius: '7px',
                        outline: 'none', // Ensure no outline on wrapper
                        boxShadow: 'none', // Remove any shadow
                      }}
                      inputStyle={{
                        width: '100%',
                        borderWidth: '0px',
                        backgroundColor: 'transparent',
                        paddingLeft: '60px',
                        paddingTop: '12px',
                        paddingBottom: '12px',
                        fontSize: 15,
                        fontWeight: '500',
                        height: '50px',
                        outline: 'none', // Remove outline on input
                        boxShadow: 'none', // Remove shadow as well
                      }}
                      buttonStyle={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        outline: 'none', // Ensure no outline on button
                      }}
                      dropdownStyle={{
                        maxHeight: '150px',
                        overflowY: 'auto',
                      }}
                      countryCodeEditable={true}
                    // defaultMask={locationLoader ? "Loading..." : undefined}
                    />
                  </div>
                </div>
              </div>

              {inviteTeamLoader ? (
                <div className="flex flex-col items-center p-5">
                  <CircularProgress size={30} sx={{ color: 'hsl(var(--brand-primary))' }} />
                </div>
              ) : (
                <button
                  style={{
                    marginTop: 20,
                    backgroundColor:
                      inviteModalStep === 'initial' && (
                        !name ||
                        !email ||
                        !phone ||
                        emailCheckResponse?.status !== true ||
                        checkPhoneResponse?.status !== true
                      )
                        ? '#00000020'
                        : '',
                  }}
                  className="w-full flex bg-brand-primary p-3 rounded-lg items-center justify-center"
                  onClick={() => {
                    // If on permission views (agency or subaccount), go back to initial
                    if (inviteModalStep === 'agency' || inviteModalStep === 'subaccount') {
                      setInviteModalStep('initial')
                      return
                    }

                    // Collect permissions from all steps
                    const allPermissions = collectAllPermissions()
                    const permissionsToSend = allPermissions.length > 0 ? allPermissions : null
                    setSelectedInvitationPermissions(permissionsToSend)

                    let data = {
                      name: name,
                      email: email,
                      phone: phone,
                    }
                    // Pass permissions and subaccount IDs directly to avoid race condition
                    inviteTeamMember(data, permissionsToSend, selectedSubaccountIds)
                  }}
                  disabled={
                    inviteModalStep === 'initial' && (
                      !name ||
                      !email ||
                      !phone ||
                      emailCheckResponse?.status !== true ||
                      checkPhoneResponse?.status !== true
                    )
                  }
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color:
                        inviteModalStep === 'initial' && (
                          !name ||
                          !email ||
                          !phone ||
                          emailCheckResponse?.status !== true ||
                          checkPhoneResponse?.status !== true
                        )
                          ? '#000000'
                          : '#ffffff',
                    }}
                  >
                    {inviteModalStep === 'agency' || inviteModalStep === 'subaccount'
                      ? 'Apply Changes'
                      : agencyData?.sellSeats || userLocalData?.sellSeats
                        ? `Add Team $${userLocalData.costPerSeat}/mo`
                        : 'Send Invite'}
                  </div>
                </button>
              )}

              {/* PermissionManager is rendered outside the Modal to avoid conflicts */}
              {/* <PermissionManager
                open={showInvitationPermissionManager}
                onClose={() => setShowInvitationPermissionManagerWithLog(false)}
                teamMemberId={null}
                context={
                  agencyData?.userRole === 'Agency' ||
                  userLocalData?.userRole === 'Agency'
                    ? 'agency'
                    : 'agentx' // Both AgencySubAccount and AgentX users use 'agentx' context
                }
                contextUserId={null}
                onPermissionsChange={(permissions) => {
                  setSelectedInvitationPermissions(permissions)
                  setShowInvitationPermissionManagerWithLog(false)
                }}
                initialPermissions={selectedInvitationPermissions}
              /> */}

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
      {/* Code for upgrade plan modal */}
      <Modal
        open={upgradePlan}
        onClose={() => {
          setUpgradePlan(false)
        }}
      >
        <Box className="bg-white rounded-xl w-[70%] h-[90vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-full flex flex-row items-center justify-end px-6 pt-6 h-[8%]">
            <CloseBtn
              onClick={() => {
                setUpgradePlan(false)
              }}
            />
          </div>
          <div
            className={`w-full h-[88%] mt-4 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-brand-primary`}
          >
            {from === 'agency' ? (
              <AgencyPlans
                isFrom={'addPlan'}
                handleCloseModal={(d) => {
                  setUpgradePlan(false)
                  refreshUserData()
                }}
              />
            ) : from === 'SubAccount' ? (
              <SubAccountPlan
                isFrom={'UpgradePlanForTeam'}
                handleClose={() => {
                  setUpgradePlan(false)
                  refreshUserData()
                }}
              />
            ) : (
              <UserPlans
                handleContinue={() => {
                  setUpgradePlan(false)
                  // refreshProfileAndState();
                }}
                handleBack={() => setUpgradePlan(false)}
                // isFrom="SubAccount"
                from="billing-modal"
                onPlanSelected={(plan) => {
                  // Close UserPlans modal
                  setUpgradePlan(false)
                  refreshUserData()
                  // Set the selected plan
                  // setSelectedPlan(plan);
                  // setTogglePlan(plan.id);
                  // setCurrentPlanDetails(plan);
                  // // Open Upgrade modal
                  // setShowUpgradeModal(true);
                }}
              />
            )}
          </div>
        </Box>
      </Modal>

      {/* Permission Management Modal - Multi-step flow */}
      <Modal
        open={showPermissionModal && !!selectedTeamMemberForPermissions}
        onClose={() => {
          setShowPermissionModal(false)
          setSelectedTeamMemberForPermissions(null)
          setManagePermissionModalStep('initial')
          setExistingSelectAllSubaccounts(false)
        }}
        closeAfterTransition={false}
        disableEscapeKeyDown={false}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: '#00000030',
          },
        }}
      >
        <Box
          className="lg:w-[31.25%] sm:w-full w-6/12r"
          sx={{
            ...styles.modalsStyle,
            my: 0,
            transform: 'none',
            maxHeight: '90vh',
            overflow: 'auto',
          }}
          component="div"
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full p-8"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row justify-between items-center">
                {managePermissionModalStep !== 'initial' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setManagePermissionModalStep('initial')
                    }}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                ) : (
                  <div className="flex flex-row gap-3">
                    <div
                      style={{ fontSize: 16, fontWeight: '500', color: '#000' }}
                    >
                      Manage Permissions
                    </div>
                  </div>
                )}
                <CloseBtn
                  onClick={() => {
                    setShowPermissionModal(false)
                    setSelectedTeamMemberForPermissions(null)
                    setManagePermissionModalStep('initial')
                    setExistingSelectAllSubaccounts(false)
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#000',
                  marginTop: 20,
                }}
              >
                {managePermissionModalStep === 'agency' ? 'Agency Permission' : managePermissionModalStep === 'subaccount' ? 'Subaccount permission' : 'Manage Permissions'}
              </div>

              {/* Initial View */}
              {managePermissionModalStep === 'initial' && (
                <div className="mt-6 space-y-2">
                  <div className="text-sm font-medium text-gray-700">Permissions</div>
                  <div className="space-y-1">
                    {(agencyData?.userRole === 'Agency' || userLocalData?.userRole === 'Agency') && (
                      <>
                        <div
                          className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setManagePermissionModalStep('agency')
                            // Permissions already loaded, but reload if needed
                            if (existingAgencyPermissions.length === 0) {
                              loadExistingAgencyPermissions()
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">Agency</span>
                            {existingAgencyPermissionsCount > 0 && (
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                                  color: 'hsl(var(--brand-primary))',
                                }}
                              >
                                {existingAgencyPermissionsCount}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div
                          className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setManagePermissionModalStep('subaccount')
                            // Permissions already loaded, but reload if needed
                            if (existingSubaccountPermissions.length === 0) {
                              loadExistingSubaccountPermissions()
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">Subaccount</span>
                            {existingSubaccountPermissionsCount > 0 && (
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                                  color: 'hsl(var(--brand-primary))',
                                }}
                              >
                                {existingSubaccountPermissionsCount}
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Agency Permissions View */}
              {managePermissionModalStep === 'agency' && (
                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto">
                  <div className="text-sm text-gray-600 mb-4">
                    Manage what this user can access in agency panel.
                  </div>
                  {loadingExistingAgencyPermissions ? (
                    <div className="flex justify-center items-center py-8">
                      <CircularProgress size={24} />
                    </div>
                  ) : existingAgencyPermissions.length === 0 ? (
                    <div className="text-sm text-gray-500 py-8 text-center">
                      No agency permissions found.
                    </div>
                  ) : (
                    existingAgencyPermissions.map((perm, index) => {
                      const permKey = perm.key || perm.permissionKey
                      const permName = perm.name || perm.permissionDefinition?.name || permKey
                      const isChecked = existingAgencyPermissionStates[permKey] || false

                      return (
                        <div key={permKey}>
                          <div className="flex items-center justify-between p-3">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">{permName}</span>
                              {perm.description && (
                                <span className="text-xs text-gray-500 mt-1">{perm.description}</span>
                              )}
                            </div>
                            <Switch
                              checked={isChecked}
                              onCheckedChange={() => handleExistingAgencyPermissionToggle(permKey)}
                              className="data-[state=checked]:bg-brand-primary"
                            />
                          </div>
                          {index < existingAgencyPermissions.length - 1 && (
                            <div className="border-t border-gray-200"></div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* Subaccount Permissions View */}
              {managePermissionModalStep === 'subaccount' && (
                <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="text-sm text-gray-600 mb-4">
                    Manage what this user can access at subaccount level.
                  </div>

                  {/* Permission Toggles */}
                  <div className="space-y-3">
                    {loadingExistingSubaccountPermissions ? (
                      <div className="flex justify-center items-center py-8">
                        <CircularProgress size={24} />
                      </div>
                    ) : existingSubaccountPermissions.length === 0 ? (
                      <div className="text-sm text-gray-500 py-8 text-center">
                        No subaccount permissions found.
                      </div>
                    ) : (
                      existingSubaccountPermissions.map((perm, index) => {
                        const permKey = perm.key || perm.permissionKey
                        const permName = perm.name || perm.permissionDefinition?.name || permKey
                        const isChecked = existingSubaccountPermissionStates[permKey] || false

                        return (
                          <div key={permKey}>
                            <div className="flex items-center justify-between p-3">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">{permName}</span>
                                {perm.description && (
                                  <span className="text-xs text-gray-500 mt-1">{perm.description}</span>
                                )}
                              </div>
                              <Switch
                                checked={isChecked}
                                onCheckedChange={() => handleExistingSubaccountPermissionToggle(permKey)}
                                className="data-[state=checked]:bg-brand-primary"
                              />
                            </div>
                            {index < existingSubaccountPermissions.length - 1 && (
                              <div className="border-t border-gray-200"></div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Subaccount Selection */}
                  {(agencyData?.userRole === 'Agency' || userLocalData?.userRole === 'Agency') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">
                          Select subaccounts this user can access
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Select All</span>
                          <Checkbox
                            checked={existingSelectAllSubaccounts}
                            onCheckedChange={(checked) => {
                              setExistingSelectAllSubaccounts(checked)
                              if (checked) {
                                setExistingSelectedSubaccountIds([]) // Clear individual selections when selecting all
                              }
                            }}
                          />
                        </div>
                      </div>
                      <Input
                        placeholder="Search subaccounts"
                        value={existingSubaccountSearchTerm}
                        onChange={(e) => {
                          const value = e.target.value
                          setExistingSubaccountSearchTerm(value)
                          setExistingSubaccountsListOffset(0)
                          setHasMoreExistingSubaccountsList(true)
                          loadExistingSubaccountsList(0, value)
                        }}
                        className="border-2 border-[#00000020] rounded p-3 outline-none focus:outline-none focus:ring-0 focus:border-black focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black w-full"
                      />
                      <div className={`max-h-[200px] overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 ${existingSelectAllSubaccounts ? 'opacity-50' : ''}`}>
                        {existingSelectAllSubaccounts ? (
                          <div className="text-sm text-gray-500 py-4 text-center">
                            All subaccounts will be accessible to this user
                          </div>
                        ) : existingSubaccountsListLoading && existingSubaccountsList.length === 0 ? (
                          <div className="flex justify-center items-center py-4">
                            <CircularProgress size={20} />
                          </div>
                        ) : existingSubaccountsList.length === 0 ? (
                          <div className="text-sm text-gray-500 py-4 text-center">
                            {existingSubaccountSearchTerm ? 'No subaccounts found matching your search' : 'No subaccounts found'}
                          </div>
                        ) : (
                          <>
                            {existingSubaccountsList.map((subaccount) => {
                              const isSelected = existingSelectedSubaccountIds.includes(subaccount.id)
                              return (
                                <div
                                  key={subaccount.id}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleExistingSubaccountSelectionToggle(subaccount.id)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => handleExistingSubaccountSelectionToggle(subaccount.id)}
                                  />
                                  <span className="text-sm text-gray-900">
                                    {subaccount.name || subaccount.email || `Subaccount ${subaccount.id}`}
                                  </span>
                                </div>
                              )
                            })}
                            {hasMoreExistingSubaccountsList && (
                              <div className="flex justify-center pt-2">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => loadExistingSubaccountsList(existingSubaccountsListOffset, existingSubaccountSearchTerm)}
                                  disabled={existingSubaccountsListLoading}
                                  sx={{
                                    textTransform: 'none',
                                    borderColor: 'hsl(var(--brand-primary))',
                                    color: 'hsl(var(--brand-primary))',
                                  }}
                                >
                                  {existingSubaccountsListLoading ? 'Loading...' : 'Load More'}
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

              {/* Action Buttons */}
              {managePermissionModalStep !== 'initial' && (
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={saveExistingPermissions}
                    disabled={savingPermissions}
                    className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{
                      backgroundColor: 'hsl(var(--brand-primary))',
                    }}
                  >
                    {savingPermissions ? 'Applying...' : 'Apply Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Invitation Permission Manager */}
      <PermissionManager
        open={showInvitationPermissionManager}
        onClose={() => {
          setShowInvitationPermissionManagerWithLog(false)
          // Reopen the invite modal when permissions are closed
          if (!selectedInvitationPermissions || selectedInvitationPermissions.length === 0) {
            setTimeout(() => {
              setOpenInvitePopup(true)
            }, 100)
          }
        }}
        teamMemberId={null}
        context={
          agencyData?.userRole === 'Agency' ||
            userLocalData?.userRole === 'Agency'
            ? 'agency'
            : 'agentx' // Both AgencySubAccount and AgentX users use 'agentx' context
        }
        contextUserId={null}
        onPermissionsChange={(permissions) => {
          setSelectedInvitationPermissions(permissions)
          setShowInvitationPermissionManagerWithLog(false)
          // Reopen the invite modal after permissions are set
          setTimeout(() => {
            setOpenInvitePopup(true)
          }, 100)
        }}
        onSubaccountsChange={(subaccountIds) => {
          setSelectedSubaccountIds(subaccountIds || [])
        }}
        initialPermissions={selectedInvitationPermissions}
        allowedSubaccountIds={selectedSubaccountIds}
      />
    </div>
  );
}

// Export wrapper component that provides PermissionProvider
export default function Teams({ agencyData, selectedAgency, from }) {
  return (
    <PermissionProvider>
      <TeamsContent agencyData={agencyData} selectedAgency={selectedAgency} from={from} />
    </PermissionProvider>
  )
}

const styles = {
  itemText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#000',
  },
  deleteText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#FF4D4F', // Red color for delete
  },
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-55%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
  headingStyle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#00000050',
  },
  inputFieldStyle: {
    fontSize: 15,
    fontWeight: '500',
    // marginTop: 10,
    border: '1px solid #00000010',
    height: '50px',
  },
  errmsg: {
    fontSize: 12,
    fontWeight: '500',
  },
}
