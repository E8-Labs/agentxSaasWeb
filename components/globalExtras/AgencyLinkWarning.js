import { Box, Modal } from '@mui/material';
import React from 'react';

const AgencyLinkWarning = ({
    open,
    handleClose,
    handleCopyLink
}) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropProps={{
                timeout: 100,
                sx: {
                    backgroundColor: "#00000040",
                    backdropFilter: "blur(10px)",
                },
            }}
        >
            <Box className="flex justify-center items-center w-full h-full">
                <div className="bg-white rounded-2xl p-8 max-w-lg w-[90%] relative shadow-2xl">
                    <div style={styles.heading}>warning</div>
                    <div style={styles.subHeading}>Descriptiom</div>
                    <button>
                        Continue
                    </button>
                </div>
            </Box>
        </Modal>
    )
}

export default AgencyLinkWarning;

const styles = {
    heading: {
        fontSize: 20,
        fontWeight: 600,
        color: "#000000",
    },
    subHeading: {
        fontSize: 16,
        fontWeight: 400,
        color: "#000000",
    },
}