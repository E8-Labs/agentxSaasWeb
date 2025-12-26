'use client'

import React, { useMemo } from 'react'
import { X, Copy, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const ViewDnsRecordsModal = ({ open, onClose, domain, dnsRecords }) => {
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

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold">DNS Records for {domain}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add these DNS records to your domain registrar
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
            {normalizedRecords.length === 0 ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">
                      DNS Records Not Available
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      DNS records may still be generating. You can find them in your Mailgun dashboard:
                    </p>
                    <ol className="text-xs text-yellow-700 mt-2 ml-4 list-decimal space-y-1">
                      <li>Go to your Mailgun dashboard</li>
                      <li>Navigate to Sending → Domains</li>
                      <li>Click on your domain: <strong>{domain}</strong></li>
                      <li>Copy the DNS records shown there</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              normalizedRecords.map((record, index) => {
                // Handle different DNS record formats from Mailgun
                const recordType = record.recordType || record.type || 'TXT'
                const recordName = record.name || record.host || record.recordName || '@'
                const recordValue = record.value || record.recordValue || ''
                const priority = record.priority || record.priorityValue
                
                // For MX records, show value and priority separately
                // The value should NOT include the priority number
                const displayValue = recordValue
                
                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {recordName === '@' ? 'Root Domain' : recordName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: <span className="font-medium">{recordType}</span>
                          {priority && (
                            <>
                              {' '}| Priority: <span className="font-medium">{priority}</span>
                            </>
                          )}
                        </p>
                        {recordType === 'MX' && (
                          <p className="text-xs text-amber-600 mt-1 font-medium">
                            ⚠️ Enter Value and Priority separately in your DNS provider
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(displayValue)}
                        className="text-gray-400 hover:text-gray-600 ml-2 p-2 hover:bg-gray-100 rounded transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded p-3 mt-2">
                      <p className="text-sm font-mono break-all text-gray-900">
                        {displayValue || 'No value provided'}
                      </p>
                      {recordType === 'MX' && priority && (
                        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                          <strong>⚠️ Important for MX records:</strong> Enter <strong>"{displayValue}"</strong> in the <strong>Value</strong> field and <strong>"{priority}"</strong> in the <strong>Priority</strong> field separately. Do NOT include the priority number in the value.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex justify-end gap-2 pt-6 mt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewDnsRecordsModal

