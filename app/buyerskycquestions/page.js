"use client"
import BuyerKyc1 from '@/components/kycQuestions/buyerKyc/BuyerKyc1';
import KYC1 from '@/components/kycQuestions/KYC1';
import React, { useState } from 'react';

const Page = () => {


    const [index, setIndex] = useState(0)
    let components = [BuyerKyc1]

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
