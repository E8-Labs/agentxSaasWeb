import { styles } from '@/components/globalsstyles/Stles';
import { Box, Modal } from '@mui/material';
import React from 'react'

const DelConfirmationModal = ({
    description,
    ShowDelCol,
    setShowDelCol,
    ChangeColumnName
}) => {
    return (
        <div>
            <Modal
                open={ShowDelCol}
                onClose={() => setShowDelCol(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: { backgroundColor: "rgba(0, 0, 0, 0.1)" },
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
                            <div className="font-bold text-xl mt-6">
                                {description}
                            </div>
                            <div className="flex flex-row items-center gap-4 w-full mt-6 mb-6">
                                <button
                                    className="w-1/2 font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                                    onClick={() => {
                                        setShowDelCol(false);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="w-1/2 text-red font-bold text-xl border border-[#00000020] rounded-xl h-[50px]"
                                    onClick={() => {
                                        ChangeColumnName(null);
                                        setShowDelCol(false);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default DelConfirmationModal
