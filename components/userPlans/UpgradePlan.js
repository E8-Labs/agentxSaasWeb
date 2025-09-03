import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { calculatePlanPrice, getUserPlans } from './UserPlanServices'
import Apis from '../apis/Apis'
import axios from 'axios'
import { AuthToken } from '../agency/plan/AuthDetails'
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from "@stripe/stripe-js";
import { PersistanceKeys } from '@/constants/Constants'
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage'




function UpgradePlan({
    open,
    handleClose
}) {


    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);



    const stripeReact = useStripe();
    const elements = useElements();


    const duration = [
        {
            id: 1,
            title: "Monthly",
            save: ""
        }, {
            id: 2,
            title: "Quarterly",
            save: "20%"
        }, {
            id: 3,
            title: "Yearly",
            save: '30%'
        },
    ]

    const [selectedDuration, setSelectedDuration] = useState(duration[0])

    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [quaterlyPlans, setQuaterlyPlans] = useState([]);
    const [yearlyPlans, setYearlyPlans] = useState([]);

    const [addCardErrtxt, setAddCardErrtxt] = useState(null);

    const [selectedPlan, setSelectedPlan] = useState(null)
    const [hoverPlan, setHoverPlan] = useState(null);
    const [togglePlan, setTogglePlan] = useState(null);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(0)
    const [cards, setCards] = useState([])
    const [selectedCard, setSelectedCard] = useState(cards[0]);

    const [showAddCard, setShowAddCard] = useState(false)

    const [CardAdded, setCardAdded] = useState(false);
    const [CardExpiry, setCardExpiry] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(true);

    const [addCardLoader, setAddCardLoader] = useState(false);
    const [credentialsErr, setCredentialsErr] = useState(false);
    const [addCardSuccess, setAddCardSuccess] = useState(false);
    const [addCardFailure, setAddCardFailure] = useState(false);


    const [CVC, setCVC] = useState(false);

    const cardNumberRef = useRef(null);
    const cardExpiryRef = useRef(null);
    const cardCvcRef = useRef(null);


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




    useEffect(() => {
        getPlans()
        getCardsList()
    }, [])

    const getPlans = async () => {
        let plansList = await getUserPlans()
        if (plansList) {

            const monthly = [];
            const quarterly = [];
            const yearly = [];
            let freePlan = null;
            plansList.forEach(plan => {
                switch (plan.billingCycle) {
                    case "monthly":
                        monthly.push(plan);
                        if (plan.isFree) {
                            freePlan = plan;
                        }
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

            if (freePlan) {
                quarterly.unshift({ ...freePlan, billingCycle: "quarterly" });
                yearly.unshift({ ...freePlan, billingCycle: "yearly" });
            }

            setSelectedPlan(freePlan);
            setTogglePlan(freePlan.id);


            setMonthlyPlans(monthly);
            setQuaterlyPlans(quarterly);
            setYearlyPlans(yearly);

            console.log('monthly', monthly)
            console.log('quarterly', quarterly)
            console.log('yearly', yearly)
        }
    }
    const getCurrentPlans = () => {
        if (selectedDuration.id === 1) return monthlyPlans;
        if (selectedDuration.id === 2) return quaterlyPlans;
        if (selectedDuration.id === 3) return yearlyPlans;
        return [];
    };




    const handleTogglePlanClick = (item, index) => {
        console.log("Selected plan index is", index, item);
        setSelectedPlanIndex(index);
        setTogglePlan(item.id);
        setSelectedPlan(item);
    };

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

    //functiion to get cards list
    const getCardsList = async () => {
        try {
            // setGetCardLoader(true);
            let token = AuthToken()

            const ApiPath = Apis.getCardsList;

            // //console.log;

            const response = await axios.get(ApiPath, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                // //console.log;
                console.log('response', response)

                if (response.data.status === true) {
                    setCards(response.data.data);
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            // //console.log;
            // setGetCardLoader(false);
        }
    };


    const handleAddCard = async (e) => {
        setAddCardLoader(true);
        // setDisableContinue(true);
        if (stop) {
            stop(false);
            // setDisableContinue(false);
        }
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const LocalData = localStorage.getItem("User");
        const D = JSON.parse(LocalData);
        // //console.log;
        const AuthToken = D.token;
        if (!stripeReact || !elements) {
            // setDisableContinue(false);
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
            // setDisableContinue(false);
            // setStatus(`Error: ${result.error.message}`);
        } else {
            // console.log("Result", JSON.stringify(result.setupIntent));
            let id = result.setupIntent.payment_method;
            // setStatus("Success! Card is ready for auto-payment.");
            // console.log("Payment method ID:", id);

            // Save paymentMethod ID to your server (for later cron charging)
            // Step 3: Send payment method ID to backend to attach to customer

            let requestBody = null;

            requestBody = {
                source: id,
                inviteCode: inviteCode,
            };

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
                if (!togglePlan) handleClose(result);
                if (togglePlan) handleSubscribePlan();
            } else {
                setAddCardFailure(true);
                setAddCardErrtxt(result2.message);
                setDisableContinue(false);
            }
        }
    };

    //function to subscribe plan
    const handleSubscribePlan = async () => {
        try {
            let planType = selectedPlan?.planType;

            setsubscribeLoader(true);
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
            console.log("Api data", ApiData);
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                console.log("Response of subscribe plan api is", response.data);
                setsubscribeLoader
                handleClose()
            }
        } catch (error) {
            // console.error("Error occured in api is:", error);
        } finally {
            setsubscribeLoader(false);
        }
    };


    return (
        <Modal
            open={open}
            // open={true}
            closeAfterTransition
            BackdropProps={{
                timeout: 100,
                sx: {
                    backgroundColor: "#00000020",
                    backdropFilter: "blur(15px)",
                },
            }}
        >
            <Box
                className="flex lg:w-9/12 sm:w-full w-full justify-center items-center border-none"
                sx={styles.paymentModal}
            >
                <div className="flex flex-row justify-center w-full ">
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
                    <div
                        className="w-full flex flex-col border-white h-[90vh] overflow-y-auto"
                        style={{
                            backgroundColor: "#ffffff",
                            padding: 0,
                            borderRadius: "13px",
                            scrollbarWidth: 'none'
                        }}
                    >
                        <div className="flex flex-row justify-end w-full items-center pe-5 pt-5">
                            <button onClick={() => {
                                handleClose()
                            }}>
                                <Image
                                    src={"/assets/crossIcon.png"}
                                    height={40}
                                    width={40}
                                    alt="*"
                                />
                            </button>
                        </div>

                        <div className="w-full flex flex-row items-start">
                            <div
                                className="LeftInnerDiv1 mt-[13vh] w-[20%]"
                                style={{
                                    backgroundColor: 'transparent',
                                    flexShrink: 0,
                                    // boxShadow: '0 0 40px 0 rgba(128, 90, 213, 0.5)', // purple shadow
                                    // borderTopRightRadius: '100%',
                                    // borderBottomRightRadius:'100%',
                                }}
                            >
                                <Image
                                    alt="*"
                                    src={"/otherAssets/paymentCircle2.png"}
                                    height={200}
                                    width={160}
                                    style={{

                                        borderTopRightRadius: '200px',
                                        borderBottomRightRadius: '200px',
                                        boxShadow: '0 0 40px 0 rgba(128, 90, 213, 0.5)' // purple shadow
                                    }}
                                />
                            </div>

                            <div className='flex flex-col w-[75%] items-start h-full'>
                                <div className='text-4xl font-semibold '>
                                    Upgrade Your Plan
                                </div>

                                <div className='text-lg font-semibold '>
                                    Upgrade for premium features and support
                                </div>

                                <div className='w-full flex flex-row items-end justify-end'>

                                    <div className='flex flex-col items-start'>
                                        <div className='flex flex-row items-center gap-5'>
                                            {
                                                duration.map((item) => (
                                                    <div key={item.id}
                                                        className={`px-2 py-1 ${item.id != 1 ? "bg-white/40 shadow-[0px_4px_15.5px_0px_rgba(0,0,0,0.11)] backdrop-blur-[10px]" : ''} rounded-tl-xl rounded-tr-xl `}
                                                    >
                                                        {item.save ? (
                                                            <div
                                                                className={`text-[11px] font-meduim ${selectedDuration?.id === item.id ? "text-purple" : "text-neutral-400 "}`}
                                                            >
                                                                Save {item.save}
                                                            </div>
                                                        ) : (
                                                            <div className='w-[4.2vw]'></div>
                                                        )}
                                                    </div>
                                                ))}
                                        </div>

                                        <div className='flex flex-row items-center border gap-2 bg-neutral-100 px-2 py-1 rounded-full'>
                                            {
                                                duration.map((item) => (
                                                    <div key={item.id}
                                                        className='flex-col'
                                                    >

                                                        <button
                                                            className={`px-2 py-[5px] ${selectedDuration?.id === item.id ? "text-white text-base font-normal bg-purple outline-none border-none shadow-md shadow-purple rounded-full" : "text-black"}`}
                                                            onClick={() => {
                                                                setSelectedDuration(item);
                                                                // getCurrentPlans();
                                                            }}
                                                        >
                                                            {item.title}
                                                        </button>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>


                                <div className='text-xl font-semibold'>
                                    Select Plan
                                </div>

                                <div
                                    className='w-full flex flex-row gap-3 overflow-x-auto mt-3'
                                    style={{
                                        scrollbarWidth: 'none'
                                    }}
                                >
                                    {
                                        getCurrentPlans().map((item, index) => (
                                            <button
                                                className={`w-3/12 flex flex-col items-start border-2 p-3 rounded-lg text-left 
                                                    hover:border-purple ${selectedPlan?.id === item.id ? "border-purple" : "border-gray-200"}`}
                                                key={item.id}
                                                onClick={() => handleTogglePlanClick(item, index)}
                                            >
                                                <div className='text-lg font-semibold'>
                                                    {item.name}
                                                </div>

                                                <div className='text-base font-normal mt-1'>
                                                    {item.mints} Mins | {item.calls} Calls* per month
                                                </div>

                                                <div className='text-4xl font-semibold mt-2'>
                                                    {`$${item.discountPrice}`}
                                                </div>


                                                <div className={`py-3 mt-2 flex flex-col items-center justify-center w-full rounded-lg ${item.isFree ? "bg-[#00000050]" : "bg-purple"} text-white text-base font-semibold `}>
                                                    {item.isFree ? "Current Plan" : "Select Plan"}
                                                </div>

                                            </button>
                                        ))
                                    }

                                </div>


                                <div className='flex flex-row items-start w-full gap-10 mt-4'>
                                    <div
                                        className='w-[50%] flex flex-col items-start'
                                    >
                                        <div className='text-xl font-semibold'>
                                            Payment
                                        </div>

                                        <div className='flex flex-col gap-2 mt-2 items-center h-[20vh] w-full overflow-y-auto'>
                                            {cards.map((item) => (
                                                <div className="w-full" key={item.id}>
                                                    <button
                                                        className="w-full outline-none"
                                                    >
                                                        <div
                                                            className={`flex items-center justify-between w-full px-2 py-1 border rounded-lg `}
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
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-5 h-5 rounded-full border border-[#7902DF] flex items-center justify-center`} //border-[#2548FD]
                                                                    style={{
                                                                        borderWidth:
                                                                            item.isDefault || selectedCard?.id === item.id
                                                                                ? 3
                                                                                : 1,
                                                                    }}
                                                                ></div>

                                                                <Image
                                                                    src={getCardImage(item) || "/svgIcons/Visa.svg"}
                                                                    alt="Card Logo"
                                                                    width={50}
                                                                    height={50}
                                                                />

                                                                <div className='text-xs font-normal '
                                                                >
                                                                    ****{item.last4} {
                                                                        item.isDefault && (
                                                                            <span>{`(default)`}</span>
                                                                        )}
                                                                </div>


                                                            </div>

                                                            <div className='flex flex-row items-center justify-center'>
                                                                <button className='text-xs font-normal'>
                                                                    {" Edit | "}
                                                                </button>

                                                                <button className='text-xs font-normal ml-1'>
                                                                    {" Delete"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            ))}

                                            {
                                                !showAddCard &&
                                                <button
                                                    onClick={() => {
                                                        setShowAddCard(!showAddCard)
                                                    }}
                                                    className='text-xs font-medium mt-4 text-left w-full self-start'
                                                >
                                                    + Add Payment
                                                </button>
                                            }

                                        </div>

                                        {
                                            showAddCard && (
                                                <div className='flex flex-col items-start w-full'>

                                                    <div className='text-xl font-semibold'>
                                                        Add Payment Details
                                                    </div>
                                                    <Elements stripe={stripePromise}>
                                                        <div className='w-full'>
                                                            <div
                                                                style={{
                                                                    fontWeight: "400",
                                                                    fontSize: 14,
                                                                    color: "#4F5B76",
                                                                }}
                                                            >
                                                                Card Number
                                                            </div>
                                                            <div
                                                                className="mt-2 px-3 py-1 border relative flex items-center"
                                                                style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "8px" }}
                                                            >
                                                                <div className="flex-1 w-full">
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
                                                                    style={{
                                                                        fontWeight: "400",

                                                                        fontSize: 14,
                                                                        color: "#4F5B76",
                                                                    }}
                                                                >
                                                                    Exp
                                                                </div>
                                                                <div
                                                                    className="mt-2 px-3 py-1 border"
                                                                    style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "8px" }}
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

                                                                        fontSize: 14,
                                                                        color: "#4F5B76",
                                                                    }}
                                                                >
                                                                    CVC
                                                                </div>
                                                                <div
                                                                    className="mt-2 px-3 py-1 border"
                                                                    style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "8px" }}
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

                                                                fontSize: 14,
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
                                                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
                                                    </Elements>

                                                    <div className="mt-4 w-full flex flex-row items-center gap-4">
                                                        <button
                                                            className="outline-none border-none"
                                                            onClick={() => { setAgreeTerms(!agreeTerms) }}>

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
                                                            className="flex flex-row items-center gap-2"
                                                            style={{
                                                                fontWeight: "500",
                                                                fontSize: 15
                                                            }}>
                                                            <div>
                                                                I agree to
                                                            </div>
                                                            <a
                                                                href={"https://www.myagentx.com/terms-and-condition"} // Replace with the actual URL
                                                                style={{ textDecoration: "underline", color: "black" }} // Underline and color styling
                                                                target="_blank" // Opens in a new tab (optional)
                                                                rel="noopener noreferrer" // Security for external links
                                                            >
                                                                Terms & Conditions
                                                            </a>
                                                        </div>

                                                    </div>

                                                    <div className='flex flex-row items-center gap-5 w-full mt-8'>
                                                        <button
                                                            className='w-1/2 flex flex-col items-center justify-center 
                                                            h-[53px] border-2 rounded-lg text-lg font-semibold
                                                            '

                                                            onClick={() => {
                                                                setShowAddCard(false)
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>

                                                        {addCardLoader ? (
                                                            <div className="flex flex-row justify-center items-center mt-8 w-full">
                                                                <CircularProgress size={30} />
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className='w-1/2 flex flex-col items-center justify-center 
                                                            h-[53px] text-white  bg-purple rounded-lg text-lg font-semibold
                                                            '
                                                                onClick={handleAddCard}
                                                            >
                                                                Add Payment
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        }


                                    </div>



                                    <div className='w-[50%] flex flex-col items-start'>
                                        <div className='text-[#8a8a8a] text-xl font-semibold '>
                                            Order Summary
                                        </div>
                                        <div className="flex flex-row items-start justify-between w-full mt-6">
                                            <div>
                                                <div className='text-[#8a8a8a] text-lg font-semibold'>
                                                    {selectedPlan?.name} Plan
                                                </div>
                                                <div className='text-[#8a8a8a] text-xs font-regular '>
                                                    {selectedPlan?.billingCycle} subscription
                                                </div>
                                            </div>
                                            <div className='text-[#8a8a8a]' style={{ fontWeight: "600", fontSize: 15 }}>
                                                {calculatePlanPrice(selectedPlan)}
                                            </div>
                                        </div>

                                        <div className="flex flex-row items-start justify-between w-full mt-6">
                                            <div>
                                                <div className='text-[#8a8a8a]' style={{ fontWeight: "600", fontSize: 15 }}>
                                                    {` Total Billed $${selectedPlan?.billingCycle}`}
                                                </div>
                                                <div className='text-[#8a8a8a]' style={{ fontWeight: "400", fontSize: 13, marginTop: "" }}>Next Charge Date June 14, 2026</div>
                                            </div>
                                            <div className='text-[#8a8a8a]' style={{ fontWeight: "600", fontSize: 15 }}>
                                                {calculatePlanPrice(selectedPlan)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-row w-full justify-between items-center mt-3'>
                                    <div className='w-1/2'></div>
                                    <div className='flex flex-row items-center justify-between w-1/2'>
                                        <div className=" text-3xl font-semibold text-[#8a8a8a] ">
                                            Total:
                                        </div>


                                        <div className=" text-3xl font-semibold text-[#8a8a8a] ">
                                            {calculatePlanPrice(selectedPlan)}
                                        </div>
                                    </div>
                                </div>


                                <div className='flex flex-row items-center gap-5 w-full mt-8 mb-10 '>
                                    <button
                                        className='w-1/2 flex flex-col items-center justify-center h-[53px] border-2 rounded-lg text-lg font-semibold'
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </button>
                                    {
                                        subscribeLoader ? (
                                            <CircularProgress />
                                        ) : (
                                            <button
                                                className='w-1/2 flex flex-col items-center justify-center h-[53px] text-white  bg-purple rounded-lg text-lg font-semibold'
                                                onClick={handleSubscribePlan}
                                            >
                                                Upgrade
                                            </button>
                                        )
                                    }
                                </div>


                            </div>
                        </div>


                    </div>
                </div>
            </Box>
        </Modal >
    )
}


const styles = {
    paymentModal: {
        // height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-50%)",
        borderRadius: 2,
        // border: "none",
        outline: "none",
        // height: "60svh",
    },
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


export default UpgradePlan