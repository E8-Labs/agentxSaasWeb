import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import CloseIcon from "@mui/icons-material/Close";
import { PauseCircle, PlayCircle } from "@phosphor-icons/react";
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';
import { PersistanceKeys } from '@/constants/Constants';

function AddVoiceMail({
    showAddNewPopup,
    setShowAddNewPopup,
    addVoiceMail,
    loading,
    showMessage,
    setShowMessage,
    messageType
}) {


    const manue = [

        {
            id: 1,
            name: 'Solar',
            type: "SolarRep"
        }, {
            id: 2,
            name: 'Insurance Agent',
            type: "InsuranceAgent"
        }, {
            id: 3,
            name: 'Loan Officer',
            type: "LoanOfficerAgent"
        }, {
            id: 4,
            name: 'SDR/BDR Agent',
            type: "SalesDevRep"
        }, {
            id: 5,
            name: "Marketing",
            type: "MarketerAgent"
        },
        {
            id: 6,
            name: "Other",
            type: "other"
        },
    ]

    const voices = [
        {
            id: 1,
            name: "Ava",
            voice_id: "SJzBm6fWJCplrpPNzyCV",
            preview: "/voicesList/Ava.MP3",

        }, {
            id: 2,
            name: "Axel",
            voice_id: "Pvvx65MwYBsyOsxiwygJ",
            preview: "/voicesList/Axel.MP3",

        },
    ]

    let m = `Hey, this is Sam. Just wanted to let you know your neighbor recently switched to solar and is saving big. Curious if you'd like to see how much you could save? Call me back at [your number]!`

    const [selectedManu, setSelectedManu] = useState(manue[0])
    const [selectedVoice, setSelectedVoice] = useState(voices[0].voice_id)
    const [audio, setAudio] = useState(false)
    const [preview, setPreview] = useState(false)
    const [message, setMessage] = useState(m)


    useEffect(() => {
        if (selectedManu.name === "Solar") {
            m = `Hey, this is Sam. Just wanted to let you know your neighbor recently switched to solar and is saving big. Curious if you'd like to see how much you could save? Call me back at [your number]!`
        } else if (selectedManu.name === "Insurance Agent") {
            m = `Hi, this is Lisa. I noticed some homeowners in your area updated their coverage and lowered their rates. Let's check if you're eligible too! Call me back at [your number]. Talk soon!`
        } else if (selectedManu.name === "Loan Officer") {
            m = `Hey, this is Mike. Rates have recently dropped, and I wanted to see if you'd like to explore refinancing or a new loan option. It could mean big savings! Call me at [your number] to chat!`
        } else if (selectedManu.name === "SDR/BDR Agent") {
            m = `Hey, this is Alex. I work with companies like yours to help streamline [specific pain point]. I'd love to share how we're making a big impact. Call me back at [your number] — talk soon!`
        } else if (selectedManu.name === "Marketing") {
            m = `Hey, this is Jamie. I saw you filled out our form on Facebook — thanks! I'd love to chat more about how we can help with [specific service/product]. Call me back at [your number]!`
        }else if (selectedManu.name === "Other") {
            m = ``
        }else{
            m = ``
        }

        setMessage(m)
    }, [selectedManu])


    const handleToggleClick = (item) => {
        setSelectedVoice(item.voice_id);
    };

    const playVoice = (url) => {
        // console.log('audio', audio)
        if (audio) {
            audio.pause();
        }
        const ad = new Audio(url); // Create a new Audio object with the preview URL
        ad.play();
        setAudio(ad); // Play the audio
    };
    return (
        <div>

            <Modal
                open={showAddNewPopup}
                onClose={() => setShowAddNewPopup(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        ////backdropFilter: "blur(5px)"
                    },
                }}
            >

                <Box
                    className="w-6/12"
                    sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
                >

                    <div
                        className="h-[80vh] overflow-auto flex flex-col gap-3"
                        style={{ scrollbarWidth: "none" }}
                    >

                        <div className="w-full flex flex-row items-center justify-between pb-4 border-b">
                            <div style={{ fontSize: 18, fontWeight: "700" }}>
                                New Voicemail
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddNewPopup(false);
                                }}
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div style={{ fontSize: 18, fontWeight: "700" }}>
                            Select From Template
                        </div>

                        <div className='w-full flex-row flex items-center gap-3 h-[55px]'
                            style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
                        >
                            {
                                manue.map((item) => (
                                    <button key={item.id}
                                        onClick={() => setSelectedManu(item === selectedManu ? "" : item)}
                                    >
                                        <div className='p-3 border-2 rounded-lg'
                                            style={{
                                                fontSize: 14, fontWeight: '500', whiteSpace: 'nowrap',
                                                borderColor: selectedManu?.id === item.id ? "#7902df" : "#15151510"
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                    </button>
                                ))
                            }
                        </div>

                        <div className='flex flex-row w-full items-center justify-between'>
                            <div className='flex flex-row items-center gap-2'>
                                <div style={{
                                    fontSize: 15, fontWeight: '500',
                                }}>
                                    Voicemail
                                </div>

                            </div>

                            <button onClick={() => setMessage("")}>
                                <div className='text-purple' style={{
                                    fontSize: 15, fontWeight: '500', textDecorationLine: 'underline'
                                }}
                                >
                                    Clear
                                </div>
                            </button>
                        </div>

                        <textarea
                            placeholder="Type here"
                            className="w-full border rounded p-2 outline-none outline-none focus:ring-0"
                            style={{
                                outline: "none",
                                border: "2px solid #00000010",
                                borderRadius: "5px",
                                padding: 12,
                                height: '156px',
                                resize: "none",
                            }}
                            maxLength={200}
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);

                            }}
                        />

                        <div style={{
                            fontSize: 14, fontWeight: '500',marginTop: -5,color:'#00000060'
                        }}>
                            {message?.length}/200
                        </div>

                        <div style={{
                            fontSize: 16, fontWeight: '700',
                        }}>
                            Select a voice
                        </div>

                        {voices.map((item, index) => (
                            <button
                                key={index}
                                style={{
                                    border:
                                        item.voice_id === selectedVoice
                                            ? "2px solid #7902DF"
                                            : "",
                                    backgroundColor:
                                        item.voice_id === selectedVoice ? "#402FFF10" : "",
                                }}
                                className="flex w-full flex-row items-center border mt-4 p-2 justify-between h-[68px] px-8 rounded-xl outline-none"
                                onClick={(e) => {
                                    handleToggleClick(item);
                                }}
                            >

                                <div
                                    className="text-start flex flex-row items-center gap-2"
                                    style={{
                                        fontSize: 17,
                                        fontWeight: "700",
                                    }}
                                >
                                    {item.name}

                                </div>
                                <div className="flex flex-row items-center gap-4">
                                    <div>
                                        <Image
                                            src={"/assets/voice.png"}
                                            height={15}
                                            width={23}
                                            alt="*"
                                        />
                                    </div>
                                    <div>

                                        <div>
                                            {preview === item.preview ? (
                                                <div
                                                    onClick={() => {
                                                        if (audio) {
                                                            audio.pause();
                                                        }
                                                        setPreview(null);
                                                    }}
                                                >
                                                    <PauseCircle size={38} weight="regular" />
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={(e) => {
                                                        setPreview(item.preview);
                                                        playVoice(item.preview);
                                                    }}
                                                >
                                                    <Image
                                                        src={"/assets/play.png"}
                                                        height={25}
                                                        width={25}
                                                        alt="*"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </button>
                        ))}
                        {
                            loading ? (
                                <div style={{ alignSelf: 'flex-end' }}>
                                    <CircularProgress size={25} />
                                </div>
                            ) : (
                                <button className='w-[197px] h-[55px] items-center justify-center rounded-lg bg-purple text-white mt-2'
                                    style={{ alignSelf: 'flex-end', fontWeight: '500' }}
                                    onClick={() => {
                                        let data = {
                                            message: message,
                                            voiceId: selectedVoice,
                                            agentType: selectedManu.type
                                        }
                                        addVoiceMail(data)
                                    }}
                                >
                                    Save
                                </button>
                            )
                        }
                    </div>
                </Box>

            </Modal>
        </div >
    )
}

export default AddVoiceMail


const styles = {
    modalsStyle: {
        height: "auto",
        bgcolor: "transparent",
        p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-50%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
}