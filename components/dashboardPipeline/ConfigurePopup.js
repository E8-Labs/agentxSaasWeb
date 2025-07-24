import React, { useState, useEffect } from 'react';
import { Modal, Box, CircularProgress } from '@mui/material';
import Image from 'next/image';
import CloseBtn from '../globalExtras/CloseBtn';
import axios from 'axios';
import Apis from '../apis/Apis';
import { AuthToken } from '../agency/plan/AuthDetails';
import { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage';

const ConfigurePopup = ({
    showConfigurePopup,
    setShowConfigurePopup,
    configureLoader,
    setConfigureLoader,
    selectedStage,
    setStagesList,
    setSnackMessage,
    handleCloseStagePopover
}) => {

    const [configureValue, setConfigureValue] = useState("");
    const [isDisable, setIsDisable] = useState(true);
    console.log("Selected stage passed is", selectedStage);

    //set the default value
    useEffect(() => {
        setConfigureValue(selectedStage.description);
    }, []);

    //check for disable state
    useEffect(() => {
        if (configureValue.length > 0) {
            setIsDisable(false);
        } else {
            setIsDisable(true);
        }
    }, [configureValue]);

    //handle add/update configure
    const handleAddUpdateConfigure = async () => {
        console.log("add/update configure");
        try {
            setConfigureLoader(true);
            const token = AuthToken();
            const ApiPath = Apis.UpdateStage;
            const formData = new FormData();

            formData.append("stageId", selectedStage.id);
            formData.append("pipelineId", selectedStage.pipelineId);
            formData.append("description", configureValue);

            for (let [key, value] of formData) {
                console.log(`${key} ===== ${value}`);
            }

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                //response success
                if (response.data.status === true) {
                    setConfigureLoader(false);
                    console.log("Response of api is", response.data);
                    setSnackMessage({ message: response.data.message, type: SnackbarTypes.Success });
                    setStagesList(response.data.data.stages);
                    handleCloseStagePopover();
                    setShowConfigurePopup(false);
                }
                else {
                    setConfigureLoader(false);
                    setSnackMessage({ message: response.data.message, type: SnackbarTypes.Error });
                }
            }

        } catch (error) {
            console.log("error occured in api is", error);
            setConfigureLoader(false);
        }
    }

    const styles = {
        modalsStyle: {
            height: "auto",
            bgcolor: "transparent",
            p: 2,
            mx: "auto",
            my: "50vh",
            transform: "translateY(-55%)",
            borderRadius: 2,
            border: "none",
            outline: "none",
        },
    }

    return (
        <div>
            <Modal
                open={showConfigurePopup}
                onClose={() => {
                    setShowConfigurePopup(false);
                }}
                BackdropProps={{
                    timeout: 200,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
                    sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
                >
                    <div style={{ width: "100%" }}>
                        <div className='flex justify-between items-center'>
                            <div className='text-2xl font-bold'>
                                Configure
                            </div>
                            <div>
                                <CloseBtn onClick={() => { setShowConfigurePopup(false); }} />
                            </div>
                        </div>
                        <div className='mt-4 border rounded-md '>
                            <textarea
                                className='w-full border-none outline-none focus:ring-0 rounded-md'
                                placeholder='Type here...'
                                rows={3}
                                value={configureValue}
                                onChange={(e) => { setConfigureValue(e.target.value); }}
                                style={{ resize: "none" }}
                            />
                        </div>
                        <button
                            className={`w-full h-[45px] text-center mt-4 rounded-md ${isDisable ? "bg-btngray text-black" : "bg-purple text-white"}`}
                            disabled={isDisable || configureLoader}
                            onClick={handleAddUpdateConfigure}
                        >
                            {
                                configureLoader ? (
                                    <div className='flex justify-center items-center'>
                                        <CircularProgress size={20} />
                                    </div>
                                ) : (
                                    "Continue"
                                )
                            }
                        </button>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default ConfigurePopup
