import axios from "axios";
import Apis from "./Apis";

const getProfileDetails = async () => {
    try {
        let Authtoken = null
        let localDetails = null
        const localData = localStorage.getItem("User");

        if (localData) {
            const Data = JSON.parse(localData);
            console.log("User localdetails are", Data);
            localDetails = Data;
            Authtoken = Data.token;
        }

        console.log("Auth otk is", Authtoken);

        const ApiPath = Apis.getProfileData;

        const response = await axios.get(ApiPath, {
            headers: {
                "Authorization": "Bearer " + Authtoken,
                "Content-Type": "application/json"
            }
        });

        if (response) {
            console.log("Response of get profile api is", response.data);
            if(response?.data?.status === true){
                localDetails.user = response.data.data;
                console.log("Data to updated", localDetails);
                localStorage.setItem("User", JSON.stringify(localDetails));
                return response;
            }
        }

    } catch (error) {
        console.error("Error occured in get profile api is error", error);
    }
}


export default getProfileDetails;
