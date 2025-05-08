import InfiniteScroll from "react-infinite-scroll-component";
import CircularProgress from "@mui/material/CircularProgress";
import moment from "moment";
import Image from "next/image";

import NoAgent from "./NoAgent";
import { UserTypes } from "@/constants/UserTypes";
import {
  formatPhoneNumber,
  getAgentImage,
  getAgentProfileImage,
  getAgentsListImage,
} from "@/utilities/agentUtilities";
import { useState, useEffect, useRef } from "react";
import AgentInfoCard from "./AgentInfoCard";
// ...other necessary imports

const AgentsListPaginated = ({
  agentsListSeparatedParam,
  selectedImagesParam,
  handlePopoverClose,
  user,
  getAgents,
}) => {
  // console.log("Agents in paginated list ", agentsListSeparatedParam);
  const [agentsListSeparated, setAgentsListSeparated] = useState(
    agentsListSeparatedParam
  );
  const [hasMoreAgents, setHasMoreAgents] = useState(true);
  const [selectedImages, setSelectedImages] = useState(selectedImagesParam);
  const fileInputRef = useRef([]);

  // Example fetch function (replace with your actual API call)
  const fetchMoreAgents = async () => {
    console.log("Fetch more agents please");
    getAgents();
    // const offset = agentsListSeparated.length;
    // const res = await fetchAgentsFromAPI(offset); // Pass offset
    // if (res.length === 0) {
    //   setHasMoreAgents(false);
    // } else {
    //   setAgentsListSeparated(prev => [...prev, ...res]);
    // }
  };

  useEffect(() => {
    setAgentsListSeparated(agentsListSeparatedParam);
  }, [agentsListSeparatedParam]);

  const formatName = (item) => {
    let agentName = null;

    if (item?.name?.length > 15) {
      agentName = item?.name?.slice(0, 15) + "...";
    } else {
      agentName = item?.name;
    }
    return (
      <div>
        {agentName?.slice(0, 1).toUpperCase(0)}
        {agentName?.slice(1)}
      </div>
    );
  };

  return (
    <div
      className="h-[75vh] overflow-auto pt-10 pb-12"
      style={{ scrollbarWidth: "none" }}
      id="scrollableAgentDiv"
    >
      {agentsListSeparated.length > 0 ? (
        <InfiniteScroll
          dataLength={agentsListSeparated.length}
          next={fetchMoreAgents}
          hasMore={hasMoreAgents}
          scrollableTarget="scrollableAgentDiv"
          loader={
            <div className="w-full flex justify-center mt-4">
              <CircularProgress size={30} sx={{ color: "#7902DF" }} />
            </div>
          }
          endMessage={
            <p
              style={{
                textAlign: "center",
                paddingTop: "10px",
                fontWeight: "400",
                fontFamily: "inter",
                fontSize: 16,
                color: "#00000060",
              }}
            >
              {`You're all caught up`}
            </p>
          }
          style={{ overflow: "unset" }}
        >
          <div className="flex flex-col gap-4 px-10">
            {agentsListSeparated.map((item, index) => (
              <div
                key={index}
                className="w-full px-10 py-2"
                style={{
                  borderWidth: 1,
                  borderColor: "#00000007",
                  backgroundColor: "#FBFCFF",
                  borderRadius: 20,
                }}
              >
                <div className="w-full flex flex-row items-center justify-between">
                  <div className="flex flex-row gap-5 items-center">
                    <div className="flex flex-row items-end">
                      {selectedImages[index] ? (
                        <Image
                          src={selectedImages[index]}
                          height={70}
                          width={70}
                          alt="Profile"
                          style={{
                            borderRadius: "50%",
                            objectFit: "cover",
                            height: "60px",
                            width: "60px",
                          }}
                        />
                      ) : (
                        getAgentsListImage(item)
                      )}
                      <input
                        type="file"
                        value={""}
                        accept="image/*"
                        ref={(el) => (fileInputRef.current[index] = el)}
                        onChange={(e) => handleProfileImgChange(e, index)}
                        style={{ display: "none" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-row gap-3 items-center">
                        <button onClick={() => handleShowDrawer(item)}>
                          <div
                            style={{
                              fontSize: 24,
                              fontWeight: "600",
                              color: "#000",
                            }}
                          >
                            {formatName(item)}
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowRenameAgentPopup(true);
                            setSelectedRenameAgent(item);
                            setRenameAgent(item.name);
                          }}
                        >
                          <Image
                            src={"/svgIcons/editPen.svg"}
                            height={24}
                            width={24}
                            alt="*"
                          />
                        </button>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#00000080",
                          }}
                          className="flex flex-row items-center gap-1"
                        >
                          <div
                            aria-owns={open ? "mouse-over-popover" : undefined}
                            aria-haspopup="true"
                            onMouseEnter={(event) => {
                              if (item.agentObjectiveId === 3) {
                                handlePopoverOpen(event, item);
                              }
                            }}
                            onMouseLeave={handlePopoverClose}
                            style={{ cursor: "pointer" }}
                          >
                            {user.user.userType == UserTypes.RealEstateAgent
                              ? `${item.agentObjective
                                  ?.slice(0, 1)
                                  .toUpperCase()}${item.agentObjective?.slice(
                                  1
                                )}`
                              : `${item.agentRole}`}
                          </div>
                          <div>
                            | {item.agentType?.slice(0, 1).toUpperCase()}
                            {item.agentType?.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex flex-row gap-3 items-center text-purple"
                        style={{ fontSize: 15, fontWeight: "500" }}
                      >
                        <button
                          onClick={() => {
                            setGreetingTagInput(item?.prompt?.greeting);
                            setOldGreetingTagInput(item?.prompt?.greeting);
                            setScriptTagInput(item?.prompt?.callScript);
                            setOldScriptTagInput(item?.prompt?.callScript);
                            setShowScriptModal(item);
                            matchingAgent(item);
                            setShowScript(true);
                            if (item?.prompt?.objective) {
                              setObjective(item?.prompt?.objective);
                              setOldObjective(item?.prompt?.objective);
                            }
                          }}
                        >
                          <div>View Script</div>
                        </button>
                        <div>|</div>
                        <button onClick={() => handleShowDrawer(item)}>
                          <div>More info</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-start gap-8">
                    {!item.phoneNumber && (
                      <div className="flex flex-row items-center gap-2 -mt-1">
                        <Image
                          src={"/assets/warningFill.png"}
                          height={18}
                          width={18}
                          alt="*"
                        />
                        <p>
                          <i
                            className="text-red"
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            No phone number assigned
                          </i>
                        </p>
                      </div>
                    )}
                    <button
                      className="bg-purple px-4 py-2 rounded-lg"
                      onClick={() => {
                        if (!item.phoneNumber) {
                          setShowWarningModal(item);
                        } else {
                          setOpenTestAiModal(true);
                        }

                        const callScript =
                          item.prompt.callScript + " " + item.prompt.greeting;
                        const regex = /\{(.*?)\}/g;
                        let match;
                        let mainAgent = null;
                        mainAgentsList.map((ma) => {
                          if (ma.agents?.length > 0) {
                            if (ma.agents[0].id == item.id) {
                              mainAgent = ma;
                            } else if (ma.agents?.length >= 2) {
                              if (ma.agents[1].id == item.id) {
                                mainAgent = ma;
                              }
                            }
                          }
                        });
                        let kyc = (mainAgent?.kyc || []).map(
                          (kyc) => kyc.question
                        );
                        while ((match = regex.exec(callScript)) !== null) {
                          const defaultVariables = [
                            "Full Name",
                            "First Name",
                            "Last Name",
                            "firstName",
                            "seller_kyc",
                            "buyer_kyc",
                            "CU_address",
                            "CU_status",
                          ];
                          if (
                            !defaultVariables.includes(match[1]) &&
                            match[1]?.length < 15
                          ) {
                            if (
                              !keys.includes(match[1]) &&
                              !kyc.includes(match[1])
                            ) {
                              keys.push(match[1]);
                            }
                          }
                        }
                        setScriptKeys(keys);
                        setSelectedAgent(item);
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#fff",
                        }}
                      >
                        Test AI
                      </div>
                    </button>
                  </div>
                </div>

                <div className="w-9.12 bg-white p-6 rounded-2xl mb-4 mt-5">
                  <div className="w-full flex flex-row items-center justify-between">
                    <AgentInfoCard
                      name="Calls"
                      value={<div>{item.calls || "-"}</div>}
                      icon="/svgIcons/selectedCallIcon.svg"
                      bgColor="bg-blue-100"
                      iconColor="text-blue-500"
                    />
                    <AgentInfoCard
                      name="Convos"
                      value={<div>{item.callsGt10 || "-"}</div>}
                      icon="/svgIcons/convosIcon2.svg"
                      bgColor="bg-purple-100"
                      iconColor="text-purple-500"
                    />
                    <AgentInfoCard
                      name="Hot Leads"
                      value={item.hotleads || "-"}
                      icon="/otherAssets/hotLeadsIcon2.png"
                      bgColor="bg-orange-100"
                      iconColor="text-orange-500"
                    />
                    <AgentInfoCard
                      name="Booked Meetings"
                      value={item.booked || "-"}
                      icon="/otherAssets/greenCalenderIcon.png"
                      bgColor="green"
                      iconColor="text-orange-500"
                    />
                    <AgentInfoCard
                      name="Mins Talked"
                      value={
                        <div>
                          {item?.totalDuration
                            ? moment
                                .utc((item?.totalDuration || 0) * 1000)
                                .format("HH:mm:ss")
                            : "-"}
                        </div>
                      }
                      icon="/otherAssets/minsCounter.png"
                      bgColor="green"
                      iconColor="text-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      ) : (
        <NoAgent />
      )}
    </div>
  );
};

export default AgentsListPaginated;
