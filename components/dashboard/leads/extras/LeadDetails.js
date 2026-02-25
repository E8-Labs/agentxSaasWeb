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
  Tooltip as MuiTooltip,
} from '@mui/material'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  CaretDown,
  CaretUp,
  EnvelopeSimple,
  Plus,
  X as PhosphorX,
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
  Pencil,
  Check,
  X as XIcon,
  ArrowLeftIcon,
} from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'

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
import { messageMarkdownToHtml } from '@/components/messaging/messageMarkdown'
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
import { GetFormattedDateString, FormatBookingDateTime } from '@/utilities/utility'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'
import { getUniqueTags as fetchUniqueTags } from '@/components/globalExtras/GetUniqueTags'

import NoVoicemailView from '../../myagentX/NoVoicemailView'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../AgentSelectSnackMessage'
import LeadTeamsAssignedList from '../LeadTeamsAssignedList'
import SelectStageDropdown from '../StageSelectDropdown'
import DeleteCallLogConfimation from './DeleteCallLogConfimation'
import { useDispatch } from 'react-redux'
import { openDialer, setSelectedUser } from '@/store/slices/dialerSlice'
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
import { renderBrandedIcon } from '@/utilities/iconMasking'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
// import ActionsTab from '../../myagentX/ActionsTab'
// import ActionsGroupBtnCN from './ActionsGroupBtnCN'
import SendActionsButtonGroup from './SendActionsButtonGroup'

