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
      {/* Icon Section */}
      <div className="flex items-center justify-center w-24 h-24   rounded-lg">
        <img
          src="/assets/salmanassets/no_calendar_icon2.svg"
          alt="No Calendar Icon"
          className="w-12 h-12"
        />
      </div>

      {/* Text Section */}
      <div className="-mt-2 text-center">
        <h3 className="text-[15] font-[400] text-gray-900 italic">
          No Calendar added
        </h3>
        {/* <p className="mt-1 text-sm text-gray-500">
          Please add a calendar to lorem ipsum dolor miset.
        </p> */}
      </div>

      {/* Button Section */}
      <button
        className="mt-2 flex items-center px-6 py-3 bg-[#7902DF] font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400"
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
    </div>
  );
}
