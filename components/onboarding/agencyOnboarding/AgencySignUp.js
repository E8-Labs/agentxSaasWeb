"use client";

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
  Box,
  CircularProgress,
  FormControl,
  MenuItem,
  Modal,
  Select,
} from "@mui/material";
import SendVerificationCode from "@/components/onboarding/services/AuthVerification/AuthService";
import SnackMessages from "@/components/onboarding/services/AuthVerification/SnackMessages";
import { setCookie } from "@/utilities/cookies";
import { GetCampaigneeNameIfAvailable } from "@/utilities/UserUtility";
import { getLocalLocation } from "@/components/onboarding/services/apisServices/ApiService";
import { PersistanceKeys } from "@/constants/Constants";
import BackgroundVideo from "@/components/general/BackgroundVideo";
import { color } from "framer-motion";

const AgencySignUp = ({
  handleContinue,
  handleBack,
  length = 6,
  onComplete,
}) => {
  const verifyInputRef = useRef([]);
  const timerRef = useRef(null);

  let inputsFields = useRef([]);

  let windowSize = 1000;
  if (typeof window !== "undefined") {
    windowSize = window.innerWidth;
    // //console.log;
  } else {
    // //console.log;
  }

  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  let [response, setResponse] = useState({});
  const [registerLoader, setRegisterLoader] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  // const [emailErr, setEmailCheckResponse] = useState(false);
  const [company, setCompany] = useState("");

  const [website, setwebsite] = useState("");
  const [size, setSize] = useState("");
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

  const sizeList = [
    { id: 1, label: "1-10", min: 1, max: 10 },
    { id: 2, label: "11-50", min: 11, max: 50 },
    { id: 3, label: "51-100", min: 51, max: 100 },
    { id: 4, label: "100+", min: 101, max: 1000 }, // or any upper limit you want
  ];

  //load the user location
  useEffect(() => {
    let loc = getLocalLocation();
    setCountryCode(loc);
    let storedData = localStorage.getItem(PersistanceKeys.RegisterDetails);
    if (storedData) {
      let data = JSON.parse(storedData);
      setUserData(data);
    }
  }, []);

  //focus 1st field automaticallly
  useEffect(() => {
    // Focus the first input field on component load
    inputsFields.current[0]?.focus();
  }, []);

  // Function to get the user's location and set the country code
  useEffect(() => {
    if (
      userName &&
      userEmail &&
      userPhoneNumber &&
      company &&
      size &&
      emailCheckResponse?.status === true &&
      checkPhoneResponse?.status === true
    ) {
      setShouldContinue(false);
    } else if (
      !userName ||
      !userEmail ||
      !userPhoneNumber ||
      !company ||
      !size ||
      size ||
      checkPhoneResponse?.status === false ||
      emailCheckResponse?.status === false
    ) {
      setShouldContinue(true);
    }
  }, [
    userName,
    userEmail,
    userPhoneNumber,
    company,
    website,
    size,
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
    // let response = await SendVerificationCode(userPhoneNumber, true);
    try {
      setShowVerifyPopup(true);
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
    // setResponse(response)
    // setIsVisible(true)

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
    console.log("verify code is: ", VerifyCode);
    setPhoneVerifiedSuccessSnack(true);
    handleRegister();
  };
  //   console.log('````````````')

  //code for registering user
  const handleRegister = async () => {
    try {
      setRegisterLoader(true);

      const formData = new FormData();
      const ApiPath = Apis.register;
      let campainee = null;
      if (typeof window !== "undefined") {
        campainee = GetCampaigneeNameIfAvailable(window);
      }
      if (campainee) {
        formData.append("campaignee", campainee);
      }

      formData.append("name", userName);
      formData.append("email", userEmail);
      formData.append("phone", userPhoneNumber);
      formData.append("company", company);
      formData.append("companySizeMin", size.min);
      formData.append("companySizeMax", size.max);
      formData.append("website", website);
      formData.append("userRole", "Agency");
      formData.append("login", false);
      formData.append(
        "timeZone",
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      formData.append("verificationCode", VerifyCode.join(""));

      // //console.log;
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // return;
      const response = await axios.post(ApiPath, formData);
      if (response) {
        //console.log;
        let result = response.data;
        setResponse(result);
        setIsVisible(true);
        if (response.data.status === true) {
          console.log("agency signup data is", response.data.data);
          localStorage.removeItem(PersistanceKeys.RegisterDetails);
          localStorage.setItem("User", JSON.stringify(response.data.data));

          if (typeof document !== "undefined") {
            setCookie(response.data.data.user, document);
          }

          // Track signup for affiliate marketing
          if (typeof window !== "undefined" && window.agentxTrackSignup) {
            window.agentxTrackSignup(userEmail, response.data.data.user?.id);
          }

          let screenWidth = 1000;
          if (typeof window !== "undefined") {
            screenWidth = window.innerWidth; // Get current screen width
          }
          const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px
          //console.log;
          if (screenWidth <= SM_SCREEN_SIZE) {
            setCongratsPopup(true);
            // //console.log;
          } else {
            //console.log;
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

  const handleChangeSize = (event) => {
    const selected = sizeList.find((item) => item.label === event.target.value);
    setSize(selected); // store the full object instead of just string
  };

  const styles = {
    headingStyle: {
      fontSize: 15,
      fontWeight: "500",
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
    sideBoxTxt: {
      fontWeight: "600",
      fontSize: 18,
      color: "#00000070",
    },
  };

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <div className="bg-white sm:rounded-2xl sm:mx-2 w-full md:w-11/12 h-[100%] sm:max-h-[90%] py-4 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple">
        <div className="w-full flex flex-row items-center justify-start gap-2 mt-4">
          <div className="w-6/12">
            <div className="flex flex-col items-start w-full h-[90%]">
              <div
                className="mt-6 w-11/12 md:text-4xl text-lg font-[600]"
                style={{ textAlign: "left" }}
              >
                Create Your AI Agency
              </div>
              {/*<div
                                className="mt-3 w-11/12 md:text-lg text-lg font-[500] text-[#00000060]"
                                style={{ textAlign: "left" }}
                            >
                                Build your AI Agency
    </div>*/}
              <div
                className="mt-6 w-[80%] flex flex-col max-h-[90%] sm:max-h-[85%] overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple px-2"
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
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
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
                    country={"us"} // restrict to US only
                    onlyCountries={["us"]}
                    disableDropdown={true}
                    countryCodeEditable={false}
                    disableCountryCode={false} value={userPhoneNumber}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Done") {
                        inputsFields.current[3]?.focus(); // Move to the second input
                      }
                    }}
                  />
                </div>

                <div className="flex flex-row items-center gap-4 w-full">
                  <div className="w-6/12">
                    <div style={styles.headingStyle} className="mt-6">
                      {`Agency Name`}
                    </div>
                    <input
                      ref={(el) => (inputsFields.current[3] = el)}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      enterKeyHint="done"
                      placeholder="Agency Name"
                      className="border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0 w-full"
                      style={{ ...styles.inputStyle, marginTop: "8px" }}
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Done") {
                          inputsFields.current[4]?.focus(); // Move to the second input
                        }
                      }}
                    />
                  </div>
                  <div className="w-6/12">
                    <div style={styles.headingStyle} className="mt-6">
                      Website (optional)
                    </div>
                    <input
                      ref={(el) => (inputsFields.current[4] = el)}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      enterKeyHint="done"
                      placeholder="Website"
                      className="border border-[#00000010] rounded p-3 outline-none focus:outline-none focus:ring-0 w-full"
                      style={{ ...styles.inputStyle, marginTop: "8px" }}
                      value={website}
                      onChange={(e) => {
                        setwebsite(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Done") {
                          inputsFields.current[5]?.focus(); // Move to the second input
                        }
                      }}
                    />
                  </div>
                </div>

                <div style={styles.headingStyle} className="mt-6 mb-2">
                  Agency Size
                </div>
                <FormControl fullWidth>
                  <Select
                    value={size}
                    onChange={handleChangeSize}
                    displayEmpty // Enables placeholder
                    renderValue={(selected) => {
                      if (!selected) {
                        return <div style={{ color: "#aaa" }}>Select size</div>;
                      }
                      return selected.label;
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
                    {sizeList.map((item, index) => (
                      <MenuItem
                        key={item.id}
                        value={item.label}
                        sx={{
                          backgroundColor:
                            size.id === item.id ? "#7902DF10" : "transparent",
                          "&.Mui-selected": {
                            backgroundColor: "#7902DF10",
                          },
                          "&:hover": {
                            backgroundColor: "#7902DF10",
                          },
                        }}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <button
                  disabled={shouldContinue}
                  className="rounded-lg text-white bg-purple mt-4"
                  style={{
                    fontWeight: "700",
                    fontSize: "16",
                    backgroundColor: shouldContinue && "#00000020",
                    color: shouldContinue && "#000000",
                    height: "40px",
                    width: "100px",
                    alignSelf: "flex-end",
                  }}
                  onClick={handleVerifyPopup}
                >
                  Continue
                </button>
                {/* Modal for verify number */}

                <Modal
                  open={showVerifyPopup}
                  // onClose={() => setAddKYCQuestion(false)}
                  closeAfterTransition
                  BackdropProps={{
                    timeout: 1000,
                    sx: {
                      backgroundColor: "#00000020",
                      ////backdropFilter: "blur(5px)"
                    },
                  }}
                >
                  <Box
                    className="lg:w-8/12 sm:w-full sm:w-10/12 w-full"
                    sx={styles.verifyPopup}
                  >
                    <div className="flex flex-row justify-center w-full">
                      <div
                        className="sm:w-7/12 w-full mx-2"
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
                              autoComplete="off"
                              autoCorrect="off"
                              spellCheck="false"
                              enterKeyHint="done"
                              // type="text"
                              type="tel"
                              inputMode="numeric"
                              maxLength="1"
                              value={VerifyCode[index]}
                              onChange={(e) =>
                                handleVerifyInputChange(e, index)
                              }
                              onKeyDown={(e) => handleBackspace(e, index)}
                              onKeyUp={(e) => {
                                // Check if the Enter key is pressed and all inputs are filled
                                if (
                                  e.key === "Enter" &&
                                  VerifyCode.every(
                                    (value) => value.trim() !== ""
                                  )
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

                {/* Modal for congrats */}
                <Modal
                  open={congratsPopup}
                  // onClose={() => setAddKYCQuestion(false)}
                  closeAfterTransition
                  BackdropProps={{
                    timeout: 1000,
                    sx: {
                      backgroundColor: "#00000020",
                      ////backdropFilter: "blur(5px)"
                    },
                  }}
                >
                  <Box className="w-full" sx={styles.verifyPopup}>
                    <div className="flex flex-row justify-center w-full">
                      <div
                        className="w-full mx-4"
                        style={{
                          backgroundColor: "#ffffff",
                          padding: 20,
                          borderRadius: "13px",
                        }}
                      >
                        <div className="flex flex-row justify-end">
                          {/* <button>
                          <Image
                            src={"/assets/crossIcon.png"}
                            height={40}
                            width={40}
                            alt="*"
                          />
                        </button> */}
                        </div>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: "700",
                            textAlign: "center",
                          }}
                        >
                          Congrats!
                        </div>

                        <div className="w-full mt-8 flex flex-row justify-center">
                          <Image
                            className=""
                            src="/agentXOrb.gif"
                            style={{
                              height: "100px",
                              width: "110px",
                              resize: "contain",
                            }}
                            height={102}
                            width={102}
                            alt="*"
                          />
                        </div>

                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: "600",
                            textAlign: "center",
                            marginTop: 50,
                            color: "#00000070",
                          }}
                        >
                          Your account is created!
                        </div>

                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: "700",
                            textAlign: "center",
                            marginTop: 15,
                            color: "#000000",
                          }}
                        >
                          {`Let’s build your AI AgentX`}
                        </div>

                        {registerLoader ? (
                          <div className="flex fex-row items-center justify-center mt-8">
                            <CircularProgress size={35} />
                          </div>
                        ) : (
                          <button
                            className="text-white bg-purple outline-none rounded-xl w-full mt-8"
                            style={{
                              height: "50px",
                              fontSize: 15,
                              fontWeight: "700",
                            }}
                            onClick={() => {
                              router.push("/onboarding/agencyOnboarding/plans");
                            }}
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

          <div className="flex w-6/12 flex-col items-center justify-start">
            {/*
              <Image
                className="object-contain"
                src={"/agencyIcons/signupLogo.png"}
                height={570}
                width={570}
                alt="*"
              />
            */}
            <div
              className="w-full bg-transparent flex flex-col items-center justify-end"
              style={{
                backgroundImage: "url('/agencyIcons/signupLogo.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "580px",
                width: "580px"
              }}
            >
              <div
                className="inline-flex flex-col items-center  w-[25vw] bg-gradient-to-b from-white/50 to-white rounded-2xl shadow-[0px_76px_63.29999923706055px_-21px_rgba(0,0,0,0.05)] border border-white backdrop-blur-xl" //absolute bottom-10 right-0 sm:right-40
              // className="w-[531px] h-[481px] bg-gradient-to-b from-white/50 to-white rounded-2xl shadow-[0px_76px_63.29999923706055px_-21px_rgba(0,0,0,0.05)] border border-white backdrop-blur-xl"
              >
                <div className="inline-flex flex-col items-start w-full px-6">
                  <div
                    className="
      truncate w-full
      text-[32px] sm:text-[36px] md:text-[42px] lg:text-[47px] xl:text-[52px]
      text-transparent bg-clip-text bg-gradient-to-r from-[#23DEFF] to-[#7902DF]
      text-start
    "
                    style={{ fontWeight: "700" }}
                  >
                    {company || "Agency Name"}
                  </div>
                </div>
                <div className="inline-flex flex-col items-end w-full mb-4 px-6">
                  <Image
                    className="object-contain"
                    src={"/agencyIcons/poweredByIcon.png"}
                    height={22}
                    width={177}
                    alt="*"
                  />
                </div>
                <div className="pb-4 w-full px-6">
                  {[
                    {
                      src: "/agencyIcons/man.jpg",
                      label: userName || "Agency Owner",
                    },
                    {
                      src: "/agencyIcons/web.jpg",
                      label: website || "Website",
                    },
                    // {
                    //   src: "/agencyIcons/email.jpg",
                    //   label: userEmail || "Email",
                    // },
                    {
                      src: "/agencyIcons/building.jpg",
                      label: size?.label || "Agency Size",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-row items-center gap-3 mt-4 first:pt-2 min-w-0"
                    >
                      <Image alt="*" src={item.src} height={32} width={32} />
                      <div
                        className="truncate"
                        style={{ ...styles.sideBoxTxt }}
                      >
                        {item?.label}
                        {/* ?.length  32 ? item?.label?.slice(0, 32) + '...' : item?.label*/}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencySignUp;
