import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Apis from '../apis/Apis';
import axios from 'axios';
import { Box, CircularProgress, Modal, Popover } from '@mui/material';
import moment from 'moment';

function SheduledCalls() {


    const [searchValue, setSearchValue] = useState("");
    //code for agent details
    const [callDetails, setCallDetails] = useState([]);
    const [initialLoader, setInitialLoader] = useState(false);
    const [agentsList, setAgentsList] = useState([]);
    const [filteredAgentsList, setFilteredAgentsList] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);
    //code for call log details
    const [SelectedAgent, setSelectedAgent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [AgentCallLogLoader, setAgentCallLogLoader] = useState(false);
    const [sheduledCalllogs, setSheduledCalllogs] = useState([]);

    useEffect(() => {
        getAgents();
        // getSheduledCallLogs();
    }, []);

    //code to show popover
    const handleShowPopup = (event, item) => {
        setAnchorEl(event.currentTarget);
        console.log("Selected agent is ", item);
        setSelectedAgent(item);
    };

    const handleClosePopup = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    //code to get agents
    const getAgents = async () => {
        try {
            setInitialLoader(true);


            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            console.log("Auth token is:", AuthToken);

            let mainAgent = null;
            const localAgent = localStorage.getItem("agentDetails");
            if (localAgent) {
                const agentDetails = JSON.parse(localAgent);
                console.log("Check 1 cleear")
                console.log("Agent details are:", agentDetails);
                mainAgent = agentDetails
            }
            // const ApiPath = `${Apis.getSheduledCallLogs}?mainAgentId=${mainAgent.id}`;
            const ApiPath = Apis.getSheduledCallLogs;
            console.log("Api path is: ", ApiPath);
            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get sheduled api is:", response.data);

                setFilteredAgentsList(response.data.agents);
                setCallDetails(response.data.data);
                setAgentsList(response.data.agents);

            }



        } catch (error) {
            console.error("Error occured in get Agents api is :", error);
        } finally {
            setInitialLoader(false)
        }
    }

    //code to show call log details popup

    const handleShowDetails = () => {
        const AgentId = filteredAgentsList.map((item) => item.id);
        console.log("Agent id is:", AgentId);
        console.log("selected agent is:", SelectedAgent);
        console.log("Call log details are :", callDetails);
        let CallsArray = [];

        callDetails.forEach((item) => {
            if (item.agent.id === SelectedAgent.id) {
                CallsArray.push(item);
            }
        });


        console.log("Calls of this agent are :", CallsArray);
        setSheduledCalllogs(CallsArray);
        setShowDetailsModal(true);
    }

    const handleSearchChange = (value) => {
        if (value.trim() === "") {
            // console.log("Should reset to original");
            // Reset to original list when input is empty
            setFilteredAgentsList(agentsList);
            return;
        }

        const filtered = agentsList.filter(item => {
            const term = value.toLowerCase();
            return (
                // item.LeadModel?.firstName.toLowerCase().includes(term) ||
                // item.LeadModel?.lastName.toLowerCase().includes(term) ||
                // item.LeadModel?.address.toLowerCase().includes(term) ||
                item.name.toLowerCase().includes(term)
                // (item.LeadModel?.phone && agentsList.includes(term))
            );
        });

        setFilteredAgentsList(filtered);

    }

    return (
        <div className='w-full items-start'>

            <div className='flex w-full pl-10 flex-row items-start gap-3'>
                <div className="flex w-3/12 items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone"
                        className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                        value={searchValue}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleSearchChange(value);
                            setSearchValue(e.target.value);
                        }}
                    />
                    <img
                        src={'/otherAssets/searchIcon.png'}
                        alt="Search"
                        width={20}
                        height={20}
                    />
                </div>

                <button>
                    <Image src={'/otherAssets/filterBtn.png'}
                        height={36}
                        width={36}
                        alt='Search'
                    />
                </button>
            </div>

            <div className='w-full flex flex-row justify-between mt-10 px-10'>
                <div className='w-3/12'>
                    <div style={styles.text}>Agent</div>
                </div>
                <div className='w-2/12 '>
                    <div style={styles.text}>Objective</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Leads</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Date created</div>
                </div>
                <div className='w-2/12'>
                    <div style={styles.text}>Sheduled on</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text} onClick={handleShowDetails}>Action</div>
                </div>
            </div>

            <div>
                {
                    initialLoader ?
                        <div className='flex flex-row items-center justify-center mt-12'>
                            <CircularProgress size={35} />
                        </div> :
                        <div>
                            {
                                filteredAgentsList.map((item, index) => (
                                    <div className='w-full flex flex-row items-center justify-between mt-10 px-10' key={index}>
                                        <div className='w-3/12 flex flex-row gap-2 items-center'>
                                            <div className='h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white'>
                                                {item.name.slice(0, 1).toUpperCase()}
                                            </div>
                                            <div style={styles.text2}>{item.name}</div>
                                        </div>
                                        <div className='w-2/12 '>
                                            {
                                                item.agents[0]?.agentObjective ?
                                                    <div style={styles.text2}>{item.agents[0]?.agentObjective}</div> : "N/A"
                                            }
                                        </div>
                                        <div className='w-1/12'>
                                            <div style={styles.text2}>{item.leadsAssigned}</div>
                                        </div>
                                        <div className='w-1/12'>
                                            {item.agents[0]?.createdAt ?
                                                <div style={styles.text2}>{moment(item.agents[0]?.createdAt).format("DD-MM-YYYY")}</div> :
                                                "N/A"
                                            }
                                        </div>
                                        <div className='w-2/12'>
                                            {
                                                item.agents[0]?.status ?
                                                    <div style={styles.text2}>{item.agents[0]?.status}</div> : "N/A"
                                            }
                                        </div>
                                        <div className='w-1/12'>
                                            <button aria-describedby={id} variant="contained"
                                                onClick={(event) => { handleShowPopup(event, item) }}>
                                                <Image src={'/otherAssets/threeDotsIcon.png'}
                                                    height={24}
                                                    width={24}
                                                    alt='icon'
                                                />
                                            </button>
                                            <Popover
                                                id={id}
                                                open={open}
                                                anchorEl={anchorEl}
                                                onClose={handleClosePopup}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right', // Ensures the Popover's top right corner aligns with the anchor point
                                                }}
                                                PaperProps={{
                                                    elevation: 0, // This will remove the shadow
                                                    style: {
                                                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
                                                        borderRadius: "10px",
                                                        width: "120px"
                                                    },
                                                }}
                                            >
                                                <div className='p-2 flex flex-col gap-2' style={{ fontWeight: "500", fontSize: 15 }}>
                                                    <button className='text-start outline-none' onClick={() => { handleShowDetails() }}>
                                                        View Details
                                                    </button>
                                                    <div className='text-red'>Delete</div>
                                                </div>
                                            </Popover>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                }
            </div>

            {/* Modals goes here */}
            <Modal
                open={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                closeAfterTransition
                BackdropProps={{
                    timeout: 1000,
                    sx: {
                        backgroundColor: "#00000020",
                        backdropFilter: "blur(20px)",
                    },
                }}
            >
                <Box className="sm:w-10/12 lg:w-10/12 xl:w-8/12 w-11/12 max-h-[70vh]" sx={{ ...styles.modalsStyle, scrollbarWidth: "none" }}>
                    <div className="flex flex-row justify-center w-full">
                        <div
                            className="sm:w-10/12 w-full"
                            style={{
                                backgroundColor: "#ffffff",
                                padding: 20,
                                borderRadius: "13px",
                            }}
                        >
                            <div className='flex flex-row justify-end'>
                                <button onClick={() => { setShowDetailsModal(false) }}>
                                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                </button>
                            </div>
                            <div>
                                {
                                    AgentCallLogLoader ?
                                        <div className='flex flex-row items-center justify-center h-full'>
                                            <CircularProgress size={35} />
                                        </div> :
                                        <div>

                                            <div>
                                                {SelectedAgent?.name.slice(0, 1).toUpperCase() + SelectedAgent?.name.slice(1)} call activity
                                            </div>

                                            <div className="flex w-full items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm mt-6">
                                                <input
                                                    type="text"
                                                    placeholder="Search by name, email or phone"
                                                    className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                                                // value={searchCallLogValue}
                                                // onChange={(e) => {
                                                //     const value = e.target.value;
                                                //     handlecalllog(value);
                                                //     setSearchCallLogValue(e.target.value);
                                                // }}
                                                />
                                                <img
                                                    src={'/otherAssets/searchIcon.png'}
                                                    alt="Search"
                                                    width={20}
                                                    height={20}
                                                />
                                            </div>

                                            <div className='flex flex-row items-center mt-6' style={{ fontSize: 15, fontWeight: "500", color: "#00000070" }}>
                                                <div className='w-3/12'>
                                                    Name
                                                </div>
                                                <div className='w-2/12'>
                                                    Phone Number
                                                </div>
                                                <div className='w-3/12'>
                                                    Address
                                                </div>
                                                <div className='w-2/12'>
                                                    Tag
                                                </div>
                                                <div className='w-2/12'>
                                                    Status
                                                </div>
                                            </div>

                                            {
                                                sheduledCalllogs.length > 0 ?
                                                    <div className='w-full'>
                                                        {
                                                            sheduledCalllogs.map((item, index) => {
                                                                return (
                                                                    <div key={index} className='w-full mt-4' style={{ fontSize: 15, fontWeight: "500", scrollbarWidth: "none" }}>
                                                                        <div className='flex flex-row items-center mt-4' style={{ fontSize: 15, fontWeight: "500" }}>
                                                                            <div className='w-3/12 flex flex-row items-center gap-2 truncate'>
                                                                                <div className='h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white'>
                                                                                    {item?.leadDetails?.firstName.slice(0, 1).toUpperCase()}
                                                                                </div>
                                                                                <div className='truncate'>
                                                                                    <div>
                                                                                        {item?.leadDetails?.firstName} {item?.leadDetails?.lastName}
                                                                                    </div>
                                                                                    <div style={{ fontSize: 11, fontWeight: "500", color: "#00000060" }}>
                                                                                        {item?.leadDetails?.email}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className='w-2/12 truncate'>
                                                                                {item?.leadDetails?.phone}
                                                                            </div>
                                                                            <div className='w-3/12 truncate'>
                                                                                {item?.leadDetails?.address}
                                                                            </div>
                                                                            <div className='w-2/12 truncate'>
                                                                                N/A
                                                                            </div>
                                                                            <div className='w-2/12 truncate'>
                                                                                Scheduled
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                    </div> :
                                                    <div className='text-center mt-6 text-3xl'>
                                                        No Call Found
                                                    </div>
                                            }




                                        </div>
                                }
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>

        </div>
    )
}

export default SheduledCalls
const styles = {
    text: {
        fontSize: 15,
        color: '#00000090',
        fontWeight: "500"
    },
    text2: {
        textAlignLast: 'left',
        fontSize: 15,
        color: '#000000',
        fontWeight: "500",
        whiteSpace: 'nowrap',  // Prevent text from wrapping
        overflow: 'hidden',    // Hide overflow text
        textOverflow: 'ellipsis'  // Add ellipsis for overflow text
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