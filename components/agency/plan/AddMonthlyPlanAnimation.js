import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Button, CircularProgress, Modal, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import AddMonthlyPlan from "./AddMonthlyPlan";
import PlanConfiguration from "./PlanConfiguration";

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

export default function AddMonthlyPlanAnimation({
    open,
    handleClose,
    canAddPlan,
    agencyPlanCost,
    isEditPlan,
    selectedPlan,
    selectedAgency,
    onPlanCreated
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [basicsData, setBasicsData] = useState({});
    const [configurationData, setConfigurationData] = useState({});

    //variables storing data

    const handleContinue = (formData) => {
        if (formData) {
            console.log("form data passed is", formData);
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
        setCurrentIndex(0);
        setBasicsData({});
        setConfigurationData({});
        handleClose();
    }

    return (
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
                            <AddMonthlyPlan
                                open={open}
                                handleClose={handleClose}
                                canAddPlan={canAddPlan}
                                agencyPlanCost={agencyPlanCost}
                                isEditPlan={isEditPlan}
                                selectedPlan={selectedPlan}
                                selectedAgency={selectedAgency}
                                basicsData={basicsData}
                                handleContinue={(data) => {
                                    setBasicsData(data);
                                    console.log("Data recieved is", data)
                                    handleContinue();
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
                            <PlanConfiguration
                                basicsData={basicsData}
                                handleBack={handleBack}
                                open={open}
                                handleClose={handleCloseModal}
                                onPlanCreated={onPlanCreated}
                                isEditPlan={isEditPlan}
                                selectedPlan={selectedPlan}
                                selectedAgency={selectedAgency}
                                configurationData={configurationData}
                                setConfigurationData={setConfigurationData}
                            />
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
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