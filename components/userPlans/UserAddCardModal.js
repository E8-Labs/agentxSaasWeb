import React, { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
// import stripe
import {
    CardCvcElement,
    CardElement,
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
import { calculatePlanPrice, getMonthlyPrice, getTotalPrice, checkReferralCode, getNextChargeDate } from "./UserPlanServices";
import { useUser } from '@/hooks/redux-hooks';
// import Apis from '../Apis/Apis';
import getProfileDetails from "../apis/GetProfile";
const UserAddCard = ({
    handleClose,
    togglePlan,
    setAddPaymentSuccessPopUp,
    isFrom,
    selectedUser,
    fromAdmin = false,
    selectedPlan
}) => {
    const stripeReact = useStripe();
    const elements = useElements();
    ////console.log
    ////console.log
    const { user: reduxUser, setUser: setReduxUser } = useUser();
    const [inviteCode, setInviteCode] = useState("");
    // referral code validation states
    const [referralStatus, setReferralStatus] = useState("idle"); // idle | loading | valid | invalid
    const [referralMessage, setReferralMessage] = useState("");
    const referralRequestSeqRef = useRef(0);

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

    //agree terms
    const [agreeTerms, setAgreeTerms] = useState(true);

    //disable continue btn after the card added
    const [disableContinue, setDisableContinue] = useState(false);

    // Autofocus the first field when the component mounts
    useEffect(() => {
        // //console.log;
        if (cardNumberRef.current) {
            // //console.log;
            cardNumberRef.current.focus();
        }
    }, []);

    //handle agree terms toggle btn
    const handleToggleTermsClick = () => {
        setAgreeTerms(!agreeTerms);
    };

    // Handle field change to focus on the next input
    const handleFieldChange = (event, ref) => {
        if (event.complete && ref.current) {
            ref.current.focus();
        }
    };
    // const [selectedUserPlan, setSelectedUserPlan] = useState(null);
    // Debounced referral code validation (500 ms)
    useEffect(() => {
        if (!inviteCode || inviteCode.trim().length === 0) {
            setReferralStatus("idle");
            setReferralMessage("");
            return;
        }

        setReferralStatus("loading");
        setReferralMessage("");
        const timer = setTimeout(async () => {
            try {
                const resp = await checkReferralCode(inviteCode.trim());
                if (resp && resp.status) {
                    setReferralStatus("valid");
                    setReferralMessage(resp.message || "Referral code applied");
                } else {
                    setReferralStatus("invalid");
                    setReferralMessage((resp && resp.message) || "Invalid referral code");
                }
            } catch (e) {
                if (currentSeq !== referralRequestSeqRef.current) return;
                setReferralStatus("invalid");
                setReferralMessage("Unable to validate code. Please try again.");
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [inviteCode]);

    if (!stripeReact || !elements) {
        ////console.log;
        ////console.log
        ////console.log
        return <div>Loading stripe</div>;
    } else {
        ////console.log;
    }


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
    //function to add card
    const handleAddCard = async (e) => {
        setAddCardLoader(true);
        setDisableContinue(true);
        if (stop) {
            stop(false);
            setDisableContinue(false);
        }
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const LocalData = localStorage.getItem("User");
        const D = JSON.parse(LocalData);
        // //console.log;
        const AuthToken = D.token;
        if (!stripeReact || !elements) {
            setDisableContinue(false);
            return;
        } else {
            ////console.log;
        }

        const res = await fetch(Apis.createSetupIntent, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthToken}`,
            },
            body: JSON.stringify({ id: 123 }),
        });

        const data = await res.json();
        console.log("Setup intent response is ", data);

        const result = await stripeReact.confirmCardSetup(data.data, {
            payment_method: {
                card: elements.getElement(CardNumberElement),
                billing_details: {
                    name: D.user.name,
                },
            },
        });

        console.log("Result confirm payment", result);

        if (result.error) {
            setAddCardLoader(false);
            console.log("Error confirm payment");
            setAddCardFailure(true);
            setAddCardErrtxt(
                result.error.message || "Error confirming payment method"
            );
            setDisableContinue(false);
            // setStatus(`Error: ${result.error.message}`);
        } else {
            // console.log("Result", JSON.stringify(result.setupIntent));
            let id = result.setupIntent.payment_method;
            // setStatus("Success! Card is ready for auto-payment.");
            // console.log("Payment method ID:", id);

            // Save paymentMethod ID to your server (for later cron charging)
            // Step 3: Send payment method ID to backend to attach to customer

            let requestBody = null;
            if (fromAdmin) {
                requestBody = {
                    source: id,
                    inviteCode: inviteCode,
                    userId: selectedUser.id
                };
            } else {
                requestBody = {
                    source: id,
                    inviteCode: inviteCode,
                };
            }
            console.log("Request data sending in api is", requestBody);
            const addCardRes = await fetch(Apis.addCard, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${AuthToken}`,
                },
                body: JSON.stringify(requestBody),
            });

            const result2 = await addCardRes.json();
            console.log("Result is ", result2);
            setAddCardLoader(false);
            if (result2.status) {
                setAddCardSuccess(true);
                if (!selectedPlan) handleClose(result);
                if (selectedPlan) handleSubscribePlan();
            } else {
                setAddCardFailure(true);
                setAddCardErrtxt(result2.message);
                setDisableContinue(false);
            }
        }
    };



    const refreshUserData = async () => {
        try {
            console.log('🔄 [subscribe plan] Refreshing user data after plan upgrade...');
            const profileResponse = await getProfileDetails();

            if (profileResponse?.data?.status === true) {
                const freshUserData = profileResponse.data.data;
                const localData = JSON.parse(localStorage.getItem("User") || '{}');


                console.log('🔄 [subscribe plan] Fresh user data received after upgrade');
                // Update Redux with fresh data
                setReduxUser({
                    token: localData.token,
                    user: freshUserData
                });

                return true;
            }
            return false;
        } catch (error) {
            console.error('🔴 [subscribe plan] Error refreshing user data:', error);
            return false;
        }
    };



    //function to subscribe plan
    const handleSubscribePlan = async () => {
        try {
            let planType = selectedPlan?.planType;

            console.log("selected plan isnnnhhhhh", selectedPlan)
            console.log("selected plan isnnnhhhhh", selectedPlan.id)
            // return


            setAddCardLoader(true);
            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                AuthToken = LocalDetails.token;
            }

            // //console.log;

            let ApiData = {
                plan: planType,
            };

            if (isFrom == "SubAccount") {
                ApiData = {
                    planId: selectedPlan.id
                }
            }

            // //console.log;

            let ApiPath = Apis.subscribePlan;
            if (isFrom == "SubAccount") {
                ApiPath = Apis.subAgencyAndSubAccountPlans;
            }
            // //console.log;
            console.log("Api data", ApiData);
            console.log("Api path", ApiPath);
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                console.log("Response of subscribe plan api on user add card is", response.data);
                if (response.data.status === true) {
                    //refresh user data from redux
                    refreshUserData();
                    handleClose(response.data);
                    if (setAddPaymentSuccessPopUp) setAddPaymentSuccessPopUp(true);
                }
            }
        } catch (error) {
            console.error("Error occured in subacribe plan api on user add card is:", error);
        } finally {
            setAddCardLoader(false);
        }
    };

    const getMonthsCount = () => {

        if (!selectedPlan) {
            return 1;
        }


        const billingCycle = selectedPlan.billingCycle || selectedPlan.duration;

        if (billingCycle === "monthly") {
            return 1;
        } else if (billingCycle === "quarterly") {
            return 3;
        } else if (billingCycle === "yearly") {
            return 12;
        } else {
            return 1;
        }
    }




    const PayAsYouGoPlanTypes = {
        Plan30Min: "Plan30",
        Plan120Min: "Plan120",
        Plan360Min: "Plan360",
        Plan720Min: "Plan720",
    };

    return (
        <div className="-mt-10" style={{ width: "100%" }}>
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

            <div className="w-full flex flex-row items-center" style={{ backgroundColor: 'transparent' }}>
                <div className="flex w-[55%] flex-row LeftDiv" style={{ backgroundColor: 'transparent' }}>
                    <div className="LeftInnerDiv1" style={{ backgroundColor: 'transparent', flexShrink: 0 }}>
                        <Image
                            alt="*"
                            src={"/otherAssets/paymentCircle.png"}
                            height={320} width={320}
                        />
                    </div>
                    <div className=" LeftInnerDiv2" style={{ width: '75%', marginLeft: '-100px' }}>
                        <div// className="mt-8"
                        >
                            <div style={{ fontWeight: "600", fontSize: 28 }}>Continue to Payment</div>
                            <div className="mt-2" style={{ fontWeight: "400", fontSize: 15 }}>Enter your payment details to continue</div>
                            <div className="mt-4" style={{ fontWeight: "600", fontSize: 22 }}>Add Payment Details</div>
                            <div
                                className="mt-8 px-3 py-1 border relative flex items-center bg-[#ffffff70]"
                                style={{ borderRadius: "8px" }}
                            >
                                <div className="flex-1">
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
                                <div className="flex items-center gap-1 ml-2">
                                    <Image src="/svgIcons/Visa.svg" alt="Visa" width={32} height={20} />
                                    <Image src="/svgIcons/Mastercard.svg" alt="Mastercard" width={32} height={20} />
                                    <Image src="/svgIcons/Amex.svg" alt="American Express" width={32} height={20} />
                                    <Image src="/svgIcons/Discover.svg" alt="Discover" width={32} height={20} />
                                </div>
                            </div>
                        </div>


                        <div className="flex flex-row gap-2 w-full mt-8">
                            <div className="w-6/12">
                                <div
                                    className="mt-2 px-3 py-1 border bg-[#ffffff70]"
                                    style={{ borderRadius: "8px" }}
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
                                    className="mt-2 px-3 py-1 border bg-[#ffffff70]"
                                    style={{ borderRadius: "8px" }}
                                >
                                    <CardCvcElement
                                        // options={elementOptions}
                                        options={{
                                            ...elementOptions,
                                            placeholder: "CVV", // 👈 add this
                                        }}
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

                        <div className="mt-4">
                            <input
                                value={inviteCode}
                                onChange={(e) => {
                                    setInviteCode(e.target.value);
                                }}
                                className="outline-none focus:ring-0 w-full h-[50px] bg-[#ffffff70]"
                                style={{
                                    color: "#000",
                                    borderRadius: "8px",
                                    border: "1px solid #00000020",
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

                        {inviteCode ? (
                            <div className="mt-2 flex items-center gap-2" style={{ minHeight: 24 }}>
                                {referralStatus === "loading" && (
                                    <>
                                        <div style={{ fontSize: 12, color: "#4F5B76" }}>Validating code…</div>
                                    </>
                                )}
                                {referralStatus === "invalid" && (
                                    <div style={{ fontSize: 12, color: "#D93025", fontWeight: 600 }}>{referralMessage || "Invalid referral code"}</div>
                                )}
                            </div>
                        ) : null}

                        {/* <CardPostalCodeElement id="postal-code" options={elementOptions} /> */}

                        {/*
                        <div className="mt-4 w-full flex flex-row items-center gap-4">
                            <button
                                className="outline-none border-none"
                                onClick={() => { handleToggleTermsClick() }}>
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
                            <div
                                className="flex flex-row items-center gap-1"
                                style={{
                                    fontWeight: "500",
                                    fontSize: 15
                                }}>
                                <div>
                                    I agree to
                                </div>
                                <a
                                    href="https://www.myagentx.com/terms-and-condition" // Replace with the actual URL
                                    style={{ textDecoration: "underline", color: "black" }} // Underline and color styling
                                    target="_blank" // Opens in a new tab (optional)
                                    rel="noopener noreferrer" // Security for external links
                                >
                                    Terms & Conditions
                                </a>
                            </div>
                        </div>
                    */}

                        {/*
                        <div className="flex flex-col items-center gap-2 w-full mt-6 flex justify-center">
                            {addCardLoader ? (
                                <div className="flex flex-row justify-center items-center mt-8 w-full">
                                    <CircularProgress size={30} />
                                </div>
                            ) : (
                                <div className="flex flex-row justify-end items-center mt-8 w-full">
                                    {CardAdded && CardExpiry && CVC && agreeTerms ? (
                                        <button
                                            onClick={handleAddCard}
                                            className="w-full h-[50px] rounded-xl px-8 text-white py-3"
                                            style={{ backgroundColor: "#7902DF", fontWeight: "600", fontSize: 17 }}
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
                    */}
                    </div>
                </div>
                <div className="w-[45%] flex flex-col justify-center items-center pe-4 rounded-lg mt-5" style={{ backgroundColor: 'transparent' }}>
                    <div className=" rounded-lg p-2 w-[90%] " style={{ backgroundColor: '#ffffff' }}>
                        <div style={{ fontSize: 22, fontWeight: "600" }}>Order Summary</div>
                        <div className="flex flex-row items-start justify-between w-full mt-6">
                            <div>
                                <div style={{ fontWeight: "600", fontSize: 15 }}>
                                    {selectedPlan?.name || 'Plan'}
                                </div>
                                <div style={{ fontWeight: "400", fontSize: 13, marginTop: "" }}>{selectedPlan?.billingCycle || selectedPlan?.duration} subscription</div>
                            </div>
                            <div style={{ fontWeight: "600", fontSize: 15 }}>{`${getMonthsCount()} x $${getMonthlyPrice(selectedPlan)}`}</div>
                        </div>



                        {inviteCode && (
                            <div>
                                <div className="flex flex-row items-start justify-between w-full mt-6">
                                    <div>
                                        <div style={{ fontWeight: "600", fontSize: 15 }}>
                                            Referral Code
                                        </div>
                                        <div style={{ fontWeight: "400", fontSize: 13, marginTop: "" }}>
                                            {referralMessage}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-row items-start justify-between w-full mt-6">
                            <div>
                                <div style={{ fontWeight: "600", fontSize: 15 }}>
                                    Total Billed {selectedPlan?.billingCycle || selectedPlan?.duration}
                                </div>
                                <div style={{ fontWeight: "400", fontSize: 13, marginTop: "" }}>Next Charge Date {getNextChargeDate(selectedPlan)}</div>
                            </div>
                            <div style={{ fontWeight: "600", fontSize: 15 }}>{`$${getTotalPrice(selectedPlan)}`}</div>
                        </div>
                        <div className="mt-6 h-[2px] w-full bg-[#00000060]"></div>
                        <div className="flex flex-row items-start justify-between w-full mt-6">
                            <div style={{ fontWeight: "600", fontSize: 15 }}>Total:</div>
                            <div className="flex flex-col items-end ">
                                <div style={{ fontWeight: "600", fontSize: 15 }}>
                                    ${getTotalPrice(selectedPlan)}
                                </div>
                                <div style={{ fontWeight: "400", fontSize: 13, marginTop: "", color: "#8A8A8A" }}>Due Today</div>
                            </div>
                        </div>
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
                                            className="w-full h-[50px] rounded-xl px-8 text-white py-3"
                                            style={{ backgroundColor: "#7902DF", fontWeight: "600", fontSize: 17 }}
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
                            {/*
                                <p className="text-[#15151580]">{textBelowContinue}</p>
                            */}
                        </div>
                        <div
                            className="flex flex-row items-center gap-2 w-full justify-center mt-2"
                            style={{
                                fontWeight: "400",
                                fontSize: 13
                            }}>
                            <div>
                                By continuing you agree to our
                            </div>
                            <a
                                href="https://www.myagentx.com/terms-and-condition" // Replace with the actual URL
                                style={{ textDecoration: "underline", color: "#7902DF" }} // Underline and color styling
                                target="_blank" // Opens in a new tab (optional)
                                rel="noopener noreferrer" // Security for external links
                            >
                                Terms & Conditions
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UserAddCard;
