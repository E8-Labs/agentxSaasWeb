import {
  ChatBubble,
  ChatBubbleOutlineOutlined,
  ThumbDown,
  ThumbDownOutlined,
  ThumbUp,
  ThumbUpOutlined,
} from '@mui/icons-material'
import { Box, CircularProgress, Modal } from '@mui/material'
import Button from '@mui/material/Button'
// import { TranscriptBubble } from "./TranscriptBubble";
import axios from 'axios'
import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { parseTranscript } from '@/utilities/parseTranscript'

import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'

export function TranscriptBubble({
  message,
  sender,
  index,
  onCommentClick,
  comment,
  msgId,
  liked,
}) {
  const isBot = sender === 'bot'
  const commentBtnRef = useRef(null)
  const likeBtnRef = useRef(null)
  const dislikeBtnRef = useRef(null)
  //code for read more comment modal
  const [readMoreModal, setReadMoreModal] = useState(null)

  const bubbleClasses = isBot
    ? 'rounded-br-2xl rounded-tr-2xl rounded-bl-2xl'
    : 'rounded-bl-2xl rounded-tl-2xl rounded-br-2xl'

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2`}>
      <div>
        <div
          className={`max-w-xs px-4 py-2 shadow text-sm ${bubbleClasses} ${
            isBot ? 'text-black' : 'text-white'
          }`}
          style={{
            backgroundColor: isBot ? '#F6F7F9' : 'hsl(var(--brand-primary))',
          }}
        >
          {message}
        </div>
        {isBot && (
          <div className="flex gap-2 mt-1 pl-2">
            <button
              ref={likeBtnRef}
              className="text-gray-500 hover:text-black border-none outline-none"
              onClick={() => onCommentClick(index, msgId, likeBtnRef, true)}
            >
              {liked === true ? (
                <ThumbUp fontSize="small" sx={{ color: 'hsl(var(--brand-primary))' }} />
              ) : (
                <ThumbUpOutlined fontSize="small" />
              )}
            </button>
            <button
              ref={dislikeBtnRef}
              className="text-gray-500 hover:text-black border-none outline-none"
              onClick={() => onCommentClick(index, msgId, dislikeBtnRef, false)}
            >
              {liked === false ? (
                <ThumbDown fontSize="small" sx={{ color: 'hsl(var(--brand-primary))' }} />
              ) : (
                <ThumbDownOutlined fontSize="small" />
              )}
            </button>
            <button
              ref={commentBtnRef}
              className="text-gray-500 hover:text-black border-none outline-none"
              onClick={() => onCommentClick(index, msgId, commentBtnRef)}
            >
              {comment ? (
                <div className="flex flex-row items-center gap-2">
                  {/* <ChatBubble fontSize="small" sx={{ color: "#7902DF" }} /> */}
                  <i>
                    <div
                      className="text-brand-primary"
                      style={{
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      {comment?.slice(0, 1).toUpperCase()}
                      {comment?.slice(1, 20)}
                      {comment?.length > 5 && '... '}
                      {comment?.length > 5 && (
                        <button
                          className="text-brand-primary cursor-pointer outline-noe border-none text-bold"
                          onClick={() => {
                            setReadMoreModal(comment)
                          }}
                        >
                          Read more
                        </button>
                      )}

                      {/* Modal for full msg */}
                      <Modal
                        open={readMoreModal}
                        onClose={() => {
                          setReadMoreModal(null)
                        }}
                      >
                        {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
                        <Box className="bg-white rounded-xl p-6 w-[30vw] max-h-[90vh] border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col overflow-y-auto">
                          <div className="text-brand-primary text-large font-bold">
                            {readMoreModal?.slice(0, 1).toUpperCase()}
                            {readMoreModal?.slice(1)}
                          </div>
                        </Box>
                      </Modal>
                    </div>
                  </i>
                </div>
              ) : (
                // <ChatBubbleOutlineOutlined fontSize="small" />
                (<div></div>)
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function TranscriptViewer({ callId, onPopoverStateChange }) {
  // console.log("Received transcript is ", transcript);
  const [messages, setMessages] = useState([]) //parseTranscript(transcript || "")
  const [activeIndex, setActiveIndex] = useState(null)
  const [showCommentModal, setShowCommentModal] = useState(false) // true = open
  const [comment, setComment] = useState('')
  const [msgIsLike, setMsgIsLike] = useState(null)
  const [commentMsgId, setCommentMsgId] = useState(null)
  const [addCommentLoader, setAddCommentLoader] = useState(false)
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef(null)
  const modalContentRef = useRef(null)
  const onPopoverStateChangeRef = useRef(onPopoverStateChange)
  
  // Keep ref updated
  useEffect(() => {
    onPopoverStateChangeRef.current = onPopoverStateChange
  }, [onPopoverStateChange])

  const handleCommentClick = (index, msgId, buttonRef, isLike) => {
    const currentMessage = messages[index]
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranscriptViewer.js:151',message:'handleCommentClick called',data:{index,msgId,hasButtonRef:!!buttonRef,isLike,buttonRefCurrent:!!buttonRef?.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // If buttonRef is provided and has current, show popover next to the button
    if (buttonRef && buttonRef.current) {
      // Set the like/dislike value
      if (isLike !== undefined) {
        // If clicking the same like/dislike, toggle it off (set to null)
        const newLikeValue = currentMessage?.liked === isLike ? null : isLike
        setMsgIsLike(newLikeValue)
      } else {
        // From comment button - preserve existing like/dislike
        setMsgIsLike(currentMessage?.liked)
      }
      
      setCommentMsgId(msgId)
      setActiveIndex(index)
      // Pre-fill comment if it exists
      setComment(currentMessage?.comment || '')
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranscriptViewer.js:182',message:'Opening comment modal',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      // Open modal immediately - Dialog focus trap is always disabled
      setShowCommentModal(true)
    }
  }
  
  // Notify parent when popover closes
  useEffect(() => {
    if (!showCommentModal) {
      onPopoverStateChangeRef.current?.(false)
    }
  }, [showCommentModal])
  
  // Activate modal container when it opens so children can receive focus
  useEffect(() => {
    if (showCommentModal && modalContentRef.current) {
      // Simulate a click on the modal container to "activate" it
      // This makes child elements (like textarea) immediately focusable
      const clickEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      modalContentRef.current.dispatchEvent(clickEvent)
      
      // Then focus textarea after a brief delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 10)
    }
  }, [showCommentModal])
  
  const handleCloseCommentModal = () => {
    setShowCommentModal(false)
    setComment('')
    setMsgIsLike(null)
    setCommentMsgId(null)
    onPopoverStateChangeRef.current?.(false)
  }

  const dumyMsg = [
    {
      id: 483809,
      message: "Hi. It's Sky. Let's get started. What can I help with?",
      sender: 'bot',
      createdAt: '2025-08-08T00:00:00.000Z',
      updatedAt: '2025-08-08T00:00:00.000Z',
      comment: null,
      liked: null,
    },
    {
      id: 483810,
      message: 'How do I know when the agent is calling?',
      sender: 'human',
      createdAt: '2025-08-08T00:00:00.000Z',
      updatedAt: '2025-08-08T00:00:00.000Z',
      comment: null,
      liked: null,
    },
    {
      id: 483811,
      message: 'Thanks for sharing that. Just to make su...',
      sender: 'bot',
      createdAt: '2025-08-08T00:00:00.000Z',
      updatedAt: '2025-08-08T00:00:00.000Z',
      comment: null,
      liked: null,
    },
    {
      id: 483813,
      message: 'Great. Let me walk you through how you can check when a...',
      sender: 'bot',
      createdAt: '2025-08-08T00:00:00.000Z',
      updatedAt: '2025-08-08T00:00:00.000Z',
      comment: null,
      liked: null,
    },
    {
      id: 483809,
      message: "Hi. It's Sky. Let's get started. What can I help with?",
      sender: 'bot',
      createdAt: '2025-08-08T00:00:00.000Z',
      updatedAt: '2025-08-08T00:00:00.000Z',
      comment: null,
      liked: null,
    },
    {
      id: 483810,
      message: 'How do I know when the agent is calling?',
      sender: 'human',
      createdAt: '2025-08-08T00:00:00.000Z',
      updatedAt: '2025-08-08T00:00:00.000Z',
      comment: null,
      liked: null,
    },
    {
      id: 483811,
      message: 'Thanks for sharing that. Just to make su...',
      sender: 'bot',
      createdAt: '2025-08-08T00:00:00.000Z',
      updatedAt: '2025-08-08T00:00:00.000Z',
      comment: null,
      liked: null,
    },
  ]

  useEffect(() => {
    GetCallTranscript()
  }, [callId])

  function areMessagesEqual(m1, m2) {
    return m1.message.trim() === m2.message.trim() && m1.sender === m2.sender
  }

  function getMessagesWithLoopCheck(data) {
    const result = []

    for (let i = 0; i < data.length; i++) {
      const current = data[i]

      // Compare current message with all previous messages
      let isDuplicate = false
      for (let j = 0; j < result.length; j++) {
        if (areMessagesEqual(current, result[j])) {
          console.warn(
            '🔁 Duplicate/loop detected at index',
            i,
            '- skipping duplicate message',
          )
          isDuplicate = true
          break
        }
      }

      // Only skip the current duplicate message, continue processing others
      if (!isDuplicate) {
        result.push(current)
      }
    }

    return result
  }

  const GetCallTranscript = async () => {
    const Token = AuthToken()
    try {
      setLoading(true)
      let apiPath = Apis.getCallTranscript + '?callId=' + callId
      const response = await axios.get(apiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
        },
      })

      if (response) {
        setLoading(false)
        if (response.data.status === true) {
          const filteredMessages = getMessagesWithLoopCheck(response.data.data)
          // const parsedMessages = parseTranscript(response.data.data.transcript);
          setMessages(filteredMessages)
        }
      }
    } catch (error) {
      console.error('Error fetching call transcript:', error)
    }
  }
  //api to add comment and/or like/dislike
  const handleAddComment = async () => {
    try {
      setAddCommentLoader(true)
      const Token = AuthToken()
      const ApiPath = Apis.addComment
      const formData = new FormData()
      formData.append('comment', comment || '') // Allow empty comment
      formData.append('messageId', commentMsgId)
      // Send like/dislike value - FormData will convert boolean to string
      // Backend handles: req.body.like || null, so empty string becomes null
      formData.append('like', msgIsLike !== null && msgIsLike !== undefined ? msgIsLike : '')

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + Token,
        },
      })

      if (response) {
        setAddCommentLoader(false)
        if (response.data.status === true) {
          if (activeIndex !== null) {
            const updatedMessages = [...messages]
            updatedMessages[activeIndex] = {
              ...updatedMessages[activeIndex],
              comment: response.data.data.comment || '',
              liked: response.data.data.liked,
            }
            setMessages(updatedMessages)
            handleCloseCommentModal()
          }
        }
      }
    } catch (error) {
      setAddCommentLoader(false)
      console.error('Error of add comment api is', error)
    }
  }

  return (
    <div className="p-4 space-y-1 overflow-y-auto max-h-[80vh] bg-white rounded-lg border relative pb-8">
      {loading ? (
        <CircularProgress size={30} />
      ) : (
        messages.map((msg, index) => (
          <TranscriptBubble
            key={index}
            message={msg.message}
            sender={msg.sender}
            comment={msg.comment}
            index={index}
            msgId={msg.id}
            liked={msg.liked}
            onCommentClick={handleCommentClick}
          />
        ))
      )}

      {/* Centered Comment Modal */}
      {showCommentModal && typeof window !== 'undefined' && createPortal(
        <>
          {/* Subtle backdrop overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 16002, // Higher than Dialog (15001)
              backgroundColor: 'rgba(0, 0, 0, 0.1)', // Very subtle overlay
              backdropFilter: 'blur(1px)',
              pointerEvents: 'auto', // Allow backdrop clicks
            }}
            onClick={handleCloseCommentModal}
          />
          {/* Centered modal content */}
          <div
            ref={modalContentRef}
            data-comment-modal
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 16003, // Higher than backdrop
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              width: '90%',
              maxWidth: '420px',
              padding: '24px',
              pointerEvents: 'auto', // Ensure modal content is clickable
            }}
            onClick={(e) => {
              // Only stop propagation if clicking the container itself, not children
              if (e.target === e.currentTarget) {
                e.stopPropagation()
              }
            }}
            onMouseDown={(e) => {
              // Only stop propagation if clicking the container itself, not children  
              if (e.target === e.currentTarget) {
                e.stopPropagation()
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleCloseCommentModal()
              }
            }}
          >
            <div style={{ fontWeight: '500', fontSize: '16px', marginBottom: '16px' }}>
              Add Feedback
            </div>

            <div 
              style={{ pointerEvents: 'auto', position: 'relative', zIndex: 2 }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <textarea
                ref={(el) => {
                  textareaRef.current = el
                  if (el) {
                    // #region agent log
                    const computedStyle = window.getComputedStyle(el)
                    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranscriptViewer.js:469',message:'Textarea ref callback',data:{pointerEvents:computedStyle.pointerEvents,cursor:computedStyle.cursor,display:computedStyle.display,visibility:computedStyle.visibility,zIndex:computedStyle.zIndex,disabled:el.disabled,readOnly:el.readOnly},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                    // #endregion
                  }
                }}
                className="w-full rounded-md p-3 focus:border-brand-primary outline-none border border-gray-300 focus:ring-2 focus:ring-brand-primary/20"
                style={{ 
                  pointerEvents: 'auto',
                  cursor: 'text',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                  MozUserSelect: 'text',
                  msUserSelect: 'text',
                  position: 'relative',
                  zIndex: 2,
                  touchAction: 'manipulation', // Improve touch responsiveness
                }}
                placeholder="Tell the AI how you really feel.."
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onClick={(e) => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranscriptViewer.js:492',message:'Textarea onClick',data:{activeElement:document.activeElement?.tagName,isFocused:document.activeElement===e.target},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                  // #endregion
                  e.stopPropagation()
                }}
                onMouseDown={(e) => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranscriptViewer.js:499',message:'Textarea onMouseDown',data:{activeElement:document.activeElement?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                  // #endregion
                  e.stopPropagation()
                  // Don't prevent default - let browser handle focus naturally
                }}
                onFocus={(e) => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TranscriptViewer.js:505',message:'Textarea onFocus',data:{activeElement:document.activeElement?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
                  // #endregion
                  e.stopPropagation()
                }}
                tabIndex={0}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  handleCloseCommentModal()
                }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
              >
                Cancel
              </button>
              {addCommentLoader ? (
                <CircularProgress size={24} />
              ) : (
                <button
                  className="bg-brand-primary px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleAddComment()
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </>
        ,
        document.body
      )}
    </div>
  )
}
