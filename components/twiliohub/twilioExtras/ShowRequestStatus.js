import Image from 'next/image'
import React, { useEffect } from 'react'

const ShowRequestStatus = ({
    status,
    twilioData
}) => {


    const renderView = () => {
        if (status === "twilio-approved") {
            return (
                <div className='w-full'>
                    <div className='bg-lightGreen px-4 py-2 w-full flex flex-row items-center gap-2'>
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
                </div>
            )
        } else if (status === "in-review") {
            return (
                <div className='w-full'>
                    <div className='bg-[#FF660026] px-4 py-2 w-full flex flex-row items-center gap-2'>
                        <Image
                            alt='*'
                            src={"/assets/pendingaproval.jpg"}
                            height={15}
                            width={15}
                            className='rounded-full'
                        />
                        <div style={styles.regularTxt}>
                            Pending Approval
                        </div>
                    </div>
                </div>
            )
        } else if (status === "twilio-rejected") {
            return (
                <div className='w-full'>
                    <div className='bg-[#FFF6F6] px-4 py-2 w-full flex flex-row items-center gap-2'>
                        <Image
                            alt='*'
                            src={"/assets/rejected.jpg"}
                            height={15}
                            width={15}
                            className='rounded-full'
                        />
                        <div style={styles.regularTxt}>
                            Rejected - Check your email. Twilio has sent the rejection reasons.
                        </div>
                        {/*<div>
                            Recjection reason
            </div>*/}
                    </div>
                </div>
            )
        } else {
            return (
                <div className='w-full'>
                    <div className='bg-btgray px-4 py-2 w-full flex flex-row items-center gap-2'>
                        <Image
                            alt='*'
                            src={"/assets/rejected.jpg"}
                            height={15}
                            width={15}
                            className='rounded-full'
                        />
                        <div style={styles.regularTxt}>
                            Pending
                        </div>
                        {/*<div>
                            Recjection reason
            </div>*/}
                    </div>
                </div>
            )
        }
    }

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
        regularTxt: {
            fontWeight: "500",
            fontSize: 15,
        },
        addBntStyles: {
            fontSize: 14,
            fontWeight: "500"
        }
    }


    return (
        <div>
            {renderView()}
        </div>
    )
}

export default ShowRequestStatus
