import React, { useEffect } from "react";

export const SnackbarTypes = {
  Error: "Error",
  Warning: "Warning",
  Success: "Success",
};

const DefaultMessage = null;
export default function AgentSelectSnackMessage({
  title = null,
  message = DefaultMessage,
  type = SnackbarTypes.Error,
  time = 4000,
  isVisible,
  hide,
}) {
  console.log("Visible Snack ", isVisible);
  function GetIcon() {
    if (type == SnackbarTypes.Error) {
      return "/assets/salmanassets/danger_conflict.svg";
    }
    if (type == SnackbarTypes.Success) {
      return "/assets/salmanassets/danger_conflict.svg";
    }
    if (type == SnackbarTypes.Warning) {
      return "/assets/salmanassets/danger_conflict.svg";
    }

    return "/assets/salmanassets/danger_conflict.svg";
  }

  //code to hide after timer
  // const SelectAgentErrorTimeout = 4000; //change this to change the duration of the snack timer

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        // setErrorMessage(null);
        hide();
      }, time);
    }
  }, [message]);

  return (
    isVisible && (
      <div
        className=" items-center justify-center  w-[33vw]"
        style={{
          position: "absolute",
          left: "50%",
          translate: "-50%",
          // display: isVisible ? "flex" : "hidden",
        }}
      >
        <div className="flex items-center space-x-4 p-2 bg-white  rounded-md shadow-md">
          {/* Icon Section */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full">
              <img src={GetIcon()}></img>
            </div>
          </div>

          {/* Text Section */}
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            <p className="text-sm text-gray-600">{message || DefaultMessage}</p>
          </div>
        </div>
      </div>
    )
  );
}
