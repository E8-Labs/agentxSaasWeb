import axios from "axios"
import Apis from "../apis/Apis"

export const getLeadDetails = async (selectedLead) => {
    try {
        // //console.log;
        let AuthToken = null

        const localDetails = localStorage.getItem('User')
        if (localDetails) {
            const Data = JSON.parse(localDetails)
            //// //console.log;
            AuthToken = Data.token
        }

        // //console.log;

        const ApiPath = `${Apis.getLeadDetails}?leadId=${selectedLead}`
        console.log("ApiPath is", ApiPath)

        const response = await axios.get(ApiPath, {
            headers: {
                Authorization: 'Bearer ' + AuthToken,
                'Content-Type': 'application/json',
            },
        })

        if (response) {
            console.log("lead details are api data ", response.data.data)
        }
    } catch (error) {
        // console.error("Error occured in api is", error);
    } finally {
        // setInitialLoader(false)
        // //console.log;
    }
}