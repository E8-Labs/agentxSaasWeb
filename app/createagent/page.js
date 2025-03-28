"use client";

import ErrorBoundary from "@/components/ErrorBoundary.js";
import BackgroundVideo from "@/components/general/BackgroundVideo.js";
import { PersistanceKeys } from "@/constants/Constants.js";
import dynamic from "next/dynamic.js";
import { useEffect, useState } from "react";

const CreateAgent1 = dynamic(() =>
  import("../../components/createagent/CreateAgent1.js")
);
const CreateAgent2 = dynamic(() =>
  import("../../components/createagent/CreateAgent1.js")
);
const CreatAgent3 = dynamic(() =>
  import("../../components/createagent/CreatAgent3.js")
);
const CreateAgent4 = dynamic(() =>
  import("../../components/createagent/CreateAgent4.js")
);
const CreateAgentVoice = dynamic(() =>
  import("../../components/createagent/CreateAgentVoice.js")
);

const BuildAgentName = dynamic(() =>
  import("../../components/createagent/mobileCreateAgent/BuildAgentName.js")
);
const BuildAgentObjective = dynamic(() =>
  import(
    "../../components/createagent/mobileCreateAgent/BuildAgentObjective.js"
  )
);
const BuildAgentTask = dynamic(() =>
  import("../../components/createagent/mobileCreateAgent/BuildAgentTask.js")
);

function EmptyPage() {
  return <div></div>;
}

const Page = () => {
  // //console.log;
  const [user, setUser] = useState(null);
  const [index, setIndex] = useState(0);
  const [components, setComponents] = useState([
    EmptyPage,
    // CreateAgent1,
    // CreatAgent3,
    // CreateAgent4,
    // CreateAgentVoice,
  ]);

  const [windowSize, setWindowSize] = useState(null);

  let CurrentComp = components[index];

  function GetEmptyComponent() {
    return <div>Loading..</div>;
  }

  useEffect(() => {
    let size = null;
    if (typeof window !== "undefined") {
      size = window.innerWidth;
      setWindowSize(size);
    } else {
      // //console.log;
    }
    let user = localStorage.getItem(PersistanceKeys.LocalStorageUser);
    if (user) {
      let parsed = JSON.parse(user);
      setUser(parsed);
    }
    // //console.log;
  }, []);

  useEffect(() => {
    // //console.log;
    const localData = localStorage.getItem("User");

    if (localData) {
      const Data = JSON.parse(localData);
      // //console.log;
      // //console.log;
      if (Data.user.plan) {
        if (windowSize < 640) {
          //console.log;
          setComponents([
            BuildAgentName,
            BuildAgentTask,
            BuildAgentObjective,

            // CreatAgent3,
            // CreateAgent4,
            // CreateAgentVoice,
          ]);
        } else {
          setComponents([
            CreateAgent1,
            // CreatAgent3,
            CreateAgent4,
            CreateAgentVoice,
          ]);
          // setIndex(1)
        }
      } else {
        if (windowSize < 640) {
          setComponents([
            BuildAgentName,
            BuildAgentTask,
            BuildAgentObjective,
            CreatAgent3,
            // CreateAgent4,
            // CreateAgentVoice,
          ]);
          // setIndex(3)
        } else {
          setComponents([
            CreateAgent1,
            CreatAgent3,
            CreateAgent4,
            CreateAgentVoice,
          ]);
        }
      }
    }
  }, [windowSize]);

  // Function to proceed to the next step
  const handleContinue = () => {
    // //console.log;
    setIndex(index + 1);
  };

  const handleBack = () => {
    // //console.log;
    setIndex(index - 1);
  };

  const handleSkipAddPayment = () => {
    // //console.log;
    setIndex(index + 2);
  };

  //function to get the agent Details
  const [AgentDetails, setAgentDetails] = useState({
    name: "",
    agentRole: "",
    agentType: "",
  });

  const getAgentDetails = (agentName, agentRole, agentType) => {
    // //console.log;
    // console.log(
    //   `"Agent Name is": ${agentName} ----- "Agent Role is" ${agentRole} ------ "Agent Type is" ${agentType}`
    // );
    setAgentDetails({
      name: agentName,
      agentRole: agentRole,
      agentType: agentType,
    });
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
    <ErrorBoundary>
      <div
        style={backgroundImage}
        className="overflow-y-none flex flex-row justify-center items-center"
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
              zIndex: -1, // Ensure the video stays behind content
            }}
          >
            <BackgroundVideo />
          </div>
        )}
        <CurrentComp
          handleContinue={handleContinue}
          handleBack={handleBack}
          handleSkipAddPayment={handleSkipAddPayment}
          getAgentDetails={getAgentDetails}
          AgentDetails={AgentDetails}
          user={user}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Page;
