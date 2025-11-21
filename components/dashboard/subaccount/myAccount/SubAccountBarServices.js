import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  Modal,
  Snackbar,
  TextField,
  Tooltip,
} from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import AddCardDetails from "@/components/createagent/addpayment/AddCardDetails";
import { loadStripe } from "@stripe/stripe-js";
import moment from "moment";
import getProfileDetails from "@/components/apis/GetProfile";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../../leads/AgentSelectSnackMessage";
import { GetFormattedDateString } from "@/utilities/utility";
import XBarConfirmationModal from "@/components/myAccount/XBarConfirmationModal";
import { PersistanceKeys } from "@/constants/Constants";
import { getMonthlyPlan, getXBarOptions } from "@/components/agency/subaccount/GetPlansList";
import { AuthToken } from "@/components/agency/plan/AuthDetails";
import { formatDecimalValue } from "@/components/agency/agencyServices/CheckAgencyData";
import AdminGetProfileDetails from "@/components/admin/AdminGetProfileDetails";

let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

function SubAccountBarServices({
  selectedUser
}) {
  //stroes user cards list
  const [cards, setCards] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  //array of plans
  const [plans, setPlans] = useState([]);

  //userlocal data
  const [userLocalData, setUserLocalData] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [cancelPlanLoader, setCancelPlanLoader] = useState(false);
  const [redeemLoader, setRedeemLoader] = useState(false);

  //stoores payment history
  const [PaymentHistoryData, setPaymentHistoryData] = useState([]);
  const [historyLoader, setHistoryLoader] = useState(false);

  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [getCardLoader, setGetCardLoader] = useState(false);
  const [makeDefaultCardLoader, setMakeDefaultCardLoader] = useState(false);

  //add card variables
  const [addPaymentPopUp, setAddPaymentPopup] = useState(false);
  const [cardData, getcardData] = useState("");

  //variables for selecting plans
  const [togglePlan, setTogglePlan] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribePlanLoader, setSubscribePlanLoader] = useState(false);

  //snack messages variables
  const [successSnack, setSuccessSnack] = useState(null);
  const [errorSnack, setErrorSnack] = useState(null);

  //getplans loader
  const [getPlansLoader, setGetPlansLoader] = useState(false);

  //variables for cancel plan
  const [giftPopup, setGiftPopup] = useState(false);
  const [ScreenWidth, setScreenWidth] = useState(null);
  const [showConfirmCancelPlanPopup, setShowConfirmCancelPlanPopup] =
    useState(false);
  const [showConfirmCancelPlanPopup2, setShowConfirmCancelPlanPopup2] =
    useState(false);

  useEffect(() => {
    let screenWidth = 1000;
    if (typeof window !== "undefined") {
      screenWidth = window.innerWidth;
    }
    // //console.log;
    setScreenWidth(screenWidth);
  }, []);


  useEffect(() => {
    getPlans();
    getProfile();
    getCardsList();
  }, []);

  //function to get subaccount plans
  const getPlans = async () => {
    try {
      setGetPlansLoader(true);
      const Token = AuthToken();
      let ApiPath = Apis.getSubAccountPlans;
      if (selectedUser) {
        ApiPath = ApiPath + `?userId=${selectedUser.id}`
      }
      console.log("Apipath of get plans api is", ApiPath)
      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + Token,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of get plans api is testing", response.data.data);
        setPlans(response.data.data.xbarPlans);
        setGetPlansLoader(false);
      }

    } catch (error) {
      console.error("Error occured in getting plans", error);
      setGetPlansLoader(false);
    }
  }
  //get profile
  const getProfile = async () => {
    try {
      const localData = localStorage.getItem("User");
      let response = null;
      //console.log;
      let togglePlan = null;
      if (selectedUser) {
        const Token = AuthToken();
        let ApiPath = Apis.getProfileFromId;
        ApiPath = ApiPath + "?id=" + selectedUser.id

        //console.log

        response = await axios.get(ApiPath, {
          headers: {
            Authorization: "Bearer " + Token,
          },
        });
      } else {

        if (selectedUser) {

          response = await AdminGetProfileDetails(selectedUser.id);
          if (response) {
            setSelectedUserDetails(response?.data?.data);
          }
        } else {
          response = await getProfileDetails();
          setUserDetails(response?.data?.data);
          setSelectedUserDetails(response?.data?.data);

        }
      }
      if (response) {
        console.log("Respone for setting xbar plan", response)
        togglePlan = response?.data?.data?.supportPlan;
        // let togglePlan = plan?.type;
        // let planType = null;
        // // if (plan.status == "active") {
        // if (togglePlan === "Starter") {
        //   planType = 1;
        // } else if (togglePlan === "Professional") {
        //   planType = 2;
        // } else if (togglePlan === "Enterprise") {
        //   planType = 3;
        // }
        // }
        setUserLocalData(response?.data?.data);
      }
      console.log("Plan id is", togglePlan);
      setTogglePlan(togglePlan);
      setCurrentPlan(togglePlan);
    } catch (error) {
      // console.error("Error in getprofile api is", error);
    }
  };

  useEffect(() => {
    console.log("Toggle plan value is", togglePlan);
    console.log("Current plan value is", currentPlan);
  }, [togglePlan, currentPlan]);

  //functions for selecting plans
  const handleTogglePlanClick = (item) => {
    setTogglePlan(item.id);
    setSelectedPlan((prevId) => (prevId === item ? null : item));
    // setTogglePlan(prevId => (prevId === id ? null : id));
  };

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    try {
      let planType = null;

      //// //console.log;


      setSubscribePlanLoader(true);
      let AuthToken = null;
      let localDetails = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        localDetails = LocalDetails;
        AuthToken = LocalDetails.token;
        if (cards.length > 0) {
          // //console.log;
        } else {
          //   setErrorSnack("No payment method added");
          setAddPaymentPopup(true);
          return;
        }
      }

      // //console.log;

      // const ApiData = {
      //   supportPlan: planType,
      // };

      const formData = new FormData();
      formData.append("supportPlan", togglePlan);
      if (selectedUser) {
        formData.append("userId", selectedUser.id);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }



      const ApiPath = Apis.purchaseSupportPlan;
      // //console.log;

      // return

      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // localDetails.user = response.data.data;
          // // //console.log;

          // //   if (response2) {
          // let togglePlan = response?.data?.data?.supportPlan;
          // let planType = null;
          // if (togglePlan === "Starter") {
          //   planType = 1;
          // } else if (togglePlan === "Professional") {
          //   planType = 2;
          // } else if (togglePlan === "Enterprise") {
          //   planType = 3;
          // }
          // setTogglePlan(planType);
          // setCurrentPlan(planType);
          //   }
          // localStorage.setItem("User", JSON.stringify(localDetails));

          let response2 = await getProfileDetails();
          if (response2) {
            console.log("res2 recieved", response2);
            // let newPlanId = response2?.data?.data?.plan?.planId
            setTogglePlan(togglePlan);
            setCurrentPlan(togglePlan);
          }
          setSuccessSnack("Your plan successfully updated");
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is:", error);
    } finally {
      setSubscribePlanLoader(false);
    }
  };
  const handleClose = (data) => {
    // //console.log;
    if (data.status === true) {
      let newCard = data.data;
      setAddPaymentPopup(false);
      setCards([newCard, ...cards]);
    }
  };

  //functiion to get cards list
  const getCardsList = async () => {
    try {
      setGetCardLoader(true);

      const localData = localStorage.getItem("User");

      let AuthToken = null;

      if (localData) {
        const Data = JSON.parse(localData);
        AuthToken = Data.token;
      }

      // //console.log;

      //Talabat road

      let ApiPath = Apis.getCardsList;
      if (selectedUser) {
        ApiPath = ApiPath + `?userId=${selectedUser.id}`
      }

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setCards(response.data.data);
        }
      }
    } catch (error) {
      // //console.log;
    } finally {
      // //console.log;
      setGetCardLoader(false);
    }
  };

  //function to get card brand image
  const getPlanFromId = () => {
    let planType = "";
    plans.forEach((item) => {
      if (item.id === togglePlan) {
        planType = item?.title;
      }
    }
    )
    return planType;
  };



  const handleSpeakToAGenius = () => {
    if (selectedUser?.userRole !== "AgencySubAccount") {
      let url = PersistanceKeys.HireTeamUrl;
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      }
    } else {
      let url = selectedUserDetails?.userSettings?.hireTeamUrl;
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      }
    }
  }

  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto"
      style={{
        paddingBottom: "50px",
        scrollbarWidth: "none", // For Firefox
        WebkitOverflowScrolling: "touch",
      }}
    >
      <AgentSelectSnackMessage
        isVisible={errorSnack == null ? false : true}
        hide={() => {
          setErrorSnack(null);
        }}
        message={errorSnack}
        type={SnackbarTypes.Error}
      />
      <AgentSelectSnackMessage
        isVisible={successSnack == null ? false : true}
        hide={() => {
          setSuccessSnack(null);
        }}
        message={successSnack}
        type={SnackbarTypes.Success}
      />

      {/* code for current plans available */}

      <div className="flex flex-col w-full justify-center items-center ">
        <div className=" w-full flex flex-col">
          <div
            className=""
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#000",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            X Bar Services
          </div>
          <div
            className=" "
            style={{
              fontSize: 12,

              color: "#000",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {` Account > XBar Services`}
          </div>
        </div>
        <div
          className="w-10/12 p-6 rounded-lg flex flex-row items-center"
          style={{
            backgroundImage: "url(/svgIcons/cardBg.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "#fff",
            alignSelf: "center",
            marginTop: "7vh",
            // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex flex-col pt-5">
            <div
              style={{
                fontSize: "2vh",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              X Bar Services
            </div>
            <p
              style={{
                fontSize: "15px",
                fontWeight: "400",
                lineHeight: "1.5",
                width: "90%",
              }}
            >
              {`This is like the Apple Genius Bar but better. Get up and running
              the right way. We'll work alongside to set up your entire AI sales
              system. This can include integrating your systems, ensuring
              everything is optimized for success from the start. See results
              faster and start closing more deals with confidence—all at
              affordable rates to meet you where you are.`}
            </p>
            <div className="flex flex-row justify-between">
              <div></div>
              <Tooltip title={`${!selectedUserDetails?.userSettings?.hireTeamTitle && "Unavailable"}`}
                placement="top"
                arrow
                componentsProps={{
                  tooltip: { sx: { backgroundColor: "#ffffff", color: "#333", fontSize: "14px", padding: "10px 15px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }, }, arrow: { sx: { color: "#ffffff" } },
                }}>
                <button
                  className="px-4 py-2 rounded-lg bg-white text-purple font-medium"
                  onClick={(e) => {
                    handleSpeakToAGenius();
                  }}
                >
                  Speak to a Genius
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {
          getPlansLoader ? (
            <div className="w-full flex flex-row items-center justify-center">
              <CircularProgress size={25} />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {plans.length > 0 && plans.map((item, index) => (
                <button
                  key={item.id}
                  className="w-9/12 mt-4 outline-none"
                  disabled={Number(item.id) === Number(togglePlan)}
                  onClick={(e) => handleTogglePlanClick(item)}
                >
                  <div
                    className="px-4 py-1 pb-4"
                    style={{
                      ...styles.pricingBox,
                      border:
                        Number(item.id) === Number(togglePlan)
                          ? "2px solid #7902DF"
                          : "1px solid #15151520",
                      // backgroundColor: item.id === togglePlan ? "#402FFF05" : "",
                      backgroundColor: Number(item.id) === Number(togglePlan) ? "#402FFF05" : "",
                    }}
                  >
                    <div
                      style={{ ...styles.triangleLabel, borderTopRightRadius: "7px" }}
                    ></div>
                    <span style={styles.labelText}>{formatDecimalValue(item?.percentageDiscount)}%</span>
                    <div
                      className="flex flex-row items-start gap-3"
                      style={styles.content}
                    >
                      <div className="mt-1">
                        <div>
                          {Number(item.id) === Number(togglePlan) ? (
                            <Image
                              src={"/svgIcons/checkMark.svg"}
                              height={24}
                              width={24}
                              alt="*"
                            />
                          ) : (
                            <Image
                              src={"/svgIcons/unCheck.svg"}
                              height={24}
                              width={24}
                              alt="*"
                            />
                          )}
                        </div>
                      </div>
                      <div className="w-full">
                        {Number(item.id) === Number(currentPlan) && (
                          <div
                            className="-mt-[27px] flex px-2 py-1 bg-purple rounded-full text-white"
                            style={{
                              fontSize: 11.6,
                              fontWeight: "500",
                              width: "fit-content",
                            }}
                          >
                            Current Plan
                          </div>
                        )}

                        <div className="flex flex-row items-center gap-3">
                          <div
                            style={{
                              color: "#151515",
                              fontSize: 20,
                              fontWeight: "600",
                            }}
                          >
                            {item?.title} | {item.minutes} Credits {item.tag && (<span className="px-4 py-2 text-white bg-purple rounded-full" style={{ fontWeight: "500", fontSize: 14 }}>{item.tag}</span>)}
                          </div>
                          {item.status && (
                            <div
                              className="flex px-2 py-1 bg-purple rounded-full text-white"
                              style={{ fontSize: 11.6, fontWeight: "500" }}
                            >
                              {item.status}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-row items-center justify-between">
                          <div
                            className="mt-2"
                            style={{
                              color: "#15151590",
                              fontSize: 12,
                              width: "60%",
                              fontWeight: "600",
                            }}
                          >
                            {item.planDescription}
                          </div>
                          <div className="flex flex-row items-center">
                            <div style={styles.originalPrice}>
                              ${item.originalPrice}
                            </div>
                            <div className="flex flex-row justify-start items-start ">
                              <div style={styles.discountedPrice}>
                                ${item.discountedPrice}
                              </div>
                              <p style={{ color: "#15151580" }}>/mo*</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        }

        <div className="flex flex-col w-full items-center justify-center">
          {subscribePlanLoader ? (
            <div className="w-9/12 mt-8 flex flex-row items-center justify-center h-[50px]">
              <CircularProgress size={25} />
            </div>
          ) : (
            <button
              className="rounded-xl w-9/12 mt-8"
              disabled={Number(currentPlan) === Number(togglePlan)}
              style={{
                height: "50px",
                fontSize: 16,
                fontWeight: "700",
                flexShrink: 0,
                backgroundColor:
                  Number(currentPlan) === Number(togglePlan) ? "#00000020" : "#7902DF",
                color: Number(currentPlan) === Number(togglePlan) ? "#000000" : "#ffffff",
              }}
              onClick={() => {
                setShowConfirmationModal(true);
              }}
            >
              Continue
            </button>
          )}
        </div>
      </div>

      <XBarConfirmationModal
        plan={getPlanFromId()}
        open={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
        }}
        onConfirm={() => {
          handleSubscribePlan();
          setTimeout(() => setShowConfirmationModal(false), 0);
        }}
      />
      {/* Add Payment Modal */}
      <Modal
        open={addPaymentPopUp} //addPaymentPopUp
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: "600",
                  }}
                >
                  Payment Details
                </div>
                <button onClick={() => setAddPaymentPopup(false)}>
                  <Image
                    src={"/assets/crossIcon.png"}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <Elements stripe={stripePromise}>
                <AddCardDetails
                  //selectedPlan={selectedPlan}
                  stop={stop}
                  getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={handleClose}
                  togglePlan={""}
                // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default SubAccountBarServices;
const styles = {
  text: {
    fontSize: 12,
    color: "#00000090",
  },
  text2: {
    textAlignLast: "left",
    fontSize: 15,
    color: "#000000",
    fontWeight: 500,
    whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden", // Hide overflow text
    textOverflow: "ellipsis", // Add ellipsis for overflow text
  },
  paymentModal: {
    height: "auto",
    bgcolor: "transparent",
    // p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-50%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: "700",
  },
  gitTextStyle: {
    fontSize: 15,
    fontWeight: "700",
  },

  //style for plans
  cardStyles: {
    fontSize: "14",
    fontWeight: "500",
    border: "1px solid #00000020",
  },
  pricingBox: {
    position: "relative",
    // padding: '10px',
    borderRadius: "10px",
    // backgroundColor: '#f9f9ff',
    display: "inline-block",
    width: "100%",
  },
  triangleLabel: {
    position: "absolute",
    top: "0",
    right: "0",
    width: "0",
    height: "0",
    borderTop: "50px solid #7902DF", // Increased height again for more padding
    borderLeft: "50px solid transparent",
  },
  labelText: {
    position: "absolute",
    top: "10px", // Adjusted to keep the text centered within the larger triangle
    right: "5px",
    color: "white",
    fontSize: "10px",
    fontWeight: "bold",
    transform: "rotate(45deg)",
  },
  content: {
    textAlign: "left",
    paddingTop: "10px",
  },
  originalPrice: {
    textDecoration: "line-through",
    color: "#7902DF65",
    fontSize: 18,
    fontWeight: "600",
  },
  discountedPrice: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: "10px",
  },
};
