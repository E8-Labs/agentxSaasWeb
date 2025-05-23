import React from 'react'

function SolarRepOtherDetails({
    service,
    setService,
    companyName,
    setCompanyName,
    installationVolume,
    setInstallationVolume,
    projectSize,
    handleSelectClientType,
    setProjectSize,
    ClientType,
    inputsFields,
}) {

    const primaryClientTypes = [
        {
            id: 1,
            title: "Residential clients",
        },
        {
            id: 2,
            title: "Commercial clients",
        },
        {
            id: 3,
            title: "Both",
        },
    ];

    return (
        <div className="w-full">
            <div style={styles.headingStyle} className="mt-6">
                Where do you primarily operate or serve customers
            </div>
            <input
                ref={(el) => (inputsFields.current[0] = el)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="done"
                placeholder="Your territory"
                className="border border-[#00000010] w-full rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={service}
                onChange={(e) => {
                    setService(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Done") {
                        inputsFields.current[1]?.focus(); // Move to the second input
                    }
                }}
            />


            <div style={styles.headingStyle} className="mt-6">
                Company
            </div>
            <input
                ref={(el) => (inputsFields.current[1] = el)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="done"
                placeholder="Brokerage"
                className="border w-full border-[#00000010] w-full rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={companyName}
                onChange={(e) => {
                    setCompanyName(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Done") {
                        inputsFields.current[2]?.focus(); // Move to the second input
                    }
                }}
            />

            <div style={styles.headingStyle} className="mt-6">
                Installation Volume per Year
            </div>
            <input
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="done"
                ref={(el) => (inputsFields.current[2] = el)}
                placeholder="Type here"
                className="border w-full border-[#00000010] w-full rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={installationVolume}
                onChange={(e) => {
                    setInstallationVolume(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Done") {
                        inputsFields.current[3]?.focus(); // Move to the second input
                    }
                }}
            />


            <div style={styles.headingStyle} className="mt-6">
                Average Project Size (kW)
            </div>
            <input
                placeholder="Type here"
                className="w-full border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                ref={(el) => (inputsFields.current[3] = el)}
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={projectSize}
                onChange={(e) => {
                    setProjectSize(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Done") {
                        inputsFields.current[4]?.focus(); // Move to the second input
                    }
                }}
            />

            <div style={styles.headingStyle} className="mt-6">
                Primary Client Type
            </div>

            <div
                className="flex flex-col w-full items-start gap-4"
                style={{ marginTop: "8px" }}
            >
                {primaryClientTypes.map((item, index) => {
                    return (
                        <div key={index} className="w-full">
                            <button
                                onClick={() => {
                                    handleSelectClientType(item);
                                }}
                                className="border border-[#00000010] text-start rounded px-4 rounded py-1 outline-none focus:outline-none focus:ring-0 w-full"
                                style={{
                                    ...styles.inputStyle,
                                    // borderRadius: "30px",
                                    paddingInline: index === 2 && "40px",
                                    border:
                                        ClientType === item.title
                                            ? "2px solid #7902DF"
                                            : "",
                                    backgroundColor:
                                        ClientType === item.title ? "#402FFF20" : "",
                                }}
                            >
                                {item.title}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default SolarRepOtherDetails


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