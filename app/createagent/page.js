"use client"
import CreatAgent3 from '@/components/createagent/CreatAgent3';
import CreateAgent1 from '@/components/createagent/CreateAgent1';
import CreateAgent2 from '@/components/createagent/CreateAgent2';
import CreateAgent4 from '@/components/createagent/CreateAgent4';
import CreateAgentVoice from '@/components/createagent/CreateAgentVoice';
import React, { useState } from 'react';

const page = () => {


    const [index, setIndex] = useState(0)
    let components = [CreateAgent1, CreateAgent2, CreatAgent3, CreateAgent4, CreateAgentVoice]

    let CurrentComp = components[index]

    // Function to proceed to the next step
    const handleContinue = () => {
        console.log("Component indexchanged ", index);
        setIndex(index + 1);
    };

    const handleBack = () => {
        console.log("Component indexchanged ", index);
        setIndex(index - 1);
    };

    const backgroundImage = {
        backgroundImage: 'url("/assets/background.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "100%",
        height: "100svh",
        overflow: "hidden",
    };

    return (
        <div style={backgroundImage} className="overflow-y-none flex flex-row justify-center items-center">
            <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
        </div>
    )
}

export default page
