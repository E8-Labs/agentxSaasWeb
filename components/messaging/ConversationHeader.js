import { TypographyBody, TypographyCaptionSemibold } from '@/lib/typography'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { CircularProgress } from '@mui/material'
import Apis from '@/components/apis/Apis'
import SelectStageDropdown from '@/components/dashboard/leads/StageSelectDropdown'
import AssignDropdownCn from '@/components/dashboard/leads/extras/AssignDropdownCn'
import { AssignTeamMember, UnassignTeamMember } from '@/components/onboarding/services/apisServices/ApiService'
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { useRouter } from 'next/navigation'

function ConversationHeader({ selectedThread, getRecentMessageType, formatUnreadCount, getLeadName }) {
    const router = useRouter()
    
    // Stage management state
    const [selectedStage, setSelectedStage] = useState('')
    const [stagesList, setStagesList] = useState([])
    const [stagesListLoader, setStagesListLoader] = useState(false)
    const [updateLeadLoader, setUpdateLeadLoader] = useState(false)
    const [pipelineId, setPipelineId] = useState(null)

    // Team management state
    const [myTeam, setMyTeam] = useState([])
    const [myTeamAdmin, setMyTeamAdmin] = useState(null)
    const [getTeamLoader, setGetTeamLoader] = useState(false)
    const [leadDetails, setLeadDetails] = useState(null)
    const [globalLoader, setGlobalLoader] = useState(false)

    // Agents state
    const [agentsList, setAgentsList] = useState([])
    const [agentsLoader, setAgentsLoader] = useState(false)
    const [selectedAssignValue, setSelectedAssignValue] = useState(null)

    // Snackbar state
    const [showSnackMsg, setShowSnackMsg] = useState({
        type: SnackbarTypes.Success,
        message: '',
        isVisible: false,
    })

    // Helper function to show snackbar messages
    const showSnackbar = (message, type = SnackbarTypes.Success) => {
        setShowSnackMsg({
            type,
            message,
            isVisible: true,
        })
    }

    // Fetch lead details to get pipeline and stage info
    useEffect(() => {
        if (!selectedThread?.leadId) return

        const getLeadDetails = async () => {
            try {
                let AuthToken = null
                const localDetails = localStorage.getItem('User')
                if (localDetails) {
                    const Data = JSON.parse(localDetails)
                    AuthToken = Data.token
                }

                const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedThread.leadId}`
                const response = await axios.get(ApiPath, {
                    headers: {
                        Authorization: 'Bearer ' + AuthToken,
                        'Content-Type': 'application/json',
                    },
                })

                if (response && response.data && response.data.data) {
                    setLeadDetails(response.data.data)
                    setSelectedStage(response.data.data?.stage?.stageTitle || '')
                    if (response.data.data?.pipeline?.id) {
                        setPipelineId(response.data.data.pipeline.id)
                    } else if (response.data.data?.pipelineId) {
                        setPipelineId(response.data.data.pipelineId)
                    }
                    
                    // Set selected assign value based on lead details
                    if (response.data.data?.agent?.id) {
                        setSelectedAssignValue({
                            type: 'agent',
                            id: response.data.data.agent.id,
                        })
                    } else if (response.data.data?.teamsAssigned && response.data.data.teamsAssigned.length > 0) {
                        // For now, show the first assigned team member
                        const firstTeam = response.data.data.teamsAssigned[0]
                        const teamId = firstTeam.id || firstTeam.invitedUserId || firstTeam.invitedUser?.id
                        if (teamId) {
                            setSelectedAssignValue({
                                type: 'team',
                                id: String(teamId), // Ensure ID is a string for consistent matching
                            })
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching lead details:', error)
            }
        }

        getLeadDetails()
    }, [selectedThread?.leadId])

    // Function to get stages list
    const getStagesList = React.useCallback(async () => {
        try {
            let AuthToken = null
            setStagesListLoader(true)
            const localDetails = localStorage.getItem('User')
            if (localDetails) {
                const Data = JSON.parse(localDetails)
                AuthToken = Data.token
            }

            const ApiPath = `${Apis.getStagesList}?pipelineId=${pipelineId}&liteResource=true`
            const response = await axios.get(ApiPath, {
                headers: {
                    Authorization: 'Bearer ' + AuthToken,
                    'Content-Type': 'application/json',
                },
            })

            if (response && response.data && response.data.status === true) {
                setStagesList(response.data.data.stages || [])
            }
        } catch (error) {
            console.error('Error fetching stages list:', error)
        } finally {
            setStagesListLoader(false)
        }
    }, [pipelineId])

    // Fetch stages list when pipelineId is available
    useEffect(() => {
        if (!pipelineId) return
        getStagesList()
    }, [pipelineId, getStagesList])

    // Fetch team members and agents on mount
    useEffect(() => {
        getMyteam()
        getAgents()
    }, [])

    // Function to get team members
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

                if (response && response.data && response.data.status === true) {
                    setMyTeam(response.data.data || [])
                    setMyTeamAdmin(response.data.admin || null)
                }
            }
        } catch (e) {
            console.error('Error fetching team:', e)
        } finally {
            setGetTeamLoader(false)
        }
    }

    // Function to get agents
    const getAgents = async () => {
        try {
            setAgentsLoader(true)
            const data = localStorage.getItem('User')

            if (data) {
                let u = JSON.parse(data)
                const ApiPath = `${Apis.getAgents}?offset=0&agentType=outbound&pipeline=true`

                const response = await axios.get(ApiPath, {
                    headers: {
                        Authorization: 'Bearer ' + u.token,
                        'Content-Type': 'application/json',
                    },
                })

                if (response && response.data && response.data.data) {
                    // Filter agents that have outbound subagents
                    const filteredAgents = response.data.data.filter((mainAgent) => {
                        const subAgents = mainAgent.agents || []
                        return subAgents.some((item) => item.agentType === 'outbound')
                    })
                    setAgentsList(filteredAgents || [])
                }
            }
        } catch (e) {
            console.error('Error fetching agents:', e)
        } finally {
            setAgentsLoader(false)
        }
    }

    // Function to handle stage change
    const handleStageChange = (selected) => {
        const value = typeof selected === 'object' ? selected?.value || selected?.stageTitle : selected
        if (!value) return
        setSelectedStage(value)
    }

    // Function to update lead stage
    const updateLeadStage = async (stage) => {
        try {
            let AuthToken = null
            setUpdateLeadLoader(true)

            const localDetails = localStorage.getItem('User')
            if (localDetails) {
                const Data = JSON.parse(localDetails)
                AuthToken = Data.token
            }

            const ApiData = {
                leadId: selectedThread.leadId,
                stageId: stage.id,
            }

            const ApiPath = Apis.updateLeadStageApi
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: 'Bearer ' + AuthToken,
                    'Content-Type': 'application/json',
                },
            })

            if (response) {
                setUpdateLeadLoader(false)
                if (response.data.status === true) {
                    showSnackbar(response.data.message, SnackbarTypes.Success)
                    setSelectedStage(stage.stageTitle)
                    // Update lead details if available
                    if (leadDetails) {
                        setLeadDetails({
                            ...leadDetails,
                            stage: stage,
                        })
                    }
                } else if (response.data.status === false) {
                    showSnackbar(response.data.message, SnackbarTypes.Error)
                }
            }
        } catch (error) {
            console.error('Error updating lead stage:', error)
            setUpdateLeadLoader(false)
        }
    }

    // Function to assign lead to team member
    const handleAssignLeadToTeammember = async (item) => {
        try {
            let ApiData = null
            if (item.invitedUserId) {
                ApiData = {
                    leadId: selectedThread.leadId,
                    teamMemberUserId: item.invitedUserId,
                }
            } else {
                ApiData = {
                    leadId: selectedThread.leadId,
                    teamMemberUserId: item.id,
                }
            }

            console.log('🔵 [Assign] Team API Data:', ApiData)

            let response = await AssignTeamMember(ApiData)
            console.log('🔵 [Assign] Team assignment response:', response?.data)

            if (response && response.data && response.data.status === true) {
                // Refresh lead details to get updated team assignments
                if (selectedThread?.leadId) {
                    const getLeadDetails = async () => {
                        try {
                            let AuthToken = null
                            const localDetails = localStorage.getItem('User')
                            if (localDetails) {
                                const Data = JSON.parse(localDetails)
                                AuthToken = Data.token
                            }

                            const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedThread.leadId}`
                            const response = await axios.get(ApiPath, {
                                headers: {
                                    Authorization: 'Bearer ' + AuthToken,
                                    'Content-Type': 'application/json',
                                },
                            })

                            if (response && response.data && response.data.data) {
                                setLeadDetails(response.data.data)
                            }
                        } catch (error) {
                            console.error('Error refreshing lead details:', error)
                        }
                    }
                    getLeadDetails()
                }
                showSnackbar('Team member assigned successfully', SnackbarTypes.Success)
                return true
            } else if (response && response.data && response.data.status === false) {
                showSnackbar(response.data.message || 'Failed to assign team member', SnackbarTypes.Error)
                return false
            }
            return false
        } catch (error) {
            console.error('❌ [Assign] Error assigning team member:', error)
            showSnackbar('Failed to assign team member. Please try again.', SnackbarTypes.Error)
            return false
        }
    }

    // Function to unassign lead from team member
    const handleUnassignLeadFromTeammember = async (userId) => {
        try {
            setGlobalLoader(true)
            let ApiData = {
                leadId: selectedThread.leadId,
                teamMemberUserId: userId,
            }

            let response = await UnassignTeamMember(ApiData)

            if (response && response.data && response.data.status === true) {
                // Update lead details if available
                if (leadDetails) {
                    const filteredTeams = (leadDetails.teamsAssigned || []).filter((user) => {
                        const userIdentifier = user.id || user.invitedUserId || user.invitedUser?.id
                        return String(userIdentifier) !== String(userId)
                    })

                    setLeadDetails({
                        ...leadDetails,
                        teamsAssigned: filteredTeams,
                    })
                }
                setSelectedAssignValue(null)
                showSnackbar('Team member unassigned successfully', SnackbarTypes.Success)
            } else if (response && response.data && response.data.status === false) {
                showSnackbar(response.data.message || 'Failed to unassign team member', SnackbarTypes.Error)
            }
        } catch (error) {
            console.error('Error unassigning team member:', error)
            showSnackbar('Failed to unassign team member. Please try again.', SnackbarTypes.Error)
        } finally {
            setGlobalLoader(false)
        }
    }

    // Handle assign selection (agent or team)
    const handleAssignSelect = async (type, id, item) => {
        try {
            setGlobalLoader(true)
            console.log('🔵 [Assign] Starting assignment:', { type, id, item })

            if (type === 'agent') {
                // Assign agent to lead via pipeline
                const agentId = item.id || item.agentId
                console.log('🔵 [Assign] Agent assignment:', { agentId, pipeline: item.pipeline })
                
                if (!item.pipeline || !item.pipeline.id) {
                    showSnackbar('Agent must be assigned to a pipeline', SnackbarTypes.Error)
                    setGlobalLoader(false)
                    return
                }

                const ApiData = {
                    pipelineId: item.pipeline.id,
                    mainAgentIds: [agentId],
                    leadIds: [selectedThread.leadId],
                    startTimeDifFromNow: 0,
                    batchSize: 1,
                    selectedAll: false,
                    dncCheck: false,
                }

                console.log('🔵 [Assign] API Data:', ApiData)

                const localData = localStorage.getItem('User')
                let AuthToken = null
                if (localData) {
                    const UserDetails = JSON.parse(localData)
                    AuthToken = UserDetails.token
                }

                const response = await axios.post(Apis.assignLeadToPipeLine, ApiData, {
                    headers: {
                        Authorization: 'Bearer ' + AuthToken,
                        'Content-Type': 'application/json',
                    },
                })

                console.log('🔵 [Assign] Agent assignment response:', response.data)

                if (response && response.data && response.data.status === true) {
                    setSelectedAssignValue({ type: 'agent', id: String(agentId) })
                    showSnackbar('Agent assigned successfully', SnackbarTypes.Success)
                    // Refresh lead details
                    if (selectedThread?.leadId) {
                        const getLeadDetails = async () => {
                            try {
                                let AuthToken = null
                                const localDetails = localStorage.getItem('User')
                                if (localDetails) {
                                    const Data = JSON.parse(localDetails)
                                    AuthToken = Data.token
                                }

                                const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedThread.leadId}`
                                const response = await axios.get(ApiPath, {
                                    headers: {
                                        Authorization: 'Bearer ' + AuthToken,
                                        'Content-Type': 'application/json',
                                    },
                                })

                                if (response && response.data && response.data.data) {
                                    setLeadDetails(response.data.data)
                                    // Update selected value based on lead details
                                    if (response.data.data?.agent?.id) {
                                        setSelectedAssignValue({
                                            type: 'agent',
                                            id: String(response.data.data.agent.id),
                                        })
                                    }
                                }
                            } catch (error) {
                                console.error('Error refreshing lead details:', error)
                            }
                        }
                        getLeadDetails()
                    }
                } else {
                    showSnackbar(response.data?.message || 'Failed to assign agent', SnackbarTypes.Error)
                }
            } else if (type === 'team') {
                // Assign team member - use raw property which contains the original team member object
                const teamMember = item.raw || item
                console.log('🔵 [Assign] Team assignment:', { teamId: id, teamMember })
                
                const result = await handleAssignLeadToTeammember(teamMember)
                // Update selected value after successful assignment
                if (result) {
                    setSelectedAssignValue({ type: 'team', id: String(id) })
                }
            }
        } catch (error) {
            console.error('❌ [Assign] Error assigning:', error)
            showSnackbar('Failed to assign. Please try again.', SnackbarTypes.Error)
        } finally {
            setGlobalLoader(false)
        }
    }

    // Handle create agent
    const handleCreateAgent = () => {
        router.push('/createagent')
    }

    return (
        <>
            <AgentSelectSnackMessage
                message={showSnackMsg.message}
                type={showSnackMsg.type}
                isVisible={showSnackMsg.isVisible}
                hide={() => {
                    setShowSnackMsg({
                        type: SnackbarTypes.Success,
                        message: '',
                        isVisible: false,
                    })
                }}
            />
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex flex-row items-center gap-2">
            <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-black font-bold text-xs">
                            {getLeadName(selectedThread)}
            </div>
            {getRecentMessageType(selectedThread) === 'email' ? (
              <div className="absolute bottom-0 right-0 translate-y-1/2 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                <Image
                  src="/messaging/email message type icon.svg"
                  width={10}
                  height={10}
                  alt="Email"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="absolute bottom-0 right-0 translate-y-1/2 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                <Image
                  src="/messaging/text type message icon.svg"
                  width={10}
                  height={10}
                  alt="SMS"
                  className="object-contain"
                />
              </div>
            )}
            {selectedThread.unreadCount > 0 && formatUnreadCount(selectedThread.unreadCount) && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-sm">
                <TypographyCaptionSemibold className="text-white">
                  {formatUnreadCount(selectedThread.unreadCount)}
                </TypographyCaptionSemibold>
              </div>
            )}
          </div>
                <TypographyBody>
                    {selectedThread.lead?.firstName || selectedThread.lead?.name || 'Unknown Lead'}
                </TypographyBody>


                    {/* Stage Dropdown */}
                    {pipelineId && (
                        <div className="flex items-center">
                            {stagesListLoader ? (
                                <CircularProgress size={20} />
                            ) : (
                                <>
                                    {updateLeadLoader ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        <SelectStageDropdown
                                            selectedStage={selectedStage}
                                            handleStageChange={handleStageChange}
                                            stagesList={stagesList}
                                            updateLeadStage={updateLeadStage}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Stage and Team Assignment Controls */}
                <div className="flex flex-row items-center gap-3">
                    

                    {/* Assign Dropdown (Agents & Team) */}
                    {selectedThread.leadId && (
                        <div className="flex items-center">
                            {(getTeamLoader || agentsLoader || globalLoader) ? (
                                <CircularProgress size={20} />
                            ) : (
                                <AssignDropdownCn
                                    label="Assign"
                                    agents={agentsList}
                                    teamOptions={[
                                        ...(myTeamAdmin ? [myTeamAdmin] : []),
                                        ...(myTeam || []),
                                    ].map((tm) => {
                                        const id = tm.id || tm.invitedUserId || tm.invitedUser?.id
                                        return {
                                            id: String(id), // Ensure ID is a string for consistent matching
                                            label: tm.name,
                                            avatar: tm.thumb_profile_image,
                                            raw: tm,
                                        }
                                    })}
                                    selectedValue={selectedAssignValue}
                                    onSelect={handleAssignSelect}
                                    onCreateAgent={handleCreateAgent}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default ConversationHeader