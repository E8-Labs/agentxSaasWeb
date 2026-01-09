import '@madzadev/audio-player/dist/index.css'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Player from '@madzadev/audio-player'
import CloseIcon from '@mui/icons-material/Close'
import {
  Alert,
  Box,
  CircularProgress,
  Drawer,
  Fade,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  Modal,
  Popover,
  Select,
  Snackbar,
  Tooltip,
} from '@mui/material'
import {
  CaretDown,
  CaretUp,
  EnvelopeSimple,
  Plus,
  X,
} from '@phosphor-icons/react'
import { setUser } from '@sentry/nextjs'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import axios from 'axios'
import parsePhoneNumberFromString from 'libphonenumber-js'
import {
  Phone,
  View,
  AlertTriangle,
  CheckCircle2,
  Mail,
  MapPin,
  Tag,
  Workflow,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Copy,
  ListChecks,
  PhoneCall,
  MessageSquareDotIcon,
  MessageSquareDot,
  WorkflowIcon,
  ChevronDown,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  SparkleIcon,
  CalendarIcon,
  PlusIcon,
  TagIcon,
} from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState, useCallback } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import AdminGetProfileDetails from '@/components/admin/AdminGetProfileDetails'
import { TranscriptViewer } from '@/components/calls/TranscriptViewer'
import CallTranscriptModal from '@/components/dashboard/leads/extras/CallTranscriptModal'
import { UpgradeTagWithModal, UpgradeTag } from '@/components/constants/constants'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { AssignTeamMember, UnassignTeamMember } from '@/components/onboarding/services/apisServices/ApiService'
import AuthSelectionPopup from '@/components/pipeline/AuthSelectionPopup'
import NewMessageModal from '@/components/messaging/NewMessageModal'
import {
  getA2PNumbers,
  getGmailAccounts,
} from '@/components/pipeline/TempleteServices'
import ScoringProgress from '@/components/ui/ScoringProgress'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'
import CircularLoader from '@/utilities/CircularLoader'
import { capitalize } from '@/utilities/StringUtility'
import { getAgentsListImage } from '@/utilities/agentUtilities'
import { GetFormattedDateString } from '@/utilities/utility'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'
import { getUniquesColumn } from '@/components/globalExtras/GetUniqueColumns'

import NoVoicemailView from '../../myagentX/NoVoicemailView'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../AgentSelectSnackMessage'
import LeadTeamsAssignedList from '../LeadTeamsAssignedList'
import SelectStageDropdown from '../StageSelectDropdown'
import DeleteCallLogConfimation from './DeleteCallLogConfimation'
import { useDispatch } from 'react-redux'
import { openDialer } from '@/store/slices/dialerSlice'
import DropdownCn from './DropdownCn'
// import MultiSelectDropdownCn from './MultiSelectDropdownCn'
import TeamAssignDropdownCn from './TeamAssignDropdownCn'
import { useUser } from '@/hooks/redux-hooks'
import { InfoRow, TagPill } from './LeadDetailsCN'
import TagManagerCn from './TagManagerCn'
import { Button } from '@/components/ui/button'
import NotesTabCN from './NotesTabCN'
import KYCTabCN from './KYCTabCN'
import ActivityTabCN from './ActivityTabCN'
import InsightsTabCN from './InsightsTabCN'
import CustomFieldsCN from './CustomFieldsCN'
import TabsCN from './TabsCN'

