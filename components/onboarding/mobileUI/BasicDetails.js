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
import { getLocalLocation } from "../services/apisServices/ApiService";
import { GetCampaigneeNameIfAvailable } from "@/utilities/UserUtility";
import { PersistanceKeys } from "@/constants/Constants";

const BasicDetails = ({
  handleContinue,
  handleBack,
  length = 6,
  onComplete,
  handleDetails,
  userDetails,
}) => {
  const verifyInputRef = useRef([]);
  const timerRef = useRef(null);

  let inputsFields = useRef([]);
  const phoneInputRef = useRef(null);

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

  useEffect(() => {
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
    let loc = getLocalLocation();
    if (!userDetails.phone) {
      setCountryCode(loc);
    }

    if (userDetails) {
      setUserName(userDetails.name);
      setUserEmail(userDetails.email);
      setUserPhoneNumber(userDetails.phone);
    }
  }, []);

  // Function to get the user's location and set the country code
  useEffect(() => {
    handleDetails(userName, userEmail, userPhoneNumber);

    if (
      userName &&
      userEmail &&
      userPhoneNumber &&
      emailCheckResponse?.status === true &&
      !errorMessage &&
      checkPhoneResponse?.status === true
    ) {
      setShouldContinue(false);
    } else if (
      !userName ||
      !userEmail ||
      !userPhoneNumber ||
      emailCheckResponse?.status === false ||
      errorMessage ||
      checkPhoneResponse?.status === false
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
    errorMessage,
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
    handleContinue();
    return;
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
    // //console.log);
    setPhoneVerifiedSuccessSnack(true);
    handleRegister();
  };

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
      formData.append("farm", userFarm);
      formData.append("brokerage", userBrokage);
      formData.append("averageTransactionPerYear", userTransaction);
      formData.append("agentService", JSON.stringify(userData.serviceID));
      formData.append("areaOfFocus", JSON.stringify(userData.focusAreaId));
      formData.append("login", false);
      formData.append(
        "timeZone",
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      formData.append("verificationCode", VerifyCode.join(""));

      // //console.log;
      for (let [key, value] of formData.entries()) {
        // //console.log;
      }

      // return;
      const response = await axios.post(ApiPath, formData);
      if (response) {
        // //console.log;
        let result = response.data;
        setResponse(result);
        setIsVisible(true);
        if (response.data.status === true) {
          // //console.log;
          localStorage.removeItem(PersistanceKeys.RegisterDetails);
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

          const screenWidth = 1000;
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
      className="overflow-y-hidden flex flex-col justify-center items-center h-[100svh] "
    >
      <div className="flex flex-col bg-white sm:rounded-2xl sm:mx-2 w-full md:w-10/12 h-[90%] sm:max-h-[90%] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple">
        <div className="h-[90svh] sm:h-[82svh]">
          {/* header h-[84svh]*/}
          <div className="h-[10%]">
            <Header />
          </div>
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full h-[90%] ">
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
                  if (e.key === "Enter") {
                    // Focus on PhoneInput field when Enter is pressed
                    // if (phoneInputRef.current) {
                    //   const inputElement = phoneInputRef.current.querySelector("input"); // Native input element
                    //   if (inputElement) {
                    //     inputElement.focus();
                    //   }
                    // }

                    const timer = setTimeout(() => {
                      // Scroll into view before focusing
                      phoneInputRef.current.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      phoneInputRef.current.focus({ preventScroll: true });
                      // //console.log;
                    }, 200); // Slight delay to ensure component is rendered
                    return () => clearTimeout(timer);
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
                  // ref={phoneInputRef}
                  className="border outline-none bg-white"
                  country={"us"} // restrict to US only
                  onlyCountries={["us"]}
                  disableDropdown={true}
                  countryCodeEditable={false}
                  disableCountryCode={false}// Set the default country
                  value={userPhoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder={
                    locationLoader
                      ? "Loading location ..."
                      : "Enter Phone Number"
                  }
                  disabled={loading} // Disable input if still loading
                  style={{ borderRadius: "7px" }}
                  inputProps={{
                    ref: phoneInputRef,
                    // enterKeyHint: "Done",
                  }}
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
                // onKeyDown={(e) => {
                //   if (e.key === "Enter" || e.key === "Done") {
                //     // inputsFields.current[3]?.focus(); // Move to the second input
                //    // //console.log
                //     handleContinue();
                //   }
                // }}
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
      </div>
      <div className="h-[10%] w-full">
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
  );
};

export default BasicDetails;
