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
            console.log('🔍 [ConversationHeader] Fetching lead details, API path:', ApiPath, 'retry:', retryCount)

            const response = await axios.get(ApiPath, {
                headers: {
                    Authorization: 'Bearer ' + AuthToken,
                    'Content-Type': 'application/json',
                },
            })

            if (response && response.data && response.data.data) {
                console.log('🔍 [ConversationHeader] Lead details fetched:', {
                    leadId: response.data.data.id,
                    teamsAssigned: response.data.data.teamsAssigned,
                    teamsAssignedLength: response.data.data.teamsAssigned?.length || 0,
                    teamsAssignedStructure: response.data.data.teamsAssigned?.map(t => ({
                        id: t.id,
                        invitedUserId: t.invitedUserId,
                        invitedUser_id: t.invitedUser?.id,
                        invitedUser_name: t.invitedUser?.name,
                        name: t.name || t.invitedUser?.name,
                        fullObject: t, // Log full object for debugging
                    })),
                })
                console.log('🔍 [ConversationHeader] Full teamsAssigned array:', JSON.stringify(response.data.data.teamsAssigned, null, 2))
                
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
                console.log('🔄 [ConversationHeader] Teams assigned changed, updating refresh key:', {
                    key: teamsAssignedKey,
                    count: leadDetails.teamsAssigned?.length || 0,
                    teams: leadDetails.teamsAssigned?.map(t => ({
                        id: t.id,
                        invitedUserId: t.invitedUserId,
                        invitedUser_id: t.invitedUser?.id,
                    })),
                })
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
                    
                    console.log('🔍 [ConversationHeader] Team data fetched:', {
                        myTeam: teamData,
                        myTeamAdmin: adminData,
                        myTeamStructure: teamData.map(t => ({
                            id: t.id,
                            invitedUserId: t.invitedUserId,
                            invitedUser_id: t.invitedUser?.id,
                            name: t.name,
                        })),
                        adminStructure: adminData ? {
                            id: adminData.id,
                            invitedUserId: adminData.invitedUserId,
                            invitedUser_id: adminData.invitedUser?.id,
                            name: adminData.name,
                        } : null,
                    })
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
            console.log('🔵 [updateLeadStage] ApiData:', ApiData)


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
        setGlobalLoader(true);
        try {
          setGlobalLoader(true);
    
          console.log('🎯 [handleAssignLeadToTeammember] Starting assignment for:', {
            item,
            itemId: item.id,
            invitedUserId: item.invitedUserId,
            invitedUser_id: item.invitedUser?.id,
            name: item.name
          });
    
          // Determine the user ID to send to API
          const teamMemberUserId = item.invitedUserId || item.id;
    
          const ApiData = {
                leadId: leadDetails.id,
            teamMemberUserId: teamMemberUserId,
          };
    
          console.log('🎯 [handleAssignLeadToTeammember] API data:', ApiData);
    
          let response = await AssignTeamMember(ApiData);
          console.log('🎯 [handleAssignLeadToTeammember] API response:', response?.data);
    
          if (response && response.data && response.data.status === true) {
            // Create a proper team member object for state
            const newTeamMember = {
              id: item.id,
              invitedUserId: item.invitedUserId,
              invitingUserId: item.invitingUserId,
              name: item.name || item.invitedUser?.name,
              thumb_profile_image: item.thumb_profile_image || item.invitedUser?.thumb_profile_image,
              invitedUser: item.invitedUser || {
                id: item.invitedUserId || item.id,
                name: item.name,
                thumb_profile_image: item.thumb_profile_image
              }
            };
    
            console.log('🎯 [handleAssignLeadToTeammember] New team member object:', newTeamMember);
    
            // Update state IMMEDIATELY
            setLeadDetails(prevData => {
              if (!prevData) return prevData;
    
              const currentTeams = prevData.teamsAssigned || [];
    
              // Check if already exists
              const exists = currentTeams.some(t => {
                const tId = t.id || t.invitedUserId || t.invitedUser?.id;
                const newId = newTeamMember.id || newTeamMember.invitedUserId || newTeamMember.invitedUser?.id;
                return String(tId) === String(newId);
              });
    
              if (exists) {
                console.log('🎯 [handleAssignLeadToTeammember] Team member already exists, not adding again');
                return prevData;
              }
    
              const updatedLead = {
                ...prevData,
                teamsAssigned: [...currentTeams, newTeamMember]
              };
    
              console.log('🎯 [handleAssignLeadToTeammember] Updated lead state:', {
                oldTeams: currentTeams.map(t => ({ id: t.id, name: t.name })),
                newTeams: updatedLead.teamsAssigned.map(t => ({ id: t.id, name: t.name })),
                updatedLead
              });
    
              return updatedLead;
            });
    
            showSnackbar(response.data.message || 'Team member assigned successfully', SnackbarTypes.Success);
          } else {
            showSnackbar(response?.data?.message || 'Failed to assign team member', SnackbarTypes.Error);
          }
        } catch (error) {
          console.error('❌ [handleAssignLeadToTeammember] Error:', error);
          showSnackbar('Failed to assign team member. Please try again.', SnackbarTypes.Error);
        } finally {
          setGlobalLoader(false);
        }
      };
      //function to unassign lead from team member
    
      const handleUnassignLeadFromTeammember = async (userId) => {
        try {
          setGlobalLoader(true);
          console.log('🎯 [handleUnassignLeadFromTeammember] Unassigning user with ID:', userId);
    
          // Find the team member being unassigned to get their details
          const allTeams = [...(myTeamAdmin ? [myTeamAdmin] : []), ...(myTeam || [])];
          const teamToUnassign = allTeams.find(t => {
            const tId = t.invitedUserId || t.invitedUser?.id || t.id;
            return String(tId) === String(userId);
          });
    
          console.log('🎯 [handleUnassignLeadFromTeammember] Team member to unassign:', teamToUnassign);
    
          const ApiData = {
            leadId: leadDetails.id,
            teamMemberUserId: userId,
          };
    
          console.log('🎯 [handleUnassignLeadFromTeammember] API data:', ApiData);
    
          let response = await UnassignTeamMember(ApiData);
          console.log('🎯 [handleUnassignLeadFromTeammember] API response:', response?.data);
    
          if (response && response.data && response.data.status === true) {
            // Update state IMMEDIATELY
            setLeadDetails(prevData => {
              if (!prevData) return prevData;
    
              const filteredTeams = (prevData.teamsAssigned || []).filter((user) => {
                // Check all possible ID fields to match the userId
                const userIdentifier = user.invitedUserId || user.invitedUser?.id || user.id;
                // Convert both to strings for comparison
                return String(userIdentifier) !== String(userId);
              });
    
              const updatedLead = {
                ...prevData,
                teamsAssigned: filteredTeams,
              };
    
              console.log('🎯 [handleUnassignLeadFromTeammember] Updated lead state:', {
                oldTeamsCount: prevData.teamsAssigned?.length || 0,
                newTeamsCount: filteredTeams.length,
                updatedLead
              });
    
    
              return updatedLead;
            });
    
            showSnackbar(response.data.message || 'Team member unassigned successfully', SnackbarTypes.Success);
          } else if (response && response.data && response.data.status === false) {
            // Show error message if unassignment failed
            showSnackbar(response.data.message || 'Failed to unassign team member', SnackbarTypes.Error);
          }
        } catch (error) {
          console.error('❌ [handleUnassignLeadFromTeammember] Error:', error);
          showSnackbar('Failed to unassign team member. Please try again.', SnackbarTypes.Error);
        } finally {
          setGlobalLoader(false);
        }
      };

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
        const allTeams = [...(myTeamAdmin ? [myTeamAdmin] : []), ...(myTeam || [])];
    
        return allTeams.map((tm) => {
          // Get the team member ID - use invitedUserId first, then id
          const id = tm.invitedUserId || tm.invitedUser?.id || tm.id;
    
          // Check if this team member is already assigned
          const isSelected = (leadDetails?.teamsAssigned || []).some(
            (assigned) => {
              const assignedId = assigned.invitedUserId || assigned.invitedUser?.id || assigned.id;
              return String(assignedId) === String(id);
            }
          );
    
          return {
            id,
            label: tm.name || tm.invitedUser?.name || 'Unknown',
            avatar: tm.thumb_profile_image || tm.invitedUser?.thumb_profile_image,
            selected: isSelected,
            raw: tm,
          };
        });
      }, [myTeamAdmin, myTeam, leadDetails?.teamsAssigned])
    
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