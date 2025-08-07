import Image from "next/image";
import React, { useEffect, useState } from "react";
import Apis from "../apis/Apis";
import axios from "axios";
import getProfileDetails from "../apis/GetProfile";
import { termsAndConditionUrl } from "@/constants/Constants";
import { Box, CircularProgress, Modal } from "@mui/material";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import AddCardDetails from "../createagent/addpayment/AddCardDetails";
import { handleAutoCharge } from "./PlansView";

const UpgradePlanView = ({ onCancel, selectedPlan, onClose }) => {

  let stripePublickKey =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
      ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
      : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
  const stripePromise = loadStripe(stripePublickKey);


  const [subscribePlanLoader, setSubscribePlanLoader] = useState(false);
  const [addPaymentPopup, setAddPaymentPopup] = useState(false);
  const [successSnack, setSuccessSnack] = useState("");
  const [showSuccessSnack, setShowSuccessSnack] = useState(false);
  const [errorSnack, setErrorSnack] = useState("");
  const [showErrorSnack, setShowErrorSnack] = useState(false);
  const [getCardLoader, setGetCardLoader] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    getCardsList();
  }, [selectedPlan])
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


      const ApiPath = Apis.getCardsList


      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("get cards data", response.data);
        if (response.data.status === true) {
          setCards(response.data.data);
          let cards = response.data.data;
          cards.forEach(card => {
            if (card.isDefault) {
              setSelectedCard(card);
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      // //console.log;
      setGetCardLoader(false);
    }
  };


  const handleUpgrade = async () => {
    try {

      if (cards.length == 0) {
        setAddPaymentPopup(true);
        return;
      }

      let planType = null;

      if (selectedPlan.name === "Starter") {
        planType = "Plan120";
      } else if (selectedPlan.name === "Growth") {
        planType = "Plan360";
      } else if (selectedPlan.name === "Scale") {
        planType = "Plan720";
      }

      setSubscribePlanLoader(true);
      let AuthToken = null;
      let localDetails = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        localDetails = LocalDetails;
        AuthToken = LocalDetails.token;
      }

      const ApiData = {
        plan: planType,
        payNow: true,
      };


      const ApiPath = Apis.subscribePlan;

      console.log("apipath", ApiPath);
      console.log('apiDatta', ApiData)

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
          await handleAutoCharge();
          setSuccessSnack(response.data.message);
          setShowSuccessSnack(true);
          onClose();
          getProfileDetails();
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message);
          setShowErrorSnack(true);
        }
      }
    } catch (error) {
      console.error("Error occured in api is:", error);
    } finally {
      setSubscribePlanLoader(false);
    }
  };
  return (
    <div className="w-full flex flex-col items-center gap-8 z-10 relative">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mt-10">
        <h1 className="text-[20px] font-semibold text-center">
          Continue Your Calls With Better Rates
        </h1>
        <div className="text-center text-[14px] font-[400] text-black max-w-xl">
          Upgrading to a higher plan give you better rates and more call time!
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full flex flex-row gap-8 px-8 items-start justify-center mt-4">
        {/* Selected Plan */}
        <div className="flex-1 flex flex-col items-start gap-2">
          <div className="text-lg font-semibold mb-2">Selected Plan</div>
          <div
            className="text-2xl font-bold bg-gradient-to-r from-purple  to-[#DF02BA] bg-clip-text text-transparent"
          >
            {selectedPlan?.name}
          </div>
          <div className="text-black text-[14px] font-[400]">{selectedPlan?.mins} Mins | {selectedPlan?.calls} Calls*</div>
          <div className="text-gray-500 text-[12px] font-[300] mb-2">Per Month, Billed Monthly</div>
          <div className="text-3xl font-bold">{selectedPlan?.discountPrice}</div>
         
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200 h-[27vh] mx-4" />

        {/* Payment */}
        <div className="flex-1 flex flex-col items-start gap-2">
          <div className="text-lg font-semibold mb-2">Payment</div>
          <button className="text-sm text-black font-medium mb-2 underline"
            onClick={() => {
              setAddPaymentPopup(true);
            }}
          >
            + Add Payment
          </button>

          <div className="flex flex-col gap-2 h-[30vh] overflow-auto">
            {cards.map((card, index) => {

              return (
                <div
                  key={index}
                  className="flex flex-row items-center w-full"
                  style={{ marginBottom: "1rem", cursor: "pointer" }}
                  onClick={() => setSelectedCard(card)}
                >
                  <div
                    className="flex flex-row items-center w-full border rounded-lg px-5 py-3"
                    style={{

                      borderColor: selectedCard?.id === card.id ? "#7902DF" : "#E5E7EB",
                      borderWidth: "1.5px",
                      boxShadow: "0 1px 4px 0 rgba(64,17,250,0.03)",
                    }}
                  >
                    {/* Radio icon */}
                    <span className="mr-4 flex-shrink-0">
                      <Image
                        src={
                          selectedCard?.id === card.id
                            ? "/twiliohubassets/RadioFocus.jpg"
                            : "/twiliohubassets/Radio.jpg"
                        }
                        alt={'*'}
                        width={24}
                        height={24}
                      />
                    </span>
                    {/* Card Brand Name */}
                    <span className="font-bold text-[18px] text-[#232323] mr-2" style={{ fontStyle: "italic" }}>
                      {card.brand}
                    </span>
                    {/* Card Last 4 */}
                    <span className="text-[16px] text-black font-medium tracking-wider mr-2">
                      ****{card.last4}
                    </span>
                    {/* Default label */}
                    {card.isDefault && (
                      <span className="text-xs text-gray-500 ml-2">(default)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="w-full flex flex-col gap-2 mt-8">
        {
          subscribePlanLoader ? <div className="w-full flex justify-center items-center">
            <CircularProgress />
          </div> :

            <button
              className="w-full bg-purple text-white font-semibold py-3 rounded-lg text-lg transition"
              onClick={handleUpgrade}
            >
              Upgrade Plan
            </button>
        }
        <button
          className="w-full text-purple  text-base font-medium bg-transparent"
          onClick={onCancel}
        >
          Cancel
        </button>
        <div className="text-center text-xs text-gray-500 mt-2">
          By continuing you agree to our{" "}
          <a href="#" className="text-purple "
            onClick={() => {
              window.open(termsAndConditionUrl);
            }}
          >
            Terms & Conditions
          </a>
        </div>
      </div>
      {/* Add Payment Modal */}
      <Modal
        open={addPaymentPopup} //addPaymentPopUp
        closeAfterTransition
        BackdropProps={{
          timeout: 100,
          sx: {
            backgroundColor: "#00000020",
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
                  stop={stop}
                  // getcardData={getcardData}
                  handleClose={() => {
                    setAddPaymentPopup(false)
                    getCardsList();
                  }}
                  togglePlan={""}
                />
              </Elements>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  )
}

export default UpgradePlanView;



const styles = {
  paymentModal: {
    // height: "auto",
    bgcolor: "transparent",
    // p: 2,
    mx: "auto",
    // my: "50vh",
    // transform: "translateY(-50%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
    height: "100svh",
  },
};