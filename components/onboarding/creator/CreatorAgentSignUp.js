'use client'

import 'react-phone-input-2/lib/style.css'

import { Box, CircularProgress, Modal } from '@mui/material'
import axios from 'axios'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import PhoneInput from 'react-phone-input-2'

import Apis from '@/components/apis/Apis'
import Footer from '@/components/onboarding/Footer'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { PersistanceKeys } from '@/constants/Constants'
import { clearAgencyUUID, getAgencyUUIDForAPI } from '@/utilities/AgencyUtility'
import { GetCampaigneeNameIfAvailable } from '@/utilities/UserUtility'
import { setCookie } from '@/utilities/cookies'
import { forceApplyBranding } from '@/utilities/applyBranding'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

import SendVerificationCode from '../services/AuthVerification/AuthService'
import SnackMessages from '../services/AuthVerification/SnackMessages'
import { getLocalLocation } from '../services/apisServices/ApiService'

const PRIMARY_SELL_OPTIONS = [
  { id: 'high_ticket_coaching', title: 'High-Ticket Coaching ($3k+)' },
  { id: 'mid_ticket_programs', title: 'Mid-Ticket Programs ($500–$3k)' },
  { id: 'low_ticket_offers', title: 'Low-Ticket Offers / Digital Products' },
  { id: 'membership_community', title: 'Membership / Community' },
  { id: 'services_dfy_agency', title: 'Services (DFY / Agency)' },
  { id: 'affiliate_brand_deals', title: 'Affiliate / Brand Deals' },
]

const AUDIENCE_ENGAGE_OPTIONS = [
  { id: 'instagram', title: 'Instagram' },
  { id: 'youtube', title: 'YouTube' },
  { id: 'tiktok', title: 'TikTok' },
  { id: 'linkedin', title: 'LinkedIn' },
  { id: 'email_list', title: 'Email List' },
  { id: 'skool_community', title: 'Skool / Private Community' },
  { id: 'multi_platform', title: 'Multi-Platform' },
]

