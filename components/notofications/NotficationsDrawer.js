"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Apis from "../apis/Apis";
import { CircularProgress, Drawer, Modal } from "@mui/material";
import { NotificationTypes } from "@/constants/NotificationTypes";
import moment from "moment";
import getProfileDetails from "../apis/GetProfile";
import { GetFormattedDateString } from "@/utilities/utility";
import LeadDetails from "../dashboard/leads/extras/LeadDetails";
import { useRouter } from "next/navigation";

function NotficationsDrawer({ close }) {

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);



  //variables to show the lead details modal
  const [selectedLeadsDetails, setselectedLeadsDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);
  const getUserData = async () => {
    // let data = localStorage.getItem("User")
    // if(data){
    // let u = JSON.parse(data)
    // console.log('object', object)
    // }
    let data = await getProfileDetails();
    console.log("user unread messages are ", data.data.data.unread);
    setUnread(data.data.data.unread);
    // setUnread(12);
  };

  const getNotifications = async () => {
    try {
      const user = localStorage.getItem("User");

      if (user) {
        let u = JSON.parse(user);
        console.log("user data from local is", u.user);
        setLoading(true);
        const response = await axios.get(Apis.getNotifications, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setLoading(false);
          if (response.data.status === true) {
            console.log("notifications list is", response.data.data);
            setNotifications(response.data.data.notifications);
            u.user.unread = 0;
            localStorage.setItem("User", JSON.stringify(u));
            setUnread(0);
            // setUnread(response.data.data.unread)
          } else {
            console.log("notification api message is", response.data.message);
          }
        }
      }
    } catch (e) {
      setLoading(false);
      console.log("error in get notifications is ", e);
    }
  };
  // const notifications = [
  // {
  // id: 1,
  // title: "Noah is a hotlead",
  // type: "Hotlead",
  // fromUserId: "None",
  // userId: 10,
  // leadId: 40341,
  // agentId: "None",
  // codeRedeemed: "None",
  // isSeen: true,
  // createdAt: "2024-12-31T15:50:26.000Z",
  // updatedAt: "2025-01-03T14:15:55.000Z",
  // lead: "None",
  // agent: "None",
  // fromUser: "None"
  // },
  // {
  // id: 121,
  // title: "Salman booked a meeting 🗓️",
  // type: "MeetingBooked",
  // fromUserId: null,
  // userId: 10,
  // leadId: 12,
  // agentId: 202,
  // codeRedeemed: null,
  // isSeen: true,
  // createdAt: "2025-01-03T09:54:15.000Z",
  // updatedAt: "2025-01-03T14:15:55.000Z",
  // lead: {
  // id: 12,
  // firstName: "Salman",
  // lastName: "Majid",
  // address: "123 Elm St",
  // email: "salman@gmail.com",
  // phone: "923058191078",
  // status: "active",
  // sheetId: 2,
  // extraColumns: "{\"roof_type\":\"Asphalt Shingle\",\"monthly_energy_bill\":2500,\"notes\":null}",
  // columnMappings: "",
  // userId: 10,
  // stage: null,
  // createdAt: "2024-11-24T20:50:12.000Z",
  // updatedAt: "2024-11-24T20:50:12.000Z"
  // },
  // agent: {
  // id: 202,
  // name: "test",
  // agentRole: "test",
  // mainAgentId: 203,
  // userId: 10,
  // agentType: "outbound",
  // agentObjectiveId: 3,
  // agentObjective: "Community update",
  // agentObjectiveDescription: "Provide local homeowners with relevant updates on a property like just listed, just sold, in escrow or something else. ",
  // status: "Just sold",
  // address: "300 14th Street, San Diego, CA, USA",
  // prompt: null,
  // modelId: "1735842271879x907888399150540200",
  // phoneNumber: "+18054579527",
  // phoneSid: "",
  // phoneStatus: "active",
  // phoneNumberPrice: "2",
  // phonePurchasedAt: null,
  // callbackNumber: "+18054579527",
  // liveTransferNumber: "",
  // liveTransfer: false,
  // liveTransferActionId: null,
  // voiceId: "5T8AzGjpnC5cQCfJofdO",
  // full_profile_image: "",
  // thumb_profile_image: "",
  // createdAt: "2025-01-02T18:24:33.000Z",
  // updatedAt: "2025-01-02T18:54:05.000Z"
  // },
  // fromUser: null
  // }

  // ]

  const getNotificationImage = (item) => {
    if (item.type === NotificationTypes.RedeemedAgentXCode) {
      return (
        <Image
          src={"/svgIcons/minsNotIcon.svg"}
          height={37}
          width={37}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.NoCallsIn3Days) {
      return (
        <Image
          src={"/svgIcons/callsNotIcon.svg"}
          height={37}
          width={37}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.InviteAccepted) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md"
          style={{ height: 37, width: 37, textTransform: "capitalize" }}
        >
          {item.title[0]}
        </div>
      );
    } else if (item.type === NotificationTypes.Hotlead) {
      return (
        <Image
          src={"/svgIcons/hotLeadNotIcon.svg"}
          height={37}
          width={37}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.TotalHotlead) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md"
          style={{ height: 37, width: 37, textTransform: "capitalize" }}
        >
          {item.title[0]}
        </div>
      );
    } else if (item.type === NotificationTypes.MeetingBooked) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md"
          style={{ height: 37, width: 37, textTransform: "capitalize" }}
        >
          {item.title[0]}
        </div>
      );
    } else if (item.type === NotificationTypes.PaymentFailed) {
      return (
        <Image
          src={"/svgIcons/urgentNotIcon.svg"}
          height={37}
          width={37}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.CallsMadeByAgent) {
      return (
        <Image src={"/svgIcons/aiNotIcon.svg"} height={37} width={37} alt="*" />
      );
    } else if (item.type === NotificationTypes.LeadCalledBack) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md"
          style={{ height: 37, width: 37, textTransform: "capitalize" }}
        >
          {item.title[0]}
        </div>
      );
    } else if (item.type === NotificationTypes.Trial30MinTicking) {
      return (
        <Image src={"/svgIcons/Trial30MinTickingNotIcon.svg"} height={37} width={37} alt="*" />
      );
    } else if (item.type === NotificationTypes.X3MoreLikeyToWin) {
      return (
        <Image src={"/svgIcons/3xMoreLikeyToWinNotIcon.svg"} height={37} width={37} alt="*" />
      );
    } else if (item.type === NotificationTypes.NeedHand || item.type === NotificationTypes.NeedHelpDontMissOut) {
      return (
        <Image src={"/svgIcons/NeedHandNotIcon.svg"} height={37} width={37} alt="*" />
      );
    } else if (item.type === NotificationTypes.TrialReminder) {
      return (
        <Image src={"/svgIcons/TrialReminderNotIcon.svg"} height={37} width={37} alt="*" />
      );
    } else if (item.type === NotificationTypes.LastChanceToAct) {
      return (
        <Image src={"/svgIcons/LastChanceToActNotIcon.svg"} height={37} width={37} alt="*" />
      );
    } else if (item.type === NotificationTypes.LastDayToMakeItCount) {
      return (
        <Image src={"/svgIcons/LastDayToMakeItCountNotIcon.svg"} height={37} width={37} alt="*" />
      );
    } else if (item.type === NotificationTypes.TrialTime2MinLeft) {
      return (
        <Image src={"/svgIcons/TrialTime2MinLeftNotIcon.svg"} height={37} width={37} alt="*" />
      );
    } else if (item.type === NotificationTypes.PlanRenewed) {
      return (
        <Image src={"/svgIcons/PlanRenewedNotIcon.svg"} height={37} width={37} alt="*" />
      );
    }
  };

  const getNotificationBtn = (item) => {
    if (item.type === NotificationTypes.Hotlead || item.type === NotificationTypes.MeetingBooked) {
      return (
        <button
          onClick={() => {
            console.log("Check 1 clear!!")
            console.log("Lead details to show are", item);
            // setShowNotificationDrawer(false)
            setselectedLeadsDetails(item);
            setShowDetailsModal(true);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            View Now
          </div>
        </button>
      )
    } else if (item.type === NotificationTypes.PaymentFailed) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Resolve Now
          </div>
        </button>
      )
    } else if (NotificationTypes.Trial30MinTicking === item.type || NotificationTypes.TrialReminder === item.type ||
      NotificationTypes.LastDayToMakeItCount === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Start Calling
          </div>
        </button>
      )
    } else if (NotificationTypes.X3MoreLikeyToWin === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Upload Leads
          </div>
        </button>
      )
    } else if (NotificationTypes.NeedHand === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Support
          </div>
        </button>
      )
    } else if (NotificationTypes.NeedHelpDontMissOut === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Give Live Support
          </div>
        </button>
      )
    } else if (NotificationTypes.LastChanceToAct === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Give Live Help
          </div>
        </button>
      )
    } else if (NotificationTypes.TrialTime2MinLeft === item.type || NotificationTypes.PlanRenewed === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Manage Plan
          </div>
        </button>
      )
    }

    else {
      return (
        <div className="w-3/12"></div>
      )
    }

  }

  const renderItem = (item, index) => {
    return (
      <div
        key={index}
        className="w-full flex flex-row justify-between items-start mt-10"
      >
        {getNotificationImage(item)}

        <div className={` ${item.type === NotificationTypes.NoCallsIn3Days ? "w-10/12" : "w-7/12"}`}>
          <div className="flex flex-col gap-1 items-start">
            <div className="flex flex-row items-center gap-2">

              <div className=" flex" style={{ fontSize: 16, fontWeight: "600" }}>
                {item.title}
              </div>
              {
                item.type === NotificationTypes.NoCallsIn3Days && (
                  <button onClick={() => {
                    window.open(
                      "https://www.youtube.com/watch?v=Un9BDFqlB94",
                      "_blank"
                    )
                  }}>
                    <div style={{ fontSize: 15, fontWeight: "500", color: "#7902DF", textDecorationLine: 'underline' }}>
                      Need help?
                    </div>
                  </button>
                )

              }

            </div>
            {
              item.body && (
                <div className=" flex flex col gap-2" style={{ fontSize: 15, fontWeight: "500" }}>
                  {item.body}
                </div>
              )
            }

            <div style={{ fontSize: 13, fontWeight: "500", color: "#00000060" }}>
              {GetFormattedDateString(item?.createdAt, true)}
            </div>
          </div>
        </div>

        {
          getNotificationBtn(item)
        }

        {showDetailsModal && (
          <LeadDetails
            selectedLead={selectedLeadsDetails?.lead?.id}
            pipelineId={selectedLeadsDetails?.pipelineId}
            showDetailsModal={showDetailsModal}
            setShowDetailsModal={setShowDetailsModal}
            hideDelete={true}
            noBackDrop={true}
          />
        )}

      </div>
    );
  };

  return (
    <div className="w-full">
      <button
        onClick={() => {
          setShowNotificationDrawer(true);
          getNotifications();
        }}
      >
        <div className="flex flex-row ">
          <Image
            src="/svgIcons/notificationIcon.svg"
            height={24}
            width={24}
            alt="Notification Icon"
          />
          {unread > 0 && (
            <div
              className="flex bg-red rounded-full w-6 h-6 flex-row items-center justify-center text-red font-md text-white flex-shrink-0"
              style={{
                fontSize: 13,
                marginTop: -13,
                alignSelf: "flex-start",
                marginLeft: -15,
              }}
            >
              {unread < 100 ? unread : "99+"}
            </div>
          )}
        </div>
      </button>

      <Drawer
        anchor="right"
        sx={{
          "& .MuiDrawer-paper": {
            width: "30%", // Drawer width
            boxSizing: "border-box", // Ensure padding doesn't shrink content
          },
        }}
        open={showNotificationDrawer}
        onClose={() => {
          setShowNotificationDrawer(false);
        }}

        BackdropProps={{
          // timeout: 1000,
          sx: {
            backgroundColor: "#00000020",
          },
        }}

      >
        <div className="w-full h-full flex flex-col">
          <div className="flex flex-row items-center justify-between p-6">
            <div className="flex flex-row gap-2 items-center">
              <div className="flex flex-row ">
                <Image
                  src="/svgIcons/notificationIcon.svg"
                  height={24}
                  width={24}
                  alt="Notification Icon"
                />
                {unread > 0 && (
                  <div
                    className="flex bg-red-500 rounded-full w-6 h-6 items-center justify-center text-white font-medium"
                    style={{
                      fontSize: "12px", // Ensure font-size is smaller to fit within the circle
                      marginTop: "-13px", // Adjust position as needed
                      alignSelf: "flex-start",
                      marginLeft: "-15px",
                      lineHeight: "1", // Prevent extra spacing inside the circle
                    }}
                  >
                    {unread < 100 ? unread : "99+"}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 22, fontWeight: "600" }}>
                Notifications
              </div>
            </div>
            <button
              onClick={() => {
                setShowNotificationDrawer(false);
              }}
            >
              <img
                src="/svgIcons/cross.svg"
                style={{ height: 24, width: 24 }}
                alt="Close"
              />
            </button>
          </div>


          <div
            style={{ height: 1, width: "100%", background: "#00000010" }}
          ></div>

          <div className="flex flex-col px-6 overflow-y-auto" style={{ height: '90vh', paddingBottom: 100 }}>
            {loading ? (
              <div className="flex w-full items-center flex-col mt-10">
                <CircularProgress size={35} />
              </div>
            ) : !notifications.length > 0 ? (
              <div style={{ fontSize: 20, fontWeight: "700", padding: 20 }}>
                No Notification
              </div>
            ) : (
              notifications.map((item, index) => renderItem(item, index))
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default NotficationsDrawer;








export const notLeadDetails = () => {
  return (
    <div>
      Hamza
    </div>
  )
}

