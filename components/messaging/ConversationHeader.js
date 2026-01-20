import { TypographyBody, TypographyCaptionSemibold } from '@/lib/typography'
import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { CircularProgress } from '@mui/material'
import Apis from '@/components/apis/Apis'
import SelectStageDropdown from '@/components/dashboard/leads/StageSelectDropdown'
// import AssignDropdownCn from '@/components/dashboard/leads/extras/AssignDropdownCn'
// import MultiSelectDropdownCn from '@/components/dashboard/leads/extras/MultiSelectDropdownCn'
import TeamAssignDropdownCn from '@/components/dashboard/leads/extras/TeamAssignDropdownCn'
import { AssignTeamMember, UnassignTeamMember } from '@/components/onboarding/services/apisServices/ApiService'
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { useRouter } from 'next/navigation'
import LeadDetails from '@/components/dashboard/leads/extras/LeadDetails'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { X } from 'lucide-react'

function ConversationHeader({ selectedThread, getRecentMessageType, formatUnreadCount, getLeadName, selectedUser }) {
    const router = useRouter()
    
    // Stage management state
    const [selectedStage, setSelectedStage] = useState('')
    const [stagesList, setStagesList] = useState([])
    const [stagesListLoader, setStagesListLoader] = useState(false)
    const [updateLeadLoader, setUpdateLeadLoader] = useState(false)
    const [pipelineId, setPipelineId] = useState(null)
    const [pipelineTitle, setPipelineTitle] = useState(null)

    // Team management state
    const [myTeam, setMyTeam] = useState([])
    const [myTeamAdmin, setMyTeamAdmin] = useState(null)
    const [getTeamLoader, setGetTeamLoader] = useState(false)
    const [leadDetails, setLeadDetails] = useState(null)
    const [globalLoader, setGlobalLoader] = useState(false)
    const [assignmentRefreshKey, setAssignmentRefreshKey] = useState(0)

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

    // Lead details modal state
    const [showLeadDetailsModal, setShowLeadDetailsModal] = useState(false)

    // Helper function to show snackbar messages
    const showSnackbar = (message, type = SnackbarTypes.Success) => {
        setShowSnackMsg({
            type,
            message,
            isVisible: true,
        })
    }

    // Function to get the lead details (same as LeadDetails.js)
    const getLeadDetails = async (selectedLead, retryCount = 0) => {
        try {
            let AuthToken = null
            const localDetails = localStorage.getItem('User')
            if (localDetails) {
                const Data = JSON.parse(localDetails)
                AuthToken = Data.token
            }

            const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedLead}`

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
                    setPipelineTitle(response.data.data.pipeline.title || null)
                } else if (response.data.data?.pipelineId) {
                    setPipelineId(response.data.data.pipelineId)
                    setPipelineTitle(response.data.data.pipeline?.title || null)
                } else {
                    setPipelineTitle(null)
                }

                return response.data.data
            }
        } catch (error) {
            console.error('❌ [ConversationHeader] Error fetching lead details:', error)
            // Retry once if this is the first attempt
            if (retryCount === 0) {
                await new Promise(resolve => setTimeout(resolve, 200))
                return getLeadDetails(selectedLead, 1)
            }
        }
        return null
    }

    // Fetch lead details when thread is selected (same pattern as LeadDetails.js)
    useEffect(() => {
        if (!selectedThread?.leadId) {
            setLeadDetails(null)
            setSelectedStage('')
            setPipelineId(null)
            setPipelineTitle(null)
            return
        }

        getLeadDetails(selectedThread.leadId)

        // Get stages list if pipelineId is available (will be set after lead details are fetched)
        // This will be handled in a separate useEffect that depends on pipelineId
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

            let ApiPath = `${Apis.getStagesList}?pipelineId=${pipelineId}&liteResource=true`
            if (selectedUser) {
                ApiPath = `${Apis.getStagesList}?pipelineId=${pipelineId}&liteResource=true&userId=${selectedUser.id}`
            }
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

    // Watch for changes in teamsAssigned and update refresh key to force dropdown update
    useEffect(() => {
        if (leadDetails?.teamsAssigned !== undefined) {
            // Create a stable key from teamsAssigned IDs to detect changes
            const teamsAssignedKey = (leadDetails.teamsAssigned || [])
                .map(t => String(t.id || t.invitedUserId || t.invitedUser?.id))
                .filter(Boolean)
                .sort()
                .join(',')
            
            // Use a small delay to ensure state is fully updated
            const timer = setTimeout(() => {
                setAssignmentRefreshKey(prev => prev + 1)
            }, 150)
            
            return () => clearTimeout(timer)
        }
    }, [leadDetails?.teamsAssigned])

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
                if (selectedUser) {
                    path = `${Apis.getTeam}?userId=${selectedUser.id}`
                }

                const response = await axios.get(path, {
                    headers: {
                        Authorization: 'Bearer ' + u.token,
                    },
                })

                if (response && response.data && response.data.status === true) {
                    const teamData = response.data.data || []
                    const adminData = response.data.admin

                    setMyTeam(teamData)
                    setMyTeamAdmin(adminData || null)
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

            let ApiData = {
                leadId: selectedThread.leadId,
                stageId: stage.id,
            }

            if (selectedUser) {
                ApiData.userId = selectedUser.id
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
    const handleAssignLeadToTeammember = async (item, selectedUser) => {
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

            if (selectedUser) {
                ApiData.userId = selectedUser.id
            }

            let response = await AssignTeamMember(ApiData)

            if (response && response.data && response.data.status === true) {
                // Refresh lead details to get updated team assignments
               
                if (selectedThread?.leadId) {
                    // Add a small delay to ensure backend has processed the update
                    await new Promise(resolve => setTimeout(resolve, 300))
                    const updatedDetails = await getLeadDetails(selectedThread.leadId)
                    // Wait for React to process the state update
                    await new Promise(resolve => setTimeout(resolve, 200))
                    // Explicitly update refresh key to ensure dropdown updates
                    setAssignmentRefreshKey(prev => prev + 1)
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
    const handleUnassignLeadFromTeammember = async (userId, selectedUser) => {
        try {
            setGlobalLoader(true)
            let ApiData = {
                leadId: selectedThread.leadId,
                teamMemberUserId: userId,
            }

            if (selectedUser) {
                ApiData.userId = selectedUser.id
            }

            let response = await UnassignTeamMember(ApiData)

            if (response && response.data && response.data.status === true) {
                // Refresh lead details to get updated team assignments
                if (selectedThread?.leadId) {
                    // Add a small delay to ensure backend has processed the update
                    await new Promise(resolve => setTimeout(resolve, 300))
                    const updatedDetails = await getLeadDetails(selectedThread.leadId)
                    // Wait for React to process the state update, then force refresh
                    await new Promise(resolve => setTimeout(resolve, 300))
                    // Explicitly update refresh key to ensure dropdown updates
                    setAssignmentRefreshKey(prev => {
                        return prev + 1
                    })
                }
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

            if (type === 'agent') {
                // Assign agent to lead via pipeline
                const agentId = item.id || item.agentId

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

    // Get selected team members for display
    const selectedTeamMembers = useMemo(() => {
        if (!leadDetails?.teamsAssigned || leadDetails.teamsAssigned.length === 0) {
            return []
        }
        return leadDetails.teamsAssigned.map((assigned) => ({
            id: assigned.id || assigned.invitedUserId || assigned.invitedUser?.id,
            name: assigned.name || assigned.invitedUser?.name || 'Unknown',
            avatar: assigned.thumb_profile_image || assigned.invitedUser?.thumb_profile_image,
            raw: assigned,
        }))
    }, [leadDetails?.teamsAssigned])

    // Create a stable key from teamsAssigned to use as dependency
    const teamsAssignedKey = useMemo(() => {
        if (!leadDetails?.teamsAssigned) return ''
        return leadDetails.teamsAssigned
            .map(t => String(t.id || t.invitedUserId || t.invitedUser?.id))
            .filter(Boolean)
            .sort()
            .join(',')
    }, [leadDetails?.teamsAssigned])

    // Memoize team member options for TeamAssignDropdownCn
    const teamMemberOptions = useMemo(() => {
        const options = [
            ...(myTeamAdmin ? [myTeamAdmin] : []),
            ...(myTeam || []),
        ].map((tm) => {
            // Get the team member ID - check all possible fields
            // For myTeam items from TeamResource:
            // - tm.id is the TeamModel id (NOT the user id) - like 90, 91, 92
            // - tm.invitedUserId is the actual user ID - like 593, 594, 595
            // - tm.invitedUser.id is also the actual user ID
            // We need to use invitedUserId or invitedUser.id, NOT tm.id
            const id = tm.invitedUserId || tm.invitedUser?.id || tm.id
            
            // Check if this team member is in the assigned teams
            const isSelected = (leadDetails?.teamsAssigned || []).some(
                (assigned) => {
                    // Check all possible ID fields in the assigned team member
                    const assignedId = assigned.id || assigned.invitedUserId || assigned.invitedUser?.id
                    
                    // Convert both to strings for comparison
                    const matches = String(assignedId) === String(id)
                    
                    if (matches) {}
                    
                    return matches
                }
            )
            
            return {
                id,
                label: tm.name || tm.invitedUser?.name || 'Unknown',
                avatar: tm.thumb_profile_image || tm.invitedUser?.thumb_profile_image,
                selected: isSelected,
                raw: tm,
            }
        })

        return options
    }, [myTeamAdmin, myTeam, teamsAssignedKey, assignmentRefreshKey])

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
            <div 
                className="relative flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                    if (selectedThread?.leadId) {
                        setShowLeadDetailsModal(true)
                    }
                }}
            >
            <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-black font-bold text-xs">
                            {getLeadName(selectedThread)}
            </div>
           
          </div>
                <TypographyBody 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                        if (selectedThread?.leadId) {
                            setShowLeadDetailsModal(true)
                        }
                    }}
                >
                    {selectedThread.lead?.firstName || 'Unknown Lead'}
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
                                            pipelineTitle={pipelineTitle}
                                            selectedUser={selectedUser}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Stage and Team Assignment Controls */}
                <div className="flex flex-row items-center gap-3">
                    

                    {/* Assign Dropdown (Team Members - Radio Buttons) */}
                    {selectedThread.leadId && (
                        <div className="flex items-center gap-2">
                            {(getTeamLoader || agentsLoader || globalLoader) ? (
                                <CircularProgress size={20} />
                            ) : (
                                <TeamAssignDropdownCn
                                    selectedUser={selectedUser}
                                    key={`assign-${selectedThread.leadId}-${assignmentRefreshKey}-${teamsAssignedKey}`}
                                    label="Assign"
                                    teamOptions={teamMemberOptions}
                                    onToggle={async (teamId, team, shouldAssign) => {
                                        if (shouldAssign) {
                                            await handleAssignLeadToTeammember(team.raw || team, selectedUser)
                                        } else {
                                            await handleUnassignLeadFromTeammember(teamId, selectedUser)
                                        }
                                    }}
                                />
                            )}
                        </div>
                    )}
                    
                    {/* Commented out: Original AssignDropdownCn implementation (Agents & Team) */}
                    {/* {selectedThread.leadId && (
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
                                    selectedUser={selectedUser}
                                />
                            )}
                        </div>
                    )} */}
                </div>
            </div>

            {/* Lead Details Modal */}
            {showLeadDetailsModal && selectedThread?.leadId && (
                <LeadDetails
                    selectedLead={selectedThread.leadId}
                    pipelineId={pipelineId}
                    showDetailsModal={showLeadDetailsModal}
                    setShowDetailsModal={setShowLeadDetailsModal}
                    hideDelete={true}
                />
            )}
        </>
    )
}

export default ConversationHeader