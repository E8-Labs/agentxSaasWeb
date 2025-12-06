import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'

export const getBusinessProfile = async () => {
  try {
    const token = AuthToken()
    const ApiPath = Apis.getBusinessProfile
    const response = await axios.get(ApiPath, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      console.log('Response og get business profile is', response.data)
      return response.data
    }
  } catch (error) {
    console.log('Error occured in getBusinessProfile api is', error)
  }
}