const LeadDetails = ({
  showDetailsModal,
  selectedLead,
  initialLeadData = null, // Optional initial lead data to preserve teamsAssigned
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
  onTagDeleted,
  elevatedZIndex = false, // When true, drawer z-index is raised (e.g. when opened from TeamMemberActivityDrawer)
  showAsTab = false,
}) => {
  // //console.log;
  // //console.log;

  const emailInputRef = useRef(null)
  const notesTabRef = useRef(null)

  const [columnsLength, setcolumnsLength] = useState([])

  const [initialLoader, setInitialLoader] = useState(false)

  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(initialLeadData)
  const [leadColumns, setLeadColumns] = useState([])
  const [recentlyDeletedTags, setRecentlyDeletedTags] = useState(new Set())

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

  // Email editing state// Add this with your other useState declarations
  const [editedEmail, setEditedEmail] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [updateEmailLoader, setUpdateEmailLoader] = useState(false)

  const [googleAccounts, setGoogleAccounts] = useState([])
  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  useEffect(() => { }, [showSnackMsg])

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
    console.log("showAudioPlay", showAudioPlay);
  }, [showAudioPlay])

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
    getUniqueTags()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id]) // Only depend on selectedUser.id to avoid unnecessary re-runs

  // Fetch unique tags for tag autocomplete
  const getUniqueTags = async () => {
    try {
      const userId = selectedUser?.id || null
      const tags = await fetchUniqueTags(userId)
      if (tags && Array.isArray(tags)) {
        setUniqueColumns(tags) // Keep variable name for backward compatibility
        // Refresh suggestions if there's a current input value
        if (tagInputValue.trim()) {
          const existingTags = selectedLeadsDetails?.tags || []
          const filtered = tags
            .filter((tag) => {
              const tagLower = tag.toLowerCase()
              const valueLower = tagInputValue.toLowerCase()
              return tagLower.includes(valueLower)
            })
            .filter((tag) => !existingTags.includes(tag))
          setTagSuggestions(filtered)
          setShowTagSuggestions(filtered.length > 0)
        }
      }
    } catch (error) {
      console.error('Error fetching unique tags:', error)
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

  // Sync selectedLeadsDetails when initialLeadData changes (e.g., when modal opens with latest data)
  useEffect(() => {
    if (initialLeadData && initialLeadData.id === selectedLead) {
      // Update selectedLeadsDetails with initialLeadData to preserve teamsAssigned
      setSelectedLeadsDetails((prev) => {
        // Only update if it's a different lead or if teamsAssigned has changed
        if (!prev || prev.id !== initialLeadData.id) {
          return initialLeadData
        }
        // Merge teamsAssigned from initialLeadData if it has more recent data
        const currentTeamsCount = (prev.teamsAssigned || []).length
        const initialTeamsCount = (initialLeadData.teamsAssigned || []).length
        if (initialTeamsCount > currentTeamsCount) {
          return {
            ...prev,
            teamsAssigned: initialLeadData.teamsAssigned,
          }
        }
        return prev
      })
    }
  }, [initialLeadData, selectedLead])

  useEffect(() => {
    if (!selectedLead) return

    // Always fetch from API to get latest data, but getLeadDetails will preserve teamsAssigned
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
        }

        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setGetTeamLoader(false)

          if (response.data.status === true) {
            setMyTeam(response.data.data || []) // Ensure it's always an array
            setMyTeamAdmin(response.data.admin || null)
          } else {
            // //console.log;
            // Ensure myTeam is always an array even on error
            setMyTeam([])
            setMyTeamAdmin(null)
          }
        }
      }
    } catch (e) {
      setGetTeamLoader(false)
      // Ensure myTeam is always an array even on error
      setMyTeam([])
      setMyTeamAdmin(null)
      // //console.log;
    }
  }

  //function to assign lead to the team
  // Function to assign lead to the team member
  // Function to assign lead to the team member - COMPLETELY REWRITTEN
  const handleAssignLeadToTeammember = async (item) => {
    setGlobalLoader(true);
    try {
      handleClosePopup();
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
        leadId: selectedLeadsDetails.id,
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
        setSelectedLeadsDetails(prevData => {
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

        // Call callback with the new team member
        if (leadAssignedTeam) {
          // Get the updated state by simulating what it should be
          const updatedTeams = [...(selectedLeadsDetails.teamsAssigned || []), newTeamMember];
          const simulatedUpdatedLead = {
            ...selectedLeadsDetails,
            teamsAssigned: updatedTeams
          };
          leadAssignedTeam(newTeamMember, simulatedUpdatedLead);
        }

        showSnackbar(response.data.message || 'Team member assigned successfully', SnackbarTypes.Success);
      } else {
        showSnackbar(response?.data?.message || 'Failed to assign team member', SnackbarTypes.Error);
      }
    } catch (error) {
      console.error('❌ [handleAssignLeadToTeammember] Error:', error);
      showSnackbar('Failed to assign team member. Please try again.', SnackbarTypes.Error);
    } finally {
      setGlobalLoader(false);
      handleClosePopup();
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
        leadId: selectedLeadsDetails.id,
        teamMemberUserId: userId,
      };

      console.log('🎯 [handleUnassignLeadFromTeammember] API data:', ApiData);

      let response = await UnassignTeamMember(ApiData);
      console.log('🎯 [handleUnassignLeadFromTeammember] API response:', response?.data);

      if (response && response.data && response.data.status === true) {
        // Update state IMMEDIATELY
        setSelectedLeadsDetails(prevData => {
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

          // Call callback with updated lead data
          if (leadAssignedTeam) {
            leadAssignedTeam(null, updatedLead);
          }

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

  const getNumbers = async () => {
    // Use selectedUser prop if provided (admin view), otherwise fall back to localStorage (existing behavior)
    let userId = null
    if (selectedUser?.id) {
      // Use prop if provided
      userId = selectedUser.id
    } else {
      // Fall back to localStorage (existing behavior for backward compatibility)
      let data = localStorage.getItem('selectedUser')

      // Fix: Check if data exists and is not "undefined" string, then safely parse
      if (data && data !== 'undefined' && data !== 'null') {
        try {
          const parsedUser = JSON.parse(data)
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

  // Function to update lead email
  const updateLeadEmail = async () => {
    if (!editedEmail || !editedEmail?.trim()) {
      showSnackbar('Please enter a valid email address', SnackbarTypes.Error)
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(editedEmail?.trim())) {
      showSnackbar('Please enter a valid email address', SnackbarTypes.Error)
      return
    }

    try {
      setUpdateEmailLoader(true)

      const localDetails = localStorage.getItem('User')
      if (!localDetails) {
        showSnackbar('Please log in again', SnackbarTypes.Error)
        return
      }

      const Data = JSON.parse(localDetails)
      const AuthToken = Data.token

      // if (!selectedLeadsDetails?.sheetId || !selectedLeadsDetails?.phone) {
      //   showSnackbar('Missing required lead information', SnackbarTypes.Error)
      //   return
      // }

      const response = await fetch('/api/leads/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smartListId: selectedLeadsDetails.sheetId,
          phoneNumber: selectedLeadsDetails.phone,
          email: editedEmail?.trim(),
          leadId: selectedLeadsDetails.id,
        }),
      })

      const data = await response.json()

      if (response.ok && data.status === true) {
        // Update the local state
        setSelectedLeadsDetails((prev) => ({
          ...prev,
          email: editedEmail?.trim(),
        }))
        setIsEditingEmail(false)
        showSnackbar('Email updated successfully', SnackbarTypes.Success)
      } else {
        showSnackbar(data.message || 'Failed to update email', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error updating email:', error)
      showSnackbar('Failed to update email. Please try again.', SnackbarTypes.Error)
    } finally {
      setUpdateEmailLoader(false)
    }
  }

  // Function to handle edit email click
  const handleEditEmailClick = () => {
    setEditedEmail(selectedLeadsDetails?.email || '')
    setIsEditingEmail(true)
    emailInputRef.current.focus()
  }

  // Function to handle cancel edit
  const handleCancelEditEmail = () => {
    setIsEditingEmail(false)
    setEditedEmail('')
    emailInputRef.current.blur()
  }

  // useEffect(() => {
  //   console.log("Testing the lead update api", selectedLead);
  // }, [selectedLead]);

  //function to update stage
  const updateLeadStage = async (stage) => {
    try {
      // //console.log;
      let AuthToken = null
      // console.log("Testing the lead update api", selectedLead);
      // console.log("Testing the lead update api details", selectedLeadsDetails);
      // return;
      setUpdateLeadLoader(true)

      const localDetails = localStorage.getItem('User')
      if (localDetails) {
        const Data = JSON.parse(localDetails)
        //// //console.log;
        AuthToken = Data.token
      }

      const LEAD_ID = selectedLead || selectedLeadsDetails?.id

      const ApiData = {
        leadId: LEAD_ID,
        stageId: stage.id,
      }

      console.log("Testing the lead stage update api", ApiData);

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
      console.log("ApiPath is", ApiPath)

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log("lead details are api data ", response.data.data)
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
        // Filter out recently deleted tags to prevent them from being added back
        // Preserve teamsAssigned from current state if it exists and has more recent data
        // This ensures UI updates are not lost when API is called
        const currentTeamsAssigned = selectedLeadsDetails?.teamsAssigned || []
        const apiTeamsAssigned = response.data.data?.teamsAssigned || []

        // Use current teamsAssigned if it has more items (indicating recent assignment)
        // Otherwise use API data, but merge to ensure we don't lose any assignments
        let finalTeamsAssigned = apiTeamsAssigned
        if (currentTeamsAssigned.length > apiTeamsAssigned.length) {
          // Current state has more teams, use it (more recent)
          finalTeamsAssigned = currentTeamsAssigned
        } else if (currentTeamsAssigned.length > 0 && apiTeamsAssigned.length > 0) {
          // Both have data, merge them and remove duplicates
          const merged = [...currentTeamsAssigned]
          apiTeamsAssigned.forEach((apiTeam) => {
            const apiTeamId = apiTeam.id || apiTeam.invitedUserId || apiTeam.invitedUser?.id
            const exists = merged.some((currentTeam) => {
              const currentTeamId = currentTeam.id || currentTeam.invitedUserId || currentTeam.invitedUser?.id
              return String(currentTeamId) === String(apiTeamId)
            })
            if (!exists) {
              merged.push(apiTeam)
            }
          })
          finalTeamsAssigned = merged
        }

        const updatedLeadData = {
          ...response.data.data,
          tags: (response.data.data.tags || []).filter(
            (tag) => !recentlyDeletedTags.has(tag)
          ),
          teamsAssigned: finalTeamsAssigned, // Use merged/preserved teamsAssigned
        }
        setSelectedLeadsDetails(updatedLeadData)
        console.log('🔍 [LeadDetails] Lead details response:', updatedLeadData)
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
  const handleNotesUpdated = useCallback(async () => {
    const leadId = selectedLead ?? selectedLeadsDetails?.id
    if (!leadId) return
    try {
      let AuthToken = null
      const localDetails = localStorage.getItem('User')
      if (localDetails) {
        const Data = JSON.parse(localDetails)
        AuthToken = Data.token
      }
      const ApiPath = `${Apis.getLeadDetails}?leadId=${leadId}`
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
  }, [selectedLead, selectedLeadsDetails?.id])

  // Handler to update tags after tag deletion (optimistic update only)
  const handleLeadDetailsUpdated = async (deletedTagName) => {
    if (!selectedLead || !deletedTagName) return

    // Mark this tag as recently deleted to prevent it from being added back
    setRecentlyDeletedTags((prev) => new Set([...prev, deletedTagName]))

    // Optimistically remove the tag from local state immediately
    // The backend deletion is already complete, so we just update the UI
    if (selectedLeadsDetails?.tags) {
      setSelectedLeadsDetails((prevDetails) => ({
        ...prevDetails,
        tags: (prevDetails.tags || []).filter((tag) => tag !== deletedTagName),
      }))
    }

    // Clear the recently deleted tag after 5 seconds to allow normal updates
    setTimeout(() => {
      setRecentlyDeletedTags((prev) => {
        const newSet = new Set(prev)
        newSet.delete(deletedTagName)
        return newSet
      })
    }, 5000)
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
        } else { }
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

      const ApiPath = Apis.updateLead
      const response = await axios.put(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
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
      // Filter unique tags that match the input
      // Also exclude tags that already exist
      const existingTags = selectedLeadsDetails?.tags || []
      const filtered = uniqueColumns
        .filter((tag) => {
          const tagLower = tag.toLowerCase()
          const valueLower = value.toLowerCase()
          // Match if tag contains the input value
          return tagLower.includes(valueLower)
        })
        .filter((tag) => !existingTags.includes(tag)) // Exclude existing tags

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
        if (response.data.status === true) {
          console.log('response.data.data in del tag', response.data)
          const updatedTags = selectedLeadsDetails.tags.filter(
            (item) => item !== tag,
          )
          setSelectedLeadsDetails((prevDetails) => ({
            ...prevDetails,
            tags: updatedTags,
          }))
        }
        if (onTagDeleted) {
          onTagDeleted(tag)
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
    // Check if lead is already in queue for enrichment
    if (selectedLeadsDetails?.enrich === true) {
      showSnackbar('Lead is already in queue for enrichment', SnackbarTypes.Error)
      return
    }

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
          }
        }
      }
    } catch (e) {
      setLoading(false)
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
    } catch (e) { } finally {
      setdelCallLoader(false)
    }
  }


  // Send email API function
  const sendEmailToLead = async (emailData) => {
    try {
      console.log("Lead email is", selectedLeadsDetails)
      if (!selectedLeadsDetails.email || selectedLeadsDetails.email === '' || selectedLeadsDetails.email === null || selectedLeadsDetails.email === undefined) {
        showSnackbar('Lead does not have a valid email address', SnackbarTypes.Error)
        return
      }
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
      formData.append('content', messageMarkdownToHtml(emailData.content || ''))
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
        setTimeout(() => {
          getLeadDetails(selectedLeadsDetails?.id)
        }, 300)
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
      setSendSMSLoader(true)

      const localData = localStorage.getItem('User')
      if (!localData) {
        throw new Error('User not found')
      }

      const userData = JSON.parse(localData)
      const formData = new FormData()

      // Add required fields (smsPhoneNumberId = From number record id, required by backend)
      formData.append('leadPhone', selectedLeadsDetails?.phone || '')
      formData.append('content', smsData.content || '')
      formData.append('phone', smsData.phone || '')
      formData.append('leadId', selectedLeadsDetails?.id || '')
      if (smsData.smsPhoneNumberId != null && smsData.smsPhoneNumberId !== '') {
        formData.append('smsPhoneNumberId', smsData.smsPhoneNumberId)
      }

      //print form data
      formData.forEach((value, key) => { })
      const response = await axios.post(Apis.sendSMSToLead, formData, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.status === true) {
        showSnackbar('Text sent successfully!', SnackbarTypes.Success)
        setTimeout(() => {
          getLeadDetails(selectedLeadsDetails?.id)
        }, 300)
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

    const dispatchData = {
      leadId: selectedLeadsDetails?.id,
      leadName: selectedLeadsDetails?.name || selectedLeadsDetails?.firstName,
      phoneNumber: selectedLeadsDetails?.phone || '',
      selectedLeadDetails: selectedLeadsDetails,
    }

    console.log("Data dispatching for dialer modal", dispatchData)

    console.log("Selected user passed in leaddetails", selectedUser)

    // Determine dialer user: prefer selectedUser (e.g. from pipeline/lead page), else derive from lead (owner or first assigned team)
    let dialerUser = selectedUser?.id ? selectedUser : null
    if (!dialerUser && selectedLeadsDetails) {
      if (selectedLeadsDetails.userId) {
        dialerUser = { id: selectedLeadsDetails.userId }
      } else if (selectedLeadsDetails.teamsAssigned?.length > 0) {
        const first = selectedLeadsDetails.teamsAssigned[0]
        const id = first.id ?? first.invitedUserId ?? first.invitedUser?.id
        if (id) dialerUser = { id }
      }
    }

    dispatch(openDialer({
      leadId: selectedLeadsDetails?.id,
      leadName: selectedLeadsDetails?.name || selectedLeadsDetails?.firstName,
      phoneNumber: selectedLeadsDetails?.phone || '',
      selectedLeadDetails: selectedLeadsDetails, // Full object
    }))
    if (dialerUser?.id) {
      dispatch(setSelectedUser(dialerUser))
    }
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

    console.log("!dialerCapability.hasAccess", !dialerCapability.hasAccess)
    if (opt.value === 'email') {
      if (!emailCapability.hasAccess) {
        // Trigger upgrade modal if user doesn't have access
        handleEmailUpgradeClick()
        return
      }
      setMessageModalMode('email')

      setShowMessageModal(true)
    } else if (opt.value === 'call') {

      // console.log("")
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


  const teamOptions = React.useMemo(() => {
    const allTeams = [...(myTeamAdmin ? [myTeamAdmin] : []), ...(myTeam || [])];

    return allTeams.map((tm) => {
      // Get the team member ID - use invitedUserId first, then id
      const id = tm.invitedUserId || tm.invitedUser?.id || tm.id;

      // Check if this team member is already assigned
      const isSelected = (selectedLeadsDetails?.teamsAssigned || []).some(
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
  }, [myTeamAdmin, myTeam, selectedLeadsDetails?.teamsAssigned])


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
      <div className="flex flex-col w-full h-full py-0 px-1 rounded-xl gap-2">
        <div className="w-full flex flex-col items-center h-full">

          <div className="w-full">
            {initialLoader ? (
              <div className="w-full flex flex-row items-center justify-center mt-24">
                <CircularProgress size={45} thickness={2} />
              </div>
            ) : (
              <div
                className="h-[95vh] overflow-auto w-full animate-in slide-in-from-bottom-2 duration-200 ease-out"
                style={{ scrollbarWidth: 'none' }}
              >
                <div
                  className="flex flex-col w-full gap-0.5 px-0 rounded-[12px]"
                  style={{
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}
                >
                  {!showAsTab && !renderInline && (
                    <div className="w-full flex flex-row items-center justify-between p-3 h-auto border-b" style={{ borderColor: '#eaeaea' }}>
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
                  <div className="px-0">
                    <div className="py-0 gap-1 flex flex-col">
                      <div className="flex flex-row items-start justify-between mt-4 w-full">
                        <div className="flex flex-col items-start  w-full">
                          <div className="flex flex-row items-between justify-between w-full h-10 max-h-none px-4">
                            <div className="flex flex-row items-center gap-3">

                              {/* only show when showAsTab is true */}
                              {showAsTab && (
                                <button
                                  onClick={() => {
                                    setShowDetailsModal(false)
                                  }}
                                >
                                  <ArrowLeftIcon size={20} />
                                </button>
                              )}
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex cursor-pointer size-[38px]">
                                      <Avatar className="h-[38px] w-[38px] bg-red">
                                        {selectedLeadsDetails?.avatar ? (
                                          <AvatarImage src={selectedLeadsDetails?.avatar} alt={selectedLeadsDetails?.name} />
                                        ) : (
                                          <AvatarFallback className="text-md font-semibold">{selectedLeadsDetails?.firstName?.slice(0, 1) || 'L'}</AvatarFallback>
                                        )}
                                      </Avatar>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Created on {selectedLeadsDetails?.createdAt ? GetFormattedDateString(selectedLeadsDetails.createdAt, true) : '—'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <p className="truncate text-lg font-semibold leading-none text-foreground">
                                  {/* max characters 15 combined */}
                                  {(() => {
                                    const firstName = selectedLeadsDetails?.firstName || ''
                                    const lastName = selectedLeadsDetails?.lastName || ''
                                    const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`.trim()
                                    if (fullName.length > 10) {
                                      return fullName.slice(0, 10) + '...'
                                    }
                                    return fullName
                                  })()}
                                </p>
                                {/* Send actions: Text | Email | Call (ShadCN button group) */}
                                <>
                                  <SendActionsButtonGroup
                                    onSelect={handleSendAction}
                                    emailCapability={emailCapability}
                                    dialerCapability={dialerCapability}
                                    smsCapability={smsCapability}
                                  />
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
                                          textSize="14px"
                                        />
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-full space-y-1 text-sm m-0 px-4 text-[14px] font-normal [&>*]:min-h-6 [&>*]:m-0 [&>*:empty]:hidden [&_.flex]:m-0 [&_*]:text-[14px] [&_*]:font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {/* Email with edit functionality */}


                            {/* Email with edit functionality - Updated Version */}
                            {/* {!isEditingEmail ? (
                          (selectedLeadsDetails?.email || selectedLeadsDetails?.emails?.length > 0) && (
                            <div className="flex flex-row items-center gap-2">
                              <MailIcon className="h-4 w-4 text-muted-foreground" />
                              <div className="text-sm font-medium text-foreground">
                                {selectedLeadsDetails?.email ? (
                                  <div className="flex items-center gap-2">
                                    <span>{selectedLeadsDetails.email}</span>
                                    <MuiTooltip title="Edit email" placement="top">
                                      <button
                                        onClick={handleEditEmailClick}
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </button>
                                    </MuiTooltip>
                                  </div>
                                ) : selectedLeadsDetails?.emails?.length > 0 ? (
                                  ""
                                ) : null}
                              </div>
                            </div>
                          )
                        ) : (  */}

                            <div className="flex flex-col gap-2 m-0 text-[14px] [&_*]:text-[14px]">
                              <div className="flex flex-row items-center gap-2 m-0">
                                <Mail className="h-4 w-4 text-muted-foreground" size={16} />
                                <div className="flex flex-row items-center gap-2 flex-1">
                                  <Input
                                    ref={emailInputRef}
                                    type="email"
                                    value={editedEmail || selectedLeadsDetails?.email}
                                    onChange={(e) => {
                                      setEditedEmail(e.target.value)
                                      setIsEditingEmail(true)

                                    }}
                                    placeholder="Enter email address"
                                    className="flex-1 max-w-[200px] text-sm h-8 border-0 rounded-md p-2 shadow-none focus:border focus:border-primary focus:ring-0"
                                    disabled={updateEmailLoader}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        updateLeadEmail()
                                      } else if (e.key === 'Escape') {
                                        handleCancelEditEmail()
                                      }
                                    }}
                                  />
                                  <div className="flex items-center gap-1">
                                    {updateEmailLoader ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <>
                                        {isEditingEmail && (

                                          <MuiTooltip title="Save" placement="top">
                                            <button
                                              onClick={updateLeadEmail}
                                              disabled={!editedEmail?.trim()}
                                              className="p-1 text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              <span className="text-sm font-semibold">Save</span>
                                            </button>
                                          </MuiTooltip>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/*)} */}


                            {selectedLeadsDetails?.email && (
                              <div className="flex flex-row w-full justify-start">
                                {selectedLeadsDetails?.emails
                                  ?.slice(0, 1)
                                  .map((email, emailIndex) => {
                                    return (
                                      <div
                                        key={emailIndex}
                                        className="flex flex-row items-center gap-2"
                                      >
                                        <div
                                          className="flex flex-row items-center gap-2 px-1 mt-1 mb-1 rounded-lg border border-[#00000020]"
                                          style={styles.paragraph}
                                        >
                                          <Image
                                            src={'/assets/power.png'}
                                            height={9}
                                            width={7}
                                            alt="*"
                                          />
                                          <div className="text-[12px] font-[400]">
                                            <span className="text-brand-primary text-[15px] font-[400]">
                                              New
                                            </span>{' '}
                                            {truncateEmail(email.email)}
                                          </div>
                                        </div>
                                        <button
                                          className="text-brand-primary underline"
                                          onClick={() => {
                                            setShowAllEmails(true)
                                          }}
                                        >
                                          {selectedLeadsDetails?.emails
                                            ?.length > 1
                                            ? `+${selectedLeadsDetails?.emails
                                              ?.length - 1
                                            }`
                                            : ''}
                                        </button>
                                      </div>
                                    )
                                  })}
                              </div>
                            )}


                            {selectedLeadsDetails?.phone && (
                              <InfoRow icon={<PhoneIcon className="h-4 w-4" size={16} />}>
                                {selectedLeadsDetails.phone.startsWith('+')
                                  ? selectedLeadsDetails.phone
                                  : `+${selectedLeadsDetails.phone}`}
                              </InfoRow>
                            )}
                            {selectedLeadsDetails?.address && <InfoRow icon={<MapPinIcon className="h-4 w-4" size={16} />}>{selectedLeadsDetails?.address}</InfoRow>}
                            <InfoRow icon={<WorkflowIcon className="h-4 w-4" size={16} />}>
                              {selectedLeadsDetails?.pipeline?.title ||
                                selectedLeadsDetails?.pipeline?.name ||
                                selectedLeadsDetails?.pipeline ||
                                '-'}
                            </InfoRow>
                            {selectedLeadsDetails?.booking && <div className="flex flex-row items-center gap-2">
                              <InfoRow icon={<CalendarIcon className="h-4 w-4" size={16} />}>{FormatBookingDateTime(selectedLeadsDetails?.booking?.datetime, selectedLeadsDetails?.booking?.timezone)}</InfoRow>
                              {
                                selectedLeadsDetails?.booking?.duration && (
                                  <TagPill label={`${selectedLeadsDetails?.booking?.duration} min`} />
                                )
                              }
                            </div>}
                            {selectedLeadsDetails?.meetingLocation && <InfoRow icon={<MapPinIcon className="h-4 w-4" size={16} />}>
                              <Link href={selectedLeadsDetails?.meetingLocation} target="_blank" className="block min-w-0 max-w-full truncate">{selectedLeadsDetails?.meetingLocation}</Link>
                            </InfoRow>}
                            <div className="flex items-center gap-2">
                              <TagIcon className="h-4 w-4 text-muted-foreground" size={16} />
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
                                onRefreshSuggestions={getUniqueTags}
                                selectedUser={selectedUser}
                                showSnackbar={showSnackbar}
                                onLeadDetailsUpdated={handleLeadDetailsUpdated}
                              />
                            </div>
                            <div className="flex items-center gap-2">

                              {

                                globalLoader ? (
                                  <CircularProgress size={20} />
                                ) : (

                                  <TeamAssignDropdownCn
                                    withoutBorder={true}
                                    label="Assign"
                                    teamOptions={teamOptions}
                                    onToggle={(teamId, team, shouldAssign) => {
                                      console.log('🎯 [TeamAssignDropdownCn] Toggle:', {
                                        teamId,
                                        team,
                                        shouldAssign,
                                        teamLabel: team?.label,
                                        teamRaw: team?.raw
                                      });

                                      if (shouldAssign) {
                                        // If team.raw is available, use it directly
                                        if (team?.raw) {
                                          handleAssignLeadToTeammember(team.raw);
                                        } else {
                                          // Otherwise find the team in our list
                                          const allTeams = [...(myTeamAdmin ? [myTeamAdmin] : []), ...(myTeam || [])];
                                          const teamToAssign = allTeams.find(t => {
                                            const tId = t.invitedUserId || t.invitedUser?.id || t.id;
                                            return String(tId) === String(teamId);
                                          });

                                          if (teamToAssign) {
                                            handleAssignLeadToTeammember(teamToAssign);
                                          } else {
                                            console.error('❌ Could not find team member with ID:', teamId);
                                          }
                                        }
                                      } else {
                                        handleUnassignLeadFromTeammember(teamId);
                                      }
                                    }}

                                  />
                                )}
                            </div>
                          </div>



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
                    selectedUser={selectedUser}
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
                        zIndex: 9999,
                        // //backdropFilter: "blur(20px)",
                      },
                    }}
                    slotProps={{
                      root: {
                        style: {
                          zIndex: 9999,
                        },
                      },
                    }}
                    sx={{
                      zIndex: 9999,
                    }}
                  >
                    <Box
                      className="lg:w-5/12 sm:w-full w-8/12"
                      sx={{
                        ...styles.modalsStyle,
                        zIndex: 9999, // Higher than backdrop (1500) to appear on top
                        position: 'relative',
                      }}
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
                            {selectedLeadsDetails?.emails?.map(
                              (email, emailIndex) => {
                                return (
                                  <div key={emailIndex}>
                                    <div
                                      className="flex flex-row items-center gap-2 px-1 mt-2 rounded-lg py-2 border border-[#00000020]"
                                      style={styles.paragraph}
                                    >
                                      <div className="flex flex-row items-center gap-2">
                                        {renderBrandedIcon("/assets/power.png", 9, 7)}
                                      </div>
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
                    {Array.isArray(myTeam) && myTeam.length > 0 ? (
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

                  <div className="w-full" style={{ paddingInline: 0 }}>
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
                    className="w-full mb-2 hidden"
                    style={{ height: '1px', backgroundColor: '#15151510' }}
                    aria-hidden
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
                        ref={notesTabRef}
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
                            console.log("onplay recording trigered in parent", recordingUrl, callId);
                            setShowAudioPlay({ recordingUrl, callId })
                          } else {
                            setShowNoAudioPlay(true)
                          }
                        }}
                        leadId={selectedLeadsDetails?.id}
                        leadName={selectedLeadsDetails?.firstName || selectedLeadsDetails?.name}
                        selectedUser={selectedUser}
                      />
                    )}
                  </div>
                  {showNotesDetails && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={() => notesTabRef.current?.openAddNote?.()}
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span
                          style={{
                            fontSize: 15,
                            fontWeight: '600',
                            color: '#15151590',
                          }}
                        >
                          Add Notes
                        </span>
                      </Button>
                    </div>
                  )}
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
            callData={isExpanded}
          />
          {/* delete lead modal */}

          <Modal
            open={showDelModal}
            onClose={() => setShowDelModal(false)}
            closeAfterTransition
            disablePortal={false}
            slotProps={{
              root: {
                style: {
                  zIndex: 9999,
                },
              },
            }}
            sx={{
              zIndex: 9999, // Higher than drawer modal (1400) to appear on top
            }}
            BackdropProps={{
              timeout: 1000,
              sx: {
                backgroundColor: '#00000020',
                zIndex: 9999, // Match Modal z-index
                // //backdropFilter: "blur(5px)",
              },
            }}
          >
            <Box
              className="lg:w-4/12 sm:w-4/12 w-6/12"
              sx={{
                ...styles.modalsStyle,
                zIndex: 9999, // Higher than backdrop (1500) to appear on top
                position: 'relative',
              }}
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
        {/* Warning Modal for no voice - same as Drawer branch so audio modals work from Important Calls */}
        <Modal
          open={showNoAudioPlay}
          onClose={() => setShowNoAudioPlay(false)}
          closeAfterTransition
          BackdropProps={{
            sx: {
              backgroundColor: '#00000020',
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
              </div>
            </div>
          </Box>
        </Modal>
        {/* Audio play Modal - same as Drawer branch so audio modals work from Important Calls */}
        <Modal
          open={!!showAudioPlay}
          onClose={() => setShowAudioPlay(null)}
          closeAfterTransition
          disablePortal={false}
          slotProps={{
            root: {
              style: {
                zIndex: 9999,
              },
            },
          }}
          sx={{
            zIndex: 9999,
          }}
          BackdropProps={{
            sx: {
              backgroundColor: '#00000020',
              zIndex: 9999,
            },
          }}
        >
          <Box
            className="lg:w-3/12 sm:w-5/12 w-3/12"
            sx={{
              ...styles.modalsStyle,
              zIndex: 9999,
              position: 'relative',
            }}
          >
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
                      let baseUrl;

                      if (reduxUser?.agencyBranding?.customDomain) {
                        baseUrl = `https://${reduxUser.agencyBranding.customDomain}`;
                      } else {
                        baseUrl = window.location.origin;
                      }

                      const url = `${baseUrl}/recordings/${showAudioPlay.callId}`;
                      window.open(url, "_blank", "noopener,noreferrer");

                      setShowAudioPlay(null);
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
      </div>
    )
  }

  //if trying to show as tab, then render with only main content
  if (showAsTab) {
    return (
      <div className="w-full h-full overflow-auto" style={{ scrollbarWidth: 'none' }}>
        {mainContent}
      </div>
    )
  }

  // Otherwise, render with Drawer (original behavior).
  // Wrapper is zero-size so it does not affect layout when used inside Messages (ConversationHeader);
  // the Drawer portals its content to body and overlays the page.
  return (
    <div className="absolute left-0 top-0 w-0 h-0 overflow-visible">
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
          zIndex: elevatedZIndex ? 5010 : 1400, // 5010 above TeamMemberActivityDrawer (5000); else above subaccount modals (1300)
        }}
        PaperProps={{
          sx: {
            // width: '35%', // Adjust width as needed
            width: '35vw',
            minWidth: 320,
            maxWidth: 600,
            borderRadius: '20px', // Rounded corners
            padding: '0px', // Internal padding
            boxShadow: 3, // Light shadow
            margin: '1%', // Small margin for better appearance
            backgroundColor: 'white', // Ensure it's visible
            height: '96.5vh',
            overflow: 'hidden',
            scrollbarWidth: 'none',
            zIndex: elevatedZIndex ? 5011 : 1401, // Paper above backdrop; 5011 when elevated
          },
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            zIndex: elevatedZIndex ? 5010 : 1400, // Match Drawer z-index
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
        disablePortal={false}
        slotProps={{
          root: {
            style: {
              zIndex: 9999,
            },
          },
        }}
        sx={{
          zIndex: 9999, // Higher than Drawer (1400) to appear on top
        }}
        BackdropProps={{
          sx: {
            backgroundColor: '#00000020',
            zIndex: 9999, // Match Modal z-index
          },
        }}
      >
        <Box
          className="lg:w-3/12 sm:w-5/12 w-3/12"
          sx={{
            ...styles.modalsStyle,
            zIndex: 9999, // Higher than Modal backdrop (1600) to appear on top
            position: 'relative',
          }}
        >
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
                    let baseUrl;

                    if (reduxUser?.agencyBranding?.customDomain) {
                      baseUrl = `https://${reduxUser.agencyBranding.customDomain}`;
                    } else {
                      baseUrl = window.location.origin;
                    }

                    const url = `${baseUrl}/recordings/${showAudioPlay.callId}`;
                    window.open(url, "_blank", "noopener,noreferrer");

                    setShowAudioPlay(null);
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
      {
        showMessageModal && (
          <NewMessageModal
            open={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            onSend={async (data) => {
              if (data.mode === 'sms') {
                await sendSMSToLead(data)
              } else if (data.mode === 'email') {
                await sendEmailToLead(data)
              }
            }}
            mode={messageModalMode}
            selectedUser={selectedUser}
            setReduxUser={setReduxUser}
            isLeadMode={true}
          />
        )
      }
      {/* Dialer Modal is now rendered in app/dashboard/layout.js */}
      {/* Upgrade Plan Modal */}
      <Elements stripe={stripePromise}>
        <UpgradePlan
          selectedPlan={selectedPlan}
          setSelectedPlan={() => { }}
          open={showUpgradeModal}
          // setShowSnackMsg={setShowSnackMsg}
          handleClose={async (upgradeResult) => {
            setShowUpgradeModal(false)
            if (upgradeResult) {
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
  );
}

export default LeadDetails