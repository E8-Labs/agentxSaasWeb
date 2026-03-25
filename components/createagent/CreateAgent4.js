import 'react-phone-input-2/lib/style.css'

import { CircularProgress, Grow, Modal, Popover } from '@mui/material'
//import for input drop down menu
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { Key } from '@phosphor-icons/react'
import axios from 'axios'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import {
  HowToVideoTypes,
  HowtoVideos,
  PersistanceKeys,
} from '@/constants/Constants'
import { getVideoUrlByType } from '@/utils/tutorialVideos'
import UpgardView from '@/constants/UpgardView'
import { usePlanCapabilities } from '@/hooks/use-plan-capabilities'
import { useUser } from '@/hooks/redux-hooks'
import { getGlobalPhoneNumber } from '@/utilities/PhoneNumberUtility'

import AdminGetProfileDetails from '../admin/AdminGetProfileDetails'
import Apis from '../apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import ClaimNumber from '../dashboard/myagentX/ClaimNumber'
import { getLocalLocation } from '../onboarding/services/apisServices/ApiService'
import IntroVideoModal from './IntroVideoModal'
import PurchaseNumberSuccess from './PurchaseNumberSuccess'
import VideoCard from './VideoCard'

const CreateAgent4 = ({ handleContinue, handleBack }) => {
  const timerRef = useRef(null)
  const router = useRouter()
  const selectRef = useRef(null)

  // Redux user state
  const { user: userData, setUser: setUserData, token } = useUser()
  const { isFreePlan } = usePlanCapabilities()
  const [isFromAgencyOrAdmin, setIsFromAgencyOrAdmin] = useState(null)
  const [isSubaccount, setIsSubaccount] = useState(false)

  //agent type
  const [agentType, setAgentType] = useState('')
  //variable for video card
  const [introVideoModal, setIntroVideoModal] = useState(false)
  const [toggleClick, setToggleClick] = useState(false)
  const [selectNumber, setSelectNumber] = useState('')
  const [openCalimNumDropDown, setOpenCalimNumDropDown] = useState(false)
  const [reassignLoader, setReassignLoader] = useState(null)
  const [useOfficeNumber, setUseOfficeNumber] = useState(false)
  const [userSelectedNumber, setUserSelectedNumber] = useState('')
  const [showOfficeNumberInput, setShowOfficeNumberInput] = useState(false)
  const [officeNumber, setOfficeNumber] = useState('')
  const [showClaimPopup, setShowClaimPopup] = useState(false)
  const [previousNumber, setPreviousNumber] = useState([])
  //agent details variable
  const [AgentData, setAgentData] = useState(null)
  //show reassign btn or not
  const [showConfirmationModal, setShowConfirmationModal] = useState(null)
  const [showReassignBtn, setShowReassignBtn] = useState(false)
  const [showGlobalBtn, setShowGlobalBtn] = useState(true)
  //code for find numbers
  const [findNumber, setFindNumber] = useState('')
  const [findeNumberLoader, setFindeNumberLoader] = useState(false)
  const [foundeNumbers, setFoundeNumbers] = useState([])
  const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null)
  const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null)
  const [purchaseLoader, setPurchaseLoader] = useState(false)
  const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] =
    useState(false)

  const [callBackNumber, setCallBackNumber] = useState('')
  const [liveTransferMessage, setLiveTransferMessage] = useState(
    'Let me connect you to a live agent',
  )
  const [countryCode, setCountryCode] = useState('us')
  const [assignLoader, setAssignLoader] = useState(false)
  const [shouldContinue, setShouldContinue] = useState(true)
  const [errorMessage, setErrorMessage] = useState(false)
  const [officeErrorMessage, setOfficeErrorMessage] = useState(false)

  const [updatedUserData, setUpdatedUserData] = useState(null)
  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Error,
    message: '',
    isVisible: false,
  })

  const [isFromAdminOrAgency, setIsFromAdminOrAgency] = useState(null)

  useEffect(() => {
    getSubUserProfile()
    // Check if user is subaccount
    if (typeof window !== 'undefined') {
      try {
        const isFromAdmin = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
        if (isFromAdmin) {
          const parsedIsFromAdmin = JSON.parse(isFromAdmin)
          setIsFromAdminOrAgency(parsedIsFromAdmin)
        }
        const userData = localStorage.getItem('User')
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setIsSubaccount(
            parsedUser?.user?.userRole === 'AgencySubAccount' ||
            parsedUser?.userRole === 'AgencySubAccount',
          )
        }
      } catch (error) {}
    }
  }, [userData])

  useEffect(() => {
    const localData = localStorage.getItem('claimNumberData')

    const AT = localStorage.getItem('agentType')
    if (AT) {
      let t = JSON.parse(AT)
      setAgentType(t)
    }
    let loc = getLocalLocation()
    setCountryCode(loc)

    if (localData) {
      const claimNumberDetails = JSON.parse(localData)

      // //console.log;

      // if (claimNumberDetails.officeNo) {
      //   // //console.log;

      //   setUseOfficeNumber(true);
      //   setShowOfficeNumberInput(true);
      //   setOfficeNumber(claimNumberDetails.officeNo);
      // } else {
      //   setUserSelectedNumber(claimNumberDetails.usernumber2);
      // }
      // setCallBackNumber(claimNumberDetails.callBackNumber);
      // setSelectNumber(claimNumberDetails.userNumber);
      // setShouldContinue(false);
    }
    getAvailabePhoneNumbers()
    const localAgentsData = localStorage.getItem('agentDetails')
    if (localAgentsData) {
      const agetnDetails = JSON.parse(localAgentsData)
      // //console.log;
      setAgentData(agetnDetails?.agents[0])
      if (agetnDetails?.agents?.length === 2) {
        setShowReassignBtn(false)
      } else if (agetnDetails?.agents[0]?.agentType === 'inbound') {
        setShowReassignBtn(true)
        setShowGlobalBtn(false)
      }
    }
  }, [])

  // Update showGlobalBtn for subaccounts based on agency global number availability
  useEffect(() => {
    if (userData?.userRole === 'AgencySubAccount') {
      const globalNumber = getGlobalPhoneNumber(userData,isFromAdminOrAgency?.subAccountData?.id)
      // Only show global button if agency has a global number
      // Don't override if it was already set to false for inbound agents
      const localAgentsData = localStorage.getItem('agentDetails')
      if (localAgentsData) {
        const agetnDetails = JSON.parse(localAgentsData)
        if (agetnDetails?.agents[0]?.agentType !== 'inbound') {
          setShowGlobalBtn(globalNumber !== null)
        }
      } else {
        setShowGlobalBtn(globalNumber !== null)
      }
    }
  }, [userData])

  useEffect(() => {
    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;
    if (
      selectNumber || //&&
      // callBackNumber ||
      // !toggleClick &&
      // userSelectedNumber
      officeNumber ||
      isInboundOnly()
    ) {
      setShouldContinue(false)
    } else {
      setShouldContinue(true)
    }
  }, [
    selectNumber,
    userSelectedNumber,
    callBackNumber,
    toggleClick,
    useOfficeNumber,
    officeNumber,
  ])

  function isInboundOnly() {
    const localAgentsData = localStorage.getItem('agentDetails')
    if (localAgentsData) {
      const agentDetails = JSON.parse(localAgentsData)
      // //console.log;
      // setAgentData(agetnDetails.agents[0]);
      if (
        agentDetails.agents.length === 1 &&
        agentDetails?.agents[0]?.agentType == 'inbound'
      ) {
        return true
      }
    }
    return false
  }

  //code to format the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith('+') ? rawNumber : `+${rawNumber}`,
    )
    //// //console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : 'Invalid phone number'
  }

  const handleSelectNumber = (event) => {
    setSelectNumber(event.target.value)
  }

  const handleToggleClick = () => {
    setToggleClick(!toggleClick)
  }

  const isCallbackOfficeMode = useOfficeNumber

  //code to use office number
  const handleOfficeNumberClick = () => {
    setUserSelectedNumber('')
    setUseOfficeNumber(!useOfficeNumber)
    setShowOfficeNumberInput(!showOfficeNumberInput)
  }

  const handleSelectedNumberClick = (item) => {
    // //console.log;
    setOfficeNumber('')
    setShowOfficeNumberInput(false)
    setUseOfficeNumber(false)
    setUserSelectedNumber(item)
  }

  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false)
  }

  //code for phone number inputs functions
  const handleCallBackNumberChange = (phone) => {
    setCallBackNumber(phone)
    validatePhoneNumber(phone)

    if (!phone) {
      setErrorMessage('')
      setOfficeErrorMessage('')
    }
  }

  //code for reassigning the number api
  const handleReassignNumber = async (item) => {
    try {
      // //console.log;

      setReassignLoader(item)
      // Use Redux token instead of localStorage
      if (!token) {
        console.error('No token available')
        setReassignLoader(null)
        return
      }
      const agentDetails = localStorage.getItem('agentDetails')
      let MyAgentData = null

      if (agentDetails) {
        // //console.log;
        setShowConfirmationModal(null)
        const agentData = JSON.parse(agentDetails)
        // //console.log;
        MyAgentData = agentData
      }

      const ApiPath = Apis.reassignNumber

      const ApiData = {
        agentId: item.claimedBy.id, //MyAgentData.agents[0].id,
        phoneNumber: item.phoneNumber,
        newAgentId: MyAgentData.agents[0].id,
      }
      // //console.log;

      // //console.log;
      // //console.log;
      // //console.log;

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        setSelectNumber(
          item?.phoneNumber?.startsWith('+')
            ? item.phoneNumber.slice(1)
            : item.phoneNumber,
        )
        setOpenCalimNumDropDown(false)
        //code to close the dropdown
        if (selectRef.current) {
          selectRef.current.blur() // Triggers dropdown close
        }

        // if (response.data.status === true) {
        //     setSelectNumber(phoneNumber);
        // } else {
        //     setSelectNumber(phoneNumber);
        // }
      }
    } catch (error) {
      // console.error("Error occured in reassign the number api:", error);
    } finally {
      setReassignLoader(null)
      // //console.log;
    }
  }

  //code for office number change
  const handleOfficeNumberChange = (phone, e) => {
    setOfficeNumber(phone)
    validatePhoneNumber(phone, e)
    setUserSelectedNumber('')

    if (!phone) {
      setErrorMessage('')
      setOfficeErrorMessage('')
    }
  }

  //phone validation
  //number validation
  const validatePhoneNumber = (phoneNumber, e) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(
      `+${phoneNumber}`,
      countryCode?.toUpperCase(),
    )
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      if (e) {
        setOfficeErrorMessage('Invalid')
      } else {
        setErrorMessage('Invalid')
      }
    } else {
      setErrorMessage('')
      setOfficeErrorMessage('')

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // setCheckPhoneResponse(null);
      // //console.log;

      timerRef.current = setTimeout(() => {
        // checkPhoneNumber(phoneNumber);
      }, 300)
    }
  }

  //code to select Purchase number
  const handlePurchaseNumberClick = (item, index) => {
    // //console.log;
    localStorage.setItem('numberPurchased', JSON.stringify(item))
    setSelectedPurchasedNumber((prevId) => (prevId === item ? null : item))
    setSelectedPurchasedIndex((prevId) => (prevId === index ? null : index))
  }

  const getSubUserProfile = async () => {
    const localData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
    if (localData) {
      const data = JSON.parse(localData)
      // setIsFromAgencyOrAdmin(data);
      const subUserProfile = await AdminGetProfileDetails(
        data.subAccountData.id,
      )
      setIsFromAgencyOrAdmin(subUserProfile)
    }
  }

  //get available phonenumbers
  const getAvailabePhoneNumbers = async () => {
    try {
      // Use Redux token instead of AuthToken()
      if (!token) {
        console.error('No token available')
        return
      }

      let userId = null
      const U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
      if (U) {
        // const d = JSON.parse(U);
        // console.log("Subaccount data recieved on createagent_1 screen is", d);
        // userId = d.subAccountData.id;
        try {
          const d = JSON.parse(U)
          userId = d.subAccountData.id
        } catch (e) {
          console.error('Failed to parse isFromAdminOrAgency', e)
        }
      }

      // //console.log;
      let ApiPath = null
      if (U) {
        ApiPath = `${Apis.userAvailablePhoneNumber}?userId=${userId}`
      } else {
        ApiPath = Apis.userAvailablePhoneNumber
      }
      // //console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      if (response) {
        setPreviousNumber(response.data.data)
      }
    } catch (error) {
      // console.error("Error occured in: ", error);
    } finally {
      // //console.log;
    }
  }

  //get main agent id
  const AssignNumber = async () => {
    // //console.log;
    // const isInboundOnly = isInboundOnly()
    try {
      // setAssignLoader(true);
      // Use Redux token instead of localStorage
      if (!token) {
        console.error('No token available')
        setAssignLoader(false)
        return
      }
      let MyAgentData = null
      const agentDetails = localStorage.getItem('agentDetails')

      if (agentDetails) {
        // //console.log;
        const agentData = JSON.parse(agentDetails)
        // //console.log;
        MyAgentData = agentData
      }

      const formData = new FormData()
      formData.append('phoneNumber', selectNumber)
      if (userSelectedNumber) {
        formData.append('callbackNumber', userSelectedNumber.phoneNumber)
      } else {
        formData.append('callbackNumber', officeNumber)
      }
      formData.append('liveTransferNumber', callBackNumber)
      formData.append('mainAgentId', MyAgentData.id)
      formData.append('liveTransfer', !toggleClick)
      if (!toggleClick && liveTransferMessage?.trim()) {
        formData.append(
          'liveTransferMessage',
          liveTransferMessage.trim(),
        )
      }

      const ApiPath = Apis.asignPhoneNumber

      for (let [key, value] of formData.entries()) {
        // console.log(`key: ${key}, value: ${value}`);
      }
      // return;
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      if (response) {
        if (response.data.status === true) {
          setOpenCalimNumDropDown(false)
          // handleContinue();
          const calimNoData = {
            officeNo: officeNumber,
            userNumber: selectNumber,
            usernumber2: userSelectedNumber,
            callBackNumber: callBackNumber,
          }
          localStorage.setItem('claimNumberData', JSON.stringify(calimNoData))
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.response?.data || error.message)
      } else {
        console.error('General error:', error)
      }
    } finally {
      // //console.log;
      setAssignLoader(false)
    }
  }

  // const PhoneNumbers = [
  //     {
  //         id: 1,
  //         number: "03011958712"
  //     },
  //     {
  //         id: 2,
  //         number: "03281575712"
  //     },
  //     {
  //         id: 3,
  //         number: "03058191079"
  //     },
  // ]

  const styles = {
    headingStyle: {
      fontSize: 15,
      fontWeight: '600',
    },
    inputStyle: {
      fontSize: 14,
      fontWeight: '400',
      color: '#000000',
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: '500',
      color: '#000000',
    },
    callBackStyles: {
      // height: "71px", //width: "210px",
      border: '1px solid #15151550',
      borderRadius: '20px',
      fontWeight: '500',
      fontSize: 15,
    },
    claimPopup: {
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
    findNumberTitle: {
      fontSize: 17,
      fontWeight: '500',
    },
    findNumberDescription: {
      fontSize: 15,
      fontWeight: '500',
    },
  }

  const labelClassName = 'text-[14px] font-normal leading-[1.6] text-black'

  const inputShellClassName =
    'bg-white border-[0.5px] border-black/10 rounded-[8px] h-[40px] w-full flex items-center px-[10px] gap-3 transition-colors focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-brand-primary/20'

  const checkboxShellClassName =
    'flex items-start gap-3 px-3 py-2 w-full select-none rounded-[8px] transition-colors hover:bg-black/[0.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30'

  const firecrawlMenuPaperSx = {
    mt: 1,
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.10)',
    boxShadow:
      '0 18px 60px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  }

  const firecrawlMenuListSx = {
    p: 0.75,
    '& .MuiMenuItem-root': {
      borderRadius: '10px',
      minHeight: 40,
      padding: '10px 10px',
      fontSize: 14,
      fontWeight: 400,
      transition:
        'background-color 140ms ease, transform 140ms ease, color 140ms ease',
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.04)',
      },
      '&:active': {
        transform: 'scale(0.99)',
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(0,0,0,0.02)',
        color: 'rgba(0,0,0,1)',
        opacity: 1,
      },
      '&.Mui-selected:hover': {
        backgroundColor: 'rgba(0,0,0,0.02)',
      },
    },
  }

  const firecrawlSelectSx = (disabled = false) => ({
    ...styles.dropdownMenu,
    backgroundColor: '#FFFFFF',
    height: 40,
    borderRadius: '8px',
    width: '100%',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      height: 40,
      padding: 0,
    },
    '& .MuiSelect-icon': {
      color: 'rgba(0,0,0,0.7)',
      transition: 'transform 160ms ease',
    },
    '&[aria-expanded="true"] .MuiSelect-icon': {
      transform: 'rotate(180deg)',
    },
    opacity: disabled ? 0.55 : 1,
    transition: 'opacity 160ms ease, background-color 160ms ease',
  })

  const firecrawlSelectMenuProps = {
    TransitionComponent: Grow,
    transitionDuration: { enter: 170, exit: 120 },
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
    PaperProps: { sx: firecrawlMenuPaperSx },
    MenuListProps: { sx: firecrawlMenuListSx },
  }

  const FauxCheckbox = ({ checked, onToggle, label }) => {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={checkboxShellClassName}
        aria-pressed={checked}
      >
        <span
          aria-hidden="true"
          className={[
            'relative inline-flex size-4 items-center justify-center rounded-[4px] border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] transition-colors',
            checked
              ? 'border-brand-primary bg-brand-primary'
              : 'border-black/10 bg-white',
          ].join(' ')}
        >
          {checked ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="block"
            >
              <path
                d="M10 3.5L5 8.5L2 5.5"
                stroke="#ffffff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="text-[14px] leading-[1.6] tracking-[-0.06px] text-[#666] text-left">
          {label}
        </span>
      </button>
    )
  }

  const normalizePhone = (value) => {
    if (!value) return ''
    return String(value).replaceAll(' ', '').replaceAll('-', '')
  }

  const callbackSelectValue =
    userSelectedNumber?.phoneNumber && !isCallbackOfficeMode
      ? userSelectedNumber.phoneNumber
      : ''

  return (
    <div className="bg-white w-full h-[100svh] overflow-hidden">
      <div className="relative flex w-full h-[100svh]">
        {/* Left panel */}
        <div className="relative bg-[#f9f9f9] w-full lg:basis-[65%] lg:flex-[0_0_65%] flex flex-col h-[100svh] overflow-hidden">
          {/* Video positioned outside left border */}
          <div className="pointer-events-none absolute inset-0 z-[15] hidden lg:flex items-end justify-end p-6 pr-8 pb-[92px]">
            <div
              className="pointer-events-auto w-fit rounded-[12px] bg-white"
              style={{
                border: '1px solid #eaeaea',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
              }}
            >
              <VideoCard
                duration={'1:52'}
                horizontal={false}
                playVideo={() => {
                  setIntroVideoModal(true)
                }}
                title="Learn about phone numbers"
                videoUrl={
                  getVideoUrlByType(HowToVideoTypes.PhoneNumbers) ||
                  HowtoVideos.LetsTalkDigits
                }
                hoverReveal
                hideCta
                className="rounded-[12px] border-0 bg-transparent shadow-none"
              />
            </div>
          </div>

          <AgentSelectSnackMessage
            message={showSnackMsg.message}
            type={showSnackMsg.type}
            isVisible={showSnackMsg.isVisible}
            hide={() =>
              setShowSnackMsg({ type: null, message: '', isVisible: false })
            }
          />

          {/* Video modal */}
          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle="Learn about phone numbers"
            videoUrl={
              getVideoUrlByType(HowToVideoTypes.PhoneNumbers) ||
              HowtoVideos.LetsTalkDigits
            }
          />

          {/* header */}
          <div className="sticky top-0 z-40 shrink-0 bg-[#f9f9f9] shadow-[0_1px_0_0_rgba(21,21,21,0.08)]">
            <Header variant="createAgentToolbar" />
          </div>

          {/* body wrapper */}
          <div className="flex-1 w-full flex justify-center overflow-y-auto">
            <div className="w-full max-w-[600px] flex flex-col items-center gap-3 p-6">
              <div className="w-full text-center text-[22px] font-semibold leading-[30px] tracking-[-0.77px] text-black">
                {`Let's talk digits`}
              </div>

              <div className="w-full flex flex-col items-start gap-3 pb-6 pt-3">
                {/* Call-with number */}
                <div className="w-full flex flex-col gap-2 items-start">
                  <div className={labelClassName}>
                    {`Select a phone number you'd like to use to call with`}
                  </div>

                  <div className={inputShellClassName}>
                    <Box className="w-full">
                      <FormControl className="w-full">
                        <Select
                          ref={selectRef}
                          open={openCalimNumDropDown}
                          onClose={() => setOpenCalimNumDropDown(false)}
                          onOpen={() => setOpenCalimNumDropDown(true)}
                          MenuProps={firecrawlSelectMenuProps}
                          displayEmpty
                          value={selectNumber}
                          onChange={(e) => {
                            const value = e.target.value
                            if (agentType?.agentType !== 'inbound') {
                              setSelectNumber(value)
                              setOpenCalimNumDropDown(false)
                            }
                          }}
                          renderValue={(selected) => {
                            if (selected === '') {
                              return (
                                <div className="text-black/70 text-[14px] leading-[1.6]">
                                  Select Number
                                </div>
                              )
                            }
                            return (
                              <div className="text-black text-[14px] leading-[1.6]">
                                {selected}
                              </div>
                            )
                          }}
                          sx={firecrawlSelectSx(false)}
                        >
                          {previousNumber.map((item, index) => (
                            (() => {
                              const itemValue = item?.phoneNumber?.startsWith('+')
                                ? item?.phoneNumber.slice(1)
                                : item?.phoneNumber
                              const isSelected =
                                normalizePhone(selectNumber) ===
                                normalizePhone(itemValue)
                              return (
                            <MenuItem
                              key={index}
                              style={styles.dropdownMenu}
                              value={itemValue}
                              selected={isSelected}
                              disabled={
                                typeof selectNumber === 'string' &&
                                selectNumber.replace('+', '') ===
                                  item.phoneNumber.replace('+', '')
                              }
                              className="flex flex-row items-center gap-2"
                              onClick={(e) => {
                                if (showReassignBtn && item?.claimedBy) {
                                  e.stopPropagation()
                                  setShowConfirmationModal(item)
                                } else {
                                  setSelectNumber(item.phoneNumber)
                                  AssignNumber()
                                }
                              }}
                            >
                              <div className="flex w-full items-center gap-3">
                                <div className="flex-1 min-w-0 truncate">
                                  {item.phoneNumber}
                                </div>
                                {isSelected ? (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    className="shrink-0"
                                  >
                                    <path
                                      d="M13.3333 4.66675L6.66667 11.3334L3.33333 8.00008"
                                      stroke="hsl(var(--brand-primary))"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : null}
                              </div>
                              {showReassignBtn && (
                                <div>
                                  {item.claimedBy && (
                                    <div
                                      className="flex flex-row items-center"
                                      onClick={(e) => {
                                        if (item?.claimedBy) {
                                          e.stopPropagation()
                                          setShowConfirmationModal(item)
                                        }
                                      }}
                                    >
                                      <div className="text-[#15151570] me-1">
                                        (Claimed by {item.claimedBy.name})
                                      </div>
                                      {reassignLoader?.claimedBy?.id ===
                                      item.claimedBy.id ? (
                                        <CircularProgress size={15} />
                                      ) : (
                                        <button
                                          className="text-brand-primary underline"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setShowConfirmationModal(item)
                                          }}
                                        >
                                          Reassign
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </MenuItem>
                              )
                            })()
                          ))}
                          {showGlobalBtn &&
                            getGlobalPhoneNumber(userData, isFromAdminOrAgency) && (
                              (() => {
                                const globalValue =
                                  getGlobalPhoneNumber(
                                    userData,
                                    isFromAdminOrAgency,
                                  )?.replace('+', '') || ''
                                const isSelected =
                                  normalizePhone(selectNumber) ===
                                  normalizePhone(globalValue)
                                return (
                              <MenuItem
                                style={styles.dropdownMenu}
                                value={globalValue}
                                selected={isSelected}
                              >
                                <div className="flex w-full items-center gap-3">
                                  <div className="flex-1 min-w-0 truncate">
                                    {getGlobalPhoneNumber(
                                      userData,
                                      isFromAdminOrAgency,
                                    )}
                                    {' (available for testing calls only)'}
                                  </div>
                                  {isSelected ? (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      aria-hidden="true"
                                      className="shrink-0"
                                    >
                                      <path
                                        d="M13.3333 4.66675L6.66667 11.3334L3.33333 8.00008"
                                        stroke="hsl(var(--brand-primary))"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  ) : null}
                                </div>
                              </MenuItem>
                                )
                              })()
                            )}
                          <div className="ms-4 py-2 text-[14px] leading-[1.6] text-black/70">
                            <i>Get your own unique phone number.</i>{' '}
                            <button
                              className="text-brand-primary underline"
                              onClick={() => {
                                setShowClaimPopup(true)
                              }}
                            >
                              Claim one
                            </button>
                          </div>
                        </Select>
                      </FormControl>
                    </Box>
                  </div>

                  {/* Code for Purchase and find number popup */}
                  {showClaimPopup && (
                    <ClaimNumber
                      showClaimPopup={showClaimPopup}
                      handleCloseClaimPopup={handleCloseClaimPopup}
                      setOpenCalimNumDropDown={setOpenCalimNumDropDown}
                      setSelectNumber={(number) => {
                        setSelectNumber(number)
                      }}
                      setPreviousNumber={(numbers) => {
                        setPreviousNumber(numbers)
                      }}
                      previousNumber={previousNumber}
                    />
                  )}

                  {/* Code for Purchase number success popup */}
                  <Modal
                    open={openPurchaseSuccessModal}
                    // onClose={() => setAddKYCQuestion(false)}
                    closeAfterTransition
                    BackdropProps={{
                      timeout: 1000,
                      sx: {
                        backgroundColor: '#00000020',
                        // //backdropFilter: "blur(20px)",
                      },
                    }}
                  >
                    <Box
                      className="lg:w-8/12 sm:w-full w-8/12"
                      sx={styles.claimPopup}
                    >
                      <div className="flex flex-row justify-center w-full">
                        <div
                          className="sm:w-8/12 w-full min-h-[50vh] max-h-[80vh] flex flex-col justify-between"
                          style={{
                            backgroundColor: '#ffffff',
                            padding: 20,
                            borderRadius: '13px',
                          }}
                        >
                          <div>
                            <div className="flex flex-row justify-end">
                              {/* <button onClick={() => { setOpenPurchaseSuccessModal(false) }}>
                                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                                    </button> */}
                            </div>
                            <PurchaseNumberSuccess
                              selectedNumber={selectedPurchasedNumber}
                              handleContinue={() => {
                                setOpenPurchaseSuccessModal(false)
                              }}
                              isFreePlan={isFreePlan}
                            />
                          </div>
                        </div>
                      </div>
                    </Box>
                  </Modal>

                </div>

                {/* Callback number (dropdown + office checkbox) */}
                <div className="w-full flex flex-col gap-2 items-start">
                  <div className={labelClassName}>
                    What callback number should we use if someone requests one
                    during a call?
                  </div>

                  <div className={inputShellClassName}>
                    <Box className="w-full">
                      <FormControl className="w-full">
                        <Select
                          displayEmpty
                          value={callbackSelectValue}
                          disabled={isCallbackOfficeMode}
                          MenuProps={firecrawlSelectMenuProps}
                          onChange={(e) => {
                            const value = e.target.value
                            const selected = previousNumber.find((n) => {
                              return (
                                normalizePhone(n?.phoneNumber) ===
                                  normalizePhone(value) ||
                                normalizePhone(
                                  n?.phoneNumber?.replace('+', ''),
                                ) === normalizePhone(value)
                              )
                            })
                            setUserSelectedNumber(selected || '')
                            if (selected) {
                              setUseOfficeNumber(false)
                              setShowOfficeNumberInput(false)
                              setOfficeNumber('')
                            }
                          }}
                          renderValue={(selected) => {
                            if (!selected) {
                              return (
                                <div className="text-black/70 text-[14px] leading-[1.6]">
                                  Select Number
                                </div>
                              )
                            }
                            const selectedItem = previousNumber.find((n) => {
                              return (
                                normalizePhone(n?.phoneNumber) ===
                                  normalizePhone(selected) ||
                                normalizePhone(
                                  n?.phoneNumber?.replace('+', ''),
                                ) === normalizePhone(selected)
                              )
                            })
                            return (
                              <div className="text-black text-[14px] leading-[1.6]">
                                {selectedItem?.phoneNumber
                                  ? formatPhoneNumber(selectedItem.phoneNumber)
                                  : selected}
                              </div>
                            )
                          }}
                          sx={firecrawlSelectSx(isCallbackOfficeMode)}
                        >
                          {previousNumber.map((item, index) => (
                            (() => {
                              const isSelected =
                                normalizePhone(callbackSelectValue) ===
                                normalizePhone(item.phoneNumber)
                              return (
                            <MenuItem
                              key={index}
                              style={styles.dropdownMenu}
                              value={item.phoneNumber}
                              selected={isSelected}
                            >
                              <div className="flex w-full items-center gap-3">
                                <div className="flex-1 min-w-0 truncate">
                                  {formatPhoneNumber(item.phoneNumber)}
                                </div>
                                {isSelected ? (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                    className="shrink-0"
                                  >
                                    <path
                                      d="M13.3333 4.66675L6.66667 11.3334L3.33333 8.00008"
                                      stroke="hsl(var(--brand-primary))"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : null}
                              </div>
                            </MenuItem>
                              )
                            })()
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </div>

                  <FauxCheckbox
                    checked={isCallbackOfficeMode}
                    onToggle={() => {
                      if (isCallbackOfficeMode) {
                        setUseOfficeNumber(false)
                        setShowOfficeNumberInput(false)
                        setOfficeNumber('')
                      } else {
                        setUserSelectedNumber('')
                        setUseOfficeNumber(true)
                        setShowOfficeNumberInput(true)
                      }
                    }}
                    label="Use my cell or office number"
                  />

                  {showOfficeNumberInput ? (
                    <div className="w-full flex flex-col items-start gap-2">
                      <div className="text-[14px] font-normal leading-[1.6] text-black">
                        Enter your cell or office number
                      </div>

                      <div className="w-full">
                        <div className={inputShellClassName}>
                          <PhoneInput
                            containerClass="phone-input-container"
                            className="outline-none bg-transparent focus:ring-0 w-full"
                        country={'us'} // restrict to US only
                        onlyCountries={['us', 'mx','sv', 'ec']}
                        disableDropdown={true}
                        countryCodeEditable={false}
                        disableCountryCode={false}
                        value={officeNumber}
                        onChange={handleOfficeNumberChange}
                        placeholder={'Enter Phone Number'}
                        style={{
                          borderRadius: '8px',
                          border: 'none',
                          outline: 'none',
                          boxShadow: 'none',
                          width: '100%',
                          height: '40px',
                        }}
                        inputStyle={{
                          width: '100%',
                          borderWidth: '0px',
                          backgroundColor: 'transparent',
                          paddingLeft: '60px',
                          paddingTop: '0px',
                          paddingBottom: '0px',
                          paddingRight: '0px',
                          outline: 'none',
                          boxShadow: 'none',
                          height: '40px',
                          fontSize: '14px',
                          fontWeight: 400,
                        }}
                        buttonStyle={{
                          border: 'none',
                          backgroundColor: 'transparent',
                          outline: 'none',
                        }}
                        dropdownStyle={{
                          maxHeight: '150px',
                          overflowY: 'auto',
                        }}
                          />
                        </div>
                      </div>
                      {officeErrorMessage && (
                        <div
                          className="mt-2"
                          style={{ fontWeight: '500', fontSize: 11, color: 'red' }}
                        >
                          {officeErrorMessage}
                        </div>
                      )}
                    </div>
                  ) : (
                    ''
                  )}
                  {/* <Body /> */}
                </div>

                {/* Phone number input here */}
                {userData?.userRole === 'AgencySubAccount' &&
                userData?.agencyCapabilities?.allowLiveCallTransfer === false ? (
                  <div className="w-full h-[35vh] flex items-center justify-center">
                    <UpgardView
                      setShowSnackMsg={setShowSnackMsg}
                      title={'Enable Live Transfer'}
                      subTitle={
                        'Allow your AI to initiate live transfers during the call. This allows your team to receive hot leads mid conversation.'
                      }
                      userData={userData}
                      onUpgradeSuccess={(userData) => {
                        setUpdatedUserData(userData)
                        setUserData(userData)

                        setTimeout(() => {
                          const localStorageData = localStorage.getItem('User')
                        }, 100)
                      }}
                    />
                  </div>
                ) : isFromAgencyOrAdmin?.planCapabilities?.allowLiveCallTransfer ===
                    true ||
                  (!isFromAgencyOrAdmin &&
                    userData?.planCapabilities?.allowLiveCallTransfer ===
                      true) ? (
                  <div className="w-full flex flex-col items-start gap-2">
                    <div className={labelClassName}>
                      What number should we forward live transfers to when a lead
                      wants to talk to you?
                    </div>
                    <div className="w-full">
                      <div className={inputShellClassName}>
                        <PhoneInput
                          containerClass="phone-input-container"
                          className="outline-none bg-transparent focus:ring-0 w-full"
                          country={'us'} // restrict to US only
                          onlyCountries={['us', 'mx', 'sv', 'ec']}
                          disableDropdown={true}
                          countryCodeEditable={false}
                          disableCountryCode={false}
                          value={callBackNumber}
                          onChange={handleCallBackNumberChange}
                          placeholder={'Enter Phone Number'}
                          style={{
                            borderRadius: '8px',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            width: '100%',
                            height: '40px',
                          }}
                          inputStyle={{
                            width: '100%',
                            borderWidth: '0px',
                            backgroundColor: 'transparent',
                            paddingLeft: '60px',
                            paddingTop: '0px',
                            paddingBottom: '0px',
                            paddingRight: '0px',
                            outline: 'none',
                            boxShadow: 'none',
                            height: '40px',
                            fontSize: '14px',
                            fontWeight: 400,
                          }}
                          buttonStyle={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            outline: 'none',
                          }}
                          dropdownStyle={{
                            maxHeight: '150px',
                            overflowY: 'auto',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ fontWeight: '500', fontSize: 11, color: 'red' }}>
                      {errorMessage}
                    </div>
                    <FauxCheckbox
                      checked={toggleClick}
                      onToggle={handleToggleClick}
                      label={`Don't make live transfers. Prefer the AI Agent schedules them for a call back.`}
                    />
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <div className="w-full h-[35vh] flex items-center justify-center">
                      <UpgardView
                        setShowSnackMsg={setShowSnackMsg}
                        title={'Enable Live Transfer'}
                        subTitle={
                          'Allow your AI to initiate live transfers during the call. This allows your team to receive hot leads mid conversation.'
                        }
                        userData={userData}
                        onUpgradeSuccess={(userData) => {
                          setUpdatedUserData(userData)
                          setUserData(userData)

                          setTimeout(() => {
                            const localStorageData = localStorage.getItem('User')
                          }, 100)
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* bottom */}
          <div className="sticky bottom-0 z-40 bg-[#f9f9f9] w-full">
            <div className="border-t border-black/10">
              <ProgressBar value={33} />
            </div>
            <div className="border-t border-black/10 h-[65px] flex items-center justify-between px-8">
              <div className="opacity-0 pointer-events-none select-none">
                Continue
              </div>

              {assignLoader ? (
                <div className="w-[100px] flex items-center justify-center">
                  <CircularProgress size={22} />
                </div>
              ) : (
                <button
                  type="button"
                  disabled={shouldContinue}
                  className="h-9 min-h-[36px] rounded-[8px] px-4 text-[14px] font-semibold tracking-[0.07px] text-white bg-brand-primary hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:bg-black/10 disabled:text-black/60 disabled:hover:opacity-100 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
                  onClick={() => {
                    if (agentType?.agentType === 'inbound' && !selectNumber) {
                      handleContinue()
                    } else {
                      setAssignLoader(true)
                      AssignNumber()
                      handleContinue()
                    }
                  }}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden lg:block lg:basis-[35%] lg:flex-[0_0_35%] bg-brand-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute left-1/2 -translate-x-1/2 top-[230px] w-[1146px] h-[570px] border border-white/30 bg-white/[0.01]" />
            <div className="absolute left-1/2 -translate-x-1/2 top-[-30px] w-[460px] h-[1090px] border border-white/30 bg-white/[0.01]" />
          </div>
        </div>

        {/* Code for the confirmation of reassign button */}
        <Modal
          open={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(null)
          }}
        >
          <Box
            className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-5/12 p-8 rounded-[15px]"
            sx={{ ...styles.claimPopup, backgroundColor: 'white' }}
          >
            <div style={{ width: '100%' }}>
              <div
                className="max-h-[60vh] overflow-auto"
                style={{ scrollbarWidth: 'none' }}
              >
                {/* <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "end", alignItems: "center" }}>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    setShowWarningModal(false);
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div> */}

                <div className="flex flex-row items-center justify-between w-full">
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: '600',
                    }}
                  >
                    Reassign Number
                  </div>
                  <button
                    onClick={() => {
                      setShowConfirmationModal(null)
                      // setSelectNumber("");
                    }}
                  >
                    <Image
                      src={'/assets/blackBgCross.png'}
                      height={20}
                      width={20}
                      alt="*"
                    />
                  </button>
                </div>

                <div
                  className="mt-8"
                  style={{
                    fontSize: 22,
                    fontWeight: '600',
                  }}
                >
                  Confirm Action
                </div>

                <p
                  className="mt-8"
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                  }}
                >
                  Please confirm you would like to reassign{' '}
                  <span className="text-brand-primary">
                    ({formatPhoneNumber(showConfirmationModal?.phoneNumber)})
                  </span>{' '}
                  to {AgentData?.name}
                  {/* {showConfirmationModal?.claimedBy?.name}. */}
                  {/* {`{${showConfirmationModal?.claimedBy?.name}}`}. */}
                </p>
              </div>

              <div className="flex flex-row items-center gap-4 mt-6">
                <button
                  className="mt-4 outline-none w-1/2"
                  style={{
                    color: 'black',
                    height: '50px',
                    borderRadius: '10px',
                    width: '100%',
                    fontWeight: 600,
                    fontSize: '20',
                  }}
                  onClick={() => {
                    setShowConfirmationModal(null)
                    setShowClaimPopup(null)
                    // setSelectNumber("");
                  }}
                >
                  Discard
                </button>
                <div className="w-full">
                  {reassignLoader ? (
                    <div className="mt-4 w-full flex flex-row items-center justify-center">
                      <CircularProgress size={25} />
                    </div>
                  ) : (
                    <button
                      className="mt-4 outline-none bg-brand-primary w-full"
                      style={{
                        color: 'white',
                        height: '50px',
                        borderRadius: '10px',
                        width: '100%',
                        fontWeight: 600,
                        fontSize: '20',
                      }}
                      onClick={() => {
                        handleReassignNumber(showConfirmationModal)
                        ////console.log
                      }}
                    >
                      {`I'm sure`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
}

export default CreateAgent4
