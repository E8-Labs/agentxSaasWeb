import React from 'react'

function MedSpaAgentOtherDetails({
    customerService,
    setCustomerService,
    companyName,
    setCompanyName,
    installationVolume,
    setInstallationVolume
}) {
    return (
        <div className='w-full'>
            <div style={styles.headingStyle} className="mt-6">
                Where do you primarily operate?
            </div>
            <input
                placeholder="Specific cities, counties, or regions"
                className="border w-full border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={customerService}
                onChange={(e) => {
                    setCustomerService(e.target.value);
                }}
            />

            <div style={styles.headingStyle} className="mt-6">
                Name of the med spa or practice you work with, if any.
            </div>
            <input
                placeholder="Name"
                className="borde w-full border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={companyName}
                onChange={(e) => {
                    setCompanyName(e.target.value);
                }}
            />

            <div style={styles.headingStyle} className="mt-6">
                How many clients do you typically see per month?
            </div>
            <input
                placeholder="Type here"
                className="border w-full border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={installationVolume}
                onChange={(e) => {
                    setInstallationVolume(e.target.value);
                }}
                type="number"
            />
        </div>
    )
}

export default MedSpaAgentOtherDetails


const styles = {
    headingStyle: {
        fontSize: 16,
        fontWeight: "600",
    },
    inputStyle: {
        fontSize: 15,
        fontWeight: "500",
        borderRadius: "7px",
    },
    errmsg: {
        fontSize: 12,
        fontWeight: "500",
        borderRadius: "7px",
    },
    verifyPopup: {
        height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
};