import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import CloseIcon from "@mui/icons-material/Close";
import { PauseCircle, PlayCircle } from "@phosphor-icons/react";
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import { PersistanceKeys } from '@/constants/Constants';
import { PromptTagInput } from '@/components/pipeline/tagInputs/PromptTagInput';

function EditVoicemailModal({
    showEditPopup,
    setShowEditPopup,
    updateVoicemail,
    loading,
    defaultData,
    kycsData,
    uniqueColumns
}) {

    // console.log('defaulData', defaultData?.message)


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


    const [selectedVoice, setSelectedVoice] = useState(defaultData?.voiceId)
    const [audio, setAudio] = useState(false)
    const [preview, setPreview] = useState(false)
    const [message, setMessage] = useState(defaultData?.message)


    useEffect(() => {
        const updateData = () => {
            if (defaultData) {
                setSelectedVoice(defaultData.voiceId)
                setMessage(defaultData.message)
            }
        }

        updateData()
    }, [defaultData])

    // console.log('defaultData', defaultData)





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
                open={showEditPopup}
                onClose={() => setShowEditPopup(false)}
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
                    className="w-5/12"
                    sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
                >
                    <div
                        className="h-[50vh] overflow-auto flex flex-col gap-3"
                        style={{ scrollbarWidth: "none" }}
                    >

                        <div className="w-full flex flex-row items-center justify-between pb-4 border-b">
                            <div style={{ fontSize: 18, fontWeight: "700" }}>
                                Edit Voicemail
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditPopup(false);
                                }}
                            >
                                <CloseIcon />
                            </button>
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

                        {/*
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
                        */}

                        <div className="mt-4 w-full">
                            <PromptTagInput
                                promptTag={message}
                                kycsList={kycsData}
                                uniqueColumns={uniqueColumns}
                                tagValue={setMessage}
                                // scrollOffset={scrollOffset}
                                showSaveChangesBtn={message}
                                from={"Voicemail"}
                                isEdit={true}
                                saveUpdates={async () => {
                                    // await updateAgent();
                                    // setShowObjectionsSaveBtn(false);
                                    // setOldObjective(objective);
                                }}
                                limit={200}
                            />

                            {/* <DynamicDropdown /> */}
                        </div>

                        <div style={{
                            fontSize: 14, fontWeight: '500', marginTop: -5, color: '#00000060'
                        }}>
                            {message?.length}/200
                        </div>




                        {/* <div style={{
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
                        ))} */}
                        {
                            loading ? (
                                <div style={{ alignSelf: 'flex-end' }}>
                                    <CircularProgress size={25} />
                                </div>
                            ) : (
                                <button className="text-white bg-purple outline-none rounded-xl  mt-4"
                                    style={{ height: "50px", width: "100px", alignSelf: 'flex-end' }}
                                    onClick={() => {
                                        let data = {
                                            message: message,
                                            voiceId: selectedVoice,
                                        }
                                        updateVoicemail(data)
                                    }}
                                >
                                    Update
                                </button>
                            )
                        }
                    </div>
                </Box>

            </Modal>
        </div>
    )
}

export default EditVoicemailModal


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