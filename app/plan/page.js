'use client'

import React, { useEffect } from 'react'

import UserPlans from '@/components/userPlans/UserPlans'

function page() {
  let isFrom = ''

  return (
    <div>
      <UserPlans from="dashboard" />
    </div>
  )
}

export default page
