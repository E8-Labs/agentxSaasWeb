import axios from 'axios'

import Apis from './Apis'
import { applyBrandingFromResponse } from '@/utilities/applyBranding'

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
        console.log('No auth token found, skipping profile API call')
        return null
      }

      // //console.log;

      let ApiPath = Apis.getProfileData
      console.log(
        `Calling get Profile api with token (attempt ${attempt}/${maxRetries})`,
        Authtoken,
      )

      // if (selectedAgency) {
      //   ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      // }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: 'Bearer ' + Authtoken,
          'Content-Type': 'application/json',
        },
      })
      console.log('Get profile response is', response)

      if (response) {
        // //console.log;
        if (response?.data?.status === true) {
          localDetails.user = response.data.data
          console.log('🔄 [GET-PROFILE] Profile updated:', {
            userId: response.data.data?.id,
            planType: response.data.data?.plan?.type,
            planPrice: response.data.data?.plan?.price,
            maxAgents: response.data.data?.planCapabilities?.maxAgents,
            currentAgents: response.data.data?.currentUsage?.maxAgents,
          })
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
            
            console.log('🔍 [GET-PROFILE] Checking for branding:', {
              hasUserData: !!userData,
              hasUserDataAgencyBranding: !!userData?.agencyBranding,
              hasUserDataAgencyNested: !!userData?.agency?.agencyBranding,
              hasResponseDataAgencyBranding: !!response.data?.data?.agencyBranding,
              foundBranding: !!agencyBranding,
              brandingKeys: agencyBranding ? Object.keys(agencyBranding) : [],
            })
            
            if (agencyBranding && typeof agencyBranding === 'object' && Object.keys(agencyBranding).length > 0) {
              console.log('✅ [GET-PROFILE] Agency branding found in profile, updating localStorage...', agencyBranding)
              // Use applyBrandingFromResponse to update branding and dispatch event
              // Pass response.data which has structure: { status: true, data: { ...userData with agencyBranding } }
              const applied = applyBrandingFromResponse(response.data)
              if (!applied) {
                // If applyBrandingFromResponse didn't find it, try direct application
                console.log('⚠️ [GET-PROFILE] applyBrandingFromResponse returned false, trying direct application...')
                applyBrandingFromResponse({ data: { agencyBranding } })
              }
            } else {
              // If branding not in profile, check if user is subaccount/agency and fetch from API
              const userRole = userData?.userRole
              console.log('🔍 [GET-PROFILE] No branding in profile, userRole:', userRole)
              if (userRole === 'AgencySubAccount' || userRole === 'Agency') {
                console.log('🔄 [GET-PROFILE] User is subaccount/agency but no branding in profile, fetching from API...')
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
        console.log(
          `Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`,
        )
        await new Promise((resolve) => setTimeout(resolve, retryDelay))
      }
    }
  }
}

export default getProfileDetails
