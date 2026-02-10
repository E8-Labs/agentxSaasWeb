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
} from '@mui/material'
import {
  CaretDown,
  CaretUp,
  EnvelopeSimple,
  Plus,
  X,
} from '@phosphor-icons/react'
import axios from 'axios'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { Phone } from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { TranscriptViewer } from '@/components/calls/TranscriptViewer'
import CallTranscriptModal from '@/components/dashboard/leads/extras/CallTranscriptModal'
import { UpgradeTagWithModal } from '@/components/constants/constants'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import LeadTeamsAssignedList from '@/components/dashboard/leads/LeadTeamsAssignedList'
import SelectStageDropdown from '@/components/dashboard/leads/StageSelectDropdown'
import NoVoicemailView from '@/components/dashboard/myagentX/NoVoicemailView'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { AssignTeamMember } from '@/components/onboarding/services/apisServices/ApiService'
import AuthSelectionPopup from '@/components/pipeline/AuthSelectionPopup'
import EmailTempletePopup from '@/components/pipeline/EmailTempletePopup'
import SMSTempletePopup from '@/components/pipeline/SMSTempletePopup'
import {
  getA2PNumbers,
  getGmailAccounts,
} from '@/components/pipeline/TempleteServices'
import ScoringProgress from '@/components/ui/ScoringProgress'
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import { calculateCreditCost } from '@/services/LeadsServices/LeadsServices'
import { useUser } from '@/hooks/redux-hooks'
import CircularLoader from '@/utilities/CircularLoader'
import { capitalize } from '@/utilities/StringUtility'
import { getAgentsListImage } from '@/utilities/agentUtilities'
import { GetFormattedDateString } from '@/utilities/utility'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import ConfirmPerplexityModal from '@/components/dashboard/leads/extras/CofirmPerplexityModal'
import DeleteCallLogConfimation from '@/components/dashboard/leads/extras/DeleteCallLogConfimation'
import NoPerplexity from '@/components/dashboard/leads/extras/NoPerplexity'
import Perplexity from '@/components/dashboard/leads/extras/Perplexity'
import { Tooltip } from '@mui/material'
import AdminGetProfileDetails from '../AdminGetProfileDetails'
import ActivityTabCN from '@/components/dashboard/leads/extras/ActivityTabCN'

