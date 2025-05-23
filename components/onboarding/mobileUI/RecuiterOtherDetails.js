import React from 'react'

function RecuiterOtherDetails({
    inputsFields,
    service,
    setService,
    handleVerifyPopup
}) {
    return (
        <div className='w-full'>
            <div className="mt-6" style={styles.headingStyle}>
                Where do you primarily operate or serve customers
            </div>
            <input
                ref={(el) => (inputsFields.current[0] = el)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="done"
                placeholder="Your territory"
                className="w-full border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={service}
                onChange={(e) => {
                    setService(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Done") {
                        handleVerifyPopup(); // Move to the second input
                    }
                }}
            />

        
        </div>
    )
}

export default RecuiterOtherDetails



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