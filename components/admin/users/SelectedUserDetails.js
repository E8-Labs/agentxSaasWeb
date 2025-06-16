import AdminLeads from '@/components/admin/users/AdminLeads'
import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import AdminLeads1 from './AdminLeads1'
import AdminPipeline1 from './pipline/AdminPipeline1'
import AdminAgentX from './AdminAgentX'
import AdminCallLogs from './AdminCallLogs'
import AdminAffiliates from '../affiliates/AdminAffiliates'
import AdminDashboard from './AdminDashboard'
import AdminIntegration from './AdminIntegration'
import AdminTeam from './AdminTeams'
import AdminProfileData from './AdminProfileData'
import { Cross } from '@phosphor-icons/react'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import DelAdminUser from '@/components/onboarding/extras/DelAdminUser'

function SelectedUserDetails({
    selectedUser,
    handleDel,
    from = "admin",
    handlePauseUser,
    agencyUser = false
}) {


    const manuBar = [
        {
            id: 1,
            name: 'Dashboard',
            selectedImage: '/svgIcons/selectdDashboardIcon.svg',
            unSelectedImage: '/svgIcons/unSelectedDashboardIcon.svg'
        }, {
            id: 2,
            name: 'Agents',
            selectedImage: '/svgIcons/selectedAgentXIcon.svg',
            unSelectedImage: '/svgIcons/agentXIcon.svg'
        }, {
            id: 3,
            name: 'Leads',
            selectedImage: '/svgIcons/selectedLeadsIcon.svg',
            unSelectedImage: '/svgIcons/unSelectedLeadsIcon.svg'
        }, {
            id: 4,
            name: 'Call Log',
            selectedImage: '/svgIcons/selectedCallIcon.svg',
            unSelectedImage: '/svgIcons/unSelectedCallIcon.svg'
        }, {
            id: 5,
            name: 'Pipeline',
            selectedImage: '/svgIcons/selectedPiplineIcon.svg',
            unSelectedImage: '/svgIcons/unSelectedPipelineIcon.svg'
        }, , {
            id: 6,
            name: 'Integration',
            selectedImage: '/svgIcons/selectedIntegration.svg',
            unSelectedImage: '/svgIcons/unSelectedIntegrationIcon.svg'
        }, {
            id: 7,
            name: 'Staff',
            selectedImage: '/svgIcons/selectedTeam.svg',
            unSelectedImage: '/svgIcons/unSelectedTeamIcon.svg'
        }, {
            id: 8,
            name: 'Account',
            selectedImage: '/svgIcons/selectedProfileCircle.svg',
            unSelectedImage: '/svgIcons/unSelectedProfileIcon.svg'
        }
    ]

    console.log("Status of agency user", agencyUser);

    const [selectedManu, setSelectedManu] = useState(manuBar[0])
    const [showAddMinutesModal, setShowAddMinutesModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [error, setError] = useState("")
    const [minutes, setMinutes] = useState("")
    const [showSnackMessage, setShowSnackMessage] = useState(null)
    const [loading, setloading] = useState(false)
    const [delLoader, setDelLoader] = useState(false);
    //del user
    const [showDelConfirmationPopup, setShowDelConfirmationPopup] = useState(false);
    const [pauseLoader, setpauseLoader] = useState(false);
    //pause confirmations
    const [showPauseConfirmationPopup, setShowPauseConfirmationPopup] = useState(false);

    //pauseToggleBtn
    const [pauseToggleBtn, setPauseToggleBtn] = useState(false);

    useEffect(() => {
        console.log("selected user", selectedUser);
        if (selectedUser?.profile_status === "paused") {
            setPauseToggleBtn(true);
        } else if (selectedUser?.profile_status === "active") {
            setPauseToggleBtn(false);
        }
    }, [selectedUser]);


    const handleManuClick = (item) => {
        setSelectedManu(item)
    }

    const handleAddMinutes = async () => {
        setloading(true)
        try {
            const data = localStorage.getItem("User")

            if (data) {
                let u = JSON.parse(data)

                let path = Apis.addMinutes

                let apidata = {
                    userId: selectedUser.id,
                    minutes: minutes
                }

                const response = await axios.post(path, apidata, {
                    headers: {
                        "Authorization": 'Bearer ' + u.token
                    }
                })

                if (response.data) {
                    if (response.data.status === true) {
                        //console.log
                        setShowSnackMessage(response.data.messag)
                        setShowAddMinutesModal(false)
                    } else {
                        //console.log
                        setShowSnackMessage(response.data.message)

                    }
                }
            }
        } catch (e) {
            //console.log
        }
        finally {
            setloading(false)
        }
    }

    const handleDeleteUser = async () => {
        setDelLoader(true)
        try {
            const data = localStorage.getItem("User")

            if (data) {
                let u = JSON.parse(data)

                let path = Apis.deleteProfile

                let apidata = {
                    userId: selectedUser.id,

                }
                //console.log

                const response = await axios.post(path, apidata, {
                    headers: {
                        "Authorization": 'Bearer ' + u.token
                    }
                })

                if (response.data) {
                    if (response.data.status === true) {
                        //console.log
                        setShowSnackMessage(response.data.messag)
                        setShowDeleteModal(false)
                        handleDel();
                    } else {
                        //console.log
                        setShowSnackMessage(response.data.message)

                    }
                }
            }
        } catch (e) {
            //console.log
        }
        finally {
            setDelLoader(false)
        }
    }

    const handlePause = async () => {
        //profile_status
        setpauseLoader(true)
        try {
            const data = localStorage.getItem("User")
            if (data) {
                let u = JSON.parse(data)
                let apidata = {
                    userId: selectedUser.id
                }

                const response = await axios.post(Apis.pauseProfile, apidata, {
                    headers: {
                        "Authorization": 'Bearer ' + u.token,
                        "Content-Type": 'application/json'
                    }
                })
                if (response) {
                    console.log("Respose of pause unpause apis is", response);
                    if (response.data.status === true) {
                        setShowSnackMessage(response.data.message);
                        handlePauseUser();
                        setpauseLoader(false);
                        setShowPauseConfirmationPopup(false);
                    }
                    console.log('response.data.data', response.data)
                }
            }
        } catch (e) {
            setpauseLoader(false);
            console.error("Error occured in pause unpause api is", e);
        }

    }

    return (
        <div className='w-full flex flex-col items-center justify-center bg-red'>
            <AgentSelectSnackMessage isVisible={showSnackMessage != null ? true : false} hide={() => { setShowSnackMessage(null) }}
                type={SnackbarTypes.Success} message={showSnackMessage}
            />

            <div className='flex flex-col items-center justify-center w-full'>
                <div style={{ alignSelf: 'center' }} className={`w-full ${agencyUser ? "h-[100svh] overflow-hidden":"h-[80vh]"} bg-white items-center justify-center`}>
                    <div className='flex flex-row items-center justify-between w-full px-4 pt-2'>
                        <div className='flex flex-row gap-2 items-center justify-start'>
                            <div className='flex h-[30px] w-[30px] rounded-full items-center justify-center bg-black text-white'>
                                {selectedUser.name[0]}
                            </div>
                            <h4>
                                {selectedUser.name}
                            </h4>

                            {
                                agencyUser ? (
                                    ""
                                ) : (
                                    <button
                                        onClick={() => {
                                            console.log('selectedUser.id', selectedUser.id)
                                            if (selectedUser?.id) {
                                                // Open a new tab with user ID as query param
                                                let url = ""
                                                if (from === "admin") {
                                                    url = `/admin/users?userId=${selectedUser.id}&agencyUser=true`
                                                } else if (from === "subaccount") {
                                                    // url = `/agency/users?userId=${selectedUser.id}`
                                                    url = `/agency/users?userId=${selectedUser.id}&agencyUser=true`;
                                                }
                                                // url = `admin/users?userId=${selectedUser.id}`
                                                //console.log
                                                window.open(url, "_blank");
                                            }
                                        }}
                                    >
                                        <Image src={"/svgIcons/arrowboxIcon.svg"} height={20} width={20} alt="*" />
                                    </button>
                                )
                            }

                        </div>

                        <div className='flex flex-row items-center gap-4'>
                            {
                                pauseLoader ? (
                                    <CircularProgress size={25} />
                                ) : (
                                    <div>
                                        {
                                            (!agencyUser && from !== "subaccount") && (
                                                <button
                                                    className="text-white bg-purple outline-none rounded-xl px-3"
                                                    style={{ height: "50px" }}
                                                    onClick={() => {
                                                        setShowPauseConfirmationPopup(true);
                                                    }}
                                                >
                                                    {
                                                        selectedUser?.profile_status === "paused" ? "Resume" : "Pause"
                                                    }
                                                </button>
                                            )
                                        }
                                    </div>
                                )
                            }

                            {
                                showPauseConfirmationPopup && (
                                    <DelAdminUser
                                        showPauseModal={showPauseConfirmationPopup}
                                        handleClosePauseModal={() => { setShowPauseConfirmationPopup(false) }}
                                        handlePaueUser={handlePause}
                                        pauseLoader={pauseLoader}
                                        selectedUser={selectedUser}
                                    />
                                )
                            }

                            {
                                (!agencyUser && from !== "subaccount") && (
                                    <button
                                        className="text-white bg-purple outline-none rounded-xl px-3"
                                        style={{ height: "50px" }}
                                        onClick={() => {
                                            setShowAddMinutesModal(true)
                                        }}
                                    >
                                        Add Minutes
                                    </button>
                                )
                            }


                            {
                                (!agencyUser && from !== "subaccount") && (
                                    <button
                                        className="text-red outline-none rounded-xl px-3"
                                        style={{ height: "50px" }}
                                        onClick={() => {
                                            setShowDeleteModal(true)
                                        }}
                                    >
                                        Delete
                                    </button>
                                )
                            }

                            {/* <div>
                                <button>
                                    <Image
                                        src={"/assets/cross.png"}
                                        alt='*'
                                        height={20}
                                        width={20}
                                    />
                                </button>
                        </div>*/}
                        </div>


                    </div>

                    <div className='flex flex-row items-start w-full'>
                        <div className='flex flex-col items-start justify-center gap-3 w-2/12 px-6 pt-10 ${(from === "admin" || from === "subaccount") ? "":"h-full"}'>
                            {
                                manuBar.map((item) => (
                                    <button key={item.id} onClick={() => {
                                        handleManuClick(item)
                                    }}
                                        className={`flex flex-row items-center gap-3 p-2 items-center 
                                        ${selectedManu.id == item.id && "border-b-[2px] border-purple"}`
                                        }>
                                        <Image src={selectedManu.id == item.id ? item.selectedImage : item.unSelectedImage}
                                            height={24} width={24} alt='*'
                                        />

                                        <div style={{ fontSize: 16, fontWeight: 500, color: selectedManu.id == item.id ? "#7902df" : '#000' }}>
                                            {item.name}
                                        </div>

                                    </button>
                                ))
                            }

                        </div>

                        <div className={`flex flex-col items-center justify-center pt-2 px-4 ${agencyUser ? "h-[95vh]":"h-[70vh]"} overflow-auto w-10/12`}>
                            {
                                selectedManu.name == "Leads" ? (
                                    <AdminLeads1 selectedUser={selectedUser} />
                                ) : (
                                    selectedManu.name == "Pipeline" ? (
                                        <AdminPipeline1 selectedUser={selectedUser} />
                                    ) : selectedManu.name == "Agents" ? (
                                        <AdminAgentX
                                            selectedUser={selectedUser}
                                            from={from}
                                            agencyUser={agencyUser}
                                        />
                                    ) : selectedManu.name == "Call Log" ? (
                                        <AdminCallLogs selectedUser={selectedUser} />
                                    ) : (
                                        selectedManu.name == "Dashboard" ? (
                                            <AdminDashboard selectedUser={selectedUser} />
                                        ) : (
                                            selectedManu.name == "Integration" ? (
                                                <AdminIntegration selectedUser={selectedUser} />
                                            ) : (
                                                selectedManu.name == "Staff" ? (
                                                    <AdminTeam selectedUser={selectedUser} />
                                                ) : (
                                                    selectedManu.name == "Account" ? (
                                                        <AdminProfileData selectedUser={selectedUser} from={from} />
                                                    ) : "Comming soon..."
                                                )
                                            )
                                        )
                                        //""
                                    )
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>


            {/* Code to del user */}
            <Modal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                }}
                BackdropProps={{
                    timeout: 200,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
                    sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
                >
                    <div style={{ width: "100%" }}>
                        <div
                            className="max-h-[60vh] overflow-auto"
                            style={{ scrollbarWidth: "none" }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    direction: "row",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                {/* <div style={{ width: "20%" }} /> */}
                                <div style={{ fontWeight: "500", fontSize: 17 }}>
                                    Delete User
                                </div>
                                <div
                                    style={{
                                        direction: "row",
                                        display: "flex",
                                        justifyContent: "end",
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                        }}
                                        className="outline-none"
                                    >
                                        <Image
                                            src={"/svgIcons/crossIcon.svg"}
                                            height={40}
                                            width={40}
                                            alt="*"
                                        />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6" style={{ fontWeight: "700", fontSize: 22 }}>
                                Are you sure you want to delete user?
                            </div>
                        </div>

                        <div className="flex flex-row items-center gap-4 mt-6">
                            <button onClick={() => setShowDeleteModal(false)} className="w-1/2">
                                Cancel
                            </button>
                            <div className="w-1/2">
                                {delLoader ? (
                                    <div className="flex flex-row iems-center justify-center w-full mt-4">
                                        <CircularProgress size={25} />
                                    </div>
                                ) : (
                                    <button
                                        className="mt-4 outline-none bg-red"
                                        style={{
                                            color: "white",
                                            height: "50px",
                                            borderRadius: "10px",
                                            width: "100%",
                                            fontWeight: 600,
                                            fontSize: "20",
                                        }}
                                        onClick={handleDeleteUser}
                                    >
                                        Yes! Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>


            {/* Add minutes modal  */}
            <Modal
                open={showAddMinutesModal}
                onClose={() => {
                    setShowAddMinutesModal(false);
                }}
                BackdropProps={{
                    timeout: 100,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box
                    className="w-10/12 sm:w-7/12 md:w-5/12 lg:w-3/12 p-8 rounded-[15px]"
                    sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
                >
                    <div className='w-full flex flex-row items-center justify-between'>
                        <div style={{ fontSize: 16, fontWeight: '500' }}>
                            Add Minutes
                        </div>


                        <button onClick={() => {
                            setShowAddMinutesModal(false)
                        }}>
                            <Image src={"/svgIcons/cross.svg"}
                                height={24}
                                width={24} alt='*'
                            />
                        </button>

                    </div>

                    <div className='w-full flex flex-col items-start gap-3'>
                        <div style={{ fontSize: 16, fontWeight: '500', marginTop: 30 }}>
                            Minutes
                        </div>

                        <input
                            className={`w-full border-gray-300 rounded p-2 outline-none focus:outline-none focus:ring-0`}
                            value={minutes}
                            placeholder='Enter minutes'
                            onChange={(event) => {
                                setMinutes(event.target.value)
                            }}
                            type='number'
                        />

                        {
                            loading ? (
                                <CircularProgress size={15} />
                            ) : (
                                <button className='w-full outline-none bg-purple h-[52px] text-white rounded-lg'
                                    onClick={handleAddMinutes}
                                >
                                    Add
                                </button>
                            )
                        }

                    </div>
                </Box>
            </Modal>

        </div>
    )
}

export default SelectedUserDetails


const styles = {
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
