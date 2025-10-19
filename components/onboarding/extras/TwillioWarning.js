import CloseBtn from '@/components/globalExtras/CloseBtn';
import { Box, CircularProgress, Modal } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react'
import { AddAgencyTwilioKeyModal } from './StickyModals';

const TwillioWarning = ({
    open,
    handleClose,
    // handleDeleteUser,
    delLoader,
}) => {

    const [showAddKeyModal, setShowAddKeyModal] = useState(false);

    return (
        <div>
            {/* Code to del user */}
            <Modal
                open={open}
                onClose={() => { handleClose() }}
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
                                {/* <div style={{ width: "20%" }} /> */}
                                <div style={{ fontWeight: "500", fontSize: 17 }}>
                                    Heads Up!
                                </div>
                                <div
                                    style={{
                                        direction: "row",
                                        display: "flex",
                                        justifyContent: "end",
                                    }}
                                >
                                    <CloseBtn onClick={() => { handleClose() }} />
                                </div>
                            </div>

                            <div className="mt-6">
                                <div style={{ fontWeight: "600", fontSize: 22 }}>
                                    Add your Twilio API Keys to start calls.
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-row items-center gap-4 mt-6">
                            <button onClick={() => { handleClose() }} className="w-1/2">
                                Cancel
                            </button>
                            <div className="w-1/2">
                                {
                                    delLoader ? (
                                        <div className='w-full flex flex-row items-center justify-center h-[50px]'>
                                            <CircularProgress size={35} />
                                        </div>
                                    ) : (
                                        <button
                                            className="outline-none bg-red"
                                            style={{
                                                color: "white",
                                                height: "50px",
                                                borderRadius: "10px",
                                                width: "100%",
                                                fontWeight: 600,
                                                fontSize: "20",
                                            }}
                                            onClick={() => { setShowAddKeyModal(true) }}
                                        >
                                            Connect Twilio
                                        </button>)
                                }
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>

            <AddAgencyTwilioKeyModal
                showAddKeyModal={showAddKeyModal}
                handleClose={(d) => {
                    setShowAddKeyModal(false);
                    if (d) {
                        // showSuccess(d);
                        handleClose(d);
                        // isTwilioAdded({ status: false });
                    }
                }}
            />

        </div>
    )
}

export default TwillioWarning

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