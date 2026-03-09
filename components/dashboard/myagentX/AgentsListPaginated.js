import { Box, Modal, Popover } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { AlertTriangle, Calendar, Hourglass, MessageCircleMore, Zap } from 'lucide-react'
import moment from 'moment'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

import { UserTypes } from '@/constants/UserTypes'
import {
  formatPhoneNumber,
  getAgentImage,
  getAgentProfileImage,
  getAgentsListImage,
} from '@/utilities/agentUtilities'
import { getTetradicHslFromPrimary } from '@/utilities/colorUtils'

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
    // console.log(`Old agenst list length is ${agentsListSeparatedParam.length}`);
    getAgents(true, search)
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
          <div className="flex flex-col gap-3 px-10 w-[98%] max-w-[1028px] m-auto">
            {agentsListSeparated.map((item, index) => {
              const tetradic = getTetradicHslFromPrimary()
              const primary = tetradic[0]
              /* Primary-dominant comet: primary 0–19% (half), tetradic accents, then fade to white */
              const gradient = `conic-gradient(from 0deg, hsl(${primary}) 0%, hsl(${primary}) 19%, hsl(${tetradic[1]}) 21%, hsl(${tetradic[2]}) 23%, hsl(${tetradic[3]}) 25%, hsl(${primary} / 0.7) 27%, hsl(${primary} / 0.4) 31%, hsl(${primary} / 0.15) 36%, white 41%, white 100%)`
              return (
              <div
                key={index}
                className="group agent-card-glowing-shadow w-full max-w-[1028px] mx-auto p-3 flex flex-col gap-3 items-start relative overflow-hidden transition-shadow duration-200 hover:border-[#eaeaea]"
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
                <div className="relative z-10 w-full flex flex-col gap-3 items-start">
                <div className="w-full flex flex-row items-start justify-between h-full min-h-0 flex-1">
                  <div className="flex flex-row gap-5 items-center flex-1 min-w-0">
                    <div className="flex flex-row items-center justify-center w-[100px] h-[100px] bg-white rounded-[12px]">
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

                          getAgentsListImage(item, 72, 72,from ="agentsList")
                      )}
                      <input
                        type="file"
                        value={''}
                        accept="image/*"
                        ref={(el) => (fileInputRef.current[index] = el)}
                        onChange={(e) => handleProfileImgChange(e, index)}
                        style={{ display: 'none' }}
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex flex-col gap-1 items-start w-full">
                        <div className="flex flex-row items-center gap-2">
                          <button onClick={() => handleShowDrawer(item)}>
                            <div
                              style={{
                                fontSize: 24,
                                fontWeight: '600',
                                color: '#000',
                              }}
                            >
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
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 400,
                            color: '#00000080',
                          }}
                          className="flex flex-row items-center gap-1"
                        >
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
                      <div
                        className="flex flex-row gap-3 items-center"
                        style={{
                          fontSize: 14,
                          fontWeight: 400,
                          color: 'rgba(0,0,0,0.8)',
                          textDecoration: 'underline',
                          textDecorationStyle: 'dotted',
                          textDecorationColor: 'rgba(0,0,0,0.4)',
                        }}
                      >
                        <button
                          onClick={() => {
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
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-start gap-2 self-end text-right h-full min-h-[100px] pt-2">
                    <div className="relative inline-block">
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
                    {!item.phoneNumber && (
                      <div className="flex flex-row items-center gap-2 w-full">
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
                              fontSize: 12,
                              fontWeight: '600',
                            }}
                          >
                            No phone number assigned
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="w-full bg-white px-4 py-3 rounded-lg text-sm"
                  style={{ boxShadow: '0 4.2px 30px rgba(0, 0, 0, 0.06)' }}
                >
                  <div className="w-full flex flex-row items-start justify-between gap-3">
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
                      className="flex-1 min-w-0 flex flex-col items-start gap-2 cursor-pointer hover:opacity-80 hover:bg-black/[0.02] transition-opacity text-left border border-black/[0.02] bg-transparent p-3 w-full rounded-none"
                      style={{ minWidth: 0 }}
                    >
                      <AgentInfoCard
                        name="Calls"
                        value={<div>{item.calls || '-'}</div>}
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
                      className="flex-1 min-w-0 flex flex-col items-start gap-2 cursor-pointer hover:opacity-80 hover:bg-black/[0.02] transition-opacity text-left border border-black/[0.02] bg-transparent p-3 w-full rounded-none"
                      style={{ minWidth: 0 }}
                    >
                      <AgentInfoCard
                        name="Convos"
                        value={<div>{item.callsGt10 || '-'}</div>}
                        iconComponent={<MessageCircleMore size={18} />}
                        iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                        iconColor="text-brand-primary"
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
                      className="flex-1 min-w-0 flex flex-col items-start gap-2 cursor-pointer hover:opacity-80 hover:bg-black/[0.02] transition-opacity text-left border border-black/[0.02] bg-transparent p-3 w-full rounded-none"
                      style={{ minWidth: 0 }}
                    >
                      <AgentInfoCard
                        name="Hot Leads"
                        value={item.hotleads || '-'}
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
                          type: 'booked',
                          agentName: item.name || '',
                        })
                        setImportantCallsModalOpen(true)
                      }}
                      className="flex-1 min-w-0 flex flex-col items-start gap-2 cursor-pointer hover:opacity-80 hover:bg-black/[0.02] transition-opacity text-left border border-black/[0.02] bg-transparent p-3 w-full rounded-none"
                      style={{ minWidth: 0 }}
                    >
                      <AgentInfoCard
                        name="Booked Meetings"
                        value={item.booked || '-'}
                        iconComponent={<Calendar size={18} />}
                        iconWrapperClassName="w-10 h-10 rounded-[8px] bg-brand-primary/[0.08]"
                        iconColor="text-brand-primary"
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
                    <div className="flex-1 min-w-0 flex flex-col items-start gap-2 p-3 w-full">
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
                        bgColor="green"
                        iconColor="text-orange-500"
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
  return (
    <Modal
      open={ShowWarningModal}
      onClose={() => {
        setShowWarningModal(null)
      }}
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: '#00000020',
          // //backdropFilter: "blur(20px)",
        },
      }}
    >
      <Box
        className="w-10/12 sm:w-7/12 md:w-5/12 lg:w-3/12 p-8 rounded-[15px]"
        sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
      >
        <div style={{ width: '100%' }}>
          <div
            className="max-h-[60vh] overflow-auto"
            style={{ scrollbarWidth: 'none' }}
          >
            <div
              className="flex flex-row items-center justify-center gap-2 -mt-1 p-4 rounded-lg border border-red bg-red/10"
            >
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
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  No phone number assigned
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4 mt-6">
            <button
              className="w-5/12 flex items-center justify-center h-[50px] rounded-lg bg-muted px-3 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors duration-150 active:scale-[0.98] outline-none"
              onClick={() => {
                setShowWarningModal(null)
              }}
            >
              Close
            </button>
            <button
              className="w-7/12 flex items-center justify-center h-[50px] rounded-lg bg-brand-primary text-white px-3 text-sm font-medium hover:opacity-90 transition-colors duration-150 active:scale-[0.98] outline-none"
              onClick={() => {
                setShowDrawerSelectedAgent(ShowWarningModal)
                setShowWarningModal(null)
              }}
            >
              Assign Number
            </button>
          </div>
        </div>
      </Box>
    </Modal>
  )
}
