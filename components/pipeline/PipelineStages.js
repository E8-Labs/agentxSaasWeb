import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  FormControl,
  Menu,
  MenuItem,
  Modal,
  Popover,
  Select,
  Snackbar,
  Tooltip,
} from '@mui/material'
import { CaretDown, CaretUp, Minus, PencilSimple } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'

import CloseBtn, { CloseBtn2 } from '@/components/globalExtras/CloseBtn'
import { PersistanceKeys } from '@/constants/Constants'
import { useUser } from '@/hooks/redux-hooks'
import { getAgentsListImage } from '@/utilities/agentUtilities'

import Apis from '../apis/Apis'
import { UpgradeTagWithModal, UpgradeTag, getUserLocalData } from '../constants/constants'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import TagsInput from '../dashboard/leads/TagsInput'
import ColorPicker from '../dashboardPipeline/ColorPicker'
import { getAvailabePhoneNumbers } from '../globalExtras/GetAvailableNumbers'
import { getTeamsList } from '../onboarding/services/apisServices/ApiService'
import AuthSelectionPopup from './AuthSelectionPopup'
import NewMessageModal from '../messaging/NewMessageModal'
import {
  getA2PNumbers,
  getGmailAccounts,
  getTempletes,
  createTemplete,
  updateTemplete,
  getTempleteDetails,
} from './TempleteServices'

