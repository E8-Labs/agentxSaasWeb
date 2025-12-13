import { Box, CircularProgress, Menu, MenuItem, Modal } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
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

  // Sync planType when initialTab prop changes
  useEffect(() => {
    setPlanType(initialTab)
  }, [initialTab])
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

      console.log('Features array at dashboard plans is', featuresArray)

      // setCustomPlanFeatures(selectedPlanDetails.customFeatures);
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
      if (selectedAgency) {
        if (selectedAgency?.planCapabilities?.aiCreditRate) {
          setAgencyPlanCost(selectedAgency?.planCapabilities?.aiCreditRate)
        } else {
          setAgencyPlanCost(selectedAgency?.plan?.capabilities?.aiCreditRate)
        }
        console.log('Selected agency is UseEffect 88', selectedAgency)
        // setAgencyPlanCost(selectedAgency?.plan?.capabilities?.aiCreditRate);
      } else {
        let agencyFromLocal = u.user

        if (agencyFromLocal) {
          // const u = JSON.parse(agencyFromLocal);
          if (agencyFromLocal?.planCapabilities?.aiCreditRate) {
            setAgencyPlanCost(agencyFromLocal?.planCapabilities?.aiCreditRate)
          } else {
            setAgencyPlanCost(agencyFromLocal?.plan?.capabilities?.aiCreditRate)
          }
          console.log('LocalStorage agency is', agencyFromLocal)
          // const matchedPlan = u.find(plan => plan.id === currentPlanId);
          // console.log("Matched plan is", matchedPlan);
          // if (matchedPlan?.capabilities?.aiCreditRate) {
          //     console.log("matchedPlan plan is", matchedPlan)
          //     // capabilities?.aiCreditRate
          //     setAgencyPlanCost(matchedPlan?.capabilities?.aiCreditRate);
          // }
        }
      }
    }
  }, [selectedAgency])

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
    console.log('Trigered one 2')
    for (let i = 0; i < plansList?.length; i++) {
      if (plansList[i].hasTrial === true) {
        console.log('hasTrial is true at index', i)
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
    console.log('Status of stripe is', getStripe)
    if (!getStripe) {
      console.log('Show stripe warning ⚠️')
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
    console.log('Response received is:', response)
    let newPlan = response?.data?.data

    // Load existing plans based on type
    let localPlans = []
    if (planType === 'monthly') {
      console.log('')
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
    console.log('Local Plans list is', localPlans)

    // Update if exists, otherwise add
    let updatedPlans = []
    const idToCompare = newPlan.id
    const existingIndex = localPlans.findIndex(
      (plan) => plan.id === idToCompare,
    )

    if (existingIndex !== -1) {
      // Replace existing plan
      updatedPlans = [...localPlans]
      updatedPlans[existingIndex] = newPlan
    } else {
      // Add new plan
      updatedPlans = [...localPlans, newPlan]
    }

    console.log('Updated plans are', updatedPlans)
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
        console.log('Plans list is', JSON.parse(localPlans))
      } //else {
      const Token = AuthToken()
      let ApiPath = Apis.getMonthlyPlan
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      }
      console.log('Api path for dashboard monthly plans api is', ApiPath)
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        console.log('Response of get monthly plan api is', response.data)
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
      console.log('data recieved')
      setInitialLoader(false)
    }
  }

  //code to get the XBar Options
  const getXBarOptions = async () => {
    try {
      console.log('trigered xbar plaans api')
      setInitialLoader(true)
      const localXbarPlans = localStorage.getItem('XBarOptions')
      if (localXbarPlans) {
        const d = JSON.parse(localXbarPlans)
        console.log(d)
        setPlansList(JSON.parse(localXbarPlans))
        setFilteredList(JSON.parse(localXbarPlans))
      } //else {
      console.log('Passed here 1')
      const Token = AuthToken()
      let ApiPath = Apis.getXBarOptions
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      }
      console.log('Api path for dashboard monthly plans api is', ApiPath)
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        console.log('Response of XBar Option api is', response.data)
        setPlansList(response.data.data)
        setFilteredList(response.data.data)
        localStorage.setItem('XBarOptions', JSON.stringify(response.data.data))
      }
      // }
    } catch (error) {
      setInitialLoader(false)
      console.log('Error occured in getting XBar Option is', error.message)
    } finally {
      setInitialLoader(false)
      console.log('data recieved')
    }
  }

  useEffect(() => {
    console.log('Plan type is', planType)
  }, [planType])

  //code for closing popup
  const handleClosePlanPopUp = (mesg) => {
    setOpen(false)
    console.log('test check 23', mesg)
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
      console.log('api path is', ApiPath)
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
        console.log('Response of del plans api is', response.data)
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
            console.log('Setting success snackbar:', message)
            setSnackMsg(message)
            setSnackMsgType(SnackbarTypes.Success)
          }, 100)
        } else if (response.data?.status === false) {
          setShowDeleteModal(false)
          setTimeout(() => {
            const message = response.data?.message || 'Failed to delete plan'
            console.log('Setting error snackbar:', message)
            setSnackMsg(message)
            setSnackMsgType(SnackbarTypes.Error)
          }, 100)
        } else {
          // Handle unexpected response structure
          setShowDeleteModal(false)
          setTimeout(() => {
            console.log('Setting fallback snackbar')
            setSnackMsg('Plan deleted successfully')
            setSnackMsgType(SnackbarTypes.Success)
          }, 100)
        }
      }
    } catch (error) {
      console.log('Error found in del plan api is', error)
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
    console.log('Select plan is', item)
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

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')
    
    // Use brand color when active, muted gray when inactive
    const iconColor = isActive
      ? `hsl(${brandColor.trim() || '270 75% 50%'})`
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
    <div className="w-full flex flex-col items-center ">
      {/* Code for snack msg */}
      <AgentSelectSnackMessage
        isVisible={snackMsg !== null}
        message={snackMsg}
        hide={() => {
          setSnackMsg(null)
        }}
        type={snackMsgType}
      />

      <div className="flex w-full flex-row items-center justify-between px-5 py-5 border-b">
        <div
          style={{
            fontSize: 22,
            fontWeight: '700',
          }}
        >
          {/* AgencyName */}
          Plans
        </div>

        <div className="flex flex-row items-center gap-2">
          <NotficationsDrawer />
        </div>
      </div>

      <div className="w-[95%] h-[90vh] rounded-lg flex flex-col items-center  p-5 shadow-md">
        <div
          className="w-full h-32 flex flex-row items-center justify-between rounded-lg px-6 relative overflow-hidden"
          style={{
            backgroundImage: "url('/agencyIcons/plansBannerBg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Brand Color Overlay */}
          {isAgency && (
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                backgroundColor: 'hsl(var(--brand-primary) / 0.8)',
                mixBlendMode: 'multiply',
              }}
            />
          )}
          {/* Content */}
          <div className="relative z-10 flex flex-row items-center justify-between w-full">
            <div
              style={{
                fontSize: 29,
                fontWeight: '700',
                color: 'white',
              }}
            >
              Total Plans: {filteredList?.length ? filteredList.length : 0}
            </div>

            <button
              className="flex px-5 py-3 bg-white rounded-lg text-brand-primary font-medium"
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
        </div>

        <div className="w-full flex flex-row items-center justify-between ">
          <div
            className="px-4 mt-6 flex flex-row gap-4 border-b"
            style={{ fontSize: '15', fontWeight: '500', width: 'fit-content' }}
          >
            <div
              className={`pb-2 flex flex-row items-center px-4 ${planType === 'monthly' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-black'} gap-4`}
            >
              {renderBrandedIcon(
                planType === 'monthly'
                  ? '/agencyIcons/focusMonthlyPln.png'
                  : '/agencyIcons/unFocusMonthlyPln.png',
                23,
                25,
                planType === 'monthly',
              )}
              <button
                className={`${planType === 'monthly' ? 'text-brand-primary' : 'text-black'}`}
                onClick={() => {
                  setPlanType('monthly')
                }}
              >
               Subscriptions
              </button>
            </div>
            <div
              className={`pb-2 ${planType === 'Xbar' ? 'text-brand-primary border-b-2 border-brand-primary px-2' : 'text-black'} flex flex-row items-center gap-4`}
            >
              {renderBrandedIcon(
                planType === 'Xbar'
                  ? '/agencyIcons/focusXBar.png'
                  : '/agencyIcons/UnFocusXBar.png',
                24,
                24,
                planType === 'Xbar',
              )}
              <button
                className={`${planType === 'Xbar' ? 'text-brand-primary' : 'text-black'}`}
                onClick={() => {
                  setPlanType('Xbar')
                }}
              >
                XBar Options
              </button>
            </div>
          </div>
          <div className="flex flex-row items-center gap-1  w-[22vw] flex-shrink-0 border rounded-full px-4">
            <input
              style={{ fontSize: 15 }}
              type="text"
              placeholder="Search by name"
              className="flex-grow outline-none font-[500]  border-none focus:outline-none focus:ring-0 flex-shrink-0 rounded-full"
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value
                // handleSearchChange(value);
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
        </div>

        {filteredList?.length > 0 ? (
          <>
            <div className="w-full flex flex-row justify-between mt-4">
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
                  <div className="w-full">
                    <div>
                      {filteredList
                        .slice()
                        .reverse()
                        .map((item) => (
                          <div
                            key={item.id}
                            style={{ cursor: 'pointer' }}
                            className="w-full flex flex-row justify-between items-center mt-5 hover:bg-brand-primary/5 py-2"
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
                                console.log('Item is', item)
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
                                  height={24}
                                  width={24}
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
                  className="mt-3 bg-brand-primary text-white rounded-lg h-[50px] w-[209px]"
                  style={{ fontWeight: '500', fontSize: 15 }}
                  Create
                  New
                  Plan
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
                  className="mt-3 bg-brand-primary text-white rounded-lg h-[50px] w-[209px]"
                  style={{ fontWeight: '500', fontSize: 15 }}
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
  )
}

export default DashboardPlans

const styles = {
  text: {
    fontSize: 15,
    color: '#00000090',
    fontWeight: '600',
    // textAlign: "start",
    // backgroundColor: "red"
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
  planTypeHeading: {
    fontWeight: '600',
    fontSize: '18px',
  },
}
