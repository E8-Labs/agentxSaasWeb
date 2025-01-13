"use client"
const AddCalender = dynamic(() =>
    import("../../components/pipeline/AddCalender.js")
);
const Pipeline1 = dynamic(() =>
    import("../../components/pipeline/Pipeline1.js")
);
const Pipeline2 = dynamic(() =>
    import("../../components/pipeline/Pipeline2.js")
);
import dynamic from 'next/dynamic.js';
import React, { useState } from 'react';

const Page = () => {


    const [index, setIndex] = useState(0)
    let components = [
        AddCalender,
        Pipeline1,
        Pipeline2
    ];

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
        height: "100vh",
        overflow: "none",
        // backgroundColor: 'red'
    };

    return (
        <div style={{ ...backgroundImage }} className="overflow-y-none flex flex-row justify-center items-center" >
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
            <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
        </div>
        // <div className='w-full h-screen' style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems:" center" }}>
        //     <div style={{width: "90%", height: "80%"}}>

        //     </div>
        // </div>
    )
}

export default Page
