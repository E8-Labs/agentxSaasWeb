import { Box, Modal } from '@mui/material';
import React from 'react';

const ResetTrial = ({ handleClose }) => {
    return (
        <Modal
            open={true}
            onClick={handleClose}
        >
            {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
            <Box className="bg-white rounded-xl max-w-[80%] w-[95%] h-[90vh] border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col">
                <div className="text-black">
                    Reset trial Popup
                </div>
            </Box>
        </Modal>
    )
}

export default ResetTrial;
