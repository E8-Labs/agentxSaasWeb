import { Box, CircularProgress, Modal } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react'
import CloseBtn from '@/components/globalExtras/CloseBtn';

const DuplicateConfirmationPopup = ({
    open,
    handleClose,
    handleDuplicate,
    duplicateLoader = false
}) => {


    return (
        <div>
            {/* Code to del user */}
            <Modal
                open={open}
                onClose={handleClose}
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
                                    Duplicate Agent
                                </div>
                                <div
                                    style={{
                                        direction: "row",
                                        display: "flex",
                                        justifyContent: "end",
                                    }}
                                >
                                    <CloseBtn
                                        onClick={handleClose}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <div style={{ fontWeight: "600", fontSize: 22 }}>
                                    Are you sure you want to duplicate this agent?
                                </div>

                            </div>
                        </div>

                        <div className="mt-4 flex flex-row items-center gap-4 mt-6 ">
                            <button
                                className="w-1/2 text-[#6b7280] h-[50px]"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <div className="w-1/2">
                                {duplicateLoader ? (
                                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                                        <CircularProgress size={25} />
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
                                        onClick={handleDuplicate}
                                    >
                                        Yes. Duplicate
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default DuplicateConfirmationPopup

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