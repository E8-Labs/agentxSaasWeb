"use client"
import CreatAgent3 from '@/components/createagent/CreatAgent3';
import CreateAgent1 from '@/components/createagent/CreateAgent1';
import CreateAgent2 from '@/components/createagent/CreateAgent2';
import CreateAgent4 from '@/components/createagent/CreateAgent4';
import CreateAgentVoice from '@/components/createagent/CreateAgentVoice';
import Image from 'next/image';
import React from 'react';
import { useState } from 'react';

const Page = () => {

    const [index, setIndex] = useState(0)
    let components = [CreateAgent1, CreatAgent3, CreateAgent4, CreateAgentVoice]

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
        <div style={backgroundImage} className="overflow-y-none flex flex-row justify-center items-center">
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
            <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
                <div className=' rounded-2xl w-full lg:w-10/12 h-[90vh] flex flex-col items-center justify-center' style={{ scrollbarWidth: "none", backgroundColor: 'transparent' }} // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                >

                    <div className='w-10/12 flex flex-col items-center'>
                        <div
                            className='w-11/12 bg-[#ffffff80] p-2 px-4 pt-4'
                            style={{
                                borderTopLeftRadius: "15px", borderTopRightRadius: "15px", border: "1px solid #ffffff", borderBottom: "none"
                            }}
                        >
                            <Image className='' src="/assets/agentX.png" style={{ height: "12px", width: "42px", resize: "contain" }} height={12} width={42} alt='*' />
                            <div className='w-full flex flex-row justify-center mt-2'>
                                <Image
                                    className='mix-blend-multiply' //mix-blend-multiply
                                    src="/agentXOrb.gif" style={{ height: "69px", width: "75px", resize: "contain" }} height={69} width={69} alt='*' />
                            </div>
                            <div
                                style={{
                                    fontWeight: "600",
                                    fontSize: 12,
                                    textAlign: "center",
                                    marginTop: 15
                                }}>
                                Build your AI on Desktop
                            </div>
                            <div
                                style={{
                                    fontWeight: "500",
                                    fontSize: 10,
                                    textAlign: "center",
                                    marginTop: 5
                                }}>
                                Check your email to continue with next steps
                            </div>
                        </div>
                        <div className='w-full bg-[#ffffff]' style={{ borderBottomLeftRadius: "15px", borderBottomRightRadius: "15px", height: "15px" }}>
                        </div>
                    </div>

                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: 15,
                            textAlign: "center",
                            marginTop: 35,
                            color: "#ffffff"
                        }}>
                        For a seamless experience, we recommend completing your setup on desktop.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page