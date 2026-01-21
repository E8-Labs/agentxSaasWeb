import axios from 'axios'

import { PersistanceKeys } from '@/constants/Constants'

import Apis from '../apis/Apis'

export const getAvailabePhoneNumbers = async () => {
  try {
    let AuthToken = null

    // const agentDetails = localStorage.getItem("agentDetails");
    const LocalData = localStorage.getItem('User')
    if (LocalData) {
      const UserDetails = JSON.parse(LocalData)
      AuthToken = UserDetails.token
    }
    // //console.log;
    let ApiPath = null

    ApiPath = `${Apis.userAvailablePhoneNumber}`

    // return
    const response = await axios.get(ApiPath, {
      headers: {
        Authorization: 'Bearer ' + AuthToken,
      },
    })

    if (response) {
      return response.data.data
    }
  } catch (error) {
    // console.error("Error occured in: ", error);
  } finally {
    // //console.log;
  }
}
