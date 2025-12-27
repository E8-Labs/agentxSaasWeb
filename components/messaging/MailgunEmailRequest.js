'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertCircle, Plus, Settings } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import Apis from '@/components/apis/Apis'
import { getUserLocalData } from '@/components/constants/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MailgunDomainSetup from './MailgunDomainSetup'

const MailgunEmailRequest = ({ open, onClose, onSuccess }) => {
  const [mailgunIntegrations, setMailgunIntegrations] = useState([])
  const [availableDomains, setAvailableDomains] = useState([]) // For subdomain creation
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('')
  const [emailPrefix, setEmailPrefix] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingIntegrations, setFetchingIntegrations] = useState(true)
  const [activeTab, setActiveTab] = useState('existing') // 'existing', 'subdomain', 'custom'
  const [subdomainPrefix, setSubdomainPrefix] = useState('')
  const [selectedParentDomainId, setSelectedParentDomainId] = useState('')
  const [creatingSubdomain, setCreatingSubdomain] = useState(false)
  const [showDomainSetup, setShowDomainSetup] = useState(false)

  useEffect(() => {
    if (open) {
      fetchMailgunIntegrations()
      fetchAvailableDomains()
      // Reset form state when modal opens
      setEmailPrefix('')
      setDisplayName('')
      setSelectedIntegrationId('')
      setActiveTab('existing')
      setSubdomainPrefix('')
      setSelectedParentDomainId('')
    }
  }, [open])

  const fetchMailgunIntegrations = async () => {
    setFetchingIntegrations(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      const response = await axios.get(Apis.listMailgunIntegrations, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status) {
        const verifiedIntegrations = response.data.data.filter(
          (integration) => integration.verificationStatus === 'verified' && integration.isActive
        )
        setMailgunIntegrations(verifiedIntegrations)
        if (verifiedIntegrations.length > 0 && !selectedIntegrationId) {
          setSelectedIntegrationId(verifiedIntegrations[0].id.toString())
        }
      }
    } catch (error) {
      console.error('Error fetching Mailgun integrations:', error)
      toast.error('Failed to fetch available domains')
    } finally {
      setFetchingIntegrations(false)
    }
  }

  const fetchAvailableDomains = async () => {
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      const response = await axios.get(Apis.getAvailableDomains, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status) {
        setAvailableDomains(response.data.data || [])
        if (response.data.data && response.data.data.length > 0) {
          setSelectedParentDomainId(response.data.data[0].id.toString())
        }
      }
    } catch (error) {
      console.error('Error fetching available domains:', error)
      // Don't show error toast - this is optional for subdomain creation
    }
  }

  const handleCreateSubdomain = async () => {
    if (!selectedParentDomainId || !subdomainPrefix) {
      toast.error('Please select a parent domain and enter a subdomain prefix')
      return
    }

    // Validate subdomain prefix
    const prefixRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
    if (!prefixRegex.test(subdomainPrefix)) {
      toast.error('Invalid subdomain prefix. Use only letters, numbers, and hyphens.')
      return
    }

    setCreatingSubdomain(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      const response = await axios.post(
        Apis.createMailgunSubdomain,
        {
          parentMailgunIntegrationId: parseInt(selectedParentDomainId),
          subdomainPrefix: subdomainPrefix.toLowerCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        toast.success('Subdomain created! Please configure DNS records and verify it.')
        // Refresh integrations list
        await fetchMailgunIntegrations()
        // Select the newly created subdomain and switch to existing tab
        if (response.data.data?.id) {
          setSelectedIntegrationId(response.data.data.id.toString())
          setActiveTab('existing')
          setSubdomainPrefix('')
        }
      } else {
        toast.error(response.data?.message || 'Failed to create subdomain')
      }
    } catch (error) {
      console.error('Error creating subdomain:', error)
      toast.error(error.response?.data?.message || 'Failed to create subdomain')
    } finally {
      setCreatingSubdomain(false)
    }
  }

  const handleRequestEmail = async () => {
    if (!selectedIntegrationId || !emailPrefix) {
      toast.error('Please select a domain and enter an email address')
      return
    }

    const selectedIntegration = mailgunIntegrations.find(
      (integration) => integration.id.toString() === selectedIntegrationId
    )

    if (!selectedIntegration) {
      toast.error('Selected domain not found')
      return
    }

    const email = `${emailPrefix}@${selectedIntegration.domain}`

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format')
      return
    }

    setLoading(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      const response = await axios.post(
        Apis.requestMailgunEmail,
        {
          mailgunIntegrationId: parseInt(selectedIntegrationId),
          email,
          displayName: displayName || emailPrefix,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        toast.success('Email address created successfully!')
        if (onSuccess) {
          onSuccess()
        }
        onClose()
      } else {
        toast.error(response.data?.message || 'Failed to create email address')
      }
    } catch (error) {
      console.error('Error requesting Mailgun email:', error)
      toast.error(error.response?.data?.message || 'Failed to create email address')
    } finally {
      setLoading(false)
    }
  }

  const selectedIntegration = mailgunIntegrations.find(
    (integration) => integration.id.toString() === selectedIntegrationId
  )

  if (!open) return null

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center" 
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      style={{ 
        zIndex: 99999,
        position: 'fixed',
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 relative" 
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100000 }}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Request Mailgun Email</h2>
            <p className="text-sm text-gray-500 mt-1">Choose how you want to set up your email address</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-1 -mb-px">
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'existing'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Use Existing Domain
            </button>
            {/* Commented out for now */}
            {/* <button
              type="button"
              onClick={() => setActiveTab('subdomain')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'subdomain'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Subdomain
            </button> */}
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Setup Custom Domain
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {fetchingIntegrations ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading available domains...</p>
            </div>
          ) : (
            <>
              {/* Tab 1: Use Existing Domain */}
              {activeTab === 'existing' && (
                <>
                  {mailgunIntegrations.length === 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <AlertCircle className="text-blue-600 mx-auto mb-3" size={32} />
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        No verified domains available
                      </p>
                      <p className="text-sm text-blue-700 mb-4">
                        Switch to another tab to create a subdomain or set up your own custom domain.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="domain" className="text-sm font-medium text-gray-700">
                          Select Domain
                        </Label>
                        <select
                          id="domain"
                          value={selectedIntegrationId}
                          onChange={(e) => setSelectedIntegrationId(e.target.value)}
                          className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
                        >
                          {mailgunIntegrations.map((integration) => (
                            <option key={integration.id} value={integration.id.toString()}>
                              {integration.domain}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Choose from available verified domains
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="emailPrefix" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            id="emailPrefix"
                            type="text"
                            placeholder="john"
                            value={emailPrefix}
                            onChange={(e) => {
                              const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')
                              setEmailPrefix(newValue)
                            }}
                            className="flex-1 h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            autoComplete="off"
                            autoFocus
                            onClick={(e) => {
                              e.stopPropagation()
                              e.target.focus()
                            }}
                            onFocus={(e) => {
                              e.stopPropagation()
                            }}
                          />
                          <span className="text-gray-400 text-sm">@</span>
                          <span className="text-gray-700 font-medium text-sm min-w-[120px]">
                            {selectedIntegration?.domain || ''}
                          </span>
                        </div>
                        {emailPrefix && selectedIntegration && (
                          <p className="text-xs text-gray-500 mt-1.5">
                            Your email will be: <span className="font-medium text-gray-700">{emailPrefix}@{selectedIntegration.domain}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                          Display Name <span className="text-gray-400 font-normal">(Optional)</span>
                        </Label>
                        <input
                          id="displayName"
                          type="text"
                          placeholder="John Doe"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="mt-2 h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          autoComplete="off"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.target.focus()
                          }}
                          onFocus={(e) => {
                            e.stopPropagation()
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                          This name will appear as the sender name in emails
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} type="button">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleRequestEmail} 
                          disabled={loading || !emailPrefix || !selectedIntegrationId}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {loading ? 'Creating...' : 'Create Email'}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Tab 2: Create Subdomain - Commented out for now */}
              {/* {activeTab === 'subdomain' && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Plus className="text-blue-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Create a Subdomain
                        </p>
                        <p className="text-xs text-blue-700">
                          Create a subdomain from an existing domain (e.g., <span className="font-mono">salman.main.assignx.ai</span>). 
                          You'll need to configure DNS records after creation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {availableDomains.length > 0 ? (
                    <>
                      <div>
                        <Label htmlFor="parentDomain" className="text-sm font-medium text-gray-700">
                          Parent Domain
                        </Label>
                        <select
                          id="parentDomain"
                          value={selectedParentDomainId}
                          onChange={(e) => setSelectedParentDomainId(e.target.value)}
                          className="mt-2 w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
                        >
                          {availableDomains.map((domain) => (
                            <option key={domain.id} value={domain.id.toString()}>
                              {domain.domain}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Select the domain to create a subdomain from
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="subdomainPrefix" className="text-sm font-medium text-gray-700">
                          Subdomain Prefix
                        </Label>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            id="subdomainPrefix"
                            type="text"
                            placeholder="salman"
                            value={subdomainPrefix}
                            onChange={(e) => setSubdomainPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            autoComplete="off"
                            onClick={(e) => {
                              e.stopPropagation()
                              e.target.focus()
                            }}
                            onFocus={(e) => {
                              e.stopPropagation()
                            }}
                          />
                          <span className="text-gray-400 text-sm">.</span>
                          <span className="text-gray-700 font-medium text-sm min-w-[150px]">
                            {availableDomains.find(d => d.id.toString() === selectedParentDomainId)?.domain || ''}
                          </span>
                        </div>
                        {subdomainPrefix && (
                          <p className="text-xs text-gray-500 mt-1.5">
                            Your subdomain will be: <span className="font-mono font-medium text-gray-700">{subdomainPrefix}.{availableDomains.find(d => d.id.toString() === selectedParentDomainId)?.domain || ''}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setActiveTab('existing')} type="button">
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCreateSubdomain}
                          disabled={creatingSubdomain || !subdomainPrefix}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {creatingSubdomain ? 'Creating...' : 'Create Subdomain'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="text-gray-400 mx-auto mb-3" size={32} />
                      <p className="text-sm text-gray-600 mb-1">No parent domains available</p>
                      <p className="text-xs text-gray-500">
                        Ask your agency admin to set up a domain, or use the "Setup Custom Domain" tab to create your own.
                      </p>
                    </div>
                  )}
                </div>
              )} */}

              {/* Tab 3: Setup Custom Domain */}
              {activeTab === 'custom' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 rounded-full p-2">
                        <Settings className="text-purple-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-purple-900 mb-1">
                          Setup Your Own Custom Domain
                        </p>
                        <p className="text-xs text-purple-700">
                          Connect your own domain (e.g., <span className="font-mono">mail.yourdomain.com</span>) with your Mailgun account. 
                          You'll need your Mailgun API key and access to your domain's DNS settings.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center py-6">
                    <Settings className="text-gray-400 mx-auto mb-4" size={48} />
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Ready to set up your custom domain?
                    </p>
                    <p className="text-xs text-gray-500 mb-6">
                      We'll guide you through the process step by step
                    </p>
                    <Button
                      type="button"
                      onClick={() => setShowDomainSetup(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Settings size={16} className="mr-2" />
                      Start Domain Setup
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Mailgun Domain Setup Modal */}
      <MailgunDomainSetup
        open={showDomainSetup}
        onClose={() => setShowDomainSetup(false)}
        onSuccess={() => {
          setShowDomainSetup(false)
          // Refresh the integrations list after domain is created
          fetchMailgunIntegrations()
          toast.success('Domain setup completed! You can now request an email address.')
        }}
      />
    </div>
  )

  // Use portal to render outside any MUI Modal context
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return modalContent
}

export default MailgunEmailRequest

