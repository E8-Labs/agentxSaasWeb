import { CircularProgress } from '@mui/material'
import axios from 'axios'
import { color } from 'framer-motion'
import { ChevronDown, ChevronUp, EditIcon, Pencil, Router } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { PersistanceKeys } from '@/constants/Constants'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import { UpdateCadenceConfirmationPopup } from './UpdateCadenceConfirmationPopup'
import { useUser } from '@/hooks/redux-hooks'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import { Tooltip } from '@mui/material'
import { getTempleteDetails } from '@/components/pipeline/TempleteServices'

const PipelineAndStage = ({
  selectedAgent,
  UserPipeline,
  mainAgent,
  selectedUser,
  selectedLead,
  selectedLeadId,
  from,
}) => {

  //for redux user
  const { user: reduxUser, setUser: setReduxUser } = useUser()

  const [message, setMessage] = useState(null)
  const router = useRouter()
  const [expandedStages, setExpandedStages] = useState([])
  const [leadStageTitle, setLeadStageTitle] = useState(null)
  const [leadStageLoading, setLeadStageLoading] = useState(false)
  const [StagesList, setStagesList] = useState([
    { id: 1, title: 's1', description: 'Testing the stage1' },
    { id: 2, title: 's2', description: 'Testing the stage2' },
    { id: 3, title: 's3', description: 'Testing the stage3' },
  ])

  // Tooltip content for hovered email/sms row: { rowKey, data, loading }
  const [rowHoverTemplate, setRowHoverTemplate] = useState(null)

  const [agentCadence, setAgentCadence] = useState([])

  const [initialLoader, setInitialLoader] = useState(false)

  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)

  //fetch agent details state
  const [agentDetails, setAgentDetails] = useState(null)
  const [agentDetailsLoading, setAgentDetailsLoading] = useState(false);

  //eventlistener
  useEffect(() => {
    const handleRefreshSelectedUser = (event) => {
      console.log("Event listener trigered for refreshing the pipeline and stages", event.detail)
      const { userId, userData } = event.detail || {}
      fetchAgentDetails()
      if (selectedAgent.agentType !== 'inbound') {
        handleGetCadence()
      }
    }

    window.addEventListener('refreshSelectedUser', handleRefreshSelectedUser)
    return () => {
      window.removeEventListener('refreshSelectedUser', handleRefreshSelectedUser)
    }
  }, [selectedUser]);

  useEffect(() => {
    console.log("Main agent passed to Pipeline And Stages", mainAgent);
    fetchAgentDetails();
    if (selectedAgent.agentType !== 'inbound') {
      handleGetCadence()
    }
  }, [])

  // Fetch lead's current stage when selectedLeadId or selectedLead.id is provided
  useEffect(() => {
    const leadId = selectedLeadId ?? selectedLead?.id
    if (!leadId) {
      setLeadStageTitle(null)
      return
    }
    const fetchLeadStage = async () => {
      try {
        setLeadStageLoading(true)
        const token = AuthToken()
        const response = await axios.get(`${Apis.getLeadDetails}?leadId=${leadId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (response?.data?.data?.stage?.stageTitle) {
          setLeadStageTitle(response.data.data.stage.stageTitle)
        } else {
          setLeadStageTitle(null)
        }
      } catch (err) {
        setLeadStageTitle(null)
      } finally {
        setLeadStageLoading(false)
      }
    }
    fetchLeadStage()
  }, [selectedLeadId, selectedLead?.id])

  //code for togeling stages seleciton
  const toggleStageDetails = (stage) => {
    // if (expandedStages.some((s) => s.id === stage.id)) {
    //     setExpandedStages(expandedStages.filter((s) => s.id !== stage.id));
    // } else {
    //     setExpandedStages([...expandedStages, stage]);
    // }
    setExpandedStages((prevIds) => {
      if (prevIds.includes(stage.cadence.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== stage.cadence.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, stage.cadence.id]
      }
    })
  }

  //fetch agent details
  const fetchAgentDetails = async () => {
    try {
      setAgentDetailsLoading(true);
      const Token = AuthToken();
      // console.log(Token);
      const ApiPath = Apis.getAgentDetails + '?mainAgentId=' + mainAgent?.id
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        // console.log("Agent details are", response.data)
        if (response.data.status === true) {
          setAgentDetails(response.data.data)
        }
      }
    } catch (error) {
      console.log("Error occured in fetching agent details api is", error)
    } finally {
      setAgentDetailsLoading(false);
    }
  }

  //funciton to call get cadence api
  const handleGetCadence = async () => {
    try {
      setInitialLoader(true)

      let userDetails = null
      let AuthToken = null
      const localData = localStorage.getItem('User')

      const agentDataLocal = localStorage.getItem('agentDetails')

      if (localData) {
        const Data = JSON.parse(localData)
        userDetails = Data
        // //console.log;
        AuthToken = Data.token
      }

      // //console.log;

      const ApiData = {
        mainAgentId: selectedAgent.id,
      }

      const formData = new FormData()
      formData.append('mainAgentId', mainAgent?.id)

      const ApiPath = Apis.getAgentCadence

      // //console.log;
      for (let [key, value] of formData.entries()) {
        console.log("Key is", key, "and value is", value);
      }
      // console.log("Api path for agent cadence data is", ApiPath);
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        setAgentCadence(response.data.data)
        console.log("agent cadence data is", response.data.data)
      }
    } catch (error) {
      // console.error("Error occured in get cadence api is:", error);
    } finally {
      setInitialLoader(false)
    }
  }

  const decideTextToShowForCadenceType = (cadence) => {
    if (cadence.communicationType === 'call') {
      return 'then Make Call'
    } else if (cadence.communicationType === 'email') {
      return 'then Send Email'
    } else if (cadence.communicationType === 'sms') {
      return 'then Send Text'
    }
    else if (cadence.communicationType === 'task') {
      return 'then Create Task'
    }
  }

  //booking time status text
  const decideTextToShowForBookingTimeStatus = (cadence) => {
    console.log("cadence is", cadence)
    if (cadence.referencePoint === "after_booking") {
      return "after booking"
    } else if (cadence.referencePoint === "before_meeting") {
      return "before meeting"
    } else {
      return ""
    }
  }

  const styles = {
    paragraph: {
      fontWeight: '500',
      fontSize: 15,
    },
    paragraph2: {
      fontWeight: '400',
      fontSize: 14,
      color: '#00000080',
    },
  }

  const handleUpdateCadence = () => {

    console.log("selected user is", selectedUser);
    // return
    localStorage.setItem('selectedUser', JSON.stringify(selectedUser))
    // return
    setShowConfirmationPopup(false)

    //code for redirecting to same url

    const data = {
      status: true,
    }
    localStorage.setItem('fromDashboard', JSON.stringify(data))
    const d = {
      subAccountData: selectedUser,
      isFromAgency: from,
    }

    localStorage.setItem(
      PersistanceKeys.isFromAdminOrAgency,
      JSON.stringify(d),
    )

    // Save current URL for redirect after agent creation
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href
      localStorage.setItem(
        PersistanceKeys.returnUrlAfterAgentCreation,
        currentUrl,
      )
    }

    // Check if current logged-in user is Admin or Agency
    let isAdminOrAgency = false

    // Check from Redux first
    if (reduxUser) {
      const userType = reduxUser?.userType
      const userRole = reduxUser?.userRole
      const TeamFor = reduxUser?.teamFor
      isAdminOrAgency = userType === 'admin' || userRole === 'Agency' || TeamFor === "Agency"
    }

    // Fallback to localStorage if Redux doesn't have the data
    if (!isAdminOrAgency && typeof window !== 'undefined') {
      try {
        const localUserData = localStorage.getItem('User')
        if (localUserData) {
          const parsedUser = JSON.parse(localUserData)
          const userType = parsedUser?.user?.userType || parsedUser?.userType
          const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
          const TeamFor = parsedUser?.user?.teamFor || parsedUser?.teamFor
          isAdminOrAgency = userType === 'admin' || userRole === 'Agency' || TeamFor === "Agency"
        }
      } catch (error) { }
    }



    // return
    // Store agent details for pipeline update page
    if (mainAgent?.id) {
      localStorage.setItem('agentDetails', JSON.stringify({ id: mainAgent.id, agentType: selectedAgent?.agentType }))
    }

    // Store cadence data in the format expected by Pipeline1.js
    if (agentCadence.length > 0 && mainAgent?.pipeline?.id) {
      const cadenceDetails = agentCadence.map((stage) => ({
        stage: stage.cadence.stage?.id,
        calls: stage.calls.map((call) => {
          // Determine if this is a booking stage
          const isBookingStage = stage.cadence.stage?.identifier === 'booked'

          const communicationType = call.communicationType || 'call'
          return {
            id: call.id,
            waitTimeDays: call.waitTimeDays || 0,
            waitTimeHours: call.waitTimeHours || 0,
            waitTimeMinutes: call.waitTimeMinutes || 0,
            communicationType,
            action: communicationType, // keep in sync so step label (e.g. "Create Task") never shows undefined
            referencePoint: call.referencePoint || (isBookingStage ? 'before_meeting' : 'regular_calls'), // Include referencePoint
            // Include template data if present
            ...(call.templateId && { templateId: call.templateId }),
            ...(call.templateName && { templateName: call.templateName }),
            ...(call.subject && { subject: call.subject }),
            ...(call.content && { content: call.content }),
            // Include smsPhoneNumberId for SMS cadence calls
            ...(call.smsPhoneNumberId && { smsPhoneNumberId: call.smsPhoneNumberId }),
            // Include emailAccountId for email cadence calls (for consistency)
            ...(call.emailAccountId && { emailAccountId: call.emailAccountId }),
            // Task steps must always have taskPayload with at least title (backend validation)
            ...(communicationType === 'task' && {
              taskPayload:
                call.taskPayload && typeof call.taskPayload === 'object' && (call.taskPayload.title ?? '').toString().trim() !== ''
                  ? call.taskPayload
                  : { title: 'Task' },
            }),
          }
        }),
        moveToStage: stage.cadence.moveToStage?.id || null,
      }))

      const cadenceData = {
        pipelineID: mainAgent.pipeline.id,
        cadenceDetails: cadenceDetails,
      }

      localStorage.setItem('AddCadenceDetails', JSON.stringify(cadenceData))
    }
    else {
      //clear AddCadenceDetails from local storage
      localStorage.removeItem('AddCadenceDetails')
    }

    if (selectedUser) {
      // Helper function to check if user is admin or agency
      const isAdminOrAgency = () => {
        if (typeof window === 'undefined') return false
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
            const userType = parsedUser?.user?.userType || parsedUser?.userType
            return userRole === 'Admin' || userType === 'admin' || userRole === 'Agency'
          }
        } catch (error) {
          console.error('Error checking user role:', error)
        }
        return false
      }

      // Read existing state object (may already have restoreState from tab/agent selection)
      let existingData = null
      try {
        const storedData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
        if (storedData) {
          existingData = JSON.parse(storedData)
        }
      } catch (error) {
        console.error('Error reading existing state:', error)
      }

      let u = {
        subAccountData: selectedUser,
        isFrom: from,
      }

      // If user is admin/agency, add/update restoreState with selectedUserId
      if (isAdminOrAgency()) {
        if (!u.restoreState) {
          u.restoreState = {}
        }
        // Preserve existing restoreState if it exists
        if (existingData?.restoreState) {
          u.restoreState = {
            ...existingData.restoreState,
            selectedUserId: selectedUser.id,
          }
        } else {
          u.restoreState = {
            selectedUserId: selectedUser.id,
            selectedTabName: null,
            selectedAgentId: null,
          }
        }
      }

      localStorage.setItem(
        PersistanceKeys.isFromAdminOrAgency,
        JSON.stringify(u),
      )
    }
    // router.push("/pipeline/update");
    // window.location.href = '/pipeline/update'

    // Open in new tab if current user is Admin or Agency
    if (isAdminOrAgency) {
      window.open('/pipeline/update', '_blank')
    } else {
      // router.push("/createagent");
      window.location.href = '/pipeline/update'
    }
  }

  return (
    <div>
      <AgentSelectSnackMessage
        type={message?.type}
        isVisible={message != null}
        message={message?.message}
        hide={() => setMessage(null)}
      />
      <div className="w-full flex flex-row items-center justify-between py-3 px-4" style={{ height: 'auto', borderBottom: '1px solid #eaeaea' }}>
        <div className="flex flex-row items-center gap-2">
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(0, 0, 0, 0.8)',
            }}
          >
            Assigned Pipeline
          </p>
          {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
        </div>
        <div style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.8)' }}>
          {/*
            {mainAgent?.pipeline?.title ? mainAgent?.pipeline?.title : '-'}
          */}
          {agentDetailsLoading ? (
            <CircularProgress size={25} />
          ) : (
            <div>{agentDetails?.pipeline ? agentDetails?.pipeline?.title : '-'}</div>
          )}
        </div>
      </div>

      <div className="w-full flex flex-row items-center justify-between py-3 px-4" style={{ height: 'auto', borderBottom: '1px solid #eaeaea' }}>
        <div className="flex flex-row items-center gap-2">
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(0, 0, 0, 0.8)',
            }}
          >
            Stages
          </p>
        </div>
        <div style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.8)' }}>
          {leadStageLoading ? (
            <CircularProgress size={20} />
          ) : (
            leadStageTitle ||
            (selectedLead || selectedUser)?.PipelineStages?.stageTitle ||
            (selectedLead || selectedUser)?.stage?.stageTitle ||
            (typeof (selectedLead || selectedUser)?.stage === 'string' ? (selectedLead || selectedUser)?.stage : null) ||
            (selectedLead || selectedUser)?.pipelineStage?.stageTitle ||
            agentCadence[0]?.cadence?.stage?.stageTitle ||
            '-'
          )}
        </div>
      </div>

      {/* {selectedAgent?.agentType !== "inbound" && ( */}
      <div className="w-full" style={{ fontSize: 14, fontWeight: 400 }}>
        <div className="hidden flex-row items-center justify-between mt-4 text-[14px] px-3">
          <div className="">
            Stages
          </div>
          <div style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0, 0, 0, 0.8)' }}>
            {leadStageLoading ? (
              <CircularProgress size={20} />
            ) : (
              leadStageTitle ||
              (selectedLead || selectedUser)?.PipelineStages?.stageTitle ||
              (selectedLead || selectedUser)?.stage?.stageTitle ||
              (typeof (selectedLead || selectedUser)?.stage === 'string' ? (selectedLead || selectedUser)?.stage : null) ||
              (selectedLead || selectedUser)?.pipelineStage?.stageTitle ||
              agentCadence[0]?.cadence?.stage?.stageTitle ||
              '-'
            )}
          </div>
        </div>
        <UpdateCadenceConfirmationPopup
          showConfirmationPopuup={showConfirmationPopup}
          setShowConfirmationPopup={setShowConfirmationPopup}
          onContinue={() => {
            handleUpdateCadence()
          }}
        />
        <div className="flex flex-col">
          {initialLoader ? (
            <div className="w-full flex flex-row items-center justify-center mt-4">
              <CircularProgress size={25} />
            </div>
          ) : (
            <>
              {agentCadence.map((stage, index) => (
                <div key={index} className="mt-4">
                  <div className="py-px px-0" style={{ borderRadius: 0 }}>
                  <button
                    onClick={() => toggleStageDetails(stage)}
                    className="w-full flex flex-row items-center justify-between py-3 px-4 text-sm font-normal border-none hover:bg-black/[0.02] active:scale-[0.98] transition-transform duration-150"
                  >
                    <div>Cadence</div>
                    <div>
                      <div>
                        {expandedStages.includes(stage?.cadence?.id) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>
                  </button>
                  {expandedStages.includes(stage?.cadence?.id) && (
                    <div className="flex flex-col gap-1 pt-3 px-4 border-t border-black/10 text-sm font-normal">
                      <div className="flex flex-row items-center gap-4 text-black/80">
                        <span className="w-10 shrink-0" />
                        <div className="flex flex-row w-[240px]">
                          <span className="flex-1 text-center text-xs">Days</span>
                          <span className="flex-1 text-center text-xs">Hours</span>
                          <span className="flex-1 text-center text-xs">Mins</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-px">
                      {stage.calls.map((item, index) => {
                        return (
                          <div key={index} className="flex flex-col gap-2">
                            <div className="flex flex-row items-center gap-4 py-2">
                              <span>Wait</span>
                              <div className="flex flex-row items-center w-[240px] rounded bg-black/[0.02] overflow-hidden">
                                <div className="flex-1 text-center py-1.5 border-r border-black/10">
                                  {item.waitTimeDays}
                                </div>
                                <div className="flex-1 text-center py-1.5 border-r border-black/10">
                                  {item.waitTimeHours}
                                </div>
                                <div className="flex-1 text-center py-1.5">
                                  {item.waitTimeMinutes}
                                </div>
                              </div>
                              <div>
                                {/*decideTextToShowForBookingTimeStatus(item)}, {decideTextToShowForCadenceType(item)*/}
                                {(item.communicationType === 'email' || item.communicationType === 'sms') && item.templateId ? (
                                  <Tooltip
                                    title={(() => {
                                      const rowKey = `${item.id}`
                                      const isActive = rowHoverTemplate?.rowKey === rowKey
                                      if (!isActive) return ''
                                      if (rowHoverTemplate.loading) return 'Loading...'
                                      console.log("rowHoverTemplate is", rowHoverTemplate)
                                      const raw = rowHoverTemplate.data?.content ?? rowHoverTemplate.data?.body ?? rowHoverTemplate.data?.templateContent ?? ''
                                      const text = String(raw)
                                        .replace(/<[^>]*>/g, '')
                                        .replace(/&nbsp;/g, ' ')
                                        .trim()
                                      return text || 'No content'
                                    })()}
                                    arrow
                                    componentsProps={{
                                      tooltip: {
                                        sx: {
                                          backgroundColor: 'hsl(var(--brand-primary))',
                                          color: '#fff',
                                          fontSize: '12px',
                                          maxWidth: 320,
                                          whiteSpace: 'pre-wrap',
                                          wordBreak: 'break-word',
                                        },
                                      },
                                      arrow: {
                                        sx: {
                                          color: 'hsl(var(--brand-primary))',
                                        },
                                      },
                                    }}
                                  >
                                    <div
                                      className="text-brand-primary text-[14px] font-normal cursor-pointer"
                                      onMouseEnter={async () => {
                                        const rowKey = `${item.id}`
                                        const cacheKey = `${PersistanceKeys.PipelineTemplateCachePrefix}${item.templateId}`
                                        setRowHoverTemplate({ rowKey, loading: true })
                                        try {
                                          const cached = localStorage.getItem(cacheKey)
                                          if (cached) {
                                            const data = JSON.parse(cached)
                                            setRowHoverTemplate({ rowKey, data, loading: false })
                                            return
                                          }
                                        } catch (_) { /* ignore invalid cache */ }
                                        console.log("template id is", item.templateId)
                                        try {
                                          const data = await getTempleteDetails({ templateId: item.templateId })
                                          console.log("template data is", data)
                                          if (data) {
                                            localStorage.setItem(cacheKey, JSON.stringify(data))
                                          }
                                          setRowHoverTemplate((prev) =>
                                            prev?.rowKey === rowKey ? { rowKey, data, loading: false } : prev
                                          )
                                        } catch (err) {
                                          setRowHoverTemplate((prev) =>
                                            prev?.rowKey === rowKey ? { rowKey, data: null, loading: false } : prev
                                          )
                                        }
                                      }}
                                      onMouseLeave={() => setRowHoverTemplate(null)}
                                    >
                                      {(item.communicationType &&
                                        item.communicationType !=
                                        'call') ||
                                        (item.action &&
                                          item.action != 'call')
                                        ? `${decideTextToShowForBookingTimeStatus(item)}, ${decideTextToShowForCadenceType(item)}`
                                        : `${decideTextToShowForBookingTimeStatus(item)}, ${decideTextToShowForCadenceType(item)}`}
                                    </div>
                                  </Tooltip>
                                ) : (
                                  <div className="text-brand-primary text-[14px] font-normal">
                                    {(item.communicationType &&
                                      item.communicationType !=
                                      'call') ||
                                      (item.action &&
                                        item.action != 'call')
                                      ? `${decideTextToShowForBookingTimeStatus(item)}, ${decideTextToShowForCadenceType(item)}`
                                      : `${decideTextToShowForBookingTimeStatus(item)}, ${decideTextToShowForCadenceType(item)}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      <div className="flex flex-row items-center gap-3 pt-2">
                        <span>Then move to</span>
                        <span className="rounded-lg bg-black/[0.02] px-3 py-1.5 text-sm">
                          {stage?.cadence?.moveToStage?.stageTitle ||
                            'No stage selected'}
                        </span>
                      </div>
                      <div className="flex justify-start pt-3">
                        <button
                          className="flex flex-row items-center gap-2 h-[35px] rounded-md px-0 bg-transparent hover:underline font-sans text-[15px]"
                          style={{
                            fontWeight: '500',
                            fontFamily: 'Inter, sans-serif',
                            color: 'hsl(var(--brand-primary))',
                          }}
                          onClick={() => {
                            handleUpdateCadence()
                          }}
                        >
                          Update Cadence
                          <Pencil size={16} style={{ color: 'hsl(var(--brand-primary))' }} />
                        </button>
                      </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            </>
          )}
        </div>
      </div>
      {/* )} */}
    </div>
  )
}

export default PipelineAndStage
