import {
  Box,
  CircularProgress,
  Modal,
  Switch,
  Tooltip,
} from '@mui/material'
import { Calendar, Info, ListStart, Phone, PhoneCall } from 'lucide-react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { userLocalData } from '@/components/agency/plan/AuthDetails'
import { getUserLocalData } from '@/components/constants/constants'
import {
  RemoveSmartRefillApi,
  SmartRefillApi,
} from '@/components/onboarding/extras/SmartRefillapi'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import UpgradeModal from '@/constants/UpgradeModal'
import { getAgentImage } from '@/utilities/agentUtilities'

import { Checkbox } from '@/components/ui/checkbox'

import { DateAndTimeFields } from './DateAndTimeFields'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../AgentSelectSnackMessage'
import DncConfirmationPopup from '../DncConfirmationPopup'

// Helper function to get brand primary color as hex (for MUI sx props)
const getBrandPrimaryHex = () => {
  if (typeof window === 'undefined') return '#7902DF'
  const root = document.documentElement
  const brandPrimary = getComputedStyle(root).getPropertyValue('--brand-primary').trim()
  if (brandPrimary) {
    // Convert HSL to hex for inline styles
    const hslMatch = brandPrimary.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360
      const s = parseInt(hslMatch[2]) / 100
      const l = parseInt(hslMatch[3]) / 100

      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
      const m = l - c / 2

      let r = 0, g = 0, b = 0

      if (0 <= h && h < 1 / 6) {
        r = c; g = x; b = 0
      } else if (1 / 6 <= h && h < 2 / 6) {
        r = x; g = c; b = 0
      } else if (2 / 6 <= h && h < 3 / 6) {
        r = 0; g = c; b = x
      } else if (3 / 6 <= h && h < 4 / 6) {
        r = 0; g = x; b = c
      } else if (4 / 6 <= h && h < 5 / 6) {
        r = x; g = 0; b = c
      } else if (5 / 6 <= h && h < 1) {
        r = c; g = 0; b = x
      }

      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
  return '#7902DF' // Default fallback
}

const LastStep = ({
  selectedLead,
  leadIs,
  selectedAll,
  filters,
  totalLeads = 0,
  userProfile,
  handleBack,
  handleContinue,
  loader,
  lastStepData,
}) => {
  const [invalidTimeMessage, setInvalidTimeMessage] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)

  //snack messages
  const [showSuccessSnack, setShowSuccessSnack] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errTitle, setErrTitle] = useState(null)
  const SelectAgentErrorTimeout = 4000 //change this to change the duration of the snack timer

  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(true)
  const [isDncChecked, setIsDncChecked] = useState(false)
  const [showDncConfirmationPopup, setShowDncConfirmationPopup] =
    useState(false)

  // Get brand primary color for styling
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')

  useEffect(() => {
    const updateBrandColor = () => {
      setBrandPrimaryColor(getBrandPrimaryHex())
    }

    // Get initial color
    updateBrandColor()

    // Listen for branding updates
    window.addEventListener('agencyBrandingUpdated', updateBrandColor)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', updateBrandColor)
    }
  }, [])
  //leads to send
  const [NoOfLeadsToSend, setNoOfLeadsToSend] = useState('')
  const [customLeadsToSend, setCustomLeadsToSend] = useState('')
  const [isFocustedCustomLeads, setisFocustedCustomLeads] = useState('')
  //select call
  const [selectedFromDate, setSelectedFromDate] = useState(null)
  const [showFromDatePicker, setShowFromDatePicker] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState(() => dayjs().startOf('day'))
  const [CallNow, setCallNow] = useState('')
  const [CallLater, setCallLater] = useState(false)
  const [isRefill, setIsRefill] = useState(false)
  const [showRefillToogle, setShwRefillToogle] = useState(false)

  const [userLocalDetails, setUserLocalDetails] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    const localData = getUserLocalData()
    setUserLocalDetails(localData.user)
  }, [])

  useEffect(() => {
    if (lastStepData) {
      const {
        selectedDate,
        numberOfLeads,
        cutomLeads,
        isCallNow,
        DncChecked,
        callL,
      } = lastStepData

      // Safely convert to Dayjs
      const parsedDate = selectedDate ? dayjs(selectedDate) : null
      if (parsedDate) {
        let D = parsedDate?.format()
      }
      // setSelectedDateTime(parsedDate);
      handleDateChange(selectedDate)
      setHasUserSelectedDate(!!selectedDate)

      setNoOfLeadsToSend(numberOfLeads)
      setCustomLeadsToSend(cutomLeads)
      setCallNow(isCallNow)
      setIsDncChecked(!!DncChecked)
      setCallLater(callL)

      if (cutomLeads) setisFocustedCustomLeads(true)
      else if (numberOfLeads) setNoOfLeadsToSend(totalLeads)
    }
  }, [lastStepData])

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage(null)
        setErrTitle(null)
      }, SelectAgentErrorTimeout)
    }
  }, [errorMessage])

  useEffect(() => {
    const d = localStorage.getItem('User')
    if (d) {
      const Data = JSON.parse(d)
      let show = Data?.user?.smartRefill

      if (!show) {
        setShwRefillToogle(true)
      }
    }
  }, [])

  //counts leads selected
  function getLeadSelectedCount() {
    if (selectedAll) {
      return totalLeads - leadIs.length
    } else {
      return leadIs.length
    }
  }
  useEffect(() => { }, [selectedDateTime])

  //date selection
  const handleDateChange = (date) => {
    if (!date || !dayjs(date).isValid()) return
    let timer = null
    if (dayjs(date).isBefore(dayjs())) {
      // timer = setTimeout(() => {
      // }, 300);
      setInvalidTimeMessage("Can't schedule a call in the past")
      setIsDisabled(true)
      return
    } else {
      // if (timer) clearTimeout(timer);
      setInvalidTimeMessage(null)
      setIsDisabled(false)
      setSelectedDateTime(dayjs(date))
      setHasUserSelectedDate(true)
    }
  }

  //go bak
  const handleMoveBack = () => {
    const lastStepData = {
      numberOfLeads: NoOfLeadsToSend,
      cutomLeads: customLeadsToSend,
      selectedDate: selectedDateTime,
      DncChecked: isDncChecked,
      isCallNow: CallNow,
      callL: CallLater,
    }
    handleBack(lastStepData)
  }

  //function to update profile
  const handleUpdateProfile = async () => {
    try {
      // setUserDataLoader(true);
      const response = await SmartRefillApi()
      if (response) {
        if (response.data.status === true) {
          setIsRefill(true)
        } else if (response.data.status === false) {
          // setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      console.error('Error occured in api is', error)
      // setUserDataLoader(false);
    }
  }

  //function to remove smart refill
  const handleRemoveSmartRefill = async () => {
    try {
      // setUserDataLoader(true);
      const response = await RemoveSmartRefillApi()
      if (response) {
        if (response.data.status === true) {
          // setSuccessSnack(response.data.message);
          setIsRefill(false)
        } else if (response.data.status === false) {
          // setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      console.error('Error occured in api is', error)
      // setUserDataLoader(false);
    }
  }

  const styles = {
    heading: {
      fontWeight: '400',
      fontSize: 14,
    },
    paragraph: {
      fontWeight: '500',
      fontSize: 12,
    },
    paragraph2: {
      fontWeight: '500',
      fontSize: 12,
    },
    title: {
      fontWeight: '500',
      fontSize: 15,
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
  }

  return (
    <div>
      <div className="flex flex-row justify-center w-full">
        <AgentSelectSnackMessage
          message={errorMessage}
          title={errTitle}
          isVisible={errorMessage}
          hide={() => {
            //   setIsSnackVisible(false);
            setErrorMessage(null)
            setErrTitle(null)
          }}
          type=""
        />
        <AgentSelectSnackMessage
          className=""
          message={invalidTimeMessage}
          isVisible={invalidTimeMessage}
          hide={() => {
            setInvalidTimeMessage(null)
          }}
        />

        <AgentSelectSnackMessage
          className=""
          message={showSuccessSnack}
          isVisible={showSuccessSnack === null ? false : true}
          hide={() => {
            setShowSuccessSnack(null)
          }}
          type={SnackbarTypes.Success}
        />

        {showDncConfirmationPopup && (
          <DncConfirmationPopup
            open={showDncConfirmationPopup}
            onClose={() => {
              setShowDncConfirmationPopup(false)
              setIsDncChecked(false)
              //
            }}
            onCancel={() => {
              setShowDncConfirmationPopup(false)
              //Unset the dncToggle
              setIsDncChecked(false)
            }}
            onConfirm={() => {
              setShowSuccessSnack('DNC Enabled')
              setShowDncConfirmationPopup(false)
            }}
            leadsCount={
              selectedAll ? totalLeads - leadIs.length : leadIs.length
            }
            targetUserId={
              userProfile?.userRole === 'AgencySubAccount' ? userProfile?.id : undefined
            }
            targetUserDetails={userProfile?.userRole === 'AgencySubAccount' ? userProfile : undefined}
          // creditCost={creditCost}
          />
        )}

        <div
          className="w-full flex flex-col"
          style={{
            backgroundColor: '#ffffff',
            padding: 0,
            borderRadius: '13px',
            gap: 8,
          }}
        >
          <div style={{ paddingLeft: 0, paddingRight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="flex flex-row items-center justify-between w-full" style={{ width: '100%', padding: 16, borderBottom: '1px solid #eaeaea' }}>
              <div className="flex flex-col items-start" style={{ gap: 2 }}>
                <div className="start-campaign-label" style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
                  One last thing
                </div>
                <div style={{ fontSize: 14, fontWeight: 400, color: 'hsl(var(--brand-primary))' }}>
                  {getLeadSelectedCount()} Contacts Selected
                </div>
              </div>
              <CloseBtn
                onClick={() => {
                  handleMoveBack()
                }}
              />
            </div>

            <div style={{ paddingLeft: 16, paddingRight: 16 }}>
              <div className="flex flex-row items-center justify-between" style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' }}>
                <Tooltip
                  title="If the lead has given consent, no need to run against DNC"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: '#ffffff',
                        color: '#333',
                        fontSize: '14px',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      },
                    },
                    arrow: {
                      sx: {
                        color: '#ffffff',
                      },
                    },
                  }}
                >
                  <div className="flex flex-row items-center gap-2">
                    <div
                      className="pb-1"
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#000000',
                        cursor: 'pointer',
                      }}
                    >
                      Check DNC List
                    </div>
                    <Info
                      size={16}
                      className='cursor-pointer'
                      style={{ color: 'rgba(0,0,0,0.7)', flexShrink: 0 }}
                      aria-hidden
                    />
                  </div>
                </Tooltip>
                <Switch
                  checked={!!isDncChecked}
                  onChange={(event) => {
                    if (
                      userLocalDetails?.planCapabilities.maxDNCChecks >=
                      userLocalDetails.currentUsage.maxDNCChecks
                    ) {
                      setIsDncChecked(event.target.checked)
                      if (event.target.checked) {
                        setShowDncConfirmationPopup(true)
                      } else {
                        setShowUpgradeModal(true)
                      }
                    }
                  }}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: brandPrimaryColor,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: brandPrimaryColor,
                    },
                    margin: 0,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col" style={{ gap: 8, paddingLeft: 16, paddingRight: 16 }}>
              <div className="flex flex-row items-center justify-between">
                <div className="start-campaign-label">
                  Drip per day
                </div>
                <div className="flex flex-row items-center gap-2">
                  <Checkbox
                    checked={!!NoOfLeadsToSend}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setNoOfLeadsToSend(totalLeads)
                        setCustomLeadsToSend('')
                        setisFocustedCustomLeads(false)
                      } else {
                        setNoOfLeadsToSend('')
                      }
                    }}
                  />
                  <span>Select All {getLeadSelectedCount()}</span>
                </div>
              </div>
              <div className="flex flex-col items-stretch" style={{ gap: 12 }}>
                <div
                  className="search-input-wrapper w-full h-[40px] flex flex-row items-center rounded-lg overflow-hidden"
                  style={{
                    paddingLeft: 12,
                    paddingRight: 12,
                  }}
                >
                  <input
                    className="w-full outline-none focus:ring-0 border-none bg-transparent text-[14px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none"
                    style={{ height: '100%', padding: 0 }}
                    value={customLeadsToSend}
                    disabled={!!NoOfLeadsToSend}
                    onFocus={() => {
                      setNoOfLeadsToSend('')
                      setisFocustedCustomLeads(true)
                    }}
                    onChange={(e) => {
                      let value = e.target.value
                      if (!/[0-9]/.test(value) && value !== '') return
                      setCustomLeadsToSend(e.target.value)
                      if (NoOfLeadsToSend) {
                        setNoOfLeadsToSend('')
                      }
                    }}
                    placeholder="Ex: 100"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col" style={{ gap: 8, paddingLeft: 16, paddingRight: 16 }}>
              <div className="start-campaign-label">
                When to start?
              </div>
              <div className="flex flex-row items-center" style={{ gap: 12 }}>
                <button
                  type="button"
                  className="w-1/2 flex flex-col justify-between items-start rounded-lg border transition-all duration-200 hover:border-[#D1D5DB] bg-white"
                  style={{
                    border: CallNow ? `2px solid ${brandPrimaryColor}` : '1px solid #E5E7EB',
                    height: 'auto',
                    minHeight: 'unset',
                    padding: 12,
                    gap: 12,
                    backgroundColor: CallNow ? 'hsl(var(--brand-primary) / 0.02)' : undefined,
                  }}
                  onClick={() => {
                    setHasUserSelectedDate(false)
                    const currentDateTime = new Date()
                    const currentHour = currentDateTime.getHours() // Get the current hour (0-23)
                    // if (currentHour >= 5 && currentHour < 19) {
                    //   //console.log;
                    setCallNow(currentDateTime)
                    setCallLater(false)
                    // } else {
                    //   //console.log;
                    //   setInvalidTimeMessage(
                    //     "❌ Current time is outside 5 AM to 7 PM."
                    //   );
                    // }
                    // console.log(
                    //   "Current data is:",
                    //   currentDateTime.toLocaleString()
                    // );
                    setSelectedDateTime(null)
                    setHasUserSelectedDate(false)
                    setIsDisabled(false)
                    // handleDateTimerDifference();
                  }}
                >
                  <ListStart size={18} className="flex-shrink-0" aria-hidden />
                  <div style={styles.title}>Start Now</div>
                </button>
                <div className="w-1/2">
                  <button
                    type="button"
                    className="w-full flex flex-col items-start justify-between rounded-lg border transition-all duration-200 hover:border-[#D1D5DB] bg-white"
                    style={{
                      border: CallLater
                        ? `2px solid ${brandPrimaryColor}`
                        : '1px solid #E5E7EB',
                      backgroundColor: CallLater ? 'hsl(var(--brand-primary) / 0.06)' : undefined,
                      height: 'auto',
                      minHeight: 'unset',
                      padding: 12,
                      gap: 12,
                      borderRadius: 8,
                    }}
                    onClick={() => {
                      setShowFromDatePicker(!showFromDatePicker)
                      setCallNow('')
                      setCallLater(true)
                      setSelectedDateTime(dayjs().startOf('day'))
                      setHasUserSelectedDate(true)
                      setIsDisabled(false)
                    }}
                  >
                    <Calendar size={18} className="flex-shrink-0" aria-hidden />
                    <div style={styles.title}>Schedule</div>
                  </button>
                  {/* <div>
                                      {
                                          showFromDatePicker && (
                                              <div>
                                                  <Calendar
                                                      onChange={handleFromDateChange}
                                                      value={selectedFromDate}
                                                      locale="en-US"
                                                      onClose={() => { setShowFromDatePicker(false) }}
                                                  />
                                              </div>
                                          )
                                      }
                                  </div> */}

                  <Modal
                    // open={showFromDatePicker}
                    onClose={() => setShowFromDatePicker(false)}
                    closeAfterTransition
                    BackdropProps={{
                      timeout: 1000,
                      sx: {
                        backgroundColor: '#00000020',
                        // //backdropFilter: "blur(5px)",
                      },
                    }}
                  >
                    <Box
                      className="lg:w-4/12 sm:w-7/12 w-8/12"
                      sx={styles.modalsStyle}
                    >
                      <div className="flex flex-row justify-center w-full">
                        <div
                          className="w-full flex flex-row justify-center"
                          style={{
                            backgroundColor: '#ffffff',
                            padding: 24,
                            borderRadius: 12,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.08)',
                            border: '1px solid #eaeaea',
                          }}
                        >
                          <div>
                            {/* <Calendar
                                                          onChange={handleFromDateChange}
                                                          value={selectedFromDate}
                                                          locale="en-US"
                                                          onClose={() => { setShowFromDatePicker(false) }}
                                                      /> */}
                            <div className="text-center text-xl font-bold">
                              Select date and time to schedule call
                            </div>
                            <div className="w-full mt-4 flex flex-row justify-center max-w-md">
                              <DateAndTimeFields
                                value={selectedDateTime}
                                onChange={handleDateChange}
                                minDate={userProfile?.timeZone ? dayjs().tz(userProfile.timeZone) : dayjs()}
                                error={false}
                              />
                            </div>
                            <div className="w-full flex flex-row justify-center mt-6">
                              <button
                                className="w-7/12 h-[50px] rounded-xl text-white font-bold"
                                style={{ backgroundColor: brandPrimaryColor }}
                                onClick={() => {
                                  setShowFromDatePicker(false)
                                }}
                              >
                                Select & close
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Box>
                  </Modal>
                </div>
              </div>
            </div>

            {CallLater && (
              <div className="px-4">
                <div className="mt-4 start-campaign-label">
                  Select date & time
                </div>
                <div className="mt-2 w-full">
                  <DateAndTimeFields
                    value={selectedDateTime}
                    onChange={handleDateChange}
                    minDate={dayjs()}
                    error={isDisabled}
                  />
                </div>
              </div>
            )}

            {showRefillToogle && (
              <div
                className="flex flex-col items-center w-full p-3 rounded-xl w-full mt-3"
                style={{ backgroundColor: '#D9D9D930' }}
              >
                <div className="flex flex-row items-center justify-between w-full">
                  <div
                    style={{ fontsize: 16, fontWeight: '600', color: 'black' }}
                  >
                    {`Turn on smart refill`}
                  </div>

                  <Switch
                    checked={isRefill}
                    // color="#7902DF"
                    // exclusive

                    onChange={() => {
                      setIsRefill(!isRefill)
                      if (isRefill === true) {
                        handleRemoveSmartRefill()
                      } else if (isRefill === false) {
                        handleUpdateProfile()
                      }
                    }}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: brandPrimaryColor,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: brandPrimaryColor,
                      },
                      margin: 0,
                    }}
                  />
                </div>

                <div style={{ fontsize: 14, fontWeight: '500', color: 'black' }}>
                  Avoid interruption when you are making calls and always make
                  sure your AI has credits to work with
                </div>
              </div>
            )}

            {loader ? (
              <div className="w-full flex flex-row items-center justify-center" style={{ margin: 0 }}>
                <CircularProgress size={30} />
              </div>
            ) : (
              <div className="w-full">
                <div className="flex flex-row items-center justify-between w-full gap-3" style={{ padding: 16, margin: 0 }}>
                  <button
                    type="button"
                    className="flex flex-row items-center justify-center gap-2 h-12 min-w-[60px] rounded-lg px-4 text-[14px] font-medium bg-muted text-foreground hover:bg-muted/80 transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 active:scale-[0.98] flex-shrink-0"
                    onClick={handleMoveBack}
                  >
                    Back
                  </button>
                  {(NoOfLeadsToSend || customLeadsToSend) &&
                    (CallNow ||
                      (CallLater &&
                        selectedDateTime &&
                        hasUserSelectedDate &&
                        !isDisabled)) ? (
                    <button
                      type="button"
                      className="flex-shrink-0 min-w-[60px] h-12 rounded-lg px-6 text-base font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 hover:shadow-[0_2px_8px_hsl(var(--brand-primary)/0.3)] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 active:scale-[0.98]"
                      onClick={() => {
                        const lastStepData = {
                          numberOfLeads: getLeadSelectedCount(),
                          cutomLeads: customLeadsToSend,
                          selectedDate: selectedDateTime,
                          DncChecked: isDncChecked,
                          isCallNow: CallNow,
                          callL: CallLater,
                        }
                        handleContinue(lastStepData)
                      }}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex-shrink-0 min-w-[60px] h-12 rounded-lg px-6 text-base font-semibold bg-black/[0.08] text-black/50 cursor-not-allowed"
                      disabled
                    >
                      Continue
                    </button>
                  )}
                </div>

                <UpgradeModal
                  open={showUpgradeModal}
                  handleClose={() => {
                    setShowUpgradeModal(false)
                  }}
                  title={"You've Hit Your DNC Limit"}
                  subTitle={'Upgrade to add more DNC lists'}
                  buttonTitle={'No Thanks'}
                />
              </div>
            )}
          </div>

          {/* <div className='mt-4 w-full'>
                              <button className="text-white rounded-xl w-full h-[50px]" style={{ ...styles.heading, backgroundColor: brandPrimaryColor }} onClick={() => { setLastStepModal(false) }}>
                                  Continue
                              </button>
                          </div> */}

          {/* Can be use full to add shadow */}
          {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
        </div>
      </div>
    </div>
  );
}

export default LastStep
