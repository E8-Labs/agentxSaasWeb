'use client'

import React, { Suspense } from 'react'

import AdminContainer from '@/components/admin/AdminContainer'

function page() {
  return (
    <Suspense>
      <AdminContainer />
    </Suspense>
  )
}

export default page
