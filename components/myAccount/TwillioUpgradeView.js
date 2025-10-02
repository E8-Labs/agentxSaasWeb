import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import UpgradePlan from '../userPlans/UpgradePlan'
import { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage'
import AgentSelectSnackMessage from '../dashboard/leads/AgentSelectSnackMessage'
// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function TwillioUpgradeView() {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showUnlockPremiumFeaturesBtn, setShowUnlockPremiumFeaturesBtn] = useState(false);
    const [showSnackMsg, setShowSnackMsg] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });
    //store local user data
    let localUserData = null;

    useEffect(() => {
        fetchLocalUserData();
        const Data = localUserData?.agencyCapabilities
        if (localUserData?.userRole === "AgencySubAccount") {
            if (title === "Enable Live Transfer") {
                if (!Data?.allowTwilioIntegration) {
                    setShowUnlockPremiumFeaturesBtn(true);
                }
            }
        }
    }, [localUserData]);

    const fetchLocalUserData = (attempt = 1, maxAttempts = 5) => {

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


    return (
        <div className='flex flex-col items-center h-full'>
            <div className='flex flex-col items-start w-full p-6'>
                <AgentSelectSnackMessage
                    message={showSnackMsg.message}
                    type={showSnackMsg.type}
                    isVisible={showSnackMsg.isVisible}
                    hide={() => setShowSnackMsg({ type: null, message: "", isVisible: false })}
                />
                <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
                    Twilio Trust Hub
                </div>
                <div
                    style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#00000090",
                    }}
                >
                    {"Account > Twilio"}
                </div>
            </div>
            <div className="w-[90%]  mt-8 flex h-[40vh] bg-white shadow-lg flex-col items-center justify-center gap-5">
                <Image
                    src={"/otherAssets/starsIcon2.png"}
                    height={24} width={24} alt='*'
                />

                <div className='text-lg font-semibold '>
                    Enable Twilio
                </div>

                <div className='text-base font-normal text-center'>
                    Import your Twilio phone numbers and access all <br /> Trust Hub features to increase answer rate.
                </div>

                {
                    showUnlockPremiumFeaturesBtn ? (
                        <button
                            className='px-6 py-3 rounded-lg bg-purple text-base font-semibold text-white'
                            onClick={() => {
                                alert("Request Feature from Agency")
                                console.warn("Request Feature from Agency")
                            }}
                        >
                            Request Feature
                        </button>
                    ) : (
                        <button
                            className='px-6 py-3 rounded-lg bg-purple text-base font-semibold text-white'
                            onClick={() => setShowUpgradeModal(true)}
                        >
                            Upgrade
                        </button>
                    )
                }
            </div>

            {/* Upgrade Plan Modal */}
            <Elements stripe={stripePromise}>
                <UpgradePlan
                    open={showUpgradeModal}
                    handleClose={() => setShowUpgradeModal(false)}
                    plan={null}
                    currentFullPlan={null}
                    // setShowSnackMsg={setShowSnackMsg}
                />
            </Elements>
        </div>
    )
}

export default TwillioUpgradeView