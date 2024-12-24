import Apis from "@/components/apis/Apis";
import axios from "axios";

const SendVerificationCode = async (phone, login = true, verifyApiResponse) => {
    console.log("Sending code to ", phone)
    try {

        const ApiData = {
            login: login,
            phone: phone
        }

        // console.log("sendd ver")

        const ApiPath = Apis.sendVerificationCode;
        let result = await axios.post(ApiPath, ApiData, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        let response = result.data;
        console.log("Response of send ver code is ", response)
        verifyApiResponse = response;
        return response



    } catch (error) {
        console.error("Error occured in send code is", error);
        return { status: false, message: error.message, error: error, data: null }
    }
}

export default SendVerificationCode;