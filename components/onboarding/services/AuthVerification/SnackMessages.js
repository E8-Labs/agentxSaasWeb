import { Alert, Fade, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react'

const SnackMessages = ({ message, isVisible, setIsVisible, success = true }) => {

    const [showSuccessSnack, setShowSuccessSnack] = useState(null);
    const [showErrorSnack, setShowErrorSnack] = useState(null);

    console.log("Is snack visible ", isVisible)

    return (
        <div>
            {/* Snack for Err Msg */}
            <div>
                <Snackbar
                    open={isVisible}
                    autoHideDuration={3000}
                    onClose={() => {
                        setIsVisible(false);
                    }}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                    }}
                    TransitionComponent={Fade}
                    TransitionProps={{
                        direction: "center",
                    }}
                >
                    <Alert
                        onClose={() => {
                            setIsVisible(false)
                        }}
                        severity={success ? "success" : "error"}
                        // className='bg-purple rounded-lg text-white'
                        sx={{
                            width: "auto",
                            fontWeight: "700",
                            fontFamily: "inter",
                            fontSize: "22",
                        }}
                    >
                        {message}
                    </Alert>
                </Snackbar>
            </div>

            {/* Code for success snack */}
            
        </div>
    )
}

export default SnackMessages