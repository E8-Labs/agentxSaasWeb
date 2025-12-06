import React, { useEffect, useState } from 'react'

import Integrations from '@/components/agency/integrations/Integrations'
import ConnectStripe from '@/components/agency/stripe/ConnectStripe'
import getProfileDetails from '@/components/apis/GetProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { useUser } from '@/hooks/redux-hooks'

function AgencyIntegrations({ selectedAgency, initialTab = 1 }) {
  const [currentTab, setCurrentTab] = useState(initialTab)

  // Sync tab state when initialTab prop changes
  useEffect(() => {
    setCurrentTab(initialTab)
  }, [initialTab])

  const { user: reduxUser, setUser: setReduxUser } = useUser()

  const refreshUserData = async () => {
    console.log('🔄 REFRESH USER DATA STARTED')
    try {
      console.log('🔄 Calling getProfileDetails...')
      const profileResponse = await getProfileDetails()
      console.log('🔄 getProfileDetails response:', profileResponse)

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        // console.log('🔄 [CREATE-AGENT] Fresh user data received after upgrade');

        // Update Redux and localStorage with fresh data
        console.log('updating redux user', freshUserData)
        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }

        setReduxUser(updatedUserData)

        // Update local state as well
        // setUserLocalData(updatedUserData);

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [CREATE-AGENT] Error refreshing user data:', error)
      return false
    }
  }

  const tabs = [
    {
      id: 1,
      tab: 'Twilio',
    },
    {
      id: 2,
      tab: 'Stripe',
    },
  ]

  //handle switch tab
  const handleTabSelection = (tab) => {
    setCurrentTab(tab)
  }

  return (
    <div
      className="flex flex-col items-center w-full h-[100svh] overflow-hidden"
      // style={{
      //     backgroundImage: "url('/agencyIcons/DreamySilkWaves.png')",
      //     backgroundSize: "cover",
      //     backgroundPosition: "center",
      //     height: "100svh",
      //     width: "100%"
      // }}
    >
      <div className="flex w-full flex-row items-center justify-between px-5 py-5 border-b">
        <div
          style={{
            fontSize: 22,
            fontWeight: '700',
          }}
        >
          Integrations
        </div>

        <div className="flex flex-row items-center gap-2">
          <NotficationsDrawer />
        </div>
      </div>

      <div className="w-full flex flex-row justify-center items-center">
        <div className="w-full flex flex-row items-center justify-between pt-6 px-4">
          {/*
                        <div className="flex flex-row items-center gap-4">
                            <button
                                className={`${currentTab === 1 ? "border-purple" : "border-black"} border rounded-full px-4 py-1 outline-none`}
                                onClick={() => { handleTabSelection(1) }}
                            >
                                Twilio
                            </button>
                            <button
                                className={`${currentTab === 2 ? "border-purple" : "border-black"} border rounded-full px-4 py-1 outline-none`}
                                onClick={() => { handleTabSelection(2) }}
                            >
                                Stripe
                            </button>
                        </div>
                    */}
          <div className="flex flex-row items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${currentTab === tab.id ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-black'} outline-none px-4`}
                onClick={() => {
                  handleTabSelection(tab.id)
                }}
              >
                {tab.tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentTab === 1 ? (
        <Integrations
          selectedAgency={selectedAgency}
          reduxUser={reduxUser}
          refreshUserData={refreshUserData}
        />
      ) : currentTab === 2 ? (
        <div
          className="pt-6 w-full overflow-auto"
          style={{
            msOverflowStyle: 'none', // IE and Edge
            scrollbarWidth: 'none', // Firefox
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Chrome, Safari, Opera */
            }
          `}</style>
          <ConnectStripe selectedAgency={selectedAgency} />
        </div>
      ) : (
        'No Tab Selected'
      )}
    </div>
  )
}

export default AgencyIntegrations
