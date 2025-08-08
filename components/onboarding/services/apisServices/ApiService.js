import { AuthToken } from "@/components/agency/plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import getProfileDetails from "@/components/apis/GetProfile";
import { SnackbarTypes } from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { PersistanceKeys } from "@/constants/Constants";
import CircularLoader from "@/utilities/CircularLoader";
import axios from "axios";

//api call to assign lead to teamm members
export const AssignTeamMember = async (ApiData) => {
  try {
    // //console.log
    let AuthToken = null;
    const localData = localStorage.getItem("User");
    // //console.log
    if (localData) {
      const Data = JSON.parse(localData);
      //// //console.log;
      AuthToken = Data.token;
      // return Data.token
    }
    // //console.log
    // const ApiData = {
    //   // leadId: selectedLeadsDetails.id,
    //   // teamMemberUserId: item?.id
    //   leadId: leadId,
    //   teamMemberUserId: teamMemberUserId,
    // };
    console.log("Api data sending in assign lead to team api is", ApiData);
    // return;

    const ApiPath = Apis.AssignLeadToTeam;
    // //console.log
    // return
    const response = await axios.post(ApiPath, ApiData, {
      headers: {
        Authorization: "Bearer " + AuthToken,
        "Content-Type": "application/json",
      },
    });

    if (response) {
      console.log("Respose of assign lead to team is", response);
      return response;
    }
  } catch (error) {
    // console.error("Error occured in assign lead to teammeber api is", error);
  } finally {
    // //console.log;
  }
};

//api call to check the phone number availability
export const checkPhoneNumber = async (value) => {
  try {
    const ApiPath = Apis.CheckPhone;

    const ApiData = {
      phone: value,
    };

    // //console.log;

    const response = await axios.post(ApiPath, ApiData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response) {
      return response;
    }
  } catch (error) {
    // console.error("Error occured in check phone api is :", error);
  } finally {
  }
};

//function to get location
export const getLocation = () => {
  // setLocationLoader(true);

  // Check if geolocation is available in the browser
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem("CompleteLocation", JSON.stringify(position));
        try {
          // //console.log
          // Fetch country code based on latitude and longitude
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          // //console.log
          const data = await response.json();
          // //console.log

          // Set the country code if the API returns it
          const locationData = {
            location: data.countryCode.toLowerCase(),
          };
          // //console.log
          if (data && data.countryCode) {
            localStorage.setItem("userLocation", JSON.stringify(locationData));
            // //console.log
            getLocalLocation();
            // //console.log
          } else {
            // console.error("Unable to fetch country code.");
          }
        } catch (error) {
          // console.error("Error fetching geolocation data:", error);
        } finally {
        }
      },
      (error) => {
        // console.error("Geolocation error:", error.message);
      }
    );
  } else {
    // console.error("Geolocation is not supported by this browser.");
  }
};

export const getLocalLocation = () => {
  // //console.log
  const loc = localStorage.getItem("userLocation");
  // //console.log

  if (loc) {
    const L = JSON.parse(loc);
    if (L) {
      // //console.log
    }
    return L?.location;
  } else if (!loc) {
    return "us";
  }
};

//function to get the teamsList
export const getTeamsList = async () => {
  try {
    const data = localStorage.getItem("User");

    if (data) {
      let u = JSON.parse(data);

      let path = Apis.getTeam;

      const response = await axios.get(path, {
        headers: {
          Authorization: "Bearer " + u.token,
        },
      });

      if (response) {
        if (response.data.status === true) {
          // //console.log;
          return response.data;
        } else {
          // //console.log;
          // return response.data.data
        }
      }
    }
  } catch (error) {
    // console.error("Error occured in api is", error);
  } finally {
    // //console.log;
  }
};

//generate the link for add stripe
export const getStripeLink = async (setLoader) => {
  try {
    setLoader(true);
    const data = await getProfileDetails();
    console.log("Working");
    if (data) {
      const D = data.data.data
      console.log("Getprofile data is", D);
      if (D.plan) {
        const Token = AuthToken();
        const ApiPath = Apis.createOnboardingLink;
        const response = await axios.post(ApiPath, null, {
          headers: {
            "Authorization": "Bearer " + Token
          }
        });
        if (response) {
          console.log("Route user to connect stripe");
          console.log("Payment link is", response.data.data.url);
          window.open(response.data.data.url, "_blank");
          setLoader(false);
        }
        // router.push("/agency/verify")
      } else {
        console.log("Need to subscribe plan");
        const d = {
          subPlan: false
        }
        localStorage.setItem(PersistanceKeys.LocalStorageSubPlan, JSON.stringify(d));
        router.push("/agency/onboarding");
      }
    }
  } catch (error) {
    // setLoader(false);
    console.error("Error occured  in getVerify link api is", error);
  }
}

//disconnect the twilio profile
export const handleDisconnectTwilio = async ({
  setDisConnectLoader,
  setShowSnackMessage,
  setShowSnackType
}) => {
  try {
    setDisConnectLoader(true);
    const token = AuthToken();
    const ApiPath = Apis.disconnectTwilio;
    const response = await axios.post(ApiPath, {}, {
      headers: {
        "Authorization": "Bearer " + token,
        // "Content-Type": "application/json"
      }
    });
    if (response) {
      console.log("Response of disconnect twilio api is", response);
      const ApiResponse = response.data
      if (ApiResponse.status === true) {
        localStorage.removeItem(PersistanceKeys.twilioHubData);
        // setShowSnack({
        //   message: "Twilio disconnected.",//ApiResponse.message
        //   isVisible: true,
        //   type: SnackbarTypes.Success,
        // });
        setShowSnackMessage("Twilio disconnected");
        setShowSnackType(SnackbarTypes.Success);
        await getProfileDetails();
        return true;
        // setTwilioHubData(null);
        // setProfileStatus(true);

        // Clear polling when disconnected
        // if (pollingInterval) {
        //   clearInterval(pollingInterval);
        //   setPollingInterval(null);
        // }
      } else {
        // setShowSnack({
        //   message: ApiResponse.message,
        //   isVisible: true,
        //   type: SnackbarTypes.Success,
        // });
        setShowSnackMessage(ApiResponse.message);
        setShowSnackType(SnackbarTypes.Error);
      }
      setDisConnectLoader(false);
    }
  } catch (error) {
    setDisConnectLoader(false);
    console.log("Error occured in disconnet twilio api is", error);
  }
}
