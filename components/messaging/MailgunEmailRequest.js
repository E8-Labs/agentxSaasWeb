'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertCircle, Plus } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import Apis from '@/components/apis/Apis'
import { getUserLocalData } from '@/components/constants/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MailgunEmailRequest = ({ open, onClose, onSuccess }) => {
  const [mailgunIntegrations, setMailgunIntegrations] = useState([])
  const [availableDomains, setAvailableDomains] = useState([]) // For subdomain creation
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('')
  const [emailPrefix, setEmailPrefix] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingIntegrations, setFetchingIntegrations] = useState(true)
  const [showCreateSubdomain, setShowCreateSubdomain] = useState(false)
  const [subdomainPrefix, setSubdomainPrefix] = useState('')
  const [selectedParentDomainId, setSelectedParentDomainId] = useState('')
  const [creatingSubdomain, setCreatingSubdomain] = useState(false)

  useEffect(() => {
    if (open) {
      fetchMailgunIntegrations()
      fetchAvailableDomains()
      // Reset form state when modal opens
      setEmailPrefix('')
      setDisplayName('')
      setSelectedIntegrationId('')
      setShowCreateSubdomain(false)
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
        // Select the newly created subdomain
        if (response.data.data?.id) {
          setSelectedIntegrationId(response.data.data.id.toString())
          setShowCreateSubdomain(false)
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
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative" 
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 100000 }}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Request Mailgun Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {fetchingIntegrations ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading available domains...</p>
            </div>
          ) : mailgunIntegrations.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    No verified domains available
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please ask your agency admin or platform admin to set up a Mailgun domain first.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="domain">Select Domain</Label>
                  {mailgunIntegrations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCreateSubdomain(!showCreateSubdomain)}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      {showCreateSubdomain ? 'Use Existing Domain' : 'Create Subdomain'}
                    </button>
                  )}
                </div>
                
                {showCreateSubdomain ? (
                  <div className="space-y-3 p-4 border border-purple-200 rounded-lg bg-purple-50">
                    {availableDomains.length > 0 ? (
                      <>
                        <div>
                          <Label htmlFor="parentDomain" className="text-sm">Parent Domain</Label>
                          <select
                            id="parentDomain"
                            value={selectedParentDomainId}
                            onChange={(e) => setSelectedParentDomainId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            style={{ pointerEvents: 'auto', zIndex: 10001 }}
                          >
                            {availableDomains.map((domain) => (
                              <option key={domain.id} value={domain.id.toString()}>
                                {domain.domain}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="subdomainPrefix" className="text-sm">Subdomain Prefix</Label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              id="subdomainPrefix"
                              type="text"
                              placeholder="example"
                              value={subdomainPrefix}
                              onChange={(e) => setSubdomainPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                              className="flex-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 md:text-sm"
                              autoComplete="off"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.target.focus()
                              }}
                              onFocus={(e) => {
                                e.stopPropagation()
                              }}
                            />
                            <span className="text-gray-500">.</span>
                            <span className="text-gray-700 font-medium text-sm">
                              {availableDomains.find(d => d.id.toString() === selectedParentDomainId)?.domain || ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Example: example.main.assignx.ai
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowCreateSubdomain(false)
                              setSubdomainPrefix('')
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleCreateSubdomain}
                            disabled={creatingSubdomain || !subdomainPrefix}
                          >
                            {creatingSubdomain ? 'Creating...' : 'Create Subdomain'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600">
                          Loading available domains...
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <select
                    id="domain"
                    value={selectedIntegrationId}
                    onChange={(e) => setSelectedIntegrationId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    {mailgunIntegrations.map((integration) => (
                      <option key={integration.id} value={integration.id.toString()}>
                        {integration.domain}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {!showCreateSubdomain && (
                <>
                  <div>
                    <Label htmlFor="emailPrefix">Email Address</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        id="emailPrefix"
                        type="text"
                        placeholder="john"
                        value={emailPrefix}
                        onChange={(e) => {
                          const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '')
                          setEmailPrefix(newValue)
                        }}
                        className="flex-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 md:text-sm"
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
                      <span className="text-gray-500">@</span>
                      <span className="text-gray-700 font-medium">
                        {selectedIntegration?.domain || ''}
                      </span>
                    </div>
                    {emailPrefix && selectedIntegration && (
                      <p className="text-sm text-gray-500 mt-1">
                        Full email: {emailPrefix}@{selectedIntegration.domain}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="displayName">Display Name (Optional)</Label>
                    <input
                      id="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-base shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 md:text-sm"
                      autoComplete="off"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.target.focus()
                      }}
                      onFocus={(e) => {
                        e.stopPropagation()
                      }}
                    />
                  </div>
                </>
              )}

              {!showCreateSubdomain && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button onClick={handleRequestEmail} disabled={loading || !emailPrefix}>
                    {loading ? 'Creating...' : 'Create Email'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  // Use portal to render outside any MUI Modal context
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return modalContent
}

export default MailgunEmailRequest

