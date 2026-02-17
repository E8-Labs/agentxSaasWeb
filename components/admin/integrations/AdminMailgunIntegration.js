'use client'

import {
  Button,
  CircularProgress,
} from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Plus, Trash2, Eye, KeyRound } from 'lucide-react'

import Apis from '../../apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '../../dashboard/leads/AgentSelectSnackMessage'
import { AuthToken } from '../../agency/plan/AuthDetails'
import MailgunDomainSetup from '../../messaging/MailgunDomainSetup'
import ViewDnsRecordsModal from '../../messaging/ViewDnsRecordsModal'
import UpdateMailgunApiKeyModal from '../../messaging/UpdateMailgunApiKeyModal'

const AdminMailgunIntegration = () => {
  const [mailgunIntegrations, setMailgunIntegrations] = useState([])
  const [loadingMailgun, setLoadingMailgun] = useState(true)
  const [showMailgunSetup, setShowMailgunSetup] = useState(false)
  const [verifyingDomain, setVerifyingDomain] = useState(null)
  const [showSnack, setShowSnack] = useState(null)
  const [viewingDnsRecords, setViewingDnsRecords] = useState(null)
  const [updatingApiKeyIntegration, setUpdatingApiKeyIntegration] = useState(null)

  useEffect(() => {
    fetchMailgunIntegrations()
  }, [])

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
        // Backend already filters for platform domains, but ensure we have the data
        const integrations = response.data.data || []
        setMailgunIntegrations(integrations)
      } else {
        console.warn('No integrations returned or status is false:', response.data)
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
            : response.data.message || 'Domain verification pending. Please check DNS records.',
          type: response.data.data.verified
            ? SnackbarTypes.Success
            : SnackbarTypes.Info, // Changed to Info for pending status
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

  return (
    <div className="w-full h-full px-6 py-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Mailgun Integration</h1>
          <p className="text-gray-600">
            Manage Mailgun domains for AgentX users. Domains configured here will be available for all AgentX users to request email addresses.
          </p>
        </div>

        {/* Add Domain Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowMailgunSetup(true)}
            className="flex items-center gap-2 bg-brand-primary text-white rounded-lg px-4 py-2 font-medium text-sm hover:bg-brand-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Mailgun Domain
          </button>
        </div>

        {/* Mailgun Domains List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loadingMailgun ? (
            <div className="w-full flex justify-center py-12">
              <CircularProgress size={32} sx={{ color: 'hsl(var(--brand-primary))' }} />
            </div>
          ) : mailgunIntegrations.length === 0 ? (
            <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <div className="text-gray-600 mb-2 font-medium">
                No Mailgun domains configured
              </div>
              <div className="text-sm text-gray-500">
                Add a Mailgun domain to allow AgentX users to request email addresses on your platform domain.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mailgunIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col flex-1">
                      <div className="flex flex-row items-center gap-2 mb-2">
                        <div className="text-lg font-semibold text-gray-900">
                          {integration.domain}
                        </div>
                        {integration.verificationStatus === 'verified' ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : integration.verificationStatus === 'failed' ? (
                          <XCircle size={20} className="text-red-600" />
                        ) : (
                          <AlertCircle size={20} className="text-yellow-600" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
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
                        <div className="text-xs text-gray-500">
                          Verified: {new Date(integration.verifiedAt).toLocaleDateString()}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Owner Type: Platform
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      {integration.verificationStatus === 'verified' && (
                        <Button
                          variant="outlined"
                          onClick={() => setUpdatingApiKeyIntegration(integration)}
                          sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            borderColor: 'hsl(var(--brand-primary))',
                            color: 'hsl(var(--brand-primary))',
                          }}
                        >
                          <KeyRound size={16} className="mr-2" />
                          Update API key
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        onClick={() => setViewingDnsRecords(integration)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '8px',
                          px: 3,
                          borderColor: 'hsl(var(--brand-primary))',
                          color: 'hsl(var(--brand-primary))',
                        }}
                      >
                        <Eye size={16} className="mr-2" />
                        View DNS Records
                      </Button>
                      {integration.verificationStatus !== 'verified' && (
                        <Button
                          variant="outlined"
                          onClick={() => handleVerifyDomain(integration.id)}
                          disabled={verifyingDomain === integration.id}
                          sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            borderColor: 'hsl(var(--brand-primary))',
                            color: 'hsl(var(--brand-primary))',
                          }}
                        >
                          {verifyingDomain === integration.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            'Verify Domain'
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

      {/* Mailgun Domain Setup Modal */}
      <MailgunDomainSetup
        open={showMailgunSetup}
        onClose={() => {
          setShowMailgunSetup(false)
          // Always refresh when modal closes in case a domain was added
          fetchMailgunIntegrations()
        }}
        onSuccess={() => {
          setShowMailgunSetup(false)
          fetchMailgunIntegrations()
          setShowSnack({
            message: 'Mailgun domain added successfully',
            type: SnackbarTypes.Success,
          })
        }}
      />

      {/* View DNS Records Modal */}
      {viewingDnsRecords && (
        <ViewDnsRecordsModal
          open={!!viewingDnsRecords}
          onClose={() => setViewingDnsRecords(null)}
          domain={viewingDnsRecords.domain}
          dnsRecords={viewingDnsRecords.dnsRecords}
          verificationStatus={viewingDnsRecords.verificationStatus}
          mailgunIntegrationId={viewingDnsRecords.id}
        />
      )}

      {/* Update API key Modal */}
      <UpdateMailgunApiKeyModal
        open={!!updatingApiKeyIntegration}
        onClose={() => setUpdatingApiKeyIntegration(null)}
        integration={updatingApiKeyIntegration}
        onSuccess={() => {
          fetchMailgunIntegrations()
          setShowSnack({
            message: 'API key updated successfully',
            type: SnackbarTypes.Success,
          })
        }}
      />

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

export default AdminMailgunIntegration

