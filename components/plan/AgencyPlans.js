import React, { useEffect, useState } from 'react'
import BackgroundVideo from '../general/BackgroundVideo';
import Image from 'next/image';
import { PersistanceKeys } from '@/constants/Constants';
import axios from 'axios';
import Apis from '../apis/Apis';
import { Box, CircularProgress, Modal, Tooltip } from '@mui/material';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import AddCardDetails from '../createagent/addpayment/AddCardDetails';
import getProfileDetails from "@/components/apis/GetProfile";
import { AuthToken } from '../agency/plan/AuthDetails';
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage';
import { useRouter } from 'next/navigation';
import SelectYearlypopup from './SelectYearlypopup';
import AgencyAddCard from '../createagent/addpayment/AgencyAddCard';
import { FalloutShelter } from '@phosphor-icons/react/dist/ssr';
import { formatDecimalValue } from '../agency/agencyServices/CheckAgencyData';
import CloseBtn from '../globalExtras/CloseBtn';
import ProgressBar from "@/components/onboarding/ProgressBar";
import LoaderAnimation from '../animations/LoaderAnimation';


//code for add card
let stripePublickKey =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
        ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
        : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

function AgencyPlans({ isFrom, handleCloseModal, disAblePlans = false, hideProgressBar = true }) {

    const router = useRouter();
    const duration = [
        {
            id: 1,
            title: "Monthly",
        }, {
            id: 2,
            title: "Quarterly",
        }, {
            id: 3,
            title: "Yearly",
        },
    ]

    const durationSaving = [
        {
            id: 2,
            title: "save 20%",
        }, {
            id: 3,
            title: "save 30%",
        },
    ]

    //hover plans state
    const [hoverPlan, setHoverPlan] = useState(null);

    const [togglePlan, setTogglePlan] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [quaterlyPlans, setQuaterlyPlans] = useState([]);
    const [yearlyPlans, setYearlyPlans] = useState([]);
    const [loading, setLoading] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState(duration[2]);
    //code for add card
    const [addPaymentPopUp, setAddPaymentPopUp] = useState(false);
    const [subPlanLoader, setSubPlanLoader] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);

    //yearly plans popup
    const [showYearlyPlan, setShowYearlyPlan] = useState(false);
    const [isContinueMonthly, setIsContinueMonthly] = useState(false);

    // Current user plan state
    const [currentUserPlan, setCurrentUserPlan] = useState(null);
    
    // Redirecting loader state
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Subscription payment failure tracking
    const [subscriptionPaymentFailed, setSubscriptionPaymentFailed] = useState(false);
    const [failedPlanId, setFailedPlanId] = useState(null);

    useEffect(() => {
        getPlans();
        getCurrentUserPlan();
    }, []);

    // Function to get current user plan from localStorage
    const getCurrentUserPlan = () => {
        const localData = localStorage.getItem("User");
        if (localData) {
            const userData = JSON.parse(localData);
            const plan = userData.user?.plan;
            console.log('Current user plan in AgencyPlans:', plan);
            setCurrentUserPlan(plan);
        }
    };

    // Function to check if a plan is the current user's plan
    const isPlanCurrent = (item) => {
        if (!currentUserPlan || !item) return false;

        // Check if plan ID matches
        if (item.id === currentUserPlan.planId) {
            return true;
        }

        // Fallback: Check by name and duration if IDs don't match
        const planName = (item.title || item.name || '').toLowerCase();
        const userPlanName = (currentUserPlan.title || currentUserPlan.name || '').toLowerCase();
        const planDuration = (item.duration || '').toLowerCase();
        const userPlanDuration = (currentUserPlan.duration || '').toLowerCase();

        if (planName === userPlanName && planDuration === userPlanDuration) {
            return true;
        }

        return false;
    };

    //if Noah said to resume this then apply this for yearly plan
    const selectDefaultPlan = (monthly) => {
        // if (monthlyPlans.length > 0) {
        // setSelectedPlanIndex(1);
        // setTogglePlan(monthly[1]?.id);
        // setSelectedPlan(monthly[1]);
        // console.log('monthlyPlans', monthlyPlans)
        // }else{
        //     console.log('no plan')
        // }
    }


    useEffect(() => {

        console.log('selectedPlanIndex', selectedPlanIndex)
        console.log('togglePlan', togglePlan)
    }, [selectedPlan, togglePlan])

    //continue monthly plan
    const continueMonthly = () => {
        setIsContinueMonthly(true);
        setShowYearlyPlan(false);
        handleSubscribePlan();
    }

    //continue yearly plan
    const continueYearlyPlan = () => {
        setSelectedDuration(duration[2]);
        const planSelected = yearlyPlans[selectedPlanIndex];
        setSelectedPlan(planSelected);//yearlyPlans[selectedPlanIndex]
        // console.log("Selected plan is", planSelected);
        setTogglePlan(planSelected.id);
        setShowYearlyPlan(false);
        handleSubscribePlan();
    }



    //check the profit state
    const checkCanSelectYearly = () => {
        console.log("Selected duration plan is", selectedDuration);
        if (selectedDuration.title === "Yearly") {
            setShowYearlyPlan(false);
        } else {
            if (isContinueMonthly === false) {
                setShowYearlyPlan(true);
            } else if (isContinueMonthly === true) {
                setShowYearlyPlan(false);
            }
        }
    }

    //handle select plan
    const handleTogglePlanClick = (item, index) => {
        console.log("Selected plan index is", index, item);
        setSelectedPlanIndex(index);
        setTogglePlan(item.id);
        // setSelectedPlan((prevId) => (prevId === item ? null : item));
        setSelectedPlan(item);
    };

    //claim early access
    const handleClaimEarlyAccess = (item, index) => {
        console.log("handleClaimEarlyAccess called with:", { item, index });

        if (!item) {
            console.error("Item is undefined in handleClaimEarlyAccess");
            return;
        }

        setSelectedPlanIndex(index);
        setTogglePlan(item.id);
        // setSelectedPlan((prevId) => (prevId === item ? null : item));
        setSelectedPlan(item);
        if (selectedDuration.id === 3) {
            handleSubscribePlan(item);
            return;
        }
        if (isContinueMonthly === false) {
            checkCanSelectYearly();
        } else if (isContinueMonthly === true) {
            handleSubscribePlan(item)
        }
    }

    //close add card popup
    const handleClose = async (data) => {
        console.log("Card added details are here", data);
        if (data) {
            const userProfile = await getProfileDetails();
            // Clear failure state when card is successfully added
            setSubscriptionPaymentFailed(false);
            setFailedPlanId(null);
        }
        setAddPaymentPopUp(false);
        // Retry subscription after card is added
        handleSubscribePlan()
    };

    //show the selected plans list
    const getCurrentPlans = () => {
        if (selectedDuration.id === 1) return monthlyPlans;
        if (selectedDuration.id === 2) return quaterlyPlans;
        if (selectedDuration.id === 3) return yearlyPlans;
        return [];
    };


    const getPlans = async () => {
        setLoading(true)
        try {
            console.log('trying to get plans')
            let localData = localStorage.getItem(PersistanceKeys.LocalStorageUser);
            if (localData) {
                let u = JSON.parse(localData);

                const response = await axios.get(Apis.getPlansForAgency, {
                    headers: {
                        Authorization: `Bearer ${u.token}`,
                    }
                })

                if (response.data) {
                    setLoading(false)
                    if (response.data.status === true) {
                        console.log('plans list is: ', response.data.data);
                        let plansList = response.data.data?.map((plan) => {
                            const normalizedTitle = plan?.title?.toLowerCase?.() || "";
                            const features = Array.isArray(plan?.features) ? [...plan.features] : [];

                            const ensureFeature = (label) => {
                                if (!features.some((feature) => feature?.text?.toLowerCase?.() === label.toLowerCase())) {
                                    features.push({ text: label });
                                }
                            };
                            // TODO: Replace this when the language features are added to the API response
                            if (normalizedTitle === "growth") {
                                ensureFeature("Multilingual Compatible");
                            }

                            if (normalizedTitle === "starter") {
                                ensureFeature("English or Spanish Compatible");
                            }

                            return {
                                ...plan,
                                features,
                            };
                        }) || [];
                        const monthly = [];
                        const quarterly = [];
                        const yearly = [];
                        localStorage.setItem("agencyPlansList", JSON.stringify(plansList));

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

                        setMonthlyPlans(monthly);
                        setQuaterlyPlans(quarterly);
                        setYearlyPlans(yearly);

                        selectDefaultPlan(monthly)

                    } else {
                        console.log('Error in getting plans: ', response.data.message);
                    }
                }
            }
        } catch (error) {
            setLoading(false)
            console.log("Error in getPlans: ", error);
        }
    }

    //code to subscribeplan handleSubscribePlan
    //subscribe plan
    const handleSubscribePlan = async (planId = null) => {
        // Determine the actual plan ID to use
        const actualPlanId = planId?.id || planId || togglePlan;

        // Check if there was a previous payment failure for this plan
        if (subscriptionPaymentFailed && failedPlanId === actualPlanId) {
            console.log('🧪 Previous payment failure detected for this plan - showing add card modal immediately');
            setAddPaymentPopUp(true);
            return;
        }

        // setAddPaymentPopUp(true);
// return
        console.log('trying to subscribe')
        // code for show plan add card popup
        const D = localStorage.getItem("User");
        let isPaymentMethodAdded = false
        if (D) {
            const userData = JSON.parse(D);
            console.log("userData", userData);
            if (userData.user.cards.length > 0) {
                console.log("Cards are available");
                isPaymentMethodAdded = true
            } else {
                setAddPaymentPopUp(true);
                // return
            }
        }



        if (isPaymentMethodAdded) {
            try {
                setSubPlanLoader(actualPlanId);
                const Token = AuthToken();
                const ApiPath = Apis.subAgencyAndSubAccountPlans;
                const formData = new FormData();
                formData.append("planId", actualPlanId);
                for (let [key, value] of formData.entries()) {
                    console.log(`${key} = ${value}`);
                }

                const response = await axios.post(ApiPath, formData, {
                    headers: {
                        "Authorization": "Bearer " + Token
                    }
                });

                if (response) {
                    console.log("Response of subscribe subaccount plan is", response.data);
                    setSubPlanLoader(null);
                    if (response.data.status === true) {
                        // Clear failure state on successful subscription
                        setSubscriptionPaymentFailed(false);
                        setFailedPlanId(null);
                        
                        setErrorMsg(response.data.message);
                        setSnackMsgType(SnackbarTypes.Success);
                        localStorage.removeItem("subPlan");
                        // router.push("/agency/dashboard");
                        if (isFrom === "addPlan") {
                            console.log("call handleCloseModal");
                            handleCloseModal(response.data.message);
                        } else if(isFrom === "page") {
                            console.log("call router.push to dashboard");
                            setIsRedirecting(true);
                            router.push("/agency/dashboard");
                        } else {
                            console.log("call router.push to verify");
                            setIsRedirecting(true);
                            router.push("/agency/verify");
                        }

                    } else if (response.data.status === false) {
                        // Check if this is a subscription payment failure (not renewal)
                        const isSubscriptionFailure = response.data.cardFailed === true && 
                                                       response.data.isSubscription === true;
                        
                        if (isSubscriptionFailure) {
                            console.log('💳 Subscription payment failure detected - will show add card modal on retry');
                            setSubscriptionPaymentFailed(true);
                            setFailedPlanId(actualPlanId);
                            setErrorMsg(response.data.message || 'Card payment failed. Please add a new payment method and try again.');
                            setSnackMsgType(SnackbarTypes.Error);
                            // Show add card modal immediately
                            setAddPaymentPopUp(true);
                        } else {
                            // Regular error (not a subscription payment failure)
                            setErrorMsg(response.data.message);
                            setSnackMsgType(SnackbarTypes.Error);
                            if (response.data.message === "No payment method added") {
                                setAddPaymentPopUp(true);
                            }
                        }
                    }
                }

            } catch (error) {
                console.error("Error occured in sub plan api is", error);
                setSubPlanLoader(null);
            }
        }
    }


    const getArray = (index) => {
        let array1 = [
            "Unlimited Minutes",
            "Unlimited Agents",
            "Unlimited Teams",
            "LLMs (AssignX, OpenAI, Llama, Gemini) ",
            "7000+ Integrations",
            "Mins roll over for 6 months",
            "Custom Monthly Plans",
        ]

        let array2 = [
            "Agents",
            "Unlimited Agents",
            "Unlimited Teams",
            "1000+ Integrations",
            "Mins roll over for 6 months",
        ]


        if (index === 0) {
            return array1
        } else {
            return array2
        }
    }


    return (
        <div
            // style={backgroundImage}
            className={`flex flex-col items-center ${isFrom === "addPlan" || isFrom === "page" ? "w-[100%] px-6 max-h-[100%]" : "w-[90%] h-[90%]"}`}
        >

            <div
                className="flex flex-col items-center w-full "
                style={{
                    // overflow: "hidden", // Prevent scrolling on the entire modal
                    // scrollbarWidth: "none",
                    // msOverflowStyle: "none",scrollbar-hide
                }}
            >
                <AgentSelectSnackMessage
                    isVisible={errorMsg !== null}
                    message={errorMsg}
                    hide={() => { setErrorMsg(null) }}
                    type={snackMsgType}
                />

                {
                    !hideProgressBar && (
                        <div className="flex w-full flex-row items-center gap-2 mt-[5vh]"
                            style={{ backgroundColor: '' }}>
                            <Image src={"/assets/assignX.png"} height={30} width={130} alt="*" style={{ backgroundColor: '' }} />

                            <div className={`w-[100%]`}>
                                <ProgressBar value={100} />
                            </div>
                        </div>
                    )
                }

                <div className='flex flex-row w-full items-end justify-between'>

                    <div className='flex flex-col items-start'>
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: "600",
                                marginTop: 20,
                            }}
                        >
                            {/*`AI Agents from just $1.50/day`*/}
                            Get an AI AaaS Agency
                        </div>

                        <div className="flex flex-row items-center gap-1">
                            <span style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: '#808080'
                            }}>{`Gets more done than coffee. Cheaper too.`}</span>
                            <span>😉</span>
                        </div>
                    </div>

                    <div>
                        <div className='flex flex-row items-center justify-end gap-2 px-2 me-[7px]'>
                            {
                                durationSaving.map((item) => {
                                    return (
                                        <button
                                            key={item.id}
                                            className={`px-2 py-1 ${selectedDuration.id === item.id ? "text-white bg-purple outline-none border-none" : "text-[#8A8A8A]"} rounded-tl-lg rounded-tr-lg`}
                                            style={{ fontWeight: "600", fontSize: "13px" }}
                                        // onClick={() => {
                                        //     setSelectedDuration(item);
                                        //     getCurrentPlans();
                                        // }}
                                        >
                                            {item.title}
                                        </button>
                                    )
                                })
                            }
                        </div>
                        <div className='flex flex-row items-center gap-2 bg-[#F6F6F6] px-2 py-1 rounded-full border border-[#E8E8E8]'>
                            {
                                duration?.map((item) => (
                                    <button key={item.id}
                                        className={`px-4 py-1 ${selectedDuration.id === item.id ? "text-white bg-purple outline-none border-none shadow-md shadow-purple rounded-full" : "text-black"}`}
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
                    </div>
                    <SelectYearlypopup
                        showYearlyPlan={showYearlyPlan}
                        duration={selectedDuration?.title}
                        continueMonthly={continueMonthly}
                        continueYearlyPlan={() => {
                            continueYearlyPlan();
                        }}
                        handleClose={() => {
                            setSelectedPlanIndex(null);
                            setTogglePlan(null);
                            setSelectedPlan(null);
                            setShowYearlyPlan(false);
                        }}
                    />
                </div>

                <div className='flex flex-row items-start gap-6 h-auto w-full'
                // style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
                >
                    <div
                        className='w-full flex flex-row items-start justify-center gap-3 mt-10 mb-12 h-[100%]'
                        style={{
                            overflowX: "auto",
                            overflowY: "hidden",
                            // display: "flex",
                            scrollbarWidth: "none",
                            WebkitOverflowScrolling: "touch",
                            // marginTop: 20,
                            // flexShrink: 0,
                            // alignItems: "stretch", // This makes all cards the same height
                        }}
                    >
                        {
                            loading ? (
                                <div className='mt-9'>
                                    <CircularProgress size={35} />
                                </div>
                            ) : (
                                getCurrentPlans().length > 0 && getCurrentPlans()?.map((item, index) => {
                                    const isCurrentPlan = isPlanCurrent(item);
                                    return item ? (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (disAblePlans || isCurrentPlan) { return };
                                            handleTogglePlanClick(item, index);
                                            const currentItem = item;
                                            const currentIndex = index;
                                            if (currentItem && currentItem.id) {
                                                handleClaimEarlyAccess(currentItem, currentIndex);
                                            } else {
                                                console.error("Item or item.id is undefined:", currentItem);
                                            }
                                        }}
                                        disabled={disAblePlans || isCurrentPlan}
                                        onMouseEnter={() => {
                                            if (!isCurrentPlan) {
                                                console.log("Hover entered on plan", item.tag);
                                                setHoverPlan(item)
                                            }
                                        }}
                                        onMouseLeave={() => { setHoverPlan(null) }}
                                        className={`w-[370px] rounded-2xl p-2 ${isCurrentPlan ? "border py-2 opacity-60 cursor-not-allowed" : selectedPlan?.id === item.id ? "bg-gradient-to-t from-purple to-[#C73BFF] p-2 hover:bg-gradient-to-t hover:from-purple hover:to-[#C73BFF]" : "border py-2 hover:bg-gradient-to-t hover:from-purple hover:to-[#C73BFF]"}`}
                                        style={{ overflow: 'hidden', scrollbarWidth: 'none' }}
                                    >
                                        <div className='flex flex-col items-center h-auto w-full'>
                                            <div className='pb-2'>
                                                {
                                                    item.tag ? (
                                                        <div className=' flex flex-row items-center gap-2'>
                                                            <Image
                                                                src={(selectedPlan?.id === item.id || hoverPlan?.id === item.id) && !isCurrentPlan ? "/svgIcons/powerWhite.svg" :
                                                                    "/svgIcons/power.svg"
                                                                }
                                                                height={24} width={24} alt='*'
                                                            />

                                                            <div
                                                                style={{
                                                                    fontSize: 16, fontWeight: '700', color: (selectedPlan?.id === item.id || hoverPlan?.id === item.id) && !isCurrentPlan ? "white" : '#7902df'
                                                                }}>
                                                                {item.tag}
                                                            </div>
                                                            <Image
                                                                src={(selectedPlan?.id === item.id || hoverPlan?.id === item.id) && !isCurrentPlan ? "/svgIcons/enterArrowWhite.svg" :
                                                                    "/svgIcons/enterArrow.svg"
                                                                }
                                                                height={20} width={20} alt='*'
                                                            />

                                                        </div>
                                                    ) : (
                                                        <div className='h-[4vh]'></div>
                                                    )
                                                }
                                            </div>
                                            <div className="bg-white w-full rounded-2xl p-6 flex flex-col items-start gap-2">
                                                <div className='flex flex-col item-center justify-between w-full'>
                                                    <div>
                                                        {/* Top section */}
                                                        <div className='text-center' style={{ fontSize: 29, fontWeight: '700' }}>
                                                            {item.title}
                                                        </div>

                                                        {/* Pricing */}
                                                        <div className='text-center mt-4 text-transparent bg-clip-text bg-gradient-to-r from-[#7902DF] to-[#DF02BA]' style={{ fontSize: 34, fontWeight: '600' }}>
                                                            ${formatDecimalValue(item.originalPrice)}
                                                            {/*selectedDuration.title === "Monthly"
                                                                ? formatDecimalValue(item.originalPrice)
                                                                : selectedDuration.title === "Quarterly"
                                                                    ? formatDecimalValue(item.originalPrice)
                                                                    : selectedDuration.title === "Yearly"
                                                                        ? formatDecimalValue(item.originalPrice)
                                                                        : "-"*/}
                                                        </div>

                                                        <div className={`text-center mt-1 ${disAblePlans && "w-full border-b border-[#00000040] pb-2"}`} style={{ fontSize: 15, fontWeight: '400' }}>
                                                            {selectedDuration.title === "Monthly"
                                                                ? "Billed Monthly"
                                                                : selectedDuration.title === "Quarterly"
                                                                    ? "Billed Quarterly"
                                                                    : selectedDuration.title === "Yearly"
                                                                        ? "Billed Annually"
                                                                        : "-"}
                                                        </div>
                                                        {/*
                                                            <div className='text-center mt-1' style={{ fontSize: 17, fontWeight: '600' }}>
                                                                {item.capabilities?.affiliatePercent}% Rev Share
                                                            </div>
    
                                                            <div className='text-center ' style={{ fontSize: 15, fontWeight: '500' }}>
                                                                ${item?.capabilities?.aiCreditRate?.toFixed(2)} per min
                                                            </div>
                                                        */}

                                                        {
                                                            !disAblePlans && (
                                                                <div className="mt-3">
                                                                    {subPlanLoader === item.id ? (
                                                                        <div>
                                                                            <CircularProgress size={30} />
                                                                        </div>
                                                                    ) : (

                                                                        <button
                                                                            disabled={isCurrentPlan}
                                                                            className={`w-[95%] px-5 flex flex-row items-center justify-center py-3 mt-3 rounded-lg flex items-center ${
                                                                                isCurrentPlan 
                                                                                    ? "bg-gray-400 text-white cursor-not-allowed" 
                                                                                    : "bg-purple text-white"
                                                                            }`}
                                                                            style={{
                                                                                fontSize: 16.8,
                                                                                fontWeight: "600",
                                                                                alignSelf: 'center'
                                                                            }}
                                                                            onClick={(e) => {
                                                                                if (isCurrentPlan) return;
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                const currentItem = item;
                                                                                const currentIndex = index;
                                                                                console.log("selected duration is", selectedDuration);
                                                                                console.log("currentItem:", currentItem, "currentIndex:", currentIndex);
                                                                                if (currentItem && currentItem.id) {
                                                                                    handleClaimEarlyAccess(currentItem, currentIndex);
                                                                                } else {
                                                                                    console.error("Item or item.id is undefined:", currentItem);
                                                                                }
                                                                            }}>
                                                                            {isCurrentPlan ? "Current Plan" : selectedPlan?.id === item.id ? "Continue" : "Get Started"}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )
                                                        }

                                                        <div className='flex flex-col gap-2 mt-3'>
                                                            {
                                                                item?.title?.toLowerCase() === "growth" ? (
                                                                    <div className='flex flex-row items-center gap-2' style={styles.regularFont}>
                                                                        Everything in Starter, and
                                                                    </div>
                                                                ) :
                                                                    item?.title?.toLowerCase() === "scale" ? (
                                                                        <div className='flex flex-row items-center gap-2' style={styles.regularFont}>
                                                                            Everything in Growth, and
                                                                        </div>
                                                                    ) : ""
                                                            }
                                                            {/* Features */}
                                                            {
                                                                // planFeaturesAvailable[selectedDuration.id][index]?.map((label, labelIndex) => (
                                                                item?.features?.map((item) => (
                                                                    <div key={item.text} className="flex flex-row items-center gap-2 mt-1">
                                                                        <Image
                                                                            src="/otherAssets/selectedTickBtn.png" //"/svgIcons/greenTick.svg"
                                                                            height={16} width={16} alt="✓"
                                                                        />
                                                                        <div
                                                                            className='flex flex-row items-center gap-2'
                                                                            style={{
                                                                                whiteSpace: 'nowrap',
                                                                                width: '100%',
                                                                                borderWidth: 0,
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                            }}
                                                                        >
                                                                            <div
                                                                                // style={{
                                                                                //     fontSize: 13,
                                                                                //     fontWeight: '500',
                                                                                //     textAlign: 'left',
                                                                                //     borderWidth: 0,
                                                                                // }}
                                                                                style={{
                                                                                    ...styles.regularFont, textAlign: 'left',
                                                                                    borderWidth: 0,
                                                                                }}>
                                                                                {item.text}
                                                                            </div>
                                                                            {
                                                                                item?.subtext && (
                                                                                    <div
                                                                                        // style={{
                                                                                        //     fontSize: 13,
                                                                                        //     fontWeight: '500',
                                                                                        //     textAlign: 'left',
                                                                                        //     color: "#00000050"
                                                                                        // }}
                                                                                        style={{
                                                                                            ...styles.regularFont, textAlign: 'left',
                                                                                            borderWidth: 0, color: "#00000050"
                                                                                        }}>
                                                                                        {
                                                                                            item?.subtext?.toLowerCase() === "upsell" ? (
                                                                                                "(Upsell)"
                                                                                            ) : item?.subtext?.toLowerCase() === "coming soon" ? (
                                                                                                "(coming soon)"
                                                                                            ) : (
                                                                                                <Tooltip
                                                                                                    title={item.subtext}
                                                                                                    placement="top"
                                                                                                    arrow
                                                                                                    componentsProps={{
                                                                                                        tooltip: {
                                                                                                            sx: {
                                                                                                                backgroundColor: "#ffffff", // Ensure white background
                                                                                                                color: "#333", // Dark text color
                                                                                                                fontSize: "14px",
                                                                                                                padding: "10px 15px",
                                                                                                                borderRadius: "8px",
                                                                                                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                                                                                                            },
                                                                                                        },
                                                                                                        arrow: {
                                                                                                            sx: {
                                                                                                                color: "#ffffff", // Match tooltip background
                                                                                                            },
                                                                                                        },
                                                                                                    }}
                                                                                                >
                                                                                                    <Image
                                                                                                        src="/otherAssets/infoLightDark.png"
                                                                                                        alt="info"
                                                                                                        width={12}
                                                                                                        height={12}
                                                                                                        className="cursor-pointer rounded-full"
                                                                                                    />
                                                                                                </Tooltip>
                                                                                            )
                                                                                        }
                                                                                    </div>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }


                                                            {/*
                                                                planFeaturesUnavailable[selectedDuration.id][index]?.map((label, labelIndex) => (
                                                                    <div key={labelIndex} className="flex flex-row items-center gap-2 mt-1">
                                                                        <Image src="/svgIcons/redCross.svg" height={16} width={16} alt="✗" />
                                                                        <div
                                                                            className='flex flex-row items-center gap-2'
                                                                            style={{
                                                                                whiteSpace: 'nowrap',
                                                                                width: '100%',
                                                                                borderWidth: 0,
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                            }}
                                                                        >
                                                                            <div style={{
                                                                                fontSize: 13,
                                                                                fontWeight: '500',
                                                                                textAlign: 'left',
                                                                                borderWidth: 0,
                                                                            }}>
                                                                                {label.main}
                                                                            </div>
                                                                            <div style={{
                                                                                fontSize: 13,
                                                                                fontWeight: '500',
                                                                                textAlign: 'left',
                                                                                color: "#00000050"
                                                                            }}>
                                                                                {label.sub}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))*/}

                                                        </div>
                                                    </div>


                                                </div>


                                            </div>
                                        </div>
                                    </button>
                                    ) : null;
                                })
                            )
                        }

                    </div>


                    {/*
                        <div className='w-3/12 flex flex-col items-start gap-3 mt-10 p-6 rounded-2xl border h-auto'>
    
                            <div style={{ fontSize: 24, fontWeight: '700' }}>
                                Whitelabel
                            </div>
    
                            <div style={{ fontSize: 20, fontWeight: '700' }}>
                                Contact our team
                            </div>
    
                            <div
                                style={{
                                    height: '358px',
                                    width: '100%',
                                    backgroundImage: "url('/svgIcons/contactTeamBg.svg')",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    borderRadius: 20,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 30,
                                    marginTop: 40
                                }}
                            >
                                <div style={{ fontSize: 35, fontWeight: '700', color: 'white', marginTop: 40 }}>
                                    Run your agency SaaS
                                </div>
    
                                <button
                                    className='w-full pv-2 bg-white rounded-lg h-[55px] items-center mt-[50px] text-purple items-center
    
                                    '
                                    style={{
                                        alignSelf: 'center'
                                    }}
                                >
                                    Contact Our Team
                                </button>
    
                            </div>
    
    
                        </div>
                    */}


                </div>

                {/* Code for add payment modal */}
                <Modal
                    open={addPaymentPopUp}
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
                            <div
                                className="w-full border-white"
                                style={{
                                    backgroundColor: "#ffffff",
                                    padding: 0,
                                    borderRadius: "13px",
                                }}
                            >
                                <div className="flex flex-row justify-end w-full items-center pe-4 pt-4">
                                    <CloseBtn
                                        onClick={() => {
                                            setAddPaymentPopUp(false);
                                            setIsContinueMonthly(false);
                                            // Clear failure state when user manually closes modal
                                            setSubscriptionPaymentFailed(false);
                                            setFailedPlanId(null);
                                        }}
                                    />
                                </div>
                                <Elements stripe={stripePromise}>
                                    <AgencyAddCard
                                        handleClose={handleClose}
                                        selectedPlan={selectedPlan}
                                    // togglePlan={togglePlan}
                                    />
                                </Elements>
                            </div>
                        </div>
                    </Box>
                </Modal>

                {/* Redirecting Loader Overlay */}
                {isRedirecting && (
                   
                    <LoaderAnimation isOpen={isRedirecting} title="Redirecting to dashboard..." />
                )}

                {/* 
                <div className="w-full mt-2 flex flex-row items-center justify-center">
                    <button
                        onClick={() => {
                            localStorage.clear();
                            if (typeof document !== "undefined") {
                                document.cookie =
                                    "User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                            }
                            router.push("/");
                        }}
                        className="text-red bg-[#FF4E4E40] font-[600] text-lg px-4 py-1 rounded-full"
                    >
                        Log out
                    </button>
                </div> */}
            </div>
        </div >
    )
}

export default AgencyPlans



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
        height: "60svh",
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
        color: "#000000",
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: "10px",
        whiteSpace: "nowrap",
    },
    regularFont: {
        fontSize: 16,
        fontWeight: '400'
    }
};
