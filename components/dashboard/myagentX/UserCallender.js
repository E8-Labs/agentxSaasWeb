import React, { useEffect, useState } from 'react'
import Header from '@/components/onboarding/Header'
import Footer from '@/components/onboarding/Footer'
import ProgressBar from '@/components/onboarding/ProgressBar'
import { borderColor, Box } from '@mui/system'
import Apis from '@/components/apis/Apis'
import axios from 'axios'
import { CircularProgress, FormControl, InputLabel, MenuItem, Modal, Select } from '@mui/material'
import Image from 'next/image'

const UserCalender = ({ calendarDetails, setUserDetails, mainAgentId }) => {

    const [calenderLoader, setAddCalenderLoader] = useState(false);
    const [shouldContinue, setshouldContinue] = useState(true);

    const [calenderTitle, setCalenderTitle] = useState("");
    const [calenderApiKey, setCalenderApiKey] = useState("");
    const [eventId, setEventId] = useState("");

    const [selectCalender, setSelectCalender] = useState('');
    const [initialLoader, setInitialLoader] = useState(false);
    const [previousCalenders, setPreviousCalenders] = useState([]);
    const [showAddNewCalender, setShowAddNewCalender] = useState(false);


    const [calendarSelected, setCalendarSelected] = useState(null)

    //code for the IANA time zone lists

    const [selectTimeZone, setSelectTimeZone] = useState("");

    // const [timeZones, setTimeZones] = useState([]);
    const timeZones = [
        "Etc/UTC",
        "Europe/London",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Asia/Dubai",
        "Asia/Kolkata",
        "Asia/Shanghai",
        "Asia/Tokyo",
        "Asia/Singapore",
        "Australia/Sydney",
        "Africa/Johannesburg",
    ];


    useEffect(() => {
        console.log("Calender details passed are", calendarDetails);
        if (calendarDetails?.calendar) {
            setSelectCalender(calendarDetails?.calendar?.title);
        }
        getCalenders();
    }, []);

    // useEffect(() => {
    //   if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
    //     setshouldContinue(false);
    //   } else {
    //     setshouldContinue(true);
    //   }
    // }, [calenderTitle, calenderApiKey, eventId, selectTimeZone]);


    function isEnabled() {
        if (calendarSelected) {
            console.log("True because calenarSelected")
            return true
        }
        if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
            console.log("True because all values are there")
            return true
        } else {
            console.log("false  calenarSelected")
            return false
        }
    }

    //code for the dropdown selection

    const handleChange = (event) => {
        setSelectCalender(event.target.value);
    };

    const getCalenders = async () => {
        try {
            setInitialLoader(true);

            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Authtoken is:", AuthToken);

            const ApiPath = Apis.getCalenders;

            console.log("Apipath is:", ApiPath);

            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get calender api is:", response);
                setPreviousCalenders(response.data.data);
            }

        } catch (error) {
            console.error("Error occured in the api is ", error);
        } finally {
            setInitialLoader(false);
        }
    }

    //code for calender api
    const handleAddCalender = async () => {
        try {
            setAddCalenderLoader(true);

            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            let currentAgentDetails = null;

            const agentDetails = localStorage.getItem("agentDetails");
            if (agentDetails) {
                const agentData = JSON.parse(agentDetails);
                console.log("Recieved from are :--", agentData);
                currentAgentDetails = agentData;
            }


            console.log("Auth token is:", AuthToken);
            const ApiPath = Apis.addCalender;
            console.log("Api path is:", ApiPath);

            const formData = new FormData();

            formData.append("apiKey", calendarSelected ? calendarSelected.apiKey : calenderApiKey);
            formData.append("title", calendarSelected ? calendarSelected.title : calenderTitle);
            formData.append("mainAgentId", calendarDetails.id);
            // if (selectTimeZone) {
            formData.append("timeZone", calendarSelected ? calendarSelected.timeZone : selectTimeZone)
            // }

            // if (eventId) {
            formData.append("eventId", calendarSelected ? calendarSelected.eventId : eventId)
            // }

            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            // return
            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + AuthToken,
                }
            });

            if (response) {
                console.log("Response of add calender api is:", response);

                if (response.data.status === true) {

                    const localAgentsList = localStorage.getItem("localAgentDetails");

                    if (localAgentsList) {
                        const agentsList = JSON.parse(localAgentsList);
                        // agentsListDetails = agentsList;

                        const updateAgentData = response.data.data;

                        let updatedArray = []
                        // agentsList.map((localItem) => {
                        //     const apiItem =
                        //         updateAgentData.mainAgentId === localItem.id ? updateAgentData : null;

                        //     return apiItem ? { ...localItem, calendar: updateAgentData } : localItem;
                        // });

                        for (let i = 0; i < agentsList.length; i++) {
                            let ag = agentsList[i];
                            console.log(`Comparing ${ag.id} = ${updateAgentData.mainAgentId}`)
                            if (ag.id == updateAgentData.mainAgentId) {
                                ag.calendar = updateAgentData
                            }
                            updatedArray.push(ag)
                        }


                        console.log("Updated agents list array is", updatedArray);
                        localStorage.setItem(
                            "localAgentDetails",
                            JSON.stringify(updatedArray)
                        );
                        setUserDetails(updatedArray);
                        setShowAddNewCalender(false);
                        // agentsListDetails = updatedArray
                    }

                }

            }

        } catch (error) {
            console.error("Error occured in api is:", error);
        } finally {
            setAddCalenderLoader(false);
        }
    }

    //code to select the time zone
    const handleChangeTimeZone = (event) => {
        setSelectTimeZone(event.target.value);
    };

    const styles = {
        inputStyles: {
            fontWeight: "500",
            fontSize: 15,
            borderColor: "#00000020"
        },
        modalsStyle: {
            height: "auto",
            bgcolor: "transparent",
            p: 2,
            mx: "auto",
            my: "50vh",
            transform: "translateY(-55%)",
            borderRadius: 2,
            border: "none",
            outline: "none",
        },
    }

    return (
        <div style={{ width: "100%" }} className="overflow-y-none flex flex-row justify-center items-center">
            <div className='bg-white rounded-2xl w-full h-[90vh] py-4 flex flex-col'>


                <div className='w-full flex flex-col w-full items-center'>
                    <div className='w-full'>
                        <FormControl sx={{ m: 1 }} className='w-full'>
                            <Select
                                labelId="demo-select-small-label"
                                id="demo-select-small"
                                value={selectCalender}
                                // label="Age"
                                onChange={handleChange}
                                displayEmpty // Enables placeholder
                                renderValue={(selected) => {
                                    if (!selected) {
                                        return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                                    }
                                    return selected;
                                }}
                                sx={{
                                    border: "1px solid #00000020", // Default border
                                    "&:hover": {
                                        border: "1px solid #00000020", // Same border on hover
                                    },
                                    "& .MuiOutlinedInput-notchedOutline": {
                                        border: "none", // Remove the default outline
                                    },
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                        border: "none", // Remove outline on focus
                                    },
                                    "&.MuiSelect-select": {
                                        py: 0, // Optional padding adjustments
                                    },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: "30vh", // Limit dropdown height
                                            overflow: "auto", // Enable scrolling in dropdown
                                            scrollbarWidth: "none",
                                            // borderRadius: "10px"
                                        },
                                    },
                                }}
                            >
                                {/* <MenuItem value="">
                      <em>None</em>
                    </MenuItem> */}
                                {
                                    previousCalenders.map((item, index) => {
                                        return (
                                            <MenuItem
                                                className='w-full'
                                                value={item.title}
                                                key={index}
                                            >
                                                <button className='w-full text-start'
                                                    onClick={() => {
                                                        console.log("Selected calender is:", item);
                                                        setCalendarSelected(item)
                                                        // setCalenderTitle(item.title);
                                                        // setCalenderApiKey(item.apiKey);
                                                        // setEventId(item.eventId);
                                                        // setSelectTimeZone(item.timeZone);
                                                    }}
                                                >
                                                    {item.title}
                                                </button>
                                            </MenuItem>
                                        )
                                    })
                                }
                                <MenuItem
                                    className='w-full'
                                    value="Custom Calender"
                                >
                                    <button
                                        className='text-purple underline w-full text-start'
                                        onClick={() => {
                                            console.log("Show show the modal");
                                            setCalendarSelected(null)
                                            // setCalenderTitle("");
                                            // setCalenderApiKey("");
                                            // setEventId("");
                                            // setSelectTimeZone("");
                                            setShowAddNewCalender(true);
                                        }}
                                    >
                                        Add New Calender
                                    </button>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div className='w-full mt-4'>
                        {
                            calenderLoader ?
                                <div className='w-full flex flex-row items-center justify-center'>
                                    <CircularProgress size={25} />
                                </div> :
                                <button
                                    disabled={!isEnabled()}
                                    className='h-[50px] w-full text-white rounded-xl'
                                    style={{
                                        fontWeight: "600", fontSize: 16,
                                        backgroundColor: !isEnabled() ? "#00000060" : "#7902DF"
                                    }}
                                    onClick={handleAddCalender}
                                >
                                    Add
                                </button>
                        }
                    </div>
                </div>

                {/* Modal to add custom calender */}
                <Modal
                    open={showAddNewCalender}
                >
                    <Box className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12" sx={{ ...styles.modalsStyle, backgroundColor: 'white', paddingInline: "25px", paddingTop: "25px", paddingBottom: "30px" }}>
                        <div style={{ width: "100%", }}>

                            <div className='max-h-[60vh] overflow-auto' style={{ scrollbarWidth: "none" }}>

                                <div className='w-full'>

                                    <div className='w-full flex flex-row justify-end'>
                                        <button
                                            className='outline-none'
                                            onClick={() => {
                                                setShowAddNewCalender(false);
                                                setCalenderTitle("");
                                                setCalenderApiKey("");
                                                setEventId("");
                                                setSelectTimeZone("");
                                            }}>
                                            <Image src={"/assets/blackBgCross.png"} height={20} width={20} alt='*' />
                                        </button>
                                    </div>

                                    <div className='mt-4' style={{ fontWeight: "600", fontSize: 16.8, textAlign: "start" }}>
                                        Add calender title
                                    </div>
                                    <div>
                                        <input
                                            className='w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1'
                                            placeholder='Calender name'
                                            style={styles.inputStyles}
                                            value={calenderTitle}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                setCalenderTitle(value);
                                            }}
                                        />
                                    </div>
                                    <div className='mt-4' style={{ fontWeight: "600", fontSize: 16.8, textAlign: "start" }}>
                                        Add api key
                                    </div>
                                    <div>
                                        <input
                                            className='w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1'
                                            placeholder='Enter api key'
                                            style={styles.inputStyles}
                                            value={calenderApiKey}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                setCalenderApiKey(value);
                                            }}
                                        />
                                    </div>
                                    <div className='mt-4' style={{ fontWeight: "600", fontSize: 16.8, textAlign: "start" }}>
                                        Add event id
                                    </div>
                                    <div>
                                        <input
                                            className='w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1'
                                            placeholder='Enter event id'
                                            style={styles.inputStyles}
                                            value={eventId}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                setEventId(value);
                                            }}
                                        />
                                    </div>

                                    <div className='mt-4' style={{ fontWeight: "600", fontSize: 16.8, textAlign: "start" }}>
                                        Add time zone
                                    </div>

                                    <div className='w-full mt-2'>
                                        <FormControl sx={{}} className='w-full h-[50px]'>
                                            <Select
                                                value={selectTimeZone}
                                                // label="Age"
                                                onChange={handleChangeTimeZone}
                                                displayEmpty // Enables placeholder
                                                renderValue={(selected) => {
                                                    if (!selected) {
                                                        return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                                                    }
                                                    return selected;
                                                }}
                                                sx={{
                                                    height: "48px",
                                                    borderRadius: "13px",
                                                    border: "1px solid #00000020", // Default border
                                                    "&:hover": {
                                                        border: "1px solid #00000020", // Same border on hover
                                                    },
                                                    "& .MuiOutlinedInput-notchedOutline": {
                                                        border: "none", // Remove the default outline
                                                    },
                                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        border: "none", // Remove outline on focus
                                                    },
                                                    "&.MuiSelect-select": {
                                                        py: 0, // Optional padding adjustments
                                                    },
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: "30vh", // Limit dropdown height
                                                            overflow: "auto", // Enable scrolling in dropdown
                                                            scrollbarWidth: "none",
                                                            // borderRadius: "10px"
                                                        },
                                                    },
                                                }}
                                            >
                                                {
                                                    timeZones.map((item, index) => {
                                                        return (
                                                            <MenuItem
                                                                className='w-full'
                                                                value={item}
                                                                key={index}
                                                            >
                                                                <button onClick={() => {
                                                                    console.log("Selected time zone is:", item);
                                                                }}
                                                                >
                                                                    {item}
                                                                </button>
                                                            </MenuItem>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className='w-full mt-4'>
                                        {
                                            calenderLoader ?
                                                <div className='w-full flex flex-row items-center justify-center'>
                                                    <CircularProgress size={25} />
                                                </div> :
                                                <button
                                                    disabled={!isEnabled()}
                                                    className='h-[50px] w-full text-white rounded-xl'
                                                    style={{
                                                        fontWeight: "600", fontSize: 16,
                                                        backgroundColor: !isEnabled() ? "#00000060" : "#7902DF"
                                                    }}
                                                    onClick={handleAddCalender}
                                                >
                                                    Add
                                                </button>
                                        }
                                    </div>
                                </div>

                            </div>


                        </div>
                    </Box>
                </Modal>


            </div>
        </div>
    )
}

export default UserCalender