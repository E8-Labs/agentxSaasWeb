import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Button, CircularProgress, Modal, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import PauseSubscription from "./PauseSubscription";
import ClaimGift from "./ClaimGift";
import CloseBtn from "@/components/globalExtras/CloseBtn";
import ObtainOffer from "./ObtainOfer";
import CancelConfirmation from "./CancelConfirmation";
import CancelationFinalStep from "./CancelationFinalStep";
import CancelationCompleted from "./CancelationCompleted";
import { getDiscount } from "@/components/userPlans/UserPlanServices";

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

export default function CancelPlanAnimation({
    showModal,
    handleClose,
    userLocalData,
    setShowSnak,
    isPaused,

}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        getCUrrentComponent()
    }, [showModal])

    const getCUrrentComponent = async () => {
        console.log('userLocalData', userLocalData?.subscriptionPauseUsed)
        if (isPaused || userLocalData?.subscriptionPauseUsed > 0) {
            if (
                userLocalData?.isTrial === false &&
                userLocalData?.cancelPlanRedemptions === 0
            ) {
                setDirection(1);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            } else {
                let data = await getDiscount()

                console.log('data', data)
                if (data?.discountOffer?.alreadyUsed === false) {
                    setDirection(1);
                    setCurrentIndex((prevIndex) => prevIndex + 2);
                } else {
                    setDirection(1);
                    setCurrentIndex((prevIndex) => prevIndex + 3);
                }
            }
        }
    }


    const handleContinue = async (nextAction) => {
        console.log('currentIndex', currentIndex)
        if (nextAction) {
            console.log(nextAction);
            if (nextAction === "closeModel") {
                handleClose()
                setCurrentIndex(0)
            } else if (nextAction == "claimGift") {
                if (
                    userLocalData?.isTrial === false &&
                    userLocalData?.cancelPlanRedemptions === 0
                ) {
                    setDirection(1);
                    setCurrentIndex((prevIndex) => prevIndex + 1);
                } else {
                    let data = await getDiscount()

                    console.log('data', data)
                    if (data?.discountOffer?.alreadyUsed === false) {
                        setDirection(1);
                        setCurrentIndex((prevIndex) => prevIndex + 2);
                    } else {
                        setDirection(1);
                        setCurrentIndex((prevIndex) => prevIndex + 3);
                    }


                }

            } else if (nextAction === "obtainOffer") {
                setDirection(1);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            } else if (nextAction === "cancelConfirmationFromGift") {
                let data = await getDiscount()

                console.log('data', data)
                if (data?.discountOffer?.alreadyUsed === false) {
                    setDirection(1);
                    setCurrentIndex((prevIndex) => prevIndex + 1);
                } else {
                    setDirection(1);
                    setCurrentIndex((prevIndex) => prevIndex + 2);
                }
            } else if (nextAction === "cancelConfirmationFromDeal") {
                setDirection(1);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            } else if (nextAction === "finalStep") {
                setDirection(1);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            } else if (nextAction === "completeCancelation") {
                setDirection(1);
                setCurrentIndex((prevIndex) => prevIndex + 1);
            }


        }
    }

    const handleBack = () => {
        setDirection(-1);
        setCurrentIndex((prevIndex) => prevIndex - 1);
    };

    //code to close modal
    const handleCloseModal = () => {
        handleClose();

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
                                className="rounded-lg w-[70%] bg-white p-6 border-none outline-none"
                            // style={styles.motionDiv}
                            >
                                <div className="w-full">
                                    <div className="flex flex-row justify-end">
                                        <CloseBtn
                                            onClick={() => {
                                                handleClose()
                                                setCurrentIndex(0)
                                            }}
                                        />
                                    </div>
                                    <PauseSubscription handleContinue={handleContinue} setShowSnak={setShowSnak} />
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
                                className="rounded-lg w-[70%]   bg-white p-6 border-none outline-none"
                            // style={styles.motionDiv}
                            >
                                <div className="">
                                    <div className="flex flex-row justify-end">
                                        <CloseBtn
                                            onClick={() => {
                                                handleClose()
                                                setCurrentIndex(0)
                                            }}
                                        />
                                    </div>
                                    <ClaimGift
                                        handleContinue={handleContinue}
                                        setShowSnak={setShowSnak}
                                    />
                                </div>
                            </motion.div>
                        )}


                        {currentIndex === 2 && (
                            <motion.div
                                key="box2"
                                custom={direction}
                                variants={boxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0 }}
                                className="rounded-lg w-[70%]  bg-white p-6 border-none outline-none"
                            // style={styles.motionDiv}
                            >
                                <div className="">
                                    <div className="flex flex-row justify-end">
                                        <CloseBtn
                                            onClick={() => {
                                                handleClose()
                                                setCurrentIndex(0)
                                            }}
                                        />
                                    </div>
                                    <ObtainOffer
                                        handleContinue={handleContinue}
                                        setShowSnak={setShowSnak}
                                    />
                                </div>
                            </motion.div>
                        )}


                        {currentIndex === 3 && (
                            <motion.div
                                key="box2"
                                custom={direction}
                                variants={boxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0 }}
                                className="rounded-lg w-[70%] bg-white h-auto p-6 border-none outline-none"
                            // style={styles.motionDiv}
                            >
                                <div className="">
                                    <div className="flex flex-row justify-end">
                                        <CloseBtn
                                            onClick={() => {
                                                handleClose()
                                                setCurrentIndex(0)
                                            }}
                                        />
                                    </div>
                                    <CancelConfirmation
                                        handleContinue={handleContinue}
                                        setShowSnak={setShowSnak}
                                    />

                                </div>
                            </motion.div>
                        )}

                        {currentIndex === 4 && (
                            <motion.div
                                key="box2"
                                custom={direction}
                                variants={boxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0 }}
                                className="rounded-lg w-[70%] bg-white h-auto p-6 border-none outline-none"
                            // style={styles.motionDiv}
                            >
                                <div className="">
                                    <div className="flex flex-row justify-end">
                                        <CloseBtn
                                            onClick={() => {
                                                handleClose()
                                                setCurrentIndex(0)
                                            }}
                                        />
                                    </div>
                                    <CancelationFinalStep
                                        handleContinue={handleContinue}
                                        setShowSnak={setShowSnak}
                                    />

                                </div>
                            </motion.div>
                        )}

                        {currentIndex === 5 && (
                            <motion.div
                                key="box2"
                                custom={direction}
                                variants={boxVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0 }}
                                className="rounded-lg w-[70%] h-auto bg-white p-6 border-none outline-none"
                            // style={styles.motionDiv}
                            >
                                <div className="">
                                    <div className="flex flex-row justify-end">
                                        <CloseBtn
                                            onClick={() => {
                                                handleClose()
                                                setCurrentIndex(0)
                                            }}
                                        />
                                    </div>
                                    <CancelationCompleted
                                        handleContinue={handleContinue}
                                    />

                                </div>
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