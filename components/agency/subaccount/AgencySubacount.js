"use client";
import React, { useEffect, useState } from "react";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import moment from "moment";
import Image from "next/image";
import Apis from "@/components/apis/Apis";
import { AuthToken } from "../plan/AuthDetails";
import axios from "axios";
import { Box, CircularProgress, Modal } from "@mui/material";
import SelectedUserDetails from "@/components/admin/users/SelectedUserDetails";
import InviteTeamModal from "./InviteTeamModal";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { convertSecondsToMinDuration } from "@/utilities/utility";
import { getMonthlyPlan, getXBarOptions } from "./GetPlansList";
import SlideModal from "./SlideModal";
import CreateSubAccountModal from "./CreateSubAccountModal";
import { TwilioWarning } from "@/components/onboarding/extras/StickyModals";
import NewInviteTeamModal from "./NewInviteTeamModal";
import ViewSubAccountPlans from "./ViewSubAccountPlans";
import EditAgencyName from "../agencyExtras.js/EditAgencyName";
import DelAdminUser from "@/components/onboarding/extras/DelAdminUser";

function AgencySubacount() {
  const [subAccountList, setSubAccountsList] = useState([]);
  const [initialLoader, setInitialLoader] = useState(false);
  const [moreDropdown, setmoreDropdown] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(false);
  const [agencyData, setAgencyData] = useState("");
  const [twililoConectedStatus, setTwilioConnectedStatus] = useState(false);

  //code for invite team popup
  const [openInvitePopup, setOpenInvitePopup] = useState(false);
  //code for show plans
  const [showPlans, setShowPlans] = useState(false);
  const [userData, setUserData] = useState(null);

  //snack msages
  const [showSnackMessage, setShowSnackMessage] = useState(null);
  const [showSnackType, setShowSnackType] = useState(SnackbarTypes.Success);
  //pause subAcc
  const [pauseLoader, setpauseLoader] = useState(false);
  const [showPauseConfirmationPopup, setShowPauseConfirmationPopup] = useState(false);
  //del subAcc
  const [delLoader, setDelLoader] = useState(false);
  const [showDelConfirmationPopup, setShowDelConfirmationPopup] = useState(false);
  
  useEffect(() => {
    getLocalData();
    getSubAccounts();
  }, []);

  // get agency data from local

  const getLocalData = () => {
    let data = localStorage.getItem("User");
    if (data) {
      let u = JSON.parse(data);

      setAgencyData(u.user);
    }
  };

  //code to check plans before creating subaccount
  const handleCheckPlans = async () => {
    try {
      const monthlyPlans = await getMonthlyPlan();
      const xBarOptions = await getXBarOptions();

      if (monthlyPlans.length > 0 && xBarOptions.length > 0) {
        setShowModal(true);
      } else {
        setShowSnackType(SnackbarTypes.Error);
        if (monthlyPlans.length === 0) {
          setShowSnackMessage("You'll need to add plans to create subaccounts ");
        } else if (xBarOptions.length === 0) {
          setShowSnackMessage("You'll need to add an XBar plan to create subaccounts");
        }
      }

    } catch (error) {
      console.error("Error occured in api is", error);
    }
  }

  //code to close subaccount details modal
  const handleCloseModal = () => {
    getSubAccounts();
    setShowModal(false);
  };

  // /code for getting the subaccouts list
  const getSubAccounts = async () => {
    console.log("Trigered get subaccounts");
    try {
      setInitialLoader(true);
      const ApiPAth = Apis.getAgencySubAccount;
      const Token = AuthToken();
      // console.log(Token);
      const response = await axios.get(ApiPAth, {
        headers: {
          Authorization: "Bearer " + Token,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of get subaccounts api is", response.data);
        setSubAccountsList(response.data.data);
        setInitialLoader(false);
      }
    } catch (error) {
      console.error("Error occured in getsub accounts is", error);
      setInitialLoader(false);
    }
  };

  //function to pause account
  const handlePause = async () => {
    try {
      setpauseLoader(true);
      const data = localStorage.getItem("User");
      if (data) {
        let u = JSON.parse(data);
        let apidata = {
          userId: moreDropdown,
        };

        console.log("Api data is", apidata);

        const response = await axios.post(Apis.pauseProfile, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
            "Content-Type": "application/json",
          },
        });
        setpauseLoader(false);
        if (response.data) {
          if (response.data.status === true) {
            setShowSnackMessage(response.data.message);
            setShowPauseConfirmationPopup(false);
            setmoreDropdown(null);
          }
          console.log("response.data.data", response.data);
        }
      }
    } catch (error) {
      console.error("Error occured in pause subAccount api is", error);
      setpauseLoader(false);
    }
  };

  //function to delete account
  const handleDeleteUser = async () => {
    try {
      setDelLoader(true);
      const data = localStorage.getItem("User");

      if (data) {
        let u = JSON.parse(data);

        let path = Apis.deleteProfile;

        let apidata = {
          userId: moreDropdown,
        };
        console.log("Api data is", apidata);

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        console.log("Response of del account apis is", response);
        if (response.data) {
          console.log("Response of del account apis is", response.data);
          setShowSnackMessage(response.data.message);
          setDelLoader(false);
          setShowDelConfirmationPopup(false);
          setmoreDropdown(null);
        }
      }
    } catch (error) {
      console.error("Error occured in del account api is", error);
      setDelLoader(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center ">
      <AgentSelectSnackMessage
        isVisible={showSnackMessage}
        hide={() => {
          setShowSnackMessage(null);
        }}
        type={showSnackType}
        message={showSnackMessage}
      />

      <div className="flex w-full flex-row items-center justify-between px-5 py-5 border-b">
        <div>
          <EditAgencyName
            flex={true} />
        </div>

        <div>
          <NotficationsDrawer />
        </div>
      </div>

      {/* Code for twilio warning */}
      <TwilioWarning
        agencyData={agencyData}
        showSuccess={(d) => {
          setShowSnackMessage(d);
          setShowSnackType(SnackbarTypes.Success);
        }}
        isTwilioAdded={(d) => {
          console.log("Twilio connected status", d);
          setTwilioConnectedStatus(d.status);
        }}
      />

      <div className="w-[95%] h-[90vh] rounded-lg flex flex-col items-center  p-5 bg-white shadow-md">
        <div
          className="w-full h-[130px] flex flex-row items-center justify-between rounded-lg px-6"
          style={{
            backgroundImage: "url('/agencyIcons/subAccBg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            // borderRadius:'20px'
          }}
        >
          <div
            style={{
              fontSize: 29,
              fontWeight: "700",
              color: "black",
            }}
          >
            Total Sub Accounts: {subAccountList?.length || 0}
          </div>

          <button
            disabled={twililoConectedStatus}
            className="flex px-5 py-3 bg-purple rounded-lg text-white font-medium border-none outline-none"
            onClick={() => {
              handleCheckPlans();
            }}
          >
            Create Sub Account
          </button>
        </div>

        <div className="w-full flex flex-row justify-between mt-2 px-10 mt-10">
          <div className="w-3/12">
            <div style={styles.text}>Sub Account</div>
          </div>
          <div className="w-2/12 ">
            <div style={styles.text}>Plan</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Total Spent</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Balance</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Leads</div>
          </div>
          <div className="w-2/12">
            <div style={styles.text}>Renewal</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Teams</div>
          </div>
          <div className="w-1/12">
            <div style={styles.text}>Action</div>
          </div>
        </div>

        {initialLoader ? (
          <div className="w-full flex flex-row justify-center mt-4">
            <CircularProgress size={35} />
          </div>
        ) : (
          <div
            className={`h-[71vh] overflow-auto w-full`}
            id="scrollableDiv1"
            style={{ scrollbarWidth: "none" }}
          >
            {subAccountList?.length > 0 ? (
              <div>
                {subAccountList.map((item) => (
                  <div
                    key={item.id}
                    style={{ cursor: "pointer" }}
                    className="w-full flex flex-row justify-between items-center mt-5 px-10 hover:bg-[#402FFF05] py-2 cursor-pointer"
                  >
                    <div
                      className="w-3/12 flex flex-row gap-2 items-center cursor-pointer flex-shrink-0"
                    // onClick={() => {
                    //     // // //console.log;
                    //     // setselectedLeadsDetails(item);
                    //     // setShowDetailsModal(true);
                    // }}
                    >
                      {item.thumb_profile_image ? (
                        <Image
                          src={item.thumb_profile_image}
                          className="rounded-full bg-red"
                          height={40}
                          width={40}
                          style={{
                            height: "40px",
                            width: "40px",
                            objectFit: "cover",
                          }}
                          alt="*"
                        />
                      ) : (
                        <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                          {item.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <div style={{ ...styles.text2 }} className="w-[60%]">
                        {item.name}
                      </div>
                    </div>
                    <div className=" w-2/12">
                      <div style={styles.text2}>
                        {item.plan?.title || "No Plan"}
                      </div>
                    </div>
                    <div className="w-1/12">
                      {/* (item.LeadModel?.phone) */}
                      <div style={styles.text2}>${item.amountSpent || 0}</div>
                    </div>
                    <div className="w-1/12">
                      <div style={styles.text2}>
                        {convertSecondsToMinDuration(
                          item.totalSecondsAvailable || 0
                        )}
                      </div>
                    </div>
                    <div className="w-1/12">
                      <div style={styles.text2}>{item.totalLeads}</div>
                    </div>
                    <div className="w-2/12">
                      <div style={styles.text2}>
                        {item.nextChargeDate
                          ? moment(item.nextChargeDate).format("MMMM DD,YYYY")
                          : "-"}
                      </div>
                    </div>
                    <div className="w-1/12">{item.teamMembers}</div>

                    <div className="w-1/12 relative">
                      <button
                        disabled={twililoConectedStatus}
                        id={`dropdown-toggle-${item.id}`}
                        onClick={() => {
                          setUserData(item);
                          setmoreDropdown(
                            moreDropdown === item.id ? null : item.id
                          )
                        }}
                      >
                        <Image
                          src={"/svgIcons/threeDotsIcon.svg"}
                          height={24}
                          width={24}
                          alt="menu"
                        />
                      </button>

                      {moreDropdown === item.id && (
                        <div className="absolute top-8 right-0 bg-white border rounded-lg shadow-lg z-50 w-[180px]">
                          <button
                            className="px-4 py-2 hover:bg-purple10 cursor-pointer text-sm font-medium text-gray-800 w-full text-start"
                            onClick={() => {
                              setSelectedUser(item);
                            }}
                          // setmoreDropdown(null)
                          >
                            View Detail
                          </button>
                          <button
                            className="px-4 py-2 hover:bg-purple10 cursor-pointer text-sm font-medium text-gray-800 w-full text-start"
                            onClick={() => {
                              setOpenInvitePopup(true);
                            }}
                          >
                            Invite Team
                          </button>
                          {/* Code for invite team modal */}
                          {openInvitePopup && (
                            <NewInviteTeamModal
                              openInvitePopup={openInvitePopup}
                              userID={moreDropdown}
                              handleCloseInviteTeam={(data) => {
                                setOpenInvitePopup(false);
                                if (data === "showSnack") {
                                  setShowSnackMessage("Invite Sent");
                                  setmoreDropdown(null);
                                }
                              }}
                            />
                          )}

                          <button
                            className="px-4 py-2 hover:bg-purple10 cursor-pointer text-sm font-medium text-gray-800 w-full text-start"
                            onClick={() => {
                              console.log(selectedUser);
                              setShowPlans(true);
                            }}
                          >
                            View Plans
                          </button>

                          {
                            showPlans && (
                              <ViewSubAccountPlans
                                showPlans={setShowPlans}
                                hidePlans={() => { setShowPlans(false) }}
                                selectedUser={userData}
                              />
                            )
                          }

                          <div>
                            {pauseLoader ? (
                              <CircularProgress size={25} />
                            ) : (
                              <button
                                className="px-4 py-2 hover:bg-purple10 cursor-pointer text-sm font-medium text-gray-800 w-full text-start"
                                onClick={() => {
                                  // handlePause();
                                  setShowPauseConfirmationPopup(true);
                                }}
                              >
                                Pause
                              </button>
                            )}
                          </div>

                          {
                            showPauseConfirmationPopup && (
                              <DelAdminUser
                                showPauseModal={showPauseConfirmationPopup}
                                handleClosePauseModal={() => { setShowPauseConfirmationPopup(false) }}
                                handlePaueUser={handlePause}
                                pauseLoader={pauseLoader}
                                selectedUser={selectedUser}
                              />
                            )
                          }

                          {delLoader ? (
                            <CircularProgress size={25} />
                          ) : (
                            <button
                              className="px-4 py-2 hover:bg-purple10 cursor-pointer text-sm font-medium text-gray-800 w-full text-start"
                              onClick={() => {
                                // handleDeleteUser();
                                setShowDelConfirmationPopup(true);
                              }}
                            >
                              Delete
                            </button>
                          )}

                          {
                            showDelConfirmationPopup && (
                              <DelAdminUser
                                showDeleteModal={showDelConfirmationPopup}
                                handleClose={() => { setShowDelConfirmationPopup(false) }}
                                handleDeleteUser={handleDeleteUser}
                                delLoader={delLoader}
                                selectedUser={selectedUser}
                              />
                            )
                          }

                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center mt-4"
                style={{ fontWeight: "bold", fontSize: 20 }}
              >
                No sub-account found
              </div>
            )}
          </div>
        )}

        {/* Code for modals
        <CreateSubAccountModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          closeAll={() => {
            handleCloseModal();
          }}
        /> */}

        {/* code for slide animation modal */}


        <SlideModal
          showModal={showModal}
          handleClose={() => {
            getSubAccounts();
            setShowModal(false);
          }}
        // handleCloseModal={() => { handleCloseModal() }}
        />

        {/* Code for subaccount modal */}
        <Modal
          open={selectedUser ? true : false}
          onClose={() => {
            setSelectedUser(null);
          }}
          BackdropProps={{
            timeout: 200,
            sx: {
              backgroundColor: "#00000020",
              zIndex: 1200, // Keep backdrop below Drawer
            },
          }}
          sx={{
            zIndex: 1300, // Keep Modal below the Drawer
          }}
        >
          <Box
            className="w-11/12 p-8 rounded-[15px]"
            sx={{
              ...styles.modalsStyle,
              backgroundColor: "white",
              position: "relative",
              zIndex: 1301, // Keep modal content above its backdrop
            }}
          >
            <SelectedUserDetails
              from="subaccount"
              selectedUser={selectedUser}
              // agencyUser={true}
              handleDel={() => {
                // setUsers((prev) => prev.filter((u) =>
                //     u.id != selectedUser.id
                // ))
                // setSelectedUser(null)
              }}
            />
          </Box>
        </Modal>
      </div>
    </div>
  );
}

export default AgencySubacount;

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
    transform: "translateY(-50%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
};
