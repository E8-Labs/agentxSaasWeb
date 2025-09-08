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
} from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import AddCardDetails from "@/components/createagent/addpayment/AddCardDetails";
import { loadStripe } from "@stripe/stripe-js";
import moment from "moment";
import getProfileDetails from "@/components/apis/GetProfile";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { GetFormattedDateString } from "@/utilities/utility";
import XBarConfirmationModal from "@/components/myAccount/XBarConfirmationModal";
import { PersistanceKeys, XBarPlans } from "@/constants/Constants";

let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

function AgencyBarServices() {
  //stroes user cards list
  const [cards, setCards] = useState([]);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
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

  //array of plans
  const plans = XBarPlans
  // [
  //   {
  //     id: 1,
  //     PlanTitle: "Starter | 250 mins",
  //     details: [
  //       `1 AgentX AI | 1hrs of Support`,
  //       `1 External Integration | 1 Calendar Integration`,
  //     ],
  //     originalPrice: "2,450",
  //     discountPrice: "997",
  //     planStatus: "40%",
  //     status: "",
  //   },
  //   {
  //     id: 2,
  //     PlanTitle: "Professional | 750 mins",
  //     details: [
  //       `4 AgentX AI | 4hrs of Support`,
  //       `2 External Integration | 2 Calendar Integration`,
  //     ],
  //     originalPrice: "5,900",
  //     discountPrice: "2,997",
  //     planStatus: "50%",
  //     status: "Popular",
  //   },
  //   {
  //     id: 3,
  //     PlanTitle: "Scale | 1500 mins",
  //     details: [
  //       "Dedicated Success Manager",
  //       `6 AgentX AI | 6hrs of Support`,
  //       `Unlimited External Integration | Calendar Integration`,
  //     ],
  //     originalPrice: "8,742",
  //     discountPrice: "3,497",
  //     planStatus: "60%",
  //     status: "Best Value",
  //   },
  // ];

  useEffect(() => {
    getProfile();
    getCardsList();
  }, []);

  const getProfile = async () => {
    try {
      const localData = localStorage.getItem("User");
      let response = await getProfileDetails();
      //console.log;
      if (response) {
        let togglePlan = response?.data?.data?.supportPlan;
        // let togglePlan = plan?.type;
        let planType = null;
        // if (plan.status == "active") {
        if (togglePlan === "Starter") {
          planType = 1;
        } else if (togglePlan === "Professional") {
          planType = 2;
        } else if (togglePlan === "Enterprise") {
          planType = 3;
        }
        // }
        setUserLocalData(response?.data?.data);
        //console.log;
        setTogglePlan(planType);
        setCurrentPlan(planType);
      }
    } catch (error) {
      // console.error("Error in getprofile api is", error);
    }
  };

  useEffect(() => {
    // //console.log;
  }, [userLocalData]);

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

      if (togglePlan === 1) {
        planType = "Starter";
      } else if (togglePlan === 2) {
        planType = "Professional";
      } else if (togglePlan === 3) {
        planType = "Enterprise";
      }

      // //console.log;

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

      const ApiData = {
        supportPlan: planType,
      };

      // //console.log;

      const ApiPath = Apis.purchaseSupportPlan;
      // //console.log;

      // return

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          localDetails.user = response.data.data;
          // //console.log;

          //   if (response2) {
          let togglePlan = response?.data?.data?.supportPlan;
          let planType = null;
          if (togglePlan === "Starter") {
            planType = 1;
          } else if (togglePlan === "Professional") {
            planType = 2;
          } else if (togglePlan === "Enterprise") {
            planType = 3;
          }
          setTogglePlan(planType);
          setCurrentPlan(planType);
          //   }
          // localStorage.setItem("User", JSON.stringify(localDetails));
          setSuccessSnack("Your support plan successfully updated");
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

      const ApiPath = Apis.getCardsList;

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
    if (togglePlan === 1) {
      planType = "Starter";
    } else if (togglePlan === 2) {
      planType = "Professional";
    } else if (togglePlan === 3) {
      planType = "Enterprise";
    }
    return planType;
  };

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
            X Bar Plans
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
            {` Account > XBar Plans`}
          </div>
        </div>
        <div
          className="w-10/12 p-4 rounded-lg flex flex-row items-center"
          style={{
            backgroundImage: "url(/svgIcons/cardBg.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "#fff",
            alignSelf: "center",
            marginTop: "2vh",
            // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="flex flex-col">
            <div
              style={{
                fontSize: "2vh",
                fontWeight: "700",
                marginBottom: "10px",
              }}
            >
              X Bar Plans
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
            <div className="flex flex-row justify-between mt-2">
              <div></div>
              <button
                className="px-4 py-2 rounded-lg bg-white text-purple font-medium"
                onClick={(e) => {
                  //console.log;
                  let url = PersistanceKeys.GlobalConsultationUrl;
                  if (typeof window !== "undefined") {
                    window.open(url, "_blank");
                  }
                }}
              >
                Speak to a Genius
              </button>
            </div>
          </div>
        </div>

        {plans.map((item, index) => (
          <button
            key={item.id}
            className="w-9/12 mt-4 outline-none"
            onClick={(e) => handleTogglePlanClick(item)}
            disabled={togglePlan === currentPlan}
          >
            <div
              className="px-4 py-1 pb-4"
              style={{
                ...styles.pricingBox,
                border:
                  item.id === togglePlan
                    ? "2px solid #7902DF"
                    : "1px solid #15151520",
                backgroundColor: item.id === togglePlan ? "#402FFF05" : "",
              }}
            >
              <div
                style={{ ...styles.triangleLabel, borderTopRightRadius: "7px" }}
              ></div>
              <span style={styles.labelText}>{item.planStatus}</span>
              <div
                className="flex flex-row items-start gap-3"
                style={styles.content}
              >
                <div className="mt-1">
                  <div>
                    {item.id === togglePlan ? (
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
                  {/* {item.id === currentPlan && (
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
                  )} */}

                  <div className="flex flex-row items-center gap-3">
                    <div
                      style={{
                        color: "#151515",
                        fontSize: 20,
                        fontWeight: "600",
                      }}
                    >
                      {item.PlanTitle}
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
                    <div className="flex flex-col justify-start">
                      {item.details.map((det, index) => {
                        return (
                          <div
                            className=""
                            style={{
                              color: "#15151590",
                              fontSize: 12,
                              //   width: "60%",
                              fontWeight: "600",
                            }}
                            key={index}
                          >
                            {det}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-row items-center">
                      <div style={styles.originalPrice}>
                        {item.originalPrice && <div>${item.originalPrice}</div>}
                      </div>
                      <div className="flex flex-row justify-start items-start ">
                        <div style={styles.discountedPrice}>
                          ${item.discountPrice}
                        </div>
                        <p style={{ color: "#15151580" }}></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}

        <div className="flex flex-col w-full items-center justify-center">
          {subscribePlanLoader ? (
            <div className="w-9/12 mt-8 flex flex-row items-center justify-center h-[50px]">
              <CircularProgress size={25} />
            </div>
          ) : (
            <button
              className="rounded-xl w-9/12 mt-8"
              disabled={togglePlan === currentPlan}
              style={{
                height: "50px",
                fontSize: 16,
                fontWeight: "700",
                flexShrink: 0,
                backgroundColor:
                  togglePlan === currentPlan ? "#00000020" : "#7902DF",
                color: togglePlan === currentPlan ? "#000000" : "#ffffff",
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

export default AgencyBarServices;
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
