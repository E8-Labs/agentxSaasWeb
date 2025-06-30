import { styles } from '@/components/globalsstyles/Stles';
import { Box, Modal } from '@mui/material';
import React from 'react'

const AddLeadWarning = ({
    warningModal,
    setWarningModal
}) => {
    return (
        <div>
            <Modal
                open={warningModal}
                onClose={() => setWarningModal(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(2px)",
                    },
                }}
            >
                <Box className="lg:w-4/12 sm:w-4/12 w-6/12" sx={styles.modalsStyle}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >
                            <div className="font-bold text-xl text-center mt-6 text-red">
                                Column already exists
                            </div>
                            <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                                <button
                                    className="w-full bg-purple font-bold text-white text-xl border border-[#00000020] rounded-xl h-[50px]"
                                    onClick={() => {
                                        setWarningModal(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default AddLeadWarning
