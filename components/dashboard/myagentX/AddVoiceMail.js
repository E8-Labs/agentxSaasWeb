import CloseIcon from '@mui/icons-material/Close'
import { Box, CircularProgress, Modal } from '@mui/material'
import { PauseCircle, PlayCircle } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import Apis from '@/components/apis/Apis'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { PromptTagInput } from '@/components/pipeline/tagInputs/PromptTagInput'
import { PersistanceKeys } from '@/constants/Constants'
import { UserTypes } from '@/constants/UserTypes'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'

function AddVoiceMail({
  showAddNewPopup,
  setShowAddNewPopup,
  addVoiceMail,
  loading,
  showMessage,
  setShowMessage,
  messageType,
  kycsData,
  uniqueColumns,
}) {
  const manue = [
    {
      id: 1,
      name: 'Real Estate',
      type: UserTypes.RealEstateAgent,
    },
    {
      id: 2,
      name: 'Solar',
      type: UserTypes.SolarRep,
    },
    {
      id: 3,
      name: 'Insurance Agent',
      type: UserTypes.InsuranceAgent,
    },
    {
      id: 4,
      name: 'Loan Officer',
      type: UserTypes.LoanOfficerAgent,
    },
    {
      id: 5,
      name: 'SDR/BDR Agent',
      type: UserTypes.SalesDevRep,
    },
    {
      id: 6,
      name: 'Marketing',
      type: UserTypes.MarketerAgent,
    },
    {
      id: 7,
      name: 'Other',
      type: 'other',
    },
  ]

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
      voice_id: 'NmfK18brFwCqDBtJ04tW',
      preview: '/voicesList/Axel.MP3',
    },
  ]

  let m = `Hey, this is Sam. Just wanted to let you know your neighbor recently switched to solar and is saving big. Curious if you'd like to see how much you could save? Call me back at [your number]!`

  const [selectedManu, setSelectedManu] = useState(manue[0])
  const [selectedVoice, setSelectedVoice] = useState(voices[0].voice_id)
  const [audio, setAudio] = useState(false)
  const [preview, setPreview] = useState(false)
  const [message, setMessage] = useState(m)

  useEffect(() => {
    if (selectedManu.name === 'Solar') {
      m = `Hey, this is Sam. Just wanted to let you know your neighbor recently switched to solar and is saving big. Curious if you'd like to see how much you could save? Call me back at [your number]!`
    } else if (selectedManu.name === 'Real Estate') {
      m = `Hey, this is Sarah. I helped a homeowner list their property, and there's been interest in the area. If want to know what your home's worth, give me a call at [Your Number]. Would love to chat.`
    } else if (selectedManu.name === 'Insurance Agent') {
      m = `Hi, this is Lisa. I noticed some homeowners in your area updated their coverage and lowered their rates. Let's check if you're eligible too! Call me back at [your number]. Talk soon!`
    } else if (selectedManu.name === 'Loan Officer') {
      m = `Hey, this is Mike. Rates have recently dropped, and I wanted to see if you'd like to explore refinancing or a new loan option. It could mean big savings! Call me at [your number] to chat!`
    } else if (selectedManu.name === 'SDR/BDR Agent') {
      m = `Hey, this is Alex. I work with companies like yours to help streamline [specific pain point]. I'd love to share how we're making a big impact. Call me back at [your number] — talk soon!`
    } else if (selectedManu.name === 'Marketing') {
      m = `Hey, this is Jamie. I saw you filled out our form on Facebook — thanks! I'd love to chat more about how we can help with [specific service/product]. Call me back at [your number]!`
    } else if (selectedManu.name === 'Other') {
      m = ``
    } else {
      m = ``
    }

    setMessage(m)
  }, [selectedManu])

  const handleToggleClick = (item) => {
    setSelectedVoice(item.voice_id)
  }

  const playVoice = (url) => {
    // console.log('audio', audio)
    if (audio) {
      audio.pause()
    }
    const ad = new Audio(url) // Create a new Audio object with the preview URL
    ad.play()
    setAudio(ad) // Play the audio
  }
  return (
    <div>
      <Modal
        open={showAddNewPopup}
        onClose={() => setShowAddNewPopup(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: {
            backgroundColor: '#00000099',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: 600,
            bgcolor: 'white',
            borderRadius: 3,
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <AgentSelectSnackMessage
            isVisible={showMessage != null}
            message={showMessage}
            type={messageType}
            hide={() => {
              setShowMessage(null)
            }}
          />

          {/* Header */}
          <div className="flex flex-row items-center justify-between px-4 py-3 border-b">
            <div className="text-[16px] font-semibold text-black/90">
              New Voicemail
            </div>
            <CloseBtn
              onClick={() => {
                setShowAddNewPopup(false)
              }}
            />
          </div>

          {/* Body */}
          <div className="flex flex-col gap-4 px-4 py-4 max-h-[60vh] overflow-auto">
            <div className="text-[14px] font-semibold text-black/90">
              Select From Template
            </div>

            <div
              className="w-full flex-row flex items-center gap-3 h-[100px] overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {manue.map((item) => (
                <button
                  key={item.id}
                  onClick={() =>
                    setSelectedManu(item === selectedManu ? '' : item)
                  }
                >
                  <div
                    className="px-4 py-2 border-2 rounded-[8px] text-sm font-medium whitespace-nowrap"
                    style={{
                      borderColor:
                        selectedManu?.id === item.id ? '#7902df' : '#15151510',
                    }}
                  >
                    {item.name}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-row w-full items-center justify-between">
              <div className="flex flex-row items-center gap-2">
                <div className="text-[14px] font-medium">Voicemail</div>
              </div>

              <button onClick={() => setMessage('')}>
                <div className="text-[14px] font-medium text-purple underline">
                  Clear
                </div>
              </button>
            </div>

            <div className="mt-2 w-full">
              <PromptTagInput
                promptTag={message}
                kycsList={kycsData}
                uniqueColumns={uniqueColumns}
                tagValue={setMessage}
                showSaveChangesBtn={message}
                from={'Voicemail'}
                isEdit={false}
                saveUpdates={async () => {}}
                limit={200}
              />
            </div>

            <div className="text-[15px] font-medium text-black/60 -mt-1">
              {message?.length}/200
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-row items-center justify-end px-4 py-3 border-t">
            {loading ? (
              <CircularProgress size={25} />
            ) : (
              <button
                className="inline-flex h-10 px-5 items-center justify-center rounded-[8px] bg-brand-primary text-[14px] font-semibold text-white shadow-sm transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                onClick={() => {
                  const data = {
                    message,
                    agentType: selectedManu.type,
                  }
                  addVoiceMail(data)
                }}
              >
                Save
              </button>
            )}
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default AddVoiceMail

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
