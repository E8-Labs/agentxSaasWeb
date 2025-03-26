import Body from "@/components/onboarding/Body";
import Header from "@/components/onboarding/Header";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Footer from "@/components/onboarding/Footer";
//import for input drop down menu
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Apis from "../apis/Apis";
import axios from "axios";
import { CircularProgress, Modal } from "@mui/material";
import voicesList from "./Voices";
import { PauseCircle, PlayCircle } from "@phosphor-icons/react";
import { UserTypes } from "@/constants/UserTypes";

const CreateAgentVoice = ({ handleBack, user }) => {
  let synthKey = process.env.NEXT_PUBLIC_SynthFlowApiKey;

  const router = useRouter();
  const [toggleClick, setToggleClick] = useState(null);
  const [voices, setVoices] = useState([]);
  const [voicesLoader, setVoicesLoader] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [preview, setPreview] = useState(null);
  const [agentDetails, setAgentDetails] = useState(null);
  const [shouldContinue, setShouldContinue] = useState(true);
  const [audio, setAudio] = useState(null);

  const [showNoAudioModal, setShowNoAudioModal] = useState(null);

  useEffect(() => {
    setVoices(voicesList);
  }, []);

  useEffect(() => {
    if (selectedVoiceId) {
      setShouldContinue(false);
    }
  }, [selectedVoiceId]);

  useEffect(() => {
    // console.log("I m wrodf");
    const localData = localStorage.getItem("agentDetails");
    if (localData) {
      const agentData = JSON.parse(localData);
      // console.log("Response of localagent dta", agentData);
      setAgentDetails(agentData);
    }
  }, []);

  const handleToggleClick = (id, item) => {
    setToggleClick((prevId) => (prevId === id ? null : id));
    //// console.log("Selected voice is :", item.voice_id);
    setSelectedVoiceId(item.voice_id);
  };

  const handleContinue = async () => {
    // e.preventDefaults();
    try {
      setVoicesLoader(true);
      let AuthToken = null;
      let mainAgentId = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // console.log("Localdat recieved is :--", Data);
        AuthToken = Data.token;
      }

      // console.log("Auth token is ", AuthToken);

      const mainAgentData = localStorage.getItem("agentDetails");
      if (mainAgentData) {
        const Data = JSON.parse(mainAgentData);
        // console.log("Localdat recieved is :--", Data);
        mainAgentId = Data.id;
      }

      const ApiPath = Apis.updateAgent;
      // const ApiData = {}
      const formData = new FormData();
      // console.log("selected voice id is:", selectedVoiceId);
      formData.append("mainAgentId", mainAgentId);
      // return
      formData.append("voiceId", selectedVoiceId);

      for (let [key, value] of formData.entries()) {
        // console.log(`${key} : ${value}`);
      }
      // return
      const response = await axios.post(ApiPath, formData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          // "Content-Type": "application/json"
        },
      });

      if (response) {
        // console.log("Response of update api is :", response.data);
        if (response.data.status === true) {
          // console.log("User type is ", user);
          if (user.user.userType == UserTypes.RealEstateAgent) {
            // console.log("Routing to seller kyc");
            router.push("/sellerskycquestions");
          } else {
            // console.log("Routing to customer kyc");
            router.push("/customerkycquestions");
          }

          localStorage.removeItem("claimNumberData");
        } else {
          setVoicesLoader(false);
        }
      }
    } catch (error) {
      // console.error("ERror occured in api is error0", error);
      setVoicesLoader(false);
    } finally {
    }
  };

  const playVoice = (url) => {
    if (audio) {
      audio.pause();
    }
    const ad = new Audio(url); // Create a new Audio object with the preview URL
    ad.play();
    setAudio(ad); // Play the audio
  };

  const avatarImages = [
    "/assets/avatar1.png",
    "/assets/avatar2.png",
    "/assets/avatar3.png",
    // "/assets/avatar4.png",
    // "/assets/avatar5.png",
    // "/assets/avatar6.png",
    // "/assets/avatar7.png",
    // "/assets/avatar8.png",
    // "/assets/avatar9.png",
    // "/assets/avatar10.png",
  ];

  const styles = {
    headingStyle: {
      fontSize: 16,
      fontWeight: "700",
    },
    inputStyle: {
      fontSize: 15,
      fontWeight: "500",
      color: "#000000",
    },
    dropdownMenu: {
      fontSize: 15,
      fontWeight: "500",
      color: "#00000070",
    },
    callBackStyles: {
      height: "71px",
      width: "210px",
      border: "1px solid #15151550",
      borderRadius: "20px",
      fontWeight: "600",
      fontSize: 15,
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

  const getImageHeight = (item) => {
    if (item.name === "Ava") {
      return 50;
    } else if (item.name === "Zane") {
      return 50;
    } else if (item.name === "Trinity") {
      return 30;
    } else if (item.name === "Dax") {
      return 70;
    } else if (item.name === "Mia") {
      return 30;
    } else if (item.name === "Kaia") {
      return 30;
    } else if (item.name === "Axel") {
      return 30;
    } else if (item.name === "Aria") {
      return 60;
    } else if (item.name === "Luna") {
      return 50;
    }

    return 70;
  };
  const getImageWidth = (item) => {
    if (item.name === "Ava") {
      return 50;
    } else if (item.name === "Zane") {
      return 50;
    } else if (item.name === "Trinity") {
      return 55;
    } else if (item.name === "Dax") {
      return 60;
    } else if (item.name === "Mia") {
      return 55;
    } else if (item.name === "Kaia") {
      return 50;
    } else if (item.name === "Axel") {
      return 55;
    } else if (item.name === "Aria") {
      return 58;
    } else if (item.name === "Luna") {
      return 50;
    }

    return 60;
  };

  const addMarginTop = (item) => {
    if (item.name === "Trinity") {
      return 5;
    } else if (item.name === "Dax") {
      return 3;
    } else if (item.name === "Axel") {
      return 7;
    } else if (item.name === "Niko") {
      return 5;
    } else if (item.name === "Lex") {
      return 2;
    } else if (item.name === "Xen") {
      return 6;
    } else if (item.name === "Elon") {
      return 8;
    } else if (item.name === "Aria") {
      return 12;
    }

    return 0;
  };

  const addMariginLeft = (item) => {
    if (item.name === "Niko") {
      return 4;
    } else if (item.name === "Lex") {
      return 4;
    } else if (item.name === "Dax") {
      return 3;
    } else if (item.name === "Xen") {
      return 6;
    } else if (item.name === "Elon") {
      return 5;
    }
    return 0;
  };

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <div className="bg-white rounded-2xl w-10/12 h-[90vh] py-4 flex flex-col justify-between">
        <div className="flex flex-col h-[90svh]">
          {/* header */}
          <Header />
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full">
            <div
              className="mt-6 w-11/12 md:text-4xl text-lg font-[700]"
              style={{ textAlign: "center" }}
            >
              Choose a voice for {agentDetails?.name}
            </div>
            <div className="w-full flex flex-row justify-center">
              <div
                className="mt-8 w-6/12 gap-4 flex flex-col max-h-[53vh] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
                style={{ scrollbarWidth: "none" }}
              >
                {voices.map((item, index) => (
                  <button
                    key={index}
                    style={{
                      border:
                        item.voice_id === selectedVoiceId
                          ? "2px solid #7902DF"
                          : "",
                      backgroundColor:
                        item.voice_id === selectedVoiceId ? "#402FFF10" : "",
                    }}
                    className="flex flex-row items-center border mt-4 p-2 justify-between h-[100px] px-8 rounded-xl outline-none"
                    onClick={(e) => {
                      handleToggleClick(index, item);
                      // playVoice(item.preview);
                    }}
                  >
                    <div className="flex flex-row items-center gap-4">
                      <div
                        className="flex flex-row items-center justify-center"
                        style={{
                          height: "62px",
                          width: "62px",
                          borderRadius: "50%",
                          backgroundColor:
                            item.voice_id === selectedVoiceId
                              ? "white"
                              : "#d3d3d380",
                        }}
                      >
                        {/* <Image src={"/assets/warning.png"} height={40} width={35} alt='*' /> */}
                        <Image
                          // src={avatarImages[index % avatarImages.length]} // Deterministic selection
                          src={item.img} // Deterministic selection
                          height={getImageHeight(item)}
                          width={getImageWidth(item)}
                          style={{
                            // backgroundColor:'red',
                            borderRadius: "50%",
                            marginTop: addMarginTop(item),
                            marginLeft: addMariginLeft(item),
                          }}
                          alt="*"
                        />
                      </div>
                      <div>
                        <div
                          className="text-start flex flex-row items-center gap-2"
                          style={{
                            fontSize: 17,
                            fontWeight: "700",
                          }}
                        >
                          {item.name}
                          {item.status && (
                            <div className="text-start text-white text-sm font-[500] bg-purple rounded-full px-2 w-fit-content">
                              {item.status}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: "500",
                          }}
                        >
                          {item.Dialect}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-4">
                      <div>
                        <Image
                          src={"/assets/voice.png"}
                          height={15}
                          width={23}
                          alt="*"
                        />
                      </div>
                      {item.preview ? (
                        <div>
                          {preview === item.preview ? (
                            <div
                              onClick={() => {
                                if (audio) {
                                  audio.pause();
                                }
                                setPreview(null);
                              }}
                            >
                              <PauseCircle size={38} weight="regular" />
                            </div>
                          ) : (
                            <div
                              onClick={(e) => {
                                setPreview(item.preview);
                                playVoice(item.preview);
                              }}
                            >
                              <Image
                                src={"/assets/play.png"}
                                height={25}
                                width={25}
                                alt="*"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div
                            onClick={(e) => {
                              setShowNoAudioModal(item);
                            }}
                          >
                            <Image
                              src={"/assets/play.png"}
                              height={25}
                              width={25}
                              alt="*"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {/* {
                            voicesLoader ?
                                <div className='w-full flex flex-row justify-center mt-8'>
                                    <CircularProgress size={35} />
                                </div> :
                                
                        } */}
          </div>
        </div>

        {/* Modal for video */}
        <Modal
          open={showNoAudioModal}
          onClose={() => setShowNoAudioModal(null)}
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
                      setShowNoAudioModal(null);
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

                <div className="mt-6 text-red text-center font-[600] text-xl">
                  No voice added by{" "}
                  <span className="underline">{showNoAudioModal?.name}</span>
                </div>

                {/* Can be use full to add shadow */}
                {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
              </div>
            </div>
          </Box>
        </Modal>

        <div className="flex flex-col h-[7svh] ">
          <div className="">
            <ProgressBar value={33} />
          </div>

          <Footer
            handleContinue={handleContinue}
            handleBack={handleBack}
            registerLoader={voicesLoader}
            shouldContinue={shouldContinue}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAgentVoice;
