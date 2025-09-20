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
import { getUserLocalData } from '../constants/constants'
import TwillioUpgradeView from './TwillioUpgradeView'

const TwilioTrustHub = ({
    isFromAgency,
    hotReloadTrustProducts,
    setHotReloadTrustProducts,
    removeTrustHubData,
    setRemoveTrustHubData,
    selectedUser
}) => {

    useEffect(() => {
        console.log("Should triger the get businessprofile api");
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
    const [isFreePlan, setIsFreePlan] = useState(false)


    useEffect(() => {
        let data = getUserLocalData()
        if (data) {
            let isFree = !data.user.plan.price ? true : false
            setIsFreePlan(isFree)
            console.log('isFree', isFree)
        }


    }, [])

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
            if (typeof setRemoveTrustHubData === "function") {
                setRemoveTrustHubData(false);
            }
        }
    }, [removeTrustHubData]);

    //get the twilio profile details
    const getBusinessProfile = async (isPolling = false, d = null) => {
        console.log("Get business profile trigered")
        if (typeof setHotReloadTrustProducts === "function") {
            setHotReloadTrustProducts(false);
        }
        console.log("Check 1");
        try {
            console.log("Check 2");
            // Only show loader on initial load, not during polling
            if (!twilioHubData && !isPolling) {
                setLoader(true);
                console.log("Check 3");
            }
            console.log("Check 4");
            const token = AuthToken();
            console.log("Check 5");
            let ApiPath = Apis.getBusinessProfile;
            console.log("Check 6");
            if (selectedUser) {
                ApiPath = `${Apis.getBusinessProfile}?userId=${selectedUser.id}`
            }
            console.log("Api path for get twilio details is", ApiPath);
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
                console.log("Response of get business profile is", response.data);
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
            if (typeof setHotReloadTrustProducts === "function") {
                setHotReloadTrustProducts(false);
            }
            console.log("Error occured in getBusinessProfile api is", error);
        }
    }

    //disconnect the twilio profile
    const handleDisconnectTwilio = async () => {
        try {
            setDisConnectLoader(true);
            const token = AuthToken();
            let ApiPath = Apis.disconnectTwilio;
            console.log("Selected user passed in twilio is", Boolean(selectedUser));
            if (selectedUser) {
                ApiPath = `${Apis.disconnectTwilio}`
            }
            console.log("Apipath fr disconnect twilio is", ApiPath);
            let ApiData = {};
            if (selectedUser) {
                ApiData = {
                    userId: selectedUser.id
                }
            }
            const response = await axios.post(ApiPath, ApiData, {
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
        isFreePlan ? (
            <TwillioUpgradeView />
        ) : (
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
                                    selectedUser={selectedUser}
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
                                    selectedUser={selectedUser}
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
                                    selectedUser={selectedUser}
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
                                    selectedUser={selectedUser}
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
                                    selectedUser={selectedUser}
                                />
                            </div>
                        </div>
                    )
                }


            </div >
        )
    )
}

export default TwilioTrustHub
