import AdminGetProfileDetails from '@/components/admin/AdminGetProfileDetails';
import { RemoveSmartRefillApi, SmartRefillApi } from '@/components/onboarding/extras/SmartRefillapi';
import { CircularProgress, Switch } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const SmartRefillCard = ({ 
    selectedUser = null, 
    isDisabled = false, 
    onDisabledClick = null,
    isFreePlan = false
}) => {

    //smart refill variables
    const [allowSmartRefill, setAllowSmartRefill] = useState(false);
    const [userDataLoader, setUserDataLoader] = useState(false);
    //snack messages variables
    const [successSnack, setSuccessSnack] = useState(null);
    const [errorSnack, setErrorSnack] = useState(null);

    useEffect(() => {
        selectRefillOption()
    }, []);

    const selectRefillOption = async () => {
        if (selectedUser) {
            let data = await AdminGetProfileDetails(selectedUser.id)
            console.log("smart refill ", selectedUser)
            setAllowSmartRefill(data?.smartRefill);
        } else {

            const d = localStorage.getItem("User");
            if (d) {
                const Data = JSON.parse(d);
                console.log("Smart refill is", Data.user.smartRefill);
                setAllowSmartRefill(Data?.user?.smartRefill);
            }
        }
    }

    //function to update profile
    const handleUpdateProfile = async () => {
        try {
            setUserDataLoader(true);
            const response = await SmartRefillApi(selectedUser);
            if (response) {
                setUserDataLoader(false);
                console.log("Response of update profile api is", response);
                if (response.data.status === true) {
                    setSuccessSnack(response.data.message);
                    setAllowSmartRefill(true);
                    window.dispatchEvent(
                        new CustomEvent("hidePlanBar", { detail: { update: true } })
                    )
                } else if (response.data.status === false) {
                    setErrorSnack(response.data.message)
                }
            }
        } catch (error) {
            console.error("Error occured in api is", error);
            setUserDataLoader(false);
        }
    }

    //function to remove smart refill
    const handleRemoveSmartRefill = async () => {
        try {
            setUserDataLoader(true);
            const response = await RemoveSmartRefillApi(selectedUser);
            if (response) {
                setUserDataLoader(false);
                console.log("Response of remove smart refill api is", response);
                if (response.data.status === true) {
                    setSuccessSnack(response.data.message);
                    setAllowSmartRefill(false);
                } else if (response.data.status === false) {
                    setErrorSnack(response.data.message)
                }
            }
        } catch (error) {
            console.error("Error occured in api is", error);
            setUserDataLoader(false);
        }
    }

    return (
        <div className="w-full flex flex-row items-center mt-4 bg-purple p-2 rounded-3xl text-white"
        style={{
            backgroundImage: "url(/svgIcons/cardBg.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            color: "#fff",
            alignSelf: "center",
            marginTop: "2vh",
        }}
        >
            {/*
                userDataLoader ? (
                    <CircularProgress size={20} />
                ) : (
                    
                )
            */}
            <div>
                <Switch
                    checked={isFreePlan ? false : allowSmartRefill}
                    onChange={() => {
                        // If user is on free plan and trying to enable Smart Refill (always show as off for free plans)
                        if (isFreePlan && onDisabledClick) {
                            onDisabledClick();
                            return;
                        }
                        
                        if (isDisabled && onDisabledClick) {
                            onDisabledClick();
                            return;
                        }
                        setAllowSmartRefill(!allowSmartRefill);
                        if (allowSmartRefill === true) {
                            handleRemoveSmartRefill();
                        } else if (allowSmartRefill === false) {
                            handleUpdateProfile();
                        }
                    }}
                    sx={{
                        // ✅ Checked: green thumb, white track
                        '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#01CB76',
                            '& + .MuiSwitch-track': {
                                backgroundColor: '#ffffff',
                                opacity: 1,
                            },
                        },
                        // ✅ Checked + focused: green thumb
                        '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb': {
                            backgroundColor: '#01CB76',
                        },

                        // ✅ Unchecked: gray thumb, gray track
                        '& .MuiSwitch-thumb': {
                            backgroundColor: '#9e9e9e',
                        },
                        '& .MuiSwitch-track': {
                            backgroundColor: '#bdbdbd',
                            opacity: 1,
                        },

                        // ✅ Focus ring (optional): remove default blue ring
                        '& .Mui-focusVisible .MuiSwitch-thumb': {
                            outline: '2px solid #01CB76',
                        },
                    }}
                />

            </div>
            <Image src={"/otherAssets/smartRefillIcon.png"} 
                height={32} width={32} alt='*'
            />
            <div
                className="ms-4 text-base font-bold w-2/12"
               >
                Smart Refill
            </div>
            <div className="ms-2 w-8/12 text-[13px] font-normal text-white" style={{
                
            }}>
            Refill your AI credits when they run low. Keeps your calls going without interruption.
            </div>
        </div>
    )
}

export default SmartRefillCard;
