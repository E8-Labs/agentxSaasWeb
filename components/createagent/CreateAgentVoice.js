import Body from '@/components/onboarding/Body';
import Header from '@/components/onboarding/Header';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import ProgressBar from '@/components/onboarding/ProgressBar';
import { useRouter } from 'next/navigation';
import Footer from '@/components/onboarding/Footer';
//import for input drop down menu
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

const CreateAgentVoice = ({ handleBack }) => {

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);

    const handleToggleClick = (id) => {
        setToggleClick(prevId => (prevId === id ? null : id))
    }

    const handleContinue = () => {
        router.push("/kycQuestions")
    }

    const voices = [
        {
            id: 1,
            avatar: "/assets/avatar1.png",
            name: "Barbara.ai",
        },
        {
            id: 2,
            avatar: "/assets/avatar2.png",
            name: "Cardone.ai",
        },
        {
            id: 3,
            avatar: "/assets/avatar3.png",
            name: "Tristan.ai",
        },
        {
            id: 4,
            avatar: "/assets/avatar2.png",
            name: "Tate.ai",
        },
        {
            id: 5,
            avatar: "/assets/avatar1.png",
            name: "Neutra.ai",
        },
    ]

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "700"
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "500",
            color: "#000000"
        },
        dropdownMenu: {
            fontSize: 15,
            fontWeight: "500",
            color: "#00000070"
        },
        callBackStyles: {
            height: "71px", width: "210px",
            border: "1px solid #15151550", borderRadius: "20px",
            fontWeight: "600", fontSize: 15
        }
    }
    return (
        <div style={{ width: "100%" }} className="overflow-y-hidden flex flex-row justify-center items-center">
            <div className='bg-gray-100 rounded-lg w-10/12 h-[90vh] py-4 overflow-auto flex flex-col justify-between'>

                <div>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            Select your preferred voice
                        </div>
                        <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>
                            <div className='w-full'>
                                {
                                    voices.map((item, index) => (
                                        <div style={{ border: item.id === toggleClick ? "2px solid #402FFF" : "" }} key={item.id} className='flex flex-row items-center border mt-4 p-2 justify-between h-[100px] px-8 rounded-xl'>
                                            <div className='flex flex-row items-center gap-4'>
                                                <div className='flex flex-row items-center justify-center' style={{ height: "62px", width: "62px", borderRadius: "50%", backgroundColor: item.id === toggleClick ? "white" : "#d3d3d380" }}>
                                                    <Image src={item.avatar} height={40} width={35} alt='*' />
                                                </div>
                                                <div>
                                                    {item.name}
                                                </div>
                                            </div>
                                            <div className='flex flex-row items-center gap-2'>
                                                <div>
                                                    <Image src={"/assets/voice.png"} height={15} width={23} alt='*' />
                                                </div>
                                                <button onClick={(e) => { handleToggleClick(item.id) }}>
                                                    <div className='flex flex-row items-center justify-center bg-white' style={{ height: "36px", width: "36px", border: "1px solid #00000080", borderRadius: "50%" }}>
                                                        <Image src={"/assets/play.png"} height={16} width={16} style={{ borderRadius: "50%" }} alt='*' />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleContinue} handleBack={handleBack} />
                </div>

            </div>
        </div>
    )
}

export default CreateAgentVoice