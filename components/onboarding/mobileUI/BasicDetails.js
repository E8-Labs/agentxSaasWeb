import Body from "@/components/onboarding/Body";
import Header from "@/components/onboarding/Header";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Footer from "@/components/onboarding/Footer";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import {
    Alert,
    Box,
    CircularProgress,
    Fade,
    Modal,
    Snackbar,
} from "@mui/material";
import VerificationCodeInput from "@/components/test/VerificationCodeInput";
import SendVerificationCode from "../services/AuthVerification/AuthService";
import SnackMessages from "../services/AuthVerification/SnackMessages";
import { setCookie } from "@/utilities/cookies";

const BasicDetails = ({ handleContinue, handleBack, length = 6, onComplete, handleDetails, userDetails }) => {
    const verifyInputRef = useRef([]);
    const timerRef = useRef(null);

    let inputsFields = useRef([]);

    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [showVerifyPopup, setShowVerifyPopup] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    let [response, setResponse] = useState({});
    const [registerLoader, setRegisterLoader] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    // const [emailErr, setEmailCheckResponse] = useState(false);
    const [userFarm, setUserFarm] = useState("");
    const [userBrokage, setUserBrokage] = useState("");
    const [userTransaction, setUserTransaction] = useState("");
    //phone number input variable
    const [userPhoneNumber, setUserPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [sendcodeLoader, setSendcodeLoader] = useState(false);
    const [userData, setUserData] = useState(null);
    const [phoneVerifiedSuccessSnack, setPhoneVerifiedSuccessSnack] =
        useState(false);
    //verify code input fields
    const [VerifyCode, setVerifyCode] = useState(Array(length).fill(""));
    //check email availability
    const [emailLoader, setEmailLoader] = useState(false);
    const [emailCheckResponse, setEmailCheckResponse] = useState(null);
    const [validEmail, setValidEmail] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);
    const [errMessage, setErrMessage] = useState(null);
    //check phone number availability
    const [phoneNumberLoader, setPhoneNumberLoader] = useState(false);
    const [checkPhoneResponse, setCheckPhoneResponse] = useState(null);
    const [locationLoader, setLocationLoader] = useState(false);
    const [shouldContinue, setShouldContinue] = useState(true);

    //congrats popup for small size screens
    const [congratsPopup, setCongratsPopup] = useState(false);

    //focus 1st field automaticallly
    useEffect(() => {
        if (userDetails) {
            setUserName(userDetails.name);
            setUserEmail(userDetails.email);
            setUserPhoneNumber(userDetails.phone);
        }
        // Focus the first input field on component load
        inputsFields.current[0]?.focus();
    }, []);

    // Function to get the user's location and set the country code
    useEffect(() => {



        handleDetails(userName, userEmail, userPhoneNumber);

        if (
            userName &&
            userEmail &&
            userPhoneNumber
        ) {
            setShouldContinue(false);
        } else if (
            !userName ||
            !userEmail ||
            !userPhoneNumber
        ) {
            setShouldContinue(true);
        }
    }, [
        userName,
        userEmail,
        userPhoneNumber,
        userFarm,
        userBrokage,
        userTransaction,
        checkPhoneResponse,
        emailCheckResponse,
    ]);

    //code to focus the verify code input field
    useEffect(() => {
        if (showVerifyPopup && verifyInputRef.current[0]) {
            verifyInputRef.current[0].focus();
        }
    }, [showVerifyPopup]);

    // Handle phone number change and validation
    const handlePhoneNumberChange = (phone) => {
        setUserPhoneNumber(phone);
        validatePhoneNumber(phone);

        if (!phone) {
            setErrorMessage("");
        }
    };

    //code to get user location

    const getLocation = () => {
        console.log("getlocation trigered");
        const registerationDetails = localStorage.getItem("registerDetails");
        // let registerationData = null;
        setLocationLoader(true);
        if (registerationDetails) {
            const registerationData = JSON.parse(registerationDetails);
            console.log("User registeration data is :--", registerationData);
            setUserData(registerationData);
        } else {
            // alert("Add details to continue");
        }
        const fetchCountry = async () => {
            try {
                // Get user's geolocation
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;

                    // Fetch country code based on lat and long
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();

                    // Set the country code based on the geolocation API response
                    setCountryCode(data.countryCode.toLowerCase());
                    setLoading(false);
                });
            } catch (error) {
                console.error("Error fetching location:", error);
                setLoading(true); // Stop loading if there’s an error
            } finally {
                setLocationLoader(false);
            }
        };

        fetchCountry();
    };

    // Function to validate phone number
    const validatePhoneNumber = (phoneNumber) => {
        // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
        // parsePhoneNumberFromString(`+${phone}`, countryCode.toUpperCase())
        const parsedNumber = parsePhoneNumberFromString(
            `+${phoneNumber}`,
            countryCode.toUpperCase()
        );
        // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode.toUpperCase()) {
        if (!parsedNumber || !parsedNumber.isValid()) {
            setErrorMessage("Invalid");
        } else {
            setErrorMessage("");

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // setCheckPhoneResponse(null);
            console.log("Trigered");

            timerRef.current = setTimeout(() => {
                checkPhoneNumber(phoneNumber);
                console.log("I am hit now");
            }, 300);
        }
    };

    //email validation function
    const validateEmail = (email) => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Check if email contains consecutive dots, which are invalid
        if (/\.\./.test(email)) {
            return false;
        }

        // Check the general pattern for a valid email
        return emailPattern.test(email);
    };

    //code for verify number popup

    const handleVerifyPopup = async () => {
        // let response = await SendVerificationCode(userPhoneNumber, true);
        handleContinue();
        return
        try {
            setSendcodeLoader(true);
            let response = await SendVerificationCode(userPhoneNumber, true);
            setResponse(response);
            setIsVisible(true);
            console.log("Response recieved is", response);
        } catch (error) {
            console.error("Error occured", error);
        } finally {
            setSendcodeLoader(false);
        }
        // setResponse(response)
        // setIsVisible(true)
        setShowVerifyPopup(true);
        setTimeout(() => {
            if (verifyInputRef.current[0]) {
                verifyInputRef.current[0].focus();
            }
        }, 100); // Adjust the delay as needed, 0 should be enough
    };

    const handleClose = () => {
        setShowVerifyPopup(false);
    };

    //code for handling verify code changes

    const handleVerifyInputChange = (e, index) => {
        const { value } = e.target;
        if (!/[0-9]/.test(value) && value !== "") return; // Allow only numeric input

        const newValues = [...VerifyCode];
        newValues[index] = value;
        setVerifyCode(newValues);

        // Move focus to the next field if a number is entered
        if (value && index < length - 1) {
            verifyInputRef.current[index + 1].focus();
        }

        // Trigger onComplete callback if all fields are filled
        if (newValues.every((num) => num !== "") && onComplete) {
            onComplete(newValues.join("")); // Convert array to a single string here
        }
    };

    const handleBackspace = (e, index) => {
        if (e.key === "Backspace") {
            if (VerifyCode[index] === "" && index > 0) {
                verifyInputRef.current[index - 1].focus();
            }
            const newValues = [...VerifyCode];
            newValues[index] = "";
            setVerifyCode(newValues);
        }
    };

    const handlePaste = (e) => {
        const pastedText = e.clipboardData.getData("text").slice(0, length);
        const newValues = pastedText
            .split("")
            .map((char) => (/[0-9]/.test(char) ? char : ""));
        setVerifyCode(newValues);

        // Set each input's value and move focus to the last filled input
        newValues.forEach((char, index) => {
            verifyInputRef.current[index].value = char;
            if (index === newValues.length - 1) {
                verifyInputRef.current[index].focus();
            }
        });

        if (newValues.every((num) => num !== "") && onComplete) {
            onComplete(newValues.join(""));
        }
    };

    //code for number verification
    const handleVerifyCode = () => {
        console.log("Verify code is :", VerifyCode.join(""));
        setPhoneVerifiedSuccessSnack(true);
        handleRegister();
    };

    //code for registering user
    const handleRegister = async () => {
        try {
            setRegisterLoader(true);

            let agentTitle = userData.userTypeTitle;
            // formatAgentTypeTitle(agentTitle);
            // console.log("AgentTitle", formatAgentTypeTitle(agentTitle));

            const ApiPath = Apis.register;
            const formData = new FormData();
            formData.append("name", userName);
            formData.append("email", userEmail);
            formData.append("phone", userPhoneNumber);
            formData.append("farm", userFarm);
            formData.append("brokerage", userBrokage);
            formData.append("averageTransactionPerYear", userTransaction);
            formData.append("agentService", JSON.stringify(userData.serviceID));
            formData.append("areaOfFocus", JSON.stringify(userData.focusAreaId));
            formData.append("userType", formatAgentTypeTitle(agentTitle));
            formData.append("login", false);
            formData.append(
                "timeZone",
                Intl.DateTimeFormat().resolvedOptions().timeZone
            );
            formData.append("verificationCode", VerifyCode.join(""));

            console.log("Data for user registeration is :-----");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            // return;
            const response = await axios.post(ApiPath, formData);
            if (response) {
                console.log("Response of register api is:--", response);
                let result = response.data;
                setResponse(result);
                setIsVisible(true);
                if (response.data.status === true) {
                    console.log("Status is :---", response.data.status);
                    localStorage.removeItem("registerDetails");
                    localStorage.setItem("User", JSON.stringify(response.data.data));
                    //set cokie on locastorage to run middle ware
                    // document.cookie = `User=${encodeURIComponent(
                    //   JSON.stringify(response.data.data)
                    // )}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;

                    //check for document undefined issue

                    if (typeof document !== "undefined") {
                        setCookie(response.data.data.user, document);
                    }

                    // handleContinue();

                    const screenWidth = window.innerWidth; // Get current screen width
                    const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px

                    if (screenWidth <= SM_SCREEN_SIZE) {
                        setCongratsPopup(true);
                        console.log("This is a small size screen");
                    } else {
                        console.log("This is a large size screen");
                        handleContinue();
                    }
                }
            }
        } catch (error) {
            console.error("Error occured in register api is: ", error);
        } finally {
            setRegisterLoader(false);
        }
    };

    //format the title
    const formatAgentTypeTitle = (title) => {
        switch (title) {
            case "Real Estate Agent":
                return "RealEstateAgent";
            case "Sales Dev Rep":
                return "SalesDevRep";
            case "Solar Rep":
                return "SolarRep";
            case "Insurance Agent":
                return "InsuranceAgent";
            case "Marketer":
                return "MarketerAgent";
            case "Website Owners":
                return "WebsiteAgent";
            case "Recuiter Agent":
                return "RecruiterAgent";
            case "Tax Agent":
                return "TaxAgent";
            default:
                return title; // Fallback if no match is found
        }
    };

    //code to check email and phone

    const checkEmail = async (value) => {
        try {
            setValidEmail("");
            setEmailLoader(true);

            const ApiPath = Apis.CheckEmail;

            const ApiData = {
                email: value,
            };

            console.log("Api data is :", ApiData);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                console.log("Response of check email api is :", response);
                if (response.data.status === true) {
                    console.log("Response message is :", response.data.message);
                    setEmailCheckResponse(response.data);
                } else {
                    setEmailCheckResponse(response.data);
                }
            }
        } catch (error) {
            console.error("Error occured in check email api is :", error);
        } finally {
            setEmailLoader(false);
        }
    };

    const checkPhoneNumber = async (value) => {
        try {
            setPhoneNumberLoader(true);
            const ApiPath = Apis.CheckPhone;

            const ApiData = {
                phone: value,
            };

            console.log("Api data is :", ApiData);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response) {
                console.log("Response of check phone api is :", response);
                if (response.data.status === true) {
                    console.log("Response message is :", response.data.message);
                    setCheckPhoneResponse(response.data);
                } else {
                    setCheckPhoneResponse(response.data);
                }
            }
        } catch (error) {
            console.error("Error occured in check phone api is :", error);
        } finally {
            setPhoneNumberLoader(false);
        }
    };

    const styles = {
        headingStyle: {
            fontSize: 16,
            fontWeight: "600",
        },
        inputStyle: {
            fontSize: 15,
            fontWeight: "500",
            borderRadius: "7px",
        },
        errmsg: {
            fontSize: 12,
            fontWeight: "500",
            borderRadius: "7px",
        },
        verifyPopup: {
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
    };

    return (
        <div
            style={{ width: "100%" }}
            className="overflow-y-hidden flex flex-row justify-center items-center"
        >
            <div className="bg-white sm:rounded-2xl sm:mx-2 w-full md:w-10/12 h-[100%] sm:max-h-[90%] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple">
                <div className="h-[84svh] sm:h-[82svh]">
                    {/* header */}
                    <div className="h-[10%]">
                        <Header />
                    </div>
                    {/* Body */}
                    <div className="flex flex-col items-center px-4 w-full h-[90%]">
                        <div
                            className="mt-6 w-11/12 md:text-4xl text-lg font-[600]"
                            style={{ textAlign: "center" }}
                            onClick={handleContinue}
                        >
                            Your Contact Information
                        </div>
                        <div
                            className="mt-4 sm:mt-8 w-full md:w-10/12 lg:w-6/12 flex flex-col max-h-[90%] sm:max-h-[85%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple px-2"
                            style={{ scrollbarWidth: "none" }}
                        >
                            <div style={styles.headingStyle}>{`What's your full name`}</div>
                            <input
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                                enterKeyHint="done"
                                placeholder="Name"
                                className="border border-[#00000010] p-3 outline-none focus:outline-none focus:ring-0"
                                ref={(el) => (inputsFields.current[0] = el)}
                                style={{ ...styles.inputStyle, marginTop: "8px" }}
                                value={userName}
                                onChange={(e) => {
                                    const input = e.target.value;
                                    const formattedName = input
                                        .split(" ")
                                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(" ");

                                    // const words = input.split(' ');
                                    // const formattedName =
                                    //   words.length > 1
                                    //     ? words[0].toLowerCase() + ' ' + words.slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                    //     : words[0].toLowerCase();

                                    setUserName(formattedName);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === "Done") {
                                        inputsFields.current[1]?.focus(); // Move to the second input
                                    }
                                }}
                            />

                            <div className="flex flex-row items-center w-full justify-between mt-6">
                                <div style={styles.headingStyle}>
                                    {`What's your email address`}
                                </div>
                                <div>
                                    {emailLoader ? (
                                        <p style={{ ...styles.errmsg, color: "black" }}>
                                            Checking ...
                                        </p>
                                    ) : (
                                        <div>
                                            {emailCheckResponse ? (
                                                <p
                                                    style={{
                                                        ...styles.errmsg,
                                                        color:
                                                            emailCheckResponse.status === true
                                                                ? "green"
                                                                : "red",
                                                    }}
                                                >
                                                    {emailCheckResponse.message
                                                        .slice(0, 1)
                                                        .toUpperCase() +
                                                        emailCheckResponse.message.slice(1)}
                                                </p>
                                            ) : (
                                                <div />
                                            )}
                                        </div>
                                    )}
                                    <div style={{ ...styles.errmsg, color: "red" }}>
                                        {validEmail}
                                    </div>
                                </div>
                            </div>

                            <input
                                ref={(el) => (inputsFields.current[1] = el)}
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                                enterKeyHint="done"
                                placeholder="Email address"
                                className="border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                                style={{ ...styles.inputStyle, marginTop: "8px" }}
                                value={userEmail}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    setUserEmail(value);

                                    // if (value) {
                                    //   const timer = setTimeout(() => {
                                    //     checkEmail(value);
                                    //     console.log("I am hit now")
                                    //   }, 1000);
                                    //   return (() => clearTimeout(timer));
                                    // } else {
                                    //   setEmailCheckResponse(null);
                                    // }

                                    if (timerRef.current) {
                                        clearTimeout(timerRef.current);
                                    }

                                    setEmailCheckResponse(null);

                                    if (!value) {
                                        console.log("Should set the value to null");
                                        setValidEmail("");
                                        return;
                                    }

                                    if (!validateEmail(value)) {
                                        console.log("Invalid pattern");
                                        setValidEmail("Invalid");
                                    } else {
                                        console.log("No trigered");
                                        if (value) {
                                            // Set a new timeout
                                            timerRef.current = setTimeout(() => {
                                                checkEmail(value);
                                            }, 300);
                                        } else {
                                            // Reset the response if input is cleared
                                            setEmailCheckResponse(null);
                                            setValidEmail("");
                                        }
                                    }
                                }}
                                onKeyDown={(e) => {
                                    const timer = setTimeout(() => {
                                        if (e.key === "Enter" || e.key === "Done") {
                                            inputsFields.current[2]?.focus(); // Move to the second input
                                        }
                                    }, [300]);
                                    clearTimeout(timer);
                                }}
                            />

                            <div className="flex flex-row items-center justify-between w-full mt-6">
                                <div style={styles.headingStyle}>
                                    {`What's your phone number`}
                                </div>
                                {/* Display error or success message */}
                                <div>
                                    {locationLoader && (
                                        <p
                                            className="text-purple"
                                            style={{ ...styles.errmsg, height: "20px" }}
                                        >
                                            Getting location ...
                                        </p>
                                    )}
                                    {errorMessage ? (
                                        <p
                                            style={{
                                                ...styles.errmsg,
                                                color: errorMessage && "red",
                                                height: "20px",
                                            }}
                                        >
                                            {errorMessage}
                                        </p>
                                    ) : (
                                        <div>
                                            {phoneNumberLoader ? (
                                                <p
                                                    style={{
                                                        ...styles.errmsg,
                                                        color: "black",
                                                        height: "20px",
                                                    }}
                                                >
                                                    Checking ...
                                                </p>
                                            ) : (
                                                <div>
                                                    {checkPhoneResponse ? (
                                                        <p
                                                            style={{
                                                                ...styles.errmsg,
                                                                color:
                                                                    checkPhoneResponse.status === true
                                                                        ? "green"
                                                                        : "red",
                                                                height: "20px",
                                                            }}
                                                        >
                                                            {checkPhoneResponse.message
                                                                .slice(0, 1)
                                                                .toUpperCase() +
                                                                checkPhoneResponse.message.slice(1)}
                                                        </p>
                                                    ) : (
                                                        <div />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: "8px" }}>
                                <PhoneInput
                                    ref={(el) => (inputsFields.current[2] = el)}
                                    className="border outline-none bg-white"
                                    country={countryCode} // Set the default country
                                    value={userPhoneNumber}
                                    onChange={handlePhoneNumberChange}
                                    onFocus={getLocation}
                                    placeholder={
                                        locationLoader
                                            ? "Loading location ..."
                                            : "Enter Phone Number"
                                    }
                                    disabled={loading} // Disable input if still loading
                                    style={{ borderRadius: "7px" }}
                                    inputStyle={{
                                        width: "100%",
                                        borderWidth: "0px",
                                        backgroundColor: "transparent",
                                        paddingLeft: "60px",
                                        paddingTop: "20px",
                                        paddingBottom: "20px",
                                    }}
                                    buttonStyle={{
                                        border: "none",
                                        backgroundColor: "transparent",
                                        // display: 'flex',
                                        // alignItems: 'center',
                                        // justifyContent: 'center',
                                    }}
                                    dropdownStyle={{
                                        maxHeight: "150px",
                                        overflowY: "auto",
                                    }}
                                    countryCodeEditable={true}
                                    defaultMask={loading ? "Loading..." : undefined}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === "Done") {
                                            inputsFields.current[3]?.focus(); // Move to the second input
                                        }
                                    }}
                                />
                            </div>




                            <SnackMessages
                                message={response.message}
                                isVisible={isVisible}
                                setIsVisible={(visible) => {
                                    setIsVisible(visible);
                                }}
                                success={response.status}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-[10%]">
                    <div>
                        <ProgressBar value={70} />
                    </div>

                    <Footer
                        handleContinue={handleVerifyPopup}
                        handleBack={handleBack}
                        registerLoader={registerLoader}
                        shouldContinue={shouldContinue}
                    />
                </div>
            </div>
        </div>
    );
};

export default BasicDetails;