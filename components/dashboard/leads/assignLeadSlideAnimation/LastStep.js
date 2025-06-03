import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, CircularProgress, Modal, Switch, TextField, Tooltip } from '@mui/material';
import AgentSelectSnackMessage, { SnackbarTypes } from '../AgentSelectSnackMessage';
import { CalendarDots, CaretLeft } from '@phosphor-icons/react';
// import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs"; // Import Day.js
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getAgentImage } from "@/utilities/agentUtilities";
import DncConfirmationPopup from "../DncConfirmationPopup";
import { RemoveSmartRefillApi, SmartRefillApi } from '@/components/onboarding/extras/SmartRefillapi';

const LastStep = ({
  selectedLead,
  leadIs,
  selectedAll,
  filters,
  totalLeads = 0,
  userProfile,
  handleBack,
  handleContinue,
  loader,
  lastStepData
}) => {

  const [invalidTimeMessage, setInvalidTimeMessage] = useState(null);

  //snack messages
  const [showSuccessSnack, setShowSuccessSnack] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errTitle, setErrTitle] = useState(null);
  const SelectAgentErrorTimeout = 4000; //change this to change the duration of the snack timer

  const [hasUserSelectedDate, setHasUserSelectedDate] = useState(false);
  const [isDncChecked, setIsDncChecked] = useState(false);
  const [showDncConfirmationPopup, setShowDncConfirmationPopup] = useState(false);
  //leads to send  
  const [NoOfLeadsToSend, setNoOfLeadsToSend] = useState("");
  const [customLeadsToSend, setCustomLeadsToSend] = useState("");
  const [isFocustedCustomLeads, setisFocustedCustomLeads] = useState("");
  //select call  
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [CallNow, setCallNow] = useState("");
  const [CallLater, setCallLater] = useState(false);
  const [isRefill, setIsRefill] = useState(false)
  const [showRefillToogle, setShwRefillToogle] = useState(false);

  const [userLocalDetails, setUserLocalDetails] = useState(null);

  useEffect(() => {
    const localData = userLocalData();
    if (localData) {
      console.log("Local data", localData);
      setUserLocalDetails(localData);
    }
  }, []);

  useEffect(() => {
    if (lastStepData) {
      const {
        selectedDate,
        numberOfLeads,
        cutomLeads,
        isCallNow,
        DncChecked,
        callL
      } = lastStepData;

      // Safely convert to Dayjs
      const parsedDate = selectedDate ? dayjs(selectedDate) : null;
      if (parsedDate) {
        console.log("Date passed is", parsedDate);
        let D = parsedDate?.format()
      }
      // setSelectedDateTime(parsedDate);
      handleDateChange(selectedDate);
      setHasUserSelectedDate(!!selectedDate);

      setNoOfLeadsToSend(numberOfLeads);
      setCustomLeadsToSend(cutomLeads);
      setCallNow(isCallNow);
      setIsDncChecked(DncChecked);
      setCallLater(callL);

      if (cutomLeads) setisFocustedCustomLeads(true);
      else if (numberOfLeads) setNoOfLeadsToSend(totalLeads);
    }
  }, [lastStepData]);


  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setErrorMessage(null);
        setErrTitle(null);
      }, SelectAgentErrorTimeout);
    }
  }, [errorMessage]);


  useEffect(() => {
    const d = localStorage.getItem("User");
    if (d) {
      const Data = JSON.parse(d);
      console.log("Smart refill is", Data.user.smartRefill);
      let show = Data?.user?.smartRefill
      console.log('show', show)

      if (!show) {
        setShwRefillToogle(true)
      }
    }
  }, []);

  //counts leads selected
  function getLeadSelectedCount() {
    if (selectedAll) {
      return totalLeads - leadIs.length;
    } else {
      return leadIs.length;
    }
  }
  useEffect(() => {
    console.log("Selected DateTime Updated:", selectedDateTime?.format());
  }, [selectedDateTime]);


  //date selection
  const handleDateChange = (date) => {
    if (!date || !dayjs(date).isValid()) return;
    console.log("Date value is", date);
    console.log("Date value after daysjs is", dayjs(date));
    setSelectedDateTime(dayjs(date));
    setHasUserSelectedDate(true);
  };


  //go bak
  const handleMoveBack = () => {
    const lastStepData = {
      numberOfLeads: NoOfLeadsToSend,
      cutomLeads: customLeadsToSend,
      selectedDate: selectedDateTime,
      DncChecked: isDncChecked,
      isCallNow: CallNow,
      callL: CallLater
    }
    handleBack(lastStepData);
  }

  //function to update profile
  const handleUpdateProfile = async () => {
    try {
      // setUserDataLoader(true);
      const response = await SmartRefillApi();
      if (response) {
        // setUserDataLoader(false);
        console.log("Response of update profile api is", response);
        if (response.data.status === true) {
          setIsRefill(true);
        } else if (response.data.status === false) {
          // setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      console.error("Error occured in api is", error);
      // setUserDataLoader(false);
    }
  }

  //function to remove smart refill
  const handleRemoveSmartRefill = async () => {
    try {
      // setUserDataLoader(true);
      const response = await RemoveSmartRefillApi();
      if (response) {
        // setUserDataLoader(false);
        console.log("Response of remove smart refill api is", response);
        if (response.data.status === true) {
          // setSuccessSnack(response.data.message);
          setIsRefill(false);
        } else if (response.data.status === false) {
          // setErrorSnack(response.data.message)
        }
      }
    } catch (error) {
      console.error("Error occured in api is", error);
      // setUserDataLoader(false);
    }
  }

  const styles = {
    heading: {
      fontWeight: "600",
      fontSize: 17,
    },
    paragraph: {
      fontWeight: "500",
      fontSize: 12,
    },
    paragraph2: {
      fontWeight: "500",
      fontSize: 12,
    },
    title: {
      fontWeight: "500",
      fontSize: 15,
    },
    modalsStyle: {
      height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-55%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
  };

  return (
    <div>
      <div className="flex flex-row justify-center w-full">
        <AgentSelectSnackMessage
          message={errorMessage}
          title={errTitle}
          isVisible={errorMessage}
          hide={() => {
            //   setIsSnackVisible(false);
            setErrorMessage(null);
            setErrTitle(null);
          }}
          type=""
        />
        <AgentSelectSnackMessage
          className=""
          message={invalidTimeMessage}
          isVisible={invalidTimeMessage}
          hide={() => {
            setInvalidTimeMessage(null);
          }}
        />

        <AgentSelectSnackMessage
          className=""
          message={showSuccessSnack}
          isVisible={showSuccessSnack === null ? false : true}
          hide={() => {
            setShowSuccessSnack(null);
          }}
          type={SnackbarTypes.Success}
        />

        {showDncConfirmationPopup && (
          <DncConfirmationPopup
            open={showDncConfirmationPopup}
            onClose={() => {
              setShowDncConfirmationPopup(false);
              setIsDncChecked(false);
              //
            }}
            onCancel={() => {
              setShowDncConfirmationPopup(false);
              //Unset the dncToggle
              setIsDncChecked(false);
            }}
            onConfirm={() => {
              setShowSuccessSnack("Numbers will be checked on the DNC list");
              setShowDncConfirmationPopup(false);
            }}
            leadsCount={selectedAll ? totalLeads - leadIs.length : leadIs.length}
          />
        )}

        <div
          className="w-full"
          style={{
            backgroundColor: "#ffffff",
            padding: 20,
            borderRadius: "13px",
          }}
        >
          <div className="flex flex-row justify-between">
            <button
              className="flex flex-row items-center justify-center gap-2 bg-[#15151515] h-[34px] w-[92px] rounded-2xl pe-2"
              onClick={handleMoveBack}>
              <CaretLeft size={20} weight="bold" />
              <span style={styles.title}>
                Back
              </span>
            </button>
            <button
              onClick={() => {
                handleMoveBack();
              }}
            >
              <Image
                src={"/assets/cross.png"}
                height={14}
                width={14}
                alt="*"
              />
            </button>
          </div>

          <div className="flex flex-row items-center justify-between mt-6">
            <div
              style={{
                fontWeight: "700",
                fontSize: 24,
              }}
            >
              One last thing
            </div>
            <div className="flex flex-col items-start">
              <div
                className="text-purple"
                style={{ fontSize: 12, fontWeight: "600" }}
              >
                {getLeadSelectedCount()} Contacts Selected
              </div>

              <div className="flex flex-row items-center  -mt-2">
                <Tooltip
                  title="If the lead has given consent, no need to run against DNC"
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "#ffffff", // Ensure white background
                        color: "#333", // Dark text color
                        fontSize: "14px",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                      },
                    },
                    arrow: {
                      sx: {
                        color: "#ffffff", // Match tooltip background
                      },
                    },
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#000000",
                      cursor: "pointer",
                    }}
                  >
                    Check DNC List
                  </div>
                </Tooltip>

                <Switch
                  checked={isDncChecked}
                  // color="#7902DF"
                  // exclusive
                  onChange={(event) => {
                    setIsDncChecked(event.target.checked);
                    if (event.target.checked) {
                      setShowDncConfirmationPopup(true);
                    }
                  }}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#7902DF",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                    {
                      backgroundColor: "#7902DF",
                    },
                    margin: 0,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4" style={styles.heading}>
            Drip calls per day
          </div>

          <div className="flex flex-row items-center gap-8 mt-4">
            <input
              className="w-1/2 flex flex-row items-center p-4 rounded-2xl otline-none focus:ring-0"
              style={{
                border: `${isFocustedCustomLeads
                  ? "2px solid #7902Df"
                  : "1px solid #00000040"
                  }`,
                height: "50px",
              }}
              value={customLeadsToSend}
              onFocus={() => {
                setNoOfLeadsToSend("");
                setisFocustedCustomLeads(true);
              }}
              onChange={(e) => {
                let value = e.target.value;
                if (!/[0-9]/.test(value) && value !== "") return;
                setCustomLeadsToSend(e.target.value);
              }}
              placeholder="Ex: 100"
            />
            <button
              className="w-1/2 flex flex-row items-center p-4 rounded-2xl"
              style={{
                border: NoOfLeadsToSend
                  ? "2px solid #7902DF"
                  : "1px solid #00000040",
                height: "50px",
              }}
              onClick={() => {
                setNoOfLeadsToSend(totalLeads);
                setCustomLeadsToSend("");
                setisFocustedCustomLeads(false);
              }}
            >
              All {getLeadSelectedCount()}
            </button>
          </div>

          <div className="mt-4" style={styles.heading}>
            When to start calling?
          </div>

          <div className="flex flex-row items-center gap-8 mt-4">
            <button
              className="w-1/2 flex flex-col justify-between items-start p-4 rounded-2xl"
              style={{
                border: CallNow
                  ? "2px solid #7902DF"
                  : "1px solid #00000040",
                height: "119px",
              }}
              onClick={() => {
                setHasUserSelectedDate(false);
                const currentDateTime = new Date();
                const currentHour = currentDateTime.getHours(); // Get the current hour (0-23)
                // if (currentHour >= 5 && currentHour < 19) {
                //   //console.log;
                setCallNow(currentDateTime);
                setCallLater(false);
                // } else {
                //   //console.log;
                //   setInvalidTimeMessage(
                //     "❌ Current time is outside 5 AM to 7 PM."
                //   );
                // }
                // console.log(
                //   "Current data is:",
                //   currentDateTime.toLocaleString()
                // );
                setSelectedDateTime(null);
                setHasUserSelectedDate(false);
                // handleDateTimerDifference();
              }}
            >
              <Image
                src={"/assets/callBtn.png"}
                height={24}
                width={24}
                alt="*"
              />
              <div style={styles.title}>Call Now</div>
            </button>
            <div className="w-1/2">
              <button
                className="w-full flex flex-col items-start justify-between p-4 rounded-2xl"
                style={{
                  border: CallLater
                    ? "2px solid #7902DF"
                    : "1px solid #00000040",
                  height: "119px",
                }}
                onClick={() => {
                  setShowFromDatePicker(!showFromDatePicker);
                  setCallNow("");
                  setCallLater(true);
                  setSelectedDateTime(dayjs());
                  setHasUserSelectedDate(true);
                }}
              >
                <CalendarDots size={32} weight="bold" />
                <div style={styles.title}>Schedule Call</div>
              </button>
              {/* <div>
                                      {
                                          showFromDatePicker && (
                                              <div>
                                                  <Calendar
                                                      onChange={handleFromDateChange}
                                                      value={selectedFromDate}
                                                      locale="en-US"
                                                      onClose={() => { setShowFromDatePicker(false) }}
                                                  />
                                              </div>
                                          )
                                      }
                                  </div> */}

              <Modal
                // open={showFromDatePicker}
                onClose={() => setShowFromDatePicker(false)}
                closeAfterTransition
                BackdropProps={{
                  timeout: 1000,
                  sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(5px)",
                  },
                }}
              >
                <Box
                  className="lg:w-4/12 sm:w-7/12 w-8/12"
                  sx={styles.modalsStyle}
                >
                  <div className="flex flex-row justify-center w-full">
                    <div
                      className="w-full flex flex-row justify-center"
                      style={{
                        backgroundColor: "#ffffff",
                        padding: 20,
                        borderRadius: "13px",
                      }}
                    >
                      <div>
                        {/* <Calendar
                                                          onChange={handleFromDateChange}
                                                          value={selectedFromDate}
                                                          locale="en-US"
                                                          onClose={() => { setShowFromDatePicker(false) }}
                                                      /> */}
                        <div className="text-center text-xl font-bold">
                          Select date and time to shedule call
                        </div>
                        <div className="w-full mt-4 flex flex-row justify-center">
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                              value={selectedDateTime}
                              // label="Select date and time"
                              //user profile will be passed to it
                              minDateTime={dayjs().tz(userProfile.timeZone)}
                              //   value={value}
                              sx={{
                                // Date Picker (Large Screen)
                                "& .MuiPickersDay-root.Mui-selected": {
                                  backgroundColor: "#7902DF !important", // Purple background for selected date
                                  color: "white !important",
                                },
                                "& .MuiPickersDay-root:hover": {
                                  backgroundColor: "#a352df !important", // Lighter purple on hover
                                },
                                "& .Mui-selected": {
                                  backgroundColor: "#7902DF !important",
                                  color: "#fff !important",
                                },

                                // Time Picker (Large Screen)
                                "& .MuiClock-pin": {
                                  backgroundColor: "#7902DF !important", // Change clock pin color
                                },
                                "& .MuiClockPointer-root": {
                                  backgroundColor: "#7902DF !important", // Change clock pointer color
                                },
                                "& .MuiClockPointer-thumb": {
                                  borderColor: "#7902DF !important", // Change pointer thumb color
                                },
                                "& .MuiPickersToolbar-root": {
                                  backgroundColor: "#7902DF !important", // Toolbar background purple
                                },
                                "& .MuiTypography-root": {
                                  color: "#7902DF !important", // Header text color
                                },

                                // Time Selection List (Large Screen)
                                "& .MuiPickersTimeClock-root .Mui-selected":
                                {
                                  backgroundColor: "#7902DF !important", // Purple selected time
                                  color: "white !important",
                                },
                                "& .MuiPickersTimeClock-root .MuiButtonBase-root:hover":
                                {
                                  backgroundColor: "#a352df !important", // Lighter purple on hover
                                },

                                // Time Picker List (Dropdown List)
                                "& .MuiTimeClock-root .Mui-selected": {
                                  backgroundColor: "#7902DF !important",
                                  color: "white !important",
                                },
                                "& .MuiTimeClock-root .MuiButtonBase-root:hover":
                                {
                                  backgroundColor: "#a352df !important",
                                },
                              }}
                              onChange={handleDateChange}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  size="small"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "10px",
                                      "& fieldset": {
                                        borderColor: hasUserSelectedDate ? "#7902df" : "#00000050",
                                        borderWidth: "2px",
                                      },
                                      "&:hover fieldset": {
                                        borderColor: hasUserSelectedDate ? "#7902df" : "#00000050",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: hasUserSelectedDate ? "#7902df" : "#00000050",
                                      },
                                    },
                                  }}
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </div>
                        <div className="w-full flex flex-row justify-center mt-6">
                          <button
                            className="w-7/12 h-[50px] bg-purple rounded-xl text-white font-bold"
                            onClick={() => {
                              setShowFromDatePicker(false);
                            }}
                          >
                            Select & close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Box>
              </Modal>
            </div>
          </div>

          {CallLater && (
            <div>
              <div
                className="mt-4"
                style={{
                  fontWeight: "500",
                  fontsize: 12,
                  color: "#00000050",
                }}
              >
                Select date & time
              </div>
              <div className="mt-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    // label="Select date and time"
                    // minDateTime={dayjs()}
                    value={selectedDateTime}
                    minDate={dayjs()}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        sx: {
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            "& fieldset": {
                              borderColor: hasUserSelectedDate
                                ? "#7902df"
                                : "#00000050", // Purple if selected, red otherwise
                              borderWidth: "2px",
                            },
                            "&:hover fieldset": {
                              borderColor: hasUserSelectedDate
                                ? "#7902df"
                                : "#00000050",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: hasUserSelectedDate
                                ? "#7902df"
                                : "#00000050",
                            },
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiPickersDay-root.Mui-selected": {
                        backgroundColor: "#7902DF !important", // Change selected date color to purple
                        color: "white !important",
                      },
                      "& .MuiPickersDay-root:hover": {
                        backgroundColor: "#a352df !important", // Lighter purple on hover
                      },
                      "& .MuiButtonBase-root.MuiPickersDay-root:not(.Mui-selected)":
                      {
                        color: "#333 !important", // Default color for unselected dates
                      },
                      "& .Mui-selected": {
                        backgroundColor: "#7902DF !important",
                        color: "#fff !important",
                      },
                      "& .MuiClock-pin": {
                        backgroundColor: "#7902DF !important", // Change clock pin color
                      },
                      "& .MuiClockPointer-root": {
                        backgroundColor: "#7902DF !important", // Change clock pointer color
                      },
                      "& .MuiClockPointer-thumb": {
                        borderColor: "#7902DF !important", // Change pointer thumb color
                      },
                    }}
                    renderInput={(params) => (
                      <input
                        {...params.inputProps}
                        style={{
                          border: "red", // Disable border
                          outline: "none",
                          padding: "8px",
                          backgroundColor: "#f9f9f9", // Optional: subtle background for better visibility
                        }}
                        onFocus={(e) => {
                          e.target.style.border = "none"; // Ensure no border on focus
                          e.target.style.outline = "none"; // Ensure no outline on focus
                        }}
                        onBlur={(e) => {
                          e.target.style.border = "none"; // Reset border on blur
                          e.target.style.outline = "none"; // Reset outline on blur
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.border = "none"; // Remove border on hover
                          e.target.style.outline = "none"; // Remove outline on hover
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.border = "none"; // Reset border on hover out
                          e.target.style.outline = "none"; // Reset outline on hover out
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
            </div>
          )}

          {
            showRefillToogle && (
              <div className='flex flex-col items-center w-full p-3 rounded-xl w-full mt-3'
                style={{ backgroundColor: '#D9D9D930' }}
              >
                <div
                  className='flex flex-row items-center justify-between w-full'
                >
                  <div style={{ fontsize: 16, fontWeight: '600', color: 'black' }}>
                    {`Turn on smart refill`}
                  </div>

                  <Switch
                    checked={isRefill}
                    // color="#7902DF"
                    // exclusive

                    onChange={() => {
                      setIsRefill(!isRefill);
                      if (isRefill === true) {
                        handleRemoveSmartRefill();
                      } else if (isRefill === false) {
                        handleUpdateProfile();
                      }
                    }}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#7902DF",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                      {
                        backgroundColor: "#7902DF",
                      },
                      margin: 0,
                    }}
                  />
                </div>

                <div style={{ fontsize: 14, fontWeight: '500', color: 'black' }}>
                  Avoid interruption when you are making calls and always make sure your AI has minutes to work with
                </div>
              </div>
            )
          }


          {loader ? (
            <div className="mt-4 w-full flex flex-row items-center justify-center">
              <CircularProgress size={30} />
            </div>
          ) : (
            <div className="w-full">
              {(NoOfLeadsToSend || customLeadsToSend) &&
                (CallNow ||
                  (CallLater && selectedDateTime && hasUserSelectedDate)) ? (
                <button
                  className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
                  onClick={() => {
                    const localData = localStorage.getItem("User");
                    // if (localData) {
                    //   const UserDetails = JSON.parse(localData);
                    //   console.log(UserDetails.user.smartRefill);
                    //   if (UserDetails.user.smartRefill === false) {
                    //     // setShowSmartRefillPopUp(true);
                    //     //handle continue here
                    //     return;
                    //   }
                    // }
                    const lastStepData = {
                      // numberOfLeads: NoOfLeadsToSend,
                      numberOfLeads: getLeadSelectedCount(),
                      cutomLeads: customLeadsToSend,
                      selectedDate: selectedDateTime,
                      DncChecked: isDncChecked,
                      isCallNow: CallNow,
                      callL: CallLater
                    }
                    handleContinue(lastStepData);
                    //triger assign lead api here
                    // handleAssignLead();
                    // handleAssigLead()
                  }}
                >
                  Continue
                </button>
              ) : (
                <button
                  className="text-[#000000] w-full h-[50px] rounded-lg bg-[#00000020] mt-4"
                  disabled={true}
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {/* <div className='mt-4 w-full'>
                              <button className="text-white bg-purple rounded-xl w-full h-[50px]" style={styles.heading} onClick={() => { setLastStepModal(false) }}>
                                  Continue
                              </button>
                          </div> */}

          {/* Can be use full to add shadow */}
          {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
        </div>
      </div>
    </div>
  )
}

export default LastStep
