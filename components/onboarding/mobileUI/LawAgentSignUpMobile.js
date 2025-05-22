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
import SendVerificationCode from "../services/AuthVerification/AuthService";
import SnackMessages from "../services/AuthVerification/SnackMessages";
import { getLocalLocation } from "../services/apisServices/ApiService";
import { GetCampaigneeNameIfAvailable } from "@/utilities/UserUtility";
import { PersistanceKeys } from "@/constants/Constants";
import { setCookie } from "@/utilities/cookies";
// import VerificationCodeInput from '../test/VerificationCodeInput';

const LawAgentSignUpMobile = ({
  handleContinue,
  handleWaitList,
  handleSolarAgentBack,
  length = 6,
  onComplete,
}) => {
  const verifyInputRef = useRef([]);
  const timerRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  let [response, setResponse] = useState({});
  const [sendcodeLoader, setSendcodeLoader] = useState(false);

  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
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

  //code to select the client type
  const [customerService, setCustomerService] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [installationVolume, setInstallationVolume] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [ClientType, setClientType] = useState(null);
  const [consultation, setConsultation] = useState(null);

  //array for the primary client types
  const primaryClientTypes = [
    {
      id: 1,
      title: "Individuals (B2)",
    },
    {
      id: 2,
      title: "Businesses & Corporations (B2B)",
    },
    {
      id: 3,
      title: "Government & Public Sector",
    },
  ];

  const ConsultationFormat = [
    {
      id: 1,
      title: "In-Person Consultations",
    },
    {
      id: 2,
      title: "Virtual Consultations",
    },
    {
      id: 3,
      title: "Virtual Consultationsr",
    },
  ];

  // Function to get the user's location and set the country code

  useEffect(() => {
    let loc = getLocalLocation();
    setCountryCode(loc);
  }, []);

  useEffect(() => {
    if (
      userName &&
      userEmail &&
      userPhoneNumber &&
      customerService &&
      companyName &&
      installationVolume &&
      // projectSize &&
      ClientType &&
      emailCheckResponse?.status === true &&
      checkPhoneResponse?.status === true
    ) {
      setShouldContinue(false);
    } else if (
      !userName ||
      !userEmail ||
      !userPhoneNumber ||
      !userFarm ||
      !userBrokage ||
      !userTransaction ||
      customerService ||
      companyName ||
      installationVolume ||
      // projectSize ||
      ClientType ||
      userTransaction ||
      checkPhoneResponse?.status === false ||
      emailCheckResponse?.status === false
    ) {
      setShouldContinue(true);
    }
  }, [
    userName,
    userEmail,
    userPhoneNumber,
    checkPhoneResponse,
    emailCheckResponse,
    customerService,
    companyName,
    installationVolume,
    projectSize,
    ClientType,
  ]);

  useEffect(() => {
    let storedData = localStorage.getItem(PersistanceKeys.RegisterDetails);
    if (storedData) {
      let data = JSON.parse(storedData);
      setUserData(data);
    }
  }, []);

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

  ///function to select client type
  const handleSelectClientType = (item) => {
    // //console.log;
    setClientType(item.title);
  };

  const handleConsultationFormat = (item) => {
    setConsultation(item.title);
  };

  // Function to validate phone number
  const validatePhoneNumber = (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(
      `+${phoneNumber}`,
      countryCode?.toUpperCase()
    );
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage("Invalid");
    } else {
      setErrorMessage("");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // setCheckPhoneResponse(null);
      // //console.log;

      timerRef.current = setTimeout(() => {
        checkPhoneNumber(phoneNumber);
        // //console.log;
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
    try {
      setSendcodeLoader(true);
      let response = await SendVerificationCode(userPhoneNumber, true);
      setResponse(response);
      setIsVisible(true);
      // //console.log;
    } catch (error) {
      // console.error("Error occured", error);
    } finally {
      setSendcodeLoader(false);
    }
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
    // //console.log);
    setPhoneVerifiedSuccessSnack(true);
    handleRegister();
  };

  //code for registering user
  const handleRegister = async () => {
    try {
      setRegisterLoader(true);

      let agentTitle = userData.userTypeTitle;

      let clienttype = null;

      if (ClientType === "Individuals (B2)") {
        clienttype = "Individuals";
      } else if (ClientType === "Businesses & Corporations (B2B)") {
        clienttype = "Businesses&Corporations";
      } else if (ClientType === "Government & Public Sector") {
        clienttype = "Government&PublicSector";
      }
      const formData = new FormData();
      const ApiPath = Apis.register;
      let campainee = GetCampaigneeNameIfAvailable(window);
      if (campainee) {
        formData.append("campaignee", campainee);
      }
      // const formData = new FormData();
      formData.append("name", userName);
      formData.append("email", userEmail);
      formData.append("phone", userPhoneNumber);
      formData.append("agentService", JSON.stringify(userData.serviceID));
      formData.append("areaOfFocus", JSON.stringify(userData.focusAreaId));
      formData.append("userType", agentTitle);
      formData.append("territory", customerService);
      formData.append("firmOrCompanyAffiliation", companyName);
      formData.append("caseVolume", installationVolume);
      // formData.append("projectsPerYear", projectSize);
      formData.append("clientType", ClientType);
      formData.append("consultationFormat", consultation);
      formData.append("login", false);
      formData.append("verificationCode", VerifyCode.join(""));
      formData.append(
        "timeZone",
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );

      // //console.log;
      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      // return
      const response = await axios.post(ApiPath, formData);
      if (response) {
        setResponse(response.data);
        setIsVisible(true);
        // //console.log;
        if (response.data.status === true) {
          localStorage.setItem("User", JSON.stringify(response.data.data));

          if (typeof document !== "undefined") {
            setCookie(response.data.data.user, document);
          }

          let screenWidth = 1000;
          if (typeof window !== "undefined") {
            screenWidth = window.innerWidth; // Get current screen width
          }
          const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px

          if (screenWidth <= SM_SCREEN_SIZE) {
            setCongratsPopup(true);
            // //console.log;
          } else {
            // //console.log;
            handleContinue();
            // setCongratsPopup(true);
          }
        }
      }
    } catch (error) {
      // console.error("Error occured in register api is: ", error);
    } finally {
      setRegisterLoader(false);
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

      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // //console.log;
          setEmailCheckResponse(response.data);
        } else {
          setEmailCheckResponse(response.data);
        }
      }
    } catch (error) {
      // console.error("Error occured in check email api is :", error);
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

      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // //console.log;
          setCheckPhoneResponse(response.data);
        } else {
          setCheckPhoneResponse(response.data);
        }
      }
    } catch (error) {
      // console.error("Error occured in check phone api is :", error);
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
      fontSize: 13,
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
      <div className="bg-white rounded-2xl mx-2 w-full md:w-10/12 max-h-[90%] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple">
        <div className="h-[82svh]">
          {/* header */}
          <div className="h-[10%]">
            <Header />
          </div>
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full h-[90%]">
            <div
              className="mt-6 w-11/12 md:text-4xl text-lg font-[600]"
              style={{ textAlign: "center" }}
            >
              Your Contact Information
            </div>
            <div
              className="mt-8 w-full md:w-10/12 lg:w-6/12 flex flex-col max-h-[85%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple px-2"
              style={{ scrollbarWidth: "none" }}
            >
              <div style={styles.headingStyle}>{`What's your full name`}</div>
              <input
                placeholder="Name"
                className="border border-[#00000010] p-3 outline-none focus:outline-none focus:ring-0"
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
                  //    // //console.log
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
                    // //console.log;
                    setValidEmail("");
                    return;
                  }

                  if (!validateEmail(value)) {
                    // //console.log;
                    setValidEmail("Invalid");
                  } else {
                    // //console.log;
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
                  className="border outline-none bg-white"
                  country={"us"} // restrict to US only
                  onlyCountries={["us"]}
                  disableDropdown={true}
                  countryCodeEditable={false}
                  disableCountryCode={false} 
                  value={userPhoneNumber}
                  onChange={handlePhoneNumberChange}
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
                  defaultMask={loading ? "Loading..." : undefined}
                />
              </div>

              <div style={styles.headingStyle} className="mt-6">
                Where do you primarily practice law?
              </div>
              <input
                placeholder="Specific cities, counties, or regions"
                className="border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={customerService}
                onChange={(e) => {
                  setCustomerService(e.target.value);
                }}
              />

              <div style={styles.headingStyle} className="mt-6">
                Name of the firm or legal practice you work with, if any.
              </div>
              <input
                placeholder="Name"
                className="border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                }}
              />

              <div style={styles.headingStyle} className="mt-6">
                How many cases do you handle annually or monthly?
              </div>
              <input
                placeholder="Type here"
                type="number"
                className="border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0"
                style={{ ...styles.inputStyle, marginTop: "8px" }}
                value={installationVolume}
                onChange={(e) => {
                  setInstallationVolume(e.target.value);
                }}
              />

              <div style={styles.headingStyle} className="mt-6">
                Client Type
              </div>

              <div
                className="flex w-full flex-wrap flex-row items-center gap-2"
                style={{ marginTop: "8px" }}
              >
                {primaryClientTypes.map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        onClick={() => {
                          handleSelectClientType(item);
                        }}
                        className="border border-[#00000010] rounded px-4 h-[74px] w-full outline-none focus:outline-none focus:ring-0"
                        style={{
                          ...styles.inputStyle,
                          borderRadius: "30px",
                          paddingInline: index === 2 && "40px",
                          border:
                            ClientType === item.title
                              ? "2px solid #7902DF"
                              : "",
                          backgroundColor:
                            ClientType === item.title ? "#402FFF20" : "",
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div style={styles.headingStyle} className="mt-6">
                Consultation Format
              </div>

              <div
                className="flex w-full flex-wrap flex-row items-center gap-2"
                style={{ marginTop: "8px" }}
              >
                {ConsultationFormat.map((item, index) => {
                  return (
                    <div key={index} className="w-full">
                      <button
                        onClick={() => {
                          handleConsultationFormat(item);
                        }}
                        className="border w-full h-[74px] border-[#00000010] rounded px-4 outline-none focus:outline-none focus:ring-0"
                        style={{
                          ...styles.inputStyle,
                          borderRadius: "30px",
                          paddingInline: index === 2 && "40px",
                          border:
                            ClientType === item.title
                              ? "2px solid #7902DF"
                              : "",
                          backgroundColor:
                            ClientType === item.title ? "#402FFF20" : "",
                        }}
                      >
                        {item.title}
                      </button>
                    </div>
                  );
                })}
              </div>

              <Modal
                open={showVerifyPopup}
                // onClose={() => setAddKYCQuestion(false)}
                closeAfterTransition
                BackdropProps={{
                  timeout: 1000,
                  sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(20px)",
                  },
                }}
              >
                <Box
                  className="lg:w-8/12 sm:w-full w-8/12"
                  sx={styles.verifyPopup}
                >
                  <div className="flex flex-row justify-center w-full">
                    <div
                      className="sm:w-7/12 w-full"
                      style={{
                        backgroundColor: "#ffffff",
                        padding: 20,
                        borderRadius: "13px",
                      }}
                    >
                      <div className="flex flex-row justify-end">
                        <button onClick={handleClose}>
                          <Image
                            src={"/assets/crossIcon.png"}
                            height={40}
                            width={40}
                            alt="*"
                          />
                        </button>
                      </div>
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: "700",
                        }}
                      >
                        Verify phone number
                      </div>
                      <div
                        className="mt-8"
                        style={{ ...styles.inputStyle, color: "#00000060" }}
                      >
                        Enter code that was sent to number ending with *
                        {userPhoneNumber.slice(-4)}.
                      </div>
                      {/* <VerificationCodeInput /> */}
                      <div
                        className="mt-8"
                        style={{ display: "flex", gap: "8px" }}
                      >
                        {Array.from({ length }).map((_, index) => (
                          <input
                            key={index}
                            ref={(el) => (verifyInputRef.current[index] = el)}
                            // type="text"
                            type="tel"
                            inputMode="numeric"
                            maxLength="1"
                            value={VerifyCode[index]}
                            onChange={(e) => handleVerifyInputChange(e, index)}
                            onKeyDown={(e) => handleBackspace(e, index)}
                            onKeyUp={(e) => {
                              // Check if the Enter key is pressed and all inputs are filled
                              if (
                                e.key === "Enter" &&
                                VerifyCode.every((value) => value.trim() !== "")
                              ) {
                                handleVerifyCode();
                              }
                            }}
                            onPaste={handlePaste}
                            placeholder="-"
                            style={{
                              width: "40px",
                              height: "40px",
                              textAlign: "center",
                              fontSize: "20px",
                              border: "1px solid #ccc",
                              borderRadius: "5px",
                            }}
                            className=" focus:outline-none focus:ring-0"
                          />
                        ))}
                      </div>
                      <div
                        className="mt-8 flex flex-row items-center gap-2"
                        style={styles.inputStyle}
                      >
                        {`Didn't receive code?`}
                        {sendcodeLoader ? (
                          <CircularProgress size={17} />
                        ) : (
                          <button
                            className="outline-none border-none text-purple"
                            onClick={handleVerifyPopup}
                          >
                            Resend
                          </button>
                        )}
                      </div>
                      {registerLoader ? (
                        <div className="flex fex-row items-center justify-center mt-8">
                          <CircularProgress size={35} />
                        </div>
                      ) : (
                        <button
                          className="text-white bg-purple outline-none rounded-xl w-full mt-8"
                          style={{ height: "50px" }}
                          onClick={handleVerifyCode}
                        >
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                </Box>
              </Modal>

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
            <ProgressBar value={80} />
          </div>

          <Footer
            handleContinue={handleVerifyPopup}
            handleBack={handleSolarAgentBack}
            registerLoader={registerLoader}
            shouldContinue={shouldContinue}
          />
        </div>
      </div>
    </div>
  );
};

export default LawAgentSignUpMobile;
