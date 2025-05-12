import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const SubAccountUserType = ({
    onClose,
    userData,
    onContinue
}) => {

    console.log(userData);
    const [selectedUserType, setSelectedUserType] = useState(null);

    useEffect(() => {
        console.log(userType);
        if (userData) {
            setSelectedUserType(userData);
        }
    }, []);

    useEffect(() => {
        console.log("selected user", selectedUserType);
    }, [selectedUserType]);

    const handleBack = () => {
        onClose(selectedUserType);
    }



    const userType = [
        {
            id: 1,
            title: "Real Estate Agent",
            agentType: "Real Estate Agent",
            icon: "/usertype/avt1.png",
            areaOfFocusTitle: "What area of real estate do you focus on?",
            userType: "RealEstateAgent",
            roundedImage: false,
        },
        {
            id: 2,
            title: "Sales Dev Agent",
            agentType: "SDR/BDR Agent",
            icon: "/usertype/avt2.png",
            areaOfFocusTitle: "What area of sales do you focus on?",
            userType: "SalesDevRep",
            roundedImage: false,
        },
        {
            id: 3,
            title: "Solar Agent",
            agentType: "Solar Agent",
            icon: "/usertype/avt3.png",
            areaOfFocusTitle: "What area of solar do you focus on?",
            userType: "SolarRep",
            roundedImage: false,
        },
        {
            id: 4,
            title: "Insurance Agent",
            agentType: "Insurance Agent",
            icon: "/usertype/avt4.png",
            areaOfFocusTitle: "What area of insurance do you focus on?",
            userType: "InsuranceAgent",
            roundedImage: false,
        },
        {
            id: 5,
            title: "Marketer",
            agentType: "Marketer Agent",
            icon: "/usertype/avt5.png",
            areaOfFocusTitle: "What area of marketing do you focus on?",
            userType: "MarketerAgent",
            roundedImage: false,
        },

        {
            id: 7,
            title: "Recruiter Agentt",
            agentType: "Recruiter Agent",
            icon: "/usertype/avt8.png",
            areaOfFocusTitle: "What industries do you specialize in?",
            userType: "RecruiterAgent",
            roundedImage: false,
        },
        {
            id: 8,
            title: "Tax Agent",
            agentType: "Tax Agent",
            icon: "/usertype/avt9.png",
            areaOfFocusTitle: "What type of clients do you primarily serve?",
            userType: "TaxAgent",
            roundedImage: false,
        },
        {
            id: 9,
            title: "Debt Collector Agent",
            agentType: "Debt Collector Agent",
            icon: "/usertype/debtcollectoragent.svg",
            areaOfFocusTitle: "What type of clients do you primarily serve?",
            userType: "DebtCollectorAgent",
            roundedImage: false,
        },
        {
            id: 11,
            title: "Med Spa Agent",
            agentType: "Med Spa Agent",
            icon: "/usertype/avt8.png",
            areaOfFocusTitle: "What types of services do you primarily offer",
            userType: "MedSpaAgent",
            roundedImage: false,
        },
        {
            id: 12,
            title: "Law Agent",
            agentType: "Law Agent",
            icon: "/usertype/avt4.png",
            areaOfFocusTitle: "What area of law do you primarily practice?",
            userType: "LawAgent",
            roundedImage: false,
        },
        {
            id: 13,
            title: "Loan Officer Agent",
            agentType: "Loan Officer Agent",
            icon: "/usertype/avt2.png",
            areaOfFocusTitle: "What type of loans do you primarily work with?",
            userType: "LoanOfficerAgent",
            roundedImage: false,
        },
        {
            id: 100,
            title: "Website Agent",
            agentType: "Website Agent",
            icon: "/agentXOrb.gif",
            areaOfFocusTitle: "How would you use AgentX?",
            userType: "WebsiteAgent",
            roundedImage: true,
        },
    ];

    return (
        <div className='h-[85vh] border-none outline-none flex flex-col'>
            <div className='w-full flex flex-row items-center justify-center'>
                <div className='w-full' style={{ fontWeight: "600", fontSize: 18 }}>
                    Select an Agent
                </div>
                <button>
                    <Image
                        src={"/assets/cross.png"}
                        alt="*"
                        height={12}
                        width={12}
                    />
                </button>
            </div>
            <div className='flex-1 overflow-y-auto scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple max-h-[80%] mt-8 px-10'>
                <div
                    className="flex flex-wrap w-full">
                    {userType.map((item) => (
                        <div key={item.id} className="flex w-6/12 md:w-4/12 p-2">
                            <div
                                className={`w-full rounded-lg p-2 md:hover:border-2 md:hover:border-[#7902DF] border transition-all duration-400 ease-in-out transform active:scale-90 ${selectedUserType === item.userType ? "border-purple" : "border-[#00000010]"}`}
                                onClick={() => {
                                    setSelectedUserType(item.userType);
                                }}
                            >
                                <div
                                    className="h-[100px] sm:h-[140px] bg-gray-200 rounded w-full flex flex-col justify-center pb-[10px] items-center"
                                    style={{ backgroundColor: "#FAF9FF" }} //FAF9FF
                                >
                                    {/* <img src={item.icon} style={{ width: "100%", resize: "contain" }} alt='*' /> */}
                                    <img
                                        src={item.icon}
                                        style={{
                                            width: item.id === 10 ? "50%" : "100%",
                                            transform: "scale(1.1)",
                                            resize: "contain",
                                            borderRadius: item.roundedImage ? "50%" : "1%",
                                        }}
                                        alt="*"
                                    />
                                </div>
                                <div
                                    className="text-center mt-4 pb-4"
                                    style={{
                                        fontWeight: "600",
                                        fontSize: 17,
                                    }}
                                >
                                    {item.agentType}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={() => { handleBack() }}
                    className="text-purple-700 font-medium w-2/6"
                >
                    Back
                </button>
                <button
                    onClick={() => { onContinue(selectedUserType) }}
                    // className="bg-purple text-white px-8 py-2 rounded-lg w-1/2"
                    disabled={!selectedUserType}
                    className={`px-8 py-2 rounded-lg w-1/2 ${selectedUserType ? "bg-purple text-white" : "bg-[#00000020] text-black"}`}
                >
                    Continue
                </button>
            </div>

        </div>
    )
}

export default SubAccountUserType
