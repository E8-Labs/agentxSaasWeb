"use client"
import Image from 'next/image';
import React, { useState } from 'react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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

    // const [PhoneNumber, setPhoneNumber] = useState("")

    const [countryCode, setCountryCode] = useState("us"); // Default country
    const [userPhoneNumber, setUserPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [locationLoader, setLocationLoader] = useState(false);

    const handlePhoneNumberChange = (phone) => {
        setUserPhoneNumber(phone);
    };

    const getLocation = () => {
        setLocationLoader(true);
        // Simulate an API call to get location
        setTimeout(() => {
            setCountryCode("us"); // Example: setting US as default
            setLocationLoader(false);
        }, 2000); // Simulate delay
    };

    const backgroundImage = {
        backgroundImage: 'url("/assets/bg2.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        // backgroundPosition: "50% 50%",
        backgroundPosition: "center",
        width: "940px",
        height: "90vh",
        overflow: "hidden",
    };


    return (
        <div className='flex flex-row w-full items-center h-screen'>
            <div className='w-4/12 ms-8 flex flex-row justify-center ' style={backgroundImage}>
                <div className='w-11/12'>
                    <div className='text-white' style={{ fontSize: 64, fontWeight: "600" }}>
                        Building your persona lead gen assistant
                    </div>
                    <div style={{ fontSize: 15, fontWeight: "500" }}>
                        {`By signing up to the AgentX platform you understand and agree to our Terms and Conditions and Privacy Policy. This site is protected by Google reCAPTCHA to ensure you’re not a bot. Learn more`}
                    </div>
                </div>
            </div>
            <div className='w-6/12 flex flex-row justify-center h-[90vh]'>
                <div className='w-10/12'>
                    <div>
                        <div className='flex flex-row items-center gap-4'>
                            <Image className='hidden md:flex' src="/agentXOrb.gif" style={{ height: "69px", width: "75px", resize: "contain" }} height={69} width={69} alt='*' />
                            <Image className='' src="/assets/agentX.png" style={{ height: "29px", width: "122px", resize: "contain" }} height={29} width={122} alt='*' />
                        </div>
                        <div style={{ fontWeight: "600", fontSize: 24 }}>
                            Welcome to AgentX
                        </div>
                        <div className='mt-4' style={{ fontWeight: "600", fontSize: 17 }}>
                            {`What’s your phone number`}
                        </div>
                        <div style={{ marginTop: "8px" }}>
                            <PhoneInput
                                className="border outline-none bg-white"
                                country={countryCode} // Default country
                                value={userPhoneNumber}
                                onChange={handlePhoneNumberChange}
                                onFocus={getLocation}
                                placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                                disabled={loading} // Disable input if still loading
                                style={{ borderRadius: "7px" }}
                                inputStyle={{
                                    width: "100%",
                                    borderWidth: "0px",
                                    backgroundColor: "transparent",
                                    paddingLeft: "60px",
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                }}
                                buttonStyle={{
                                    border: "none",
                                    backgroundColor: "transparent",
                                }}
                                dropdownStyle={{
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                }}
                                countryCodeEditable={true}
                                defaultMask={loading ? "Loading..." : undefined}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page
