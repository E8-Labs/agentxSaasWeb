import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'

export const AddSelectedProduct = async (selectedProduct) => {
  try {
    const token = AuthToken()
    const ApiPath = Apis.addTrustProduct
    const ApiData = {
      trustProductId: selectedProduct,
    }
    const response = await axios.post(ApiPath, ApiData, {
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
