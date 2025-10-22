import { Box, Modal } from '@mui/material'
import React from 'react'

const EditPlanWarning = ({ open, handleClose }) => {
    return (
        <div>
            <Modal open={open} onClose={handleClose}>
                <Box className="bg-transparent rounded-xl max-w-[80%] w-[40%] h-[90vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div>
                        Warning
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default EditPlanWarning