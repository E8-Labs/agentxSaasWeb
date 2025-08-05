import { ArrowDown, CaretDown, CaretUp } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import TwilioProfileToolTip from '../twilioExtras/TwilioProfileToolTip';
import StirCalling from '../stirCalling/StirCalling';
import ShowRequestStatus from '../twilioExtras/ShowRequestStatus';
import LockDetailsView from './LockDetailsView';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import ShowResubmitBtn from '../twilioExtras/ShowResubmitBtn';

const StirDetails = ({ twilioHubData, trustProducts, profileStatus, getProfileData, businessProfileData }) => {

    const [showDetails, setShowDetails] = useState(false);
    const [showShakenStirModal, setShowShakenStirModal] = useState(false);
    //allow add details btn
    const [allowAddDetails, setAllowAddDetails] = useState(true);

    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });

    useEffect(() => {
        if (twilioHubData) {
            setAllowAddDetails(false);
        } else {
            setAllowAddDetails(true);
        }
    }, [twilioHubData]);

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
            <div className={`flex flex-row items-center justify-between w-full ${showDetails && "border-b-[1px]"}`}>
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
                <div className='w-full flex flex-row items-center justify-between px-4 py-2'>
                    <div className='flex flex-row items-center gap-2'>
                        <Image
                            src={"/twiliohubassets/stir.jpg"}
                            alt='*'
                            height={21}
                            width={21}
                        />
                        <div style={styles.fontSemiBold}>
                            SHAKEN / STIR Calling
                        </div>
                        <div>
                            <TwilioProfileToolTip toolTip={"SHAKEN/STIR is a system that verifies your caller ID is real — not spoofed or fake. It helps your calls look more trustworthy and less like spam."} />
                        </div>
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        {twilioHubData?.status && (
                            <ShowResubmitBtn
                                status={twilioHubData?.status}
                                handleOpenModal={() => { setShowShakenStirModal(true) }}
                            />
                        )}
                        <button
                            className='border p-2 rounded-full'
                            disabled={!twilioHubData}
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
            {twilioHubData?.status ? (
                <ShowRequestStatus
                    status={twilioHubData?.status}
                    twilioData={twilioHubData}
                />
            ) : (
                <LockDetailsView
                    profileStatus={profileStatus}
                    handleShowAddModal={() => { setShowShakenStirModal(true) }}
                    btnTitle='Complete SHAKEN/STIR'
                    twilioData={twilioHubData}
                    unLockDescription="Add Shaken/Stir calling."
                />
            )
            }
            {
                showDetails && (
                    <div className='w-full'>
                        <div className='w-full px-4'>
                            <div className='flex flex-row items-center mt-2 mb-4'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Trust product name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    {twilioHubData?.friendlyName || "N/A"}
                                </div>
                            </div>
                            {/*<div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Selected business profile
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    Selected business profile
                                </div>
                </div>
                            <div className='flex flex-row items-center mt-2 mb-4'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Registered phone numbers
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    +1 3919329194
                                </div>
                            </div>*/}
                        </div>
                    </div>
                )
            }
            {
                showShakenStirModal && (
                    <StirCalling
                        friendlyName={businessProfileData?.friendlyName}
                        showShakenStir={showShakenStirModal}
                        trustProducts={trustProducts}
                        handleClose={(d) => {
                            setShowShakenStirModal(false);
                            if (d) {
                                console.log("Value of d is", d)
                                setShowSnack({
                                    message: d.message,
                                    isVisible: true,
                                    type: SnackbarTypes.Success,
                                });
                                getProfileData(d);
                            }
                        }}
                    />
                )
            }
        </div>
    )
}

export default StirDetails
