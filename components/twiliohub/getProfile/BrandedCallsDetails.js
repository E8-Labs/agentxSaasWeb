import { ArrowDown, CaretDown, CaretUp } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useState } from 'react';
import TwilioProfileToolTip from '../twilioExtras/TwilioProfileToolTip';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import BrandedCallsAnimation from '../brandedCalls/BrandedCallsAnimation';
import ShowRequestStatus from '../twilioExtras/ShowRequestStatus';
import LockDetailsView from './LockDetailsView';

const BrandedCallsDetails = () => {

    const [showDetails, setShowDetails] = useState(false);
    const [showAddBrandedCalls, setShowAddBrandedCalls] = useState(false);
    //show snack
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

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
        <div className='border rounded-lg w-full'>
            <AgentSelectSnackMessage
                type={showSnack.type}
                message={showSnack.message}
                isVisible={showSnack.isVisible}
                hide={() => {
                    setShowSnack({
                        message: "",
                        isVisible: false,
                        type: SnackbarTypes.Success,
                    });
                }}
            />
            <div className={`flex flex-row items-center justify-between w-full ${showDetails && "border-b-[1px]"}`}>
                <div className='w-full flex flex-row items-center justify-between px-4 py-2'>
                    <div className='flex flex-row items-end gap-2'>
                        <div style={styles.fontSemiBold}>
                            Branded Calling
                        </div>
                        <div>
                            <TwilioProfileToolTip toolTip={"Branded Calls let you show your business name, logo, and reason for calling right on the person’s phone — kind of like a caller ID upgrade."} />
                        </div>
                    </div>
                    <div className='flex flex-row items-end gap-2'>
                        <button
                            className='border p-2 rounded-full'
                            disabled
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
            </div>
            {/*twilioHubData?.status ? (
                <ShowRequestStatus status={twilioHubData?.status} />
            ) : (
            )
        */}
            <LockDetailsView
                profileStatus={false}
                handleShowAddModal={() => { setShowAddBrandedCalls(true) }}
            />
            {
                showDetails && (
                    <div className='w-full'>
                        <div className='w-full px-4'>
                            <div className='mt-2' style={styles.fontSemiBold}>
                                Beta program qualifications
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Account used for outbound calls for over 3months?
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    YES
                                </div>
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Compliance to best practice when making outbound calls
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    YES
                                </div>
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    First name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    Hamza
                                </div>
                            </div>
                            <div className='flex flex-row items-start mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Last name
                                </div>
                                <div className='w-1/2'>
                                    <div style={styles.mediumfontDarkClr}>
                                        Latif
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Email address
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    hamza@gmail.com
                                </div>
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Phone number
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    14086799068
                                </div>
                            </div>
                        </div>
                        <div className='w-full px-4 border-t-[2px]'>
                            <div className='mt-2' style={styles.fontSemiBold}>
                                Branded Information
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Legal business name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    Business name
                                </div>
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Voice integrity bundle SID
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    SID
                                </div>
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Brand display name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    Display name
                                </div>
                            </div>
                            <div className='flex flex-row items-start mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Long brand display name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    N/A
                                </div>
                            </div>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Use case information
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    Lorem ipsum dolor sit amet consectetur. Malesuada pretium et sit nibh aliquet diam consequat nunc.Lorem ipsum dolor sit amet consectetur. Malesuada pretium et sit nibh aliquet diam consequat nunc.
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                showAddBrandedCalls && (
                    <BrandedCallsAnimation
                        showVoiceIntegration={showAddBrandedCalls}
                        handleClose={(d) => {
                            if (d) {
                                setShowSnack({
                                    message: d.message,
                                    type: SnackbarTypes.Success,
                                    isVisible: true
                                })
                            }
                            setShowAddBrandedCalls(false);
                        }}
                    />
                )
            }
        </div>
    )
}

export default BrandedCallsDetails;
