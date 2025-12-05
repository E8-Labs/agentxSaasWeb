import axios from 'axios'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from '@/components/dashboard/leads/AgentSelectSnackMessage'

import LabelingHeader from './LabelingHeader'

const DomainConfig = () => {
  const [subdomain, setSubdomain] = useState(null)
  const [customDomain, setCustomDomain] = useState('')
  const [domainStatus, setDomainStatus] = useState(null) // { domain, status, sslStatus, dnsRecords, verifiedAt, lastCheckedAt }
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showSnackMessage, setShowSnackMessage] = useState({
    type: SnackbarTypes.Error,
    message: '',
    isVisible: false,
  })
  const [copiedFields, setCopiedFields] = useState({}) // Track which fields are copied
  const autoRefreshIntervalRef = useRef(null)

  // Fetch subdomain and domain status on mount
  useEffect(() => {
    fetchSubdomain()
    fetchDomainStatus()
    return () => {
      // Cleanup auto-refresh on unmount
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
      }
    }
  }, [])

  const fetchSubdomain = async () => {
    try {
      const localData = localStorage.getItem('User')
      let authToken = null

      if (localData) {
        const userData = JSON.parse(localData)
        authToken = userData.token
      }

      if (!authToken) {
        setFetching(false)
        return
      }

      const response = await axios.get(Apis.getAgencyBranding, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response?.data?.status === true && response?.data?.data) {
        setSubdomain(response.data.data.subdomain)
      }
    } catch (error) {
      console.error('Error fetching subdomain:', error)
    } finally {
      setFetching(false)
    }
  }

  const fetchDomainStatus = useCallback(async () => {
    try {
      const localData = localStorage.getItem('User')
      let authToken = null

      if (localData) {
        const userData = JSON.parse(localData)
        authToken = userData.token
      }

      if (!authToken) {
        setFetching(false)
        return
      }

      const response = await axios.get(Apis.getDomainStatus, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response?.data?.status === true) {
        if (response.data.data) {
          const domainData = response.data.data
          setDomainStatus({
            ...domainData,
            // Show DNS records even if domain is verified (in case they need to be updated)
            // DNS records should be shown if they exist, regardless of verification status
            dnsRecords: domainData.dnsRecords || [],
            needsDnsConfiguration: domainData.needsDnsConfiguration || false,
            warning: domainData.warning || null,
          })
          setCustomDomain(domainData.domain)
        } else {
          setDomainStatus(null)
          setCustomDomain('')
        }
      }
    } catch (error) {
      console.error('Error fetching domain status:', error)
      if (error.response?.status !== 404) {
        setShowSnackMessage({
          type: SnackbarTypes.Error,
          message: 'Failed to fetch domain status',
          isVisible: true,
        })
      }
    } finally {
      setFetching(false)
    }
  }, [])

  const handleAddDomain = async () => {
    if (!customDomain.trim()) {
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'Please enter a domain',
        isVisible: true,
      })
      return
    }

    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      let authToken = null

      if (localData) {
        const userData = JSON.parse(localData)
        authToken = userData.token
      }

      if (!authToken) {
        setShowSnackMessage({
          type: SnackbarTypes.Error,
          message: 'Authentication required',
          isVisible: true,
        })
        return
      }

      const response = await axios.post(
        Apis.addCustomDomain,
        { domain: customDomain.trim() },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response?.data?.status === true) {
        const responseData = response.data.data || {}

        // If DNS records are provided in the response, set them immediately
        if (responseData.dnsRecords && responseData.dnsRecords.length > 0) {
          setDomainStatus({
            domain: responseData.domain || customDomain,
            status: responseData.verified ? 'verified' : 'pending',
            sslStatus: 'pending',
            dnsRecords: responseData.dnsRecords,
          })
          setShowSnackMessage({
            type: SnackbarTypes.Success,
            message:
              'Domain added successfully. Please add the DNS records below.',
            isVisible: true,
          })
        } else {
          setShowSnackMessage({
            type: SnackbarTypes.Success,
            message: 'Domain added successfully.',
            isVisible: true,
          })
        }

        // Refresh domain status to get latest DNS records
        await fetchDomainStatus()
      }
    } catch (error) {
      console.error('Error adding domain:', error)
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message:
          error.response?.data?.message ||
          'Failed to add domain. Please try again.',
        isVisible: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDomain = async () => {
    if (!customDomain.trim()) {
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message: 'No domain to verify',
        isVisible: true,
      })
      return
    }

    try {
      setVerifying(true)
      const localData = localStorage.getItem('User')
      let authToken = null

      if (localData) {
        const userData = JSON.parse(localData)
        authToken = userData.token
      }

      if (!authToken) {
        setShowSnackMessage({
          type: SnackbarTypes.Error,
          message: 'Authentication required',
          isVisible: true,
        })
        return
      }

      const response = await axios.post(
        Apis.verifyCustomDomain,
        { domain: customDomain.trim() },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      )

      if (response?.data?.status === true) {
        setShowSnackMessage({
          type: response.data.verified
            ? SnackbarTypes.Success
            : SnackbarTypes.Warning,
          message:
            response.data.message ||
            (response.data.verified
              ? 'Domain verified successfully!'
              : 'Domain verification pending. Please check your DNS records.'),
          isVisible: true,
        })
        // Refresh domain status
        await fetchDomainStatus()
      }
    } catch (error) {
      console.error('Error verifying domain:', error)
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message:
          error.response?.data?.message ||
          'Failed to verify domain. Please try again.',
        isVisible: true,
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleRemoveDomain = async () => {
    if (!customDomain.trim()) {
      return
    }

    if (
      !window.confirm(
        'Are you sure you want to disconnect this domain? This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      let authToken = null

      if (localData) {
        const userData = JSON.parse(localData)
        authToken = userData.token
      }

      if (!authToken) {
        setShowSnackMessage({
          type: SnackbarTypes.Error,
          message: 'Authentication required',
          isVisible: true,
        })
        return
      }

      const response = await axios.delete(Apis.removeCustomDomain, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: { domain: customDomain.trim() },
      })

      if (response?.data?.status === true) {
        setShowSnackMessage({
          type: SnackbarTypes.Success,
          message: 'Domain removed successfully',
          isVisible: true,
        })
        setDomainStatus(null)
        setCustomDomain('')
      }
    } catch (error) {
      console.error('Error removing domain:', error)
      setShowSnackMessage({
        type: SnackbarTypes.Error,
        message:
          error.response?.data?.message ||
          'Failed to remove domain. Please try again.',
        isVisible: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const stopAutoRefresh = useCallback(() => {
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current)
      autoRefreshIntervalRef.current = null
    }
  }, [])

  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh() // Clear any existing interval
    autoRefreshIntervalRef.current = setInterval(() => {
      fetchDomainStatus()
    }, 30000) // Refresh every 30 seconds
  }, [stopAutoRefresh, fetchDomainStatus])

  // Auto-refresh domain status if pending
  useEffect(() => {
    if (domainStatus && domainStatus.status === 'pending') {
      startAutoRefresh()
    } else {
      stopAutoRefresh()
    }
    return () => stopAutoRefresh()
  }, [domainStatus, startAutoRefresh, stopAutoRefresh])

  const getStatusBadge = (status) => {
    const statusConfig = {
      verified: { text: 'Verified', className: 'bg-green-100 text-green-800' },
      pending: { text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      failed: { text: 'Failed', className: 'bg-red-100 text-red-800' },
      verifying: {
        text: 'Verifying',
        className: 'bg-blue-100 text-blue-800',
      },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
      >
        {config.text}
      </span>
    )
  }

  // Helper function for fallback clipboard copy method (synchronous)
  const copyWithFallback = (text) => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        console.log('✅ Copied to clipboard using execCommand')
        return true
      } else {
        console.error('execCommand copy failed')
        return false
      }
    } catch (fallbackError) {
      console.error('Fallback copy method failed:', fallbackError)
      return false
    }
  }

  const handleCopyField = async (text, fieldId) => {
    // Copy to clipboard IMMEDIATELY (synchronously) to preserve user gesture context
    const copySuccess = copyWithFallback(text)

    if (copySuccess) {
      setCopiedFields((prev) => ({ ...prev, [fieldId]: true }))
    } else {
      // If fallback fails, try async clipboard API as last resort
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
          console.log('✅ Copied to clipboard using Clipboard API')
          setCopiedFields((prev) => ({ ...prev, [fieldId]: true }))
        }
      } catch (clipboardError) {
        console.error('All clipboard methods failed:', clipboardError)
      }
    }

    // Reset the "Copied" state after 2 seconds
    setTimeout(() => {
      setCopiedFields((prev) => ({ ...prev, [fieldId]: false }))
    }, 2000)
  }

  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={'/agencyIcons/globe.png'}
        title={'Setup your custom domain'}
        description={'Connect your domain and add DNS record.'}
      />

      {/* Domain Configuration Card */}
      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col gap-6 overflow-hidden">
          {/* Auto Subdomain Display (Always visible, read-only) */}
          {/* {subdomain && (
            <div className="w-full">
              <div className="text-start mb-2" style={styles.semiBoldHeading}>
                Your Subdomain
              </div>
              <div className="w-full flex flex-row items-center gap-2">
                <input
                  style={styles.inputs}
                  className="w-full border border-gray-200 outline-none focus:ring-0 rounded-md p-2 bg-gray-50"
                  value={subdomain}
                  readOnly
                  disabled
                />
              </div>
              <div className="text-sm text-gray-500 mt-1">
                This subdomain is automatically assigned and always active
              </div>
            </div>
          )} */}

          {/* Connect Domain Section */}
          <div className="w-full">
            <div className="text-start mb-2" style={styles.semiBoldHeading}>
            Enter a domain or sub domain
            </div>
            <div className="w-full flex flex-row items-center gap-2">
              <input
                style={styles.inputs}
                className="w-[90%] border border-gray-200 outline-none focus:ring-0 rounded-md p-2"
                placeholder="app.assignx.ai or assignx.ai"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                disabled={loading || !!domainStatus}
              />
              <button
                className="bg-brand-primary text-white rounded-md px-4 py-2 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddDomain}
                disabled={loading || !!domainStatus}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Show warning message if DNS configuration is needed - MOVED ABOVE DNS RECORDS */}
            {domainStatus &&
              domainStatus.needsDnsConfiguration &&
              domainStatus.warning && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 text-lg">⚠️</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-yellow-900 mb-1">
                        DNS Configuration Required
                      </div>
                      <div className="text-xs text-yellow-700">
                        {domainStatus.warning}
                      </div>
                      {(!domainStatus.dnsRecords ||
                        domainStatus.dnsRecords.length === 0) && (
                        <div className="text-xs text-yellow-600 mt-2">
                          If DNS records are not shown above, please contact
                          support for assistance with domain configuration.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* DNS Records Table */}
            {domainStatus &&
              domainStatus.dnsRecords &&
              domainStatus.dnsRecords.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">DNS Records</div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium">
                            Type
                          </th>
                          <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium">
                            Host
                          </th>
                          <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium">
                            Value
                          </th>
                          <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium">
                            TTL
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {domainStatus.dnsRecords.map((record, index) => {
                          const hostFieldId = `host-${index}`
                          const valueFieldId = `value-${index}`
                          return (
                            <tr key={index}>
                              <td className="border border-gray-200 px-3 py-2 text-sm">
                                {record.type}
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="flex-1">{record.host}</span>
                                  <button
                                    onClick={() =>
                                      handleCopyField(record.host, hostFieldId)
                                    }
                                    className="text-brand-primary hover:text-brand-primary/80 text-xs font-medium px-2 py-1 rounded transition-colors"
                                    title="Copy host"
                                  >
                                    {copiedFields[hostFieldId] ? 'Copied' : 'Copy'}
                                  </button>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-sm break-all">
                                <div className="flex items-center gap-2">
                                  <span className="flex-1 break-all">
                                    {record.value}
                                  </span>
                                  <button
                                    onClick={() =>
                                      handleCopyField(record.value, valueFieldId)
                                    }
                                    className="text-purple hover:text-purple-700 text-xs font-medium px-2 py-1 rounded transition-colors flex-shrink-0"
                                    title="Copy value"
                                  >
                                    {copiedFields[valueFieldId] ? 'Copied' : 'Copy'}
                                  </button>
                                </div>
                              </td>
                              <td className="border border-gray-200 px-3 py-2 text-sm">
                                {record.ttl || '600/auto'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    After adding these records, it may take up to 48 hours for
                    DNS changes to propagate globally
                  </div>
                </div>
              )}
          </div>

          {/* Verify Domain Section */}
          {domainStatus && (
            <div className="w-full">
              <div className="text-start mb-2" style={styles.semiBoldHeading}>
                Verify Domain
              </div>
              <div className="w-full flex flex-row items-center gap-3">
                <div className="flex-1">
                  <input
                    style={styles.inputs}
                    className="w-full border border-gray-200 outline-none focus:ring-0 rounded-md p-2"
                    value={domainStatus.domain}
                    readOnly
                    disabled
                  />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(domainStatus.status)}
                  {/* Only show Verify Domain button if not verified */}
                  {domainStatus.status !== 'verified' && (
                    <button
                      className="bg-gray-500 text-white rounded-md px-4 py-2 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleVerifyDomain}
                      disabled={verifying}
                    >
                      {verifying ? 'Verifying...' : 'Verify Domain'}
                    </button>
                  )}
                  <button
                    className="bg-gray-400 text-white rounded-md px-4 py-2 text-center hover:bg-gray-500"
                    onClick={handleRemoveDomain}
                    disabled={loading}
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Show message when DNS records are missing but domain is verified */}
              {domainStatus.needsDnsConfiguration &&
                (!domainStatus.dnsRecords ||
                  domainStatus.dnsRecords.length === 0) && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="text-sm font-medium text-orange-900 mb-2">
                      DNS Records Not Available
                    </div>
                    <div className="text-xs text-orange-700 mb-2">
                      Your domain is marked as verified, but DNS records are not
                      available. This usually means:
                    </div>
                    <ul className="text-xs text-orange-700 list-disc list-inside mb-2 space-y-1">
                      <li>
                        DNS records need to be configured at your domain
                        provider
                      </li>
                      <li>The domain configuration may need to be updated</li>
                      <li>
                        Please contact support if you need assistance with DNS
                        configuration
                      </li>
                    </ul>
                    <div className="text-xs text-orange-600">
                      After adding DNS records, click &quot;Verify Domain&quot;
                      to check the status.
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Snackbar Message */}
      {showSnackMessage.isVisible && (
        <AgentSelectSnackMessage
          type={showSnackMessage.type}
          message={showSnackMessage.message}
          isVisible={showSnackMessage.isVisible}
          onClose={() =>
            setShowSnackMessage({
              ...showSnackMessage,
              isVisible: false,
            })
          }
        />
      )}
    </div>
  )
}

export default DomainConfig

const styles = {
  semiBoldHeading: { fontSize: 18, fontWeight: '600' },
  smallRegular: { fontSize: 13, fontWeight: '400' },
  regular: { fontSize: 16, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}
