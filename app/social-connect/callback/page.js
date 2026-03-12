'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Callback page for Facebook (and other social) OAuth when using popup flow.
 * Backend redirects here with ?social_connect=success|error&error=...
 * If opened as popup (window.opener), posts result to opener and closes.
 * Otherwise shows success/error message for full-window redirect.
 */
export default function SocialConnectCallbackPage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Completing connection...')

  useEffect(() => {
    const socialConnect = searchParams.get('social_connect')
    const error = searchParams.get('error')
    const errorReason = searchParams.get('error_reason')

    if (window.opener) {
      const success = socialConnect === 'success'
      const errorMessage = error || errorReason || (success ? null : 'Connection failed.')
      window.opener.postMessage(
        {
          type: 'social_connect_done',
          success,
          error: errorMessage,
        },
        window.location.origin
      )
      window.close()
      return
    }

    if (socialConnect === 'success') {
      setMessage('Connected successfully. You can close this tab or return to the app.')
    } else {
      setMessage(error || errorReason || 'Connection failed.')
    }
  }, [searchParams])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', textAlign: 'center' }}>
      <p>{message}</p>
    </div>
  )
}
