// // components/VapiWidget.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { X, Loader2 } from "lucide-react";
// import classNames from "classnames";
// import { API_KEY, DEFAULT_ASSISTANT_ID, MYAGENTX_URL } from "./constants";
// import { VoiceWavesComponent } from "./askskycomponents/voice-waves";

// export function VapiWidget({
//   assistantId = DEFAULT_ASSISTANT_ID,
//   shouldStart = false,
//   setShowAskSkyModal,
//   setShouldStartCall,
//   loadingChanged,
// }) {
//   const [vapi, setVapi] = useState(null);
//   const [open, setOpen] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [loading, setLoading] = useState(true);

// //loading

// useEffect(() => {
//   loadingChanged(loading);
// }, [loading]);
//   // 1️⃣ Initialize Vapi once, on mount
//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     let instance;
//     let mounted = true;

//     (async () => {
//       try {
//         const mod = await import("@vapi-ai/web");
//         const VapiClient = mod.default ?? mod;
//         instance = new VapiClient(API_KEY);

//         if (!mounted) return;
//         setVapi(instance);
//         setLoading(false);

//         instance.on("call-start", () => setOpen(true));
//         instance.on("call-end", () => {
//           setOpen(false);
//           setIsSpeaking(false);
//         });
//         instance.on("speech-start", () => setIsSpeaking(true));
//         instance.on("speech-end", () => setIsSpeaking(false));
//         instance.on("message", (msg) => console.log("Vapi msg:", msg));
//         instance.on("error", (err) => console.error("Vapi error:", err));
//       } catch (err) {
//         console.error("Failed to load Vapi SDK:", err);
//       }
//     })();

//     return () => {
//       mounted = false;
//       instance?.stop();
//       instance?.removeAllListeners?.();
//     };
//   }, []);

//   // 2️⃣ Only start the call once SDK is ready
//   useEffect(() => {
//     if (shouldStart && vapi) {
//       vapi.start(assistantId);
//     }
//   }, [shouldStart, vapi, assistantId]);

//   // 3️⃣ Close handler
//   const handleClose = useCallback(() => {
//     vapi?.stop();
//     setOpen(false);
//     setShouldStartCall(false);
//     setShowAskSkyModal(false);
//   }, [vapi, setShouldStartCall, setShowAskSkyModal]);

//   // Loading indicator while SDK initializes
//   if (loading) {
//     console.log(`It is loading `);
//     return (
//       <div className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
//         <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="fixed bottom-6 right-6 z-modal flex flex-col items-end">
//       {/* Widget panel */}
//       <div
//         className={classNames(
//           "relative w-72 h-80 rounded-lg overflow-hidden p-6 shadow-md border bg-white border-black/10 mb-6 transition-all duration-300",
//           open
//             ? "translate-x-0 opacity-100 z-10"
//             : "translate-x-full opacity-0 -z-10"
//         )}
//       >
//         <div className="h-full w-full flex flex-col items-center justify-between">
//           {/* Orb + Voice Waves */}
//           <div className="h-[150px] w-[200px] flex flex-col items-center justify-between mb-8">
//             <img
//               src="/agentXOrb.gif"
//               alt="AgentX Orb"
//               className="rounded-full bg-white shadow-lg size-36 object-cover"
//             />
//             {isSpeaking && (
//               <VoiceWavesComponent
//                 width={150}
//                 height={80}
//                 speed={0.12}
//                 amplitude={0.4}
//                 autostart
//               />
//             )}
//           </div>

//           {/* Powered by AgentX */}
//           <div className="flex flex-col items-center gap-2">
//             <p className="text-xs">Powered by</p>
//             <a
//               href={MYAGENTX_URL}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="font-medium"
//             >
//               <img src="/agentx-logo.png" alt="AgentX Logo" className="h-3.5" />
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Close Button */}
//       <button
//         onClick={handleClose}
//         className={classNames(
//           "absolute top-0 right-0 size-11 flex items-center justify-center border border-black/5 shadow-sm rounded-full transition-transform hover:-translate-y-1",
//           open ? "opacity-100 z-10" : "opacity-0 -z-10"
//         )}
//       >
//         <X />
//       </button>
//     </div>
//   );
// }

// components/VapiWidget.jsx
// components/VapiWidget.jsx
import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import classNames from "classnames";
import { VoiceWavesComponent } from "./askskycomponents/voice-waves";
import { API_KEY, DEFAULT_ASSISTANT_ID, MYAGENTX_URL } from "./constants";
import Apis from "../apis/Apis";
import axios from "axios";

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

        instance.on("call-start", () => setOpen(true));
        instance.on("call-end", () => {
          setOpen(false);
          setIsSpeaking(false);
        });
        instance.on("speech-start", () => setIsSpeaking(true));
        instance.on("speech-end", () => setIsSpeaking(false));
        instance.on("message", (msg) => console.log("Vapi msg:", msg));
        instance.on("error", (err) => console.error("Vapi error:", err));
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
      const assistantOverrides = {
        recordingEnabled: false,
        variableValues: {
          customer_details: JSON.stringify(userProfile),
        },
      };

      console.log("assistante overrides", assistantOverrides);

      vapi.start(assistantId, assistantOverrides);
    }
  };

  useEffect(() => {
    startVapiCall();
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

            return { profile: user.user, additionalData: response.data.data };
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
    <div className={`fixed bottom-6 right-6 z-modal flex flex-col items-end`}>
      <div
        className={classNames(
          "relative w-72 h-80 rounded-lg overflow-hidden p-6 bg-white border-black/10 mb-6 transition-all duration-300" +
            isEmbeded
            ? ""
            : "shadow-md border"
        )}
      >
        <div className="h-full w-full flex flex-col items-center justify-between">
          {!open ? (
            <div className="h-[150px] w-[200px] flex flex-col items-center justify-center">
              <Loader2 className="animate-spin w-9 h-9 text-gray-500" />
            </div>
          ) : (
            <div className="h-[150px] w-[200px] flex flex-col items-center justify-between mb-8">
              <img
                src="/agentXOrb.gif"
                alt="AgentX Orb"
                className="rounded-full bg-white shadow-lg size-36 object-cover"
              />
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
          )}
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs">Powered by</p>
            <a
              href={MYAGENTX_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium"
            >
              <img src="/agentx-logo.png" alt="AgentX Logo" className="h-3.5" />
            </a>
          </div>
        </div>
      </div>
      <button
        onClick={handleClose}
        className={classNames(
          "absolute bottom-8 right-2 size-11 flex items-center justify-center border border-black/5 shadow-sm rounded-full transition-transform hover:-translate-y-1",
          open ? "opacity-100 z-10" : "opacity-0 -z-10"
        )}
      >
        {!isEmbeded && <X />}
      </button>
    </div>
  );
}
