'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ErrorBoundary from '@/components/ErrorBoundary'
import BackgroundVideo from '@/components/general/BackgroundVideo'
import { PersistanceKeys } from '@/constants/Constants'
import CreateTemplateStep1 from '@/components/createagent/CreateTemplateStep1'
import CreateTemplateStep2 from '@/components/createagent/CreateTemplateStep2'

const steps = [CreateTemplateStep1, CreateTemplateStep2]

const Page = () => {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [step1Data, setStep1Data] = useState(null)
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
      router.replace('/dashboard/myAgentX')
    }
  }, [ready, allowed, router])

  const handleStep1Continue = (data) => {
    setStep1Data(data)
    setIndex(1)
  }

  const handleStep2Back = () => {
    setIndex(0)
  }

  const handleSaved = () => {
    router.replace('/dashboard/myAgentX')
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

  const CurrentStep = steps[index]
  const isStep1 = index === 0

  return (
    <ErrorBoundary>
      <div
        className="main-div flex min-h-screen flex-row items-center justify-center overflow-y-none bg-brand-primary"
        style={{ position: 'relative' }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
        >
          <BackgroundVideo />
        </div>
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          {isStep1 ? (
            <CurrentStep
              handleContinue={handleStep1Continue}
              handleBack={() => router.back()}
              initialData={step1Data}
            />
          ) : (
            <CurrentStep
              handleBack={handleStep2Back}
              step1Data={step1Data}
              onSaved={handleSaved}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default Page
