import { Box, CircularProgress, Modal } from '@mui/material';
import Image from 'next/image';
import React, { useState } from 'react'

const DelAdminUser = ({
    showDeleteModal,
    handleClose,
    handleDeleteUser,
    delLoader,
    //pause user variables
    showPauseModal,
    handleClosePauseModal,
    handlePaueUser,
    pauseLoader,
    selectedUser
}) => {

    return (
        <div>
            {/* Code to del user */}
            <Modal
                open={showDeleteModal}
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
                                    Delete {selectedUser?.name}
                                </div>
                                <div
                                    style={{
                                        direction: "row",
                                        display: "flex",
                                        justifyContent: "end",
                                    }}
                                >
                                    <button
                                        onClick={handleClose}
                                        className="outline-none"
                                    >
                                        <Image
                                            src={"/svgIcons/crossIcon.svg"}
                                            height={40}
                                            width={40}
                                            alt="*"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div style={{ fontWeight: "600", fontSize: 22 }}>
                                    This is irreversible. Are you sure?
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-row items-center gap-4 mt-6">
                            <button onClick={handleClose} className="w-1/2">
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
                                            onClick={handleDeleteUser}
                                        >
                                            Yes! Delete User
                                        </button>)
                                }
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>

            {/* Code to pause user */}
            <Modal
                open={showPauseModal}
                onClose={handleClosePauseModal}
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
                                    {
                                        selectedUser?.profile_status === "paused" ? "Resume" : "Pause"
                                    } {selectedUser?.name}
                                </div>
                                <div
                                    style={{
                                        direction: "row",
                                        display: "flex",
                                        justifyContent: "end",
                                    }}
                                >
                                    <button
                                        onClick={handleClosePauseModal}
                                        className="outline-none"
                                    >
                                        <Image
                                            src={"/svgIcons/crossIcon.svg"}
                                            height={40}
                                            width={40}
                                            alt="*"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div style={{ fontWeight: "600", fontSize: 22 }}>
                                    Are you sure to  {
                                        selectedUser?.profile_status === "paused" ? "Resume" : "Pause"
                                    }?
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-row items-center gap-4 mt-6">
                            <button onClick={handleClosePauseModal} className="w-1/2">
                                Cancel
                            </button>
                            <div className="w-1/2">
                                {/*delLoader ? (
                                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                                        <CircularProgress size={25} />
                                    </div>
                                ) : (*/}
                                {pauseLoader ? (
                                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                                        <CircularProgress size={25} />
                                    </div>
                                ) : (
                                    <button
                                        className={`outline-none ${selectedUser?.profile_status === "paused" ? "bg-purple" : "bg-red"}`}
                                        style={{
                                            color: "white",
                                            height: "50px",
                                            borderRadius: "10px",
                                            width: "100%",
                                            fontWeight: 600,
                                            fontSize: "20",
                                        }}
                                        onClick={handlePaueUser}
                                    >
                                        Yes!  {
                                            selectedUser?.profile_status === "paused" ? "Resume" : "Pause"
                                        }
                                    </button>
                                )}

                                {/*})*/}
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default DelAdminUser

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