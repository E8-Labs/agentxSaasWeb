import React, { useEffect, useState } from 'react'
import Switch from '@mui/material/Switch';
import { UpSellPhone } from '@/components/onboarding/extras/StickyModals';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import getProfileDetails from '@/components/apis/GetProfile';
import { CircularProgress } from '@mui/material';

const UPSell = () => {

    //snack msg
    const [showSnackMessage, setShowSnackMessage] = useState(null);
    const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success);
    const [phoneNumbers, setPhoneNumbers] = useState(false);
    //phone price
    const [allowUpSellPhone, setAllowUpSellPhone] = useState(false);
    const [addUpSellPhone, setAddUpSellPhone] = useState(false);
    const [savePhoneLoader, setSavePhoneLoader] = useState(false);
    const [phonePrice, setPhonePrice] = useState("");
    //DNC
    const [dncPrice, setDncPrice] = useState()
    const [allowDNC, setAllowDNC] = useState(false);
    const [addDNC, setAddDNC] = useState(false);
    const [dNCLoader, setDNCLoader] = useState(false);
    //Perplexity Enrichment 
    const [perplexityEnrichmentPrice, setPerplexityEnrichmentPrice] = useState()
    const [allowPerplexityEnrichment, setAllowPerplexityEnrichment] = useState(false);
    const [addPerplexityEnrichment, setAddPerplexityEnrichment] = useState(false);
    const [perplexityEnrichmentLoader, setPerplexityEnrichmentLoader] = useState(false);
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
            const UD = u.user;
            setAgencyData(UD);
            console.log("Agency data is", u.user.twilio);
            setPhonePrice(UD?.phonePrice?.price)
            // if (u.user.phonePrice) {
            //     setAllowUpSellPhone(true);
            // }


        }
    };

    //save upsell phone
    const handleSaveUpSell = async () => {
        try {
            console.log("Which data to send in api is not confirmed");
            // return
            setSavePhoneLoader(true);
            const Auth = AuthToken();
            const ApiPath = Apis.addUpSellPhone;
            const ApiData = {
                price: phonePrice,
            };
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + Auth,
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                await getProfileDetails();
                console.log("Response of add upsell phone api is", response);
                const d = response.data;
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
                setSavePhoneLoader(false);
            }
        } catch (error) {
            console.error("Error occured in api is", error);
            setSavePhoneLoader(false);
        } finally {
            // setSaveLoader(false);
        }
    };

    return (
        <div className="flex flex-row justify-center h-[73vh] w-full overflow-y-auto">
            <div className='w-11/12 pt-4'>
                <AgentSelectSnackMessage
                    isVisible={showSnackMessage}
                    hide={() => {
                        setShowSnackMessage(null);
                    }}
                    type={showSnackType}
                    message={showSnackMessage}
                />
                <div className="w-full border rounded-xl p-4 rounded-lg border rounded-xl">
                    <div style={{ fontWeight: "600", fontSize: "22px", color: "#000000" }}>Upsell Features</div>
                    <div className='border-b'>
                        <div className='flex flex-row item-center justify-between border rounded-lg p-4 w-full mt-4 mb-4 bg-[#D9D9D917]'>
                            <div>
                                <div style={styles.heading}>
                                    Phone Numbers.
                                </div>
                                <div style={styles.subHeading}>
                                    Easily upsell phone numbers
                                </div>
                                <div style={styles.subHeading}>
                                    Your cost is {agencyData?.phonePrice?.price && (
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
                                        } else {
                                            setAddUpSellPhone(false);
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
                        {
                            addUpSellPhone && (
                                <div className="flex flex-row items-center justify-center gap-2 mb-4">
                                    <div className="border border-gray-200 rounded px-2 py-0  flex flex-row items-center w-[90%]">
                                        <div className="" style={styles.inputs}>
                                            $
                                        </div>
                                        <input
                                            style={styles.inputs}
                                            type="text"
                                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                            placeholder="Your Cost"
                                            value={phonePrice}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only digits and one optional period
                                                const sanitized = value.replace(/[^0-9.]/g, '');

                                                // Prevent multiple periods
                                                const valid = sanitized.split('.')?.length > 2
                                                    ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                    : sanitized;
                                                // setOriginalPrice(valid);
                                                setPhonePrice(valid ? Number(valid) : 0);
                                            }}
                                        />
                                    </div>
                                    {
                                        savePhoneLoader ? (
                                            <div className="flex flex-row items-center justify-center w-[10%]">
                                                <CircularProgress size={30} />
                                            </div>
                                        ) : (
                                            <button onClick={handleSaveUpSell} className={`w-[10%] bg-purple text-white h-[40px] rounded-xl`} style={{ fontSize: "15px", fontWeight: "500" }}>
                                                Save
                                            </button>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div className='border-b'>
                        <div className='flex flex-row item-center justify-between border rounded-lg p-4 w-full mt-4 mb-4 bg-[#D9D9D917]'>
                            <div>
                                <div style={styles.heading}>
                                    DNC
                                </div>
                                <div style={styles.subHeading}>
                                    Upsell seats to your members
                                </div>
                                <div style={styles.subHeading}>
                                    Your cost is $0
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <Switch
                                    checked={allowDNC}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setAllowDNC(checked);

                                        if (allowDNC === false) {
                                            setAddDNC(true);
                                        } else {
                                            setAddDNC(false);
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
                        {
                            addDNC && (
                                <div className="flex flex-row items-center justify-center gap-2 mb-4">
                                    <div className="border border-gray-200 rounded px-2 py-0  flex flex-row items-center w-[90%]">
                                        <div className="" style={styles.inputs}>
                                            $
                                        </div>
                                        <input
                                            style={styles.inputs}
                                            type="text"
                                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                            placeholder="Your Cost"
                                            value={dncPrice}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only digits and one optional period
                                                const sanitized = value.replace(/[^0-9.]/g, '');

                                                // Prevent multiple periods
                                                const valid = sanitized.split('.')?.length > 2
                                                    ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                    : sanitized;
                                                // setOriginalPrice(valid);
                                                setDncPrice(valid ? Number(valid) : 0);
                                            }}
                                        />
                                    </div>
                                    {
                                        dNCLoader ? (
                                            <div className="flex flex-row items-center justify-center w-[10%]">
                                                <CircularProgress size={30} />
                                            </div>
                                        ) : (
                                            <button onClick={handleSaveUpSell} className={`w-[10%] bg-purple text-white h-[40px] rounded-xl`} style={{ fontSize: "15px", fontWeight: "500" }}>
                                                Save
                                            </button>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div className='border-b'>
                        <div className='flex flex-row item-center justify-between border rounded-lg p-4 w-full mt-4 mb-4 bg-[#D9D9D917]'>
                            <div>
                                <div style={styles.heading}>
                                    Perplexity Enrichment
                                </div>
                                <div style={styles.subHeading}>
                                    Upsell perplexity enrichment
                                </div>
                                <div style={styles.subHeading}>
                                    Your cost is $0
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <Switch
                                    checked={allowPerplexityEnrichment}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setAllowPerplexityEnrichment(checked);

                                        if (allowPerplexityEnrichment === false) {
                                            setAddPerplexityEnrichment(true);
                                        } else {
                                            setAddPerplexityEnrichment(false);
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
                        {
                            addPerplexityEnrichment && (
                                <div className="flex flex-row items-center justify-center gap-2 mb-4">
                                    <div className="border border-gray-200 rounded px-2 py-0  flex flex-row items-center w-[90%]">
                                        <div className="" style={styles.inputs}>
                                            $
                                        </div>
                                        <input
                                            style={styles.inputs}
                                            type="text"
                                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                            placeholder="Your Cost"
                                            value={perplexityEnrichmentPrice}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                // Allow only digits and one optional period
                                                const sanitized = value.replace(/[^0-9.]/g, '');

                                                // Prevent multiple periods
                                                const valid = sanitized.split('.')?.length > 2
                                                    ? sanitized.substring(0, sanitized.lastIndexOf('.'))
                                                    : sanitized;
                                                // setOriginalPrice(valid);
                                                setPerplexityEnrichmentPrice(valid ? Number(valid) : 0);
                                            }}
                                        />
                                    </div>
                                    {
                                        perplexityEnrichmentLoader ? (
                                            <div className="flex flex-row items-center justify-center w-[10%]">
                                                <CircularProgress size={30} />
                                            </div>
                                        ) : (
                                            <button onClick={handleSaveUpSell} className={`w-[10%] bg-purple text-white h-[40px] rounded-xl`} style={{ fontSize: "15px", fontWeight: "500" }}>
                                                Save
                                            </button>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div>
                        <div className='flex flex-row item-center justify-between border rounded-lg p-4 w-full mt-4 mb-4 bg-[#D9D9D917]'>
                            <div>
                                <div style={styles.heading}>
                                    Leads
                                </div>
                                <div style={styles.subHeading}>
                                    Upsell leads
                                </div>
                            </div>
                            <div className="bg-purple text-white rounded-full w-[100px] h-[25px] flex flex-row items-center justify-center cursor-pointer" style={{ fontSize: "12px", fontWeight: "400" }}>
                                Comming Soon
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UPSell;


const styles = {
    heading: {
        fontWeight: "600", fontSize: 17
    },
    subHeading: {
        fontWeight: "500", fontSize: 15
    }
}