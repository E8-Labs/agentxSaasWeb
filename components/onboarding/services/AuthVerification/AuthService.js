import axios from 'axios'

import Apis from '@/components/apis/Apis'

const SendVerificationCode = async (phone, login = true, verifyApiResponse) => {
  // //console.log
  try {
    const ApiData = {
      login: login,
      phone: phone,
    }

    // Use same-origin API route to avoid CORS when calling from browser
    const ApiPath =
      typeof window !== 'undefined'
        ? '/api/auth/send-verification-code'
        : Apis.sendVerificationCode
    let result = await axios.post(ApiPath, ApiData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    let response = result.data
    // //console.log
    verifyApiResponse = response
    return response
  } catch (error) {
    // console.error("Error occured in send code is", error);
    return { status: false, message: error.message, error: error, data: null }
  }
}

export default SendVerificationCode
