import { ArrowDown, CaretDown, CaretUp } from '@phosphor-icons/react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import TwilioProfileToolTip from '../twilioExtras/TwilioProfileToolTip';
import AddTwilio from '../addtwilio/AddTwilio';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import ShowRequestStatus from '../twilioExtras/ShowRequestStatus';
import LockDetailsView from './LockDetailsView';
import ShowResubmitBtn from '../twilioExtras/ShowResubmitBtn';
import { CircularProgress } from '@mui/material';
import AddTwilioAnimation from '../addtwilio/AddTwilioAnimation';
import IntroVideoModal from '@/components/createagent/IntroVideoModal';
import { HowtoVideos } from '@/constants/Constants';

const CustomerProfile = ({
    twilioHubData,
    getProfileData,
    profileStatus,
    disconnectLoader,
    handleDisconnectTwilio,
    isFromAgency = false
}) => {

    //how to video
    const [introVideoModal2, setIntroVideoModal2] = useState(false);
    console.log("Trust hub data passed is", twilioHubData);

    const [showDetails, setShowDetails] = useState(false);
    //add twilio
    const [showAddTwilio, setShowAddTwilio] = useState(false);
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
        <div className='w-full'>
            {/* HEader */}
            <div className='w-full flex flex-row items-center justify-between'>
                <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
                    Twilio Trust Hub
                </div>
                <div>
                    {
                        !twilioHubData && !isFromAgency && (
                            <button
                                className='bg-purple text-white h-[49px] w-[150px] rounded-lg'
                                style={{ fontSize: 15, fontWeight: "500" }}
                                onClick={() => { setShowAddTwilio(true) }}>
                                Connect
                            </button>
                        )
                    }
                    {
                        twilioHubData && !isFromAgency && (
                            <div className='w-full flex flex-row items-center justify-end'>
                                {
                                    disconnectLoader ? (
                                        <CircularProgress size={25} />
                                    ) : (
                                        <button
                                            className='border-none outline-none bg-red text-white h-[50px] px-4 rounded-lg'
                                            onClick={() => { handleDisconnectTwilio() }}>
                                            Disconnect Twilio
                                        </button>
                                    )
                                }
                            </div>
                        )
                    }
                </div>
            </div>

            <div className="w-full flex flex-row items-center gap-6">
                {
                    !isFromAgency && (
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: "500",
                                color: "#00000090",
                            }}
                        >
                            {"Account > Twilio"}
                        </div>
                    )
                }
                <div className="flex flex-row items-center gap-4">
                    <button
                        className='text-[15px] font-[500] text-purple outline-none border-none cursor-pointer'
                        onClick={() => { setIntroVideoModal2(true) }}
                    >
                        Learn more about Twilio Trust Hub
                    </button>
                    <Image src="/otherAssets/playIcon.jpg" alt="info" width={10} height={10} className="cursor-pointer"
                    // onClick={() => setIntroVideoModal2(true)}
                    />
                </div>
            </div>
            {/* Intro modal */}
            <IntroVideoModal
                open={introVideoModal2}
                onClose={() => setIntroVideoModal2(false)}
                videoTitle="Learn how to add Twilio Trust Hub"
                videoUrl={HowtoVideos.TwilioTrustHub}
            />

            <div className='border rounded-lg w-full mt-2'>
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
                <div className={`flex flex-row items-center justify-between w-full ${showDetails && "border-b-[2px]"}`}>
                    <div className='w-full flex flex-row items-center justify-between px-4 py-2'>
                        <div className='flex flex-row items-center gap-2'>
                            <div style={styles.fontSemiBold}>
                                Customer Profile
                            </div>
                            <div>
                                <TwilioProfileToolTip toolTip={"This is basic information about your business or how you use Twilio — it helps carriers understand who you are."} />
                            </div>
                        </div>
                        <div className='flex flex-row items-center gap-2'>
                            {twilioHubData?.status && (
                                <ShowResubmitBtn
                                    status={twilioHubData?.status}
                                    handleOpenModal={() => { setShowAddTwilio(true) }}
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
                {
                    twilioHubData?.status ? (
                        <ShowRequestStatus
                            status={twilioHubData?.status}
                            twilioData={twilioHubData}
                        />
                    ) : (
                        <LockDetailsView
                            profileStatus={profileStatus}
                            handleShowAddModal={() => { setShowAddTwilio(true) }}
                            btnTitle='Connect Twilio'
                            description="Get started with your customer profile"
                            showBtn={true}
                        />
                    )
                }
                {
                    showDetails && (
                        <div className='w-full'>
                            {/*<div className='bg-lightGreen px-4 py-2 w-full mb-4 flex flex-row items-center gap-2'>
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
                </div>*/}
                            <div className='w-full px-4'>
                                <div className='mt-2' style={styles.fontSemiBold}>
                                    General Information
                                </div>
                                {/*<div className='flex flex-row items-center mt-2'>
                                <div className='w-1/2' style={styles.mediumfontLightClr}>
                                    Legal business name
                                </div>
                                <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                    BUSINESS_NAME
                                </div>
            </div>*/}
                                <div className='flex flex-row items-center mt-2 mb-4'>
                                    <div className='w-1/2' style={styles.mediumfontLightClr}>
                                        Profile Friendly Name | {twilioHubData?.profileType && (
                                            twilioHubData?.profileType.charAt(0).toUpperCase() + twilioHubData?.profileType.slice(1).toLowerCase()
                                        )}
                                    </div>
                                    <div className='w-1/2' style={styles.mediumfontDarkClr}>
                                        {twilioHubData?.friendlyName || "Profile Friendly Name"}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )
                }

                {/* Modal to add the twilio */}
                {
                    showAddTwilio && (
                        <AddTwilioAnimation
                            showAddTwilio={showAddTwilio}
                            handleClose={(d) => {
                                setShowAddTwilio(false);
                                if (d) {
                                    setShowSnack({
                                        message: d.message,
                                        type: SnackbarTypes.Success,
                                        isVisible: true
                                    })
                                    getProfileData(d);
                                }
                            }}
                            getProfileData={getProfileData}
                        />
                    )
                }

            </div>
        </div>
    )
}

