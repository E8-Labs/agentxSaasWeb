import { ArrowDown, CaretDown, CaretUp } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useState } from 'react';
import TwilioProfileToolTip from '../twilioExtras/TwilioProfileToolTip';

const CenamDetails = () => {

    const [showDetails, setShowDetails] = useState(false);

    //styles
    const styles = {
        fontSemiBold: {
            fontWeight: "700",
            fontSize: 18
        },
        mediumfontLightClr: {
            fontWeight: "500",
            fontSize: 15,
            color: "#15151560"
        },
        mediumfontDarkClr: {
            fontWeight: "500",
            fontSize: 15,
            color: "#151515"
        },
    }

    return (
        <div className='border rounded-lg w-full'>
            <div className={`flex flex-row items-center justify-between w-full ${showDetails && "border-b-[1px]"}`}>
                <div className='w-full flex flex-row items-center justify-between px-4 py-2'>
                    <div className='flex flex-row items-end gap-2'>
                        <div style={styles.fontSemiBold}>
                            CNAM
                        </div>
                        <div>
                            <TwilioProfileToolTip toolTip={"CNAM is the name that shows up on someone's phone when you call them — like “AgentX Real Estate” or “John from ABC Corp.”"} />
                        </div>
                    </div>
                    <button
                        className='border p-2 rounded-full'
                        onClick={() => {
                            setShowDetails(!showDetails);
                        }}>
                        {
                            showDetails ? (
                                <CaretUp size={12} />
                            ) : (
                                <CaretDown size={12} />
                            )
                        }
                    </button>
                </div>
            </div>
            {
                showDetails && (
                    <div className='w-full'>
                        <div className='bg-lightGreen px-4 py-2 w-full mb-4 flex flex-row items-center gap-2'>
                            <Image
                                alt='*'
                                src={"/twiliohubassets/checkGreen.jpg"}
                                height={15}
                                width={15}
                                className='rounded-full'
                            />
                            <div style={styles.regularTxt}>
                                Approved
                            </div>
                        </div>
                        <div className='w-full px-4 mb-4'>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    CNAM display name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    Display name
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default CenamDetails
