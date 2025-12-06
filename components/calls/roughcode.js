// components/TranscriptBubble.js
// components/TranscriptBubble.js
// components/TranscriptBubble.js
import {
  ChatBubble,
  ChatBubbleOutlineOutlined,
  ThumbDownOutlined,
  ThumbUpOutlined,
} from '@mui/icons-material'
import { useState } from 'react'

// components/TranscriptViewer.js
import { parseTranscript } from '@/utilities/parseTranscript'

import { CommentModal } from './CommentModal'

export function TranscriptBubble({ message, sender, onCommentClick, comment }) {
  const isBot = sender === 'bot'

  const bubbleClasses = isBot
    ? 'rounded-br-2xl rounded-tr-2xl rounded-bl-2xl' // no top-left
    : 'rounded-bl-2xl rounded-tl-2xl rounded-br-2xl' // no top-right

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
            <button className="text-gray-500 hover:text-black">
              <ThumbUpOutlined fontSize="small" />
            </button>
            <button className="text-gray-500 hover:text-black">
              <ThumbDownOutlined fontSize="small" />
            </button>
            <button
              className="text-gray-500 hover:text-black"
              onClick={onCommentClick}
            >
              {comment ? (
                <div className="flex flex-row items-center gap-2">
                  <ChatBubble fontSize="small" sx={{ color: '#7902DF' }} />
                  <i>
                    <div
                      className="text-purple"
                      style={{
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      {comment}
                    </div>
                  </i>
                </div>
              ) : (
                <ChatBubbleOutlineOutlined fontSize="small" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// import TranscriptBubble from "./TranscriptBubble";

export function TranscriptViewer({ transcript }) {
  const [messages, setMessages] = useState(parseTranscript(transcript || ''))

  const [activeIndex, setActiveIndex] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  //code to add comment
  const handleAddComment = (comment) => {
    setMessages((prev) =>
      prev.map((msg, idx) => (idx === activeIndex ? { ...msg, comment } : msg)),
    )
  }

  return (
    <div className="p-4 space-y-1 overflow-y-auto max-h-[80vh] bg-white rounded-lg border">
      {messages.map((msg, index) => (
        <TranscriptBubble
          key={index}
          message={msg.message}
          sender={msg.sender}
          comment={msg.comment}
          onCommentClick={() => {
            setActiveIndex(index)
            setIsModalOpen(true)
          }}
        />
      ))}
      <CommentModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddComment}
      />
    </div>
  )
}
