import React, { useEffect, useState } from 'react'

import Integrations from '@/components/agency/integrations/Integrations'
import ConnectStripe from '@/components/agency/stripe/ConnectStripe'
import getProfileDetails from '@/components/apis/GetProfile'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/hooks/redux-hooks'

function AgencyIntegrations({ selectedAgency, initialTab = 1 }) {
  // Convert initialTab (1 or 2) to tab value ('twilio' or 'stripe')
  const getInitialTabValue = () => {
    return initialTab === 2 ? 'stripe' : 'twilio'
  }

  const [activeTab, setActiveTab] = useState(getInitialTabValue())

  // Sync tab state when initialTab prop changes
  useEffect(() => {
    const tabValue = initialTab === 2 ? 'stripe' : 'twilio'
    setActiveTab(tabValue)
  }, [initialTab])

  const { user: reduxUser, setUser: setReduxUser } = useUser()

  const refreshUserData = async () => {
    try {
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

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

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  return (
    <div className="flex w-full items-center flex-row justify-start">
      <div className="py-6 w-full">
        <div
          className="px-10 flex flex-row items-cetner justify-between w-full"
          style={{ fontSize: 24, fontWeight: '600' }}
        >
          Integrations
          <div className="flex flex-row items-center gap-2">
            <NotficationsDrawer />
          </div>
        </div>
        {/* Tabs for navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6 w-full">
          <TabsList className="flex flex-row items-center justify-center gap-4 border-b pb-2 w-full pl-10 bg-transparent outline-none focus:outline-none">
            <TabsTrigger value="twilio" className="outline-none">
              Twilio
            </TabsTrigger>
            <TabsTrigger value="stripe" className="outline-none">
              Stripe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="twilio">
            <Integrations
              selectedAgency={selectedAgency}
              reduxUser={reduxUser}
              refreshUserData={refreshUserData}
            />
          </TabsContent>

          <TabsContent value="stripe">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AgencyIntegrations
