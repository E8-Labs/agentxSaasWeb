import AdminLeads from '@/components/admin/users/AdminLeads'
import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useState } from 'react'
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

function SelectedUserDetails({ open, close, selectedUser, handleNext, handleBack }) {

    console.log('selectedUser on user details modal is', selectedUser)

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
            name: 'Personal Data',
            selectedImage: '/svgIcons/selectdDashboardIcon.svg',
            unSelectedImage: '/svgIcons/unSelectedProfileIcon.svg'
        }
    ]

    const [selectedManu, setSelectedManu] = useState(manuBar[0])
    const [showAddMinutesModal, setShowAddMinutesModal] = useState(false)
    const [error, setError] = useState("")
    const [minutes, setMinutes] = useState("")
    const [showSnackMessage, setShowSnackMessage] = useState(null)
    const [loading, setloading] = useState(false)


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
                        console.log('add minutes api response is', response.data.data)
                        setShowSnackMessage(response.data.messag)
                        setShowAddMinutesModal(false)
                    } else {
                        console.log('add minutes api message is', response.data.message)
                        setShowSnackMessage(response.data.message)

                    }
                }
            }
        } catch (e) {
            console.log('error in add minutes api is', e)
        }
        finally {
            setloading(false)
        }
    }

    return (
        <div className='w-full flex flex-col items-center justify-center'>
            <AgentSelectSnackMessage isVisible={showSnackMessage} hide={() => { setShowSnackMessage(null) }}
                type={SnackbarTypes.Success} message={showSnackMessage}
            />
            <Modal
                open={open}
                onClose={close}
                BackdropProps={{
                    timeout: 200,
                    sx: {
                        backgroundColor: "#00000020",
                        // //backdropFilter: "blur(20px)",
                    },
                }}

            >
                <Box
                    className="w-11/12  p-8 rounded-[15px]"
                    sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
                >
                    <div className='flex flex-col items-center justify-center'>
                        <div style={{ alignSelf: 'center' }} className='w-[90vw] h-[90vh] bg-white items-center justify-center '>
                            <div className='flex flex-row items-center justify-between w-full px-10 pt-8'>
                                <div className='flex flex-row gap-2 items-center justify-start'>
                                    <div className='flex h-[30px] w-[30px] rounded-full items-center justify-center bg-black text-white'>
                                        {selectedUser.name[0]}
                                    </div>
                                    <h4>
                                        {selectedUser.name}
                                    </h4>

                                    <Image src={'/svgIcons/arrowboxIcon.svg'}
                                        height={20} width={20} alt='*'
                                    />
                                </div>

                                <button
                                    className="text-white bg-purple outline-none rounded-xl px-3"
                                    style={{ height: "50px" }}
                                    onClick={() => {
                                        setShowAddMinutesModal(true)
                                    }}
                                >
                                    Add Minutes
                                </button>
                            </div>


                            <div className='flex flex-row items-center justify-start gap-3 border-b w-[90vw] px-10 pt-10'>
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

                            <div className='flex flex-col items-center justify-center bg-[#FBFCFF] pt-2 px-10 h-[70vh] overflow-hidden bg-white'>
                                {
                                    selectedManu.name == "Leads" ? (
                                        <AdminLeads1 selectedUser={selectedUser} />
                                    ) : (
                                        selectedManu.name == "Pipeline" ? (
                                            <AdminPipeline1 selectedUser={selectedUser} />
                                        ) : selectedManu.name == "Agents" ? (
                                            <AdminAgentX selectedUser={selectedUser} />
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
                                                        selectedManu.name == "Personal Data" ? (
                                                            <AdminProfileData selectedUser={selectedUser} />
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