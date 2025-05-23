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
import { GetCampaigneeNameIfAvailable } from "@/utilities/UserUtility";
import { PersistanceKeys } from "@/constants/Constants";
import { UserTypes } from "@/constants/UserTypes";
import RealEstateOtherDetails from "./RealEstateOtherDetails";
import SolarRepAgentSignUp from "../otherAgentsSignUp/SolarRepAgentSignUp";
import SolarRepOtherDetails from "./SalesRepOtherDetails";
import SalesDevRepOtherDetails from "./SolerDevRepOtherDetails";
import InsuranceOtherDetails from "./InsuranceOtherDetails";
import MarketerOtherDetails from "./MarketerOtherDetails";
import RecuiterOtherDetails from "./RecuiterOtherDetails";
import DebtCollectorOtherDetails from "./DebtCollectorOtherDetails";
import WebsiteAgentOtherDetails from "./WebsiteAgentOtherDetails";
import MedSpaAgentOtherDetails from "./MedSpaAgentOtherDetails";
import { set } from "draft-js/lib/DefaultDraftBlockRenderMap";
import LawAgentOtherDetails from "./LawAgentOtherDetails";
import LoanOfficerOtherDetails from "./LoanOfficerOtherDetails";

const OtherDetails = ({
  handleContinue,
  handleBack,
  length = 6,
  onComplete,
  userDetails,
}) => {
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

  //code for other agents variables

  //for sales dev rep
  const [service, setService] = useState("");
  const [companyName, setCompanyName] = useState("");

  //for solar dev
  const [installationVolume, setInstallationVolume] = useState("");
  const [projectSize, setProjectSize] = useState("");
  const [ClientType, setClientType] = useState(null);
  const [collectionStretigy, setCollectionStretigy] = useState(null);

  //for webURL
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlErrorMessage, setUrlErrorMessage] = useState("");



  const [territory, setTerritory] = useState("");
  const [firmOrCompanyAffiliation, setFirmOrCompanyAffiliation] = useState("");
  const [averageMonthlyClients, setAverageMonthlyClients] = useState("");

  const [consultation, setConsultation] = useState("");
  const [caseVolume, setCaseVolume] = useState("");



  //array for the primary client types
  const primaryClientTypes = [
    {
      id: 1,
      title: "Residential clients",
    },
    {
      id: 2,
      title: "Commercial clients",
    },
    {
      id: 3,
      title: "Both",
    },
  ];

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
    const registerationDetails = localStorage.getItem(
      PersistanceKeys.RegisterDetails
    );
    inputsFields.current[0]?.focus();
    if (registerationDetails) {
      const registerationData = JSON.parse(registerationDetails);
      // //console.log;
      setUserData(registerationData);
    } else {
      // alert("Add details to continue");
    }
  }, []);

  useEffect(() => {
    //console.log
    //console.log
    //console.log
    //console.log
  }, [service, companyName, installationVolume, collectionStretigy])

  // Function to get the user's location and set the country code
  useEffect(() => {
    if (
      userData?.userTypeTitle === "SalesDevRep" ||
      userData?.userTypeTitle === "MarketerAgent"
    ) {
      if (service && companyName) {
        setShouldContinue(false);
      } else {
        setShouldContinue(true);
      }
    } else if (userData?.userTypeTitle === UserTypes.RealEstateAgent) {
      console.log("Real Estate Agent Fields:", {
        userFarm,
        userBrokage,
        userTransaction
      });
      if (
        userFarm &&
        userBrokage &&
        userTransaction

      ) {
        setShouldContinue(false);
      } else if (!userFarm || !userBrokage || !userTransaction) {
        setShouldContinue(true);
      }
    }

    else if (userData?.userTypeTitle === "SolarRep") {
      if (
        service &&
        companyName &&
        installationVolume &&
        projectSize &&
        ClientType
      ) {
        setShouldContinue(false);
      } else {
        setShouldContinue(true);
      }
    } else if (userData?.userTypeTitle === "InsuranceAgent") {
      if (userFarm && userBrokage) {
        setShouldContinue(false);
      } else {
        setShouldContinue(true);
      }
    } else if (userData?.userTypeTitle === UserTypes.DebtCollectorAgent) {
      if (service && companyName && installationVolume && collectionStretigy) {
        setShouldContinue(false);
      } else {
        setShouldContinue(true);
      }
    } else if (userData?.userTypeTitle === "WebsiteAgent") {
      if (websiteUrl) {
        setShouldContinue(false);
      } else {
        setShouldContinue(true);
      }
    } else if (
      userData?.userTypeTitle === "RecruiterAgent" ||
      userData?.userTypeTitle === "TaxAgent"
    ) {
      if (service) {
        setShouldContinue(false);
      } else {
        setShouldContinue(true);
      }
    } else if (userData?.userTypeTitle === UserTypes.MedSpaAgent) {
      if (territory && firmOrCompanyAffiliation && averageMonthlyClients) {
        setShouldContinue(false);
      } else if (!territory || !firmOrCompanyAffiliation || !averageMonthlyClients) {
        {
          setShouldContinue(true);
        }
      }
    }
    else if (userData?.userTypeTitle === UserTypes.LawAgent) {
      if (territory && firmOrCompanyAffiliation && caseVolume && consultation && ClientType) {
        setShouldContinue(false);
      } else if (!territory || !firmOrCompanyAffiliation || !caseVolume || !consultation || !ClientType) {
        {
          setShouldContinue(true);
        }
      }

    }
    else if (userData?.userTypeTitle === UserTypes.LoanOfficerAgent) {
      if (territory && firmOrCompanyAffiliation && ClientType) {
        setShouldContinue(false);
      } else if (!territory || !firmOrCompanyAffiliation || !ClientType) {
        {
          setShouldContinue(true);
        }
      }

    }

    else {
      if (userFarm && userBrokage && userTransaction) {
        setShouldContinue(false);
      } else {
        setShouldContinue(true);
      }
    }
  }, [
    userFarm,
    userBrokage,
    userTransaction,
    checkPhoneResponse,
    emailCheckResponse,
    service,
    companyName,
    projectSize,
    collectionStretigy,
    installationVolume,
    ClientType,
    territory,
    firmOrCompanyAffiliation,
    averageMonthlyClients,
    caseVolume,
    consultation,
  ]);


  //code to focus the verify code input field
  useEffect(() => {
    if (showVerifyPopup && verifyInputRef.current[0]) {
      verifyInputRef.current[0].focus();
    }
  }, [showVerifyPopup]);

  //select client type function
  const handleSelectClientType = (item) => {
    // //console.log;
    setClientType(item.title);
  };

  const handleSelectCollectionStretigy = (item) => {
    // //console.log;
    setCollectionStretigy(item.title);
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

  //code for verify number popup

  const handleVerifyPopup = async () => {
    // let response = await SendVerificationCode(userPhoneNumber, true);
    try {
      setShowVerifyPopup(true);
      setTimeout(() => {
        if (verifyInputRef.current[0]) {
          verifyInputRef.current[0].focus();
        }
      }, 100);
      setSendcodeLoader(true);
      let response = await SendVerificationCode(userDetails.phone, true);
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

      const formData = new FormData();
      const ApiPath = Apis.register;
      let campainee = GetCampaigneeNameIfAvailable(window);
      if (campainee) {
        formData.append("campaignee", campainee);
      }
      // const formData = new FormData();
      formData.append("name", userDetails.name);
      formData.append("email", userDetails.email);
      formData.append("phone", userDetails.phone);

      if (userFarm) {
        formData.append("farm", userFarm);
      }
      if (userBrokage) {
        formData.append("brokerage", userBrokage);
      }
      if (userTransaction) {
        formData.append("averageTransactionPerYear", userTransaction);
      }
      if (service) {
        formData.append("areaOfService", service);
      }
      if (companyName) {
        formData.append("company", companyName);
      }
      if (installationVolume) {
        formData.append("projectsPerYear", installationVolume);
      }
      if (projectSize) {
        formData.append("projectSizekw", projectSize);
      }
      if (websiteUrl) {
        formData.append("website", websiteUrl);
      }
      if (collectionStretigy) {
        formData.append("collectionStrategy", collectionStretigy);
      }
      if (ClientType) {
        formData.append("clientType", ClientType);
      }
      if (territory) {
        formData.append("territory", territory);
      }
      if (firmOrCompanyAffiliation) {
        formData.append("firmOrCompanyAffiliation", firmOrCompanyAffiliation);
      }
      if (averageMonthlyClients) {
        formData.append("averageMonthlyClients", averageMonthlyClients);
      }
      if (caseVolume) {
        formData.append("caseVolume", caseVolume);
      }
      if (consultation) {
        formData.append("consultationFormat", consultation);
      }

      formData.append("agentService", JSON.stringify(userData.serviceID));
      formData.append("areaOfFocus", JSON.stringify(userData.focusAreaId));
      formData.append("userType", agentTitle);

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

          const screenWidth = window.innerWidth; // Get current screen width
          const SM_SCREEN_SIZE = 640; // Tailwind's sm breakpoint is typically 640px

          if (screenWidth <= SM_SCREEN_SIZE) {
             setShowVerifyPopup(false)
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

  const handleConsultationFormat = (item) => {
    setConsultation(item.title);
  };


  const getOtherAgentDetailsComponent = () => {
    //console.log;

    if (userData?.userTypeTitle) {

      if (userData?.userTypeTitle === UserTypes.RealEstateAgent) {
        return (
          <RealEstateOtherDetails
            inputsFields={inputsFields}
            userBrokage={userBrokage}
            userFarm={userFarm}
            userTransaction={userTransaction}
            setUserBrokage={setUserBrokage}
            setUserFarm={setUserFarm}
            setUserTransaction={setUserTransaction}
            handleVerifyPopup={handleVerifyPopup}

          />
        )
      }
      if (userData?.userTypeTitle === UserTypes.SalesDevRep) {
        return (
          <SalesDevRepOtherDetails
            inputsFields={inputsFields}
            service={service}
            companyName={companyName}
            setService={setService}
            setCompanyName={setCompanyName}
            handleVerifyPopup={handleVerifyPopup}
          />
        )
      }
      if (userData?.userTypeTitle === UserTypes.SolarRep) {
        return (
          <SolarRepOtherDetails
            inputsFields={inputsFields}
            installationVolume={installationVolume}
            projectSize={projectSize}
            ClientType={ClientType}
            setInstallationVolume={setInstallationVolume}
            setProjectSize={setProjectSize}
            companyName={companyName}
            setCompanyName={setCompanyName}
            service={service}
            setService={setService}
            setClientType={setClientType}
            handleSelectClientType={(item) => handleSelectClientType(item)}
            handleVerifyPopup={handleVerifyPopup}

          />
        )
      }

      if (userData?.userTypeTitle === UserTypes.InsuranceAgent) {
        return (
          <InsuranceOtherDetails
            inputsFields={inputsFields}
            userBrokage={userBrokage}
            userFarm={userFarm}
            setUserBrokage={setUserBrokage}
            setUserFarm={setUserFarm}
            handleVerifyPopup={handleVerifyPopup}
          />
        )
      }

      if (userData?.userTypeTitle === UserTypes.MarketerAgent) {
        return (
          <MarketerOtherDetails
            inputsFields={inputsFields}
            service={service}
            companyName={companyName}
            setService={setService}
            setCompanyName={setCompanyName}
            handleVerifyPopup={handleVerifyPopup}
          />
        )
      }
      // tax and recruiter agent have same UI


      if (userData?.userTypeTitle === UserTypes.RecruiterAgent ||
        userData?.userTypeTitle === UserTypes.TaxAgent
      ) {
        return (
          <RecuiterOtherDetails
            inputsFields={inputsFields}
            service={service}
            setService={setService}
            handleVerifyPopup={handleVerifyPopup}
          />
        )
      }

      if (userData?.userTypeTitle === UserTypes.DebtCollectorAgent) {
        return (
          <DebtCollectorOtherDetails
            inputsFields={inputsFields}
            service={service}
            setService={setService}
            companyName={companyName}
            setCompanyName={setCompanyName}
            installationVolume={installationVolume}
            setInstallationVolume={setInstallationVolume}
            handleVerifyPopup={handleVerifyPopup}
            collectionStretigy={collectionStretigy}
            handleSelectCollectionStretigy={handleSelectCollectionStretigy}
          />
        )
      }

      if (userData?.userTypeTitle === UserTypes.WebsiteAgent) {
        return (
          <WebsiteAgentOtherDetails
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            urlErrorMessage={urlErrorMessage}
            setUrlErrorMessage={setUrlErrorMessage}
            handleVerifyPopup={handleVerifyPopup}
          />
        )
      }

      if (userData?.userTypeTitle === UserTypes.MedSpaAgent) {
        return (
          <MedSpaAgentOtherDetails
            inputsFields={inputsFields}
            customerService={territory}
            setCustomerService={setTerritory}
            companyName={firmOrCompanyAffiliation}
            setCompanyName={setFirmOrCompanyAffiliation}
            installationVolume={averageMonthlyClients}
            setInstallationVolume={setAverageMonthlyClients}
            handleVerifyPopup={handleVerifyPopup}
          />
        )
      }

      if (userData?.userTypeTitle === UserTypes.LawAgent) {
        return (
          <LawAgentOtherDetails
            inputsFields={inputsFields}
            customerService={territory}
            setCustomerService={setTerritory}
            companyName={firmOrCompanyAffiliation}
            setCompanyName={setFirmOrCompanyAffiliation}
            installationVolume={caseVolume}
            setInstallationVolume={setCaseVolume}
            handleVerifyPopup={handleVerifyPopup}
            consultation={consultation}
            handleConsultationFormat={handleConsultationFormat}
            ClientType={ClientType}
            handleSelectClientType={handleSelectClientType}
          />
        )
      }

      if (userData?.userTypeTitle === UserTypes.LoanOfficerAgent) {
        return (
          <LoanOfficerOtherDetails
            inputsFields={inputsFields}
            customerService={territory}
            setCustomerService={setTerritory}
            companyName={firmOrCompanyAffiliation}
            setCompanyName={setFirmOrCompanyAffiliation}
            ClientType={ClientType}
            handleSelectClientType={(item) => handleSelectClientType(item)}
            handleVerifyPopup={handleVerifyPopup}
          />
        )
      }



      // else {

      //   return (
      //     <RealEstateOtherDetails
      //       inputsFields={inputsFields}
      //       userBrokage={userBrokage}
      //       userFarm={userFarm}
      //       userTransaction={userTransaction}
      //       setUserBrokage={setUserBrokage}
      //       setUserFarm={setUserFarm}
      //       setUserTransaction={setUserTransaction}
      //       handleVerifyPopup={handleVerifyPopup}
      //     />
      //   )
      // }
    }
  }

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <div className="bg-white sm:rounded-2xl sm:mx-2 w-full md:w-10/12 h-[100%] sm:max-h-[90%] py-4 overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple">
        <div className="h-[90svh] sm:h-[82svh]">
          {/* header 84svh */}
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
              className="mt-4 sm:mt-8 w-full md:w-10/12 lg:w-6/12 flex flex-col max-h-[90%] sm:max-h-[85%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple px-2"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Other Agents Other Details */}

              {
                getOtherAgentDetailsComponent()
              }

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
                        Enter code that was sent to number ending with ***
                        {userDetails?.phone.slice(-4)}.
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

                      <div className="w-full mt-2 flex flex-row justify-center">
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
                          fontSize: 26,
                          fontWeight: "700",
                          textAlign: "center",
                          marginTop: 20,
                        }}
                      >
                        Congrats!
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

                      {/* <div
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          textAlign: "center",
                          marginTop: 15,
                          color: "#000000",
                        }}
                      >
                        {`Let’s build your AI AgentX`}
                      </div> */}

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
                            router.push("/createagent");
                          }}
                        >
                          Get Started
                        </button>
                      )}
                    </div>
                  </div>
                </Box>
              </Modal>

             
            </div>
          </div>
        </div>

        <div className="h-[10%]">
          <div>
            <ProgressBar value={80} />
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

export default OtherDetails;
