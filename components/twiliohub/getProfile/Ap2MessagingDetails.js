import { ArrowDown, CaretDown, CaretUp } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import TwilioProfileToolTip from '../twilioExtras/TwilioProfileToolTip';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import ShowRequestStatus from '../twilioExtras/ShowRequestStatus';
import AddAp2MessageAnimation from '../addap2message/AddAp2MessageAnimation';
import LockDetailsView from './LockDetailsView';

const Ap2MessagingDetails = ({
    twilioHubData,
    profileStatus,
    getProfileData,
    block = true
}) => {

    const [showDetails, setShowDetails] = useState(false);
    const [showAddMessage, setShowAddMessage] = useState(false);
    //show success snack
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
                            src={"/twiliohubassets/voice.jpg"}
                            alt='*'
                            height={18}
                            width={18}
                        />
                        <div style={styles.fontSemiBold}>
                            A2P SMS Messaging
                        </div>
                        <div>
                            <TwilioProfileToolTip toolTip={"Send text messages to your customers"} />
                        </div>
                    </div>
                    <div className='flex flex-row items-end gap-2'>
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
                <ShowRequestStatus status={twilioHubData.status} />
            ) : (
                <LockDetailsView
                    profileStatus={profileStatus}
                    handleShowAddModal={() => { setShowAddMessage(true) }}
                    btnTitle='Get Approved'
                    description="Send text messages to your customers."
                    // showBtn={true}
                    unLockDescription="Add A2P SMS Messaging."
                />
            )
            }
            {
                showDetails && (
                    <div className='w-full'>
                        <div className='w-full px-4 mb-4'>
                            <div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Ap2 Message
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    {`Message (No UI now will add aaccording to the ui)`}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showAddMessage && (
                    <AddAp2MessageAnimation
                        showModal={showAddMessage}
                        handleClose={(d) => {
                            setShowAddMessage(false);
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

export default Ap2MessagingDetails
