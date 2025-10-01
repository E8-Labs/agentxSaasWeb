import getProfileDetails from '@/components/apis/GetProfile'
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import TwilioTrustHub from '@/components/myAccount/TwilioTrustHub'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { AddAgencyTwilioKeyModal, TwilioWarning, UpSellPhone } from '@/components/onboarding/extras/StickyModals'
import { handleDisconnectTwilio } from '@/components/onboarding/services/apisServices/ApiService'
import { CircularProgress, Switch } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const Integrations = ({ selectedAgency }) => {

    const [allowUpSellPhone, setAllowUpSellPhone] = useState(false);
    const [addUpSellPhone, setAddUpSellPhone] = useState(false);

    //show add twilio
    const [agencyData, setAgencyData] = useState("");
    const [showAddKeyModal, setShowAddKeyModal] = useState(false);
    //disconnect twilio
    const [disConnectLoader, setDisConnectLoader] = useState(false);
    //snack msg
    const [showSnackMessage, setShowSnackMessage] = useState(null);
    const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success);
    //trsut products hot reload
    const [hotReloadTrustProducts, setHotReloadTrustProducts] = useState(false);
    //remove trust hub data
    const [removeTrustHubData, setRemoveTrustHubData] = useState(false);

    useEffect(() => {
        getLocalData();
    }, []);

    //get agency data
    const getLocalData = () => {
        let data = localStorage.getItem("User");
        if (data) {
            let u = JSON.parse(data);
            setAgencyData(u.user);
            console.log("Agency data is", u.user.twilio);
            if (u.user.phonePrice) {
                setAllowUpSellPhone(true);
            }


        }
    };

    const styles = {
        heading: {
            fontWeight: "600", fontSize: 17
        },
        subHeading: {
            fontWeight: "500", fontSize: 15
        }
    }

    return (
        <div className='w-full flex flex-col items-center'>

            <AgentSelectSnackMessage
                isVisible={showSnackMessage}
                hide={() => {
                    setShowSnackMessage(null);
                }}
                type={showSnackType}
                message={showSnackMessage}
            />

            {/* Code for Add Twilio  */}
            <AddAgencyTwilioKeyModal
                showAddKeyModal={showAddKeyModal}
                handleClose={(d) => {
                    setShowAddKeyModal(false);
                    getLocalData();
                    setDisConnectLoader(false);
                    if (d) {
                        setShowSnackMessage(d);
                        setShowSnackType(SnackbarTypes.Success);
                        setHotReloadTrustProducts(true);
                    }
                }}
                selectedAgency={selectedAgency}
            />

            {/* Code for Upsell phones */}
            <UpSellPhone
                allowUpSellPhone={addUpSellPhone}
                handleClose={(d) => {
                    if (d) {
                        if (d.message === "notAdded") {
                            setAllowUpSellPhone(false);
                            setAddUpSellPhone(false);
                        } else {
                            setAddUpSellPhone(false);
                        }
                        if (d.status === true) {
                            getLocalData();
                            setShowSnackMessage(d.message);
                            setShowSnackType(SnackbarTypes.Success);
                        }
                    }
                }}
            />



            <div className='flex flex-row item-center justify-between border rounded-lg p-4 w-11/12 mt-6'>
                <div className='flex flex-row item-center gap-2'>
                    <Image
                        src={"/agencyIcons/twilioIntIcon.png"}
                        alt='*'
                        height={70}
                        width={70}
                    />
                    <div>
                        <div style={styles.heading}>Twilio</div>
                        <div className='mt-1' style={styles.subHeading}>
                            Connect your Twilio to enable customers to purchase phone numbers.
                        </div>
                        {
                            agencyData?.twilio?.twilAuthToken && (
                                <div style={{ fontWeight: "500", fontSize: 15 }}>
                                    SID {agencyData?.twilio?.twilSid} Token {agencyData?.twilio?.twilAuthToken}
                                </div>
                            )
                        }
                    </div>
                </div>
                {
                    agencyData?.twilio?.twilAuthToken ? (
                        <div>
                            {
                                disConnectLoader ? (
                                    <CircularProgress size={20} />
                                ) : (
                                    <button
                                        className='h-[39px] px-2 text-center rounded-md bg-red text-white'
                                        onClick={async () => {
                                            const response = await handleDisconnectTwilio({
                                                setDisConnectLoader,
                                                setShowSnackMessage,
                                                setShowSnackType,
                                                selectedAgency
                                            });
                                            if (response) {
                                                getLocalData();
                                                setHotReloadTrustProducts(true);
                                                setRemoveTrustHubData(true);
                                            }
                                        }}>
                                        Disconnect
                                    </button>
                                )
                            }
                        </div>
                    ) : (
                        <button
                            className='h-[39px] w-[85px] text-center rounded-md bg-purple text-white'
                            onClick={() => { setShowAddKeyModal(true); }}>
                            Add
                        </button>
                    )
                }
            </div>

            {/*
                <div className='flex flex-row item-center justify-between border rounded-lg p-4 w-11/12 mt-4 bg-[#D9D9D917]'>
                    <div>
                        <div style={styles.heading}>
                            Upsell phone numbers.
                        </div>
                        <div style={styles.subHeading}>
                            Easily upsell phone numbers
                        </div>
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <div className='text-md font-[500]'>
                            {agencyData?.phonePrice?.price && allowUpSellPhone && (
                                `$${agencyData?.phonePrice?.price}`
                            )
                            }
                        </div>
                        <Switch
                            checked={allowUpSellPhone}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setAllowUpSellPhone(checked);
    
                                if (allowUpSellPhone === false) {
                                    setAddUpSellPhone(true);
                                }
                            }}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: 'white',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#7902DF',
                                },
                            }}
                        />
                    </div>
                </div>
            */}

            {/* Trust products */}
            <div
                className='flex flex-col items-center h-[57svh] w-11/12 overflow-auto scrollbar-hide'
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}>
                <TwilioTrustHub
                    isFromAgency={true}
                    hotReloadTrustProducts={hotReloadTrustProducts}
                    setHotReloadTrustProducts={setHotReloadTrustProducts}
                    removeTrustHubData={removeTrustHubData}
                    setRemoveTrustHubData={setRemoveTrustHubData}
                    selectedUser={selectedAgency}
                />
            </div>

        </div>
    )
}

export default Integrations
