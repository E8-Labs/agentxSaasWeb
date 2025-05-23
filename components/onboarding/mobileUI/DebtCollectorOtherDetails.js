import React from 'react'

function DebtCollectorOtherDetails({
    inputsFields,
    service,
    setService,
    companyName,
    setCompanyName,
    installationVolume,
    setInstallationVolume,
    collectionStretigy,
    handleSelectCollectionStretigy
}) {
    const primaryClientTypes = [
        {
            id: 1,
            title: "Soft Collections",
        },
        {
            id: 2,
            title: "Hard Collections",
        },
        {
            id: 3,
            title: "Hybrid Approach",
        },
        {
            id: 4,
            title: "Other",
        },
    ];
    return (
        <div className='w-full'>
            <div style={styles.headingStyle} className="mt-6">
                Where do you primarily collect debts?
            </div>
            <input
                ref={(el) => (inputsFields.current[0] = el)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="done"
                placeholder="Secific cities,contries or regions"
                className="border w-full border-[#00000010] w-full rounded p-3 outline-none focus:outline-none focus:ring-0"
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
                Name of the company or collection agency you work with, if any.
            </div>
            <input
                ref={(el) => (inputsFields.current[0] = el)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="done"
                placeholder="Name"
                className="border w-full border-[#00000010] w-full rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={companyName}
                onChange={(e) => {
                    setCompanyName(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Done") {
                        inputsFields.current[1]?.focus(); // Move to the second input
                    }
                }}
            />

            <div style={styles.headingStyle} className="mt-6">
                What is the typical balance size of debts you recover?
            </div>
            <input
                ref={(el) => (inputsFields.current[0] = el)}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="done"
                placeholder="Eg,< $1000, $1000-$5000, $5000-$10000, $10000-$50000"
                className="border w-full border-[#00000010] w-full rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={installationVolume}
                onChange={(e) => {
                    setInstallationVolume(e.target.value);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === "Done") {
                        inputsFields.current[1]?.focus(); // Move to the second input
                    }
                }}
            />


            <div style={styles.headingStyle} className="mt-6">
                Typical Collection Strategy
            </div>

            <div
                className="flex w-full flex-wrap flex-row items-center gap-4"
                style={{ marginTop: "8px" }}
            >
                {primaryClientTypes.map((item, index) => {
                    return (
                        <div key={index} className="w-full">
                            <button
                                onClick={() => {
                                    handleSelectCollectionStretigy(item);
                                }}
                                className="border text-start border-[#00000010] rounded px-4 h-[70px] outline-none focus:outline-none focus:ring-0 w-full"
                                style={{
                                    ...styles.inputStyle,
                                    borderRadius: "30px",
                                    border:
                                        collectionStretigy === item.title
                                            ? "2px solid #7902DF"
                                            : "",
                                    backgroundColor:
                                        collectionStretigy === item.title ? "#7902DF20" : "",
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

export default DebtCollectorOtherDetails

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