import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Button, CircularProgress, Modal, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import AssignLead from "./AssignLead";
import LastStep from "./LastStep";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import dayjs from "dayjs";
import AllowSmartRefillPopup from "../AllowSmartRefillPopup";
import { SmartRefillApi } from "@/components/onboarding/extras/SmartRefillapi";

const boxVariants = {
    enter: (direction) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0.4,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0.4,
    }),
};

export default function AssignLeadAnimation({
    showModal,
    handleClose,
    //for assignlead file
    selectedLead,
    leadIs,
    selectedAll,
    filters,
    totalLeads,
    userProfile,
    //after lead assigned
    handleCloseAssignLeadModal
}) {

    const [loader, setLoader] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    //selectedAgents
    const [SelectedAgents, setSelectedAgents] = useState([]);
    const [oldAgents, setOldAgents] = useState([]);

    //variables storing data
    const [subFormData, setSubFormData] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");
    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [xBarOptions, setXBarOptions] = useState([]);
    //assign lead data sending in api
    const [selectedDateTime, setSelectedDateTime] = useState(null);
    const [NoOfLeadsToSend, setNoOfLeadsToSend] = useState("");
    const [customLeadsToSend, setCustomLeadsToSend] = useState("");
    const [CallNow, setCallNow] = useState("");
    const [CallLater, setCallLater] = useState(false);
    const [isDncChecked, setIsDncChecked] = useState(false);

    //last step modal data
    const [lastStepData, setLastStepData] = useState({});

    //refill loader
    const [smartRefillLoader, setSmartRefillLoader] = useState(false);
    const [smartRefillLoaderLater, setSmartRefillLoaderLater] = useState(false);

    //handle Assign after values added
    const [shouldAssignLead, setShouldAssignLead] = useState(false);

    useEffect(() => {
        if (shouldAssignLead) {
            handleAssignLead();
            setShouldAssignLead(false); // reset flag
        }
    }, [selectedDateTime, NoOfLeadsToSend, customLeadsToSend, CallNow, isDncChecked, CallLater, lastStepData]);


    const handleContinue = (formData) => {
        if (formData) {
            console.log(formData);
        }
        setDirection(1);
        setCurrentIndex((prevIndex) => prevIndex + 1);
    };

    const handleBack = () => {
        setDirection(-1);
        setCurrentIndex((prevIndex) => prevIndex - 1);
    };

    //reset value on modal close
    const resetValues = () => {
        setSelectedAgents([]);
        setSelectedDateTime(null);
        setNoOfLeadsToSend("");
        setCustomLeadsToSend("");
        setCallNow("");
        setCallLater(false);
        setIsDncChecked(false);
        setLastStepData({});
    }

    //assign lead
    const handleAssignLead = async () => {

        let userTimeZone = userProfile.timeZone || "America/Los_Angeles";
        const selectedDate = dayjs(selectedDateTime).tz(userTimeZone); // Convert input date to Day.js object
        const currentHour = selectedDate.hour(); // Get the current hour (0-23)
        const currentMinute = selectedDate.minute(); // Get minutes for 8:30 PM check
        //console.log;
        //console.log;
        //console.log;
        //console.log;

        const isAfterStartTime = currentHour >= 7; // || (selectedHour === 7 && selectedMinute >= 0); // 7:00 AM or later
        const isBeforeEndTime =
            currentHour < 20 || (currentHour === 20 && currentMinute <= 30); // Before 8:30 PM
        if (
            isAfterStartTime && // After 7:00 AM
            isBeforeEndTime // Before 8:30 PM
        ) {
            console.log(
                "✅ Selected time is between 7 AM and 8:30 PM.",
                selectedDate.format()
            );
            // setSelectedDateTime(selectedDate);
        } else {
            //console.log;
            // setInvalidTimeMessage(
            //   "Calls only between 7am-8:30pm"
            //   // "Calling is only available between 7AM and 8:30PM in " + userTimeZone
            // );
            // return;
        }

        // return;

        try {
            setLoader(true);
            const startTime = Date.now();

            let timer = null;
            let batchSize = null;

            if (customLeadsToSend) {
                batchSize = customLeadsToSend;
            } else if (NoOfLeadsToSend) {
                batchSize = NoOfLeadsToSend;
            }

            if (CallNow) {
                console.log("Call now");
                timer = 0;
            } else if (CallLater) {
                console.log("Call later");
                const currentDateTime = dayjs(); // Get current date and time using Day.js

                const differenceInMilliseconds = selectedDateTime.diff(currentDateTime); // Difference in ms
                console.log("selectedDate is", differenceInMilliseconds);
                const minutes = differenceInMilliseconds / (1000 * 60); // Convert ms to minutes
                timer = minutes.toFixed(0); // Round to nearest integer

                // //console.log;
                // //console.log;
                // //console.log;
            }

            let Apidata = {
                pipelineId: SelectedAgents[0].pipeline.id,
                mainAgentIds: SelectedAgents.map((item) => item.id),
                leadIds: leadIs,
                startTimeDifFromNow: timer,
                batchSize: batchSize,
                selectedAll: selectedAll,
                dncCheck: isDncChecked ? true : false,
            };

            // console.log("Data sending in api is", Apidata);
            // return;
            if (filters && selectedAll) {
                Apidata = {
                    pipelineId: SelectedAgents[0].pipeline.id,
                    mainAgentIds: SelectedAgents.map((item) => item.id),
                    leadIds: leadIs,
                    startTimeDifFromNow: timer,
                    batchSize: batchSize,
                    selectedAll: selectedAll,
                    dncCheck: isDncChecked,
                    ...filters,
                };
            }

            //console.log;
            // return;
            const localData = localStorage.getItem("User");
            let AuthToken = null;
            if (localData) {
                const UserDetails = JSON.parse(localData);
                AuthToken = UserDetails.token;
            }

            console.log("Data sending in api is", Apidata);
            // return
            const ApiPath = Apis.assignLeadToPipeLine;

            // //console.log;

            const response = await axios.post(ApiPath, Apidata, {
                headers: {
                    Authorization: "Bearer " + AuthToken,
                    "Content-Type": "application/json",
                },
            });

            const endTime = Date.now(); // record end time
            const duration = endTime - startTime; // in milliseconds

            console.log("API Response time (ms):", duration);

            if (duration > 30000) {
                console.log("⚠️ API response took MORE than 30 seconds!");
                handleClose({
                    status: false,
                    showSnack: "Lead assigned",
                    disSelectLeads: true,
                });
                resetValues();
                const localData = localStorage.getItem("User");
                if (localData) {
                    let D = JSON.parse(localData);
                    D.user.checkList.checkList.callsCreated = true;
                    localStorage.setItem("User", JSON.stringify(D));
                }
                window.dispatchEvent(
                    new CustomEvent("UpdateCheckList", { detail: { update: true } })
                );
            } else {
                console.log("✅ API response took LESS than 30 seconds.");
            }

            if (response) {
                // //console.log;
                setCurrentIndex(0);
                if (response.data.status === true) {
                    handleClose({
                        status: false,
                        showSnack: "Lead assigned",
                        disSelectLeads: true,
                    });
                    resetValues();
                    const localData = localStorage.getItem("User");
                    if (localData) {
                        let D = JSON.parse(localData);
                        D.user.checkList.checkList.callsCreated = true;
                        localStorage.setItem("User", JSON.stringify(D));
                    }
                    window.dispatchEvent(
                        new CustomEvent("UpdateCheckList", { detail: { update: true } })
                    );
                    // setLastStepModal(false);
                    // window.location.reload();
                } else if (response.data.status === false) {
                    handleClose({
                        status: true,
                        showSnack: "Error assigning lead",
                        disSelectLeads: false,
                    });
                    resetValues();
                }
            }
        } catch (error) {
            // console.error("Error occured in api is", error);
            // clearTimeout(timeout);
            // console.error("Request failed:", error);
            // if (!timeoutTriggered) {
            //     handleClose({
            //         status: true,
            //         showSnack: "Error assigning lead",
            //         disSelectLeads: false,
            //     });
            //     resetValues();
            // }
            setSmartRefillLoader(false);
            setSmartRefillLoaderLater(false);
        } finally {
            setLoader(false);
            setSmartRefillLoader(false);
            setSmartRefillLoaderLater(false);
        }
    };

    //refill later
    const handleSmartRefillLater = async () => {
        try {
            setSmartRefillLoaderLater(true);
            handleAssignLead();
        } catch (error) {
            setSmartRefillLoaderLater(false);
            console.error("Error occured is", error);
        }
    };

    //allow smart refill then assign lead
    const handleSmartRefill = async () => {
        try {
            setSmartRefillLoader(true);
            const response = await SmartRefillApi();
            if (response.data.status === true) {
                handleAssignLead();
            }
        } catch (error) {
            setSmartRefillLoader(false);
            console.error("Error occured is", error);
        }
    };


    return (
        <Modal
            open={showModal}
            // onClose={() => {
            //     handleClose();
            // }}
            // BackdropProps={{
            //     timeout: 200,
            //     sx: {
            //         backgroundColor: "#00000020",
            //         zIndex: 1200, // Keep backdrop below Drawer
            //     },
            // }}
            sx={{
                zIndex: 1300, // Keep Modal below the Drawer
                // backgroundColor: "red"
            }}
        >
            <Box
                className="rounded-xl max-w-2xl w-full shadow-lg max-h-[90vh] border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col"
            >
                <div className="relative flex justify-center items-center w-full">
                    <AnimatePresence initial={false} custom={direction}>
                        {currentIndex === 0 && (
                            <motion.div
                                key="box1"
                                custom={direction}
                                variants={boxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0 }}
                                className="rounded-lg w-[100%] bg-white p-6 border-none outline-none"
                            // style={styles.motionDiv}
                            >
                                <div className="">
                                    <AssignLead
                                        selectedLead={selectedLead}
                                        handleCloseAssignLeadModal={() => {
                                            handleClose({
                                                status: false,
                                                showSnack: "",
                                                disSelectLeads: true,
                                            }); //(false, showSnack, disSelectLeads)
                                            resetValues();
                                        }}
                                        leadIs={leadIs}
                                        selectedAll={selectedAll}
                                        filters={filters}
                                        totalLeads={totalLeads}
                                        userProfile={userProfile} // this is the .user object doesn't include token
                                        oldAgents={oldAgents}
                                        handleContinue={({ SelectedAgents, agentsList }) => {
                                            console.log("Selected agent is", SelectedAgents);
                                            setSelectedAgents(SelectedAgents);
                                            console.log("agents passed are", agentsList);
                                            setOldAgents(agentsList);
                                            handleContinue();
                                        }}
                                        selectedAgents={SelectedAgents}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {currentIndex === 1 && (
                            <motion.div
                                key="box2"
                                custom={direction}
                                variants={boxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0 }}
                                className="rounded-lg w-[100%] bg-white p-6 border-none outline-none"
                            // style={styles.motionDiv}
                            >
                                <div className="">
                                    <LastStep
                                        selectedLead={selectedLead}
                                        leadIs={leadIs}
                                        selectedAll={selectedAll}
                                        filters={filters}
                                        totalLeads={totalLeads}
                                        userProfile={userProfile}
                                        handleBack={(D) => {
                                            if (D) {
                                                console.log("Data ppassed is", D);
                                                setSelectedDateTime(D.selectedDate);
                                                setNoOfLeadsToSend(D.numberOfLeads);
                                                setCustomLeadsToSend(D.cutomLeads);
                                                setCallNow(D.isCallNow);
                                                setIsDncChecked(D.DncChecked);
                                                setCallLater(D.callL);
                                                setLastStepData(D);
                                            }
                                            handleBack()
                                        }}
                                        lastStepData={lastStepData}
                                        handleContinue={(D) => {
                                            console.log("Data ppassed is", D);
                                            setSelectedDateTime(D.selectedDate);
                                            setNoOfLeadsToSend(D.numberOfLeads);
                                            setCustomLeadsToSend(D.cutomLeads);
                                            setCallNow(D.isCallNow);
                                            setIsDncChecked(D.DncChecked);
                                            setCallLater(D.callL);
                                            setLastStepData(D);
                                            const localData = localStorage.getItem("User");
                                            if (localData) {
                                                const UserDetails = JSON.parse(localData);
                                                console.log(UserDetails.user.smartRefill);
                                                if (UserDetails.user.smartRefill === false) {
                                                    // setShowSmartRefillPopUp(true);
                                                    //handle continue here
                                                    handleContinue();
                                                    return;
                                                }
                                            }
                                            setShouldAssignLead(true);
                                            // setTimeout(() => {
                                            //     handleAssignLead();
                                            // }, 300);
                                            // handleAssignLead();
                                        }}
                                        loader={loader}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {currentIndex === 2 && (
                            <motion.div
                                key="box3"
                                custom={direction}
                                variants={boxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0 }}
                                className="rounded-lg w-[100%] bg-white p-6 border-none outline-none"
                            >
                                <AllowSmartRefillPopup
                                    // showSmartRefillPopUp={showSmartRefillPopUp}
                                    handleCloseReillPopup={() => {
                                        handleBack();
                                    }}
                                    smartRefillLoader={smartRefillLoader}
                                    smartRefillLoaderLater={smartRefillLoaderLater}
                                    handleSmartRefillLater={handleSmartRefillLater}
                                    handleSmartRefill={handleSmartRefill}
                                    loader={loader}
                                />
                            </motion.div>
                        )}

                        {currentIndex === 3 && (
                            <motion.div
                                key="box4"
                                custom={direction}
                                variants={boxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0 }}
                                className="p-6 rounded-lg w-[100%] shadow-lg bg-white border-none outline-none"
                            >
                                S_4
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Box>
        </Modal>
    );
}


const styles = {
    text: {
        fontSize: 15,
        color: "#00000090",
        fontWeight: "600",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: "500",
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
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
    motionDiv: {
        // position: 'relative', // Ensures the boxes are stacked on top of each other
        // top: '0',
        // left: 0,
        // right: 0,
        // bottom: 0,
        // backgroundColor: "",
        // height: "20vh",
        // marginLeft: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto"
        // marginInline: 10,
    }
};