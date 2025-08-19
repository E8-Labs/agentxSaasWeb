"use client";
import { useState, useCallback, useEffect, useRef } from "react"; // useRef added
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Box,
  Drawer,
  Modal,
  Snackbar,
  Alert,
  Slide,
  Fade,
} from "@mui/material";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import axios from "axios";
import Apis from "../apis/Apis";

import {
  Globe,
  InstagramLogo,
  YoutubeLogo,
  TwitterLogo,
  FacebookLogo,
  XLogo,
} from "@phosphor-icons/react";

import Vapi from "@vapi-ai/web";
import { VoiceWavesComponent } from "../askSky/askskycomponents/voice-waves";
import { AudioWaveActivity } from "../askSky/askskycomponents/AudioWaveActivity";

const backgroundImage = {
  backgroundImage: 'url("/backgroundImage.png")', // Ensure the correct path
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  width: "100%",
  height: "100svh",
  overflow: "hidden",
};

const Creator = ({ agentId, name }) => {
  const router = useRouter();
  const buttonRef = useRef(null);
  const buttonRef2 = useRef(null);
  const buttonRef3 = useRef(null);
  const buttonRef4 = useRef(null);
  const buttonRef5 = useRef(null);
  const buttonRef6 = useRef(null);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const [boxVisible, setBoxVisible] = useState(false); // Animation state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // Mouse position state
  const { creator } = useParams();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isWideScreen2, setIsWideScreen2] = useState(false);
  const [isHighScreen, setIsHighScreen] = useState(false);
  const [windowHeight, setWindowHeight] = useState(1200);

  //triger vapi variables
  const [vapi, setVapi] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setloadingMessage] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false); // Opens the support menu
  const [voiceOpen, setVoiceOpen] = useState(false); // Sets up the Voice AI interface
  const [chatOpen, setChatOpen] = useState(false); // Sets up the chat interface
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const API_KEY = process.env.NEXT_PUBLIC_REACT_APP_VITE_API_KEY;

  // User loading messages to fake feedback...
  useEffect(() => {
    if (loading) {
      setloadingMessage(`${name} is booting up...`);

      const timer = setTimeout(() => {
        setloadingMessage("...getting coffee...");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    const handleResize = () => {
      // Check if width is greater than or equal to 1024px
      setWindowHeight(window.innerHeight);
      setIsWideScreen(window.innerWidth >= 950);

      setIsWideScreen2(window.innerWidth >= 500);
      // Check if height is greater than or equal to 1024px
      setIsHighScreen(window.innerHeight >= 950);

      // Log the updated state values for debugging (Optional)
      console.log("isWideScreen: ", window.innerWidth >= 950);
      console.log("isWideScreen2: ", window.innerWidth >= 500);
      console.log("isHighScreen: ", window.innerHeight >= 1024);
    };

    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  // Effect to update screen size status
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)"); // Adjust the max-width according to your medium screen size breakpoint
    const handleResize = () => setIsSmallScreen(mediaQuery.matches);

    handleResize(); // Check the screen size on component mount
    mediaQuery.addEventListener("change", handleResize); // Add listener for screen resize

    return () => mediaQuery.removeEventListener("change", handleResize); // Cleanup listener on component unmount
  }, []);

  // Handle button click
  const handleInitiateVapi = () => {
    handleStartCall();
  };

  useEffect(() => {
    const vapiInstance = new Vapi(API_KEY);
    console.log("vapInstance", API_KEY);
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
      setloadingMessage("");
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

  async function handleStartCall(voice) {
    try {
      // Check if user has sufficient minutes before starting call
      const response = await axios.get(
        `${Apis.getUserByAgentVapiId}/${agentId}`
      );

      if (response.data.status && response.data.data.user) {
        const { totalSecondsAvailable } = response.data.data.user;

        if (totalSecondsAvailable < 120) {
          setSnackbarMessage("Insufficient Balance");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
          return;
        }
      }

      setOpen(true);
      console.log("trying to start call");
      setLoading(true);
      setloadingMessage("");

      if (voice) {
        setVoiceOpen(true);
      } else {
        setChatOpen(true);
      }

      await startCall();
    } catch (error) {
      console.error("Error checking user minutes:", error);
      setSnackbarMessage("Error checking available minutes. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }

  async function startCall() {
    console.log("starting call");
    if (vapi) {
      vapi.start(agentId);
    } else {
      console.error("Vapi instance not initialized");
    }
  }

  async function handleCloseCall() {
    await vapi?.stop();
    setLoading(false);
    setloadingMessage("");
    setOpen(false);
    if (voiceOpen) {
      setVoiceOpen(false);
    }

    if (chatOpen) {
      setChatOpen(false);
    }
  }

  const handleMouseMove = (event) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const x = event.clientX;
    const y = event.clientY;

    setMousePosition({ x, y });

    // Check if the mouse is within 150px of the center
    if (Math.abs(x - centerX) <= 150 && Math.abs(y - centerY) <= 150) {
      setBoxVisible(false); // Hide the box
      return;
    }

    // Check if the mouse is over buttonRef
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        setBoxVisible(false); // Hide the animation when hovering over buttonRef
        return;
      }
    }
  };

  const showCallUI = () => {
    return (
      <div className="flex flex-col w-full items-center justify-center">
        {loading || !open ? (
          <p className="mt-10 italic">{loadingMessage}</p>
        ) : isSpeaking ? (
          <VoiceWavesComponent className="mt-12" />
        ) : (
          <AudioWaveActivity
            isActive={isSpeaking}
            barCount={25}
            className="mt-10"
          />
        )}

        {open && (
          <button
            ref={buttonRef}
            onClick={handleCloseCall}
            className="px-6 py-3 rounded-full bg-purple mt-5 text-white text-[15px] font-[500]"
          >
            End Call
          </button>
        )}
      </div>
    );
  };

  const gifBackgroundImageSmallScreen = {
    backgroundImage: 'url("/assets/applogo2.png")', // Ensure the correct path
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: isWideScreen2 ? "550px" : "380px",
    height: isWideScreen2 ? "550px" : "380px",
    borderRadius: "50%",
    resize: "cover",
  };

  const gifBackgroundImage = {
    backgroundImage: 'url("/assets/applogo2.png")', // Ensure the correct path
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: isHighScreen ? "790px" : "530px",
    height: isHighScreen ? "790px" : "530px",
    borderRadius: "50%",
    resize: "cover",
  };

  return (
    <div>
      <div
        style={backgroundImage}
        className="  overflow-y-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Animating Image */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          className="flex flex-col w-9/12 justify-center items-center md:flex hidden"
        >
          <button
            className="flex items-center justify-center flex-1"
            style={{
              cursor: "pointer",
              outline: "none",
              border: "none",
              backgroundColor: "transparent",
            }}
          >
            {/* <div className='flex flex-row items-center justify-center' style={gifBackgroundImage}>
                                    <Image onClick={handleInitiateVapi} src="/mainAppGif.gif" alt='gif' style={{ backgroundColor: "red", borderRadius: "50%" }} height={600} width={600} />
                                </div> */}

            <div
              style={gifBackgroundImage}
              className="flex flex-row justify-center items-center"
            >
              <Image
                ref={buttonRef6}
                onClick={handleInitiateVapi}
                src="/assets/maingif.gif"
                alt="gif"
                style={{
                  backgroundColor: "",
                  borderRadius: "50%",
                  height: windowHeight / 2.14,
                  width: windowHeight / 2.14,
                }}
                height={600}
                width={600}
              />
            </div>
          </button>

          {showCallUI()}
        </div>

        {/* visible on small screens only */}
        <div
          style={{
            position: "absolute",
            top: "55%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          className="w-full flex justify-center items-center md:hidden flex flex-col gap-4"
        >
          <button
            className="flex flex-col items-center justify-center flex-1 mr-6"
            style={{
              cursor: "pointer",
              outline: "none",
              border: "none",
            }}
          >
            {/* <div className='px-4 py-2 rounded-lg -mb-8' style={{ fontSize: 14, fontWeight: '500', fontFamily: 'inter', backgroundColor: '#ffffff50' }}>
                                    Tap to call
                                </div> */}
            <motion.div
              animate={{
                y: [0, -30, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
              className="-mb-16 rounded-lg flex flex-col justify-center"
              style={{
                fontSize: 14,
                fontWeight: "500",
                fontFamily: "inter",
                backgroundColor: "#ffffff80",
                padding: "10px 20px", // Add padding to the content inside the box
                position: "relative", // Required for positioning the triangle
              }}
            >
              Tap to call
              {/* Triangle at the bottom center */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "15px solid transparent",
                  borderRight: "15px solid transparent",
                  borderTop: "15px solid #ffffff80",
                }}
              />
            </motion.div>

            <div
              style={gifBackgroundImageSmallScreen}
              className="flex flex-row justify-center items-center"
            >
              <Image
                onClick={handleInitiateVapi}
                src="/assets/maingif.gif"
                alt="gif"
                style={{
                  backgroundColor: "",
                  borderRadius: "50%",
                  height: windowHeight / 3,
                  width: windowHeight / 3,
                }}
                height={200}
                width={200}
              />
            </div>
          </button>
          {showCallUI()}
        </div>

        {/* Mouse Following Box Animation */}
        <div className="lg:flex hidden">
          <AnimatePresence>
            {boxVisible && (
              <motion.div
                style={{
                  position: "absolute",
                  top: Math.min(
                    Math.max(mousePosition.y - 50, 0),
                    window.innerHeight - 120
                  ), // Ensures the box stays within the viewport height
                  left: Math.min(
                    Math.max(mousePosition.x - 50, 0),
                    window.innerWidth - 120
                  ), // Ensures the box stays within the viewport width
                  width: 100,
                  height: 100,
                  backgroundColor: "#ffffff60",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  style={{
                    color: "black",
                    fontWeight: "500",
                    fontFamily: "inter",
                    fontSize: 14,
                  }}
                >
                  Tap to call
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
    </div>
  );
};

export default Creator;
