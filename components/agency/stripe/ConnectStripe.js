"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { PersistanceKeys } from '@/constants/Constants';
import getProfileDetails from '@/components/apis/GetProfile';
import { getStripeLink } from '@/components/onboarding/services/apisServices/ApiService';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import StripeDetailsCard from './StripeDetailsCard';

const ConnectStripe = ({ fullScreen = false }) => {

    const router = useRouter();
    const [loader, setLoader] = useState(false);
    const [checkStripeStatus, setCheckStripeStatus] = useState(false);
    const [checkStripeStatusLoader, setCheckStripeStatusLoader] = useState(false);
    const [agencydata, setAgencyData] = useState(null);
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Warning);

    //get the local data
    useEffect(() => {
        // const Data = localStorage.getItem("User");
        // if (Data) {
        //     const LD = JSON.parse(Data);
        //     if (LD) {
        //         setAgencyData(LD.user);
        //         console.log("Agency data from localstorge is", LD.user);
        //     }
        // }
        checkStripe();
    }, [])

    const checkStripe = async () => {
        try {
            setCheckStripeStatusLoader(true);
            const agencyProfile = await getProfileDetails();
            const stripeStatus = agencyProfile?.data?.data?.canAcceptPaymentsAgencyccount;
            setAgencyData(agencyProfile?.data?.data);
            setCheckStripeStatus(stripeStatus);
            setCheckStripeStatusLoader(false);
        } catch (error) {
            setCheckStripeStatusLoader(false);
            console.log("Eror in gettin stripe status", error)
        }
    }

    const handleVerifyClick = async () => {
        // Open popup immediately on user click to avoid popup blocker
        const popupWindow = window.open('about:blank', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

        // Show loading message in popup
        if (popupWindow) {
            popupWindow.document.write('<html><body><div style="text-align:center;margin-top:50px;"><h2>Connecting to Stripe...</h2><p>Please wait while we redirect you to Stripe Connect.</p></div></body></html>');
        }

        await getStripeLink(setLoader, popupWindow);
        // try {
        //     setLoader(true);
        //     const data = await getProfileDetails();
        //     console.log("Working");
        //     if (data) {
        //         const D = data.data.data
        //         console.log("Getprofile data is", D);
        //         if (D.plan) {
        //             const Token = AuthToken();
        //             const ApiPath = Apis.createOnboardingLink;
        //             const response = await axios.post(ApiPath, null, {
        //                 headers: {
        //                     "Authorization": "Bearer " + Token
        //                 }
        //             });
        //             if (response) {
        //                 console.log("Route user to connect stripe");
        //                 console.log("Payment link is", response.data.data.url);
        //                 window.open(response.data.data.url, "_blank");
        //                 setLoader(false);
        //             }
        //             // router.push("/agency/verify")
        //         } else {
        //             console.log("Need to subscribe plan");
        //             const d = {
        //                 subPlan: false
        //             }
        //             localStorage.setItem(PersistanceKeys.LocalStorageSubPlan, JSON.stringify(d));
        //             router.push("/agency/onboarding");
        //         }
        //     }
        // } catch (error) {
        //     setLoader(false);
        //     console.error("Error occured  in getVerify link api is", error);
        // }
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
            className={`w-full flex flex-row items-center justify-center ${fullScreen ? "h-screen" : ""}`}
        // style={{
        //     height: '100svh',
        //     width: '100%',
        //     backgroundImage: "url('/agencyIcons/congratsBg.jpg')",
        //     backgroundSize: "cover",
        //     backgroundPosition: "center",
        //     alignItems: 'center',
        //     justifyContent: 'center',
        // }}
        >
            <AgentSelectSnackMessage
                isVisible={snackMsg !== null}
                message={snackMsg}
                hide={() => {
                    setSnackMsg(null);
                }}
                type={snackMsgType}
            />
            <div className='h-full w-full flex flex-row items-center justify-center'>
                {
                    checkStripeStatusLoader ? (
                        <CircularProgress size={30} />
                    ) : (
                        <div className='h-full w-full flex flex-row items-center justify-center'>
                            {
                                checkStripeStatus ? (
                                    <StripeDetailsCard
                                        stripeData={agencydata?.stripeAccount}
                                        fromDashboard={false}
                                    />
                                ) : (
                                    <div className={`w-[28rem] rounded-2xl shadow-lg bg-white border border-gray-200 ${fullScreen ? "" : "mt-6"}`}>
                                        <div
                                            className="w-full flex flex-row items-start justify-end rounded-t-2xl h-[200px]"
                                            style={{
                                                backgroundImage: "url('/agencyIcons/stripeNotConnected.png')",///agencyIcons/subAccBg.jpg
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                // borderRadius:'20px'
                                            }}
                                        >
                                            <button className='bg-white p-2 rounded-full px-2 py-1 mt-4 me-4 flex flex-row items-center justify-center'>
                                                <Image
                                                    alt="*"
                                                    src={"/agencyIcons/redDot.png"}
                                                    height={20}
                                                    width={20}
                                                />
                                                <p className="text-black" style={{ fontSize: "12px", fontWeight: "400" }}>Not Connected</p>
                                            </button>
                                        </div>
                                        {/*
                                            <img
                                                alt="*"
                                                src={"/agencyIcons/stripeNotConnected.png"}
                                                className="rounded-t-2xl"
                                                style={{
                                                    height: "100%", width: "100%", objectFit: "cover",
                                                }}
                                            />
                                        */}
                                        <div className='flex flex-row items-center justify-center' style={{ marginTop: "-35px" }}>
                                            <Image
                                                alt="*"
                                                src={"/agencyIcons/stripeLogo.png"}
                                                height={70}
                                                width={70}
                                            />
                                        </div>
                                        <div className='flex flex-col items-center justify-center p-4'>
                                            <div style={{ fontWeight: "500", fontSize: "15px", color: "#000000" }}>
                                                Your agency account is created.
                                            </div>
                                            <div style={{ fontWeight: "500", fontSize: "15px", color: "#000000" }}>
                                                Lets add your Stripe detail for payouts.
                                            </div>
                                            {
                                                loader ?
                                                    <div className='mt-4'>
                                                        <CircularProgress size={30} />
                                                    </div> :
                                                    <button
                                                        className='bg-purple text-white py-2 px-4 rounded-md w-20vw mt-4 h-[40px]'
                                                        style={styles.btnText}
                                                        onClick={() => {
                                                            if (agencydata?.canAcceptPaymentsAgencyccount) {
                                                                setSnackMsg("Stripe already connected.");
                                                            } else {
                                                                handleVerifyClick();
                                                            }
                                                        }}
                                                    >
                                                        Add Stripe
                                                    </button>
                                            }
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default ConnectStripe
