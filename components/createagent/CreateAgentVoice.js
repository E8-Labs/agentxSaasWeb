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
import { PauseCircle, PlayCircle } from '@phosphor-icons/react';

const CreateAgentVoice = ({ handleBack }) => {

    let synthKey = process.env.NEXT_PUBLIC_SynthFlowApiKey;

    const router = useRouter();
    const [toggleClick, setToggleClick] = useState(false);
    const [voices, setVoices] = useState([]);
    const [voicesLoader, setVoicesLoader] = useState(false);
    const [selectedVoiceId, setSelectedVoiceId] = useState("");
    const [preview, setPreview] = useState("");

    useEffect(() => {
        setVoices(voicesList);
    }, []);


    const handleToggleClick = (id, item) => {
        setToggleClick(prevId => (prevId === id ? null : id));
        // console.log("Selected voice is :", item.voice_id);
        setSelectedVoiceId(item.voice_id);
    }

    const handleContinue = async () => {

        try {
            setVoicesLoader(true);
            let AuthToken = null;
            let mainAgentId = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            console.log("Auth token is ", AuthToken);

            const mainAgentData = localStorage.getItem("agentDetails");
            if (mainAgentData) {
                const Data = JSON.parse(mainAgentData);
                console.log("Localdat recieved is :--", Data);
                mainAgentId = Data.id;
            }

            const ApiPath = Apis.updateAgent;
            // const ApiData = {}
            const formData = new FormData();
            console.log("selected voice id is:", selectedVoiceId);
            formData.append("mainAgentId", mainAgentId);
            // return
            formData.append("voiceId", toggleClick);
            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key} : ${value}`)
            // }

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    // "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of update api is :", response.data);
                if (response.data.status === true) {
                    router.push("/sellerskycquestions")
                }
            }

        } catch (error) {
            console.error("ERror occured in api is error0", error);
        } finally {
            setVoicesLoader(false);
        }
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
            <div className='bg-white rounded-2xl w-10/12 h-[90vh] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple flex flex-col justify-between'>

                <div>
                    {/* header */}
                    <Header />
                    {/* Body */}
                    <div className='flex flex-col items-center px-4 w-full'>
                        <div className='mt-6 w-11/12 md:text-4xl text-lg font-[700]' style={{ textAlign: "center" }}>
                            Select your preferred voice
                        </div>
                        <div className='w-full flex flex-row justify-center'>
                            <div className='mt-8 w-6/12 gap-4 flex flex-col max-h-[50vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple'>
                                {
                                    voices.map((item, index) => (
                                        <button
                                            key={index}
                                            style={{ border: index === toggleClick ? "2px solid #402FFF" : "" }}
                                            className='flex flex-row items-center border mt-4 p-2 justify-between h-[100px] px-8 rounded-xl outline-none'
                                            onClick={(e) => {
                                                handleToggleClick(index, item);
                                                // playVoice(item.preview);
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
                                                {/* <div>
                                                    <div className='flex flex-row items-center justify-center bg-white' style={{ height: "36px", width: "36px", border: "1px solid #00000080", borderRadius: "50%" }}>
                                                        <Image src={"/assets/play.png"} height={16} width={16} style={{ borderRadius: "50%" }} alt='*' />
                                                    </div>
                                                </div> */}
                                                <div>
                                                    {
                                                        preview === item.preview ?
                                                            <PauseCircle size={38} weight='regular' /> :
                                                            <div onClick={(e) => {
                                                                setPreview(item.preview);
                                                                playVoice(item.preview);
                                                            }}>
                                                                <PlayCircle size={38} weight='regular' />
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>
                        </div>
                        {/* {
                            voicesLoader ?
                                <div className='w-full flex flex-row justify-center mt-8'>
                                    <CircularProgress size={35} />
                                </div> :
                                
                        } */}
                    </div>
                </div>

                <div>
                    <div>
                        <ProgressBar value={33} />
                    </div>

                    <Footer handleContinue={handleContinue} handleBack={handleBack} registerLoader={voicesLoader} donotShowBack={true} />
                </div>

            </div>
        </div>
    )
}

export default CreateAgentVoice;
