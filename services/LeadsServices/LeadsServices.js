import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'

export const calculateCreditCost = async (data) => {
  try {
    const response = await axios.post(Apis.calculateCreditCost, data, {
      headers: {
        Authorization: 'Bearer ' + AuthToken(),
      },
    })
    if (response.data.status) {
      return response.data.calculation
    } else {
      return response.data.message
    }
  } catch (error) {
    return error.response.data.message
  }
}
