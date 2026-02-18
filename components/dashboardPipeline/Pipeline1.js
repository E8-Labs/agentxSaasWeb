'use client'

import '@yaireo/tagify/dist/tagify.css'

import {
  Alert,
  Box,
  CircularProgress,
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
  Typography,
} from '@mui/material'
import {
  CaretDown,
  CaretRight,
  CaretUp,
  DotsThree,
  EnvelopeSimple,
  Plus,
  X,
} from '@phosphor-icons/react'
import Tags from '@yaireo/tagify/dist/react.tagify'
import axios from 'axios'
import parsePhoneNumberFromString from 'libphonenumber-js'
import moment from 'moment'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
//pagination
import InfiniteScroll from 'react-infinite-scroll-component'

import { PersistanceKeys } from '@/constants/Constants'
import UpgradeModal from '@/constants/UpgradeModal'
import { getAgentsListImage, getLeadProfileImage } from '@/utilities/agentUtilities'
import {
  FormatBookingDateTime,
  GetFormattedDateString,
  GetFormattedTimeString,
} from '@/utilities/utility'

import { AuthToken } from '../agency/plan/AuthDetails'
import DashboardSlider from '../animations/DashboardSlider'
import Apis from '../apis/Apis'
import { getUserLocalData } from '../constants/constants'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import CallWorthyReviewsPopup from '../dashboard/leads/CallWorthyReviewsPopup'
import LeadTeamsAssignedList from '../dashboard/leads/LeadTeamsAssignedList'
import TagsInput from '../dashboard/leads/TagsInput'
import LeadDetails from '../dashboard/leads/extras/LeadDetails'
import CloseBtn from '../globalExtras/CloseBtn'
import NotficationsDrawer from '../notofications/NotficationsDrawer'
import StandardHeader from '../common/StandardHeader'
import { TypographyH3 } from '@/lib/typography'
import {
  AssignTeamMember,
  UnassignTeamMember,
  getTeamsList,
} from '../onboarding/services/apisServices/ApiService'
import RearrangeStages from '../pipeline/RearrangeStages'
// import Tags from '../dashboard/leads/TagsInput';
import TagInput from '../test/TagInput'
import ScoringProgress from '../ui/ScoringProgress'
import ColorPicker from './ColorPicker'
import ConfigurePopup from './ConfigurePopup'
import PipelineLoading from './PipelineLoading'
import { Check, LayoutGrid, Pencil, TagIcon, Trash2 } from 'lucide-react'
import PipelineLeadTeamsAssignedList from '../dashboard/leads/PipelineLeadTeamsAssignedList'
import TagManagerCn from '../dashboard/leads/extras/TagManagerCn'
import { getUniqueTags as fetchUniqueTags } from '@/components/globalExtras/GetUniqueTags'
import TeamAssignDropdownCn from '../dashboard/leads/extras/TeamAssignDropdownCn'

