import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import ProgressBar from "./ProgressBar";
import Footer from "./Footer";
import { CircularProgress } from "@mui/material";
import DefaultData from "./extras/DefaultData";
import Apis from "../apis/Apis";
import axios from "axios";
import { PersistanceKeys } from "@/constants/Constants";
import { GetServicesForUser } from "@/utilities/AgentServices";

const UserService = ({ handleContinue, handleBack }) => {
  const router = useRouter();
  const [serviceId, setServiceId] = useState([]);
  const [servicesData, setServicesData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [value, setValue] = useState(0);
  const [shouldContinue, setShouldContinue] = useState(true);

  //stores default data
  // const [DefaultData, setDefaultData] = useState([]);

  useEffect(() => {
    const selectedServiceID = localStorage.getItem(
      PersistanceKeys.RegisterDetails
    );
    if (selectedServiceID) {
      const serviceIds = JSON.parse(selectedServiceID);
      //// //console.log;
      setServiceId(serviceIds.serviceID);
    }
  }, []);

  useEffect(() => {
    getDefaultData();
    // if (servicesData) {
    //     setLoader(false);
    //     // <DefaultData setServicesData={setServicesData} />
    //     // setServicesData(servicesData);
    // } else {
    //    // //console.log
    // }
  }, []);

  useEffect(() => {
    if (serviceId.length > 0) {
      // //console.log;
      setShouldContinue(false);
    } else if (serviceId.length === 0) {
      setShouldContinue(true);
    }
  }, [serviceId]);

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
        // //console.log;
        AgentTypeTitle = serviceIds.userTypeTitle;
      }
      let servicesLocal = GetServicesForUser(AgentTypeTitle);
      setServicesData(servicesLocal);

      // //console.log;
      const ApiPath = `${Apis.defaultData}?type=${AgentTypeTitle}`;
      // //console.log;
      const response = await axios.get(ApiPath, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response) {
        // //console.log;
        setServicesData(response.data.data.agentServices);
      } else {
        // alert(response.data);
      }
    } catch (error) {
      // console.error("ERror occured in default data api is :----", error);
    } finally {
      setLoader(false);
    }
  };

  const handleserviceId = (id) => {
    // setServiceId(prevId => (prevId === id ? null : id));
    setServiceId((prevIds) => {
      if (prevIds.includes(id)) {
        // Unselect the item if it's already selected
        return prevIds.filter((prevId) => prevId !== id);
      } else {
        // Select the item if it's not already selected
        return [...prevIds, id];
      }
    });
    setValue(30);
  };

  const handleNext = () => {
    const data = localStorage.getItem(PersistanceKeys.RegisterDetails);
    if (data) {
      const details = JSON.parse(data);
      details.serviceID = serviceId;
      localStorage.setItem(
        PersistanceKeys.RegisterDetails,
        JSON.stringify(details)
      );
      if (serviceId) {
        if (serviceId.length > 0) {
          handleContinue();
        }
      }
    }
  };

  //code for linear progress moving
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setProgress((oldProgress) => {
  //       if (oldProgress === 100) {
  //         return 0;
  //       }
  //       const diff = Math.random() * 10;
  //       return Math.min(oldProgress + diff, 100);
  //     });
  //   }, 500);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, []);

  return (
    <div
      style={{ width: "100%" }}
      className="overflow-y-none flex flex-row justify-center items-center"
    >
      <div
        className="bg-white sm:rounded-2xl flex flex-col justify-between w-full sm:mx-2 md:w-10/12 h-[100%] sm:h-[90%] py-4"
        style={{ scrollbarWidth: "none" }} // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
      >
        <div className="h-[90svh] sm:h-[82svh]">
          {/* header84svh */}
          <div className="h-[10%]">
            <Header />
          </div>
          {/* Body */}
          <div className="flex flex-col items-center px-4 w-full h-[90%]">
            <div
              className="mt-6  w-10/12 sm:w-full md:w-11/12 md:text-4xl text-lg font-[650] sm:font-[600]"
              style={{ textAlign: "center" }}
            >
              What would you like AgentX to help you with?
            </div>

            {loader ? (
              <div className="w-full flex flex-row justify-center items-center h-screen">
                <CircularProgress size={35} />
              </div>
            ) : (
              <div
                className="mt-2 pb-2 sm:mt-8 w-full md:w-10/12 lg:w-7/12 gap-4 flex flex-col sm:max-h-[90%] max-h-[100%] overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple"
              // style={{ scrollbarWidth: "none" }}
              >
                {servicesData.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleserviceId(item.id);
                    }}
                    className="border-none outline-none"
                  >
                    <div
                      className="border bg-white flex flex-row items-center w-full rounded-2xl pt-3"
                      style={{
                        border: serviceId.includes(item.id)
                          ? "2px solid #7902DF"
                          : "",
                        scrollbarWidth: "none",
                        backgroundColor: serviceId.includes(item.id)
                          ? "#402FFF05"
                          : "",
                      }}
                    >
                      <div className="flex flex-row items-start sm:items-start gap-4 px-4 w-full py-2">
                        {serviceId.includes(item.id) ? (
                          <Image
                            className="mt-2"
                            src={"/assets/charmTick.png"}
                            alt="*"
                            height={28}
                            width={28}
                          />
                        ) : (
                          <Image
                            className="mt-2"
                            src={"/assets/charmUnMark.png"}
                            alt="*"
                            height={28}
                            width={28}
                          />
                        )}
                        <div className="w-[90%]">
                          <div
                            className="text-start"
                            style={{
                              fontFamily: "",
                              fontWeight: "700",
                              fontSize: 20,
                            }}
                          >
                            {item.title}
                          </div>

                          <div className="mt-2 " style={{ textAlign: "start" }}>
                            {item.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 h-[10%] flex flex-col justify-end">
          <div>
            <ProgressBar value={33} />
          </div>

          <div style={{ height: "35px" }}>
            <Footer
              handleContinue={handleNext}
              handleBack={handleBack}
              shouldContinue={shouldContinue}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserService;
