import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { calculatePlanPrice, checkReferralCode, getNextChargeDate, getUserLocalData, getUserPlans } from './UserPlanServices'
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
// import { duration } from '@/utilities/PlansService'
import CloseBtn from '../globalExtras/CloseBtn'
import { DurationView } from '../plan/DurationView'
import { formatFractional2 } from '../agency/plan/AgencyUtilities'

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
                    className="px-3 py-[2px] relative flex items-center border"
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
            <div className="flex flex-row gap-2 w-full mt-2">
                <div className="w-6/12">
                    <div
                        className="px-3 py-[2px] border"
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
                        className="px-3 py-[2px] border"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: "8px" }}
                    >
                        <CardCvcElement
                            // options={elementOptions}
                            options={{
                                ...elementOptions,
                                placeholder: "CVV", // 👈 add this
                            }}
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
            <div className="mt-2">
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
    selectedPlan = null, // Pre-selected plan from previous screen
    setSelectedPlan = null,
    from,
    setShowSnackMsg = null,
    showSnackMsg = null,
    selectedUser,

}) {

    const stripeReact = useStripe();
    const elements = useElements();

    //plans durations view
    const [duration, setDuration] = useState([
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
    ]);

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
    const [makeDefaultCardLoader, setMakeDefaultCardLoader] = useState(false);


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
    const [isPreSelectedPlanTriggered, setIsPreSelectedPlanTriggered] = useState(false);
    const [loading, setLoading] = useState(false);

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

        //disable if snack msg is visible
        if (showSnackMsg?.isVisible) {
            return false;
        }
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
        const initializePlans = async () => {
            if (open) {
                setLoading(true);
                // Load plans and wait for completion
                const plansData = await getPlans();
                getCardsList();
                getCurrentUserPlan();

                // Only proceed with plan selection if we have plans data and haven't triggered yet
                if (plansData && !isPreSelectedPlanTriggered) {
                    setIsPreSelectedPlanTriggered(true);

                    console.log("selected plan from previous screen in pre selected plan useeffect is ", selectedPlan);

                    // Set selected duration based on the plan's billing cycle if selectedPlan is not null 
                    let planDuration = null;

                    if (selectedPlan) {
                        planDuration = getDurationFromBillingCycle(selectedPlan?.billingCycle);
                        console.log("Billing bicycle of selected plan", planDuration);
                        if (planDuration) {
                            setSelectedDuration(planDuration);
                        }
                    } else {
                        console.log("no selected plan, set first plan as current selected plan ");
                        // if selectedPlan is null then set selected duration of current plan
                        if (currentUserPlan && currentUserPlan.billingCycle) {
                            planDuration = getDurationFromBillingCycle(currentUserPlan.billingCycle);
                            console.log("Billing bicycle of current user plan", planDuration);
                        } else {
                            // Use the first available plan from the loaded data
                            const firstPlan = plansData.monthly[0] || plansData.quarterly[0] || plansData.yearly[0];
                            if (firstPlan) {
                                planDuration = getDurationFromBillingCycle(firstPlan.billingCycle);
                            }
                        }
                        if (planDuration) {
                            setSelectedDuration(planDuration);
                            console.log("Billing bicycle of current plan2", planDuration);
                        }
                    }

                    // Wait a bit for selectedDuration to update, then find matching plan
                    setTimeout(() => {
                        // Get current plans based on the updated selectedDuration
                        let currentPlans = [];
                        if (planDuration?.id === 1) currentPlans = plansData.monthly;
                        else if (planDuration?.id === 2) currentPlans = plansData.quarterly;
                        else if (planDuration?.id === 3) currentPlans = plansData.yearly;

                        console.log("current plans are before checking matching plan", currentPlans);

                        const matchingPlan = currentPlans.find(plan =>
                            // plan.name === selectedPlan?.name ||
                            plan.id === selectedPlan?.id //||
                            // plan.planType === selectedPlan?.planType
                        );

                        if (matchingPlan) {
                            console.log("matching plan found is", matchingPlan);
                            console.log("selected duration is", planDuration);
                            setCurrentSelectedPlan(matchingPlan);
                            const planIndex = currentPlans.findIndex(plan => plan.id === matchingPlan.id);
                            setSelectedPlanIndex(planIndex);
                            setTogglePlan(matchingPlan.id);
                        } else {
                            console.log("no matching plan found");
                        }
                    }, 100);
                }
                setLoading(false);
            }
        };

        initializePlans();
    }, [open])

    useEffect(() => {
        console.log("usercurrentplanselected is", currentSelectedPlan)
    }, [currentSelectedPlan])

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
        console.log("Open rerendered")
        // if (!open || currentSelectedPlan) return;
        // if (!plan && !currentFullPlan) {
        //     console.log("No plan or current full plan")
        //     return;
        // }
        if (open) {

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
        let plansList = await getUserPlans(from, selectedUser)
        if (plansList) {
            console.log("Plans list found is", plansList);
            const monthly = [];
            const quarterly = [];
            const yearly = [];
            let freePlan = null;
            const UserLocalData = getUserLocalData();
            if (from === "SubAccount" || UserLocalData?.userRole === "AgencySubAccount") {
                console.log("Current plan upgrade type is subaccount")
                plansList?.monthlyPlans?.forEach(plan => {
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
            } else {
                console.log("Current plan upgrade type is Simple user")
                plansList.forEach(plan => {
                    switch (plan.billingCycle || plan.duration) {
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
            }

            if (freePlan) {
                quarterly.unshift({ ...freePlan, billingCycle: "quarterly" });
                yearly.unshift({ ...freePlan, billingCycle: "yearly" });
            }

            // setCurrentSelectedPlan(freePlan);
            setTogglePlan(freePlan?.id);


            setMonthlyPlans(monthly);
            setQuaterlyPlans(quarterly);
            setYearlyPlans(yearly);

            const emptyDurations = [monthly, quarterly, yearly].filter(arr => arr.length === 0).length;
            console.log("Empty durations are", emptyDurations);
            if (from === "SubAccount") {
                if (emptyDurations >= 2) {
                    setDuration([]);
                } else {
                    if (monthly.length === 0) {
                        console.log("Remove monthly");
                        setDuration(prev => prev.filter(item => item.id !== 1));
                    }
                    if (quarterly.length === 0) {
                        console.log("Remove quarterly");
                        setDuration(prev => prev.filter(item => item.id !== 2));
                    }
                    if (yearly.length === 0) {
                        console.log("Remove yearly");
                        setDuration(prev => prev.filter(item => item.id !== 3));
                    }

                }
            }

            console.log('monthly', monthly)
            console.log('quarterly', quarterly)
            console.log('yearly', yearly)

            // Return the plans data for immediate use
            return { monthly, quarterly, yearly, freePlan };
        }
        return null;
    }
    const getCurrentPlans = () => {
        console.log("selected duration in get current plans is", selectedDuration)
        if (selectedDuration.id === 1) return monthlyPlans;
        if (selectedDuration.id === 2) return quaterlyPlans;
        if (selectedDuration.id === 3) return yearlyPlans;
        // console.log("selected duration invalid", selectedDuration)
        return [];
    };



    const handleTogglePlanClick = (item, index) => {
        // Don't allow selection of current plan
        const isCurrentPlan = isPlanCurrent(item);
        if (isCurrentPlan) {
            console.log("Cannot select current plan:", item.name);
            return;
        }
        console.log("Selected plan index is", index, item);
        setSelectedPlan(item);
        // setSelectedPlanIndex(index);
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
        console.log("billingCycle is", billingCycle)
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
                setIsPreSelectedPlanTriggered(false);
                if (!togglePlan) {
                    setIsPreSelectedPlanTriggered(false);
                    handleClose(result);
                }
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

    //function to make default cards api
    const makeDefaultCard = async (item) => {
        setSelectedCard(item);
        try {
            setMakeDefaultCardLoader(true);

            const localData = localStorage.getItem("User");
            let AuthToken = null;

            if (localData) {
                const Data = JSON.parse(localData);
                AuthToken = Data.token;
            }

            const ApiPath = Apis.makeDefaultCard;
            const ApiData = {
                paymentMethodId: item.id,
            };

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                if (response.data.status === true) {
                    // Update cards state to reflect the change
                    setCards(prevCards =>
                        prevCards?.map(card => ({
                            ...card,
                            isDefault: card.id === item.id
                        }))
                    );
                    setAddCardSuccess(true);
                    setAddCardErrtxt("Card set as default successfully");
                } else {
                    setAddCardFailure(true);
                    setAddCardErrtxt(response.data.message || "Failed to set default card");
                }
            }
        } catch (error) {
            console.error("Error occurred in make default card api:", error);
            setAddCardFailure(true);
            setAddCardErrtxt("Error setting default card");
        } finally {
            setMakeDefaultCardLoader(false);
        }
    };

    //function to subscribe plan
    const handleSubscribePlan = async () => {
        // setShowSnackMsg({
        //     type: SnackbarTypes.Success,
        //     message: "Plan upgraded successfully",
        //     isVisible: true
        // })

        // setTimeout(() => {
        //     handleClose(true)
        // }, 3000)
        // return
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
            // let selectedUser = null;
            console.log("Selected user local data passed is", selectedUser);
            // return
            // if (selectedUserLocalData !== "undefined" && selectedUserLocalData !== null) {
            //     selectedUser = JSON.parse(selectedUserLocalData);
            //     console.log("Selected user details are", selectedUser);
            // }

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

            const UserLocalData = getUserLocalData();
            console.log("User local data", UserLocalData)
            let DataToSendInApi = null;
            // if (UserLocalData?.userRole === "AgencySubAccount") {
            //     console.log("Check 111");
            //     let formData = new FormData();
            //     formData.append("planId", currentSelectedPlan?.id);
            //     DataToSendInApi = formData;
            // } else {
            console.log("Check 222");
            let ApiData = {
                plan: planType,
            };
            if (from === "SubAccount") {
                ApiData = {
                    planId: currentSelectedPlan?.id
                }
            } else if (from === "agency") {
                ApiData = {
                    planId: currentSelectedPlan?.id
                }
            }

            // Add payment method ID if we have one
            if (paymentMethodId) {
                ApiData.paymentMethodId = paymentMethodId;
            }

            if (selectedUser) {
                ApiData.userId = selectedUser?.id;
            }
            console.log("Check 333");
            DataToSendInApi = ApiData;


            let ApiPath = Apis.subscribePlan;
            if (UserLocalData?.userRole === "AgencySubAccount") {
                ApiPath = Apis.subAgencyAndSubAccountPlans;
            }
            if (from === "SubAccount") {
                ApiPath = Apis.subAgencyAndSubAccountPlans;
            } else if (from === "agency") {
                ApiPath = Apis.subAgencyAndSubAccountPlans;
            }
            console.log("Api data for upgrade plan", DataToSendInApi);

            if (selectedUser) {
                ApiPath = `${ApiPath}?userId=${selectedUser.id}`;
            }

            //headers for api
            let headers = {
                Authorization: "Bearer " + AuthToken,
            };

            if (!(UserLocalData?.userRole === "AgencySubAccount")) {
                headers["Content-Type"] = "application/json";
            }

            const response = await axios.post(ApiPath, DataToSendInApi, {
                headers: headers,
            });

            if (response) {
                console.log("Response of subscribe plan api is", response.data);
                setsubscribeLoader(false);

                // Call getProfileDetails to refresh the profile
                let user
                if (selectedUser) {
                    user = await AdminGetProfileDetails(selectedUser?.id) // refresh admin profile
                } else {
                    user = getProfileDetails()
                }

                // Pass true to indicate successful upgrade
                // handleClose(true)
                setShowSnackMsg({
                    type: SnackbarTypes.Success,
                    message: response.data.message,
                    isVisible: true
                })
                setTimeout(() => {
                    setIsPreSelectedPlanTriggered(false);
                    handleClose(true)
                }, 3000)
                return

            }
        } catch (error) {
            console.error("Error occurred in subscription:", error);
        } finally {
            setsubscribeLoader(false);
        }
    };

    console.log('price is ', (currentSelectedPlan?.discountPrice))


    const comparePlans = (currentPlan, targetPlan) => {
        if (!currentPlan || !targetPlan) {
            return null; // Changed from 'same' to null to indicate loading state
        }

        // Get monthly prices (discountPrice is already per-month for all billing cycles)
        const currentPrice = currentPlan.discountPrice || currentPlan.price || 0;
        const targetPrice = targetPlan.discountPrice || targetPlan.price || 0;

        // console.log('🔍 [PLAN-COMPARE] Current plan:', currentPlan.name, 'Price:', currentPrice, 'Billing:', currentPlan.billingCycle);
        // console.log('🔍 [PLAN-COMPARE] Target plan:', targetPlan.name, 'Price:', targetPrice, 'Billing:', targetPlan.billingCycle);

        // If same plan (by ID), it's the same
        if (currentPlan.id === targetPlan.id || currentPlan.planId === targetPlan.id) {
            return 'same';
        }

        // If target is free plan and current is paid, it's a downgrade
        if ((targetPlan.isFree || targetPrice === 0) && currentPrice > 0) {
            return 'downgrade';
        }

        // If current is free and target is paid, it's an upgrade
        if ((currentPlan.isFree || currentPrice === 0) && targetPrice > 0) {
            return 'upgrade';
        }

        // Get billing cycle order (monthly < quarterly < yearly)
        const billingCycleOrder = {
            'monthly': 1,
            'quarterly': 2,
            'yearly': 3
        };

        const currentBillingOrder = billingCycleOrder[currentPlan.billingCycle] || 1;
        const targetBillingOrder = billingCycleOrder[targetPlan.billingCycle] || 1;

        // If same name/tier but different billing cycle
        if (currentPlan.name === targetPlan.name) {
            // Longer billing cycle is considered an upgrade (more commitment)
            if (targetBillingOrder > currentBillingOrder) {
                return 'upgrade';
            } else if (targetBillingOrder < currentBillingOrder) {
                return 'downgrade';
            } else {
                return 'same';
            }
        }

        // Compare prices
        if (targetPrice > currentPrice) {
            return 'upgrade';
        } else if (targetPrice < currentPrice) {
            return 'downgrade';
        } else {
            // Same price, different plans - consider billing cycle
            if (targetBillingOrder > currentBillingOrder) {
                return 'upgrade';
            } else if (targetBillingOrder < currentBillingOrder) {
                return 'downgrade';
            } else {
                return 'same';
            }
        }
    };


    // Function to determine button text and action
    const getButtonConfig = () => {
        console.log("currentPlan", currentFullPlan)
        console.log("selectedPlan", selectedPlan)


        // Compare plans based on price
        const planComparison = comparePlans(currentFullPlan, selectedPlan);
        console.log('🔍 [BUTTON-CONFIG] Plan comparison:', planComparison);

        // If still loading (currentFullPlan not ready), don't show any button
        if (planComparison === null) {
            return null; // Will hide the button section while loading
        }

        // If it's an upgrade, show Upgrade button
        if (planComparison === 'upgrade') {
            return {
                text: "Upgrade",
                action: () => handleSubscribePlan(),
                isLoading: subscribeLoader,
                className: "rounded-xl w-full",
                style: {
                    height: "50px",
                    fontSize: 16,
                    fontWeight: "700",
                    flexShrink: 0,
                    backgroundColor: "#7902DF",
                    color: "#ffffff",
                }
            };
        }

        // Otherwise it's a downgrade
        return {
            text: "Downgrade",

            action: () => handleSubscribePlan(),
            isLoading: subscribeLoader,
            className: "rounded-xl w-full",
            style: {
                height: "50px",
                fontSize: 16,
                fontWeight: "700",
                flexShrink: 0,
                backgroundColor: "#7902DF",
                color: "#ffffff",
            }
        };
    }


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
                        message={addCardErrtxt || "Card added successfully"}
                    />
                    <div
                        className="w-full flex flex-col border-white"
                        style={{
                            backgroundColor: "#ffffff",
                            padding: 0,
                            borderRadius: "13px",
                            maxHeight: "85vh",
                            height: "auto"
                        }}
                    >
                        <div className="flex flex-row justify-end w-full h-full items-center pe-5 pt-2">
                            <CloseBtn
                                onClick={() => {
                                    setIsPreSelectedPlanTriggered(false);
                                    // setShowRenameAgentPopup(null);
                                    handleClose()
                                }}
                            />
                        </div>


                        <div className="w-full flex flex-row items-stretch pb-4 content-div h-full overflow-hidden">
                            {/* Left AgentX Logo */}
                            <div
                                className="flex flex-col LeftInnerDiv1 items-start justify-center w-[20%]"
                                style={{
                                    flexShrink: 0,
                                }}
                            >
                                <Image
                                    alt="*"
                                    src={"/otherAssets/paymentCircle2.png"}
                                    height={240}
                                    width={190}
                                    style={{
                                        borderTopRightRadius: '200px',
                                        borderBottomRightRadius: '200px',
                                        boxShadow: '0 0 40px 0 rgba(128, 90, 213, 0.5)' // purple shadow
                                    }}
                                />
                            </div>

                            <div className='flex flex-col w-[75%] items-start flex-1 px-6 pb-4'
                                style={{
                                    scrollbarWidth: 'none',
                                    maxHeight: '100%',
                                    overflow: 'hidden'
                                }}
                            >

                                {/* Header Section */}

                                <div className='flex flex-row justify-between mt-2 w-full flex-shrink-0'>
                                    <div className='w-full '>
                                        <h1 className='text-4xl font-bold mb-1'>
                                            Upgrade Your Plan
                                        </h1>
                                        <div className='text-[15px] font-semibold'>
                                            Upgrade for premium features and support
                                        </div>
                                    </div>

                                    <div className='w-full flex flex-row items-end justify-end'>

                                        <DurationView
                                            selectedDuration={selectedDuration}
                                            handleDurationChange={(item) => setSelectedDuration(item)}
                                            from={from}
                                            duration={duration}
                                        />
                                    </div>
                                </div>


                                {/* Content Section */}
                                <div className='w-full flex flex-col items-start flex-1 min-h-0 overflow-y-auto'
                                    style={{
                                        scrollbarWidth: 'none'
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
                                            loading ? (

                                                <div className="w-full flex flex-row items-center justify-center h-[50px]">
                                                    <CircularProgress className="flex-shrink-0" size={24} />
                                                </div>
                                            ) : (
                                                getCurrentPlans()?.map((item, index) => {
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
                                                            onClick={() => {
                                                                handleTogglePlanClick(item, index)
                                                                // console.log("Selected item billing cycle is", item.billingCycle)
                                                                // const planDuration = getDurationFromBillingCycle(item?.billingCycle);
                                                                // setSelectedDuration(planDuration)
                                                            }}
                                                            disabled={isCurrentPlan}
                                                        >
                                                            <div className='w-full flex flex-row items-center justify-between'>
                                                                <div className='text-[15px] font-semibold'>
                                                                    {item.name || item.title}
                                                                </div>

                                                                <div className='text-[15px] font-semibold'>
                                                                    {`$${formatFractional2(item.discountPrice || item.discountedPrice || item.originalPrice)}`}
                                                                </div>
                                                            </div>

                                                            <div className='text-[13px] font-[500] mt-1'>
                                                                {item.details || item.description}
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
                                            )
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
                                                        {cards?.map((item) => (
                                                            <div className="w-full" key={item.id}>
                                                                <button
                                                                    className="w-full outline-none"
                                                                    onClick={() => makeDefaultCard(item)}
                                                                    disabled={makeDefaultCardLoader}
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
                                                                                {makeDefaultCardLoader && selectedCard?.id === item.id && (
                                                                                    <CircularProgress size={12} style={{ marginLeft: '8px' }} />
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
                                            <div className={`w-[50%] flex flex-col items-start ${haveCards || isAddingNewPaymentMethod ? "text-black" : "text-[#8a8a8a]"}`}>
                                                <div className=' text-xl font-semibold '>
                                                    Order Summary
                                                </div>
                                                <div className="flex flex-row items-start justify-between w-full mt-6">
                                                    <div>
                                                        <div className=' text-lg font-semibold'>
                                                            {currentSelectedPlan ? `${currentSelectedPlan?.name || currentSelectedPlan?.title}` : "No Plan Selected"}
                                                        </div>
                                                        <div className=' text-xs font-regular capitalize'>
                                                            {currentSelectedPlan ? `${currentSelectedPlan?.billingCycle || currentSelectedPlan?.duration} subscription` : ""}
                                                        </div>
                                                        {/*currentSelectedPlan?.billingCycle?.charAt(0).toUpperCase() + currentSelectedPlan?.billingCycle?.slice(1)*/}
                                                    </div>
                                                    <div className='' style={{ fontWeight: "600", fontSize: 15 }}>
                                                        {currentSelectedPlan ? `$${formatFractional2(currentSelectedPlan?.discountPrice || currentSelectedPlan?.discountedPrice || currentSelectedPlan?.originalPrice)}` : ""}
                                                    </div>
                                                </div>

                                                <div className="flex flex-row items-start justify-between w-full mt-6">
                                                    <div>
                                                        <div className='capitalize' style={{ fontWeight: "600", fontSize: 15 }}>
                                                            {` Total Billed ${currentSelectedPlan?.billingCycle || currentSelectedPlan?.duration}`}
                                                        </div>
                                                        <div className='' style={{ fontWeight: "400", fontSize: 13, marginTop: "" }}>Next Charge Date {getNextChargeDate(currentSelectedPlan)}</div>
                                                    </div>
                                                    <div className='' style={{ fontWeight: "600", fontSize: 15 }}>
                                                        {currentSelectedPlan ? `$${(GetMonthCountFronBillingCycle(currentSelectedPlan?.billingCycle || currentSelectedPlan?.duration) * (currentSelectedPlan?.discountPrice || currentSelectedPlan?.discountedPrice || currentSelectedPlan?.originalPrice)).toLocaleString()}` : "$0"}
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

                                </div>
                                {/* Terms and Conditions - Only show when adding new payment method */}

                                {/* Upgrade Button Section - Fixed at bottom */}
                                <div className='flex w-full flex-shrink-0 mt-4'>
                                    <div className='w-full'>
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
                                                        className="flex flex-row items-center gap-1"
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
                                    <div className='flex flex-row w-full justify-between items-center mt-1 ps-4'>
                                        <div className=" text-3xl font-semibold  ">
                                            Total:
                                        </div>
                                        <div className=" text-3xl font-semibold  ">
                                            {currentSelectedPlan ? `$${formatFractional2(GetMonthCountFronBillingCycle(currentSelectedPlan?.billingCycle || currentSelectedPlan?.duration) * (currentSelectedPlan?.discountPrice || currentSelectedPlan?.discountedPrice || currentSelectedPlan?.originalPrice))}` : "$0"}
                                        </div>
                                    </div>
                                </div>

                                <div className='w-full flex self-end flex-row items-end justify-end flex-shrink-0 mt-3'>
                                    <div className="w-1/2"></div>
                                    {
                                        subscribeLoader ? (
                                            <div className="w-full flex flex-col items-center justify-center h-[53px]">
                                                <CircularProgress size={25} />
                                            </div>
                                        ) : (
                                            <div className="w-1/2">
                                                {
                                                    subscribeLoader ? (
                                                        <div className="w-1/2 flex flex-col items-center justify-center h-[53px]">
                                                            <CircularProgress size={25} />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className={`w-full flex flex-col items-center justify-center md:h-[53px] h-[42px] rounded-lg text-base sm:text-lg font-semibold transition-all duration-300
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
                                                            {comparePlans(currentFullPlan, currentSelectedPlan) === 'downgrade' ? "Downgrade" : "Upgrade"}
                                                        </button>
                                                    )
                                                }
                                            </div>
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
        my: "50vh",
        transform: "translateY(-50%)",
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
    selectedPlan = null, // Pre-selected plan from previous screen
    setSelectedPlan = null,
    from = "User",
    selectedUser,
    // setShowSnackMsg = null
}) {
    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);

    const [showSnackMsg, setShowSnackMsg] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    })

    return (
        <Elements stripe={stripePromise}>
            <AgentSelectSnackMessage
                message={showSnackMsg.message}
                type={showSnackMsg.type}
                isVisible={showSnackMsg.isVisible}
                hide={() => setShowSnackMsg({ type: null, message: "", isVisible: false })}
            />
            <UpgradePlanContent
                open={open}
                handleClose={handleClose}
                plan={plan}
                currentFullPlan={currentFullPlan}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                from={from}
                setShowSnackMsg={setShowSnackMsg}
                showSnackMsg={showSnackMsg}
                selectedUser={selectedUser}
            />
        </Elements>
    );
}

export default UpgradePlan