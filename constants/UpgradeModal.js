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
import { webAgentFeatures, pipelineFeatures, defaultFeatures } from './UpgradeModalFeatures';
import { useUser } from '@/hooks/redux-hooks';

const UpgradeModal = ({
    title,
    subTitle,
    buttonTitle,
    open,
    handleClose,
    onUpgradeSuccess,
    selectedPlan = null, // Pre-selected plan from previous screen
    features = null, // Dynamic features array for different functionalities
    functionality = 'default', // Functionality type to determine which features to use
}) => {


    console.log("SelectedPlan in UpgradeModal is ", selectedPlan)
    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);

    // Get features based on functionality or use provided features
    const getFeaturesByFunctionality = (func) => {
        switch (func) {
            case 'webAgent':
                return webAgentFeatures;
            case 'pipeline':
                return pipelineFeatures;
            case 'smartRefill':
                return webAgentFeatures; //smart refill features are same as web agent features
            default:
                return defaultFeatures;
        }
    };

    // Use provided features, or get features by functionality, or use default
    const allFeatures = features || getFeaturesByFunctionality(functionality);
    
    // Split features into two columns (first 8 and remaining)
    const benifits1 = allFeatures.slice(0, 8);
    const benifits2 = allFeatures.slice(8);

    const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false)
  const { user: reduxUser, setUser: setReduxUser } = useUser();



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
                <Box className="bg-white max-h-[90svh] h-auto overflow-hidden rounded-xl w-11/12 sm:w-10/12 md:w-8/12 lg:w-5/12 xl:w-5/12 2xl:w-4/12 border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{

                        scrollbarWidth: "none",
                    }}
                >
                    <div className="w-full ">

                        <div
                            className="w-full h-[80vh] flex flex-col items-center pb-6 justify-between border"
                            style={{
                                backgroundImage: "url('/otherAssets/gradientBg.png')",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                // borderRadius:'20px'
                            }}
                        >
                            <div className='w-full flex flex-col items-center justify-center px-8 pt-4 overflow-y-auto max-h-[80vh]'>
                                <div className='w-full flex flex-row items-start justify-end'>
                                    <CloseBtn
                                        onClick={
                                            handleClose
                                        }
                                    />
                                </div>
                                <div className="flex flex-row items-center justify-center gap-4">
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
                                    className=""
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
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className='w-full flex flex-col items-center justify-center'>
                                <button
                                    className="h-[54px] w-[20vw] rounded-xl bg-purple text-white text-center flex flex-row items-center justify-center"
                                    style={{ fontSize: "15px", fontWeight: "500" }}
                                    onClick={() => {
                                        setShowUpgradePlanPopup(true)
                                    }}
                                >
                                    Upgrade
                                </button>

                                <button className='text-purple mt-4'
                                    style={{ fontSize: "15px", fontWeight: "500" }}
                                    onClick={handleClose}
                                >
                                    {buttonTitle}
                                </button>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>


            <Elements stripe={stripePromise}>
                <UpgradePlan
                    open={showUpgradePlanPopup}
                    selectedPlan={selectedPlan} // Pass the pre-selected plan
                    handleClose={async (upgradeResult) => {
                        setShowUpgradePlanPopup(false)
                        handleClose()
                        // If upgrade was successful, call the success callback
                        // The upgradeResult indicates success but doesn't contain profile data
                        if (upgradeResult && onUpgradeSuccess) {
                            console.log('🎉 [UPGRADE-MODAL] Upgrade successful, calling success callback');
                            await onUpgradeSuccess()
                        }
                    }}
                    plan={selectedPlan}
                    currentFullPlan={reduxUser?.user?.plan}
                    setSelectedPlan={()=>{}}
                />
            </Elements>
        </div>
    )
}

export default UpgradeModal