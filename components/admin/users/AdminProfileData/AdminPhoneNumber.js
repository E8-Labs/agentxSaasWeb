'use-client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import Apis from '@/components/apis/Apis';
import { CircularProgress } from '@mui/material';
import ClaimNumber from '@/components/dashboard/myagentX/ClaimNumber';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';

function AdminPhoneNumber({selectedUser}) {

    const [openMoreDropdown, setOpenMoreDropdown] = useState("")
    const [moreDropdown, setMoreDropdown] = useState("");
    const [numbers, setNumbers] = useState([])
    const [loading, setLoading] = useState(false);

    const [selectedNumber, setSelectedNumber] = useState("");
    //variables for delnum
    const [delLoader, setDelLoader] = useState(false);
    const [snackMsg, setSnackMsg] = useState("");
    const [errType, setErrType] = useState(null);

    //variables for add new number popup
    const [showClaimPopup, setShowClaimPopup] = useState(false);


    useEffect(() => {
        getPhoneNumbers()
    }, []);

    //function to close cllaim no popup
    const handleCloseClaimPopup = () => {
        setShowClaimPopup(false);
    };

    //function get phonenumbers
    const getPhoneNumbers = async () => {
        const data = localStorage.getItem("User")
        if (data) {
            let u = JSON.parse(data)
            try {
                setLoading(true)
                let path = Apis.userAvailablePhoneNumber+"?userId="+selectedUser.id
                console.log("path", path)
                const response = await axios.get(path, {
                    headers: {
                        Authorization: "Bearer " + u.token,
                    }
                })
                if (response) {
                    setLoading(false)
                    if (response.data.status === true) {
                       console.log("response", response.data.data)
                        setNumbers(response.data.data)
                    } else {
                       //console.log
                    }
                }
            } catch (e) {
                setLoading(false)
               //console.log
            }
        }
    }

    const handleMoreClose = (event) => {
        // setSelectedItem(event.target.textContent)
        setOpenMoreDropdown(false);
    };

    //function to delete phonenumber
    const handleDeletePhone = async () => {
        try {
            setDelLoader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const D = JSON.parse(localData);
               // //console.log;
                AuthToken = D.token
            }

            const ApiData = {
                phone: selectedNumber
            }

           // //console.log;

            const ApiPath = Apis.delNumber;

           // //console.log;

            // return
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
               // //console.log;
                if (response.data.status === true) {
                    setNumbers((prevNumbers) =>
                        prevNumbers.filter((item) => item.phoneNumber !== selectedNumber)
                    );
                    setSnackMsg("Number deleted successfully")
                    setErrType(SnackbarTypes.Success);
                    handleMoreClose();
                } else if (response.data.status === false) {
                    setSnackMsg(response.data.message)
                    setErrType(SnackbarTypes.Error)
                }
            }

        } catch (error) {
           // console.error("Error occured in api is", error);
            setSnackMsg(error);
            setErrType(SnackbarTypes.Error);
        } finally {
            setDelLoader(false);
        }
    }

    return (
        <div className='w-full flex flex-col items-start px-8 py-2' style={{ paddingBottom: '50px', height: '100%', overflow: 'auto', scrollbarWidth: 'none' }}>

            <Menu
                id="more-menu"
                anchorEl={moreDropdown}
                open={openMoreDropdown}
                onClose={handleMoreClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: 15,
                        fontWeight: 500,
                        color: 'red',
                        padding: 0, // Remove default padding
                        marginInline: 2, // Remove default margin
                        minHeight: 0, // Adjust height to remove extra spacing
                    }}
                    // onClick={handleMoreClose}
                >
                    {
                        delLoader ? (
                            <CircularProgress size={15} />
                        ) : (
                            <button
                                className='outline-none flex flex-row items-center gap-2'
                                onClick={() => { handleDeletePhone() }}
                            >
                                <Image
                                    src="/otherAssets/deleteIcon.png"
                                    alt="Delete"
                                    width={24}
                                    height={24}
                                />
                                <div>
                                    Delete
                                </div>
                            </button>
                        )
                    }
                </MenuItem>
            </Menu>

            {
                snackMsg && (
                    <AgentSelectSnackMessage
                        isVisible={snackMsg} hide={() => setSnackMsg("")} message={snackMsg} type={errType}
                    />
                )
            }
            <div className='w-full flex flex-row items-center justify-between'>
                <div className='flex flex-col'>
                    <div style={{ fontSize: 22, fontWeight: "700", color: '#000' }}>
                        My Numbers
                    </div>

                    <div style={{ fontSize: 12, fontWeight: "500", color: '#00000090' }}>
                        {"Account > My Numbers"}
                    </div>
                </div>

                <button
                    className='outline-none'
                    onClick={() => {
                        setShowClaimPopup(true);
                    }}
                >
                    <div style={{ fontSize: 15, fontWeight: '500', color: '#7902DF', textDecorationLine: 'underline' }}>
                        Add New Number
                    </div>
                </button>
            </div>

            {/* Modal for add new number */}
            {
                showClaimPopup && (
                    <ClaimNumber
                        showClaimPopup={showClaimPopup}
                        handleCloseClaimPopup={handleCloseClaimPopup}
                        // setOpenCalimNumDropDown={setOpenCalimNumDropDown}
                        // setSelectNumber={setSelectNumber}
                        setPreviousNumber={setNumbers}
                        previousNumber={numbers}
                    />
                )
            }

            <div className='w-full flex flex-col items-start gap-4 mt-10'>
                {
                    loading ? (
                        <CircularProgress style={{ alignSelf: 'center' }} size={45} />
                    ) :
                        numbers
                            .slice()
                            .reverse()
                            .map
                            ((item, index) => (
                                <div key={index} className='w-7/12 flex'>
                                    {/* <button className='w-full flex'
                            > */}
                                    <div className='w-full border rounded-lg p-4'>
                                        <div className='w-full flex flex-row items-center justify-between'>

                                            <div className="flex flex-col items-start gap-4">
                                                <div className='flex flex-row items-center gap-2'>
                                                    <div className='' style={{ fontSize: 16, fontWeight: '700' }}>
                                                        {item.phoneNumber}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex flex-col items-end gap-2'>
                                                <button id='more-menu'
                                                    onClick={(event) => {
                                                        setOpenMoreDropdown(true);
                                                        setMoreDropdown(event.currentTarget);
                                                       // //console.log
                                                        setSelectedNumber(item.phoneNumber)
                                                    }}>
                                                    <Image src={"/otherAssets/threeDotsIcon.png"}
                                                        height={24}
                                                        width={24}
                                                        alt='more'
                                                    />
                                                </button>
                                            </div>


                                        </div>
                                    </div>
                                    {/* </button> */}


                                </div>
                            ))
                }


            </div>
        </div>
    )
}

export default AdminPhoneNumber


const styles = {
    itemText: {
        fontSize: 15,
        fontWeight: '500',
        color: 'black'
    }, modalsStyle: {
        height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    headingStyle: {
        fontSize: 12,
        fontWeight: "400",
        color: '#00000050'
    },
    inputStyle: {
        fontSize: 15,
        fontWeight: "500",
        marginTop: 10
    }
}