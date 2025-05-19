import React, { useEffect, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import ProgressBar from "../ProgressBar";
import { borderColor, Box } from "@mui/system";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import {
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Modal,
    Select,
} from "@mui/material";
import Image from "next/image";
import timeZones from "@/utilities/Timezones";
import VideoCard from "@/components/createagent/VideoCard";
import IntroVideoModal from "@/components/createagent/IntroVideoModal";
import { HowtoVideos, PersistanceKeys } from "@/constants/Constants";
import AgentSelectSnackMessage, {
    SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";

const AddNewCalendar = ({
    handleContinue,
    showModal
}) => {
    const [calenderLoader, setAddCalenderLoader] = useState(false);
    const [shouldContinue, setshouldContinue] = useState(true);

    const [snackMessage, setSnackMessage] = useState({
        type: SnackbarTypes.Success,
        message: "Calendar added successfully!",
        isVisible: false,
    });

    const [videoPlace, setVideoPlace] = useState(null);

    const [calenderTitle, setCalenderTitle] = useState("");
    const [calenderApiKey, setCalenderApiKey] = useState("");
    const [eventId, setEventId] = useState("");

    const [selectCalender, setSelectCalender] = useState("");
    const [initialLoader, setInitialLoader] = useState(false);
    const [previousCalenders, setPreviousCalenders] = useState([]);
    const [showAddNewCalender, setShowAddNewCalender] = useState(false);
    const [introVideoModal, setIntroVideoModal] = useState(false);
    const [calendarSelected, setCalendarSelected] = useState(null);

    const [showSnack, setShowSnak] = useState(false);

    //code for the IANA time zone lists

    const [selectTimeZone, setSelectTimeZone] = useState("");

    useEffect(() => {
        getAgentDetails()
        let screenwidth = window.innerWidth;
        if (screenwidth < 640) {
            setVideoPlace(false);
        } else {
            setVideoPlace(true);
        }
        getCalenders();
    }, []);

    // useEffect(() => {
    // if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
    // setshouldContinue(false);
    // } else {
    // setshouldContinue(true);
    // }
    // }, [calenderTitle, calenderApiKey, eventId, selectTimeZone]);

    function isEnabled() {
        if (calendarSelected) {
            // //console.log;
            return true;
        }
        if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
            // //console.log;
            return true;
        } else {
            // //console.log;
            return false;
        }
    }


    const getAgentDetails = async () => {
        //console.log
        try {
            const data = localStorage.getItem("User")

            if (data) {
                let u = JSON.parse(data)
                // //console.log

                let ag = localStorage.getItem(PersistanceKeys.LocalSavedAgentDetails)

                if (ag) {
                    let agent = JSON.parse(ag)

                    //console.log
                    let apiPath = Apis.getAgentDetails + "?mainAgentId=" + agent?.id

                    //console.log

                    const response = await axios.get(apiPath, {
                        headers: {
                            "Authorization": "Bearer " + u.token
                        }
                    })
                    //console.log

                    if (response.data) {
                        //console.log
                        if (response.data.status === true) {
                            localStorage.setItem(
                                PersistanceKeys.LocalSavedAgentDetails,
                                JSON.stringify(response.data.data)
                            );
                        }
                    }
                }
            }
        } catch (e) {
            //console.log
        }
    }

    //code for the dropdown selection
    const handleChange = (event) => {
        const selectedTitle = event.target.value;
        setSelectCalender(selectedTitle);

        const selected = previousCalenders.find(cal => cal.title === selectedTitle);
        setCalendarSelected(selected || null);
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

            // //console.log;

            const ApiPath = Apis.getCalenders;

            // //console.log;

            const response = await axios.get(ApiPath, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                },
            });

            if (response) {
                // //console.log;
                setPreviousCalenders(response.data.data);
            }
        } catch (error) {
            // console.error("Error occured in the api is ", error);
        } finally {
            setInitialLoader(false);
        }
    };

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
                // //console.log;
                currentAgentDetails = agentData;
            }

            // //console.log;
            const ApiPath = Apis.addCalender;
            // //console.log;

            const formData = new FormData();

            formData.append(
                "apiKey",
                calendarSelected ? calendarSelected.apiKey : calenderApiKey
            );
            formData.append(
                "title",
                calendarSelected ? calendarSelected.title : calenderTitle
            );
            if (currentAgentDetails?.id) {
                formData.append("mainAgentId", currentAgentDetails?.id);
            }
            // if (selectTimeZone) {
            formData.append(
                "timeZone",
                calendarSelected ? calendarSelected?.timeZone : selectTimeZone
            );
            // }

            // if (eventId) {
            formData.append(
                "eventId",
                calendarSelected ? calendarSelected?.eventId : eventId
            );
            // }

            for (let [key, value] of formData.entries()) {
                console.log(`${key} = ${value}`);
            }
            console.log("Key updated");

            // return
            const response = await axios.post(ApiPath, formData, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                },
            });
            //console.log;
            if (response) {
                // //console.log;

                if (response.data.status === true) {
                    // setShowSnak(true);
                    setSnackMessage({
                        message: "Calendar added successfully!",
                        type: SnackbarTypes.Success,
                        isVisible: true,
                    });
                    const localData = localStorage.getItem("User");
                    if (localData) {
                        let D = JSON.parse(localData);
                        D.user.checkList.checkList.calendarCreated = true;
                        localStorage.setItem("User", JSON.stringify(D));
                    }
                    window.dispatchEvent(
                        new CustomEvent("UpdateCheckList", { detail: { update: true } })
                    );
                    handleContinue();
                } else {
                    setSnackMessage({
                        message: response.data.message,
                        type: SnackbarTypes.Error,
                        isVisible: true,
                    });
                }
            }
        } catch (error) {
            setSnackMessage({
                message: error.message,
                type: SnackbarTypes.Error,
                isVisible: true,
            });
            console.error("Error occured in api is:", error);
        } finally {
            setAddCalenderLoader(false);
        }
    };

    //code to select the time zone
    const handleChangeTimeZone = (event) => {
        setSelectTimeZone(event.target.value);
    };

    const styles = {
        inputStyles: {
            fontWeight: "500",
            fontSize: 15,
            borderColor: "#00000020",
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
    };

    return (
        <div
            style={{ width: "100%" }}
            className="overflow-y-none flex flex-row justify-center items-center"
        >
            <AgentSelectSnackMessage
                type={snackMessage.type}
                message={snackMessage.message}
                isVisible={snackMessage.isVisible}
                hide={() => {
                    setSnackMessage({
                        message: "",
                        isVisible: false,
                        type: SnackbarTypes.Success,
                    });
                }}
            />
            <div className="bg-white rounded-2xl w-10/12 py-4 flex flex-col">
                <Modal
                    open={showModal}
                // onClose={() => {
                // setShowAddNewCalender(false);
                // }}
                >
                    <Box
                        className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
                        sx={{
                            ...styles.modalsStyle,
                            backgroundColor: "white",
                            paddingInline: "25px",
                            paddingTop: "25px",
                            paddingBottom: "30px",
                        }}
                    >
                        <div style={{ width: "100%" }}>
                            <div className="" style={{ scrollbarWidth: "none" }}>
                                <div className="w-full">
                                    <div className="w-full flex flex-row justify-end">
                                        <button
                                            className="outline-none"
                                            onClick={() => {
                                                setShowAddNewCalender(false);
                                                setCalenderTitle("");
                                                setCalenderApiKey("");
                                                setEventId("");
                                                setSelectTimeZone("");
                                                handleContinue();
                                            }}
                                        >
                                            <Image
                                                src={"/assets/blackBgCross.png"}
                                                height={20}
                                                width={20}
                                                alt="*"
                                            />
                                        </button>
                                    </div>

                                    <div
                                        className="mt-4"
                                        style={{
                                            fontWeight: "600",
                                            fontSize: 16.8,
                                            textAlign: "start",
                                        }}
                                    >
                                        Calender title
                                    </div>
                                    <div>
                                        <input
                                            className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                                            placeholder="Type here"
                                            style={styles.inputStyles}
                                            value={calenderTitle}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                setCalenderTitle(value);
                                            }}
                                        />
                                    </div>
                                    <div
                                        className="mt-4"
                                        style={{
                                            fontWeight: "600",
                                            fontSize: 16.8,
                                            textAlign: "start",
                                        }}
                                    >
                                        Api key
                                    </div>
                                    <div>
                                        <input
                                            className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                                            placeholder="Type here"
                                            style={styles.inputStyles}
                                            value={calenderApiKey}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                setCalenderApiKey(value);
                                            }}
                                        />
                                    </div>
                                    <div
                                        className="mt-4"
                                        style={{
                                            fontWeight: "600",
                                            fontSize: 16.8,
                                            textAlign: "start",
                                        }}
                                    >
                                        Event id
                                    </div>
                                    <div>
                                        <input
                                            className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                                            placeholder="Type here"
                                            style={styles.inputStyles}
                                            value={eventId}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                setEventId(value);
                                            }}
                                        />
                                    </div>

                                    <div
                                        className="mt-4"
                                        style={{
                                            fontWeight: "600",
                                            fontSize: 16.8,
                                            textAlign: "start",
                                        }}
                                    >
                                        Select timezone
                                    </div>

                                    <div className="w-full mt-2">
                                        <FormControl sx={{}} className="w-full h-[50px]">
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
                                                {timeZones.map((item, index) => {
                                                    return (
                                                        <MenuItem
                                                            className="w-full"
                                                            value={item}
                                                            key={index}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    // //console.log;
                                                                }}
                                                            >
                                                                {item}
                                                            </button>
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    </div>

                                    <div className="w-full mt-4">
                                        {calenderLoader ? (
                                            <div className="w-full flex flex-row items-center justify-center">
                                                <CircularProgress size={35} />
                                            </div>
                                        ) : (
                                            <button
                                                disabled={!isEnabled()}
                                                className="h-[50px] w-full text-white rounded-xl"
                                                style={{
                                                    fontWeight: "600",
                                                    fontSize: 16,
                                                    backgroundColor: !isEnabled()
                                                        ? "#00000020"
                                                        : "#7902DF",
                                                    color: !isEnabled() ? "#000000" : "",
                                                }}
                                                onClick={handleAddCalender}
                                            >
                                                Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Box>
                </Modal>
            </div>
        </div>
    );
};

export default AddNewCalendar;
