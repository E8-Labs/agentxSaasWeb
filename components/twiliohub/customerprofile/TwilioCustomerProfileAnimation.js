import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Button, CircularProgress, Modal, TextField } from "@mui/material";
// import { useRouter } from "next/navigation";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import GeneralInfo from "./GeneralInfo";
import BusinessInfo from "./BusinessInfo";
import ContactPoint from "./ContactPoint";

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

const TwilioCustomerProfileAnimation = ({
    showModal
}) => {

    const [loader, setLoader] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    //variables storing the data for passing
    //General Info
    const [legalBusinessName, setLegalBusinessName] = useState("");
    const [profileFirendlyName, setProfileFriendlyName] = useState("");
    //physical business address
    const [country, setCountry] = useState("");
    const [street1, setStreet1] = useState("");
    const [street2, setStreet2] = useState("");
    const [city, setCity] = useState("");
    const [provience, setProvience] = useState("");
    const [postalCode, setPostalCode] = useState("");

    //business info
    const [customerType, setCustomerType] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [businessIndustry, setBusinessIndustry] = useState("");
    const [businessRegIdType, setBusinessRegIdType] = useState("");
    const [businessRegNumber, setBusinessRegNumber] = useState("");
    const [businessOperatingRegion, setBusinessOperatingRegion] = useState("");

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

    }

    return (
        <div className="h-[100%] overflow-hidden">
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
                        className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
                    // style={styles.motionDiv}
                    >
                        <div className="h-[100%] w-full">
                            <GeneralInfo
                                legalBusinessNameP={legalBusinessName}
                                profileFirendlyNameP={profileFirendlyName}
                                countryP={country}
                                street1P={street1}
                                street2P={street2}
                                cityP={city}
                                provienceP={provience}
                                postalCodeP={postalCode}
                                handleContinueP={handleContinue}
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
                        className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
                    // style={styles.motionDiv}
                    >
                        <div className="h-[100%] w-full">
                            <BusinessInfo
                                handleContinue={handleContinue}
                                handleBack={handleBack}
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
                        className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
                    >
                        <div className="h-[100%] w-full">
                            <ContactPoint
                                // handleContinue={handleContinue}
                                handleBack={handleBack}
                            />
                        </div>
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
    );
}

export default TwilioCustomerProfileAnimation;


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



// <Modal
//             open={true}
//             // onClose={() => {
//             //     handleClose();
//             // }}
//             // BackdropProps={{
//             //     timeout: 200,
//             //     sx: {
//             //         backgroundColor: "#00000020",
//             //         zIndex: 1200, // Keep backdrop below Drawer
//             //     },
//             // }}
//             sx={{
//                 zIndex: 1300,
//                 // backgroundColor: "red"
//             }}
//         >
//             <Box
//                 // className="rounded-xl max-w-2xl w-full shadow-lg h-[100%] border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col"
//                 className="w-full h-[100%]"
//             >
//             </Box>
//         </Modal>