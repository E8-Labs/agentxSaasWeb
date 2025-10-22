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
import { PersistanceKeys } from "@/constants/Constants.js";
import getProfileDetails from "@/components/apis/GetProfile.js";
import { useUser } from "@/hooks/redux-hooks.js";

const Page = () => {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  // Redux user state
  const { user: userData, setUser: setUserData, token } = useUser();

  console.log("🔥 PIPELINE-UPDATE - Current userData from Redux:", userData);
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
      if (mainAgentData && mainAgentData != "undefined") {
        const Data = JSON.parse(mainAgentData);
        //console.log;
        mainAgentId = Data.id;
      }

      // Use Redux token instead of localStorage
      let AuthToken = token;
      if (!AuthToken) {
        console.error("🔥 PIPELINE-UPDATE - No token available");
        return;
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
      console.log("ApiData is ", ApiData);
      // return

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
          console.log('🔥 PIPELINE-UPDATE - Update cadence API successful:', response);

          localStorage.removeItem("AddCadenceDetails");
          localStorage.removeItem(PersistanceKeys.selectedUser);

          // Refresh user data properly
          console.log("🔥 PIPELINE-UPDATE - Refreshing user data...");
          try {
            const profileResponse = await getProfileDetails();
            console.log("🔥 PIPELINE-UPDATE - getProfileDetails response:", profileResponse);

            if (profileResponse?.data?.status === true) {
              const freshUserData = profileResponse.data.data;
              const localData = JSON.parse(localStorage.getItem("User") || '{}');

              console.log("🔥 PIPELINE-UPDATE - Fresh user data:", freshUserData);

              // Update Redux and localStorage with fresh data
              const updatedUserData = {
                token: localData.token || token,
                user: freshUserData
              };

              console.log("🔥 PIPELINE-UPDATE - About to call setUserData (Redux)");
              setUserData(updatedUserData);
              console.log("🔥 PIPELINE-UPDATE - Redux update completed");

              // Verify localStorage was updated
              setTimeout(() => {
                const localStorageData = localStorage.getItem("User");
                console.log("🔥 PIPELINE-UPDATE - localStorage after update:", localStorageData ? JSON.parse(localStorageData) : null);
              }, 100);

              // Route based on updated user data
              if (freshUserData.userType === "admin") {
                console.log("🔥 PIPELINE-UPDATE - Routing to admin");
                router.push("/admin");
                return;
              }
            } else {
              console.error("🔥 PIPELINE-UPDATE - Failed to get profile details");
            }
          } catch (error) {
            console.error("🔥 PIPELINE-UPDATE - Error refreshing user data:", error);
          }

          console.log("🔥 PIPELINE-UPDATE - Routing to dashboard");
          router.push("/dashboard/myAgentX");
        } else {
          // setLoader(false);
        }
      }
    } catch (error) {
      console.error("Error occured in api is :", error);
      //show snackbar we created with error message here
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
