import axios from "axios";
import Apis from "./Apis";

const getProfileDetails = async () => {
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

    // //console.log;

    const ApiPath = Apis.getProfileData;

    const response = await axios.get(ApiPath, {
      headers: {
        Authorization: "Bearer " + Authtoken,
        "Content-Type": "application/json",
      },
    });

    if (response) {
      // //console.log;
      if (response?.data?.status === true) {
        localDetails.user = response.data.data;
        //console.log;
        localStorage.setItem("User", JSON.stringify(localDetails));
        return response;
      }
    }
    return response;
  } catch (error) {
    // console.error("Error occured in get profile api is error", error);
    return null;
  }
};

export default getProfileDetails;
