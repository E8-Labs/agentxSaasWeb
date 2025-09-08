import { Button, CircularProgress, colors, Fab, Popover } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Modal, Box, Drawer } from "@mui/material";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import {
  checkPhoneNumber,
  getLocalLocation,
} from "@/components/onboarding/services/apisServices/ApiService";
import { formatPhoneNumber } from "@/utilities/agentUtilities";
import { PersistanceKeys } from "@/constants/Constants";
import { logout } from "@/utilities/UserUtility";
import { useRouter } from "next/navigation";
import DashboardSlider from "@/components/animations/DashboardSlider";
import { copyAgencyOnboardingLink } from "@/components/constants/constants";

function Teams({
  agencyData,
  selectedAgency
}) {
  const timerRef = useRef(null);
  const router = useRouter();
  //stores local data
  const [userLocalData, setUserLocalData] = useState(null);

  const [teamDropdown, setteamDropdown] = useState(null);
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(null);
  const [openMoreDropdown, setOpenMoreDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Noah's Team");
  const [openInvitePopup, setOpenInvitePopup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [showError, setShowError] = useState(false);

  const [myTeam, setMyTeam] = useState([]);

  const [getTeamLoader, setGetTeamLoader] = useState(false);
  const [inviteTeamLoader, setInviteTeamLoader] = useState(false);
  const [reInviteTeamLoader, setReInviteTeamLoader] = useState(false);

  const [emailLoader, setEmailLoader] = useState(false);
  const [emailCheckResponse, setEmailCheckResponse] = useState(null);
  const [validEmail, setValidEmail] = useState("");

  const [showSnak, setShowSnak] = useState(false);
  const [snackTitle, setSnackTitle] = useState("Team Invite Sent.");

  //variables for phone number err messages and checking
  const [errorMessage, setErrorMessage] = useState(null);
  const [checkPhoneLoader, setCheckPhoneLoader] = useState(null);
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null);
  const [countryCode, setCountryCode] = useState(""); // Default country

  //nedd help popup
  const [needHelp, setNeedHelp] = useState(false);

  const [linkCopied, setLinkCopied] = useState(false);

  //variables for popover
  // instead of storing just item.id, store the element anchor + team data
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverTeam, setPopoverTeam] = useState(null);

  const open = Boolean(anchorEl);


  //get local Data
  useEffect(() => {
    const localData = localStorage.getItem("User");
    if (localData) {
      const D = JSON.parse(localData)
      setUserLocalData(D.user);
    }
  }, []);


  const data = [
    {
      id: 1,
      name: "Noah",
      email: "abc@gmail.com",
    },
    {
      id: 2,
      name: "Noah",
      email: "abc@gmail.com",
    },
    {
      id: 3,
      name: "Noah",
      email: "abc@gmail.com",
    },
    {
      id: 4,
      name: "Noah",
      email: "abc@gmail.com",
    },
    {
      id: 5,
      name: "Noah",
      email: "abc@gmail.com",
    },
  ];

  useEffect(() => { });

  useEffect(() => {
    if (typeof window !== "undefined") {
      let loc = getLocalLocation();
      setCountryCode(loc);
      getMyteam();
    }
  }, []);

  //functions handling popover
  const handlePopoverOpen = (event, team) => {
    setAnchorEl(event.currentTarget);
    setPopoverTeam(team);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverTeam(null);
  };

  //function to get team mebers api
  const getMyteam = async () => {
    try {
      setGetTeamLoader(true);
      const data = localStorage.getItem("User");

      if (data) {
        let u;
        try {
          u = JSON.parse(data);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          setGetTeamLoader(false);
          return;
        }

        if (!u || !u.token) {
          console.error("No valid user token found");
          setGetTeamLoader(false);
          return;
        }

        let path = Apis.getTeam;
        // //console.log
        if (selectedAgency) {
          path = path + `?userId=${selectedAgency.id}`
        }
        console.log("Api path for dashboard monthly plans api is", path)

        const response = await axios.get(path, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setGetTeamLoader(false);

          if (response.data.status === true) {
            //console.log;
            let admin = response.data.admin;
            let adminMember = {
              invitingUser: admin,
              invitedUser: admin,
              id: -1,
              status: "Admin",
              name: admin.name,
              email: admin.email,
              phone: admin.phone,
            };
            let array = [adminMember, ...response.data.data];
            if (response.data.data.length == 0) {
              array = [];
            }
            setMyTeam(array);
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      console.error("Error getting team data:", e);
      setGetTeamLoader(false);
      setSnackTitle("Error loading team data");
      setShowSnak(true);
    }
  };

  //funcion to invitem tem member
  const inviteTeamMember = async (item) => {
    // //console.log;
    // return
    if (!item.name || !item.email || !item.phone) {
      setShowError(true);
      return;
    }
    try {
      const data = localStorage.getItem("User");
      setInviteTeamLoader(true);
      if (data) {
        let u;
        try {
          u = JSON.parse(data);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          setInviteTeamLoader(false);
          return;
        }

        if (!u || !u.token) {
          console.error("No valid user token found");
          setInviteTeamLoader(false);
          return;
        }

        let path = Apis.inviteTeamMember;
        console.log("Api path for dashboard monthly plans api is", path);

        let apidata = {
          name: item.name,
          email: item.email,
          phone: item.phone,
        };
        if (selectedAgency) {
          apidata = {
            ...apidata,
            userId: selectedAgency.id
          }
        }

        console.log("Data sending in inviteteamapi is", apidata);

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setInviteTeamLoader(false);
          if (response.data.status === true) {
            // //console.log;
            let newMember = response.data.data[0];
            // //console.log;
            // //console.log;
            setMyTeam((prev) => {
              // //console.log;
              // //console.log;
              const isAlreadyPresent = prev.some(
                (member) => member.id === newMember.id
              ); // Check by unique ID
              // //console.log;
              if (isAlreadyPresent) {
                // //console.log;
                return prev;
              }
              return [...prev, newMember];
            });
            setSnackTitle(response.data.message);
            setShowSnak(true);
            setOpenInvitePopup(false);
            setName("");
            setEmail("");
            setPhone("");
            // getMyteam()
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      console.error("Error inviting team member:", e);
      setInviteTeamLoader(false);
      setReInviteTeamLoader(false);
      setShowError(true);
    }
  };

  //email validation function
  const validateEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if email contains consecutive dots, which are invalid
    if (/\.\./.test(email)) {
      return false;
    }

    // Check the general pattern for a valid email
    return emailPattern.test(email);
  };

  //check email
  const checkEmail = async (value) => {
    try {
      setValidEmail("");
      setEmailLoader(true);

      const ApiPath = Apis.CheckEmail;

      const ApiData = {
        email: value,
      };

      // //console.log;

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        if (response.data.status === true) {
          // //console.log;
          setEmailCheckResponse(response.data);
        } else {
          setEmailCheckResponse(response.data);
        }
      }
    } catch (error) {
      // console.error("Error occured in check email api is :", error);
    } finally {
      setEmailLoader(false);
    }
  };

  //phone input change
  const handlePhoneNumberChange = (phone) => {
    setPhone(phone);
    setErrorMessage(null);
    validatePhoneNumber(phone);
    setCheckPhoneResponse(null);

    if (!phone) {
      setErrorMessage(null);
      setCheckPhoneResponse(null);
    }
  };

  //number validation
  const validatePhoneNumber = async (phoneNumber) => {
    // const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // parsePhoneNumberFromString(`+${phone}`, countryCode?.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode?.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage("Invalid");
    } else {
      setErrorMessage("");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      try {
        setCheckPhoneLoader("Checking...");
        let response = await checkPhoneNumber(phoneNumber);
        // //console.log;
        // setErrorMessage(null)
        setCheckPhoneResponse(response.data);
        if (response.data.status === false) {
          setErrorMessage("Taken");
        } else if (response.data.status === true) {
          setErrorMessage("Available");
        }
      } catch (error) {
        // console.error("Error occured in api is", error);
        setCheckPhoneLoader(null);
      } finally {
        setCheckPhoneLoader(null);
      }

      // setCheckPhoneResponse(null);
      // //console.log;
    }
  };

  async function DeleteTeamMember(team) {
    // //console.log;
    // return;
    let phoneNumber = team.phone;
    let apidata = {
      phone: phoneNumber,
    };

    if (selectedAgency) {
      apidata = {
        ...apidata,
        userId: selectedAgency.id
      }
    }

    // //console.log;
    // return;

    try {
      const data = localStorage.getItem("User");
      setInviteTeamLoader(true);
      if (data) {
        let u;
        try {
          u = JSON.parse(data);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          setInviteTeamLoader(false);
          return;
        }

        if (!u || !u.token) {
          console.error("No valid user token found");
          setInviteTeamLoader(false);
          return;
        }

        let path = Apis.deleteTeamMember;
        // //console.log;
        console.log("Api path for dashboard monthly plans api is", path);
        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          console.log("Response of add team api is", response);
          setInviteTeamLoader(false);
          if (response.data.status === true) {
            // Defensive: filter out team member by id, but handle possible null/undefined
            let teams = myTeam.filter((item) => {
              // If either item or team is null/undefined, skip comparison
              if (!item || !team) return true;
              // If either id is null/undefined, skip comparison
              if (item.id == null || team.id == null) return true;
              return item.id !== team.id;
            });
            setMyTeam(teams);
            setSnackTitle("Team member removed");
            setShowSnak(true);
            // Defensive: check nested properties before accessing
            if (
              u &&
              u.user &&
              team &&
              team.invitedUser &&
              typeof u.user.id !== "undefined" &&
              typeof team.invitedUser.id !== "undefined" &&
              u.user.id === team.invitedUser.id
            ) {
              //if current user deleted himself from the team then logout
              logout();
              router.push("/");
            }
          } else {
            // //console.log;
          }
        }
      }
    } catch (e) {
      console.error("Error deleting team member:", e);
      setInviteTeamLoader(false);
      setSnackTitle("Error removing team member");
      setShowSnak(true);
    }
  }

  const handleResendInvite = async (item) => {
    // //console.log;

    let data = {
      name: item.name,
      email: item.email,
      phone: item.phone,
    };
    setReInviteTeamLoader(true);
    await inviteTeamMember(data);
    setReInviteTeamLoader(false);
    setOpenMoreDropdown(false);
  };

  function canShowMenuDots(team) {
    //console.log;
    let user = localStorage.getItem(PersistanceKeys.LocalStorageUser);
    if (user) {
      try {
        user = JSON.parse(user);
        user = user.user;
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        return false;
      }
    }
    // //console.log;
    // //console.log;
    if (user?.userRole == "Invitee") {
      if (team.invitedUser?.id == user.id) {
        return true; // show menu at own profile
      }
      return false;
    } else if (user?.userRole == "AgentX") {
      if (team.invitedUser?.id == user.id) {
        return false; // don't show menu at own profile for admin
      }
      return true;
    }
    return true;
  }
  function canShowResendOption(team) {
    // //console.log

    if (team.status === "Accepted") {
      return false;
    }
    // return
    let user = localStorage.getItem("User");
    if (user) {
      try {
        user = JSON.parse(user);
        user = user.user;
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        return false;
      }
    }
    if (user.userRole == "Invitee") {
      if (team.invitedUser?.id == user.id) {
        return false; // show menu at own profile
      }
      return true;
    }
    if (user.userRole == "AgentX") {
      if (team.invitedUser?.id == user.id) {
        return false; // show menu at own profile
      }
      return true;
    }

    return true;
  }
  // function canShowInviteButton() {
  //  // //console.log
  //   if (typeof window !== "undefined") {
  //     let user = localStorage.getItem("User")
  //     if (user) {
  //       user = JSON.parse(user);
  //      // //console.log
  //       if (user.userRole == "AgentX") {
  //         return true;
  //       }
  //       return false;
  //     }else{
  //      // //console.log
  //     }
  //   }
  // }

  function canShowInviteButton() {
    // //console.log;
    if (typeof localStorage != "undefined") {
      let user = localStorage.getItem(PersistanceKeys.LocalStorageUser);
      if (user) {
        try {
          user = JSON.parse(user);
          user = user.user;
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          return false;
        }
      }
      //console.log;
      if (user?.userRole == "AgentX" || user?.userRole == "Agency") {
        //console.log
        return true;
      }
      return false;
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      {showSnak && (
        <AgentSelectSnackMessage
          isVisible={showSnak}
          hide={() => setShowSnak(false)}
          message={snackTitle}
          type={SnackbarTypes.Success}
        />
      )}
      <div
        className=" w-full flex flex-row justify-between items-center py-4 mt-2 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <div style={{ fontSize: 24, fontWeight: "600" }}>Team</div>

        <div className="flex flex-row items-center gap-2">
          <NotficationsDrawer />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 0,
          bottom: 0
        }}>
        <DashboardSlider
          needHelp={false} />
      </div>

      <div
        className="flex h-[90vh] w-full justify-center overflow-auto pb-50"
        style={{ scrollbarWidth: "none" }}
      >
        {getTeamLoader ? (
          <div className="w-full pt-[100px] flex flex-col items-center">
            <CircularProgress size={40} />
          </div>
        ) : (
          <div className="w-11/12 flex flex-col items-start">
            {canShowInviteButton() && myTeam.length !== 0 && (
              <div className="w-full flex flex-row items-center justify-end">
                <button
                  className="rounded-lg text-white bg-purple mt-8"
                  style={{
                    fontWeight: "500",
                    fontSize: "16",
                    height: "50px",
                    width: "173px",
                  }}
                  onClick={() => setOpenInvitePopup(true)}
                >
                  {agencyData?.sellSeats || userLocalData?.sellSeats ? `Add Team $${userLocalData.costPerSeat}/mo` : "+ Invite Team"}
                </button>
              </div>
            )}

            {myTeam.length > 0 ? (
              <div
                className="pt-3 flex flex-row w-full flex-wrap"
                style={{ overflow: "auto", scrollbarWidth: "none" }}
              >
                {myTeam.map((item, index) => {
                  // //console.log;
                  return (
                    <div key={item.id} className="relative w-4/12 p-3">
                      <div className="p-4 flex flex-row justify-between items-start border rounded-lg">

                        {/* Img code here */}
                        <div className="flex flex-row items-start gap-4">
                          <div>
                            {item.invitedUser?.thumb_profile_image ? (
                              <div
                                style={{
                                  width: "37px",
                                  height: "37px",
                                  borderRadius: "50%", // Ensures circular shape
                                  overflow: "hidden", // Clips any overflow from the image
                                  display: "flex", // Centers the image if needed
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <img
                                  src={item.invitedUser?.thumb_profile_image}
                                  alt="*"
                                  style={{ height: "100%", width: "100%" }}
                                />
                              </div>
                            ) : (
                              <div
                                className="flex rounded-full justify-center items-center bg-black text-white text-md"
                                style={{
                                  height: 37,
                                  width: 37,
                                  textTransform: "capitalize",
                                }}
                              >
                                {item.name?.[0] || 'U'}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap flex-col items-start gap-2">
                            <div className="text-lg font-medium text-black">
                              {item.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                              {item?.phone ? formatPhoneNumber(item.phone) : 'No phone'}
                            </div>
                            <div className="text-sm font-medium text-gray-500 underline">
                              {item.email.length > 25 ? item.email.slice(0, 25) + "..." : item.email}
                            </div>
                            <div
                              className={`text-sm font-medium ${item.status === "Pending"
                                ? "text-red-500"
                                : "text-green-500"
                                }`}
                            >
                              {item.status}
                            </div>
                          </div>
                        </div>

                        {canShowMenuDots(item) && (
                          <button
                            id={`dropdown-toggle-${item.id}`}
                            onClick={(e) => handlePopoverOpen(e, item)}
                            className="relative"
                          >
                            <img
                              src={"/otherAssets/threeDotsIcon.png"}
                              height={24}
                              width={24}
                              alt="threeDots"
                            />
                          </button>
                        )}
                      </div>

                      {/* Custom Dropdown
                      {moreDropdown === item.id && (
                        <div
                          className="absolute right-0  top-10 bg-white border rounded-lg shadow-lg z-10"
                          style={{ width: "200px" }}
                        >
                          {canShowResendOption(item) && (
                            <div
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-800"
                              onClick={() => {
                                handleResendInvite(item);
                                setMoreDropdown(null);
                              }}
                            >
                              Resend Invite
                            </div>
                          )}
                          <div
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-red-500"
                            onClick={() => {
                              // //console.log;
                              DeleteTeamMember(item);
                              setMoreDropdown(null);
                            }}
                          >
                            Delete
                          </div>
                        </div>
                      )} */}

                      <Popover
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handlePopoverClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        PaperProps={{
                          sx: {
                            boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.02), 0px 0px 4px rgba(0, 0, 0, 0.02)",
                            border: "none", // optional: add a light border instead
                          },
                        }}
                      >
                        <div className="flex flex-col">
                          {popoverTeam && canShowResendOption(popoverTeam) && (
                            <MenuItem
                              onClick={() => {
                                handleResendInvite(popoverTeam);
                                handlePopoverClose();
                              }}
                            >
                              Resend Invite
                            </MenuItem>
                          )}
                          <MenuItem
                            sx={{ color: "red" }}
                            onClick={() => {
                              DeleteTeamMember(popoverTeam);
                              handlePopoverClose();
                            }}
                          >
                            Delete
                          </MenuItem>
                        </div>
                      </Popover>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-screen w-full flex flex-col items-center justify-center -mt-16">
                <Image
                  src={"/otherAssets/noTemView.png"}
                  height={280}
                  width={240}
                  alt="*"
                />
                {agencyData?.sellSeats || userLocalData?.sellSeats ? (
                  <div className="w-full flex flex-col items-center -mt-12 gap-4">
                    <div style={{ fontWeight: "700", fontSize: 22 }}>
                      Add Team (${userLocalData.costPerSeat}/mo)
                    </div>
                    <div style={{ fontWeight: "400", fontSize: 15 }}>
                      Add Seats With Full Access
                    </div>
                    <div className="text-center" style={{ fontWeight: "400", fontSize: 15, width: "700px" }}>
                      Unlock full access for your team by adding an extra seat to your account. <span className="text-purple">For just ${userLocalData.costPerSeat} per additional user</span>, per month. Your team member will have complete access to all features, allowing seamless collaboration, lead management, and AI agent usage. Empower your team to work smarter—add a seat and scale your success effortlessly.
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center -mt-12 gap-4">
                    <div style={{ fontWeight: "700", fontSize: 22 }}>
                      Add Your Team
                    </div>
                    <div style={{ fontWeight: "400", fontSize: 15 }}>
                      Add team member to better manage your leads
                    </div>
                  </div>
                )}
                <div className="">
                  <button
                    className="rounded-lg text-white bg-purple mt-8"
                    style={{
                      fontWeight: "500",
                      fontSize: "16",
                      height: "50px",
                      width: "173px",
                    }}
                    onClick={() => setOpenInvitePopup(true)}
                  >
                    {agencyData?.sellSeats || userLocalData?.sellSeats ? `Add Team $${userLocalData.costPerSeat}/mo` : "+ Invite Team"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        open={openInvitePopup}
        onClose={() => setOpenInvitePopup(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: "#00000030",
            // backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-5/12 sm:w-full w-6/12r" sx={styles.modalsStyle}>
          <AgentSelectSnackMessage
            isVisible={showError}
            hide={() => setShowError(false)}
            message={"Enter all credentials"}
          />
          <div className="flex flex-row justify-center w-full">
            <div
              className="sm:w-full w-full p-8"
              style={{
                backgroundColor: "#ffffff",

                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-3">
                  <div
                    style={{ fontSize: 16, fontWeight: "500", color: "#000" }}
                  >
                    New Invite
                  </div>
                </div>
                <CloseBtn onClick={() => { setOpenInvitePopup(false); }} />
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#000",
                  marginTop: 20,
                }}
              >
                Invite Team
              </div>

              <div className="pt-5" style={styles.headingStyle}>
                Name
              </div>
              <input
                placeholder="Type here"
                className="w-full border mt-2 rounded p-2 outline-none outline-none focus:ring-0"
                style={styles.inputFieldStyle}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowError(false);
                }}
              />

              <div className="pt-5 w-full flex flex-row items-center justify-between">
                <div style={styles.headingStyle}>
                  Email Address
                </div>
                <div>
                  {emailLoader ? (
                    <p style={{ ...styles.errmsg, color: "black" }}>
                      Checking ...
                    </p>
                  ) : (
                    <div>
                      {email && emailCheckResponse ? (
                        <p
                          style={{
                            ...styles.errmsg,
                            color:
                              emailCheckResponse?.status === true
                                ? "green"
                                : "red",
                          }}
                        >
                          {emailCheckResponse?.message
                            ?.slice(0, 1)
                            .toUpperCase() +
                            emailCheckResponse?.message?.slice(1)}
                        </p>
                      ) : (
                        <div />
                      )}
                    </div>
                  )}
                  <div style={{ ...styles.errmsg, color: "red" }}>
                    {validEmail}
                  </div>
                </div>
              </div>

              <input
                placeholder="Type here"
                className="w-full border rounded mt-2 p-2 focus:ring-0 outline-none"
                style={styles.inputFieldStyle}
                value={email}
                onChange={(e) => {
                  let value = e.target.value;
                  setEmail(value);
                  setShowError(false);
                  if (timerRef.current) {
                    clearTimeout(timerRef.current);
                  }

                  setEmailCheckResponse(null);

                  if (!value) {
                    // //console.log;
                    setValidEmail("");
                    return;
                  }

                  if (!validateEmail(value)) {
                    // //console.log;
                    setValidEmail("Invalid");
                  } else {
                    // //console.log;
                    if (value) {
                      // Set a new timeout
                      timerRef.current = setTimeout(() => {
                        checkEmail(value);
                      }, 300);
                    } else {
                      // Reset the response if input is cleared
                      setEmailCheckResponse(null);
                      setValidEmail("");
                    }
                  }
                }}
              />

              <div className="pt-5 flex flex-row items-center justify-between w-full">
                <div style={styles.headingStyle}>
                  Phone Number
                </div>
                {/* Code for error messages */}
                <div>
                  <div>
                    {errorMessage && (
                      <div
                        className={`text-red`}
                        style={{
                          ...styles.errmsg,
                          color:
                            checkPhoneResponse?.status === true ? "green" : "red",
                        }}
                      >
                        {errorMessage}
                      </div>
                    )}
                  </div>
                  <div>
                    {checkPhoneLoader && (
                      <div
                        className={`text-red`}
                        style={{ ...styles.errmsg }}
                      >
                        {checkPhoneLoader}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 w-full mt-3">
                <div className="flex flex-row items-center gap-2 border rounded-lg w-full justify-between pe-4">
                  <div className="w-full">
                    <PhoneInput
                      className="outline-none bg-transparent focus:ring-0"
                      country="us" // Default country
                      value={phone}
                      onChange={handlePhoneNumberChange}
                      // placeholder={locationLoader ? "Loading location ..." : "Enter Number"}
                      placeholder={"Type here"}
                      // disabled={loading}
                      style={{
                        borderRadius: "7px",
                        outline: "none", // Ensure no outline on wrapper
                        boxShadow: "none", // Remove any shadow
                      }}
                      inputStyle={{
                        width: "100%",
                        borderWidth: "0px",
                        backgroundColor: "transparent",
                        paddingLeft: "60px",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        fontSize: 15,
                        fontWeight: "500",
                        height: "50px",
                        outline: "none", // Remove outline on input
                        boxShadow: "none", // Remove shadow as well
                      }}
                      buttonStyle={{
                        border: "none",
                        backgroundColor: "transparent",
                        outline: "none", // Ensure no outline on button
                      }}
                      dropdownStyle={{
                        maxHeight: "150px",
                        overflowY: "auto",
                      }}
                      countryCodeEditable={true}
                    // defaultMask={locationLoader ? "Loading..." : undefined}
                    />
                  </div>
                </div>
              </div>

              {inviteTeamLoader ? (
                <div className="flex flex-col items-center p-5">
                  <CircularProgress size={30} />
                </div>
              ) : (
                <button
                  style={{
                    marginTop: 20,
                    backgroundColor:
                      !name ||
                        !email ||
                        !phone ||
                        emailCheckResponse?.status !== true ||
                        checkPhoneResponse?.status !== true
                        ? "#00000020"
                        : "",
                  }}
                  className="w-full flex bg-purple p-3 rounded-lg items-center justify-center"
                  onClick={() => {
                    let data = {
                      name: name,
                      email: email,
                      phone: phone,
                    };
                    inviteTeamMember(data);
                  }}
                  disabled={
                    !name ||
                    !email ||
                    !phone ||
                    emailCheckResponse?.status !== true ||
                    checkPhoneResponse?.status !== true
                  }
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color:
                        !name ||
                          !email ||
                          !phone ||
                          emailCheckResponse?.status !== true ||
                          checkPhoneResponse?.status !== true
                          ? "#000000"
                          : "#ffffff",
                    }}
                  >
                    {agencyData?.sellSeats || userLocalData?.sellSeats ? `Add Team $${userLocalData.costPerSeat}/mo` : "Send Invite"}
                  </div>
                </button>
              )}

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default Teams;

const styles = {
  itemText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#000",
  },
  deleteText: {
    fontSize: "16px",
    fontWeight: "500",
    color: "#FF4D4F", // Red color for delete
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
  headingStyle: {
    fontSize: 12,
    fontWeight: "400",
    color: "#00000050",
  },
  inputFieldStyle: {
    fontSize: 15,
    fontWeight: "500",
    // marginTop: 10,
    border: "1px solid #00000010",
    height: "50px",
  },
  errmsg: {
    fontSize: 12,
    fontWeight: "500",
  },
};
