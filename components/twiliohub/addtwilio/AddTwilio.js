import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import CloseBtn from '@/components/globalExtras/CloseBtn';
import { Box, CircularProgress, Modal } from '@mui/material'
import { EyeSlash } from '@phosphor-icons/react';
import axios from 'axios';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const AddTwilio = ({
    showAddTwilio,
    handleClose,
    handleContinue,
    setTrustProducts,
    profileLoader,
    closeLoader,
    selectedUser
}) => {

    const [accountSID, setAccountSID] = useState("");
    const [showAccountSID, setShowAccountSID] = useState("");
    const [accountToken, setAccountToken] = useState("");
    const [showAccountToken, setShowAccountToken] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const [addTwilioLoader, setAddTwilioLoader] = useState(false);
    const [isExitLoader, setIsExitLoader] = useState(false);
    //show success snack
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

    //check if the values are entered
    useEffect(() => {
        if (!accountSID || !accountToken) {
            setIsDisabled(true)
        } else {
            setIsDisabled(false)
        }
    }, [accountSID, accountToken])

    //function to add the twilio
    const handleConnectTwilio = async (isExit = false) => {
        console.log("Is Exit value is", isExit);

        // return;
        try {
            if (isExit) {
                setIsExitLoader(true);
            } else {
                setAddTwilioLoader(true);
            }
            let ApiPath = Apis.addTwilio;
            if (selectedUser) {
                ApiPath = `${Apis.addTwilio}`
            }
            const token = AuthToken();
            let ApiData = {
                twilioAccountSid: accountSID,
                twilioAuthToken: accountToken,
            }
            if (selectedUser) {
                ApiData.userId = selectedUser.id
            }
            console.log("Api path for connect twilio is", ApiPath);
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });
            if (response) {
                console.log("Response of connect twilio", response);
                setAddTwilioLoader(false);
                setIsExitLoader(false);
                const ApiResponse = response.data;
                if (ApiResponse.status === true) {
                    // handleClose(ApiResponse);
                    // setTrustProducts(ApiResponse);
                    setShowSnack({
                        message: ApiResponse.message,
                        type: SnackbarTypes.Success,
                        isVisible: true
                    })
                    if (isExit) {
                        handleClose(ApiResponse);
                    } else {
                        handleContinue(ApiResponse);
                    }
                } else if (ApiResponse.status === false) {
                    setShowSnack({
                        message: ApiResponse.message,
                        type: SnackbarTypes.Error,
                        isVisible: true
                    })
                }
            }
        } catch (error) {
            setAddTwilioLoader(false);
            let errorMessage = "An unexpected error occurred";
            setIsExitLoader(false);

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
            setShowSnack({
                message: errorMessage,
                isVisible: true,
                type: SnackbarTypes.Error,
            });
            console.log("Error occured in connect twilio api is", error);
            console.log("Detailed Error occured in connect twilio api is", errorMessage);
        }
    }

    const styles = {
        regularFont: {
            fontSize: 15,
            fontWeight: 500
        }
    }

    return (
        <div className='w-full h-[100%] flex flex-col items-center'>
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
            <div className='overflow-auto w-full'>
                <div className='w-full flex flex-row items-center justify-between'>
                    <div
                        style={{
                            fontWeight: "700",
                            fontSize: 22
                        }}>
                        Account Configuration
                    </div>
                    <CloseBtn
                        onClick={() => handleClose()}
                    />
                </div>


                <div style={styles.regularFont}>
                    Enter your Twilio master account keys
                </div>
                <div className='mt-4' style={styles.regularFont}>
                    Master Account SID
                </div>
                <div className='mt-2 flex flex-row items-center justify-between h-[50px] ps-2 pe-4 border rounded-lg'>
                    <input
                        className='border-none outline-none focus:outline-transparent w-full focus:ring-0 focus:border-0'
                        placeholder='****************'
                        type={showAccountSID ? 'text' : 'password'}
                        value={accountSID}
                        onChange={(e) => {
                            setAccountSID(e.target.value);
                        }}
                    />
                    <button onClick={() => { setShowAccountSID(!showAccountSID) }}>
                        {showAccountSID ? (
                            <EyeSlash size={18} />
                        ) : (
                            <Image
                                src={"/twiliohubassets/showEye.jpg"}
                                alt='*'
                                height={12}
                                width={18}
                            />
                        )}
                    </button>
                </div>
                <div className='mt-2 ' style={{ fontWeight: "400", fontSize: 14 }}>
                    {`Your main account SID (Starting with AC...)`}
                </div>
                <div className='mt-4' style={styles.regularFont}>
                    Master Account Auth Token
                </div>
                <div className='mt-4 flex flex-row items-center justify-between h-[50px] ps-2 pe-4 border rounded-lg'>
                    <input
                        className='border-none outline-none focus:outline-transparent w-full focus:ring-0 focus:border-0'
                        placeholder='****************'
                        type={showAccountToken ? 'text' : 'password'}
                        value={accountToken}
                        onChange={(e) => {
                            setAccountToken(e.target.value);
                        }}
                    />
                    <button onClick={() => { setShowAccountToken(!showAccountToken) }}>
                        {showAccountToken ? (
                            <EyeSlash size={18} />
                        ) : (
                            <Image
                                src={"/twiliohubassets/showEye.jpg"}
                                alt='*'
                                height={12}
                                width={18}
                            />
                        )}
                    </button>
                </div>
            </div>
            <div className='w-full flex flex-row items-center justify-end mt-4'>
                {
                    (addTwilioLoader || profileLoader) ? (
                        <CircularProgress size={25} />
                    ) :
                        <button
                            className={`${isDisabled ? "bg-btngray text-black" : "bg-purple text-white"} w-[180px] h-[50px] rounded-lg px-6 outline-none border-none`}
                            onClick={() => { handleConnectTwilio(false) }}
                            disabled={addTwilioLoader || profileLoader || isDisabled || isExitLoader || closeLoader}
                        >
                            Continue
                        </button>
                }
            </div>
        </div>
    )
}

export default AddTwilio

// <Modal
//     open={showAddTwilio}
//     onClose={() => { handleClose() }}
//     BackdropProps={{
//         timeout: 200,
//         sx: {
//             backgroundColor: "#00000020",
//             backdropFilter: "blur(20px)"
//         },
//     }}
//     sx={{
//         zIndex: 1300,
//         // backgroundColor: "red"
//     }}
// >
//     <Box
//         className="rounded-xl max-w-2xl w-full shadow-lg bg-white border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col p-6"
//     // className="w-full h-[100%]"
// //     >
//     </Box>
// </Modal>