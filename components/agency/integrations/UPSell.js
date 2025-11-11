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
    //warning message
    const [snackBannerMsg, setSnackBannerMsg] = useState(null);
    const [snackBannerMsgType, setSnackBannerMsgType] = useState(SnackbarTypes.Warning);
    
    // Calculator results for each product type
    const [phoneCalculatorResult, setPhoneCalculatorResult] = useState(null);
    const [dncCalculatorResult, setDncCalculatorResult] = useState(null);
    const [enrichmentCalculatorResult, setEnrichmentCalculatorResult] = useState(null);
    const [calculatorLoading, setCalculatorLoading] = useState({
        phone: false,
        dnc: false,
        enrichment: false
    });
    
    // Debounce timers for calculator
    const calculatorTimers = React.useRef({
        phone: null,
        dnc: null,
        enrichment: null
    });

    //warning messages for less price
    // setSnackBannerMsg(`Price per credit cannot be less than $ ${agencyPlanCost.toFixed(2)}`);
    // setSnackBannerMsgType(SnackbarTypes.Warning);

    const handleTogglePhoneNumbers = (phoneNumbers) => {
        setPhoneNumbers(!phoneNumbers);
    }

    useEffect(() => {
        getUserSettings();
        getLocalData();
        
        // Cleanup timers on unmount
        return () => {
            Object.values(calculatorTimers.current).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
        };
    }, []);

    // Calculate earnings using calculator API
    const calculateEarnings = async (productType, price, from) => {
        if (!price || price <= 0 || isNaN(parseFloat(price))) {
            // Clear calculator result if price is invalid
            if (from === "phonePrice") {
                setPhoneCalculatorResult(null);
            } else if (from === "dncPrice") {
                setDncCalculatorResult(null);
            } else if (from === "enrichmentPrice") {
                setEnrichmentCalculatorResult(null);
            }
            return;
        }

        try {
            // Set loading state
            setCalculatorLoading(prev => ({ ...prev, [productType]: true }));

            const token = AuthToken();
            if (!token) return;

            const response = await axios.post(
                Apis.agencyCalculator,
                {
                    productType: productType,
                    price: parseFloat(price),
                    quantity: 1
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response?.data?.status && response?.data?.data) {
                const calculatorData = response.data.data;
                
                // Update the appropriate calculator result
                if (from === "phonePrice") {
                    setPhoneCalculatorResult(calculatorData);
                } else if (from === "dncPrice") {
                    setDncCalculatorResult(calculatorData);
                } else if (from === "enrichmentPrice") {
                    setEnrichmentCalculatorResult(calculatorData);
                }
            }
        } catch (error) {
            console.error(`Error calculating earnings for ${productType}:`, error);
        } finally {
            setCalculatorLoading(prev => ({ ...prev, [productType]: false }));
        }
    };

    //low price detector
    const checkPrice = (price, from) => {
        // enrichment : 0.05
        // dnc : 0.03
        // phone price: 1.15
        if (from === "phonePrice") {
            if (price < 1.15) {
                setSnackBannerMsg(`Upsell Price cannot be less than $ ${1.15.toFixed(2)}`);
                setSnackBannerMsgType(SnackbarTypes.Warning);
            } else {
                setSnackBannerMsg(null);
            }
        } else if (from === "dncPrice") {
            if (price < 0.03) {
                setSnackBannerMsg(`Upsell Price cannot be less than $ ${0.03.toFixed(2)}`);
                setSnackBannerMsgType(SnackbarTypes.Warning);
            } else {
                setSnackBannerMsg(null);
            }
        } else if (from === "enrichmentPrice") {
            if (price < 0.05) {
                setSnackBannerMsg(`Upsell Price cannot be less than $ ${0.05.toFixed(2)}`);
                setSnackBannerMsgType(SnackbarTypes.Warning);
            } else {
                setSnackBannerMsg(null);
            }
        }
        
        // Calculate earnings when price changes (with debounce)
        if (price > 0) {
            const productType = from === "phonePrice" ? "phone" : from === "dncPrice" ? "dnc" : "enrichment";
            
            // Clear existing timer
            if (calculatorTimers.current[productType]) {
                clearTimeout(calculatorTimers.current[productType]);
            }
            
            // Set new timer to debounce API call
            calculatorTimers.current[productType] = setTimeout(() => {
                calculateEarnings(productType, price, from);
            }, 500); // 500ms debounce
        }
    }


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
                setDncPrice((Data?.dncPrice).toFixed(2) || "");
                setPerplexityEnrichmentPrice(Data?.enrichmentPrice || "");
                setSettingsData(Data);
                setAllowUpSellPhone(Data?.upsellPhoneNumber);
                setAllowDNC(Data?.upsellDnc);
                setAllowPerplexityEnrichment(Data?.upsellEnrichment);
                setInitialLoader(false);
                
                // Calculate earnings for existing prices
                if (Data?.phonePrice) {
                    calculateEarnings("phone", Data.phonePrice, "phonePrice");
                }
                if (Data?.dncPrice) {
                    calculateEarnings("dnc", Data.dncPrice, "dncPrice");
                }
                if (Data?.enrichmentPrice) {
                    calculateEarnings("enrichment", Data.enrichmentPrice, "enrichmentPrice");
                }
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
        console.log("Api will run for upgrade", from);
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
                    setShowSnackMessage("Upsell updated");
                    setShowSnackType(SnackbarTypes.Success);
                    setAddDNC(false);
                    setAddUpSellPhone(false);
                    setAddPerplexityEnrichment(false);
                    setSettingsData(response.data.data);
                    
                    // Recalculate earnings after save
                    if (from === "phonePrice" && response.data.data?.phonePrice) {
                        calculateEarnings("phone", response.data.data.phonePrice, "phonePrice");
                    } else if (from === "dncPrice" && response.data.data?.dncPrice) {
                        calculateEarnings("dnc", response.data.data.dncPrice, "dncPrice");
                    } else if (from === "enrichmentPrice" && response.data.data?.enrichmentPrice) {
                        calculateEarnings("enrichment", response.data.data.enrichmentPrice, "enrichmentPrice");
                    }
                } else {
                    setShowSnackMessage(response.data.message);
                    setShowSnackType(SnackbarTypes.Error);
                }
                handleResetLoaders();
                if (from?.endsWith("Del")) {
                    resetInputFields(from, response.data.data);
                    // Clear calculator results when deleted
                    if (from === "phonePriceDel") {
                        setPhoneCalculatorResult(null);
                    } else if (from === "dncPriceDel") {
                        setDncCalculatorResult(null);
                    } else if (from === "enrichmentPriceDel") {
                        setEnrichmentCalculatorResult(null);
                    }
                }
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

    //reset input fields
    const resetInputFields = (from, data) => {
        if (from === "phonePriceDel") {
            setPhonePrice(data?.phonePrice);
        } else if (from === "dncPriceDel") {
            // setDelDNCLoader(true);
            setDncPrice(data?.dncPrice);
        } else if (from === "enrichmentPriceDel") {
            // setDelPerplexityEnrichmentLoader(true);
            setPerplexityEnrichmentPrice(data?.enrichmentPrice);
        }
    }

    return (
        <div className="flex flex-row justify-center h-[73vh] w-full overflow-y-auto">
            <div className='w-11/12 pt-4'>
                <AgentSelectSnackMessage
                    isVisible={snackBannerMsg !== null}
                    message={snackBannerMsg}
                    hide={() => {
                        // setSnackMsg(null);
                    }}
                    type={snackBannerMsgType}
                />
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
                                                Phone Numbers
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
                                                        checked={allowUpSellPhone || settingsData?.upsellPhoneNumber}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setAllowUpSellPhone(checked);

                                                            if (addUpSellPhone === false && settingsData?.upsellPhoneNumber === false) {
                                                                setAddUpSellPhone(true);
                                                            } else if (settingsData?.phonePrice) {
                                                                handleUserSettings("phonePriceDel");
                                                            } else {
                                                                // setPhonePrice("")
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
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        settingsData?.phonePrice && (
                                            <div className="w-full flex flex-col gap-2">
                                                <div className="w-full flex flex-row items-center justify-between">
                                                    <div style={styles.subHeading}>
                                                        Your upsell price is ${(settingsData?.phonePrice || 0).toFixed(2)}/mo for each number
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
                                                {phoneCalculatorResult && (
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500", marginBottom: 4 }}>
                                                            Your Net Revenue
                                                        </div>
                                                        <div style={{ fontSize: 18, fontWeight: "600", color: "#7902DF" }}>
                                                            ${phoneCalculatorResult.agencyNetAmount}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#00000060", marginTop: 4 }}>
                                                            per number after fees
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }
                                    {
                                        addUpSellPhone && (
                                            <div className="flex flex-col gap-2 mb-4 mt-2">
                                                <div className="flex flex-row items-center justify-center gap-2">
                                                    <div className="border border-gray-200 rounded px-2 py-0  flex flex-row items-center w-[90%]">
                                                        <div className="" style={styles.inputs}>
                                                            $
                                                        </div>
                                                        <input
                                                            style={styles.inputs}
                                                            type="text"
                                                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                                            placeholder="Your upsell price"
                                                            value={phonePrice}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                // Allow only digits and one optional period
                                                                const sanitized = value.replace(/[^0-9.]/g, '');
                                                                setPhonePrice(sanitized);
                                                                if (sanitized > 0) {
                                                                    checkPrice(sanitized, "phonePrice");
                                                                }
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
                                                {phoneCalculatorResult && (
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500", marginBottom: 4 }}>
                                                            Your Net Revenue
                                                        </div>
                                                        <div style={{ fontSize: 18, fontWeight: "600", color: "#7902DF" }}>
                                                            ${phoneCalculatorResult.agencyNetAmount}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#00000060", marginTop: 4 }}>
                                                            per number after fees
                                                        </div>
                                                    </div>
                                                )}
                                                {calculatorLoading.phone && (
                                                    <div className="flex flex-row items-center gap-2 text-gray-500" style={{ fontSize: 12 }}>
                                                        <CircularProgress size={14} />
                                                        <span>Calculating...</span>
                                                    </div>
                                                )}
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
                                                        checked={allowDNC || settingsData?.upsellDnc}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setAllowDNC(checked);

                                                            if (addDNC === false && settingsData?.upsellDnc === false) {
                                                                setAddDNC(true);
                                                            } else if (settingsData?.dncPrice) {
                                                                handleUserSettings("dncPriceDel");
                                                            } else {
                                                                // setAddDNC("");
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
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        settingsData?.dncPrice && (
                                            <div className="w-full flex flex-col gap-2">
                                                <div className="w-full flex flex-row items-center justify-between">
                                                    <div style={styles.subHeading}>
                                                        Your upsell price is ${settingsData?.dncPrice.toFixed(2)}
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
                                                {dncCalculatorResult && (
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500", marginBottom: 4 }}>
                                                            Your Net Revenue
                                                        </div>
                                                        <div style={{ fontSize: 18, fontWeight: "600", color: "#7902DF" }}>
                                                            ${dncCalculatorResult.agencyNetAmount}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#00000060", marginTop: 4 }}>
                                                            per check after fees
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }
                                    {
                                        addDNC && (
                                            <div className="flex flex-col gap-2 mt-2">
                                                <div className="flex flex-row items-center justify-center gap-2">
                                                    <div className="border border-gray-200 rounded px-2 py-0  flex flex-row items-center w-[90%]">
                                                        <div className="" style={styles.inputs}>
                                                            $
                                                        </div>
                                                        <input
                                                            style={styles.inputs}
                                                            type="text"
                                                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                                            placeholder="Your upsell price"
                                                            value={dncPrice}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                // Allow only digits and one optional period
                                                                const sanitized = value.replace(/[^0-9.]/g, '');
                                                                setDncPrice(sanitized);
                                                                if (sanitized > 0) {
                                                                    checkPrice(sanitized, "dncPrice");
                                                                }
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
                                                {dncCalculatorResult && (
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500", marginBottom: 4 }}>
                                                            Your Net Revenue
                                                        </div>
                                                        <div style={{ fontSize: 18, fontWeight: "600", color: "#7902DF" }}>
                                                            ${dncCalculatorResult.agencyNetAmount}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#00000060", marginTop: 4 }}>
                                                            per check after fees
                                                        </div>
                                                    </div>
                                                )}
                                                {calculatorLoading.dnc && (
                                                    <div className="flex flex-row items-center gap-2 text-gray-500" style={{ fontSize: 12 }}>
                                                        <CircularProgress size={14} />
                                                        <span>Calculating...</span>
                                                    </div>
                                                )}
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
                                                        checked={allowPerplexityEnrichment || settingsData?.upsellEnrichment}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setAllowPerplexityEnrichment(checked);

                                                            if (addPerplexityEnrichment === false && settingsData?.upsellEnrichment === false) {
                                                                setAddPerplexityEnrichment(true);
                                                            } else if (settingsData?.enrichmentPrice) {
                                                                handleUserSettings("enrichmentPriceDel");
                                                            } else {
                                                                // setPerplexityEnrichmentPrice("");
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
                                                )
                                            }
                                        </div>
                                    </div>
                                    {
                                        settingsData?.enrichmentPrice && (
                                            <div className='flex flex-col gap-2 w-full mt-2'>
                                                <div className='flex flex-row items-center justify-between w-full'>
                                                    <div style={styles.subHeading}>
                                                        Your upsell price is ${settingsData?.enrichmentPrice.toFixed(2)}/mo for each enrichment
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
                                                {enrichmentCalculatorResult && (
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500", marginBottom: 4 }}>
                                                            Your Net Revenue
                                                        </div>
                                                        <div style={{ fontSize: 18, fontWeight: "600", color: "#7902DF" }}>
                                                            ${enrichmentCalculatorResult.agencyNetAmount}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#00000060", marginTop: 4 }}>
                                                            per enrichment after fees
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }
                                    {
                                        addPerplexityEnrichment && (
                                            <div className="flex flex-col gap-2 mt-2">
                                                <div className="flex flex-row items-center justify-center gap-2">
                                                    <div className="border border-gray-200 rounded px-2 py-0  flex flex-row items-center w-[90%]">
                                                        <div className="" style={styles.inputs}>
                                                            $
                                                        </div>
                                                        <input
                                                            style={styles.inputs}
                                                            type="text"
                                                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                                            placeholder="Your upsell price"
                                                            value={perplexityEnrichmentPrice}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                // Allow only digits and one optional period
                                                                const sanitized = value.replace(/[^0-9.]/g, '');
                                                                setPerplexityEnrichmentPrice(sanitized);
                                                                if (sanitized > 0) {
                                                                    checkPrice(sanitized, "enrichmentPrice");
                                                                }
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
                                                {enrichmentCalculatorResult && (
                                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                        <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500", marginBottom: 4 }}>
                                                            Your Net Revenue
                                                        </div>
                                                        <div style={{ fontSize: 18, fontWeight: "600", color: "#7902DF" }}>
                                                            ${enrichmentCalculatorResult.agencyNetAmount}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: "#00000060", marginTop: 4 }}>
                                                            per enrichment after fees
                                                        </div>
                                                    </div>
                                                )}
                                                {calculatorLoading.enrichment && (
                                                    <div className="flex flex-row items-center gap-2 text-gray-500" style={{ fontSize: 12 }}>
                                                        <CircularProgress size={14} />
                                                        <span>Calculating...</span>
                                                    </div>
                                                )}
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
                                        Coming Soon
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