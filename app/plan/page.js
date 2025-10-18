'use client'
import UserPlans from '@/components/userPlans/UserPlans'
import React, { useEffect } from 'react'

function page() {

  let isFrom = ""


  return (
    <div>
      <UserPlans from="dashboard" />
    </div>
  )
}

export default page