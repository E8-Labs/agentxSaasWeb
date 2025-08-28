import axios from "axios";
import Apis from "../apis/Apis";

const AdminGetProfileDetails = async (id) => {
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

    //console.log;

    let ApiPath = Apis.getProfileFromId;
    ApiPath = ApiPath + "?id=" +id

    //console.log

    const response = await axios.get(ApiPath, {
      headers: {
        Authorization: "Bearer " + Authtoken,
      },
    });

    if (response) {
      if (response?.data?.status === true) {
        localDetails.user = response.data.data;
        console.log("Response of get admin profile api is", response.data);
        const DataT = response.data.data;
        localStorage.setItem("AdminProfileData", JSON.stringify(DataT));
        // //console.log;
        localStorage.setItem("User", JSON.stringify(localDetails));
        return response.data.data
      }else{
        //console.log;
      }
    }
    // return response;
  } catch (error) {
    console.error("Error occured in get profile api is error", error);
    return null;
  }
};

export default AdminGetProfileDetails;
