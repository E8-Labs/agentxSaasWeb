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

const Page = ({ params }) => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  let windowSize = 1000;
  if (typeof window != "undefined") {
    windowSize = window.innerWidth;
    console.log("Window with ", windowSize);
  } else {
    console.log("Window width is less");
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
    console.log(`Agent name is`);
    setUserDetails({
      name: userName,
      email: userEmail,
      phone: userPhoneNumber,
    });
  };

  useEffect(() => {
    let screenWidth = window.innerWidth;
    if (screenWidth < 640) {
      setComponents([
        UserType,
        UserService,
        FocusArea,
        BasicDetails,
        OtherDetails,
        Congrats,
        // SalesDevAgent, SolarRepAgentSignUp,
        // InsuranceAgentSignUp, MarketerAgentSignUp,
        // WebOwnersAgentSignUp, RecruiterAgentSignUp,
        // TaxAgentSignUp
      ]);
    } else {
      setComponents([
        UserType,
        UserService,
        FocusArea,
        SignUpForm,
        Congrats,
        SalesDevAgent,
        SolarRepAgentSignUp,
        InsuranceAgentSignUp,
        MarketerAgentSignUp,
        WebOwnersAgentSignUp,
        RecruiterAgentSignUp,
        TaxAgentSignUp,
      ]);
    }
  }, []);

  let CurrentComp = components[index];

  //function for moving to the other agents sign up pages

  // Function to proceed to the next step
  const handleContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 1);
  };

  //sals dev
  const handleSalesAgentContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 3);
  };

  const handleSalesAgentBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 3);
  };

  //solar rep
  const handleSolarAgentContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 4);
  };

  const handleSolarAgentBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 4);
  };

  // insurance
  const handleInsuranceContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 5);
  };

  const handleInsuranceBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 5);
  };

  // marketer
  const handleMarketerAgentContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 6);
  };

  const handleMarketerAgentBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 6);
  };

  // website owners
  const handleWebsiteAgentContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 7);
  };

  const handleWebsiteAgentBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 7);
  };
  // recruiter agent
  const handleRecruiterAgentContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 8);
  };

  const handleRecruiterAgentBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 8);
  };
  // tax agent
  const handleTaxAgentContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 9);
  };

  const handleTaxAgentBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 9);
  };

  const handleBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 1);
  };

  //move other agent to wait list
  const handleWaitList = () => {
    router.push("/onboarding/WaitList");
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
        handleSalesAgentBack={handleSalesAgentBack}
        handleSolarAgentBack={handleSolarAgentBack}
        handleInsuranceBack={handleInsuranceBack}
        handleMarketerAgentBack={handleMarketerAgentBack}
        handleWebsiteAgentBack={handleWebsiteAgentBack}
        handleRecruiterAgentBack={handleRecruiterAgentBack}
        handleTaxAgentBack={handleTaxAgentBack}
        //move other agents to wait list
        handleWaitList={handleWaitList}
        handleDetails={handleDetails}
        userDetails={userDetails}
      />
    </div>
  );
};

export default Page;
