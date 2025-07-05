import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import classNames from "classnames";
import { VoiceWavesComponent } from "./askskycomponents/voice-waves";
import { API_KEY, DEFAULT_ASSISTANT_ID, MYAGENTX_URL } from "./constants";
import Apis from "../apis/Apis";
import axios from "axios";
import Image from "next/image";

//Update from salman
export function VapiWidget({
  assistantId = DEFAULT_ASSISTANT_ID,
  shouldStart = false,
  setShowAskSkyModal,
  setShouldStartCall,
  loadingChanged,
  isEmbeded = false,
}) {
  const [vapi, setVapi] = useState(null);
  const [open, setOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState(""); // dynamic message

  const loadingMessages = ["Sky is booting up...", "getting coffee.. "];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMsgIndex(
        (prevIndex) => (prevIndex + 1) % loadingMessages.length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [shouldStart]);

  useEffect(() => {
    loadingChanged(loading);
  }, [loading]);

  // Initialize Vapi once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    let instance;
    let mounted = true;

    const init = async () => {
      try {
        console.log("initializing vapi sdk");

        const mod = await import("@vapi-ai/web");
        const VapiClient = mod.default ?? mod;
        instance = new VapiClient(API_KEY);

        if (!mounted) return;
        setVapi(instance);
        setLoading(false);

        instance.on("call-start", () => {
          setOpen(true);
          setStatusMessage("Call started with Sky");
        });
        instance.on("call-end", () => {
          setOpen(false);
          setIsSpeaking(false);
          setStatusMessage("Call ended");
        });
        instance.on("speech-start", () => setIsSpeaking(true));
        instance.on("speech-end", () => setIsSpeaking(false));
        instance.on("message", (msg) => console.log("Vapi msg:", msg));
        instance.on("error", (err) => {
          console.error("Vapi error:", err);
          handleClose();
        });
      } catch (err) {
        console.error("Failed to load Vapi SDK:", err);
      }
    };

    init();

    return () => {
      mounted = false;
      try {
        instance?.stop();
      } catch (err) {
        console.warn("Error during SDK unload:", err);
      }
      if (instance?.removeAllListeners) {
        try {
          instance.removeAllListeners();
        } catch (err) {
          console.warn("Error removing Vapi listeners:", err);
        }
      }
    };
  }, []);

  const startVapiCall = async () => {
    if (shouldStart && vapi) {
      let userProfile = await getProfileSupportDetails();

      let pipelineData = userProfile?.pipelines || [];

      delete userProfile?.pipelines;
      const assistantOverrides = {
        recordingEnabled: false,
        variableValues: {
          customer_details: JSON.stringify(userProfile),
          // pipeline_details: JSON.stringify(pipelineData)
        },
      };

      console.log("assistante overrides", assistantOverrides);

      vapi.start(assistantId, assistantOverrides);
    }
  };

  useEffect(() => {
    if (!isEmbeded) {
      startVapiCall();
    }
  }, [shouldStart, vapi, assistantId]);

  // Close handler
  const handleClose = useCallback(() => {
    try {
      vapi?.stop();
    } catch (err) {
      console.warn("Error stopping Vapi:", err);
    }
    setOpen(false);
    setShouldStartCall(false);
    setShowAskSkyModal(false);
  }, [vapi, setShouldStartCall, setShowAskSkyModal]);

  // Loader while initializing SDK
  if (false) {
    //!open
    return (
      <div className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
      </div>
    );
  }

  const getProfileSupportDetails = async () => {
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
  };

  return (
    <div
      className={`${
        !isEmbeded ? "fixed right-6 z-modal flex flex-col items-end" : ""
      } overflow-none bg-transparent`}
      // style={{ border: "4px solid green" }}
    >
      {isEmbeded && !open ? (
        <button
          className="fixed bottom-6 right-6 z-modal flex flex-col items-end"
          onClick={() => {
            setOpen(true);
            startVapiCall();
          }}
        >
          <div className="flex flex-row items-center pr-4 bg-white py-1 rounded-full shadow-md">
            <Image
              src={"/otherAssets/embedGetHelp.jpg"}
              height={57}
              width={57}
              alt="*"
            />

            <p className=" text-[16px] font-bold text-purple cursor-pointer">
              Get Help
            </p>
          </div>
        </button>
      ) : (
        <div className="flex flex-col gap-3 overflow-none bg-transparent">
          <div
            // className={
            //   "w-72 h-80 rounded-lg bg-white overflow-hidden p-6 border-black/10 mb-6 transition-all duration-300" +
            //     isEmbeded
            //     ? ""
            //     : "shadow-md border"
            // }
            style={{
              // backgroundColor: 'green',
              padding: 6,
              height: "320px",
              width: "288px",
              border: !isEmbeded ? "2px solid #00000010" : "",
              borderRadius: 12,
              boxShadow: !isEmbeded ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
            }}
          >
            <div className="h-full w-full flex flex-col items-center">
              <div className="h-[200px] w-[200px] flex flex-col items-center justify-between mb-8">
                <img
                  src="/agentXOrb.gif"
                  alt="AgentX Orb"
                  className="rounded-full bg-white shadow-lg size-36 object-cover"
                />
                {!statusMessage && (
                  <p className="text-[15px] text-black text-center mt-5">
                    {loadingMessages[loadingMsgIndex]}
                  </p>
                )}

                {statusMessage && (
                  <p className="text-[15px] text-black text-center mt-5">
                    {statusMessage}
                  </p>
                )}

                {isSpeaking && (
                  <VoiceWavesComponent
                    width={150}
                    height={80}
                    speed={0.12}
                    amplitude={0.4}
                    autostart
                  />
                )}
              </div>

              <div
                className={`flex flex-col items-center gap-2 ${
                  isEmbeded && "mt-6"
                }`}
              >
                <p className="text-xs">Powered by</p>
                <a
                  href={MYAGENTX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium"
                >
                  <img
                    src="/agentx-logo.png"
                    alt="AgentX Logo"
                    className="h-3.5"
                  />
                </a>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-end">
            <button
              onClick={handleClose}
              // className={
              //   "self-end size-11 flex items-center justify-center border border-black/5 shadow-sm rounded-full transition-transform hover:-translate-y-1 bg-white"
              //   //open ? "opacity-100 z-10" : "opacity-0 -z-10"
              // }
              className="w-12 h-12 flex flex-row items-center justify-center border-2 rounded-full bg-white"
            >
              <Image
                src="/otherAssets/crossBlue.jpg"
                height={2}
                width={20}
                alt="cross"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