export default CustomerProfile;


//add twilio
// <AddTwilio
//                             showAddTwilio={showAddTwilio}
//                             handleClose={(d) => {
//                                 console.log("Data from add twilio is", d);
//                                 setShowAddTwilio(false);
//                                 if (d) {
//                                     getProfileData();
//                                     setShowSnack({
//                                         message: d?.message || "Twilio connected. Wait for approval!",
//                                         isVisible: true,
//                                         type: SnackbarTypes.Success,
//                                     });
//                                 }
//                             }}
//                         />

// <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Country
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     Country
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-start mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Address Street
//                                 </div>
//                                 <div className='w-1/2'>
//                                     <div style={styles.mediumfontDarkClr}>
//                                         Address Street_1
//                                     </div>
//                                     <div className='mt-2' style={styles.mediumfontDarkClr}>
//                                         Address Street_1
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Address City
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     City
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     State or Province
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     Province
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2 mb-4'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Postal Code
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     2231
//                                 </div>
//                             </div>
//                         <div className='w-full px-4 border-t-[2px]'>
//                             <div className='mt-2' style={styles.fontSemiBold}>
//                                 Business Information
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Business Identity
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     Direct
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Business type
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     Real State
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Business registration ID type
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     USA: Employer Identification Number
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-start mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Business registration number
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     60-3391340
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Region of operation
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     USA
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2 mb-4'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Business website
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     Web.com
//                                 </div>
//                             </div>
//                         </div>
//                         <div className='w-full px-4 border-t-[2px] mb-2'>
//                             <div className='mt-2' style={styles.fontSemiBold}>
//                                 Authorised Representative
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     First Name
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     First name
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Last name
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     L_N
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Email address
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     E_A
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Phone number
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     Phone number
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Business title
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     B_T
//                                 </div>
//                             </div>
//                             <div className='flex flex-row items-center mt-2'>
//                                 <div className='w-1/2' style={styles.mediumfontLightClr}>
//                                     Job position
//                                 </div>
//                                 <div className='w-1/2' style={styles.mediumfontDarkClr}>
//                                     J_P
//                                 </div>
//                             </div>
//                         </div>