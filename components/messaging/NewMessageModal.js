'use client'

import { Box, CircularProgress, Modal } from '@mui/material'
import { Check, PaperPlaneTilt, X, CaretDown, Plus } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import Apis from '@/components/apis/Apis'
import RichTextEditor from '@/components/common/RichTextEditor'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import { getUserLocalData } from '@/components/constants/constants'
import { Input } from '@/components/ui/input'
import AuthSelectionPopup from '@/components/pipeline/AuthSelectionPopup'
import { usePlanCapabilities } from '@/hooks/use-plan-capabilities'
import UpgardView from '@/constants/UpgardView'

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

const NewMessageModal = ({ open, onClose, onSend, mode = 'sms' }) => {
  const [selectedMode, setSelectedMode] = useState(mode)
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredLeads, setFilteredLeads] = useState([])
  const [selectedLeads, setSelectedLeads] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState([])
  const [emailAccounts, setEmailAccounts] = useState([])
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(null)
  const [selectedEmailAccount, setSelectedEmailAccount] = useState(null)
  const [selectedPhoneNumberObj, setSelectedPhoneNumberObj] = useState(null)
  const [selectedEmailAccountObj, setSelectedEmailAccountObj] = useState(null)
  const [messageBody, setMessageBody] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [showCC, setShowCC] = useState(false)
  const [showBCC, setShowBCC] = useState(false)
  const [cc, setCC] = useState('')
  const [bcc, setBCC] = useState('')
  const [userData, setUserData] = useState(null)
  const [showLeadList, setShowLeadList] = useState(false)
  const [showAuthSelectionPopup, setShowAuthSelectionPopup] = useState(false)
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false)
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false)
  const richTextEditorRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const leadSearchRef = useRef(null)
  const phoneDropdownRef = useRef(null)
  const emailDropdownRef = useRef(null)
  const router = useRouter()

  // Plan capabilities
  const { planCapabilities } = usePlanCapabilities()

  // SMS character limit
  const SMS_CHAR_LIMIT = 160

  // Check if user can send messages/emails
  // For SMS: check allowTextMessages capability
  // For Email: always allow (emails are separate from SMS capability)
  const canSendSMS = planCapabilities?.allowTextMessages === true
  const canSendEmail = true // Emails are always allowed

  // Determine if upgrade view should be shown (only for SMS tab)
  const shouldShowUpgradeView = selectedMode === 'sms' && !canSendSMS

  // Function to render icon with branding using mask-image
  const renderBrandedIcon = (iconPath, width, height, isActive) => {
    if (typeof window === 'undefined') {
      return (
        <div
          style={{
            width: width,
            height: height,
            minWidth: width,
            minHeight: height,
          }}
        />
      )
    }

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')
    
    // Use brand color when active, muted gray when inactive
    const iconColor = isActive
      ? `hsl(${brandColor.trim() || '270 75% 50%'})`
      : 'hsl(0 0% 60%)' // Muted gray for inactive state

    // Use mask-image approach: background color with icon as mask
    return (
      <Image src={iconPath} alt="icon" width={width} height={height} />
    )
    return (
      <div
        style={{
          width: width,
          height: height,
          minWidth: width,
          minHeight: height,
          backgroundColor: iconColor,
          WebkitMaskImage: `url(${iconPath})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskMode: 'alpha',
          maskImage: `url(${iconPath})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          transition: 'background-color 0.2s ease-in-out',
          flexShrink: 0,
        }}
      />
    )
  }

  // Update brand color on branding changes
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

  // Search leads using the messaging search endpoint
  const searchLeads = async (searchTerm = '') => {
    try {
      setLoading(true)
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      // Only search if we have a search term (minimum 1 character)
      if (!searchTerm || searchTerm.trim().length < 1) {
        setFilteredLeads([])
        setLoading(false)
        return
      }

      const apiPath = `${Apis.searchLeadsForMessaging}?search=${encodeURIComponent(searchTerm.trim())}&limit=50`

      const response = await axios.get(apiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        const leadsData = Array.isArray(response.data.data)
          ? response.data.data
          : []
        setFilteredLeads(leadsData)
      } else {
        setFilteredLeads([])
      }
    } catch (error) {
      console.error('Error searching leads:', error)
      setFilteredLeads([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch phone numbers
  const fetchPhoneNumbers = async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get(Apis.a2pNumbers, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setPhoneNumbers(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedPhoneNumber(response.data.data[0].id)
          setSelectedPhoneNumberObj(response.data.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error)
    }
  }

  // Fetch email accounts
  const fetchEmailAccounts = async () => {
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      const response = await axios.get(Apis.gmailAccount, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status && response.data?.data) {
        setEmailAccounts(response.data.data)
        if (response.data.data.length > 0) {
          setSelectedEmailAccount(response.data.data[0].id)
          setSelectedEmailAccountObj(response.data.data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching email accounts:', error)
    }
  }

  // Get selected user for AuthSelectionPopup
  const getSelectedUser = () => {
    try {
      const selectedUserData = localStorage.getItem('selectedUser')
      if (selectedUserData && selectedUserData !== 'undefined') {
        return JSON.parse(selectedUserData)
      }
      const user = getUserLocalData()
      return user?.user || null
    } catch (error) {
      console.error('Error getting selected user:', error)
      return null
    }
  }

  // Search leads with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (!searchQuery.trim()) {
      setFilteredLeads([])
      setShowLeadList(false)
      return
    }

    // Show list when user starts typing
    setShowLeadList(true)

    // Debounce search - wait 300ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      searchLeads(searchQuery)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Get user data from localStorage
  useEffect(() => {
    const user = getUserLocalData()
    if (user) {
      setUserData(user)
    }
  }, [open])

  // Initial load
  useEffect(() => {
    if (open) {
      // Don't fetch leads on initial load - wait for user to search
      if (selectedMode === 'sms') {
        fetchPhoneNumbers()
      } else {
        fetchEmailAccounts()
      }
    }
  }, [open, selectedMode])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) {
        setPhoneDropdownOpen(false)
      }
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target)) {
        setEmailDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedLeads([])
      setSearchQuery('')
      setMessageBody('')
      setEmailSubject('')
      setCC('')
      setBCC('')
      setShowCC(false)
      setShowBCC(false)
      setPhoneDropdownOpen(false)
      setEmailDropdownOpen(false)
    }
  }, [open])

  // Toggle lead selection
  const toggleLeadSelection = (lead) => {
    setSelectedLeads((prev) => {
      const exists = prev.find((l) => l.id === lead.id)
      if (exists) {
        return prev.filter((l) => l.id !== lead.id)
      } else {
        // Add lead and clear search
        setSearchQuery('')
        setShowLeadList(false)
        return [...prev, lead]
      }
    })
  }

  // Remove lead from selection
  const removeLead = (leadId) => {
    setSelectedLeads((prev) => prev.filter((l) => l.id !== leadId))
  }

  // Handle click outside to hide lead list
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (leadSearchRef.current && !leadSearchRef.current.contains(event.target)) {
        setShowLeadList(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Handle send
  const handleSend = async () => {
    if (selectedLeads.length === 0 || !messageBody.trim()) return
    if (selectedMode === 'email' && !emailSubject.trim()) return

    setSending(true)
    try {
      const localData = localStorage.getItem('User')
      if (!localData) return

      const userData = JSON.parse(localData)
      const token = userData.token

      // Send to each lead individually
      const sendPromises = selectedLeads.map(async (lead) => {
        if (selectedMode === 'sms') {
          // Send SMS
          const response = await axios.post(
            Apis.sendSMSToLead,
            {
              leadId: lead.id,
              content: messageBody,
              smsPhoneNumberId: selectedPhoneNumber,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )
          return response.data
        } else {
          // Send Email
          if (!selectedEmailAccount) {
            return {
              status: false,
              message: 'Please select an email account',
            }
          }

          // Parse CC and BCC emails (comma-separated)
          const parseEmailList = (emailString) => {
            if (!emailString || !emailString.trim()) return []
            return emailString
              .split(',')
              .map((email) => email.trim())
              .filter((email) => email.length > 0)
          }

          const ccEmails = parseEmailList(cc)
          const bccEmails = parseEmailList(bcc)

          // Use FormData to match the API expectations (even without attachments)
          const formData = new FormData()
          formData.append('leadId', lead.id)
          formData.append('subject', emailSubject)
          formData.append('body', messageBody)
          formData.append('emailAccountId', selectedEmailAccount)

          if (ccEmails.length > 0) {
            formData.append('cc', ccEmails.join(','))
          }

          if (bccEmails.length > 0) {
            formData.append('bcc', bccEmails.join(','))
          }

          const response = await axios.post(Apis.sendEmailToLead, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          })

          return response.data
        }
      })

      const results = await Promise.all(sendPromises)
      const successCount = results.filter((r) => r?.status).length
      const failedCount = selectedLeads.length - successCount

      // Show success/error toast
      if (successCount === selectedLeads.length) {
        // All messages sent successfully
        toast.success(
          `Message${selectedLeads.length > 1 ? 's' : ''} sent successfully to ${successCount} lead${successCount > 1 ? 's' : ''}`
        )
      } else if (successCount > 0) {
        // Partial success
        toast.warning(
          `Sent to ${successCount} of ${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''}${failedCount > 0 ? `. ${failedCount} failed.` : ''}`
        )
      } else {
        // All failed
        toast.error('Failed to send messages. Please try again.')
      }

      if (onSend) {
        onSend({
          success: successCount === selectedLeads.length,
          sent: successCount,
          total: selectedLeads.length,
        })
      }

      // Close modal after a brief delay to show success (only if at least one succeeded)
      if (successCount > 0) {
        setTimeout(() => {
          onClose()
        }, 500)
      }
    } catch (error) {
      console.error('Error sending messages:', error)
      toast.error('An error occurred while sending messages. Please try again.')
    } finally {
      setSending(false)
    }
  }


  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="new-message-modal"
      aria-describedby="new-message-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: '80%', md: '600px', lg: '700px' },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 0,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">New Message</h2>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Mode Tabs */}
          <div className="flex items-center justify-between border-b">
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  setSelectedMode('sms')
                  if (canSendSMS) {
                    fetchPhoneNumbers()
                  }
                }}
                className={`flex items-center gap-2 px-0 py-3 text-sm font-medium relative cursor-pointer ${
                  selectedMode === 'sms'
                    ? 'text-brand-primary'
                    : 'text-gray-600'
                }`}
              >
                {renderBrandedIcon(
                  '/messaging/sms toggle.png',
                  20,
                  20,
                  selectedMode === 'sms',
                )}
                <span>SMS</span>
                {selectedMode === 'sms' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedMode('email')
                  fetchEmailAccounts()
                }}
                className={`flex items-center gap-2 px-0 py-3 text-sm font-medium relative ${
                  selectedMode === 'email'
                    ? 'text-brand-primary'
                    : 'text-gray-600'
                }`}
              >
                {renderBrandedIcon(
                  '/messaging/email toggle.png',
                  20,
                  20,
                  selectedMode === 'email',
                )}
                <span>Email</span>
                {selectedMode === 'email' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />
                )}
              </button>
            </div>
            {/* CC and BCC buttons for Email mode - on top right */}
            {selectedMode === 'email' && (
              <div className="flex items-center gap-2 flex-shrink-0">
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
          {/* From and To Fields - Same Line */}
          <div className="flex items-center gap-4" ref={leadSearchRef}>
            {/* From Field */}
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-medium whitespace-nowrap">From:</label>
              {selectedMode === 'sms' ? (
                <div className="flex-1 relative" ref={phoneDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setPhoneDropdownOpen(!phoneDropdownOpen)}
                    className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white text-left flex items-center justify-between"
                    style={{ height: '42px' }}
                  >
                    <span className="text-sm text-gray-700 truncate">
                      {selectedPhoneNumber
                        ? phoneNumbers.find((p) => p.id === parseInt(selectedPhoneNumber))?.phone || 'Select phone number'
                        : 'Select phone number'}
                    </span>
                    <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {phoneDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {phoneNumbers.length === 0 ? (
                        <div className="p-3">
                          <p className="text-sm text-gray-600 mb-2">No A2P verified numbers available</p>
                          <button
                            onClick={() => {
                              router.push('/dashboard/myAccount?tab=7')
                              setPhoneDropdownOpen(false)
                            }}
                            className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <Plus className="w-4 h-4" />
                            Connect Twilio & Get A2P Number
                          </button>
                        </div>
                      ) : (
                        <>
                          {phoneNumbers.map((phone) => (
                            <button
                              key={phone.id}
                              type="button"
                              onClick={() => {
                                const phoneObj = phoneNumbers.find((p) => p.id === phone.id)
                                setSelectedPhoneNumber(phone.id.toString())
                                setSelectedPhoneNumberObj(phoneObj)
                                setPhoneDropdownOpen(false)
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                selectedPhoneNumber === phone.id.toString() ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700'
                              }`}
                            >
                              {phone.phone}
                            </button>
                          ))}
                          <div className="border-t border-gray-200 p-2">
                            <button
                              onClick={() => {
                                router.push('/dashboard/myAccount?tab=7')
                                setPhoneDropdownOpen(false)
                              }}
                              className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Get A2P Verified Number
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 relative" ref={emailDropdownRef}>
                  {emailAccounts.length === 0 ? (
                  <button
                    onClick={() => setShowAuthSelectionPopup(true)}
                    className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                    style={{ height: '42px' }}
                  >
                    Connect Gmail
                  </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEmailDropdownOpen(!emailDropdownOpen)}
                        className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary bg-white text-left flex items-center justify-between"
                        style={{ height: '42px' }}
                      >
                        <span className="text-sm text-gray-700 truncate">
                          {selectedEmailAccount
                            ? emailAccounts.find((a) => a.id === parseInt(selectedEmailAccount))?.email || emailAccounts.find((a) => a.id === parseInt(selectedEmailAccount))?.name || 'Select email account'
                            : 'Select email account'}
                        </span>
                        <CaretDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                      {emailDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {emailAccounts.map((account) => (
                            <button
                              key={account.id}
                              type="button"
                              onClick={() => {
                                const accountObj = emailAccounts.find((a) => a.id === account.id)
                                setSelectedEmailAccount(account.id.toString())
                                setSelectedEmailAccountObj(accountObj)
                                setEmailDropdownOpen(false)
                              }}
                              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                selectedEmailAccount === account.id.toString() ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700'
                              }`}
                            >
                              {account.email || account.name}
                            </button>
                          ))}
                          <div className="border-t border-gray-200 p-2">
                            <button
                              onClick={() => {
                                setShowAuthSelectionPopup(true)
                                setEmailDropdownOpen(false)
                              }}
                              className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Connect New Gmail
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* To Field */}
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-medium whitespace-nowrap">To:</label>
              <div className="relative flex-1 min-w-0">
                {/* Tag Input Container */}
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary overflow-y-auto" style={{ height: '42px', minHeight: '42px' }}>
                  {/* Selected Lead Tags */}
                  {selectedLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      <span className="text-gray-700">
                        {lead.firstName || lead.name || 'Lead'} {lead.lastName || ''}
                        {lead.smartListName && (
                          <span className="ml-1 text-brand-primary">• {lead.smartListName}</span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLead(lead.id)}
                        className="text-gray-500 hover:text-gray-700 ml-1"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    </div>
                  ))}
                  {/* Search Input */}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim()) {
                        setShowLeadList(true)
                      }
                    }}
                    placeholder={selectedLeads.length === 0 ? "Search leads..." : ""}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                  />
                </div>
                
                {/* Leads List Dropdown - Only show when searching and list is visible */}
                {showLeadList && searchQuery.trim() && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-[0.5px] border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center">
                        <CircularProgress size={24} />
                      </div>
                    ) : filteredLeads.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No leads found
                      </div>
                    ) : (
                      filteredLeads.map((lead) => {
                        const isSelected = selectedLeads.find((l) => l.id === lead.id)
                        return (
                          <div
                            key={lead.id}
                            onClick={() => toggleLeadSelection(lead)}
                            className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                              isSelected ? 'bg-brand-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {lead.firstName || lead.name || 'Unknown'} {lead.lastName || ''}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {selectedMode === 'sms'
                                    ? lead.phone || 'No phone'
                                    : lead.email || 'No email'}
                                  {lead.smartListName && (
                                    <span className="ml-2 text-brand-primary">
                                      • {lead.smartListName}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                                  <Check size={14} className="text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Fields */}
          {selectedMode === 'email' && (
            <>
              {/* CC and BCC on same line when both are shown */}
              {(showCC || showBCC) && (
                <div className="flex items-center gap-4">
                  {showCC && (
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-sm font-medium whitespace-nowrap">Cc:</label>
                  <Input
                    value={cc}
                    onChange={(e) => setCC(e.target.value)}
                    placeholder="Add CC recipients"
                    className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                    style={{ height: '42px', minHeight: '42px' }}
                  />
                    </div>
                  )}
                  {showBCC && (
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-sm font-medium whitespace-nowrap">Bcc:</label>
                  <Input
                    value={bcc}
                    onChange={(e) => setBCC(e.target.value)}
                    placeholder="Add BCC recipients"
                    className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                    style={{ height: '42px', minHeight: '42px' }}
                  />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium w-16">Subject:</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                  className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
                  style={{ height: '42px' }}
                />
              </div>
            </>
          )}

          {/* Message Body */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message:</label>
            {selectedMode === 'email' ? (
              <RichTextEditor
                ref={richTextEditorRef}
                value={messageBody}
                onChange={setMessageBody}
                placeholder="Type your message..."
                availableVariables={[]}
              />
            ) : (
              <textarea
                value={messageBody}
                onChange={(e) => {
                  // Enforce max 160 characters for SMS
                  if (e.target.value.length <= SMS_CHAR_LIMIT) {
                    setMessageBody(e.target.value)
                  }
                }}
                placeholder="Type your message..."
                maxLength={SMS_CHAR_LIMIT}
                className="w-full px-3 py-2 border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary min-h-[120px]"
              />
            )}
          </div>
            </>
          )}
        </div>

        {/* Footer with char count, credits, and send button */}
        {!shouldShowUpgradeView && (
          <div className="flex items-center justify-end gap-4 p-4 border-t bg-gray-50">
            {selectedMode === 'email' && (
              <div className="flex-1 text-sm text-gray-500">
                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {selectedMode === 'sms' && (
                <>
                  <span>
                    {messageBody.length}/{SMS_CHAR_LIMIT} char
                  </span>
                  <span className="text-gray-300">|</span>
                  <span>
                    {Math.floor((userData?.user?.totalSecondsAvailable || 0) / 60)} credits left
                  </span>
                </>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={
                sending ||
                selectedLeads.length === 0 ||
                !messageBody.trim() ||
                (selectedMode === 'email' && !emailSubject.trim()) ||
                (selectedMode === 'sms' && !selectedPhoneNumber) ||
                (selectedMode === 'email' && !selectedEmailAccount)
              }
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {sending ? (
                <>
                  <CircularProgress size={16} className="text-white" />
                  Sending...
                </>
              ) : (
                <>
                  Send
                  <PaperPlaneTilt size={16} />
                </>
              )}
            </button>
          </div>
        )}
      </Box>
    </Modal>

    {/* Auth Selection Popup for Gmail Connection - Outside main Modal */}
    <AuthSelectionPopup
      open={showAuthSelectionPopup}
      onClose={() => setShowAuthSelectionPopup(false)}
      onSuccess={() => {
        fetchEmailAccounts()
        setShowAuthSelectionPopup(false)
      }}
      setShowEmailTempPopup={() => {}}
      showEmailTempPopup={false}
      setSelectedGoogleAccount={(account) => {
        if (account) {
          setSelectedEmailAccount(account.id)
          setSelectedEmailAccountObj(account)
          setEmailAccounts((prev) => {
            const exists = prev.find((a) => a.id === account.id)
            if (exists) return prev
            return [...prev, account]
          })
        }
      }}
      selectedUser={getSelectedUser()}
    />
  </>
  )
}

export default NewMessageModal

