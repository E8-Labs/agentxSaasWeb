'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

/**
 * Legacy route: /agency/[agencyUUID]/cancellation
 * Redirects to /cancellation (agency is determined by current domain).
 */
function LegacyCancellationRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/cancellation')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Redirecting to cancellation policy...</p>
    </div>
  )
}

export default LegacyCancellationRedirect
