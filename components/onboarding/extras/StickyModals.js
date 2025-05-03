import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { Box, CircularProgress, Modal } from '@mui/material';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export const TwilioWarning = ({
    agencyData,
    showSuccess
}) => {

    const router = useRouter();

    // console.log("User data passed to twilio is", agencyData);

    //code for modal
    const [showAddKeyModal, setShowAddKeyModal] = useState(false);
    const [showAddTwilioWarning, setShowAddTwiliowarning] = useState(false);

    useEffect(() => {
        if (agencyData.isTwilioConnected === false) {
            setShowAddTwiliowarning(true);
        } else {
            setShowAddTwiliowarning(false);
        }
    }, [agencyData])



    return (
        <div className='w-full'>
            {
                showAddTwilioWarning && (
                    <div className='w-full'>
                        {/*<Modal
                    open={true}
                    className="border-none outline-none"
                    BackdropProps={{
                        style: { backgroundColor: 'transparent' }
                    }}
                >
                <Box className="w-full flex flex-row items-center justify-center border-none outline-none" sx={{ backgroundColor: "transparent" }}>*/}
                        <div className="flex flex-row items-center bg-red shadow-lg p-2 w-full">
                            <Image alt="error" src={"/assets/salmanassets/danger_conflict.svg"} height={40} width={40} />
                            <div className="text-white" style={{
                                fontWeight: "500",
                                fontSize: "15px"
                            }}>
                                Add your Twilio API Keys to start calls
                            </div>
                            <button
                                className="bg-none text-white text-lg outline-none border-b-4 border-white p-0 m-0 leading-none ms-2"
                                onClick={() => setShowAddKeyModal(true)}
                                style={{
                                    fontWeight: "700",
                                    fontSize: "15px",
                                    lineHeight: "1", // Ensures no extra vertical space
                                }}
                            >
                                Add Key
                            </button>

                        </div>
                        <AddAgencyTwilioKeyModal
                            showAddKeyModal={showAddKeyModal}
                            handleClose={(d) => {
                                setShowAddKeyModal(false);
                                if (d) {
                                    showSuccess(d);
                                    setShowAddTwiliowarning(false);
                                }
                            }}
                        />
                    </div>
                )
            }
        </div>
    )
}


export const AddAgencyTwilioKeyModal = ({
    showAddKeyModal,
    handleClose,
}) => {

    const [sid, setSid] = useState("");
    const [twilioAuthToken, setTwilioAuthToken] = useState("");

    const [twillioLoader, setTwillioLoader] = useState(false);
    const [showSnackMessage, setShowSnackMessage] = useState(null);
    const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Error);

    //add twilio key
    const handleSetUpTwillio = async () => {
        try {
            setTwillioLoader(true);
            const Token = AuthToken();
            const ApiPAth = Apis.setUpAgencyTwilioKey;

            const formData = new FormData();

            formData.append("twilioSid", sid);
            formData.append("twilioAuthToken", twilioAuthToken);

            for (let [key, value] of formData.entries()) {
                console.log(`${key} = ${value}`);
            }

            const response = await axios.post(ApiPAth, formData, {
                headers: {
                    "Authorization": "Bearer " + Token,
                }
            });

            if (response) {
                console.log("Response of add twilio api is", response);
                setTwillioLoader(false);
                if (response.data.status === true) {
                    console.log("Sendin the success message");
                    const localData = localStorage.getItem("User");
                    if (localData) {
                        let d = JSON.parse(localData);
                        d.user.isTwilioConnected = true;
                        localStorage.setItem("User", JSON.stringify(d));
                        handleClose(response.data.message);
                    }
                } else if (response.data.status === false) {
                    setShowSnackMessage(response.data.message);
                }
            }

        } catch (error) {
            console.error("Error occured in twillio api is", error);
            setTwillioLoader(false);
        }
    }

    //close modal
    const closeModal = () => {
        handleClose();
        setSid("");
        setTwilioAuthToken("");
    }

    return (
        <Modal
            open={showAddKeyModal}
            className="border-none outline-none"
            BackdropProps={{
                style: { backgroundColor: '#00000020' }
            }}
        >
            <Box
                //  className="w-6/12 md:5/12 lg:w-4/12 bg-white shadow-lg p-6 rounded-lg flex flex-row items-center justify-center border-none outline-none"
                className="bg-white rounded-xl p-6 max-w-md w-[95%] max-h-[90vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col"
            >
                <div className='w-full'>
                    <AgentSelectSnackMessage
                        isVisible={showSnackMessage}
                        hide={() => {
                            setShowSnackMessage(null);
                        }}
                        type={showSnackType}
                        message={showSnackMessage}
                    />
                    <div className='w-full flex flex-row items-center justify-between'>
                        <div style={{
                            fontWeight: "600",
                            fontSize: "22px"
                        }}>
                            Edit Twilio API Key
                        </div>
                        <button
                            className='outline-none border-none'
                            onClick={() => { closeModal() }}
                        >
                            <Image
                                alt='*'
                                src={"/assets/cross.png"}
                                height={15}
                                width={15}
                            />
                        </button>
                    </div>
                    <div style={styles.mediumTxt}>
                        SSID
                    </div>
                    <div>
                        <input
                            value={sid}
                            onChange={(e) => { setSid(e.target.value) }}
                            style={styles.inputTxt}
                            placeholder='Enter SSID'
                            className='border border-[#00000010] focus:border-purple outline-none rounded-md mt-2 w-full focus:ring-0 focus:outline-none'
                        />
                    </div>
                    <div style={styles.mediumTxt}>
                        Key
                    </div>
                    <div>
                        <input
                            value={twilioAuthToken}
                            onChange={(e) => { setTwilioAuthToken(e.target.value) }}
                            style={styles.inputTxt}
                            placeholder='Enter Key'
                            className='border border-[#00000010] focus:border-purple outline-none rounded-md mt-2 w-full focus:ring-0 focus:outline-none'
                        />
                    </div>
                    <div className='w-full flex flex-row items-center justify-between mt-4'>
                        <button
                            className='text-purple w-1/2'
                            onClick={() => { closeModal() }}
                        >
                            Cancel
                        </button>

                        <div className='w-1/2 flex flex-row items-center justify-center'>
                            {
                                twillioLoader ? (
                                    <CircularProgress size={35} />
                                ) : (
                                    <div className='w-full flex flex-row items-center justify-end'>
                                        <button
                                            className='bg-purple text-white p-2 rounded-md w-5/6'
                                            onClick={handleSetUpTwillio}
                                        >
                                            Save
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

const styles = {
    mediumTxt: {
        fontWeight: "500",
        fontSize: "15px",
        marginTop: 20
    },
    inputTxt: {
        fontWeight: "500",
        fontSize: "15px"
    }
}