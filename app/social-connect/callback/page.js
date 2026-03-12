'use client'

import { useEffect, useState } from 'react'

/**
 * Callback page for Facebook (and other social) OAuth when using popup flow.
 * Backend redirects here with ?social_connect=success|error&error=...
 * Sends result to opener (postMessage) or via localStorage; then closes if this is a popup.
 */
export default function SocialConnectCallbackPage() {
  const [message, setMessage] = useState('Completing connection...')

  useEffect(() => {
    // Read from URL so we have params on first load (useSearchParams can lag in App Router)
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()
    const socialConnect = params.get('social_connect')
    const error = params.get('error')
    const errorReason = params.get('error_reason')

    const success = socialConnect === 'success'
    const errorMessage = error || errorReason || (success ? null : 'Connection failed.')

    const sendAndClose = () => {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'social_connect_done',
            success,
            error: errorMessage,
          },
          window.location.origin
        )
      } else {
        // Fallback when opener was lost: write so opener can read when popup closes or via storage event
        try {
          localStorage.setItem(
            'social_connect_result',
            JSON.stringify({ success, error: errorMessage, ts: Date.now() })
          )
        } catch (_) {}
      }
      setMessage(success ? 'Connected. Closing…' : (errorMessage || 'Connection failed.'))
      window.close()
    }

    // If we have a result from the backend, send event and close
    if (socialConnect === 'success' || socialConnect === 'error') {
      sendAndClose()
      return
    }

    // Params not in URL yet (e.g. hydration): retry once after a short delay
    const t = setTimeout(() => {
      const p = new URLSearchParams(window.location.search)
      const sc = p.get('social_connect')
      if (sc === 'success' || sc === 'error') {
        const err = p.get('error') || p.get('error_reason') || (sc === 'success' ? null : 'Connection failed.')
        const ok = sc === 'success'
        if (window.opener) {
          window.opener.postMessage({ type: 'social_connect_done', success: ok, error: err }, window.location.origin)
        } else {
          try {
            localStorage.setItem('social_connect_result', JSON.stringify({ success: ok, error: err, ts: Date.now() }))
          } catch (_) {}
        }
        setMessage(ok ? 'Connected. Closing…' : (err || 'Connection failed.'))
        window.close()
      }
    }, 300)
    return () => clearTimeout(t)
  }, [])

  const showCloseButton = message !== 'Completing connection...'

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', textAlign: 'center' }}>
      <p>{message}</p>
      {showCloseButton && (
        <button
          type="button"
          onClick={() => window.close()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.25rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
          }}
        >
          Close
        </button>
      )}
    </div>
  )
}
