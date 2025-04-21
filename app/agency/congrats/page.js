"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { CircularProgress } from '@mui/material';

const Page = () => {

    const router = useRouter();
    const [loader, setLoader] = useState(false);

    const handleVerifyClick = async () => {
        try {
            setLoader(true);
            const data = localStorage.getItem("User");
            console.log("Working");
            if (data) {
                const D = JSON.parse(data);
                if (D.user.plan) {
                    const Token = AuthToken();
                    const ApiPath = Apis.createOnboardingLink;
                    const response = await axios.post(ApiPath, null, {
                        headers: {
                            "Authorization": "Bearer " + Token
                        }
                    });
                    if (response) {
                        console.log("Response of get verify link api is", response);
                        window.open(response.data.data.url, "_blank");
                        setLoader(false);
                    }
                    // router.push("/agency/verify")
                } else {
                    consoSle.log("Need to subscribe plan");
                    const d = {
                        subPlan: false
                    }
                    localStorage.setItem("subPlan", JSON.stringify(d));
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
        <div className='h-screen w-full flex flex-row items-center justify-center'>
            <div className='h-[60vh] flex flex-col items-center'>
                <div style={{ fontWeight: "600", fontSize: "38px", marginBottom: 20 }}>
                    {`Congrats! You’re in!`}
                </div>
                <Image
                    className=""
                    src="/agentXOrb.gif"
                    style={{ height: "142px", width: "152px", resize: "contain" }}
                    height={142}
                    width={142}
                    alt="*"
                />
                <div style={{ fontWeight: "600", fontSize: "16px", color: "#00000070" }}>
                    You are in now!
                </div>
                <div className='mt-4' style={{ fontWeight: "600", fontSize: "17px", color: "#000000" }}>
                    Verify now to explore more
                </div>
                {
                    loader ?
                        <CircularProgress size={30} /> :
                        <button
                            className='bg-purple text-white p-2 rounded-md w-20vw mt-8'
                            style={styles.btnText}
                            onClick={() => {
                                handleVerifyClick();
                            }}
                        >
                            Verify now
                        </button>
                }
            </div>
        </div>
    )
}

export default Page
