import axios from 'axios'

import Apis from '../apis/Apis'

export const getUniqueTags = async (userId) => {
  try {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }

    let ApiPath = Apis.getTagsList
    if (userId) {
      ApiPath = ApiPath + '?userId=' + userId
    }

    const response = await axios.get(ApiPath, {
      headers: {
        Authorization: 'Bearer ' + AuthToken,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status === true) {
        return response.data.data
      } else return null
    }
  } catch (error) {
    console.error('Error fetching unique tags:', error)
    return null
  }
}

export const getUniqueTagsList = async (userId) => {
  try {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }

    let ApiPath = Apis.getUniqueTags
    // if (userId) {
    //   ApiPath = ApiPath + '?userId=' + userId
    // }

    const response = await axios.get(ApiPath, {
      headers: {
        Authorization: 'Bearer ' + AuthToken,
        'Content-Type': 'application/json',
      },
    })

    if (response) {
      if (response.data.status === true) {
        return response.data.data
      } else return null
    }
  } catch (error) {
    console.error('Error fetching unique tags:', error)
    return null
  }
}
