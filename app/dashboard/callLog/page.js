"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { CircularProgress, duration } from "@mui/material";
import AllCalls from "@/components/calls/AllCalls";
import SheduledCalls from "@/components/calls/SheduledCalls";
import CallActivities from "@/components/calls/CallActivties";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import { PersistanceKeys } from "@/constants/Constants";
import LeadLoading from "@/components/dashboard/leads/LeadLoading";

function Page() {
  // console.log("This is a callLOg CRash", CallLogTest);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("All Calls");

  useEffect(() => {
    let localD = localStorage.getItem(PersistanceKeys.LocalStorageUser);
    if (localD) {
      let d = JSON.parse(localD);
      setUser(d);
    }
    // getSheduledCallLogs();
  }, []);

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      <div
        className=" w-full flex flex-row justify-between items-center py-4 mt-2 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <div style={{ fontSize: 24, fontWeight: "600" }}>Call Log</div>

        <div>
          <NotficationsDrawer user={user} />
        </div>
      </div>

      <div className=" w-full flex mt-6  gap-8 pb-2 mb-4 pl-10">
        {["All Calls", "Call Activities", "Scheduled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${
              activeTab === tab
                ? "text-purple border-b-2 border-purple outline-none"
                : ""
            }`}
            style={{ fontSize: 15, fontWeight: "500" }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="w-full">
        {activeTab === "All Calls" ? (
          <AllCalls user={user} />
        ) : activeTab === "Scheduled" ? (
          <SheduledCalls user={user} />
          // <LeadLoading />

        ) : (
          <CallActivities user={user} />
        )}
      </div>
    </div>
  );
}

export default Page;
