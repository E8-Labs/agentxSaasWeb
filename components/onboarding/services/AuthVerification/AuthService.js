import Apis from "@/components/apis/Apis";
import axios from "axios";

const SendVerificationCode = async (phone, login = true, verifyApiResponse) => {
   // //console.log
    try {

        const ApiData = {
            login: login,
            phone: phone
        }

        //// //console.log

        const ApiPath = Apis.sendVerificationCode;
        let result = await axios.post(ApiPath, ApiData, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        let response = result.data;
       // //console.log
        verifyApiResponse = response;
        return response



    } catch (error) {
       // console.error("Error occured in send code is", error);
        return { status: false, message: error.message, error: error, data: null }
    }
}

export default SendVerificationCode;