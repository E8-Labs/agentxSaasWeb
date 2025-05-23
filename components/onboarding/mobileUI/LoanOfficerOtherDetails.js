import React from 'react'

function LoanOfficerOtherDetails({
    customerService,
    setCustomerService,
    companyName,
    setCompanyName,
    ClientType,
    otherType,
    setOtherType,
    handleSelectClientType
}) {

    const primaryClientTypes = [
        {
            id: 1,
            title: "First-Time Homebuyers",
        },
        {
            id: 2,
            title: "Investors & Property Developers",
        },
        {
            id: 3,
            title: "Veterans & Active Military",
        },
        {
            id: 3,
            title: "Luxury Homebuyers",
        },
        {
            id: 5,
            title: "Self-Employed & Entrepreneurs",
        },
        {
            id: 6,
            title: "Other (type here)",
        },
    ];

    return (
        <div className='w-full'>
            <div style={styles.headingStyle} className="mt-6">
                Where do you primarily serve clients?
            </div>
            {/* <div className='w-full'> */}
                <input
                    placeholder="Specific cities, counties, or regions"
                    className="border w-full border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                    style={{ ...styles.inputStyle, marginTop: "8px" }}
                    value={customerService}
                    onChange={(e) => {
                        setCustomerService(e.target.value);
                    }}
                />
            {/* </div> */}

            <div style={styles.headingStyle} className="mt-6">
                Name of the mortgage lender, bank, or brokerage you work with,
                if any.
            </div>
            <input
                placeholder="Name"
                className=" border w-full border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={companyName}
                onChange={(e) => {
                    setCompanyName(e.target.value);
                }}
            />

            <div style={styles.headingStyle} className="mt-6">
                Client Type
            </div>

            <div
                className="flex w-full flex-col items-center gap-2"
                style={{ marginTop: "8px", flexWrap: "wrap" }}
            >
                {primaryClientTypes.map((item, index) => {
                    return (
                        <div key={index} className="w-full">
                            <button
                                onClick={() => {

                                    handleSelectClientType(item);
                                }}
                                className="border border-[#00000010] w-full rounded px-4 py-4 outline-none focus:outline-none focus:ring-0 text-start"
                                style={{
                                    ...styles.inputStyle,
                                    borderRadius: "30px",
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
                            {ClientType === "Other (type here)" && item.id === 6 && (
                                <input
                                    placeholder="Type here"
                                    className=" w-full border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                                    style={{ ...styles.inputStyle, marginTop: "8px" }}
                                    value={otherType}
                                    onChange={(e) => {
                                        setOtherType(e.target.value);
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default LoanOfficerOtherDetails




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