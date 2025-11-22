import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'

export const SmartRefillApi = async (selectedUser) => {
  try {
    const token = AuthToken()
    // console.log(token);
    const ApiPath = Apis.updateProfileApi
    let ApiData = {
      smartRefill: true,
    }
    if (selectedUser) {
      ApiData = {
        smartRefill: true,
        userId: selectedUser.id,
      }
    }
    console.log('Api data is', ApiData)
    const response = await axios.post(ApiPath, ApiData, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status === true) {
        const Data = localStorage.getItem('User')
        if (Data) {
          let D = JSON.parse(Data)
          D.user.smartRefill = response.data.data.smartRefill
          localStorage.setItem('User', JSON.stringify(D))
          console.log('Updated local data', D)
        }
      }
      return response
    }
  } catch (error) {
    console.error('Error occured in api is', error)
  }
}

//code to remove smart refill
export const RemoveSmartRefillApi = async (selectedUser) => {
  try {
    const token = AuthToken()
    // console.log(token);
    const ApiPath = Apis.updateProfileApi
    let ApiData = {
      smartRefill: false,
    }
    if (selectedUser) {
      ApiData = {
        smartRefill: false,
        userId: selectedUser.id,
      }
    }
    console.log('Api data is', ApiData)
    const response = await axios.post(ApiPath, ApiData, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status === true) {
        const Data = localStorage.getItem('User')
        if (Data) {
          let D = JSON.parse(Data)
          D.user.smartRefill = response.data.data.smartRefill
          localStorage.setItem('User', JSON.stringify(D))
          console.log('Updated local data', D)
        }
      }
      return response
    }
  } catch (error) {
    console.error('Error occured in api is', error)
  }
}
