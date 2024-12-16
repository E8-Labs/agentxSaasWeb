"use client"
import React, { useEffect, useState } from 'react';
import Congrats from '@/components/onboarding/Congrats';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import UserType from '@/components/onboarding/UserType';
import UserService from '@/components/onboarding/UserService';
import FocusArea from '@/components/onboarding/FocusArea';
import SignUpForm from '@/components/onboarding/SignUpForm';


const Page = ({ params }) => {

    const [index, setIndex] = useState(4);
    const [DefaultData, setDefaultData] = useState(null);

    let components = [UserType, UserService, FocusArea, SignUpForm, Congrats]

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
                console.log("Response of api is : -----", response.data);
                setDefaultData(response.data.data);
            }else{
                alert(response.data)
            }

        } catch (error) {
            console.error("ERror occured in default data api is :----", error);
        }
    }

    useEffect(() => {
        getDefaultData();
    }, [])



    return (
        <div style={backgroundImage} className="overflow-y-none flex flex-row justify-center items-center">
            <CurrentComp handleContinue={handleContinue} handleBack={handleBack} DefaultData={DefaultData} />
        </div>
    )
}

export default Page
