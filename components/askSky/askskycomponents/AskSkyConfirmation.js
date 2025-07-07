import { AuthToken } from "@/components/agency/plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import { Box, CircularProgress, Modal } from "@mui/material";
import React from "react";

function AskSkyConfirmation({
  open,
  onClose,
  handleChatClick,
  // handleAfterGoogleLogin,
  optionA = "Chat with Sky",
  optionB = "Call Sky",
  selectedAgent,
  handleAddCalendar,
  calenderLoader,
}) {
  // const handleCallClick = () => {
  //     const NEXT_PUBLIC_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_APP_GOOGLE_CLIENT_APP_SECRET;
  //     const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_REDIRECT_URI}`;

  //     const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  //         new URLSearchParams({
  //             client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  //             redirect_uri: REDIRECT_URI,
  //             response_type: "code",
  //             scope: "openid email profile https://www.googleapis.com/auth/calendar",
  //             access_type: "offline",
  //             prompt: "consent",
  //         }).toString();

  //     const popup = window.open(oauthUrl, "_blank", "width=500,height=600");

  //     const listener = async (event) => {
  //         if (event.data?.type === "google-auth-code") {
  //             window.removeEventListener("message", listener);

  //             const res = await fetch(`/api/google/exchange-token?code=${event.data.code}`);
  //             const { tokens } = await res.json();

  //             if (tokens?.access_token) {
  //                 localStorage.setItem("googleAccessToken", tokens.access_token);
  //                 localStorage.setItem("googleRefreshToken", tokens.refresh_token);

  //                 try {
  //                     const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
  //                         headers: {
  //                             Authorization: `Bearer ${tokens.access_token}`,
  //                         },
  //                     });

  //                     const userInfo = await userInfoRes.json();

  //                     // Store or use user info
  //                     localStorage.setItem("googleUserId", userInfo.id);
  //                     localStorage.setItem("googleUserName", userInfo.name);
  //                     localStorage.setItem("googleUserEmail", userInfo.email);

  //                     console.log("User Info:", {
  //                         id: userInfo.id,
  //                         name: userInfo.name,
  //                         email: userInfo.email,
  //                     });

  //                     // Call your login handler
  //                     handleAfterGoogleLogin({
  //                         ...tokens,
  //                         ...userInfo,
  //                     });
  //                 } catch (err) {
  //                     console.error("Failed to fetch user info:", err);
  //                 }
  //             }
  //         }
  //     };

  //     window.addEventListener("message", listener);
  // };

  // const handleAfterGoogleLogin = (t) => {
  //     console.log("Tokens recieved are", t);
  //     //access token
  //     //refresh token
  //     //user id
  //     //
  // }

  const handleCallClick = () => {
    const NEXT_PUBLIC_GOOGLE_CLIENT_ID =
      process.env.NEXT_PUBLIC_APP_GOOGLE_CLIENT_APP_SECRET;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_REDIRECT_URI;

    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile https://www.googleapis.com/auth/calendar",
        access_type: "offline",
        prompt: "consent",
      }).toString();

    const popup = window.open(oauthUrl, "_blank", "width=500,height=600");

    const listener = async (event) => {
      if (event.data?.type === "google-auth-code") {
        window.removeEventListener("message", listener);

        try {
          const res = await fetch(
            `/api/google/exchange-token?code=${event.data.code}`
          );
          const { tokens } = await res.json();

          if (tokens?.access_token) {
            // localStorage.setItem("googleAccessToken", tokens.access_token);
            // if (tokens.refresh_token) {
            //     localStorage.setItem("googleRefreshToken", tokens.refresh_token);
            // }

            const userInfoRes = await fetch(
              "https://www.googleapis.com/oauth2/v2/userinfo",
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                },
              }
            );

            const userInfo = await userInfoRes.json();

            // Optional: Save user info locally
            // localStorage.setItem("googleUserId", userInfo.id);
            // localStorage.setItem("googleUserName", userInfo.name);
            // localStorage.setItem("googleUserEmail", userInfo.email);

            // Final combined object
            handleAfterGoogleLogin({
              ...tokens,
              ...userInfo,
            });
          }
        } catch (err) {
          console.error("Google OAuth error:", err);
        }
      }
    };

    window.addEventListener("message", listener);
  };

  const handleAfterGoogleLogin = (data) => {
    try {
      console.log("🆔 Google User LogIn:", data);
      console.log("🔑 Access Token:", data.access_token);
      console.log(
        "🔁 Refresh Token:",
        data.refresh_token || "No refresh token received"
      );
      const expirySeconds = data.expires_in;
      const expiryDate = new Date(
        Date.now() + expirySeconds * 1000
      ).toISOString();
      console.log("expiry date is", expiryDate);

      const userAuthToken = AuthToken();
      const ApiPath = Apis.addCalender;

      const formData = new FormData();
      formData.append("title", "Google Calendar");
      formData.append("calendarType", "google");
      // formData.append("mainAgentId", "");
      formData.append("agentId", selectedAgent?.id);
      formData.append("accessToken", data.access_token);
      formData.append("refreshToken", data.refresh_token);
      formData.append(
        "scope",
        "openid email profile https://www.googleapis.com/auth/calendar"
      );
      formData.append("expiryDate", expiryDate);
      formData.append("googleUserId", data.id);

      console.log("Auth token is", userAuthToken);

      const googleCalendar = {
        isFromAddGoogleCal: true,
        title: "Google Calendar",
        calendarType: "google",
        agentId: selectedAgent?.id,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: "openid email profile https://www.googleapis.com/auth/calendar",
        expiryDate: expiryDate,
        googleUserId: data.id,
      };

      for (let [key, value] of formData.entries()) {
        console.log(`${key} === ${value}`);
      }

      handleAddCalendar(googleCalendar);
    } catch (error) {
      console.error("Error occured in add calendar of google api is", error);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 1000,
        sx: { backgroundColor: "#00000020" },
      }}
    >
      <Box
        className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          borderRadius: "8px",
          boxShadow: 24,
          p: 4,
        }}
      >
        <div className="flex flex-col w-full items-center bg-white rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            How would you like to continue?
          </h2>
          <div className="flex flex-row items-center justify-between w-full">
            <button
              onClick={handleChatClick}
              className="px-4 py-2 text-purple border w-5/12 rounded"
            >
              {optionA}
            </button>

            {calenderLoader ? (
              <CircularProgress size={20} />
            ) : (
              <button
                onClick={handleCallClick}
                className="px-4 py-2 bg-purple w-5/12 text-white rounded"
              >
                {optionB}
              </button>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
}

export default AskSkyConfirmation;
