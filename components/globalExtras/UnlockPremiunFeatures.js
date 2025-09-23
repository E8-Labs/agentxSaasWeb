import { Box, CircularProgress, Modal } from '@mui/material'
import React, { useState } from 'react'
import CloseBtn from './CloseBtn'
import Image from 'next/image'
import { AuthToken } from '../agency/plan/AuthDetails'
import Apis from '../apis/Apis'
import axios from 'axios'
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage'

const UnlockPremiunFeatures = ({
    open,
    handleClose
}) => {

    const [requestLoader, setRequestLoader] = useState(false);
    //code for snack messages    
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);

    const requestFeatureFromAgency = async () => {
        try {
            setRequestLoader(true);
            const Token = AuthToken();
            const ApiPath = Apis.requestFeatureFromAgency;
            const ApiData = {
                featureTitle: ""
            }
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": `Bearer ${Token}`,
                    "Content-Type": "application/json",
                }
            });
            if (response.data.status === true) {
                setRequestLoader(false);
                setSnackMsg("Request sent.");
                setSnackMsgType(SnackbarTypes.Success)
                handleClose();
            } else if (response.data.status === false) {
                setRequestLoader(false);
                setSnackMsg(response.data.message);
                setSnackMsgType(SnackbarTypes.Error);
            }
        } catch (error) {
            setRequestLoader(false);
            console.error("Error occured in request feature api is", error)
        }
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropProps={{
                timeout: 100,
                sx: {
                    backgroundColor: "#00000040",
                    backdropFilter: "blur(10px)",
                },
            }}
        >
            <Box className="flex justify-center items-center w-full h-full">
                <div className="bg-white rounded-2xl p-8 max-w-lg w-[90%] relative shadow-2xl">
                    {/* Show snack message */}
                    <AgentSelectSnackMessage
                        isVisible={snackMsg !== null}
                        message={snackMsg}
                        hide={() => { setSnackMsg(null) }}
                        type={snackMsgType}
                    />
                    {/* Header with Title and Close Button */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-black text-2xl font-bold">
                            Unlock Premium Features
                        </div>
                        <CloseBtn
                            onClick={() => { handleClose() }}
                        />
                    </div>

                    {/* Plan Offer Section */}
                    <div className="flex items-start gap-4 mb-8">
                        {/* Icon */}
                        <Image src={"/otherAssets/premiumFeatures.png"} alt="premium-feature" width={107} height={107} />
                        <div className="text-md text-gray-600">
                            This feature is only available on premium plans. Your agency will need to enable this for you. You can request this below.
                        </div>
                    </div>

                    {/* Action Buttons */}

                    {
                        requestLoader ? (
                            <div className="flex items-center justify-center">
                                <CircularProgress size={20} />
                            </div>
                        ) : (
                            <button
                                onClick={requestFeatureFromAgency}
                                className="w-full bg-purple text-white py-3 px-6 rounded-xl text-[15px] font-bold transition-colors"
                            >
                                Request Feature
                            </button>
                        )
                    }

                </div>
            </Box>
        </Modal>
    )
}

export default UnlockPremiunFeatures