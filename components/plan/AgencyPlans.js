import React, { useEffect, useState } from 'react'
import BackgroundVideo from '../general/BackgroundVideo';
import Image from 'next/image';
import { PersistanceKeys } from '@/constants/Constants';
import axios from 'axios';
import Apis from '../apis/Apis';

function AgencyPlans() {

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
    const [plans, setPlans] = useState([]);
    const [addPaymentPopup, setAddPaymentPopup] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(duration[0]);



    useEffect(() => {
        getPlans();
    }, [])

    const getPlans = async () => {
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
                    if (response.data.status === true) {
                        console.log('plans list is: ', response.data.data);
                        setPlans(response.data.data);
                    } else {
                        console.log('Error in getting plans: ', response.data.message);
                    }
                }
            }
        } catch (error) {
            console.log("Error in getPlans: ", error);
        }
    }

    const handleTogglePlanClick = (item) => {
        setTogglePlan(item.id);
        setSelectedPlan((prevId) => (prevId === item ? null : item));
    };


    return (
        <div
            // style={backgroundImage}
            className="overflow-hidden flex flex-col items-center w-[90%]"
        >

            <div
                className="flex flex-col items-center w-full"
                style={{
                    maxHeight: "90vh", // Restrict modal height to 90% of the viewport
                    overflow: "hidden", // Prevent scrolling on the entire modal
                }}
            >


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
                                        setSelectedDuration(item)
                                    }}
                                >
                                    {item.title}
                                </button>
                            ))
                        }
                    </div>
                </div>


                <div
                    className='w-full flex flex-row items-center gap-3 mt-10'
                >
                    {plans.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => handleTogglePlanClick(item)}
                            className={`w-[20wh] ${selectedPlan?.id === item.id && "bg-gradient-to-t from-purple to-[#C73BFF] p-2 rounded-2xl"}`}
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
                                        <div style={{ fontSize: 15, fontWeight: '500' }}>{label}</div>
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
                                        <div style={{ fontSize: 15, fontWeight: '500' }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        </button>

                    ))}
                </div>

                <div>
                    {false ? (
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
                            onClick={() => {
                                let localDetails = null;
                                const localData = localStorage.getItem(
                                    PersistanceKeys.LocalStorageUser
                                );
                                if (localData) {
                                    const LocalDetails = JSON.parse(localData);
                                    localDetails = LocalDetails;
                                    // AuthToken = LocalDetails.token;
                                }
                                if (localDetails?.user?.cards?.length == 0) {
                                    // setAddPaymentPopup(true);
                                } else {
                                    // handleSubscribePlan();
                                }
                            }}
                        >
                            Subscribe Plan
                        </button>
                    )}
                </div>
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
        </div>
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
