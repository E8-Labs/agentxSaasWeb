import { Box, CircularProgress, Modal, Popover } from "@mui/material";
import { CaretDown, CaretUp, DotsThree } from "@phosphor-icons/react";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Apis from "../apis/Apis";
import AddSellerKyc from "./AddSellerKyc";
import AddBuyerKyc from "./AddBuyerKyc";
import UserType from "../onboarding/UserType";
import { UserTypes } from "@/constants/UserTypes";
import IntroVideoModal from "../createagent/IntroVideoModal";
import VideoCard from "../createagent/VideoCard";
import { HowtoVideos } from "@/constants/Constants";

const KYCs = ({ kycsDetails, mainAgentId, user,selectedUser = null }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [BuyerAnchor, setBuyerAnchor] = useState(null);
  const [kycsData, setKycsData] = useState([]);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  // //console.log
  const openBuyerKyc = Boolean(BuyerAnchor);
  const buyerId = openBuyerKyc ? "buyer-popover" : undefined;
  const [selectedKyc, setSelectedKyc] = useState(null);

  //seller kyc data
  const [SellerNeedData, setSellerNeedData] = useState([]);
  const [showSellerNeedData, setShowSellerNeedData] = useState(false);
  const [SellerMotivationData, setSellerMotivationData] = useState([]);
  const [showSellerMotivationData, setShowSellerMotivationData] =
    useState(false);
  const [SellerUrgencyData, setSellerUrgencyData] = useState([]);
  const [showSellerUrgencyData, setShowSellerUrgencyData] = useState(false);
  const [addSellerKyc, setAddSellerKyc] = useState(false);

  //directly open the desired add seeler question tab
  const [OpenSellerNeeds, setOpenSellerNeeds] = useState(false);
  const [OpenSelerMotivation, setOpenSelerMotivation] = useState(false);
  const [OpenSellerUrgency, setOpenSellerUrgency] = useState(false);

  // //console.log

  //buyer kyc data
  const [BuyerNeedData, setBuyerNeedData] = useState([]);
  const [showBuyerNeedData, setShowBuyerNeedData] = useState(false);
  const [BuyerMotivationData, setBuyerMotivationData] = useState([]);
  const [showBuyerMotivationData, setShowBuyerMotivationData] = useState(false);
  const [BuyerUrgencyData, setBuyerUrgencyData] = useState([]);
  const [showBuyerUrgencyData, setShowBuyerUrgencyData] = useState(false);
  const [addBuyerKyc, setAddBuyerKyc] = useState(false);

  //directly open the desired add seeler question tab
  // const [OpenBuyerNeed, setOpenBuyerNeed] = useState(false);
  const [OpenBuyerMotivation, setOpenBuyerMotivation] = useState(false);
  const [OpenBuyerUrgency, setOpenBuyerUrgency] = useState(false);

  //intro video modal
  const [introVideoModal, setIntroVideoModal] = useState(false);

  //code for deleting the kycs
  const [DelKycLoader, setDelKycLoader] = useState(false);

  //popover code here
  const handleOpenPopover = (event, item) => {
    // //console.log;
    setAnchorEl(event.currentTarget);
    setSelectedKyc(item);
  };

  const handleOpenBuyerKycPopover = (event, item) => {
    setBuyerAnchor(event.currentTarget);
    setSelectedKyc(item);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setBuyerAnchor(null);
  };

  const getKyc = async () => {
    try {
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        AuthToken = Data.token;
      }

      let MainAgentData = null;
      const mainAgentData = localStorage.getItem("agentDetails");
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData);
        //console.log;
        MainAgentData = Data.id;
      }

      // //console.log;

      let ApiPath = null;

      if (mainAgentId) {
        ApiPath = `${Apis.getKYCs}?mainAgentId=${mainAgentId}`;
      
      } else {
        ApiPath = `${Apis.getKYCs}?mainAgentId=${MainAgentData}`;
      }

      // //console.log;
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //console.log;
        kycsDetails(response.data.data);
        setKycsData(response.data.data);
        const filteredSellerQuestions = response.data.data.filter(
          (item) => item.type === "seller"
        );
        const filteredBuyerQuestions = response.data.data.filter(
          (item) => item.type === "buyer"
        );
        // //console.log;
        // //console.log;
        //code for seller kyc questions
        const filteredSellerNeedQuestions = filteredSellerQuestions.filter(
          (item) => item.category === "need"
        );
        const filteredSellerMotivationQuestions =
          filteredSellerQuestions.filter(
            (item) => item.category === "motivation"
          );
        const filteredSellerUrgencyQuestions = filteredSellerQuestions.filter(
          (item) => item.category === "urgency"
        );
        // //console.log;
        setSellerNeedData(filteredSellerNeedQuestions);
        // //console.log;
        setSellerMotivationData(filteredSellerMotivationQuestions);
        // //console.log;
        setSellerUrgencyData(filteredSellerUrgencyQuestions);
        //code for buyer kyc questions
        const filteredBuyerNeedQuestions = filteredBuyerQuestions.filter(
          (item) => item.category === "need"
        );
        const filteredBuyerMotivationQuestions = filteredBuyerQuestions.filter(
          (item) => item.category === "motivation"
        );
        const filteredBuyerUrgencyQuestions = filteredBuyerQuestions.filter(
          (item) => item.category === "urgency"
        );
        // //console.log;
        setBuyerNeedData(filteredBuyerNeedQuestions);
        // //console.log;
        setBuyerMotivationData(filteredBuyerMotivationQuestions);
        // //console.log;
        setBuyerUrgencyData(filteredBuyerUrgencyQuestions);
      } else {
        // //console.log
      }
    } catch (error) {
      // console.error("Error occured in gett kyc api is :--", error);
    } finally {
      // //console.log;
    }
  };

  useEffect(() => {
    getKyc();
  }, []);

  //close add seller kyc modal
  const handleCloseSellerKyc = () => {
    //// //console.log;
    //// //console.log;
    setOpenSelerMotivation(false);
    setOpenSellerUrgency(false);
    setOpenSellerNeeds(false);
    setAddSellerKyc(false);
    setAddBuyerKyc(false);
  };

  //getadd seller kyc data
  const handleAddSellerKycData = (data) => {
    // //console.log;
    const categories = data.kyc;
    kycsDetails(data.kyc);
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
      (item) => item.type === "seller"
    );
    // //console.log;
    const filteredSellerNeedQuestions = filteredSellerQuestions.filter(
      (item) => item.category === "need"
    );
    const filteredSellerMotivationQuestions = filteredSellerQuestions.filter(
      (item) => item.category === "motivation"
    );
    const filteredSellerUrgencyQuestions = filteredSellerQuestions.filter(
      (item) => item.category === "urgency"
    );
    // //console.log;
    setSellerNeedData(filteredSellerNeedQuestions);
    //console.log;
    setSellerMotivationData(filteredSellerMotivationQuestions);
    // //console.log;
    setSellerUrgencyData(filteredSellerUrgencyQuestions);
    //code for buyer kyc questions
  };

  //getadd buyer kyc data
  const handleAddBuyerKycData = (data) => {
    // //console.log;
    const categories = data.kyc;
    kycsDetails(data.kyc);
    // //console.log;
    // if (categories === "need") {
    //     setBuyerNeedData([...BuyerNeedData, ...data]);
    // } else if (categories === "motivation") {
    //     setBuyerMotivationData([...BuyerMotivationData, ...data]);
    // } else if (categories === "urgency") {
    //     setBuyerUrgencyData([...BuyerUrgencyData, ...data]);
    // }

    const filteredBuyerQuestions = data.kyc.filter(
      (item) => item.type === "buyer"
    );
    // //console.log;

    const filteredBuyerNeedQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === "need"
    );
    const filteredBuyerMotivationQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === "motivation"
    );
    const filteredBuyerUrgencyQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === "urgency"
    );
    // //console.log;
    setBuyerNeedData(filteredBuyerNeedQuestions);
    // //console.log;
    setBuyerMotivationData(filteredBuyerMotivationQuestions);
    // //console.log;
    setBuyerUrgencyData(filteredBuyerUrgencyQuestions);
  };

  //function to filter KYCs

  const filterKycs = (KycsList) => {
    const filteredSellerQuestions = KycsList.filter(
      (item) => item.type === "seller"
    );
    const filteredBuyerQuestions = KycsList.filter(
      (item) => item.type === "buyer"
    );
    // //console.log;
    // //console.log;
    //code for seller kyc questions
    const filteredSellerNeedQuestions = filteredSellerQuestions.filter(
      (item) => item.category === "need"
    );
    const filteredSellerMotivationQuestions = filteredSellerQuestions.filter(
      (item) => item.category === "motivation"
    );
    const filteredSellerUrgencyQuestions = filteredSellerQuestions.filter(
      (item) => item.category === "urgency"
    );
    // //console.log;
    setSellerNeedData(filteredSellerNeedQuestions);
    // //console.log;
    setSellerMotivationData(filteredSellerMotivationQuestions);
    // //console.log;
    setSellerUrgencyData(filteredSellerUrgencyQuestions);
    //code for buyer kyc questions
    const filteredBuyerNeedQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === "need"
    );
    const filteredBuyerMotivationQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === "motivation"
    );
    const filteredBuyerUrgencyQuestions = filteredBuyerQuestions.filter(
      (item) => item.category === "urgency"
    );
    // //console.log;
    setBuyerNeedData(filteredBuyerNeedQuestions);
    // //console.log;
    setBuyerMotivationData(filteredBuyerMotivationQuestions);
    // //console.log;
    setBuyerUrgencyData(filteredBuyerUrgencyQuestions);
  };

  //delete kyc data
  const handleDeleteKyc = async () => {
    try {
      setDelKycLoader(true);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        AuthToken = Data.token;
      }

      // //console.log;

      const ApiData = {
        kycId: selectedKyc.id,
      };

      const ApiPath = Apis.deleteKyc;
      // //console.log;

      // //console.log;

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // kycsDetails()
          filterKycs(response.data.data.kyc);
          handleClosePopover();
        }
      }
    } catch (error) {
      // console.error("Eror occured in", error);
    } finally {
      setDelKycLoader(false);
    }
  };

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "700",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500",
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: "500",
      color: "#00000070",
    },
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-55%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  function GetTitleForKyc() {
    let type = "KYC - Seller";
    if (user) {
      let profile = user.user;
      if (profile.userType != UserTypes.RealEstateAgent) {
        type = "KYC";
      }
    }
    return type;
  }

  function CanShowBuyerKycs() {
    let type = true;
    if (user) {
      let profile = user.user;
      if (profile.userType != UserTypes.RealEstateAgent) {
        type = false;
      }
    }
    return type;
  }

  // //console.log)

  return (
    <div style={{ height: "100%", backgroundColor: "" }}>
      <div style={styles.headingStyle} className="mt-4">
        {GetTitleForKyc()}
      </div>
      <div className="border p-2 rounded-lg p-4 w-full mt-4">
        <div className="flex flex-row items-center justify-between w-full">
          <div style={styles.inputStyle}>Need</div>
          <div className="flex flex-row items-center gap-2">
            <div
              className="border flex flex-row items-center justify-center"
              style={{
                height: "20px",
                width: "18px",
                fontSize: 12,
                fontWeight: "700",
                borderRadius: "50%",
              }}
            >
              {SellerNeedData?.length}
            </div>
            <button
              onClick={() => {
                setShowSellerNeedData(!showSellerNeedData);
              }}
            >
              {showSellerNeedData ? (
                <CaretUp size={25} weight="bold" />
              ) : (
                <CaretDown size={25} weight="bold" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-[#98989810] p-2 mt-4">
          {showSellerNeedData && (
            <div>
              {SellerNeedData.map((item, index) => (
                <div key={index} className="">
                  <div className="flex flex-row items-center justify-between ">
                    <div style={styles.inputStyle}>{item.question}</div>
                    <button
                      aria-describedby={id}
                      onClick={(event) => {
                        handleOpenPopover(event, item);
                      }}
                    >
                      <DotsThree size={35} weight="bold" />
                    </button>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClosePopover}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right", // Ensures the Popover's top right corner aligns with the anchor point
                      }}
                      PaperProps={{
                        elevation: 0, // This will remove the shadow
                        style: {
                          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
                          borderRadius: "13px",
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
                            src={"/assets/delIcon.png"}
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
            className="underline text-purple mt-4"
            style={styles.inputStyle}
            onClick={() => {
              setOpenSellerNeeds(true);
              setAddSellerKyc(true);
            }}
          >
            Add Question
          </button>
        </div>
      </div>

      <div className="border p-2 rounded-lg p-4 w-full mt-4">
        <div className="flex flex-row items-center justify-between w-full">
          <div style={styles.inputStyle}>Motivation</div>
          <div className="flex flex-row items-center gap-2">
            <div
              className="border flex flex-row items-center justify-center"
              style={{
                height: "20px",
                width: "18px",
                fontSize: 12,
                fontWeight: "700",
                borderRadius: "50%",
              }}
            >
              {SellerMotivationData?.length}
            </div>
            <button
              onClick={() => {
                setShowSellerMotivationData(!showSellerMotivationData);
              }}
            >
              {showSellerMotivationData ? (
                <CaretUp size={25} weight="bold" />
              ) : (
                <CaretDown size={25} weight="bold" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-[#98989810] p-2">
          {showSellerMotivationData && (
            <div>
              {SellerMotivationData.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-row items-center justify-between ">
                    <div style={styles.inputStyle}>{item.question}</div>
                    <button
                      aria-describedby={id}
                      onClick={(event) => {
                        handleOpenPopover(event, item);
                      }}
                    >
                      <DotsThree size={35} weight="bold" />
                    </button>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClosePopover}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right", // Ensures the Popover's top right corner aligns with the anchor point
                      }}
                      PaperProps={{
                        elevation: 0, // This will remove the shadow
                        style: {
                          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
                          borderRadius: "13px",
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
                            src={"/assets/delIcon.png"}
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
            className="underline text-purple mt-4"
            style={styles.inputStyle}
            onClick={() => {
              setOpenSelerMotivation(true);
              setAddSellerKyc(true);
            }}
          >
            Add Question
          </button>
        </div>
      </div>

      <div className="border p-2 rounded-lg p-4 w-full mt-4">
        <div className="flex flex-row items-center justify-between w-full">
          <div style={styles.inputStyle}>Urgency</div>
          <div className="flex flex-row items-center gap-2">
            <div
              className="border flex flex-row items-center justify-center"
              style={{
                height: "20px",
                width: "18px",
                fontSize: 12,
                fontWeight: "700",
                borderRadius: "50%",
              }}
            >
              {SellerUrgencyData?.length}
            </div>
            <button
              onClick={() => {
                setShowSellerUrgencyData(!showSellerUrgencyData);
              }}
            >
              {showSellerUrgencyData ? (
                <CaretUp size={25} weight="bold" />
              ) : (
                <CaretDown size={25} weight="bold" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 bg-[#98989810] p-2">
          {showSellerUrgencyData && (
            <div>
              {SellerUrgencyData.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-row items-center justify-between">
                    <div style={styles.inputStyle}>{item.question}</div>
                    <button
                      aria-describedby={id}
                      onClick={(event) => {
                        handleOpenPopover(event, item);
                      }}
                    >
                      <DotsThree size={35} weight="bold" />
                    </button>
                    <Popover
                      id={id}
                      open={open}
                      anchorEl={anchorEl}
                      onClose={handleClosePopover}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "right", // Ensures the Popover's top right corner aligns with the anchor point
                      }}
                      PaperProps={{
                        elevation: 0, // This will remove the shadow
                        style: {
                          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
                          borderRadius: "13px",
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
                              src={"/assets/delIcon.png"}
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
            className="underline text-purple mt-4"
            style={styles.inputStyle}
            onClick={() => {
              setAddSellerKyc(true);
              setOpenSellerUrgency(true);
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
        // onClose={() => setAddSellerKyc(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="sm:w-[760px] w-10/12 h-[85vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: "none" }}
        >
          <div className="flex flex-row justify-center w-full h-[100%]">
            <div
              className="w-full h-[100%]"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-end items-center">
                {/* <Image src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' /> */}
                <button
                  onClick={() => {
                    setAddSellerKyc(false);
                    setOpenSelerMotivation(false);
                    setOpenSellerUrgency(false);
                    setOpenSellerNeeds(false);
                  }}
                >
                  <Image
                    src={"/assets/crossIcon.png"}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>

              <AddSellerKyc
                mainAgentId={mainAgentId}
                hideTitle={true}
                handleCloseSellerKyc={handleCloseSellerKyc}
                handleAddSellerKycData={handleAddSellerKycData}
                OpenSellerNeeds={OpenSellerNeeds}
                OpenSelerMotivation={OpenSelerMotivation}
                OpenSellerUrgency={OpenSellerUrgency}
                //sending already existing questions
                SellerNeedData={SellerNeedData}
                SellerMotivationData={SellerMotivationData}
                SellerUrgencyData={SellerUrgencyData}
                allKYCs={kycsData}
                selectedUser = {selectedUser}
              />

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      {/* code for buyer kys */}

      {CanShowBuyerKycs() && (
        <div style={styles.headingStyle} className="mt-4">
          KYC - Buyer
        </div>
      )}

      {CanShowBuyerKycs() && (
        <>
          <div className="border p-2 rounded-lg p-4 w-full mt-4">
            <div className="flex flex-row items-center justify-between w-full">
              <div style={styles.inputStyle}>Need</div>
              <div className="flex flex-row items-center gap-2">
                <div
                  className="border flex flex-row items-center justify-center"
                  style={{
                    height: "20px",
                    width: "18px",
                    fontSize: 12,
                    fontWeight: "700",
                    borderRadius: "50%",
                  }}
                >
                  {BuyerNeedData.length}
                </div>
                <button
                  onClick={() => {
                    setShowBuyerNeedData(!showBuyerNeedData);
                  }}
                >
                  {showBuyerNeedData ? (
                    <CaretUp size={25} weight="bold" />
                  ) : (
                    <CaretDown size={25} weight="bold" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 bg-[#98989810] p-2">
              {showBuyerNeedData && (
                <div>
                  {BuyerNeedData.map((item, index) => (
                    <div key={index}>
                      <div className="flex flex-row items-center justify-between">
                        <div>{item.question}</div>
                        <button
                          aria-describedby={buyerId}
                          onClick={(event) => {
                            handleOpenBuyerKycPopover(event, item);
                          }}
                        >
                          <DotsThree size={35} weight="bold" />
                        </button>
                        <Popover
                          id={buyerId}
                          open={openBuyerKyc}
                          anchorEl={BuyerAnchor}
                          onClose={handleClosePopover}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right", // Ensures the Popover's top right corner aligns with the anchor point
                          }}
                          PaperProps={{
                            elevation: 0, // This will remove the shadow
                            style: {
                              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
                              borderRadius: "13px",
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
                                src={"/assets/delIcon.png"}
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
                className="underline text-purple"
                style={styles.inputStyle}
                onClick={() => {
                  setAddBuyerKyc(true);
                }}
              >
                Add Question
              </button>
            </div>
          </div>

          <div className="border p-2 rounded-lg p-4 w-full mt-4">
            <div className="flex flex-row items-center justify-between w-full">
              <div style={styles.inputStyle}>Motivation</div>
              <div className="flex flex-row items-center gap-2">
                <div
                  className="border flex flex-row items-center justify-center"
                  style={{
                    height: "20px",
                    width: "18px",
                    fontSize: 12,
                    fontWeight: "700",
                    borderRadius: "50%",
                  }}
                >
                  {BuyerMotivationData.length}
                </div>
                <button
                  onClick={() => {
                    setShowBuyerMotivationData(!showBuyerMotivationData);
                  }}
                >
                  {showBuyerMotivationData ? (
                    <CaretUp size={25} weight="bold" />
                  ) : (
                    <CaretDown size={25} weight="bold" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 bg-[#98989810] p-2">
              {showBuyerMotivationData && (
                <div>
                  {BuyerMotivationData.map((item, index) => (
                    <div key={index}>
                      <div className="flex flex-row items-center justify-between ">
                        <div>{item.question}</div>
                        <button
                          aria-describedby={buyerId}
                          onClick={(event) => {
                            handleOpenBuyerKycPopover(event, item);
                          }}
                        >
                          <DotsThree size={35} weight="bold" />
                        </button>
                        <Popover
                          id={buyerId}
                          open={openBuyerKyc}
                          anchorEl={BuyerAnchor}
                          onClose={handleClosePopover}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right", // Ensures the Popover's top right corner aligns with the anchor point
                          }}
                          PaperProps={{
                            elevation: 0, // This will remove the shadow
                            style: {
                              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
                              borderRadius: "13px",
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
                                src={"/assets/delIcon.png"}
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
                className="underline text-purple"
                style={styles.inputStyle}
                onClick={() => {
                  setAddBuyerKyc(true);
                  setOpenBuyerMotivation(true);
                }}
              >
                Add Question
              </button>
            </div>
          </div>

          <div className="border p-2 rounded-lg p-4 w-full mt-4">
            <div className="flex flex-row items-center justify-between w-full">
              <div style={styles.inputStyle}>Urgency</div>
              <div className="flex flex-row items-center gap-2">
                <div
                  className="border flex flex-row items-center justify-center"
                  style={{
                    height: "20px",
                    width: "18px",
                    fontSize: 12,
                    fontWeight: "700",
                    borderRadius: "50%",
                  }}
                >
                  {BuyerUrgencyData.length}
                </div>
                <button
                  onClick={() => {
                    setShowBuyerUrgencyData(!showBuyerUrgencyData);
                  }}
                >
                  {showBuyerUrgencyData ? (
                    <CaretUp size={25} weight="bold" />
                  ) : (
                    <CaretDown size={25} weight="bold" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 bg-[#98989810] p-2">
              {showBuyerUrgencyData && (
                <div>
                  {BuyerUrgencyData.map((item, index) => (
                    <div key={index}>
                      <div className="flex flex-row items-center justify-between">
                        <div>{item.question}</div>
                        <button
                          aria-describedby={buyerId}
                          onClick={(event) => {
                            handleOpenBuyerKycPopover(event, item);
                          }}
                        >
                          <DotsThree size={35} weight="bold" />
                        </button>
                        <Popover
                          id={buyerId}
                          open={openBuyerKyc}
                          anchorEl={BuyerAnchor}
                          onClose={handleClosePopover}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right", // Ensures the Popover's top right corner aligns with the anchor point
                          }}
                          PaperProps={{
                            elevation: 0, // This will remove the shadow
                            style: {
                              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.05)",
                              borderRadius: "13px",
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
                                src={"/assets/delIcon.png"}
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
                className="underline text-purple"
                style={styles.inputStyle}
                onClick={() => {
                  setAddBuyerKyc(true);
                  setOpenBuyerUrgency(true);
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
        videoTitle="Learn about asking questions (KYC)"
        videoUrl={HowtoVideos.KycQuestions}
      />
      <div className="hidden lg:inline  xl:w-[270px] lg:w-[270px] -ml-4 mt-12">
        <VideoCard
          duration="1 min 38 sec"
          horizontal={false}
          playVideo={() => {
            setIntroVideoModal(true);
          }}
          title="Learn about asking questions (KYC)"
        />
      </div>
    </div>

      {/* Add modals code */}
      <Modal
        open={addBuyerKyc}
        // onClose={() => setAddBuyerKyc(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="sm:w-[760px] h-[85vh]"
          sx={{ ...styles.modalsStyle, scrollbarWidth: "none" }}
        >
          <div className="flex flex-row justify-center w-full h-[100%]">
            <div
              className="w-full h-[100%]"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-end items-center">
                {/* <Image src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' /> */}
                <button
                  onClick={() => {
                    setAddBuyerKyc(false);
                    setAddBuyerKyc(false);
                    setOpenBuyerMotivation(false);
                    setOpenBuyerUrgency(false);
                  }}
                >
                  <Image
                    src={"/assets/crossIcon.png"}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>

              <AddBuyerKyc
                handleCloseSellerKyc={handleCloseSellerKyc}
                handleAddBuyerKycData={handleAddBuyerKycData}
                OpenBuyerMotivation={OpenBuyerMotivation}
                OpenBuyerUrgency={OpenBuyerUrgency}
                BuyerNeedData={BuyerNeedData}
                BuyerMotivationData={BuyerMotivationData}
                BuyerUrgencyData={BuyerUrgencyData}
                mainAgentId={mainAgentId}
                selectedUser = {selectedUser}
                hideTitle={true}
              />

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default KYCs;
