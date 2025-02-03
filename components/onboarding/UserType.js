import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import ProgressBar from "./ProgressBar";
import Footer from "./Footer";
import { Box, CircularProgress, Modal } from "@mui/material";
import { localeData } from "moment";
import styles from "../global.module.css";
import { PersistanceKeys } from "@/constants/Constants";

const UserType = ({ handleContinue, DefaultData, handleUserTypeChange }) => {
  const router = useRouter();
  const [value, setValue] = useState(8);
  const [SelectUserType, setSelectUserType] = useState(null);
  const [SelectUserTypeTitle, setSelectUserTypeTitle] = useState(null);
  const [SelectedFocusAreaTitle, setSelectedFocusAreaTitle] = useState(null);
  const [ShowModal, setShowModal] = useState(false);
  const [shouldContinue, setShouldContinue] = useState(true);

  //variable stores height
  const [screenHeight, setScreenHeight] = useState(null);

  useEffect(() => {
    if (SelectUserType) {
      setShouldContinue(false);
    } else if (!SelectUserType) {
      setShouldContinue(true);
    }
  }, [SelectUserType]);

  useEffect(() => {
    let windowHeight = 1000;
    if (typeof window !== "undefined") {
      windowHeight = window.innerHeight;
    }
    setScreenHeight(windowHeight);
    const localData = localStorage.getItem(PersistanceKeys.RegisterDetails);
    if (localData) {
      const localDetails = JSON.parse(localData);
      setSelectUserType(localDetails.userType);
      handleUserTypeChange(localDetails.userType);
      setSelectUserTypeTitle(localDetails.userTypeTitle);
      setSelectedFocusAreaTitle(localDetails.areaFocusTitle);
    }
  }, []);

  const handleUserType = async (item) => {
    setSelectUserType(item.id);
    setSelectUserTypeTitle(item.userType);
    setSelectedFocusAreaTitle(item.areaOfFocusTitle);
    handleUserTypeChange(item.userType);
    // if (item.id === 1) {
    //     setSelectUserType(item.id);
    //     setSelectUserTypeTitle(item.title);
    // } else {
    //     setSelectUserType(null);
    //     setSelectUserTypeTitle(null);
    //     setShowModal(true);
    // }
  };

  const handleNext = () => {
    localStorage.removeItem(PersistanceKeys.RegisterDetails);
    const userData = {
      serviceID: "",
      focusAreaId: "",
      userType: SelectUserType,
      userTypeTitle: SelectUserTypeTitle,
      areaFocusTitle: SelectedFocusAreaTitle,
      otherFocusArea: "",
    };

    // console.log("Data seting in api is", userData);

    // return

    localStorage.setItem(
      PersistanceKeys.RegisterDetails,
      JSON.stringify(userData)
    );

    if (SelectUserType) {
      handleContinue();
    }
  };

  const userType = [
    {
      id: 1,
      title: "Real Estate Agent",
      agentType: "Real Estate Agent",
      icon: "/usertype/avt1.png",
      areaOfFocusTitle: "What area of real estate do you focus on?",
      userType: "RealEstateAgent",
    },
    {
      id: 2,
      title: "Sales Dev Agent",
      agentType: "SDR/BDR Agent",
      icon: "/usertype/avt2.png",
      areaOfFocusTitle: "What area of sales do you focus on?",
      userType: "SalesDevRep",
    },
    {
      id: 3,
      title: "Solar Agent",
      agentType: "Solar Agent",
      icon: "/usertype/avt3.png",
      areaOfFocusTitle: "What area of solar do you focus on?",
      userType: "SolarRep",
    },
    {
      id: 4,
      title: "Insurance Agent",
      agentType: "Insurance Agent",
      icon: "/usertype/avt4.png",
      areaOfFocusTitle: "What area of insurance do you focus on?",
      userType: "InsuranceAgent",
    },
    {
      id: 5,
      title: "Marketer",
      agentType: "Marketer Agent",
      icon: "/usertype/avt5.png",
      areaOfFocusTitle: "What area of marketing do you focus on?",
      userType: "MarketerAgent",
    },
    {
      id: 6,
      title: "Website Agent",
      agentType: "Website Agent",
      icon: "/agentXOrb.gif", //"/usertype/avt7.png",
      areaOfFocusTitle: "How would you use AgentX?",
      userType: "WebsiteAgent",
    },
    {
      id: 7,
      title: "Recruiter Agentt",
      agentType: "Recruiter Agent",
      icon: "/usertype/avt8.png",
      areaOfFocusTitle: "What industries do you specialize in?",
      userType: "RecruiterAgent",
    },
    {
      id: 8,
      title: "Tax Agent",
      agentType: "Tax Agent",
      icon: "/usertype/avt9.png",
      areaOfFocusTitle: "What type of clients do you primarily serve?",
      userType: "TaxAgent",
    },
  ];

  const styles = {
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
    <div
      style={{ width: "100%", backgroundColor: "transparent" }}
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <div
        className="bg-white sm:rounded-2xl flex flex-col justify-between w-full sm:mx-2 md:w-10/12 h-[100%] sm:h-[95%] py-4"
        style={{ scrollbarWidth: "none" }}
      //className='bg-white sm:rounded-2xl w-full sm:mx-2 sm:w-10/12 h-[100%] sm:h-[90%] py-4 flex flex-col' style={{ scrollbarWidth: "none" }}
      >
        <div
          className={`h-[90svh] sm:h-[80svh] `}
        //84svh
        >
          {/* header */}
          <div className="w-full h-[10%]">
            <Header />
          </div>

          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full h-[90%]">
            <div
              className="mt-4 w-11/12 md:text-4xl text-lg font-[600]"
              style={{ textAlign: "center" }}
            >
              Which AgentX will you build?
            </div>

            <div
              className="mt-2 w-11/12 text-[10px] sm:text-[17px] font-[400]"
              style={{
                textAlign: "center", //fontSize: 15
              }}
            >
              Scale your salesforce. Handle any business use case. With AgentX,
              <br></br>you can quickly build an AI agent in minutes.
            </div>

            <div
              className="flex flex-wrap md:w-11/12 sm:w-full lg:w-7/12 mt-8 h-[80%] overflow-auto scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
            // style={{
            //   scrollbarWidth: "none",
            //   msOverflowStyle: "none",
            //   WebkitOverflowScrolling: "none",
            // }}
            >
              {userType.map((item, index) => (
                <div key={item.id} className="flex w-6/12 md:w-4/12 p-2">
                  <div
                    className="w-full rounded-lg p-2 md:hover:border-2 md:hover:border-[#7902DF] border border-[#00000010] transition-all duration-400 ease-in-out transform active:scale-90"
                    onClick={(e) => {
                      handleUserType(item);
                    }}
                    style={{
                      border:
                        item.id === SelectUserType ? "2px solid #7902DF" : "",
                      // transform: "scale(0.99)",
                      // transition: "0.4s ease",
                    }}
                  >
                    <div
                      className="h-[100px] sm:h-[198px] bg-gray-200 rounded w-full flex flex-col justify-center pb-[10px] items-center"
                      style={{ backgroundColor: "#FAF9FF" }}
                    >
                      {/* <img src={item.icon} style={{ width: "100%", resize: "contain" }} alt='*' /> */}
                      <img
                        src={item.icon}
                        style={{
                          width: item.id === 6 ? "50%" : "100%",
                          transform: "scale(1.1)",
                          resize: "contain",
                        }}
                        alt="*"
                      />
                    </div>
                    <div
                      className="text-center mt-4 pb-4"
                      style={{
                        fontWeight: "600",
                        fontSize: 17,
                      }}
                    >
                      {item.agentType}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-col gap-3 w-full pb-6 border-[2px] border-white rounded-xl items-center justify-center bg-[#FAF9FF]">
                <Image src={"/svgIcons/halfOrb.svg"}
                  height={282} width={282} alt="*"
                />

                <div style={{ fontSize: 15, fontWeight: '500', color: '#ADACAC' }}>
                  More agents coming in the future
                </div>

                <Image src={"/svgIcons/blueThreeDots.svg"}
                  height={9}
                  width={37} alt="*"
                />
              </div>
            </div>


          </div>
        </div>

        <div className=" h-[10%] flex flex-col justify-end w-full ">
          <div>
            <ProgressBar value={value} />
          </div>

          <div className="mb-4" style={{ height: "35px" }}>
            <Footer
              handleContinue={handleNext}
              donotShowBack={true}
              shouldContinue={shouldContinue}
            />
          </div>
        </div>
      </div>
      {/* Modals code goes here */}
      <Modal
        open={ShowModal}
        onClose={() => setShowModal(false)}
        closeAfterTransition
        BackdropProps={{
          timeout: 1000,
          sx: {
            backgroundColor: "#00000040",
            // //backdropFilter: "blur(20px)",
          },
        }}
      >
        <Box className="lg:w-5/12 sm:w-full w-8/12" sx={styles.modalsStyle}>
          <div className="flex flex-row justify-center w-full">
            <div
              className="w-full"
              style={{
                backgroundColor: "#ffffff",
                padding: 20,
                borderRadius: "13px",
              }}
            >
              <div className="flex flex-row justify-end">
                <button
                  onClick={() => {
                    setShowModal(false);
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
              <div
                className="text-center mt-2 mb-4"
                style={{ fontWeight: "700", fontSize: 24 }}
              >
                Coming Soon ....
              </div>

              {/* Can be use full to add shadow */}
              {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default UserType;
