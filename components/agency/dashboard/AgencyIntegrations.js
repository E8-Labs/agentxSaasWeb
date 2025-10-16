import Integrations from '@/components/agency/integrations/Integrations';
import ConnectStripe from '@/components/agency/stripe/ConnectStripe';
import { copyAgencyOnboardingLink } from '@/components/constants/constants';
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import React, { useState, useEffect } from 'react';
import UPSell from '../integrations/UPSell';
import AgencySupportAndWidget from '../integrations/AgencySupportAndWidget';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import AgencyLinkWarning from '@/components/globalExtras/AgencyLinkWarning';
import CustomNotifications from '../integrations/CustomNotifications';
import Apis from '@/components/apis/Apis';
import { UpdateProfile } from '@/components/apis/UpdateProfile';

function AgencyIntegrations({ selectedAgency }) {

    const [currentTab, setCurrentTab] = useState(1);
    const [linkCopied, setLinkCopied] = useState(false);
    //code for copy link one time warning modal
    const [showCopyLinkWarning, setShowCopyLinkWarning] = useState(false);
    //local data
    const [agencyData, setAgencyData] = useState(null);
    //copy link loader
    const [copyLinkLoader, setCopyLinkLoader] = useState(false);

    //fetch local data
    useEffect(() => {
        getLocalData();
    }, [])

    const getLocalData = (retries = 5, delay = 300) => {
        let attempt = 0;

        const tryFetch = () => {
            let data = localStorage.getItem("User");
            if (data) {
                let u = JSON.parse(data);
                setAgencyData(u.user);
                console.log("✅ Data fetched successfully on attempt", attempt + 1);
            } else {
                attempt++;
                if (attempt < retries) {
                    console.warn(`Attempt ${attempt} failed, retrying...`);
                    setTimeout(tryFetch, delay);
                } else {
                    console.error("❌ Failed to fetch User data after 5 attempts");
                }
            }
        };

        tryFetch();
    };

    //upgrade copy link
    const upgradeProfile = async () => {
        try {
            let UUIDLink = ""
            const d = localStorage.getItem("User");
            const BasePath =
                process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
                    ? "https://app.assignx.ai/" //"https://www.blindcircle.com/agentx/"
                    : "http://dev.assignx.ai/";
            // ? "https://app.assignx.ai/" //"https://www.blindcircle.com/agentx/"
            // : "https://agentx-git-test-salman-majid-alis-projects.vercel.app/";
            // console.log("Agency uuid link copied check 2", d)
            if (d) {
                console.log("Agency uuid link copied check 3")
                const Data = JSON.parse(d);
                // console.log("Agency uuid link copied check 4")
                UUIDLink = BasePath + `onboarding/${Data.user.agencyUuid}`
            }
            setCopyLinkLoader(true);
            const apidata = {
                agencyOnboardingLink: UUIDLink
            }
            console.log("Data sending in updatee api is", apidata);
            const response = await UpdateProfile(apidata);
            if (response) {
                if (response.status === true) {
                    getLocalData();
                    setCopyLinkLoader(false);
                    console.log("Update api resopnse before copy link is", response);
                }
            }
        } catch (err) {
            setCopyLinkLoader(false);
            console.log("Eror occured in update profile api is", err)
        }
    }


    const DuplicateButton = dynamic(
        () => import("@/components/animation/DuplicateButton"),
        {
            ssr: false,
        }
    );

    const tabs = [
        {
            id: 1,
            tab: "Twilio"
        },
        {
            id: 2,
            tab: "Stripe"
        },
        {
            id: 3,
            tab: "Upsell"
        },
        {
            id: 4,
            tab: "Support Widget"
        },
        {
            id: 5,
            tab: "Notifications"
        },
    ]

    //handle switch tab
    const handleTabSelection = (tab) => {
        setCurrentTab(tab);
    }

    return (
        <div
            className='flex flex-col items-center w-full h-[100svh] overflow-hidden'
        // style={{
        //     backgroundImage: "url('/agencyIcons/DreamySilkWaves.png')",
        //     backgroundSize: "cover",
        //     backgroundPosition: "center",
        //     height: "100svh",
        //     width: "100%"
        // }}
        >
            <div className='flex w-full flex-row items-center justify-between px-5 py-5 border-b'>

                <div style={{
                    fontSize: 22, fontWeight: '700'
                }}>
                    Integrations
                </div>

                <div className="flex flex-row items-center gap-2">
                    <NotficationsDrawer />
                </div>
            </div>

            <div className='w-full flex flex-row justify-center items-center'>
                <div className="w-full flex flex-row items-center justify-between pt-6 px-4">
                    {/*
                        <div className="flex flex-row items-center gap-4">
                            <button
                                className={`${currentTab === 1 ? "border-purple" : "border-black"} border rounded-full px-4 py-1 outline-none`}
                                onClick={() => { handleTabSelection(1) }}
                            >
                                Twilio
                            </button>
                            <button
                                className={`${currentTab === 2 ? "border-purple" : "border-black"} border rounded-full px-4 py-1 outline-none`}
                                onClick={() => { handleTabSelection(2) }}
                            >
                                Stripe
                            </button>
                        </div>
                    */}
                    <div className='flex flex-row items-center gap-2'>
                        {
                            tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`${currentTab === tab.id ? "text-purple border-b-2 border-purple" : "text-black"} outline-none px-4`}
                                    onClick={() => { handleTabSelection(tab.id) }}
                                >
                                    {tab.tab}
                                </button>
                            ))
                        }
                    </div>
                    {/*
                     <button
                         className="bg-[#845EEE45] border-none outline-none rounded-2xl px-2 py-1"
                         style={{ fontSize: 15, fontWeight: "500", whiteSpace: 'nowrap' }}
                         onClick={() => {
                             copyAgencyOnboardingLink({ setLinkCopied })
                         }}>
                         {linkCopied ? "Link Copied" : "Copy Link"}
                     </button>
                   */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.3 }}
                        className=" w-[420px] bg-white shadow-lg rounded-lg" //fixed top-0 right-0
                    >
                        <div className="w-full flex flex-row items-center justify-between px-4 py-2">
                            <div className='flex flex-row items-center justify-center gap-2'>
                                <Image
                                    alt="*"
                                    src={"/assets/newAssignX.png"}
                                    height={54}
                                    width={54}
                                />
                                <div>
                                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                                        Copy Agency Link
                                    </div>
                                    <div style={{ fontSize: "12px", fontWeight: "400" }}>
                                        Use this link to sign up users
                                    </div>
                                </div>
                            </div>
                            <button
                                className="flex flex-row items-center justify-center gap-2 bg-[#7804DF05] rounded-lg p-2"
                                onClick={() => {
                                    if (agencyData?.plan?.title !== "Scale" && agencyData?.agencyOnboardingLink === null) {
                                        setShowCopyLinkWarning(true);
                                        upgradeProfile();
                                    } else {
                                        copyAgencyOnboardingLink({ setLinkCopied })
                                    }
                                }}
                            >
                                <Image alt="*" src={"/assets/copyIconPurple.png"} height={20} width={20} />
                                <div className="text-purple" style={{ fontSize: "16px", fontWeight: "400" }}>{linkCopied ? "Link Copied" : "Copy Link"}</div>
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {
                currentTab === 1 ? (
                    <Integrations selectedAgency={selectedAgency} />
                ) : currentTab === 2 ? (
                    <div className='pt-6 w-full overflow-auto'
                        style={{
                            msOverflowStyle: "none",   // IE and Edge
                            scrollbarWidth: "none"     // Firefox
                        }}>
                        <style jsx>{`
                            div::-webkit-scrollbar {
                              display: none; /* Chrome, Safari, Opera */
                            }
                          `}</style>
                        <ConnectStripe selectedAgency={selectedAgency} />
                    </div>
                ) : currentTab === 3 ? (
                    <UPSell />
                ) : currentTab === 4 ? (
                    <div className='w-full'>
                        <AgencySupportAndWidget />
                    </div>
                ) : currentTab === 5 ? (
                    <div className='w-full'>
                        <CustomNotifications />
                    </div>
                ) : "No Tab Selected"
            }

            {
                showCopyLinkWarning && (
                    <AgencyLinkWarning
                        open={showCopyLinkWarning}
                        copyLinkLoader={copyLinkLoader}
                        linkCopied={linkCopied}
                        handleClose={() => {
                            setShowCopyLinkWarning(false);
                        }}
                        handleCopyLink={() => {
                            copyAgencyOnboardingLink({ setLinkCopied });
                            setTimeout(() => {
                                setShowCopyLinkWarning(false);
                            }, 500);
                            getLocalData();
                        }}
                        userData={agencyData}
                    />
                )
            }

        </div>
    )
}

export default AgencyIntegrations