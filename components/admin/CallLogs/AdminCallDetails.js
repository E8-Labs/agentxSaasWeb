import Apis from "@/components/apis/Apis";
import {
  Alert,
  Box,
  CircularProgress,
  Fade,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Popover,
  Select,
  Snackbar,
  TextareaAutosize,
} from "@mui/material";
import {
  CaretDown,
  CaretUp,
  EnvelopeSimple,
  Plus,
  X,
} from "@phosphor-icons/react";
import axios from "axios";
import parsePhoneNumberFromString from "libphonenumber-js";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { GetFormattedDateString } from "@/utilities/utility";
import LeadTeamsAssignedList from "@/components/dashboard/leads/LeadTeamsAssignedList";
import SelectStageDropdown from "@/components/dashboard/leads/StageSelectDropdown";
import { AssignTeamMember } from "@/components/onboarding/services/apisServices/ApiService";
import CircularLoader from "@/utilities/CircularLoader";
import { getAgentsListImage } from "@/utilities/agentUtilities";
import { capitalize } from "@/utilities/StringUtility";

const AdminCallDetails = ({
  showDetailsModal,
  selectedLead,
  setShowDetailsModal,
  noBackDrop = false,
  
}) => {


  const [initialLoader, setInitialLoader] = useState(false);

  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null);

  //code for emailPopup
  const [showAllEmails, setShowAllEmails] = useState(false);

  //code for call activity transcript text
  const [isExpanded, setIsExpanded] = useState([]);
  const [isExpandedActivity, setIsExpandedActivity] = useState([]);


  //code for audio play popup
  const [showAudioPlay, setShowAudioPlay] = useState(null);
  const [showNoAudioPlay, setShowNoAudioPlay] = useState(false);


  //variable for gtteam loader
  useEffect(() => {
    getLeadDetails(selectedLead);

  }, []);

  //function to get the lead detils
  const getLeadDetails = async (selectedLead) => {
    try {
      setInitialLoader(true);
      // console.log("I am trigered");
      let AuthToken = null;

      const localDetails = localStorage.getItem("User");
      if (localDetails) {
        const Data = JSON.parse(localDetails);
        //// console.log("User details are", Data);
        AuthToken = Data.token;
      }

      // console.log("Auth token is", AuthToken);

      const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedLead}`;

      // console.log("Apipath is", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // console.log("Lead details Response of api is", response.data);
        let dynamicColumns = [];
        dynamicColumns = [
          ...response?.data?.columns,
          // { title: "Tag" },
          {
            title: "More",
            idDefault: false,
          },
        ];
        // setLeadColumns(response.data.columns);
        setSelectedLeadsDetails(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setInitialLoader(false);
      // console.log("Api call completed");
    }
  };

  const formatPhoneNumber = (rawNumber) => {
    const phoneNumber = parsePhoneNumberFromString(
      rawNumber?.startsWith("+") ? rawNumber : `+${rawNumber}`
    );
    //// console.log("Raw number is", rawNumber);
    return phoneNumber
      ? phoneNumber.formatInternational()
      : "Invalid phone number";
  };


  //fucntion to ShowMore ActivityData transcript text
  const handleShowMoreActivityData = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpandedActivity((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id];
      }
    });
  };


  //fucntion to read more transcript text
  const handleReadMoreToggle = (item) => {
    // setIsExpanded(!isExpanded);

    setIsExpanded((prevIds) => {
      if (prevIds.includes(item.id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== item.id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, item.id];
      }
    });
  };



  const styles = {
    modalsStyle: {
      // height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
    subHeading: {
      fontsize: 12,
      fontWeight: "500",
      color: "#15151560",
    },
  };


  return (
    <div className="h-[100svh]">
      <Modal
        open={showDetailsModal}
        closeAfterTransition
        onClose={() => {
          setShowDetailsModal(false);
        }}
        BackdropProps={{
          sx: {
            backgroundColor: noBackDrop ? "#00000002" : "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box
          className="lg:w-6/12 sm:w-7/12 w-8/12 bg-white py-2 h-[95svh] overflow-y-auto"
          sx={{
            ...styles.modalsStyle,
            scrollbarWidth: "none",
            backgroundColor: "white", //overflowY: "auto"
          }}
        >
          <div className="w-full flex flex-col items-center h-full">



            <div className="w-full">
              {initialLoader ? (
                <div className="w-full flex flex-row items-center justify-center mt-24">
                  <CircularProgress size={45} thickness={2} />
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      padding: 20,
                      paddingInline: 30,
                    }}
                  >
                    <div className="flex flex-row justify-between items-center">
                      <div style={{ fontWeight: "500", fontSize: 16.9 }}>
                        Details
                      </div>
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                        }}
                      >
                        <Image
                          src={"/assets/crossIcon.png"}
                          height={40}
                          width={40}
                          alt="*"
                        />
                      </button>
                    </div>

                    <div className="flex flex-row items-center justify-between mt-4">
                      <div className="flex flex-row items-center gap-4">
                        <div
                          className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                          onClick={() => handleToggleClick(item.id)}
                        >
                          {selectedLeadsDetails?.firstName.slice(0, 1)}
                        </div>
                        <div
                          className="truncate"
                          onClick={() => handleToggleClick(item.id)}
                        >
                          {selectedLeadsDetails?.firstName}{" "}
                          {selectedLeadsDetails?.lastName}
                        </div>
                      </div>

                    </div>

                    <div className="flex flex-row items-center w-full justify-between mt-4">
                      <div className="flex flex-row items-center gap-2">
                        <EnvelopeSimple size={20} color="#00000060" />
                        <div style={styles.subHeading}>Email Address</div>
                      </div>
                      <div>
                        <div className="text-end" style={styles.heading2}>
                          {selectedLeadsDetails?.email ? (
                            selectedLeadsDetails?.email
                          ) : (
                            <div>
                              {selectedLeadsDetails?.emails
                                ?.slice(0, 1)
                                .map((email, emailIndex) => {
                                  return (
                                    <div
                                      key={emailIndex}
                                      className="flex flex-row items-center gap-2"
                                    >
                                      <div
                                        className="flex flex-row items-center gap-2 px-1 mt-1 rounded-lg border border-[#00000020]"
                                        style={styles.paragraph}
                                      >
                                        <Image
                                          src={"/assets/power.png"}
                                          height={9}
                                          width={7}
                                          alt="*"
                                        />
                                        <div>
                                          <span className="text-purple">
                                            New
                                          </span>{" "}
                                          {email.email}
                                        </div>
                                      </div>
                                      <button
                                        className="text-purple underline"
                                        onClick={() => {
                                          setShowAllEmails(true);
                                        }}
                                      >
                                        {selectedLeadsDetails?.emails?.length >
                                          1
                                          ? `+${selectedLeadsDetails?.emails
                                            ?.length - 1
                                          }`
                                          : ""}
                                      </button>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedLeadsDetails?.email && (
                      <div className="flex flex-row w-full justify-end">
                        {selectedLeadsDetails?.emails
                          ?.slice(0, 1)
                          .map((email, emailIndex) => {
                            return (
                              <div
                                key={emailIndex}
                                className="flex flex-row items-center gap-2"
                              >
                                <div
                                  className="flex flex-row items-center gap-2 px-1 mt-1 rounded-lg border border-[#00000020]"
                                  style={styles.paragraph}
                                >
                                  <Image
                                    src={"/assets/power.png"}
                                    height={9}
                                    width={7}
                                    alt="*"
                                  />
                                  <div>
                                    <span className="text-purple">New</span>{" "}
                                    {email.email}
                                  </div>
                                </div>
                                <button
                                  className="text-purple underline"
                                  onClick={() => {
                                    setShowAllEmails(true);
                                  }}
                                >
                                  {selectedLeadsDetails?.emails?.length > 1
                                    ? `+${selectedLeadsDetails?.emails?.length - 1
                                    }`
                                    : ""}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Modal for All Emails */}
                    <Modal
                      open={showAllEmails}
                      onClose={() => setShowAllEmails(null)}
                      closeAfterTransition
                      BackdropProps={{
                        timeout: 1000,
                        sx: {
                          backgroundColor: "#00000020",
                          // //backdropFilter: "blur(20px)",
                        },
                      }}
                    >
                      <Box
                        className="lg:w-5/12 sm:w-full w-8/12"
                        sx={styles.modalsStyle}
                      >
                        <div className="flex flex-row justify-center w-full">
                          <div
                            className="sm:w-full w-full"
                            style={{
                              backgroundColor: "#ffffff",
                              padding: 20,
                              borderRadius: "13px",
                            }}
                          >
                            <div>
                              {selectedLeadsDetails?.emails.map(
                                (email, emailIndex) => {
                                  return (
                                    <div key={emailIndex}>
                                      <div
                                        className="flex flex-row items-center gap-2 px-1 mt-2 rounded-lg py-2 border border-[#00000020]"
                                        style={styles.paragraph}
                                      >
                                        <Image
                                          src={"/assets/power.png"}
                                          height={9}
                                          width={7}
                                          alt="*"
                                        />
                                        <div>
                                          <span className="text-purple">
                                            New
                                          </span>{" "}
                                          {email?.email}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                            <div className="mt-4">
                              <button
                                onClick={() => {
                                  setShowAllEmails(false);
                                }}
                                className="h-[50px] rounded-xl bg-purple text-white w-full"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </Box>
                    </Modal>

                    <div className="flex flex-row items--center w-full justify-between mt-4">
                      <div className="flex flex-row items-center gap-2">
                        {/* <EnvelopeSimple size={20} color='#00000060' /> */}
                        <Image
                          src={"/assets/call.png"}
                          height={16}
                          width={16}
                          alt="man"
                        />
                        <div style={styles.subHeading}>Phone Number</div>
                      </div>
                      <div className="text-end" style={styles.paragraph}>
                        {/* {selectedLeadsDetails?.phone} */}
                        {formatPhoneNumber(selectedLeadsDetails?.phone) || "-"}
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-2 mt-4">
                      {/* <EnvelopeSimple size={20} color='#00000060' /> */}

                      <div style={{
                        fontsize: 12,
                        fontWeight: "500",
                        color: "#151515",
                      }}>Call Recordings</div>
                    </div>
                    <div style={{ paddingInline: 30 }}>
                      <div>
                        {selectedLeadsDetails?.callActivity.length < 1 ? (
                          <div
                            className="flex flex-col items-center justify-center mt-12 w-full"
                            style={{ fontWeight: "500", fontsize: 15 }}
                          >
                            <div className="h-[52px] w-[52px] rounded-full bg-[#00000020] flex flex-row items-center justify-center">
                              <Image
                                src={"/assets/activityClock.png"}
                                height={24}
                                width={24}
                                alt="*"
                              />
                            </div>
                            <div className="mt-4">
                              <i style={{ fontWeight: "500", fontsize: 15 }}>
                                All activities related to this lead will be
                                shown here
                              </i>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {selectedLeadsDetails?.callActivity.map(
                              (item, index) => {
                                const initialTextLength = Math.ceil(
                                  item.transcript?.length * 0.1
                                ); // 40% of the text
                                const initialText = item.transcript?.slice(
                                  0,
                                  initialTextLength
                                );
                                return (
                                  <div key={index} className="mt-4">
                                    <div
                                      className="-ms-4"
                                      style={{
                                        fontsize: 15,
                                        fontWeight: "500",
                                        color: "#15151560",
                                      }}
                                    >
                                      {GetFormattedDateString(
                                        item?.createdAt,
                                        true
                                      )}
                                    </div>
                                    <div className="w-full flex flex-row items-center gap-2 h-full">
                                      <div
                                        className="pb-4 pt-6 ps-4 w-full"
                                        style={{
                                          borderLeft: "1px solid #00000020",
                                        }}
                                      >
                                        <div className="h-full w-full">
                                          <div className="flex flex-row items-center justify-between">
                                            <div className="flex flex-row items-center gap-1">
                                              <div
                                                style={{
                                                  fontWeight: "600",
                                                  fontsize: 15,
                                                }}
                                              >
                                                Outcome
                                              </div>
                                              {/* <div className='text-purple' style={{ fontWeight: "600", fontsize: 12 }}>
                                                                                                        {selectedLeadsDetails?.firstName} {selectedLeadsDetails?.lastName}
                                                                                                    </div> */}
                                            </div>
                                            <button
                                              className="text-end flex flex-row items-center gap-1"
                                              style={styles.paragraph}
                                              onClick={() => {
                                                handleShowMoreActivityData(
                                                  item
                                                );
                                              }}
                                            >
                                              <div
                                                className="h-[10px] w-[10px] rounded-full"
                                                style={{
                                                  backgroundColor:
                                                    selectedLeadsDetails?.stage
                                                      ?.defaultColor,
                                                }}
                                              ></div>
                                              {item?.callOutcome
                                                ? item?.callOutcome
                                                : "Ongoing"}
                                              {/* {checkCallStatus(item)} */}
                                              <div>
                                                {isExpandedActivity.includes(
                                                  item.id
                                                ) ? (
                                                  <div>
                                                    <CaretUp
                                                      size={17}
                                                      weight="bold"
                                                    />
                                                  </div>
                                                ) : (
                                                  <div>
                                                    <CaretDown
                                                      size={17}
                                                      weight="bold"
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            </button>
                                          </div>
                                          {isExpandedActivity.includes(
                                            item.id
                                          ) && (
                                              <div
                                                className="mt-6"
                                                style={{
                                                  border: "1px solid #00000020",
                                                  borderRadius: "10px",
                                                  padding: 10,
                                                  paddingInline: 15,
                                                }}
                                              >
                                                <div
                                                  className="mt-4"
                                                  style={{
                                                    fontWeight: "500",
                                                    fontSize: 12,
                                                    color: "#00000070",
                                                  }}
                                                >
                                                  Transcript
                                                </div>
                                                <div className="flex flex-row items-center justify-between mt-4">
                                                  <div
                                                    style={{
                                                      fontWeight: "500",
                                                      fontSize: 15,
                                                    }}
                                                  >
                                                    {moment(
                                                      item?.duration * 1000
                                                    ).format("mm:ss")}{" "}
                                                  </div>
                                                  <button
                                                    onClick={() => {
                                                      if (item?.recordingUrl) {
                                                        setShowAudioPlay(
                                                          item?.recordingUrl
                                                        );
                                                      } else {
                                                        setShowNoAudioPlay(true);
                                                      }
                                                      // window.open(item.recordingUrl, "_blank")
                                                    }}
                                                  >
                                                    <Image
                                                      src={"/assets/play.png"}
                                                      height={35}
                                                      width={35}
                                                      alt="*"
                                                    />
                                                  </button>
                                                </div>
                                                {item.transcript ? (
                                                  <div className="w-full">
                                                    <div
                                                      className="mt-4"
                                                      style={{
                                                        fontWeight: "600",
                                                        fontSize: 15,
                                                      }}
                                                    >
                                                      {/* {item.transcript} */}
                                                      {isExpanded.includes(
                                                        item.id
                                                      )
                                                        ? `${item.transcript}`
                                                        : `${initialText}...`}
                                                    </div>
                                                    <button
                                                      style={{
                                                        fontWeight: "600",
                                                        fontSize: 15,
                                                      }}
                                                      onClick={() => {
                                                        handleReadMoreToggle(
                                                          item
                                                        );
                                                      }}
                                                      className="mt-2 text-black underline"
                                                    >
                                                      {isExpanded.includes(
                                                        item.id
                                                      )
                                                        ? "Read Less"
                                                        : "Read more"}
                                                    </button>
                                                  </div>
                                                ) : (
                                                  <div
                                                    style={{
                                                      fontWeight: "600",
                                                      fontSize: 15,
                                                    }}
                                                  >
                                                    No transcript
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal to add notes */}


      {/* Warning Modal for no voice */}
      <Modal
        open={showNoAudioPlay}
        onClose={() => setShowNoAudioPlay(false)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-3/12 sm:w-5/12 w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full flex flex-col items-center"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <audio controls>
                <source src={showAudioPlay} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <button
                className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
                onClick={() => {
                  setShowNoAudioPlay(false);
                }}
                style={{ fontWeight: "600", fontSize: 15 }}
              >
                Close
              </button>

              {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

      {/* Modal for audio play */}
      <Modal
        open={showAudioPlay}
        onClose={() => setShowAudioPlay(null)}
        closeAfterTransition
        BackdropProps={{
          sx: {
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box className="lg:w-3/12 sm:w-5/12 w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full flex flex-col items-center"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <audio controls>
                <source src={showAudioPlay} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <button
                className="text-white w-full h-[50px] rounded-lg bg-purple mt-4"
                onClick={() => {
                  setShowAudioPlay(null);
                }}
                style={{ fontWeight: "600", fontSize: 15 }}
              >
                Close
              </button>

              {/* Can be use full to add shadow
                            <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>

    </div >
  );
};

export default AdminCallDetails;

