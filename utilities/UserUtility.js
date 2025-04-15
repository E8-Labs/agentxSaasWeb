import { PersistanceKeys } from "@/constants/Constants";

export function GetCampaigneeNameIfAvailable(window) {
  if (typeof window !== "undefined") {
    let name = localStorage.getItem(PersistanceKeys.LocalStorageCampaignee);
    return name;
  }
  return null;
}

export const getSupportUrlFor = (user) => {
  if (user?.campaignee && user?.campaignee?.officeHoursUrl) {
    // //console.log;
    let campaigneeLink = user.campaignee.officeHoursUrl;
    return campaigneeLink;
  } else {
    return PersistanceKeys.GlobalSupportUrl;
    window.open(
      "https://api.leadconnectorhq.com/widget/bookings/yk4um7vhmtrv4uaxmqpr",
      "_blank"
    );
  }
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
