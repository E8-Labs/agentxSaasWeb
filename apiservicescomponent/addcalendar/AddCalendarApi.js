import { AuthToken } from "@/components/agency/plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import axios from "axios";

export const AddCalendarApi = async (calendarValues
) => {
    console.log("Add calendar values passed are", calendarValues);

    try {
        // setAddCalenderLoader(true);

        let userAuthToken = AuthToken();

        // //console.log;
        const ApiPath = Apis.addCalender;
        // //console.log;

        const formData = new FormData();

        if (calendarValues?.isFromAddGoogleCal) {
            formData.append("title", calendarValues?.calenderTitle);
            formData.append("calendarType", "google");
            // formData.append("mainAgentId", "");
            formData.append("accessToken", calendarValues?.accessToken);
            formData.append("refreshToken", calendarValues?.refreshToken);
            formData.append("scope", "openid email profile https://www.googleapis.com/auth/calendar");
            formData.append("expiryDate", calendarValues?.expiryDate);
            // formData.append("googleUserId", calendarValues?.id); // here google id was undefined
            formData.append("googleUserId", calendarValues?.googleUserId);
            formData.append("email", calendarValues?.email);
        } else {
            formData.append("title", calendarValues?.calenderTitle);
            formData.append("timeZone", calendarValues?.selectTimeZone);
            formData.append("apiKey", calendarValues?.calenderApiKey);
            formData.append("eventId", calendarValues?.eventId);
            formData.append("calendarType", "cal_dot_com");
        }

        for (let [key, value] of formData.entries()) {
            console.log(`${key} = ${value}`);
        }
        console.log("Key updated");

        // return
        const response = await axios.post(ApiPath, formData, {
            headers: {
                Authorization: "Bearer " + userAuthToken,
            },
        });
        //console.log;
        if (response) {
            // //console.log;

            if (response.data.status === true) {
                const localData = localStorage.getItem("User");
                if (localData) {
                    let D = JSON.parse(localData);
                    D.user.checkList.checkList.calendarCreated = true;
                    localStorage.setItem("User", JSON.stringify(D));
                }
                window.dispatchEvent(
                    new CustomEvent("UpdateCheckList", { detail: { update: true } })
                );
            } 
            return response.data;
        }
    } catch (error) {
        console.error("Error occured in api is:", error);
    } finally {
        // setAddCalenderLoader(false);
    }
};