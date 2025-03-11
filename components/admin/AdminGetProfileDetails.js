import axios from "axios";
import Apis from "../apis/Apis";

const AdminGetProfileDetails = async (id) => {
  try {
    let Authtoken = null;
    let localDetails = null;
    const localData = localStorage.getItem("User");

    if (localData) {
      const Data = JSON.parse(localData);
      // console.log("User localdetails are", selectedUser);
      localDetails = Data;
      Authtoken = Data.token;
    }

    console.log("Auth otk is");

    let ApiPath = Apis.getProfileFromId;
    ApiPath = ApiPath + "?id=" +id

    console.log('apiPath', ApiPath)

    const response = await axios.get(ApiPath, {
      headers: {
        Authorization: "Bearer " + Authtoken,
      },
    });

    if (response) {
      if (response?.data?.status === true) {
        localDetails.user = response.data.data;
        console.log("Response of get profile api is", response);

        // console.log("Data to updated", localDetails);
        // localStorage.setItem("User", JSON.stringify(localDetails));
        return response.data.data
      }else{
        console.log("message of get profile api is", response.data.message);
      }
    }
    // return response;
  } catch (error) {
    console.error("Error occured in get profile api is error", error);
    return null;
  }
};

export default AdminGetProfileDetails;
