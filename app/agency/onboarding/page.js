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
    if (D) {
      const Data = JSON.parse(D);
      if (Data.user.userType == "admin") {
        // router.push("/admin");
        window.location.href = "/admin";
      } else if (Data.user.userRole == "Agency") {
        // router.push("/agency/dashboard");
        window.location.href = "/agency/dashboard";
      } else {
        // router.push("/dashboard");
        window.location.href = "/dashboard";
      }
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
    <div className="flex flex-col w-full items-center justify-center p-5 overflow-hidden">
      <div className="flex w-full flex-row items-center justify-center gap-2 mt-4">
        <Image src={"/assets/agentX.png"} height={30} width={130} alt="*" />

        <div className="w-[80%]">
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
