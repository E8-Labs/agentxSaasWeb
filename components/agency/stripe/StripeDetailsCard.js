"use client";
import React from "react";

export default function StripeDetailsCard({
    stripeData
}) {
    return (
        <div className="flex items-center justify-center w-full" //min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 //chutiy na bht tang kia tha
        >
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
                            <span style={{fontSize: "16px", fontWeight: "400"}}>Company:</span>
                            <span>{stripeData?.company?.name || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{fontSize: "16px", fontWeight: "400"}}>Business Profile:</span>
                            <span>{stripeData?.business_profile?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{fontSize: "16px", fontWeight: "400"}}>Country:</span>
                            <span>US</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{fontSize: "16px", fontWeight: "400"}}>Email:</span>
                            <span>{stripeData?.email || "-"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{fontSize: "16px", fontWeight: "400"}}>Bank Routing:</span>
                            <span>****{stripeData?.external_accounts?.data[0]?.last4}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
