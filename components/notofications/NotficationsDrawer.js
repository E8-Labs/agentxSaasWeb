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
import InfiniteScroll from "react-infinite-scroll-component";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../dashboard/leads/AgentSelectSnackMessage";
import { getSupportUrlFor } from "@/utilities/UserUtility";

function NotficationsDrawer({ close }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const [snackMessage, setSnackMessage] = useState("");

  //variables to show the lead details modal
  const [selectedLeadsDetails, setselectedLeadsDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [hasMore, setHasMore] = useState(true);

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
      let offset = notifications.length;

      //code for get and set data from local
      const not = localStorage.getItem("userNotifications");
      if (not) {
        const D = JSON.parse(not);
        console.log("Notification Local list is", D);
        setNotifications(D);
      }

      //code to stop if no more notifications
      // const moreNot = localStorage.getItem("hasMoreNotification");
      // if (moreNot) {
      //   const M = JSON.parse(moreNot);
      //   if (M === "false") {
      //     return
      //   }
      // }

      const user = localStorage.getItem("User");

      if (user) {
        let u = JSON.parse(user);
        console.log("user data from local is", u.user);

        // if (hasMore === true) {
        if (!notifications.length > 0 && !not) {
          setLoading(true);
        }

        const ApiPath = `${Apis.getNotifications}?offset=${offset}`;
        console.log("Api path is", ApiPath);

        const response = await axios.get(ApiPath, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setLoading(false);
          if (response.data.status === true) {
            console.log("notifications list is", response.data.data);
            // setNotifications(response.data.data.notifications);
            localStorage.setItem(
              "userNotifications",
              JSON.stringify([
                ...notifications,
                ...response.data.data.notifications,
              ])
            );
            setNotifications([
              ...notifications,
              ...response.data.data.notifications,
            ]);
            u.user.unread = 0;
            localStorage.setItem("User", JSON.stringify(u));
            setUnread(0);
            // setUnread(response.data.data.unread)
            console.log(
              "Length of notifications is",
              response.data.data.notifications.length
            );
            if (response.data.data.notifications.length < 40) {
              localStorage.setItem(
                "hasMoreNotification",
                JSON.stringify("false")
              );
              setHasMore(false);
            }
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

  useEffect(() => {
    console.log("Has more status is", hasMore);
  }, [hasMore]);

  //function to get support
  const getSupport = () => {
    let userData = localStorage.getItem("User");
    if (userData) {
      const D = JSON.parse(userData);
      let url = getSupportUrlFor(D.user);
      window.open(url, "_blank");
    }
  };

  function giveFeedback() {
    router.push("/dashboard/myAccount?tab=5");
  }

  const getNotificationImage = (item) => {
    if (item.type === NotificationTypes.RedeemedAgentXCode) {
      return (
        <Image
          src={"/svgIcons/minsNotIcon.svg"}
          height={32}
          width={32}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.RedeemedAgentXCodeMine) {
      return (
        <Image
          src={"/svgIcons/minsNotIcon.svg"}
          height={32}
          width={32}
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
          className="flex rounded-full justify-center items-center bg-black text-white text-md flex-shrink-0"
          style={{ height: 37, width: 37, textTransform: "capitalize" }}
        >
          {item.title[0]}
        </div>
      );
    } else if (
      item.type === NotificationTypes.Hotlead ||
      item.type === NotificationTypes.FirstLeadUpload ||
      item.type === NotificationTypes.SocialProof
    ) {
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
          className="flex rounded-full justify-center items-center bg-black text-white text-md flex-shrink-0"
          style={{ height: 37, width: 37, textTransform: "capitalize" }}
        >
          {item.title[0]}
        </div>
      );
    } else if (item.type === NotificationTypes.MeetingBooked) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md flex-shrink-0"
          style={{ height: 37, width: 37, textTransform: "capitalize" }}
        >
          {item.title[0]}
        </div>
      );
    } else if (item.type === NotificationTypes.PaymentFailed) {
      return (
        <Image
          src={"/svgIcons/urgentNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.CallsMadeByAgent) {
      return (
        <Image src={"/svgIcons/aiNotIcon.svg"} height={40} width={40} alt="*" />
      );
    } else if (item.type === NotificationTypes.LeadCalledBack) {
      return (
        <div
          className="flex rounded-full justify-center items-center bg-black text-white text-md flex-shrink-0"
          style={{ height: 37, width: 37, textTransform: "capitalize" }}
        >
          {item.title[0]}
        </div>
      );
    } else if (item.type === NotificationTypes.Trial30MinTicking) {
      return (
        <Image
          src={"/svgIcons/Trial30MinTickingNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (
      item.type === NotificationTypes.X3MoreLikeyToWin ||
      item.type === NotificationTypes.ThousandCalls ||
      item.type === NotificationTypes.CompetitiveEdge
    ) {
      return (
        <Image
          src={"/svgIcons/3xMoreLikeyToWinNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (
      item.type === NotificationTypes.NeedHand ||
      item.type === NotificationTypes.NeedHelpDontMissOut ||
      item.type === NotificationTypes.TrainingReminder ||
      item.type === NotificationTypes.Inactive5Days
    ) {
      return (
        <Image
          src={"/svgIcons/NeedHandNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.TrialReminder) {
      return (
        <Image
          src={"/svgIcons/TrialReminderNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (
      item.type === NotificationTypes.LastChanceToAct ||
      item.type === NotificationTypes.FOMOAlert
    ) {
      return (
        <Image
          src={"/svgIcons/LastChanceToActNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.LastDayToMakeItCount) {
      return (
        <Image
          src={"/svgIcons/LastDayToMakeItCountNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (
      item.type === NotificationTypes.TrialTime2MinLeft ||
      item.type === NotificationTypes.TwoThousandCalls
    ) {
      return (
        <Image
          src={"/svgIcons/TrialTime2MinLeftNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.PlanRenewed) {
      return (
        <Image
          src={"/svgIcons/PlanRenewedNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.FirstAppointment) {
      return (
        <Image
          src={"/svgIcons/FirstAppointmentNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.ThreeAppointments) {
      return (
        <Image
          src={"/svgIcons/SevenAppointmentsNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.SevenAppointments) {
      return (
        <Image
          src={"/svgIcons/SevenAppointmentsNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.Day14FeedbackRequest) {
      return (
        <Image
          src={"/svgIcons/Day14FeedbackRequestNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (
      item.type === NotificationTypes.PlanUpgradeSuggestionFor30MinPlan
    ) {
      return (
        <Image
          src={"/svgIcons/PlanUpgradeSuggestionFor30MinPlanNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.TestAINotification) {
      return (
        <Image
          src={"/svgIcons/TestAINotificationNotIcon.svg"}
          height={22}
          width={22}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.Exclusivity) {
      return (
        <Image
          src={"/svgIcons/TeritaryTraining.svg"}
          height={22}
          width={18}
          alt="*"
        />
      );
    } else if (item.type === NotificationTypes.TerritoryUpdate) {
      return (
        <Image src={"/svgIcons/2Listings.svg"} height={22} width={22} alt="*" />
      );
    }

    //2Listings
  };

  const getNotificationBtn = (item) => {
    if (
      item.type === NotificationTypes.Hotlead ||
      item.type === NotificationTypes.MeetingBooked
    ) {
      return (
        <button
          onClick={() => {
            console.log("Check 1 clear!!");
            console.log("Lead details to show are", item);
            // setShowNotificationDrawer(false)
            if (
              item.pipelineId === null ||
              item.id === undefined ||
              !item.lead
            ) {
              setSnackMessage("Lead has been deleted");
            } else {
              setselectedLeadsDetails(item);
              setShowDetailsModal(true);
            }
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            View Now
          </div>
        </button>
      );
    } else if (item.type === NotificationTypes.PaymentFailed) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            // localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount?tab=2");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Resolve Now
          </div>
        </button>
      );
    } else if (
      NotificationTypes.Trial30MinTicking === item.type ||
      NotificationTypes.TrialReminder === item.type ||
      NotificationTypes.LastDayToMakeItCount === item.type ||
      NotificationTypes.FirstLeadUpload === item.type ||
      NotificationTypes.TwoThousandCalls === item.type
    ) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            router.push("/dashboard/leads");
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Start Calling
          </div>
        </button>
      );
    } else if (
      NotificationTypes.X3MoreLikeyToWin === item.type ||
      NotificationTypes.ThousandCalls === item.type
    ) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            router.push("/dashboard/leads");
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Upload Leads
          </div>
        </button>
      );
    } else if (NotificationTypes.NeedHand === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            getSupport();
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Support
          </div>
        </button>
      );
    } else if (NotificationTypes.NeedHelpDontMissOut === item.type) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            // localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount?tab=2");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Live Support
          </div>
        </button>
      );
    } else if (
      NotificationTypes.LastChanceToAct === item.type ||
      NotificationTypes.FirstAppointment === item.type ||
      NotificationTypes.ThreeAppointments === item.type ||
      NotificationTypes.SevenAppointments === item.type ||
      NotificationTypes.Day14FeedbackRequest === item.type
    ) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            item.type == NotificationTypes.Day14FeedbackRequest
              ? giveFeedback()
              : getSupport();
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Live Help
          </div>
        </button>
      );
    } else if (
      item.type === NotificationTypes.PlanUpgradeSuggestionFor30MinPlan
    ) {
      return (
        <button
          className="outline-none"
          onClick={(e) => {
            e.preventDefault();
            router.push("/dashboard/myAccount?tab=2");
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Get Live Help
          </div>
        </button>
      );
    } else if (
      NotificationTypes.TrialTime2MinLeft === item.type ||
      NotificationTypes.PlanRenewed === item.type
    ) {
      return (
        <button
          className="outline-none"
          onClick={() => {
            const openBilling = true;
            // localStorage.setItem("openBilling", JSON.stringify(openBilling));
            router.push("/dashboard/myAccount?tab=2");
            setShowNotificationDrawer(false);
          }}
        >
          <div className="flex flex-row items-center justify-center p-2 border border-[#00000020] rounded-md text-[13px] font-medium ">
            Manage Plan
          </div>
        </button>
      );
    } else {
      return <div className="w-3/12"></div>;
    }
  };

  const renderItem = (item, index) => {
    return (
      <div
        key={index}
        className="w-full flex flex-row justify-between items-start mt-10"
      >
        <div className="flex flex-row items-start gap-6 w-[80%]">
          {getNotificationImage(item)}

          <div className={`w-full`}>
            <div className="flex flex-col gap-1 items-start">
              <div className="flex flex-col w-full gap-1">
                <div
                  className="flex flex-wrap items-center"
                  style={{ fontSize: 16, fontWeight: "600" }}
                >
                  {item.title}
                  {item.type === NotificationTypes.NoCallsIn3Days && (
                    <button
                      style={{
                        fontSize: 15,
                        fontWeight: "500",
                        color: "#7902DF",
                        textDecorationLine: "underline",
                        marginLeft: "8px", // Add some spacing between the title and button
                      }}
                      onClick={() => {
                        getSupport();
                      }}
                    >
                      Need help?
                    </button>
                  )}
                </div>
              </div>

              {item.body && (
                <div
                  className=" flex flex col gap-2"
                  style={{ fontSize: 15, fontWeight: "500" }}
                >
                  {item.body}
                </div>
              )}

              <div
                style={{ fontSize: 13, fontWeight: "500", color: "#00000060" }}
              >
                {GetFormattedDateString(item?.createdAt, true)}
              </div>
            </div>
          </div>
        </div>
        <div className="w-[20%]">{getNotificationBtn(item)}</div>

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
      {snackMessage && (
        <AgentSelectSnackMessage
          message={snackMessage}
          type={SnackbarTypes.Warning}
          isVisible={snackMessage}
          hide={() => {
            setSnackMessage("");
          }}
        />
      )}

      <button
        onClick={() => {
          setShowNotificationDrawer(true);
          getNotifications();
        }}
      >
        <div className="flex flex-row ">
          <Image
            src="/svgIcons/notificationIcon.svg"
            height={22}
            width={22}
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
            width: "35%", // Drawer width
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
                  height={22}
                  width={22}
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

          <div
            className="flex flex-col px-6 overflow-y-auto"
            style={{ height: "90vh", paddingBottom: 100 }}
            id="scrollableDiv1"
          >
            {loading ? (
              <div className="flex w-full items-center flex-col mt-10">
                <CircularProgress size={35} />
              </div>
            ) : !notifications.length > 0 ? (
              <div
                className="h-screen flex flex-col items-center justify-center w-full" //style={{ fontSize: 20, fontWeight: "700", padding: 20 }}
              >
                <Image
                  src={"/svgIcons/notNotificationImg.svg"}
                  height={297}
                  width={364}
                  alt="*"
                />
                <div
                  className="-mt-8"
                  style={{
                    fontSize: 16.8,
                    fontWeight: "700",
                  }}
                >
                  Nothing to see here... yet!
                </div>
                <div
                  className="mt-2"
                  style={{
                    fontSize: 15,
                    fontWeight: "500",
                  }}
                >
                  {`You’ll find all your notifications here`}
                </div>
              </div>
            ) : (
              <div style={{ scrollbarWidth: "none" }}>
                <InfiniteScroll
                  className="lg:flex hidden flex-col w-full h-[100%]"
                  endMessage={
                    <p
                      style={{
                        textAlign: "center",
                        paddingTop: "10px",
                        fontWeight: "400",
                        fontFamily: "inter",
                        fontSize: 16,
                        color: "#00000060",
                      }}
                    >
                      {`You're all caught up`}
                    </p>
                  }
                  scrollableTarget="scrollableDiv1"
                  dataLength={notifications.length}
                  next={() => {
                    console.log("Loading more data");
                    getNotifications();
                  }} // Fetch more when scrolled
                  hasMore={hasMore} // Check if there's more data
                  loader={
                    <div className="w-full flex flex-row justify-center mt-8">
                      <CircularProgress size={35} />
                    </div>
                  }
                  style={{ overflow: "unset" }}
                >
                  {notifications.map((item, index) => {
                    return (
                      <div key={index} className="w-full h-[100%]">
                        {renderItem(item, index)}
                      </div>
                    );
                  })}
                </InfiniteScroll>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default NotficationsDrawer;

export const notLeadDetails = () => {
  return <div>Hamza</div>;
};
