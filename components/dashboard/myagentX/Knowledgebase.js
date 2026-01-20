import { AddCircleRounded } from '@mui/icons-material'
import axios from 'axios'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import KnowledgeBaseList from '@/components/admin/dashboard/KnowledgebaseList'
import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'
import UpgardView from '@/constants/UpgardView'
import UpgradeModal from '@/constants/UpgradeModal'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
// Ensure Image is imported correctly
import AddKnowledgeBaseModal from './AddKnowledgebaseModal'

function Knowledgebase({ user, agent }) {
  const [kb, setKb] = useState([])
  const [showKbPopup, setShowKbPopup] = useState(false)
  const [kbDelLoader, setKbDelLoader] = useState(null)
  const [showAddNewCalendar, setShowAddNewCalendar] = useState(false) // Fixed missing state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showSnackMsg, setShowSnackMsg] = useState({
    type: SnackbarTypes.Success,
    message: '',
    isVisible: false,
  })

  // console.log('user in kb file', user)

  useEffect(() => {
    GetKnowledgebase()
  }, [showKbPopup])

  //Api calls

  async function GetKnowledgebase() {
    try {
      const token = AuthToken() // Extract JWT token

      // let link = `/api/kb/getkb?agentId=${agent.id}`;
      let link = `${Apis.GetKnowledgebase}?agentId=${agent.id}`
      // //console.log

      const response = await fetch(link, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setKb(data.data)
      } else {
        console.error('Failed to fetch kb:', data.error)
      }
    } catch (error) {
      console.error('Error fetching kb:', error)
    }
  }

  //all actions UI Related
  function addKnowledgebase() {
    setShowKbPopup(true)
  }

  function GetNoKbView() {
    // Use backend-provided flags
    const planCapabilities = user?.planCapabilities || {}
    const shouldShowUpgrade = planCapabilities.shouldShowAllowKnowledgeBaseUpgrade === true
    const shouldShowRequestFeature = planCapabilities.shouldShowKnowledgeBaseRequestFeature === true
    
    if (shouldShowUpgrade || shouldShowRequestFeature) {
      return (
        <UpgardView
          setShowSnackMsg={setShowSnackMsg}
          title={'Add Knowledge Base'}
          subTitle={
            'Upgrade to teach your AI agent on your own custom data. You can add Youtube videos, website links, documents and more.'
          }
          selectedUser={user}
        />
      )
    } else
      return (
        <div className="flex flex-col items-center justify-center mt-5   p-8 ">
          <div className="flex flex-col w-[100%] items-center justify-center mt-2 gap-4 p-2 rounded-lg">
            <img
              src={'/assets/nokb.png'}
              className=" object-fill "
              style={{ height: 97, width: 130 }}
              alt="No Knowledgebase"
            />

            <div
              className="text-lg font-semibold text-gray-900 italic"
              style={{}}
            >
              No knowledge base added
            </div>

            <button
              className="flex flex-row h-[54px] items-center gap-2 bg-brand-primary p-2 px-8 rounded-lg"
              onClick={() => {
                if (
                  user?.planCapabilities.maxKnowledgeBases >
                  user?.currentUsage.maxKnowledgeBases
                ) {
                  addKnowledgebase()
                } else {
                  setShowUpgradeModal(true)
                }
              }}
            >
              <Plus color="white"></Plus>
              <div
                className="flex items-center justify-center  text-black text-white font-medium"
                // Fixed typo
              >
                Add New
              </div>
            </button>
          </div>
        </div>
      )
  }

  async function handleDeleteKb(item) {
    //console.log
    try {
      setKbDelLoader(item.id)
      const token = AuthToken() // Extract JWT token
      setKb((prevKb) => prevKb.filter((kbItem) => kbItem.id !== item.id))

      let link = `${Apis.deleteKnowledgebase}`
      //console.log

      let apidata = {
        kbId: item.id,
        agentId: agent.id,
      }
      //console.log

      const response = await axios.post(link, apidata, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data) {
        //console.log;
      } else {
        console.error('Failed to delete kb:', data.error)
      }
    } catch (error) {
      console.error('Error fetching kb:', error)
    } finally {
      setKbDelLoader(null)
    }
  }
  function GetKbView() {
    return (
      <KnowledgeBaseList
        // agent={agent}
        kbList={kb}
        onDelete={(item) => {
          if (
            user?.planCapabilities.maxKnowledgeBases >
            user?.currentUsage.maxKnowledgeBases
          ) {
            handleDeleteKb(item)
          } else {
            setShowUpgradeModal(true)
          }
        }}
        onAddKnowledge={() => {
          setShowKbPopup(true)
        }}
        isLoading={kbDelLoader}
      />
    )
  }

  function GetViewToRender() {
    if (kb.length === 0) {
      // Use strict equality (===)
      return GetNoKbView()
    }
    return GetKbView()
  }

  return (
    <div>
      <AgentSelectSnackMessage
        message={showSnackMsg.message}
        type={showSnackMsg.type}
        isVisible={showSnackMsg.isVisible}
        hide={() =>
          setShowSnackMsg({ type: null, message: '', isVisible: false })
        }
      />
      <AddKnowledgeBaseModal
        user={user}
        agent={agent}
        open={showKbPopup}
        onClose={() => setShowKbPopup(false)}
      />
      {GetViewToRender()}

      <UpgradeModal
        open={showUpgradeModal}
        handleClose={() => {
          setShowUpgradeModal(false)
        }}
        title={"You've Hit Your knowledgebase Limit"}
        subTitle={'Upgrade to add more knowledgebase'}
        buttonTitle={'No Thanks'}
      />
    </div>
  )
}

export default Knowledgebase
