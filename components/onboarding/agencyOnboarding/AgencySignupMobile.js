import 'react-phone-input-2/lib/style.css'

import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
} from '@mui/material'
import axios from 'axios'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import Apis from '@/components/apis/Apis'
import { AgentXOrb } from '@/components/common/AgentXOrb'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import SendVerificationCode from '@/components/onboarding/services/AuthVerification/AuthService'
import SnackMessages from '@/components/onboarding/services/AuthVerification/SnackMessages'
import { getLocalLocation } from '@/components/onboarding/services/apisServices/ApiService'
import { Input } from '@/components/ui/input'
import { PersistanceKeys } from '@/constants/Constants'
import { clearAgencyUUID, getAgencyUUIDForAPI } from '@/utilities/AgencyUtility'
import { GetCampaigneeNameIfAvailable } from '@/utilities/UserUtility'
import { setCookie } from '@/utilities/cookies'
import { forceApplyBranding } from '@/utilities/applyBranding'
import SignupHeaderMobile from '../mobileUI/SignupHeaderMobile'

const AgencySignupMobile = ({
  handleContinue,
  handleBack,
  length = 6,
  onComplete,
}) => {
  const verifyInputRef = useRef([])
  const timerRef = useRef(null)

  let inputsFields = useRef([])

  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [showVerifyPopup, setShowVerifyPopup] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  let [response, setResponse] = useState({})
  const [registerLoader, setRegisterLoader] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [size, setSize] = useState('')
  //phone number input variable
  const [userPhoneNumber, setUserPhoneNumber] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [sendcodeLoader, setSendcodeLoader] = useState(false)
  const [userData, setUserData] = useState(null)
  const [phoneVerifiedSuccessSnack, setPhoneVerifiedSuccessSnack] =
    useState(false)
  //verify code input fields
  const [VerifyCode, setVerifyCode] = useState(Array(length).fill(''))
  //check email availability
  const [emailLoader, setEmailLoader] = useState(false)
  const [emailCheckResponse, setEmailCheckResponse] = useState(null)
  const [validEmail, setValidEmail] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errMessage, setErrMessage] = useState(null)
  //check phone number availability
  const [phoneNumberLoader, setPhoneNumberLoader] = useState(false)
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null)
  const [locationLoader, setLocationLoader] = useState(false)
  const [shouldContinue, setShouldContinue] = useState(true)

  //congrats popup for small size screens
  const [congratsPopup, setCongratsPopup] = useState(false)

  const sizeList = [
    { id: 1, label: '1-10', min: 1, max: 10 },
    { id: 2, label: '11-50', min: 11, max: 50 },
    { id: 3, label: '51-100', min: 51, max: 100 },
    { id: 4, label: '100+', min: 101, max: 1000 },
  ]

  //load the user location
  useEffect(() => {
    let loc = getLocalLocation()
    setCountryCode(loc)
    let storedData = localStorage.getItem(PersistanceKeys.RegisterDetails)
    if (storedData) {
      let data = JSON.parse(storedData)
      setUserData(data)
    }
  }, [])

  //focus 1st field automatically
  useEffect(() => {
    inputsFields.current[0]?.focus()
  }, [])

  // Function to get the user's location and set the country code
  useEffect(() => {
    if (
      userName &&
      userEmail &&
      userPhoneNumber &&
      company &&
      size &&
      emailCheckResponse?.status === true &&
      checkPhoneResponse?.status === true
    ) {
      setShouldContinue(false)
    } else if (
      !userName ||
      !userEmail ||
      !userPhoneNumber ||
      !company ||
      !size ||
      checkPhoneResponse?.status === false ||
      emailCheckResponse?.status === false
    ) {
      setShouldContinue(true)
    }
  }, [
    userName,
    userEmail,
    userPhoneNumber,
    company,
    website,
    size,
    checkPhoneResponse,
    emailCheckResponse,
  ])

  //code to focus the verify code input field
  useEffect(() => {
    if (showVerifyPopup && verifyInputRef.current[0]) {
      verifyInputRef.current[0].focus()
    }
  }, [showVerifyPopup])

  // Handle phone number change and validation
  const handlePhoneNumberChange = (phone) => {
    setUserPhoneNumber(phone)
    validatePhoneNumber(phone)

    if (!phone) {
      setErrorMessage('')
    }
  }

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    const parsedNumber = parsePhoneNumberFromString(
      `+${phoneNumber}`,
      countryCode?.toUpperCase(),
    )
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage('Invalid')
    } else {
      setErrorMessage('')

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        checkPhoneNumber(phoneNumber)
      }, 300)
    }
  }

  //email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (/\.\./.test(email)) {
      return false
    }

    return emailPattern.test(email)
  }

  //code for verify number popup
  const handleVerifyPopup = async () => {
    try {
      setShowVerifyPopup(true)
      setSendcodeLoader(true)
      let response = await SendVerificationCode(userPhoneNumber, true)
      setResponse(response)
      setIsVisible(true)
    } catch (error) {
      console.error('Error occurred', error)
    } finally {
      setSendcodeLoader(false)
    }

    setTimeout(() => {
      if (verifyInputRef.current[0]) {
        verifyInputRef.current[0].focus()
      }
    }, 100)
  }

  const handleClose = () => {
    setShowVerifyPopup(false)
  }

  //code for handling verify code changes
  const handleVerifyInputChange = (e, index) => {
    const { value } = e.target
    if (!/[0-9]/.test(value) && value !== '') return

    const newValues = [...VerifyCode]
    newValues[index] = value
    setVerifyCode(newValues)

    if (value && index < length - 1) {
      verifyInputRef.current[index + 1].focus()
    }

    if (newValues.every((num) => num !== '') && onComplete) {
      onComplete(newValues.join(''))
    }
  }

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace') {
      if (VerifyCode[index] === '' && index > 0) {
        verifyInputRef.current[index - 1].focus()
      }
      const newValues = [...VerifyCode]
      newValues[index] = ''
      setVerifyCode(newValues)
    }
  }

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text').slice(0, length)
    const newValues = pastedText
      .split('')
      .map((char) => (/[0-9]/.test(char) ? char : ''))
    setVerifyCode(newValues)

    newValues.forEach((char, index) => {
      verifyInputRef.current[index].value = char
      if (index === newValues.length - 1) {
        verifyInputRef.current[index].focus()
      }
    })

    if (newValues.every((num) => num !== '') && onComplete) {
      onComplete(newValues.join(''))
    }
  }

  //code for number verification
  const handleVerifyCode = () => {
    console.log('verify code is: ', VerifyCode)
    setPhoneVerifiedSuccessSnack(true)
    handleRegister()
  }

  //code for registering user
  const handleRegister = async () => {
    try {
      setRegisterLoader(true)

      const formData = new FormData()
      const ApiPath = Apis.register
      let campainee = null
      if (typeof window !== 'undefined') {
        campainee = GetCampaigneeNameIfAvailable(window)
      }
      if (campainee) {
        formData.append('campaignee', campainee)
      }

      // Add agency UUID if present (for subaccount registration)
      const agencyUuid = getAgencyUUIDForAPI()
      if (agencyUuid) {
        formData.append('agencyUuid', agencyUuid)
      }

      // Add hostname for auto-detecting agency from custom domain/subdomain
      let hostname = null
      if (typeof window !== 'undefined') {
        hostname = window.location.hostname
        if (
          hostname &&
          !hostname.includes('localhost') &&
          !hostname.includes('127.0.0.1')
        ) {
          formData.append('hostname', hostname)
        }
      }

      formData.append('name', userName)
      formData.append('email', userEmail)
      formData.append('phone', userPhoneNumber)
      formData.append('company', company)
      formData.append('companySizeMin', size.min)
      formData.append('companySizeMax', size.max)
      formData.append('website', website)
      formData.append('userRole', 'Agency')
      formData.append('login', false)
      formData.append(
        'timeZone',
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      )
      formData.append('verificationCode', VerifyCode.join(''))

      const response = await axios.post(ApiPath, formData)
      if (response) {
        let result = response.data
        setResponse(result)
        setIsVisible(true)
        if (response.data.status === true) {
          console.log(
            '[DEBUG] Registration successful, starting affiliate tracking...',
          )
          console.log('agency signup data is', response.data.data)
          localStorage.removeItem(PersistanceKeys.RegisterDetails)
          // CRITICAL: Clear logout flag on successful registration
          const { clearLogoutFlag } = require('@/utilities/UserUtility')
          clearLogoutFlag()

          localStorage.setItem('User', JSON.stringify(response.data.data))

          if (typeof document !== 'undefined') {
            setCookie(response.data.data.user, document)
          }

          // Track signup for affiliate marketing
          if (typeof window !== 'undefined' && window.agentxTrackSignup) {
            window.agentxTrackSignup(
              userEmail,
              userName,
              response.data.data.user?.id,
            )
          }

          // Clear agency UUID after successful registration
          if (agencyUuid) {
            clearAgencyUUID()
          }

          // Force apply branding after registration (for agencies/subaccounts)
          // Make it non-blocking with timeout to prevent hanging
          const user = response.data.data.user
          if (user?.userRole === 'AgencySubAccount' || user?.userRole === 'Agency') {
            // Run branding in background, don't block the flow
            Promise.race([
              forceApplyBranding(response.data),
              new Promise((resolve) => setTimeout(resolve, 5000)), // 5 second timeout
            ]).catch((error) => {
              console.error('Error applying branding (non-blocking):', error)
            })
          }

          setCongratsPopup(true)
        }
      }
    } catch (error) {
      console.error('Error occurred in register api is: ', error)
    } finally {
      setRegisterLoader(false)
    }
  }

  //code to check email and phone
  const checkEmail = async (value) => {
    try {
      setValidEmail('')
      setEmailLoader(true)

      const ApiPath = Apis.CheckEmail

      const ApiData = {
        email: value,
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setEmailCheckResponse(response.data)
        } else {
          setEmailCheckResponse(response.data)
        }
      }
    } catch (error) {
      console.error('Error occurred in check email api is :', error)
    } finally {
      setEmailLoader(false)
    }
  }

  const checkPhoneNumber = async (value) => {
    try {
      setPhoneNumberLoader(true)
      const ApiPath = Apis.CheckPhone

      const ApiData = {
        phone: value,
      }

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setCheckPhoneResponse(response.data)
        } else {
          setCheckPhoneResponse(response.data)
        }
      }
    } catch (error) {
      console.error('Error occurred in check phone api is :', error)
    } finally {
      setPhoneNumberLoader(false)
    }
  }

  const handleChangeSize = (event) => {
    const selected = sizeList.find((item) => item.label === event.target.value)
    setSize(selected)
  }

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: '600',
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: '500',
      borderRadius: '7px',
    },
    errmsg: {
      fontSize: 12,
      fontWeight: '500',
      borderRadius: '7px',
    },
    verifyPopup: {
      height: 'auto',
      bgcolor: 'transparent',
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  return (
    <div
      style={{ width: '100%', scrollbarWidth: 'none' }}
      className="flex flex-col justify-center items-center h-[screen]"
    >
      <div className="flex flex-col items-center h-full w-full">
        <SignupHeaderMobile title="Create Your AI Agency" />

        <div style={{
          position: 'absolute',
          top: '20vh',
          left: '50%',
          transform: 'translateX(-50%)',

        }} className=" w-[90%] bg-white h-[78vh] rounded-xl p-2 mt-2 shadow-2xl">

          <div className="flex flex-col items-center justify-center">

            <AgentXOrb size={100} />
            <div className="flex flex-col items-center px-4 w-full h-[92%]">

              <div
                className="mt-4 sm:mt-8 w-full md:w-10/12 lg:w-6/12 flex flex-col max-h-[90%] sm:max-h-[85%] overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple px-2"
                style={{ scrollbarWidth: 'none' }}
              >
                <div style={styles.headingStyle}>{`What's your full name`}</div>
                <Input
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  enterKeyHint="done"
                  placeholder="Name"
                  className="border rounded px-3 py-2.5 focus:border-black transition-colors h-[40px]"
                  ref={(el) => (inputsFields.current[0] = el)}
                  style={{
                    ...styles.inputStyle,
                    marginTop: '8px',
                    border: '1px solid #00000020',
                  }}
                  value={userName}
                  onChange={(e) => {
                    const input = e.target.value
                    const formattedName = input
                      .split(' ')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')

                    setUserName(formattedName)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Done') {
                      inputsFields.current[1]?.focus()
                    }
                  }}
                />

                <div className="flex flex-row items-center w-full justify-between mt-6">
                  <div style={styles.headingStyle}>
                    {`What's your email address`}
                  </div>
                  <div>
                    {emailLoader ? (
                      <p style={{ ...styles.errmsg, color: 'black' }}>
                        Checking ...
                      </p>
                    ) : (
                      <div>
                        {emailCheckResponse ? (
                          <p
                            style={{
                              ...styles.errmsg,
                              color:
                                emailCheckResponse.status === true
                                  ? 'green'
                                  : 'red',
                            }}
                          >
                            {emailCheckResponse.message
                              .slice(0, 1)
                              .toUpperCase() +
                              emailCheckResponse.message.slice(1)}
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

                <Input
                  ref={(el) => (inputsFields.current[1] = el)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  enterKeyHint="done"
                  placeholder="Email address"
                  className="border rounded px-3 py-2.5 focus:border-black transition-colors h-[40px]"
                  style={{
                    ...styles.inputStyle,
                    marginTop: '8px',
                    border: '1px solid #00000020',
                  }}
                  value={userEmail}
                  onChange={(e) => {
                    let value = e.target.value
                    setUserEmail(value)

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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Done') {
                      inputsFields.current[2]?.focus()
                    }
                  }}
                />

                <div className="flex flex-row items-center justify-between w-full mt-6">
                  <div style={styles.headingStyle}>
                    {`What's your phone number`}
                  </div>
                  <div>
                    {locationLoader && (
                      <p
                        className="text-purple"
                        style={{ ...styles.errmsg, height: '20px' }}
                      >
                        Getting location ...
                      </p>
                    )}
                    {errorMessage ? (
                      <p
                        style={{
                          ...styles.errmsg,
                          color: errorMessage && 'red',
                          height: '20px',
                        }}
                      >
                        {errorMessage}
                      </p>
                    ) : (
                      <div>
                        {phoneNumberLoader ? (
                          <p
                            style={{
                              ...styles.errmsg,
                              color: 'black',
                              height: '20px',
                            }}
                          >
                            Checking ...
                          </p>
                        ) : (
                          <div>
                            {checkPhoneResponse ? (
                              <p
                                style={{
                                  ...styles.errmsg,
                                  color:
                                    checkPhoneResponse.status === true
                                      ? 'green'
                                      : 'red',
                                  height: '20px',
                                }}
                              >
                                {checkPhoneResponse.message
                                  .slice(0, 1)
                                  .toUpperCase() +
                                  checkPhoneResponse.message.slice(1)}
                              </p>
                            ) : (
                              <div />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <PhoneInput
                    ref={(el) => (inputsFields.current[2] = el)}
                    containerClass="phone-input-container"
                    className="outline-none bg-white focus:ring-0"
                    country={'us'}
                    onlyCountries={['us', 'ca', 'mx']}
                    disableDropdown={false}
                    countryCodeEditable={false}
                    disableCountryCode={false}
                    value={userPhoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder={
                      locationLoader
                        ? 'Loading location ...'
                        : 'Enter Phone Number'
                    }
                    disabled={loading}
                    style={{
                      borderRadius: '7px',
                      border: '1px solid #00000020',
                      outline: 'none',
                      boxShadow: 'none',
                    }}
                    inputStyle={{
                      width: '100%',
                      borderWidth: '0px',
                      backgroundColor: 'transparent',
                      paddingTop: '20px',
                      paddingBottom: '20px',
                      outline: 'none',
                      boxShadow: 'none',
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
                    defaultMask={loading ? 'Loading...' : undefined}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === 'Done') {
                        inputsFields.current[3]?.focus()
                      }
                    }}
                  />
                </div>

                <div style={styles.headingStyle} className="mt-6">
                  Agency Name
                </div>
                <Input
                  ref={(el) => (inputsFields.current[3] = el)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  enterKeyHint="done"
                  placeholder="Agency Name"
                  className="w-full border rounded px-3 py-2.5 focus:border-black transition-colors"
                  style={{
                    ...styles.inputStyle,
                    marginTop: '8px',
                    border: '1px solid #00000020',
                  }}
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Done') {
                      inputsFields.current[4]?.focus()
                    }
                  }}
                />

                <div style={styles.headingStyle} className="mt-6 mb-2">
                  Agency Size
                </div>
                <FormControl fullWidth>
                  <Select
                    value={size?.label || ''}
                    onChange={handleChangeSize}
                    displayEmpty
                    renderValue={(selected) => {
                      if (!selected) {
                        return <div style={{ color: '#aaa' }}>Select size</div>
                      }
                      return selected
                    }}
                    sx={{
                      height: '40px',
                      border: '1px solid #00000020',
                      '&:hover': {
                        border: '1px solid #00000020',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&.MuiSelect-select': {
                        py: 0,
                        height: '40px',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: '30vh',
                          overflow: 'auto',
                          scrollbarWidth: 'none',
                        },
                      },
                    }}
                  >
                    {sizeList.map((item) => (
                      <MenuItem
                        key={item.id}
                        value={item.label}
                        sx={{
                          backgroundColor:
                            size?.id === item.id ? '#7902DF10' : 'transparent',
                          '&.Mui-selected': {
                            backgroundColor: '#7902DF10',
                          },
                          '&:hover': {
                            backgroundColor: '#7902DF10',
                          },
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <div style={styles.headingStyle} className="mt-6">
                  Website (optional)
                </div>
                <Input
                  ref={(el) => (inputsFields.current[4] = el)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  enterKeyHint="done"
                  placeholder="Website"
                  className="border rounded px-3 py-2.5 focus:border-black transition-colors h-[40px] w-full"
                  style={{
                    ...styles.inputStyle,
                    marginTop: '8px',
                    border: '1px solid #00000020',
                  }}
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value)
                  }}
                />

                <SnackMessages
                  message={response.message}
                  isVisible={isVisible}
                  setIsVisible={(visible) => {
                    setIsVisible(visible)
                  }}
                  success={response.status}
                />
              </div>
            </div>
          </div>
          <div className="w-full px-4 flex flex-row justify-end items-center pt-4">
            {registerLoader ? (
              <CircularProgress size={35} />
            ) : (
              <button
                disabled={shouldContinue}
                className={`rounded-lg ${shouldContinue ? 'bg-gray-300' : 'bg-purple text-white'}`}
                style={{
                  fontWeight: '700',
                  fontSize: '16',
                  color: shouldContinue ? '#000000' : '#ffffff',
                  height: '40px',
                  width: '100px',
                  cursor: shouldContinue ? 'not-allowed' : 'pointer',
                }}
                onClick={handleVerifyPopup}
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>


      {/* Modal for verify number */}
      <Modal
        open={showVerifyPopup}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box className="lg:w-7/12 sm:w-full sm:w-10/12 w-full" sx={styles.verifyPopup}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full mx-2"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: '700',
                  }}
                >
                  Verify phone number
                </div>
                <button onClick={handleClose} className="outline-none">
                  ✕
                </button>
              </div>
              <div
                className="mt-4"
                style={{ ...styles.inputStyle, color: '#00000060' }}
              >
                Enter code that was sent to number ending with *
                {userPhoneNumber.slice(-4)}.
              </div>
              <div
                className="mt-8"
                style={{ display: 'flex', gap: '8px' }}
              >
                {Array.from({ length }).map((_, index) => (
                  <Input
                    key={index}
                    ref={(el) => (verifyInputRef.current[index] = el)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    enterKeyHint="done"
                    type="tel"
                    inputMode="numeric"
                    maxLength="1"
                    value={VerifyCode[index]}
                    onChange={(e) => handleVerifyInputChange(e, index)}
                    onKeyDown={(e) => handleBackspace(e, index)}
                    onKeyUp={(e) => {
                      if (
                        e.key === 'Enter' &&
                        VerifyCode.every((value) => value.trim() !== '')
                      ) {
                        handleVerifyCode()
                      }
                    }}
                    onPaste={handlePaste}
                    placeholder="-"
                    className="w-[40px] h-[40px] text-center text-[20px]"
                  />
                ))}
              </div>
              <div
                className="mt-8 flex flex-row items-center gap-2"
                style={styles.inputStyle}
              >
                {`Didn't receive code?`}
                {sendcodeLoader ? (
                  <CircularProgress size={17} />
                ) : (
                  <button
                    className="outline-none border-none text-purple"
                    onClick={handleVerifyPopup}
                  >
                    Resend
                  </button>
                )}
              </div>
              {registerLoader ? (
                <div className="flex fex-row items-center justify-center mt-8">
                  <CircularProgress size={35} />
                </div>
              ) : (
                <button
                  className="text-white bg-purple outline-none rounded-xl w-full mt-8"
                  style={{ height: '50px' }}
                  onClick={handleVerifyCode}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal for congrats */}
      <Modal
        open={congratsPopup}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box className="w-full" sx={styles.verifyPopup}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full mx-4"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              >
                Congrats!
              </div>

              <div className="w-full mt-8 flex flex-row justify-center">
                <AgentXOrb
                  size={102}
                  style={{
                    height: '100px',
                    width: '110px',
                    resize: 'contain',
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  textAlign: 'center',
                  marginTop: 50,
                  color: '#00000070',
                }}
              >
                Your account is created!
              </div>

              <div
                style={{
                  fontSize: 17,
                  fontWeight: '700',
                  textAlign: 'center',
                  marginTop: 15,
                  color: '#000000',
                }}
              >
                {`Let's build your AI Agency`}
              </div>

              {registerLoader ? (
                <div className="flex fex-row items-center justify-center mt-8">
                  <CircularProgress size={35} />
                </div>
              ) : (
                <button
                  className="text-white bg-purple outline-none rounded-xl w-full mt-8"
                  style={{
                    height: '50px',
                    fontSize: 15,
                    fontWeight: '700',
                  }}
                  onClick={() => {
                    // For agencies, always go to plans step (step 2) first
                    // After subscribing to a plan, then redirect to desktop
                    if (handleContinue) {
                      handleContinue()
                    }
                  }}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default AgencySignupMobile

