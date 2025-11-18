import React from "react";
import Apis from "./Apis";
import { PersistanceKeys } from "@/constants/Constants";
import apiClient from "@/utilities/ApiClient";
import secureStorageService from "@/utilities/SecureStorageService";

export const UpdateProfile = async (apidata) => {
  // Get saved location from localStorage (non-sensitive data)
  let SavedLocation = localStorage.getItem(
    PersistanceKeys.LocalStorageCompleteLocation
  );
  if (SavedLocation) {
    let parsedLocation = JSON.parse(SavedLocation);
    apidata.lat = parsedLocation.latitude;
    apidata.lang = parsedLocation.longitude;
  }

  try {
    // Get user data from secure storage
    const userData = await secureStorageService.getUser();
    if (userData) {
      let path = Apis.updateProfileApi;
      
      // Use ApiClient which handles authentication automatically
      const response = await apiClient.post(path, apidata);

      if (response && response.data) {
        console.log(response.data);
        if (response.data.status === true) {
          // Update user data
          const updatedUserData = {
            ...userData,
            user: response.data.data,
          };

          // Update storage (both secure storage and localStorage for backward compatibility)
          await secureStorageService.syncUser(updatedUserData);
          
          // Dispatch event for components listening to profile updates
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("UpdateProfile", { detail: { update: true } })
            );
          }
          return response.data.data;
        }
      }
    }
  } catch (e) {
    console.log("error in update profile api", e);
    throw e;
  }
};
