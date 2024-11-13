import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';

const CreateAgent1 = ({ handleContinue, handleBack }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const handleToggleClick = (id) => {
        setToggleClick(prevId => (prevId === id ? null : id))
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
    ]

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
                    <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                        Get started with your AI agent
                    </div>
                    <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

                        <div style={styles.headingStyle}>
                            What's your AI agent's name?
                        </div>
                        <input
                            placeholder="Ex: Ana's AI, Ana.ai, Ana's Assistant"
                            className='border-2 rounded p-2 outline-none'
                            style={styles.inputStyle}
                        />

                        <div style={styles.headingStyle}>
                            What's this agent's task?
                        </div>

                        <div style={styles.headingStyle}>
                            What's this agent's role?
                        </div>
                        <input
                            placeholder="Ex: Senior Property Acquisition Specialist"
                            className='border-2 rounded p-2 outline-none'
                            style={styles.inputStyle}
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
                                        onClick={() => { handleToggleClick(item.id) }}
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

                <Footer handleContinue={handleContinue} donotShowBack={true} />
            </div>
        </div>
    )
}

export default CreateAgent1
