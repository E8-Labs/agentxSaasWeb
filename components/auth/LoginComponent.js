"use client";
import Apis from "@/components/apis/Apis";

import { Box, CircularProgress, Modal } from "@mui/material";
import axios from "axios";
import Image from "next/image";
// import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import LoaderAnimation from "@/components/animations/LoaderAnimation";
import SendVerificationCode from "@/components/onboarding/services/AuthVerification/AuthService";
import SnackMessages from "@/components/onboarding/services/AuthVerification/SnackMessages";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { setCookie } from "@/utilities/cookies";
import { PersistanceKeys, setUserType, userType } from "@/constants/Constants";
import {
  getLocalLocation,
  getLocation,
} from "@/components/onboarding/services/apisServices/ApiService";
import Link from "next/link";
import getProfileDetails from "../apis/GetProfile";
// import { useRouter, useSearchParams } from "next/navigation";

const LoginComponent = ({ length = 6, onComplete }) => {
  let width = 3760;
  let height = 4684;
  let searchParams = useSearchParams();
  const [redirect, setRedirect] = useState(null);

  const verifyInputRef = useRef([]);
  const timerRef = useRef();
  const router = useRouter();
  const params = useParams();
  const [isVisible, setIsVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [msgType, setMsgType] = useState(null);
  let [response, setResponse] = useState({});
  const [countryCode, setCountryCode] = useState("us"); // Default country
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const userPhoneNumberRef = useRef("");
  const [sendcodeLoader, setSendcodeLoader] = useState(false);
  const [SendCodeMessage, setSendCodeMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationLoader, setLocationLoader] = useState(false);
  const [loginLoader, setLoginLoader] = useState(false);
  const [phoneNumberLoader, setPhoneNumberLoader] = useState(false);
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [enterPressed, setEnterPressed] = useState(false);


  const [loaderTitle, setLoaderTitle] = useState("Launching your account...");
  // const length = 6;
  const [VerifyCode, setVerifyCode] = useState(Array(length).fill(""));
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);

  //code for detecting the window inner width
  const [InnerWidth, setInnerWidth] = useState("");

  useEffect(() => {
    const redirect = searchParams.get("redirect"); // Get the value of 'tab'
    // let number = Number(tab) || 6;
    // //console.log;
    setRedirect(redirect);
  }, []);

  useEffect(() => {
    //console.log;
    userPhoneNumberRef.current = userPhoneNumber;
  }, [userPhoneNumber]);
  useEffect(() => {
    if (params && params.username) {
      // //console.log;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          PersistanceKeys.LocalStorageCampaignee,
          params.username
        );
      }
    } else {
      // router.replace("/login");
    }
  }, [params]);

  useEffect(() => {
    if (enterPressed && checkPhoneResponse === false) {
      handleVerifyPopup();
      setEnterPressed(false); // reset it
    }
  }, [enterPressed, checkPhoneResponse]);


  useEffect(() => {
    // //console.log;
    const localData = localStorage.getItem("User");
    if (localData) {
      let d = JSON.parse(localData);
      getProfileDetails()
      // //console.log;

      // set user type in global variable

      if (d.user.userType == "admin") {
        router.push("/admin");
      } else if (d.user.userRole == "Agency" || d.user.agencyTeammember === true) {
        router.push("/agency/dashboard");
      } else if (d.user.userRole == "AgencySubAccount") {
        if (d.user.plan) {
          router.push("/dashboard");
        } else {
          router.push("/subaccountInvite/subscribeSubAccountPlan");
        }
      } else {
        router.push("/dashboard");
      }
    }

    const localLoc = localStorage.getItem(
      PersistanceKeys.LocalStorageUserLocation
    );
    if (!localLoc) {
      // getLocation();
      // getLocation2();
    } else if (localLoc) {
      // const L = JSON.parse(localLoc);
      // setCountryCode(L.location);
      let Data = getLocalLocation();
      if (userPhoneNumber == "") {
        // setCountryCode(Data);
      }
    }
  }, []);

  //get location
  const getLocation2 = async () => {
    // setLocationLoader(true);
    try {
      //console.log;
      const location = await getCurrentLocation();
      //console.log;
      const { latitude, longitude } = location;
      localStorage.setItem("CompleteLocation", JSON.stringify(location));
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      //console.log;
      localStorage.setItem(
        PersistanceKeys.LocalStorageCompleteLocation,
        JSON.stringify(data)
      );
      const locationData = {
        location: data.countryCode.toLowerCase(),
      };
      if (userPhoneNumberRef.current === "") {
        console.log(
          "User Phone Number is in location",
          userPhoneNumberRef.current
        );

        // setCountryCode(data.countryCode.toLowerCase());
      }

      // //console.log;
      if (data && data.countryCode) {
        localStorage.setItem("userLocation", JSON.stringify(locationData));
        // //console.log;
      } else {
        // console.error("Unable to fetch country code.");
      }

      //console.log;
      return data; // Return the fetched data
    } catch (error) {
      //console.log;
      return null;
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => reject(error)
        );
      }
    });
  };

  // useEffect(() => {
  //   // //console.log;

  //   const timer = setTimeout(() => {
  //     const loc = localStorage.getItem("userLocation");

  //     if (loc) {
  //       // //console.log;
  //       const L = JSON.parse(loc);
  //       // //console.log;
  //       // //console.log;
  //       // //console.log;

  //       // if (userPhoneNumber == "") {
  //       //   setCountryCode(L.location);
  //       // }
  //       // //console.log;
  //     }

  //     // //console.log;
  //   }, 300);

  //   return () => clearTimeout(timer);
  // }, []);

  //action detects inner width
  useEffect(() => {
    if (typeof window !== "undefined") {
      // //console.log;
      setInnerWidth(window.innerWidth);
    }
  }, [InnerWidth]);

  const handlePhoneNumberChange = (phone) => {
    // //console.log;
    setUserPhoneNumber(phone);
    validatePhoneNumber(phone);
    setCheckPhoneResponse(null);

    if (!phone) {
      setErrorMessage("");
      setCheckPhoneResponse(null);
    }
  };

  //number validation
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
      }, 300);
    }
  };

  //focus the first input field
  useEffect(() => {
    if (showVerifyPopup && verifyInputRef.current[0]) {
      verifyInputRef.current[0].focus();
    }
  }, [showVerifyPopup]);

  //code to show verify popup

  const handleVerifyPopup = async () => {
    //console.log;
    try {
      setShowVerifyPopup(true);
      setSendcodeLoader(true);
      let response = await SendVerificationCode(userPhoneNumber, true);
      // //console.log;
      // return
      // setResponse(response);
      setIsVisible(true);
      // //console.log;

      if (response.status === true) {
        setMsgType(SnackbarTypes.Success);
        setSnackMessage("Code sent");
      } else if (response.status === false) {
        setSnackMessage(response.message);
        setMsgType(SnackbarTypes.Error);
      }
    } catch (error) {
      // console.error("Error occured", error);
      setSnackMessage("Login failed");
      setMsgType(SnackbarTypes.Error);
    } finally {
      setSendcodeLoader(false);
    }
    setTimeout(() => {
      if (verifyInputRef.current[0]) {
        verifyInputRef.current[0].focus();
      }
    }, 100); // Adjust the delay as needed, 0 should be enough
  };

  //code to login
  const handleLoginOld = async () => {
    try {
      setLoginLoader(true);
      const ApiPath = Apis.LogIn;
      const AipData = {
        phone: userPhoneNumber,
        verificationCode: VerifyCode.join(""),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      // //console.log;

      const response = await axios.post(ApiPath, AipData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        let screenWidth = innerWidth;

        if (screenWidth < 640) {
          setMsgType(SnackbarTypes.Warning);
          setSnackMessage("Access your AI on Desktop");
        } else {
          setMsgType(SnackbarTypes.Success);
          setSnackMessage(response.data.message);
        }

        setIsVisible(true);

        if (response.data.status === true) {
          setLoaderTitle("Redirecting to dashboard...");
          // if (
          //   response.data.data.user.userType !== "RealEstateAgent" &&
          //   response.data.data.user.userRole !== "Invitee"
          // ) {
          if (response.data.data.user.waitlist) {
            // //console.log;

            const twoHoursFromNow = new Date();
            twoHoursFromNow.setTime(twoHoursFromNow.getTime() + 2 * 60 * 1000);
            if (typeof document !== "undefined") {
              setCookie(response.data.data.user, document, twoHoursFromNow);
              router.push("/onboarding/WaitList");
            }
          } else {
            // //console.log;
            // let routeTo = ""

            localStorage.setItem("User", JSON.stringify(response.data.data));
            //set cokie on locastorage to run middle ware
            if (typeof document !== "undefined") {
              // //console.log;

              setCookie(response.data.data.user, document);
              let w = innerWidth;
              if (w < 540) {
                // //console.log;
                router.push("/createagent/desktop");
              } else if (w > 540) {
                // //console.log;

                if (redirect) {
                  router.push(redirect);
                } else {
                  // setUserType()
                  if (response.data.data.user.userType == "admin") {
                    router.push("/admin");
                  } else {
                    router.push("/dashboard/leads");
                  }
                }
              }
            } else {
              // //console.log;
            }
          }
        } else {
          setLoginLoader(false);
        }
      }
    } catch (error) {
      setLoginLoader(false);
      // console.error("ERror occured in login api is :", error);
    } finally {
      // setLoginLoader(false);
    }
  };

  const handleLogin = async () => {
    try {
      const ApiData = {
        phone: userPhoneNumber,
        verificationCode: VerifyCode.join(""),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      console.log("Data sending in login api", ApiData);
      setLoginLoader(true);
      const response = await axios.post(Apis.LogIn, ApiData, {

        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include", // Ensures cookies (JWT) are stored securely

      });
      // setLoginLoader(false);
      //console.log;
      if (response) {
        // const data = response //await response.json();
        console.log('data of login api is', response);

        // console.log;
        // Redirect user or update state as needed
        let screenWidth = innerWidth;

        if (screenWidth < 640) {
          setMsgType(SnackbarTypes.Warning);
          setSnackMessage("Access your AI on Desktop");
        } else {
          setMsgType(
            response.data.status === true ? SnackbarTypes.Success : SnackbarTypes.Error
          );

          setSnackMessage(response.data.message);
        }

        setIsVisible(true);

        if (response.data.status === true) {

          if (response.data.data.user.profile_status === "paused") {
            setLoginLoader(false)
            setMsgType(SnackbarTypes.Error)
            setSnackMessage("Your account has been frozen.")
            return
          }
          setLoaderTitle("Redirecting to dashboard...");
          // if (
          //   response.data.data.user.userType !== "RealEstateAgent" &&
          //   response.data.data.user.userRole !== "Invitee"
          // ) {
          if (response.data.data.user.waitlist) {
            // //console.log;

            const twoHoursFromNow = new Date();
            twoHoursFromNow.setTime(twoHoursFromNow.getTime() + 2 * 60 * 1000);
            if (typeof document !== "undefined") {
              setCookie(response.data.data.user, document, twoHoursFromNow);
              router.push("/onboarding/WaitList");
            }
          } else {
            // //console.log;
            // let routeTo = ""

            localStorage.setItem("User", JSON.stringify(response.data.data));
            //set cokie on locastorage to run middle ware
            if (typeof document !== "undefined") {
              // //console.log;

              setCookie(response.data.data.user, document);
              let w = innerWidth;
              if (w < 540) {
                // //console.log;
                router.push("/createagent/desktop");
              } else if (w > 540) {
                // //console.log;

                if (redirect) {
                  router.push(redirect);
                } else {
                  console.log("user role is", response.data.data.user.userRole);
                  // return
                  if (response.data.data.user.userType == "admin") {
                    router.push("/admin");
                  } else if (response.data.data.user.userRole == "AgencySubAccount") {
                    if (response.data.data.user.plan) {
                      router.push("/dashboard");
                    } else {
                      router.push("/subaccountInvite/subscribeSubAccountPlan");
                    }
                  } else if (response.data.data.user.userRole == "Agency" || response.data.data.user.agencyTeammember === true) {
                    router.push("/agency/dashboard");
                  } else {
                    router.push("/dashboard/myAgentX");
                  }
                  return
                  // if (data.data.user.userType == "admin") {
                  //   router.push("/admin");
                  // } 

                  // else {
                  //   router.push("/dashboard/leads");
                  // }
                }
              }
            } else {
              // //console.log;
            }
          }
        } else {
          setLoginLoader(false);
        }
      } else {
        // console.error("Login failed:", data.error);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error while login api:", error.response?.data || error.message);
      } else {
        console.error("General error while login api:", error);
      }
    }
  };

  //code to check number
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
          setCheckPhoneResponse(response.data.status);
        } else if (response.data.status === false) {
          //console.log;
          setCheckPhoneResponse(response.data.status);
        }
      }
    } catch (error) {
      // console.error("Error occured in check phone api is :", error);
    } finally {
      setPhoneNumberLoader(false);
    }
  };

  //verify code
  // const handleVerifyInputChange = (e, index) => {
  //   const { value } = e.target;
  //   if (!/[0-9]/.test(value) && value !== "") return; // Allow only numeric input

  //   const newValues = [...VerifyCode];
  //   newValues[index] = value;
  //   setVerifyCode(newValues);

  //   // Move focus to the next field if a number is entered
  //   if (value && index < length - 1) {
  //     verifyInputRef.current[index + 1].focus();
  //   }

  //   // Trigger onComplete callback if all fields are filled
  //   if (newValues.every((num) => num !== "") && onComplete) {
  //     onComplete(newValues.join("")); // Convert array to a single string here
  //   }
  // };

  const handleVerifyInputChange = (e, index) => {
    const { value } = e.target;

    // If value is longer than 1, assume it's a paste/autofill
    if (value.length > 1) {
      const newValues = Array(length).fill('');
      value.slice(0, length).split('').forEach((char, i) => {
        if (/[0-9]/.test(char)) {
          newValues[i] = char;
        }
      });

      setVerifyCode(newValues);

      // Focus last filled or next empty
      const lastFilledIndex = newValues.findLastIndex(val => val !== '');
      const focusIndex = Math.min(lastFilledIndex + 1, length - 1);
      verifyInputRef.current[focusIndex]?.focus();

      // Trigger onComplete if all fields filled
      if (newValues.every((num) => num !== '') && onComplete) {
        onComplete(newValues.join(''));
      }

      return;
    }

    // Normal single digit input
    if (!/[0-9]/.test(value) && value !== '') return;

    const newValues = [...VerifyCode];
    newValues[index] = value;
    setVerifyCode(newValues);

    if (value && index < length - 1) {
      verifyInputRef.current[index + 1]?.focus();
    }

    if (newValues.every((num) => num !== '') && onComplete) {
      onComplete(newValues.join(''));
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
    e.preventDefault(); // Prevent default behavior to avoid issues with pasting
    const pastedText = e.clipboardData.getData("text").slice(0, length); // Get the pasted text and slice to length
    const newValues = pastedText
      .split("")
      .map((char) => (/[0-9]/.test(char) ? char : "")); // Filter non-numeric characters

    setVerifyCode(newValues); // Update the state with the new values

    // Set each input's value and move focus to the last filled input
    newValues.forEach((char, index) => {
      if (verifyInputRef.current[index]) {
        verifyInputRef.current[index].value = char;
        // Focus on the last input field that gets filled
        if (index === newValues.length - 1) {
          verifyInputRef.current[index].focus();
        }
      }
    });

    // If all inputs are filled, trigger the onComplete callback
    if (newValues.every((num) => num !== "") && onComplete) {
      onComplete(newValues.join(""));
    }
  };

  const handleVerifyCode = () => {
    // //console.log);
    // setPhoneVerifiedSuccessSnack(true);
    handleLogin();
  };

  const backgroundImage = {
    backgroundImage: 'url("/assets/bg2.png")',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    // backgroundPosition: "50% 50%",
    backgroundPosition: "center",
    width: "55svw",
    height: "90svh",
    overflow: "hidden",
    borderRadius: "15px",
  };

  const styles = {
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
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  return (
    <div className="flex flex-row w-full justify-center h-[100svh]">
      {/* <div className='w-6/12 ms-8 flex flex-row justify-center ' style={backgroundImage}>
        <div className='w-11/12'>
          <div className='h-[433px] w-[494px] md:w-[594px] bg-white mt-16'>
          </div>
          <div className='text-white sm:text-4xl md:text-4xl lg:text-5xl mt-8' style={{ fontWeight: "600" }}>
            Building your persona <br />lead gen assistant
          </div>
          <div className='mt-8' style={{ fontSize: 11.6, fontWeight: "500" }}>
            By signing up to the AgentX platform you understand and agree to our Terms and <br /> Conditions and Privacy Policy. This site is protected by Google reCAPTCHA to<br /> ensure you are not a bot. Learn more
          </div>
        </div>
      </div> */}
      <div className="w-11/12 flex flex-col items-center h-[95svh] ">
        <div className="w-full gap-3 h-[10%] flex flex-row items-end">
          <Image
            className=""
            src="/assets/assignX.png"
            style={{ height: "29px", width: "122px", resize: "contain" }}
            height={29}
            width={122}
            alt="*"
          />
          {/* <Image className='hidden md:flex' src="/agentXOrb.gif" style={{ height: "69px", width: "75px", resize: "contain" }} height={69} width={69} alt='*' /> */}
        </div>
        <div className="w-full  h-[80%] flex flex-row items-center justify-center">
          <div className="w-full">
            <div className="flex flex-col w-full items-center gap-4 pb-6">
              <Image
                src={"/assets/signinAvatar.png"}
                height={100}
                width={260}
                alt="avtr"
              />
              <Image src={"/agentXOrb.gif"} height={69} width={69} alt="gif" />
            </div>

            {/* Code for phone input field */}
            <div className="flex flex-row items-center justify-center gap-2 w-full">
              <div className="flex flex-row items-center gap-2 border rounded-lg w-full sm:w-4/12 justify-between pe-4">
                <div className="w-[90%]">
                  <PhoneInput
                    className="outline-none bg-transparent focus:ring-0"
                    country={"us"} // Default country
                    value={userPhoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder={
                      locationLoader
                        ? "Loading location ..."
                        : "Enter Phone Number"
                    }
                    disabled={loading} // Disable input if still loading
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && userPhoneNumber && !errorMessage) {
                        setEnterPressed(true);
                      }
                      // setShowVerifyPopup(true)
                    }}
                    style={{
                      borderRadius: "7px",
                      outline: "none", // Ensure no outline on wrapper
                      boxShadow: "none", // Remove any shadow
                    }}
                    inputStyle={{
                      width: "100%",
                      borderWidth: "0px",
                      backgroundColor: "transparent",
                      paddingLeft: "60px",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                      height: "50px",
                      outline: "none", // Remove outline on input
                      boxShadow: "none", // Remove shadow as well
                    }}
                    buttonStyle={{
                      border: "none",
                      backgroundColor: "transparent",
                      outline: "none", // Ensure no outline on button
                    }}
                    dropdownStyle={{
                      maxHeight: "150px",
                      overflowY: "auto",
                    }}
                    countryCodeEditable={false}
                    disableDropdown={true}
                    defaultMask={locationLoader ? "Loading..." : undefined}
                  />
                </div>
                {loginLoader ? (
                  <div className="flex flex-row justify-center">
                    <CircularProgress size={15} />
                  </div>
                ) : (
                  <button
                    className="text-black bg-transparent border border-[#000000] rounded-full"
                    style={{ fontSize: 16, fontWeight: "600" }}
                    onClick={() => {
                      if (checkPhoneResponse === false) {
                        handleVerifyPopup();
                      }
                      // setShowVerifyPopup(true)
                      // handleVerifyPopup();
                    }}
                  >
                    <ArrowRight size={20} weight="bold" />
                  </button>
                )}
              </div>
            </div>

            {/* Code for error messages */}
            <div className="flex flex-row items-center w-full justify-center mt-4">
              <div>
                {errorMessage ? (
                  <div className="text-center" style={styles.errmsg}>
                    {errorMessage}
                  </div>
                ) : (
                  <div>
                    {phoneNumberLoader ? (
                      <div className="text-center" style={styles.errmsg}>
                        Checking
                      </div>
                    ) : (
                      <div
                        style={{
                          ...styles.errmsg,
                          color:
                            checkPhoneResponse?.status === false
                              ? "green"
                              : "red",
                          height: "20px",
                        }}
                      >
                        {checkPhoneResponse && (
                          <div className="text-center">
                            {checkPhoneResponse === true
                              ? "User not found"
                              : ""}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex flex-row items-center justify-center gap-1 mt-[40px]"
              style={{ fontWeight: "500", fontSize: 15 }}
            >
              <div //onClick={() => setShowVerifyPopup(true)}
              >
                {`Don't have an account?`}
              </div>
              <Link
                className=""
                href={"/onboarding"}
                // onClick={() => {
                //   router.push("/onboarding");
                // }}
                style={{ fontWeight: "bold", fontSize: 15 }}
              >
                Sign Up
              </Link>
            </div>

            {/* Login with calendar */}
            <div>

            </div>

          </div>
        </div>

        <div
          className="mt-6 h-[10%] flex flex-row items-end justify-end w-full gap-2 overflow-auto flex-shrink-0 hidden sm:flex"
          style={{ fontWeight: "500", fontSize: 11.6 }}
        >
          <div className="flex-shrink-0">
            Copyrights @ 2025 MyAgentX. All Rights Reserved.
          </div>
          <button
            className="flex-shrink-0 outline-none"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.open(
                  "https://www.myagentx.com/terms-and-condition",
                  "_blank"
                );
              }
            }}
          >
            | Terms & Conditions
          </button>
          <button
            className="flex-shrink-0 outline-none"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.open(
                  "https://www.myagentx.com/terms-and-condition",
                  "_blank"
                );
              }
            }}
          >
            | Privacy Policy
          </button>
        </div>

        <div className="h-[10%]  w-full flex flex-col items-center justify-center sm:hidden">
          <div
            className="mt-6 flex flex-row items-center justify-end gap-2 overflow-auto flex-shrink-0"
            style={{ fontWeight: "500", fontSize: 11.6 }}
          >
            <button
              className="flex-shrink-0 outline-none"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open(
                    "https://www.myagentx.com/terms-and-condition",
                    "_blank"
                  );
                }
              }}
            >
              Terms & Conditions
            </button>
            <button
              className="flex-shrink-0 outline-none"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open(
                    "https://www.myagentx.com/terms-and-condition",
                    "_blank"
                  );
                }
              }}
            >
              | Privacy Policy
            </button>
          </div>
          <div
            className="flex-shrink-0 text-center"
            style={{ fontWeight: "500", fontSize: 11.6 }}
          >
            Copyrights @ 2025 MyAgentX. All Rights Reserved.
          </div>
        </div>
      </div>

      {/* Modals code goes here */}
      <Modal
        open={showVerifyPopup}
        // onClose={() => setAddKYCQuestion(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(20px)",
            padding: 0,
            margin: 0,
          },
        }}
      >
        <Box className="lg:w-8/12 sm:w-10/12 w-10/12" sx={styles.verifyPopup}>
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
                <button
                  onClick={() => {
                    setShowVerifyPopup(false);
                  }}
                >
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

              <div
                className="mt-8 w-ful flex flex-row items-center gap-2 overflow-auto"
                style={{ display: "flex", gap: "8px" }}
              >
                {Array.from({ length }).map((_, index) => (
                  <input
                    className=" focus:outline-none focus:ring-0"
                    key={index}
                    ref={(el) => (verifyInputRef.current[index] = el)}
                    type="tel"
                    inputMode="numeric"
                    // type="tel"
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
                      width: InnerWidth < 540 ? "40px" : "40px",
                      height: InnerWidth < 540 ? "40px" : "40px",
                      textAlign: "center",
                      fontSize: InnerWidth < 540 ? 15 : 20,
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                ))}
              </div>
              <div
                className="mt-8 flex flex-row items-center gap-1"
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
              {loginLoader ? (
                <div className="flex fex-row items-center justify-center mt-8">
                  <LoaderAnimation
                    loaderModal={loginLoader}
                    title={loaderTitle}
                  />
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

      <AgentSelectSnackMessage
        message={snackMessage}
        type={msgType}
        isVisible={isVisible}
        hide={() => {
          setIsVisible(false);
          setSnackMessage("");
          setMsgType(null);
        }}
      />
    </div>
  );
};

export default LoginComponent;
