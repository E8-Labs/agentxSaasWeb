import Apis from '@/components/apis/Apis';
import { Box, CircularProgress, Modal } from '@mui/material';
import { DotsThree } from '@phosphor-icons/react'
import axios from 'axios';
import { first } from 'draft-js/lib/DefaultDraftBlockRenderMap';
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import AssignLead from './AssignLead';

const Userleads = ({ handleShowAddLeadModal, handleShowUserLeads }) => {

    const [initialLoader, setInitialLoader] = useState(false);
    const [SheetsList, setSheetsList] = useState([]);
    const [LeadsLoader, setSheetsLoader] = useState(false);
    const [LeadsList, setLeadsList] = useState([]);
    const [SelectedSheetId, setSelectedSheetId] = useState("");
    const [toggleClick, setToggleClick] = useState([]);
    const [AssignLeadModal, setAssignLeadModal] = useState(false);

    useEffect(() => {
        // getLeads();
        getSheets();
    }, []);

    const getLeads = async (item) => {
        try {
            setSheetsLoader(true);
            setSelectedSheetId(item.id)
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Auth token is :--", AuthToken);

            console.log("Sheet selected is :", item);
            const id = item.id
            const ApiPath = `${Apis.getLeads}?sheetId=${id}`;
            console.log("Api path is :", ApiPath);

            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    // "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get leads api is :", response.data);
                setLeadsList(response.data.data);
            }

        } catch (error) {
            console.error("Error occured in api is :", error);
        } finally {
            setSheetsLoader(false);
            console.log("ApiCall completed")
        }
    }

    const getSheets = async () => {
        try {
            setInitialLoader(true);
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Auth token is :--", AuthToken);

            const ApiPath = Apis.getSheets;
            console.log("Api path is :", ApiPath);

            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get sheets api is :", response.data);
                if (response.data.data.length === 0) {
                    handleShowUserLeads(null);
                } else {
                    handleShowUserLeads("leads exist");
                    setSheetsList(response.data.data);
                    getLeads(response.data.data[0]);
                }
            }

        } catch (error) {
            console.error("Error occured in api is :", error);
        } finally {
            setInitialLoader(false);
            console.log("ApiCall completed")
        }
    }

    //code for toggle click
    const handleToggleClick = (id) => {
        setToggleClick((prevSelectedItems) => {
            if (prevSelectedItems.includes(id)) {
                // Remove the ID if it's already selected
                return prevSelectedItems.filter((itemId) => itemId !== id);
            } else {
                // Add the ID to the selected items
                return [...prevSelectedItems, id];
            }
        });
    }

    //close assign lead modal
    const handleCloseAssignLeadModal = (status) => {
        setAssignLeadModal(status)
    }

    const styles = {
        heading: {
            fontWeight: "700",
            fontSize: 17
        },
        paragraph: {
            fontWeight: "500",
            fontSize: 15
        },
        modalsStyle: {
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
    }

    return (
        <div className='w-full flex flex-col items-center'>
            <div className='flex flex-row items-center justify-end w-full pe-12 mt-4 pb-4' style={{ borderBottom: "1px solid #15151510" }}>
                <div className='flex fex-row items-center gap-6'>
                    <butotn>
                        <Image src={"/assets/notification.png"} height={24} width={24} alt='*' />
                    </butotn>

                </div>
            </div>
            <div className='w-[95%] pe-12 mt-6'>
                {
                    initialLoader ?
                        <div className='w-full h-screen flex flex-row justify-center'>
                            <CircularProgress size={35} />
                        </div> :
                        <div>

                            <div className='flex flex-row items-center justify-between'>
                                <div style={{ fontWeight: "700", fontSize: 25 }}>
                                    Leads
                                </div>
                                <div className='flex flex-row items-center gap-6'>
                                    <div className='flex flex-row items-center gap-2'>
                                        <Image src={"/assets/buyLeadIcon.png"} height={24} width={24} alt='*' />
                                        <span className='text-purple' style={styles.paragraph}>
                                            Buy Lead
                                        </span>
                                    </div>
                                    <button className='flex flex-row items-center gap-4 h-[50px] rounded-lg bg-[#33333315] w-[189px] justify-center' onClick={() => { setAssignLeadModal(true) }}>
                                        <Image src={"/assets/callOut.png"} height={17} width={17} alt='*' />
                                        <span className='text-[#00000060]' style={styles.heading}>
                                            Start Calling
                                        </span>
                                    </button>
                                    <Modal
                                        open={AssignLeadModal}
                                        onClose={() => setAssignLeadModal(false)}
                                        closeAfterTransition
                                        BackdropProps={{
                                            timeout: 1000,
                                            sx: {
                                                backgroundColor: "#00000020",
                                                backdropFilter: "blur(5px)",
                                            },
                                        }}
                                    >
                                        <Box className="lg:w-6/12 sm:w-9/12 w-10/12" sx={styles.modalsStyle}>
                                            <div className="flex flex-row justify-center w-full">
                                                <div
                                                    className="w-full"
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        padding: 20,
                                                        borderRadius: "13px",
                                                    }}
                                                >
                                                    <div className='flex flex-row justify-end'>
                                                        <button onClick={() => { setAssignLeadModal(false) }}>
                                                            <Image src={"/assets/cross.png"} height={14} width={14} alt='*' />
                                                        </button>
                                                    </div>
                                                    <div>
                                                        <AssignLead selectedLead={toggleClick} handleCloseAssignLeadModal={handleCloseAssignLeadModal} />
                                                    </div>

                                                    {/* Can be use full to add shadow */}
                                                    {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                                                </div>
                                            </div>
                                        </Box>
                                    </Modal>
                                </div>
                            </div>
                            <div className='flex flex-row items-center justify-between w-full mt-10'>
                                <div className='flex flex-row items-center gap-4'>
                                    <div className='flex flex-row items-center gap-1 w-[19vw] border rounded p-2'>
                                        <input
                                            style={styles.paragraph}
                                            className='outline-none border-none w-full bg-transparent'
                                            placeholder='Search by name, email or phone'
                                        />
                                        <button className='outline-none border-none'>
                                            <Image src={"/assets/searchIcon.png"} height={24} width={24} alt='*' />
                                        </button>
                                    </div>
                                    <Image src={"/assets/filterIcon.png"} height={16} width={16} alt='*' />
                                    <div style={styles.paragraph}>
                                        Date
                                    </div>
                                </div>

                                <button className='flex flex-row items-center justify-center gap-2 bg-none outline-none border h-[43px] w-[101px] rounded' onClick={() => { handleShowAddLeadModal(true) }}>
                                    <span>
                                        Import
                                    </span>
                                    <Image src={"/assets/downloadIcon.png"} height={15} width={15} alt='*' />
                                </button>
                            </div>

                            <div className='flex flex-row items-center mt-8' style={styles.paragraph}>
                                <div className='flex flex-row items-center gap-2'>
                                    {
                                        SheetsList.map((item, index) => {
                                            return (
                                                <button
                                                    key={index}
                                                    className='flex flex-row items-center gap-1 px-3'
                                                    onClick={() => { getLeads(item) }}
                                                    style={{ borderBottom: SelectedSheetId === item.id ? "2px solid #402FFF" : "", color: SelectedSheetId === item.id ? "#402FFF" : "" }}
                                                >
                                                    <span style={styles.paragraph}>{item.sheetName}</span>
                                                    <DotsThree weight='bold' size={25} color='black' />
                                                </button>
                                            )
                                        })
                                    }
                                </div>
                            </div>

                            <div className='w-full flex flex-row items-center mt-4' style={{ ...styles.paragraph, color: "#00000060" }}>
                                <div className='w-2/12'>Name</div>
                                <div className='w-2/12'>Email</div>
                                <div className='w-2/12'>Phone Number</div>
                                <div className='w-2/12'>Address</div>
                                <div className='w-2/12'>Tag</div>
                                <div className='w-2/12 flex flex-row items-center'>
                                    <div className='w-5/12'>Stage</div>
                                    <div className='w-5/12'>Date</div>
                                    <div className='w-2/12'>More</div>
                                </div>
                            </div>

                            {
                                LeadsLoader ?
                                    <div className="w-full flex flex-row justify-center mt-12">
                                        <CircularProgress size={30} />
                                    </div> :
                                    <div>
                                        {
                                            LeadsList.length > 0 ?
                                                <div className='h-[60vh] overflow-auto'>
                                                    {
                                                        LeadsList.map((item, index) => (
                                                            <div className='w-full flex flex-row items-center mt-4' style={styles.paragraph} key={index}>
                                                                <div className='w-2/12 flex flex-row items-center gap-2 truncate'>
                                                                    {toggleClick.includes(item.id) ? (
                                                                        <button
                                                                            className="h-[16px] w-[16px] border rounded bg-purple"
                                                                            onClick={() => handleToggleClick(item.id)}
                                                                        >
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="h-[16px] w-[16px] border rounded"
                                                                            onClick={() => handleToggleClick(item.id)}
                                                                        >
                                                                        </button>
                                                                    )}
                                                                    <div className='h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white'>
                                                                        {item.firstName.slice(0, 1)}
                                                                    </div>
                                                                    <div className='truncate'>
                                                                        {item.firstName}
                                                                    </div>
                                                                </div>
                                                                <div className='w-2/12 text-[#00000070] truncate'>
                                                                    {item.email}
                                                                </div>
                                                                <div className='w-2/12 truncate'>
                                                                    {item.phone}
                                                                </div>
                                                                <div className='w-2/12 truncate'>
                                                                    {item.address}
                                                                </div>
                                                                <div className='w-2/12 flex flex-row items-center gap-2'>
                                                                    <div className='text-[#1C55FF] bg-[#1C55FF10] h-[33px] w-[47px] flex flex-row items-center justify-center rounded'>
                                                                        Tag
                                                                    </div>
                                                                    <div className='text-[#1C55FF] bg-[#1C55FF10] h-[33px] w-[47px] flex flex-row items-center justify-center rounded'>
                                                                        Tag
                                                                    </div>
                                                                    <div className='text-[#1C55FF] bg-[#1C55FF10] h-[33px] w-[39px] flex flex-row items-center justify-center rounded'>
                                                                        +2
                                                                    </div>
                                                                </div>
                                                                <div className='w-2/12 flex flex-row items-center'>
                                                                    <div className='w-5/12'>
                                                                        <li style={{
                                                                            fontWeight: "500",
                                                                            fontSize: 12
                                                                        }}>
                                                                            {item.stage.stageTitle}
                                                                        </li>
                                                                    </div>
                                                                    <div className='w-5/12 truncate'>
                                                                        {moment(item.createdAt).format('MM/DD/YYYY')}
                                                                    </div>
                                                                    <div className='w-2/12 underline text-purple'>
                                                                        Details
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div> :
                                                <div>
                                                    No data
                                                </div>
                                        }
                                    </div>
                            }

                        </div>
                }
            </div>
        </div>
    )
}

export default Userleads