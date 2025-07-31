"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import moment from "moment";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import {
  Box,
  CircularProgress,
  duration,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
} from "@mui/material";
import { CalendarDots } from "@phosphor-icons/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarOverrides.css";
import parsePhoneNumberFromString from "libphonenumber-js";
import InfiniteScroll from "react-infinite-scroll-component";
import LeadDetails from "@/components/dashboard/leads/extras/LeadDetails";
import {
  convertUTCToTimezone,
  GetFormattedDateString,
  GetFormattedTimeString,
} from "@/utilities/utility";
import AdminCallDetails from "./AdminCallDetails";
import { time } from "framer-motion";
import AdminDashboardActiveCall from "./AdminDashboardActiveCall";
import AdminDashboardScheduledCalls from "./AdminDashboardScheduledCalls";
import { PersistanceKeys } from "@/constants/Constants";

function AdminDashboardCallLogs({ }) {
  const LimitPerPage = 30;

  const [searchValue, setSearchValue] = useState("");

  const [activeTab, setActiveTab] = useState("All Calls");


  const [callDetails, setCallDetails] = useState([]);
  const [filteredCallDetails, setFilteredCallDetails] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);

  //code for filter call log details
  //variabl for deltag
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const [sheetsLoader, setSheetsLoader] = useState(false);

  //code for pipelines

  //code for details modal
  const [selectedLeadsDetails, setselectedLeadsDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLocalCallsAvailable, setIsLocalCallsAvailable] = useState(true)

  //code for pagination
  const [offset, setOffset] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const requestVersion = useRef(0);

  const [hasFetchedFromAPIOnce, setHasFetchedFromAPIOnce] = useState(false);


  const filterRef = useRef(null);

  const statusList = [
    {
      id: 1,
      status: "Voicemail",
    },
    {
      id: 2,
      status: "Booked",
    },
    {
      id: 3,
      status: "Hangup",
    },
    {
      id: 4,
      status: "Hot Lead",
    },
    {
      id: 5,
      status: "Agent Goodbye",
    },
    {
      id: 6,
      status: "Human Goodbye",
    },
    {
      id: 7,
      status: "Busy",
    },
    {
      id: 8,
      status: "Failed",
    },
    {
      id: 9,
      status: "Not Interested",
    },
    {
      id: 10,
      status: "No answer",
    },
  ];

  useEffect(() => {
    console.log("Call logs list is", filteredCallDetails.length);
  }, [filteredCallDetails]);

  // useEffect(() => {
  //   //console.log;
  //   // if ((selectedFromDate && selectedToDate) || selectedStageIds.length > 0) {
  //   setHasMore(true);
  //   setCallDetails([]);
  //   setFilteredCallDetails([]);
  //   setInitialLoader(true);
  //   getCallLogs(0);
  //   // }
  // }, [selectedToDate, selectedFromDate]);


  useEffect(() => {
    const getLocalCalls = () => {
      const call = localStorage.getItem(PersistanceKeys.LocalAllCalls)
      if (call) {
        setIsLocalCallsAvailable(true)
        const C = JSON.parse(call);
        setFilteredCallDetails(C);
        setCallDetails(C);
        setHasFetchedFromAPIOnce(true); // ← ADD THIS LINE
        console.log("Get admin all calls from local are ", C.length);
        if (C.length < LimitPerPage) {
          setHasMore(false);
        }
      getCallLogs(0)

      }
      else {
        console.log("calls are not available in local storage")
        setIsLocalCallsAvailable(false)
        getCallLogs(0)
      }
    }
    getLocalCalls()
  }, [])

  useEffect(() => {
    if (filterRef.current) {
      clearTimeout(filterRef.current);
    }
    filterRef.current = setTimeout(() => {
      console.log("is local call ", isLocalCallsAvailable)
      if (!isLocalCallsAvailable || hasFetchedFromAPIOnce) {
        setHasMore(true);
        setCallDetails([]);
        setFilteredCallDetails([]);
        setInitialLoader(true);
        getCallLogs(0);
      }

    }, 400);
  }, [searchValue]);

  useEffect(() => {
    // getCallLogs()
  }, []);

  function getFilterTitle(filter) {
    if (filter.key === "date") {
      let values = filter.values;
      if (values.length > 0) {
        let string = moment(values[0]).format("MMM Do");
        if (values.length > 1) {
          string += ` - ${moment(values[1]).format("MMM Do")}`;
        }
        return string;
      }
      return "";
    }

    if (filter.key === "status") {
      return filter.values[0]; // Return status string directly
    }

    return "";
  }

  function GetFiltersFromSelection() {
    let filters = [];

    // Date filter
    if (selectedFromDate && selectedToDate) {
      filters.push({
        key: "date",
        values: [selectedFromDate, selectedToDate],
      });
    }

    // Status filters (Ensure each status is separate)
    selectedStatus.forEach((status) => {
      filters.push({
        key: "status",
        values: [status], // Pass each status individually
      });
    });

    return filters;
  }

  //code for getting call log details
  const getCallLogs = async (offset = null) => {



    console.log("check 1");
    try {
      setLoading(true);
      setInitialLoader(true);
      // //console.log;
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        AuthToken = Data.token;
      }
      // //console.log;
      let startDate = "";
      let endDate = "";

      if (selectedFromDate && selectedToDate) {
        startDate = moment(selectedFromDate).format("MM-DD-YYYY");
        endDate = moment(selectedToDate).format("MM-DD-YYYY");
      }

      // //console.log;
      let ApiPath = null;
      //   // //console.log;
      if (offset == null) {
        offset = filteredCallDetails.length;
      }
      if (selectedFromDate && selectedToDate) {
        ApiPath = `${Apis.adminCallLogs}?startDate=${startDate}&endDate=${endDate}&offset=${offset}`;
      } else {
        ApiPath = `${Apis.adminCallLogs}?offset=${offset}`; //Apis.getCallLogs;
      }
      if (searchValue && searchValue.length > 0) {
        ApiPath = `${ApiPath}&name=${searchValue}`;
      }

      if (selectedFromDate && selectedToDate) {
        ApiPath = `${Apis.adminCallLogs}?startDate=${startDate}&endDate=${endDate}&offset=${offset}`;
      }

      if (selectedStatus.length > 0) {
        ApiPath += `&status=${selectedStatus.join(",")}`;
      }

      // ApiPath = Apis.adminCallLogs

      //console.log;

      //// //console.log;
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });
      setLoading(false);


      if (response) {
        //console.log;
        // setCallDetails(response.data.data);
        // setFilteredCallDetails(response.data.data);

        const data = response.data.data;
        localStorage.setItem("callDetails", response.data.data);

        // If offset is 0, replace the calls completely, otherwise append
        let calls;
        if (offset === 0) {
          calls = data;
        } else {
          calls = [...callDetails, ...data];
        }
        
        console.log('calls', calls)
        setCallDetails(calls);
        setFilteredCallDetails(calls);
        setHasFetchedFromAPIOnce(true);
        console.log("Length storing localstorage", calls.length);

        // Save to localStorage
        if (offset === 0) {
          localStorage.setItem(PersistanceKeys.LocalAllCalls, JSON.stringify(calls));
        }

        setIsLocalCallsAvailable(false)

        if (data.length < LimitPerPage) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error occured in gtting calls log api is:", error);
    } finally {
      setInitialLoader(false);
    }
  };

  //function to select date
  const handleFromDateChange = (date) => {
    setSelectedFromDate(date); // Set the selected date
    setShowFromDatePicker(false);
  };

  const handleToDateChange = (date) => {
    setSelectedToDate(date); // Set the selected date
    setShowToDatePicker(false);
  };

  //function to format phone number
  //code for formating the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
    );
    //// //console.log;
    return phoneNumber
      ? phoneNumber.formatInternational()
      : "Invalid phone number";
  };

  return (
    <div className="w-full items-start">
      <div
        className="w-full pl-10 mt-5"
        style={{ fontSize: 24, fontWeight: "600" }}
      >
        Call Logs
      </div>

      <div className="flex w-full pl-10 flex-row items-center gap-3">
        <div className="flex flex-row items-center gap-1 w-[22vw] flex-shrink-0 border rounded pe-2 mt-4">
          <input
            style={{ fontSize: 15 }}
            type="text"
            placeholder="Search by name, email or phone"
            className="flex-grow outline-none font-[500]  border-none focus:outline-none focus:ring-0 flex-shrink-0"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              // handleSearchChange(value);
              setSearchValue(value);
            }}
          />
          <img
            src={"/otherAssets/searchIcon.png"}
            alt="Search"
            width={20}
            height={20}
          />
        </div>

        <button
          className="flex-shrink-0"
          onClick={() => {
            setShowFilterModal(true);
          }}
        >
          <Image
            src={"/otherAssets/filterBtn.png"}
            height={36}
            width={36}
            alt="Search"
          />
        </button>

        {/* Show filters here in a row*/}
        <div
          className="flex flex-row items-center gap-4 flex-shrink-0 overflow-auto w-[70%] "
          style={{ scrollbarColor: "#00000000", scrollbarWidth: "none" }}
        >
          {GetFiltersFromSelection().map((filter, index) => (
            <div className="flex-shrink-0" key={index}>
              <div
                className="px-4 py-2 bg-[#402FFF10] text-purple flex-shrink-0 rounded-[25px] flex flex-row items-center gap-2"
                style={{ fontWeight: "500", fontSize: 15 }}
              >
                {getFilterTitle(filter)}

                {/* Remove Filter Button */}
                <button
                  className="outline-none"
                  onClick={() => {
                    if (filter.key === "date") {
                      setSelectedFromDate(null);
                      setSelectedToDate(null);
                    } else if (filter.key === "status") {
                      setSelectedStatus((prev) =>
                        prev.filter((s) => s !== filter.values[0])
                      );
                    }

                    // Refresh Call Logs after filter removal
                    setCallDetails([]);
                    setFilteredCallDetails([]);
                    setHasMore(true);
                    setTimeout(() => {
                      getCallLogs(0);
                    }, 500);
                  }}
                >
                  <Image
                    src={"/otherAssets/crossIcon.png"}
                    height={20}
                    width={20}
                    alt="Remove Filter"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>here
      </div>


      <div className=" w-full flex mt-10  gap-8 pb-2 mb-4 pl-10">
        {["All Calls", "Call Activities", "Scheduled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${activeTab === tab
              ? "text-purple border-b-2 border-purple outline-none"
              : ""
              }`}
            style={{ fontSize: 15, fontWeight: "500" }}
          >
            {tab}
          </button>
        ))}
      </div>


      <div className="w-full">
        {activeTab === "Call Activities" ? (
          <AdminDashboardActiveCall />
        ) : activeTab === "Scheduled" ? (
          <AdminDashboardScheduledCalls />
        ) : (

          <div>
            <div className="w-full flex flex-row justify-between mt-2 px-10 mt-4">
              <div className="w-2/12">
                <div style={styles.text}>Name</div>
              </div>
              <div className="w-2/12 ">
                <div style={styles.text}>Agent Number</div>
              </div>
              <div className="w-2/12">
                <div style={styles.text}>Contact Number</div>
              </div>

              <div className="w-1/12">
                <div style={styles.text}>Status</div>
              </div>
              <div className="w-2/12">
                <div style={styles.text}>Date</div>
              </div>
              <div className="w-1/12">
                <div style={styles.text}>Time</div>
              </div>
              <div className="w-1/12">
                <div style={styles.text}>More</div>
              </div>
            </div>

            {initialLoader && filteredCallDetails.length == 0 && !isLocalCallsAvailable ? (
              <div
                className={`flex flex-row items-center justify-center mt-12 h-[67vh] overflow-auto`}
              >
                <CircularProgress size={35} thickness={2} />
              </div>
            ) : (
              <div
                className={`h-[67vh] border overflow-auto`}
                id="scrollableDiv1"
                style={{ scrollbarWidth: "none" }}
              >
                <InfiniteScroll
                  className="lg:flex hidden flex-col w-full"
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
                  dataLength={filteredCallDetails.length}
                  next={() => {
                    //console.log;
                    if (!loading && hasMore) {
                      getCallLogs(filteredCallDetails.length);
                    }

                  }} // Fetch more when scrolled
                  hasMore={hasMore} // Check if there's more data
                  loader={

                    <div className="w-full flex flex-row justify-center mt-8">
                      <CircularProgress size={35} />
                    </div>
                  }
                  style={{ overflow: "unset" }}
                >
                  {filteredCallDetails?.length > 0 ? (
                    <div>
                      {filteredCallDetails.map((item, index) => (
                        <div
                          key={index}
                          style={{ cursor: "pointer" }}
                          className="w-full flex flex-row justify-between items-center mt-5 px-10 hover:bg-[#402FFF05] py-2"
                        >
                          <div className="w-2/12 flex flex-row gap-2 items-center">
                            <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                              {item.user?.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div style={styles.text2}>
                              {item.user?.name}
                            </div>
                          </div>
                          <div className="w-2/12 ">
                            <div style={styles.text2}>
                              {item.agent?.phoneNumber ? (
                                <div>{item.agent.phoneNumber}</div>
                              ) : (
                                "-"
                              )}
                            </div>
                          </div>
                          <div className="w-2/12">
                            {/* (item.LeadModel?.phone) */}
                            <div style={styles.text2}>
                              {item.LeadModel?.phone ? (
                                <div>{formatPhoneNumber(item?.LeadModel?.phone)}</div>
                              ) : (
                                "-"
                              )}
                            </div>
                          </div>

                          <div className="w-1/12">
                            <div style={styles.text2}>
                              {item?.callOutcome ? item?.callOutcome : "Ongoing"}
                            </div>
                          </div>
                          <div className="w-2/12">
                            <div style={styles.text2}>
                              {GetFormattedDateString(item?.createdAt)}
                            </div>
                          </div>
                          <div className="w-1/12">
                            <div style={styles.text2}>
                              {GetFormattedTimeString(item?.createdAt)}
                            </div>
                          </div>
                          <div className="w-1/12">
                            <button
                              onClick={() => {
                                setselectedLeadsDetails(item);
                                setShowDetailsModal(true);
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#7902DF",
                                  textDecorationLine: "underline",
                                }}
                              >
                                Details
                              </div>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="text-center mt-4"
                      style={{ fontWeight: "bold", fontSize: 20 }}
                    >
                      No call log found
                    </div>
                  )}
                </InfiniteScroll>
              </div>
            )}

            {/* Code for filter modal */}
            <div>
              <Modal
                open={showFilterModal}
                closeAfterTransition
                BackdropProps={{
                  sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(5px)",
                  },
                }}
              >
                <Box
                  className="lg:w-4/12 sm:w-7/12 w-8/12 px-6 flex justify-center items-center"
                  sx={{
                    ...styles.modalsStyle,
                    scrollbarWidth: "none",
                    backgroundColor: "transparent",
                    height: "100svh",
                  }}
                >
                  <div className="w-full flex flex-col items-center justify-between h-[60vh] bg-white p-4 rounded-md overflow-auto  ">
                    <div className="mt-2 w-full">
                      <div className="flex flex-row items-center justify-between w-full">
                        <div>Filter</div>
                        <button
                          onClick={() => {
                            setShowFilterModal(false);
                          }}
                        >
                          <Image
                            src={"/assets/cross.png"}
                            height={17}
                            width={17}
                            alt="*"
                          />
                        </button>
                      </div>

                      <div className="flex flex-row items-start gap-4">
                        <div className="w-1/2 h-full">
                          <div
                            className="h-full"
                            style={{
                              fontWeight: "500",
                              fontSize: 12,
                              color: "#00000060",
                              marginTop: 10,
                            }}
                          >
                            From
                          </div>
                          <div>
                            <button
                              style={{ border: "1px solid #00000020" }}
                              className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                              onClick={() => {
                                setShowFromDatePicker(true);
                              }}
                            >
                              <p>
                                {selectedFromDate
                                  ? selectedFromDate.toDateString()
                                  : "Select Date"}
                              </p>
                              <CalendarDots weight="regular" size={25} />
                            </button>

                            <div>
                              {showFromDatePicker && (
                                <div>
                                  {/* <div className='w-full flex flex-row items-center justify-start -mb-5'>
                                                                    <button>
                                                                        <Image src={"/assets/cross.png"} height={18} width={18} alt='*' />
                                                                    </button>
                                                                </div> */}
                                  <Calendar
                                    onChange={handleFromDateChange}
                                    value={selectedFromDate}
                                    locale="en-US"
                                    onClose={() => {
                                      setShowFromDatePicker(false);
                                    }}
                                    tileClassName={({ date, view }) => {
                                      const today = new Date();

                                      // Highlight the current date
                                      if (
                                        date.getDate() === today.getDate() &&
                                        date.getMonth() === today.getMonth() &&
                                        date.getFullYear() === today.getFullYear()
                                      ) {
                                        return "current-date"; // Add a custom class for current date
                                      }

                                      return null; // Default for other dates
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="w-1/2 h-full">
                          <div
                            style={{
                              fontWeight: "500",
                              fontSize: 12,
                              color: "#00000060",
                              marginTop: 10,
                            }}
                          >
                            To
                          </div>
                          <div>
                            <button
                              style={{ border: "1px solid #00000020" }}
                              className="flex flex-row items-center justify-between p-2 rounded-lg mt-2 w-full justify-between"
                              onClick={() => {
                                setShowToDatePicker(true);
                              }}
                            >
                              <p>
                                {selectedToDate
                                  ? selectedToDate.toDateString()
                                  : "Select Date"}
                              </p>
                              <CalendarDots weight="regular" size={25} />
                            </button>
                            <div>
                              {showToDatePicker && (
                                <div>
                                  {/* <div className='w-full flex flex-row items-center justify-start -mb-5'>
                                                                    <button>
                                                                        <Image src={"/assets/cross.png"} height={18} width={18} alt='*' />
                                                                    </button>
                                                                </div> */}
                                  {/* <Calendar
                              onChange={handleToDateChange}
                              value={selectedToDate}
                              locale="en-US"
                              onClose={() => {
                                setShowToDatePicker(false);
                              }}
                            /> */}
                                  <Calendar
                                    className="react-calendar"
                                    onChange={handleToDateChange}
                                    value={selectedToDate}
                                    locale="en-US"
                                    onClose={() => {
                                      setShowToDatePicker(false);
                                    }}
                                    tileClassName={({ date, view }) => {
                                      const today = new Date();

                                      // Highlight the current date
                                      if (
                                        date.getDate() === today.getDate() &&
                                        date.getMonth() === today.getMonth() &&
                                        date.getFullYear() === today.getFullYear()
                                      ) {
                                        return "current-date"; // Add a custom class for current date
                                      }

                                      return null; // Default for other dates
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight: "500",
                          fontSize: 12,
                          color: "#00000060",
                          marginTop: 10,
                        }}
                      >
                        Status
                      </div>

                      <div className="w-full flex flex-row items-center gap-2 flex-wrap mt-4">
                        {statusList.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setSelectedStatus((prev) => {
                                if (prev.includes(item.status)) {
                                  return prev.filter((s) => s !== item.status);
                                } else {
                                  return [...prev, item.status];
                                }
                              });
                            }}
                          >
                            <div
                              className="py-2 px-3 border rounded-full"
                              style={{
                                color: selectedStatus.includes(item.status)
                                  ? "#fff"
                                  : "",
                                backgroundColor: selectedStatus.includes(item.status)
                                  ? "#7902df"
                                  : "",
                              }}
                            >
                              {item.status}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-row items-center w-full justify-between mt-4 pb-8">
                      <button
                        className="outline-none w-full"
                        style={{ fontSize: 16.8, fontWeight: "600" }}
                        onClick={() => {
                          setSelectedFromDate(null);
                          setSelectedToDate(null);
                          getLeads();
                          // if (typeof window !== "undefined") {
                          //   window.location.reload();
                          // }
                        }}
                      >
                        Reset
                      </button>
                      {sheetsLoader ? (
                        <CircularProgress size={25} />
                      ) : (
                        <button
                          className="bg-purple h-[45px] w-full bg-purple text-white rounded-xl outline-none"
                          style={{
                            fontSize: 16.8,
                            fontWeight: "600",
                            backgroundColor:
                              (selectedFromDate && selectedToDate) ||
                                selectedStatus.length > 0
                                ? ""
                                : "#00000050",
                          }}
                          onClick={() => {
                            // //console.log;
                            if (
                              (selectedFromDate && selectedToDate) ||
                              selectedStatus.length > 0
                            ) {
                              localStorage.removeItem("callDetails");
                              setInitialLoader(true);
                              setCallDetails([]);
                              setFilteredCallDetails([]);
                              setHasMore(true);
                              setShowFilterModal(false);
                              getCallLogs(0);
                            } else {
                              // //console.log;
                            }
                          }}
                        >
                          Apply Filter
                        </button>
                      )}
                    </div>
                  </div>
                </Box>
              </Modal>
            </div>

            {/* Code for details view */}
            {showDetailsModal && (
              <AdminCallDetails
                selectedLead={selectedLeadsDetails}
                showDetailsModal={showDetailsModal}
                setShowDetailsModal={setShowDetailsModal}
              />
            )}

          </div>
        )}
      </div>
    </div>


  );
}

export default AdminDashboardCallLogs;

//styles
const styles = {
  text: {
    fontSize: 15,
    color: "#00000090",
    fontWeight: "600",
  },
  text2: {
    textAlignLast: "left",
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
    whiteSpace: "nowrap", // Prevent text from wrapping
    overflow: "hidden", // Hide overflow text
    textOverflow: "ellipsis", // Add ellipsis for overflow text
  },
  modalsStyle: {
    // height: "auto",
    bgcolor: "transparent",
    p: 2,
    mx: "auto",
    // my: "50vh",
    // transform: "translateY(-55%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
};
