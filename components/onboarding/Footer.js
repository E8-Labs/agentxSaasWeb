import { CircularProgress } from '@mui/material'
import React from 'react'

const Footer = ({ handleContinue, handleBack, donotShowBack, registerLoader, shouldContinue }) => {
    console.log("Status of continue is :", shouldContinue);
    return (
        <div>
            <div className='px-4 flex flex-row justify-between items-center pt-4'>

                <div>
                    {
                        !donotShowBack && (
                            <button className='text-purple' style={{ fontWeight: "700", fontSize: "16" }} onClick={handleBack}>
                                Back
                            </button>
                        )
                    }
                </div>

                {
                    registerLoader ?
                        <CircularProgress size={25} /> :
                        <button
                            disabled={shouldContinue}
                            className='rounded-lg text-white bg-purple'
                            style={{ fontWeight: "700", fontSize: "16", backgroundColor: shouldContinue && "#00000050", height: "40px", width: "100px" }} onClick={handleContinue}>
                            Continue
                        </button>
                }

            </div>
        </div>
    )
}

export default Footer