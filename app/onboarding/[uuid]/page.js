'use client'

import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { saveAgencyUUID } from '@/utilities/AgencyUtility'

function Page() {
  const params = useParams()
  const router = useRouter()
  const hasRedirected = useRef(false)

  // Save agency UUID when component loads and redirect to main onboarding
  useEffect(() => {
    const handleUUID = async () => {
      if (params.uuid && !hasRedirected.current) {
        // Save the UUID
        try {
          saveAgencyUUID(params.uuid)

          // Verify it was saved
          const saved = localStorage.getItem('AgencyUUID')
        } catch (error) {
          console.error('[Agency Onboarding] Error saving UUID:', error)
        }

        hasRedirected.current = true

        // Add a small delay to ensure localStorage is updated
        setTimeout(() => {
          router.replace('/onboarding')
        }, 10) // Increased delay to see the page
      } else {}
    }

    handleUUID()
  }, [params.uuid, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        {/* <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 text-lg">Preparing your onboarding experience...</p>
        <p className="mt-2 text-sm text-gray-500">Agency UUID: {params.uuid}</p>
        {isRedirecting && (
          <p className="mt-2 text-sm text-green-600">✓ UUID saved, redirecting...</p>
        )} */}
      </div>
    </div>
  )
}

export default Page
