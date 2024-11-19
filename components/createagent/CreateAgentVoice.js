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
import Apis from '../apis/Apis';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import voicesList from './Voices';

const CreateAgentVoice = ({ handleBack }) => {

    let synthKey = process.env.NEXT_PUBLIC_SynthFlowApiKey;

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const [voices, setVoices] = useState([]);
    const [voicesLoader, setVoicesLoader] = useState(false);

    useEffect(() => {
        setVoices(voicesList);
    }, []);

    // const getVoices = async () => {
    //     try {
    //         setVoicesLoader(true);
    //         const ApiPath = Apis.getVoices;
    //         // let AuthToken = null;
    //         // const LocalData = localStorage.getItem("User");
    //         // if (LocalData) {
    //         //     const UserDetails = JSON.parse(LocalData);
    //         //     AuthToken = UserDetails.token;
    //         // }

    //         console.log("Authentication key is :--", synthKey);
    //         console.log("Api Path is :--", ApiPath);

    //         const apiData = {
    //             workspace: "1711297163700x954223200313016300"
    //         }

    //         // const formData = new FormData();
    //         // formData.append("workspace", "1729549070290x741353643392630800")

    //         const response = await axios.post(ApiPath, apiData, {
    //             headers: {
    //                 "Authorization": "Bearer " + synthKey,
    //                 "Content-Type": "application/json"
    //             }
    //         });

    //         if (response) {
    //             // setVoices(response.data.data.voices);
    //             const data = JSON.parse(response.data);
    //             console.log("Response of getVoices api is :---", data);
    //         }

    //     } catch (error) {
    //         console.error("Error occured in vooices api is :--", error);
    //     } finally {
    //         setVoicesLoader(false);
    //     }
    // }


    const handleToggleClick = (id, item) => {
        setToggleClick(prevId => (prevId === id ? null : id));
        console.log("Selected voice is :", item.voice_id);
    }

    const handleContinue = () => {
        router.push("/sellerskycquestions")
    }

    const playVoice = (url) => {
        const audio = new Audio(url); // Create a new Audio object with the preview URL
        audio.play();                // Play the audio
    };

    const avatarImages = [
        "/assets/avatar1.png",
        "/assets/avatar2.png",
        "/assets/avatar3.png",
        // "/assets/avatar4.png",
        // "/assets/avatar5.png",
        // "/assets/avatar6.png",
        // "/assets/avatar7.png",
        // "/assets/avatar8.png",
        // "/assets/avatar9.png",
        // "/assets/avatar10.png",
    ];



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
                        {
                            voicesLoader ?
                                <div className='w-full flex flex-row justify-center mt-8'>
                                    <CircularProgress size={35} />
                                </div> :
                                <div className='w-full flex flex-row justify-center'>
                                    <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto'>
                                        {
                                            voices.map((item, index) => (
                                                <button
                                                    key={index}
                                                    style={{ border: index === toggleClick ? "2px solid #402FFF" : "" }}
                                                    className='flex flex-row items-center border mt-4 p-2 justify-between h-[100px] px-8 rounded-xl outline-none'
                                                    onClick={(e) => {
                                                        handleToggleClick(index, item);
                                                        playVoice(item.preview);
                                                    }}
                                                >
                                                    <div className='flex flex-row items-center gap-4'>
                                                        <div className='flex flex-row items-center justify-center' style={{ height: "62px", width: "62px", borderRadius: "50%", backgroundColor: index === toggleClick ? "white" : "#d3d3d380" }}>
                                                            {/* <Image src={"/assets/warning.png"} height={40} width={35} alt='*' /> */}
                                                            <Image
                                                                src={avatarImages[index % avatarImages.length]} // Deterministic selection
                                                                height={40}
                                                                width={35}
                                                                alt='*'
                                                            />
                                                        </div>
                                                        <div>
                                                            {item.name}
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-row items-center gap-2'>
                                                        <div>
                                                            <Image src={"/assets/voice.png"} height={15} width={23} alt='*' />
                                                        </div>
                                                        <div>
                                                            <div className='flex flex-row items-center justify-center bg-white' style={{ height: "36px", width: "36px", border: "1px solid #00000080", borderRadius: "50%" }}>
                                                                <Image src={"/assets/play.png"} height={16} width={16} style={{ borderRadius: "50%" }} alt='*' />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                        }
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