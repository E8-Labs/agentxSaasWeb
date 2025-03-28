import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { Alert, Fade, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react'

const SnackMessages = ({ message, isVisible, setIsVisible, success = true }) => {

    const [showSuccessSnack, setShowSuccessSnack] = useState(null);
    const [showErrorSnack, setShowErrorSnack] = useState(null);

   // //console.log

    return (
        <div>
            {/* Snack for Err Msg */}
            <div>
           
                <AgentSelectSnackMessage isVisible={isVisible} hide={() => setIsVisible(false)} message={message} type={success ? SnackbarTypes.Success : SnackbarTypes.Error} />
            </div>

            {/* Code for success snack */}

        </div>
    )
}

export default SnackMessages