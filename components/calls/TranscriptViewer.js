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
import Popover from '@mui/material/Popover'
import TextField from '@mui/material/TextField'
import axios from 'axios'
import React, { useEffect, useRef } from 'react'
import { useState } from 'react'

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
  let isLike = null
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
            backgroundColor: isBot ? '#F6F7F9' : '#7902DF',
          }}
        >
          {message}
        </div>
        {isBot && (
          <div className="flex gap-2 mt-1 pl-2">
            <button
              className="text-gray-500 hover:text-black border-none outline-none"
              ref={commentBtnRef}
              onClick={() =>
                onCommentClick(index, msgId, commentBtnRef, (isLike = true))
              }
            >
              {comment && liked === true ? (
                <ThumbUp fontSize="small" sx={{ color: '#7902DF' }} />
              ) : (
                <ThumbUpOutlined fontSize="small" />
              )}
            </button>
            <button
              className="text-gray-500 hover:text-black border-none outline-none"
              ref={commentBtnRef}
              onClick={() =>
                onCommentClick(index, msgId, commentBtnRef, (isLike = false))
              }
            >
              {comment && liked === false ? (
                <ThumbDown fontSize="small" sx={{ color: '#7902DF' }} />
              ) : (
                <ThumbDownOutlined fontSize="small" />
              )}
            </button>
            <button
              ref={commentBtnRef}
              className="text-gray-500 hover:text-black border-none outline-none"
              // onClick={() => onCommentClick(index, msgId, commentBtnRef)}
            >
              {comment ? (
                <div className="flex flex-row items-center gap-2">
                  {/* <ChatBubble fontSize="small" sx={{ color: "#7902DF" }} /> */}
                  <i>
                    <div
                      className="text-purple"
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
                          className="text-purple cursor-pointer outline-noe border-none text-bold"
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
                          <div className="text-purple text-large font-bold">
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
                <div></div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function TranscriptViewer({ callId }) {
  // console.log("Received transcript is ", transcript);
  const [messages, setMessages] = useState([]) //parseTranscript(transcript || "")
  const [activeIndex, setActiveIndex] = useState(null)
  const [popoverPos, setPopoverPos] = useState(null) // null = closed
  const [comment, setComment] = useState('')
  const [msgIsLike, setMsgIsLike] = useState(null)
  const [commentMsgId, setCommentMsgId] = useState(null)
  const [addCommentLoader, setAddCommentLoader] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCommentClick = (index, msgId, buttonRef, isLike) => {
    setMsgIsLike(isLike)
    setCommentMsgId(msgId)
    if (buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPopoverPos({
        top: rect.bottom + window.scrollY - 40,
        left: rect.right + window.scrollX,
      })
      setActiveIndex(index)
    }
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
      console.log('Api path is', apiPath)
      const response = await axios.get(apiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
        },
      })

      if (response) {
        setLoading(false)
        console.log('Response of get call transcript is', response.data)
        if (response.data.status === true) {
          console.log('call transcript is', response.data.data)
          const filteredMessages = getMessagesWithLoopCheck(response.data.data)
          console.log(`Filtered Transcript is `, filteredMessages)
          // const parsedMessages = parseTranscript(response.data.data.transcript);
          setMessages(filteredMessages)
        }
      }
    } catch (error) {
      console.error('Error fetching call transcript:', error)
    }
  }
  //api to add comment
  const handleAddComment = async () => {
    try {
      setAddCommentLoader(true)
      const Token = AuthToken()
      const ApiPath = Apis.addComment
      const formData = new FormData()
      formData.append('comment', comment)
      formData.append('messageId', commentMsgId)
      formData.append('like', msgIsLike)

      for (let [key, value] of formData.entries()) {
        console.log(`${key} = ${value}`)
      }

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: 'Bearer ' + Token,
        },
      })

      if (response) {
        setAddCommentLoader(false)
        console.log('Response of add comment api is', response.data)
        if (response.data.status === true) {
          if (activeIndex !== null) {
            const updatedMessages = [...messages]
            // updatedMessages[activeIndex].comment = response.data.data.comment;
            updatedMessages[activeIndex] = {
              ...updatedMessages[activeIndex],
              comment: response.data.data.comment,
              liked: response.data.data.liked,
            }
            setMessages(updatedMessages)
            setPopoverPos(null)
            setComment('')
          }
        }
      }
    } catch (error) {
      setAddCommentLoader(false)
      console.error('Error of add comment api is', error)
    }
  }

  return (
    <div className="p-4 space-y-1 overflow-y-auto max-h-[80vh] bg-white rounded-lg border relative">
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

      <Popover
        open={Boolean(popoverPos)}
        anchorReference="anchorPosition"
        anchorPosition={popoverPos || { top: 0, left: 0 }}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={() => setPopoverPos(null)}
      >
        <div className="p-4 w-80">
          <div style={{ fontWeight: '500', fontSize: '15px' }}>
            Add Feedback
          </div>

          <textarea
            className="w-full mt-4 rounded-md p-2 focus:border-purple outline-none border"
            placeholder="Tell the AI how you really feel.."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-2">
            {/*<Button size="small" onClick={() => setPopoverPos(null)}>
              Cancel
          </Button>*/}
            {addCommentLoader ? (
              <CircularProgress size={35} />
            ) : (
              <button
                className="bg-purple p-2 text-white rounded-md"
                onClick={handleAddComment}
              >
                Add
              </button>
            )}
          </div>
        </div>
      </Popover>
    </div>
  )
}
