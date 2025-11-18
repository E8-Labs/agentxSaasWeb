import axios from "axios";
import Apis from "./Apis";

const getProfileDetails = async (selectedAgency) => {
  const maxRetries = 10;
  const retryDelay = 1000; // 1 second in milliseconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let Authtoken = null;
      let localDetails = null;
      const localData = localStorage.getItem("User");

      if (localData) {
        const Data = JSON.parse(localData);
        // //console.log;
        localDetails = Data;
        Authtoken = Data.token;
      }

      // Early return if no token - don't make API call
      if (!Authtoken) {
        console.log("No auth token found, skipping profile API call");
        return null;
      }

      // //console.log;

      let ApiPath = Apis.getProfileData;
      console.log(`Calling get Profile api with token (attempt ${attempt}/${maxRetries})`, Authtoken)

      // if (selectedAgency) {
      //   ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      // }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: "Bearer " + Authtoken,
          "Content-Type": "application/json",
        },
      });
      console.log('Get profile response is', response)

      if (response) {
        // //console.log;
        if (response?.data?.status === true) {
          localDetails.user = response.data.data;
          console.log("🔄 [GET-PROFILE] Profile updated:", {
            userId: response.data.data?.id,
            planType: response.data.data?.plan?.type,
            planPrice: response.data.data?.plan?.price,
            maxAgents: response.data.data?.planCapabilities?.maxAgents,
            currentAgents: response.data.data?.currentUsage?.maxAgents
          });
          if (!selectedAgency) {
            localStorage.setItem("User", JSON.stringify(localDetails));
          }
          return response;
        }
      }
      return response;
    } catch (error) {
      console.error(`Error occurred in get profile api (attempt ${attempt}/${maxRetries}):`, error);

      // If this is the last attempt, return null
      if (attempt === maxRetries) {
        console.error("All retry attempts failed for get profile api");
        return null;
      }

      // Wait before retrying (except on the last attempt)
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
};

export default getProfileDetails;