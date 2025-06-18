import { userLocalData } from '@/components/agency/plan/AuthDetails';
import { convertSecondsToMinDuration } from '@/utilities/utility';
import { Box, CircularProgress, Modal } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const AllowSmartRefillPopup = ({
  showSmartRefillPopUp,
  handleCloseReillPopup,
  smartRefillLoader,
  smartRefillLoaderLater,
  handleSmartRefillLater,
  handleSmartRefill,
  loader
}) => {


  const [userLocalDetails, setUserLocalDetails] = useState(null);

  useEffect(() => {
    const localData = userLocalData();
    if (localData) {
      console.log("Local data", localData);
      setUserLocalDetails(localData);
    }
  }, []);

  return (
    <div>
      <div className="bg-[#ffffff] px-8 py-6 rounded-xl">
        <div className="flex flex-row items-center justify-between">
          <div
            style={{
              fontSize: "17px",
              fontWeight: "600",
            }}
          >
            Smart Refill
          </div>
          <button
            className="text-xl font-semibold"
            onClick={() => {
              handleCloseReillPopup();
            }}
          >
            <Image
              src={"/assets/cross.png"}
              alt="*"
              height={10}
              width={10}
            />
          </button>
        </div>
        <div className="mt-8 flex flex-row items-center justify-between w-full">
          <div style={{ fontSize: "22px", fontWeight: "600", }}>
            Turn on Smart Refill
          </div>
          <div style={{ fontSize: "15px", fontWeight: "500", color: "#00000080" }}>
            Mins in your account: {convertSecondsToMinDuration(userLocalDetails?.totalSecondsAvailable || 0)}
          </div>
        </div>
        <div
          className="mt-6"
          style={{
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          {`To avoid interruptions when you're making calls, turn it back on and ensure your AI always has minutes to work with.`}
        </div>
        <div className="w-full flex flex-row items-center mt-6 outline-none border-none gap-2">
          {smartRefillLoaderLater ? (
            <div className="w-1/2 flex flex-row items-center justify-center">
              <CircularProgress size={35} />
            </div>
          ) : (
            <button
              className="w-1/2 outline-none border rounded-lg h-[50px]"
              onClick={() => {
                handleSmartRefillLater();
              }}
            >
              Maybe later
            </button>
          )}

          {smartRefillLoader ? (
            <div className="w-1/2 flex flex-row items-center justify-center">
              <CircularProgress size={35} />
            </div>
          ) : (
            <button
              className="w-1/2 outline-none border-none bg-purple rounded-md h-[50px] text-white"
              onClick={() => {
                handleSmartRefill();
              }}
            >
              Turn On
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllowSmartRefillPopup


const styles = {
  heading: {
    fontWeight: "600",
    fontSize: 17,
  },
  paragraph: {
    fontWeight: "500",
    fontSize: 12,
  },
  paragraph2: {
    fontWeight: "500",
    fontSize: 12,
  },
  title: {
    fontWeight: "500",
    fontSize: 15,
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
};