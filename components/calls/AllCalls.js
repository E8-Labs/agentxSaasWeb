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
import parsePhoneNumberFromString from "libphonenumber-js";
import InfiniteScroll from "react-infinite-scroll-component";
import LeadDetails from "../dashboard/leads/extras/LeadDetails";
import { convertUTCToTimezone } from "@/utilities/utility";

function AllCalls() {
  const [searchValue, setSearchValue] = useState("");

  // const callDetails = [
  //   {
  //     id: 1, name: "Rayna Passaquindici Arcand", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  //   {
  //     id: 2, name: "Gretchen Workman", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  //   {
  //     id: 3, name: "Zain Baptista", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  //   {
  //     id: 4, name: "Jordyn Korsgaard", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  //   {
  //     id: 5, name: "Lincoln Stanton", email: 'arslan@gmail.com', date: 'jul 19,2024', duration: '3:43',
  //     stage: 'New Lead', status: 'voicemail', time: "12:12 pm", phone: '00000001212'
  //   },
  // ];

  const [callDetails, setCallDetails] = useState([]);
  const [filteredCallDetails, setFilteredCallDetails] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);

  //code for filter call log details
  //variabl for deltag
  const [DelTagLoader, setDelTagLoader] = useState(null);

  const [AssignLeadModal, setAssignLeadModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const [showToDatePicker, setShowToDatePicker] = useState(false);

  const [sheetsLoader, setSheetsLoader] = useState(false);

  //code for pipelines
  const [pipelinesList, setPipelinesList] = useState([]);
  const [stagesList, setStagesList] = useState([]);

  //code for details modal
  const [selectedLeadsDetails, setselectedLeadsDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  console.log("Status of modal1 is", showDetailsModal);

  const [selectedPipeline, setSelectedPipeline] = useState("");
  const [selectedStageIds, setSelectedStageIds] = useState([]);

  //code for pagination
  const [offset, setOffset] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const requestVersion = useRef(0);

  useEffect(() => {
    if ((selectedFromDate && selectedToDate) || selectedStageIds.length > 0) {
      setCallDetails([]);
      setFilteredCallDetails([]);
      setInitialLoader(true);
      getCallLogs(0);
    }
  }, [selectedToDate, selectedFromDate, selectedStageIds]);

  //select pipeline
  const handleChangePipeline = (event) => {
    const selectedValue = event.target.value;
    setSelectedPipeline(event.target.value);

    const selectedItem = pipelinesList.find(
      (item) => item.title === selectedValue
    );
    console.log("Selected Item:", selectedItem.stages);
    // setSelectedPipelineItem(selectedItem);
    setStagesList(selectedItem.stages);
    // setSelectedPipelineStages(selectedItem.stages);
  };

  function getFilterTitle(filter) {
    if (filter.key == "date") {
      let string = "";
      let values = filter.values;
      if (values.length > 0) {
        string = moment(values[0]).format("MMM Do") + "";
        if (values.length > 1) {
          string = `${string} - 
            ${moment(values[1]).format("MMM Do")}`;
        }
        return string;
      }

      return string;
    }
    if (filter.key == "stage") {
      let values = filter.values;
      if (values.length > 0) {
        let stageTitle = values[0].stageTitle;
        return stageTitle;
      }
      return "";
    }
    if (filter.key == "pipeline") {
      let values = filter.values;
      if (values.length > 0) {
        let stageTitle = values[0];
        return stageTitle;
      }
      return "";
    }
  }

  function GetFiltersFromSelection() {
    let filters = [];
    if (selectedFromDate && selectedToDate) {
      let dateFilter = {
        key: "date",
        values: [selectedFromDate, selectedToDate],
      };
      filters.push(dateFilter);
    }
    // if (selectedPipeline) {
    //   let dateFilter = {
    //     key: "pipeline",
    //     values: [selectedPipeline],
    //   };
    //   filters.push(dateFilter);
    // }
    if (selectedStageIds && selectedStageIds.length > 0) {
      let currentSelectedStages = [];
      stagesList.map((stage) => {
        if (selectedStageIds.includes(stage.id)) {
          currentSelectedStages.push(stage);
        }
      });

      if (currentSelectedStages.length > 0) {
        currentSelectedStages.map((stage) => {
          let dateFilter = {
            key: "stage",
            values: [stage],
          };
          filters.push(dateFilter);
        });
      }
    }

    return filters;
  }

  useEffect(() => {
    // const localPipelines = localStorage.getItem("pipelinesData");
    // if (localPipelines) {
    //   const PipelineDetails = JSON.parse(localPipelines);
    //   console.log("Pipelines recieved from localstorage are:", PipelineDetails);
    //   setPipelinesList(PipelineDetails);
    //   setSelectedPipeline(PipelineDetails[0].title);
    //   setStagesList(PipelineDetails[0].stages);
    // }

    getPipelines();

    const localCalls = localStorage.getItem("calldetails");
    if (localCalls) {
      const localCallData = JSON.parse(localCalls);
      setCallDetails(localCallData);
      setFilteredCallDetails(localCallData);
    } else {
      getCallLogs();
    }

    setInitialLoader(true);
  }, []);

  //function for getting pipelines
  const getPipelines = async () => {
    try {
      const ApiPath = Apis.getPipelines;
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }

      console.log("Auth token is :", AuthToken);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of getPipelines api is :--", response.data.data);

        if (response.data.status === true) {
          setPipelinesList(response.data.data);
          setSelectedPipeline(response.data.data[0].title);
          setStagesList(response.data.data[0].stages);
        }
      }
    } catch (error) {
      console.error("Error occured in get pipelies api is :", error);
    } finally {
      console.log("Api call completed");
    }
  };

  //code for getting call log details
  const getCallLogs = async (offset = null) => {
    const currentRequestVersion = ++requestVersion.current;
    console.log("Offset passed is ", offset);
    try {
      setLoading(true);

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const Data = JSON.parse(localData);
        console.log("Localdata recieved is :--", Data.token);
        AuthToken = Data.token;
      }

      const startDate = moment(selectedFromDate).format("MM-DD-YYYY");
      const endDate = moment(selectedToDate).format("MM-DD-YYYY");

      const stages = selectedStageIds.join(",");
      console.log("Sages selected are ", stages);

      let ApiPath = null;

      if (offset == null) {
        offset = filteredCallDetails.length;
      }
      if ((selectedFromDate && selectedToDate) || stages.length > 0) {
        ApiPath = `${Apis.getCallLogs}?startDate=${startDate}&endDate=${endDate}&stageIds=${stages}&offset=${offset}`;
      } else {
        ApiPath = `${Apis.getCallLogs}?offset=${offset}`; //Apis.getCallLogs;
      }

      // if (selectedFromDate && selectedToDate && stages.length > 0) {
      //     ApiPath = `${Apis.getCallLogs}?startDate=${startDate}&endDate=${endDate}&stageIds=${stages}&offset=${offset}&limit=10`;
      // }

      console.log("Api path is", ApiPath);

      // console.log("Auth token is:", AuthToken);
      // return
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (currentRequestVersion === requestVersion.current) {
        if (response) {
          console.log("response of get call logs api is :", response.data);
          // setCallDetails(response.data.data);
          // setFilteredCallDetails(response.data.data);

          const data = response.data.data;
          localStorage.setItem("callDetails", response.data.data);
          setCallDetails((prevDetails) => [...prevDetails, ...data]);
          setFilteredCallDetails((prevDetails) => [...prevDetails, ...data]);

          if (data.length < 50) {
            setHasMore(false);
          }
          // setOffset((prevOffset) => prevOffset + 5);
        }
      }
    } catch (error) {
      console.error("Error occured in gtting calls log api is:", error);
    } finally {
      setInitialLoader(false);
    }
  };

  //fetch more data from api
  const fetchMoreData = () => {
    if (!loading && hasMore) {
      setLoading(true); // Prevent multiple fetches during loading
    }
  };

  //code to filter search
  const handleSearchChange = (value) => {
    if (value.trim() === "") {
      // console.log("Should reset to original");
      // Reset to original list when input is empty
      setFilteredCallDetails(callDetails);
      return;
    }

    const filtered = callDetails.filter((item) => {
      const term = value.toLowerCase();
      return (
        item.LeadModel?.firstName.toLowerCase().includes(term) ||
        // item.LeadModel?.lastName.toLowerCase().includes(term) ||
        // item.LeadModel?.address.toLowerCase().includes(term) ||
        item.LeadModel?.email.toLowerCase().includes(term) ||
        (item.LeadModel?.phone && callDetails.LeadModel?.phone.includes(term))
      );
    });

    setFilteredCallDetails(filtered);
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

  //code to select stage
  const handleSelectStage = (item) => {
    // setSelectedStage(item);
    setSelectedStageIds((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id];
      }
    });
  };

  //function to format phone number
  //code for formating the number
  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
    );
    // console.log("Raw number is", rawNumber);
    return phoneNumber
      ? phoneNumber.formatInternational()
      : "Invalid phone number";
  };

  const [filterData, setFilterData] = useState({
    fromdate: "",
    todate: "",
    stages: [
      {
        id: "",
        title: "",
      },
    ],
  });

  return (
    <div className="w-full items-start">
      <div className="flex w-full pl-10 flex-row items-center gap-3">
        <div className="flex w-3/12 items-center border border-gray-300 rounded-lg px-4 max-w-md shadow-sm flex-shrink-0">
          <input
            type="text"
            placeholder="Search by name, email or phone"
            className="flex-grow outline-none text-gray-600 placeholder-gray-400 border-none focus:outline-none focus:ring-0 flex-shrink-0"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              handleSearchChange(value);
              setSearchValue(e.target.value);
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
          style={{
            scrollbarColor: "#00000000",
            scrollbarWidth: "none",
          }}
        >
          {GetFiltersFromSelection().map((filter, index) => {
            ////console.log("Showing Filter ", filter);
            return (
              <div className="flex-shrink-0" key={filter.key + index}>
                <div
                  className="px-4 py-2 bg-[#402FFF10] text-purple  flex-shrink-0 [#7902DF10] rounded-[25px] flex flex-row items-center gap-2"
                  style={{ fontWeight: "500", fontSize: 15 }}
                >
                  {getFilterTitle(filter)}
                  <button
                    className="outline-none"
                    onClick={() => {
                      if (filter.key == "date") {
                        setSelectedFromDate(null);
                        setSelectedToDate(null);
                      }
                      if (filter.key == "stage") {
                        const newStageIds = selectedStageIds.filter(
                          (stageId) => stageId != filter.values[0].id
                        );
                        setSelectedStageIds(newStageIds);
                      }
                      setInitialLoader(true);
                      setCallDetails([]);
                      setFilteredCallDetails([]);
                      setTimeout(() => {
                        // getCallLogs(0);
                      }, 2000);
                    }}
                  >
                    <Image
                      src={"/otherAssets/crossIcon.png"}
                      height={20}
                      width={20}
                      alt="*"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full flex flex-row justify-between mt-10 px-10 mt-12">
        <div className="w-2/12">
          <div style={styles.text}>Name</div>
        </div>
        <div className="w-2/12 ">
          <div style={styles.text}>Pipeline</div>
        </div>
        <div className="w-2/12">
          <div style={styles.text}>Contact Number</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Stage</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Status</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Date</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>Time stamp</div>
        </div>
        <div className="w-1/12">
          <div style={styles.text}>More</div>
        </div>
      </div>

      {initialLoader ? (
        <div className="w-full flex flex-row items-center justify-center mt-12">
          <CircularProgress size={35} thickness={2} />
        </div>
      ) : (
        // <InfiniteScroll
        //     dataLength={filteredCallDetails.length} // Current list length
        //     next={getCallLogs} // Fetch more data
        //     hasMore={hasMore} // Whether there's more data to fetch
        //     loader={<CircularProgress size={35} thickness={2} />}
        //     endMessage={<div className='text-center mt-4'>No more call logs</div>}
        // >

        // </InfiniteScroll>

        <div
          className="max-h-[67vh] overflow-auto"
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
              console.log("Loading more data");
              getCallLogs();
            }} // Fetch more when scrolled
            hasMore={hasMore} // Check if there's more data
            loader={
              <div className="w-full flex flex-row justify-center mt-8">
                <CircularProgress size={35} />
              </div>
            }
            style={{ overflow: "unset" }}
          >
            {filteredCallDetails.length > 0 ? (
              <div>
                {filteredCallDetails.map((item) => (
                  <div
                    key={item.id}
                    className="w-full flex flex-row justify-between items-center mt-10 px-10"
                  >
                    <div className="w-2/12 flex flex-row gap-2 items-center">
                      <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                        {item.LeadModel?.firstName.slice(0, 1).toUpperCase()}
                      </div>
                      <div style={styles.text2}>
                        {item.LeadModel?.firstName}
                      </div>
                    </div>
                    <div className="w-2/12 ">
                      <div style={styles.text2}>
                        {item.pipeline ? (
                          <div>{item.pipeline?.title}</div>
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
                        {item?.PipelineStages?.stageTitle
                          ? item.PipelineStages?.stageTitle
                          : "No Stage"}
                      </div>
                    </div>
                    <div className="w-1/12">
                      <div style={styles.text2}>
                        {item?.callOutcome ? item?.callOutcome : "Ongoing"}
                      </div>
                    </div>
                    <div className="w-1/12">
                      <div style={styles.text2}>
                        {moment(
                          convertUTCToTimezone(item.createdAt || "")
                        ).format("MM/DD/YYYY")}
                      </div>
                    </div>
                    <div className="w-1/12">
                      <div style={styles.text2}>
                        {moment(
                          convertUTCToTimezone(item.createdAt || "")
                        ).format("HH:mm:ss A")}
                      </div>
                    </div>
                    <div className="w-1/12">
                      <button
                        onClick={() => {
                          console.log("Selected item is", item);
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
            className="lg:w-4/12 sm:w-7/12 w-8/12 bg-white py-2 px-6 h-[60vh] overflow-auto"
            sx={{
              ...styles.modalsStyle,
              scrollbarWidth: "none",
              backgroundColor: "white",
            }}
          >
            <div className="w-full flex flex-col items-center justify-between h-full">
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
                            <Calendar
                              onChange={handleToDateChange}
                              value={selectedToDate}
                              locale="en-US"
                              onClose={() => {
                                setShowToDatePicker(false);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <FormControl fullWidth>
                    {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
                    <Select
                      value={selectedPipeline}
                      onChange={handleChangePipeline}
                      displayEmpty // Enables placeholder
                      renderValue={(selected) => {
                        if (!selected) {
                          return (
                            <div style={{ color: "#aaa" }}>Select pipeline</div>
                          ); // Placeholder style
                        }
                        return selected;
                      }}
                      sx={{
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
                      {pipelinesList.map((item, index) => (
                        <MenuItem
                          key={item.id}
                          style={styles.dropdownMenu}
                          value={item.title}
                        >
                          {item.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div
                  className="mt-6"
                  style={{
                    fontWeight: "500",
                    fontSize: 12,
                    color: "#00000060",
                    marginTop: 10,
                  }}
                >
                  Stage
                </div>

                <div className="w-full flex flex-wrap gap-4">
                  {stagesList.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-row items-center mt-2 justify-start"
                      style={{ fontSize: 15, fontWeight: "500" }}
                    >
                      <button
                        onClick={() => {
                          handleSelectStage(item);
                        }}
                        className={`p-2 border border-[#00000020] ${
                          selectedStageIds.includes(item.id)
                            ? `bg-purple`
                            : "bg-transparent"
                        } px-6
                                                                ${
                                                                  selectedStageIds.includes(
                                                                    item.id
                                                                  )
                                                                    ? `text-white`
                                                                    : "text-black"
                                                                } rounded-2xl`}
                      >
                        {item.stageTitle}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-row items-center w-full justify-between mt-4 pb-8">
                <button
                  className="outline-none w-full"
                  style={{ fontSize: 16.8, fontWeight: "600" }}
                  onClick={() => {
                    // setSelectedFromDate(null);
                    // setSelectedToDate(null);
                    // setSelectedStage(null);
                    // getLeads()
                    window.location.reload();
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
                        selectedStageIds.length > 0
                          ? ""
                          : "#00000050",
                    }}
                    onClick={() => {
                      if (
                        (selectedFromDate && selectedToDate) ||
                        selectedStageIds.length > 0
                      ) {
                        localStorage.removeItem("callDetails");
                        // setInitialLoader(true);
                        // setCallDetails([]);
                        // setFilteredCallDetails([]);
                        setShowFilterModal(false);
                        // getCallLogs(0);
                      } else {
                        console.log("Cannot continue");
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
        <LeadDetails
          selectedLead={selectedLeadsDetails?.LeadModel?.id}
          pipelineId={selectedLeadsDetails?.PipelineStages?.pipelineId}
          showDetailsModal={showDetailsModal}
          setShowDetailsModal={setShowDetailsModal}
          hideDelete={true}
        />
      )}
    </div>
  );
}

export default AllCalls;

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
