'use client'

import { useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

import AgencyIntegrations from '@/components/agency/dashboard/AgencyIntegrations'
import Integrations from '@/components/agency/integrations/Integrations'
import ConnectStripe from '@/components/agency/stripe/ConnectStripe'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'

function Page() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = tabParam ? parseInt(tabParam, 10) : 1

  return (
    <div>
      <AgencyIntegrations initialTab={initialTab} />
    </div>
  )
}

export default Page
