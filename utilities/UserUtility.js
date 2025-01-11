import { PersistanceKeys } from "@/constants/Constants";

export function GetCampaigneeNameIfAvailable(window) {
  if (typeof window != "undefined") {
    let name = localStorage.getItem(PersistanceKeys.LocalStorageCampaignee);
    return name;
  }
  return null;
}
