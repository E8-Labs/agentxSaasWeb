'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

/**
 * Legacy route: /agency/[agencyUUID]/terms
 * Redirects to /terms (agency is determined by current domain).
 */
function LegacyTermsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/terms')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600">Redirecting to terms & conditions...</p>
    </div>
  )
}

export default LegacyTermsRedirect
