import { Box, Modal, Popover } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
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

import AgentInfoCard from './AgentInfoCard'
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
}) => {
  console.log('loader for more data ')

  console.log('agencyUser in agents list paginated', agencyUser)
  console.log('from in agents list paginated', from)
  // console.log("Agents in paginated list ", agentsListSeparatedParam);
  const [agentsListSeparated, setAgentsListSeparated] = useState(
    agentsListSeparatedParam,
  )
  const [hasMoreAgents, setHasMoreAgents] = useState(false)
  const [selectedImages, setSelectedImages] = useState(selectedImagesParam)
  const fileInputRef = useRef([])

  const [ShowWarningModal, setShowWarningModal] = useState(null)

  const [actionInfoEl, setActionInfoEl] = useState(null)
  const [hoveredIndexStatus, setHoveredIndexStatus] = useState(null)
  const [hoveredIndexAddress, setHoveredIndexAddress] = useState(null)

  const open = Boolean(actionInfoEl)

  // Example fetch function (replace with your actual API call)

  useEffect(() => {
    setAgentsListSeparated(agentsListSeparatedParam)
    console.log('agentsListSeperatedParam', agentsListSeparatedParam)
  }, [agentsListSeparatedParam])

  useEffect(() => {
    console.log('can get more status is', canGetMore)
    if (canGetMore === true) {
      setHasMoreAgents(true)
    } else if (canGetMore === false) {
      setHasMoreAgents(false)
    }
  }, [canGetMore])

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
    console.log('Fetch more agents please', search)
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

  return (
    <div
      className={`${agencyUser ? 'h-[70vh]' : from === 'Admin' || from === 'agency' ? 'h-[46svh]' : agentsListSeparated.length > 0 ? 'h-[75svh]' : 'h-[90svh]'} overflow-auto ${!initialLoader && agentsListSeparated.length > 0 && 'pt-10'} ${agencyUser ? '' : from === 'Admin' || from === 'agency' ? '' : 'pb-12'}`}
      style={{ scrollbarWidth: 'none' }}
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
          scrollableTarget="scrollableAgentDiv"
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
          <div className="flex flex-col gap-4 px-10">
            {agentsListSeparated.map((item, index) => (
              <div
                key={index}
                className="w-full px-10 py-2"
                style={{
                  borderWidth: 1,
                  borderColor: '#00000007',
                  backgroundColor: '#FBFCFF',
                  borderRadius: 20,
                }}
              >
                <div className="w-full flex flex-row items-center justify-between">
                  <div className="flex flex-row gap-5 items-center">
                    <div className="flex flex-row items-end">
                      {selectedImages[index] ? (
                        <Image
                          src={selectedImages[index]}
                          height={70}
                          width={70}
                          alt="Profile"
                          style={{
                            borderRadius: '50%',
                            objectFit: 'cover',
                            height: '60px',
                            width: '60px',
                          }}
                        />
                      ) : (
                        getAgentsListImage(item)
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
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-row gap-3 items-center">
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
                        <button
                          onClick={() => {
                            setShowRenameAgentPopup(true)
                            setSelectedRenameAgent(item)
                            setRenameAgent(item.name)
                          }}
                        >
                          <Image
                            src={'/svgIcons/editPen.svg'}
                            height={24}
                            width={24}
                            alt="*"
                          />
                        </button>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: '600',
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
                        className="flex flex-row gap-3 items-center text-brand-primary"
                        style={{ fontSize: 15, fontWeight: '500' }}
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
                            console.log('selected item is', item)
                          }}
                        >
                          <div>More info</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-start gap-8">
                    {!item.phoneNumber && (
                      <div className="flex flex-row items-center gap-2 -mt-1">
                        <Image
                          src={'/assets/warningFill.png'}
                          height={18}
                          width={18}
                          alt="*"
                        />
                        <p>
                          <i
                            className="text-red"
                            style={{
                              fontSize: 12,
                              fontWeight: '600',
                            }}
                          >
                            No phone number assigned
                          </i>
                        </p>
                      </div>
                    )}
                    <button
                      className="bg-brand-primary px-4 py-2 rounded-lg text-white"
                      onClick={() => {
                        console.log('Show test ai modal', item)
                        if (!item.phoneNumber) {
                          console.log('Show warning modal')
                          setShowWarningModal(item)
                        } else {
                          setOpenTestAiModal(true)
                        }

                        setSelectedAgent(item)
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
                          if (
                            !defaultVariables.includes(match[1]) &&
                            match[1]?.length < 15
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
                          fontSize: 16,
                          fontWeight: '600',
                          color: '#fff',
                        }}
                      >
                        Test AI
                      </div>
                    </button>
                  </div>
                </div>

                <div className="w-9.12 bg-white p-6 rounded-2xl mb-4 mt-5">
                  <div className="w-full flex flex-row items-center justify-between">
                    <AgentInfoCard
                      name="Calls"
                      value={<div>{item.calls || '-'}</div>}
                      icon="/svgIcons/selectedCallIcon.svg"
                      bgColor="bg-blue-100"
                      iconColor="text-blue-500"
                    />
                    <AgentInfoCard
                      name="Convos"
                      value={<div>{item.callsGt10 || '-'}</div>}
                      icon="/svgIcons/convosIcon2.svg"
                      bgColor="bg-brand-primary/10"
                      iconColor="text-brand-primary"
                    />
                    <AgentInfoCard
                      name="Hot Leads"
                      value={item.hotleads || '-'}
                      icon="/otherAssets/hotLeadsIcon2.png"
                      bgColor="bg-orange-100"
                      iconColor="text-orange-500"
                    />
                    <AgentInfoCard
                      name="Booked Meetings"
                      value={item.booked || '-'}
                      icon="/otherAssets/greenCalenderIcon.png"
                      bgColor="green"
                      iconColor="text-orange-500"
                    />
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
                      icon="/otherAssets/minsCounter.png"
                      bgColor="green"
                      iconColor="text-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        // <div> hello</div>
        <NoAgent
          showBtn={search ? false : true}
          from={from}
          title={search ? 'No agent found' : 'You have no active agents'}
          selectedUser={selectedUser}
        />
      )}
    </div>
  )
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
            <div className="flex flex-row items-center justify-center gap-2 -mt-1">
              <Image
                src={'/assets/warningFill.png'}
                height={18}
                width={18}
                alt="*"
              />
              <p>
                <i
                  className="text-red"
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  No phone number assigned
                </i>
              </p>
            </div>
          </div>

          <div className="flex flex-row items-center gap-4 mt-6">
            <button
              className="mt-4 outline-none w-5/12"
              style={{
                color: 'black',
                height: '50px',
                borderRadius: '10px',
                // width: "100%",
                fontWeight: 600,
                fontSize: '20',
              }}
              onClick={() => {
                setShowWarningModal(null)
              }}
            >
              Close
            </button>
            <button
              className="mt-4 outline-none bg-brand-primary w-7/12 text-white"
              style={{
                color: 'white',
                height: '50px',
                borderRadius: '10px',
                // width: "100%",
                fontWeight: 600,
                fontSize: '20',
              }}
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
