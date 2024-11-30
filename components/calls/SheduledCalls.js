import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import Apis from '../apis/Apis';
import axios from 'axios';
import { CircularProgress, Popover } from '@mui/material';
import moment from 'moment';

function SheduledCalls() {


    const [searchValue, setSearchValue] = useState("");
    //code for agent details
    const [callDetails, setCallDetails] = useState([]);
    const [initialLoader, setInitialLoader] = useState(false);
    const [agentsList, setAgentsList] = useState([]);
    const [filteredAgentsList, setFilteredAgentsList] = useState([]);
    const [anchorEl, setAnchorEl] = React.useState(null);

    useEffect(() => {
        getAgents();
        // getSheduledCallLogs();
    }, []);

    //code to show popover
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
                // setFilteredAgentsList(response.data.data.filter((item) => {item.leadsAssigned > 0}));
                setFilteredAgentsList(
                    response.data.data.filter((item) => item.leadsAssigned > 0)
                );
                setAgentsList(response.data.data.filter((item) => item.leadsAssigned > 0));
            }



        } catch (error) {
            console.error("Error occured in get Agents api is :", error);
        } finally {
            setInitialLoader(false)
        }
    }

    // const getSheduledCallLogs = async () => {
    //     try {
    //         setInitialLoader(true);
    //         const ApiPath = `${Apis.getSheduledCallLogs}`;

    //         console.log("Apipath is", ApiPath);

    //         let AuthToken = null;
    //         const localData = localStorage.getItem("User");
    //         if (localData) {
    //             const Data = JSON.parse(localData);
    //             console.log("Localdat recieved is :--", Data);
    //             AuthToken = Data.token;
    //         }

    //         console.log("Auth token is:", AuthToken);

    //         const response = await axios.get(ApiPath, {
    //             headers: {
    //                 "Authorization": "Bearer " + AuthToken,
    //                 "Content-Type": "application/json"
    //             }
    //         });

    //         if (response) {
    //             if (response) {
    //                 console.log("response of get Sheduled call logs api is :", response.data);
    //                 setCallDetails(response.data.data);
    //             }
    //         }

    //     } catch (error) {
    //         console.error("Error occured in gtting Sheduled call logs api is:", error);
    //     } finally {
    //         setInitialLoader(false);
    //     }
    // }


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
                                                    <button className='text-start outline-none'>
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
    }
}