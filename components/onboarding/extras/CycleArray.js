import React, { useState, useEffect } from "react";
import agents from "./AgentsList";

const shuffleAgents = agents;

const AgentBox = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingAgent, setShowingAgent] = useState(shuffleAgents[0]);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsExiting(true); // Start exiting the current agent

      // Wait for a short time (no animation) before moving to the next agent
      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % shuffleAgents.length;
          setShowingAgent(shuffleAgents[nextIndex]); // Show the next agent
          setIsExiting(false); // Reset the exit state
          return nextIndex;
        });
      }, 100); // Short delay for removing the current capsule
    }, 10000); // Change agent every 4 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Keyframe animations
  useEffect(() => {
    if (typeof document !== "undefined") {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.innerHTML = `
        @keyframes slideIn {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styleSheet);

      return () => {
        document.head.removeChild(styleSheet); // Cleanup
      };
    }
  }, []);

  // Styles for the capsule
  const agentBoxStyle = {
    border: "none",
    padding: "10px 20px",
    width: "320px",
    height: "80px",
    textAlign: "start",
    margin: "25% auto",
    backgroundColor: "white",
    boxShadow: "0px 4px 15px 0px rgba(0, 0, 0, 0.09)",
    fontWeight: "500",
    fontSize: 15,
    fontStyle: "normal",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "50px", // Capsule shape
    animation: isExiting
      ? "none" // No animation for dismissal
      : "slideIn 1s forwards", // Entry animation
    overflow: "hidden",
  };

  // Styles for the image
  const imageStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "1px solid #e0e0e0", // Light gray border
    objectFit: "cover",
  };

  // Styles for the text container
  const textContainerStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
  };

  // Styles for the top text (name and location)
  const topTextStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "14px",
    fontWeight: "medium",
  };

  // Styles for the bottom fixed text
  const bottomTextStyle = {
    fontSize: "13px",
    color: "#888", // Light gray color for the fixed text
    fontWeight: "normal",
  };

  return (
    <div>
      <div style={agentBoxStyle}>
        {/* Image on the left */}
        <img
          src={showingAgent.image || "default-image.jpg"} // Use default image if not available
          alt="Agent"
          style={imageStyle}
        />

        {/* Text container */}
        <div style={textContainerStyle}>
          {/* Name and location on the same line */}
          <div className="flex flex-row items-center">
            <div style={{ ...topTextStyle, marginRight: "5px" }}>
              {showingAgent.Agent_Full_Name.length > 10
                ? `${showingAgent.Agent_Full_Name.slice(0, 10)}...`
                : showingAgent.Agent_Full_Name}
            </div>
            <div style={{ color: "#00000040", margin: "0 5px" }}>from</div>
            <div style={{ ...topTextStyle, marginLeft: "5px" }}>
              {showingAgent.City.length > 10
                ? `${showingAgent.City.slice(0, 10)}...`
                : `${showingAgent.City}`}
              , {showingAgent.State}
            </div>
          </div>

          {/* Fixed text below */}
          <div style={bottomTextStyle}>Created an AgentX</div>
        </div>
      </div>
    </div>
  );
};

export default AgentBox;
