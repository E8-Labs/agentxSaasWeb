"use client";
import { useState, useEffect } from "react";
import ProfileNav from "@/components/dashboard/Navbar/ProfileNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import AgencyNavBar from "@/components/dashboard/Navbar/AgencyNavBar";

const shouldShowServiceBanner =
  process.env.NEXT_PUBLIC_REACT_APP_DOWN_TIME === "Yes";

export default function DashboardLayout({ children }) {
  const message =
    "Taking a brief pause to invent the future. Calls will resume soon.";

  const [typedMessage, setTypedMessage] = useState(message);
  const [charIndex, setCharIndex] = useState(0);

  //   useEffect(() => {
  //     if (shouldShowServiceBanner && charIndex < message.length) {
  //       const timeout = setTimeout(() => {
  //         setTypedMessage((prev) => prev + message[charIndex]);
  //         setCharIndex((prev) => prev + 1);
  //       }, 50); // Typing speed

  //       return () => clearTimeout(timeout);
  //     }
  //   }, [charIndex, shouldShowServiceBanner]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col w-full">
        {/* Service Banner */}
        {shouldShowServiceBanner && (
          <div className="pt-2 fixed top-0 left-0 w-full  bg-purple text-white z-[9999] flex flex-col items-center justify-center">
            <p className=" text-md font-bold text-center">
              🚧 Maintenance Notice 🚧
            </p>
            <p className=" text-md font-medium text-center">{typedMessage}</p>
          </div>
        )}

        {/* Main Layout */}
        <div
          className={`flex flex-row w-full ${
            shouldShowServiceBanner ? "pt-[4vh]" : ""
          }`}
        >
          {/* Sidebar */}
          <div
            className="h-screen w-2/12"
            style={{
              borderRight: "1px solid #00000010",
              backgroundColor: "white",
            }}
          >
            <AgencyNavBar />
          </div>

          {/* Main Content */}
          <div className="w-10/12">
            <div>{/* <NoPlanPopup /> */}</div>
            {children}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
