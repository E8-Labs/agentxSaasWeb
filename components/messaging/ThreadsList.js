import Image from 'next/image'
import React, { useState } from 'react'
import moment from 'moment'
import { Search, MoreVertical, Trash2 } from 'lucide-react'

const ThreadsList = ({
  loading,
  threads,
  selectedThread,
  onSelectThread,
  onNewMessage,
  getLeadName,
  getRecentMessageType,
  formatUnreadCount,
  onDeleteThread,
  searchValue,
  onSearchChange,
  onFilterClick,
  selectedTeamMemberIdsCount,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null)
  return (
    <div className="w-80 border-r border-gray-200 flex flex-col h-screen bg-white">
      <div className="px-6 pt-8 pb-6 flex flex-row items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Messages</h1>
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="outline-none"
            title="Filter by team member"
          >
            <div className="flex flex-row">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 6.5H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6.5H2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 10C11.933 10 13.5 8.433 13.5 6.5C13.5 4.567 11.933 3 10 3C8.067 3 6.5 4.567 6.5 6.5C6.5 8.433 8.067 10 10 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 17.5H18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 17.5H2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 21C15.933 21 17.5 19.433 17.5 17.5C17.5 15.567 15.933 14 14 14C12.067 14 10.5 15.567 10.5 17.5C10.5 19.433 12.067 21 14 21Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {selectedTeamMemberIdsCount > 0 && (
                <div
                  className="flex bg-red rounded-full min-w-[24px] px-[2px] h-6 flex-row items-center justify-center text-white flex-shrink-0"
                  style={{
                    fontSize: 13,
                    marginTop: -13,
                    alignSelf: 'flex-start',
                    marginLeft: -15,
                  }}
                >
                  {selectedTeamMemberIdsCount < 100
                    ? selectedTeamMemberIdsCount
                    : '99+'}
                </div>
              )}
            </div>
          </button>
        )}
      </div>

      <div className="px-6 pb-4">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <button
            onClick={onNewMessage}
            className="w-10 h-10 p-0 bg-brand-primary hover:bg-brand-primary/90 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <Image
              src="/messaging/edit chat icon.svg"
              width={24}
              height={24}
              alt="New message"
              className="filter brightness-0 invert"
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading threads...</div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              {`You don't have any messages`}
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
              Looks like your inbox is empty, your
              <br />
              messages will show up here when you
              <br />
              start your campaign.
            </p>
          </div>
        ) : (
          <div className="px-6">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={`relative py-4 cursor-pointer border-b border-gray-100 last:border-b-0 rounded-lg mx-2 my-1 ${
                  selectedThread?.id === thread.id ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-gray-50'
                }`}
                style={
                  selectedThread?.id === thread.id
                    ? {
                        backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                      }
                    : {}
                }
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full">
                  <div className="w-full h-full border-l-2 border-dotted border-gray-200"></div>
                </div>

                <div className="flex items-start gap-3 pl-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-semibold text-lg">
                      {getLeadName(thread)}
                    </div>
                    {getRecentMessageType(thread) === 'email' ? (
                      <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                        <Image
                          src="/messaging/email message type icon.svg"
                          width={16}
                          height={16}
                          alt="Email"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                        <Image
                          src="/messaging/text type message icon.svg"
                          width={16}
                          height={16}
                          alt="SMS"
                          className="object-contain"
                        />
                      </div>
                    )}
                    {thread.unreadCount > 0 && formatUnreadCount(thread.unreadCount) && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center font-semibold shadow-sm">
                        {formatUnreadCount(thread.unreadCount)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm text-black truncate">
                        {thread.lead?.firstName || thread.lead?.name || 'Unknown Lead'}
                      </h3>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {moment(thread.lastMessageAt || thread.createdAt).format('h:mm A')}
                        </span>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(openMenuId === thread.id ? null : thread.id)
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <MoreVertical size={16} className="text-gray-500" />
                          </button>
                          {openMenuId === thread.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenMenuId(null)
                                }}
                              />
                              <div className="absolute right-0 top-6 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (onDeleteThread && thread.lead?.id) {
                                      onDeleteThread(thread.lead.id, thread.id)
                                    }
                                    setOpenMenuId(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Delete Lead
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {(() => {
                        const lastMessage = thread.messages?.[0]
                        if (!lastMessage) return 'No messages yet'
                        const text = lastMessage.content?.replace(/<[^>]*>/g, '') || ''
                        const prefix = lastMessage.direction === 'outbound' ? 'You: ' : ''
                        return prefix + text.substring(0, 40) + (text.length > 40 ? '...' : '')
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ThreadsList
