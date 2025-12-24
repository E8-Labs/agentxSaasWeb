import {
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
} from '@mui/material'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'

import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../dashboard/leads/AgentSelectSnackMessage'
import { Scopes } from '../dashboard/myagentX/Scopes'
import CloseBtn from '../globalExtras/CloseBtn'
import {
  connectGmailAccount,
  deleteAccount,
  getGmailAccounts,
} from './TempleteServices'
import { generateOAuthState } from '@/utils/oauthState'
import { getAgencyCustomDomain } from '@/utils/getAgencyCustomDomain'

function AuthSelectionPopup({
  open,
  onClose,
  onSuccess,
  setShowEmailTempPopup,
  showEmailTempPopup,
  setSelectedGoogleAccount,
  selectedUser,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSnack, setShowSnack] = useState({
    type: '',
    message: '',
    isVisible: false,
  })

  const [googleAuthDetails, setGoogleAuthDetails] = useState(null)
  const [gmailAccounts, setGmailAccounts] = useState([])
  const [accountLoader, setAccountLoader] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [loginLoader, setLoginLoader] = useState(false)
  const [delLoader, setDelLoader] = useState(null)

  //google calendar click
  const handleGoogleOAuthClick = async () => {
    const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      process.env.NEXT_PUBLIC_APP_GOOGLE_CLIENT_ID
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_REDIRECT_URI

    // Get agency custom domain from API
    const { agencyId, customDomain, subaccountId } = await getAgencyCustomDomain()

    // Also check if current hostname is a custom domain or subdomain
    const currentHostname = typeof window !== 'undefined' ? window.location.hostname : null
    const isCustomDomain = currentHostname && 
      !currentHostname.includes('app.assignx.ai') && 
      !currentHostname.includes('dev.assignx.ai') &&
      !currentHostname.includes('localhost') &&
      !currentHostname.includes('127.0.0.1')

    // Always use current domain to avoid cross-domain redirects
    // If on custom domain, use it. If on dev/app.assignx.ai, use that instead of custom domain from DB
    // This ensures state is always generated and popup context is preserved
    const domainToUse = currentHostname

    // Generate state parameter (provider signal). Keep it even if agencyId is missing,
    // because middleware relies on `state.provider` to route the callback correctly.
    let stateParam = null
    if (domainToUse) {
      stateParam = generateOAuthState({
        agencyId,
        customDomain: domainToUse,
        provider: 'google',
        subaccountId: subaccountId, // Include subaccountId if user is a subaccount
        originalRedirectUri: null,
      })
    }

    const params = new URLSearchParams({
      client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: Scopes.join(' '), //"openid email profile https://www.googleapis.com/auth/calendar",
      access_type: 'offline',
      prompt: 'consent',
    })

    // Add state parameter only if we have it (custom domain flow)
    if (stateParam) {
      params.set('state', stateParam)
    }

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` + params.toString()

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
            setGoogleAuthDetails(googleLoginData)
            console.log('Google login details are', googleLoginData)
            let res = await connectGmailAccount(googleLoginData, selectedUser)
            // console.log('res', res)
            setLoginLoader(false)
            if (res.data.status == true) {
              setSelectedGoogleAccount(res.data.data)
              setShowEmailTempPopup(true)
              // Call onSuccess callback to refresh accounts list
              if (onSuccess) {
                onSuccess()
              }
            } else {
              setShowSnack({
                message: res.data.message,
                type: SnackbarTypes.Error,
                isVisible: true,
              })
              return
            }
            onClose()
          }
        } catch (err) {
          console.error('Google OAuth error:', err)
        }
      }
    }

    window.addEventListener('message', listener)
  }

  const handleDelete = async (account) => {
    console.log('acccount to delete', account)
    setDelLoader(account)
    await deleteAccount(account)
    setDelLoader(null)
    setGmailAccounts((prev) => prev.filter((x) => x.id !== account.id))
  }

  const handleSelect = (e) => {
    setSelectedAccount(e.target.value)
    setSelectedGoogleAccount(e.target.value)
    setShowEmailTempPopup(true)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="w-full h-full py-4 flex items-center justify-center"
        sx={{ ...styles.modalsStyle }}
      >
        <div className="flex flex-col w-3/12  px-8 py-6 bg-white max-h-[70vh] rounded-2xl">
          <AgentSelectSnackMessage
            type={showSnack.type}
            message={showSnack.message}
            isVisible={showSnack.isVisible}
            hide={() => {
              setShowSnack({
                message: '',
                isVisible: false,
                type: SnackbarTypes.Success,
              })
            }}
          />
          <div className="flex flex-row items-center justify-between w-full">
            <div className="text-[18px] font-[700] ">
              Login
            </div>
            <CloseBtn onClick={onClose} />
          </div>

          {gmailAccounts?.length > 0 && (
            <FormControl>
              <Select
                Select
                value={selectedAccount || ''}
                onChange={(e) => handleSelect(e)}
                displayEmpty
                renderValue={(selected) =>
                  selected?.name || (
                    <div style={{ color: '#aaa' }}>Select Account</div>
                  )
                }
                sx={{
                  border: '2px',
                  '&:hover': {
                    border: 'none', // Same border on hover
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none', // Remove the default outline
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    border: 'none', // Remove outline on focus
                  },
                  '&.MuiSelect-select': {
                    py: 0, // Optional padding adjustments
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: '30vh', // Limit dropdown height
                      overflow: 'auto', // Enable scrolling in dropdown
                      scrollbarWidth: 'none',
                      // borderRadius: "10px"
                    },
                  },
                }}
              >
                {accountLoader ? (
                  <CircularProgress size={20} />
                ) : gmailAccounts?.length > 0 ? (
                  gmailAccounts?.map((item, index) => (
                    <MenuItem
                      key={index}
                      // className="hover:bg-[#402FFF10]"
                      value={item}
                    >
                      <div className="flex w-full flex-row items-center justify-between">
                        <div className="flex flex-row items-center gap-2 max-w-[80%]">
                          <div className="text-[15] font-[500]">
                            {item.displayName}
                          </div>
                          <div className="text-[13] font-[500]  text-[#00000070]">
                            {`(${item.email})`}
                          </div>
                        </div>

                        {delLoader?.id === item.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDelete(item)
                            }}
                            className="ml-2"
                          >
                            <Image
                              src={'/otherAssets/delIcon.png'}
                              alt="*"
                              height={16}
                              width={16}
                            />
                          </button>
                        )}
                      </div>
                    </MenuItem>
                  ))
                ) : (
                  <div className="ml-2">No account found</div>
                )}
              </Select>
            </FormControl>
          )}

          {loginLoader ? (
            <div className="h-50 w-full flex items-center justify-center flex-col">
              <div> Loading...</div>
              <CircularProgress size={30} />
            </div>
          ) : (
            <div className="flex flex-col gap-6 w-full items-center mt-7">
              <button
                onClick={handleGoogleOAuthClick}
                className="disabled:opacity-60"
              >
                <Image
                  src={'/otherAssets/gmailIcon.png'}
                  height={90}
                  width={90}
                  alt="*"
                />
              </button>
              <div className="text-[15px] font-[400]">Gmail</div>
            </div>
          )}
        </div>
      </Box>
    </Modal>
  )
}

const styles = {
  labelStyle: {
    backgroundColor: 'white',
    fontWeight: '400',
    fontSize: 10,
  },
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-55%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}

export default AuthSelectionPopup
