import React from 'react';

const Page = () => {

    // const backgroundImage = {
    //     backgroundImage: 'url("/assets/bg2.png")',
    //     backgroundSize: "cover",
    //     backgroundRepeat: "no-repeat",
    //     backgroundPosition: "center",
    //     backgroundPositionY: "center",
    //     width: "100%",
    //     height: "90svh",
    //     overflow: "hidden",
    // };

    const backgroundImage = {
        backgroundImage: 'url("/assets/bg2.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        // backgroundPosition: "50% 50%",
        backgroundPosition: "center",
        width: "100%",
        height: "90vh",
        overflow: "hidden",
    };


    return (
        <div className='flex flex-row w-full items-center h-screen'>
            <div className='w-6/12 ms-8' style={backgroundImage}>
                <div className='w-10/12'>
                    <div className='text-white' style={{ fontSize: 64, fontWeight: "600" }}>
                        Building your persona lead gen assistant
                    </div>
                    <div style={{ fontSize: 15, fontWeight: "500" }}>
                        {`By signing up to the AgentX platform you understand and agree to our Terms and Conditions and Privacy Policy. This site is protected by Google reCAPTCHA to ensure you’re not a bot. Learn more`}
                    </div>
                </div>
            </div>
            <div className='w-6/12'>
                hello there
            </div>
        </div>
    )
}

export default Page
