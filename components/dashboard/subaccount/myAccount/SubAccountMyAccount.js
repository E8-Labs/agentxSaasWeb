"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import BasicInfo from "@/components/myAccount/BasicInfo";
import MyPhoneNumber from "@/components/myAccount/MyPhoneNumber";
import { Button, CircularProgress, Drawer } from "@mui/material";
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
import TwilioTrustHub from "@/components/myAccount/TwilioTrustHub";
import { CancellationAndRefundUrl, termsAndConditionUrl } from "@/constants/Constants";
import SubAccountPlansAndPayments from "./SubAccountPlansAndPayments";

function SubAccountMyAccount() {
  let searchParams = useSearchParams();
  const router = useRouter();

  const [tabSelected, setTabSelected] = useState(5);
  const [initialLoader, setInitialLoader] = useState(true);
  const [navBar, setNavBar] = useState([]);

  const manuBar = [
    {
      id: 1,
      heading: "Basic Information",
      subHeading: "Manage personal information ",
      icon: "/otherAssets/profileCircle.png",
    },
    {
      id: 2,
      heading: "Plans & Payment",
      subHeading: "Manage your plans and payment method ",
      icon: "/otherAssets/walletIcon.png",
    },
    {
      id: 3,
      heading: "Billing",
      subHeading: "Manage your billing transactions",
      icon: "/otherAssets/walletIcon.png",
    },
    {
      id: 4,
      heading: "Bar Services",
      subHeading: "Our version of the genius bar",
      icon: "/assets/X.svg",
    },
    {
      id: 5,
      heading: "My Phone Numbers",
      subHeading: "All agent phone numbers",
      icon: "/assets/unSelectedCallIcon.png",
    },
    {
      id: 6,
      heading: "Invite Agents",
      subHeading: "Get 60 credits ",
      icon: "/otherAssets/inviteAgentIcon.png",
    },
    // {
    //   id: 6,
    //   heading: "Support",
    //   subHeading: "Get in touch with our team and get help",
    //   icon: "/otherAssets/headPhoneIcon.png",
    // },
    // {
    //   id: 7,
    //   heading: "Send Feedback",
    //   subHeading: "Report bugs, new features and more",
    //   icon: "/otherAssets/feedbackIcon.png",
    // },
    {
      id: 7,
      heading: "Twilio Trust Hub",
      subHeading: "Caller ID & compliance for trusted calls",
      icon: "/svgIcons/twilioHub.svg",
    },
    {
      id: 8,
      heading: "Terms & Condition",
      subHeading: "",
      icon: "/svgIcons/info.svg",
    },
    {
      id: 9,
      heading: "Privacy Policy",
      subHeading: "",
      icon: "/svgIcons/info.svg",
    },
    {
      id: 10,
      heading: "Cancellation & Refund",
      subHeading: "",
      icon: "/svgIcons/info.svg",
    },
  ];

  const manuBar2 = [
    {
      id: 1,
      heading: "Basic Information",
      subHeading: "Manage personal information ",
      icon: "/otherAssets/profileCircle.png",
    },
    {
      id: 2,
      heading: "Plans & Payment",
      subHeading: "Manage your plans and payment method ",
      icon: "/otherAssets/walletIcon.png",
    },
    {
      id: 3,
      heading: "Billing",
      subHeading: "Manage your billing transactions",
      icon: "/otherAssets/walletIcon.png",
    },
    {
      id: 4,
      heading: "Bar Services",
      subHeading: "Our version of the genius bar",
      icon: "/assets/X.svg",
    },
    {
      id: 5,
      heading: "My Phone Numbers",
      subHeading: "All agent phone numbers",
      icon: "/assets/unSelectedCallIcon.png",
    },
    {
      id: 6,
      heading: "Invite Agents",
      subHeading: "Get 60 credits ",
      icon: "/otherAssets/inviteAgentIcon.png",
    },
    {
      id: 7,
      heading: "Terms & Condition",
      subHeading: "",
      icon: "/svgIcons/info.svg",
    },
    {
      id: 8,
      heading: "Privacy Policy",
      subHeading: "",
      icon: "/svgIcons/info.svg",
    },
    {
      id: 9,
      heading: "Cancellation & Refund",
      subHeading: "",
      icon: "/svgIcons/info.svg",
    },
  ];

  const [selectedManu, setSelectedManu] = useState(manuBar[tabSelected]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [selectedUserData, setSelectedUSerData] = useState(null);

  //load the local storage data
  useEffect(() => {
    const localData = localStorage.getItem("User");
    if (localData) {
      const Data = JSON.parse(localData);
      const D = Data.user
      console.log(`user role is ${D.userRole} and allow twilio status is ${D.allowSubaccountTwilio}`)
      if (D.userRole === "AgencySubAccount" && D.allowSubaccountTwilio === false) {
        setNavBar(manuBar2);
      } else {
        setNavBar(manuBar);
      }
      setInitialLoader(false);
    } else {
      setInitialLoader(false)
      console.log("couldNotFetch local data")
    }
    // console.log("Test check fail")
  }, []);

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
        return <SubAccountPlansAndPayments
          // selectedUser={selectedUserData}
        />;
      case 3:
        return <SubAccountBilling
          selectedUser={selectedUserData}
        />;
      case 4:
        return <SubAccountBarServices
          selectedUser={selectedUserData} />;
      case 5:

        return <SubAccountMyPhoneNumber />;
      // <SubAccountBarServices
      //   selectedUser={selectedUserData} />;
      case 6:
        return <InviteAgentX selectedUser={selectedUserData} isSubAccount={true} />;
      // case 6:
      //   return <SubAccountInviteAgentX />;
      case 7:
        return <TwilioTrustHub />;
      default:
        return <div>Please select an option.</div>;
    }
  };

  const handleTabSelect = (item, index) => {

    if (item.heading === "Terms & Condition") {
      window.open(
        termsAndConditionUrl,
        "_blank"
      );
      return
    } else if (item.heading === "Privacy Policy") {
      window.open(
        "/privacy-policy",
        "_blank"
      );
      return
    } else if (item.heading === "Cancellation & Refund") {
      window.open(
        CancellationAndRefundUrl,
        "_blank"
      );
      return
    }
    console.log("Index is", index);
    setTabSelected(item.id);
    setParamsInSearchBar(item.id);

  }

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
        {
          initialLoader ? (
            <div className="w-4/12 flex flex-row items-center justify-center">
              <CircularProgress />
            </div>
          ) : (
            <div className="w-4/12 items-center flex flex-col pt-4 pr-2 overflow-y-auto h-[90%] pb-22">
              {navBar.map((item, index) => (
                <div key={item.id} className="w-full">
                  <button
                    className="w-full outline-none"
                    style={{
                      textTransform: "none", // Prevents uppercase transformation
                      fontWeight: "normal", // Optional: Adjust the font weight
                    }}
                    onClick={() => {
                      //   setSelectedManu(index + 1);
                      handleTabSelect(item, index)
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
          )
        }

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
