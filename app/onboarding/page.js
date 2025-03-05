"use client";
import React, { useEffect, useState } from "react";
import Congrats from "@/components/onboarding/Congrats";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import UserType from "@/components/onboarding/UserType";
import UserService from "@/components/onboarding/UserService";
import FocusArea from "@/components/onboarding/FocusArea";
import SignUpForm from "@/components/onboarding/SignUpForm";
import InsuranceAgentSignUp from "@/components/onboarding/otherAgentsSignUp/InsuranceAgentSignUp";
import SalesDevAgent from "@/components/onboarding/otherAgentsSignUp/SalesDevAgent";
import SolarRepAgentSignUp from "@/components/onboarding/otherAgentsSignUp/SolarRepAgentSignUp";
import MarketerAgentSignUp from "@/components/onboarding/otherAgentsSignUp/MarketerAgentSignUp";
import WebOwnersAgentSignUp from "@/components/onboarding/otherAgentsSignUp/WebOwnersAgentSignUp";
import RecruiterAgentSignUp from "@/components/onboarding/otherAgentsSignUp/RecruiterAgentSignUp";
import TaxAgentSignUp from "@/components/onboarding/otherAgentsSignUp/TaxAgentSignUp";
import { useRouter } from "next/navigation";
import OtherDetails from "@/components/onboarding/mobileUI/OtherDetails";
import BasicDetails from "@/components/onboarding/mobileUI/BasicDetails";
import BackgroundVideo from "@/components/general/BackgroundVideo";
import { Modal } from "@mui/material";
import { UserTypes } from "@/constants/UserTypes";
import { PersistanceKeys } from "@/constants/Constants";
import DebtCollectorAgentSignUp from "@/components/onboarding/DebtCollectorAgentSignUp";
import DebtCollerterAgentSignUp from "@/components/onboarding/otherAgentsSignUp/DebtCollecterAgentSignUp";
import MedSpaAgentSignUp from "@/components/onboarding/otherAgentsSignUp/MedSpaAgentSignUp";
import LawAgentSignUp from "@/components/onboarding/otherAgentsSignUp/LawAgentSignUp";
import LoanOfficerSignUp from "@/components/onboarding/otherAgentsSignUp/LoanOfficerSignUp";
import MedSpaAgentSignUpMobile from "@/components/onboarding/mobileUI/MedSpaAgentSignUpMobile";
import LoanOfficerSignUpMobile from "@/components/onboarding/mobileUI/LoanOfficerSignUpMobile";
import LawAgentSignUpMobile from "@/components/onboarding/mobileUI/LawAgentSignUpMobile";
import TexAgentSignUpMoble from "@/components/onboarding/mobileUI/TexAgentSignUpMoble";
import ErrorBoundary from "@/components/ErrorBoundary";

