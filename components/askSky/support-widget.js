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
import { GetHelpBtn } from "../animations/DashboardSlider";
import { Alert, Snackbar, Modal, Box, CircularProgress } from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
  const [isCallRunning, setIsCallRunning] = useState(false)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const [agentUserDetails, setAgentUserDetails] = useState(null);
  const [smartListData, setSmartListData] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [smartListFields, setSmartListFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User loading messages to fake feedback...


  useEffect(() => {
    // Load agent details when component mounts
    if (assistantId) {
      console.log('🔍 SUPPORT-WIDGET - Loading agent details for:', assistantId);
      getAgentByVapiId();
    }
  }, [assistantId]);

  useEffect(() => {
    // setLoadingMsg()
  }, [loading]);
  useEffect(() => {

    console.log('isEmbed', isEmbed)
    console.log('loading', loading)
  }, [loading, isEmbed]);

  // 1) Safer loading message
  const setLoadingMsg = async () => {
    try {
      const agent = await getAgentByVapiId();
      const displayName = agent?.name || "Sky";
      if (displayName.length > 10) {
        displayName = displayName.slice(0, 10) + "...";
      }
      setloadingMessage(`${displayName} is booting up...`);

      // follow-up beat after 3s
      setTimeout(() => {
        setloadingMessage("...getting coffee...");
      }, 3000);
    } catch (e) {
      console.log("setLoadingMsg error:", e);
      setloadingMessage("Sky is booting up...");
      setTimeout(() => {
        setloadingMessage("...getting coffee...");
      }, 3000);
    }
  };



  const getAgentByVapiId = async () => {
    console.log('try to get agentembed tst')

    try {
      let path = `${Apis.getUserByAgentVapiId}/${assistantId}`
      console.log('api path of agent is', path)

      const response = await axios.get(
        path
      );

      if (response) {
        console.log('🔍 SUPPORT-WIDGET - Agent details response:', response?.data?.data);
        console.log('🔍 SUPPORT-WIDGET - Support button avatar:', response?.data?.data?.agent?.supportButtonAvatar);
        console.log('🔍 SUPPORT-WIDGET - Profile image:', response?.data?.data?.agent?.profile_image);
        console.log('🔍 SUPPORT-WIDGET - Support button text:', response?.data?.data?.agent?.supportButtonText);
        setAgentUserDetails(response?.data?.data ?? null);
        setSmartListData(response?.data?.data?.smartList);
        console.log('🔍 SUPPORT-WIDGET - Smart list data:', response?.data?.data?.smartList);
        return response?.data?.data?.agent ?? null;
      }
    } catch (e) {
      console.log('error in get agent by id', e)
    }
  }



  useEffect(() => {
    const vapiInstance = new Vapi(API_KEY);
    console.log('vapInstance', API_KEY)
    setVapi(vapiInstance);
    vapiInstance.on("call-start", () => {
      console.log("📞 CALL-START: Call started");
      setLoading(false);
      setOpen(true);
      setIsCallRunning(true)

    });
    vapiInstance.on("call-end", () => {
      console.log("📞 CALL-END: Call ended");
      setIsSpeaking(false);
      setOpen(false);
      setShowAskSkyModal(false)
      setIsCallRunning(false)
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

  // Form handling functions
  const handleFormDataChange = (field, value) => {
    console.log(`Updating form field ${field} with value:`, value);
    const newFormData = {
      ...formData,
      [field]: value
    };
    setFormData(newFormData);
  };

  const handleSmartListFieldChange = (field, value) => {
    console.log(`Updating smart list field ${field} with value:`, value);
    const newSmartListFields = {
      ...smartListFields,
      [field]: value
    };
    setSmartListFields(newSmartListFields);
  };

  // Handle modal actions
  const handleModalOpen = () => {
    console.log('🔍 SUPPORT-WIDGET - Opening smart list modal');
    setShowLeadModal(true);
  };

  const handleModalClose = () => {
    console.log('🔍 SUPPORT-WIDGET - Closing smart list modal');
    setShowLeadModal(false);
  };

  // Handle form submission and call initiation with overrides
  const handleFormSubmit = async () => {
    console.log("🔍 SUPPORT-WIDGET - Submitting form data:", { formData, smartListFields });
    setIsSubmitting(true);

    try {
      // Prepare extraColumns from smart list fields
      const extraColumns = {};
      Object.entries(smartListFields).forEach(([key, value]) => {
        if (value && value.trim()) {
          extraColumns[key] = value;
        }
      });

      // Prepare API data
      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        ...extraColumns
      };

      console.log('🔍 SUPPORT-WIDGET - API Data being sent:', apiData);

      // Call POST API to get assistant overrides
      const response = await axios.post(`${Apis.getUserByAgentVapiId}/${assistantId}`, apiData);

      if (response?.data?.status === true) {
        console.log('🔍 SUPPORT-WIDGET - Form submitted successfully:', response.data);
        const newOverrides = response?.data?.data?.assistantOverrides;

        setShowLeadModal(false);
        console.log("🔍 SUPPORT-WIDGET - Setting up call UI and starting call with new overrides");
        setLoading(true);
        setloadingMessage("");

        // Start call with the new overrides directly
        await startCall(newOverrides);
      } else {
        throw new Error(response?.data?.message || 'Form submission failed');
      }
    } catch (error) {
      console.error("🔍 SUPPORT-WIDGET - Error submitting form:", error);
      setSnackbarMessage("Error submitting form. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Get Help button click - check for smart list
  const handleGetHelpClick = () => {
    console.log("🔍 SUPPORT-WIDGET - Get Help button clicked");
    console.log("🔍 SUPPORT-WIDGET - Smart list data:", smartListData);

    // Check if agent has smartList attached
    if (smartListData && smartListData.id) {
      console.log("🔍 SUPPORT-WIDGET - Agent has smart list, showing modal");
      handleModalOpen();
    } else {
      console.log("🔍 SUPPORT-WIDGET - No smart list found, starting call directly");
      handleStartCall(true);
    }
  };

  async function startCall(overrides = null) {

    // Check if user has sufficient minutes before starting call
    let path = `${Apis.getUserByAgentVapiId}/${assistantId}`
    console.log('api path of get user by agent id is', path)

    const response = await axios.get(
      path
    );


    if (response.data.status && response.data.data.user) {
      console.log('response of get user api by agent id is', response.data.data.user)
      const { totalSecondsAvailable } = response.data.data.user;

      if (totalSecondsAvailable < 120) {
        setSnackbarMessage("Insufficient Balance");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
    }


    console.log("🔍 SUPPORT-WIDGET - starting call with overrides:", overrides)
    if (vapi) {
      // Use overrides passed as parameter (from form submission) or get default profile data
      let assistantOverrides;

      if (overrides) {
        console.log("🔍 SUPPORT-WIDGET - Using form submission overrides");
        assistantOverrides = overrides;
      } else {
        console.log("🔍 SUPPORT-WIDGET - Getting default profile data");
        const { pipelines = [], ...userProfile } =
          (await getProfileSupportDetails()) || {};

        assistantOverrides = {
          recordingEnabled: false,
          variableValues: {
            customer_details: JSON.stringify(userProfile),
            // pipeline_details: JSON.stringify(pipelines)
          },
        };
      }

      const payloadSize = new Blob([JSON.stringify(assistantOverrides)]).size;
      console.log(`🔍 SUPPORT-WIDGET - Payload size: ${payloadSize} bytes`);
      console.log('🔍 SUPPORT-WIDGET - Final assistantOverrides:', assistantOverrides)

      // Check if agent has smart list to determine which assistant ID to use
      if (smartListData?.id) {
        console.log("🔍 SUPPORT-WIDGET - Agent has smart list, using agent ID from response");
        vapi.start(agentUserDetails?.agent?.id || assistantId, assistantOverrides);
      } else {
        console.log("🔍 SUPPORT-WIDGET - No smart list, using provided assistant ID");
        vapi.start(assistantId, assistantOverrides);
      }
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
    await setLoadingMsg()
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
            delete data.sheets
            delete data.activity



            return {
              profile: user.user,
              additionalData: data,
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
        {/* Snackbar for error messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
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
          <GetHelpBtn
            text={agentUserDetails?.agent?.supportButtonText || "Get Help"}
            avatar={agentUserDetails?.agent?.supportButtonAvatar || agentUserDetails?.agent?.profile_image}
            handleReopen={handleGetHelpClick}
          />
        )
      }
      <div className="relative z-0 h-11 mb-4 mr-4">

        {
          voiceOpen && isCallRunning && (

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

      {/* Smart List Modal */}
      <Modal
        open={showLeadModal}
        onClose={handleModalClose}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: "#00000020",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "600px" },
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: "12px",
            boxShadow: 24,
            p: 3,
          }}
        >
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-row items-center justify-between">
              <div>
                <div className="text-2xl font-bold">Contact Details</div>
                <div className="text-sm text-gray-600 mt-1">
                  Please provide your information to get personalized help
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Basic Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleFormDataChange("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleFormDataChange("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormDataChange("email", e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <PhoneInput
                country={"us"}
                value={formData.phone}
                onChange={(phone) => handleFormDataChange("phone", phone)}
                inputStyle={{
                  width: "100%",
                  height: "48px",
                  fontSize: "16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                }}
                containerStyle={{
                  width: "100%",
                }}
              />
            </div>

            {/* Smart List Fields */}
            {smartListData && smartListData.columns && smartListData.columns.length > 0 && (
              <>
                <div className="mt-4">
                  <div className="text-lg font-medium mb-4">Additional Information</div>
                  <div className="space-y-4">
                    {smartListData.columns.map((column, index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium mb-2">
                          {column.columnName.charAt(0).toUpperCase() + column.columnName.slice(1)}
                        </label>
                        <input
                          type="text"
                          value={smartListFields[column.columnName] || ''}
                          onChange={(e) => handleSmartListFieldChange(column.columnName, e.target.value)}
                          placeholder={`Enter ${column.columnName}`}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <div className="flex flex-row items-center justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={handleModalClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isSubmitting && <CircularProgress size={16} color="inherit" />}
                {isSubmitting ? "Starting Call..." : "Start Call"}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
