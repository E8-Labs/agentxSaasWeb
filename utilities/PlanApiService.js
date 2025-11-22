// Plan API Service for Admin Plan Management
import { AuthHelper } from './AuthHelper'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002'

export class PlanApiService {
  // Set auth token
  static setAuthToken(token) {
    AuthHelper.setToken(token)
  }

  // Clear auth token
  static clearAuthToken() {
    AuthHelper.clearToken()
  }

  // Agency Plans API
  static async getAgencyPlans() {
    try {
      const response = await fetch(
        `${BASE_URL}/api/agency/getPlanListForAgency`,
        {
          method: 'GET',
          headers: AuthHelper.getAuthHeaders(),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching agency plans:', error)
      throw error
    }
  }

  static async createAgencyPlan(planData) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/agency-plans`, {
        method: 'POST',
        headers: AuthHelper.getAuthHeaders(),
        body: JSON.stringify(planData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating agency plan:', error)
      throw error
    }
  }

  static async updateAgencyPlan(planId, planData) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/agency-plans/${planId}`,
        {
          method: 'PUT',
          headers: AuthHelper.getAuthHeaders(),
          body: JSON.stringify(planData),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating agency plan:', error)
      throw error
    }
  }

  static async deleteAgencyPlan(planId) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/agency-plans/${planId}`,
        {
          method: 'DELETE',
          headers: AuthHelper.getAuthHeaders(),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting agency plan:', error)
      throw error
    }
  }

  // AgentX Plans API
  static async getAgentXPlans() {
    try {
      const response = await fetch(`${BASE_URL}/api/plans`, {
        method: 'GET',
        headers: AuthHelper.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching AgentX plans:', error)
      throw error
    }
  }

  static async createAgentXPlan(planData) {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/agentx-plans`, {
        method: 'POST',
        headers: AuthHelper.getAuthHeaders(),
        body: JSON.stringify(planData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating AgentX plan:', error)
      throw error
    }
  }

  static async updateAgentXPlan(planId, planData) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/agentx-plans/${planId}`,
        {
          method: 'PUT',
          headers: AuthHelper.getAuthHeaders(),
          body: JSON.stringify(planData),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating AgentX plan:', error)
      throw error
    }
  }

  static async deleteAgentXPlan(planId) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/agentx-plans/${planId}`,
        {
          method: 'DELETE',
          headers: AuthHelper.getAuthHeaders(),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting AgentX plan:', error)
      throw error
    }
  }

  // Generic plan operations
  static async getPlan(planType, planId) {
    const endpoint = planType === 'agency' ? 'agency-plans' : 'agentx-plans'
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/${endpoint}/${planId}`,
        {
          method: 'GET',
          headers: AuthHelper.getAuthHeaders(),
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${planType} plan:`, error)
      throw error
    }
  }
}

export default PlanApiService
