'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

/**
 * Legacy route: /agency/[agencyUUID]/privacy
 * Redirects to /privacy (agency is determined by current domain).
 */
function LegacyPrivacyRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/privacy')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Redirecting to privacy policy...</p>
    </div>
  )
}

export default LegacyPrivacyRedirect
