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
import NoVoicemailView from "@/components/dashboard/myagentX/NoVoicemailView";
import DeleteCallLogConfimation from "@/components/dashboard/leads/extras/DeleteCallLogConfimation";
import { callStatusColors } from "@/constants/Constants";

const AdminCallDetails = ({
  selectedLead,
  showDetailsModal,
  setShowDetailsModal,
}) => {


  const [initialLoader, setInitialLoader] = useState(false);
  const [selectedLeadsDetails, setSelectedLeadsDetails] = useState(null);
  const [isExpandedActivity, setIsExpandedActivity] = useState([]);
  const [isExpanded, setIsExpanded] = useState([]);
  const [showNoAudioPlay, setShowNoAudioPlay] = useState(false);
  const [showAudioPlay, setShowAudioPlay] = useState(null);



  const [showSuccessSnack, setShowSuccessSnack] = useState(null);
  const [showSuccessSnack2, setShowSuccessSnack2] = useState(false);
  const [showErrorSnack, setShowErrorSnack] = useState(null);
  const [showErrorSnack2, setShowErrorSnack2] = useState(false);

  const [showDelModal, setShowDelModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [seletedCallLog, setSelectedCallLog] = useState(null);
  const [delCallLoader, setdelCallLoader] = useState(false);

  // Email functionality states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null);
  const [sendEmailLoader, setSendEmailLoader] = useState(false);

  // SMS functionality states
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState([]);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [sendSMSLoader, setSendSMSLoader] = useState(false);

  //console.log

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

  useEffect(() => {
    if (!selectedLead) return;
    getLeadDetails(selectedLead);
  }, [selectedLead]);

  const getLeadDetails = async (selectedLead) => {
    try {
      setInitialLoader(true);
      // //console.log;
      let AuthToken = null;

      const localDetails = localStorage.getItem("User");
      if (localDetails) {
        const Data = JSON.parse(localDetails);
        //// //console.log;
        AuthToken = Data.token;
      }

      // //console.log;

      const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedLead.LeadModel.id}`;

      // //console.log;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        //console.log;

        // setLeadColumns(response.data.columns);
        setSelectedLeadsDetails(response.data.data);
      }
    } catch (error) {
      // console.error("Error occured in api is", error);
    } finally {
      setInitialLoader(false);
      // //console.log;
    }
  };

  const handleCopy = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setShowSuccessSnack("Call ID copied to the clipboard.");
      setShowSuccessSnack2(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

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


  //color
  const showColor = (item) => {
    let color =
      callStatusColors[
      Object.keys(callStatusColors).find(
        (key) => key.toLowerCase() === (item?.callOutcome || "").toLowerCase()
      )
      ] || "#000";

    return color;
  };

  //text of outcome
  const getOutcome = (item) => {
    if (item.communicationType == "sms") {
      return "Text Sent"
    } else if (item.communicationType == "email") {
      return "Email Sent"
    } else if (item.callOutcome) {
      return item?.callOutcome
    } else {
      return "Ongoing"
    }
  }

  const callTranscript = (item) => {
    return (
      <div className="flex flex-col">
        <div className="flex mt-4 flex-row items-center gap-4">
          <div
            className=""
            style={{
              fontWeight: "500",
              fontSize: 12,
              color: "#00000070",
            }}
          >
            Transcript
          </div>

          <button
            onClick={() =>
              handleCopy(
                item.callId
              )
            }
          >
            <Image
              src={
                "/svgIcons/copy.svg"
              }
              height={15}
              width={15}
              alt="*"
            />
          </button>
        </div>
        <div className="flex flex-row items-center justify-between mt-4">
          <div
            style={{
              fontWeight: "500",
              fontSize: 15,
            }}
          >
            {moment(
              item?.duration *
              1000
            ).format(
              "mm:ss"
            )}{" "}
          </div>
          <button
            onClick={() => {
              if (
                item?.recordingUrl
              ) {
                setShowAudioPlay(
                  item?.recordingUrl
                );
              } else {
                setShowNoAudioPlay(
                  true
                );
              }
              // window.open(item.recordingUrl, "_blank")
            }}
          >
            <Image
              src={
                "/assets/play.png"
              }
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
              {`${initialText}...`}
              {/* {isExpanded.includes(
                                                        item.id
                                                      )
                                                        ? `${item.transcript}`
                                                        : `${initialText}...`} */}
            </div>
            <div className="w-full flex flex-row items-center justify-between">
              <button
                style={{
                  fontWeight:
                    "600",
                  fontSize: 15,
                }}
                onClick={() => {
                  handleReadMoreToggle(
                    item
                  );
                }}
                className="mt-2 text-black underline"
              >
                {"Read more"}
              </button>
            </div>
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
    )
  }

  const emailSmsTranscript = (item) => {
    return (
      <div className="flex flex-col items-start gap-2">
        {item.sentSubject && (
          <div className="flex flex-col items-start gap-2">
            <div className="text-base font-semibold text-[#00000050]">
              Subject
            </div>

            <div className="text-base font-medium text-[#000000]">
              {item.sentSubject}
            </div>

          </div>
        )}


        {item.sentContent && (
          <div className="flex flex-col items-start gap-2">
            <div className="text-base font-semibold text-[#00000050]">
              Content
            </div>

            <div className="text-base font-medium text-[#000000]">
              {item.sentContent}
            </div>

          </div>
        )}
      </div>
    )
  }

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
            backgroundColor: "#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box
          className="lg:w-6/12 sm:w-7/12 w-8/12 bg-white py-2 h-[90svh] overflow-y-auto"
          sx={{
            ...styles.modalsStyle,
            scrollbarWidth: "none",
            backgroundColor: "white", //overflowY: "auto"
          }}
        >
          <div className="w-full flex flex-col items-center h-full">
            <AgentSelectSnackMessage
              isVisible={showSuccessSnack2}
              hide={() => setShowSuccessSnack2(false)}
              message={showSuccessSnack}
              type={SnackbarTypes.Success}
            />
            <AgentSelectSnackMessage
              isVisible={showErrorSnack2}
              hide={() => setShowErrorSnack2(false)}
              message={showErrorSnack2}
              type={SnackbarTypes.Error}
            />


            <div className="w-full">

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
                        {selectedLead?.user?.name.slice(0, 1)}
                      </div>
                      <div
                        className="truncate"
                        onClick={() => handleToggleClick(item.id)}
                      >
                        {selectedLead?.user?.name}
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

                        {selectedLead?.user?.email}

                      </div>
                    </div>
                  </div>


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
                      {(selectedLead?.user?.phone) || "-"}
                    </div>
                  </div>


                  <div style={{ fontWeight: "700", fontSize: 16.9, marginTop: 20 }}>
                    Lead Details
                  </div>

                  <div className="flex flex-row items-center justify-between mt-4">
                    <div className="flex flex-row items-center gap-4">
                      <div
                        className="h-[32px] w-[32px] bg-black rounded-full flex flex-row items-center justify-center text-white"
                        onClick={() => handleToggleClick(item.id)}
                      >
                        {selectedLead?.LeadModel?.firstName.slice(0, 1)}
                      </div>
                      <div
                        className="truncate"
                        onClick={() => handleToggleClick(item.id)}
                      >
                        {selectedLead.LeadModel?.firstName}{" "}
                        {selectedLead.LeadModel?.lastName}
                      </div>
                    </div>

                  </div>

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
                      {(selectedLead?.LeadModel?.phone) || "-"}
                    </div>
                  </div>



                  <div style={{ fontsize: 17, fontWeight: '700', color: "black", marginTop: 20 }}>
                    Call activities
                  </div>

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
                              <div key={index}>
                                <div className="mt-4">
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
                                            className="
                                          text-end flex flex-row items-center gap-1 px-2 py-2 rounded-full
                                          "
                                            style={{
                                              backgroundColor: "#ececec",
                                            }}
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
                                                  showColor(item),
                                              }}
                                            ></div>
                                            {
                                              getOutcome(item)
                                            }
                                            {/* {checkCallStatus(item)} */}

                                            {item.callOutcome !==
                                              "No Answer" && (
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
                                              )}
                                          </button>
                                        </div>
                                        {isExpandedActivity.includes(
                                          item.id
                                        ) &&
                                          (item.status === "voicemail" ||
                                            item.callOutcome ===
                                            "Voicemail" ? (
                                            <div className="border rounded mt-2 w-full p-4">
                                              <button
                                                onClick={() =>
                                                  handleCopy(item.callId)
                                                }
                                              >
                                                <Image
                                                  src={
                                                    "/svgIcons/copy.svg"
                                                  }
                                                  height={15}
                                                  width={15}
                                                  alt="*"
                                                />
                                              </button>
                                              {item.agent.hasVoicemail ? (

                                                <NoVoicemailView
                                                  showAddBtn={false}
                                                  title={
                                                    "Voicemail Delivered"
                                                  }
                                                  subTitle={
                                                    "Delivered during the first missed call"
                                                  }
                                                />
                                              ) : (
                                                <NoVoicemailView
                                                  showAddBtn={false}
                                                  title={
                                                    "Not able to Leave a Voicemail"
                                                  }
                                                  subTitle={
                                                    "The phone was either a landline or has a full voicemail"
                                                  }
                                                />
                                              )}

                                            </div>
                                          ) : (
                                            <>
                                              <div
                                                className="mt-6"
                                                style={{
                                                  border:
                                                    "1px solid #00000020",
                                                  borderRadius: "10px",
                                                  padding: 10,
                                                  paddingInline: 15,
                                                }}
                                              >
                                                {
                                                  item.communicationType === "sms" || item.communicationType == "email" ? (

                                                    emailSmsTranscript(item)
                                                  ) : (
                                                    callTranscript(item)
                                                  )

                                                }

                                                <div
                                                  className="
                                                w-full flex flex-row justify-end -mt-2
                                                "
                                                >
                                                  <button
                                                    style={{
                                                      fontWeight: "600",
                                                      fontSize: 15,
                                                      color: "#00000050",
                                                    }}
                                                    onClick={() => {
                                                      setShowConfirmationPopup(
                                                        true
                                                      );
                                                      setSelectedCallLog(
                                                        item
                                                      );
                                                      //  deleteCallLog(item)
                                                    }}
                                                  >
                                                    Delete
                                                  </button>

                                                  <DeleteCallLogConfimation
                                                    showConfirmationPopup={
                                                      showConfirmationPopup
                                                    }
                                                    setShowConfirmationPopup={
                                                      showConfirmationPopup
                                                    }
                                                    onContinue={() => {
                                                      deleteCallLog(
                                                        seletedCallLog
                                                      );
                                                    }}
                                                    loading={
                                                      delCallLoader
                                                    }
                                                  />
                                                </div>
                                              </div>
                                            </>
                                          ))}
                                      </div>
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


                  <div>


                  </div>
                </div>

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
              </div>

            </div>
          </div>
        </Box>
      </Modal>

    </div >
  );
};

export default AdminCallDetails;

//  <div>
//                         {selectedLeadsDetails?.callActivity.map(
//                           (item, index) => {
//                             const initialTextLength = Math.ceil(
//                               item.transcript?.length * 0.1
//                             ); // 40% of the text
//                             const initialText = item.transcript?.slice(
//                               0,
//                               initialTextLength
//                             );
//                             return (
//                               <div key={index} className="mt-4">
//                                 <div
//                                   className="-ms-4"
//                                   style={{
//                                     fontsize: 15,
//                                     fontWeight: "500",
//                                     color: "#15151560",
//                                   }}
//                                 >
//                                   {GetFormattedDateString(
//                                     item?.createdAt,
//                                     true
//                                   )}
//                                 </div>
//                                 <div className="w-full flex flex-row items-center gap-2 h-full">
//                                   <div
//                                     className="pb-4 pt-6 ps-4 w-full"
//                                     style={{
//                                       borderLeft: "1px solid #00000020",
//                                     }}
//                                   >
//                                     <div className="h-full w-full">
//                                       <div className="flex flex-row items-center justify-between">
//                                         <div className="flex flex-row items-center gap-1">
//                                           <div
//                                             style={{
//                                               fontWeight: "600",
//                                               fontsize: 15,
//                                             }}
//                                           >
//                                             Outcome
//                                           </div>
//                                         </div>
//                                         <button
//                                           className="text-end flex flex-row items-center gap-1"
//                                           style={styles.paragraph}
//                                           onClick={() => {
//                                             handleShowMoreActivityData(
//                                               item
//                                             );
//                                           }}
//                                         >
//                                           <div
//                                             className="h-[10px] w-[10px] rounded-full"
//                                             style={{
//                                               backgroundColor:
//                                                 selectedLeadsDetails?.stage
//                                                   ?.defaultColor,
//                                             }}
//                                           ></div>
//                                           {item?.callOutcome
//                                             ? item?.callOutcome
//                                             : "Ongoing"}
//                                           <div>
//                                             {isExpandedActivity.includes(
//                                               item.id
//                                             ) ? (
//                                               <div>
//                                                 <CaretUp
//                                                   size={17}
//                                                   weight="bold"
//                                                 />
//                                               </div>
//                                             ) : (
//                                               <div>
//                                                 <CaretDown
//                                                   size={17}
//                                                   weight="bold"
//                                                 />
//                                               </div>
//                                             )}
//                                           </div>
//                                         </button>
//                                       </div>
//                                       {isExpandedActivity.includes(
//                                         item.id
//                                       ) && (
//                                           <div
//                                             className="mt-6"
//                                             style={{
//                                               border: "1px solid #00000020",
//                                               borderRadius: "10px",
//                                               padding: 10,
//                                               paddingInline: 15,
//                                             }}
//                                           >
//                                             <div className="flex flex-row items-center gap-2 mt-4">
//                                               <div
//                                                 className=""
//                                                 style={{
//                                                   fontWeight: "500",
//                                                   fontSize: 12,
//                                                   color: "#00000070",
//                                                 }}
//                                               >
//                                                 Transcript
//                                               </div>

//                                               <button
//                                                 onClick={() =>
//                                                   handleCopy(item.callId)
//                                                 }
//                                               >
//                                                 <Image
//                                                   src={
//                                                     "/svgIcons/copy.svg"
//                                                   }
//                                                   height={15}
//                                                   width={15}
//                                                   alt="*"
//                                                 />
//                                               </button>
//                                             </div>
//                                             <div className="flex flex-row items-center justify-between mt-4">
//                                               <div
//                                                 style={{
//                                                   fontWeight: "500",
//                                                   fontSize: 15,
//                                                 }}
//                                               >
//                                                 {moment(
//                                                   item?.duration * 1000
//                                                 ).format("mm:ss")}{" "}
//                                               </div>
//                                               <button
//                                                 onClick={() => {
//                                                   if (item?.recordingUrl) {
//                                                     setShowAudioPlay(
//                                                       item?.recordingUrl
//                                                     );
//                                                   } else {
//                                                     setShowNoAudioPlay(true);
//                                                   }
//                                                   // window.open(item.recordingUrl, "_blank")
//                                                 }}
//                                               >
//                                                 <Image
//                                                   src={"/assets/play.png"}
//                                                   height={35}
//                                                   width={35}
//                                                   alt="*"
//                                                 />
//                                               </button>
//                                             </div>
//                                             {item.transcript ? (
//                                               <div className="w-full">
//                                                 <div
//                                                   className="mt-4"
//                                                   style={{
//                                                     fontWeight: "600",
//                                                     fontSize: 15,
//                                                   }}
//                                                 >
//                                                   {isExpanded.includes(
//                                                     item.id
//                                                   )
//                                                     ? `${item.transcript}`
//                                                     : `${initialText}...`}
//                                                 </div>
//                                                 <button
//                                                   style={{
//                                                     fontWeight: "600",
//                                                     fontSize: 15,
//                                                   }}
//                                                   onClick={() => {
//                                                     handleReadMoreToggle(
//                                                       item
//                                                     );
//                                                   }}
//                                                   className="mt-2 text-black underline"
//                                                 >
//                                                   {isExpanded.includes(
//                                                     item.id
//                                                   )
//                                                     ? "Read Less"
//                                                     : "Read more"}
//                                                 </button>
//                                               </div>
//                                             ) : (
//                                               <div
//                                                 style={{
//                                                   fontWeight: "600",
//                                                   fontSize: 15,
//                                                 }}
//                                               >
//                                                 No transcript
//                                               </div>
//                                             )}
//                                           </div>
//                                         )}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             );
//                           }
//                         )}
//                       </div>