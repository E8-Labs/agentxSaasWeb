'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { AuthToken } from '@/components/agency/plan/AuthDetails'

const ViewDnsRecordsModal = ({ open, onClose, domain, dnsRecords: initialDnsRecords, verificationStatus, mailgunIntegrationId }) => {
  const [dnsRecords, setDnsRecords] = useState(initialDnsRecords)
  const [loading, setLoading] = useState(false)
  const [currentVerificationStatus, setCurrentVerificationStatus] = useState(verificationStatus)
  // Fetch fresh DNS records from Mailgun
  const fetchFreshDnsRecords = async () => {
    if (!mailgunIntegrationId) return

    setLoading(true)
    try {
      const token = AuthToken()
      const response = await axios.get(
        `${Apis.fetchFreshDnsRecords}/${mailgunIntegrationId}/dns-records`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.data?.status) {
        const freshRecords = response.data.data.dnsRecords || []

        // If Mailgun returned empty records but we have existing ones, preserve them
        // This prevents clearing records when Mailgun API temporarily returns empty
        if (freshRecords.length === 0 && dnsRecords && dnsRecords.length > 0) {
          console.log('Mailgun returned empty records, preserving existing records')
          toast.warning('Mailgun returned no records. Showing existing records from database.')
        } else if (freshRecords.length > 0) {
          setDnsRecords(freshRecords)
          toast.success('DNS records refreshed from Mailgun')
        } else {
          // Both are empty, set to empty array
          setDnsRecords([])
        }

        // Always update verification status if provided
        if (response.data.data.verificationStatus) {
          setCurrentVerificationStatus(response.data.data.verificationStatus)
        }
      } else {
        toast.error(response.data?.message || 'Failed to fetch DNS records')
      }
    } catch (error) {
      console.error('Error fetching fresh DNS records:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch DNS records')
    } finally {
      setLoading(false)
    }
  }

  // Fetch fresh records when modal opens
  useEffect(() => {
    if (open && mailgunIntegrationId) {
      fetchFreshDnsRecords()
    } else if (open) {
      // If no integration ID, use initial records
      setDnsRecords(initialDnsRecords)
      setCurrentVerificationStatus(verificationStatus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mailgunIntegrationId])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  // Normalize dnsRecords - handle JSON strings, null, undefined, or non-array values
  const normalizeDnsRecords = () => {
    console.log('Raw dnsRecords received:', dnsRecords, 'Type:', typeof dnsRecords)

    if (!dnsRecords) {
      console.log('dnsRecords is falsy, returning empty array')
      return []
    }

    // If it's a string, try to parse it as JSON
    if (typeof dnsRecords === 'string') {
      try {
        const parsed = JSON.parse(dnsRecords)
        console.log('Parsed JSON string:', parsed)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        console.error('Error parsing dnsRecords JSON:', e, 'String value:', dnsRecords)
        return []
      }
    }

    // If it's already an array, return it
    if (Array.isArray(dnsRecords)) {
      console.log('dnsRecords is already an array:', dnsRecords)
      return dnsRecords
    }

    // If it's an object, try to extract array from common properties
    if (typeof dnsRecords === 'object' && dnsRecords !== null) {
      console.log('dnsRecords is an object:', dnsRecords)
      // Check if it has a records property or similar
      if (Array.isArray(dnsRecords.records)) {
        console.log('Found records array in object')
        return dnsRecords.records
      }
      if (Array.isArray(dnsRecords.dnsRecords)) {
        console.log('Found dnsRecords array in object')
        return dnsRecords.dnsRecords
      }
      // If it's an object with numeric keys, convert to array
      if (Object.keys(dnsRecords).every(key => !isNaN(key))) {
        console.log('Converting object with numeric keys to array')
        return Object.values(dnsRecords)
      }
    }

    console.log('Could not normalize dnsRecords, returning empty array')
    return []
  }

  const normalizedRecords = useMemo(() => {
    return normalizeDnsRecords()
  }, [dnsRecords])

  // Calculate actual verification status based on DNS records
  // Domain is ONLY verified if ALL DNS records are verified
  const actualVerificationStatus = useMemo(() => {
    if (!normalizedRecords || normalizedRecords.length === 0) {
      return currentVerificationStatus || 'pending'
    }
    
    // Check if all DNS records are verified
    const allRecordsVerified = normalizedRecords.every(record => {
      const valid = record.valid === 'valid' || record.valid === true
      const verified = record.verified === true
      return valid || verified
    })
    
    return allRecordsVerified ? 'verified' : 'pending'
  }, [normalizedRecords, currentVerificationStatus])

  // Get verification status for display - use actual status from DNS records
  const isVerified = actualVerificationStatus === 'verified'
  const isPending = actualVerificationStatus === 'pending' || !actualVerificationStatus

  if (!open) return null

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100002] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">DNS Records</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure DNS records for <span className="font-medium text-gray-700">{domain}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {mailgunIntegrationId && (
              <button
                onClick={fetchFreshDnsRecords}
                disabled={loading}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                title="Refresh DNS records from Mailgun"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Add these DNS records to your domain registrar
                </p>
                <p className="text-sm text-blue-700">
                  DNS propagation may take up to 48 hours. After adding records, wait a few minutes before verifying.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <AlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Important for MX Records:</p>
                <p className="text-blue-700">
                  When adding MX records, enter the <strong>Value</strong> and <strong>Priority</strong> in separate fields.
                  Do not include the priority number in the value field.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          {actualVerificationStatus && (
            <div className={`mt-6 p-4 rounded-lg border-l-4 ${isVerified
              ? 'bg-green-50 border-green-500'
              : 'bg-amber-50 border-amber-500'
              }`}>
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <>
                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        Domain Verified
                      </p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Your domain is ready to send and receive emails
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Clock size={20} className="text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Domain Pending
                      </p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Your records are still pending. Please double check with your domain provider.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {normalizedRecords.length === 0 ? (
            <div className="border border-yellow-200 rounded-lg p-6 bg-yellow-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <p className="text-sm font-semibold text-yellow-900 mb-2">
                    DNS Records Not Available
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    DNS records may still be generating. You can find them in your Mailgun dashboard:
                  </p>
                  <ol className="text-sm text-yellow-700 space-y-1 ml-4 list-decimal">
                    <li>Go to your Mailgun dashboard</li>
                    <li>Navigate to Sending → Domains</li>
                    <li>Click on your domain: <strong>{domain}</strong></li>
                    <li>Copy the DNS records shown there</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {/* Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Priority</th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Value</th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">TTL</th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {normalizedRecords.map((record, index) => {
                        // Handle different DNS record formats from Mailgun
                        const recordType = record.recordType || record.type || 'TXT'
                        const recordName = record.name || record.host || record.hostname || record.recordName || '@'
                        const recordValue = record.value || record.recordValue || ''
                        const priority = record.priority || record.priorityValue || null
                        const ttl = record.ttl || record.TTL || 'Auto'

                        // Display actual hostname - don't replace '@' with 'Root Domain'
                        // Mailgun returns the actual hostname for MX records (e.g., domain.com)
                        const displayName = recordName === '@' ? domain : recordName

                        // Get verification status from Mailgun (valid field)
                        // Mailgun returns 'valid' as a string: "valid" or "unknown"
                        const recordValid = record.valid
                        const showVerificationStatus = recordValid !== undefined && recordValid !== null
                        // "valid" means verified, "unknown" or anything else means pending
                        const recordVerified = recordValid === 'valid' || recordValid === true
                        const isMX = recordType === 'MX'

                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${isMX
                                ? 'bg-purple-100 text-purple-800'
                                : recordType === 'TXT'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                                }`}>
                                {recordType}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm font-medium text-gray-900">
                                {displayName}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-700 font-medium">
                                {priority !== null && priority !== undefined ? priority : <span className="text-gray-400">-</span>}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 max-w-md">
                                <code className="text-sm text-gray-900 break-all font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 flex-1">
                                  {(recordValue.slice(0, 20)) || <span className="text-gray-400">-</span>}
                                </code>
                                {recordValue && (
                                  <button
                                    onClick={() => copyToClipboard(recordValue)}
                                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded transition-colors"
                                    title="Copy value"
                                  >
                                    <Copy size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-gray-600">
                                {ttl}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {showVerificationStatus ? (
                                <div className="flex items-center gap-1.5">
                                  {recordVerified ? (
                                    <>
                                      <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                                      <span className="text-xs font-medium text-green-600">Verified</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={16} className="text-amber-600 flex-shrink-0" />
                                      <span className="text-xs font-medium text-amber-600">Pending</span>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>

                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}



          {/* Helpful Note */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">Tip:</strong> After adding DNS records, wait a few minutes for DNS propagation.
              If verification doesn't work immediately, manually trigger verification in your Mailgun dashboard
              by clicking "Check DNS settings" first, then try verifying again.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}

export default ViewDnsRecordsModal

