"use client";
import React, { useState } from "react";
import Image from "next/image";
import AdminUsers from "@/components/admin/users/AdminUsers";
import Dashboard from "@/components/admin/dashboard/dashboard";
import BackgroundVideo from "@/components/general/BackgroundVideo";
import AdminAffiliates from "@/components/admin/affiliates/AdminAffiliates";

import { useRouter } from "next/navigation";
import { logout } from "@/utilities/UserUtility";
import AdminDashboardCallLogs from "@/components/admin/CallLogs/AdminDashboardCallLogs";

function Page() {
  const router = useRouter();
  const manuBar = [
    {
      id: 1,
      name: "Dashboard",
    },
    {
      id: 2,
      name: "Users",
    },
    {
      id: 3,
      name: "Affiliates",
    },
    {
      id: 4,
      name: "Call Logs",
    },
    {
      id: 5,
      name: "Logout",
    },
  ];

  const [selectedManu, setSelectedManu] = useState(manuBar[0]);

  return (
    <div className="w-full flex flex-col items-center h-[100svh] overflow-hidden ">
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          backgroundColor: "white",
          zIndex: -1, // Ensure the video stays behind content
        }}
      >
        {selectedManu.id === 1 && (
          <BackgroundVideo showImageOnly={true} imageUrl="/adminbg.png" />
        )}
      </div>

      <div className="flex w-[100vw] flex-row items-center justify-start gap-3 px-10 pt-2">
        {manuBar.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.name == "Logout") {
                logout();
                router.replace("/");
              } else {
                setSelectedManu(item);
              }
            }}
            className={`flex flex-row items-center gap-3 p-2 items-center 
                      ${selectedManu.id == item.id &&
              "border-b-[2px] border-purple"
              }`}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: selectedManu.id == item.id ? "#7902df" : "#000",
              }}
            >
              {item.name}
            </div>
          </button>
        ))}
      </div>

      <div className="w-full items-center">
        {selectedManu.name === "Users" ? (
          <AdminUsers />
        ) : 
          selectedManu.name === "Affiliates" ? (
            <AdminAffiliates />
          ) : (
            selectedManu.name === "Call Logs" ? (
              <AdminDashboardCallLogs />
            ) : (
              <div>
                <Dashboard />
              </div>
            )
          )}
      </div>
    </div>
  );
}

export default Page;
