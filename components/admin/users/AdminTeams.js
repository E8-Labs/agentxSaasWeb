"use client";
import { Button, CircularProgress, colors, Fab } from "@mui/material";
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

function AdminTeam({ selectedUser }) {
  const timerRef = useRef(null);
  const router = useRouter();
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
  const [snackTitle, setSnackTitle] = useState("Team invite sent successfully");

  //variables for phone number err messages and checking
  const [errorMessage, setErrorMessage] = useState(null);
  const [checkPhoneLoader, setCheckPhoneLoader] = useState(null);
  const [checkPhoneResponse, setCheckPhoneResponse] = useState(null);
  const [countryCode, setCountryCode] = useState(""); // Default country

  const handleClick = (event) => {
    setOpenTeamDropdown(true);
    setteamDropdown(event.currentTarget);
  };

  const handleClose = (event) => {
    setSelectedItem(event.target.textContent);
    setOpenTeamDropdown(false);
  };

  const handleMoreClose = (event) => {
    // setSelectedItem(event.target.textContent)
    setOpenMoreDropdown(false);
  };

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
  }, [selectedUser]);

  //function to get team mebers api
  const getMyteam = async () => {
    try {
      setGetTeamLoader(true);
      const data = localStorage.getItem("User");

      if (data) {
        let u = JSON.parse(data);

        let path = Apis.getTeam;
        path = path + "?userId=" + selectedUser.id;
        // //console.log

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
            //console.log;
          }
        }
      }
    } catch (e) {
      setGetTeamLoader(false);

      //console.log;
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
        let u = JSON.parse(data);

        let path = Apis.inviteTeamMember;

        let apidata = {
          name: item.name,
          email: item.email,
          phone: item.phone,
        };

        // //console.log;

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setInviteTeamLoader(false);
          if (response.data.status === true) {
            // //console.log;
            let newMember = response.data.data;
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
            setSnackTitle("Team invite sent successfully");
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
      setInviteTeamLoader(false);
      setReInviteTeamLoader(false);
      // //console.log;
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

    // //console.log;
    // return;

    try {
      const data = localStorage.getItem("User");
      setInviteTeamLoader(true);
      if (data) {
        let u = JSON.parse(data);

        let path = Apis.deleteTeamMember;
        // //console.log;
        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setInviteTeamLoader(false);
          if (response.data.status === true) {
            // //console.log;
            // let tea
            let teams = myTeam.filter((item) => item.id != team.id);
            setMyTeam(teams);
            // getMyteam()
            setSnackTitle("Team member removed");
            setShowSnak(true);
            if (u.user.id == team.invitedUser.id) {
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
      setInviteTeamLoader(false);
      //// //console.log
      // //console.log;
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
    let user = localStorage.getItem(PersistanceKeys.LocalStorageUser);
    if (user) {
      user = JSON.parse(user);
      user = user.user;
    }
    // //console.log;
    // //console.log;
    if (user?.userRole == "Invitee") {
      if (team.invitedUser.id == user.id) {
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
      user = JSON.parse(user);
      user = user.user;
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
        user = JSON.parse(user);
        user = user.user;
      }
      // //console.log;
      if (user?.userRole == "AgentX") {
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
        className=" w-full flex flex-row justify-between items-center py-4 px-4"
      // style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <div style={{ fontSize: 24, fontWeight: "600" }}>Staff</div>
        {/* <div>
          <NotficationsDrawer />
        </div> */}
      </div>
      <div
        className="flex h-[60vh] w-full justify-center overflow-auto pb-50"
        style={{ scrollbarWidth: "none" }}
      >
        {getTeamLoader ? (
          <div className="w-full pt-[100px] flex flex-col items-center">
            <CircularProgress size={40} />
          </div>
        ) : (
          <div className="w-11/12 flex flex-col items-start">
            {canShowInviteButton() && (
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
                  + Invite Team
                </button>
              </div>
            )}

            {myTeam.length > 0 ? (
              <div
                className="pt-3 flex flex-row flex-wrap gap-6"
                style={{ overflow: "auto", scrollbarWidth: "none" }}
              >
                {myTeam.map((item, index) => {
                  // //console.log;
                  return (
                    <div key={item.id} className="relative">
                      <div className="p-4 flex flex-row gap-4 items-start border rounded-lg">
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
                            {item.name[0]}
                          </div>
                        )}

                        <div className="flex flex-wrap flex-col items-start gap-2 w-60">
                          <div className="text-lg font-medium text-black">
                            {item.name}
                          </div>
                          <div className="text-sm font-medium text-gray-500">
                            {formatPhoneNumber(item?.phone)}
                          </div>
                          <div className="text-sm font-medium text-gray-500 underline">
                            {item.email}
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

                        {canShowMenuDots(item) && (
                          <button
                            id={`dropdown-toggle-${item.id}`}
                            onClick={() =>
                              setMoreDropdown(
                                moreDropdown === item.id ? null : item.id
                              )
                            }
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

                      {/* Custom Dropdown */}
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
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-screen w-full flex flex-col items-center justify-center">
                <div>
                  <Image
                    src={"/svgIcons/noTeamIcon2.svg"}
                    height={291}
                    width={249}
                    alt="*"
                  />
                </div>
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
                    + Invite Team
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
                <button
                  onClick={() => {
                    setOpenInvitePopup(false);
                  }}
                >
                  <Image
                    src={"/otherAssets/crossIcon.png"}
                    height={24}
                    width={24}
                    alt="*"
                  />
                </button>
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
                className="w-full border rounded p-2 outline-none outline-none focus:ring-0"
                style={styles.inputStyle}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowError(false);
                }}
              />

              <div className="pt-5" style={styles.headingStyle}>
                Email Address
              </div>
              <div className="text-end">
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
              <input
                placeholder="Type here"
                className="w-full border rounded p-2 focus:ring-0 outline-none"
                style={styles.inputStyle}
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

              <div className="pt-5" style={styles.headingStyle}>
                Phone Number
              </div>
              {/* Code for error messages */}
              <div className="w-full mt-2">
                <div>
                  {errorMessage && (
                    <div
                      className={`text-end text-red`}
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
                      className={`text-end text-red`}
                      style={{ ...styles.errmsg }}
                    >
                      {checkPhoneLoader}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-row items-center justify-center gap-2 w-full mt-3">
                <div className="flex flex-row items-center gap-2 border rounded-lg w-full justify-between pe-4">
                  <div className="w-full">
                    <PhoneInput
                      className="outline-none bg-transparent focus:ring-0"
                      country={"us"} // restrict to US only
                      onlyCountries={["us"]}
                      disableDropdown={true}
                      countryCodeEditable={false}
                      disableCountryCode={false} // Default country
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
                    Send Invite
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

export default AdminTeam;

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
  inputStyle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 10,
    border: "1px solid #00000010",
    height: "50px",
  },
  errmsg: {
    fontSize: 12,
    fontWeight: "500",
  },
};
