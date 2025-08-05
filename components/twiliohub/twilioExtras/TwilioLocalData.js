import { PersistanceKeys } from "@/constants/Constants"

export const TwilioLocalData = async () => {
    const d = localStorage.getItem(PersistanceKeys.twilioHubData);
    if (d) {
        const Data = JSON.parse(d);
        if (Data) {
            return Data;
        }
        // else {
        //     return null;
        // }
    }
    return null;
}