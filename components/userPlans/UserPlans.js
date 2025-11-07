import React, { useEffect, useState } from 'react'
import ProgressBar from "@/components/onboarding/ProgressBar";
import Image from 'next/image';
import { getUserPlans } from './UserPlanServices';
import { Modal, Box, Tooltip, CircularProgress } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import AgencyAddCard from '../createagent/addpayment/AgencyAddCard';
import { loadStripe } from '@stripe/stripe-js';
import UserAddCard from './UserAddCardModal';
import UpgradePlan from './UpgradePlan';
import YearlyPlanModal from './YearlyPlanModal';
import Apis from '../apis/Apis';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import getProfileDetails from '../apis/GetProfile';
import { useUser } from '@/hooks/redux-hooks';
import { formatDecimalValue } from '../agency/agencyServices/CheckAgencyData';
import { formatFractional2 } from '../agency/plan/AgencyUtilities';
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage';
import { isSubaccountTeamMember, isTeamMember } from '@/constants/teamTypes/TeamTypes';
import FitText from './FitText';
import FeatureLine from './FeatureLine';
import LoaderAnimation from '../animations/LoaderAnimation';


function UserPlans({
    handleContinue,
    handleBack,
    from = "",
    isFrom,
    subPlanLoader,
    onPlanSelected,
    selectedUser,
    disAblePlans = false,
    hideProgressBar = false
}) {

    const router = useRouter();


    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);

    const { user: reduxUser, setUser: setReduxUser } = useUser();



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

    const [selectedPlan, setSelectedPlan] = useState(null)
    const [hoverPlan, setHoverPlan] = useState(null);
    const [togglePlan, setTogglePlan] = useState(null);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(null)
    const [addPaymentPopUp, setAddPaymentPopUp] = useState(false)

    const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false)
    const [showYearlyPlanModal, setShowYearlyPlanModal] = useState(false)
    const [selectedMonthlyPlan, setSelectedMonthlyPlan] = useState(null)
    const [subscribeLoader, setSubscribeLoader] = useState(null)

    const [credentialsErr, setCredentialsErr] = useState(false)
    const [addCardFailure, setAddCardFailure] = useState(false)
    const [addCardSuccess, setAddCardSuccess] = useState(false)
    const [addCardErrtxt, setAddCardErrtxt] = useState("")
    const [routedFrom, setRoutedFrom] = useState(isFrom)

    const [showRoutingLoader, setShowRoutingLoader] = useState(false);



    useEffect(() => {
        console.log("reduxUser", reduxUser)
        // Only auto-continue if user has a plan AND we're not in modal view (billing-modal)
        if (reduxUser?.plan && reduxUser?.availableSeconds > 120 && from !== "billing-modal") {
            if (handleContinue) {
                handleContinue()
            }
        }
        if (!isFrom) {

            let data = localStorage.getItem("User")
            if (data) {
                let user = JSON.parse(data)
                console.log("user.user.userRole", user.user.userRole)
                if (isTeamMember(user.user)) {
                    if (isSubaccountTeamMember(user.user)) {
                        isFrom = "SubAccount"
                    }
                }
                else if (user.user.userRole === "AgencySubAccount") {
                    isFrom = "SubAccount"
                } else if (user.user.userRole === "Agency") {
                    isFrom = "Agency"
                } else {
                    isFrom = "User"
                }
            }

        }
        setRoutedFrom(isFrom)
        getPlans()
    }, [])

    const handleClose = async (data) => {
        console.log("Card added details are here", data);
        if (data) {
            // const userProfile = await getProfileDetails();
            if (isFrom == "Agency" || routedFrom == "Agency") {
                router.push("/agency/dashboard")
                //show routing loader animation
                setShowRoutingLoader(true);
                setTimeout(() => {
                    setShowRoutingLoader(false);
                }, 3000);
            } else {
                if (handleContinue) {
                    handleContinue()
                }
            }
            setAddPaymentPopUp(false);
            // handleSubscribePlan()
        }
    };

    // Function to refresh user data after plan upgrade
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


            setSubscribeLoader(selectedPlan?.id);
            console.log("subscribeLoader", subscribeLoader)
            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                AuthToken = LocalDetails.token;
            }

            // //console.log;

            let ApiData = {
                plan: selectedPlan?.id,
            };

            if (isFrom === "SubAccount") {
                ApiData = {
                    planId: "id"
                }
            }

            // //console.log;

            let ApiPath = Apis.subscribePlan;
            if (isFrom === "SubAccount") {
                ApiPath = Apis.subAgencyAndSubAccountPlans;
            }
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
                if (response.data.status === true) {
                    await refreshUserData();
                    if (from === "dashboard") {
                        router.push("/dashboard")
                        console.log('route to dashboard')
                    } else {
                        console.log('handle continue ')

                        if (handleContinue) {
                            handleContinue()
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error occured in api is:", error);
        } finally {
            setSubscribeLoader(null);
        }
    };


    const getPlans = async () => {
        let plansList = await getUserPlans(isFrom, selectedUser);
        console.log("Plans list found is", plansList)
        if (plansList) {
            console.log("isFrom is", isFrom)
            // Filter features in each plan to only show features where thumb = false
            let filteredPlans = [];

            if (isFrom !== "SubAccount") {
                filteredPlans = plansList?.map(plan => ({
                    ...plan,
                    features: plan.features ? plan.features.filter(feature => !feature.thumb) : []
                }));
            }
            if (isFrom === "Agency") {
                filteredPlans = plansList?.map(plan => ({
                    ...plan,
                    features: plan.features ? plan.features.filter(feature => feature.thumb === true) : []
                }));
            }
            console.log("Filtered plans are", filteredPlans)
            const monthly = [];
            const quarterly = [];
            const yearly = [];
            let freePlan = null;
            console.log("Status f is from is", isFrom)
            if (isFrom == "SubAccount") {
                console.log("My condition should run 😲")
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
                console.log("else condition is running", filteredPlans)
                filteredPlans.forEach(plan => {
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
            }

            if (freePlan) {
                quarterly.unshift({ ...freePlan, billingCycle: "quarterly" });
                yearly.unshift({ ...freePlan, billingCycle: "yearly" });
            }

            //select duration selection dynamically
            console.log("Isfrom is", isFrom);
            if (isFrom === "SubAccount") {
                if (monthly.length > 0 && quarterly.length === 0 && yearly.length === 0) {
                    setSelectedDuration({ id: 1, title: "Monthly" });
                } else {
                    if (monthly.length > 0) {
                        console.log("Should select the 0 index")
                        setSelectedDuration({ id: 1, title: "Monthly" });
                    }
                    // Check inside quarterly plans
                    else if (quarterly.length > 0) {
                        console.log("Should select the 2 index")
                        setSelectedDuration({ id: 2, title: "Quarterly" });
                    }
                    // Check inside yearly plans
                    else if (yearly.length > 0) {
                        console.log("Should select the 3 index")
                        setSelectedDuration({ id: 3, title: "Yearly" });
                    }
                }
            }

            const emptyDurations = [monthly, quarterly, yearly].filter(arr => arr.length === 0).length;
            console.log("Empty durations are", emptyDurations);
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

    const handleContinueYearly = async () => {
        // Switch to yearly billing and find matching plan
        setSelectedDuration(duration[2]); // Switch to yearly

        // Find the matching plan in yearly billing
        if (selectedMonthlyPlan && yearlyPlans.length > 0) {
            const matchingYearlyPlan = yearlyPlans.find(plan =>
                plan.name === selectedMonthlyPlan.name ||
                plan.planType === selectedMonthlyPlan.planType
            );

            if (matchingYearlyPlan) {
                const planIndex = yearlyPlans.findIndex(plan => plan.id === matchingYearlyPlan.id);
                setSelectedPlan(matchingYearlyPlan);
                setSelectedPlanIndex(planIndex);
                setTogglePlan(matchingYearlyPlan.id);
            }
        }

        setShowYearlyPlanModal(false);

        // Check if the yearly plan is free before showing payment popup
        if (selectedPlan && !selectedPlan.discountPrice) {
            // Free yearly plan - subscribe directly
            await handleSubscribePlan();
        } else {
            // Paid yearly plan - show payment popup
            setAddPaymentPopUp(true);
        }
    };

    const handleContinueMonthly = async () => {
        // Proceed with monthly plan

        if (!selectedMonthlyPlan.discountPrice) {
            await handleSubscribePlan()
        } else {
            setAddPaymentPopUp(true);
        }

        setShowYearlyPlanModal(false);
    };


    return (
        <div className={`flex flex-col items-center w-full bg-white ${from === 'billing-modal' ? 'h-full' : 'h-[100vh]'}`}>
            <LoaderAnimation isOpen={showRoutingLoader} title="Redirecting to dashboard..." />
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
            <div className={`flex flex-col items-center ${from === 'billing-modal' ? "w-full px-6" : "w-[90%]"} h-full overflow-y-auto`}
                style={{
                    scrollbarWidth: 'none'
                }}
            >
                {
                    !hideProgressBar && (
                        <div className="flex w-full flex-row items-center gap-2 mt-[5vh]"
                            style={{ backgroundColor: '' }}>
                            <Image src={"/assets/assignX.png"} height={30} width={130} alt="*" style={{ backgroundColor: '' }} />

                            <div className={`w-[${from === "billing-modal" ? "80%" : "100%"}]`}>
                                <ProgressBar value={100} />
                            </div>
                        </div>
                    )
                }

                <div className={`flex flex-col md:flex-row items-start md:items-end justify-between w-full gap-4 md:gap-0 ${hideProgressBar ? "mt-6" : "mt-10"}`}>


                    <div className='flex flex-col items-start w-full'>
                        <div //className='text-4xl font-semibold'
                            // onClick={getPlans}
                            style={{
                                fontSize: 22,
                                fontWeight: "600",
                                // marginTop: 20,
                            }}
                        >
                            {`Grow Your Business`}
                        </div>
                        <div className="flex flex-row items-center gap-1 mt-1">
                            <span style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: '#808080'
                            }}>{`Gets more done than coffee. Cheaper too. ${isFrom != "Agency" ? "Cancel anytime." : ""}`}<span>😉</span></span>

                        </div>
                    </div>
                    <div className='flex flex-col items-end w-full'>
                        {
                            isFrom !== "SubAccount" && (
                                <div className='flex flex-row items-center justify-end gap-2 px-2 me-[33px] md:me-[7px]  w-auto'>
                                    {
                                        duration?.map((item) => (
                                            item.save && (
                                                <div
                                                    key={item.id}
                                                    // className={`text-xs font-semibold ${selectedDuration?.id === item.id ? "text-purple" : "text-neutral-400 "}`}
                                                    className={`px-2 py-1 ${selectedDuration?.id === item.id ? "text-white bg-purple shadow-sm shadow-purple" : "text-black"} rounded-tl-lg rounded-tr-lg`}
                                                    style={{ fontWeight: "600", fontSize: "13px" }}
                                                >
                                                    Save {item.save}
                                                </div>
                                            )
                                        ))}
                                </div>
                            )
                        }
                        <div className="w-full flex md:w-auto flex-col items-center md:items-end justify-center md:justify-end">
                            {
                                (
                                    // count how many have length > 0
                                    [
                                        monthlyPlans?.length > 0,
                                        quaterlyPlans?.length > 0,
                                        yearlyPlans?.length > 0
                                    ].filter(Boolean).length >= 2
                                ) && (
                                    <div
                                        // className='flex flex-row items-center border gap-2 bg-neutral-100 px-2 py-1 rounded-full'
                                        className='border flex flex-row items-center bg-neutral-100 px-2 gap-[8px] rounded-full py-1.5 w-[80%] md:w-auto justify-center md:justify-start'
                                    >
                                        {
                                            duration?.map((item) => (
                                                <button
                                                    key={item.id}
                                                    // className={`px-6 py-[10px] ${selectedDuration?.id === item.id ? "text-white text-base font-normal bg-purple outline-none border-none shadow-md shadow-purple rounded-full" : "text-black"}`}
                                                    className={`px-4 py-1 ${selectedDuration.id === item.id ? "text-white bg-purple shadow-md shadow-purple rounded-full" : "text-black"}`}
                                                    onClick={() => {
                                                        setSelectedDuration(item);
                                                        // getCurrentPlans();
                                                    }}
                                                >
                                                    {item.title}
                                                </button>
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </div>

                    </div>
                </div>

                <div
                    className='flex flex-row gap-5 w-full h-auto mt-4 pb-8'
                    style={{
                        overflowX: "auto",
                        overflowY: "hidden",
                        display: "flex",
                        scrollbarWidth: "none",
                        WebkitOverflowScrolling: "touch",
                        // marginTop: 20,
                        flexShrink: 0,
                        alignItems: "stretch", // This makes all cards the same height
                        justifyContent: getCurrentPlans()?.length * 300 > window.innerWidth ? "start" : "center",
                    }}
                >
                    {
                        getCurrentPlans()?.length > 0 && getCurrentPlans()?.map((item, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    if (disAblePlans) {
                                        return;
                                    }
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleTogglePlanClick(item, index);
                                    console.log("item.discountPrice", item.discountPrice)
                                    console.log("isFrom in user plans", isFrom)
                                    if (isFrom == "SubAccount" || isFrom == "Agency") {
                                        setTimeout(() => {
                                            setAddPaymentPopUp(true)
                                        }, 300)
                                        return;
                                    }

                                    // If opened from billing modal, callback with selected plan
                                    if (from === 'billing-modal' && onPlanSelected) {
                                        onPlanSelected(item);
                                        return;
                                    }

                                    if (selectedDuration.id === 1 || selectedDuration.id === 2) {
                                        // Monthly plan selected - show yearly plan modal
                                        setSelectedMonthlyPlan(item);
                                        setShowYearlyPlanModal(true);
                                    } else {
                                        if (item.discountPrice > 0) {
                                            // Quarterly or Yearly plan - proceed directly
                                            setAddPaymentPopUp(true)
                                        } else {
                                            handleSubscribePlan()
                                        }
                                    }
                                }}
                                onMouseEnter={() => { setHoverPlan(item) }}
                                onMouseLeave={() => { setHoverPlan(null) }}
                                // disabled={disAblePlans}

                                className={`flex flex-col items-center rounded-lg hover:p-2 hover:bg-gradient-to-t from-purple to-[#C73BFF]
                                 ${selectedPlan?.id === item.id ? "bg-gradient-to-t from-purple to-[#C73BFF] p-2" : "border p-2"}
                                flex-shrink-0
                                 `}
                                style={{ width: from === "billing-modal" ? "280px" : "280px" }}
                            >
                                <div className='flex flex-col items-center w-full h-full'>
                                    <div className='pb-2'>
                                        {
                                            item.status ? (
                                                <div className=' flex flex-row items-center gap-2'>
                                                    <Image
                                                        src={(selectedPlan?.id === item.id || hoverPlan?.id === item.id) ? "/svgIcons/powerWhite.svg" :
                                                            "/svgIcons/power.svg"
                                                        }
                                                        height={24} width={24} alt='*'
                                                    />

                                                    <div className='text-base font-semibold'
                                                        style={{
                                                            color: (selectedPlan?.id === item.id || hoverPlan?.id === item.id) ? "white" : '#7902df'
                                                        }}>
                                                        {item.status}
                                                    </div>
                                                    <Image
                                                        src={(selectedPlan?.id === item.id || hoverPlan?.id === item.id) ? "/svgIcons/enterArrowWhite.svg" :
                                                            "/svgIcons/enterArrow.svg"
                                                        }
                                                        height={20} width={20} alt='*'
                                                    />

                                                </div>
                                            ) : (
                                                <div className='h-[3vh]'></div>
                                            )
                                        }
                                    </div>

                                    <div className='flex flex-col items-center rounded-lg gap-2 bg-white w-full h-full'>
                                        {/* Header section - fixed height */}
                                        <div className='flex flex-col items-center w-full flex-shrink-0'>
                                            <div className='text-3xl font-semibold mt-2 capitalize'>
                                                {
                                                    (item.name || item.title)
                                                }
                                            </div>

                                            <div className='flex flex-row items-center gap-2'>
                                                {
                                                    isFrom === "SubAccount" && item?.originalPrice > 0 && (
                                                        <span className='text-[#00000020] line-through'>
                                                            ${formatFractional2(item?.originalPrice) || ""}
                                                        </span>
                                                    )
                                                }
                                                <span className="text-4xl mt-4 font-semibold bg-gradient-to-l from-[#DF02BA] to-purple bg-clip-text text-transparent">
                                                    ${formatFractional2(item.discountPrice || item.discountedPrice || 0)}
                                                </span>
                                            </div>

                                            <div
                                                //  className='text-[14px] font-normal text-black/50 '
                                                className={`text-center mt-1 ${disAblePlans && "w-full border-b border-[#00000040] pb-2"}`} style={{ fontSize: 15, fontWeight: '400' }}
                                            >
                                                {item.details || item.description || item.planDescription}
                                            </div>

                                            {!disAblePlans && (
                                                subscribeLoader === item.id ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <div
                                                        className="w-[95%] py-3.5 h-[50px] mt-3 bg-purple rounded-lg text-white cursor-pointer"
                                                        disabled={disAblePlans}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleTogglePlanClick(item, index);
                                                            console.log("item.discountPrice", item.discountPrice)
                                                            console.log("isFrom in user plans", isFrom)
                                                            if (isFrom == "SubAccount" || (routedFrom == "Agency" && reduxUser?.consecutivePaymentFailures >= 3)) {
                                                                setTimeout(() => {
                                                                    setAddPaymentPopUp(true)
                                                                }, 300)
                                                                return;
                                                            }

                                                            // If opened from billing modal, callback with selected plan
                                                            if (from === 'billing-modal' && onPlanSelected) {
                                                                onPlanSelected(item);
                                                                return;
                                                            }

                                                            if (selectedDuration.id === 1 || selectedDuration.id === 2) {
                                                                // Monthly plan selected - show yearly plan modal
                                                                setSelectedMonthlyPlan(item);
                                                                setShowYearlyPlanModal(true);
                                                            } else {
                                                                if (item.discountPrice > 0) {
                                                                    // Quarterly or Yearly plan - proceed directly
                                                                    setAddPaymentPopUp(true)
                                                                } else {
                                                                    handleSubscribePlan()
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {item?.hasTrial == true ? (
                                                            <span
                                                                style={{
                                                                    fontWeight: "600",
                                                                    fontSize: 14,
                                                                    // color: "white",
                                                                }}
                                                            >
                                                                {item?.trialValidForDays} Day Free Trial
                                                            </span>
                                                        ) : (
                                                            !disAblePlans && (
                                                                <span className="text-base font-normal">
                                                                    Get Started
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )
                                            )}

                                        </div>

                                        {/* Features container - scrollable */}
                                        <div className='flex flex-col items-start w-[95%] flex-1 mt-4 min-h-0'>
                                            {/* Previous plan heading */}
                                            {
                                                isFrom === "SubAccount" || routedFrom === "Agency" ? (
                                                    ""
                                                ) : (
                                                    <div>
                                                        {index > 0 && (
                                                            <div className="w-full mb-3 flex-shrink-0">
                                                                <div className="text-sm font-semibold text-black mb-2 text-left">
                                                                    Everything in {getCurrentPlans()[index - 1]?.name}, and:
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            }

                                            <div className='flex flex-col items-start w-full flex-1 pr-2'>
                                                {
                                                    Array.isArray(item.features) && item.features?.map((feature, featureIndex) => (
                                                        <div
                                                            key={feature.text}
                                                            className="flex flex-row items-start gap-3 mb-3 w-full"
                                                        >
                                                            <Image
                                                                src="/svgIcons/selectedTickBtn.svg"
                                                                height={14}
                                                                width={14}
                                                                alt="✓"
                                                                className="mt-1 flex-shrink-0"
                                                            />

                                                            <FeatureLine
                                                                text={feature.text}
                                                                info={feature.subtext}
                                                                max={16}
                                                                min={10}
                                                                gap={6}
                                                                iconSize={16}
                                                            />

                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    }

                </div>
            </div>
            <Elements stripe={stripePromise}>
                <UpgradePlan
                    open={showUpgradePlanPopup}
                    handleClose={async (result) => {
                        setShowUpgradePlanPopup(false);
                        if (result) {
                            // console.log('🎉 [subscribe plan] Plan upgraded successfully');
                            // Refresh user data after upgrade to get new plan capabilities
                            await refreshUserData();

                            if (handleContinue) {
                                handleContinue()
                            }
                        }
                    }}
                    setSelectedPlan={() => {
                        console.log("setSelectedPlan is called")
                    }}

                />
            </Elements>

            <YearlyPlanModal
                open={showYearlyPlanModal}
                handleClose={() => setShowYearlyPlanModal(false)}
                onContinueYearly={handleContinueYearly}
                onContinueMonthly={handleContinueMonthly}
                selectedDuration={selectedDuration}
                loading={subscribeLoader}
                isFree={!selectedPlan?.discountPrice ? true : false}
            />

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
                            <div className="flex flex-row justify-end w-full items-center pe-5 pt-5">
                                <button onClick={() => {
                                    setAddPaymentPopUp(false);
                                    // setIsContinueMonthly(false);
                                }}>
                                    <Image
                                        src={"/assets/crossIcon.png"}
                                        height={40}
                                        width={40}
                                        alt="*"
                                    />
                                </button>
                            </div>
                            <Elements stripe={stripePromise}>
                                <UserAddCard
                                    handleClose={handleClose}
                                    selectedPlan={selectedPlan}
                                    isFrom={isFrom || routedFrom}
                                    setCredentialsErr={setCredentialsErr}
                                    setAddCardFailure={setAddCardFailure}
                                    setAddCardSuccess={setAddCardSuccess}
                                    setAddCardErrtxt={setAddCardErrtxt}
                                    credentialsErr={credentialsErr}
                                    addCardFailure={addCardFailure}
                                    addCardSuccess={addCardSuccess}
                                    addCardErrtxt={addCardErrtxt}
                                // togglePlan={togglePlan}
                                />
                            </Elements>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div >
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
        height: "60svh",
    },
}

export default UserPlans
