import React, { useRef, useState } from "react";
import { Box, FormControl, MenuItem, Select } from "@mui/material";
import Image from "next/image";
import { Constants } from "@/constants/Constants";

const PhoneNumberSelector = ({ showDrawerSelectedAgent, setShowDrawerSelectedAgent }) => {
  const selectRef = useRef();
  const [openCalimNumDropDown, setOpenCalimNumDropDown] = useState(false);
  const [showGlobalBtn, setShowGlobalBtn] = useState(true);
  const [showReassignBtn, setShowReassignBtn] = useState(false);
  const [reassignLoader, setReassignLoader] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(null);
  const [assignNumber, setAssignNumber] = useState("");
  const [previousNumber, setPreviousNumber] = useState([]);
  const [showPhoneLoader, setShowPhoneLoader] = useState(false);

  const numberDropDownWidth = (agName) => {
    if (showDrawerSelectedAgent?.agentType === "outbound" ||
      showDrawerSelectedAgent?.name === agName ||
      !agName) {
      return "100%";
    }
  };

  const AssignNumber = async (phoneNumber) => {
    if (showDrawerSelectedAgent.phoneNumber === phoneNumber) return;

    try {
      setShowPhoneLoader(true);
      const Auth = AuthToken();
      const formData = new FormData();
      formData.append("phoneNumber", phoneNumber);
      formData.append("callbackNumber", showDrawerSelectedAgent?.callbackNumber);
      formData.append("liveTransforNumber", showDrawerSelectedAgent?.liveTransferNumber);
      formData.append("agentId", showDrawerSelectedAgent.id);

      const response = await axios.post(Apis.asignPhoneNumber, formData, {
        headers: { Authorization: "Bearer " + Auth }
      });

      if (response?.data?.status === true) {
        setAssignNumber(phoneNumber);
        setShowDrawerSelectedAgent(prev => ({ ...prev, phoneNumber }));
        setShowConfirmationModal(null);
      }
    } catch (error) {
      console.error("Error assigning number:", error);
    } finally {
      setShowPhoneLoader(false);
    }
  };

  return (
    <div className="">
      {showPhoneLoader ? (
        <div className="w-[150px] flex justify-center">
          <CircularProgress size={15} />
        </div>
      ) : (
        <Box className="">
          <FormControl className="">
            <Select
              ref={selectRef}
              open={openCalimNumDropDown}
              onClose={() => setOpenCalimNumDropDown(false)}
              onOpen={() => setOpenCalimNumDropDown(true)}
              className="border-none rounded-2xl outline-none p-0 m-0"
              displayEmpty
              value={assignNumber}

              renderValue={(selected) => {
                if (selected === "") {
                  return <div>Select Number</div>;
                }
                return <div style={{
                  fontSize: 15,
                  fontWeight: "500",
                  color: "#000",
                }}>
                  <div>
                    {selected}
                  </div>
                </div>
              }}
              sx={{
                ...styles.dropdownMenu,
                backgroundColor: "none",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                padding: 0,
                margin: 0,
              }}
            >
              {previousNumber?.map((item, index) => {
                // //console.log;
                // //console.log;
                return (
                  <MenuItem
                    key={index}
                    style={styles.dropdownMenu}
                    value={item.phoneNumber.slice(1)}
                    className="flex flex-row items-center gap-2 "
                    disabled={
                      assignNumber?.replace("+", "") ===
                      item.phoneNumber.replace("+", "")
                    }
                    onClick={(e) => {
                      //console.log;
                      // return;
                      if (showReassignBtn && item?.claimedBy) {
                        e.stopPropagation();
                        setShowConfirmationModal(item);
                        console.log(
                          "Hit release number api",
                          item
                        );
                        // AssignNumber
                      } else {
                        //console.log;
                        //// console.log(
                        //   "Should call assign number api"
                        // );
                        // return;
                        AssignNumber(item.phoneNumber);
                        //// console.log(
                        //   "Updated number is",
                        //   item.phoneNumber
                        // );
                      }
                    }}
                  >
                    <div
                      style={{
                        width: numberDropDownWidth(
                          item?.claimedBy?.name
                        ),
                      }}
                    >
                      {item.phoneNumber}
                    </div>
                    {showReassignBtn && (
                      <div
                        className="w-full"
                      // onClick={(e) => {
                      //   console.log(
                      //     "Should open confirmation modal"
                      //   );
                      //   e.stopPropagation();
                      //   setShowConfirmationModal(item);
                      // }}
                      >
                        {item.claimedBy && (
                          <div className="flex flex-row items-center gap-2">
                            {showDrawerSelectedAgent?.name !==
                              item.claimedBy.name && (
                                <div>
                                  <span className="text-[#15151570]">{`(Claimed by ${item.claimedBy.name}) `}</span>
                                  {reassignLoader === item ? (
                                    <CircularProgress size={15} />
                                  ) : (
                                    <button
                                      className="text-purple underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConfirmationModal(
                                          item
                                        );
                                      }}
                                    >
                                      Reassign
                                    </button>
                                  )}
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    )}
                  </MenuItem>
                );
              })}
              <MenuItem
                style={styles.dropdownMenu}
                value={showGlobalBtn ? 16505403715 : ""}
                // disabled={!showGlobalBtn}
                disabled={
                  (assignNumber && assignNumber.replace("+", "") === Constants.GlobalPhoneNumber.replace("+", "")) ||
                  (showDrawerSelectedAgent && showDrawerSelectedAgent.agentType === "inbound")
                }
                onClick={() => {
                  console.log(
                    "This triggers when user clicks on assigning global number",
                    assignNumber
                  );
                  // return;
                  AssignNumber(Constants.GlobalPhoneNumber);
                  // handleReassignNumber(showConfirmationModal);
                }}
              >
                {Constants.GlobalPhoneNumber}
                {showGlobalBtn &&
                  " (available for testing calls only)"}
                {showGlobalBtn == false &&
                  " (Only for outbound agents. You must buy a number)"}
              </MenuItem>
              <div
                className="ms-4 pe-4"
                style={{
                  ...styles.inputStyle,
                  color: "#00000070",
                }}
              >
                <i>Get your own unique phone number.</i>{" "}
                <button
                  className="text-purple underline"
                  onClick={() => {
                    setShowClaimPopup(true);
                  }}
                >
                  Claim one
                </button>
              </div>
            </Select>
          </FormControl>
        </Box>
      )}
    </div>
  );
};

export default PhoneNumberSelector;



const styles = {
  dropdownMenu: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
  },
  modalsStyle: {
    height: "auto",
    bgcolor: "transparent",
    p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-50%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
  headingStyle: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 10,
    borderColor: "#00000020",
  },
  paragraph: {
    fontSize: 15,
    fontWeight: "500",
  },
}