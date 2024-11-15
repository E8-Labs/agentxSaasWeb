import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
import Apis from '../apis/Apis';
import axios from 'axios';

const CreateAgent1 = ({ handleContinue, handleBack }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const [OutBoundCalls, setOutBoundCalls] = useState(false);
    const [InBoundCalls, setInBoundCalls] = useState(false);
    const [buildAgentLoader, setBuildAgentLoader] = useState(false);
    const [agentObjective, setAgentObjective] = useState(null);

    const [agentName, setAgentName] = useState("");
    const [agentRole, setAgentRole] = useState("");

    // useEffect(() => {})

    const handleToggleClick = (item) => {
        setAgentObjective(item);
        setToggleClick(prevId => (prevId === item.id ? null : item.id));
    }

    const AgentObjective = [
        {
            id: 1,
            icon: "",
            title: "Call absentee owners",
            details: "Reach out to property owners who may not live in the property to discuss potential selling or investment opportunities."
        },
        {
            id: 2,
            icon: "",
            title: "Circle prospecting",
            details: "Call homeowners in a specific farm to inform them about recent property activities, and gauge their interest in selling or buying."
        },
        {
            id: 3,
            icon: "",
            title: "Community update",
            details: "Provide local homeowners with relevant updates on a property like just listed, just sold, in escrow or something else. "
        },
        {
            id: 4,
            icon: "",
            title: "Lead reactivation",
            details: "Reconnect with past leads who previously expressed interest but did not convert, to reignite their interest in your services."
        },
        {
            id: 5,
            icon: "",
            title: "Agent Recruiting",
            details: "Identify, engage, and attract potential real estate agents to expand your team with top talent. Recruit new agents to your team."
        },
        {
            id: 6,
            icon: "",
            title: "others",
            details: ""
        },
    ];

    //code for selecting outbound calls
    const handleInboundCallClick = () => {
        setOutBoundCalls(false);
        setInBoundCalls(!InBoundCalls);
    }

    //code for selecting inbound calls
    const handleOutBoundCallClick = () => {
        setInBoundCalls(false);
        setOutBoundCalls(!OutBoundCalls);
    }

    //code for creating agent api
    const handleBuildAgent = async () => {
        try {
            setBuildAgentLoader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }
            console.log("Auth token is :--", AuthToken);
            const ApiPath = Apis.buildAgent;
            console.log("Api link for build agent is :--", ApiPath);
            const formData = new FormData();
            formData.append("name", agentName);
            formData.append("agentRole", agentRole);
            formData.append("agentObjective", agentObjective.title);
            formData.append("agentObjectiveDescription", agentObjective.details);
            let agentType = null
            if (InBoundCalls) {
                agentType = "inbound"
            } else if (OutBoundCalls) {
                agentType = "outbound"
            }
            formData.append("agentType", agentType);
            formData.append("status", "Just listed");
            formData.append("address", "Chakwal");

            console.log("Build agent details are is :-----");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken
                }
            });

            if (response) {
                console.log("Response of build agent api  is :---", response.data);
                if (response.data.status === true) {
                    console.log("Status of build agent is :", response.data.status);
                    localStorage.setItem("agentDetails", JSON.stringify(response.data.data));
                    handleContinue();
                }
            }

        } catch (error) {
            console.error("Error occured in build agent api is: ----", error);
        } finally {
            setBuildAgentLoader(false);
        }
    }

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "700"
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "500"
        }
    }


    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-gray-100 rounded-lg w-10/12 h-[90vh] py-4 overflow-auto'>
                {/* header */}
                <Header />
                {/* Body */}
                <div className='flex flex-col items-center px-4 w-full'>
                    <button className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }} onClick={handleContinue}>
                        Get started with your AI agent
                    </button>
                    <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

                        <div style={styles.headingStyle}>
                            What's your AI agent's name?
                        </div>
                        <input
                            placeholder="Ex: Ana's AI, Ana.ai, Ana's Assistant"
                            className='border-2 rounded p-2 outline-none'
                            style={styles.inputStyle}
                            value={agentName}
                            onChange={(e) => { setAgentName(e.target.value) }}
                        />

                        <div style={styles.headingStyle}>
                            What's this agent's task?
                        </div>

                        <div className='flex flex-row items-center gap-4'>
                            <button className='flex flex-row items-center justify-center gap-2 border h-[70px] w-[240px] outline-none'
                                style={{
                                    borderRadius: "50px", border: OutBoundCalls ? "2px solid #402FFF" : ""
                                }}
                                onClick={handleOutBoundCallClick}>
                                <Image src={"/assets/callOut.png"} height={24} width={24} alt='*' />
                                <div
                                    // className='font-[500] text-xs md:text-[15px]'
                                    style={styles.inputStyle}
                                >
                                    Making outbound calls
                                </div>
                            </button>
                            <button className='flex flex-row items-center justify-center gap-2 border h-[70px] w-[240px] outline-none'
                                style={{
                                    borderRadius: "50px", borderRadius: "50px", border: InBoundCalls ? "2px solid #402FFF" : ""
                                }} onClick={handleInboundCallClick}>
                                <Image src={"/assets/callOut.png"} height={24} width={24} alt='*' />
                                <div
                                    // className='font-[500] text-xs md:text-[15px]'
                                    style={styles.inputStyle}
                                >
                                    Taking Inbound Calls
                                </div>
                            </button>
                        </div>

                        <div style={styles.headingStyle}>
                            What's this agent's role?
                        </div>
                        <input
                            placeholder="Ex: Senior Property Acquisition Specialist"
                            className='border-2 rounded p-2 outline-none'
                            style={styles.inputStyle}
                            value={agentRole}
                            onChange={(e) => { setAgentRole(e.target.value) }}
                        />

                        <div style={styles.headingStyle}>
                            What's this agent's primary objective during the call
                        </div>

                        <div style={styles.inputStyle}>
                            Select only one. You can create new agents to dedicate them to other objectives.
                        </div>

                        <div className="flex flex-wrap">
                            {AgentObjective.map((item) => (
                                <div key={item.id} className="w-full text-start md:w-1/2 p-2 flex">
                                    <button
                                        className="border-2 w-full rounded-xl text-start p-4 h-full flex flex-col justify-between"
                                        onClick={() => { handleToggleClick(item) }}
                                        style={{ borderColor: item.id === toggleClick ? "#402FFF" : "" }}
                                    >
                                        <div style={styles.inputStyle}>{item.title}</div>
                                        <div style={{ fontSize: 11, fontWeight: "500" }}>{item.details}</div>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={styles.headingStyle}>
                            Agent's Objective
                        </div>
                        <input
                            placeholder="Type Here.... "
                            className='border-2 rounded p-2 outline-none'
                            style={styles.inputStyle}
                        />




                        {/* <Body /> */}
                    </div>
                </div>
                <div>
                    <ProgressBar value={33} />
                </div>

                <Footer handleContinue={handleBuildAgent} donotShowBack={true} registerLoader={buildAgentLoader} />
            </div>
        </div>
    )
}

export default CreateAgent1
