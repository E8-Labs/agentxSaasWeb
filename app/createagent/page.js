"use client"
import TemFix from '@/components/temporaryfix/TempFix'
import React, { Suspense } from 'react'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TemFix />
    </Suspense>
  )
}

export default Page
