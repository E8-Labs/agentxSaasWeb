import { useEffect } from 'react'

export default function GoogleAuthCallback() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (code && window.opener) {
      window.opener.postMessage({ type: 'google-auth-code', code }, '*')
      window.close()
    }
  }, [])

  return <p>Authenticating...</p>
}
