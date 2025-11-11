import React, { useState, useEffect } from 'react';
import { Box, Modal, CircularProgress } from '@mui/material';
import CloseBtn from '@/components/globalExtras/CloseBtn';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';

const AddEditTutorials = ({
    showModal,
    handleClose,
    handleSave,
    tutorialData = null, // Pass existing tutorial data for editing
    isLoading = false,
    isEditMode = false // New prop to determine if we're editing or adding
}) => {
    const [title, setTitle] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    
    // Show success/error snack
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

    // Initialize form with existing data when editing
    useEffect(() => {
        if (isEditMode && tutorialData) {
            setTitle(tutorialData.title || "");
            setVideoUrl(tutorialData.videoUrl || "");
        } else {
            setTitle("");
            setVideoUrl("");
        }
    }, [tutorialData, showModal, isEditMode]);

    // Check if the values are entered
    useEffect(() => {
        if (!title.trim() || !videoUrl.trim()) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [title, videoUrl]);

    const handleSaveClick = () => {
        if (!isDisabled) {
            const tutorialInfo = {
                title: title.trim(),
                videoUrl: videoUrl.trim()
            };
            handleSave(tutorialInfo);
        }
    };

    const handleCancelClick = () => {
        handleClose();
    };

    const styles = {
        regularFont: {
            fontSize: 15,
            fontWeight: 500
        }
    };

    return (
        <Modal
            open={showModal}
            onClose={handleCancelClick}
            BackdropProps={{
                timeout: 200,
                sx: {
                    backgroundColor: "#00000020",
                    backdropFilter: "blur(20px)"
                },
            }}
            sx={{
                zIndex: 1300,
            }}
        >
            <Box
                className="rounded-xl max-w-md w-full shadow-lg bg-white border-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col p-6"
            >
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
                
                <div className='w-full h-[100%] flex flex-col items-center'>
                    <div className='overflow-auto w-full'>
                        {/* Header */}
                        <div className='w-full flex flex-row items-center justify-between mb-6'>
                            <div
                                style={{
                                    fontWeight: "700",
                                    fontSize: 22
                                }}>
                                {isEditMode ? "Edit Video" : "Getting started"}
                            </div>
                            <CloseBtn
                                onClick={handleCancelClick}
                            />
                        </div>

                        {/* Title Input */}
                        <div className='mb-4'>
                            <div className='mb-2' style={styles.regularFont}>
                                Title
                            </div>
                            <div className='h-[50px] ps-3 pe-3 border rounded-lg flex items-center'>
                                <input
                                    className='border-none outline-none focus:outline-transparent w-full focus:ring-0 focus:border-0'
                                    placeholder='Type here...'
                                    type='text'
                                    value={title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Video URL Input */}
                        <div className='mb-6'>
                            <div className='mb-2' style={styles.regularFont}>
                                Video URL
                            </div>
                            <div className='h-[50px] ps-3 pe-3 border rounded-lg flex items-center'>
                                <input
                                    className='border-none outline-none focus:outline-transparent w-full focus:ring-0 focus:border-0'
                                    placeholder='URL'
                                    type='text'
                                    value={videoUrl}
                                    onChange={(e) => {
                                        setVideoUrl(e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className='w-full flex flex-row items-center justify-between'>
                        <button
                            className='text-gray-500 px-4 py-2 rounded-lg outline-none border-none hover:bg-gray-50 transition-colors'
                            onClick={handleCancelClick}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        {isLoading ? (
                            <CircularProgress size={25} />
                        ) : (
                            <button
                                className={`${isDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-purple text-white hover:bg-purple-700"} px-6 py-2 rounded-lg outline-none border-none transition-colors`}
                                onClick={handleSaveClick}
                                disabled={isDisabled || isLoading}
                            >
                                Save
                            </button>
                        )}
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export default AddEditTutorials;
