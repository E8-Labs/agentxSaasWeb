import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
} from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import LoaderAnimation from '@/components/animations/LoaderAnimation'
import Header from '@/components/onboarding/Header'
import ProgressBar from '@/components/onboarding/ProgressBar'
import {
  HowToVideoTypes,
  HowtoVideos,
  PersistanceKeys,
} from '@/constants/Constants'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'

import Apis from '../apis/Apis'
import IntroVideoModal from '../createagent/IntroVideoModal'
import VideoCard from '../createagent/VideoCard'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import PipelineStages from './PipelineStages'
import {
  buildFirecrawlSelectMenuProps,
  FirecrawlChevronIcon,
} from './firecrawlSelectMenu'
import { getCadenceTemplates, createCadenceTemplate } from './TempleteServices'

const EMPTY_CADENCE_SLICE = {
  assignedLeads: {},
  rowsByIndex: {},
  nextStage: {},
  selectedNextStage: {},
}

const Pipeline1 = ({
  handleContinue,
  handleBack,
  stopLoaderTrigger = false,
  onContinueClick,
}) => {
  const router = useRouter()

  const [shouldContinue, setShouldContinue] = useState(true)
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [hasAgencyLogo, setHasAgencyLogo] = useState(false)
  const [showOrb, setShowOrb] = useState(true)
  const [toggleClick, setToggleClick] = useState(false)
  const [selectedPipelineItem, setSelectedPipelineItem] = useState(null)
  const [selectPipleLine, setSelectPipleLine] = useState('')
  const [introVideoModal, setIntroVideoModal] = useState(false)
  const [selectedPipelineStages, setSelectedPipelineStages] = useState([])
  const [oldStages, setOldStages] = useState([])
  const [pipelinesDetails, setPipelinesDetails] = useState([])
  // Per-pipeline cadence: { [pipelineId]: { assignedLeads, rowsByIndex, nextStage, selectedNextStage } }
  const [cadenceByPipeline, setCadenceByPipeline] = useState({})
  // Skip re-restoring from localStorage when pipelinesDetails is updated in-place (e.g. after adding a stage)
  // so we don't overwrite current in-memory assignments.
  const restoredCadenceForPipelineRef = useRef(new Set())
  /** Prevents overlapping Continue: duplicate clicks were re-running cadence-template saves. */
  const continueActionInProgressRef = useRef(false)
  const [createPipelineLoader, setPipelineLoader] = useState(false)
  const [isInboundAgent, setIsInboundAgent] = useState(false)
  const [showRearrangeErr, setShowRearrangeErr] = useState(null)

  // Ref for the main scroll container so PipelineStages can auto-scroll it during drag
  const mainScrollContainerRef = useRef(null)

  const pipelineId = selectedPipelineItem?.id
  const currentCadence = useMemo(
    () =>
      pipelineId
        ? {
          ...EMPTY_CADENCE_SLICE,
          ...cadenceByPipeline[pipelineId],
        }
        : EMPTY_CADENCE_SLICE,
    [pipelineId, cadenceByPipeline],
  )
  const {
    assignedLeads,
    rowsByIndex,
    nextStage,
    selectedNextStage,
  } = currentCadence

  const updateCurrentPipelineCadence = (updater) => {
    const id = selectedPipelineItem?.id
    if (!id) return
    setCadenceByPipeline((prev) => {
      const current = prev[id] ?? EMPTY_CADENCE_SLICE
      const updated = updater({ ...current })
      return {
        ...prev,
        [id]: { ...EMPTY_CADENCE_SLICE, ...current, ...updated },
      }
    })
  }

  const [reorderSuccessBarMessage, setReorderSuccessBarMessage] = useState(null)
  const [isVisibleSnack, setIsVisibleSnack] = useState(false)
  const [snackType, setSnackType] = useState(null)

  useEffect(() => {
    // //console.log;
  }, [reorderSuccessBarMessage])

  useEffect(() => {
    if (stopLoaderTrigger) {
      setPipelineLoader(false)
    }
  }, [stopLoaderTrigger])

  useEffect(() => {
    // Check if user is subaccount and if agency has logo
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('User')
        let isSub = false
        let hasLogo = false

        if (userData) {
          const parsedUser = JSON.parse(userData)
          isSub =
            parsedUser?.user?.userRole === 'AgencySubAccount' ||
            parsedUser?.userRole === 'AgencySubAccount'
          setIsSubaccount(isSub)
        }

        // Check if agency has branding logo
        let branding = null
        const storedBranding = localStorage.getItem('agencyBranding')
        if (storedBranding) {
          try {
            branding = JSON.parse(storedBranding)
          } catch (error) { }
        }

        // Also check user data for agencyBranding
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            if (parsedUser?.user?.agencyBranding) {
              branding = parsedUser.user.agencyBranding
            } else if (parsedUser?.agencyBranding) {
              branding = parsedUser.agencyBranding
            } else if (parsedUser?.user?.agency?.agencyBranding) {
              branding = parsedUser.user.agency.agencyBranding
            }
          } catch (error) { }
        }

        hasLogo = !!branding?.logoUrl
        setHasAgencyLogo(hasLogo)

        // Show orb if: not subaccount OR (subaccount but no logo)
        setShowOrb(!isSub || (isSub && !hasLogo))
      } catch (error) { }
    }
  }, [])

  const [cadenceTemplatesList, setCadenceTemplatesList] = useState([])
  const [selectedCadenceTemplateByStageId, setSelectedCadenceTemplateByStageId] = useState({})
  const [saveStageAsTemplateByStageId, setSaveStageAsTemplateByStageId] = useState({})
  const [stageTemplateNameByStageId, setStageTemplateNameByStageId] = useState({})

  const [reorderLoader, setReorderLoader] = useState(false)
  //code for new Lead calls
  // const [rows, setRows] = useState([]);
  // const [assignedNewLEad, setAssignedNewLead] = useState(false);
  useEffect(() => {
    const localAgentData = localStorage.getItem('agentDetails')
    if (localAgentData && localAgentData != 'undefined') {
      const Data = JSON.parse(localAgentData)
      if (Data?.agents?.length === 1 && Data.agents[0]?.agentType == 'inbound') {
        return
      } else {
        // //console.log;
      }
    }
    const localCadences = localStorage.getItem('AddCadenceDetails')
    if (localCadences && localCadences != 'null') {
      const localCadenceDetails = JSON.parse(localCadences)
      // //console.log;

      // Set the selected pipeline item
      const storedPipelineItem = localCadenceDetails.pipelineID
      const storedCadenceDetails = localCadenceDetails.cadenceDetails

      // Fetch pipelines to ensure we have the list
      // getPipelines().then(() => {
      const selectedPipeline = pipelinesDetails.find(
        (pipeline) => pipeline.id === storedPipelineItem,
      )

      if (selectedPipeline) {
        // Only restore from localStorage once per pipeline (e.g. on initial load).
        // When pipelinesDetails is updated in-place (e.g. after adding a new stage),
        // skip restore so we don't overwrite current in-memory assignments and unassign stages.
        const alreadyRestored = restoredCadenceForPipelineRef.current.has(storedPipelineItem)
        if (alreadyRestored) {
          setSelectedPipelineItem(selectedPipeline)
          setSelectedPipelineStages(selectedPipeline.stages)
          return
        }
        restoredCadenceForPipelineRef.current.add(storedPipelineItem)

        // console.log("Pipeline stages1 are ", selectedPipeline.stages);
        // console.log("Pipeline indentifier1 are ", selectedPipeline);
        setSelectedPipelineItem(selectedPipeline)
        setSelectedPipelineStages(selectedPipeline.stages)
        console.log("From useEffect Selected pipeline stages are", selectedPipeline.stages);
        // Restore assigned leads and rows by index
        const restoredAssignedLeads = {}
        const restoredRowsByIndex = {}
        const restoredNextStage = {}
        const restoredNextStageTitles = {} // For dropdown values

        storedCadenceDetails?.forEach((cadence) => {
          const stageIndex = selectedPipeline.stages.findIndex(
            (stage) => stage.id === cadence.stage,
          )

          if (stageIndex !== -1) {
            restoredAssignedLeads[stageIndex] = true
            // Restore calls with referencePoint defaults if missing
            const currentStage = selectedPipeline.stages[stageIndex]
            const isBookingStage = currentStage?.identifier === 'booked'
            restoredRowsByIndex[stageIndex] = (cadence.calls || []).map((call) => ({
              ...call,
              referencePoint: call.referencePoint || (isBookingStage ? 'before_meeting' : 'regular_calls'),
            }))
            if (cadence.moveToStage) {
              const nextStageObj = selectedPipeline.stages.find(
                (stage) => stage.id === cadence.moveToStage,
              )
              if (nextStageObj) {
                restoredNextStage[stageIndex] = nextStageObj
                // Also set the stage title for the dropdown
                restoredNextStageTitles[stageIndex] = nextStageObj.stageTitle || nextStageObj.title
              }
            }
          }
        })

        setCadenceByPipeline((prev) => ({
          ...prev,
          [storedPipelineItem]: {
            assignedLeads: restoredAssignedLeads,
            rowsByIndex: restoredRowsByIndex,
            nextStage: restoredNextStageTitles,
            selectedNextStage: restoredNextStage,
          },
        }))
      } else {
        // //console.log;
      }
      // });
    } else {
      // getPipelines();
    }
  }, [pipelinesDetails])

  //// //console.log;

  useEffect(() => {
    // const localCadences = localStorage.getItem("AddCadenceDetails");
    // if (localCadences) {
    //     const localCadenceDetails = JSON.parse(localCadences);
    //    // //console.log;
    // }
    getPipelines()

    getCadenceTemplates().then((templates) => {
      if (templates && Array.isArray(templates)) {
        setCadenceTemplatesList(templates)
      }
    })

    const agentDetails = localStorage.getItem('agentDetails')
    if (agentDetails && agentDetails != 'undefined') {
      const agentData = JSON.parse(agentDetails)
      // //console.log;
      if (agentData?.agentType === 'inbound') {
        console.log("agent type is ", agentData?.agentType);
        setIsInboundAgent(true)
      } else {
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
    }

  }, [])

  useEffect(() => {
    const hasAssignedStage =
      selectedPipelineItem &&
      Object.keys(assignedLeads).some((k) => assignedLeads[k])
    // Agent needs to be assigned to a pipeline and stage.
    if (isInboundAgent) {
      setShouldContinue(false)
    } else {
      setShouldContinue(!hasAssignedStage)
    }
  }, [selectedPipelineItem, assignedLeads])

  //code to raorder the stages list

  useEffect(() => {
    let previousStages = oldStages.map((item) => item.id)
    let updatedStages = selectedPipelineStages.map((item) => item.id)

    // //console.log;
    // //console.log;

    // Compare arrays
    const areArraysEqual =
      previousStages.length === updatedStages.length &&
      previousStages.every((item, index) => item === updatedStages[index])

    if (areArraysEqual) {
      // //console.log;
    } else {
      // //console.log;
      // handleReorder();
    }
  }, [selectedPipelineStages])

  //code to get pipelines
  const getPipelines = async () => {
    try {
      let selectedUserLocalData = localStorage.getItem('selectedUser')
      if (!selectedUserLocalData) {
        selectedUserLocalData = localStorage.getItem(
          PersistanceKeys.isFromAdminOrAgency,
        )
      }
      // const selectedUserLocalData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency);
      let selectedUser = null
      if (
        selectedUserLocalData !== 'undefined' &&
        selectedUserLocalData !== null
      ) {
        selectedUser = JSON.parse(selectedUserLocalData)
      }
      let ApiPath = Apis.getPipelines + '?liteResource=true'

      if (selectedUser) {
        //TODO: @Arslan @Hamza tell me why are we using selectedUser?.subAccountData?.id instead of selectedUser?.id here
        // I am commenting it for now.
        // ApiPath = ApiPath + "&userId=" + selectedUser?.subAccountData?.id;
        if (selectedUser?.subAccountData?.id) {
          ApiPath = ApiPath + '&userId=' + selectedUser?.subAccountData?.id
        } else {
          ApiPath = ApiPath + '&userId=' + selectedUser?.id
        }
      }

      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        setPipelinesDetails(response.data.data)

        // Check if there's stored cadence data and select that pipeline
        const localCadences = localStorage.getItem('AddCadenceDetails')
        let pipelineToSelect = response.data.data[0] // Default to first pipeline

        if (localCadences && localCadences !== 'null') {
          try {
            const localCadenceDetails = JSON.parse(localCadences)
            const storedPipelineId = localCadenceDetails.pipelineID

            // Find the pipeline that matches the stored cadence
            const matchingPipeline = response.data.data.find(
              (pipeline) => pipeline.id === storedPipelineId,
            )

            if (matchingPipeline) {
              pipelineToSelect = matchingPipeline
            }
          } catch (error) { }
        }

        setSelectPipleLine(pipelineToSelect.title)
        setSelectedPipelineItem(pipelineToSelect)
        setSelectedPipelineStages(pipelineToSelect.stages)
        console.log("From api Selected pipeline stages are", pipelineToSelect.stages.map((item) => item.identifier));
        // console.log("Pipeline stages2 are ", pipelineToSelect.stages);
        // console.log("Pipeline indentifier2 are ", pipelineToSelect);
        setOldStages(pipelineToSelect.stages)
        localStorage.setItem(
          'pipelinesData',
          JSON.stringify(response.data.data),
        )
      }
    } catch (error) { } finally {
      // //console.log;
    }
  }

  //function for new lead
  // const addRow = () => {
  //     setRows([...rows, { id: rows.length + 1, days: '', hours: '', minutes: '' }]);
  // };

  // const removeRow = (id) => {
  //     setRows(rows.filter(row => row.id !== id));
  // };

  // const handleInputChange = (id, field, value) => {
  //     setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  // };

  // const assignNewLead = () => {
  //     setAssignedNewLead(true);
  //     setRows([...rows, { id: rows.length + 1, days: '', hours: '', minutes: '' }]);
  // }

  // const handleUnAssignNewLead = () => {
  //     setAssignedNewLead(false);
  //     setRows([]);
  // }

  //code for selecting stages

  const assignNewStage = (index) => {
    updateCurrentPipelineCadence((prev) => ({
      assignedLeads: { ...prev.assignedLeads, [index]: true },
      rowsByIndex: {
        ...prev.rowsByIndex,
        [index]: [
          {
            id: index,
            waitTimeDays: 0,
            waitTimeHours: 0,
            waitTimeMinutes: 0,
          },
        ],
      },
    }))
  }

  const handleUnAssignNewStage = (index) => {
    updateCurrentPipelineCadence((prev) => {
      const updatedRows = { ...prev.rowsByIndex }
      delete updatedRows[index]
      return {
        assignedLeads: { ...prev.assignedLeads, [index]: false },
        rowsByIndex: updatedRows,
      }
    })
  }

  const handleInputChange = (leadIndex, rowId, field, value) => {
    updateCurrentPipelineCadence((prev) => ({
      rowsByIndex: {
        ...prev.rowsByIndex,
        [leadIndex]: (prev.rowsByIndex[leadIndex] ?? []).map((row) =>
          row.id === rowId
            ? {
              ...row,
              [field]:
                field === 'referencePoint' ? value : (Number(value) || 0),
            }
            : row,
        ),
      },
    }))
  }

  const addRow = (index, action = 'call', templateData = null) => {
    updateCurrentPipelineCadence((prev) => {
      const list = prev.rowsByIndex[index] ?? []
      const nextId = list.length ? list[list.length - 1].id + 1 : 1

      const currentStage = selectedPipelineStages[index]
      const isBookingStage = currentStage?.identifier === 'booked'

      const newRow = {
        id: nextId,
        waitTimeDays: 0,
        waitTimeHours: 0,
        waitTimeMinutes: 0,
        action,
        communicationType: action,
        referencePoint: isBookingStage ? 'before_meeting' : 'regular_calls',
      }

      if (templateData) {
        Object.keys(templateData).forEach((key) => {
          if (templateData[key] !== undefined) {
            newRow[key] = templateData[key]
          }
        })
      }

      return {
        rowsByIndex: {
          ...prev.rowsByIndex,
          [index]: [...list, newRow],
        },
      }
    })
  }

  const removeRow = (leadIndex, rowId) => {
    updateCurrentPipelineCadence((prev) => ({
      rowsByIndex: {
        ...prev.rowsByIndex,
        [leadIndex]: (prev.rowsByIndex[leadIndex] ?? []).filter(
          (row) => row.id !== rowId,
        ),
      },
    }))
  }

  const updateRow = (leadIndex, rowId, updatedData) => {
    updateCurrentPipelineCadence((prev) => ({
      rowsByIndex: {
        ...prev.rowsByIndex,
        [leadIndex]: (prev.rowsByIndex[leadIndex] ?? []).map((row) =>
          row.id === rowId ? { ...row, ...updatedData } : row,
        ),
      },
    }))
  }

  const reorderRows = (stageIndex, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    updateCurrentPipelineCadence((prev) => {
      const list = prev.rowsByIndex[stageIndex] ?? []
      if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return prev
      const next = Array.from(list)
      const [removed] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, removed)
      return {
        ...prev,
        rowsByIndex: {
          ...prev.rowsByIndex,
          [stageIndex]: next,
        },
      }
    })
  }

  const serializeCadenceAsTemplate = () => {
    const stages = []
    for (const [indexStr, isAssigned] of Object.entries(assignedLeads)) {
      if (!isAssigned) continue
      const index = Number(indexStr)
      const stage = selectedPipelineStages[index]
      if (!stage) continue

      const moveToStageObj = selectedNextStage[index]
      let moveToStageIdentifier = null
      if (moveToStageObj) {
        moveToStageIdentifier = moveToStageObj.identifier || moveToStageObj.stageTitle
      }

      const calls = (rowsByIndex[index] || []).map((row) => ({
        waitTimeDays: row.waitTimeDays || 0,
        waitTimeHours: row.waitTimeHours || 0,
        waitTimeMinutes: row.waitTimeMinutes || 0,
        communicationType: row.communicationType || row.action || 'call',
        referencePoint: row.referencePoint || 'regular_calls',
      }))

      stages.push({
        stageIdentifier: stage.identifier || stage.stageTitle,
        stageTitle: stage.stageTitle,
        moveToStageIdentifier,
        calls,
      })
    }
    return stages
  }

  const serializeStageAsTemplate = (stageIndex) => {
    const stage = selectedPipelineStages[stageIndex]
    if (!stage) return null

    const moveToStageObj = selectedNextStage[stageIndex]
    let moveToStageIdentifier = null
    if (moveToStageObj) {
      moveToStageIdentifier = moveToStageObj.identifier || moveToStageObj.stageTitle
    }

    const calls = (rowsByIndex[stageIndex] || []).map((row) => ({
      waitTimeDays: row.waitTimeDays || 0,
      waitTimeHours: row.waitTimeHours || 0,
      waitTimeMinutes: row.waitTimeMinutes || 0,
      communicationType: row.communicationType || row.action || 'call',
      referencePoint: row.referencePoint || 'regular_calls',
      ...(row.templateId != null && { templateId: row.templateId }),
      ...(row.emailAccountId != null &&
        row.emailAccountId !== '' && { emailAccountId: row.emailAccountId }),
      ...(row.smsPhoneNumberId != null &&
        row.smsPhoneNumberId !== '' && { smsPhoneNumberId: row.smsPhoneNumberId }),
    }))

    // console.log('rowsByIndex[stageIndex]:', rowsByIndex[stageIndex])

    return {
      stageIdentifier: stage.identifier || stage.stageTitle,
      stageTitle: stage.stageTitle,
      moveToStageIdentifier,
      calls,
    }
  }

  const handleSaveStageTemplateChange = (stageId, { save, name }) => {
    setSaveStageAsTemplateByStageId((prev) => ({ ...prev, [stageId]: save }))
    setStageTemplateNameByStageId((prev) => ({ ...prev, [stageId]: name ?? '' }))
  }

  const applyCadenceTemplateToStage = (stageIndex, template) => {
    if (!template?.stages?.length || !selectedPipelineStages?.[stageIndex]) return
    const stage = selectedPipelineStages[stageIndex]
    // Apply the first (or only) stage's cadence from the template to this stage, regardless of stage name/identifier
    const templateStage = template.stages[0]

    const isBookingStage = stage.identifier === 'booked'
    const newRows = (templateStage.calls || []).map((call, i) => ({
      id: i + 1,
      waitTimeDays: call.waitTimeDays || 0,
      waitTimeHours: call.waitTimeHours || 0,
      waitTimeMinutes: call.waitTimeMinutes || 0,
      communicationType: call.communicationType || 'call',
      action: call.communicationType || 'call',
      referencePoint: call.referencePoint || (isBookingStage ? 'before_meeting' : 'regular_calls'),
      ...(call.templateId != null && { templateId: call.templateId }),
      ...(call.emailAccountId != null &&
        call.emailAccountId !== '' && { emailAccountId: call.emailAccountId }),
      ...(call.smsPhoneNumberId != null &&
        call.smsPhoneNumberId !== '' && { smsPhoneNumberId: call.smsPhoneNumberId }),
    }))

    let newNextStageVal = nextStage[stageIndex]
    let newSelectedNextStageVal = selectedNextStage[stageIndex]
    if (templateStage.moveToStageIdentifier) {
      let moveToStage = selectedPipelineStages.find(
        (s) => s.identifier && s.identifier === templateStage.moveToStageIdentifier,
      )
      if (!moveToStage) {
        moveToStage = selectedPipelineStages.find(
          (s) => s.stageTitle === templateStage.moveToStageIdentifier,
        )
      }
      if (moveToStage) {
        newNextStageVal = moveToStage.stageTitle
        newSelectedNextStageVal = moveToStage
      }
    }

    updateCurrentPipelineCadence((prev) => ({
      assignedLeads: { ...prev.assignedLeads, [stageIndex]: true },
      rowsByIndex: { ...prev.rowsByIndex, [stageIndex]: newRows },
      nextStage: { ...prev.nextStage, [stageIndex]: newNextStageVal },
      selectedNextStage: { ...prev.selectedNextStage, [stageIndex]: newSelectedNextStageVal },
    }))
  }

  const handleStageTemplateSelect = (stageId, templateId) => {
    if (templateId === '__new__' || !templateId) {
      setSelectedCadenceTemplateByStageId((prev) => ({ ...prev, [stageId]: '' }))
      return
    }
    setSelectedCadenceTemplateByStageId((prev) => ({ ...prev, [stageId]: templateId }))
    const template = cadenceTemplatesList.find((t) => t.id === templateId)
    if (!template) return
    const stageIndex = selectedPipelineStages.findIndex((s) => s.id === stageId)
    if (stageIndex === -1) return
    applyCadenceTemplateToStage(stageIndex, template)
  }

  const handleClearStageTemplate = (stageId) => {
    setSelectedCadenceTemplateByStageId((prev) => ({ ...prev, [stageId]: '' }))
  }

  const printAssignedLeadsData = async () => {
    if (continueActionInProgressRef.current) {
      return
    }
    continueActionInProgressRef.current = true
    try {
    onContinueClick?.()
    setPipelineLoader(true)

    const allData = Object.keys(assignedLeads)
      .map((index) => {
        if (assignedLeads[index]) {
          const lead = selectedPipelineStages[index] // Get the lead information
          const nextStage = selectedNextStage[index] // Get the "then move to" selected stage for this index
          return {
            stage: lead?.id || 'Unknown ID', // Pipeline ID
            calls: rowsByIndex[index] || [], // Associated rows
            moveToStage: nextStage?.id,
            // ? { id: nextStage.id, title: nextStage.stageTitle }
            // : { id: "None", title: "None" }, // Handle if no selection
          }
        }
        return null // Ignore unassigned leads
      })
      .filter((item) => item !== null) // Filter out null values

    const pipelineID = selectedPipelineItem.id
    const cadence = allData

    let cadenceData = null

    //getting local agent data then sending the cadence accordingly
    const agentDetails = localStorage.getItem('agentDetails')
    // console.log("Agent Details ", agentDetails);
    if (agentDetails) {
      const agentData = JSON.parse(agentDetails)
      // //console.log;
      if (
        agentData?.agents?.length === 1 &&
        agentData.agents[0]?.agentType === 'inbound'
      ) {
        cadenceData = {
          pipelineID: selectedPipelineItem?.id,
          cadenceDetails: [
            {
              stage: selectedPipelineItem?.stages[0]?.id,
              calls: [
                {
                  id: 0,
                  waitTimeDays: 3650,
                  waitTimeHours: 0,
                  waitTimeMinutes: 0,
                  communicationType: 'call',
                },
              ],
            },
          ],
        }
      } else {
        // //console.log;
        cadenceData = {
          pipelineID: selectedPipelineItem.id,
          cadenceDetails: cadence,
        }
      }
    }

    if (cadenceData) {
      localStorage.setItem('AddCadenceDetails', JSON.stringify(cadenceData))
    }

    const stageIdsSavedAsTemplate = []
    try {
      for (let i = 0; i < selectedPipelineStages.length; i++) {
        const stage = selectedPipelineStages[i]
        if (!stage?.id) continue
        const save = saveStageAsTemplateByStageId[stage.id]
        const name = (stageTemplateNameByStageId[stage.id] || '').trim()
        if (!save || !name) continue

        const oneStage = serializeStageAsTemplate(i)
        if (!oneStage) continue
        // return

        const result = await createCadenceTemplate({
          templateName: name,
          stages: [oneStage],
        })
        if (result?.status && result?.data) {
          setCadenceTemplatesList((prev) => [result.data, ...prev])
          stageIdsSavedAsTemplate.push(stage.id)
        }
      }
    } catch (e) {
      console.error('Failed to save cadence template:', e)
    }

    if (stageIdsSavedAsTemplate.length > 0) {
      setSaveStageAsTemplateByStageId((prev) => {
        const next = { ...prev }
        stageIdsSavedAsTemplate.forEach((id) => {
          delete next[id]
        })
        return next
      })
      setStageTemplateNameByStageId((prev) => {
        const next = { ...prev }
        stageIdsSavedAsTemplate.forEach((id) => {
          delete next[id]
        })
        return next
      })
    }

    handleContinue()

    // try {
    //    // //console.log;

    //     //// //console.log;
    //     //// //console.log;

    //     const localData = localStorage.getItem("User");
    //     let AuthToken = null;
    //     if (localData) {
    //         const userData = JSON.parse(localData);
    //         AuthToken = userData.token;
    //     }

    //     let currentAgentDetails = null;

    //     const agentDetails = localStorage.getItem("agentDetails");
    //     if (agentDetails) {
    //         const agentData = JSON.parse(agentDetails);
    //         //// //console.log;
    //         currentAgentDetails = agentData;
    //     }
    //    // //console.log;

    //     const ApiPath = Apis.createPipeLineCadence;
    //    // //console.log;

    //     const ApiData = {
    //         pipelineId: selectedPipelineItem.id,
    //         mainAgentId: currentAgentDetails.id,
    //         cadence: cadence
    //     }

    //    // //console.log;
    //     // const JSONData = JSON.stringify(ApiData);
    //     //// //console.log;
    //     // return
    //     const response = await axios.post(ApiPath, ApiData, {
    //         headers: {
    //             "Authorization": "Bearer " + AuthToken,
    //             "Content-Type": "application/json"
    //         }
    //     });

    //     if (response) {
    //        // //console.log;
    //         if(response.data.status === true){
    //             handleContinue();
    //         }
    //     }

    // } catch (error) {
    //    // console.error("Error occured in create pipeline is: ---", error);
    // } finally {
    //    // //console.log;
    //     setPipelineLoader(false);
    // }
    } finally {
      continueActionInProgressRef.current = false
    }
  }

  const handleToggleClick = (id) => {
    setToggleClick((prevId) => (prevId === id ? null : id))
  }

  const handleSelectPipleLine = (event) => {
    const selectedValue = event.target.value
    setSelectPipleLine(selectedValue)

    // Find the selected item from the pipelinesDetails array
    const selectedItem = pipelinesDetails.find(
      (item) => item.title === selectedValue,
    )
    // //console.log;
    setSelectedPipelineItem(selectedItem)
    setSelectedPipelineStages(selectedItem.stages)
    console.log("From handleSelectPipleLine Selected pipeline stages are", selectedItem.stages);
    // console.log("Pipeline stages3 are ", selectedItem.stages);
    // console.log("Pipeline indentifier3 are ", selectedItem);
    setOldStages(selectedItem.stages)
  }

  const handleSelectNextChange = (index, event) => {
    const selectedValue = event.target.value

    const selectedItem = selectedPipelineStages.find(
      (item) => item.stageTitle === selectedValue,
    )

    updateCurrentPipelineCadence((prev) => ({
      nextStage: { ...prev.nextStage, [index]: selectedValue },
      selectedNextStage: { ...prev.selectedNextStage, [index]: selectedItem },
    }))
  }

  //code to rearrange stages list
  const handleReorder = async (stagesToUse = null) => {
    try {
      setReorderLoader(true)
      const sourceStages = stagesToUse ?? selectedPipelineStages
      const updateStages = sourceStages.map((stage, index) => ({
        id: stage.id,
        order: stage.order,
      }))

      console.log("updateStages reorder Selected pipeline stages are", updateStages);

      const ApiPath = Apis.reorderStages
      let AuthToken = null
      const LocalData = localStorage.getItem('User')
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData)
        AuthToken = UserDetails.token
      }
      //// //console.log;
      const ApiData = {
        pipelineId: selectedPipelineItem.id,
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
          let type = SnackbarTypes.Success
          setSnackType('Success')
          setReorderSuccessBarMessage(response.data.message)
        } else if (response.data.status === false) {
          let type = SnackbarTypes.Error
          setSnackType('Error')
          setReorderSuccessBarMessage(response.data.message)
        }
        setIsVisibleSnack(true)
      }
    } catch (error) {
      // console.error("Error occured in rearrange order api is:", error);
    } finally {
      // //console.log;
      setReorderLoader(false)
    }
  }

  function onNewStageCreated(pipeline) {
    let pipelines = []

    for (let p of pipelinesDetails) {
      if (p.id == pipeline.id) {
        pipelines.push(pipeline)
      } else {
        pipelines.push(p)
      }
    }
    setSelectedPipelineItem(pipeline)
    setSelectedPipelineStages(pipeline.stages)
    console.log("From onNewStageCreated Selected pipeline stages are", pipeline.stages);
    // console.log("Pipeline stages4 are ", pipeline.stages);
    // console.log("Pipeline indentifier4 are ", pipeline);
    setPipelinesDetails(pipelines)
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
  }

  const labelClassName = 'text-[14px] font-normal leading-[1.6] text-black'

  const inputShellClassName =
    'bg-white border-[0.5px] border-black/10 rounded-[8px] h-[40px] w-full flex items-center px-[10px] gap-3 transition-colors focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-brand-primary/20'

  const pipelineSelectSx = {
    fontSize: 14,
    fontWeight: 400,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    height: 40,
    borderRadius: '8px',
    width: '100%',
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      height: 40,
      padding: 0,
      paddingRight: '28px',
    },
    '& .MuiSelect-icon': {
      color: 'rgba(0,0,0,0.7)',
      right: 10,
      transition: 'transform 180ms cubic-bezier(0.2, 0.9, 0.2, 1)',
    },
    '&[aria-expanded="true"] .MuiSelect-icon': {
      transform: 'rotate(180deg)',
    },
  }

  const pipelineTutorial = getTutorialByType(HowToVideoTypes.CRMIntegration)
  const pipelineVideoTitle =
    pipelineTutorial?.title || 'Learn about pipeline and stages'
  const pipelineVideoDuration = pipelineTutorial?.description || '8:17'
  const pipelineVideoUrl =
    getVideoUrlByType(HowToVideoTypes.CRMIntegration) || HowtoVideos.Pipeline

  return (
    <div className="bg-[#f9f9f9] w-full h-[100svh] overflow-hidden">
      {/* <AgentSelectSnackMessage isVisible={reorderSuccessBar == null || reorderSuccessBar == false ? false : true} hide={() => setReorderSuccessBar(null)} message={reorderSuccessBar} time={SnackbarTypes.Success} /> */}
      {isVisibleSnack && (
        <AgentSelectSnackMessage
          isVisible={isVisibleSnack === false ? false : true}
          hide={() => setIsVisibleSnack(false)}
          message={reorderSuccessBarMessage}
          type={snackType}
        />
      )}
      <div className="relative flex w-full h-[100svh] flex-col">
        <div className="relative bg-[#f9f9f9] w-full flex flex-col h-[100svh] overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-[15] hidden lg:flex items-end justify-end p-6 pr-8 pb-[92px]">
            <div
              className="pointer-events-auto w-fit rounded-[12px] bg-white"
              style={{
                border: '1px solid #eaeaea',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
              }}
            >
              <VideoCard
                duration={pipelineVideoDuration}
                horizontal={false}
                playVideo={() => setIntroVideoModal(true)}
                title={pipelineVideoTitle}
                videoUrl={pipelineVideoUrl}
                hoverReveal
                hideCta
                className="rounded-[12px] border-0 bg-transparent shadow-none"
              />
            </div>
          </div>

          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle={pipelineVideoTitle}
            videoUrl={pipelineVideoUrl}
          />

          <div className="sticky top-0 z-40 shrink-0 bg-[#f9f9f9]">
            <Header variant="createAgentToolbar" />
          </div>

          <div
            ref={mainScrollContainerRef}
            className="flex-1 w-full flex justify-center overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-brand-primary"
          >
            <div className="w-full max-w-[800px] mx-auto flex flex-col items-center gap-3 p-6 pb-10">
              <div className="w-full text-center text-[22px] font-semibold leading-[30px] tracking-[-0.77px] text-black">
                Pipeline & Stages
              </div>

              <div className="w-full flex flex-col gap-3 pt-3 pb-6">
                {pipelinesDetails.length > 1 && (
                  <div className="w-full flex flex-col gap-2 items-start">
                    <div className={labelClassName}>Select a pipeline</div>
                    <div className={inputShellClassName}>
                      <Box className="w-full min-w-0">
                        <FormControl className="w-full">
                          <Select
                            className="border-none rounded-lg outline-none w-full"
                            displayEmpty
                            value={selectPipleLine}
                            onChange={handleSelectPipleLine}
                            IconComponent={FirecrawlChevronIcon}
                            MenuProps={buildFirecrawlSelectMenuProps()}
                            renderValue={(selected) => {
                              if (selected === '') {
                                return (
                                  <span className="text-[14px] text-black/40">
                                    Select Pipeline
                                  </span>
                                )
                              }
                              return (
                                <span className="text-[14px] text-black">
                                  {selected}
                                </span>
                              )
                            }}
                            sx={pipelineSelectSx}
                          >
                            {pipelinesDetails.map((item) => (
                              <MenuItem key={item.id} value={item.title}>
                                {item.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </div>
                  </div>
                )}

                <div className="w-full flex flex-col gap-2">
                  <div className={labelClassName}>Assign this agent to a stage</div>
                  <div className="text-[14px] font-normal leading-[1.6] text-[#666]">
                    {`This agent will call leads when they're added to the selected stage.`}
                  </div>
                </div>
              </div>

              <PipelineStages
                stages={selectedPipelineStages}
                onUpdateOrder={(stages) => {
                  const oldOrder = selectedPipelineStages
                  setSelectedPipelineStages(stages)
                  setCadenceByPipeline((prev) => {
                    const id = selectedPipelineItem?.id
                    if (!id) return prev
                    const current = prev[id] ?? EMPTY_CADENCE_SLICE
                    if (oldOrder.length === 0 || oldOrder.length !== stages.length) return prev
                    const oldIndexByStageId = {}
                    oldOrder.forEach((s, i) => {
                      oldIndexByStageId[s.id] = i
                    })
                    const newRowsByIndex = {}
                    const newAssignedLeads = {}
                    const newNextStage = {}
                    const newSelectedNextStage = {}
                    stages.forEach((stage, newIndex) => {
                      const oldIndex = oldIndexByStageId[stage.id]
                      if (oldIndex !== undefined) {
                        newRowsByIndex[newIndex] = current.rowsByIndex[oldIndex] ?? []
                        newAssignedLeads[newIndex] = current.assignedLeads[oldIndex] ?? false
                        newNextStage[newIndex] = current.nextStage[oldIndex]
                        newSelectedNextStage[newIndex] = current.selectedNextStage[oldIndex]
                      }
                    })
                    return {
                      ...prev,
                      [id]: {
                        ...current,
                        rowsByIndex: newRowsByIndex,
                        assignedLeads: newAssignedLeads,
                        nextStage: newNextStage,
                        selectedNextStage: newSelectedNextStage,
                      },
                    }
                  })
                }}
                assignedLeads={assignedLeads}
                handleUnAssignNewStage={handleUnAssignNewStage}
                assignNewStage={assignNewStage}
                handleInputChange={handleInputChange}
                rowsByIndex={rowsByIndex}
                removeRow={removeRow}
                addRow={addRow}
                updateRow={updateRow}
                nextStage={nextStage}
                handleSelectNextChange={handleSelectNextChange}
                selectedPipelineStages={selectedPipelineStages}
                selectedPipelineItem={selectedPipelineItem}
                setShowRearrangeErr={setReorderSuccessBarMessage}
                setIsVisibleSnack={setIsVisibleSnack}
                scrollContainerRef={mainScrollContainerRef}
                setSnackType={setSnackType}
                onNewStageCreated={onNewStageCreated}
                handleReOrder={handleReorder}
                reorderRows={reorderRows}
                saveStageAsTemplateByStageId={saveStageAsTemplateByStageId}
                stageTemplateNameByStageId={stageTemplateNameByStageId}
                onSaveStageTemplateChange={handleSaveStageTemplateChange}
                cadenceTemplatesList={cadenceTemplatesList}
                selectedCadenceTemplateByStageId={selectedCadenceTemplateByStageId}
                onStageTemplateSelect={handleStageTemplateSelect}
                onClearStageTemplate={handleClearStageTemplate}
              />

              <Modal
                open={reorderLoader}
                closeAfterTransition
                BackdropProps={{
                  timeout: 100,
                  sx: {
                    backgroundColor: '#00000020',
                  },
                }}
              >
                <Box
                  className="lg:w-6/12 sm:w-9/12 w-10/12"
                  sx={styles.AddNewKYCQuestionModal}
                >
                  <div className="w-full flex flex-row items-center justify-center">
                    <CircularProgress
                      sx={{ color: 'hsl(var(--brand-primary))' }}
                      size={150}
                      thickness={1}
                    />
                  </div>
                </Box>
              </Modal>
            </div>
          </div>

          <div className="sticky bottom-0 z-40 bg-[#f9f9f9] w-full">
            <div className="border-t border-[rgba(21,21,21,0.1)]">
              <ProgressBar value={33} />
            </div>
            <div className="border-t border-[rgba(21,21,21,0.1)] h-[65px] flex items-center justify-between px-8 py-4">
              {typeof handleBack === 'function' ? (
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#efefef] px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] tracking-[0.07px] text-foreground transition-colors hover:bg-[#e5e5e5] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
                  onClick={handleBack}
                >
                  Back
                </button>
              ) : (
                <span className="min-w-[1px]" aria-hidden />
              )}
              {createPipelineLoader ? (
                <div className="w-[100px] flex items-center justify-center">
                  <LoaderAnimation loaderModal={createPipelineLoader} />
                </div>
              ) : (
                <button
                  type="button"
                  disabled={shouldContinue}
                  className="h-9 min-h-[36px] rounded-lg px-4 py-[7.5px] text-[14px] font-semibold leading-[21px] tracking-[0.07px] text-white bg-brand-primary hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:bg-black/10 disabled:text-black/60 disabled:hover:opacity-100 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30"
                  onClick={printAssignedLeadsData}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pipeline1
