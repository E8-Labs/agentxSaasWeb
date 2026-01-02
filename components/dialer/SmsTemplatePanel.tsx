'use client'

import { useState } from 'react'
import { Button as ButtonBase } from '../ui/button'
import { toast } from 'sonner'
import { Phone, MoreVertical, Pencil, X, Loader2, FileText } from 'lucide-react'
import { Menu, MenuItem } from '@mui/material'
import { formatPhoneNumber } from '@/utilities/agentUtilities'
import SMSTempletePopupBase from '../pipeline/SMSTempletePopup'

const Button = ButtonBase as any
const SMSTempletePopup = SMSTempletePopupBase as any

interface SmsTemplatePanelProps {
  smsTemplates: any[]
  selectedTemplate: any
  templatesLoading: boolean
  phoneNumbers: any[]
  phoneNumbersLoading: boolean
  sendingSms: boolean
  leadId?: number
  leadPhone?: string
  selectedUser: any
  onTemplateSelect: (template: any) => void
  onSendSms: (phoneNumberId?: number) => void
  onDeleteTemplate: (template: any) => void
  onEditTemplate: (template: any) => void
  onRefreshTemplates: () => void
  onClose: () => void
}

export default function SmsTemplatePanel({
  smsTemplates,
  selectedTemplate,
  templatesLoading,
  phoneNumbers,
  phoneNumbersLoading,
  sendingSms,
  leadId,
  leadPhone,
  selectedUser,
  onTemplateSelect,
  onSendSms,
  onDeleteTemplate,
  onEditTemplate,
  onRefreshTemplates,
  onClose,
}: SmsTemplatePanelProps) {
  const [smsPhoneNumberDropdownAnchor, setSmsPhoneNumberDropdownAnchor] = useState<null | HTMLElement>(null)
  const [showSmsTemplatePopup, setShowSmsTemplatePopup] = useState(false)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedTemplateForMenu, setSelectedTemplateForMenu] = useState<any>(null)

  const handleSmsPhoneNumberSelected = (phoneNumber: any) => {
    setSmsPhoneNumberDropdownAnchor(null)
    onSendSms(phoneNumber.id)
  }

  const handleComposeNew = () => {
    setIsEditingTemplate(false)
    setEditingTemplate(null)
    setShowSmsTemplatePopup(true)
  }

  const handleEditClick = (template: any) => {
    const normalizedTemplate = {
      ...template,
      id: template.id || template.templateId,
      templateId: template.templateId || template.id,
    }
    setEditingTemplate(normalizedTemplate)
    setIsEditingTemplate(true)
    setShowSmsTemplatePopup(true)
    setTemplateMenuAnchor(null)
    setSelectedTemplateForMenu(null)
  }

  const handleDeleteClick = async (template: any) => {
    await onDeleteTemplate(template)
    setTemplateMenuAnchor(null)
    setSelectedTemplateForMenu(null)
  }

  const handleSendClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    // Get A2P verified phone numbers
    const a2pVerifiedNumbers = phoneNumbers.filter(
      (pn: any) => (pn.isA2PVerified === true || pn.isA2PVerified === 1) && 
                   (pn.a2pVerificationStatus === 'verified' || pn.a2pVerificationStatus === 'Verified')
    )
    
    // Deduplicate by phone number
    const seenPhones = new Map<string, any>()
    const uniqueA2pNumbers = a2pVerifiedNumbers.filter((pn: any) => {
      const normalizedPhone = pn.phone?.trim()
      if (!normalizedPhone) return false
      if (!seenPhones.has(normalizedPhone)) {
        seenPhones.set(normalizedPhone, pn)
        return true
      }
      return false
    })
    
    if (uniqueA2pNumbers.length === 0) {
      toast.error('No A2P verified phone numbers found. Please verify a phone number first.')
    } else {
      setSmsPhoneNumberDropdownAnchor(e.currentTarget)
    }
  }

  return (
    <>
      <div 
        className="w-80 border-r border-gray-200 flex-shrink-0 flex flex-col" 
        style={{ maxHeight: '60vh', pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Select SMS</h3>
          <Button
            onClick={handleComposeNew}
            variant="filled"
            className="rounded-full py-2 px-4 transition-all"
            style={{
              backgroundColor: '#F9F9F9',
              border: '1px solid #e5e7eb',
              color: '#374151',
              fontSize: '14px',
              height: 'auto',
            }}
          >
            <span className="mr-1.5">✏️</span>
            Create SMS
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading templates...</div>
            </div>
          ) : smsTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">No SMS templates found</div>
            </div>
          ) : (
            <div className="space-y-3">
              {smsTemplates.map((template: any) => (
                <div
                  key={template.id}
                  onClick={() => onTemplateSelect(template)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-2 border-purple-500 bg-purple-50'
                      : 'border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* <div className="text-sm font-medium text-gray-900 mb-1">
                        {template.templateName}
                      </div> */}
                      {template.content && (
                        <div className="text-xs text-black line-clamp-2">
                          {template.content.replace(/<[^>]*>/g, '').substring(0, 100)} {template.content.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        setSelectedTemplateForMenu(template)
                        setTemplateMenuAnchor(e.currentTarget)
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                      }}
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto ml-2 flex-shrink-0"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <MoreVertical size={16} className="text-gray-400" />
                    </Button>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      <Button
                        onClick={handleSendClick}
                        disabled={sendingSms}
                        className="w-full rounded-lg"
                        style={{
                          backgroundColor: 'hsl(var(--brand-primary))',
                          color: 'white',
                          fontSize: '14px',
                          padding: '8px 16px',
                        }}
                      >
                        {sendingSms ? 'Sending...' : 'Send'}
                      </Button>
                      {/* SMS Phone Number Dropdown */}
                      {smsPhoneNumberDropdownAnchor && (
                        <Menu
                          anchorEl={smsPhoneNumberDropdownAnchor}
                          open={Boolean(smsPhoneNumberDropdownAnchor)}
                          onClose={() => setSmsPhoneNumberDropdownAnchor(null)}
                          PaperProps={{
                            style: {
                              maxHeight: '300px',
                              width: '280px',
                              zIndex: 1500,
                              marginTop: '8px',
                            },
                          }}
                          style={{ zIndex: 1500 }}
                          MenuListProps={{
                            style: { zIndex: 1500, padding: '4px' },
                          }}
                          container={() => document.body}
                          disablePortal={false}
                        >
                          {phoneNumbersLoading ? (
                            <MenuItem disabled>
                              <div className="flex items-center gap-2 py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                <span className="text-sm text-gray-500">Loading phone numbers...</span>
                              </div>
                            </MenuItem>
                          ) : (() => {
                            const a2pVerifiedNumbers = phoneNumbers.filter(
                              (pn: any) => (pn.isA2PVerified === true || pn.isA2PVerified === 1) && 
                                           (pn.a2pVerificationStatus === 'verified' || pn.a2pVerificationStatus === 'Verified')
                            )
                            
                            const seenPhones = new Map<string, any>()
                            const uniqueA2pNumbers = a2pVerifiedNumbers.filter((pn: any) => {
                              const normalizedPhone = pn.phone?.trim()
                              if (!normalizedPhone) return false
                              if (!seenPhones.has(normalizedPhone)) {
                                seenPhones.set(normalizedPhone, pn)
                                return true
                              }
                              return false
                            })
                            
                            if (uniqueA2pNumbers.length === 0) {
                              return (
                                <MenuItem disabled>
                                  <div className="text-sm text-gray-500 py-2">
                                    No A2P verified phone numbers found
                                  </div>
                                </MenuItem>
                              )
                            }
                            return uniqueA2pNumbers.map((phoneNumber: any) => {
                              const formattedPhone = formatPhoneNumber(phoneNumber.phone)
                              return (
                                <MenuItem
                                  key={phoneNumber.id}
                                  onClick={() => handleSmsPhoneNumberSelected(phoneNumber)}
                                  style={{
                                    borderRadius: '8px',
                                    margin: '4px 0',
                                    padding: '12px 16px',
                                    backgroundColor: 'white',
                                  }}
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-900 flex-1">
                                      {formattedPhone}
                                    </span>
                                  </div>
                                </MenuItem>
                              )
                            })
                          })()}
                        </Menu>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SMS Template Popup */}
      {showSmsTemplatePopup && (
        <SMSTempletePopup
          open={showSmsTemplatePopup}
          onClose={() => {
            setShowSmsTemplatePopup(false)
            setIsEditingTemplate(false)
            setEditingTemplate(null)
            onRefreshTemplates()
          }}
          phoneNumbers={phoneNumbers
            .filter((pn: any) => (pn.isA2PVerified === true || pn.isA2PVerified === 1) && 
                                 (pn.a2pVerificationStatus === 'verified' || pn.a2pVerificationStatus === 'Verified'))
            .map((pn: any) => ({ id: pn.id, phone: pn.phone }))}
          phoneLoading={phoneNumbersLoading}
          communicationType="sms"
          addRow={null}
          isEditing={isEditingTemplate}
          editingRow={editingTemplate}
          onUpdateRow={null}
          onSendSMS={null}
          isLeadSMS={false}
          leadPhone={leadPhone}
          leadId={leadId}
          selectedUser={selectedUser}
        />
      )}

      {/* Template Menu */}
      {selectedTemplateForMenu && (
        <Menu
          anchorEl={templateMenuAnchor}
          open={Boolean(templateMenuAnchor)}
          onClose={() => {
            setTemplateMenuAnchor(null)
            setSelectedTemplateForMenu(null)
          }}
          MenuListProps={{
            'aria-labelledby': 'template-menu-button',
          }}
          PaperProps={{
            style: {
              minWidth: '120px',
              zIndex: 1500,
            },
          }}
          style={{
            zIndex: 1500,
          }}
          disablePortal={false}
        >
          <MenuItem onClick={() => handleEditClick(selectedTemplateForMenu)}>
            <Pencil size={14} className="mr-2" />
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => handleDeleteClick(selectedTemplateForMenu)}
            style={{ color: '#dc2626' }}
          >
            <X size={14} className="mr-2" />
            Delete
          </MenuItem>
        </Menu>
      )}
    </>
  )
}