const Page = ({ params }) => {
  const router = useRouter();
  const [congratsPopup, setCongratsPopup] = useState(false);
  const [userType, setUserType] = useState(UserTypes.RealEstateAgent);
  const [index, setIndex] = useState(0);
  let windowSize = 1000;
  if (typeof window !== "undefined") {
    windowSize = window.innerWidth;
    // console.log("Window with ", windowSize);
  } else {
    // console.log("Window width is less");
  }

  const [components, setComponents] = useState([
    UserType,
    UserService,
    FocusArea,
    BasicDetails,
    OtherDetails,
    // UserType, UserService,
    // FocusArea, SignUpForm, Congrats,
    // SalesDevAgent, SolarRepAgentSignUp,
    // InsuranceAgentSignUp, MarketerAgentSignUp,
    // WebOwnersAgentSignUp, RecruiterAgentSignUp,
    // TaxAgentSignUp
  ]);

  //variables store userDetails
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

  //function stores the agentDetails
  const handleDetails = (userName, userEmail, userPhoneNumber) => {
    // console.log(`Agent name is`);
    setUserDetails({
      name: userName,
      email: userEmail,
      phone: userPhoneNumber,
    });
  };

  useEffect(() => {
    console.log("🔥 useEffect is running...");
    let screenWidth = 1000;
    if (typeof window !== "undefined") {
      screenWidth = window.innerWidth;
    }

    if (screenWidth < 640) {
      let comps = getMobileComponent();
      console.log("Setting mobile UI");
      if (userType) {
        setComponents(comps.filter(Boolean));

        // let oldComps = [
        //   UserType,
        //   UserService,
        //   FocusArea,
        //   userType === UserTypes.DebtCollectorAgent
        //     ? DebtCollerterAgentSignUp
        //     : userType === UserTypes.LawAgent
        //     ? LawAgentSignUpMobile
        //     : userType === UserTypes.MedSpaAgent
        //     ? MedSpaAgentSignUpMobile
        //     : userType === UserTypes.LoanOfficerAgent
        //     ? LoanOfficerSignUpMobile
        //     : BasicDetails, // Fallback

        //   userType === UserTypes.DebtCollectorAgent
        //     ? DebtCollerterAgentSignUp
        //     : OtherDetails,
        //   Congrats,
        // ];
        // setComponents(oldComps);

        console.log(
          "🚀 Components from getComponentToRender:",
          comps.map((c) => c?.name || "undefined")
        );
      }
    } else {
      let comps = getComponentToRender();
      // console.log("Setting components", comps.length);
      // console.log(
      //   "🚀 Components from getComponentToRender:",
      //   comps.map((c) => c?.name || "undefined")
      // );
      setComponents(comps.filter(Boolean));
    }
  }, [userType]);
  // registerDetails  {"serviceID":[102],"focusAreaId":[406],"userType":4,"userTypeTitle":"InsuranceAgent","areaFocusTitle":"What area of insurance do you focus on?","otherFocusArea":""}
  function getComponentToRender() {
    console.log("Inside get components");
    let agentTitle = userType; //userData?.userTypeTitle || null;
    console.log("Agent title  = ", agentTitle);

    const agentComponents = {
      [UserTypes.RealEstateAgent]: SignUpForm,
      [UserTypes.SalesDevRep]: SalesDevAgent,
      [UserTypes.SolarRep]: SolarRepAgentSignUp,
      [UserTypes.InsuranceAgent]: InsuranceAgentSignUp,
      [UserTypes.MarketerAgent]: MarketerAgentSignUp,
      [UserTypes.WebsiteAgent]: WebOwnersAgentSignUp,
      [UserTypes.RecruiterAgent]: RecruiterAgentSignUp,
      [UserTypes.TaxAgent]: TaxAgentSignUp,
      [UserTypes.DebtCollectorAgent]: DebtCollectorAgentSignUp,
      [UserTypes.MedSpaAgent]: MedSpaAgentSignUp,
      [UserTypes.LawAgent]: LawAgentSignUp,
      [UserTypes.LoanOfficerAgent]: LoanOfficerSignUp,
    };

    const selectedComponent = agentComponents[agentTitle] || SignUpForm;

    // 🚀 Ensure components are functions, not strings
    const finalComponents = [
      UserType,
      UserService,
      FocusArea,
      selectedComponent,
      Congrats,
    ].filter(Boolean);

    return finalComponents;
  }

  function getMobileComponent() {
    console.log("Inside get mobile components");
    let agentTitle = userType; //userData?.userTypeTitle || null;
    console.log("Agent title  = ", agentTitle);

    const agentComponents = {
      [UserTypes.RealEstateAgent]: BasicDetails,
      [UserTypes.SalesDevRep]: BasicDetails,
      [UserTypes.SolarRep]: BasicDetails,
      [UserTypes.InsuranceAgent]: BasicDetails,
      [UserTypes.MarketerAgent]: BasicDetails,
      [UserTypes.WebsiteAgent]: BasicDetails,
      [UserTypes.RecruiterAgent]: BasicDetails,
      [UserTypes.TaxAgent]: BasicDetails,
      [UserTypes.DebtCollectorAgent]: BasicDetails,
      [UserTypes.MedSpaAgent]: MedSpaAgentSignUpMobile,
      [UserTypes.LawAgent]: LawAgentSignUpMobile,
      [UserTypes.LoanOfficerAgent]: LoanOfficerSignUpMobile,
    };

    const selectedComponent = agentComponents[agentTitle] || SignUpForm;

    // 🚀 Ensure components are functions, not strings
    const finalComponents = [
      UserType,
      UserService,
      FocusArea,
      selectedComponent,
      OtherDetails,
      Congrats,
    ].filter(Boolean);

    return finalComponents;
  }

  let CurrentComp = components[index];

  //function for moving to the other agents sign up pages

  // Function to proceed to the next step
  const handleContinue = () => {
    console.log("Component indexchanged ", index + 1);
    setIndex(index + 1);
  };

  //sals dev
  const handleSalesAgentContinue = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index + 3);
  };

  const handleSalesAgentBack = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index - 3);
  };

  //solar rep
  const handleSolarAgentContinue = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index + 4);
  };

  const handleSolarAgentBack = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index - 4);
  };

  // insurance
  const handleInsuranceContinue = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index + 5);
  };

  const handleInsuranceBack = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index - 5);
  };

  // marketer
  const handleMarketerAgentContinue = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index + 6);
  };

  const handleMarketerAgentBack = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index - 6);
  };

  // website owners
  const handleWebsiteAgentContinue = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index + 7);
  };

  const handleWebsiteAgentBack = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index - 7);
  };
  // recruiter agent
  const handleRecruiterAgentContinue = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index + 8);
  };

  const handleRecruiterAgentBack = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index - 8);
  };
  // tax agent
  const handleTaxAgentContinue = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index + 9);
  };

  const handleTaxAgentBack = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index - 9);
  };

  const handleBack = () => {
    // console.log("Component indexchanged ", index);
    setIndex(index - 1);
  };

  //move other agent to wait list
  const handleWaitList = () => {
    router.push("/onboarding/WaitList");
  };

  const handleUserTypeChange = (userType) => {
    console.log("User type has changed");
    setUserType(userType);
  };

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "100svh",
    overflow: "none",
  };

  return (
    <ErrorBoundary>
      <div
        // style={backgroundImage}
        className="overflow-hidden flex flex-row justify-center items-center h-[100svh]"
      >
        {windowSize > 640 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundColor: "white",
              zIndex: -1, // Ensure the video stays behind content
            }}
          >
            <BackgroundVideo />
          </div>
        )}
        <CurrentComp
          handleContinue={handleContinue}
          handleBack={handleBack}
          handleSalesAgentContinue={handleSalesAgentContinue}
          handleSolarAgentContinue={handleSolarAgentContinue}
          handleInsuranceContinue={handleInsuranceContinue}
          handleMarketerAgentContinue={handleMarketerAgentContinue}
          handleWebsiteAgentContinue={handleWebsiteAgentContinue}
          handleRecruiterAgentContinue={handleRecruiterAgentContinue}
          handleTaxAgentContinue={handleTaxAgentContinue}
          handleSalesAgentBack={handleBack}
          handleSolarAgentBack={handleBack}
          handleInsuranceBack={handleBack}
          handleMarketerAgentBack={handleBack}
          handleWebsiteAgentBack={handleBack}
          handleRecruiterAgentBack={handleBack}
          handleTaxAgentBack={handleBack}
          //move other agents to wait list
          handleWaitList={handleWaitList}
          handleDetails={handleDetails}
          userDetails={userDetails}
          setCongratsPopup={setCongratsPopup}
          handleUserTypeChange={handleUserTypeChange}
        />
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
          <Congrats />
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default Page;