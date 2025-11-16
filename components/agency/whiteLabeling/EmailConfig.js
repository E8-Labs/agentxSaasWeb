import React, { useState, useEffect } from 'react'
import { FormControl, Select, MenuItem, Button, CircularProgress } from '@mui/material'
import LabelingHeader from './LabelingHeader'
import axios from 'axios'
import Apis from '../../apis/Apis'
import { AuthToken } from '../plan/AuthDetails'
import { connectGmailAccount, deleteAccount } from '../../pipeline/TempleteServices'
import { Scopes } from '../../dashboard/myagentX/Scopes'
import AgentSelectSnackMessage, { SnackbarTypes } from '../../dashboard/leads/AgentSelectSnackMessage'

const EmailConfig = () => {
  // Mail account state
  const [mailAccount, setMailAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [showSnack, setShowSnack] = useState(null)

  // Commented out: Sender Details state variables
  // const [profileName, setProfileName] = useState('')
  // const [fromEmail, setFromEmail] = useState('')
  // const [fromName, setFromName] = useState('')

  // Commented out: SMTP Connection state variables
  // const [smtpHost, setSmtpHost] = useState('')
  // const [port, setPort] = useState('')
  // const [smtpFromEmail, setSmtpFromEmail] = useState('')
  // const [encryption, setEncryption] = useState('')

  // Fetch agency mail account on component mount
  useEffect(() => {
    fetchAgencyMailAccount()
  }, [])

  const fetchAgencyMailAccount = async () => {
    try {
      setLoading(true)
      const token = AuthToken()
      const response = await axios.get(Apis.agencyMailAccount, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      if (response.data && response.data.status) {
        setMailAccount(response.data.data)
      } else {
        setMailAccount(null)
      }
    } catch (error) {
      console.error('Error fetching agency mail account:', error)
      setMailAccount(null)
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth handler
  const handleGoogleAuth = () => {
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
          setConnecting(true)
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

            const googleLoginData = {
              ...tokens,
              ...userInfo,
            }

            console.log('Google login details are', googleLoginData)
            const response = await connectGmailAccount(googleLoginData)
            setConnecting(false)

            if (response && response.data && response.data.status == true) {
              setShowSnack({
                message: response.data.message || 'Gmail account connected successfully',
                type: SnackbarTypes.Success,
              })
              // Refresh mail account data
              await fetchAgencyMailAccount()
            } else {
              setShowSnack({
                message: response?.data?.message || 'Failed to connect Google account',
                type: SnackbarTypes.Error,
              })
            }
          }
        } catch (err) {
          console.error('Google OAuth error:', err)
          setConnecting(false)
          setShowSnack({
            message: 'Failed to connect Google account. Please try again.',
            type: SnackbarTypes.Error,
          })
        }
      }
    }

    window.addEventListener('message', listener)
  }

  // Disconnect mail account
  const handleDisconnect = async () => {
    if (!mailAccount) return

    try {
      setLoading(true)
      const response = await deleteAccount(mailAccount)
      
      if (response && response.data && response.data.status) {
        setShowSnack({
          message: 'Gmail account disconnected successfully',
          type: SnackbarTypes.Success,
        })
        setMailAccount(null)
      } else {
        setShowSnack({
          message: response?.data?.message || 'Failed to disconnect account',
          type: SnackbarTypes.Error,
        })
      }
    } catch (error) {
      console.error('Error disconnecting account:', error)
      setShowSnack({
        message: 'Failed to disconnect account. Please try again.',
        type: SnackbarTypes.Error,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={'/agencyIcons/email.png'}
        title={'Configure email and SMTP Connection'}
        description={'Connect your Gmail account to send billing emails to subaccounts.'}
      />

      {/* Gmail Account Connection */}
      <div className="w-full flex flex-row justify-center pt-8 pb-12">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          <div className="w-full">
            <div className="text-start mb-4" style={styles.semiBoldHeading}>
              Gmail Account
            </div>

            {loading ? (
              <div className="w-full flex justify-center py-8">
                <CircularProgress size={24} />
              </div>
            ) : mailAccount ? (
              <div className="w-full">
                <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <div className="text-start mb-1" style={styles.regular}>
                        {mailAccount.displayName || mailAccount.email}
                      </div>
                      <div className="text-start" style={styles.small}>
                        {mailAccount.email}
                      </div>
                      <div className="text-start mt-1" style={styles.small}>
                        Provider: {mailAccount.provider || 'gmail'}
                      </div>
                    </div>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDisconnect}
                      disabled={loading}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        px: 3,
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-[#00000060]" style={styles.small}>
                  Billing emails to subaccounts will be sent from this Gmail account.
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                  <div className="text-start mb-4" style={styles.small}>
                    No Gmail account connected. Connect your Gmail account to send billing
                    emails to subaccounts from your own email address.
                  </div>
                  <button
                    onClick={handleGoogleAuth}
                    disabled={connecting}
                    className="bg-purple text-white rounded-lg px-4 py-2 font-medium text-base hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {connecting ? (
                      <>
                        <CircularProgress size={16} sx={{ color: 'white' }} />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      'Connect Gmail Account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commented out: Original SMTP UI */}
      {/* 
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          <div className="w-full">
            <div className="text-start mb-2" style={styles.semiBoldHeading}>Sender Details</div>
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>Profile Name</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="eg Emerald realestate"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>From Email</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="Type here"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="w-full mb-2">
              <div className="text-start mb-2" style={styles.small}>From Name</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="e.g no-reply@yourdomain.com"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-row justify-center pt-8 pb-12">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          <div className="w-full">
            <div className="text-start mb-2" style={styles.semiBoldHeading}>SMTP Connection</div>
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>SMTP host</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="smtp.example.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
              />
              <div className='mt-2 text-[#00000060]' style={styles.small}>Hostname of your SMTP server.</div>
            </div>
          </div>
          <div className="w-full">
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>Port</div>
              <FormControl className="w-full">
                <Select
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div style={{ color: "#aaa" }}>Select Port</div>;
                    }
                    return selected;
                  }}
                  sx={{
                    height: "48px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    "&:hover": {
                      border: "1px solid #E5E7EB",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiSelect-select": {
                      py: 0,
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#000000",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "30vh",
                        overflow: "auto",
                        scrollbarWidth: "none",
                      },
                    },
                  }}
                >
                  <MenuItem value="587">587 (STARTTLS)</MenuItem>
                  <MenuItem value="465">465 (SSL/TLS)</MenuItem>
                  <MenuItem value="25">25 (plain/STARTTLS)</MenuItem>
                  <MenuItem value="2525">2525 (Alternative)</MenuItem>
                </Select>
              </FormControl>
              <div className='mt-2' style={styles.small}>{`Default: 587 (STARTTLS), 465 (SSL/TLS), 25 (plain/STARTTLS).`}</div>
            </div>
          </div>
          <div className="w-full">
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>From Email</div>
              <input
                style={styles.inputs}
                className="w-full border border-gray-200 outline-none focus:ring-0 rounded-lg p-2"
                placeholder="e.g no-reply@yourdomain.com"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full">
            <div className="w-full">
              <div className="text-start mb-2" style={styles.small}>Encryption</div>
              <FormControl className="w-full">
                <Select
                  value={encryption}
                  onChange={(e) => setEncryption(e.target.value)}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div style={{ color: "#aaa" }}>Select Encryption</div>;
                    }
                    return selected;
                  }}
                  sx={{
                    height: "48px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    "&:hover": {
                      border: "1px solid #E5E7EB",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiSelect-select": {
                      py: 0,
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#000000",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "30vh",
                        overflow: "auto",
                        scrollbarWidth: "none",
                      },
                    },
                  }}
                >
                  <MenuItem value="None">None</MenuItem>
                  <MenuItem value="STARTTLS">STARTTLS</MenuItem>
                  <MenuItem value="SSL/TLS">SSL/TLS</MenuItem>
                  <MenuItem value="TLS">TLS</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
      </div>
      */}

      {/* Snackbar for notifications */}
      <AgentSelectSnackMessage
        isVisible={showSnack?.isVisible !== false && showSnack !== null}
        hide={() => setShowSnack(null)}
        message={showSnack?.message}
        type={showSnack?.type || SnackbarTypes.Success}
      />
    </div>
  )
}

export default EmailConfig

const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: '600' },
  smallRegular: { fontSize: 13, fontWeight: '400' },
  regular: { fontSize: 16, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}
