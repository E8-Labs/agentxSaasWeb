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

// Convert batch status to readable format
export function getReadableStatus(status) {
  switch (status) {
    case BatchStatus.Active:
      return "Active";
    case BatchStatus.Paused:
      return "Paused";
    case BatchStatus.PausedForNonPayment:
      return "Paused (Non Payment)";
    case BatchStatus.PausedForUpdateCadence:
      return "Paused (Cadence Updated)";
    case BatchStatus.PausedForNoPhoneNumber:
      return "Paused (No Phone)";
    case BatchStatus.Completed:
      return "Completed";
    case BatchStatus.Scheduled:
      return "Scheduled";
    default:
      return status || "Unknown";
  }
}