const Pipeline1 = () => {
  const bottomRef = useRef()
  const colorPickerRef = useRef()
  let searchParams = useSearchParams()
  const router = useRouter()

  //value storing of search bar
  const [searchValue, setSearchValue] = useState('')

  //code for showing the reorder stages btn
  const [showReorderBtn, setShowReorderBtn] = useState(false)

  //variale for floating view
  const [expandSideView, setExpandSideView] = useState(false)
  const [openCallWorthyPopup, setOpenCallWorthyPopup] = useState(false)

  const [pipelinePopoverAnchorel, setPipelinePopoverAnchorel] = useState(null)
  const open = Boolean(pipelinePopoverAnchorel)
  const id = pipelinePopoverAnchorel ? 'simple-popover' : undefined

  const [otherPipelinePopoverAnchorel, setOtherPipelinePopoverAnchorel] =
    useState(null)
  const openOtherPipelines = Boolean(otherPipelinePopoverAnchorel)
  const OtherPipelineId = otherPipelinePopoverAnchorel
    ? 'simple-popover'
    : undefined

  const [StageAnchorel, setStageAnchorel] = useState(null)
  const openStage = Boolean(StageAnchorel)
  const stageId = StageAnchorel ? 'stageAnchor' : undefined

  const pipelineMenuContainerRef = useRef(null)
  const [pipelineMenuPillRect, setPipelineMenuPillRect] = useState(null)
  const pipelinesListContainerRef = useRef(null)
  const [pipelinesListPillRect, setPipelinesListPillRect] = useState(null)
  const stageAnchorContainerRef = useRef(null)
  const [stageAnchorPillRect, setStageAnchorPillRect] = useState(null)

  const [initialLoader, setInitialLoader] = useState(true)
  const [pipelineDetailLoader, setPipelineDetailLoader] = useState(false)

  const [SelectedPipeline, setSelectedPipeline] = useState(null)
  let selectedPipelineIndex = useRef(-1)
  const [PipeLines, setPipeLines] = useState([])
  const [StagesList, setStagesList] = useState([])
  const [leadsCountInStage, setLeadsCountInStage] = useState(null)
  const [reservedLeadsCountInStage, setReservedLeadsCountInStage] =
    useState(null)
  const [oldStages, setOldStages] = useState([])
  const [LeadsList, setLeadsList] = useState([])
  //for search
  const [reservedLeads, setReservedLeads] = useState([])
  //search timer
  const searchTimeout = useRef(null)
  //pagination
  // const [hasMore, setHasMore] = useState(true);
  const [hasMoreMap, setHasMoreMap] = useState({})
  const [moreLeadsLoader, setMoreLeadsLoader] = useState(false)
  //code to add new stage
  const [addNewStageModal, setAddNewStageModal] = useState(false)
  const [newStageTitle, setNewStageTitle] = useState('')
  const [stageColor, setStageColor] = useState('#000000')
  const [addStageLoader, setAddStageLoader] = useState(false)
  const [isEditingStage, setIsEditingStage] = useState(false)
  //code for advance setting modal inside new stages
  const [showAdvanceSettings, setShowAdvanceSettings] = useState(false)
  //code for input arrays
  const [inputs, setInputs] = useState([
    {
      id: 1,
      value: '',
      placeholder: `Sure, i'd be interested in knowing what my home is worth`,
    },
    { id: 2, value: '', placeholder: 'Yeah, how much is my home worth today?' },
    { id: 3, value: '', placeholder: 'Yeah, how much is my home worth today?' },
  ])
  const [action, setAction] = useState('')

  //code for popover
  const [actionInfoEl, setActionInfoEl] = React.useState(null)
  const [assigntoActionInfoEl, setAssigntoActionInfoEl] = React.useState(null)
  const openaction = Boolean(actionInfoEl)
  const openAssigneAction = Boolean(assigntoActionInfoEl)

  //test code
  const [showSampleTip, setShowSampleTip] = useState(false)

  //code for adding new pipeline
  const [createPipeline, setCreatePipeline] = useState(false)
  const [newPipelineTitle, setNewPipelineTitle] = useState('')
  const [newPipelineStage, setNewPipelineStage] = useState(null)
  const [addPipelineLoader, setAddPipelineLoader] = useState(false)

  //code for filter modal popup
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState([]) // Temporary selection in modal
  const [appliedTeamMemberIds, setAppliedTeamMemberIds] = useState([]) // Actually applied filter
  const [filterTeamMembers, setFilterTeamMembers] = useState([])

  const handlePopoverOpen = (event) => {
    setActionInfoEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setActionInfoEl(null)
    setAssigntoActionInfoEl(null)
  }
  //dele stage loader

  const [showDelBtn, setShowDelBtn] = useState(false)

  const [selectedStage, setSelectedStage] = useState(null)
  const [delStageLoader, setDelStageLoader] = useState(false)
  const [delStageLoader2, setDelStageLoader2] = useState(false)
  const [showDelStageModal, setShowDelStageModal] = useState(false)
  const [SuccessSnack, setSuccessSnack] = useState(null)
  const [snackMessage, setSnackMessage] = useState(null)
  //code for dropdown stages when delstage
  const [assignNextStage, setAssignNextStage] = useState('')
  const [assignNextStageId, setAssignNextStageId] = useState('')

  //get my teams list
  const [myTeamList, setMyTeamList] = useState([])
  const [myTeamAdmin, setMyTeamAdmin] = useState(null)
  const [assignToMember, setAssignToMember] = useState('')
  const [assignLeadToMember, setAssignLeadToMember] = useState([])

  const [showDeletePipelinePopup, setShowDeletePiplinePopup] = useState(false)

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false)

  const handleChangeNextStage = (event) => {
    let value = event.target.value
    //// //console.log;
    setAssignNextStage(event.target.value)

    const selectedItem = StagesList.find((item) => item.stageTitle === value)
    setAssignNextStageId(selectedItem.id)

    // //console.log;
  }

  //new teammeber
  // const handleAssignTeamMember = (event) => {
  //   let value = event.target.value;
  //   //// //console.log;
  //   setAssignToMember(event.target.value);

  //   const selectedItem = myTeamList.find(
  //     (item) => item.invitedUser.name === value
  //   );
  //  // //console.log;
  //   setAssignToMember(
  //     selectedItem.invitedUser.name || myTeamAdmin.invitedUser.name
  //   ); //
  //   setAssignLeadToMember([
  //     ...assignLeadToMember,
  //     selectedItem.invitedUser.id || myTeamAdmin.invitedUser.id,
  //   ]); //

  //  // //console.log;
  // };

  const handleAssignTeamMember = (event) => {
    let value = event.target.value
    // //console.log;
    setAssignToMember(event.target.value)

    const selectedItem = myTeamList.find(
      (item) => item?.invitedUser?.name === value,
    )
    // //console.log;
    setAssignToMember(
      selectedItem?.invitedUser?.name || myTeamAdmin.invitedUser?.name,
    ) //
    setAssignLeadToMember([
      ...assignLeadToMember,
      selectedItem?.invitedUser?.id || myTeamAdmin.invitedUser?.id,
    ]) //

    // //console.log;
  }

  //renaame the stage
  const [showRenamePopup, setShowRenamePopup] = useState(false)
  const [renameStage, setRenameStage] = useState('')
  const [renameStageLoader, setRenameStageLoader] = useState(false)
  //update the stage color
  const [updateStageColor, setUpdateStageColor] = useState('')
  const [stageColorUpdate, setStageColorUpdate] = useState(null)
  //configure popup
  const [showConfigureBtn, setShowConfigureBtn] = useState(false)
  const [showConfigurePopup, setShowConfigurePopup] = useState(false)
  const [configureLoader, setConfigureLoader] = useState(false)

  //code for rename pipeline
  const [showRenamePipelinePopup, setShowRenamePipelinePopup] = useState(false)
  const [renamePipeline, setRenamePipeline] = useState('')
  const [renamePipelineLoader, setRenamePipelineLoader] = useState(false)
  const [deletePipelineLoader, setDeletePipelineLoader] = useState(false)

  //code for rearranging stages
  const [showStagesPopup, setShowStagesPopup] = useState(false)
  const [nextStage, setNextStage] = useState({})
  const [selectedNextStage, setSelectedNextStage] = useState({})

  //code for storing tags value
  const [tagsValue, setTagsValue] = useState([])

  //reorder stages loader
  const [reorderStageLoader, setReorderStageLoader] = useState(false)

  //variabl for deltag
  const [DelTagLoader, setDelTagLoader] = useState(null)

  // tag input with autocomplete — per-lead state so each card has its own input/suggestions
  const [tagInputValues, setTagInputValues] = useState({})
  const [tagSuggestionsByLead, setTagSuggestionsByLead] = useState({})
  const [showTagSuggestionsByLead, setShowTagSuggestionsByLead] = useState({})
  const [uniqueColumns, setUniqueColumns] = useState([])
  const [addTagLoaderLeadId, setAddTagLoaderLeadId] = useState(null)
  const [delTagLoaderByLead, setDelTagLoaderByLead] = useState({})
  const [assignLoaderLeadId, setAssignLoaderLeadId] = useState(null)
  const tagInputRefsMap = useRef({})
  const getOrCreateInputRef = (leadId) => {
    if (!tagInputRefsMap.current[leadId]) {
      tagInputRefsMap.current[leadId] = { current: null }
    }
    return tagInputRefsMap.current[leadId]
  }

  //code for the lead details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null)
  const [pipelineId, setPipelineId] = useState('')

  //code for buttons of details popup
  const [showKYCDetails, setShowKycDetails] = useState(true)
  const [showNotesDetails, setShowNotesDetails] = useState(false)
  const [showAcitivityDetails, setShowAcitivityDetails] = useState(false)

  //code for add stage notes
  const [showAddNotes, setShowAddNotes] = useState(false)
  const [addNotesValue, setddNotesValue] = useState('')
  const [noteDetails, setNoteDetails] = useState([])
  const [addLeadNoteLoader, setAddLeadNoteLoader] = useState(false)

  //code for audio play popup
  const [showAudioPlay, setShowAudioPlay] = useState(null)
  const [showNoAudioPlay, setShowNoAudioPlay] = useState(false)

  //code for lead columns
  const [leadColumns, setLeadColumns] = useState([])

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState([])
  const [isExpandedActivity, setIsExpandedActivity] = useState([])

  //variable to show and hide the add stage btn
  const [showAddStageBtn, setShowAddStageBtn] = useState(false)

  //variables for getting woorthy call logs
  const [importantCalls, setImportantCalls] = useState([])
  const [selectedCall, setSelectedCall] = useState('')

  const [user, setUser] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const showSnackbar = useCallback((message, type) => {
    setSnackMessage({ message, type })
  }, [])

  useEffect(() => {
    let data = getUserLocalData()
    setUser(data.user)
  }, [])

  useEffect(() => {
    getImportantCalls()
    getMyTeam()
    const pipelineIndex = searchParams.get('pipeline') // Get the value of 'tab'
    let number = Number(pipelineIndex) || 0
    //console.log;
    selectedPipelineIndex = number
    if (!pipelineIndex) {
      setParamsInSearchBar(number)
    }
  }, [])

  //wherever a pipeline is selected, it fetches the details
  useEffect(() => {
    const fetchPipelineDetails = async () => {
      if (SelectedPipeline && !SelectedPipeline?.leads) {
        await getPipelineDetails(SelectedPipeline)
      } else {
        // console.log(
        //   `Pipeline ${SelectedPipeline?.id} already has leads ${SelectedPipeline?.leads?.length}`
        // );
      }
    }

    fetchPipelineDetails()
  }, [SelectedPipeline])

  // Load unique tags once when user is available (for all pipeline TagManagerCn instances)
  useEffect(() => {
    if (user?.id) {
      getUniqueTags()
    }
  }, [user?.id])

  const setParamsInSearchBar = (index = 0, from = 'default') => {
    //console.log;
    //console.log;
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString())
    params.set('pipeline', index) // Set or update the 'tab' parameter

    // Push the updated URL
    router.push(`/dashboard/pipeline?${params.toString()}`)

    // //console.log;
  }

  const getMyTeam = async () => {
    try {
      let response = await getTeamsList()
      if (response) {
        // //console.log;
        let teams = []
        if (response.admin) {
          let admin = response.admin
          let newInvite = { id: -1, invitedUser: admin, invitingUser: admin }
          teams.push(newInvite)
        }
        if (response.data && response.data.length > 0) {
          for (const t of response.data) {
            if (t.status == 'Accepted') {
              teams.push(t)
            }
          }
        }

        // //console.log;

        setMyTeamList(teams)
        setMyTeamAdmin(response.admin)

        // Also populate filter team members list
        const filterMembers = []
        if (response.admin) {
          filterMembers.push({
            id: response.admin.id,
            name: response.admin.name,
            email: response.admin.email,
          })
        }
        if (response.data && response.data.length > 0) {
          for (const t of response.data) {
            if (t.status == 'Accepted' && t.invitedUser) {
              filterMembers.push({
                id: t.invitedUser.id,
                name: t.invitedUser.name,
                email: t.invitedUser.email,
              })
            }
          }
        }
        setFilterTeamMembers(filterMembers)
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    }
  }

  // Handler for team member filter selection
  const handleTeamMemberFilterToggle = (memberId) => {
    setSelectedTeamMemberIds((prev) => {
      if (prev.includes(memberId)) {
        return prev.filter((id) => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })
  }

  // Handler to apply filter and refresh pipeline data
  const handleApplyFilter = async () => {
    const newAppliedIds = [...selectedTeamMemberIds]
    setAppliedTeamMemberIds(newAppliedIds) // Apply the selected filters
    setShowFilterModal(false)
    if (SelectedPipeline) {
      // Pass the IDs directly instead of relying on state
      await getPipelineDetails(SelectedPipeline, newAppliedIds)
    }
  }

  // Handler to clear filter
  const handleClearFilter = async () => {
    setSelectedTeamMemberIds([])
    setAppliedTeamMemberIds([])
    setShowFilterModal(false)
    if (SelectedPipeline) {
      // Pass empty array directly instead of relying on state
      await getPipelineDetails(SelectedPipeline, [])
    }
  }

  // When opening the filter modal, sync selectedTeamMemberIds with appliedTeamMemberIds
  const handleOpenFilterModal = () => {
    setSelectedTeamMemberIds([...appliedTeamMemberIds])
    setShowFilterModal(true)
  }

  useEffect(() => {
    // //console.log;
  }, [selectedLeadsDetails])
  const getImportantCalls = async () => {
    try {
      const data = localStorage.getItem('User')
      if (data) {
        const u = JSON.parse(data)
        let path = Apis.getImportantCalls
        //console.log;
        // //console.log;
        const response = await axios.get(path, {
          headers: {
            Authorization: `Bearer ${u.token}`,
          },
        })

        if (response) {
          if (response.data.status === true) {
            // console.log(
            //   "response of get imporatant calls api is",
            //   response.data.data
            // );
            setImportantCalls(response.data.data)
            setSelectedCall(response.data.data[0])
          } else {
            // console.log(
            //   "message of get important calls api is",
            //   response.data.message
            // );
          }
        }
      }
    } catch (e) {
      //console.log;
    }
  }

  //code for showing the add stage button according to dirredent conditions
  // useEffect(() => {

  //     if (showAdvanceSettings) {
  //         if (!newStageTitle || !action || inputs.filter(input => input.value.trim() !== "").length < 3) {
  //            // //console.log
  //             setShowAddStageBtn(false);
  //         }
  //         else if (newStageTitle && action && inputs.filter(input => input.value.trim() !== "").length === 3) {
  //            // //console.log
  //             setShowAddStageBtn(true);
  //         }
  //     }
  //     else if (!showAdvanceSettings) {
  //         // if (newStageTitle) {
  //         if (newStageTitle) {
  //             setShowAddStageBtn(true);
  //         } else if (!newStageTitle) {
  //             setShowAddStageBtn(false);
  //         }
  //         // }
  //     }

  // }, [showAdvanceSettings, newStageTitle, inputs, action])

  function canProceed() {
    if (newStageTitle.length > 0 && action.length == 0) {
      return true
    }
    if (
      action &&
      action.length > 0 &&
      newStageTitle &&
      newStageTitle.length > 0 &&
      inputs.filter((input) => input.value && input.value.trim() !== '')
        .length === 3
    ) {
      return true
    }
    return false
  }

  useEffect(() => {
    getPipelines()
  }, [])

  useEffect(() => {
    // //console.log;
    const timer = setTimeout(() => {
      //// //console.log;
      if (stageColorUpdate) {
        handleUpdateColor()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [stageColorUpdate])

  // useEffect(() => {
  //     // handleReorder()
  //     let previousStages = oldStages.map((item) => item.id);
  //     let updatedStages = StagesList.map((item) => item.id);

  //    // //console.log;
  //    // //console.log;

  //     // Compare arrays
  //     const areArraysEqual = previousStages.length === updatedStages.length &&
  //         previousStages.every((item, index) => item === updatedStages[index]);

  //     if (areArraysEqual) {
  //        // //console.log;
  //     } else {
  //        // //console.log;
  //         handleReorder();
  //     }
  // }, [StagesList]);

  //code to auto scroll to end

  useEffect(() => {
    const timer = setTimeout(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [StagesList])

  //function to call create pipeline api
  const handleCreatePipeline = async () => {
    try {
      setAddPipelineLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
        // //console.log;
      }

      // //console.log;

      const formData = new FormData()
      formData.append('title', newPipelineTitle)

      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      const ApiPath = Apis.createPipeLine
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          // "Content-Type": "application/josn"
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          let updatedPipelinesList = []
          setPipeLines([...PipeLines, response.data.data])
          updatedPipelinesList = [...PipeLines, response.data.data]
          let reversePipelinesList = updatedPipelinesList.reverse()
          // setSelectedPipeline(reversePipelinesList[0]);
          // setStagesList(reversePipelinesList[0].stages);

          // getPipelineDetails(reversePipelinesList[0]);
          setLeadsCountInStage(response.data.data.leadsCountInStage)
          setReservedLeadsCountInStage(response.data.data.leadsCountInStage)
          setSelectedPipeline(reversePipelinesList[0])
          setStagesList(reversePipelinesList[0]?.stages)
          setLeadsList(reversePipelinesList[0]?.leads || [])
          setNewPipelineTitle('')
          setNewPipelineStage(null)
          setSuccessSnack(response.data.message)
          setCreatePipeline(false)
          handlePipelineClosePopover()
          handleCloseOtherPipeline();
          selectedPipelineIndex = PipeLines.length
          setParamsInSearchBar(selectedPipelineIndex, 'handlecreatePipeline')
        }
      }
    } catch (error) {
      // console.error("Error occured in api  create is:", error);
    } finally {
      setAddPipelineLoader(false)
    }
  }

  //code for get pipeline
  function GetPipelinesCached() {
    let dataFound = false
    let data = localStorage.getItem(PersistanceKeys.LocalStoragePipelines)
    if (data) {
      let jsonData = JSON.parse(data)
      //console.log;
      setPipeLines(jsonData)
      if (jsonData.length > 0) {
        let index = 0
        if (selectedPipelineIndex < jsonData.length) {
          index = selectedPipelineIndex
        } else if (jsonData > 0) {
          index = 0
        } else {
          index = -1
        }

        // //console.log;

        if (index != -1) {
          setPipeLines(jsonData)
          setSelectedPipeline(jsonData[index])
          setStagesList(jsonData[index].stages)
          setOldStages(jsonData[index].stages)
          setLeadsList(jsonData[index].leads)
        }
        // setSelectedPipeline(jsonData[selectedPipelineIndex]);
        // setStagesList(jsonData[selectedPipelineIndex].stages);
        // setOldStages(jsonData[selectedPipelineIndex].stages);
        // setLeadsList(jsonData[selectedPipelineIndex].leads);
      }
      dataFound = true
    }
    return dataFound
  }

  async function getPipelineDetails(pipeline, teamMemberIdsOverride = null) {
    //console.log;
    // console.log(
    //   "Pipeline index from getpipelinedetails is ",
    //   selectedPipelineIndex
    // );
    try {
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
        // //console.log;
      }

      // //console.log;
      let ApiPath = Apis.getPipelineById + '?pipelineId=' + pipeline.id
      // Use override if provided, otherwise use state
      const teamMemberIdsToUse = teamMemberIdsOverride !== null ? teamMemberIdsOverride : appliedTeamMemberIds
      // Add teamMemberIds to query if filter is active
      if (teamMemberIdsToUse && teamMemberIdsToUse.length > 0) {
        ApiPath += '&teamMemberIds=' + teamMemberIdsToUse.join(',')
      }
      //console.log;
      setPipelineDetailLoader(true)
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      setPipelineDetailLoader(false)
      if (response) {
        const pipelineDetails = response.data.data

        //  Merge updated details with existing pipelines list
        let updatedPipelines = PipeLines?.map((p) =>
          p.id === pipeline.id ? { ...p, ...pipelineDetails } : p,
        )
        //console.log;
        //console.log;
        setPipeLines(updatedPipelines)
        if (
          selectedPipelineIndex.current == -1 ||
          pipeline.id == PipeLines[selectedPipelineIndex].id
        ) {
          // Log detailed lead information for agency_use pipeline
          if (pipelineDetails.pipelineType === 'agency_use') {
            pipelineDetails.leads?.forEach((lead, index) => { })
          }

          //in admin side i was unable to find this function now if getting error related to leadscount in stage in admin and agency side then first find getpipeline details
          setLeadsCountInStage(pipelineDetails.leadsCountInStage)
          setReservedLeadsCountInStage(pipelineDetails.leadsCountInStage)
          setSelectedPipeline(pipelineDetails)
          setStagesList(pipelineDetails.stages)
          setLeadsList(pipelineDetails.leads)
          setReservedLeads(pipelineDetails.leads)
        } else {
          //console.log;
        }
        // Save updated pipelines list to localStorage
        localStorage.setItem(
          PersistanceKeys.LocalStoragePipelines,
          JSON.stringify(updatedPipelines),
        )

        localStorage.setItem('pipelinesList', JSON.stringify(updatedPipelines))
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      // //console.log;
      setInitialLoader(false)
    }
  }

  //code for get more Leads In Stage
  const getMoreLeadsInStage = async ({ stageId, offset = 0, search }) => {
    try {
      // return;
      const Auth = AuthToken()
      let ApiPath = `${Apis.getLeadsInStage}?offset=${offset}&stageId=${stageId}`
      if (search) {
        ApiPath = `${Apis.getLeadsInStage}?stageId=${stageId}&search=${search}&offset=${offset}`
      }
      // Add teamMemberIds to query if filter is active
      if (appliedTeamMemberIds && appliedTeamMemberIds.length > 0) {
        ApiPath += `&teamMemberIds=${appliedTeamMemberIds.join(',')}`
      }
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Auth,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        let newLeads = response?.data?.data || []
        // if (newLeads.length > 11) {
        //   setHasMore(true);
        // } else {
        //   setHasMore(false);
        // }

        setHasMoreMap((prev) => {
          const updated = {
            ...prev,
            [stageId]: newLeads.length >= 7,
          }
          return updated
        })

        if (offset === 0) {
          setLeadsList(newLeads)
          setLeadsCountInStage(response.data.leadsCountInStage)
          // setReservedLeadsCountInStage(response.data.leadsCountInStage)
        } else {
          setLeadsList([...LeadsList, ...newLeads])
        }
      }
    } catch (error) { }
  }

  //code for get pipeline
  const getPipelines = async () => {
    try {
      let data = false //GetPipelinesCached();
      //console.log;
      if (!data) {
        setInitialLoader(true)
      }

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
        // //console.log;
      }

      // //console.log;
      const ApiPath = Apis.getPipelines + '?liteResource=true'
      //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })
      if (response) {
        setInitialLoader(false)

        localStorage.setItem(
          PersistanceKeys.LocalStoragePipelines,
          JSON.stringify(response.data.data),
        )
        localStorage.setItem(
          'pipelinesList',
          JSON.stringify(response.data.data),
        )
        const pipelinesList = response.data.data
        setPipeLines(pipelinesList)

        if (pipelinesList.length > 0) {
          // console.log(
          //   "Pipeline index from getpipelines is ",
          //   selectedPipelineIndex
          // );
          let pipeline = pipelinesList[selectedPipelineIndex] // Select first pipeline
          setSelectedPipeline(pipeline)
          // getPipelineDetails(pipeline); // Fetch details for the selected pipeline
        }

        // let index = selectedPipelineIndex;
        // if (selectedPipelineIndex < response.data.data.length) {
        //   index = selectedPipelineIndex;
        // } else if (response.data.data.length > 0) {
        //   index = 0;
        // } else {
        //   index = -1;
        // }

        // if (index != -1) {
        //   setPipeLines(response.data.data);
        //   let pipeline = response.data.data[index]
        //   setSelectedPipeline(pipeline);
        //   getPipelineDetails(pipeline)

        //   // //console.log;
        // }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      // //console.log;
      // setInitialLoader(false);
    }
  }

  //code to delete the tag value
  //code for del tag api
  const handleDelTag = async (tag, lead) => {
    try {
      setDelTagLoader(lead.lead.id)

      // //console.log;

      let AuthToken = null

      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        AuthToken = localData.token
      }

      // //console.log;

      const ApiData = {
        leadId: lead.lead.id,
        tag: tag,
      }

      const ApiPath = Apis.delLeadTag
      // //console.log;
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
          // const updatedTags = LeadsList.lead.tags.filter(
          //   (item) => item !== tag
          // );
          // setLeadsList((prevDetails) => ({
          //   ...prevDetails,
          //   tags: updatedTags,
          // }));
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      setDelTagLoader(null)
    }
  }

  // Fetch unique tags for tag autocomplete (shared list for all leads)
  const getUniqueTags = useCallback(async () => {
    try {
      const userId = user?.id || null
      const tags = await fetchUniqueTags(userId)
      if (tags && Array.isArray(tags)) {
        setUniqueColumns(tags)
      }
    } catch (error) {
      console.error('Error fetching unique tags:', error)
    }
  }, [user?.id])

  // Add tag for a specific lead (used by each TagManagerCn in the pipeline list)
  const handleAddTag = useCallback(async (tagValue, lead) => {
    if (!tagValue || !tagValue.trim() || !lead?.lead?.id) return
    const trimmedTag = tagValue.trim()
    const leadId = lead.lead.id
    const existingTags = lead.lead.tags || []
    if (existingTags.includes(trimmedTag)) {
      showSnackbar('Tag already exists', SnackbarTypes.Error)
      setTagInputValues((prev) => ({ ...prev, [leadId]: '' }))
      return
    }
    try {
      setAddTagLoaderLeadId(leadId)
      let AuthToken = null
      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        AuthToken = localData.token
      }
      const updatedTags = [...existingTags, trimmedTag]
      const ApiData = {
        leadId: lead.lead.id,
        tag: trimmedTag,
        smartListId: lead.lead.sheetId,
        phoneNumber: lead.lead.phone,
      }
      const ApiPath = Apis.updateLead
      const response = await axios.put(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })
      if (response?.data?.status === true) {
        setTagInputValues((prev) => ({ ...prev, [leadId]: '' }))
        setShowTagSuggestionsByLead((prev) => ({ ...prev, [leadId]: false }))
        setTagSuggestionsByLead((prev) => ({ ...prev, [leadId]: [] }))
        showSnackbar('Tag added successfully', SnackbarTypes.Success)
        setLeadsList((prev) =>
          prev.map((item) =>
            item.lead?.id === leadId
              ? { ...item, lead: { ...item.lead, tags: updatedTags } }
              : item
          )
        )
        if (selectedLeadsDetails?.id === leadId) {
          setSelectedLeadsDetails((prev) => (prev ? { ...prev, tags: updatedTags } : prev))
        }
      } else {
        showSnackbar(response?.data?.message || 'Failed to add tag', SnackbarTypes.Error)
      }
    } catch (error) {
      console.error('Error occurred in update lead api:', error)
      showSnackbar('Failed to add tag. Please try again.', SnackbarTypes.Error)
    } finally {
      setAddTagLoaderLeadId(null)
    }
  }, [showSnackbar, selectedLeadsDetails?.id])

  const handleTagInputChange = useCallback((e, lead) => {
    const value = e.target.value
    const leadId = lead?.lead?.id
    if (leadId == null) return
    setTagInputValues((prev) => ({ ...prev, [leadId]: value }))
    const existingTags = lead?.lead?.tags || []
    if (value.trim()) {
      const filtered = uniqueColumns
        .filter((tag) => tag.toLowerCase().includes(value.toLowerCase()))
        .filter((tag) => !existingTags.includes(tag))
      setTagSuggestionsByLead((prev) => ({ ...prev, [leadId]: filtered }))
      setShowTagSuggestionsByLead((prev) => ({ ...prev, [leadId]: filtered.length > 0 }))
    } else {
      setTagSuggestionsByLead((prev) => ({ ...prev, [leadId]: [] }))
      setShowTagSuggestionsByLead((prev) => ({ ...prev, [leadId]: false }))
    }
  }, [uniqueColumns])

  const handleTagInputKeyDown = useCallback(
    (e, lead) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
        e.preventDefault()
        e.stopPropagation()
        const leadId = lead?.lead?.id
        if (leadId == null) return
        const value = (tagInputValues[leadId] ?? '').trim()
        if (value) handleAddTag(value, lead)
      } else if (e.key === 'Escape') {
        const leadId = lead?.lead?.id
        if (leadId != null) {
          setShowTagSuggestionsByLead((prev) => ({ ...prev, [leadId]: false }))
        }
      }
    },
    [tagInputValues, handleAddTag]
  )

  const handleTagSuggestionClick = useCallback(
    (suggestion, lead) => {
      handleAddTag(suggestion, lead)
    },
    [handleAddTag]
  )

  // Delete tag for a specific lead (TagManagerCn passes tag; we close over lead in JSX)
  const handleDelTagForLead = useCallback(async (tag, lead) => {
    const leadId = lead?.lead?.id
    if (!leadId) return
    try {
      setDelTagLoaderByLead((prev) => ({ ...prev, [leadId]: tag }))
      let AuthToken = null
      const userData = localStorage.getItem('User')
      if (userData) {
        const localData = JSON.parse(userData)
        AuthToken = localData.token
      }
      const ApiData = { leadId, tag }
      const response = await axios.post(Apis.delLeadTag, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })
      if (response?.data?.status === true) {
        const updatedTags = (lead.lead.tags || []).filter((t) => t !== tag)
        setLeadsList((prev) =>
          prev.map((item) =>
            item.lead?.id === leadId
              ? { ...item, lead: { ...item.lead, tags: updatedTags } }
              : item
          )
        )
        if (selectedLeadsDetails?.id === leadId) {
          setSelectedLeadsDetails((prev) => (prev ? { ...prev, tags: updatedTags } : prev))
        }
      }
    } catch (error) {
      console.error('Error in del tag api:', error)
    } finally {
      setDelTagLoaderByLead((prev) => {
        const next = { ...prev }
        delete next[leadId]
        return next
      })
    }
  }, [selectedLeadsDetails?.id])

  // Update list (and selected lead if same) after tag delete for a specific lead
  const handleLeadDetailsUpdatedForLead = useCallback(async (deletedTagName, lead) => {
    const leadId = lead?.lead?.id
    if (!leadId || !deletedTagName) return
    setLeadsList((prev) =>
      prev.map((item) =>
        item.lead?.id === leadId
          ? {
            ...item,
            lead: {
              ...item.lead,
              tags: (item.lead?.tags || []).filter((t) => t !== deletedTagName),
            },
          }
          : item
      )
    )
    if (selectedLeadsDetails?.id === leadId) {
      setSelectedLeadsDetails((prev) =>
        prev ? { ...prev, tags: (prev.tags || []).filter((t) => t !== deletedTagName) } : prev
      )
    }
  }, [selectedLeadsDetails?.id])

  // Team assign: options per lead (same shape as LeadDetails teamOptions)
  const getTeamOptionsForLead = useCallback(
    (lead) => {
      const allTeams = [...(myTeamAdmin ? [myTeamAdmin] : []), ...(myTeamList || [])]
      const teamsAssigned = lead?.teamsAssigned || []
      return allTeams.map((tm) => {
        const id = tm.invitedUserId || tm.invitedUser?.id || tm.id
        const isSelected = teamsAssigned.some((assigned) => {
          const assignedId = assigned.invitedUserId || assigned.invitedUser?.id || assigned.id
          return String(assignedId) === String(id)
        })
        return {
          id,
          label: tm.name || tm.invitedUser?.name || 'Unknown',
          avatar: tm.thumb_profile_image || tm.invitedUser?.thumb_profile_image,
          selected: isSelected,
          raw: tm,
        }
      })
    },
    [myTeamAdmin, myTeamList]
  )

  const handleAssignLeadToTeammember = useCallback(
    async (item, lead) => {
      if (!lead?.id) return
      const leadId = lead.id
      setAssignLoaderLeadId(leadId)
      try {
        const teamMemberUserId = item.invitedUserId || item.id
        const ApiData = { leadId, teamMemberUserId }
        const response = await AssignTeamMember(ApiData)
        if (response?.data?.status === true) {
          const newTeamMember = {
            id: item.id,
            invitedUserId: item.invitedUserId,
            invitingUserId: item.invitingUserId,
            name: item.name || item.invitedUser?.name,
            thumb_profile_image: item.thumb_profile_image || item.invitedUser?.thumb_profile_image,
            invitedUser: item.invitedUser || {
              id: item.invitedUserId || item.id,
              name: item.name,
              thumb_profile_image: item.thumb_profile_image,
            },
          }
          HandleLeadAssignedTeam(newTeamMember, lead)
          showSnackbar(
            response.data.message || 'Team member assigned successfully',
            SnackbarTypes.Success
          )
        } else {
          showSnackbar(
            response?.data?.message || 'Failed to assign team member',
            SnackbarTypes.Error
          )
        }
      } catch (error) {
        console.error('handleAssignLeadToTeammember error:', error)
        showSnackbar('Failed to assign team member. Please try again.', SnackbarTypes.Error)
      } finally {
        setAssignLoaderLeadId(null)
      }
    },
    [showSnackbar]
  )

  const handleUnassignLeadFromTeammember = useCallback(
    async (userId, lead) => {
      if (!lead?.id) return
      const leadId = lead.id
      setAssignLoaderLeadId(leadId)
      try {
        const ApiData = { leadId, teamMemberUserId: userId }
        const response = await UnassignTeamMember(ApiData)
        if (response?.data?.status === true) {
          const filteredTeams = (lead.teamsAssigned || []).filter((assigned) => {
            const assignedId = assigned.invitedUserId || assigned.invitedUser?.id || assigned.id
            return String(assignedId) !== String(userId)
          })
          const updatedLead = { ...lead, teamsAssigned: filteredTeams }
          HandleLeadAssignedTeam(null, updatedLead)
          showSnackbar(
            response.data.message || 'Team member unassigned successfully',
            SnackbarTypes.Success
          )
        } else if (response?.data?.status === false) {
          showSnackbar(
            response.data.message || 'Failed to unassign team member',
            SnackbarTypes.Error
          )
        }
      } catch (error) {
        console.error('handleUnassignLeadFromTeammember error:', error)
        showSnackbar('Failed to unassign team member. Please try again.', SnackbarTypes.Error)
      } finally {
        setAssignLoaderLeadId(null)
      }
    },
    [showSnackbar]
  )

  //code for poovers

  const handleShowPipelinePopover = (event) => {
    setPipelinePopoverAnchorel(event.currentTarget)
  }

  const handlePipelineClosePopover = () => {
    setPipelinePopoverAnchorel(null)
  }

  const handleShowStagePopover = (event, stage) => {
    setStageAnchorel(event.currentTarget)
    setSelectedStage(stage)
    setStageColorUpdate(stage.defaultColor)
  }

  const handleCloseStagePopover = () => {
    setStageAnchorel(null)
  }

  const handleShowOtherPipeline = (event) => {
    setOtherPipelinePopoverAnchorel(event.currentTarget)
  }

  const handleCloseOtherPipeline = () => {
    console.log('handleCloseOtherPipeline trigerred')
    setOtherPipelinePopoverAnchorel(null)
  }

  //code to seect other pipeline
  const handleSelectOtherPipeline = (item, index) => {
    // getPipelineDetails(item);
    setSelectedPipeline(item)

    // setSelectedPipeline(item);
    // setSelectedPipeline(item);
    setStagesList(item.stages)
    setLeadsCountInStage(item.leadsCountInStage)
    setReservedLeadsCountInStage(item.leadsCountInStage)
    setLeadsList(item?.leads || [])
    handleCloseOtherPipeline()
    selectedPipelineIndex = index
    //console.log;
    setParamsInSearchBar(index, 'handleSelectOtherPipeline')
  }

  //code for adding new custom stage
  const handleAddCustomStage = async () => {
    try {
      setAddStageLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
        // //console.log;
      }

      let mainAgent = null

      const mainAgentData = localStorage.getItem('agentDetails')
      // //console.log;

      if (mainAgentData) {
        const mainAgentDetails = JSON.parse(mainAgentData)
        // //console.log;
        // //console.log;
        mainAgent = mainAgentDetails
      }

      // return

      // //console.log;

      const ApiPath = Apis.addCustomStage
      // //console.log;

      const ApiData = {
        stageTitle: newStageTitle,
        color: stageColor,
        pipelineId: SelectedPipeline.id,
        action: action,
        examples: inputs,
        // mainAgentId: mainAgent.id,
        tags: tagsValue,
        teams: assignLeadToMember,
      }

      // return

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setLeadsCountInStage(response.data.data.leadsCountInStage)
          setReservedLeadsCountInStage(response.data.data.leadsCountInStage)
          setStagesList(response.data.data.stages)
          handleCloseAddStage()
          setPipelinePopoverAnchorel(null)
          setSelectedPipeline((prevData) => ({
            ...prevData, // Spread the previous state
            stages: response.data.data.stages, // Update or add the `stages` property
          }))

          const newPipeline = response.data.data

          setPipeLines((prevData) =>
            prevData.map((item) =>
              item.id === SelectedPipeline.id
                ? { ...item, ...newPipeline } // Update the matching item with the new pipeline data
                : item,
            ),
          )

          // setPipeLines([...PipeLines, newPipeline]);
        } else if (response.data.status == false) {
          let message = response.data.message
          setSnackMessage({ message: message, type: SnackbarTypes.Error })
        }
      }
    } catch (error) {
      console.error('Error occured inn adding new stage title api is', error)
    } finally {
      setAddStageLoader(false)
    }
  }

  //code for updating existing custom stage
  const handleUpdateCustomStage = async () => {
    try {
      setAddStageLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      const ApiPath = Apis.UpdateStage
      const formData = new FormData()

      formData.append('stageId', selectedStage.id)
      formData.append('stageTitle', newStageTitle)
      formData.append('color', stageColor)
      formData.append('action', action)

      // Add examples array
      inputs.forEach((input, index) => {
        if (input.value && input.value.trim() !== '') {
          formData.append(`examples[${index}]`, input.value)
        }
      })

      tagsValue.forEach((tag, i) => {
        if (typeof tag === 'string' && tag.trim()) {
          formData.append(`tags[${i}]`, tag.trim())
        }
      })

      assignLeadToMember.forEach((assignedTeam, i) => {
        formData.append(`teams[${i}]`, assignedTeam)
        // if (assignedTeam.trim()) {
        // }
      })

      for (let [key, value] of formData) { }

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response) {
        if (response.data.status === true) {
          setStagesList(response.data.data.stages)
          handleCloseAddStage()
          // setSnackMessage({ message: response.data.message || "Stage updated successfully", type: SnackbarTypes.Success });
          setSnackMessage({
            message: 'Stage updated',
            type: SnackbarTypes.Success,
          })

          // Update selected pipeline stages
          setSelectedPipeline((prevData) => ({
            ...prevData,
            stages: response.data.data.stages,
          }))

          // Update pipelines list
          setPipeLines((prevData) =>
            prevData.map((item) =>
              item.id === SelectedPipeline.id
                ? { ...item, stages: response.data.data.stages }
                : item,
            ),
          )
        } else if (response.data.status == false) {
          let message = response.data.message
          setSnackMessage({ message: message, type: SnackbarTypes.Error })
        }
      }
    } catch (error) {
      console.error('Error occurred in updating stage api:', error)
      setSnackMessage({
        message: 'Failed to update stage',
        type: SnackbarTypes.Error,
      })
    } finally {
      setAddStageLoader(false)
    }
  }

  useEffect(() => {
    let data = localStorage.getItem('pipelinesList')

    if (data) {
      let d = JSON.parse(data)

      //console.log;
    }
  }, [])

  //code ford deleting the stage
  const handleDeleteStage = async (value) => {
    try {
      if (value === 'del2') {
        // //console.log;
        setDelStageLoader2(true)
      } else if (value === 'del') {
        // //console.log;
        setDelStageLoader(true)
      }
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
        //// //console.log;
      }

      // //console.log;

      const ApiData = {
        pipelineId: SelectedPipeline.id,
        stageId: selectedStage.id,
        moveToStageId: assignNextStageId,
      }

      const formData = new FormData()
      formData.append('pipelineId', SelectedPipeline.id)
      formData.append('stageId', selectedStage.id)
      if (assignNextStageId) {
        formData.append('moveToStage', assignNextStageId)
      }

      for (let [key, value] of formData) {
        // //console.log;
      }

      // return
      const ApiPath = Apis.deleteStage
      // //console.log;

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        //console.log;
        if (response.data.status === true) {
          setStagesList(response.data.data.stages)
          setSuccessSnack(response.data.message)
          setStageAnchorel(null)
          setShowDelStageModal(false)

          let p = localStorage.getItem('pipelinesList')

          if (p) {
            let localPipelines = JSON.parse(p)

            let updatedPipelines = localPipelines.map((pipeline) => {
              if (SelectedPipeline.id === pipeline.id) {
                return {
                  ...pipeline,
                  stages: pipeline?.stages?.filter(
                    (stage) => stage.id !== selectedStage.id,
                  ),
                }
              }
              return pipeline // Return unchanged pipeline for others
            })

            //console.log;
            localStorage.setItem(
              'pipelinesList',
              JSON.stringify(updatedPipelines),
            )
          } else {
            //console.log;
          }
        }
      }
    } catch (error) {
      console.error('Error occured in delstage api is:', error)
    } finally {
      setDelStageLoader(false)
      setDelStageLoader2(false)
    }
  }

  //code to rename the stage
  const handleRenameStage = async () => {
    try {
      setRenameStageLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      // const ApiData = {
      //     stageTitle: renameStage,
      //     stageId: selectedStage.id,
      //     color: updateStageColor
      // }

      const formData = new FormData()
      formData.append('stageTitle', renameStage)
      formData.append('stageId', selectedStage.id)
      formData.append('color', updateStageColor)

      //// //console.log;

      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      const ApiPath = Apis.UpdateStage

      // //console.log;
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        setStagesList(response.data.data.stages)
        setShowRenamePopup(false)
        handleCloseStagePopover()
      }
    } catch (error) {
      // //console.log;
    } finally {
      setRenameStageLoader(false)
    }
  }

  //code to rename the stage
  const handleRenamePipeline = async () => {
    try {
      setRenamePipelineLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      const ApiData = {
        title: renamePipeline,
        pipelineId: SelectedPipeline.id,
      }

      // //console.log;
      const ApiPath = Apis.updatePipeline

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
        // setPipeLines()
        setPipeLines((prevPipelines) =>
          prevPipelines.map((pipeline) =>
            pipeline.id === SelectedPipeline.id
              ? { ...pipeline, ...response.data.data } // Merge updates into the matching object
              : pipeline,
          ),
        )
        setSelectedPipeline(response.data.data)
        setShowRenamePipelinePopup(false)
        handlePipelineClosePopover()
        handleCloseOtherPipeline();
      }
    } catch (error) {
      // //console.log;
    } finally {
      setRenamePipelineLoader(false)
    }
  }

  //code to handle updaet color
  const handleUpdateColor = async () => {
    try {
      setRenameStageLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      // const ApiData = {
      //     stageTitle: renameStage,
      //     stageId: selectedStage.id,
      //     color: updateStageColor
      // }

      const formData = new FormData()
      // formData.append("stageTitle", renameStage);
      formData.append('stageId', selectedStage?.id)
      formData.append('color', stageColorUpdate)

      //// //console.log;

      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      const ApiPath = Apis.UpdateStage

      // //console.log;
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        setStagesList(response.data.data.stages)
        // setShowRenamePopup(false);
        // handleCloseStagePopover();
      }
    } catch (error) {
      // //console.log;
    } finally {
      setRenameStageLoader(false)
    }
  }

  //code to delete pipeline

  const handleDeletePipeline = async () => {
    try {
      setDeletePipelineLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      const formData = new FormData()
      formData.append('pipelineId', SelectedPipeline.id)

      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      //// //console.log;
      const ApiPath = Apis.deletePipeline

      // //console.log;
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          let updatedPipelines = []
          setPipeLines(
            PipeLines?.filter((pipeline) => pipeline.id !== SelectedPipeline.id),
          )
          updatedPipelines = PipeLines?.filter(
            (pipeline) => pipeline.id !== SelectedPipeline.id,
          )

          localStorage.setItem(
            'pipelinesList',
            JSON.stringify(updatedPipelines),
          )

          // //console.log;
          setSelectedPipeline(updatedPipelines[0])
          setStagesList(updatedPipelines[0].stages)
          setLeadsList(updatedPipelines[0].leads)
          // setSelectedPipeline(PipeLines)
          handlePipelineClosePopover()
          handleCloseOtherPipeline();
          setShowDeletePiplinePopup(false)
        }
      }
    } catch (error) {
      // //console.log;
    } finally {
      setDeletePipelineLoader(false)
    }
  }

  //code for arrayinput fields of settings modal
  const handleInputChange = (id, value) => {
    setInputs(
      inputs.map((input) => (input.id === id ? { ...input, value } : input)),
    )
  }

  // Handle deletion of input field
  const handleDelete = (id) => {
    setInputs(inputs.filter((input) => input.id !== id))
  }

  // Handle adding a new input field
  const handleAddInput = () => {
    const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1
    setInputs([
      ...inputs,
      { id: newId, value: '', placeholder: 'Add sample answer' },
    ])
  }

  //code to add new sheet list
  const handleAddSheetNewList = async () => {
    try {
      setShowaddCreateListLoader(true)

      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      const ApiData = {
        sheetName: newSheetName,
        columns: inputs.map((columns) => columns.value),
      }
      // //console.log;

      const ApiPath = Apis.addSmartList
      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status) {
          setShowAddNewSheetModal(false)
        }
      }
    } catch (error) {
      // console.error("Error occured in adding new list api is:", error);
    } finally {
      setShowaddCreateListLoader(false)
    }
  }

  //codde for reorder stages
  const handleSelectNextChange = (index, event) => {
    const selectedValue = event.target.value

    // Update the next stage for the specific index
    setNextStage((prev) => ({
      ...prev,
      [index]: selectedValue,
    }))

    // Find the selected item for the specific index
    const selectedItem = StagesList.find(
      (item) => item.stageTitle === selectedValue,
    )

    // //console.log;

    // Update the selected next stage for the specific index
    setSelectedNextStage((prev) => ({
      ...prev,
      [index]: selectedItem,
    }))
  }

  //code to rearrange stages list
  const handleReorder = async () => {
    //// //console.log;
    // return;
    try {
      setReorderStageLoader(true)
      const updateStages = StagesList.map((stage, index) => ({
        id: stage.id,
        order: stage.order,
      }))

      // //console.log;

      const ApiPath = Apis.reorderStages
      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }
      //// //console.log;
      const ApiData = {
        pipelineId: SelectedPipeline.id,
        reorderedStages: updateStages,
      }

      //// //console.log;
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
          setShowStagesPopup(false)
          setShowReorderBtn(false)
          handleCloseStagePopover()
          setSuccessSnack(response.data.message)
          setShowRenamePipelinePopup(null)
          handlePipelineClosePopover()
          handleCloseOtherPipeline();
        }
      }
    } catch (error) {
      // console.error("Error occured in rearrange order api is:", error);
    } finally {
      // //console.log;
      setReorderStageLoader(false)
    }
  }

  //code to  close tha add new stage
  const handleCloseAddStage = () => {
    setAddNewStageModal(false)
    setNewStageTitle('')
    // setStageColor("");
    setInputs([
      {
        id: 1,
        value: '',
        placeholder: `Sure, i'd be interested in knowing what my home is worth`,
      },
      {
        id: 2,
        value: '',
        placeholder: 'Yeah, how much is my home worth today?',
      },
      {
        id: 3,
        value: '',
        placeholder: 'Yeah, how much is my home worth today?',
      },
    ])
    setAction('')
    setStageColor('#000000')
    setShowAdvanceSettings(false)
    setAssignToMember('')
    setTagsValue([])
    setIsEditingStage(false) // Reset editing state
  }

  //fucntion to read more transcript text
  const handleReadMoreToggle = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpanded((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id]
      }
    })
  }

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

  //fucntion to ShowMore ActivityData transcript text
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
          handleCloseOtherPipeline();
        }
      }
    } catch (error) {
      // console.error("Error occured in add lead note api is:", error);
    } finally {
      setAddLeadNoteLoader(false)
    }
  }

  //If lead stage is updated manually
  async function HandleUpdateStage(stage) {
    // Refresh pipeline data from server so lead appears in correct stage column and counts are correct
    if (SelectedPipeline) {
      await getPipelineDetails(SelectedPipeline)
    }
    // setShowDetailsModal(false);
    console.log("Stage is passing in handle update stage api is", stage);
    let selLead = selectedLeadsDetails
    selLead.stage = stage.id
    let updatedLeads = []
    LeadsList.map((lead) => {
      if (selLead.id == lead.id) {
        updatedLeads.push(selLead)
      } else {
        updatedLeads.push(lead)
      }
    })
    setLeadsList(updatedLeads)

    // //console.log;

    const updatedPipelines = PipeLines.map((pipeline) => {
      return {
        ...pipeline,
        leads: pipeline.leads.map((lead) => {
          // Check if the lead's ID matches the selected lead's ID
          if (lead.lead.id === selLead.id) {
            return {
              ...lead,
              lead: {
                ...lead.lead,
                ...selLead, // Update the lead with the selectedLead's data
              },
            }
          }
          return lead // Return the lead unchanged if no match
        }),
      }
    })

    // //console.log;

    // //console.log;

    // let leadesList = [];

    setStagesList(SelectedPipeline.stages)

    setPipeLines(updatedPipelines)
    handleCloseOtherPipeline()
  }

  function HandleLeadAssignedTeam(team, lead) {
    // Only update the one lead that was clicked (match by lead.id)
    if (!lead || !lead.id) return

    let updatedLeadForModal = null

    setLeadsList((prev) =>
      prev.map((item) => {
        // Update only the item for this lead (array item the user clicked)
        if (item.lead?.id !== lead.id) return item
        if (team === null) {
          const updatedLead = {
            ...item.lead,
            teamsAssigned: lead.teamsAssigned || [],
          }
          updatedLeadForModal = updatedLead
          return { ...item, lead: updatedLead }
        }
        const existingTeams = item.lead.teamsAssigned || []
        const teamId = team.id || team.invitedUserId
        const isAlreadyAssigned = existingTeams.some((t) => {
          const tId = t.id || t.invitedUserId
          return String(tId) === String(teamId)
        })
        const updatedLead = isAlreadyAssigned
          ? { ...item.lead, teamsAssigned: lead.teamsAssigned || existingTeams }
          : { ...item.lead, teamsAssigned: [...existingTeams, team] }
        updatedLeadForModal = updatedLead
        return { ...item, lead: updatedLead }
      })
    )

    setPipeLines((prevPipelines) =>
      prevPipelines.map((pipeline) => {
        if (pipeline.id !== SelectedPipeline?.id) return pipeline
        return {
          ...pipeline,
          leads: (pipeline.leads || []).map((l) => {
            if (l.lead?.id !== lead.id) return l
            if (team === null) {
              return {
                ...l,
                lead: { ...l.lead, teamsAssigned: lead.teamsAssigned || [] },
              }
            }
            const existingTeams = l.lead.teamsAssigned || []
            const teamId = team.id || team.invitedUserId
            const isAlreadyAssigned = existingTeams.some((t) => {
              const tId = t.id || t.invitedUserId
              return String(tId) === String(teamId)
            })
            const updatedLead = isAlreadyAssigned
              ? { ...l.lead, teamsAssigned: lead.teamsAssigned || existingTeams }
              : { ...l.lead, teamsAssigned: [...existingTeams, team] }
            return { ...l, lead: updatedLead }
          }),
        }
      })
    )

    if (updatedLeadForModal && selectedLeadsDetails?.id === lead.id) {
      setSelectedLeadsDetails(updatedLeadForModal)
    }
  }
  //function to delete leads
  const handleDelLead = async () => {
    try {
      const leadToDelete = selectedLeadsDetails
      // Remove the lead from the list
      const filteredLeads = LeadsList?.filter(
        (lead) => lead.lead.id !== leadToDelete.id,
      )

      // Remove the lead from all pipelines, safely handling undefined leads
      const filteredPipelines = PipeLines.map((pipeline) => ({
        ...pipeline,
        leads: (pipeline.leads || []).filter(
          (lead) => lead.lead.id !== leadToDelete.id,
        ),
      }))

      setPipeLines(filteredPipelines)
      setLeadsList(filteredLeads)
      setSelectedLeadsDetails(null) // Clear selected lead
      setShowDetailsModal(false) // Hide modal
      handleCloseOtherPipeline();
    } catch (error) { }
  }

  function handldSearch(e) {
    let search = e.target.value.toLowerCase()
    setSearchValue(search)
    let pipeline = SelectedPipeline

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current) // Clear previous timer
    }

    searchTimeout.current = setTimeout(() => {
      if (search === '') {
        setLeadsList(reservedLeads)
        setLeadsCountInStage(reservedLeadsCountInStage)
      } else {
        getMoreLeadsInStage({
          stageId: pipeline?.stages[0].id,
          search: search,
        })
      }
    }, 500) // Delay of 3000ms = 3 seconds
  }

  const styles = {
    heading: {
      fontWeight: '700',
      fontSize: 17,
    },
    paragraph: {
      fontWeight: '500',
      fontSize: 15,
    },
    paragraph14: {
      fontWeight: '500',
      fontSize: 14,
    },
    agentName: {
      fontWeight: '600',
      fontSize: 12,
    },
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
    heading: {
      fontWeight: '700',
      fontSize: 17,
    },
    paragraph: {
      fontWeight: '500',
      fontSize: 15,
    },
    subHeading: {
      fontWeight: '500',
      fontSize: 12,
      color: '#00000060',
    },
    heading2: {
      fontWeight: '500',
      fontSize: 15,
      color: '#00000080',
    },
    /** Reusable "medium elevation" for popovers/paper: 1px border #eaeaea + shadow. Use when annotation says "medium elevation". */
    mediumElevation: {
      borderRadius: 12,
      border: '1px solid #eaeaea',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
    },
  }

  return (
    <div className="w-full flex flex-col items-start h-screen">
      {initialLoader ? (
        <div className="w-screen">
          <PipelineLoading />
        </div>
      ) : (
        <>
          <AgentSelectSnackMessage
            type={SnackbarTypes.Success}
            isVisible={
              SuccessSnack == null || SuccessSnack == false ? false : true
            }
            hide={() => setSuccessSnack(false)}
            message={SuccessSnack}
          />

          <AgentSelectSnackMessage
            type={snackMessage?.type}
            isVisible={snackMessage != null}
            hide={() => setSnackMessage(null)}
            message={snackMessage?.message}
          />
          <StandardHeader
            titleContent={
              <div className="flex flex-row items-center gap-[8px] py-2 px-3 rounded-lg hover:bg-black/[0.02] transition-colors">
                <TypographyH3 className="text-[18px] font-semibold tracking-[-1px]">
                  {SelectedPipeline?.title}
                </TypographyH3>
                <div>
                  <Menu
                    id={OtherPipelineId}
                    anchorEl={otherPipelinePopoverAnchorel}
                    open={openOtherPipelines}
                    onClose={handleCloseOtherPipeline}
                    MenuListProps={{
                      'aria-labelledby': OtherPipelineId,
                    }}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    slotProps={{
                      paper: {
                        style: {
                          ...styles.mediumElevation,
                          width: '194px',
                          marginLeft: '16px',
                        },
                        sx: {
                          '@keyframes slideUp20': {
                            from: { transform: 'translateY(20px)', opacity: 0 },
                            to: { transform: 'translateY(0)', opacity: 1 },
                          },
                          animation: 'slideUp20 0.2s ease-out',
                        },
                      },
                      list: {
                        'aria-labelledby': 'long-button',
                        sx: { paddingBottom: '8px', paddingLeft: '2px', paddingRight: '2px' },
                      },
                    }}
                  >
                    <div
                      ref={pipelinesListContainerRef}
                      className="relative py-0 px-0 pb-2 flex flex-col gap-0.5 text-[14px] opacity-100"
                      onMouseLeave={() => setPipelinesListPillRect(null)}
                    >
                      {/* Sliding pill hover background: same as pipeline menu */}
                      {pipelinesListPillRect && (
                        <div
                          className="absolute rounded-lg transition-all duration-200 ease-out pointer-events-none"
                          style={{
                            left: pipelinesListPillRect.left,
                            top: pipelinesListPillRect.top,
                            width: pipelinesListPillRect.width,
                            height: pipelinesListPillRect.height,
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <div className='max-h-[20svh] overflow-y-auto'>
                        {PipeLines.map((item, index) => (
                          <MenuItem
                            key={index}
                            disableRipple
                            sx={{
                              fontSize: 14,
                              '&:hover': { backgroundColor: 'transparent' },
                              '&.Mui-focusVisible': { backgroundColor: 'transparent' },
                            }}
                            onClick={() => {
                              handleSelectOtherPipeline(item, index)
                              handleCloseOtherPipeline() // Close menu after selection
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const container = pipelinesListContainerRef.current
                              if (!container) return
                              const cRect = container.getBoundingClientRect()
                              setPipelinesListPillRect({
                                left: rect.left - cRect.left,
                                top: rect.top - cRect.top,
                                width: rect.width,
                                height: rect.height,
                              })
                            }}
                          >
                            <div className='w-full flex flex-row items-center justify-between text-[14px] text-black opacity-100'>
                              <div className={SelectedPipeline?.title === item.title ? 'text-brand-primary' : 'text-black'}>
                                {item.title}
                              </div>
                              {
                                SelectedPipeline?.title === item.title && (
                                  <Check
                                    className="w-5 h-5 flex-shrink-0 text-brand-primary"
                                  />
                                )
                              }
                            </div>
                          </MenuItem>
                        ))}
                      </div>
                      <button
                      className={`flex flex-row items-center px-4 py-2 w-full text-purple outline-none ${PipeLines.length > 1 && !pipelineDetailLoader ? 'mt-1' : 'mt-0'}`}
                      style={styles.paragraph14}
                      onClick={() => {
                        if (
                          user?.planCapabilities.maxPipelines >
                          user?.currentUsage.maxPipelines
                        ) {
                          setCreatePipeline(true)
                        } else {
                          setShowUpgradeModal(true)
                        }
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const container = pipelinesListContainerRef.current
                        if (!container) return
                        const cRect = container.getBoundingClientRect()
                        setPipelinesListPillRect({
                          left: rect.left - cRect.left,
                          top: rect.top - cRect.top,
                          width: rect.width,
                          height: rect.height,
                        })
                      }}
                    >
                      {/*<Plus size={17} weight="bold" />{' '}*/}
                      <span style={{ fontWeight: '500', fontSize: 14 }}>
                        New Pipeline
                      </span>
                    </button>
                    </div>
                  </Menu>
                </div>
                <button
                  aria-describedby={id}
                  variant="contained"
                  onClick={handleShowPipelinePopover}
                  className="outline-none"
                >
                  <DotsThree size={27} weight="bold" />
                </button>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={pipelinePopoverAnchorel}
                  onClose={handlePipelineClosePopover}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  slotProps={{
                    paper: {
                      style: styles.mediumElevation,
                      sx: {
                        '@keyframes slideUp20': {
                          from: { transform: 'translateY(20px)', opacity: 0 },
                          to: { transform: 'translateY(0)', opacity: 1 },
                        },
                        animation: 'slideUp20 0.2s ease-out',
                      },
                    },
                  }}
                >
                  <div
                    className="relative py-3 px-3 flex flex-col gap-0.5 text-[14px]"
                    ref={pipelineMenuContainerRef}
                    onMouseLeave={() => setPipelineMenuPillRect(null)}
                  >
                    {/* Sliding pill hover background: black 2% opacity, 8px radius, slides under hovered child */}
                    {pipelineMenuPillRect && (
                      <div
                        className="absolute rounded-lg transition-all duration-200 ease-out pointer-events-none"
                        style={{
                          left: pipelineMenuPillRect.left,
                          top: pipelineMenuPillRect.top,
                          width: pipelineMenuPillRect.width,
                          height: pipelineMenuPillRect.height,
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          borderRadius: 8,
                        }}
                      />
                    )}
                    <button
                      className="outline-none flex flex-row items-center gap-4 w-full py-2 px-2 h-auto text-black"
                      style={styles.paragraph14}
                      onClick={handleShowOtherPipeline}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const container = pipelineMenuContainerRef.current
                        if (!container) return
                        const cRect = container.getBoundingClientRect()
                        setPipelineMenuPillRect({
                          left: rect.left - cRect.left,
                          top: rect.top - cRect.top,
                          width: rect.width,
                          height: rect.height,
                        })
                      }}
                    >
                      <LayoutGrid size={16} className="flex-shrink-0" />
                      <div className="flex flex-row items-center justify-between flex-1">
                        <div style={{ fontWeight: '500', fontSize: 14 }}>Pipelines</div>
                        <div
                          className="outline-none"
                          aria-describedby={OtherPipelineId}
                          variant="contained"
                        // onClick={handleShowOtherPipeline}
                        >
                          <CaretRight size={15} weight="bold" />
                        </div>
                      </div>
                    </button>
                    {SelectedPipeline?.pipelineType !== 'agency_use' && (
                      <>
                        <div className="w-full flex flex-row mt-0">
                          <button
                            className="text-black flex flex-row items-center gap-4 w-full py-2 px-2 h-auto outline-none"
                            style={styles.paragraph14}
                            onClick={() => {
                              setShowRenamePipelinePopup(true)
                              setRenamePipeline(SelectedPipeline.title)
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const container = pipelineMenuContainerRef.current
                              if (!container) return
                              const cRect = container.getBoundingClientRect()
                              setPipelineMenuPillRect({
                                left: rect.left - cRect.left,
                                top: rect.top - cRect.top,
                                width: rect.width,
                                height: rect.height,
                              })
                            }}
                          >
                            <Pencil size={16} className="flex-shrink-0" />
                            Rename
                          </button>
                        </div>
                        <div className="w-full flex flex-row mt-0">
                          <button
                            className="text-black flex flex-row items-center gap-4 w-full py-2 px-2 h-auto outline-none"
                            style={styles.paragraph14}
                            onClick={() => {
                              setAddNewStageModal(true)
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const container = pipelineMenuContainerRef.current
                              if (!container) return
                              const cRect = container.getBoundingClientRect()
                              setPipelineMenuPillRect({
                                left: rect.left - cRect.left,
                                top: rect.top - cRect.top,
                                width: rect.width,
                                height: rect.height,
                              })
                            }}
                          >
                            <Image
                              src={'/svgIcons/arrowBlack.svg'}
                              height={18}
                              width={15}
                              alt="*"
                            />
                            Add Stage
                          </button>
                        </div>
                        <div className="w-full flex flex-row mt-0">
                          <button
                            className="text-black flex flex-row items-center gap-4 w-full py-2 px-2 h-auto outline-none"
                            style={styles.paragraph14}
                            onClick={() => {
                              setShowStagesPopup(true)
                            }}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              const container = pipelineMenuContainerRef.current
                              if (!container) return
                              const cRect = container.getBoundingClientRect()
                              setPipelineMenuPillRect({
                                left: rect.left - cRect.left,
                                top: rect.top - cRect.top,
                                width: rect.width,
                                height: rect.height,
                              })
                            }}
                          >
                            <Image
                              src={'/assets/list.png'}
                              height={18}
                              width={15}
                              alt="*"
                            />
                            Rearrange Stage
                          </button>
                        </div>
                      </>
                    )}

                    <button
                      className="text-red flex flex-row items-center gap-4 mt-0 w-full py-2 px-2 h-auto outline-none"
                      style={styles.paragraph14}
                      onClick={() => {
                        setShowDeletePiplinePopup(true)
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const container = pipelineMenuContainerRef.current
                        if (!container) return
                        const cRect = container.getBoundingClientRect()
                        setPipelineMenuPillRect({
                          left: rect.left - cRect.left,
                          top: rect.top - cRect.top,
                          width: rect.width,
                          height: rect.height,
                        })
                      }}
                    >
                      <Trash2 size={16} className="flex-shrink-0" />
                      Delete
                    </button>
                  </div>
                </Popover>
              </div>
            }
            showTasks={true}
            showFilters={true}
            onFilterClick={handleOpenFilterModal}
            filterBadge={appliedTeamMemberIds.length > 0 ? appliedTeamMemberIds.length : null}
            rightContent={
              <div
                className="flex flex-row items-center gap-1 w-auto min-w-[350px] border border-gray-200 rounded-lg pl-1 pr-4 h-10 focus-within:ring-2 focus-within:ring-brand-primary focus-within:border focus-within:border-brand-primary transition-shadow"
              >
                <input
                  style={{ fontSize: 14, MozOutline: 'none' }}
                  value={searchValue}
                  onChange={handldSearch}
                  className="flex-grow outline-none font-[500] bg-transparent border-none focus:outline-none focus:ring-0 flex-shrink-0 rounded-lg text-[14px] placeholder:text-[14px]"
                  placeholder="Search by name, phone or email"
                />
                <button type="button" className="outline-none flex-shrink-0">
                  <Image
                    src={'/otherAssets/searchIcon.png'}
                    height={20}
                    width={20}
                    alt="Search"
                  />
                </button>
              </div>
            }
          />

          {pipelineDetailLoader ? (
            <PipelineLoading fullScreen={false} />
          ) : (
            <div className="flex flex-col items-center w-full">
              <div
                className="w-[95%] flex flex-col items-start overflow-x-auto  h-[85vh] mt-4
            scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
            "
              >
                <div className="flex flex-row items-center gap-4"></div>

                <div className="flex flex-row items-start gap-2 h-full">
                  <div className="flex flex-row items-start gap-4 h-full">
                    {StagesList?.map((stage, index) => (
                      <div
                        key={index}
                        style={{ width: '350px' }}
                        className="flex flex-col items-start h-full min-h-full gap-3 bg-[#00000005] rounded-xl p-4"
                      >
                        {/* Display the stage */}
                        <div className="flex flex-row items-center w-full justify-between pb-4 border-b border-gray-200">
                          <div
                            className="h-[36px] flex flex-row items-center justify-start gap-2 rounded-xl px-4"
                            style={{
                              ...styles.heading,
                              backgroundColor: "transparent", //stage.defaultColor,
                              color: 'black',
                              // textShadow: '1px 1px 2px rgba(0, 0, 0, 0.6)',
                            }}
                          >
                            <span className="font-semibold">
                              {stage.stageTitle.length > 15 ? (
                                <div className="flex flex-row items-center gap-1">
                                  {stage.stageTitle.slice(0, 15) + '...'}
                                </div>
                              ) : (
                                stage.stageTitle
                              )}
                            </span>
                            <div
                              // className="rounded-full px-2 py-1 bg-white flex flex-row items-center justify-center text-black"
                              className="rounded-full bg-white flex items-center justify-center text-black w-[42px] h-[42px] min-w-[42px] min-h-[42px] shrink-0 px-1"
                              style={{ ...styles.paragraph, fontSize: 14 }}
                            >
                              {/* {leadCounts[stage.id] ? (
                            <div>{leadCounts[stage.id]}</div>
                          ) : (
                            "0"
                          )} */}

                              {leadsCountInStage?.[stage.id] !== undefined
                                ? leadsCountInStage[stage.id]
                                : '0'}

                              {/* {leadCounts.map((item) => {
   
                                                })} */}
                            </div>
                          </div>

                          <button
                            aria-describedby={stageId}
                            variant="contained"
                            onClick={(evetn) => {
                              if (
                                stage.identifier === 'new_lead' ||
                                stage.identifier === 'booked'
                              ) {
                                // //console.log;
                                setShowDelBtn(true)
                              } else {
                                setShowDelBtn(false)
                              }
                              if (
                                stage.identifier.startsWith('custom_stage') ||
                                stage.identifier.startsWith('hot_lead')
                              ) {
                                setShowConfigureBtn(true)
                              } else {
                                setShowConfigureBtn(false)
                              }
                              // //console.log;
                              handleShowStagePopover(evetn, stage)
                            }}
                            className="outline-none"
                          >
                            <DotsThree size={27} weight="bold" />
                          </button>
                        </div>
                        <Popover
                          id={stageId}
                          open={openStage}
                          anchorEl={StageAnchorel}
                          onClose={handleCloseStagePopover}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                          }}
                          PaperProps={{
                            elevation: 0,
                            style: {
                              borderRadius: 12,
                              border: '1px solid #eaeaea',
                              boxShadow: 'none',
                            },
                            sx: {
                              boxShadow: 'none',
                              border: '1px solid #eaeaea',
                              borderRadius: 12,
                            },
                          }}
                        >
                          <div
                            className="bg-white inline-flex flex-col justify-start items-start gap-4"
                            style={{
                              borderRadius: 12,
                              border: '1px solid #eaeaea',
                              boxShadow: 'none',
                              paddingLeft: '2px',
                              paddingRight: '2px',
                              paddingTop: '12px',
                              paddingBottom: '12px',
                              width: '126px',
                            }}
                          >
                            <div
                              ref={stageAnchorContainerRef}
                              className="relative self-stretch flex flex-col justify-start items-start gap-2 text-[14px]"
                              onMouseLeave={() => setStageAnchorPillRect(null)}
                            >
                              {stageAnchorPillRect && (
                                <div
                                  className="absolute rounded-lg transition-all duration-200 ease-out pointer-events-none"
                                  style={{
                                    left: stageAnchorPillRect.left,
                                    top: stageAnchorPillRect.top,
                                    width: stageAnchorPillRect.width,
                                    height: stageAnchorPillRect.height,
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                    borderRadius: 8,
                                  }}
                                />
                              )}
                              {SelectedPipeline?.pipelineType !== 'agency_use' && (
                                <button
                                  className="self-stretch px-1 py-2 inline-flex justify-start items-center gap-2 outline-none"
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const container = stageAnchorContainerRef.current
                                    if (!container) return
                                    const cRect = container.getBoundingClientRect()
                                    setStageAnchorPillRect({
                                      left: rect.left - cRect.left,
                                      top: rect.top - cRect.top,
                                      width: rect.width,
                                      height: rect.height,
                                    })
                                  }}
                                  onClick={() => {
                                    setShowRenamePopup(true)
                                    // //console.log;
                                    setRenameStage(selectedStage.stageTitle)
                                    setUpdateStageColor(
                                      selectedStage.defaultColor,
                                    )
                                  }}
                                >
                                  <Image
                                    src={'/assets/editPen.png'}
                                    height={16}
                                    width={16}
                                    alt="*"
                                  />
                                  <div className="w-36 text-start justify-start text-black text-[14px] font-normal font-['Inter'] leading-normal">
                                    Rename
                                  </div>
                                </button>
                              )}
                              <button
                                className="self-stretch px-1 py-2 inline-flex justify-start items-center gap-2 outline-none"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect()
                                  const container = stageAnchorContainerRef.current
                                  if (!container) return
                                  const cRect = container.getBoundingClientRect()
                                  setStageAnchorPillRect({
                                    left: rect.left - cRect.left,
                                    top: rect.top - cRect.top,
                                    width: rect.width,
                                    height: rect.height,
                                  })
                                }}
                                onClick={() => colorPickerRef.current.click()}
                              >
                                <div
                                  style={{
                                    height: 18,
                                    width: 18,
                                    borderRadius: '50%',
                                    backgroundColor: stageColorUpdate,
                                    cursor: 'pointer', // Pointer to indicate clickable
                                  }}
                                  onClick={() => colorPickerRef.current.click()} // Trigger ColorPicker
                                />
                                <div className="justify-start text-start text-black text-[14px] font-normal font-['Inter'] leading-normal">
                                  Color
                                </div>
                                <div
                                  style={{
                                    opacity: 0,
                                    position: 'absolute',
                                    pointerEvents: 'auto', // Ensure interactions still work
                                  }}
                                >
                                  <ColorPicker
                                    ref={colorPickerRef}
                                    setStageColor2={setStageColorUpdate}
                                    setStageColor={setUpdateStageColor}
                                    onlyShowColorBox={true}
                                    updateOnchange={true}
                                    handleUpdateColor={handleUpdateColor}
                                    stageColor={stageColorUpdate}
                                  />
                                </div>
                              </button>
                              {showConfigureBtn && (
                                <button
                                  className="self-stretch px-1 py-2 inline-flex justify-start items-center gap-2 outline-none"
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const container = stageAnchorContainerRef.current
                                    if (!container) return
                                    const cRect = container.getBoundingClientRect()
                                    setStageAnchorPillRect({
                                      left: rect.left - cRect.left,
                                      top: rect.top - cRect.top,
                                      width: rect.width,
                                      height: rect.height,
                                    })
                                  }}
                                  onClick={() => {
                                    // Parse advancedConfig JSON string to get action and examples
                                    let parsedConfig = {}
                                    if (selectedStage.advancedConfig) {
                                      try {
                                        parsedConfig = JSON.parse(
                                          selectedStage.advancedConfig,
                                        )
                                      } catch (error) {
                                        console.error(
                                          'Error parsing advancedConfig:',
                                          error,
                                        )
                                      }
                                    }

                                    // Pre-populate the modal with selected stage data
                                    setNewStageTitle(selectedStage.stageTitle)
                                    setStageColor(
                                      selectedStage.defaultColor || '#000000',
                                    )
                                    // setTagsValue(selectedStage.tags)
                                    const tags = selectedStage.tags

                                    const tagNames = tags.map(
                                      (item) => item.tag,
                                    )

                                    setTagsValue(tagNames)
                                    // setAssignToMember(
                                    //   selectedStage?.teams[0]?.name
                                    // );
                                    setAssignToMember(
                                      selectedStage?.teams?.[
                                        selectedStage.teams.length - 1
                                      ]?.name ?? '',
                                    )
                                    setAssignLeadToMember([
                                      ...assignLeadToMember,
                                      selectedStage?.teams[0]?.id,
                                    ])
                                    setAction(parsedConfig.action || '')

                                    // Pre-populate sample answers if they exist
                                    const stageExamples =
                                      parsedConfig.examples || []

                                    if (
                                      stageExamples &&
                                      stageExamples.length > 0
                                    ) {
                                      const updatedInputs = inputs.map(
                                        (input, index) => {
                                          const exampleValue =
                                            stageExamples[index]
                                          // Handle both object format {id, value} and string format
                                          const value =
                                            typeof exampleValue === 'object' &&
                                              exampleValue?.value
                                              ? String(exampleValue.value)
                                              : String(exampleValue || '')

                                          return {
                                            ...input,
                                            value: value,
                                          }
                                        },
                                      )
                                      setInputs(updatedInputs)
                                    } else {
                                      // Clear inputs if no examples
                                      const clearedInputs = inputs.map(
                                        (input) => ({
                                          ...input,
                                          value: '',
                                        }),
                                      )
                                      setInputs(clearedInputs)
                                    }

                                    // Automatically show advanced settings when configuring
                                    setShowAdvanceSettings(true)
                                    setIsEditingStage(true)
                                    setAddNewStageModal(true)
                                    // Close the stage popover
                                    handleCloseStagePopover()
                                  }}
                                >
                                  <Image
                                    src={'/otherAssets/colorDrop.jpg'}
                                    height={18}
                                    width={18}
                                    alt="*"
                                  />
                                  <div className="justify-start text-black text-[14px] font-normal font-['Inter'] leading-normal">
                                    Configure
                                  </div>
                                </button>
                              )}
                              {!showDelBtn && SelectedPipeline?.pipelineType !== 'agency_use' && (
                                <button
                                  className="self-stretch px-1 py-2 inline-flex justify-start items-center gap-2 outline-none"
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    const container = stageAnchorContainerRef.current
                                    if (!container) return
                                    const cRect = container.getBoundingClientRect()
                                    setStageAnchorPillRect({
                                      left: rect.left - cRect.left,
                                      top: rect.top - cRect.top,
                                      width: rect.width,
                                      height: rect.height,
                                    })
                                  }}
                                  onClick={() => {
                                    // console.log(
                                    //   "Selected stage is:",
                                    //   selectedStage
                                    // );
                                    // setSelectedStage(item);
                                    setShowDelStageModal(true)
                                  }}
                                >
                                  <Image
                                    src={'/assets/delIcon.png'}
                                    height={18}
                                    width={18}
                                    alt="*"
                                  />
                                  <div className="w-36 justify-start text-start text-red text-[14px] font-normal font-['Inter'] leading-normal">
                                    Delete
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>
                        </Popover>

                        {/* Display leads matching this stage */}
                        {LeadsList?.filter(
                          (lead) => lead.lead.stage === stage.id,
                        ).length > 0 && (
                            <div
                              id={`scrollableDiv-${stage.id}`}
                              className="pipeline-stage-scroll relative w-full flex flex-col gap-4 h-[75vh] overflow-y-auto rounded-xl"
                              style={{
                                scrollbarWidth: 'none',
                                // borderWidth: 1,
                                // borderRadius: '12px',
                                // borderStyle: 'solid',
                                // borderColor: '#00000010',
                              }}
                            >
                              <InfiniteScroll
                                className="flex flex-col gap-[2px]"
                                endMessage={
                                  <p
                                    style={{
                                      textAlign: 'center',
                                      paddingTop: '10px',
                                      fontWeight: '400',
                                      fontFamily: 'inter',
                                      fontSize: 14,
                                      color: '#00000060',
                                      paddingBottom: 20,
                                    }}
                                  >
                                    {`You're all caught up`}
                                  </p>
                                }
                                scrollableTarget={`scrollableDiv-${stage.id}`}
                                dataLength={
                                  LeadsList?.filter(
                                    (lead) => lead.lead.stage === stage.id,
                                  ).length
                                }
                                next={() => {
                                  let leadsInStage = LeadsList?.filter(
                                    (lead) => lead.lead.stage === stage.id,
                                  )

                                  if (searchValue) {
                                    getMoreLeadsInStage({
                                      stageId: stage.id,
                                      offset: leadsInStage.length,
                                      search: searchValue,
                                    })
                                  } else {
                                    getMoreLeadsInStage({
                                      stageId: stage.id,
                                      offset: leadsInStage.length,
                                    })
                                  }
                                }} // Fetch more when scrolled
                                hasMore={hasMoreMap[stage.id] !== false}
                                loader={
                                  <div className="w-full flex justify-center mt-4 pb-12">
                                    <CircularProgress
                                      size={30}
                                      sx={{ color: '#7902DF' }}
                                    />
                                  </div>
                                }
                                style={{ overflow: 'unset' }}
                              >
                                {LeadsList?.filter(
                                  (lead) => lead.lead.stage === stage.id,
                                ).map((lead, leadIndex) => (
                                  <div
                                    className="mb-4 h-full"
                                    style={{ height: 'auto', backgroundColor: "transparent" }}
                                    key={leadIndex}
                                  >
                                    <div
                                      className="border bg-[#ffffff] rounded-xl p-3 pb-0 h-full flex flex-col gap-0.5"
                                      style={{ border: "1px solid ##1515151A" }}
                                      onMouseEnter={() => {
                                        const latestLead = LeadsList.find(
                                          (item) => item.lead?.id === lead.lead?.id
                                        )
                                        const leadToUse = latestLead?.lead || lead.lead
                                        // setShowDetailsModal(true)
                                        setSelectedLeadsDetails(leadToUse)
                                        // setPipelineId(leadToUse.pipeline?.id || lead.lead.pipeline?.id)
                                        // setNoteDetails(leadToUse.notes || lead.lead.notes || [])
                                      }}
                                      onMouseLeave={() => {
                                        setSelectedLeadsDetails(null)
                                      }}
                                    >
                                      <div className="flex flex-row items-center justify-between w-full">
                                        <button
                                          className="flex flex-row items-center gap-3"
                                          onClick={() => {
                                            // Get the latest lead data from LeadsList to ensure we have the most up-to-date teamsAssigned
                                            const latestLead = LeadsList.find(
                                              (item) => item.lead?.id === lead.lead?.id
                                            )
                                            const leadToUse = latestLead?.lead || lead.lead
                                            setShowDetailsModal(true)
                                            setSelectedLeadsDetails(leadToUse)
                                            setPipelineId(leadToUse.pipeline?.id || lead.lead.pipeline?.id)
                                            setNoteDetails(leadToUse.notes || lead.lead.notes || [])
                                          }}
                                        >
                                          {/* Lead profile picture with initials fallback */}
                                          <div className="relative">
                                            <div className="p-[1px] hover:bg-black/[0.02] rounded-full w-[38px] h-[38px] flex items-center justify-center transition-colors">
                                              {getLeadProfileImage(lead.lead, 36, 36)}
                                            </div>
                                            <div
                                              className="absolute -bottom-0.5 -right-0.5 z-[1000] rounded-full border border-white flex items-center justify-center overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                                            >
                                              {getAgentsListImage(
                                                lead.agent?.agents[0]?.agentType ===
                                                  'outbound'
                                                  ? lead.agent?.agents[0]
                                                  : lead.agent?.agents[1] ? lead.agent?.agents[1] : lead.agent?.agents[0],
                                                22,
                                                22,
                                              )}
                                            </div>
                                          </div>
                                          <div style={{ ...styles.paragraph, fontSize: 16, fontWeight: 500, letterSpacing: '-0.5px' }} className="ml-1 capitalize">
                                            {lead.lead.firstName}
                                          </div>
                                        </button>
                                        {/* show results on hover */}
                                        {lead.lead.scoringDetails &&
                                          lead.lead.scoringDetails?.questions
                                            ?.length > 0 && (
                                            <ScoringProgress
                                              value={
                                                lead.lead.scoringDetails
                                                  ?.totalScore
                                              }
                                              maxValue={10}
                                              questions={
                                                lead.lead.scoringDetails
                                                  ?.questions
                                              }
                                              showTooltip={true}
                                              tooltipTitle="Results"
                                            />
                                          )}
                                      </div>
                                      <div className="flex flex-row items-center justify-between w-full mt-2 min-h-10">
                                        {/* Loader only for this card's lead (array item), not selectedLeadsDetails */}
                                        {assignLoaderLeadId === lead.lead.id ? (
                                          <CircularProgress size={20} />
                                        ) : (
                                          <TeamAssignDropdownCn
                                            withoutBorder={true}
                                            label=""
                                            teamOptions={getTeamOptionsForLead(lead.lead)}
                                            onToggle={(teamId, team, shouldAssign) => {
                                              if (shouldAssign) {
                                                if (team?.raw) {
                                                  handleAssignLeadToTeammember(team.raw, lead.lead)
                                                } else {
                                                  const allTeams = [
                                                    ...(myTeamAdmin ? [myTeamAdmin] : []),
                                                    ...(myTeamList || []),
                                                  ]
                                                  const teamToAssign = allTeams.find((t) => {
                                                    const tId =
                                                      t.invitedUserId || t.invitedUser?.id || t.id
                                                    return String(tId) === String(teamId)
                                                  })
                                                  if (teamToAssign) {
                                                    handleAssignLeadToTeammember(
                                                      teamToAssign,
                                                      lead.lead
                                                    )
                                                  }
                                                }
                                              } else {
                                                handleUnassignLeadFromTeammember(teamId, lead.lead)
                                              }
                                            }}
                                          />
                                        )}
                                        <div className="flex flex-col gap-1">
                                          {/* {lead?.lead?.email && (
                                            <Tooltip
                                              title={lead?.lead?.email}
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
                                                className="text-[#00000060]"
                                                style={styles.agentName}
                                              >
                                                {lead?.lead?.email?.slice(0, 10) + '...'}
                                              </div>
                                            </Tooltip>
                                          )}
                                          Display plan price for agency_use pipeline leads */}
                                          {(() => {
                                            const isAgencyUse = SelectedPipeline?.pipelineType === 'agency_use'
                                            const planPrice = lead?.lead?.agencyUseInfo?.planPrice

                                            // Debug logging
                                            if (isAgencyUse) { }

                                            return isAgencyUse && planPrice ? (
                                              <div
                                                className="rounded-full flex flex-row items-center justify-center"
                                                style={{
                                                  fontSize: '11px',
                                                  fontWeight: "400",
                                                  height: "28px",
                                                  width: "70px",
                                                  backgroundColor: "#00000005",
                                                  fontSize: "14px",
                                                }}
                                              >
                                                ${planPrice}
                                              </div>
                                            ) : null
                                          })()}
                                        </div>
                                      </div>

                                      {lead?.lead?.booking?.date && (
                                        <div
                                          className="flex flex-row items-center gap-2"
                                          style={{
                                            // fontWeight: "500",

                                            color: '#15151560',
                                            // backgroundColor: 'red',
                                          }}
                                        >
                                          <Image
                                            src="/svgIcons/calendar.svg"
                                            height={16}
                                            width={16}
                                            alt="*"
                                            style={{ filter: 'opacity(50%)' }}
                                          />
                                          <p
                                            style={{
                                              fontSize: 13,
                                              fontWeight: 500,
                                            }}
                                          >
                                            {FormatBookingDateTime(
                                              lead?.lead?.booking?.datetime,
                                              lead?.lead?.booking?.timezone,
                                            )}
                                          </p>
                                        </div>
                                      )}

                                      <div className="flex items-center flex-row gap-2 mt-2 pt-2 pb-3 border-t border-[#eaeaea]">

                                        <TagManagerCn
                                          tags={lead.lead.tags || []}
                                          tagInputRef={getOrCreateInputRef(lead.lead.id)}
                                          tagInputValue={tagInputValues[lead.lead.id] ?? ''}
                                          onInputChange={(e) => handleTagInputChange(e, lead)}
                                          onInputKeyDown={(e) => handleTagInputKeyDown(e, lead)}
                                          showSuggestions={showTagSuggestionsByLead[lead.lead.id] ?? false}
                                          setShowSuggestions={(show) =>
                                            setShowTagSuggestionsByLead((prev) => ({ ...prev, [lead.lead.id]: show }))
                                          }
                                          tagSuggestions={tagSuggestionsByLead[lead.lead.id] ?? []}
                                          onSuggestionClick={(suggestion) => handleTagSuggestionClick(suggestion, lead)}
                                          addTagLoader={addTagLoaderLeadId === lead.lead.id}
                                          onRemoveTag={(tag) => handleDelTagForLead(tag, lead)}
                                          delTagLoader={delTagLoaderByLead[lead.lead.id]}
                                          onRefreshSuggestions={getUniqueTags}
                                          selectedUser={user}
                                          showSnackbar={showSnackbar}
                                          onLeadDetailsUpdated={(deletedTagName) =>
                                            handleLeadDetailsUpdatedForLead(deletedTagName, lead)
                                          }
                                          from={"dashboardPipeline"}
                                        />
                                      </div>

                                    </div>
                                  </div>
                                ))}
                              </InfiniteScroll>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                  <div className="h-[36px] flex flex-row items-start justify-center">
                    <button
                      className="h-[23px] text-brand-primary outline-none mt-2"
                      style={{
                        width: '200px',
                        fontSize: '16.8',
                        fontWeight: '700',
                      }}
                      onClick={() => {
                        setAddNewStageModal(true)
                      }}
                    >
                      Add Stage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Code for Configure Popup */}
          {showConfigurePopup && (
            <ConfigurePopup
              showConfigurePopup={showConfigurePopup}
              setShowConfigurePopup={setShowConfigurePopup}
              configureLoader={configureLoader}
              setConfigureLoader={setConfigureLoader}
              selectedStage={selectedStage}
              setStagesList={setStagesList}
              setSnackMessage={setSnackMessage}
              handleCloseStagePopover={handleCloseStagePopover}
            />
          )}

          {/* code for delete pipeline modal */}

          <Modal
            open={showDeletePipelinePopup}
            onClose={() => {
              setShowDeletePiplinePopup(false)
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 250,
              sx: {
                backgroundColor: '#00000099',
              },
            }}
          >
            <Box
              className="lg:w-5/12 sm:w-7/12 w-8/12"
              sx={{
                ...styles.modalsStyle,
                '@keyframes addPipelineModalEntry': {
                  from: { transform: 'scale(0.95) translateY(-55%)', opacity: 0 },
                  to: { transform: 'scale(1) translateY(-55%)', opacity: 1 },
                },
                animation: 'addPipelineModalEntry 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              <div className="flex flex-row justify-center w-auto min-w-0">
                <div
                  className="w-[400px] flex flex-col gap-3 p-0 overflow-hidden"
                  style={{
                    backgroundColor: '#ffffff',
                    ...styles.mediumElevation,
                    boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                    borderRadius: 12,
                  }}
                >
              <div className="flex flex-row justify-between h-auto py-3 px-4 w-full border-b" style={{ borderColor: '#eaeaea', borderWidth: '1px' }}>
                    <div className="text-lg font-semibold" style={{ fontSize: 18, fontWeight: 600 }}>
                      Delete Pipeline
                    </div>
                    <button
                      onClick={() => {
                        setShowDeletePiplinePopup(false)
                      }}
                      className="outline-none"
                    >
                      <Image
                        src={'/assets/cross.png'}
                        height={14}
                        width={14}
                        alt="Close"
                      />
                    </button>
                  </div>
                  <div
                    className="max-h-[60vh] overflow-auto px-4 py-3"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    <div
                      className="mb-4"
                      style={{ fontWeight: '700', fontSize: 18 }}
                    >
                      Are you sure you want to delete this pipeline?
                    </div>

                <div className="flex flex-row items-center justify-center gap-4 mt-6">
                  <button
                        className="w-1/2 mt-[13px]"
                        onClick={() => setShowDeletePiplinePopup(false)}
                      >
                        Never mind
                      </button>
                  <div className="w-1/2">
                    {deletePipelineLoader ? (
                      <div className="flex flex-row items-center w-full mt-4">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <button
                        className="mt-4 outline-none bg-red"
                        style={{
                          color: 'white',
                          height: '50px',
                          borderRadius: '10px',
                          width: '100%',
                          fontWeight: 600,
                          fontSize: '20',
                        }}
                        onClick={handleDeletePipeline}
                      >
                        Yes! Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
                </div>
              </div>
            </Box>
          </Modal>
          {/* Code for add stage modal */}
          <Modal
            open={addNewStageModal}
            onClose={() => {
              handleCloseAddStage()
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 250,
              sx: {
                backgroundColor: '#00000099',
              },
            }}
          >
            <Box
              className="lg:w-5/12 sm:w-7/12 w-8/12"
              sx={{
                ...styles.modalsStyle,
                '@keyframes addPipelineModalEntry': {
                  from: { transform: 'scale(0.95) translateY(-55%)', opacity: 0 },
                  to: { transform: 'scale(1) translateY(-55%)', opacity: 1 },
                },
                animation: 'addPipelineModalEntry 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              <div className="flex flex-row justify-center w-auto min-w-0">
                <div
                  className="w-[400px] flex flex-col gap-3 p-0 overflow-hidden"
                  style={{
                    backgroundColor: '#ffffff',
                    ...styles.mediumElevation,
                    boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                    borderRadius: 12,
                  }}
                >
                  <div className="flex flex-row justify-between h-auto py-3 px-4 w-full border-b" style={{ borderColor: '#eaeaea', borderWidth: '1px' }}>
                    <div className="text-lg font-semibold" style={{ fontSize: 18, fontWeight: 600 }}>
                      {isEditingStage ? 'Configure Stage' : 'Add New Stage'}
                    </div>
                    <button
                      onClick={() => {
                        handleCloseAddStage()
                      }}
                      className="outline-none"
                    >
                      <Image
                        src={'/assets/cross.png'}
                        height={14}
                        width={14}
                        alt="Close"
                      />
                    </button>
                  </div>

                  <div className="max-h-[60vh] overflow-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
                    <div
                      className="mt-4"
                      style={{
                        fontWeight: '600',
                        fontSize: 12,
                        paddingBottom: 5,
                      }}
                    >
                      Stage Title*
                    </div>
                    <input
                      value={newStageTitle}
                      onChange={(e) => {
                        setNewStageTitle(e.target.value)
                      }}
                      placeholder="Enter stage title"
                      className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                      style={{ border: '1px solid #00000020' }}
                    />
                    <div
                      style={{
                        marginTop: 20,
                        fontWeight: '600',
                        fontSize: 12,
                        paddingBottom: 5,
                      }}
                    >
                      color
                    </div>
                    <ColorPicker setStageColor={setStageColor} />
                  </div>

                  <div className="text-brand-primary mt-4">
                    <button
                      onClick={() => {
                        setShowAdvanceSettings(!showAdvanceSettings)
                      }}
                      className="outline-none flex flex-row items-center gap-2"
                    >
                      <div style={{ fontWeight: '600', fontSize: 15 }}>
                        Advanced Settings
                      </div>
                      {showAdvanceSettings ? (
                        <CaretUp size={15} weight="bold" />
                      ) : (
                        <CaretDown size={15} weight="bold" />
                      )}
                    </button>
                  </div>

                  {showAdvanceSettings && (
                    <div
                      className="max-h-[40vh] overflow-auto"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      <div className="flex flex-row items-center gap-2 mt-4">
                        <p style={{ fontWeight: '600', fontSize: 15 }}>
                          Action
                        </p>
                        {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
                        <Image
                          src="/svgIcons/infoIcon.svg"
                          height={20}
                          width={20}
                          alt="*"
                          style={{ filter: 'brightness(0)' }}
                          aria-owns={open ? 'mouse-over-popover' : undefined}
                          aria-haspopup="true"
                          onMouseEnter={handlePopoverOpen}
                          onMouseLeave={handlePopoverClose}
                        />

                        <Popover
                          id="mouse-over-popover"
                          sx={{
                            pointerEvents: 'none',
                          }}
                          open={openaction}
                          anchorEl={actionInfoEl}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          PaperProps={{
                            elevation: 1, // This will remove the shadow
                            style: {
                              boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.1)',
                            },
                          }}
                          onClose={handlePopoverClose}
                          disableRestoreFocus
                        >
                          <div className="p-2">
                            <div className="flex flex-row items-center gap-1">
                              <Image
                                src={'/svgIcons/infoIcon.svg'}
                                height={24}
                                width={24}
                                alt="*"
                                style={{ filter: 'brightness(0)' }}
                              />
                              <p style={{ fontWeight: '500', fontSize: 12 }}>
                                Tip: Tell your AI when to move the leads to this
                                stage.
                              </p>
                            </div>
                          </div>
                        </Popover>
                      </div>
                      {/*
                        <input
                          className="h-[50px] px-2 outline-none focus:ring-0 w-full mt-1 rounded-lg"
                          placeholder="Ex: Does the human express interest getting a CMA "
                          style={{
                            border: "1px solid #00000020",
                            fontWeight: "500",
                            fontSize: 15,
                          }}
                          value={action}
                          onChange={(e) => {
                            setAction(e.target.value);
                          }}
                        />
                      */}

                      <textarea
                        className="min-h-[50px] px-2 outline-none focus:ring-0 w-full mt-1 rounded-lg"
                        placeholder="Ex: Does the human express interest getting a CMA "
                        style={{
                          border: '1px solid #00000020',
                          fontWeight: '500',
                          fontSize: 15,
                          resize: 'vertical',
                          maxHeight: '200px',
                        }}
                        value={action}
                        onChange={(e) => {
                          setAction(e.target.value)
                        }}
                        rows={2}
                      />

                      <div className="flex flex-row items-center gap-2 mt-4">
                        <p style={{ fontWeight: '600', fontSize: 15 }}>
                          Sample Answers
                        </p>
                        {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
                        <Image
                          src="/svgIcons/infoIcon.svg"
                          height={20}
                          width={20}
                          alt="*"
                          style={{ filter: 'brightness(0)' }}
                          aria-owns={open ? 'mouse-over-popover2' : undefined}
                          aria-haspopup="true"
                          onMouseEnter={(event) => {
                            setShowSampleTip(true)
                            setAssigntoActionInfoEl(event.currentTarget)
                          }}
                          onMouseLeave={() => {
                            handlePopoverClose()
                            setShowSampleTip(false)
                          }}
                        />
                      </div>

                      <div
                        className="max-h-[30vh] overflow-auto mt-2" //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                        style={{ scrollbarWidth: 'none' }}
                      >
                        {inputs.map((input, index) => (
                          <div
                            key={input.id}
                            className="w-full flex flex-row items-center gap-4 mt-4"
                          >
                            <input
                              className="border p-2 rounded-lg px-3 outline-none focus:outline-none focus:ring-0 h-[53px]"
                              style={{
                                ...styles.paragraph,
                                width: '95%',
                                borderColor: '#00000020',
                              }}
                              placeholder={input.placeholder}
                              // placeholder={`
                              //     ${index === 0 ? "Sure, i would be interested in knowing what my home is worth" :
                              //         index === 1 ? "Yeah, how much is my home worth today?" :
                              //         `Add sample answer ${index + 1}`
                              //     }`}
                              value={input.value}
                              onChange={(e) =>
                                handleInputChange(input.id, e.target.value)
                              }
                            />
                            {/* <button className='outline-none border-none' style={{ width: "5%" }} onClick={() => handleDelete(input.id)}>
                                                        <Image src={"/assets/blackBgCross.png"} height={20} width={20} alt='*' />
                                                    </button> */}
                          </div>
                        ))}
                      </div>
                      {/* <div style={{ height: "50px" }}>
                                            {
                                                inputs.length < 3 && (
                                                    <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-purple rounded-lg underline' style={{
                                                        fontSize: 15,
                                                        fontWeight: "700"
                                                    }}>
                                                        Add New
                                                    </button>
                                                )
                                            }
                                        </div> */}

                      {/*!isEditingStage && (
                      )*/}
                      <>
                        <div className="flex flex-row items-center gap-2 mt-4">
                          <p style={{ fontWeight: '600', fontSize: 15 }}>
                            Assign to
                          </p>
                          {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
                          <Image
                            src="/svgIcons/infoIcon.svg"
                            height={20}
                            width={20}
                            alt="*"
                            style={{ filter: 'brightness(0)' }}
                            aria-owns={open ? 'mouse-over-popover2' : undefined}
                            aria-haspopup="true"
                            onMouseEnter={(event) => {
                              setAssigntoActionInfoEl(event.currentTarget)
                            }}
                            onMouseLeave={handlePopoverClose}
                          />
                        </div>

                        <Popover
                          id="mouse-over-popover2"
                          sx={{
                            pointerEvents: 'none',
                          }}
                          open={openAssigneAction}
                          anchorEl={assigntoActionInfoEl}
                          anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                          }}
                          transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                          }}
                          PaperProps={{
                            elevation: 1, // This will remove the shadow
                            style: {
                              boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.1)',
                            },
                          }}
                          onClose={handlePopoverClose}
                          disableRestoreFocus
                        >
                          <div className="p-2">
                            <div className="flex flex-row items-center gap-1">
                              <Image
                                src={'/svgIcons/infoIcon.svg'}
                                height={24}
                                width={24}
                                alt="*"
                                style={{ filter: 'brightness(0)' }}
                              />
                              <p style={{ fontWeight: '500', fontSize: 12 }}>
                                {showSampleTip
                                  ? 'What are possible answers leads will give to this question?'
                                  : 'Notify a team member when leads move here.'}
                              </p>
                            </div>
                          </div>
                        </Popover>

                        {/* <button
                    className="flex flex-row items-center w-full justify-between rounded-lg h-[50px] px-2 mt-1 outline-none"
                    style={{ border: "1px solid #00000020" }}
                  >
                    <div>Select team member</div>
                    <div>
                      <CaretDown size={20} weight="bold" />
                    </div>
                  </button> */}

                        <div className="mt-2">
                          <FormControl fullWidth>
                            <Select
                              id="demo-simple-select"
                              value={assignToMember || ''} // Default to empty string when no value is selected
                              onChange={handleAssignTeamMember}
                              displayEmpty // Enables placeholder
                              renderValue={(selected) => {
                                if (!selected) {
                                  return (
                                    <div style={{ color: '#aaa' }}>
                                      Select team member
                                    </div>
                                  ) // Placeholder style
                                }
                                return selected
                              }}
                              sx={{
                                border: '1px solid #00000020', // Default border
                                '&:hover': {
                                  border: '1px solid #00000020', // Same border on hover
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: 'none', // Remove the default outline
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                                {
                                  border: 'none', // Remove outline on focus
                                },
                                '&.MuiSelect-select': {
                                  py: 0, // Optional padding adjustments
                                },
                              }}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: '30vh', // Limit dropdown height
                                    overflow: 'auto', // Enable scrolling in dropdown
                                    scrollbarWidth: 'none',
                                  },
                                },
                              }}
                            >
                              {/* <MenuItem value={myTeamAdmin?.name}>
                          <div className="w-full flex flex-row items-center gap-2">
                            <div>{myTeamAdmin.name}</div>
                            <div className="bg-purple text-white text-sm px-2 rounded-full">
                              Admin
                            </div>
                          </div>
                        </MenuItem> */}

                              {myTeamList.map((item, index) => {
                                return (
                                  <MenuItem
                                    className="flex flex-row items-center gap-2"
                                    key={index}
                                    value={item?.invitedUser?.name}
                                  >
                                    {/* <Image
                                                              src={item.invitedUser.full_profile_image || "/agentXOrb.gif"}
                                                              width={35}
                                                              height={35}
                                                              alt="*"
                                                            /> */}
                                    {getAgentsListImage(
                                      item?.invitedUser,
                                      42,
                                      42,
                                    )}
                                    {item.invitedUser?.name}
                                    {item.id === -1 && (
                                      <div className="bg-brand-primary text-white text-sm px-2 rounded-full">
                                        Admin
                                      </div>
                                    )}
                                  </MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </div>

                        <p
                          className="mt-2"
                          style={{ fontWeight: '500', fontSize: 15 }}
                        >
                          Tags
                        </p>

                        <div
                          className="h-[45px] p-2 rounded-lg  items-center gap-2"
                          style={{ border: '0px solid #00000030' }}
                        >
                          <TagsInput setTags={setTagsValue} tags={tagsValue} />
                        </div>
                      </>
                    </div>
                  )}

                <div className="w-full h-[80px]">
                  {
                    //inputs.filter(input => input.value.trim()).length === 3 &&
                    canProceed() ? (
                      <div>
                        {addStageLoader ? (
                          <div className="flex flex-row iems-center justify-center w-full mt-4">
                            <CircularProgress size={25} />
                          </div>
                        ) : (
                          <button
                            className="mt-4 outline-none"
                            style={{
                              backgroundColor: 'hsl(var(--brand-primary))',
                              color: 'white',
                              height: '50px',
                              borderRadius: '10px',
                              width: '100%',
                              fontWeight: 600,
                              fontSize: '20',
                            }}
                            onClick={
                              isEditingStage
                                ? handleUpdateCustomStage
                                : handleAddCustomStage
                            }
                          >
                            {isEditingStage ? 'Update Stage' : 'Add Stage'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        disabled={true}
                        className="mt-4 outline-none"
                        style={{
                          backgroundColor: '#00000020',
                          color: 'black',
                          height: '50px',
                          borderRadius: '10px',
                          width: '100%',
                          fontWeight: 600,
                          fontSize: '20',
                        }}
                      >
                        Add
                      </button>
                    )
                  }
                </div>
              </div>
            </div>
            </Box>
          </Modal>
          {/* Modal to Rename the Stage */}
          <Modal
            open={showRenamePopup}
            onClose={() => {
              setShowRenamePopup(false)
              handleCloseStagePopover()
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 250,
              sx: {
                backgroundColor: '#00000099',
              },
            }}
          >
            <Box
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
              sx={{
                ...styles.modalsStyle,
                backgroundColor: 'white',
                '@keyframes addPipelineModalEntry': {
                  from: { transform: 'scale(0.95) translateY(-55%)', opacity: 0 },
                  to: { transform: 'scale(1) translateY(-55%)', opacity: 1 },
                },
                animation: 'addPipelineModalEntry 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              <div style={{ width: '100%' }}>
                <div
                  className="max-h-[60vh] overflow-auto"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div
                    style={{
                      width: '100%',
                      direction: 'row',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {/* <div style={{ width: "20%" }} /> */}
                    <div style={{ fontWeight: '700', fontSize: 22 }}>
                      Rename stage
                    </div>
                    <div
                      style={{
                        direction: 'row',
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowRenamePopup(false)
                          handleCloseStagePopover()
                        }}
                        className="outline-none"
                      >
                        <Image
                          src={'/assets/crossIcon.png'}
                          height={40}
                          width={40}
                          alt="*"
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div
                      className="mt-4"
                      style={{
                        fontWeight: '600',
                        fontSize: 12,
                        paddingBottom: 5,
                      }}
                    >
                      Stage Title
                    </div>
                    <input
                      value={renameStage}
                      onChange={(e) => {
                        setRenameStage(e.target.value)
                      }}
                      placeholder="Enter stage title"
                      className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                      style={{ border: '1px solid #00000020' }}
                    />
                    <div
                      style={{
                        marginTop: 20,
                        fontWeight: '600',
                        fontSize: 12,
                        paddingBottom: 5,
                      }}
                    >
                      color
                    </div>
                    <ColorPicker
                      setStageColor={setUpdateStageColor}
                      stageColor={updateStageColor}
                    />
                  </div>
                </div>

                {renameStageLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className="mt-4 outline-none  bg-brand-primary"
                    style={{
                      // backgroundColor: "#402FFF",
                      color: 'white',
                      height: '50px',
                      borderRadius: '10px',
                      width: '100%',
                      fontWeight: 600,
                      fontSize: '20',
                    }}
                    onClick={handleRenameStage}
                  >
                    Add
                  </button>
                )}
              </div>
            </Box>
          </Modal>
          {/* Modal to delete stage */}
          <Modal
            open={showDelStageModal}
            onClose={() => {
              setShowDelStageModal(false)
              handleCloseStagePopover()
            }}
            BackdropProps={{
              timeout: 100,
              sx: {
                backgroundColor: '#00000020',
                // //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
              sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
            >
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    width: '100%',
                    direction: 'row',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {/* <div style={{ width: "20%" }} /> */}
                  <div style={{ fontWeight: '700', fontSize: 22 }}>
                    Delete Stage
                  </div>
                  <div
                    style={{
                      direction: 'row',
                      display: 'flex',
                      justifyContent: 'end',
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowDelStageModal(false)
                        handleCloseStagePopover()
                      }}
                      className="outline-none"
                    >
                      <Image
                        src={'/assets/crossIcon.png'}
                        height={40}
                        width={40}
                        alt="*"
                      />
                    </button>
                  </div>
                </div>

                {(() => {
                  // Check actual lead count instead of relying on cached hasLeads
                  // This handles the case where a lead was deleted but hasLeads wasn't updated
                  const actualLeadCount = LeadsList?.filter(
                    (lead) => lead.lead?.stage === selectedStage?.id
                  ).length
                  // Prioritize actual count - if we have LeadsList data, use actual count only
                  // Only fall back to cached hasLeads if LeadsList is empty (not loaded yet)
                  const stageHasLeads = LeadsList.length > 0
                    ? actualLeadCount > 0
                    : (selectedStage?.hasLeads || false)
                  return stageHasLeads
                })() ? (
                  <div>
                    <div
                      className="max-h-[60vh] overflow-auto"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      <div
                        className="mt-6"
                        style={{
                          fontWeight: '500',
                          fontSize: 15,
                        }}
                      >
                        This stage has leads associated with it. Move this lead
                        to another stage before deleting.
                      </div>

                      <div
                        className="mt-6"
                        style={{
                          fontWeight: '700',
                          fontSize: 15,
                        }}
                      >
                        Move to
                      </div>

                      <FormControl fullWidth>
                        <Select
                          id="demo-simple-select"
                          value={assignNextStage || ''} // Default to empty string when no value is selected
                          onChange={handleChangeNextStage}
                          displayEmpty // Enables placeholder
                          renderValue={(selected) => {
                            if (!selected) {
                              return (
                                <div style={{ color: '#aaa' }}>
                                  Select Stage
                                </div>
                              ) // Placeholder style
                            }
                            return selected
                          }}
                          sx={{
                            border: '1px solid #00000020', // Default border
                            '&:hover': {
                              border: '1px solid #00000020', // Same border on hover
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none', // Remove the default outline
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: 'none', // Remove outline on focus
                            },
                            '&.MuiSelect-select': {
                              py: 0, // Optional padding adjustments
                            },
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: '30vh', // Limit dropdown height
                                overflow: 'auto', // Enable scrolling in dropdown
                                scrollbarWidth: 'none',
                              },
                            },
                          }}
                        >
                          {StagesList?.map((stage, index) => {
                            return (
                              <MenuItem
                                key={index}
                                value={stage.stageTitle}
                                disabled={stage.id === selectedStage?.id}
                              >
                                {stage.stageTitle}
                              </MenuItem>
                            )
                          })}
                        </Select>
                      </FormControl>
                    </div>

                    {delStageLoader2 ? (
                      <div className="flex flex-row iems-center justify-center w-full mt-10">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <button
                        className="mt-10 outline-none bg-purple"
                        disabled={!assignNextStage}
                        style={{
                          color: 'white',
                          height: '50px',
                          borderRadius: '10px',
                          width: '100%',
                          backgroundColor: !assignNextStage && '#00000020',
                          color: !assignNextStage ? '#000000' : '#fff',
                          fontWeight: 600,
                          fontSize: '20',
                        }}
                        onClick={(e) => {
                          handleDeleteStage('del2')
                        }}
                      >
                        Delete
                      </button>
                    )}

                    {delStageLoader ? (
                      <div className="flex flex-row iems-center justify-center w-full mt-4">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <div className="flex flex-row iems-center justify-center w-full">
                        <button
                          className="mt-2 outline-none"
                          style={{
                            color: '#00000080',
                            fontWeight: '500',
                            fontSize: 15,
                            borderBottom: '1px solid #00000080',
                          }}
                          onClick={(e) => {
                            handleDeleteStage('del')
                          }}
                        >
                          Delete and remove leads from pipeline
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div
                      className="mt-6"
                      style={{
                        fontWeight: '500',
                        fontSize: 15,
                      }}
                    >
                      Confirm you want to delete this stage.This action is
                      irreversible.
                    </div>
                    <div className="flex flex-row items-center w-full mt-8">
                      <div
                        className="w-1/2 text-center"
                        onClick={() => {
                          setShowDelStageModal(false)
                          handleCloseStagePopover()
                        }}
                      >
                        Cancel
                      </div>
                      {delStageLoader ? (
                        <div className="flex flex-row iems-center justify-center w-1/2">
                          <CircularProgress size={25} />
                        </div>
                      ) : (
                        <button
                          className="bg-red text-white w-1/2 h-[44px] rounded-[10px]"
                          onClick={(e) => {
                            handleDeleteStage('del')
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Box>
          </Modal>
          {/* Modal to rename the pipeline */}
          <Modal
            open={showRenamePipelinePopup}
            onClose={() => {
              setShowRenamePipelinePopup(false)
              handlePipelineClosePopover()
              handleCloseOtherPipeline();
            }}
            BackdropProps={{
              timeout: 100,
              sx: {
                backgroundColor: '#00000020',
                // //backdropFilter: "blur(20px)",
              },
            }}
          >
            <Box
              className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
              sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
            >
              <div style={{ width: '100%' }}>
                <div
                  className="max-h-[60vh] overflow-auto"
                  style={{ scrollbarWidth: 'none' }}
                >
                  <div
                    style={{
                      width: '100%',
                      direction: 'row',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {/* <div style={{ width: "20%" }} /> */}
                    <div style={{ fontWeight: '700', fontSize: 22 }}>
                      Rename pipeline
                    </div>
                    <div
                      style={{
                        direction: 'row',
                        display: 'flex',
                        justifyContent: 'end',
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowRenamePipelinePopup(false)
                          handlePipelineClosePopover()
                          handleCloseOtherPipeline();
                        }}
                        className="outline-none"
                      >
                        <Image
                          src={'/assets/crossIcon.png'}
                          height={40}
                          width={40}
                          alt="*"
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div
                      className="mt-4"
                      style={{
                        fontWeight: '600',
                        fontSize: 12,
                        paddingBottom: 5,
                      }}
                    >
                      Pipeline Title
                    </div>
                    <input
                      value={renamePipeline}
                      onChange={(e) => {
                        setRenamePipeline(e.target.value)
                      }}
                      placeholder="Enter stage title"
                      className="outline-none bg-transparent w-full border-none focus:outline-none focus:ring-0 rounded-lg h-[50px]"
                      style={{ border: '1px solid #00000020' }}
                    />
                  </div>
                </div>

                {renamePipelineLoader ? (
                  <div className="flex flex-row iems-center justify-center w-full mt-4">
                    <CircularProgress size={25} />
                  </div>
                ) : (
                  <button
                    className="mt-4 outline-none"
                    style={{
                      backgroundColor: '#7902DF',
                      color: 'white',
                      height: '50px',
                      borderRadius: '10px',
                      width: '100%',
                      fontWeight: 600,
                      fontSize: '20',
                    }}
                    onClick={handleRenamePipeline}
                  >
                    Update
                  </button>
                )}
              </div>
            </Box>
          </Modal>
          {/* Code for creating new pipeline */}
          <Modal
            open={createPipeline}
            onClose={() => {
              setCreatePipeline(false)
              handleCloseOtherPipeline();
              handlePipelineClosePopover()
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 250,
              sx: {
                backgroundColor: '#00000099',
                // ////backdropFilter: "blur(5px)",
              },
            }}
          >
            <Box
              className="lg:w-5/12 sm:w-7/12 w-8/12"
              sx={{
                ...styles.modalsStyle,
                '@keyframes addPipelineModalEntry': {
                  from: { transform: 'scale(0.95) translateY(-55%)', opacity: 0 },
                  to: { transform: 'scale(1) translateY(-55%)', opacity: 1 },
                },
                animation: 'addPipelineModalEntry 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              <div className="flex flex-row justify-center w-auto min-w-0">
                <div
                  className="w-[400px] flex flex-col gap-3 p-0 overflow-hidden"
                  style={{
                    backgroundColor: '#ffffff',
                    ...styles.mediumElevation,
                    boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  <div className="flex flex-row justify-between h-auto py-3 px-4 w-full border-b" style={{ borderColor: '#eaeaea', borderWidth: '1px' }}>
                    <div className="text-lg font-semibold" style={{ fontSize: 18, fontWeight: 600 }}>
                      Add Pipeline
                    </div>
                    <button
                      onClick={() => {
                        setCreatePipeline(false)
                        handlePipelineClosePopover()
                        handleCloseOtherPipeline();
                      }}
                    >
                      <Image
                        src={'/assets/cross.png'}
                        height={14}
                        width={14}
                        alt="*"
                      />
                    </button>
                  </div>
                  <div className="w-full flex flex-col gap-2 px-4 py-3">
                    <div
                      className="w-full"
                      style={{ fontWeight: '500', fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
                    >
                      Pipeline Name
                    </div>

                    <input
                      value={newPipelineTitle}
                      onChange={(e) => {
                        setNewPipelineTitle(e.target.value)
                      }}
                      className="outline-none rounded-[8px] focus:border focus:border-brand-primary w-full mt-4 h-[40px] px-3"
                      placeholder="Type Here"
                      style={{
                        border: '1px solid #00000020',
                        fontWeight: '500',
                        fontSize: 14,
                      }}
                    />

                    {/* <div style={{ fontWeight: "500", fontSize: 12, marginTop: 10, color: "#00000060" }}>
                                    Stage
                                </div>

                                <div className='flex flex-wrap gap-4 mt-4 items-center'>
                                    {StagesList.map((stage, index) => (
                                        <div key={index} className="flex flex-col items-start h-full">
                                            <button className='px-6 rounded-[15px] h-[40px] flex flex-row items-center outline-none'
                                                onClick={() => {
                                                    setNewPipelineStage(stage.stageTitle);
                                                }}
                                                style={{
                                                    border: "1px solid #15151520",
                                                    backgroundColor: newPipelineStage === stage.stageTitle ? "#7902DF" : "",
                                                    color: newPipelineStage === stage.stageTitle ? "white" : "",
                                                    fontSize: 15, fontWeight: "500"
                                                }}
                                            >
                                                {stage.stageTitle}
                                            </button>
                                        </div>
                                    ))}
                                    <button className='px-4 rounded-[15px] h-[40px] flex flex-row items-center'
                                        style={{
                                            border: "1px solid #15151520"
                                        }}>
                                        <Plus size={25} weight='bold' />
                                    </button>
                                </div> */}

                    </div>
                  <div className="py-4 px-4 w-full">
                    {addPipelineLoader ? (
                      <div className="w-full flex flex-row justify-center">
                        <CircularProgress size={30} />
                      </div>
                    ) : (
                      <button
                        className="w-full h-[40px] rounded-xl bg-brand-primary text-white px-3 active:scale-[0.98] transition-transform"
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                          boxShadow: '0 2px 8px rgba(121, 2, 223, 0.1)',
                        }}
                        onClick={() => {
                          handleCreatePipeline()
                        }}
                      >
                        Create Pipeline
                      </button>
                    )}
                  </div>

                  {/* Can be use full to add shadow */}
                  {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                </div>
              </div>
            </Box>
          </Modal>
          {/* Code for rearranging stages */}
          <Modal
            open={showStagesPopup}
            onClose={() => {
              setShowStagesPopup(false)
              setShowReorderBtn(false)
              handleCloseStagePopover()
            }}
            closeAfterTransition
            BackdropProps={{
              timeout: 1000,
              sx: {
                backgroundColor: '#00000020',
                // ////backdropFilter: "blur(5px)",
              },
            }}
          >
            <Box
              className="lg:w-6/12 sm:w-8/12 w-10/12"
              sx={{
                height: 'auto',
                bgcolor: 'transparent',
                p: 2,
                mx: 'auto',
                my: '50vh',
                transform: 'translateY(-50%)',
                borderRadius: 2,
                border: 'none',
                outline: 'none',
              }}
            >
              <div className="flex flex-row justify-center w-full h-[100%]">
                <div
                  className="w-full h-[100%]"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: 20,
                    borderRadius: '13px',
                    maxHeight: '90svh',
                  }}
                >
                  <div className="flex flex-row justify-between h-[10%] w-full">
                    <div style={{ fontWeight: '600', fontSize: 22 }}>
                      Rearrange Stages
                    </div>
                    <CloseBtn
                      onClick={() => {
                        setShowStagesPopup(false)
                        handleCloseStagePopover()
                        setShowReorderBtn(false)
                      }}
                    />
                  </div>

                  <div
                    className="w-full h-[80%] overflow-auto"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    <RearrangeStages
                      // stages={StagesList}
                      // onUpdateOrder={(stages) => {
                      //     setStagesList(stages);
                      // }}
                      stages={StagesList}
                      onUpdateOrder={(stages) => {
                        setStagesList(stages)
                      }}
                      // assignedLeads={assignedLeads}
                      // handleUnAssignNewStage={handleUnAssignNewStage}
                      // assignNewStage={assignNewStage}
                      // handleInputChange={handleInputChange}
                      // rowsByIndex={rowsByIndex}
                      // removeRow={removeRow}
                      // addRow={addRow}
                      nextStage={nextStage}
                      handleSelectNextChange={handleSelectNextChange}
                      selectedPipelineStages={StagesList}
                      selectedPipelineItem={SelectedPipeline}
                      handleReorderStages={handleReorder}
                      reorderStageLoader={reorderStageLoader}
                      setShowReorderBtn={setShowReorderBtn}
                    />
                  </div>

                  <div className="w-full h-[10%]">
                    {reorderStageLoader ? (
                      <div className="w-full flex flex-row items-center h-[50px] justify-center mt-6">
                        <CircularProgress size={25} />
                      </div>
                    ) : (
                      <div>
                        <button
                          disabled={!showReorderBtn}
                          className="w-full bg-brand-primary text-white mt-6 h-[50px] rounded-xl text-xl font-[500]"
                          onClick={() => {
                            handleReorder()
                          }}
                          style={{
                            color: !showReorderBtn ? '#000000' : '',
                            backgroundColor: !showReorderBtn ? '#00000020' : '',
                          }}
                        >
                          Reorder
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Can be use full to add shadow */}
                  {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                </div>
              </div>
            </Box>
          </Modal>

          <UpgradeModal
            open={showUpgradeModal}
            handleClose={() => {
              setShowUpgradeModal(false)
            }}
            title={"You've Hit Your pipeline Limit"}
            subTitle={'Upgrade to add more pipelines'}
            buttonTitle={'No Thanks'}
            functionality="pipeline"
          />
          {/* Modal for lead details */}
          {showDetailsModal && (
            <LeadDetails
              selectedLead={selectedLeadsDetails?.id}
              initialLeadData={selectedLeadsDetails} // Pass initial lead data to preserve teamsAssigned
              pipelineId={pipelineId && pipelineId}
              showDetailsModal={showDetailsModal}
              setShowDetailsModal={setShowDetailsModal}
              isPipeline={true}
              handleDelLead={handleDelLead}
              leadStageUpdated={HandleUpdateStage}
              leadAssignedTeam={HandleLeadAssignedTeam}
              selectedUser={user}
            />
          )}
          {/* Modal for audio play */}
          <Modal
            open={showAudioPlay}
            onClose={() => setShowAudioPlay(null)}
            closeAfterTransition
            BackdropProps={{
              sx: {
                backgroundColor: '#00000020',
                ////backdropFilter: "blur(5px)",
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
                    className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
                    onClick={() => {
                      setShowAudioPlay(null)
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
          {/* Warning Modal for no voice */}
          <Modal
            open={showNoAudioPlay}
            onClose={() => setShowNoAudioPlay(false)}
            closeAfterTransition
            BackdropProps={{
              sx: {
                backgroundColor: '#00000020',
                ////backdropFilter: "blur(5px)",
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
          {/* Modal to add notes */}
          <Modal
            open={showAddNotes}
            onClose={() => setShowAddNotes(false)}
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
              className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 max-h-[70vh]"
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
                        className="bg-purple h-[50px] rounded-xl text-white rounded-xl w-6/12"
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
          {/* Filter Modal for Team Members */}
          <Modal
            open={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            closeAfterTransition
            BackdropProps={{
              timeout: 1000,
              sx: {
                backgroundColor: '#00000020',
              },
            }}
          >
            <Box
              className="sm:w-5/12 lg:w-5/12 xl:w-4/12 w-8/12 max-h-[70vh] rounded-[13px]"
              sx={{
                height: 'auto',
                bgcolor: 'transparent',
                p: 0,
                mx: 'auto',
                my: '50vh',
                transform: 'translateY(-55%)',
                borderRadius: '13px',
                border: 'none',
                outline: 'none',
                scrollbarWidth: 'none',
                overflow: 'hidden',
              }}
            >
              <div className="flex flex-col w-full">
                <div
                  className="w-full rounded-[13px] overflow-hidden"
                  style={{
                    backgroundColor: '#ffffff',
                    padding: 20,
                    paddingInline: 30,
                    borderRadius: '13px',
                  }}
                >
                  <div className="flex flex-row items-center justify-between mb-4">
                    <div style={{ fontWeight: '700', fontSize: 22 }}>
                      Filter
                    </div>
                    <CloseBtn onClick={() => setShowFilterModal(false)} />
                  </div>

                  <div
                    className="mt-4"
                    style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      border: '1px solid #00000020',
                      borderRadius: '13px',
                      padding: '10px',
                    }}
                  >
                    {filterTeamMembers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No team members available
                      </div>
                    ) : (
                      filterTeamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex flex-row items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                          onClick={() => handleTeamMemberFilterToggle(member.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeamMemberIds.includes(member.id)}
                            onChange={() => handleTeamMemberFilterToggle(member.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <div className="flex flex-col flex-1">
                            <span className="font-medium text-gray-900">
                              {member.name}
                            </span>
                            {member.email && (
                              <span className="text-sm text-gray-500">
                                {member.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="w-full mt-4">
                    <button
                      onClick={handleApplyFilter}
                      className="bg-purple h-[50px] rounded-xl text-white w-full"
                      style={{
                        fontWeight: '600',
                        fontSize: 16,
                      }}
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              </div>
            </Box>
          </Modal>
          {/* Code for side view */}
          {importantCalls?.length > 0 && (
            <div
              className={`flex items-center gap-4 p-4 bg-white shadow-lg transition-all h-20 duration-300 ease-in-out ${expandSideView ? 'w-[506px]' : 'w-[100px]'
                }`} //${expandSideView ? 'w-[32vw]' : 'w-[7vw]'}
              style={{
                borderTopLeftRadius: expandSideView ? '0' : '40px',
                borderBottomLeftRadius: expandSideView ? '0' : '40px',
                // alignSelf: 'flex-end',
                position: 'absolute',
                // transform: expandSideView ? "translateX(0)" : "translateX(100%)",
                bottom: 100,
                right: 0,
              }}
              onClick={() => { }}
            >
              {expandSideView ? (
                <div className="flex  items-center justify-center w-full">
                  <div className="w-11/12 flex flex-col items-start gap-1  h-20 ">
                    <div className="flex flex-row gap-2 w-full">
                      <button
                        className="flex flex-col items-center justify-center gap-1"
                        onClick={() => {
                          setOpenCallWorthyPopup(true)
                        }}
                      >
                        <img
                          src="/svgIcons/fireIcon.png"
                          style={{ height: 25, width: 25 }}
                          alt="Fire Icon"
                        />
                        <img
                          src="/svgIcons/threeDots.svg"
                          style={{ height: 5, width: 15 }}
                          alt="Three Dots"
                        />
                      </button>

                      <div className="flex  items-center justify-start w-full">
                        <button
                          onClick={() => {
                            // setOpenCallWorthyPopup(true);
                          }}
                          className="flex flex-col items-start  truncate"
                        >
                          <div className="text-[17px] font-[600]">
                            While you were away
                          </div>
                        </button>
                        <div className="flex flex-col items-start ml-[30px] border border-brand-primary rounded">
                          <button
                            className="text-brand-primary  px-2"
                            onClick={() => {
                              // setExpandSideView(false);
                              setOpenCallWorthyPopup(true)
                            }}
                          >
                            Listen Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-[15px] font-[500] pl-8 truncate">
                      Here are some calls that sounded important.
                    </div>
                  </div>
                  <div className="flex flex-col items-center -mt-2 -ml-2">
                    <button
                      className="text-purple"
                      onClick={() => {
                        setExpandSideView(false)
                      }}
                    >
                      <img
                        src="/svgIcons/cross.svg"
                        style={{ height: 24, width: 24 }}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full flex flex-row gap-4 items-center cursor-pointer h-20"
                  onClick={() => setExpandSideView(!expandSideView)}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <img
                      src="/svgIcons/fireIcon.png"
                      style={{ height: 25, width: 25 }}
                      alt="Fire Icon"
                    />
                    <img
                      src="/svgIcons/threeDots.svg"
                      style={{ height: 5, width: 15 }}
                      alt="Three Dots"
                    />
                  </div>
                  <img
                    src="/svgIcons/leftArrowIcon.svg"
                    style={{ height: 24, width: 24 }}
                    alt="Three Dots"
                  />
                </div>
              )}
            </div>
          )}
          {/* Code for calll worthy modal */}
          {openCallWorthyPopup && (
            <CallWorthyReviewsPopup
              open={openCallWorthyPopup}
              close={() => {
                setOpenCallWorthyPopup(false)
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default Pipeline1
