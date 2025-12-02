import { useEffect } from 'react'
import { parseOAuthState } from '@/utils/oauthState'

export default function GoogleAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    const errorDescription = params.get('error_description')

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
      // Handle OAuth errors
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
    }
  }, [])

  return <p>Authenticating...</p>
}
