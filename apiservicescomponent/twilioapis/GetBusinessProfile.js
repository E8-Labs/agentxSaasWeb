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
      return response.data
    }
  } catch (error) {}
}
