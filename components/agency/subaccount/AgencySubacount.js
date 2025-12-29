'use client'

import { Box, CircularProgress, Modal, Popover } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import SelectedUserDetails from '@/components/admin/users/SelectedUserDetails'
import LoaderAnimation from '@/components/animations/LoaderAnimation'
import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { copyAgencyOnboardingLink } from '@/components/constants/constants'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import DelAdminUser from '@/components/onboarding/extras/DelAdminUser'
import { TwilioWarning } from '@/components/onboarding/extras/StickyModals'
import TwillioWarning from '@/components/onboarding/extras/TwillioWarning'
import { useUser } from '@/hooks/redux-hooks'
import { convertSecondsToMinDuration } from '@/utilities/utility'
import { PersistanceKeys } from '@/constants/Constants'

import EditAgencyName from '../agencyExtras.js/EditAgencyName'
import { CheckStripe, convertTime } from '../agencyServices/CheckAgencyData'
import { formatFractional2 } from '../plan/AgencyUtilities'
import { AuthToken } from '../plan/AuthDetails'
import CreateSubAccountModal from './CreateSubAccountModal'
import { getMonthlyPlan, getXBarOptions } from './GetPlansList'
import InviteTeamModal from './InviteTeamModal'
import NewInviteTeamModal from './NewInviteTeamModal'
import SlideModal from './SlideModal'
import SubAccountFilters from './SubAccountFilters'
import ViewSubAccountPlans from './ViewSubAccountPlans'
import ViewSubAccountXBar from './ViewSubAccountXBar'

