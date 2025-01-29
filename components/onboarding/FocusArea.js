import React, { useState, useEffect, useRef } from "react";
import ProgressBar from "@/components/onboarding/ProgressBar";
import { useRouter } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Image from "next/image";
import axios from "axios";
import Apis from "../apis/Apis";
import { CircularProgress } from "@mui/material";
import { PersistanceKeys } from "@/constants/Constants";
import { GetAreasOfFocusForUser } from "@/utilities/AreaOfFocus";

const FocusArea = ({
  handleContinue,
  handleBack,
  DefaultData,
  handleSalesAgentContinue,
  handleSolarAgentContinue,
  handleInsuranceContinue,
  handleMarketerAgentContinue,
  handleWebsiteAgentContinue,
  handleRecruiterAgentContinue,
  handleTaxAgentContinue,
}) => {
  const othersFocus = useRef();

  const router = useRouter();

  const [focusArea, setFocusArea] = useState([]);
  const [focusAreaTitle, setFocusAreaTitle] = useState("");
  const [loader, setLoader] = useState(false);
  const [focusData, setFocusData] = useState([]);
  const [shouldContinue, setShouldContinue] = useState(true);

  //others focus are field
  const [otherType, setOtherType] = useState("");
  const [checkOthersFocusArea, setCheckOthersFocusArea] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);

  useEffect(() => {
    const focusData = localStorage.getItem(PersistanceKeys.RegisterDetails);
    if (focusData) {
      const FocusAreaDetails = JSON.parse(focusData);
      // console.log("Local details are :", FocusAreaDetails);
      setFocusArea(FocusAreaDetails.focusAreaId);
      setFocusAreaTitle(FocusAreaDetails.areaFocusTitle);
      if (FocusAreaDetails.userTypeTitle !== "RealEstateAgent") {
        setShowOtherInput(true);
      }
    }
  }, []);

  useEffect(() => {
    getDefaultData();
  }, []);

  //function to get the default data
  const getDefaultData = async () => {
    try {
      // setLoader(true);
      const selectedServiceID = localStorage.getItem(
        PersistanceKeys.RegisterDetails
      );
      let AgentTypeTitle = null;
      if (selectedServiceID) {
        const serviceIds = JSON.parse(selectedServiceID);
        // console.log("Userdetails are", serviceIds);
        AgentTypeTitle = serviceIds.userTypeTitle;
      }
      const focusData = localStorage.getItem(PersistanceKeys.RegisterDetails);
      if (focusData) {
        const FocusAreaDetails = JSON.parse(focusData);
        if (FocusAreaDetails.userTypeTitle !== "RecruiterAgent") {
          let servicesLocal = GetAreasOfFocusForUser(AgentTypeTitle);
          setFocusData(servicesLocal);
        }

        // console.log("Check 1 clear !!!");
        const ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`;
        // console.log("Api link is:--", ApiPath);
        const response = await axios.get(ApiPath, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response) {
          // console.log("Response of api is : -----", response.data);

          //// console.log("Registeration details", FocusAreaDetails);
          if (FocusAreaDetails.userTypeTitle === "RecruiterAgent") {
            //// console.log("I am recruiter")
            // console.log("Recruiter", response?.data?.data?.userIndustry);
            setFocusData(response?.data?.data?.userIndustry);
          } else {
            //// console.log("I am other")
            setFocusData(response?.data?.data?.areaOfFocus);
          }
        }
      } else {
        alert(response.data);
      }
    } catch (error) {
      // console.error("ERror occured in default data api is :----", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    // console.log("Focus area is :", focusArea);
    if (focusArea.length > 0 || otherType.length > 0) {
      setShouldContinue(false);
    } else if (focusArea.length === 0) {
      setShouldContinue(true);
    }
  }, [focusArea, otherType]);

  const handleNext = () => {
    const data = localStorage.getItem(PersistanceKeys.RegisterDetails);

    if (data) {
      const LocalDetails = JSON.parse(data);
      // console.log("Local details are", LocalDetails);
      let agentType = LocalDetails.userTypeTitle;

      let details = LocalDetails;
      // details.focusAreaId = focusArea;

      if (Array.isArray(focusArea)) {
        // Append otherType only if it has a value
        details.focusAreaId = otherType.trim()
          ? [...focusArea, otherType]
          : [...focusArea];
      } else {
        // Initialize focusAreaId with otherType only if it has a value
        details.focusAreaId = otherType.trim() ? [otherType] : [];
      }

      // console.log("Updated details are", details);

      // return
      localStorage.setItem(
        PersistanceKeys.RegisterDetails,
        JSON.stringify(details)
      );

      // handleSalesAgentContinue,
      //     handleSolarAgentContinue,
      //     handleInsuranceContinue,
      //     handleMarketerAgentContinue,
      //     handleWebsiteAgentContinue,
      //     handleRecruiterAgentContinue,
      //     handleTaxAgentContinue,

      // console.log("Agent type is", agentType);

      if (agentType === "RealEstateAgent") {
        handleContinue();
      } else if (agentType === "SalesDevRep") {
        handleContinue();
      } else if (agentType === "SolarRep") {
        handleContinue();
      } else if (agentType === "InsuranceAgent") {
        handleContinue();
      } else if (agentType === "MarketerAgent") {
        handleContinue();
      } else if (agentType === "WebsiteAgent") {
        handleContinue();
      } else if (agentType === "RecruiterAgent") {
        handleContinue();
      } else if (agentType === "TaxAgent") {
        handleContinue();
      }
    }

    // if (data) {
    //     const details = JSON.parse(data);
    //     details.focusAreaId = focusArea;
    //     localStorage.setItem(PersistanceKeys.RegisterDetails, JSON.stringify(details));
    //     if (focusArea.length > 0) {
    //         handleContinue();
    //     }
    // }
  };

  const handlefocusArea = (id) => {
    // setFocusArea(prevId => (prevId === id ? null : id))
    setFocusArea((prevIds) => {
      if (prevIds.includes(id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, id];
      }
    });
  };

  //function to activate others field
  const handleSelectOthersField = () => {
    if (checkOthersFocusArea) {
      if (focusArea.current) {
        focusArea.current.blur(); // Remove focus from the input
      }
      setOtherType("");
    } else {
      othersFocus.current.focus();
    }
    setCheckOthersFocusArea(!checkOthersFocusArea);
  };

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-hidden flex flex-row justify-center items-center"
    >
      <div
        className="bg-white sm:rounded-2xl flex flex-col justify-between w-full sm:mx-2 md:w-10/12 sm:h-[90%] py-4 "
        style={{ scrollbarWidth: "none" }} //overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <div className="h-[90svh] sm:h-[82svh]">
          {/* header 84svh */}
          <div className="h-[10%]">
            <Header />
          </div>
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full h-[90%]">
            <div
              className="mt-6 w-9/12 sm:w-11/12 md:text-4xl text-lg font-[600]"
              style={{ textAlign: "center" }}
            >
              {focusAreaTitle ? focusAreaTitle : ""}
            </div>

            {loader ? (
              <div className="w-full flex flex-row items-center justify-center h-screen">
                <CircularProgress size={35} />
              </div>
            ) : (
              <div
                className="mt-2 sm:mt-8 md:10/12 w-full lg:w-7/12 gap-4 flex flex-col sm:max-h-[90%] max-h-[100%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
                // style={{ scrollbarWidth: "none" }}
              >
                {focusData.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handlefocusArea(item.id);
                    }}
                    className="border-none outline-none"
                  >
                    <div
                      className="border bg-white flex flex-row items-start pt-3 w-full rounded-2xl"
                      style={{
                        border: focusArea.includes(item.id)
                          ? "2px solid #7902DF"
                          : "",
                        scrollbarWidth: "none",
                        backgroundColor: focusArea.includes(item.id)
                          ? "#402FFF05"
                          : "",
                      }}
                    >
                      <div className="w-full flex flex-row items-start justify-between px-4 py-2">
                        <div className="text-start w-[100%] md:w-[90%]">
                          <div
                            style={{
                              fontFamily: "",
                              fontWeight: "700",
                              fontSize: 20,
                            }}
                          >
                            {item.title}
                          </div>
                          <div className="mt-2">{item.description}</div>
                        </div>
                        {focusArea.includes(item.id) ? (
                          <Image
                            src={"/assets/charmTick.png"}
                            alt="*"
                            height={36}
                            width={36}
                          />
                        ) : (
                          <Image
                            src={"/assets/charmUnMark.png"}
                            alt="*"
                            height={36}
                            width={36}
                          />
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {showOtherInput && (
                  <div className="border-none outline-none">
                    <div
                      className="border bg-white flex flex-row items-start pt-3 w-full rounded-2xl"
                      style={{
                        border: checkOthersFocusArea ? "2px solid #7902DF" : "",
                        scrollbarWidth: "none",
                        backgroundColor: checkOthersFocusArea
                          ? "#402FFF05"
                          : "",
                      }}
                    >
                      <div className="w-full flex flex-row items-start justify-between px-4 py-2">
                        <div className="text-start w-[100%] md:w-[90%]">
                          <button
                            onClick={handleSelectOthersField}
                            style={{
                              fontFamily: "",
                              fontWeight: "700",
                              fontSize: 20,
                              width: "100%",
                              backgroundColor: "",
                              textAlign: "start",
                              outline: "none",
                            }}
                          >
                            Other (Type in)
                          </button>
                          <div className="mt-2">
                            <input
                              ref={othersFocus}
                              className="outline-none border-none focus:ring-0 w-full"
                              style={{
                                fontFamily: "",
                                fontWeight: "500",
                                fontSize: 15,
                                color: "#151515",
                                border: "0px solid black",
                              }}
                              placeholder="Type here..."
                              value={otherType}
                              onChange={(e) => {
                                let value = e.target.value;
                                setOtherType(value);
                                if (value) {
                                  setCheckOthersFocusArea(true);
                                }
                              }}
                            />
                          </div>
                        </div>
                        <button onClick={handleSelectOthersField}>
                          {checkOthersFocusArea ? (
                            <Image
                              src={"/assets/charmTick.png"}
                              alt="*"
                              height={36}
                              width={36}
                            />
                          ) : (
                            <Image
                              src={"/assets/charmUnMark.png"}
                              alt="*"
                              height={36}
                              width={36}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* <Body /> */}
              </div>
            )}
          </div>
        </div>

        <div className="h-[10%]">
          <div>
            <ProgressBar value={60} />
          </div>

          <Footer
            handleContinue={() => {
              let windowWidth = 1000;
              if (typeof window !== "undefined") {
                windowWidth = window.innerWidth;
              }
              if (windowWidth < 640) {
                const data = localStorage.getItem(
                  PersistanceKeys.RegisterDetails
                );

                if (data) {
                  const LocalDetails = JSON.parse(data);
                  // console.log("Local details are", LocalDetails);
                  let agentType = LocalDetails.userTypeTitle;

                  let details = LocalDetails;
                  // details.focusAreaId = focusArea;

                  if (Array.isArray(focusArea)) {
                    // Append otherType only if it has a value
                    details.focusAreaId = otherType.trim()
                      ? [...focusArea, otherType]
                      : [...focusArea];
                  } else {
                    // Initialize focusAreaId with otherType only if it has a value
                    details.focusAreaId = otherType.trim() ? [otherType] : [];
                  }

                  // console.log("Updated details are", details);

                  // return
                  localStorage.setItem(
                    PersistanceKeys.RegisterDetails,
                    JSON.stringify(details)
                  );
                }
                handleContinue();
              } else {
                handleNext();
              }
            }}
            handleBack={handleBack}
            shouldContinue={shouldContinue}
          />
        </div>
      </div>
    </div>
  );
};

export default FocusArea;
