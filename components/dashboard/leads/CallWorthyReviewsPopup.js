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
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { TranscriptViewer } from '@/components/calls/TranscriptViewer'
import { GetFormattedDateString } from '@/utilities/utility'
import { getBrandPrimaryHex } from '@/utilities/colorUtils'
import { AssignTeamMember } from '@/components/onboarding/services/apisServices/ApiService'
import LeadTeamsAssignedList from './LeadTeamsAssignedList'
import { callStatusColors } from '@/constants/Constants'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'
import { getAgentsListImage } from '@/utilities/agentUtilities'
import LeadDetails from './extras/LeadDetails'

function CallWorthyReviewsPopup({ open, close }) {
  const [importantCalls, setImportantCalls] = useState([])
  const [selectedCall, setSelectedCall] = useState('')
  const [initialLoader, setInitialLoader] = useState(false)

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
    getImportantCalls()
    getMyteam()
  }, [])

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
            console.log(
              'response of get imporatant calls api is',
              response.data.data,
            )
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

  return (
    <div className="w-full">
      <Modal
        open={open}
        onClose={() => {
          close()
        }}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-9/12 sm:w-full w-full" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full h-[90vh]">
            <div
              className="sm:w-full w-full px-6 py-6"
              style={{
                backgroundColor: '#ffffff',

                borderRadius: '13px',
              }}
            >
              <div className="w-full flex flex-row items-center justify-between">
                <div style={{ fontSize: 22, fontWeight: '600', color: '#000' }}>
                  Recommend Calls
                </div>

                <button onClick={close} className="flex flex-row gap-2">
                  <div style={{ fontSize: 15, fontWeight: '500' }}>Close</div>
                  <img
                    src="/svgIcons/cross.svg"
                    style={{ height: 24, width: 24 }}
                  />
                </button>
              </div>

              <div
                className="h-[100%] pb-12"
                style={{ scrollbarWidth: 'none' }}
              >
                {initialLoader ? (
                  <div className="w-full flex flex-row items-center justify-center mt-12">
                    <CircularProgress size={35} thickness={2} />
                  </div>
                ) : (
                  <div className="w-full h-[100%]">
                    {importantCalls?.length > 0 ? (
                      <div className="w-full flex flex-row items-start justify-between h-[100%]">
                        <div
                          className="w-4/12 px-3 flex flex-col overflow-auto h-[100%]"
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
                                className="w-full p-3 flex flex-col gap-2 border-[2px] rounded-lg mt-5"
                                style={{
                                  borderColor:
                                    selectedCall.id === item.id
                                      ? primaryColor
                                      : '',
                                }}
                              >
                                <div className="w-full flex flex-row justify-between items-center">
                                  <div className="flex flex-col gap-2 items-start">
                                    <div className="flex flex-row gap-2 items-center">
                                      <div
                                        className="h-[27px] w-[27px] items-center justify-center pt-[2px] rounded-full bg-black"
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
                                          fontSize: 15,
                                          fontWeight: '500',
                                        }}
                                      >
                                        {item.firstName}
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 13,
                                        fontWeight: '500',
                                        color: '#00000060',
                                        width: 100,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {item.email.slice(0, 10) + '...'}
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
      </Modal>

    </div>
  )
}

export default CallWorthyReviewsPopup

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
