import { Box, Fade, Menu, MenuItem, Modal, Popover } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { AlertTriangle, Calendar, ChevronDown, Hourglass, MessageCircleMore, Trash, X, Zap } from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { UserTypes } from '@/constants/UserTypes'
import { toast } from '@/utils/toast'
import {
  formatPhoneNumber,
  getAgentImage,
  getAgentProfileImage,
  getAgentsListImage,
} from '@/utilities/agentUtilities'
import { getTetradicHslFromPrimary } from '@/utilities/colorUtils'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import ImportantCallsModal from '@/components/modals/ImportantCallsModal'
import AgentInfoCard from './AgentInfoCard'
import AgentStatsCallsModal from './AgentStatsCallsModal'
import NoAgent from './NoAgent'

// ...other necessary imports

const styles = {
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-50%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}

const AgentsListPaginated = ({
  agentsListSeparatedParam,
  selectedImagesParam,
  search,
  user,
  getAgents,
  setObjective,
  setOldObjective,
  setGreetingTagInput,
  setOldGreetingTagInput,
  setScriptTagInput,
  setOldScriptTagInput,
  setShowScriptModal,
  matchingAgent,
  setShowScript,
  handleShowDrawer,
  handleProfileImgChange,
  setShowRenameAgentPopup,
  setSelectedRenameAgent,
  setRenameAgent,
  // ShowWarningModal,
  // setShowWarningModal,
  setOpenTestAiModal,
  mainAgentsList,
  setScriptKeys,
  setSelectedAgent,
  setShowClaimPopup,
  keys,
  paginationLoader,
  setShowDrawerSelectedAgent,
  //for stopping pagination loader
  canGetMore = true,
  from = 'user',
  agencyUser,
  initialLoader,
  selectedUser,
  scrollableTarget = 'scrollableAgentDiv',
  uniqueTags = [],
  onAssignTag,
  onUnassignTag,
  onDeleteTag,
  selectedTags = [],
}) => {
  // console.log("Agents in paginated list ", agentsListSeparatedParam);
  const [agentsListSeparated, setAgentsListSeparated] = useState(
    agentsListSeparatedParam,
  )
  const [hasMoreAgents, setHasMoreAgents] = useState(false)
  const [selectedImages, setSelectedImages] = useState(selectedImagesParam)
  const fileInputRef = useRef([])

  const [ShowWarningModal, setShowWarningModal] = useState(null)

  const [statsModalOpen, setStatsModalOpen] = useState(false)
  const [statsModalAgentId, setStatsModalAgentId] = useState(null)
  const [statsModalType, setStatsModalType] = useState(null)
  const [statsModalAgentName, setStatsModalAgentName] = useState('')
  const [importantCallsModalOpen, setImportantCallsModalOpen] = useState(false)
  const [importantCallsModalContext, setImportantCallsModalContext] = useState(null)

  const [actionInfoEl, setActionInfoEl] = useState(null)
  const [hoveredIndexStatus, setHoveredIndexStatus] = useState(null)
  const [hoveredIndexAddress, setHoveredIndexAddress] = useState(null)
  const [hoveredAvatarIndex, setHoveredAvatarIndex] = useState(null)
  const [assignTagAnchor, setAssignTagAnchor] = useState(null)
  const [assignTagAgent, setAssignTagAgent] = useState(null)
  const [assignTagInput, setAssignTagInput] = useState('')

  const open = Boolean(actionInfoEl)

  useEffect(() => {
    setAgentsListSeparated(agentsListSeparatedParam)
  }, [agentsListSeparatedParam])

  useEffect(() => {
    if (canGetMore === true) {
      setHasMoreAgents(true)
    } else if (canGetMore === false) {
      setHasMoreAgents(false)
    }
  }, [canGetMore])

  // Function to render icon with branding using mask-image (same logic as NotificationsDrawer.js)
  const renderBrandedIcon = (iconPath, width, height) => {
    if (typeof window === 'undefined') {
      return <Image src={iconPath} width={width} height={height} alt="*" />
    }

    // Get brand color from CSS variable
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()

    // Only apply branding if brand color is set and valid (indicates custom domain with branding)
    if (!brandColor || brandColor === '' || brandColor.length < 3) {
      return <Image src={iconPath} width={width} height={height} alt="*" />
    }

    // Use mask-image approach: background color with icon as mask
    return (
      <div
        style={{
          width: width,
          height: height,
          minWidth: width,
          minHeight: height,
          backgroundColor: `hsl(${brandColor})`,
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

  const formatName = (item) => {
    let agentName = null

    if (item?.name?.length > 15) {
      agentName = item?.name?.slice(0, 15) + '...'
    } else {
      agentName = item?.name
    }
    return (
      <div>
        {agentName?.slice(0, 1).toUpperCase(0)}
        {agentName?.slice(1)}
      </div>
    )
  }
  const fetchMoreAgents = async () => {
    getAgents(true, search, undefined, selectedTags)
  }

  const handlePopoverOpen = (event, item) => {
    ////// //console.log;
    setActionInfoEl(event.currentTarget)
    setHoveredIndexStatus(item.status)
    setHoveredIndexAddress(item.address)
  }

  const handlePopoverClose = () => {
    setActionInfoEl(null)
    setHoveredIndexStatus(null)
    setHoveredIndexAddress(null)
  }

  const usePageScroll = scrollableTarget !== 'scrollableAgentDiv'
  return (
    <div
      className={`w-full ${usePageScroll ? 'min-h-0 h-auto' : `${agencyUser ? 'h-[70vh]' : from === 'Admin' || from === 'agency' ? 'h-[62svh]' : agentsListSeparated.length > 0 ? 'h-[75svh]' : 'h-[90svh]'} overflow-auto`} ${!initialLoader && agentsListSeparated.length > 0 && 'pt-2'} ${agencyUser ? '' : from === 'Admin' || from === 'agency' ? '' : 'pb-12'}`}
      style={usePageScroll ? {} : { scrollbarWidth: 'none' }}
      id="scrollableAgentDiv"
    >
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
          // marginBottom: "20px"
        }}
        open={open}
        anchorEl={actionInfoEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            width: 'fit-content',
            border: 'none',
            // border: "1px solid #15151520",
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
            // transition: "box-shadow 0.3s ease-in-out", // Smooth transition for shadow
          },
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <div className="p-3 min-w-[250px]">
          <div className="flex flex-row items-center justify-between gap-1">
            <p
              style={{
                fontSize: 15,
                fontWeight: '500',

                color: '#00000060',
              }}
            >
              Status
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: '500',
              }}
            >
              {hoveredIndexStatus ? hoveredIndexStatus : '-'}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between mt-1 gap-1">
            <p
              style={{
                fontSize: 15,
                fontWeight: '500',

                color: '#00000060',
              }}
            >
              Address
            </p>
            <div
              style={{
                fontSize: 15,
                fontWeight: '500',
              }}
            >
              {hoveredIndexAddress ? (
                <div>
                  {hoveredIndexAddress.length > 15
                    ? hoveredIndexAddress.slice(0, 15) + '...'
                    : hoveredIndexAddress}
                </div>
              ) : (
                '-'
              )}
            </div>
          </div>
        </div>
      </Popover>
      <Menu
        anchorEl={assignTagAnchor}
        open={Boolean(assignTagAnchor)}
        onClose={() => {
          setAssignTagAnchor(null)
          setAssignTagAgent(null)
          setAssignTagInput('')
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 220,
              maxHeight: 320,
              borderRadius: 2,
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              border: 'none',
              '& .MuiList-root': { py: 0.5 },
              '& .MuiMenuItem-root': {
                minHeight: '37px !important',
                height: 'auto !important',
                paddingTop: '8px !important',
                paddingBottom: '8px !important',
                marginBottom: '6px !important',
              },
              '& .MuiMenuItem-root:last-of-type': { marginBottom: 0 },
            },
          },
        }}
      >
        <Box sx={{ pt: 1.5, pb: 1 }}>
          <input
            type="text"
            value={assignTagInput}
            onChange={(e) => setAssignTagInput(e.target.value)}
            onKeyDown={(e) => {
              // Prevent Menu from stealing key events (e.g. typing "F" focusing "Feby")
              if (e.key.length === 1) {
                e.stopPropagation()
              }
              if (e.key === 'Enter' && assignTagInput.trim()) {
                e.preventDefault()
                e.stopPropagation()
                if (!assignTagAgent?.mainAgentId || !onAssignTag) return
                const currentTags = assignTagAgent.tags || []
                const tagToAdd = assignTagInput.trim()
                const isDuplicate = currentTags.some(
                  (t) => t.trim().toLowerCase() === tagToAdd.toLowerCase()
                )
                if (isDuplicate) {
                  toast.warning('This tag is already assigned to the agent')
                  return
                }
                onAssignTag(assignTagAgent.mainAgentId, [...currentTags, tagToAdd])
                setAssignTagAnchor(null)
                setAssignTagAgent(null)
                setAssignTagInput('')
              }
            }}
            placeholder="Search or add"
            className="w-full outline-none rounded-lg px-2.5 py-2 text-sm font-medium text-[#111827] placeholder:text-[#6B7280] bg-white"
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: 8,
            }}
          />
        </Box>
        {(() => {
          const search = assignTagInput.trim().toLowerCase()
          const filteredTags = search
            ? uniqueTags.filter((tag) => tag.toLowerCase().includes(search))
            : uniqueTags
          if (filteredTags.length === 0) {
            return (
              <Box sx={{ px: 2, py: 1.5 }}>
                <span style={{ fontSize: 14, color: '#6B7280' }}>
                  {assignTagInput.trim() ? 'No matching tag' : 'No tag found...'}
                </span>
              </Box>
            )
          }
          return filteredTags.map((tagLabel) => {
          const currentTags = assignTagAgent?.tags || []
          const isSelected = currentTags.includes(tagLabel)
          return (
            <MenuItem
              key={tagLabel}
              dense
              disableGutters
              onClick={() => {
                if (!assignTagAgent?.mainAgentId) return
                if (isSelected && onUnassignTag) {
                  onUnassignTag(assignTagAgent.mainAgentId, tagLabel)
                } else if (!isSelected && onAssignTag) {
                  onAssignTag(assignTagAgent.mainAgentId, [...currentTags, tagLabel])
                }
                setAssignTagAnchor(null)
                setAssignTagAgent(null)
                setAssignTagInput('')
              }}
              sx={{
                fontSize: 14,
                minHeight: 37,
                height: 'auto',
                py: 0.75,
                px: 1.5,
                marginBottom: 6,
                '&:last-of-type': { marginBottom: 0 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                ...(isSelected && {
                  backgroundColor: 'hsl(var(--brand-primary) / 0.06)',
                  color: 'hsl(var(--brand-primary))',
                  '&:hover': {
                    backgroundColor: 'hsl(var(--brand-primary) / 0.12)',
                  },
                }),
                '& .assign-tag-del-btn': {
                  opacity: 0,
                  transition: 'opacity 0.15s ease',
                },
                '&:hover .assign-tag-del-btn': {
                  opacity: 1,
                },
                '& .assign-tag-del-btn:hover': {
                  backgroundColor: 'rgba(0,0,0,0.08)',
                },
              }}
            >
              <span>{tagLabel}</span>
              {onDeleteTag && (
                <button
                  type="button"
                  className="assign-tag-del-btn"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDeleteTag(tagLabel)
                    setAssignTagAnchor(null)
                    setAssignTagAgent(null)
                    setAssignTagInput('')
                  }}
                  aria-label={`Delete tag ${tagLabel} permanently from all agents`}
                  title="Delete tag from all agents"
                  style={{
                    minWidth: 20,
                    height: 20,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                  }}
                >
                  <Trash size={14} strokeWidth={2.5} />
                </button>
              )}
            </MenuItem>
          )
        })
        })()}
      </Menu>
      <WarningModal
        ShowWarningModal={ShowWarningModal}
        setShowWarningModal={setShowWarningModal}
        setShowDrawerSelectedAgent={setShowDrawerSelectedAgent}
      />
      {!initialLoader && agentsListSeparated.length > 0 ? (
        <InfiniteScroll
          dataLength={agentsListSeparated.length}
          next={fetchMoreAgents}
          hasMore={hasMoreAgents}
          scrollableTarget={scrollableTarget}
          loader={
            <div className="w-full flex justify-center mt-4">
              {paginationLoader ? (
                <CircularProgress size={30} sx={{ color: '#7902DF' }} />
              ) : (
                <p
                  style={{
                    textAlign: 'center',
                    paddingTop: '10px',
                    fontWeight: '400',
                    fontFamily: 'inter',
                    fontSize: 16,
                    color: '#00000060',
                  }}
                >
                  {`You're all caught up`}
                </p>
              )}
            </div>
          }
          endMessage={
            <p
              style={{
                textAlign: 'center',
                paddingTop: '10px',
                fontWeight: '400',
                fontFamily: 'inter',
                fontSize: 16,
                color: '#00000060',
              }}
            >
              {`You're all caught up`}
            </p>
          }
          style={{ overflow: 'unset' }}
        >
          <div className="flex flex-col gap-3 px-4 sm:px-6 w-[98%] max-w-[1028px] m-auto">
            {agentsListSeparated.map((item, index) => {
              const tetradic = getTetradicHslFromPrimary()
              const primary = tetradic[0]
              const gradient = `conic-gradient(from 0deg, hsl(${primary}) 0%, hsl(${primary}) 20%, hsl(${primary} / 0.7) 28%, hsl(${primary} / 0.4) 34%, hsl(${primary} / 0.15) 40%, white 46%, white 100%)`
              return (
                <div
                  key={index}
                  className="group agent-card-glowing-shadow w-full max-w-[1028px] mx-auto p-4 flex flex-col gap-2 items-start relative overflow-hidden transition-shadow duration-200 hover:border-[#eaeaea]"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                  }}
                >
                  {/* Animated gradient border (hover-only, comet + blur) */}
                  <div
                    className="absolute inset-0 rounded-[12px] pointer-events-none opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-hover:[animation-play-state:running] [animation-play-state:paused]"
                    style={{ zIndex: 0 }}
                    aria-hidden
                  >
                    <div
                      className="absolute inset-0 rounded-[12px] animate-border-spin"
                      style={{
                        background: gradient,
                        filter: 'blur(5px)',
                      }}
                    />
                    <div
                      className="absolute rounded-[10px] bg-white"
                      style={{ inset: 2 }}
                    />
                  </div>
                  <div className="relative z-10 w-full flex flex-col gap-2 items-start">
                    <div className="w-full flex flex-row items-start justify-between h-full min-h-0 flex-1">
                      <div className="flex flex-row gap-4 items-center flex-1 min-w-0">
                        <div className="flex items-center justify-center w-[100px] h-[100px] rounded-[16px] shrink-0" style={{ backgroundColor: 'hsl(var(--brand-primary) / 0.02)' }}>
                          <div
                            role="button"
                            tabIndex={0}
                            onMouseEnter={() => setHoveredAvatarIndex(index)}
                            onMouseLeave={() => setHoveredAvatarIndex(null)}
                            className="transition-all duration-300 ease-out cursor-default"
                          >
                            <div
                              className="flex flex-row items-center justify-center w-[100px] h-[100px] overflow-hidden relative"
                              style={{
                                border: '3px solid white',
                                boxShadow: '0 16px 30px rgba(0, 0, 0, 0.055)',
                                backdropFilter: 'blur(8px)',
                                backgroundColor: 'transparent',
                                borderRadius: 16,
                              }}
                            >
                              <div
                                className="absolute left-1/2 z-0 w-[50px] h-[50px] rounded-full bg-brand-primary -translate-x-1/2"
                                style={{
                                  top: '-25px',
                                  filter: `blur(${hoveredAvatarIndex === index ? 38 : 30}px)`,
                                  opacity: hoveredAvatarIndex === index ? 0.88 : 0.75,
                                  transition: 'filter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out',
                                }}
                                aria-hidden
                              />
                              <div className="relative z-10 flex flex-row items-center justify-center bg-transparent w-auto h-auto">
                                {selectedImages[index] ? (
                                  <Image
                                    src={selectedImages[index]}
                                    height={72}
                                    width={72}
                                    alt="Profile"
                                    style={{
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      height: '72px',
                                      width: '72px',
                                    }}
                                  />
                                ) : (
                                  getAgentsListImage(item, 72, 72, from = "agentsList")
                                )}
                              </div>
                              <input
                                type="file"
                                value={''}
                                accept="image/*"
                                ref={(el) => (fileInputRef.current[index] = el)}
                                onChange={(e) => handleProfileImgChange(e, index)}
                                style={{ display: 'none' }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex flex-col gap-1 items-start w-full">
                            <div className="flex flex-row items-center gap-2">
                              <button onClick={() => handleShowDrawer(item)}>
                                <div className="text-2xl font-semibold leading-tight text-foreground">
                                  {formatName(item)}
                                </div>
                              </button>
                              <div className="opacity-0 group-hover:opacity-100 scale-[0.8] group-hover:scale-100 transition-all duration-200 ease-out origin-left">
                                <button
                                  onClick={() => {
                                    setShowRenameAgentPopup(true)
                                    setSelectedRenameAgent(item)
                                    setRenameAgent(item.name)
                                  }}
                                >
                                  {renderBrandedIcon('/svgIcons/editPen.svg', 20, 20)}
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-row items-center gap-1 text-sm font-medium text-black/60">
                              <div
                                aria-owns={open ? 'mouse-over-popover' : undefined}
                                aria-haspopup="true"
                                onMouseEnter={(event) => {
                                  if (item.agentObjectiveId === 3) {
                                    handlePopoverOpen(event, item)
                                  }
                                }}
                                onMouseLeave={handlePopoverClose}
                                style={{ cursor: 'pointer' }}
                              >
                                {user.user.userType == UserTypes.RealEstateAgent
                                  ? `${item.agentObjective
                                    ?.slice(0, 1)
                                    .toUpperCase()}${item.agentObjective?.slice(
                                      1,
                                    )}`
                                  : `${item.agentRole}`}
                              </div>
                              <div>
                                | {item.agentType?.slice(0, 1).toUpperCase()}
                                {item.agentType?.slice(1)}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row items-center gap-3 text-xs font-medium text-[#666666] underline decoration-dotted decoration-[#666666]/60 underline-offset-[3px]">
                            <button
                              onClick={() => {
                                console.log("item on click.kj is", item?.prompt);
                                setGreetingTagInput(item?.prompt?.greeting)
                                setOldGreetingTagInput(item?.prompt?.greeting)
                                setScriptTagInput(item?.prompt?.callScript)
                                setOldScriptTagInput(item?.prompt?.callScript)
                                setShowScriptModal(item)
                                matchingAgent(item)
                                setShowScript(true)
                                if (item?.prompt?.objective) {
                                  setObjective(item?.prompt?.objective)
                                  setOldObjective(item?.prompt?.objective)
                                }
                              }}
                            >
                              <div>View Script</div>
                            </button>
                            <div>|</div>
                            <button
                              onClick={() => {
                                handleShowDrawer(item)
                              }}
                            >
                              <div>More info</div>
                            </button>
                            {onAssignTag && (
                              <>
                                <div>|</div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    setAssignTagAnchor(e.currentTarget)
                                    setAssignTagAgent(item)
                                    setAssignTagInput('')
                                  }}
                                  className="flex items-center gap-0.5 text-xs font-medium text-[#666666] underline decoration-dotted decoration-[#666666]/60 underline-offset-[3px] hover:opacity-90"
                                >
                                  {item.tags && item.tags.length > 0 ? (
                                    <div className="flex flex-row items-center gap-2 w-full min-w-0 overflow-x-auto overflow-y-hidden scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-gray-300 flex-nowrap" style={{ scrollbarWidth: 'thin' }}>
                                      {item.tags.slice(0, 3).map((tagLabel, index) => (
                                        <button
                                          key={`${tagLabel}-${index}`}
                                          type="button"
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            // if (onUnassignTag && item.mainAgentId) {
                                            //   onUnassignTag(item.mainAgentId, tagLabel)
                                            // }
                                          }}
                                          className="px-2 py-0.5 rounded-md text-xs font-medium bg-black/6 hover:bg-black/10 transition-colors"
                                          title="Click to unassign this tag"
                                        >
                                          {tagLabel}
                                        </button>
                                      ))}
                                      {item.tags.length > 3 && (
                                        <div className="text-xs font-medium text-[#666666]">
                                          +{item.tags.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    "Assign Tag"
                                  )}
                                  <ChevronDown size={14} className="shrink-0" strokeWidth={2.5} style={{ color: '#666666' }} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 self-stretch text-left pt-1">
                        <div className="flex flex-row items-center justify-end gap-2">
                          <div className={`relative inline-block ${!item.phoneNumber ? 'ml-auto' : ''}`}>
                            {!item.phoneNumber && (
                              <div
                                className="absolute -right-1 -top-2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-red-500"
                                aria-hidden
                              >
                                <AlertTriangle
                                  size={16}
                                  className="text-white"
                                />
                              </div>
                            )}
                            <button
                              className="bg-brand-primary px-4 py-2 rounded-lg text-white relative"
                              onClick={() => {
                                if (!item.phoneNumber) {
                                  setShowWarningModal(item)
                                } else {
                                  setOpenTestAiModal(true)
                                }

                                setSelectedAgent(item)
                                // Reset keys array for each agent to avoid accumulating variables from previous agents
                                keys = []
                                const callScript =
                                  item.prompt.callScript + ' ' + item.prompt.greeting
                                const regex = /\{(.*?)\}/g
                                let match
                                let mainAgent = null
                                mainAgentsList.map((ma) => {
                                  if (ma.agents?.length > 0) {
                                    if (ma.agents[0].id == item.id) {
                                      mainAgent = ma
                                    } else if (ma.agents?.length >= 2) {
                                      if (ma.agents[1].id == item.id) {
                                        mainAgent = ma
                                      }
                                    }
                                  }
                                })
                                let kyc = (mainAgent?.kyc || []).map(
                                  (kyc) => kyc.question,
                                )
                                while ((match = regex.exec(callScript)) !== null) {
                                  const defaultVariables = [
                                    'Full Name',
                                    'First Name',
                                    'Last Name',
                                    'firstName',
                                    'seller_kyc',
                                    'buyer_kyc',
                                    'CU_address',
                                    'CU_status',
                                  ]
                                  // Remove the length restriction to allow longer variable names like "Appointment Date" and "Appointment Time"
                                  if (
                                    !defaultVariables.includes(match[1]) &&
                                    match[1]?.trim().length > 0
                                  ) {
                                    if (
                                      !keys.includes(match[1]) &&
                                      !kyc.includes(match[1])
                                    ) {
                                      keys.push(match[1])
                                    }
                                  }
                                }
                                setScriptKeys(keys)
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: '600',
                                  color: '#fff',
                                }}
                              >
                                Test AI
                              </div>
                            </button>
                          </div>
                        </div>

                        {!item.phoneNumber && (
                          <div
                            className="flex flex-row items-center justify-between gap-2 w-full py-2 px-3 rounded-lg"
                            style={{
                              backgroundColor: 'rgba(255, 78, 78, 0.02)',
                              border: '2px solid rgba(255, 78, 78, 0.6)',
                            }}
                          >
                            <div className="flex flex-row items-center gap-2">
                              <Image
                                src={'/assets/warningFill.png'}
                                height={18}
                                width={18}
                                alt="*"
                              />
                              <p>
                                <span
                                  className="text-red"
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 400,
                                    opacity: 1,
                                  }}
                                >
                                  No phone number assigned
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="w-full bg-white p-3 rounded-lg text-sm"
                      style={{ boxShadow: '0 4.2px 30px rgba(0, 0, 0, 0.06)' }}
                    >
                      <div className="w-full flex flex-row items-start justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setImportantCallsModalContext({
                              agentId: item.id,
                              type: 'calls',
                              agentName: item.name || '',
                            })
                            setImportantCallsModalOpen(true)
                          }}
                          className="flex-1 min-w-0 flex flex-col items-start gap-1.5 cursor-pointer hover:opacity-80 hover:bg-black/[0.02] transition-opacity text-left border border-black/[0.02] bg-transparent p-2 w-full rounded-none"
                          style={{ minWidth: 0 }}
                        >
                          <AgentInfoCard
                            name="Calls"
                            value={<div>{item?.calls ? item.calls : '-'}</div>}
                            iconComponent={<Zap size={18} />}
                            iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                            iconColor="text-brand-primary"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImportantCallsModalContext({
                              agentId: item.id,
                              type: 'convos',
                              agentName: item.name || '',
                            })
                            setImportantCallsModalOpen(true)
                          }}
                          className="flex-1 min-w-0 flex flex-col items-start gap-1.5 cursor-pointer hover:opacity-80 hover:bg-black/[0.02] transition-opacity text-left border border-black/[0.02] bg-transparent p-2 w-full rounded-none"
                          style={{ minWidth: 0 }}
                        >
                          <AgentInfoCard
                            name="Convos"
                            value={<div>{item?.callsGt10 ? item.callsGt10 : '-'}</div>}
                            iconComponent={<MessageCircleMore size={18} />}
                            iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                            iconColor="text-brand-primary"
                            subtitle="Answer rate"
                            toolTip="Answer rate, percent of calls that are answered."
                            rate={
                              item.calls > 0
                                ? (item.callsGt10 / item.calls) * 100
                                : null
                            }
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImportantCallsModalContext({
                              agentId: item.id,
                              type: 'hotleads',
                              agentName: item.name || '',
                            })
                            setImportantCallsModalOpen(true)
                          }}
                          className="flex-1 min-w-0 flex flex-col items-start gap-1.5 cursor-pointer hover:opacity-80 hover:bg-black/[0.02] transition-opacity text-left border border-black/[0.02] bg-transparent p-2 w-full rounded-none"
                          style={{ minWidth: 0 }}
                        >
                          <AgentInfoCard
                            name="Hot Leads"
                            value={item?.hotleads ? item.hotleads : '-'}
                            iconComponent={<Zap size={18} />}
                            iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                            iconColor="text-brand-primary"
                            subtitle="Conversion rate"
                            toolTip="Percent of hot leads that are found in your calls."
                            rate={
                              item.callsGt10 > 0
                                ? (item.hotleads / item.callsGt10) * 100
                                : null
                            }
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImportantCallsModalContext({
                              agentId: item.id,
                              type: 'booked',
                              agentName: item.name || '',
                            })
                            setImportantCallsModalOpen(true)
                          }}
                          className="flex-1 min-w-0 flex flex-col items-start gap-1.5 cursor-pointer hover:opacity-80 hover:bg-black/[0.02] transition-opacity text-left border border-black/[0.02] bg-transparent p-2 w-full rounded-none"
                          style={{ minWidth: 0 }}
                        >
                          <AgentInfoCard
                            name="Booked"
                            value={item?.booked ? item.booked : '-'}
                            iconComponent={<Calendar size={18} />}
                            iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                            iconColor="text-brand-primary"
                            subtitle="Conversion rate"
                            toolTip="Percent of convos that convert into a booked call."
                            rate={
                              item.callsGt10 > 0
                                ? (item.booked / item.callsGt10) * 100
                                : null
                            }
                          />
                        </button>
                        {/* <button
                      type="button"
                      onClick={() => {
                        setImportantCallsModalContext(null)
                        setImportantCallsModalOpen(true)
                      }}
                      className="flex flex-col items-start gap-2 cursor-pointer hover:opacity-80 transition-opacity text-left border-0 bg-transparent p-0"
                      style={{ minWidth: 0 }}
                    >
                      <AgentInfoCard
                        name="Important Calls"
                        value="-"
                        icon="/svgIcons/fireIcon.png"
                        bgColor="bg-orange-100"
                        iconColor="text-orange-500"
                      />
                    </button> */}
                        <div className="flex-1 min-w-0 flex flex-col items-start gap-1.5 p-2 w-full">
                          <AgentInfoCard
                            name="Time"
                            value={
                              <div>
                                {item?.totalDuration
                                  ? moment
                                    .utc((item?.totalDuration || 0) * 1000)
                                    .format('HH:mm:ss')
                                  : '-'}
                              </div>
                            }
                            iconComponent={<Hourglass size={18} />}
                            iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                            iconColor="text-brand-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      ) : (
        // <div> hello</div>
        (<NoAgent
          showBtn={search ? false : true}
          from={from}
          title={search ? 'No agent found' : 'You have no active agents'}
          selectedUser={selectedUser}
        />)
      )}
      <AgentStatsCallsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        agentId={statsModalAgentId}
        agentName={statsModalAgentName}
        type={statsModalType}
      />
      {importantCallsModalOpen && (
        <ImportantCallsModal
          open={importantCallsModalOpen}
          onClose={() => {
            setImportantCallsModalOpen(false)
            setImportantCallsModalContext(null)
          }}
          agentId={importantCallsModalContext?.agentId}
          type={importantCallsModalContext?.type}
          agentName={importantCallsModalContext?.agentName}
        />
      )}
    </div>
  );
}

