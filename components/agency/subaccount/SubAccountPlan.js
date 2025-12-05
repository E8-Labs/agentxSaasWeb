"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { Box, CircularProgress, LinearProgress, Modal } from "@mui/material";
import { AuthToken } from "../plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import AddCardDetails from "@/components/createagent/addpayment/AddCardDetails";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import getProfileDetails from "@/components/apis/GetProfile";
import LoaderAnimation from "@/components/animations/LoaderAnimation";
import { PersistanceKeys } from "@/constants/Constants";
import { formatDecimalValue } from "../agencyServices/CheckAgencyData";
import UserPlans from "@/components/userPlans/UserPlans";

//code for add card
let stripePublickKey =
  process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
    ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
    : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

const SubAccountPlan = ({ handleContinue, isFrom, handleClose }) => {
  const router = useRouter();

  const [initialLoader, setInitialLoader] = useState(true);
  const [togglePlan, setTogglePlan] = useState("");
  const [userPlans, setUserPlans] = useState([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subPlanLoader, setSubPlanLoader] = useState(false);
  const [canSubPlan, setCanSubPlan] = useState(false);
  const [addPaymentPopUp, setAddPaymentPopUp] = useState(false);

  const [errorMsg, setErrorMsg] = useState(null);
  const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);

  const [planSubscribed, setPlanSubscribed] = useState(false);

  const [subaccount, setSubaccount] = useState(null);

  const [disableContinue, setDisableContinue] = useState(false);

  useEffect(() => {
    getPlans();
    checkIsFromOnboarding()
  }, []);

  const checkIsFromOnboarding = () => {
    let data = localStorage.getItem(PersistanceKeys.SubaccoutDetails)
    if (data) {
      let subAcc = JSON.parse(data)
      setSubaccount(subAcc)
    }
  }

  //check if user can sub plan
  useEffect(() => {
    if (togglePlan && agreeTerms === true) {
      setCanSubPlan(true);
    } else {
      setCanSubPlan(false);
    }
  }, [togglePlan, agreeTerms]);

  //select a plan
  const handleTogglePlanClick2 = (item) => {
    setTogglePlan(item.id);
  };

  //toggle agree terms click
  const handleToggleTermsClick = () => {
    setAgreeTerms(!agreeTerms);
  };

  //close add card popup
  const handleCardAddedClose = async (data) => {
    try {
      setDisableContinue(true);
      await getProfileDetails();
      console.log("Card added details are here", data);
      if (data) {
        console.log("try to close popup");
        setAddPaymentPopUp(false);
        if (togglePlan) {
          console.log("trying to suubscribe");
          await subscribePlanClick();
        }
      }
    } catch (err) {
      console.log("Error occrued", err);
      setDisableContinue(false);
    }
  };
  //get plans apis
  const getPlans = async () => {
    try {
      setInitialLoader(true);
      const Token = AuthToken();
      const ApiPath = Apis.getSubAccountPlans;
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + Token,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log(
          "Response of get plans api is 2",
          response.data?.data?.monthlyPlans
        );
        setUserPlans(response.data?.data?.monthlyPlans);
        setInitialLoader(false);
      }
    } catch (error) {
      setInitialLoader(false);
      console.error("Error occured in getting plans", error);
    }
  };

  const isCardsAvailable = () => {
    let data = localStorage.getItem("User");
    if (data) {
      let u = JSON.parse(data);

      // console.log('data', u.user.cards)

      if (u.user.cards.length > 0) {
        return true;
      }
      return false;
    }
  };

  //subscribe plan
  const subscribePlanClick = async () => {
    setDisableContinue(true);
    // return
    if (isCardsAvailable() === false) {
      setAddPaymentPopUp(true);
      return;
    }

    try {
      setSubPlanLoader(true);
      const Token = AuthToken();
      const ApiPath = Apis.subAgencyAndSubAccountPlans;
      const formData = new FormData();
      formData.append("planId", togglePlan);
      for (let [key, value] of formData.entries()) {
        console.log(`${key} = ${value}`);
      }
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + Token,
        },
      });

      if (response) {
        console.log("Response of subscribe subaccount plan is", response.data);
        setSubPlanLoader(false);
        if (response.data.status === true) {
          setErrorMsg(response.data.message);
          setSnackMsgType(SnackbarTypes.Success);
          const D = localStorage.getItem("fromDashboard");
          if (D) {
            localStorage.removeItem("fromDashboard");
          }
          if (subaccount) {
            handleContinue()
          } else {
            setPlanSubscribed(true);
            router.push("/dashboard");

          }
        } else if (response.data.status === false) {
          setErrorMsg(response.data.message);
          setSnackMsgType(SnackbarTypes.Error);
          setDisableContinue(false);
          if (response.data.message === "No payment method added") {
            // setAddPaymentPopUp(true);
          }
        }
      }
    } catch (error) {
      console.error("Error occured in sub plan api is", error);
      setSubPlanLoader(false);
      setDisableContinue(false);
    }
  };

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

  return (
    <div className="w-full flex flex-row justify-center bg-white h-full">
      <AgentSelectSnackMessage
        isVisible={errorMsg !== null}
        message={errorMsg}
        hide={() => {
          setErrorMsg(null);
        }}
        type={snackMsgType}
      />

      {/* Progress bar */}
      <UserPlans
        isFrom={"SubAccount"}
        from="dashboard"
        handleContinue={() => {
          // alert("This is working function") 
          if (isFrom === "UpgradePlanForTeam") {
            handleClose();
          } else if (handleContinue && subaccount) {
            handleContinue()
          } else {
            setPlanSubscribed(true);
            router.push("/dashboard");
          }
        }}
        subPlanLoader={subPlanLoader}
      // handleBack={handleBack}
      />

      <LoaderAnimation isOpen={planSubscribed || subPlanLoader} title="Redirecting to dashboard..." />

      {/* Code for add card */}
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
        <Box
          className="flex lg:w-8/12 sm:w-full w-full justify-center items-center"
          sx={styles.paymentModal}
        >
          <div className="flex flex-row justify-center w-full ">
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
                <button onClick={() => setAddPaymentPopUp(false)}>
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
                  // stop={stop}
                  // getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                  handleClose={handleCardAddedClose}
                // togglePlan={togglePlan}
                // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default SubAccountPlan;

function TermsText() {
  return (
    <div
      className="flex flex-row items-center gap-1"
      style={{ color: "#151515", fontSize: 13, fontWeight: "600" }}
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
{/*
  <div className="w-6/12">
              <div
                // className="mt-4"
                style={{
                  fontWeight: "600",
                  fontSize: "38px",
                }}
              >
                Select a Plan
              </div>
              {initialLoader ? (
                <div className="mt-6 h-[95%] flex flex-row justify-center w-full">
                  <CircularProgress size={35} />
                </div>
              ) : (
                <div className="h-[50vh] overflow-y-auto">
                  {userPlans?.length > 0 ? (
                    <div className="mt-4">
                      {userPlans?.map((item) => (
                        <button
                          key={item.id}
                          className="w-full mt-4"
                          onClick={(e) => handleTogglePlanClick2(item)}
                        >
                          {item.hasTrial && (
                            <div className="w-full rounded-t-lg bg-gradient-to-r from-[#7902DF] to-[#C502DF] px-4 py-2">
                              <div className="flex flex-row items-center gap-2">
                                <Image
                                  src={"/otherAssets/batchIcon.png"}
                                  alt="*"
                                  height={24}
                                  width={24}
                                />
                                <div
                                  style={{
                                    fontWeight: "600",
                                    fontSize: 18,
                                    color: "white",
                                  }}
                                >
                                  First {item.hasTrial == true && (`| ${item.trialValidForDays}`)} Days Free
                                </div>
                              </div>
                            </div>
                          )}
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
                              // borderRadius: item.hasTrial == true ? "" : "10px",
                              borderTopLeftRadius: item.hasTrial == true ? "" : "10px",
                              borderTopRightRadius: item.hasTrial == true ? "" : "10px",
                              borderBottomLeftRadius: "10px",
                              borderBottomRightRadius: "10px",
                            }}
                          >
                            <div
                              style={{
                                ...styles.triangleLabel,
                                borderTopRightRadius: item.hasTrial == true ? "" : "7px",
                              }}
                            ></div>
                            <span style={styles.labelText}>
                              {item?.percentageDiscount ? formatDecimalValue(item?.percentageDiscount) : 0}%
                            </span>
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
                                  {item.title} | {item.minutes} mins {" "}<span className="px-2 py-1 bg-purple ms-2 rounded-full text-white" style={{ fontSize: "14px", fontWeight: "500" }}>{item.tag}</span>
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
                                    {item.planDescription}
                                  </div>
                                  <div className="flex flex-row items-center">
                                    {item.originalPrice && item.originalPrice > 0 && (
                                      <div style={styles.originalPrice}>
                                        ${item.originalPrice}
                                      </div>
                                    )}
                                    <div className="flex flex-row justify-start items-start">
                                      <div style={styles.discountedPrice}>
                                        ${item?.discountedPrice ? formatDecimalValue(item?.discountedPrice) : 0}
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
                  ) : (
                    <div className="mt-6 text-center text-lg font-bold">
                      No Plans found
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-row items-center  gap-4 justify-start w-full mt-4">
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
  
              <button
                className={`border-none outline-none w-full mt-4 rounded-md h-[50px] ${!canSubPlan || disableContinue
                  ?
                  "bg-[#00000030] text-black"
                  :
                  "bg-purple text-white"
                  }`}
                onClick={subscribePlanClick}
                disabled={!canSubPlan || disableContinue}
              >
                Continue
              </button>
  
            </div>
            <div className="w-6/12 h-[100%] flex flex-col items-end justify-center">
              <Image
                src={"/agencyIcons/planVector.jpg"}
                alt="*"
                height={541}
                width={670}
              />
            </div>
*/}