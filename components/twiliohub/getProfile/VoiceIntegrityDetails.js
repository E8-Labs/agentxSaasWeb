import { ArrowDown, CaretDown, CaretUp } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import TwilioProfileToolTip from '../twilioExtras/TwilioProfileToolTip';
import TwilioIntegrations from '../twilioIntegrations/TwilioIntegrations';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import ShowRequestStatus from '../twilioExtras/ShowRequestStatus';
import LockDetailsView from './LockDetailsView';
import ShowResubmitBtn from '../twilioExtras/ShowResubmitBtn';

const VoiceIntegrityDetails = ({ twilioHubData, trustProducts, profileStatus, getProfileData, businessProfileData }) => {


    const [showDetails, setShowDetails] = useState(false);
    const [showAddVoice, setShowAddVoice] = useState(false);
    //temporary Voice Integrity Status
    const [voiceIntegrityStatus, setVoiceIntegrityStatus] = useState("");
    //show snack
    const [showSnack, setShowSnack] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false
    });
    //allow add details btn
    const [allowAddDetails, setAllowAddDetails] = useState(true);

    useEffect(() => {
        checkVoiceIntegrityStatus();
        if (twilioHubData) {
            console.log("Allow add");
            setAllowAddDetails(false);
        } else {
            setAllowAddDetails(true);
            console.log("Donot allow add");
        }
    }, [twilioHubData]);

    const checkVoiceIntegrityStatus = () => {
        // If twilioHubData is null (disconnected), clear status and localStorage
        if (!twilioHubData) {
            setVoiceIntegrityStatus("");
            localStorage.removeItem("VoiceIntegrityStatusReview");
            return;
        }
        const Data = localStorage.getItem("VoiceIntegrityStatusReview");
        if (!twilioHubData?.status && Data) {
            const data = JSON.parse(Data);
            setVoiceIntegrityStatus(data.status);
            return;
        }
        if (twilioHubData?.status) {
            setVoiceIntegrityStatus(twilioHubData?.status);
            localStorage.removeItem("VoiceIntegrityStatusReview");
        } else {
            setVoiceIntegrityStatus("");
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
                    <div className='flex flex-row items-center gap-2'>
                        <Image
                            src={"/twiliohubassets/voice.jpg"}
                            alt='*'
                            height={18}
                            width={18}
                        />
                        <div style={styles.fontSemiBold}>
                            Voice Integrity Registration
                        </div>
                        <div>
                            <TwilioProfileToolTip toolTip={"Voice Integrity protects your phone number reputation. It ensures you're not accidentally doing things that might get your number blocked or flagged as spam."} />
                        </div>
                    </div>
                    <div className='flex flex-row items-center gap-2'>
                        {voiceIntegrityStatus && (
                            <ShowResubmitBtn
                                status={voiceIntegrityStatus}
                                handleOpenModal={() => { setShowAddVoice(true) }}
                            />
                        )}
                        <button
                            className='border p-2 rounded-full'
                            disabled={!twilioHubData && !voiceIntegrityStatus}
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
            {voiceIntegrityStatus ? (
                <ShowRequestStatus
                    status={voiceIntegrityStatus}
                    twilioData={twilioHubData}
                />
            ) : (
                <LockDetailsView
                    profileStatus={profileStatus}
                    handleShowAddModal={() => { setShowAddVoice(true) }}
                    btnTitle='Complete Voice'
                    twilioData={twilioHubData}
                    unLockDescription="Register Voice Integrity."
                    businessProfileData={businessProfileData}
                />
            )
            }
            {
                showDetails && (
                    <div className='w-full'>
                        <div className='w-full px-4'>
                            <div className='flex flex-row items-center mt-2 mb-4'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Voice integrity friendly name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    {twilioHubData?.friendlyName || "N/A"}
                                </div>
                            </div>
                            {/*
                                <div className='flex flex-row items-center mt-2'>
                                    <div className='w-1/2' style={styles.mediumfontLightClr}>
                                        Company size
                                    </div>
                                    <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                        {twilioHubData?.companySize}
                                    </div>
                                </div>
                                <div className='flex flex-row items-center mt-2 mb-4'>
                                    <div className='w-1/2' style={styles.mediumfontLightClr}>
                                        Average calls per day
                                    </div>
                                    <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                        {twilioHubData?.averageCallsPerDay}
                                    </div>
                                </div>
                            */}
                        </div>
                    </div>
                )
            }
            {
                showAddVoice && (
                    <TwilioIntegrations
                        showVoiceIntegration={showAddVoice}
                        trustProducts={trustProducts}
                        handleClose={(d) => {
                            setShowAddVoice(false);
                            if (d) {
                                const data = {
                                    message: "Voice Integrity is being reviewed",
                                    status: "in-review"
                                }
                                localStorage.setItem("VoiceIntegrityStatusReview", JSON.stringify(data));
                                checkVoiceIntegrityStatus();
                                getProfileData(d);
                                setShowSnack({
                                    message: d.message,
                                    type: SnackbarTypes.Success,
                                    isVisible: true
                                })
                            }
                        }}
                    />
                )
            }
        </div>
    )
}

export default VoiceIntegrityDetails
