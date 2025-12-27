'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import Apis from '@/components/apis/Apis'
import { getUserLocalData } from '@/components/constants/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MailgunDomainSetup = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1) // 1: Enter domain/API key, 2: DNS records, 3: Verify
  const [domain, setDomain] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [dnsRecords, setDnsRecords] = useState([])
  const [mailgunIntegrationId, setMailgunIntegrationId] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState('pending')

  // Reset form state when modal opens
  useEffect(() => {
    if (open) {
      setStep(1)
      setDomain('')
      setApiKey('')
      setDnsRecords([])
      setMailgunIntegrationId(null)
      setVerificationStatus('pending')
      setLoading(false)
    }
  }, [open])

  const handleCreateIntegration = async () => {
    if (!domain || !apiKey) {
      toast.error('Domain and API key are required')
      return
    }

    setLoading(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      const response = await axios.post(
        Apis.createMailgunIntegration,
        { domain, mailgunApiKey: apiKey },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        const dnsRecordsData = response.data.data.dnsRecords || []
        console.log('DNS Records received:', dnsRecordsData)
        setDnsRecords(dnsRecordsData)
        setMailgunIntegrationId(response.data.data.id)
        setStep(2)
        toast.success('Domain added to Mailgun. Please configure DNS records.')
        
        if (dnsRecordsData.length === 0) {
          toast.warning('No DNS records returned. The domain may need manual configuration.')
        }
      } else {
        toast.error(response.data?.message || 'Failed to create Mailgun integration')
      }
    } catch (error) {
      console.error('Error creating Mailgun integration:', error)
      toast.error(error.response?.data?.message || 'Failed to create Mailgun integration')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDomain = async () => {
    if (!mailgunIntegrationId) return

    setLoading(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      const response = await axios.post(
        Apis.verifyMailgunDomain,
        { mailgunIntegrationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        if (response.data.data.verified) {
          setVerificationStatus('verified')
          setStep(3)
          toast.success('Domain verified successfully!')
          if (onSuccess) {
            onSuccess()
          }
        } else {
          toast.warning('Domain verification pending. Please ensure DNS records are configured correctly.')
        }
      } else {
        toast.error(response.data?.message || 'Failed to verify domain')
      }
    } catch (error) {
      console.error('Error verifying domain:', error)
      toast.error(error.response?.data?.message || 'Failed to verify domain')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (!open) return null

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center" 
      style={{ zIndex: 100001 }}
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Setup Mailgun Domain</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="mail.yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="mt-1"
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter your email subdomain (e.g., mail.yourdomain.com)
                </p>
              </div>

              <div>
                <Label htmlFor="apiKey">Mailgun API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="mt-1"
                  autoComplete="new-password"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Get your API key from your Mailgun dashboard
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIntegration} disabled={loading}>
                  {loading ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Configure DNS Records
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Add the following DNS records to your domain registrar. This may take up to 48 hours to propagate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {dnsRecords.length === 0 ? (
                  <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-900">
                          DNS Records Not Available Yet
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Mailgun may need a few moments to generate DNS records for your domain. 
                          You can find the DNS records in your Mailgun dashboard:
                        </p>
                        <ol className="text-xs text-yellow-700 mt-2 ml-4 list-decimal space-y-1">
                          <li>Go to your Mailgun dashboard</li>
                          <li>Navigate to Sending → Domains</li>
                          <li>Click on your domain: <strong>{domain}</strong></li>
                          <li>Copy the DNS records shown there</li>
                        </ol>
                        <p className="text-xs text-yellow-700 mt-2">
                          You can verify the domain once DNS records are configured, even if they're not shown here.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  dnsRecords.map((record, index) => {
                    // Handle different DNS record formats from Mailgun
                    const recordType = record.recordType || record.type || 'TXT'
                    const recordName = record.name || record.host || record.recordName || '@'
                    const recordValue = record.value || record.recordValue || ''
                    const priority = record.priority || record.priorityValue
                    const displayValue = priority ? `${priority} ${recordValue}` : recordValue
                    
                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {recordName === '@' ? 'Root Domain' : recordName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Type: {recordType}
                              {priority && ` | Priority: ${priority}`}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(displayValue)}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                            title="Copy to clipboard"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <div className="bg-gray-50 rounded p-2 mt-2">
                          <p className="text-sm font-mono break-all">
                            {displayValue || 'No value provided'}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> After adding DNS records, wait a few minutes for DNS propagation. 
                  If verification doesn't work immediately, you may need to manually trigger verification 
                  in your Mailgun dashboard by clicking "Check DNS settings" first, then try verifying here again.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleVerifyDomain} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Domain'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-4">
                  <Check className="text-green-600" size={48} />
                </div>
              </div>
              <h3 className="text-xl font-semibold">Domain Verified Successfully!</h3>
              <p className="text-gray-600">
                Your Mailgun domain is now ready. Users can request email addresses on this domain.
              </p>
              <div className="flex justify-end pt-4">
                <Button onClick={onClose}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Use portal to render outside any other modal context
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return modalContent
}

export default MailgunDomainSetup

