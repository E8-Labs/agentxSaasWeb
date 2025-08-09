import { BatchStatus } from "@/components/constants/constants";
import { PersistanceKeys } from "@/constants/Constants";

export function GetCampaigneeNameIfAvailable(window) {
  if (typeof window !== "undefined") {
    let name = localStorage.getItem(PersistanceKeys.LocalStorageCampaignee);
    return name;
  }
  return null;
}

export const getSupportUrlFor = (user) => {
  return PersistanceKeys.GlobalSupportUrl;
};

export function logout() {
  // localStorage.removeItem("User");
  // localStorage.removeItem("localAgentDetails");
  if (typeof document !== "undefined") {
    let userLocation = localStorage.getItem(
      PersistanceKeys.LocalStorageUserLocation
    );
    //console.log;
    localStorage.clear();
    //console.log;

    localStorage.setItem(
      PersistanceKeys.LocalStorageUserLocation,
      userLocation
    );
    document.cookie = "User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}


export  function getReadableStatus(status) {
  console.log("status",status)
  if (status === BatchStatus.PausedForNonPayment) {
    return "Paused - No Payment";
  }
  if (status === BatchStatus.PausedForUpdateCadence) {
    return "Paused - Update Cadence";
  }

  if (status === BatchStatus.PausedForNoPhoneNumber) {
    return "Paused - No Phone";
  }


  return status;
}
