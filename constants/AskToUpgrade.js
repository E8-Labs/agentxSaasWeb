import CloseBtn from '@/components/globalExtras/CloseBtn'
import { Box, Modal } from '@mui/material'
import React from 'react'

function AskToUpgrade({
    open,
    handleClose,

}) {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropProps={{
                timeout: 1000,
                sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(5px)",
                },
            }}
        >
            <Box
                className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
                sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
            >
                <div style={{ width: "100%" }}>
                    <div
                        className="max-h-[60vh] overflow-auto"
                        style={{ scrollbarWidth: "none" }}
                    >

                        <div className='flex w-full flex-col gap-4 items-center'>
                            <div className='flex w-full flex-row items-center justify-between'>
                                <div className='text-lg font-semibold'>
                                    Upgrade Plan
                                </div>

                                <CloseBtn
                                    onClick={handleClose}
                                />
                            </div>


                            <div className='text-lg font-medium text-left w-full'>
                                You need to upgrade your plan
                            </div>


                            <div className='flex flex-row items-center gap-6 w-full'>
                                <button className='flex flex-col h-[50px] items-center justify-center border rounded-lg w-1/2'>
                                    Cancel
                                </button>

                                <button className='flex h-[50px] text-white flex-col items-center justify-center bg-purple rounded-lg w-1/2'>
                                    Upgrade
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            </Box>

        </Modal>
    )
}


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

export default AskToUpgrade