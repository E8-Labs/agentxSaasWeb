import React, { useState, useEffect } from 'react';
import agents from './AgentsList';

const shuffleAgents = agents;

const AgentBox = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showingAgent, setShowingAgent] = useState(shuffleAgents[0]);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsExiting(true); // Start exiting the current agent

            // Wait for the exit animation to finish before moving to the next agent
            setTimeout(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % shuffleAgents.length;
                    setShowingAgent(shuffleAgents[nextIndex]); // Show the next agent
                    setIsExiting(false); // Reset the exit state
                    return nextIndex;
                });
            }, 6000); // This should match the exit animation duration
        }, 6000); // Change agent every 3 seconds

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    // Keyframe animations
    useEffect(() => {
        if (typeof document !== "undefined") {
            const styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerHTML = `
            @keyframes slideUp {
                0% {
                    transform: translateY(50px);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideDown {
                0% {
                    transform: translateY(0);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-50px);
                    opacity: 0;
                }
            }
        `;
            document.head.appendChild(styleSheet);

            return () => {
                document.head.removeChild(styleSheet); // Cleanup
            };
        }
    }, []);

    // Agent box styles for showing and hiding
    const agentBoxStyle = {
        border: 'none',
        padding: '20px',
        // width: '300px',
        textAlign: 'start',
        margin: '20px auto',
        borderRadius: '8px',
        backgroundColor: 'white',
        opacity: 0,
        animation: 'slideUp 6s forwards', // Animate in when showing
        boxShadow: "0px 4px 15px 0px rgba(0, 0, 0, 0.09)",
        fontWeight: "500",
        fontSize: 15,
        fontStyle: "normal",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
        // backdropFilter: "blur(7.050000190734863px)"
    };

    const hideBoxStyle = {
        ...agentBoxStyle,
        animation: 'slideDown 6s forwards', // Animate out when hiding
    };

    return (
        <div>
            {/* Agent box that is currently showing */}
            <div style={isExiting ? hideBoxStyle : agentBoxStyle}>
                {showingAgent.Agent_Full_Name} | {showingAgent.City}, {showingAgent.State}
                <div style={{
                    fontWeight: "500",
                    fontSize: 13,
                }}>
                    Created an AgentX
                </div>
            </div>
        </div>
    );
};

export default AgentBox;
