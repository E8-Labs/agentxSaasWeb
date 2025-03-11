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
  selectedLead,
  showDetailsModal,
  setShowDetailsModal,
}) => {


  console.log('selectedLead', selectedLead)

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
            backgroundColor:"#00000020",
            // //backdropFilter: "blur(5px)",
          },
        }}
      >
        <Box
          className="lg:w-6/12 sm:w-7/12 w-8/12 bg-white py-2 h-[50svh] overflow-y-auto"
          sx={{
            ...styles.modalsStyle,
            scrollbarWidth: "none",
            backgroundColor: "white", //overflowY: "auto"
          }}
        >
          <div className="w-full flex flex-col items-center h-full">

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

                </div>
              </div>

            </div>
          </div>
        </Box>
      </Modal>

    </div >
  );
};

export default AdminCallDetails;

