import React, { useState } from "react";
import Image from "next/image";
import Apis from "../apis/Apis";
import axios from "axios";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "../dashboard/leads/AgentSelectSnackMessage";
import { CircularProgress } from "@mui/material";

function SendFeedback() {
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackDescription, setFeedbackDescription] = useState("");

  //feedback extra variables
  const [snackMsg, setSnackMsg] = useState(null);
  const [errType, setErrType] = useState(null);
  const [feedBackLoader, setFeedBackLoader] = useState(false);

  //function to handle send feed back
  const handleSendFeedBack = async () => {
    try {
      setFeedBackLoader(true);
      const localdata = localStorage.getItem("User");
      let AuthToken = null;
      if (localdata) {
        const D = JSON.parse(localdata);
        AuthToken = D.token;
      }

      const ApiData = {
        title: feedbackTitle,
        feedback: feedbackDescription,
      };

      console.log("ApiData is", ApiData);

      const ApiPath = Apis.sendFeedbback;
      console.log("Apipath is", ApiPath);

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          Authorization: "Bearer " + AuthToken,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        console.log("Response of api is", response);
        if (response.data.status === true) {
          setFeedbackTitle("");
          setFeedbackDescription("");
          setSnackMsg("Feedback submitted");
          setErrType(SnackbarTypes.Success);
        } else if (response.data.status === false) {
          setSnackMsg(response.data.message);
          setErrType(SnackbarTypes.Error);
        }
      }
    } catch (error) {
      console.error("Error occuredd in api is", error);
      setFeedBackLoader(false);
    } finally {
      setFeedBackLoader(false);
      console.log("Send feedback done");
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
      <AgentSelectSnackMessage
        isVisible={snackMsg == null ? false : true}
        hide={() => {
          setSnackMsg(null);
        }}
        message={snackMsg}
        type={errType}
      />

      <div style={{ fontSize: 22, fontWeight: "700", color: "#000" }}>
        Send Feedback
      </div>

      <div style={{ fontSize: 12, fontWeight: "500", color: "#00000090" }}>
        {"Account > Send Feedback"}
      </div>

      <div className="w-full flex justify-center items-cetner flex-col mt-20">
        <div
          style={{ alignSelf: "center" }}
          className="flex flex-col items-center w-8/12 p-2 rounded-xl border bg-white"
        >
          <div
            className="sm:w-full w-full p-4"
            style={{
              backgroundColor: "#ffffff",

              borderRadius: "13px",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: "700", color: "#000" }}>
              {`What's your feedback?`}
            </div>

            <div className="pt-5" style={styles.headingStyle}>
              {`What's this about?`}
            </div>
            <input
              placeholder="Type here... "
              className="w-full rounded p-2 outline-none rounded-lg focus:ring-0"
              style={styles.inputStyle}
              value={feedbackTitle}
              onChange={(e) => {
                setFeedbackTitle(e.target.value);
              }}
            />

            <div className="pt-5" style={styles.headingStyle}>
              Tell us more
            </div>
            <textarea
              placeholder="Type here..."
              className="w-full rounded-lg p-2 outline-none focus:ring-0"
              style={{
                fontSize: 15,
                fontWeight: "500",
                marginTop: 10,
                height: "150px",
                resize: "none",
                border: "1px solid #00000010",
              }}
              value={feedbackDescription}
              onChange={(e) => {
                setFeedbackDescription(e.target.value);
              }}
            />

            {feedBackLoader ? (
              <div className="w-full flex flex-row items-ceter justify-center mt-10">
                <CircularProgress size={35} />
              </div>
            ) : (
              <button
                disabled={!feedbackTitle || !feedbackDescription}
                style={{
                  marginTop: 20,
                  backgroundColor:
                    !feedbackTitle || !feedbackDescription
                      ? "#00000020"
                      : "#7902DF",
                }}
                className="w-full flex p-3 rounded-lg items-center justify-center outline-none"
                onClick={() => {
                  handleSendFeedBack();
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    color:
                      !feedbackTitle || !feedbackDescription
                        ? "#000000"
                        : "white",
                  }}
                >
                  {/* Test AI */}
                  Send Feedback
                </div>
              </button>
            )}

            {/* Can be use full to add shadow */}
            {/* <div style={{ backgroundColor: "#ffffff", borderRadius: 7, padding: 10 }}> </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendFeedback;

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
  headingStyle: {
    fontSize: 16,
    fontWeight: "700",
  },
  inputStyle: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 10,
    border: "1px solid #00000010",
  },
};
