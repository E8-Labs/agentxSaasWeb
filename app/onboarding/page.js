"use client"
import React, { useState } from 'react';
import CreateAccount1 from '@/components/onboarding/CreateAccount1';
import CreateAccount2 from '@/components/onboarding/CreateAccount2';
import CreateAccount3 from '@/components/onboarding/CreateAccount3';
import Congrats from '@/components/onboarding/Congrats';

const Page = ({ params }) => {

    const [index, setIndex] = useState(0)
    let components = [CreateAccount1, CreateAccount2, CreateAccount3, Congrats]

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

export default Page
