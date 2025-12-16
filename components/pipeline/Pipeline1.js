import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Snackbar,
} from '@mui/material'
import { CaretDown, Minus, YoutubeLogo } from '@phosphor-icons/react'
import axios from 'axios'
import { set } from 'draft-js/lib/DefaultDraftBlockRenderMap'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Body from '@/components/onboarding/Body'
import Footer from '@/components/onboarding/Footer'
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

const Pipeline1 = ({ handleContinue }) => {
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
  const [assignedLeads, setAssignedLeads] = useState({})
  const [rowsByIndex, setRowsByIndex] = useState({})
  const [createPipelineLoader, setPipelineLoader] = useState(false)

  const [nextStage, setNextStage] = useState({})
  const [selectedNextStage, setSelectedNextStage] = useState({})

  const [showRearrangeErr, setShowRearrangeErr] = useState(null)

  // const [nextStage, setNextStage] = useState([]);
  // const [selectedNextStage, setSelectedNextStage] = useState([]);

  const [reorderSuccessBarMessage, setReorderSuccessBarMessage] = useState(null)
  const [isVisibleSnack, setIsVisibleSnack] = useState(false)
  const [snackType, setSnackType] = useState(null)

  useEffect(() => {
    // //console.log;
  }, [reorderSuccessBarMessage])

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
          } catch (error) {
            console.log('Error parsing agencyBranding from localStorage:', error)
          }
        }

        // Also check user data for agencyBranding
        if ( userData) {
          try {
            const parsedUser = JSON.parse(userData)
            if (parsedUser?.user?.agencyBranding) {
              branding = parsedUser.user.agencyBranding
            } else if (parsedUser?.agencyBranding) {
              branding = parsedUser.agencyBranding
            } else if (parsedUser?.user?.agency?.agencyBranding) {
              branding = parsedUser.user.agency.agencyBranding
            }
          } catch (error) {
            console.log('Error parsing user data for agencyBranding:', error)
          }
        }

        hasLogo = !!branding?.logoUrl
        setHasAgencyLogo(hasLogo)

        // Show orb if: not subaccount OR (subaccount but no logo)
        setShowOrb(!isSub || (isSub && !hasLogo))
      } catch (error) {
        console.log('Error parsing user data:', error)
      }
    }
  }, [])

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
        // //console.log;
        setSelectedPipelineItem(selectedPipeline)
        setSelectedPipelineStages(selectedPipeline.stages)

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
            restoredRowsByIndex[stageIndex] = cadence.calls || []
            if (cadence.moveToStage) {
              const nextStage = selectedPipeline.stages.find(
                (stage) => stage.id === cadence.moveToStage,
              )
              if (nextStage) {
                restoredNextStage[stageIndex] = nextStage
                // Also set the stage title for the dropdown
                restoredNextStageTitles[stageIndex] = nextStage.stageTitle || nextStage.title
              }
            }
          }
        })

        setAssignedLeads(restoredAssignedLeads)
        setRowsByIndex(restoredRowsByIndex)
        setSelectedNextStage(restoredNextStage)
        setNextStage(restoredNextStageTitles) // Set dropdown values
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
  }, [])

  useEffect(() => {
    if (selectedPipelineItem && rowsByIndex) {
      // //console.log;
      setShouldContinue(false)
      return
    } else if (!selectedPipelineItem || !rowsByIndex) {
      // //console.log;
      setShouldContinue(true)
    }

    //// //console.log;
  }, [selectedPipelineItem, selectedPipelineStages])

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
      //TODO: @Arslan @Hamza tell me why do we have two different keys to store a user's data on localstorage from admin?
      // Getting pipelines is different and getting a2p number is using diff key. Why is that?
      // I have consolidated the logic here  and on the @PipelineStages.js file. Let's discuss it and consolidate into one.
      console.log('Trigered getpipelines')
      let selectedUserLocalData = localStorage.getItem('selectedUser')
      if (!selectedUserLocalData) {
        selectedUserLocalData = localStorage.getItem(
          PersistanceKeys.isFromAdminOrAgency,
        )
      }
      // const selectedUserLocalData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency);
      let selectedUser = null
      console.log('Selected user local data is', selectedUserLocalData)
      if (
        selectedUserLocalData !== 'undefined' &&
        selectedUserLocalData !== null
      ) {
        selectedUser = JSON.parse(selectedUserLocalData)
        console.log('Selected user details are', selectedUser)
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

      console.log('ApiPath is', ApiPath)
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
        console.log('Response is of get pipelines', response.data.data)
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
              console.log('Found matching pipeline for cadence:', matchingPipeline.title)
            }
          } catch (error) {
            console.log('Error parsing cadence details:', error)
          }
        }
        
        setSelectPipleLine(pipelineToSelect.title)
        setSelectedPipelineItem(pipelineToSelect)
        setSelectedPipelineStages(pipelineToSelect.stages)
        setOldStages(pipelineToSelect.stages)
        localStorage.setItem(
          'pipelinesData',
          JSON.stringify(response.data.data),
        )
      }
    } catch (error) {
      console.log('Error occured in get pipelies api is :', error)
    } finally {
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
    setAssignedLeads((prev) => ({ ...prev, [index]: true }))
    setRowsByIndex((prev) => ({
      ...prev,
      [index]: [
        { id: index, waitTimeDays: 0, waitTimeHours: 0, waitTimeMinutes: 0 },
      ],
    }))
  }

  const handleUnAssignNewStage = (index) => {
    setAssignedLeads((prev) => ({ ...prev, [index]: false }))
    setRowsByIndex((prev) => {
      const updatedRows = { ...prev }
      delete updatedRows[index]
      return updatedRows
    })
  }

  const handleInputChange = (leadIndex, rowId, field, value) => {
    setRowsByIndex((prev) => ({
      ...prev,
      [leadIndex]: (prev[leadIndex] ?? []).map((row) =>
        row.id === rowId ? { ...row, [field]: Number(value) || 0 } : row,
      ),
    }))
  }

  const addRow = (index, action = 'call', templateData = null) => {
    console.log('addRow called with:', {
      index,
      action,
      templateData,
    })

    setRowsByIndex((prev) => {
      const list = prev[index] ?? []
      const nextId = list.length ? list[list.length - 1].id + 1 : 1

      const newRow = {
        id: nextId,
        waitTimeDays: 0,
        waitTimeHours: 0,
        waitTimeMinutes: 0,
        action, // "call" | "sms" | "email"
        communicationType: action, // Set communicationType to match action
      }

      console.log('Base newRow before template data:', newRow)

      // Add template information for email and SMS actions
      if (templateData) {
        console.log('Adding template data for action:', action)
        console.log('templateData received:', templateData)

        // Add all template data to the row
        Object.keys(templateData).forEach((key) => {
          if (templateData[key] !== undefined) {
            newRow[key] = templateData[key]
            console.log(`Setting newRow.${key} = ${templateData[key]}`)
          }
        })

        console.log('newRow after adding template data:', newRow)
      } else {
        console.log('No template data provided')
      }

      console.log('Final newRow:', newRow)

      return {
        ...prev,
        [index]: [...list, newRow],
      }
    })
  }

  const removeRow = (leadIndex, rowId) => {
    setRowsByIndex((prev) => ({
      ...prev,
      [leadIndex]: (prev[leadIndex] ?? []).filter((row) => row.id !== rowId),
    }))
  }

  const updateRow = (leadIndex, rowId, updatedData) => {
    console.log(
      `Updating row ${rowId} in stage ${leadIndex} with data:`,
      updatedData,
    )

    setRowsByIndex((prev) => {
      const updatedRows = {
        ...prev,
        [leadIndex]: (prev[leadIndex] ?? []).map((row) => {
          if (row.id === rowId) {
            const updatedRow = { ...row, ...updatedData }
            console.log('Updated row result:', updatedRow)
            return updatedRow
          }
          return row
        }),
      }

      console.log('Updated rowsByIndex state:', updatedRows)
      return updatedRows
    })
  }

  const printAssignedLeadsData = async () => {
    console.log('print clicked', assignedLeads)
    // return
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

    console.log('All Data ', allData)

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

    // //console.log;

    console.log('Cadence data storing on local storage is :', cadence)

    if (cadenceData) {
      localStorage.setItem('AddCadenceDetails', JSON.stringify(cadenceData))
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
    setOldStages(selectedItem.stages)
  }

  const handleSelectNextChange = (index, event) => {
    const selectedValue = event.target.value

    // Update the next stage for the specific index
    setNextStage((prev) => ({
      ...prev,
      [index]: selectedValue,
    }))

    // Find the selected item for the specific index
    const selectedItem = selectedPipelineStages.find(
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
    try {
      setReorderLoader(true)
      const updateStages = selectedPipelineStages.map((stage, index) => ({
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

  return (
    <div
      style={{ width: '100%' }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      {/* <AgentSelectSnackMessage isVisible={reorderSuccessBar == null || reorderSuccessBar == false ? false : true} hide={() => setReorderSuccessBar(null)} message={reorderSuccessBar} time={SnackbarTypes.Success} /> */}
      {isVisibleSnack && (
        <AgentSelectSnackMessage
          isVisible={isVisibleSnack === false ? false : true}
          hide={() => setIsVisibleSnack(false)}
          message={reorderSuccessBarMessage}
          type={snackType}
        />
      )}
      <div
        className="bg-white rounded-2xl w-10/12 h-[90vh] py-4 flex flex-col" //overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <div className="w-full flex-1 flex flex-col min-h-0">
          {/* header with title centered vertically */}
          <div className="relative w-full flex-shrink-0" style={{ minHeight: showOrb ? '140px' : '100px' }}>
            <Header />
            <div
              className="absolute left-1/2 md:text-4xl text-lg font-[700]"
              style={{
                top: showOrb ? 'calc(50% + 45px)' : '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 50,
                pointerEvents: 'none',
              }}
            >
              Pipeline and Stages
            </div>
          </div>
          {/* Body */}

          {/* Code for side video */}
          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle={
              getTutorialByType(HowToVideoTypes.CRMIntegration)?.title ||
              'Learn about pipeline and stages'
            }
            videoUrl={
              getVideoUrlByType(HowToVideoTypes.CRMIntegration) ||
              HowtoVideos.Pipeline
            }
          />

          <div
            className="-ml-4 lg:flex hidden  xl:w-[350px] lg:w-[350px]"
            style={{
              position: 'absolute',
              // left: "18%",
              // translate: "-50%",
              // left: "14%",
              top: '20%',
              // backgroundColor: "red"
            }}
          >
            <VideoCard
              duration={(() => {
                const tutorial = getTutorialByType(
                  HowToVideoTypes.CRMIntegration,
                )
                return tutorial?.description || '8:17'
              })()}
              horizontal={false}
              playVideo={() => {
                setIntroVideoModal(true)
              }}
              title={
                getTutorialByType(HowToVideoTypes.CRMIntegration)?.title ||
                'Learn about pipeline and stages'
              }
            />
          </div>

          <div 
            className="flex flex-col items-center px-4 w-full flex-1 min-h-0 overflow-hidden"
          >

            <div
              className={`w-8/12 gap-4 ml-[10vw] flex flex-col flex-1 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple ${showOrb ? 'mt-6' : 'mt-4'}`}
              style={{ scrollbarWidth: 'none', minHeight: 0 }}
            >
              {pipelinesDetails.length > 1 && (
                <div>
                  <div style={styles.headingStyle}>Select a pipeline</div>
                  <div className="border rounded-lg">
                    <Box className="w-full">
                      <FormControl className="w-full">
                        <Select
                          className="border-none rounded-lg outline-none"
                          displayEmpty
                          value={selectPipleLine}
                          onChange={handleSelectPipleLine}
                          renderValue={(selected) => {
                            if (selected === '') {
                              return <div>Select Pipeline</div>
                            }
                            return selected
                          }}
                          sx={{
                            ...styles.dropdownMenu,
                            backgroundColor: '#FFFFFF',
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            color: '#000000',
                          }}
                        >
                          {/* <MenuItem value="">
                                                        <div style={styles.dropdownMenu}>None</div>
                                                    </MenuItem> */}
                          {pipelinesDetails.map((item, index) => (
                            <MenuItem
                              key={item.id}
                              style={styles.dropdownMenu}
                              value={item.title}
                            >
                              {item.title}
                            </MenuItem>
                          ))}
                          {/* <MenuItem value={20}>03058191079</MenuItem>
                                        <MenuItem value={30}>03281575712</MenuItem> */}
                        </Select>
                      </FormControl>
                    </Box>
                  </div>
                </div>
              )}

              <div className="mt-4" style={styles.headingStyle}>
                Assign this agent to a stage
              </div>

              <div className="mt-2" style={styles.inputStyle}>
                {`This agent will call leads when they're added to the selected stage.`}
              </div>

              <PipelineStages
                stages={selectedPipelineStages}
                onUpdateOrder={(stages) => {
                  setSelectedPipelineStages(stages)
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
                setSnackType={setSnackType}
                onNewStageCreated={onNewStageCreated}
                handleReOrder={handleReorder}
              />

              {/* Reorder stage loader modal */}
              <Modal
                open={reorderLoader}
                closeAfterTransition
                BackdropProps={{
                  timeout: 100,
                  sx: {
                    backgroundColor: '#00000020',
                    // //backdropFilter: "blur(20px)",
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
                      weight=""
                      thickness={1}
                    />
                  </div>
                </Box>
              </Modal>

              {/* <div>
                                <button className='text-red text-lg font-bold' onClick={handleReorder}>
                                    Rearrange
                                </button>
                            </div> */}
            </div>
          </div>
        </div>
        <div className="w-full flex-shrink-0">
          <div>
            <ProgressBar value={33} />
          </div>

          <Footer
            handleContinue={printAssignedLeadsData}
            donotShowBack={true}
            registerLoader={createPipelineLoader}
            shouldContinue={shouldContinue}
          />
        </div>
      </div>
    </div>
  )
}

export default Pipeline1
