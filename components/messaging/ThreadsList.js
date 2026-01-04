import Image from 'next/image'
import React, { useState } from 'react'
import moment from 'moment'
import { Search, MoreVertical, Trash, UserPlus, MessageSquare, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { TypographyBody, TypographyCaption, TypographyCaptionSemibold } from '@/lib/typography'
import DropdownCn from '@/components/dashboard/leads/extras/DropdownCn'

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
  filterType = 'all', // 'all' or 'unreplied'
  onFilterTypeChange,
  allCount = 0,
  unrepliedCount = 0,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null)
  return (
    <div className="w-80 border-r px-2 border-gray-200 flex flex-col h-full bg-white">
      <div className="w-full flex flex-row items-center justify-between mt-4">

        {/* Toggle Buttons - All / Unreplied */}
        <div
          style={{
            backgroundColor: 'hsl(var(--brand-primary) / 0.05)',
          }}
          className="p-2 rounded-xl  flex flex-row items-center justify-center gap-2">
          <button className={cn("px-2 rounded-lg", filterType === 'all' ? 'bg-white' : 'bg-transparent text-brand-primary')} onClick={() => onFilterTypeChange('all')}>
            <TypographyBody>
              All <span
                style={{
                  backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                }}
                className="text-brand-primary font-bold px-1 rounded-full">{allCount}</span>
            </TypographyBody>
          </button>
          <button className={cn("px-2 rounded-lg", filterType === 'unreplied' ? 'bg-white' : 'bg-transparent text-brand-primary')} onClick={() => onFilterTypeChange('unreplied')}>
            <TypographyBody>
              Unreplied <span
                style={{
                  backgroundColor: 'hsl(var(--brand-primary) / 0.1)',
                }}
                className="text-brand-primary font-bold px-1 rounded-full">{unrepliedCount}</span>
            </TypographyBody>
          </button>
        </div>
        <DropdownCn
          label="New"
          options={[
            {
              label: 'New Contact',
              icon: UserPlus,
              value: 'contact',
              onSelect: () => onNewMessage && onNewMessage(),
            },
            {
              label: 'New Message',
              icon: MessageSquare,
              value: 'message',
              onSelect: () => onNewMessage && onNewMessage(),
            },
            {
              label: 'New Email',
              icon: Mail,
              value: 'email',
              onSelect: () => onNewMessage && onNewMessage(),
            },
          ]}
          onSelect={(opt) => opt?.onSelect?.()}
          backgroundClassName="bg-brand-primary hover:bg-brand-primary/90 text-white border-0"
        />
      </div>

        <div className="relative flex items-center gap-2 mt-4">
          <div className="relative flex-1 ">
            <Input
              type="text"
              placeholder="Search"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <button
          onClick={onFilterClick}
          >
              <Image src="/messaging/filterIcon.svg" width={24} height={24} alt="Filter" />
          </button>

          <button>
              <Image src="/svgIcons/threeDotsIcon.svg" width={24} height={24} alt="Filter" />
          </button>

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
          <div className="">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={cn(
                  "relative py-4 cursor-pointer border-b border-gray-100 last:border-b-0 rounded-lg mx-2 my-1",
                  selectedThread?.id === thread.id 
                    ? 'bg-thread-selected' 
                    : 'hover:bg-gray-50'
                )}
              >
                <div className="flex items-start gap-3 pl-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center text-black font-bold text-xs">
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
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-sm">
                        <TypographyCaptionSemibold className="text-white">
                          {formatUnreadCount(thread.unreadCount)}
                        </TypographyCaptionSemibold>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <TypographyBody className="font-semibold text-black truncate">
                        {thread.lead?.firstName || thread.lead?.name || 'Unknown Lead'}
                      </TypographyBody>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <TypographyCaption className="text-gray-500">
                          {moment(thread.lastMessageAt || thread.createdAt).format('h:mm A')}
                        </TypographyCaption>
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
                                  className="w-full whitespace-nowrap px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash size={16} />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <TypographyCaption className="text-gray-500 truncate">
                      {(() => {
                        const lastMessage = thread.messages?.[0]
                        if (!lastMessage) return 'No messages yet'
                        const text = lastMessage.content?.replace(/<[^>]*>/g, '') || ''
                        const prefix = lastMessage.direction === 'outbound' ? 'You: ' : ''
                        return prefix + text.substring(0, 40) + (text.length > 40 ? '...' : '')
                      })()}
                    </TypographyCaption>
                    {/* Hot Lead Tags */}
                    {thread.lead?.tags && thread.lead.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        {thread.lead.tags.map((tag, index) => {
                          // Check if tag is "Hot lead" or similar
                          const isHotLead = tag.toLowerCase().includes('hot') || tag.toLowerCase().includes('lead')
                          if (isHotLead) {
                            return (
                              <div
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100"
                              >
                                <span>🔥</span>
                                <TypographyCaption className="text-gray-700">
                                  Hot lead
                                </TypographyCaption>
                              </div>
                            )
                          }
                          return null
                        })}
                      </div>
                    )}
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
