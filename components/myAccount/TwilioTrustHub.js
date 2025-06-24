import React from 'react'
import CustomerProfile from '../twiliohub/getProfile/CustomerProfile'

const TwilioTrustHub = () => {
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

            <CustomerProfile />

        </div>
    )
}

export default TwilioTrustHub
