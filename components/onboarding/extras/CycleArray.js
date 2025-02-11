import React, { useState, useEffect } from "react";
import agents from "./AgentsList";

// Function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

// Shuffle the agents list once at the beginning
const shuffledAgents = shuffleArray(agents);

const AgentBox = ({ user }) => {
  const initialIndex = Math.floor(Math.random() * shuffledAgents.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showingAgent, setShowingAgent] = useState(
    shuffledAgents[initialIndex]
  );
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true); // Start exit animation

      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % shuffledAgents.length;
          setShowingAgent(shuffledAgents[nextIndex]);
          setIsAnimating(false); // Reset animation
          return nextIndex;
        });
      }, 500); // Ensure animation timing is smooth
    }, 5000); // Change agent every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <style>
        {`
          @keyframes fadeInSlide {
            0% {
              transform: translateY(20px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes fadeOutSlide {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(-20px);
              opacity: 0;
            }
          }
        `}
      </style>

      <div
        key={showingAgent.Agent_Full_Name} // Ensure component re-renders on agent change
        style={{
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
          borderRadius: "50px",
          animation: isAnimating
            ? "fadeOutSlide 0.5s forwards"
            : "fadeInSlide 0.5s forwards",
          overflow: "hidden",
        }}
      >
        {/* Image */}
        <img
          src={showingAgent.image || "default-image.jpg"}
          alt="Agent"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "1px solid #e0e0e0",
            objectFit: "cover",
          }}
        />

        {/* Text container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Name and location */}
          <div className="flex flex-row items-center">
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginRight: "5px",
              }}
            >
              {showingAgent.Agent_Full_Name.length > 10
                ? `${showingAgent.Agent_Full_Name.slice(0, 10)}...`
                : showingAgent.Agent_Full_Name}
            </div>
            <div style={{ color: "#00000040", margin: "0 5px" }}>from</div>
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginLeft: "5px",
              }}
            >
              {showingAgent.City.length > 10
                ? `${showingAgent.City.slice(0, 10)}...`
                : `${showingAgent.City}`}
              , {showingAgent.State}
            </div>
          </div>

          {/* Fixed text below */}
          <div
            style={{ fontSize: "13px", color: "#888", fontWeight: "normal" }}
          >
            Created an AgentX
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBox;