const PipelineStages = ({
  stages,
  onUpdateOrder,
  assignedLeads,
  handleUnAssignNewStage,
  assignNewStage,
  handleInputChange,
  rowsByIndex,
  removeRow,
  addRow,
  updateRow,
  nextStage,
  handleSelectNextChange,
  selectedPipelineStages,
  selectedPipelineItem,
  setShowRearrangeErr,
  setIsVisibleSnack,
  setSnackType,
  onNewStageCreated,
  handleReOrder,
}) => {
  const [showSampleTip, setShowSampleTip] = useState(false)

  //VIP variable for checking if agent is ononNewStageCreatedly inbound
  const [isInboundAgent, setIsInboundAgent] = useState(false)

  const [pipelineStages, setPipelineStages] = useState(stages)
  const [delStageLoader, setDelStageLoader] = useState(false)
  const [delStageLoader2, setDelStageLoader2] = useState(false)
  const [successSnack, setSuccessSnack] = useState(null)
  const [errorSnack, setErrorSnack] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  //code for stages list
  const [stagesList, setStagesList] = useState([])
  //code for deleting stage
  const [showDelStagePopup, setShowDelStagePopup] = useState(null)
  const [actionInfoEl, setActionInfoEl] = React.useState(null)
  const [actionInfoEl2, setActionInfoEl2] = React.useState(null)
  //code for dropdown stages when delstage
  const [assignNextStage, setAssignNextStage] = useState('')
  const [assignNextStageId, setAssignNextStageId] = useState('')
  //variable for tags input
  const [tagsValue, setTagsValue] = useState([])

  //code for rename stage popup
  const [showRenamePopup, setShowRenamePopup] = useState(false)
  const [renameStage, setRenameStage] = useState('')
  const [renameStageLoader, setRenameStageLoader] = useState(false)
  const [updateStageColor, setUpdateStageColor] = useState('')
  const [selectedStage, setSelectedStage] = useState('')

  //code to add new stage
  const [addNewStageModal, setAddNewStageModal] = useState(false)
  const [newStageTitle, setNewStageTitle] = useState('')
  const [stageColor, setStageColor] = useState('#000')
  const [addStageLoader, setAddStageLoader] = useState(false)
  //code for advance setting modal inside new stages
  const [showAdvanceSettings, setShowAdvanceSettings] = useState(false)

  const [showAuthSelectionPopup, setShowAuthSelectionPopup] = useState(false)

  //code for input arrays
  const [inputs, setInputs] = useState([
    {
      id: 1,
      value: '',
      placeholder: `Sure, i’d be interested in knowing what my home is worth`,
    },
    { id: 2, value: '', placeholder: 'Yeah, how much is my home worth today?' },
    { id: 3, value: '', placeholder: 'Yeah, how much is my home worth today?' },
  ])
  const [action, setAction] = useState('')

  //variable to show and hide the add stage btn
  const [showAddStageBtn, setShowAddStageBtn] = useState(false)

  //get my teams list
  const [myTeamList, setMyTeamList] = useState([])
  const [myTeamAdmin, setMyTeamAdmin] = useState([])
  const [assignToMember, setAssignToMember] = useState('')
  const [assignLeadToMember, setAssignLeadToMember] = useState([])

  //templetes variables
  const [templates, setTempletes] = useState([])
  const [tempLoader, setTempLoader] = useState(null)

  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageModalMode, setMessageModalMode] = useState('sms') // 'sms' or 'email'

  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [selectedType, setSelectedType] = useState(null)

  const [selectedIndex, setSelectedIndex] = useState(null)

  // Edit functionality variables
  const [isEditing, setIsEditing] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [editingStageIndex, setEditingStageIndex] = useState(null)

  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null)

  // Use Redux for user data instead of local state
  const { user: reduxUser, setUser: setReduxUser, token } = useUser()
  const [user, setUser] = useState(reduxUser) // Keep local state for compatibility
  const [userData, setUserData] = useState(reduxUser) // Alias for compatibility
  const [gmailAccounts, setGmailAccounts] = useState([])
  const [accountLoader, setAccountLoader] = useState(false)

  const [targetUser, setTargetUser] = useState(null)

  useEffect(() => {
    const getTargetUser = () =>{
      let data = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
      if (data) {
        let user = JSON.parse(data)
        setTargetUser(user.subAccountData)
      }
    }
    getTargetUser()
  }, [userData])

  const ACTIONS = [
    {
      value: 'email',
      label: 'Email',
      icon: '/otherAssets/@Icon.png',
      focusedIcon: '/otherAssets/blue@Icon.png',
    },
    {
      value: 'call',
      label: 'Call',
      icon: '/otherAssets/callIcon.png',
      focusedIcon: '/otherAssets/blueCallIcon.png',
    },
    {
      value: 'sms',
      label: 'Text',
      icon: '/otherAssets/smsIcon.png',
      focusedIcon: '/otherAssets/blueSmsIcon.png',
    },
  ]


  // Check email capability based on user type
  const checkEmailCapability = () => {
    // For AgentX users (not subaccounts)
    if (!reduxUser?.userRole || reduxUser.userRole !== 'AgencySubAccount') {
      // Check planCapabilities.allowEmails
      return {
        hasAccess: reduxUser?.planCapabilities?.allowEmails === true,
        showUpgrade: reduxUser?.planCapabilities?.allowEmails !== true,
        showRequestFeature: false,
      }
    }
    
    // For subaccounts
    // First check if parent agency has access
    const agencyHasAccess = reduxUser?.agencyCapabilities?.allowEmails === true
    
    if (!agencyHasAccess) {
      // Agency doesn't have access - show Request Feature
      return {
        hasAccess: false,
        showUpgrade: false,
        showRequestFeature: true,
      }
    }
    
    // Agency has access, check subaccount access
    const subaccountHasAccess = reduxUser?.planCapabilities?.allowEmails === true
    
    return {
      hasAccess: subaccountHasAccess,
      showUpgrade: !subaccountHasAccess,
      showRequestFeature: false,
    }
  }

  // Check SMS capability based on user type
  const checkSMSCapability = () => {
    // For AgentX users (not subaccounts)
    if (!reduxUser?.userRole || reduxUser.userRole !== 'AgencySubAccount') {
      // Check planCapabilities.allowTextMessages
      return {
        hasAccess: reduxUser?.planCapabilities?.allowTextMessages === true,
        showUpgrade: reduxUser?.planCapabilities?.allowTextMessages !== true,
        showRequestFeature: false,
      }
    }
    
    // For subaccounts
    // First check if parent agency has access
    const agencyHasAccess = reduxUser?.agencyCapabilities?.allowTextMessages === true
    
    if (!agencyHasAccess) {
      // Agency doesn't have access - show Request Feature
      return {
        hasAccess: false,
        showUpgrade: false,
        showRequestFeature: true,
      }
    }
    
    // Agency has access, check subaccount access
    const subaccountHasAccess = reduxUser?.planCapabilities?.allowTextMessages === true
    
    return {
      hasAccess: subaccountHasAccess,
      showUpgrade: !subaccountHasAccess,
      showRequestFeature: false,
    }
  }

  const emailCapability = checkEmailCapability()
  const smsCapability = checkSMSCapability()

  // State to trigger upgrade modal externally (use counter to ensure it triggers even if already true)
  const [triggerEmailUpgradeModal, setTriggerEmailUpgradeModal] = useState(0)
  const [triggerSMSUpgradeModal, setTriggerSMSUpgradeModal] = useState(0)

  // Handler to trigger email upgrade modal
  const handleEmailUpgradeClick = useCallback((e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setTriggerEmailUpgradeModal(prev => prev + 1)
  }, [])

  // Handler to trigger SMS upgrade modal
  const handleSMSUpgradeClick = useCallback((e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setTriggerSMSUpgradeModal(prev => prev + 1)
  }, [])

  // Handler to reset email upgrade modal trigger
  const handleEmailUpgradeModalClose = useCallback(() => {
    setTriggerEmailUpgradeModal(0)
  }, [])

  // Handler to reset SMS upgrade modal trigger
  const handleSMSUpgradeModalClose = useCallback(() => {
    setTriggerSMSUpgradeModal(0)
  }, [])

  const actionLabel = (v) =>
    ACTIONS.find((a) => a.value === v)?.label || 'Make Call'

  // one menu anchor per stage row-set
  const [addMenuAnchor, setAddMenuAnchor] = useState({}) // { [stageIndex]: HTMLElement|null }

  const openAddMenu = useCallback((stageIndex, e) => {
    if (e && e.currentTarget) {
      // Capture the target immediately to avoid React's synthetic event pooling
      const target = e.currentTarget
      // Use flushSync to ensure immediate state update so menu appears right away
      flushSync(() => {
        setAddMenuAnchor((prev) => ({ ...prev, [stageIndex]: target }))
      })
    }
  }, [])

  const closeAddMenu = useCallback((stageIndex) => {
    localStorage.removeItem(PersistanceKeys.isDefaultCadenceEditing)
    setAddMenuAnchor((prev) => ({ ...prev, [stageIndex]: null }))
    setIsEditing(false)
    setEditingRow(null)
    setEditingStageIndex(null)
    setSelectedType(null)
    setSelectedIndex(null)
  }, [])

  const handleSelectAdd = async (stageIndex, value) => {
    if (value === 'email') {
      if (!emailCapability.hasAccess) {
        // Trigger upgrade modal if user doesn't have access
        handleEmailUpgradeClick()
        return
      }
    } else if (value === 'sms') {
      if (!smsCapability.hasAccess) {
        // Trigger upgrade modal if user doesn't have access
        handleSMSUpgradeClick()
        return
      }
      if (phoneNumbers.length === 0) {
        // User needs to complete A2P to text
        return
      }
    }
    
    if (value != 'call') {
      setSelectedIndex(stageIndex)
      setSelectedType(value)
      if (value === 'email') {
        if (gmailAccounts.length > 0) {
          setMessageModalMode('email')
          setShowMessageModal(true)
        } else {
          setShowAuthSelectionPopup(true)
        }
      } else {
        setMessageModalMode('sms')
        setShowMessageModal(true)
      }
    } else {
      if (isEditing) {
        closeAddMenu(stageIndex)
      } else {
        addRow(stageIndex, value)
        closeAddMenu(stageIndex)
      }
    }
    // closeAddMenu(stageIndex);
  }

  const handleEditRow = useCallback((stageIndex, row, e) => {
    // Capture event target immediately to avoid React's synthetic event pooling
    const eventTarget = e?.currentTarget || null
    
    // Check if this is a default cadence
    const isDefaultCadence = !row.communicationType

    if (isDefaultCadence) {
      localStorage.setItem(
        PersistanceKeys.isDefaultCadenceEditing,
        JSON.stringify({ isdefault: true }),
      )
      if (eventTarget) {
        // Create a synthetic event-like object with the captured target
        const syntheticEvent = { currentTarget: eventTarget }
        openAddMenu(stageIndex, syntheticEvent)
      }
      return // Don't proceed with editing for default cadence
    }

    // For 'call' type, open menu first before other state updates to ensure it appears immediately
    if (row.communicationType === 'call' && eventTarget) {
      const syntheticEvent = { currentTarget: eventTarget }
      openAddMenu(stageIndex, syntheticEvent)
      // Then set editing state
      setIsEditing(true)
      setEditingRow(row)
      setEditingStageIndex(stageIndex)
      setSelectedType(row.action ? row.action : 'call')
      setSelectedIndex(stageIndex)
      return
    }

    // For email and SMS, set state first then show modal
    setIsEditing(true)
    setEditingRow(row)
    setEditingStageIndex(stageIndex)
    setSelectedType(row.action ? row.action : 'call')
    setSelectedIndex(stageIndex)

    if (row.communicationType === 'email') {
      setMessageModalMode('email')
      setShowMessageModal(true)
    } else if (row.communicationType === 'sms') {
      setMessageModalMode('sms')
      setShowMessageModal(true)
    }
  }, [openAddMenu])

  const handleUpdateRow = (rowId, updatedData) => {
    // Update the specific row in the pipeline using the updateRow prop

    if (editingStageIndex !== null && updateRow) {
      updateRow(editingStageIndex, rowId, updatedData)
    }

    // Reset editing state
    setIsEditing(false)
    setEditingRow(null)
    setEditingStageIndex(null)
  }

  useEffect(() => {
    // Use Redux reduxUser instead of localStorage
    if (reduxUser) {
      setUser(reduxUser)
      setUserData(reduxUser)
    } else {
      // Fallback to localStorage only if Redux has no data
      let data = getUserLocalData()
      setUser(data.user)
      setUserData(data.user)
    }

    getMyTeam()
    getNumbers()
  }, [stages, reduxUser])

  useEffect(() => {
    if (showMessageModal && messageModalMode === 'email') {
      getTemp()
    }
  }, [showMessageModal, messageModalMode])

  useEffect(() => {
    getAccounts()
  }, [])

  const getAccounts = async () => {
    setAccountLoader(true)
    let response = await getGmailAccounts()
    if (response) {
      setGmailAccounts(response)
    }
    setAccountLoader(false)
  }

  const getTemp = async () => {
    // setTempLoader(selectedType)
    let temp = await getTempletes(selectedType)
    setTempletes(temp)
    // setTempLoader(null)
    // setShowEmailTempPopup(true)
  }

  const getNumbers = async () => {
    let data = localStorage.getItem('selectedUser')
    if (!data) {
      data = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
    }
    let selectedUser = null
    // console.log('data', data)
    if (data != 'undefined') {
      selectedUser = JSON.parse(data)
    }
    setPhoneLoading(true)
    let id = selectedUser?.id
    let num = await getA2PNumbers(id)
    if (num) {
      setPhoneNumbers(num)
    }
    setPhoneLoading(false)
  }

  //ading stages data
  useEffect(() => {
    if (selectedPipelineStages) {
      setStagesList(selectedPipelineStages)
    }
  }, [selectedPipelineStages])

  function canProceed() {
    if (newStageTitle.length > 0 && action.length == 0) {
      return true
    }
    if (
      action &&
      action.length > 0 &&
      newStageTitle &&
      newStageTitle.length > 0 &&
      inputs.filter((input) => input.value.trim() !== '').length === 3
    ) {
      return true
    }
    return false
  }

  const handlePopoverOpen = (event) => {
    setActionInfoEl(event.currentTarget)
  }

  //get my team
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

        setMyTeamList(teams)
        setMyTeamAdmin(response.admin)
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    }
  }

  //new teammeber
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

  const handlePopoverClose = () => {
    setActionInfoEl(null)
    setActionInfoEl2(null)
  }

  const open = Boolean(actionInfoEl)
  const openAction = Boolean(actionInfoEl2)

  //gets recent agent details
  useEffect(() => {
    const agentDetails = localStorage.getItem('agentDetails')
    if (agentDetails && agentDetails != 'undefined') {
      const agentData = JSON.parse(agentDetails)
      // //console.log;
      if (agentData?.agents?.length > 1) {
        // //console.log;
        setIsInboundAgent(false)
      } else {
        if (agentData?.agents?.[0]?.agentType === 'inbound') {
          setIsInboundAgent(true)
        } else {
          setIsInboundAgent(false)
        }
      }
    }
  }, [])

  useEffect(() => {
    // //console.log;
    setPipelineStages(stages)
  }, [stages])

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

      // console.log("auth token", AuthToken)

      let ApiData = {
        stageTitle: renameStage,
        stageId: selectedStage.id,
        color: updateStageColor || '',
      }

      const selectedUser = localStorage.getItem(PersistanceKeys.selectedUser)
      if (selectedUser) {
        const selectedUserData = JSON.parse(selectedUser)
        // ApiData.userId = selectedUserData.id;
      }

      const ApiPath = Apis.UpdateStage

      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        setPipelineStages(response.data.data.stages)
        setShowRenamePopup(false)
        setSuccessSnack(response.data.message)
        // handleCloseStagePopover();
      }
    } catch (error) {
      setRenameStageLoader(false)
      // //console.log;
    } finally {
      setRenameStageLoader(false)
    }
  }

  //code to close the add stage model
  const handleCloseAddStage = () => {
    setAddNewStageModal(false)
    setNewStageTitle('')
    setInputs([
      { id: 1, value: '' },
      { id: 2, value: '' },
      { id: 3, value: '' },
    ])
  }

  //code for drag and drop stages
  const handleOnDragEnd = (result) => {
    // //console.log;
    const { source, destination } = result
    // //console.log;
    // if (!destination) return;
    if (!destination || source.index === 0 || destination.index === 0) {
      setShowRearrangeErr('Cannot rearrange when stage is expanded.')
      setIsVisibleSnack(true)
      setSnackType('Error')
      // //console.log;
      return
    }

    // if (!destination || source.index === destination.index) {
    //    // //console.log
    //     return;
    // }

    // //console.log;
    const items = Array.from(pipelineStages)
    const [reorderedItem] = items.splice(source.index, 1)
    items.splice(destination.index, 0, reorderedItem)

    // //console.log;
    const updatedStages = items.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }))

    // //console.log;
    setPipelineStages(updatedStages)
    onUpdateOrder(updatedStages)
    handleReOrder()
  }

  //functions to move to stage after deleting one
  const handleChangeNextStage = (event) => {
    let value = event.target.value
    //// //console.log;
    setAssignNextStage(event.target.value)

    const selectedItem = pipelineStages.find(
      (item) => item.stageTitle === value,
    )
    setAssignNextStageId(selectedItem.id)

    // //console.log;
  }



  //code to delete stage
  const handleDeleteStage = async (value) => {
    try {
      if (value === 'del2') {
        // //console.log;
        setDelStageLoader2(true)
      } else if (value === 'del') {
        // //console.log;
        setDelStageLoader(true)
      }
      // //console.log;
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
        //// //console.log;
      }

      // //console.log;

      const ApiData = {
        // pipelineId: selectedPipelineItem.id,
        // stageId: showDelStagePopup.id
        pipelineId: selectedPipelineItem.id,
        stageId: showDelStagePopup.id,
        moveToStageId: assignNextStageId,
      }

      // //console.log;
      // return
      const ApiPath = Apis.deleteStage
      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setPipelineStages(response.data.data.stages)
          setSuccessSnack(response.data.message)
          setShowDelStagePopup(null)
          let p = localStorage.getItem('pipelinesList')

          if (p) {
            let localPipelines = JSON.parse(p)

            let updatedPipelines = localPipelines.map((pipeline) => {
              if (selectedPipelineItem.id === pipeline.id) {
                return {
                  ...pipeline,
                  stages: pipeline.stages.filter(
                    (stage) => stage.id !== showDelStagePopup.id,
                  ),
                }
              }
              return pipeline // Return unchanged pipeline for others
            })

            //console.log
            localStorage.setItem(
              'pipelinesList',
              JSON.stringify(updatedPipelines),
            )
          } else {
            //console.log
          }
          // setStageAnchorel(null);
        }
      }
    } catch (error) {
      // console.error("Error occured in delstage api is:", error);
    } finally {
      setDelStageLoader(false)
    }
  }

  //code for add stage input fields
  const handleAddStageInputsChanges = (id, value) => {
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

  //code for adding new custom stage
  const handleAddNewStageTitle = async () => {
    try {
      setAddStageLoader(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
        // //console.log;
      }

      // //console.log;

      const ApiPath = Apis.addCustomStage
      // //console.log;

      const ApiData = {
        stageTitle: newStageTitle,
        color: stageColor,
        pipelineId: selectedPipelineItem.id,
        action: action,
        examples: inputs,
        tags: tagsValue,
        teams: assignLeadToMember,
      }

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
          setPipelineStages(response.data.data.stages)
          handleCloseAddStage()
          setNewStageTitle('')
          // setStageColor("");
          setStagesList(response.data.data.stages)
          selectedPipelineItem.stages = response.data.data.stages
          onNewStageCreated(selectedPipelineItem)
        } else {
          let message = response.data.message
          setErrorMessage(message)
          setErrorSnack(true)
        }
      }
    } catch (error) {
      // console.error("Error occured inn adding new stage title api is", error);
    } finally {
      setAddStageLoader(false)
    }
  }

  const shouldDisable = (item) => {
    if (
      item.value == 'sms' &&
      (phoneNumbers.length === 0 ||
        user?.planCapabilities.allowTextMessages === false)
    ) {
      //
      return true
    } else {
      return false
    }
  }

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: '700',
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: '500',
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: '500',
      color: '#00000070',
    },
    AddNewKYCQuestionModal: {
      height: 'auto',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
    labelStyle: {
      backgroundColor: 'white',
      fontWeight: '400',
      fontSize: 10,
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
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="pipelineStages">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              maxHeight: '100vh',
              // overflowY: "auto",
              // borderRadius: "8px",
              // padding: "10px",
              border: 'none',
              scrollbarWidth: 'none',
              marginTop: 20,
              paddingBottom: '80px',
            }}
          >
            {pipelineStages.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id.toString()}
                index={index}
                isDragDisabled={index === 0}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      // border: "1px solid red",
                      borderRadius: '10px',
                      // padding: "15px",
                      marginBottom: '10px',
                      backgroundColor: '#fff',
                      // boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                    className="flex flex-row items-start"
                  >
                    <AgentSelectSnackMessage
                      isVisible={
                        successSnack == false || successSnack == null
                          ? false
                          : true
                      }
                      hide={() => setSuccessSnack(false)}
                      message={successSnack}
                      type={SnackbarTypes.Success}
                    />
                    <AgentSelectSnackMessage
                      isVisible={
                        errorSnack == false || errorSnack == null ? false : true
                      }
                      hide={() => setErrorSnack(false)}
                      message={errorMessage}
                      type={SnackbarTypes.Error}
                    />
                    <div className="w-[5%]">
                      {index > 0 && (
                        <div className="outline-none mt-2">
                          <Image
                            src={'/assets/list.png'}
                            height={6}
                            width={16}
                            alt="*"
                          />
                        </div>
                      )}
                    </div>
                    <div className="border w-[95%] rounded-xl p-3 px-4">
                      <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-row items-center gap-2">
                          <div style={styles.inputStyle}>{item.stageTitle}</div>
                          {index > 0 && (
                            <button
                              className="outline-none"
                              onClick={() => {
                                setShowRenamePopup(true)
                                setRenameStage(item.stageTitle)
                                setSelectedStage(item)
                              }}
                            >
                              <PencilSimple
                                size={16}
                                weight="regular"
                                style={{ color: 'hsl(var(--brand-primary))' }}
                              />
                            </button>
                          )}
                        </div>

                        {isInboundAgent ? (
                          <div>
                            {index > 0 && item.stageTitle !== 'Booked' && (
                              <div className="w-full flex flex-row items-center justify-end mt-2">
                                <button
                                  className="flex flex-row items-center gap-1"
                                  onClick={() => {
                                    setShowDelStagePopup(item)
                                  }}
                                >
                                  <Image
                                    src={'/assets/delIcon.png'}
                                    height={20}
                                    width={18}
                                    alt="*"
                                    style={{
                                      filter:
                                        'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)',
                                      opacity: 0.5,
                                    }}
                                  />
                                  <p
                                    className="text-[#15151580]"
                                    style={{ fontWeight: '500', fontSize: 14 }}
                                  >
                                    Delete
                                  </p>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            {assignedLeads[index] ? (
                              <div>
                                <button
                                  className="bg-[#00000020] flex flex-row items-center justify-center gap-1"
                                  style={{
                                    ...styles.inputStyle,
                                    borderRadius: '55px',
                                    height: '40px',
                                    width: '104px',
                                  }}
                                  onClick={() => handleUnAssignNewStage(index)}
                                >
                                  <Minus size={18} weight="regular" />
                                  <div>Unassign</div>
                                </button>
                              </div>
                            ) : (
                              <button
                                className="bg-brand-primary text-white flex flex-row items-center justify-center gap-2"
                                style={{
                                  ...styles.inputStyle,
                                  borderRadius: '55px',
                                  height: '38px',
                                  width: '104px',
                                }}
                                onClick={() => assignNewStage(index)}
                              >
                                <div
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    backgroundColor: '#FFFFFF',
                                    WebkitMaskImage: 'url(/assets/addIcon.png)',
                                    maskImage: 'url(/assets/addIcon.png)',
                                    WebkitMaskSize: 'contain',
                                    maskSize: 'contain',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskPosition: 'center',
                                    maskPosition: 'center',
                                  }}
                                />
                                <div>Assign</div>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div>
                        {assignedLeads[index] && (
                          <div>
                            <div
                              className="mt-4"
                              style={{ fontWeight: '500', fontSize: 12 }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: '500',
                                  color: '#00000060',
                                }}
                              >
                                {item.description}
                              </div>
                            </div>
                            <div className="border rounded-xl py-4 px-4 mt-4">
                              <div>
                                {(rowsByIndex[index] || []).map(
                                  (row, rowIndex) => {
                                    // Ensure row has referencePoint initialized
                                    // Check identifier from selectedPipelineStages (source of truth) or item as fallback
                                    const stageForCheck = selectedPipelineStages?.[index] || item
                                    const isBookingStage = stageForCheck?.identifier === 'booked'
                                    const rowWithReferencePoint = {
                                      ...row,
                                      referencePoint: row.referencePoint || (isBookingStage ? 'before_meeting' : 'regular_calls'),
                                    }
                                    
                                    return (
                                    <div
                                      key={row.id}
                                      className="flex flex-row items-center justify-center mb-2"
                                    >
                                      <div
                                        className="mt-2"
                                        style={styles.headingStyle}
                                      >
                                        Wait
                                      </div>
                                      <div className="ms-6 flex flex-row items-center w-full justify-between">
                                        <div className="flex flex-row items-center">
                                          <div>
                                            <label
                                              className="ms-1 px-2"
                                              style={styles.labelStyle}
                                            >
                                              Days
                                            </label>
                                            <input
                                              className="flex flex-row items-center justify-center text-center outline-none focus:ring-0"
                                              style={{
                                                ...styles.inputStyle,
                                                height: '42px',
                                                width: '80px',
                                                border: '1px solid #00000020',
                                                borderTopLeftRadius: '10px',
                                                borderBottomLeftRadius: '10px',
                                              }}
                                              placeholder="Days"
                                              value={row.waitTimeDays}
                                              onChange={(e) =>
                                                handleInputChange(
                                                  index,
                                                  row.id,
                                                  'waitTimeDays',
                                                  e.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                  ),
                                                )
                                              }
                                            />
                                          </div>
                                          <div>
                                            <label
                                              className="ms-1 px-2"
                                              style={styles.labelStyle}
                                            >
                                              Hours
                                            </label>
                                            <input
                                              className="flex flex-row items-center justify-center text-center outline-none focus:ring-0"
                                              style={{
                                                ...styles.inputStyle,
                                                height: '42px',
                                                width: '80px',
                                                border: '1px solid #00000020',
                                                borderRight: 'none',
                                                borderLeft: 'none',
                                              }}
                                              placeholder="Hours"
                                              value={row.waitTimeHours}
                                              onChange={(e) =>
                                                handleInputChange(
                                                  index,
                                                  row.id,
                                                  'waitTimeHours',
                                                  e.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                  ),
                                                )
                                              }
                                            />
                                          </div>
                                          <div>
                                            <label
                                              className="ms-1 px-2"
                                              style={styles.labelStyle}
                                            >
                                              Mins
                                            </label>
                                            <input
                                              className="flex flex-row items-center justify-center text-center outline-none focus:ring-0"
                                              style={{
                                                ...styles.inputStyle,
                                                height: '42px',
                                                width: '80px',
                                                border: '1px solid #00000020',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px',
                                              }}
                                              placeholder="Minutes"
                                              value={row.waitTimeMinutes}
                                              onChange={(e) =>
                                                handleInputChange(
                                                  index,
                                                  row.id,
                                                  'waitTimeMinutes',
                                                  e.target.value.replace(
                                                    /[^0-9]/g,
                                                    '',
                                                  ),
                                                )
                                              }
                                            />
                                          </div>
                                          <div
                                            className="ms-4 mt-2 flex flex-row items-center"
                                            style={styles.inputStyle}
                                          >
                                            {isBookingStage ? (
                                              <div className="flex flex-row items-center gap-2">
                                                <select
                                                  value={rowWithReferencePoint.referencePoint}
                                                  onChange={(e) =>
                                                    handleInputChange(
                                                      index,
                                                      row.id,
                                                      'referencePoint',
                                                      e.target.value,
                                                    )
                                                  }
                                                  className="outline-none border border-gray-300 rounded px-2 py-1 text-sm"
                                                  style={{
                                                    backgroundColor: 'white',
                                                    minWidth: '140px',
                                                  }}
                                                >
                                                  <option value="before_meeting">before the meeting</option>
                                                  <option value="after_booking">after booking</option>
                                                </select>
                                                , then{' '}
                                              </div>
                                            ) : (
                                              <div>, then{' '}</div>
                                            )}
                                            <div
                                              className="ml-2"
                                              style={{ fontWeight: '600' }}
                                            >
                                              <div className="flex flex-row items-cetner gap-2 p-2 rounded"
                                              style={{
                                                backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                                              }}
                                              >
                                                <div className="text-brand-primary text-[12px]">
                                                  {(row.communicationType &&
                                                    row.communicationType !=
                                                      'call') ||
                                                  (row.action &&
                                                    row.action != 'call')
                                                    ? `Send ${actionLabel(row.communicationType)}`
                                                    : `Make Call`}
                                                </div>

                                                <button
                                                  onClick={(e) => {
                                                    console.log('row clicked', row)
                                                    e.stopPropagation()
                                                    handleEditRow(index, row, e)
                                                  }}
                                                  type="button"
                                                  className="cursor-pointer"
                                                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                                >
                                                  <PencilSimple
                                                    size={16}
                                                    weight="regular"
                                                    style={{
                                                      color: 'hsl(var(--brand-primary))',
                                                    }}
                                                  />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {rowIndex > 0 && (
                                          <CloseBtn
                                            onClick={() =>
                                              removeRow(index, row.id)
                                            }
                                          />
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    openAddMenu(index, e)
                                  }}
                                  style={styles.inputStyle}
                                  className="text-brand-primary mt-4 cursor-pointer"
                                  type="button"
                                >
                                  + Add (If no answer)
                                </button>
                                <Menu
                                  anchorEl={addMenuAnchor[index] || null}
                                  open={Boolean(addMenuAnchor[index])}
                                  onClose={() => {
                                    closeAddMenu(index)
                                    localStorage.removeItem(
                                      PersistanceKeys.isDefaultCadenceEditing,
                                    )
                                  }}
                                  disableAutoFocusItem={false}
                                  MenuListProps={{
                                    'aria-labelledby': 'action-menu',
                                  }}
                                  PaperProps={{
                                    style: {
                                      boxShadow:
                                        '0px_-2px_25.600000381469727px_1px_rgba(0,0,0,0.05)', // custom purple shadow
                                      borderRadius: '12px',
                                    },
                                  }}
                                >
                                  {ACTIONS.map((a) => (
                                    <Tooltip
                                      key={a.value}
                                      title={
                                        shouldDisable(a) &&
                                        user?.planCapabilities
                                          .allowTextMessages === true
                                          ? 'You need to complete A2P to text'
                                          : ''
                                      }
                                      arrow
                                      disableHoverListener={!shouldDisable(a)}
                                      disableFocusListener={!shouldDisable(a)}
                                      disableTouchListener={!shouldDisable(a)}
                                      componentsProps={{
                                        tooltip: {
                                          sx: {
                                            backgroundColor: '#ffffff', // Ensure white background
                                            color: '#333', // Dark text color
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            padding: '10px 15px',
                                            borderRadius: '8px',
                                            boxShadow:
                                              '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
                                          },
                                        },
                                        arrow: {
                                          sx: {
                                            color: '#ffffff', // Match tooltip background
                                          },
                                        },
                                      }}
                                    >
                                      <div>
                                        <MenuItem
                                          sx={{
                                            width: 180,
                                            '&:hover .action-icon': {
                                              display: 'none',
                                            },
                                            '&:hover .action-icon-hover': {
                                              display: 'block',
                                            },
                                          }}
                                          onClick={() =>
                                            handleSelectAdd(index, a.value)
                                          }
                                        >
                                          {tempLoader === a.value ? (
                                            <CircularProgress size={20} />
                                          ) : (
                                            <div className="flex flex-row items-center justify-between w-full">
                                              <div className="flex flex-row items-center gap-3">
                                                {/* default icon */}
                                                <Image
                                                  src={a.icon}
                                                  height={20}
                                                  width={20}
                                                  alt="*"
                                                  className="action-icon"
                                                  style={{ display: 'block' }}
                                                />
                                                {/* blue (hover) icon */}
                                                <Image
                                                  src={a.focusedIcon}
                                                  height={20}
                                                  width={20}
                                                  alt="*"
                                                  className="action-icon-hover"
                                                  style={{ display: 'none' }}
                                                />

                                                <div
                                                  style={{
                                                    fontSize: 15,
                                                    fontWeight: '400',
                                                  }}
                                                >
                                                  {a.label}
                                                </div>
                                                {a.value === 'email' && (emailCapability.showUpgrade || emailCapability.showRequestFeature) && (
                                                  <UpgradeTag
                                                    onClick={handleEmailUpgradeClick}
                                                    requestFeature={emailCapability.showRequestFeature}
                                                  />
                                                )}
                                                {a.value === 'sms' && (smsCapability.showUpgrade || smsCapability.showRequestFeature) && (
                                                  <UpgradeTag
                                                    onClick={handleSMSUpgradeClick}
                                                    requestFeature={smsCapability.showRequestFeature}
                                                  />
                                                )}
                                              </div>
                                              {shouldDisable(a) &&
                                                user?.planCapabilities
                                                  .allowTextMessages != false &&
                                                a.label == 'Text' && (
                                                  <Image
                                                    src={
                                                      '/otherAssets/redInfoIcon.png'
                                                    }
                                                    height={16}
                                                    width={16}
                                                    alt="*"
                                                  />
                                                )}
                                            </div>
                                          )}
                                        </MenuItem>
                                      </div>
                                    </Tooltip>
                                  ))}
                                </Menu>
                              </div>
                              <div className="flex flex-row items-center gap-2 mt-4">
                                <div style={styles.inputStyle}>
                                  Then move to
                                </div>

                                <Box
                                  className="flex flex-row item-center justify-center"
                                  sx={{ width: '141px', py: 0, m: 0 }}
                                >
                                  <FormControl
                                    fullWidth
                                    sx={{ py: 0, my: 0, minHeight: 0 }}
                                  >
                                    <Select
                                      displayEmpty
                                      value={nextStage[index] || ''}
                                      onChange={(event) =>
                                        handleSelectNextChange(index, event)
                                      }
                                      renderValue={(selected) => {
                                        if (selected === '') {
                                          return (
                                            <div style={styles.dropdownMenu}>
                                              Select Stage
                                            </div>
                                          )
                                        }
                                        return selected
                                      }}
                                      MenuProps={{
                                        PaperProps: {
                                          sx: {
                                            '& .MuiMenuItem-root.Mui-selected': {
                                              backgroundColor: '#F5F5F5',
                                              '&:hover': {
                                                backgroundColor: '#F5F5F5',
                                              },
                                            },
                                          },
                                        },
                                      }}
                                      sx={{
                                        ...styles.dropdownMenu,
                                        backgroundColor: 'transparent',
                                        color: '#000000',
                                        border: '1px solid #00000020',
                                        py: 0,
                                        my: 0,
                                        minHeight: 0,
                                        height: '32px',
                                        '& .MuiOutlinedInput-root': {
                                          py: 0,
                                          my: 0,
                                          minHeight: 0,
                                        },
                                        '& .MuiSelect-select': {
                                          py: 0,
                                          my: 0,
                                          display: 'flex',
                                          alignItems: 'center',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          border: 'none',
                                        },
                                      }}
                                    >
                                      <MenuItem value="">Select stage</MenuItem>

                                      {stagesList.map((dropDownStateItem) => (
                                        <MenuItem
                                          disabled={
                                            dropDownStateItem.order <=
                                            item.order
                                          }
                                          key={dropDownStateItem.id}
                                          value={dropDownStateItem.stageTitle}
                                          sx={{
                                            py: 0,
                                            my: 0,
                                            minHeight: '32px',
                                            '&.Mui-selected': {
                                              backgroundColor: '#F5F5F5',
                                              '&:hover': {
                                                backgroundColor: '#F5F5F5',
                                              },
                                            },
                                          }}
                                        >
                                          {dropDownStateItem.stageTitle
                                            .slice(0, 1)
                                            .toUpperCase()}
                                          {dropDownStateItem.stageTitle.slice(
                                            1,
                                          )}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Box>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {index > 0 &&
                        !isInboundAgent &&
                        item.stageTitle !== 'Booked' && (
                          <div className="w-full flex flex-row items-center justify-end mt-2">
                            <button
                              className="flex flex-row items-center gap-1"
                              onClick={() => {
                                setShowDelStagePopup(item)
                              }}
                            >
                              <Image
                                src={'/assets/delIcon.png'}
                                height={20}
                                width={18}
                                alt="*"
                                style={{
                                  filter:
                                    'invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)',
                                  opacity: 0.5,
                                }}
                              />
                              <p
                                className="text-[#15151580]"
                                style={{ fontWeight: '500', fontSize: 14 }}
                              >
                                Delete
                              </p>
                            </button>
                          </div>
                        )}

                      {/* Modal to rename stage */}
                      <Modal
                        open={showRenamePopup}
                        onClose={() => {
                          setShowRenamePopup(false)
                          // handleCloseStagePopover();
                        }}
                        BackdropProps={{
                          timeout: 1000,
                          sx: {
                            backgroundColor: '#00000010',
                            //backdropFilter: "blur(5px)",
                          },
                        }}
                      >
                        <Box
                          className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
                          sx={{
                            ...styles.modalsStyle,
                            backgroundColor: 'white',
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
                                <div
                                  style={{ fontWeight: '700', fontSize: 22 }}
                                >
                                  Rename stage
                                </div>
                                <div
                                  style={{
                                    direction: 'row',
                                    display: 'flex',
                                    justifyContent: 'end',
                                  }}
                                >
                                  <CloseBtn
                                    onClick={() => setShowRenamePopup(false)}
                                  />
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
                                  Stage Title*
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
                                className="mt-4 outline-none bg-brand-primary"
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
                        open={showDelStagePopup}
                        onClose={() => setShowDelStagePopup(null)}
                        closeAfterTransition
                        BackdropProps={{
                          timeout: 1000,
                          sx: {
                            backgroundColor: '#00000010',
                            //backdropFilter: "blur(5px)",
                          },
                        }}
                      >
                        <Box
                          className="lg:w-7/12 sm:w-full w-8/12"
                          sx={styles.AddNewKYCQuestionModal}
                        >
                          <div className="flex flex-row justify-center w-full">
                            <div
                              className="sm:w-7/12 w-full"
                              style={{
                                backgroundColor: '#ffffff',
                                padding: 20,
                                borderRadius: '13px',
                              }}
                            >
                              <div className="flex flex-row justify-between items-center">
                                <div
                                  className="text-center font-16"
                                  style={{ fontWeight: '700' }}
                                >
                                  Delete stage
                                </div>

                                <CloseBtn
                                  onClick={() => setShowDelStagePopup(null)}
                                />
                              </div>

                              {selectedStage?.hasLeads ? (
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
                                      This stage has leads associated with it.
                                      Move this lead to another stage before
                                      deleting.
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
                                          '& .MuiOutlinedInput-notchedOutline':
                                            {
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
                                        {pipelineStages.map((stage, index) => {
                                          return (
                                            <MenuItem
                                              key={index}
                                              value={stage.stageTitle}
                                              disabled={
                                                stage.id === selectedStage?.id
                                              }
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
                                      className="mt-10 outline-none bg-brand-primary"
                                      disabled={!assignNextStage}
                                      style={{
                                        color: 'white',
                                        height: '50px',
                                        borderRadius: '10px',
                                        width: '100%',
                                        backgroundColor:
                                          !assignNextStage && '#00000020',
                                        color: !assignNextStage && '#000000',
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
                                    Confirm you want to delete this stage.This
                                    action is irreversible.
                                  </div>
                                  <div className="flex flex-row items-center w-full mt-8">
                                    <div
                                      className="w-1/2 text-center"
                                      onClick={() => {
                                        setShowDelStagePopup(null)
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
                          </div>
                        </Box>
                      </Modal>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            <button
              className="outline-none w-full flex flex-row items-center justify-center h-[50px] mt-4 rounded-lg"
              style={{
                border: '2px dashed hsl(var(--brand-primary))',
              }}
              onClick={() => {
                setAddNewStageModal(true)
              }}
            >
              <div className="gap-1 flex flex-row items-center">
                <div
                  style={{
                    width: '15px',
                    height: '15px',
                    backgroundColor: 'hsl(var(--brand-primary))',
                    WebkitMaskImage: 'url(/assets/addIcon.png)',
                    maskImage: 'url(/assets/addIcon.png)',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />
                <p
                  className="text-brand-primary"
                  style={{ fontSize: 16, fontWeight: '600' }}
                >
                  Add New Stage
                </p>
              </div>
            </button>

            <AuthSelectionPopup
              open={showAuthSelectionPopup}
              onClose={() => setShowAuthSelectionPopup(false)}
              onSuccess={() => {
                getAccounts()
                if (selectedType === 'email') {
                  setMessageModalMode('email')
                  setShowMessageModal(true)
                }
              }}
              showEmailTemPopup={false}
              setShowEmailTempPopup={() => {}}
              setSelectedGoogleAccount={(account) => {
                setSelectedGoogleAccount(account)
              }}
            />

            {/* Upgrade modals for email and SMS */}
            {(emailCapability.showUpgrade || emailCapability.showRequestFeature) && (
              <UpgradeTagWithModal
                reduxUser={reduxUser}
                setReduxUser={setReduxUser}
                requestFeature={emailCapability.showRequestFeature}
                externalTrigger={triggerEmailUpgradeModal > 0}
                onModalClose={handleEmailUpgradeModalClose}
                hideTag={true}
              />
            )}
            {(smsCapability.showUpgrade || smsCapability.showRequestFeature) && (
              <UpgradeTagWithModal
                reduxUser={reduxUser}
                setReduxUser={setReduxUser}
                requestFeature={smsCapability.showRequestFeature}
                externalTrigger={triggerSMSUpgradeModal > 0}
                onModalClose={handleSMSUpgradeModalClose}
                hideTag={true}
              />
            )}

            <NewMessageModal
              open={showMessageModal}
              mode={messageModalMode}
              isPipelineMode={true}
              isEditing={isEditing}
              editingRow={editingRow}
              selectedUser={targetUser}
              onClose={() => {
                setShowMessageModal(false)
                setIsEditing(false)
                setEditingRow(null)
                setEditingStageIndex(null)
                closeAddMenu(selectedIndex)
              }}
              onSaveTemplate={(templateData) => {
                if (isEditing && editingRow) {
                  handleUpdateRow(editingRow.id, templateData)
                } else {
                  addRow(selectedIndex, selectedType, templateData)
                }
                setShowMessageModal(false)
                setIsEditing(false)
                setEditingRow(null)
                setEditingStageIndex(null)
                closeAddMenu(selectedIndex)
              }}
            />

            {/* Code for add stage modal */}
            <Modal
              open={addNewStageModal}
              onClose={() => {
                handleCloseAddStage()
              }}
            >
              <Box
                className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
                sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
              >
                <div style={{ width: '100%' }}>
                  <div
                    style={{ scrollbarWidth: 'none' }} //className='max-h-[60vh] overflow-auto'
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
                        Add New Stage
                      </div>
                      <div
                        style={{
                          direction: 'row',
                          display: 'flex',
                          justifyContent: 'end',
                        }}
                      >
                        <CloseBtn onClick={() => handleCloseAddStage()} />
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
                        className="flex flex-row items-center gap-2 outline-none"
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
                            open={open}
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
                                />
                                <p style={{ fontWeight: '500', fontSize: 12 }}>
                                  Tip: Tell your AI when to move the leads to
                                  this stage.
                                </p>
                              </div>
                            </div>
                          </Popover>
                        </div>
                        <textarea
                          className="h-[50px] px-2 outline-none focus:ring-0 w-full mt-1 rounded-lg"
                          placeholder="Ex: Does the human express interestting a CMA "
                          style={{
                            border: '1px solid #00000020',
                            fontWeight: '500',
                            fontSize: 15,
                            maxHeight: '200px',
                          }}
                          value={action}
                          onChange={(e) => {
                            setAction(e.target.value)
                          }}
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
                            aria-owns={
                              openAction ? 'mouse-over-popover2' : undefined
                            }
                            aria-haspopup="true"
                            onMouseEnter={(event) => {
                              setShowSampleTip(true)
                              setActionInfoEl2(event.currentTarget)
                            }}
                            onMouseLeave={() => {
                              handlePopoverClose()
                              setShowSampleTip(false)
                            }}
                          />
                        </div>

                        <div
                          className=" mt-2" //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple max-h-[30vh] overflow-auto
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
                                  handleAddStageInputsChanges(
                                    input.id,
                                    e.target.value,
                                  )
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
                                                                <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-brand-primary rounded-lg underline' style={{
                                                                    fontSize: 15,
                                                                    fontWeight: "700"
                                                                }}>
                                                                    Add New
                                                                </button>
                                                            )
                                                        }
                                                    </div> */}

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
                            aria-owns={
                              openAction ? 'mouse-over-popover2' : undefined
                            }
                            aria-haspopup="true"
                            onMouseEnter={(event) => {
                              setActionInfoEl2(event.currentTarget)
                            }}
                            onMouseLeave={handlePopoverClose}
                          />

                          <Popover
                            id="mouse-over-popover2"
                            sx={{
                              pointerEvents: 'none',
                            }}
                            open={openAction}
                            anchorEl={actionInfoEl2}
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
                                />
                                <p style={{ fontWeight: '500', fontSize: 12 }}>
                                  {showSampleTip
                                    ? 'What are possible answers leads will give to this question?'
                                    : 'Notify a team member when leads move here.'}
                                </p>
                              </div>
                            </div>
                          </Popover>
                        </div>

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
                              {/* <MenuItem value={myTeamAdmin.name}>
                                <div className="w-full flex flex-row items-center gap-2">
                                  <div>{myTeamAdmin.name}</div>
                                  <div className="bg-brand-primary text-white text-sm px-2 rounded-full">
                                    Admin
                                  </div>
                                </div>
                              </MenuItem> */}
                              <MenuItem value="">
                                <em>Delete</em>
                              </MenuItem>
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

                        <div className="mt-4">
                          <TagsInput setTags={setTagsValue} />
                        </div>
                      </div>
                    )}
                  </div>

                  {addStageLoader ? (
                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                      <CircularProgress size={25} />
                    </div>
                  ) : (
                    <div className="w-full">
                      {
                        //inputs.filter(input => input.value.trim() !== "").length === 3 &&
                        canProceed() ? (
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
                            onClick={handleAddNewStageTitle}
                          >
                            Add Stage
                          </button>
                        ) : (
                          <button
                            className="mt-4 outline-none"
                            disabled={true}
                            style={{
                              backgroundColor: '#00000020',
                              color: 'black',
                              height: '50px',
                              borderRadius: '10px',
                              width: '100%',
                              fontWeight: 600,
                              fontSize: '20',
                            }}
                            // onClick={handleAddNewStageTitle}
                          >
                            Add Stage
                          </button>
                        )
                      }
                    </div>
                  )}
                </div>
              </Box>
            </Modal>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default PipelineStages
