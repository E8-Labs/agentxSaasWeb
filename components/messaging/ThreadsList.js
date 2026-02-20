import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { Search, MoreVertical, Trash, UserPlus, MessageSquare, Mail, ChevronDown, Loader2, MessageSquareDot } from 'lucide-react'
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
        onFilterToggle?.(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showFilterPopover, onFilterToggle])

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



  const renderFilterOption = (option, isAll = false) => {
    const isSelected = isAll ? isAllSelected : selectedTeamMemberIds.includes(option.id)
    const nameInitial = option.name?.charAt(0)?.toUpperCase() || '?'
    const displayInitial = isAll ? 'All' : nameInitial


    return (
      <button
        key={isAll ? 'all-members' : option.id}
        onClick={() => onSelectTeamMember?.(isAll ? null : option.id)}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold text-sm">
          {displayInitial}
        </div>
        <span className="flex-1 text-sm text-gray-900">{isAll ? 'All Members' : option.name}</span>
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
    <div className={`w-80 border-r px-3 border-gray-200 flex flex-col ${selectedUser && !agencyUser ? 'h-[70vh]' : 'h-[90vh]'} bg-white`}>
      <div className="w-full flex flex-row items-center justify-between mt-4">

        {/* Toggle Buttons - All / Unreplied */}
        <ToggleGroupCN
          options={[
            { label: 'All', value: 'all', count: allCount },
            { label: 'UnReplied', value: 'unreplied', count: unrepliedCount },
          ]}
          value={filterType}
          onChange={onFilterTypeChange}
        />
        <DropdownCn
          label="New"
          options={[
            {
              label: 'New Contact',
              value: 'contact',
              icon: UserPlus,
              onSelect: () => setShowNewContactDrawer(true),
            },
            {
              label: 'New Text',
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
              label: 'New Email',
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

      <div className="relative flex items-center gap-2 mt-4">
        <div className="relative flex-1 ">
          <Input
            type="text"
            placeholder="Search"
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white"
          />
          {searchLoading ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" size={18} />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          )}
        </div>

        <div className="relative">
          <button
            ref={filterButtonRef}
            onClick={() => onFilterToggle?.(!showFilterPopover)}
            className="relative p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Image src="/messaging/filterIcon.svg" width={24} height={24} alt="Filter" />
            {hasActiveFilters && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-primary border-2 border-white" />
            )}
          </button>
          {showFilterPopover && (
            <div
              ref={filterPopoverRef}
              className="absolute right-0 top-12 z-30 w-64 bg-white rounded-2xl shadow-xl border border-gray-200"
            >
              <div className="px-4 pt-3 pb-2 text-sm font-semibold text-gray-600">Filter by</div>
              <div className="flex flex-col max-h-64 overflow-y-auto pb-2">
                {renderFilterOption({}, true)}
                {filterTeamMembers.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-gray-500">No team members available</div>
                ) : (
                  filterTeamMembers.map((member) => renderFilterOption(member, false))
                )}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onClearFilter?.()
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
                <Button
                  size="sm"
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white"
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
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
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
            <div className="">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => onSelectThread(thread)}
                  className={cn(
                    "relative py-4 cursor-pointer border-b border-gray-100 last:border-b-0 rounded-lg  my-1",
                    selectedThread?.id === thread.id
                      ? 'bg-thread-selected'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-3 ">
                    <div className="relative flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-black font-bold text-xs">
                        {getLeadName(thread)}
                      </div>
                      {(() => {
                        const sourceType = thread.threadType || getRecentMessageType(thread)
                        if (sourceType === 'email' || sourceType === 'messenger' || sourceType === 'instagram' || sourceType === 'sms') {
                          return <PlatformIcon type={sourceType} size={10} showInBadge />
                        }
                        return (
                          <div className="absolute bottom-0 right-0 translate-y-1/2 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                            <Image
                              src="/messaging/text type message icon.svg"
                              width={10}
                              height={10}
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <TypographyBody className="font-semibold text-black truncate">
                          {getThreadDisplayName ? getThreadDisplayName(thread) : (thread.lead?.firstName || thread.lead?.name || 'Unknown Lead')}
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
                      {thread.lead?.pipelineStage?.stageTitle && (
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 mt-1 border border-gray-200 rounded-md">
                          <TypographyCaption className="text-darkGray font-semibold">
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
