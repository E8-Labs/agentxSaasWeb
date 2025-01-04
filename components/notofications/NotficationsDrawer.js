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

function NotficationsDrawer({ close }) {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const [showLeadsDetailPopup, setShowLeadsDetailPopup] = useState(false);


  //variables to show the lead details modal
  const [selectedLeadsDetails, setselectedLeadsDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    getUserData();
  }, []);
  const getUserData = async () => {
    // let data = localStorage.getItem("User")
    // if(data){
    //     let u = JSON.parse(data)
    //     console.log('object', object)
    // }
    let data = await getProfileDetails();
    console.log("user unread messages are ", data.data.data.unread);
    setUnread(data.data.data.unread);
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
  //   {
  //     id: 1,
  //     title: "Noah is a hotlead",
  //     type: "Hotlead",
  //     fromUserId: "None",
  //     userId: 10,
  //     leadId: 40341,
  //     agentId: "None",
  //     codeRedeemed: "None",
  //     isSeen: true,
  //     createdAt: "2024-12-31T15:50:26.000Z",
  //     updatedAt: "2025-01-03T14:15:55.000Z",
  //     lead: "None",
  //     agent: "None",
  //     fromUser: "None"
  //   },
  //   {
  //     id: 121,
  //     title: "Salman booked a meeting 🗓️",
  //     type: "MeetingBooked",
  //     fromUserId: null,
  //     userId: 10,
  //     leadId: 12,
  //     agentId: 202,
  //     codeRedeemed: null,
  //     isSeen: true,
  //     createdAt: "2025-01-03T09:54:15.000Z",
  //     updatedAt: "2025-01-03T14:15:55.000Z",
  //     lead: {
  //       id: 12,
  //       firstName: "Salman",
  //       lastName: "Majid",
  //       address: "123 Elm St",
  //       email: "salman@gmail.com",
  //       phone: "923058191078",
  //       status: "active",
  //       sheetId: 2,
  //       extraColumns: "{\"roof_type\":\"Asphalt Shingle\",\"monthly_energy_bill\":2500,\"notes\":null}",
  //       columnMappings: "",
  //       userId: 10,
  //       stage: null,
  //       createdAt: "2024-11-24T20:50:12.000Z",
  //       updatedAt: "2024-11-24T20:50:12.000Z"
  //     },
  //     agent: {
  //       id: 202,
  //       name: "test",
  //       agentRole: "test",
  //       mainAgentId: 203,
  //       userId: 10,
  //       agentType: "outbound",
  //       agentObjectiveId: 3,
  //       agentObjective: "Community update",
  //       agentObjectiveDescription: "Provide local homeowners with relevant updates on a property like just listed, just sold, in escrow or something else. ",
  //       status: "Just sold",
  //       address: "300 14th Street, San Diego, CA, USA",
  //       prompt: null,
  //       modelId: "1735842271879x907888399150540200",
  //       phoneNumber: "+18054579527",
  //       phoneSid: "",
  //       phoneStatus: "active",
  //       phoneNumberPrice: "2",
  //       phonePurchasedAt: null,
  //       callbackNumber: "+18054579527",
  //       liveTransferNumber: "",
  //       liveTransfer: false,
  //       liveTransferActionId: null,
  //       voiceId: "5T8AzGjpnC5cQCfJofdO",
  //       full_profile_image: "",
  //       thumb_profile_image: "",
  //       createdAt: "2025-01-02T18:24:33.000Z",
  //       updatedAt: "2025-01-02T18:54:05.000Z"
  //     },
  //     fromUser: null
  //   }

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
    }
  };

  const renderItem = (item, index) => {
    return (
      <div
        key={index}
        className="w-full flex flex-row justify-between items-cneter mt-10"
      >
        {getNotificationImage(item)}

        <div className={` ${item.type === NotificationTypes.NoCallsIn3Days ? "w-10/12" : "w-7/12"}`}>
          <div className="flex flex-col gap-1 items-start">
            <div className="flex flex-row items-center gap-2">
              <div className=" flex" style={{ fontSize: 15, fontWeight: "500" }}>{item.title}</div>
              {
                item.type === NotificationTypes.NoCallsIn3Days && (
                  <button>
                    <div style={{ fontSize: 15, fontWeight: "500", color: "#7902DF", textDecorationLine: 'underline' }}>
                      Need help?
                    </div>
                  </button>
                )

              }

            </div>
            <div style={{ fontSize: 13, fontWeight: "500", color: "#00000060" }}>
              {GetFormattedDateString(item?.createdAt, true)}
            </div>
          </div>
        </div>
        {
          item.type === NotificationTypes.Hotlead || item.type === NotificationTypes.MeetingBooked ? (
            <button
              onClick={() => {
                console.log("Check 1 clear!!")
                console.log("Lead details to show are", item);
                setselectedLeadsDetails(item);
                setShowDetailsModal(true);
                // setShowLeadsDetailPopup(true)
              }}
            >
              <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
                View Now
              </div>
            </button>
          ) : (
            item.type === NotificationTypes.PaymentFailed ? (

              <button>
                <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
                  Resolve Now
                </div>
              </button>
            ) : (
              <div className="w-3/12"></div>
            ))
        }

        {showDetailsModal && (
          <LeadDetails
            selectedLead={selectedLeadsDetails?.lead?.id}
            // pipelineId={selectedLeadsDetails?.PipelineStages?.pipelineId}
            showDetailsModal={showDetailsModal}
            setShowDetailsModal={setShowDetailsModal}
            hideDelete={true}
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
        <img
          src="/otherAssets/notificationIcon.png"
          style={{ height: 24, width: 24 }}
          alt="notificationIcon"
        />
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
                    className="flex bg-red rounded-full w-[18px] py-[1px] flex-row items-center justify-center text-red font-md text-white"
                    style={{
                      fontSize: 13,
                      marginTop: -13,
                      alignSelf: "flex-start",
                      marginLeft: -15,
                    }}
                  >
                    {unread}
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