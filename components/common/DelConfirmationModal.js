import { Box, CircularProgress, Modal } from '@mui/material'
import React from 'react'

const DelConfirmationModal = ({
    showDelModal,
    setShowDelModal,
    handleDelete,
    delLoader,
    selectedDetails,
    overlayZIndex,
    title = "item",
}) => {
    return (
        <Modal
            open={showDelModal}
            onClose={() => setShowDelModal(false)}
            closeAfterTransition
            disablePortal={false}
            slotProps={{
                root: {
                    style: {
                        zIndex: overlayZIndex,
                    },
                },
            }}
            sx={{
                zIndex: overlayZIndex,
            }}
            BackdropProps={{
                timeout: 1000,
                sx: {
                    backgroundColor: '#00000020',
                    zIndex: overlayZIndex,
                    // //backdropFilter: "blur(5px)",
                },
            }}
        >
            <Box
                className="lg:w-4/12 sm:w-4/12 w-6/12"
                sx={{
                    ...styles.modalsStyle,
                    zIndex: overlayZIndex,
                    position: 'relative',
                }}
            >
                <div className="flex flex-row justify-center w-full">
                    <div
                        className="w-full"
                        style={{
                            backgroundColor: '#ffffff',
                            padding: 20,
                            borderRadius: '13px',
                        }}
                    >
                        <div className="font-bold text-xl mt-6">
                            Are you sure you want to delete this {title?.toLowerCase()}
                        </div>
                        <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                            <button
                                className="w-1/2 font-bold text-xl text-[#6b7280] h-[50px]"
                                onClick={() => {
                                    setShowDelModal(false)
                                }}
                            >
                                Cancel
                            </button>
                            {delLoader ? (
                                <CircularProgress size={20} />
                            ) : (
                                <button
                                    className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                                    onClick={async () => {
                                        await handleDelete(selectedDetails)
                                        //  setShowDelModal(false)
                                    }}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default DelConfirmationModal;


const styles = {
    modalsStyle: {
        // height: "auto",
        bgcolor: 'transparent',
        // p: 2,
        mx: 'auto',
        my: '50vh',
        transform: 'translateY(-50%)',
        borderRadius: 2,
        border: 'none',
        outline: 'none',
    },
    heading2: {
        fontsize: 15,
        fontWeight: '500',
        color: '#000000100',
    },
    subHeading: {
        fontsize: 12,
        fontWeight: '500',
        color: '#15151560',
    },
}