import {
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Plus, Trash2 } from 'lucide-react'

import Apis from '../../apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../../dashboard/leads/AgentSelectSnackMessage'
import { Scopes } from '../../dashboard/myagentX/Scopes'
import {
  connectGmailAccount,
  deleteAccount,
} from '../../pipeline/TempleteServices'
import { AuthToken } from '../plan/AuthDetails'
import LabelingHeader from './LabelingHeader'
import { generateOAuthState } from '@/utils/oauthState'
import { getAgencyCustomDomain } from '@/utils/getAgencyCustomDomain'
import MailgunDomainSetup from '../../messaging/MailgunDomainSetup'

const EmailConfig = ({ selectedAgency }) => {
  // Mail account state
  const [mailAccount, setMailAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [showSnack, setShowSnack] = useState(null)
  
  // Mailgun state
  const [mailgunIntegrations, setMailgunIntegrations] = useState([])
  const [loadingMailgun, setLoadingMailgun] = useState(true)
  const [showMailgunSetup, setShowMailgunSetup] = useState(false)
  const [verifyingDomain, setVerifyingDomain] = useState(null)

  // Commented out: Sender Details state variables
  // const [profileName, setProfileName] = useState('')
  // const [fromEmail, setFromEmail] = useState('')
  // const [fromName, setFromName] = useState('')

  // Commented out: SMTP Connection state variables
  // const [smtpHost, setSmtpHost] = useState('')
  // const [port, setPort] = useState('')
  // const [smtpFromEmail, setSmtpFromEmail] = useState('')
  // const [encryption, setEncryption] = useState('')

  // Fetch agency mail account on component mount or when selectedAgency changes
  useEffect(() => {
    fetchAgencyMailAccount()
    fetchMailgunIntegrations()
  }, [selectedAgency])

  const fetchAgencyMailAccount = async () => {
    try {
      setLoading(true)
      const token = AuthToken()
      
      // Add userId parameter if selectedAgency is provided (admin view)
      let apiUrl = Apis.agencyMailAccount
      if (selectedAgency?.id) {
        apiUrl += `?userId=${selectedAgency.id}`
      }
      
      const response = await axios.get(apiUrl, {
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
  const handleGoogleAuth = async () => {
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
      scope: Scopes.join(' '),
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
            const response = await connectGmailAccount(googleLoginData, selectedAgency)
            setConnecting(false)

            if (response && response.data && response.data.status == true) {
              setShowSnack({
                message:
                  response.data.message ||
                  'Gmail account connected successfully',
                type: SnackbarTypes.Success,
              })
              // Refresh mail account data
              await fetchAgencyMailAccount()
            } else {
              setShowSnack({
                message:
                  response?.data?.message || 'Failed to connect Google account',
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

  // Fetch Mailgun integrations
  const fetchMailgunIntegrations = async () => {
    try {
      setLoadingMailgun(true)
      const token = AuthToken()
      
      const response = await axios.get(Apis.listMailgunIntegrations, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      })

      if (response.data && response.data.status) {
        setMailgunIntegrations(response.data.data || [])
      } else {
        setMailgunIntegrations([])
      }
    } catch (error) {
      console.error('Error fetching Mailgun integrations:', error)
      setMailgunIntegrations([])
    } finally {
      setLoadingMailgun(false)
    }
  }

  // Verify Mailgun domain
  const handleVerifyDomain = async (integrationId) => {
    try {
      setVerifyingDomain(integrationId)
      const token = AuthToken()
      
      const response = await axios.post(
        Apis.verifyMailgunDomain,
        { mailgunIntegrationId: integrationId },
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )

      if (response.data && response.data.status) {
        setShowSnack({
          message: response.data.data.verified
            ? 'Domain verified successfully'
            : 'Domain verification pending. Please check DNS records.',
          type: response.data.data.verified
            ? SnackbarTypes.Success
            : SnackbarTypes.Error,
        })
        await fetchMailgunIntegrations()
      } else {
        setShowSnack({
          message: response.data?.message || 'Failed to verify domain',
          type: SnackbarTypes.Error,
        })
      }
    } catch (error) {
      console.error('Error verifying domain:', error)
      setShowSnack({
        message: error.response?.data?.message || 'Failed to verify domain',
        type: SnackbarTypes.Error,
      })
    } finally {
      setVerifyingDomain(null)
    }
  }

  // Delete Mailgun integration
  const handleDeleteMailgunIntegration = async (integrationId) => {
    if (!confirm('Are you sure you want to delete this Mailgun domain? This will affect all email accounts using it.')) {
      return
    }

    try {
      setLoadingMailgun(true)
      const token = AuthToken()
      
      const response = await axios.delete(
        `${Apis.deleteMailgunIntegration}/${integrationId}`,
        {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        }
      )

      if (response.data && response.data.status) {
        setShowSnack({
          message: 'Mailgun domain deleted successfully',
          type: SnackbarTypes.Success,
        })
        await fetchMailgunIntegrations()
      } else {
        setShowSnack({
          message: response.data?.message || 'Failed to delete domain',
          type: SnackbarTypes.Error,
        })
      }
    } catch (error) {
      console.error('Error deleting Mailgun integration:', error)
      setShowSnack({
        message: error.response?.data?.message || 'Failed to delete domain',
        type: SnackbarTypes.Error,
      })
    } finally {
      setLoadingMailgun(false)
    }
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
        title={'Configure your email'}
        description={
          'Connect your Gmail account to send billing emails to subaccounts.'
        }
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
                <CircularProgress size={24} sx={{ color: 'hsl(var(--brand-primary))' }} />
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
                  Billing emails to subaccounts will be sent from this Gmail
                  account.
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                  <div className="text-start mb-4" style={styles.small}>
                    No Gmail account connected. Connect your Gmail account to
                    send billing emails to subaccounts from your own email
                    address.
                  </div>
                  <button
                    onClick={handleGoogleAuth}
                    disabled={connecting}
                    className="bg-brand-primary text-white rounded-lg px-4 py-2 font-medium text-base hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Mailgun Domain Setup Section - Hidden in Production */}
      {process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT !== 'Production' && (
        <>
          <div className="w-full flex flex-row justify-center pt-8 pb-12">
            <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
              <div className="w-full">
                <div className="flex flex-row items-center justify-between mb-4">
                  <div className="text-start" style={styles.semiBoldHeading}>
                    Mailgun Domains
                  </div>
                  <button
                    onClick={() => setShowMailgunSetup(true)}
                    className="flex items-center gap-2 bg-brand-primary text-white rounded-lg px-4 py-2 font-medium text-sm hover:bg-brand-primary/90 transition-colors"
                  >
                    <Plus size={16} />
                    Add Domain
                  </button>
                </div>

                {loadingMailgun ? (
                  <div className="w-full flex justify-center py-8">
                    <CircularProgress size={24} sx={{ color: 'hsl(var(--brand-primary))' }} />
                  </div>
                ) : mailgunIntegrations.length === 0 ? (
                  <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                    <div className="text-start mb-4" style={styles.small}>
                      No Mailgun domains configured. Add a domain to allow users to request email addresses on your custom domain.
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    {mailgunIntegrations.map((integration) => (
                      <div
                        key={integration.id}
                        className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <div className="flex flex-row items-center justify-between">
                          <div className="flex flex-col flex-1">
                            <div className="flex flex-row items-center gap-2 mb-1">
                              <div className="text-start" style={styles.regular}>
                                {integration.domain}
                              </div>
                              {integration.verificationStatus === 'verified' ? (
                                <CheckCircle size={18} className="text-green-600" />
                              ) : integration.verificationStatus === 'failed' ? (
                                <XCircle size={18} className="text-red-600" />
                              ) : (
                                <AlertCircle size={18} className="text-yellow-600" />
                              )}
                            </div>
                            <div className="text-start" style={styles.small}>
                              Status:{' '}
                              <span
                                className={
                                  integration.verificationStatus === 'verified'
                                    ? 'text-green-600 font-medium'
                                    : integration.verificationStatus === 'failed'
                                    ? 'text-red-600 font-medium'
                                    : 'text-yellow-600 font-medium'
                                }
                              >
                                {integration.verificationStatus === 'verified'
                                  ? 'Verified'
                                  : integration.verificationStatus === 'failed'
                                  ? 'Verification Failed'
                                  : 'Pending Verification'}
                              </span>
                            </div>
                            {integration.verifiedAt && (
                              <div className="text-start mt-1" style={styles.small}>
                                Verified: {new Date(integration.verifiedAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-row items-center gap-2">
                            {integration.verificationStatus !== 'verified' && (
                              <Button
                                variant="outlined"
                                onClick={() => handleVerifyDomain(integration.id)}
                                disabled={verifyingDomain === integration.id}
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: '8px',
                                  px: 2,
                                  borderColor: 'hsl(var(--brand-primary))',
                                  color: 'hsl(var(--brand-primary))',
                                }}
                              >
                                {verifyingDomain === integration.id ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  'Verify'
                                )}
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteMailgunIntegration(integration.id)}
                              disabled={loadingMailgun}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 2,
                                minWidth: 'auto',
                              }}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mailgun Domain Setup Modal */}
          <MailgunDomainSetup
            open={showMailgunSetup}
            onClose={() => setShowMailgunSetup(false)}
            onSuccess={() => {
              setShowMailgunSetup(false)
              fetchMailgunIntegrations()
              setShowSnack({
                message: 'Mailgun domain added successfully',
                type: SnackbarTypes.Success,
              })
            }}
          />
        </>
      )}

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
