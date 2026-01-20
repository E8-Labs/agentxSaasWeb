import axios from 'axios'

import { AuthToken } from '@/components/agency/plan/AuthDetails'
import Apis from '@/components/apis/Apis'

export const getMcpTools = async (agentId, selectedUser) => {
  try {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }
    let ApiPath = `${Apis.getMcpTools}?agentId=${agentId}`
    if (selectedUser) {
      ApiPath = `${Apis.getMcpTools}?agentId=${agentId}&userId=${selectedUser.id}`
    }

    const response = await axios.get(ApiPath, {
      headers: {
        Authorization: 'Bearer ' + AuthToken,
      },
    })
    if (response) {
      if (response.data.status === true) {
        return response.data.data
      } else {
        return null
      }
    }
  } catch (error) {
    return null
  }
}

export const addMcpTool = async (data) => {
  try {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }

    const response = await axios.post(Apis.addMcpTool, data, {
      headers: {
        Authorization: 'Bearer ' + AuthToken,
      },
    })
    if (response) {
      let returnData = {}
      if (response.data.status === true) {
        returnData = {
          status: true,
          message: response.data.message,
          data: response.data.data,
        }
      } else {
        returnData = {
          status: false,
          message: response.data.message,
          data: response.data.data,
        }
      }
      return returnData
    }
  } catch (error) {
    return {
      status: false,
      message: error.response.data.message,
      data: null,
    }
  }
}

export const editMcpTool = async (data) => {
  try {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }

    let path = `${Apis.editMcpTool}/${data.id}`

    const response = await axios.put(path, data, {
      headers: {
        Authorization: 'Bearer ' + AuthToken,
      },
    })
    if (response) {
      let returnData = {}
      if (response.data.status === true) {
        returnData = {
          status: true,
          message: response.data.message,
          data: response.data.data,
        }
      } else {
        returnData = {
          status: false,
          message: response.data.message,
          data: response.data.data,
        }
      }
      return returnData
    }
  } catch (error) {
    return {
      status: false,
      message: 'Error in editMcpTool',
      data: null,
    }
  }
}

export const deleteMcpTool = async (data) => {
  try {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }
    let path = `${Apis.deleteMcpTool}/${data.id}`
    let body = {}

    if (data?.userId) {
      body.userId = data.userId
    }

    // const response = await axios.delete(path, body, {
    //     headers: {
    //         Authorization: "Bearer " + AuthToken,
    //     },
    // });
    const response = await axios.delete(path, {
      data: body,
      headers: {
        Authorization: 'Bearer ' + AuthToken,
      },
    })

    if (response) {
      let returnData = {}
      if (response.data.status === true) {
        returnData = {
          status: true,
          message: response.data.message,
          data: response.data.data,
        }
      } else {
        returnData = {
          status: false,
          message: response.data.message,
          data: response.data.data,
        }
      }
      return returnData
    }
  } catch (error) {
    return {
      status: false,
      message: 'Error in deleteMcpTool',
      data: null,
    }
  }
}

export const selectMcpTool = async (data) => {
  try {
    const localData = localStorage.getItem('User')
    let AuthToken = null
    if (localData) {
      const UserDetails = JSON.parse(localData)
      AuthToken = UserDetails.token
    }

    const response = await axios.post(Apis.selectMcpTool, data, {
      headers: {
        Authorization: 'Bearer ' + AuthToken,
      },
    })

    if (response) {
      let returnData = {}
      if (response.data.status === true) {
        returnData = {
          status: true,
          message: response.data.message,
          data: response.data.data,
        }
      } else {
        returnData = {
          status: false,
          message: response.data.message,
          data: response.data.data,
        }
      }
      return returnData
    }
    return {
      status: false,
      message: 'Error in selectMcpTool',
      data: null,
    }
  } catch (error) {
    return {
      status: false,
      message: 'Error in selectMcpTool',
      data: null,
    }
  }
}

export const attachMcpTool = async (data) => {
  try {
    const token = AuthToken()
    const ApiPath = Apis.attachMcpTool
    const response = await axios.post(ApiPath, data, {
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

export const removeMcpTool = async (data) => {
  try {
    const token = AuthToken()
    // const ApiPath = Apis.removeMcpToolFromAgent;
    const ApiPath = Apis.removeMcpTool
    if (!ApiPath) {
      console.error('🚨 API path for removeMcpToolFromAgent is undefined!')
      return
    }
    const response = await axios.post(ApiPath, data, {
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
