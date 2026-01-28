import axios from 'axios'
import Apis from '@/components/apis/Apis'

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  try {
    const localData = localStorage.getItem('User')
    if (localData) {
      const Data = JSON.parse(localData)
      return Data.token
    }
    return null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Get tasks with optional filters
 * @param {Object} params - Query parameters (userId, leadId, threadId, callId, status, assignedTo, dueDateFilter, priority)
 * @returns {Promise<Object>} Response with tasks and counts
 */
export const getTasks = async (params = {}) => {
  try {
    const AuthToken = getAuthToken()
    if (!AuthToken) {
      throw new Error('Authentication token not found')
    }

    const queryParams = new URLSearchParams()
    if (params.userId) queryParams.append('userId', params.userId)
    if (params.leadId) queryParams.append('leadId', params.leadId)
    if (params.threadId) queryParams.append('threadId', params.threadId)
    if (params.callId) queryParams.append('callId', params.callId)
    if (params.status) queryParams.append('status', params.status)
    if (params.assignedTo != null && params.assignedTo !== '') queryParams.append('assignedTo', params.assignedTo)
    if (params.dueDateFilter) queryParams.append('dueDateFilter', params.dueDateFilter)
    if (params.priority) queryParams.append('priority', params.priority)
    if (params.type) queryParams.append('type', params.type)

    const url = `${Apis.getTasks}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${AuthToken}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

/**
 * Create a new task
 * @param {Object} taskData - Task data (title, description, status, priority, type, dueDate, dueTime, assignedTo, leadId, threadId, callId, userId)
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData, userId = null) => {
  try {
    if (userId) {
      taskData.userId = userId
    }

    const AuthToken = getAuthToken()
    if (!AuthToken) {
      throw new Error('Authentication token not found')
    }

    const response = await axios.post(Apis.createTask, taskData, {
      headers: {
        Authorization: `Bearer ${AuthToken}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

/**
 * Update an existing task
 * @param {number} taskId - Task ID
 * @param {Object} taskData - Task data to update
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (taskId, taskData,userId = null) => {
  try {
    if (userId) {
      taskData.userId = userId
    }

    const AuthToken = getAuthToken()
    if (!AuthToken) {
      throw new Error('Authentication token not found')
    }

    const response = await axios.put(`${Apis.updateTask}/${taskId}`, taskData, {
      headers: {
        Authorization: `Bearer ${AuthToken}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

/**
 * Delete a task
 * @param {number} taskId - Task ID
 * @returns {Promise<Object>} Success response
 */
export const deleteTask = async (taskId, userId = null) => {
  try {
    if (userId) {
      path = path + `?userId=${userId}`
    }

    const AuthToken = getAuthToken()
    if (!AuthToken) {
      throw new Error('Authentication token not found')
    }

    const response = await axios.delete(`${Apis.deleteTask}/${taskId}`, {
      headers: {
        Authorization: `Bearer ${AuthToken}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

/**
 * Get task statistics (counts by status)
 * @param {Object} params - Query parameters (userId, leadId, threadId, callId)
 * @returns {Promise<Object>} Task stats
 */
export const getTaskStats = async (params = {}) => {
  try {
    const AuthToken = getAuthToken()
    if (!AuthToken) {
      throw new Error('Authentication token not found')
    }

    const queryParams = new URLSearchParams()
    if (params.userId) queryParams.append('userId', params.userId)
    if (params.leadId) queryParams.append('leadId', params.leadId)
    if (params.threadId) queryParams.append('threadId', params.threadId)
    if (params.callId) queryParams.append('callId', params.callId)

    const url = `${Apis.getTaskStats}${queryParams.toString() ? '?' + queryParams.toString() : ''}`

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${AuthToken}`,
        'Content-Type': 'application/json',
      },
    })

    return response.data
  } catch (error) {
    console.error('Error fetching task stats:', error)
    throw error
  }
}
