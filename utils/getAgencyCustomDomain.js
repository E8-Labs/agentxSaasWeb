/**
 * Get agency custom domain and agencyId for OAuth redirect
 * 
 * Uses Next.js API route to hide backend API calls
 * 
 * @returns {Promise<{agencyId: number|null, customDomain: string|null}>}
 */
export async function getAgencyCustomDomain() {
  try {
    // Get token from localStorage as fallback (in case cookie isn't available)
    let token = null
    if (typeof window !== 'undefined') {
      const localData = localStorage.getItem('User')
      if (localData) {
        try {
          const userData = JSON.parse(localData)
          token = userData.token
        } catch (error) {
          // Ignore parsing errors
        }
      }
    }

    // Build headers
    const headers = {
      'Content-Type': 'application/json',
    }

    // Add Authorization header if we have a token (fallback if cookie isn't available)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Call Next.js API route (which proxies to backend)
    // The route will try to get token from User cookie first, then fallback to Authorization header
    const response = await fetch('/api/agency/branding/custom-domain', {
      method: 'GET',
      headers,
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      console.error('Failed to get agency custom domain:', response.status)
      return { agencyId: null, customDomain: null }
    }

    const data = await response.json()
    if (data.status && data.data) {
      return {
        agencyId: data.data.agencyId || null,
        customDomain: data.data.customDomain || null,
      }
    }

    return { agencyId: null, customDomain: null }
  } catch (error) {
    console.error('Error getting agency custom domain:', error)
    return { agencyId: null, customDomain: null }
  }
}

