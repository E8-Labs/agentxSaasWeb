import React, { useEffect } from 'react'
import CustomerProfile from '../twiliohub/getProfile/CustomerProfile'
import CenamDetails from '../twiliohub/getProfile/CenamDetails'
import StirDetails from '../twiliohub/getProfile/StirDetails'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import axios from 'axios'

const TwilioTrustHub = () => {

    useEffect(() => {
        getBusinessProfile();
    }, [])

    const getBusinessProfile = async () => {
        try {
            const token = AuthToken();
            const ApiPath = Apis.getBusinessProfile;
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response og get business profile is", response.data);
            }
        } catch (error) {
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

            <div className='w-full mt-2'>
                <CustomerProfile />
            </div>
            <div className='w-full mt-4'>
                <CenamDetails />
            </div>
            <div className='w-full mt-4'>
                <StirDetails />
            </div>

        </div>
    )
}

export default TwilioTrustHub
