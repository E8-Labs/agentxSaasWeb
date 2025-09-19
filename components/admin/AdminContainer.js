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
import AdminUpcomingCharges from "@/components/admin/upcomingCharges/AdminUpcomingCharges";
import AdminPaymentsNeedingRefund from "@/components/admin/paymentsNeedingRefund/AdminPaymentsNeedingRefund";
import AdminAgencyDetails from "./agency/AdminAgencyDetails";
import AdminTransactions from "./agency/AdminTransactions";
import AdminActiveCalls from "./activeCalls/AdminActiveCalls";
import AdminPaymentCharges from "./paymentCharges/AdminPaymentCharges";
import AgencyPlans from "./plans/AgencyPlans";
import AgentXPlans from "./plans/AgentXPlans";
import AdminCronJobs from "./cronJobs/AdminCronJobs";

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
      id: 9,
      name: "Agency",
      value: 'agency',

    },
    {
      id: 6,
      name: "Billing",
      value: 'billing',

    },
    {
      id: 7,
      name: "Plans",
      value: 'plans',

    },
    {
      id: 8,
      name: "Cron Jobs",
      value: 'cron-jobs',

    },
    {
      id: 9,
      name: "Logout",
    },
  ];


  const tabParam = searchParams.get("tab");
  const defaultTab = manuBar.find((item) => item.value === tabParam) || manuBar[0];
  const [selectedManu, setSelectedManu] = useState(defaultTab);
  
  // Agency submenu state
  const [agencySubTab, setAgencySubTab] = useState('agencies');
  
  const agencySubMenus = [
    { id: 1, name: "Agencies", value: 'agencies' },
    { id: 2, name: "Transactions", value: 'transactions' }
  ];

  // Billing submenu state
  const [billingSubTab, setBillingSubTab] = useState('upcoming-charges');
  
  const billingSubMenus = [
    { id: 1, name: "Upcoming Charges", value: 'upcoming-charges' },
    { id: 2, name: "Payment Charges", value: 'payment-charges' },
    { id: 3, name: "Active Calls", value: 'active-calls' }
  ];

  // Plans submenu state
  const [plansSubTab, setPlansSubTab] = useState('agentx-plans');
  
  const plansSubMenus = [
    { id: 1, name: "AgentX Plans", value: 'agentx-plans' },
    { id: 2, name: "Agency Plans", value: 'agency-plans' }
  ];

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
                  // router.replace("/");
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

        {/* Agency Submenu */}
        {selectedManu.name === "Agency" && (
          <div className="flex w-[100vw] flex-row items-center justify-start gap-3 px-10 pt-2 bg-gray-50">
            {agencySubMenus.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => setAgencySubTab(subItem.value)}
                className={`flex flex-row items-center gap-3 p-2 items-center 
                        ${agencySubTab === subItem.value &&
                  "border-b-[2px] border-purple"
                  }`}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: agencySubTab === subItem.value ? "#7902df" : "#666",
                  }}
                >
                  {subItem.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Billing Submenu */}
        {selectedManu.name === "Billing" && (
          <div className="flex w-[100vw] flex-row items-center justify-start gap-3 px-10 pt-2 bg-gray-50">
            {billingSubMenus.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => setBillingSubTab(subItem.value)}
                className={`flex flex-row items-center gap-3 p-2 items-center 
                        ${billingSubTab === subItem.value &&
                  "border-b-[2px] border-purple"
                  }`}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: billingSubTab === subItem.value ? "#7902df" : "#666",
                  }}
                >
                  {subItem.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Plans Submenu */}
        {selectedManu.name === "Plans" && (
          <div className="flex w-[100vw] flex-row items-center justify-start gap-3 px-10 pt-2 bg-gray-50">
            {plansSubMenus.map((subItem) => (
              <button
                key={subItem.id}
                onClick={() => setPlansSubTab(subItem.value)}
                className={`flex flex-row items-center gap-3 p-2 items-center 
                        ${plansSubTab === subItem.value &&
                  "border-b-[2px] border-purple"
                  }`}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: plansSubTab === subItem.value ? "#7902df" : "#666",
                  }}
                >
                  {subItem.name}
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="w-full items-center h-full overflow-hidden flex-1">
          {selectedManu.name === "Users" ? (
            <AdminUsers />
          ) : selectedManu.name === "Affiliates" ? (
            <AdminAffiliates />
          ) : selectedManu.name === "Call Logs" ? (
            <AdminDashboardCallLogs />
          ) : selectedManu.name === "Phone Verification Codes" ? (
            <PhoneVerificationCodesList />
          ) : selectedManu.name === "Billing" ? (
            billingSubTab === 'upcoming-charges' ? (
              <AdminUpcomingCharges />
            ) : billingSubTab === 'payment-charges' ? (
              <AdminPaymentCharges />
            ) : (
              <AdminActiveCalls />
            )
          ): selectedManu.name === "Agency" ? (
            agencySubTab === 'agencies' ? (
              <AdminAgencyDetails />
            ) : (
              <AdminTransactions />
            )
          ) : selectedManu.name === "Plans" ? (
            plansSubTab === 'agentx-plans' ? (
              <AgentXPlans />
            ) : (
              <AgencyPlans />
            )
          ) : selectedManu.name === "Cron Jobs" ? (
            <AdminCronJobs />
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

export default AdminContainer;
