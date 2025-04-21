import React, { useEffect, useState } from 'react'
import BackgroundVideo from '../general/BackgroundVideo';
import Image from 'next/image';
import { PersistanceKeys } from '@/constants/Constants';
import axios from 'axios';
import Apis from '../apis/Apis';
import { Box, CircularProgress, Modal } from '@mui/material';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import AddCardDetails from '../createagent/addpayment/AddCardDetails';
import getProfileDetails from "@/components/apis/GetProfile";
import { AuthToken } from '../agency/plan/AuthDetails';
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage';
import { useRouter } from 'next/navigation';

//code for add card
let stripePublickKey =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
        ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
        : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublickKey);

function AgencyPlans() {
    
    const router = useRouter();
    const duration = [
        {
            id: 1,
            title: "Montly",
        }, {
            id: 2,
            title: "Quarterly",
        }, {
            id: 3,
            title: "Yearly",
        },
    ]

    const [togglePlan, setTogglePlan] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [quaterlyPlans, setQuaterlyPlans] = useState([]);
    const [yearlyPlans, setYearlyPlans] = useState([]);
    const [loading, setLoading] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState(duration[0]);
    //code for add card
    const [addPaymentPopUp, setAddPaymentPopUp] = useState(false);
    const [subPlanLoader, setSubPlanLoader] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);


    useEffect(() => {
        const D = localStorage.getItem("User");
        if (D) {
            const userData = JSON.parse(D);
            if (userData.user.cards.length > 0) {
                console.log("Cards are available");
            } else {
                setAddPaymentPopUp(true);
            }
        }
        getPlans();
    }, []);

    //handle select plan
    const handleTogglePlanClick = (item) => {
        setTogglePlan(item.id);
        setSelectedPlan((prevId) => (prevId === item ? null : item));
    };

    //close add card popup
    const handleClose = async (data) => {
        console.log("Card added details are here", data);
        if (data) {
            const userProfile = await getProfileDetails();
        }
        setAddPaymentPopUp(false);
    };

    //show the selected plans list
    const getCurrentPlans = () => {
        if (selectedDuration.id === 1) return monthlyPlans;
        if (selectedDuration.id === 2) return quaterlyPlans;
        if (selectedDuration.id === 3) return yearlyPlans;
        return [];
    };


    //api to get plans
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
                        let plansList = response.data.data;
                        const monthly = [];
                        const quarterly = [];
                        const yearly = [];

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
    const handleSubscribePlan = async () => {
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
                    "Authorization": "Bearer " + Token
                }
            });

            if (response) {
                console.log("Response of subscribe subaccount plan is", response.data);
                setSubPlanLoader(false);
                if (response.data.status === true) {
                    setErrorMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Success);
                    localStorage.removeItem("subPlan");
                    router.push("/agency/dashboard");

                } else if (response.data.status === false) {
                    setErrorMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Error);
                    if (response.data.message === "No payment method added") {
                        setAddPaymentPopUp(true);
                    }
                }
            }

        } catch (error) {
            console.error("Error occured in sub plan api is", error);
            setSubPlanLoader(false);
        }
    }


    return (
        <div
            // style={backgroundImage}
            className="overflow-hidden flex flex-col items-center w-[90%]"
        >

            <div
                className="flex flex-col items-center w-full"
                style={{
                    overflow: "hidden", // Prevent scrolling on the entire modal
                }}
            >
                <AgentSelectSnackMessage
                    isVisible={errorMsg !== null}
                    message={errorMsg}
                    hide={() => { setErrorMsg(null) }}
                    type={snackMsgType}
                />

                <div className='flex flex-row w-full items-center justify-between'>

                    <div className='flex flex-col items-start'>
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: "600",
                                marginTop: 20,
                            }}
                        >
                            {`AI Agents from just $1.50/day`}
                        </div>

                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: "500",
                                color: '#00000060'
                            }}
                        >
                            {`Gets more done than coffee. Cheaper too. Cancel anytime. 😉`}
                        </div>
                    </div>

                    <div className='flex flex-row items-center gap-2 bg-[#DFDFDF20] p-2 rounded-full'>
                        {
                            duration.map((item) => (
                                <button key={item.id}
                                    className={`px-4 py-2 ${selectedDuration.id === item.id ? "text-white bg-purple shadow-md shadow-purple rounded-full" : "text-black"}`}
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

                <div className='flex flex-col items-center gap-6 h-[80vh] w-full'
                    style={{ scrollbarWidth: 'none' }}>

                    {
                        loading ? (
                            <div className='mt-9'>
                                <CircularProgress size={35} />
                            </div>
                        ) : (
                            <div
                                className='w-full flex flex-row items-start gap-3 mt-10'
                                style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
                            >
                                {getCurrentPlans().map((item, index) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTogglePlanClick(item)}
                                        className={`w-[30wh] ${selectedPlan?.id === item.id && "bg-gradient-to-t from-purple to-[#C73BFF] p-2 rounded-2xl"}`}
                                    >
                                        <div className="bg-white w-full h-full rounded-2xl p-6 flex flex-col items-start gap-2">
                                            {/* Top section */}
                                            <div className="w-full flex flex-row items-center justify-between">
                                                <div style={{ fontSize: 20, fontWeight: '700' }}>
                                                    {item.title}
                                                </div>

                                                {!item.percentageDiscount ? (
                                                    <div className="px-4 py-2 bg-purple rounded-full shadow-md text-[13px] text-white font-semibold">
                                                        {item.percentageDiscount || 0}% off
                                                    </div>
                                                ) : (
                                                    <div></div>
                                                )}
                                            </div>

                                            {/* Pricing */}
                                            <div style={{ fontSize: 20, fontWeight: '700', textAlign: 'left' }}>
                                                ${item.originalPrice}
                                            </div>

                                            {/* Features */}
                                            {[
                                                "Agents",
                                                "Unlimited Agents",
                                                "Unlimited Teams",
                                                "1000+ Integrations",
                                                "Mins roll over for 6 months",
                                            ].map((label) => (
                                                <div key={label} className="flex flex-row items-center gap-2 mt-2">
                                                    <Image src="/svgIcons/greenTick.svg" height={16} width={16} alt="✓" />
                                                    <div style={{
                                                        fontSize: 15, fontWeight: '500', textAlign: 'left', whiteSpace: 'nowrap',
                                                    }}>{label}</div>
                                                </div>
                                            ))}

                                            {[
                                                "Voicemails",
                                                "Lead Enrichment (Perplexity)",
                                                "DNC Checklist",
                                                "AI Powered CRM",
                                                "Custom Pipeline Steps",
                                                "Calendar Integration",
                                                "Support",
                                            ].map((label) => (
                                                <div key={label} className="flex flex-row items-center gap-2 mt-2">
                                                    <Image src="/svgIcons/redCross.svg" height={16} width={16} alt="✗" />
                                                    <div style={{
                                                        fontSize: 15, fontWeight: '500', textAlign: 'left', whiteSpace: 'nowrap',
                                                    }}>{label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </button>

                                ))}
                            </div>
                        )
                    }

                    <div>
                        {subPlanLoader ? (
                            <div>
                                <CircularProgress size={30} />
                            </div>
                        ) : (

                            <button
                                disabled={!togglePlan}
                                className="px-5 flex flex-row items-center justify-center py-3 mt-4 bg-purple rounded-lg text-white"
                                style={{
                                    fontSize: 16.8,
                                    fontWeight: "600",
                                    backgroundColor: togglePlan ? "" : "#00000020",
                                    color: togglePlan ? "" : "#000000",
                                }}
                                onClick={() => { handleSubscribePlan() }}>
                                Subscribe Plan
                            </button>
                        )}
                    </div>
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
                                            fontSize: 18,
                                            fontWeight: "600",
                                        }}
                                    >
                                        Add new card
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
                                        handleClose={handleClose}
                                    // togglePlan={togglePlan}
                                    />
                                </Elements>
                            </div>
                        </div>
                    </Box>
                </Modal>

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
        // my: "50vh",
        // transform: "translateY(-50%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
        height: "100svh",
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
};
