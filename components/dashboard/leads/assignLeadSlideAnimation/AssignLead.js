import 'react-calendar/dist/Calendar.css'

import {
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Modal,
  Radio,
  RadioGroup,
  Switch,
  Typography,
} from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { CalendarDots, CaretLeft } from '@phosphor-icons/react'
import axios from 'axios'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
// Import Day.js
import utc from 'dayjs/plugin/utc'
import moment from 'moment'
import Image from 'next/image'
import React, { use, useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import InfiniteScroll from 'react-infinite-scroll-component'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { SmartRefillApi } from '@/components/onboarding/extras/SmartRefillapi'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'
import { getAgentImage } from '@/utilities/agentUtilities'
import { GetTimezone } from '@/utilities/utility'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../AgentSelectSnackMessage'
import AllowSmartRefillPopup from '../AllowSmartRefillPopup'
import DncConfirmationPopup from '../DncConfirmationPopup'

dayjs.extend(utc)
dayjs.extend(timezone)

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

const AssignLead = ({
  leadIs,
  handleCloseAssignLeadModal,
  selectedAll = false,
  filters = null,
  totalLeads = 0,
  userProfile, // this is the .user object doesn't include token
  selectedLead,
  handleContinue,
  selectedAgents,
  oldAgents,
}) => {
  // //console.log;
  // console.log("leadIs length is:",leadIs.length)
  // console.log('selectedAll', selectedAll)
  const [showDncConfirmationPopup, setShowDncConfirmationPopup] =
    useState(false)
  const [showSuccessSnack, setShowSuccessSnack] = useState(null)
  const [initialLoader, setInitialLoader] = useState(false)
  const [agentsList, setAgentsList] = useState([])
  //pagination
  const [hasMoreAgents, setHasMoreAgents] = useState(true)
  const [stages, setStages] = useState([])
  const [SelectedAgents, setSelectedAgents] = useState([])
  const [CannotAssignLeadModal, setCannotAssignLeadModal] = useState(false)
  const [loader, setLoader] = useState(false)
  const [lastStepModal, setLastStepModal] = useState(false)
  const [ShouldContinue, setShouldContinue] = useState(false)
  const [NoOfLeadsToSend, setNoOfLeadsToSend] = useState('')
  const [customLeadsToSend, setCustomLeadsToSend] = useState('')
  const [isFocustedCustomLeads, setisFocustedCustomLeads] = useState('')
  const [selectedFromDate, setSelectedFromDate] = useState(null)
  const [showFromDatePicker, setShowFromDatePicker] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState(dayjs())
  const [CallNow, setCallNow] = useState('')
  const [CallLater, setCallLater] = useState(false)

  //smart refill
  const [showSmartRefillPopUp, setShowSmartRefillPopUp] = useState(false)
  const [smartRefillLoader, setSmartRefillLoader] = useState(false)
  const [smartRefillLoaderLater, setSmartRefillLoaderLater] = useState(false)

  const [invalidTimeMessage, setInvalidTimeMessage] = useState(null)

  //new code by salman
  const [errorMessage, setErrorMessage] = useState(null)
  const [errTitle, setErrTitle] = useState(null)
  const SelectAgentErrorTimeout = 4000 //change this to change the duration of the snack timer

  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false)
  const [isDncChecked, setIsDncChecked] = useState(false)
  
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

  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage(null)
        setErrTitle(null)
      }, SelectAgentErrorTimeout)
    }
  }, [errorMessage])

  useEffect(() => {
    setShouldContinue(SelectedAgents.length === 0)
  }, [SelectedAgents])

  const [creditCost, setCreditCost] = useState(null) //for credit cost

  useEffect(() => {
    // //console.log;

    let agentsList = []

    // const localAgents = localStorage.getItem("localAgentDetails");
    // if (localAgents) {
    //   agentsList = JSON.parse(localAgents);
    //   // //console.log;
    //   let newAgenstList = [];

    //   newAgenstList = agentsList.filter((mainAgent) => {
    //     // Check if all subagents are either outbound or both inbound and outbound
    //     const subAgents = mainAgent.agents;
    //     const hasOutbound = subAgents.some(
    //       (item) => item.agentType === "outbound"
    //     );
    //     const hasInbound = subAgents.some(
    //       (item) => item.agentType === "inbound"
    //     );

    //     // Keep the main agent if it has only outbound agents or both inbound and outbound agents
    //     return hasOutbound && (!hasInbound || hasInbound);
    //   });

    //   // //console.log;

    //   setAgentsList(newAgenstList);
    //   setStages(newAgenstList.stages);
    // }
    // else {
    // //console.log;

    // if (oldAgents?.length > 0) {
    //   console.log("Getting reserved agents", oldAgents);
    //   // setSelectedAgents(oldAgents);
    //   // setInitialLoader(false);
    // } else {
    //   console.log("Get agents api trigered");
    // }

    getAgents()
  }, [selectedAgents])

  useEffect(() => {}, [SelectedAgents])

  //get agents api
  const getAgents = async (initialoaderStatus) => {
    try {
      const checkLocalAgentsList = localStorage.getItem('localAgentDetails')

      if (initialoaderStatus?.initialoaderStatus === false) {
        setInitialLoader(false)
      } else {
        if (!checkLocalAgentsList) {
          setInitialLoader(true)
        }
      }
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
        // //console.log;
      }

      // //console.log;

      // const ApiPath = Apis.getAgents;
      const offset = agentsList.length
      const ApiPath = `${Apis.getAgents}?offset=${offset}&agentType=outbound&pipeline=true`
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // localStorage.setItem(
        //   "localAgentDetails",
        //   JSON.stringify(response.data.data)
        // );
        // let filterredAgentsList = [];
        //// //console.log);
        const filterredAgentsList2 = response.data.data.filter((mainAgent) => {
          // Check if all subagents are either outbound or both inbound and outbound
          const subAgents = mainAgent.agents
          const hasOutbound = subAgents.some(
            (item) => item.agentType === 'outbound',
          )
          const hasInbound = subAgents.some(
            (item) => item.agentType === 'inbound',
          )

          // Keep the main agent if it has only outbound agents or both inbound and outbound agents
          return hasOutbound && (!hasInbound || hasInbound)
        })
        // console.log("Response of api is", response.data.data);
        let filterredAgentsList = response?.data?.data
        setAgentsList([...agentsList, ...filterredAgentsList])
        if (SelectedAgents.length > 0) {
          setSelectedAgents(SelectedAgents)
        } else if (selectedAgents.length > 0) {
          setSelectedAgents(selectedAgents)
        }
        if (filterredAgentsList.length > 0) {
          setHasMoreAgents(true)
        } else {
          setHasMoreAgents(false)
        }
        //console.log;
        setStages(filterredAgentsList.stages)
      }
    } catch (error) {
      // console.error("ERrror occured in agents api is :", error);
    } finally {
      setInitialLoader(false)
      // //console.log;
    }
  }

  function GetOutboundAgent(mainAgent) {
    if (mainAgent.agents.length == 0) {
      return null
    }
    if (mainAgent.agents.length > 0) {
      let outbound = null
      for (const a of mainAgent.agents) {
        if (a.agentType == 'outbound' || a.agentType == 'inbound') {
          outbound = a
        }
      }
      return outbound
    }
  }

  function GetInboundAgent(mainAgent) {
    if (mainAgent.agents.length == 0) {
      return false
    }
    if (mainAgent.agents.length > 0) {
      let inbound = false
      for (const a of mainAgent.agents) {
        if (a.agentType == 'inbound') {
          inbound = true
          // console.log("returned the agent", a);
        } else if (a.agentType == 'outbound') {
          inbound = false
        }
      }
      return inbound
    }
  }

  //check inbound and nostages agent
  const checkNostageAndInboundAgent = (item) => {
    if (GetInboundAgent(item) || item.stages.length === 0) {
      return true
    } else {
      return false
    }
  }

  //can assign stage or not
  const canAssignStage = (item) => {
    // //console.log;
    //0 unselected
    //1 selected
    //2 can not assign
    // Check if the item is already selected
    const isAlreadySelected = SelectedAgents.some(
      (selectedItem) => selectedItem.id === item.id,
    )

    if (isAlreadySelected) {
      // Remove the item if it's already selected
      // //console.log;
      return 1
      // return prevSelectedItems.filter((selectedItem) => selectedItem.id !== item.id);
    } else {
      let allSelectedAgentStages = []
      // item.stages.map((agent) => {
      //     allSelectedAgentStages.push(agent)
      // })

      SelectedAgents.map((agent) => {
        allSelectedAgentStages = [...allSelectedAgentStages, ...agent.stages]
        // allSelectedAgentStages.push(agent.stages)
      })

      let canAssignStage = 0
      // Check if the pipeline.id matches with any previously selected item's pipeline.id
      if (item) {
        SelectedAgents.map((agent) => {
          if (agent?.pipeline?.id != item?.pipeline?.id) {
            canAssignStage = 2
          }
        })
      }

      if (canAssignStage == 0) {
        // //console.log;
      } else {
        // //console.log;
        if (!errorMessage) {
          setErrTitle('Pipeline Confilict')
          setErrorMessage(
            'You can’t assign leads to agents in different pipelines',
          )
        }
        return 2
      }

      // //console.log;

      // Check if any of the selected items have a matching stageTitle

      // //console.log;
      // //console.log;

      if (item.stages) {
        item.stages.map((stage) => {
          allSelectedAgentStages.map((selectedStage) => {
            //// //console.log})
            if (stage.id == selectedStage.id) {
              // //console.log;
              if (!errorMessage) {
                setErrTitle('Conflicting Agents')
                setErrorMessage(
                  'You can’t assign leads to agents in the same stage',
                )
              }
              canAssignStage = 2
            }
          })
        })
      }

      // item.stages.forEach((stage) => {
      //     allSelectedAgentStages.forEach((selectedStage) => {
      //         if (stage.id === selectedStage.id) {
      //            // //console.log;
      //             canAssignStage = 2; // Update the flag
      //         }
      //     });
      // });

      return canAssignStage
    }
    // });
  }

  const handleAssignLead = async () => {
    let userTimeZone = GetTimezone() //userProfile.timeZone || "America/Los_Angeles";
    const selectedDate = dayjs(selectedDateTime).tz(userTimeZone) // Convert input date to Day.js object
    const currentHour = selectedDate.hour() // Get the current hour (0-23)
    const currentMinute = selectedDate.minute() // Get minutes for 8:30 PM check
    //console.log;
    //console.log;
    //console.log;
    //console.log;

    const isAfterStartTime = currentHour >= 7 // || (selectedHour === 7 && selectedMinute >= 0); // 7:00 AM or later
    const isBeforeEndTime =
      currentHour < 21 || (currentHour === 21 && currentMinute <= 0) // Before 9:00 PM
    if (
      isAfterStartTime && // After 7:00 AM
      isBeforeEndTime // Before 9:00 PM
    ) {} else {
      //console.log;
      // setInvalidTimeMessage(
      //   "Calls only between 7am-9pm"
      //   // "Calling is only available between 7AM and 9PM in " + userTimeZone
      // );
      // return;
    }

    // return;

    try {
      setLoader(true)

      let timer = null
      let batchSize = null

      if (customLeadsToSend) {
        batchSize = customLeadsToSend
      } else if (NoOfLeadsToSend) {
        batchSize = NoOfLeadsToSend
      }

      if (CallNow) {
        timer = 0
      } else if (CallLater) {
        const currentDateTime = dayjs() // Get current date and time using Day.js

        const differenceInMilliseconds = selectedDateTime.diff(currentDateTime) // Difference in ms
        const minutes = differenceInMilliseconds / (1000 * 60) // Convert ms to minutes
        timer = minutes.toFixed(0) // Round to nearest integer

        // //console.log;
        // //console.log;
        // //console.log;
      }

      let Apidata = {
        pipelineId: SelectedAgents[0].pipeline.id,
        mainAgentIds: SelectedAgents.map((item) => item.id),
        leadIds: leadIs,
        startTimeDifFromNow: timer,
        batchSize: batchSize,
        selectedAll: selectedAll,
        dncCheck: isDncChecked ? true : false,
      }

      //console.log;
      // return;
      if (filters && selectedAll) {
        Apidata = {
          pipelineId: SelectedAgents[0].pipeline.id,
          mainAgentIds: SelectedAgents.map((item) => item.id),
          leadIds: leadIs,
          startTimeDifFromNow: timer,
          batchSize: batchSize,
          selectedAll: selectedAll,
          dncCheck: isDncChecked,
          ...filters,
        }
      }

      //console.log;
      // return;
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      const ApiPath = Apis.assignLeadToPipeLine

      // //console.log;

      const response = await axios.post(ApiPath, Apidata, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          handleCloseAssignLeadModal({
            status: false,
            showSnack: 'Lead assigned',
            disSelectLeads: true,
          })
          setLastStepModal(false)
          // window.location.reload();
        } else if (response.data.status === false) {
          // Extract error message from response if available
          const errorMessage = response.data.message || response.data.error || 'Error assigning lead'
          handleCloseAssignLeadModal({
            status: true,
            showSnack: errorMessage,
            disSelectLeads: false,
          })
        }
      }
    } catch (error) {
      console.error("Error occurred in assign lead API:", error)
      // Extract error message from axios error response
      let errorMessage = 'Error assigning lead'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      handleCloseAssignLeadModal({
        status: true,
        showSnack: errorMessage,
        disSelectLeads: false,
      })
      setSmartRefillLoader(false)
      setSmartRefillLoaderLater(false)
    } finally {
      setLoader(false)
      setSmartRefillLoader(false)
      setSmartRefillLoaderLater(false)
    }
  }

  //code for update profile for smartrefill
  const handleSmartRefill = async () => {
    try {
      setSmartRefillLoader(true)
      const response = await SmartRefillApi()
      if (response.data.status === true) {
        handleAssignLead()
      }
    } catch (error) {
      setSmartRefillLoader(false)
      console.error('Error occured is', error)
    }
  }

  const handleSmartRefillLater = async () => {
    try {
      setSmartRefillLoaderLater(true)
      handleAssignLead()
    } catch (error) {
      setSmartRefillLoaderLater(false)
      console.error('Error occured is', error)
    }
  }

  //code for date picker

  const handleDateChange = (date) => {
    if (!date) {
      // //console.log;
      return
    }

    setSelectedDateTime(date)
    setHasUserSelectedDate(true)
  }

  const handleFromDateChange = (date) => {
    setSelectedFromDate(date) // Set the selected date
    setShowFromDatePicker(false)
  }

  function getLeadSelectedCount() {
    if (selectedAll) {
      return totalLeads - leadIs.length
    } else {
      return leadIs.length
    }
  }

  function GetAgentsActiveInPipelinesAndStages() {
    // let filtered = agentsList.filter((item) => {
    //   return item.pipeline != null && item.stages.length > 0;
    // });
    return agentsList
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
    <div className="w-full">
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
          leadsCount={selectedAll ? totalLeads - leadIs.length : leadIs.length}
        />
      )}
      {/* Snackbar for invalid time */}
      <div className="flex flex-row items-center justify-between mt-4">
        <div style={{ fontSize: 24, fontWeight: '700' }}>Select your Agent</div>
        <div className="flex flex-row items-center gap-2">
          <div style={{ ...styles.paragraph, color: brandPrimaryColor }}>
            {getLeadSelectedCount()} Contacts Selected
          </div>
          <CloseBtn onClick={handleCloseAssignLeadModal} />
        </div>
      </div>
      <div
        className="mt-2"
        style={styles.paragraph2}
        onClick={() => {
          // setLastStepModal(true);
        }}
      >
        Only outbound agents assigned to a stage can be selected.
      </div>
      {initialLoader ? (
        <div className="w-full flex flex-row justify-center mt-4">
          <CircularProgress size={30} />
        </div>
      ) : (
        <div
          className="relative max-h-[50vh] overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
          id="scrollableAgentDiv"
        >
          <InfiniteScroll
            dataLength={agentsList.length}
            next={() => {
              getAgents({ initialoaderStatus: false })
            }}
            hasMore={hasMoreAgents}
            scrollableTarget="scrollableAgentDiv"
            loader={
              <div className="w-full flex justify-center mt-4">
                <CircularProgress size={30} sx={{ color: brandPrimaryColor }} />
              </div>
            }
            endMessage={
              <p
                style={{
                  textAlign: 'center',
                  paddingTop: '10px',
                  fontWeight: '400',
                  fontFamily: 'inter',
                  fontSize: 16,
                  color: '#00000060',
                }}
              >
                {`You're all caught up`}
              </p>
            }
            style={{ overflow: 'unset' }}
          >
            {GetAgentsActiveInPipelinesAndStages().map((item, index) => {
              const noNumberWarning = (mainAgent) => {
                // console.log(
                //   "Agent passed is",
                //   mainAgent?.agents?.map((item) => item.phoneNumber)
                // );
                return mainAgent.agents.map((subAgent, index) => {
                  // Check if the agent is of type 'outbound' and has no phone number
                  if (
                    subAgent.agentType === 'outbound' &&
                    (!subAgent.phoneNumber || subAgent.phoneNumber === '')
                  ) {
                    return (
                      <div key={index}>
                        <div className="flex flex-row items-center gap-2 -mt-1">
                          <Image
                            src={'/assets/warningFill.png'}
                            height={18}
                            width={18}
                            alt="*"
                          />
                          <p>
                            <i
                              className="text-red"
                              style={{
                                fontSize: 12,
                                fontWeight: '600',
                              }}
                            >
                              No phone number assigned
                            </i>
                          </p>
                        </div>
                      </div>
                    )
                  }
                  return null
                })
              }

              return (
                <button
                  key={index}
                  disabled={checkNostageAndInboundAgent(item)}
                  className={`rounded-xl p-2 mt-4 w-full outline-none ${checkNostageAndInboundAgent(item) ? 'bg-[#00000020]' : ''}`} //
                  style={{
                    border: SelectedAgents.some((a) => a.id === item.id)
                      ? `2px solid ${brandPrimaryColor}`
                      : '1px solid #00000020',
                    backgroundColor: SelectedAgents.some(
                      (a) => a.id === item.id,
                    )
                      ? `${brandPrimaryColor}08`
                      : '',
                  }}
                  onClick={() => {
                    // console.log("Selected item is", item);
                    let canAssign = canAssignStage(item)
                    if (canAssign == 0) {
                      //push to the array
                      // //console.log;
                      setSelectedAgents((prev) => [...prev, item])

                      // setLastStepModal(true);//loader
                      setShouldContinue(false)
                    } else if (canAssign == 1) {
                      //remove from the array
                      // //console.log;
                      let agents = SelectedAgents.filter(
                        (selectedItem) => selectedItem.id !== item.id,
                      )
                      setSelectedAgents(agents)
                    } else if (canAssign == 2) {
                      //can not assign. Show popup
                      setCannotAssignLeadModal(true)
                    }
                  }}
                >
                  <div className="flex flex-row items-center justify-between pt-2">
                    <div className="flex flex-row items-center gap-2">
                      {getAgentImage(item)}
                      <span style={styles.heading}>
                        {GetOutboundAgent(item)
                          ?.name?.slice(0, 1)
                          ?.toUpperCase()}
                        {GetOutboundAgent(item)?.name?.slice(1)}
                        {/*item?.name?.slice(0, 1)?.toUpperCase()}
                        {item?.name?.slice(1)*/}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <div>{noNumberWarning(item)}</div>
                      <div
                        style={{
                          fontWeight: '500',
                          fontSize: 12,
                        }}
                      >
                        {item.agents[0]?.agentRole}
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex flex-row items-center gap-2 mt-6 pb-2 w-full overflow-auto"
                    style={{
                      ...styles.paragraph,
                      overflowY: 'hidden',
                      scrollbarWidth: 'none', // For Firefox
                      msOverflowStyle: 'none', // For Internet Explorer and Edge
                    }}
                  >
                    <style jsx>
                      {`
                        div::-webkit-scrollbar {
                          display: none; /* For Chrome, Safari, and Opera */
                        }
                      `}
                    </style>
                    <div
                      className="flex-shrink-0 flex flex-row items-center gap-1"
                      style={styles.paragraph}
                    >
                      <span style={{ color: brandPrimaryColor }}>Active in | </span>{' '}
                      {item.pipeline?.title || 'No Pipeline'}
                    </div>

                    {item.stages.length > 0 ? (
                      <div
                        className="flex-shrink-0 flex flex-row gap-2 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
                        style={{ scrollbarWidth: 'none' }}
                      >
                        {item.stages.map((item, index) => (
                          <div
                            className="px-3 py-1 rounded-3xl border"
                            style={styles.paragraph}
                            key={index}
                          >
                            {item.stageTitle}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        className="px-3 py-1 rounded-3xl border"
                        style={styles.paragraph}
                      >
                        No Stage
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </InfiniteScroll>
        </div>
      )}
      <div>
        <button
          className="rounded-lg mt-4 w-full h-[50px]"
          style={{
            ...styles.heading,
            backgroundColor: ShouldContinue ? '#00000020' : brandPrimaryColor,
            color: ShouldContinue ? '#00000080' : 'white',
          }} //onClick={handleAssigLead}
          disabled={ShouldContinue}
          onClick={() => {
            const A = agentsList
            localStorage.setItem('AssignLeadAgents', JSON.stringify(A))
            handleContinue({ SelectedAgents, agentsList })
            // setLastStepModal(true);
          }}
        >
          Continue
        </button>
      </div>
      {/* last step modal 

      <AllowSmartRefillPopup
        showSmartRefillPopUp={showSmartRefillPopUp}
        handleCloseReillPopup={() => {
          setShowSmartRefillPopUp(false);
        }}
        smartRefillLoader={smartRefillLoader}
        smartRefillLoaderLater={smartRefillLoaderLater}
        handleSmartRefillLater={handleSmartRefillLater}
        handleSmartRefill={handleSmartRefill}
      />
*/}
      <Modal
        open={lastStepModal}
        onClose={() => setLastStepModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-4/12 sm:w-7/12 w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
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

            <div
              className="w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row justify-between">
                <button className="flex flex-row items-center justify-center gap-2 bg-[#15151515] h-[34px] w-[92px] rounded-2xl pe-2">
                  <CaretLeft size={20} weight="bold" />
                  <span
                    style={styles.title}
                    onClick={() => {
                      setLastStepModal(false)
                    }}
                  >
                    Back
                  </span>
                </button>
                <CloseBtn
                  onClick={() => {
                    setLastStepModal(false)
                  }}
                />
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
                        setIsDncChecked(event.target.checked)
                        if (event.target.checked) {
                          setShowDncConfirmationPopup(true)
                        }
                      }}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: brandPrimaryColor,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                          {
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
                <input
                  className="w-1/2 flex flex-row items-center p-4 rounded-2xl otline-none focus:ring-0"
                  style={{
                    border: `${
                      isFocustedCustomLeads
                        ? `2px solid ${brandPrimaryColor}`
                        : '1px solid #00000040'
                    }`,
                    height: '50px',
                  }}
                  value={customLeadsToSend}
                  onFocus={() => {
                    setNoOfLeadsToSend('')
                    setisFocustedCustomLeads(true)
                  }}
                  onChange={(e) => {
                    let value = e.target.value
                    if (!/[0-9]/.test(value) && value !== '') return
                    setCustomLeadsToSend(e.target.value)
                  }}
                  placeholder="Ex: 100"
                />
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
                When to start calling?
              </div>

              <div className="flex flex-row items-center gap-8 mt-4">
                <button
                  className="w-1/2 flex flex-col justify-between items-start p-4 rounded-2xl"
                  style={{
                    border: CallNow
                      ? `2px solid ${brandPrimaryColor}`
                      : '1px solid #00000040',
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
                    setSelectedDateTime(dayjs())

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
                                  // label="Select date and time"
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
                                    '& .MuiPickersTimeClock-root .Mui-selected':
                                      {
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
                        // minDateTime={dayjs()}
                        //   value={value}
                        minDate={dayjs()}
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            variant: 'outlined',
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
                                    ? brandPrimaryColor
                                    : '#00000050',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: hasUserSelectedDate
                                    ? brandPrimaryColor
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
                              border: 'red', // Disable border
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

              {loader ? (
                <div className="mt-4 w-full flex flex-row items-center justify-center">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <div className="w-full">
                  {(NoOfLeadsToSend || customLeadsToSend) &&
                  (CallNow ||
                    (CallLater && selectedDateTime && hasUserSelectedDate)) ? (
                    <button
                      className="text-white w-full h-[50px] rounded-lg mt-4"
                      style={{ backgroundColor: brandPrimaryColor }}
                      onClick={() => {
                        const localData = localStorage.getItem('User')
                        if (localData) {
                          const UserDetails = JSON.parse(localData)
                          if (UserDetails.user.smartRefill === false) {
                            setShowSmartRefillPopUp(true)
                            return
                          }
                        }
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
        </Box>
      </Modal>
    </div>
  );
}

export default AssignLead
