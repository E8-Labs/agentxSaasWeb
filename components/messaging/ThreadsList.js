import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { Search, MoreVertical, Trash, UserPlus, MessageSquare, Mail, ChevronDown, Loader2, MessageSquareDot, X } from 'lucide-react'
import PlatformIcon from './PlatformIcon'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { TypographyBody, TypographyCaption, TypographyCaptionSemibold } from '@/lib/typography'
import DropdownCn from '@/components/dashboard/leads/extras/DropdownCn'
import ToggleGroupCN from '@/components/ui/ToggleGroupCN'
import NewContactDrawer from './NewContactDrawer'
import { useUser } from '@/hooks/redux-hooks'
import { UpgradeTag, UpgradeTagWithModal } from '../constants/constants'
import { toast } from '@/utils/toast'
import AdminGetProfileDetails from '@/components/admin/AdminGetProfileDetails'
import InfiniteScroll from '@/components/ui/infinite-scroll'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const ThreadsList = ({
  loading,
  threads,
  selectedThread,
  onSelectThread,
  onNewMessage,
  getLeadName,
  getThreadDisplayName,
  getRecentMessageType,
  formatUnreadCount,
  onDeleteThread,
  searchValue,
  onSearchChange,
  searchLoading = false,
  showFilterPopover = false,
  onFilterToggle,
  filterTeamMembers = [],
  selectedTeamMemberIds = [],
  onSelectTeamMember,
  onApplyFilter,
  onClearFilter,
  hasActiveFilters = false,
  selectedTeamMemberIdsCount,
  filterType = 'all', // 'all' or 'unreplied'
  onFilterTypeChange,
  allCount = 0,
  unrepliedCount = 0,
  onContactCreated,
  selectedUser = null,
  agencyUser = null,
  onOpenMessageSettings = null,
  userLocalData = null,
  hasMoreThreads = true,
  loadingMoreThreads = false,
  onLoadMoreThreads,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showNewContactDrawer, setShowNewContactDrawer] = useState(false)
  const filterButtonRef = useRef(null)
  const filterPopoverRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [scrollRoot, setScrollRoot] = useState(null)
  const [filterHoveredKey, setFilterHoveredKey] = useState(null)
  const [filterPillStyle, setFilterPillStyle] = useState({ top: 0, height: 0 })
  const filterListRef = useRef(null)
  const filterOptionRefs = useRef(Object.create(null))

  const setScrollContainerRef = useCallback((el) => {
    scrollContainerRef.current = el
    setScrollRoot(el || null)
  }, [])

  const { user: reduxUser, setUser: setReduxUser } = useUser()
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!showFilterPopover) return
      const popoverEl = filterPopoverRef.current
      const buttonEl = filterButtonRef.current
      if (
        popoverEl &&
        !popoverEl.contains(event.target) &&
        buttonEl &&
        !buttonEl.contains(event.target)
      ) {
        // Don't close when clicking Agentation toolbar (allows annotating while popover is open)
        if (
          event.target?.closest?.('[data-feedback-toolbar]') ||
          event.target?.closest?.('[data-annotation-popup]') ||
          event.target?.closest?.('[data-annotation-marker]')
        ) {
          return
        }
        onFilterToggle?.(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showFilterPopover, onFilterToggle])

  // Update sliding pill position when hovered filter option changes
  useEffect(() => {
    if (filterHoveredKey == null || !filterListRef.current) {
      setFilterPillStyle({ top: 0, height: 0 })
      return
    }
    const el = filterOptionRefs.current[filterHoveredKey]
    const list = filterListRef.current
    if (!el || !list) return
    const listRect = list.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = elRect.top - listRect.top + list.scrollTop
    const height = elRect.height
    setFilterPillStyle({ top, height })
  }, [filterHoveredKey])

  const isAllSelected = selectedTeamMemberIds.length === 0

  const effectiveUser = React.useMemo(() => {
    return selectedUser?.id ? selectedUser : reduxUser
  }, [selectedUser?.id, reduxUser])

  // When agency views subaccount or admin views another account, selectedUser often lacks planCapabilities.
  // Fetch full profile by effectiveUser id so SMS/Email buttons and upgrade modals have correct capabilities.
  const [fetchedProfileUser, setFetchedProfileUser] = useState(null)
  const fetchingProfileForIdRef = useRef(null)

  useEffect(() => {
    const userId = selectedUser?.id
    if (!userId) {
      setFetchedProfileUser(null)
      return
    }
    // Only fetch when we're viewing another user and that user doesn't have planCapabilities
    const needsFetch = effectiveUser?.id === userId && !effectiveUser?.planCapabilities
    if (!needsFetch) {
      if (effectiveUser?.planCapabilities) setFetchedProfileUser(null)
      return
    }
    let cancelled = false
    const fetchProfile = async () => {
      if (fetchingProfileForIdRef.current === userId) return
      fetchingProfileForIdRef.current = userId
      try {
        const fullUser = await AdminGetProfileDetails(userId)
        if (!cancelled && fullUser) setFetchedProfileUser(fullUser)
      } catch (e) {
        if (!cancelled) setFetchedProfileUser(null)
      } finally {
        if (!cancelled) fetchingProfileForIdRef.current = null
      }
    }
    fetchProfile()
    return () => {
      cancelled = true
    }
  }, [selectedUser?.id, effectiveUser?.id, effectiveUser?.planCapabilities])

  // Use fetched full profile for capabilities when viewing another account; otherwise effectiveUser (redux has planCapabilities).
  const effectiveUserForCapabilities = React.useMemo(() => {
    return fetchedProfileUser || effectiveUser
  }, [fetchedProfileUser, effectiveUser])

  const emailCapability = React.useMemo(() => {
    const planCapabilities = effectiveUserForCapabilities?.planCapabilities || {}
    return {
      hasAccess: planCapabilities.allowEmails === true,
      showUpgrade: planCapabilities.shouldShowAllowEmailUpgrade === true,
      showRequestFeature: planCapabilities.shouldShowEmailRequestFeature === true,
    }
  }, [effectiveUserForCapabilities?.planCapabilities])

  const smsCapability = React.useMemo(() => {
    const planCapabilities = effectiveUserForCapabilities?.planCapabilities || {}
    return {
      hasAccess: planCapabilities.allowTextMessages === true,
      showUpgrade: planCapabilities.shouldShowAllowSmsUpgrade === true,
      showRequestFeature: planCapabilities.shouldShowSmsRequestFeature === true,
    }
  }, [effectiveUserForCapabilities?.planCapabilities])



  // State to trigger upgrade modal externally (use counter to ensure it triggers even if already true)
  const [triggerUpgradeModal, setTriggerUpgradeModal] = React.useState(0)
  const [triggerEmailUpgradeModal, setTriggerEmailUpgradeModal] = React.useState(0)
  const [triggerSMSUpgradeModal, setTriggerSMSUpgradeModal] = React.useState(0)



  // Handler to trigger email upgrade modal
  const handleEmailUpgradeClick = React.useCallback(() => {
    console.log("this is test change")
    setTriggerEmailUpgradeModal(prev => prev + 1)
  }, [])

  // Handler to trigger SMS upgrade modal
  const handleSMSUpgradeClick = React.useCallback(() => {
    setTriggerSMSUpgradeModal(prev => prev + 1)
  }, [])



  const renderFilterOption = (option, isAll = false, optionKey) => {
    const isSelected = isAll ? isAllSelected : selectedTeamMemberIds.includes(option.id)
    const nameInitial = option.name?.charAt(0)?.toUpperCase() || '?'
    const displayInitial = isAll ? 'All' : nameInitial
    const key = optionKey ?? (isAll ? 'all-members' : option.id)

    return (
      <button
        key={key}
        ref={(el) => { if (el) filterOptionRefs.current[key] = el }}
        onMouseEnter={() => setFilterHoveredKey(key)}
        onClick={() => onSelectTeamMember?.(isAll ? null : option.id)}
        className="flex items-center gap-3 w-full h-[40px] px-3 py-0 rounded-lg hover:bg-transparent transition-transform duration-150 ease-out active:scale-[0.98] text-left relative z-[1]"
      >
        <div className="w-[28px] h-[28px] rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-[16px] shrink-0">
          {displayInitial}
        </div>
        <span className="flex-1 font-medium text-[14px] text-gray-900 truncate">{isAll ? 'All Members' : option.name}</span>
        <span
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
            isSelected ? 'border-brand-primary' : 'border-gray-300',
          )}
        >
          {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />}
        </span>
      </button>
    )
  }

  return (
    <div className={`w-[400px] border-r px-0 border-gray-200 flex flex-col gap-px ${selectedUser && !agencyUser ? 'h-[70vh]' : 'h-[90vh]'} bg-white`}>
      <div className="w-full flex flex-row items-center justify-between mt-0 px-3 py-3">

        {/* Toggle Buttons - All / Unreplied */}
        <ToggleGroupCN
          options={[
            { label: 'All', value: 'all', count: allCount },
            { label: 'Unreplied', value: 'unreplied', count: unrepliedCount },
          ]}
          value={filterType}
          onChange={onFilterTypeChange}
        />
        <DropdownCn
          className="shadow-none"
          label="New"
          options={[
            {
              label: 'Contact',
              value: 'contact',
              icon: UserPlus,
              onSelect: () => setShowNewContactDrawer(true),
            },
            {
              label: 'Text',
              icon: MessageSquareDot,
              value: 'message',
              upgradeTag: (smsCapability.showUpgrade || smsCapability.showRequestFeature) ? (
                <UpgradeTag
                  onClick={handleSMSUpgradeClick}
                  requestFeature={smsCapability.showRequestFeature}
                />
              ) : null,
              showUpgradeTag: smsCapability.showUpgrade || smsCapability.showRequestFeature,
              disabled: !smsCapability.hasAccess,
              onUpgradeClick: handleSMSUpgradeClick,
              onSelect: () => onNewMessage && onNewMessage('sms'),
            },
            {
              label: 'Email',
              icon: Mail,
              value: 'email',
              upgradeTag: (emailCapability.showUpgrade || emailCapability.showRequestFeature) ? (
                <UpgradeTag
                  onClick={handleEmailUpgradeClick}
                  requestFeature={emailCapability.showRequestFeature}
                />
              ) : null,
              showUpgradeTag: emailCapability.showUpgrade || emailCapability.showRequestFeature,
              disabled: !emailCapability.hasAccess,
              onUpgradeClick: handleEmailUpgradeClick,
              onSelect: () => onNewMessage && onNewMessage('email'),
            },
          ]}
          // icon={ChevronDown}
          onSelect={(opt) => opt?.onSelect?.()}
          backgroundClassName="bg-brand-primary hover:bg-brand-primary/90 text-white border-0"
          triggerClassName="h-10 rounded-lg text-sm"
          contentClassName="bg-white text-foreground text-sm border border-[#eaeaea] shadow-[0_4px_30px_rgba(0,0,0,0.15)] rounded-xl animate-in slide-in-from-bottom-2 duration-200 ease-out"
        />

        {(emailCapability.showUpgrade || emailCapability.showRequestFeature) && (
          <UpgradeTagWithModal
            reduxUser={effectiveUserForCapabilities}
            setReduxUser={setReduxUser}
            requestFeature={emailCapability.showRequestFeature}
            externalTrigger={triggerEmailUpgradeModal > 0}
            onModalClose={() => {
              setTriggerEmailUpgradeModal(0)
            }}
            hideTag={true}
            selectedUser={selectedUser}
            featureTitle="Enable Emails"
          />
        )}
        {(smsCapability.showUpgrade || smsCapability.showRequestFeature) && (
          <UpgradeTagWithModal
            reduxUser={effectiveUserForCapabilities}
            setReduxUser={setReduxUser}
            requestFeature={smsCapability.showRequestFeature}
            externalTrigger={triggerSMSUpgradeModal > 0}
            onModalClose={() => {
              setTriggerSMSUpgradeModal(0)
            }}
            hideTag={true}
            selectedUser={selectedUser}
          />
        )}
      </div>

      <div className="relative flex items-center gap-2 mt-0 py-3 px-3">
        <div className="relative flex-1 ">
          <Input
            type="text"
            placeholder="Search"
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-9 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border focus:border-primary focus:bg-white"
          />
          {searchLoading ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={18} />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          )}
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors hover:bg-black/5"
              aria-label="Clear search"
            >
              <X size={18} className="text-black/60" />
            </button>
          )}
        </div>

        <div className="relative">
          <button
            ref={filterButtonRef}
            onClick={() => onFilterToggle?.(!showFilterPopover)}
            className="relative p-1 rounded hover:bg-black/5 transition-colors"
            style={{ borderRadius: 4 }}
          >
            <Image src="/messaging/filterIcon.svg" width={24} height={24} alt="Filter" />
            {hasActiveFilters && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-white" />
            )}
          </button>
          {showFilterPopover && (
            <div
              ref={filterPopoverRef}
              data-state="open"
              className="absolute right-0 top-full mt-1 z-30 w-[280px] bg-white rounded-2xl border border-[#eaeaea] shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-2 duration-200 ease-out"
            >
              <div className="px-4 pt-3 pb-2 text-sm font-semibold text-black/70 border-b border-[#eaeaea]">Filter by</div>
              <div
                ref={filterListRef}
                className="relative flex flex-col gap-0.5 max-h-64 overflow-y-auto py-3"
                onMouseLeave={() => setFilterHoveredKey(null)}
              >
                {filterPillStyle.height > 0 && (
                  <div
                    className="absolute left-2 right-2 rounded-xl bg-black/[0.02] pointer-events-none transition-[top,height] duration-150 ease-out z-0"
                    style={{ top: filterPillStyle.top, height: filterPillStyle.height }}
                    aria-hidden
                  />
                )}
                {renderFilterOption({}, true, 'all-members')}
                {filterTeamMembers.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-gray-500">No team members available</div>
                ) : (
                  filterTeamMembers.map((member) => renderFilterOption(member, false, member.id))
                )}
              </div>
              <div className="px-2 py-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClearFilter?.()
                  }}
                  className="h-8 rounded-lg px-4 py-2 bg-[#EAEAEA] border-0 shadow-sm hover:bg-[#e0e0e0] active:scale-[0.98] transition-transform text-sm font-medium text-gray-700"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="w-auto h-8 px-4 py-2 rounded-lg text-sm bg-brand-primary hover:bg-brand-primary/90 text-white transition-transform duration-150 ease-out active:scale-[0.98]"
                  onClick={() => {
                    onApplyFilter?.()
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-black/5 transition-colors"
                style={{ borderRadius: 4 }}
                onClick={() => {
                  onOpenMessageSettings()
                }}
              >
                <Image src="/communcationSetting.png" width={24} height={24} alt="Communication Settings" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Communication Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div
        ref={setScrollContainerRef}
        className="flex-1 overflow-y-auto"
        aria-label="Threads list"
      >
        {searchLoading ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : loading ? (
          <div className="p-4 text-center text-gray-500">Loading threads...</div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
              {`You don't have any messages`}
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
              Looks like your inbox is empty
            </p>
          </div>
        ) : (
          <InfiniteScroll
            isLoading={loadingMoreThreads}
            hasMore={hasMoreThreads}
            root={scrollRoot}
            rootMargin="200px"
            threshold={1}
            next={onLoadMoreThreads ?? (() => { })}
          >
            <div className="flex flex-col gap-1">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => onSelectThread(thread)}
                  className={cn(
                    "relative py-4 px-3 cursor-pointer border-b border-gray-100 last:border-b-0 rounded-none transition-transform duration-150 ease-out active:scale-[0.98]",
                    selectedThread?.id === thread.id
                      ? 'bg-thread-selected'
                      : 'hover:bg-gray-50'
                  )}
                >
                  {selectedThread?.id === thread.id && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r"
                      style={{ backgroundColor: 'hsl(var(--brand-primary))' }}
                      aria-hidden
                    />
                  )}
                  <div className="flex items-start gap-3 ">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full border border-white bg-[#F1F5F9] flex items-center justify-center text-black font-bold text-sm">
                        {getLeadName(thread)}
                      </div>
                      {(() => {
                        const sourceType = thread.threadType || getRecentMessageType(thread)
                        if (sourceType === 'email' || sourceType === 'messenger' || sourceType === 'instagram' || sourceType === 'sms') {
                          return <PlatformIcon type={sourceType} size={10} showInBadge />
                        }
                        return (
                          <div className="absolute bottom-0 right-0 translate-y-[calc(50%-8px)] w-[14px] h-[14px] rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                            <Image
                              src="/messaging/text type message icon.svg"
                              width={8}
                              height={8}
                              alt="SMS"
                              className="object-contain"
                            />
                          </div>
                        )
                      })()}
                      {thread.unreadCount > 0 && formatUnreadCount(thread.unreadCount) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-sm">
                          <TypographyCaptionSemibold className="text-white">
                            {formatUnreadCount(thread.unreadCount)}
                          </TypographyCaptionSemibold>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5 items-start">
                      <div className="flex w-full items-center justify-between">
                        <TypographyBody className="font-medium text-black truncate text-[14px]">
                          {getThreadDisplayName ? getThreadDisplayName(thread) : (thread.lead?.firstName || thread.lead?.name || 'Unknown Lead')}
                        </TypographyBody>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <TypographyCaption className="text-gray-500 text-[14px] leading-[18px]">
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
                      <TypographyCaption className="text-gray-500 truncate text-[14px] leading-[18px]">
                        {(() => {
                          const lastMessage = thread.messages?.[0]
                          if (!lastMessage) return 'No messages yet'
                          let text = lastMessage.content?.replace(/<[^>]*>/g, '') || ''
                          const trimmed = text.trim()
                          if (/^\[\d+ .+\]$/.test(trimmed)) {
                            if (/voice message/i.test(trimmed)) text = 'Voice message'
                            else if (/image/i.test(trimmed)) text = 'Photo'
                            else if (/video|reel/i.test(trimmed)) text = 'Video'
                            else text = 'Attachment'
                          }
                          const prefix = lastMessage.direction === 'outbound' ? 'You: ' : ''
                          return prefix + text.substring(0, 40) + (text.length > 40 ? '...' : '')
                        })()}
                      </TypographyCaption>
                      {thread.lead?.pipelineStage?.stageTitle && (
                        <div className="inline-flex w-fit items-center gap-2 px-2.5 py-1 mt-0.5 border border-gray-200 rounded-md">
                          <TypographyCaption className="text-darkGray font-normal text-[14px] leading-[18px]">
                            {thread.lead.pipelineStage.stageTitle}
                          </TypographyCaption>
                        </div>
                      )}
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
            {loadingMoreThreads && (
              <div className="flex justify-center py-4" aria-hidden="true">
                <div
                  className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full"
                  role="status"
                  aria-label="Loading more threads"
                />
              </div>
            )}
            {!hasMoreThreads && threads.length > 0 && (
              <p className="text-center py-4 text-sm text-muted-foreground">
                You are all caught up
              </p>
            )}
            <div aria-hidden="true" />
          </InfiniteScroll>
        )}
      </div>
      {/* New Contact Drawer */}
      <NewContactDrawer
        open={showNewContactDrawer}
        onClose={() => setShowNewContactDrawer(false)}
        onSuccess={() => {
          // Refresh threads after contact creation
          if (onContactCreated) {
            onContactCreated()
          }
          setShowNewContactDrawer(false)
        }}
        selectedUser={selectedUser}
      />
    </div>
  );
}

export default ThreadsList
