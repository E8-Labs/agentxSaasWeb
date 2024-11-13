import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';

const Pipeline1 = ({ handleContinue }) => {

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
            <div className='bg-gray-100 rounded-lg w-10/12 h-[90vh] py-4 overflow-auto flex flex-col justify-between'>
                <div>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            Pipeline
                        </div>
                        <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>

                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleContinue} donotShowBack={true} />
                </div>
            </div>
        </div>
    )
}

export default Pipeline1