import { Box, CircularProgress, Modal, Popover, Tooltip } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {
  CaretDown,
  CaretUp,
  EnvelopeSimple,
  Plus,
  X,
} from '@phosphor-icons/react'
import {
  Phone,
  Mail,
  MapPin,
  Tag,
  Workflow,
  Calendar,
  Copy,
  FileText,
  Smile,
  Frown,
  Meh,
  Flame,
  Sun,
  Snowflake,
  ListChecks,
} from 'lucide-react'
import axios from 'axios'
import parsePhoneNumberFromString from 'libphonenumber-js'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

/** Modal content transition: scale 0.95→1 and opacity 0→1 on enter; reverse on exit. */
function ScaleFadeTransition({ in: inProp, children, onEnter, onExited, timeout = 250 }) {
  const [stage, setStage] = useState(inProp ? 'entering' : 'exited')
  const rafRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (inProp) {
      if (stage !== 'entered') {
        setStage('entering')
        onEnter?.()
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = requestAnimationFrame(() => setStage('entered'))
        })
      }
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    } else {
      if (stage === 'exited') return
      setStage('exiting')
      timerRef.current = setTimeout(() => {
        onExited?.()
        setStage('exited')
      }, timeout)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [inProp, timeout, onExited, onEnter])

  const isEntering = stage === 'entering'
  const style = {
    opacity: isEntering || stage === 'exiting' ? 0 : 1,
    transform: isEntering || stage === 'exiting' ? 'scale(0.95)' : 'scale(1)',
    transition: `opacity ${timeout}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${timeout}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
  }

  return <div style={style}>{children}</div>
}

import Apis from '@/components/apis/Apis'
import { TranscriptViewer } from '@/components/calls/TranscriptViewer'
import { GetFormattedDateString } from '@/utilities/utility'
import { getBrandPrimaryHex } from '@/utilities/colorUtils'
import { AssignTeamMember } from '@/components/onboarding/services/apisServices/ApiService'
import LeadTeamsAssignedList from '@/components/dashboard/leads/LeadTeamsAssignedList'
import { callStatusColors } from '@/constants/Constants'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'
import { getAgentsListImage } from '@/utilities/agentUtilities'
import LeadDetails from '@/components/dashboard/leads/extras/LeadDetails'
import CloseBtn from '@/components/globalExtras/CloseBtn'

const styles = {
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
  subHeading: {
    fontsize: 12,
    fontWeight: '500',
    color: '#151515',
  },
}

const TYPE_LABELS = {
  calls: 'Calls',
  convos: 'Convos',
  hotleads: 'Hot Leads',
  booked: 'Booked Meetings',
}

const AGENT_STATS_EMPTY = {
  calls: 'No calls found.',
  convos: 'No convos found.',
  hotleads: 'No hot leads found.',
  booked: 'No booked meetings found.',
}

function ImportantCallsModal({ open, close, onClose, agentId, type, agentName }) {
  const handleClose = onClose || close
  const isAgentStatsMode = Boolean(agentId && type)

  const [importantCalls, setImportantCalls] = useState([])
  const [selectedCall, setSelectedCall] = useState('')
  const [initialLoader, setInitialLoader] = useState(false)

  // Agent stats by type (Calls / Convos / Booked / Hot Leads)
  const [agentStatsCalls, setAgentStatsCalls] = useState([])
  const [agentStatsTotal, setAgentStatsTotal] = useState(0)
  const [agentStatsOffset, setAgentStatsOffset] = useState(0)
  const [agentStatsLoading, setAgentStatsLoading] = useState(false)
  const agentStatsLimit = 20
  const agentStatsHasMore = agentStatsCalls.length < agentStatsTotal
  const listScrollContainerRef = useRef(null)
  const loadMoreSentinelRef = useRef(null)
  const agentStatsHasMoreRef = useRef(agentStatsHasMore)
  const agentStatsLoadingRef = useRef(agentStatsLoading)
  agentStatsHasMoreRef.current = agentStatsHasMore
  agentStatsLoadingRef.current = agentStatsLoading

  const [isExpandedActivity, setIsExpandedActivity] = useState([])
  const [isExpanded, setIsExpanded] = useState(null)

  const [showAudioPlay, setShowAudioPlay] = useState(null)
  const [showNoAudioPlay, setShowNoAudioPlay] = useState(false)

  const [primaryColor, setPrimaryColor] = useState('#7902DF')

  // LeadDetails modal state
  const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false)

  // Team assignment states
  const [myTeam, setMyTeam] = useState([])
  const [myTeamAdmin, setMyTeamAdmin] = useState(null)
  const [getTeamLoader, setGetTeamLoader] = useState(false)
  const [globalLoader, setGlobalLoader] = useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null)
  useEffect(() => {
    const updateBrandColor = () => {
      setPrimaryColor(getBrandPrimaryHex())
    }

    // Set initial color
    updateBrandColor()

    // Listen for branding updates
    window.addEventListener('agencyBrandingUpdated', updateBrandColor)

    return () => {
      window.removeEventListener('agencyBrandingUpdated', updateBrandColor)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    getMyteam()
    if (isAgentStatsMode) {
      setAgentStatsCalls([])
      setAgentStatsTotal(0)
      setAgentStatsOffset(0)
      fetchAgentCallsByType(true)
      console.log("agent stats calls", agentStatsCalls)
    } else {
      console.log("important calls")
      getImportantCalls()
    }
  }, [open, agentId, type])

  useEffect(() => {
    if (!open || !agentStatsHasMore || agentStatsCalls.length === 0) return
    const listContainer = listScrollContainerRef.current
    const sentinel = loadMoreSentinelRef.current
    if (!listContainer || !sentinel) return
    const loadMore = () => {
      if (!agentStatsLoadingRef.current && agentStatsHasMoreRef.current) fetchAgentCallsByType(false)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root: listContainer, rootMargin: '100px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, agentStatsHasMore, agentStatsCalls.length])

  const fetchAgentCallsByType = async (reset = false) => {
    if (!agentId || !type) return
    const data = localStorage.getItem('User')
    if (!data) return
    try {
      setAgentStatsLoading(true)
      const u = JSON.parse(data)
      const currentOffset = reset ? 0 : agentStatsOffset
      const url = `${Apis.getAgentCallsByTypeApi}?agentId=${agentId}&type=${type}&offset=${currentOffset}&limit=${agentStatsLimit}`
      const response = await axios.get(url, {
        headers: { Authorization: 'Bearer ' + u.token },
      })
      if (response.data?.status === true && response.data?.data) {
        const newCalls = response.data.data.calls || []
        const newTotal = response.data.data.total ?? 0
        console.log("agent new calls from api", newCalls)
        if (reset) {
          setAgentStatsCalls(newCalls)
          setAgentStatsOffset(agentStatsLimit)
          setSelectedCall(newCalls[0]?.LeadModel ?? null)
        } else {
          setAgentStatsCalls((prev) => [...prev, ...newCalls])
          setAgentStatsOffset((prev) => prev + agentStatsLimit)
        }
        setAgentStatsTotal(newTotal)
      } else {
        if (reset) {
          setAgentStatsCalls([])
          setAgentStatsTotal(0)
          setSelectedCall(null)
        }
      }
    } catch (err) {
      if (reset) {
        setAgentStatsCalls([])
        setAgentStatsTotal(0)
        setSelectedCall(null)
      }
    } finally {
      setAgentStatsLoading(false)
    }
  }

  //code for getting teammebers
  const getMyteam = async () => {
    try {
      setGetTeamLoader(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)
        let path = Apis.getTeam

        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setGetTeamLoader(false)

          if (response.data.status === true) {
            setMyTeam(response.data.data)
            setMyTeamAdmin(response.data.admin)
          }
        }
      }
    } catch (e) {
      setGetTeamLoader(false)
    }
  }

  //code for popover
  const handleShowPopup = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClosePopup = () => {
    setAnchorEl(null)
  }

  const popoverOpen = Boolean(anchorEl)
  const id = popoverOpen ? 'simple-popover' : undefined

  //function to assign lead to the team
  const handleAssignLeadToTeammember = async (item) => {
    try {
      handleClosePopup()
      setGlobalLoader(true)
      let ApiData = null
      if (item.invitedUserId) {
        ApiData = {
          leadId: selectedCall.id,
          teamMemberUserId: item.invitedUserId,
        }
      } else if (item.invitedUser?.id) {
        ApiData = {
          leadId: selectedCall.id,
          teamMemberUserId: item.invitedUser.id,
        }
      } else {
        ApiData = {
          leadId: selectedCall.id,
          teamMemberUserId: item.id,
        }
      }
      let response = await AssignTeamMember(ApiData)
      if (response && response.data && response.data.status === true) {
        // Update the state directly to show the assigned team member
        setSelectedCall((prevData) => {
          // Filter duplicates before adding
          const existingIds = (prevData.teamsAssigned || []).map(u => u.id || u.invitedUserId)
          const itemId = item.id || item.invitedUserId || item.invitedUser?.id

          // Only add if not already assigned
          if (!existingIds.includes(itemId)) {
            return {
              ...prevData,
              teamsAssigned: [...(prevData.teamsAssigned || []), item],
            }
          }
          return prevData
        })
        // Also update the important calls list to keep it in sync
        const leadIdToUpdate = ApiData.leadId
        setImportantCalls((prevCalls) => {
          return prevCalls.map((call) => {
            if (call.id === leadIdToUpdate) {
              // Filter duplicates before adding
              const existingIds = (call.teamsAssigned || []).map(u => u.id || u.invitedUserId)
              const itemId = item.id || item.invitedUserId || item.invitedUser?.id

              // Only add if not already assigned
              if (!existingIds.includes(itemId)) {
                return {
                  ...call,
                  teamsAssigned: [...(call.teamsAssigned || []), item],
                }
              }
            }
            return call
          })
        })
      } else if (response && response.data && response.data.status === false) {
        // Show error message if assignment failed (e.g., duplicate)
        console.error('Failed to assign team member:', response.data.message)
      }
    } catch (error) {
      console.error('Error assigning team member:', error)
    } finally {
      setGlobalLoader(false)
      handleClosePopup()
    }
  }

  const getImportantCalls = async () => {
    try {
      setInitialLoader(true)
      const data = localStorage.getItem('User')
      if (data) {
        const u = JSON.parse(data)
        let path = Apis.getImportantCalls
        // //console.log;
        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          if (response.data.status === true) {
            setImportantCalls(response.data.data)
            setSelectedCall(response.data.data[0])
          } else {
            // console.log(
            // "message of get important calls api is",
            //   response.data.message
            // );
          }
        }
      }
    } catch (e) {
      // //console.log;
    } finally {
      setInitialLoader(false)
    }
  }

  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith('+') ? rawNumber : `+${rawNumber}`,
    )
    //// //console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : 'Invalid phone number'
  }
  const handleShowMoreActivityData = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpandedActivity((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id]
      }
    })
  }
  const handleReadMoreToggle = (item) => {
    setIsExpanded(item)
  }

  const handleTagDeleted = (deletedTag, leadId) => {
    // Update the selected call's tags
    setSelectedCall((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        tags: prev.tags ? prev.tags.filter(tag => tag !== deletedTag) : []
      }
    })

    // Also update in the importantCalls list
    setImportantCalls((prevCalls) =>
      prevCalls.map((call) => {
        if (call.id === (leadId || selectedCall?.id)) {
          return {
            ...call,
            tags: call.tags ? call.tags.filter(tag => tag !== deletedTag) : []
          }
        }
        return call
      })
    )
  }


  return (
    <div className="w-full">
      <Modal
        open={open}
        onClose={() => {
          handleClose()
        }}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: {
            backgroundColor: '#00000099',
          },
        }}
      >
        <ScaleFadeTransition in={open} timeout={250}>
          <Box
            className="xl:w-10/12 w-full" sx={styles.modalsStyle}
          >
            <div className="flex flex-row justify-center w-full h-[90vh] min-h-full animate-in slide-in-from-bottom-2 duration-200 ease-out">
              <div
                className="sm:w-full w-full p-[2px] min-h-full sm:max-w-[90%] lg:max-w-[80%] xl:max-w-[70%] overflow-hidden"
                style={{
                  backgroundColor: '#ffffff',

                  borderRadius: '13px',
                }}
              >
                <div className="w-full flex flex-row items-center justify-between p-4 border-b border-[#eaeaea]">
                  <div style={{ fontSize: 22, fontWeight: '600', color: '#000' }}>
                    {isAgentStatsMode
                      ? `${TYPE_LABELS[type] || type} – ${agentName || ''}`
                      : 'Recommend Calls'}
                  </div>

                  <CloseBtn onClick={handleClose} />
                </div>

                <div
                  className="h-[100%] pb-12"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {isAgentStatsMode ? (
                    agentStatsLoading && agentStatsCalls.length === 0 ? (
                      <div className="w-full flex flex-row items-center justify-center mt-12">
                        <CircularProgress size={35} thickness={2} />
                      </div>
                    ) : agentStatsCalls.length === 0 ? (
                      <div
                        style={{
                          fontsize: 24,
                          fontWeight: '600',
                          textAlign: 'center',
                          marginTop: 20,
                        }}
                      >
                        {AGENT_STATS_EMPTY[type] || 'No data found.'}
                      </div>
                    ) : (
                      <div className="w-full flex flex-row items-start justify-between h-[100%] min-h-full">
                        <div
                          ref={listScrollContainerRef}
                          // className="w-4/12 px-3 flex flex-col overflow-auto h-[100%]"
                          className="w-4/12 min-w-[300px] px-3 flex flex-col overflow-auto h-[100%] border-r border-[#eaeaea]"
                          style={{ scrollbarWidth: 'none' }}
                        >
                          {agentStatsCalls.map((call, index) => {
                            const lead = call.LeadModel
                            const leadName = lead
                              ? [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.email || 'Unknown'
                              : 'Unknown'
                            const durationStr =
                              call.duration != null
                                ? moment.utc(call.duration * 1000).format('mm:ss')
                                : '-'
                            const dateStr = call.createdAt
                              ? moment(call.createdAt).format('MMM D, YYYY h:mm A')
                              : '-'
                            const isSelected = selectedCall?.id === lead?.id
                            return (
                              <button
                                key={call.id}
                                onClick={() => setSelectedCall(lead || null)}
                                className="w-full p-3 flex flex-col gap-2 border rounded-lg mt-5 text-left"
                                style={{
                                  borderWidth: 1,
                                  borderColor: isSelected ? primaryColor : '#eaeaea',
                                }}
                              >
                                <div className="w-full flex flex-row justify-between items-center">
                                  <div className="flex flex-col gap-2 items-start w-full">
                                    <div className="flex flex-row gap-2 items-center">
                                      <div
                                        className="h-[32px] w-[32px] items-center justify-center text-center pt-[2px] rounded-full bg-black text-white flex flex-shrink-0"
                                        style={{ fontSize: 15, fontWeight: '500' }}
                                      >
                                        {(lead?.firstName || '?')[0]}
                                      </div>
                                      <div style={{ fontSize: 14, fontWeight: '500', color: 'rgba(0,0,0,0.8)' }}>
                                        {lead?.firstName || 'Unknown'}
                                      </div>
                                    </div>
                                    <div
                                      className="min-w-0 flex-1"
                                      style={{
                                        fontSize: 14,
                                        fontWeight: '500',
                                        color: 'rgba(0,0,0,0.8)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        maxWidth: 200,
                                      }}
                                    >
                                      {(lead?.email || '').slice(0, 24)}
                                      {(lead?.email || '').length > 24 ? '...' : ''}
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2 items-end">
                                    <div style={{ fontSize: 13, fontWeight: '600', color: primaryColor }}>
                                      {call.agent?.name || '-'}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: '600',
                                        color: "black", //primaryColor
                                        textTransform: 'capitalize',
                                      }}>{call.stage?.stageTitle || '-'}</div>
                                  </div>
                                </div>
                                <div className="text-[14px]" style={{ color: 'rgba(0,0,0,0.8)' }}>
                                  {dateStr} · {durationStr}
                                </div>
                              </button>
                            )
                          })}
                          {agentStatsHasMore && (
                            <div className="pt-2 pb-2">
                              <div ref={loadMoreSentinelRef} className="h-4 w-full min-h-[16px]" aria-hidden />
                              {agentStatsLoading && (
                                <div className="flex justify-center py-2" aria-busy="true" aria-label="Loading more">
                                  <CircularProgress size={24} thickness={2} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="w-8/12 flex flex-col">
                          {selectedCall ? (
                            <div className="w-full h-[80vh] overflow-hidden" style={{ scrollbarWidth: 'none' }}>
                              <LeadDetails
                                showDetailsModal={true}
                                selectedLead={selectedCall.id}
                                setShowDetailsModal={() => { }}
                                pipelineId={selectedCall?.pipeline?.id || null}
                                handleDelLead={(deletedLead) => {
                                  setAgentStatsCalls((prev) => {
                                    const next = prev.filter((c) => c.LeadModel?.id !== deletedLead.id)
                                    if (selectedCall?.id === deletedLead.id) {
                                      setSelectedCall(next[0]?.LeadModel ?? null)
                                    }
                                    return next
                                  })
                                  setAgentStatsTotal((prev) => Math.max(0, prev - 1))
                                }}
                                hideDelete={true}
                                isPipeline={false}
                                noBackDrop={true}
                                renderInline={true}
                              />
                            </div>
                          ) : (
                            <div className="w-full h-[80vh] flex items-center justify-center">
                              <div style={{ fontSize: 24, fontWeight: '600', textAlign: 'center' }}>
                                Select a call to view details
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  ) : initialLoader ? (
                    <div className="w-full flex flex-row items-center justify-center mt-12">
                      <CircularProgress size={35} thickness={2} />
                    </div>
                  ) : (
                    <div className="w-full h-[100%]">
                      {importantCalls?.length > 0 ? (
                        <div className="w-full flex flex-row items-start justify-between h-[100%]">
                          <div
                            className="w-4/12 min-w-[300px] px-3 flex flex-col overflow-auto h-[100%] border-r border-[#eaeaea]"
                            style={{ scrollbarWidth: 'none' }}
                          >
                            {importantCalls?.map(
                              (
                                item,
                                index, //.slice.reverse
                              ) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    setSelectedCall(item)
                                  }}
                                  className="w-full p-3 flex flex-col gap-2 border rounded-lg mt-5"
                                  style={{
                                    borderWidth: 1,
                                    borderColor:
                                      selectedCall.id === item.id
                                        ? primaryColor
                                        : '#eaeaea',
                                  }}
                                >
                                  <div className="w-full flex flex-row justify-between items-center">
                                    <div className="flex flex-col gap-2 items-start w-full">
                                      <div className="flex flex-row gap-2 items-center">
                                        <div
                                          className="h-[32px] w-[32px] items-center justify-center pt-[2px] rounded-full bg-black flex flex-shrink-0"
                                          style={{
                                            fontSize: 15,
                                            fontWeight: '500',
                                            color: '#fff',
                                          }}
                                        >
                                          {item.firstName[0]}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 14,
                                            fontWeight: '500',
                                            color: 'rgba(0,0,0,0.8)',
                                          }}
                                        >
                                          {item.firstName}
                                        </div>
                                      </div>
                                      <div
                                        className="min-w-0 flex-1"
                                        style={{
                                          fontSize: 14,
                                          fontWeight: '500',
                                          color: 'rgba(0,0,0,0.8)',
                                          maxWidth: 200,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }}
                                      >
                                        {item.email.length > 24 ? item.email.slice(0, 24) + '...' : item.email}
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-2 items-end">
                                      <img
                                        src="/svgIcons/fireIcon.png"
                                        style={{ height: 17, width: 17 }}
                                      />
                                      <div className="flex flex-row gap-2 items-center">
                                        <Image
                                          src={'/agentXOrb.gif'}
                                          height={23}
                                          width={23}
                                          alt="gif"
                                        />
                                        <div
                                          style={{
                                            fontSize: 13,
                                            fontWeight: '600',
                                            color: primaryColor,
                                            textDecorationLine: 'underline',
                                            marginRight: 30,
                                          }}
                                        >
                                          {item?.callActivity[0]?.agent?.name ||
                                            '-'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="w-full flex flex-row justify-between items-center">
                                    <div className="flex flex-row items-center gap-2">
                                      {
                                        !item.teamsAssigned && (
                                          <Image
                                            src={'/assets/manIcon.png'}
                                            height={23}
                                            width={23}
                                            alt="*"
                                          />
                                        )
                                      }
                                      {/* Team assignments display */}
                                      {item.teamsAssigned && item.teamsAssigned.length > 0 && (
                                        <div className="flex flex-row items-center gap-1">
                                          {item.teamsAssigned.slice(0, 2).map((teamMember, idx) => {
                                            const memberName = teamMember?.name || teamMember?.invitedUser?.name || ''
                                            return (
                                              <div
                                                key={teamMember.id || teamMember.invitedUserId || idx}
                                                className="h-6 w-6 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-semibold"
                                                title={memberName}
                                              >
                                                {memberName.charAt(0).toUpperCase()}
                                              </div>
                                            )
                                          })}
                                          {item.teamsAssigned.length > 2 && (
                                            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold">
                                              +{item.teamsAssigned.length - 2}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex flex-row gap-2">
                                      {item.tags?.length > 0 ? (
                                        <div
                                          className="text-end flex flex-row items-center gap-4"
                                          style={styles.paragraph}
                                        >
                                          {
                                            // selectedLeadsDetails?.tags?.map.slice(0, 1)
                                            item?.tags
                                              .slice(0, 2)
                                              .map((tag, index) => {
                                                return (
                                                  <div
                                                    key={index}
                                                    className="flex flex-row items-center gap-4"
                                                  >
                                                    <div
                                                      className="px-2 py-1 rounded-lg"
                                                      style={{
                                                        backgroundColor: `hsl(var(--brand-primary, 270 75% 50%) / 0.05)`,
                                                      }}
                                                    >
                                                      <div
                                                        className="text-[13px]"
                                                        style={{
                                                          color: `hsl(var(--brand-primary, 270 75% 50%))`,
                                                        }}
                                                      >
                                                        {tag}
                                                      </div>
                                                    </div>
                                                  </div>
                                                )
                                              })
                                          }
                                          <div>
                                            {item?.tags.length > 2 && (
                                              <div>+{item?.tags.length - 2}</div>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        '-'
                                      )}
                                    </div>
                                  </div>
                                </button>
                              ),
                            )}
                          </div>

                          <div className="w-8/12 flex flex-col">
                            {selectedCall ? (
                              <div className="w-full h-[80vh] overflow-hidden" style={{ scrollbarWidth: 'none' }}>
                                <LeadDetails
                                  onTagDeleted={(deletedTag, leadId) => handleTagDeleted(deletedTag, leadId)}
                                  showDetailsModal={true}
                                  selectedLead={selectedCall.id}
                                  setShowDetailsModal={() => {
                                    // Prevent closing - always show when call is selected
                                  }}
                                  pipelineId={selectedCall?.pipeline?.id || null}
                                  handleDelLead={(deletedLead) => {
                                    // Remove deleted lead from the list
                                    setImportantCalls((prevCalls) =>
                                      prevCalls.filter((call) => call.id !== deletedLead.id)
                                    )
                                    // If deleted lead was selected, select first remaining or clear
                                    if (selectedCall.id === deletedLead.id) {
                                      const remaining = importantCalls.filter(
                                        (call) => call.id !== deletedLead.id
                                      )
                                      setSelectedCall(remaining[0] || null)
                                    }
                                  }}
                                  hideDelete={false}
                                  isPipeline={false}
                                  noBackDrop={true}
                                  renderInline={true}
                                  leadStageUpdated={(stage) => {
                                    // Update the selected call's stage
                                    setSelectedCall((prev) => ({
                                      ...prev,
                                      stage: stage,
                                    }))
                                    // Update in the list
                                    setImportantCalls((prevCalls) =>
                                      prevCalls.map((call) =>
                                        call.id === selectedCall.id
                                          ? { ...call, stage: stage }
                                          : call
                                      )
                                    )
                                  }}
                                  leadAssignedTeam={(teamMember, lead) => {
                                    // lead is the updated selectedLeadsDetails object with teamsAssigned
                                    if (!lead) return

                                    // Update team assignment in selected call
                                    setSelectedCall((prev) => ({
                                      ...prev,
                                      teamsAssigned: lead.teamsAssigned || [],
                                    }))

                                    // Update in the list to reflect team assignments in left section
                                    const leadIdToUpdate = lead.id || selectedCall?.id
                                    setImportantCalls((prevCalls) =>
                                      prevCalls.map((call) => {
                                        if (call.id === leadIdToUpdate) {
                                          return {
                                            ...call,
                                            teamsAssigned: lead.teamsAssigned || [],
                                          }
                                        }
                                        return call
                                      })
                                    )
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-[80vh] flex items-center justify-center">
                                <div
                                  style={{
                                    fontsize: 24,
                                    fontWeight: '600',
                                    textAlign: 'center',
                                  }}
                                >
                                  Select a call to view details
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontsize: 24,
                            fontWeight: '600',
                            textAlign: 'center',
                            marginTop: 20,
                          }}
                        >
                          No Data Found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Box>
        </ScaleFadeTransition>
      </Modal>
    </div>
  )
}

export default ImportantCallsModal
