import { Box, CircularProgress, Modal } from '@mui/material'
import { Cross } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

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
import { useHasPermission } from '@/contexts/PermissionContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function SelectedUserDetails({
  selectedUser,
  handleDel,
  from = 'admin',
  handlePauseUser,
  agencyUser = false,
  hideViewDetails = false,
  handleClose,
}) {

  // Component to check permission for a menu item
  function MenuItemWithPermission({ item, children, contextUserId, agencyUser }) {
    // If not viewing from agency context, show all items
    if (!agencyUser) {
      return <>{children}</>
    }

    // Check if logged-in user is an Invitee
    const [isInvitee, setIsInvitee] = useState(false)
    useEffect(() => {
      try {
        const localData = localStorage.getItem('User')
        if (localData) {
          const userData = JSON.parse(localData)
          setIsInvitee(userData.user?.userRole === 'Invitee')
        }
      } catch (error) {
        console.error('Error checking user role:', error)
      }
    }, [])

    // Only check permissions for Invitee users; Agency users have full access
    const [hasAccess, isLoading] = useHasPermission(
      isInvitee && item.permissionKey ? item.permissionKey : '',
      isInvitee && contextUserId ? contextUserId : null
    )

    // Agency users (non-Invitee) have full access
    const effectiveHasAccess = isInvitee ? hasAccess : true
    const effectiveIsLoading = isInvitee ? isLoading : false

    // Don't render if no permission (only for Invitee users)
    if (effectiveIsLoading) {
      return null // Hide while loading
    }

    if (!effectiveHasAccess) {
      return null // Hide if no permission (only applies to Invitee)
    }

    return <>{children}</>
  }

  const allMenuItems = [
    {
      id: 1,
      name: 'Dashboard',
      selectedImage: '/svgIcons/selectdDashboardIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedDashboardIcon.svg',
      permissionKey: 'subaccount.dashboard.view', // Subaccount permission
    },
    {
      id: 2,
      name: 'Agents',
      selectedImage: '/svgIcons/selectedAgentXIcon.svg',
      unSelectedImage: '/svgIcons/agentXIcon.svg',
      permissionKey: 'subaccount.agents.view', // Subaccount permission
    },
    {
      id: 3,
      name: 'Leads',
      selectedImage: '/svgIcons/selectedLeadsIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedLeadsIcon.svg',
      permissionKey: 'subaccount.leads.manage', // Subaccount permission
    },
    {
      id: 5,
      name: 'Pipeline',
      selectedImage: '/svgIcons/selectedPiplineIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedPipelineIcon.svg',
      permissionKey: 'subaccount.pipelines.manage', // Subaccount permission
    },
    {
      id: 9,
      name: 'Messages (Beta)',
      selectedImage: '/messaging/icons_chat_menu.svg',
      unSelectedImage: '/messaging/icons_chat_menu.svg',
      permissionKey: 'subaccount.messages.manage', // Subaccount permission
    },
    {
      id: 4,
      name: 'Activity',
      selectedImage: '/otherAssets/selectedActivityLog.png',
      unSelectedImage: '/otherAssets/activityLog.png',
      permissionKey: 'subaccount.activity.view', // Subaccount permission
    },
    {
      id: 6,
      name: 'Integration',
      selectedImage: '/svgIcons/selectedIntegration.svg',
      unSelectedImage: '/svgIcons/unSelectedIntegrationIcon.svg',
      permissionKey: 'subaccount.integrations.manage', // Subaccount permission
    },
    {
      id: 7,
      name: 'Team',
      selectedImage: '/svgIcons/selectedTeam.svg',
      unSelectedImage: '/svgIcons/unSelectedTeamIcon.svg',
      permissionKey: 'subaccount.teams.manage', // Subaccount permission
    },
  ]

  // Account menu item (not included in allMenuItems as it's conditional)
  const accountMenu = {
    id: 8,
    name: 'Account',
    selectedImage: '/svgIcons/selectedProfileCircle.svg',
    unSelectedImage: '/svgIcons/unSelectedProfileIcon.svg',
  }

  // Filter menu items based on permissions when viewing from agency
  const manuBar = React.useMemo(() => {
    // If not viewing from agency context, show all items
    if (!agencyUser || !selectedUser?.id) {
      const menuItems = [...allMenuItems]
      // Add account menu for non-agency users
      if (!agencyUser) {
        menuItems.push(accountMenu)
      }
      return menuItems
    }

    // For agency context, we'll filter in the render using MenuItemWithPermission
    // This allows async permission checks
    return allMenuItems
  }, [agencyUser, selectedUser?.id])

  console.log('Status of agency user', agencyUser)

  // Initialize selectedManu - ensure it's a valid menu item
  const [selectedManu, setSelectedManu] = useState(() => {
    // If viewing from agency and we have a stored tab, try to restore it
    if (agencyUser && selectedUser?.id) {
      try {
        const storedState = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
        if (storedState) {
          const stateObject = JSON.parse(storedState)
          const storedTabName = stateObject?.tabName
          if (storedTabName) {
            const storedItem = allMenuItems.find(item => item.name === storedTabName)
            if (storedItem) {
              return storedItem
            }
          }
        }
      } catch (error) {
        console.error('Error restoring tab state:', error)
      }
    }
    return allMenuItems[0] // Default to Dashboard
  })

  // Get the current menu item's permission key for content protection
  const currentMenuItem = allMenuItems.find(item => item.name === selectedManu?.name)
  const currentPermissionKey = currentMenuItem?.permissionKey

  // Check if logged-in user is an Invitee (team member)
  const [isInvitee, setIsInvitee] = useState(false)
  // Check if logged-in user is Admin
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    try {
      const localData = localStorage.getItem('User')
      if (localData) {
        const userData = JSON.parse(localData)
        setIsInvitee(userData.user?.userRole === 'Invitee')
        setIsAdmin(userData.user?.userRole === 'Admin')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }, [])

  // Safe permission check - only use permission hook when PermissionProvider is available
  // For admin users viewing normal AgentX users (not agency context), skip permission checks
  const [hasCurrentPermission, isCheckingCurrentPermission] = useHasPermission(
    // Only check permissions if: viewing from agency context AND user is Invitee AND permission key exists
    agencyUser && isInvitee && currentPermissionKey ? currentPermissionKey : '',
    agencyUser && isInvitee ? selectedUser?.id : null
  )

  // Agency users (non-Invitee) and non-agency contexts have full access
  // If PermissionProvider is not available, default to true (allow access)
  const effectiveHasPermission = (agencyUser && isInvitee) ? hasCurrentPermission : true
  const effectiveIsChecking = (agencyUser && isInvitee) ? isCheckingCurrentPermission : false

  // #region agent log
  useEffect(() => {
    if (agencyUser && selectedUser?.id) {
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'SelectedUserDetails.js:207', message: 'Permission check for subaccount content', data: { agencyUser, selectedUserId: selectedUser?.id, currentMenuItemName: selectedManu?.name, currentPermissionKey, isInvitee, hasCurrentPermission, isCheckingCurrentPermission, effectiveHasPermission, effectiveIsChecking, willBlockAccess: agencyUser && isInvitee && currentPermissionKey && !effectiveIsChecking && !effectiveHasPermission }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'I' }) }).catch(() => { });
    }
  }, [agencyUser, selectedUser?.id, currentPermissionKey, hasCurrentPermission, isCheckingCurrentPermission, selectedManu?.name, isInvitee, effectiveHasPermission, effectiveIsChecking])
  // #endregion
  const [showAddMinutesModal, setShowAddMinutesModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState('')
  const [minutes, setMinutes] = useState('')
  const [showSnackMessage, setShowSnackMessage] = useState(null)
  const [loading, setloading] = useState(false)
  const [delLoader, setDelLoader] = useState(false)
  //del user
  const [showDelConfirmationPopup, setShowDelConfirmationPopup] =
    useState(false)
  const [pauseLoader, setpauseLoader] = useState(false)
  const [resetTrailLoader, setResetTrailLoader] = useState(false)
  //pause confirmations
  const [showPauseConfirmationPopup, setShowPauseConfirmationPopup] =
    useState(false)
  const [user, setUser] = useState(null)
  //reset trial
  const [showResetTrialPopup, setShowResetTrialPopup] = useState(false)

  //pauseToggleBtn
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

      // console.log('selectedUser after api', selectedUser)
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
            // Update selectedUser to trigger re-render of child components
            // This will update the usage count in AdminAgentX
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

  // Restore tab state when component mounts (only for admin/agency users)
  useEffect(() => {
    if (!isAdminOrAgency()) return

    try {
      const storedData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
      if (storedData) {
        const stateObject = JSON.parse(storedData)
        if (stateObject?.restoreState?.selectedTabName) {
          const tabName = stateObject.restoreState.selectedTabName
          const foundTab = manuBar.find((tab) => tab.name === tabName)
          if (foundTab) {
            setSelectedManu(foundTab)
          }
        }
      }
    } catch (error) {
      console.error('Error restoring tab state:', error)
    }
  }, []) // Run once on mount

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
    console.log('item', item)

    // When viewing from agency, check permission before allowing navigation
    if (agencyUser && selectedUser?.id) {
      const menuItem = allMenuItems.find(m => m.id === item.id)
      // Account menu doesn't have permissionKey, so allow it
      if (menuItem?.permissionKey || item.name === 'Account') {
        // Permission check will be done by MenuItemWithPermission component
        // If user doesn't have permission, the menu item won't be rendered
        // But we should still check here as a safety measure
        setSelectedManu(item)
        storeTabState(item.name)
      } else {
        setSelectedManu(item)
        storeTabState(item.name)
      }
    } else {
      setSelectedManu(item)
      // Store tab state for restoration (only for admin/agency users)
      storeTabState(item.name)
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
            //console.log
            setShowSnackMessage(response.data.messag)
            setShowAddMinutesModal(false)
          } else {
            //console.log
            setShowSnackMessage(response.data.message)
          }
        }
      }
    } catch (e) {
      //console.log
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
        //console.log

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          if (response.data.status === true) {
            setShowDeleteModal(false)
            setDelLoader(false)
            // Set snack message first
            const successMessage = response.data.message || 'Profile deleted successfully'
            console.log('Setting snack message:', successMessage)
            setShowSnackMessage(successMessage)

            // Delay closing modal and removing from list to allow snack message to show
            setTimeout(() => {
              // Close modal and remove user from list
              if (handleDel) {
                handleDel()
              }
              // Also close the modal if handleClose is provided
              if (handleClose) {
                handleClose()
              }
            }, 3000) // 3 second delay to show snack message
          } else {
            const errorMessage = response.data.message || 'Failed to delete profile'
            console.log('Setting error snack message:', errorMessage)
            setShowSnackMessage(errorMessage)
            setDelLoader(false)
          }
        }
      }
    } catch (e) {
      //console.log
    } finally {
      setDelLoader(false)
    }
  }

  const handlePause = async () => {
    //profile_status
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
            handlePauseUser()
            setpauseLoader(false)
            setShowPauseConfirmationPopup(false)
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
    //profile_status
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
        {/* Show company name if no logo for subaccount users */}
        {user && (user?.userRole === "AgencySubAccount" || user?.userRole === "Invitee") && user?.agencyBranding && !user.agencyBranding.logoUrl && user.agencyBranding.companyName ? (
          <div className="w-full text-left pl-6" style={{ marginLeft: "-8px" }}>
            <div className="text-lg font-bold text-black truncate">
              {user.agencyBranding.companyName}
            </div>
          </div>
        ) : (
          /* AppLogo handles logo display based on hostname */
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

  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <AgentSelectSnackMessage
        isVisible={showSnackMessage != null && showSnackMessage !== ''}
        hide={() => {
          console.log('Hiding snack message')
          setShowSnackMessage(null)
        }}
        type={SnackbarTypes.Success}
        message={showSnackMessage}
      />
      <div className="flex flex-col items-center justify-center w-full">
        <div
          style={{ alignSelf: 'center' }}
          className={`w-full ${agencyUser ? 'h-[100svh] overflow-hidden' : 'h-[90vh]'} items-center justify-center`}
        >
          {/*
                        <div className='flex flex-row items-center justify-between w-full px-4 pt-2'>
                        </div>
                    */}

          {/* Action buttons with 3-dot menu */}
          {!agencyUser && (
            <div className="flex flex-row items-center justify-end w-full px-4 pt-2 relative" style={{ zIndex: 10 }}>
              <div className="flex flex-row items-center gap-4">
                {/* 3-dot menu for actions */}
                {
                  !agencyUser && from !== 'subaccount' && (
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
                      <DropdownMenuContent align="end" className="z-[1500]" style={{ zIndex: 1500 }}>
                        <DropdownMenuItem
                          onClick={() => {
                            setShowPauseConfirmationPopup(true)
                          }}
                          className="cursor-pointer"
                        >
                          {user?.profile_status === 'paused' ? 'Reinstate' : 'Pause'}
                        </DropdownMenuItem>

                        {/* Show Add Minutes and Reset Trial only for Admin users */}
                        {isAdmin && (
                          <>
                            <DropdownMenuItem
                              onClick={() => {
                                setShowAddMinutesModal(true)
                              }}
                              className="cursor-pointer"
                            >
                              Add Minutes
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
                  )}
                {/* Close button - always visible */}
                <CloseBtn onClick={handleClose} />

                {/* Modals */}
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
          <div className="flex flex-row items-start w-full  ">
            <div className={`flex border-r border-[#00000015] ${!agencyUser && '-mt-10'} flex-col items-start justify-start w-2/12 px-6  ${(from === "admin" || from === "subaccount") ? "" : "h-full"} ${agencyUser ? 'h-auto max-h-[85vh] overflow-y-auto' : 'h-auto'}`}>
              {agencyUser && (
              
                logoBranding()
              
              )}
              {
                !agencyUser && (

                <div className={`flex flex-row gap-2 items-center justify-start w-full pt-3 ${agencyUser ? 'pt-3' : ''}`}>


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
                          // Open a new tab with user ID as query param
                          let url = ''
                          if (from === 'admin') {
                            url = `/admin/users?userId=${selectedUser.id}&agencyUser=true`
                          } else if (from === 'subaccount') {
                            // url = `/agency/users?userId=${selectedUser.id}`
                            url = `/agency/users?userId=${selectedUser.id}&agencyUser=true`
                          }
                          // url = `admin/users?userId=${selectedUser.id}`
                          //console.log
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
                )
              }
              <div className='flex flex-col items-start justify-center gap-3 w-full pt-10 ${(from === "admin" || from === "subaccount") ? "":"h-full"}'>
                {manuBar.map((item) => (
                  <MenuItemWithPermission
                    key={item.id}
                    item={item}
                    contextUserId={agencyUser ? selectedUser?.id : null}
                    agencyUser={agencyUser}
                  >
                    <button
                      onClick={() => {
                        handleManuClick(item)
                      }}
                      className={`flex flex-row items-center gap-3 p-2 items-center 
                                          ${selectedManu.id == item.id && 'border-b-[2px] border-brand-primary'}`}
                    >
                      {selectedManu.id == item.id ? (
                        <div
                          style={{
                            width: 24,
                            height: 24,
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
                          height={24}
                          width={24}
                          alt="*"
                        />
                      )}

                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: selectedManu.id == item.id ? 'hsl(var(--brand-primary))' : '#000',
                          whiteSpace: 'nowrap',

                        }}
                      >
                        {item.name}
                      </div>
                    </button>
                  </MenuItemWithPermission>
                ))}
              </div>

              {agencyUser && (
                <div
                  onClick={() => {
                    console.log('clicked')
                    handleManuClick(accountMenu)
                    //set account info to the right side of the screen
                    // setAccountInfo(true)
                  }}
                  className="w-full flex flex-row items-start gap-3 py-2 truncate outline-none text-start  no-underline hover:no-underline cursor-pointer" //border border-[#00000015] rounded-[10px]
                  style={{
                    textOverflow: "ellipsis",
                    textDecoration: "none",
                    position: "absolute",
                    bottom: 8,

                  }}>
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
                          color: "",
                          // width: "100px",
                          color: "black",
                        }}
                      >
                        {/*user?.name?.split(" ")[0]*/}
                        {(() => {
                          const name = user?.name?.split(" ")[0] || "";
                          return name.length > 10 ? `${name.slice(0, 7)}...` : name;
                        })()}
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

                  {/* Socket Connection Status Indicator */}

                </div>
              )}
            </div>

            <div
              className={`flex flex-col items-center justify-center pt-2 px-4 ${agencyUser ? 'max-h-[85vh]' : 'h-[80vh]'} overflow-auto w-10/12`}
            >

              <div
                className={`flex flex-col ${selectedManu.name == 'Leads' ? 'items-stretch' : 'items-center justify-center'} ${agencyUser ? 'max-h-[85vh]' : 'h-[76vh]'} ${selectedManu.name == 'Leads' ? 'overflow-hidden' : 'overflow-auto'} w-full`}
                id={selectedManu.name == 'Leads' ? 'adminLeadsParentContainer' : undefined}
                style={selectedManu.name == 'Leads' ? { overflow: 'hidden', maxHeight: agencyUser ? '85vh' : '76vh' } : {}}
              >
                {/* Check permission before rendering content when viewing from agency */}
                {/* Only block if we're done checking AND permission is denied (for Invitee users only) */}
                {agencyUser && isInvitee && currentPermissionKey && !effectiveIsChecking && !effectiveHasPermission ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
                    <p className="text-sm text-muted-foreground">
                      You do not have permission to access {selectedManu.name}.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Required permission: {currentPermissionKey}
                    </p>
                  </div>
                ) : selectedManu.name == 'Leads' ? (
                  <AdminLeads1
                    selectedUser={selectedUser}
                    agencyUser={agencyUser}
                  />
                ) : selectedManu.name == 'Pipeline' ? (
                  <AdminPipeline1 selectedUser={selectedUser} />
                ) : selectedManu.name == 'Agents' ? (
                  <AdminAgentX
                    selectedUser={user && user}
                    from={from}
                    agencyUser={agencyUser}
                  />
                ) : selectedManu.name == 'Activity' ? (
                  <AdminCallLogs selectedUser={selectedUser} />
                ) : selectedManu.name == 'Dashboard' ? (
                  <AdminDashboard selectedUser={selectedUser} agencyUser={agencyUser} />
                ) : selectedManu.name == 'Integration' ? (
                  <AdminIntegration selectedUser={selectedUser} agencyUser={agencyUser}/>
                ) : selectedManu.name == 'Team' ? (
                  <AdminTeam selectedUser={selectedUser} agencyUser={agencyUser} />
                ) : selectedManu.name == 'Account' ? (
                  <AdminProfileData
                    selectedUser={selectedUser}
                    from={from}
                    agencyUser={agencyUser}
                    handleDel={handleDel}
                    handlePauseUser={handlePauseUser}
                    handleClose={handleClose}
                  />
                ) : selectedManu.name == 'Messages (Beta)' ? (
                  <Messages selectedUser={selectedUser} agencyUser={agencyUser} />
                ) : (
                  'Coming soon...'
                )
                  //""
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* View Details Button - Bottom Left */}
      {!hideViewDetails && (
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
      )}
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
            // //backdropFilter: "blur(20px)",
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
                {/* <div style={{ width: "20%" }} /> */}
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
                className="w-1/2"
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
                    className="mt-4 bg-red outline-none"
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
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="w-10/12 sm:w-7/12 md:w-5/12 lg:w-3/12 p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
        >
          <div className="w-full flex flex-row items-center justify-between">
            <div style={{ fontSize: 16, fontWeight: '500' }}>Add Minutes</div>

            <CloseBtn
              onClick={() => {
                setShowAddMinutesModal(false)
              }}
            />
          </div>

          <div className="w-full flex flex-col items-start gap-3">
            <div style={{ fontSize: 16, fontWeight: '500', marginTop: 30 }}>
              Minutes
            </div>

            <input
              className={`w-full border-gray-300 rounded p-2 outline-none focus:outline-none focus:ring-0`}
              value={minutes}
              placeholder="Enter minutes"
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
