import React, { useEffect, useState } from 'react'
import Switch from '@mui/material/Switch';
import { UpSellPhone } from '@/components/onboarding/extras/StickyModals';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';

const UPSell = () => {

    const [phoneNumbers, setPhoneNumbers] = useState(false);
    const [allowUpSellPhone, setAllowUpSellPhone] = useState(false);
    const [addUpSellPhone, setAddUpSellPhone] = useState(false);
    //snack msg
    const [showSnackMessage, setShowSnackMessage] = useState(null);
    const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success);
    //agency data
    const [agencyData, setAgencyData] = useState("");

    const handleTogglePhoneNumbers = (phoneNumbers) => {
        setPhoneNumbers(!phoneNumbers);
    }

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

    return (
        <div className='w-full h-full flex flex-col items-center justify-center border rounded-xl bg-[#ffffff50] p-4 mt-4'>
            <AgentSelectSnackMessage
                isVisible={showSnackMessage}
                hide={() => {
                    setShowSnackMessage(null);
                }}
                type={showSnackType}
                message={showSnackMessage}
            />
            <div className="w-full">
                <div style={{ fontWeight: "600", fontSize: "22px", color: "#000000" }}>Upsell Features</div>
                <div className='border-b'>
                    <div className='flex flex-row item-center justify-between border rounded-lg p-4 w-11/12 mt-4 bg-[#D9D9D917]'>
                        <div>
                            <div style={styles.heading}>
                                Phone Numbers.
                            </div>
                            <div style={styles.subHeading}>
                                Easily upsell phone numbers
                            </div>
                            <div style={styles.subHeading}>
                                Your cost is {agencyData?.phonePrice?.price && allowUpSellPhone && (
                                    `$${agencyData?.phonePrice?.price}`
                                )
                                }/mo for each number
                            </div>
                        </div>
                        <div className="flex flex-row items-center gap-2">
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
                </div>
            </div>
        </div>
    )
}

export default UPSell


const styles = {
    heading: {
        fontWeight: "600", fontSize: 17
    },
    subHeading: {
        fontWeight: "500", fontSize: 15
    }
}