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
  TextareaAutosize,
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
  Smile,
  Frown,
  AlertTriangle,
  Flame,
  Sun,
  Snowflake,
  CheckCircle2,
  Mail,
  MapPin,
  Tag,
  Workflow,
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Pencil,
  Trash2,
  MoreVertical,
  Copy,
  Meh,
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
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { TranscriptViewer } from '@/components/calls/TranscriptViewer'
import { UpgradeTagWithModal } from '@/components/constants/constants'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { AssignTeamMember, UnassignTeamMember } from '@/components/onboarding/services/apisServices/ApiService'
import AuthSelectionPopup from '@/components/pipeline/AuthSelectionPopup'
// import EmailTempletePopup from "../../pipeline/EmailTempletePopup";
import EmailTempletePopup from '@/components/pipeline/EmailTempletePopup'
import SMSTempletePopup from '@/components/pipeline/SMSTempletePopup'
import {
  getA2PNumbers,
  getGmailAccounts,
} from '@/components/pipeline/TempleteServices'
import ScoringProgress from '@/components/ui/ScoringProgress'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { callStatusColors } from '@/constants/Constants'
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
import ConfirmPerplexityModal from './CofirmPerplexityModal'
import DeleteCallLogConfimation from './DeleteCallLogConfimation'
import NoPerplexity from './NoPerplexity'
import Perplexity from './Perplexity'
import { useDispatch } from 'react-redux'
import { openDialer } from '@/store/slices/dialerSlice'
import DropdownCn from './DropdownCn'
import MultiSelectDropdownCn from './MultiSelectDropdownCn'
import { InfoRow, TagPill } from './LeadDetailsCN'
import { Button } from '@/components/ui/button'

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
  const [showKYCDetails, setShowKycDetails] = useState(false)
  const [showNotesDetails, setShowNotesDetails] = useState(false)
  const [showAcitivityDetails, setShowAcitivityDetails] = useState(false)
  const [showPerplexityDetails, setShowPerpelexityDetails] = useState(true)

  //code for add stage notes
  const [showAddNotes, setShowAddNotes] = useState(false)
  const [addNotesValue, setddNotesValue] = useState('')
  const [noteDetails, setNoteDetails] = useState([])
  const [addLeadNoteLoader, setAddLeadNoteLoader] = useState(false)

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

  //variable for showing modal
  const [extraTagsModal, setExtraTagsModal] = useState(false)

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

  // Note edit/delete states
  const [editingNote, setEditingNote] = useState(null)
  const [editNoteValue, setEditNoteValue] = useState('')
  const [editNoteLoader, setEditNoteLoader] = useState(false)
  const [deleteNoteId, setDeleteNoteId] = useState(null)
  const [deleteNoteLoader, setDeleteNoteLoader] = useState(false)
  const [showDeleteNoteConfirm, setShowDeleteNoteConfirm] = useState(false)
  const [noteMenuAnchor, setNoteMenuAnchor] = useState(null)
  const [selectedNoteForMenu, setSelectedNoteForMenu] = useState(null)

  // Email functionality states
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null)
  const [sendEmailLoader, setSendEmailLoader] = useState(false)

  // SMS functionality states
  const [showSMSModal, setShowSMSModal] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [phoneLoading, setPhoneLoading] = useState(false)
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

  useEffect(() => {
    const getData = async () => {
      let user = await getProfileDetails()
      if (user) {
        setUserLocalData(user.data.data)
        // console.log('user', user)
      }
    }

    getNumbers()
    getData()
    getCreditCost()
    getUniqueColumns()
  }, [])

  // Fetch unique columns for tag autocomplete
  const getUniqueColumns = async () => {
    try {
      const columns = await getUniquesColumn()
      if (columns && Array.isArray(columns)) {
        setUniqueColumns(columns)
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

        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setGetTeamLoader(false)

          if (response.data.status === true) {
            //console.log;
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
      console.log('Item passed is', item)
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
      console.log('Api data to send in api is', ApiData)
      // selectedLeadsDetails.id,
      //   item.invitingUserId
      // return;
      let response = await AssignTeamMember(ApiData)
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
    let data = localStorage.getItem('selectedUser')
    let selectedUser = null
    console.log('data', data)
    console.log('typeof data', typeof data)

    // Fix: Check if data exists and is not "undefined" string, then safely parse
    if (data && data !== 'undefined' && data !== 'null') {
      try {
        selectedUser = JSON.parse(data)
        console.log('selected user data from local', selectedUser)
      } catch (error) {
        console.error('Error parsing selectedUser from localStorage:', error)
        selectedUser = null
      }
    }

    setPhoneLoading(true)
    let id = selectedUser?.id
    let num = await getA2PNumbers(id)
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
        console.log('Lead details response', response.data.data)
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

  // Function to handle editing a note
  const handleEditNote = async () => {
    try {
      if (!editingNote || !editNoteValue.trim()) {
        showSnackbar('Note content cannot be empty', SnackbarTypes.Error)
        return
      }

      setEditNoteLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const response = await fetch(
        `/api/leads/${selectedLeadsDetails.id}/notes/${editingNote.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${AuthToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: editNoteValue,
          }),
        },
      )

      const data = await response.json()

      if (data.status === true) {
        // Update the note in the list
        setNoteDetails((prevNotes) =>
          prevNotes.map((note) =>
            note.id === editingNote.id
              ? { ...note, note: editNoteValue }
              : note,
          ),
        )
        setEditingNote(null)
        setEditNoteValue('')
        showSnackbar('Note updated successfully', SnackbarTypes.Success)
      } else {
        showSnackbar(data.message || 'Failed to update note', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error updating note:', error)
      showSnackbar('Failed to update note. Please try again.', SnackbarTypes.Error)
    } finally {
      setEditNoteLoader(false)
    }
  }

  // Function to handle deleting a note
  const handleDeleteNote = async () => {
    try {
      if (!deleteNoteId) return

      setDeleteNoteLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const response = await fetch(
        `/api/leads/${selectedLeadsDetails.id}/notes/${deleteNoteId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${AuthToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const data = await response.json()

      if (data.status === true) {
        // Remove the note from the list
        setNoteDetails((prevNotes) =>
          prevNotes.filter((note) => note.id !== deleteNoteId),
        )
        setDeleteNoteId(null)
        setShowDeleteNoteConfirm(false)
        showSnackbar('Note deleted successfully', SnackbarTypes.Success)
      } else {
        showSnackbar(data.message || 'Failed to delete note', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      showSnackbar('Failed to delete note. Please try again.', SnackbarTypes.Error)
    } finally {
      setDeleteNoteLoader(false)
    }
  }

  //function to add lead notes
  const handleAddLeadNotes = async () => {
    try {
      setAddLeadNoteLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      const ApiData = {
        note: addNotesValue,
        leadId: selectedLeadsDetails.id,
      }

      // //console.log;

      const ApiPath = Apis.addLeadNote
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        // setNoteDetails()
        if (response.data.status === true) {
          setShowAddNotes(false)
          setNoteDetails([response.data.data, ...noteDetails])
          setddNotesValue('')
        }
      }
    } catch (error) {
      // console.error("Error occured in add lead note api is:", error);
    } finally {
      setAddLeadNoteLoader(false)
    }
  }

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
  }, [])

  const getGoogleAccounts = async () => {
    let accounts = await getGmailAccounts()
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

  const showColor = (item) => {
    let color =
      callStatusColors[
      Object.keys(callStatusColors).find(
        (key) =>
          key.toLowerCase() === (item?.callOutcome || '').toLowerCase(),
      )
      ] || '#000'

    return color
  }

  const getCommunicationTypeIcon = (item) => {
    console.log('item.communication', item.communicationType)
    // Check if it's a dialer call (callOrigin === 'Dialer' or isWebCall === false for calls)
    const isDialerCall = item.callOrigin === 'Dialer' || (item.communicationType === 'call' && item.isWebCall === false)

    if (item.communicationType == 'sms') {
      return '/otherAssets/smsIcon.png'
    } else if (item.communicationType == 'email') {
      return '/otherAssets/email.png'
    } else if (item.communicationType == 'call' || isDialerCall) {
      return '/otherAssets/callIcon.png'
    } else if (item.communicationType == 'web') {
      return '/otherAssets/webhook2.svg'
    } else return '/otherAssets/callIcon.png'
  }

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

  const getOutcome = (item) => {
    if (item.communicationType == 'sms') {
      return 'Text Sent'
    } else if (item.communicationType == 'email') {
      return 'Email Sent'
    } else if (item.callOutcome) {
      return item?.callOutcome
    } else {
      return 'Ongoing'
    }
  }

  // Send email API function
  const sendEmailToLead = async (emailData) => {
    try {
      console.log('Sending email to lead', emailData)
      console.log('selectedGoogleAccount', selectedGoogleAccount)
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
      formData.append(
        'emailAccountId',
        JSON.stringify(selectedGoogleAccount.id || []),
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
        setShowEmailModal(false)
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
      formData.append('leadId', smsData.leadId || '')

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
        showSnackbar('SMS sent successfully!', SnackbarTypes.Success)
        setShowSMSModal(false)
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

  // Helper function to get sentiment icon
  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return null
    const sentimentLower = sentiment.toLowerCase()
    if (sentimentLower.includes('positive') || sentimentLower.includes('happy') || sentimentLower.includes('excited')) {
      return <Smile size={18} color="hsl(var(--brand-primary))" />
    } else if (sentimentLower.includes('negative') || sentimentLower.includes('angry') || sentimentLower.includes('frustrated')) {
      return <Frown size={18} color="hsl(var(--brand-primary))" />
    } else {
      return <Meh size={18} color="hsl(var(--brand-primary))" />
    }
  }

  // Helper function to get temperature icon
  const getTemperatureIconForActivity = (temperature) => {
    if (!temperature) return null
    const tempLower = temperature.toLowerCase()
    if (tempLower.includes('hot')) {
      return <Flame size={18} color="hsl(var(--brand-primary))" />
    } else if (tempLower.includes('warm')) {
      return <Sun size={18} color="hsl(var(--brand-primary))" />
    } else if (tempLower.includes('cold')) {
      return <Snowflake size={18} color="hsl(var(--brand-primary))" />
    }
    return null
  }

  // Helper function to format next steps for tooltip
  const formatNextStepsForTooltip = (nextSteps) => {
    if (!nextSteps) return 'No next steps'
    try {
      const steps = typeof nextSteps === 'string' ? JSON.parse(nextSteps) : nextSteps
      if (Array.isArray(steps) && steps.length > 0) {
        return steps.map((step, idx) => `${idx + 1}. ${step}`).join('\n')
      }
      return typeof nextSteps === 'string' ? nextSteps : 'No next steps'
    } catch {
      return typeof nextSteps === 'string' ? nextSteps : 'No next steps'
    }
  }

  const callTranscript = (item, initialText) => {
    const callSummary = item.callSummary
    const summaryText = callSummary?.callSummary || null
    const hasSummary = summaryText && summaryText.trim()

    // Use summary if available, otherwise fallback to transcript
    const displayText = hasSummary ? summaryText : (item.transcript || 'No summary or transcript available')

    return (
      <div className="flex flex-col">
        {/* Top row: Duration, Play button, and Icons (Sentiment, Temp, Next Steps) */}
        <div className="flex flex-row items-center justify-between mt-4">
          <div className="flex flex-row items-center gap-3">
            <div
              style={{
                fontWeight: '500',
                fontSize: 15,
              }}
            >
              {moment(item?.duration * 1000).format('mm:ss')}
            </div>
            <button
              onClick={() => {
                if (item?.recordingUrl) {
                  setShowAudioPlay({ recordingUrl: item.recordingUrl, callId: item.callId })
                } else {
                  setShowNoAudioPlay(true)
                }
              }}
              className="flex items-center justify-center"
              style={{
                width: 35,
                height: 35,
              }}
            >
              <Image
                src={'/assets/play.png'}
                height={35}
                width={35}
                alt="Play recording"
                style={{
                  filter: 'hue-rotate(0deg) saturate(1) brightness(1)',
                }}
              />
            </button>
          </div>

          {/* Top right icons: Sentiment, Temperature, Next Steps */}
          <div className="flex flex-row items-center gap-3">
            {callSummary?.prospectSentiment && (
              <Tooltip
                title={`Sentiment: ${callSummary.prospectSentiment}`}
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#ffffff',
                      color: '#333',
                      fontSize: '14px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      maxWidth: '300px',
                    },
                  },
                  arrow: {
                    sx: {
                      color: '#ffffff',
                    },
                  },
                }}
              >
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {getSentimentIcon(callSummary.prospectSentiment)}
                </div>
              </Tooltip>
            )}

            {callSummary?.leadTemperature && (
              <Tooltip
                title={`Temperature: ${callSummary.leadTemperature}`}
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#ffffff',
                      color: '#333',
                      fontSize: '14px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      maxWidth: '300px',
                    },
                  },
                  arrow: {
                    sx: {
                      color: '#ffffff',
                    },
                  },
                }}
              >
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {getTemperatureIconForActivity(callSummary.leadTemperature)}
                </div>
              </Tooltip>
            )}

            {callSummary?.nextSteps && (
              <Tooltip
                title={
                  <div style={{ whiteSpace: 'pre-line' }}>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Next Steps:</div>
                    {formatNextStepsForTooltip(callSummary.nextSteps)}
                  </div>
                }
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#ffffff',
                      color: '#333',
                      fontSize: '14px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      maxWidth: '300px',
                    },
                  },
                  arrow: {
                    sx: {
                      color: '#ffffff',
                    },
                  },
                }}
              >
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ListChecks size={18} color="hsl(var(--brand-primary))" />
                </div>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Summary text */}
        <div className="w-full mt-4">
          <div
            style={{
              fontWeight: '600',
              fontSize: 15,
              marginBottom: '8px',
            }}
          >
            Summary:
          </div>
          <div
            style={{
              fontWeight: '400',
              fontSize: 15,
              color: '#151515',
              lineHeight: '1.5',
            }}
          >
            {displayText}
          </div>
        </div>

        {/* Bottom row: Call ID, Transcript icons (left) and Caller name (right) */}
        <div className="flex flex-row items-center justify-between mt-4">
          <div className="flex flex-row items-center gap-4">
            {/* Call ID Icon */}
            <Tooltip
              title="Copy Call ID"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    color: '#333',
                    fontSize: '14px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                  },
                },
                arrow: {
                  sx: {
                    color: '#ffffff',
                  },
                },
              }}
            >
              <button
                onClick={() => handleCopy(item.callId)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Copy size={18} color="hsl(var(--brand-primary))" />
              </button>
            </Tooltip>

            {/* Transcript Icon */}
            {item.transcript && (
              <Tooltip
                title="Read Transcript"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#ffffff',
                      color: '#333',
                      fontSize: '14px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                    },
                  },
                  arrow: {
                    sx: {
                      color: '#ffffff',
                    },
                  },
                }}
              >
                <button
                  onClick={() => {
                    handleReadMoreToggle(item)
                  }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <FileText size={18} color="hsl(var(--brand-primary))" />
                </button>
              </Tooltip>
            )}
          </div>

          {/* Caller name (right side) */}
          {/* <div
            style={{
              fontWeight: '500',
              fontSize: 14,
              color: '#00000070',
            }}
          >
            By {item.callerName || item.agent?.name || 'Unknown'}
          </div> */}
        </div>
      </div>
    )
  }

  const emailSmsTranscript = (item) => {
    return (
      <div className="flex flex-col items-start gap-2">
        {item.sentSubject && (
          <div className="text-base font-semibold text-[#000000]">
            Subject:  {item.sentSubject}
          </div>
        )}

        {item.sentContent && (
          <div className="flex flex-col items-start gap-2">

            <div className="text-base font-medium text-[#000000] whitespace-pre-wrap">
              {htmlToPlainText(item.sentContent)}
            </div>
          </div>
        )}

        {item.template?.attachments?.length > 0 && (
          <div className="flex flex-col items-start gap-2">
            <div className="text-base font-semibold text-[#00000050]">
              Attachments
            </div>

            {/* Attachments */}
            {item.template?.attachments.map((attachment, index) => (
              <div key={index} className="flex flex-row items-center gap-2">
                <div
                  key={index}
                  className="text-base font-medium text-[#000000] w-6/12 truncate"
                  onClick={() => {
                    window.open(attachment.url, '_blank')
                  }}
                >
                  {attachment.fileName}
                </div>

                <div>{formatFileSize(attachment.size)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const startCallAction = () => {
    setSendActionAnchor(null)
    startDialerFlow()
  }
  const handleSendAction = (opt) => {
    if (opt.value === 'email') {
      setShowEmailModal(true)
    } else if (opt.value === 'call') {
      startCallAction()
    } else if (opt.value === 'sms') {
      setShowSMSModal(true)
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
                className="h-[95vh] overflow-auto"
                style={{ scrollbarWidth: 'none' }}
              >
                <div
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
                  <div>
                    <div className="flex flex-row items-start justify-between mt-4  w-full">
                      <div className="flex flex-col items-start gap-[5px] ">
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
                            <DropdownCn
                              label="Send"
                              options={[
                                { label: 'Email', value: 'email', icon: Mail },
                                { label: 'Call', value: 'call', icon: PhoneCall },
                                { label: 'SMS', value: 'sms', icon: MessageSquareDot },
                              ]}
                              onSelect={handleSendAction}
                            />
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
                        <div className="space-y-3 text-sm">
                          {selectedLeadsDetails?.email && <InfoRow icon={<MailIcon className="h-4 w-4" />}>{selectedLeadsDetails?.email}</InfoRow>}
                          {selectedLeadsDetails?.phone && <InfoRow icon={<PhoneIcon className="h-4 w-4" />}>{selectedLeadsDetails?.phone}</InfoRow>}
                          {selectedLeadsDetails?.address && <InfoRow icon={<MapPinIcon className="h-4 w-4" />}>{selectedLeadsDetails?.address}</InfoRow>}
                          <InfoRow icon={<WorkflowIcon className="h-4 w-4" />}>
                            {selectedLeadsDetails?.pipeline?.title ||
                              selectedLeadsDetails?.pipeline?.name ||
                              selectedLeadsDetails?.pipeline ||
                              '-'}
                          </InfoRow>
                          {selectedLeadsDetails?.booking && <InfoRow icon={<CalendarIcon className="h-4 w-4" />}>{selectedLeadsDetails?.booking}</InfoRow>}
                          <div className="flex items-center gap-2">
                            <TagIcon className="h-4 w-4 text-muted-foreground" />
                            {/* <div className="flex flex-wrap gap-2">
                              {selectedLeadsDetails?.tags?.map((tag) => (
                                <TagPill key={tag} label={tag} />
                              ))}
                            </div> */}
                            {/* Tags + Input */}
                            <div className="space-x-2 flex flex-row items-center gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {(selectedLeadsDetails?.tags || []).slice(0, 3).map((tag) => (
                                  
                                  <TagPill key={tag} label={tag} />
                                ))}
                                {selectedLeadsDetails?.tags?.length > 3 && (
                                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                                    +{selectedLeadsDetails.tags.length - 3}
                                  </span>
                                )}
                              </div>

                              <div className="relative">
                                <input
                                  ref={tagInputRef}
                                  type="text"
                                  value={tagInputValue}
                                  onChange={handleTagInputChange}
                                  onKeyDown={handleTagInputKeyDown}
                                  onFocus={() => {
                                    if (tagInputValue.trim() && tagSuggestions.length > 0) {
                                      setShowTagSuggestions(true)
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      setShowTagSuggestions(false)
                                    }, 200)
                                  }}
                                  placeholder={
                                    selectedLeadsDetails?.tags && selectedLeadsDetails.tags.length > 0
                                      ? 'Add tag...'
                                      : 'Add tags...'
                                  }
                                  className="w-40 rounded-full border border-muted bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                                  disabled={addTagLoader}
                                />

                                {showTagSuggestions && tagSuggestions.length > 0 && (
                                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {tagSuggestions.map((suggestion, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleTagSuggestionClick(suggestion)}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {addTagLoader && (
                                  <div className="absolute right-2 top-2">
                                    <CircularProgress size={20} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {selectedLeadsDetails?.assignee?.avatar ? (
                                <AvatarImage src={selectedLeadsDetails?.assignee.avatar} alt={selectedLeadsDetails?.assignee.name} />
                              ) : (
                                <AvatarFallback>{selectedLeadsDetails?.assignee?.name?.[0] || 'A'}</AvatarFallback>
                              )}
                            </Avatar>
                            <MultiSelectDropdownCn
                              label="Assign"
                              options={(selectedLeadsDetails?.teamsAssigned || []).map((tm) => ({
                                id: tm.id || tm.invitedUserId,
                                label: tm.name,
                                avatar: tm.thumb_profile_image,
                                selected: true,
                              }))}
                              onToggle={(opt, checked) => {
                                if (checked) {
                                  handleAssignLeadToTeammember?.(opt.id)
                                } else {
                                  handleUnassignLeadFromTeammember?.(opt.id)
                                }
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <WorkflowIcon className="h-4 w-4" />
                              <span className="text-sm font-medium text-foreground">Custom fields</span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Button variant="link" className="h-auto p-0 text-indigo-primary">
                              <PlusIcon className="h-4 w-4" />
                              {selectedLeadsDetails?.customFieldsCount}
                            </Button>
                            
                          </div>
                        </div>
                        
                        
                      </div>
                      {/* Stage Select Dropdown */}
                      <div className="flex flex-col items-end gap-[5px] absolute top-25 right-10">
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
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full mt-3">
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
                    </div>

                    {getExtraColumsCount(columnsLength) >= 1 && (
                      <div className="flex flex-row items-center gap-2 mt-3">
                        <Image
                          src={'/assets/customsIcon.svg'}
                          alt="*"
                          height={16}
                          width={16}
                        />
                        <button
                          onClick={() => {
                            setShowCustomVariables(!showCustomVariables)
                          }}
                          className="outline-none flex flex-row items-center gap-1"
                        >
                          <div style={styles.heading2}>
                            Custom fields
                          </div>
                          {showCustomVariables ? (
                            <CaretUp
                              size={16}
                              weight="bold"
                              color="#000000"
                            />
                          ) : (
                            <CaretDown
                              size={16}
                              weight="bold"
                              color="#000000"
                            />
                          )}
                        </button>
                      </div>
                    )}

                    <div className="flex w-full">
                      {getExtraColumsCount(columnsLength) >= 1 && (
                        <div className="flex flex-col mt-2 rounded-xl p-2 w-full max-w-full overflow-hidden">
                          <div className="flex w-full ">
                            {showCustomVariables && (
                              <div className="flex flex-col mt-4 gap-1 w-full max-w-full overflow-hidden">
                                {leadColumns.map((column, index) => {
                                  if (
                                    [
                                      'Name',
                                      'Phone',
                                      'address',
                                      'More',
                                      0,
                                      'Stage',
                                      'status',
                                    ].includes(column?.title)
                                  ) {
                                    return null
                                  }
                                  return (
                                    <div
                                      key={index}
                                      className="flex flex-row items-start gap-1 justify-between w-full flex-wrap"
                                    >
                                      <div className="flex flex-row items-center gap-4">
                                        <div style={styles.subHeading}>
                                          {capitalize(column?.title || '')}
                                        </div>
                                      </div>
                                      <div className="flex flex-row whitespace-normal break-words overflow-hidden items-end flex-wrap">
                                        <div className="flex flex-col items-end flex-grow w-full">
                                          {getDetailsColumnData(
                                            column,
                                            selectedLeadsDetails,
                                          )}
                                        </div>
                                        {ShowReadMoreButton(
                                          column,
                                          selectedLeadsDetails,
                                        ) && (
                                            <div className="flex items-end justify-end min-w-[120px]">
                                              <button
                                                style={{
                                                  fontWeight: '600',
                                                  fontSize: 15,
                                                }}
                                                onClick={() => {
                                                  setExpandedCustomFields(
                                                    (prevFields) =>
                                                      prevFields.includes(
                                                        column?.title,
                                                      )
                                                        ? prevFields.filter(
                                                          (field) =>
                                                            field !==
                                                            column?.title,
                                                        )
                                                        : [
                                                          ...prevFields,
                                                          column?.title,
                                                        ],
                                                  )
                                                }}
                                                className="text-black underline w-[120px]"
                                              >
                                                {expandedCustomFields.includes(
                                                  column?.title,
                                                )
                                                  ? 'Read Less'
                                                  : 'Read More'}
                                              </button>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <AuthSelectionPopup
                      open={showAuthSelectionPopup}
                      onClose={() => setShowAuthSelectionPopup(false)}
                      onSuccess={() => {
                        setShowEmailModal(true)
                        setShowAuthSelectionPopup(false)
                      }}
                      setShowEmailTempPopup={(value) => {
                        setShowEmailModal(value)
                        setShowAuthSelectionPopup(false)
                      }}
                      showEmailTempPopup={showEmailModal}
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
                      <Box
                        className="lg:w-3/12 sm:w-full w-4/12"
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
                              {selectedLeadsDetails?.tags.map(
                                (tag, index) => {
                                  return (
                                    <div
                                      key={index}
                                      className="flex flex-row items-center gap-2"
                                    >
                                      <div
                                        className="flex flex-row items-center gap-2 px-2 py-1 rounded-lg"
                                        style={{
                                          backgroundColor: 'hsl(var(--brand-primary) / 0.1)'
                                        }}
                                      >
                                        <div
                                          className="text-brand-primary" //1C55FF10
                                        >
                                          {tag}
                                        </div>
                                        {DelTagLoader &&
                                          tag.includes(DelTagLoader) ? (
                                          <div>
                                            <CircularProgress size={15} />
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              handleDelTag(tag)
                                            }}
                                          >
                                            <X
                                              size={15}
                                              weight="bold"
                                              color="hsl(var(--brand-primary))"
                                            />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                },
                              )}
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

                    {/* Code for custom variables */}
                  </div>

                  <div
                    className="w-full flex flex-row items-center justify-between mt-2"
                    style={{
                      ...styles.paragraph,
                      paddingInline: 20,
                    }}
                  >
                    <button
                      className="outline-none p-2 flex flex-row gap-2"
                      style={{
                        borderBottom: showPerplexityDetails
                          ? '2px solid hsl(var(--brand-primary))'
                          : '',
                        backgroundColor: showPerplexityDetails
                          ? 'hsl(var(--brand-primary) / 0.05)'
                          : '',
                      }}
                      onClick={() => {
                        setShowPerpelexityDetails(true)
                        setShowKycDetails(false)
                        setShowNotesDetails(false)
                        setShowAcitivityDetails(false)
                        setShowCustomVariables(false)
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: showPerplexityDetails
                            ? 'hsl(var(--brand-primary))'
                            : '#000000',
                          WebkitMaskImage: `url(${showPerplexityDetails
                            ? '/svgIcons/sparklesPurple.svg'
                            : '/svgIcons/sparkles.svg'
                            })`,
                          maskImage: `url(${showPerplexityDetails
                            ? '/svgIcons/sparklesPurple.svg'
                            : '/svgIcons/sparkles.svg'
                            })`,
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                        }}
                      />
                      <div
                        style={{
                          color: showPerplexityDetails ? 'hsl(var(--brand-primary))' : 'black',
                        }}
                      >
                        Insights
                      </div>
                    </button>

                    <button
                      className="outline-none p-2 flex flex-row gap-2"
                      style={{
                        borderBottom: showKYCDetails
                          ? '2px solid hsl(var(--brand-primary))'
                          : '',
                        backgroundColor: showKYCDetails ? 'hsl(var(--brand-primary) / 0.05)' : '',
                      }}
                      onClick={() => {
                        setShowPerpelexityDetails(false)
                        setShowKycDetails(true)
                        setShowNotesDetails(false)
                        setShowAcitivityDetails(false)
                        setShowCustomVariables(false)
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: showKYCDetails
                            ? 'hsl(var(--brand-primary))'
                            : '#000000',
                          WebkitMaskImage: `url(${showKYCDetails
                            ? '/svgIcons/selectedKycIcon.svg'
                            : '/svgIcons/unselectedKycIcon.svg'
                            })`,
                          maskImage: `url(${showKYCDetails
                            ? '/svgIcons/selectedKycIcon.svg'
                            : '/svgIcons/unselectedKycIcon.svg'
                            })`,
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                        }}
                      />
                      <div
                        style={{
                          color: showKYCDetails ? 'hsl(var(--brand-primary))' : 'black',
                        }}
                      >
                        KYC
                      </div>
                    </button>

                    <button
                      className="outline-none p-2 flex flex-row gap-2"
                      style={{
                        borderBottom: showAcitivityDetails
                          ? '2px solid hsl(var(--brand-primary))'
                          : '',
                        backgroundColor: showAcitivityDetails
                          ? 'hsl(var(--brand-primary) / 0.05)'
                          : '',
                      }}
                      onClick={() => {
                        setShowPerpelexityDetails(false)
                        setShowKycDetails(false)
                        setShowNotesDetails(false)
                        setShowAcitivityDetails(true)
                        setShowCustomVariables(false)
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: showAcitivityDetails
                            ? 'hsl(var(--brand-primary))'
                            : '#000000',
                          WebkitMaskImage: `url(${showAcitivityDetails
                            ? '/svgIcons/selectedActivityIcon.svg'
                            : '/svgIcons/unselectedActivityIcon.svg'
                            })`,
                          maskImage: `url(${showAcitivityDetails
                            ? '/svgIcons/selectedActivityIcon.svg'
                            : '/svgIcons/unselectedActivityIcon.svg'
                            })`,
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                        }}
                      />
                      <div
                        style={{
                          color: showAcitivityDetails ? 'hsl(var(--brand-primary))' : 'black',
                        }}
                      >
                        Activity
                      </div>
                    </button>

                    <button
                      className="outline-none p-2 flex flex-row gap-2"
                      style={{
                        borderBottom: showNotesDetails
                          ? '2px solid hsl(var(--brand-primary))'
                          : '',
                        backgroundColor: showNotesDetails ? 'hsl(var(--brand-primary) / 0.05)' : '',
                      }}
                      onClick={() => {
                        setShowPerpelexityDetails(false)
                        setShowKycDetails(false)
                        setShowNotesDetails(true)
                        setShowAcitivityDetails(false)
                        setShowCustomVariables(false)
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: showNotesDetails
                            ? 'hsl(var(--brand-primary))'
                            : '#000000',
                          WebkitMaskImage: `url(${showNotesDetails
                            ? '/svgIcons/selectedNotesIcon.svg'
                            : '/svgIcons/unselectedNotesIcon.svg'
                            })`,
                          maskImage: `url(${showNotesDetails
                            ? '/svgIcons/selectedNotesIcon.svg'
                            : '/svgIcons/unselectedNotesIcon.svg'
                            })`,
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          maskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskPosition: 'center',
                        }}
                      />
                      <div
                        style={{
                          color: showNotesDetails ? 'hsl(var(--brand-primary))' : 'black',
                        }}
                      >
                        Notes
                      </div>
                    </button>
                  </div>
                  <div
                    className="w-full"
                    style={{ height: '1px', backgroundColor: '#15151510' }}
                  />

                  <div style={{ paddingInline: 0 }}>
                    {showPerplexityDetails &&
                      (selectedLeadsDetails &&
                        selectedLeadsDetails.enrichData ? (
                        <Perplexity
                          selectedLeadsDetails={selectedLeadsDetails}
                        />
                      ) : (
                        <NoPerplexity
                          setshowConfirmPerplexity={setshowConfirmPerplexity}
                          user={userLocalData}
                          handleEnrichLead={handleEnrichLead}
                          loading={loading}
                          creditCost={creditCost}
                        />
                      ))}

                    <ConfirmPerplexityModal
                      showConfirmPerplexity={showConfirmPerplexity}
                      setshowConfirmPerplexity={setshowConfirmPerplexity}
                      selectedLeadsDetails={selectedLeadsDetails}
                      handleEnrichLead={handleEnrichLead}
                      loading={loading}
                      creditCost={creditCost}
                    />

                    {showKYCDetails && (
                      <div>
                        {selectedLeadsDetails?.kycs.length < 1 ? (
                          <div
                            className="flex flex-col items-center justify-center w-full mt-12"
                            style={{ fontWeight: '500', fontsize: 15 }}
                          >
                            <div className="h-[51px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center">
                              <Image
                                src={'/assets/FAQ.png'}
                                height={24}
                                width={24}
                                alt="*"
                              />
                            </div>
                            <div className="mt-4">
                              <i style={{ fontWeight: '500', fontsize: 15 }}>
                                KYC Data collected from calls will be shown
                                here
                              </i>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full mt-4 pb-12">
                            {selectedLeadsDetails?.kycs.map((item, index) => {
                              return (
                                <div
                                  className="w-full flex flex-row gap-2 mt-2"
                                  key={index}
                                >
                                  <div
                                    className="h-full"
                                    style={{
                                      width: '2px',
                                      backgroundColor: 'red',
                                    }}
                                  ></div>
                                  <div className="h-full w-full">
                                    {/* <div className='mt-4' style={{ fontWeight: "600", fontSize: 15 }}>
                                            Outcome | <span style={{ fontWeight: "600", fontSize: 12 }} className='text-brand-primary'>
                                                {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                            </span>
                                        </div> */}
                                    <div
                                      className="mt-4"
                                      style={
                                        {
                                          // border: "1px solid #00000020", padding: 10, borderRadius: 15
                                        }
                                      }
                                    >
                                      <div
                                        style={{
                                          fontWeight: '500',
                                          fontSize: 15,
                                        }}
                                      >
                                        {item.question &&
                                          typeof item.question === 'string'
                                          ? item.question
                                            .split('ylz8ibb4uykg29mogltl')
                                            .join('')
                                            .trim()
                                          : ''}
                                      </div>
                                      <div
                                        className="mt-1"
                                        style={{
                                          fontWeight: '500',
                                          fontSize: 13,
                                          color: '#00000060',
                                        }}
                                      >
                                        {item.answer}
                                      </div>
                                    </div>
                                    <div></div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes go here */}
                    {showNotesDetails && (
                      <div>
                        {noteDetails?.length < 1 ? (
                          <div
                            className="flex flex-col items-center justify-center w-full mt-12"
                            style={{ fontWeight: '500', fontsize: 15 }}
                          >
                            <div className="h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center">
                              <Image
                                src={'/assets/notes.png'}
                                height={24}
                                width={24}
                                alt="*"
                              />
                            </div>
                            <div className="mt-4">
                              <i style={{ fontWeight: '500', fontsize: 15 }}>
                                You can add and manage your notes here
                              </i>
                            </div>
                            <button
                              className="flex flex-row items-center gap-1 mt-2"
                              onClick={() => {
                                setShowAddNotes(true)
                              }}
                            >
                              <Plus size={17} color="hsl(var(--brand-primary))" weight="bold" />
                              <div className="text-brand-primary">Add Notes</div>
                            </button>
                          </div>
                        ) : (
                          <div className="">
                            <div
                              className=""
                              style={{ scrollbarWidth: 'none' }}
                            >
                              {noteDetails.map((item, index) => {
                                return (
                                  <div
                                    key={index}
                                    className="border rounded-xl p-4 mb-4 mt-4"
                                    style={{ border: '1px solid #00000020' }}
                                  >
                                    <div className="flex flex-row items-center justify-between w-full">
                                      <div
                                        style={{
                                          fontWeight: '500',
                                          color: '#15151560',
                                          fontsize: 12,
                                        }}
                                      >
                                        {GetFormattedDateString(
                                          item?.createdAt,
                                          true, // Include time
                                        )}
                                      </div>
                                      <div className="flex flex-row items-center gap-2">
                                        {/* 3-dot menu - only show for manual notes */}
                                        {item.type === 'manual' && (
                                          <>
                                            <button
                                              onClick={(e) => {
                                                setNoteMenuAnchor(e.currentTarget)
                                                setSelectedNoteForMenu(item)
                                              }}
                                              className="p-1 hover:bg-gray-100 rounded"
                                              style={{ cursor: 'pointer' }}
                                            >
                                              <MoreVertical size={16} color="#6b7280" />
                                            </button>
                                            <Menu
                                              anchorEl={noteMenuAnchor}
                                              open={Boolean(noteMenuAnchor)}
                                              onClose={() => {
                                                setNoteMenuAnchor(null)
                                                setSelectedNoteForMenu(null)
                                              }}
                                              anchorOrigin={{
                                                vertical: 'bottom',
                                                horizontal: 'right',
                                              }}
                                              transformOrigin={{
                                                vertical: 'top',
                                                horizontal: 'right',
                                              }}
                                            >
                                              <MenuItem
                                                onClick={() => {
                                                  if (selectedNoteForMenu) {
                                                    setEditingNote(selectedNoteForMenu)
                                                    setEditNoteValue(selectedNoteForMenu.note)
                                                  }
                                                  setNoteMenuAnchor(null)
                                                  setSelectedNoteForMenu(null)
                                                }}
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 1,
                                                }}
                                              >
                                                <Pencil size={16} color="#6b7280" />
                                                <span>Edit</span>
                                              </MenuItem>
                                              <MenuItem
                                                onClick={() => {
                                                  if (selectedNoteForMenu) {
                                                    setDeleteNoteId(selectedNoteForMenu.id)
                                                    setShowDeleteNoteConfirm(true)
                                                  }
                                                  setNoteMenuAnchor(null)
                                                  setSelectedNoteForMenu(null)
                                                }}
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 1,
                                                  color: '#ef4444',
                                                }}
                                              >
                                                <Trash2 size={16} color="#ef4444" />
                                                <span>Delete</span>
                                              </MenuItem>
                                            </Menu>
                                          </>
                                        )}
                                        {/* Call Summary Icons - COMMENTED OUT: Moved to Activity tab
                                          {item.type === 'call_summary' && item.callSummary && (
                                            <div className="flex flex-row items-center gap-2">
                                            Sentiment Icon
                                            {item.callSummary.prospectSentiment && (
                                              <Tooltip
                                                title={`Customer Sentiment: ${item.callSummary.prospectSentiment}`}
                                                arrow
                                                componentsProps={{
                                                  tooltip: {
                                                    sx: {
                                                      backgroundColor: '#ffffff',
                                                      color: '#333',
                                                      fontSize: '14px',
                                                      padding: '10px 15px',
                                                      borderRadius: '8px',
                                                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                                      maxWidth: '300px',
                                                    },
                                                  },
                                                  arrow: {
                                                    sx: {
                                                      color: '#ffffff',
                                                    },
                                                  },
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                  }}
                                                >
                                                  <Smile size={16} color="#6b7280" />
                                                </div>
                                              </Tooltip>
                                            )}
                                            Objections Icon
                                            {item.callSummary.objectionsRaised && (
                                              <Tooltip
                                                title={
                                                  <div style={{ whiteSpace: 'pre-line' }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                      Objections:
                                                    </div>
                                                    {formatObjections(item.callSummary.objectionsRaised)}
                                                  </div>
                                                }
                                                arrow
                                                componentsProps={{
                                                  tooltip: {
                                                    sx: {
                                                      backgroundColor: '#ffffff',
                                                      color: '#333',
                                                      fontSize: '14px',
                                                      padding: '10px 15px',
                                                      borderRadius: '8px',
                                                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                                      maxWidth: '300px',
                                                    },
                                                  },
                                                  arrow: {
                                                    sx: {
                                                      color: '#ffffff',
                                                    },
                                                  },
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                  }}
                                                >
                                                  <AlertTriangle size={16} color="#ef4444" />
                                                </div>
                                              </Tooltip>
                                            )}
                                            Temperature Icon
                                            {item.callSummary.leadTemperature && (
                                              <Tooltip
                                                title={
                                                  <div style={{ whiteSpace: 'pre-line' }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                      Temperature:
                                                    </div>
                                                    {item.callSummary.leadTemperature}
                                                  </div>
                                                }
                                                arrow
                                                componentsProps={{
                                                  tooltip: {
                                                    sx: {
                                                      backgroundColor: '#ffffff',
                                                      color: '#333',
                                                      fontSize: '14px',
                                                      padding: '10px 15px',
                                                      borderRadius: '8px',
                                                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                                      maxWidth: '300px',
                                                    },
                                                  },
                                                  arrow: {
                                                    sx: {
                                                      color: '#ffffff',
                                                    },
                                                  },
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                  }}
                                                >
                                                  {getTemperatureIcon(item.callSummary.leadTemperature)}
                                                </div>
                                              </Tooltip>
                                            )}
                                            Next Steps Icon
                                            {item.callSummary.nextSteps && (
                                              <Tooltip
                                                title={
                                                  <div style={{ whiteSpace: 'pre-line' }}>
                                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                                      Next Steps:
                                                    </div>
                                                    {formatNextSteps(item.callSummary.nextSteps)}
                                                  </div>
                                                }
                                                arrow
                                                componentsProps={{
                                                  tooltip: {
                                                    sx: {
                                                      backgroundColor: '#ffffff',
                                                      color: '#333',
                                                      fontSize: '14px',
                                                      padding: '10px 15px',
                                                      borderRadius: '8px',
                                                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                                      maxWidth: '300px',
                                                    },
                                                  },
                                                  arrow: {
                                                    sx: {
                                                      color: '#ffffff',
                                                    },
                                                  },
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                  }}
                                                >
                                                  <CheckCircle2 size={16} color="#10b981" />
                                                </div>
                                              </Tooltip>
                                            )}
                                            </div>
                                          )} */}
                                      </div>
                                    </div>
                                    <div
                                      className="mt-4"
                                      style={{
                                        fontWeight: '500',
                                        color: '#151515',
                                        fontsize: 15,
                                      }}
                                    >
                                      {item.note}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <div
                              className="flex flex-col items-start justify-start w-full pb-6"
                              style={{ fontWeight: '500', fontsize: 15 }}
                            >
                              <button
                                className="flex flex-row items-center gap-1 mt-2"
                                onClick={() => {
                                  setShowAddNotes(true)
                                }}
                              >
                                <Plus
                                  size={17}
                                  color="hsl(var(--brand-primary))"
                                  weight="bold"
                                />
                                <div className="text-brand-primary">Add Notes</div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Call activity goes here */}
                    {showAcitivityDetails && (
                      <div>
                        {selectedLeadsDetails?.callActivity.length < 1 ? (
                          <div
                            className="flex flex-col items-center justify-center mt-12 w-full"
                            style={{ fontWeight: '500', fontsize: 15 }}
                          >
                            <div className="h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center">
                              <Image
                                src={'/assets/activityClock.png'}
                                height={24}
                                width={24}
                                alt="*"
                              />
                            </div>
                            <div className="mt-4">
                              <i style={{ fontWeight: '500', fontsize: 15 }}>
                                All activities related to this lead will be
                                shown here
                              </i>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {selectedLeadsDetails?.callActivity.map(
                              (item, index) => {
                                const initialTextLength = Math.ceil(
                                  item?.transcript?.length * 0.1,
                                ) // 40% of the text
                                const initialText = item.transcript //?.slice(
                                // 0,
                                // initialTextLength
                                // );
                                return (
                                  <div key={index}>
                                    <div className="mt-4">
                                      <div
                                        className="-ms-4"
                                        style={{
                                          fontsize: 15,
                                          fontWeight: '500',
                                          color: '#15151560',
                                        }}
                                      >
                                        {GetFormattedDateString(
                                          item?.createdAt,
                                          true,
                                        )}
                                      </div>
                                      <div className="w-full flex flex-row items-center gap-2 h-full">
                                        <div
                                          className="pb-4 pt-6 ps-4 w-full"
                                          style={{
                                            borderLeft: '1px solid #00000020',
                                          }}
                                        >
                                          <div className="h-full w-full">
                                            <div className="flex flex-row items-center justify-between">
                                              <div className="flex flex-row items-center gap-1">
                                                <div
                                                  style={{
                                                    width: 15,
                                                    height: 15,
                                                    backgroundColor: '#000000',
                                                    WebkitMaskImage: `url(${getCommunicationTypeIcon(item)})`,
                                                    maskImage: `url(${getCommunicationTypeIcon(item)})`,
                                                    WebkitMaskSize: 'contain',
                                                    maskSize: 'contain',
                                                    WebkitMaskRepeat: 'no-repeat',
                                                    maskRepeat: 'no-repeat',
                                                    WebkitMaskPosition: 'center',
                                                    maskPosition: 'center',
                                                  }}
                                                />
                                                <div
                                                  style={{
                                                    fontWeight: '600',
                                                    fontsize: 15,
                                                  }}
                                                >
                                                  Outcome
                                                </div>
                                                {/* <div className='text-purple' style={{ fontWeight: "600", fontsize: 12 }}>
                                                                                                        {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                                                                                    </div> */}
                                              </div>
                                              <button
                                                className="
                                                  text-end flex flex-row items-center gap-1 px-2 py-2 rounded-full
                                                  "
                                                style={{
                                                  backgroundColor: '#ececec',
                                                }}
                                                onClick={() => {
                                                  handleShowMoreActivityData(
                                                    item,
                                                  )
                                                }}
                                              >
                                                <div
                                                  className="h-[10px] w-[10px] rounded-full"
                                                  style={{
                                                    backgroundColor:
                                                      showColor(item),
                                                  }}
                                                ></div>

                                                {getOutcome(item)}
                                                {/* {checkCallStatus(item)} */}

                                                {item.callOutcome !==
                                                  'No Answer' && (
                                                    <div>
                                                      {isExpandedActivity.includes(
                                                        item.id,
                                                      ) ? (
                                                        <div>
                                                          <CaretUp
                                                            size={17}
                                                            weight="bold"
                                                          />
                                                        </div>
                                                      ) : (
                                                        <div>
                                                          <CaretDown
                                                            size={17}
                                                            weight="bold"
                                                          />
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                              </button>
                                            </div>
                                            {isExpandedActivity.includes(
                                              item.id,
                                            ) &&
                                              (item.status === 'voicemail' ||
                                                item.callOutcome ===
                                                'Voicemail' ? (
                                                <div className="border rounded mt-2 w-full p-4">
                                                  <button
                                                    onClick={() =>
                                                      handleCopy(item.callId)
                                                    }
                                                  >
                                                    <Image
                                                      src={
                                                        '/svgIcons/copy.svg'
                                                      }
                                                      height={15}
                                                      width={15}
                                                      alt="*"
                                                    />
                                                  </button>
                                                  {item.agent.hasVoicemail ? (
                                                    <NoVoicemailView
                                                      showAddBtn={false}
                                                      title={
                                                        'Voicemail Delivered'
                                                      }
                                                      subTitle={
                                                        'Delivered during the first missed call'
                                                      }
                                                    />
                                                  ) : (
                                                    <NoVoicemailView
                                                      showAddBtn={false}
                                                      title={
                                                        'Not able to Leave a Voicemail'
                                                      }
                                                      subTitle={
                                                        'The phone was either a landline or has a full voicemail'
                                                      }
                                                    />
                                                  )}
                                                </div>
                                              ) : (
                                                <>
                                                  <div
                                                    className="mt-6"
                                                    style={{
                                                      border:
                                                        '1px solid #00000020',
                                                      borderRadius: '10px',
                                                      padding: 10,
                                                      paddingInline: 15,
                                                    }}
                                                  >
                                                    {item.communicationType ===
                                                      'sms' ||
                                                      item.communicationType ==
                                                      'email'
                                                      ? emailSmsTranscript(
                                                        item,
                                                      )
                                                      : callTranscript(
                                                        item,
                                                        initialText,
                                                      )}

                                                  </div>
                                                </>
                                              ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              },
                            )}
                          </div>
                        )}
                      </div>
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

          {/* Show Transcript UI Modal*/}

          <Modal
            open={isExpanded}
            onClose={() => setIsExpanded(null)}
            closeAfterTransition
            BackdropProps={{
              timeout: 1000,
              sx: {
                backgroundColor: '#00000020',
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
                  <div className="w-full flex flex-row items-center justify-between">
                    <div className="font-bold text-xl mt-4 mb-4">
                      Call Transcript
                    </div>
                    <div>
                      <button
                        className="font-bold outline-none border-none"
                        onClick={() => setIsExpanded(null)}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  </div>
                  <TranscriptViewer callId={isExpanded?.id || ''} />
                </div>
              </div>
            </Box>
          </Modal>
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
          },
        }}
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: '#00000020',
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        {mainContent}
      </Drawer>

      {/* Modal to edit note */}
      <Modal
        open={!!editingNote}
        onClose={() => {
          setEditingNote(null)
          setEditNoteValue('')
        }}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box
          className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 h-[70vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: 'none' }}
        >
          <div className="flex flex-row justify-center w-full h-[50vh]">
            <div
              className="w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                paddingInline: 30,
                borderRadius: '13px',
                height: '100%',
              }}
            >
              <div style={{ fontWeight: '700', fontsize: 22 }}>
                Edit your note
              </div>
              <div
                className="mt-4"
                style={{
                  height: '70%',
                  overflow: 'auto',
                }}
              >
                <TextareaAutosize
                  maxRows={12}
                  className="outline-none focus:outline-none focus:ring-0 w-full"
                  style={{
                    fontsize: 15,
                    fontWeight: '500',
                    height: '250px',
                    border: '1px solid #00000020',
                    resize: 'none',
                    borderRadius: '13px',
                  }}
                  placeholder="Edit note"
                  value={editNoteValue}
                  onChange={(event) => {
                    setEditNoteValue(event.target.value)
                  }}
                />
              </div>
              <div className="w-full mt-4 h-[20%] flex flex-row justify-center gap-2">
                {editNoteLoader ? (
                  <CircularProgress size={25} />
                ) : (
                  <>
                    <button
                      className="bg-gray-200 h-[50px] rounded-xl text-gray-700 rounded-xl w-3/12"
                      style={{
                        fontWeight: '600',
                        fontsize: 16,
                      }}
                      onClick={() => {
                        setEditingNote(null)
                        setEditNoteValue('')
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-brand-primary h-[50px] rounded-xl text-white rounded-xl w-3/12"
                      style={{
                        fontWeight: '600',
                        fontsize: 16,
                      }}
                      onClick={handleEditNote}
                    >
                      Update
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal to confirm note deletion */}
      <Modal
        open={showDeleteNoteConfirm}
        onClose={() => {
          setShowDeleteNoteConfirm(false)
          setDeleteNoteId(null)
        }}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
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
                Are you sure you want to delete this note?
              </div>
              <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                <button
                  className="w-1/2 font-bold text-xl text-[#6b7280] h-[50px]"
                  onClick={() => {
                    setShowDeleteNoteConfirm(false)
                    setDeleteNoteId(null)
                  }}
                >
                  Cancel
                </button>
                {deleteNoteLoader ? (
                  <CircularProgress size={20} />
                ) : (
                  <button
                    className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                    onClick={handleDeleteNote}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal to add notes */}

      <Modal
        open={showAddNotes}
        onClose={() => setShowAddNotes(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
          },
        }}
      >
        <Box
          className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 h-[70vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: 'none' }}
        >
          <div className="flex flex-row justify-center w-full h-[50vh]">
            <div
              className="w-full"
              style={{
                backgroundColor: '#ffffff',
                padding: 20,
                paddingInline: 30,
                borderRadius: '13px',
                // paddingBottom: 10,
                // paddingTop: 10,
                height: '100%',
              }}
            >
              <div style={{ fontWeight: '700', fontsize: 22 }}>
                Add your notes
              </div>
              <div
                className="mt-4"
                style={{
                  height: '70%',
                  overflow: 'auto',
                }}
              >
                <TextareaAutosize
                  maxRows={12}
                  className="outline-none focus:outline-none focus:ring-0 w-full"
                  style={{
                    fontsize: 15,
                    fontWeight: '500',
                    height: '250px',
                    border: '1px solid #00000020',
                    resize: 'none',
                    borderRadius: '13px',
                  }}
                  placeholder="Add notes"
                  value={addNotesValue}
                  onChange={(event) => {
                    setddNotesValue(event.target.value)
                  }}
                />
              </div>
              <div className="w-full mt-4 h-[20%] flex flex-row justify-center">
                {addLeadNoteLoader ? (
                  <CircularProgress size={25} />
                ) : (
                  <button
                    className="bg-brand-primary h-[50px] rounded-xl text-white rounded-xl w-6/12"
                    style={{
                      fontWeight: '600',
                      fontsize: 16,
                    }}
                    onClick={() => {
                      handleAddLeadNotes()
                    }}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>

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

      {/* Modal for audio play */}
      {/* <Modal
        open={showAudioPlay}
        onClose={() => setShowAudioPlay(null)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-3/12 sm:w-5/12 w-3/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center">
            <div
              className="w-full flex flex-col items-center"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              
              <audio controls>
                <source src={showAudioPlay?.recordingUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <button
                className="text-white w-full h-[50px] rounded-lg bg-brand-primary mt-4"
                onClick={() => {
                  setShowAudioPlay(null);
                }}
                style={{ fontWeight: "600", fontSize: 15 }}
              >
                Close
              </button>

              
            </div>
          </div>
        </Box>
      </Modal> */}

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

      {/* Email Template Modal */}
      <EmailTempletePopup
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        communicationType="email"
        addRow={null}
        isEditing={false}
        editingRow={null}
        onUpdateRow={null}
        selectedGoogleAccount={selectedGoogleAccount}
        setSelectedGoogleAccount={setSelectedGoogleAccount}
        onSendEmail={sendEmailToLead}
        isLeadEmail={true}
        leadEmail={
          selectedLeadsDetails?.email ||
          selectedLeadsDetails?.emails?.[0]?.email
        }
        leadId={selectedLeadsDetails?.id}
      />

      {/* SMS Template Modal */}
      <SMSTempletePopup
        open={showSMSModal}
        onClose={() => setShowSMSModal(false)}
        phoneNumbers={phoneNumbers}
        phoneLoading={phoneLoading}
        communicationType="sms"
        addRow={null}
        isEditing={false}
        editingRow={null}
        onUpdateRow={null}
        onSendSMS={sendSMSToLead}
        isLeadSMS={true}
        leadPhone={selectedLeadsDetails?.phone}
        leadId={selectedLeadsDetails?.id}
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
                let user = await getProfileDetails()
                if (user) {
                  setUserLocalData(user.data.data)
                }
              }
              await getData()
            }
          }}
          plan={selectedPlan}
          currentFullPlan={currentFullPlan}
        />
      </Elements>
    </div>
  )
}

export default LeadDetails
