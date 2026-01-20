import { Box, Modal } from '@mui/material'
import { PauseCircle, PlayCircle } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import getProfileDetails from '@/components/apis/GetProfile'
import { getUserLocalData } from '@/components/constants/constants'
import voicesList from '@/components/createagent/Voices'
import { PersistanceKeys } from '@/constants/Constants'
import UpgardView from '@/constants/UpgardView'
import UpgradeModal from '@/constants/UpgradeModal'
import { getAgentsListImage } from '@/utilities/agentUtilities'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import AddVoiceMail from './AddVoiceMail'
import EditVoicemailModal from './EditVoicemailModal'
import NoVoicemailView from './NoVoicemailView'

function VoiceMailTab({
  agent,
  setShowDrawerSelectedAgent,
  setMainAgentsList,
  kycsData,
  uniqueColumns,
  selectedUser = null,
}) {
  const [showAddNewPopup, setShowAddNewPopup] = useState(false)
  // console.log('agent', agent)

  const [audio, setAudio] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [showMessage, setShowMessage] = useState(null)
  const [messageType, setMessageType] = useState(null)
  const [showEditPopup, setShowEditPopup] = useState(false)

  const [user, setUser] = useState(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  useEffect(() => {
    if (selectedUser) {
      setUser(selectedUser)
    } else {
      let data = getUserLocalData()
      setUser(data.user)
    }
  }, [selectedUser])

  const playVoice = (url) => {
    // console.log('url', url)
    if (isPlaying) {
      audio.pause()
      audio.currentTime = 0 // Reset to the start
    }

    const ad = new Audio(url)
    ad.play()
      .then(() => {
        setIsPlaying(true)
        setAudio(ad)
      })
      .catch((error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      })

    ad.onended = () => {
      setIsPlaying(false)
    }
  }

  const voices = [
    {
      id: 1,
      name: 'Ava',
      voice_id: 'SJzBm6fWJCplrpPNzyCV',
      preview: '/voicesList/Ava.MP3',
    },
    {
      id: 2,
      name: 'Axel',
      voice_id: 'NmfK18brFwCqDBtJ04tW', //Pvvx65MwYBsyOsxiwygJ
      preview: '/voicesList/Axel.MP3',
    },
  ]

  const saveVoiceMail = async (data) => {
    // if (!data.voiceId) {
    //   setShowMessage("Select a voice")
    //   setMessageType(SnackbarTypes.Error)
    //   return
    // }
    if (!data.message) {
      setShowMessage('Enter voicemail')
      setMessageType(SnackbarTypes.Error)
      return
    }
    setLoading(true)
    try {
      const d = localStorage.getItem('User')

      if (d) {
        let u = JSON.parse(d)

        let apidata = {
          message: data.message,
          agentType: data.agentType,
          voice: data.voiceId,
          agentId: agent.id,
        }
        if (selectedUser) {
          apidata.userId = selectedUser.id
        }
        let response = await axios.post(Apis.setVoicemaeil, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          // console.log('response of set voicemail api is', response.data)
          if (response.data.status === true) {
            setShowMessage(response.data.message)
            setMessageType(SnackbarTypes.Success)

            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain,
            )

            let agentsListDetails = []

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList)
              // agentsListDetails = agentsList;
              agent.voicemail = response.data.data

              const updatedArray = agentsList.map((localItem) => {
                const updatedAgents = localItem.agents.map((item) => {
                  return agent.id === item.id ? { ...item, ...agent } : item
                })

                return { ...localItem, agents: updatedAgents }
              })

              // let updatedSubAgent = nul

              setShowDrawerSelectedAgent(agent)

              //// //console.log;
              // console.log('updateAgentData', agent)
              // console.log('updatedArray', updatedArray)
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray),
              )
              setMainAgentsList(updatedArray)
            }

            setShowAddNewPopup(false)
          } else {
            setShowMessage(response.data.message)
            setMessageType(SnackbarTypes.Error)
          }
        }
      }
    } catch (e) {
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const updateVoicemail = async (data) => {
    // if (!data.voiceId) {
    //   setShowMessage("Select a voice")
    //   setMessageType(SnackbarTypes.Error)
    //   return
    // }
    if (!data.message) {
      setShowMessage('Enter voicemail')
      setMessageType(SnackbarTypes.Error)
      return
    }
    setLoading2(true)
    try {
      const d = localStorage.getItem('User')

      if (d) {
        let u = JSON.parse(d)

        let apidata = {
          message: data.message,
          voicemailId: agent.voicemail.id,
          voice: data.voiceId,
          agentId: agent.id,
        }
        let response = await axios.post(Apis.updateVoicemail, apidata, {
          headers: {
            Authorization: 'Bearer ' + u.token,
          },
        })

        if (response.data) {
          // console.log('response of set voicemail api is', response.data)
          if (response.data.status === true) {
            setShowMessage(response.data.message)
            setMessageType(SnackbarTypes.Success)

            const localAgentsList = localStorage.getItem(
              PersistanceKeys.LocalStoredAgentsListMain,
            )

            let agentsListDetails = []

            if (localAgentsList) {
              const agentsList = JSON.parse(localAgentsList)
              // agentsListDetails = agentsList;
              agent.voicemail = response.data.data

              const updatedArray = agentsList.map((localItem) => {
                const updatedAgents = localItem.agents.map((item) => {
                  return agent.id === item.id ? { ...item, ...agent } : item
                })

                return { ...localItem, agents: updatedAgents }
              })

              // let updatedSubAgent = nul

              setShowDrawerSelectedAgent(agent)

              //// //console.log;
              // console.log('updateAgentData', agent)
              // console.log('updatedArray', updatedArray)
              localStorage.setItem(
                PersistanceKeys.LocalStoredAgentsListMain,
                JSON.stringify(updatedArray),
              )
              setMainAgentsList(updatedArray)
            }

            setShowEditPopup(false)
          } else {
            setShowMessage(response.data.message)
            setMessageType(SnackbarTypes.Error)
          }
        }
      }
    } catch (e) {
      setLoading2(false)
    } finally {
      setLoading2(false)
    }
  }

  const getVoiceName = (voiceId) => {
    let voice = voices.filter((item) => item.voice_id == voiceId)
    if (voice.length > 0) {
      return voice[0].name
    } else {
      return 'Ava'
    }
  }

  return (
    <div>
      <AgentSelectSnackMessage
        isVisible={
          showMessage != null && !showAddNewPopup && !showEditPopup
            ? true
            : false
        }
        message={showMessage}
        type={messageType}
        hide={() => {
          setShowMessage(null)
        }}
      />
      <AgentSelectSnackMessage
        message={showSnackMsg.message}
        type={showSnackMsg.type}
        isVisible={showSnackMsg.isVisible}
        hide={() =>
          setShowSnackMsg({ type: null, message: '', isVisible: false })
        }
      />
      {agent?.voicemail == null ? (
        (() => {
          // Use backend-provided flags
          const planCapabilities = user?.planCapabilities || {}
          const shouldShowUpgrade = planCapabilities.shouldShowAllowVoicemailUpgrade === true
          const shouldShowRequestFeature = planCapabilities.shouldShowVoicemailRequestFeature === true
          
          if (shouldShowUpgrade || shouldShowRequestFeature) {
            return (
              <UpgardView
                title={'Enable Voicemail'}
                subTitle={
                  'Increase response rate by 10% when you activate voicemails. Your AI can customize each voicemail.'
                }
                setShowSnackMsg={setShowSnackMsg}
                selectedUser={selectedUser}
              />
            )
          } else {
            return (
              <NoVoicemailView
                openModal={() => {
                  if (user?.planCapabilities?.allowVoicemail === true || user?.planCapabilities?.allowVoicemailSettings === true) {
                    setShowAddNewPopup(true)
                  } else {
                    setShowUpgradeModal(true)
                  }
                }}
                showAddBtn={true}
              />
            )
          }
        })()
      ) : (
        <div className="w-full flex flex-col gap-3 items-center">
          <div className="w-full flex flex-row items-center justify-between mt-2">
            <div style={{ fontSize: 22, fontWeight: '700' }}>Voicemail</div>

            <button
              onClick={() => {
                setShowEditPopup(true)
              }}
            >
              <Image
                src={'/svgIcons/editIconPurple.svg'}
                height={24}
                width={24}
                alt="*"
              />
            </button>
          </div>

          <div
            className="w-full"
            style={{
              fontSize: 14,
              fontWeight: '500',
            }}
          >
            {agent.voicemail?.message}
          </div>
          {/* <div className='w-full flex flex-row items-center justify-between mt-2'>
              <div style={{ fontSize: 15, fontWeight: '500' }}>
                Voice
              </div>

              <div className='flex flex-row items-center'>

                <div className='text-brand-primary' style={{ fontSize: 15, fontWeight: '500' }}>
                  {getVoiceName(agent?.voicemail.voiceId)}
                </div>

                <div className='ml-2'>
                  {isPlaying ? (
                    <div
                      onClick={() => {
                        if (audio) {
                          audio.pause();
                          setIsPlaying(false)

                        }
                      }}
                    >
                      <PauseCircle size={38} weight="regular" />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        let preview = voices.filter((item) => item.voice_id == agent?.voicemail.voiceId)
                        // console.log('preview', preview)
                        playVoice(preview[0].preview);
                      }}


                    >
                      <Image
                        src={"/assets/play.png"}
                        height={25}
                        width={25}
                        alt="*"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div> */}
        </div>
      )}
      {showAddNewPopup && (
        <AddVoiceMail
          showAddNewPopup={showAddNewPopup}
          setShowAddNewPopup={setShowAddNewPopup}
          agent={agent}
          addVoiceMail={(data) => saveVoiceMail(data)}
          loading={loading}
          showMessage={showMessage}
          setShowMessage={setShowMessage}
          messageType={messageType}
          kycsData={kycsData}
          uniqueColumns={uniqueColumns}
        />
      )}

      <EditVoicemailModal
        showEditPopup={showEditPopup}
        setShowEditPopup={setShowEditPopup}
        updateVoicemail={(data) => updateVoicemail(data)}
        agent={agent}
        loading={loading2}
        defaultData={agent?.voicemail}
        showMessage={showMessage}
        setShowMessage={setShowMessage}
        messageType={messageType}
        kycsData={kycsData}
        uniqueColumns={uniqueColumns}
      />

      <UpgradeModal
        open={showUpgradeModal}
        handleClose={() => {
          setShowUpgradeModal(false)
        }}
        title={'Unlock voicemail'}
        subTitle={'Upgrade to unlock voice mail feature'}
        buttonTitle={'No Thanks'}
      />
    </div>
  )
}

export default VoiceMailTab

const styles = {
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}
