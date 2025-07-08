import React, { useState } from "react";
import Image from "next/image";
import AdminUsers from "@/components/admin/users/AdminUsers";
import Dashboard from "@/components/admin/dashboard/dashboard";
import BackgroundVideo from "@/components/general/BackgroundVideo";
import AdminAffiliates from "@/components/admin/affiliates/AdminAffiliates";

import { useRouter, useSearchParams } from "next/navigation";
import { logout } from "@/utilities/UserUtility";
import AdminDashboardCallLogs from "@/components/admin/CallLogs/AdminDashboardCallLogs";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import PhoneVerificationCodesList from "@/components/admin/verificationCodesList/PhoneVerificationCodesList";

function AdminContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const manuBar = [
    {
      id: 1,
      name: "Dashboard",
      value: 'dashboard',

    },
    {
      id: 2,
      name: "Users",
      value: 'users',
    },
    {
      id: 3,
      name: "Affiliates",
      value: 'affiliates',

    },
    {
      id: 4,
      name: "Call Logs",
      value: 'call-logs',

    },
    {
      id: 5,
      name: "Phone Verification Codes",
      value: 'phone-verification-codes',

    },
    {
      id: 6,
      name: "Logout",
    },
  ];


  const tabParam = searchParams.get("tab");
  const defaultTab = manuBar.find((item) => item.value === tabParam) || manuBar[0];
  const [selectedManu, setSelectedManu] = useState(defaultTab);

  return (
    
    <ErrorBoundary>
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
                if (item.name === "Logout") {
                  logout();
                  router.replace("/");
                } else {
                  setSelectedManu(item);
                  const newUrl = `?tab=${encodeURIComponent(item.value)}`;
                  router.push(newUrl); 
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
          ) : selectedManu.name === "Affiliates" ? (
            <AdminAffiliates />
          ) : selectedManu.name === "Call Logs" ? (
            <AdminDashboardCallLogs />
          ) : selectedManu.name === "Phone Verification Codes" ?
            <PhoneVerificationCodesList />
            : (
              <div>
                <Dashboard />
              </div>
            )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default AdminContainer;
