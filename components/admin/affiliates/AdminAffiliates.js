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
import { isValidUrl, PersistanceKeys } from "@/constants/Constants";
import { logout } from "@/utilities/UserUtility";
import { useRouter } from "next/navigation";
import { GetFormattedDateString, GetFormattedTimeString } from "@/utilities/utility";

function AdminAffiliates({ selectedUser }) {
  const timerRef = useRef(null);
  const router = useRouter();
  const [teamDropdown, setteamDropdown] = useState(null);
  const [openTeamDropdown, setOpenTeamDropdown] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(null);
  const [openMoreDropdown, setOpenMoreDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState("Noah's Team");
  const [openAffiliatePopup, setOpenAffiliatePopup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [officeHourUrl, setOfficeHourUrl] = useState("");
  const [uniqueUrl, SetUniqueUrl] = useState("");

  const [showError, setShowError] = useState(false);

  const [affiliatsList, setAffiliatesList] = useState([]);

  const [getAffeliatesLoader, setGetAffiliatesLoader] = useState(false);
  const [addAffiliateLoader, setAddAffiliateLoader] = useState(false);
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

  const [urlError, setUrlError] = useState("");
  const [urlError2, setUrlError2] = useState("");

  useEffect(() => { });

  useEffect(() => {
    if (typeof window !== "undefined") {
      let loc = getLocalLocation();
      setCountryCode(loc);
      getAffiliates();
    }
  }, [selectedUser]);

  useEffect(() => {
    let timer = setTimeout(() => {
      console.log("url timerfinished", isValidUrl(officeHourUrl));
      if (officeHourUrl) {
        if (isValidUrl(officeHourUrl)) {
          setUrlError("");
          console.log("url valid");
        } else {
          setUrlError("Invalid");
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [officeHourUrl]);

  //   useEffect(() => {
  //     let timer = setTimeout(() => {
  //       console.log("url timerfinished", isValidUrl(uniqueUrl));
  //       if (uniqueUrl) {
  //         if (isValidUrl(uniqueUrl)) {
  //           setUrlError2("");
  //           console.log("url valid");
  //         } else {
  //             setUrlError2("")
  //             //   setUrlError2("Invalid");
  //         }
  //       }
  //     }, 300);

  //     return () => clearTimeout(timer);
  //   }, [uniqueUrl]);

  //function to get team mebers api
  const getAffiliates = async (offset = 0) => {
    try {
      setGetAffiliatesLoader(true);
      const data = localStorage.getItem("User");

      if (data) {
        let u = JSON.parse(data);

        let path = Apis.getAffiliate + "?offset=" + offset;
        // console.log('u.token', u.token)

        const response = await axios.get(path, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setGetAffiliatesLoader(false);
          console.log("get affiliate api data is", response.data.data);

          if (response.data.status === true) {
            setAffiliatesList(response.data.data);
          } else {
            console.log("get team api message is", response.data.message);
          }
        }
      }
    } catch (e) {
      setGetAffiliatesLoader(false);

      console.log("error in get team api is", e);
    }
  };

  //funcion to invitem tem member
  const addAffiliate = async (item) => {
    console.log("data", item);
    // return
    if (
      !item.name ||
      !item.email ||
      !item.phone ||
      !item.officeHoursUrl ||
      !item.uniqueUrl
    ) {
      setShowError(true);
      return;
    }
    try {
      const data = localStorage.getItem("User");
      setAddAffiliateLoader(true);
      if (data) {
        let u = JSON.parse(data);

        let path = Apis.addAffiliate;

        let apidata = {
          name: item.name,
          email: item.email,
          phone: item.phone,
          officeHoursUrl: item.officeHoursUrl,
          uniqueUrl: item.uniqueUrl,
        };

        console.log("apidata", apidata);

        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          setAddAffiliateLoader(false);
          if (response.data.status === true) {
            console.log("add affiliate api response is", response.data.data);
            let newMember = response.data.data;
            // console.log("newMember", newMember);
            // console.log("--------------------------------");
            setAffiliatesList((prev) => {
              // console.log("previous member", prev);
              // console.log("--------------------------------");
              const isAlreadyPresent = prev.some(
                (member) => member.id === newMember.id
              ); // Check by unique ID
              // console.log("isAlreadyPresant", isAlreadyPresent);
              if (isAlreadyPresent) {
                // console.log("member already presant");
                return prev;
              }
              return [...prev, newMember];
            });
            setSnackTitle("Affiliate added successfully");
            setShowSnak(true);
            setOpenAffiliatePopup(false);
            setName("");
            setEmail("");
            setPhone("");
            SetUniqueUrl("");
            setOfficeHourUrl("");
            // getMyteam()
          } else {
            console.log("invite team api message is", response.data.message);
          }
        }
      }
    } catch (e) {
      setAddAffiliateLoader(false);
      console.log("error in invite team api is", e);
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
    // try {
    //   setValidEmail("");
    //   setEmailLoader(true);
    //   const ApiPath = Apis.CheckEmail;
    //   const ApiData = {
    //     email: value,
    //   };
    //   // console.log("Api data is :", ApiData);
    //   const response = await axios.post(ApiPath, ApiData, {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    //   if (response) {
    //     // console.log("Response of check email api is :", response);
    //     if (response.data.status === true) {
    //       // console.log("Response message is :", response.data.message);
    //       setEmailCheckResponse(response.data);
    //     } else {
    //       setEmailCheckResponse(response.data);
    //     }
    //   }
    // } catch (error) {
    //   // console.error("Error occured in check email api is :", error);
    // } finally {
    //   setEmailLoader(false);
    // }
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
    // parsePhoneNumberFromString(`+${phone}`, countryCode.toUpperCase())
    const parsedNumber = parsePhoneNumberFromString(`+${phoneNumber}`);
    // if (parsedNumber && parsedNumber.isValid() && parsedNumber.country === countryCode.toUpperCase()) {
    if (!parsedNumber || !parsedNumber.isValid()) {
      setErrorMessage("Invalid");
    }
    // else {
    //     setErrorMessage("");

    //     if (timerRef.current) {
    //         clearTimeout(timerRef.current);
    //     }

    //     try {
    //         setCheckPhoneLoader("Checking...");
    //         let response = await checkPhoneNumber(phoneNumber);
    //         // console.log("Response of check number api is", response);
    //         // setErrorMessage(null)
    //         setCheckPhoneResponse(response.data);
    //         if (response.data.status === false) {
    //             setErrorMessage("Taken");
    //         } else if (response.data.status === true) {
    //             setErrorMessage("Available");
    //         }
    //     } catch (error) {
    //         // console.error("Error occured in api is", error);
    //         setCheckPhoneLoader(null);
    //     } finally {
    //         setCheckPhoneLoader(null);
    //     }

    //     // setCheckPhoneResponse(null);
    //     // console.log("Trigered");
    // }
  };

  async function deleteAffiliate(item) {
    console.log("Deleting ", item);
    // return; let phoneNumber = team.phone;
    let apidata = {
      id: item.id,
    };

    console.log("data to delete", apidata);
    // return;

    try {
      const data = localStorage.getItem("User");
      //   setInviteTeamLoader(true);
      if (data) {
        let u = JSON.parse(data);

        let path = Apis.deleteAffiliate;
        // console.log("token ", u.token);
        const response = await axios.post(path, apidata, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        if (response) {
          //   setInviteTeamLoader(false);
          if (response.data.status === true) {
            console.log("delete team api response is", response.data);
            // let tea
            let teams = affiliatsList.filter(
              (affiliate) => affiliate.id !== item.id
            );
            // getMyteam()
            setSnackTitle("Affiliate removed");
            setShowSnak(true);
            // if (u.user.id == team.invitedUser.id) {
            //   //if current user deleted himself from the team then logout
            //   logout();
            //   router.push("/");
            // }
          } else {
            console.log("delete team api message is", response.data);
          }
        }
      }
    } catch (e) {
      //   setInviteTeamLoader(false);
      //// console.log()
      // console.log("error in delete team api is", e);
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
        className=" w-full flex flex-row justify-between items-center py-4 px-10"
      // style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <div style={{ fontSize: 24, fontWeight: "600" }}>Affiliates</div>
      </div>
      <div
        className="flex w-full justify-center overflow-auto pb-50"
        style={{ scrollbarWidth: "none" }}
      >

        <div className="w-11/12 flex flex-col items-start">
          <div className="w-full flex flex-row items-center justify-end">
            <button
              className="rounded-lg text-white bg-purple mt-4"
              style={{
                fontWeight: "500",
                fontSize: "16",
                height: "50px",
                width: "173px",
              }}
              onClick={() => setOpenAffiliatePopup(true)}
            >
              Add Affiliate
            </button>
          </div>


          <div className="w-full flex flex-row  mt-12">
            <div className="w-3/12">
              <div style={styles.text}>Name</div>
            </div>
            <div className="w-2/12">
              <div style={styles.text}>Email</div>
            </div>
            <div className="w-2/12">
              <div style={styles.text}>Contact Number</div>
            </div>
            <div className="w-2/12">
              <div style={styles.text}>Unique Url</div>
            </div>

            <div className="w-1/12">
              <div style={styles.text}>Total Users</div>
            </div>

            <div className="w-1/12">
              <div style={styles.text}>Revenue</div>
            </div>

            <div className="w-1/12">
              <div style={styles.text}>Date</div>
            </div>
          </div>

          {getAffeliatesLoader ? (
            <div className="w-full pt-[100px] flex flex-col items-center">
              <CircularProgress size={40} />
            </div>
          ) : (
            affiliatsList.length > 0 ? (
              <div
                className="flex flex-col h-[68vh] w-full"
                style={{ overflow: "auto", scrollbarWidth: "none" }}
              >
                {affiliatsList.map((item) => (
                  <div
                    key={item.id}
                    style={{ cursor: "pointer" }}
                    className="w-full flex flex-row items-center mt-5 hover:bg-[#402FFF05]"
                  >
                    <div className="w-3/12 flex flex-row gap-2 items-center">
                      <div className="h-[40px] w-[40px] rounded-full bg-black flex flex-row items-center justify-center text-white">
                        {item.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div style={styles.text2}>
                        {item.name}
                      </div>
                    </div>
                    <div className="w-2/12">
                      <div style={styles.text2}>
                        {item.email}
                      </div>
                    </div>
                    <div className="w-2/12">
                      {/* (item.LeadModel?.phone) */}
                      <div style={styles.text2}>
                        {item.phone ? (
                          <div>{formatPhoneNumber(item?.phone)}</div>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                    <div className="w-2/12">
                      <div style={styles.text2}>
                        {item.uniqueUrl
                          ? item.uniqueUrl
                          : "-"}
                      </div>
                    </div>
                    <div className="w-1/12">
                      <div style={styles.text2}>
                        {item.totalUsers}
                      </div>

                    </div>
                    <div className="w-1/12">
                      <div style={styles.text2}>
                        {item.totalSpent ? (`$${item.totalSpent}`) : "-"}
                      </div>
                    </div>

                    <div className="w-1/12">
                      <div style={styles.text2}>
                        {GetFormattedDateString(item.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[68vh] w-full flex flex-col items-center justify-center">
                <div style={{ fontSize: 15, fontWeight: "500" }}>
                  No affiliates found
                </div>
              </div>
            ))}
        </div>
      </div>

      <Modal
        open={openAffiliatePopup}
        onClose={() => setOpenAffiliatePopup(false)}
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
                    Add Affiliate
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpenAffiliatePopup(false);
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


                  if (!value) {
                    // console.log("Should set the value to null");
                    setValidEmail("");
                    return;
                  }

                  if (!validateEmail(value)) {
                    // console.log("Invalid pattern");
                    setValidEmail("Invalid");
                  }else{
                    setValidEmail("")
                  }
                }
                }
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
                        color: "red",
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}
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

              <div className="w-full flex flex-row items-center justify-between">
                <div className="pt-5" style={styles.headingStyle}>
                  Office Hours Url
                </div>
                {urlError && (
                  <div style={{ ...styles.errmsg, color: "red" }}>
                    {urlError}
                  </div>
                )}
              </div>
              <input
                placeholder="url"
                className="w-full border rounded p-2 outline-none outline-none focus:ring-0"
                style={styles.inputStyle}
                value={officeHourUrl}
                onChange={(e) => {
                  setOfficeHourUrl(e.target.value);
                  setUrlError("");
                }}
              />
              <div className="w-full flex flex-row items-center justify-between">
                <div className="pt-5" style={styles.headingStyle}>
                  Unique Url
                </div>
                {urlError2 && (
                  <div style={{ ...styles.errmsg, color: "red" }}>
                    {urlError2}
                  </div>
                )}
              </div>
              <input
                placeholder="url"
                className="w-full border rounded p-2 outline-none outline-none focus:ring-0"
                style={styles.inputStyle}
                value={uniqueUrl}
                onChange={(e) => {
                  SetUniqueUrl(e.target.value);
                  setUrlError2("");
                }}
              />

              {addAffiliateLoader ? (
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
                        //   emailCheckResponse?.status !== true ||
                        //   checkPhoneResponse?.status !== true ||
                        !!urlError ||
                        //   !!urlError2 ||
                        !uniqueUrl ||
                        !officeHourUrl
                        ? "#00000020"
                        : "",
                  }}
                  className="w-full flex bg-purple p-3 rounded-lg items-center justify-center"
                  onClick={() => {
                    let data = {
                      name: name,
                      email: email,
                      phone: phone,
                      uniqueUrl: uniqueUrl,
                      officeHoursUrl: officeHourUrl,
                    };
                    addAffiliate(data);
                  }}
                  disabled={
                    !name ||
                    !email ||
                    !phone ||
                    // emailCheckResponse?.status !== true ||
                    // checkPhoneResponse?.status !== true ||
                    !!urlError ||
                    // !!urlError2 ||
                    !uniqueUrl ||
                    !officeHourUrl
                  }
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: "500",
                      color:
                        !name || !email || !phone
                          ? // emailCheckResponse?.status !== true ||
                          // checkPhoneResponse?.status !== true
                          "#000000"
                          : "#ffffff",
                    }}
                  >
                    Add Affiliate
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

export default AdminAffiliates;

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
};
