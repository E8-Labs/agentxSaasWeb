import axios from 'axios'

import Apis from './Apis'
import { applyBrandingFromResponse, updateBrandingCookieAndApply } from '@/utilities/applyBranding'

const getProfileDetails = async (selectedAgency) => {
  const maxRetries = 10
  const retryDelay = 1000 // 1 second in milliseconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let Authtoken = null
      let localDetails = null
      const localData = localStorage.getItem('User')

      if (localData) {
        const Data = JSON.parse(localData)
        // //console.log;
        localDetails = Data
        Authtoken = Data.token
      }

      // Early return if no token - don't make API call
      if (!Authtoken) {
        return null
      }

      // //console.log;

      let ApiPath = Apis.getProfileData

      // if (selectedAgency) {
      //   ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      // }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Authtoken,
          'Content-Type': 'application/json',
        },
      })

      if (response) {
        // //console.log;
        if (response?.data?.status === true) {
          localDetails.user = response.data.data
          if (!selectedAgency) {
            localStorage.setItem('User', JSON.stringify(localDetails))

            // Check if agencyBranding has changed and update localStorage
            // This ensures subaccounts get updated branding when agency changes colors
            const userData = response.data.data // This is the user object directly

            // Extract branding from user object (response.data.data is the user)
            // Check multiple possible locations
            let agencyBranding = 
              userData?.agencyBranding ||
              userData?.agency?.agencyBranding

            // Also check the response structure directly
            if (!agencyBranding) {
              agencyBranding = 
                response.data?.data?.agencyBranding ||
                response.data?.data?.agency?.agencyBranding ||
                response.data?.agencyBranding
            }

            if (agencyBranding && typeof agencyBranding === 'object' && Object.keys(agencyBranding).length > 0) {
              // Update cookies and apply branding immediately
              // This ensures subaccounts get updated branding when agency changes colors
              const applied = updateBrandingCookieAndApply(agencyBranding, true)
              if (applied) {} else {
                console.warn('⚠️ [GET-PROFILE] Failed to update branding cookie, trying applyBrandingFromResponse...')
                // Fallback to applyBrandingFromResponse
                applyBrandingFromResponse({ data: { agencyBranding } })
              }
            } else {
              // If branding not in profile, check if user is subaccount/agency and fetch from API
              const userRole = userData?.userRole
              if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
                // Import dynamically to avoid circular dependencies
                import('@/utilities/applyBranding').then(({ fetchAndApplyBranding }) => {
                  fetchAndApplyBranding()
                }).catch(err => {
                  console.error('Error fetching branding after profile update:', err)
                })
              }
            }
          }
          return response
        }
      }
      return response
    } catch (error) {
      console.error(
        `Error occurred in get profile api (attempt ${attempt}/${maxRetries}):`,
        error,
      )

      // If this is the last attempt, return null
      if (attempt === maxRetries) {
        console.error('All retry attempts failed for get profile api')
        return null
      }

      // Wait before retrying (except on the last attempt)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }
}

export default getProfileDetails
