import React, { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
// import { CardPostalCodeElement } from '@stripe/react-stripe-js';
import {
  Alert,
  Button,
  CircularProgress,
  Fade,
  Slide,
  Snackbar,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import Image from "next/image";
import Apis from "@/components/apis/Apis";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
// import Apis from '../Apis/Apis';

const AddCardDetails = ({
  subscribePlan,
  subscribeLoader,
  fromMYPlansScreen,
  closeAddCardPopup,
  handleClose,
  togglePlan,
  setAddPaymentSuccessPopUp,
  textBelowContinue = "",
}) => {
  const stripeReact = useStripe();
  const elements = useElements();
  ////console.log
  ////console.log

  const [inviteCode, setInviteCode] = useState("");

  const [addCardLoader, setAddCardLoader] = useState(false);
  const [credentialsErr, setCredentialsErr] = useState(false);
  const [addCardSuccess, setAddCardSuccess] = useState(false);
  const [addCardFailure, setAddCardFailure] = useState(false);
  const [addCardDetails, setAddCardDetails] = useState(null);
  const [addCardErrtxt, setAddCardErrtxt] = useState(null);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const cardNumberRef = useRef(null);
  const cardExpiryRef = useRef(null);
  const cardCvcRef = useRef(null);

  //check for button
  const [CardAdded, setCardAdded] = useState(false);
  const [CardExpiry, setCardExpiry] = useState(false);
  const [CVC, setCVC] = useState(false);

  // Autofocus the first field when the component mounts
  useEffect(() => {
   // //console.log;
    if (cardNumberRef.current) {
     // //console.log;
      cardNumberRef.current.focus();
    }
  }, []);

  // Handle field change to focus on the next input
  const handleFieldChange = (event, ref) => {
    if (event.complete && ref.current) {
      ref.current.focus();
    }
  };
  // const [selectedUserPlan, setSelectedUserPlan] = useState(null);

  if (!stripeReact || !elements) {
    ////console.log;
    ////console.log
    ////console.log
    return <div>Loading stripe</div>;
  } else {
    ////console.log;
  }
  const handleBackClick = (e) => {
    e.preventDefault();
    handleBack();
  };

  // //code for wide screen
  // useEffect(() => {
  //     const handleResize = () => {
  //         // Check if width is greater than or equal to 1024px
  //         setIsWideScreen(window.innerWidth >= 500);

  //         // setIsWideScreen2(window.innerWidth >= 500);
  //         // Check if height is greater than or equal to 1024px
  //         // setIsHighScreen(window.innerHeight >= 640);

  //         // Log the updated state values for debugging (Optional)
  //        // //console.log;
  //     };

  //     handleResize(); // Set initial state
  //     window.addEventListener("resize", handleResize);

  //     return () => {
  //         window.removeEventListener("resize", handleResize);
  //     };
  // }, []);

  const elementOptions = {
    style: {
      base: {
        backgroundColor: "transparent",
        color: "#000000",
        fontSize: "18px",
        lineHeight: "40px",
        borderRadius: 10,
        padding: 10,
        "::placeholder": {
          color: "#00000050",
        },
      },
      invalid: {
        color: "red",
      },
    },
  };

  //code for adding card api

  // useEffect(()=>{
  //    // //console.log
  // }, [selectedPlan])

  // useEffect(() => {})
  ////console.log
  // let selPlan = null;

  //function to add card
  const handleAddCard = async (e) => {
    // if (!fromBuildAiScreen) {
    // }
    setAddCardLoader(true);

    if (stop) {
      stop(false);
    }

    // return
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Close the modal
    // handleClose4(e);
    // return
    if (!stripeReact || !elements) {
      ////console.log;
      ////console.log
      ////console.log
      return;
    } else {
      ////console.log;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);

    stripeReact.createToken(cardNumberElement).then(async function (tok) {
      if (tok.error) {
        setAddCardErrtxt(tok.error.message || "Error adding card");
        setCredentialsErr(true);
        setAddCardLoader(false);
      } else if (tok.token.id) {
       // //console.log;
        const tokenId = tok.token.id;
       // //console.log;
        const ApiPath = Apis.addCard;
       // //console.log;

        let AddCardData = null;

        if (inviteCode) {
          AddCardData = {
            source: tokenId,
            inviteCode: inviteCode,
          };
        } else {
          AddCardData = {
            source: tokenId,
          };
        }

       // //console.log;
        // return
        try {
          const LocalData = localStorage.getItem("User");
          const D = JSON.parse(LocalData);
         // //console.log;
          const AuthToken = D.token;
          // const AuthToken = "bgabgakjhaslidfhgkerhiuhkmxvnidfuhgiehlmklhn";
         // //console.log;

         // //console.log;
          // return

          //can be useful when user want to add card from dashboard

          // const fromBuyStatus = localStorage.getItem("fromBuyScreen");
          //// //console.log);
          // let newTab = null;
          // if (fromBuyStatus) {
          //     newTab = window.open('about:blank'); // Open a new blank tab
          // }

          const response = await axios.post(ApiPath, AddCardData, {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + AuthToken,
            },
          });
          if (response) {
           // //console.log;
          }
          if (response.status === 200) {
            // setAddCardDetails(response.data.message);
            if (response.data.status === false) {
              setAddCardFailure(true);
              setAddCardErrtxt(response.data.message);
              return;
            } else if (response.data.status === true) {
              ////console.log
              setAddCardSuccess(true);

              if (!togglePlan) {
                handleClose(response.data);
              }

              if (togglePlan) {
                handleSubscribePlan();
              }
              ////console.log;
            }
          } else {
            setAddCardFailure(true);
            setAddCardErrtxt("Some error occured !!!");
          }
        } catch (error) {
         // console.error("Error occured in adding user card api is :", error);
          setAddCardLoader(false);
        } finally {
          setAddCardLoader(false);
          // if (fromBuildAiScreen) {
          //    // //console.log;
          //     subscribeLoader(false);
          // }
        }
      }
    });
  };

  //function to subscribe plan
  const handleSubscribePlan = async () => {
    try {
      let planType = null;

      //// //console.log;

      if (togglePlan === 1) {
        planType = "Plan30";
      } else if (togglePlan === 2) {
        planType = "Plan120";
      } else if (togglePlan === 3) {
        planType = "Plan360";
      } else if (togglePlan === 4) {
        planType = "Plan720";
      }

     // //console.log;

      setAddCardLoader(true);
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        AuthToken = LocalDetails.token;
      }

     // //console.log;

      const ApiData = {
        plan: planType,
      };

     // //console.log;

      const ApiPath = Apis.subscribePlan;
     // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
       // console.log(
        //   "Response of subscribe plan api is",
        //   Object.keys(response.data)
        // );
        if (response.data.status === true) {
          handleClose(response.data);
          if (setAddPaymentSuccessPopUp) setAddPaymentSuccessPopUp(true);
        }
      }
    } catch (error) {
     // console.error("Error occured in api is:", error);
    } finally {
      setAddCardLoader(false);
    }
  };

  const PayAsYouGoPlanTypes = {
    Plan30Min: "Plan30",
    Plan120Min: "Plan120",
    Plan360Min: "Plan360",
    Plan720Min: "Plan720",
  };

  return (
    <div style={{ width: "100%" }}>
      <AgentSelectSnackMessage
        isVisible={credentialsErr}
        hide={() => setCredentialsErr(false)}
        message={addCardErrtxt}
      />
      <AgentSelectSnackMessage
        isVisible={addCardFailure}
        hide={() => setAddCardFailure(false)}
        message={addCardErrtxt}
      />
      <AgentSelectSnackMessage
        isVisible={addCardSuccess}
        hide={() => setAddCardSuccess(false)}
        type={SnackbarTypes.Success}
        message={"Card added successfully"}
      />

      <div className="mt-8">
        <div
          style={{
            fontWeight: "400",
            fontFamily: "inter",
            fontSize: 13,
            color: "#4F5B76",
          }}
        >
          Card Number
        </div>
        <div
          className="mt-2 px-3 py-1"
          style={{ backgroundColor: "#EDEDEDC7", borderRadius: "8px" }}
        >
          <CardNumberElement
            options={elementOptions}
            autoFocus={true}
            onChange={(event) => {
              handleFieldChange(event, cardExpiryRef);
              if (event.complete) {
               // //console.log;
                setCardAdded(true);
              } else {
                setCardAdded(false);
              }
            }}
            ref={cardNumberRef}
            onReady={(element) => {
              cardNumberRef.current = element;
              cardNumberRef.current.focus();
            }}
          />
        </div>
      </div>
      <div className="flex flex-row gap-2 w-full mt-8">
        <div className="w-6/12">
          <div
            style={{
              fontWeight: "400",
              fontFamily: "inter",
              fontSize: 13,
              color: "#4F5B76",
            }}
          >
            Exp
          </div>
          <div
            className="mt-2 px-3 py-1"
            style={{ backgroundColor: "#EDEDEDC7", borderRadius: "8px" }}
          >
            <CardExpiryElement
              options={elementOptions}
              style={{
                width: "100%",
                padding: "8px",
                color: "white",
                fontSize: "22px",
                border: "1px solid blue",
                borderRadius: "4px",
              }}
              onChange={(event) => {
                handleFieldChange(event, cardCvcRef);
                if (event.complete) {
                 // //console.log;
                  setCardExpiry(true);
                } else {
                  setCardExpiry(false);
                }
              }}
              ref={cardExpiryRef}
              onReady={(element) => {
                cardExpiryRef.current = element;
              }}
            />
          </div>
        </div>
        <div className="w-6/12">
          <div
            style={{
              fontWeight: "400",
              fontFamily: "inter",
              fontSize: 13,
              color: "#4F5B76",
            }}
          >
            CVC
          </div>
          <div
            className="mt-2 px-3 py-1"
            style={{ backgroundColor: "#EDEDEDC7", borderRadius: "8px" }}
          >
            <CardCvcElement
              options={elementOptions}
              style={{
                width: "100%",
                padding: "8px",
                color: "white",
                fontSize: "22px",
                border: "1px solid blue",
                borderRadius: "4px",
              }}
              ref={cardCvcRef}
              onReady={(element) => {
                cardCvcRef.current = element;
              }}
              onChange={(event) => {
                // handleFieldChange(event, cardCvcRef);
                if (event.complete) {
                 // //console.log;
                  setCVC(true);
                } else {
                  setCVC(false);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Optional input field for agent x invite code */}

      <div
        className="mt-8"
        style={{
          fontWeight: "400",
          fontFamily: "inter",
          fontSize: 13,
          color: "#4F5B76",
        }}
      >
        {`Referral Code (optional)`}
      </div>

      <div className="mt-4">
        <input
          value={inviteCode}
          onChange={(e) => {
            setInviteCode(e.target.value);
          }}
          className="outline-none focus:ring-0 w-full h-[50px]"
          style={{
            color: "#000000",
            backgroundColor: "#EDEDEDC7",
            borderRadius: "8px",
            border: "0px solid #00000000",
            fontSize: 15,
            fontWeight: "500",
          }}
          placeholder="Enter Referral code"
        />
        <style jsx>{`
          input::placeholder {
            color: #00000050; /* Set placeholder text color to red */
          }
        `}</style>
      </div>

      {/* <CardPostalCodeElement id="postal-code" options={elementOptions} /> */}
      <div className="flex flex-col items-center gap-2 w-full mt-6 flex justify-center">
        {addCardLoader ? (
          <div className="flex flex-row justify-center items-center mt-8 w-full">
            <CircularProgress size={30} />
          </div>
        ) : (
          <div className="flex flex-row justify-end items-center mt-8 w-full">
            {CardAdded && CardExpiry && CVC ? (
              <button
                onClick={handleAddCard}
                className="bg-purple w-full h-[50px] rounded-xl px-8 text-white py-3"
                style={{ fontWeight: "600", fontSize: 17 }}
              >
                Continue
              </button>
            ) : (
              <button
                disabled={true}
                className="bg-[#00000020] w-full h-[50px] rounded-xl px-8 text-[#000000] py-3"
                style={{ fontWeight: "600", fontSize: 17 }}
              >
                Continue
              </button>
            )}
          </div>
        )}
        <p className="text-[#15151580]">{textBelowContinue}</p>
      </div>
    </div>
  );
};

export default AddCardDetails;
