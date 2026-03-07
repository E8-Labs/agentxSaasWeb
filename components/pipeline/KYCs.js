import { Box, CircularProgress, Modal, Popover } from '@mui/material'
import { MoreHorizontal } from 'lucide-react'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import axios from 'axios'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

import { HowToVideoTypes, HowtoVideos } from '@/constants/Constants'
import { UserTypes } from '@/constants/UserTypes'
import { getTutorialByType, getVideoUrlByType } from '@/utils/tutorialVideos'

import Apis from '../apis/Apis'
import IntroVideoModal from '../createagent/IntroVideoModal'
import VideoCard from '../createagent/VideoCard'
import UserType from '../onboarding/UserType'
import AddBuyerKyc from './AddBuyerKyc'
import AddSellerKyc from './AddSellerKyc'

/** Modal content transition: scale 0.95→1 and opacity 0→1 on enter; reverse on exit. */
function ScaleFadeTransition({ in: inProp, children, onEnter, onExited, timeout = 250 }) {
  const [stage, setStage] = useState(inProp ? 'entering' : 'exited')
  const rafRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (inProp) {
      setStage('entering')
      onEnter?.()
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setStage('entered'))
      })
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    } else {
      if (stage === 'exited') return
      setStage('exiting')
      timerRef.current = setTimeout(() => {
        onExited?.()
        setStage('exited')
      }, timeout)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
  }, [inProp, timeout, onExited, onEnter])

  const isEntering = stage === 'entering'
  const style = {
    opacity: isEntering || stage === 'exiting' ? 0 : 1,
    transform: isEntering || stage === 'exiting' ? 'scale(0.95)' : 'scale(1)',
    transition: `opacity ${timeout}ms cubic-bezier(0.34, 1.56, 0.64, 1), transform ${timeout}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
  }

  return <div style={style}>{children}</div>
}

const KYCs = ({ kycsDetails, mainAgentId, user, selectedUser = null }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [BuyerAnchor, setBuyerAnchor] = useState(null)
  const [kycsData, setKycsData] = useState([])
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined
  // //console.log
  const openBuyerKyc = Boolean(BuyerAnchor)
  const buyerId = openBuyerKyc ? 'buyer-popover' : undefined
  const [selectedKyc, setSelectedKyc] = useState(null)

  //seller kyc data
  const [SellerNeedData, setSellerNeedData] = useState([])
  const [showSellerNeedData, setShowSellerNeedData] = useState(false)
  const [SellerMotivationData, setSellerMotivationData] = useState([])
  const [showSellerMotivationData, setShowSellerMotivationData] =
    useState(false)
  const [SellerUrgencyData, setSellerUrgencyData] = useState([])
  const [showSellerUrgencyData, setShowSellerUrgencyData] = useState(false)
  const [addSellerKyc, setAddSellerKyc] = useState(false)
  const [sellerKycClosing, setSellerKycClosing] = useState(false)
  const [sellerKycModalTitle, setSellerKycModalTitle] = useState('What would you like to ask sellers?')

  //directly open the desired add seeler question tab
  const [OpenSellerNeeds, setOpenSellerNeeds] = useState(false)
  const [OpenSelerMotivation, setOpenSelerMotivation] = useState(false)
  const [OpenSellerUrgency, setOpenSellerUrgency] = useState(false)

  // //console.log

  //buyer kyc data
  const [BuyerNeedData, setBuyerNeedData] = useState([])
  const [showBuyerNeedData, setShowBuyerNeedData] = useState(false)
  const [BuyerMotivationData, setBuyerMotivationData] = useState([])
  const [showBuyerMotivationData, setShowBuyerMotivationData] = useState(false)
  const [BuyerUrgencyData, setBuyerUrgencyData] = useState([])
  const [showBuyerUrgencyData, setShowBuyerUrgencyData] = useState(false)
  const [addBuyerKyc, setAddBuyerKyc] = useState(false)
  const [buyerKycClosing, setBuyerKycClosing] = useState(false)

  //directly open the desired add seeler question tab
  // const [OpenBuyerNeed, setOpenBuyerNeed] = useState(false);
  const [OpenBuyerMotivation, setOpenBuyerMotivation] = useState(false)
  const [OpenBuyerUrgency, setOpenBuyerUrgency] = useState(false)

  //intro video modal
  const [introVideoModal, setIntroVideoModal] = useState(false)

  //code for deleting the kycs
  const [DelKycLoader, setDelKycLoader] = useState(false)

  //popover code here
  const handleOpenPopover = (event, item) => {
    // //console.log;
    setAnchorEl(event.currentTarget)
    setSelectedKyc(item)
  }

  const handleOpenBuyerKycPopover = (event, item) => {
    setBuyerAnchor(event.currentTarget)
    setSelectedKyc(item)
  }

  const handleClosePopover = () => {
    setAnchorEl(null)
    setBuyerAnchor(null)
  }

  const getKyc = async () => {
    try {
      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        AuthToken = Data.token
      }

      let MainAgentData = null
      const mainAgentData = localStorage.getItem('agentDetails')
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData)
        //console.log;
        MainAgentData = Data.id
      }

      // //console.log;

      let ApiPath = null

      if (mainAgentId) {
        ApiPath = `${Apis.getKYCs}?mainAgentId=${mainAgentId}`
      } else {
        ApiPath = `${Apis.getKYCs}?mainAgentId=${MainAgentData}`
      }

      // //console.log;
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        kycsDetails(response.data.data)
        setKycsData(response.data.data)
        const filteredSellerQuestions = response.data.data.filter(
          (item) => item.type === 'seller',
        )
        const filteredBuyerQuestions = response.data.data.filter(
          (item) => item.type === 'buyer',
        )
        // //console.log;
        // //console.log;
        //code for seller kyc questions
        const filteredSellerNeedQuestions = filteredSellerQuestions.filter(
          (item) => item.category === 'need',
        )
        const filteredSellerMotivationQuestions =
          filteredSellerQuestions.filter(
            (item) => item.category === 'motivation',
          )
        const filteredSellerUrgencyQuestions = filteredSellerQuestions.filter(
          (item) => item.category === 'urgency',
        )
        // //console.log;
        setSellerNeedData(filteredSellerNeedQuestions)
        // //console.log;
        setSellerMotivationData(filteredSellerMotivationQuestions)
        // //console.log;
        setSellerUrgencyData(filteredSellerUrgencyQuestions)
        //code for buyer kyc questions
        const filteredBuyerNeedQuestions = filteredBuyerQuestions.filter(
          (item) => item.category === 'need',
        )
        const filteredBuyerMotivationQuestions = filteredBuyerQuestions.filter(
          (item) => item.category === 'motivation',
        )
        const filteredBuyerUrgencyQuestions = filteredBuyerQuestions.filter(
          (item) => item.category === 'urgency',
        )
        // //console.log;
        setBuyerNeedData(filteredBuyerNeedQuestions)
        // //console.log;
        setBuyerMotivationData(filteredBuyerMotivationQuestions)
        // //console.log;
        setBuyerUrgencyData(filteredBuyerUrgencyQuestions)
      } else {
        // //console.log
      }
    } catch (error) {
      // console.error("Error occured in gett kyc api is :--", error);
    } finally {
      // //console.log;
    }
  }

  useEffect(() => {
    getKyc()
  }, [])

  //close add seller kyc modal
  const handleCloseSellerKyc = () => {
    //// //console.log;
    //// //console.log;
    setOpenSelerMotivation(false)
    setOpenSellerUrgency(false)
    setOpenSellerNeeds(false)
    setAddSellerKyc(false)
    setAddBuyerKyc(false)
  }

  //getadd seller kyc data
  const handleAddSellerKycData = (data) => {
    // //console.log;
    const categories = data.kyc
    kycsDetails(data.kyc)
    // //console.log;
    // //console.log;

    // return
    // if (categories === "need") {
    //     setSellerNeedData([...SellerNeedData, ...data]);
    // } else if (categories === "motivation") {
    //     setSellerMotivationData([...SellerMotivationData, ...data]);
    // } else if (categories === "urgency") {
    //     setSellerUrgencyData([...SellerUrgencyData, ...data]);
    // }

    //code for seller kyc questions
    const filteredSellerQuestions = data.kyc.filter(
      (item) => item.type === 'seller',
    )
    // //console.log;
    const filteredSellerNeedQuestions = filteredSellerQuestions.filter(
      (item) => item.category === 'need',
    )
    const filteredSellerMotivationQuestions = filteredSellerQuestions.filter(
      (item) => item.category === 'motivation',
    )
    const filteredSellerUrgencyQuestions = filteredSellerQuestions.filter(
      (item) => item.category === 'urgency',
    )
    // //console.log;
    setSellerNeedData(filteredSellerNeedQuestions)
    //console.log;
    setSellerMotivationData(filteredSellerMotivationQuestions)
    // //console.log;
    setSellerUrgencyData(filteredSellerUrgencyQuestions)
    //code for buyer kyc questions
  }

  //getadd buyer kyc data
  const handleAddBuyerKycData = (data) => {
    // //console.log;
    const categories = data.kyc
    kycsDetails(data.kyc)
    // //console.log;
    // if (categories === "need") {
    //     setBuyerNeedData([...BuyerNeedData, ...data]);
    // } else if (categories === "motivation") {
    //     setBuyerMotivationData([...BuyerMotivationData, ...data]);
    // } else if (categories === "urgency") {
    //     setBuyerUrgencyData([...BuyerUrgencyData, ...data]);
    // }

    const filteredBuyerQuestions = data.kyc.filter(
      (item) => item.type === 'buyer',
    )
    // //console.log;

    const filteredBuyerNeedQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === 'need',
    )
    const filteredBuyerMotivationQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === 'motivation',
    )
    const filteredBuyerUrgencyQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === 'urgency',
    )
    // //console.log;
    setBuyerNeedData(filteredBuyerNeedQuestions)
    // //console.log;
    setBuyerMotivationData(filteredBuyerMotivationQuestions)
    // //console.log;
    setBuyerUrgencyData(filteredBuyerUrgencyQuestions)
  }

  //function to filter KYCs

  const filterKycs = (KycsList) => {
    const filteredSellerQuestions = KycsList.filter(
      (item) => item.type === 'seller',
    )
    const filteredBuyerQuestions = KycsList.filter(
      (item) => item.type === 'buyer',
    )
    // //console.log;
    // //console.log;
    //code for seller kyc questions
    const filteredSellerNeedQuestions = filteredSellerQuestions.filter(
      (item) => item.category === 'need',
    )
    const filteredSellerMotivationQuestions = filteredSellerQuestions.filter(
      (item) => item.category === 'motivation',
    )
    const filteredSellerUrgencyQuestions = filteredSellerQuestions.filter(
      (item) => item.category === 'urgency',
    )
    // //console.log;
    setSellerNeedData(filteredSellerNeedQuestions)
    // //console.log;
    setSellerMotivationData(filteredSellerMotivationQuestions)
    // //console.log;
    setSellerUrgencyData(filteredSellerUrgencyQuestions)
    //code for buyer kyc questions
    const filteredBuyerNeedQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === 'need',
    )
    const filteredBuyerMotivationQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === 'motivation',
    )
    const filteredBuyerUrgencyQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === 'urgency',
    )
    // //console.log;
    setBuyerNeedData(filteredBuyerNeedQuestions)
    // //console.log;
    setBuyerMotivationData(filteredBuyerMotivationQuestions)
    // //console.log;
    setBuyerUrgencyData(filteredBuyerUrgencyQuestions)
  }

  //delete kyc data
  const handleDeleteKyc = async () => {
    try {
      setDelKycLoader(true)

      let AuthToken = null
      const localData = localStorage.getItem('User')
      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        AuthToken = Data.token
      }

      // //console.log;

      const ApiData = {
        kycId: selectedKyc.id,
      }

      const ApiPath = Apis.deleteKyc
      // //console.log;

      // //console.log;

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: 'Bearer ' + AuthToken,
        },
      })

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // kycsDetails()
          filterKycs(response.data.data.kyc)
          handleClosePopover()
        }
      }
    } catch (error) {
      // console.error("Eror occured in", error);
    } finally {
      setDelKycLoader(false)
    }
  }

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: '700',
    },
    inputStyle: {
      fontSize: 14,
      fontWeight: '500',
    },
    dropdownMenu: {
      fontSize: 14,
      fontWeight: '500',
      color: '#00000070',
    },
    modalsStyle: {
      height: 'auto',
      bgcolor: 'transparent',
      // p: 2,
      mx: 'auto',
      my: '50vh',
      transform: 'translateY(-55%)',
      borderRadius: 2,
      border: 'none',
      outline: 'none',
    },
  }

  function GetTitleForKyc() {
    let type = 'KYC - Seller'
    if (user) {
      let profile = user.user
      if (selectedUser) {
        profile = selectedUser
      }
      if (profile?.userType && profile?.userType != UserTypes.RealEstateAgent) {
        type = 'KYC'
      }
    }
    return type
  }

  function CanShowBuyerKycs() {
    let type = true
    if (user) {
      let profile = user.user
      if (selectedUser) {
        profile = selectedUser
      }
      if (profile?.userType && profile?.userType != UserTypes.RealEstateAgent) {
        type = false
      }
    }
    return type
  }

  // //console.log)

  return (
    <div style={{ height: '100%', backgroundColor: '' }}>
      {/* <div className="mt-5" style={styles.headingStyle}>
        Call Summary
      </div> */}

      {/* <textarea placeholder="Call Summary"
        className="w-full rounded-lg p-2 outline-none focus:ring-0"
        style={{
          fontSize: 15,
          fontWeight: "500",
          marginTop: 10,
          // height: "150px",
          resize: "none",
          border: "none",
        }}
        maxLength={200}
        readOnly
        value={"Learom ipsom dolor"}

      /> */}

      <div style={styles.headingStyle} className="mt-4 py-3">
        {GetTitleForKyc()}
      </div>
      <div className="border rounded-lg p-3 w-full text-sm text-black/80 mt-3">
        <div
          role="button"
          tabIndex={0}
          className="flex flex-row items-center justify-between w-full py-3 border-b border-[#eaeaea] cursor-pointer"
          onClick={() => setShowSellerNeedData(!showSellerNeedData)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSellerNeedData(!showSellerNeedData); } }}
        >
          <div className="flex flex-row items-center gap-2">
            <div style={styles.inputStyle}>Need</div>
            <div
              className="border flex flex-row items-center justify-center"
              style={{
                height: '20px',
                width: '18px',
                fontSize: 12,
                fontWeight: '700',
                borderRadius: '50%',
              }}
            >
              {SellerNeedData?.length}
            </div>
          </div>
          <span aria-hidden="true">
            {showSellerNeedData ? (
              <CaretUp size={14} weight="bold" />
            ) : (
              <CaretDown size={14} weight="bold" />
            )}
          </span>
        </div>

        <div className="bg-black/[0.02] p-2 px-3">
          {showSellerNeedData && (
            <div>
              {SellerNeedData.map((item, index) => (
                <div key={index} className="">
                  <div className="flex flex-row items-center justify-between py-3 h-auto border-b border-[#eaeaea]">
                    <div style={styles.inputStyle}>{item.question}</div>
                    <button
                      aria-describedby={id}
                      onClick={(event) => {
                        handleOpenPopover(event, item)
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClosePopover}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                      }}
                      PaperProps={{
                        elevation: 0, // This will remove the shadow
                        style: {
                          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                          borderRadius: '13px',
                        },
                      }}
                    >
                      {DelKycLoader ? (
                        <div>
                          <CircularProgress size={20} />
                        </div>
                      ) : (
                        <button
                          className="p-2 px-3 flex flex-row items-center gap-2 rounded-xl"
                          onClick={handleDeleteKyc}
                        >
                          <Image
                            src={'/assets/delIcon.png'}
                            height={16}
                            width={16}
                            alt="*"
                          />
                          <div className="text-red" style={styles.inputStyle}>
                            <div>Delete</div>
                          </div>
                        </button>
                      )}
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="underline text-brand-primary mt-4 text-sm font-normal"
            onClick={() => {
              setOpenSellerNeeds(true)
              setAddSellerKyc(true)
            }}
          >
            Add Question
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-3 w-full text-sm text-black/80 mt-3">
        <div
          role="button"
          tabIndex={0}
          className="flex flex-row items-center justify-between w-full py-3 border-b border-[#eaeaea] cursor-pointer"
          onClick={() => setShowSellerMotivationData(!showSellerMotivationData)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSellerMotivationData(!showSellerMotivationData); } }}
        >
          <div className="flex flex-row items-center gap-2">
            <div style={styles.inputStyle}>Motivation</div>
            <div
              className="border flex flex-row items-center justify-center"
              style={{
                height: '20px',
                width: '18px',
                fontSize: 12,
                fontWeight: '700',
                borderRadius: '50%',
              }}
            >
              {SellerMotivationData?.length}
            </div>
          </div>
          <span aria-hidden="true">
            {showSellerMotivationData ? (
              <CaretUp size={14} weight="bold" />
            ) : (
              <CaretDown size={14} weight="bold" />
            )}
          </span>
        </div>

        <div className="bg-black/[0.02] p-2 px-3">
          {showSellerMotivationData && (
            <div>
              {SellerMotivationData.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-row items-center justify-between py-3 h-auto border-b border-[#eaeaea]">
                    <div style={styles.inputStyle}>{item.question}</div>
                    <button
                      aria-describedby={id}
                      onClick={(event) => {
                        handleOpenPopover(event, item)
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClosePopover}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                      }}
                      PaperProps={{
                        elevation: 0, // This will remove the shadow
                        style: {
                          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                          borderRadius: '13px',
                        },
                      }}
                    >
                      {DelKycLoader ? (
                        <div>
                          <CircularProgress size={20} />
                        </div>
                      ) : (
                        <button
                          className="p-2 px-3 flex flex-row items-center gap-2 rounded-xl"
                          onClick={handleDeleteKyc}
                        >
                          <Image
                            src={'/assets/delIcon.png'}
                            height={16}
                            width={16}
                            alt="*"
                          />
                          <div className="text-red" style={styles.inputStyle}>
                            Delete
                          </div>
                        </button>
                      )}
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="underline text-brand-primary mt-4 text-sm font-normal"
            onClick={() => {
              setOpenSelerMotivation(true)
              setAddSellerKyc(true)
            }}
          >
            Add Question
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-3 w-full text-sm text-black/80 mt-3">
        <div
          role="button"
          tabIndex={0}
          className="flex flex-row items-center justify-between w-full py-3 border-b border-[#eaeaea] cursor-pointer"
          onClick={() => setShowSellerUrgencyData(!showSellerUrgencyData)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSellerUrgencyData(!showSellerUrgencyData); } }}
        >
          <div className="flex flex-row items-center gap-2">
            <div style={styles.inputStyle}>Urgency</div>
            <div
              className="border flex flex-row items-center justify-center"
              style={{
                height: '20px',
                width: '18px',
                fontSize: 12,
                fontWeight: '700',
                borderRadius: '50%',
              }}
            >
              {SellerUrgencyData?.length}
            </div>
          </div>
          <span aria-hidden="true">
            {showSellerUrgencyData ? (
              <CaretUp size={14} weight="bold" />
            ) : (
              <CaretDown size={14} weight="bold" />
            )}
          </span>
        </div>

        <div className="bg-black/[0.02] p-2 px-3">
          {showSellerUrgencyData && (
            <div>
              {SellerUrgencyData.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-row items-center justify-between py-3 h-auto">
                    <div style={styles.inputStyle}>{item.question}</div>
                    <button
                      aria-describedby={id}
                      onClick={(event) => {
                        handleOpenPopover(event, item)
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClosePopover}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                      }}
                      PaperProps={{
                        elevation: 0, // This will remove the shadow
                        style: {
                          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                          borderRadius: '13px',
                        },
                      }}
                    >
                      <div>
                        {DelKycLoader ? (
                          <div>
                            <CircularProgress size={20} />
                          </div>
                        ) : (
                          <button
                            className="p-2 px-3 flex flex-row items-center gap-2 rounded-xl"
                            onClick={handleDeleteKyc}
                          >
                            <Image
                              src={'/assets/delIcon.png'}
                              height={16}
                              width={16}
                              alt="*"
                            />
                            <div className="text-red" style={styles.inputStyle}>
                              Delete
                            </div>
                          </button>
                        )}
                      </div>
                    </Popover>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            className="underline text-brand-primary mt-4 text-sm font-normal"
            onClick={() => {
              setAddSellerKyc(true)
              setOpenSellerUrgency(true)
            }}
          >
            Add Question
          </button>
        </div>
      </div>

      {/* <div className='underline text-purple mt-4' style={styles.inputStyle} onClick={() => { setAddSellerKyc(true) }}>
                Add Question
            </div> */}

      {/* Code to add seller kyc */}
      {/* Modals code goes here */}
      <Modal
        open={addSellerKyc}
        onClose={() => setSellerKycClosing(true)}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: { backgroundColor: '#00000099' },
        }}
      >
        <Box
          className="sm:w-[760px] w-10/12 h-[85vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: 'none' }}
        >
          <ScaleFadeTransition
            in={addSellerKyc && !sellerKycClosing}
            timeout={250}
            onExited={() => {
              setAddSellerKyc(false)
              setSellerKycClosing(false)
              setOpenSelerMotivation(false)
              setOpenSellerUrgency(false)
              setOpenSellerNeeds(false)
            }}
          >
            <div className="flex flex-row justify-center w-full h-[100%]">
              <div
                className="w-[500px] flex flex-col gap-3 p-0 overflow-hidden"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #eaeaea',
                  borderRadius: 12,
                }}
              >
                <div
                  className="flex flex-row justify-between items-center"
                  style={{
                    paddingTop: 12,
                    paddingBottom: 12,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderBottom: '1px solid #eaeaea',
                  }}
                >
                  <span
                    className="text-left font-semibold"
                    style={{ fontSize: 18 }}
                  >
                    {sellerKycModalTitle}
                  </span>
                  <button
                    onClick={() => {
                      setSellerKycClosing(true)
                      setOpenSelerMotivation(false)
                      setOpenSellerUrgency(false)
                      setOpenSellerNeeds(false)
                    }}
                  >
                    <Image
                      src={'/assets/crossIcon.png'}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
                <div style={{ padding: 1 }}>
                  <AddSellerKyc
                    onTitleReady={setSellerKycModalTitle}
                    titleRenderedInHeader={true}
                    mainAgentId={mainAgentId}
                    hideTitle={true}
                    handleCloseSellerKyc={handleCloseSellerKyc}
                    handleAddSellerKycData={handleAddSellerKycData}
                    OpenSellerNeeds={OpenSellerNeeds}
                    OpenSelerMotivation={OpenSelerMotivation}
                    OpenSellerUrgency={OpenSellerUrgency}
                    SellerNeedData={SellerNeedData}
                    SellerMotivationData={SellerMotivationData}
                    SellerUrgencyData={SellerUrgencyData}
                    allKYCs={kycsData}
                    selectedUser={selectedUser}
                  />
                </div>
              </div>
            </div>
          </ScaleFadeTransition>
        </Box>
      </Modal>

      {/* code for buyer kys */}

      {CanShowBuyerKycs() && (
        <div style={styles.headingStyle} className="mt-4 py-3">
          KYC - Buyer
        </div>
      )}

      {CanShowBuyerKycs() && (
        <>
          <div className="border rounded-lg p-3 w-full text-sm text-black/80 mt-3">
            <div
              role="button"
              tabIndex={0}
              className="flex flex-row items-center justify-between w-full py-3 border-b border-[#eaeaea] cursor-pointer"
              onClick={() => setShowBuyerNeedData(!showBuyerNeedData)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowBuyerNeedData(!showBuyerNeedData); } }}
            >
              <div style={styles.inputStyle}>Need</div>
              <div className="flex flex-row items-center gap-2">
                <div
                  className="border flex flex-row items-center justify-center"
                  style={{
                    height: '20px',
                    width: '18px',
                    fontSize: 12,
                    fontWeight: '700',
                    borderRadius: '50%',
                  }}
                >
                  {BuyerNeedData.length}
                </div>
                <span aria-hidden="true">
                  {showBuyerNeedData ? (
                    <CaretUp size={14} weight="bold" />
                  ) : (
                    <CaretDown size={14} weight="bold" />
                  )}
                </span>
              </div>
            </div>

<div className="bg-black/[0.02] p-2 px-3">
            {showBuyerNeedData && (
                <div>
                  {BuyerNeedData.map((item, index) => (
                    <div key={index}>
                      <div className="flex flex-row items-center justify-between py-3 h-auto">
                        <div>{item.question}</div>
                        <button
                          aria-describedby={buyerId}
                          onClick={(event) => {
                            handleOpenBuyerKycPopover(event, item)
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        <Popover
                          id={buyerId}
                          open={openBuyerKyc}
                          anchorEl={BuyerAnchor}
                          onClose={handleClosePopover}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                          }}
                          PaperProps={{
                            elevation: 0, // This will remove the shadow
                            style: {
                              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                              borderRadius: '13px',
                            },
                          }}
                        >
                          {DelKycLoader ? (
                            <CircularProgress size={20} />
                          ) : (
                            <button
                              className="p-2 px-3 rounded-xl flex flex-row items-center gap-2"
                              onClick={handleDeleteKyc}
                            >
                              <Image
                                src={'/assets/delIcon.png'}
                                height={16}
                                width={16}
                                alt="*"
                              />
                              <div
                                className="text-red"
                                style={styles.inputStyle}
                              >
                                Delete
                              </div>
                            </button>
                          )}
                        </Popover>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="underline text-brand-primary text-sm font-normal"
                onClick={() => {
                  setAddBuyerKyc(true)
                }}
              >
                Add Question
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-3 w-full text-sm text-black/80 mt-3">
            <div
              role="button"
              tabIndex={0}
              className="flex flex-row items-center justify-between w-full py-3 border-b border-[#eaeaea] cursor-pointer"
              onClick={() => setShowBuyerMotivationData(!showBuyerMotivationData)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowBuyerMotivationData(!showBuyerMotivationData); } }}
            >
              <div className="flex flex-row items-center gap-2">
                <div style={styles.inputStyle}>Motivation</div>
                <div
                  className="border flex flex-row items-center justify-center"
                  style={{
                    height: '20px',
                    width: '18px',
                    fontSize: 12,
                    fontWeight: '700',
                    borderRadius: '50%',
                  }}
                >
                  {BuyerMotivationData.length}
                </div>
              </div>
              <span aria-hidden="true">
                {showBuyerMotivationData ? (
                  <CaretUp size={14} weight="bold" />
                ) : (
                  <CaretDown size={14} weight="bold" />
                )}
              </span>
            </div>

<div className="bg-black/[0.02] p-2 px-3">
            {showBuyerMotivationData && (
                <div>
                  {BuyerMotivationData.map((item, index) => (
                    <div key={index}>
                      <div className="flex flex-row items-center justify-between py-3 h-auto border-b border-[#eaeaea]">
                        <div>{item.question}</div>
                        <button
                          aria-describedby={buyerId}
                          onClick={(event) => {
                            handleOpenBuyerKycPopover(event, item)
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        <Popover
                          id={buyerId}
                          open={openBuyerKyc}
                          anchorEl={BuyerAnchor}
                          onClose={handleClosePopover}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                          }}
                          PaperProps={{
                            elevation: 0, // This will remove the shadow
                            style: {
                              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                              borderRadius: '13px',
                            },
                          }}
                        >
                          {DelKycLoader ? (
                            <CircularProgress size={20} />
                          ) : (
                            <button
                              className="p-2 px-3 rounded-xl flex flex-row items-center gap-2"
                              onClick={handleDeleteKyc}
                            >
                              <Image
                                src={'/assets/delIcon.png'}
                                height={16}
                                width={16}
                                alt="*"
                              />
                              <div
                                className="text-red"
                                style={styles.inputStyle}
                              >
                                Delete
                              </div>
                            </button>
                          )}
                        </Popover>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="underline text-brand-primary text-sm font-normal"
                onClick={() => {
                  setAddBuyerKyc(true)
                  setOpenBuyerMotivation(true)
                }}
              >
                Add Question
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-3 w-full text-sm text-black/80 mt-3">
            <div
              role="button"
              tabIndex={0}
              className="flex flex-row items-center justify-between w-full py-3 border-b border-[#eaeaea] cursor-pointer"
              onClick={() => setShowBuyerUrgencyData(!showBuyerUrgencyData)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowBuyerUrgencyData(!showBuyerUrgencyData); } }}
            >
              <div className="flex flex-row items-center gap-2">
                <div style={styles.inputStyle}>Urgency</div>
                <div
                  className="border flex flex-row items-center justify-center"
                  style={{
                    height: '20px',
                    width: '18px',
                    fontSize: 12,
                    fontWeight: '700',
                    borderRadius: '50%',
                  }}
                >
                  {BuyerUrgencyData.length}
                </div>
              </div>
              <span aria-hidden="true">
                {showBuyerUrgencyData ? (
                  <CaretUp size={14} weight="bold" />
                ) : (
                  <CaretDown size={14} weight="bold" />
                )}
              </span>
            </div>

<div className="bg-black/[0.02] p-2 px-3">
            {showBuyerUrgencyData && (
                <div>
                  {BuyerUrgencyData.map((item, index) => (
                    <div key={index}>
                      <div className="flex flex-row items-center justify-between py-3 h-auto">
                        <div>{item.question}</div>
                        <button
                          aria-describedby={buyerId}
                          onClick={(event) => {
                            handleOpenBuyerKycPopover(event, item)
                          }}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        <Popover
                          id={buyerId}
                          open={openBuyerKyc}
                          anchorEl={BuyerAnchor}
                          onClose={handleClosePopover}
                          anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                          }}
                          PaperProps={{
                            elevation: 0, // This will remove the shadow
                            style: {
                              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                              borderRadius: '13px',
                            },
                          }}
                        >
                          {DelKycLoader ? (
                            <CircularProgress size={20} />
                          ) : (
                            <button
                              className="p-2 px-3 rounded-xl flex flex-row items-center gap-2"
                              onClick={handleDeleteKyc}
                            >
                              <Image
                                src={'/assets/delIcon.png'}
                                height={16}
                                width={16}
                                alt="*"
                              />
                              <div
                                className="text-red"
                                style={styles.inputStyle}
                              >
                                Delete
                              </div>
                            </button>
                          )}
                        </Popover>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="underline text-brand-primary text-sm font-normal"
                onClick={() => {
                  setAddBuyerKyc(true)
                  setOpenBuyerUrgency(true)
                }}
              >
                Add Question
              </button>
            </div>
          </div>
        </>
      )}

      <div className="w-full flex flex-row items-center justify-center">
        <IntroVideoModal
          open={introVideoModal}
          onClose={() => setIntroVideoModal(false)}
          videoTitle={
            getTutorialByType(HowToVideoTypes.AgentConfiguration)?.title ||
            'Learn about asking questions (KYC)'
          }
          videoUrl={
            getVideoUrlByType(HowToVideoTypes.AgentConfiguration) ||
            HowtoVideos.KycQuestions
          }
        />
        <div className="hidden lg:inline  xl:w-[340px] lg:w-[340px] -ml-4 mt-12">
          <VideoCard
            duration={(() => {
              const tutorial = getTutorialByType(
                HowToVideoTypes.AgentConfiguration,
              )
              return tutorial?.description || '1:38'
            })()}
            horizontal={false}
            playVideo={() => {
              setIntroVideoModal(true)
            }}
            title={
              getTutorialByType(HowToVideoTypes.AgentConfiguration)?.title ||
              'Learn about asking questions (KYC)'
            }
          />
        </div>
      </div>

      {/* Add modals code */}
      <Modal
        open={addBuyerKyc}
        onClose={() => setBuyerKycClosing(true)}
        closeAfterTransition
        BackdropProps={{
          timeout: 250,
          sx: { backgroundColor: '#00000099' },
        }}
      >
        <Box
          className="sm:w-[760px] h-[85vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: 'none' }}
        >
          <ScaleFadeTransition
            in={addBuyerKyc && !buyerKycClosing}
            timeout={250}
            onExited={() => {
              setAddBuyerKyc(false)
              setBuyerKycClosing(false)
              setOpenBuyerMotivation(false)
              setOpenBuyerUrgency(false)
            }}
          >
            <div className="flex flex-row justify-center w-full h-[100%]">
              <div
                className="w-[400px] flex flex-col gap-3 p-0 overflow-hidden"
                style={{
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 36px rgba(0, 0, 0, 0.25)',
                  border: '1px solid #eaeaea',
                  borderRadius: 12,
                }}
              >
                <div
                  className="flex flex-row justify-between items-center"
                  style={{
                    paddingTop: 12,
                    paddingBottom: 12,
                    paddingLeft: 16,
                    paddingRight: 16,
                    borderBottom: '1px solid #eaeaea',
                  }}
                >
                  <span
                    className="text-left font-semibold"
                    style={{ fontSize: 18 }}
                  >
                    What would you like to ask buyers?
                  </span>
                  <button
                    onClick={() => {
                      setBuyerKycClosing(true)
                      setOpenBuyerMotivation(false)
                      setOpenBuyerUrgency(false)
                    }}
                  >
                    <Image
                      src={'/assets/crossIcon.png'}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
                <div style={{ padding: 20 }}>
                  <AddBuyerKyc
                    titleRenderedInHeader={true}
                    handleCloseSellerKyc={handleCloseSellerKyc}
                    handleAddBuyerKycData={handleAddBuyerKycData}
                    OpenBuyerMotivation={OpenBuyerMotivation}
                    OpenBuyerUrgency={OpenBuyerUrgency}
                    BuyerNeedData={BuyerNeedData}
                    BuyerMotivationData={BuyerMotivationData}
                    BuyerUrgencyData={BuyerUrgencyData}
                    mainAgentId={mainAgentId}
                    selectedUser={selectedUser}
                    hideTitle={true}
                  />
                </div>
              </div>
            </div>
          </ScaleFadeTransition>
        </Box>
      </Modal>
    </div>
  )
}

export default KYCs
