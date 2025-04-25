import Image from "next/image";
import React, { useEffect, useState } from "react";
import { CircularProgress, Tooltip } from "@mui/material";
import getProfileDetails from "@/components/apis/GetProfile";
function NoPerplexity({ setshowConfirmPerplexity, handleEnrichLead, loading }) {
  const [userLocalData, setUserLocalData] = useState("");

  useEffect(() => {
    const getData = async () => {
      let Authtoken = null;
      let localDetails = null;
      const localData = localStorage.getItem("User");

      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        localDetails = Data;
        Authtoken = Data.token;
        setUserLocalData(Data.user);
      }
      let user = await getProfileDetails();
      if (user) {
        setUserLocalData(user.data.data);
        console.log("user", user.data.data.enrichCredits);
      }
    };

    getData();
  }, []);
  return (
    <div className="flex flex-col items-center gap-3 w-full h-[40vh] ">
      {/* {
                userLocalData?.enrichCredits > 0 ? ( */}
      <div
        style={{
          fontSize: 14,
          fontWeight: "500",
          color: "black",
          alignSelf: "flex-end",
          marginTop: "10px",
          marginBottom: "100px",
        }}
      >
        Credits: {userLocalData?.enrichCredits || 0}
      </div>
      {/* ) : (
                    <div style={{ marginBottom: '100px' }}></div>
                )
            } */}

      {loading ? (
        <CircularProgress size={27} />
      ) : (
        <button
          className="h-[53px] p-3 flex flex-row gap-2 rounded-lg bg-purple items-center justify-center text-white"
          onClick={() => {
            if (userLocalData?.enrichCredits > 0) {
              handleEnrichLead();
            } else {
              setshowConfirmPerplexity(true);
            }
          }}
        >
          <Image
            src={"/svgIcons/sparklesWhite.svg"}
            height={16}
            width={16}
            alt="*"
          />
          <div>Enrich Lead</div>
        </button>
      )}
      <div
        style={{
          fontSize: 15,
          fontWeight: "500",
          width: "30vw",
          textAlign: "center",
        }}
      >
        {`By enriching this lead, you're giving your AI valuable context — pulling in public data to better understand who this person is and how to engage with them.`}
      </div>

      <div className="flex flex-row gap-2 items-center">
        <div style={{ fontSize: 13, fontWeight: "500", color: "#00000060" }}>
          credit cost ($0.10/lead)
        </div>

        <Tooltip
          title="This is the cost for us to run the enrichment process."
          arrow
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: "#ffffff", // Ensure white background
                color: "#333", // Dark text color
                fontSize: "16px",
                fontWeight: "500",
                padding: "10px 15px",
                borderRadius: "8px",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
              },
            },
            arrow: {
              sx: {
                color: "#ffffff", // Match tooltip background
              },
            },
          }}
        >
          <Image
            src={"/svgIcons/infoIcon.svg"}
            height={16}
            width={16}
            alt="*"
          />
        </Tooltip>
      </div>
    </div>
  );
}

export default NoPerplexity;
