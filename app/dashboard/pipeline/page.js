"use client"
import React, { useEffect, useState } from 'react';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import Leads1 from '@/components/dashboard/leads/Leads1';
import Pipeline1 from '@/components/dashboardPipeline/Pipeline1';

const Page = ({ params }) => {

    const [index, setIndex] = useState(0);

    let components = [Pipeline1];

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
        // backgroundImage: 'url("/assets/background.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "100%",
        height: "100svh",
        overflow: "hidden",
    };



    return (
        <div style={backgroundImage} className="overflow-y-none flex flex-row justify-center items-center bg-gray-100">
            <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
        </div>
    )
}

export default Page