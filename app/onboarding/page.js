"use client"
import React, { useEffect, useState } from 'react';
import CreateAccount1 from '@/components/onboarding/CreateAccount1';
import CreateAccount2 from '@/components/onboarding/CreateAccount2';
import CreateAccount3 from '@/components/onboarding/CreateAccount3';
import Congrats from '@/components/onboarding/Congrats';
import Apis from '@/components/apis/Apis';
import axios from 'axios';

const Page = ({ params }) => {

    const [index, setIndex] = useState(0);
    const [DefaultData, setDefaultData] = useState(null);

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


    const getDefaultData = async () => {
        try {
            // console.log("Check 1 clear !!!");
            const ApiPath = Apis.defaultData;
            console.log("Api link is:--", ApiPath);
            const response = await axios.get(ApiPath, {
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of api is : -----", response);
            }

        } catch (error) {
            console.error("ERror occured in default data api is :----", error);
        }
    }

    useEffect(() => {
        getDefaultData();
    }), []



    return (
        <div style={backgroundImage} className="overflow-y-none flex flex-row justify-center items-center">
            <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
        </div>
    )
}

export default Page
