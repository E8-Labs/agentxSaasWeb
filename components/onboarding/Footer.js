import { CircularProgress } from '@mui/material'
import React from 'react'
import LoaderAnimation from '../animations/LoaderAnimation'

const Footer = ({ handleContinue, handleBack, donotShowBack, registerLoader, shouldContinue }) => {
    // //console.log;
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
                        <LoaderAnimation loaderModal={registerLoader} /> :
                        <button
                            disabled={shouldContinue}
                            className='rounded-lg text-white bg-purple'
                            style={{ fontWeight: "700", fontSize: "16", backgroundColor: shouldContinue && "#00000020", color: shouldContinue && "#000000", height: "40px", width: "100px" }} onClick={handleContinue}>
                            Continue
                        </button>
                }

            </div>
        </div>
    )
}

export default Footer