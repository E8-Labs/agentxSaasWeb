'use client'

import { useState, useEffect } from 'react'
import { X, Phone, Check, Mail, MessageSquare, MoreVertical } from 'lucide-react'
import { Button as ButtonBase } from '../ui/button'

// Type assertion for Button component
const Button = ButtonBase as any
import { toast } from 'sonner'
import Image from 'next/image'

interface CallSummaryModalProps {
  open: boolean
  onClose: () => void
  leadId?: number
  leadName?: string
  leadPhone?: string
  callDuration: number // in seconds
  internalNumber?: string
  onCallBack?: () => void // Callback to handle call back
}

interface EmailTemplate {
  id: number
  templateName: string
  subject: string
  content: string
  communicationType: string
}

export default function CallSummaryModal({
  open,
  onClose,
  leadId,
  leadName,
  leadPhone,
  callDuration,
  internalNumber,
  onCallBack,
}: CallSummaryModalProps) {
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    if (showEmailPanel && emailTemplates.length === 0) {
      fetchEmailTemplates()
    }
  }, [showEmailPanel])

  const fetchEmailTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/templates?communicationType=email', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data?.status === true && data?.data) {
        setEmailTemplates(data.data)
      } else {
        toast.error('Failed to load email templates')
      }
    } catch (error: any) {
      console.error('Error fetching email templates:', error)
      toast.error('Failed to load email templates')
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedTemplate || !leadId) {
      toast.error('Please select a template')
      return
    }

    try {
      setSendingEmail(true)
      const localData = localStorage.getItem('User')
      let AuthToken = null
      if (localData) {
        const UserDetails = JSON.parse(localData)
        AuthToken = UserDetails.token
      }

      if (!AuthToken) {
        toast.error('Authentication required')
        return
      }

      const response = await fetch('/api/templates/send-email', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: leadId,
          templateId: selectedTemplate.id,
        }),
      })

      const data = await response.json()

      if (data?.status === true) {
        toast.success('Email sent successfully')
        setSelectedTemplate(null)
        setShowEmailPanel(false)
      } else {
        toast.error(data?.message || 'Failed to send email')
      }
    } catch (error: any) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')} Min ${secs.toString().padStart(2, '0')} Sec`
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-lg flex flex-row relative"
        style={{
          width: showEmailPanel ? '900px' : '500px',
          maxHeight: '80vh',
          transition: 'width 0.3s ease',
        }}
      >
        {/* Email Templates Panel - Left Side */}
        {showEmailPanel && (
          <div className="w-80 border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Select Email</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {templatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">Loading templates...</div>
                </div>
              ) : emailTemplates.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">No email templates found</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedTemplate?.id === template.id
                          ? 'border-2 border-purple-500 bg-purple-50'
                          : 'border border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {template.templateName}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {template.subject}
                          </div>
                          {template.content && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {template.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                            </div>
                          )}
                        </div>
                        <MoreVertical size={16} className="text-gray-400 ml-2 flex-shrink-0" />
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendEmail()
                            }}
                            disabled={sendingEmail}
                            className="w-full rounded-lg"
                            style={{
                              backgroundColor: 'hsl(var(--brand-primary))',
                              color: 'white',
                              fontSize: '14px',
                              padding: '8px 16px',
                            }}
                          >
                            {sendingEmail ? 'Sending...' : 'Send'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    // TODO: Open compose new email modal
                    toast.info('Compose new email feature coming soon')
                  }}
                  className="w-full rounded-lg border border-gray-300"
                  style={{
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    padding: '8px 16px',
                  }}
                >
                  <span className="mr-2">✏️</span>
                  Create Email
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Call Summary Panel - Right Side */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone size={16} style={{ color: 'hsl(var(--brand-primary))' }} />
              <h3 className="text-sm font-semibold text-gray-900">Call Summary</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              type="button"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Internal Number */}
            {internalNumber && (
              <div className="text-xs text-gray-500">{internalNumber}</div>
            )}

            {/* Contact Info */}
            <div className='flex flex-row gap-2'>
              <div className="text-base font-semibold text-gray-900">
                {leadName || 'Unknown Contact'}
              </div>
              {leadPhone && (
                <div className="text-sm text-gray-600 mt-1">{leadPhone}</div>
              )}
            </div>

            {/* Call Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-red-500" />
                <span className="text-sm text-red-500">Call Ended</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} style={{ color: 'hsl(var(--brand-primary))' }} />
                <span className="text-sm" style={{ color: 'hsl(var(--brand-primary))' }}>
                  Completed
                </span>
              </div>
            </div>

            {/* Call Duration */}
            <div className="text-sm text-gray-900">
              {formatDuration(callDuration)}
            </div>

            {/* Call Back Button */}
            <Button
              onClick={() => {
                if (onCallBack) {
                  onCallBack()
                } else if (leadPhone) {
                  // Fallback: try to trigger call if no callback provided
                  toast.info('Call back feature - please use the dialer to call back')
                } else {
                  toast.error('No phone number available to call back')
                }
              }}
              className="w-full rounded-lg border border-gray-300"
              style={{
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '14px',
                padding: '8px 16px',
              }}
            >
              <Phone size={16} className="mr-2" />
              Call Back
            </Button>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-300 my-4"></div>

            {/* Follow Up Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-900">Follow up</span>
                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">i</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => setShowEmailPanel(!showEmailPanel)}
                  className="w-full rounded-lg"
                  style={{
                    backgroundColor: 'hsl(var(--brand-primary))',
                    color: 'white',
                    fontSize: '14px',
                    padding: '10px 16px',
                  }}
                >
                  <Mail size={16} className="mr-2" />
                  Send Email
                </Button>

                <Button
                  onClick={() => {
                    // TODO: Implement send text functionality
                    toast.info('Send text feature coming soon')
                  }}
                  className="w-full rounded-lg border border-gray-300"
                  style={{
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '14px',
                    padding: '8px 16px',
                  }}
                >
                  <MessageSquare size={16} className="mr-2" />
                  Send Text
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

