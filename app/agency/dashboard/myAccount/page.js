'use client'

import React, { Suspense, useEffect, useState } from 'react'

import AgencyMyAccount from '@/components/agency/myAccount/AgencyMyAccount'
import SubAccountMyAccount from '@/components/dashboard/subaccount/myAccount/SubAccountMyAccount'
import MyAccount from '@/components/myAccount/MyAccount'
import { PermissionProvider } from '@/contexts/PermissionContext'

function Page() {
  return (
    <PermissionProvider>
      <Suspense>
        <AgencyMyAccount />
      </Suspense>
    </PermissionProvider>
  )
}

export default Page
