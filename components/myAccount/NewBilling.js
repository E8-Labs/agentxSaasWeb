import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Apis from "../apis/Apis";
import axios from "axios";
import {
    Alert,
    Box,
    CircularProgress,
    Fade,
    Modal,
    Snackbar,
    Switch,
    TextField,
} from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import AddCardDetails from "../createagent/addpayment/AddCardDetails";
import { loadStripe } from "@stripe/stripe-js";
import moment from "moment";
import getProfileDetails from "../apis/GetProfile";
import AgentSelectSnackMessage, {
    SnackbarTypes,
} from "../dashboard/leads/AgentSelectSnackMessage";
import { GetFormattedDateString } from "@/utilities/utility";
import { RemoveSmartRefillApi, SmartRefillApi } from "../onboarding/extras/SmartRefillapi";
import SmartRefillCard from "../agency/agencyExtras.js/SmartRefillCard";
import UpgradePlanConfirmation from "./UpgradePlanConfirmation";
import PlansService from "@/utilities/PlansService";
import { getUserPlans, initiateCancellation } from "../userPlans/UserPlanServices";
import CloseBtn from "../globalExtras/CloseBtn";
import PauseSubscription from "./cancelationFlow/PauseSubscription";
import CancelPlanAnimation from "./cancelationFlow/CancelPlanAdnimation";
import { getBusinessProfile } from "@/apiservicescomponent/twilioapis/GetBusinessProfile";

let stripePublickKey =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
        ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
        : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