const AdminLeadDetails = ({
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
  selectedUser,
}) => {
  // //console.log;
  // //console.log;

  const [columnsLength, setcolumnsLength] = useState([])
  const [showTeams, setShowTeams] = useState(false)


  const [initialLoader, setInitialLoader] = useState(false)

  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null)
  const [leadColumns, setLeadColumns] = useState([])

  const [globalLoader, setGlobalLoader] = useState(false)
  //code for emailPopup
  const [showAllEmails, setShowAllEmails] = useState(false)

  //code for buttons of details popup - using activeTab instead of individual booleans
  const [activeTab, setActiveTab] = useState('activity')

  //code for notes - noteDetails is still needed to pass to NotesTabCN
  const [noteDetails, setNoteDetails] = useState([])

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState(null)
  const [isExpandedActivity, setIsExpandedActivity] = useState([])

  const [expandedCustomFields, setExpandedCustomFields] = useState([]) // check if the custom fields Read More or Read less should show

  //code for audio play popup
  const [showAudioPlay, setShowAudioPlay] = useState(null)
  const [showNoAudioPlay, setShowNoAudioPlay] = useState(false)

  //show custom variables
  const [showCustomVariables, setShowCustomVariables] = useState(false)

  //code for del tag
  const [DelTagLoader, setDelTagLoader] = useState(null)

  //code for stages drop down
  const [selectedStage, setSelectedStage] = useState('')
  const [stagesList, setStagesList] = useState([])
  const [stagesListLoader, setStagesListLoader] = useState(false)

  //code for snakbars
  const [showSuccessSnack, setShowSuccessSnack] = useState(null)
  const [showSuccessSnack2, setShowSuccessSnack2] = useState(false)
  const [showErrorSnack, setShowErrorSnack] = useState(null)
  const [showErrorSnack2, setShowErrorSnack2] = useState(false)

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

  // Redux user hook for upgrade tag
  const { user: reduxUser, setUser: setReduxUser } = useUser()

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
  const [showAuthSelectionPopup, setShowAuthSelectionPopup] = useState(false)
  
  // Send action dropdown anchor
  const [sendActionAnchor, setSendActionAnchor] = useState(null)

  // Stripe configuration for upgrade modal
  const stripePromise = getStripe()

  // Upgrade modal states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentFullPlan, setCurrentFullPlan] = useState(null)

  const [creditCost, setCreditCost] = useState(null)
  const [userLocalData, setUserLocalData] = useState('')
  const [loading, setLoading] = useState(false)

  const [showConfirmPerplexity, setshowConfirmPerplexity] = useState(false)
  const [showDelModal, setShowDelModal] = useState(false)
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)
  const [seletedCallLog, setSelectedCallLog] = useState(null)
  const [delCallLoader, setdelCallLoader] = useState(false)

  //code for stages drop down
  const [updateLeadLoader, setUpdateLeadLoader] = useState(false)

  useEffect(() => {
    //console.log;
  }, [])

  useEffect(() => {
    const getData = async () => {
      if (!selectedUser?.id) return
      
      let user = await AdminGetProfileDetails(selectedUser.id)
      if (user) {
        setUserLocalData(user)
      }
    }

    if (selectedUser?.id) {
      getNumbers()
      getData()
      getCreditCost()
      getUniqueColumns()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id])

  useEffect(() => {
    getGoogleAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.id])

  useEffect(() => {
    if (!selectedLead) return
    getLeadDetails(selectedLead)
    if (pipelineId) {
      // //console.log;
      getStagesList(selectedLead)
    }
    getMyteam()
  }, [selectedLead, pipelineId])

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

  const getNumbers = async () => {
    if (!selectedUser?.id) {
      setPhoneNumbers([])
      setPhoneLoading(false)
      return
    }

    setPhoneLoading(true)
    let id = selectedUser.id
    let num = await getA2PNumbers(id)
    
    if (num) {
      setPhoneNumbers(num)
    } else {
      setPhoneNumbers([])
    }
    setPhoneLoading(false)
  }

  const getGoogleAccounts = async () => {
    let accounts = await getGmailAccounts(selectedUser?.id)
    setGoogleAccounts(accounts)
    setSelectedGoogleAccount(accounts[0] || null)
  }

  //code for getting teammebers
  const getMyteam = async () => {
    if (!selectedUser?.id) {
      setMyTeam([])
      setGetTeamLoader(false)
      return
    }

    try {
      setGetTeamLoader(true)
      const data = localStorage.getItem('User')

      if (data) {
        let u = JSON.parse(data)

        let path = Apis.getTeam
        // Add userId parameter to fetch team members for the selected user
        path = path + `?userId=${selectedUser.id}`

        const response = await axios.get(path, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response) {
          setGetTeamLoader(false)

          if (response.data.status === true) {
            //console.log;
            // Include admin in the team list
            let admin = response.data.admin
            let adminMember = {
              invitingUser: admin,
              invitedUser: admin,
              id: -1,
              status: 'Admin',
              name: admin.name,
              email: admin.email,
              phone: admin.phone,
            }
            let array = [adminMember, ...response.data.data]
            if (response.data.data.length == 0) {
              array = []
            }
            setMyTeam(array)
            setMyTeamAdmin(response.data.admin)
          } else {
            // //console.log;
            setMyTeam([])
          }
        }
      }
    } catch (e) {
      setGetTeamLoader(false)
      console.error('Error getting team members:', e)
      setMyTeam([])
    }
  }

  //function to assign lead to the team
  const handleAssignLeadToTeammember = async (item) => {
    try {
      //console.log;
      handleClosePopup()
      setGlobalLoader(true)
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
      let response = await AssignTeamMember(ApiData, selectedUser)
      if (response && response.data && response.data.status === true) {
        setSelectedLeadsDetails((prevData) => {
          return {
            ...prevData,
            teamsAssigned: [...prevData.teamsAssigned, item],
          }
        })
        leadAssignedTeam(item, selectedLeadsDetails)
      }
      //console.log;
    } catch (error) {
      console.error("Error occurred in assign lead to team member:", error);
    } finally {
      setGlobalLoader(false)
      handleClosePopup()
    }
  }

  //function to handle stages dropdown selection
  const handleStageChange = (event) => {
    //// //console.log
    setSelectedStage(event.target.value)
    // updateLeadStage();
  }

  //function to update stage
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
        leadId: selectedLead,
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
          setShowSuccessSnack(response.data.message)
          setShowSuccessSnack2(true)
          leadStageUpdated(stage)
        } else if (response.data.status === false) {
          setShowErrorSnack(response.data.message)
          setShowErrorSnack2(true)
        }
      }
    } catch (error) {
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

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //console.log;
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
        //// //console.log
        setSelectedStage(response?.data?.data?.stage?.stageTitle)
        // setSelectedStage(response?.data?.data?.stage?.stageTitle);
        setLeadColumns(dynamicColumns)
        setcolumnsLength(response?.data?.columns)
        setNoteDetails(response.data.data.notes)
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

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //console.log;
        if (response.data.status === true) {
          //console.log;
          setStagesList(response.data.data.stages)
        }
      }
    } catch (error) {
      console.error('Error occured in stage list api is', error)
    } finally {
      setStagesListLoader(false)
      // //console.log;
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
        // //console.log;
        if (response.data.status === true) {
          // //console.log;

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
      // console.error("Error occured in api is:", error);
    } finally {
      setDelTagLoader(null)
    }
  }

  //fucntion to read more transcript text
  const handleReadMoreToggle = (item) => {
    // setIsExpanded(!isExpanded);
    setIsExpanded(item)
    // setIsExpanded((prevIds) => {
    //     if (prevIds.includes(item.id)) {
    //         // Unselect the item if it's already selected
    //         return prevIds.filter((prevId) => prevId !== item.id);
    //     } else {
    //         // Select the item if it's not already selected
    //         return [...prevIds, item.id];
    //     }
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
        if (response.data.status === true) {
          showSnackbar(response.data.message || 'Lead deleted successfully', SnackbarTypes.Success)
          setShowDetailsModal(false)
          handleDelLead(selectedLeadsDetails)
        } else {
          showSnackbar(response.data.message || 'Failed to delete lead', SnackbarTypes.Error)
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setDelLeadLoader(false)
    }
  }

  const handleCopy = async (id) => {
    try {
      await navigator.clipboard.writeText(id)
      setShowSuccessSnack('Call ID copied to the clipboard.')
      setShowSuccessSnack2(true)
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

            setShowSuccessSnack('Call activity deleted')
            setShowSuccessSnack2(true)
          }
        }
      }
    } catch (e) {} finally {
      setdelCallLoader(false)
    }
  }


  // Send email API function
  const sendEmailToLead = async (emailData) => {
    try {
      setSendEmailLoader(true)

      const localData = localStorage.getItem('User')
      if (!localData) {
        throw new Error('User not found')
      }

      const userData = JSON.parse(localData)
      const formData = new FormData()

      formData.append('leadId', selectedLeadsDetails?.id)
      formData.append('subject', emailData.subject || '')
      formData.append('content', emailData.content || '')
      formData.append('ccEmails', JSON.stringify(emailData.ccEmails || []))
      formData.append(
        'emailAccountId',
        JSON.stringify(selectedGoogleAccount.id || []),
      )

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
        setShowSuccessSnack('Email sent successfully!')
        setShowSuccessSnack2(true)
        setShowEmailModal(false)
      } else {
        setShowErrorSnack(response.data.message || 'Failed to send email')
        setShowErrorSnack2(true)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setShowErrorSnack(error?.response?.data?.error||"Failed to send email")
      setShowErrorSnack2(true)
      setSendEmailLoader(false)
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

      formData.append('leadPhone', selectedLeadsDetails?.phone || '')
      formData.append('content', smsData.content || '')
      formData.append('phone', smsData.phone || '')
      formData.append('leadId', smsData.leadId || '')
      if (smsData.smsPhoneNumberId != null && smsData.smsPhoneNumberId !== '') {
        formData.append('smsPhoneNumberId', smsData.smsPhoneNumberId)
      }

      const response = await axios.post(Apis.sendSMSToLead, formData, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.status === true) {
        setShowSuccessSnack('Text sent successfully!')
        setShowSuccessSnack2(true)
        setShowSMSModal(false)
      } else {
        setShowErrorSnack(response.data.message || 'Failed to send SMS')
        setShowErrorSnack2(true)
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      setShowErrorSnack('Failed to send SMS. Please try again.')
      setShowErrorSnack2(true)
    } finally {
      setSendSMSLoader(false)
    }
  }

  const handleEnrichLead = async () => {
    // Check if lead is already in queue for enrichment
    if (selectedLeadsDetails?.enrich === true) {
      setShowErrorSnack('Lead is already in queue for enrichment')
      setShowErrorSnack2(true)
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

        const response = await axios.post(Apis.enrichLead, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          setLoading(false)
          if (response.data.status === true) {
            setSelectedLeadsDetails(response.data.data)
            let credits = u.user.enrichCredits

            setShowSuccessSnack(response.data.message)
            setShowSuccessSnack2(true)

            if (credits == 0) {
              u.user.enrichCredits = 99
            } else {
              u.user.enrichCredits = credits - 1
            }

            localStorage.setItem('User', JSON.stringify(u))

            setshowConfirmPerplexity(false)
          } else {
            setShowErrorSnack(response.data.message)
            setShowErrorSnack2(true)
          }
        }
      }
    } catch (e) {
      setLoading(false)
    } finally {
      setLoading(false)
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

  function getExtraColumsCount(columns) {
    // //console.log
    let count = 0
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


  return (
    <div className="h-[100svh]">
      <Modal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: '#00000050', // Semi-transparent background
          },
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 14,
            right: 25,
            width: '60vw', // Increased width
            maxWidth: '800px', // Increased max width
            height: '96vh',
            bgcolor: 'white',
            boxShadow: 3,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.7s ease-in-out',
            borderRadius: 5,
          }}
        >
          <div className="flex flex-col w-full h-full  py-2 px-5 rounded-xl">
            <div className="w-full flex flex-col items-center h-full">
              <AgentSelectSnackMessage
                isVisible={showSuccessSnack2}
                hide={() => setShowSuccessSnack2(false)}
                message={showSuccessSnack}
                type={SnackbarTypes.Success}
              />
              <AgentSelectSnackMessage
                isVisible={showErrorSnack2}
                hide={() => setShowErrorSnack2(false)}
                message={showErrorSnack2}
                type={SnackbarTypes.Error}
              />

              <div className="w-full">
                {initialLoader ? (
                  <div className="w-full flex flex-row items-center justify-center mt-24">
                    <CircularProgress size={45} thickness={2} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                ) : (
                  <div
                    className="h-[90svh] overflow-auto"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    <div
                      style={{
                        padding: 20,
                        paddingInline: 30,
                      }}
                    >
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
                      <div>
                        <div className="flex flex-row items-start justify-between mt-4  w-full">
                          <div className="flex flex-col items-start gap-[5px] ">
                            <div className="flex flex-row items-center gap-4">
                              {selectedLeadsDetails?.agent ? (
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
                                >
                                  {selectedLeadsDetails?.firstName?.slice(0, 1) ||
                                    '-'}
                                </div>
                              )}
                              <div
                                className="truncate"
                              >
                                {selectedLeadsDetails?.firstName}{' '}
                                {selectedLeadsDetails?.lastName}
                              </div>

                              {/* Send Action Dropdown Button */}
                              <div className="relative">
                                <button
                                  className="flex flex-row items-center gap-1 px-2 py-1 border border-brand-primary text-brand-primary rounded-lg"
                                  onClick={(e) => setSendActionAnchor(e.currentTarget)}
                                >
                                  <span className="text-[12px] font-[400]">Send</span>
                                  <CaretDown size={12} weight="bold" />
                                </button>
                                <Menu
                                  anchorEl={sendActionAnchor}
                                  open={Boolean(sendActionAnchor)}
                                  onClose={() => setSendActionAnchor(null)}
                                  anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                  }}
                                  transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                  }}
                                  PaperProps={{
                                    style: {
                                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                      borderRadius: '12px',
                                      minWidth: '150px',
                                    },
                                  }}
                                >
                                  {/* Email Option */}
                                  {(selectedLeadsDetails?.email ||
                                    selectedLeadsDetails?.emails?.length > 0) && (
                                    <MenuItem
                                      onClick={() => {
                                        setSendActionAnchor(null)
                                        if (googleAccounts.length === 0) {
                                          setShowAuthSelectionPopup(true)
                                        } else {
                                          setShowEmailModal(true)
                                        }
                                      }}
                                      disabled={sendEmailLoader}
                                    >
                                      <div className="flex flex-row items-center gap-2 w-full">
                                        <Image
                                          src="/otherAssets/sendEmailIcon.png"
                                          width={20}
                                          height={20}
                                          alt="email"
                                          style={{
                                            filter: 'brightness(0)',
                                          }}
                                        />
                                        <span>Email</span>
                                      </div>
                                    </MenuItem>
                                  )}
                                  {/* Text Option */}
                                  {selectedLeadsDetails?.phone && (
                                    <MenuItem
                                      onClick={() => {
                                        if (sendSMSLoader ||
                                          !userLocalData?.planCapabilities
                                            ?.allowTextMessages ||
                                          phoneNumbers.length == 0) return
                                        setSendActionAnchor(null)
                                        setShowSMSModal(true)
                                      }}
                                      sx={{
                                        opacity: (!userLocalData?.planCapabilities
                                          ?.allowTextMessages ||
                                          phoneNumbers.length == 0) ? 0.6 : 1,
                                      }}
                                    >
                                      <div className="flex flex-row items-center gap-2 w-full">
                                        <Image
                                          src="/otherAssets/sendSmsIcon.png"
                                          width={20}
                                          height={20}
                                          alt="text"
                                          style={{
                                            filter: 'brightness(0)',
                                          }}
                                        />
                                        <span>Text</span>
                                        {(!userLocalData?.planCapabilities
                                          ?.allowTextMessages ||
                                          phoneNumbers.length == 0) && (
                                          <UpgradeTagWithModal
                                            reduxUser={userLocalData}
                                            setReduxUser={setUserLocalData}
                                            selectedUser={selectedUser}
                                          />
                                        )}
                                      </div>
                                    </MenuItem>
                                  )}
                                  {/* Call Option */}
                                  {process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT !== 'Production' &&
                                    selectedLeadsDetails?.phone && (
                                      <MenuItem
                                        onClick={() => {
                                          setSendActionAnchor(null)
                                          // Dialer functionality can be added here if needed for admin view
                                        }}
                                      >
                                        <div className="flex flex-row items-center gap-2 w-full">
                                          <Image
                                            src="/otherAssets/callIcon.png"
                                            width={20}
                                            height={20}
                                            alt="call"
                                            style={{
                                              filter: 'brightness(0)',
                                            }}
                                          />
                                          <span>Call</span>
                                        </div>
                                      </MenuItem>
                                    )}
                                </Menu>
                              </div>

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
                          {/* Email Field */}
                          {(selectedLeadsDetails?.email ||
                            selectedLeadsDetails?.emails?.length > 0) && (
                            <div className="flex flex-row items-center gap-2">
                              <Image
                                src="/otherAssets/email.png"
                                width={16}
                                height={16}
                                alt="email"
                                style={{
                                  filter: 'brightness(0)',
                                }}
                              />
                              <div style={styles.heading2}>
                                {selectedLeadsDetails?.email ? (
                                  selectedLeadsDetails?.email
                                ) : (
                                  <div>
                                    {selectedLeadsDetails?.emails
                                      ?.slice(0, 1)
                                      .map((email, emailIndex) => {
                                        return (
                                          <div
                                            key={emailIndex}
                                            className="flex flex-row items-center gap-2"
                                          >
                                            <div
                                              className="flex flex-row items-center gap-2 px-1 mt-1 rounded-lg border border-[#00000020]"
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
                                                {email.email}
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
                                                ? `+${
                                                    selectedLeadsDetails?.emails
                                                      ?.length - 1
                                                  }`
                                                : ''}
                                            </button>
                                          </div>
                                        )
                                      })}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {selectedLeadsDetails?.phone && (
                            <div className="flex flex-row items-center gap-2">
                              <Image
                                src="/otherAssets/phone.png"
                                width={16}
                                height={16}
                                alt="phone"
                                style={{
                                  filter: 'brightness(0)',
                                }}
                              />
                              <div style={styles.heading2}>
                                {formatPhoneNumber(
                                  selectedLeadsDetails?.phone,
                                ) || '-'}
                              </div>
                              {selectedLeadsDetails?.cell != null && (
                                <div
                                  className="rounded-full font-medium justify-center items-center color-[#ffffff] p-0.2 px-2 bg-[#15151580]"
                                  style={{ color: 'white' }}
                                >
                                  {selectedLeadsDetails?.cell}
                                </div>
                              )}
                            </div>
                          )}

                          {selectedLeadsDetails?.address && (
                            <div className="flex flex-row items-center gap-2">
                              <Image
                                src="/otherAssets/location.png"
                                width={16}
                                height={16}
                                alt="location"
                                style={{
                                  filter: 'brightness(0)',
                                }}
                              />
                              <div style={styles.heading2}>
                                {selectedLeadsDetails?.address || '-'}
                              </div>
                            </div>
                          )}
                          {selectedLeadsDetails?.tags.length > 0 && (
                            <div className="flex flex-row items-center gap-2">
                              <Image
                                src="/otherAssets/tag.png"
                                width={16}
                                height={16}
                                alt="tag"
                                style={{
                                  filter: 'brightness(0)',
                                }}
                              />
                              <div>
                                {selectedLeadsDetails?.tags.length > 0 ? (
                                  <div
                                    className="text-end flex flex-row items-center gap-2 "
                                  >
                                    {
                                      selectedLeadsDetails?.tags
                                        .slice(0, 2)
                                        .map((tag, index) => {
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
                                                  className="text-brand-primary"
                                                >
                                                  {tag}
                                                </div>
                                                {DelTagLoader &&
                                                tag.includes(DelTagLoader) ? (
                                                  <div>
                                                    <CircularProgress
                                                      size={15}
                                                    />
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
                                        })
                                    }
                                    <button
                                      className="outline-none"
                                      onClick={() => {
                                        setExtraTagsModal(true)
                                      }}
                                    >
                                      {selectedLeadsDetails?.tags.length >
                                        2 && (
                                        <div className="text-brand-primary underline">
                                          +
                                          {selectedLeadsDetails?.tags.length -
                                            2}
                                        </div>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </div>
                            </div>
                          )}

                          {selectedLeadsDetails?.pipeline && (
                            <div className="flex flex-row items-center gap-2">
                              <Image
                                src="/otherAssets/pipeline2.png"
                                width={20}
                                height={20}
                                alt="pipeline"
                                style={{
                                  filter: 'brightness(0)',
                                }}
                              />
                              <div style={styles.heading2}>
                                {selectedLeadsDetails?.pipeline
                                  ? selectedLeadsDetails?.pipeline?.title
                                  : '-'}
                              </div>
                            </div>
                          )}

                          <div>
                            {selectedLeadsDetails?.booking && (
                              <div className="flex flex-row items-center gap-2">
                                <Image
                                  src="/otherAssets/Calendar.png"
                                  width={16}
                                  height={16}
                                  alt="calendar"
                                  style={{
                                    filter: 'brightness(0)',
                                  }}
                                />
                                <div style={styles.heading2}>
                                  {GetFormattedDateString(
                                    selectedLeadsDetails.booking.datetime,
                                    true,
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          </div>

                          <div className="flex flex-col items-end gap-[5px]">
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
                                  <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
                                ) : (
                                  <>
                                    <div
                                      className="h-[10px] w-[10px] rounded-full"
                                      style={{
                                        backgroundColor:
                                          selectedLeadsDetails?.stage
                                            ?.defaultColor,
                                      }}
                                    ></div>

                                    {updateLeadLoader ? (
                                      <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
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
                            {selectedLeadsDetails?.teamsAssigned?.length > 0 ? (
                              <div className="">
                                  <LeadTeamsAssignedList
                                    users={selectedLeadsDetails?.teamsAssigned}
                                  />
                                </div>
                              ) : globalLoader ? (
                                <CircularProgress size={25} sx={{ color: 'hsl(var(--brand-primary))' }} />
                              ) : (
                              <div className="flex flex-col w-full max-w-full overflow-hidden">
                                <div className="flex flex-row items-center gap-2">
                                  <Image
                                    src="/otherAssets/assignTeamIcon.png"
                                    width={16}
                                    height={16}
                                    alt="assign team"
                                    style={{
                                      filter: 'brightness(0)',
                                    }}
                                  />
                                  <button
                                    className="outline-none flex flex-row items-center gap-1"
                                    onClick={(event) => {
                                      handleShowPopup(event)
                                    }}
                                  >
                                    <div style={styles.heading2}>
                                      Assign Team
                                    </div>
                                  </button>
                                </div>
                                <div className="flex w-full">
                                  {showTeams && (
                                    <div className="flex flex-col mt-4 gap-1 w-full max-w-full overflow-hidden">
                                      {myTeam.map((user) => (
                                        <div
                                          key={user.id}
                                          className="flex space-x-3 overflow-x-auto items-center"
                                        >
                                          <div className="flex items-center space-x-1">
                                            <div className="w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                              {user?.name?.charAt(0)}
                                            </div>
                                            <span className="text-gray-700 text-sm">
                                              {user?.name}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                              )}
                            </div>
                              </div>
                            )}
                          </div>
                        </div>


                      {getExtraColumsCount(columnsLength) >= 1 && (
                        <div className="flex flex-row items-center gap-2 mt-3">
                          <Image
                            src="/assets/customsIcon.svg"
                            width={16}
                            height={16}
                            alt="custom fields"
                            style={{
                              filter: 'brightness(0)',
                            }}
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
                                    className="h-[50px] rounded-xl bg-purple text-white w-full"
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
                                          <div className="flex flex-row items-center gap-2 bg-purple10 px-2 py-1 rounded-lg">
                                            <div
                                              className="text-brand-primary" //1C55FF10
                                            >
                                              {tag}
                                            </div>
                                            {DelTagLoader &&
                                            tag.includes(DelTagLoader) ? (
                                              <div>
                                                <CircularProgress size={15} sx={{ color: 'hsl(var(--brand-primary))' }} />
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
                                  >
                                    {myTeamAdmin?.name?.slice(0, 1)}
                                  </div>
                                )}
                              </div>
                              <div className="">{myTeamAdmin?.name}</div>
                              <div className="bg-purple text-white text-sm px-2 rounded-full">
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
                                      {item?.invitedUser
                                        ?.thumb_profile_image ? (
                                        <Image
                                          className="rounded-full"
                                          src={
                                            item.invitedUser
                                              ?.thumb_profile_image
                                          }
                                          height={32}
                                          width={32}
                                          alt="*"
                                          style={{}}
                                        />
                                      ) : (
                                        <div
                                          className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                                        >
                                          {item?.name?.slice(0, 1)}
                                        </div>
                                      )}
                                      {item.name}
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
                              ? 'hsl(var(--brand-primary))05'
                              : '',
                      }}
                      onClick={() => {
                            setShowPerpelexityDetails(true)
                            setShowKycDetails(false)
                            setShowNotesDetails(false)
                            setShowAcitivityDetails(false)
                      }}
                    >
                      {showPerplexityDetails ? (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: 'hsl(var(--brand-primary))',
                            maskImage: 'url(/svgIcons/sparklesPurple.svg)',
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskImage: 'url(/svgIcons/sparklesPurple.svg)',
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                          }}
                        />
                      ) : (
                        <Image
                          src="/svgIcons/sparkles.svg"
                          width={20}
                          height={20}
                          alt="*"
                        />
                      )}
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
                            backgroundColor: showKYCDetails ? 'hsl(var(--brand-primary))05' : '',
                          }}
                          onClick={() => {
                            setShowPerpelexityDetails(false)
                            setShowKycDetails(true)
                            setShowNotesDetails(false)
                            setShowAcitivityDetails(false)
                          }}
                        >
                          {showKYCDetails ? (
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                backgroundColor: 'hsl(var(--brand-primary))',
                                maskImage: 'url(/svgIcons/selectedKycIcon.svg)',
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskImage: 'url(/svgIcons/selectedKycIcon.svg)',
                                WebkitMaskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                              }}
                            />
                          ) : (
                            <Image
                              src="/svgIcons/unselectedKycIcon.svg"
                              width={24}
                              height={24}
                              alt="*"
                            />
                          )}
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
                              ? 'hsl(var(--brand-primary))05'
                              : '',
                          }}
                          onClick={() => {
                            setShowPerpelexityDetails(false)
                            setShowKycDetails(false)
                            setShowNotesDetails(false)
                            setShowAcitivityDetails(true)
                          }}
                        >
                          {showAcitivityDetails ? (
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                backgroundColor: 'hsl(var(--brand-primary))',
                                maskImage: 'url(/svgIcons/selectedActivityIcon.svg)',
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskImage: 'url(/svgIcons/selectedActivityIcon.svg)',
                                WebkitMaskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                              }}
                            />
                          ) : (
                            <Image
                              src="/svgIcons/unselectedActivityIcon.svg"
                              width={24}
                              height={24}
                              alt="*"
                            />
                          )}
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
                            backgroundColor: showNotesDetails
                              ? 'hsl(var(--brand-primary))05'
                              : '',
                          }}
                          onClick={() => {
                            setShowPerpelexityDetails(false)
                            setShowKycDetails(false)
                            setShowNotesDetails(true)
                            setShowAcitivityDetails(false)
                          }}
                        >
                          {showNotesDetails ? (
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                backgroundColor: 'hsl(var(--brand-primary))',
                                maskImage: 'url(/svgIcons/selectedNotesIcon.svg)',
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center',
                                WebkitMaskImage: 'url(/svgIcons/selectedNotesIcon.svg)',
                                WebkitMaskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center',
                              }}
                            />
                          ) : (
                            <Image
                              src="/svgIcons/unselectedNotesIcon.svg"
                              width={24}
                              height={24}
                              alt="*"
                            />
                          )}
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
                                  <i
                                    style={{ fontWeight: '500', fontsize: 15 }}
                                  >
                                    KYC Data collected from calls will be shown
                                    here
                                  </i>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full mt-4 pb-12">
                                {selectedLeadsDetails?.kycs.map(
                                  (item, index) => {
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
                                              {item.question
                                                .split('ylz8ibb4uykg29mogltl')
                                                .join('')
                                                .trim()}
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
                                  },
                                )}
                              </div>
                            )}
                          </div>
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
                        {showAcitivityDetails && (
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
                                    'brightness(0) saturate(100%) opacity(0.5)',
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
                <source src={showAudioPlay?.recordingUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <button
                className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
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
      {/* delete lead modal */}
      <Modal
        open={showDelModal}
        onClose={() => setShowDelModal(false)}
        closeAfterTransition
        disablePortal={false}
        slotProps={{
          root: {
            style: {
              zIndex: 1500,
            },
          },
        }}
        sx={{
          zIndex: 1500, // Higher than drawer modal (default is 1300)
        }}
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: '#00000020',
            zIndex: 1500, // Match Modal z-index
          },
        }}
      >
        <Box
          className="lg:w-4/12 sm:w-4/12 w-6/12"
          sx={{
            ...styles.modalsStyle,
            zIndex: 1501, // Higher than backdrop (1500) to appear on top
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
                  <CircularProgress size={20} sx={{ color: 'hsl(var(--brand-primary))' }} />
                ) : (
                  <button
                    className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                    onClick={async () => {
                      await handleDeleteLead(selectedLeadsDetails)
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
      {/* Modal for audio play */}
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

              <button
                className="w-full h-[50px] rounded-lg bg-purple text-white mt-4"
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
        selectedUser={selectedUser}
      />
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
        selectedUser={selectedUser}
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
        selectedUser={selectedUser}
      />
      {/* Upgrade Plan Modal */}
      <Elements stripe={stripePromise}>
        <UpgradePlan
          selectedPlan={selectedPlan}
          setSelectedPlan={() => {}}
          open={showUpgradeModal}
          handleClose={async (upgradeResult) => {
            setShowUpgradeModal(false)
            if (upgradeResult) {
              const getData = async () => {
                let user = await AdminGetProfileDetails(selectedUser?.id)
                if (user) {
                  setUserLocalData(user)
                }
              }
              await getData()
            }
          }}
          plan={selectedPlan}
          currentFullPlan={currentFullPlan}
          selectedUser={selectedUser}
        />
      </Elements>
    </div>
  );
}

export default AdminLeadDetails
