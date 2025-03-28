"use client";

import BackgroundVideo from "@/components/general/BackgroundVideo";
import SellerKycs from "@/components/kycQuestions/SellerKycs";
import React, { useState } from "react";

const Page = () => {
  const [index, setIndex] = useState(0);
  let components = [SellerKycs];

  let CurrentComp = components[index];

  // Function to proceed to the next step
  const handleContinue = () => {
   // //console.log;
    setIndex(index + 1);
  };

  const handleBack = () => {
   // //console.log;
    setIndex(index - 1);
  };

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "100svh",
    overflow: "hidden",
  };

  return (
    <div
      style={backgroundImage}
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1, // Ensure the video stays behind content
        }}
      >
        <BackgroundVideo />
      </div>
      <CurrentComp handleContinue={handleContinue} handleBack={handleBack} />
    </div>
  );
};

export default Page;
