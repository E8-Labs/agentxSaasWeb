import { AuthToken } from "@/components/agency/plan/AuthDetails"
import Apis from "@/components/apis/Apis"
import axios from "axios"

export const calculateCreditCost = async (data) => {
    console.log("calculateCreditCost data", data)
    try {

        const response = await axios.post(Apis.calculateCreditCost, data,{
            headers: {
                Authorization: "Bearer " + AuthToken(),
            }
        })
        if (response.data.status) {
            console.log("calculateCreditCost response", response.data)
            return response.data.calculation
        } else {
            console.log("calculateCreditCost response", response.data)
            return response.data.message
        }

    } catch (error) {
        console.log("error", error)
        return error.response.data.message
    }

}