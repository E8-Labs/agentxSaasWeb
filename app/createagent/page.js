"use client"
import CreatAgent3 from '@/components/createagent/CreatAgent3';
import CreateAgent1 from '@/components/createagent/CreateAgent1';
import CreateAgent2 from '@/components/createagent/CreateAgent2';
import CreateAgent4 from '@/components/createagent/CreateAgent4';
import CreateAgentVoice from '@/components/createagent/CreateAgentVoice';
import React, { useEffect } from 'react';
import { useState } from 'react';

const Page = () => {


    const [index, setIndex] = useState(0)
    const [components, setComponents] = useState([CreateAgent1, CreatAgent3, CreateAgent4, CreateAgentVoice]);

    let CurrentComp = components[index]

    useEffect(() => {
        const localData = localStorage.getItem("User");
        if (localData) {
            const Data = JSON.parse(localData);
            if (Data.user.plan) {
                setComponents([CreateAgent1, CreatAgent3, CreateAgent4, CreateAgentVoice])
            } else {
                setComponents([CreateAgent1, CreatAgent3, CreateAgent4, CreateAgentVoice])
            }
        }
    }, [])

    // Function to proceed to the next step
    const handleContinue = () => {
        console.log("Component indexchanged ", index);
        setIndex(index + 1);
    };

    const handleBack = () => {
        console.log("Component indexchanged ", index);
        setIndex(index - 1);
    };

    const handleSkipAddPayment = () => {
        console.log("Component indexchanged ", index);
        setIndex(index + 2);
    }

    const backgroundImage = {
        // backgroundImage: 'url("/assets/background.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "100%",
        height: "100svh",
        overflow: "hidden",
    };

    return (
        <div style={backgroundImage} className="overflow-y-none flex flex-row justify-center items-center">
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: -1, // Ensure the video stays behind content
                }}
            >
                <source src="/banerVideo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <CurrentComp handleContinue={handleContinue} handleBack={handleBack} handleSkipAddPayment={handleSkipAddPayment} />
        </div>
    )
}

export default Page
