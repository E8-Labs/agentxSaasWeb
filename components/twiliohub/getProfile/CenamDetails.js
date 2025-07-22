import { ArrowDown, CaretDown, CaretUp } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import TwilioProfileToolTip from '../twilioExtras/TwilioProfileToolTip';
import Cnammain from '../cnamtab/Cnammain';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import ShowRequestStatus from '../twilioExtras/ShowRequestStatus';
import LockDetailsView from './LockDetailsView';
import ShowResubmitBtn from '../twilioExtras/ShowResubmitBtn';

const CenamDetails = ({ twilioHubData, trustProducts, profileStatus, getProfileData }) => {

    const [showDetails, setShowDetails] = useState(false);
    const [showAddCNAM, setShowAddCNAM] = useState(false);
    //show success snack
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });
    //allow add details btn
    const [allowAddDetails, setAllowAddDetails] = useState(true);

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
                        isVisible: true,
                        type: SnackbarTypes.Success,
                    });
                }}
            />
            <div className={`flex flex-row items-center justify-between w-full ${showDetails && "border-b-[1px]"}`}>
                <div className='w-full flex flex-row items-center justify-between px-4 py-2'>
                    <div className='flex flex-row items-center gap-2'>
                        <Image
                            src={"/twiliohubassets/cnam.jpg"}
                            alt='*'
                            height={19}
                            width={19}
                        />
                        <div style={styles.fontSemiBold}>
                            CNAM
                        </div>
                        <div>
                            <TwilioProfileToolTip toolTip={"CNAM is the name that shows up on someone's phone when you call them — like “AgentX Real Estate” or “John from ABC Corp.”"} />
                        </div>
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        {twilioHubData?.status && (
                            <ShowResubmitBtn
                                status={twilioHubData.status}
                                handleOpenModal={() => { setShowAddCNAM(true) }}
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
                    status={twilioHubData.status}
                    twilioData={twilioHubData}
                />
            ) : (
                <LockDetailsView
                    profileStatus={profileStatus}
                    handleShowAddModal={() => { setShowAddCNAM(true) }}
                    twilioData={twilioHubData}
                    unLockDescription="Add CNAM."
                />
            )
            }
            {
                showDetails && (
                    <div className='w-full'>
                        <div className='w-full px-4 mb-4'>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    CNAM display name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    {twilioHubData.friendlyName}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showAddCNAM && (
                    <Cnammain
                        showAddCNAM={showAddCNAM}
                        trustProducts={trustProducts}
                        handleClose={(d) => {
                            setShowAddCNAM(false);
                            if (d) {
                                getProfileData();
                                setShowSnack({
                                    type: SnackbarTypes.Success,
                                    message: d.message,
                                    isVisible: false
                                })
                            }
                        }}
                    />
                )}

        </div>
    )
}

export default CenamDetails
