import { Box, Modal } from '@mui/material'
import React from 'react'

const UpdatePipelineConfirmation = ({
    open,
    onClose,
}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            BackdropProps={{
                timeout: 200,
                sx: {
                    backgroundColor: '#00000020',
                    // //backdropFilter: "blur(20px)",
                },
            }}
        >
            <Box
                className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
                sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
            >
                <div style={{ width: '100%' }}>
                    <div className="max-h-[60vh] overflow-auto" style={{ scrollbarWidth: 'none' }}>
                        <div className="text-black" style={{ fontSize: 22, fontWeight: '600' }}>Update Pipeline</div>
                        <div className="text-black mt-4" style={{ fontSize: 14, fontWeight: '500' }}>Are you sure you want to update the pipeline?</div>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default UpdatePipelineConfirmation;



const styles = {
    modalsStyle: {
        height: 'auto',
        bgcolor: 'transparent',
        p: 2,
        mx: 'auto',
        my: '50vh',
        transform: 'translateY(-50%)',
        borderRadius: 2,
        border: 'none',
        outline: 'none',
    },
}