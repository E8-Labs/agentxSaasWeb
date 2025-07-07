import Body from "@/components/onboarding/Body";
import Header from "@/components/onboarding/Header";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Footer from "@/components/onboarding/Footer";
import PricingBox from "../test/PricingBox";
import { Box, CircularProgress, Modal } from "@mui/material";
import AddCardDetails from "./addpayment/AddCardDetails";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Apis from "../apis/Apis";
import axios from "axios";
import CycleArray from "../onboarding/extras/CycleArray";
import { PersistanceKeys } from "@/constants/Constants";

let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
// //console.log;
const stripePromise = loadStripe(stripePublickKey);

const CreatAgent3 = ({ handleContinue, smallTerms, user, handleBack, screenWidth }) => {
  const router = useRouter();
  const [togglePlan, setTogglePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(false);
  const [addPaymentPopUp, setAddPaymentPopUp] = useState(false);
  const [addPaymentSuccessPopUp, setAddPaymentSuccessPopUp] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [shouldContinue, setShouldContinue] = useState(true);
  //variables for 2nd plan subscription
  const [showSubscribeplan2, setShowSubscribeplan2] = useState(false);
  const [togglePlan2, setTogglePlan2] = useState(1);
  const [selectedPlan2, setSelectedPlan2] = useState(1);
  const [subscribePlanLoader, setSubscribePlanLoader] = useState(false);

  //code for adding stripe
  const [cardData, getcardData] = useState("");

  useEffect(() => {
    if (togglePlan === true && agreeTerms === true) {
      setShouldContinue(false);
    }
  }, [togglePlan, agreeTerms]);


  useEffect(() => {
    const handlePopState = () => {
      console.log("🔙 Back gesture or browser back triggered");
      // if(window.screenWidth < 640){
      handleBack()
      // }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);


  //selects 1st plan popup
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

  const handleClose = () => {
    if (addPaymentPopUp) {
      setAddPaymentPopUp(false);
    } else if (addPaymentSuccessPopUp) {
      setAddPaymentSuccessPopUp(false);
    }
  };

  const handleToggleTermsClick = () => {
    setAgreeTerms(!agreeTerms);
  };

  //handles seleting the reasurance plan popup
  const handleTogglePlanClick2 = (item) => {
    // if (togglePlan) {
    //     setTogglePlan(prevId => (prevId === item.id ? null : item.id));
    //     setSelectedPlan(prevId => (prevId === item ? null : item));
    // } else {
    //     setSelectedPlan(prevId => (prevId === item ? null : item));
    //     setAddPaymentPopUp(true);
    // }
    // setTogglePlan(prevId => (prevId === item.id ? null : item.id));
    setTogglePlan2(item.id);
    setSelectedPlan2((prevId) => (prevId === item ? null : item));
    // setTogglePlan(prevId => (prevId === id ? null : id));
  };

  //function to subscribe plan
  const handleSubScribePlan = async () => {
    try {
      let planType = null;

      //// //console.log;

      if (togglePlan2 === 1) {
        planType = "Plan30";
      } else if (togglePlan2 === 2) {
        planType = "Plan120";
      } else if (togglePlan2 === 3) {
        planType = "Plan360";
      } else if (togglePlan2 === 4) {
        planType = "Plan720";
      }

      // //console.log;

      setSubscribePlanLoader(true);
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        AuthToken = LocalDetails.token;
      }

      // //console.log;

      const ApiData = {
        plan: planType,
        updateFuturePlan: true,
      };

      // //console.log;

      const ApiPath = Apis.subscribePlan;
      // //console.log;
      // return
      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });
      // //console.log;

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // handleClose();
          let screenWidth = 1000;
          if (typeof window !== "undefined") {
            screenWidth = window.innerWidth; // Get current screen width
          }
          const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px

          if (screenWidth <= SM_SCREEN_SIZE) {
            // //console.log;
            router.push("/createagent/desktop");
          } else {
            // //console.log;
            handleContinue();
          }
        }
      }
    } catch (error) {
      console.error("Error occured in api is:", error);
      setSubscribePlanLoader(false);
    } finally {
      setSubscribePlanLoader(false);
    }
  };

  const facilities = [
    {
      id: 1,
      title: "Cancel anytime",
    },
    {
      id: 2,
      title: "Unlimited Agents",
    },
    {
      id: 3,
      title: "AI Powered CRM",
    },
    {
      id: 6,
      title: "Real Time Booking",
    },
  ];

  //code for mobile view facilities
  const mobileFacilities = [
    {
      id: 1,
      title: "Cancel anytime",
    },
    {
      id: 2,
      title: "Unlimited Agents",
    },
    {
      id: 3,
      title: "AI Powered CRM",
    },
    {
      id: 6,
      title: "Real Time Booking",
    },
  ];

  const plans = [
    {
      id: 1,
      startFreeLabel: "Free",
      mints: 30,
      calls: 125,
      isTrial: true,
      trial: "7 Day Trial",
      details: "Perfect to start for free, then $45 to continue.",
      originalPrice: "45",
      discountPrice: "Free Trial",
      planStatus: "Free",
      status: "",
    },
    {
      id: 2,
      mints: 120,
      isTrial: false,
      calls: "500",
      details: "Perfect for lead updates and engagement.", // "Perfect for lead updates and engagement.",
      originalPrice: "165",
      discountPrice: "99",
      planStatus: "40%",
      status: "",
    },
    {
      id: 3,
      mints: 360,
      isTrial: false,
      calls: "1500",
      details: "Perfect for lead reactivation and prospecting.",
      originalPrice: "540",
      discountPrice: "299",
      planStatus: "50%",
      status: "Popular",
    },
    {
      id: 4,
      mints: 720,
      isTrial: false,
      calls: "5k",
      details: "Ideal for teams and reaching new GCI goals.  ",
      originalPrice: "1200",
      discountPrice: "599",
      planStatus: "50%",
      status: "Best Value",
    },
  ];

  const plans2 = [
    {
      id: 1,
      mints: 30,
      isTrial: true,
      calls: 125,
      details: "Great for trying out AI sales agents",
      originalPrice: "",
      discountPrice: "$45",
      planStatus: "",
      status: "",
    },
    {
      id: 2,
      mints: 120,
      isTrial: false,
      calls: "500",
      details: "Perfect for lead updates and engagement.",
      originalPrice: "165",
      discountPrice: "99",
      planStatus: "40%",
      status: "",
    },
    {
      id: 3,
      mints: 360,
      isTrial: false,
      calls: "1500",
      details: "Perfect for lead reactivation and prospecting.",
      originalPrice: "540",
      discountPrice: "299",
      planStatus: "50%",
      status: "Popular",
    },
    {
      id: 4,
      mints: 720,
      isTrial: false,
      calls: "5k",
      details: "Ideal for teams and reaching new GCI goals.  ",
      originalPrice: "1200",
      discountPrice: "599",
      planStatus: "50%",
      status: "Best Value",
    },
  ];

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#15151580",
    },
    giftTextStyle: {
      fontSize: 14,
      fontWeight: "500",
    },
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
      // width: "100px",
      color: "#000000",
      fontWeight: "600",
      fontSize: 18,
      marginLeft: "10px",
    },
    paymentModal: {
      // height: "auto",
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

  const windowWidth = () => {
    if (typeof window !== "undefined") {
      console.log("Window width is", window.innerWidth);
      return window.innerWidth;
    }
  };


  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center  h-[100svh]"
    >
      <div className="bg-white sm:rounded-2xl w-full lg:w-10/12 h-[90vh] py-4 bg-red">
        <div className="flex flex-col h-[100%]  ">
          {/*for small size screen i agreeto terms and conditions*/}
          <div className="overflow-auto sm:overflow-none">
            {/* header */}
            <div className="h-[10%] ">
              <Header />
            </div>
            {/* Body */}
            <div
              className="flex flex-col items-center px-4 w-full  md:h-[86%] overflow-none sm:overflow-none"
              style={{ scrollbarWidth: "none" }}
            >
              <div
                className="mt-6 w-11/12 sm:text-3xl text-xl font-[600]"
                style={{ textAlign: "center" }}
              >
                Your first 30 minutes are on us!
              </div>
              <div
                className="mt-2 sm:text-[22px]"
                style={{ fontWeight: "600" }}
              >
                Start for free, then pay as you go
              </div>

              {/*  Plans array start here  */}
              <div
                className={`sm:h-[75%] overflow-none sm:overflow-auto  w-full flex flex-col items-center ${selectedPlan ? "pb-36" : ""
                  }`}
                style={{ scrollbarWidth: "none" }}
              >
                {/* For mobile view */}
                <div
                  className="sm:hidden flex flex-wrap w-full sm:w-10/12 md:w-4/12 "
                  style={{ backgroundColor: "" }}
                >
                  {mobileFacilities.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-row items-center justify-start pl-4 gap-1 w-1/2 mt-4"
                    >
                      <div
                        className="flex flex-row items-center gap-2 justify-start ml-2 "
                        style={{ width: "auto" }}
                      >
                        <div>
                          <Image
                            src={"/assets/tickMark.png"}
                            height={14}
                            width={17}
                            alt="*"
                          />
                        </div>
                        <div style={{ fontWeight: "500", fontSize: 13 }}>
                          {item.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* For greater then small size screen */}
                <div
                  className="sm:flex hidden flex flex-wrap w-full sm:w-10/12 md:w-4/12 "
                  style={{ backgroundColor: "" }}
                >
                  {facilities.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-row items-center justify-start pl-4 gap-2 w-1/2 mt-1"
                    >
                      <div
                        className="flex flex-row items-center gap-2 justify-start ml-2 "
                        style={{ width: "auto" }}
                      >
                        <div>
                          <Image
                            src={"/assets/tickMark.png"}
                            height={14}
                            width={17}
                            alt="*"
                          />
                        </div>
                        <div style={{ fontWeight: "500", fontSize: 13 }}>
                          {item.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="hidden md:flex flex flex-row items-center justify-center py-3 gap-4 mt-6 mb-3 px-4"
                  style={{
                    backgroundColor: "#402FFF20",
                    borderRadius: "50px",
                    width: "fit-content",
                  }}
                >
                  <Image
                    src={"/svgIcons/attachIcon.svg"}
                    height={24}
                    width={24}
                    alt="*"
                  />
                  <div className="text-purple" style={styles.giftTextStyle}>
                    Every plan renews monthly and tops up when your minutes hit
                    0
                  </div>
                </div>

                {/* <div
                className="flex flex-row md:hidden items-center justify-center py-3 gap-4 mt-6 mb-8 px-4"
                style={{
                  backgroundColor: "#402FFF20",
                  borderRadius: "50px",
                  width: "fit-content",
                }}
              >
                <Image
                  src={"/svgIcons/gift.svg"}
                  height={24}
                  width={24}
                  alt="*"
                />
                <div className="text-purple" style={styles.giftTextStyle}>
                  Enjoy your first calls on us
                </div>
              </div> */}

                {plans.map((item, index) => (
                  <button
                    key={item.id}
                    className="w-full md:w-10/12 lg:w-6/12 mt-4"
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
                        backgroundColor:
                          item.id === togglePlan ? "#402FFF05" : "",
                      }}
                    >
                      {item.status && (
                        <div
                          className="-mt-[18px] sm:hidden flex px-2 py-1 bg-purple rounded-full text-white"
                          style={{
                            fontSize: 11.6,
                            fontWeight: "500",
                            width: "fit-content",
                          }}
                        >
                          {item.status}
                        </div>
                      )}
                      <div
                        style={{
                          ...styles.triangleLabel,
                          borderTopRightRadius: "7px",
                        }}
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
                          <div
                            style={{
                              color: "#151515",
                              fontSize: 20,
                              fontWeight: "600",
                            }}
                            className="flex flex-row items-center gap-2"
                          >
                            {item.startFreeLabel
                              ? `${item.startFreeLabel} `
                              : ""}
                            {item.mints}mins
                            {item.trial ? ` ${item.trial} ` : "  "}|{" "}
                            {item.calls} Calls*
                            {item.status && (
                              <div
                                className="flex hidden sm:flex px-2 py-1 bg-purple rounded-full text-white"
                                style={{ fontSize: 11.6, fontWeight: "500" }}
                              >
                                {item.status}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-row items-center justify-between ">
                            <div
                              className="mt-2"
                              style={{
                                color: "#15151590",
                                fontSize: 12,
                                width: "76%",
                                fontWeight: "600",
                              }}
                            >
                              {item.details}
                            </div>
                            <div className="flex flex-row items-center justify-end space-x-1 ">
                              <div className="line-through text-gray-500 text-sm">
                                ${item.originalPrice}
                              </div>
                              <div
                                className="flex flex-row justify-start items-start "
                                style={{
                                  // fontSize: `${item.isTrial ? 15 : 18}px`,
                                  width: `${item.isTrial ? 75 : 70}px`,
                                }}
                              >
                                <div
                                  className="font-bold  "
                                  style={{
                                    fontSize: `${item.isTrial ? 15 : 18}px`,
                                  }}
                                >
                                  {item.isTrial ? "" : "$"}
                                  {item.discountPrice}
                                </div>
                                {!item.isTrial && (
                                  <p style={{ color: "#15151580" }}>/mo*</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                <div
                  className="w-full md:w-10/12 lg:w-6/12 mt-4 flex flex-row items-start gap-2 cursor-pointer"
                  style={{
                    borderRadius: "7px",
                    border: "1px solid #15151540",
                    padding: "15px",
                    backgroundColor: "#330864",
                  }}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open(
                        PersistanceKeys.ExternalCalendarLink,
                        "_blank"
                      );
                    }
                  }}
                >
                  <Image
                    src={"/assets/diamond.png"}
                    className="mt-2"
                    height={18}
                    width={20}
                    alt="*"
                  />
                  <div>
                    <div
                      style={{
                        color: "#ffffff",
                        fontSize: 20,
                        fontWeight: "600",
                      }}
                    >
                      Enterprise Plan
                    </div>
                    <div className="flex flex-row items-start justify-between w-full">
                      <div
                        style={{
                          color: "#ffffff",
                          fontSize: 12,
                          fontWeight: "600",
                          width: "60%",
                        }}
                      >
                        Custom solution specific to your business. Integrate
                        AgentX into your sales operation.
                      </div>
                      <button
                        className="text-[#ffffff] pe-8"
                        style={{ fontSize: 14, fontWeight: "700" }}
                        onClick={() => {
                          window.open(
                            "https://api.leadconnectorhq.com/widget/bookings/agentx/enterprise-plan ",
                            "_blank"
                          );
                        }}
                      >
                        Contact Team
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="hidden sm:flex"
                style={{
                  fontWeight: "600",
                  fontSize: 17,
                  position: "absolute",
                  bottom: "2%",
                  right: "11%",
                  // backgroundColor: "red"
                }}
              >
                <CycleArray />
              </div>
            </div>
          </div>
          {/*<div className="flex flex-row items-center  gap-4 justify-start w-full md:w-10/12 lg:w-6/12 mt-6 pb-10 pl-5 sm:hidden">
            <button onClick={handleToggleTermsClick}>
              {agreeTerms ? (
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
            <TermsText />
            </div>*/}
          {selectedPlan && (
            <div className="flex flex-col gap-2 absolute left-1/2 transform -translate-x-1/2 right-2 bottom-[3%] bg-white/30 backdrop-blur-lg w-full md:w-10/12 lg:w-5/12">
              {/* <div className="flex flex-row items-center gap-4 justify-start w-full  mt-6 pb-4 hidden sm:flex ">
                <button onClick={handleToggleTermsClick}>
                  {agreeTerms ? (
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
                <TermsText />
              </div> */}
              <div className=" w-full flex-col items-center flex mt-2">
                {selectedPlan ? (
                  <div className="w-full flex-col items-center flex">
                    {selectedPlan?.id > 1 ? (
                      <button
                        className="bg-purple w-full rounded-lg text-white h-[50px]"
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          // backgroundColor: selectedPlan && agreeTerms ? "#00000020" : "",
                          // color: selectedPlan?.id > 1 && agreeTerms ? "#000000" : ""
                        }}
                        onClick={() => {
                          setAddPaymentPopUp(true);
                        }}
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        className="bg-purple w-full rounded-lg text-white h-[50px]"
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          // backgroundColor: selectedPlan && agreeTerms ? "#00000020" : "",
                          // color: selectedPlan && agreeTerms ? "#000000" : ""
                        }}
                        onClick={() => {
                          setAddPaymentPopUp(true);
                        }}
                      >
                        Claim 30 Mins
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    disabled={true}
                    className="w-full rounded-lg text-white h-[50px]"
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      backgroundColor: "#00000020",
                      color: "#000000",
                    }}
                    onClick={() => {
                      setAddPaymentPopUp(true);
                    }}
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add Payment Modal */}
        <Modal
          open={addPaymentPopUp} //addPaymentPopUp
          // open={true}
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: "#00000020",
              backdropFilter: "blur(15px)",
            },
          }}
        >
          <Box
            className="flex items-center justify-center w-full h-full"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="flex flex-row justify-center w-full">
              <div
                className="sm:w-5/12 w-full"
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  borderRadius: "13px",
                }}
              >
                <div className="flex flex-row justify-end">
                  <button onClick={handleClose}>
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
                <div className="text-center mt-2 text-[18px] font-[700] md:text-[24px] md:font-[700]">
                  {selectedPlan?.id > 1
                    ? "Add your payment method" //"Select a plan that fits your needs"
                    : "You will not be charged today"}
                  {/* You will not be charged today */}
                </div>

                {selectedPlan?.id > 1 ? (
                  <div
                    className="text-center mt-4 md:text-[17px] md:font-[600]" //style={styles.headingStyle}
                  >
                    Your minutes will renew monthly or after using{" "}
                    {selectedPlan?.mints} mins
                  </div>
                ) : (
                <div
                  className="text-center test-14 font-[500] mt-4 sm:text-[17px] sm:font-[500]"
                  style={{
                    // fontSize: 16,
                    // fontWeight: "600",
                    color: "#00000060",
                  }}
                >
                  Payment starts after 7 days or 30 min of AI usage
                </div>
                )}

                <Elements stripe={stripePromise}>
                  <AddCardDetails
                    //selectedPlan={selectedPlan}
                    stop={stop}
                    getcardData={getcardData}
                    setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp}
                    handleClose={handleClose}
                    togglePlan={togglePlan}
                    textBelowContinue={`${selectedPlan?.mints === 30
                      ? "Trial is limited to 30 mins"
                      : ""
                      }`}
                  // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                  />
                </Elements>
              </div>
            </div>
          </Box>
        </Modal>

        {/* Add Payment Success Modal */}
        <Modal
          open={addPaymentSuccessPopUp} //addPaymentSuccessPopUp
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: "#00000090",
              backdropFilter: "blur(10px)",
            },
          }}
        >
          <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="sm:w-7/12 w-full mx-2"
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  borderRadius: "13px",
                }}
              >
                <div className="flex flex-row justify-end">
                  {/* <button onClick={handleClose}>
                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                    </button> */}
                </div>
                <div className="mt-4 flex flex-row justify-center w-full">
                  <Image
                    src={"/svgIcons/successMsgIcon.svg"}
                    height={85}
                    width={85}
                    alt="*"
                  />
                </div>

                {selectedPlan?.id > 1 ? (
                  <div
                    className="text-center mt-4"
                    style={{ fontWeight: "700", fontSize: 24 }}
                  >
                    Payment Successfully Added
                  </div>
                ) : (
                  <div
                    className="text-center mt-4"
                    style={{ fontWeight: "700", fontSize: 24 }}
                  >
                    Payment Successful
                  </div>
                )}

                <button
                  className="bg-purple text-white w-full rounded-xl mt-6 mb-6"
                  style={{ fontSize: 16, fontWeight: "700", height: "50px" }}
                  onClick={() => {
                    let screenWidth = 1000;
                    if (typeof window !== "undefined") {
                      screenWidth = window.innerWidth; // Get current screen width
                    }
                    const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px

                    if (screenWidth <= SM_SCREEN_SIZE) {
                      // if (selectedPlan.id === 1) {
                      //   setShowSubscribeplan2(true);
                      // } else {
                        router.push("/createagent/desktop");
                      // }
                      // //console.log;
                    } else {
                      // //console.log;
                      // if (selectedPlan.id === 1) {
                      //   setShowSubscribeplan2(true);
                      // } else {
                        handleContinue();
                      // }
                    }
                  }}
                >
                  Continue
                </button>

                {/* Can be use full to add shadow */}
                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
              </div>
            </div>
          </Box>
        </Modal>

        {/* Modal 2 to reassure the plan */}
        <Modal
          open={showSubscribeplan2} // showSubscribeplan2
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: "#00000020",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              // bgcolor: "red",
            },
          }}
        >
          <Box
            className="flex items-center justify-center w-full h-[100svh] md:h-full"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="flex flex-col w-[100%] sm:w-5/12 max-h-[95svh]  md:max-h-[95vh] bg-white"
              style={{
                borderRadius: "13px",
                overflow: "hidden", // Prevents overflow of the modal content
              }}
            >
              {/* Scrollable Content */}
              <div
                className="flex flex-col items-center w-full overflow-auto"
                style={{
                  padding: 20,
                  flex: 1, // Allows the scrollable content to take remaining space
                }}
              >
                {/* Header Content */}
                <div
                  className="mt-6 w-11/12 sm:text-3xl text-lg font-[600]"
                  style={{ textAlign: "center" }}
                >
                  Select a plan that fits your needs
                </div>

                <div
                  className="w-11/12 sm:text-[24px] text-[13px] font-[400]"
                  style={{ textAlign: "center" }}
                >
                  Continue with a plan after your free 30 mins
                </div>

                <div className="w-full flex flex-row items-center justify-center">
                  <div
                    className="hidden md:flex flex-row items-center justify-center py-3 gap-4 mt-6 mb-8 px-4"
                    style={{
                      backgroundColor: "#402FFF20",
                      borderRadius: "50px",
                      width: "fit-content",
                    }}
                  >
                    <Image
                      src={"/svgIcons/attachIcon.svg"}
                      height={24}
                      width={24}
                      alt="*"
                    />
                    <div className="text-purple" style={styles.giftTextStyle}>
                      Invest In Your Business Growth.
                    </div>
                  </div>
                </div>

                {/* Plans Section */}
                <div className="w-full">
                  {plans2.map((item, index) => (
                    <button
                      key={item.id}
                      className="w-full mt-4"
                      onClick={(e) => handleTogglePlanClick2(item)}
                    >
                      <div
                        className="px-4 py-1 pb-4"
                        style={{
                          ...styles.pricingBox,
                          border:
                            item.id === togglePlan2
                              ? "2px solid #7902DF"
                              : "1px solid #15151520",
                          backgroundColor:
                            item.id === togglePlan2 ? "#402FFF05" : "",
                        }}
                      >
                        <div
                          style={{
                            ...styles.triangleLabel,
                            borderTopRightRadius: "7px",
                          }}
                        ></div>
                        <span style={styles.labelText}>{item.planStatus}</span>
                        <div
                          className="flex flex-row items-start gap-3"
                          style={styles.content}
                        >
                          <div className="mt-1">
                            <div>
                              {item.id === togglePlan2 ? (
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
                            {item.id === 1 && (
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
                            {item.status && (
                              <div
                                className="-mt-[27px] sm:hidden px-2 py-1 bg-purple rounded-full text-white"
                                style={{
                                  fontSize: 11.6,
                                  fontWeight: "500",
                                  width: "fit-content",
                                }}
                              >
                                {item.status}
                              </div>
                            )}
                            <div
                              style={{
                                color: "#151515",
                                fontSize: 20,
                                fontWeight: "600",
                              }}
                              className="flex flex-row items-center gap-1"
                            >
                              {item.mints}mins | {item.calls} calls*
                              {item.status && (
                                <div
                                  className="flex hidden sm:flex px-2 py-1 bg-purple rounded-full text-white"
                                  style={{
                                    fontSize: 11.6,
                                    fontWeight: "500",
                                  }}
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
                                  width: "80%",
                                  fontWeight: "600",
                                }}
                              >
                                {item.details}
                              </div>
                              <div className="flex flex-row items-center">
                                {item.originalPrice && (
                                  <div style={styles.originalPrice}>
                                    ${item.originalPrice}
                                  </div>
                                )}
                                <div className="flex flex-row justify-start items-start">
                                  <div style={styles.discountedPrice}>
                                    {item.isTrial ? "" : "$"}
                                    {item.discountPrice}
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
              </div>
              <div className="flex flex-row pl-5 items-center gap-4 justify-start w-full  mt-6 pb-4">
                <button onClick={handleToggleTermsClick}>
                  {agreeTerms ? (
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
                <TermsText />
              </div>
              {/* Fixed "Continue" Button */}
              <div
                className="flex items-center justify-center w-full"
                style={{
                  padding: "16px 20px",
                  backgroundColor: "#fff", // Optional for clarity
                  borderTop: "1px solid #eaeaea", // Optional for clarity
                  flexShrink: 0, // Prevent shrinking
                }}
              >
                {subscribePlanLoader ? (
                  <div className="w-full flex flex-row items-center justify-center mt-4">
                    <CircularProgress size={35} />
                  </div>
                ) : (
                  <button
                    disabled={!agreeTerms || !togglePlan2}
                    className="w-full bg-purple text-white rounded-xl"
                    style={{
                      ...styles.headingStyle,
                      height: "50px",
                      backgroundColor:
                        agreeTerms && togglePlan2 ? "#7902DF" : "#00000010",
                      color: agreeTerms && togglePlan2 ? "white" : "#000000",
                    }}
                    onClick={() => {
                      let windowWidth = 1000;
                      if (typeof window !== "undefined") {
                        windowWidth = window.innerWidth;
                      }
                      if (togglePlan2 === 1) {
                        // //console.log;
                        if (windowWidth < 640) {
                          setSubscribePlanLoader(true);
                          router.push("/createagent/desktop");
                        } else {
                          handleContinue();
                        }
                      } else {
                        // //console.log;
                        handleSubScribePlan();
                      }
                    }}
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default CreatAgent3;

function TermsText() {

  const windowWidth = () => {
    if (typeof window !== "undefined") {
      console.log("Window width is", window.innerWidth);
      return window.innerWidth;
    }
  }

  return (
    <div
      className="flex flex-row w-full items-center gap-1"
      style={{ color: "#151515", fontSize: windowWidth() < 640 ? 10 : 13, fontWeight: "600" }}
    >
      <p style={{ color: "#15151580" }}>
        I agree to{" "}
        <a
          href="https://www.myagentx.com/terms-and-condition" // Replace with the actual URL
          style={{ textDecoration: "underline", color: "black" }} // Underline and color styling
          target="_blank" // Opens in a new tab (optional)
          rel="noopener noreferrer" // Security for external links
        >
          Terms & Conditions
        </a>
        .
      </p>
    </div>
  );
}
