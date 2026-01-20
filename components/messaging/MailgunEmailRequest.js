'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, AlertCircle, Plus, Settings, RefreshCw, Eye, Trash2, CheckCircle2, Clock } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import Apis from '@/components/apis/Apis'
import { getUserLocalData } from '@/components/constants/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MailgunDomainSetup from './MailgunDomainSetup'
import ViewDnsRecordsModal from './ViewDnsRecordsModal'

const MailgunEmailRequest = ({ open, onClose, onSuccess, targetUserId }) => {
  const [mailgunIntegrations, setMailgunIntegrations] = useState([])
  const [allMailgunIntegrations, setAllMailgunIntegrations] = useState([]) // Store all integrations for checking pending domains
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

  // For subaccount custom domain setup
  const [isSubaccount, setIsSubaccount] = useState(false)
  const [isAgentX, setIsAgentX] = useState(false)
  const [agencyHasMailgun, setAgencyHasMailgun] = useState(true) // Check if agency has Mailgun connected
  const [customDomain, setCustomDomain] = useState('')
  const [creatingDomain, setCreatingDomain] = useState(false)
  const [createdDomainIntegration, setCreatedDomainIntegration] = useState(null)
  const [verifyingDomain, setVerifyingDomain] = useState(false)
  const [viewingDnsRecords, setViewingDnsRecords] = useState(null)
  const [deletingDomain, setDeletingDomain] = useState(false)

  useEffect(() => {
    if (open) {
      // Check if user is subaccount or AgentX
      const userData = getUserLocalData()
      let isSub = false
      let isAgentXUser = false
      if (userData?.user) {
        const userRole = userData.user.userRole || userData.userRole
        isSub = userRole === 'AgencySubAccount'
        isAgentXUser = userRole === 'AgentX'
        setIsSubaccount(isSub)
        setIsAgentX(isAgentXUser)
      }
      
      // Reset agency Mailgun check
      setAgencyHasMailgun(true)
      
      fetchMailgunIntegrations()
      fetchAvailableDomains()
      // Reset form state when modal opens
      setEmailPrefix('')
      setDisplayName('')
      setSelectedIntegrationId('')
      setActiveTab('existing') // Always start with existing tab
      setSubdomainPrefix('')
      setSelectedParentDomainId('')
      setCustomDomain('')
      // Don't reset createdDomainIntegration here - let fetchMailgunIntegrations set it if there's an existing pending domain
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // When switching to custom tab, check for existing pending domain
  useEffect(() => {
    if (activeTab === 'custom' && (isSubaccount || isAgentX) && !createdDomainIntegration) {
      const pendingDomain = allMailgunIntegrations.find(
        (integration) => 
          ((integration.ownerType === 'subaccount' && isSubaccount) ||
           (integration.ownerType === 'agentx' && isAgentX)) && 
          integration.verificationStatus !== 'verified'
      )
      if (pendingDomain) {
        setCreatedDomainIntegration(pendingDomain)
        setCustomDomain(pendingDomain.domain)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isSubaccount, isAgentX, allMailgunIntegrations])

  const fetchMailgunIntegrations = async () => {
    setFetchingIntegrations(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      // Check user role directly from userData (for determining if current user is subaccount/AgentX)
      const userRole = userData?.user?.userRole || userData?.userRole
      const isSubaccountUser = userRole === 'AgencySubAccount'
      const isAgentXUser = userRole === 'AgentX'

      // Add userId query param if provided (for Agency/Admin viewing domains for subaccount)
      // Backend will return appropriate domains based on target user's role:
      // - For subaccount: agency's domains + subaccount's own domains
      // - For AgentX: platform domains (admin's) + AgentX's own domains
      let apiUrl = Apis.listMailgunIntegrations
      if (targetUserId && targetUserId !== userData?.user?.id) {
        apiUrl += `?userId=${targetUserId}`
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status) {
        const allIntegrations = response.data.data || []
        
        // Backend already returns the correct domains based on targetUserId
        // No need for additional filtering by ownerType - just filter by verification status
        
        // Check if agency/platform has Mailgun connected (for subaccount/AgentX context)
        // This is determined by checking if any returned integrations are agency/platform type
        const hasAgencyOrPlatformDomains = allIntegrations.some(
          (integration) => 
            (integration.ownerType === 'agency' || integration.ownerType === 'platform') &&
            integration.verificationStatus === 'verified' &&
            integration.isActive
        )
        
        // For subaccounts or when viewing for subaccount, check if agency has Mailgun
        if (isSubaccountUser || (targetUserId && allIntegrations.some(i => i.ownerType === 'agency'))) {
          setAgencyHasMailgun(hasAgencyOrPlatformDomains)
        }
        
        // Backend already returns the correct domains based on targetUserId:
        // - For subaccount: agency's domains + subaccount's own domains
        // - For AgentX: platform domains (admin's) + AgentX's own domains
        // We just need to filter for verified domains that can be used for email creation
        const availableIntegrations = allIntegrations.filter(
          (integration) => integration.verificationStatus === 'verified' && integration.isActive
        )
        
        
        setMailgunIntegrations(availableIntegrations)
        if (availableIntegrations.length > 0 && !selectedIntegrationId) {
          // Prefer verified domains, but select first available if none verified
          const verified = availableIntegrations.find(i => i.verificationStatus === 'verified')
          setSelectedIntegrationId((verified || availableIntegrations[0]).id.toString())
        }
        
        // Store all integrations for later use
        setAllMailgunIntegrations(allIntegrations)
        
        // For subaccounts and AgentX users, check if there's a pending domain they created
        // If so, set it as createdDomainIntegration so it shows in the "Setup Custom Domain" tab
        if ((isSubaccountUser || isAgentXUser) && !createdDomainIntegration) {
          const pendingDomain = allIntegrations.find(
            (integration) => 
              ((integration.ownerType === 'subaccount' && isSubaccountUser) ||
               (integration.ownerType === 'agentx' && isAgentXUser)) && 
              integration.verificationStatus !== 'verified'
          )
          if (pendingDomain) {
            setCreatedDomainIntegration(pendingDomain)
            setCustomDomain(pendingDomain.domain)
          }
        }
        
        return allIntegrations
      }
      return []
    } catch (error) {
      console.error('Error fetching Mailgun integrations:', error)
      toast.error('Failed to fetch available domains')
      return []
    } finally {
      setFetchingIntegrations(false)
    }
  }

  const fetchAvailableDomains = async () => {
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      // Add userId query param if provided (for Agency/Admin viewing available domains for subaccount)
      let apiUrl = Apis.getAvailableDomains
      if (targetUserId) {
        apiUrl += `?userId=${targetUserId}`
      }

      const response = await axios.get(apiUrl, {
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

      const requestBody = {
        parentMailgunIntegrationId: parseInt(selectedParentDomainId),
        subdomainPrefix: subdomainPrefix.toLowerCase(),
      }
      
      // Add userId if provided (for Agency/Admin creating subdomain for subaccount)
      if (targetUserId) {
        requestBody.userId = targetUserId
      }

      const response = await axios.post(
        Apis.createMailgunSubdomain,
        requestBody,
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

      const requestBody = {
        mailgunIntegrationId: parseInt(selectedIntegrationId),
        email,
        displayName: displayName || emailPrefix,
      }
      
      // Add userId if provided (for Agency/Admin creating email for subaccount)
      if (targetUserId) {
        requestBody.userId = targetUserId
      } else {}

      const response = await axios.post(
        Apis.requestMailgunEmail,
        requestBody,
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

  // Handle subaccount custom domain creation
  const handleCreateCustomDomain = async () => {
    if (!customDomain) {
      toast.error('Please enter a domain')
      return
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!domainRegex.test(customDomain)) {
      toast.error('Invalid domain format')
      return
    }

    setCreatingDomain(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      // Build request body
      const requestBody = { domain: customDomain }
      
      // Add userId if provided (for Agency/Admin creating domain for subaccount)
      if (targetUserId) {
        requestBody.userId = targetUserId
        // When creating for another user, API key is required (it's their own Mailgun account)
        // Note: This should be handled by the UI - if targetUserId is provided, user should provide API key
      }

      const response = await axios.post(
        Apis.createMailgunIntegration,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        toast.success('Domain created successfully!')
        // Clear the form
        setCustomDomain('')
        // Refresh integrations list to show the new domain in the list
        await fetchMailgunIntegrations()
        // Clear createdDomainIntegration so it shows in the list instead
        setCreatedDomainIntegration(null)
      } else {
        toast.error(response.data?.message || 'Failed to create domain')
      }
    } catch (error) {
      console.error('Error creating custom domain:', error)
      toast.error(error.response?.data?.message || 'Failed to create domain')
    } finally {
      setCreatingDomain(false)
    }
  }

  // Handle domain deletion
  const handleDeleteDomain = async (integrationId, domainName) => {
    if (!window.confirm(`Are you sure you want to delete the domain "${domainName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingDomain(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      const response = await axios.delete(
        `${Apis.deleteMailgunIntegration}/${integrationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        toast.success('Domain deleted successfully')
        // Refresh integrations list
        await fetchMailgunIntegrations()
        // Clear created domain integration if it was deleted
        if (createdDomainIntegration?.id === integrationId) {
          setCreatedDomainIntegration(null)
          setCustomDomain('')
        }
      } else {
        toast.error(response.data?.message || 'Failed to delete domain')
      }
    } catch (error) {
      console.error('Error deleting domain:', error)
      toast.error(error.response?.data?.message || 'Failed to delete domain')
    } finally {
      setDeletingDomain(false)
    }
  }

  // Handle domain verification
  const handleVerifyDomain = async (integrationId) => {
    setVerifyingDomain(true)
    try {
      const userData = getUserLocalData()
      const token = userData?.token

      const response = await axios.post(
        Apis.verifyMailgunDomain,
        { mailgunIntegrationId: integrationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data?.status) {
        if (response.data.data.verified) {
          toast.success('Domain verified successfully!')
          // Refresh integrations to update the list
          await fetchMailgunIntegrations()
          // Clear created domain integration so it shows in the domain list
          setCreatedDomainIntegration(null)
          setCustomDomain('')
          // Optionally switch to existing tab to select the verified domain
          // setActiveTab('existing')
        } else {
          toast.warning('Domain verification pending. Please check DNS records.')
          // Update created domain integration with fresh data
          await fetchMailgunIntegrations()
          const updated = allMailgunIntegrations.find(i => i.id === integrationId)
          if (updated && createdDomainIntegration?.id === integrationId) {
            setCreatedDomainIntegration(updated)
          }
        }
      } else {
        toast.error(response.data?.message || 'Failed to verify domain')
      }
    } catch (error) {
      console.error('Error verifying domain:', error)
      toast.error(error.response?.data?.message || 'Failed to verify domain')
    } finally {
      setVerifyingDomain(false)
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
        pointerEvents: showDomainSetup ? 'none' : 'auto',
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 relative" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          zIndex: 100000,
          pointerEvents: showDomainSetup ? 'none' : 'auto',
        }}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Setup your email</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isSubaccount && !agencyHasMailgun
                ? 'Contact your admin to get your email setup'
                : isSubaccount
                ? 'Connect your own domain to set up your email address'
                : 'Choose how you want to set up your email address'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation - Hide for subaccounts if agency doesn't have Mailgun */}
        {!(isSubaccount && !agencyHasMailgun) && (
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
        )}

        <div className="p-6 space-y-4">
          {fetchingIntegrations ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading available domains...</p>
            </div>
          ) : isSubaccount && !agencyHasMailgun ? (
            // Show message if subaccount and agency doesn't have Mailgun
            (<div className="text-center py-8">
              <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-sm text-gray-600">
                Contact your admin to get your email setup
              </p>
            </div>)
          ) : (
            <>
              {/* Tab 1: Use Existing Domain */}
              {activeTab === 'existing' && (
                <>
                  {mailgunIntegrations.length === 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                      <AlertCircle className="text-blue-600 mx-auto mb-3" size={32} />
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        No domains available
                      </p>
                      <p className="text-sm text-blue-700 mb-4">
                        {isSubaccount 
                          ? 'Switch to "Setup Custom Domain" tab to connect your own domain.'
                          : 'Switch to another tab to create a subdomain or set up your own custom domain.'}
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
                          {mailgunIntegrations.map((integration) => {
                            const isVerified = integration.verificationStatus === 'verified'
                            const statusText = isVerified ? '✓ Verified' : '⏳ Pending'
                            return (
                              <option key={integration.id} value={integration.id.toString()}>
                                {integration.domain} - {statusText}
                              </option>
                            )
                          })}
                        </select>
                        <p className="text-xs text-gray-500 mt-1.5">
                          {selectedIntegration?.verificationStatus === 'verified' 
                            ? 'Choose from available domains' 
                            : 'Pending domains need verification before use'}
                        </p>
                        {selectedIntegration && selectedIntegration.verificationStatus !== 'verified' && (
                          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={16} />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-amber-900 mb-1">
                                  Domain verification pending
                                </p>
                                <p className="text-xs text-amber-700 mb-2">
                                  This domain needs to be verified before you can create email addresses.
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewingDnsRecords(selectedIntegration)}
                                  className="text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-100"
                                >
                                  <Eye size={14} className="mr-1" />
                                  View DNS Records
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
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
                          disabled={
                            loading || 
                            !emailPrefix || 
                            !selectedIntegrationId ||
                            selectedIntegration?.verificationStatus !== 'verified'
                          }
                          className="bg-purple-600 hover:bg-purple-700"
                          title={selectedIntegration?.verificationStatus !== 'verified' ? 'Domain must be verified before creating email addresses' : ''}
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
                      Contact your admin to get your email setup
                      </p>
                    </div>
                  )}
                </div>
              )} */}

              {/* Tab 3: Setup Custom Domain */}
              {activeTab === 'custom' && (
                <div className="space-y-4">
                  {isSubaccount && !agencyHasMailgun ? (
                    // Subaccount with no agency Mailgun: Show message
                    (<div className="text-center py-8">
                      <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
                      <p className="text-sm text-gray-600">
                        Contact your admin to get your email setup
                      </p>
                    </div>)
                  ) : (
                    <>
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
                              {isSubaccount 
                                ? "Connect your own domain (e.g., mail.yourdomain.com). You'll need access to your domain's DNS settings."
                                : "Connect your own domain(eg. mail.yourdomain.com). You'll need access to your domain's DNS settings."
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {(isSubaccount || isAgentX) ? (
                        // Subaccount or AgentX: Show domain management list
                        (<>
                          {/* List of connected domains */}
                          {(() => {
                            const userDomains = allMailgunIntegrations.filter(
                              (integration) => 
                                (integration.ownerType === 'subaccount' && isSubaccount) ||
                                (integration.ownerType === 'agentx' && isAgentX)
                            )

                            return (
                              <div className="space-y-4">
                                {userDomains.length > 0 ? (
                                  <>
                                    <div className="space-y-3">
                                      {userDomains.map((integration) => (
                                        <div
                                          key={integration.id}
                                          className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <p className="text-sm font-semibold text-gray-900">
                                                  {integration.domain}
                                                </p>
                                                {integration.verificationStatus === 'verified' ? (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700">
                                                    <CheckCircle2 size={12} />
                                                    Verified
                                                  </span>
                                                ) : integration.verificationStatus === 'failed' ? (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">
                                                    <AlertCircle size={12} />
                                                    Failed
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700">
                                                    <Clock size={12} />
                                                    Pending
                                                  </span>
                                                )}
                                              </div>
                                              <p className="text-xs text-gray-500">
                                                {integration.verificationStatus === 'verified'
                                                  ? 'Ready to create email addresses'
                                                  : 'Add DNS records to verify this domain'}
                                              </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setViewingDnsRecords(integration)}
                                                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                                              >
                                                <Eye size={14} className="mr-1" />
                                                DNS
                                              </Button>
                                              {integration.verificationStatus !== 'verified' && (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleVerifyDomain(integration.id)}
                                                  disabled={verifyingDomain}
                                                  className="border-green-600 text-green-600 hover:bg-green-50"
                                                >
                                                  {verifyingDomain ? 'Verifying...' : 'Verify'}
                                                </Button>
                                              )}
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteDomain(integration.id, integration.domain)}
                                                disabled={deletingDomain}
                                                className="border-red-600 text-red-600 hover:bg-red-50"
                                              >
                                                <Trash2 size={14} className="mr-1" />
                                                Delete
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </>
                                ) : null}

                                {/* Add new domain form */}
                                {!createdDomainIntegration ? (
                                  <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                      {userDomains.length > 0 ? 'Connect Another Domain' : 'Connect Your Domain'}
                                    </p>
                                    <div>
                                      <Label htmlFor="customDomain" className="text-sm font-medium text-gray-700">
                                        Domain
                                      </Label>
                                      <input
                                        id="customDomain"
                                        type="text"
                                        placeholder="mail.yourdomain.com"
                                        value={customDomain}
                                        onChange={(e) => setCustomDomain(e.target.value.toLowerCase().trim())}
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
                                        Enter your email subdomain (e.g., mail.yourdomain.com)
                                      </p>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                      <Button
                                        type="button"
                                        onClick={handleCreateCustomDomain}
                                        disabled={creatingDomain || !customDomain}
                                        className="bg-purple-600 hover:bg-purple-700"
                                      >
                                        {creatingDomain ? 'Creating...' : 'Create Domain'}
                                      </Button>
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            )
                          })()}
                        </>)
                      ) : (
                        // Non-subaccount: Show "Start Domain Setup" button (original behavior)
                        (<div className="text-center py-6">
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
                        </div>)
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Mailgun Domain Setup Modal - Only for non-subaccounts */}
      {!isSubaccount && (
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
      )}

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
    </div>
  )

  // Use portal to render outside any MUI Modal context
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}

export default MailgunEmailRequest

