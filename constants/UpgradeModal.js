import { Box, Modal, Slider } from '@mui/material';
import React, { useState } from 'react';
import { styled } from "@mui/material/styles";
import Image from 'next/image';
import CloseBtn from '@/components/globalExtras/CloseBtn';
import UpgradePlan from '@/components/userPlans/UpgradePlan';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import getProfileDetails from '@/components/apis/GetProfile';

const UpgradeModal = ({
    title,
    subTitle,
    buttonTitle,
    open,
    handleClose,
}) => {


    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);



    const benifits1 = [
        { id: 1, title: "More Mins of AI Credits", subTitle: "" },
        { id: 2, title: "Unlimited Agents", subTitle: "" },
        { id: 3, title: "Unlimited Team", subTitle: "" },
        { id: 4, title: "LLMs", subTitle: "(AgentX, OpenAI, Llama, Gemini)" },
        { id: 5, title: "AI Powered CRM", subTitle: "(Copilot)" },
        { id: 6, title: "Lead Enrichment", subTitle: "(Perplexity)" },
        { id: 7, title: "10,000+ Integrations", subTitle: "(Zapier + Make)" },
        { id: 8, title: "Custom Voicemails", subTitle: "" },
    ];

    const benifits2 = [
        { id: 1, title: "Geo-Based Phone Number Access", subTitle: "" },
        { id: 2, title: "DNC Check", subTitle: "" },
        { id: 3, title: "Lead Source", subTitle: "(Coming soon)" },
        { id: 4, title: "AI Powered Message", subTitle: "(Coming soon)" },
        { id: 5, title: "AI Powered Email", subTitle: "" },
        { id: 6, title: "Zoom Support", subTitle: "" },
        { id: 7, title: "Priority Support", subTitle: "(Email/SMS)" },
        { id: 8, title: "Tech Support", subTitle: "" },
    ];

    const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false)


    return (
        <div className='w-full'>
            <Modal
                open={open}
            // onClose={handleClose()}
            //     handleResetValues();
            //     handleClose("");
            // }}
            >
                {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
                <Box className="bg-white m-h-[90svh] overflow-auto rounded-xl w-7/12 border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-full">
                        <div className='w-full flex flex-col items-center justify-center px-8 pt-4'>
                            <div className='w-full flex flex-row items-start justify-end'>
                                <CloseBtn
                                    onClick={
                                        handleClose
                                    }
                                />
                            </div>
                            <div className="flex flex-row items-center">
                                <div
                                    className="text-purple"
                                    style={{ fontSize: "29px", fontWeight: "700" }}
                                >
                                    {title}
                                </div>
                                <Image
                                    alt="*"
                                    src={"/otherAssets/starsIcon2.png"}
                                    height={28}
                                    width={26}
                                />
                            </div>
                            <div
                                className="mt-4"
                                style={{ fontSize: "13px", fontWeight: "400", color: "#00000050" }}>
                                {subTitle}
                            </div>
                            <div className="mt-4 w-full text-start" style={{ fontSize: "18px", fontWeight: "700" }}>
                                {`What You’ll Get`}
                            </div>
                            <div className='w-full flex flex-row items-start mt-4'>
                                <div className="w-1/2 flex flex-col gap-4">
                                    {
                                        benifits1.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-row items-center gap-4"
                                            >
                                                <Image
                                                    alt='*'
                                                    src={"/otherAssets/simpleTick.png"}
                                                    height={16}
                                                    width={16}
                                                />
                                                <div style={{ fontSize: "15px", fontWeight: "500" }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: "13px", fontWeight: "400", color: "#8A8A8A" }}>
                                                    {item.subTitle}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="w-1/2 flex flex-col gap-4">
                                    {
                                        benifits2.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex flex-row items-center gap-4"
                                            >
                                                <Image
                                                    alt='*'
                                                    src={"/otherAssets/simpleTick.png"}
                                                    height={16}
                                                    width={16}
                                                />
                                                <div style={{ fontSize: "15px", fontWeight: "500" }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: "13px", fontWeight: "400", color: "#8A8A8A" }}>
                                                    {item.subTitle}
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                        <div
                            className="w-full h-[200px] flex flex-col items-center pb-6 justify-end"
                            style={{
                                backgroundImage: "url('/otherAssets/gradientBg.png')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                // borderRadius:'20px'
                            }}
                        >
                            <button
                                className="h-[54px] w-[20vw] rounded-xl bg-purple text-white text-center flex flex-row items-center justify-center"
                                style={{ fontSize: "15px", fontWeight: "500" }}
                                onClick={() => {
                                    setShowUpgradePlanPopup(true)
                                }}
                            >
                                Upgrade
                            </button>

                            <button className='text-purple mt-4 pb-8'
                                style={{ fontSize: "15px", fontWeight: "500" }}
                                onClick={handleClose}
                            >
                                {buttonTitle}
                            </button>
                        </div>
                    </div>
                </Box>
            </Modal>


            <Elements stripe={stripePromise}>
                <UpgradePlan
                    open={showUpgradePlanPopup}
                    handleClose={() => {
                        setShowUpgradePlanPopup(false)
                    }}


                />
            </Elements>
        </div>
    )
}

export default UpgradeModal