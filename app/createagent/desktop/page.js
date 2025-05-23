"use client";
import CreatAgent3 from "@/components/createagent/CreatAgent3";
import CreateAgent1 from "@/components/createagent/CreateAgent1";
import CreateAgent2 from "@/components/createagent/CreateAgent2";
import CreateAgent4 from "@/components/createagent/CreateAgent4";
import CreateAgentVoice from "@/components/createagent/CreateAgentVoice";
import BackgroundVideo from "@/components/general/BackgroundVideo";
import { DeskTwoTone } from "@mui/icons-material";
import Image from "next/image";
import React, { useEffect } from "react";
import { useState } from "react";

const Page = () => {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(410);
  // let components = [CreateAgent1, CreatAgent3, CreateAgent4, CreateAgentVoice];

  useEffect(() => {
    if (typeof window != "undefined") {
      setWidth(window.innerWidth);
    }
  }, []);

  // let CurrentComp = components[index];

  // Function to proceed to the next step
  const handleContinue = () => {
    // //console.log;
    setIndex(index + 1);
  };

  const handleBack = () => {
    // //console.log;
    setIndex(index - 1);
  };

  const backgroundImage = {
    // backgroundImage: 'url("/assets/background.png")',
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "100%",
    height: "100svh",
    overflow: "hidden",
  };

  return (
    <div
      // style={backgroundImage}
      className="overflow-y-none h-[100svh] flex flex-col justify-between items-center py-4"
    >
      <div className="-mt-4 w-full ">
        <DesktopView width={width} />
      </div>
      <div
        style={{ width: "100%" }}
        className="overflow-y-hidden flex flex-row justify-center items-center mt-32"
      >
        <div
          className=" rounded-2xl w-full lg:w-10/12 h-[90vh] flex flex-col items-center justify-center  "
          style={{ scrollbarWidth: "none", backgroundColor: "transparent" }} // overflow-auto scrollbar scrollbar-track-transparent scrollbar-thin scrollbar-thumb-purple
        >
          <div className="w-full flex flex-col items-center ">
            <div
              className="w-full bg-[#ffffff80] p-2 px-4 pt-4 mt-2"
              style={{
                borderTopLeftRadius: "15px",
                borderTopRightRadius: "15px",
                border: "0px solid #ffffff",
                borderBottom: "none",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  fontSize: 22,
                  textAlign: "center",
                  marginTop: 130,
                  color: "#000",
                  zIndex: 100,
                  // backgroundColor: "red",
                }}
              >
                Build your AI on Desktop
              </div>
              <div
                style={{
                  // fontWeight: "regular",
                  fontSize: 15,
                  textAlign: "center",
                  marginTop: 15,
                  color: "#000",
                  width: "100%",
                  // borderWidth:1
                }}
              >
                For a seamless experience, we recommend completing your setup on
                desktop.
              </div>
              <div className="text-purple"
                style={{
                  fontWeight: "500",
                  fontSize: 11,
                  textAlign: "center",
                  marginTop: 15,
                }}
              >
                Check your email to continue with next steps
              </div>
            </div>
            {/* <div
              className="w-full bg-[#ffffff]"
              style={{
                borderBottomLeftRadius: "15px",
                borderBottomRightRadius: "15px",
                height: "15px",
              }}
            ></div> */}
          </div>
        </div>
      </div>
      <Image
        className=""
        src="/svgIcons/agentX3.svg"
        style={{ height: "36px", width: "126px", resize: "contain" }}
        height={12}
        width={42}
        alt="*"
      />
    </div>
  );
};

export default Page;

const DesktopView = ({ width }) => {
  return (
    <div className="">
      <div
        style={{
          position: "absolute",
          top: "30%", // Adjust this value to move it higher
          left: "50%",
          transform: "translate(-50%, -50%)", // Shift from center but more towards the top
          width: "95%", // Set the width to 86%
          zIndex: -1, // Ensure it stays behind content
        }}
      >
        <Image
          width={width * 0.95}
          alt="*"
          height={2}
          style={{
            // width: "40%", // Fill parent width
            height: "auto", // Maintain aspect ratio
            backgroundColor: "",
          }}
          src={"/assets/salmanassets/desktopViewNew.png"}
          layout="intrinsic"
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: "45%", // Adjust this value to move it higher
          left: "50%",
          transform: "translate(-50%, -50%)", // Shift from center but more towards the top
          width: "95%", // Set the width to 86%
          zIndex: 0, // Ensure it stays behind content
        }}
      >
        <Image
          height={100}
          width={100}
          alt="*"
          style={{
            position: "absolute",
            top: "37%", // Adjust this value to move it higher
            left: "50%",
            transform: "translate(-50%, -50%)", // Shift from center but more towards the top
            height: "160px",
            width: "165px",
            zIndex: 0, // Ensure it stays behind content
          }}
          src={"/assets/salmanassets/orbShadow.png"}
          layout="intrinsic"
        />
      </div>

      <div className="w-full flex flex-row justify-center  ">
        <Image
          className="mix-blend-multiply" //mix-blend-multiply
          src="/agentXOrb.gif"
          style={{
            position: "absolute",
            top: "37%", // Adjust this value to move it higher
            left: "50%",
            transform: "translate(-50%, -50%)", // Shift from center but more towards the top
            // width: "95%", // Set the width to 86%
            zIndex: 0, // Ensure it stays behind content
            height: "140px",
            width: "145px",
            resize: "contain",
          }}
          height={69}
          width={69}
          alt="*"
        />
      </div>
    </div>
  );
};
