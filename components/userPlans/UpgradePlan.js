import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { calculatePlanPrice, checkReferralCode, getNextChargeDate, getUserPlans } from './UserPlanServices'
import Apis from '../apis/Apis'
import axios from 'axios'
import { AuthToken } from '../agency/plan/AuthDetails'
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from "@stripe/stripe-js";
import { PersistanceKeys } from '@/constants/Constants'
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage'
import UserAddCard from './UserAddCardModal'
import { set } from 'draft-js/lib/DefaultDraftBlockRenderMap'
import getProfileDetails from '../apis/GetProfile'
import AdminGetProfileDetails from '../admin/AdminGetProfileDetails'
import { duration } from '@/utilities/PlansService'
import CloseBtn from '../globalExtras/CloseBtn'

// Separate component for card form to isolate Stripe Elements
const CardForm = ({
    onCardAdded,
    onCardExpiry,
    onCVC,
    onFieldChange,
    cardNumberRef,
    cardExpiryRef,
    cardCvcRef,
    inviteCode,
    setInviteCode,
    referralStatus,
    referralMessage,
    addCardLoader,
    handleAddCard,
    onCancel,
    haveCards
}) => {
    return (
        <div className='w-full flex flex-col gap-2 mt-2'>
            {
                haveCards ? (
                    <div className="w-full flex justify-end">
                        <CloseBtn
                            onClick={onCancel}
                        />
                    </div>
                ) : null
            }
            <div className='w-full'>
                <div
                    className="px-3 py-1 relative flex items-center"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "8px" }}
                >
                    <div className="flex-1 w-full">
                        <CardNumberElement
                            options={elementOptions}
                            onReady={(element) => {
                                cardNumberRef.current = element;
                            }}
                            onChange={(event) => {
                                onFieldChange(event, cardExpiryRef);
                                if (event.complete) {
                                    onCardAdded(true);
                                } else {
                                    onCardAdded(false);
                                }
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
            <div className="flex flex-row gap-2 w-full mt-4">
                <div className="w-6/12">
                    <div
                        className="px-3 py-1 border"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "8px" }}
                    >
                        <CardExpiryElement
                            options={elementOptions}
                            onChange={(event) => {
                                onFieldChange(event, cardCvcRef);
                                if (event.complete) {
                                    onCardExpiry(true);
                                } else {
                                    onCardExpiry(false);
                                }
                            }}
                            onReady={(element) => {
                                cardExpiryRef.current = element;
                            }}
                        />
                    </div>
                </div>
                <div className="w-6/12">
                    <div
                        className="px-3 py-1 border"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "8px" }}
                    >
                        <CardCvcElement
                            options={elementOptions}
                            onReady={(element) => {
                                cardCvcRef.current = element;
                            }}
                            onChange={(event) => {
                                if (event.complete) {
                                    onCVC(true);
                                } else {
                                    onCVC(false);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Referral Code Input */}
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
                        color: #00000050;
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

        </div>
    );
};



