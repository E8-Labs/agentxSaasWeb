import React, { useState, useEffect } from 'react'
import { Paperclip, X, CaretDown, CaretUp } from '@phosphor-icons/react'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Input } from '@/components/ui/input'
import { usePlanCapabilities } from '@/hooks/use-plan-capabilities'
import UpgardView from '@/constants/UpgardView'
import { getUserLocalData } from '@/components/constants/constants'

// Helper function to get brand primary color as hex
const getBrandPrimaryHex = () => {
  if (typeof window === 'undefined') return '#7902DF'
  const root = document.documentElement
  const brandPrimary = getComputedStyle(root).getPropertyValue('--brand-primary').trim()
  if (brandPrimary) {
    const hslMatch = brandPrimary.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360
      const s = parseInt(hslMatch[2]) / 100
      const l = parseInt(hslMatch[3]) / 100
      
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
      const m = l - c / 2
      
      let r = 0, g = 0, b = 0
      
      if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0
      } else if (1/6 <= h && h < 2/6) {
        r = x; g = c; b = 0
      } else if (2/6 <= h && h < 3/6) {
        r = 0; g = c; b = x
      } else if (3/6 <= h && h < 4/6) {
        r = 0; g = x; b = c
      } else if (4/6 <= h && h < 5/6) {
        r = x; g = 0; b = c
      } else if (5/6 <= h && h < 1) {
        r = c; g = 0; b = x
      }
      
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
  return '#7902DF'
}

