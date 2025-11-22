'use client'

import React, { Suspense, useEffect, useState } from 'react'

import AgencyMyAccount from '@/components/agency/myAccount/AgencyMyAccount'
import SubAccountMyAccount from '@/components/dashboard/subaccount/myAccount/SubAccountMyAccount'
import MyAccount from '@/components/myAccount/MyAccount'

function Page() {
  return (
    <Suspense>
      <AgencyMyAccount />
    </Suspense>
  )
}

export default Page
