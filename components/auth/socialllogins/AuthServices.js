import { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import { Scopes } from '@/components/dashboard/myagentX/Scopes'
import { connectGmailAccount } from '@/components/pipeline/TempleteServices'

export const GoogleOAuth = ({
  setLoginLoader,
  setShowSnack,
  setShowEmailTempPopup,
  selectedUser,
}) => {
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
          // setGoogleAuthDetails(googleLoginData);
          console.log('Google login details are', googleLoginData)
          let res = await connectGmailAccount(googleLoginData, selectedUser)
          // console.log('res', res)
          setLoginLoader(false)
          if (res.data.status == true) {
            return res.data.data
            // setSelectedGoogleAccount(res.data.data)
            // setShowEmailTempPopup(true)
          } else {
            setShowSnack({
              message: res.data.message,
              type: SnackbarTypes.Error,
              isVisible: true,
            })
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
