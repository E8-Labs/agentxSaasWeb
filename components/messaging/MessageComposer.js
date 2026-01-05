import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Paperclip, X, CaretDown, CaretUp, Plus, PaperPlaneTilt } from '@phosphor-icons/react'
import { MessageCircleMore, Mail, MessageSquare, Bold, Underline, ListBullets, ListNumbers } from 'lucide-react'
import { CircularProgress } from '@mui/material'
import RichTextEditor from '@/components/common/RichTextEditor'
import { Input } from '@/components/ui/input'
import { usePlanCapabilities } from '@/hooks/use-plan-capabilities'
import UpgardView from '@/constants/UpgardView'
import { getUserLocalData } from '@/components/constants/constants'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/constants/UserRole'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'

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

// Helper function to check if HTML body has actual text content
const hasTextContent = (html) => {
  if (!html) return false
  // Create a temporary div to parse HTML
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    return textContent.trim().length > 0
  }
  // Fallback for SSR: strip HTML tags and check
  const textOnly = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  return textOnly.length > 0
}

// Helper function to strip HTML tags and convert to plain text
const stripHTML = (html) => {
  if (!html) return ''
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
  }
  // Fallback for SSR: strip HTML tags
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
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
  handleCcInputBlur,
  removeCcEmail,
  bccEmails,
  bccInput,
  handleBccInputChange,
  handleBccInputKeyDown,
  handleBccInputPaste,
  handleBccInputBlur,
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
  onCommentAdded,
}) => {
  const [brandPrimaryColor, setBrandPrimaryColor] = useState('#7902DF')
  const [isExpanded, setIsExpanded] = useState(true)
  const [userData, setUserData] = useState(null)
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false)
  const [emailDropdownOpen, setEmailDropdownOpen] = useState(false)
  const phoneDropdownRef = useRef(null)
  const emailDropdownRef = useRef(null)
  const router = useRouter()
  
  // Comment state
  const [commentBody, setCommentBody] = useState('')
  const [teamMembers, setTeamMembers] = useState([])
  const [sendingComment, setSendingComment] = useState(false)
  const commentEditorRef = useRef(null)
  const commentEditorContainerRef = useRef(null)
  
  // Mention state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [filteredTeamMembers, setFilteredTeamMembers] = useState([])
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const mentionDropdownRef = useRef(null)

  // Plan capabilities
  const { planCapabilities } = usePlanCapabilities()
  const canSendSMS = planCapabilities?.allowTextMessages === true
  const shouldShowUpgradeView = composerMode === 'sms' && !canSendSMS

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target)) {
        setPhoneDropdownOpen(false)
      }
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target)) {
        setEmailDropdownOpen(false)
      }
      if (mentionDropdownRef.current && !mentionDropdownRef.current.contains(event.target) &&
          !commentEditorContainerRef.current?.contains(event.target)) {
        setShowMentionDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  // Fetch team members for @ mentions
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await getTeamsList()
        if (response) {
          const members = []
          if (response.admin) {
            members.push({
              id: response.admin.id,
              name: response.admin.name,
              email: response.admin.email,
            })
          }
          if (response.data && response.data.length > 0) {
            for (const t of response.data) {
              if (t.status === 'Accepted' && t.invitedUser) {
                members.push({
                  id: t.invitedUser.id,
                  name: t.invitedUser.name,
                  email: t.invitedUser.email,
                })
              }
            }
          }
          setTeamMembers(members)
          setFilteredTeamMembers(members)
        }
      } catch (error) {
        console.error('Error fetching team members:', error)
      }
    }
    if (composerMode === 'comment') {
      fetchTeamMembers()
    }
  }, [composerMode])

  // Check for @ mentions in editor
  const checkForMentions = useCallback(() => {
    if (composerMode !== 'comment' || !commentEditorContainerRef.current) {
      setShowMentionDropdown(false)
      return
    }

    const editorContainer = commentEditorContainerRef.current?.querySelector('.ql-editor')
    if (!editorContainer) {
      setShowMentionDropdown(false)
      return
    }

    // Get the selection
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setShowMentionDropdown(false)
      return
    }

    const range = selection.getRangeAt(0)
    
    // Check if selection is within the editor
    if (!editorContainer.contains(range.commonAncestorContainer)) {
      setShowMentionDropdown(false)
      return
    }

    // Get text up to cursor position using a simpler approach
    let text = ''
    try {
      // Create a range from start of editor to cursor
      const textRange = document.createRange()
      textRange.setStart(editorContainer, 0)
      textRange.setEnd(range.startContainer, range.startOffset)
      
      // Get text content from this range
      text = textRange.toString() || ''
    } catch (e) {
      // Fallback: if range doesn't work, use innerText and approximate
      const allText = editorContainer.innerText || editorContainer.textContent || ''
      text = allText
    }

    const atIndex = text.lastIndexOf('@')
    
    if (atIndex === -1) {
      setShowMentionDropdown(false)
      return
    }

    // Check if there's a space after @ (meaning mention is complete)
    const textAfterAt = text.substring(atIndex + 1)
    if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
      setShowMentionDropdown(false)
      return
    }

    // Get the query after @
    const query = textAfterAt.toLowerCase()
    setMentionQuery(query)

    // Filter team members - if query is empty (just "@"), show all members
    const filtered = query === ''
      ? teamMembers
      : teamMembers.filter(member =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
        )
    
    setFilteredTeamMembers(filtered)
    setSelectedMentionIndex(0)

    if (filtered.length > 0) {
      // Get cursor position for dropdown
      const rect = range.getBoundingClientRect()
      
      setMentionPosition({
        top: rect.bottom + 5,
        left: rect.left,
      })
      setShowMentionDropdown(true)
    } else {
      setShowMentionDropdown(false)
    }
  }, [composerMode, teamMembers])

  // Handle comment body change and detect @ mentions
  const handleCommentChange = (html) => {
    setCommentBody(html)
    // Use setTimeout to ensure DOM is updated
    setTimeout(checkForMentions, 50)
  }

  // Add event listeners for mention detection
  useEffect(() => {
    if (composerMode !== 'comment' || !commentEditorContainerRef.current) return

    let cleanup = null

    // Wait a bit for the editor to be ready
    const timeoutId = setTimeout(() => {
      const editorContainer = commentEditorContainerRef.current?.querySelector('.ql-editor')
      if (!editorContainer) return

      // Listen to various events that might indicate typing
      const handleInput = () => {
        setTimeout(checkForMentions, 10)
      }

      const handleKeyDown = (e) => {
        // Check for @ key specifically (Shift+2 on most keyboards)
        if (e.key === '@' || (e.key === '2' && e.shiftKey)) {
          setTimeout(checkForMentions, 10)
        }
      }

      const handleKeyUp = (e) => {
        // Check for @ key or any character
        if (e.key === '@' || (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey)) {
          setTimeout(checkForMentions, 10)
        }
      }

      const handleSelectionChange = () => {
        setTimeout(checkForMentions, 10)
      }

      // Also listen on the container itself
      const container = commentEditorContainerRef.current
      
      editorContainer.addEventListener('input', handleInput, true)
      editorContainer.addEventListener('keydown', handleKeyDown, true)
      editorContainer.addEventListener('keyup', handleKeyUp, true)
      container.addEventListener('click', handleSelectionChange, true)
      document.addEventListener('selectionchange', handleSelectionChange)

      cleanup = () => {
        editorContainer.removeEventListener('input', handleInput, true)
        editorContainer.removeEventListener('keydown', handleKeyDown, true)
        editorContainer.removeEventListener('keyup', handleKeyUp, true)
        container.removeEventListener('click', handleSelectionChange, true)
        document.removeEventListener('selectionchange', handleSelectionChange)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (cleanup) cleanup()
    }
  }, [composerMode, checkForMentions, commentBody])

  // Handle keyboard navigation in mention dropdown
  useEffect(() => {
    if (!showMentionDropdown) return

    const handleKeyDown = (e) => {
      if (!showMentionDropdown || filteredTeamMembers.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMentionIndex((prev) =>
          prev < filteredTeamMembers.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleInsertMention(filteredTeamMembers[selectedMentionIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentionDropdown(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showMentionDropdown, filteredTeamMembers, selectedMentionIndex])

  // Insert mention into editor
  const handleInsertMention = (member) => {
    if (!commentEditorContainerRef.current || !member) return

    const editorContainer = commentEditorContainerRef.current.querySelector('.ql-editor')
    if (!editorContainer) return

    // Try to access Quill instance
    const quillWrapper = commentEditorContainerRef.current.querySelector('.quill')
    if (quillWrapper && quillWrapper.__quill) {
      const quill = quillWrapper.__quill
      const selection = quill.getSelection(true)
      
      if (!selection) return

      const text = quill.getText(0, selection.index)
      const atIndex = text.lastIndexOf('@')
      
      if (atIndex === -1) return

      // Delete text from @ to cursor
      quill.deleteText(atIndex, selection.index - atIndex)
      
      // Insert mention with formatting
      const mentionText = `@${member.name} `
      quill.insertText(atIndex, mentionText)
      quill.formatText(atIndex, mentionText.length - 1, {
        color: brandPrimaryColor,
        bold: true,
      })
      
      // Move cursor after mention
      quill.setSelection(atIndex + mentionText.length)
    } else {
      // Fallback: use DOM manipulation
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const textNode = range.startContainer
      
      // Get text up to cursor position
      let text = ''
      if (textNode.nodeType === Node.TEXT_NODE) {
        text = textNode.textContent?.substring(0, range.startOffset) || ''
      }
      
      const atIndex = text.lastIndexOf('@')
      if (atIndex === -1) return

      // Find the @ position in the DOM
      let currentText = ''
      const walker = document.createTreeWalker(
        editorContainer,
        NodeFilter.SHOW_TEXT,
        null
      )
      let node
      let foundAtNode = null
      let atOffset = 0
      
      while ((node = walker.nextNode())) {
        const nodeText = node.textContent || ''
        
        if (currentText.length + nodeText.length >= atIndex) {
          foundAtNode = node
          atOffset = atIndex - currentText.length
          break
        }
        
        currentText += nodeText
      }

      if (!foundAtNode) return

      // Delete text from @ to cursor
      const deleteRange = document.createRange()
      deleteRange.setStart(foundAtNode, atOffset)
      deleteRange.setEnd(range.startContainer, range.startOffset)
      deleteRange.deleteContents()

      // Insert mention with formatting
      const span = document.createElement('span')
      span.style.color = brandPrimaryColor
      span.style.fontWeight = 'bold'
      span.textContent = `@${member.name} `
      deleteRange.insertNode(span)

      // Move cursor after mention
      const newRange = document.createRange()
      newRange.setStartAfter(span)
      newRange.collapse(true)
      selection.removeAllRanges()
      selection.addRange(newRange)

      // Trigger onChange
      const html = editorContainer.innerHTML
      setCommentBody(html)
    }

    setShowMentionDropdown(false)
    setMentionQuery('')
  }

  // Handle sending comment
  const handleSendComment = async () => {
    if (!hasTextContent(commentBody) || !selectedThread?.leadId) {
      return
    }

    try {
      setSendingComment(true)
      const localData = localStorage.getItem('User')
      if (!localData) {
        return
      }

      const userData = JSON.parse(localData)
      const AuthToken = userData.token

      const ApiData = {
        note: commentBody,
        leadId: selectedThread.leadId,
      }

      const response = await axios.post(Apis.addLeadNote, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response && response.data && response.data.status === true) {
        setCommentBody('')
        if (onCommentAdded) {
          onCommentAdded()
        }
      }
    } catch (error) {
      console.error('Error sending comment:', error)
    } finally {
      setSendingComment(false)
    }
  }

  // Function to render Lucide icon with branding color
  const renderBrandedLucideIcon = (IconComponent, size = 20, isActive = false) => {
    if (typeof window === 'undefined') {
      return <IconComponent size={size} />
    }

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')

    // Use brand color when active, muted gray when inactive
    const iconColor = isActive && brandColor && brandColor.trim()
      ? `hsl(${brandColor.trim()})`
      : 'hsl(0 0% 60%)' // Muted gray for inactive state

    return (
      <IconComponent
        size={size}
        style={{
          color: iconColor,
          stroke: iconColor,
          flexShrink: 0,
          transition: 'color 0.2s ease-in-out, stroke 0.2s ease-in-out',
        }}
      />
    )
  }

  return (
    <div className="mx-4 mb-4 border border-gray-200 rounded-lg bg-white">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between border-b mb-2">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                // When switching to SMS, preserve SMS body if it exists, otherwise convert email HTML to plain text
                if (composerMode === 'email' && !composerData.smsBody && composerData.emailBody) {
                  const plainText = stripHTML(composerData.emailBody)
                  setComposerData((prev) => ({ 
                    ...prev, 
                    to: selectedThread?.receiverPhoneNumber || selectedThread?.lead?.phone || '',
                    smsBody: plainText.substring(0, SMS_CHAR_LIMIT) // Ensure it doesn't exceed SMS limit
                  }))
                } else {
                  setComposerData((prev) => ({ 
                    ...prev, 
                    to: selectedThread?.receiverPhoneNumber || selectedThread?.lead?.phone || ''
                  }))
                }
                setComposerMode('sms')
                fetchPhoneNumbers()
                setIsExpanded(true)
              }}
              className={`flex items-center gap-2 px-0 py-2 text-sm font-medium relative ${
                composerMode === 'sms' ? 'text-brand-primary' : 'text-gray-600'
              }`}
            >
              {renderBrandedLucideIcon(
                MessageCircleMore,
                20,
                composerMode === 'sms'
              )}
              <span>SMS</span>
              {composerMode === 'sms' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
            </button>
            <button
              onClick={() => {
                // When switching to Email, preserve email body if it exists, otherwise convert SMS text to HTML
                if (composerMode === 'sms' && !composerData.emailBody && composerData.smsBody) {
                  // Convert plain text SMS to HTML format for email
                  const htmlBody = composerData.smsBody.replace(/\n/g, '<br>')
                  setComposerData((prev) => ({ 
                    ...prev, 
                    to: selectedThread?.receiverEmail || selectedThread?.lead?.email || '',
                    emailBody: htmlBody
                  }))
                } else {
                  setComposerData((prev) => ({ 
                    ...prev, 
                    to: selectedThread?.receiverEmail || selectedThread?.lead?.email || ''
                  }))
                }
                setComposerMode('email')
                setIsExpanded(true)
                fetchEmailAccounts()
              }}
              className={`flex items-center gap-2 px-0 py-2 text-sm font-medium relative ${
                composerMode === 'email' ? 'text-brand-primary' : 'text-gray-600'
              }`}
            >
              {renderBrandedLucideIcon(
                Mail,
                20,
                composerMode === 'email'
              )}
              <span>Email</span>
              {composerMode === 'email' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
            </button>
            <button
              onClick={() => {
                setComposerMode('comment')
                setIsExpanded(true)
              }}
              className={`flex items-center gap-2 px-0 py-2 text-sm font-medium relative ${
                composerMode === 'comment' ? 'text-brand-primary' : 'text-gray-600'
              }`}
            >
              {renderBrandedLucideIcon(
                MessageSquare,
                20,
                composerMode === 'comment'
              )}
              <span>Comment</span>
              {composerMode === 'comment' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary" />}
            </button>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <CaretDown size={20} className="text-gray-600" />
            ) : (
              <CaretUp size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {!isExpanded ? (
          // Collapsed view - show text input with send button
          <div className="mt-2 flex items-center gap-2">
            <Input
              value={
                composerMode === 'sms' 
                  ? composerData.smsBody 
                  : composerMode === 'comment'
                  ? stripHTML(commentBody)
                  : stripHTML(composerData.emailBody)
              }
              onChange={(e) => {
                if (composerMode === 'sms' && e.target.value.length <= SMS_CHAR_LIMIT) {
                  setComposerData({ ...composerData, smsBody: e.target.value })
                } else if (composerMode === 'email') {
                  // Convert plain text to HTML for email
                  const htmlBody = e.target.value.replace(/\n/g, '<br>')
                  setComposerData({ ...composerData, emailBody: htmlBody })
                } else if (composerMode === 'comment') {
                  const htmlBody = e.target.value.replace(/\n/g, '<br>')
                  setCommentBody(htmlBody)
                }
              }}
              onFocus={() => setIsExpanded(true)}
              onClick={() => setIsExpanded(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (composerMode === 'comment') {
                    if (hasTextContent(commentBody) && selectedThread?.leadId) {
                      handleSendComment()
                    }
                  } else {
                    const messageBody = composerMode === 'sms' ? composerData.smsBody : composerData.emailBody
                    if (hasTextContent(messageBody) && 
                        ((composerMode === 'sms' && selectedPhoneNumber && composerData.to) ||
                         (composerMode === 'email' && selectedEmailAccount && composerData.to))) {
                      handleSendMessage()
                    }
                  }
                }
              }}
              placeholder={composerMode === 'comment' ? 'Type a comment...' : 'Type your message...'}
              className="flex-1 h-[42px] border-[0.5px] border-gray-200 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:border-brand-primary"
              style={{ height: '42px' }}
            />
            <button
              onClick={composerMode === 'comment' ? handleSendComment : handleSendMessage}
              disabled={
                composerMode === 'comment'
                  ? (sendingComment || !hasTextContent(commentBody) || !selectedThread?.leadId)
                  : (sendingMessage ||
                     !hasTextContent(composerMode === 'sms' ? composerData.smsBody : composerData.emailBody) ||
                     (composerMode === 'email' && (!selectedEmailAccount || !composerData.to)) ||
                     (composerMode === 'sms' && (!selectedPhoneNumber || !composerData.to)))
              }
              className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ height: '42px' }}
            >
              <PaperPlaneTilt size={20} weight="fill" />
            </button>
          </div>
        ) : (
          <>
            {/* Comment Tab */}
            {composerMode === 'comment' ? (
              <div className="mt-2">
                <div className="mb-2">
                  <label className="text-sm font-semibold text-foreground">Comment</label>
                </div>
                
                {/* Comment Input with Formatting Toolbar */}
                <div ref={commentEditorContainerRef} className="relative border border-brand-primary/20 rounded-lg bg-white">
                  <RichTextEditor
                    ref={commentEditorRef}
                    value={commentBody}
                    onChange={handleCommentChange}
                    placeholder="Use @ to mention a teammate. Comments are only visible to your team."
                    availableVariables={[]}
                    toolbarPosition="bottom"
                    customToolbarElement={
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer">
                          <button 
                            type="button" 
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors" 
                            onClick={() => document.getElementById('comment-attachment-input')?.click()}
                            title="Attach file"
                          >
                            <Paperclip size={18} className="text-gray-600 hover:text-brand-primary" />
                          </button>
                          <input
                            id="comment-attachment-input"
                            type="file"
                            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/csv,text/plain,image/webp,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </label>
                        <button
                          onClick={handleSendComment}
                          disabled={
                            sendingComment ||
                            !hasTextContent(commentBody) ||
                            !selectedThread?.leadId
                          }
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {sendingComment ? (
                            <>
                              <CircularProgress size={16} className="text-white" />
                              <span className="text-sm">Sending...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm">Send</span>
                              <PaperPlaneTilt size={16} weight="fill" />
                            </>
                          )}
                        </button>
                      </div>
                    }
                  />
                  
                  {/* Mention Dropdown */}
                  {showMentionDropdown && filteredTeamMembers.length > 0 && (
                    <div
                      ref={mentionDropdownRef}
                      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto min-w-[200px]"
                      style={{
                        top: `${mentionPosition.top}px`,
                        left: `${mentionPosition.left}px`,
                      }}
                    >
                      {filteredTeamMembers.map((member, index) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleInsertMention(member)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                            index === selectedMentionIndex
                              ? 'bg-brand-primary/10 text-brand-primary'
                              : 'text-gray-700'
                          }`}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold flex-shrink-0">
                            {member.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{member.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : shouldShowUpgradeView ? (
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
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2 flex-1">
                <label className="text-sm font-medium whitespace-nowrap">From:</label>
                {composerMode === 'sms' ? (
                  <div className="flex-1 relative min-w-0" ref={phoneDropdownRef}>
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
                            <button
                              onClick={() => {
                                const tab = userData?.user?.userRole === UserRole.AgencySubAccount ? 6 : 7
                                router.push(`/dashboard/myAccount?tab=${tab}`)
                                setPhoneDropdownOpen(false)
                              }}
                              className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                              <Plus className="w-4 h-4" />
                              Select Phone Number
                            </button>
                          </div>
                        ) : (
                          <>
                            {phoneNumbers.map((phone) => (
                              <button
                                key={phone.id}
                                type="button"
                                onClick={() => {
                                  setSelectedPhoneNumber(phone.id.toString())
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
                  <div className="flex-1 relative min-w-0" ref={emailDropdownRef}>
                    {emailAccounts.length === 0 ? (
                      <button
                        onClick={() => onOpenAuthPopup && onOpenAuthPopup()}
                        className="w-full px-3 py-2 h-[42px] border-[0.5px] border-gray-200 rounded-lg text-brand-primary hover:bg-brand-primary/10 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                        style={{ height: '42px' }}
                      >
                        Connect Email
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
                              ? (() => {
                                  const account = emailAccounts.find((a) => a.id === parseInt(selectedEmailAccount))
                                  if (!account) return 'Select email account'
                                  const providerLabel = account.provider === 'mailgun' ? 'Mailgun' : account.provider === 'gmail' ? 'Gmail' : account.provider || ''
                                  return `${account.email || account.name || account.displayName}${providerLabel ? ` (${providerLabel})` : ''}`
                                })()
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
                                  setSelectedEmailAccount(account.id.toString())
                                  setEmailDropdownOpen(false)
                                }}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 transition-colors ${
                                  selectedEmailAccount === account.id.toString() ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-700'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{account.email || account.name || account.displayName}</span>
                                  {account.provider && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      {account.provider === 'mailgun' ? 'Mailgun' : account.provider === 'gmail' ? 'Gmail' : account.provider}
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                            <div className="border-t border-gray-200 p-2">
                              <button
                                onClick={() => {
                                  if (onOpenAuthPopup) {
                                    onOpenAuthPopup()
                                  }
                                  setEmailDropdownOpen(false)
                                }}
                                className="w-full px-3 py-2 text-sm font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Connect Email
                              </button>
                            </div>
                          </div>
                        )}
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
                  <div className="flex items-center gap-2 mb-2">
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
                          onBlur={handleCcInputBlur}
                          placeholder={ccEmails.length === 0 ? 'Add CC recipients' : ''}
                          className="flex-1 h-full min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {showBCC && (
                  <div className="flex items-center gap-2 mb-2">
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
                          onBlur={handleBccInputBlur}
                          placeholder={bccEmails.length === 0 ? 'Add BCC recipients' : ''}
                          className="flex-1 h-full min-w-[120px] outline-none bg-transparent text-sm border-0 focus:ring-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
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
              <div className="mb-2">
                {composerMode === 'email' ? (
                  <>
                    {composerData.attachments.length > 0 && (
                      <div className="mb-1 flex flex-col gap-1">
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

                    {/* Relative container for RichTextEditor and overlapping buttons */}
                    <div className="relative">
                      <RichTextEditor
                        ref={richTextEditorRef}
                        value={composerData.emailBody}
                        onChange={(html) => setComposerData({ ...composerData, emailBody: html })}
                        placeholder="Type your message..."
                        availableVariables={[]}
                        toolbarPosition="bottom"
                      />
                      
                      {/* Overlapping buttons above toolbar */}
                      <div className="absolute bottom-[2px] right-0 flex items-center gap-2 z-10 pr-2">
                        <label className="cursor-pointer">
                          <button 
                            type="button" 
                            className="p-2 hover:bg-white/80 rounded-lg transition-colors bg-white/90 shadow-sm border border-gray-200" 
                            onClick={() => document.getElementById('attachment-input')?.click()}
                          >
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
                        <button
                          onClick={handleSendMessage}
                          disabled={
                            sendingMessage ||
                            !hasTextContent(composerMode === 'email' ? composerData.emailBody : composerData.smsBody) ||
                            (composerMode === 'email' && (!selectedEmailAccount || !composerData.to))
                          }
                          className="px-4 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {sendingMessage ? (
                            <>
                              <CircularProgress size={16} className="text-white" />
                              <span className="text-sm">Sending...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm">Send</span>
                              <PaperPlaneTilt size={16} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <textarea
                      value={composerData.smsBody}
                      onChange={(e) => {
                        if (e.target.value.length <= SMS_CHAR_LIMIT) {
                          setComposerData({ ...composerData, smsBody: e.target.value })
                        }
                      }}
                      placeholder="Type your message..."
                      maxLength={SMS_CHAR_LIMIT}
                      className="w-full px-4 py-3 border-[0.5px] border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary min-h-[100px] resize-none"
                    />
                    
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>
                          {composerData.smsBody.length}/{SMS_CHAR_LIMIT} char
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>{Math.floor((userData?.user?.totalSecondsAvailable || 0) / 60)} credits left</span>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={
                          sendingMessage ||
                          !hasTextContent(composerData.smsBody) ||
                          (composerMode === 'sms' && (!selectedPhoneNumber || !composerData.to))
                        }
                        className="px-6 py-2 bg-brand-primary text-white rounded-lg shadow-sm hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sendingMessage ? (
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
                  </>
                )}
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