const CreatorAgentSignUp = ({
  handleContinue,
  handleBack,
  length = 6,
  setCongratsPopup,
  handleShowRedirectPopup,
}) => {
  const verifyInputRef = useRef([])
  const timerRef = useRef(null)
  const inputsFields = useRef([])

  const [userName, setUserName] = useState('')
  const [showVerifyPopup, setShowVerifyPopup] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [response, setResponse] = useState({})
  const [registerLoader, setRegisterLoader] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userPhoneNumber, setUserPhoneNumber] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [sendcodeLoader, setSendcodeLoader] = useState(false)
  const [userData, setUserData] = useState(null)
  const [VerifyCode, setVerifyCode] = useState(Array(length).fill(''))
  const [emailLoader, setEmailLoader] = useState(false)
  const [emailCheckResponse, setEmailCheckResponse] = useState(null)
  const [validEmail, setValidEmail] = useState('')
  const [phoneNumberLoader, setPhoneNumberLoader] = useState(false)
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null)
  const [locationLoader, setLocationLoader] = useState(false)
  const [shouldContinue, setShouldContinue] = useState(true)
  const [primarySell, setPrimarySell] = useState([])
  const [audienceEngage, setAudienceEngage] = useState([])

  useEffect(() => {
    const loc = getLocalLocation()
    setCountryCode(loc)
    const storedData = localStorage.getItem(PersistanceKeys.RegisterDetails)
    if (storedData) {
      setUserData(JSON.parse(storedData))
    }
  }, [])

  useEffect(() => {
    const valid =
      userName &&
      userEmail &&
      userPhoneNumber &&
      emailCheckResponse?.status === true &&
      checkPhoneResponse?.status === true
    setShouldContinue(!valid)
  }, [
    userName,
    userEmail,
    userPhoneNumber,
    emailCheckResponse,
    checkPhoneResponse,
  ])

  useEffect(() => {
    if (showVerifyPopup && verifyInputRef.current[0]) {
      verifyInputRef.current[0].focus()
    }
  }, [showVerifyPopup])

  const handlePhoneNumberChange = (phone) => {
    setUserPhoneNumber(phone)
    if (!phone) {
      setErrorMessage('')
      return
    }
    const parsedNumber = parsePhoneNumberFromString(
      `+${phone}`,
      countryCode?.toUpperCase(),
    )
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage('Invalid')
    } else {
      setErrorMessage('')
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => checkPhoneNumber(phone), 300)
    }
  }

  const validateEmail = (email) => {
    if (/\.\./.test(email)) return false
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
  }

  const checkEmail = async (value) => {
    try {
      setValidEmail('')
      setEmailLoader(true)
      const res = await axios.post(
        Apis.CheckEmail,
        { email: value },
        { headers: { 'Content-Type': 'application/json' } },
      )
      if (res.data) setEmailCheckResponse(res.data)
    } catch (e) {
      setEmailCheckResponse({ status: false, message: e.message })
    } finally {
      setEmailLoader(false)
    }
  }

  const checkPhoneNumber = async (value) => {
    try {
      setPhoneNumberLoader(true)
      const res = await axios.post(
        Apis.CheckPhone,
        { phone: value },
        { headers: { 'Content-Type': 'application/json' } },
      )
      if (res.data) setCheckPhoneResponse(res.data)
    } catch (e) {
      setCheckPhoneResponse({ status: false, message: e.message })
    } finally {
      setPhoneNumberLoader(false)
    }
  }

  const handleVerifyPopup = async () => {
    try {
      setShowVerifyPopup(true)
      setSendcodeLoader(true)
      const res = await SendVerificationCode(userPhoneNumber, true)
      setResponse(res)
      setIsVisible(true)
    } catch (e) {
      setResponse({ status: false, message: e.message })
    } finally {
      setSendcodeLoader(false)
    }
    setTimeout(() => verifyInputRef.current[0]?.focus(), 100)
  }

  const handleClose = () => setShowVerifyPopup(false)

  const handleVerifyInputChange = (e, index) => {
    const { value } = e.target
    if (!/[0-9]/.test(value) && value !== '') return
    const newValues = [...VerifyCode]
    newValues[index] = value
    setVerifyCode(newValues)
    if (value && index < length - 1) verifyInputRef.current[index + 1].focus()
  }

  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace') {
      if (VerifyCode[index] === '' && index > 0) verifyInputRef.current[index - 1].focus()
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
    const lastIdx = Math.min(newValues.length, length) - 1
    if (verifyInputRef.current[lastIdx]) verifyInputRef.current[lastIdx].focus()
  }

  const handleVerifyCode = () => {
    setShowVerifyPopup(false)
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
    if (screenWidth > 640 && handleShowRedirectPopup) handleShowRedirectPopup()
    handleRegister()
  }

  const handleRegister = async () => {
    if (!userData) return
    try {
      setRegisterLoader(true)
      const formData = new FormData()
      formData.append('name', userName)
      formData.append('email', userEmail)
      formData.append('phone', userPhoneNumber)
      formData.append('userType', 'Creator')
      formData.append('login', false)
      formData.append('verificationCode', VerifyCode.join(''))
      formData.append(
        'timeZone',
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      )
      formData.append(
        'agentService',
        JSON.stringify(userData.serviceID || []),
      )
      formData.append('areaOfFocus', JSON.stringify([]))

      if (userData.creatorType) {
        formData.append('creatorType', userData.creatorType)
      }
      formData.append(
        'creatorPrimarySell',
        JSON.stringify(primarySell),
      )
      formData.append(
        'creatorAudienceEngage',
        JSON.stringify(audienceEngage),
      )

      const campaignee = GetCampaigneeNameIfAvailable(
        typeof window !== 'undefined' ? window : {},
      )
      if (campaignee) formData.append('campaignee', campaignee)

      const agencyUuid = getAgencyUUIDForAPI()
      if (agencyUuid) formData.append('agencyUuid', agencyUuid)

      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        if (
          hostname &&
          !hostname.includes('localhost') &&
          !hostname.includes('127.0.0.1')
        ) {
          formData.append('hostname', hostname)
        }
      }

      const res = await axios.post(Apis.register, formData)
      setResponse(res.data)
      setIsVisible(true)

      if (res.data.status === true) {
        const { clearLogoutFlag } = require('@/utilities/UserUtility')
        clearLogoutFlag()
        localStorage.removeItem(PersistanceKeys.RegisterDetails)
        localStorage.setItem('User', JSON.stringify(res.data.data))
        if (typeof document !== 'undefined') {
          setCookie(res.data.data.user, document)
        }
        if (typeof window !== 'undefined' && window.agentxTrackSignup) {
          window.agentxTrackSignup(
            userEmail,
            userName,
            res.data.data.user?.id,
          )
        }
        if (agencyUuid) clearAgencyUUID()

        const user = res.data.data.user
        if (user?.userRole === 'AgencySubAccount' || user?.userRole === 'Agency') {
          Promise.race([
            forceApplyBranding(res.data),
            new Promise((r) => setTimeout(r, 5000)),
          ]).catch((err) => console.error('Error applying branding:', err))
        }

        if (user?.userRole === 'AgencySubAccount') {
          localStorage.setItem(
            PersistanceKeys.SubaccoutDetails,
            JSON.stringify(res.data.data),
          )
        }

        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
        if (screenWidth <= 640 && setCongratsPopup) {
          setCongratsPopup(true)
        } else {
          try {
            window.location.href = '/createagent'
          } catch (e) {
            window.location.replace('/createagent')
          }
          if (handleShowRedirectPopup) handleShowRedirectPopup()
          setTimeout(() => {
            if (
              typeof window !== 'undefined' &&
              (window.location.pathname === '/onboarding' ||
                window.location.pathname.includes('/onboarding'))
            ) {
              window.location.replace('/createagent')
            }
          }, 200)
        }
      }
    } catch (error) {
      console.error('Creator register error:', error)
      setResponse({ status: false, message: error?.message || 'Registration failed' })
      setIsVisible(true)
    } finally {
      setRegisterLoader(false)
    }
  }

  const togglePrimarySell = (id) => {
    setPrimarySell((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const toggleAudienceEngage = (id) => {
    setAudienceEngage((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const styles = {
    headingStyle: { fontSize: 16, fontWeight: '600' },
    inputStyle: { fontSize: 15, fontWeight: '500', borderRadius: '7px' },
    errmsg: { fontSize: 12, fontWeight: '500', borderRadius: '7px' },
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
      style={{ width: '100%' }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <div className="flex flex-col bg-white sm:rounded-2xl sm:mx-2 w-full md:w-10/12 h-[100%] sm:h-[95%] py-4 relative">
        <div className="h-[95svh] sm:h-[92svh] overflow-auto pb-24 scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple">
          <div className="h-[10%]">
            <Header />
          </div>
          <div className="flex flex-col items-center px-4 w-full h-[95%]">
            <div
              className="mt-6 w-11/12 md:text-4xl text-lg font-[600]"
              style={{ textAlign: 'center' }}
            >
              Your Contact Information
            </div>
            <div
              className="mt-4 sm:mt-8 w-full md:w-10/12 lg:w-6/12 flex flex-col max-h-[90%] sm:max-h-[85%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple px-2"
              style={{ scrollbarWidth: 'none' }}
            >
              <div style={styles.headingStyle}>What&apos;s your full name</div>
              <Input
                ref={(el) => (inputsFields.current[0] = el)}
                autoComplete="off"
                placeholder="Name"
                className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
                style={{ ...styles.inputStyle, marginTop: '8px' }}
                value={userName}
                onChange={(e) => {
                  const input = e.target.value
                  setUserName(
                    input
                      .split(' ')
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(' '),
                  )
                }}
              />

              <div className="flex flex-row items-center w-full justify-between mt-6">
                <div style={styles.headingStyle}>What&apos;s your email address</div>
                <div>
                  {emailLoader && (
                    <p style={{ ...styles.errmsg, color: 'black' }}>Checking ...</p>
                  )}
                  {emailCheckResponse && !emailLoader && (
                    <p
                      style={{
                        ...styles.errmsg,
                        color: emailCheckResponse.status === true ? 'green' : 'red',
                      }}
                    >
                      {emailCheckResponse.message?.slice(0, 1).toUpperCase() +
                        emailCheckResponse.message?.slice(1)}
                    </p>
                  )}
                  {validEmail && (
                    <p style={{ ...styles.errmsg, color: 'red' }}>{validEmail}</p>
                  )}
                </div>
              </div>
              <Input
                ref={(el) => (inputsFields.current[1] = el)}
                autoComplete="off"
                placeholder="Email address"
                className="border rounded px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:border-black w-full transition-colors"
                style={{ ...styles.inputStyle, marginTop: '8px' }}
                value={userEmail}
                onChange={(e) => {
                  const value = e.target.value
                  setUserEmail(value)
                  setEmailCheckResponse(null)
                  if (!value) {
                    setValidEmail('')
                    return
                  }
                  if (!validateEmail(value)) setValidEmail('Invalid')
                  else {
                    if (timerRef.current) clearTimeout(timerRef.current)
                    timerRef.current = setTimeout(() => checkEmail(value), 300)
                  }
                }}
              />

              <div className="flex flex-row items-center justify-between w-full mt-6">
                <div style={styles.headingStyle}>What&apos;s your phone number</div>
                <div>
                  {locationLoader && (
                    <p className="text-brand-primary" style={styles.errmsg}>
                      Getting location ...
                    </p>
                  )}
                  {errorMessage && (
                    <p style={{ ...styles.errmsg, color: 'red' }}>{errorMessage}</p>
                  )}
                  {phoneNumberLoader && !errorMessage && (
                    <p style={{ ...styles.errmsg, color: 'black' }}>Checking ...</p>
                  )}
                  {checkPhoneResponse && !phoneNumberLoader && (
                    <p
                      style={{
                        ...styles.errmsg,
                        color: checkPhoneResponse.status === true ? 'green' : 'red',
                      }}
                    >
                      {checkPhoneResponse.message
                        ?.slice(0, 1)
                        .toUpperCase() + checkPhoneResponse.message?.slice(1)}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <PhoneInput
                  ref={(el) => (inputsFields.current[2] = el)}
                  containerClass="phone-input-container"
                  className="outline-none bg-white focus:ring-0"
                  country="us"
                  onlyCountries={['us', 'ca', 'mx', 'sv', 'ec']}
                  disableDropdown={false}
                  countryCodeEditable={false}
                  disableCountryCode={false}
                  value={userPhoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder={
                    locationLoader ? 'Loading location ...' : 'Enter Phone Number'
                  }
                  disabled={loading}
                  style={{
                    borderRadius: '7px',
                    border: '2px solid #00000020',
                    outline: 'none',
                    boxShadow: 'none',
                  }}
                  inputStyle={{
                    width: '100%',
                    borderWidth: '0px',
                    backgroundColor: 'transparent',
                    paddingLeft: '60px',
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    outline: 'none',
                    boxShadow: 'none',
                  }}
                  buttonStyle={{
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                  dropdownStyle={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}
                  defaultMask={loading ? 'Loading...' : undefined}
                />
              </div>

              <div style={styles.headingStyle} className="mt-8">
                What do you primarily sell?
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {PRIMARY_SELL_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePrimarySell(item.id)}
                    className="border rounded-2xl p-3 flex flex-row items-center gap-2 text-left w-full bg-white"
                    style={{
                      border:
                        primarySell.includes(item.id)
                          ? '2px solid hsl(var(--brand-primary, 270 75% 50%))'
                          : undefined,
                      backgroundColor: primarySell.includes(item.id)
                        ? 'hsl(var(--brand-primary, 270 75% 50%) / 0.05)'
                        : undefined,
                    }}
                  >
                    <Checkbox
                      checked={primarySell.includes(item.id)}
                      className="h-5 w-5 rounded border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                    />
                    <span className="font-medium text-sm">{item.title}</span>
                  </button>
                ))}
              </div>

              <div style={styles.headingStyle} className="mt-8">
                Where does your audience primarily engage?
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {AUDIENCE_ENGAGE_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleAudienceEngage(item.id)}
                    className="border rounded-2xl p-3 flex flex-row items-center gap-2 text-left w-full bg-white"
                    style={{
                      border:
                        audienceEngage.includes(item.id)
                          ? '2px solid hsl(var(--brand-primary, 270 75% 50%))'
                          : undefined,
                      backgroundColor: audienceEngage.includes(item.id)
                        ? 'hsl(var(--brand-primary, 270 75% 50%) / 0.05)'
                        : undefined,
                    }}
                  >
                    <Checkbox
                      checked={audienceEngage.includes(item.id)}
                      className="h-5 w-5 rounded border-2 data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                    />
                    <span className="font-medium text-sm">{item.title}</span>
                  </button>
                ))}
              </div>

              <Modal
                open={showVerifyPopup}
                closeAfterTransition
                BackdropProps={{ timeout: 1000, sx: { backgroundColor: '#00000020' } }}
              >
                <Box className="lg:w-8/12 sm:w-10/12 w-full" sx={styles.verifyPopup}>
                  <div className="flex flex-row justify-center w-full">
                    <div
                      className="sm:w-7/12 w-full mx-2 bg-white p-5 rounded-xl"
                    >
                      <div className="flex flex-row justify-end">
                        <button onClick={handleClose}>
                          <Image
                            src="/assets/crossIcon.png"
                            height={40}
                            width={40}
                            alt="close"
                          />
                        </button>
                      </div>
                      <div className="text-xl font-bold">Verify phone number</div>
                      <div className="mt-4 text-gray-600 text-sm">
                        Enter code sent to number ending with *{userPhoneNumber.slice(-4)}
                      </div>
                      <div className="mt-6 flex gap-2">
                        {Array.from({ length }).map((_, index) => (
                          <Input
                            key={index}
                            ref={(el) => (verifyInputRef.current[index] = el)}
                            type="tel"
                            inputMode="numeric"
                            maxLength={1}
                            value={VerifyCode[index]}
                            onChange={(e) => handleVerifyInputChange(e, index)}
                            onKeyDown={(e) => handleBackspace(e, index)}
                            onPaste={handlePaste}
                            placeholder="-"
                            className="w-12 h-12 text-center text-lg"
                          />
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        Didn&apos;t receive code?
                        {sendcodeLoader ? (
                          <CircularProgress size={17} />
                        ) : (
                          <button
                            className="text-brand-primary border-none bg-transparent cursor-pointer"
                            onClick={handleVerifyPopup}
                          >
                            Resend
                          </button>
                        )}
                      </div>
                      {registerLoader ? (
                        <div className="flex justify-center mt-6">
                          <CircularProgress size={35} />
                        </div>
                      ) : (
                        <button
                          className="text-white bg-brand-primary rounded-xl w-full mt-6 h-12"
                          onClick={handleVerifyCode}
                        >
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                </Box>
              </Modal>

              <SnackMessages
                message={response.message}
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                success={response.status}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100">
          <div className="px-4 pt-3 pb-2">
            <ProgressBar value={100} />
          </div>
          <div className="flex items-center justify-between w-full" style={{ minHeight: '50px' }}>
            <Footer
              handleContinue={handleVerifyPopup}
              handleBack={handleBack}
              registerLoader={registerLoader}
              shouldContinue={shouldContinue}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatorAgentSignUp
