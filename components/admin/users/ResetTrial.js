import { Box, CircularProgress, Modal } from '@mui/material';
import { Image } from '@phosphor-icons/react';
import React from 'react';

const ResetTrial = ({
    handleClose,
    showConfirmationPopup,
    onContinue,
    loader
}) => {
    return (
        <Modal
            open={showConfirmationPopup}
        // onClick={()=>setShowConfirmationPopup(false)}
        // onClose={}
        >
            <Box
                className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
                sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
            >
                <div style={{ width: "100%" }}>
                    <div
                        className="max-h-[60vh] overflow-auto"
                        style={{ scrollbarWidth: "none" }}
                    >
                        <div
                            style={{
                                width: "100%",
                                direction: "row",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >


                        </div>

                        <div className="mt-6">
                            <div style={{ fontWeight: "600", fontSize: 22 }}>
                                Are you sure you want to reset trail
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-row items-center gap-4 mt-6">
                        <button onClick={handleClose} className="w-1/2">
                            Cancel
                        </button>
                        <div className="w-1/2">
                            {
                                loader ? (
                                    <div className='w-full flex flex-row items-center justify-center h-[50px]'>
                                        <CircularProgress size={35} />
                                    </div>
                                ) : (
                                    <button
                                        className="outline-none bg-purple"
                                        style={{
                                            color: "white",
                                            height: "50px",
                                            borderRadius: "10px",
                                            width: "100%",
                                            fontWeight: 600,
                                            fontSize: "20",
                                        }}
                                        onClick={onContinue}
                                    >
                                        Continue
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default ResetTrial;
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