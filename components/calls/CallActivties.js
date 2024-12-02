import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Box, CircularProgress, duration, Modal, Popover } from '@mui/material';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import moment from 'moment';

function CallActivities() {


    const [searchValue, setSearchValue] = useState("");
    const [searchCallLogValue, setSearchCallLogValue] = useState("");

    const [selectedAgent, setSelectedAgent] = useState(null);
    //call activites data `shwoing the agents then show their details also pause them`
    const [agentsList, setAgentsList] = useState([]);
    const [filteredAgentsList, setFilteredAgentsList] = useState([]);
    const [initialLoader, setInitialLoader] = useState(false);
    const [pauseLoader, setPauseLoader] = useState(false);

    //code for popup
    const [anchorEl, setAnchorEl] = React.useState(null);
    //modal state & agent call logs api code
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [AgentCallLogLoader, setAgentCallLogLoader] = useState(false);
    const [FilteredCallLogs, setFilteredCallLogs] = useState([]);
    const [AgentCallLogs, setAgentCallLogs] = useState([]);


    const handleShowPopup = (event, item) => {
        setAnchorEl(event.currentTarget);
        console.log("Selected agent is ", item);
        setSelectedAgent(item)
    };

    const handleClosePopup = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        getAgents();
    }, []);




    //code to get agents
    const getAgents = async () => {
        try {
            setInitialLoader(true);
            const ApiPath = `${Apis.getAgents}?agentType=outbound`;

            console.log("Api path is: ", ApiPath);

            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            console.log("Auth token is:", AuthToken);

            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get agents api is:", response.data);
                setFilteredAgentsList(response.data.data);
                setAgentsList(response.data.data);
            }



        } catch (error) {
            console.error("Error occured in get Agents api is :", error);
        } finally {
            setInitialLoader(false)
        }
    }

    //code to getagent call logs
    const getAgentCallLogs = async () => {
        try {
            setAgentCallLogLoader(true);

            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            console.log("Auth token is:", AuthToken);

            // const ApiData = {
            //     mainAgentId: selectedAgent.id
            // }

            // console.log("Data sending in api is:", ApiData);

            const ApiPath = `${Apis.getAgentCallLogs}?mainAgentId=${selectedAgent.id}`;
            console.log("Apipath is:", ApiPath);
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            })

            // const response = await axios.get(ApiPath, ApiData, {
            //     headers: {
            //         "Authorization": "Bearer " + AuthToken,
            //         "Content-Type": "application/json"
            //     }
            // });

            if (response) {
                console.log("Response of get selected agent call logs are", response.data);
                setFilteredCallLogs(response.data.data);
                if (response.data.status === true) {
                    setAgentCallLogs(response.data.data);
                }
            }

        } catch (error) {
            console.error("Error occured in call logs api is :", error);
        } finally {
            setAgentCallLogLoader(false);
        }
    }

    //code to pause agents
    const pauseAgents = async () => {
        try {
            setPauseLoader(true);
            const ApiPath = Apis.pauseAgent;

            console.log("Api path is: ", ApiPath);

            let AuthToken = null;
            const localData = localStorage.getItem("User");
            if (localData) {
                const Data = JSON.parse(localData);
                console.log("Localdat recieved is :--", Data);
                AuthToken = Data.token;
            }

            console.log("Auth token is:", AuthToken);
            const ApiData = {
                mainAgentId: selectedAgent.id
            }

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get agents api is:", response.data);
                if (response.data.status === true) {
                    handleClosePopup()
                }
                // setFilteredAgentsList(response.data.data);
                // setAgentsList(response.data.data);
            }



        } catch (error) {
            console.error("Error occured in get Agents api is :", error);
        } finally {
            setPauseLoader(false)
        }
    }

    //code to filter search
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

    //handlecalllog search change
    const handlecalllog = (value) => {
        if (value.trim() === "") {
            // console.log("Should reset to original");
            // Reset to original list when input is empty
            setFilteredCallLogs(AgentCallLogs);
            return;
        }

        const filtered = AgentCallLogs.filter(item => {
            const term = value.toLowerCase();
            return (
                // item.LeadModel?.firstName.toLowerCase().includes(term) ||
                // item.LeadModel?.lastName.toLowerCase().includes(term) ||
                // item.LeadModel?.address.toLowerCase().includes(term) ||
                item.LeadModel.firstName.toLowerCase().includes(term)
                // (item.LeadModel?.phone && agentsList.includes(term))
            );
        });

        setFilteredCallLogs(filtered);
    }

    const styles = {
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
                    <div style={styles.text}>Num of leads</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Date created</div>
                </div>
                <div className='w-2/12'>
                    <div style={styles.text}>Call status</div>
                </div>
                <div className='w-1/12'>
                    <div style={styles.text}>Action</div>
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
                                    <div className='w-full flex flex-row justify-between mt-10 items-center px-10' key={index}>
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
                                            <button aria-describedby={id} variant="contained" onClick={(event) => { handleShowPopup(event, item) }}>
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
                                                    <div>
                                                        {
                                                            pauseLoader ?
                                                                <CircularProgress size={18} /> :
                                                                <button className='text-start outline-none'
                                                                    onClick={pauseAgents}
                                                                >
                                                                    Pause Calls
                                                                </button>
                                                        }
                                                    </div>
                                                    <button className='text-start outline-none' onClick={() => {
                                                        setShowDetailsModal(true);
                                                        getAgentCallLogs();
                                                    }}>
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

                            {
                                AgentCallLogLoader ?
                                    <div className='flex flex-row items-center justify-center h-full'>
                                        <CircularProgress size={35} />
                                    </div> :
                                    <div>
                                        <div className='flex flex-row justify-end'>
                                            <button onClick={() => { setShowDetailsModal(false) }}>
                                                <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                                            </button>
                                        </div>

                                        <div>
                                            {selectedAgent?.name.slice(0, 1).toUpperCase() + selectedAgent?.name.slice(1)} call activity
                                        </div>

                                        <div className="flex w-full items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm mt-6">
                                            <input
                                                type="text"
                                                placeholder="Search by name, email or phone"
                                                className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0"
                                                value={searchCallLogValue}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    handlecalllog(value);
                                                    setSearchCallLogValue(e.target.value);
                                                }}
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
                                            FilteredCallLogs.length > 0 ?
                                                <div className='w-full h-[40vh] overflow-auto mt-4' style={{ fontSize: 15, fontWeight: "500", scrollbarWidth: "none" }}>
                                                    {
                                                        FilteredCallLogs.map((item, index) => {
                                                            return (
                                                                <div key={index} className='flex flex-row items-center mt-4' style={{ fontSize: 15, fontWeight: "500" }}>
                                                                    <div className='w-3/12 flex flex-row items-center gap-2 truncate'>
                                                                        <div className='h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white'>
                                                                            {item.LeadModel?.firstName?.slice(0, 1).toUpperCase()}
                                                                        </div>
                                                                        <div className='truncate'>
                                                                            <div>
                                                                                {item.LeadModel.firstName} {item.LeadModel.lastName}
                                                                            </div>
                                                                            <div style={{ fontSize: 11, fontWeight: "500", color: "#00000060" }}>
                                                                                {item.LeadModel.email}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className='w-2/12 truncate'>
                                                                        {item.LeadModel.phone}
                                                                    </div>
                                                                    <div className='w-3/12 truncate'>
                                                                        {item.LeadModel.address}
                                                                    </div>
                                                                    <div className='w-2/12 truncate'>
                                                                        {item.LeadModel.tags || "N/A"}
                                                                    </div>
                                                                    <div className='w-2/12 truncate'>
                                                                        {item.LeadModel.status || "N/A"}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </div> :
                                                <div>
                                                    {
                                                        AgentCallLogLoader ?
                                                            <div className='w-full text-2xl justify-center flex flex-row items-center mt-8'>
                                                                <CircularProgress size={25} />
                                                            </div> :
                                                            <div className='w-full text-2xl justify-center flex flex-row items-center mt-8'>
                                                                No call logs found
                                                            </div>
                                                    }
                                                </div>
                                        }


                                    </div>
                            }


                            {/* Can be use full to add shadow */}
                            {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
                        </div>
                    </div>
                </Box>
            </Modal>

        </div>
    )
}

export default CallActivities
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
    }
}