import React from "react";

const DefaultMessage = "You can’t assign leads to agents in the same stage";
export default function AgentSelectSnackMessage({ message = DefaultMessage }) {
  return (
    <div className="flex items-center justify-center h-[12] ">
      <div className="flex items-center space-x-4 p-2 bg-white  rounded-md shadow-md">
        {/* Icon Section */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
            <img src="/assets/salmanassets/danger_conflict.svg"></img>
          </div>
        </div>

        {/* Text Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Conflicting Agents
          </h3>
          <p className="text-sm text-gray-600">{message || DefaultMessage}</p>
        </div>
      </div>
    </div>
  );
}
