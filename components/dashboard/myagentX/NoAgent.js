import { Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../leads/AgentSelectSnackMessage'
import { PersistanceKeys } from '@/constants/Constants'
import { useUser } from '@/hooks/redux-hooks'

function NoAgent({
  showBtn = true,
  title = 'You have no active agents',
  selectedUser,
  from,
}) {
  //show snack
  const [showSnack, setShowSnack] = useState({
    type: SnackbarTypes.Error,
    message: '',
    isVisible: false,
  })

  const router = useRouter()
  const { user: reduxUser } = useUser()

  const handleAddNewAgent = () => {
    if (selectedUser) {
      if (selectedUser?.plan) {
        const data = {
          status: true,
        }
        localStorage.setItem('fromDashboard', JSON.stringify(data))
        
        // Check if current logged-in user is Admin or Agency
        let isAdminOrAgency = false
        
        // Check from Redux first
        if (reduxUser) {
          const userType = reduxUser?.userType
          const userRole = reduxUser?.userRole
          isAdminOrAgency = userType === 'admin' || userRole === 'Agency'
        }
        
        // Fallback to localStorage if Redux doesn't have the data
        if (!isAdminOrAgency && typeof window !== 'undefined') {
          try {
            const localUserData = localStorage.getItem('User')
            if (localUserData) {
              const parsedUser = JSON.parse(localUserData)
              const userType = parsedUser?.user?.userType || parsedUser?.userType
              const userRole = parsedUser?.user?.userRole || parsedUser?.userRole
              isAdminOrAgency = userType === 'admin' || userRole === 'Agency'
            }
          } catch (error) {}
        }
        
        // If coming from admin/agency or current user is admin/agency, save context and return URL
        const fromLower = from?.toLowerCase()
        if (isAdminOrAgency || fromLower === 'admin' || fromLower === 'agency') {
          // Determine if it's from agency
          let isFromAgencyValue = false
          if (fromLower === 'agency') {
            isFromAgencyValue = true
          } else if (isAdminOrAgency) {
            // Check if current logged-in user is Agency (not Admin)
            const currentUserRole = reduxUser?.userRole || (typeof window !== 'undefined' && localStorage.getItem('User') ? JSON.parse(localStorage.getItem('User'))?.user?.userRole : null)
            isFromAgencyValue = currentUserRole === 'Agency'
          }

          const d = {
            subAccountData: selectedUser,
            isFromAgency: isFromAgencyValue,
          }
          localStorage.setItem(
            PersistanceKeys.isFromAdminOrAgency,
            JSON.stringify(d),
          )

          // Save current URL for redirect after agent creation
          if (typeof window !== 'undefined') {
            const currentUrl = window.location.href
            localStorage.setItem(
              PersistanceKeys.returnUrlAfterAgentCreation,
              currentUrl,
            )
          }

          window.open('/createagent', '_blank')
        } else {
          window.location.href = '/createagent'
        }
      } else {
        setShowSnack({
          type: SnackbarTypes.Error,
          message: 'User has no plan subscribed',
          isVisible: true,
        })
      }
    } else {
      const data = {
        status: true,
      }
      localStorage.setItem('fromDashboard', JSON.stringify(data))
      // router.push("/createagent");
      window.location.href = '/createagent'
    }
  }

  return (
    <div
      className="flex flex-col items-center w-full h-full overflow-x-hidden overflow-y-hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      <AgentSelectSnackMessage
        type={showSnack.type}
        message={showSnack.message}
        isVisible={showSnack.isVisible}
        hide={() => {
          setShowSnack({
            message: '',
            isVisible: false,
            type: SnackbarTypes.Error,
          })
        }}
      />
      <Image
        className=""
        alt="No img"
        src={'/agencyIcons/noAgents.jpg'}
        height={from === 'Admin' ? 200 : 600}
        width={from === 'Admin' ? 400 : 600}
      />

      <div
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: 'black',
          lineHeight: 1,
          marginTop: -80,
        }}
      >
        {title}
      </div>
      {showBtn && (
        <button
          className="flex h-[54px] items-center flex-row gap-2 bg-brand-primary p-2 px-8 rounded-lg mt-6"
          onClick={() => {
            handleAddNewAgent()
          }}
          // href="/createagent"
        >
          <Plus color="white"></Plus>
          <div
            className="flex items-center justify-center  text-black text-white font-medium"
            // Fixed typo
          >
            Add New Agent
          </div>
        </button>
      )}
    </div>
  )
}

export default NoAgent
