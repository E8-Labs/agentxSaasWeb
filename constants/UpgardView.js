import getProfileDetails from '@/components/apis/GetProfile';
import UpgradePlan from '@/components/userPlans/UpgradePlan'
import UnlockPremiunFeatures from '@/components/globalExtras/UnlockPremiunFeatures';
import { useUser } from '@/hooks/redux-hooks';
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material';

function UpgardView({
    title,
    subTitle,
    userData,
    onUpgradeSuccess,
    setShowSnackMsg,
    // handleContinue
}) {

    let stripePublickKey =
        process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
            ? process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY_LIVE
            : process.env.NEXT_PUBLIC_REACT_APP_STRIPE_PUBLISHABLE_KEY;
    const stripePromise = loadStripe(stripePublickKey);

    const [showUpgradePlanPopup, setShowUpgradePlanPopup] = useState(false);
    const [showUnlockPremiumFeaturesBtn, setShowUnlockPremiumFeaturesBtn] = useState(false);
    const [showUnlockPremiumFeaturesPopup, setShowUnlockPremiumFeaturesPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user: reduxUser, setUser: setReduxUser } = useUser();
    //store local user data
    let localUserData = null;

    useEffect(() => {
        fetchLocalUserData();
        const Data = localUserData?.agencyCapabilities;
        console.log("Title passed to upgrade view is", title)
        console.log("Plan capabilities in upgrade view is", Data)
        if (localUserData?.userRole === "AgencySubAccount") {
            if (title === "Enable Live Transfer") {
                if (!Data?.allowLiveCallTransfer) {
                    setShowUnlockPremiumFeaturesBtn(true);
                }
            } else if (title === "Unlock Actions") {
                if (!Data?.allowToolsAndActions) {
                    setShowUnlockPremiumFeaturesBtn(true);
                }
            } else if (title === "Unlock Knowledge Base" || title === "Add Knowledge Base") {
                if (!Data?.allowKnowledgeBases) {
                    setShowUnlockPremiumFeaturesBtn(true);
                }
            } else if (title === "Unlock Voicemail" || title === "Enable Voicemail") {
                if (!Data?.allowVoicemail) {
                    setShowUnlockPremiumFeaturesBtn(true);
                }
            }
        }
    }, [localUserData]);

    const fetchLocalUserData = (attempt = 1, maxAttempts = 5) => {
        if (userData) {
            localUserData = userData;
            console.log(`✅ Found userData directly on attempt ${attempt}`);
            return;
        }

        const localStorageUser = localStorage.getItem("User");

        if (localStorageUser) {
            try {
                const Data = JSON.parse(localStorageUser);
                localUserData = Data?.user;

                if (localUserData) {
                    console.log(`✅ Successfully fetched local data on attempt ${attempt}`);
                    return;
                } else {
                    console.warn(`⚠️ localStorage "user" found but invalid on attempt ${attempt}`);
                }
            } catch (error) {
                console.error(`❌ JSON parse failed on attempt ${attempt}:`, error);
            }
        } else {
            console.warn(`⚠️ No localStorage "user" found on attempt ${attempt}`);
        }

        // Retry if not found and attempts remain
        if (attempt < maxAttempts) {
            console.log(`⏳ Retrying... attempt ${attempt + 1} in 300ms`);
            setTimeout(() => fetchLocalUserData(attempt + 1, maxAttempts), 300);
        } else {
            console.error("❌ Max attempts reached. Could not fetch local data.");
        }
    };


    // Function to refresh user data after plan upgrade
    const refreshUserData = async () => {
        try {
            // console.log('🔄 [CREATE-AGENT] Refreshing user data after plan upgrade...');
            const profileResponse = await getProfileDetails();

            if (profileResponse?.data?.status === true) {
                const freshUserData = profileResponse.data.data;
                const localData = JSON.parse(localStorage.getItem("User") || '{}');

                console.log('🔄 [Upgrade view] Fresh user data received after upgrade');
                // Update Redux with fresh data
                setReduxUser({
                    token: localData.token,
                    user: freshUserData
                });

                if (onUpgradeSuccess) {
                    onUpgradeSuccess(freshUserData);
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('🔴 [Upgrade view] Error refreshing user data:', error);
            return false;
        }
    };


    return (
        <>
            {loading ? (
                <CircularProgress size={30} />
            ) : (

                <div
                    className='w-full h-full flex flex-col items-center justify-center px-4 sm:px-6'
                    style={{ gap: 4 }}
                >
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: "clamp(16px, 24px, 30px)",
                            height: "clamp(16px, 24px, 30px)"
                        }}
                    >
                        <Image
                            alt="*"
                            src={"/otherAssets/starsIcon2.png"}
                            fill={false}
                            height={32}
                            width={30}
                            className="flex-shrink-0 object-contain"
                            style={{
                                maxWidth: "100%",
                                height: "auto",
                            }}
                        />
                    </div>

                    {/*
                showUnlockPremiumFeaturesBtn && (
                    <div
                        className='font-semibold text-center'
                        style={{
                            fontSize: "clamp(17px, 22px, 26px)",
                        }}
                    >
                        Contact Your Agency
                    </div>
                )*/}
                    <div
                        className='font-semibold text-center'
                        style={{
                            fontSize: "clamp(10px, 14vw, 18px)",
                        }}
                    >
                        {title}
                    </div>
                    <div
                        className='font-normal text-center w-full sm:w-[85%] md:w-[75%] leading-relaxed max-w-2xl'
                        style={{
                            fontSize: "clamp(10px, 14px, 18px)",
                            lineHeight: "1.5"
                        }}
                    >
                        {subTitle}
                    </div>

                    {
                        showUnlockPremiumFeaturesBtn ? (
                            <button
                                className='flex flex-col text-white items-center justify-center w-[60%] sm:w-[50%] md:w-[45%] bg-purple rounded-lg font-medium hover:bg-purple/90 transition-colors shadow-lg hover:shadow-xl mt-4'
                                style={{
                                    height: "clamp(35px, 45px, 55px)",
                                    fontSize: "clamp(10px, 13px, 16px)"
                                }}
                                onClick={() => {
                                    setShowUnlockPremiumFeaturesPopup(true)
                                }}
                            >
                                Request Feature
                            </button>
                        ) : (
                            <button
                                className='flex flex-col text-white items-center justify-center w-[60%] sm:w-[50%] md:w-[45%] bg-purple rounded-lg font-medium hover:bg-purple/90 transition-colors shadow-lg hover:shadow-xl mt-4'
                                style={{
                                    height: "clamp(35px, 45px, 55px)",
                                    fontSize: "clamp(10px, 13px, 16px)"
                                }}
                                onClick={() => {
                                    setShowUpgradePlanPopup(true)
                                }}
                            >
                                Upgrade Plan
                            </button>
                        )
                    }

                    <UnlockPremiunFeatures
                        title={title}
                        open={showUnlockPremiumFeaturesPopup}
                        handleClose={() => {
                            setShowUnlockPremiumFeaturesPopup(false)
                        }}
                    />


                    <Elements stripe={stripePromise}>
                        <UpgradePlan
                            open={showUpgradePlanPopup}
                            // setShowSnackMsg={setShowSnackMsg}
                            setSelectedPlan={() => {
                                console.log("setSelectedPlan is called")
                            }}
                            handleClose={async (data) => {
                                setShowUpgradePlanPopup(false)
                                if (data) {
                                    setLoading(true)
                                    await refreshUserData();
                                    setLoading(false)
                                }
                                // handleContinue()
                            }}


                        />
                    </Elements>




                </div>
            )}
        </>
    )
}

export default UpgardView