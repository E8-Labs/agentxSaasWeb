import Body from "@/components/onboarding/Body";
import Header from "@/components/onboarding/Header";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Footer from "@/components/onboarding/Footer";
//import for input drop down menu
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { CircularProgress, Modal, Popover } from "@mui/material";
import Apis from "../apis/Apis";
import axios from "axios";
import PurchaseNumberSuccess from "./PurchaseNumberSuccess";
import { Key } from "@phosphor-icons/react";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import PhoneInput from "react-phone-input-2";
import { getLocalLocation } from "../onboarding/services/apisServices/ApiService";
import VideoCard from "./VideoCard";
import IntroVideoModal from "./IntroVideoModal";
import ClaimNumber from "../dashboard/myagentX/ClaimNumber";
import { HowtoVideos, PersistanceKeys } from "@/constants/Constants";
import UpgardView from "@/constants/UpgardView";
import { useUser } from "@/hooks/redux-hooks";

const CreateAgent4 = ({ handleContinue, handleBack }) => {
  const timerRef = useRef(null);
  const router = useRouter();
  const selectRef = useRef(null);

  // Redux user state
  const { user: userData, setUser: setUserData, token } = useUser();

  // Log current userData state
  console.log("🔥 CREATEAGENT4 - Current userData from Redux:", userData);
  console.log("🔥 CREATEAGENT4 - Agency capabilities:", userData?.agencyCapabilities);
  console.log("🔥 CREATEAGENT4 - Plan capabilities:", userData?.planCapabilities);

  //agent type
  const [agentType, setAgentType] = useState("");
  //variable for video card
  const [introVideoModal, setIntroVideoModal] = useState(false);
  const [toggleClick, setToggleClick] = useState(false);
  const [selectNumber, setSelectNumber] = useState("");
  const [openCalimNumDropDown, setOpenCalimNumDropDown] = useState(false);
  const [reassignLoader, setReassignLoader] = useState(null);
  const [useOfficeNumber, setUseOfficeNumber] = useState(false);
  const [userSelectedNumber, setUserSelectedNumber] = useState("");
  const [showOfficeNumberInput, setShowOfficeNumberInput] = useState(false);
  const [officeNumber, setOfficeNumber] = useState("");
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [previousNumber, setPreviousNumber] = useState([]);
  //agent details variable
  const [AgentData, setAgentData] = useState(null);
  //show reassign btn or not
  const [showConfirmationModal, setShowConfirmationModal] = useState(null);
  const [showReassignBtn, setShowReassignBtn] = useState(false);
  const [showGlobalBtn, setShowGlobalBtn] = useState(true);
  //code for find numbers
  const [findNumber, setFindNumber] = useState("");
  const [findeNumberLoader, setFindeNumberLoader] = useState(false);
  const [foundeNumbers, setFoundeNumbers] = useState([]);
  const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null);
  const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null);
  const [purchaseLoader, setPurchaseLoader] = useState(false);
  const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] =
    useState(false);

  const [callBackNumber, setCallBackNumber] = useState("");
  const [countryCode, setCountryCode] = useState("us");
  const [assignLoader, setAssignLoader] = useState(false);
  const [shouldContinue, setShouldContinue] = useState(true);
  const [errorMessage, setErrorMessage] = useState(false);
  const [officeErrorMessage, setOfficeErrorMessage] = useState(false);

  const [updatedUserData, setUpdatedUserData] = useState(null);

  useEffect(() => {
    const localData = localStorage.getItem("claimNumberData");

    const AT = localStorage.getItem("agentType");
    if (AT) {
      let t = JSON.parse(AT);
      console.log("Agent type is", t);
      setAgentType(t);
    }
    let loc = getLocalLocation();
    setCountryCode(loc);



    if (localData) {
      const claimNumberDetails = JSON.parse(localData);


      // //console.log;

      // if (claimNumberDetails.officeNo) {
      //   // //console.log;

      //   setUseOfficeNumber(true);
      //   setShowOfficeNumberInput(true);
      //   setOfficeNumber(claimNumberDetails.officeNo);
      // } else {
      //   setUserSelectedNumber(claimNumberDetails.usernumber2);
      // }
      // setCallBackNumber(claimNumberDetails.callBackNumber);
      // setSelectNumber(claimNumberDetails.userNumber);
      // setShouldContinue(false);


    }
    getAvailabePhoneNumbers();
    const localAgentsData = localStorage.getItem("agentDetails");
    if (localAgentsData) {
      const agetnDetails = JSON.parse(localAgentsData);
      // //console.log;
      setAgentData(agetnDetails?.agents[0]);
      if (agetnDetails?.agents?.length === 2) {
        setShowReassignBtn(false);
      } else if (agetnDetails?.agents[0]?.agentType === "inbound") {
        setShowReassignBtn(true);
        setShowGlobalBtn(false);
      }
    }
  }, []);

  useEffect(() => {
    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;
    // //console.log;
    if (
      selectNumber || //&&
      // callBackNumber ||
      // !toggleClick &&
      // userSelectedNumber
      officeNumber ||
      isInboundOnly()
    ) {
      setShouldContinue(false);
    } else {
      setShouldContinue(true);
    }
  }, [
    selectNumber,
    userSelectedNumber,
    callBackNumber,
    toggleClick,
    useOfficeNumber,
    officeNumber,
  ]);

  function isInboundOnly() {
    const localAgentsData = localStorage.getItem("agentDetails");
    if (localAgentsData) {
      const agentDetails = JSON.parse(localAgentsData);
      // //console.log;
      // setAgentData(agetnDetails.agents[0]);
      if (
        agentDetails.agents.length === 1 &&
        agentDetails?.agents[0]?.agentType == "inbound"
      ) {
        return true;
      }
    }
    return false;
  }

  //code to format the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
    );
    //// //console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : "Invalid phone number";
  };

  const handleSelectNumber = (event) => {
    setSelectNumber(event.target.value);
  };

  const handleToggleClick = () => {
    setToggleClick(!toggleClick);
  };

  //code to use office number
  const handleOfficeNumberClick = () => {
    setUserSelectedNumber("");
    setUseOfficeNumber(!useOfficeNumber);
    setShowOfficeNumberInput(!showOfficeNumberInput);
  };

  const handleSelectedNumberClick = (item) => {
    // //console.log;
    setOfficeNumber("");
    setShowOfficeNumberInput(false);
    setUseOfficeNumber(false);
    setUserSelectedNumber(item);
  };

  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false);
  };

  //code for phone number inputs functions
  const handleCallBackNumberChange = (phone) => {
    setCallBackNumber(phone);
    validatePhoneNumber(phone);

    if (!phone) {
      setErrorMessage("");
      setOfficeErrorMessage("");
    }
  };

  //code for reassigning the number api
  const handleReassignNumber = async (item) => {
    try {
      // //console.log;

      setReassignLoader(item);
      // Use Redux token instead of localStorage
      if (!token) {
        console.error("No token available");
        setReassignLoader(null);
        return;
      }
      const agentDetails = localStorage.getItem("agentDetails");
      let MyAgentData = null;

      if (agentDetails) {
        // //console.log;
        setShowConfirmationModal(null);
        const agentData = JSON.parse(agentDetails);
        // //console.log;
        MyAgentData = agentData;
      }

      const ApiPath = Apis.reassignNumber;

      const ApiData = {
        agentId: item.claimedBy.id, //MyAgentData.agents[0].id,
        phoneNumber: item.phoneNumber,
        newAgentId: MyAgentData.agents[0].id,
      };
      // //console.log;

      // //console.log;
      // //console.log;
      // //console.log;

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        setSelectNumber(
          item?.phoneNumber?.startsWith("+")
            ? item.phoneNumber.slice(1)
            : item.phoneNumber
        );
        setOpenCalimNumDropDown(false);
        //code to close the dropdown
        if (selectRef.current) {
          selectRef.current.blur(); // Triggers dropdown close
        }

        // if (response.data.status === true) {
        //     setSelectNumber(phoneNumber);
        // } else {
        //     setSelectNumber(phoneNumber);
        // }
      }
    } catch (error) {
      // console.error("Error occured in reassign the number api:", error);
    } finally {
      setReassignLoader(null);
      // //console.log;
    }
  };

  //code for office number change
  const handleOfficeNumberChange = (phone, e) => {
    setOfficeNumber(phone);
    validatePhoneNumber(phone, e);
    setUserSelectedNumber("");

    if (!phone) {
      setErrorMessage("");
      setOfficeErrorMessage("");
    }
  };

  //phone validation
  //number validation
  const validatePhoneNumber = (phoneNumber, e) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(
      `+${phoneNumber}`,
      countryCode?.toUpperCase()
    );
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      if (e) {
        setOfficeErrorMessage("Invalid");
      } else {
        setErrorMessage("Invalid");
      }
    } else {
      setErrorMessage("");
      setOfficeErrorMessage("");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // setCheckPhoneResponse(null);
      // //console.log;

      timerRef.current = setTimeout(() => {
        // checkPhoneNumber(phoneNumber);
      }, 300);
    }
  };

  //code to select Purchase number
  const handlePurchaseNumberClick = (item, index) => {
    // //console.log;
    localStorage.setItem("numberPurchased", JSON.stringify(item));
    setSelectedPurchasedNumber((prevId) => (prevId === item ? null : item));
    setSelectedPurchasedIndex((prevId) => (prevId === index ? null : index));
  };

  //get available phonenumbers
  const getAvailabePhoneNumbers = async () => {
    try {
      console.log("Trigered the get numbers api");
      // Use Redux token instead of AuthToken()
      if (!token) {
        console.error("No token available");
        return;
      }

      let userId = null;
      const U = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency);
      console.log("check 343")
      if (U) {
        // const d = JSON.parse(U);
        // console.log("Subaccount data recieved on createagent_1 screen is", d);
        // userId = d.subAccountData.id;
        try {
          const d = JSON.parse(U);
          console.log("Subaccount data recieved");
          userId = d.subAccountData.id;
        } catch (e) {
          console.error("Failed to parse isFromAdminOrAgency", e);
        }
      }

      // //console.log;
      let ApiPath = null;
      if (U) {
        console.log("UserId is", userId);
        ApiPath = `${Apis.userAvailablePhoneNumber}?userId=${userId}`;
      } else {
        console.log("UserId is not found");
        ApiPath = Apis.userAvailablePhoneNumber;
      }
      console.log("ApiPath on create agent is", ApiPath);
      // //console.log;

      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (response) {
        console.log("Numbers list iis", response.data.data);
        setPreviousNumber(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in: ", error);
    } finally {
      // //console.log;
    }
  };

  //get main agent id
  const AssignNumber = async () => {
    // //console.log;
    // const isInboundOnly = isInboundOnly()
    try {
      setAssignLoader(true);
      // Use Redux token instead of localStorage
      if (!token) {
        console.error("No token available");
        setAssignLoader(false);
        return;
      }
      let MyAgentData = null;
      const agentDetails = localStorage.getItem("agentDetails");

      if (agentDetails) {
        // //console.log;
        const agentData = JSON.parse(agentDetails);
        // //console.log;
        MyAgentData = agentData;
      }

      const formData = new FormData();
      formData.append("phoneNumber", selectNumber);
      if (userSelectedNumber) {
        formData.append("callbackNumber", userSelectedNumber.phoneNumber);
      } else {
        formData.append("callbackNumber", officeNumber);
      }
      formData.append("liveTransferNumber", callBackNumber);
      formData.append("mainAgentId", MyAgentData.id);
      formData.append("liveTransfer", !toggleClick);

      const ApiPath = Apis.asignPhoneNumber;

      for (let [key, value] of formData.entries()) {
        console.log(`${key} = ${value}`);
      }
      // return;
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (response) {
        console.log("Response of assign number is", response.data);
        console.log("Check 1")
        if (response.data.status === true) {
          setOpenCalimNumDropDown(false);
          handleContinue();
          const calimNoData = {
            officeNo: officeNumber,
            userNumber: selectNumber,
            usernumber2: userSelectedNumber,
            callBackNumber: callBackNumber,
          };
          localStorage.setItem("claimNumberData", JSON.stringify(calimNoData));
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("General error:", error);
      }
    } finally {
      // //console.log;
      setAssignLoader(false);
    }
  };

  // const PhoneNumbers = [
  //     {
  //         id: 1,
  //         number: "03011958712"
  //     },
  //     {
  //         id: 2,
  //         number: "03281575712"
  //     },
  //     {
  //         id: 3,
  //         number: "03058191079"
  //     },
  // ]

  const styles = {
    headingStyle: {
      fontSize: 15,
      fontWeight: "600",
    },
    inputStyle: {
      fontSize: 14,
      fontWeight: "400",
      color: "#000000",
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: "500",
      color: "#000000",
    },
    callBackStyles: {
      // height: "71px", //width: "210px",
      border: "1px solid #15151550",
      borderRadius: "20px",
      fontWeight: "500",
      fontSize: 15,
    },
    claimPopup: {
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
    findNumberTitle: {
      fontSize: 17,
      fontWeight: "500",
    },
    findNumberDescription: {
      fontSize: 15,
      fontWeight: "500",
    },
  };

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <div
        className="bg-white sm:rounded-2xl w-full sm:w-10/12 h-[90vh] py-4 flex flex-col justify-between"
      // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <div>
          {/* Video Card */}
          <IntroVideoModal
            open={introVideoModal}
            onClose={() => setIntroVideoModal(false)}
            videoTitle="Learn about phone numbers"
            videoUrl={HowtoVideos.LetsTalkDigits}
          />
          {/* header */}
          <Header />
          {/* Body */}
          <div
            className="-ml-4 lg:flex hidden  xl:w-[350px] lg:w-[350px]"
            style={{
              position: "absolute",
              // left: "18%",
              // translate: "-50%",
              // left: "14%",
              top: "20%",
              // backgroundColor: "red"
            }}
          >
            <VideoCard
              duration={"1 min 52 sec"}
              horizontal={false}
              playVideo={() => {
                setIntroVideoModal(true);
              }}
              title="Learn about phone numbers"
            />
          </div>
          <div
            className="flex flex-col items-center px-4 w-full h-[67vh] overflow-auto"
            style={{ scrollbarWidth: "none" }}
          >
            <div
              className="mt-6 w-11/12 md:text-4xl text-lg font-[600]"
              style={{ textAlign: "center" }}
            // onClick={handleContinue}
            >
              {`Let's talk digits`}
            </div>
            <div
              className="mt-8 w-11/12 sm:w-6/12 gap-4 flex flex-col h-[65vh] overflow-auto"
              // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
              style={{ scrollbarWidth: "none" }}
            >
              <div style={styles.headingStyle}>
                {`Select a phone number you'd like to use to call with`}
              </div>

              <div
                className="border rounded-lg"
                style={{
                  height: "clamp(50px, 60px, 70px)",
                  fontSize: "clamp(12px, 2.5vw, 16px)"
                }}
              >
                <Box className="w-full h-full">
                  <FormControl className="w-full h-full">
                    <Select
                      ref={selectRef}
                      open={openCalimNumDropDown}
                      onClose={() => setOpenCalimNumDropDown(false)}
                      onOpen={() => setOpenCalimNumDropDown(true)}
                      className="border-none rounded-2xl outline-none"
                      displayEmpty
                      value={selectNumber}
                      // onChange={handleSelectNumber}
                      onChange={(e) => {
                        let value = e.target.value;
                        console.log("Value updated bcz clicked on menu item");
                        if (agentType?.agentType !== "inbound") {
                          console.log("Value for outbound is", value);
                          setSelectNumber(value);
                          setOpenCalimNumDropDown(false);
                        }
                      }}
                      renderValue={(selected) => {
                        if (selected === "") {
                          return <div>Select Number</div>;
                        }
                        return selected;
                      }}
                      sx={{
                        ...styles.dropdownMenu,
                        backgroundColor: "#FFFFFF",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                      }}
                    >
                      {previousNumber.map((item, index) => (
                        <MenuItem
                          key={index}
                          style={{
                            ...styles.dropdownMenu,
                            fontSize: "clamp(12px, 2.5vw, 16px)",
                            padding: "clamp(8px, 1.5vw, 16px)",
                            minHeight: "clamp(40px, 55px, 65px)",
                          }}
                          value={
                            item?.phoneNumber?.startsWith("+")
                              ? item?.phoneNumber.slice(1)
                              : item?.phoneNumber
                          }
                          disabled={
                            typeof selectNumber === "string" &&
                            selectNumber.replace("+", "") === item.phoneNumber.replace("+", "")
                          }
                          className="flex flex-row items-center gap-2"
                          onClick={(e) => {
                            console.log("Menu item clicked");
                            // return;
                            if (showReassignBtn && item?.claimedBy) {
                              e.stopPropagation();
                              setShowConfirmationModal(item);
                              console.log(
                                "Hit release number api",
                                item
                              );
                              // AssignNumber
                            }else{
                              AssignNumber();
                            }
                          }}
                        >
                          <div
                          // (
                          //   console.log(
                          //     `Comparing names: agentName="${agentType?.agentName}", claimedBy="${item.claimedBy.name}", equal=${agentType?.agentName?.trim() === item.claimedBy.name?.trim()}`
                          //   ),
                          //   agentType?.agentName?.trim() !== item.claimedBy.name?.trim() &&
                          >
                            {item.phoneNumber}
                          </div>
                          {showReassignBtn && (
                            <div>
                              {item.claimedBy && (
                                <div
                                  className="flex flex-row items-center"
                                  onClick={(e) => {
                                    if (item?.claimedBy) {
                                      e.stopPropagation();
                                      setShowConfirmationModal(item);
                                    }
                                  }}
                                >
                                  <div className="text-[#15151570] me-1">
                                    (Claimed by {item.claimedBy.name})
                                  </div>
                                  {reassignLoader?.claimedBy?.id ===
                                    item.claimedBy.id ? (
                                    <CircularProgress size={15} />
                                  ) : (
                                    <button
                                      className="text-purple underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // handleReassignNumber(item);
                                        setShowConfirmationModal(item);
                                        // handleReassignNumber(e.target.value)
                                      }}
                                    >
                                      Reassign
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </MenuItem>
                      ))}
                      <MenuItem
                        style={styles.dropdownMenu}
                        value={showGlobalBtn ? 16505403715 : ""}
                      >
                        +16505403715
                        {showGlobalBtn && " (available for testing calls only)"}
                        {showGlobalBtn == false &&
                          " (Only for outbound agents. You must buy a number)"}
                      </MenuItem>
                      <div
                        className="ms-4"
                        style={{ ...styles.inputStyle, color: "#00000070" }}
                      >
                        <i>Get your own unique phone number.</i>{" "}
                        <button
                          className="text-purple underline"
                          style={{ fontSize: "clamp(10px, 2vw, 14px)" }}
                          onClick={() => {
                            setShowClaimPopup(true);
                          }}
                        >
                          Claim one
                        </button>
                      </div>
                    </Select>
                  </FormControl>
                </Box>
              </div>

              {/* Code for Purchase and find number popup */}
              {showClaimPopup && (
                <ClaimNumber
                  showClaimPopup={showClaimPopup}
                  handleCloseClaimPopup={handleCloseClaimPopup}
                  setOpenCalimNumDropDown={setOpenCalimNumDropDown}
                  setSelectNumber={(number)=>{
                    console.log("Number is", number)
                    setSelectNumber(number)
                  }}
                  setPreviousNumber={(numbers) => {
                    console.log("Numbers are", numbers)
                    setPreviousNumber(numbers)
                  }}
                  previousNumber={previousNumber}
                />
              )}

              {/* Code for Purchase number success popup */}
              <Modal
                open={openPurchaseSuccessModal}
                // onClose={() => setAddKYCQuestion(false)}
                closeAfterTransition
                BackdropProps={{
                  timeout: 1000,
                  sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(20px)",
                  },
                }}
              >
                <Box
                  className="lg:w-8/12 sm:w-full w-8/12"
                  sx={styles.claimPopup}
                >
                  <div className="flex flex-row justify-center w-full">
                    <div
                      className="sm:w-8/12 w-full min-h-[50vh] max-h-[80vh] flex flex-col justify-between"
                      style={{
                        backgroundColor: "#ffffff",
                        padding: 20,
                        borderRadius: "13px",
                      }}
                    >
                      <div>
                        <div className="flex flex-row justify-end">
                          {/* <button onClick={() => { setOpenPurchaseSuccessModal(false) }}>
                                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                                    </button> */}
                        </div>
                        <PurchaseNumberSuccess
                          selectedNumber={selectedPurchasedNumber}
                          handleContinue={() => {
                            setOpenPurchaseSuccessModal(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Box>
              </Modal>

              <button
                onClick={() => {
                  // setOpenPurchaseSuccessModal(true);
                }}
                style={styles.headingStyle}
                className="text-start"
              >
                What callback number should we use if someone requests one
                during a call?
              </button>

              <div
                className="flex flex-row items-center overflow-x-auto"
                style={{
                  scrollbarWidth: "none",
                  overflowY: "hidden",
                  height: "clamp(50px,60px , 70px)",
                  flexShrink: 0,
                  paddingBottom: "3px",
                  gap: "clamp(8px, 2vw, 16px)",
                }}
              >
                <div
                  className="flex flex-row items-center min-w-full"
                  style={{ gap: "clamp(8px, 2vw, 16px)" }}
                >
                  {previousNumber.map((item, index) => (
                    <button
                      key={index}
                      className="flex flex-row items-center justify-center rounded-lg transition-all duration-200"
                      style={{
                        ...styles.callBackStyles,
                        width: "clamp(120px, 28vw, 280px)",
                        height: "clamp(35px, 45px, 55px)",
                        fontSize: "clamp(11px, 2.2vw, 17px)",
                        border:
                          userSelectedNumber === item
                            ? "2px solid #7902DF"
                            : "1px solid #15151550",
                        backgroundColor:
                          userSelectedNumber === item
                            ? "#402FFF15"
                            : "#fff",
                        minWidth: "clamp(100px, 22vw, 180px)",
                        maxWidth: "280px",
                        whiteSpace: "nowrap",
                        padding: "clamp(8px, 1.5vw, 16px)",
                      }}
                      onClick={() => handleSelectedNumberClick(item)}
                    >
                      Use {formatPhoneNumber(item.phoneNumber)}
                    </button>
                  ))}
                  <button
                    className="flex flex-row items-center justify-center rounded-lg transition-all duration-200"
                    style={{
                      ...styles.callBackStyles,
                      width: "clamp(110px, 25vw, 250px)",
                      height: "clamp(35px, 45px, 55px)",
                      fontSize: "clamp(11px, 2.2vw, 17px)",
                      border: useOfficeNumber
                        ? "2px solid #7902DF"
                        : "1px solid #15151550",
                      backgroundColor: useOfficeNumber
                        ? "#402FFF15"
                        : "#fff",
                      minWidth: "clamp(90px, 20vw, 160px)",
                      maxWidth: "250px",
                      whiteSpace: "nowrap",
                      padding: "clamp(5px, 8vw, 11px)",
                    }}
                    onClick={handleOfficeNumberClick}
                  >
                    Use my cell or office number
                  </button>
                </div>
              </div>

              {showOfficeNumberInput ? (
                <div className="w-full">
                  <div className="mt-2" style={styles.dropdownMenu}>
                    Enter your cell or office number
                  </div>

                  <PhoneInput
                    className="border outline-none bg-white"
                    country={"us"} // restrict to US only
                    onlyCountries={["us"]}
                    disableDropdown={true}
                    countryCodeEditable={false}
                    disableCountryCode={false}
                    value={officeNumber}
                    onChange={handleOfficeNumberChange}
                    // placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                    placeholder={"Enter Phone Number"}
                    // disabled={loading} // Disable input if still loading
                    style={{ borderRadius: "7px" }}
                    inputStyle={{
                      width: "100%",
                      borderWidth: "0px",
                      backgroundColor: "transparent",
                      paddingLeft: "60px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                    }}
                    buttonStyle={{
                      border: "none",
                      backgroundColor: "transparent",
                    }}
                    dropdownStyle={{
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                  // defaultMask={locationLoader ? "Loading..." : undefined}
                  />
                  {officeErrorMessage && (
                    <div
                      className="mt-2"
                      style={{ fontWeight: "500", fontSize: 11, color: "red" }}
                    >
                      {officeErrorMessage}
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}

              {/* Phone number input here */}
              {

                (userData?.userRole === "AgencySubAccount" && userData?.agencyCapabilities?.allowLiveCallTransfer === false)
                  // userData?.agencyCapabilities?.allowLiveCallTransfer === true || userData?.planCapabilities?.allowLiveCallTransfer === true) 
                  ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <UpgardView
                        title={"Enable Live Transfer"}
                        subTitle={"Allow your AI to initiate live transfers during the call. This allows your team to receive hot leads mid conversation."}
                        userData={userData}
                        onUpgradeSuccess={(userData) => {
                          console.log("🔥 CREATEAGENT4 - LT:Upgrade successful", userData);
                          console.log("🔥 CREATEAGENT4 - UserData type check:", {
                            hasToken: userData?.hasOwnProperty('token'),
                            hasUser: userData?.hasOwnProperty('user'),
                            isFullFormat: userData?.hasOwnProperty('token') && userData?.hasOwnProperty('user'),
                            dataStructure: Object.keys(userData || {})
                          });

                          console.log("🔥 CREATEAGENT4 - About to call setUpdatedUserData");
                          setUpdatedUserData(userData);
                          console.log("🔥 CREATEAGENT4 - About to call setUserData (Redux)");
                          setUserData(userData);
                          console.log("🔥 CREATEAGENT4 - Both setters called successfully");

                          // Verify localStorage was updated
                          setTimeout(() => {
                            const localStorageData = localStorage.getItem("User");
                            console.log("🔥 CREATEAGENT4 - localStorage after update:", localStorageData ? JSON.parse(localStorageData) : null);
                          }, 100);
                        }}
                      // handleContinue={handleContinue}
                      />
                    </div>

                  ) : (
                    userData?.planCapabilities?.allowLiveCallTransfer === true ? (
                      <div>
                        <div className="w-full">
                          <div style={styles.headingStyle}>
                            What number should we forward live transfers to when a lead
                            wants to talk to you?
                          </div>
                          <PhoneInput
                            className="border outline-none bg-white"
                            country={"us"} // restrict to US only
                            onlyCountries={["us"]}
                            disableDropdown={true}
                            countryCodeEditable={false}
                            disableCountryCode={false}
                            value={callBackNumber}
                            onChange={handleCallBackNumberChange}
                            // placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                            placeholder={"Enter Phone Number"}
                            // disabled={loading} // Disable input if still loading
                            style={{ borderRadius: "7px" }}
                            inputStyle={{
                              width: "100%",
                              borderWidth: "0px",
                              backgroundColor: "transparent",
                              paddingLeft: "60px",
                              paddingTop: "12px",
                              paddingBottom: "12px",
                            }}
                            buttonStyle={{
                              border: "none",
                              backgroundColor: "transparent",
                            }}
                            dropdownStyle={{
                              maxHeight: "150px",
                              overflowY: "auto",
                            }}
                          // defaultMask={locationLoader ? "Loading..." : undefined}
                          />
                          <div style={{ fontWeight: "500", fontSize: 11, color: "red" }}>
                            {errorMessage}
                          </div>
                        </div>
                        <div className="flex flex-row items-center gap-4 justify-start">
                          <button onClick={handleToggleClick}>
                            {toggleClick ? (
                              <div
                                className="bg-purple flex flex-row items-center justify-center rounded"
                                style={{ height: "24px", width: "24px" }}
                              >
                                <Image
                                  src={"/assets/whiteTick.png"}
                                  height={8}
                                  width={10}
                                  alt="*"
                                />
                              </div>
                            ) : (
                              <div
                                className="bg-none border-2 flex flex-row items-center justify-center rounded"
                                style={{ height: "24px", width: "24px" }}
                              ></div>
                            )}
                          </button>
                          <div
                            style={{ color: "#151515", fontSize: 15, fontWeight: "500" }}
                          >
                            {`Don't make live transfers. Prefer the AI Agent schedules them for a call back.`}
                          </div>
                        </div>
                      </div>
                    ) : (
                      < div className="w-full h-[40vh] sm:h-[45vh] md:h-[50vh] flex items-center justify-center -mt-6 sm:-mt-8 md:-mt-10">
                        <div className="w-full h-full flex items-center justify-center">
                          <UpgardView
                            title={"Enable Live Transfer"}
                            subTitle={"Allow your AI to initiate live transfers during the call. This allows your team to receive hot leads mid conversation."}
                            userData={userData}
                            onUpgradeSuccess={(userData) => {
                              console.log("🔥 CREATEAGENT4 - Second LT:Upgrade successful", userData);
                              console.log("🔥 CREATEAGENT4 - Second - UserData type check:", {
                                hasToken: userData?.hasOwnProperty('token'),
                                hasUser: userData?.hasOwnProperty('user'),
                                isFullFormat: userData?.hasOwnProperty('token') && userData?.hasOwnProperty('user'),
                                dataStructure: Object.keys(userData || {})
                              });

                              console.log("🔥 CREATEAGENT4 - Second - About to call setUpdatedUserData");
                              setUpdatedUserData(userData);
                              console.log("🔥 CREATEAGENT4 - Second - About to call setUserData (Redux)");
                              setUserData(userData);
                              console.log("🔥 CREATEAGENT4 - Second - Both setters called successfully");

                              // Verify localStorage was updated
                              setTimeout(() => {
                                const localStorageData = localStorage.getItem("User");
                                console.log("🔥 CREATEAGENT4 - Second - localStorage after update:", localStorageData ? JSON.parse(localStorageData) : null);
                              }, 100);
                            }}
                          // handleContinue={handleContinue}
                          />
                        </div>
                      </div>
                    )
                  )
              }

              {/* <Body /> */}
            </div>
          </div>
        </div>

        <div>
          <div>
            <ProgressBar value={33} />
          </div>

          <Footer
            handleContinue={() => {
              if (agentType?.agentType === "inbound" && !selectNumber) {
                console.log("Without api call");
                handleContinue();
              } else {
                console.log("With api call");
                AssignNumber();
              }
            }}
            handleBack={handleBack}
            registerLoader={assignLoader}
            shouldContinue={shouldContinue}
            donotShowBack={true}
          />
        </div>

        {/* Code for the confirmation of reassign button */}
        <Modal
          open={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(null);
          }}
        >
          <Box
            className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-5/12 p-8 rounded-[15px]"
            sx={{ ...styles.claimPopup, backgroundColor: "white" }}
          >
            <div style={{ width: "100%" }}>
              <div
                className="max-h-[60vh] overflow-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {/* <div style={{ width: "100%", direction: "row", display: "flex", justifyContent: "end", alignItems: "center" }}>
                <div style={{ direction: "row", display: "flex", justifyContent: "end" }}>
                  <button onClick={() => {
                    setShowWarningModal(false);
                  }} className='outline-none'>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div>
              </div> */}

                <div className="flex flex-row items-center justify-between w-full">
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: "600",
                    }}
                  >
                    Reassign Number
                  </div>
                  <button
                    onClick={() => {
                      setShowConfirmationModal(null);
                      // setSelectNumber("");
                    }}
                  >
                    <Image
                      src={"/assets/blackBgCross.png"}
                      height={20}
                      width={20}
                      alt="*"
                    />
                  </button>
                </div>

                <div
                  className="mt-8"
                  style={{
                    fontSize: 22,
                    fontWeight: "600",
                  }}
                >
                  Confirm Action
                </div>

                <p
                  className="mt-8"
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                >
                  Please confirm you would like to reassign{" "}
                  <span className="text-purple">
                    ({formatPhoneNumber(showConfirmationModal?.phoneNumber)})
                  </span>{" "}
                  to {AgentData?.name}
                  {/* {showConfirmationModal?.claimedBy?.name}. */}
                  {/* {`{${showConfirmationModal?.claimedBy?.name}}`}. */}
                </p>
              </div>

              <div className="flex flex-row items-center gap-4 mt-6">
                <button
                  className="mt-4 outline-none w-1/2"
                  style={{
                    color: "black",
                    height: "50px",
                    borderRadius: "10px",
                    width: "100%",
                    fontWeight: 600,
                    fontSize: "20",
                  }}
                  onClick={() => {
                    console.log("Discard  btn clicked");
                    setShowConfirmationModal(null);
                    setShowClaimPopup(null);
                    // setSelectNumber("");
                  }}
                >
                  Discard
                </button>
                <div className="w-full">
                  {reassignLoader ? (
                    <div className="mt-4 w-full flex flex-row items-center justify-center">
                      <CircularProgress size={25} />
                    </div>
                  ) : (
                    <button
                      className="mt-4 outline-none bg-purple w-full"
                      style={{
                        color: "white",
                        height: "50px",
                        borderRadius: "10px",
                        width: "100%",
                        fontWeight: 600,
                        fontSize: "20",
                      }}
                      onClick={() => {
                        handleReassignNumber(showConfirmationModal);
                        ////console.log
                      }}
                    >
                      {`I'm sure`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div >
  );
};

export default CreateAgent4;