const MessageComposer = ({
  composerMode,
  setComposerMode,
  selectedThread,
  composerData,
  setComposerData,
  fetchPhoneNumbers,
  fetchEmailAccounts,
  showCC,
  setShowCC,
  showBCC,
  setShowBCC,
  ccEmails,
  ccInput,
  handleCcInputChange,
  handleCcInputKeyDown,
  handleCcInputPaste,
  removeCcEmail,
  bccEmails,
  bccInput,
  handleBccInputChange,
  handleBccInputKeyDown,
  handleBccInputPaste,
  removeBccEmail,
  phoneNumbers,
  selectedPhoneNumber,
  setSelectedPhoneNumber,
  emailAccounts,
  selectedEmailAccount,
  setSelectedEmailAccount,
  removeAttachment,
  richTextEditorRef,
  SMS_CHAR_LIMIT,
  handleFileChange,
  handleSendMessage,
  sendingMessage,
  onOpenAuthPopup,
}) => {
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')
  const [isExpanded, setIsExpanded] = useState(true)
  const [userData, setUserData] = useState(null)

  // Plan capabilities
  const { planCapabilities } = usePlanCapabilities()
  const canSendSMS = planCapabilities?.allowTextMessages === true
  const shouldShowUpgradeView = composerMode === 'sms' && !canSendSMS

  useEffect(() => {
    const updateBrandColor = () => {
      setBrandPrimaryColor(getBrandPrimaryHex())
    }
    
    updateBrandColor()
    window.addEventListener('agencyBrandingUpdated', updateBrandColor)
    
    return () => {
      window.removeEventListener('agencyBrandingUpdated', updateBrandColor)
    }
  }, [])

  // Get user data from localStorage
  useEffect(() => {
    const user = getUserLocalData()
    if (user) {
      setUserData(user)
    }
  }, [])

  return (
    <div className="mx-4 mb-4 border border-gray-200 rounded-lg bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between border-b mb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setComposerMode('sms')
                const receiverPhone = selectedThread?.receiverPhoneNumber || selectedThread?.lead?.phone || ''
                setComposerData((prev) => ({ ...prev, to: receiverPhone }))
                fetchPhoneNumbers()
              }}
              className={`flex items-center gap-2 px-0 py-3 text-sm font-medium relative ${
                composerMode === 'sms' ? 'text-brand-primary' : 'text-gray-600'
              }`}
            >
              <img
                src="/messaging/sms toggle.svg"
                width={20}
                height={20}
                alt="SMS"
              />
              <span>SMS</span>
              {composerMode === 'sms' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
            </button>
            <button
              onClick={() => {
                setComposerMode('email')
                const receiverEmail = selectedThread?.receiverEmail || selectedThread?.lead?.email || ''
                setComposerData((prev) => ({ ...prev, to: receiverEmail }))
                fetchEmailAccounts()
              }}
              className={`flex items-center gap-2 px-0 py-3 text-sm font-medium relative ${
                composerMode === 'email' ? 'text-brand-primary' : 'text-gray-600'
              }`}
            >
              <img
                src="/messaging/email toggle.svg"
                width={20}
                height={20}
                alt="Email"
              />
              <span>Email</span>
              {composerMode === 'email' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
            </button>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <CaretUp size={20} className="text-gray-600" />
            ) : (
              <CaretDown size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {isExpanded && (
          <>
            {/* Upgrade View for SMS Tab */}
            {shouldShowUpgradeView ? (
              <div className="py-8">
                <UpgardView
                  title="Unlock Text Messages"
                  subTitle="Upgrade to unlock this feature and start sending SMS messages to your leads."
                  userData={userData}
                  onUpgradeSuccess={(updatedUserData) => {
                    // Refresh user data after upgrade
                    if (updatedUserData) {
                      setUserData({ user: updatedUserData })
                    }
                  }}
                  setShowSnackMsg={() => {}}
                />
              </div>
            ) : (
              <>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium whitespace-nowrap">From:</label>
                {composerMode === 'sms' ? (
                  <div className="flex-1 relative min-w-0">
                    <select
                      value={selectedPhoneNumber || ''}
                      onChange={(e) => setSelectedPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary appearance-none pr-8"
                      style={{ height: '42px' }}
                    >
                      <option value="">Select phone number</option>
                      {phoneNumbers.map((phone) => (
                        <option key={phone.id} value={phone.id}>
                          {phone.phone}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 relative min-w-0">
                    {emailAccounts.length === 0 ? (
                      <button
                        onClick={() => onOpenAuthPopup && onOpenAuthPopup()}
                        className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                        style={{ height: '42px' }}
                      >
                        Connect Gmail
                      </button>
                    ) : (
                      <>
                        <select
                          value={selectedEmailAccount || ''}
                          onChange={(e) => setSelectedEmailAccount(e.target.value)}
                          className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary appearance-none pr-8"
                          style={{ height: '42px' }}
                        >
                          <option value="">Select email account</option>
                          {emailAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.email || account.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium whitespace-nowrap">To:</label>
                <Input 
                  value={composerData.to} 
                  readOnly 
                  className="flex-1 bg-gray-50 cursor-not-allowed min-w-0 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary" 
                  style={{ height: '42px' }}
                />
              </div>

              {composerMode === 'email' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCC(!showCC)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      showCC ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cc
                  </button>
                  <button
                    onClick={() => setShowBCC(!showBCC)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      showBCC ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bcc
                  </button>
                </div>
              )}
            </div>

            {composerMode === 'email' && (
              <>
                {showCC && (
                  <div className="flex items-center gap-2 mb-4">
                    <label className="text-sm font-medium w-16">Cc:</label>
                    <div className="relative flex-1">
                      <div className="flex flex-wrap items-center gap-2 px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary overflow-y-auto" style={{ height: '42px', minHeight: '42px' }}>
                        {ccEmails.map((email, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                            <span className="text-gray-700">{email}</span>
                            <button type="button" onClick={() => removeCcEmail(email)} className="text-gray-500 hover:text-gray-700 ml-1">
                              <X size={14} weight="bold" />
                            </button>
                          </div>
                        ))}
                        <input
                          type="text"
                          value={ccInput}
                          onChange={handleCcInputChange}
                          onKeyDown={handleCcInputKeyDown}
                          onPaste={handleCcInputPaste}
                          placeholder={ccEmails.length === 0 ? 'Add CC recipients' : ''}
                          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {showBCC && (
                  <div className="flex items-center gap-2 mb-4">
                    <label className="text-sm font-medium w-16">Bcc:</label>
                    <div className="relative flex-1">
                      <div className="flex flex-wrap items-center gap-2 px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary overflow-y-auto" style={{ height: '42px', minHeight: '42px' }}>
                        {bccEmails.map((email, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm">
                            <span className="text-gray-700">{email}</span>
                            <button type="button" onClick={() => removeBccEmail(email)} className="text-gray-500 hover:text-gray-700 ml-1">
                              <X size={14} weight="bold" />
                            </button>
                          </div>
                        ))}
                        <input
                          type="text"
                          value={bccInput}
                          onChange={handleBccInputChange}
                          onKeyDown={handleBccInputKeyDown}
                          onPaste={handleBccInputPaste}
                          placeholder={bccEmails.length === 0 ? 'Add BCC recipients' : ''}
                          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <label className="text-sm font-medium w-16">Subject:</label>
                  <Input
                    value={composerData.subject}
                    onChange={(e) => setComposerData({ ...composerData, subject: e.target.value })}
                    placeholder="Email subject"
                    className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                  />
                </div>
              </>
              )}

              {/* Message Body and Send Button */}
              <div className="mb-4">
                {composerMode === 'email' ? (
                  <>
                    {composerData.attachments.length > 0 && (
                      <div className="mb-2 flex flex-col gap-1">
                        {composerData.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                            <Paperclip size={14} className="text-gray-500" />
                            <span className="flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                            <button onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700 text-lg leading-none">
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <RichTextEditor
                      ref={richTextEditorRef}
                      value={composerData.body}
                      onChange={(html) => setComposerData({ ...composerData, body: html })}
                      placeholder="Type your message..."
                      availableVariables={[]}
                    />
                  </>
                ) : (
                  <textarea
                    value={composerData.body}
                    onChange={(e) => {
                      if (e.target.value.length <= SMS_CHAR_LIMIT) {
                        setComposerData({ ...composerData, body: e.target.value })
                      }
                    }}
                    placeholder="Type your message..."
                    maxLength={SMS_CHAR_LIMIT}
                    className="w-full px-4 py-3 border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary min-h-[100px] resize-none"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-4 mt-4">
                {composerMode === 'sms' && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>
                      {composerData.body.length}/{SMS_CHAR_LIMIT} char
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{Math.floor((userData?.user?.totalSecondsAvailable || 0) / 60)} credits left</span>
                  </div>
                )}
                {composerMode === 'email' && (
                  <label className="cursor-pointer">
                    <button type="button" className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors" onClick={() => document.getElementById('attachment-input')?.click()}>
                      <Paperclip size={20} className="text-gray-600 hover:text-brand-primary" />
                    </button>
                    <input
                      id="attachment-input"
                      type="file"
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
                <button
                  onClick={handleSendMessage}
                  disabled={
                    sendingMessage ||
                    !composerData.body.trim() ||
                    (composerMode === 'email' && (!selectedEmailAccount || !composerData.to)) ||
                    (composerMode === 'sms' && (!selectedPhoneNumber || !composerData.to))
                  }
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          )}
          </>
        )}
      </div>
    </div>
  )
}

export default MessageComposer
