import { useEffect, useState } from 'react'
import { parseOAuthState } from '@/utils/oauthState'

export default function GoogleAuthCallback() {
  const [message, setMessage] = useState('Authenticating...')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    const errorDescription = params.get('error_description')
    const socialConnect = params.get('social_connect')

    // Parse state parameter if present (optional - backward compatible)
    let stateData = null
    if (state) {
      stateData = parseOAuthState(state)
      // If parsing fails, stateData will be null (backward compatible)
    }

    if (code && window.opener) {
      // Pass code and optional state info to opener
      window.opener.postMessage(
        {
          type: 'google-auth-code',
          code,
          state: stateData, // Pass parsed state if available (for debugging)
        },
        '*'
      )
      window.close()
    } else if (error && window.opener) {
      // Handle OAuth errors: notify opener and close
      window.opener.postMessage(
        {
          type: 'google-auth-error',
          error,
          errorDescription,
          state: stateData,
        },
        '*'
      )
      window.close()
    } else if (error || socialConnect === 'error') {
      // No opener (e.g. full redirect): show error on page so user sees it
      const displayError = errorDescription || error || 'Connection failed.'
      setMessage(displayError)
    }
  }, [])

  return <p>{message}</p>
}
