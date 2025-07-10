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

const TwilioTrustHub = () => {

    useEffect(() => {
        getBusinessProfile();
    }, []);

    const [twilioHubData, setTwilioHubData] = useState(null);
    const [profileStatus, setProfileStatus] = useState(true);
    const [loader, setLoader] = useState(false);

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

    return (
        <div
            className="w-full flex flex-col items-start px-8 py-2 h-screen overflow-y-auto"
            style={{
                paddingBottom: "50px",
                scrollbarWidth: "none", // For Firefox
                WebkitOverflowScrolling: "touch",
            }}>
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

            {
                loader ? (
                    <div className='w-full flex flex-row items-center justify-center mt-6'>
                        <CircularProgress size={35} />
                    </div>
                ) : (
                    <div>
                        <div className='w-full mt-2'>
                            <CustomerProfile
                                twilioHubData={twilioHubData?.profile}
                                getProfileData={getBusinessProfile}
                                profileStatus={profileStatus}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <CenamDetails
                                twilioHubData={twilioHubData?.cnam}
                                getProfileData={getBusinessProfile}
                                profileStatus={profileStatus}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <StirDetails
                                twilioHubData={twilioHubData?.shakenStir}
                                getProfileData={getBusinessProfile}
                                profileStatus={profileStatus}
                            />
                        </div>
                        <div className='w-full mt-4'>
                            <VoiceIntegrityDetails
                                twilioHubData={twilioHubData?.voiceIntegrity}
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
