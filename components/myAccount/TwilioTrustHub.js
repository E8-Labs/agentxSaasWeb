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
import { PersistanceKeys } from '@/constants/Constants'

const TwilioTrustHub = () => {

    useEffect(() => {
        getBusinessProfile();
    }, []);

    const [twilioHubData, setTwilioHubData] = useState(null);
    const [profileStatus, setProfileStatus] = useState(true);
    const [loader, setLoader] = useState(false);
    const [disconnectLoader, setDisConnectLoader] = useState(false);
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

    //get the twilio profile details
    const getBusinessProfile = async () => {
        try {
            setLoader(true);
            const token = AuthToken();
            const ApiPath = Apis.getBusinessProfile;
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                setLoader(false);
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
            }
        } catch (error) {
            setLoader(false);
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
            className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto"
            style={{
                paddingBottom: "50px",
                scrollbarWidth: "none", // For Firefox
                WebkitOverflowScrolling: "touch",
            }}>

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
                                getProfileData={getBusinessProfile}
                                profileStatus={profileStatus}
                                disconnectLoader={disconnectLoader}
                                handleDisconnectTwilio={handleDisconnectTwilio}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <CenamDetails
                                businessProfileData={twilioHubData?.profile}
                                twilioHubData={twilioHubData?.cnam}
                                trustProducts={twilioHubData?.trustProducts}
                                getProfileData={getBusinessProfile}
                                profileStatus={profileStatus}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <StirDetails
                                businessProfileData={twilioHubData?.profile}
                                twilioHubData={twilioHubData?.shakenStir}
                                trustProducts={twilioHubData?.trustProducts}
                                getProfileData={getBusinessProfile}
                                profileStatus={profileStatus}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <VoiceIntegrityDetails
                                businessProfileData={twilioHubData?.profile}
                                twilioHubData={twilioHubData?.voiceIntegrity}
                                trustProducts={twilioHubData?.trustProducts}
                                getProfileData={getBusinessProfile}
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


        </div>
    )
}

export default TwilioTrustHub
