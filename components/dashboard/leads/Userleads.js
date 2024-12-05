import Apis from '@/components/apis/Apis';
import { Box, CircularProgress, Modal } from '@mui/material';
import { CalendarDots, DotsThree, Plus } from '@phosphor-icons/react'
import axios from 'axios';
import { first } from 'draft-js/lib/DefaultDraftBlockRenderMap';
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import AssignLead from './AssignLead';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles
import CalendarInput from '@/components/test/DatePicker';

const Userleads = ({ handleShowAddLeadModal, handleShowUserLeads }) => {

    const bottomRef = useRef(null);
    const [initialLoader, setInitialLoader] = useState(false);
    const [SheetsList, setSheetsList] = useState([]);
    const [currentSheet, setCurrentSheet] = useState(null);
    const [sheetsLoader, setSheetsLoader] = useState(false);
    const [LeadsList, setLeadsList] = useState([]);
    const [searchLead, setSearchLead] = useState("");
    const [FilterLeads, setFilterLeads] = useState([]);
    const [SelectedSheetId, setSelectedSheetId] = useState("");
    const [toggleClick, setToggleClick] = useState([]);
    const [AssignLeadModal, setAssignLeadModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedFromDate, setSelectedFromDate] = useState(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showAddNewSheetModal, setShowAddNewSheetModal] = useState(false);

    //code for array input fields
    const [inputs, setInputs] = useState([{ id: 1, value: '' }, { id: 2, value: '' }, { id: 3, value: '' }]);
    //
    const [showaddCreateListLoader, setShowaddCreateListLoader] = useState(false);
    const [newSheetName, setNewSheetName] = useState("");

    //err msg when no leaad in list
    const [showNoLeadErr, setShowNoLeadErr] = useState(null);

    //to date filter
    // const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedToDate, setSelectedToDate] = useState(null);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const stagesList = [
        {
            id: 1,
            title: "New Lead"
        },
        {
            id: 2,
            title: "Follow Up"
        },
        {
            id: 3,
            title: "Hot Lead"
        },
        {
            id: 4,
            title: "Booked"
        },
        {
            id: 5,
            title: "No Show"
        },
        {
            id: 6,
            title: "Not Interested"
        },
        {
            id: 7,
            title: "Unresponsive"
        },
        {
            id: 8,
            title: "No Stage"
        },
    ];
    const [selectedStage, setSelectedStage] = useState([]);

    useEffect(() => {
        // getLeads();
        getSheets();
    }, []);

    useEffect(() => {
        console.log("Current leads list is :", LeadsList);
        console.log("Current filtered leads list is :", FilterLeads);
    }, [LeadsList, FilterLeads]);

    //code to scroll to the bottom
    useEffect(() => {
        // Scroll to the bottom when inputs change
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [inputs]);

    //function to select the stage for filters
    const handleSelectStage = (item) => {
        // setSelectedStage(item);
        setSelectedStage((prevIds) => {
            if (prevIds.includes(item.id)) {
                // Unselect the item if it's already selected
                return prevIds.filter((prevId) => prevId !== item.id);
            } else {
                // Select the item if it's not already selected
                return [...prevIds, item.id];
            }
        });
    }

    // function to handle select data change
    const handleFromDateChange = (date) => {
        setSelectedFromDate(date); // Set the selected date
        setShowFromDatePicker(false);
    };

    const handleToDateChange = (date) => {
        setSelectedToDate(date); // Set the selected date
        setShowToDatePicker(false);
    };

    //function for filtering leads
    const handleFilterLeads = async () => {
        try {
            setSheetsLoader(true);

            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Auth token is :--", AuthToken);
            const formtFromDate = moment(selectedFromDate).format('MM/DD/YYYY');
            const formtToDate = moment(selectedToDate).format('MM/DD/YYYY');
            console.log("updated date is", formtToDate);

            const id = currentSheet.id;
            const stages = selectedStage.join(',');
            console.log("Sages selected are ", stages);
            const ApiPath = `${Apis.getLeads}?sheetId=${id}&fromDate=${formtFromDate}&toDate=${formtToDate}`;
            console.log("Api path is :", ApiPath);

            // return
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    // "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get leads filter api is api is :", response.data);
                if (response.data.status === true) {
                    setShowFilterModal(false);
                    setLeadsList(response.data.data);
                    setFilterLeads(response.data.data);
                    setShowFilterModal(false);
                    setShowNoLeadErr(response.data.message);
                }
            }

        } catch (error) {
            console.error("Error occured in api is :", error);
        } finally {
            setSheetsLoader(false);
            console.log("ApiCall completed")
        }
    }

    //function for getting the leads
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
                setFilterLeads(response.data.data);
            }

        } catch (error) {
            console.error("Error occured in api is :", error);
        } finally {
            setSheetsLoader(false);
            console.log("ApiCall completed")
        }
    }

    //function for getting the sheets
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
                    setCurrentSheet(response.data.data[0]);
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

    //code for handle search change
    const handleSearchChange = (value) => {
        if (value.trim() === "") {
            // console.log("Should reset to original");
            // Reset to original list when input is empty
            setFilterLeads(LeadsList);
            return;
        }

        const filtered = LeadsList.filter(item => {
            const term = value.toLowerCase();
            return (
                item.firstName.toLowerCase().includes(term) ||
                item.lastName.toLowerCase().includes(term) ||
                item.address.toLowerCase().includes(term) ||
                item.email.toLowerCase().includes(term) ||
                (item.phone && item.phone.includes(term))
            );
        });

        setFilterLeads(filtered);
    };


    //code for array input fields changes
    // Handle change in input field
    const handleInputChange = (id, value) => {
        setInputs(inputs.map(input => (input.id === id ? { ...input, value } : input)));
    };

    // Handle deletion of input field
    const handleDelete = (id) => {
        setInputs(inputs.filter(input => input.id !== id));
    };

    // Handle adding a new input field
    const handleAddInput = () => {
        const newId = inputs.length ? inputs[inputs.length - 1].id + 1 : 1;
        setInputs([...inputs, { id: newId, value: '' }]);
    };

    //code to add new sheet list
    const handleAddSheetNewList = async () => {
        try {
            setShowaddCreateListLoader(true);

            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Auth token is :--", AuthToken);

            const ApiData = {
                sheetName: newSheetName,
                columns: inputs.map((columns) => (columns.value))
            }
            console.log("Data to send in api is:", ApiData);

            const ApiPath = Apis.addSmartList;
            console.log("Api Path is", ApiPath);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of add new smart list api is :", response);
                if (response.data.status) {
                    setShowAddNewSheetModal(false);
                }
            }

        } catch (error) {
            console.error("Error occured in adding new list api is:", error);
        } finally {
            setShowaddCreateListLoader(false);
        }
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
                    <button>
                        <Image src={"/assets/notification.png"} height={24} width={24} alt='*' />
                    </button>

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
                                    {/* <div className='flex flex-row items-center gap-2'>
                                        <Image src={"/assets/buyLeadIcon.png"} height={24} width={24} alt='*' />
                                        <span className='text-purple' style={styles.paragraph}>
                                            Buy Lead
                                        </span>
                                    </div> */}
                                    <button
                                        style={{ backgroundColor: toggleClick.length > 0 ? "#7902DF" : "", color: toggleClick.length > 0 ? "white" : "#00000060" }}
                                        className='flex flex-row items-center gap-4 h-[50px] rounded-lg bg-[#33333315] w-[189px] justify-center'
                                        onClick={() => { setAssignLeadModal(true) }}>
                                        {
                                            toggleClick.length > 0 ?
                                                <Image src={"/assets/callBtnFocus.png"} height={17} width={17} alt='*' /> :
                                                <Image src={"/assets/callBtn.png"} height={17} width={17} alt='*' />
                                        }
                                        <span style={styles.heading}>
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
                                                    <div className='w-full'>
                                                        <AssignLead selectedLead={toggleClick} handleCloseAssignLeadModal={handleCloseAssignLeadModal} leadIs={toggleClick} />
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
                                    <div className='flex flex-row items-center gap-1 w-[22vw] border rounded pe-2'>
                                        <input
                                            style={styles.paragraph}
                                            className='outline-none border-none w-full bg-transparent focus:outline-none focus:ring-0'
                                            placeholder='Search by name, email or phone'
                                            value={searchLead}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearchLead(e.target.value);
                                                handleSearchChange(value);
                                            }}
                                        />
                                        <button className='outline-none border-none'>
                                            <Image src={"/assets/searchIcon.png"} height={24} width={24} alt='*' />
                                        </button>
                                    </div>
                                    <button className='outline-none' onClick={() => { setShowFilterModal(true) }}>
                                        <Image src={"/assets/filterIcon.png"} height={16} width={16} alt='*' />
                                    </button>
                                    <div style={styles.paragraph}>
                                        {
                                            selectedFromDate && selectedToDate && (
                                                <div className='px-4 py-2 bg-[#402FFF10] text-purple [#7902DF10] rounded-[25px]' style={{ fontWeight: "500", fontSize: 15 }}>
                                                    {moment(selectedFromDate).format('ddd MM')}th - {moment(selectedToDate).format('ddd MM')}th
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>


                                <div className='flex flex-row items-center gap-2'>
                                    {
                                        toggleClick.length === FilterLeads.length ? (
                                            <div>
                                                {
                                                    LeadsList.length > 0 && (
                                                        <div className='flex flex-row items-center gap-2'>
                                                            <button
                                                                className="h-[20px] w-[20px] border rounded bg-purple outline-none flex flex-row items-center justify-center"
                                                                onClick={() => { setToggleClick([]) }}
                                                            >
                                                                <Image src={"/assets/whiteTick.png"} height={10} width={10} alt='*' />
                                                            </button>
                                                            <div style={{ fontSize: "15", fontWeight: "600" }}>
                                                                Select All
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        ) : (
                                            <div className='flex flex-row items-center gap-2'>
                                                <button
                                                    className="h-[20px] w-[20px] border-2 rounded outline-none"
                                                    onClick={() => {
                                                        setToggleClick(
                                                            FilterLeads.map((item) => item.id)
                                                        );
                                                    }}
                                                >
                                                </button>
                                                <div style={{ fontSize: "15", fontWeight: "600" }}>
                                                    Select All
                                                </div>
                                            </div>
                                        )
                                    }

                                    <button className='flex flex-row items-center justify-center gap-2 bg-none outline-none border h-[43px] w-[101px] rounded' onClick={() => { handleShowAddLeadModal(true) }}>
                                        <span>
                                            Import
                                        </span>
                                        <Image src={"/assets/downloadIcon.png"} height={15} width={15} alt='*' />
                                    </button>
                                </div>



                            </div>

                            <div className='flex flex-row items-center mt-8 gap-2' style={styles.paragraph}>
                                <div className='flex flex-row items-center gap-2'>
                                    {
                                        SheetsList.map((item, index) => {
                                            return (
                                                <button
                                                    key={index}
                                                    className='flex flex-row items-center gap-1 px-3'
                                                    onClick={() => { getLeads(item) }}
                                                    style={{ borderBottom: SelectedSheetId === item.id ? "2px solid #7902DF" : "", color: SelectedSheetId === item.id ? "#7902DF" : "" }}
                                                >
                                                    <span style={styles.paragraph}>{item.sheetName}</span>
                                                    <DotsThree weight='bold' size={25} color='black' />
                                                </button>
                                            )
                                        })
                                    }
                                </div>
                                <button className='flex flex-row items-center gap-1 text-purple' style={styles.paragraph} onClick={() => { setShowAddNewSheetModal(true) }}>
                                    <Plus size={15} color='#7902DF' weight='bold' />
                                    <span>
                                        New list
                                    </span>
                                </button>
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
                                sheetsLoader ?
                                    <div className="w-full flex flex-row justify-center mt-12">
                                        <CircularProgress size={30} />
                                    </div> :
                                    <div>
                                        {
                                            LeadsList.length > 0 ?
                                                <div className='h-[60vh] overflow-auto' //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                                                    style={{ scrollbarWidth: "none" }}
                                                >
                                                    {
                                                        FilterLeads.map((item, index) => (
                                                            <div className='w-full flex flex-row items-center mt-4' style={styles.paragraph} key={index}>
                                                                <div className='w-2/12 flex flex-row items-center gap-2 truncate'>
                                                                    {toggleClick.includes(item.id) ? (
                                                                        <button
                                                                            className="h-[20px] w-[20px] border rounded bg-purple outline-none flex flex-row items-center justify-center"
                                                                            onClick={() => handleToggleClick(item.id)}
                                                                        >
                                                                            <Image src={"/assets/whiteTick.png"} height={10} width={10} alt='*' />
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="h-[20px] w-[20px] border-2 rounded outline-none"
                                                                            onClick={() => handleToggleClick(item.id)}
                                                                        >
                                                                        </button>
                                                                    )}
                                                                    <div className='h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white'
                                                                        onClick={() => handleToggleClick(item.id)}>
                                                                        {item.firstName.slice(0, 1)}
                                                                    </div>
                                                                    <div className='truncate'
                                                                        onClick={() => handleToggleClick(item.id)}>
                                                                        {item.firstName} {item.lastName}
                                                                    </div>
                                                                </div>
                                                                <div className='w-2/12 text-[#00000070] truncate'
                                                                    onClick={() => handleToggleClick(item.id)}>
                                                                    {item.email}
                                                                </div>
                                                                <div className='w-2/12 truncate'
                                                                    onClick={() => handleToggleClick(item.id)}>
                                                                    {item.phone}
                                                                </div>
                                                                <div className='w-2/12 truncate'
                                                                    onClick={() => handleToggleClick(item.id)}>
                                                                    {item.address}
                                                                </div>
                                                                <div className='w-2/12 flex flex-row items-center gap-2' onClick={() => handleToggleClick(item.id)}>
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
                                                                    <div className='w-5/12' onClick={() => handleToggleClick(item.id)}>
                                                                        <li style={{
                                                                            fontWeight: "500",
                                                                            fontSize: 12
                                                                        }}>
                                                                            {item.stage?.stageTitle ? (item.stage?.stageTitle) : "No stage"}
                                                                        </li>
                                                                    </div>
                                                                    <div className='w-5/12 truncate' onClick={() => handleToggleClick(item.id)}>
                                                                        {moment(item.createdAt).format('MM/DD/YYYY')}
                                                                    </div>
                                                                    <button className='w-2/12 underline text-purple truncate'>
                                                                        Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div> :
                                                <div className='text-xl text-center mt-8' style={{ fontWeight: "700", fontSize: 22 }}>
                                                    {showNoLeadErr ? (showNoLeadErr) : "No lead found"}
                                                </div>
                                        }
                                    </div>
                            }


                            <div>
                                <Modal
                                    open={showFilterModal}
                                    closeAfterTransition
                                    BackdropProps={{
                                        sx: {
                                            backgroundColor: "#00000020",
                                            backdropFilter: "blur(5px)",
                                        },
                                    }}
                                >
                                    <Box className="lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-2 px-6 h-[60vh] overflow-auto" sx={{ ...styles.modalsStyle, scrollbarWidth: "none", backgroundColor: "white" }}>
                                        <div className="w-full flex flex-col items-center justify-between h-full">

                                            <div className='mt-2 w-full'>
                                                <div className='flex flex-row items-center justify-between w-full'>
                                                    <div>
                                                        Filter
                                                    </div>
                                                    <button onClick={() => { setShowFilterModal(false) }}>
                                                        <Image src={"/assets/cross.png"} height={17} width={17} alt='*' />
                                                    </button>
                                                </div>

                                                <div className='flex flex-row items-start gap-4'>
                                                    <div className='w-1/2 h-full'>
                                                        <div className='h-full' style={{ fontWeight: "500", fontSize: 12, color: "#00000060", marginTop: 10 }}>
                                                            From
                                                        </div>
                                                        <div>
                                                            <button
                                                                style={{ border: "1px solid #00000020" }}
                                                                className='flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between'
                                                                onClick={() => { setShowFromDatePicker(true) }}>
                                                                <p>{selectedFromDate ? selectedFromDate.toDateString() : "Select Date"}</p>
                                                                <CalendarDots weight='regular' size={25} />
                                                            </button>
                                                            <div>
                                                                {
                                                                    showFromDatePicker && (
                                                                        <div>
                                                                            {/* <div className='w-full flex flex-row items-center justify-start -mb-5'>
                                                                    <button>
                                                                        <Image src={"/assets/cross.png"} height={18} width={18} alt='*' />
                                                                    </button>
                                                                </div> */}
                                                                            <Calendar
                                                                                onChange={handleFromDateChange}
                                                                                value={selectedFromDate}
                                                                                locale="en-US"
                                                                                onClose={() => { setShowFromDatePicker(false) }}
                                                                            />
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className='w-1/2 h-full'>
                                                        <div style={{ fontWeight: "500", fontSize: 12, color: "#00000060", marginTop: 10 }}>
                                                            To
                                                        </div>
                                                        <div>
                                                            <button
                                                                style={{ border: "1px solid #00000020" }}
                                                                className='flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between'
                                                                onClick={() => { setShowToDatePicker(true) }}>
                                                                <p>{selectedToDate ? selectedToDate.toDateString() : "Select Date"}</p>
                                                                <CalendarDots weight='regular' size={25} />
                                                            </button>
                                                            <div>
                                                                {
                                                                    showToDatePicker && (
                                                                        <div>
                                                                            {/* <div className='w-full flex flex-row items-center justify-start -mb-5'>
                                                                    <button>
                                                                        <Image src={"/assets/cross.png"} height={18} width={18} alt='*' />
                                                                    </button>
                                                                </div> */}
                                                                            <Calendar
                                                                                onChange={handleToDateChange}
                                                                                value={selectedToDate}
                                                                                locale="en-US"
                                                                                onClose={() => { setShowToDatePicker(false) }}
                                                                            />
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='mt-6' style={{ fontWeight: "500", fontSize: 12, color: "#00000060", marginTop: 10 }}>
                                                    Stage
                                                </div>

                                                <div className='w-full flex flex-wrap gap-4'>
                                                    {
                                                        stagesList.map((item, index) => (
                                                            <div key={index} className='flex flex-row items-center mt-2 justify-start' style={{ fontSize: 15, fontWeight: "500" }}>
                                                                <button
                                                                    onClick={() => { handleSelectStage(item) }}
                                                                    className={`p-2 border border-[#00000020] ${selectedStage.includes(item.id) ? `bg-purple` : "bg-transparent"} px-6
                                                                ${selectedStage.includes(item.id) ? `text-white` : "text-black"} rounded-2xl`}>
                                                                    {item.title}
                                                                </button>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>

                                            <div className='flex flex-row items-center w-full justify-between mt-4 pb-8'>
                                                <button className='outline-none w-[105px]' style={{ fontSize: 16.8, fontWeight: "600", }}
                                                    onClick={() => {
                                                        // setSelectedFromDate(null);
                                                        // setSelectedToDate(null);
                                                        // setSelectedStage(null);
                                                        // getLeads()
                                                        window.location.reload();
                                                    }}>
                                                    Reset
                                                </button>
                                                {
                                                    sheetsLoader ?
                                                        <CircularProgress size={25} /> :
                                                        <button
                                                            className='bg-purple h-[45px] w-[140px] bg-purple text-white rounded-xl outline-none'
                                                            style={{
                                                                fontSize: 16.8, fontWeight: "600",
                                                                backgroundColor: selectedFromDate && selectedToDate && selectedStage.length > 0 ? "" : "#00000050"
                                                            }}
                                                            onClick={() => {
                                                                if (selectedFromDate && selectedToDate && selectedStage.length > 0) {
                                                                    console.log("Can continue");
                                                                    handleFilterLeads()
                                                                } else {
                                                                    console.log("Cannot continue");
                                                                }
                                                            }}
                                                        >
                                                            Apply Filter
                                                        </button>
                                                }
                                            </div>

                                        </div>
                                    </Box>
                                </Modal>
                            </div>

                            <div>
                                <Modal
                                    open={showAddNewSheetModal}
                                    closeAfterTransition
                                    BackdropProps={{
                                        sx: {
                                            backgroundColor: "#00000020",
                                            backdropFilter: "blur(5px)",
                                        },
                                    }}
                                >
                                    <Box className="lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-2 px-6 h-[60vh] overflow-auto rounded-3xl h-[70vh]" sx={{ ...styles.modalsStyle, scrollbarWidth: "none", backgroundColor: "white" }}>
                                        <div className="w-full flex flex-col items-center h-full justify-between" style={{ backgroundColor: "white" }}>

                                            <div className='w-full'>
                                                <div className='flex flex-row items-center justify-between w-full mt-4 px-2'>
                                                    <div style={{ fontWeight: "500", fontSize: 15 }}>
                                                        New SmartList
                                                    </div>
                                                    <button onClick={() => { setShowAddNewSheetModal(false) }}>
                                                        <Image src={"/assets/cross.png"} height={15} width={15} alt='*' />
                                                    </button>
                                                </div>

                                                <div className='px-4 w-full'>
                                                    <div className='flex flex-row items-center justify-start mt-6 gap-2'>
                                                        <span style={styles.paragraph}>
                                                            List Name
                                                        </span>
                                                        <Image src={"/assets/infoIcon.png"} height={15} width={15} alt='*' />
                                                    </div>
                                                    <div className='mt-4'>
                                                        <input
                                                            value={newSheetName}
                                                            onChange={(e) => { setNewSheetName(e.target.value) }}
                                                            placeholder='Enter list name' className='outline-none focus:outline-none focus:ring-0 border w-full rounded-xl h-[53px]'
                                                            style={{
                                                                ...styles.paragraph, border: "1px solid #00000020"
                                                            }}
                                                        />
                                                    </div>
                                                    <div className='mt-8' style={styles.paragraph}>
                                                        Create Columns
                                                    </div>
                                                    <div className='max-h-[30vh] overflow-auto mt-2' //scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
                                                        style={{ scrollbarWidth: "none" }}
                                                    >
                                                        {inputs.map((input, index) => (
                                                            <div key={input.id} className='w-full flex flex-row items-center gap-4 mt-4'>
                                                                <input
                                                                    className='border p-2 rounded-lg px-3 outline-none focus:outline-none focus:ring-0 h-[53px]'
                                                                    style={{
                                                                        ...styles.paragraph,
                                                                        width: "95%", borderColor: "#00000020",
                                                                    }}
                                                                    placeholder={`Column Name`}
                                                                    value={input.value}
                                                                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                                                                />
                                                                <button className='outline-none border-none' style={{ width: "5%" }} onClick={() => handleDelete(input.id)}>
                                                                    <Image src={"/assets/blackBgCross.png"} height={20} width={20} alt='*' />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {/* Dummy element for scrolling */}
                                                        <div ref={bottomRef}></div>
                                                    </div>
                                                    <div style={{ height: "50px" }}>
                                                        {/*
                                                        inputs.length < 3 && (
                                                            <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-purple rounded-lg underline' style={{
                                                                fontSize: 15,
                                                                fontWeight: "700"
                                                            }}>
                                                                Add New
                                                            </button>
                                                        )
                                                    */ }
                                                        <button onClick={handleAddInput} className='mt-4 p-2 outline-none border-none text-purple rounded-lg underline' style={styles.paragraph}>
                                                            New Column
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='w-full pb-8'>
                                                {
                                                    showaddCreateListLoader ?
                                                        <div className='flex flex-row items-center justify-center w-full h-[50px]'>
                                                            <CircularProgress size={25} />
                                                        </div> :
                                                        <button
                                                            className='bg-purple h-[50px] rounded-xl text-white w-full'
                                                            style={{
                                                                fontWeight: "600",
                                                                fontSize: 16.8
                                                            }}
                                                            onClick={handleAddSheetNewList}
                                                        >
                                                            Create List
                                                        </button>
                                                }
                                            </div>

                                        </div>
                                    </Box>
                                </Modal>
                            </div>


                        </div>
                }
            </div>
        </div>
    )
}

export default Userleads