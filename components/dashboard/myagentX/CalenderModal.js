import { AuthToken } from "@/components/agency/plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import timeZones from "@/utilities/Timezones";
import { Box, CircularProgress, FormControl, MenuItem, Modal, Select } from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import { SnackbarTypes } from "../leads/AgentSelectSnackMessage";
import axios from "axios";

function CalendarModal({
  open,
  onClose,
  selectedAgent,
  calendarSelected,
  calenderLoader,
  googleCalenderLoader,
  handleAddCalendar,
  calenderTitle,
  setCalenderTitle,
  calenderApiKey,
  setCalenderApiKey,
  setEventId,
  eventId,
  selectTimeZone,
  setSelectTimeZone,

}) {

  const [showAddNewCalender, setShowAddNewCalender] = useState(false);
  const [showAddNewGoogleCalender, setShowAddNewGoogleCalender] = useState(false);

  const handlGoogleClick = () => {
    const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      process.env.NEXT_PUBLIC_APP_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_REDIRECT_URI;

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile https://www.googleapis.com/auth/calendar",
        access_type: "offline",
        prompt: "consent",
      }).toString();

    const popup = window.open(oauthUrl, "_blank", "width=500,height=600");

    const listener = async (event) => {
      if (event.data?.type === "google-auth-code") {
        window.removeEventListener("message", listener);

        try {
          const res = await fetch(
            `/api/google/exchange-token?code=${event.data.code}`
          );
          const { tokens } = await res.json();

          if (tokens?.access_token) {
            const userInfoRes = await fetch(
              "https://www.googleapis.com/oauth2/v2/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                },
              }
            );

            const userInfo = await userInfoRes.json();

            handleAfterGoogleLogin({
              ...tokens,
              ...userInfo,
            });
          }
        } catch (err) {
          console.error("Google OAuth error:", err);
        }
      }
    };

    window.addEventListener("message", listener);
  };

  const handleAfterGoogleLogin = (data) => {
    try {
      console.log("🆔 Google User LogIn:", data);
      console.log("🔑 Access Token:", data.access_token);
      console.log(
        "🔁 Refresh Token:",
        data.refresh_token || "No refresh token received"
      );
      // return
      const expirySeconds = data.expires_in;
      const expiryDate = new Date(
        Date.now() + expirySeconds * 1000
      ).toISOString();
      console.log("expiry date is", expiryDate);

      const userAuthToken = AuthToken();

      console.log("Auth token is", userAuthToken);

      const googleCalendar = {
        isFromAddGoogleCal: true,
        title: data.given_name,  // "Google Calendar"
        calendarType: "google",
        agentId: selectedAgent?.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: "openid email profile https://www.googleapis.com/auth/calendar",
        expiryDate: expiryDate,
        googleUserId: data.id,
        email: data.email,
        calenderTitle: calenderTitle,
        selectTimeZone: selectTimeZone
      };

      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key} === ${value}`);
      // }

      handleAddCalendar(googleCalendar);
    } catch (error) {
      console.error("Error occured in add calendar of google api is", error);
    }
  };

  const selectCalendarView = () => {
    return (
      <div className="flex flex-col w-full items-center bg-white rounded-lg">
        <button className="flex self-end"
          onClick={onClose}
        >
          <Image src={'/otherAssets/crossIcon.png'}
            height={30} width={30} alt="*"
          />
        </button>
        <h2 className="text-lg font-semibold mb-4">
          Select a Calendar
        </h2>
        <div className="flex flex-row items-center gap-4 w-full mt-5">
          <div className="flex flex-col items-center gap-4 w-1/2">
            <p style={{
              fontSize: 15,
              fontWeight: '600'
            }}>
              Google Calendar
              {/* <span className="text-gray-500 text-sm">(coming soon)</span> */}
            </p>
            {googleCalenderLoader ? (
              <CircularProgress size={45} />
            ) : (
              <button
                // disabled={true}
                onClick={() => {
                  // handlGoogleClick()
                  setShowAddNewGoogleCalender(true);
                }}
                className="
                text-purple border w-11/12 rounded border rounded-lg
                flex items-center justify-center h-[31vh]"
              >
                <Image
                  src={'/otherAssets/googleCalIcon.jpg'}
                  height={106} width={106} alt="*"
                />
              </button>
            )}
          </div>


          <div className="flex flex-col items-center gap-4 w-1/2">
            <p style={{
              fontSize: 15,
              fontWeight: '600'
            }}>
              Cal.com Calendar
            </p>

            {calenderLoader ? (
              <CircularProgress size={45} />
            ) : (
              <button
                onClick={() => {
                  setShowAddNewCalender(true)
                }}
                className="
                text-purple border w-11/12 rounded border rounded-lg
                flex items-center justify-center h-[31vh]"
              >
                <Image
                  src={'/otherAssets/calIcon.jpg'}
                  height={106} width={106} alt="*"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const calCalendarView = () => {
    return (
      <div className="h-full" style={{ width: "100%" }}>
        <div className="" style={{ scrollbarWidth: "none" }}>
          <div className="w-full">
            <div className="w-full flex flex-row justify-between">
              <div style={{
                fontSize: 20,
                fontWeight: "600"
              }}>
                Add Cal.com calendar
              </div>
              <button
                className="outline-none"
                onClick={() => {
                  setShowAddNewCalender(false);
                  setCalenderTitle("");
                  setCalenderApiKey("");
                  setEventId("");
                  setSelectTimeZone("");
                }}
              >
                <Image
                  src={"/assets/blackBgCross.png"}
                  height={20}
                  width={20}
                  alt="*"
                />
              </button>
            </div>

            <div
              className="mt-4"
              style={{
                fontWeight: "600",
                fontSize: 16.8,
                textAlign: "start",
              }}
            >
              Calendar title
            </div>
            <div>
              <input
                className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                placeholder="Type here"
                style={styles.inputStyles}
                value={calenderTitle}
                onChange={(e) => {
                  let value = e.target.value;
                  setCalenderTitle(value);
                }}
              />
            </div>
            <div
              className="mt-4"
              style={{
                fontWeight: "600",
                fontSize: 16.8,
                textAlign: "start",
              }}
            >
              Api key
            </div>
            <div>
              <input
                className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                placeholder="Type here"
                style={styles.inputStyles}
                value={calenderApiKey}
                onChange={(e) => {
                  let value = e.target.value;
                  setCalenderApiKey(value);
                }}
              />
            </div>
            <div
              className="mt-4"
              style={{
                fontWeight: "600",
                fontSize: 16.8,
                textAlign: "start",
              }}
            >
              Event id
            </div>
            <div>
              <input
                className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                placeholder="Type here"
                style={styles.inputStyles}
                value={eventId}
                onChange={(e) => {
                  let value = e.target.value;
                  setEventId(value);
                }}
              />
            </div>

            <div
              className="mt-4"
              style={{
                fontWeight: "600",
                fontSize: 16.8,
                textAlign: "start",
              }}
            >
              Select timezone
            </div>

            <div className="w-full mt-2">
              <FormControl sx={{}} className="w-full h-[50px]">
                <Select
                  value={selectTimeZone}
                  // label="Age"
                  onChange={(event) => {
                    setSelectTimeZone(event.target.value);
                  }}
                  displayEmpty // Enables placeholder
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                    }
                    return selected;
                  }}
                  sx={{
                    height: "48px",
                    borderRadius: "13px",
                    border: "1px solid #00000020", // Default border
                    "&:hover": {
                      border: "1px solid #00000020", // Same border on hover
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove the default outline
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove outline on focus
                    },
                    "&.MuiSelect-select": {
                      py: 0, // Optional padding adjustments
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "30vh", // Limit dropdown height
                        overflow: "auto", // Enable scrolling in dropdown
                        scrollbarWidth: "none",
                        // borderRadius: "10px"
                      },
                    },
                  }}
                >
                  {timeZones.map((item, index) => {
                    return (
                      <MenuItem
                        className="w-full"
                        value={item}
                        key={index}
                      >
                        <button onClick={() => { }}>{item}</button>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>

            <div className="w-full mt-4">
              {calenderLoader ? (
                <div className="w-full flex flex-row items-center justify-center">
                  <CircularProgress size={25} />
                </div>
              ) : (
                <button
                  disabled={!isEnabled()}
                  className="h-[50px] w-full text-white rounded-xl"
                  style={{
                    fontWeight: "600",
                    fontSize: 16,
                    backgroundColor: !isEnabled()
                      ? "#00000020"
                      : "#7902DF",
                    color: !isEnabled() ? "#000000" : "",
                  }}
                  onClick={() => {

                    handleAddCalendar();
                  }}
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  //google calndar view
  const googleCalView = () => {
    return (
      <div className="h-full" style={{ width: "100%" }}>
        <div className="" style={{ scrollbarWidth: "none" }}>
          <div className="w-full">
            <div className="w-full flex flex-row justify-between">
              <div style={{
                fontSize: 20,
                fontWeight: "600"
              }}>
                Add Google Calendar
              </div>
              <button
                className="outline-none"
                onClick={() => {
                  setShowAddNewGoogleCalender(false);
                  setCalenderTitle("");
                  setSelectTimeZone("");
                }}
              >
                <Image
                  src={"/assets/blackBgCross.png"}
                  height={20}
                  width={20}
                  alt="*"
                />
              </button>
            </div>

            <div
              className="mt-4"
              style={{
                fontWeight: "600",
                fontSize: 16.8,
                textAlign: "start",
              }}
            >
              Calendar title
            </div>
            <div>
              <input
                className="w-full rounded-xl h-[50px] outline-none focus:ring-0 p-2 mt-1"
                placeholder="Type here"
                style={styles.inputStyles}
                value={calenderTitle}
                onChange={(e) => {
                  let value = e.target.value;
                  setCalenderTitle(value);
                }}
              />
            </div>

            <div
              className="mt-4"
              style={{
                fontWeight: "600",
                fontSize: 16.8,
                textAlign: "start",
              }}
            >
              Select timezone
            </div>

            <div className="w-full mt-2">
              <FormControl sx={{}} className="w-full h-[50px]">
                <Select
                  value={selectTimeZone}
                  // label="Age"
                  onChange={(event) => {
                    setSelectTimeZone(event.target.value);
                  }}
                  displayEmpty // Enables placeholder
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                    }
                    return selected;
                  }}
                  sx={{
                    height: "48px",
                    borderRadius: "13px",
                    border: "1px solid #00000020", // Default border
                    "&:hover": {
                      border: "1px solid #00000020", // Same border on hover
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove the default outline
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove outline on focus
                    },
                    "&.MuiSelect-select": {
                      py: 0, // Optional padding adjustments
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "30vh", // Limit dropdown height
                        overflow: "auto", // Enable scrolling in dropdown
                        scrollbarWidth: "none",
                        // borderRadius: "10px"
                      },
                    },
                  }}
                >
                  {timeZones.map((item, index) => {
                    return (
                      <MenuItem
                        className="w-full"
                        value={item}
                        key={index}
                      >
                        <button onClick={() => { }}>{item}</button>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>

            <div className="w-full mt-4">
              {googleCalenderLoader ? (
                <div className="w-full flex flex-row items-center justify-center">
                  <CircularProgress size={25} />
                </div>
              ) : (
                <button
                  disabled={!isEnabled(true)}
                  className="h-[50px] w-full text-white rounded-xl"
                  style={{
                    fontWeight: "600",
                    fontSize: 16,
                    backgroundColor: !isEnabled(true)
                      ? "#00000020"
                      : "#7902DF",
                    color: !isEnabled(true) ? "#000000" : "",
                  }}
                  onClick={() => {
                    handlGoogleClick();
                  }}
                >
                  Add
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    if (showAddNewCalender) {
      return (
        calCalendarView()
      )
    } else if (showAddNewGoogleCalender) {
      return (
        googleCalView()
      )
    } else {
      return (
        selectCalendarView()
      )
    }
  }

  function isEnabled(google = false) {
    if (calendarSelected) {
      console.log("Calendar selected is", calendarSelected);
      return true;
    }
    if (google) {
      if (calenderTitle && selectTimeZone) {
        // //console.log;
        return true;
      } else {
        // //console.log;
        return false;
      }
    } else
      if (calenderTitle && calenderApiKey && eventId && selectTimeZone) {
        // //console.log;
        return true;
      } else {
        // //console.log;
        return false;
      }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 1000,
        sx: { backgroundColor: "#00000020" },
      }}
    >
      <Box
        className="w-5/12"// h-auto
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          borderRadius: "20px",
          boxShadow: 24,
          p: 4,
        }}
      >
        {
          renderView()
        }
      </Box>
    </Modal>
  );
}

export default CalendarModal;

const styles = {
  inputStyles: {
    fontWeight: "500",
    fontSize: 15,
    borderColor: "#00000020",
  },
  modalsStyle: {
    height: "auto",
    bgcolor: "transparent",
    p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-55%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
};
