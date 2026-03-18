import { Box, CircularProgress, Fade, Modal } from '@mui/material'
import axios from 'axios'
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { PersistanceKeys } from '@/constants/Constants'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import CloseBtn from '@/components/globalExtras/CloseBtn'
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
  const [showRemoveFromPipelinePopup, setShowRemoveFromPipelinePopup] = useState(false)
  const [removeFromPipelineLoading, setRemoveFromPipelineLoading] = useState(false)

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
        const raw = Array.isArray(response.data.data) ? response.data.data : []
        // Deduplicate by cadence.id so we show one cadence UI per stage (avoids duplicate blocks)
        const seen = new Set()
        const deduped = raw.filter((item) => {
          const id = item?.cadence?.id ?? item?.cadence?.stage?.id
          if (id && seen.has(id)) return false
          if (id) seen.add(id)
          return true
        })
        setAgentCadence(deduped)
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

  const firecrawlStyles = {
    container: {
      borderRadius: 12,
      border: '1px solid #eaeaea',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
    },
    header: {
      borderBottom: '1px solid #eaeaea',
      padding: '14px 16px',
      fontSize: 14,
      color: 'rgba(0, 0, 0, 0.8)',
    },
    body: {
      padding: '16px',
      fontSize: 14,
      color: 'rgba(0, 0, 0, 0.8)',
    },
    accordion: {
      border: '1px solid #eaeaea',
      borderRadius: 12,
      overflow: 'hidden',
    },
    accordionInner: {
      backgroundColor: 'rgba(0, 0, 0, 0.02)',
      padding: '12px 16px',
    },
  }

  const handleRemoveFromPipeline = async () => {
    if (!mainAgent?.id) return
    try {
      setRemoveFromPipelineLoading(true)
      const Token = AuthToken()
      const response = await axios.post(
        Apis.removeAgentFromPipeline,
        { mainAgentId: mainAgent.id },
        {
          headers: {
            Authorization: 'Bearer ' + Token,
            'Content-Type': 'application/json',
          },
        },
      )
      if (response?.data?.status === true) {
        setShowRemoveFromPipelinePopup(false)
        setMessage({ type: SnackbarTypes.success, message: 'Agent removed from pipeline' })
        await fetchAgentDetails()
        if (selectedAgent?.agentType !== 'inbound') {
          await handleGetCadence()
        }
        setAgentCadence([])
        window.dispatchEvent(
          new CustomEvent('refreshSelectedUser', {
            detail: { userId: selectedUser?.id, userData: selectedUser },
          }),
        )
      } else {
        setMessage({
          type: SnackbarTypes.error,
          message: response?.data?.message || 'Failed to remove agent from pipeline',
        })
      }
    } catch (error) {
      setMessage({
        type: SnackbarTypes.error,
        message: error?.response?.data?.message || 'Failed to remove agent from pipeline',
      })
    } finally {
      setRemoveFromPipelineLoading(false)
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
      <div className="w-full flex flex-col" style={firecrawlStyles.container}>
        {/* Header section: Assigned Pipeline + Stages */}
        <div
          className="flex flex-row items-center justify-between"
          style={firecrawlStyles.header}
        >
          <div className="flex flex-row items-center gap-2">
            <span className="font-medium" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
              Assigned Pipeline
            </span>
            <div className='font-medium'>|</div>
            {agentDetailsLoading ? (
              <CircularProgress size={20} />
            ) : (
              <span>{agentDetails?.pipeline ? agentDetails?.pipeline?.title : '-'}</span>
            )}
          </div>
          {agentDetails?.pipeline && (
            <div className="flex justify-start items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (!removeFromPipelineLoading) setShowRemoveFromPipelinePopup(true)
                }}
                disabled={removeFromPipelineLoading}
                className="flex h-[40px] items-center gap-2 rounded-lg px-4 text-sm font-medium text-destructive outline-none transition-colors duration-150 focus:bg-destructive/10 active:scale-[0.98] disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0 bg-black/[0.05]"
              >
                {removeFromPipelineLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <>
                    <Trash2 size={16} strokeWidth={2} />
                    Remove
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <Modal
          open={showRemoveFromPipelinePopup}
          onClose={() => {
            if (!removeFromPipelineLoading) setShowRemoveFromPipelinePopup(false)
          }}
          closeAfterTransition
          BackdropProps={{
            timeout: 250,
            sx: { backgroundColor: '#00000099' },
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Fade in={showRemoveFromPipelinePopup} timeout={250}>
            <Box
              className="flex w-[400px] max-w-[90vw] flex-col overflow-hidden rounded-[12px] bg-white"
              sx={{
                boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                border: '1px solid #eaeaea',
                outline: 'none',
                '@keyframes modalEnter': {
                  '0%': { transform: 'scale(0.95)' },
                  '100%': { transform: 'scale(1)' },
                },
                animation:
                  'modalEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              {/* Header */}
              <div
                className="flex flex-row items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid #eaeaea' }}
              >
                <span
                  className="font-semibold"
                  style={{ fontSize: 16, color: 'rgba(0,0,0,0.9)' }}
                >
                  Remove from Pipeline
                </span>
                <CloseBtn
                  onClick={() => {
                    if (!removeFromPipelineLoading)
                      setShowRemoveFromPipelinePopup(false)
                  }}
                />
              </div>

              {/* Body */}
              <div
                className="px-4 py-4"
                style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
              >
                This will remove the agent from the assigned pipeline and delete
                all pipeline cadence steps for this agent. This action cannot be
                undone.
              </div>

              {/* Footer */}
              <div
                className="flex flex-row items-center justify-between px-4 py-3"
                style={{ borderTop: '1px solid #eaeaea' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!removeFromPipelineLoading)
                      setShowRemoveFromPipelinePopup(false)
                  }}
                  className="flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] outline-none disabled:opacity-60"
                  disabled={removeFromPipelineLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFromPipeline}
                  disabled={removeFromPipelineLoading}
                  className="flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-150 active:scale-[0.98] outline-none disabled:opacity-60"
                >
                  {removeFromPipelineLoading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    'Remove'
                  )}
                </button>
              </div>
            </Box>
          </Fade>
        </Modal>

        <div
          className="flex flex-row items-center justify-between"
          style={{ ...firecrawlStyles.header, borderBottom: 'none' }}
        >
          <span className="font-medium" style={{ color: 'rgba(0, 0, 0, 0.9)' }}>
            Stages
          </span>
          <div className="flex flex-row items-center gap-3">
            {leadStageLoading ? (
              <CircularProgress size={20} />
            ) : (
              <span className="hidden" aria-hidden>
                {leadStageTitle ||
                  (selectedLead || selectedUser)?.PipelineStages?.stageTitle ||
                  (selectedLead || selectedUser)?.stage?.stageTitle ||
                  (typeof (selectedLead || selectedUser)?.stage === 'string'
                    ? (selectedLead || selectedUser)?.stage
                    : null) ||
                  (selectedLead || selectedUser)?.pipelineStage?.stageTitle ||
                  agentCadence[0]?.cadence?.stage?.stageTitle ||
                  '-'}
              </span>
            )}
            {/*agentCadence.length > 0 && ()*/}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowConfirmationPopup(true)
              }}
              className="flex h-[40px] items-center gap-2 rounded-lg px-4 text-sm font-medium text-brand-primary outline-none transition-colors duration-150 hover:underline focus:bg-brand-primary/10 focus:text-brand-primary active:scale-[0.98] [&_svg]:size-4 [&_svg]:shrink-0 bg-black/[0.05]"
            >
              <Pencil size={16} strokeWidth={2} />
              Update
            </button>
          </div>
        </div>

        {/* Body: Cadence accordions */}
        <div className="px-4 py-4" style={firecrawlStyles.body}>
          <UpdateCadenceConfirmationPopup
            showConfirmationPopuup={showConfirmationPopup}
            setShowConfirmationPopup={setShowConfirmationPopup}
            onContinue={() => {
              handleUpdateCadence()
            }}
          />
          {initialLoader ? (
            <div className="flex flex-row items-center justify-center py-8">
              <CircularProgress size={28} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {agentCadence.map((stage, index) => (
                <div key={index} style={firecrawlStyles.accordion}>
                  <button
                    onClick={() => toggleStageDetails(stage)}
                    className="w-full flex flex-row items-center justify-between py-3 px-4 text-sm font-medium border-none bg-white hover:bg-black/[0.02] active:scale-[0.99] transition-all duration-150"
                    style={{ color: 'rgba(0, 0, 0, 0.9)' }}
                  >
                    <span>{stage?.cadence?.stage?.stageTitle || 'Cadence'}</span>
                    {expandedStages.includes(stage?.cadence?.id) ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  {expandedStages.includes(stage?.cadence?.id) && (
                    <div style={firecrawlStyles.accordionInner}>
                      <div className="flex flex-row items-center gap-4 text-black/80 mb-2">
                        <span className="w-10 shrink-0" />
                        <div className="flex flex-row w-[240px]">
                          <span className="flex-1 text-center text-xs font-medium">Days</span>
                          <span className="flex-1 text-center text-xs font-medium">Hours</span>
                          <span className="flex-1 text-center text-xs font-medium">Mins</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {stage.calls.map((item, callIndex) => (
                          <div key={callIndex} className="flex flex-col gap-2">
                            <div className="flex flex-row items-center gap-4 py-2">
                              <span className="text-sm">Wait</span>
                              <div className="flex flex-row items-center w-[240px] rounded-lg overflow-hidden border border-black/10 bg-white">
                                <div className="flex-1 text-center py-1.5 border-r border-black/10 text-sm">
                                  {item.waitTimeDays}
                                </div>
                                <div className="flex-1 text-center py-1.5 border-r border-black/10 text-sm">
                                  {item.waitTimeHours}
                                </div>
                                <div className="flex-1 text-center py-1.5 text-sm">
                                  {item.waitTimeMinutes}
                                </div>
                              </div>
                              <div>
                                {(item.communicationType === 'email' || item.communicationType === 'sms') && item.templateId ? (
                                  <Tooltip
                                    title={(() => {
                                      const rowKey = `${item.id}`
                                      const isActive = rowHoverTemplate?.rowKey === rowKey
                                      if (!isActive) return ''
                                      if (rowHoverTemplate.loading) return 'Loading...'
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
                                          backgroundColor: '#000000',
                                          color: '#ffffff',
                                          fontSize: '12px',
                                          maxWidth: 320,
                                          whiteSpace: 'pre-wrap',
                                          wordBreak: 'break-word',
                                        },
                                      },
                                      arrow: {
                                        sx: {
                                          color: '#000000',
                                        },
                                      },
                                    }}
                                  >
                                    <div
                                      className="text-brand-primary text-[14px] font-normal cursor-pointer hover:underline"
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
                                        try {
                                          const data = await getTempleteDetails({ templateId: item.templateId })
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
                                      {`${decideTextToShowForBookingTimeStatus(item)}, ${decideTextToShowForCadenceType(item)}`}
                                    </div>
                                  </Tooltip>
                                ) : (
                                  <div className="text-brand-primary text-[14px] font-normal">
                                    {`${decideTextToShowForBookingTimeStatus(item)}, ${decideTextToShowForCadenceType(item)}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex flex-row items-center gap-3 pt-3 mt-1 border-t border-black/10">
                          <span className="text-sm">Then move to</span>
                          <span className="rounded-lg bg-white border border-black/10 px-3 py-1.5 text-sm">
                            {stage?.cadence?.moveToStage?.stageTitle || 'No stage selected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PipelineAndStage
