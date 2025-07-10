import React, { useState, useEffect } from "react";
import { Headset, Sparkles, X } from "lucide-react";
import { API_KEY, DEFAULT_ASSISTANT_ID } from "./constants";
import Apis from "../apis/Apis";
import axios from "axios";
import Image from "next/image";
import Vapi from "@vapi-ai/web";
import classNames from "classnames";
import { VoiceInterface } from "./voice-interface";
import { ChatInterface } from "./askskycomponents/chat-interface";

export function SupportWidget({
  assistantId = DEFAULT_ASSISTANT_ID,
  setShowAskSkyModal,
  shouldStart,
  setShouldStartCall,
  isEmbed = false

}) {
  const [vapi, setVapi] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setloadingMessage] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false); // Opens the support menu
  const [voiceOpen, setVoiceOpen] = useState(false); // Sets up the Voice AI interface
  const [chatOpen, setChatOpen] = useState(false); // Sets up the chat interface
  const [open, setOpen] = useState(false)


  // User loading messages to fake feedback...
  useEffect(() => {
    if (loading) {
      setloadingMessage("Sky is booting up...");

      const timer = setTimeout(() => {
        setloadingMessage("Getting coffee...");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const vapiInstance = new Vapi(API_KEY);
    console.log('vapInstance', API_KEY)
    setVapi(vapiInstance);
    vapiInstance.on("call-start", () => {
      console.log("📞 CALL-START: Call started");
      setLoading(false);
      setOpen(true);

    });
    vapiInstance.on("call-end", () => {
      console.log("📞 CALL-END: Call ended");
      setIsSpeaking(false);
      setOpen(false);
    });
    vapiInstance.on("speech-start", () => {
      console.log("🎤 SPEECH-START: Assistant started speaking");
      setIsSpeaking(true);
    });
    vapiInstance.on("speech-end", () => {
      console.log("🔇 SPEECH-END: Assistant stopped speaking");
      setIsSpeaking(false);
    });
    vapiInstance.on("message", (message) => {
      const mag = message?.transcript?.length
        ? message.transcript.length / 100
        : 100;

      setTranscript((prev) => [...prev, message]);
      console.log("MESSAGE:", message);
      console.log("MAGNITUDE:", mag);
    });
    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, []);

  // // NOTE: Provides the context to the LLM about where they are in the page.
  // useEffect(() => {
  //   const pathname = window?.location.pathname;
  //   if (pathname && vapi) {
  //     vapi.send({
  //       type: "add-message",
  //       message: {
  //         role: "system",
  //         content: `The user is currently on the "${pathname}" page`,
  //       },
  //     });
  //   }
  // }, [vapi]);

  function muteAssistantAudio(mute) {
    const audioElements = document.querySelectorAll("audio");
    audioElements.forEach((audio) => {
      audio.muted = mute;
    });
  }

  // useEffect(()=>{
  //   handleStartCall(true)
  // },[shouldStart,])

  useEffect(() => {
    console.log('vapi', vapi)
    if (!isEmbed) {
      handleStartCall(true)
    }
  }, [vapi])

  async function startCall() {
    console.log("starting call")
    if (vapi) {
      const { pipelines = [], ...userProfile } =
        (await getProfileSupportDetails()) || {};

      const assistantOverrides = {
        recordingEnabled: false,
        variableValues: {
          customer_details: JSON.stringify(userProfile),
          // pipeline_details: JSON.stringify(pipelines)
        },
      };

      // TODO: If voice

      vapi.start(assistantId, assistantOverrides);
    } else {
      console.error("Vapi instance not initialized");
    }
  }

  async function handleCloseCall() {
    await vapi?.stop();
    setOpen(false);
    if (voiceOpen) {
      setVoiceOpen(false);
      if (setShowAskSkyModal) {
        setShowAskSkyModal(false)
      }
    }

    if (chatOpen) {
      setChatOpen(false);
      muteAssistantAudio(false);
    }
  }

  async function handleStartCall(voice) {
    setOpen(true)
    console.log('trying to start call',)
    setLoading(true);

    if (voice) {
      setVoiceOpen(true);
    } else {
      setChatOpen(true);
    }

    await startCall();

    if (!voice) {
      muteAssistantAudio(true);
    }
  }

  async function getProfileSupportDetails() {
    console.log("get profile support details api calling");
    let user = null;
    try {
      const data = localStorage.getItem("User");

      if (data) {
        user = JSON.parse(data);

        let path = Apis.profileSupportDetails;

        const response = await axios.get(path, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (response.data) {
          if (response.data.status === true) {
            console.log("profile support details are", response.data);
            let data = response.data.data;
            let pipelineData = data.pipelines;

            delete data.pipelines;

            return {
              profile: user.user,
              additionalData: response.data.data,
              pipelines: pipelineData,
            };
          } else {
            console.log("profile support message is", response.data.message);

            return user.user;
          }
        }
      }
    } catch (e) {
      console.log("error in get profile suppport details api is", e);
      return user.user;
    }
  }

  function handleCloseMenu() {
    handleCloseCall();

    setMenuOpen(false);
  }

  async function handleMessage(message) {
    if (!vapi) return;

    await vapi.sendMessage({
      role: "user",
      message,
    });
  }

  return (
    <div className="fixed bottom-0 right-0 z-modal flex flex-col items-end justify-end max-w-full max-h-full">
      <div
        className={classNames(
          "relative w-72 h-80 rounded-lg overflow-hidden object-center object-cover shadow-lg border bg-white border-black/10 mb-4 translate-x-0 transition-all duration-300 ease-in-out translate-x-0 ",
          voiceOpen ? "p-6" : "p-2", !open ? "opacity-0 z-10" : "opacity-100 z-10"
        )}
        style={{
          marginRight: '16px'
        }}
      >
        <div className="h-full w-full flex flex-col gap-0 items-center justify-between">
          {voiceOpen ? (
            <VoiceInterface
              loading={loading}
              loadingMessage={loadingMessage}
              isSpeaking={isSpeaking}
            />
          ) : chatOpen ? (
            <ChatInterface
              loading={loading}
              loadingMessage={loadingMessage}
              isSpeaking={isSpeaking}
              messages={transcript}
              sendMessage={handleMessage}
            />
          ) : (
            ""
          )}
        </div>
      </div>
      {
        isEmbed && !open && (
          <button
            className="outline-none border-none mr-3"
            onClick={() => {
              isEmbed = false
              handleStartCall(true)
            }}
          >
            <div className="flex flex-row items-center pe-4 ps-4 bg-white py-1 rounded-full shadow-md">
              <Image
                src={"/otherAssets/getHelp.png"}
                height={56}
                width={57}
                alt="*"
                style={{
                  // borderWidth:1
                }}
              />
              <p className=" text-[16px] font-bold text-purple cursor-pointer">
                Get Help
              </p>
            </div>
          </button>
        )
      }
      <div className="relative z-0 h-11 mb-4 mr-4">

        {
          open && voiceOpen && (

            <button
              onClick={handleCloseMenu}
              className={classNames(
                "size-11 absolute top-0 right-0 border-black/5 shadow-lg border bg-white flex items-center justify-center cursor-pointer rounded-full font-bold font-sans translate-y-0 hover:-translate-y-1 transition-all duration-300 opacity-100 z-10",
              )}
            >
              <X />
            </button>
          )
        }
      </div>
    </div>
  );
}
