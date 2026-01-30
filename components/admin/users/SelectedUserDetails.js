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
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

function SelectedUserDetails({
  selectedUser,
  handleDel,
  from = 'admin',
  handlePauseUser,
  agencyUser = false,
  hideViewDetails = false,
  handleClose,
}) {
  const manuBar = [
    {
      id: 1,
      name: 'Dashboard',
      selectedImage: '/svgIcons/selectdDashboardIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedDashboardIcon.svg',
    },
    {
      id: 2,
      name: 'Agents',
      selectedImage: '/svgIcons/selectedAgentXIcon.svg',
      unSelectedImage: '/svgIcons/agentXIcon.svg',
    },
    {
      id: 3,
      name: 'Leads',
      selectedImage: '/svgIcons/selectedLeadsIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedLeadsIcon.svg',
    },
    {
      id: 5,
      name: 'Pipeline',
      selectedImage: '/svgIcons/selectedPiplineIcon.svg',
      unSelectedImage: '/svgIcons/unSelectedPipelineIcon.svg',
    },
    {
      id: 9,
      name: 'Messages (Beta)',
      selectedImage: '/messaging/icons_chat_menu.svg',
      unSelectedImage: '/messaging/icons_chat_menu.svg',
    },
    {
      id: 4,
      name: 'Activity',
      selectedImage: '/otherAssets/selectedActivityLog.png',
      unSelectedImage: '/otherAssets/activityLog.png',
    },

    {
      id: 6,
      name: 'Integration',
      selectedImage: '/svgIcons/selectedIntegration.svg',
      unSelectedImage: '/svgIcons/unSelectedIntegrationIcon.svg',
    },
    {
      id: 7,
      name: 'Team',
      selectedImage: '/svgIcons/selectedTeam.svg',
      unSelectedImage: '/svgIcons/unSelectedTeamIcon.svg',
    },


  ]

  let accountMenu =
  {
    id: 8,
    name: 'Account',
    selectedImage: '/svgIcons/selectedProfileCircle.svg',
    unSelectedImage: '/svgIcons/unSelectedProfileIcon.svg',
  }

  // Always include Account (for admin it's in the menu; for agency/subaccount it's only at bottom left as pill)
  manuBar.push(accountMenu)

  const [selectedManu, setSelectedManu] = useState(manuBar[0])
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
    setSelectedManu(item)
    // Store tab state for restoration (only for admin/agency users)
    storeTabState(item.name)
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
            //console.log
            setShowSnackMessage(response.data.messag)
            setShowDeleteModal(false)
            handleDel()
          } else {
            //console.log
            setShowSnackMessage(response.data.message)
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

  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <AgentSelectSnackMessage
        isVisible={showSnackMessage != null ? true : false}
        hide={() => {
          setShowSnackMessage(null)
        }}
        type={SnackbarTypes.Success}
        message={showSnackMessage}
      />
      <div className={`flex flex-col w-full ${agencyUser ? 'items-stretch justify-start min-h-screen' : 'items-center justify-center'}`}>
        <div
          style={{ alignSelf: agencyUser ? 'stretch' : 'center' }}
          className={`w-full overflow-hidden ${!agencyUser ? 'h-[85vh]' : 'h-[95vh]'} ${agencyUser ? 'flex flex-col justify-start items-stretch' : 'items-center justify-center'}`}
        >
          {(
            <div className="flex flex-row items-center justify-end w-full px-4 pt-2 relative" style={{ zIndex: 10 }}>
              <div className="flex flex-row items-center gap-4">
                {from !== 'subaccount' && (
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
                <CloseBtn onClick={handleClose} />

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
          <div className={`flex flex-row items-stretch w-full ${agencyUser ? 'flex-1 min-h-0' : ''}`}>
            <div className={`flex border-r border-[#00000015] flex-col items-start justify-start w-2/12 px-6  ${(from === "admin" || from === "subaccount") ? "" : "h-full"} ${agencyUser ? "min-h-0 flex-1" : ""}`} style={agencyUser ? { maxHeight: '95vh' } : undefined}>

              {agencyUser ? (
                <div className="flex flex-row items-center justify-start w-full pt-0 pb-1 flex-shrink-0">
                  <AppLogo height={29} width={122} />
                </div>
              ) : (
                <div className={`flex flex-row gap-2 items-center justify-start w-full pt-3 `}>
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
                            url = `/admin/users?userId=${selectedUser.id}`
                          } else if (from === 'subaccount') {
                            url = `/agency/users?userId=${selectedUser.id}&agencyUser=true`
                          }
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

              {/* Menu Items - when agencyUser, exclude Account from list; flex-1 so profile pill is pushed to bottom */}
              <div className={`flex flex-col items-start gap-3 w-full ${agencyUser ? 'pt-4 flex-1 min-h-0 justify-start' : 'pt-10 justify-center'}`}>
                {(agencyUser ? manuBar.filter((item) => item.name !== 'Account') : manuBar).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleManuClick(item)}
                    className={`flex flex-row items-center gap-3 p-2 items-center 
                    ${selectedManu?.id == item.id && 'border-b-[2px] border-brand-primary'}`}
                  >
                    {selectedManu?.id == item.id ? (
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
                        color: selectedManu?.id == item.id ? 'hsl(var(--brand-primary))' : '#000',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>

              {/* Profile button at bottom left (agency/subaccount full view) - same as ProfileNav */}
              {agencyUser && (
                <div
                  className="w-full flex-shrink-0 pt-2 mt-auto"
                  style={{ borderTop: '1px solid #00000010' }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedManu(accountMenu)}
                    className="w-full flex flex-row items-start gap-3 px-0 py-2 truncate outline-none text-start text-left border-0 bg-transparent cursor-pointer"
                    style={{ textOverflow: 'ellipsis', textDecoration: 'none' }}
                  >
                    {user?.user?.thumb_profile_image ? (
                      <img
                        src={user.user.thumb_profile_image}
                        alt=""
                        style={{
                          objectFit: 'fill',
                          height: 34,
                          width: 34,
                          borderRadius: '50%',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div className="h-[34px] w-[34px] flex-shrink-0 rounded-full bg-black text-white flex flex-row items-center justify-center" style={{ fontSize: 14 }}>
                        {(user?.user?.name || selectedUser?.name || '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div
                        className="truncate"
                        style={{ fontSize: 15, fontWeight: 500, color: 'black' }}
                      >
                        {(user?.user?.name || selectedUser?.name || '').split(' ')[0]}
                      </div>
                      <div
                        className="truncate block"
                        style={{ fontSize: 12, fontWeight: 500, color: '#15151560', textOverflow: 'ellipsis' }}
                      >
                        {user?.user?.email || selectedUser?.email || ''}
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div
              className={`flex flex-col items-center justify-start pt-2 px-4  ${!agencyUser ? 'h-[75vh]' : 'h-[95vh]'} overflow-auto w-10/12`}
            >
              <div
                className={`flex flex-col h-full ${selectedManu?.name == 'Leads' ? 'items-stretch' : 'items-center justify-center'} h-[76vh] ${selectedManu?.name == 'Leads' ? 'overflow-hidden' : 'overflow-auto'} w-full`}
                id={selectedManu?.name == 'Leads' ? 'adminLeadsParentContainer' : undefined}
                style={selectedManu?.name == 'Leads' ? { overflow: 'hidden', maxHeight: '76vh' } : {}}
              >
                {!selectedManu ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">
                      Select a menu item to get started
                    </p>
                  </div>
                ) : selectedManu.name == 'Leads' ? (
                  <AdminLeads1
                    selectedUser={selectedUser}
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
                  <AdminIntegration selectedUser={selectedUser} agencyUser={agencyUser} />
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
                )}
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
