import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import PricingBox from '../test/PricingBox';
import { Box, CircularProgress, Modal } from '@mui/material';
import AddCardDetails from './addpayment/AddCardDetails';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Apis from '../apis/Apis';
import axios from 'axios';


let stripePublickKey = process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production" ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
console.log("Public key is ", stripePublickKey)
const stripePromise = loadStripe(stripePublickKey);

const CreatAgent3 = ({ handleContinue }) => {

    const router = useRouter();
    const [togglePlan, setTogglePlan] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(false);
    const [addPaymentPopUp, setAddPaymentPopUp] = useState(false);
    const [addPaymentSuccessPopUp, setAddPaymentSuccessPopUp] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [shouldContinue, setShouldContinue] = useState(true);
    //variables for 2nd plan subscription
    const [showSubscribeplan2, setShowSubscribeplan2] = useState(false);
    const [togglePlan2, setTogglePlan2] = useState(false);
    const [selectedPlan2, setSelectedPlan2] = useState(null);
    const [subscribePlanLoader, setSubscribePlanLoader] = useState(false)


    //code for adding stripe
    const [cardData, getcardData] = useState("");

    useEffect(() => {
        if (togglePlan === true && agreeTerms === true) {
            setShouldContinue(false);
        }
    }, [togglePlan, agreeTerms])

    //selects 1st plan popup
    const handleTogglePlanClick = (item) => {
        // if (togglePlan) {
        //     setTogglePlan(prevId => (prevId === item.id ? null : item.id));
        //     setSelectedPlan(prevId => (prevId === item ? null : item));
        // } else {
        //     setSelectedPlan(prevId => (prevId === item ? null : item));
        //     setAddPaymentPopUp(true);
        // }
        // setTogglePlan(prevId => (prevId === item.id ? null : item.id));
        setTogglePlan(item.id);
        setSelectedPlan(prevId => (prevId === item ? null : item));
        // setTogglePlan(prevId => (prevId === id ? null : id));
    }

    const handleClose = () => {
        if (addPaymentPopUp) {
            setAddPaymentPopUp(false);
        } else if (addPaymentSuccessPopUp) {
            setAddPaymentSuccessPopUp(false);
        }
    }

    const handleToggleTermsClick = () => {
        setAgreeTerms(!agreeTerms)
    }

    //handles seleting the reasurance plan popup
    const handleTogglePlanClick2 = (item) => {
        // if (togglePlan) {
        //     setTogglePlan(prevId => (prevId === item.id ? null : item.id));
        //     setSelectedPlan(prevId => (prevId === item ? null : item));
        // } else {
        //     setSelectedPlan(prevId => (prevId === item ? null : item));
        //     setAddPaymentPopUp(true);
        // }
        // setTogglePlan(prevId => (prevId === item.id ? null : item.id));
        setTogglePlan2(item.id);
        setSelectedPlan2(prevId => (prevId === item ? null : item));
        // setTogglePlan(prevId => (prevId === id ? null : id));
    }



    //function to subscribe plan
    const handleSubScribePlan = async () => {
        try {

            let planType = null;

            // console.log("Selected plan is:", togglePlan);

            if (togglePlan2 === 1) {
                planType = "Plan30"
            } else if (togglePlan2 === 2) {
                planType = "Plan120"
            } else if (togglePlan2 === 3) {
                planType = "Plan360"
            } else if (togglePlan2 === 4) {
                planType = "Plan720"
            }

            console.log("Current plan is", planType)

            setSubscribePlanLoader(false);
            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const LocalDetails = JSON.parse(localData);
                AuthToken = LocalDetails.token;
            }

            console.log("Authtoken is", AuthToken);

            const ApiData = {
                plan: planType
            }

            console.log("Api data is", ApiData);

            const ApiPath = Apis.subscribePlan;
            console.log("Apipath is", ApiPath);
            // return
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of subscribe plan api is", response);
                if (response.data.status === true) {
                    // handleClose();
                    const screenWidth = window.innerWidth; // Get current screen width
                    const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px

                    if (screenWidth <= SM_SCREEN_SIZE) {
                        console.log("This is a small size screen");
                        router.push("/createagent/desktop")
                    } else {
                        console.log("This is a large size screen");
                        handleContinue();
                    }
                }
            }

        } catch (error) {
            console.error("Error occured in api is:", error);
        } finally {
            setSubscribePlanLoader(false);
        }
    }



    const facilities = [
        {
            id: 1,
            title: "Cancel anytime"
        },
        {
            id: 2,
            title: "Unlimited Agents"
        },
        {
            id: 3,
            title: "No monthly commitment"
        },
        {
            id: 6,
            title: "Real Time Booking"
        },
    ]

    //code for mobile view facilities
    const mobileFacilities = [
        {
            id: 1,
            title: "Cancel anytime"
        },
        {
            id: 2,
            title: "Unlimited Agents"
        },
        {
            id: 3,
            title: "No commitment"
        },
        {
            id: 6,
            title: "Real Time Booking"
        },
    ]

    const plans = [
        {
            id: 1,
            mints: 30,
            calls: 25,
            details: "Perfect for getting started! Free for the first 30 mins then $45 to continue.",
            originalPrice: "45",
            discountPrice: "0",
            planStatus: "Free"
        },
        {
            id: 2,
            mints: 120,
            calls: "1k",
            details: "Perfect for neighborhood updates and engagement.",
            originalPrice: "165",
            discountPrice: "99",
            planStatus: "40%"
        },
        {
            id: 3,
            mints: 360,
            calls: "3k",
            details: "Great for 2-3 listing appointments in your territory.",
            originalPrice: "540",
            discountPrice: "370",
            planStatus: "50%"
        },
        {
            id: 4,
            mints: 720,
            calls: "10k",
            details: "Great for teams and reaching new GCI goals. ",
            originalPrice: "1200",
            discountPrice: "480",
            planStatus: "60%"
        },
    ]

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "700"
        },
        giftTextStyle: {
            fontSize: 14,
            fontWeight: "500"
        },
        cardStyles: {
            fontSize: "14", fontWeight: "500", border: "1px solid #00000020"
        },
        pricingBox: {
            position: 'relative',
            // padding: '10px',
            borderRadius: '10px',
            // backgroundColor: '#f9f9ff',
            display: 'inline-block',
            width: '100%',
        },
        triangleLabel: {
            position: 'absolute',
            top: '0',
            right: '0',
            width: '0',
            height: '0',
            borderTop: '50px solid #7902DF', // Increased height again for more padding
            borderLeft: '50px solid transparent',
        },
        labelText: {
            position: 'absolute',
            top: '10px', // Adjusted to keep the text centered within the larger triangle
            right: '5px',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            transform: 'rotate(45deg)',
        },
        content: {
            textAlign: 'left',
            paddingTop: '10px',
        },
        originalPrice: {
            textDecoration: 'line-through',
            color: '#7902DF65',
            fontSize: 18,
            fontWeight: "600"
        },
        discountedPrice: {
            color: '#000000',
            fontWeight: 'bold',
            fontSize: 18,
            marginLeft: '10px',
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
    }

    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-white rounded-2xl w-full lg:w-10/12 h-[90vh] py-4'>

                <div className='h-[100%]'>
                    {/* header */}
                    <div className='h-[10%]'>
                        <Header />
                    </div>
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full h-[80%]'>
                        <div
                            className='mt-6 w-11/12 sm:text-3xl text-xl font-[600]'
                            style={{ textAlign: "center" }} onClick={handleContinue}>
                            Your first 30 minutes are on us!
                        </div>
                        <div className='mt-2 sm:text-[20px]' style={{ fontWeight: "400" }}>
                            Start for free, then pay as you go
                        </div>

                        <div className='h-[70%] overflow-auto w-full flex flex-col items-center' style={{ scrollbarWidth: "none" }}>

                            {/* For mobile view */}
                            <div className='sm:hidden flex flex-wrap w-full sm:w-10/12 md:w-4/12 ' style={{ backgroundColor: '' }}>
                                {
                                    mobileFacilities.map((item, index) => (
                                        <div key={item.id} className='flex flex-row items-center justify-start pl-4 gap-2 w-1/2 mt-4'>
                                            <div className='flex flex-row items-center gap-2 justify-start ml-2 ' style={{ width: "auto" }}>
                                                <div>
                                                    <Image src={"/assets/tickMark.png"} height={14} width={17} alt='*' />
                                                </div>
                                                <div style={{ fontWeight: '500', fontSize: 13 }}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            {/* For greater then small size screen */}
                            <div className='sm:flex hidden flex flex-wrap w-full sm:w-10/12 md:w-4/12 ' style={{ backgroundColor: '' }}>
                                {
                                    facilities.map((item, index) => (
                                        <div key={item.id} className='flex flex-row items-center justify-start pl-4 gap-2 w-1/2 mt-4'>
                                            <div className='flex flex-row items-center gap-2 justify-start ml-2 ' style={{ width: "auto" }}>
                                                <div>
                                                    <Image src={"/assets/tickMark.png"} height={14} width={17} alt='*' />
                                                </div>
                                                <div style={{ fontWeight: '500', fontSize: 13 }}>
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className='hidden md:flex flex flex-row items-center justify-center py-3 gap-4 mt-6 mb-8 px-4' style={{ backgroundColor: "#402FFF20", borderRadius: "50px", width: "fit-content" }}>
                                <Image src={"/assets/attachIcon.png"} height={24} width={24} alt='*' />
                                <div className='text-purple' style={styles.giftTextStyle}>
                                    Invest in Your Business Growth - Quick Start, Minimal Cost, Maximum Value.
                                </div>
                            </div>

                            <div className='flex flex-row md:hidden items-center justify-center py-3 gap-4 mt-6 mb-8 px-4' style={{ backgroundColor: "#402FFF20", borderRadius: "50px", width: "fit-content" }}>
                                <Image src={"/assets/gift.png"} height={24} width={24} alt='*' />
                                <div className='text-purple' style={styles.giftTextStyle}>
                                    Enjoy your first calls on us
                                </div>
                            </div>

                            {
                                plans.map((item, index) => (
                                    <button key={item.id} className='w-full md:md-10/12 lg:w-6/12 mt-4' onClick={(e) => handleTogglePlanClick(item)}>
                                        <div className='px-4 py-1 pb-4'
                                            style={{
                                                ...styles.pricingBox,
                                                border: item.id === togglePlan ? '2px solid #7902DF' : '1px solid #15151520',
                                                backgroundColor: item.id === togglePlan ? "#402FFF05" : ""
                                            }}>
                                            <div style={{ ...styles.triangleLabel, borderTopRightRadius: "7px" }}></div>
                                            <span style={styles.labelText}>
                                                {item.planStatus}
                                            </span>
                                            <div className='flex flex-row items-start gap-3' style={styles.content}>
                                                <div className='mt-1'>
                                                    <div>
                                                        {
                                                            item.id === togglePlan ?
                                                                <Image src={"/assets/checkMark.png"} height={24} width={24} alt='*' /> :
                                                                <Image src={"/assets/unCheck.png"} height={24} width={24} alt='*' />
                                                        }
                                                    </div>
                                                </div>
                                                <div className='w-full'>
                                                    <div style={{ color: "#151515", fontSize: 20, fontWeight: "600" }}>
                                                        {item.mints}mins | Approx {item.calls} Calls
                                                    </div>
                                                    <div className='flex flex-row items-center justify-between'>
                                                        <div className='mt-2' style={{ color: "#15151590", fontSize: 12, width: "80%", fontWeight: "600" }}>
                                                            {item.details}
                                                        </div>
                                                        <div className='flex flex-row items-center'>
                                                            <div style={styles.originalPrice}>${item.originalPrice}</div>
                                                            <div style={styles.discountedPrice}>${item.discountPrice}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            }

                            <div
                                className='w-full md:w-10/12 lg:w-6/12 mt-4 flex flex-row items-start gap-2'
                                style={{
                                    borderRadius: "7px",
                                    border: "1px solid #15151540", padding: "15px", backgroundColor: "#330864",
                                }}>
                                <Image src={"/assets/diamond.png"} className='mt-2' height={18} width={20} alt='*' />
                                <div>
                                    <div style={{ color: "#ffffff", fontSize: 20, fontWeight: "600" }}>
                                        Brokerage Plan
                                    </div>
                                    <div className='flex flex-row items-start justify-between w-full'>
                                        <div style={{ color: "#ffffff", fontSize: 12, fontWeight: "600", width: "60%" }}>
                                            Custom solution specific to your business. Integrate AgentX into your sales operation.
                                        </div>
                                        <button className='text-[#ffffff] pe-8' style={{ fontSize: 14, fontWeight: "700" }}>
                                            Contact Team
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-row items-center gap-4 justify-start w-full md:w-10/12 lg:w-6/12 mt-6'>
                            <button onClick={handleToggleTermsClick}>
                                {
                                    agreeTerms ?
                                        <div className='bg-purple flex flex-row items-center justify-center rounded' style={{ height: "24px", width: "24px" }}>
                                            <Image src={"/assets/whiteTick.png"} height={8} width={10} alt='*' />
                                        </div> :
                                        <div className='bg-none border-2 flex flex-row items-center justify-center rounded' style={{ height: "24px", width: "24px" }}>
                                        </div>
                                }
                            </button>
                            <div
                                className='flex flex-row items-center gap-1'
                                style={{ color: "#151515", fontSize: 13, fontWeight: "600" }}
                            >
                                I agree to the
                                <button
                                    className='underline'
                                    onClick={() => {
                                        window.open("https://www.myagentx.com/terms-and-condition", "_blank");
                                    }}
                                >
                                    Terms & Conditions.
                                </button>
                            </div>
                        </div>

                    </div>
                    {/* style={{ position: "absolute", bottom: 65, }} */}
                    <div className='w-full flex-col items-center flex gap-4 h-[10%]' >

                        {
                            selectedPlan && agreeTerms ? (
                                <div className='w-full flex-col items-center flex'>
                                    {
                                        selectedPlan?.id > 1 ? (
                                            <button
                                                className='bg-purple w-11/12 md:w-5/12 rounded-lg text-white h-[50px]'
                                                style={{
                                                    fontSize: 16, fontWeight: "600",
                                                    // backgroundColor: selectedPlan && agreeTerms ? "#00000020" : "",
                                                    // color: selectedPlan?.id > 1 && agreeTerms ? "#000000" : ""
                                                }}
                                                onClick={() => { setAddPaymentPopUp(true) }}
                                            >
                                                Continue
                                            </button>
                                        ) : (
                                            <button
                                                className='bg-purple w-11/12 md:w-5/12 rounded-lg text-white h-[50px]'
                                                style={{
                                                    fontSize: 16, fontWeight: "600",
                                                    // backgroundColor: selectedPlan && agreeTerms ? "#00000020" : "",
                                                    // color: selectedPlan && agreeTerms ? "#000000" : ""
                                                }}
                                                onClick={() => { setAddPaymentPopUp(true) }}
                                            >
                                                Claim 30 mins
                                            </button>
                                        )
                                    }
                                </div>
                            ) : (
                                <button
                                    disabled={true}
                                    className='w-11/12 md:w-5/12 rounded-lg text-white h-[50px]'
                                    style={{
                                        fontSize: 16, fontWeight: "600",
                                        backgroundColor: "#00000020",
                                        color: "#000000"
                                    }}
                                    onClick={() => { setAddPaymentPopUp(true) }}
                                >
                                    Continue
                                </button>
                            )
                        }

                    </div>
                </div>



                {/* Add Payment Modal */}
                <Modal
                    open={addPaymentPopUp} //addPaymentPopUp
                    // open={true}
                    closeAfterTransition
                    BackdropProps={{
                        timeout: 1000,
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
                                <div className='flex flex-row justify-end'>
                                    <button onClick={handleClose}>
                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                    </button>
                                </div>
                                <div className='text-center mt-2 text-[18px] font-[700] md:text-[24px] md:font-[700]'>
                                    {
                                        selectedPlan?.id > 1 ?
                                            "Select a plan that fits your needs" :
                                            "Start for Free. Then Pay as you go!"
                                    }
                                </div>

                                {
                                    selectedPlan?.id > 1 ?
                                        <div className='text-center mt-4 text-[14px] font-[600] md:text-[17px] md:font-[700]' //style={styles.headingStyle}
                                        >
                                            Your minutes will renew after using {selectedPlan?.mints} mins
                                        </div> :
                                        <div className='text-center mt-4 text-[14px] font-[600] md:text-[17px] md:font-[700]' style={styles.headingStyle}>
                                            Payment starts after your free {selectedPlan?.mints} mins
                                        </div>
                                }


                                {/* <div className='mt-4 text-[#4F5B76]' style={styles.giftTextStyle}>
                                    Card number
                                </div>
                                <input className='outline-none border rounded-lg w-full p-2 mt-2 focus:outline-none focus:ring-0' style={styles.cardStyles} placeholder='1212 1212 1212 1212' maxLength={16}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                                    }} />

                                <div className='flex flex-row gap-2 mt-4'>
                                    <div className='w-6/12'>
                                        <div className='text-[#4F5B76]' style={styles.giftTextStyle}>
                                            Expiry
                                        </div>
                                        <input
                                            className='outline-none border rounded-lg w-full p-2 mt-2 focus:outline-none focus:ring-0' style={styles.cardStyles} placeholder='MM / YY' maxLength={6}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                                            }} />
                                    </div>
                                    <div className='w-6/12'>
                                        <div className='text-[#4F5B76]' style={styles.giftTextStyle}>
                                            Card number
                                        </div>
                                        <input className='outline-none border rounded-lg w-full p-2 mt-2 focus:outline-none focus:ring-0' style={styles.cardStyles} placeholder='CVC' maxLength={3}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                                            }} />
                                    </div>
                                </div>

                                <div className='mt-4 text-[#4F5B76]' style={styles.giftTextStyle}>
                                    Postal Code
                                </div>
                                <input className='outline-none border rounded-lg w-full p-2 mt-2 focus:outline-none focus:ring-0' style={styles.cardStyles} placeholder='48530' maxLength={5}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                                    }} />

                                <div className='mt-4 text-[#4F5B76]' style={styles.giftTextStyle}>
                                    AgentX Code (optional)
                                </div>
                                <input className='outline-none border rounded-lg w-full p-2 mt-2 focus:outline-none focus:ring-0'
                                    style={styles.cardStyles} placeholder='Enter the code here' maxLength={16}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                                    }}
                                /> */}

                                <Elements stripe={stripePromise}>
                                    <AddCardDetails
                                        //selectedPlan={selectedPlan}
                                        stop={stop} getcardData={getcardData} setAddPaymentSuccessPopUp={setAddPaymentSuccessPopUp} handleClose={handleClose}
                                        togglePlan={togglePlan}
                                    // handleSubLoader={handleSubLoader} handleBuilScriptContinue={handleBuilScriptContinue}
                                    />
                                </Elements>

                                {/* <button className='bg-purple text-white w-full rounded-xl mt-12' style={{ ...styles.headingStyle, height: "50px" }}
                                    onClick={() => {
                                        
                                        setAddPaymentSuccessPopUp(true);
                                    }}>
                                    Continue
                                </button> */}

                                {/* Can be use full to add shadow */}
                                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                            </div>
                        </div>
                    </Box>
                </Modal>

                {/* Add Payment Success Modal */}
                <Modal
                    open={addPaymentSuccessPopUp} //addPaymentSuccessPopUp
                    closeAfterTransition
                    BackdropProps={{
                        timeout: 1000,
                        sx: {
                            backgroundColor: "#00000020",
                            // //backdropFilter: "blur(20px)",
                        },
                    }}
                >
                    <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
                        <div className="flex flex-row justify-center w-full">
                            <div
                                className="sm:w-7/12 w-full mx-2"
                                style={{
                                    backgroundColor: "#ffffff",
                                    padding: 20,
                                    borderRadius: "13px",
                                }}
                            >
                                <div className='flex flex-row justify-end'>
                                    <button onClick={handleClose}>
                                        <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                    </button>
                                </div>
                                <div className='mt-4 flex flex-row justify-center w-full'>
                                    <Image src={"/assets/successTick.png"} height={85} width={85} alt='*' />
                                </div>

                                {
                                    selectedPlan?.id > 1 ? (
                                        <div className='text-center mt-4' style={{ fontWeight: "700", fontSize: 24 }}>
                                            Payment Successfully Added
                                        </div>
                                    ) : (
                                        <div className='text-center mt-4' style={{ fontWeight: "700", fontSize: 24 }}>
                                            Payment Successful
                                        </div>
                                    )
                                }

                                <button
                                    className='bg-purple text-white w-full rounded-xl mt-6 mb-6' style={{ ...styles.headingStyle, height: "50px", }}
                                    onClick={() => {

                                        const screenWidth = window.innerWidth; // Get current screen width
                                        const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px

                                        if (screenWidth <= SM_SCREEN_SIZE) {
                                            if (selectedPlan?.id === 1) {
                                                setShowSubscribeplan2(true)
                                            } else {
                                                router.push("/createagent/desktop")
                                            }
                                            console.log("This is a small size screen");
                                        } else {
                                            console.log("This is a large size screen");
                                            setShowSubscribeplan2(true)
                                            // if (selectedPlan?.id === 1) {
                                            // } else {
                                            //     handleContinue();
                                            // }
                                        }

                                    }}
                                >
                                    Continue
                                </button>

                                {/* Can be use full to add shadow */}
                                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                            </div>
                        </div>
                    </Box>
                </Modal>


                {/* Modal 2 to reassure the plan */}
                <Modal
                    open={showSubscribeplan2}
                    closeAfterTransition
                    BackdropProps={{
                        timeout: 1000,
                        sx: {
                            backgroundColor: "#00000020",
                            // //backdropFilter: "blur(20px)",
                        },
                    }}
                >
                    <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
                        <div className="flex flex-row justify-center w-full">
                            <div
                                className="sm:w-7/12 w-full mx-2"
                                style={{
                                    backgroundColor: "#ffffff",
                                    padding: 20,
                                    borderRadius: "13px",
                                }}
                            >

                                <div
                                    className='mt-6 w-11/12 sm:text-3xl text-xl font-[600]'
                                    style={{ textAlign: "center" }}>
                                    Select a plan that fits your needs
                                </div>

                                <div
                                    className='w-11/12 sm:text-[29px] text-[24px] font-[400]'
                                    style={{ textAlign: "center" }}>
                                    Continue with a plan after your free 30 mins
                                </div>

                                <div className='w-full flex flex-row items-center justify-center'>
                                    <div className='hidden md:flex flex flex-row items-center justify-center py-3 gap-4 mt-6 mb-8 px-4' style={{ backgroundColor: "#402FFF20", borderRadius: "50px", width: "fit-content" }}>
                                        <Image src={"/assets/attachIcon.png"} height={24} width={24} alt='*' />
                                        <div className='text-purple' style={styles.giftTextStyle}>
                                            Invest in Your Business Growth - Quick Start, Minimal Cost, Maximum Value.
                                        </div>
                                    </div>
                                </div>



                                <div className='w-full'>
                                    {
                                        plans.map((item, index) => (
                                            <button key={item.id} className='w-full mt-4' onClick={(e) => handleTogglePlanClick2(item)}>
                                                <div className='px-4 py-1 pb-4'
                                                    style={{
                                                        ...styles.pricingBox,
                                                        border: item.id === 1 ? '2px solid #7902DF' : item.id === togglePlan2 ? '2px solid #7902DF' : '1px solid #15151520',
                                                        backgroundColor: item.id === 1 ? '#402fff05' : item.id === togglePlan2 ? "#402FFF05" : ""
                                                    }}>
                                                    <div style={{ ...styles.triangleLabel, borderTopRightRadius: "7px" }}></div>
                                                    <span style={styles.labelText}>
                                                        {item.planStatus}
                                                    </span>
                                                    <div className='flex flex-row items-start gap-3' style={styles.content}>
                                                        <div className='mt-1'>
                                                            {
                                                                item.id === 1 ?
                                                                    <Image src={"/assets/checkMark.png"} height={24} width={24} alt='*' /> :
                                                                    <div>
                                                                        {
                                                                            item.id === togglePlan2 ?
                                                                                <Image src={"/assets/checkMark.png"} height={24} width={24} alt='*' /> :
                                                                                <Image src={"/assets/unCheck.png"} height={24} width={24} alt='*' />
                                                                        }
                                                                    </div>
                                                            }
                                                        </div>
                                                        <div className='w-full'>
                                                            <div style={{ color: "#151515", fontSize: 20, fontWeight: "600" }}>
                                                                {item.mints}mins | Approx {item.calls} Calls
                                                            </div>
                                                            <div className='flex flex-row items-center justify-between'>
                                                                <div className='mt-2' style={{ color: "#15151590", fontSize: 12, width: "80%", fontWeight: "600" }}>
                                                                    {item.details}
                                                                </div>
                                                                <div className='flex flex-row items-center'>
                                                                    <div style={styles.originalPrice}>${item.originalPrice}</div>
                                                                    <div style={styles.discountedPrice}>${item.discountPrice}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    }
                                </div>


                                {
                                    subscribePlanLoader ?
                                        <div className='flex flex-row items-center justify-center h-[50px]'>
                                            <CircularProgress size={30} />
                                        </div> :
                                        <button
                                            className='bg-purple text-white w-full rounded-xl mt-6 mb-6' style={{ ...styles.headingStyle, height: "50px", }}
                                            onClick={() => {

                                                const screenWidth = window.innerWidth; // Get current screen width
                                                const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px

                                                if (togglePlan2) {
                                                    handleSubScribePlan()
                                                } else {
                                                    if (screenWidth <= SM_SCREEN_SIZE) {
                                                        console.log("This is a small size screen");
                                                        router.push("/createagent/desktop")
                                                    } else {
                                                        console.log("This is a large size screen");
                                                        handleContinue();
                                                    }
                                                }

                                            }}
                                        >
                                            Continue
                                        </button>
                                }


                                {/* Can be use full to add shadow */}
                                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                            </div>
                        </div>
                    </Box>
                </Modal>


            </div>
        </div>
    )
}

export default CreatAgent3;
