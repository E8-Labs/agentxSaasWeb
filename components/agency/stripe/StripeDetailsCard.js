"use client";
import React from "react";

export default function StripeDetailsCard({
    stripeData
}) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 w-full">
            <div className="w-[28rem] p-8 rounded-2xl shadow-lg bg-white border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Stripe Account Details
                </h2>

                <div className="space-y-4 text-gray-800">
                    <div className="flex justify-between">
                        <span className="font-medium">Company:</span>
                        <span>{stripeData?.company?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Business Profile:</span>
                        <span>{stripeData?.business_profile?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Country:</span>
                        <span>US</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{stripeData?.email || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Bank Routing:</span>
                        <span>****{stripeData?.external_accounts?.data[0]?.last4}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
