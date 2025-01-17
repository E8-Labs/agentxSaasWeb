import Body from "@/components/onboarding/Body";
import Header from "@/components/onboarding/Header";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Footer from "@/components/onboarding/Footer";
import {
  Box,
  FormControl,
  MenuItem,
  Modal,
  Popover,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowUpRight,
  CaretDown,
  CaretUp,
  DotsThree,
  Plus,
} from "@phosphor-icons/react";
import Apis from "../apis/Apis";
import axios from "axios";
import TagInput from "../test/TagInput";
import MentionsInputTest from "../test/MentionsInput";
import Objection from "./advancedsettings/Objection";
import GuardianSetting from "./advancedsettings/GuardianSetting";
import KYCs from "./KYCs";
import GreetingTag from "./tagInputs/GreetingTag";
import CallScriptTag from "./tagInputs/CallScriptTag";
import DynamicDropdown from "../test/DynammicTagField";
import { PromptTagInput } from "./tagInputs/PromptTagInput";
import { GreetingTagInput } from "./tagInputs/GreetingTagInput";
import ReactMentions from "../test/ReactMentions";
import DraftMentions from "../test/DraftMentions";
import IntroVideoModal from "../createagent/IntroVideoModal";
import VideoCard from "../createagent/VideoCard";

const Pipeline2 = ({ handleContinue, handleBack }) => {
  const containerRef = useRef(null); // Ref to the scrolling container
  const [scrollOffset, setScrollOffset] = useState({
    scrollTop: 0,
    scrollLeft: 0,
  });
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [kycsData, setKycsData] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const [AgentDetails, setAgentDetails] = useState(null);
  const [introVideoModal, setIntroVideoModal] = useState(false);
  //code for tag inputs
  // const [greetingTagInput, setGreetingTagInput] = useState("");
  // const [scriptTagInput, setScriptTagInput] = useState("");
  //code for tag input
  // const [greetingTagInput, setGreetingTagInput] = useState('');
  // const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  // const [cursorPosition, setCursorPosition] = useState(0);
  // const greetingInputRef = useRef(null); // Reference to the input element

  // const tags = ['name', 'phone', 'email', 'address'];

  const [loader, setLoader] = useState(false);
  //variables for advance setting variables
  const [advancedSettingModal, setAdvancedSettingModal] = useState(false);
  const [settingToggleClick, setSettingToggleClick] = useState(1);
  const [showObjectiveDetail, setShowObjectiveDetails] = useState(false);
  const [columnloader, setColumnloader] = useState(false);
  const [uniqueColumns, setUniqueColumns] = useState([]);
  const [showMoreUniqueColumns, setShowMoreUniqueColumns] = useState(false);

  //code for objective
  const [objective, setObjective] = useState("");

  // const handleInputChange = (e) => {
  //     const value = e.target.value;
  //     const cursorPos = e.target.selectionStart;

  //     setGreetingTagInput(value);
  //     setCursorPosition(cursorPos);

  //     // Show dropdown if `{` is typed
  //     if (value[cursorPos - 1] === '{') {
  //         setIsDropdownVisible(true);
  //     } else {
  //         setIsDropdownVisible(false);
  //     }
  // };

  // const handleGreetingsTagChange = (tag) => {
  //     ////console.log("Tage is :", tag);
  //     const beforeCursor = greetingTagInput.slice(0, cursorPosition);
  //     const afterCursor = greetingTagInput.slice(cursorPosition);

  //     // Replace `{` with the selected tag
  //     const updatedInput = beforeCursor.replace(/\{$/, `{${tag}} `) + afterCursor;

  //     setGreetingTagInput(updatedInput);
  //     setIsDropdownVisible(false);

  //     // Move focus back to the input and place the cursor after the inserted tag
  //     const newCursorPosition = beforeCursor.length + tag.length + 2; // Position after the tag
  //     setCursorPosition(newCursorPosition);

  //     // Set focus and cursor position
  //     greetingInputRef.current.focus();
  //     setTimeout(() => {
  //         greetingInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
  //     }, 0);
  // };

  const tags = ["name", "phone", "email", "address", "name han"];
  const [greetingTagInput, setGreetingTagInput] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [filteredTags, setFilteredTags] = useState(tags); // Filtered dropdown items
  const greetingInputRef = useRef(null); // Reference to the input element

  useEffect(() => {
    ////console.log("Setting scroll offset")
    const handleScroll = () => {
      console.log("Div scrolled", containerRef.current.scrollTop);
      if (containerRef.current) {
        setScrollOffset({
          scrollTop: containerRef.current.scrollTop,
          scrollLeft: containerRef.current.scrollLeft,
        });
      } else {
        ////console.log("No ref div")
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    setGreetingTagInput(value);
    setCursorPosition(cursorPos);

    // Extract text after the last `{`
    const textAfterLastBrace = value.slice(
      value.lastIndexOf("{") + 1,
      cursorPos
    );

    if (value[cursorPos - 1] === "{") {
      setFilteredTags(tags); // Show all tags when `{` is typed
      setIsDropdownVisible(true);
    } else if (value.includes("{") && isDropdownVisible) {
      // Filter tags based on input after `{`
      const filtered = tags.filter((tag) => tag.startsWith(textAfterLastBrace));
      setFilteredTags(filtered);
    } else {
      setIsDropdownVisible(false);
    }
  };

  const handleGreetingsTagChange = (tag) => {
    // Replace the last `{text` with `{ tag }` (with spaces)
    const value = greetingTagInput;
    const lastBraceIndex = value.lastIndexOf("{");
    const newValue =
      value.slice(0, lastBraceIndex + 1) +
      ` ${tag} ` +
      `} ` +
      value.slice(cursorPosition);

    setGreetingTagInput(newValue);
    setIsDropdownVisible(false);

    // Move the cursor after the inserted tag
    setTimeout(() => {
      const input = greetingInputRef.current;
      const newCursorPosition = lastBraceIndex + tag.length + 5; // Adjust for spaces
      input.setSelectionRange(newCursorPosition, newCursorPosition);
      input.focus();
    }, 0);
  };

  const [scriptTagInput, setScriptTagInput] = useState("");
  const [promptDropDownVisible, setPromptDropDownVisible] = useState(false);
  const [kYCSDropDown, setKYCSDropDown] = useState(false);
  const [promptCursorPosition, setPromptCursorPosition] = useState(0);
  const textFieldRef = useRef(null); // Reference to the TextField element
  //console.log("Tag value is :", scriptTagInput);
  console.log("Window current height is:", window.innerHeight);
  const tags1 = ["name", "Agent Name", "Brokerage Name", "Client Name"];

  const handlePromptChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    setScriptTagInput(value);
    setPromptCursorPosition(cursorPos);

    // Show dropdown if `{kyc|` is typed, case-insensitive
    const typedText = value.slice(0, cursorPos).toLowerCase(); // Get text up to the cursor in lowercase
    if (typedText.endsWith("{kyc")) {
      setKYCSDropDown(true);
    } else if (typedText.endsWith("{")) {
      setPromptDropDownVisible(true);
    } else {
      setPromptDropDownVisible(false);
      setKYCSDropDown(false);
    }
  };

  const handlePromptTagSelection = (selectedKYC) => {
    const beforeCursor = scriptTagInput.slice(0, promptCursorPosition);
    const afterCursor = scriptTagInput.slice(promptCursorPosition);

    // Insert the selected KYC tag in the desired format
    const updatedInput = `${beforeCursor} | ${selectedKYC} }${afterCursor}`;

    // const updatedInput = beforeCursor.slice(0, 4) + `{ KYC | ${selectedKYC} } ${afterCursor}`;

    // Update the input value and close the dropdown
    setScriptTagInput(updatedInput);
    setPromptDropDownVisible(false);
    setKYCSDropDown(false);

    // Calculate the new cursor position after the selected KYC tag
    const newCursorPosition =
      beforeCursor.length + ` KYC | ${selectedKYC} `.length + 2; // Account for brackets and spaces

    // Update the cursor position state
    setPromptCursorPosition(newCursorPosition);

    // Focus the input field and set the cursor position after the inserted tag
    setTimeout(() => {
      if (textFieldRef.current) {
        textFieldRef.current.focus();
        textFieldRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        );
      }
    }, 0);
  };

  //function to close advance settings
  const handleCloseAdvanceSettings = () => {
    setAdvancedSettingModal(false);
    localStorage.removeItem("GuadrailsList");
    localStorage.removeItem("ObjectionsList");
  };

  useEffect(() => {
    const agentDetailsLocal = localStorage.getItem("agentDetails");
    if (agentDetailsLocal) {
      const localAgentData = JSON.parse(agentDetailsLocal);
      console.log("Locla agent details are :-", localAgentData);
      setAgentDetails(localAgentData);
      if (
        localAgentData.agents.length === 2 ||
        localAgentData.agents[0].agentType === "outbound"
      ) {
        console.log(
          "Check case for 2Agents",
          localAgentData.agents.filter((item) =>
            item.agentType === "outbound" ? item : ""
          )
        );
        const outBoundAgent = localAgentData.agents.filter((item) =>
          item.agentType === "outbound" ? item : ""
        );
        setGreetingTagInput(outBoundAgent[0]?.prompt?.greeting);
        setScriptTagInput(outBoundAgent[0]?.prompt?.callScript);
        setObjective(outBoundAgent[0]?.prompt?.objective);
      } else if (localAgentData.agents[0].agentType === "inbound") {
        console.log("Check case it is inbound data set");
        setGreetingTagInput(localAgentData?.agents[0]?.prompt?.greeting);
        setScriptTagInput(localAgentData?.agents[0]?.prompt?.callScript);
        setObjective(localAgentData?.agents[0]?.prompt?.objective);
      }
    }
    getUniquesColumn();
  }, []);

  useEffect(() => {
    console.log("Value of script tag is:", scriptTagInput);
  }, [scriptTagInput]);

  //code for getting uniqueCcolumns
  const getUniquesColumn = async () => {
    try {
      setColumnloader(true);
      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      ////console.log("Auth token is :--", AuthToken);

      const ApiPath = Apis.uniqueColumns;
      ////console.log("Api path is ", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of getColumns api is:", response.data);
        if (response.data.status === true) {
          setUniqueColumns(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error occured in getColumn is :", error);
    } finally {
      setColumnloader(false);
    }
  };

  //code for showing more unique columns
  const handleShowUniqueCols = () => {
    setShowMoreUniqueColumns(!showMoreUniqueColumns);
  };

  //code for advance setting
  const handleAdvanceSettingToggleClick = (id) => {
    setSettingToggleClick((prevId) => (prevId === id ? null : id));
  };

  // //code for getting the uniques columns
  // const getUniqueColumns = async () => {
  //     try {
  //         const ApiPath = Apis.getUniqueColumns;

  //         let AuthToken = null;
  //         const localData = localStorage.getItem("User");
  //         if (localData) {
  //             const userDetails = JSON.parse(localData);
  //             AuthToken = userDetails.token;
  //         }

  //         console.log("Authtoken is :", AuthToken);

  //         console.log("Unique column api path is :", ApiPath);

  //         const response = await axios.get(ApiPath, {
  //             headers: {
  //                 "Authorization": "Bearer " + AuthToken,
  //                 "Content-Type": "application/json"
  //             }
  //         });

  //         if (response) {
  //             console.log("Response of get unique columns is :", response.data);
  //         }

  //     } catch (error) {
  //         console.error("Error occured in getting unique columns is :", error);
  //     }
  // }

  const handleNextClick = async (e) => {
    e.preventDefault();
    // router.push("/dashboard");

    // ////console.log("Greeting value is :", greetingTagInput);

    // ////console.log("Promt details are :", scriptTagInput);

    // return
    try {
      setLoader(true);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        ////console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      let mainAgentId = null;
      let AgentName = null;
      let AgentObjective = null;
      let AgentDescription = null;
      let AgentType = null;
      let AgentRole = null;
      let Stat = null;
      let Address = null;
      let isInbound = null;
      // let VoiceId = "Mtewh2emAIf6sPTaximW";
      const mainAgentData = localStorage.getItem("agentDetails");
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData);
        console.log("Local agent dat recieved is :--", Data);
        mainAgentId = Data.id;
        AgentObjective = Data.agents[0].agentObjective;
        AgentDescription = Data.agents[0].agentObjectiveDescription;
        AgentType = Data.agents[0].agentType;
        Address = Data.agents[0].address;
        AgentRole = Data.agents[0].agentRole;
        if (
          Data.agents.length === 2 ||
          Data.agents[0].agentType === "outbound"
        ) {
          console.log(
            "Check case for 2Agents",
            Data.agents.filter((item) =>
              item.agentType === "outbound" ? item : ""
            )
          );
          const outBoundAgent = Data.agents.filter((item) =>
            item.agentType === "outbound" ? item : ""
          );
          // setGreetingTagInput(localAgentData.greeting);
          // setScriptTagInput(localAgentData.callScript);
        } else if (Data.agents[0].agentType === "inbound") {
          isInbound = true;
          // setGreetingTagInput(localAgentData.inboundGreeting);
          // setScriptTagInput(localAgentData.inboundPrompt);
        }
      }

      ////console.log("Auth token is :--", AuthToken);

      const ApiPath = Apis.updateAgent;
      ////console.log("Api path is :--", ApiPath);

      const formData = new FormData();

      formData.append("agentObjective", AgentObjective);
      formData.append("agentObjectiveDescription", AgentDescription);
      // formData.append("agentType", AgentType);
      // formData.append("address", Address);
      formData.append("mainAgentId", mainAgentId);
      formData.append("outboundObjective", objective);
      // formData.append("voiceId", VoiceId);
      if (isInbound) {
        formData.append("inboundGreeting", greetingTagInput);
        formData.append("inboundPrompt", scriptTagInput);
      } else {
        formData.append("prompt", scriptTagInput);
        formData.append("greeting", greetingTagInput);
      }

      ////console.log("Update agent details are is :-----");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
        },
      });

      if (response) {
        ////console.log("Response of update api is :--", response);
        if (response.data.status === true) {
          handleAddCadence();
          // router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error occured in update agent api is:", error);
      setLoader(false);
    } finally {
      ////console.log("update agent api completed");
    }
  };

  const handleAddCadence = async () => {
    try {
      setLoader(true);
      ////console.log("");
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
        ////console.log("Localdat recieved is :--", Data);
        mainAgentId = Data.id;
      }

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        ////console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      ////console.log("Authtoke for add cadence api is :", AuthToken);

      ////console.log("Main agent id is :", mainAgentId);

      const ApiData = {
        pipelineId: cadence.pipelineID,
        mainAgentId: mainAgentId,
        cadence: cadence.cadenceDetails,
      };

      const ApiPath = Apis.createPipeLineCadence;
      ////console.log("Api path is :", ApiPath);

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        ////console.log("Response of create pipeline api is :---", response);
        if (response.data.status === true) {
          localStorage.removeItem("AddCadenceDetails");
          router.push("/dashboard/leads");
        } else {
          // setLoader(false);
        }
      }
    } catch (error) {
      console.error("Error occured in api is :", error);
      setLoader(false);
    } finally {
    }
  };

  //handleGet kyc details
  const handleGetKYCs = () => {
    const test = [
      {
        id: 1,
        question: "name",
      },
      {
        id: 2,
        question: "phone",
      },
      {
        id: 3,
        question: "email",
      },
      {
        id: 4,
        question: "address",
      },
      {
        id: 5,
        question: "name han",
      },
    ];
  };

  const advanceSettingType = [
    {
      id: 1,
      title: "Objective",
    },
    {
      id: 2,
      title: "Guardrails",
    },
    {
      id: 3,
      title: "Objections",
    },
  ];

  // useEffect(() => {
  //     getKyc()
  // }, [])

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "700",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500",
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: "500",
      color: "#00000070",
    },
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-55%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <div className="bg-white rounded-2xl w-10/12 h-[91vh] py-4 flex flex-col justify-between">
        <div>
          {/* header */}
          <Header />
          {/* Body */}
          {/* Code for side video */}
          <div
            className="-ml-4 lg:flex hidden lg:w-2/12 xl:w-3/12"
            style={{
              position: "absolute",
              // left: "18%",
              // translate: "-50%",
              // left: "14%",
              top: "20%",
              // backgroundColor: "red"
            }}
          >
            <VideoCard
              horizontal={false}
              playVideo={() => {
                setIntroVideoModal(true);
              }}
              title="Learn about creating a script"
            />
          </div>
          <div
            ref={containerRef}
            className="flex flex-col items-center px-4 w-full overflow-auto h-[68vh]"
            style={{ scrollbarWidth: "none" }}
          >
            <IntroVideoModal
              open={introVideoModal}
              onClose={() => setIntroVideoModal(false)}
              videoTitle="Learn about creating a script"
              videoUrl="https://drive.google.com/file/d/1dB9krET4BIxaeOhZ6mZt0S8-DKQbWiAn/view?usp=share_link"
            />

            <div
              className="mt-6 w-11/12 md:text-4xl text-lg font-[700]"
              style={{ textAlign: "center" }}
            >
              {`Create a Script`}
            </div>
            <div className="mt-8 w-7/12 gap-4 flex flex-col">
              <div className="bg-[#00000012] p-4">
                <div
                  style={styles.inputStyle}
                  className="flex flex-row items-center gap-2"
                >
                  <Image
                    src={"/svgIcons/lightBulb.svg"}
                    alt="*"
                    height={24}
                    width={24}
                  />{" "}
                  Editing Tips
                </div>
                <div
                  style={styles.inputStyle}
                  className="flex flex-row flex-wrap gap-2"
                >
                  <div>You can use these variables:</div>
                  {/* <div className='flex flex-row items-center gap-2'> */}
                  <div
                    style={{ width: "fit-content" }}
                    className="text-purple flex flex-row gap-2"
                  >
                    {`{First Name}`}, {`{Email}`}, {`{Address}`},{`{Phone}`},
                    {`{Kyc}`}{" "}
                  </div>

                  {uniqueColumns.length > 0 && showMoreUniqueColumns ? (
                    <div className="flex flex-row flex-wrap gap-2">
                      {uniqueColumns.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-row items-center gap-2 text-purple"
                        >
                          {`{${item}}`},
                        </div>
                      ))}
                      <button
                        className="text-purple outline-none"
                        onClick={handleShowUniqueCols}
                      >
                        show less
                      </button>
                    </div>
                  ) : (
                    <div>
                      {uniqueColumns.length > 0 && (
                        <button
                          className="text-purple flex flex-row items-center font-bold outline-none"
                          onClick={() => {
                            handleShowUniqueCols();
                          }}
                        >
                          <Plus
                            weight="bold"
                            size={15}
                            style={{
                              strokeWidth: 40, // Adjust as needed
                            }}
                          />
                          {uniqueColumns.length}
                        </button>
                      )}
                    </div>
                  )}

                  {/* </div> */}
                </div>
              </div>
              <div>
                <button
                  className="flex flex-row items-center gap-4"
                  onClick={() => {
                    setIntroVideoModal(true);
                  }}
                >
                  <Image
                    src={"/assets/youtubeplay.png"}
                    height={36}
                    width={36}
                    alt="*"
                    style={{ borderRadius: "7px" }}
                  />
                  <div style={styles.inputStyle} className="underline">
                    Learn how to customize your script
                  </div>
                </button>
              </div>
              <div
                style={{ fontSize: 24, fontWeight: "700" }}
                className="flex flex-row items-center center w-full justify-between"
              >
                <div>{AgentDetails?.name} Script</div>
                <div>
                  <button
                    className="flex flex-row items-center gap-2 h-[43px] rounded-md bg-purple text-white px-4"
                    style={{
                      fontWeight: "500",
                      fontSize: 15,
                    }}
                    onClick={() => {
                      window.open(
                        "https://www.google.com/url?q=https://chatgpt.com/g/g-0O0jItKdk-agentx-script-builder&sa=D&source=docs&ust=1736727664686727&usg=AOvVaw3gT9iletUxbxgJ4hPXXIj9",
                        "_blank"
                      );
                    }}
                  >
                    User Script Builder
                    <ArrowUpRight size={20} color="white" />
                  </button>
                </div>
              </div>
              <div style={styles.headingStyle}>Greeting</div>

              <GreetingTagInput
                greetTag={greetingTagInput}
                kycsList={kycsData}
                uniqueColumns={uniqueColumns}
                tagValue={setGreetingTagInput}
                scrollOffset={scrollOffset}
              />

              {/* <MentionsInputTest /> <TagInput /> */}

              {/* <GreetingTag handleGreetingTag={handleGreetingTag} /> */}
            </div>
            <div className="w-7/12 mt-4">
              <div style={styles.headingStyle}>Call Script</div>
              <div className="mt-6">
                <PromptTagInput
                  promptTag={scriptTagInput}
                  kycsList={kycsData}
                  tagValue={setScriptTagInput}
                  scrollOffset={scrollOffset}
                  uniqueColumns={uniqueColumns}
                />

                {/* <DynamicDropdown /> */}
              </div>
            </div>
            <div className="w-7/12 mt-4">
              <div className="flex flex-row justify-end mt-4">
                <button
                  className="text-purple underline"
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                  onClick={() => {
                    setAdvancedSettingModal(true);
                  }}
                >
                  Advanced Settings
                </button>
              </div>
              <KYCs kycsDetails={setKycsData} />
              {/* <div className='mt-4' style={styles.headingStyle}>
                                {`Agent's Objective`}
                            </div>
                            <div className='bg-white rounded-xl p-2 px-4 mt-4'>
                                <div className='flex flex-row items-center justify-between'>
                                    <div style={styles.inputStyle}>
                                        {AgentDetails && (AgentDetails?.agents[0]?.agentObjective)}
                                    </div>
                                    <div>
                                        <button onClick={() => { setShowObjectiveDetails(!showObjectiveDetail) }}>
                                            {
                                                showObjectiveDetail ?
                                                    <CaretUp size={25} weight='bold' /> :
                                                    <CaretDown size={25} weight='bold' />
                                            }
                                        </button>
                                    </div>
                                </div>
                                {
                                    showObjectiveDetail && (
                                        <div>
                                            <div className='mt-2' style={styles.inputStyle}>
                                                {AgentDetails && (AgentDetails?.agents[0]?.prompt.objective) || "-"}
                                            </div>
                                            <div className='flex flex-row items-center justify-between mt-2'>
                                                <div style={{ ...styles.inputStyle, color: "#00000060" }}>
                                                    Status
                                                </div>
                                                <div style={styles.inputStyle}>
                                                    {AgentDetails && (AgentDetails?.agents[0]?.status) || "--"}
                                                </div>
                                            </div>
                                            <div className='flex flex-row items-center justify-between mt-4'>
                                                <div style={{ ...styles.inputStyle, color: "#00000060" }}>
                                                    Address
                                                </div>

                                                <div style={{ ...styles.inputStyle }}>
                                                    {AgentDetails && (AgentDetails?.agents[0]?.address) || "--"}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div> */}
            </div>
          </div>
        </div>

        {/* Modals code goes here */}
        <Modal
          open={advancedSettingModal}
          onClose={() => {
            handleCloseAdvanceSettings();
          }}
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: "#00000020",
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box className="lg:w-5/12 sm:w-10/12 w-8/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="w-full"
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  borderRadius: "13px",
                }}
              >
                <div className="flex flex-row justify-end">
                  <button
                    onClick={() => {
                      handleCloseAdvanceSettings();
                    }}
                  >
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>
                <div
                  className="text-center mt-2"
                  style={{ fontWeight: "700", fontSize: 24 }}
                >
                  Advance Settings
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-row items-center gap-10 mt-10">
                    {advanceSettingType.map((item, index) => (
                      <button
                        key={item.id}
                        style={{
                          ...styles.inputStyle,
                          color:
                            item.id === settingToggleClick ? "#7902DF" : "",
                        }}
                        onClick={(e) => {
                          handleAdvanceSettingToggleClick(item.id);
                        }}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                  <div>
                    {settingToggleClick === 1 ? (
                      <Image
                        src={"/assets/needKYC.png"}
                        height={5}
                        width={303}
                        alt="*"
                      />
                    ) : settingToggleClick === 2 ? (
                      <Image
                        src={"/assets/motivationKyc.png"}
                        height={5}
                        width={303}
                        alt="*"
                      />
                    ) : settingToggleClick === 3 ? (
                      <Image
                        src={"/assets/urgencyKyc.png"}
                        height={8}
                        width={310}
                        alt="*"
                      />
                    ) : (
                      ""
                    )}
                  </div>
                </div>

                <div className="w-full">
                  {settingToggleClick === 1 ? (
                    <div>
                      <textarea
                        className="outline-none rounded-xl focus:ring-0"
                        // ref={objective}
                        value={objective}
                        onChange={(e) => {
                          const value = e.target.value;
                          // if (value !== oldObjective) {
                          //   setShowObjectionsSaveBtn(true);
                          // }
                          // if (value === oldObjective) {
                          //   setShowObjectionsSaveBtn(false);
                          // }

                          setObjective(value);
                        }}
                        placeholder="Add Objective"
                        style={{
                          fontSize: "15px",
                          padding: "15px",
                          width: "100%",
                          fontWeight: "500",
                          height: "50vh", // Initial height
                          maxHeight: "80vh", // Maximum height before scrolling
                          overflowY: "auto", // Enable vertical scrolling when max-height is exceeded
                          resize: "none", // Disable manual resizing
                          border: "1px solid #00000020",
                        }}
                      />
                    </div>
                  ) : settingToggleClick === 2 ? (
                    <GuardianSetting />
                  ) : settingToggleClick === 3 ? (
                    <Objection />
                  ) : (
                    ""
                  )}
                </div>

                {/* Can be use full to add shadow */}
                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
              </div>
            </div>
          </Box>
        </Modal>

        {/* Modal for video */}
        <Modal
          open={introVideoModal}
          onClose={() => setIntroVideoModal(false)}
          closeAfterTransition
          BackdropProps={{
            timeout: 1000,
            sx: {
              backgroundColor: "#00000020",
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.modalsStyle}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="sm:w-full w-full"
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  borderRadius: "13px",
                }}
              >
                <div className="flex flex-row justify-end">
                  <button
                    onClick={() => {
                      setIntroVideoModal(false);
                    }}
                  >
                    <Image
                      src={"/assets/crossIcon.png"}
                      height={40}
                      width={40}
                      alt="*"
                    />
                  </button>
                </div>

                <div
                  className="text-center sm:font-24 font-16"
                  style={{ fontWeight: "700" }}
                >
                  Learn more about assigning leads
                </div>

                <div className="mt-6">
                  <iframe
                    src="https://www.youtube.com/embed/Dy9DM5u_GVg?autoplay=1&mute=1" //?autoplay=1&mute=1 to make it autoplay
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video"
                    // className='w-20vh h-40vh'
                    style={{
                      width: "100%",
                      height: "50vh",
                      borderRadius: 15,
                    }}
                  />
                </div>

                {/* Can be use full to add shadow */}
                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
              </div>
            </div>
          </Box>
        </Modal>

        <div>
          <div>{/* <ProgressBar value={33} /> */}</div>

          <Footer
            handleContinue={handleNextClick}
            handleBack={handleBack}
            registerLoader={loader}
          />
        </div>
      </div>
    </div>
  );
};

export default Pipeline2;
