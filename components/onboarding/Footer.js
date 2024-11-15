import { CircularProgress } from '@mui/material'
import React from 'react'

const Footer = ({ handleContinue, handleBack, donotShowBack, registerLoader }) => {
    return (
        <div>
            <div className='px-4 flex flex-row justify-between items-center pt-8'>

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
                        <button className='rounded-lg text-white bg-purple' style={{ fontWeight: "700", fontSize: "16", height: "50px", width: "130px" }} onClick={handleContinue}>
                            Continue
                        </button>
                }
                
            </div>
        </div>
    )
}

export default Footer