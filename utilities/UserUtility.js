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
  return PersistanceKeys.SupportWebinarUrl;
};

export function logout(reason = "Unknown reason") {
  // Log the logout event with timestamp and reason
  const timestamp = new Date().toISOString();
  console.log(`🚪 USER LOGOUT TRIGGERED - Time: ${timestamp}, Reason: ${reason}`);
  
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
    window.location.href = "/";
  }
}



function getCallStatusWithSchedule(item) {
  const currentTime = moment();
  const startTime = moment(item.startTime);

  // Check if the call is scheduled in the future
  if (item.startTime && startTime.isAfter(currentTime)) {
    // Format the date as "Scheduled - Sep 05" or similar
    const formattedDate = startTime.format('MMM DD');
    return `Scheduled - ${formattedDate}`;
  }

  // Return the regular readable status for past or current calls
  return getReadableStatus(item.status);
}
