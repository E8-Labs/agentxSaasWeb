import { Box, CircularProgress, Modal } from '@mui/material'
import React from 'react'

const CircularLoader = ({
    globalLoader,
    setGlobalLoader
}) => {

    const styles = {
        AddNewKYCQuestionModal: {
            height: "auto",
            bgcolor: "transparent",
            // p: 2,
            mx: "auto",
            my: "50vh",
            transform: "translateY(-55%)",
            borderRadius: 2,
            border: "none",
            outline: "none",
        },
    }

    return (
        <div>
            <Modal
                open={globalLoader}
                closeAfterTransition
                BackdropProps={{
                    timeout: 100,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="lg:w-6/12 sm:w-9/12 w-10/12"
                    sx={styles.AddNewKYCQuestionModal}
                >
                    <div className="w-full flex flex-row items-center justify-center">
                        <CircularProgress
                            className="text-purple"
                            size={150}
                            weight=""
                            thickness={1}
                        />
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default CircularLoader