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
    console.log("Response", user.campaignee.officeHoursUrl);
    let campaigneeLink = user.campaignee.officeHoursUrl;
    return campaigneeLink;
  } else {
    return PersistanceKeys.GlobalSupportUrl;
    window.open(
      "https://api.leadconnectorhq.com/widget/booking/SMTp2AfgjdTcjLOIUBkR",
      "_blank"
    );
  }
};
