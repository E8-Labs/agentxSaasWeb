import {
  Box,
  CircularProgress,
  Modal,
  Switch,
  TextField,
  Tooltip,
} from '@mui/material'
// import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { CalendarDots, CaretLeft } from '@phosphor-icons/react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
// Import Day.js
import utc from 'dayjs/plugin/utc'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { userLocalData } from '@/components/agency/plan/AuthDetails'
import { getUserLocalData } from '@/components/constants/constants'
import {
  RemoveSmartRefillApi,
  SmartRefillApi,
} from '@/components/onboarding/extras/SmartRefillapi'
import UpgradeModal from '@/constants/UpgradeModal'
import { getAgentImage } from '@/utilities/agentUtilities'

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
      
      if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0
      } else if (1/6 <= h && h < 2/6) {
        r = x; g = c; b = 0
      } else if (2/6 <= h && h < 3/6) {
        r = 0; g = c; b = x
      } else if (3/6 <= h && h < 4/6) {
        r = 0; g = x; b = c
      } else if (4/6 <= h && h < 5/6) {
        r = x; g = 0; b = c
      } else if (5/6 <= h && h < 1) {
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

  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false)
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
  const [selectedDateTime, setSelectedDateTime] = useState(null)
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
      setIsDncChecked(DncChecked)
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
  useEffect(() => {}, [selectedDateTime])

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
      fontWeight: '600',
      fontSize: 17,
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
            // creditCost={creditCost}
          />
        )}

        <div
          className="w-full"
          style={{
            backgroundColor: '#ffffff',
            padding: 20,
            borderRadius: '13px',
          }}
        >
          <div className="flex flex-row justify-between">
            <button
              className="flex flex-row items-center justify-center gap-2 bg-[#15151515] h-[34px] w-[92px] rounded-2xl pe-2"
              onClick={handleMoveBack}
            >
              <CaretLeft size={20} weight="bold" />
              <span style={styles.title}>Back</span>
            </button>
            <button
              onClick={() => {
                handleMoveBack()
              }}
            >
              <Image src={'/assets/cross.png'} height={14} width={14} alt="*" />
            </button>
          </div>

          <div className="flex flex-row items-center justify-between mt-6">
            <div
              style={{
                fontWeight: '700',
                fontSize: 24,
              }}
            >
              One last thing
            </div>
            <div className="flex flex-col items-start">
              <div
                style={{ fontSize: 12, fontWeight: '600', color: brandPrimaryColor }}
              >
                {getLeadSelectedCount()} Contacts Selected
              </div>

              <div className="flex flex-row items-center  -mt-2">
                <Tooltip
                  title="If the lead has given consent, no need to run against DNC"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: '#ffffff', // Ensure white background
                        color: '#333', // Dark text color
                        fontSize: '14px',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                      },
                    },
                    arrow: {
                      sx: {
                        color: '#ffffff', // Match tooltip background
                      },
                    },
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#000000',
                      cursor: 'pointer',
                    }}
                  >
                    Check DNC List
                  </div>
                </Tooltip>

                <Switch
                  checked={isDncChecked}
                  // color="#7902DF"
                  // exclusive
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
          </div>

          <div className="mt-4" style={styles.heading}>
            Drip per day
          </div>

          <div className="flex flex-row items-center gap-8 mt-4">
            <div
              className="w-1/2 h-[50px] rounded-2xl p-4 flex flex-row items-center"
              style={{
                border: `${
                  isFocustedCustomLeads
                    ? `2px solid ${brandPrimaryColor}`
                    : '1px solid #00000040'
                }`,
              }}
            >
              <input
                className="w-full rounded-2xl outline-none focus:ring-0 border-none"
                value={customLeadsToSend}
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
                style={{ fontSize: 15, fontWeight: '500' }}
              />
            </div>
            <button
              className="w-1/2 flex flex-row items-center p-4 rounded-2xl"
              style={{
                border: NoOfLeadsToSend
                  ? `2px solid ${brandPrimaryColor}`
                  : '1px solid #00000040',
                height: '50px',
              }}
              onClick={() => {
                setNoOfLeadsToSend(totalLeads)
                setCustomLeadsToSend('')
                setisFocustedCustomLeads(false)
              }}
            >
              All {getLeadSelectedCount()}
            </button>
          </div>

          <div className="mt-4" style={styles.heading}>
            When to start?
          </div>

          <div className="flex flex-row items-center gap-8 mt-4">
            <button
              className="w-1/2 flex flex-col justify-between items-start p-4 rounded-2xl"
              style={{
                border: CallNow ? `2px solid ${brandPrimaryColor}` : '1px solid #00000040',
                height: '119px',
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
              <Image
                src={'/assets/callBtn.png'}
                height={24}
                width={24}
                alt="*"
              />
              <div style={styles.title}>Start Now</div>
            </button>
            <div className="w-1/2">
              <button
                className="w-full flex flex-col items-start justify-between p-4 rounded-2xl"
                style={{
                    border: CallLater
                      ? `2px solid ${brandPrimaryColor}`
                      : '1px solid #00000040',
                  height: '119px',
                }}
                onClick={() => {
                  setShowFromDatePicker(!showFromDatePicker)
                  setCallNow('')
                  setCallLater(true)
                  setSelectedDateTime(dayjs())
                  setHasUserSelectedDate(true)
                  setIsDisabled(false)
                }}
              >
                <CalendarDots size={32} weight="bold" />
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
                        padding: 20,
                        borderRadius: '13px',
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
                          Select date and time to shedule call
                        </div>
                        <div className="w-full mt-4 flex flex-row justify-center">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                              value={selectedDateTime}
                              // label="Select date and time"
                              //user profile will be passed to it
                              minDateTime={dayjs().tz(userProfile.timeZone)}
                              //   value={value}
                              sx={{
                                // Date Picker (Large Screen)
                                '& .MuiPickersDay-root.Mui-selected': {
                                  backgroundColor: `${brandPrimaryColor} !important`,
                                  color: 'white !important',
                                },
                                '& .MuiPickersDay-root:hover': {
                                  backgroundColor: `${brandPrimaryColor}CC !important`,
                                },
                                '& .Mui-selected': {
                                  backgroundColor: `${brandPrimaryColor} !important`,
                                  color: '#fff !important',
                                },

                                // Time Picker (Large Screen)
                                '& .MuiClock-pin': {
                                  backgroundColor: `${brandPrimaryColor} !important`,
                                },
                                '& .MuiClockPointer-root': {
                                  backgroundColor: `${brandPrimaryColor} !important`,
                                },
                                '& .MuiClockPointer-thumb': {
                                  borderColor: `${brandPrimaryColor} !important`,
                                },
                                '& .MuiPickersToolbar-root': {
                                  backgroundColor: `${brandPrimaryColor} !important`,
                                },
                                '& .MuiTypography-root': {
                                  color: `${brandPrimaryColor} !important`,
                                },

                                // Time Selection List (Large Screen)
                                '& .MuiPickersTimeClock-root .Mui-selected': {
                                  backgroundColor: `${brandPrimaryColor} !important`,
                                  color: 'white !important',
                                },
                                '& .MuiPickersTimeClock-root .MuiButtonBase-root:hover':
                                  {
                                    backgroundColor: `${brandPrimaryColor}CC !important`,
                                  },

                                // Time Picker List (Dropdown List)
                                '& .MuiTimeClock-root .Mui-selected': {
                                  backgroundColor: `${brandPrimaryColor} !important`,
                                  color: 'white !important',
                                },
                                '& .MuiTimeClock-root .MuiButtonBase-root:hover':
                                  {
                                    backgroundColor: `${brandPrimaryColor}CC !important`,
                                  },
                              }}
                              onChange={handleDateChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '10px',
                                      '& fieldset': {
                                        borderColor: hasUserSelectedDate
                                          ? brandPrimaryColor
                                          : '#00000050',
                                        borderWidth: '2px',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: hasUserSelectedDate
                                          ? brandPrimaryColor
                                          : '#00000050',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: hasUserSelectedDate
                                          ? brandPrimaryColor
                                          : '#00000050',
                                      },
                                    },
                                  }}
                                />
                              )}
                            />
                          </LocalizationProvider>
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

          {CallLater && (
            <div>
              <div
                className="mt-4"
                style={{
                  fontWeight: '500',
                  fontsize: 12,
                  color: '#00000050',
                }}
              >
                Select date & time
              </div>
              <div className="mt-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    // label="Select date and time"
                    minDateTime={dayjs()}
                    // minDateTime={dayjs().tz(userProfile.timeZone)}
                    value={selectedDateTime}
                    minDate={dayjs()}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        error: isDisabled,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            '& fieldset': {
                              borderColor: hasUserSelectedDate
                                ? brandPrimaryColor
                                : '#00000050',
                              borderWidth: '2px',
                            },
                            '&:hover fieldset': {
                              borderColor: hasUserSelectedDate
                                ? '#7902df'
                                : '#00000050',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: hasUserSelectedDate
                                ? '#7902df'
                                : '#00000050',
                            },
                          },
                        },
                      },
                    }}
                    sx={{
                          '& .MuiPickersDay-root.Mui-selected': {
                            backgroundColor: `${brandPrimaryColor} !important`,
                            color: 'white !important',
                          },
                          '& .MuiPickersDay-root:hover': {
                            backgroundColor: `${brandPrimaryColor}CC !important`,
                          },
                          '& .MuiButtonBase-root.MuiPickersDay-root:not(.Mui-selected)':
                            {
                              color: '#333 !important',
                            },
                          '& .Mui-selected': {
                            backgroundColor: `${brandPrimaryColor} !important`,
                            color: '#fff !important',
                          },
                          '& .MuiClock-pin': {
                            backgroundColor: `${brandPrimaryColor} !important`,
                          },
                          '& .MuiClockPointer-root': {
                            backgroundColor: `${brandPrimaryColor} !important`,
                          },
                          '& .MuiClockPointer-thumb': {
                            borderColor: `${brandPrimaryColor} !important`,
                          },
                    }}
                    renderInput={(params) => (
                      <input
                        {...params.inputProps}
                        style={{
                          border: 'none', // Disable border
                          outline: 'none',
                          padding: '8px',
                          backgroundColor: '#f9f9f9', // Optional: subtle background for better visibility
                        }}
                        onFocus={(e) => {
                          e.target.style.border = 'none' // Ensure no border on focus
                          e.target.style.outline = 'none' // Ensure no outline on focus
                        }}
                        onBlur={(e) => {
                          e.target.style.border = 'none' // Reset border on blur
                          e.target.style.outline = 'none' // Reset outline on blur
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.border = 'none' // Remove border on hover
                          e.target.style.outline = 'none' // Remove outline on hover
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.border = 'none' // Reset border on hover out
                          e.target.style.outline = 'none' // Reset outline on hover out
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
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
            <div className="mt-4 w-full flex flex-row items-center justify-center">
              <CircularProgress size={30} />
            </div>
          ) : (
            <div className="w-full">
              {(NoOfLeadsToSend || customLeadsToSend) &&
              (CallNow ||
                (CallLater &&
                  selectedDateTime &&
                  hasUserSelectedDate &&
                  !isDisabled)) ? (
                <button
                  className="text-white w-full h-[50px] rounded-lg mt-4"
                  style={{ backgroundColor: brandPrimaryColor }}
                  onClick={() => {
                    const localData = localStorage.getItem('User')
                    // if (localData) {
                    //   const UserDetails = JSON.parse(localData);
                    //   console.log(UserDetails.user.smartRefill);
                    //   if (UserDetails.user.smartRefill === false) {
                    //     // setShowSmartRefillPopUp(true);
                    //     //handle continue here
                    //     return;
                    //   }
                    // }
                    const lastStepData = {
                      // numberOfLeads: NoOfLeadsToSend,
                      numberOfLeads: getLeadSelectedCount(),
                      cutomLeads: customLeadsToSend,
                      selectedDate: selectedDateTime,
                      DncChecked: isDncChecked,
                      isCallNow: CallNow,
                      callL: CallLater,
                    }
                    handleContinue(lastStepData)
                    //triger assign lead api here
                    // handleAssignLead();
                    // handleAssigLead()
                  }}
                >
                  Continue
                </button>
              ) : (
                <button
                  className="text-[#000000] w-full h-[50px] rounded-lg bg-[#00000020] mt-4"
                  disabled={true}
                >
                  Continue
                </button>
              )}

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
