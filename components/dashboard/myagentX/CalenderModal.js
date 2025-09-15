import { AuthToken } from "@/components/agency/plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import timeZones, { timeDuration } from "@/utilities/Timezones";
import { Box, CircularProgress, FormControl, MenuItem, Modal, Select } from "@mui/material";
import Image from "next/image";
import React, { useRef, useState, useCallback, useEffect } from "react";
import AgentSelectSnackMessage, { SnackbarTypes } from "../leads/AgentSelectSnackMessage";
import axios from "axios";
import { Scopes } from "./Scopes";
import { PersistanceKeys } from "@/constants/Constants";

function CalendarModal(props) {
  const {
    open,
    onClose,
    selectedAgent,
    calendarSelected,
    calenderLoader,
    gHLCalenderLoader,
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
    // selectedTimeDuration,
    // setSelectedTimeDuration
    selectedTimeDurationLocal,
    setSelectedTimeDurationLocal,
    selectGHLCalendar,
    setSelectGHLCalendar
  } = props;

  const [showAddNewCalender, setShowAddNewCalender] = useState(false);
  const [showAddNewGoogleCalender, setShowAddNewGoogleCalender] = useState(false);
  const [showAddNewGHLCalender, setShowAddNewGHLCalender] = useState(false);

  //stores google auth details //token, id, etc;

  const [googleAuthDetails, setGoogleAuthDetails] = useState(null);

  // console.log("Status of ghl loader is", gHLCalenderLoader);

  //code for adding ghl calendar
  const [status, setStatus] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [ghlCalendars, setGHLCalendars] = useState([]);
  const popupRef = useRef(null);

  const [showSnack, setShowSnack] = useState({
    type: "",
    message: "",
    isVisible: false
  });

  // console.log("Props passed in calendar modal are", props);

  // If we are the popup landing back at "/" with ?code=..., send it to the opener, then close.
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const code = qs.get("code");
    const error = qs.get("error");

    // If this window was opened by another window (popup case)
    if (window.opener && (code || error)) {
      try {
        window.opener.postMessage(
          { type: "GHL_OAUTH_CODE", code, error },
          window.location.origin // only our own origin
        );
      } finally {
        window.close();
      }
      return; // Don't run the rest in the popup
    }
  }, []);

  // Main window: listen for the popup's message
  useEffect(() => {
    function onMessage(e) {
      // Security: ensure it came from our own origin
      if (e.origin !== window.location.origin) return;
      const { type, code, error } = e.data || {};
      if (type !== "GHL_OAUTH_CODE") return;

      if (error) {
        setStatus(`OAuth error: ${error}`);
        setShowSnack({
          message: `OAuth error: ${error}`,
          type: SnackbarTypes.Error,
          isVisible: true
        })
        return;
      }
      if (!code) return;

      // Got the code from the popup → exchange on server
      (async () => {
        setShowAddNewGHLCalender(true);
        setStatus("Exchanging code...");
        // setShowSnack({
        //   message: "Exchanging code...",
        //   type: "",
        //   isVisible: true
        // })
        // const res = await fetch(`/api/ghl/exchange?code=${encodeURIComponent(code)}`);
        const res = await fetch(`/api/ghl/exchange?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}`)

        const json = await res.json();
        if (!res.ok) {
          setStatus("Exchange failed");
          setShowSnack({
            message: "Exchange failed",
            type: SnackbarTypes.Error,
            isVisible: true
          })
          console.error(json);
          return;
        }
        // setStatus("Connected!");
        console.log("Token recieving are", json);
        setTokens(json);
        // setStatus("Connected! Loading calendars...");
        // const calRes = await fetch("/api/ghl/calendars");
        // const calendars = await calRes.json();
        // if (!calRes.ok) {
        //   setStatus("Failed to load calendars");
        //   console.log(calendars);
        // } else {
        //   setStatus(`Loaded ${calendars?.calendars?.length ?? calendars?.length ?? 0} calendars`);
        //   setTokens(calendars); // or keep separate state like setCalendars(calendars)
        // }

        setStatus("Connected! Loading locations...");
        // const locRes = await fetch("/api/ghl/locations");
        // if (!locRes.ok) {
        //   setStatus(`Failed to load locations (${locRes.status})`);
        //   console.error(await locRes.text());
        //   return;
        // }
        // const locs = await locRes.json();
        // const locationId = locs?.locations?.[0]?.id; // pick one or show a selector
        // const locationId = cookieStore.get("ghl_location_id")?.value;
        // if (!locationId) {
        //   setStatus("No locations found for this token");
        //   return;
        // }else{
        // console.log("Location id fetched is", locationId);
        // }

        setStatus("Loading calendars...");
        // setShowSnack({
        //   message: "Loading calendars...",
        //   type: "",
        //   isVisible: true
        // })
        const calRes = await fetch(`/api/ghl/calendars/`);//?locationId=${encodeURIComponent(locationId)}
        if (!calRes.ok) {
          setStatus(`Failed to load calendars (${calRes.status})`);
          setShowSnack({
            message: `Failed to load calendars (${calRes.status})`,
            type: SnackbarTypes.Error,
            isVisible: true
          })
          console.error(await calRes.text());
          return;
        }
        const calendars = await calRes.json();
        console.log("Calendars fetched are", calendars);
        setStatus("");
        // setStatus(`Loaded ${calendars?.calendars?.length ?? calendars?.length ?? 0} calendars`);
        // const { userId } = await fetch("/api/ghl/user-id/", { cache: "no-store" }).then(r => r.json());
        // console.log("Stored user id:", userId);


        // setTokens(calendars); // or setCalendars(calendars)
        // localStorage.setItem(PersistanceKeys.localGHLs, JSON.stringify(calendars.calendars));
        let ghlCalendars = calendars?.calendars;
        // setGHLCalendars(ghlCalendars.filter((ghlCal) => { ghlCal.isActive === true }));
        // setGHLCalendars(ghlCalendars.filter(ghlCal => ghlCal.isActive === true));
        setGHLCalendars(ghlCalendars);


      })();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);

  }, []);

  useEffect(() => {
    getGHLENVVariables();
  }, []);

  const getGHLENVVariables = () => {
    const ghlVariables = {
      NEXT_PUBLIC_GHL_CLIENT_ID: process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
      NEXT_PUBLIC_GHL_CLIENT_SECRET: process.env.NEXT_PUBLIC_GHL_CLIENT_SECRET,
      NEXT_PUBLIC_GHL_REDIRECT_URI: process.env.NEXT_PUBLIC_GHL_REDIRECT_URI,
      NEXT_PUBLIC_GHL_SCOPE: process.env.NEXT_PUBLIC_GHL_SCOPE,
      NODE_ENV: process.env.NODE_ENV,
      // GHL_CLIENT_ID: process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
      // GHL_CLIENT_SECRET: process.env.NEXT_PUBLIC_GHL_CLIENT_SECRET,
      // GHL_REDIRECT_URI: process.env.NEXT_PUBLIC_GHL_REDIRECT_URI,
    }
    console.log("GHL ENV variables are", ghlVariables)
  }

  //ghl calendar popup click
  const startGHLAuthPopup = useCallback(() => {
    const currentPath = window.location.origin + window.location.pathname;
    let p = currentPath + "Hamza";
    console.log("Path to redirect is", currentPath)
    console.log("Testing the P", p);
    // Build scopes as a space-separated string
    const scope =
      (process.env.NEXT_PUBLIC_GHL_SCOPE || "").trim() ||
      [
        "calendars.readonly",
        "calendars/events.readonly",
        "calendars/resources.readonly",
        "contacts.readonly",
        "lc-email.readonly",
        "locations.readonly",
        "locations/customFields.readonly",
      ].join(" ");
    console.log("GHL Check 1");
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
      redirect_uri: currentPath,//process.env.NEXT_PUBLIC_GHL_REDIRECT_URI
      scope,
      // keep auth in the same popup window
      loginWindowOpenMode: "self",
    });
    console.log("GHL Check 2");
    const authUrl =
      "https://marketplace.gohighlevel.com/oauth/chooselocation?" + params.toString();
    console.log("GHL Check 3");
    // Open a centered popup
    const w = 520;
    const h = 650;
    const y = window.top.outerHeight / 2 + window.top.screenY - h / 2;
    const x = window.top.outerWidth / 2 + window.top.screenX - w / 2;
    console.log("GHL Check 4");
    popupRef.current = window.open(
      authUrl,
      "ghl_oauth",
      `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${w},height=${h},top=${y},left=${x}`
    );
    console.log("GHL Check 5");
    if (!popupRef.current) {
      // Popup blocked → fallback to full redirect
      console.log("GHL Check 6");
      window.location.href = authUrl;
    } else {
      setStatus("Waiting for authorization...");
      // setShowSnack({
      //   message: "Waiting for authorization...",
      //   type: "",
      //   isVisible: true
      // })
      // Optional: poll if user closes popup without completing
      const timer = setInterval(() => {
        if (popupRef.current && popupRef.current.closed) {
          clearInterval(timer);
          setStatus((prev) =>
            prev === "Waiting for authorization..." ? "Popup closed" : prev
          );
          // setShowSnack({
          //   message: ((prev) =>
          //     prev === "Waiting for authorization..." ? "Popup closed" : prev
          //   ),
          //   type: "",
          //   isVisible: true
          // })
        }
      }, 500);
    }
  }, []);

  //google calendar click
  const handleGoogleOAuthClick = () => {
    const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      process.env.NEXT_PUBLIC_APP_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_REDIRECT_URI;

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: Scopes.join(" "), //"openid email profile https://www.googleapis.com/auth/calendar",
        access_type: "offline",
        prompt: "consent",
      }).toString();

    const popup = window.open(oauthUrl, "_blank", "width=500,height=600");

    const listener = async (event) => {
      if (event.data?.type === "google-auth-code") {
        window.removeEventListener("message", listener);

        try {
          setShowSnack({
            message: `Loading ...`,
            type: SnackbarTypes.Loading,
            isVisible: true
          })
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
            setShowAddNewGoogleCalender(true);

            const googleLoginData = {
              ...tokens,
              ...userInfo,
            };
            setGoogleAuthDetails(googleLoginData);
            // console.log("Google login details are", googleLoginData);

            // handleGoogleCalLogin({
            //   ...tokens,
            //   ...userInfo,
            // });
          }
        } catch (err) {
          console.error("Google OAuth error:", err);
        }
      }
    };

    window.addEventListener("message", listener);
  };

  const handleGoogleCalLogin = () => {
    try {
      const data = googleAuthDetails
      if (!data) {
        console.warn("No auth details found for google login");
        return;
      }
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
        scope: Scopes.join(" "), //"openid email profile https://www.googleapis.com/auth/calendar",
        expiryDate: expiryDate,
        googleUserId: data.id,
        email: data.email,
        calenderTitle: calenderTitle,
        selectTimeZone: selectTimeZone,
        eventId: selectedTimeDurationLocal
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
        <AgentSelectSnackMessage
          type={showSnack.type}
          message={showSnack.message}
          isVisible={showSnack.isVisible}
          hide={() => {
            setShowSnack({
              message: "",
              isVisible: false,
              type: SnackbarTypes.Success,
            });
          }}
        />
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
          {/* Google Calendar box */}
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
                  // setShowAddNewGoogleCalender(true);
                  handleGoogleOAuthClick()
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
          {/* Cal.com calendar box */}
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
          {/* GHL calendar box */}
          <div className="flex flex-col items-center gap-4 w-1/2">
            <p style={{
              fontSize: 15,
              fontWeight: '600'
            }}>
              GHL Calendar
            </p>

            {calenderLoader ? (
              <CircularProgress size={45} />
            ) : (
              <button
                onClick={() => {
                  // setShowAddNewGHLCalender(true);
                  startGHLAuthPopup();
                }}
                className="
                text-purple border w-11/12 rounded border rounded-lg
                flex items-center justify-center h-[31vh]"
              >
                <Image
                  src={'/assets/ghlCal.png'}
                  height={104} width={104} alt="*"
                />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  //cal.com calendar view
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
                  setSelectedTimeDurationLocal("");
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

  //GHL calendar view
  const GHLCalendarView = () => {
    return (
      <div className="h-full" style={{ width: "100%" }}>
        <div className="" style={{ scrollbarWidth: "none" }}>
          <div className="w-full">
            <div className="w-full flex flex-row justify-between">
              <div style={{
                fontSize: 20,
                fontWeight: "600"
              }}>
                Add GHL calendar
              </div>
              <button
                className="outline-none"
                onClick={() => {
                  setShowAddNewGHLCalender(false);
                  setCalenderTitle("");
                  setCalenderApiKey("");
                  setEventId("");
                  setSelectTimeZone("");
                  setSelectedTimeDurationLocal("");
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
            {/*
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
            */}

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

            <div
              className="mt-4"
              style={{
                fontWeight: "600",
                fontSize: 16.8,
                textAlign: "start",
              }}
            >
              Select calendar
            </div>

            {
              status ? (
                <div className="p-2">
                  {status}
                </div>
              ) : (
                <div className="w-full mt-2">
                  <FormControl sx={{}} className="w-full h-[50px]">
                    <Select
                      value={selectGHLCalendar}
                      // label="Age"
                      onChange={(event) => {
                        const value = event.target.value;
                        console.log("Click on calendars", value);
                        setSelectGHLCalendar(event.target.value);
                      }}
                      displayEmpty // Enables placeholder
                      renderValue={(selected) =>
                        selected ? selected.name : <div style={{ color: "#aaa" }}>Select</div>
                      }
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
                      {ghlCalendars.map((item, index) => {
                        return (
                          <MenuItem
                            className="w-full"
                            value={item}
                            key={index}
                          // disabled={item?.isActive === false}
                          >
                            <button onClick={() => { }}>{item.name}</button>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </div>
              )
            }


            {/* Select calendar fetched from ghl account
            <button
              onClick={startGHLAuthPopup}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Connect GHL (Popup)
            </button> */}

            <div className="w-full mt-4">
              {gHLCalenderLoader ? (
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
                    const Calendar = {
                      isFromAddGHLCal: true,
                      title: calenderTitle,
                      timeZone: selectTimeZone,
                      ghlCalendar: selectGHLCalendar
                    }
                    handleAddCalendar(Calendar);
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
                  setSelectedTimeDurationLocal("");
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

            <div
              className="mt-4"
              style={{
                fontWeight: "600",
                fontSize: 16.8,
                textAlign: "start",
              }}
            >
              Time Duration
            </div>

            <div className="w-full mt-2">
              <FormControl sx={{}} className="w-full h-[50px]">
                <Select
                  value={selectedTimeDurationLocal}
                  // label="Age"
                  onChange={(event) => {
                    // setSelectedTimeDuration(event.target.value);
                    console.log("Check 1", event.target.value);
                    console.log(`Is function `, typeof setSelectedTimeDurationLocal)
                    setSelectedTimeDurationLocal(event.target.value); // ✅ correct
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
                  {timeDuration.map((item, index) => {
                    return (
                      <MenuItem
                        className="w-full"
                        value={item}
                        key={index}
                      >
                        <div className="w-full">{item}</div>
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
                    handleGoogleCalLogin();
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
    } else if (showAddNewGHLCalender) {
      return (
        GHLCalendarView()
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
      if (calenderTitle && selectTimeZone && selectedTimeDurationLocal) {
        // //console.log;
        return true;
      } else {
        // //console.log;
        return false;
      }
    } else if (showAddNewGHLCalender) {
      if (calenderTitle && selectTimeZone && selectGHLCalendar) {
        // //console.log;&& selectedTimeDurationLocal
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
        <AgentSelectSnackMessage
          type={showSnack.type}
          message={showSnack.message}
          isVisible={showSnack.isVisible}
          hide={() => {
            setShowSnack({
              message: "",
              isVisible: false,
              type: SnackbarTypes.Success,
            });
          }}
        />
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
