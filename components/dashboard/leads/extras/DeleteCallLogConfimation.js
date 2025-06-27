import { Modal, Box, CircularProgress } from '@mui/material'
import React from 'react'

function DeleteCallLogConfimation({
    setShowConfirmationPopup,
    showConfirmationPopup,
    onContinue,
    loading
}) {
    return (
        <div>

            <Modal open={showConfirmationPopup}
                // onClose={() => setShowAddLeadModal(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="w-5/12"
                    sx={{
                        height: "auto",
                        bgcolor: "transparent",
                        // p: 2,
                        mx: "auto",
                        my: "50vh",
                        transform: "translateY(-50%)",
                        borderRadius: 2,
                        border: "none",
                        outline: "none",
                    }}
                >
                    <div className='p-4 rounded-lg' style={{ width: "100%", backgroundColor: 'white' }}>

                         <p
                            className="text-black"
                            style={{
                                fontSize: 16,
                                fontWeight: "600",
                            }}
                        >
                            Delete call activity
                        </p>

                        <p
                            className="text-black mt-6"
                            style={{
                                fontSize: 16,
                                fontWeight: "500",
                            }}
                        >
                            Are you sure you want to delete call activity.
                        </p>

                        <div className="flex flex-row items-center gap-4 mt-6">
                            <button
                                className="w-6/12 border rounded py-2 text-purple font-[600]"
                                onClick={() => {
                                    setShowConfirmationPopup(null);
                                }}
                            >
                                Cancel
                            </button>
                            <div className="w-6/12 flex items-center">
                                {loading ? (
                                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                                        <CircularProgress size={25} />
                                    </div>
                                ) : (
                                    <button
                                        className={`outline-none bg-purple`}
                                        style={{
                                            color: "white",
                                            height: "50px",
                                            borderRadius: "10px",
                                            width: "100%",
                                            fontWeight: 600,
                                            fontSize: "20",
                                        }}
                                        onClick={() => {
                                            onContinue()
                                        }}
                                    >
                                        Continue
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </Box>
            </Modal>
        </div >
    )
}

export default DeleteCallLogConfimation