function UpgradePlanContent({
    open,
    handleClose,
    plan,
    currentFullPlan,
    selectedPlan = null // Pre-selected plan from previous screen
}) {

    const stripeReact = useStripe();
    const elements = useElements();



    const [selectedDuration, setSelectedDuration] = useState(duration[0])

    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [quaterlyPlans, setQuaterlyPlans] = useState([]);
    const [yearlyPlans, setYearlyPlans] = useState([]);

    const [addCardErrtxt, setAddCardErrtxt] = useState(null);

    const [currentSelectedPlan, setCurrentSelectedPlan] = useState(null)
    const [hoverPlan, setHoverPlan] = useState(null);
    const [togglePlan, setTogglePlan] = useState(null);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(null)
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [currentUserPlan, setCurrentUserPlan] = useState(null);
    const [cards, setCards] = useState([])
    const [selectedCard, setSelectedCard] = useState(cards[0]);

    const [showAddCard, setShowAddCard] = useState(false)
    const [forceShowCardForm, setForceShowCardForm] = useState(false)

    const [CardAdded, setCardAdded] = useState(false);
    const [CardExpiry, setCardExpiry] = useState(false);
    const [inviteCode, setInviteCode] = useState("");

    const [addCardLoader, setAddCardLoader] = useState(false);
    const [credentialsErr, setCredentialsErr] = useState(false);
    const [addCardSuccess, setAddCardSuccess] = useState(false);
    const [addCardFailure, setAddCardFailure] = useState(false);
    const [subscribeLoader, setsubscribeLoader] = useState(false);


    const [CVC, setCVC] = useState(false);
    const [elementsCreated, setElementsCreated] = useState(false);

    // State to track if user is adding a new payment method
    const [isAddingNewPaymentMethod, setIsAddingNewPaymentMethod] = useState(false);

    const cardNumberRef = useRef(null);
    const cardExpiryRef = useRef(null);
    const cardCvcRef = useRef(null);
    const elementsRef = useRef(null);

    // referral code validation states
    const [referralStatus, setReferralStatus] = useState("idle"); // idle | loading | valid | invalid
    const [referralMessage, setReferralMessage] = useState("");
    const referralRequestSeqRef = useRef(0);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    let haveCards = cards && cards.length > 0 ? true : false;

    // Determine if user is adding a new payment method
    const isUserAddingNewPaymentMethod = () => {
        // If user has no existing cards and is filling out card form
        if (!haveCards && (CardAdded || CardExpiry || CVC)) {
            return true;
        }
        // If user has cards but is filling out new card form
        if (haveCards && (CardAdded || CardExpiry || CVC)) {
            return true;
        }
        return false;
    };

    // Update the state when payment method fields change
    useEffect(() => {
        setIsAddingNewPaymentMethod(isUserAddingNewPaymentMethod());
    }, [CardAdded, CardExpiry, CVC, haveCards]);

    // Function to determine if upgrade button should be enabled
    const isUpgradeButtonEnabled = () => {
        // Must have a selected plan and it shouldn't be the current plan
        if (!currentSelectedPlan || isPlanCurrent(currentSelectedPlan)) {
            return false;
        }

        // If user is adding a new payment method, they must agree to terms
        if (isAddingNewPaymentMethod && !agreeTerms) {
            return false;
        }

        // If user has existing payment methods and is not adding new ones, they can proceed
        if (haveCards && !isAddingNewPaymentMethod) {
            return true;
        }

        // If user has no payment methods, they must be adding one
        if (!haveCards && isAddingNewPaymentMethod) {
            return CardAdded && CardExpiry && CVC && agreeTerms;
        }

        // If user has payment methods and is adding new ones, they must complete the form
        if (haveCards && isAddingNewPaymentMethod) {
            return CardAdded && CardExpiry && CVC && agreeTerms;
        }

        return false;
    };

    useEffect(() => {

    }, [plan])

    // useEffect(() => {
    //     console.log('currentSelectedPlan', currentSelectedPlan)
    //     console.log('setCurrentUserPlan', currentUserPlan)
    // }
    //     , [currentSelectedPlan, currentFullPlan])

    // Handle pre-selected plan from previous screen
    useEffect(() => {
        if (selectedPlan && open) {

            // Set selected duration based on the plan's billing cycle
            const planDuration = getDurationFromBillingCycle(selectedPlan.billingCycle);
            if (planDuration) {
                setSelectedDuration(planDuration);
            }

            // Find the matching plan in current plans

            const currentPlans = getCurrentPlans();
            const matchingPlan = currentPlans.find(plan =>
                plan.name === selectedPlan.name ||
                plan.id === selectedPlan.id ||
                plan.planType === selectedPlan.planType
            );



            if (matchingPlan) {
                setCurrentSelectedPlan(matchingPlan);
                const planIndex = currentPlans.findIndex(plan => plan.id === matchingPlan.id);
                setSelectedPlanIndex(planIndex);
                setTogglePlan(matchingPlan.id);


            }
        }
    }, [selectedPlan, open, monthlyPlans, quaterlyPlans, yearlyPlans])

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
                const currentSeq = referralRequestSeqRef.current;
                if (currentSeq !== referralRequestSeqRef.current) return;
                setReferralStatus("invalid");
                setReferralMessage("Unable to validate code. Please try again.");
            }
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [inviteCode]);



    // Autofocus the first field when the component mounts
    useEffect(() => {
        // //console.log;
        if (cardNumberRef.current) {
            // //console.log;
            cardNumberRef.current.focus();
        }
    }, []);

    // Create elements only once when Stripe is ready
    useEffect(() => {
        if (stripeReact && elements && !elementsCreated) {
            setElementsCreated(true);
        }
    }, [stripeReact, elements, elementsCreated]);


    // Handle field change to focus on the next input
    const handleFieldChange = (event, ref) => {
        if (event.complete && ref.current) {
            ref.current.focus();
        }
    };
    // const [selectedUserPlan, setSelectedUserPlan] = useState(null);




    useEffect(() => {
        if (open) {
            getPlans()
            getCardsList()
            getCurrentUserPlan()
        }
    }, [open])

    // Check screen height for scrolling behavior
    useEffect(() => {
        const checkScreenHeight = () => {
            setIsSmallScreen(window.innerHeight < 800);
        };

        checkScreenHeight();
        window.addEventListener('resize', checkScreenHeight);

        return () => window.removeEventListener('resize', checkScreenHeight);
    }, []);

    const getCurrentUserPlan = () => {
        const localData = localStorage.getItem("User");
        if (localData) {
            const userData = JSON.parse(localData);
            const plan = userData.user?.plan;
            console.log('Current user plan:', plan);
            setCurrentUserPlan(plan);
        }
    }

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
                        if (!plan.discountPrice) {
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

            // setCurrentSelectedPlan(freePlan);
            setTogglePlan(freePlan?.id);


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

    // Auto-select plan when switching billing cycles
    useEffect(() => {
        const currentPlans = getCurrentPlans();
        if (currentPlans.length > 0 && currentSelectedPlan) {
            if (plan && currentFullPlan) {
                setCurrentSelectedPlan(plan);
                setTogglePlan(plan?.id);
                setCurrentUserPlan(currentFullPlan);
            }
            // Find the plan with the same name in the new billing cycle
            const matchingPlan = currentPlans.find(plan => plan.name === currentSelectedPlan.name);
            if (matchingPlan) {
                const planIndex = currentPlans.findIndex(plan => plan.name === currentSelectedPlan.name);
                setCurrentSelectedPlan(matchingPlan);
                setSelectedPlanIndex(planIndex);
                setTogglePlan(matchingPlan.id);
            } else {
                // If no matching plan found, select the first plan
                setCurrentSelectedPlan(currentPlans[0]);
                setSelectedPlanIndex(0);
                setTogglePlan(currentPlans[0].id);
            }


        }
    }, [selectedDuration]);




    const handleTogglePlanClick = (item, index) => {
        // Don't allow selection of current plan
        const isCurrentPlan = isPlanCurrent(item);
        if (isCurrentPlan) {
            console.log("Cannot select current plan:", item.name);
            return;
        }
        console.log("Selected plan index is", index, item);
        setSelectedPlanIndex(index);
        setTogglePlan(item.id);
        setCurrentSelectedPlan(item);
    };

    const isPlanCurrent = (item) => {
        if (!currentUserPlan) return false;



        // Handle free plan case
        // if (item.isFree && (!currentUserPlan.planId || currentUserPlan.price <= 0)) {
        //     return true;
        // }

        // Handle paid plans
        if (item.id === currentUserPlan.planId) {
            return true;
        }
        return false;
        // Fallback comparison by name
        return item.name === currentUserPlan.name;
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

    const GetMonthCountFronBillingCycle = (billingCycle) => {
        if (billingCycle === "monthly") return 1;
        if (billingCycle === "quarterly") return 3;
        if (billingCycle === "yearly") return 12;
        return 1;
    }

    // Function to get duration object from billing cycle
    const getDurationFromBillingCycle = (billingCycle) => {
        switch (billingCycle) {
            case "monthly":
                return duration[0] // Monthly
            case "quarterly":
                return duration[1]// Quarterly
            case "yearly":
                return duration[2] // Yearly
            default:
                return duration[0]; // Default to monthly
        }
    }

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
        console.log('handleAddCard')
        setAddCardLoader(true);
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        const LocalData = localStorage.getItem("User");
        const D = JSON.parse(LocalData);
        const AuthToken = D.token;

        if (!stripeReact || !elements) {
            setAddCardLoader(false);
            setAddCardFailure(true);
            setAddCardErrtxt("Stripe elements are not loaded correctly.");
            return;
        }

        const cardElement = elements.getElement(CardNumberElement);
        if (!cardElement) {
            setAddCardLoader(false);
            setAddCardFailure(true);
            setAddCardErrtxt("Card element is not initialized.");
            return;
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

        const result = await stripeReact.confirmCardSetup(data.data, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: D.user.name,
                },
            },
        });

        if (result.error) {
            setAddCardLoader(false);
            setAddCardFailure(true);
            setAddCardErrtxt(result.error.message || "Error confirming payment method");
            return null;
        } else {
            // Handle successful payment method addition
            const paymentMethodId = result.setupIntent.payment_method;
            let requestBody = {
                source: paymentMethodId,
                inviteCode: inviteCode,
            };

            const addCardRes = await fetch(Apis.addCard, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${AuthToken}`,
                },
                body: JSON.stringify(requestBody),
            });

            const result2 = await addCardRes.json();
            if (result2.status) {
                setAddCardSuccess(true);
                if (!togglePlan) handleClose(result);
                if (togglePlan) {
                    setShowAddCard(false);
                    getCardsList()
                }
                setAddCardLoader(false);
                return paymentMethodId; // Return the payment method ID
            } else {
                setAddCardFailure(true);
                setAddCardErrtxt(result2.message);
                setAddCardLoader(false);
                return null;
            }
        }
    };


    //function to subscribe plan
    const handleSubscribePlan = async () => {
        try {
            let planType = currentSelectedPlan?.planType;

            setsubscribeLoader(true);
            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                AuthToken = LocalDetails.token;
            }

            const selectedUserLocalData = localStorage.getItem(PersistanceKeys.isFromAdminOrAgency);
            let selectedUser = null;
            console.log("Selected user local data is", selectedUserLocalData);
            if (selectedUserLocalData !== "undefined" && selectedUserLocalData !== null) {
                selectedUser = JSON.parse(selectedUserLocalData);
                console.log("Selected user details are", selectedUser);
            }

            // Handle payment method logic
            let paymentMethodId = null;

            // If user is adding a new payment method, add it first
            if (isAddingNewPaymentMethod) {
                console.log('Adding new payment method before subscription...');
                paymentMethodId = await handleAddCard();
                if (!paymentMethodId) {
                    console.error('Failed to add payment method');
                    setsubscribeLoader(false);
                    return;
                }
            } else if (haveCards && selectedCard) {
                // Use existing payment method
                paymentMethodId = selectedCard.id;
                console.log('Using existing payment method:', paymentMethodId);
            }

            let ApiData = {
                plan: planType,
            };

            // Add payment method ID if we have one
            if (paymentMethodId) {
                ApiData.paymentMethodId = paymentMethodId;
            }

            if (selectedUser) {
                ApiData.userId = selectedUser?.subAccountData?.id;
            }

            const ApiPath = Apis.subscribePlan;
            console.log("Api data", ApiData);
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                console.log("Response of subscribe plan api is", response.data);
                setsubscribeLoader(false);

                // Call getProfileDetails to refresh the profile
                let user
                if (selectedUser) {
                    user = await AdminGetProfileDetails(selectedUser?.subAccountData.id) // refresh admin profile
                } else {
                    user = getProfileDetails()
                }

                // Pass true to indicate successful upgrade
                handleClose(true)
            }
        } catch (error) {
            console.error("Error occurred in subscription:", error);
        } finally {
            setsubscribeLoader(false);
        }
    };

    console.log('price is ', (currentSelectedPlan?.discountPrice))


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
                <div className="flex flex-col justify-center w-full h-full">
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
                        className="w-full flex flex-col border-white"
                        style={{
                            backgroundColor: "#ffffff",
                            padding: 0,
                            borderRadius: "13px",
                            // maxHeight: "95vh",
                            height: "90vh",
                            minHeight: "60vh"
                        }}
                    >
                        <div className="flex flex-row justify-end w-full items-center pe-5 pt-2">
                            <button onClick={() => {
                                handleClose()
                            }}>
                                <Image
                                    src={"/assets/crossIcon.png"}
                                    height={23}
                                    width={23}
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

                            <div className={`flex flex-col w-[75%] md:h-[100%] h-[100%] items-start flex-1 px-6  ${isSmallScreen ? 'overflow-auto' : 'md:overflow-none'}`}
                                style={{
                                    // maxHeight: isSmallScreen ? 'calc(100vh - 120px)' : 'none',
                                    scrollbarWidth: 'none'
                                }}
                            >

                                {/* Header Section */}

                                <div className='flex flex-row justify-between mt-2 w-full'>
                                    <div className='w-full '>
                                        <div className='text-xl font-[600] mb-1'>
                                            Upgrade Your Plan
                                        </div>
                                        <div className='text-[15px] font-semibold'>
                                            Upgrade for premium features and support
                                        </div>
                                    </div>

                                    <div className='w-full flex flex-row items-end justify-end'>

                                        <div className='flex flex-col items-center plan-duration-container'>
                                            {/* Discount labels row */}
                                            <div className='flex flex-row items-center mb-1' style={{ gap: '8px' }}>
                                                {
                                                    duration.map((item) => (
                                                        <div key={`discount-${item.id}`} className='flex items-center justify-center' style={{ minWidth: '70px' }}>
                                                            {item.save ? (
                                                                <div className={`bg-white/40 shadow-[0px_4px_15.5px_0px_rgba(0,0,0,0.11)] backdrop-blur-[10px] rounded-tl-xl rounded-tr-xl px-2 py-0.5`}>
                                                                    <div
                                                                        className={`text-[11px] font-medium whitespace-nowrap ${selectedDuration?.id === item.id ? "text-purple" : "text-neutral-400"}`}
                                                                    >
                                                                        Save {item.save}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div style={{ height: '24px' }}></div>
                                                            )}
                                                        </div>
                                                    ))
                                                }
                                            </div>

                                            {/* Duration buttons row */}
                                            <div className='flex flex-row items-center border bg-neutral-100 px-1 py-0.5 rounded-full' style={{ gap: '8px' }}>
                                                {
                                                    duration.map((item) => (
                                                        <div key={`button-${item.id}`} className='flex items-center justify-center' style={{ minWidth: '70px' }}>
                                                            <button
                                                                className={`px-1 py-[3px] w-full ${selectedDuration?.id === item.id ? "text-white text-[13px] font-normal bg-purple outline-none border-none shadow-md shadow-purple rounded-full" : "text-black"}`}
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
                                </div>


                                {/* Content Section */}
                                <div className='w-full flex-1'
                                    style={{
                                        scrollbarWidth: 'none',
                                        overflowY: isSmallScreen ? 'auto' : 'visible',
                                        maxHeight: isSmallScreen ? 'calc(100vh - 300px)' : 'none'
                                    }}
                                >




                                    <div className='text-lg font-semibold'>
                                        Select Plan
                                    </div>

                                    <div
                                        className='w-full flex flex-row gap-3 mt-3'
                                        style={{
                                            scrollbarWidth: 'none'
                                        }}
                                    >
                                        {
                                            getCurrentPlans().map((item, index) => {
                                                const isCurrentPlan = isPlanCurrent(item);
                                                return (
                                                    <button
                                                        className={`w-3/12 flex flex-col items-start justify-between border-2 p-3 rounded-lg text-left transition-all duration-300
                                                        ${isCurrentPlan
                                                                ? "border-gray-300 cursor-not-allowed opacity-60"
                                                                : currentSelectedPlan?.id === item.id
                                                                    ? "border-purple bg-gradient-to-r from-purple-25 to-purple-50 shadow-lg shadow-purple-100"
                                                                    : "border-gray-200 hover:border-purple hover:shadow-md"
                                                            }`}
                                                        key={item.id}
                                                        onClick={() => handleTogglePlanClick(item, index)}
                                                        disabled={isCurrentPlan}
                                                    >
                                                        <div className='w-full flex flex-row items-center justify-between'>
                                                            <div className='text-[15px] font-semibold'>
                                                                {item.name}
                                                            </div>

                                                            <div className='text-[15px] font-semibold'>
                                                                {`$${item.discountPrice}`}
                                                            </div>
                                                        </div>

                                                        <div className='text-[13px] font-[500] mt-1'>
                                                            {item.details}
                                                        </div>

                                                        <div className={`py-2 mt-2 flex flex-col items-center justify-center w-full rounded-lg text-[13px] font-semibold
                                                        ${isCurrentPlan
                                                                ? "bg-gray-400 text-white cursor-not-allowed"
                                                                : "bg-purple text-white"
                                                            }`}>
                                                            {isCurrentPlan ? "Current Plan" : "Select Plan"}
                                                        </div>
                                                    </button>
                                                );
                                            })
                                        }

                                    </div>


                                    <div className='flex flex-row items-start w-full gap-10 mt-2'>
                                        <div
                                            className='w-[50%] flex flex-col items-start h-[33vh] overflow-y-auto' style={{ scrollbarWidth: 'none' }}
                                        >

                                            {
                                                (cards.length === 0 && !showAddCard) || (showAddCard && cards.length > 0) ? (
                                                    <CardForm
                                                        onCardAdded={setCardAdded}
                                                        onCardExpiry={setCardExpiry}
                                                        onCVC={setCVC}
                                                        onFieldChange={handleFieldChange}
                                                        cardNumberRef={cardNumberRef}
                                                        cardExpiryRef={cardExpiryRef}
                                                        cardCvcRef={cardCvcRef}
                                                        inviteCode={inviteCode}
                                                        setInviteCode={setInviteCode}
                                                        referralStatus={referralStatus}
                                                        referralMessage={referralMessage}
                                                        addCardLoader={addCardLoader}
                                                        handleAddCard={handleAddCard}
                                                        onCancel={() => {
                                                            setShowAddCard(false);
                                                        }}
                                                        haveCards={haveCards}
                                                    />
                                                ) : (

                                                    <div className='flex flex-col gap-2 mt-2 items-start w-full' >
                                                        <div className='w-full flex flex-row items-center justify-between'>
                                                            <div className='text-lg font-semibold flex flex-row items-start justify-between'>
                                                                Payment
                                                            </div>

                                                            <button
                                                                onClick={() => {
                                                                    setShowAddCard(true);
                                                                }}
                                                                className='text-xs font-medium mt-4 text-purple hover:text-purple-700'
                                                            >
                                                                + Add Payment
                                                            </button>
                                                        </div>
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
                                                                                className={`w-5 h-5 rounded-full border border-[#7902DF] flex items-center justify-center`}
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

                                                                            <div className='text-xs font-normal'>
                                                                                ****{item.last4} {
                                                                                    item.isDefault && (
                                                                                        <span>{`(default)`}</span>
                                                                                    )}
                                                                            </div>
                                                                        </div>

                                                                    </div>
                                                                </button>
                                                            </div>
                                                        ))}


                                                    </div>
                                                )
                                            }

                                        </div>


                                        {/* Only show Order Summary if a plan is selected */}
                                        {currentSelectedPlan && (
                                            <div className={`w-[50%] flex flex-col items-start ${haveCards ? "text-black" : "text-[#8a8a8a]"}`}>
                                                <div className=' text-xl font-semibold '>
                                                    Order Summary
                                                </div>
                                                <div className="flex flex-row items-start justify-between w-full mt-6">
                                                    <div>
                                                        <div className=' text-lg font-semibold'>
                                                            {currentSelectedPlan ? `${currentSelectedPlan?.name} Plan` : "No Plan Selected"}
                                                        </div>
                                                        <div className=' text-xs font-regular '>
                                                            {currentSelectedPlan ? `${currentSelectedPlan?.billingCycle} subscription` : ""}
                                                        </div>
                                                    </div>
                                                    <div className='' style={{ fontWeight: "600", fontSize: 15 }}>
                                                        {currentSelectedPlan ? `${GetMonthCountFronBillingCycle(currentSelectedPlan?.billingCycle || "")} x ${currentSelectedPlan?.discountPrice}` : ""}
                                                    </div>
                                                </div>

                                                <div className="flex flex-row items-start justify-between w-full mt-6">
                                                    <div>
                                                        <div className='' style={{ fontWeight: "600", fontSize: 15 }}>
                                                            {` Total Billed ${currentSelectedPlan?.billingCycle}`}
                                                        </div>
                                                        <div className='' style={{ fontWeight: "400", fontSize: 13, marginTop: "" }}>Next Charge Date {getNextChargeDate(currentSelectedPlan)}</div>
                                                    </div>
                                                    <div className='' style={{ fontWeight: "600", fontSize: 15 }}>
                                                        {currentSelectedPlan ? `$${GetMonthCountFronBillingCycle(currentSelectedPlan?.billingCycle || "") * (currentSelectedPlan?.discountPrice)}` : "$0"}
                                                    </div>
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

                                                <div className='w-full h-[1px] bg-gray-200 my-2'></div>

                                            </div>
                                        )}
                                    </div>


                                    {/* Terms and Conditions - Only show when adding new payment method */}
                                    {isAddingNewPaymentMethod && (
                                        <div className="w-full">
                                            <div className="w-full mb-4 flex flex-row items-center gap-3">
                                                <button
                                                    className="outline-none border-none"
                                                    onClick={() => setAgreeTerms(!agreeTerms)}
                                                >
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
                                                            className="bg-none border-2 border-gray-300 flex flex-row items-center justify-center rounded"
                                                            style={{ height: "24px", width: "24px" }}
                                                        ></div>
                                                    )}
                                                </button>

                                                <div
                                                    className="flex flex-row items-center gap-2"
                                                    style={{
                                                        fontWeight: "500",
                                                        fontSize: 15
                                                    }}
                                                >
                                                    <div>
                                                        I agree to
                                                    </div>
                                                    <a
                                                        href={"https://www.myagentx.com/terms-and-condition"}
                                                        style={{ textDecoration: "underline", color: "#7902DF" }}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-purple-700 transition-colors duration-200"
                                                    >
                                                        Terms & Conditions
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Upgrade Button - Fixed at bottom with equal padding */}
                                {/* Total Section - Inside Order Summary */}
                                <div className='flex w-full'>
                                    <div className='w-1/2 '></div>
                                    <div className='flex flex-row w-1/2 justify-between items-center mt-1 ps-4'>
                                        <div className=" text-3xl font-semibold  ">
                                            Total:
                                        </div>
                                        <div className=" text-3xl font-semibold  ">
                                            {currentSelectedPlan ? `$${(GetMonthCountFronBillingCycle(currentSelectedPlan?.billingCycle || "") * (currentSelectedPlan?.discountPrice)).toLocaleString()}` : "$0"}
                                        </div>
                                    </div>
                                </div>
                                <div className='w-full flex flex-row items-end justify-end md:mt-6 mt-3 pb-5'>
                                    {
                                        subscribeLoader ? (
                                            <div className="w-1/2 flex flex-col items-center justify-center h-[53px]">
                                                <CircularProgress size={25} />
                                            </div>
                                        ) : (
                                            <button
                                                className={`w-1/2 flex flex-col items-center justify-center md:h-[53px] h-[42px] rounded-lg text-base sm:text-lg font-semibold transition-all duration-300
                                                ${isUpgradeButtonEnabled()
                                                        ? "text-white bg-purple hover:bg-purple-700"
                                                        : "text-black bg-[#00000050] cursor-not-allowed"
                                                    }`}
                                                disabled={!isUpgradeButtonEnabled()}
                                                onClick={() => {
                                                    if (isUpgradeButtonEnabled()) {
                                                        handleSubscribePlan();
                                                    }
                                                }}
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
        height: "auto",
        maxHeight: "95vh",
        bgcolor: "transparent",
        mx: "auto",
        my: "5vh",
        transform: "translateY(0)",
        borderRadius: 2,
        outline: "none",
        overflow: "hidden",
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


function UpgradePlan({
    open,
    handleClose,
    plan,
    currentFullPlan,
    selectedPlan = null // Pre-selected plan from previous screen
}) {
    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);

    return (
        <Elements stripe={stripePromise}>
            <UpgradePlanContent
                open={open}
                handleClose={handleClose}
                plan={plan}
                currentFullPlan={currentFullPlan}
                selectedPlan={selectedPlan}
            />
        </Elements>
    );
}

export default UpgradePlan