function NewBilling() {

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

    //stroes user cards list
    const [cards, setCards] = useState([]);

    //userlocal data
    const [userLocalData, setUserLocalData] = useState(null);
    const [userDataLoader, setUserDataLoader] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [cancelPlanLoader, setCancelPlanLoader] = useState(false);
    const [redeemLoader, setRedeemLoader] = useState(false);

    //stoores payment history
    const [PaymentHistoryData, setPaymentHistoryData] = useState([]);
    const [historyLoader, setHistoryLoader] = useState(false);

    const [selectedCard, setSelectedCard] = useState(cards[0]);
    const [getCardLoader, setGetCardLoader] = useState(false);
    const [makeDefaultCardLoader, setMakeDefaultCardLoader] = useState(false);

    //add card variables
    const [addPaymentPopUp, setAddPaymentPopup] = useState(false);
    const [cardData, getcardData] = useState("");

    //variables for selecting plans
    const [togglePlan, setTogglePlan] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [subscribePlanLoader, setSubscribePlanLoader] = useState(false);

    //snack messages variables
    const [successSnack, setSuccessSnack] = useState(null);
    const [errorSnack, setErrorSnack] = useState(null);

    //variables for cancel plan
    const [giftPopup, setGiftPopup] = useState(false);
    const [ScreenWidth, setScreenWidth] = useState(null);
    const [showConfirmCancelPlanPopup, setShowConfirmCancelPlanPopup] = useState(false);
    const [showConfirmCancelPlanPopup2, setShowConfirmCancelPlanPopup2] = useState(false);

    //smart refill variables
    const [allowSmartRefill, setAllowSmartRefill] = useState(false);

    //confirmation popup for update plan
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    //array of plans - now loaded dynamically
    const [plans, setPlans] = useState([]);

    const [showCancelPopup, setShowCancelPoup] = useState(false)




    const [selectedDuration, setSelectedDuration] = useState(duration[0])

    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [quaterlyPlans, setQuaterlyPlans] = useState([]);
    const [yearlyPlans, setYearlyPlans] = useState([]);

    const [currentFullPlan, setCurrentFullPlan] = useState(null)
    const [toggleFullPlan, setToggleFullPlan] = useState(null)


    useEffect(() => {
        let screenWidth = 1000;
        if (typeof window !== "undefined") {
            screenWidth = window.innerWidth;
        }
        // //console.log;
        setScreenWidth(screenWidth);
        getPlans()
    }, []);


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

    // Function to determine billing cycle from current plan
    const getBillingCycleFromPlan = (plan) => {
        if (!plan) return "monthly"; // Default to monthly for free plans

        console.log('Analyzing plan for billing cycle:', plan);

        // Check if plan has billingCycle property
        if (plan.billingCycle) {
            console.log('Found billingCycle property:', plan.billingCycle);
            return plan.billingCycle;
        }

        // Check if plan has billing_cycle property (alternative naming)
        if (plan.billing_cycle) {
            console.log('Found billing_cycle property:', plan.billing_cycle);
            return plan.billing_cycle;
        }

        // Check plan type for legacy plans
        if (plan.planType) {
            console.log('Found planType:', plan.planType);
            // Map planType to billing cycle based on common patterns
            if (plan.planType.toLowerCase().includes('yearly') || plan.planType.toLowerCase().includes('year')) {
                return "yearly";
            } else if (plan.planType.toLowerCase().includes('quarterly') || plan.planType.toLowerCase().includes('quarter')) {
                return "quarterly";
            } else if (plan.planType.toLowerCase().includes('monthly') || plan.planType.toLowerCase().includes('month')) {
                return "monthly";
            }
        }

        // Check plan name for billing cycle indicators
        if (plan.name) {
            console.log('Checking plan name:', plan.name);
            if (plan.name.toLowerCase().includes('yearly') || plan.name.toLowerCase().includes('year')) {
                return "yearly";
            } else if (plan.name.toLowerCase().includes('quarterly') || plan.name.toLowerCase().includes('quarter')) {
                return "quarterly";
            } else if (plan.name.toLowerCase().includes('monthly') || plan.name.toLowerCase().includes('month')) {
                return "monthly";
            }
        }

        // Check if it's a free plan (default to monthly)
        if (plan.isFree || plan.price <= 0) {
            console.log('Detected free plan, defaulting to monthly');
            return "monthly";
        }

        console.log('No billing cycle detected, defaulting to monthly');
        // Default to monthly
        return "monthly";
    };

    // Function to find matching plan in different billing cycles
    const findMatchingPlan = (plan, plansList) => {
        if (!plan || !plansList) {
            console.log('findMatchingPlan: Missing plan or plansList');
            return null;
        }

        console.log('findMatchingPlan: Looking for plan:', plan);
        console.log('findMatchingPlan: In plans list:', plansList);

        // First try to match by name
        let matchingPlan = plansList.find(p => p.name === plan.name);
        if (matchingPlan) {
            console.log('findMatchingPlan: Found match by name:', matchingPlan);
            return matchingPlan;
        }

        // Then try to match by planType
        if (plan.planType) {
            matchingPlan = plansList.find(p => p.planType === plan.planType);
            if (matchingPlan) {
                console.log('findMatchingPlan: Found match by planType:', matchingPlan);
                return matchingPlan;
            }
        }

        // For free plans, find the free plan in the list
        if (plan.price <= 0 || plan.isFree) {
            matchingPlan = plansList.find(p => p.isFree || p.price <= 0);
            if (matchingPlan) {
                console.log('findMatchingPlan: Found match for free plan:', matchingPlan);
                return matchingPlan;
            }
        }

        // Try to match by similar characteristics (same tier but different billing)
        if (plan.name) {
            // Look for plans with similar names but different billing cycles
            matchingPlan = plansList.find(p => {
                // Check if the plan names are similar (e.g., "Starter" matches "Starter")
                const planNameWords = plan.name.toLowerCase().split(' ');
                const pNameWords = p.name.toLowerCase().split(' ');
                return planNameWords.some(word => pNameWords.includes(word));
            });
            if (matchingPlan) {
                console.log('findMatchingPlan: Found match by similar name:', matchingPlan);
                return matchingPlan;
            }
        }

        console.log('findMatchingPlan: No matching plan found');
        return null;
    };


    //cancel plan reasons
    const cancelPlanReasons = [
        {
            id: 1,
            reason: "It’s too expensive",
        },
        {
            id: 2,
            reason: "I’m using something else",
        },
        {
            id: 3,
            reason: "I’m not getting the results I expected",
        },
        {
            id: 4,
            reason: "It’s too complicated to use",
        },
        {
            id: 5,
            reason: "Others",
        },
    ];

    useEffect(() => {
        const d = localStorage.getItem("User");
        if (d) {
            const Data = JSON.parse(d);
            console.log("Smart refill is", Data.user.smartRefill);
            setAllowSmartRefill(Data.user.smartRefill);
        }
        getProfile();
        getCardsList();
    }, []);

    // Auto-select billing cycle and plan based on current user plan
    useEffect(() => {
        console.log('Auto-select useEffect triggered');
        console.log('currentFullPlan:', currentFullPlan);
        console.log('monthlyPlans length:', monthlyPlans.length);
        console.log('quaterlyPlans length:', quaterlyPlans.length);
        console.log('yearlyPlans length:', yearlyPlans.length);

        if (currentFullPlan && (monthlyPlans.length > 0 || quaterlyPlans.length > 0 || yearlyPlans.length > 0)) {
            const billingCycle = getBillingCycleFromPlan(currentFullPlan);
            console.log('Detected billing cycle from plan:', billingCycle);
            console.log('Current plan details:', currentFullPlan);

            // Set the appropriate duration based on billing cycle
            let targetDuration = duration[0]; // Default to monthly
            if (billingCycle === "quarterly") {
                targetDuration = duration[1];
                console.log('Setting quarterly duration');
            } else if (billingCycle === "yearly") {
                targetDuration = duration[2];
                console.log('Setting yearly duration');
            } else {
                console.log('Setting monthly duration (default)');
            }

            setSelectedDuration(targetDuration);

            // Find and select the matching plan in the target billing cycle
            let currentPlans = [];
            if (billingCycle === "monthly") {
                currentPlans = monthlyPlans;
            } else if (billingCycle === "quarterly") {
                currentPlans = quaterlyPlans;
            } else if (billingCycle === "yearly") {
                currentPlans = yearlyPlans;
            }

            console.log('Target plans for billing cycle:', currentPlans);
            const matchingPlan = findMatchingPlan(currentFullPlan, currentPlans);
            console.log('Found matching plan:', matchingPlan);

            if (matchingPlan) {
                console.log('Auto-selecting plan:', matchingPlan.name);
                setTogglePlan(matchingPlan.id);
                setToggleFullPlan(matchingPlan);
                setSelectedPlan(matchingPlan);
            } else {
                console.log('No matching plan found');
            }
        } else {
            console.log('Conditions not met for auto-selection');
        }
    }, [currentFullPlan, monthlyPlans, quaterlyPlans, yearlyPlans]);



    console.log('togglePlan', togglePlan)
    console.log('currentPlan', currentPlan)

    const getProfile = async () => {
        try {
            const localData = localStorage.getItem("User");
            let response = await getProfileDetails();
            //console.log;
            if (response) {
                let plan = response?.data?.data?.plan;
                let togglePlan = plan?.planId;
                setCurrentFullPlan(plan)
                setToggleFullPlan(plan)
                let planType = togglePlan;
                // if (plan.status == "active") {
                //     if (togglePlan === "Plan30") {
                //         planType = 1;
                //     } else if (togglePlan === "Plan120") {
                //         planType = 2;
                //     } else if (togglePlan === "Plan360") {
                //         planType = 3;
                //     } else if (togglePlan === "Plan720") {
                //         planType = 4;
                //     }
                // }
                setUserLocalData(response?.data?.data);
                console.log("User get profile data is", response?.data?.data);
                setTogglePlan(planType);
                setCurrentPlan(planType);
                console.log('setTogglePlan', planType)
                // console.log('plan', plan)

            }
        } catch (error) {
            // console.error("Error in getprofile api is", error);
        }
    };

    //function to close the add card popup
    const handleClose = (data) => {
        console.log("Data recieved is", data);
        if (data) {
            setAddPaymentPopup(false);
            window.dispatchEvent(
                new CustomEvent("hidePlanBar", { detail: { update: true } })
            )
            window.dispatchEvent(
                new CustomEvent("UpdateProfile", { detail: { update: true } })
            )
            getCardsList();
        }
    };

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

            // //console.log;

            //Talabat road

            const ApiPath = Apis.getCardsList;

            // //console.log;

            const response = await axios.get(ApiPath, {
                headers: {
                    Authorization: `Bearer ${AuthToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                // //console.log;
                if (response.data.status === true) {
                    setCards(response.data.data);
                }
            }
        } catch (error) {
            // //console.log;
        } finally {
            // //console.log;
            setGetCardLoader(false);
        }
    };

    //function to make default cards api
    const makeDefaultCard = async (item) => {
        setSelectedCard(item);
        // //console.log
        // return
        try {
            setMakeDefaultCardLoader(true);

            const localData = localStorage.getItem("User");

            let AuthToken = null;

            if (localData) {
                const Data = JSON.parse(localData);
                AuthToken = Data.token;
            }
            // //console.log

            const ApiPath = Apis.makeDefaultCard;

            const ApiData = {
                paymentMethodId: item.id,
            };

            // //console.log

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                // //console.log;
                if (response.data.status === true) {
                    let crds = cards.forEach((card, index) => {
                        if (card.isDefault) {
                            //console.log;
                            cards[index].isDefault = false;
                        }
                    });
                    item.isDefault = true;
                }
            }
        } catch (error) {
            // console.error("Error occured in make default card api is", error);
        } finally {
            setMakeDefaultCardLoader(false);
        }
    };

    //functions for selecting plans
    const handleTogglePlanClick = (item) => {
        setTogglePlan(item.id);
        setToggleFullPlan(item)

        setSelectedPlan((prevId) => (prevId === item ? null : item));
        // setTogglePlan(prevId => (prevId === id ? null : id));
    };

    //function to subscribe plan
    const handleSubscribePlan = async () => {
        try {
            let planType = selectedPlan.planType;

            //// //console.log;


            setSubscribePlanLoader(true);
            let AuthToken = null;
            let localDetails = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                localDetails = LocalDetails;
                AuthToken = LocalDetails.token;
                if (localDetails?.user?.cards?.length > 0) {
                    // //console.log;
                } else {
                    setErrorSnack("No payment method added");
                    return;
                }
            }

            // //console.log;

            const ApiData = {
                plan: planType,
                payNow: true,
            };

            console.log(ApiData)

            const ApiPath = Apis.subscribePlan;
            // //console.log;

            // return

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                // console.log
                if (response.data.status === true) {
                    localDetails.user.plan = response.data.data;
                    console.log("User plan sibscibe res[ponse is", response.data.data)

                    window.dispatchEvent(
                        new CustomEvent("hidePlanBar", { detail: { update: true } })
                    )
                    window.dispatchEvent(
                        new CustomEvent("UpdateProfile", { detail: { update: true } })
                    )
                    let user = userLocalData
                    user.plan = response.data.data
                    setUserLocalData(user)
                    let response2 = await getProfileDetails();
                    if (response2) {
                        let togglePlan = response2?.data?.data?.plan?.planId;
                        let planType = null;

                        setTogglePlan(togglePlan);
                        setCurrentPlan(togglePlan);
                        setToggleFullPlan(response2?.data?.data?.plan)
                        setCurrentFullPlan(response2?.data?.data?.plan)
                    }
                    // localStorage.setItem("User", JSON.stringify(localDetails));
                    setSuccessSnack("Your plan successfully updated");
                } else if (response.data.status === false) {
                    setErrorSnack(response.data.message);
                }
            }
        } catch (error) {
            // console.error("Error occured in api is:", error);
        } finally {
            setSubscribePlanLoader(false);
        }
    };


    //function to cancel current plan
    const handleCancelPlan = async () => {
        try {
            setCancelPlanLoader(true);

            let AuthToken = null;

            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                AuthToken = LocalDetails.token;
            }

            const ApiPath = Apis.cancelPlan;

            // //console.log;

            //// //console.log;
            // //console.log;

            const ApiData = {
                // patanai: "Sari dunya",
            };

            // return
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                //console.log;
                if (response.data.status === true) {
                    // //console.log;
                    // window.location.reload();
                    await getProfileDetails();
                    setShowConfirmCancelPlanPopup(false);
                    setGiftPopup(false);
                    setTogglePlan(null);
                    setCurrentPlan(null);
                    setShowConfirmCancelPlanPopup2(true);
                    let user = userLocalData
                    user.plan.status = "cancelled"
                    setUserLocalData(user)
                    //console.log
                    setSuccessSnack("Your plan was successfully cancelled");
                } else if (response.data.status === false) {
                    setErrorSnack(response.data.message);
                }
            }
        } catch (error) {
            console.error("Eror occured in cancel plan api is", error);
        } finally {
            setCancelPlanLoader(false);
        }
    };

    //function to call redeem api
    const handleRedeemPlan = async () => {
        //console.log;
        try {
            setRedeemLoader(true);

            let AuthToken = null;

            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                AuthToken = LocalDetails.token;
            }

            const ApiPath = Apis.redeemPlan;

            const ApiData = {
                sub_Type: "0", //send 1 for already redeemed plan
            };

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                // //console.log;
                let response2 = await getProfileDetails();
                // //console.log;
                if (response2) {
                    let togglePlan = response2?.data?.data?.plan?.type;
                    let planType = null;
                    if (togglePlan === "Plan30") {
                        planType = 1;
                    } else if (togglePlan === "Plan120") {
                        planType = 2;
                    } else if (togglePlan === "Plan360") {
                        planType = 3;
                    } else if (togglePlan === "Plan720") {
                        planType = 4;
                    }
                    setUserLocalData(response2?.data?.data);
                    setGiftPopup(false);
                    setTogglePlan(planType);
                    setCurrentPlan(planType);
                    if (response2.data.status === true) {
                        setSuccessSnack("You've claimed an extra 30 mins");
                    } else if (response2.data.status === false) {
                        setErrorSnack(response2.data.message);
                    }
                }
            }
        } catch (error) {
            // console.error("Error occurd in api is", error);
        } finally {
            setRedeemLoader(false);
        }
    };

    //function to get card brand image
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

    //variables
    const textFieldRef = useRef(null);
    const [selectReason, setSelectReason] = useState("");
    const [showOtherReasonInput, setShowOtherReasonInput] = useState(false);
    const [otherReasonInput, setOtherReasonInput] = useState("");

    //delreason extra variables
    const [cancelReasonLoader, setCancelReasonLoader] = useState(false);
    const [cancelInitiateLoader, setCancelInitiateLoader] = useState(false)
    //function to select the cancel plan reason
    const handleSelectReason = async (item) => {
        // //console.log;
        setSelectReason(item.reason);
        if (item.reason === "Others") {
            setShowOtherReasonInput(true);
            const timer = setTimeout(() => {
                textFieldRef.current.focus();
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setShowOtherReasonInput(false);
            setOtherReasonInput("");
        }
    };

    const handleCloseCancelation = () => {
        setShowCancelPoup(false)
        getProfile()
    }

    //del reason api
    const handleDelReason = async () => {
        if (!otherReasonInput || selectReason)
            try {
                setCancelReasonLoader(true);
                const localdata = localStorage.getItem("User");
                let AuthToken = null;
                if (localdata) {
                    const D = JSON.parse(localdata);
                    AuthToken = D.token;
                }

                const ApiData = {
                    reason: otherReasonInput || selectReason,
                };

                // //console.log;

                const ApiPath = Apis.calcelPlanReason;
                // //console.log;

                const response = await axios.post(ApiPath, ApiData, {
                    headers: {
                        Authorization: "Bearer " + AuthToken,
                        "Content-Type": "application/json",
                    },
                });

                if (response) {
                    //console.log;
                    if (response.data.status === true) {
                        setShowConfirmCancelPlanPopup2(false);
                        setSuccessSnack(response.data.message);
                    } else if (response.data.status === true) {
                        setErrorSnack(response.data.message);
                    }
                }
            } catch (error) {
                setErrorSnack(error);
                setCancelReasonLoader(false);
                console.error("Error occured in api is ", error);
            } finally {
                setCancelReasonLoader(false);
                // //console.log;
            }
    };


    //function to update profile
    const handleUpdateProfile = async () => {
        try {
            setUserDataLoader(true);
            const response = await SmartRefillApi();
            if (response) {
                setUserDataLoader(false);
                console.log("Response of update profile api is", response);
                if (response.data.status === true) {
                    setSuccessSnack(response.data.message);
                    setAllowSmartRefill(true);
                } else if (response.data.status === false) {
                    setErrorSnack(response.data.message)
                }
            }
        } catch (error) {
            console.error("Error occured in api is", error);
            setUserDataLoader(false);
        }
    }

    //function to remove smart refill
    const handleRemoveSmartRefill = async () => {
        try {
            setUserDataLoader(true);
            const response = await RemoveSmartRefillApi();
            if (response) {
                setUserDataLoader(false);
                console.log("Response of remove smart refill api is", response);
                if (response.data.status === true) {
                    setSuccessSnack(response.data.message);
                    setAllowSmartRefill(false);
                } else if (response.data.status === false) {
                    setErrorSnack(response.data.message)
                }
            }
        } catch (error) {
            console.error("Error occured in api is", error);
            setUserDataLoader(false);
        }
    }


    const handleCancelClick = async () => {
        setCancelInitiateLoader(true)
        await initiateCancellation()
        setShowCancelPoup(true)
        setCancelInitiateLoader(false)

        // if (
        //     userLocalData?.isTrial === false &&
        //     userLocalData?.cancelPlanRedemptions === 0
        // ) {
        //     // //console.log;
        //     setGiftPopup(true);
        // } // if (userLocalData?.isTrial === true && userLocalData?.cancelPlanRedemptions !== 0)
        // else {
        //     // //console.log;
        //     setShowConfirmCancelPlanPopup(true);
        // }
    }


    const renderModalView = () => {
        return (
            <PauseSubscription />
        )
    }

    const handleUpgradeClick = () => {
        if (currentPlan && !selectedPlan.discountPrice) { // if user try to downgrade on free plan
            setShowCancelPoup(true)
        } else { //if(currentFullPlan?.discountPrice < !selectedPlan.discountPrice){
            setShowConfirmationModal(true)
        }
    }

    return (
        <div
            className="w-[95%] flex flex-col items-start pl-8 py-2 h-screen overflow-hidden"
            style={{
                paddingBottom: "50px",
                scrollbarWidth: "none", // For Firefox
                WebkitOverflowScrolling: "touch",
            }}
        >
            <AgentSelectSnackMessage
                isVisible={errorSnack == null ? false : true}
                hide={() => {
                    setErrorSnack(null);
                }}
                message={errorSnack}
                type={SnackbarTypes.Error}
            />
            <AgentSelectSnackMessage
                isVisible={successSnack == null ? false : true}
                hide={() => {
                    setSuccessSnack(null);
                }}
                message={successSnack}
                type={SnackbarTypes.Success}
            />
            <div className="w-full flex flex-row items-center justify-between">
                <div className="flex flex-col">
                    <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
                        Plans & Payment
                    </div>

                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: "500",
                            color: "#00000090",
                        }}
                    >
                        {"Account > Plans & Payment"}
                    </div>
                </div>

                <button
                    className=""
                    onClick={() => {
                        setAddPaymentPopup(true);
                    }}
                >
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: "500",
                            color: "#7902DF",
                            textDecorationLine: "underline",
                        }}
                    >
                        Add New Card
                    </div>
                </button>
            </div>

            <div className="w-full">
                {getCardLoader ? (
                    <div
                        className="h-full w-full flex flex-row items-center justify-center"
                        style={{
                            marginTop: 20,
                        }}
                    >
                        <CircularProgress size={35} />
                    </div>
                ) : (
                    <div className="w-full">
                        {cards.length > 0 ? (
                            <div
                                className="w-full flex flex-row gap-4"
                                style={{
                                    overflowX: "auto",
                                    overflowY: "hidden",
                                    display: "flex",
                                    scrollbarWidth: "none",
                                    WebkitOverflowScrolling: "touch",
                                    height: "",
                                    marginTop: 20,
                                    // border:'2px solid red'
                                    scrollbarWidth: "none",
                                    overflowY: "hidden",
                                    height: "", // Ensures the height is always fixed
                                    flexShrink: 0,
                                }}
                            >
                                {cards.map((item) => (
                                    <div className="flex-shrink-0 w-5/12" key={item.id}>
                                        <button
                                            className="w-full outline-none"
                                            onClick={() => makeDefaultCard(item)}
                                        >
                                            <div
                                                className={`flex items-start justify-between w-full p-4 border rounded-lg `}
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
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`w-5 h-5 rounded-full border border-[#7902DF] flex items-center justify-center`} //border-[#2548FD]
                                                        style={{
                                                            borderWidth:
                                                                item.isDefault || selectedCard?.id === item.id
                                                                    ? 3
                                                                    : 1,
                                                        }}
                                                    ></div>
                                                    {/* Card Details */}
                                                    <div className="flex flex-col items-start">
                                                        <div className="flex flex-row items-center gap-3">
                                                            <div
                                                                style={{
                                                                    fontSize: "16px",
                                                                    fontWeight: "700",
                                                                    color: "#000",
                                                                }}
                                                            >
                                                                ****{item.last4}
                                                            </div>
                                                            {
                                                                // makeDefaultCardLoader ? (
                                                                //   <CircularProgress size={20} />
                                                                // ) :

                                                                item.isDefault && (
                                                                    <div
                                                                        className="flex px-2 py-1 rounded-full bg-purple text-white text-[10]"
                                                                        style={{ fontSize: 11, fontWeight: "500" }}
                                                                    >
                                                                        Default
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: "14px",
                                                                fontWeight: "500",
                                                                color: "#909090",
                                                            }}
                                                        >
                                                            {item.brand} Card
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Card Logo */}
                                                <div>
                                                    <Image
                                                        src={getCardImage(item) || "/svgIcons/Visa.svg"}
                                                        alt="Card Logo"
                                                        width={50}
                                                        height={50}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div
                                className="text-start mt-12"
                                style={{ fontSize: 18, fontWeight: "600" }}
                            >
                                No payment method added
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Code for  smart refill*/}

            <SmartRefillCard />

            {/* code for current plans available */}
            <div className="flex flex-col items-end  w-full mt-4">
                <div className='flex flex-row items-center border gap-2 bg-neutral-100 px-2 py-1 rounded-full'>
                    {
                        duration.map((item) => (
                            <div key={item.id}
                                className='flex-col'
                            >
                                <button
                                    className={`px-2 py-[3px] ${selectedDuration?.id === item.id ? "text-white text-base font-normal bg-purple outline-none border-none shadow-s shadow-purple rounded-full" : "text-black"}`}
                                    onClick={() => {
                                        setSelectedDuration(item);

                                        // Auto-select matching plan when switching billing cycles
                                        if (currentFullPlan) {
                                            let targetPlans = [];
                                            if (item.id === 1) {
                                                targetPlans = monthlyPlans;
                                            } else if (item.id === 2) {
                                                targetPlans = quaterlyPlans;
                                            } else if (item.id === 3) {
                                                targetPlans = yearlyPlans;
                                            }

                                            const matchingPlan = findMatchingPlan(currentFullPlan, targetPlans);
                                            if (matchingPlan) {
                                                setTogglePlan(matchingPlan.id);
                                                setToggleFullPlan(matchingPlan);
                                                setSelectedPlan(matchingPlan);
                                            }
                                        }
                                    }}
                                >
                                    {item.title}
                                </button>
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="w-full flex flex-row gap-4"
                style={{
                    overflowX: "auto",
                    overflowY: "hidden",
                    display: "flex",
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                    height: "",
                    marginTop: 20,
                    // border:'2px solid red'
                    scrollbarWidth: "none",
                    overflowY: "hidden",
                    height: "", // Ensures the height is always fixed
                    flexShrink: 0,
                }}>
                {getCurrentPlans().map((item, index) => (
                    <button
                        key={item.id}
                        className="mt-4 outline-none"
                        onClick={(e) => handleTogglePlanClick(item)}
                    >
                        <div
                            className="px-4 py-3 pb-4  flex flex-col gap-2"
                            style={{
                                ...styles.pricingBox,
                                border:
                                    item.id === togglePlan
                                        ? "2px solid #7902DF"
                                        : "1px solid #15151520",
                                backgroundColor: item.id === togglePlan ? "#402FFF05" : "",
                            }}
                        >
                            <div className="flex flex-col items-start h-[26vh] justify-between">
                                <div>
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

                                    <div className="flex flex-row items-center justify-between w-[10vw] mt-2">
                                        <div className="text-[14px] font-semibold">
                                            {item.name}
                                        </div>
                                        <div className="text-[14px] font-semibold">
                                            {item.mints} mins
                                        </div>

                                    </div>

                                    <div
                                        className="text-lg font-semibold text-left mt-3"
                                    >
                                        {`${item.discountPrice || "$0"}/mo`}
                                    </div>

                                    <div className="text-xs font-normal text-[#8a8a8a] text-left ">
                                        {item.calls} calls* per month
                                    </div>


                                    <div className="text-xs font-normal text-[#8a8a8a] text-left mt-3">
                                        {item.details}
                                    </div>
                                </div>


                                {item.id === currentPlan && (
                                    <div
                                        className="mt-2 flex px-2 py-1 bg-purple rounded-full text-white"
                                        style={{
                                            fontSize: 11.6,
                                            fontWeight: "500",
                                            width: "fit-content",
                                        }}
                                    >
                                        Current Plan
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="w-full flex flex-row items-center justify-center gap-3 mt-8">

                <div className="w-1/2">
                    {
                        cancelInitiateLoader ? (
                            <CircularProgress size={20} />
                        ) : (
                            <button
                                className="w-full text-base font-normal h-[50px] flex flex-col items-center justify-center text-black rounded-lg border"

                                onClick={() => {
                                    handleCancelClick()
                                }}
                            >
                                Cancel Account
                            </button>
                        )
                    }

                </div>
                {
                    currentPlan !== togglePlan && (
                        <div className="w-1/2">
                            {subscribePlanLoader ? (
                                <div>
                                    <CircularProgress size={25} />
                                </div>
                            ) : (
                                <button
                                    className="rounded-xl w-full "
                                    disabled={togglePlan === currentPlan}
                                    style={{
                                        height: "50px",
                                        fontSize: 16,
                                        fontWeight: "700",
                                        flexShrink: 0,
                                        backgroundColor:
                                            togglePlan === currentPlan ? "#00000020" : "#7902DF",
                                        color: togglePlan === currentPlan ? "#000000" : "#ffffff",
                                    }}
                                    // onClick={handleSubscribePlan}
                                    onClick={() => {
                                        handleUpgradeClick()

                                    }}
                                >
                                    {`${togglePlan >= currentPlan ? "Upgrade Plan" : "Downgrade Plan"} `}
                                </button>
                            )}
                        </div>
                    )
                }


            </div>

            {/* Code for Confirmation poup */}
            {
                showConfirmationModal && (
                    <UpgradePlanConfirmation
                        plan={selectedPlan}
                        open={showConfirmationModal}
                        onClose={() => {
                            setShowConfirmationModal(false);
                        }}
                        onConfirm={() => {
                            handleSubscribePlan();
                            setTimeout(() => setShowConfirmationModal(false), 0);
                        }}
                    />
                )
            }

            <CancelPlanAnimation
                showModal={showCancelPopup}
                handleClose={handleCloseCancelation}
                userLocalData={userLocalData}
            />


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
                <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
                    <div className="flex flex-row justify-center w-full">
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
                                    //selectedPlan={selectedPlan}
                                    stop={stop}
                                    getcardData={getcardData} //setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                                    handleClose={handleClose}
                                    togglePlan={""}
                                // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                                />
                            </Elements>
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* Modal for Gift popup */}
            <Modal
                open={giftPopup}
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
                <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
                    <div className="flex flex-row justify-center w-full h-[100%]">
                        <div
                            className="sm:w-7/12 w-full h-[70%]"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                                paddingBottom: "20px",
                            }}
                        >
                            <div className="flex flex-row justify-end">
                                <button
                                    className="outline-none"
                                    onClick={() => setGiftPopup(false)}
                                >
                                    <Image
                                        src={"/assets/crossIcon.png"}
                                        height={40}
                                        width={40}
                                        alt="*"
                                    />
                                </button>
                            </div>

                            <div
                                className="text-center text-purple"
                                style={{
                                    fontWeight: "600",
                                    fontSize: 16.8,
                                }}
                            >
                                {`Here’s a Gift`}
                            </div>

                            <div className="flex flex-row items-center justify-center w-full mt-6">
                                <div
                                    className="text-center  w-full"
                                    style={{
                                        fontWeight: "600",
                                        fontSize:
                                            ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 24,
                                        width: ScreenWidth > 1200 ? "70%" : "100%",
                                        alignSelf: "center",
                                    }}
                                >
                                    {`Don’t Hang Up Yet! Get 30 Minutes of Free Talk Time and Stay Connected!`}
                                </div>
                            </div>

                            <div className="flex flex-col items-center px-4 w-full">
                                <div
                                    className={`flex flex-row items-center gap-2 text-purple ${ScreenWidth < 1200 ? "mt-4" : "mt-6"
                                        }bg-[#402FFF10] py-2 px-4 rounded-full`}
                                    style={styles.gitTextStyle}
                                >
                                    <Image
                                        src={"/svgIcons/gift.svg"}
                                        height={
                                            ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 22
                                        }
                                        width={
                                            ScreenWidth < 1300 ? 19 : ScreenWidth <= 640 ? 16 : 22
                                        }
                                        alt="*"
                                    />
                                    Enjoy your next calls on us
                                </div>
                                <div className="w-full flex flex-row justify-center items-center mt-8">
                                    <div style={{ position: "relative" }}>
                                        <Image
                                            src={"/svgIcons/giftIcon.svg"}
                                            height={81}
                                            width={81}
                                            alt="*"
                                            className="-mb-28 ms-4"
                                            style={{
                                                zIndex: 9999,
                                                position: "relative",
                                            }}
                                        />
                                        <div
                                            className="text-purple"
                                            style={{
                                                fontSize: 200,
                                                fontWeight: "400",
                                                zIndex: 0,
                                                position: "relative",
                                            }}
                                        >
                                            30
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 40,
                                            fontWeight: "700",
                                        }}
                                    >
                                        Mins
                                    </div>
                                </div>
                                {redeemLoader ? (
                                    <div className="h-[50px] w-full flex flex-row items-center justify-center">
                                        <CircularProgress size={30} />
                                    </div>
                                ) : (
                                    <button
                                        className="rounded-lg text-white bg-purple outline-none"
                                        style={{
                                            fontWeight: "700",
                                            fontSize: "16",
                                            height: "50px",
                                            width: "340px",
                                        }}
                                        onClick={handleRedeemPlan}
                                    >
                                        Claim my 30 minutes
                                    </button>
                                )}
                                <button
                                    className="outline-none mt-6"
                                    style={{
                                        fontWeight: "600",
                                        fontSize: 16.8,
                                    }}
                                    onClick={() => {
                                        setShowConfirmCancelPlanPopup(true);
                                    }}
                                >
                                    {`No thank you, I’d like to cancel my Agentx`}
                                </button>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* Modal for cancel plan confirmation */}
            <Modal
                open={showConfirmCancelPlanPopup} //addPaymentPopUp
                // open={true}
                closeAfterTransition
                BackdropProps={{
                    timeout: 100,
                    sx: {
                        backgroundColor: "#00000030",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="md:8/12 lg:w-6/12 sm:w-11/12 w-full"
                    sx={styles.paymentModal}
                >
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="sm:w-7/12 w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                                height: "394px",
                            }}
                        >
                            <div className="flex flex-row justify-end">
                                <button onClick={() => setShowConfirmCancelPlanPopup(false)}>
                                    <Image
                                        src={"/assets/crossIcon.png"}
                                        height={40}
                                        width={40}
                                        alt="*"
                                    />
                                </button>
                            </div>
                            <div
                                className="text-center mt-8"
                                style={{
                                    fontWeight: "600",
                                    fontSize: 22,
                                }}
                            >
                                Are you sure ?
                            </div>

                            <div className="flex flex-row items-center justify-center w-full mt-6">
                                <div
                                    className="text-center"
                                    style={{
                                        fontWeight: "500",
                                        fontSize: 15,
                                        width: "70%",
                                        alignSelf: "center",
                                    }}
                                >
                                    Canceling your AgentX means you lose access to your agents,
                                    leads, pipeline, staff and more.
                                </div>
                            </div>

                            <button
                                className="w-full flex flex-row items-center h-[50px] rounded-lg bg-purple text-white justify-center mt-10"
                                style={{
                                    fontWeight: "600",
                                    fontSize: 16.8,
                                    outline: "none",
                                }}
                            >
                                Never mind, keep my AgentX
                            </button>

                            {cancelPlanLoader ? (
                                <div className="w-full flex flex-row items-center justify-center mt-8">
                                    <CircularProgress size={30} />
                                </div>
                            ) : (
                                <button
                                    className="w-full flex flex-row items-center rounded-lg justify-center mt-8"
                                    style={{
                                        fontWeight: "600",
                                        fontSize: 16.8,
                                        outline: "none",
                                    }}
                                    onClick={handleCancelPlan}
                                // onClick={() => { setShowConfirmCancelPlanPopup2(true) }}
                                >
                                    Yes. Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* del pln last step */}
            <Modal
                open={showConfirmCancelPlanPopup2} //showConfirmCancelPlanPopup2
                // open={true}
                closeAfterTransition
                BackdropProps={{
                    timeout: 100,
                    sx: {
                        backgroundColor: "#00000030",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="md:9/12 lg:w-7/12 sm:w-10/12 w-full"
                    sx={styles.paymentModal}
                >
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="sm:w-7/12 w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                                // height: "394px"
                            }}
                        >
                            <div className="flex flex-row justify-between items-center">
                                <div
                                    style={{
                                        fontSize: 16.8,
                                        fontWeight: "500",
                                        paddingLeft: "12px",
                                    }}
                                >
                                    Cancel Plan
                                </div>
                                <button onClick={() => setShowConfirmCancelPlanPopup2(false)}>
                                    <Image
                                        src={"/assets/crossIcon.png"}
                                        height={40}
                                        width={40}
                                        alt="*"
                                    />
                                </button>
                            </div>

                            <div className="flex flex-row items-center justify-center">
                                <Image
                                    src={"/svgIcons/warning2.svg"}
                                    height={49}
                                    width={49}
                                    alt="*"
                                />
                            </div>

                            <div
                                style={{
                                    fontWeight: "600",
                                    fontSize: 22,
                                    textAlign: "center",
                                    marginTop: 10,
                                }}
                            >
                                AgentX Successfully Canceled
                            </div>

                            <div
                                style={{
                                    fontWeight: "500",
                                    fontSize: 16,
                                    textAlign: "center",
                                    marginTop: 30,
                                }}
                            >
                                {`Tell us why you’re canceling to better improve our platform for you.`}
                            </div>

                            <div className="w-full flex flex-row items-center justify-center">
                                <div className="mt-9 w-10/12">
                                    {cancelPlanReasons.map((item, index) => (
                                        <button
                                            onClick={() => {
                                                handleSelectReason(item);
                                            }}
                                            key={index}
                                            style={{
                                                fontWeight: "500",
                                                fontSize: 15,
                                                textAlign: "start",
                                                marginTop: 6,
                                            }}
                                            className="flex flex-row items-center gap-2"
                                        >
                                            <div

                                                className="rounded-full flex flex-row items-center justify-center"
                                                style={{
                                                    border:
                                                        item.reason === selectReason
                                                            ? "2px solid #7902DF"
                                                            : "2px solid #15151510",
                                                    // backgroundColor: item.reason === selectReason ? "#7902DF" : "",
                                                    // margin: item.reason === selectReason && "5px",
                                                    height: "20px",
                                                    width: "20px",
                                                }}
                                            >
                                                <div
                                                    className="w-full h-full rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            item.reason === selectReason && "#7902DF",
                                                        height: "12px",
                                                        width: "12px",
                                                    }}
                                                />
                                            </div>
                                            <div>{item.reason}</div>
                                        </button>
                                    ))}
                                    {showOtherReasonInput && (
                                        <div className="w-full mt-4">
                                            <TextField
                                                inputRef={textFieldRef}
                                                placeholder="Type here"
                                                className="focus:ring-0 outline-none"
                                                variant="outlined"
                                                fullWidth
                                                multiline
                                                minRows={4}
                                                maxRows={5}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        "& fieldset": {
                                                            border: "1px solid #00000010", // Normal border
                                                        },
                                                        "&:hover fieldset": {
                                                            border: "1px solid #00000010", // Hover border
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                            border: "none", // Remove border on focus
                                                        },
                                                    },
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: "none", // Additional safety to remove outline
                                                    },
                                                    "& .Mui-focused": {
                                                        outline: "none", // Remove focus outline
                                                    },
                                                }}
                                                value={otherReasonInput}
                                                onChange={(e) => {
                                                    setOtherReasonInput(e.target.value);
                                                }}
                                            />
                                        </div>
                                    )}
                                    {cancelReasonLoader ? (
                                        <div className="flex flex-row items-center justify-center mt-10">
                                            <CircularProgress size={35} />
                                        </div>
                                    ) : (
                                        <button
                                            className="w-full flex flex-row items-center h-[50px] rounded-lg text-white justify-center mt-10"
                                            style={{
                                                fontWeight: "600",
                                                fontSize: 16.8,
                                                outline: "none",
                                                backgroundColor: (selectReason && (selectReason !== "Others" || otherReasonInput))
                                                    ? "#7902df"
                                                    : "#00000050",
                                                color: selectReason && (selectReason !== "Others" || otherReasonInput)
                                                    ? "#ffffff"
                                                    : "#000000",
                                            }}
                                            onClick={() => {
                                                handleDelReason();
                                            }}
                                            disabled={!selectReason && (selectReason !== "Others" || otherReasonInput)}
                                        >
                                            Continue
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default NewBilling;
const styles = {
    text: {
        fontSize: 12,
        color: "#00000090",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: 500,
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    paymentModal: {
        height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-50%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    headingStyle: {
        fontSize: 16,
        fontWeight: "700",
    },
    gitTextStyle: {
        fontSize: 15,
        fontWeight: "700",
    },

    //style for plans
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
    },
};
