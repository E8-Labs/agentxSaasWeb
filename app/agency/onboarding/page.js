"use client";
import AgencySignUp from "@/components/onboarding/agencyOnboarding/AgencySignUp";
import ProgressBar from "@/components/onboarding/ProgressBar";
import AgencyPlans from "@/components/plan/AgencyPlans";
import { PersistanceKeys } from "@/constants/Constants";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function Page() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const D = localStorage.getItem("User");
    const subPlanData = localStorage.getItem(PersistanceKeys.LocalStorageSubPlan);
    
    if (D) {
      const Data = JSON.parse(D);
      
      // Check if user is here intentionally for onboarding (no plan)
      const needsOnboarding = subPlanData && JSON.parse(subPlanData)?.subPlan === false;
      
      if (Data.user.userType == "admin") {
        // router.push("/admin");
        window.location.href = "/admin";
      } else if (Data.user.userRole == "Agency" && !needsOnboarding) {
        // Only redirect if user doesn't need onboarding
        // router.push("/agency/dashboard");
        window.location.href = "/agency/dashboard";
      } else if (Data.user.userRole !== "Agency") {
        // router.push("/dashboard");
        window.location.href = "/dashboard";
      }
      // If userRole == "Agency" AND needsOnboarding is true, stay on onboarding page
    }
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem(PersistanceKeys.LocalStorageSubPlan);
    if (userData) {
      const D = JSON.parse(userData);
      if (D) {
        setCurrentIndex(1);
      }
    }
  }, []);

  const handleContinue = () => {
    setCurrentIndex((prev) => prev + 1);
  };
  return (
    <div className="flex flex-col w-full items-center justify-center py-5 overflow-y-auto">
      <div className="flex w-full flex-row items-center justify-start gap-2 mt-4  sm:rounded-2xl sm:mx-2 w-full md:w-11/12 h-[10%]"
      style={{backgroundColor: ''}}>
        <Image src={"/assets/assignX.png"} height={30} width={130} alt="*"  style={{backgroundColor: ''}}/>
        {/* /assets/agentX.png */}

        <div className="w-[100%]">
          <ProgressBar value={currentIndex > 0 ? 100 : 50} />
        </div>
      </div>

      {currentIndex > 0 ? (
        <AgencyPlans />
      ) : (
        <AgencySignUp handleContinue={handleContinue} />
      )}

      {/* <AgencyPlans /> */}
    </div>
  );
}

export default Page;