export default AgentsListPaginated

export const WarningModal = ({
  ShowWarningModal,
  setShowWarningModal,
  setShowDrawerSelectedAgent,
}) => {
  const handleClose = () => setShowWarningModal(null)

  return (
    <Modal
      open={!!ShowWarningModal}
      onClose={handleClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 250,
        sx: { backgroundColor: '#00000099' },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Fade in={!!ShowWarningModal} timeout={250}>
        <Box
          className="flex w-[400px] max-w-[90vw] flex-col overflow-hidden rounded-[12px] bg-white"
          sx={{
            boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
            border: '1px solid #eaeaea',
            outline: 'none',
            '@keyframes modalEnter': {
              '0%': { transform: 'scale(0.95)' },
              '100%': { transform: 'scale(1)' },
            },
            animation: 'modalEnter 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* Header */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid #eaeaea' }}
          >
            <div className="flex flex-row items-center gap-2">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10"
                aria-hidden
              >
                <Image
                  src="/assets/warningFill.png"
                  height={16}
                  width={16}
                  alt=""
                  className="text-destructive"
                />
              </div>
              <span
                className="font-semibold"
                style={{ fontSize: 16, color: 'rgba(0,0,0,0.9)' }}
              >
                No phone number assigned
              </span>
            </div>
            <CloseBtn onClick={handleClose} />
          </div>

          {/* Body */}
          <div
            className="px-4 py-4"
            style={{ fontSize: 14, color: 'rgba(0,0,0,0.8)' }}
          >
            Assign a phone number to this agent to enable Test AI.
          </div>

          {/* Footer */}
          <div
            className="flex flex-row items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid #eaeaea' }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] outline-none"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDrawerSelectedAgent(ShowWarningModal)
                setShowWarningModal(null)
              }}
              className="flex h-[40px] items-center justify-center rounded-lg px-4 text-sm font-semibold bg-brand-primary text-white hover:opacity-90 transition-all duration-150 active:scale-[0.98] outline-none"
            >
              Assign Number
            </button>
          </div>
        </Box>
      </Fade>
    </Modal>
  )
}
