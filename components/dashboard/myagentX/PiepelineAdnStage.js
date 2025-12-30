import { CircularProgress } from '@mui/material'
import { ArrowUpRight, CaretDown, CaretUp } from '@phosphor-icons/react'
import axios from 'axios'
import { color } from 'framer-motion'
import { EditIcon, Router } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import { PersistanceKeys } from '@/constants/Constants'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import { UpdateCadenceConfirmationPopup } from './UpdateCadenceConfirmationPopup'

const PipelineAndStage = ({
  selectedAgent,
  UserPipeline,
  mainAgent,
  selectedUser,
  from,
}) => {
  const [message, setMessage] = useState(null)
  const router = useRouter()
  const [expandedStages, setExpandedStages] = useState([])
  const [StagesList, setStagesList] = useState([
    { id: 1, title: 's1', description: 'Testing the stage1' },
    { id: 2, title: 's2', description: 'Testing the stage2' },
    { id: 3, title: 's3', description: 'Testing the stage3' },
  ])

  const [agentCadence, setAgentCadence] = useState([])

  const [initialLoader, setInitialLoader] = useState(false)

  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false)

  useEffect(() => {
    if (selectedAgent.agentType !== 'inbound') {
      console.log('mainAgent', mainAgent)
      handleGetCadence()
    }
  }, [])

  //code for togeling stages seleciton
  const toggleStageDetails = (stage) => {
    // if (expandedStages.some((s) => s.id === stage.id)) {
    //     setExpandedStages(expandedStages.filter((s) => s.id !== stage.id));
    // } else {
    //     setExpandedStages([...expandedStages, stage]);
    // }
    setExpandedStages((prevIds) => {
      if (prevIds.includes(stage.cadence.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== stage.cadence.id)
      } else {
        // Select the item if it's not already selected
        return [...prevIds, stage.cadence.id]
      }
    })
  }

  //funciton to call get cadence api
  const handleGetCadence = async () => {
    try {
      setInitialLoader(true)

      let userDetails = null
      let AuthToken = null
      const localData = localStorage.getItem('User')

      const agentDataLocal = localStorage.getItem('agentDetails')

      if (localData) {
        const Data = JSON.parse(localData)
        userDetails = Data
        // //console.log;
        AuthToken = Data.token
      }

      // //console.log;

      const ApiData = {
        mainAgentId: selectedAgent.mainAgentId,
      }

      const formData = new FormData()
      formData.append('mainAgentId', selectedAgent.mainAgentId)

      const ApiPath = Apis.getAgentCadence

      // //console.log;
      // //console.log;
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        console.log('Response of get agent cadence api is:', response.data)
        setAgentCadence(response.data.data)
      }
    } catch (error) {
      // console.error("Error occured in get cadence api is:", error);
    } finally {
      setInitialLoader(false)
    }
  }

  const decideTextToShowForCadenceType = (cadence) => {
    if (cadence.communicationType === 'call') {
      return 'then Make Call'
    } else if (cadence.communicationType === 'email') {
      return 'then Send Email'
    } else if (cadence.communicationType === 'sms') {
      return 'then Send SMS'
    }
  }

  const styles = {
    paragraph: {
      fontWeight: '500',
      fontSize: 15,
    },
    paragraph2: {
      fontWeight: '400',
      fontSize: 14,
      color: '#00000080',
    },
  }

  const handleUpdateCadence = () => {

    localStorage.setItem('selectedUser', JSON.stringify(selectedUser))
    setShowConfirmationPopup(false)
    console.log('selectedAgent.id', selectedAgent.id)
    console.log('selectedAgent.mainAgentId', selectedAgent.mainAgentId)

    // Store agent details for pipeline update page
    if (mainAgent?.id) {
      localStorage.setItem('agentDetails', JSON.stringify({ id: mainAgent.id }))
    }

    // Store cadence data in the format expected by Pipeline1.js
    if (agentCadence.length > 0 && mainAgent?.pipeline?.id) {
      const cadenceDetails = agentCadence.map((stage) => ({
        stage: stage.cadence.stage?.id,
        calls: stage.calls.map((call) => ({
          id: call.id,
          waitTimeDays: call.waitTimeDays || 0,
          waitTimeHours: call.waitTimeHours || 0,
          waitTimeMinutes: call.waitTimeMinutes || 0,
          communicationType: call.communicationType || 'call',
          // Include template data if present
          ...(call.templateId && { templateId: call.templateId }),
          ...(call.templateName && { templateName: call.templateName }),
          ...(call.subject && { subject: call.subject }),
          ...(call.content && { content: call.content }),
          // Include smsPhoneNumberId for SMS cadence calls
          ...(call.smsPhoneNumberId && { smsPhoneNumberId: call.smsPhoneNumberId }),
          // Include emailAccountId for email cadence calls (for consistency)
          ...(call.emailAccountId && { emailAccountId: call.emailAccountId }),
        })),
        moveToStage: stage.cadence.moveToStage?.id || null,
      }))

      const cadenceData = {
        pipelineID: mainAgent.pipeline.id,
        cadenceDetails: cadenceDetails,
      }

      localStorage.setItem('AddCadenceDetails', JSON.stringify(cadenceData))
      console.log('Stored cadence data for pipeline update:', cadenceData)
    }
    else {
      //clear AddCadenceDetails from local storage
      localStorage.removeItem('AddCadenceDetails')
      console.log('Cleared AddCadenceDetails from local storage')
    }

    if (selectedUser) {
      // Helper function to check if user is admin or agency
      const isAdminOrAgency = () => {
        if (typeof window === 'undefined') return false
        try {
          const userData = localStorage.getItem('User')
          if (userData) {
            const parsedUser = JSON.parse(userData)
            const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
            const userType = parsedUser?.user?.userType || parsedUser?.userType
            return userRole === 'Admin' || userType === 'admin' || userRole === 'Agency'
          }
        } catch (error) {
          console.error('Error checking user role:', error)
        }
        return false
      }

      // Read existing state object (may already have restoreState from tab/agent selection)
      let existingData = null
      try {
        const storedData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency)
        if (storedData) {
          existingData = JSON.parse(storedData)
          console.log('existingData is', existingData)
        }
      } catch (error) {
        console.error('Error reading existing state:', error)
      }

      let u = {
        subAccountData: selectedUser,
        isFrom: from,
      }

      // If user is admin/agency, add/update restoreState with selectedUserId
      if (isAdminOrAgency()) {
        if (!u.restoreState) {
          u.restoreState = {}
        }
        // Preserve existing restoreState if it exists
        if (existingData?.restoreState) {
          u.restoreState = {
            ...existingData.restoreState,
            selectedUserId: selectedUser.id,
          }
        } else {
          u.restoreState = {
            selectedUserId: selectedUser.id,
            selectedTabName: null,
            selectedAgentId: null,
          }
        }
      }

      localStorage.setItem(
        PersistanceKeys.isFromAdminOrAgency,
        JSON.stringify(u),
      )
    }
    // router.push("/pipeline/update");
    window.location.href = '/pipeline/update'
  }

  return (
    <div>
      <AgentSelectSnackMessage
        type={message?.type}
        isVisible={message != null}
        message={message?.message}
        hide={() => setMessage(null)}
      />
      <div className="w-full flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <p
            style={{
              ...styles.paragraph,
              color: '#00000080',
            }}
          >
            Assigned Pipeline
          </p>
          {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
        </div>
        <div style={styles.paragraph}>
          {mainAgent?.pipeline?.title ? mainAgent?.pipeline?.title : '-'}
        </div>
      </div>

      {/* {selectedAgent?.agentType !== "inbound" && ( */}
      <div className="w-full">
        <div className="flex flex-row justify-between items-center mt-4">
          <div className="" style={{ fontWeight: '700', fontSize: 16.8 }}>
            Stages
          </div>

          <button
            className="flex flex-row items-center gap-2 h-[35px] rounded-md bg-brand-primary text-white px-4"
            style={{
              fontWeight: '500',
              fontSize: 15,
            }}
            onClick={() => {
              handleUpdateCadence()
            }}
          >
            Update
            <EditIcon size={20} color="white" />
          </button>
        </div>
        <UpdateCadenceConfirmationPopup
          showConfirmationPopuup={showConfirmationPopup}
          setShowConfirmationPopup={setShowConfirmationPopup}
          onContinue={() => {
            handleUpdateCadence()
          }}
        />
        {initialLoader ? (
          <div className="w-full flex flex-row items-center justify-center">
            <CircularProgress size={25} />
          </div>
        ) : (
          <div>
            {agentCadence.map((stage, index) => (
              <div key={index} className="mt-4">
                <div
                  style={{
                    border: '1px solid #00000020',
                    borderRadius: '8px',
                    padding: 15,
                  }}
                >
                  <button
                    onClick={() => toggleStageDetails(stage)}
                    className="w-full flex flex-row items-center justify-between"
                  >
                    <div>{stage?.cadence?.stage?.stageTitle || '-'}</div>
                    <div>
                      <div>
                        {expandedStages.includes(stage?.cadence?.id) ? (
                          <CaretUp size={20} weight="bold" />
                        ) : (
                          <CaretDown size={20} weight="bold" />
                        )}
                      </div>
                    </div>
                  </button>
                  {expandedStages.includes(stage?.cadence?.id) && (
                    <div
                      style={{
                        border: '1px solid #00000020',
                        borderRadius: '5px',
                        padding: 10,
                        marginTop: 15,
                      }}
                    >
                      <div
                        className="flex flex-row items-center gap-8 pl-20"
                        style={styles.paragraph2}
                      >
                        <div className="text-center">Days</div>
                        <div className="text-center">Hours</div>
                        <div className="text-center">Mins</div>
                      </div>

                      {stage.calls.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className="flex flex-col gap-2 items-ceter mt-2"
                          >
                            <div
                              className="flex flex-row items-center gap-4"
                              style={styles.paragraph}
                            >
                              <div>Wait</div>
                              <div
                                className="flex flex-row items-center w-[240px]"
                                style={{ color: '#00000070' }}
                              >
                                <div
                                  className="text-center"
                                  style={{
                                    width: '33%',
                                    border: '1px solid #00000020',
                                    borderTopLeftRadius: '7px',
                                    borderBottomLeftRadius: '7px',
                                    padding: 5,
                                  }}
                                >
                                  {item.waitTimeDays}
                                </div>
                                <div
                                  className="text-center"
                                  style={{
                                    width: '33%',
                                    borderBottom: '1px solid #00000020',
                                    borderTop: '1px solid #00000020',
                                    padding: 5,
                                  }}
                                >
                                  {item.waitTimeHours}
                                </div>
                                <div
                                  className="text-center"
                                  style={{
                                    width: '33%',
                                    border: '1px solid #00000020',
                                    borderTopRightRadius: '7px',
                                    borderBottomRightRadius: '7px',
                                    padding: 5,
                                  }}
                                >
                                  {item.waitTimeMinutes}
                                </div>
                              </div>
                              <div>
                                , {decideTextToShowForCadenceType(item)}
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      <div className="flex flex-row items-center gap-2 mt-4">
                        <p style={styles.paragraph}>Then move to</p>
                        <div
                          className="py-1 text-center px-2 flex flex-col justify-center"
                          style={{
                            width: 'fit-centent',
                            backgroundColor: '#15151520',
                            fontWeight: '500',
                            fontSize: 15,
                            height: '33px',
                            borderRadius: '7px',
                            border: '1px solid #00000010',
                          }}
                        >
                          {stage?.cadence?.moveToStage?.stageTitle ||
                            'No stage selected'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* )} */}
    </div>
  )
}

export default PipelineAndStage
