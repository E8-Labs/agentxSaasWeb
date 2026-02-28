import { Box, CircularProgress, Modal } from '@mui/material'
import { Cross } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

import AdminLeads from '@/components/admin/users/AdminLeads'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import DelAdminUser from '@/components/onboarding/extras/DelAdminUser'

import AdminGetProfileDetails from '../AdminGetProfileDetails'
import AdminAffiliates from '../affiliates/AdminAffiliates'
import AdminAgentX from './AdminAgentX'
import AdminCallLogs from './AdminCallLogs'
import AdminDashboard from './AdminDashboard'
import AdminIntegration from './AdminIntegration'
import AdminLeads1 from './AdminLeads1'
import AdminProfileData from './AdminProfileData'
import AdminTeam from './AdminTeams'
import ResetTrial from './ResetTrial'
import UserActivityLogs from './UserActivityLogs'
import AdminPipeline1 from './pipline/AdminPipeline1'
import { PersistanceKeys } from '@/constants/Constants'
import Messages from '@/components/messaging/Messages'
import AppLogo from '@/components/common/AppLogo'
import { useHasPermission, usePermission } from '@/contexts/PermissionContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import moment from 'moment/moment'

function SelectedUserDetails({
  isAgencyView = false,
  selectedUser,
  handleDel,
  from = 'admin',
  handlePauseUser,
  enablePermissionChecks = true,
  hideViewDetails = false,
  handleClose,
  agencyUser = false,
}) {

  console.log("From passed is", from)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [manuLoading, setManuLoading] = useState(true)
  const [accessibleMenuItems, setAccessibleMenuItems] = useState([])
  const [isInvitee, setIsInvitee] = useState(false)
  const [selectedManu, setSelectedManu] = useState(null)
  const [permissionContextAvailable, setPermissionContextAvailable] = useState(false)
  const [initialTabSet, setInitialTabSet] = useState(false)

  // Sliding pill for nav links hover (update sidebar spec)
  const [hoveredNavIndex, setHoveredNavIndex] = useState(null)
  const [navPillStyle, setNavPillStyle] = useState(/** @type {{ top: number; left: number; width: number; height: number } | null} */(null))
  const navLinksContainerRef = useRef(/** @type {HTMLDivElement | null} */(null))
  const navLinkItemRefs = useRef(/** @type {(HTMLDivElement | null)[]} */([]))

  // Update sliding pill position when hovered nav index changes
  useLayoutEffect(() => {
    if (hoveredNavIndex === null) {
      setNavPillStyle(null)
      return
    }
    const container = navLinksContainerRef.current
    const itemEl = navLinkItemRefs.current[hoveredNavIndex]
    if (container && itemEl) {
      const cr = container.getBoundingClientRect()
      const ir = itemEl.getBoundingClientRect()
      setNavPillStyle({
        top: ir.top - cr.top,
        left: ir.left - cr.left,
        width: ir.width,
        height: ir.height,
      })
    } else {
      setNavPillStyle(null)
    }
  }, [hoveredNavIndex])

  // Get the tab from URL parameter
  const tabParam = searchParams.get('tab')

  // Get permission context
  const permissionContext = usePermission()

  // All menu items definition
  let allMenuItems = [
    {
      id: 1,
      name: 'Dashboard',
      selectedImage: '/svgIcons/selectdDashboardIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedDashboardIcon.svg',
      permissionKey: 'subaccount.dashboard.view',
      paramValue: 'dashboard',
    },
    {
      id: 2,
      name: 'Agents',
      selectedImage: '/svgIcons/selectedAgentXIcon.svg',
      unSelectedImage: '/svgIcons/agentXIcon.svg',
      permissionKey: 'subaccount.agents.view',
      paramValue: 'agents',
    },
    {
      id: 3,
      name: 'Leads',
      selectedImage: '/svgIcons/selectedLeadsIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedLeadsIcon.svg',
      permissionKey: 'subaccount.leads.manage',
      paramValue: 'leads',
    },
    {
      id: 5,
      name: 'Pipeline',
      selectedImage: '/svgIcons/selectedPiplineIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedPipelineIcon.svg',
      permissionKey: 'subaccount.pipelines.manage',
      paramValue: 'pipeline',
    },
    {
      id: 9,
      name: 'Messages (Beta)',
      selectedImage: '/messaging/icons_chat_menu.svg',
      unSelectedImage: '/messaging/icons_chat_menu.svg',
      permissionKey: 'subaccount.messages.manage',
      paramValue: 'messages',
    },
    {
      id: 4,
      name: 'Activity',
      selectedImage: '/otherAssets/selectedActivityLog.png',
      unSelectedImage: '/otherAssets/activityLog.png',
      permissionKey: 'subaccount.activity.view',
      paramValue: 'activity',
    },
    {
      id: 6,
      name: 'Integration',
      selectedImage: '/svgIcons/selectedIntegration.svg',
      unSelectedImage: '/svgIcons/unSelectedIntegrationIcon.svg',
      permissionKey: 'subaccount.integrations.manage',
      paramValue: 'integration',
    },
    {
      id: 7,
      name: 'Team',
      selectedImage: '/svgIcons/selectedTeam.svg',
      unSelectedImage: '/svgIcons/unSelectedTeamIcon.svg',
      permissionKey: 'subaccount.teams.manage',
      paramValue: 'team',
    },
  ]

  const checkTrialDays = (userData) => {
    // console.log("userData in checkTrialDays is", userData);
    if (userData?.planStatus?.isTrial) {
      // nextChargeDate is the trial END date (when the trial expires)
      const trialEnd = moment(userData?.nextChargeDate || new Date());
      const today = moment().startOf('day'); // Start of day for accurate day counting
      const trialEndStartOfDay = trialEnd.startOf('day');

      // Calculate days remaining: trialEnd - today
      // This gives positive number when trial hasn't ended yet
      let daysLeft = trialEndStartOfDay.diff(today, "days");

      // Ensure daysLeft is never negative (trial already ended)
      daysLeft = Math.max(daysLeft, 0);

      return `${daysLeft} Day${daysLeft !== 1 ? "s" : ""} Left`;
    }
  };

  useEffect(() => {
    console.log("selectedUser in SelectedUserDetails is", selectedUser);
    const viewDetailsMenuItem = {
      id: 123,
      name: 'View Details',
      selectedImage: '/svgIcons/selectedTeam.svg',
      unSelectedImage: '/svgIcons/unSelectedTeamIcon.svg',
      permissionKey: null,
      paramValue: 'viewDetails',
    }
    if (from === "admin") {
      allMenuItems = [...allMenuItems, viewDetailsMenuItem]
    }
  }, [selectedUser, from])

  // Account menu item
  const accountMenu = {
    id: 8,
    name: 'Account',
    selectedImage: '/svgIcons/selectedProfileCircle.svg',
    unSelectedImage: '/svgIcons/unSelectedProfileIcon.svg',
    paramValue: 'account',
  }

  // Function to update URL with selected tab
  const updateUrlWithTab = (tabValue) => {
    const params = new URLSearchParams(searchParams.toString())

    if (tabValue) {
      params.set('tab', tabValue)
    } else {
      params.delete('tab')
    }

    // Update URL without page reload (use full path for reliable navigation)
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl, { scroll: false })
  }

  // Function to find menu item by param value (includes Account which is not in allMenuItems)
  const findMenuItemByParamValue = (paramValue, items) => {
    if (paramValue === 'account') return accountMenu
    return items.find(item => item.paramValue === paramValue)
  }

  // Check user role and permissions on mount
  useEffect(() => {
    const initializeMenu = async () => {
      try {
        // Reset loading
        setManuLoading(true)

        // Check user role from localStorage
        const localData = localStorage.getItem('User')
        let userIsInvitee = false

        if (localData) {
          const userData = JSON.parse(localData)
          const userRole = userData.user?.userRole || userData.userRole
          userIsInvitee = userRole === 'Invitee'
          setIsInvitee(userIsInvitee)
        }

        // Check if permission context is available
        const hasPermissionContext = permissionContext?.hasPermission !== undefined
        setPermissionContextAvailable(hasPermissionContext)

        // If permission checks disabled or user is not Invitee, show all items immediately
        if (!enablePermissionChecks || !userIsInvitee) {
          setAccessibleMenuItems(allMenuItems)

          // Check if there's a tab parameter in URL
          if (tabParam && !initialTabSet) {
            const tabMenuItem = findMenuItemByParamValue(tabParam, allMenuItems)
            if (tabMenuItem) {
              setSelectedManu(tabMenuItem)
              setInitialTabSet(true)
            } else {
              setSelectedManu(allMenuItems[0])
            }
          } else {
            // Sync with URL when tabParam changes (e.g. user clicked Pipeline)
            const tabMenuItem = tabParam ? findMenuItemByParamValue(tabParam, allMenuItems) : null
            setSelectedManu(tabMenuItem || allMenuItems[0])
          }

          setManuLoading(false)
          return
        }

        // For Invitee with permission checks enabled
        if (enablePermissionChecks && userIsInvitee && selectedUser?.id) {
          // Check permissions for each menu item
          const accessibleItems = []

          for (const menuItem of allMenuItems) {
            // Items without permission key are always accessible
            if (!menuItem.permissionKey) {
              accessibleItems.push(menuItem)
              continue
            }

            // Check permission for this menu item
            try {
              let hasAccess = true

              if (hasPermissionContext) {
                // Use permission context if available
                hasAccess = await permissionContext.hasPermission(
                  menuItem.permissionKey,
                  selectedUser.id
                )
              } else {
                // Fallback: use useHasPermission hook
                const [hookHasAccess] = useHasPermission(
                  menuItem.permissionKey,
                  selectedUser.id
                )
                // Note: This hook returns synchronously on subsequent calls
                // We'll trust the hook's return value
                hasAccess = hookHasAccess
              }

              if (hasAccess) {
                accessibleItems.push(menuItem)
              }
            } catch (error) {
              console.error(`Error checking permission for ${menuItem.name}:`, error)
              // On error, don't include to be safe
            }
          }

          setAccessibleMenuItems(accessibleItems)

          // Set selected menu based on URL parameter or first accessible item
          if (tabParam && !initialTabSet) {
            const tabMenuItem = findMenuItemByParamValue(tabParam, accessibleItems)
            if (tabMenuItem) {
              setSelectedManu(tabMenuItem)
              setInitialTabSet(true)
            } else if (accessibleItems.length > 0) {
              setSelectedManu(accessibleItems[0])
            } else {
              setSelectedManu(null)
            }
          } else if (accessibleItems.length > 0) {
            // Sync with URL when tabParam changes
            const tabMenuItem = tabParam ? findMenuItemByParamValue(tabParam, accessibleItems) : null
            setSelectedManu(tabMenuItem || accessibleItems[0])
          } else {
            setSelectedManu(null)
          }
        } else {
          // Fallback for non-invitee or no permission checks
          setAccessibleMenuItems(allMenuItems)

          if (tabParam && !initialTabSet) {
            const tabMenuItem = findMenuItemByParamValue(tabParam, allMenuItems)
            if (tabMenuItem) {
              setSelectedManu(tabMenuItem)
              setInitialTabSet(true)
            } else {
              setSelectedManu(allMenuItems[0])
            }
          } else {
            // Sync with URL when tabParam changes
            const tabMenuItem = tabParam ? findMenuItemByParamValue(tabParam, allMenuItems) : null
            setSelectedManu(tabMenuItem || allMenuItems[0])
          }
        }
      } catch (error) {
        console.error('Error initializing menu:', error)
        // Fallback: show all items
        setAccessibleMenuItems(allMenuItems)
        setSelectedManu(allMenuItems.length > 0 ? allMenuItems[0] : null)
      } finally {
        setManuLoading(false)
      }
    }

    initializeMenu()
  }, [enablePermissionChecks, selectedUser?.id, permissionContext, tabParam])

  // Update when isInvitee or selectedUser changes
  useEffect(() => {
    if (enablePermissionChecks && isInvitee && selectedUser?.id && permissionContextAvailable) {
      const updatePermissions = async () => {
        try {
          const accessibleItems = []

          for (const menuItem of allMenuItems) {
            if (!menuItem.permissionKey) {
              accessibleItems.push(menuItem)
              continue
            }

            try {
              const hasAccess = await permissionContext.hasPermission(
                menuItem.permissionKey,
                selectedUser.id
              )

              if (hasAccess) {
                accessibleItems.push(menuItem)
              }
            } catch (error) {
              console.error(`Error checking permission for ${menuItem.name}:`, error)
            }
          }

          setAccessibleMenuItems(accessibleItems)

          // Update selected menu if current one is no longer accessible
          if (selectedManu && !accessibleItems.some(item => item.id === selectedManu.id)) {
            // Try to keep the same tab if possible, otherwise use first accessible
            const tabMenuItem = findMenuItemByParamValue(tabParam, accessibleItems)
            if (tabMenuItem) {
              setSelectedManu(tabMenuItem)
            } else if (accessibleItems.length > 0) {
              setSelectedManu(accessibleItems[0])
              // Update URL to reflect the new tab
              if (accessibleItems[0]?.paramValue) {
                updateUrlWithTab(accessibleItems[0].paramValue)
              }
            } else {
              setSelectedManu(null)
              updateUrlWithTab(null)
            }
          }
        } catch (error) {
          console.error('Error updating permissions:', error)
        }
      }

      updatePermissions()
    }
  }, [isInvitee, selectedUser?.id, permissionContextAvailable])

  console.log('Permission checks enabled:', enablePermissionChecks)

  // Current menu item's permission key for content protection
  const currentMenuItem = accessibleMenuItems.find(item => item?.name === selectedManu?.name)
  const currentPermissionKey = currentMenuItem?.permissionKey

  // Check if logged-in user is Admin
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    try {
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        setIsAdmin(userData.user?.userRole === 'Admin')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }, [])

  // Safe permission check for content area
  const [hasCurrentPermission, isCheckingCurrentPermission] = useHasPermission(
    enablePermissionChecks && isInvitee && currentPermissionKey ? currentPermissionKey : '',
    enablePermissionChecks && isInvitee ? selectedUser?.id : null
  )

  // Agency users (non-Invitee) and non-agency contexts have full access
  const effectiveHasPermission = (enablePermissionChecks && isInvitee) ? hasCurrentPermission : true
  const effectiveIsChecking = (enablePermissionChecks && isInvitee) ? isCheckingCurrentPermission : false

  // Auto-switch to first accessible menu if current menu is not accessible
  useEffect(() => {
    if (enablePermissionChecks && isInvitee && !effectiveIsChecking && currentPermissionKey &&
      !effectiveHasPermission && selectedUser?.id && permissionContextAvailable &&
      selectedManu && accessibleMenuItems.length > 0) {
      // Account (profile) is always considered accessible when the profile button is shown
      const isAccountTab = selectedManu.id === accountMenu.id || selectedManu.paramValue === 'account'
      const isCurrentMenuAccessible = isAccountTab || accessibleMenuItems.some(item => item.id === selectedManu.id)

      if (!isCurrentMenuAccessible && accessibleMenuItems.length > 0) {
        setSelectedManu(accessibleMenuItems[0])
        // Update URL to reflect the new tab
        if (accessibleMenuItems[0]?.paramValue) {
          updateUrlWithTab(accessibleMenuItems[0].paramValue)
        }
      }
    }
  }, [enablePermissionChecks, isInvitee, effectiveIsChecking, currentPermissionKey,
    effectiveHasPermission, selectedUser?.id, permissionContextAvailable,
    selectedManu, accessibleMenuItems])

  const [showAddMinutesModal, setShowAddMinutesModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')
  const [minutes, setMinutes] = useState('')
  const [showSnackMessage, setShowSnackMessage] = useState(null)
  const [loading, setloading] = useState(false)
  const [delLoader, setDelLoader] = useState(false)
  const [showDelConfirmationPopup, setShowDelConfirmationPopup] = useState(false)
  const [pauseLoader, setpauseLoader] = useState(false)
  const [resetTrailLoader, setResetTrailLoader] = useState(false)
  const [showPauseConfirmationPopup, setShowPauseConfirmationPopup] = useState(false)
  const [user, setUser] = useState(null)
  const [showResetTrialPopup, setShowResetTrialPopup] = useState(false)
  const [pauseToggleBtn, setPauseToggleBtn] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showActivityLogs, setShowActivityLogs] = useState(false)

  useEffect(() => {
    if (selectedUser?.profile_status === 'paused') {
      setPauseToggleBtn(true)
    } else if (selectedUser?.profile_status === 'active') {
      setPauseToggleBtn(false)
    }
  }, [selectedUser])

  useEffect(() => {
    const getData = async () => {
      let d = await AdminGetProfileDetails(selectedUser.id)

      if (d) {
        setUser(d)
      }
    }

    getData()
  }, [selectedUser])

  // Listen for refresh event from AdminAgentX when agent is created
  useEffect(() => {
    const handleRefreshUser = async (event) => {
      if (event.detail?.userId === selectedUser?.id) {
        try {
          const refreshedData = await AdminGetProfileDetails(selectedUser.id)
          if (refreshedData) {
            setUser(refreshedData)
          }
        } catch (error) {
          console.error('Error refreshing user profile:', error)
        }
      }
    }

    window.addEventListener('refreshSelectedUser', handleRefreshUser)

    return () => {
      window.removeEventListener('refreshSelectedUser', handleRefreshUser)
    }
  }, [selectedUser])

  // Helper function to check if user is admin or agency
  const isAdminOrAgency = () => {
    if (typeof window === 'undefined') return false
    try {
      const userData = localStorage.getItem('User')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
        const userType = parsedUser?.user?.userType || parsedUser?.userType
        return userRole === 'Admin' || userType === 'admin' || userRole === 'Agency'
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
    return false
  }

  // Store tab state when selected (only for admin/agency users)
  const storeTabState = (tabName) => {
    if (!isAdminOrAgency()) return

    try {
      const existingData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
      let stateObject = existingData ? JSON.parse(existingData) : {}

      if (!stateObject.restoreState) {
        stateObject.restoreState = {}
      }

      stateObject.restoreState.selectedTabName = tabName

      localStorage.setItem(
        PersistanceKeys.isFromAdminOrAgency,
        JSON.stringify(stateObject)
      )
    } catch (error) {
      console.error('Error storing tab state:', error)
    }
  }

  const handleManuClick = (item) => {
    if (item.paramValue === 'viewDetails') {
      setShowActivityLogs(true)
      return
    }
    console.log('item', item)
    setSelectedManu(item)
    storeTabState(item.name)

    // Update URL with the selected tab
    if (item.paramValue) {
      updateUrlWithTab(item.paramValue)
    }
  }

  const handleAddMinutes = async () => {
    setloading(true)
    try {
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)

        let path = Apis.addMinutes

        let apidata = {
          userId: selectedUser.id,
          minutes: minutes,
        }

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            setShowSnackMessage(response.data.messag)
            setShowAddMinutesModal(false)
          } else {
            setShowSnackMessage(response.data.message)
          }
        }
      }
    } catch (e) {
      console.error('Error adding minutes:', e)
    } finally {
      setloading(false)
    }
  }

  const handleDeleteUser = async () => {
    setDelLoader(true)
    try {
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)

        let path = Apis.deleteProfile

        let apidata = {
          userId: selectedUser.id,
        }

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            setShowDeleteModal(false)
            setDelLoader(false)
            const successMessage = response.data.message || 'Profile deleted successfully'
            setShowSnackMessage(successMessage)

            setTimeout(() => {
              if (handleDel) {
                handleDel()
              }
              if (handleClose) {
                handleClose()
              }
            }, 3000)
          } else {
            const errorMessage = response.data.message || 'Failed to delete profile'
            setShowSnackMessage(errorMessage)
            setDelLoader(false)
          }
        }
      }
    } catch (e) {
      console.error('Error deleting user:', e)
    } finally {
      setDelLoader(false)
    }
  }

  const handlePause = async () => {
    setpauseLoader(true)
    try {
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        let apidata = {
          userId: selectedUser.id,
        }

        const response = await axios.post(Apis.pauseProfile, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
            'Content-Type': 'application/json',
          },
        })
        if (response) {
          if (response.data.status === true) {
            selectedUser.profile_status = 'paused'
            setShowSnackMessage(response.data.message)
            setpauseLoader(false)
            setShowPauseConfirmationPopup(false)
            handlePauseUser()
          }
        }
      }
    } catch (e) {
      setpauseLoader(false)
      console.error('Error occured in pause unpause api is', e)
    }
  }

  const handleResetTrail = async () => {
    if (!selectedDate) {
      return
    }
    setResetTrailLoader(true)
    try {
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        let apidata = {
          userId: selectedUser.id,
          trialEndDate: selectedDate,
        }

        const response = await axios.post(Apis.resetTrail, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
            'Content-Type': 'application/json',
          },
        })
        if (response) {
          if (response.data.status === true) {
            selectedUser.profile_status = 'active'
            setShowSnackMessage(response.data.message)
            setResetTrailLoader(false)
            setShowResetTrialPopup(false)
          }
        }
      }
    } catch (e) {
      setResetTrailLoader(false)
      console.error('Error occured in reset trail api is', e)
    }
  }

  const logoBranding = () => {
    return (
      <div className="w-full flex flex-col gap-2 pt-4">
        {user && (user?.userRole === "AgencySubAccount" || user?.userRole === "Invitee") && user?.agencyBranding && !user.agencyBranding.logoUrl && user.agencyBranding.companyName ? (
          <div className="w-full text-left pl-6" style={{ marginLeft: "-8px" }}>
            <div className="text-lg font-bold text-black truncate">
              {user.agencyBranding.companyName}
            </div>
          </div>
        ) : (
          <div className="flex justify-start ">
            <Image
              src={user?.agencyBranding?.logoUrl}
              alt="logo"
              height={40}
              width={140}
              style={{ objectFit: 'contain', maxHeight: '40px', maxWidth: '140px' }}
              unoptimized={true}
            />
          </div>
        )}
      </div>
    )
  }

  // Show loading until menu is ready
  if (manuLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
      </div>
    )
  }

  // Don't render if no accessible menu items
  if (accessibleMenuItems.length === 0 && enablePermissionChecks) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="text-lg font-semibold text-foreground mb-2">No Access</div>
        <p className="text-sm text-muted-foreground">
          You do not have permission to access any menu items.
        </p>
      </div>
    )
  }

  return (
    <div className={`w-full flex flex-col ${(isAgencyView || from === "admin") ? 'h-[88svh]' : 'h-[100svh]'} items-center justify-center overflow-y-auto`}>
      <AgentSelectSnackMessage
        isVisible={showSnackMessage != null && showSnackMessage !== ''}
        hide={() => {
          console.log('Hiding snack message')
          setShowSnackMessage(null)
        }}
        type={SnackbarTypes.Success}
        message={showSnackMessage}
      />
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div
          style={{ alignSelf: 'center' }}
          className={`w-full overflow-hidden h-full items-center justify-center`}
        >
          {!enablePermissionChecks && (
            <div className="flex flex-row items-center justify-end w-full px-4 pt-2 relative" style={{ zIndex: 10 }}>
              <div className="flex flex-row items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="outline-none hover:opacity-80 transition-opacity p-2"
                      aria-label="More options"
                    >
                      {pauseLoader ? (
                        <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
                      ) : (
                        <Image
                          src="/svgIcons/threeDotsIcon.svg"
                          alt="More options"
                          width={24}
                          height={24}
                        />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[1500] bg-white p-2 rounded-lg" style={{ zIndex: 1500 }}>
                    <DropdownMenuItem
                      onClick={() => {
                        setShowPauseConfirmationPopup(true)
                      }}
                      className="cursor-pointer"
                    >
                      {user?.profile_status === 'paused' ? 'Reinstate' : 'Pause'}
                    </DropdownMenuItem>

                    {isAdmin && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setShowAddMinutesModal(true)
                          }}
                          className="cursor-pointer"
                        >
                          Add Credits
                        </DropdownMenuItem>

                        {selectedUser.isTrial && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setShowResetTrialPopup(true)
                              }}
                              className="cursor-pointer"
                            >
                              Reset Trial
                            </DropdownMenuItem>
                          </>
                        )}
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setShowDeleteModal(true)
                      }}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {
                  !agencyUser && (
                    <CloseBtn onClick={handleClose} />
                  )}

                {showResetTrialPopup && (
                  <ResetTrial
                    showConfirmationPopup={showResetTrialPopup}
                    handleClose={() => setShowResetTrialPopup(false)}
                    onContinue={handleResetTrail}
                    loader={resetTrailLoader}
                    selectedDate={selectedDate}
                    setSelectedData={setSelectedDate}
                  />
                )}

                {showPauseConfirmationPopup && (
                  <DelAdminUser
                    showPauseModal={showPauseConfirmationPopup}
                    handleClosePauseModal={() => {
                      setShowPauseConfirmationPopup(false)
                    }}
                    handlePaueUser={handlePause}
                    pauseLoader={pauseLoader}
                    selectedUser={user}
                  />
                )}
              </div>
            </div>
          )}
          <div className="flex flex-row items-start w-full h-full" style={{ backgroundColor: '' }}>
            <div
              className={`flex flex-shrink-0 flex-col items-start justify-start w-[250px] p-px gap-1 text-[14px] ${!enablePermissionChecks ? "h-[100%]" : "h-[100svh]"} ${!enablePermissionChecks && '-mt-10'}`}
              style={{
                borderRight: '1px solid #00000010',
                backgroundColor: 'white',
              }}
            >

              {agencyUser ? (
                <div className="flex flex-row items-center justify-start w-full h-[65px] flex-shrink-0 p-3">
                  <AppLogo height={29} width={122} />
                </div>
              ) : (
                <div className={`flex flex-row gap-2 items-center justify-start w-full h-[65px] flex-shrink-0 p-3`}>
                  <div className="flex h-[30px] w-[30px] rounded-full items-center justify-center bg-black text-white">
                    {selectedUser.name[0]}
                  </div>
                  <h4>{selectedUser.name}</h4>

                  {(
                    <button
                      style={{
                        pointerEvents: 'auto',
                        zIndex: 10,
                      }}
                      onClick={() => {
                        console.log('selectedUser.id', selectedUser.id)
                        if (selectedUser?.id) {
                          let url = ''
                          if (from === 'admin') {
                            url = `/admin/users?userId=${selectedUser.id}&enablePermissionChecks=true`
                          } else if (from === 'subaccount') {
                            url = `/agency/users?userId=${selectedUser.id}&enablePermissionChecks=true`
                          }
                          let user = JSON.stringify(selectedUser)
                          localStorage.setItem("IsExpanded", user)
                          window.open(url, '_blank')

                        }
                      }}
                    >
                      <Image
                        src={'/svgIcons/arrowboxIcon.svg'}
                        height={20}
                        width={20}
                        alt="*"
                      />
                    </button>
                  )}
                </div>
              )}

              {/* Menu Items - Only show accessible items (update sidebar: sliding pill + nav item styles); flex-1 min-h-0 so account block stays at bottom */}
              <div
                ref={navLinksContainerRef}
                className={`w-full flex flex-col items-start gap-0.5 p-2 text-[15px] font-normal relative flex-1 min-h-0 ${enablePermissionChecks ? 'overflow-y-auto max-h-[85vh]' : ''}`}
                onMouseLeave={() => setHoveredNavIndex(null)}
              >
                {navPillStyle && (
                  <div
                    aria-hidden
                    className="pointer-events-none rounded-lg"
                    style={{
                      position: 'absolute',
                      top: navPillStyle.top,
                      left: navPillStyle.left,
                      width: navPillStyle.width,
                      height: navPillStyle.height,
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 8,
                      zIndex: 0,
                      transition: 'top 0.2s ease, left 0.2s ease, width 0.2s ease, height 0.2s ease',
                    }}
                  />
                )}
                {accessibleMenuItems.map((item, index) => {
                  const isSelected = selectedManu?.id === item.id
                  return (
                    <div
                      key={item.id}
                      className="w-full"
                      ref={(el) => { navLinkItemRefs.current[index] = el }}
                      onMouseEnter={() => setHoveredNavIndex(index)}
                      style={{ position: 'relative', zIndex: 1 }}
                    >
                      <button
                        type="button"
                        onClick={() => handleManuClick(item)}
                        className={`w-full min-w-0 flex flex-row gap-[12px] items-center h-10 px-3 rounded-lg transition-transform duration-150 ease-out active:scale-[0.98] m-0.5 ${isSelected ? 'bg-brand-primary/5' : 'bg-transparent'}`}
                      >
                        {isSelected ? (
                          <div
                            className="text-brand-primary"
                            style={{
                              width: 18,
                              height: 18,
                              backgroundColor: 'hsl(var(--brand-primary))',
                              maskImage: `url(${item.selectedImage})`,
                              maskSize: 'contain',
                              maskRepeat: 'no-repeat',
                              maskPosition: 'center',
                              WebkitMaskImage: `url(${item.selectedImage})`,
                              WebkitMaskSize: 'contain',
                              WebkitMaskRepeat: 'no-repeat',
                              WebkitMaskPosition: 'center',
                            }}
                          />
                        ) : (
                          <Image
                            src={item.unSelectedImage}
                            height={18}
                            width={18}
                            alt=""
                            className="opacity-80"
                          />
                        )}
                        <span className={`flex-1 min-w-0 text-left truncate ${isSelected ? 'text-brand-primary' : 'text-black/80'}`}>
                          {item.name}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>

              {(from === "admin" || from === "subaccount" || enablePermissionChecks) && (
               <div
                onClick={() => {
                  console.log('clicked')
                  handleManuClick(accountMenu)
                }}
                className="w-full flex flex-row items-start gap-3 py-2 px-2 truncate outline-none text-start no-underline hover:no-underline cursor-pointer text-[14px] flex-shrink-0 border-t border-[#00000010]"
                style={{
                  textOverflow: "ellipsis",
                  textDecoration: "none",
                }}
              >
                {user?.thumb_profile_image ? (
                  <img
                    src={user?.thumb_profile_image}
                    alt="*"
                    style={{
                      objectFit: "fill",
                      height: "34px",
                      width: "34px",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <div className="h-[32px] flex-shrink-0 w-[32px] rounded-full bg-black text-white flex flex-row items-center justify-center">
                    {user?.name.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div >
                  <div className="flex flex-row items-center gap-2">
                    <div
                      className="truncate"
                      style={{
                        fontSize: 15,
                        fontWeight: "500",
                        color: "black",
                      }}
                    >
                      {(() => {
                        const name = user?.name?.split(" ")[0] || "";
                        return name.length > 10 ? `${name.slice(0, 7)}...` : name;
                      })()}
                    </div>
                    <div className="text-xs font-medium text-brand-primary">
                      {checkTrialDays(selectedUser) ? `${checkTrialDays(selectedUser)}` : ""}
                    </div>
                  </div>
                  <div
                    className="truncate w-[120px]"
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: "#15151560",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.email}
                  </div>
                </div>
              </div> 
              )}

              
            </div>

            <div
              className={`flex flex-col items-center justify-start pt-2 px-4 h-[100vh] overflow-auto w-10/12`}
            >
              <div
                className={`flex flex-col h-full ${(selectedManu?.name == 'Leads' || selectedManu?.name == 'Account') ? 'items-stretch' : 'items-center justify-center'} ${enablePermissionChecks ? 'max-h-[100vh]' : 'h-[76vh]'} ${(selectedManu?.name == 'Leads' || selectedManu?.name == 'Account') ? 'overflow-hidden' : 'overflow-auto'} w-full`}
                id={selectedManu?.name == 'Leads' ? 'adminLeadsParentContainer' : undefined}
                style={(selectedManu?.name == 'Leads' || selectedManu?.name == 'Account') ? { overflow: 'hidden', maxHeight: enablePermissionChecks ? '100vh' : '100vh' } : {}}
              >
                {/* Check permission before rendering content when permission checks enabled */}
                {enablePermissionChecks && isInvitee && currentPermissionKey && !effectiveIsChecking && !effectiveHasPermission ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
                    <p className="text-sm text-muted-foreground">
                      You do not have permission to access {selectedManu?.name}.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Required permission: {currentPermissionKey}
                    </p>
                  </div>
                ) : !selectedManu ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                      Select a menu item to get started
                    </p>
                  </div>
                ) : selectedManu.name == 'Leads' ? (
                  <AdminLeads1
                    selectedUser={selectedUser}
                    enablePermissionChecks={enablePermissionChecks}
                  />
                ) : selectedManu.name == 'Pipeline' ? (
                  <AdminPipeline1 selectedUser={selectedUser} enablePermissionChecks={enablePermissionChecks} />
                ) : selectedManu.name == 'Agents' ? (
                  <AdminAgentX
                    selectedUser={user && user}
                    from={from}
                    agencyUser={agencyUser}
                    enablePermissionChecks={enablePermissionChecks}
                  />
                ) : selectedManu.name == 'Activity' ? (
                  <AdminCallLogs selectedUser={selectedUser} />
                ) : selectedManu.name == 'Dashboard' ? (
                  <AdminDashboard selectedUser={selectedUser} agencyUser={enablePermissionChecks} enablePermissionChecks={enablePermissionChecks} />
                ) : selectedManu.name == 'Integration' ? (
                  <AdminIntegration selectedUser={selectedUser} agencyUser={enablePermissionChecks} />
                ) : selectedManu.name == 'Team' ? (
                  <AdminTeam selectedUser={selectedUser} agencyUser={enablePermissionChecks} />
                ) : selectedManu.name == 'Account' ? (
                  <AdminProfileData
                    selectedUser={selectedUser}
                    from={from}
                    agencyUser={enablePermissionChecks}
                    handleDel={handleDel}
                    handlePauseUser={handlePauseUser}
                    handleClose={handleClose}
                    isAgencyView={isAgencyView}
                    embedded
                  />
                ) : selectedManu.name == 'Messages (Beta)' ? (
                  <Messages selectedUser={selectedUser} agencyUser={enablePermissionChecks} from={from} />
                ) : (
                  'Coming soon...'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* View Details Button - Bottom Left{!hideViewDetails && (
        <div className="absolute bottom-4 left-4">
          <button
            className="text-white bg-brand-primary outline-none rounded-xl px-4 py-2 flex items-center gap-2"
            style={{ height: '40px' }}
            onClick={() => {
              setShowActivityLogs(true)
            }}
          >
            <Image
              src={'/svgIcons/selectedCallIcon.svg'}
              height={16}
              width={16}
              alt="*"
            />
            View Details
          </button>
        </div>
      )} */}

      {/* Code to del user */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
        }}
        BackdropProps={{
          timeout: 200,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
        >
          <div style={{ width: '100%' }}>
            <div
              className="max-h-[60vh] overflow-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              <div
                style={{
                  width: '100%',
                  direction: 'row',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: '500', fontSize: 17 }}>
                  Delete User
                </div>
                <div
                  style={{
                    direction: 'row',
                    display: 'flex',
                    justifyContent: 'end',
                  }}
                >
                  <CloseBtn
                    onClick={() => {
                      setShowDeleteModal(false)
                    }}
                  />
                </div>
              </div>

              <div className="mt-6" style={{ fontWeight: '700', fontSize: 22 }}>
                Are you sure you want to delete user?
              </div>
            </div>

            <div className="flex flex-row items-center gap-4 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-1/2  bg-transparent"
              >
                Cancel
              </button>
              <div className="w-1/2">
                {delLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                ) : (
                  <button
                    className="bg-red outline-none"
                    style={{
                      color: 'white',
                      height: '50px',
                      borderRadius: '10px',
                      width: '100%',
                      fontWeight: 600,
                      fontSize: '20',
                    }}
                    onClick={handleDeleteUser}
                  >
                    Yes! Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
      {/* Add minutes modal  */}
      <Modal
        open={showAddMinutesModal}
        onClose={() => {
          setShowAddMinutesModal(false)
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-7/12 md:w-5/12 lg:w-3/12 p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
        >
          <div className="w-full flex flex-row items-center justify-between">
            <div style={{ fontSize: 16, fontWeight: '500' }}>Add Credits</div>

            <CloseBtn
              onClick={() => {
                setShowAddMinutesModal(false)
              }}
            />
          </div>

          <div className="w-full flex flex-col items-start gap-3">
            <div style={{ fontSize: 16, fontWeight: '500', marginTop: 30 }}>
              Credits
            </div>

            <input
              className={`w-full border-gray-300 rounded p-2 outline-none focus:outline-none focus:ring-0`}
              value={minutes}
              placeholder="Enter credits"
              onChange={(event) => {
                setMinutes(event.target.value)
              }}
              type="number"
            />

            {loading ? (
              <CircularProgress size={15} sx={{ color: 'hsl(var(--brand-primary))' }} />
            ) : (
              <button
                className="w-full outline-none bg-brand-primary h-[52px] text-white rounded-lg"
                onClick={handleAddMinutes}
              >
                Add
              </button>
            )}
          </div>
        </Box>
      </Modal>
      {/* User Activity Logs Modal */}
      <UserActivityLogs
        open={showActivityLogs}
        onClose={() => setShowActivityLogs(false)}
        userId={selectedUser?.id}
        userName={selectedUser?.name}
      />
    </div>
  );
}

export default SelectedUserDetails

const styles = {
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}