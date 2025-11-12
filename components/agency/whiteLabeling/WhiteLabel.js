import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import BrandConfig from './BrandConfig';
import DomainConfig from './DomainConfig';
import EmailConfig from './EmailConfig';
import NotificationConfig from './WhiteLabelingCustomNotifications/NotificationConfig';
import TutorialConfig from './TutorialConfig';
import SupportWidgetConfig from './SupportWidgetConfig';
import UPSell from '../integrations/UPSell';
import { copyAgencyOnboardingLink } from '@/components/constants/constants';
import Image from 'next/image';
import AgencyLinkWarning from '@/components/globalExtras/AgencyLinkWarning';
import { UpdateProfile } from '@/components/apis/UpdateProfile';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { useUser } from '@/hooks/redux-hooks';
import getProfileDetails from '@/components/apis/GetProfile';

const WhiteLabel = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedWhiteLabelTabs, setSelectedWhiteLabelTabs] = useState(1);
    
    // Copy Agency Link state
    const [linkCopied, setLinkCopied] = useState(false);
    const [showCopyLinkWarning, setShowCopyLinkWarning] = useState(false);
    const [agencyData, setAgencyData] = useState(null);
    const [copyLinkLoader, setCopyLinkLoader] = useState(false);
    const {user:reduxUser, setUser:setReduxUser} = useUser();
    const [showSnackMessage, setShowSnackMessage] = useState({
        type: SnackbarTypes.Error,
        message: "",
        isVisible: false
    });

    // Fetch local data for Copy Agency Link
    useEffect(() => {
        getLocalData();
    }, []);

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

    // Upgrade copy link
    const upgradeProfile = async () => {
        try {
            let UUIDLink = ""
            const d = localStorage.getItem("User");
            const BasePath =
                process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
                    ? "https://app.assignx.ai/"
                    : "http://dev.assignx.ai/";
            if (d) {
                console.log("Agency uuid link copied check 3")
                const Data = JSON.parse(d);
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
    };

    // Initialize tab from URL parameter
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) {
            const tabNumber = parseInt(tabParam, 10);
            if (tabNumber >= 1 && tabNumber <= 7) {
                setSelectedWhiteLabelTabs(tabNumber);
            }
        }
    }, [searchParams]);

    // Handle tab change and update URL
    const handleTabChange = (tabId) => {
        setSelectedWhiteLabelTabs(tabId);
        // Update URL without page reload
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('tab', tabId.toString());
        router.push(`/agency/dashboard/whitelabel?${newSearchParams.toString()}`, { scroll: false });
    };

    const WhiteLabelTabs = [
        { id: 1, title: "Brand Config" },
        { id: 2, title: "Domain Config" },
        { id: 3, title: "Email Config" },
        { id: 4, title: "Notification Settings" },
        { id: 5, title: "Tutorial Videos" },
        { id: 6, title: "Support widget" },
        { id: 7, title: "Upsell" },
    ];

    return (
        <div className="w-full h-[100svh]">
            <AgentSelectSnackMessage
                isVisible={showSnackMessage.isVisible}
                hide={() => {
                    setShowSnackMessage({ type: SnackbarTypes.Error, message: "", isVisible: false });
                }}
                message={showSnackMessage.message}
                type={showSnackMessage.type}
            />
            <div className="w-full flex flex-row items-center justify-between px-5 py-5 border-b h-[10svh]">
                <div style={styles.semiBoldHeading}>
                    Whitelabel
                </div>
                <div className="flex flex-row items-center gap-2">
                    <NotficationsDrawer />
                </div>
            </div>
            <div className="flex flex-row items-start h-[90svh] relative">
                <div className="w-[20%] px-4 pt-4 h-full border-r flex flex-col">
                    {
                        WhiteLabelTabs.map((item) => {
                            return (
                                <button
                                    key={item.id}
                                    className={`${selectedWhiteLabelTabs === item.id ? "text-purple border-purple bg-purple-100 rounded-lg" : "text-black"} outline-none text-start h-[48px] px-2`}
                                    onClick={() => { handleTabChange(item.id) }}
                                    style={styles.regular}
                                >
                                    {item.title}
                                </button>
                            )
                        })
                    }
                </div>
                <div className="w-[80%] h-full px-4 pt-4 overflow-auto scrollbar-hidden">
                    {selectedWhiteLabelTabs === 1 && (
                        <div className="w-full h-full">
                            <BrandConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 2 && (
                        <div className="w-full h-full">
                            <DomainConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 3 && (
                        <div className="w-full h-full">
                            <EmailConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 4 && (
                        <div className="w-full h-full">
                            <NotificationConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 5 && (
                        <div className="w-full h-full">
                            <TutorialConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 6 && (
                        <div className="w-full h-full">
                            <SupportWidgetConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 7 && (
                        <div className="w-full h-full">
                            <UPSell />
                        </div>
                    )}
                </div>

                {/* Copy Agency Link - Fixed Overlay Panel */}
                <div className="fixed right-4 bg-gray-100 shadow-lg rounded-lg" style={{
                    zIndex: 10,
                    top: 'calc(10svh + 16px)',
                    width: '420px'
                }}>
                    <div className="w-full flex flex-row items-center justify-between px-4 py-4 gap-4">
                        <div className='flex flex-row items-center gap-3 flex-1'>
                            <div className="flex items-center justify-center flex-shrink-0">
                                <Image alt="AssignX Icon" src={"/assets/newAssignX.png"} height={45} width={45} />
                            </div>
                            <div className="flex-1">
                                <div style={{ fontSize: "16px", fontWeight: "bold", color: "#000" }}>
                                    Copy Agency Link
                                </div>
                                <div style={{ fontSize: "12px", fontWeight: "400", color: "#666" }}>
                                    Use this link to sign up users
                                </div>
                            </div>
                        </div>
                        <button
                            className="flex flex-row items-center justify-center gap-2 bg-purple-100/50 rounded-lg px-4 py-2 hover:bg-purple-100/70 transition-colors flex-shrink-0"
                            onClick={() => {
                                if(!reduxUser?.twilio?.twilAuthToken){
                                    setShowSnackMessage({ type: SnackbarTypes.Error, message: "Connect your Twilio first", isVisible: true });
                                    return;
                                }
                                if (reduxUser?.plan?.title !== "Scale" && agencyData?.agencyOnboardingLink === null) {
                                    setShowCopyLinkWarning(true);
                                    upgradeProfile();
                                } else {
                                    copyAgencyOnboardingLink({ setLinkCopied })
                                }
                            }}
                        >
                            <Image alt="*" src={"/assets/copyIconPurple.png"} height={16} width={16} />
                            <div className="text-purple" style={{ fontSize: "14px", fontWeight: "500" }}>
                                {linkCopied ? "Link Copied" : "Copy Link"}
                            </div>
                        </button>
                    </div>
                </div>
            </div>
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

export default WhiteLabel;



const styles = {
    semiBoldHeading: {
        fontSize: 22,
        fontWeight: "600"
    },
    regular: {
        fontSize: 15,
        fontWeight: "500"
    },
}
