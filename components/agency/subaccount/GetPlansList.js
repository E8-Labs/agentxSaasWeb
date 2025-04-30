
//code to get the monthly plans

import Apis from "@/components/apis/Apis";
import axios from "axios";
import { AuthToken } from "../plan/AuthDetails";

export const getMonthlyPlan = async () => {
    try {
        const localPlans = localStorage.getItem("agencyMonthlyPlans");
        if (localPlans) {
            const P = JSON.parse(localPlans);
            return P;
        } else {
            const Token = AuthToken();
            const ApiPath = Apis.getMonthlyPlan
            const response = await axios.get(ApiPath,
                {
                    headers: {
                        "Authorization": "Bearer " + Token,
                        "Content-Type": "application/json",
                    }
                }
            );
            if (response) {
                console.log("Response of get monthly plan api is", response.data);
                localStorage.setItem("agencyMonthlyPlans", JSON.stringify(response.data.data));
                return response.data.data;
            }
        }
    } catch (error) {
        // setInitialLoader(false);
        console.error("Error occured in getting monthly plan", error);
    } finally {
        console.log("data recieved");
        // setInitialLoader(false);
    }
}

//code to get the XBar Options
export const getXBarOptions = async () => {
    // console.log('trying to get x bar plans')
    try {
        // setInitialLoader(true);
        const localXbarPlans = localStorage.getItem("XBarOptions");
        if ( 
            localXbarPlans
        ) {
            const d = JSON.parse(localXbarPlans);
            console.log(d);
            return d;
        } else {
            const Token = AuthToken();
            const ApiPath = Apis.getXBarOptions
            // console.log('ApiPath', ApiPath)

            const response = await axios.get(ApiPath,
                {
                    headers: {
                        "Authorization": "Bearer " + Token,
                        "Content-Type": "application/json",
                    }
                }
            );
            if (response) {
                console.log("Response of XBar Option api is", response.data);
                localStorage.setItem("XBarOptions", JSON.stringify(response.data.data));
                return response.data.data;
            }
        }
    } catch (error) {
        // setInitialLoader(false);
        console.error("Error occured in getting XBar Option is", error);
    } finally {
        // setInitialLoader(false);
        console.log("data recieved");
    }
}
