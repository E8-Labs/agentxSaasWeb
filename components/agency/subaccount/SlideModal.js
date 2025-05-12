import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Button, CircularProgress, Modal, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import CreateSubAccountModal from "./CreateSubAccountModal";
import SetPricing from "./SetPricing";
import SetXBarOptions from "./SetXBarOptions";
import UserType from "@/components/onboarding/UserType";
import SubAccountUserType from "@/components/onboarding/extras/SubAccountUserType";

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

export default function SlideModal({
    showModal,
    handleClose
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    //variables storing data
    const [subFormData, setSubFormData] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");
    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [xBarOptions, setXBarOptions] = useState([]);

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

    //code to close modal
    const handleCloseModal = () => {
        handleClose();
        setSubFormData(null);
        setSelectedUser("");
        setMonthlyPlans([]);
        setXBarOptions([]);
        setCurrentIndex(0);
    }

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
                                    <CreateSubAccountModal
                                        onClose={handleCloseModal}
                                        selectedUser={selectedUser}
                                        formData={subFormData}
                                        onContinue={(formData) => {
                                            handleContinue(formData);
                                            setSubFormData(formData);
                                        }}
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
                                    <SubAccountUserType
                                        onClose={(u) => {
                                            console.log("selected user id is", u);
                                            handleBack();
                                            setSelectedUser(u);
                                        }}
                                        userData={selectedUser}
                                        onContinue={(u) => {
                                            handleContinue(u);
                                            setSelectedUser(u);
                                        }}
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
                                <SetPricing
                                    onClose={(monPlans) => {
                                        console.log("Monthlyplan id is", monPlans);
                                        handleBack();
                                        setMonthlyPlans(monPlans);
                                    }}
                                    onContinue={(monPlans) => {
                                        handleContinue(monPlans);
                                        setMonthlyPlans(monPlans);
                                    }}
                                    monPlans={monthlyPlans}
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
                                <SetXBarOptions
                                    onClose={(xBars) => {
                                        console.log("Xbars passed are", xBars);
                                        setXBarOptions(xBars);
                                        handleBack();
                                    }}
                                    formData={subFormData}
                                    selectedMonthlyPlans={monthlyPlans}
                                    xBars={xBarOptions}
                                    closeModal={() => {
                                        handleCloseModal()
                                    }}
                                    selectedUserType={selectedUser}
                                />
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