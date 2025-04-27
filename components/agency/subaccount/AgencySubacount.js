"use client"
import React, { useEffect, useState } from 'react'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import moment from 'moment';
import Image from 'next/image';
import CreateSubAccountModal from './CreateSubAccountModal';
import Apis from '@/components/apis/Apis';
import { AuthToken } from '../plan/AuthDetails';
import axios from 'axios';
import { Box, CircularProgress, Modal } from '@mui/material';
import SelectedUserDetails from '@/components/admin/users/SelectedUserDetails';

function AgencySubacount() {

    const [subAccountList, setSubAccountsList] = useState([]);
    const [initialLoader, setInitialLoader] = useState(false);
    const [moreDropdown, setmoreDropdown] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(false);
    const [agencyData, setAgencyData] = useState("")

    useEffect(() => {
        getLocalData()
        getSubAccounts();
    }, []);


    // get agency data from local 

    const getLocalData = () => {
        let data = localStorage.getItem("User")
        if (data) {
            let u = JSON.parse(data)

            setAgencyData(u.user)
        }
    }

    //code 
    const handleCloseModal = () => {
        getSubAccounts();
        setShowModal(false);
    }

    // /code for getting the subaccouts list
    const getSubAccounts = async () => {
        console.log("Trigered get subaccounts");
        try {
            setInitialLoader(true);
            const ApiPAth = Apis.getAgencySubAccount;
            const Token = AuthToken();
            const response = await axios.get(ApiPAth, {
                headers: {
                    "Authorization": "Bearer " + Token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get subaccounts api is", response.data);
                setSubAccountsList(response.data.data);
                setInitialLoader(false);
            }

        } catch (error) {
            console.error("Error occured in getsub accounts is", error);
            setInitialLoader(false);
        }
    }


    const subAcccounts = [
        {
            id: 1,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 2,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 3,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 4,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 5,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }, {
            id: 6,
            name: 'ali',
            plan: 'abc',
            totalSpent: '5555',
            balance: '378',
            leads: '260',
            renewlDate: 'April 8, 2025',
            teamMembers: '21',
        }

    ]

    return (
        <div className='w-full flex flex-col items-center '>

            <div className='flex w-full flex-row items-center justify-between px-5 py-5 border-b'>

                <div style={{
                    fontSize: 22, fontWeight: '700'
                }}>
                    {agencyData?.name}
                </div>

                <div>
                    <NotficationsDrawer />
                </div>
            </div>

            <div className='w-[95%] h-[90vh] rounded-lg flex flex-col items-center  p-5 bg-white shadow-md'>

                <div
                    className="w-full h-[130px] flex flex-row items-center justify-between rounded-lg px-6"
                    style={{
                        backgroundImage: "url('/svgIcons/bg.svg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        // borderRadius:'20px'
                    }}
                >

                    <div style={{
                        fontSize: 29, fontWeight: '700', color: 'white'
                    }}>
                        Total Subaccounts: {subAccountList?.length || 0}
                    </div>

                    <button
                        className='flex px-5 py-3 bg-white rounded-lg text-purple font-medium'
                        onClick={() => { setShowModal(true) }}
                    >
                        Create Subaccount
                    </button>


                </div>

                <div className="w-full flex flex-row justify-between mt-2 px-10 mt-10">
                    <div className="w-3/12">
                        <div style={styles.text}>Subaccoun</div>
                    </div>
                    <div className="w-1/12 ">
                        <div style={styles.text}>Plan</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Total Spent</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Balance</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Leads</div>
                    </div>
                    <div className="w-2/12">
                        <div style={styles.text}>Renewal</div>
                    </div>
                    <div className="w-2/12">
                        <div style={styles.text}>Teams</div>
                    </div>
                    <div className="w-1/12">
                        <div style={styles.text}>Action</div>
                    </div>
                </div>

                {
                    initialLoader ?
                        <div className='w-full flex flex-row justify-center mt-4'>
                            <CircularProgress size={35} />
                        </div> :
                        <div
                            className={`h-[71vh] overflow-auto w-full`}
                            id="scrollableDiv1"
                            style={{ scrollbarWidth: "none" }}
                        >
                            {subAccountList?.length > 0 ? (
                                <div>
                                    {subAccountList.reverse().map((item) => (
                                        <div
                                            key={item.id}
                                            style={{ cursor: "pointer" }}
                                            className="w-full flex flex-row justify-between items-center mt-5 px-10 hover:bg-[#402FFF05] py-2 cursor-pointer"
                                            onClick={() => { setSelectedUser(item) }}
                                        >
                                            <div
                                                className="w-3/12 flex flex-row gap-2 items-center cursor-pointer flex-shrink-0"
                                            // onClick={() => {
                                            //     // // //console.log;
                                            //     // setselectedLeadsDetails(item);
                                            //     // setShowDetailsModal(true);
                                            // }}
                                            >
                                                {
                                                    item.thumb_profile_image ? (
                                                        <Image src={item.thumb_profile_image}
                                                            className='rounded-full'
                                                            height={40}
                                                            width={40}
                                                            style={{
                                                                height: "40px",
                                                                width: "40px",
                                                                resize: "cover",
                                                            }}
                                                            alt="*" />
                                                    ) : (
                                                        <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                                                            {item.name.slice(0, 1).toUpperCase()}
                                                        </div>
                                                    )
                                                }

                                                <div style={{ ...styles.text2, ...{ width: "80%", } }}>
                                                    {item.name}
                                                </div>
                                            </div>
                                            <div className="w-1/12 ">
                                                <div style={styles.text2}>
                                                    {item.plan?.type}
                                                </div>
                                            </div>
                                            <div className="w-1/12">
                                                {/* (item.LeadModel?.phone) */}
                                                <div style={styles.text2}>
                                                    ${item.totalSpent || 0}
                                                </div>
                                            </div>
                                            <div className="w-1/12">
                                                <div style={styles.text2}>
                                                    {item.balance || 0} minutes
                                                </div>
                                            </div>
                                            <div className="w-1/12">
                                                <div style={styles.text2}>
                                                    {item.totalLeads}
                                                </div>
                                            </div>
                                            <div className="w-2/12">
                                                <div style={styles.text2}>
                                                    {item.nextChargeDate ? moment(item.nextChargeDate).format("MMMM DD,YYYY") : "-"}
                                                </div>
                                            </div>
                                            <div className="w-2/12">
                                                {item.teamMembers}
                                            </div>

                                            <div className="w-1/12 relative">
                                                <button
                                                    id={`dropdown-toggle-${item.id}`}
                                                    onClick={() =>
                                                        setmoreDropdown(
                                                            moreDropdown === item.id ? null : item.id
                                                        )
                                                    }
                                                >
                                                    <Image src={'/svgIcons/threeDotsIcon.svg'} height={24} width={24} alt="menu" />
                                                </button>

                                                {moreDropdown === item.id && (
                                                    <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg z-50 w-[200px]">
                                                        <div
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                            onClick={() => {
                                                                setmoreDropdown(null)
                                                            }}
                                                        >
                                                            View Detail
                                                        </div>
                                                        <div
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                            onClick={() => {
                                                                // Handle invite
                                                            }}
                                                        >
                                                            Invite Team
                                                        </div>
                                                        <div
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                                                            onClick={() => {
                                                                // Handle view plans
                                                            }}
                                                        >
                                                            View Plans
                                                        </div>
                                                       
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div
                                    className="text-center mt-4"
                                    style={{ fontWeight: "bold", fontSize: 20 }}
                                >
                                    No sub-account found
                                </div>
                            )}
                        </div>
                }


                {/* Code for modals */}
                <CreateSubAccountModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    closeAll={() => { handleCloseModal() }}
                />

                {/* Code for subaccount modal */}
                <Modal
                    open={selectedUser ? true : false}
                    onClose={() => {
                        setSelectedUser(null);
                    }}
                    BackdropProps={{
                        timeout: 200,
                        sx: {
                            backgroundColor: "#00000020",
                            zIndex: 1200, // Keep backdrop below Drawer
                        },
                    }}
                    sx={{
                        zIndex: 1300, // Keep Modal below the Drawer
                    }}

                >
                    <Box
                        className="w-11/12 p-8 rounded-[15px]"
                        sx={{
                            ...styles.modalsStyle,
                            backgroundColor: "white",
                            position: "relative",
                            zIndex: 1301, // Keep modal content above its backdrop
                        }}

                    >
                        <SelectedUserDetails
                            from="subaccount"
                            selectedUser={selectedUser}
                            handleDel={() => {
                                // setUsers((prev) => prev.filter((u) =>
                                //     u.id != selectedUser.id
                                // ))
                                // setSelectedUser(null)
                            }}

                        />
                    </Box>
                </Modal>

            </div>

        </div>
    )
}

export default AgencySubacount


const styles = {
    text: {
        fontSize: 15,
        color: "#00000090",
        fontWeight: "600",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: "500",
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    modalsStyle: {
        height: "auto",
        bgcolor: "transparent",
        p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-50%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
}