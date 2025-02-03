import AdminLeads from '@/components/admin/users/AdminLeads'
import { Box, Modal } from '@mui/material'
import Image from 'next/image'
import React, { useState } from 'react'
import AdminLeads1 from './AdminLeads1'

function SelectedUserDetails({ open, close, selectedUser }) {

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


    const handleManuClick = (item) => {
        setSelectedManu(item)
    }




    return (
        <div className='w-full flex flex-col items-center justify-center'>
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
                                        A
                                    </div>
                                    <h4>
                                        Ali
                                    </h4>

                                    <Image src={'/svgIcons/arrowboxIcon.svg'}
                                        height={20} width={20} alt='*'
                                    />
                                </div>

                                <div className='flex flex-row gap-5 items-center'>
                                    <button className='flex p-3 rounded-full border'
                                        onClick={close}
                                    >
                                        <Image src={"/svgIcons/reverseArrow.svg"}
                                            height={24} width={24} alt='*'
                                        />
                                    </button>

                                    <button className='flex p-3 rounded-full border'>
                                        <Image src={"/svgIcons/farwordArrow.svg"}
                                            height={24} width={24} alt='*'
                                        />
                                    </button>
                                </div>
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

                            <div className='flex flex-col items-center justify-center bg-[#FBFCFF] pt-2 px-10 h-[70vh] overflow-hidden'>
                                {
                                    selectedManu.name == "Leads" ? (
                                        <AdminLeads1 selectedUser={selectedUser} />
                                    ) : ""
                                }
                            </div>
                        </div>
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