import Apis from "@/components/apis/Apis";
import PurchaseNumberSuccess from "@/components/createagent/PurchaseNumberSuccess";
import { Box, CircularProgress, Modal } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import React, { useRef, useState } from "react";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../leads/AgentSelectSnackMessage";

const ClaimNumber = ({
  showClaimPopup,
  handleCloseClaimPopup,
  setOpenCalimNumDropDown,
  setSelectNumber,
  setPreviousNumber,
  previousNumber,
  AssignNumber,
}) => {
  const timerRef = useRef(null);

  const [findNumber, setFindNumber] = useState("");
  const [findeNumberLoader, setFindeNumberLoader] = useState(false);
  const [foundeNumbers, setFoundeNumbers] = useState([]);
  const [selectedPurchasedIndex, setSelectedPurchasedIndex] = useState(null);
  const [selectedPurchasedNumber, setSelectedPurchasedNumber] = useState(null);
  const [purchaseLoader, setPurchaseLoader] = useState(false);
  const [openPurchaseSuccessModal, setOpenPurchaseSuccessModal] =
    useState(false);
  const [openPurchaseErrSnack, setOpenPurchaseErrSnack] = useState("");
  const [isSnackVisible, setIsSnackVisible] = useState(false);
  const [errorType, setErrorType] = useState(null);

  //code to select Purchase number
  const handlePurchaseNumberClick = (item, index) => {
    // //console.log;
    localStorage.setItem("numberPurchased", JSON.stringify(item));
    setSelectedPurchasedNumber((prevId) => (prevId === item ? null : item));
    setSelectedPurchasedIndex((prevId) => (prevId === index ? null : index));
  };

  // function for purchasing number api
  const handlePurchaseNumber = async () => {
    try {
      setPurchaseLoader(true);
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      const agentDetails = localStorage.getItem("agentDetails");
      let MyAgentData = null;
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      if (agentDetails) {
        // //console.log;
        const agentData = JSON.parse(agentDetails);
        // //console.log;
        MyAgentData = agentData;
      }

      const ApiPath = Apis.purchaseNumber;
      // //console.log;
      //// //console.log;
      const formData = new FormData();
      formData.append("phoneNumber", selectedPurchasedNumber.phoneNumber);
      // formData.append("phoneNumber", "+16505403715");
      // formData.append("callbackNumber", "+16505403715");
      if (MyAgentData) {
        formData.append("mainAgentId", MyAgentData?.id);
      }

      if(selectedUser){
        formData.append("userId", selectedUSer.id);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key} === ${value}`);
      }

      //for testing
      // localStorage.setItem("purchasedNumberDetails", JSON.stringify(response.data.data));
      // setOpenPurchaseSuccessModal(true);
      // if (setSelectNumber) {
      //     setSelectNumber(selectedPurchasedNumber.phoneNumber);
      // }
      // setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
      // if (setOpenCalimNumDropDown) {
      //     setOpenCalimNumDropDown(false);
      // }

      return

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "multipart/form-data",
          // "Content-Type": "application/json"
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setOpenPurchaseSuccessModal(true);
          localStorage.setItem(
            "purchasedNumberDetails",
            JSON.stringify(response.data.data)
          );
          // handleContinue();
          if (setSelectNumber) {
            setSelectNumber(selectedPurchasedNumber.phoneNumber);
          }
          setPreviousNumber([...previousNumber, selectedPurchasedNumber]);
          // setShowClaimPopup(false);
          if (setOpenCalimNumDropDown) {
            setOpenCalimNumDropDown(false);
          }
        } else if (response.data.status === false) {
          setOpenPurchaseErrSnack(response.data.message);
          setIsSnackVisible(true);
          setErrorType(SnackbarTypes.Error);
        }
      }
    } catch (error) {
      // console.error("Error occured in purchase number api is: --", error);
    } finally {
      setPurchaseLoader(false);
    }
  };

  //function to fine numbers api
  const requestCounter = useRef(0);
  const handleFindeNumbers = async (number) => {
    const currentRequest = ++requestCounter.current;
    try {
      setFindeNumberLoader(true);
      const ApiPath = `${Apis.findPhoneNumber}?areaCode=${number}`;
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
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
        // //console.log;
        // Only update state if this request is still the latest one
        if (currentRequest === requestCounter.current) {
          if (response?.data?.status) {
            setFoundeNumbers(response.data.data);
          } else {
            setFoundeNumbers([]);
          }
        }
      }
    } catch (error) {
      // console.error("Error occured in finde number api is :---", error);
    } finally {
      if (requestCounter.current === currentRequest) {
        setFindeNumberLoader(false);
      }
    }
  };

  const styles = {
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
  };

  return (
    <div>
      <Modal
        open={showClaimPopup}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-8/12 sm:w-full w-8/12" sx={styles.claimPopup}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-8/12 w-full min-h-[50vh] max-h-[84vh] flex flex-col justify-between"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
                overflow: "auto",
                scrollbarWidth: "none",
              }}
            >
              <div className=" h-[88%] overflow-hidden">
                {isSnackVisible && (
                  <AgentSelectSnackMessage
                    message={openPurchaseErrSnack}
                    type={errorType}
                    isVisible={isSnackVisible}
                    hide={() => {
                      setIsSnackVisible(false);
                      setOpenPurchaseErrSnack("");
                      setErrorType(null);
                    }}
                  />
                )}
                <div className="flex flex-row justify-end">
                  <button onClick={handleCloseClaimPopup}>
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  {`Let's claim your phone number`}
                </div>
                <div
                  className="mt-2"
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  Enter the 3 digit area code you would like to use
                </div>
                <div
                  className="mt-4"
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#15151550",
                  }}
                >
                  Number
                </div>
                <div className="mt-2">
                  <input
                    className="border border-[#00000010] outline-none p-3 rounded-lg w-full mx-2 focus:outline-none focus:ring-0"
                    type=""
                    placeholder="Ex: 619, 213, 313"
                    value={findNumber}
                    onChange={(e) => {
                      setFindeNumberLoader(true);
                      if (timerRef.current) {
                        clearTimeout(timerRef.current);
                      }

                      const value = e.target.value;
                      setFindNumber(value.replace(/[^0-9]/g, ""));
                      // setFindNumber(e.target.value.replace(/[^0-9]/g, ""));
                      // handleFindeNumbers(value)
                      if (value) {
                        timerRef.current = setTimeout(() => {
                          handleFindeNumbers(value);
                        }, 300);
                      } else {
                        // //console.log;
                        return;
                      }
                    }}
                  />
                </div>

                {findNumber ? (
                  <div>
                    {findeNumberLoader ? (
                      <div className="flex flex-row justify-center mt-6">
                        <CircularProgress size={35} />
                      </div>
                    ) : (
                      <div
                        className="mt-6 max-h-[40vh] overflow-auto"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {foundeNumbers.length > 0 ? (
                          <div className="w-full pb-12 ">
                            {foundeNumbers.map((item, index) => (
                              <div
                                key={index}
                                className="h-[10vh] rounded-2xl flex flex-col justify-center p-4 mb-4 "
                                style={{
                                  border:
                                    index === selectedPurchasedIndex
                                      ? "2px solid #7902DF"
                                      : "1px solid #00000020",
                                  backgroundColor:
                                    index === selectedPurchasedIndex
                                      ? "#402FFF05"
                                      : "",
                                }}
                              >
                                <button
                                  className="flex flex-row items-start justify-between outline-none"
                                  onClick={(e) => {
                                    handlePurchaseNumberClick(item, index);
                                  }}
                                >
                                  <div>
                                    <div style={styles.findNumberTitle}>
                                      {item.phoneNumber}
                                    </div>
                                    <div
                                      className="text-start mt-2"
                                      style={styles.findNumberDescription}
                                    >
                                      {item.locality} {item.region}
                                    </div>
                                  </div>
                                  <div className="flex flex-row items-start gap-4">
                                    <div style={styles.findNumberTitle}>
                                      ${item.price}/mo
                                    </div>
                                    <div>
                                      {index == selectedPurchasedIndex ? (
                                        <Image
                                          src={"/assets/charmTick.png"}
                                          height={35}
                                          width={35}
                                          alt="*"
                                        />
                                      ) : (
                                        <Image
                                          src={"/assets/charmUnMark.png"}
                                          height={35}
                                          width={35}
                                          alt="*"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xl font-[600] text-center mt-4">
                            Those numbers seem to be taken. Try a new search
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xl font-[600] text-center mt-4">
                    Enter number to search
                  </div>
                )}
              </div>
              {!openPurchaseSuccessModal && (
                <div className="h-[50px] ">
                  <div>
                    {purchaseLoader ? (
                      <div className="w-full flex flex-row justify-center mt-4">
                        <CircularProgress size={32} />
                      </div>
                    ) : (
                      <div>
                        {selectedPurchasedNumber && (
                          <button
                            className="text-white bg-purple w-full h-[50px] rounded-lg"
                            onClick={handlePurchaseNumber}
                          >
                            Proceed to Buy
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Box>
      </Modal>

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
        <Box className="lg:w-6/12 sm:w-full w-6/12" sx={styles.claimPopup}>
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
                    handleCloseClaimPopup();
                    if (AssignNumber) {
                      AssignNumber(selectedPurchasedNumber.phoneNumber);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ClaimNumber;
