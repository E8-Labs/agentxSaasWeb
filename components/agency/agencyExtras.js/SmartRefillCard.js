import { RemoveSmartRefillApi, SmartRefillApi } from '@/components/onboarding/extras/SmartRefillapi';
import { CircularProgress, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react'

const SmartRefillCard = () => {

    //smart refill variables
    const [allowSmartRefill, setAllowSmartRefill] = useState(false);
    const [userDataLoader, setUserDataLoader] = useState(false);
    //snack messages variables
    const [successSnack, setSuccessSnack] = useState(null);
    const [errorSnack, setErrorSnack] = useState(null);

    useEffect(() => {
        const d = localStorage.getItem("User");
        if (d) {
            const Data = JSON.parse(d);
            console.log("Smart refill is", Data.user.smartRefill);
            setAllowSmartRefill(Data?.user?.smartRefill);
        }
    }, []);

    //function to update profile
    const handleUpdateProfile = async () => {
        try {
            setUserDataLoader(true);
            const response = await SmartRefillApi();
            if (response) {
                setUserDataLoader(false);
                console.log("Response of update profile api is", response);
                if (response.data.status === true) {
                    setSuccessSnack(response.data.message);
                    setAllowSmartRefill(true);
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
            const response = await RemoveSmartRefillApi();
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
        <div className="w-9/12 flex flex-row items-center mt-4 bg-purple p-2 rounded-md text-white">
            {/*
                userDataLoader ? (
                    <CircularProgress size={20} />
                ) : (
                    
                )
            */}
            <div>
                <Switch
                    checked={allowSmartRefill}
                    onChange={() => {
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
            <div
                className="ms-4 w-2/12"
                style={{
                    fontWeight: "700",
                    fontSize: "15px"
                }}>
                Smart Refill
            </div>
            <div className="w-8/12 ms-2" style={{
                fontWeight: "500",
                fontSize: "15px"
            }}>
                Refill your AI mins when they run low. Keeps your calls going without interruption.
            </div>
        </div>
    )
}

export default SmartRefillCard;