const LeadDetails = ({
  showDetailsModal,
  selectedLead,
  setShowDetailsModal,
  pipelineId,
  handleDelLead,
  hideDelete,
  isPipeline = false,
  noBackDrop = false,
  leadStageUpdated,
  leadAssignedTeam,
  renderInline = false,
  selectedUser = null, // Optional prop for admin/agency view
}) => {
  // //console.log;
  // //console.log;

  const [columnsLength, setcolumnsLength] = useState([])

  const [initialLoader, setInitialLoader] = useState(false)

  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null)
  const [leadColumns, setLeadColumns] = useState([])

  const [globalLoader, setGlobalLoader] = useState(false)
  //code for emailPopup
  const [showAllEmails, setShowAllEmails] = useState(false)

  //code for buttons of details popup
  const [activeTab, setActiveTab] = useState('activity')

  //code for notes - noteDetails is still needed to pass to NotesTabCN
  const [noteDetails, setNoteDetails] = useState([])

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState(null) // earlier it was empty array
  const [isExpandedActivity, setIsExpandedActivity] = useState([])

  const [expandedCustomFields, setExpandedCustomFields] = useState([]) // check if the custom fields Read More or Read less should show

  //code for audio play popup
  const [showAudioPlay, setShowAudioPlay] = useState(null)
  const [showNoAudioPlay, setShowNoAudioPlay] = useState(false)

  //show custom variables
  const [showCustomVariables, setShowCustomVariables] = useState(false)
  const [showTeams, setShowTeams] = useState(false)

  //code for del tag
  const [DelTagLoader, setDelTagLoader] = useState(null)

  //code for tag input with autocomplete
  const [tagInputValue, setTagInputValue] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [addTagLoader, setAddTagLoader] = useState(false)
  const tagInputRef = React.useRef(null)

  //code for stages drop down
  const [selectedStage, setSelectedStage] = useState('')
  const [stagesList, setStagesList] = useState([])
  const [stagesListLoader, setStagesListLoader] = useState(false)

  //code for snakbars - consolidated into single state

  //update lead loader
  const [updateLeadLoader, setUpdateLeadLoader] = useState(false)

  //code for delete lead
  const [delLeadLoader, setDelLeadLoader] = useState(false)

  //variable for popover
  const [anchorEl, setAnchorEl] = React.useState(null)

  //variables storing tammember data
  const [myTeam, setMyTeam] = useState([])
  const [myTeamAdmin, setMyTeamAdmin] = useState(null)


  //variable for gtteam loader
  const [getTeamLoader, setGetTeamLoader] = useState(false)

  const [showConfirmPerplexity, setshowConfirmPerplexity] = useState(false)

  // Initialize userLocalData from localStorage immediately
  const [userLocalData, setUserLocalData] = useState(() => {
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('User')
      if (localData) {
        try {
          const parsed = JSON.parse(localData)
          return parsed.user || null
        } catch (e) {
          return null
        }
      }
    }
    return null
  })
  const [loading, setLoading] = useState(false)

  const [showDelModal, setShowDelModal] = useState(false)
  const [showTranscriptModal, setShowTranscriptModal] = useState(false)
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)
  const [seletedCallLog, setSelectedCallLog] = useState(null)
  const [delCallLoader, setdelCallLoader] = useState(false)

  // Note edit/delete states - REMOVED: Now handled by NotesTabCN component

  // Message modal states (unified for Email and SMS)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageModalMode, setMessageModalMode] = useState('email') // 'email' or 'sms'
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null)
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [sendEmailLoader, setSendEmailLoader] = useState(false)
  const [sendSMSLoader, setSendSMSLoader] = useState(false)

  const [googleAccounts, setGoogleAccounts] = useState([])
  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  useEffect(() => {
    console.log('showSnackMsg', showSnackMsg)
  }, [showSnackMsg])

  // Helper function to show snackbar messages
  const showSnackbar = (message, type = SnackbarTypes.Success) => {
    setShowSnackMsg({
      type,
      message,
      isVisible: true,
    })
  }

  const [showAuthSelectionPopup, setShowAuthSelectionPopup] = useState(false)

  // Send action dropdown state
  const [sendActionAnchor, setSendActionAnchor] = useState(null)

  // Stripe configuration for upgrade modal
  const stripePromise = getStripe()

  // Upgrade modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentFullPlan, setCurrentFullPlan] = useState(null)

  const [creditCost, setCreditCost] = useState(null)

  // Redux dispatch for dialer
  const dispatch = useDispatch()
  
  // Get user data from Redux
  const { user: reduxUser, setUser: setReduxUser } = useUser()
  
  // Determine which user's capabilities to use
  // If selectedUser is provided (admin/agency view), use userLocalData, otherwise use reduxUser
  const effectiveUser = React.useMemo(() => {
    return selectedUser?.id ? userLocalData : reduxUser
  }, [selectedUser?.id, userLocalData, reduxUser])
  
  // Use backend-provided flags for capability checks
  // Backend sets: shouldShowAllowDialerUpgrade, shouldShowDialerRequestFeature, etc.
  const dialerCapability = React.useMemo(() => {
    const planCapabilities = effectiveUser?.planCapabilities || {}
    return {
      hasAccess: planCapabilities.allowDialer === true,
      showUpgrade: planCapabilities.shouldShowAllowDialerUpgrade === true,
      showRequestFeature: planCapabilities.shouldShowDialerRequestFeature === true,
    }
  }, [effectiveUser?.planCapabilities])
  
  const emailCapability = React.useMemo(() => {
    const planCapabilities = effectiveUser?.planCapabilities || {}
    return {
      hasAccess: planCapabilities.allowEmails === true,
      showUpgrade: planCapabilities.shouldShowAllowEmailUpgrade === true,
      showRequestFeature: planCapabilities.shouldShowEmailRequestFeature === true,
    }
  }, [effectiveUser?.planCapabilities])
  
  const smsCapability = React.useMemo(() => {
    const planCapabilities = effectiveUser?.planCapabilities || {}
    return {
      hasAccess: planCapabilities.allowTextMessages === true,
      showUpgrade: planCapabilities.shouldShowAllowSmsUpgrade === true,
      showRequestFeature: planCapabilities.shouldShowSmsRequestFeature === true,
    }
  }, [effectiveUser?.planCapabilities])
  
  // Memoize the selectedUser to pass to UpgradePlan to prevent it from becoming null on re-renders
  const memoizedSelectedUserForUpgrade = React.useMemo(() => {
    // Only use selectedUser prop if it has an id - no fallback to userLocalData
    // This ensures we're always using the correct selectedUser prop
    const userToPass = selectedUser?.id ? selectedUser : null
    console.log('🔍 [LeadDetails] Memoized selectedUser for UpgradePlan:', {
      selectedUserProp: selectedUser ? { id: selectedUser.id, hasId: !!selectedUser.id } : 'null',
      memoizedUser: userToPass ? { id: userToPass.id, hasId: !!userToPass.id, userRole: userToPass.userRole } : 'null'
    })
    return userToPass
  }, [selectedUser?.id]) // Only recalculate when selectedUser.id changes
  
  // State to trigger upgrade modal externally (use counter to ensure it triggers even if already true)
  const [triggerUpgradeModal, setTriggerUpgradeModal] = React.useState(0)
  const [triggerEmailUpgradeModal, setTriggerEmailUpgradeModal] = React.useState(0)
  const [triggerSMSUpgradeModal, setTriggerSMSUpgradeModal] = React.useState(0)
  
  // Handler to trigger upgrade modal
  const handleUpgradeClick = React.useCallback(() => {
    // Use counter to ensure modal opens even if state was already true
    setTriggerUpgradeModal(prev => prev + 1)
  }, [])
  
  // Handler to trigger email upgrade modal
  const handleEmailUpgradeClick = React.useCallback(() => {
    setTriggerEmailUpgradeModal(prev => prev + 1)
  }, [])
  
  // Handler to trigger SMS upgrade modal
  const handleSMSUpgradeClick = React.useCallback(() => {
    setTriggerSMSUpgradeModal(prev => prev + 1)
  }, [])
  
  // Handler to reset trigger after modal closes
  const handleUpgradeModalClose = React.useCallback(() => {
    setTriggerUpgradeModal(0)
  }, [])
  
  // Handler to reset email upgrade modal trigger
  const handleEmailUpgradeModalClose = React.useCallback(() => {
    setTriggerEmailUpgradeModal(0)
  }, [])
  
  // Handler to reset SMS upgrade modal trigger
  const handleSMSUpgradeModalClose = React.useCallback(() => {
    setTriggerSMSUpgradeModal(0)
  }, [])

  useEffect(() => {
    const getData = async () => {
      // Use AdminGetProfileDetails if selectedUser is provided (admin view), otherwise use getProfileDetails (regular user)
      let user = selectedUser?.id 
        ? await AdminGetProfileDetails(selectedUser.id)
        : await getProfileDetails()
      if (user) {
        // AdminGetProfileDetails returns user directly, getProfileDetails returns { data: { data: user } }
        setUserLocalData(selectedUser?.id ? user : user.data.data)
        // console.log('user', user)
      }
    }

    getNumbers()
    getData()
    getCreditCost()
    getUniqueColumns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id]) // Only depend on selectedUser.id to avoid unnecessary re-runs

  // Fetch unique columns for tag autocomplete
  const getUniqueColumns = async () => {
    try {
      const columns = await getUniquesColumn()
      if (columns && Array.isArray(columns)) {
        setUniqueColumns(columns)
        // Refresh suggestions if there's a current input value
        if (tagInputValue.trim()) {
          const existingTags = selectedLeadsDetails?.tags || []
          const filtered = columns
            .filter((col) => {
              const colLower = col.toLowerCase()
              const valueLower = tagInputValue.toLowerCase()
              return colLower.includes(valueLower)
            })
            .filter((col) => !existingTags.includes(col))
          setTagSuggestions(filtered)
          setShowTagSuggestions(filtered.length > 0)
        }
      }
    } catch (error) {
      console.error('Error fetching unique columns:', error)
    }
  }

  // get the credit cost
  const getCreditCost = async () => {
    let data = {
      leadCount: 100,
      type: 'enrichment',
    }
    let creditCost = await calculateCreditCost(data)
    if (creditCost) {
      setCreditCost(creditCost)
    }
  }

  useEffect(() => {
    if (!selectedLead) return
    getLeadDetails(selectedLead)

    // Remove or comment out the console.log to avoid build errors
    // console.log("pipelineId", pipelineId);

    if (pipelineId) {
      // //console.log;
      getStagesList(selectedLead)
    }
    getMyteam()
  }, [selectedLead, pipelineId])

  //code for getting teammebers
  const getMyteam = async () => {
    //console.log;
    try {
      setGetTeamLoader(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)
        let path = Apis.getTeam
        
        // Add userId parameter if selectedUser is provided (admin view)
        if (selectedUser?.id) {
          path = path + `?userId=${selectedUser.id}`
          console.log('Api path for getting team members for selected user:', path)
        }

        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setGetTeamLoader(false)

          if (response.data.status === true) {
            //console.log;
            console.log('🔍 [LeadDetails] getMyteam response:', {
              myTeam: response.data.data,
              myTeamAdmin: response.data.admin,
              myTeamStructure: response.data.data?.map(t => ({
                id: t.id,
                invitedUserId: t.invitedUserId,
                invitedUser_id: t.invitedUser?.id,
                name: t.name || t.invitedUser?.name,
              })),
            })
            setMyTeam(response.data.data)
            setMyTeamAdmin(response.data.admin)
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      setGetTeamLoader(false)

      // //console.log;
    }
  }

  //function to assign lead to the team
  const handleAssignLeadToTeammember = async (item) => {
    try {
      //console.log;
      handleClosePopup()
      setGlobalLoader(true)
      console.log('🔵 [LeadDetails] Item passed is', item)
      console.log('🔵 [LeadDetails] Item details:', {
        itemId: item.id,
        itemInvitedUserId: item.invitedUserId,
        itemInvitedUser_id: item.invitedUser?.id,
        itemName: item.name,
      })
      let ApiData = null
      if (item.invitedUserId) {
        ApiData = {
          leadId: selectedLeadsDetails.id,
          teamMemberUserId: item.invitedUserId,
        }
      } else {
        ApiData = {
          leadId: selectedLeadsDetails.id,
          teamMemberUserId: item.id,
        }
      }
      console.log('🔵 [LeadDetails] Api data to send in api is', ApiData)
      // selectedLeadsDetails.id,
      //   item.invitingUserId
      // return;
      let response = await AssignTeamMember(ApiData)
      console.log('🔵 [LeadDetails] Assignment response:', response?.data)
      console.log('🔵 [LeadDetails] Response status:', response?.data?.status)
      console.log('🔵 [LeadDetails] Response message:', response?.data?.message)
      if (response && response.data && response.data.status === true) {
        let updatedLead = null
        setSelectedLeadsDetails((prevData) => {
          // Filter duplicates before adding
          const existingIds = (prevData.teamsAssigned || []).map(u => u.id || u.invitedUserId)
          const itemId = item.id || item.invitedUserId

          // Only add if not already assigned
          if (!existingIds.includes(itemId)) {
            updatedLead = {
              ...prevData,
              teamsAssigned: [...(prevData.teamsAssigned || []), item],
            }
            return updatedLead
          }
          updatedLead = prevData
          return prevData
        })
        // Call callback with updated lead data
        if (updatedLead && leadAssignedTeam) {
          leadAssignedTeam(item, updatedLead)
        }
      } else if (response && response.data && response.data.status === false) {
        // Show error message if assignment failed (e.g., duplicate)
        showSnackbar(response.data.message || 'Failed to assign team member', SnackbarTypes.Error)
      }
      //console.log;
    } catch (error) {
      // console.error("Error occured is", error);
    } finally {
      setGlobalLoader(false)
      handleClosePopup()
    }
  }

  //function to unassign lead from team member
  const handleUnassignLeadFromTeammember = async (userId) => {
    try {
      setGlobalLoader(true)
      console.log('Unassigning user with ID:', userId)

      let ApiData = {
        leadId: selectedLeadsDetails.id,
        teamMemberUserId: userId,
      }

      console.log('Api data to send in unassign api is', ApiData)

      let response = await UnassignTeamMember(ApiData)

      if (response && response.data && response.data.status === true) {
        // Remove the user from the assigned list
        let updatedLead = null
        setSelectedLeadsDetails((prevData) => {
          const filteredTeams = (prevData.teamsAssigned || []).filter((user) => {
            // Check all possible ID fields to match the userId
            const userIdentifier = user.id || user.invitedUserId || user.invitedUser?.id
            // Convert both to strings for comparison to handle type mismatches
            return String(userIdentifier) !== String(userId)
          })

          updatedLead = {
            ...prevData,
            teamsAssigned: filteredTeams,
          }

          return updatedLead
        })

        // Call callback with updated lead data to sync with parent component
        // Use the updatedLead value we just created
        if (updatedLead && leadAssignedTeam) {
          leadAssignedTeam(null, updatedLead)
        }

        showSnackbar(response.data.message || 'Team member unassigned successfully', SnackbarTypes.Success)
      } else if (response && response.data && response.data.status === false) {
        // Show error message if unassignment failed
        showSnackbar(response.data.message || 'Failed to unassign team member', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error occurred in unassign lead from team member:', error)
      showSnackbar('Failed to unassign team member. Please try again.', SnackbarTypes.Error)
    } finally {
      setGlobalLoader(false)
    }
  }

  const getNumbers = async () => {
    console.log('getNumbers is called')
    
    // Use selectedUser prop if provided (admin view), otherwise fall back to localStorage (existing behavior)
    let userId = null
    if (selectedUser?.id) {
      // Use prop if provided
      userId = selectedUser.id
    } else {
      // Fall back to localStorage (existing behavior for backward compatibility)
      let data = localStorage.getItem('selectedUser')
      console.log('data', data)
      console.log('typeof data', typeof data)

      // Fix: Check if data exists and is not "undefined" string, then safely parse
      if (data && data !== 'undefined' && data !== 'null') {
        try {
          const parsedUser = JSON.parse(data)
          console.log('selected user data from local', parsedUser)
          userId = parsedUser?.id
        } catch (error) {
          console.error('Error parsing selectedUser from localStorage:', error)
        }
      }
    }

    setPhoneLoading(true)
    let num = await getA2PNumbers(userId)
    if (num) {
      setPhoneNumbers(num)
    }
    setPhoneLoading(false)
  }
  //function to handle stages dropdown selection
  const handleStageChange = (selected) => {
    const value = typeof selected === 'object' ? selected?.value || selected?.stageTitle : selected
    if (!value) return
    setSelectedStage(value)
  }

  const showPerplexityDetails = activeTab === 'perplexity'
  const showKYCDetails = activeTab === 'kyc'
  const showAcitivityDetails = activeTab === 'activity'
  const showNotesDetails = activeTab === 'notes'

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setShowCustomVariables(false)
  }

  //function to update stage
  const updateLeadStage = async (stage) => {
    try {
      // //console.log;
      let AuthToken = null
      setUpdateLeadLoader(true)

      const localDetails = localStorage.getItem('User')
      if (localDetails) {
        const Data = JSON.parse(localDetails)
        //// //console.log;
        AuthToken = Data.token
      }

      const ApiData = {
        leadId: selectedLead,
        stageId: stage.id,
      }

      // //console.log;

      const ApiPath = Apis.updateLeadStageApi
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        setUpdateLeadLoader(false)
        if (response.data.status === true) {
          showSnackbar(response.data.message, SnackbarTypes.Success)
          leadStageUpdated(stage)
        } else if (response.data.status === false) {
          showSnackbar(response.data.message, SnackbarTypes.Error)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
      setUpdateLeadLoader(false)
    } finally {
      // //console.log;
    }
  }

  //code for popover

  const handleShowPopup = (event) => {
    setAnchorEl(event.currentTarget)
    //// //console.log;
  }

  const handleClosePopup = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  //function to get the lead detils
  const getLeadDetails = async (selectedLead) => {
    try {
      setInitialLoader(true)
      // //console.log;
      let AuthToken = null

      const localDetails = localStorage.getItem('User')
      if (localDetails) {
        const Data = JSON.parse(localDetails)
        //// //console.log;
        AuthToken = Data.token
      }

      // //console.log;

      const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedLead}`

      console.log('Api path is ', ApiPath)

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // console.log("lead details are", response.data.data)
        let dynamicColumns = []
        dynamicColumns = [
          ...response?.data?.columns,
          // { title: "Tag" },
          {
            title: 'More',
            idDefault: false,
          },
        ]
        // setLeadColumns(response.data.columns);
        setSelectedLeadsDetails(response.data.data)
        console.log('🔍 [LeadDetails] Lead details response:', response.data.data)
        console.log('🔍 [LeadDetails] Teams assigned count:', response.data.data?.teamsAssigned?.length || 0)
        console.log('🔍 [LeadDetails] Teams assigned details:', {
          teamsAssigned: response.data.data?.teamsAssigned,
          teamsAssignedStructure: response.data.data?.teamsAssigned?.map(t => ({
            id: t.id,
            invitedUserId: t.invitedUserId,
            invitedUser_id: t.invitedUser?.id,
            invitedUser_name: t.invitedUser?.name,
            name: t.name || t.invitedUser?.name,
            fullObject: t, // Log full object for debugging
          })),
        })
        console.log('🔍 [LeadDetails] Full teamsAssigned array:', JSON.stringify(response.data.data?.teamsAssigned, null, 2))
        setSelectedStage(response?.data?.data?.stage?.stageTitle)
        // setSelectedStage(response?.data?.data?.stage?.stageTitle);
        setLeadColumns(dynamicColumns)
        setcolumnsLength(response?.data?.columns || [])
        setNoteDetails(response.data?.data?.notes || [])
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setInitialLoader(false)
      // //console.log;
    }
  }

  // Handler to refresh notes after add/edit/delete
  const handleNotesUpdated = async () => {
    if (!selectedLead) return
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
      if (response && response.data) {
        setNoteDetails(response.data?.data?.notes || [])
      }
    } catch (error) {
      console.error('Error refreshing notes:', error)
    }
  }

  //function to get the stages list using pipelineId
  const getStagesList = async () => {
    try {
      let AuthToken = null
      setStagesListLoader(true)
      const localDetails = localStorage.getItem('User')
      if (localDetails) {
        const Data = JSON.parse(localDetails)
        //console.log;
        AuthToken = Data.token
      }

      // //console.log;

      const ApiPath = `${Apis.getStagesList}?pipelineId=${pipelineId}&liteResource=true`

      // console.log("ApiPath", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // setStagesListLoader(false);
        //console.log;
        if (response.data.status === true) {
          // console.log("stages list are", response.data.data.stages);
          setStagesList(response.data.data.stages)
        } else {
          // setShowErrorSnack(response.data.message);
          console.log('Error in stages list', response.data.message)
          // setShowErrorSnack2(true);
        }
      }
    } catch (error) {
      console.error('Error occured in stage list api is', error)
    } finally {
      setStagesListLoader(false)
      // //console.log;
    }
  }

  // Note handlers - REMOVED: Now handled by NotesTabCN component

  //function to format the phone number
  //function to format the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith('+') ? rawNumber : `+${rawNumber}`,
    )
    //// //console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : 'Invalid phone number'
  }

  //function to truncate email to 11 characters
  const truncateEmail = (email) => {
    if (!email) return ''
    return email.length > 11 ? email.slice(0, 11) + '...' : email
  }

  //function to show the callStatus
  const checkCallStatus = (callActivity) => {
    let callStatus = null
    let item = callActivity
    // callActivity.forEach((item) => {
    if (item.status === 'completed') {
      // Check for hotlead, humancalldrop, and dnd
      if (item.hotlead || item.humancalldrop || item.dnd) {
        // console.log(
        //   "Status is completed with the following additional information:"
        // );
        if (item.hotlead === true) {
          // //console.log;
          callStatus = 'Hot Lead'
        }
        if (item.humancalldrop === true) {
          // //console.log;
          callStatus = 'Human Call Drop'
        }
        if (item.dnd === true) {
          // //console.log;
          callStatus = 'DND'
        }
        if (item.notinterested) {
          // //console.log;
          callStatus = 'Not Interested'
        }
      } else {
        callStatus = item.status
        // console.log(
        //   "Status is completed, but no special flags for lead ID:",
        //   item.leadId
        // );
      }
    } else {
      // console.log(
      //   "Other status for lead ID:",
      //   item.leadId,
      //   "Status:",
      //   item.status
      // );
      callStatus = item.status
    }
    // });
    return callStatus
  }

  const ShowReadMoreButton = (column, item) => {
    let filteredColumns = column
    const { title } = filteredColumns

    if (item) {
      switch (title) {
        case 'Name':
        case 'Date':
        case 'Phone':
        case 'Stage':
          return false
        default:
          const value = `${item[title]}`

          if (value.length > 60) {
            return true
          } else {
            return false
          }
      }
    }
  }

  //code for custom variables
  const getDetailsColumnData = (column, item) => {
    // console.log("Testing colum data is", item);
    let filteredColumns = column
    const { title } = filteredColumns
    if (item) {
      switch (title) {
        case 'Name':
          return <div></div>
        case 'Date':
          return item.createdAt ? GetFormattedDateString(item?.createdAt) : '-'
        case 'Phone':
          return '-'
        case 'Stage':
          return item.stage ? item.stage.stageTitle : 'No Stage'
        default:
          const value = `${item[title]}`
          //console.log;
          if (typeof value === 'object' && value !== null) {
            // Handle objects gracefully
            return JSON.stringify(value) // Convert to string or handle as needed
          }
          const initialTextLength = Math.ceil(
            value.length > 20 ? 20 : value.length,
          ) // 50 characters
          var dots = value.length > 20 ? '...' : ''
          const initialText = expandedCustomFields.includes(title)
            ? value
            : value.slice(0, initialTextLength)
          return initialText + dots || '-'
      }
    }
  }

  //fucntion to ShowMore ActivityData transcript text
  const handleShowMoreActivityData = (item) => {
    // setIsExpanded(!isExpanded);
    console.log('item', item)
    if (item.callOutcome === 'No Answer') {
      return
    }
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

  //code for adding tag
  const handleAddTag = async (tagValue) => {
    if (!tagValue || !tagValue.trim()) return

    const trimmedTag = tagValue.trim()

    // Check if tag already exists
    if (selectedLeadsDetails?.tags?.includes(trimmedTag)) {
      showSnackbar('Tag already exists', SnackbarTypes.Error)
      setTagInputValue('')
      return
    }

    try {
      setAddTagLoader(true)
      let AuthToken = null

      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        AuthToken = localData.token
      }

      // Prepare updated tags array
      const updatedTags = [...(selectedLeadsDetails.tags || []), trimmedTag]

      const ApiData = {
        leadId: selectedLeadsDetails.id,
        tag: trimmedTag,
        smartListId: selectedLeadsDetails.sheetId,
        phoneNumber: selectedLeadsDetails.phone
      }

      console.log('ApiData for add tag is', ApiData)

      const ApiPath = Apis.updateLead
      const response = await axios.put(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          console.log('response of add tag api is', response.data)
          setSelectedLeadsDetails((prevDetails) => ({
            ...prevDetails,
            tags: updatedTags,
          }))
          setTagInputValue('')
          setShowTagSuggestions(false)
          showSnackbar('Tag added successfully', SnackbarTypes.Success)
        } else {
          showSnackbar(response.data.message || 'Failed to add tag', SnackbarTypes.Error)
        }
      }
    } catch (error) {
      console.error('Error occurred in update lead api:', error)
      showSnackbar('Failed to add tag. Please try again.', SnackbarTypes.Error)
    } finally {
      setAddTagLoader(false)
    }
  }

  // Handle tag input change with autocomplete
  const handleTagInputChange = (e) => {
    const value = e.target.value
    setTagInputValue(value)

    if (value.trim()) {
      // Filter unique columns that match the input
      // Also exclude tags that already exist
      const existingTags = selectedLeadsDetails?.tags || []
      const filtered = uniqueColumns
        .filter((col) => {
          const colLower = col.toLowerCase()
          const valueLower = value.toLowerCase()
          // Match if column contains the input value
          return colLower.includes(valueLower)
        })
        .filter((col) => !existingTags.includes(col)) // Exclude existing tags

      setTagSuggestions(filtered)
      setShowTagSuggestions(filtered.length > 0)
    } else {
      setTagSuggestions([])
      setShowTagSuggestions(false)
    }
  }

  // Handle key events for tag input
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault()
      const value = tagInputValue.trim()
      if (value) {
        handleAddTag(value)
      }
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false)
    }
  }

  // Handle tag suggestion click
  const handleTagSuggestionClick = (suggestion) => {
    handleAddTag(suggestion)
  }

  //code for del tag api
  const handleDelTag = async (tag) => {
    try {
      // //console.log;
      setDelTagLoader(tag)

      let AuthToken = null

      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        AuthToken = localData.token
      }

      // //console.log;

      const ApiData = {
        tag: tag,
        leadId: selectedLeadsDetails.id,
      }

      const ApiPath = Apis.delLeadTag
      // //console.log;
      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('response of del tag api is', response)
        if (response.data.status === true) {
          console.log('response of del tag api is true')

          const updatedTags = selectedLeadsDetails.tags.filter(
            (item) => item !== tag,
          )
          setSelectedLeadsDetails((prevDetails) => ({
            ...prevDetails,
            tags: updatedTags,
          }))
        }
      }
    } catch (error) {
      console.error('Error occured in api is:', error)
    } finally {
      setDelTagLoader(null)
    }
  }

  //fucntion to read more transcript text
  const handleReadMoreToggle = (item) => {
    // setIsExpanded(!isExpanded);

    // console.log('item', item)

    setIsExpanded(item)
    // setIsExpanded((prevIds) => {
    //   if (prevIds.includes(item.id)) {
    //     // Unselect the item if it's already selected
    //     return prevIds.filter((prevId) => prevId !== item.id);
    //   } else {
    //     // Select the item if it's not already selected
    //     return [...prevIds, item.id];
    //   }
    // });
  }

  const handleDeleteLead = async () => {
    try {
      // handleDelLead(selectedLeadsDetails);
      // return;
      setDelLeadLoader(true)

      let AuthToken = null

      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        AuthToken = localData.token
      }

      const ApiData = {
        leadId: selectedLeadsDetails.id,
        isPipeline: isPipeline,
      }

      // //console.log;

      const ApiPath = Apis.deleteLead

      // const localLead = localStorage.getItem("")

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
          showSnackbar(response.data.message, SnackbarTypes.Success)
          setShowDetailsModal(false)
          handleDelLead(selectedLeadsDetails)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setDelLeadLoader(false)
    }
  }

  const styles = {
    modalsStyle: {
      // height: "auto",
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-50%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
    heading2: {
      fontsize: 15,
      fontWeight: '500',
      color: '#000000100',
    },
    subHeading: {
      fontsize: 12,
      fontWeight: '500',
      color: '#15151560',
    },
  }

  useEffect(() => {
    getGoogleAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id]) // Only depend on selectedUser.id to avoid unnecessary re-runs

  const getGoogleAccounts = async () => {
    // Use selectedUser.id if provided (admin view), otherwise call without userId (existing behavior)
    let accounts = await getGmailAccounts(selectedUser?.id)
    setGoogleAccounts(accounts)
    setSelectedGoogleAccount(accounts[0] || null)
  }

  function getExtraColumsCount(columns) {
    // //console.log
    let count = 0
    // let ExcludedColumns = [
    //   "name",
    //   "phone",
    //   "email",
    //   "status",
    //   "stage",
    //   // "address",
    // ];
    let ExcludedColumns = [
      'name',
      'phone',
      'email',
      'status',
      'stage',
      'address',
    ]
    for (const c of columns) {
      if (!c.isDefault) {
        if (!ExcludedColumns.includes(c?.title?.toLowerCase() || '')) {
          count += 1
        }
      }
    }
    // //console.log;

    return count
  }

  const handleEnrichLead = async () => {
    try {
      setLoading(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)

        let apidata = {
          leadId: selectedLeadsDetails.id,
        }
        // console.log('apidata', apidata)
        // console.log('u.token', u.token)

        const response = await axios.post(Apis.enrichLead, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          setLoading(false)
          if (response.data.status === true) {
            // console.log('response of enrich lead aip is', response.data.data)
            setSelectedLeadsDetails(response.data.data)
            let credits = u.user.enrichCredits

            showSnackbar(response.data.message, SnackbarTypes.Success)

            if (credits == 0) {
              u.user.enrichCredits = 99
            } else {
              u.user.enrichCredits = credits - 1
            }

            localStorage.setItem('User', JSON.stringify(u))

            setshowConfirmPerplexity(false)
          } else {
            showSnackbar(response.data.message, SnackbarTypes.Error)

            console.log('response.data.message', response.data.message)
          }
        }
      }
    } catch (e) {
      setLoading(false)
      console.log('error in enrich lead is', e)
    } finally {
      setLoading(false)
    }
  }

  // console.log('enrichData', enrichData)


  const handleCopy = async (id) => {
    try {
      await navigator.clipboard.writeText(id)
      showSnackbar('Call ID copied to the clipboard.', SnackbarTypes.Success)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const deleteCallLog = async (item) => {
    try {
      setdelCallLoader(true)
      let data = localStorage.getItem('User')
      if (data) {
        let u = JSON.parse(data)
        let path = Apis.deleteCallLog

        let apiData = {
          id: item.id,
        }

        const response = await axios.post(path, apiData, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          if (response.data) {
            console.log('delete call log api data is', response.data.data)
            let call = response.data.data
            setSelectedLeadsDetails((prev) => ({
              ...prev,
              callActivity: prev.callActivity.filter(
                (log) => log.id !== item.id,
              ),
            }))

            setShowConfirmationPopup(false)

            showSnackbar('Call activity deleted', SnackbarTypes.Success)
          }
        }
      }
    } catch (e) {
      console.log('error in call log delete api is', e)
    } finally {
      setdelCallLoader(false)
    }
  }


  // Send email API function
  const sendEmailToLead = async (emailData) => {
    try {
      console.log('Sending email to lead', emailData)
      console.log('gmailAccountId', emailData.gmailAccountId)
      setSendEmailLoader(true)

      const localData = localStorage.getItem('User')
      if (!localData) {
        throw new Error('User not found')
      }

      const userData = JSON.parse(localData)
      const formData = new FormData()

      // Add required fields
      formData.append('leadId', selectedLeadsDetails?.id)
      formData.append('subject', emailData.subject || '')
      formData.append('content', emailData.content || '')
      formData.append('ccEmails', JSON.stringify(emailData.ccEmails || []))
      formData.append('bccEmails', JSON.stringify(emailData.bccEmails || []))
      formData.append(
        'emailAccountId',
        JSON.stringify(emailData.gmailAccountId || []),
      )

      // Add attachments if any
      if (emailData.attachments && emailData.attachments.length > 0) {
        emailData.attachments.forEach((file) => {
          formData.append('attachments', file)
        })
      }

      const response = await axios.post(Apis.sendEmailToLead, formData, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.status === true) {
        showSnackbar('Email sent successfully!', SnackbarTypes.Success)
        setShowMessageModal(false)
      } else {
        showSnackbar(response.data.message || 'Failed to send email', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      showSnackbar('Failed to send email. Please try again.', SnackbarTypes.Error)
    } finally {
      setSendEmailLoader(false)
    }
  }

  // Send SMS API function
  const sendSMSToLead = async (smsData) => {
    try {
      console.log('Sending SMS to lead', smsData)
      setSendSMSLoader(true)

      const localData = localStorage.getItem('User')
      if (!localData) {
        throw new Error('User not found')
      }

      const userData = JSON.parse(localData)
      const formData = new FormData()

      // Add required fields
      formData.append('leadPhone', selectedLeadsDetails?.phone || '')
      formData.append('content', smsData.content || '')
      formData.append('phone', smsData.phone || '')
      formData.append('leadId', selectedLeadsDetails?.id || '')

      //print form data
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`)
      })
      const response = await axios.post(Apis.sendSMSToLead, formData, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.status === true) {
        showSnackbar('Text sent successfully!', SnackbarTypes.Success)
        setShowMessageModal(false)
      } else {
        showSnackbar(response.data.message || 'Failed to send SMS', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      showSnackbar('Failed to send SMS. Please try again.', SnackbarTypes.Error)
    } finally {
      setSendSMSLoader(false)
    }
  }

  const startDialerFlow = () => {
    if (!selectedLeadsDetails?.phone) {
      setShowSnackMsg({
        type: SnackbarTypes.Error,
        message: 'No phone number available for this lead',
        isVisible: true,
      })
      return
    }

    // Format phone number to E.164 format if needed
    let phoneNumber = selectedLeadsDetails.phone
    try {
      // Try to parse and format the phone number
      const parsed = parsePhoneNumberFromString(phoneNumber, 'US')
      if (parsed && parsed.isValid()) {
        phoneNumber = parsed.format('E.164')
      } else {
        // If parsing fails, try to clean and add + if missing
        phoneNumber = phoneNumber.replace(/\D/g, '')
        if (phoneNumber && !phoneNumber.startsWith('+')) {
          phoneNumber = '+' + phoneNumber
        }
      }
    } catch (error) {
      console.warn('Error parsing phone number:', error)
      // Use phone number as-is if parsing fails
    }

    // Open dialer modal with the phone number
    dispatch(openDialer({
      leadId: selectedLeadsDetails?.id,
      leadName: selectedLeadsDetails?.name || selectedLeadsDetails?.firstName,
      phoneNumber: selectedLeadsDetails?.phone || '',
      selectedLeadDetails: selectedLeadsDetails, // Full object
    }))
  }

  // Helper function to format objections from JSON
  const formatObjections = (objectionsJson) => {
    if (!objectionsJson) return 'None'
    try {
      const objections = typeof objectionsJson === 'string'
        ? JSON.parse(objectionsJson)
        : objectionsJson

      // Handle "None" string
      if (typeof objections === 'string' && objections.toLowerCase() === 'none') {
        return 'None'
      }

      if (!Array.isArray(objections) || objections.length === 0) {
        return 'None'
      }

      return objections
        .filter((obj) => obj && obj !== 'None' && obj !== 'none')
        .map((obj, idx) => {
          if (typeof obj === 'string') {
            // Format: "Category: Price | What was said: Not in budget"
            const parts = obj.split('|')
            if (parts.length >= 2) {
              return `${parts[0].trim()}\n${parts[1].trim()}`
            }
            return obj
          }
          return String(obj)
        })
        .join('\n\n')
    } catch (error) {
      // If parsing fails, return as string if it's not "None"
      if (typeof objectionsJson === 'string' && objectionsJson.toLowerCase() !== 'none') {
        return objectionsJson
      }
      return 'None'
    }
  }

  // Helper function to format next steps from JSON
  const formatNextSteps = (nextStepsJson) => {
    if (!nextStepsJson) return 'No next steps'
    try {
      const nextSteps = typeof nextStepsJson === 'string'
        ? JSON.parse(nextStepsJson)
        : nextStepsJson
      if (!Array.isArray(nextSteps) || nextSteps.length === 0) {
        return 'No next steps'
      }
      return nextSteps
        .filter((step) => step && step.trim())
        .map((step, idx) => `${idx + 1}. ${step}`)
        .join('\n')
    } catch (error) {
      // If parsing fails, return as string
      if (typeof nextStepsJson === 'string') {
        return nextStepsJson
      }
      return 'No next steps'
    }
  }

  // Helper function to get temperature icon based on value
  const getTemperatureIcon = (temperature) => {
    if (!temperature) return null
    const tempLower = temperature.toLowerCase()
    if (tempLower.includes('hot')) {
      return <Flame size={16} color="#ef4444" />
    } else if (tempLower.includes('warm')) {
      return <Sun size={16} color="#f59e0b" />
    } else if (tempLower.includes('cold')) {
      return <Snowflake size={16} color="#3b82f6" />
    }
    return <Sun size={16} color="#6b7280" />
  }


  const startCallAction = () => {
    setSendActionAnchor(null)
    startDialerFlow()
  }
  const handleSendAction = (opt) => {
    if (opt.value === 'email') {
      if (!emailCapability.hasAccess) {
        // Trigger upgrade modal if user doesn't have access
        handleEmailUpgradeClick()
        return
      }
      setMessageModalMode('email')
      
      console.log("Selected User in LeadDetails", selectedUser)
      setShowMessageModal(true)
    } else if (opt.value === 'call') {
      if (!dialerCapability.hasAccess) {
        // Trigger upgrade modal if user doesn't have access
        handleUpgradeClick()
        return
      }
      startCallAction()
    } else if (opt.value === 'sms') {
      if (!smsCapability.hasAccess) {
        // Trigger upgrade modal if user doesn't have access
        handleSMSUpgradeClick()
        return
      }
      setMessageModalMode('sms')
      setShowMessageModal(true)
    }
  }

  const mainContent = (
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
      <div className="flex flex-col w-full h-full  py-2 px-1 rounded-xl">
        <div className="w-full flex flex-col items-center h-full">

          <div className="w-full">
            {initialLoader ? (
              <div className="w-full flex flex-row items-center justify-center mt-24">
                <CircularProgress size={45} thickness={2} />
              </div>
            ) : (
              <div
                className="h-[95vh] overflow-auto w-full"
                style={{ scrollbarWidth: 'none' }}
              >
                <div
                  className="flex  flex-col w-full"
                  style={{
                    padding: 20,
                    paddingInline: 30,
                  }}
                >
                  {!renderInline && (
                    <div className="w-full flex flex-row items-center justify-between pb-4 border-b">
                      <div style={{ fontSize: 18, fontWeight: '700' }}>
                        More Info
                      </div>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false)
                        }}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  )}
                  {/* <div> */}
                    <div className="flex flex-row items-start justify-between mt-4  w-full">
                    <div className="flex flex-col items-start  w-full">
                      <div className="flex flex-row items-between justify-between w-full">
                        <div className="flex flex-row items-center gap-3">
                          {/* {selectedLeadsDetails?.agent ? (
                            <div className="h-[32px] w-[32px]">
                              {getAgentsListImage(
                                selectedLeadsDetails?.agent?.agents?.[0]?.agentType === 'outbound'
                                  ? selectedLeadsDetails?.agent?.agents?.[0]
                                  : selectedLeadsDetails?.agent?.agents?.[1],
                                32,
                                32,
                              )}
                            </div>
                          ) : (
                            <div
                              className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                            // onClick={() => handleToggleClick(item.id)}
                            >
                              {selectedLeadsDetails?.firstName?.slice(0, 1) ||
                                '-'}
                            </div>
                          )} */}
                          <Avatar className="h-10 w-10 bg-red">
                            {selectedLeadsDetails?.avatar ? (
                              <AvatarImage src={selectedLeadsDetails?.avatar} alt={selectedLeadsDetails?.name} />
                            ) : (
                              <AvatarFallback className="text-md font-semibold">{selectedLeadsDetails?.firstName?.slice(0, 1) || 'L'}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <p className="truncate text-lg font-semibold leading-none text-foreground">
                              {selectedLeadsDetails?.firstName}
                            </p>
                            {/* Send Action Dropdown Button */}
                            <>
                              <DropdownCn
                                label="Send"
                                options={[
                                  {
                                    label: 'Email',
                                    value: 'email',
                                    icon: Mail,
                                    upgradeTag: (emailCapability.showUpgrade || emailCapability.showRequestFeature) ? (
                                      <UpgradeTag
                                        onClick={handleEmailUpgradeClick}
                                        requestFeature={emailCapability.showRequestFeature}
                                      />
                                    ) : null,
                                    showUpgradeTag: emailCapability.showUpgrade || emailCapability.showRequestFeature,
                                    disabled: !emailCapability.hasAccess,
                                    onUpgradeClick: handleEmailUpgradeClick,
                                  },
                                  {
                                    label: 'Call',
                                    value: 'call',
                                    icon: PhoneCall,
                                    upgradeTag: (dialerCapability.showUpgrade || dialerCapability.showRequestFeature) ? (
                                      <UpgradeTag
                                        onClick={handleUpgradeClick}
                                        requestFeature={dialerCapability.showRequestFeature}
                                      />
                                    ) : null,
                                    showUpgradeTag: dialerCapability.showUpgrade || dialerCapability.showRequestFeature,
                                    disabled: !dialerCapability.hasAccess,
                                    onUpgradeClick: handleUpgradeClick,
                                  },
                                  {
                                    label: 'Text',
                                    value: 'sms',
                                    icon: MessageSquareDot,
                                    upgradeTag: (smsCapability.showUpgrade || smsCapability.showRequestFeature) ? (
                                      <UpgradeTag
                                        onClick={handleSMSUpgradeClick}
                                        requestFeature={smsCapability.showRequestFeature}
                                      />
                                    ) : null,
                                    showUpgradeTag: smsCapability.showUpgrade || smsCapability.showRequestFeature,
                                    disabled: !smsCapability.hasAccess,
                                    onUpgradeClick: handleSMSUpgradeClick,
                                  },
                                ]}
                                onSelect={handleSendAction}
                              />
                              {/* Render upgrade modals outside dropdown to avoid re-render issues - hideTag=true so it doesn't render the button */}
                              {(dialerCapability.showUpgrade || dialerCapability.showRequestFeature) && (
                                <UpgradeTagWithModal
                                  reduxUser={effectiveUser}
                                  setReduxUser={setReduxUser}
                                  requestFeature={dialerCapability.showRequestFeature}
                                  externalTrigger={triggerUpgradeModal > 0}
                                  onModalClose={handleUpgradeModalClose}
                                  hideTag={true}
                                  selectedUser={memoizedSelectedUserForUpgrade}
                                />
                              )}
                              {(emailCapability.showUpgrade || emailCapability.showRequestFeature) && (
                                <UpgradeTagWithModal
                                  reduxUser={effectiveUser}
                                  setReduxUser={setReduxUser}
                                  requestFeature={emailCapability.showRequestFeature}
                                  externalTrigger={triggerEmailUpgradeModal > 0}
                                  onModalClose={handleEmailUpgradeModalClose}
                                  hideTag={true}
                                  selectedUser={memoizedSelectedUserForUpgrade}
                                  featureTitle="Enable Emails"
                                />
                              )}
                              {(smsCapability.showUpgrade || smsCapability.showRequestFeature) && (
                                <UpgradeTagWithModal
                                  reduxUser={effectiveUser}
                                  setReduxUser={setReduxUser}
                                  requestFeature={smsCapability.showRequestFeature}
                                  externalTrigger={triggerSMSUpgradeModal > 0}
                                  onModalClose={handleSMSUpgradeModalClose}
                                  hideTag={true}
                                  selectedUser={memoizedSelectedUserForUpgrade}
                                />
                              )}
                            </>
                          </div>





                          {/* Scoring Progress */}
                          {selectedLeadsDetails?.scoringDetails &&
                            selectedLeadsDetails?.scoringDetails?.questions
                              ?.length > 0 && (
                              <ScoringProgress
                                value={
                                  selectedLeadsDetails?.scoringDetails
                                    ?.totalScore
                                }
                                maxValue={10}
                                questions={
                                  selectedLeadsDetails?.scoringDetails
                                    ?.questions
                                }
                                showTooltip={true}
                                tooltipTitle="Results"
                              />
                            )}

                          {selectedLeadsDetails?.isOnDncList && (
                            <div className="rounded-full bg-red justify-center items-center  color-black p-1 px-2">
                              DNC
                            </div>
                          )}
                        </div>
                        {/* Stage Select Dropdown */}
                        <div className="flex flex-col align-self-end gap-[5px] ">
                          <div className="flex flex-row items-center gap-2">
                            {/* <Image
                              src={"/assets/arrow.png"}
                              height={16}
                              width={16}
                              alt="man"
                            /> */}
                            <div
                              className="text-end flex flex-row items-center gap-1"
                              style={styles.paragraph}
                            >
                              {stagesListLoader ? (
                                <CircularProgress size={25} />
                              ) : (
                                <>
                                  {/* <div
                                  className="h-[10px] w-[10px] rounded-full"
                                  style={{
                                    backgroundColor:
                                      selectedLeadsDetails?.stage
                                        ?.defaultColor,
                                  }}
                                ></div> */}

                                  {updateLeadLoader ? (
                                    <CircularProgress size={20} />
                                  ) : (

                                    <SelectStageDropdown
                                      selectedStage={selectedStage}
                                      handleStageChange={handleStageChange}
                                      stagesList={stagesList}
                                      updateLeadStage={updateLeadStage}
                                      chevronIcon={ChevronDown}
                                    />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mt-2">
                          {selectedLeadsDetails?.email && <InfoRow icon={<MailIcon className="h-4 w-4" />}>{selectedLeadsDetails?.email}</InfoRow>}
                          {selectedLeadsDetails?.phone && <InfoRow icon={<PhoneIcon className="h-4 w-4" />}>{selectedLeadsDetails?.phone}</InfoRow>}
                          {selectedLeadsDetails?.address && <InfoRow icon={<MapPinIcon className="h-4 w-4" />}>{selectedLeadsDetails?.address}</InfoRow>}
                          <InfoRow icon={<WorkflowIcon className="h-4 w-4" />}>
                            {selectedLeadsDetails?.pipeline?.title ||
                              selectedLeadsDetails?.pipeline?.name ||
                              selectedLeadsDetails?.pipeline ||
                              '-'}
                          </InfoRow>
                          {selectedLeadsDetails?.booking && <div className="flex flex-row items-center gap-2">
                            <InfoRow icon={<CalendarIcon className="h-4 w-4" />}>{GetFormattedDateString(selectedLeadsDetails?.booking?.datetime, true)}</InfoRow>
                            <TagPill label={`${selectedLeadsDetails?.booking?.duration} min`} />
                          </div>}
                          <div className="flex items-center gap-2">
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                            <TagManagerCn
                              tags={selectedLeadsDetails?.tags || []}
                              tagInputRef={tagInputRef}
                              tagInputValue={tagInputValue}
                              onInputChange={handleTagInputChange}
                              onInputKeyDown={handleTagInputKeyDown}
                              showSuggestions={showTagSuggestions}
                              setShowSuggestions={setShowTagSuggestions}
                              tagSuggestions={tagSuggestions}
                              onSuggestionClick={handleTagSuggestionClick}
                              addTagLoader={addTagLoader}
                            onRemoveTag={handleDelTag}
                            delTagLoader={DelTagLoader}
                            onRefreshSuggestions={getUniqueColumns}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                          {/* <Avatar className="h-8 w-8">
                              {selectedLeadsDetails?.assignee?.avatar ? (
                                <AvatarImage src={selectedLeadsDetails?.assignee.avatar} alt={selectedLeadsDetails?.assignee.name} />
                              ) : (
                                <AvatarFallback>{selectedLeadsDetails?.assignee?.name?.[0] || 'A'}</AvatarFallback>
                            )}
                          </Avatar> */}
                            <TeamAssignDropdownCn
                              label="Assign"
                              teamOptions={[
                                ...(myTeamAdmin ? [myTeamAdmin] : []),
                                ...(myTeam || []),
                              ].map((tm) => {
                                // Get the team member ID - check all possible fields
                                // For myTeam items from TeamResource:
                                // - tm.id is the TeamModel id (NOT the user id)
                                // - tm.invitedUserId is the actual user ID
                                // - tm.invitedUser.id is also the actual user ID
                                // We need to use invitedUserId or invitedUser.id, NOT tm.id
                                const id = tm.invitedUserId || tm.invitedUser?.id || tm.id
                                
                                // Log the team member structure
                                console.log('🔍 [LeadDetails] Processing team member:', {
                                  tm: tm,
                                  tmId: tm.id,
                                  tmInvitedUserId: tm.invitedUserId,
                                  tmInvitedUser_id: tm.invitedUser?.id,
                                  finalId: id,
                                  tmName: tm.name || tm.invitedUser?.name,
                                })
                                
                                const isSelected = (selectedLeadsDetails?.teamsAssigned || []).some(
                                  (assigned) => {
                                    // Check all possible ID fields in the assigned team member
                                    const assignedId = assigned.id || assigned.invitedUserId || assigned.invitedUser?.id
                                    const matches = String(assignedId) === String(id)
                                    
                                    if (matches) {
                                      console.log('✅ [LeadDetails] Match found:', {
                                        teamMemberId: id,
                                        teamMemberName: tm.name || tm.invitedUser?.name,
                                        assignedId: assignedId,
                                        assignedName: assigned.name || assigned.invitedUser?.name,
                                        assignedFullObject: assigned,
                                      })
                                    }
                                    
                                    return matches
                                  }
                                )
                                
                                // Log for debugging
                                if (selectedLeadsDetails?.teamsAssigned && selectedLeadsDetails.teamsAssigned.length > 0) {
                                  console.log('🔍 [LeadDetails] Team member check:', {
                                    teamMemberId: id,
                                    teamMemberName: tm.name || tm.invitedUser?.name,
                                    isSelected: isSelected,
                                    teamsAssignedIds: selectedLeadsDetails.teamsAssigned.map(t => ({
                                      id: t.id,
                                      invitedUserId: t.invitedUserId,
                                      invitedUser_id: t.invitedUser?.id,
                                    })),
                                  })
                                }
                                
                                return {
                                  id,
                                  label: tm.name || tm.invitedUser?.name || 'Unknown',
                                  avatar: tm.thumb_profile_image || tm.invitedUser?.thumb_profile_image,
                                  selected: isSelected,
                                  raw: tm,
                                }
                              })}
                              onToggle={(teamId, team, shouldAssign) => {
                                if (shouldAssign) {
                                  handleAssignLeadToTeammember?.(team.raw || team)
                                } else {
                                  handleUnassignLeadFromTeammember?.(teamId)
                                }
                              }}
                              withoutBorder={true}
                            />
                          </div>
                            </div>
                        
                        
                      </div>

                    </div>

                    {/* <div className="w-full mt-3">
                      <div className="">
                        {globalLoader ? (
                          <CircularProgress size={25} />
                        ) : (
                          <LeadTeamsAssignedList
                            users={selectedLeadsDetails?.teamsAssigned || []}
                            onAssignClick={(event) => {
                              handleShowPopup(event)
                            }}
                            onRemoveClick={(userId) => {
                              handleUnassignLeadFromTeammember(userId)
                            }}
                          />
                        )}
                      </div>
                    </div> */}

                  <CustomFieldsCN
                    leadColumns={leadColumns}
                    selectedLeadsDetails={selectedLeadsDetails}
                    showCustomVariables={showCustomVariables}
                    onToggleCustomVariables={() => setShowCustomVariables(!showCustomVariables)}
                    expandedCustomFields={expandedCustomFields}
                    onToggleExpandField={(fieldTitle) => {
                      setExpandedCustomFields((prevFields) =>
                        prevFields.includes(fieldTitle)
                          ? prevFields.filter((field) => field !== fieldTitle)
                          : [...prevFields, fieldTitle]
                      )
                    }}
                  />

                    <AuthSelectionPopup
                      open={showAuthSelectionPopup}
                      onClose={() => setShowAuthSelectionPopup(false)}
                      onSuccess={() => {
                        setMessageModalMode('email')
                        setShowMessageModal(true)
                        setShowAuthSelectionPopup(false)
                      }}
                      setShowEmailTempPopup={(value) => {
                        if (value) {
                          setMessageModalMode('email')
                          setShowMessageModal(true)
                        }
                        setShowAuthSelectionPopup(false)
                      }}
                      showEmailTempPopup={showMessageModal && messageModalMode === 'email'}
                      selectedGoogleAccount={selectedGoogleAccount}
                      setSelectedGoogleAccount={(account) => {
                        setSelectedGoogleAccount(account)
                      }}
                    />

                    {/* Modal for All Emails */}
                    <Modal
                      open={showAllEmails}
                      onClose={() => setShowAllEmails(null)}
                      closeAfterTransition
                      BackdropProps={{
                        timeout: 1000,
                        sx: {
                          backgroundColor: '#00000020',
                          // //backdropFilter: "blur(20px)",
                        },
                      }}
                    >
                      <Box
                        className="lg:w-5/12 sm:w-full w-8/12"
                        sx={styles.modalsStyle}
                      >
                        <div className="flex flex-row justify-center w-full">
                          <div
                            className="sm:w-full w-full"
                            style={{
                              backgroundColor: '#ffffff',
                              padding: 20,
                              borderRadius: '13px',
                            }}
                          >
                            <div>
                              {selectedLeadsDetails?.emails.map(
                                (email, emailIndex) => {
                                  return (
                                    <div key={emailIndex}>
                                      <div
                                        className="flex flex-row items-center gap-2 px-1 mt-2 rounded-lg py-2 border border-[#00000020]"
                                        style={styles.paragraph}
                                      >
                                        <Image
                                          src={'/assets/power.png'}
                                          height={9}
                                          width={7}
                                          alt="*"
                                        />
                                        <div>
                                          <span className="text-brand-primary">
                                            New
                                          </span>{' '}
                                          {email?.email}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                },
                              )}
                            </div>
                            <div className="mt-4">
                              <button
                                onClick={() => {
                                  setShowAllEmails(false)
                                }}
                                className="h-[50px] rounded-xl bg-brand-primary text-white w-full"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </Box>
                    </Modal>


                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClosePopup}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      disablePortal={false}
                      PaperProps={{
                        elevation: 0,
                        style: {
                          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                          borderRadius: '10px',
                          minWidth: '120px',
                          zIndex: 9999,
                        },
                      }}
                    >
                      <button
                        className="hover:bg-gray-50"
                        onClick={() => {
                          handleAssignLeadToTeammember(myTeamAdmin)
                        }}
                      >
                        <div className="p-2 w-full flex flex-row items-center justify-start gap-2 ">
                          <div className="">
                            {myTeamAdmin?.thumb_profile_image ? (
                              <Image
                                className="rounded-full"
                                src={myTeamAdmin.thumb_profile_image}
                                height={32}
                                width={32}
                                alt="*"
                                style={{
                                  borderRaduis: 50,
                                }}
                              />
                            ) : (
                              <div
                                className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                              // onClick={() => handleToggleClick(item.id)}
                              >
                                {myTeamAdmin?.name?.slice(0, 1)}
                              </div>
                            )}
                          </div>
                          <div className="">{myTeamAdmin?.name}</div>
                          <div className="bg-brand-primary text-white text-sm px-2 rounded-full">
                            Admin
                          </div>
                        </div>
                      </button>
                      {myTeam.length > 0 ? (
                        <div>
                          {myTeam.map((item, index) => {
                            return (
                              <div
                                key={index}
                                className="p-2 flex flex-col gap-2"
                                style={{ fontWeight: '500', fontSize: 15 }}
                              >
                                <button
                                  className="text-start flex flex-row items-center justify-start gap-2 hover:bg-gray-50"
                                  onClick={() => {
                                    handleAssignLeadToTeammember(item)
                                  }}
                                >
                                  {item?.invitedUser?.thumb_profile_image ? (
                                    <Image
                                      className="rounded-full"
                                      src={
                                        item.invitedUser?.thumb_profile_image
                                      }
                                      height={32}
                                      width={32}
                                      alt="*"
                                      style={{}}
                                    />
                                  ) : (
                                    <div
                                      className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                                    // onClick={() =>
                                    //   handleToggleClick(item.id)
                                    // }
                                    >
                                      {item?.name?.slice(0, 1)}
                                    </div>
                                  )}
                                  {item?.name}
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        ''
                      )}
                    </Popover>


                  {/* </div> */}

                  <div className="w-full mt-12" style={{ paddingInline: 0 }}>
                    <TabsCN
                      tabs={[
                        {
                          id: 'perplexity',
                          label: 'Insights',
                          icon: '/svgIcons/sparkles.svg',
                          activeIcon: '/svgIcons/sparklesPurple.svg',
                          iconSize: 20,
                        },
                        {
                          id: 'kyc',
                          label: 'KYC',
                          icon: '/svgIcons/unselectedKycIcon.svg',
                          activeIcon: '/svgIcons/selectedKycIcon.svg',
                          iconSize: 24,
                        },
                        {
                          id: 'activity',
                          label: 'Activity',
                          icon: '/svgIcons/unselectedActivityIcon.svg',
                          activeIcon: '/svgIcons/selectedActivityIcon.svg',
                          iconSize: 24,
                        },
                        {
                          id: 'notes',
                          label: 'Notes',
                          icon: '/svgIcons/unselectedNotesIcon.svg',
                          activeIcon: '/svgIcons/selectedNotesIcon.svg',
                          iconSize: 24,
                        },
                      ]}
                      value={activeTab}
                      onValueChange={handleTabChange}
                    />
                      </div>
                  <div
                    className="w-full mb-2"
                    style={{ height: '1px', backgroundColor: '#15151510' }}
                  />

                  <div style={{ paddingInline: 0 }}>
                    {showPerplexityDetails && (
                      <InsightsTabCN
                          selectedLeadsDetails={selectedLeadsDetails}
                      showConfirmPerplexity={showConfirmPerplexity}
                      setshowConfirmPerplexity={setshowConfirmPerplexity}
                        userLocalData={userLocalData}
                      handleEnrichLead={handleEnrichLead}
                      loading={loading}
                      creditCost={creditCost}
                    />
                    )}

                    {showKYCDetails && (
                      <KYCTabCN kycs={selectedLeadsDetails?.kycs || []} />
                    )}

                    {/* Notes go here */}
                    {showNotesDetails && (
                      <NotesTabCN
                        noteDetails={noteDetails}
                        selectedLeadsDetails={selectedLeadsDetails}
                        onNotesUpdated={handleNotesUpdated}
                      />
                    )}

                    {/* Call activity goes here */}
                    {activeTab === 'activity' && (
                      <ActivityTabCN
                        callActivity={selectedLeadsDetails?.callActivity || []}
                        isExpandedActivity={isExpandedActivity}
                        onToggleExpand={handleShowMoreActivityData}
                        onCopyCallId={handleCopy}
                        onReadTranscript={handleReadMoreToggle}
                        onPlayRecording={(recordingUrl, callId) => {
                          if (recordingUrl) {
                            setShowAudioPlay({ recordingUrl, callId })
                          } else {
                            setShowNoAudioPlay(true)
                          }
                        }}
                      />
                                                      )}
                                                    </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      right: 20,
                    }}
                  >
                    <div>
                      {!hideDelete && (
                        <button
                          className="flex flex-row gap-2 items-center"
                          onClick={() => {
                            // handleDeleteLead()

                            setShowDelModal(true)
                          }}
                          style={{
                            marginTop: 20,
                            alignSelf: 'end',
                          }}
                        >
                          <Image
                            src={'/otherAssets/redDeleteIcon.png'}
                            height={24}
                            width={24}
                            alt="del"
                            style={{
                              filter:
                                'brightness(0) saturate(100%) opacity(0.5)', // Convert to black and make semi-transparent
                            }}
                          />

                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: '600',
                              color: '#15151590',
                              textDecorationLine: 'underline',
                            }}
                          >
                            Delete
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Show Transcript UI Modal - Using unified CallTranscriptModal component */}
          <CallTranscriptModal
            open={!!isExpanded}
            onClose={(open) => {
              if (!open) {
                setIsExpanded(null)
              }
            }}
            callId={isExpanded?.id || isExpanded?.callId || ''}
          />
          {/* delete lead modal */}

          <Modal
            open={showDelModal}
            onClose={() => setShowDelModal(false)}
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
              className="lg:w-4/12 sm:w-4/12 w-6/12"
              sx={styles.modalsStyle}
            >
              <div className="flex flex-row justify-center w-full">
                <div
                  className="w-full"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: 20,
                    borderRadius: '13px',
                  }}
                >
                  <div className="font-bold text-xl mt-6">
                    Are you sure you want to delete this lead
                  </div>
                  <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                    <button
                      className="w-1/2 font-bold text-xl text-[#6b7280] h-[50px]"
                      onClick={() => {
                        setShowDelModal(false)
                      }}
                    >
                      Cancel
                    </button>
                    {delLeadLoader ? (
                      <CircularProgress size={20} />
                    ) : (
                      <button
                        className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                        onClick={async () => {
                          await handleDeleteLead(selectedLeadsDetails)
                          //  setShowDelModal(false)
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
        </div>
      </div>
    </>
  )

  // If renderInline is true, render content directly without Drawer
  if (renderInline) {
    return (
      <div className="w-full h-full overflow-auto" style={{ scrollbarWidth: 'none' }}>
        {mainContent}
      </div>
    )
  }



  // Otherwise, render with Drawer (original behavior)
  return (
    <div className="h-[100svh]">
      <Drawer
        open={showDetailsModal}
        anchor="right"
        onClose={() => {
          setShowDetailsModal(false)
        }}
        disableEnforceFocus={true}
        disableAutoFocus={true}
        disableRestoreFocus={true}
        sx={{
          zIndex: 1400, // Higher than subaccount modals (1300) to appear on top
        }}
        PaperProps={{
          sx: {
            width: '35%', // Adjust width as needed
            borderRadius: '20px', // Rounded corners
            padding: '0px', // Internal padding
            boxShadow: 3, // Light shadow
            margin: '1%', // Small margin for better appearance
            backgroundColor: 'white', // Ensure it's visible
            height: '96.5vh',
            overflow: 'hidden',
            scrollbarWidth: 'none',
            zIndex: 1401, // Ensure Paper is above backdrop
          },
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            zIndex: 1400, // Match Drawer z-index
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        {mainContent}
      </Drawer>

      {/* Note modals - REMOVED: Now handled by NotesTabCN component */}

      {/* Warning Modal for no voice */}
      <Modal
        open={showNoAudioPlay}
        onClose={() => setShowNoAudioPlay(false)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-3/12 sm:w-5/12 w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full flex flex-col items-center"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <audio controls>
                <source src={showAudioPlay} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <button
                className="text-white w-full h-[50px] rounded-lg bg-brand-primary mt-4"
                onClick={() => {
                  setShowNoAudioPlay(false)
                }}
                style={{ fontWeight: '600', fontSize: 15 }}
              >
                Close
              </button>

              {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>



      <Modal
        open={showAudioPlay}
        onClose={() => setShowAudioPlay(null)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box className="lg:w-3/12 sm:w-5/12 w-3/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center">
            <div
              className="w-full flex flex-col items-end"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: '13px',
              }}
            >
              <button
                className="mb-3"
                style={{ fontWeight: '600', fontSize: 15 }}
                onClick={() => {
                  if (showAudioPlay?.callId) {
                    window.open(`/recordings/${showAudioPlay.callId}`, '_blank')
                    setShowAudioPlay(null)
                  }
                }}
              >
                <Image
                  src={'/otherAssets/share.png'}
                  height={20}
                  width={20}
                  alt="*"
                />
              </button>

              <audio
                id="custom-audio"
                controls
                style={{ width: '100%' }}
                src={showAudioPlay?.recordingUrl}
              />

              {/* Buttons */}

              <button
                className="w-full h-[50px] rounded-lg bg-brand-primary text-white mt-4"
                style={{ fontWeight: '600', fontSize: 15 }}
                onClick={() => {
                  setShowAudioPlay(null)
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Unified Message Modal (Email and SMS) */}
      <NewMessageModal
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={async (data) => {
          if(data.mode === 'sms') {
            await sendSMSToLead(data)
          }else if(data.mode === 'email') {
            await sendEmailToLead(data)
          }
        }}
        mode={messageModalMode}
        selectedUser={selectedUser}
        setReduxUser={setReduxUser}
        isLeadMode={true}
      />

      {/* Dialer Modal is now rendered in app/dashboard/layout.js */}

      {/* Upgrade Plan Modal */}
      <Elements stripe={stripePromise}>
        <UpgradePlan
          selectedPlan={selectedPlan}
          setSelectedPlan={() => {
            console.log('setSelectedPlan is called')
          }}
          open={showUpgradeModal}
          // setShowSnackMsg={setShowSnackMsg}
          handleClose={async (upgradeResult) => {
            setShowUpgradeModal(false)
            if (upgradeResult) {
              console.log(
                '🔄 [LEAD-DETAILS] Upgrade successful, refreshing profile...',
              )
              // Refresh user data after successful upgrade
              const getData = async () => {
                // Use AdminGetProfileDetails if selectedUser is provided (admin view), otherwise use getProfileDetails (regular user)
                let user = selectedUser?.id 
                  ? await AdminGetProfileDetails(selectedUser.id)
                  : await getProfileDetails()
                if (user) {
                  // AdminGetProfileDetails returns user directly, getProfileDetails returns { data: { data: user } }
                  setUserLocalData(selectedUser?.id ? user : user.data.data)
                }
              }
              await getData()
            }
          }}
          plan={selectedPlan}
          currentFullPlan={currentFullPlan}
          selectedUser={memoizedSelectedUserForUpgrade}
          from={effectiveUser?.userRole === 'AgencySubAccount' ? 'SubAccount' : 'User'}
        />
      </Elements>
    </div>
  )
}

export default LeadDetails
