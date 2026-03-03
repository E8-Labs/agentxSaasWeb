'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'
import { PersistanceKeys } from '@/constants/Constants'
import CreateTemplateFlow from '@/components/createagent/CreateTemplateFlow'

const Page = () => {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const userData = localStorage.getItem('User') || localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (!userData) {
      setAllowed(false)
      setReady(true)
      return
    }
    try {
      const parsed = JSON.parse(userData)
      const user = parsed?.user || parsed
      const role = user?.userRole || user?.userType
      const isAgency = role === 'Agency'
      const isAdmin = user?.userType === 'admin' || role === 'admin'
      setAllowed(isAgency || isAdmin)
    } catch (e) {
      setAllowed(false)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && !allowed) {
      router.replace('/agency/dashboard/templates')
    }
  }, [ready, allowed, router])

  const handleSaved = () => {
    router.replace('/agency/dashboard/templates')
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    )
  }

  if (!allowed) {
    return null
  }

  return (
    <ErrorBoundary>
      <CreateTemplateFlow onSaved={handleSaved} />
    </ErrorBoundary>
  )
}

export default Page
