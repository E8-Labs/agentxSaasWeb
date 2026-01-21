//code to get the monthly plans
import axios from 'axios'

import Apis from '@/components/apis/Apis'

import { AuthToken } from '../plan/AuthDetails'

export const getMonthlyPlan = async (agencyId) => {
  try {
    let localPlans = null
    if (!agencyId) {
      localPlans = localStorage.getItem('agencyMonthlyPlans')
    }
    if (localPlans) {
      const P = JSON.parse(localPlans)
      return Array.isArray(P) ? P : []
    } else {
      const Token = AuthToken()
      let ApiPath = Apis.getMonthlyPlan
      if (agencyId) {
        ApiPath = ApiPath + `?userId=${agencyId.id}`
      }
      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response && response.data && response.data.data) {
        localStorage.setItem(
          'agencyMonthlyPlans',
          JSON.stringify(response.data.data),
        )
        return Array.isArray(response.data.data) ? response.data.data : []
      }
      return []
    }
  } catch (error) {
    // setInitialLoader(false);
    console.error('Error occured in getting monthly plan', error)
    return []
  } finally {}
}

//code to get the XBar Options
export const getXBarOptions = async (agencyId) => {
  // console.log('trying to get x bar plans')
  try {
    // setInitialLoader(true);
    let localXbarPlans = null
    if (!agencyId) {
      localXbarPlans = localStorage.getItem('XBarOptions')
    }
    if (
      false //localXbarPlans
    ) {
      const d = JSON.parse(localXbarPlans)
      return Array.isArray(d) ? d : []
    } else {
      const Token = AuthToken()
      let ApiPath = Apis.getXBarOptions
      if (agencyId) {
        ApiPath = ApiPath + `?userId=${agencyId.id}`
      }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Token,
          'Content-Type': 'application/json',
        },
      })
      if (response && response.data && response.data.data) {
        localStorage.setItem('XBarOptions', JSON.stringify(response.data.data))
        return Array.isArray(response.data.data) ? response.data.data : []
      }
      return []
    }
  } catch (error) {
    // setInitialLoader(false);
    console.error('Error occured in getting XBar Option is', error)
    return []
  } finally {}
}
