import { Constants } from "@/constants/Constants";

export function GetCampaigneeNameIfAvailable(window) {
  if (typeof window != "undefined") {
    let name = localStorage.getItem(Constants.LocalStorageCampaignee);
    return name;
  }
  return null;
}
