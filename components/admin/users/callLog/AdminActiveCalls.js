import { Box, CircularProgress, Modal, Popover } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'

import Apis from '@/components/apis/Apis'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { PersistanceKeys } from '@/constants/Constants'
import { getReadableStatus } from '@/utilities/UserUtility'
import {
  getAgentImageWithMemoji,
  getAgentsListImage,
} from '@/utilities/agentUtilities'
import { GetFormattedDateString } from '@/utilities/utility'

function AdminActiveCalls({ selectedUser }) {
  const Limit = 30
  const [user, setUser] = useState(null)
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [hasMoreLeads, setHasMoreLeads] = useState(true)
  const [callsLoading, setCallsLoading] = useState(false)
  const [hasMoreCalls, setHasMoreCalls] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  //code for agent details
  const [callDetails, setCallDetails] = useState([])
  const [initialLoader, setInitialLoader] = useState(false)
  const [agentsList, setAgentsList] = useState([])
  const [filteredAgentsList, setFilteredAgentsList] = useState([])
  const [anchorEl, setAnchorEl] = React.useState(null)
  //code for call log details
  const [SelectedAgent, setSelectedAgent] = useState(null)
  const [SelectedItem, setSelectedItem] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [AgentCallLogLoader, setAgentCallLogLoader] = useState(false)
  const [sheduledCalllogs, setSheduledCalllogs] = useState([])
  const [filteredSheduledCalllogs, setFilteredSheduledCalllogs] = useState([])
  const [detailsFilterSearchValue, setDetailsFilterSearchValue] = useState('')
  //code for leeads details modal
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false)
  const [selectedLeadsList, setSelectedLeadsList] = useState([])
  const [filteredSelectedLeadsList, setFilteredSelectedLeadsList] = useState([])
  const [leadsSearchValue, setLeadsSearchValue] = useState('')
  //variable for warningpopup
  const [showConfirmationPopuup, setShowConfirmationPopup] = useState(null)
  const [color, setColor] = useState(false)

  //variable for showing modal
  const [extraTagsModal, setExtraTagsModal] = useState(false)
  const [otherTags, setOtherTags] = useState([])

  // Refs to prevent duplicate requests and track current offset (like AgencySubacount)
  const isLoadingMoreAgentsRef = useRef(false)
  const currentAgentsOffsetRef = useRef(0)
  const isLoadingMoreLeadsRef = useRef(false)
  const currentLeadsOffsetRef = useRef(0)
  const scrollHandlerAgentsRef = useRef(null)
  const scrollHandlerLeadsRef = useRef(null)

  useEffect(() => {
    getAgents(0)
    let localD = localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (localD) {
      let d = JSON.parse(localD)
      setUser(d)
    }
    // getSheduledCallLogs();
  }, [selectedUser])

  // Update refs when lists change
  useEffect(() => {
    currentAgentsOffsetRef.current = filteredAgentsList.length
  }, [filteredAgentsList.length])

  useEffect(() => {
    currentLeadsOffsetRef.current = filteredSelectedLeadsList.length
  }, [filteredSelectedLeadsList.length])

  // Scroll event listener for agents list lazy loading (same pattern as AgencySubacount)
  useEffect(() => {
    let scrollTimeout = null

    // Wait a bit for DOM to be ready
    const timer = setTimeout(() => {
      const scrollableDiv = document.getElementById('scrollableDiv1')
      if (!scrollableDiv) {
        return
      }

      // Remove old listener if exists
      if (scrollHandlerAgentsRef.current) {
        scrollableDiv.removeEventListener('scroll', scrollHandlerAgentsRef.current)
      }

      const handleScroll = () => {
        // Throttle scroll events
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }

        scrollTimeout = setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollableDiv
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight
          // Trigger load more when user is within 100px of bottom
          const threshold = 100
          
          if (
            distanceFromBottom < threshold &&
            hasMoreCalls &&
            !callsLoading &&
            !initialLoader &&
            !isLoadingMoreAgentsRef.current
          ) {
            // Use ref to get current offset synchronously
            const offsetToUse = currentAgentsOffsetRef.current
            getAgents(offsetToUse)
          }
        }, 150) // Throttle to 150ms to reduce rapid firing
      }

      scrollHandlerAgentsRef.current = handleScroll
      scrollableDiv.addEventListener('scroll', handleScroll, { passive: true })
    }, 100) // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      const scrollableDiv = document.getElementById('scrollableDiv1')
      if (scrollableDiv && scrollHandlerAgentsRef.current) {
        scrollableDiv.removeEventListener('scroll', scrollHandlerAgentsRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMoreCalls, callsLoading, initialLoader, filteredAgentsList.length])

  // Scroll event listener for leads list lazy loading (in modal)
  useEffect(() => {
    if (!showLeadDetailsModal) return // Only setup when modal is open

    let scrollTimeout = null

    // Wait a bit for DOM to be ready
    const timer = setTimeout(() => {
      const scrollableDiv = document.getElementById('scrollableDivLeads')
      if (!scrollableDiv) {
        return
      }

      // Remove old listener if exists
      if (scrollHandlerLeadsRef.current) {
        scrollableDiv.removeEventListener('scroll', scrollHandlerLeadsRef.current)
      }

      const handleScroll = () => {
        // Throttle scroll events
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }

        scrollTimeout = setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollableDiv
          const distanceFromBottom = scrollHeight - scrollTop - clientHeight
          // Trigger load more when user is within 100px of bottom
          const threshold = 100
          
          if (
            distanceFromBottom < threshold &&
            hasMoreLeads &&
            !leadsLoading &&
            !isLoadingMoreLeadsRef.current &&
            SelectedItem
          ) {
            // Use ref to get current offset synchronously
            const offsetToUse = currentLeadsOffsetRef.current
            fetchLeadsInBatch(SelectedItem, offsetToUse)
          }
        }, 150) // Throttle to 150ms to reduce rapid firing
      }

      scrollHandlerLeadsRef.current = handleScroll
      scrollableDiv.addEventListener('scroll', handleScroll, { passive: true })
    }, 100) // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      const scrollableDiv = document.getElementById('scrollableDivLeads')
      if (scrollableDiv && scrollHandlerLeadsRef.current) {
        scrollableDiv.removeEventListener('scroll', scrollHandlerLeadsRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMoreLeads, leadsLoading, showLeadDetailsModal, filteredSelectedLeadsList.length, SelectedItem])

  //code to show popover
  const handleShowPopup = (event, item, agent) => {
    setAnchorEl(event.currentTarget)
    // //console.log;
    // //console.log;
    setSelectedAgent(agent)
    setSelectedItem(item)
  }

  const handleClosePopup = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  //code for showing the selected agent leads
  const handleShowLeads = (agent, item) => {
    // //console.log;
    // //console.log;
    setSelectedAgent(agent)
    setSelectedItem(item)
    setSelectedLeadsList([])
    setFilteredSelectedLeadsList([])
    setShowLeadDetailsModal(true)
    fetchLeadsInBatch(item)
  }

  // Function to get call status with scheduled date if applicable
  function getCallStatusWithSchedule(item) {
    const currentTime = moment()
    const startTime = moment(item.startTime)

    // // Check if the call is scheduled in the future
    if (
      item.startTime &&
      startTime.isAfter(currentTime) &&
      item.status === 'Active'
    ) {
      // Format the date as "Scheduled - Sep 05" or similar
      const formattedDate = startTime.format('MMM DD')
      return `Scheduled`
    }

    // Return the regular readable status for past or current calls
    return getReadableStatus(item.status)
  }
  //code to filter slected agent leads
  const handleLeadsSearchChange = (value) => {
    if (value.trim() === '') {
      // Reset to original list when input is empty
      setFilteredSelectedLeadsList(selectedLeadsList)
      return
    }

    const filtered = selectedLeadsList.filter((item) => {
      const term = value.toLowerCase()
      return (
        // item.LeadModel?.firstName.toLowerCase().includes(term) ||
        // item.LeadModel?.lastName.toLowerCase().includes(term) ||
        // item.LeadModel?.address.toLowerCase().includes(term) ||
        // (item.LeadModel?.phone && agentsList.includes(term))
        (item.firstName.toLowerCase().includes(term))
      );
    })
    setFilteredSelectedLeadsList(filtered)
  }

  //code to get agents
  const getAgents = async (offset = 0) => {
    // Guard: Don't proceed if selectedUser is not available
    if (!selectedUser || !selectedUser.id) {
      console.warn('selectedUser is not available')
      setInitialLoader(false)
      setFilteredAgentsList([])
      setCallDetails([])
      setAgentsList([])
      return
    }

    // Prevent duplicate requests
    if (isLoadingMoreAgentsRef.current && offset !== 0) {
      return
    }

    // Set loading flag for pagination requests
    if (offset !== 0) {
      isLoadingMoreAgentsRef.current = true
      setCallsLoading(true)
    }

    try {
      if (offset === 0) {
        setInitialLoader(true)
      }

      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        AuthToken = Data.token
      }

      // //console.log;

      let mainAgent = null
      const localAgent = localStorage.getItem('agentDetails')
      if (localAgent) {
        const agentDetails = JSON.parse(localAgent)
        // //console.log;
        // //console.log;
        mainAgent = agentDetails
      }
      // const ApiPath = `${Apis.getSheduledCallLogs}?mainAgentId=${mainAgent.id}`;
      let ApiPath = `${Apis.getSheduledCallLogs}?userId=${selectedUser.id}&offset=${offset}&limit=${Limit}`

      // //console.log; //scheduled
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response && response.data) {
        if (response.data.status && response.data.data) {
          if (offset === 0) {
            setFilteredAgentsList(response.data.data)
            setCallDetails(response.data.data)
            setAgentsList(response.data.data)
          } else {
            setFilteredAgentsList((prev) => [...prev, ...response.data.data])
            setCallDetails((prev) => [...prev, ...response.data.data])
            setAgentsList((prev) => [...prev, ...response.data.data])
          }

          // Update hasMore based on response
          if (response.data.data.length < Limit) {
            setHasMoreCalls(false)
          } else {
            setHasMoreCalls(true)
          }
        } else {
          if (offset === 0) {
            setFilteredAgentsList([])
            setCallDetails([])
            setAgentsList([])
          }
          setHasMoreCalls(false)
        }
      }
    } catch (error) {
      console.error('Error occurred in get call activity api:', error)
      // Set empty arrays on error only for first load
      if (offset === 0) {
        setFilteredAgentsList([])
        setCallDetails([])
        setAgentsList([])
      }
      setHasMoreCalls(false)
    } finally {
      setInitialLoader(false)
      setCallsLoading(false)
      isLoadingMoreAgentsRef.current = false
    }
  }

  //code to show call log details popup

  const handleShowDetails = () => {
    fetchCallsInBatch(SelectedItem)
    // let updatedCallDetails = callDetails.map((item) => item.agentCalls);
    // let CallsArray = [];
    // let matchingPastCallsLeads = SelectedItem.leads.filter((lead) => {
    //   lead.id === SelectedItem.pastCalls.map((item) => item.leadId);
    //   return lead;
    // });

    // setSheduledCalllogs(SelectedItem.pastCalls);
    // setFilteredSheduledCalllogs(SelectedItem.pastCalls);
    // setShowDetailsModal(true);
  }

  //code to filter slected agent leads
  const handleDetailsSearchChange = (value) => {
    if (value.trim() === '') {
      //// //console.log;
      // Reset to original list when input is empty
      setFilteredSheduledCalllogs(sheduledCalllogs)
      return
    }

    const filtered = sheduledCalllogs.filter((item) => {
      const term = value.toLowerCase()
      return (
        // item.LeadModel?.firstName.toLowerCase().includes(term) ||
        // item.LeadModel?.lastName.toLowerCase().includes(term) ||
        // item.LeadModel?.address.toLowerCase().includes(term) ||
        // (item.LeadModel?.phone && agentsList.includes(term))
        (item.firstName.toLowerCase().includes(term))
      );
    })

    setFilteredSheduledCalllogs(filtered)
  }

  //main page search
  const handleSearchChange = (value) => {
    if (value.trim() === '') {
      //// //console.log;
      // Reset to original list when input is empty
      setFilteredAgentsList(agentsList)
      return
    }

    //// //console.log;

    const filtered = agentsList.filter((item) => {
      const term = value.toLowerCase()
      //// //console.log
      return (
        // item.LeadModel?.firstName.toLowerCase().includes(term) ||
        // item.LeadModel?.lastName.toLowerCase().includes(term) ||
        // item.LeadModel?.address.toLowerCase().includes(term) ||
        // (item.LeadModel?.phone && agentsList.includes(term))
        (item?.agents[0]?.name?.toLowerCase().includes(term))
      );
    })

    setFilteredAgentsList(filtered)
  }

  const [PauseLoader, setPauseLoader] = useState(false)

  // Helper function to truncate text
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '-'
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  //code to pause the agent
  const pauseAgents = async () => {
    // //console.log;

    try {
      setPauseLoader(true)
      const ApiPath = Apis.pauseAgent

      // //console.log;

      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        AuthToken = Data.token
      }

      // //console.log;
      const ApiData = {
        // mainAgentId: SelectedItem.id
        batchId: SelectedItem.id,
      }
      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setShowConfirmationPopup(null)
          let currentStatus = filteredAgentsList.map((item) => {
            if (item.id === SelectedItem.id) {
              // Update the status for the matching item
              return {
                ...item,
                status: 'Paused',
              }
            }
            // Return the item unchanged
            return item
          })
          // //console.log;

          setFilteredAgentsList(currentStatus)
          handleClosePopup()
        }
        // setFilteredAgentsList(response.data.data);
        // setAgentsList(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in get Agents api is :", error);
    } finally {
      setPauseLoader(false)
    }
  }

  //function to resume calls
  const resumeCalls = async () => {
    // //console.log;
    // //console.log
    // return
    try {
      setPauseLoader(true)
      const ApiPath = Apis.resumeCalls

      // //console.log;

      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        AuthToken = Data.token
      }

      // //console.log;
      const ApiData = {
        // mainAgentId: SelectedItem.id
        batchId: SelectedItem.id,
      }
      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setShowConfirmationPopup(null)
          let currentStatus = filteredAgentsList.map((item) => {
            if (item.id === SelectedItem.id) {
              // Update the status for the matching item
              return {
                ...item,
                status: 'Active',
              }
            }
            // Return the item unchanged
            return item
          })
          // //console.log;

          setFilteredAgentsList(currentStatus)
          handleClosePopup()
        }
        // setFilteredAgentsList(response.data.data);
        // setAgentsList(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in get Agents api is :", error);
    } finally {
      setPauseLoader(false)
    }
  }

  const fetchLeadsInBatch = async (batch, offset = null) => {
    // Prevent duplicate requests
    if (isLoadingMoreLeadsRef.current && offset !== null && offset !== 0) {
      return
    }

    // Set loading flag for pagination requests
    if (offset !== null && offset !== 0) {
      isLoadingMoreLeadsRef.current = true
    }

    // Use current offset from ref if not provided
    if (offset === null) {
      offset = currentLeadsOffsetRef.current
    }

    //console.log;
    try {
      let firstApiCall = false
      setLeadsLoading(true)
      let leadsInBatchLocalData = localStorage.getItem(
        PersistanceKeys.LeadsInBatch + `${batch.id}`,
      )
      if (selectedLeadsList.length == 0 && offset === 0) {
        firstApiCall = true
        if (leadsInBatchLocalData) {
          //console.log;
          let leads = JSON.parse(leadsInBatchLocalData)
          //console.log;
          // setSelectedLeadsList(leads);
          // setFilteredSelectedLeadsList(leads);
          setLeadsLoading(false)
          // return;
        } else {
          //console.log;
        }
      } else {
        //console.log;
      }

      const token = user.token // Extract JWT token
      let path =
        Apis.getLeadsInBatch +
        `?batchId=${batch.id}&offset=${offset}&userId=${selectedUser.id}&limit=${Limit}`
      const response = await fetch(path, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      setLeadsLoading(false)
      const data = await response.json()

      if (response.ok) {
        if (firstApiCall) {
          setSelectedLeadsList(data.data)
          setFilteredSelectedLeadsList(data.data)
          localStorage.setItem(
            PersistanceKeys.LeadsInBatch + `${batch.id}`,
            JSON.stringify(data.data),
          )
        } else {
          setSelectedLeadsList((prev) => [...prev, ...data.data])
          setFilteredSelectedLeadsList((prev) => [...prev, ...data.data])
        }

        // setShowDetailsModal(true);

        if (data.data.length < Limit) {
          setHasMoreLeads(false)
        } else {
          setHasMoreLeads(true)
        }
        // setStats(data.stats.data);
      } else {
        console.error('Failed to fetch leads in batch:', data)
        setHasMoreLeads(false)
      }
    } catch (error) {
      console.error('Error fetching leads in batch:', error)
      setHasMoreLeads(false)
    } finally {
      isLoadingMoreLeadsRef.current = false
    }
  }

  const fetchCallsInBatch = async (batch, offset = null) => {
    // Use current offset from ref if not provided
    if (offset === null) {
      offset = sheduledCalllogs.length
    }

    //console.log;
    try {
      let firstCall = false
      setCallsLoading(true)
      if (sheduledCalllogs.length == 0 && offset === 0) {
        firstCall = true
        // let leadsInBatchLocalData = localStorage.getItem(
        //   PersistanceKeys.CallsInBatch + `${batch.id}`
        // );
        // if (leadsInBatchLocalData) {
        //   // //console.log;
        //   let calls = JSON.parse(leadsInBatchLocalData);
        //   //console.log;
        //   setSheduledCalllogs(calls);
        //   setFilteredSheduledCalllogs(calls);
        //   setShowDetailsModal(true);
        //   setCallsLoading(false);
        //   // return;
        // } else {
        //   //console.log;
        // }
      }

      const token = user.token // Extract JWT token
      //console.log;
      const response = await fetch(
        '/api/calls/callsInABatch' +
          `?batchId=${batch.id}&offset=${offset}&limit=${Limit}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      //console.log;
      setCallsLoading(false)
      const data = await response.json()

      if (response.ok) {
        //console.log;
        if (firstCall) {
          setSheduledCalllogs(data.data.pastCalls)
          setFilteredSheduledCalllogs(data.data.pastCalls)
          localStorage.setItem(
            PersistanceKeys.CallsInBatch + `${batch.id}`,
            JSON.stringify(data.data.pastCalls),
          )
        } else {
          setSheduledCalllogs((prev) => [...prev, ...data.data.pastCalls])
          setFilteredSheduledCalllogs((prev) => [
            ...prev,
            ...data.data.pastCalls,
          ])
        }

        // setShowDetailsModal(true);

        if (data.data.pastCalls.length < Limit) {
          setHasMoreCalls(false)
        } else {
          setHasMoreCalls(true)
        }
        // setStats(data.stats.data);
      } else {
        console.error('Failed to fetch leads in batch:', data.message)
        setHasMoreCalls(false)
      }
    } catch (error) {
      console.error('Error fetching leads in batch:', error)
      setHasMoreCalls(false)
    }
  }

  function GetLoadingOrNoCallsView() {
    if (callsLoading) {
      return <div className="text-center mt-6 text-3xl">Loading...</div>
    } else if (!callsLoading && sheduledCalllogs.length == 0) {
      return <div className="text-center mt-6 text-3xl">No Call Found</div>
    }
  }

  function formatName(name) {
    if (typeof name !== 'string' || name.length === 0) return '-'
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  function getAgentNameForActiviti(agent) {
    // console.log("agents in getAgentNameForActiviti", agent)
    const agents = agent?.agents || []

    if (agents?.length > 0) {
      let name = agents[0]?.name || '-'

      if (agents[0].agentType === 'outbound') {
        return formatName(name)
      } else if (agents[1].agentType == 'outbound') {
        return formatName(agents[1]?.name)
      } else return formatName(name)
    }
    return '-'
  }

  return (
    <div className="w-full h-full items-start overflow-hidden">
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopup}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
        }}
        PaperProps={{
          elevation: 0, // This will remove the shadow
          style: {
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
            borderRadius: '10px',
            width: '120px',
          },
        }}
      >
        <div
          className="p-2 flex flex-col gap-2"
          style={{ fontWeight: '500', fontSize: 15 }}
        >
          <div>
            {PauseLoader ? (
              <CircularProgress size={18} sx={{ color: 'hsl(var(--brand-primary))' }} />
            ) : (
              <button
                className="text-start outline-none"
                onClick={() => {
                  if (SelectedItem?.status == 'Paused') {
                    //// //console.log
                    setColor(true)
                    setShowConfirmationPopup('resume Calls')
                  } else {
                    //// //console.log
                    setShowConfirmationPopup('pause Calls')
                    setColor(false)
                  }
                  // //console.log
                }}
              >
                {SelectedItem?.status == 'Paused' ? 'Run Calls' : 'Pause Calls'}
              </button>
            )}
          </div>

          <button
            className="text-start outline-none"
            onClick={() => {
              handleShowLeads(SelectedAgent, SelectedItem)
            }}
          >
            View Details
          </button>
          {/* <div className="text-red">Delete</div> */}
        </div>
      </Popover>
      {/* Confirmation popup */}
      {showConfirmationPopuup && (
        <ShowConfirmationPopup
          showConfirmationPopuup={showConfirmationPopuup}
          setShowConfirmationPopup={setShowConfirmationPopup}
          pauseAgent={pauseAgents}
          color={color}
          PauseLoader={PauseLoader}
          resumeCalls={resumeCalls}
        />
      )}
      <div>
        {initialLoader ? (
          <div className="flex flex-row items-center h-[65vh] justify-center mt-12">
            <CircularProgress size={35} sx={{ color: 'hsl(var(--brand-primary))' }} />
          </div>
        ) : (
          <div
            className={`h-[80vh] overflow-auto`}
            style={{ scrollbarWidth: 'none' }}
            id="scrollableDiv1"
          >
            {filteredAgentsList?.length > 0 ? (
                <div className="min-w-[50vw] overflow-x-auto scrollbar-none">
                  {/* Table Header */}
                  <div className="w-full flex flex-row items-center mt-2 px-10 gap-4">
                    <div className="min-w-[150px] flex-shrink-0">
                      <div style={styles.text}>Agent</div>
                    </div>

                    <div className="min-w-[200px] flex-shrink-0">
                      <div style={styles.text}>List Name</div>
                    </div>

                    <div className="min-w-[150px] flex-shrink-0 text-center">
                      <div style={styles.text}>Leads</div>
                    </div>

                    <div className="min-w-[200px] flex-shrink-0">
                      <div style={styles.text}>Date created</div>
                    </div>
                    <div className="min-w-[200px] flex-shrink-0">
                      <div style={styles.text}>Call Status</div>
                    </div>
                    <div className="min-w-[150px] flex-shrink-0 sticky right-0 bg-white z-10 pl-10">
                      <div style={styles.text}>Action</div>
                    </div>
                  </div>

                  {/* Table Data */}
                  {filteredAgentsList?.map((item, index) => {
                    return (
                      <div key={index}>
                        {item.agents?.map((agent, index) => {
                          return (
                            <div key={index}>
                              <div
                                className="w-full flex flex-row items-center mt-5 px-10 hover:bg-[hsl(var(--brand-primary) / 0.05)] py-2 gap-4"
                                key={index}
                              >
                                <div className="min-w-[150px] flex-shrink-0">
                                  <div
                                    style={styles.text2}
                                    className="truncate"
                                    title={
                                      agent?.agents[0].agentType === 'outbound'
                                        ? agent?.agents[0]?.name
                                        : agent?.agents[1]?.name
                                    }
                                  >
                                    {truncateText(
                                      agent?.agents[0].agentType === 'outbound'
                                        ? agent?.agents[0]?.name
                                        : agent?.agents[1]?.name,
                                      10,
                                    )}
                                  </div>
                                </div>

                                <div className="min-w-[200px] flex-shrink-0">
                                  <div
                                    style={styles.text2}
                                    className="truncate"
                                    title={item.Sheet?.sheetName}
                                  >
                                    {truncateText(item.Sheet?.sheetName, 15)}
                                  </div>
                                </div>

                                <div className="min-w-[150px] flex-shrink-0 text-center">
                                  <button
                                    style={styles.text2}
                                    className="text-brand-primary underline outline-none"
                                    onClick={() => {
                                      handleShowLeads(agent, item)
                                    }}
                                  >
                                    {item?.totalLeads}
                                  </button>
                                </div>

                                <div className="min-w-[200px] flex-shrink-0">
                                  {item?.createdAt ? (
                                    <div
                                      style={styles.text2}
                                      className="truncate"
                                    >
                                      {GetFormattedDateString(item?.createdAt)}
                                    </div>
                                  ) : (
                                    <div style={styles.text2}>-</div>
                                  )}
                                </div>
                                <div className="min-w-[200px] flex-shrink-0">
                                  <div style={styles.text2}>
                                    {getCallStatusWithSchedule(item)}
                                  </div>
                                </div>
                                <div className="min-w-[150px] flex-shrink-0 sticky right-0 bg-white z-10 pl-10">
                                  <button
                                    aria-describedby={id}
                                    variant="contained"
                                    onClick={(event) => {
                                      handleShowPopup(event, item, agent)
                                    }}
                                  >
                                    <Image
                                      src={'/otherAssets/threeDotsIcon.png'}
                                      height={24}
                                      width={24}
                                      alt="icon"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div
                  style={{
                    fontWeight: '600',
                    fontSize: 24,
                    textAlign: 'center',
                    marginTop: 20,
                  }}
                >
                  No Activity Found
                </div>
              )}
            {callsLoading && hasMoreCalls && (
              <div className="w-full flex flex-row justify-center mt-8">
                <CircularProgress size={35} sx={{ color: 'hsl(var(--brand-primary))' }} />
              </div>
            )}
            {!hasMoreCalls && filteredAgentsList.length > 0 && (
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
            )}
          </div>
        )}
      </div>
      {/* Leads list modal goes here */}
      <Modal
        open={showLeadDetailsModal}
        onClose={() => setShowLeadDetailsModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="sm:w-10/12 lg:w-10/12 xl:w-8/12 w-11/12"
          sx={{ ...styles.modalsStyle, scrollbarWidth: 'none' }}
        >
          <div className="flex flex-row justify-center w-full h-[80vh]">
            <div
              className="sm:w-10/12 w-full h-[100%] overflow-none"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="flex flex-row items-center justify-between">
                <div
                  style={{
                    fontWeight: '500',
                    fontSize: 17,
                  }}
                >
                  {SelectedAgent?.name.slice(0, 1).toUpperCase() +
                    SelectedAgent?.name.slice(1)}{' '}
                  call activity
                </div>
                <button
                  onClick={() => {
                    setShowLeadDetailsModal(false)
                  }}
                >
                  <Image
                    src={'/assets/crossIcon.png'}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <div
                className="max-h-[92%] overflow-auto"
                style={{
                  scrollbarWidth: 'none',
                }}
              >
                {AgentCallLogLoader ? (
                  <div className="flex flex-row items-center justify-center h-full">
                    <CircularProgress size={35} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                ) : (
                  <div>
                    <div className="flex w-full items-center border border-gray-300 rounded-full px-4 max-w-md shadow-sm mt-6">
                      <input
                        type="text"
                        placeholder="Search by name or phone"
                        className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0 rounded-full"
                        value={leadsSearchValue}
                        onChange={(e) => {
                          const value = e.target.value
                          handleLeadsSearchChange(value)
                          setLeadsSearchValue(e.target.value)
                        }}
                      />
                      <img
                        src={'/otherAssets/searchIcon.png'}
                        alt="Search"
                        width={20}
                        height={20}
                      />
                    </div>

                    <div
                      className="flex flex-row items-center mt-6"
                      style={{
                        fontSize: 15,
                        fontWeight: '500',
                        color: '#00000070',
                      }}
                    >
                      <div className="w-2/12">Name</div>
                      <div className="w-2/12">Phone Number</div>
                      <div className="w-2/12">Address</div>
                      <div className="w-2/12">List Name</div>
                      <div className="w-2/12">Tag</div>
                      <div className="w-2/12">Stage</div>
                    </div>

                    <div
                      className="h-[70svh] overflow-auto pb-[100px] mt-6"
                      id="scrollableDivLeads"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {filteredSelectedLeadsList.length > 0 ? (
                        <div className="w-full">
                            {filteredSelectedLeadsList.map((item, index) => (
                              <div
                                key={index}
                                className="w-full mt-4"
                                style={{
                                  fontSize: 15,
                                  fontWeight: 500,
                                  scrollbarWidth: 'none',
                                }}
                              >
                                <div
                                  className="flex flex-row items-center mt-4"
                                  style={{ fontSize: 15, fontWeight: 500 }}
                                >
                                  <div className="w-2/12 flex flex-row items-center gap-2 truncate">
                                    <div className="h-[40px] w-[40px] rounded-full bg-black flex items-center justify-center text-white flex-shrink-0">
                                      {item?.firstName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="truncate w-[100px]">
                                        {item?.firstName} {item?.lastName}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-2/12 truncate">
                                    {item?.phone || '-'}
                                  </div>
                                  <div className="w-2/12 truncate">
                                    {item?.address || '-'}
                                  </div>
                                  <div className="w-2/12 truncate">
                                    {SelectedItem?.Sheet?.sheetName || '-'}
                                  </div>
                                  <div className="w-2/12">
                                    {item.tags.length > 0 ? (
                                      <div className="w-full truncate flex flex-row items-center gap-1">
                                        {item.tags
                                          .slice(0, 1)
                                          .map((tag, index) => (
                                            <div
                                              key={index}
                                              className="flex flex-row items-center gap-2 bg-brand-primary10 px-2 py-1 rounded-lg text-brand-primary"
                                            >
                                              {tag}
                                            </div>
                                          ))}
                                        {item.tags.length > 1 && (
                                          <div
                                            className="text-brand-primary underline cursor-pointer"
                                            onClick={() => {
                                              setExtraTagsModal(true)
                                              setOtherTags(item.tags)
                                            }}
                                          >
                                            +{item.tags.length - 1}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      '-'
                                    )}
                                  </div>
                                  <div className="w-2/12 truncate">
                                    {/*item?.stage || "-"*/}
                                    {item?.stage?.stageTitle || '-'}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : !leadsLoading ? (
                        <div className="text-center mt-6 text-3xl">
                          No Call Found
                        </div>
                      ) : (
                        <div className="text-center mt-6 text-3xl">
                          Loading...
                        </div>
                      )}
                      {leadsLoading && hasMoreLeads && (
                        <div className="w-full flex flex-row justify-center mt-8">
                          <CircularProgress
                            size={35}
                            sx={{ color: 'hsl(var(--brand-primary))' }}
                          />
                        </div>
                      )}
                      {!hasMoreLeads && filteredSelectedLeadsList.length > 0 && (
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
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
      {/* Modal for All Tags */}
      <Modal
        open={extraTagsModal}
        onClose={() => setExtraTagsModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-3/12 sm:w-full w-4/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <div className="w-full flex items-center justify-between">
                <div
                  style={{
                    fontsize: 15,
                    fontWeight: '600',
                  }}
                >
                  Other Tags
                </div>
                <div>
                  <CloseBtn
                    onClick={() => {
                      setExtraTagsModal(false)
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-row items-center gap-4 flex-wrap mt-2">
                {otherTags?.map((tag, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center gap-2"
                    >
                      <div className="flex flex-row items-center gap-2 bg-brand-primary10 px-2 py-1 rounded-lg">
                        <div
                          className="text-brand-primary" //1C55FF10
                        >
                          {tag}
                        </div>
                        {/* {DelTagLoader &&
                          tag.includes(DelTagLoader) ? (
                          <div>
                            <CircularProgress size={15} />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              handleDelTag(tag);
                            }}
                          >
                            <X
                              size={15}
                              weight="bold"
                              color="hsl(var(--brand-primary))"
                            />
                          </button>
                        )} */}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default AdminActiveCalls
const styles = {
  text: {
    fontSize: 15,
    color: '#00000090',
    fontWeight: '500',
  },
  text2: {
    textAlignLast: 'left',
    fontSize: 15,
    // color: '#000000',
    fontWeight: '500',
    whiteSpace: 'nowrap', // Prevent text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Add ellipsis for overflow text
  },
  modalsStyle: {
    // height: "auto",
    // height: "90svh",
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

export const ShowConfirmationPopup = ({
  showConfirmationPopuup,
  setShowConfirmationPopup,
  PauseLoader,
  pauseAgent,
  resumeCalls,
  color,
}) => {
  return (
    <div>
      <Modal
        open={showConfirmationPopuup} //showConfirmationPopuup
        onClose={() => {
          setShowConfirmationPopup(null)
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
          className="w-10/12 sm:w-7/12 md:w-5/12 lg:w-4/12 p-8 rounded-[15px]"
          sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
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

              <div className="flex flex-row items-center justify-center gap-2 -mt-1">
                <Image
                  src={'/assets/warningFill.png'}
                  height={18}
                  width={18}
                  alt="*"
                />
                <p
                  className="text-black"
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Are you sure you want to {showConfirmationPopuup}
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-4 mt-6">
              <button
                className="w-4/12"
                onClick={() => {
                  setShowConfirmationPopup(null)
                }}
              >
                Cancel
              </button>
              <div className="w-8/12">
                {PauseLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className={`outline-none ${color ? 'bg-brand-primary' : 'bg-red'}`}
                    style={{
                      color: 'white',
                      height: '50px',
                      borderRadius: '10px',
                      width: '100%',
                      fontWeight: 600,
                      fontSize: '20',
                    }}
                    onClick={() => {
                      if (color === true) {
                        resumeCalls()
                      } else {
                        pauseAgent()
                      }
                    }}
                  >
                    Yes! {showConfirmationPopuup[0].toUpperCase()}
                    {showConfirmationPopuup.slice(1)}
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}
