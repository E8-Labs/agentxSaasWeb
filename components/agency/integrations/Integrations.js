import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { AddAgencyTwilioKeyModal, TwilioWarning, UpSellPhone } from '@/components/onboarding/extras/StickyModals'
import { Switch } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const Integrations = () => {

    const [allowUpSellPhone, setAllowUpSellPhone] = useState(false);
    const [addUpSellPhone, setAddUpSellPhone] = useState(false);

    //show add twilio
    const [agencyData, setAgencyData] = useState("");
    const [showAddKeyModal, setShowAddKeyModal] = useState(false);
    //snack msg
    const [showSnackMessage, setShowSnackMessage] = useState(null);
    const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success);

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
                    if (d) {
                        setShowSnackMessage(d);
                        setShowSnackType(SnackbarTypes.Success);
                        getLocalData();
                    }
                }}
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
                            setShowSnackMessage(d.message);
                            setShowSnackType(SnackbarTypes.Success);
                        }
                    }
                }}
            />

            <div className='flex w-full flex-row items-center justify-between px-5 py-5 border-b'>

                <div style={{
                    fontSize: 22, fontWeight: '700'
                }}>
                    Integrations
                </div>

                <div>
                    <NotficationsDrawer />
                </div>
            </div>

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
                            agencyData?.twilio && (
                                <div style={{ fontWeight: "500", fontSize: 15 }}>
                                    SID {agencyData?.twilio?.twilSid} Token {agencyData?.twilio?.twilAuthToken}
                                </div>
                            )
                        }
                    </div>
                </div>
                <button
                    className='h-[39px] w-[85px] text-center rounded-md bg-purple text-white'
                    onClick={() => { setShowAddKeyModal(true); }}>
                    Add
                </button>
            </div>

            <div className='flex flex-row item-center justify-between border rounded-lg p-4 w-11/12 mt-4 bg-[#D9D9D917]'>
                <div>
                    <div style={styles.heading}>
                        Upsell phone numbers.
                    </div>
                    <div style={styles.subHeading}>
                        Easily upsell phone numbers
                    </div>
                </div>
                <div>
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

        </div>
    )
}

export default Integrations
