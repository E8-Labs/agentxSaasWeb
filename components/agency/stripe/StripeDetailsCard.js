"use client";
import React, { useState } from "react";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import { CircularProgress } from "@mui/material";
import { AuthToken } from "../plan/AuthDetails";

export default function StripeDetailsCard({
    stripeData
}) {

    const [loader, setLoader] = useState(false);
    const handleViewStripeAccount = async () => {

        try {
            setLoader(true);

            console.log("stripeData", stripeData);

            const path = Apis.createStripeLoginLink;


            console.log("path", path);
            const response = await axios.post(path, {
                accountId: stripeData?.id
            }, {
                headers: {
                    "Authorization": "Bearer " + AuthToken(),
                    "Content-Type": "application/json"
                }
            });
            if (response) {

                console.log("response", response);

                console.log("response.data.url", response);
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.opener = null;
                    newWindow.location = response.data.url;
                } else {
                    // fallback if popup blocked
                    window.location.href = response.data.url;
                }

            }
        } catch (error) {
            console.log("error", error);
        } finally {
            setLoader(false);
        }
    }

    return (
        <div className="flex items-center justify-center w-full" >
            <div className="w-[28rem] rounded-2xl shadow-lg bg-white border border-gray-200">
                <img
                    alt="*"
                    src={"/agencyIcons/stripeConnected1.png"}
                    className="rounded-t-2xl"
                    style={{
                        height: "100%", width: "100%", objectFit: "cover",
                    }}
                />
                <div className="p-4 w-full">
                    <div className="space-y-4 text-gray-800 mt-2">
                        <div className="flex justify-between">
                            <span style={{ fontSize: "16px", fontWeight: "400" }}>Company:</span>
                            <span>{stripeData?.company?.name || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ fontSize: "16px", fontWeight: "400" }}>Business Profile:</span>
                            <span>{stripeData?.business_profile?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ fontSize: "16px", fontWeight: "400" }}>Country:</span>
                            <span>US</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ fontSize: "16px", fontWeight: "400" }}>Email:</span>
                            <span>{stripeData?.email || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ fontSize: "16px", fontWeight: "400" }}>Bank Routing:</span>
                            <span>****{stripeData?.external_accounts?.data[0]?.last4}</span>
                        </div>

                        {
                            loader ? (
                                <CircularProgress size={20} />
                            ) : (
                                <button className="bg-purple text-white rounded-lg h-[50px] w-full"
                                    onClick={() => {
                                        handleViewStripeAccount();
                                    }}
                                >
                                    View Stripe Account
                                </button>
                            )
                        }

                    </div>
                </div>
            </div>
        </div>
    );
}
