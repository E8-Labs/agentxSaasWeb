import { Box, Modal } from '@mui/material'
import React from 'react'

function AskSkyConfirmation({
    open,
    onClose,
    handleChatClick,
    handleCallClick

}) {
    return (
        <div>
            <Modal
                open={open}
                onClose={onClose}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                    },
                }}
            >
                <Box
                    className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '400px', // Adjust for different screen sizes
                        bgcolor: 'white',
                        borderRadius: '8px',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <div className='flex flex-col w-full items-center bg-white rounded-lg'>
                        <h2 className='text-lg font-semibold mb-4'>How would you like to continue?</h2>
                        <div className='flex flex-row items-center justify-between w-full'>
                            <button
                                onClick={handleChatClick}
                                className='px-4 py-2 text-purple border w-5/12 rounded'
                            >
                                Chat with Sky
                            </button>
                            <button
                                onClick={handleCallClick}
                                className='px-4 py-2 bg-purple w-5/12 text-white rounded'
                            >
                                Call Sky
                            </button>
                        </div>
                    </div>
                </Box>
            </Modal>

        </div>
    )
}

export default AskSkyConfirmation