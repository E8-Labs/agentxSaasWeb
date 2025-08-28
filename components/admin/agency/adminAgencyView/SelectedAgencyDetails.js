import AdminLeads from '@/components/admin/users/AdminLeads'
import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import AdminLeads1 from '../../users/AdminLeads1'
import AdminPipeline1 from '../../users/pipline/AdminPipeline1'
import AdminAgentX from '../../users/AdminAgentX'
import AdminCallLogs from '../../users/AdminCallLogs'
import AdminAffiliates from '../../affiliates/AdminAffiliates'
import AdminDashboard from '../../users/AdminDashboard'
import AdminIntegration from '../../users/AdminIntegration'
import AdminTeam from '../../users/AdminTeams'
import AdminProfileData from '../../users/AdminProfileData'
import { Cross } from '@phosphor-icons/react'
import axios from 'axios'
import Apis from '@/components/apis/Apis'
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage'
import DelAdminUser from '@/components/onboarding/extras/DelAdminUser'
import AdminGetProfileDetails from '../../AdminGetProfileDetails'
// import ResetTrial from './ResetTrial'
import ResetTrial from '../../users/ResetTrial'
import CloseBtn from '@/components/globalExtras/CloseBtn'
import AgencyDashboard from '@/components/agency/dashboard/AgencyDashboard'
import DashboardPlans from '@/components/agency/plan/DashboardPlans'
import AgencySubacount from '@/components/agency/subaccount/AgencySubacount'
import AgencyIntegrations from '@/components/agency/dashboard/AgencyIntegrations'
import Teams from '@/components/dashboard/teams/Teams'
import AdminDashboardCallLogs from '../../CallLogs/AdminDashboardCallLogs'

