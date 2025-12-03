'use client'

import React, { useState, useRef } from 'react'
import axios from 'axios'
import moment from 'moment'
import Image from 'next/image'
import { Paperclip } from '@phosphor-icons/react'
import { Drawer } from '@mui/material'
import { toast } from 'sonner'

import Apis from '@/components/apis/Apis'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Input } from '@/components/ui/input'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'

const EmailTimelineModal = ({
  open,
  onClose,
  leadId,
  subject,
  messages,
  loading,
  selectedThread,
  emailAccounts,
  selectedEmailAccount,
  setSelectedEmailAccount,
  onSendSuccess,
  fetchThreads,
}) => {
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const richTextEditorRef = useRef(null)

  const handleClose = () => {
    setReplyBody('')
    onClose()
  }

  const handleSend = async () => {
    if (!replyBody.trim() || !selectedEmailAccount || !leadId || !subject) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setSending(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        toast.error('Please log in')
        return
      }

      const userData = JSON.parse(localData)
      const token = userData.token

      const formData = new FormData()
      formData.append('leadId', leadId)
      formData.append('subject', subject)
      formData.append('body', replyBody)
      formData.append('emailAccountId', selectedEmailAccount)

      const response = await axios.post(Apis.sendEmailToLead, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data?.status) {
        toast.success('Email sent successfully')
        setReplyBody('')
        if (onSendSuccess) {
          await onSendSuccess()
        }
        if (fetchThreads) {
          fetchThreads()
        }
      } else {
        toast.error(response.data?.message || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(error.response?.data?.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const getRecipientEmail = () => {
    if (!messages || messages.length === 0) {
      return selectedThread?.lead?.email || ''
    }
    const firstMessage = messages[0]
    if (firstMessage.direction === 'outbound') {
      return firstMessage.toEmail || selectedThread?.lead?.email || ''
    } else {
      return firstMessage.fromEmail || selectedThread?.lead?.email || ''
    }
  }

  const getSenderName = (message) => {
    const isOutbound = message.direction === 'outbound'
    return isOutbound
      ? 'You'
      : selectedThread?.lead?.firstName || selectedThread?.lead?.name || 'Unknown'
  }

  return (
    <Drawer
      open={open}
      anchor="right"
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: '45%',
          borderRadius: '20px',
          padding: '0px',
          boxShadow: 3,
          margin: '1%',
          backgroundColor: 'white',
          height: '96.5vh',
          overflow: 'hidden',
          scrollbarWidth: 'none',
        },
      }}
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
        },
      }}
    >
      <div className="flex flex-col w-full h-full py-2 px-5 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-xl font-semibold">Email Timeline</h2>
          <CloseBtn onClick={handleClose} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading emails...</p>
              </div>
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No emails found</p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((message, index) => {
                const showDateSeparator =
                  index === 0 ||
                  moment(message.createdAt).format('YYYY-MM-DD') !==
                    moment(messages[index - 1].createdAt).format('YYYY-MM-DD')

                const senderName = getSenderName(message)

                return (
                  <React.Fragment key={message.id}>
                    {showDateSeparator && (
                      <div className="flex items-center justify-center my-6">
                        <div className="border-t border-gray-200 flex-1"></div>
                        <span className="px-4 text-xs text-gray-400">
                          {moment(message.createdAt).format('MMMM DD, YYYY')}
                        </span>
                        <div className="border-t border-gray-200 flex-1"></div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold">
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                          <Image
                            src="/messaging/email message type icon.svg"
                            width={16}
                            height={16}
                            alt="Email"
                            className="object-contain"
                          />
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{senderName}</span>
                          <span className="text-xs text-gray-500">
                            {moment(message.createdAt).format('h:mm A')}
                          </span>
                        </div>

                        {message.subject && (
                          <div className="font-semibold mb-2 text-sm">
                            Subject: {message.subject}
                          </div>
                        )}

                        <div className="bg-gray-100 rounded-lg px-4 py-3 mb-2">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {htmlToPlainText(message.content || '')}
                          </div>
                        </div>

                        {/* Attachments */}
                        {message.metadata?.attachments && message.metadata.attachments.length > 0 && (
                          <div className="flex flex-col gap-2 mt-2">
                            {message.metadata.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-brand-primary">
                                <Paperclip size={14} />
                                <span className="underline">
                                  {attachment.originalName || attachment.fileName || `Attachment ${idx + 1}`}
                                </span>
                                {attachment.size && (
                                  <span className="text-xs text-gray-500">
                                    ({formatFileSize(attachment.size)})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          )}
        </div>

        {/* Reply Composer */}
        {messages && messages.length > 0 && subject && leadId && (
          <div className="border-t pt-4 mt-4 bg-white">
            <div className="space-y-3">
              {/* From and To fields */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium whitespace-nowrap">From:</label>
                  <select
                    value={selectedEmailAccount || ''}
                    onChange={(e) => setSelectedEmailAccount(e.target.value)}
                    className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg px-3 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary bg-white"
                    style={{ height: '42px' }}
                  >
                    <option value="">Select email account</option>
                    {emailAccounts && emailAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm font-medium whitespace-nowrap">To:</label>
                  <Input
                    value={getRecipientEmail()}
                    readOnly
                    className="flex-1 bg-gray-50 cursor-not-allowed min-w-0 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                    style={{ height: '42px' }}
                  />
                </div>
              </div>

              {/* Subject field */}
              {/* <div className="flex items-center gap-2">
                <label className="text-sm font-medium whitespace-nowrap">Subject:</label>
                <Input
                  value={subject}
                  readOnly
                  className="flex-1 bg-gray-50 cursor-not-allowed h-[42px] border-[0.5px] border-gray-200 rounded-lg"
                  style={{ height: '42px' }}
                />
              </div> */}

              {/* Message body */}
              <div className="border border-gray-200 rounded-lg">
                <RichTextEditor
                  ref={richTextEditorRef}
                  value={replyBody}
                  onChange={(content) => setReplyBody(content)}
                  placeholder="Type your message..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Send button */}
              <div className="flex items-center justify-end gap-4">
                <button
                  onClick={handleSend}
                  disabled={sending || !replyBody.trim() || !selectedEmailAccount}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
                    sending || !replyBody.trim() || !selectedEmailAccount
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-brand-primary hover:bg-brand-primary/90'
                  }`}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M1.5 8.5L14.5 1.5M14.5 1.5L9.5 14.5M14.5 1.5L1.5 8.5L6.5 11.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default EmailTimelineModal

