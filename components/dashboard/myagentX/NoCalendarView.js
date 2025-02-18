import IntroVideoModal from "@/components/createagent/IntroVideoModal";
import VideoCard from "@/components/createagent/VideoCard";
import { HowtoVideos } from "@/constants/Constants";
import React, { useState } from "react";

export default function NoCalendarView({
  addCalendarAction,
  showVideo = false,
}) {
  const [introVideoModal, setIntroVideoModal] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center h-[20] ">
      <IntroVideoModal
        open={introVideoModal}
        onClose={() => setIntroVideoModal(false)}
        videoTitle="Learn how to add a calendar"
        videoUrl={HowtoVideos.Calendar}
      />
      {/* Icon Section */}
      <div className="flex items-center justify-center w-24 h-24   rounded-lg">
        <img
          src="/assets/salmanassets/no_calendar_icon2.svg"
          alt="No Calendar Icon"
          className="w-12 h-12"
        />
      </div>

      {/* Text Section */}
      <div className="mt-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900 italic">
          No Calendar added
        </h3>
        {/* <p className="mt-1 text-sm text-gray-500">
          Please add a calendar to lorem ipsum dolor miset.
        </p> */}
      </div>

      {/* Button Section */}
      <button
        className="mt-6 flex items-center px-6 py-3 bg-[#7902DF] font-[600] text-white rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={() => {
          addCalendarAction();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 mr-2"
          fill="#"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Calendar
      </button>
      {showVideo && (
        <div
          className="-ml-4 flex  justify-center mt-2  xl:w-[350px] lg:w-[350px]"
          style={{
            position: "",
            // left: "18%",
            // translate: "-50%",
            // left: "14%",
            // top: "20%",
            // backgroundColor: "red"
          }}
        >
          <VideoCard
            duration="2 min 42 sec"
            horizontal={false}
            playVideo={() => {
              setIntroVideoModal(true);
            }}
            title="Learn how to add a calendar"
          />
        </div>
      )}
    </div>
  );
}
