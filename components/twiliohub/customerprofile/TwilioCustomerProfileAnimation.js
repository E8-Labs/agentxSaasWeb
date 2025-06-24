import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Button, CircularProgress, Modal, TextField } from "@mui/material";
// import { useRouter } from "next/navigation";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import GeneralInfo from "./GeneralInfo";
import BusinessInfo from "./BusinessInfo";
import ContactPoint from "./ContactPoint";
import { AuthToken } from "@/components/agency/plan/AuthDetails";
import AgentSelectSnackMessage, { SnackbarTypes } from "@/components/dashboard/leads/AgentSelectSnackMessage";

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
    const [profileFriendlyName, setProfileFriendlyName] = useState("");
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

    //pointof contact
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [businessTitle, setBusinessTitle] = useState("");
    const [jobPosition, setJobPosition] = useState("");
    const [agreeTerms, setAgreeTerms] = useState(false);

    //snack messages
    const [snackMessage, setSnackMessage] = useState({
        type: SnackbarTypes.Success,
        message: "",
        isVisible: false,
    });
    // const [loader, setLoader] = useState(false);


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
        setCurrentIndex(0);
        setDirection(0);
        setLegalBusinessName("");
        setProfileFriendlyName("");
        setCountry("");
        setStreet1("");
        setStreet2("");
        setCity("");
        setProvience("");
        setPostalCode("");
        setCustomerType("");
        setBusinessType("");
        setBusinessIndustry("");
        setBusinessRegIdType("");
        setBusinessRegNumber("");
        setBusinessOperatingRegion("");
        setFirstName("");
        setLastName("");
        setBusinessTitle("2");
        setJobPosition("");
        setAgreeTerms(false);
    }

    //create trust hub profile

    const handleCreateTrusthubProfile = async () => {
        try {
            // setLoader(true);
            const ApiPath = Apis;
            const token = AuthToken();
            const formatString = (str) => {
                if (typeof str !== 'string' || str === null || str === undefined) {
                    return ''; // Or you could return the original string depending on your preference
                }
                return str.replace(/\s+/g, '').toLowerCase();
            };
            const ApiData = {
                friendlyName: profileFriendlyName,
                // email: "hello@myagentx.com",
                // policySid: "RNdfbf3fae0e1107f8aded0e7cead80bf5",
                legalName: legalBusinessName,
                // dbaName: "E8labs",
                addressStreet1: street1,
                addressStreet2: street2,
                city: city,
                state: provience,
                postalCode: postalCode,
                country: country,
                businessIdentity: customerType?.type,
                businessType: formatString(businessType),
                industry: formatString(businessIndustry),
                registrationIdType: formatString(businessRegIdType),
                registrationIdNumber: businessRegNumber,
                regionsOfOperation: businessOperatingRegion,
                // website: "https://www.e8-labs.com/",
                contactFirstName: firstName,
                contactLastName: lastName,
                // contactEmail: "hello@myagentx.com",
                // contactPhone: "+14086799068",
                // contactTitle: "Mr.",
                contactJobPosition: formatString(jobPosition),
                contactTermsAccepted: agreeTerms
            }

            console.log("Data sending in api is", ApiData);


            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of create trust hub profile api is", response.data);
                setLoader(false);
                if (response.data) {
                    const result = response.data;
                    if (result.status === true) {
                        setSnackMessage({
                            type: SnackbarTypes.Success,
                            message: result.message,
                            isVisible: true,
                        });
                        resetValues();
                    } else {
                        setSnackMessage({
                            type: SnackbarTypes.Error,
                            message: result.message,
                            isVisible: true,
                        });
                    }
                }
            }
        } catch (error) {
            setLoader(false);
            console.error("Error occured in creae trust hub profile api is:", error);
        }
    }


    return (
        <div className="h-[100%] overflow-hidden">
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
                                profileFriendlyNameP={profileFriendlyName}
                                countryP={country}
                                street1P={street1}
                                street2P={street2}
                                cityP={city}
                                provienceP={provience}
                                postalCodeP={postalCode}
                                handleContinue={(d) => {
                                    if (d) {
                                        setLegalBusinessName(d.legalBusinessName);
                                        setProfileFriendlyName(d.profileFriendlyName);
                                        setCountry(d.country);
                                        setStreet1(d.street1);
                                        setStreet2(d.street2);
                                        setCity(d.city);
                                        setProvience(d.provience);
                                        setPostalCode(d.postalCode);
                                    }
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
                        className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
                    // style={styles.motionDiv}
                    >
                        <div className="h-[100%] w-full">
                            <BusinessInfo
                                customerTypeP={customerType}
                                businessTypeP={businessType}
                                businessIndustryP={businessIndustry}
                                businessRegIdTypeP={businessRegIdType}
                                businessRegNumberP={businessRegNumber}
                                businessOperatingRegionP={businessOperatingRegion}
                                handleBack={handleBack}
                                handleContinue={(d) => {
                                    if (d) {
                                        setCustomerType(d.selectedCustomerType);
                                        setBusinessType(d.selectBusinessType);
                                        setBusinessIndustry(d.businessIndustry);
                                        setBusinessRegIdType(d.businessRegIdType);
                                        setBusinessRegNumber(d.businessRegNumber);
                                        setBusinessOperatingRegion(d.businessOperatingRegion);
                                    }
                                    handleContinue();
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
                        className="rounded-lg w-[100%] bg-white p-6 border-none outline-none h-[100%]"
                    >
                        <div className="h-[100%] w-full">
                            <ContactPoint
                                firstNameP={firstName}
                                lastNameP={lastName}
                                businessTitleP={businessTitle}
                                jobPositionP={jobPosition}
                                agreeTermsP={agreeTerms}
                                loaderP={loader}
                                handleBack={(d) => {
                                    setFirstName(d.firstName);
                                    setLastName(d.lastName);
                                    setBusinessTitle(d.businessTitle);
                                    setJobPosition(d.jobPosition);
                                    setAgreeTerms(d.agreeTerms);
                                    handleBack();
                                }}
                                handleContinue={(d) => {
                                    setFirstName(d.firstName);
                                    setLastName(d.lastName);
                                    setBusinessTitle(d.businessTitle);
                                    setJobPosition(d.jobPosition);
                                    setAgreeTerms(d.agreeTerms);
                                    setTimeout(() => {
                                        handleCreateTrusthubProfile();
                                    }, 100);
                                }}
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