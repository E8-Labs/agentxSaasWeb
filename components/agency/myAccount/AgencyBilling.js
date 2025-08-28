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
import { AuthToken } from "@/components/agency/plan/AuthDetails";
import SmartRefillCard from "../agencyExtras.js/SmartRefillCard";

let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

function AgencyBilling({
  selectedAgency
}) {
  //stroes user cards list
  const [cards, setCards] = useState([]);

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

  const [plans, setPlans] = useState([])
  const [initialLoader, setInitialLoader] = useState(false)


  const duration = [
    {
      id: 1,
      title: "Monthly",
      value: "monthly",
    }, {
      id: 2,
      title: "Quarterly",
      value: "quarterly",

    }, {
      id: 3,
      title: "Yearly",
      value: "yearly",

    },
  ]


  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [quaterlyPlans, setQuaterlyPlans] = useState([]);
  const [yearlyPlans, setYearlyPlans] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState(duration[0]);


  useEffect(() => {
    let screenWidth = 1000;
    if (typeof window !== "undefined") {
      screenWidth = window.innerWidth;
    }
    // //console.log;
    setScreenWidth(screenWidth);
  }, []);



  //cancel plan reasons
  const cancelPlanReasons = [
    {
      id: 1,
      reason: "It’s too expensive",
    },
    {
      id: 2,
      reason: "I’m using something else",
    },
    {
      id: 3,
      reason: "I’m not getting the results I expected",
    },
    {
      id: 4,
      reason: "It’s too complicated to use",
    },
    {
      id: 5,
      reason: "Others",
    },
  ];

  useEffect(() => {
    getPlans()
    getPaymentHistory();


    getCardsList();
  }, []);

  useEffect(() => {
    getProfile();
  }, [plans])
  //get plans apis
  const getPlans = async () => {
    try {
      setInitialLoader(true);
      const Token = AuthToken();
      let ApiPath = Apis.getPlansForAgency;
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      }
      const response = await axios.get(ApiPath, {
        headers: {
          "Authorization": "Bearer " + Token,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of get plans api is", response.data.data);
        const monthly = [];
        const quarterly = [];
        const yearly = [];
        let plansList = response.data.data;
        plansList.forEach(plan => {
          switch (plan.duration) {
            case "monthly":
              monthly.push(plan);
              break;
            case "quarterly":
              quarterly.push(plan);
              break;
            case "yearly":
              yearly.push(plan);
              break;
            default:
              break;
          }
        });
        setPlans(response.data.data)
        setMonthlyPlans(monthly);
        setQuaterlyPlans(quarterly);
        setYearlyPlans(yearly);
        setInitialLoader(false);
      }

    } catch (error) {
      setInitialLoader(false);
      console.error("Error occured in getting plans", error);
    }
  }

  const getProfile = async () => {
    try {
      const localData = localStorage.getItem("User");
      let response = null;
      if (selectedAgency) {
        const Token = AuthToken();
        let ApiPath = Apis.getProfileFromId;
        ApiPath = ApiPath + "?id=" + selectedAgency.id

        //console.log

        response = await axios.get(ApiPath, {
          headers: {
            Authorization: "Bearer " + Token,
          },
        });
      } else {
        response = await getProfileDetails();
      }
      //console.log;
      if (response) {
        let plan = response?.data?.data?.plan;
        let togglePlan = plan?.planId;
        let planType = null;
        // if (plan.status == "active") {
        //   if (togglePlan === "Plan30") {
        //     planType = 1;
        //   } else if (togglePlan === "Plan120") {
        //     planType = 2;
        //   } else if (togglePlan === "Plan360") {
        //     planType = 3;
        //   } else if (togglePlan === "Plan720") {
        //     planType = 4;
        //   }
        // }
        setUserLocalData(response?.data?.data);
        // //console.log;
        setTogglePlan(togglePlan);
        setCurrentPlan(togglePlan);
        let userPlanDuration = response?.data?.data?.plan?.duration;
        console.log('response?.data?.data?.plan', plans)

        const matchedDuration = plans.find(d => d.id === togglePlan);

        console.log('plans find', plans.find(d => d.id === togglePlan))
        if (matchedDuration) {
          if (matchedDuration.duration === "monthly") {
            setSelectedDuration(duration[0]);
          } else if (matchedDuration.duration === "quarterly") {
            setSelectedDuration(duration[1]);
          } else if (matchedDuration.duration === "yearly") {
            setSelectedDuration(duration[2]);
          }
        } else {
          setSelectedDuration(duration[0]);  // Default to Monthly if no match
        }
      }
    } catch (error) {
      // console.error("Error in getprofile api is", error);
    }
  };

  //function to close the add card popup
  const handleClose = (data) => {
    // //console.log;
    if (data.status === true) {
      let newCard = data.data;
      setAddPaymentPopup(false);
      setCards([newCard, ...cards]);
      window.location.reload()
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
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency.id}`
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

  //function to make default cards api
  const makeDefaultCard = async (item) => {
    setSelectedCard(item);
    // //console.log
    // return
    try {
      setMakeDefaultCardLoader(true);

      const localData = localStorage.getItem("User");

      let AuthToken = null;

      if (localData) {
        const Data = JSON.parse(localData);
        AuthToken = Data.token;
      }
      // //console.log

      const ApiPath = Apis.makeDefaultCard;

      const ApiData = {
        paymentMethodId: item.id,
      };

      // //console.log

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          let crds = cards.forEach((card, index) => {
            if (card.isDefault) {
              //console.log;
              cards[index].isDefault = false;
            }
          });
          item.isDefault = true;
        }
      }
    } catch (error) {
      // console.error("Error occured in make default card api is", error);
    } finally {
      setMakeDefaultCardLoader(false);
    }
  };

  //functions for selecting plans
  const handleTogglePlanClick = (item) => {
    // if (togglePlan) {
    //     setTogglePlan(prevId => (prevId === item.id ? null : item.id));
    //     setSelectedPlan(prevId => (prevId === item ? null : item));
    // } else {
    //     setSelectedPlan(prevId => (prevId === item ? null : item));
    //     setAddPaymentPopUp(true);
    // }
    // setTogglePlan(prevId => (prevId === item.id ? null : item.id));
    setTogglePlan(item.id);
    setSelectedPlan((prevId) => (prevId === item ? null : item));
    // setTogglePlan(prevId => (prevId === id ? null : id));
  };

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    try {

      console.log("ssubscribe")

      setSubscribePlanLoader(true);
      let AuthToken = null;
      let localDetails = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        localDetails = LocalDetails;
        AuthToken = LocalDetails.token;
        if (localDetails?.user?.cards?.length > 0) {
          // //console.log;
        } else {
          setErrorSnack("No payment method added");
          return;
        }
      }

      // //console.log;

      const ApiPath = Apis.subAgencyAndSubAccountPlans;
      const formData = new FormData();
      formData.append("planId", togglePlan);
      for (let [key, value] of formData.entries()) {
        console.log(`${key} = ${value}`);
      }
      // //console.log;
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
          localDetails.user.plan = response.data.data;
          console.log("response.data.data", response.data)
          // let user = userLocalData
          // user.plan = response.data.data
          // setUserLocalData(user)
          let response2 = await getProfileDetails();
          if (response2) {
            // let togglePlan = response2?.data?.data?.plan?.type;
            // let planType = null;
            // if (togglePlan === "Plan30") {
            //   planType = 1;
            // } else if (togglePlan === "Plan120") {
            //   planType = 2;
            // } else if (togglePlan === "Plan360") {
            //   planType = 3;
            // } else if (togglePlan === "Plan720") {
            //   planType = 4;
            // }
            // setTogglePlan(planType);
            // setCurrentPlan(planType);
          }
          // localStorage.setItem("User", JSON.stringify(localDetails));
          setSuccessSnack("Your plan successfully updated");
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message);
        }
      }
    } catch (error) {
      console.error("Error occured in api is:", error);
    } finally {
      setSubscribePlanLoader(false);
    }
  };

  //function to get payment history
  const getPaymentHistory = async () => {
    try {
      setHistoryLoader(true);

      let AuthToken = null;
      let localDetails = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        localDetails = LocalDetails;
        AuthToken = LocalDetails.token;
      }

      let ApiPath = Apis.getPaymentHistory;
      if (selectedAgency) {
        ApiPath = ApiPath + `?userId=${selectedAgency}`
      }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          setPaymentHistoryData(response.data.data);
        }
      }
    } catch (error) {
      // console.error("Error occured in get history api is", error);
    } finally {
      setHistoryLoader(false);
    }
  };

  //function to cancel current plan
  const handleCancelPlan = async () => {
    try {
      setCancelPlanLoader(true);

      let AuthToken = null;

      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        AuthToken = LocalDetails.token;
      }

      const ApiPath = Apis.cancelPlan;

      // //console.log;

      //// //console.log;
      // //console.log;

      const ApiData = {
        // patanai: "Sari dunya",
      };

      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //console.log;
        if (response.data.status === true) {
          // //console.log;
          // window.location.reload();
          await getProfileDetails();
          setShowConfirmCancelPlanPopup(false);
          setGiftPopup(false);
          setTogglePlan(null);
          setCurrentPlan(null);
          setShowConfirmCancelPlanPopup2(true);
          let user = userLocalData
          user.plan.status = "cancelled"
          setUserLocalData(user)
          //console.log
          setSuccessSnack("Your plan was successfully cancelled");
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message);
        }
      }
    } catch (error) {
      console.error("Eror occured in cancel plan api is", error);
    } finally {
      setCancelPlanLoader(false);
    }
  };

  //function to call redeem api
  const handleRedeemPlan = async () => {
    //console.log;
    try {
      setRedeemLoader(true);

      let AuthToken = null;

      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        AuthToken = LocalDetails.token;
      }

      const ApiPath = Apis.redeemPlan;

      const ApiData = {
        sub_Type: "0", //send 1 for already redeemed plan
      };

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        let response2 = await getProfileDetails();
        console.log("response2?.data?.data?.plan?.id", response2?.data?.data?.plan?.id)
        if (response2) {
          let togglePlan = response2?.data?.data?.plan?.planId;
          // let planType = null;
          // if (togglePlan === "Plan30") {
          //   planType = 1;
          // } else if (togglePlan === "Plan120") {
          //   planType = 2;
          // } else if (togglePlan === "Plan360") {
          //   planType = 3;
          // } else if (togglePlan === "Plan720") {
          //   planType = 4;
          // }
          setUserLocalData(response2?.data?.data);
          setGiftPopup(false);
          setTogglePlan(togglePlan);
          setCurrentPlan(togglePlan);
          if (response2.data.status === true) {
            setSuccessSnack("You've claimed an extra 30 mins");
          } else if (response2.data.status === false) {
            setErrorSnack(response2.data.message);
          }
        }
      }
    } catch (error) {
      // console.error("Error occurd in api is", error);
    } finally {
      setRedeemLoader(false);
    }
  };

  //function to get card brand image
  const getCardImage = (item) => {
    if (item.brand === "visa") {
      return "/svgIcons/Visa.svg";
    } else if (item.brand === "Mastercard") {
      return "/svgIcons/mastercard.svg";
    } else if (item.brand === "amex") {
      return "/svgIcons/Amex.svg";
    } else if (item.brand === "discover") {
      return "/svgIcons/Discover.svg";
    } else if (item.brand === "dinersClub") {
      return "/svgIcons/DinersClub.svg";
    }
  };

  //variables
  const textFieldRef = useRef(null);
  const [selectReason, setSelectReason] = useState("");
  const [showOtherReasonInput, setShowOtherReasonInput] = useState(false);
  const [otherReasonInput, setOtherReasonInput] = useState("");

  //delreason extra variables
  const [cancelReasonLoader, setCancelReasonLoader] = useState(false);
  //function to select the cancel plan reason
  const handleSelectReason = async (item) => {
    // //console.log;
    setSelectReason(item.reason);
    if (item.reason === "Others") {
      setShowOtherReasonInput(true);
      const timer = setTimeout(() => {
        textFieldRef.current.focus();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowOtherReasonInput(false);
      setOtherReasonInput("");
    }
  };

  //del reason api
  const handleDelReason = async () => {
    if (!otherReasonInput || selectReason)
      try {
        setCancelReasonLoader(true);
        const localdata = localStorage.getItem("User");
        let AuthToken = null;
        if (localdata) {
          const D = JSON.parse(localdata);
          AuthToken = D.token;
        }

        const ApiData = {
          reason: otherReasonInput || selectReason,
        };

        // //console.log;

        const ApiPath = Apis.calcelPlanReason;
        // //console.log;

        const response = await axios.post(ApiPath, ApiData, {
          headers: {
            Authorization: "Bearer " + AuthToken,
            "Content-Type": "application/json",
          },
        });

        if (response) {
          //console.log;
          if (response.data.status === true) {
            setShowConfirmCancelPlanPopup2(false);
            setSuccessSnack(response.data.message);
          } else if (response.data.status === true) {
            setErrorSnack(response.data.message);
          }
        }
      } catch (error) {
        setErrorSnack(error);
        setCancelReasonLoader(false);
        console.error("Error occured in api is ", error);
      } finally {
        setCancelReasonLoader(false);
        // //console.log;
      }
  };

  const getCurrentPlans = () => {
    if (selectedDuration.id === 1) return monthlyPlans;
    if (selectedDuration.id === 2) return quaterlyPlans;
    if (selectedDuration.id === 3) return yearlyPlans;
    return [];
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
      <div className="w-full flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
            Billing
          </div>

          <div
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: "#00000090",
            }}
          >
            {"Account > Billing"}
          </div>
        </div>

        <button
          className=""
          onClick={() => {
            setAddPaymentPopup(true);
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#7902DF",
              textDecorationLine: "underline",
            }}
          >
            Add New Card
          </div>
        </button>
      </div>

      <div className="w-full">
        {getCardLoader ? (
          <div
            className="h-full w-full flex flex-row items-center justify-center"
            style={{
              marginTop: 20,
            }}
          >
            <CircularProgress size={35} />
          </div>
        ) : (
          <div className="w-full">
            {cards.length > 0 ? (
              <div
                className="w-full flex flex-row gap-4"
                style={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  display: "flex",
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                  height: "",
                  marginTop: 20,
                  // border:'2px solid red'
                  scrollbarWidth: "none",
                  overflowY: "hidden",
                  height: "", // Ensures the height is always fixed
                  flexShrink: 0,
                }}
              >
                {cards.map((item) => (
                  <div className="flex-shrink-0 w-5/12" key={item.id}>
                    <button
                      className="w-full outline-none"
                      onClick={() => makeDefaultCard(item)}
                    >
                      <div
                        className={`flex items-start justify-between w-full p-4 border rounded-lg `}
                        style={{
                          backgroundColor:
                            item.isDefault || selectedCard?.id === item.id
                              ? "#4011FA05"
                              : "transparent",
                          borderColor:
                            item.isDefault || selectedCard?.id === item.id
                              ? "#7902DF"
                              : "#15151510",
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border border-[#7902DF] flex items-center justify-center`} //border-[#2548FD]
                            style={{
                              borderWidth:
                                item.isDefault || selectedCard?.id === item.id
                                  ? 3
                                  : 1,
                            }}
                          ></div>
                          {/* Card Details */}
                          <div className="flex flex-col items-start">
                            <div className="flex flex-row items-center gap-3">
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  color: "#000",
                                }}
                              >
                                ****{item.last4}
                              </div>
                              {
                                // makeDefaultCardLoader ? (
                                //   <CircularProgress size={20} />
                                // ) :

                                item.isDefault && (
                                  <div
                                    className="flex px-2 py-1 rounded-full bg-purple text-white text-[10]"
                                    style={{ fontSize: 11, fontWeight: "500" }}
                                  >
                                    Default
                                  </div>
                                )
                              }
                            </div>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#909090",
                              }}
                            >
                              {item.brand} Card
                            </div>
                          </div>
                        </div>

                        {/* Card Logo */}
                        <div>
                          <Image
                            src={getCardImage(item) || "/svgIcons/Visa.svg"}
                            alt="Card Logo"
                            width={50}
                            height={50}
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-start mt-12"
                style={{ fontSize: 18, fontWeight: "600" }}
              >
                No payment method added
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code for smart refill */}
      <SmartRefillCard />

      <div className='flex flex-row items-center gap-2 bg-[#DFDFDF20] p-2 rounded-full'
        style={{
          alignSelf: 'flex-end'
        }}
      >
        {
          duration.map((item) => (
            <button key={item.id}
              className={`px-4 py-2 ${selectedDuration.id === item.id ? "text-white bg-purple shadow-md shadow-purple rounded-full" : "text-black"}`}
              onClick={() => {
                setSelectedDuration(item);
                getCurrentPlans();
              }}
            >
              {item.title}
            </button>
          ))
        }
      </div>

      {/* code for current plans available */}

      {getCurrentPlans().map((item, index) => (
        <button
          key={item.id}
          className="w-9/12 mt-4 outline-none"
          onClick={(e) => handleTogglePlanClick(item)}
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
                {item.id === currentPlan && (
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
                    {item.title}
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

                    <div className="flex flex-row justify-start items-start ">
                      <div style={styles.discountedPrice}>
                        ${item.originalPrice}
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


      {userLocalData?.plan && (
        <div className="w-full">
          <div className="w-full">
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
                onClick={handleSubscribePlan}
              >
                Continue
              </button>
            )}
          </div>

          {/* {togglePlan === currentPlan && (
            <button
              className="text-black  outline-none rounded-xl w-9/12 mt-3"
              style={{
                fontSize: 16,
                fontWeight: "700",
                height: "50px",
                textDecorationLine: "underline",
                flexShrink: 0,
              }}
              onClick={() => {
                if (userLocalData?.cancelPlanRedemptions === 0) {
                  setGiftPopup(true);
                } else {
                  setShowConfirmCancelPlanPopup(true);
                }
              }}
            >
              Cancel AgentX
            </button>
          )} */}

          <div className="w-9/12 flex flex-row items-center justify-center">
            {userLocalData.plan?.status != "cancelled" && (
              <button
                className="text-black  outline-none rounded-xl w-fit-content mt-3"
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  height: "50px",
                  textDecorationLine: "underline",
                  flexShrink: 0,
                }}
                onClick={() => {
                  if (
                    userLocalData?.isTrial === false &&
                    userLocalData?.cancelPlanRedemptions === 0
                  ) {
                    // //console.log;
                    setGiftPopup(true);
                  } // if (userLocalData?.isTrial === true && userLocalData?.cancelPlanRedemptions !== 0)
                  else {
                    // //console.log;
                    setShowConfirmCancelPlanPopup(true);
                  }
                  //// //console.log
                  //// //console.log
                }}
              >
                Cancel AgentX
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ fontSize: 16, fontWeight: "700", marginTop: 40 }}>
        My Billing History
      </div>

      <div className="w-full flex flex-row justify-between mt-10 px-10">
        <div className="w-5/12">
          <div style={styles.text}>Name</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Amount</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Status</div>
        </div>
        <div className="w-3/12">
          <div style={styles.text}>Date</div>
        </div>
      </div>

      <div className="w-full">
        {historyLoader ? (
          <div className="w-full flex flex-row items-center justify-center mt-8 pb-12">
            <CircularProgress size={35} thickness={2} />
          </div>
        ) : (
          <div className="w-full">
            {PaymentHistoryData.map((item) => (
              <div
                key={item.id}
                className="w-full flex flex-row justify-between mt-10 px-10"
              >
                <div className="w-5/12 flex flex-row gap-2">
                  <div className="truncate" style={styles.text2}>
                    {item.title}
                  </div>
                </div>
                <div className="w-2/12">
                  <div style={styles.text2}>${item.price.toFixed(2)}</div>
                </div>
                <div className="w-2/12 items-start">
                  <div
                    className="p-2 flex flex-row gap-2 items-center"
                    style={{
                      backgroundColor: "#01CB7610",
                      borderRadius: 20,
                      width: "5vw",
                    }}
                  >
                    <div
                      style={{
                        height: 8,
                        width: 8,
                        borderRadius: 5,
                        background: "#01CB76",
                      }}
                    ></div>
                    <div
                      style={{
                        fontSize: 15,
                        color: "#01CB76",
                        fontWeight: 500,
                      }}
                    >
                      Paid
                    </div>
                  </div>
                </div>
                <div className="w-3/12">
                  <div style={styles.text2}>
                    {GetFormattedDateString(item?.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {/* Modal for Gift popup */}
      <Modal
        open={giftPopup}
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
          <div className="flex flex-row justify-center w-full h-[100%]">
            <div
              className="sm:w-7/12 w-full h-[70%]"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
                paddingBottom: "20px",
              }}
            >
              <div className="flex flex-row justify-end">
                <button
                  className="outline-none"
                  onClick={() => setGiftPopup(false)}
                >
                  <Image
                    src={"/assets/crossIcon.png"}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>

              <div
                className="text-center text-purple"
                style={{
                  fontWeight: "600",
                  fontSize: 16.8,
                }}
              >
                {`Here’s a Gift`}
              </div>

              <div className="flex flex-row items-center justify-center w-full mt-6">
                <div
                  className="text-center  w-full"
                  style={{
                    fontWeight: "600",
                    fontSize:
                      ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 24,
                    width: ScreenWidth > 1200 ? "70%" : "100%",
                    alignSelf: "center",
                  }}
                >
                  {`Don’t Hang Up Yet! Get 30 Minutes of Free Talk Time and Stay Connected!`}
                </div>
              </div>

              <div className="flex flex-col items-center px-4 w-full">
                <div
                  className={`flex flex-row items-center gap-2 text-purple ${ScreenWidth < 1200 ? "mt-4" : "mt-6"
                    }bg-[#402FFF10] py-2 px-4 rounded-full`}
                  style={styles.gitTextStyle}
                >
                  <Image
                    src={"/svgIcons/gift.svg"}
                    height={
                      ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 22
                    }
                    width={
                      ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 22
                    }
                    alt="*"
                  />
                  Enjoy your next calls on us
                </div>
                <div className="w-full flex flex-row justify-center items-center mt-8">
                  <div style={{ position: "relative" }}>
                    <Image
                      src={"/svgIcons/giftIcon.svg"}
                      height={81}
                      width={81}
                      alt="*"
                      className="-mb-28 ms-4"
                      style={{
                        zIndex: 9999,
                        position: "relative",
                      }}
                    />
                    <div
                      className="text-purple"
                      style={{
                        fontSize: 200,
                        fontWeight: "400",
                        zIndex: 0,
                        position: "relative",
                      }}
                    >
                      30
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: "700",
                    }}
                  >
                    Mins
                  </div>
                </div>
                {redeemLoader ? (
                  <div className="h-[50px] w-full flex flex-row items-center justify-center">
                    <CircularProgress size={30} />
                  </div>
                ) : (
                  <button
                    className="rounded-lg text-white bg-purple outline-none"
                    style={{
                      fontWeight: "700",
                      fontSize: "16",
                      height: "50px",
                      width: "340px",
                    }}
                    onClick={handleRedeemPlan}
                  >
                    Claim my 30 minutes
                  </button>
                )}
                <button
                  className="outline-none mt-6"
                  style={{
                    fontWeight: "600",
                    fontSize: 16.8,
                  }}
                  onClick={() => {
                    setShowConfirmCancelPlanPopup(true);
                  }}
                >
                  {`No thank you, I’d like to cancel my Agentx`}
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal for cancel plan confirmation */}
      <Modal
        open={showConfirmCancelPlanPopup} //addPaymentPopUp
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000030",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="md:8/12 lg:w-6/12 sm:w-11/12 w-full"
          sx={styles.paymentModal}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
                height: "394px",
              }}
            >
              <div className="flex flex-row justify-end">
                <button onClick={() => setShowConfirmCancelPlanPopup(false)}>
                  <Image
                    src={"/assets/crossIcon.png"}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>
              <div
                className="text-center mt-8"
                style={{
                  fontWeight: "600",
                  fontSize: 22,
                }}
              >
                Are you sure ?
              </div>

              <div className="flex flex-row items-center justify-center w-full mt-6">
                <div
                  className="text-center"
                  style={{
                    fontWeight: "500",
                    fontSize: 15,
                    width: "70%",
                    alignSelf: "center",
                  }}
                >
                  Canceling your AgentX means you lose access to your agents,
                  leads, pipeline, staff and more.
                </div>
              </div>

              <button
                className="w-full flex flex-row items-center h-[50px] rounded-lg bg-purple text-white justify-center mt-10"
                style={{
                  fontWeight: "600",
                  fontSize: 16.8,
                  outline: "none",
                }}
              >
                Never mind, keep my AgentX
              </button>

              {cancelPlanLoader ? (
                <div className="w-full flex flex-row items-center justify-center mt-8">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <button
                  className="w-full flex flex-row items-center rounded-lg justify-center mt-8"
                  style={{
                    fontWeight: "600",
                    fontSize: 16.8,
                    outline: "none",
                  }}
                  onClick={handleCancelPlan}
                // onClick={() => { setShowConfirmCancelPlanPopup2(true) }}
                >
                  Yes. Cancel
                </button>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* del pln last step */}
      <Modal
        open={showConfirmCancelPlanPopup2} //showConfirmCancelPlanPopup2
        // open={true}
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000030",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box
          className="md:9/12 lg:w-7/12 sm:w-10/12 w-full"
          sx={styles.paymentModal}
        >
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-7/12 w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
                // height: "394px"
              }}
            >
              <div className="flex flex-row justify-between items-center">
                <div
                  style={{
                    fontSize: 16.8,
                    fontWeight: "500",
                    paddingLeft: "12px",
                  }}
                >
                  Cancel Plan
                </div>
                <button onClick={() => setShowConfirmCancelPlanPopup2(false)}>
                  <Image
                    src={"/assets/crossIcon.png"}
                    height={40}
                    width={40}
                    alt="*"
                  />
                </button>
              </div>

              <div className="flex flex-row items-center justify-center">
                <Image
                  src={"/svgIcons/warning2.svg"}
                  height={49}
                  width={49}
                  alt="*"
                />
              </div>

              <div
                style={{
                  fontWeight: "600",
                  fontSize: 22,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                AgentX Successfully Canceled
              </div>

              <div
                style={{
                  fontWeight: "500",
                  fontSize: 16,
                  textAlign: "center",
                  marginTop: 30,
                }}
              >
                {`Tell us why you’re canceling to better improve our platform for you.`}
              </div>

              <div className="w-full flex flex-row items-center justify-center">
                <div className="mt-9 w-10/12">
                  {cancelPlanReasons.map((item, index) => (
                    <button
                      onClick={() => {
                        handleSelectReason(item);
                      }}
                      key={index}
                      style={{
                        fontWeight: "500",
                        fontSize: 15,
                        textAlign: "start",
                        marginTop: 6,
                      }}
                      className="flex flex-row items-center gap-2"
                    >
                      <div

                        className="rounded-full flex flex-row items-center justify-center"
                        style={{
                          border:
                            item.reason === selectReason
                              ? "2px solid #7902DF"
                              : "2px solid #15151510",
                          // backgroundColor: item.reason === selectReason ? "#7902DF" : "",
                          // margin: item.reason === selectReason && "5px",
                          height: "20px",
                          width: "20px",
                        }}
                      >
                        <div
                          className="w-full h-full rounded-full"
                          style={{
                            backgroundColor:
                              item.reason === selectReason && "#7902DF",
                            height: "12px",
                            width: "12px",
                          }}
                        />
                      </div>
                      <div>{item.reason}</div>
                    </button>
                  ))}
                  {showOtherReasonInput && (
                    <div className="w-full mt-4">
                      <TextField
                        inputRef={textFieldRef}
                        placeholder="Type here"
                        className="focus:ring-0 outline-none"
                        variant="outlined"
                        fullWidth
                        multiline
                        minRows={4}
                        maxRows={5}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              border: "1px solid #00000010", // Normal border
                            },
                            "&:hover fieldset": {
                              border: "1px solid #00000010", // Hover border
                            },
                            "&.Mui-focused fieldset": {
                              border: "none", // Remove border on focus
                            },
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none", // Additional safety to remove outline
                          },
                          "& .Mui-focused": {
                            outline: "none", // Remove focus outline
                          },
                        }}
                        value={otherReasonInput}
                        onChange={(e) => {
                          setOtherReasonInput(e.target.value);
                        }}
                      />
                    </div>
                  )}
                  {cancelReasonLoader ? (
                    <div className="flex flex-row items-center justify-center mt-10">
                      <CircularProgress size={35} />
                    </div>
                  ) : (
                    <button
                      className="w-full flex flex-row items-center h-[50px] rounded-lg text-white justify-center mt-10"
                      style={{
                        fontWeight: "600",
                        fontSize: 16.8,
                        outline: "none",
                        backgroundColor: (selectReason && (selectReason !== "Others" || otherReasonInput))
                          ? "#7902df"
                          : "#00000050",
                        color: selectReason && (selectReason !== "Others" || otherReasonInput)
                          ? "#ffffff"
                          : "#000000",
                      }}
                      onClick={() => {
                        handleDelReason();
                      }}
                      disabled={!selectReason && (selectReason !== "Others" || otherReasonInput)}
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default AgencyBilling;
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
    color: "#7902DF65",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: "10px",
  },
};
