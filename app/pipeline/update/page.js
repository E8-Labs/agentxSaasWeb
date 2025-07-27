"use client";
// const AddCalender = dynamic(() =>
//   import("../../components/pipeline/AddCalender.js")
// );
const Pipeline1 = dynamic(() =>
  import("../../../components/pipeline/Pipeline1.js")
);
import axios from "axios";
import Apis from "@/components/apis/Apis.js";
import { useRouter } from "next/navigation.js";
// const Pipeline2 = dynamic(() =>
//   import("../../components/pipeline/Pipeline2.js")
// );
import BackgroundVideo from "@/components/general/BackgroundVideo.js";
import dynamic from "next/dynamic.js";
import React, { useState } from "react";
import getProfileDetails from "@/components/apis/GetProfile.js";

const Page = () => {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  let components = [Pipeline1];

  let CurrentComp = components[index];

  // Function to proceed to the next step
  const handleContinue = () => {
    //console.log;
    //Call the api here
    handleAddCadence();
  };

  const handleBack = () => {
    // //console.log;
    setIndex(index - 1);
  };

  const handleAddCadence = async () => {
    try {
      //   setLoader(true);
      //////console.log;
      let cadence = null;
      const cadenceData = localStorage.getItem("AddCadenceDetails");
      if (cadenceData) {
        const cadenceDetails = JSON.parse(cadenceData);
        cadence = cadenceDetails;
      }

      ////console.log("cadence details are :",
      //     cadence
      // );

      let mainAgentId = null;
      const mainAgentData = localStorage.getItem("agentDetails");
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData);
        //console.log;
        mainAgentId = Data.id;
      }

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        //////console.log;
        AuthToken = Data.token;
      }

      //console.log;

      //console.log;

      console.log("Cadence is ", cadence);
      console.log("Main agent", mainAgentId);

      const ApiData = {
        pipelineId: cadence.pipelineID,
        mainAgentId: mainAgentId,
        cadence: cadence.cadenceDetails,
      };

      const ApiPath = Apis.createPipeLineCadence;
      //////console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //console.log;
        if (response.data.status === true) {
          localStorage.removeItem("AddCadenceDetails");
          await getProfileDetails();
          const LocalData = localStorage.getItem("User");
          if(LocalData){
            const userData = JSON.parse(LocalData);
            if(userData.user.userType === "admin"){
              router.push("/admin");
              return;
            }
          }
          router.push("/dashboard/myAgentX");
        } else {
          // setLoader(false);
        }
      }
    } catch (error) {
      console.error("Error occured in api is :", error);
      //   setLoader(false);
    } finally {
    }
  };

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "100vh",
    overflow: "none",
    // backgroundColor: 'red'
  };

  return (
    <div
      style={{ ...backgroundImage }}
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
    // <div className='w-full h-screen' style={{display: "flex", flexDirection: "row", justifyContent: "center", alignItems:" center" }}>
    //     <div style={{width: "90%", height: "80%"}}>

    //     </div>
    // </div>
  );
};

export default Page;
