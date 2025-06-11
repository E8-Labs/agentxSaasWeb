"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import {
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Popover,
  Select,
  Typography,
} from "@mui/material";
import moment, { duration } from "moment";
import getProfileDetails from "@/components/apis/GetProfile";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import { useRouter } from "next/navigation";
import BackgroundVideo from "@/components/general/BackgroundVideo";
import { Constants, PersistanceKeys } from "@/constants/Constants";
import { convertSecondsToMinDuration } from "@/utilities/utility";
import DashboardSlider from "@/components/animations/DashboardSlider";

const Page = () => {
  const router = useRouter();

  //variable stores screenWidth
  const [screenWidth, setScreenWidth] = useState(null);
  const [screenHeight, setScreenHeight] = useState(null);

  const [userDetails, setUserDetails] = useState(null);

  const [showPlansPopup, setShowPlansPopup] = useState(false);

  const [statsDetails, setStatsDetails] = useState(null);
  const [statsComparisonDetails, setStatsComparisonDetails] = useState(null);
  const [initialLoader, setInitialLoader] = useState(false);
  const [isinItiallyLoaded, setIsInitiallyLoaded] = useState(false);

  //variable for hover
  const [aIWebinarhover, setAIWebinarhover] = useState(false);
  const [consultHover, setConsulthover] = useState(false);

  //code for dropdown
  const [Duration, setDuration] = useState("24 hrs");

  //variables for popover
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let screnW = window.innerWidth;
      let screnH = window.innerHeight;
      setScreenWidth(screnW);
      setScreenHeight(screnH);
    }
  }, []);

  useEffect(() => {
    // //console.log;
    // //console.log;
  }, [statsDetails, statsComparisonDetails]);

  useEffect(() => {
    setInitialLoader(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    //console.log;
    getDashboardData();
    getProfile();
  }, []);

  //function for tootip

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget); // Correct handling for mouse enter
  };

  const handlePopoverClose = () => {
    setAnchorEl(null); // Correct handling for mouse leave
  };

  //function to get user profile details
  const getProfile = async () => {
    try {
      let response = await getProfileDetails();

      // //console.log;
      if (response) {
        let user = response?.data?.data;
        if (user) {
          setUserDetails(user);
        }
        if (!response?.data?.data?.plan?.status === "cancelled") {
          setShowPlansPopup(true);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is error", error);
    }
  };

  //function to get the dashboard data

  function SaveDashboardDataToLocal(api, data) {
    localStorage.setItem(api, JSON.stringify(data));
  }
  function GetDashboardDataFromLocalStorage(api) {
    let d = localStorage.getItem(api);
    if (d) {
      // //console.log;
      let json = JSON.parse(d);
      let stats = json.stats;
      let comp = json.statsComparison;
      setStatsDetails(stats);
      setStatsComparisonDetails(comp);
    } else {
      // //console.log;
    }
  }

  const getDashboardData = async (duration) => {
    try {
      // //console.log;
      let durationValue = 1;

      if (duration === "24 hrs") {
        durationValue = 1;
      } else if (duration === "Last 7 Days") {
        durationValue = 7;
      } else if (duration === "Last 30 Days") {
        durationValue = 30;
      } else if (duration === "All time") {
        durationValue = 365;
      }

      // //console.log;

      const ApiPath = `${Apis.getDashboardData}?duration=${durationValue}`;
      GetDashboardDataFromLocalStorage(ApiPath);
      // if (isinItiallyLoaded === false) {
      // setInitialLoader(true);
      // }

      const localData = localStorage.getItem("User");
      let AuthToken = null;
      if (localData) {
        const UserDetails = JSON.parse(localData);
        // //console.log;
        setUserDetails(UserDetails.user);
        AuthToken = UserDetails.token;
      }

      // //console.log;

      // let durationDetails = null;

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          console.log("dashboard data is", response.data.data);
          setStatsDetails(response.data.data.stats);
          setStatsComparisonDetails(response.data.data.statsComparison);

          SaveDashboardDataToLocal(ApiPath, response.data.data);
        }
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      // //console.log;
      setInitialLoader(false);
    }
  };

  useEffect(() => {
    //console.log;
  }, [isinItiallyLoaded]);

  //function to handle the dropdown
  const handleChange = (event) => {
    event.preventDefault();
    setDuration(event.target.value);
    getDashboardData(event.target.value);
  };

  const backgroundImage = {
    backgroundImage: 'url("/otherAssets/bg23.png")',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "40%",
    // height: "40svh",
    overflow: "hidden",
  };

  //function for cards
  function Card({
    icon,
    title,
    value,
    subtitle,
    rate,
    borderSide,
    recomendation,
  }) {
    return (
      <div
        className={`bg-white flex flex-col items-center ${borderSide}`}
        style={{
          borderColor: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="w-10/12 ps-4 py-4">
          {/* Icon */}

          <div className="flex flex-row w-full items-center justify-between">
            {/* <div className="w-12 h-12 flex flex-row items-center justify-center rounded-full bg-gray-100"> */}
            <Image src={icon} alt={title} width={50} height={50} />
            {/* </div> */}

            {recomendation && (
              <div className="flex flex-row items-center gap-2">
                <div>Recomendation</div>
                <Image
                  aria-owns={open ? "mouse-over-popover" : undefined}
                  aria-haspopup="true"
                  onMouseEnter={handlePopoverOpen}
                  onMouseLeave={handlePopoverClose}
                  src={"/svgIcons/infoIcon.svg"}
                  height={20}
                  width={20}
                  alt="*"
                />
                {/* <Popover
 id="mouse-over-popover"
 sx={{ pointerEvents: 'none' }}
 open={open}
 anchorEl={anchorEl}
 anchorOrigin={{
 vertical: 'bottom',
 horizontal: 'left',
 }}
 transformOrigin={{
 vertical: 'top',
 horizontal: 'left',
 }}
 onClose={handlePopoverClose}
 disableRestoreFocus
 >
 <Typography sx={{ p: 1 }}>I use Popover.</Typography>
 </Popover> */}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-4 text-md font-medium">{title}</h3>

          {/* Value */}
          <p className="lg:text-3xl md:text-2xl sm:text-xl text-lg font-bold mt-2">
            {value}
          </p>

          {/* Subtitle and Rate */}
          {subtitle && (
            <div className="mt-2 flex flex-row itemms-center gap-2 justify-end w-full">
              <p className="text-gray-500 text-sm">{subtitle}</p>
              <p className="text-blue-500 text-sm font-semibold">{rate}</p>
            </div>
          )}

          {/* Tooltip code here */}
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start justify-screen h-screen overflow-auto">

      {/* Slider code */}
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0
        }}>
        <DashboardSlider />
      </div>

      {/* <div style={backgroundImage}></div> */}
      {initialLoader ? (
        <div className="flex flex-row items-center w-full justify-center h-[100%]">
          <CircularProgress size={45} />
        </div>
      ) : (
        <div className="flex flex-col mt-12 items-center w-full h-[100%]">
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "20%",
              objectFit: "cover",
              zIndex: -1, // Ensure the video stays behind content
              overflow: "hidden",
            }}
          >
            <BackgroundVideo />
          </div>
          <div className="w-9/12 flex flex-col items-center h-[100%]">
            {/* <div className='w-11/12 h-[5%] mb-4' style={{ fontWeight: "700", fontSize: 29, paddingBottom: 10 }}>
 Good to have you back, <span className='text-[#00000090]'>{userDetails?.name}</span>
 </div> */}
            <div
              style={{
                position: "absolute",
                top: 25,
                right: 50,
              }}
            >
              <NotficationsDrawer />
            </div>
            <div className="h-[95%] w-11/12 flex flex-row justify-center bg-white rounded-xl">
              <div className="w-11/12 h-[100%]">
                <div className="w-full flex flex-row items-center justify-between h-[30%]">
                  <div className="w-2/12 flex flex-col gap-1">
                    <div
                      style={{ fontSize: 29, fontWeight: "600", color: "#000" }}
                    >
                      Usage
                    </div>
                    <div
                      style={{ fontSize: 15, fontWeight: "400", color: "#000" }}
                    >
                      Total calls made
                    </div>
                    <div
                      style={{
                        fontSize:
                          screenHeight < 640
                            ? 35
                            : screenHeight < 800
                              ? 50
                              : 75,
                        fontWeight: "700",
                        color: "#000",
                      }}
                    >
                      {statsDetails?.totalCalls || "-"}
                    </div>
                  </div>
                  <div className="w-8/12 flex flex-col items-end gap-2">
                    <div
                      className="w-fit-content flex flex-row justify-between"
                      style={{ backgroundColor: "#00000006 ", borderRadius: 5 }}
                    >
                      {/* <div style={{ fontSize: 15 }}>
 Last 24hrs
 </div> */}

                      <FormControl>
                        {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
                        <Select
                          // labelId="demo-simple-select-label"
                          // id="demo-simple-select"
                          value={Duration}
                          // label="Age"
                          onChange={handleChange}
                          displayEmpty // Enables placeholder
                          renderValue={(selected) => {
                            if (!selected) {
                              return (
                                <div style={{ color: "#aaa" }}>Select</div>
                              ); // Placeholder style
                            }
                            return selected;
                          }}
                          sx={{
                            border: "none", // Default border
                            "&:hover": {
                              border: "none", // Same border on hover
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
                          <MenuItem
                            className="hover:bg-[#402FFF10]"
                            value={"24 hrs"}
                            style={{
                              backgroundColor:
                                Duration === "24 hrs" && "#7902DF",
                              color: Duration === "24 hrs" && "#ffffff",
                            }}
                          >
                            Last 24 Hours
                          </MenuItem>
                          <MenuItem
                            className="hover:bg-[#402FFF10]"
                            value={"Last 7 Days"}
                            style={{
                              backgroundColor:
                                Duration === "Last 7 Days" && "#7902DF",
                              color: Duration === "Last 7 Days" && "#ffffff",
                            }}
                          >
                            Last 7 Days
                          </MenuItem>
                          <MenuItem
                            className="hover:bg-[#402FFF10]"
                            value={"Last 30 Days"}
                            style={{
                              backgroundColor:
                                Duration === "Last 30 Days" && "#7902DF",
                              color: Duration === "Last 30 Days" && "#ffffff",
                            }}
                          >
                            Last 30 Days
                          </MenuItem>
                          <MenuItem
                            className="hover:bg-[#402FFF10]"
                            value={"All time"}
                            style={{
                              backgroundColor:
                                Duration === "All time" && "#7902DF",
                              color: Duration === "All time" && "#ffffff",
                            }}
                          >
                            All time
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </div>

                    <div
                      className="w-full h-40vh flex flex-row justify-between items-center px-8 py-4"
                      style={{
                        backgroundImage: "url('/svgIcons/cardBg.svg')",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        width: "40vw",
                        minHeight: "13vh",
                        borderRadius: 10,
                      }}
                    >
                      <div className="flex flex-row gap-3 items-start">
                        <Image
                          src={"/svgIcons/timerIcon.svg"}
                          height={50}
                          width={50}
                          alt="timer"
                        />
                        <div className="flex flex-col">
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: "400",
                              color: "#fff",
                            }}
                          >
                            Mins Balance
                          </div>

                          <div
                            className="lg:text-4xl md:text-2xl sm:text-xl text-lg font-bold text-white"
                            style={{
                              // fontSize: 40,
                              fontWeight: "400",
                              color: "#fff",
                            }}
                          >
                            {convertSecondsToMinDuration(
                              userDetails?.totalSecondsAvailable || 0
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: "400",
                            color: "#fff",
                          }}
                        >
                          Scale your business
                        </div>
                        <button
                          className="flex flex-row items-center gap-2 justify-center bg-white h-[43px] w-[130px] rounded-[15px]"
                          onClick={() => {
                            const openBilling = true;
                            // localStorage.setItem("openBilling", JSON.stringify(openBilling));
                            router.push("/dashboard/myAccount?tab=2");
                          }}
                        >
                          <Image
                            src={"/svgIcons/king.svg"}
                            height={20}
                            width={20}
                            alt="*"
                          />
                          <div
                            style={{
                              fontWeight: "500",
                              fontSize: 15,
                            }}
                          >
                            Upgrade
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full py-8 overflow-none">
                  {/* Metrics Section */}
                  <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    {/* Card: Conversations > 10 Sec */}
                    <Card
                      icon="/svgIcons/convosIcon.svg"
                      title="Convos"
                      value={statsDetails?.totalCallsGt10 || "-"}
                      subtitle="Answer rate"
                      rate={
                        statsComparisonDetails?.callsGt10Change
                          ? `${statsComparisonDetails?.callsGt10Change.toFixed(
                            2
                          )}%`
                          : "-"
                      }
                      borderSide="border-b-2"
                    />

                    {/* Card: Hot Leads */}
                    <Card
                      icon="/svgIcons/hotLeadsIcon.svg"
                      title="Hot Leads"
                      value={statsDetails?.hotLeads || "-"}
                      subtitle="Conversion rate"
                      rate={
                        statsComparisonDetails?.hotLeadsChange
                          ? `${statsComparisonDetails?.hotLeadsChange.toFixed(
                            2
                          )}%`
                          : "-"
                      }
                      borderSide="border-l-2 border-b-2"
                      recomendation={false}
                    />

                    {/* Card: Booked Meetings */}
                    <Card
                      icon="/svgIcons/bookedMeetingsIcon.svg"
                      title="Booked Meetings"
                      value={statsDetails?.meetingScheduled || "-"}
                      subtitle="Conversion rate"
                      // rate={
                      // statsComparisonDetails?.durationChange
                      // ? `${statsComparisonDetails?.durationChange.toFixed(
                      // 2
                      // )}%`
                      // : "-"
                      // }
                      rate={
                        statsComparisonDetails?.bookingChange
                          ? `${statsComparisonDetails?.bookingChange.toFixed(
                            2
                          )}%`
                          : "-"
                      }
                      borderSide="border-l-2 border-b-2"
                      recomendation={false}
                    />

                    {/* Card: Voicemails */}
                    <Card
                      icon="/svgIcons/voicemailIcon.svg"
                      title="Voicemails"
                      value={statsDetails?.voicemail || "-"}
                      borderSide=""
                    />

                    {/* Card: Not Interested */}
                    <Card
                      icon="/svgIcons/notInterestedIcon.svg"
                      title="Not Interested"
                      value={statsDetails?.notInterested || "-"}
                      borderSide="border-l-2"
                    />

                    {/* Card: Avg Convo Duration */}
                    <Card
                      icon="/svgIcons/avgDurationIcon.svg"
                      title="Avg Convo Duration"
                      value={statsDetails?.formattedAvDuration || "-"}
                      borderSide="border-l-2"
                    />
                  </div>

                 {/* <div className="w-full flex flex-row items-center justify-between mt-4">
                    <div
                      className="w-6/12 hover:bg-purple hover:text-white bg-white rounded p-4"
                      style={{
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => {
                        setAIWebinarhover(true);
                      }}
                      onMouseLeave={() => {
                        setAIWebinarhover(false);
                      }}
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          let url = userDetails?.campaignee
                            ? userDetails?.campaignee.officeHoursUrl
                            : PersistanceKeys.GlobalWebinarUrl;
                          //console.log
                          window.open(url, "_blank");
                        }
                      }}
                    >
                      <div className="flex flex-row gap-2">
                        {aIWebinarhover ? (
                          <Image
                            src={"/assets/whiteCalenderIcon.svg"}
                            alt="calender"
                            height={24}
                            width={24}
                          />
                        ) : (
                          <Image
                            src={"/svgIcons/calenderIcon.svg"}
                            alt="calender"
                            height={24}
                            width={24}
                          />
                        )}

                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: aIWebinarhover ? "white" : "#7902DF",
                          }}
                        >
                          Join our weekly AI Webinar
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: "400",
                          marginTop: "1vh",
                        }}
                      >
                        {`Learn tips and tricks to enhance your AI, perfect your script, and master best practices in our weekly live webinar. Don’t miss out on actionable insights to boost your success!`}
                      </div>
                    </div>

                    <div
                      className="w-6/12 hover:bg-purple hover:text-white bg-white rounded p-4"
                      onMouseEnter={() => {
                        setConsulthover(true);
                      }}
                      onMouseLeave={() => {
                        setConsulthover(false);
                      }}
                      onClick={() => {
                        let url = PersistanceKeys.GlobalConsultationUrl;
                        if (typeof window !== "undefined") {
                          window.open(url, "_blank");
                        }
                      }}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <div className="flex flex-row gap-2">
                        {consultHover ? (
                          <Image
                            src={"/svgIcons/screenIcon.svg"}
                            alt="calender"
                            height={24}
                            width={24}
                          />
                        ) : (
                          <Image
                            src={"/assets/blueScreenIcon.svg"}
                            alt="calender"
                            height={24}
                            width={24}
                          />
                        )}
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: consultHover ? "white" : "#7902DF",
                          }}
                        >
                          Done with you agent setup
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: "400",
                          marginTop: "1vh",
                        }}
                      >
                        {`Get up and running the right way. We'll work alongside to set up and integrate your CRM, ensuring everything is optimized for success from the start. See results faster and start closing more deals.`}
                      </div>
                    </div>
                      </div>*/}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
