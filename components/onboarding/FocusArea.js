import React, { useState, useEffect } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Image from 'next/image';
import axios from 'axios';
import Apis from '../apis/Apis';
import { CircularProgress } from '@mui/material';

const FocusArea = ({
    handleContinue, handleBack, DefaultData,
    handleSalesAgentContinue,
    handleSolarAgentContinue,
    handleInsuranceContinue,
    handleMarketerAgentContinue,
    handleWebsiteAgentContinue,
    handleRecruiterAgentContinue,
    handleTaxAgentContinue,
}) => {

    const router = useRouter();
    const [focusArea, setFocusArea] = useState([]);
    const [loader, setLoader] = useState(false);
    const [focusData, setFocusData] = useState([]);
    const [shouldContinue, setShouldContinue] = useState(true);

    useEffect(() => {
        const focusData = localStorage.getItem("registerDetails");
        if (focusData) {
            const FocusAreaDetails = JSON.parse(focusData);
            console.log("Local details are :", FocusAreaDetails);
            setFocusArea(FocusAreaDetails.focusAreaId);
        }
    }, [])

    useEffect(() => {
        getDefaultData();
    }, []);

    //function to get the default data
    const getDefaultData = async () => {
        try {
            setLoader(true);
            const selectedServiceID = localStorage.getItem("registerDetails");
            let AgentTypeTitle = null;
            if (selectedServiceID) {
                const serviceIds = JSON.parse(selectedServiceID);
                console.log("Userdetails are", serviceIds);
                AgentTypeTitle = serviceIds.userTypeTitle
            }

            // formatAgentTypeTitle(AgentTypeTitle)

            // console.log("Formated titel is", formatAgentTypeTitle(AgentTypeTitle));

            console.log("Check 1 clear !!!");
            const ApiPath = `${Apis.defaultData}?type=${formatAgentTypeTitle(AgentTypeTitle)}`;
            console.log("Api link is:--", ApiPath);
            const response = await axios.get(ApiPath, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of api is : -----", response.data);
                const focusData = localStorage.getItem("registerDetails");
                if (focusData) {
                    const FocusAreaDetails = JSON.parse(focusData);
                    if (FocusAreaDetails.userTypeTitle === "Recuiter Agent") {
                        console.log("Recruiter", response.data.data.userIndustry);
                        setFocusData(response.data.data.userIndustry);
                    } else {
                        setFocusData(response.data.data.areaOfFocus);
                    }
                }
            } else {
                alert(response.data)
            }

        } catch (error) {
            console.error("ERror occured in default data api is :----", error);
        } finally {
            setLoader(false);
        }
    }

    //function to format the agenttypetitle
    const formatAgentTypeTitle = (title) => {
        switch (title) {
            case "Real Estate Agent":
                return "RealEstateAgent";
            case "Sales Dev Rep":
                return "SalesDevRep";
            case "Solar Rep":
                return "SolarRep";
            case "Insurance Agent":
                return "InsuranceAgent";
            case "Marketer":
                return "MarketerAgent";
            case "Website Owners":
                return "WebsiteAgent";
            case "Recuiter Agent":
                return "RecruiterAgent";
            case "Tax Agent":
                return "TaxAgent";
            default:
                return title; // Fallback if no match is found
        }
    };

    useEffect(() => {
        console.log("Focus area is :", focusArea);
        if (focusArea.length > 0) {
            setShouldContinue(false);
        } else if (focusArea.length === 0) {
            setShouldContinue(true);
        }
    }, [focusArea]);

    const handleNext = () => {
        const data = localStorage.getItem("registerDetails");

        if (data) {
            const LocalDetails = JSON.parse(data);
            console.log("Local details are", LocalDetails);
            let agentType = LocalDetails.userTypeTitle;

            let details = LocalDetails;
            details.focusAreaId = focusArea;
            localStorage.setItem("registerDetails", JSON.stringify(details));

            // handleSalesAgentContinue,
            //     handleSolarAgentContinue,
            //     handleInsuranceContinue,
            //     handleMarketerAgentContinue,
            //     handleWebsiteAgentContinue,
            //     handleRecruiterAgentContinue,
            //     handleTaxAgentContinue,

            if (agentType === "Real Estate Agent") {
                handleContinue();
                console.log("Selected agent type is")
            } else if (agentType === "Sales Dev Rep") {
                handleSalesAgentContinue();
                console.log("Selected agent type is")
            } else if (agentType === "Solar Rep") {
                handleSolarAgentContinue();
                console.log("Selected agent type is")
            } else if (agentType === "Insurance Agent") {
                handleInsuranceContinue();
                console.log("Selected agent type is")
            } else if (agentType === "Marketer") {
                handleMarketerAgentContinue();
                console.log("Selected agent type is")
            } else if (agentType === "Website Owners") {
                handleWebsiteAgentContinue();
                console.log("Selected agent type is")
            } else if (agentType === "Recuiter Agent") {
                handleRecruiterAgentContinue();
                console.log("Selected agent type is")
            } else if (agentType === "Tax Agent") {
                handleTaxAgentContinue();
                console.log("Selected agent type is")
            }
        }

        // if (data) {
        //     const details = JSON.parse(data);
        //     details.focusAreaId = focusArea;
        //     localStorage.setItem("registerDetails", JSON.stringify(details));
        //     if (focusArea.length > 0) {
        //         handleContinue();
        //     }
        // }

    }

    const handlefocusArea = (id) => {
        // setFocusArea(prevId => (prevId === id ? null : id))
        setFocusArea((prevIds) => {
            if (prevIds.includes(id)) {
                // Unselect the item if it's already selected
                return prevIds.filter((prevId) => prevId !== id);
            } else {
                // Select the item if it's not already selected
                return [...prevIds, id];
            }
        })
    }

    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-white rounded-2xl flex flex-col justify-between w-10/12 h-[90%] py-4 ' style={{ scrollbarWidth: "none" }}//overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
            >

                <div className='h-[80vh]'>
                    {/* header */}
                    <div className='h-[10%]'>
                        <Header />
                    </div>
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full h-[90%]'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            What area of real estate do you focus on?
                        </div>

                        {
                            loader ? (
                                <div className='w-full flex flex-row items-center justify-center h-screen'>
                                    <CircularProgress size={35} />
                                </div>
                            ) : (
                                <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[90%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple' style={{ scrollbarWidth: "none" }}>

                                    {focusData.map((item, index) => (
                                        <button key={item.id} onClick={() => { handlefocusArea(item.id) }} className='border-none outline-none'>
                                            <div className='border bg-white flex flex-row items-start pt-3 w-full rounded-2xl'
                                                style={{
                                                    border: focusArea.includes(item.id) ? "2px solid #7902DF" : "",
                                                    scrollbarWidth: "none", backgroundColor: focusArea.includes(item.id) ? "#402FFF05" : ""
                                                }}>
                                                <div className='w-full flex flex-row items-start justify-between px-4 py-2'>
                                                    <div className='text-start w-[60%]'>
                                                        <div style={{ fontFamily: "", fontWeight: "700", fontSize: 20 }}>
                                                            {item.title}
                                                        </div>
                                                        <div className='mt-2'>
                                                            {item.description}
                                                        </div>
                                                    </div>
                                                    {
                                                        focusArea.includes(item.id) ?
                                                            <Image src={"/assets/charmTick.png"} alt='*' height={36} width={36} /> :
                                                            <Image src={"/assets/charmUnMark.png"} alt='*' height={36} width={36} />
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    ))}

                                    {/* <Body /> */}
                                </div>
                            )
                        }


                    </div>
                </div>

                <div className='mb-4 h-[10%]'>
                    <div>
                        <ProgressBar value={60} />
                    </div>

                    <Footer handleContinue={handleNext} handleBack={handleBack} shouldContinue={shouldContinue} />
                </div>

            </div>
        </div>
    )
}

export default FocusArea
