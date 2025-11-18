import Apis from "./Apis";
import apiClient from "@/utilities/ApiClient";
import secureStorageService from "@/utilities/SecureStorageService";

const getProfileDetails = async (selectedAgency) => {
  const maxRetries = 10;
  const retryDelay = 1000; // 1 second in milliseconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      let localDetails = null;
      
      // Get user data from secure storage or localStorage
      const userData = await secureStorageService.getUser();
      if (userData) {
        localDetails = userData;
      }

      let ApiPath = Apis.getProfileData;
      console.log(`Calling get Profile api (attempt ${attempt}/${maxRetries})`);

      // if (selectedAgency) {
      //   ApiPath = ApiPath + `?userId=${selectedAgency.id}`
      // }

      // Use ApiClient which handles authentication automatically
      const response = await apiClient.get(ApiPath);
      console.log('Get profile response is', response);

      if (response && response.data) {
        if (response.data?.status === true) {
          // Update local details with new user data
          if (localDetails) {
            localDetails.user = response.data.data;
          } else {
            localDetails = {
              token: userData?.token || null,
              user: response.data.data,
            };
          }

          console.log("🔄 [GET-PROFILE] Profile updated:", {
            userId: response.data.data?.id,
            planType: response.data.data?.plan?.type,
            planPrice: response.data.data?.plan?.price,
            maxAgents: response.data.data?.planCapabilities?.maxAgents,
            currentAgents: response.data.data?.currentUsage?.maxAgents
          });

          // Update storage (both secure storage and localStorage for backward compatibility)
          if (!selectedAgency) {
            await secureStorageService.syncUser(localDetails);
          }

          // Return response in axios-like format for backward compatibility
          return {
            data: response.data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
          };
        }
      }
      
      // Return response in axios-like format
      return {
        data: response?.data,
        status: response?.status,
        statusText: response?.statusText,
        headers: response?.headers,
      };
    } catch (error) {
      console.error(`Error occurred in get profile api (attempt ${attempt}/${maxRetries}):`, error);

      // If this is the last attempt, return null
      if (attempt === maxRetries) {
        console.error("All retry attempts failed for get profile api");
        return null;
      }

      // Wait before retrying (except on the last attempt)
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
};

export default getProfileDetails;