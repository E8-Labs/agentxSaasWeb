import { Box, CircularProgress, Menu, MenuItem, Modal } from '@mui/material'
import axios from 'axios'

import { getAgencySelectMenuProps } from '@/components/agency/agencySelectMenuConfig'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { copyAgencyOnboardingLink } from '@/components/constants/constants'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import DelConfirmationPopup from '@/components/onboarding/extras/DelConfirmationPopup'

import {
  CheckStripe,
  formatDecimalValue,
} from '../agencyServices/CheckAgencyData'
import AddMonthlyPlan from './AddMonthlyPlan'
import AddMonthlyPlanAnimation from './AddMonthlyPlanAnimation'
import AddXBarPlan from './AddXBarPlan'
import { formatFractional2 } from './AgencyUtilities'
import { AuthToken } from './AuthDetails'
import ConfigureSideUI from './ConfigureSideUI'
import EditPlanWarning from './EditPlanWarning'
import SupportFile from './SupportFile'
import XBarSideUI from './XBarSideUI'

function DashboardPlans({ selectedAgency, initialTab = 'monthly' }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [moreDropdown, setmoreDropdown] = useState(null)
  const [isAgency, setIsAgency] = useState(false)

  const [plansList, setPlansList] = useState([])
  const [filteredList, setFilteredList] = useState([])

  const [planType, setPlanType] = useState(initialTab)
  const [brandColor, setBrandColor] = useState('270 75% 50%') // Default brand color

  // Sync planType when initialTab prop changes
  useEffect(() => {
    setPlanType(initialTab)
  }, [initialTab])

  // Update brand color from CSS variable when component mounts or when planType changes
  useEffect(() => {
    const updateBrandColor = () => {
      if (typeof window !== 'undefined') {
        const root = document.documentElement
        const color = getComputedStyle(root).getPropertyValue('--brand-primary')
        if (color) {
          setBrandColor(color.trim())
        }
      }
    }

    // Update immediately
    updateBrandColor()

    // Also update when planType changes (in case brand color changed while on another tab)
    // This ensures icons update when switching tabs
  }, [planType])

  // Watch for brand color changes using MutationObserver
  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBrandColor = () => {
      const root = document.documentElement
      const color = getComputedStyle(root).getPropertyValue('--brand-primary')
      if (color) {
        setBrandColor(color.trim())
      }
    }

    // Create MutationObserver to watch for style changes on document root
    const observer = new MutationObserver(() => {
      updateBrandColor()
    })

    // Observe document root for attribute changes (CSS variables are attributes)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      subtree: false,
    })

    // Also check periodically as a fallback (in case CSS variable changes via stylesheet)
    const intervalId = setInterval(updateBrandColor, 500)

    return () => {
      observer.disconnect()
      clearInterval(intervalId)
    }
  }, [])
  const [open, setOpen] = useState(false)
  const [isEditPlan, setIsEditPlan] = useState(false)
  const [initialLoader, setInitialLoader] = useState(true)
  const [canAddPlan, setCanAddPlan] = useState(true)
  //code for snack messages
  const [snackMsg, setSnackMsg] = useState(null)
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error)

  //code for confiration modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  //selected plan details
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null)
  const [customPlanFeatures, setCustomPlanFeatures] = useState([])

  //agencyp plan cost
  const [agencyPlanCost, setAgencyPlanCost] = useState('')
  const fetchingCostRef = useRef(false) // Prevent multiple simultaneous fetches

  const [delLoading, setDelLoading] = useState(false)
  //search bar
  const [searchValue, setSearchValue] = useState('')

  //set custom features
  useEffect(() => {
    if (selectedPlanDetails && planType === 'monthly') {
      const featuresObj = selectedPlanDetails?.dynamicFeatures

      const featuresArray = Object.entries(featuresObj)
        .filter(([_, value]) => value === true) // only true values
        .map(([key, value]) => ({
          text: key,
          thumb: value,
        }))
    }
  }, [selectedPlanDetails])

  //get local user data
  useEffect(() => {
    const localData = localStorage.getItem('User')
    if (localData) {
      const u = JSON.parse(localData)
      const currentPlanId = u.user?.plan?.planId
      const agencyPlansList = localStorage.getItem('agencyPlansList')
      
      // Check if user is an agency
      const userRole = u?.user?.userRole || u?.userRole
      setIsAgency(userRole === 'Agency')
      
      // For Invitee users, we need to get the agency owner's plan cost
      const isInvitee = userRole === 'Invitee'
      
      if (selectedAgency) {
        // If Invitee, we'll fetch agency owner's cost in the fetch effect below
        // Otherwise, use selectedAgency's cost
        if (isInvitee) {
          // For Invitee users, always fetch agency owner's cost (not subaccount's)
          // Don't set cost here, let the fetch effect handle it
        } else {
          if (selectedAgency?.planCapabilities?.aiCreditRate) {
            setAgencyPlanCost(selectedAgency?.planCapabilities?.aiCreditRate)
          } else {
            setAgencyPlanCost(selectedAgency?.plan?.capabilities?.aiCreditRate)
          }
        }
      } else {
        let agencyFromLocal = u.user

        if (agencyFromLocal) {
          // For Invitee users, we need to get agency owner's plan cost
          if (isInvitee) {
            // We'll fetch agency owner's cost in the fetch effect below
            // Don't set cost here
          } else {
            if (agencyFromLocal?.planCapabilities?.aiCreditRate) {
              setAgencyPlanCost(agencyFromLocal?.planCapabilities?.aiCreditRate)
            } else {
              setAgencyPlanCost(agencyFromLocal?.plan?.capabilities?.aiCreditRate)
            }
          }
        }
      }
    }
  }, [selectedAgency])

  // Fetch agency plan cost if not available - fixes intermittent $0.00 issue
  // Also handles Invitee users by fetching agency owner's plan cost
  useEffect(() => {
    const localData = localStorage.getItem('User')
    if (!localData) return
    
    const u = JSON.parse(localData)
    const userRole = u?.user?.userRole || u?.userRole
    const isInvitee = userRole === 'Invitee'
    
    // For Invitee users, always fetch (they need agency owner's cost)
    // For others, only fetch if cost is missing
    if (!isInvitee && agencyPlanCost && Number(agencyPlanCost) > 0) {
      fetchingCostRef.current = false
      return
    }

    const fetchAgencyCostIfMissing = async () => {
      // Only fetch if cost is missing or zero, and we're not already fetching
      if ((!agencyPlanCost || Number(agencyPlanCost) === 0) && !fetchingCostRef.current) {
        fetchingCostRef.current = true
        try {
          const localData = localStorage.getItem('User')
          if (!localData) {
            fetchingCostRef.current = false
            return
          }
          
          const u = JSON.parse(localData)
          const userRole = u?.user?.userRole || u?.userRole
          const isInvitee = userRole === 'Invitee'
          
          let targetUserId = null
          
          // For Invitee users, get the agency owner ID
          if (isInvitee) {
            // Get agency owner from team relationship using GetTeamMembers API
            try {
              const teamResponse = await axios.get(Apis.getTeam, {
                headers: {
                  Authorization: `Bearer ${u.token}`,
                  'Content-Type': 'application/json',
                },
              })
              
              if (teamResponse?.data?.status && teamResponse.data.admin) {
                // GetTeamMembers API returns the admin (team owner) in the response
                const admin = teamResponse.data.admin
                if (admin?.id && admin?.userRole === 'Agency') {
                  targetUserId = admin.id
                }
              }
            } catch (teamError) {
              console.warn('⚠️ [DashboardPlans] Could not fetch team info:', teamError)
            }
            
            // Fallback: If team fetch failed, try to get agency owner from selectedAgency
            if (!targetUserId && selectedAgency?.agencyId) {
              targetUserId = selectedAgency.agencyId
            }
          } else if (selectedAgency?.id) {
            // For non-Invitee users, use selectedAgency's ID
            targetUserId = selectedAgency.id
          }
          
          // Fetch profile with targetUserId if available, otherwise use getProfileDetails
          let profileResponse
          if (targetUserId && isInvitee) {
            // Fetch agency owner's profile
            const Auth = u.token
            console.log(`🔍 [DashboardPlans] Fetching agency owner (${targetUserId}) profile for Invitee user`)
            profileResponse = await axios.get(`${Apis.getProfileFromId}?id=${targetUserId}`, {
              headers: {
                Authorization: `Bearer ${Auth}`,
                'Content-Type': 'application/json',
              },
            })
            console.log(`📦 [DashboardPlans] Agency owner profile response:`, profileResponse?.data?.status ? 'Success' : 'Failed')
          } else if (!isInvitee) {
            profileResponse = await getProfileDetails(selectedAgency)
          } else {
            console.warn('⚠️ [DashboardPlans] Invitee user but no targetUserId found')
            fetchingCostRef.current = false
            return
          }
          
          if (profileResponse?.data?.status === true) {
            const userData = profileResponse.data.data || profileResponse.data
            console.log(`💰 [DashboardPlans] Extracting cost from profile:`, {
              hasPlanCapabilities: !!userData?.planCapabilities,
              aiCreditRate: userData?.planCapabilities?.aiCreditRate,
              hasPlan: !!userData?.plan,
              planFeatures: userData?.plan?.features,
              planDynamicFeatures: userData?.plan?.dynamicFeatures,
              subscribedPlan: userData?.subscribedPlan,
              fullData: userData
            })
            
            // Try multiple paths to find aiCreditRate
            // The plan data structure can vary, so we check all possible locations
            let cost = null
            
            // 1. planCapabilities (set by UserProfileFullResource - should have aiCreditRate)
            if (userData?.planCapabilities?.aiCreditRate) {
              cost = userData.planCapabilities.aiCreditRate
            }
            // 2. plan.features (from SubscriptionPlans - could be dynamicFeatures or features)
            else if (userData?.plan?.features?.aiCreditRate) {
              cost = userData.plan.features.aiCreditRate
            }
            // 3. plan.dynamicFeatures (direct access to dynamicFeatures)
            else if (userData?.plan?.dynamicFeatures?.aiCreditRate) {
              cost = userData.plan.dynamicFeatures.aiCreditRate
            }
            // 4. subscribedPlan.features (from userProfileFullResource - set from plan.dynamicFeatures || plan.features)
            else if (userData?.subscribedPlan?.features?.aiCreditRate) {
              cost = userData.subscribedPlan.features.aiCreditRate
            }
            // 5. plan.capabilities (alternative location)
            else if (userData?.plan?.capabilities?.aiCreditRate) {
              cost = userData.plan.capabilities.aiCreditRate
            }
            // 6. plan.grandfatheredFeatures (for grandfathered plans)
            else if (userData?.plan?.grandfatheredFeatures?.aiCreditRate) {
              cost = userData.plan.grandfatheredFeatures.aiCreditRate
            }
            // 7. Fallback to selectedAgency if available
            else if (selectedAgency?.planCapabilities?.aiCreditRate) {
              cost = selectedAgency.planCapabilities.aiCreditRate
            }
            else if (selectedAgency?.plan?.dynamicFeatures?.aiCreditRate) {
              cost = selectedAgency.plan.dynamicFeatures.aiCreditRate
            }
            else if (selectedAgency?.plan?.capabilities?.aiCreditRate) {
              cost = selectedAgency.plan.capabilities.aiCreditRate
            }
            
            console.log(`💵 [DashboardPlans] Extracted cost:`, cost)
            
            if (cost && Number(cost) > 0) {
              setAgencyPlanCost(cost)
              console.log(`✅ [DashboardPlans] Agency plan cost set to: $${cost}`)
            } else {
              console.warn('⚠️ [DashboardPlans] Agency cost still not available after fetch. UserData keys:', Object.keys(userData || {}))
              
              // Last resort: Try to get plan ID from plan history and fetch plan directly
              // Check if we can get planId from the user's plan history
              const planId = userData?.plan?.planId || userData?.plan?.id || userData?.subscribedPlan?.id
              if (planId && isInvitee && targetUserId) {
                console.log(`🔄 [DashboardPlans] Attempting to fetch plan ${planId} directly for agency owner ${targetUserId}`)
                try {
                  // Try to fetch the plan using the plans API
                  const planResponse = await axios.get(`${Apis.getPlanById}?id=${planId}`, {
                    headers: {
                      Authorization: `Bearer ${u.token}`,
                      'Content-Type': 'application/json',
                    },
                  })
                  
                  if (planResponse?.data?.status && planResponse.data.data) {
                    const planData = planResponse.data.data
                    // Check both dynamicFeatures and features
                    const directCost = planData?.dynamicFeatures?.aiCreditRate || planData?.features?.aiCreditRate
                    if (directCost && Number(directCost) > 0) {
                      setAgencyPlanCost(directCost)
                      console.log(`✅ [DashboardPlans] Agency plan cost set from direct plan fetch: $${directCost}`)
                    } else {
                      console.warn(`⚠️ [DashboardPlans] Plan ${planId} found but no aiCreditRate in dynamicFeatures or features`)
                    }
                  }
                } catch (planError) {
                  console.error('❌ [DashboardPlans] Error fetching plan directly:', planError)
                }
              } else if (!planId && isInvitee) {
                console.warn(`⚠️ [DashboardPlans] No planId found in userData for Invitee. Plan:`, userData?.plan, `SubscribedPlan:`, userData?.subscribedPlan)
              }
            }
          } else {
            console.error('❌ [DashboardPlans] Profile fetch failed:', profileResponse?.data?.message || 'Unknown error')
          }
        } catch (error) {
          console.error('❌ [DashboardPlans] Error fetching agency cost:', error)
        } finally {
          fetchingCostRef.current = false
        }
      }
    }

    // Fetch when modal opens or when selectedAgency changes (but only if cost is missing)
    // For Invitee users, always try to fetch (they need agency owner's cost)
    // Also add a small delay to let the first useEffect set the cost from props/localStorage
    const timeoutId = setTimeout(() => {
      const localData = localStorage.getItem('User')
      if (localData) {
        const u = JSON.parse(localData)
        const userRole = u?.user?.userRole || u?.userRole
        const isInvitee = userRole === 'Invitee'
        
        // Always fetch for Invitee users, or if modal is open/selectedAgency is set
        if (isInvitee || open || selectedAgency) {
          fetchAgencyCostIfMissing()
        }
      } else if (open || selectedAgency) {
        fetchAgencyCostIfMissing()
      }
    }, 100) // Small delay to let other useEffects run first

    return () => clearTimeout(timeoutId)
  }, [open, selectedAgency, agencyPlanCost])

  //auto get the data
  useEffect(() => {
    getPlanApiTrigerer()
  }, [planType])

  const getPlanApiTrigerer = () => {
    if (planType === 'monthly') {
      // setInitialLoader(true);
      getMonthlyPlan()
    } else if (planType === 'Xbar') {
      getXBarOptions()
    }
  }

  //check if plan has already trial true
  useEffect(() => {
    for (let i = 0; i < plansList?.length; i++) {
      if (plansList[i].hasTrial === true) {
        setCanAddPlan(false)
        break // Stop looping after the first match
      }
    }
  }, [plansList])

  //handle add new plan click
  const handleAddPlan = () => {
    let getStripe = null
    if (selectedAgency) {
      getStripe = selectedAgency?.stripeConnected
    } else {
      getStripe = CheckStripe()
    }
    if (!getStripe) {
      setSnackMsg('Stripe needs to be connected')
      setSnackMsgType(SnackbarTypes.Warning)
    } else {
      setOpen(true)
    }
  }

  //plan created
  // const handlePlanCreated = (response) => {
  //     console.log("Response received is:", response);
  //     let newPlan = response?.data?.data;

  //     //get plans from local
  //     let localPlans = null;
  //     if (planType === "monthly") {
  //         const LP = localStorage.getItem("agencyMonthlyPlans");
  //         if(LP){
  //             const d = JSON.parse(LP);
  //             localPlans = d;
  //         }
  //     } else if (planType === "Xbar") {
  //         const LP = localStorage.getItem("XBarOptions");
  //         if(LP){
  //             const d = JSON.parse(LP);
  //             localPlans = d;
  //         }
  //     }
  //     console.log("Local Plans list is", localPlans);

  //     if (planType === "monthly") {
  //         localStorage.setItem("agencyMonthlyPlans", JSON.stringify([...plansList, newPlan]));
  //     } else if (planType === "Xbar") {
  //         localStorage.setItem("XBarOptions", JSON.stringify([...plansList, newPlan]));
  //     }
  //     setPlansList(prev => [...prev, newPlan]);
  // };

  const handlePlanCreated = (response) => {
    let newPlan = response?.data?.data
    if(!newPlan) {
      setSnackMsg(response?.data?.message || 'An error occurred')
      setSnackMsgType(SnackbarTypes.Success)
      return
    }

    // Load existing plans based on type
    let localPlans = []
    if (planType === 'monthly') {
      const LP = localStorage.getItem('agencyMonthlyPlans')
      if (LP) {
        localPlans = JSON.parse(LP)
      }
    } else if (planType === 'Xbar') {
      const LP = localStorage.getItem('XBarOptions')
      if (LP) {
        localPlans = JSON.parse(LP)
      }
    }

    // Update if exists, otherwise add
    let updatedPlans = []
    const idToCompare = newPlan.id
    const existingIndex = localPlans.findIndex(
      (plan) => {
        return plan.id === idToCompare
      },
    )

    if (existingIndex !== -1) {
      // Replace existing plan
      updatedPlans = [...localPlans]
      updatedPlans[existingIndex] = newPlan
    } else {
      // Add new plan
      updatedPlans = [...localPlans, newPlan]
    }

    // Save to localStorage
    if (planType === 'monthly') {
      localStorage.setItem('agencyMonthlyPlans', JSON.stringify(updatedPlans))
    } else if (planType === 'Xbar') {
      localStorage.setItem('XBarOptions', JSON.stringify(updatedPlans))
    }

    // Update state
    setPlansList(updatedPlans)
    setFilteredList(updatedPlans)

    // Show success snack message
    const isEdit = existingIndex !== -1
    const planTypeName = planType === 'monthly' ? 'Subscription' : 'XBar'
    const message = isEdit
      ? `${planTypeName} plan updated successfully`
      : `${planTypeName} plan created successfully`
    setSnackMsg(message)
    setSnackMsgType(SnackbarTypes.Success)
  }

  //code to get the monthly plans

  const getMonthlyPlan = async () => {
    try {
      setInitialLoader(true)
      const localPlans = localStorage.getItem('agencyMonthlyPlans')
      if (localPlans) {
        setPlansList(JSON.parse(localPlans))
        setFilteredList(JSON.parse(localPlans))
      } //else {
      const Token = AuthToken()
      let ApiPath = Apis.getMonthlyPlan
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      }
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        setPlansList(response.data.data)
        setFilteredList(response.data.data)
        localStorage.setItem(
          'agencyMonthlyPlans',
          JSON.stringify(response.data.data),
        )
      }
    } catch (error) {
      setInitialLoader(false)
      console.error('Error occured in getting monthly plan', error)
    } finally {
      setInitialLoader(false)
    }
  }

  //code to get the XBar Options
  const getXBarOptions = async () => {
    try {
      setInitialLoader(true)
      const localXbarPlans = localStorage.getItem('XBarOptions')
      if (localXbarPlans) {
        const d = JSON.parse(localXbarPlans)
        setPlansList(JSON.parse(localXbarPlans))
        setFilteredList(JSON.parse(localXbarPlans))
      } //else {
      const Token = AuthToken()
      let ApiPath = Apis.getXBarOptions
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      }
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        setPlansList(response.data.data)
        setFilteredList(response.data.data)
        localStorage.setItem('XBarOptions', JSON.stringify(response.data.data))
      }
      // }
    } catch (error) {
      setInitialLoader(false)
    } finally {
      setInitialLoader(false)
    }
  }

  useEffect(() => {}, [planType])

  //code for closing popup
  const handleClosePlanPopUp = (mesg) => {
    setOpen(false)
    if (mesg) {
      setSnackMsg(mesg)
      setSnackMsgType(SnackbarTypes.Success)
      getPlanApiTrigerer()
    }
    setmoreDropdown(null)
    setAnchorEl(null)
    setSelectedPlan(null)
    setSelectedPlanDetails(null)
  }

  //code to del plan
  const handleDeletePlan = async () => {
    try {
      setDelLoading(true)
      const token = AuthToken()

      // Use selectedPlan.id instead of moreDropdown (which gets cleared when menu closes)
      const planId = selectedPlan?.id || moreDropdown
      if (!planId) {
        setSnackMsg('Plan ID is missing')
        setSnackMsgType(SnackbarTypes.Error)
        setDelLoading(false)
        setShowDeleteModal(false)
        return
      }

      let ApiPath = ''
      if (planType === 'monthly') {
        ApiPath = `${Apis.removeAgencyPlan}/${planId}`
      } else if (planType === 'Xbar') {
        ApiPath = `${Apis.removeAgencyXBar}/${planId}`
      }
      // return
      let delData = {}
      if (selectedAgency) {
        delData = { userId: selectedAgency.id }
      }
      const response = await axios.delete(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        data: delData,
      })

      if (response) {
        if (response.data?.status === true) {
          // Close modal and clear selections first
          setShowDeleteModal(false)
          setSelectedPlan(null)
          setSelectedPlanDetails(null)
          setmoreDropdown(null)
          setAnchorEl(null)
          
          // Refresh plans list
          getPlanApiTrigerer()
          
          // Set snackbar message after a small delay to ensure it shows after modal closes
          setTimeout(() => {
            const message = response.data?.message || 'Plan deleted successfully'
            setSnackMsg(message)
            setSnackMsgType(SnackbarTypes.Success)
          }, 100)
        } else if (response.data?.status === false) {
          setShowDeleteModal(false)
          setTimeout(() => {
            const message = response.data?.message || 'Failed to delete plan'
            setSnackMsg(message)
            setSnackMsgType(SnackbarTypes.Error)
          }, 100)
        } else {
          // Handle unexpected response structure
          setShowDeleteModal(false)
          setTimeout(() => {
            setSnackMsg('Plan deleted successfully')
            setSnackMsgType(SnackbarTypes.Success)
          }, 100)
        }
      }
    } catch (error) {
      setSnackMsg(
        error?.response?.data?.message ||
          'Failed to delete plan. Please try again.',
      )
      setSnackMsgType(SnackbarTypes.Error)
      setShowDeleteModal(false)
    } finally {
      setDelLoading(false)
    }
  }

  //code to show plan details only
  const showPlanDetails = (item) => {
    setSelectedPlanDetails(item)
    // if (planType === "monthly") {
    // } else {
    //     console.log("This is XBas so no details view")
    //     setSelectedPlanDetails(item);
    // }
  }

  //search change
  const handleSearchChange = (value) => {
    setSearchValue(value)

    if (!value) {
      setFilteredList(plansList) // reset if empty
    } else {
      const lower = value.toLowerCase()
      setFilteredList(
        plansList.filter(
          (item) => item.title?.toLowerCase().includes(lower),
          // item.email?.toLowerCase().includes(lower) || // optional
          // item.phone?.toLowerCase().includes(lower)   // optional
        ),
      )
    }
  }

  // Function to render icon with branding using mask-image
  const renderBrandedIcon = (iconPath, width, height, isActive) => {
    if (typeof window === 'undefined') {
      return (
        <div
          style={{
            width: width,
            height: height,
            minWidth: width,
            minHeight: height,
          }}
        />
      )
    }

    // Use brand color from state (which is updated when CSS variable changes)
    const iconColor = isActive
      ? `hsl(${brandColor || '270 75% 50%'})`
      : 'hsl(0 0% 50%)' // Muted gray for inactive state

    // Use mask-image approach: background color with icon as mask
    return (
      <div
        style={{
          width: width,
          height: height,
          minWidth: width,
          minHeight: height,
          backgroundColor: iconColor,
          WebkitMaskImage: `url(${iconPath})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskMode: 'alpha',
          maskImage: `url(${iconPath})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          transition: 'background-color 0.2s ease-in-out',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div className="w-full h-auto flex flex-col items-center ">
      {/* Code for snack msg */}
      <AgentSelectSnackMessage
        isVisible={snackMsg !== null}
        message={snackMsg}
        hide={() => {
          setSnackMsg(null)
        }}
        type={snackMsgType}
      />
      <div className="flex h-[60px] w-full flex-row items-center justify-between px-5 py-5 border-b">
        <div
          style={{
            fontSize: 24,
            fontWeight: '600',
            letterSpacing: '-1px',
          }}
        >
          Total Plans: {filteredList?.length ? filteredList.length : 0}
        </div>

        <div className="flex flex-row items-center gap-2">
          <NotficationsDrawer />
        </div>
      </div>
      <div className="m-0 w-11/12 max-w-[1300px] h-auto rounded-none flex flex-col items-center gap-1 p-0 bg-white">
        <div className="m-0 flex w-full flex-row items-center justify-between py-3 px-3 border-b border-[#eaeaea]">
          <div className="flex h-10 flex-row items-center gap-1 w-[22vw] min-w-0 flex-shrink-0 rounded-lg border border-gray-200 pl-1 pr-3 focus-within:border-2 focus-within:border-brand-primary transition-colors">
            <input
              type="text"
              placeholder="Search by name"
              className="min-w-0 flex-grow outline-none font-[500] text-sm border-none bg-transparent focus:outline-none focus:ring-0 flex-shrink-0 rounded-full"
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
          <button
            className="flex h-[40px] shrink-0 px-5 py-3 items-center justify-center bg-brand-primary text-white text-sm font-medium rounded-lg border-none outline-none shadow-md transition-shadow transition-transform duration-200 ease-out active:scale-[0.98] hover:shadow-lg"
            style={{
              boxShadow: '0 4px 6px -1px hsl(var(--brand-primary) / 0.1), 0 2px 4px -2px hsl(var(--brand-primary) / 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 15px -3px hsl(var(--brand-primary) / 0.25), 0 4px 6px -4px hsl(var(--brand-primary) / 0.25)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px hsl(var(--brand-primary) / 0.1), 0 2px 4px -2px hsl(var(--brand-primary) / 0.1)'
            }}
            onClick={() => {
              setIsEditPlan(false)
              setSelectedPlan(null)
              setSelectedPlanDetails(null)
              setmoreDropdown(null)
              setTimeout(() => {
                handleAddPlan()
              }, 300)
            }}
          >
            New Plan
          </button>
        </div>
        <div className="m-0 w-full flex flex-row gap-3 border-b border-gray-200">
          <div
            className="flex w-full flex-row gap-3 text-sm"
            style={{ fontWeight: '500' }}
          >
            <div
              className={`py-3 flex flex-row items-center px-3 ${planType === 'monthly' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-black'} gap-2`}
            >
              {renderBrandedIcon(
                planType === 'monthly'
                  ? '/agencyIcons/focusMonthlyPln.png'
                  : '/agencyIcons/unFocusMonthlyPln.png',
                16,
                16,
                planType === 'monthly',
              )}
              <button
                className={`transition-transform duration-200 ease-out active:scale-[0.98] ${planType === 'monthly' ? 'text-brand-primary' : 'text-black'}`}
                onClick={() => {
                  setPlanType('monthly')
                }}
              >
               Subscriptions
              </button>
            </div>
            <div
              className={`py-3 px-3 ${planType === 'Xbar' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-black'} flex flex-row items-center gap-2`}
            >
              {renderBrandedIcon(
                planType === 'Xbar'
                  ? '/agencyIcons/focusXBar.png'
                  : '/agencyIcons/UnFocusXBar.png',
                16,
                16,
                planType === 'Xbar',
              )}
              <button
                className={`transition-transform duration-200 ease-out active:scale-[0.98] ${planType === 'Xbar' ? 'text-brand-primary' : 'text-black'}`}
                onClick={() => {
                  setPlanType('Xbar')
                }}
              >
                XBar Options
              </button>
            </div>
          </div>
        </div>

        {filteredList?.length > 0 ? (
          <>
            <div className="m-0 w-full flex flex-row justify-between py-3 px-3 uppercase">
              <div className="w-3/12">
                <div style={styles.text}>Name</div>
              </div>
              <div className="w-3/12">
                <div style={styles.text}>Description</div>
              </div>
              <div className="w-1/12">
                <div style={styles.text}>Price</div>
              </div>
              <div className="w-2/12">
                <div style={styles.text}>Accounts</div>
              </div>
              <div className="w-1/12">
                <div style={styles.text}>Credits</div>
              </div>
              <div className="w-1/12">
                <div style={styles.text}>Action</div>
              </div>
            </div>

            <div
              className={`h-[71vh] overflow-auto w-full `}
              id="scrollableDiv1"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="w-full">
                {initialLoader ? (
                  <div className="w-full flex flex-row items-center justify-center">
                    <CircularProgress size={30} />
                  </div>
                ) : (
                  <div className="h-auto w-full text-sm">
                    <div className="flex flex-col gap-[2px] text-sm">
                      {filteredList
                        .slice()
                        .reverse()
                        .map((item) => (
                          <div
                            key={item.id}
                            style={{ cursor: 'pointer' }}
                            className="m-0 h-auto w-full flex flex-row justify-between items-center py-[12px] px-3 border-b border-[#eaeaea] hover:bg-black/[0.02]"
                          >
                            <div
                              className="w-3/12 flex flex-row gap-2 items-center cursor-pointer flex-shrink-0"
                              onClick={() => {
                                showPlanDetails(item)
                              }}
                            >
                              <div
                                style={{ ...styles.text2, ...{ width: '80%' } }}
                              >
                                {item.title}{' '}
                                {item.hasTrial == true &&
                                  `| ${item.trialValidForDays || 0} Day Free Trial`}
                              </div>
                            </div>
                            <div
                              className="w-3/12"
                              onClick={() => {
                                showPlanDetails(item)
                              }}
                            >
                              <div style={styles.text2}>
                                {item.planDescription}
                              </div>
                            </div>
                            <div
                              className="w-1/12"
                              onClick={() => {
                                showPlanDetails(item)
                              }}
                            >
                              <div style={styles.text2}>
                                ${formatFractional2(item.discountedPrice) || 0}
                              </div>
                            </div>
                            <div
                              className="w-2/12"
                              onClick={() => {
                                showPlanDetails(item)
                              }}
                            >
                              <div style={styles.text2}>
                                {item.subscriberCount || 0}
                              </div>
                            </div>
                            <div
                              className="w-1/12"
                              onClick={() => {
                                showPlanDetails(item)
                              }}
                            >
                              {item.minutes || 'X'}
                            </div>

                            <div className="w-1/12 relative">
                              <button
                                id={`dropdown-toggle-${item.id}`}
                                onClick={(e) => {
                                  setAnchorEl(e.currentTarget)
                                  setSelectedPlan(item)
                                  setmoreDropdown(item.id)
                                }}
                              >
                                <Image
                                  src={'/svgIcons/threeDotsIcon.svg'}
                                  height={16}
                                  width={16}
                                  alt="menu"
                                />
                              </button>

                              <Menu
                                anchorEl={anchorEl}
                                open={
                                  Boolean(anchorEl) && moreDropdown === item.id
                                }
                                onClose={() => {
                                  setAnchorEl(null)
                                  setmoreDropdown(null)
                                }}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'right',
                                }}
                                transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'right',
                                }}
                                {...getAgencySelectMenuProps()}
                              >
                                <MenuItem
                                  onClick={() => {
                                    setAnchorEl(null)
                                    setmoreDropdown(null)
                                    if (selectedPlan?.subscriberCount > 0) {
                                      setSnackMsg(
                                        'Cannot edit plan with active subscriptions.',
                                      )
                                      setSnackMsgType(SnackbarTypes.Warning)
                                    } else {
                                      setIsEditPlan(true)
                                      setOpen(true)
                                    }
                                  }}
                                >
                                  Edit
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setAnchorEl(null)
                                    setmoreDropdown(null)
                                    setShowDeleteModal(true)
                                  }}
                                >
                                  Delete
                                </MenuItem>
                              </Menu>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            className="text-center mt-4"
            style={{ fontWeight: 'bold', fontSize: 20 }}
          >
            {planType === 'monthly' ? (
              <div className="h-full w-full flex flex-col items-center justify-center">
                <Image
                  alt="*"
                  src={'/agencyIcons/nomonthlyplan.jpg'}
                  height={230}
                  width={420}
                />
                <div
                  className="-mt-32"
                  style={{ fontWeight: '600', fontSize: 22 }}
                >
                  No Plans
                </div>
                <div
                  className="mt-4"
                  style={{ fontWeight: '600', fontSize: 16 }}
                >
                  You have no monthly plans created
                </div>
                <button
                  className="mt-3 flex h-[40px] shrink-0 px-5 py-3 items-center justify-center bg-brand-primary text-white rounded-lg text-sm font-medium border-none outline-none shadow-md transition-shadow transition-transform duration-200 ease-out active:scale-[0.98] hover:shadow-lg w-[209px]"
                  style={{
                    fontSize: 14,
                    boxShadow: '0 4px 6px -1px hsl(var(--brand-primary) / 0.1), 0 2px 4px -2px hsl(var(--brand-primary) / 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px hsl(var(--brand-primary) / 0.25), 0 4px 6px -4px hsl(var(--brand-primary) / 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px hsl(var(--brand-primary) / 0.1), 0 2px 4px -2px hsl(var(--brand-primary) / 0.1)'
                  }}
                  onClick={() => {
                    setIsEditPlan(false)
                    setSelectedPlan(null)
                    setmoreDropdown(null)
                    setSelectedPlanDetails(null)
                    handleAddPlan()
                  }}
                >
                  Create New Plan
                </button>
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center">
                <Image
                  alt="*"
                  src={'/agencyIcons/noXBarPlans.jpg'}
                  height={230}
                  width={420}
                />
                <div
                  className="-mt-32"
                  style={{ fontWeight: '600', fontSize: 22 }}
                >
                  No XBar
                </div>
                <div
                  className="mt-4"
                  style={{ fontWeight: '600', fontSize: 16 }}
                >
                  You have no Xbars created
                </div>
                <button
                  className="mt-3 flex h-[40px] shrink-0 px-5 py-3 items-center justify-center bg-brand-primary text-white rounded-lg text-sm font-medium border-none outline-none shadow-md transition-shadow transition-transform duration-200 ease-out active:scale-[0.98] hover:shadow-lg w-[209px]"
                  style={{
                    fontSize: 14,
                    boxShadow: '0 4px 6px -1px hsl(var(--brand-primary) / 0.1), 0 2px 4px -2px hsl(var(--brand-primary) / 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px hsl(var(--brand-primary) / 0.25), 0 4px 6px -4px hsl(var(--brand-primary) / 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px hsl(var(--brand-primary) / 0.1), 0 2px 4px -2px hsl(var(--brand-primary) / 0.1)'
                  }}
                  onClick={handleAddPlan}
                >
                  Create XBar
                </button>
              </div>
            )}
          </div>
        )}

        {/* code for modals */}

        {planType === 'monthly' && open ? (
          <AddMonthlyPlanAnimation
            open={open}
            handleClose={handleClosePlanPopUp}
            onPlanCreated={handlePlanCreated}
            canAddPlan={canAddPlan}
            agencyPlanCost={agencyPlanCost}
            isEditPlan={isEditPlan}
            selectedPlan={selectedPlan}
            selectedAgency={selectedAgency}
          />
        ) : (
          <AddXBarPlan
            open={open}
            handleClose={handleClosePlanPopUp}
            onPlanCreated={handlePlanCreated}
            agencyPlanCost={agencyPlanCost}
            isEditPlan={isEditPlan}
            selectedPlan={selectedPlan}
            selectedAgency={selectedAgency}
            isAgency={isAgency}
          />
        )}

        {/* Code for delete confirmation modal */}
        {showDeleteModal && (
          <DelConfirmationPopup
            showDeleteModal={showDeleteModal}
            handleClose={() => {
              setShowDeleteModal(false)
            }}
            delLoading={delLoading}
            handleDelete={() => {
              handleDeletePlan()
            }}
            selectedPlan={selectedPlan}
          />
        )}

        {/* Code for plan details */}
        {selectedPlanDetails && (
          <Modal
            open={selectedPlanDetails !== null}
            onClose={() => {
              setSelectedPlanDetails(null)
            }}
          >
            <Box
              className={`bg-transparent rounded-xl max-w-[80%] w-[34%] ${planType === 'monthly' ? 'h-[90vh]' : 'h-[35vh]'} border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
            >
              {planType === 'monthly' ? (
                <ConfigureSideUI
                  handleClose={() => {
                    setSelectedPlanDetails(null)
                  }}
                  // handleResetValues={handleResetValues}
                  allowedFeatures={selectedPlanDetails?.features}
                  noOfAgents={selectedPlanDetails?.maxAgents}
                  noOfContacts={selectedPlanDetails?.maxLeads}
                  basicsData={selectedPlanDetails}
                  // features={features}
                  allowTrial={selectedPlanDetails?.dynamicFeatures?.allowTrial}
                  trialValidForDays={selectedPlanDetails?.trialValidForDays}
                  from={'dashboard'}
                />
              ) : (
                <XBarSideUI
                  handleClose={() => {
                    setSelectedPlanDetails(null)
                  }}
                  title={selectedPlanDetails?.title}
                  tag={selectedPlanDetails?.tag}
                  planDescription={selectedPlanDetails?.planDescription}
                  originalPrice={selectedPlanDetails?.discountedPrice}
                  discountedPrice={selectedPlanDetails?.originalPrice}
                  minutes={selectedPlanDetails?.minutes}
                  from={'dashboard'}
                  isAgency={isAgency}
                />
              )}
            </Box>
          </Modal>
        )}
      </div>
      {/*
                <SupportFile />
            */}
    </div>
  );
}

export default DashboardPlans

const styles = {
  text: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.8)',
    fontWeight: '600',
    // textAlign: "start",
    // backgroundColor: "red"
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 14,
    color: 'rgba(0,0,0,0.8)',
    fontWeight: '500',
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
  planTypeHeading: {
    fontWeight: '600',
    fontSize: '18px',
  },
}
