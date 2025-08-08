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
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import PhoneVerificationCodesList from "@/components/admin/verificationCodesList/PhoneVerificationCodesList";
import AdminUpcomingCharges from "@/components/admin/upcomingCharges/AdminUpcomingCharges";
import AdminPaymentsNeedingRefund from "@/components/admin/paymentsNeedingRefund/AdminPaymentsNeedingRefund";

function Page() {
  const router = useRouter();
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
      name: "Upcoming Charges",
      value: 'upcoming-charges',

    },
    {
      id: 7,
      name: "Payments Needing Refund",
      value: 'payments-needing-refund',

    },
    {
      id: 8,
      name: "Logout",
    },
  ];

  const [selectedManu, setSelectedManu] = useState(manuBar[0]);

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
                if (item.name == "Logout") {
                  logout();
                  router.replace("/");
                } else {
                  setSelectedManu(item);
                }
              }}
              className={`flex flex-row items-center gap-3 p-2 items-center 
                      ${
                        selectedManu.id == item.id &&
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

        <div className="w-full items-center h-full overflow-hidden flex-1">
        {selectedManu.name === "Users" ? (
          <AdminUsers />
        ) : selectedManu.name === "Affiliates" ? (
          <AdminAffiliates />
        ) : selectedManu.name === "Call Logs" ? (
          <AdminDashboardCallLogs />
        ) : selectedManu.name === "Phone Verification Codes" ? (
          <PhoneVerificationCodesList />
        ) : selectedManu.name === "Upcoming Charges" ? (
          <AdminUpcomingCharges />
        ) : selectedManu.name === "Payments Needing Refund" ? (
          <AdminPaymentsNeedingRefund />
        ) : (
          <div>
            <Dashboard />
          </div>
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
}

export default Page;
