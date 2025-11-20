'use client'

import React from 'react'
import AgencyPlans from '@/components/plan/AgencyPlans'

function Page() {
  return (
    <div>
        <AgencyPlans isFrom="page" hideProgressBar={false} />
    </div>
  )
}

export default Page