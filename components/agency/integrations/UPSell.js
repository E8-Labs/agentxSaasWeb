import React, { useEffect, useState } from 'react'
import Switch from '@mui/material/Switch';
import { UpSellPhone } from '@/components/onboarding/extras/StickyModals';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import getProfileDetails from '@/components/apis/GetProfile';
import { CircularProgress } from '@mui/material';
import Image from 'next/image';

const UPSell = () => {

    //settings data
    const [settingsData, setSettingsData] = useState(null);
    //snack msg
    const [showSnackMessage, setShowSnackMessage] = useState(null);
    const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success);
    const [phoneNumbers, setPhoneNumbers] = useState(false);
    //phone price
    const [allowUpSellPhone, setAllowUpSellPhone] = useState(false);
    const [addUpSellPhone, setAddUpSellPhone] = useState(false);
    const [savePhoneLoader, setSavePhoneLoader] = useState(false);
    const [delPhoneLoader, setDelPhoneLoader] = useState(false);
    const [phonePrice, setPhonePrice] = useState("");
    //DNC
    const [dncPrice, setDncPrice] = useState()
    const [allowDNC, setAllowDNC] = useState(false);
    const [addDNC, setAddDNC] = useState(false);
    const [dNCLoader, setDNCLoader] = useState(false);
    const [delDNCLoader, setDelDNCLoader] = useState(false);
    //Perplexity Enrichment 
    const [perplexityEnrichmentPrice, setPerplexityEnrichmentPrice] = useState()
    const [allowPerplexityEnrichment, setAllowPerplexityEnrichment] = useState(false);
    const [addPerplexityEnrichment, setAddPerplexityEnrichment] = useState(false);
    const [perplexityEnrichmentLoader, setPerplexityEnrichmentLoader] = useState(false);
    const [delPerplexityEnrichmentLoader, setDelPerplexityEnrichmentLoader] = useState(false);
    //agency data
    const [agencyData, setAgencyData] = useState("");
    //initial loader
    const [initialLoader, setInitialLoader] = useState(false);

    const handleTogglePhoneNumbers = (phoneNumbers) => {
        setPhoneNumbers(!phoneNumbers);
    }

    useEffect(() => {
        getUserSettings();
        getLocalData();
    }, []);


    //get user settings
    const getUserSettings = async () => {
        try {
            setInitialLoader(true);
            const ApiPath = Apis.userSettings;
            const Auth = AuthToken();
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + Auth,
                    "Content-Type": "application/json",
                },
            });
            if (response) {
                console.log("response of get user settings api is", response)
                const Data = response?.data?.data;
                setPhonePrice(Data?.phonePrice || "");
                setDncPrice(Data?.dncPrice || "");
                setPerplexityEnrichmentPrice(Data?.enrichmentPrice || "");
                setSettingsData(Data);
                setAllowUpSellPhone(Data?.upsellPhoneNumber);
                setAllowDNC(Data?.upsellDnc);
                setAllowPerplexityEnrichment(Data?.upsellEnrichment);
                setInitialLoader(false);
            }
        } catch (err) {
            console.log("Error occured in api is", err)
            setInitialLoader(false);
        }
    }

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

    //user settings api data
    const userSettingDataUpgrade = (from) => {
        console.log("Api will run for", from);
        if (from === "phonePrice") {
            setSavePhoneLoader(true);
            return {
                upsellPhoneNumber: true,
                phonePrice: phonePrice,
            }
        } else if (from === "dncPrice") {
            setDNCLoader(true);
            return {
                upsellDnc: true,
                dncPrice: dncPrice,
            }
        } else if (from === "enrichmentPrice") {
            setPerplexityEnrichmentLoader(true);
            return {
                upsellEnrichment: true,
                enrichmentPrice: perplexityEnrichmentPrice,
            }
        }
    }

    //for deleting data
    const userSettingDataDel = (from) => {
        console.log("Api will run for", from);
        if (from === "phonePriceDel") {
            setDelPhoneLoader(true);
            return {
                upsellPhoneNumber: false,
                phonePrice: "",
            }
        } else if (from === "dncPriceDel") {
            setDelDNCLoader(true);
            return {
                upsellDnc: false,
                dncPrice: "",
            }
        } else if (from === "enrichmentPriceDel") {
            setDelPerplexityEnrichmentLoader(true);
            return {
                upsellEnrichment: false,
                enrichmentPrice: "",
            }
        }
    }

    //user settings api
    const handleUserSettings = async (from) => {
        try {
            const Auth = AuthToken();
            const ApiPath = Apis.userSettings;
            // const ApiData = userSettingDataUpgrade(from);
            let ApiData = null;
            if (from?.endsWith("Del")) {
                ApiData = userSettingDataDel(from);
            } else {
                ApiData = userSettingDataUpgrade(from);
            }
            console.log("Api data sending in user setting api is", ApiData);
            const response = await axios.put(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + Auth,
                    "Content-Type": "application/json",
                },
            });
            console.log("Response of user settings api is", response);
            if (response) {
                if (response.data.status === true) {
                    setShowSnackMessage(response.data.message);
                    setShowSnackType(SnackbarTypes.Success);
                    setAddDNC(false);
                    setAddUpSellPhone(false);
                    setAddPerplexityEnrichment(false);
                    setSettingsData(response.data.data);
                } else {
                    setShowSnackMessage(response.data.message);
                    setShowSnackType(SnackbarTypes.Error);
                }
                handleResetLoaders();
            }
        }
        catch (error) {
            console.error("Error occured in user settings api is", error);
            handleResetLoaders();
        }
    }

    //reset loaders
    const handleResetLoaders = () => {
        setSavePhoneLoader(false);
        setDNCLoader(false);
        setPerplexityEnrichmentLoader(false);
        setDelPhoneLoader(false);
        setDelDNCLoader(false);
        setDelPerplexityEnrichmentLoader(false);
    }

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
                {
                    initialLoader ? (
                        <div className="flex flex-row items-center justify-center w-full">
                            <CircularProgress size={30} />
                        </div>
                    ) : (
                        <div className="w-full border rounded-xl p-4 rounded-lg border rounded-xl">
                            <div style={{ fontWeight: "600", fontSize: "22px", color: "#000000" }}>Upsell Features</div>
                            <div className='border-b'>
                                <div className="border rounded-lg p-4 w-full mt-4 mb-4 bg-[#D9D9D917]">
                                    <div className='flex flex-row items-center justify-between w-full'>
                                        <div>
                                            <div style={styles.heading}>
                                                Phone Numbers.
                                            </div>
                                            <div style={styles.subHeading}>
                                                Easily upsell phone numbers
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-center gap-2">
                                            {
                                                delPhoneLoader ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <Switch
                                                        checked={allowUpSellPhone}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setAllowUpSellPhone(checked);

                                                            if (allowUpSellPhone === false) {
                                                                setAddUpSellPhone(true);
                                                            } else {
                                                                if (settingsData?.phonePrice) {
                                                                    handleUserSettings("phonePriceDel");
                                                                } else {
                                                                    setPhonePrice("")
                                                                    setAddUpSellPhone(false);
                                                                }
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
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        settingsData?.phonePrice && (
                                            <div className="w-full flex flex-row items-center justify-between">
                                                <div style={styles.subHeading}>
                                                    Your cost is ${settingsData?.phonePrice || 0}/mo for each number
                                                </div>
                                                <button className="flex flex-row items-center gap-2" onClick={() => {
                                                    setAddUpSellPhone(true);
                                                }}>
                                                    <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                                                    <Image
                                                        alt="*"
                                                        src={"/assets/editPen.png"}
                                                        height={16}
                                                        width={16}
                                                    />
                                                </button>
                                            </div>
                                        )
                                    }
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
                                                            setPhonePrice(sanitized);
                                                        }}
                                                    />
                                                </div>
                                                {
                                                    savePhoneLoader ? (
                                                        <div className="flex flex-row items-center justify-center w-[10%]">
                                                            <CircularProgress size={30} />
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => { handleUserSettings("phonePrice") }} className={`w-[10%] bg-purple text-white h-[40px] rounded-xl`} style={{ fontSize: "15px", fontWeight: "500" }}>
                                                            Save
                                                        </button>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            <div className='border-b'>
                                <div className='w-full mt-4 mb-4 bg-[#D9D9D917] border rounded-lg p-4'>
                                    <div className='flex flex-row items-center justify-between w-full'>
                                        <div>
                                            <div style={styles.heading}>
                                                DNC
                                            </div>
                                            <div style={styles.subHeading}>
                                                Upsell seats to your members
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-center gap-2">
                                            {
                                                delDNCLoader ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <Switch
                                                        checked={allowDNC}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setAllowDNC(checked);

                                                            if (allowDNC === false) {
                                                                setAddDNC(true);
                                                            } else {
                                                                if (settingsData?.dncPrice) {
                                                                    handleUserSettings("dncPriceDel");
                                                                } else {
                                                                    setAddDNC("");
                                                                    setAddDNC(false);
                                                                }
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
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        settingsData?.dncPrice && (
                                            <div className="w-full flex flex-row items-center justify-between">
                                                <div style={styles.subHeading}>
                                                    Your cost is ${settingsData?.dncPrice || 0}
                                                </div>
                                                <button className="flex flex-row items-center gap-2" onClick={() => {
                                                    setAddDNC(true);
                                                }}>
                                                    <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                                                    <Image
                                                        alt="*"
                                                        src={"/assets/editPen.png"}
                                                        height={16}
                                                        width={16}
                                                    />
                                                </button>
                                            </div>
                                        )
                                    }
                                    {
                                        addDNC && (
                                            <div className="flex flex-row items-center justify-center gap-2">
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
                                                            setDncPrice(sanitized);
                                                        }}
                                                    />
                                                </div>
                                                {
                                                    dNCLoader ? (
                                                        <div className="flex flex-row items-center justify-center w-[10%]">
                                                            <CircularProgress size={30} />
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => { handleUserSettings("dncPrice") }} className={`w-[10%] bg-purple text-white h-[40px] rounded-xl`} style={{ fontSize: "15px", fontWeight: "500" }}>
                                                            Save
                                                        </button>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            <div className='border-b'>
                                <div className="border rounded-lg p-4 w-full mt-4 mb-4 bg-[#D9D9D917]">
                                    <div className='flex flex-row items-center justify-between w-full'>
                                        <div>
                                            <div style={styles.heading}>
                                                Perplexity Enrichment
                                            </div>
                                            <div style={styles.subHeading}>
                                                Upsell perplexity enrichment
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-center gap-2">
                                            {
                                                delPerplexityEnrichmentLoader ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <Switch
                                                        checked={allowPerplexityEnrichment}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setAllowPerplexityEnrichment(checked);

                                                            if (allowPerplexityEnrichment === false) {
                                                                setAddPerplexityEnrichment(true);
                                                            } else {
                                                                if (settingsData?.enrichmentPrice) {
                                                                    handleUserSettings("enrichmentPriceDel");
                                                                } else {
                                                                    setPerplexityEnrichmentPrice("");
                                                                    setAddPerplexityEnrichment(false);
                                                                }
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
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        settingsData?.enrichmentPrice && (
                                            <div className='flex flex-row items-center justify-between w-full mt-2'>
                                                <div style={styles.subHeading}>
                                                    Your cost is ${settingsData?.enrichmentPrice || 0}
                                                </div>
                                                <button className="flex flex-row items-center gap-2" onClick={() => {
                                                    setAddPerplexityEnrichment(true);
                                                }}>
                                                    <div className="text-purple outline-none border-none rounded p-1 bg-white" style={{ fontSize: "16px", fontWeight: "400" }}>Edit</div>
                                                    <Image
                                                        alt="*"
                                                        src={"/assets/editPen.png"}
                                                        height={16}
                                                        width={16}
                                                    />
                                                </button>
                                            </div>
                                        )
                                    }
                                    {
                                        addPerplexityEnrichment && (
                                            <div className="flex flex-row items-center justify-center gap-2 mt-2">
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
                                                            setPerplexityEnrichmentPrice(sanitized);
                                                        }}
                                                    />
                                                </div>
                                                {
                                                    perplexityEnrichmentLoader ? (
                                                        <div className="flex flex-row items-center justify-center w-[10%]">
                                                            <CircularProgress size={30} />
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => { handleUserSettings("enrichmentPrice") }} className={`w-[10%] bg-purple text-white h-[40px] rounded-xl`} style={{ fontSize: "15px", fontWeight: "500" }}>
                                                            Save
                                                        </button>
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                            <div>
                                <div className='flex flex-row items-center justify-between border rounded-lg p-4 w-full mt-4 mb-4 bg-[#D9D9D917]'>
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
                    )
                }
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