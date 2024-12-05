"use client"
import Pipeline1 from '@/components/pipeline/Pipeline1';
import Pipeline2 from '@/components/pipeline/Pipeline2';
import React, { useState } from 'react';

const Page = () => {


    const [index, setIndex] = useState(0)
    let components = [Pipeline1, Pipeline2];

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
        overflow: "none",
        // backgroundColor: 'red'
    };

    return (
        <div style={backgroundImage} className="overflow-y-none flex flex-row justify-center items-center">
            <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
        </div>
        // <div className='w-full h-screen' style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems:" center" }}>
        //     <div style={{width: "90%", height: "80%"}}>
                
        //     </div>
        // </div>
    )
}

export default Page
