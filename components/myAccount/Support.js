import React, { useState } from "react";
import Image from "next/image";
import { getSupportUrlFor } from "@/utilities/UserUtility";
import { PersistanceKeys } from "@/constants/Constants";

function Support() {
  const [HoverAIWebinar, setHoverAIWebinar] = useState(false);
  const [hoverConsultation, setHoverConsultation] = useState(false);

  //function to get support
  const getSupport = () => {
    let userData = localStorage.getItem("User");
    if (userData) {
      const D = JSON.parse(userData);
      let url = getSupportUrlFor(D.user);
      if (typeof window !== "undefined") {
        window.open(url, "_blank");
      }
    }
  };

  const getConsultation = () => {
    let url = PersistanceKeys.GlobalConsultationUrl;
    if (typeof window !== "undefined") {
      window.open(url, "_blank");
    }
  };
  return (
    <div
      className="w-full flex flex-col items-start px-8 py-2"
      style={{
        paddingBottom: "50px",
        height: "100%",
        overflow: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
        Support
      </div>

      <div style={{ fontSize: 12, fontWeight: "500", color: "#00000090" }}>
        {"Account > Support"}
      </div>

      <div
        style={{
          alignSelf: "center",
          cursor: "pointer",
        }}
        className="w-8/12 hover:bg-purple border rounded p-4 mt-10 cursor-pointer"
        onMouseEnter={() => {
          setHoverAIWebinar(true);
        }}
        onMouseLeave={() => {
          setHoverAIWebinar(false);
        }}
        onClick={getSupport}
      >
        <div className="flex flex-row gap-2">
          {/* <Image src={'/otherAssets/calenderIcon.png'}
                        alt='calender'
                        height={24}
                        width={24}
                    /> */}
          {HoverAIWebinar ? (
            <Image
              src={"/assets/whiteCalenderIcon.svg"}
              alt="calender"
              height={24}
              width={24}
            />
          ) : (
            <Image
              src={"/svgIcons/calenderIcon.svg"}
              alt="calender"
              height={24}
              width={24}
            />
          )}
          <div
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: HoverAIWebinar ? "white" : "#7902DF",
            }}
          >
            Join our weekly AI Webinar
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: "400",
            marginTop: "1vh",
            color: HoverAIWebinar ? "white" : "",
          }}
        >
          {`Learn tips and tricks to enhance your AI, perfect your script, and master best practices in our weekly live webinar. Don't miss out on actionable insights to boost your success!`}
        </div>
      </div>

      <div
        className="w-8/12 hover:bg-purple border rounded p-4 mt-10 cursor-pointer"
        style={{ alignSelf: "center", cursor: "pointer" }}
        onMouseEnter={() => {
          setHoverConsultation(true);
        }}
        onMouseLeave={() => {
          setHoverConsultation(false);
        }}
        onClick={getConsultation}
      >
        <div className="flex flex-row gap-2">
          {hoverConsultation ? (
            <Image
              src={"/svgIcons/screenIcon.svg"}
              alt="calender"
              height={24}
              width={24}
            />
          ) : (
            <Image
              src={"/assets/blueScreenIcon.svg"}
              alt="calender"
              height={24}
              width={24}
            />
          )}
          <div
            style={{
              fontSize: 16,
              fontWeight: "500",
              color: hoverConsultation ? "#fff" : "#7902DF",
            }}
          >
           Done with you agent setup
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: "400",
            marginTop: "1vh",
            color: hoverConsultation ? "#fff" : "",
          }}
        >
          {
            "Get up and running the right way. We'll work alongside to set up and integrate your CRM, ensuring everything is optimized for success from the start. See results faster and start closing more deals."
          }
        </div>
      </div>
    </div>
  );
}

export default Support;
