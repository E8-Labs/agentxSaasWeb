import Apis from "@/components/apis/Apis";
import { PersistanceKeys } from "@/constants/Constants";
import { CircularProgress } from "@mui/material";
import { ArrowUpRight, CaretDown, CaretUp } from "@phosphor-icons/react";
import axios from "axios";
import { EditIcon, Router } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../leads/AgentSelectSnackMessage";
import { color } from "framer-motion";

const PipelineAndStage = ({ selectedAgent, UserPipeline, mainAgent }) => {
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const [expandedStages, setExpandedStages] = useState([]);
  const [StagesList, setStagesList] = useState([
    { id: 1, title: "s1", description: "Testing the stage1" },
    { id: 2, title: "s2", description: "Testing the stage2" },
    { id: 3, title: "s3", description: "Testing the stage3" },
  ]);

  const [agentCadence, setAgentCadence] = useState([]);

  const [initialLoader, setInitialLoader] = useState(false);

  useEffect(() => {
    if (selectedAgent.agentType !== "inbound") {
      // console.log("Trigered the get cadence api");
      handleGetCadence();
    }
  }, []);

  //code for togeling stages seleciton
  const toggleStageDetails = (stage) => {
    // if (expandedStages.some((s) => s.id === stage.id)) {
    //     setExpandedStages(expandedStages.filter((s) => s.id !== stage.id));
    // } else {
    //     setExpandedStages([...expandedStages, stage]);
    // }
    setExpandedStages((prevIds) => {
      if (prevIds.includes(stage.cadence.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== stage.cadence.id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, stage.cadence.id];
      }
    });
  };

  //funciton to call get cadence api
  const handleGetCadence = async () => {
    try {
      setInitialLoader(true);

      let userDetails = null;
      let AuthToken = null;
      const localData = localStorage.getItem("User");

      const agentDataLocal = localStorage.getItem("agentDetails");

      if (localData) {
        const Data = JSON.parse(localData);
        userDetails = Data;
        // console.log("Localdata recieved is :--", Data);
        AuthToken = Data.token;
      }

      // console.log("Auth token is:", AuthToken);

      const ApiData = {
        mainAgentId: selectedAgent.mainAgentId,
      };

      const formData = new FormData();
      formData.append("mainAgentId", selectedAgent.mainAgentId);

      const ApiPath = Apis.getAgentCadence;

      // console.log("Apipath is:", ApiPath);
      // console.log("Api data s:", ApiData);
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log(
        //   "Response of get agent cadence api is:",
        //   JSON.stringify(response.data)
        // );
        setAgentCadence(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in get cadence api is:", error);
    } finally {
      setInitialLoader(false);
    }
  };

  const styles = {
    paragraph: {
      fontWeight: "500",
      fontSize: 15,
    },
    paragraph2: {
      fontWeight: "400",
      fontSize: 14,
      color: '#00000080'
    },
  };

  return (
    <div>
      <AgentSelectSnackMessage
        type={message?.type}
        isVisible={message != null}
        message={message?.message}
        hide={() => setMessage(null)}
      />
      <div className="w-full flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-2">
          <p
            style={{
              ...styles.paragraph,
              color: "#00000080",
            }}
          >
            Assigned Pipeline
          </p>
          {/* <Image src={"/svgIcons/infoIcon.svg"} height={20} width={20} alt='*' /> */}
        </div>
        <div style={styles.paragraph}>
          {mainAgent?.pipeline?.title ? mainAgent?.pipeline?.title : "-"}
        </div>
      </div>

      {selectedAgent?.agentType !== "inbound" && (
        <div className="w-full">
          <div className="flex flex-row justify-between items-center mt-4">
            <div className="" style={{ fontWeight: "700", fontSize: 16.8 }}>
              Stages
            </div>

            <button
              className="flex flex-row items-center gap-2 h-[35px] rounded-md bg-purple text-white px-4"
              style={{
                fontWeight: "500",
                fontSize: 15,
              }}
              onClick={() => {
                if ((mainAgent.currentOngoingCadence || 0) > 0) {
                  setMessage({
                    message:
                      "This agent is assigned to leads, can’t update at this time.",
                    type: SnackbarTypes.Warning,
                  });
                  return;
                }
                console.log("Main agent is ", mainAgent);
                localStorage.setItem(
                  PersistanceKeys.LocalSavedAgentDetails,
                  JSON.stringify(mainAgent)
                );
                router.push("/pipeline/update");
              }}
            >
              Update
              <EditIcon size={20} color="white" />
            </button>
            {/* Old Update Button */}
            {/* <div
              className="mt-4 cursor-pointer"
              style={{ fontWeight: "700", fontSize: 16.8 }}
              onClick={() => {
                if ((mainAgent.currentOngoingCadence || 0) > 0) {
                  setMessage({
                    message:
                      "This agent is assigned to leads, can’t update at this time.",
                    type: SnackbarTypes.Warning,
                  });
                  return;
                }
                console.log("Main agent is ", mainAgent);
                localStorage.setItem(
                  PersistanceKeys.LocalSavedAgentDetails,
                  JSON.stringify(mainAgent)
                );
                router.push("/pipeline/update");
              }}
            >
              Update
            </div> */}
          </div>
          {initialLoader ? (
            <div className="w-full flex flex-row items-center justify-center">
              <CircularProgress size={25} />
            </div>
          ) : (
            <div>
              {agentCadence.map((stage, index) => (
                <div key={index} className="mt-4">
                  <div
                    style={{
                      border: "1px solid #00000020",
                      borderRadius: "8px",
                      padding: 15,
                    }}
                  >
                    <button
                      onClick={() => toggleStageDetails(stage)}
                      className="w-full flex flex-row items-center justify-between"
                    >
                      <div>{stage?.cadence?.stage?.stageTitle || "-"}</div>
                      <div>
                        <div>
                          {expandedStages.includes(stage?.cadence?.id) ? (
                            <CaretUp size={20} weight="bold" />
                          ) : (
                            <CaretDown size={20} weight="bold" />
                          )}
                        </div>
                      </div>
                    </button>
                    {expandedStages.includes(stage?.cadence?.id) && (
                      <div
                        style={{
                          border: "1px solid #00000020",
                          borderRadius: "5px",
                          padding: 10,
                          marginTop: 15,
                        }}
                      >
                        <div
                          className="flex flex-row items-center gap-8 pl-20"
                          style={styles.paragraph2}
                        >
                          <div
                            className="text-center">
                            Days
                          </div>
                          <div
                            className="text-center">
                            Hours
                          </div>
                          <div
                            className="text-center">
                            Mins
                          </div>
                        </div>

                        {stage.calls.map((item, index) => {
                          return (
                            <div key={index} className="flex flex-col gap-2 items-ceter mt-2">

                              <div

                                className="flex flex-row items-center gap-4"
                                style={styles.paragraph}
                              >
                                <div>Wait</div>
                                <div
                                  className="flex flex-row items-center w-[240px]"
                                  style={{ color: "#00000070" }}
                                >
                                  <div
                                    className="text-center"
                                    style={{
                                      width: "33%",
                                      border: "1px solid #00000020",
                                      borderTopLeftRadius: "7px",
                                      borderBottomLeftRadius: "7px",
                                      padding: 5,
                                    }}
                                  >
                                    {item.waitTimeDays}
                                  </div>
                                  <div
                                    className="text-center"
                                    style={{
                                      width: "33%",
                                      borderBottom: "1px solid #00000020",
                                      borderTop: "1px solid #00000020",
                                      padding: 5,
                                    }}
                                  >
                                    {item.waitTimeHours}
                                  </div>
                                  <div
                                    className="text-center"
                                    style={{
                                      width: "33%",
                                      border: "1px solid #00000020",
                                      borderTopRightRadius: "7px",
                                      borderBottomRightRadius: "7px",
                                      padding: 5,
                                    }}
                                  >
                                    {item.waitTimeMinutes}
                                  </div>
                                </div>
                                <div>, then Make Call</div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex flex-row items-center gap-2 mt-4">
                          <p style={styles.paragraph}>Then move to</p>
                          <div
                            className="py-1 text-center px-2 flex flex-col justify-center"
                            style={{
                              width: "fit-centent",
                              backgroundColor: "#15151520",
                              fontWeight: "500",
                              fontSize: 15,
                              height: "33px",
                              borderRadius: "7px",
                              border: "1px solid #00000010",
                            }}
                          >
                            {stage?.cadence?.moveToStage?.stageTitle ||
                              "No stage selected"}
                          </div>
                        </div>
                      </div>
                    )
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
      }
    </div >
  );
};

export default PipelineAndStage;
