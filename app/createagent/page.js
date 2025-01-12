"use client";

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

const Page = () => {
  const [index, setIndex] = useState(0);
  const [components, setComponents] = useState([
    CreateAgent1,
    CreatAgent3,
    CreateAgent4,
    CreateAgentVoice,
  ]);

  let CurrentComp = components[index];

  useEffect(() => {
    const localData = localStorage.getItem("User");
    let windowSize = window.innerWidth;
    if (localData) {
      const Data = JSON.parse(localData);
      if (Data.user.plan) {
        if (windowSize < 640) {
          setComponents([
            BuildAgentName,
            BuildAgentTask,
            BuildAgentObjective,
            // CreatAgent3,
            CreateAgent4,
            CreateAgentVoice,
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
            CreateAgent4,
            CreateAgentVoice,
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
  }, []);

  // Function to proceed to the next step
  const handleContinue = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 1);
  };

  const handleBack = () => {
    console.log("Component indexchanged ", index);
    setIndex(index - 1);
  };

  const handleSkipAddPayment = () => {
    console.log("Component indexchanged ", index);
    setIndex(index + 2);
  };

  //function to get the agent Details
  const [AgentDetails, setAgentDetails] = useState({
    name: "",
    agentRole: "",
    agentType: "",
  });

  const getAgentDetails = (agentName, agentRole, agentType) => {
    console.log("I am hit");
    console.log(
      `"Agent Name is": ${agentName} ----- "Agent Role is" ${agentRole} ------ "Agent Type is" ${agentType}`
    );
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
    <div
      style={backgroundImage}
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <video
        autoPlay
        loop
        muted
        playsInline
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
        <source src="/banerVideo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <CurrentComp
        handleContinue={handleContinue}
        handleBack={handleBack}
        handleSkipAddPayment={handleSkipAddPayment}
        getAgentDetails={getAgentDetails}
        AgentDetails={AgentDetails}
      />
    </div>
  );
};

export default Page;
