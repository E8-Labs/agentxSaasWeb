"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { PersistanceKeys } from '@/constants/Constants';
import getProfileDetails from '@/components/apis/GetProfile';

const Page = () => {

    const router = useRouter();
    const [loader, setLoader] = useState(false);

    const handleVerifyClick = async () => {
        try {
            setLoader(true);
            const data = await getProfileDetails();
            console.log("Working");
            if (data) {
                const D = data.data.data
                console.log("Getprofile data is", D);
                if (D.plan) {
                    const Token = AuthToken();
                    const ApiPath = Apis.createOnboardingLink;
                    const response = await axios.post(ApiPath, null, {
                        headers: {
                            "Authorization": "Bearer " + Token
                        }
                    });
                    if (response) {
                        console.log("Route user to connect stripe");
                        console.log("Payment link is", response.data.data.url);
                        window.open(response.data.data.url, "_blank");
                        setLoader(false);
                    }
                    // router.push("/agency/verify")
                } else {
                    console.log("Need to subscribe plan");
                    const d = {
                        subPlan: false
                    }
                    localStorage.setItem(PersistanceKeys.LocalStorageSubPlan, JSON.stringify(d));
                    router.push("/agency/onboarding");
                }
            }
        } catch (error) {
            setLoader(false);
            console.error("Error occured  in getVerify link api is", error);
        }
    }

    const styles = {
        btnText: {
            fontSize: "15px",
            fontWeight: "500",
            outline: "none",
            border: "none"
        }
    }

    return (
        <div
            className='h-screen w-full flex flex-row items-center justify-center'
            style={{
                height: '100svh',
                width: '100%',
                backgroundImage: "url('/agencyIcons/congratsBg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                alignItems: 'center',
                justifyContent: 'center',
            }}>
            <div className='flex flex-col items-center w-5/12 py-[10svh]  border-2 border-white rounded-xl bg-[#ffffff90]'>
                <div style={{ fontWeight: "600", fontSize: "38px", marginBottom: 20 }}>
                    {`Congrats!`}
                </div>
                <Image
                    className=""
                    src="/agencyIcons/congratsOrb.jpg"
                    // style={{ resize: "contain" }}
                    height={250}
                    width={220}
                    alt="*"
                />
                <div style={{ fontWeight: "700", fontSize: "17px", color: "#000000" }}>
                    Your agency account is created.
                </div>
                <div style={{ fontWeight: "700", fontSize: "17px", color: "#000000" }}>
                    Lets add your Stripe detail for payouts.
                </div>
                {
                    loader ?
                        <div className='mt-16'>
                            <CircularProgress size={30} />
                        </div> :
                        <button
                            className='bg-purple text-white p-2 rounded-md w-20vw mt-16'
                            style={styles.btnText}
                            onClick={() => {
                                handleVerifyClick();
                            }}
                        >
                            Add Stripe Details
                        </button>
                }
            </div>
        </div>
    )
}

export default Page
