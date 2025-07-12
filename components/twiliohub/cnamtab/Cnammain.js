"use client"
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { Box, CircularProgress, Modal } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const Cnammain = ({
    showAddCNAM,
    handleClose
}) => {

    const [agreeTerms, setAgreeTerms] = useState(false);
    const [cnamName, setCnamName] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const [loader, setLoader] = useState(false);
    //show snack
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

    useEffect(() => {
        if (!cnamName || !agreeTerms) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [cnamName, agreeTerms])

    //toggle agree terms click
    const handleToggleTermsClick = () => {
        setAgreeTerms(!agreeTerms);
    };

    const handleAddCnam = async () => {
        try {
            setLoader(true);
            const token = AuthToken();
            const ApiPath = Apis.createCname;
            const ApiData = {
                displayName: cnamName
            }

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                setLoader(false);
                const apiResponse = response.data;
                console.log("Response of add cnam is", response.data);
                if (apiResponse.status === true) {
                    handleClose(apiResponse);
                } else if (apiResponse.status === false) {
                    setShowSnack({
                        type: SnackbarTypes.Error,
                        message: "",
                        isVisible: true
                    })
                }
            }

        } catch (error) {
            setLoader(false);
            let errorMessage = "An unexpected error occurred";

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with a status other than 2xx
                    errorMessage = error.response.data?.message || JSON.stringify(error.response.data);
                } else if (error.request) {
                    // Request was made but no response received
                    errorMessage = "No response received from server.";
                } else {
                    // Something happened in setting up the request
                    errorMessage = error.message;
                }
            } else {
                errorMessage = error.message || String(error);
            }
            console.log("Error occured in api", errorMessage);
        }
    }

    //stylles
    const styles = {
        normalTxt: {
            fontWeight: "500",
            fontSize: 15
        }
    }

    return (
        <Modal
            open={showAddCNAM}
            onClose={() => {
                handleClose();
            }}
            BackdropProps={{
                timeout: 200,
                sx: {
                    backgroundColor: "#00000020",
                    backdropFilter: "blur(20px)"
                },
            }}
            sx={{
                zIndex: 1300,
                // backgroundColor: "red"
            }}
        >
            <Box
                className="rounded-xl max-w-2xl w-full shadow-lg bg-white border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col p-6"
            // className="w-full h-[100%]"
            >
                <div className='w-full flex flex-col items-center justify-between'>
                    <AgentSelectSnackMessage
                        type={showSnack.type}
                        message={showSnack.message}
                        isVisible={showSnack.isVisible}
                        hide={() => {
                            setShowSnack({
                                message: "",
                                isVisible: false,
                                type: SnackbarTypes.Success,
                            });
                        }}
                    />
                    <div className='w-full overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple pb-2 px-2'>
                        <div className='w-full mt-8 flex flex-row items-center justify-between'>
                            <div
                                style={{
                                    fontWeight: "700",
                                    fontSize: 22
                                }}>
                                CNAM
                            </div>
                            <button
                                className='border-none outline-none'
                                onClick={() => { handleClose() }}>
                                <Image
                                    src={"/assets/cross.png"}
                                    alt='cross'
                                    height={18}
                                    width={18}
                                />
                            </button>
                        </div>
                        <div
                            className='mt-2'
                            style={{ fontWeight: "700", fontSize: 17 }}>
                            {`Enter a display name for CNAM`}
                        </div>
                        <div className='mt-2' style={styles.normalTxt}>
                            This name will show on your customers phone when you call them. You can display uptill 15 characters. The display name will be vetted for appropriateness and relevance to your Business.
                        </div>
                        <div className='mt-4 flex flex-row items-center w-full justify-between'>
                            <div
                                style={styles.normalTxt}>
                                CNAM display name*
                            </div>
                            <div
                                style={styles.normalTxt}>
                                {cnamName.length}/15
                            </div>
                        </div>
                        <div className='w-full mt-2 border rounded-lg p-2'>
                            <input
                                className='border-none h-[50px] outline-none focus:outline-transparent w-full focus:ring-0 focus:border-none'
                                style={styles.normalTxt}
                                placeholder='Name'
                                value={cnamName}
                                onChange={(e) => { setCnamName(e.target.value) }}
                                maxLength={15}
                            />
                        </div>
                        <div className='flex flex-row items-start gap-2 px-4 py-2 rounded-lg bg-[#00000005] mt-4'>
                            <button onClick={handleToggleTermsClick}>
                                {agreeTerms ? (
                                    <div
                                        className="bg-purple flex flex-row items-center justify-center rounded"
                                        style={{ height: "24px", width: "24px" }}
                                    >
                                        <Image
                                            src={"/assets/whiteTick.png"}
                                            height={8}
                                            width={10}
                                            alt="*"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="bg-none border-2 flex flex-row items-center justify-center rounded"
                                        style={{ height: "24px", width: "24px" }}
                                    ></div>
                                )}
                            </button>
                            <div style={{
                                fontWeight: "400",
                                fontSize: 13
                            }}>
                                {`I certify that the associated Business profile is the originator of the phone calls and certify that the display name represents my business`}
                            </div>
                        </div>
                    </div>
                    <div className='w-full flex flex-row items-center gap-4 mt-8'>
                        {/*<button
                            className='text-purple w-1/2 bg-purple10 h-[50px] rounded-lg outline-none border-none'
                            style={styles.regularFont}
                            onClick={handleClose}>
                            Exit
                        </button>*/}
                        <button
                            className={`${isDisabled ? "bg-btngray text-black" : "bg-purple text-white"} w-full h-[50px] rounded-lg px-6 outline-none border-none`}
                            onClick={handleAddCnam}
                            disabled={loader || isDisabled}
                        >
                            {
                                loader ? (
                                    <CircularProgress size={25} />
                                ) : ("Continue")
                            }
                        </button>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default Cnammain
