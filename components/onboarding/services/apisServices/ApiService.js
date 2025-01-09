import Apis from "@/components/apis/Apis";
import CircularLoader from "@/utilities/CircularLoader";
import axios from "axios";


//api call to assign lead to teamm members
export const AssignTeamMember = async (leadId, teamMemberUserId) => {
    try {
        console.log("I am trigered")
        let AuthToken = null;
        const localData = localStorage.getItem("User");
        console.log("Check 2 clear")
        if (localData) {
            const Data = JSON.parse(localData);
            // console.log("Local details are", Data);
            AuthToken = Data.token;
            // return Data.token
        }
        console.log("Check 3 clear")
        const ApiData = {
            // leadId: selectedLeadsDetails.id,
            // teamMemberUserId: item?.id
            leadId: leadId,
            teamMemberUserId: teamMemberUserId
        }
        console.log("Check 4 clear", ApiData);

        const ApiPath = Apis.AssignLeadToTeam
        console.log("Apipath is", ApiPath)
        // return
        const response = await axios.post(ApiPath, ApiData, {
            headers: {
                "Authorization": "Bearer " + AuthToken,
                "Content-Type": "application/json"
            }
        });

        if (response) {
            return response
        }

    } catch (error) {
        console.error("Error occured in assign lead to teammeber api is", error);
    } finally {
        console.log("Assign lead to teammeber api done");
    }
}

//api call to check the phone number availability
export const checkPhoneNumber = async (value) => {
    try {
        const ApiPath = Apis.CheckPhone;

        const ApiData = {
            phone: value,
        };

        console.log("Api data is :", ApiData);

        const response = await axios.post(ApiPath, ApiData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response) {
            return response
        }
    } catch (error) {
        console.error("Error occured in check phone api is :", error);
    } finally {
    }
};
