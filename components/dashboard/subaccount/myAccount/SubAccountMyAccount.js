"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import BasicInfo from "@/components/myAccount/BasicInfo";
import MyPhoneNumber from "@/components/myAccount/MyPhoneNumber";
import { Button, Drawer } from "@mui/material";
import SendFeedback from "@/components/myAccount/SendFeedback";
import InviteAgentX from "@/components/myAccount/InviteAgentX";
import Support from "@/components/myAccount/Support";
import Billing from "@/components/myAccount/Billing";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import { useRouter, useSearchParams } from "next/navigation";
import BarServices from "@/components/myAccount/BarServices";
import SubAccountBasicInfo from "./SubAccountBasicInfo";
import SubAccountBilling from "./SubAccountBilling";
import SubAccountMyPhoneNumber from "./SubAccountMyPhoneNumber";
import SubAccountSupport from "./SubAccountSupport";
import SubAccountSendFeedback from "./SubAccountSendFeedback";
import SubAccountInviteAgentX from "./SubAccountInviteAgentX";
import SubAccountBarServices from "./SubAccountBarServices";

function SubAccountMyAccount() {
  let searchParams = useSearchParams();
  const router = useRouter();

  const [tabSelected, setTabSelected] = useState(6);

  const manuBar = [
    {
      id: 1,
      heading: "Basic Information",
      subHeading: "Manage personal information ",
      icon: "/otherAssets/profileCircle.png",
    },
    {
      id: 2,
      heading: "Billing",
      subHeading: "Manage your billing and payment methods",
      icon: "/otherAssets/walletIcon.png",
    },
    {
      id: 3,
      heading: "My Phone Numbers",
      subHeading: "All agent phone numbers",
      icon: "/assets/unSelectedCallIcon.png",
    },
    {
      id: 4,
      heading: "Bar Services",
      subHeading: "Our version of the genius bar",
      icon: "/assets/X.svg",
    },
    {
      id: 5,
      heading: "Support",
      subHeading: "Get in touch with our team and get help",
      icon: "/otherAssets/headPhoneIcon.png",
    },
    {
      id: 6,
      heading: "Send Feedback",
      subHeading: "Report bugs, new features and more",
      icon: "/otherAssets/feedbackIcon.png",
    },
  ];

  const [selectedManu, setSelectedManu] = useState(manuBar[tabSelected]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [selectedUserData, setSelectedUSerData] = useState(null);

  useEffect(() => {
    const tab = searchParams.get("tab"); // Get the value of 'tab'
    let number = Number(tab) || 6;
    // //console.log;
    const userData = localStorage.getItem("User");
    if (userData) {
      const d = JSON.parse(userData);
      setSelectedUSerData(d.user);
    }
    setTabSelected(number);
    if (!tab) {
      setParamsInSearchBar(6);
    }
  }, []);

  const setParamsInSearchBar = (index = 1) => {
    // Create a new URLSearchParams object to modify
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", index); // Set or update the 'tab' parameter

    // Push the updated URL
    router.push(`/dashboard/myAccount?${params.toString()}`);

    // //console.log;
  };

  const renderComponent = () => {
    // setTabSelected(selectedMenuId);

    switch (tabSelected) {
      case 1:
        return <SubAccountBasicInfo />;
      case 2:
        return <SubAccountBilling
          selectedUser={selectedUserData}
        />;
      case 3:
        return <SubAccountMyPhoneNumber />;
      case 4:
        return <SubAccountBarServices
        selectedUser={selectedUserData} />;
      case 5:
        return <SubAccountSupport />;
      // case 6:
      //   return <SubAccountInviteAgentX />;
      case 6:
        return <SubAccountSendFeedback />;
      default:
        return <div>Please select an option.</div>;
    }
  };

  return (
    // <Suspense>
    <div
      className="w-full flex flex-col items-center"
      style={{ overflow: "hidden", height: "100vh" }}
    >
      <div
        className=" w-full flex flex-row justify-between items-center py-4 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <div style={{ fontSize: 24, fontWeight: "600" }}>My Account</div>

        <div className="flex flex-col">
          <NotficationsDrawer />
        </div>
      </div>

      <div className="w-full flex flex-row item-center pl-4">
        <div className="w-4/12 items-center flex flex-col pt-4 pr-2">
          {manuBar.map((item, index) => (
            <div key={item.id} className="w-full">
              <button
                className="w-full outline-none"
                style={{
                  textTransform: "none", // Prevents uppercase transformation
                  fontWeight: "normal", // Optional: Adjust the font weight
                }}
                onClick={() => {
                  //   setSelectedManu(index + 1);
                  setTabSelected(index + 1);
                  setParamsInSearchBar(index + 1);
                }}
              >
                <div
                  className="p-4 rounded-lg flex flex-row gap-2 items-start mt-4 w-full"
                  style={{
                    backgroundColor:
                      index === tabSelected - 1 ? "#402FFF10" : "transparent",
                  }}
                >
                  <Image src={item.icon} height={24} width={24} alt="icon" />
                  <div
                    className="flex flex-col gap-1 items-start"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#000",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.heading}
                    </div>

                    <div
                      style={{ fontSize: 13, fontWeight: "500", color: "#000" }}
                    >
                      {item.subHeading}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div
          className="w-8/12 "
          style={{
            overflow: "auto",
            height: "92vh",
            borderLeftWidth: 1,
            borderBottomColor: "#00000010",
          }}
        >
          {renderComponent()}
        </div>
      </div>
    </div>
    // </Suspense>
  );
}

export default SubAccountMyAccount;