function AgencySubacount({ selectedAgency }) {
  const [subAccountList, setSubAccountsList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [initialLoader, setInitialLoader] = useState(false)
  const [moreDropdown, setmoreDropdown] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(false)
  const [agencyData, setAgencyData] = useState(null)
  const [twililoConectedStatus, setTwilioConnectedStatus] = useState(false)

  //code for invite team popup
  const [openInvitePopup, setOpenInvitePopup] = useState(false)
  //code for show plans
  const [showPlans, setShowPlans] = useState(false)
  //code for show XBar plans
  const [showXBarPlans, setShowXBarPlans] = useState(false)
  const [userData, setUserData] = useState(null)

  //snack msages
  const [showSnackMessage, setShowSnackMessage] = useState(null)
  const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success)
  //pause subAcc
  const [pauseLoader, setpauseLoader] = useState(false)
  const [showPauseConfirmationPopup, setShowPauseConfirmationPopup] =
    useState(false)
  //del subAcc
  const [delLoader, setDelLoader] = useState(false)
  const [showDelConfirmationPopup, setShowDelConfirmationPopup] =
    useState(false)
  const [rortingLoader, setRortingLoader] = useState(false)
  //variables for dropdown
  // const [accountAnchorel, setAccountAnchorel] = useState(null);
  // const openAccountDropDown = Boolean(accountAnchorel);
  // const accountId = accountAnchorel ? "accountAnchor" : undefined;

  // state variables for dropdown
  const [anchorEl, setAnchorEl] = useState(null)
  const [activeAccount, setActiveAccount] = useState(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false) // Boolean to control popover visibility

  //filter and search variable
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  //subaccount filters variables
  //balance spent
  const [minSpent, setMinSpent] = useState('')
  const [maxSpent, setMaxSpent] = useState('')
  const [maxBalance, setMaxBalance] = useState('')
  const [minBalance, setMinBalance] = useState('')
  //plan id
  const [selectPlanId, setSelectPlanId] = useState(null)
  //account status
  const [accountStatus, setAccountStatus] = useState('')

  //applied filters list
  const [appliedFilters, setAppliedFilters] = useState(null)
  //local plans
  const [plansList, setPlansList] = useState([])

  //stores redux data
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  //twilio warning modal
  const [noTwillio, setNoTwillio] = useState(false)
  const [showXBarPopup, setShowXBarPopup] = useState(false)
  const [loading, setLoading] = useState(false)

  //redux data
  useEffect(() => {
    refreshUserData()
  }, [])

  //prints the reduux local data
  // useEffect(() => {
  //   console.log("Yalla habibi redux data", reduxUser)
  //   if (reduxUser?.isTwilioConnected) {
  //     setNoTwillio(false);
  //   } else {
  //     setNoTwillio(true);
  //   }
  // }, [reduxUser]);

  //user profile data
  useEffect(() => {
    fetchProfileData()
  }, [])

  useEffect(() => {
    getLocalData()
    getSubAccounts()
    fetchPlans()
  }, [])

  // Restore subaccount modal state when returning from pipeline update (only for admin/agency users)
  useEffect(() => {
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

    // Only restore if user is admin/agency
    if (!isAdminOrAgency()) return

    // Wait for subAccountList to be populated
    if (!subAccountList || subAccountList.length === 0) return

    try {
      const storedData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
      if (storedData) {
        const stateObject = JSON.parse(storedData)
        if (stateObject?.restoreState?.selectedUserId) {
          const userId = stateObject.restoreState.selectedUserId
          const foundUser = subAccountList.find((item) => item.id === userId)
          if (foundUser) {
            setSelectedUser(foundUser)
            console.log('Restored subaccount modal state:', userId)
            
            // Clean up restoreState after a delay to allow all components to restore
            setTimeout(() => {
              try {
                const currentData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
                if (currentData) {
                  const currentState = JSON.parse(currentData)
                  if (currentState.restoreState) {
                    // Remove restoreState but keep the rest of the object for routing
                    delete currentState.restoreState
                    localStorage.setItem(
                      PersistanceKeys.isFromAdminOrAgency,
                      JSON.stringify(currentState)
                    )
                    console.log('Cleaned up restoreState from localStorage')
                  }
                }
              } catch (error) {
                console.error('Error cleaning up restoreState:', error)
              }
            }, 2000) // 2 second delay to ensure all components have restored
          }
        }
      }
    } catch (error) {
      console.error('Error restoring subaccount modal state:', error)
    }
  }, [subAccountList]) // Run when subAccountList is populated

  //dropdown popover functions
  const handleTogglePopover = (event, item) => {
    if (isPopoverOpen && activeAccount === item.id) {
      // same row clicked again → close
      handleClosePopover()
    } else {
      // open for this row
      setAnchorEl(event.currentTarget)
      setActiveAccount(item.id)
      setIsPopoverOpen(true)
      setUserData(item)
      setSelectedItem(item)
      setmoreDropdown(item.id)
    }
  }

  const handleClosePopover = () => {
    setAnchorEl(null)
    setActiveAccount(null)
    setIsPopoverOpen(false) // Close popover using boolean
  }

  // get agency data from local

  const getLocalData = () => {
    if (selectedAgency) {
      setAgencyData(selectedAgency)
    }
    // let data = localStorage.getItem("User");
    // if (data) {
    //   let u = JSON.parse(data);
    //    else {
    //     setAgencyData(u.user);
    //   }
    // }
  }

  //code to check plans before creating subaccount
  const handleCheckPlans = async () => {
    // Prevent multiple simultaneous calls
    if (loading) {
      return
    }

    try {
      setLoading(true)

      // Fetch agency data if not available
      let currentAgencyData = agencyData
      if (!currentAgencyData) {
        const profileResponse = await getProfileDetails()
        if (profileResponse?.data?.status === true) {
          currentAgencyData = profileResponse.data.data
          setAgencyData(currentAgencyData)
        }
      }

      //pass the selectedAgency id to check the status
      const monthlyPlans = await getMonthlyPlan(selectedAgency)
      const xBarOptions = await getXBarOptions(selectedAgency)

      // Ensure we have arrays, not undefined
      const plans = monthlyPlans || []
      const xBars = xBarOptions || []

      let stripeStatus = null
      console.log('Current checking data is', selectedAgency)
      if (selectedAgency) {
        console.log('selected agency is', selectedAgency)
        stripeStatus = selectedAgency.stripeConnected
      } else {
        console.log('no selected agency')
        stripeStatus = CheckStripe()
      }

      if (
        stripeStatus &&
        plans.length > 0 &&
        xBars.length > 0 &&
        currentAgencyData?.isTwilioConnected === true
      ) {
        setShowModal(true)
      } else {
        setShowSnackType(SnackbarTypes.Error)
        if (plans.length === 0) {
          setShowSnackMessage("You'll need to add plans to create subaccounts ")
        } else if (xBars.length === 0) {
          setShowSnackMessage(
            "You'll need to add an XBar plan to create subaccounts",
          )
        } else if (!stripeStatus) {
          setShowSnackMessage('Your Stripe account has not been connected.')
        } else if (!currentAgencyData?.isTwilioConnected) {
          setShowSnackMessage('Add your Twilio API Keys to create subaccounts.')
          setNoTwillio(true)
        }
      }
    } catch (error) {
      console.error('Error occured in api is', error)
      setShowSnackType(SnackbarTypes.Error)
      setShowSnackMessage(
        'An error occurred while checking plans. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  //code to close subaccount details modal
  const handleCloseModal = () => {
    // Preserve search term and applied filters when refreshing
    const currentFilters = appliedFilters || null
    const currentSearch = searchValue && searchValue.trim() ? searchValue.trim() : null
    getSubAccounts(currentFilters, currentSearch)
    setShowModal(false)
  }

  // /code for getting the subaccouts list
  const getSubAccounts = async (filterData = null, searchTerm = null) => {
    console.log('Trigered get subaccounts')
    if (filterData) {
      console.log('Trigered get subaccounts to filter', filterData)
    }
    if (searchTerm) {
      console.log('Trigered get subaccounts with search', searchTerm)
    }
    try {
      setInitialLoader(true)

      let ApiPAth = Apis.getAgencySubAccount
      const queryParams = []

      if (selectedAgency) {
        queryParams.push(`userId=${selectedAgency.id}`)
      }

      // Add search parameter if provided
      if (searchTerm && searchTerm.trim()) {
        queryParams.push(`search=${encodeURIComponent(searchTerm.trim())}`)
      }

      if (filterData) {
        Object.entries({
          minSpent: filterData.minSpent,
          maxSpent: filterData.maxSpent,
          minBalance: filterData.minBalance,
          maxBalance: filterData.maxBalance,
          profile_status: filterData.accountStatus,
          planId: filterData.selectPlanId,
        }).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            queryParams.push(`${key}=${value}`)
          }
        })
      }

      // minSpent=100000&minBalance=430&maxSpent=6000&maxBalance=1000

      if (queryParams.length > 0) {
        ApiPAth += '?' + queryParams.join('&')
      }

      console.log('Api path for get subaccounts api is', ApiPAth)
      const Token = AuthToken()
      // console.log(Token);
      const response = await axios.get(ApiPAth, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      console.log('Response of get subaccounts api 1 is', response)
      if (response) {
        console.log('Response of get subaccounts api is', response.data)
        setSubAccountsList(response.data.data)
        setFilteredList(response.data.data)
        setInitialLoader(false)
        if (filterData) {
          setShowFilterModal(false)
          setShowSnackMessage('Filter Applied')
          setShowSnackType(SnackbarTypes.Success)
        }
      }
    } catch (error) {
      console.error('Error occured in getsub accounts is', error)
      setInitialLoader(false)
    }
  }

  //function to pause account
  const handlePause = async () => {
    try {
      setpauseLoader(true)
      const data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        let apidata = {
          userId: moreDropdown,
        }

        console.log('Api data is', apidata)

        const response = await axios.post(Apis.pauseProfile, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
            'Content-Type': 'application/json',
          },
        })
        setpauseLoader(false)
        if (response.data) {
          if (response.data.status === true) {
            setShowSnackMessage(response.data.message)
            setShowPauseConfirmationPopup(false)
            setmoreDropdown(null)
            setSelectedItem(null)
            // Preserve search term and applied filters after pause
            const currentFilters = appliedFilters || null
            const currentSearch = searchValue && searchValue.trim() ? searchValue.trim() : null
            getSubAccounts(currentFilters, currentSearch)
          }
          console.log('response.data.data', response.data)
        }
      }
    } catch (error) {
      console.error('Error occured in pause subAccount api is', error)
      setpauseLoader(false)
    }
  }

  //function to delete account
  const handleDeleteUser = async () => {
    try {
      setDelLoader(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)

        let path = Apis.deleteProfile

        let apidata = {
          userId: moreDropdown,
        }
        console.log('Api data is', apidata)

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        console.log('Response of del account apis is', response)
        if (response.data) {
          console.log('Response of del account apis is', response.data)
          
          // Check if the deleted subaccount was an internal account
          // Use selectedItem which contains the full subaccount object
          if (selectedItem?.isInternalAccount) {
            // Update localStorage to set hasInternalAccount to false
            const localData = localStorage.getItem('User')
            if (localData) {
              try {
                const parsedData = JSON.parse(localData)
                if (parsedData.user) {
                  parsedData.user.hasInternalAccount = false
                  localStorage.setItem('User', JSON.stringify(parsedData))
                  console.log('Updated hasInternalAccount to false in localStorage')
                }
              } catch (error) {
                console.error('Error updating hasInternalAccount in localStorage:', error)
              }
            }
          }
          
          setShowSnackMessage('Sub account deleted')
          setDelLoader(false)
          setShowDelConfirmationPopup(false)
          setmoreDropdown(null)
          setSelectedItem(null)
          // Preserve search term and applied filters after delete
          const currentFilters = appliedFilters || null
          const currentSearch = searchValue && searchValue.trim() ? searchValue.trim() : null
          getSubAccounts(currentFilters, currentSearch)
        }
      }
    } catch (error) {
      console.error('Error occured in del account api is', error)
      setDelLoader(false)
    }
  }

  //get clor of profile status
  const getProfileStatus = (status) => {
    // console.log("status.profile_status", status.profile_status)

    if (status.profile_status === 'paused') {
      return <div style={{ color: 'orange' }}>Paused</div>
    } else if (status.profile_status === 'deleted') {
      return <div className="text-red">Deleted</div>
    } else if (status.profile_status === 'cancelled') {
      return <div className="text-grayclr75">Cancelled</div>
    } else if (status.profile_status === 'pending') {
      return <div className="text-grayclr75">Pending</div>
    } else if (status.profile_status === 'cancelled') {
      return <div className="text-red-800">Cancelled</div>
    } else if (status.profile_status === 'active') {
      return <div className="text-green">Active</div>
    }
  }

  //get the subaccpunt plans status
  const getPlanStatus = (item) => {
    if (item.planStatus && item.planStatus.status === 'cancelled') {
      return 'Cancelled'
    } else {
      return 'No Plan'
    }
  }

  //fetch local plans
  const fetchPlans = async () => {
    const localPlans = localStorage.getItem('agencyMonthlyPlans')
    if (localPlans) {
      setPlansList(JSON.parse(localPlans))
      console.log('Plans list is', JSON.parse(localPlans))
    }
  }

  //search change with debouncing
  const [searchTimeout, setSearchTimeout] = useState(null)
  
  const handleSearchChange = (value) => {
    setSearchValue(value)
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // If value is empty, reset immediately
    if (!value || !value.trim()) {
      getSubAccounts(null, null)
      return
    }
    
    // Debounce API call by 500ms
    const timeout = setTimeout(() => {
      getSubAccounts(null, value)
    }, 500)
    
    setSearchTimeout(timeout)
  }
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const refreshUserData = async () => {
    console.log('🔄 REFRESH USER DATA STARTED')
    try {
      console.log('🔄 Calling getProfileDetails...')
      const profileResponse = await getProfileDetails()
      console.log('🔄 getProfileDetails response:', profileResponse)

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        // console.log('🔄 [CREATE-AGENT] Fresh user data received after upgrade');

        // Update Redux and localStorage with fresh data
        console.log('updating redux user', freshUserData)
        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }

        setReduxUser(updatedUserData)

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [CREATE-AGENT] Error refreshing user data:', error)
      return false
    }
  }

  const fetchProfileData = async (loading = true) => {
    try {
      if (loading === true) {
        setInitialLoader(true)
      } else {
        setInitialLoader(false)
      }
      const profileResponse = await getProfileDetails()
      if (profileResponse) {
        console.log(
          'habibi twilio status is',
          profileResponse?.data?.data?.isTwilioConnected,
        )
        setAgencyData(profileResponse?.data?.data)
        if (profileResponse?.data?.data?.isTwilioConnected) {
          setNoTwillio(false)
        } else {
          setNoTwillio(true)
          // setUserProfile(profileResponse.data.data);
        }
        setInitialLoader(false)
      }
    } catch (err) {
      setInitialLoader(false)
      console.log('Err occured in get profile at subacc screen is', err)
    }
  }

  return (
    <div className="w-full flex flex-col items-center ">
      {rortingLoader && (
        <LoaderAnimation
          loaderModal={true}
          isOpen={rortingLoader}
          title="Redirecting to Twilio integration..."
        />
      )}
      <AgentSelectSnackMessage
        isVisible={showSnackMessage}
        hide={() => {
          setShowSnackMessage(null)
        }}
        type={showSnackType}
        message={showSnackMessage}
      />

      <div className="flex w-full flex-row items-center justify-between px-5 py-5 border-b">
        <div
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: 'black',
          }}
        >
          Sub Accounts
          {/* <EditAgencyName
            flex={true} /> */}
        </div>

        <div className="flex flex-row items-center gap-2">
          <NotficationsDrawer />
        </div>
      </div>

      {/* Code for twilio warning <TwilioWarning
        // agencyData={agencyData}
        showSuccess={(d) => {
          setShowSnackMessage(d);
          setShowSnackType(SnackbarTypes.Success);
        }}
        isTwilioAdded={(d) => {
          console.log("Twilio connected status", d);
          setTwilioConnectedStatus(d.status);
        }}
      /> */}

      <TwillioWarning
        open={noTwillio}
        handleClose={(d) => {
          setNoTwillio(false)
          if (d) {
            fetchProfileData(false)
            setShowSnackMessage('Twilio Connected')
            setShowSnackType(SnackbarTypes.Success)
          }
        }}
        setRortingLoader={(d) => {
          setRortingLoader(d)
        }}
      // showSuccess={(d) => {
      //   setShowSnackMessage(d);
      //   setShowSnackType(SnackbarTypes.Success);
      // }}
      />

      <div className="w-[95%] h-[90vh] rounded-lg flex flex-col items-center  p-5 bg-white shadow-md">
     
        <div
          className="w-full h-32 flex flex-row items-center justify-between rounded-lg px-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-primary) / 0.8))`,
          }}
        >
          {/* Content */}
          <div className="relative z-10 flex flex-row items-center justify-between w-full">
            <div
              style={{
                fontSize: 29,
                fontWeight: '700',
                color: 'white',
              }}
            >
              Total Sub Accounts: {filteredList?.length || 0}
            </div>

            <button
              disabled={twililoConectedStatus}
              className="flex px-5 py-3 bg-white rounded-lg text-brand-primary font-medium border-none outline-none"
              onClick={() => {
                handleCheckPlans()
              }}
            >
              {loading ? <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} /> : 'Create Sub Account'}
            </button>
          </div>
        </div>



        <div className="w-full flex flex-row items-center justify-start mb-2 ps-10 mt-4 gap-4">
          <div className="flex flex-row items-center gap-1  w-[22vw] flex-shrink-0 border rounded-full px-4">
            <input
              style={{ fontSize: 15 }}
              type="text"
              placeholder="Search by name, status or plan"
              className="flex-grow outline-none font-[500]  border-none focus:outline-none focus:ring-0 flex-shrink-0 rounded-full"
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value
                setSearchValue(value)
                handleSearchChange(value)
              }}
            />
            <Image
              src={'/otherAssets/searchIcon.png'}
              alt="Search"
              width={20}
              height={20}
            />
          </div>
          <div className="w-[75vw] flex flex-row items-center gap-4">
            <div className="flex flex-row items-center gap-4 flex-shrink-0 w-[90%]">
              <button
                className="flex-shrink-0 outline-none"
                onClick={() => {
                  setShowFilterModal(true)
                }}
              >
                <Image
                  src={'/otherAssets/filterBtn.png'}
                  height={36}
                  width={36}
                  alt="Search"
                />
              </button>

              {/* Filter Pills Row */}
              <div
                className="flex flex-row items-center gap-2 flex-shrink-0 overflow-auto w-[90%]"
                style={{
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE/Edge
                }}
              >
                {appliedFilters &&
                  Object.entries(appliedFilters).map(([key, value]) => {
                    if (!value) return null

                    const labels = {
                      minSpent: 'Min Spent',
                      maxSpent: 'Max Spent',
                      minBalance: 'Min Balance',
                      maxBalance: 'Max Balance',
                      selectPlanId: 'Plan',
                      accountStatus: 'Status',
                    }

                    let displayValue = value
                    if (key === 'selectPlanId') {
                      const plan = plansList?.find((p) => p.id === value)
                      displayValue = plan ? plan.title : value
                    }

                    return (
                      <div
                        key={key}
                        className="flex-shrink-0 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-[25px] flex flex-row items-center gap-2"
                      >
                        <div className="text-[15px] font-medium">
                          {labels[key] || key}: {displayValue}
                        </div>
                        <button
                          className="outline-none flex-shrink-0"
                          onClick={() => {
                            const { [key]: removed, ...newFilters } =
                              appliedFilters
                            setAppliedFilters(newFilters)

                            if (key === 'minSpent') setMinSpent('')
                            if (key === 'maxSpent') setMaxSpent('')
                            if (key === 'minBalance') setMinBalance('')
                            if (key === 'maxBalance') setMaxBalance('')
                            if (key === 'selectPlanId') setSelectPlanId(null)
                            if (key === 'accountStatus') setAccountStatus('')

                            // Preserve search term when removing filter tags
                            const currentSearch = searchValue && searchValue.trim() ? searchValue.trim() : null
                            getSubAccounts(newFilters, currentSearch)
                          }}
                        >
                          <Image
                            src={'/otherAssets/crossIcon.png'}
                            height={16}
                            width={16}
                            alt="remove"
                          />
                        </button>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-row justify-between mt-2 px-10 mt-10">
          <div className="w-2/12">
            <div style={styles.text}>Sub Account</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Status</div>
          </div>
          <div className="w-2/12 ">
            <div style={styles.text}>Plan</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Spend</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Balance</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Leads</div>
          </div>
          <div className="w-2/12">
            <div style={styles.text}>Renewal</div>
          </div>
          {/*
            <div className="w-1/12">
              <div style={styles.text}>Teams</div>
            </div>
          */}
          <div className="w-1/12">
            <div style={styles.text}>Action</div>
          </div>
        </div>

        {initialLoader ? (
          <div className="w-full h-[68vh] flex flex-row justify-center mt-4">
            <CircularProgress size={35} sx={{ color: 'hsl(var(--brand-primary))' }} />
          </div>
        ) : (
          <div
            className={`h-[68vh] overflow-auto w-full`}
            id="scrollableDiv1"
            style={{ scrollbarWidth: 'none' }}
          >
            {filteredList?.length > 0 ? (
              <div>
                {filteredList.map((item) => (
                  <div
                    key={item.id}
                    style={{ cursor: 'pointer' }}
                    className="w-full flex flex-row justify-between items-center mt-5 px-10 hover:bg-brand-primary/5 py-2 cursor-pointer cursor-pointer"
                  // onClick={(e) => handleTogglePopover(e, item)}
                  // onClick={(event) => {
                  //   if (activeAccount === item.id) {
                  //     // same row clicked again → close
                  //     setAnchorEl(null);
                  //     setActiveAccount(null);
                  //   } else {
                  //     // open for this row
                  //     setAnchorEl(event.currentTarget);
                  //     setActiveAccount(item.id);
                  //     setUserData(item);
                  //     setSelectedItem(item);
                  //     setmoreDropdown(item.id);
                  //     setSelectedUser(item);
                  //   }
                  // }}
                  >
                    <div
                      className="w-2/12 flex flex-row gap-2 items-center cursor-pointer flex-shrink-0"
                      onClick={() => {
                        setSelectedUser(item)
                      }}
                    >
                      {item.thumb_profile_image ? (
                        <Image
                          src={item.thumb_profile_image}
                          className="rounded-full bg-red"
                          height={40}
                          width={40}
                          style={{
                            height: '40px',
                            width: '40px',
                            objectFit: 'cover',
                          }}
                          alt="*"
                        />
                      ) : (
                        <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <div style={{ ...styles.text2 }} className="w-[60%]">
                        {item.name}
                      </div>
                    </div>
                    <div
                      className="w-1/12"
                      onClick={() => {
                        setSelectedUser(item)
                      }}
                    >
                      <div style={styles.text2}>
                        {!item.plan ? (
                          'Pending'
                        ) : item?.profile_status ? (
                          <div>{getProfileStatus(item)}</div>
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>
                    <div
                      className=" w-2/12"
                      onClick={() => {
                        setSelectedUser(item)
                      }}
                    >
                      <div style={styles.text2}>
                        {item.plan?.name || getPlanStatus(item)}
                      </div>
                    </div>
                    <div
                      className="w-1/12"
                      onClick={() => {
                        setSelectedUser(item)
                      }}
                    >
                      {/* (item.LeadModel?.phone) */}
                      <div style={styles.text2}>
                        ${formatFractional2(item.totalSpend || 0)}
                      </div>
                    </div>
                    <div
                      className="w-1/12"
                      onClick={() => {
                        setSelectedUser(item)
                      }}
                    >
                      <div style={styles.text2}>
                        {/*convertSecondsToMinDuration(
                          item.totalSecondsAvailable || 0
                        )*/}
                        {convertTime(item?.totalSecondsAvailable) || 0}
                      </div>
                    </div>
                    <div
                      className="w-1/12"
                      onClick={() => {
                        setSelectedUser(item)
                      }}
                    >
                      <div style={styles.text2}>{item.totalLeads}</div>
                    </div>
                    <div
                      className="w-2/12"
                      onClick={() => {
                        setSelectedUser(item)
                      }}
                    >
                      <div style={styles.text2}>
                        {item.nextChargeDate
                          ? moment(item.nextChargeDate).format('MMMM DD,YYYY')
                          : '-'}
                      </div>
                    </div>
                    {/*
                      <div className="w-1/12" onClick={() => { setSelectedUser(item); }}>{item.teamMembers}</div>
                    */}

                    <div className="w-1/12 relative">
                      <button
                        disabled={twililoConectedStatus}
                        id={`account-popover-toggle-${item.id}`}
                        onClick={(e) => handleTogglePopover(e, item)}
                      // onClick={() => {
                      //   setUserData(item);
                      //   setmoreDropdown(
                      //     moreDropdown === item.id ? null : item.id
                      //   );
                      //   setSelectedItem(item);
                      // }}
                      >
                        <Image
                          src={'/svgIcons/threeDotsIcon.svg'}
                          height={24}
                          width={24}
                          alt="menu"
                        />
                      </button>
                    </div>

                    {/* Popover unique per row */}
                    <Popover
                      id={`account-popover-${item.id}`}
                      open={isPopoverOpen && activeAccount === item.id}
                      anchorEl={anchorEl}
                      onClose={handleClosePopover}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      PaperProps={{
                        elevation: 6,
                        style: {
                          boxShadow:
                            '0px 4px 5px rgba(0, 0, 0, 0.02), 0px 0px 4px rgba(0, 0, 0, 0.02)',
                          borderRadius: '12px',
                          // border: "1px solid black",
                        },
                      }}
                    >
                      <div className="rounded-[10px] inline-flex flex-col gap-4 w-[200px] shadow-lg">
                        <button
                          className="px-4 pt-1 hover:bg-brand-primary/10 text-sm font-medium text-gray-800 text-start"
                          onClick={() => {
                            handleClosePopover() // Close menu immediately
                            setSelectedUser(item)
                          }}
                        >
                          View Detail
                        </button>
                        <button
                          className="px-4 hover:bg-brand-primary/10 text-sm font-medium text-gray-800 text-start"
                          onClick={() => {
                            handleClosePopover() // Close menu immediately
                            setOpenInvitePopup(true)
                          }}
                        >
                          Invite Team
                        </button>
                        <button
                          className="px-4 hover:bg-brand-primary/10 text-sm font-medium text-gray-800 text-start"
                          onClick={() => {
                            handleClosePopover() // Close menu immediately
                            setShowPlans(true)
                          }}
                        >
                          View Plans
                        </button>

                        <button
                          className="px-4 hover:bg-brand-primary/10 text-sm font-medium text-gray-800 text-start"
                          onClick={() => {
                            handleClosePopover() // Close menu immediately
                            setShowXBarPlans(true)
                          }}
                        >
                          View XBar
                        </button>
                        <button
                          className="px-4  hover:bg-brand-primary/10 text-sm font-medium text-gray-800 text-start"
                          onClick={() => {
                            handleClosePopover() // Close menu immediately
                            setShowPauseConfirmationPopup(true)
                          }}
                        >
                          {item?.profile_status === 'paused'
                            ? 'Reinstate'
                            : 'Pause'}
                        </button>
                        <button
                          className="px-4 pb-1 hover:bg-brand-primary/10 text-sm font-medium text-gray-800 text-start"
                          onClick={() => {
                            handleClosePopover() // Close menu immediately
                            setShowDelConfirmationPopup(true)
                          }}
                          disabled={item?.profile_status === 'deleted'}
                        >
                          Delete
                        </button>
                      </div>
                    </Popover>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center flex flex-col items-center w-full"
                style={{ fontWeight: 'bold', fontSize: 20 }}
              >
                <Image
                  alt="*"
                  src={'/agencyIcons/subaccountPlaceholder.png'} //subaccountPlaceholder //nosubAccount
                  height={230}
                  width={420}
                />
                <div
                  className="flex flex-col items-center gap-6"
                  style={{ marginTop: '-120px' }}
                >
                  <div
                    style={{ fontWeight: '600', fontSize: '22px' }}
                    className="text-center"
                  >
                    No Sub Account Found
                  </div>
                 
                   <button
                     disabled={twililoConectedStatus}
                     className={`flex px-5 py-3 bg-brand-primary rounded-lg text-white font-medium border-none outline-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                     onClick={() => {
                       handleCheckPlans();
                     }}
                   >
                      {loading ? <CircularProgress size={20} sx={{color : 'white'}} /> : 'Create Sub Account'}
                   </button>
                 
                </div>
              </div>
            )}

            {openInvitePopup && (
              <NewInviteTeamModal
                openInvitePopup={openInvitePopup}
                userID={moreDropdown}
                handleCloseInviteTeam={(data) => {
                  setOpenInvitePopup(false)
                  if (data === 'showSnack') {
                    setShowSnackMessage('Invite Sent')
                    setmoreDropdown(null)
                    setSelectedItem(null)
                  }
                }}
              />
            )}

            {showPlans && (
              <ViewSubAccountPlans
                showPlans={setShowPlans}
                hidePlans={(d) => {
                  if (d) {
                    setShowSnackMessage('Plans Updated')
                    setShowSnackType(SnackbarTypes.Success)
                  }
                  setShowPlans(false)
                }}
                selectedUser={userData}
              />
            )}

            {showXBarPlans && (
              <ViewSubAccountXBar
                showXBar={showXBarPlans}
                hideXBar={(d) => {
                  if (d) {
                    setShowSnackMessage('XBar Plans Updated')
                    setShowSnackType(SnackbarTypes.Success)
                  }
                  setShowXBarPlans(false)
                }}
                selectedUser={userData}
              />
            )}

            {showPauseConfirmationPopup && (
              <DelAdminUser
                selectedAccount={selectedItem}
                showPauseModal={showPauseConfirmationPopup}
                handleClosePauseModal={() => {
                  setShowPauseConfirmationPopup(false)
                }}
                handlePaueUser={handlePause}
                pauseLoader={pauseLoader}
                selectedUser={selectedUser}
              />
            )}

            {showDelConfirmationPopup && (
              <DelAdminUser
                showDeleteModal={showDelConfirmationPopup}
                handleClose={() => {
                  setShowDelConfirmationPopup(false)
                }}
                handleDeleteUser={handleDeleteUser}
                delLoader={delLoader}
                selectedUser={selectedUser}
              />
            )}
          </div>
        )}

        {/* Code for modals
        <CreateSubAccountModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          closeAll={() => {
            handleCloseModal();
          }}
        /> */}

        {/* code for slide animation modal */}

        <SlideModal
          showModal={showModal}
          handleClose={() => {
            // Preserve search term and applied filters when closing modal
            const currentFilters = appliedFilters || null
            const currentSearch = searchValue && searchValue.trim() ? searchValue.trim() : null
            getSubAccounts(currentFilters, currentSearch)
            setShowModal(false)
          }}
          selectedAgency={selectedAgency}
        // handleCloseModal={() => { handleCloseModal() }}
        />

        {/* Code for filters modal */}
        <SubAccountFilters
          open={showFilterModal}
          handleClose={() => {
            setShowFilterModal(false)
          }}
          initialLoader={initialLoader}
          handleApplyFilters={(data) => {
            setAppliedFilters(data)
            setShowFilterModal(false)
            console.log('FilterData is', data)
            // Preserve search term when applying filters
            getSubAccounts(data, searchValue && searchValue.trim() ? searchValue.trim() : null)
          }}
          minSpent={minSpent}
          maxSpent={maxSpent}
          maxBalance={maxBalance}
          minBalance={minBalance}
          selectPlanId={selectPlanId}
          accountStatus={accountStatus}
          setMinSpent={setMinSpent}
          setMaxSpent={setMaxSpent}
          setMaxBalance={setMaxBalance}
          setMinBalance={setMinBalance}
          setSelectPlanId={setSelectPlanId}
          setAccountStatus={setAccountStatus}
        />

        {/* Code for subaccount modal */}
        <Modal
          open={selectedUser ? true : false}
          onClose={() => {
            setSelectedUser(null)
          }}
          BackdropProps={{
            timeout: 200,
            sx: {
              backgroundColor: '#00000020',
              zIndex: 1200, // Keep backdrop below Drawer
            },
          }}
          sx={{
            zIndex: 1300, // Keep Modal below the Drawer
          }}
        >
          <Box
            className="w-11/12 p-8 rounded-[15px]"
            sx={{
              ...styles.modalsStyle,
              backgroundColor: 'white',
              position: 'relative',
              zIndex: 1301, // Keep modal content above its backdrop
            }}
          >
            <SelectedUserDetails
              from="subaccount"
              selectedUser={selectedUser}
              // agencyUser={true}
              hideViewDetails={true}
              handleDel={() => {
                // setUsers((prev) => prev.filter((u) =>
                //     u.id != selectedUser.id
                // ))
                // setSelectedUser(null)
              }}
              handleClose={() => {
                setSelectedUser(null)
              }}
            />
          </Box>
        </Modal>
      </div>
    </div>
  )
}

export default AgencySubacount

const styles = {
  text: {
    fontSize: 15,
    color: '#00000090',
    fontWeight: '600',
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
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
