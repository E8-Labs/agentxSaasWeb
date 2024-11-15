import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import PricingBox from '../test/PricingBox';
import { Box, Modal } from '@mui/material';

const CreatAgent3 = ({ handleContinue }) => {

    const router = useRouter();
    const [togglePlan, setTogglePlan] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(false);
    const [addPaymentPopUp, setAddPaymentPopUp] = useState(false);
    const [addPaymentSuccessPopUp, setAddPaymentSuccessPopUp] = useState(false);

    const handleTogglePlanClick = (id) => {
        if (paymentMethod) {
            setTogglePlan(prevId => (prevId === id ? null : id));
        } else {
            setAddPaymentPopUp(true);
        }
    }

    const handleClose = () => {
        if (addPaymentPopUp) {
            setAddPaymentPopUp(false);
            setAddPaymentSuccessPopUp(true);
        } else if (addPaymentSuccessPopUp) {
            setAddPaymentSuccessPopUp(false);
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
            id: 4,
            title: "AI Outbound/Inbound "
        },
        {
            id: 5,
            title: "Batch Campaign"
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
            fontSize: 15,
            fontWeight: "700"
        },
        cardStyles: {
            fontSize: "14", fontWeight: "500"
        },
        pricingBox: {
            position: 'relative',
            padding: '15px',
            borderRadius: '10px',
            backgroundColor: '#f9f9ff',
            display: 'inline-block',
            width: '100%',
        },
        triangleLabel: {
            position: 'absolute',
            top: '0',
            right: '0',
            width: '0',
            height: '0',
            borderTop: '50px solid #402FFF', // Increased height again for more padding
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
            color: '#8f8f8f',
            fontSize: '16px',
        },
        discountedPrice: {
            color: '#4A4EFF',
            fontWeight: 'bold',
            fontSize: '18px',
            marginLeft: '10px',
        },
        paymentModal: {
            height: "auto",
            bgcolor: "transparent",
            // p: 2,
            mx: "auto",
            my: "50vh",
            transform: "translateY(-55%)",
            borderRadius: 2,
            border: "none",
            outline: "none",
        },
    }

    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-gray-100 rounded-lg w-10/12 h-[90vh] py-4 overflow-auto'>
                {/* header */}
                <Header />
                {/* Body */}
                <div className='flex flex-col items-center px-4 w-full'>
                    <div className='mt-6 w-11/12 sm:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                        Your first 30 minutes are on us!
                    </div>
                    <div className='mt-2 sm:text-[29px]' style={{ fontWeight: "400" }}>
                        Start for free, then pay as you go
                    </div>
                    <div className='flex flex-wrap w-4/12'>
                        {
                            facilities.map((item, index) => (
                                <div key={item.id} className='flex flex-row items-center gap-2 w-1/2 mt-4'>
                                    <div>
                                        <Image src={"/assets/tickMark.png"} height={14} width={17} alt='*' />
                                    </div>
                                    <div style={{ fontWeight: '700', fontSize: 15 }}>
                                        {item.title}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className='w-5/12 flex flex-row items-center justify-center py-3 gap-4 mt-6 mb-8' style={{ backgroundColor: "#402FFF20", borderRadius: "50px" }}>
                        <Image src={"/assets/attachIcon.png"} height={24} width={24} alt='*' />
                        <div className='text-purple' style={styles.giftTextStyle}>
                            Invest in Your Business Growth - Quick Start, Minimal Cost, Maximum Value.
                        </div>
                    </div>

                    {
                        plans.map((item, index) => (
                            <button key={item.id} className='w-5/12 mt-4' onClick={(e) => handleTogglePlanClick(item.id)}>
                                <div style={{ ...styles.pricingBox, border: item.id === togglePlan ? '1px solid #402FFF' : '1px solid #15151540', }}>
                                    <div style={{ ...styles.triangleLabel, borderTopRightRadius: "7px" }}></div>
                                    <span style={styles.labelText}>
                                        {item.planStatus}
                                    </span>
                                    <div className='flex flex-row items-start gap-1' style={styles.content}>
                                        <div className='mt-2'>
                                            <div>
                                                {
                                                    item.id === togglePlan ?
                                                        <Image src={"/assets/checkMark.png"} height={24} width={24} alt='*' /> :
                                                        <Image src={"/assets/unCheck.png"} height={24} width={24} alt='*' />
                                                }
                                            </div>
                                        </div>
                                        <div className='w-full'>
                                            <div style={{ color: "#151515", fontSize: 24, fontWeight: "700" }}>
                                                {item.mints}mins | Approx {item.calls} Calls
                                            </div>
                                            <div className='flex flex-row items-center justify-between'>
                                                <div style={{ color: "#15151590", fontSize: 15, width: "70%", fontWeight: "600" }}>
                                                    {item.details}
                                                </div>
                                                <div className='flex flex-row items-center'>
                                                    <div style={styles.originalPrice}>$45</div>
                                                    <div style={styles.discountedPrice}>$0</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    }

                    <div
                        className='w-5/12 mt-4 flex flex-row items-start gap-2'
                        style={{ borderRadius: "7px", border: "1px solid #15151540", padding: "15px" }}>
                        <Image src={"/assets/diamond.png"} className='mt-2' height={18} width={20} alt='*' />
                        <div>
                            <div style={{ color: "#151515", fontSize: 24, fontWeight: "700" }}>
                                Enterprise plan
                            </div>
                            <div className='flex flex-row items-start justify-between w-full'>
                                <div style={{ color: "#15151565", fontSize: 15, fontWeight: "700", width: "60%" }}>
                                    Custom solution specific to your business. Integrate AgentX into your sales operation.
                                </div>
                                <button className='text-purple pe-8' style={{ fontSize: 16, fontWeight: "700" }}>
                                    Contact Team
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-row items-center gap-4 justify-start w-5/12 mt-6'>
                        <div className='bg-purple flex flex-row items-center justify-center rounded' style={{ height: "24px", width: "24px" }}>
                            <Image src={"/assets/whiteTick.png"} height={8} width={10} alt='*' />
                        </div>
                        <div style={{ color: "#151515", fontSize: 15, fontWeight: "600" }}>
                            I agree to the terms and conditions.
                        </div>
                    </div>

                    <button
                        className='w-5/12 bg-purple rounded-lg text-white h-[50px] mt-6'
                        style={{ fontSize: 16, fontWeight: "700" }}
                        onClick={handleContinue}
                    >
                        Claim 30 mins
                    </button>

                    {/* Add Payment Modal */}
                    <Modal
                        open={addPaymentPopUp}
                        closeAfterTransition
                        BackdropProps={{
                            timeout: 1000,
                            sx: {
                                backgroundColor: "#00000020",
                                // backdropFilter: "blur(20px)",
                            },
                        }}
                    >
                        <Box className="lg:w-8/12 sm:w-full w-8/12" sx={styles.paymentModal}>
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
                                    <div className='text-center mt-2' style={{ fontWeight: "700", fontSize: 24 }}>
                                        Start for Free. Then Pay as you go!
                                    </div>

                                    <div className='text-center mt-4' style={styles.headingStyle}>
                                        Payment starts after your free 30 mins
                                    </div>

                                    <div className='mt-4' style={styles.cardStyles}>
                                        Card number
                                    </div>
                                    <input type='number' className='outline-none border rounded-lg w-full p-2 mt-2' style={styles.cardStyles} placeholder='1212 1212 1212 1212' maxLength={16} />

                                    <div className='flex flex-row gap-2 mt-4'>
                                        <div className='w-6/12'>
                                            <div style={styles.cardStyles}>
                                                Expiry
                                            </div>
                                            <input type='number' className='outline-none border rounded-lg w-full p-2 mt-2' style={styles.cardStyles} placeholder='MM / YY' maxLength={6} />
                                        </div>
                                        <div className='w-6/12'>
                                            <div style={styles.cardStyles}>
                                                Card number
                                            </div>
                                            <input type='number' className='outline-none border rounded-lg w-full p-2 mt-2' style={styles.cardStyles} placeholder='CVC' maxLength={3} />
                                        </div>
                                    </div>

                                    <div className='mt-4' style={styles.cardStyles}>
                                        Postal Code
                                    </div>
                                    <input type='number' className='outline-none border rounded-lg w-full p-2 mt-2' style={styles.cardStyles} placeholder='48530' maxLength={5} />

                                    <div className='mt-4' style={styles.cardStyles}>
                                        AgentX Code (optional)
                                    </div>
                                    <input type='number' className='outline-none border rounded-lg w-full p-2 mt-2' style={styles.cardStyles} placeholder='Enter the code here' maxLength={16} />

                                    <button className='bg-purple text-white w-full rounded-xl mt-12' style={{ ...styles.headingStyle, height: "50px" }} onClick={handleClose}>
                                        Continue
                                    </button>

                                    {/* Can be use full to add shadow */}
                                    {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                </div>
                            </div>
                        </Box>
                    </Modal>

                    {/* Add Payment Success Modal */}
                    <Modal
                        open={addPaymentSuccessPopUp}
                        closeAfterTransition
                        BackdropProps={{
                            timeout: 1000,
                            sx: {
                                backgroundColor: "#00000020",
                                // backdropFilter: "blur(20px)",
                            },
                        }}
                    >
                        <Box className="lg:w-8/12 sm:w-full w-8/12" sx={styles.paymentModal}>
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
                                    <div className='mt-4 flex flex-row justify-center w-full'>
                                        <Image src={"/assets/successTick.png"} height={85} width={85} alt='*' />
                                    </div>
                                    <div className='text-center mt-4' style={{ fontWeight: "700", fontSize: 24 }}>
                                        Payment Successful
                                    </div>

                                    <button className='bg-purple text-white w-full rounded-xl mt-6 mb-6' style={{ ...styles.headingStyle, height: "50px" }} onClick={handleContinue}>
                                        Continue
                                    </button>

                                    {/* Can be use full to add shadow */}
                                    {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                </div>
                            </div>
                        </Box>
                    </Modal>

                </div>
            </div>
        </div>
    )
}

export default CreatAgent3;
