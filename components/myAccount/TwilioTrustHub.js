import React, { useEffect, useState } from 'react'
import CustomerProfile from '../twiliohub/getProfile/CustomerProfile'
import CenamDetails from '../twiliohub/getProfile/CenamDetails'
import StirDetails from '../twiliohub/getProfile/StirDetails'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import axios from 'axios'
import VoiceIntegrityDetails from '../twiliohub/getProfile/VoiceIntegrityDetails'
import BrandedCallsDetails from '../twiliohub/getProfile/BrandedCallsDetails'
import Ap2MessagingDetails from '../twiliohub/getProfile/Ap2MessagingDetails'
import { CircularProgress } from '@mui/material'
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage'
import { HowtoVideos, PersistanceKeys } from '@/constants/Constants'
import IntroVideoModal from '../createagent/IntroVideoModal'
import Image from 'next/image'

const TwilioTrustHub = ({
    isFromAgency,
    hotReloadTrustProducts,
    setHotReloadTrustProducts,
    removeTrustHubData,
    setRemoveTrustHubData
}) => {

    useEffect(() => {
        getBusinessProfile();

        // Start polling every 6 seconds (silent polling)
        const interval = setInterval(() => {
            getBusinessProfile(true);
        }, 3000);

        setPollingInterval(interval);

        // Cleanup on unmount
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, []);

    const [twilioHubData, setTwilioHubData] = useState(null);
    const [profileStatus, setProfileStatus] = useState(true);
    const [loader, setLoader] = useState(false);
    const [disconnectLoader, setDisConnectLoader] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

    //triger the get business profile
    useEffect(() => {
        console.log("Hot reload status for getBusiness profile", hotReloadTrustProducts);
        if (hotReloadTrustProducts) {
            getBusinessProfile();
        }
    }, [hotReloadTrustProducts]);

    //remove trust hub data
    useEffect(() => {
        if (removeTrustHubData) {
            setTwilioHubData(null);
            setProfileStatus(true);
            setRemoveTrustHubData(false);
        }
    }, [removeTrustHubData]);

    //get the twilio profile details
    const getBusinessProfile = async (isPolling = false, d = null) => {
        setHotReloadTrustProducts(false);
        try {
            // Only show loader on initial load, not during polling
            if (!twilioHubData && !isPolling) {
                setLoader(true);
            }
            const token = AuthToken();
            const ApiPath = Apis.getBusinessProfile;
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                // Only hide loader if it was shown (not during polling)
                if (!isPolling) {
                    setLoader(false);
                }
                console.log("Response og get business profile is", response.data);
                const ApiResponse = response.data
                if (ApiResponse.status === true) {
                    setTwilioHubData(ApiResponse.data);
                    const twilioHubData = PersistanceKeys.twilioHubData;
                    localStorage.setItem(twilioHubData, JSON.stringify(ApiResponse.data));
                    if (ApiResponse?.data?.profile?.status === "twilio-approved") {
                        setProfileStatus(false);
                    }
                }
                if (d) {
                    console.log("show snack in get profile", d)
                    setShowSnack({
                        message: d.message,
                        isVisible: true,
                        type: SnackbarTypes.Success,
                    });
                }
            }
        } catch (error) {
            // Only hide loader if it was shown (not during polling)
            if (!twilioHubData && !isPolling) {
                setLoader(false);
            }
            setHotReloadTrustProducts(false);
            console.log("Error occured in getBusinessProfile api is", error);
        }
    }

    //disconnect the twilio profile
    const handleDisconnectTwilio = async () => {
        try {
            setDisConnectLoader(true);
            const token = AuthToken();
            const ApiPath = Apis.disconnectTwilio;
            const response = await axios.post(ApiPath, {}, {
                headers: {
                    "Authorization": "Bearer " + token,
                    // "Content-Type": "application/json"
                }
            });
            if (response) {
                console.log("Response of disconnect twilio api is", response);
                const ApiResponse = response.data
                if (ApiResponse.status === true) {
                    localStorage.removeItem(PersistanceKeys.twilioHubData);
                    setShowSnack({
                        message: "Twilio disconnected.",//ApiResponse.message
                        isVisible: true,
                        type: SnackbarTypes.Success,
                    });
                    setTwilioHubData(null);
                    setProfileStatus(true);

                    // Clear polling when disconnected
                    if (pollingInterval) {
                        clearInterval(pollingInterval);
                        setPollingInterval(null);
                    }
                } else {
                    setShowSnack({
                        message: ApiResponse.message,
                        isVisible: true,
                        type: SnackbarTypes.Success,
                    });
                }
                setDisConnectLoader(false);
            }
        } catch (error) {
            setDisConnectLoader(false);
            console.log("Error occured in disconnet twilio api is", error);
        }
    }

    return (
        <div
            className={`${!isFromAgency ? "w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto" : "w-full"}`}
            style={{
                paddingBottom: "50px",
                scrollbarWidth: "none", // For Firefox
                WebkitOverflowScrolling: "touch",
            }
            }>

            <AgentSelectSnackMessage
                type={showSnack.type}
                message={showSnack.message}
                isVisible={showSnack.isVisible}
                hide={() => {
                    setShowSnack({
                        message: "",
                        isVisible: false,
                        type: SnackbarTypes.Success,
                    });
                }}
            />

            {
                loader ? (
                    <div className='w-full flex flex-row items-center justify-center mt-6'>
                        <CircularProgress size={35} />
                    </div>
                ) : (
                    <div className='w-full'>
                        <div className='w-full mt-2'>
                            <CustomerProfile
                                twilioHubData={twilioHubData?.profile}
                                getProfileData={(d) => { getBusinessProfile(d) }}
                                profileStatus={profileStatus}
                                disconnectLoader={disconnectLoader}
                                handleDisconnectTwilio={handleDisconnectTwilio}
                                isFromAgency={isFromAgency}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <CenamDetails
                                businessProfileData={twilioHubData?.profile}
                                twilioHubData={twilioHubData?.cnam}
                                trustProducts={twilioHubData?.trustProducts}
                                // getProfileData={getBusinessProfile}
                                getProfileData={(d) => { getBusinessProfile() }}
                                profileStatus={profileStatus}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <StirDetails
                                businessProfileData={twilioHubData?.profile}
                                twilioHubData={twilioHubData?.shakenStir}
                                trustProducts={twilioHubData?.trustProducts}
                                // getProfileData={getBusinessProfile}
                                getProfileData={(d) => { getBusinessProfile() }}
                                profileStatus={profileStatus}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <VoiceIntegrityDetails
                                businessProfileData={twilioHubData?.profile}
                                twilioHubData={twilioHubData?.voiceIntegrity}
                                trustProducts={twilioHubData?.trustProducts}
                                // getProfileData={getBusinessProfile}
                                getProfileData={(d) => { getBusinessProfile() }}
                                profileStatus={profileStatus}
                            />
                        </div>
                        {/*<div className='w-full mt-4'>
                <BrandedCallsDetails />
            </div>*/}
                        <div className='w-full mt-4'>
                            <Ap2MessagingDetails
                                // twilioHubData={twilioHubData?.voiceIntegrity}
                                businessProfileData={twilioHubData?.profile}
                                profileStatus={profileStatus}
                            />
                        </div>
                    </div>
                )
            }


        </div >
    )
}

export default TwilioTrustHub
