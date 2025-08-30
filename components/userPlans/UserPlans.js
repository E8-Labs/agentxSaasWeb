import React, { useEffect, useState } from 'react'
import ProgressBar from "@/components/onboarding/ProgressBar";
import Image from 'next/image';
import { getUserPlans } from './UserPlanServices';
import { Modal, Box } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import AgencyAddCard from '../createagent/addpayment/AgencyAddCard';
import { loadStripe } from '@stripe/stripe-js';
import UserAddCard from './UserAddCardModal';

function UserPlans() {


    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);


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

    const [selectedPlan, setSelectedPlan] = useState(null)
    const [hoverPlan, setHoverPlan] = useState(null);
    const [togglePlan, setTogglePlan] = useState(null);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(null)
    const [addPaymentPopUp, setAddPaymentPopUp] = useState(false)



    useEffect(() => {
        getPlans()
    }, [])

    const handleClose = async (data) => {
        // console.log("Card added details are here", data);
        // if (data) {
        //     const userProfile = await getProfileDetails();
        // }
        setAddPaymentPopUp(false);
        // handleSubscribePlan()
    };


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


    const handleTogglePlanClick = (item, index) => {
        console.log("Selected plan index is", index, item);
        setSelectedPlanIndex(index);
        setTogglePlan(item.id);
        setSelectedPlan(item);
    };


    return (
        <div className='flex flex-col items-center w-full h-[100vh] overflow-hidden'>
            <div className='flex flex-col items-center w-[90%] h-full'>

                <div className="flex w-full flex-row items-center gap-2 mt-[5vh]"
                    style={{ backgroundColor: '' }}>
                    <Image src={"/assets/agentX.png"} height={30} width={130} alt="*" style={{ backgroundColor: '' }} />

                    <div className="w-[100%]">
                        <ProgressBar value={100} />
                    </div>
                </div>

                <div className='flex flex-row items-center justify-between w-full mt-10'>


                    <div className='flex flex-col items-start'>
                        <div className='text-4xl font-semibold'
                        >
                            {`Grow Your Business`}
                        </div>

                        <div className='text-base font-medium mt-1'
                        >
                            {`AI Agents from just $1.50 per day — gets more done than coffee. Cheaper too. 😉`}
                        </div>
                    </div>
                    <div className='flex flex-col items-start'>
                        <div className='flex flex-row items-center gap-10'>
                            {
                                duration.map((item) => (
                                    <div key={item.id}
                                        className={`px-2 py-1 ${item.id != 1 ? "bg-white/40 shadow-[0px_4px_15.5px_0px_rgba(0,0,0,0.11)] backdrop-blur-[10px]" : ''} rounded-tl-xl rounded-tr-xl `}
                                    >
                                        {item.save ? (
                                            <div
                                                className={`text-xs font-semibold ${selectedDuration?.id === item.id ? "text-purple" : "text-neutral-400 "}`}
                                            >
                                                Save {item.save}
                                            </div>
                                        ) : (
                                            <div className='w-[7vw]'></div>
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
                                            className={`px-6 py-[10px] ${selectedDuration?.id === item.id ? "text-white text-base font-normal bg-purple outline-none border-none shadow-md shadow-purple rounded-full" : "text-black"}`}
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



                <div className='flex flex-row gap-5 w-full h-[70%] mt-4'>
                    {
                        getCurrentPlans().map((item,index) => (
                            <button
                                key={item.id}
                                onClick={() => handleTogglePlanClick(item, index)}
                                onMouseEnter={() => { setHoverPlan(item) }}
                                onMouseLeave={() => { setHoverPlan(null) }}

                                className={`flex flex-col items-center h-full w-3/12 rounded-lg  hover:p-2 hover:bg-gradient-to-t from-purple to-[#C73BFF]
                                 ${selectedPlan?.id === item.id ? "bg-gradient-to-t from-purple to[#C73BFF] p-2" : "border p-2"}
                                `}
                            >
                                <div className='flex flex-col items-center w-full'>
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

                                    <div className='flex flex-col items-center rounded-lg gap-2 bg-white h-[64vh] w-full'>
                                        <div className='text-3xl font-semibold mt-2'>
                                            {item.name}
                                        </div>

                                        <div className="text-4xl mt-4 font-semibold bg-gradient-to-l from-[#DF02BA] to-purple bg-clip-text text-transparent">
                                            ${item.discountPrice}
                                        </div>
                                        <div className='text-base font-normal'>
                                            {item.calls} Calls* Per Month
                                        </div>
                                        <div className='text-[14px] font-normal text-black/50 '>
                                            {item.details}
                                        </div>

                                        <div
                                            className="w-[95%] py-3.5 mt-3 bg-purple rounded-lg text-white text-base font-normal cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleTogglePlanClick(item,index);
                                                setAddPaymentPopUp(true)
                                            }}
                                        >
                                            Get Started
                                        </div>
                                        <div className='flex flex-col items-start w-[95%] h-[55%] overflow-y-auto'>
                                            {
                                                item.features.map((feature) => (
                                                    <div key={feature.text} className="flex flex-row items-center gap-2 mt-1">
                                                        <Image src="/svgIcons/greenTick.svg" height={16} width={16} alt="✓" />
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
                                                            <div className='text-base font-normal'>
                                                                {feature.text} <span class="text-Gray text-xs font-normal font-['Inter'] leading-tight">
                                                                    {feature.subText}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }

                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    }

                </div>
            </div>

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
