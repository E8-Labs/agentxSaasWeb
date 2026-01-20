import { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { Scopes } from '@/components/dashboard/myagentX/Scopes'
import { connectGmailAccount } from '@/components/pipeline/TempleteServices'

export const GoogleOAuth = ({
  setLoginLoader,
  setShowSnack,
  setShowSnackBar, // Accept both names for compatibility
  setShowEmailTempPopup,
  selectedUser,
}) => {
  // Use setShowSnack if provided, otherwise fall back to setShowSnackBar
  const showSnackHandler = setShowSnack || setShowSnackBar
  const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_APP_GOOGLE_CLIENT_ID
  const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_REDIRECT_URI

  const oauthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: Scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    }).toString()

  const popup = window.open(oauthUrl, '_blank', 'width=500,height=600')

  const listener = async (event) => {
    if (event.data?.type === 'google-auth-code') {
      window.removeEventListener('message', listener)

      try {
        setLoginLoader(true)
        const res = await fetch(
          `/api/google/exchange-token?code=${event.data.code}`,
        )
        const { tokens } = await res.json()

        if (tokens?.access_token) {
          const userInfoRes = await fetch(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            },
          )
          const userInfo = await userInfoRes.json()
          // setShowAddNewGoogleCalender(true);

          const googleLoginData = {
            ...tokens,
            ...userInfo,
          }
          let res = await connectGmailAccount(googleLoginData, selectedUser)
          setLoginLoader(false)
          if (res.data.status == true) {
            return res.data.data
            // setSelectedGoogleAccount(res.data.data)
            // setShowEmailTempPopup(true)
          } else {
            if (showSnackHandler) {
              showSnackHandler({
                message: res.data.message,
                type: SnackbarTypes.Error,
                isVisible: true,
              })
            }
            return null
          }
          // onClose()
        }
      } catch (err) {
        console.error('Google OAuth error:', err)
        return null
      }
    }
  }

  window.addEventListener('message', listener)
}
