import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import PricingBox from '../test/PricingBox';

const CreatAgent3 = ({ handleContinue }) => {

    const router = useRouter();
    const [togglePlan, setTogglePlan] = useState(false);

    const handleTogglePlanClick = (id) => {
        setTogglePlan(prevId => (prevId === id ? null : id))
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

                </div>
            </div>
        </div>
    )
}

export default CreatAgent3;
