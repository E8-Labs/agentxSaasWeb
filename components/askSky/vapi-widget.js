// JavaScript version of VapiWidget React component
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import {
  API_KEY,
  BUTTON_TEXT,
  DEFAULT_ASSISTANT_ID,
  MYAGENTX_URL,
} from "./constants";
import classNames from "classnames";
import { VoiceWavesComponent } from "./askskycomponents/voice-waves";

export function VapiWidget({ user, assistantId = process.env.TEST_VITE_DEFAULT_ASSISTANT_ID }) {
  const [vapi, setVapi] = useState(null);
  const [open, setOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  console.log("assistent id is", assistantId);
  console.log("Widget render - isConnected:", isConnected, "isSpeaking:", isSpeaking);

  useEffect(() => {
    async function init() {
      if (typeof window === "undefined") return;
      const { default: Vapi } = await import("@vapi-ai/web");
      const vapiInstance = new Vapi(API_KEY);
      setVapi(vapiInstance);

      vapiInstance.on("call-start", () => {
        console.log("📞 CALL-START: Call started");
        setIsConnected(true);
      });
      vapiInstance.on("call-end", () => {
        console.log("📞 CALL-END: Call ended");
        setIsConnected(false);
        setIsSpeaking(false);
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
        console.log("MESSAGE:", message);
        console.log("MAGNITUDE:", mag);
      });
      vapiInstance.on("error", (error) => {
        console.error("Vapi error:", error);
      });
    }
    init();
  }, []);

  useEffect(() => {
    const pathname = window?.location.pathname;
    if (pathname && vapi) {
      vapi.send({
        type: "add-message",
        message: {
          role: "system",
          content: `The user is currently on the \"${pathname}\" page`,
        },
      });
    }
  }, [vapi]);

  function startCall() {
    if (vapi) {
      vapi.start(assistantId);
    } else {
      console.error("Vapi instance not initialized");
    }
  }

  function endCall() {
    if (vapi) {
      vapi.stop();
    }
  }

  function handleCloseCall() {
    setOpen(false);
    endCall();
  }

  function handleStartCall() {
    setOpen(true);
    startCall();
  }

  return (
    <div className="fixed bottom-6 right-6 z-modal flex flex-col items-end justify-start">
      <div
        className={
          `relative w-72 h-80 rounded-lg overflow-hidden p-6 object-center object-cover shadow-md border bg-purple border-black/10 mb-6 translate-x-0 transition-all duration-300",
          ${open ? "translate-x-0 opacity-100 z-10" : "translate-x-full opacity-0 -z-10"}`
        }
      >
        <div className="h-full w-full flex flex-col gap-0 items-center justify-between">
          <div className="h-[150px] w-[200px] flex flex-col items-center justify-between mb-8">
            <img
              className="rounded-full bg-white shadow-lg size-36 shrink-0 z-0 object-center object-cover"
              src="/orb.gif"
              alt="AgentX Orb"
            />
            {isSpeaking && (
              <VoiceWavesComponent
                width={150}
                height={80}
                speed={0.12}
                amplitude={0.4}
                autostart={true}
              />
            )}
          </div>

          <div className="relative w-2/3 flex flex-col h-5 items-center justify-center gap-6 z-10">
            <div className="h-full flex justify-center items-center gap-1">
              <p className="text-xs">Powered by</p>
              <a
                href={MYAGENTX_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-medium"
              >
                <img
                  src="/agentx-logo.png"
                  alt="AgentX Logo"
                  className="w-auto h-3.5 mt-0.5"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-0 h-11 w-54">
        <button
          onClick={handleStartCall}
          className={classNames(
            "py-2.5 px-6 cursor-pointer rounded-full bg-white-500 text-black font-bold font-sans translate-y-0 hover:-translate-y-1 transition-all duration-300",
          )}
        >
          🎙️ {BUTTON_TEXT}
        </button>
        <button
          onClick={handleCloseCall}
          className={classNames(
            "size-11 absolute top-0 right-0 border-black/5 shadow-sm border flex items-center justify-center cursor-pointer rounded-full font-bold font-sans translate-y-0 hover:-translate-y-1 transition-all duration-300",
            open ? "opacity-100 z-10" : "opacity-0 -z-10"
          )}
        >
          <X />
        </button>
      </div>
    </div>
  );
}
