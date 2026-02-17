import {
  ThumbDown,
  ThumbDownOutlined,
  ThumbUp,
  ThumbUpOutlined,
} from '@mui/icons-material'
import { Box, CircularProgress, Modal } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useRef } from 'react'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

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
  showLikeDislike = true,
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
            {showLikeDislike && (
              <>
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
              </>
            )}
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

export function TranscriptViewer({ callId }) {
  const [messages, setMessages] = useState([])
  const [callDetails, setCallDetails] = useState(null)
  const [activeIndex, setActiveIndex] = useState(null)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [comment, setComment] = useState('')
  const [msgIsLike, setMsgIsLike] = useState(null)
  const [commentMsgId, setCommentMsgId] = useState(null)
  const [addCommentLoader, setAddCommentLoader] = useState(false)
  const [loading, setLoading] = useState(false)

  const showLikeDislike = callDetails?.callOrigin !== 'dialer'

  const handleCommentClick = (index, msgId, buttonRef, isLike) => {
    const currentMessage = messages[index]

    if (buttonRef && buttonRef.current) {
      if (isLike !== undefined) {
        const newLikeValue = currentMessage?.liked === isLike ? null : isLike
        setMsgIsLike(newLikeValue)
      } else {
        setMsgIsLike(currentMessage?.liked)
      }

      setCommentMsgId(msgId)
      setActiveIndex(index)
      setComment(currentMessage?.comment || '')
      setShowCommentModal(true)
    }
  }

  const handleCloseCommentModal = () => {
    setShowCommentModal(false)
    setComment('')
    setMsgIsLike(null)
    setCommentMsgId(null)
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
          console.log('Call Details Transcript', response.data)
          if (response.data.callDetails) {
            setCallDetails(response.data.callDetails)
          }
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
            showLikeDislike={showLikeDislike}
          />
        ))
      )}

      {/* Feedback Dialog */}
      <Dialog open={showCommentModal} onOpenChange={(open) => {
        if (!open) handleCloseCommentModal()
      }}>
        <DialogContent
          className="max-w-[420px] w-[90%]"
          overlayClassName="z-[16000]"
          style={{ zIndex: 16001 }}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
            <DialogDescription className="sr-only">
              Provide feedback on this message
            </DialogDescription>
          </DialogHeader>
          <Textarea
            className="focus-visible:ring-brand-primary"
            placeholder="Tell the AI how you really feel.."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCloseCommentModal}
            >
              Cancel
            </Button>
            {addCommentLoader ? (
              <div className="flex items-center justify-center px-4">
                <CircularProgress size={20} />
              </div>
            ) : (
              <Button
                className="bg-brand-primary text-white hover:bg-brand-primary/90"
                onClick={handleAddComment}
              >
                Continue
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