function SelectedAgencyDetails({
    selectedUser,
    handleDel,
    from = "admin",
    handlePauseUser,
    agencyUser = false,
    handleClose
}) {

    console.log("Selected user passed is", selectedUser)

    const manuBar = [
        {
            id: 1,
            name: 'Dashboard',
            selectedImage: '/svgIcons/selectdDashboardIcon.svg',
            unSelectedImage: '/svgIcons/unSelectedDashboardIcon.svg',
        }, {
            id: 2,
            name: 'Integrations',
            selectedImage: "/agencyIcons/integrationFocus.jpg",
            unSelectedImage: "/agencyIcons/integrationsUnFocus.jpg",
        }, {
            id: 3,
            name: 'Plans',
            selectedImage: "/svgIcons/selectedPlansIcon.svg",
            unSelectedImage: "/svgIcons/unSelectedPlansIcon.svg",
        }, {
            id: 4,
            name: 'Sub Account',
            selectedImage: "/svgIcons/selectedSubAccountIcon.svg",
            unSelectedImage: "/svgIcons/unSelectedSubAccountIcon.svg",
        }, {
            id: 5,
            name: 'Call Logs',
            selectedImage: "/agencyIcons/callLogSel.jpg",
            unSelectedImage: "/agencyIcons/callLogUnSel.jpg",
        }, {
            id: 6,
            name: 'Teams',
            selectedImage: "/svgIcons/selectedTeam.svg",
            unSelectedImage: "/svgIcons/unSelectedTeamIcon.svg",
        }, {
            id: 7,
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
    const [resetTrailLoader, setResetTrailLoader] = useState(false);
    //pause confirmations
    const [showPauseConfirmationPopup, setShowPauseConfirmationPopup] = useState(false);
    const [user, setUser] = useState(null)
    //reset trial
    const [showResetTrialPopup, setShowResetTrialPopup] = useState(false);

    //pauseToggleBtn
    const [pauseToggleBtn, setPauseToggleBtn] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null)

    useEffect(() => {
        console.log("selected user", selectedUser);
        if (selectedUser?.profile_status === "paused") {
            setPauseToggleBtn(true);
        } else if (selectedUser?.profile_status === "active") {
            setPauseToggleBtn(false);
        }
    }, [selectedUser]);

    useEffect(() => {
        const getData = async () => {
            console.log("Trying to get agency profile data");
            let d = await AdminGetProfileDetails(selectedUser.id)

            if (d) {
                setUser(d)
                console.log('selected user details from api', d.profile_status)

            }

            // console.log('selectedUser after api', selectedUser)
        }

        getData()
    }, [selectedUser])


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
                        selectedUser.profile_status = "paused"
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


    const handleResetTrail = async () => {

        if (!selectedDate) {
            return
        }
        //profile_status
        setResetTrailLoader(true)
        try {
            const data = localStorage.getItem("User")
            if (data) {
                let u = JSON.parse(data)
                let apidata = {
                    userId: selectedUser.id,
                    trialEndDate: selectedDate
                }

                console.log('apidata of reset trail', apidata)

                const response = await axios.post(Apis.resetTrail, apidata, {
                    headers: {
                        "Authorization": 'Bearer ' + u.token,
                        "Content-Type": 'application/json'
                    }
                })
                if (response) {
                    console.log("Respose of reset trail api is", response);
                    if (response.data.status === true) {
                        setShowSnackMessage(response.data.message);
                        setResetTrailLoader(false);
                        setShowResetTrialPopup(false);
                    }
                    console.log('response.data.data', response.data)
                }
            }
        } catch (e) {
            setResetTrailLoader(false);
            console.error("Error occured in reset trail api is", e);
        }
    }

    return (
        <div className='w-full flex flex-col items-center justify-center bg-white'>
            <AgentSelectSnackMessage isVisible={showSnackMessage != null ? true : false} hide={() => { setShowSnackMessage(null) }}
                type={SnackbarTypes.Success} message={showSnackMessage}
            />

            <div className='flex flex-col items-center justify-center w-full'>
                <div className={`w-full ${agencyUser ? "h-[100svh] overflow-hidden" : "h-[80vh]"} bg-white`}>
                    <div className='flex flex-row items-center justify-between w-full px-4 pt-2'>
                        <div className='flex flex-row gap-2 items-center justify-start'>
                            <div className='flex h-[30px] w-[30px] rounded-full items-center justify-center bg-black text-white'>
                                {selectedUser?.agencyName?.[0] || "-"}
                            </div>
                            <h4>
                                {selectedUser.agencyName}
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
                                                        user?.profile_status === "paused" ? "Reinstate" : "Pause"
                                                    }
                                                </button>
                                            )
                                        }
                                    </div>
                                )
                            }

                            <div>
                                {
                                    selectedUser.isTrial &&
                                    <button
                                        className='text-white bg-purple outline-none rounded-xl px-3'
                                        style={{ height: "50px" }}
                                        onClick={() => {
                                            setShowResetTrialPopup(true);
                                            console.log('clicked')
                                        }}
                                    >
                                        Reset Trial
                                    </button>
                                }
                            </div>
                            {
                                showResetTrialPopup && (
                                    <ResetTrial
                                        showConfirmationPopup={showResetTrialPopup}
                                        handleClose={() => setShowResetTrialPopup(false)}
                                        onContinue={handleResetTrail}
                                        loader={resetTrailLoader}
                                        selectedDate={selectedDate}
                                        setSelectedData={setSelectedDate}
                                    />

                                )}


                            {
                                showPauseConfirmationPopup && (
                                    <DelAdminUser
                                        showPauseModal={showPauseConfirmationPopup}
                                        handleClosePauseModal={() => { setShowPauseConfirmationPopup(false) }}
                                        handlePaueUser={handlePause}
                                        pauseLoader={pauseLoader}
                                        selectedUser={user}
                                    />
                                )
                            }

                            {/*
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
                            */}


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

                            <CloseBtn onClick={handleClose} />

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

                        <div className={`flex flex-col items-start justify-start px-4 pt-12 ${agencyUser ? "h-[95vh]" : "h-[70vh]"} overflow-auto w-10/12`}>
                            {
                                selectedManu.name == "Dashboard" ? (
                                    <div className="w-full flex flex-col items-center h-[99%] overflow-hidden " >
                                        <AgencyDashboard selectedAgency={selectedUser} />
                                    </div>
                                ) : selectedManu.name == "Integrations" ? (
                                    <AgencyIntegrations selectedAgency={selectedUser} />
                                ) : selectedManu.name == "Plans" ? (
                                    <div className='flex flex-col items-center w-full'>
                                        <DashboardPlans selectedAgency={selectedUser} />
                                    </div>
                                ) : selectedManu.name == "Sub Account" ? (
                                    <AgencySubacount selectedAgency={selectedUser} />
                                ) : selectedManu.name == "Call Logs" ? (
                                    <AdminDashboardCallLogs selectedAgency={selectedUser} />
                                ) : selectedManu.name == "Teams" ? (
                                    <Teams agencyData={selectedUser} selectedAgency={selectedUser} />
                                ) : selectedManu.name == "Account" ? (
                                    "Account"
                                ) : (
                                    "Comming soon..."
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

export default SelectedAgencyDetails


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
